import { SmartFurnitureHookupService } from "@application/ports/SmartFurnitureHookupService";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { SmartFurnitureHookup } from "@application/SmartFurnitureHookup";
import axios from "axios";
import { utilityTypeFromString } from "@domain/UtilityType";

export class SmartFurnitureHookupServiceImpl implements SmartFurnitureHookupService {
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
