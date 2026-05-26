import { describe, it, expect } from "vitest";
import {
  validSmartFurnitureHookupId,
  validUtilityType,
  validConsumptionValue,
  validMeasurementTags,
} from "@test/domainFactories";
import { Measurement } from "@domain/entities/Measurement";

describe("Measurement Entity", () => {
  describe("constructor()", () => {
    it("should properly initialize all fields", () => {
      const id = validSmartFurnitureHookupId("meas-123");
      const utilityType = validUtilityType();
      const consumption = validConsumptionValue(42.5);
      const timestamp = new Date("2026-05-21T10:00:00Z");
      const tags = validMeasurementTags();

      const measurement = new Measurement(
        id,
        utilityType,
        consumption,
        timestamp,
        tags,
      );

      expect(measurement).toBeInstanceOf(Measurement);
      expect(measurement.smartFurnitureHookupID).toBe(id);
      expect(measurement.utilityType).toBe(utilityType);
      expect(measurement.consumptionValue).toBe(consumption);
      expect(measurement.tags).toBe(tags);
    });
  });

  describe("timestamp getter encapsulation", () => {
    it("should return a new Date instance to prevent external mutation", () => {
      const id = validSmartFurnitureHookupId();
      const utilityType = validUtilityType();
      const consumption = validConsumptionValue(42.5);
      const originalTimestamp = new Date("2026-05-21T10:00:00Z");
      const tags = validMeasurementTags();

      const measurement = new Measurement(
        id,
        utilityType,
        consumption,
        originalTimestamp,
        tags,
      );

      const retrievedDate = measurement.timestamp;

      expect(retrievedDate.getTime()).toBe(originalTimestamp.getTime());

      expect(retrievedDate).not.toBe(originalTimestamp);

      retrievedDate.setFullYear(2099);
      expect(measurement.timestamp.getFullYear()).toBe(2026);
    });
  });
});
