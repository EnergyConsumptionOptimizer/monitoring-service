import { MonitoringService } from "@domain/ports/MonitoringService";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";

export class ActiveSmartFurnitureHookupsHandler {
  private lastActiveSmartFurnitureHookups?: ActiveSmartFurnitureHookup[];
  private lastFetch?: Date;
  private fetchInProgress?: Promise<ActiveSmartFurnitureHookup[]>;

  constructor(private readonly monitoringService: MonitoringService) {}

  async getActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.fetchActiveSmartFurnitureHookups();
  }

  async getCachedOrFreshData(
    frequency: number,
  ): Promise<ActiveSmartFurnitureHookup[]> {
    if (
      this.lastActiveSmartFurnitureHookups &&
      this.isCachedDataFresh(frequency)
    ) {
      return this.lastActiveSmartFurnitureHookups;
    }

    if (!this.fetchInProgress) {
      this.fetchInProgress = this.fetchActiveSmartFurnitureHookups().finally(
        () => {
          this.fetchInProgress = undefined;
        },
      );
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

  private async fetchActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    return this.monitoringService.getActiveSmartFurnitureHookups();
  }
}
