import { InfluxDBClient } from "./InfluxDBClient";
import { Measurement } from "@domain/entities/Measurement";
import { MeasurementTag } from "./MeasurementTag";
import { Point } from "@influxdata/influxdb-client";
import { TimeRangeFilter } from "@domain/values/TimeRangeFilter";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { UtilityType, UtilityTypeEnum } from "@domain/values/UtilityType";
import { UtilityMetersModel } from "./models/UtilityMetersModel";
import { UtilityMetersQueryBuilder } from "./query/UtilityMetersQueryBuilder";
import { TimeSeriesFilter } from "@domain/values/TimeSeriesFilter";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { ConsumptionSeriesQueryBuilder } from "./query/ConsumptionSeriesQueryBuilder";
import { ConsumptionPointModel } from "./models/ConsumptionPointModel";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { ActiveSmartFurnitureHookupsModel } from "./models/ActiveSmartFurnitureHookupsModel";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { ZoneID } from "@domain/values/ZoneID";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import { MeasurementTags } from "@domain/values/MeasurementTags";
import { ConsumptionValue } from "@domain/values/ConsumptionValue";
import { UtilityConsumption } from "@domain/values/UtilityConsumption";

export class InfluxMonitoringRepository implements MonitoringRepository {
  constructor(private readonly influxDB: InfluxDBClient) {}

  async saveMeasurement(measurement: Measurement): Promise<void> {
    const point = new Point(measurement.utilityType.value)
      .tag(
        MeasurementTag.SMART_FURNITURE_HOOKUP_ID,
        measurement.smartFurnitureHookupID.value,
      )
      .floatField("value", measurement.consumptionValue)
      .timestamp(measurement.timestamp);

    if (measurement.tags.householdUserUsername)
      point.tag(
        MeasurementTag.HOUSEHOLD_USER_USERNAME,
        measurement.tags.householdUserUsername.value,
      );

    if (measurement.tags.zoneID)
      point.tag(MeasurementTag.ZONE_ID, measurement.tags.zoneID.value);

    await this.influxDB.writePoint(point);
  }

  async deleteHouseholdUserTagFromMeasurements(
    username: HouseholdUserUsername,
  ): Promise<void> {
    const query = `
    from(bucket: "${this.influxDB.getBucket()}")
      |> range(start: 0)
      |> filter(fn: (r) => r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} == "${username.value}")
      |> drop(columns: ["${MeasurementTag.HOUSEHOLD_USER_USERNAME}"])
      |> to(bucket: "${this.influxDB.getBucket()}")
      `;

    await this.influxDB.queryAsync(query);

    await this.influxDB.deleteAsync(
      MeasurementTag.HOUSEHOLD_USER_USERNAME,
      username.value,
    );
  }

  async deleteZoneIDTagFromMeasurements(zoneID: ZoneID): Promise<void> {
    const query = `
    from(bucket: "${this.influxDB.getBucket()}")
      |> range(start: 0)
      |> filter(fn: (r) => r.${MeasurementTag.ZONE_ID} == "${zoneID.value}")
      |> drop(columns: ["${MeasurementTag.ZONE_ID}"])
      |> to(bucket: "${this.influxDB.getBucket()}")
      `;

    await this.influxDB.queryAsync(query);

    await this.influxDB.deleteAsync(MeasurementTag.ZONE_ID, zoneID.value);
  }

  async findActiveSmartFurnitureHookups(): Promise<
    ActiveSmartFurnitureHookup[]
  > {
    const query = `
      from(bucket: "${this.influxDB.getBucket()}")
        |> range(start: -60s)
        |> filter(fn: (r) => r._field == "value")
        |> filter(fn: (r) =>r._measurement == "${UtilityTypeEnum.GAS}" or  r._measurement == "${UtilityTypeEnum.ELECTRICITY}" or r._measurement == "${UtilityTypeEnum.WATER}")
        |> last()
        |> filter(fn: (r) => r._value > 0)
        |> keep(columns: ["${MeasurementTag.SMART_FURNITURE_HOOKUP_ID}", "_value", "_measurement"])`;

    const result: ActiveSmartFurnitureHookupsModel[] =
      await this.influxDB.queryAsync(query);

    return result.map((activeSmartFurnitureHookups) => {
      return ActiveSmartFurnitureHookup.rehydrateActive(
        SmartFurnitureHookupID.from(
          activeSmartFurnitureHookups[MeasurementTag.SMART_FURNITURE_HOOKUP_ID],
        ) as SmartFurnitureHookupID,
        UtilityType.from(
          activeSmartFurnitureHookups._measurement,
        ) as UtilityType,
        ConsumptionValue.from(
          activeSmartFurnitureHookups._value,
        ) as ConsumptionValue,
      );
    });
  }

  async findUtilityMeters(
    filter?: TimeRangeFilter,
    tagsFilter?: MeasurementTags,
  ): Promise<UtilityMeters> {
    const query = UtilityMetersQueryBuilder.forBucket(this.influxDB.getBucket())
      .withStart(filter?.from)
      .withStop(filter?.to)
      .withUser(tagsFilter?.householdUserUsername)
      .withZone(tagsFilter?.zoneID)
      .build();

    const result: UtilityMetersModel[] = await this.influxDB.queryAsync(query);

    const point = result.reduce((acc, row) => {
      const utilityType = UtilityType.from(row._measurement) as UtilityType;
      const value = ConsumptionValue.from(row._value) as ConsumptionValue;

      acc.push(
        UtilityConsumption.from(value, utilityType) as UtilityConsumption,
      );
      return acc;
    }, [] as UtilityConsumption[]);

    return UtilityMeters.from(point) as UtilityMeters;
  }

  async findUtilityConsumptions(
    utilityType: UtilityType,
    filter?: TimeSeriesFilter,
    tagsFilter?: MeasurementTags,
  ): Promise<UtilityConsumptionPoint[]> {
    const query = ConsumptionSeriesQueryBuilder.forBucket(
      this.influxDB.getBucket(),
    )
      .withUtility(utilityType)
      .withStart(filter?.from)
      .withStop(filter?.to)
      .withUser(tagsFilter?.householdUserUsername)
      .withZone(tagsFilter?.zoneID)
      .withWindow(filter?.granularity)
      .build();
    const result: ConsumptionPointModel[] =
      await this.influxDB.queryAsync(query);

    return result.map((point) => {
      const consumptionValue = ConsumptionValue.from(
        point._value,
      ) as ConsumptionValue;
      return UtilityConsumptionPoint.from(
        consumptionValue,
        new Date(point._time),
      );
    });
  }
}
