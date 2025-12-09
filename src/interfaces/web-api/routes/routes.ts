import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { MeasurementMaintenanceController } from "@interfaces/web-api/controllers/MeasurementMaintenanceController";

export function router(
  ingestingController: IngestingController,
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
): Router {
  const router = Router();

  router.post(
    "/api/internal/measurements",
    ingestingController.createMeasurement,
  );

  router.delete(
    "/api/internal/measurements/household-user-tags/:username",
    measurementMaintenanceController.removeHouseholdUserTagFromMeasurements,
  );

  router.get(
    "/api/internal/measurements/:utilityType",
    monitoringController.getUtilityConsumptions,
  );

  return router;
}
