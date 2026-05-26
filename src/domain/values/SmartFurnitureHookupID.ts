import { SmartFurnitureHookupIdEmptyError } from "@domain/errors";

export class SmartFurnitureHookupID {
  private constructor(readonly value: string) {}

  static from(
    id: string,
  ): SmartFurnitureHookupID | SmartFurnitureHookupIdEmptyError {
    const trimmed = id.trim();

    if (!trimmed) {
      return new SmartFurnitureHookupIdEmptyError();
    }

    return new SmartFurnitureHookupID(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: SmartFurnitureHookupID): boolean {
    return this.value === other.value;
  }
}
