import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { IngestingController } from "@presentation/rest/controllers/IngestingController";
import { IngestingService } from "@application/inbound/IngestingService";
import { mockRequest } from "@test/unit/presentation/mockRequest";
import { mockResponse } from "@test/unit/presentation/mockResponse";
import { StatusCodes } from "http-status-codes";

describe("Ingesting REST API", () => {
  let ingestingService: MockProxy<IngestingService>;
  let controller: IngestingController;

  beforeEach(() => {
    ingestingService = mock<IngestingService>();
    controller = new IngestingController(
      ingestingService,
      "host",
      "port",
      "monitoring",
    );
  });

  describe("Create a measurement", () => {
    it("should create a measurement and return 201", async () => {
      ingestingService.createMeasurement.mockResolvedValue(undefined);

      const req = mockRequest({
        query: { smart_furniture_hookup_id: "sfh-1" },
        body: {
          realTimeConsumption: 42.5,
          timestamp: "2026-05-22T20:00:00Z",
          username: "john_doe",
        },
      });
      const res = mockResponse();

      await controller.createMeasurement(req, res);

      expect(ingestingService.createMeasurement).toHaveBeenCalledWith(
        "sfh-1",
        42.5,
        "2026-05-22T20:00:00Z",
        "john_doe",
      );
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
    });

    it("should handle missing username correctly and return 201", async () => {
      ingestingService.createMeasurement.mockResolvedValue(undefined);

      const req = mockRequest({
        query: { smart_furniture_hookup_id: "sfh-1" },
        body: {
          realTimeConsumption: 12.0,
          timestamp: "2026-05-22T21:00:00Z",
        },
      });
      const res = mockResponse();

      await controller.createMeasurement(req, res);

      expect(ingestingService.createMeasurement).toHaveBeenCalledWith(
        "sfh-1",
        12.0,
        "2026-05-22T21:00:00Z",
        undefined,
      );
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
    });
  });
});
