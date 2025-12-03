import { Socket } from "socket.io";
import { UtilityConsumptionsClientEvents } from "@interfaces/web-sockets/events/clientEvents";
import { UtilityConsumptionsServersEvents } from "@interfaces/web-sockets/events/serverEvents";

export type UtilityConsumptionsSocket = Socket<
  UtilityConsumptionsClientEvents,
  UtilityConsumptionsServersEvents
>;
