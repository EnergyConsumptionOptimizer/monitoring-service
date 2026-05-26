import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { mockRequest } from "@test/unit/presentation/mockRequest";
import { mockResponse } from "@test/unit/presentation/mockResponse";
import { StatusCodes } from "http-status-codes";
import {
  validConsumptionValue,
  validUtilityConsumptionPoint,
} from "@test/domainFactories";

describe("Monitoring REST API", () => {
  let monitoringService: MockProxy<MonitoringService>;
  let controller: MonitoringController;

  beforeEach(() => {
    monitoringService = mock<MonitoringService>();
    controller = new MonitoringController(monitoringService);
  });

  describe("Get utility consumptions", () => {
    it("should retrieve utility consumptions and return 200", async () => {
      const mockConsumptions = [
        validUtilityConsumptionPoint(),
        validUtilityConsumptionPoint(validConsumptionValue(40)),
      ];

      monitoringService.getUtilityConsumptions.mockResolvedValue(
        mockConsumptions,
      );

      const req = mockRequest({
        params: { utilityType: "WATER" },
        query: {
          from: "4hours",
          to: "2hours",
          granularity: "1minute",
          username: "john_doe",
          zoneID: "zone-456",
        },
      });

      const res = mockResponse();
      res.send = vi.fn().mockReturnThis();

      await controller.getUtilityConsumptions(req, res);

      expect(monitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        "WATER",
        {
          from: "4hours",
          to: "2hours",
          granularity: "1minute",
          tags: {
            username: "john_doe",
            zoneID: "zone-456",
          },
        },
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        utilityConsumptions: mockConsumptions,
      });
    });

    it("should handle omitted optional tags gracefully", async () => {
      monitoringService.getUtilityConsumptions.mockResolvedValue([]);

      const req = mockRequest({
        params: { utilityType: "ELECTRICITY" },
        query: {
          from: "4hours",
          to: "2hours",
          granularity: "1minute",
        },
      });

      const res = mockResponse();
      res.send = vi.fn().mockReturnThis();

      await controller.getUtilityConsumptions(req, res);

      expect(monitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        "ELECTRICITY",
        {
          from: "4hours",
          to: "2hours",
          granularity: "1minute",
          tags: {
            username: undefined,
            zoneID: undefined,
          },
        },
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });
  });
});
