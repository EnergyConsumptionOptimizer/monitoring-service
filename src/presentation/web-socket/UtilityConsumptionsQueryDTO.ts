import { TimeString } from "@domain/utils/TimeString";
import { TagsFilterDTO } from "@presentation/TagsFilterDTO";

export interface UtilityConsumptionsQueryDTO {
  label: string;
  utilityType: string;
  filter?: {
    granularity: TimeString;
  };
  tagsFilter?: TagsFilterDTO;
}
