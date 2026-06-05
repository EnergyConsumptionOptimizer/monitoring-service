import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { healthCheck } from "@presentation/rest/routes/healthCheck";
import { internalRoutes } from "@presentation/rest/routes/internal/internalRoutes";
import { validate } from "@presentation/rest/middlewares/validate";
import { createMeasurementSchema } from "@presentation/rest/schemas/MeasurementSchemas";

export function router(
  ingestingController: IngestingController,
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
): Router {
  const router = Router();

  router.get("/health", healthCheck);

  router.post(
    "/api/measurements",
    validate(createMeasurementSchema),
    (req, res) => ingestingController.createMeasurement(req, res),
  );

  router.use(
    "/api/internal",
    internalRoutes(measurementMaintenanceController, monitoringController),
  );

  return router;
}
