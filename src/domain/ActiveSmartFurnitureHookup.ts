import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { Consumption } from "@domain/Consumption";

export interface ActiveSmartFurnitureHookup {
  id: SmartFurnitureHookupID;
  consumption: Consumption;
}
