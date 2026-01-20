import { MeasurementMaintenanceService } from "@domain/ports/MeasurementMaintenanceService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";

export class MeasurementMaintenanceServiceImpl implements MeasurementMaintenanceService {
  constructor(private readonly monitoringRepository: MonitoringRepository) {}

  removeHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void> {
    return this.monitoringRepository.deleteHouseholdUserTagFromMeasurements(
      username,
    );
  }

  removeZoneIDTagFromMeasurements(zoneID: ZoneID): Promise<void> {
    return this.monitoringRepository.deleteZoneIDTagFromMeasurements(zoneID);
  }
}
