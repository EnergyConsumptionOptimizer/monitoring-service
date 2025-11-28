import {
  getTimeStringAmount,
  getTimeStringUnit,
  TimeString,
  TimeUnit,
} from "@domain/utils/TimeString";

export function getStartOfPeriod(
  time: TimeString,
  defaultValue: string,
): string {
  const now = new Date();
  const result = new Date(now);

  const timeUnit = getTimeStringUnit(time);
  const timeAmount = getTimeStringAmount(time);

  if (timeAmount === 0) {
    return defaultValue;
  }

  switch (timeUnit) {
    case "minute":
    case "minutes": {
      result.setUTCMinutes(now.getUTCMinutes() - (timeAmount - 1));
      result.setUTCSeconds(0);
      result.setUTCMilliseconds(0);
      break;
    }

    case "hour":
    case "hours": {
      result.setUTCHours(now.getUTCHours() - (timeAmount - 1));
      result.setUTCMinutes(0);
      result.setUTCSeconds(0);
      result.setUTCMilliseconds(0);
      break;
    }

    case "day":
    case "days": {
      result.setUTCDate(now.getUTCDate() - (timeAmount - 1));
      result.setUTCHours(0, 0, 0, 0);
      break;
    }

    case "week":
    case "weeks": {
      const utcDay = now.getUTCDay();
      const daysToMonday = utcDay === 0 ? 6 : utcDay - 1;
      const totalDaysBack = daysToMonday + (timeAmount - 1) * 7;

      result.setUTCDate(now.getUTCDate() - totalDaysBack);
      result.setUTCHours(0, 0, 0, 0);
      break;
    }

    case "month":
    case "months": {
      result.setUTCMonth(now.getUTCMonth() - (timeAmount - 1));
      result.setUTCDate(1);
      result.setUTCHours(0, 0, 0, 0);
      break;
    }

    case "year":
    case "years": {
      result.setUTCFullYear(now.getUTCFullYear() - (timeAmount - 1));
      result.setUTCMonth(0);
      result.setUTCDate(1);
      result.setUTCHours(0, 0, 0, 0);
      break;
    }

    default:
      return defaultValue;
  }

  return result.toISOString();
}

export function getTimeStringMilliseconds(timeStr: TimeString): number {
  const amount = getTimeStringAmount(timeStr);
  const unit = getTimeStringUnit(timeStr);

  const msPerUnit: Record<TimeUnit, number> = {
    minute: 60 * 1000,
    minutes: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000,
  };

  return amount * msPerUnit[unit];
}
