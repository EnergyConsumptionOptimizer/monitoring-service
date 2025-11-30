import { InfluxDBClient } from "./InfluxDBClient";
import { Measurement } from "@domain/Measurement";
import { MeasurementTag } from "./MeasurementTag";
import { Point } from "@influxdata/influxdb-client";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";
import { UtilityMeters } from "@domain/UtilityMeters";
import { utilityTypeFromString } from "@domain/UtilityType";
import { RawUtilityMeters } from "./RawUtilityMeters";
import { UtilityMetersQueryBuilder } from "./query/UtilityMetersQueryBuilder";

export class MonitoringRepositoryImpl {
  constructor(private readonly influxDB: InfluxDBClient) {}

  async saveMeasurement(measurement: Measurement): Promise<void> {
    const point = new Point(measurement.utilityType)
      .tag(
        MeasurementTag.SMART_FURNITURE_HOOKUP_ID,
        measurement.smartFurnitureHookupID.value(),
      )
      .floatField("value", measurement.consumptionValue)
      .timestamp(measurement.timestamp);

    if (measurement.tags.householdUserUsername)
      point.tag(
        MeasurementTag.HOUSEHOLD_USER_USERNAME,
        measurement.tags.householdUserUsername.value(),
      );

    await this.influxDB.writePoint(point);
  }

  async findUtilityMeters(
    filter?: TimeRangeFilter,
    tagsFilter?: TagsFilter,
  ): Promise<UtilityMeters> {
    const query = UtilityMetersQueryBuilder.forBucket(this.influxDB.getBucket())
      .withStart(filter?.from)
      .withStop(filter?.to)
      .withUser(tagsFilter?.username)
      .build();

    const result: RawUtilityMeters[] = await this.influxDB.queryAsync(query);

    return result.reduce((acc, row) => {
      try {
        const utilityType = utilityTypeFromString(row._measurement);
        acc[utilityType] = row._value;
      } catch (_err) {
        console.error(_err);
      }

      return acc;
    }, {} as UtilityMeters);
  }
}
