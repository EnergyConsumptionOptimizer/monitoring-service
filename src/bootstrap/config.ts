import { z } from "zod";

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  INFLUXDB_HOST: z.string().default("localhost"),
  INFLUXDB_PORT: z.string().default("8086"),
  INFLUX_TOKEN: z.string().default(""),
  INFLUX_ORG: z.string().default(""),
  INFLUX_BUCKET: z.string().default(""),
  KAFKA_CLIENT_ID: z.string().default("monitoring-service"),
  KAFKA_BOOTSTRAP_SERVERS: z.string().default("kafka:9092"),
  KAFKA_GROUP_ID: z.string().default("monitoring-service-group"),
  USER_SERVICE_HOST: z.string().default("user"),
  USER_SERVICE_PORT: z.coerce.number().default(3000),
  MAP_SERVICE_HOST: z.string().default("map"),
  MAP_SERVICE_PORT: z.coerce.number().default(3001),
  HOOKUP_SERVICE_HOST: z.string().default("hookup"),
  HOOKUP_SERVICE_PORT: z.coerce.number().default(3002),
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
  kafka: {
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BOOTSTRAP_SERVERS.split(","),
    groupId: env.KAFKA_GROUP_ID,
  },
  userServiceUrl: `http://${env.USER_SERVICE_HOST}:${env.USER_SERVICE_PORT}`,
  hookupServiceUrl: `http://${env.HOOKUP_SERVICE_HOST}:${env.HOOKUP_SERVICE_PORT}`,
  mapServiceUrl: `http://${env.MAP_SERVICE_HOST}:${env.MAP_SERVICE_PORT}`,
  logLevel: env.LOG_LEVEL,
  appName: env.NAME,
} as const;

export type Config = typeof config;
