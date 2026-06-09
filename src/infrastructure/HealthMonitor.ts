export interface HealthMonitor {
  isHealthy(): boolean;
  markHealthy(): void;
  markUnhealthy(): void;
}
