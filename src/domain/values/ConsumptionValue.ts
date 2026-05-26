import { InvalidConsumptionValueError } from "@domain/errors";

export class ConsumptionValue {
  private constructor(readonly value: number) {}

  static from(
    consumption: number,
  ): ConsumptionValue | InvalidConsumptionValueError {
    if (isNaN(consumption) || consumption < 0) {
      return new InvalidConsumptionValueError(consumption);
    }

    return new ConsumptionValue(consumption);
  }

  toString(): string {
    return this.value.toString();
  }

  equals(other: ConsumptionValue): boolean {
    return this.value === other.value;
  }
}
