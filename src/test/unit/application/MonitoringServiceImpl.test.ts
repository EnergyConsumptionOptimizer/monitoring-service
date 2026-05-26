import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { UtilityType, UtilityTypeEnum } from "@domain/values/UtilityType";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { TimeString } from "@domain/TimeString";

import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";

import {
  aActiveSmartFurnitureHookup,
  validHouseholdUserUsername,
  validUtilityConsumption,
  validUtilityConsumptionPoint,
  validUtilityMeters,
  validZoneId,
} from "@test/domainFactories";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { MeasurementTags } from "@domain/values/MeasurementTags";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";

describe("MonitoringServiceImpl", () => {
  let repository: MockProxy<MonitoringRepository>;
  let service: MonitoringServiceImpl;

  beforeEach(() => {
    repository = mock<MonitoringRepository>();

    service = new MonitoringServiceImpl(repository);
  });

  describe("getActiveSmartFurnitureHookups()", () => {
    it("should return all currently active smart furniture hookups", async () => {
      const ActiveHookup = aActiveSmartFurnitureHookup();

      repository.findActiveSmartFurnitureHookups.mockResolvedValue([
        ActiveHookup,
      ]);

      const result = await service.getActiveSmartFurnitureHookups();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(ActiveHookup);
      expect(repository.findActiveSmartFurnitureHookups).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should return an empty array when no hookups are active", async () => {
      repository.findActiveSmartFurnitureHookups.mockResolvedValue([]);

      const result = await service.getActiveSmartFurnitureHookups();

      expect(result).toEqual([]);
      expect(repository.findActiveSmartFurnitureHookups).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("getUtilityMeters()", () => {
    it("should retrieve utility meter information without filters", async () => {
      const mockConsumptions = [
        validUtilityConsumption({
          consumption: 150,
          utilityType: "ELECTRICITY",
        }),
      ];
      const mockMeters = validUtilityMeters(mockConsumptions);

      repository.findUtilityMeters.mockResolvedValue(mockMeters);

      const result = await service.getUtilityMeters();

      expect(result).toBeInstanceOf(UtilityMeters);
      expect(result).toEqual(mockMeters);
      expect(repository.findUtilityMeters).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it("should retrieve utility meter information filtered by time and tags", async () => {
      const filters = {
        from: "4hours" as TimeString,
        to: "2hours" as TimeString,
        tags: {
          username: validHouseholdUserUsername().toString(),
          zoneID: validZoneId().toString(),
        },
      };

      const mockConsumptions = [
        validUtilityConsumption({ consumption: 300, utilityType: "WATER" }),
      ];
      const mockMeters = validUtilityMeters(mockConsumptions);

      repository.findUtilityMeters.mockResolvedValue(mockMeters);

      const result = await service.getUtilityMeters(filters);

      expect(result).toBeInstanceOf(UtilityMeters);
      expect(repository.findUtilityMeters).toHaveBeenCalledWith(
        {
          from: "4hours" as TimeString,
          to: "2hours" as TimeString,
        } as TimeRangeFilter,
        {
          householdUserUsername: validHouseholdUserUsername(),
          zoneID: validZoneId(),
        } as MeasurementTags,
      );
    });
  });

  describe("getUtilityConsumptions()", () => {
    const utilityTypeStr = UtilityTypeEnum.ELECTRICITY.valueOf();

    const mockPoints = [
      validUtilityConsumptionPoint(undefined, new Date("2026-05-21T10:00:00Z")),
      validUtilityConsumptionPoint(undefined, new Date("2026-05-21T11:00:00Z")),
    ];

    it("should retrieve consumption points without filters", async () => {
      repository.findUtilityConsumptions.mockResolvedValue(mockPoints);

      const result = await service.getUtilityConsumptions(utilityTypeStr);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPoints);
      expect(repository.findUtilityConsumptions).toHaveBeenCalledWith(
        UtilityType.from(utilityTypeStr) as UtilityType,
        undefined,
        undefined,
      );
    });

    it("should retrieve consumption points for a specific utility type with filters", async () => {
      const filters = {
        from: "4hours" as TimeString,
        to: "2hours" as TimeString,
        granularity: "1minute" as TimeString,
        tags: {
          username: validHouseholdUserUsername().toString(),
          zoneID: validZoneId().toString(),
        },
      };

      repository.findUtilityConsumptions.mockResolvedValue(mockPoints);

      const result = await service.getUtilityConsumptions(
        utilityTypeStr,
        filters,
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPoints);
      expect(repository.findUtilityConsumptions).toHaveBeenCalledWith(
        UtilityType.from(utilityTypeStr) as UtilityType,
        {
          from: "4hours" as TimeString,
          to: "2hours" as TimeString,
          granularity: "1minute" as TimeString,
        } as TimeSeriesFilter,
        {
          householdUserUsername: validHouseholdUserUsername(),
          zoneID: validZoneId(),
        } as MeasurementTags,
      );
    });

    it("should return an empty array if no consumptions match the filters", async () => {
      const filters = {
        from: "4hours" as unknown as TimeString,
      };

      repository.findUtilityConsumptions.mockResolvedValue([]);

      const result = await service.getUtilityConsumptions(
        utilityTypeStr,
        filters,
      );

      expect(result).toEqual([]);
    });
  });
});
