import { SmartFurnitureHookupID } from "./SmartFurnitureHookupID";
import { UtilityType } from "./UtilityType";
import { HouseholdUserUsername } from "./HouseholdUserUsername";
import { Measurement } from "./Measurement";
import { ZoneID } from "@domain/ZoneID";

export class MeasurementFactory {
  createMeasurement(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: HouseholdUserUsername,
    zoneID?: ZoneID,
  ): Measurement {
    return {
      smartFurnitureHookupID: smartFurnitureHookupID,
      utilityType: utilityType,
      consumptionValue: consumptionValue,
      timestamp,
      tags: {
        householdUserUsername: householdUserUsername,
        zoneID: zoneID,
      },
    };
  }
}
