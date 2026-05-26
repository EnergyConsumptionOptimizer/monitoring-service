import axios from "axios";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { getUserByUsernameResponse } from "@storage/contracts/getUserByUsernameResponse";
import { Logger } from "pino";

export class HTTPHouseholdUserService implements HouseholdUserService {
  readonly #logger?: Logger;

  constructor(
    private readonly baseUrl: string,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  async isHouseholdUserUsernameValid(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean> {
    if (householdUserUsername.value == "admin") {
      return false;
    }

    try {
      const response = getUserByUsernameResponse.safeParse(
        await axios.get(
          `${this.baseUrl}/api/internal/users/${householdUserUsername.value}`,
        ),
      );

      return response.success;
    } catch (error) {
      this.#logger?.error({ error }, "Error while getting user");
      return false;
    }
  }
}
