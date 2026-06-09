import { type Consumer, type EachMessagePayload, Kafka } from "kafkajs";
import type { Logger } from "pino";
import { ReadModelMessageHandler } from "@presentation/event/handlers/ReadModelMessageHandler";
import { KafkaHealthMonitor } from "@infrastructure/messaging/KafkaHealthMonitor";
import { RetryFn } from "@presentation/event/RetryFn";

interface TopicConfig {
  userTopic: string;
  hookupTopic: string;
  zoneTopic: string;
}

export class KafkaReadModelConsumer {
  readonly #logger?: Logger;
  readonly #consumer: Consumer;
  readonly #topics: string[];
  readonly #retryFn: RetryFn;
  readonly #handler: ReadModelMessageHandler;
  readonly #healthMonitor: KafkaHealthMonitor;

  constructor(
    brokers: string[],
    clientId: string,
    groupId: string,
    topics: TopicConfig,
    handler: ReadModelMessageHandler,
    healthMonitor: KafkaHealthMonitor,
    reconFn: RetryFn,
    logger?: Logger,
  ) {
    this.#logger = logger?.child({ component: "KafkaReadModelConsumer" });
    this.#handler = handler;
    this.#topics = [topics.userTopic, topics.hookupTopic, topics.zoneTopic];
    this.#healthMonitor = healthMonitor;

    const kafka = new Kafka({
      clientId,
      brokers,
      retry: { retries: 0 },
    });

    this.#consumer = kafka.consumer({ groupId });

    this.#retryFn = reconFn;
  }

  async connect(): Promise<void> {
    await this.#consumer.connect();
    await Promise.all(
      this.#topics.map((topic) =>
        this.#consumer.subscribe({ topic, fromBeginning: false }),
      ),
    );
    this.#logger?.info(
      { topics: this.#topics },
      "Read model consumer subscribed",
    );
  }

  async start(): Promise<void> {
    this.#consumer.on("consumer.crash", () => {
      this.#healthMonitor.markUnhealthy();
      void this.#reconnect();
    });

    await this.#consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const raw = payload.message.value?.toString();
        if (!raw) {
          this.#logger?.debug(
            { topic: payload.topic, offset: payload.message.offset },
            "Empty Kafka message — skipping",
          );
          return;
        }
        await this.#handler.handle(raw);
      },
    });
  }

  async #reconnect(): Promise<void> {
    await this.#retryFn(
      "Kafka read model consumer",
      async () => {
        await this.connect();
        await this.start();
      },
      this.#logger,
    );
    this.#healthMonitor.markHealthy();
  }

  async disconnect(): Promise<void> {
    await this.#consumer.disconnect();
  }
}
