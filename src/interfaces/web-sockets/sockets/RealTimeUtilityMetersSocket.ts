import { Socket } from "socket.io";
import { RealTimeUtilityMetersClientEvents } from "@interfaces/web-sockets/events/clientEvents";
import { RealTimeUtilityMetersServersEvents } from "@interfaces/web-sockets/events/serverEvents";

export type RealTimeUtilityMetersSocket = Socket<
  RealTimeUtilityMetersClientEvents,
  RealTimeUtilityMetersServersEvents
>;
