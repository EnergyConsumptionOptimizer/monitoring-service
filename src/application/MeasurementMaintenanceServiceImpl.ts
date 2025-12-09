import { MeasurementMaintenanceService } from "@domain/ports/MeasurementMaintenanceService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export class MeasurementMaintenanceServiceImpl
  implements MeasurementMaintenanceService
{
  constructor(private readonly monitoringRepository: MonitoringRepository) {}

  removeHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void> {
    return this.monitoringRepository.deleteHouseholdUserTagFromMeasurements(
      username,
    );
  }
}
