import { Logger } from "pino";

import { createApp } from "./app";
import { InfluxMonitoringRepository } from "@storage/influxDB/InfluxMonitoringRepository";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HTTPHouseholdUserService } from "@storage/HTTPHouseholdUserService";
import { MapService } from "@application/outbound/MapService";
import { HTTPMapService } from "@storage/HTTPMapService";
import { HTTPSmartFurnitureHookupService } from "@storage/HTTPSmartFurnitureHookupService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";
import { MeasurementMaintenanceServiceImpl } from "@application/MeasurementMaintenanceServiceImpl";
import { config } from "@bootstrap/config";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { router } from "@presentation/rest/routes/router";
import { IngestingController } from "@presentation/rest/controllers/IngestingController";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { IngestingService } from "@application/inbound/IngestingService";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";
import { namespaces } from "@presentation/web-sockets/MainSocket";
import { getInfluxDBClientInstance } from "@bootstrap/InfluxInstance";
import http from "http";
import { Server } from "socket.io";
import { SocketsNamespaceManager } from "@presentation/web-sockets/SocketsNamespaceManager";
import { InfluxDBClient } from "@storage/influxDB/InfluxDBClient";

export function createApplicationLayer(
  repository: MonitoringRepository,
  smartFurnitureHookupService: SmartFurnitureHookupService,
  householdUserService: HouseholdUserService,
  mapService: MapService,
) {
  return {
    ingestingService: new IngestingServiceImpl(
      repository,
      smartFurnitureHookupService,
      householdUserService,
      mapService,
    ),
    monitoringService: new MonitoringServiceImpl(repository),
    measurementMaintenanceService: new MeasurementMaintenanceServiceImpl(
      repository,
    ),
  };
}

export function createInfrastructureLayer(
  logger: Logger,
  influx: InfluxDBClient,
) {
  return {
    repository: new InfluxMonitoringRepository(influx),
    householdUserService: new HTTPHouseholdUserService(
      config.userServiceUrl,
      logger,
    ),
    mapService: new HTTPMapService(config.mapServiceUrl, logger),
    smartFurnitureHookupService: new HTTPSmartFurnitureHookupService(
      config.hookupServiceUrl,
      logger,
    ),
  };
}

export function createPresentationLayer(
  ingestingService: IngestingService,
  monitoringService: MonitoringService,
  measurementMaintenanceService: MeasurementMaintenanceService,
  logger: Logger,
) {
  const measurementMaintenanceController: MeasurementMaintenanceController =
    new MeasurementMaintenanceController(measurementMaintenanceService);
  const monitoringController: MonitoringController = new MonitoringController(
    monitoringService,
  );
  const ingestingController: IngestingController = new IngestingController(
    ingestingService,
  );

  const socketAuthMiddleware = new SocketAuthMiddleware();

  const activeSmartFurnitureHookupsHandler =
    new ActiveSmartFurnitureHookupsHandler(monitoringService);

  const utilityMetersHandler = new UtilityMetersHandler(monitoringService);
  const utilityConsumptionHandler = new UtilityConsumptionsHandler(
    monitoringService,
  );

  return {
    mainRouter: router(
      ingestingController,
      measurementMaintenanceController,
      monitoringController,
    ),
    namespaces: namespaces(
      activeSmartFurnitureHookupsHandler,
      utilityMetersHandler,
      utilityConsumptionHandler,
      socketAuthMiddleware,
      logger,
    ),
  };
}

export async function composeServer(logger: Logger) {
  const infra = createInfrastructureLayer(logger, getInfluxDBClientInstance());

  const application = createApplicationLayer(
    infra.repository,
    infra.smartFurnitureHookupService,
    infra.householdUserService,
    infra.mapService,
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
