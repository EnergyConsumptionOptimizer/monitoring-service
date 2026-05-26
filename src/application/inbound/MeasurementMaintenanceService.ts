import {
  HouseholdUserUsernameEmptyError,
  ZoneIdEmptyError,
} from "@domain/errors";

export interface MeasurementMaintenanceService {
  /**
   * Removes a username tag from all measurements.
   *
   * @param username - The household user's username to remove from measurements.
   */
  removeHouseholdUserTagFromMeasurements(
    username: string,
  ): Promise<undefined | HouseholdUserUsernameEmptyError>;

  /**
   * Removes a zone id tag from all measurements.
   *
   * @param zoneID - The zone's id to remove from measurements.
   */
  removeZoneIDTagFromMeasurements(
    zoneID: string,
  ): Promise<undefined | ZoneIdEmptyError>;
}
