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

      expect(resultDate.getMinutes()).toBe(currentTime.getMinutes());
      expect(resultDate.getMilliseconds()).toBe(0);
    });

    it("should parse minutes", () => {
      const amount = 5;
      const input: TimeString = `${amount}minutes`;

      const result = getStartOfPeriod(input, "1h");

      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getMinutes()).toBe(
        currentTime.getMinutes() - (amount - 1),
      );
      expect(resultDate.getMilliseconds()).toBe(0);
    });

    it("should parse current hour", () => {
      const input: TimeString = "1hour";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getHours()).toBe(currentTime.getHours());
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should parse current hours", () => {
      const amount = 5;
      const input: TimeString = `${amount}hours`;

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getHours()).toBe(currentTime.getHours() - (amount - 1));
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should parse current day", () => {
      const input: TimeString = "1day";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getDay()).toBe(currentTime.getDay());
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should parse days", () => {
      const amount = 5;
      const input: TimeString = `${amount}days`;

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getDay()).toBe(currentTime.getDay() - (amount - 1));
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should parse current month", () => {
      const input: TimeString = "1month";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getMonth()).toBe(currentTime.getMonth());
      expect(resultDate.getDate()).toBe(1);
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
    });

    it("should parse year", () => {
      const input: TimeString = "1year";

      const result = getStartOfPeriod(input, "1h");
      const resultDate = new Date(result);
      const currentTime = new Date();

      expect(resultDate.getFullYear()).toBe(currentTime.getFullYear());
      expect(resultDate.getMonth()).toBe(0);
      expect(resultDate.getDate()).toBe(1);
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
    });
  });
});
