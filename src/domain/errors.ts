export class InvalidUtilityTypeError extends Error {
  constructor(type: string) {
    super(`Invalid utility type: ${type}`);
    this.name = "InvalidUtilityTypeError";
  }
}
