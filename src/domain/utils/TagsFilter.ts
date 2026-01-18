import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";

export interface TagsFilter {
  username?: HouseholdUserUsername;
  zoneID?: ZoneID;
}
