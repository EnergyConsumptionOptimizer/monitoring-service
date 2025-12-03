import { ActiveSmartFurnitureHookupsDTO } from "@presentation/ActiveSmartFurnitureHookupsDTO";
import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";
import { UtilityConsumptionQueryResultDTO } from "@presentation/web-socket/UtilityConsumptionQueryResultDTO";

export type RealTimeServerEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate &
  UtilityMetersUpdateEvent;

export type ActiveSmartFurnitureHookupsServersEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate;

export type UtilityMetersServersEvents = ErrorEvent & UtilityMetersUpdateEvent;

export type UtilityConsumptionsServersEvents = ErrorEvent &
  UtilityConsumptionsUpdateEvent &
  UtilityConsumptionsQueryUpdateEvent;

export interface ErrorEvent {
  error: (error: string) => void;
}

export interface ActiveSmartFurnitureHookupsUpdate {
  activeSmartFurnitureHookupsUpdate: (
    data: ActiveSmartFurnitureHookupsDTO,
  ) => void;
}

export interface UtilityMetersUpdateEvent {
  utilityMetersUpdate: (data: UtilityMetersDTO) => void;
}

export interface UtilityConsumptionsUpdateEvent {
  utilityConsumptionsUpdate: (data: UtilityConsumptionQueryResultDTO[]) => void;
}

export interface UtilityConsumptionsQueryUpdateEvent {
  utilityConsumptionsQueryUpdate: (
    data: UtilityConsumptionQueryResultDTO,
  ) => void;
}
