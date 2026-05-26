import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";
import {
  validConsumptionValue,
  validHouseholdUserUsername,
  validUtilityConsumptionPoint,
  validZoneId,
} from "@test/domainFactories";

const mockPoint = (value: number): UtilityConsumptionPoint =>
  ({ value }) as unknown as UtilityConsumptionPoint;

describe("UtilityConsumptionsHandler", () => {
  let monitoringService: MockProxy<MonitoringService>;
  let handler: UtilityConsumptionsHandler;

  beforeEach(() => {
    monitoringService = mock<MonitoringService>();
    handler = new UtilityConsumptionsHandler(monitoringService);
  });

  describe("getUtilityConsumptions", () => {
    it("should return consumption points with all filters provided", async () => {
      const points = [
        validUtilityConsumptionPoint(validConsumptionValue(42.5)),
        validUtilityConsumptionPoint(validConsumptionValue(38.1)),
      ];
      monitoringService.getUtilityConsumptions.mockResolvedValue(points);

      const result = await handler.getUtilityConsumptions("WATER", {
        from: "4hours",
        to: "1hour",
        granularity: "1minute",
        username: validHouseholdUserUsername().toString(),
        zoneID: validZoneId().toString(),
      });

      expect(monitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        "WATER",
        {
          from: "4hours",
          to: "1hour",
          granularity: "1minute",
          tags: {
            username: validHouseholdUserUsername().toString(),
            zoneID: validZoneId().toString(),
          },
        },
      );
      expect(result).toEqual(points);
    });

    it("should return consumption points with no filters provided", async () => {
      const points = [mockPoint(10.0)];
      monitoringService.getUtilityConsumptions.mockResolvedValue(points);

      const result = await handler.getUtilityConsumptions("ELECTRICITY");

      expect(monitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        "ELECTRICITY",
        {
          from: undefined,
          to: undefined,
          granularity: undefined,
          tags: {
            username: undefined,
            zoneID: undefined,
          },
        },
      );
      expect(result).toEqual(points);
    });

    it("should throw when the service returns an Error", async () => {
      const error = new Error("Query failed");
      monitoringService.getUtilityConsumptions.mockResolvedValue(
        error as Error,
      );

      await expect(handler.getUtilityConsumptions("GAS")).rejects.toThrow(
        "Query failed",
      );
    });
  });
});
