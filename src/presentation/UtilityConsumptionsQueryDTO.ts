import { TimeString } from "@application/utils/TimeString";
import { TagsFilterDTO } from "@presentation/TagsFilterDTO";

export interface UtilityConsumptionsQueryDTO {
  label: string;
  utilityType: string;
  filter?: {
    granularity: TimeString;
  };
  tagsFilter?: TagsFilterDTO;
}
