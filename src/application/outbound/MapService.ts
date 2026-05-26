import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";

export interface ZoneIdDTO {
  zoneID: string;
}

/**
 * Service interface for interacting with map elements
 */
export interface MapService {
  /**
   * Checks for a zone assignment and returns the unique Zone ID for the specified furniture hookup.
   * @param smartFurnitureHookupID - The unique identifier of the smart furniture hookup.
   */
  isSmartFurnitureHookupInAZone(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<ZoneIdDTO | null>;
}
