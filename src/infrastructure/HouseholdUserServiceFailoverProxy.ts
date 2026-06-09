import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HouseholdUserUsername } from "@domain/values/HouseholdUserUsername";
import { HealthMonitor } from "@infrastructure/HealthMonitor";
import { ServiceFailoverProxy } from "@infrastructure/ServiceFailoverProxy";

export class HouseholdUserServiceFailoverProxy
  extends ServiceFailoverProxy<HouseholdUserService>
  implements HouseholdUserService
{
  public constructor(
    primaryService: HouseholdUserService,
    fallbackService: HouseholdUserService,
    healthMonitor: HealthMonitor,
  ) {
    super(primaryService, fallbackService, healthMonitor);
  }

  async isHouseholdUserUsernameValid(
    username: HouseholdUserUsername,
  ): Promise<boolean> {
    return this.execute((s) => s.isHouseholdUserUsernameValid(username));
  }
}
