import "dotenv/config";
import express from "express";
import { apiRouter, influxDBClient } from "@interfaces/web-api/dependencies";
import { errorHandler } from "@interfaces/web-api/middlewares/errorHandlerMiddleware";

const app = express();
app.use(express.json());
app.use(apiRouter);
app.use(errorHandler);

const config = {
  port: process.env.PORT || 3000,
  influxURL: process.env.INFLUX_URL,
};

if (!config.influxURL) {
  console.error("INFLUX_URL is not defined in environment variables.");
  process.exit(1);
}

const connectDatabase = async () => {
  const connection = await influxDBClient.checkConnection();
  if (!connection) {
    process.exit(1);
  }

  console.log("Connected to Database");
};

const launchServer = () => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

const start = () => {
  connectDatabase().then(() => launchServer());
};

start();
