import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { UtilityType } from "@domain/UtilityType";
import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import { UtilityMeters } from "@domain/UtilityMeters";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";

/**
 * Service interface for retrieving information
 * related to smart furniture hookups, utility meters, and consumption data.
 */
export interface MonitoringService {
  /**
   * Returns all currently active smart furniture hookups,
   * i.e. all smart furniture hookups that have sent a measurement in the recent times.
   *
   * @returns A promise resolving to an array of active SmartFurnitureHookupID values.
   */
  getActiveSmartFurnitureHookups(): Promise<SmartFurnitureHookupID[]>;

  /**
   * Retrieves utility meter information, optionally filtered by a time range and additional tags.
   *
   * @param filter - Optional time range filter.
   * @param tagsFilter - Optional measurement tags filter.
   * @returns A promise resolving to the set of utility meters.
   */
  getUtilityMeters(
    filter?: TimeRangeFilter,
    tagsFilter?: TagsFilter,
  ): Promise<UtilityMeters>;

  /**
   * Retrieves consumption points for a specific utility type, optionally
   * filtered by a time-series configuration.
   *
   * @param utilityType
   * @param filter - Optional time-series filter.
   * @param tagsFilter - Optional measurement tags filter.
   * @returns A promise resolving to an array of consumption points.
   */
  getUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: TagsFilter,
  ): Promise<ConsumptionPoint[]>;
}
