/**
 * Service interface for ingesting new measurements coming from a smart furniture hookup.
 */
export interface IngestingService {
  /**
   * Creates a new measurements if the given SmartFurnitureHookupID is valid.
   *
   * If the measurement is associated with a specific household user, their username
   * can be provided.
   *
   * @throws InvalidSmartFurnitureHookupIDError
   *
   * @param smartFurnitureHookupID
   * @param consumptionValue
   * @param timestamp
   * @param householdUserUsername
   */
  createMeasurement(
    smartFurnitureHookupID: string,
    consumptionValue: number,
    timestamp: Date,
    householdUserUsername?: string,
  ): Promise<undefined | Error>;
}
