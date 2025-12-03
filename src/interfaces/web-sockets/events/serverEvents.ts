import { ActiveSmartFurnitureHookupsDTO } from "@presentation/ActiveSmartFurnitureHookupsDTO";
import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";
import { UtilityConsumptionsQueryResultDTO } from "@presentation/web-socket/UtilityConsumptionsQueryResultDTO";
import { UtilityMetersQueryResultDTO } from "@presentation/web-socket/UtilityMetersQueryResultDTO";

export type RealTimeServerEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate &
  RealTimeUtilityMetersUpdateEvent;

export type ActiveSmartFurnitureHookupsServersEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate;

export type RealTimeUtilityMetersServersEvents = ErrorEvent &
  RealTimeUtilityMetersUpdateEvent;

export type UtilityConsumptionsServersEvents = ErrorEvent &
  UtilityConsumptionsUpdateEvent &
  UtilityConsumptionsQueryUpdateEvent;

export type UtilityMetersServersEvents = ErrorEvent &
  UtilityMetersUpdateEvent &
  UtilityMetersQueryUpdateEvent;

export interface ErrorEvent {
  error: (error: string) => void;
}

export interface ActiveSmartFurnitureHookupsUpdate {
  activeSmartFurnitureHookupsUpdate: (
    data: ActiveSmartFurnitureHookupsDTO,
  ) => void;
}

export interface RealTimeUtilityMetersUpdateEvent {
  utilityMetersUpdate: (data: UtilityMetersDTO) => void;
}

export interface UtilityConsumptionsUpdateEvent {
  utilityConsumptionsUpdate: (
    data: UtilityConsumptionsQueryResultDTO[],
  ) => void;
}

export interface UtilityConsumptionsQueryUpdateEvent {
  utilityConsumptionsQueryUpdate: (
    data: UtilityConsumptionsQueryResultDTO,
  ) => void;
}

export interface UtilityMetersUpdateEvent {
  utilityMetersUpdate: (data: UtilityMetersQueryResultDTO[]) => void;
}

export interface UtilityMetersQueryUpdateEvent {
  utilityMetersQueryUpdate: (data: UtilityMetersQueryResultDTO) => void;
}
