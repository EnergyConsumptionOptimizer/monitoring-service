import pino from "pino";
import { MockedObject, vi } from "vitest";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { MapService } from "@application/outbound/MapService";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import http from "http";
import { Server } from "socket.io";
import { SocketsNamespaceManager } from "@presentation/web-sockets/SocketsNamespaceManager";
import {
  createApplicationLayer,
  createInfrastructureLayer,
  createPresentationLayer,
} from "@bootstrap/composeServer";
import { createApp } from "@bootstrap/app";
import { GenericContainer, Wait } from "testcontainers";
import { InfluxDBClient } from "@storage/influxDB/InfluxDBClient";

export const mockSmartFurnitureHookupService: MockedObject<SmartFurnitureHookupService> =
  {
    getSmartFurnitureHookup: vi.fn(),
  };

export const mockHouseholdUserService: MockedObject<HouseholdUserService> = {
  isHouseholdUserUsernameValid: vi.fn(),
};

export const mockMapService: MockedObject<MapService> = {
  isSmartFurnitureHookupInAZone: vi.fn(),
};

export async function setupInfluxContainer() {
  const INFLUX_ORG = "test-org";
  const INFLUX_BUCKET = "test-bucket";
  const INFLUX_TOKEN = "test-super-secret-token";
  const INFLUX_USERNAME = "admin";
  const INFLUX_PASSWORD = "adminpassword";

  const container = await new GenericContainer("influxdb:2.7")
    .withExposedPorts({ container: 8086, host: 8086 })
    .withEnvironment({
      DOCKER_INFLUXDB_INIT_MODE: "setup",
      DOCKER_INFLUXDB_INIT_USERNAME: INFLUX_USERNAME,
      DOCKER_INFLUXDB_INIT_PASSWORD: INFLUX_PASSWORD,
      DOCKER_INFLUXDB_INIT_ORG: INFLUX_ORG,
      DOCKER_INFLUXDB_INIT_BUCKET: INFLUX_BUCKET,
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: INFLUX_TOKEN,
    })
    .withWaitStrategy(Wait.forHttp("/health", 8086).forStatusCode(200))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(8086);
  const url = `http://${host}:${port}`;

  const influxClient = new InfluxDBClient(
    url,
    INFLUX_TOKEN,
    INFLUX_ORG,
    INFLUX_BUCKET,
  );

  return { influxClient, container };
}

export async function composeServerForComponentTest(
  influxClient: InfluxDBClient,
) {
  const logger = pino({ level: "silent" });

  const infra = createInfrastructureLayer(logger, influxClient);

  const application = createApplicationLayer(
    infra.repository,
    mockSmartFurnitureHookupService,
    mockHouseholdUserService,
    mockMapService,
  );

  const presentation = createPresentationLayer(
    application.ingestingService,
    application.monitoringService,
    application.measurementMaintenanceService,
    logger,
  );

  const app = createApp(presentation.mainRouter, logger);
  const server = http.createServer(app);

  const io: Server = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const socketManager = new SocketsNamespaceManager(io);

  socketManager.registerNamespaces(presentation.namespaces);

  return { server };
}
