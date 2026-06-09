import { HealthMonitor } from "@infrastructure/HealthMonitor";
import { ServiceFailoverProxy } from "@infrastructure/ServiceFailoverProxy";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";
import { MapService, ZoneIdDTO } from "@application/outbound/MapService";

export class MapServiceFailoverProxy
  extends ServiceFailoverProxy<MapService>
  implements MapService
{
  public constructor(
    primaryService: MapService,
    fallbackService: MapService,
    healthMonitor: HealthMonitor,
  ) {
    super(primaryService, fallbackService, healthMonitor);
  }

  async isSmartFurnitureHookupInAZone(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<ZoneIdDTO | null> {
    return this.execute((s) =>
      s.isSmartFurnitureHookupInAZone(smartFurnitureHookupID),
    );
  }
}
