import { SocketNamespace } from "@presentation/web-sockets/SocketNamespace";
import { Namespace, Server } from "socket.io";
import { UtilityConsumptionsSubscription } from "@presentation/web-sockets/namespace/subscriptions/UtilityConsumptionsSubscription";
import { UtilityConsumptionsQueryDTO } from "@presentation/UtilityConsumptionsQueryDTO";
import { UtilityConsumptionsSocket } from "@presentation/web-sockets/sockets/UtilityConsumptionsSocket";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";

export class UtilityConsumptionsNamespace implements SocketNamespace {
  private readonly NAMESPACE_PATH = "/utility-consumptions";
  private namespace?: Namespace;

  constructor(
    private utilityConsumptionSubscription: UtilityConsumptionsSubscription,
    private authMiddleware: SocketAuthMiddleware,
  ) {}

  name(): string {
    return this.NAMESPACE_PATH;
  }

  setup(io: Server): void {
    this.namespace = io.of(this.name());

    this.namespace.use(this.authMiddleware.authenticate);

    this.namespace.on("connect", (socket: UtilityConsumptionsSocket) => {
      this.handleConnection(socket);
      this.handleEditQuery(socket);

      socket.on("disconnect", () =>
        this.utilityConsumptionSubscription.unsubscribe(socket),
      );
    });
  }

  private handleConnection(socket: UtilityConsumptionsSocket) {
    socket.on("subscribe", (queries: UtilityConsumptionsQueryDTO[]) =>
      this.utilityConsumptionSubscription.subscribe(socket, queries),
    );
  }

  private handleEditQuery(socket: UtilityConsumptionsSocket) {
    socket.on("editQuery", (query: UtilityConsumptionsQueryDTO) =>
      this.utilityConsumptionSubscription.addOrEditQuery(socket, query),
    );
  }

  stop(io: Server): void {
    io._nsps.delete(this.name());
    this.disconnectAllClients();
  }

  private disconnectAllClients(): void {
    this.namespace?.sockets.forEach((socket) => {
      this.utilityConsumptionSubscription.unsubscribe(socket);
      socket.disconnect(true);
    });
  }
}
