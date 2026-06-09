import { Redis } from "ioredis";
import { Logger } from "pino";
import { UserReadModel } from "@infrastructure/persistence/redis/models/UserReadModel";
import { SmartFurnitureHookupReadModel } from "@infrastructure/persistence/redis/models/SmartFurnitureHookupReadModel";
import { SmartFurnitureHookupAssociateZone } from "@infrastructure/persistence/redis/models/MapReadModel";
import { RedisLock } from "@infrastructure/persistence/redis/RedisLock";
import { ReadModelStore } from "@infrastructure/persistence/ReadModelStore";

export class RedisReadModelStore implements ReadModelStore {
  readonly #redis: Redis;
  readonly #logger?: Logger;

  readonly #CACHE_PREFIX = "monitoring:readmodel";

  readonly #redisLock: RedisLock;

  constructor(redis: Redis, logger?: Logger) {
    this.#redis = redis;
    this.#logger = logger?.child({ component: "RedisReadModelStore" });
    this.#redisLock = new RedisLock(redis, this.#CACHE_PREFIX);
  }

  get redisLock(): RedisLock {
    return this.#redisLock;
  }

  #userUsernameKey(username: string): string {
    return `${this.#CACHE_PREFIX}:user:${username}`;
  }

  #hookupKey(hookupId: string): string {
    return `${this.#CACHE_PREFIX}:hookup:${hookupId}`;
  }

  #hookupZoneKey(hookupId: string): string {
    return `${this.#CACHE_PREFIX}:hookup_zone:${hookupId}`;
  }

  #zoneHookupsKey(zoneId: string): string {
    return `${this.#CACHE_PREFIX}:zone:${zoneId}`;
  }

  async setUser(user: UserReadModel): Promise<void> {
    await this.#redis.set(this.#userUsernameKey(user.username), user.id);
    this.#logger?.debug(
      { username: user.username },
      "User written to read model",
    );
  }

  async setSmartFurnitureHookup(
    hookup: SmartFurnitureHookupReadModel,
  ): Promise<void> {
    await this.#redis.set(this.#hookupKey(hookup.id), JSON.stringify(hookup));
    this.#logger?.debug(
      { hookup: hookup.id },
      "Smart Furniture Hookup written to read model",
    );
  }

  async setSmartFurnitureHookupZone(
    hookupZone: SmartFurnitureHookupAssociateZone,
  ): Promise<void> {
    const existing = await this.getSmartFurnitureHookupZoneByHookupId(
      hookupZone.hookupId,
    );
    const pipeline = this.#redis.pipeline();

    pipeline.set(
      this.#hookupZoneKey(hookupZone.hookupId),
      JSON.stringify(hookupZone),
    );

    if (existing?.zoneId) {
      pipeline.srem(this.#zoneHookupsKey(existing.zoneId), hookupZone.hookupId);
    }

    if (hookupZone.zoneId) {
      pipeline.sadd(
        this.#zoneHookupsKey(hookupZone.zoneId),
        hookupZone.hookupId,
      );
    }

    await pipeline.exec();
    this.#logger?.debug(
      { hookup: hookupZone.hookupId },
      "Smart Furniture Hookup with Zone written to read model",
    );
  }

  async getUserIdByUsername(username: string): Promise<string | null> {
    return this.#redis.get(this.#userUsernameKey(username));
  }

  async getSmartFurnitureHookupById(
    hookupId: string,
  ): Promise<SmartFurnitureHookupReadModel | null> {
    const raw = await this.#redis.get(this.#hookupKey(hookupId));
    return raw ? (JSON.parse(raw) as SmartFurnitureHookupReadModel) : null;
  }

  async getSmartFurnitureHookupZoneByHookupId(
    hookupId: string,
  ): Promise<SmartFurnitureHookupAssociateZone | null> {
    const raw = await this.#redis.get(this.#hookupZoneKey(hookupId));
    return raw ? (JSON.parse(raw) as SmartFurnitureHookupAssociateZone) : null;
  }

  async deleteUser(username: string): Promise<void> {
    await this.#redis.del(this.#userUsernameKey(username));
    this.#logger?.debug({ username }, "User removed from read model");
  }

  async deleteSmartFurnitureHookup(hookupId: string): Promise<void> {
    const hookupZone =
      await this.getSmartFurnitureHookupZoneByHookupId(hookupId);

    const pipeline = this.#redis.pipeline();

    pipeline.del(this.#hookupKey(hookupId));
    pipeline.del(this.#hookupZoneKey(hookupId));

    if (hookupZone?.zoneId) {
      pipeline.srem(this.#zoneHookupsKey(hookupZone.zoneId), hookupId);
    }

    await pipeline.exec();
  }

  async deleteZone(zoneId: string): Promise<void> {
    const key = this.#zoneHookupsKey(zoneId);
    const hookupIds = await this.#redis.smembers(key);

    const pipeline = this.#redis.pipeline();

    for (const id of hookupIds) {
      pipeline.del(this.#hookupZoneKey(id));
    }

    pipeline.del(key);

    await pipeline.exec();

    this.#logger?.debug(
      { zoneId, affectedHookups: hookupIds.length },
      "Zone deleted",
    );
  }

  async updateSmartFurnitureHookupZone(
    hookupId: string,
    zoneId: string | null,
  ): Promise<void> {
    await this.setSmartFurnitureHookupZone({
      hookupId,
      zoneId,
    });
  }
}
