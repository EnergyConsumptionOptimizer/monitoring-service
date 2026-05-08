import axios from "axios";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export class HTTPHouseholdUserService implements HouseholdUserService {
  constructor(private readonly baseUrl: string) {}

  async isHouseholdUserUsernameValid(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean> {
    if (householdUserUsername.value() == "admin") {
      return false;
    }

    try {
      await axios.get(
        `${this.baseUrl}/api/internal/users/${householdUserUsername.value()}`,
      );
      return true;
    } catch {
      return false;
    }
  }
}
