import { UserReadModel } from "@infrastructure/persistence/redis/models/UserReadModel";
import { SmartFurnitureHookupReadModel } from "@infrastructure/persistence/redis/models/SmartFurnitureHookupReadModel";
import { SmartFurnitureHookupAssociateZone } from "@infrastructure/persistence/redis/models/MapReadModel";

export interface ReadModelStore {
  setUser(user: UserReadModel): Promise<void>;
  getUserIdByUsername(username: string): Promise<string | null>;
  deleteUser(username: string): Promise<void>;

  setSmartFurnitureHookup(hookup: SmartFurnitureHookupReadModel): Promise<void>;
  getSmartFurnitureHookupById(
    hookupId: string,
  ): Promise<SmartFurnitureHookupReadModel | null>;
  deleteSmartFurnitureHookup(hookupId: string): Promise<void>;

  setSmartFurnitureHookupZone(
    hookupZone: SmartFurnitureHookupAssociateZone,
  ): Promise<void>;
  getSmartFurnitureHookupZoneByHookupId(
    hookupId: string,
  ): Promise<SmartFurnitureHookupAssociateZone | null>;
  updateSmartFurnitureHookupZone(
    hookupId: string,
    zoneId: string | null,
  ): Promise<void>;
  deleteZone(zoneId: string): Promise<void>;
}
