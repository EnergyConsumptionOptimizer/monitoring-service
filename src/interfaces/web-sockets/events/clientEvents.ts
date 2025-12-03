import { UtilityConsumptionsQueryDTO } from "@presentation/web-socket/UtilityConsumptionsQueryDTO";

export type RealTimeClientEvents = SubscribeActiveSmartFurnitureHookupsEvent &
  SubscribeRealTimeUtilityMetersEvent;

export type ActiveSmartFurnitureHookupsClientEvents = Record<string, null>;
export type UtilityMetersClientEvents = Record<string, null>;

export type UtilityConsumptionsClientEvents =
  SubscribeUtilityConsumptionsEvent & EditUtilityConsumptionsQueryEvent;

export interface SubscribeActiveSmartFurnitureHookupsEvent {
  subscribeActiveSmartFurnitureHookups: () => void;
}

export interface SubscribeRealTimeUtilityMetersEvent {
  subscribeRealTimeUtilityMeters: () => void;
}

export interface SubscribeUtilityConsumptionsEvent {
  subscribe: (queries: UtilityConsumptionsQueryDTO[]) => void;
}
export interface EditUtilityConsumptionsQueryEvent {
  editQuery: (queries: UtilityConsumptionsQueryDTO) => void;
}
