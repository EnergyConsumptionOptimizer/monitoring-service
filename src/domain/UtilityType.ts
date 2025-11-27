import { InvalidUtilityTypeError } from "@domain/errors";

export enum UtilityType {
  GAS = "GAS",
  WATER = "WATER",
  ELECTRICITY = "ELECTRICITY",
}

export function utilityTypeFromString(value: string): UtilityType {
  const utilityType =
    UtilityType[value.toUpperCase() as keyof typeof UtilityType];

  if (!utilityType) {
    throw new InvalidUtilityTypeError(value);
  }

  return utilityType;
}
