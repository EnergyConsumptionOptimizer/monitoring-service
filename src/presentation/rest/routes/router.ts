import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { healthCheck } from "@presentation/rest/routes/healthCheck";
import { internalRoutes } from "@presentation/rest/routes/internal/internalRoutes";

export function router(
  ingestingController: IngestingController,
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
): Router {
  const router = Router();

  router.get("/health", healthCheck);

  router.use(
    "/api/internal",
    internalRoutes(
      ingestingController,
      measurementMaintenanceController,
      monitoringController,
    ),
  );

  return router;
}
