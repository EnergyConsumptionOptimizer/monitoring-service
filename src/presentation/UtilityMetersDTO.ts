import { UtilityMeters } from "@domain/UtilityMeters";
import { UtilityType } from "@domain/UtilityType";
import {
  ConsumptionDTO,
  ConsumptionMapper,
} from "@presentation/ConsumptionDTO";

export interface UtilityMetersDTO {
  utilityMeters: {
    electricity: ConsumptionDTO;
    water: ConsumptionDTO;
    gas: ConsumptionDTO;
  };
}

export const UtilityMetersMapper = {
  toDTO(utilityMeters: UtilityMeters): UtilityMetersDTO {
    const toConsumptionDTO = (utility: UtilityType) =>
      ConsumptionMapper.toDTO({
        value: utilityMeters[utility] ?? 0,
        utilityType: utility,
      });

    return {
      utilityMeters: {
        gas: toConsumptionDTO(UtilityType.GAS),
        water: toConsumptionDTO(UtilityType.WATER),
        electricity: toConsumptionDTO(UtilityType.ELECTRICITY),
      },
    };
  },
};
