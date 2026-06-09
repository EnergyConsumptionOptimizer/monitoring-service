import { Logger } from "pino";
import { mapRawMessageToEventEnvelope } from "@presentation/event/mapRawMessageToEventEnvelope";
import { UnrecoverableError } from "@presentation/event/errors";
import { DlqPublisher } from "@infrastructure/messaging/DlqPublisher";
import { withRetry } from "@presentation/event/withRetry";
import { trace } from "@opentelemetry/api";
import { EventEnvelope } from "@presentation/event/contracts/EventEnvelopeSchema";
import {
  smartFurnitureHookupCreatedPayloadSchema,
  smartFurnitureHookupDeletedPayloadSchema,
  smartFurnitureHookupZoneChangedPayloadSchema,
} from "@presentation/event/contracts/HookupEventPayloads";
import { zoneDeletedPayloadSchema } from "@presentation/event/contracts/ZoneEventPayloads";
import {
  userCreatedPayloadSchema,
  userDeletedPayloadSchema,
} from "@presentation/event/contracts/UserEventPayloads";
import { ReadModelStore } from "@infrastructure/persistence/ReadModelStore";

export class ReadModelMessageHandler {
  readonly #store: ReadModelStore;
  readonly #dlq: DlqPublisher;
  readonly #logger?: Logger;

  constructor(store: ReadModelStore, dlq: DlqPublisher, logger?: Logger) {
    this.#store = store;
    this.#dlq = dlq;
    this.#logger = logger?.child({ component: "ReadModelMessageHandler" });
  }

  async handle(raw: string): Promise<void> {
    const message = await this.#parseOrDiscard(raw);
    if (!message) return;

    const correlationId = message.correlationId ?? message.eventId;
    const childLogger = this.#logger?.child({ correlationId });

    const handlerFn = this.#resolveHandler(message, raw, childLogger);
    if (!handlerFn) return;

    if (handlerFn instanceof UnrecoverableError) {
      childLogger?.warn(
        { error: handlerFn.cause, eventId: message.eventId },
        "Unrecoverable parse failure — routing to DLQ",
      );
      await this.#dlq.publish(raw, handlerFn);
      return;
    }

    const tracer = trace.getTracer("monitoring-service");
    await tracer.startActiveSpan(
      `ReadModelMessageHandler.handle.${message.eventType}`,
      {
        attributes: {
          eventId: message.eventId,
          correlationId,
          eventType: message.eventType,
        },
      },
      async (span) => {
        try {
          await withRetry(handlerFn);
        } catch (err) {
          childLogger?.warn(
            { err, eventId: message.eventId },
            "Retry exhausted — publishing to DLQ",
          );
          await this.#dlq.publish(raw, err);
        } finally {
          span.end();
        }
      },
    );
  }

  async #parseOrDiscard(raw: string): Promise<EventEnvelope | undefined> {
    const message = await mapRawMessageToEventEnvelope(raw);
    if (message instanceof UnrecoverableError) {
      this.#logger?.warn(message.cause, message.message);
      await this.#dlq.publish(raw, message);
      return undefined;
    }
    return message;
  }

  #resolveHandler(
    message: EventEnvelope,
    raw: string,
    childLogger?: Logger,
  ): (() => Promise<void>) | UnrecoverableError | undefined {
    switch (message.eventType) {
      case "UserCreatedEvent":
        return this.#handleUserCreated(message.payload);
      case "UserDeletedEvent":
        return this.#handleUserDeleted(message.payload);

      case "SmartFurnitureHookupCreatedEvent":
        return this.#handleHookupCreated(message.payload);

      case "SmartFurnitureHookupDeletedEvent":
        return this.#handleHookupDeleted(message.payload);

      case "SmartFurnitureHookupZoneChangedEvent":
        return this.#handleHookupZoneChanged(message.payload);

      case "ZoneDeletedEvent":
        return this.#handleZoneDeleted(message.payload);

      default:
        childLogger?.warn(
          { eventType: message.eventType },
          "Unknown eventType for read model — routing to DLQ",
        );
        void this.#dlq.publish(
          raw,
          new UnrecoverableError(`Unexpected eventType: ${message.eventType}`),
        );
        return undefined;
    }
  }
  #handleUserCreated(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result = userCreatedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () =>
      this.#store.setUser({
        id: result.data.userId,
        username: result.data.username,
      });
  }

  #handleUserDeleted(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result = userDeletedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () => this.#store.deleteUser(result.data.username);
  }

  #handleHookupCreated(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result = smartFurnitureHookupCreatedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () =>
      this.#store.setSmartFurnitureHookup({
        id: result.data.smartFurnitureHookupId,
        utilityType: result.data.utilityType,
      });
  }

  #handleHookupDeleted(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result = smartFurnitureHookupDeletedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () =>
      this.#store.deleteSmartFurnitureHookup(
        result.data.smartFurnitureHookupId,
      );
  }

  #handleHookupZoneChanged(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result =
      smartFurnitureHookupZoneChangedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () =>
      this.#store.updateSmartFurnitureHookupZone(
        result.data.smartFurnitureHookupId,
        result.data.zoneId,
      );
  }

  #handleZoneDeleted(
    payload: unknown,
  ): (() => Promise<void>) | UnrecoverableError {
    const result = zoneDeletedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () => this.#store.deleteZone(result.data.zoneId);
  }
}
