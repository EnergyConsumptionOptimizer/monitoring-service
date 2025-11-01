import { SmartFurnitureHookupID } from "../SmartFurnitureHookupID";
import { HouseholdUserUsername } from "../HouseholdUserUsername";

export interface IngestingService {
  createMeasurement(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: HouseholdUserUsername,
  ): Promise<void>;
}
