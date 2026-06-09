import "dotenv/config";
import { createLogger } from "./logger";
import { config } from "@bootstrap/config";
import { startInstrumentation } from "./instrumentation";
import { composeServer } from "@bootstrap/composeServer";
import { setupGracefulShutdown } from "@bootstrap/shutdown";
import { connectToInfluxDatabase } from "@bootstrap/InfluxInstance";
import { retryForever } from "@bootstrap/retryForever";
import { connectToRedis } from "@bootstrap/RedisInstance";

const rootLogger = createLogger(config);
const logger = rootLogger.child({ component: "Server" });
const sdk = startInstrumentation(rootLogger);

async function start(): Promise<void> {
  await connectToInfluxDatabase(logger);
  await connectToRedis(logger);

  const composed = await composeServer(rootLogger);

  const server = composed.server.listen(config.port, () => {
    logger.info({ port: config.port }, "listening");
  });

  void retryForever(
    "Kafka threshold-breach DLQ producer",
    async () => composed.dlq.connect(),
    logger,
  );

  void retryForever(
    "Kafka user consumer",
    async () => {
      await composed.consumers.userConsumer.connect();
      await composed.consumers.userConsumer.start();
    },
    logger,
  );

  void retryForever(
    "Kafka zone consumer",
    async () => {
      await composed.consumers.zoneConsumer.connect();
      await composed.consumers.zoneConsumer.start();
    },
    logger,
  );

  void retryForever(
    "Kafka read model consumers",
    async () => {
      await composed.consumers.readModelConsumer.connect();
      await composed.consumers.readModelConsumer.start();
    },
    logger,
  );

  void retryForever(
    "Redis read model sync",
    async () => composed.readModelSynchronizer.syncAll(),
    logger,
  );

  setupGracefulShutdown(server, sdk, composed, logger);
}

void start();
