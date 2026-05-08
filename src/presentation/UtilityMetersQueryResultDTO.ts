import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";
import { UtilityConsumptionDTO } from "@presentation/UtilityConsumptionDTO";

export interface UtilityMetersQueryResultDTO {
  label: string;
  utilityMeters: {
    electricity: UtilityConsumptionDTO;
    water: UtilityConsumptionDTO;
    gas: UtilityConsumptionDTO;
  };
}

export const UtilityMetersQueryResultMapper = {
  toDTO(
    label: string,
    utilityMeters: UtilityMetersDTO,
  ): UtilityMetersQueryResultDTO {
    return {
      label,
      utilityMeters: utilityMeters.utilityMeters,
    };
  },
};
