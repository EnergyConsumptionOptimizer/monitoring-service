import express from "express";
import { vi } from "vitest";
import { IngestingService } from "@application/inbound/IngestingService";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { IngestingController } from "@presentation/web-api/controllers/IngestingController";
import { MeasurementMaintenanceController } from "@presentation/web-api/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/web-api/controllers/MonitoringController";
import { ManageSmartFurnitureHookupConnectionController } from "@presentation/web-api/controllers/ManageSmartFurnitureHookupConnectionController";
import { router } from "@presentation/web-api/routes/routes";
import { errorHandler } from "@presentation/web-api/middlewares/errorHandlerMiddleware";

export const mockIngestingService: IngestingService = {
  createMeasurement: vi.fn().mockResolvedValue(undefined),
};

export const mockMeasurementMaintenanceService: MeasurementMaintenanceService =
  {
    removeHouseholdUserTagFromMeasurements: vi
      .fn()
      .mockResolvedValue(undefined),
    removeZoneIDTagFromMeasurements: vi.fn().mockResolvedValue(undefined),
  };

export const mockMonitoringService: MonitoringService = {
  getActiveSmartFurnitureHookups: vi.fn().mockResolvedValue(undefined),
  getUtilityMeters: vi.fn().mockResolvedValue(undefined),
  getUtilityConsumptions: vi.fn().mockResolvedValue(undefined),
};

export const ingestingController = new IngestingController(
  mockIngestingService,
);
export const measurementMaintenanceController =
  new MeasurementMaintenanceController(mockMeasurementMaintenanceService);

export const monitoringController = new MonitoringController(
  mockMonitoringService,
);

export const manageSmartFurnitureHookupConnectionController =
  new ManageSmartFurnitureHookupConnectionController();

export const app = express();
app.use(express.json());
app.use(
  router(
    ingestingController,
    measurementMaintenanceController,
    monitoringController,
    manageSmartFurnitureHookupConnectionController,
  ),
);

app.use(errorHandler);
