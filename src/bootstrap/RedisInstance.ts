import { Redis } from "ioredis";
import { config } from "@bootstrap/config";
import { Logger } from "pino";

let instance: Redis | null = null;

export const getRedisInstance = (): Redis => {
  if (!instance) {
    instance = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
  }
  return instance;
};

export const connectToRedis = async (logger: Logger): Promise<void> => {
  const redis = getRedisInstance();
  redis.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
  });

  try {
    await redis.connect();
    logger.info("connected to Redis");
  } catch (err) {
    logger.error(
      { err },
      "Failed to connect to Redis; reads will use REST fallback",
    );
  }
};

export const disconnectFromRedis = async (): Promise<void> => {
  if (instance) {
    await instance.quit();
    instance = null;
  }
};
