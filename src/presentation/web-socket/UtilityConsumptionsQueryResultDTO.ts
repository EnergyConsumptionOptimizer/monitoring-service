import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import {
  ConsumptionPointDTO,
  ConsumptionPointMapper,
} from "@presentation/ConsumptionPointDTO";

export interface UtilityConsumptionsQueryResultDTO {
  label: string;
  utilityConsumptions: ConsumptionPointDTO[];
}

export const UtilityConsumptionsQueryResultMapper = {
  toDTO(
    label: string,
    utilityConsumptions: ConsumptionPoint[],
  ): UtilityConsumptionsQueryResultDTO {
    return {
      label,
      utilityConsumptions: utilityConsumptions.map(
        ConsumptionPointMapper.toDTO,
      ),
    };
  },
};
