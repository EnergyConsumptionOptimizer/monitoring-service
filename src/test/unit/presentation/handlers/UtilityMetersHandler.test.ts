import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import {
  validHouseholdUserUsername,
  validUtilityConsumption,
  validUtilityMeters,
  validZoneId,
} from "@test/domainFactories";
import { UtilityTypeEnum } from "@domain/values/UtilityType";
import { UtilityMeters } from "@domain/values/UtilityMeters";

describe("UtilityMetersHandler", () => {
  let monitoringService: MockProxy<MonitoringService>;
  let handler: UtilityMetersHandler;

  beforeEach(() => {
    monitoringService = mock<MonitoringService>();
    handler = new UtilityMetersHandler(monitoringService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getUtilityMeters", () => {
    it("should return mapped DTO with all filters provided", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 100,
          utilityType: UtilityTypeEnum.ELECTRICITY.toString(),
        }),
      ];

      monitoringService.getUtilityMeters.mockResolvedValue(
        validUtilityMeters(mockConsumptions),
      );

      const result = await handler.getUtilityMeters({
        from: "4hours",
        to: "2hours",
        username: validHouseholdUserUsername().toString(),
        zoneID: validZoneId().toString(),
      });

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledOnce();
      expect(result).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
    });

    it("should return utility meters with no filters provided", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 50,
          utilityType: UtilityTypeEnum.WATER.toString(),
        }),
      ];
      const meters = validUtilityMeters(mockConsumptions);
      monitoringService.getUtilityMeters.mockResolvedValue(meters);

      const result = await handler.getUtilityMeters();

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
        tags: {
          username: undefined,
          zoneID: undefined,
        },
      });
      expect(result).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
    });

    it("should throw when service returns an Error", async () => {
      const error = new Error("Meters fetch failed");
      monitoringService.getUtilityMeters.mockResolvedValue(error as Error);

      await expect(handler.getUtilityMeters()).rejects.toThrow(
        "Meters fetch failed",
      );
    });
  });

  describe("getCachedOrFreshData", () => {
    const frequency = 5000;

    it("should fetch from service on first call (no cache)", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 100,
          utilityType: UtilityTypeEnum.ELECTRICITY.toString(),
        }),
      ];
      const meters = validUtilityMeters(mockConsumptions);
      monitoringService.getUtilityMeters.mockResolvedValue(meters);

      const result = await handler.getCachedOrFreshData(frequency);

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledOnce();
      expect(result).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
    });

    it("should return cached data when called again within frequency window", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 100,
          utilityType: UtilityTypeEnum.ELECTRICITY.toString(),
        }),
      ];
      monitoringService.getUtilityMeters.mockResolvedValue(
        validUtilityMeters(mockConsumptions),
      );

      await handler.getCachedOrFreshData(frequency);
      vi.advanceTimersByTime(frequency - 1);
      const result = await handler.getCachedOrFreshData(frequency);

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledOnce();
      expect(result).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
    });

    it("should re-fetch when cache is stale (frequency elapsed)", async () => {
      const staleConsumptions = [
        validUtilityConsumption({
          consumption: 100,
          utilityType: UtilityTypeEnum.ELECTRICITY.toString(),
        }),
      ];
      const freshConsumptions = [
        validUtilityConsumption({
          consumption: 200,
          utilityType: UtilityTypeEnum.GAS.toString(),
        }),
      ];

      monitoringService.getUtilityMeters
        .mockResolvedValueOnce(validUtilityMeters(staleConsumptions))
        .mockResolvedValueOnce(validUtilityMeters(freshConsumptions));

      await handler.getCachedOrFreshData(frequency);
      vi.advanceTimersByTime(frequency + 1);
      const result = await handler.getCachedOrFreshData(frequency);

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        UtilityMeters.from(freshConsumptions) as UtilityMeters,
      );
    });

    it("should deduplicate concurrent fetches — only one in-flight request", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 100,
          utilityType: UtilityTypeEnum.ELECTRICITY.toString(),
        }),
      ];
      monitoringService.getUtilityMeters.mockResolvedValue(
        validUtilityMeters(mockConsumptions),
      );

      const [result1, result2] = await Promise.all([
        handler.getCachedOrFreshData(frequency),
        handler.getCachedOrFreshData(frequency),
      ]);

      expect(monitoringService.getUtilityMeters).toHaveBeenCalledOnce();
      expect(result1).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
      expect(result2).toEqual(
        UtilityMeters.from(mockConsumptions) as UtilityMeters,
      );
    });
  });
});
