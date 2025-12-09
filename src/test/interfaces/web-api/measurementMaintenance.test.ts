import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { app, mockMeasurementMaintenanceService } from "./dependencies";

describe("Measurement Maintenance REST API", () => {
  const TEST_USERNAME = "user123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/internal/measurements/household-user-tags/:username - Remove household user tag from measurements", () => {
    const removeMeasurementTagRequest = async (username: string) => {
      return request(app).delete(
        `/api/internal/measurements/household-user-tags/${username}`,
      );
    };

    it("should remove household user tag successfully", async () => {
      const response = await removeMeasurementTagRequest(TEST_USERNAME);

      expect(response.status).toBe(204);
      expect(
        mockMeasurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
      ).toHaveBeenCalledWith(new HouseholdUserUsername(TEST_USERNAME));
    });
  });
});
