import { Router } from "express";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { validate } from "@presentation/rest/middlewares/validate";
import { removeHouseholdUserTagSchema } from "@presentation/rest/schemas/UsernameSchema";
import { removeZoneIDTagSchema } from "@presentation/rest/schemas/ZoneIDSchema";
import { getUtilityConsumptionsSchema } from "@presentation/rest/schemas/UtilityConsumptionsSchema";

export function internalRoutes(
  measurementMaintenanceController: MeasurementMaintenanceController,
  monitoringController: MonitoringController,
): Router {
  const router = Router();

  router.delete(
    "/measurements/household-user-tags/:username",
    validate(removeHouseholdUserTagSchema),
    (req, res) =>
      measurementMaintenanceController.removeHouseholdUserTagFromMeasurements(
        req,
        res,
      ),
  );

  router.delete(
    "/measurements/zone-tags/:zoneID",
    validate(removeZoneIDTagSchema),
    (req, res) =>
      measurementMaintenanceController.removeZoneIDTagFromMeasurements(
        req,
        res,
      ),
  );

  router.get(
    "/measurements/:utilityType",
    validate(getUtilityConsumptionsSchema),
    (req, res) => monitoringController.getUtilityConsumptions(req, res),
  );

  return router;
}
