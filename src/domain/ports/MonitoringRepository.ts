import { Measurement } from "@domain/entities/Measurement";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { UtilityType } from "@domain/values/UtilityType";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { ZoneID } from "@domain/values/ZoneID";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { MeasurementTags } from "@domain/values/MeasurementTags";

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
   * Deletes a zone id tag from all measurements.
   *
   * @param zoneID - The zone's id to remove from measurements.
   */
  deleteZoneIDTagFromMeasurements(zoneID: ZoneID): Promise<void>;

  /**
   * Deletes a zone id tag from all measurements.
   *
   * @param zoneID - The zone's id to remove from measurements.
   */
  deleteZoneIDTagFromMeasurements(zoneID: ZoneID): Promise<void>;

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
    tagsFilter?: MeasurementTags,
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
    tagsFilter?: MeasurementTags,
  ): Promise<UtilityConsumptionPoint[]>;
}
