import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";
import { MapService, ZoneIdDTO } from "@application/outbound/MapService";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";

export class RedisMapService implements MapService {
  readonly #store: RedisReadModelStore;

  constructor(store: RedisReadModelStore) {
    this.#store = store;
  }

  async isSmartFurnitureHookupInAZone(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<ZoneIdDTO | null> {
    const cached = await this.#store.getSmartFurnitureHookupZoneByHookupId(
      smartFurnitureHookupID.value,
    );

    if (!cached || !cached.zoneId) {
      return null;
    }

    return {
      zoneID: cached.zoneId,
    };
  }
}
