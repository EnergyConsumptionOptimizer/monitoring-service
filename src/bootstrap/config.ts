import { z } from "zod";

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  INFLUXDB_HOST: z.string().default("localhost"),
  INFLUXDB_PORT: z.string().default("8086"),
  INFLUX_TOKEN: z.string().default(""),
  INFLUX_ORG: z.string().default(""),
  INFLUX_BUCKET: z.string().default(""),
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(""),
  REDIS_DB: z.coerce.number().default(0),
  KAFKA_CLIENT_ID: z.string().default("monitoring-service"),
  KAFKA_BOOTSTRAP_SERVERS: z.string().default("kafka:9092"),
  KAFKA_GROUP_ID: z.string().default("monitoring-service-group"),
  KAFKA_READMODEL_GROUP_ID: z
    .string()
    .default("monitoring-service-readmodel-group"),
  KAFKA_USER_TOPIC: z.string().default("user-events"),
  KAFKA_HOOKUP_TOPIC: z.string().default("smart-furniture-hookup-events"),
  KAFKA_ZONE_TOPIC: z.string().default("zone-events"),
  KAFKA_DLQ_TOPIC: z.string().default("monitoring-service-dlq"),
  USER_SERVICE_HOST: z.string().default("user"),
  USER_SERVICE_PORT: z.coerce.number().default(3000),
  MAP_SERVICE_HOST: z.string().default("map"),
  MAP_SERVICE_PORT: z.coerce.number().default(3000),
  HOOKUP_SERVICE_HOST: z.string().default("hookup"),
  HOOKUP_SERVICE_PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  NAME: z.string().default("monitoring-service"),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    JSON.stringify(result.error.issues, null, 2),
  );
  process.exit(1);
}

const env = result.data;

export const config = {
  port: env.PORT,
  influx: {
    uri: `http://${env.INFLUXDB_HOST}:${env.INFLUXDB_PORT}`,
    token: `${env.INFLUX_TOKEN}`,
    org: `${env.INFLUX_ORG}`,
    bucket: `${env.INFLUX_BUCKET}`,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
  kafka: {
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BOOTSTRAP_SERVERS.split(","),
    groupId: env.KAFKA_GROUP_ID,
    readModelGroupId: env.KAFKA_READMODEL_GROUP_ID,
    topics: {
      user: env.KAFKA_USER_TOPIC,
      hookup: env.KAFKA_HOOKUP_TOPIC,
      zone: env.KAFKA_ZONE_TOPIC,
      dlq: env.KAFKA_DLQ_TOPIC,
    },
  },
  userServiceUrl: `http://${env.USER_SERVICE_HOST}:${env.USER_SERVICE_PORT}`,
  hookupServiceUrl: `http://${env.HOOKUP_SERVICE_HOST}:${env.HOOKUP_SERVICE_PORT}`,
  mapServiceUrl: `http://${env.MAP_SERVICE_HOST}:${env.MAP_SERVICE_PORT}`,
  logLevel: env.LOG_LEVEL,
  appName: env.NAME,
} as const;

export type Config = typeof config;
