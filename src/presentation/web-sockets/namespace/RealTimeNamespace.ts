import { Namespace, Server } from "socket.io";
import { SocketNamespace } from "@presentation/web-sockets/SocketNamespace";
import { RealTimeClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { RealTimeServerEvents } from "@presentation/web-sockets/events/serverEvents";
import { ActiveSmartFurnitureHookupsRoom } from "@presentation/web-sockets/namespace/rooms/ActiveSmartFurnitureHookupsRoom";
import { RealTimeUtilityMetersRoom } from "@presentation/web-sockets/namespace/rooms/RealTimeUtilityMetersRoom";
import { NamespaceRoom } from "@presentation/web-sockets/namespace/rooms/NamespaceRoom";
import { RealTimeSocket } from "@presentation/web-sockets/sockets/RealTimeSocket";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";

export class RealTimeNamespace implements SocketNamespace {
  private readonly NAMESPACE_PATH = "/real-time";
  private namespace?: Namespace<RealTimeClientEvents, RealTimeServerEvents>;
  private rooms: NamespaceRoom[] = [];

  constructor(
    private activeSmartFurnitureHookupsRoom: ActiveSmartFurnitureHookupsRoom,
    private utilityMetersRoom: RealTimeUtilityMetersRoom,
    private authMiddleware: SocketAuthMiddleware,
  ) {
    this.rooms.push(activeSmartFurnitureHookupsRoom);
    this.rooms.push(utilityMetersRoom);
  }

  name(): string {
    return this.NAMESPACE_PATH;
  }

  setup(io: Server): void {
    this.namespace = io.of(this.name());

    this.namespace.use(this.authMiddleware.authenticate);

    for (const room of this.rooms) {
      room.setup(this.namespace);
    }

    this.namespace.on("connect", (socket: RealTimeSocket) => {
      this.handleActiveSmartFurnitureHookupSubscription(socket);
      this.handleUtilityMetersSubscription(socket);
      socket.on("disconnecting", () => {
        console.log(`[real-time] ${socket.id} disconnecting`);

        this.rooms.forEach((room) => {
          room.unsubscribe(socket);
        });
      });
      socket.on("disconnect", () => {
        console.log(`[real-time] ${socket.id} disconnected`);
      });
    });
  }

  private handleActiveSmartFurnitureHookupSubscription(socket: RealTimeSocket) {
    socket.on("subscribeActiveSmartFurnitureHookups", () => {
      this.handleRoomSubscription(socket, this.activeSmartFurnitureHookupsRoom);
    });
  }

  private handleUtilityMetersSubscription(socket: RealTimeSocket) {
    socket.on("subscribeRealTimeUtilityMeters", () => {
      this.handleRoomSubscription(socket, this.utilityMetersRoom);
    });
  }

  private handleRoomSubscription(socket: RealTimeSocket, room: NamespaceRoom) {
    console.log(`[real-time] Socket ${socket.id} joined room "${room.name()}"`);
    socket.join(room.name());

    room.subscribe(socket);
  }

  stop(io: Server): void {
    this.disconnectAllClients();
    io._nsps.delete(this.name());
  }

  private disconnectAllClients(): void {
    this.namespace?.sockets.forEach((socket) => {
      for (const room of this.rooms) {
        room.unsubscribe(socket);
      }
      socket.disconnect(true);
    });
  }
}
