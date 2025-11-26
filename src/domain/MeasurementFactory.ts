import { SmartFurnitureHookupID } from "./SmartFurnitureHookupID";
import { UtilityType } from "./UtilityType";
import { HouseholdUserUsername } from "./HouseholdUserUsername";
import { Measurement } from "./Measurement";

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
