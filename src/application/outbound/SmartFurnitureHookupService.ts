import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";

export interface SmartFurnitureHookupDTO {
  id: string;
  utilityType: string;
}

/**
 * Service interface for managing smart furniture hookups.
 */
export interface SmartFurnitureHookupService {
  /**
   * Retrieves a single smart furniture hookup by their unique identifier.
   *
   * @param smartFurnitureHookupID - The unique identifier of the smart furniture hookup.
   * @returns A promise that resolves to the smart furniture hookup if found, or `null` otherwise.
   */
  getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookupDTO | undefined | Error>;
}
