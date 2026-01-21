import "dotenv/config";
import {
  influxDBClient,
  realTimeNamespace,
  utilityConsumptionsNamespace,
  utilityMetersNamespace,
} from "@interfaces/dependencies";
import http from "http";
import { Server } from "socket.io";
import { SocketsNamespaceManager } from "@interfaces/web-sockets/SocketsNamespaceManager";
import app from "./app";

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const socketManager = new SocketsNamespaceManager(io);

socketManager.registerNamespaces([
  realTimeNamespace,
  utilityConsumptionsNamespace,
  utilityMetersNamespace,
]);

const config = {
  port: process.env.PORT || 3000,
  influxHOST: process.env.INFLUXDB_HOST,
  influxPORT: process.env.INFLUXDB_PORT,
};

if (!config.influxHOST && !config.influxPORT) {
  console.error(
    "influxHOST or influxPORT are not defined in environment variables.",
  );
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
