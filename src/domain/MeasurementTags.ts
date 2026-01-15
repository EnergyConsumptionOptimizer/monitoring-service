import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";

export interface MeasurementTags {
  householdUserUsername?: HouseholdUserUsername;
  zoneID?: ZoneID;
}
