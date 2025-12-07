import { MeasurementTag } from "../MeasurementTag";
import { UtilityType } from "@domain/UtilityType";

export interface ActiveSmartFurnitureHookupsModel {
  [MeasurementTag.SMART_FURNITURE_HOOKUP_ID]: string;
  _value: number;
  _measurement: UtilityType;
}
