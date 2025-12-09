import { Measurement } from "../Measurement";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";
import { UtilityMeters } from "@domain/UtilityMeters";
import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { UtilityConsumptionPoint } from "@domain/UtilityConsumptionPoint";
import { UtilityType } from "@domain/UtilityType";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

/**
 * Repository interface responsible for persisting and retrieving monitoring data.
 */
export interface MonitoringRepository {
  /**
   * Persists a single measurement.
   *
   * @param measurement - The measurement to save.
   * @returns A promise that resolves once the measurement has been stored.
   */
  saveMeasurement(measurement: Measurement): Promise<void>;

  /**
   * Deletes a username tag from all measurements.
   *
   * @param username - The household user's username to remove from measurements.
   */
  deleteHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void>;

  /**
   * Finds all currently active smart furniture hookups along with their
   *  * current consumption information.
   *
   * A smart furniture hookup is considered active if it has produced at least one
   * measurement within a recent time window.
   *
   * @returns A promise resolving to a list of SmartFurnitureHookupID values
   * together with the most recent consumption data.
   */
  findActiveSmartFurnitureHookups(): Promise<ActiveSmartFurnitureHookup[]>;

  /**
   * Retrieves utility meter information, optionally filtered by time range
   * and by associated tags.
   *
   * @param filter - Optional time range filter.
   * @param tagsFilter - Optional measurement tags filter.
   * @returns A promise resolving to the matching utility meters.
   */
  findUtilityMeters(
    filter?: TimeRangeFilter,
    tagsFilter?: TagsFilter,
  ): Promise<UtilityMeters>;

  /**
   * Retrieves utility consumption data for a given utility type, optionally
   * filtered by a time-series configuration and by associated tags.
   *
   * @param utilityType - The specific utility type for which consumption is requested.
   * @param filter - Optional time-series filter.
   * @param tagsFilter - Optional measurement tags filter.
   * @returns A promise resolving to an array of utility consumption points matching the filters.
   */
  findUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: TagsFilter,
  ): Promise<UtilityConsumptionPoint[]>;
}
