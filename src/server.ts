import "dotenv/config";
import { createLogger } from "./logger";
import { config } from "@bootstrap/config";
import { startInstrumentation } from "./instrumentation";
import { composeServer } from "@bootstrap/composeServer";
import { setupGracefulShutdown } from "@bootstrap/shutdown";
import { connectToInfluxDatabase } from "@bootstrap/InfluxInstance";

const rootLogger = createLogger(config);
const logger = rootLogger.child({ component: "Server" });
const sdk = startInstrumentation(rootLogger);

async function start(): Promise<void> {
  await connectToInfluxDatabase(logger);

  const composed = await composeServer(rootLogger);

  const server = composed.server.listen(config.port, () => {
    logger.info({ port: config.port }, "listening");
  });

  setupGracefulShutdown(server, sdk, logger);
}

void start();
