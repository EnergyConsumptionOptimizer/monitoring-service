import { Logger } from "pino";
import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";
import { ReadModelService } from "@infrastructure/persistence/redis/ReadModelService";

export class ReadModelSynchronizer {
  readonly #store: RedisReadModelStore;
  readonly #readModelService: ReadModelService;
  readonly #logger?: Logger;

  constructor(
    store: RedisReadModelStore,
    readModelService: ReadModelService,
    logger?: Logger,
  ) {
    this.#store = store;
    this.#readModelService = readModelService;
    this.#logger = logger?.child({ component: "ReadModelSynchronizer" });
  }

  async syncAll(): Promise<void> {
    const token = await this.#store.redisLock.acquireSyncLock();
    if (!token) {
      this.#logger?.debug("Sync lock already held — waiting for completion");
      await this.#waitForLockRelease();
      return;
    }
    try {
      this.#logger?.info("Starting full read model synchronization");
      const [users, hookups, hookupsWithZones] = await Promise.all([
        this.#readModelService.fetchAllHouseholdUsers(),
        this.#readModelService.fetchAllSmartFurnitureHookups(),
        this.#readModelService.fetchAllSmartFurnitureHookupsAssociateZone(),
      ]);
      await Promise.all([
        ...users.map((u) => this.#store.setUser(u)),
        ...hookups.map((h) => this.#store.setSmartFurnitureHookup(h)),
        ...hookupsWithZones.map((h) =>
          this.#store.setSmartFurnitureHookupZone(h),
        ),
      ]);
      this.#logger?.info("Full read model synchronization complete");
    } finally {
      await this.#store.redisLock.releaseSyncLock(token);
    }
  }

  async syncHookups(): Promise<void> {
    const token = await this.#store.redisLock.acquireSyncLock();
    if (!token) {
      this.#logger?.debug("Sync lock already held — waiting for completion");
      await this.#waitForLockRelease();
      return;
    }
    try {
      this.#logger?.info("Starting smart furniture hookups synchronization");
      const hookups =
        await this.#readModelService.fetchAllSmartFurnitureHookups();
      await Promise.all(
        hookups.map((h) => this.#store.setSmartFurnitureHookup(h)),
      );
      this.#logger?.info("Smart furniture hookups synchronization complete");
    } finally {
      await this.#store.redisLock.releaseSyncLock(token);
    }
  }

  #sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async #waitForLockRelease(): Promise<void> {
    while (await this.#store.redisLock.isLockHeld()) {
      await this.#sleep(200);
    }
  }
}
