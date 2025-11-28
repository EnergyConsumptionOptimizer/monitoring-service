import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export interface TagsFilter extends MonitoringRepository {
  username?: HouseholdUserUsername;
}
