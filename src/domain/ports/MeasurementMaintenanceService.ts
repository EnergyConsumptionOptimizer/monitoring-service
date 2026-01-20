import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";

export interface MeasurementMaintenanceService {
  /**
   * Removes a username tag from all measurements.
   *
   * @param username - The household user's username to remove from measurements.
   */
  removeHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void>;

  /**
   * Removes a zone id tag from all measurements.
   *
   * @param zoneID - The zone's id to remove from measurements.
   */
  removeZoneIDTagFromMeasurements(zoneID: ZoneID): Promise<void>;
}
