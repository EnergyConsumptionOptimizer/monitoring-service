import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { UtilityType } from "@domain/values/UtilityType";

export class SmartFurnitureHookup {
  readonly #utilityType: UtilityType;

  protected constructor(
    public readonly id: SmartFurnitureHookupID,
    utilityType: UtilityType,
  ) {
    this.#utilityType = utilityType;
  }

  get utilityType(): UtilityType {
    return this.#utilityType;
  }

  static rehydrate(
    id: SmartFurnitureHookupID,
    utilityType: UtilityType,
  ): SmartFurnitureHookup {
    return new SmartFurnitureHookup(id, utilityType);
  }

  toString() {
    return {
      id: this.id.toString(),
      utilityType: this.utilityType.toString(),
    };
  }
}
