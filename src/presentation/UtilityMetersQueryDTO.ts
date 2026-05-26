import { TagsFilterDTO } from "@presentation/TagsFilterDTO";
import { TimeString } from "@domain/TimeString";

export interface UtilityMetersQueryDTO {
  label: string;
  filter?: {
    from?: TimeString;
    to?: TimeString;
  };
  tagsFilter?: TagsFilterDTO;
}
