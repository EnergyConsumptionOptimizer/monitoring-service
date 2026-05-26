import { UtilityMeters } from "@domain/values/UtilityMeters";
import { UtilityType, UtilityTypeEnum } from "@domain/values/UtilityType";
import {
  UtilityConsumptionDTO,
  UtilityConsumptionMapper,
} from "@presentation/UtilityConsumptionDTO";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";

export interface UtilityMetersDTO {
  utilityMeters: {
    electricity: UtilityConsumptionDTO;
    water: UtilityConsumptionDTO;
    gas: UtilityConsumptionDTO;
  };
}

export const UtilityMetersMapper = {
  toDTO(utilityMeters: UtilityMeters): UtilityMetersDTO {
    const toConsumptionDTO = (utility: UtilityTypeEnum) =>
      UtilityConsumptionMapper.toDTO(
        UtilityConsumption.from(
          utilityMeters.meters[utility],
          UtilityType.fromEnum(utility),
        ),
      );

    return {
      utilityMeters: {
        gas: toConsumptionDTO(UtilityTypeEnum.GAS),
        water: toConsumptionDTO(UtilityTypeEnum.WATER),
        electricity: toConsumptionDTO(UtilityTypeEnum.ELECTRICITY),
      },
    };
  },
};
