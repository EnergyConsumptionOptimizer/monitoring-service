import { TagsFilterDTO } from "@presentation/TagsFilterDTO";
import { TimeString } from "@domain/utils/TimeString";

export interface UtilityMetersQueryDTO {
  label: string;
  utilityType: string;
  filter?: {
    from?: TimeString;
    to?: TimeString;
  };
  tagsFilter?: TagsFilterDTO;
}
