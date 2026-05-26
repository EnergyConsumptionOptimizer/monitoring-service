import { describe, expect, it } from "vitest";
import { TimeString } from "@domain/TimeString";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";

describe("TimeSeriesFilter Builder", () => {
  it("should build an empty TimeSeriesFilter object when no properties are set", () => {
    const result = TimeSeriesFilter.builder().build();

    expect(result.from).toBeUndefined();
    expect(result.to).toBeUndefined();
    expect(result.granularity).toBeUndefined();
  });

  it("should build a TimeSeriesFilter object with all properties set", () => {
    const mockFrom = "4hours" as TimeString;
    const mockTo = "2hours" as TimeString;
    const mockGranularity = "1day" as TimeString;

    const result = TimeSeriesFilter.builder()
      .withFrom(mockFrom)
      .withTo(mockTo)
      .withGranularity(mockGranularity)
      .build();

    expect(result.from).toBe(mockFrom);
    expect(result.to).toBe(mockTo);
    expect(result.granularity).toBe(mockGranularity);
  });
});
