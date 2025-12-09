import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export interface MeasurementMaintenanceService {
  /**
   * Removes a username tag from all measurements.
   *
   * @param username - The household user's username to remove from measurements.
   */
  removeHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void>;
}
