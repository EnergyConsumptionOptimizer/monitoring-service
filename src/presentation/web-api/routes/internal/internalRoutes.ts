import { Router } from "express";
import { IngestingController } from "@presentation/web-api/controllers/IngestingController";
import { MeasurementMaintenanceController } from "@presentation/web-api/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/web-api/controllers/MonitoringController";
import { ManageSmartFurnitureHookupConnectionController } from "@presentation/web-api/controllers/ManageSmartFurnitureHookupConnectionController";

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

  router.delete(
    "/measurements/zone-tags/:zoneID",
    measurementMaintenanceController.removeZoneIDTagFromMeasurements,
  );

  router.get(
    "/measurements/:utilityType",
    monitoringController.getUtilityConsumptions,
  );

  return router;
}
