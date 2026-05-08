import { RealTimeClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { Socket } from "socket.io";
import { RealTimeServerEvents } from "@presentation/web-sockets/events/serverEvents";

export type RealTimeSocket = Socket<RealTimeClientEvents, RealTimeServerEvents>;
