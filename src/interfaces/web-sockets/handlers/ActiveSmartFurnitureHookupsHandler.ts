import { MonitoringService } from "@domain/ports/MonitoringService";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";

export class ActiveSmartFurnitureHookupsHandler {
  private lastActiveSmartFurnitureHookups?: SmartFurnitureHookupID[];
  private lastFetch?: Date;
  private fetchInProgress?: Promise<SmartFurnitureHookupID[]>;

  constructor(private readonly monitoringService: MonitoringService) {}

  async getActiveSmartFurnitureHookups(): Promise<SmartFurnitureHookupID[]> {
    return this.fetchActiveSmartFurnitureHookups();
  }

  async getCachedOrFreshData(
    frequency: number,
  ): Promise<SmartFurnitureHookupID[]> {
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
    SmartFurnitureHookupID[]
  > {
    return this.monitoringService.getActiveSmartFurnitureHookups();
  }
}
