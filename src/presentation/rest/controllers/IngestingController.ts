import { IngestingService } from "@application/inbound/IngestingService";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export class IngestingController {
  constructor(private readonly ingestingService: IngestingService) {}

  async createMeasurement(request: Request, response: Response): Promise<void> {
    const { realTimeConsumption, timestamp, username } = request.body;

    const smartFurnitureHookupID = request.query
      .smart_furniture_hookup_id as string;

    const measurement = await this.ingestingService.createMeasurement(
      smartFurnitureHookupID,
      realTimeConsumption,
      timestamp,
      username ?? undefined,
    );

    if (measurement instanceof Error) throw measurement;

    response.sendStatus(StatusCodes.CREATED);
  }
}
