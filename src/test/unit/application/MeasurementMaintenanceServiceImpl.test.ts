import { MeasurementMaintenanceServiceImpl } from "@application/MeasurementMaintenanceServiceImpl";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import {
  HouseholdUserUsernameEmptyError,
  ZoneIdEmptyError,
} from "@domain/errors";

import { beforeEach, describe, expect, it } from "vitest";
import { type MockProxy, mock } from "vitest-mock-extended";
import { validHouseholdUserUsername, validZoneId } from "@test/domainFactories";

describe("MeasurementMaintenanceServiceImpl", () => {
  let monitoringRepository: MockProxy<MonitoringRepository>;
  let service: MeasurementMaintenanceServiceImpl;

  beforeEach(() => {
    monitoringRepository = mock<MonitoringRepository>();
    monitoringRepository.deleteHouseholdUserTagFromMeasurements.mockResolvedValue(
      undefined,
    );
    monitoringRepository.deleteZoneIDTagFromMeasurements.mockResolvedValue(
      undefined,
    );

    service = new MeasurementMaintenanceServiceImpl(monitoringRepository);
  });

  describe("removeHouseholdUserTagFromMeasurements()", () => {
    it("should delegate to repository with a valid username", async () => {
      const result =
        await service.removeHouseholdUserTagFromMeasurements("testUser");

      expect(result).toBeUndefined();
      expect(
        monitoringRepository.deleteHouseholdUserTagFromMeasurements,
      ).toHaveBeenCalledTimes(1);
      expect(
        monitoringRepository.deleteHouseholdUserTagFromMeasurements,
      ).toHaveBeenCalledWith(validHouseholdUserUsername("testUser"));
    });

    it("should return HouseholdUserUsernameEmptyError and not call repository when username is empty", async () => {
      const result = await service.removeHouseholdUserTagFromMeasurements("");

      expect(result).toBeInstanceOf(HouseholdUserUsernameEmptyError);
      expect(
        monitoringRepository.deleteHouseholdUserTagFromMeasurements,
      ).not.toHaveBeenCalled();
    });
  });

  describe("removeZoneIDTagFromMeasurements()", () => {
    it("should delegate to repository with a valid zone ID", async () => {
      const result = await service.removeZoneIDTagFromMeasurements("zone-1");

      expect(result).toBeUndefined();
      expect(
        monitoringRepository.deleteZoneIDTagFromMeasurements,
      ).toHaveBeenCalledTimes(1);
      expect(
        monitoringRepository.deleteZoneIDTagFromMeasurements,
      ).toHaveBeenCalledWith(validZoneId("zone-1"));
    });

    it("should return ZoneIdEmptyError and not call repository when zone ID is empty", async () => {
      const result = await service.removeZoneIDTagFromMeasurements("");

      expect(result).toBeInstanceOf(ZoneIdEmptyError);
      expect(
        monitoringRepository.deleteZoneIDTagFromMeasurements,
      ).not.toHaveBeenCalled();
    });
  });
});
