import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";

export function router(
  ingestingController: IngestingController,
  monitoringController: MonitoringController,
): Router {
  const router = Router();

  router.post(
    "/api/internal/measurements",
    ingestingController.createMeasurement,
  );

  router.get(
    "/api/internal/measurements/:utilityType",
    monitoringController.getUtilityConsumptions,
  );

  return router;
}
