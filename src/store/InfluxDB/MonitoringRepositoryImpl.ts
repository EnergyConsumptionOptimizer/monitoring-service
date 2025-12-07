import { InfluxDBClient } from "./InfluxDBClient";
import { Measurement } from "@domain/Measurement";
import { MeasurementTag } from "./MeasurementTag";
import { Point } from "@influxdata/influxdb-client";
import { TimeRangeFilter } from "@domain/utils/TimeRangeFilter";
import { TagsFilter } from "@domain/utils/TagsFilter";
import { UtilityMeters } from "@domain/UtilityMeters";
import { UtilityType, utilityTypeFromString } from "@domain/UtilityType";
import { UtilityMetersModel } from "./models/UtilityMetersModel";
import { UtilityMetersQueryBuilder } from "./query/UtilityMetersQueryBuilder";
import { TimeSeriesFilter } from "@domain/utils/TimeSeriesFilter";
import { ConsumptionPoint } from "@domain/ConsumptionPoint";
import { ConsumptionSeriesQueryBuilder } from "./query/ConsumptionSeriesQueryBuilder";
import { ConsumptionPointModel } from "./models/ConsumptionPointModel";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { ActiveSmartFurnitureHookupsModel } from "./models/ActiveSmartFurnitureHookupsModel";
import { ActiveSmartFurnitureHookup } from "@domain/ActiveSmartFurnitureHookup";

export class MonitoringRepositoryImpl implements MonitoringRepository {
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

  async findActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    const query = `
      from(bucket: "${this.influxDB.getBucket()}")
        |> range(start: -60s)
        |> filter(fn: (r) => r._field == "value")
        |> filter(fn: (r) =>r._measurement == "${UtilityType.GAS}" or  r._measurement == "${UtilityType.ELECTRICITY}" or r._measurement == "${UtilityType.WATER}")
        |> last()
        |> filter(fn: (r) => r._value > 0)
        |> keep(columns: ["${MeasurementTag.SMART_FURNITURE_HOOKUP_ID}", "_value", "_measurement"])`;

    const result: ActiveSmartFurnitureHookupsModel[] =
      await this.influxDB.queryAsync(query);

    return result.map((activeSmartFurnitureHookups) => {
      return {
        id: new SmartFurnitureHookupID(
          activeSmartFurnitureHookups[MeasurementTag.SMART_FURNITURE_HOOKUP_ID],
        ),
        consumption: {
          value: activeSmartFurnitureHookups._value,
          utilityType: utilityTypeFromString(
            activeSmartFurnitureHookups._measurement,
          ),
        },
      };
    });
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

    const result: UtilityMetersModel[] = await this.influxDB.queryAsync(query);

    return result.reduce((acc, row) => {
      try {
        const utilityType = utilityTypeFromString(row._measurement);
        acc[utilityType] = row._value;
      } catch {
        console.error("Invalid utility measurement: ", row._measurement);
      }

      return acc;
    }, {} as UtilityMeters);
  }

  async findUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: TagsFilter,
  ): Promise<ConsumptionPoint[]> {
    const query = ConsumptionSeriesQueryBuilder.forBucket(
      this.influxDB.getBucket(),
    )
      .withUtility(utilityType)
      .withStart(filter?.from)
      .withStop(filter?.to)
      .withUser(tagsFilter?.username)
      .withWindow(filter?.granularity)
      .build();

    const result: ConsumptionPointModel[] =
      await this.influxDB.queryAsync(query);

    return result.map((point) => ({
      value: point._value,
      timestamp: new Date(point._time),
    }));
  }
}
