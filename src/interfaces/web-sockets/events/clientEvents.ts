import { UtilityConsumptionsQueryDTO } from "@presentation/web-socket/UtilityConsumptionsQueryDTO";
import { UtilityMetersQueryDTO } from "@presentation/web-socket/UtilityMetersQueryDTO";

export type RealTimeClientEvents = SubscribeActiveSmartFurnitureHookupsEvent &
  SubscribeRealTimeUtilityMetersEvent;

export type ActiveSmartFurnitureHookupsClientEvents = Record<string, null>;
export type RealTimeUtilityMetersClientEvents = Record<string, null>;

export type UtilityConsumptionsClientEvents =
  SubscribeUtilityConsumptionsEvent & EditUtilityConsumptionsQueryEvent;

export type UtilityMetersClientEvents = SubscribeUtilityMetersEvent &
  EditUtilityMetersQueryEvent &
  DeleteUtilityMetersQueryEvent;

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

export interface SubscribeUtilityMetersEvent {
  subscribe: (queries: UtilityMetersQueryDTO[], interval?: number) => void;
}

export interface EditUtilityMetersQueryEvent {
  editQuery: (queries: UtilityMetersQueryDTO) => void;
}
export interface DeleteUtilityMetersQueryEvent {
  deleteQuery: (queries: string) => void;
}
