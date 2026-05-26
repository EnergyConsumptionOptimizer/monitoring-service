import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { IngestingService } from "@application/inbound/IngestingService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { MapService } from "@application/outbound/MapService";
import { SmartFurnitureHookupNotFoundError, stripErrors } from "@domain/errors";
import { Measurement } from "@domain/entities/Measurement";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";
import { MeasurementTags } from "@domain/values/MeasurementTags";
import { ZoneID } from "@domain/values/ZoneID";
import { UtilityType } from "@domain/values/UtilityType";
import { SmartFurnitureHookup } from "@domain/entities/SmartFurnitureHookup";

export class IngestingServiceImpl implements IngestingService {
  readonly #monitoringRepository: MonitoringRepository;
  readonly #smartFurnitureHookupService: SmartFurnitureHookupService;
  readonly #householdUserService: HouseholdUserService;
  readonly #mapService: MapService;

  constructor(
    monitoringRepository: MonitoringRepository,
    smartFurnitureHookupService: SmartFurnitureHookupService,
    householdUserService: HouseholdUserService,
    mapService: MapService,
  ) {
    this.#mapService = mapService;
    this.#monitoringRepository = monitoringRepository;
    this.#smartFurnitureHookupService = smartFurnitureHookupService;
    this.#householdUserService = householdUserService;
  }

  async createMeasurement(
    smartFurnitureHookupID: string,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: string,
  ): Promise<undefined | Error> {
    const values = stripErrors({
      smartFurnitureHookupID: SmartFurnitureHookupID.from(
        smartFurnitureHookupID,
      ),
      consumptionValue: ConsumptionValue.from(consumptionValue),
      householdUserUsername: householdUserUsername
        ? HouseholdUserUsername.from(householdUserUsername)
        : undefined,
    });

    if (values instanceof Error) return values;

    const smartFurnitureHookup = await this.getSmartFurnitureHookup(
      values.smartFurnitureHookupID,
    );

    if (smartFurnitureHookup instanceof Error) return smartFurnitureHookup;

    const tags = await this.computeTags({
      smartFurnitureHookupID: values.smartFurnitureHookupID,
      username: values.householdUserUsername,
    });

    const measurement = Measurement.create(
      smartFurnitureHookup.id,
      smartFurnitureHookup.utilityType,
      values.consumptionValue,
      isNaN(timestamp.getTime()) ? new Date() : timestamp,
      tags,
    );

    await this.#monitoringRepository.saveMeasurement(measurement);
  }

  private async getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookup | Error> {
    const smartFurnitureHookupDTO =
      await this.#smartFurnitureHookupService.getSmartFurnitureHookup(
        smartFurnitureHookupID,
      );

    if (!smartFurnitureHookupDTO) {
      return new SmartFurnitureHookupNotFoundError();
    }

    if (smartFurnitureHookupDTO instanceof Error)
      return smartFurnitureHookupDTO;

    const utilityType = UtilityType.from(smartFurnitureHookupDTO.utilityType);

    if (utilityType instanceof Error) return utilityType;

    return SmartFurnitureHookup.rehydrate(smartFurnitureHookupID, utilityType);
  }

  private async computeTags(values: {
    smartFurnitureHookupID: SmartFurnitureHookupID;
    username?: HouseholdUserUsername;
  }) {
    const zoneId = await this.getZoneIdOfSmartFurnitureHookup(
      values.smartFurnitureHookupID,
    );

    if (values.username) {
      values.username = await this.getValidHouseHoldUsername(values.username);
    }

    return MeasurementTags.builder()
      .withUsername(values.username)
      .withZoneID(zoneId)
      .build();
  }

  private async getZoneIdOfSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ) {
    const zoneResponse = await this.#mapService.isSmartFurnitureHookupInAZone(
      smartFurnitureHookupID,
    );

    if (!zoneResponse) {
      return undefined;
    }

    const zoneID = ZoneID.from(zoneResponse.zoneID);

    if (zoneID instanceof Error) {
      return undefined;
    }

    return zoneID;
  }

  private async getValidHouseHoldUsername(
    username?: HouseholdUserUsername,
  ): Promise<HouseholdUserUsername | undefined> {
    if (!username) {
      return undefined;
    }

    const isValid =
      await this.#householdUserService.isHouseholdUserUsernameValid(username);

    return isValid ? username : undefined;
  }
}
