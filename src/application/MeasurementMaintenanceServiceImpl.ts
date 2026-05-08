import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { ZoneID } from "@domain/ZoneID";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { MonitoringRepository } from "@application/outbound/MonitoringRepository";

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
