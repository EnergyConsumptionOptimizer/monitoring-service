import { InfluxDBClient } from "@infrastructure/persistence/influxDB/InfluxDBClient";
import { config } from "@bootstrap/config";
import { Logger } from "pino";

let instance: InfluxDBClient | null = null;

export const getInfluxDBClientInstance = (): InfluxDBClient => {
  if (!instance) {
    instance = new InfluxDBClient(
      config.influx.uri,
      config.influx.token,
      config.influx.org,
      config.influx.bucket,
    );
  }
  return instance;
};

export const connectToInfluxDatabase = async (logger: Logger) => {
  getInfluxDBClientInstance()
    .checkConnection()
    .then(() => {
      logger.info("connected to InfluxDB");
    })
    .catch((err) => {
      logger.fatal({ err }, `Failed to connect to InfluxDB +${err}`);
      logger.fatal(
        { err },
        `${config.influx.uri} : ${config.influx.bucket} + ${config.influx.token} + ${config.influx.org}`,
      );
      process.exit(1);
    });
};
