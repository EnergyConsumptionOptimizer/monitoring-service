import { IngestingService } from "@domain/ports/IngestingService";
import { NextFunction, type Request, type Response } from "express";
import {
  createMeasurementSchema,
  smartFurnitureHookupIDSchema,
} from "@presentation/web-api-requests/MeasurementSchemas";

export class IngestingController {
  constructor(private readonly ingestingService: IngestingService) {}

  createMeasurement = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { realTimeConsumption, timestamp, username } =
        createMeasurementSchema.parse(request.body);

      const smartFurnitureHookupID = smartFurnitureHookupIDSchema.parse(
        request.query.smart_furniture_hookup_id,
      );

      await this.ingestingService.createMeasurement(
        smartFurnitureHookupID,
        realTimeConsumption,
        timestamp,
        username ?? undefined,
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
