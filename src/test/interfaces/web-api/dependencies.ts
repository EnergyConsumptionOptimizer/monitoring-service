import { IngestingController } from "@interfaces/web-api/controllers/IngestingController";
import express from "express";
import { router } from "@interfaces/web-api/routes/routes";
import { errorHandler } from "@interfaces/web-api/middlewares/errorHandlerMiddleware";
import { vi } from "vitest";
import { IngestingService } from "@domain/ports/IngestingService";
import { MonitoringController } from "@interfaces/web-api/controllers/MonitoringController";
import { MonitoringService } from "@domain/ports/MonitoringService";
import { MeasurementMaintenanceService } from "@domain/ports/MeasurementMaintenanceService";
import { MeasurementMaintenanceController } from "@interfaces/web-api/controllers/MeasurementMaintenanceController";
import { ManageSmartFurnitureHookupConnectionController } from "@interfaces/web-api/controllers/ManageSmartFurnitureHookupConnectionController";

export const mockIngestingService: IngestingService = {
  createMeasurement: vi.fn().mockResolvedValue(undefined),
};

export const mockMeasurementMaintenanceService: MeasurementMaintenanceService =
  {
    removeHouseholdUserTagFromMeasurements: vi
      .fn()
      .mockResolvedValue(undefined),
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
