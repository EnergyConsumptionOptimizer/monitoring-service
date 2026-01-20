import { MeasurementMaintenanceService } from "@domain/ports/MeasurementMaintenanceService";
import { NextFunction, Request, Response } from "express";
import { usernameSchema } from "@presentation/validation/usernameSchema";
import { zoneIDSchema } from "@presentation/validation/zoneIDSchema";

export class MeasurementMaintenanceController {
  constructor(
    private readonly measurementMaintenanceService: MeasurementMaintenanceService,
  ) {}

  removeHouseholdUserTagFromMeasurements = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const householdUserUsername = usernameSchema.parse(
        request.params.username,
      );

      await this.measurementMaintenanceService.removeHouseholdUserTagFromMeasurements(
        householdUserUsername,
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  removeZoneIDTagFromMeasurements = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const zoneID = zoneIDSchema.parse(request.params.zoneID);

      await this.measurementMaintenanceService.removeZoneIDTagFromMeasurements(
        zoneID,
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
