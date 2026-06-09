import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("monitoring-service");

export const monitoringErrorsTotal = meter.createCounter(
  "monitoring_errors_total",
  { description: "Total number of errors in monitoring service" },
);
