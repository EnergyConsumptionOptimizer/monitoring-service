import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { InvalidSmartFurnitureHookupIDError } from "@domain/errors";
import { MeasurementFactory } from "@domain/MeasurementFactory";
import { IngestingService } from "@application/inbound/IngestingService";
import { MonitoringRepository } from "@application/outbound/MonitoringRepository";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { MapService } from "@application/outbound/MapService";

export class IngestingServiceImpl implements IngestingService {
  constructor(
    private readonly monitoringRepository: MonitoringRepository,
    private readonly smartFurnitureHookupService: SmartFurnitureHookupService,
    private readonly householdUserService: HouseholdUserService,
    private readonly mapService: MapService,
  ) {}

  async createMeasurement(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: HouseholdUserUsername,
  ): Promise<void> {
    const smartFurnitureHookup =
      await this.smartFurnitureHookupService.getSmartFurnitureHookup(
        smartFurnitureHookupID,
      );

    if (!smartFurnitureHookup) {
      throw new InvalidSmartFurnitureHookupIDError();
    }

    return await this.monitoringRepository.saveMeasurement(
      new MeasurementFactory().createMeasurement(
        smartFurnitureHookupID,
        smartFurnitureHookup.utilityType,
        consumptionValue,
        isNaN(timestamp.getTime()) ? new Date() : timestamp,
        await this.getValidHouseHoldUsername(householdUserUsername),
        (await this.mapService.isSmartFurnitureHookupInAZone(
          smartFurnitureHookupID,
        )) ?? undefined,
      ),
    );
  }

  private async getValidHouseHoldUsername(
    username?: HouseholdUserUsername,
  ): Promise<HouseholdUserUsername | undefined> {
    if (!username) {
      return undefined;
    }

    const isValid =
      await this.householdUserService.isHouseholdUserUsernameValid(username);

    return isValid ? username : undefined;
  }
}
