export type RealTimeClientEvents = SubscribeActiveSmartFurnitureHookupsEvent;

export type ActiveSmartFurnitureHookupsClientEvents = Record<string, never>;

export interface SubscribeActiveSmartFurnitureHookupsEvent {
  subscribeActiveSmartFurnitureHookups: () => void;
}
