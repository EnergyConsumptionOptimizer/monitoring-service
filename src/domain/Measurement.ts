import { SmartFurnitureHookupID } from "./SmartFurnitureHookupID";
import { UtilityType } from "./UtilityType";
import { MeasurementTags } from "./MeasurementTags";

export interface Measurement {
  smartFurnitureHookupID: SmartFurnitureHookupID;
  utilityType: UtilityType;
  consumptionValue: number;
  timestamp: Date;
  tags: MeasurementTags;
}
