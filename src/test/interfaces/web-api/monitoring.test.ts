import { beforeEach, describe, vi, it, expect } from "vitest";
import request from "supertest";
import { app, mockMonitoringService } from "./dependencies";
import { UtilityType } from "@domain/UtilityType";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

describe("Monitoring REST API", () => {
  const url = "/api/internal/measurements";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /:utilityType - Consumption series of one utility", () => {
    const getByUtilityTypeRequest = async (
      utilityType: string,
      queryParams?: Record<string, string>,
    ) => {
      let req = request(app).get(url + "/" + utilityType);

      if (queryParams) {
        req = req.query(queryParams);
      }

      return req;
    };

    it("should allow to get a consumption series by a utility type", async () => {
      const response = await getByUtilityTypeRequest(UtilityType.GAS);

      expect(response.status).toBe(200);
      expect(mockMonitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        UtilityType.GAS,
        expect.anything(),
        expect.anything(),
      );
    });

    it("should allow to get a consumption series by a utility type filter by time", async () => {
      const start = "2hours";
      const end = "1hour";
      const response = await getByUtilityTypeRequest(UtilityType.GAS, {
        from: start,
        to: end,
      });

      expect(response.status).toBe(200);
      expect(mockMonitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        expect.anything(),
        {
          from: start,
          to: end,
        },
        expect.anything(),
      );
    });

    it("should allow to get a consumption series by a utility type with data granularity ", async () => {
      const granularity = "1hour";
      const response = await getByUtilityTypeRequest(UtilityType.GAS, {
        granularity,
      });

      expect(response.status).toBe(200);
      expect(mockMonitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        expect.anything(),
        {
          granularity,
        },
        expect.anything(),
      );
    });

    it("should allow to get a consumption series by a utility type filtered by user ", async () => {
      const username = "alice";
      const response = await getByUtilityTypeRequest(UtilityType.GAS, {
        username,
      });

      expect(response.status).toBe(200);
      expect(mockMonitoringService.getUtilityConsumptions).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          username: new HouseholdUserUsername(username),
        },
      );
    });

    it("should return 404 when utility type doesn't exists", async () => {
      const response = await getByUtilityTypeRequest("power");

      expect(response.status).toBe(404);
    });
  });
});
