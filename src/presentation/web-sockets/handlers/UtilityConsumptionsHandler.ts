import { MonitoringService } from "@application/inbound/MonitoringService";
import { UtilityType } from "@domain/UtilityType";
import { TimeSeriesFilter } from "@application/utils/TimeSeriesFilter";
import { TagsFilter } from "@application/utils/TagsFilter";

export class UtilityConsumptionsHandler {
  constructor(private readonly monitoringService: MonitoringService) {}

  async getUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: TagsFilter,
  ) {
    return this.monitoringService.getUtilityConsumptions(
      utilityType,
      filter,
      tagsFilter,
    );
  }
}
