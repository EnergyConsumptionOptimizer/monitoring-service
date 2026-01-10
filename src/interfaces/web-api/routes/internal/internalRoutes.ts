import { Router } from "express";
import { IngestingController } from "@interfaces/web-api/controllers/IngestingController";
import { MeasurementMaintenanceController } from "@interfaces/web-api/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { ManageSmartFurnitureHookupConnectionController } from "@interfaces/web-api/controllers/ManageSmartFurnitureHookupConnectionController";

export function internalRoutes(
  ingestingController: IngestingController,
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
  manageSmartFurnitureHookupConnectionController: ManageSmartFurnitureHookupConnectionController,
): Router {
  const router = Router();

  router.post(
    "/registerSmartFurnitureHookup",
    manageSmartFurnitureHookupConnectionController.registerSmartFurnitureHookup,
  );
  router.post(
    "/disconnectSmartFurnitureHookup",
    manageSmartFurnitureHookupConnectionController.disconnectSmartFurnitureHookup,
  );

  router.post("/measurements", ingestingController.createMeasurement);

  router.delete(
    "/measurements/household-user-tags/:username",
    measurementMaintenanceController.removeHouseholdUserTagFromMeasurements,
  );

  router.get(
    "/measurements/:utilityType",
    monitoringController.getUtilityConsumptions,
  );

  return router;
}
