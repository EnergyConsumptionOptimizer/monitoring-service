import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";

export interface ConsumptionPointDTO {
  value: number;
  timestamp: string;
}

export const ConsumptionPointMapper = {
  toDTO(point: UtilityConsumptionPoint): ConsumptionPointDTO {
    return {
      value: point.consumption.value,
      timestamp: point.timestamp.toLocaleString(),
    };
  },
};
