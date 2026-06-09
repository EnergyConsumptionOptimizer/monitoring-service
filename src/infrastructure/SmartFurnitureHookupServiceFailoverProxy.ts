import { HealthMonitor } from "@infrastructure/HealthMonitor";
import { ServiceFailoverProxy } from "@infrastructure/ServiceFailoverProxy";
import {
  SmartFurnitureHookupDTO,
  SmartFurnitureHookupService,
} from "@application/outbound/SmartFurnitureHookupService";
import { SmartFurnitureHookupID } from "@domain/values/SmartFurnitureHookupID";

export class SmartFurnitureHookupServiceFailoverProxy
  extends ServiceFailoverProxy<SmartFurnitureHookupService>
  implements SmartFurnitureHookupService
{
  public constructor(
    primaryService: SmartFurnitureHookupService,
    fallbackService: SmartFurnitureHookupService,
    healthMonitor: HealthMonitor,
  ) {
    super(primaryService, fallbackService, healthMonitor);
  }

  async getSmartFurnitureHookup(
    smartFurnitureHookupID: SmartFurnitureHookupID,
  ): Promise<SmartFurnitureHookupDTO | undefined | Error> {
    return this.execute((s) =>
      s.getSmartFurnitureHookup(smartFurnitureHookupID),
    );
  }
}
