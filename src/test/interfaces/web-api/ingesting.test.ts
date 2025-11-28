import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import { IngestingService } from "@domain/ports/IngestingService";
import { IngestingController } from "@interfaces/web-api/controllers/IngestingController";
import { router } from "@interfaces/web-api/routes/routes";
import { errorHandler } from "@interfaces/web-api/middlewares/errorHandlerMiddleware";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { InvalidSmartFurnitureHookupIDError } from "@domain/errors";

describe("Ingesting REST API", () => {
  const url = "/api/internal/measurements";
  let app: Express;
  let mockIngestingService: IngestingService;
  let ingestingController: IngestingController;

  const TEST_HOOKUP_ID = "aaa-000";

  const VALID_MEASUREMENT_BODY = {
    realTimeConsumption: 100,
    timestamp: new Date("2025-11-28T10:00:00Z"),
    householdUserUsername: "user123",
  };

  beforeAll(() => {
    mockIngestingService = {
      createMeasurement: vi.fn().mockResolvedValue(undefined),
    };

    ingestingController = new IngestingController(mockIngestingService);

    app = express();
    app.use(express.json());
    app.use(router(ingestingController));

    app.use(errorHandler);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/internal/measurements - Create a measurement", () => {
    const createMeasurementRequest = async (
      body: {
        realTimeConsumption?: number;
        timestamp?: Date;
        householdUserUsername?: string;
      },
      queryParams?: Record<string, string>,
    ) => {
      let req = request(app).post(url);

      if (queryParams) {
        req = req.query(queryParams);
      }

      return req.send(body);
    };

    it("should create a measurement successfully with all fields", async () => {
      const response = await createMeasurementRequest(VALID_MEASUREMENT_BODY, {
        smart_furniture_hookup_id: TEST_HOOKUP_ID,
      });

      expect(response.status).toBe(204);
      expect(mockIngestingService.createMeasurement).toHaveBeenCalledWith(
        new SmartFurnitureHookupID(TEST_HOOKUP_ID),
        VALID_MEASUREMENT_BODY.realTimeConsumption,
        VALID_MEASUREMENT_BODY.timestamp,
        new HouseholdUserUsername(VALID_MEASUREMENT_BODY.householdUserUsername),
      );
    });

    it("should create a measurement without optional householdUserUsername", async () => {
      const bodyWithoutUsername = {
        realTimeConsumption: 100,
        timestamp: new Date("2025-11-28T10:00:00Z"),
      };

      const response = await createMeasurementRequest(bodyWithoutUsername, {
        smart_furniture_hookup_id: TEST_HOOKUP_ID,
      });

      expect(response.status).toBe(204);
      expect(mockIngestingService.createMeasurement).toHaveBeenCalledWith(
        new SmartFurnitureHookupID(TEST_HOOKUP_ID),
        bodyWithoutUsername.realTimeConsumption,
        bodyWithoutUsername.timestamp,
        undefined,
      );
    });

    it("should return 400 when realTimeConsumption is missing", async () => {
      const invalidBody = {
        timestamp: new Date("2025-11-28T10:00:00Z"),
      };

      const response = await createMeasurementRequest(invalidBody, {
        smart_furniture_hookup_id: TEST_HOOKUP_ID,
      });

      expect(response.status).toBe(400);
      expect(mockIngestingService.createMeasurement).not.toHaveBeenCalled();
    });

    it("should return 400 when timestamp is missing", async () => {
      const invalidBody = {
        realTimeConsumption: 100,
      };

      const response = await createMeasurementRequest(invalidBody, {
        smart_furniture_hookup_id: TEST_HOOKUP_ID,
      });

      expect(response.status).toBe(400);
      expect(mockIngestingService.createMeasurement).not.toHaveBeenCalled();
    });

    it("should return 400 when smart_furniture_hookup_id query param is missing", async () => {
      const response = await createMeasurementRequest(VALID_MEASUREMENT_BODY);

      expect(response.status).toBe(400);
      expect(mockIngestingService.createMeasurement).not.toHaveBeenCalled();
    });

    it("should return 404 when smart furniture hookup doesn't exist", async () => {
      vi.mocked(mockIngestingService.createMeasurement).mockRejectedValueOnce(
        new InvalidSmartFurnitureHookupIDError(),
      );

      const response = await createMeasurementRequest(VALID_MEASUREMENT_BODY, {
        smart_furniture_hookup_id: "non-existent-id",
      });

      expect(response.status).toBe(404);
    });
  });
});
