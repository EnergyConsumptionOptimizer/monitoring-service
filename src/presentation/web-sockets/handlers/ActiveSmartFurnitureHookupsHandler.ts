import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { MonitoringService } from "@application/inbound/MonitoringService";

export class ActiveSmartFurnitureHookupsHandler {
  private lastActiveSmartFurnitureHookups?: ActiveSmartFurnitureHookup[];
  private lastFetch?: Date;
  private fetchInProgress?: Promise<ActiveSmartFurnitureHookup[]>;

  constructor(private readonly monitoringService: MonitoringService) {}

  async getActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.#fetchActiveSmartFurnitureHookups();
  }

  async getCachedOrFreshData(
    frequency: number,
  ): Promise<ActiveSmartFurnitureHookup[]> {
    if (
      this.lastActiveSmartFurnitureHookups &&
      this.#isCachedDataFresh(frequency)
    ) {
      return this.lastActiveSmartFurnitureHookups;
    }

    if (!this.fetchInProgress) {
      this.fetchInProgress = this.#fetchActiveSmartFurnitureHookups()
        .then((data) => {
          this.lastActiveSmartFurnitureHookups = data;
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

  async #fetchActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.monitoringService.getActiveSmartFurnitureHookups();
  }
}
