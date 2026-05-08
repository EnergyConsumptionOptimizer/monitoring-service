import { TimeString } from "@application/utils/TimeString";
import { TimeRangeFilter } from "@application/utils/TimeRangeFilter";

export interface TimeSeriesFilter extends TimeRangeFilter {
  granularity?: TimeString;
}
