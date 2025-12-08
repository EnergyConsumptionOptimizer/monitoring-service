import { UtilityConsumptionPoint } from "@domain/UtilityConsumptionPoint";

export interface ConsumptionPointDTO {
  value: number;
  timestamp: string;
}

export const ConsumptionPointMapper = {
  toDTO(point: UtilityConsumptionPoint): ConsumptionPointDTO {
    return {
      value: point.value,
      timestamp: point.timestamp.toLocaleString(),
    };
  },
};
