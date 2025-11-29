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
      result.setMinutes(now.getMinutes() - (timeAmount - 1));
      result.setSeconds(0);
      result.setMilliseconds(0);
      break;
    }

    case "hour":
    case "hours": {
      result.setHours(now.getHours() - (timeAmount - 1));
      result.setMinutes(0);
      result.setSeconds(0);
      result.setMilliseconds(0);
      break;
    }

    case "day":
    case "days": {
      result.setDate(now.getDate() - (timeAmount - 1));
      result.setHours(0, 0, 0, 0);
      break;
    }

    case "week":
    case "weeks": {
      const day = now.getDay();
      const daysToMonday = day === 0 ? 6 : day - 1;
      const totalDaysBack = daysToMonday + (timeAmount - 1) * 7;

      result.setDate(now.getDate() - totalDaysBack);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case "month":
    case "months": {
      result.setMonth(now.getMonth() - (timeAmount - 1));
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    }

    case "year":
    case "years": {
      result.setFullYear(now.getFullYear() - (timeAmount - 1));
      result.setMonth(0);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
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
