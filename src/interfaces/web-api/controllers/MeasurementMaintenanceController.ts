import { MeasurementMaintenanceService } from "@domain/ports/MeasurementMaintenanceService";
import { NextFunction, Request, Response } from "express";
import { householdUserUsernameSchema } from "@presentation/web-api-requests/MeasurementSchemas";

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
      const householdUserUsername = householdUserUsernameSchema.parse(
        request.params.username,
      );
      //
      await this.measurementMaintenanceService.removeHouseholdUserTagFromMeasurements(
        householdUserUsername,
      );

      console.log("ciao", householdUserUsername);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
