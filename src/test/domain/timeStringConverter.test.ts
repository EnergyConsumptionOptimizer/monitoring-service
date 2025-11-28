import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimeString } from "@domain/utils/TimeString";
import { getStartOfPeriod } from "@domain/utils/timeStringConverter";

describe("TimeRangeConverter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-22T10:30:30.000Z"));
  });

  describe("getStartOfPeriod", () => {
    it("should parse current minute", () => {
      const input: TimeString = "1minute";

      const result = getStartOfPeriod(input, "1h");

      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCMinutes()).toBe(currentTime.getUTCMinutes());
      expect(resultDate.getUTCMilliseconds()).toBe(0);
    });

    it("should parse minutes", () => {
      const amount = 5;
      const input: TimeString = `${amount}minutes`;

      const result = getStartOfPeriod(input, "1h");

      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCMinutes()).toBe(
        currentTime.getUTCMinutes() - (amount - 1),
      );
      expect(resultDate.getUTCMilliseconds()).toBe(0);
    });

    it("should parse current hour", () => {
      const input: TimeString = "1hour";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCHours()).toBe(currentTime.getUTCHours());
      expect(resultDate.getUTCMinutes()).toBe(0);
    });

    it("should parse current hours", () => {
      const amount = 5;
      const input: TimeString = `${amount}hours`;

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCHours()).toBe(
        currentTime.getUTCHours() - (amount - 1),
      );
      expect(resultDate.getUTCMinutes()).toBe(0);
    });

    it("should parse current day", () => {
      const input: TimeString = "1day";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCDay()).toBe(currentTime.getUTCDay());
      expect(resultDate.getUTCHours()).toBe(0);
      expect(resultDate.getUTCMinutes()).toBe(0);
    });

    it("should parse days", () => {
      const amount = 5;
      const input: TimeString = `${amount}days`;

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCDay()).toBe(
        currentTime.getUTCDay() - (amount - 1),
      );
      expect(resultDate.getUTCHours()).toBe(0);
      expect(resultDate.getUTCMinutes()).toBe(0);
    });

    it("should parse current month", () => {
      const input: TimeString = "1month";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      console.log("wtf", resultDate.getDate());

      expect(resultDate.getUTCMonth()).toBe(currentTime.getUTCMonth());
      expect(resultDate.getUTCDate()).toBe(1);
      expect(resultDate.getUTCHours()).toBe(0);
      expect(resultDate.getUTCMinutes()).toBe(0);
    });

    it("should parse year", () => {
      const input: TimeString = "1year";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getUTCFullYear()).toBe(currentTime.getUTCFullYear());
      expect(resultDate.getUTCMonth()).toBe(0);
      expect(resultDate.getUTCDate()).toBe(1);
      expect(resultDate.getUTCHours()).toBe(0);
      expect(resultDate.getUTCMinutes()).toBe(0);
    });
  });
});
