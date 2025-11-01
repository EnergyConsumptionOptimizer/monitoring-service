import { HouseholdUserUsername } from "../HouseholdUserUsername";

export interface HouseholdUserService {
  validateHouseholdUserUsername(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean>;
}
