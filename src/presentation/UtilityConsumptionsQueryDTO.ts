import { TimeString } from "@domain/TimeString";
import { TagsFilterDTO } from "@presentation/TagsFilterDTO";

export interface UtilityConsumptionsQueryDTO {
  label: string;
  utilityType: string;
  filter?: {
    from?: TimeString;
    to?: TimeString;
    granularity?: TimeString;
  };
  tagsFilter?: TagsFilterDTO;
}
