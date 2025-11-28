import { TimeString } from "@domain/utils/TimeString";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";

export interface TimeSeriesFilter extends TimeRangeFilter {
  granularity?: TimeString;
}
