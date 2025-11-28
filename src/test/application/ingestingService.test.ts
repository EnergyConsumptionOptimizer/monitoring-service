import { beforeEach, describe, expect, it, vi } from "vitest";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { SmartFurnitureHookupService } from "@application/ports/SmartFurnitureHookupService";
import { HouseholdUserService } from "@application/ports/HouseholdUserService";
import { InMemoryMonitoringRepository } from "../store/InMemoryMonitoringRepository";
import { SmartFurnitureHookup } from "@application/SmartFurnitureHookup";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { UtilityType } from "@domain/UtilityType";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { InvalidSmartFurnitureHookupIDError } from "@domain/errors";

describe("IngestingServiceImpl", () => {
  let ingestingService: IngestingServiceImpl;
  let repository: InMemoryMonitoringRepository;
  let mockSmartFurnitureHookupService: SmartFurnitureHookupService;
  let mockHouseholdUserService: HouseholdUserService;

  const MOCK_HOOKUP_ID = new SmartFurnitureHookupID("aaa-000");
  const MOCK_CONSUMPTION_VALUE = 100;
  const MOCK_USERNAME = new HouseholdUserUsername("user123");

  const mockSmartFurnitureHookup: SmartFurnitureHookup = {
    id: MOCK_HOOKUP_ID,
    utilityType: UtilityType.ELECTRICITY,
  };

  const setupSuccessfulHookupRetrieval = () => {
    vi.mocked(
      mockSmartFurnitureHookupService.getSmartFurnitureHookup,
    ).mockResolvedValue(mockSmartFurnitureHookup);
  };

  const setupUsernameValidation = (isValid: boolean) => {
    vi.mocked(
      mockHouseholdUserService.isHouseholdUserUsernameValid,
    ).mockResolvedValue(isValid);
  };

  beforeEach(() => {
    repository = new InMemoryMonitoringRepository();

    mockSmartFurnitureHookupService = {
      getSmartFurnitureHookup: vi.fn(),
    };

    mockHouseholdUserService = {
      isHouseholdUserUsernameValid: vi.fn(),
    };

    ingestingService = new IngestingServiceImpl(
      repository,
      mockSmartFurnitureHookupService,
      mockHouseholdUserService,
    );
  });

  describe("createMeasurement", () => {
    it("should create and save a measurement successfully", async () => {
      const timestamp = new Date("2025-11-28T10:00:00Z");

      vi.mocked(
        mockSmartFurnitureHookupService.getSmartFurnitureHookup,
      ).mockResolvedValue(mockSmartFurnitureHookup);

      vi.mocked(
        mockHouseholdUserService.isHouseholdUserUsernameValid,
      ).mockResolvedValue(true);

      setupSuccessfulHookupRetrieval();
      setupUsernameValidation(true);

      await ingestingService.createMeasurement(
        MOCK_HOOKUP_ID,
        MOCK_CONSUMPTION_VALUE,
        timestamp,
        MOCK_USERNAME,
      );

      const measurement = repository.getLastMeasurement();

      expect(measurement).not.toBeNull();
      expect(measurement?.smartFurnitureHookupID).toBe(MOCK_HOOKUP_ID);
      expect(measurement?.consumptionValue).toBe(MOCK_CONSUMPTION_VALUE);
      expect(measurement?.timestamp).toBe(timestamp);
      expect(measurement?.tags.householdUserUsername).toBe(MOCK_USERNAME);
    });

    it("should throw InvalidSmartFurnitureHookupIDError when hookup not found", async () => {
      vi.mocked(
        mockSmartFurnitureHookupService.getSmartFurnitureHookup,
      ).mockResolvedValue(null);

      await expect(
        ingestingService.createMeasurement(
          MOCK_HOOKUP_ID,
          MOCK_CONSUMPTION_VALUE,
          new Date(),
        ),
      ).rejects.toThrow(InvalidSmartFurnitureHookupIDError);
    });

    it("should use current date when timestamp is invalid", async () => {
      const timestamp = new Date("invalid");

      setupSuccessfulHookupRetrieval();

      await ingestingService.createMeasurement(
        MOCK_HOOKUP_ID,
        MOCK_CONSUMPTION_VALUE,
        timestamp,
      );

      const measurement = repository.getLastMeasurement();

      expect(measurement).not.toBeNull();
      expect(measurement?.timestamp).toBeInstanceOf(Date);
    });

    it("should set username to undefined when not provided", async () => {
      setupSuccessfulHookupRetrieval();

      await ingestingService.createMeasurement(
        MOCK_HOOKUP_ID,
        MOCK_CONSUMPTION_VALUE,
        new Date(),
      );

      const measurement = repository.getLastMeasurement();

      expect(measurement).not.toBeNull();
      expect(measurement?.tags.householdUserUsername).toBe(undefined);
    });

    it("should set username to undefined when validation fails", async () => {
      setupSuccessfulHookupRetrieval();
      setupUsernameValidation(false);

      await ingestingService.createMeasurement(
        MOCK_HOOKUP_ID,
        MOCK_CONSUMPTION_VALUE,
        new Date(),
        MOCK_USERNAME,
      );

      const measurement = repository.getLastMeasurement();

      expect(measurement).not.toBeNull();
      expect(measurement?.tags.householdUserUsername).toBe(undefined);
    });
  });
});
