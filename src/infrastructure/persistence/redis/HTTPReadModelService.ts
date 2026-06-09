import { ReadModelService } from "@infrastructure/persistence/redis/ReadModelService";
import { UserReadModel } from "@infrastructure/persistence/redis/models/UserReadModel";
import { SmartFurnitureHookupReadModel } from "@infrastructure/persistence/redis/models/SmartFurnitureHookupReadModel";
import { SmartFurnitureHookupAssociateZone } from "@infrastructure/persistence/redis/models/MapReadModel";
import { Logger } from "pino";
import axios from "axios";
import { getUsersResponse } from "@infrastructure/contracts/getUsersResponse";
import { getSmartFurnitureHookupsResponse } from "@infrastructure/contracts/getSmartFurnitureHookupsResponse";
import { getSmartFurnitureHookupsZoneResponse } from "@infrastructure/contracts/getSmartFurnitureHookupsZoneResponse";

export class HttpReadModelService implements ReadModelService {
  readonly #logger?: Logger;

  constructor(
    private readonly userServiceUrl: string,
    private readonly hookupServiceUrl: string,
    private readonly mapServiceUrl: string,
    logger?: Logger,
  ) {
    this.#logger = logger?.child({ component: "ReadModelSyncHttpClient" });
  }

  async fetchAllHouseholdUsers(): Promise<UserReadModel[]> {
    const url = `${this.userServiceUrl}/api/internal/users`;

    const parsed = getUsersResponse.safeParse(await axios.get(url));

    if (!parsed.success) {
      this.#logger?.error(
        { error: parsed.error },
        "Invalid user list response",
      );
      return [];
    }

    return parsed.data;
  }

  async fetchAllSmartFurnitureHookups(): Promise<
    SmartFurnitureHookupReadModel[]
  > {
    const url = `${this.hookupServiceUrl}/api/internal/smart-furniture-hookups`;

    const parsed = getSmartFurnitureHookupsResponse.safeParse(
      await axios.get(url),
    );

    if (!parsed.success) {
      this.#logger?.error(
        { error: parsed.error },
        "Invalid hookup list response",
      );
      return [];
    }

    return parsed.data.smartFurnitureHookups;
  }

  async fetchAllSmartFurnitureHookupsAssociateZone(): Promise<
    SmartFurnitureHookupAssociateZone[]
  > {
    const url = `${this.mapServiceUrl}/api/internal/smart-furniture-hookups`;

    const parsed = getSmartFurnitureHookupsZoneResponse.safeParse(
      await axios.get(url),
    );

    if (!parsed.success) {
      this.#logger?.error(
        { error: parsed.error },
        "Invalid hookup list response",
      );
      return [];
    }

    return parsed.data.smartFurnitureHookups.map((h) => {
      return {
        hookupId: h.id,
        zoneId: h.zoneId,
      };
    });
  }
}
