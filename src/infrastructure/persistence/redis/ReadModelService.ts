import { UserReadModel } from "@infrastructure/persistence/redis/models/UserReadModel";
import { SmartFurnitureHookupReadModel } from "@infrastructure/persistence/redis/models/SmartFurnitureHookupReadModel";
import { SmartFurnitureHookupAssociateZone } from "@infrastructure/persistence/redis/models/MapReadModel";

export interface ReadModelService {
  fetchAllHouseholdUsers(): Promise<UserReadModel[]>;

  fetchAllSmartFurnitureHookups(): Promise<SmartFurnitureHookupReadModel[]>;

  fetchAllSmartFurnitureHookupsAssociateZone(): Promise<
    SmartFurnitureHookupAssociateZone[]
  >;
}
