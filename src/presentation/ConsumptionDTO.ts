import { Consumption } from "@domain/Consumption";
import { UtilityType } from "@domain/UtilityType";

export interface ConsumptionDTO {
  value: number;
  consumptionUnit: string;
}

export const ConsumptionMapper = {
  toDTO(consumption: Consumption): ConsumptionDTO {
    let consumptionUnit;
    switch (consumption.utilityType) {
      case UtilityType.GAS:
      case UtilityType.WATER:
        consumptionUnit = "smc";
        break;
      case UtilityType.ELECTRICITY:
        consumptionUnit = "kWh";
        break;
      default:
        consumptionUnit = "";
    }

    return {
      value: consumption.value,
      consumptionUnit,
    };
  },
};
