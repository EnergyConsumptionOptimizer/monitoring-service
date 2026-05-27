import { IngestingService } from "@application/inbound/IngestingService";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export class IngestingController {
  readonly #EXTERNAL_API_HOST: string;
  readonly #EXTERNAL_API_PORT: string;
  readonly #HOST: string;

  constructor(
    private readonly ingestingService: IngestingService,
    EXTERNAL_API_HOST: string,
    EXTERNAL_API_PORT: string,
    HOST: string,
  ) {
    this.#EXTERNAL_API_HOST = EXTERNAL_API_HOST;
    this.#EXTERNAL_API_PORT = EXTERNAL_API_PORT;
    this.#HOST = HOST;
  }

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

  async getIngestingEndpoint(_request: Request, response: Response) {
    response
      .status(StatusCodes.OK)
      .json({
        endpoint: `http://${this.#EXTERNAL_API_HOST}:${this.#EXTERNAL_API_PORT}/${this.#HOST}/api/internal/measurements`,
      });
  }
}
