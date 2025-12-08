import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";
import {
  UtilityConsumptionDTO,
  UtilityConsumptionMapper,
} from "@presentation/UtilityConsumptionDTO";

export interface ActiveSmartFurnitureHookupDTO {
  id: string;
  utilityConsumption: UtilityConsumptionDTO;
}

export const ActiveSmartFurnitureHookupMapper = {
  toDTO(
    activeSmartFurnitureHookup: ActiveSmartFurnitureHookup,
  ): ActiveSmartFurnitureHookupDTO {
    return {
      id: activeSmartFurnitureHookup.id.value(),
      utilityConsumption: UtilityConsumptionMapper.toDTO(
        activeSmartFurnitureHookup.utilityConsumption,
      ),
    };
  },
};
