import { ZoneIdEmptyError } from "@domain/errors";

export class ZoneID {
  private constructor(readonly value: string) {}

  static from(id: string): ZoneID | ZoneIdEmptyError {
    const trimmed = id.trim();

    if (!trimmed) {
      return new ZoneIdEmptyError();
    }

    return new ZoneID(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ZoneID): boolean {
    return this.value === other.value;
  }
}
