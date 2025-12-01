import { Namespace, Socket } from "socket.io";

export interface NamespaceRoom {
  setup(namespace: Namespace): void;
  subscribe(socket: Socket): void;
  unsubscribe(socket: Socket): void;
}
