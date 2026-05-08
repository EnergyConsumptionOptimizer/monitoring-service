import { Namespace, Socket } from "socket.io";

export interface NamespaceRoom {
  name(): string;
  setup(namespace: Namespace): void;
  subscribe(socket: Socket): void;
  unsubscribe(socket: Socket): void;
}
