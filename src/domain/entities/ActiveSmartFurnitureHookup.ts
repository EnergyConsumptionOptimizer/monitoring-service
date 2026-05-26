import { SmartFurnitureHookup } from "@domain/entities/SmartFurnitureHookup";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";
import { UtilityType } from "@domain/values/UtilityType";

export class ActiveSmartFurnitureHookup extends SmartFurnitureHookup {
  readonly #consumption: ConsumptionValue;

  protected constructor(
    id: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumption: ConsumptionValue,
  ) {
    super(id, utilityType);
    this.#consumption = consumption;
  }

  get consumption(): ConsumptionValue {
    return this.#consumption;
  }

  static rehydrateActive(
    id: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumption: ConsumptionValue,
  ): ActiveSmartFurnitureHookup {
    return new ActiveSmartFurnitureHookup(id, utilityType, consumption);
  }

  toString() {
    return {
      ...super.toString(),
      consumption: this.consumption.toString(),
    };
  }
}
