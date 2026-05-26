import { UtilityTypeEnum } from "./UtilityType";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";
import { InvalidUtilityTypeError } from "@domain/errors";

export type ConsumptionMap = Record<UtilityTypeEnum, ConsumptionValue>;

export class UtilityMeters {
  private constructor(readonly meters: ConsumptionMap) {}

  static from(
    consumptions: UtilityConsumption[],
  ): UtilityMeters | InvalidUtilityTypeError {
    const consumptionMap: ConsumptionMap = {} as ConsumptionMap;

    for (const row of consumptions) {
      if (!row.utilityType || !row.utilityType.value) {
        return new InvalidUtilityTypeError(String(row?.utilityType));
      }

      consumptionMap[row.utilityType.value] = row.consumption;
    }

    return new UtilityMeters(consumptionMap);
  }
}
