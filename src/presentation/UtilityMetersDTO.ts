import { UtilityMeters } from "@domain/UtilityMeters";
import { UtilityType } from "@domain/UtilityType";
import {
  UtilityConsumptionDTO,
  UtilityConsumptionMapper,
} from "@presentation/UtilityConsumptionDTO";

export interface UtilityMetersDTO {
  electricity: UtilityConsumptionDTO;
  water: UtilityConsumptionDTO;
  gas: UtilityConsumptionDTO;
}

export const UtilityMetersMapper = {
  toDTO(utilityMeters: UtilityMeters): UtilityMetersDTO {
    const toConsumptionDTO = (utility: UtilityType) =>
      UtilityConsumptionMapper.toDTO({
        value: utilityMeters[utility] ?? 0,
        utilityType: utility,
      });

    return {
      gas: toConsumptionDTO(UtilityType.GAS),
      water: toConsumptionDTO(UtilityType.WATER),
      electricity: toConsumptionDTO(UtilityType.ELECTRICITY),
    };
  },
};
