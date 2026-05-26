import { describe, expect, it } from "vitest";

import { UtilityTypeEnum } from "@domain/values/UtilityType";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { validUtilityConsumption } from "@test/domainFactories";

describe("UtilityMeters Entity", () => {
  describe("from()", () => {
    it("should successfully create a UtilityMeters instance from valid consumptions", () => {
      const consumptions: UtilityConsumption[] = [
        validUtilityConsumption({
          consumption: 150,
          utilityType: UtilityTypeEnum.ELECTRICITY,
        }),
        validUtilityConsumption({
          consumption: 42,
          utilityType: UtilityTypeEnum.WATER,
        }),
      ];

      const result = UtilityMeters.from(consumptions);

      expect(result).toBeInstanceOf(UtilityMeters);

      const metersInstance = result as UtilityMeters;

      expect(metersInstance.meters[UtilityTypeEnum.ELECTRICITY].value).toBe(
        150,
      );
      expect(metersInstance.meters[UtilityTypeEnum.WATER].value).toBe(42.0);
    });

    it("should handle an empty array by creating an empty meters map", () => {
      const result = UtilityMeters.from([]);

      expect(result).toBeInstanceOf(UtilityMeters);
      expect((result as UtilityMeters).meters).toEqual({});
    });

    it("should overwrite duplicate utility types with the latest value in the array", () => {
      const consumptions: UtilityConsumption[] = [
        validUtilityConsumption({
          consumption: 150,
          utilityType: UtilityTypeEnum.WATER,
        }),
        validUtilityConsumption({
          consumption: 42,
          utilityType: UtilityTypeEnum.WATER,
        }),
      ];

      const result = UtilityMeters.from(consumptions);

      expect(result).toBeInstanceOf(UtilityMeters);
      const metersInstance = result as UtilityMeters;

      expect(metersInstance.meters[UtilityTypeEnum.WATER].value).toBe(42);
    });
  });
});
