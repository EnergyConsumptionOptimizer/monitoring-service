import { Logger } from "pino";
import { InboxRepository } from "@infrastructure/persistence/InboxRepository";
import { DlqPublisher } from "@infrastructure/messaging/DlqPublisher";
import { mapRawMessageToEventEnvelope } from "@presentation/event/mapRawMessageToEventEnvelope";
import { UnrecoverableError } from "@presentation/event/errors";
import { trace } from "@opentelemetry/api";
import { withRetry } from "@presentation/event/withRetry";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { ZoneIdEmptyError } from "@domain/errors";
import { EventEnvelope } from "@presentation/event/contracts/EventEnvelopeSchema";
import { zoneDeletedPayloadSchema } from "@presentation/event/contracts/ZoneEventPayloads";

export class ZoneMessageHandler {
  readonly #logger?: Logger;
  readonly #inbox: InboxRepository;
  readonly #measurementMaintenanceService: MeasurementMaintenanceService;
  readonly #dlq: DlqPublisher;

  constructor(
    measurementMaintenanceService: MeasurementMaintenanceService,
    inbox: InboxRepository,
    dlq: DlqPublisher,
    logger?: Logger,
  ) {
    this.#measurementMaintenanceService = measurementMaintenanceService;
    this.#inbox = inbox;
    this.#dlq = dlq;
    this.#logger = logger;
  }

  async handle(raw: string): Promise<void> {
    const message = await this.#parseOrDiscard(raw);
    if (!message) return;

    const correlationId = message.correlationId ?? message.eventId;
    const childLogger = this.#logger?.child({ correlationId });

    const handlerFunction = await this.#getHandlerOrDiscard(
      message,
      raw,
      childLogger,
    );

    if (!handlerFunction) return;

    const acquired = await this.#inbox.tryAcquire(message.eventId);

    if (!acquired) {
      this.#logger?.debug(
        { eventId: message.eventId },
        "Duplicate eventId, skipping",
      );
      return;
    }

    const tracer = trace.getTracer("monitoring-service");
    await tracer.startActiveSpan(
      `ZoneMessageHandler.handle.${message.eventType}`,
      {
        attributes: {
          eventId: message.eventId,
          correlationId,
          eventType: message.eventType,
        },
      },
      async (span) => {
        try {
          await withRetry(handlerFunction);
        } catch (err) {
          childLogger?.warn(
            { err, eventId: message.eventId },
            "Retry exhausted, publishing to DLQ",
          );
          await this.#dlq.publish(raw, err);
        } finally {
          span.end();
        }
      },
    );
  }

  async #parseOrDiscard(raw: string) {
    const message = await mapRawMessageToEventEnvelope(raw);

    if (message instanceof UnrecoverableError) {
      this.#logger?.warn(message.cause, message.message);
      await this.#dlq.publish(raw, message);
      return;
    }

    return message;
  }

  async #getHandlerOrDiscard(
    message: EventEnvelope,
    raw: string,
    childLogger?: Logger,
  ) {
    let handlerFunction = undefined;

    switch (message.eventType) {
      case "ZoneDeletedEvent":
        handlerFunction = this.#handleZoneDeleted(message.payload);
        break;
    }

    if (!handlerFunction) {
      childLogger?.warn(
        { eventType: message.eventType },
        "Unexpected eventType, routing to DLQ",
      );
      await this.#dlq.publish(
        raw,
        new UnrecoverableError(`Unexpected eventType: ${message.eventType}`),
      );
      return;
    }

    if (handlerFunction instanceof UnrecoverableError) {
      childLogger?.warn(
        {
          error: handlerFunction.cause,
          eventId: message.eventId,
        },
        "Unrecoverable parse failure, routing to DLQ",
      );
      await this.#dlq.publish(raw, handlerFunction);
      return;
    }

    return handlerFunction;
  }

  #handleZoneDeleted(
    payload: unknown,
  ): (() => Promise<undefined | ZoneIdEmptyError>) | UnrecoverableError {
    const result = zoneDeletedPayloadSchema.safeParse(payload);
    if (!result.success)
      return new UnrecoverableError("Parse failure", result.error);

    return () =>
      this.#measurementMaintenanceService.removeZoneIDTagFromMeasurements(
        result.data.zoneId,
      );
  }
}
