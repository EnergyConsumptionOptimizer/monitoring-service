import { Logger } from "pino";
import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";
import { ReadModelSynchronizer } from "@infrastructure/persistence/redis/ReadModelSynchronizer";
import {
  SmartFurnitureHookupDTO,
  SmartFurnitureHookupService,
} from "@application/outbound/SmartFurnitureHookupService";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";

export class RedisSmartFurnitureHookupService implements SmartFurnitureHookupService {
  readonly #store: RedisReadModelStore;
  readonly #synchronizer: ReadModelSynchronizer;
  readonly #logger?: Logger;

  constructor(
    store: RedisReadModelStore,
    synchronizer: ReadModelSynchronizer,
    logger?: Logger,
  ) {
    this.#store = store;
    this.#synchronizer = synchronizer;
    this.#logger = logger?.child({
      component: "RedisSmartFurnitureHookupService",
    });
  }

  async getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookupDTO | undefined | Error> {
    return await this.#getSmartFurnitureHookupFromCache(
      smartFurnitureHookupID.value,
    );
  }

  async #getSmartFurnitureHookupFromCache(
    smartFurnitureHookupID: string,
    attempt = 1,
  ): Promise<SmartFurnitureHookupDTO | undefined | Error> {
    const cached = await this.#store.getSmartFurnitureHookupById(
      smartFurnitureHookupID,
    );

    if (cached) return cached;

    if (attempt <= 0) return undefined;

    this.#logger?.debug(
      { hookup: smartFurnitureHookupID },
      "Hookup not in cache — triggering sync",
    );

    await this.#synchronizer.syncHookups();

    return this.#getSmartFurnitureHookupFromCache(
      smartFurnitureHookupID,
      attempt - 1,
    );
  }
}
