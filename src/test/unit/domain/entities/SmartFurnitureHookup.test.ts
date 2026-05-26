import { describe, it, expect } from "vitest";
import { SmartFurnitureHookup } from "@domain/entities/SmartFurnitureHookup";
import {
  validSmartFurnitureHookupId,
  validUtilityType,
} from "@test/domainFactories";

describe("SmartFurnitureHookup Entity", () => {
  describe("rehydrate()", () => {
    it("should restore a SmartFurnitureHookup with correct properties", () => {
      const id = validSmartFurnitureHookupId("hookup-123");
      const utilityType = validUtilityType();

      const hookup = SmartFurnitureHookup.rehydrate(id, utilityType);

      expect(hookup).toBeInstanceOf(SmartFurnitureHookup);
      expect(hookup.id).toBe(id);
      expect(hookup.utilityType).toBe(utilityType);
    });
  });

  describe("toString()", () => {
    it("should return an object representation of the entity", () => {
      const id = validSmartFurnitureHookupId("hookup-123");
      const utilityType = validUtilityType();

      const hookup = SmartFurnitureHookup.rehydrate(id, utilityType);

      expect(hookup.toString()).toEqual({
        id: "hookup-123",
        utilityType: utilityType.toString(),
      });
    });
  });
});
