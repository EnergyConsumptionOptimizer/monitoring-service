import { MonitoringService } from "@domain/ports/MonitoringService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { UtilityMeters } from "@domain/UtilityMeters";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";
import { UtilityType } from "@domain/UtilityType";
import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";

export class MonitoringServiceImpl implements MonitoringService {
  constructor(private readonly monitoringRepository: MonitoringRepository) {}

  async getActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.monitoringRepository.findActiveSmartFurnitureHookups();
  }

  async getUtilityMeters(
    filter?: TimeRangeFilter,
    tagsFilter?: TagsFilter,
  ): Promise<UtilityMeters> {
    return this.monitoringRepository.findUtilityMeters(filter, tagsFilter);
  }

  async getUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: TagsFilter,
  ): Promise<ConsumptionPoint[]> {
    return this.monitoringRepository.findUtilityConsumptions(
      utilityType,
      filter,
      tagsFilter,
    );
  }
}
