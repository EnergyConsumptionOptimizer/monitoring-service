import { MonitoringRepository } from "@domain/port/MonitoringRepository";
import { TimeString } from "@domain/utils/TimeString";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export interface TimeRangeFilter extends MonitoringRepository {
  from?: TimeString;
  to?: TimeString;
  username?: HouseholdUserUsername;
}
