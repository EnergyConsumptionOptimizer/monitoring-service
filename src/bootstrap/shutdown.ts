import type { Server } from "node:http";
import type { NodeSDK } from "@opentelemetry/sdk-node";

import type { Logger } from "pino";
import { disconnectFromRedis } from "@bootstrap/RedisInstance";
import { ComposedApp } from "@bootstrap/composeServer";

export function setupGracefulShutdown(
  server: Server,
  sdk: NodeSDK,
  deps: ComposedApp,
  logger: Logger,
): void {
  const shutdown = async () => {
    logger.info("graceful shutdown initiated");
    server.close();

    try {
      await deps.consumers.userConsumer.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await deps.consumers.zoneConsumer.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await deps.consumers.readModelConsumer.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await deps.dlq.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await deps.dlq.disconnect();
    } catch {
      /* ignore */
    }
    try {
      await disconnectFromRedis();
    } catch {
      /* ignore */
    }

    try {
      await sdk.shutdown();
      logger.info("OpenTelemetry SDK shut down");
    } catch (err) {
      logger.error({ err }, "error shutting down OpenTelemetry SDK");
    }
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
