import { UtilityType } from "@domain/values/UtilityType";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";

export class UtilityConsumption {
  private constructor(
    readonly consumption: ConsumptionValue,
    readonly utilityType: UtilityType,
  ) {}

  static from(
    consumption: ConsumptionValue,
    utilityType: UtilityType,
  ): UtilityConsumption {
    return new UtilityConsumption(consumption, utilityType);
  }

  toString(): string {
    return `${this.consumption.value}, ${this.utilityType.value}`;
  }

  equals(other: UtilityConsumption): boolean {
    return (
      this.consumption.equals(other.consumption) &&
      this.utilityType.equals(other.utilityType)
    );
  }
}
