import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";

export interface UtilityMetersQueryResultDTO {
  label: string;
  utilityMeters: UtilityMetersDTO;
}

export const UtilityMetersQueryResultMapper = {
  toDTO(
    label: string,
    utilityMeters: UtilityMetersDTO,
  ): UtilityMetersQueryResultDTO {
    return {
      label,
      utilityMeters,
    };
  },
};
