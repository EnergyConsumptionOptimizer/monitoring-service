import { Server } from "socket.io";

export interface SocketNamespace {
  name(): string;
  setup(io: Server): void;
  stop(io: Server): void;
}
