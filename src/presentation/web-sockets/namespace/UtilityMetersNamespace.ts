import { SocketNamespace } from "@presentation/web-sockets/SocketNamespace";
import { Namespace, Server } from "socket.io";
import { UtilityMetersSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityMetersSubscription";
import { UtilityMetersSocket } from "@presentation/web-sockets/sockets/UtilityMetersSocket";
import { UtilityMetersQueryDTO } from "@presentation/UtilityMetersQueryDTO";
import { Logger } from "pino";

export class UtilityMetersNamespace implements SocketNamespace {
  private readonly NAMESPACE_PATH = "/utility-meters";
  private namespace?: Namespace;
  readonly #logger?: Logger;
  constructor(
    private utilityMetersSubscription: UtilityMetersSubscription,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  name(): string {
    return this.NAMESPACE_PATH;
  }

  setup(io: Server): void {
    this.namespace = io.of(this.name());

    this.namespace.on("connect", (socket: UtilityMetersSocket) => {
      this.handleConnection(socket);
      this.handleEditQuery(socket);
      this.handleDeleteQuery(socket);

      socket.on("disconnect", () => {
        this.#logger?.debug(
          { socket: socket.id, namespace: this.NAMESPACE_PATH },
          "Disconnect",
        );
        return this.utilityMetersSubscription.unsubscribe(socket);
      });
    });
  }

  private handleConnection(socket: UtilityMetersSocket) {
    socket.on(
      "subscribe",
      (queries: UtilityMetersQueryDTO[], interval?: number) => {
        this.#logger?.debug(
          { socket: socket.id, namespace: this.NAMESPACE_PATH },
          "Subscribe",
        );
        return this.utilityMetersSubscription.subscribe(
          socket,
          queries,
          interval,
        );
      },
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
