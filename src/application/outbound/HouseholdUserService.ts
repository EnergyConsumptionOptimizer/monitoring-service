import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
/**
 * Service interface for managing household user
 */
export interface HouseholdUserService {
  /**
   * Checks if a given username is valid.
   * @param householdUserUsername - username of the household user.
   */
  isHouseholdUserUsernameValid(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean>;
}
