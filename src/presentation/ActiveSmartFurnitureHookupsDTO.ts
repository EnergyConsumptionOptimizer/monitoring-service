import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import {
  ActiveSmartFurnitureHookupDTO,
  ActiveSmartFurnitureHookupMapper,
} from "@presentation/ActiveSmartFurnitureHookupDTO";

export interface ActiveSmartFurnitureHookupsDTO {
  activeSmartFurnitureHookups: ActiveSmartFurnitureHookupDTO[];
}

export const ActiveSmartFurnitureHookupsMapper = {
  toDTO(
    activeSmartFurnitureHookups: ActiveSmartFurnitureHookup[],
  ): ActiveSmartFurnitureHookupsDTO {
    return {
      activeSmartFurnitureHookups: activeSmartFurnitureHookups.map(
        ActiveSmartFurnitureHookupMapper.toDTO,
      ),
    };
  },
};
