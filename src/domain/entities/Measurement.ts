import { MeasurementTags } from "../values/MeasurementTags";
import { UtilityType } from "../values/UtilityType";
import { SmartFurnitureHookupID } from "../values/SmartFurnitureHookupID";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";

export class Measurement {
  #smartFurnitureHookupID: SmartFurnitureHookupID;
  #utilityType: UtilityType;
  #consumptionValue: ConsumptionValue;
  #timestamp: Date;
  #tags: MeasurementTags;

  constructor(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumptionValue: ConsumptionValue,
    timestamp: Date,
    tags: MeasurementTags,
  ) {
    this.#smartFurnitureHookupID = smartFurnitureHookupID;
    this.#utilityType = utilityType;
    this.#consumptionValue = consumptionValue;
    this.#timestamp = timestamp;
    this.#tags = tags;
  }

  get smartFurnitureHookupID(): SmartFurnitureHookupID {
    return this.#smartFurnitureHookupID;
  }

  get utilityType(): UtilityType {
    return this.#utilityType;
  }

  get consumptionValue(): ConsumptionValue {
    return this.#consumptionValue;
  }

  get timestamp(): Date {
    return new Date(this.#timestamp.getTime());
  }

  get tags(): MeasurementTags {
    return this.#tags;
  }

  static create(
    smartFurnitureHookupID: SmartFurnitureHookupID,
    utilityType: UtilityType,
    consumptionValue: ConsumptionValue,
    timestamp: Date,
    tags: MeasurementTags,
  ): Measurement {
    return new Measurement(
      smartFurnitureHookupID,
      utilityType,
      consumptionValue,
      timestamp,
      tags,
    );
  }
}
