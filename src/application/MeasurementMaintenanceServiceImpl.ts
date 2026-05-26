import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { ZoneID } from "@domain/values/ZoneID";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import {
  HouseholdUserUsernameEmptyError,
  ZoneIdEmptyError,
} from "@domain/errors";

export class MeasurementMaintenanceServiceImpl implements MeasurementMaintenanceService {
  readonly #monitoringRepository: MonitoringRepository;
  constructor(monitoringRepository: MonitoringRepository) {
    this.#monitoringRepository = monitoringRepository;
  }

  async removeHouseholdUserTagFromMeasurements(
    username: string,
  ): Promise<undefined | HouseholdUserUsernameEmptyError> {
    const usernameValue = HouseholdUserUsername.from(username);

    if (usernameValue instanceof Error) {
      return usernameValue;
    }

    await this.#monitoringRepository.deleteHouseholdUserTagFromMeasurements(
      usernameValue,
    );
  }

  async removeZoneIDTagFromMeasurements(
    zoneID: string,
  ): Promise<undefined | ZoneIdEmptyError> {
    const zoneIDValue = ZoneID.from(zoneID);

    if (zoneIDValue instanceof Error) {
      return zoneIDValue;
    }

    await this.#monitoringRepository.deleteZoneIDTagFromMeasurements(
      zoneIDValue,
    );
  }
}
