import { MonitoringService } from "@application/inbound/MonitoringService";
import { TimeString } from "@domain/TimeString";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";

export class UtilityConsumptionsHandler {
  constructor(private readonly monitoringService: MonitoringService) {}

  async getUtilityConsumptions(
    utilityType: string,
    filters?: {
      from?: TimeString;
      to?: TimeString;
      granularity?: TimeString;
      username?: string;
      zoneID?: string;
    },
  ): Promise<UtilityConsumptionPoint[]> {
    const result = await this.monitoringService.getUtilityConsumptions(
      utilityType,
      {
        from: filters?.from,
        to: filters?.to,
        granularity: filters?.granularity,
        tags: {
          username: filters?.username,
          zoneID: filters?.zoneID,
        },
      },
    );

    if (result instanceof Error) {
      throw result;
    }

    return result;
  }
}
