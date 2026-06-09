import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";

export class RedisLock {
  readonly #redis: Redis;
  readonly #cachePrefix: string;
  #lockExtensionInterval: NodeJS.Timeout | null = null;

  constructor(redis: Redis, cachePrefix: string) {
    this.#redis = redis;
    this.#cachePrefix = cachePrefix;
  }

  #syncLockKey(): string {
    return `${this.#cachePrefix}sync:lock`;
  }

  async acquireSyncLock(ttlMs = 30_000): Promise<string | null> {
    const token = randomUUID();
    const result = await this.#redis.set(
      this.#syncLockKey(),
      token,
      "PX",
      ttlMs,
      "NX",
    );
    if (result !== "OK") return null;

    const interval = setInterval(async () => {
      const extended = await this.extendSyncLock(token, ttlMs);
      if (!extended) {
        clearInterval(interval);
        this.#lockExtensionInterval = null;
      }
    }, ttlMs / 2);
    this.#lockExtensionInterval = interval;

    return token;
  }

  async extendSyncLock(token: string, ttlMs = 30_000): Promise<boolean> {
    const result = await this.#redis.eval(
      'if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("pexpire",KEYS[1],ARGV[2]) else return 0 end',
      1,
      this.#syncLockKey(),
      token,
      String(ttlMs),
    );
    return result === 1;
  }

  async isLockHeld(): Promise<boolean> {
    return (await this.#redis.exists(this.#syncLockKey())) === 1;
  }

  async releaseSyncLock(token: string): Promise<void> {
    const interval = this.#lockExtensionInterval;
    if (interval) {
      clearInterval(interval);
      this.#lockExtensionInterval = null;
    }
    await this.#redis.eval(
      'if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end',
      1,
      this.#syncLockKey(),
      token,
    );
  }
}
