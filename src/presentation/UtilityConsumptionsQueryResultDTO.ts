import { UtilityConsumptionPoint } from "@domain/UtilityConsumptionPoint";
import {
  UtilityConsumptionsDTO,
  utilityConsumptionsMapper,
} from "@presentation/UtilityConsumptionsDTO";
import { UtilityType } from "@domain/UtilityType";

export interface UtilityConsumptionsQueryResultDTO {
  label: string;
  utilityConsumptions: UtilityConsumptionsDTO;
}

export const UtilityConsumptionsQueryResultMapper = {
  toDTO(
    utilityType: UtilityType,
    label: string,
    utilityConsumptions: UtilityConsumptionPoint[],
  ): UtilityConsumptionsQueryResultDTO {
    return {
      label,
      utilityConsumptions: utilityConsumptionsMapper.toDTO(
        utilityType,
        utilityConsumptions,
      ),
    };
  },
};
