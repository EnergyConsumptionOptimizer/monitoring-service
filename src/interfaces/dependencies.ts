import { MonitoringRepositoryImpl } from "../store/InfluxDB/MonitoringRepositoryImpl";
import { InfluxDBClient } from "../store/InfluxDB/InfluxDBClient";
import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { IngestingController } from "@interfaces/web-api/controllers/IngestingController";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { HouseholdUserServiceImpl } from "@interfaces/HouseholdUserServiceImpl";
import { SmartFurnitureHookupServiceImpl } from "@interfaces/SmartFurnitureHookupServiceImpl";
import { router } from "@interfaces/web-api/routes/routes";
import "dotenv/config";
import { ActiveSmartFurnitureHookupsHandler } from "@interfaces/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { ActiveSmartFurnitureHookupsRoom } from "@interfaces/web-sockets/namespace/rooms/ActiveSmartFurnitureHookupsRoom";
import { RealTimeNamespace } from "@interfaces/web-sockets/namespace/RealTimeNamespace";
import { UtilityMetersHandler } from "@interfaces/web-sockets/handlers/UtilityMetersHandler";
import { RealTimeUtilityMetersRoom } from "@interfaces/web-sockets/namespace/rooms/RealTimeUtilityMetersRoom";
import { UtilityConsumptionsNamespace } from "@interfaces/web-sockets/namespace/UtilityConsumptionsNamespace";
import { UtilityConsumptionsSubscription } from "@interfaces/web-sockets/namespace/subscriptions/UtilityConsumptionsSubscription";
import { UtilityConsumptionsHandler } from "@interfaces/web-sockets/handlers/UtilityConsumptionsHandler";
import { UtilityMetersNamespace } from "@interfaces/web-sockets/namespace/UtilityMetersNamespace";
import { UtilityMetersSubscription } from "@interfaces/web-sockets/namespace/subscriptions/UtilityMetersSubscription";
import { MeasurementMaintenanceServiceImpl } from "@application/MeasurementMaintenanceServiceImpl";
import { MeasurementMaintenanceController } from "@interfaces/web-api/controllers/MeasurementMaintenanceController";
import { ManageSmartFurnitureHookupConnectionController } from "@interfaces/web-api/controllers/ManageSmartFurnitureHookupConnectionController";
import { MapServiceImpl } from "@interfaces/MapServiceImpl";

// ===== Repository =====
export const influxDBClient = new InfluxDBClient(
  process.env.INFLUX_URL || "",
  process.env.INFLUX_TOKEN || "",
  process.env.INFLUX_ORG || "",
  process.env.INFLUX_BUCKET || "",
);

export const monitoringRepositoryImpl = new MonitoringRepositoryImpl(
  influxDBClient,
);

// ===== Services =====
export const smartFurnitureHookupServiceImpl =
  new SmartFurnitureHookupServiceImpl(
    process.env.SMART_FURNITURE_HOOKUP_SERVICE_URI || "",
  );

export const householdUserServiceImpl = new HouseholdUserServiceImpl(
  process.env.USER_SERVICE_URI || "",
);

export const mapServiceImpl = new MapServiceImpl(
  process.env.MAP_SERVICE_URI || "",
);

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
);

export const utilityConsumptionSubscription =
  new UtilityConsumptionsSubscription(utilityConsumptionHandler);
export const utilityMetersSubscription = new UtilityMetersSubscription(
  utilityMetersHandler,
);

export const utilityConsumptionsNamespace = new UtilityConsumptionsNamespace(
  utilityConsumptionSubscription,
);
export const utilityMetersNamespace = new UtilityMetersNamespace(
  utilityMetersSubscription,
);
