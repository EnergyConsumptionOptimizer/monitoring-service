import { MonitoringService } from "@domain/ports/MonitoringService";
import { UtilityType } from "@domain/UtilityType";
import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";

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
