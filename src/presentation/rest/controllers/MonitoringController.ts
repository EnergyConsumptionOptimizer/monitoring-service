import { Request, Response } from "express";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { TimeString } from "@domain/TimeString";
import { StatusCodes } from "http-status-codes";

export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  async getUtilityConsumptions(
    request: Request,
    response: Response,
  ): Promise<void> {
    const utilityType = request.params.utilityType as string;

    const from = request.query.from as TimeString;
    const to = request.query.to as TimeString;
    const granularity = request.query.granularity as TimeString;

    const username = request.query.username as string;
    const zoneID = request.query.zoneID as string;

    const utilityConsumptions =
      await this.monitoringService.getUtilityConsumptions(utilityType, {
        from: from,
        to: to,
        granularity: granularity,
        tags: {
          username: username,
          zoneID: zoneID,
        },
      });

    if (utilityConsumptions instanceof Error) {
      throw utilityConsumptions;
    }
    response.status(StatusCodes.OK).json({
      utilityConsumptions: utilityConsumptions,
    });
  }
}
