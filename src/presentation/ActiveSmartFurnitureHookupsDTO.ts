import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";

export interface ActiveSmartFurnitureHookupsDTO {
  activeSmartFurnitureHookups: string[];
}

export const ActiveSmartFurnitureHookupsMapper = {
  toDTO(
    smartFurnitureHookupIDs: SmartFurnitureHookupID[],
  ): ActiveSmartFurnitureHookupsDTO {
    return {
      activeSmartFurnitureHookups: smartFurnitureHookupIDs.map((id) =>
        id.value(),
      ),
    };
  },
};
