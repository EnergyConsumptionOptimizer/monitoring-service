import { Socket } from "socket.io";
import { UtilityConsumptionsClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { UtilityConsumptionsServersEvents } from "@presentation/web-sockets/events/serverEvents";

export type UtilityConsumptionsSocket = Socket<
  UtilityConsumptionsClientEvents,
  UtilityConsumptionsServersEvents
>;
