export enum UtilityType {
  GAS = "gas",
  WATER = "water",
  ELECTRICITY = "electricity",
}

export function utilityTypeFromString(value: string): UtilityType {
  return UtilityType[value.toUpperCase() as keyof typeof UtilityType];
}
