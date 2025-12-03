import { Socket } from "socket.io";
import { UtilityMetersClientEvents } from "@interfaces/web-sockets/events/clientEvents";
import { UtilityMetersServersEvents } from "@interfaces/web-sockets/events/serverEvents";

export type RealTimeUtilityMetersSocket = Socket<
  UtilityMetersClientEvents,
  UtilityMetersServersEvents
>;
