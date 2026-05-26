import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { ZoneID } from "@domain/values/ZoneID";

export class MeasurementTags {
  constructor(
    readonly householdUserUsername?: HouseholdUserUsername,
    readonly zoneID?: ZoneID,
  ) {}

  equals(other: MeasurementTags): boolean {
    const usernameEquals =
      this.householdUserUsername === other.householdUserUsername ||
      (this.householdUserUsername?.equals(
        other.householdUserUsername as HouseholdUserUsername,
      ) ??
        false);

    const zoneIdEquals =
      this.zoneID === other.zoneID ||
      (this.zoneID?.equals(other.zoneID as ZoneID) ?? false);

    return usernameEquals && zoneIdEquals;
  }

  static builder(): MeasurementTagsBuilder {
    return new MeasurementTagsBuilder();
  }
}

class MeasurementTagsBuilder {
  #username?: HouseholdUserUsername;
  #zoneID?: ZoneID;

  withUsername(username?: HouseholdUserUsername): this {
    this.#username = username;
    return this;
  }

  withZoneID(zoneID?: ZoneID): this {
    this.#zoneID = zoneID;
    return this;
  }

  build(): MeasurementTags {
    return new MeasurementTags(this.#username, this.#zoneID);
  }
}
