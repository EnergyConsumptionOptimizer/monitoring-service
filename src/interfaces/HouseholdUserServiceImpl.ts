import axios from "axios";
import { HouseholdUserService } from "@application/ports/HouseholdUserService";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export class HouseholdUserServiceImpl implements HouseholdUserService {
  constructor(private readonly baseUrl: string) {}

  async isHouseholdUserUsernameValid(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean> {
    if (householdUserUsername.value() == "admin") {
      return false;
    }

    try {
      await axios.get(
        `${this.baseUrl}/internal/users/${householdUserUsername.value()}`,
      );
      return true;
    } catch {
      return false;
    }
  }
}
