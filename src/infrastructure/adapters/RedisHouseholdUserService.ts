import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";

export class RedisHouseholdUserService implements HouseholdUserService {
  readonly #store: RedisReadModelStore;

  constructor(store: RedisReadModelStore) {
    this.#store = store;
  }

  async isHouseholdUserUsernameValid(
    householdUserUsername: HouseholdUserUsername,
  ): Promise<boolean> {
    if (householdUserUsername.value === "admin") return false;

    const cached = await this.#store.getUserIdByUsername(
      householdUserUsername.value,
    );

    return !!cached;
  }
}
