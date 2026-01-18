import { TagsFilter } from "@domain/utils/TagsFilter";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";

export interface TagsFilterDTO {
  username?: string;
  zone?: string;
}

export const UtilityConsumptionMapper = {
  toDomain(tagsFilterDTO: TagsFilterDTO): TagsFilter {
    const { username, zone } = tagsFilterDTO || {};
    return {
      username: username ? new HouseholdUserUsername(username) : undefined,
      zoneID: zone ? new ZoneID(zone) : undefined,
    };
  },
};
