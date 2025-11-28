export type TimeUnit =
  | "minute"
  | "minutes"
  | "hour"
  | "hours"
  | "day"
  | "days"
  | "week"
  | "weeks"
  | "month"
  | "months"
  | "year"
  | "years";

export type TimeString = `${number}${TimeUnit}`;

/**
 * Extracts the unit from a time string
 * @example getUnit("5minutes") // returns "minutes"
 */
export function getTimeStringUnit(timeStr: TimeString): TimeUnit {
  const unit = timeStr.replace(/[0-9\s]/g, "").toLowerCase();
  return unit as TimeUnit;
}

/**
 * Extracts the numeric amount from a time string
 * @example getAmount("5minutes") // returns 5
 */
export function getTimeStringAmount(timeStr: TimeString): number {
  const match = timeStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
