import { MeasurementTags } from "./MeasurementTags";
import { UtilityType } from "./UtilityType";
import { SmartFurnitureHookupID } from "./SmartFurnitureHookupID";

export interface Measurement {
  smartFurnitureHookupID: SmartFurnitureHookupID;
  utilityType: UtilityType;
  consumptionValue: number;
  timestamp: Date;
  tags: MeasurementTags;
}
