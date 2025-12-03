import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";

export interface UtilityConsumptionsQueryDTO {
  label: string;
  utilityType: string;
  filter?: TimeSeriesFilter;
  tagFilter?: TagsFilter;
}
