import { HealthMonitor } from "@infrastructure/HealthMonitor";

export abstract class ServiceFailoverProxy<T> {
  readonly #primaryService: T;
  readonly #fallbackService: T;
  readonly #healthMonitor: HealthMonitor;

  protected constructor(
    primaryService: T,
    fallbackService: T,
    healthMonitor: HealthMonitor,
  ) {
    this.#primaryService = primaryService;
    this.#fallbackService = fallbackService;
    this.#healthMonitor = healthMonitor;
  }

  #resolveService(): T {
    if (this.#healthMonitor.isHealthy()) {
      return this.#primaryService;
    }

    return this.#fallbackService;
  }

  execute<R>(fn: (service: T) => Promise<R>): Promise<R> {
    const service = this.#resolveService();
    return fn(service);
  }
}
