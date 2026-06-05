import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { StartedTestContainer } from "testcontainers";
import { DeleteAPI } from "@influxdata/influxdb-client-apis";
import {
  composeServerForComponentTest,
  mockHouseholdUserService,
  mockMapService,
  mockSmartFurnitureHookupService,
  setupInfluxContainer,
} from "@test/component/composeServer";
import { InfluxDBClient } from "@infrastructure/persistence/influxDB/InfluxDBClient";
import request from "supertest";
import http from "http";
import {
  aSmartFurnitureHookup,
  validConsumptionValue,
  validHouseholdUserUsername,
  validSmartFurnitureHookupId,
  validZoneId,
} from "@test/domainFactories";
import { MeasurementTag } from "@infrastructure/persistence/influxDB/MeasurementTag";
import { StatusCodes } from "http-status-codes";

let container: StartedTestContainer;
let influxClient: InfluxDBClient;
let server: http.Server;

beforeAll(async () => {
  ({ influxClient, container } = await setupInfluxContainer());

  const composed = await composeServerForComponentTest(influxClient);

  server = composed.server;
}, 60_000);

beforeEach(async () => {
  const deleteApi = new DeleteAPI(influxClient.getInfluxDB());

  await deleteApi.postDelete({
    org: "test-org",
    bucket: "test-bucket",
    body: {
      start: "1970-01-01T00:00:00Z",
      stop: new Date().toISOString(),
      predicate: "",
    },
  });
});

afterAll(async () => {
  await influxClient?.close?.();
  await container?.stop();
});

function waitForFlush(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestMeasurement(params: {
  smartFurnitureHookupId?: unknown;
  realTimeConsumption?: unknown;
  timestamp?: unknown;
  username?: unknown;
}) {
  const query: Record<string, string> = {};
  if (params.smartFurnitureHookupId !== undefined) {
    query["smart_furniture_hookup_id"] =
      params.smartFurnitureHookupId as string;
  }
  return request(server).post("/api/measurements").query(query).send({
    realTimeConsumption: params.realTimeConsumption,
    timestamp: params.timestamp,
    username: params.username,
  });
}

async function queryAllMeasurements(filter = ""): Promise<unknown[]> {
  const rows: unknown[] = [];
  const query = `
    from(bucket: "test-bucket")
      |> range(start: 0)
      ${filter}
  `;
  for await (const row of await influxClient.queryAsync(query)) {
    rows.push(row);
  }
  return rows;
}

describe("Measurement management Component", () => {
  describe("Feature: Ingest measurement", () => {
    describe("Scenario: Create simple measurement without tags", () => {
      it(
        "Given valid data and the smart furniture hookup exists " +
          "When measurement is ingested, Then the measurement is saved",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements();
          expect(rows.length).toBeGreaterThan(0);
        },
      );
      it(
        "Given an invalid smartFurnitureHookupID " +
          "When measurement is ingested, Then the measurement is discarded",
        async () => {
          const response = await ingestMeasurement({
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
          expect(response.body.code).toBe("VALIDATION_ERROR");
        },
      );

      it(
        "Given an invalid consumptionValue " +
          "When measurement is ingested, Then the measurement is discarded",
        async () => {
          const response = await ingestMeasurement({
            smartFurnitureHookupId: validSmartFurnitureHookupId().value,
            realTimeConsumption: -2,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
          expect(response.body.code).toBe("VALIDATION_ERROR");
        },
      );

      it(
        "Given a valid data and the smart furniture hookup doesn't exists " +
          "When measurement is ingested, Then the measurement is discarded",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            undefined,
          );

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(404);
        },
      );
    });
    describe("Scenario: Create measurement with user tag", () => {
      it(
        "Given a valid data and the smart furniture hookup exists and no username value provided " +
          "When measurement is ingested, Then the measurement is saved without user tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);
          mockHouseholdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
            false,
          );

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => exists r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} != "")`,
          );
          expect(rows.length).toBe(0);
        },
      );

      it(
        "Given a valid data and the smart furniture hookup exists and the user tag is provided and the user exists " +
          "When measurement is ingested, Then the measurement is saved with user tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);
          mockHouseholdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
            true,
          );

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
            username: validHouseholdUserUsername().value,
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => exists r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} != "")`,
          );
          expect(rows.length).toBeGreaterThan(0);
        },
      );

      it(
        "Given a valid data and the smart furniture hookup exists and the user tag is provided and the user doesnt exists " +
          "When measurement is ingested, Then the measurement is saved without user tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);
          mockHouseholdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
            false,
          );

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
            username: validHouseholdUserUsername().value,
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => exists r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} != "")`,
          );

          expect(rows.length).toBe(0);
        },
      );
    });
    describe("Scenario: Create measurement with zone tag", () => {
      it(
        "Given a valid data and the smart furniture hookup exists and smart furniture hookup dont belong to any zone " +
          "When measurement is ingested, Then the measurement is saved without zone tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => exists r.${MeasurementTag.ZONE_ID} and r.${MeasurementTag.ZONE_ID} != "")`,
          );
          expect(rows.length).toBe(0);
        },
      );

      it(
        "Given a valid data and the smart furniture hookup exists and the smart furniture hookup belong to a zone " +
          "When measurement is ingested, Then the measurement is saved with zone tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue({
            zoneID: validZoneId().value,
          });

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => exists r.${MeasurementTag.ZONE_ID} and r.${MeasurementTag.ZONE_ID} != "")`,
          );
          expect(rows.length).toBeGreaterThan(0);
        },
      );
    });
    describe("Scenario: Create measurement with multiple tags", () => {
      it(
        "Given a valid data and the smart furniture hookup exists and the user tag is provided and the user exists" +
          " and the smart furniture hookup belong to a zone" +
          "When measurement is ingested, Then the measurement is saved with user and zone tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockHouseholdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
            true,
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue({
            zoneID: validZoneId().value,
          });

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
            username: validHouseholdUserUsername().value,
          });

          expect(response.status).toBe(201);
          await waitForFlush();
          const rows =
            await queryAllMeasurements(`|> filter(fn: (r) => exists r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} and r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} != "")
        |> filter(fn: (r) => exists r.${MeasurementTag.ZONE_ID} and r.${MeasurementTag.ZONE_ID} != "")`);
          expect(rows.length).toBeGreaterThan(0);
        },
      );
    });
    describe("Scenario: Create measurement when cannot resolve tag", () => {
      it(
        "Given a valid data and cannot resolve tag smart furniture hookup " +
          "When measurement is ingested, Then the measurement is discarded",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            new Error(),
          );

          const response = await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        },
      );
    });
  });
  describe("Feat: Remove tags", () => {
    describe("Scenario: Remove user association from measurements", () => {
      it(
        "Given the system contains measurements tagged with the username" +
          "When a request is made to remove the user from all measurements, Then the measurement remain in the database without the user tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue(null);
          mockHouseholdUserService.isHouseholdUserUsernameValid.mockResolvedValue(
            true,
          );

          await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
            username: validHouseholdUserUsername().value,
          });

          await waitForFlush();
          const deleteResponse = await request(server)
            .delete(
              `/api/internal/measurements/household-user-tags/${validHouseholdUserUsername().value}`,
            )
            .send();

          expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
          await waitForFlush();

          const rows1 = await queryAllMeasurements();
          expect(rows1.length).toBeGreaterThan(0);

          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => r.${MeasurementTag.HOUSEHOLD_USER_USERNAME} != "${validHouseholdUserUsername().value}")`,
          );
          expect(rows.length).toBeGreaterThan(0);
        },
      );
    });
    describe("Scenario: Remove zone association from measurements", () => {
      it(
        "Given the system contains measurements tagged with the zone" +
          "When a request is made to remove the zone from all measurements, Then the measurement remain in the database without the zone tag",
        async () => {
          const hookup = aSmartFurnitureHookup();

          mockSmartFurnitureHookupService.getSmartFurnitureHookup.mockResolvedValue(
            {
              id: hookup.id.value,
              utilityType: hookup.utilityType.toString(),
            },
          );

          mockMapService.isSmartFurnitureHookupInAZone.mockResolvedValue({
            zoneID: validZoneId().value,
          });

          await ingestMeasurement({
            smartFurnitureHookupId: hookup.id.value,
            realTimeConsumption: validConsumptionValue().value,
            timestamp: new Date().toISOString(),
          });

          await waitForFlush();
          const deleteResponse = await request(server)
            .delete(
              `/api/internal/measurements/zone-tags/${validZoneId().value}`,
            )
            .send();

          expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
          await waitForFlush();
          const rows = await queryAllMeasurements(
            `|> filter(fn: (r) => r.${MeasurementTag.ZONE_ID} != "${validZoneId().value}")`,
          );
          expect(rows.length).toBeGreaterThan(0);
        },
      );
    });
  });
});
