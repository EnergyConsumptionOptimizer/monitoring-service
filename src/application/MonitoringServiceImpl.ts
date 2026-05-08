import { UtilityMeters } from "@domain/UtilityMeters";
import { TimeRangeFilter } from "@application/utils/TimeRangeFilter";
import { TagsFilter } from "@application/utils/TagsFilter";
import { UtilityType } from "@domain/UtilityType";
import { TimeSeriesFilter } from "@application/utils/TimeSeriesFilter";
import { UtilityConsumptionPoint } from "@domain/UtilityConsumptionPoint";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { MonitoringRepository } from "@application/outbound/MonitoringRepository";

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
  ): Promise<UtilityConsumptionPoint[]> {
    return this.monitoringRepository.findUtilityConsumptions(
      utilityType,
      filter,
      tagsFilter,
    );
  }
}
