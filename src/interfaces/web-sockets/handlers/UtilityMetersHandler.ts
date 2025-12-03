import {
  UtilityMetersDTO,
  UtilityMetersMapper,
} from "@presentation/UtilityMetersDTO";
import { MonitoringService } from "@domain/ports/MonitoringService";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { UtilityMeters } from "@domain/UtilityMeters";

export class UtilityMetersHandler {
  private lastMeters?: UtilityMetersDTO;
  private lastFetch?: Date;
  private fetchInProgress?: Promise<UtilityMetersDTO>;

  constructor(private readonly monitoringService: MonitoringService) {}

  async getUtilityMeters(filter?: TimeRangeFilter): Promise<UtilityMetersDTO> {
    return this.fetchUtilityMeters(filter);
  }

  async getCachedOrFreshData(frequency: number): Promise<UtilityMetersDTO> {
    if (this.lastMeters && this.isCachedDataFresh(frequency)) {
      return this.lastMeters;
    }

    if (!this.fetchInProgress) {
      this.fetchInProgress = this.fetchUtilityMeters().finally(() => {
        this.fetchInProgress = undefined;
      });
    }

    return this.fetchInProgress;
  }

  private isCachedDataFresh(frequency: number): boolean {
    if (!this.lastFetch) {
      return false;
    }

    const dataAge = Date.now() - this.lastFetch.getTime();
    return dataAge < frequency;
  }

  private async fetchUtilityMeters(
    filter?: TimeRangeFilter,
  ): Promise<UtilityMetersDTO> {
    const utilityMeters = await this.monitoringService.getUtilityMeters(filter);

    return this.parseUtilityMeters(utilityMeters);
  }

  private parseUtilityMeters(utilityMeters: UtilityMeters) {
    return UtilityMetersMapper.toDTO(utilityMeters);
  }
}
