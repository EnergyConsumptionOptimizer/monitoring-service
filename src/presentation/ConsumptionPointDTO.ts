import { ConsumptionPoint } from "@domain/ConsumptionPoint";

export interface ConsumptionPointDTO {
  value: number;
  timestamp: string;
}

export const ConsumptionPointMapper = {
  toDTO(point: ConsumptionPoint): ConsumptionPointDTO {
    return {
      value: point.value,
      timestamp: point.timestamp.toLocaleString(),
    };
  },
};
