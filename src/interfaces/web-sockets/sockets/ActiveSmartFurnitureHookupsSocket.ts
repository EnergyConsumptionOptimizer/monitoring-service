import { Socket } from "socket.io";
import { ActiveSmartFurnitureHookupsServersEvents } from "@interfaces/web-sockets/events/serverEvents";
import { ActiveSmartFurnitureHookupsClientEvents } from "@interfaces/web-sockets/events/clientEvents";

export type ActiveSmartFurnitureHookupsSocket = Socket<
  ActiveSmartFurnitureHookupsClientEvents,
  ActiveSmartFurnitureHookupsServersEvents
>;
