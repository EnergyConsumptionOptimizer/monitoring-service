import {
  ConsumptionPointDTO,
  ConsumptionPointMapper,
} from "@presentation/ConsumptionPointDTO";
import { UtilityType } from "@domain/UtilityType";
import { utilityConsumptionUnitFromUtilityType } from "@presentation/UtilityConsumptionUnit";
import { UtilityConsumptionPoint } from "@domain/UtilityConsumptionPoint";

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
        utilityConsumptionUnitFromUtilityType(utilityType) ?? "",
      utilityConsumptionPoints: utilityConsumptions.map(
        ConsumptionPointMapper.toDTO,
      ),
    };
  },
};
