import { PeriodicBroadcaster } from "@interfaces/web-sockets/PeriodicBroadcaster";
import { RealTimeUtilityMetersHandler } from "@interfaces/web-sockets/handlers/RealTimeUtilityMetersHandler";
import { Namespace, Socket } from "socket.io";
import { UtilityMetersDTO } from "@presentation/UtilityMetersDTO";
import { NamespaceRoom } from "@interfaces/web-sockets/namespace/rooms/NamespaceRoom";
import { UtilityMetersServersEvents } from "@interfaces/web-sockets/events/serverEvents";
import { UtilityMetersClientEvents } from "@interfaces/web-sockets/events/clientEvents";
import { UtilityMetersSocket } from "@interfaces/web-sockets/sockets/UtilityMetersSocket";

export class RealTimeUtilityMetersRoom implements NamespaceRoom {
  private realTimePeriodicBroadcaster?: PeriodicBroadcaster;
  private readonly BROADCAST_INTERVAL_MS = 5000;
  private readonly ROOM_NAME: string = "utility-meters-room";
  private readonly FAIL_DATA_FETCH_MSG = "Failed to fetch utility meters";

  constructor(private utilityMetersHandler: RealTimeUtilityMetersHandler) {}

  name(): string {
    return this.ROOM_NAME;
  }

  setup(
    namespace: Namespace<UtilityMetersClientEvents, UtilityMetersServersEvents>,
  ) {
    this.realTimePeriodicBroadcaster = new PeriodicBroadcaster(
      "utility-meters",
      async () => {
        try {
          const utilityMeters =
            await this.utilityMetersHandler.getUtilityMeters();

          console.log(utilityMeters);

          namespace.to(this.name()).emit("utilityMetersUpdate", utilityMeters);
        } catch (error) {
          console.error("Failed to send data about utility meters", error);
          namespace.to(this.name()).emit("error", this.FAIL_DATA_FETCH_MSG);
        }
      },
      this.BROADCAST_INTERVAL_MS,
    );
  }

  subscribe(socket: UtilityMetersSocket) {
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
    this.realTimePeriodicBroadcaster?.clientDisconnected(socket);
  }
}
