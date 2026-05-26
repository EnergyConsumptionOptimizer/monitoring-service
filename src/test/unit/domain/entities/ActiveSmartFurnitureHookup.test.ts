import { describe, it, expect } from "vitest";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { SmartFurnitureHookup } from "@domain/entities/SmartFurnitureHookup";
import {
  validConsumptionValue,
  validSmartFurnitureHookupId,
  validUtilityType,
} from "@test/domainFactories";

describe("ActiveSmartFurnitureHookup Entity", () => {
  describe("rehydrateActive()", () => {
    it("should restore an ActiveSmartFurnitureHookup and inherit base properties", () => {
      const id = validSmartFurnitureHookupId("active-123");
      const utilityType = validUtilityType();
      const consumption = validConsumptionValue(250.75);

      const activeHookup = ActiveSmartFurnitureHookup.rehydrateActive(
        id,
        utilityType,
        consumption,
      );

      expect(activeHookup).toBeInstanceOf(ActiveSmartFurnitureHookup);
      expect(activeHookup).toBeInstanceOf(SmartFurnitureHookup);

      expect(activeHookup.id).toBe(id);
      expect(activeHookup.utilityType).toBe(utilityType);

      expect(activeHookup.consumption).toBe(consumption);
    });
  });

  describe("toString()", () => {
    it("should merge base properties and consumption into the object representation", () => {
      const id = validSmartFurnitureHookupId("active-123");
      const utilityType = validUtilityType();
      const consumption = validConsumptionValue(250.75);

      const activeHookup = ActiveSmartFurnitureHookup.rehydrateActive(
        id,
        utilityType,
        consumption,
      );

      expect(activeHookup.toString()).toEqual({
        id: "active-123",
        utilityType: utilityType.toString(),
        consumption: "250.75",
      });
    });
  });
});
