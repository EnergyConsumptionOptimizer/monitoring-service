import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";

import { StatusCodes } from "http-status-codes";
import { mockRequest } from "@test/unit/presentation/mockRequest";
import { mockResponse } from "@test/unit/presentation/mockResponse";

describe("Measurement Maintenance REST API", () => {
  let measurementMaintenanceService: MockProxy<MeasurementMaintenanceService>;
  let controller: MeasurementMaintenanceController;

  beforeEach(() => {
    measurementMaintenanceService = mock<MeasurementMaintenanceService>();
    controller = new MeasurementMaintenanceController(
      measurementMaintenanceService,
    );
  });

  describe("Remove household user tag from measurements", () => {
    it("should remove the tag and return 204", async () => {
      measurementMaintenanceService.removeHouseholdUserTagFromMeasurements.mockResolvedValue(
        undefined,
      );

      const req = mockRequest({ params: { username: "jane_doe" } });
      const res = mockResponse();

      await controller.removeHouseholdUserTagFromMeasurements(req, res);

      expect(
        measurementMaintenanceService.removeHouseholdUserTagFromMeasurements,
      ).toHaveBeenCalledWith("jane_doe");
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });
  });

  describe("Remove zone ID tag from measurements", () => {
    it("should remove the tag and return 204", async () => {
      measurementMaintenanceService.removeZoneIDTagFromMeasurements.mockResolvedValue(
        undefined,
      );

      const req = mockRequest({ params: { zoneID: "zone-123" } });
      const res = mockResponse();

      await controller.removeZoneIDTagFromMeasurements(req, res);

      expect(
        measurementMaintenanceService.removeZoneIDTagFromMeasurements,
      ).toHaveBeenCalledWith("zone-123");
      expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });
  });
});
