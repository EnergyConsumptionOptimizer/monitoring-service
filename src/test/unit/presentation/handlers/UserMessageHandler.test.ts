import type { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import type { InboxRepository } from "@infrastructure/persistence/InboxRepository";
import type { DlqPublisher } from "@infrastructure/messaging/DlqPublisher";
import { UserMessageHandler } from "@presentation/event/handlers/UserMessageHandler";
import { beforeEach, describe, expect, it } from "vitest";
import { type MockProxy, mock } from "vitest-mock-extended";

function validUserDeletedEvent(overrides?: {
  eventId?: string;
  correlationId?: string;
  username?: string;
  userId?: string;
}): string {
  return JSON.stringify({
    eventId: overrides?.eventId ?? "evt-1",
    eventType: "UserDeletedEvent",
    correlationId: overrides?.correlationId ?? "corr-1",
    payload: {
      userId: overrides?.username ?? "user-id",
      username: overrides?.username ?? "john.doe",
    },
  });
}

describe("UserMessageHandler", () => {
  let measurementMaintenanceService: MockProxy<MeasurementMaintenanceService>;
  let inbox: MockProxy<InboxRepository>;
  let dlq: MockProxy<DlqPublisher>;
  let handler: UserMessageHandler;

  beforeEach(() => {
    measurementMaintenanceService = mock<MeasurementMaintenanceService>();
    inbox = mock<InboxRepository>();
    dlq = mock<DlqPublisher>();

    inbox.tryAcquire.mockResolvedValue(true);
    measurementMaintenanceService.removeHouseholdUserTagFromMeasurements.mockResolvedValue(
      undefined,
    );

    handler = new UserMessageHandler(measurementMaintenanceService, inbox, dlq);
  });

  describe("handle()", () => {
    describe("UserDeletedEvent", () => {
      it("should parse event, acquire inbox, and remove user tag from measurements", async () => {
        const raw = validUserDeletedEvent();

        await handler.handle(raw);

        expect(inbox.tryAcquire).toHaveBeenCalledWith("evt-1");
        expect(
          measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
        ).toHaveBeenCalledWith("john.doe");
        expect(dlq.publish).not.toHaveBeenCalled();
      });

      it("should skip duplicate event via inbox", async () => {
        inbox.tryAcquire.mockResolvedValue(false);
        const raw = validUserDeletedEvent();

        await handler.handle(raw);

        expect(
          measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
        ).not.toHaveBeenCalled();
        expect(dlq.publish).not.toHaveBeenCalled();
      });

      it("should route to DLQ when service throws after retries", async () => {
        measurementMaintenanceService.removeHouseholdUserTagFromMeasurements.mockRejectedValue(
          new Error("Service error"),
        );
        const raw = validUserDeletedEvent();

        await handler.handle(raw);

        expect(dlq.publish).toHaveBeenCalledWith(raw, expect.any(Error));
      });
    });

    describe("parse failures", () => {
      it("should route to DLQ on invalid JSON", async () => {
        const raw = "not-valid-json";

        await handler.handle(raw);

        expect(dlq.publish).toHaveBeenCalledWith(
          raw,
          expect.objectContaining({ message: "Parse failure" }),
        );
        expect(
          measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
        ).not.toHaveBeenCalled();
      });

      it("should route to DLQ on invalid payload shape", async () => {
        const raw = JSON.stringify({
          eventId: "evt-1",
          eventType: "UserDeletedEvent",
          payload: { wrong: "field" }, // missing username
        });

        await handler.handle(raw);

        expect(dlq.publish).toHaveBeenCalledWith(
          raw,
          expect.objectContaining({ message: "Parse failure" }),
        );
        expect(
          measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
        ).not.toHaveBeenCalled();
      });

      it("should route to DLQ on unknown eventType", async () => {
        const raw = JSON.stringify({
          eventId: "evt-1",
          eventType: "UnknownEvent",
          payload: { username: "john.doe" },
        });

        await handler.handle(raw);

        expect(dlq.publish).toHaveBeenCalledWith(
          raw,
          expect.objectContaining({
            message: "Unexpected eventType: UnknownEvent",
          }),
        );
        expect(
          measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
        ).not.toHaveBeenCalled();
      });
    });
  });
});
