import { getTimeStringUnit, TimeString } from "@domain/utils/TimeString";

export const mapToLocalTime = `  |> map(fn: (r) => {
  m = date.month(t: r._time)
  offset = if m >= 4 and m <= 9 then 2h else 1h
  return { r with _time: date.add(d:offset, to:r._time) }
})`;

export function shouldMapToLocalTime(timeSting: TimeString) {
  const unit = getTimeStringUnit(timeSting);

  if (
    unit === "minute" ||
    unit === "minutes" ||
    unit === "hour" ||
    unit === "hours"
  ) {
    return undefined;
  } else return true;
}

export const mapToUTC = `|> map(fn: (r) => {
  m = date.month(t: r._time)
  offset = if m >= 4 and m <= 9 then 2h else 1h
  return { r with _time: date.sub(d:offset, from:r._time) }
})`;
