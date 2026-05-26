import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { MonitoringService } from "@application/inbound/MonitoringService";
import {
  mockActiveSmartFurnitureHookupBathroomSink,
  mockActiveSmartFurnitureHookupKitchenSink,
} from "@test/domainFactories";

describe("ActiveSmartFurnitureHookupsHandler", () => {
  let monitoringService: MockProxy<MonitoringService>;
  let handler: ActiveSmartFurnitureHookupsHandler;

  beforeEach(() => {
    monitoringService = mock<MonitoringService>();
    handler = new ActiveSmartFurnitureHookupsHandler(monitoringService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getActiveSmartFurnitureHookups", () => {
    it("should fetch and return active hookups from the service", async () => {
      const hookups = [
        mockActiveSmartFurnitureHookupBathroomSink,
        mockActiveSmartFurnitureHookupKitchenSink,
      ];
      monitoringService.getActiveSmartFurnitureHookups.mockResolvedValue(
        hookups,
      );

      const result = await handler.getActiveSmartFurnitureHookups();

      expect(
        monitoringService.getActiveSmartFurnitureHookups,
      ).toHaveBeenCalledOnce();
      expect(result).toEqual(hookups);
    });
  });

  describe("getCachedOrFreshData", () => {
    const frequency = 5000;

    it("should fetch from service on first call since there is no cache", async () => {
      const hookups = [mockActiveSmartFurnitureHookupBathroomSink];
      monitoringService.getActiveSmartFurnitureHookups.mockResolvedValue(
        hookups,
      );

      const result = await handler.getCachedOrFreshData(frequency);

      expect(
        monitoringService.getActiveSmartFurnitureHookups,
      ).toHaveBeenCalledOnce();
      expect(result).toEqual(hookups);
    });

    it("should return cached data when called again within frequency window", async () => {
      const hookups = [mockActiveSmartFurnitureHookupBathroomSink];
      monitoringService.getActiveSmartFurnitureHookups.mockResolvedValue(
        hookups,
      );

      await handler.getCachedOrFreshData(frequency);
      vi.advanceTimersByTime(frequency - 100);
      const result = await handler.getCachedOrFreshData(frequency);

      expect(
        monitoringService.getActiveSmartFurnitureHookups,
      ).toHaveBeenCalledOnce();
      expect(result).toEqual(hookups);
    });

    it("should re-fetch when cache is stale (frequency elapsed)", async () => {
      const staleHookups = [mockActiveSmartFurnitureHookupBathroomSink];
      const freshHookups = [mockActiveSmartFurnitureHookupKitchenSink];
      monitoringService.getActiveSmartFurnitureHookups
        .mockResolvedValueOnce(staleHookups)
        .mockResolvedValueOnce(freshHookups);

      await handler.getCachedOrFreshData(frequency);
      vi.advanceTimersByTime(frequency + 100);
      const result = await handler.getCachedOrFreshData(frequency);

      expect(
        monitoringService.getActiveSmartFurnitureHookups,
      ).toHaveBeenCalledTimes(2);
      expect(result).toEqual(freshHookups);
    });

    it("should deduplicate concurrent fetches — only one in-flight request", async () => {
      const hookups = [mockActiveSmartFurnitureHookupBathroomSink];
      monitoringService.getActiveSmartFurnitureHookups.mockResolvedValue(
        hookups,
      );

      const [result1, result2] = await Promise.all([
        handler.getCachedOrFreshData(frequency),
        handler.getCachedOrFreshData(frequency),
      ]);

      expect(
        monitoringService.getActiveSmartFurnitureHookups,
      ).toHaveBeenCalledOnce();
      expect(result1).toEqual(hookups);
      expect(result2).toEqual(hookups);
    });
  });
});
