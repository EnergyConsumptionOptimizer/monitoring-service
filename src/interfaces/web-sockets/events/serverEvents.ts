import { ActiveSmartFurnitureHookupsDTO } from "@presentation/ActiveSmartFurnitureHookupsDTO";
import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";

export type RealTimeServerEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate &
  UtilityMetersUpdateEvent;

export interface ActiveSmartFurnitureHookupsServersEvents
  extends ErrorEvent,
    ActiveSmartFurnitureHookupsUpdate {}

export interface UtilityMetersServersEvents
  extends ErrorEvent,
    UtilityMetersUpdateEvent {}

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
