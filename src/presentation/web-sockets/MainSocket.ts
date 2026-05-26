import { RealTimeNamespace } from "@presentation/web-sockets/namespace/RealTimeNamespace";
import { UtilityConsumptionsNamespace } from "@presentation/web-sockets/namespace/UtilityConsumptionsNamespace";
import { UtilityMetersNamespace } from "@presentation/web-sockets/namespace/UtilityMetersNamespace";
import { UtilityMetersSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityMetersSubscription";
import { UtilityConsumptionsSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityConsumptionsSubscription";
import { RealTimeUtilityMetersRoom } from "@presentation/web-sockets/namespace/rooms/RealTimeUtilityMetersRoom";
import { ActiveSmartFurnitureHookupsRoom } from "@presentation/web-sockets/namespace/rooms/ActiveSmartFurnitureHookupsRoom";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";
import { Logger } from "pino";

export function namespaces(
  activeSmartFurnitureHookupsHandler: ActiveSmartFurnitureHookupsHandler,
  utilityMetersHandler: UtilityMetersHandler,
  utilityConsumptionHandler: UtilityConsumptionsHandler,
  socketAuthMiddleware: SocketAuthMiddleware,
  logger: Logger,
) {
  const activeSmartFurnitureHookupsRoom = new ActiveSmartFurnitureHookupsRoom(
    activeSmartFurnitureHookupsHandler,
    logger,
  );

  const realTimeUtilityMetersRoom = new RealTimeUtilityMetersRoom(
    utilityMetersHandler,
    logger,
  );

  const realTimeNamespace = new RealTimeNamespace(
    activeSmartFurnitureHookupsRoom,
    realTimeUtilityMetersRoom,
    socketAuthMiddleware,
    logger,
  );
  const utilityConsumptionSubscription = new UtilityConsumptionsSubscription(
    utilityConsumptionHandler,
  );
  const utilityMetersSubscription = new UtilityMetersSubscription(
    utilityMetersHandler,
    logger,
  );
  const utilityConsumptionsNamespace = new UtilityConsumptionsNamespace(
    utilityConsumptionSubscription,
    socketAuthMiddleware,
    logger,
  );
  const utilityMetersNamespace = new UtilityMetersNamespace(
    utilityMetersSubscription,
    logger,
  );

  return [
    realTimeNamespace,
    utilityConsumptionsNamespace,
    utilityMetersNamespace,
  ];
}
