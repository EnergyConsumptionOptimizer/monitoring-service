import {
  ConsumptionPointDTO,
  ConsumptionPointMapper,
} from "@presentation/ConsumptionPointDTO";
import { UtilityType } from "@domain/values/UtilityType";
import { utilityConsumptionUnitFromUtilityType } from "@presentation/UtilityConsumptionUnit";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";

export interface UtilityConsumptionsDTO {
  utilityConsumptionUnit: string;
  utilityConsumptionPoints: ConsumptionPointDTO[];
}

export const utilityConsumptionsMapper = {
  toDTO(
    utilityType: UtilityType,
    utilityConsumptions: UtilityConsumptionPoint[],
  ): UtilityConsumptionsDTO {
    return {
      utilityConsumptionUnit:
        utilityConsumptionUnitFromUtilityType(utilityType.value) ?? "",
      utilityConsumptionPoints: utilityConsumptions.map(
        ConsumptionPointMapper.toDTO,
      ),
    };
  },
};
