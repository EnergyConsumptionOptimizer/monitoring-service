import { ConsumptionValue } from "@domain/values/ConsumptionValue";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { MeasurementTags } from "@domain/values/MeasurementTags";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { ZoneID } from "@domain/values/ZoneID";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { UtilityType, UtilityTypeEnum } from "@domain/values/UtilityType";
import { SmartFurnitureHookup } from "@domain/entities/SmartFurnitureHookup";
import { Measurement } from "@domain/entities/Measurement";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { TimeString } from "@domain/TimeString";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";

export function validConsumptionValue(value = 100): ConsumptionValue {
  return ConsumptionValue.from(value) as ConsumptionValue;
}

export function validHouseholdUserUsername(
  value = "testUser",
): HouseholdUserUsername {
  return HouseholdUserUsername.from(value) as HouseholdUserUsername;
}

export function validZoneId(value = "zone-1"): ZoneID {
  return ZoneID.from(value) as ZoneID;
}

export function validMeasurementTags(values?: {
  username?: string;
  zoneId?: string;
}): MeasurementTags {
  return MeasurementTags.builder()
    .withUsername(validHouseholdUserUsername(values?.username))
    .withZoneID(validZoneId(values?.zoneId))
    .build();
}

export function validSmartFurnitureHookupId(
  value = "sfh-1",
): SmartFurnitureHookupID {
  return SmartFurnitureHookupID.from(value) as SmartFurnitureHookupID;
}

export function validUtilityType(
  value = UtilityTypeEnum.ELECTRICITY.valueOf(),
) {
  return UtilityType.from(value) as UtilityType;
}

export function validUtilityConsumption(values?: {
  consumption?: number;
  utilityType?: string;
}): UtilityConsumption {
  return UtilityConsumption.from(
    validConsumptionValue(values?.consumption),
    validUtilityType(values?.utilityType),
  );
}

export function validUtilityConsumptionPoint(
  consumption = validConsumptionValue(),
  timestamp = new Date("2026-05-21T10:00:00Z"),
): UtilityConsumptionPoint {
  return UtilityConsumptionPoint.from(consumption, timestamp);
}

export function validUtilityMeters(
  consumptions: UtilityConsumption[] = [validUtilityConsumption()],
): UtilityMeters {
  return UtilityMeters.from(consumptions) as UtilityMeters;
}

export function validTimeRangeFilter(
  values: {
    from?: TimeString;
    to?: TimeString;
  } = {
    from: "4hours",
    to: "2hours",
  },
) {
  return TimeRangeFilter.builder()
    .withFrom(values.from)
    .withTo(values.to)
    .build();
}

export function validTimeSeriesFilter(
  values: {
    from?: TimeString;
    to?: TimeString;
    granularity?: TimeString;
  } = {
    from: "4hours",
    to: "2hours",
    granularity: "5minute",
  },
) {
  return TimeSeriesFilter.builder()
    .withFrom(values.from)
    .withTo(values.to)
    .withGranularity(values.granularity)
    .build();
}

export function aSmartFurnitureHookup(values?: {
  id?: string;
  utilityType?: string;
}) {
  return SmartFurnitureHookup.rehydrate(
    validSmartFurnitureHookupId(values?.id),
    validUtilityType(values?.utilityType),
  );
}

export function aActiveSmartFurnitureHookup(values?: {
  id?: string;
  utilityType?: string;
  consumption: number;
}) {
  return ActiveSmartFurnitureHookup.rehydrateActive(
    validSmartFurnitureHookupId(values?.id),
    validUtilityType(values?.utilityType),
    validConsumptionValue(values?.consumption),
  );
}

export function aMeasurement(values?: {
  smartFurnitureHookupID?: string;
  utilityType?: string;
  consumptionValue?: number;
  timestamp?: Date;
  tags?: {
    username?: string;
    zoneId?: string;
  } | null;
}): Measurement {
  const measurementTags =
    values?.tags === null
      ? MeasurementTags.builder().build()
      : validMeasurementTags(values?.tags);

  return Measurement.create(
    validSmartFurnitureHookupId(values?.smartFurnitureHookupID),
    validUtilityType(values?.utilityType),
    validConsumptionValue(values?.consumptionValue),
    values?.timestamp ?? new Date(),
    measurementTags,
  );
}

function toDomain(
  id: string,
  utilityType: string,
  consumption: ConsumptionValue,
) {
  return ActiveSmartFurnitureHookup.rehydrateActive(
    SmartFurnitureHookupID.from(id) as SmartFurnitureHookupID,
    UtilityType.from(utilityType) as UtilityType,
    consumption,
  );
}

export const mockActiveSmartFurnitureHookupBathroomSink = toDomain(
  "sfh-1",
  "WATER",
  validConsumptionValue(3),
);

export const mockActiveSmartFurnitureHookupKitchenSink = toDomain(
  "sfh-2",
  "WATER",
  validConsumptionValue(4),
);
