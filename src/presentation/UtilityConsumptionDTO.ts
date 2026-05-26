import { UtilityConsumption } from "@domain/values/UtilityConsumption";
import { utilityConsumptionUnitFromUtilityType } from "@presentation/UtilityConsumptionUnit";

export interface UtilityConsumptionDTO {
  value: number;
  utilityConsumptionUnit: string;
}

export const UtilityConsumptionMapper = {
  toDTO(utilityConsumption: UtilityConsumption): UtilityConsumptionDTO {
    return {
      value: utilityConsumption.consumption?.value ?? 0,
      utilityConsumptionUnit:
        utilityConsumptionUnitFromUtilityType(
          utilityConsumption.utilityType?.value,
        ) ?? "",
    };
  },
};
