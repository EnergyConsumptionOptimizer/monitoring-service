import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import {
  ConsumptionPointDTO,
  ConsumptionPointMapper,
} from "@presentation/ConsumptionPointDTO";

export interface UtilityConsumptionQueryResultDTO {
  label: string;
  utilityConsumptions: ConsumptionPointDTO[];
}

export const UtilityConsumptionQueryResultMapper = {
  toDTO(
    label: string,
    utilityConsumptions: ConsumptionPoint[],
  ): UtilityConsumptionQueryResultDTO {
    return {
      label,
      utilityConsumptions: utilityConsumptions.map(
        ConsumptionPointMapper.toDTO,
      ),
    };
  },
};
