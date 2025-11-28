import { IngestingController } from "../controllers/IngestingController";
import { Router } from "express";

export function router(ingestingController: IngestingController): Router {
  const router = Router();

  router.post(
    "/api/internal/measurements",
    ingestingController.createMeasurement,
  );

  return router;
}
