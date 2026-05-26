import { MonitoringService } from "@application/inbound/MonitoringService";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { TimeString } from "@domain/TimeString";

export class UtilityMetersHandler {
  private lastMeters?: UtilityMeters;
  private lastFetch?: Date;
  private fetchInProgress?: Promise<UtilityMeters>;

  constructor(private readonly monitoringService: MonitoringService) {}

  async getUtilityMeters(filters?: {
    from?: TimeString;
    to?: TimeString;
    username?: string;
    zoneID?: string;
  }): Promise<UtilityMeters> {
    return this.#fetchUtilityMeters(filters);
  }

  async getCachedOrFreshData(frequency: number): Promise<UtilityMeters> {
    if (this.lastMeters && this.#isCachedDataFresh(frequency)) {
      return this.lastMeters;
    }

    if (!this.fetchInProgress) {
      this.fetchInProgress = this.#fetchUtilityMeters()
        .then((data) => {
          this.lastMeters = data;
          this.lastFetch = new Date();
          return data;
        })
        .finally(() => {
          this.fetchInProgress = undefined;
        });
    }

    return this.fetchInProgress;
  }

  #isCachedDataFresh(frequency: number): boolean {
    if (!this.lastFetch) {
      return false;
    }

    const dataAge = Date.now() - this.lastFetch.getTime();
    return dataAge < frequency;
  }

  async #fetchUtilityMeters(filters?: {
    from?: TimeString;
    to?: TimeString;
    username?: string;
    zoneID?: string;
  }): Promise<UtilityMeters> {
    const utilityMeters = await this.monitoringService.getUtilityMeters({
      from: filters?.from,
      to: filters?.to,
      tags: {
        username: filters?.username,
        zoneID: filters?.zoneID,
      },
    });

    if (utilityMeters instanceof Error) {
      throw utilityMeters;
    }

    return utilityMeters;
  }
}
