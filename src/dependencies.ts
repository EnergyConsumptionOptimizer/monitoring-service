import "dotenv/config";
import { ActiveSmartFurnitureHookupsRoom } from "@presentation/web-sockets/namespace/rooms/ActiveSmartFurnitureHookupsRoom";
import { RealTimeNamespace } from "@presentation/web-sockets/namespace/RealTimeNamespace";
import { RealTimeUtilityMetersRoom } from "@presentation/web-sockets/namespace/rooms/RealTimeUtilityMetersRoom";
import { UtilityConsumptionsNamespace } from "@presentation/web-sockets/namespace/UtilityConsumptionsNamespace";
import { UtilityConsumptionsSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityConsumptionsSubscription";
import { UtilityMetersNamespace } from "@presentation/web-sockets/namespace/UtilityMetersNamespace";
import { UtilityMetersSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityMetersSubscription";
import { MeasurementMaintenanceServiceImpl } from "@application/MeasurementMaintenanceServiceImpl";
import { InfluxDBClient } from "@storage/influxDB/InfluxDBClient";
import { InfluxMonitoringRepository } from "@storage/influxDB/InfluxMonitoringRepository";
import { HTTPSmartFurnitureHookupService } from "@storage/HTTPSmartFurnitureHookupService";
import { HTTPHouseholdUserService } from "@storage/HTTPHouseholdUserService";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { HTTPMapService } from "@storage/HTTPMapService";
import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";
import { IngestingController } from "@presentation/web-api/controllers/IngestingController";
import { MonitoringController } from "@presentation/web-api/controllers/MonitoringController";
import { MeasurementMaintenanceController } from "@presentation/web-api/controllers/MeasurementMaintenanceController";
import { ManageSmartFurnitureHookupConnectionController } from "@presentation/web-api/controllers/ManageSmartFurnitureHookupConnectionController";
import { router } from "@presentation/web-api/routes/routes";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";

// ===== Repository =====
export const influxDBClient = new InfluxDBClient(
  `http://${process.env.INFLUXDB_HOST}:${process.env.INFLUXDB_PORT}`,
  process.env.INFLUX_TOKEN || "",
  process.env.INFLUX_ORG || "",
  process.env.INFLUX_BUCKET || "",
);

export const monitoringRepositoryImpl = new InfluxMonitoringRepository(
  influxDBClient,
);

// ===== Services =====
const smartFurnitureHookupServiceUri = `http://${process.env.HOOKUP_SERVICE_HOST ?? "hookup-service"}:${process.env.HOOKUP_SERVICE_PORT ?? "3000"}`;
export const smartFurnitureHookupServiceImpl =
  new HTTPSmartFurnitureHookupService(smartFurnitureHookupServiceUri);

const userServiceUri = `http://${process.env.USER_SERVICE_HOST ?? "user-service"}:${process.env.USER_SERVICE_PORT ?? "3000"}`;
export const householdUserServiceImpl = new HTTPHouseholdUserService(
  userServiceUri,
);

const mapServiceUri = `http://${process.env.MAP_SERVICE_HOST ?? "map-service"}:${process.env.MAP_SERVICE_PORT ?? "3001"}`;
export const mapServiceImpl = new HTTPMapService(mapServiceUri);

export const ingestingServiceImpl = new IngestingServiceImpl(
  monitoringRepositoryImpl,
  smartFurnitureHookupServiceImpl,
  householdUserServiceImpl,
  mapServiceImpl,
);

export const measurementMaintenanceServiceImpl =
  new MeasurementMaintenanceServiceImpl(monitoringRepositoryImpl);

export const monitoringServiceImpl = new MonitoringServiceImpl(
  monitoringRepositoryImpl,
);

// ===== Web-API Controllers =====
export const ingestingController = new IngestingController(
  ingestingServiceImpl,
);
export const monitoringController = new MonitoringController(
  monitoringServiceImpl,
);

export const measurementMaintenanceController =
  new MeasurementMaintenanceController(measurementMaintenanceServiceImpl);

export const manageSmartFurnitureHookupConnectionController =
  new ManageSmartFurnitureHookupConnectionController();

// ===== Web-API Router =====
export const apiRouter = router(
  ingestingController,
  measurementMaintenanceController,
  monitoringController,
  manageSmartFurnitureHookupConnectionController,
);
// ===== Web-Sockets Middlewares =====
export const socketAuthMiddleware = new SocketAuthMiddleware();

// ===== Web-Sockets Handlers =====
export const activeSmartFurnitureHookupsHandler =
  new ActiveSmartFurnitureHookupsHandler(monitoringServiceImpl);
export const utilityMetersHandler = new UtilityMetersHandler(
  monitoringServiceImpl,
);
export const utilityConsumptionHandler = new UtilityConsumptionsHandler(
  monitoringServiceImpl,
);

// ===== Web-Sockets Rooms =====
export const activeSmartFurnitureHookupsRoom =
  new ActiveSmartFurnitureHookupsRoom(activeSmartFurnitureHookupsHandler);
export const realTimeUtilityMetersRoom = new RealTimeUtilityMetersRoom(
  utilityMetersHandler,
);

// ===== Web-Sockets Namespace =====
export const realTimeNamespace = new RealTimeNamespace(
  activeSmartFurnitureHookupsRoom,
  realTimeUtilityMetersRoom,
  socketAuthMiddleware,
);

export const utilityConsumptionSubscription =
  new UtilityConsumptionsSubscription(utilityConsumptionHandler);
export const utilityMetersSubscription = new UtilityMetersSubscription(
  utilityMetersHandler,
);

export const utilityConsumptionsNamespace = new UtilityConsumptionsNamespace(
  utilityConsumptionSubscription,
  socketAuthMiddleware,
);
export const utilityMetersNamespace = new UtilityMetersNamespace(
  utilityMetersSubscription,
);
