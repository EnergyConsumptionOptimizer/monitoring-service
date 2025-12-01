import { Server } from "socket.io";
import { SocketNamespace } from "@interfaces/web-sockets/SocketNamespace";
export class SocketsNamespaceManager {
  private namespaces: SocketNamespace[];

  constructor(private readonly io: Server) {
    this.namespaces = [];
  }

  registerNamespaces(namespace: SocketNamespace[]): void {
    namespace.forEach((ns) => this.registerNewNamespace(ns));
  }

  registerNewNamespace(namespace: SocketNamespace): void {
    namespace.setup(this.io);
    this.namespaces.push(namespace);
  }

  stopByName(name: string): void {
    this.namespaces
      .find((namespace: SocketNamespace) => namespace.name() == name)
      ?.stop(this.io);
  }

  stopAllNamespaces(): void {
    this.namespaces.forEach((namespace) => {
      namespace.stop(this.io);
    });
  }
}
