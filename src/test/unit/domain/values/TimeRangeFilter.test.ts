import { describe, expect, it } from "vitest";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { TimeString } from "@domain/TimeString";

describe("TimeRangeFilter Builder", () => {
  it("should build an empty TimeRangeFilter object when no properties are set", () => {
    const result = TimeRangeFilter.builder().build();

    expect(result.from).toBeUndefined();
    expect(result.to).toBeUndefined();
  });

  it("should build a TimeRangeFilter object with all properties set", () => {
    const mockFrom = "4hours" as TimeString;
    const mockTo = "2hours" as TimeString;

    const result = TimeRangeFilter.builder()
      .withFrom(mockFrom)
      .withTo(mockTo)
      .build();

    expect(result.from).toBe(mockFrom);
    expect(result.to).toBe(mockTo);
  });
});
