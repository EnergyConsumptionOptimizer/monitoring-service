import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { MeasurementMaintenanceController } from "@interfaces/web-api/controllers/MeasurementMaintenanceController";
import { ManageSmartFurnitureHookupConnectionController } from "@interfaces/web-api/controllers/ManageSmartFurnitureHookupConnectionController";
import { internalRoutes } from "@interfaces/web-api/routes/internal/internalRoutes";
import { healthCheck } from "@interfaces/web-api/routes/healthCheck";

export function router(
  ingestingController: IngestingController,
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
  registerSmartFurnitureHookup: ManageSmartFurnitureHookupConnectionController,
): Router {
  const router = Router();

  router.get("/health", healthCheck);

  router.use(
    "/api/internal",
    internalRoutes(
      ingestingController,
      measurementMaintenanceController,
      monitoringController,
      registerSmartFurnitureHookup,
    ),
  );

  return router;
}
