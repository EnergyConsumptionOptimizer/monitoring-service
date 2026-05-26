import { HouseholdUserUsernameEmptyError } from "@domain/errors";

export class HouseholdUserUsername {
  private constructor(public readonly value: string) {}

  static from(
    username: string,
  ): HouseholdUserUsername | HouseholdUserUsernameEmptyError {
    const trimmed = username.trim();
    if (!trimmed) {
      return new HouseholdUserUsernameEmptyError();
    }
    return new HouseholdUserUsername(trimmed);
  }

  equals(other: HouseholdUserUsername): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
