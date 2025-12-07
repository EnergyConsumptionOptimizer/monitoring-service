import { getTimeStringUnit, TimeString } from "@domain/utils/TimeString";

export const importTimeZone = `import "timezone"
option location = timezone.location(name: "Europe/Rome")`;

export function shouldImportTimeZone(timeSting: TimeString) {
  const unit = getTimeStringUnit(timeSting);

  return !(
    unit === "minute" ||
    unit === "minutes" ||
    unit === "hour" ||
    unit === "hours"
  );
}
