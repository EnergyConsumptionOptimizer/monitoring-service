import { describe, it, expect, beforeEach } from "vitest";

import { MeasurementFactory } from "@domain/MeasurementFactory";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { UtilityType } from "@domain/UtilityType";

interface MockedMeasurement {
  smartFurnitureHookupID: SmartFurnitureHookupID;
  utilityType: UtilityType;
  consumptionValue: number;
  timestamp: Date;
}

describe("MeasurementFactory", () => {
  let factory: MeasurementFactory;

  let mockedElectricityMeasurement: MockedMeasurement;
  let mockedGasMeasurement: MockedMeasurement;
  let mockedWaterMeasurement: MockedMeasurement;

  beforeEach(() => {
    factory = new MeasurementFactory();
    mockedElectricityMeasurement = {
      smartFurnitureHookupID: { value: "hookup-e-123" },
      utilityType: UtilityType.ELECTRICITY,
      consumptionValue: 150.5,
      timestamp: new Date("2024-01-15T10:30:00Z"),
    };

    mockedGasMeasurement = {
      smartFurnitureHookupID: { value: "hookup-g-123" },
      utilityType: UtilityType.GAS,
      consumptionValue: 150.5,
      timestamp: new Date("2024-01-15T10:30:00Z"),
    };

    mockedWaterMeasurement = {
      smartFurnitureHookupID: { value: "hookup-w-123" },
      utilityType: UtilityType.WATER,
      consumptionValue: 150.5,
      timestamp: new Date("2024-01-15T10:30:00Z"),
    };
  });

  describe("createMeasurement", () => {
    const useFactoryMeasurement = (
      measurement: MockedMeasurement,
      username?: HouseholdUserUsername,
    ) =>
      factory.createMeasurement(
        measurement.smartFurnitureHookupID,
        measurement.utilityType,
        measurement.consumptionValue,
        measurement.timestamp,
        username,
      );

    it("should create a measurement with all required fields", () => {
      const mockedMeasurement = mockedElectricityMeasurement;
      const measurement = useFactoryMeasurement(mockedMeasurement);

      expect(measurement).toBeDefined();
      expect(measurement.smartFurnitureHookupID).toBe(
        mockedMeasurement.smartFurnitureHookupID,
      );
      expect(measurement.utilityType).toBe(mockedMeasurement.utilityType);
      expect(measurement.consumptionValue).toBe(
        mockedMeasurement.consumptionValue,
      );
      expect(measurement.timestamp).toBe(mockedMeasurement.timestamp);
      expect(measurement.tags).toBeDefined();
    });

    it("should create a measurement with household user username", () => {
      const username: HouseholdUserUsername = { value: "mark" };
      const measurement = useFactoryMeasurement(
        mockedElectricityMeasurement,
        username,
      );

      expect(measurement.tags.householdUserUsername).toBe(username);
    });

    it("should create a measurement without household user username", () => {
      const measurement = useFactoryMeasurement(mockedElectricityMeasurement);

      expect(measurement.tags.householdUserUsername).toBeUndefined();
    });

    it("should handle GAS utility type", () => {
      const measurement = useFactoryMeasurement(mockedGasMeasurement);

      expect(measurement.utilityType).toBe(UtilityType.GAS);
    });

    it("should handle WATER utility type", () => {
      const measurement = useFactoryMeasurement(mockedWaterMeasurement);

      expect(measurement.utilityType).toBe(UtilityType.WATER);
    });

    it("should handle ELECTRICITY utility type", () => {
      const measurement = useFactoryMeasurement(mockedElectricityMeasurement);

      expect(measurement.utilityType).toBe(UtilityType.ELECTRICITY);
    });
  });
});
