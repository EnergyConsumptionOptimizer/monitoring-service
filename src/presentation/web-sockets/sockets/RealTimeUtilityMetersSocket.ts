import { Socket } from "socket.io";
import { RealTimeUtilityMetersClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { RealTimeUtilityMetersServersEvents } from "@presentation/web-sockets/events/serverEvents";

export type RealTimeUtilityMetersSocket = Socket<
  RealTimeUtilityMetersClientEvents,
  RealTimeUtilityMetersServersEvents
>;
