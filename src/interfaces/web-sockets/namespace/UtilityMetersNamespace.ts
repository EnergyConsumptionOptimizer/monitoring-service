import { SocketNamespace } from "@interfaces/web-sockets/SocketNamespace";
import { Namespace, Server } from "socket.io";
import { UtilityMetersSubscription } from "@interfaces/web-sockets/namespace/subscriptions/UtilityMetersSubscription";
import { UtilityMetersSocket } from "@interfaces/web-sockets/sockets/UtilityMetersSocket";
import { UtilityMetersQueryDTO } from "@presentation/web-socket/UtilityMetersQueryDTO";

export class UtilityMetersNamespace implements SocketNamespace {
  private readonly NAMESPACE_PATH = "/utility-meters";
  private namespace?: Namespace;

  constructor(private utilityMetersSubscription: UtilityMetersSubscription) {}

  name(): string {
    return this.NAMESPACE_PATH;
  }

  setup(io: Server): void {
    this.namespace = io.of(this.name());

    this.namespace.on("connect", (socket: UtilityMetersSocket) => {
      this.handleConnection(socket);
      this.handleEditQuery(socket);
      this.handleDeleteQuery(socket);

      socket.on("disconnect", () =>
        this.utilityMetersSubscription.unsubscribe(socket),
      );
    });
  }

  private handleConnection(socket: UtilityMetersSocket) {
    socket.on(
      "subscribe",
      (queries: UtilityMetersQueryDTO[], interval?: number) =>
        this.utilityMetersSubscription.subscribe(socket, queries, interval),
    );
  }

  private handleEditQuery(socket: UtilityMetersSocket) {
    socket.on("editQuery", (query: UtilityMetersQueryDTO) =>
      this.utilityMetersSubscription.addOrEditQuery(socket, query),
    );
  }

  private handleDeleteQuery(socket: UtilityMetersSocket) {
    socket.on("deleteQuery", (queryLabel: string) =>
      this.utilityMetersSubscription.deleteQuery(socket, queryLabel),
    );
  }

  stop(io: Server): void {
    io._nsps.delete(this.name());
    this.disconnectAllClients();
  }

  private disconnectAllClients(): void {
    this.namespace?.sockets.forEach((socket) => {
      this.utilityMetersSubscription.unsubscribe(socket);
      socket.disconnect(true);
    });
  }
}
