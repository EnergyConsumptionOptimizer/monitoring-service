import { UtilityType } from "@domain/UtilityType";
import { MeasurementTag } from "../MeasurementTag";
import { getTimeStringAmount, TimeString } from "@domain/utils/TimeString";
import { getStartOfPeriod } from "@domain/utils/timeStringConverter";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { convertToUnitFormat } from "./TimeRangeInfluxConverter";
import { importTimeZone, shouldImportTimeZone } from "./utils";
import { ZoneID } from "@domain/ZoneID";

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
  private shouldApplyTimeZone = false;

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
    return [
      this.shouldApplyTimeZone ? importTimeZone : "",
      this.from,
      `|> range(start: ${this.start}${this.stop ? `, stop: ${this.stop}` : ""})`,
      `|> filter(fn: (r) => r._measurement == "${this.utilityType}" and r._field == "value" ${this.filters ?? ""})`,
      `|> window(every: ${this.windowSize} ${this.windowCreateEmpty ?? ""})`,
      `|> group(columns: ["${MeasurementTag.SMART_FURNITURE_HOOKUP_ID}", "_start", "_stop"])
|> integral(unit: 1h)
|> group(columns: [ "_start"])
|> sum(column: "_value")
|> duplicate(column: "_start", as: "_time", )
|> window(every: inf)
|> keep(columns: ["_time", "_value"])`,
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
    this.windowCreateEmpty =
      this.start != this.DEFAULT_START ? ", createEmpty: true" : undefined;

    this.shouldApplyTimeZone = shouldImportTimeZone(from);

    return this;
  }

  withStop(to?: TimeString): ConsumptionSeriesQueryBuilder {
    if (!to) {
      return this;
    }

    this.stop = getStartOfPeriod(to, this.DEFAULT_STOP);

    this.shouldApplyTimeZone = shouldImportTimeZone(to);

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

  withZone(zoneID?: ZoneID): ConsumptionSeriesQueryBuilder {
    if (!zoneID) {
      return this;
    }

    if (!this.filters) this.filters = "";

    this.filters += ` and r.${MeasurementTag.ZONE_ID} == "${zoneID.value()}"`;

    return this;
  }

  withWindow(granularity?: TimeString): ConsumptionSeriesQueryBuilder {
    if (!granularity || getTimeStringAmount(granularity) < 1) {
      return this;
    }

    this.windowSize = convertToUnitFormat(granularity, this.DEFAULT_WINDOW);

    return this;
  }
}
