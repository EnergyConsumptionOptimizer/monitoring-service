import { UtilityMeters } from "@domain/values/UtilityMeters";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { UtilityType } from "@domain/values/UtilityType";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { TimeString } from "@domain/TimeString";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { MeasurementTags } from "@domain/values/MeasurementTags";
import { ZoneID } from "@domain/values/ZoneID";
import { stripErrors } from "@domain/errors";

export class MonitoringServiceImpl implements MonitoringService {
  readonly #monitoringRepository: MonitoringRepository;

  constructor(monitoringRepository: MonitoringRepository) {
    this.#monitoringRepository = monitoringRepository;
  }
  async getActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.#monitoringRepository.findActiveSmartFurnitureHookups();
  }

  async getUtilityMeters(filters?: {
    from?: TimeString;
    to?: TimeString;
    tags?: {
      username?: string;
      zoneID?: string;
    };
  }): Promise<UtilityMeters | Error> {
    let timeRangeFilter = undefined;
    let tagsFilter = undefined;

    if (filters?.tags) {
      tagsFilter = this.#parseTagFilters(filters.tags);

      if (tagsFilter instanceof Error) {
        return tagsFilter;
      }
    }

    if (filters?.to || filters?.from) {
      timeRangeFilter = TimeRangeFilter.builder()
        .withFrom(filters.from)
        .withTo(filters.to)
        .build();
    }

    return this.#monitoringRepository.findUtilityMeters(
      timeRangeFilter,
      tagsFilter,
    );
  }

  async getUtilityConsumptions(
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
  ): Promise<UtilityConsumptionPoint[] | Error> {
    const utilityTypeValue = UtilityType.from(utilityType);

    if (utilityTypeValue instanceof Error) return utilityTypeValue;

    let timeSeriesFilter = undefined;
    let tagsFilter = undefined;

    if (filters?.tags) {
      tagsFilter = this.#parseTagFilters(filters.tags);

      if (tagsFilter instanceof Error) {
        return tagsFilter;
      }
    }

    if (filters?.to || filters?.from || filters?.granularity) {
      timeSeriesFilter = TimeSeriesFilter.builder()
        .withFrom(filters.from)
        .withTo(filters.to)
        .withGranularity(filters.granularity)
        .build();
    }

    return this.#monitoringRepository.findUtilityConsumptions(
      utilityTypeValue,
      timeSeriesFilter,
      tagsFilter,
    );
  }

  #parseTagFilters(tags: { username?: string; zoneID?: string }) {
    const tagsFilter = MeasurementTags.builder();

    const values = stripErrors({
      username: tags.username
        ? HouseholdUserUsername.from(tags.username)
        : undefined,
      zoneID: tags?.zoneID ? ZoneID.from(tags?.zoneID) : undefined,
    });

    if (values instanceof Error) return values;

    if (values.username) {
      tagsFilter.withUsername(values.username);
    }

    if (values.zoneID) {
      tagsFilter.withZoneID(values.zoneID);
    }

    return tagsFilter.build();
  }
}
