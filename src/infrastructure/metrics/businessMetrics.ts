import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("monitoring-service");

export const monitoringDlqPublishesTotal = meter.createCounter(
  "monitoring_dlq_publishes_total",
  { description: "Total number of messages published to the monitoring DLQ" },
);
