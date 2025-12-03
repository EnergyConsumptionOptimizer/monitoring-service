import "dotenv/config";
import express from "express";
import {
  apiRouter,
  influxDBClient,
  realTimeNamespace,
  utilityConsumptionsNamespace,
} from "@interfaces/dependencies";
import { errorHandler } from "@interfaces/web-api/middlewares/errorHandlerMiddleware";
import http from "http";
import { Server } from "socket.io";
import { SocketsNamespaceManager } from "@interfaces/web-sockets/SocketsNamespaceManager";

const app = express();
app.use(express.json());
app.use(apiRouter);
app.use(errorHandler);

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    origin: "*",
  },
});

const socketManager = new SocketsNamespaceManager(io);

socketManager.registerNamespaces([
  realTimeNamespace,
  utilityConsumptionsNamespace,
]);

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
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

const start = () => {
  connectDatabase().then(() => launchServer());
};

start();
