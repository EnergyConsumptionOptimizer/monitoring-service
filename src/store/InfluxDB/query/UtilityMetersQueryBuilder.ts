import { TimeString } from "@domain/utils/TimeString";
import { getStartOfPeriod } from "@domain/utils/timeStringConverter";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { MeasurementTag } from "../MeasurementTag";
import { mapToLocalTime, shouldMapToLocalTime } from "./utils";

/**
 * UtilityMetersQueryBuilder
 * -------------------------
 * A small builder utility for constructing Flux queries targeting InfluxDB
 * for utility-meter data.
 *
 * It provides a fluent API that allows to:
 *  - select a buck
 *  - optionally filter by household user
 *  - choose between *last value* queries or *cumulative (integral)* queries,
 *    depending on whether a custom start/stop time is provided
 *
 * @example
 * from(bucket: "utility")
 * |> range(start: -25s)
 * |> filter(fn: (r) => r._field == "value")
 * |> last()
 * |> group(columns: ["_measurement"])
 * |> sum()

 * @example
 * import "date"
 *
 * from(bucket: "utility")
 * |> range(start: 2025-11-28T00:01:00Z)
 * |> filter(fn: (r) => r._field == "value" and r.householdUserUsername == "alice")
 * |> map(fn: (r) => {
 *   m = date.month(t: r._time)
 *   offset = if m >= 4 and m <= 9 then 2h else 1h
 *   return { r with _time: date.add(d:offset, to:r._time)}
 * }
 * |> integral(unit: 1h)
 * |> group(columns: ["_measurement"])
 * |> sum()
 */

export class UtilityMetersQueryBuilder {
  private readonly DEFAULT_START = "1h";
  private readonly DEFAULT_STOP = "0s";

  private from: string;
  private start: string;
  private filters?: string;
  private tail: string;
  private stop?: string;
  private shouldApplyMap?: boolean;

  private constructor(bucket: string) {
    this.from = `from(bucket: "${bucket}")`;
    this.start = "-25s";
    this.tail = `|> last()
|> group(columns: ["_measurement"])
|> sum()`;
  }

  static forBucket(bucket: string): UtilityMetersQueryBuilder {
    return new UtilityMetersQueryBuilder(bucket);
  }

  build(): string {
    const map = this.shouldApplyMap ? mapToLocalTime : undefined;

    return [
      map ? 'import "date"' : "",
      this.from,
      `|> range(start: ${this.start}${this.stop ? `, stop: ${this.stop}` : ""})`,
      `|> filter(fn: (r) => r._field == "value"${this.filters ?? ""})`,
      map ?? "",
      this.tail,
    ].join("\n");
  }

  withStart(from?: TimeString): UtilityMetersQueryBuilder {
    if (!from) {
      return this;
    }

    this.start = getStartOfPeriod(from, this.DEFAULT_START);

    this.shouldApplyMap = shouldMapToLocalTime(from);

    this.cumulativeTail();

    return this;
  }

  withStop(to?: TimeString): UtilityMetersQueryBuilder {
    if (!to) {
      return this;
    }

    this.stop = getStartOfPeriod(to, this.DEFAULT_STOP);

    this.shouldApplyMap = shouldMapToLocalTime(to);
    this.cumulativeTail();

    return this;
  }

  private cumulativeTail() {
    this.tail = `|> integral(unit: 1h)
|> group(columns: ["_measurement"])
|> sum()`;
  }

  withUser(username?: HouseholdUserUsername): UtilityMetersQueryBuilder {
    if (!username) {
      return this;
    }

    if (!this.filters) this.filters = "";

    this.filters += ` and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} == "${username.value()}"`;

    return this;
  }
}
