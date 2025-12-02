import { ActiveSmartFurnitureHookupsDTO } from "@presentation/ActiveSmartFurnitureHookupsDTO";

export type RealTimeServerEvents = ErrorEvent &
  ActiveSmartFurnitureHookupsUpdate;

export interface ActiveSmartFurnitureHookupsServersEvents
  extends ErrorEvent,
    ActiveSmartFurnitureHookupsUpdate {}

export interface ErrorEvent {
  error: (error: string) => void;
}

export interface ActiveSmartFurnitureHookupsUpdate {
  activeSmartFurnitureHookupsUpdate: (
    data: ActiveSmartFurnitureHookupsDTO,
  ) => void;
}
