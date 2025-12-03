import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";

export interface UtilityMetersQueryDTO {
  label: string;
  utilityType: string;
  filter?: TimeRangeFilter;
  tagFilter?: TagsFilter;
}
