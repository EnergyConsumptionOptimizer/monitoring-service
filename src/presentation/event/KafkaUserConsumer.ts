import { type Consumer, type EachMessagePayload, Kafka } from "kafkajs";
import type { Logger } from "pino";
import { UserMessageHandler } from "@presentation/event/handlers/UserMessageHandler";
import { RetryFn } from "@presentation/event/RetryFn";
import { KafkaHealthMonitor } from "@infrastructure/messaging/KafkaHealthMonitor";

export class KafkaUserConsumer {
  readonly #logger?: Logger;
  readonly #consumer: Consumer;
  readonly #topic: string;
  readonly #handler: UserMessageHandler;
  readonly #retryFn: RetryFn;
  readonly #healthMonitor: KafkaHealthMonitor;

  constructor(
    brokers: string[],
    clientId: string,
    groupId: string,
    topic: string,
    handler: UserMessageHandler,
    healthMonitor: KafkaHealthMonitor,
    reconFn: RetryFn,
    logger?: Logger,
  ) {
    this.#logger = logger;
    this.#topic = topic;
    this.#handler = handler;
    const kafka = new Kafka({
      clientId,
      brokers,
      retry: { retries: 0 },
    });

    this.#consumer = kafka.consumer({ groupId });
    this.#healthMonitor = healthMonitor;
    this.#retryFn = reconFn;
  }

  async connect(): Promise<void> {
    await this.#consumer.connect();
    await this.#consumer.subscribe({
      topic: this.#topic,
      fromBeginning: false,
    });
    this.#logger?.info({ topic: this.#topic }, "Subscribed");
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
            { partition: payload.partition, offset: payload.message.offset },
            "Empty Kafka message, skipping",
          );
          return;
        }
        await this.#handler.handle(raw);
      },
    });
  }

  async #reconnect(): Promise<void> {
    await this.#retryFn(
      "Kafka User consumer",
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
