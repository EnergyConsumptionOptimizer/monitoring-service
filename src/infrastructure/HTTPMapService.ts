import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import axios from "axios";
import { MapService, ZoneIdDTO } from "@application/outbound/MapService";
import { getSmartFurnitureHookupResponse } from "@storage/contracts/getSmartFurnitureHookupFromMapResponse";
import { Logger } from "pino";

export class HTTPMapService implements MapService {
  readonly #logger?: Logger;
  constructor(
    private readonly baseUrl: string,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  async isSmartFurnitureHookupInAZone(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<ZoneIdDTO | null> {
    const url = `${this.baseUrl}/api/internal/smart-furniture-hookups/${smartFurnitureHookupID.value}`;

    try {
      const response = getSmartFurnitureHookupResponse.safeParse(
        await axios.get(url),
      );

      if (!response.success || !response.data.zoneID) return null;

      return {
        zoneID: response.data.zoneID,
      };
    } catch (error) {
      this.#logger?.error(
        { error },
        "Error while getting smart furniture hookup's zone id",
      );
      return null;
    }
  }
}
