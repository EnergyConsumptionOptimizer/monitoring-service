import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { MapService } from "@application/outbound/MapService";
import { SmartFurnitureHookupNotFoundError } from "@domain/errors";
import { Measurement } from "@domain/entities/Measurement";

import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import {
  aSmartFurnitureHookup,
  validHouseholdUserUsername,
  validZoneId,
} from "@test/domainFactories";

describe("IngestingServiceImpl", () => {
  let monitoringRepository: MockProxy<MonitoringRepository>;
  let smartFurnitureHookupService: MockProxy<SmartFurnitureHookupService>;
  let householdUserService: MockProxy<HouseholdUserService>;
  let mapService: MockProxy<MapService>;
  let service: IngestingServiceImpl;

  const validHookupId = "sfh-1";
  const validConsumption = 100;
  const validTimestamp = new Date("2026-05-21T10:00:00Z");

  beforeEach(() => {
    monitoringRepository = mock<MonitoringRepository>();
    smartFurnitureHookupService = mock<SmartFurnitureHookupService>();
    householdUserService = mock<HouseholdUserService>();
    mapService = mock<MapService>();

    const mockedHookup = aSmartFurnitureHookup({ id: validHookupId });

    smartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue({
      id: mockedHookup.id.value,
      utilityType: mockedHookup.utilityType.value,
    });
    mapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);
    monitoringRepository.saveMeasurement.mockResolvedValue(undefined);

    service = new IngestingServiceImpl(
      monitoringRepository,
      smartFurnitureHookupService,
      householdUserService,
      mapService,
    );
  });

  describe("createMeasurement()", () => {
    describe("happy paths", () => {
      it("should save a measurement with no username and no zone", async () => {
        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
        );

        expect(result).toBeUndefined();
        expect(monitoringRepository.saveMeasurement).toHaveBeenCalledTimes(1);
        expect(monitoringRepository.saveMeasurement).toHaveBeenCalledWith(
          expect.any(Measurement),
        );
        expect(
          householdUserService.isHouseholdUserUsernameValid,
        ).not.toHaveBeenCalled();
      });

      it("should save measurement with username tag when username is valid", async () => {
        householdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
          true,
        );

        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
          "testUser",
        );

        expect(result).toBeUndefined();
        expect(
          householdUserService.isHouseholdUserUsernameValid,
        ).toHaveBeenCalledWith(validHouseholdUserUsername("testUser"));

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.tags.householdUserUsername?.value).toBe(
          "testUser",
        );
      });

      it("should omit username tag when username is not valid", async () => {
        householdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
          false,
        );

        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
          "unknownUser",
        );

        expect(result).toBeUndefined();

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.tags.householdUserUsername).toBeUndefined();
      });

      it("should attach zone tag when hookup is assigned to a zone", async () => {
        mapService.isSmartFurnitureHookupInAZone.mockResolvedValue({
          zoneID: validZoneId("zone-42").value,
        });

        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
        );

        expect(result).toBeUndefined();

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.tags.zoneID?.value).toBe("zone-42");
      });

      it("should omit zone tag when hookup is not assigned to any zone", async () => {
        mapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);

        await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
        );

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.tags.zoneID).toBeUndefined();
      });

      it("should save measurement with both username and zone tags when both are valid", async () => {
        householdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
          true,
        );
        mapService.isSmartFurnitureHookupInAZone.mockResolvedValue({
          zoneID: validZoneId("zone-99").value,
        });

        await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
          "testUser",
        );

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.tags.householdUserUsername?.value).toBe(
          "testUser",
        );
        expect(savedMeasurement.tags.zoneID?.value).toBe("zone-99");
      });

      it("should use current date when timestamp is invalid", async () => {
        const before = new Date();
        await service.createMeasurement(
          validHookupId,
          validConsumption,
          new Date("not-a-date"),
        );
        const after = new Date();

        const savedMeasurement =
          monitoringRepository.saveMeasurement.mock.calls[0][0];
        expect(savedMeasurement.timestamp.getTime()).toBeGreaterThanOrEqual(
          before.getTime(),
        );
        expect(savedMeasurement.timestamp.getTime()).toBeLessThanOrEqual(
          after.getTime(),
        );
      });

      it("should not call householdUserService when no username is provided", async () => {
        await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
        );

        expect(
          householdUserService.isHouseholdUserUsernameValid,
        ).not.toHaveBeenCalled();
      });
    });

    describe("input validation errors", () => {
      it("should return an Error when smartFurnitureHookupID is empty", async () => {
        const result = await service.createMeasurement(
          "",
          validConsumption,
          validTimestamp,
        );

        expect(result).toBeInstanceOf(Error);
        expect(
          smartFurnitureHookupService.getSmartFurnitureHookup,
        ).not.toHaveBeenCalled();
        expect(monitoringRepository.saveMeasurement).not.toHaveBeenCalled();
      });

      it("should return an Error when consumptionValue is invalid", async () => {
        const result = await service.createMeasurement(
          validHookupId,
          NaN,
          validTimestamp,
        );

        expect(result).toBeInstanceOf(Error);
        expect(monitoringRepository.saveMeasurement).not.toHaveBeenCalled();
      });

      it("should return an Error when the username string has an invalid format", async () => {
        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
          " ",
        );

        expect(result).toBeInstanceOf(Error);
        expect(monitoringRepository.saveMeasurement).not.toHaveBeenCalled();
      });
    });

    describe("not-found errors", () => {
      it("should return SmartFurnitureHookupNotFoundError when hookup does not exist", async () => {
        smartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
          undefined,
        );

        const result = await service.createMeasurement(
          validHookupId,
          validConsumption,
          validTimestamp,
        );

        expect(result).toBeInstanceOf(SmartFurnitureHookupNotFoundError);

        expect(monitoringRepository.saveMeasurement).not.toHaveBeenCalled();
      });
    });
  });
});
