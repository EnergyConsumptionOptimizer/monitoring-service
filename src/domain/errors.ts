export function stripErrors<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: Exclude<T[K], Error> } | Error {
  const error = Object.values(obj).find((v): v is Error => v instanceof Error);
  return error ?? (obj as { [K in keyof T]: Exclude<T[K], Error> });
}

export const DomainErrorCode = {
  EMPTY_FIELD: "EMPTY_FIELD",
  UNIQUE_FIELD_ALREADY_EXISTS: "UNIQUE_FIELD_ALREADY_EXISTS",
  INVALID_FIELD: "INVALID_FIELD",
  NOT_FOUND: "NOT_FOUND",
} as const;

export abstract class DomainError extends Error {
  public abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ==========================================
// Empty Field Errors
// ==========================================

export abstract class EmptyFieldError extends DomainError {
  public readonly code = DomainErrorCode.EMPTY_FIELD;

  protected constructor(fieldName: string) {
    super(`${fieldName} must not be empty`);
  }
}

export class UtilityTypeEmptyError extends EmptyFieldError {
  constructor() {
    super("Utility type");
  }
}

export class SmartFurnitureHookupIdEmptyError extends EmptyFieldError {
  constructor() {
    super("SmartFurnitureHookupID");
  }
}

export class ZoneIdEmptyError extends EmptyFieldError {
  constructor() {
    super("ZoneIdEmptyError");
  }
}

export class HouseholdUserUsernameEmptyError extends EmptyFieldError {
  constructor() {
    super("HouseholdUserUsername");
  }
}

// ==========================================
// Unique Field Conflict Errors
// ==========================================
export abstract class UniqueFieldAlreadyExistsError extends DomainError {
  public readonly code = DomainErrorCode.UNIQUE_FIELD_ALREADY_EXISTS;

  protected constructor(fieldName: string, fieldValue: string) {
    super(`${fieldName} ${fieldValue} already exists`);
  }
}

// ==========================================
// Resource Not Found Errors
// ==========================================

export class NotFoundError extends DomainError {
  public readonly code = DomainErrorCode.NOT_FOUND;

  constructor(entityName = "Resource") {
    super(`${entityName} not found`);
  }
}

export class SmartFurnitureHookupNotFoundError extends NotFoundError {
  constructor() {
    super("Smart furniture hookup");
  }
}

// ==========================================
// Other Domain Errors
// ==========================================

export class InvalidFieldError extends DomainError {
  public readonly code = DomainErrorCode.INVALID_FIELD;

  constructor(field: string, value: string) {
    super(`Invalid value: ${value} for field ${field}`);
  }
}

export class InvalidUtilityTypeError extends InvalidFieldError {
  constructor(type: string) {
    super("UtilityType", type);
  }
}

export class InvalidConsumptionValueError extends InvalidFieldError {
  constructor(value: number) {
    super("ConsumptionValue", value.toString());
  }
}
