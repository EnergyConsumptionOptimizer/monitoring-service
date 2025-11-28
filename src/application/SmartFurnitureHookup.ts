import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { UtilityType } from "@domain/UtilityType";

export interface SmartFurnitureHookup {
  id: SmartFurnitureHookupID;
  utilityType: UtilityType;
}
