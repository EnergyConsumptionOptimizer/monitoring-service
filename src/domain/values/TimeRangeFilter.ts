import { TimeString } from "@domain/TimeString";

export class TimeRangeFilter {
  constructor(
    readonly from?: TimeString,
    readonly to?: TimeString,
  ) {}

  equals(other: TimeRangeFilter): boolean {
    const fromEquals = this.from === other.from;

    const toEquals = this.to === other.to;

    return fromEquals && toEquals;
  }

  static builder(): TimeRangeFilterBuilder {
    return new TimeRangeFilterBuilder();
  }
}

export class TimeRangeFilterBuilder {
  protected from?: TimeString;
  protected to?: TimeString;

  withFrom(from?: TimeString): this {
    this.from = from;
    return this;
  }

  withTo(to?: TimeString): this {
    this.to = to;
    return this;
  }

  build(): TimeRangeFilter {
    return new TimeRangeFilter(this.from, this.to);
  }
}
