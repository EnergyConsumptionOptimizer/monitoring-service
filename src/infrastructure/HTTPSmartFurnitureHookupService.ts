import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { SmartFurnitureHookup } from "@domain/SmartFurnitureHookup";
import axios from "axios";
import { utilityTypeFromString } from "@domain/UtilityType";

export class HTTPSmartFurnitureHookupService implements SmartFurnitureHookupService {
  constructor(private readonly baseUrl: string) {}

  async getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookup | null> {
    const url = `${this.baseUrl}/api/internal/smart-furniture-hookups/${smartFurnitureHookupID.value()}`;

    try {
      const response = await axios.get(url);

      return {
        id: response.data.id,
        utilityType: utilityTypeFromString(response.data.utilityType),
      };
    } catch {
      return null;
    }
  }
}
