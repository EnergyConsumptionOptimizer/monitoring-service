import { MonitoringRepositoryImpl } from "../../store/InfluxDB/MonitoringRepositoryImpl";
import { InfluxDBClient } from "../../store/InfluxDB/InfluxDBClient";
import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { IngestingController } from "@interfaces/web-api/controllers/IngestingController";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { HouseholdUserServiceImpl } from "@interfaces/HouseholdUserServiceImpl";
import { SmartFurnitureHookupServiceImpl } from "@interfaces/SmartFurnitureHookupServiceImpl";
import { router } from "@interfaces/web-api/routes/routes";

// ===== Repository =====
export const influxDBClient = new InfluxDBClient(
  process.env.INFLUX_URL,
  process.env.INFLUX_TOKEN,
  process.env.INFLUX_ORG,
  process.env.INFLUX_BUCKET,
);

export const monitoringRepositoryImpl = new MonitoringRepositoryImpl(
  influxDBClient,
);

// ===== Services =====
export const smartFurnitureHookupServiceImpl =
  new SmartFurnitureHookupServiceImpl(
    process.env.SMART_FURNITURE_HOOKUP_SERVICE_URI,
  );
export const householdUserServiceImpl = new HouseholdUserServiceImpl(
  process.env.USER_SERVICE_URI,
);
export const ingestingServiceImpl = new IngestingServiceImpl(
  monitoringRepositoryImpl,
  smartFurnitureHookupServiceImpl,
  householdUserServiceImpl,
);

export const monitoringServiceImpl = new MonitoringServiceImpl(
  monitoringRepositoryImpl,
);
// ===== Controllers =====
export const ingestingController = new IngestingController(
  ingestingServiceImpl,
);
export const monitoringController = new MonitoringController(
  monitoringServiceImpl,
);
// ===== Router =====
export const apiRouter = router(ingestingController, monitoringController);
