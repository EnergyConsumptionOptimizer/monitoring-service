import { InvalidUtilityTypeError, UtilityTypeEmptyError } from "../errors";

export enum UtilityTypeEnum {
  GAS = "gas",
  WATER = "water",
  ELECTRICITY = "electricity",
}

export class UtilityType {
  private constructor(public readonly value: UtilityTypeEnum) {}

  static from(
    name: string,
  ): UtilityType | UtilityTypeEmptyError | InvalidUtilityTypeError {
    const trimmed = name.trim();

    if (!trimmed) {
      return new UtilityTypeEmptyError();
    }

    const utilityType =
      UtilityTypeEnum[trimmed.toUpperCase() as keyof typeof UtilityTypeEnum];

    if (!utilityType) {
      throw new InvalidUtilityTypeError(utilityType);
    }

    return new UtilityType(utilityType);
  }

  static fromEnum(value: UtilityTypeEnum): UtilityType {
    return new UtilityType(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UtilityType): boolean {
    return this.value === other.value;
  }
}
