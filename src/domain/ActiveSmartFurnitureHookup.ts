import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { UtilityConsumption } from "@domain/UtilityConsumption";

export interface ActiveSmartFurnitureHookup {
  id: SmartFurnitureHookupID;
  utilityConsumption: UtilityConsumption;
}
