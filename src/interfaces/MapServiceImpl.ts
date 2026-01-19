import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import axios from "axios";
import { MapService } from "@application/ports/MapService";
import { ZoneID } from "@domain/ZoneID";

export class MapServiceImpl implements MapService {
  constructor(private readonly baseUrl: string) {}

  async isSmartFurnitureHookupInAZone(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<ZoneID | null> {
    const url = `${this.baseUrl}/api/internal/smart-furniture-hookups/${smartFurnitureHookupID.value()}`;

    try {
      const response = await axios.get(url);

      return new ZoneID(response.data.zoneID);
    } catch {
      return null;
    }
  }
}
