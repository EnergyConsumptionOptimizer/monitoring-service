import { RealTimeClientEvents } from "@interfaces/web-sockets/events/clientEvents";
import { Socket } from "socket.io";
import { RealTimeServerEvents } from "@interfaces/web-sockets/events/serverEvents";

export type RealTimeSocket = Socket<RealTimeClientEvents, RealTimeServerEvents>;
