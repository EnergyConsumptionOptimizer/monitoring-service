export type RealTimeClientEvents = SubscribeActiveSmartFurnitureHookupsEvent &
  SubscribeRealTimeUtilityMetersEvent;

export type ActiveSmartFurnitureHookupsClientEvents = Record<string, never>;
export type UtilityMetersClientEvents = Record<string, never>;

export interface SubscribeActiveSmartFurnitureHookupsEvent {
  subscribeActiveSmartFurnitureHookups: () => void;
}

export interface SubscribeRealTimeUtilityMetersEvent {
  subscribeRealTimeUtilityMeters: () => void;
}
