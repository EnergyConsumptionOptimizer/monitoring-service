import {
  getTimeStringAmount,
  getTimeStringUnit,
  TimeString,
  TimeUnit,
} from "@domain/utils/TimeString";

export const TIME_UNIT_MAP = new Map<TimeUnit, string>([
  ["minute", "m"],
  ["minutes", "m"],
  ["hour", "h"],
  ["hours", "h"],
  ["day", "d"],
  ["days", "d"],
  ["week", "w"],
  ["weeks", "w"],
  ["month", "mo"],
  ["months", "mo"],
  ["year", "y"],
  ["years", "y"],
]);

export function convertToUnitFormat(
  timeStr: TimeString,
  defaultValue: string,
): string {
  const unit = getTimeStringUnit(timeStr);
  const amount = getTimeStringAmount(timeStr);

  const shortUnit = TIME_UNIT_MAP.get(unit);

  if (!shortUnit) {
    return defaultValue;
  }

  return `${amount}${shortUnit}`;
}
