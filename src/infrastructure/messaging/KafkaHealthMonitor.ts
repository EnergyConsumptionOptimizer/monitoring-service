import { Logger } from "pino";
import { HealthMonitor } from "@infrastructure/HealthMonitor";

export class KafkaHealthMonitor implements HealthMonitor {
  #healthy = true;
  readonly #logger?: Logger;

  constructor(logger?: Logger) {
    this.#logger = logger?.child({ component: "KafkaHealthMonitor" });
  }

  isHealthy(): boolean {
    return this.#healthy;
  }

  markUnhealthy(): void {
    if (this.#healthy) {
      this.#healthy = false;
      this.#logger?.warn("Kafka unhealthy ");
    }
  }

  markHealthy(): void {
    if (!this.#healthy) {
      this.#healthy = true;
      this.#logger?.info("Kafka recovered");
    }
  }
}
