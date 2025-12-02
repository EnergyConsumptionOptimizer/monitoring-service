import { UtilityMeters } from "@domain/UtilityMeters";
import { UtilityType } from "@domain/UtilityType";

export interface UtilityMetersDTO {
  utilityMeters: {
    electricity: number;
    water: number;
    gas: number;
  };
}

export const UtilityMetersMapper = {
  toDTO(utilityMeters: UtilityMeters): UtilityMetersDTO {
    return {
      utilityMeters: {
        gas: utilityMeters[UtilityType.GAS] ?? 0,
        water: utilityMeters[UtilityType.WATER] ?? 0,
        electricity: utilityMeters[UtilityType.ELECTRICITY] ?? 0,
      },
    };
  },
};
