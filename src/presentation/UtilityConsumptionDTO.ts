import { UtilityConsumption } from "@domain/UtilityConsumption";
import { utilityConsumptionUnitFromUtilityType } from "@presentation/UtilityConsumptionUnit";

export interface UtilityConsumptionDTO {
  value: number;
  utilityConsumptionUnit: string;
}

export const UtilityConsumptionMapper = {
  toDTO(utilityConsumption: UtilityConsumption): UtilityConsumptionDTO {
    return {
      value: utilityConsumption.value,
      utilityConsumptionUnit:
        utilityConsumptionUnitFromUtilityType(utilityConsumption.utilityType) ??
        "",
    };
  },
};
