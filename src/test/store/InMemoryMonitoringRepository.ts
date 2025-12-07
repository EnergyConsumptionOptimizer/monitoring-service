import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { Measurement } from "@domain/Measurement";
import { UtilityMeters } from "@domain/UtilityMeters";
import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";

export class InMemoryMonitoringRepository implements MonitoringRepository {
  private readonly measurements: Measurement[] = [];

  async saveMeasurement(measurement: Measurement): Promise<void> {
    this.measurements.push(measurement);
  }

  async findActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    throw new Error("Method not implemented.");
  }

  async findUtilityConsumptions(): Promise<ConsumptionPoint[]> {
    throw new Error("Method not implemented.");
  }

  async findUtilityMeters(): Promise<UtilityMeters> {
    throw new Error("Method not implemented.");
  }

  getLastMeasurement(): Measurement | undefined {
    return this.measurements.at(-1);
  }
}
