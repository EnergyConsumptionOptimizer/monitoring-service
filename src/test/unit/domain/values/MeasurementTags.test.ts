import { MeasurementTags } from "@domain/values/MeasurementTags";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { ZoneID } from "@domain/values/ZoneID";
import { describe, expect, it } from "vitest";

describe("MeasurementTags Builder", () => {
  it("should build an empty MeasurementTags object when no properties are set", () => {
    const result = MeasurementTags.builder().build();

    expect(result.householdUserUsername).toBeUndefined();
    expect(result.zoneID).toBeUndefined();
  });

  it("should build a MeasurementTags object with all properties set", () => {
    const mockUsername = { value: "testUser" } as HouseholdUserUsername;
    const mockZoneId = { value: "zone-1" } as ZoneID;

    const result = MeasurementTags.builder()
      .withUsername(mockUsername)
      .withZoneID(mockZoneId)
      .build();

    expect(result.householdUserUsername).toBe(mockUsername);
    expect(result.zoneID).toBe(mockZoneId);
  });
});
