import { Request, Response } from "express";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { StatusCodes } from "http-status-codes";

export class MeasurementMaintenanceController {
  constructor(
    private readonly measurementMaintenanceService: MeasurementMaintenanceService,
  ) {}

  async removeHouseholdUserTagFromMeasurements(
    request: Request,
    response: Response,
  ): Promise<void> {
    const householdUserUsername = request.params.username as string;

    await this.measurementMaintenanceService.removeHouseholdUserTagFromMeasurements(
      householdUserUsername,
    );

    response.sendStatus(StatusCodes.NO_CONTENT);
  }

  async removeZoneIDTagFromMeasurements(
    request: Request,
    response: Response,
  ): Promise<void> {
    const zoneID = request.params.zoneID as string;

    await this.measurementMaintenanceService.removeZoneIDTagFromMeasurements(
      zoneID,
    );

    response.sendStatus(StatusCodes.NO_CONTENT);
  }
}
