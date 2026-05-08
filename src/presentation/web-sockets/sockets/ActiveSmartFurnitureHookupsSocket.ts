import { Socket } from "socket.io";
import { ActiveSmartFurnitureHookupsClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { ActiveSmartFurnitureHookupsServersEvents } from "@presentation/web-sockets/events/serverEvents";

export type ActiveSmartFurnitureHookupsSocket = Socket<
  ActiveSmartFurnitureHookupsClientEvents,
  ActiveSmartFurnitureHookupsServersEvents
>;
