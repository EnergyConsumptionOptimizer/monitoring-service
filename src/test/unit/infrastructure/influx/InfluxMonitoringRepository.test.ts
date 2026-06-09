import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { MeasurementTag } from "@infrastructure/persistence/influxDB/MeasurementTag";
import { InfluxDBClient } from "@infrastructure/persistence/influxDB/InfluxDBClient";
import { InfluxMonitoringRepository } from "@infrastructure/persistence/influxDB/InfluxMonitoringRepository";
import {
  aMeasurement,
  mockActiveSmartFurnitureHookupBathroomSink,
  mockActiveSmartFurnitureHookupKitchenSink,
  validHouseholdUserUsername,
  validMeasurementTags,
  validTimeRangeFilter,
  validTimeSeriesFilter,
  validUtilityType,
  validZoneId,
} from "@test/domainFactories";
import { Point } from "@influxdata/influxdb-client";
import { UtilityTypeEnum } from "@domain/values/UtilityType";
import { convertToUnitFormat } from "@infrastructure/persistence/influxDB/query/TimeRangeInfluxConverter";
import { TimeString } from "@domain/TimeString";

function makeUtilityMetersRow(measurement: string, value: number) {
  return { _measurement: measurement, _value: value };
}

function makeConsumptionPointRow(value: number, time: string) {
  return { _value: value, _time: time };
}

function makeActiveHookupRow(id: string, measurement: string, value: number) {
  return {
    [MeasurementTag.SMART_FURNITURE_HOOKUP_ID]: id,
    _measurement: measurement,
    _value: value,
  };
}

describe("InfluxMonitoringRepository (unit)", () => {
  let influxDB: MockProxy<InfluxDBClient>;
  let repo: InfluxMonitoringRepository;

  beforeEach(() => {
    influxDB = mock<InfluxDBClient>();
    influxDB.getBucket.mockReturnValue("test-bucket");
    repo = new InfluxMonitoringRepository(influxDB);
  });

  describe("saveMeasurement", () => {
    it("writes a point with all tags when tags are present", async () => {
      const measurement = aMeasurement({
        tags: {
          username: validHouseholdUserUsername().value,
          zoneId: validZoneId().value,
        },
      });

      influxDB.writePoint.mockResolvedValue(undefined);

      await repo.saveMeasurement(measurement);

      expect(influxDB.writePoint).toHaveBeenCalledOnce();
      const point = influxDB.writePoint.mock.calls[0][0];

      expect(point).toBeInstanceOf(Point);

      const flatPoint = point.toLineProtocol();

      expect(flatPoint).toContain(measurement.utilityType.value.toString());
      expect(flatPoint).toContain(
        `${MeasurementTag.SMART_FURNITURE_HOOKUP_ID}=${measurement.smartFurnitureHookupID.value}`,
      );
      expect(flatPoint).toContain(
        `${MeasurementTag.HOUSEHOLD_USER_USERNAME}=${measurement.tags.householdUserUsername?.value}`,
      );
      expect(flatPoint).toContain(
        `${MeasurementTag.ZONE_ID}=${measurement.tags.zoneID?.value}`,
      );
      expect(flatPoint).toContain(
        `value=${measurement.consumptionValue.value}`,
      );
    });

    it("writes a point without optional tags when tags are absent", async () => {
      const measurement = aMeasurement({
        tags: null,
      });

      influxDB.writePoint.mockResolvedValue(undefined);

      await repo.saveMeasurement(measurement);
      const point = influxDB.writePoint.mock.calls[0][0];
      const flatPoint = point.toLineProtocol();

      expect(point).toBeInstanceOf(Point);
      expect(influxDB.writePoint).toHaveBeenCalledOnce();
      expect(flatPoint).not.toContain(
        `${MeasurementTag.HOUSEHOLD_USER_USERNAME}=${measurement.tags.householdUserUsername?.value}`,
      );
      expect(flatPoint).not.toContain(
        `${MeasurementTag.ZONE_ID}=${measurement.tags.zoneID?.value}`,
      );
    });
  });

  describe("deleteHouseholdUserTagFromMeasurements", () => {
    it("runs a drop query and then a delete for the given username", async () => {
      const username = validHouseholdUserUsername();
      influxDB.queryAsync.mockResolvedValue([]);
      influxDB.deleteAsync.mockResolvedValue(undefined);

      await repo.deleteHouseholdUserTagFromMeasurements(username);

      expect(influxDB.queryAsync).toHaveBeenCalledTimes(1);

      expect(influxDB.queryAsync.mock.calls[0][0]).toContain(
        MeasurementTag.HOUSEHOLD_USER_USERNAME,
      );

      expect(influxDB.deleteAsync).toHaveBeenCalledWith(
        MeasurementTag.HOUSEHOLD_USER_USERNAME,
        username.value,
      );
    });
  });

  describe("deleteZoneIDTagFromMeasurements", () => {
    it("runs a drop query and then a delete for the given zoneID", async () => {
      const zoneID = validZoneId();
      influxDB.queryAsync.mockResolvedValue([]);
      influxDB.deleteAsync.mockResolvedValue(undefined);

      await repo.deleteZoneIDTagFromMeasurements(zoneID);

      expect(influxDB.queryAsync).toHaveBeenCalledTimes(1);

      expect(influxDB.queryAsync.mock.calls[0][0]).toContain(
        MeasurementTag.ZONE_ID,
      );

      expect(influxDB.deleteAsync).toHaveBeenCalledWith(
        MeasurementTag.ZONE_ID,
        zoneID.value,
      );
    });
  });

  describe("findActiveSmartFurnitureHookups", () => {
    it("returns an empty list when no rows come back", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const result = await repo.findActiveSmartFurnitureHookups();

      expect(result).toEqual([]);
    });

    it("maps raw rows to ActiveSmartFurnitureHookup domain objects", async () => {
      const active = [
        mockActiveSmartFurnitureHookupBathroomSink,
        mockActiveSmartFurnitureHookupKitchenSink,
      ];

      influxDB.queryAsync.mockResolvedValue([
        makeActiveHookupRow(
          active[0].id.value,
          active[0].utilityType.toString(),
          active[0].consumption.value,
        ),
        makeActiveHookupRow(
          active[1].id.value,
          active[1].utilityType.toString(),
          active[1].consumption.value,
        ),
      ]);

      const result = await repo.findActiveSmartFurnitureHookups();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockActiveSmartFurnitureHookupBathroomSink);
      expect(result[1]).toEqual(mockActiveSmartFurnitureHookupKitchenSink);
    });
  });

  describe("findUtilityMeters", () => {
    it("returns UtilityMeters with no filter", async () => {
      influxDB.queryAsync.mockResolvedValue([
        makeUtilityMetersRow(UtilityTypeEnum.ELECTRICITY, 200),
      ]);

      const meters = await repo.findUtilityMeters();

      expect(meters).toBeDefined();
    });

    it("passes user + zone filters through to the query builder", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const tags = validMeasurementTags();
      await repo.findUtilityMeters(undefined, tags);

      const [fluxQuery] = influxDB.queryAsync.mock.calls[0];

      expect(fluxQuery).toContain(tags.householdUserUsername?.value);
      expect(fluxQuery).toContain(tags.zoneID?.value);
    });

    it("passes time-range filter through to the query builder", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const filter = validTimeRangeFilter();
      await repo.findUtilityMeters(filter);

      const [fluxQuery] = influxDB.queryAsync.mock.calls[0];

      expect(fluxQuery).toContain("start");
      expect(fluxQuery).toContain("stop");
    });

    it("returns empty UtilityMeters when no rows are returned", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const meters = await repo.findUtilityMeters();

      expect(meters).toBeDefined();
    });
  });

  describe("findUtilityConsumptions", () => {
    it("returns an empty array when no rows come back", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const result = await repo.findUtilityConsumptions(
        validUtilityType(UtilityTypeEnum.ELECTRICITY),
      );

      expect(result).toEqual([]);
    });

    it("maps raw rows to UtilityConsumptionPoint domain objects", async () => {
      influxDB.queryAsync.mockResolvedValue([
        makeConsumptionPointRow(50, "2026-05-21T10:00:00.000Z"),
        makeConsumptionPointRow(75, "2026-05-21T11:00:00.000Z"),
      ]);

      const result = await repo.findUtilityConsumptions(
        validUtilityType(UtilityTypeEnum.ELECTRICITY),
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({}));
    });

    it("includes utilityType filter in the query", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      await repo.findUtilityConsumptions(validUtilityType(UtilityTypeEnum.GAS));

      const [fluxQuery] = influxDB.queryAsync.mock.calls[0];
      expect(fluxQuery).toContain(UtilityTypeEnum.GAS);
    });

    it("passes user + zone tags through to the query", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const tags = validMeasurementTags();
      await repo.findUtilityConsumptions(
        validUtilityType(UtilityTypeEnum.WATER),
        undefined,
        tags,
      );

      const [fluxQuery] = influxDB.queryAsync.mock.calls[0];
      expect(fluxQuery).toContain(tags.householdUserUsername?.value);
      expect(fluxQuery).toContain(tags.zoneID?.value);
    });

    it("passes time-series filter with granularity through to the query", async () => {
      influxDB.queryAsync.mockResolvedValue([]);

      const filter = validTimeSeriesFilter();
      await repo.findUtilityConsumptions(
        validUtilityType(UtilityTypeEnum.ELECTRICITY),
        filter,
      );

      const [fluxQuery] = influxDB.queryAsync.mock.calls[0];
      expect(fluxQuery).toContain(
        convertToUnitFormat(filter.granularity as TimeString, "1h"),
      );
    });
  });
});
