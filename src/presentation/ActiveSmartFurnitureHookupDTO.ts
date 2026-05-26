import {
  UtilityConsumptionDTO,
  UtilityConsumptionMapper,
} from "@presentation/UtilityConsumptionDTO";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";

export interface ActiveSmartFurnitureHookupDTO {
  id: string;
  utilityConsumption: UtilityConsumptionDTO;
}

export const ActiveSmartFurnitureHookupMapper = {
  toDTO(
    activeSmartFurnitureHookup: ActiveSmartFurnitureHookup,
  ): ActiveSmartFurnitureHookupDTO {
    return {
      id: activeSmartFurnitureHookup.id.toString(),
      utilityConsumption: UtilityConsumptionMapper.toDTO(
        UtilityConsumption.from(
          activeSmartFurnitureHookup.consumption,
          activeSmartFurnitureHookup.utilityType,
        ),
      ),
    };
  },
};
