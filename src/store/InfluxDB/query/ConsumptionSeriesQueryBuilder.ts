import { UtilityType } from "@domain/UtilityType";
import { MeasurementTag } from "../MeasurementTag";
import { TimeString } from "@domain/utils/TimeString";
import { getStartOfPeriod } from "@domain/utils/timeStringConverter";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { convertToUnitFormat } from "./TimeRangeInfluxConverter";
import { mapToLocalTime, mapToUTC, shouldMapToLocalTime } from "./utils";

export class ConsumptionSeriesQueryBuilder {
  private readonly DEFAULT_START = "0";
  private readonly DEFAULT_WINDOW = "1h";
  private readonly DEFAULT_STOP = "0s";

  private from: string;
  private start: string;
  private filters?: string;
  private utilityType: string;
  private stop?: string;
  private windowSize: string;
  private windowCreateEmpty?: string;
  private shouldApplyMap?: boolean;

  private constructor(bucket: string) {
    this.from = `from(bucket: "${bucket}")`;
    this.start = this.DEFAULT_START;
    this.windowSize = this.DEFAULT_WINDOW;
    this.utilityType = UtilityType.ELECTRICITY;
  }

  static forBucket(bucket: string): ConsumptionSeriesQueryBuilder {
    return new ConsumptionSeriesQueryBuilder(bucket);
  }

  build(): string {
    const map = this.shouldApplyMap ? mapToLocalTime : undefined;
    const matToUtc = this.shouldApplyMap ? mapToUTC : undefined;
    return [
      map ? 'import "date"' : "",
      this.from,
      `|> range(start: ${this.start}${this.stop ? `, stop: ${this.stop}` : ""})`,
      `|> filter(fn: (r) => r._measurement == "${this.utilityType}" and r._field == "value" ${this.filters ?? ""})`,
      map ?? "",
      `|> window(every: ${this.windowSize} ${this.windowCreateEmpty ?? ""})`,
      `|> group(columns: ["${MeasurementTag.SMART_FURNITURE_HOOKUP_ID}", "_start", "_stop"])
|> integral(unit: 1h)
|> group(columns: [ "_start"])
|> sum(column: "_value")
|> duplicate(column: "_start", as: "_time", )
|> window(every: inf)
|> keep(columns: ["_time", "_value"])`,
      matToUtc ?? "",
    ].join("\n");
  }

  withUtility(utilityType: UtilityType): ConsumptionSeriesQueryBuilder {
    this.utilityType = utilityType;

    return this;
  }

  withStart(from?: TimeString): ConsumptionSeriesQueryBuilder {
    if (!from) {
      return this;
    }

    this.start = getStartOfPeriod(from, this.DEFAULT_START);
    this.windowCreateEmpty = ", createEmpty: true";

    this.shouldApplyMap = shouldMapToLocalTime(from);

    return this;
  }

  withStop(to?: TimeString): ConsumptionSeriesQueryBuilder {
    if (!to) {
      return this;
    }

    this.stop = getStartOfPeriod(to, this.DEFAULT_STOP);

    this.shouldApplyMap = shouldMapToLocalTime(to);

    return this;
  }

  withUser(username?: HouseholdUserUsername): ConsumptionSeriesQueryBuilder {
    if (!username) {
      return this;
    }

    if (!this.filters) this.filters = "";

    this.filters += ` and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} == "${username.value()}"`;

    return this;
  }

  withWindow(granularity?: TimeString): ConsumptionSeriesQueryBuilder {
    if (!granularity) {
      return this;
    }

    this.windowSize = convertToUnitFormat(granularity, this.DEFAULT_WINDOW);

    return this;
  }
}
