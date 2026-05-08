import { Socket } from "socket.io";
import { UtilityMetersClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { UtilityMetersServersEvents } from "@presentation/web-sockets/events/serverEvents";

export type UtilityMetersSocket = Socket<
  UtilityMetersClientEvents,
  UtilityMetersServersEvents
>;
