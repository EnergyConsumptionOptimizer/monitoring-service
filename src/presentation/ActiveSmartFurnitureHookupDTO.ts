import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";
import {
  ConsumptionDTO,
  ConsumptionMapper,
} from "@presentation/ConsumptionDTO";

export interface ActiveSmartFurnitureHookupDTO {
  id: string;
  consumption: ConsumptionDTO;
}

export const ActiveSmartFurnitureHookupMapper = {
  toDTO(
    activeSmartFurnitureHookup: ActiveSmartFurnitureHookup,
  ): ActiveSmartFurnitureHookupDTO {
    return {
      id: activeSmartFurnitureHookup.id.value(),
      consumption: ConsumptionMapper.toDTO(
        activeSmartFurnitureHookup.consumption,
      ),
    };
  },
};
