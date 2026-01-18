import { MonitoringService } from "@domain/ports/MonitoringService";
import { NextFunction, Request, Response } from "express";
import {
  fromSchema,
  granularitySchema,
  toSchema,
} from "@presentation/web-api-requests/timeSeriesSchema";
import { utilityTypeSchema } from "@presentation/validation/utilityTypeSchema";
import { usernameSchema } from "@presentation/validation/usernameSchema";

export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  getUtilityConsumptions = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const utilityType = utilityTypeSchema.parse(request.params.utilityType);

      const from = fromSchema.parse(request.query.from);
      const to = toSchema.parse(request.query.to);
      const granularity = granularitySchema.parse(request.query.granularity);
      const username = usernameSchema.optional().parse(request.query.username);

      const utilityConsumptions =
        await this.monitoringService.getUtilityConsumptions(
          utilityType,
          { from, to, granularity },
          { username },
        );

      response.status(200).send({
        utilityConsumptions: utilityConsumptions,
      });
    } catch (error) {
      next(error);
    }
  };
}
