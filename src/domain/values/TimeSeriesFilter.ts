import { TimeString } from "@domain/TimeString";
import {
  TimeRangeFilter,
  TimeRangeFilterBuilder,
} from "@domain/values/TimeRangeFilter";

export class TimeSeriesFilter extends TimeRangeFilter {
  constructor(
    readonly from?: TimeString,
    readonly to?: TimeString,
    readonly granularity?: TimeString,
  ) {
    super(from, to);
  }

  equals(other: TimeSeriesFilter): boolean {
    const baseEquals = super.equals(other);

    const granularityEquals = this.granularity === other.granularity;

    return baseEquals && granularityEquals;
  }

  static builder(): TimeSeriesFilterBuilder {
    return new TimeSeriesFilterBuilder();
  }
}

class TimeSeriesFilterBuilder extends TimeRangeFilterBuilder {
  #granularity?: TimeString;

  withGranularity(granularity?: TimeString): this {
    this.#granularity = granularity;
    return this;
  }

  build(): TimeSeriesFilter {
    return new TimeSeriesFilter(this.from, this.to, this.#granularity);
  }
}
