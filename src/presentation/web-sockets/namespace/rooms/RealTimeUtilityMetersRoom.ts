import { PeriodicBroadcaster } from "@presentation/web-sockets/PeriodicBroadcaster";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { Namespace, Socket } from "socket.io";
import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";
import { NamespaceRoom } from "@presentation/web-sockets/namespace/rooms/NamespaceRoom";
import { RealTimeUtilityMetersServersEvents } from "@presentation/web-sockets/events/serverEvents";
import { RealTimeUtilityMetersClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { RealTimeUtilityMetersSocket } from "@presentation/web-sockets/sockets/RealTimeUtilityMetersSocket";

export class RealTimeUtilityMetersRoom implements NamespaceRoom {
  private realTimePeriodicBroadcaster?: PeriodicBroadcaster;
  private readonly BROADCAST_INTERVAL_MS = 5000;
  private readonly ROOM_NAME: string = "utility-meters-room";
  private readonly FAIL_DATA_FETCH_MSG = "Failed to fetch utility meters";

  constructor(private utilityMetersHandler: UtilityMetersHandler) {}

  name(): string {
    return this.ROOM_NAME;
  }

  setup(
    namespace: Namespace<
      RealTimeUtilityMetersClientEvents,
      RealTimeUtilityMetersServersEvents
    >,
  ) {
    this.realTimePeriodicBroadcaster = new PeriodicBroadcaster(
      "utility-meters",
      async () => {
        try {
          const utilityMeters =
            await this.utilityMetersHandler.getUtilityMeters();

          namespace.to(this.name()).emit("utilityMetersUpdate", utilityMeters);
        } catch (error) {
          console.error("Failed to send data about utility meters", error);
          namespace.to(this.name()).emit("error", this.FAIL_DATA_FETCH_MSG);
        }
      },
      this.BROADCAST_INTERVAL_MS,
    );
  }

  subscribe(socket: RealTimeUtilityMetersSocket) {
    this.realTimePeriodicBroadcaster?.newClient(socket);

    this.utilityMetersHandler
      .getCachedOrFreshData(this.BROADCAST_INTERVAL_MS)
      .then((data: UtilityMetersDTO) => {
        socket.emit("utilityMetersUpdate", data);
      })
      .catch((error) => {
        console.error(`Failed to send initial data to ${socket.id}:`, error);
        socket.emit("error", this.FAIL_DATA_FETCH_MSG);
      });
  }

  unsubscribe(socket: Socket) {
    if (socket.rooms.has(this.ROOM_NAME)) {
      this.realTimePeriodicBroadcaster?.clientDisconnected(socket);
    }
  }
}
