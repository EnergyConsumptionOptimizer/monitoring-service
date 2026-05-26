import { UtilityTypeEnum } from "@domain/values/UtilityType";

export function utilityConsumptionUnitFromUtilityType(
  utilityType: UtilityTypeEnum,
) {
  switch (utilityType) {
    case UtilityTypeEnum.GAS:
    case UtilityTypeEnum.WATER:
      return "smc";
    case UtilityTypeEnum.ELECTRICITY:
      return "kWh";
    default:
      return undefined;
  }
}
