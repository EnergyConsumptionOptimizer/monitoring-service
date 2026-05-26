import { ConsumptionValue } from "@domain/values/ConsumptionValue";

export class UtilityConsumptionPoint {
  private constructor(
    readonly consumption: ConsumptionValue,
    readonly timestamp: Date,
  ) {}

  static from(
    consumption: ConsumptionValue,
    timestamp: Date,
  ): UtilityConsumptionPoint {
    return new UtilityConsumptionPoint(consumption, timestamp);
  }

  toString(): string {
    return `${this.consumption.value}, ${this.timestamp.toString()}`;
  }

  equals(other: UtilityConsumptionPoint): boolean {
    return (
      this.consumption.equals(other.consumption) &&
      this.timestamp === other.timestamp
    );
  }
}
