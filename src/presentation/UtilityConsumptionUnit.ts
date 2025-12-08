import { UtilityType } from "@domain/UtilityType";

export function utilityConsumptionUnitFromUtilityType(
  utilityType: UtilityType,
) {
  switch (utilityType) {
    case UtilityType.GAS:
    case UtilityType.WATER:
      return "smc";
    case UtilityType.ELECTRICITY:
      return "kWh";
    default:
      return undefined;
  }
}
