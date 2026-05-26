import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { TimeString } from "@domain/TimeString";

/**
 * Service interface for retrieving information
 * related to smart furniture hookups, utility meters, and consumption data.
 */
export interface MonitoringService {
  /**
   * Returns all currently active smart furniture hookups,
   * i.e. all smart furniture hookups that have sent a measurement in the recent times.
   *
   * @returns A promise resolving to a list of SmartFurnitureHookupID values together with the most recent consumption data.
   */
  getActiveSmartFurnitureHookups(): Promise<ActiveSmartFurnitureHookup[]>;

  /**
   * Retrieves utility meter information, optionally filtered by a time range and additional tags.
   *
   * @param filters - Optional filters.
   * @returns A promise resolving to the set of utility meters.
   */
  getUtilityMeters(filters?: {
    from?: TimeString;
    to?: TimeString;
    tags?: {
      username?: string;
      zoneID?: string;
    };
  }): Promise<UtilityMeters | Error>;

  /**
   * Retrieves consumption points for a specific utility type, optionally
   * filtered by a time-series configuration.
   *
   * @param utilityType
   * @param filters - Optional filters.
   * @returns A promise resolving to an array of consumption points.
   */
  getUtilityConsumptions(
    utilityType: string,
    filters?: {
      from?: TimeString;
      to?: TimeString;
      granularity?: TimeString;
      tags?: {
        username?: string;
        zoneID?: string;
      };
    },
  ): Promise<UtilityConsumptionPoint[] | Error>;
}
