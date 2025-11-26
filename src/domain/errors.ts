export class InvalidSmartFurnitureHookupIDError extends Error {
  constructor() {
    super("Invalid smart furniture hookup ID format");
    this.name = "InvalidSmartFurnitureHookupIDError";
  }
}

export class InvalidUtilityTypeError extends Error {
  constructor(type: string) {
    super(`Invalid utility type: ${type}`);
    this.name = "InvalidUtilityTypeError";
  }
}
