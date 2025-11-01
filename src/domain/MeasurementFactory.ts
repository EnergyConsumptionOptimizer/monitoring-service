import { SmartFurnitureHookupID } from "./SmartFurnitureHookupID";
import { Measurement } from "./Measurement";
import { UtilityType } from "./UtilityType";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export class MeasurementFactory {
  createMeasurement(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: HouseholdUserUsername,
  ): Measurement {
    return {
      smartFurnitureHookupID: smartFurnitureHookupID,
      utilityType: utilityType,
      consumptionValue: consumptionValue,
      timestamp,
      tags: {
        householdUserUsername: householdUserUsername,
      },
    };
  }
}
