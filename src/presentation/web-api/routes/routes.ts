import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MeasurementMaintenanceController } from "@presentation/web-api/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/web-api/controllers/MonitoringController";
import { ManageSmartFurnitureHookupConnectionController } from "@presentation/web-api/controllers/ManageSmartFurnitureHookupConnectionController";
import { healthCheck } from "@presentation/web-api/routes/healthCheck";
import { internalRoutes } from "@presentation/web-api/routes/internal/internalRoutes";

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
