import {
  SmartFurnitureHookupDTO,
  SmartFurnitureHookupService,
} from "@application/outbound/SmartFurnitureHookupService";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import axios, { isAxiosError } from "axios";
import { getSmartFurnitureHookupResponse } from "@infrastructure/contracts/getSmartFurnitureHookupResponse";
import { Logger } from "pino";

export class HTTPSmartFurnitureHookupService implements SmartFurnitureHookupService {
  readonly #logger?: Logger;

  constructor(
    private readonly baseUrl: string,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  async getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookupDTO | undefined | Error> {
    const url = `${this.baseUrl}/api/internal/smart-furniture-hookups/${smartFurnitureHookupID.value}`;

    try {
      const response = await axios.get(url);
      const data = getSmartFurnitureHookupResponse.safeParse(response.data);

      if (!data.success) {
        return undefined;
      }

      return {
        id: data.data.id,
        utilityType: data.data.utilityType,
      };
    } catch (error) {
      this.#logger?.error(
        { error },
        "Error while getting smart furniture hookup",
      );

      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return undefined;
        }
        return error;
      }
      return undefined;
    }
  }
}
