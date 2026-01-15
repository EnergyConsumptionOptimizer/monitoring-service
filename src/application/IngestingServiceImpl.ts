import { IngestingService } from "@domain/ports/IngestingService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { SmartFurnitureHookupService } from "./ports/SmartFurnitureHookupService";
import { HouseholdUserService } from "./ports/HouseholdUserService";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { InvalidSmartFurnitureHookupIDError } from "@domain/errors";
import { MeasurementFactory } from "@domain/MeasurementFactory";
import { MapService } from "@application/ports/MapService";

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
