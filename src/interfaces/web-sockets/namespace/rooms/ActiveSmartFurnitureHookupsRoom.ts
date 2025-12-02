import { PeriodicBroadcaster } from "@interfaces/web-sockets/PeriodicBroadcaster";
import { ActiveSmartFurnitureHookupsHandler } from "@interfaces/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { Namespace } from "socket.io";
import { NamespaceRoom } from "@interfaces/web-sockets/namespace/rooms/NamespaceRoom";
import { ActiveSmartFurnitureHookupsMapper } from "@presentation/ActiveSmartFurnitureHookupsDTO";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { ActiveSmartFurnitureHookupsServersEvents } from "@interfaces/web-sockets/events/serverEvents";
import { ActiveSmartFurnitureHookupsSocket } from "@interfaces/web-sockets/sockets/ActiveSmartFurnitureHookupsSocket";
import { ActiveSmartFurnitureHookupsClientEvents } from "@interfaces/web-sockets/events/clientEvents";

export class ActiveSmartFurnitureHookupsRoom implements NamespaceRoom {
  private realTimePeriodicBroadcaster?: PeriodicBroadcaster;
  private readonly BROADCAST_INTERVAL_MS = 5000;

  private readonly ROOM_NAME: string = "active-smart-furniture-hookup-room";

  private readonly FAIL_DATA_FETCH_MSG =
    "Failed to fetch active smart furniture hookup";

  constructor(
    private activeSmartFurnitureHookupsHandler: ActiveSmartFurnitureHookupsHandler,
  ) {}

  name() {
    return this.ROOM_NAME;
  }

  setup(
    namespace: Namespace<
      ActiveSmartFurnitureHookupsClientEvents,
      ActiveSmartFurnitureHookupsServersEvents
    >,
  ) {
    this.realTimePeriodicBroadcaster = new PeriodicBroadcaster(
      "active-smart-furniture-hookup",
      async () => {
        try {
          const activeSmartFurnitureHookups =
            await this.activeSmartFurnitureHookupsHandler.getActiveSmartFurnitureHookups();

          namespace
            .to(this.ROOM_NAME)
            .emit(
              "activeSmartFurnitureHookupsUpdate",
              ActiveSmartFurnitureHookupsMapper.toDTO(
                activeSmartFurnitureHookups,
              ),
            );
        } catch (error) {
          console.error(
            "Failed to send data about active smart furniture hookup to",
            error,
          );
          namespace.emit("error", this.FAIL_DATA_FETCH_MSG);
        }
      },
      this.BROADCAST_INTERVAL_MS,
    );
  }

  subscribe(socket: ActiveSmartFurnitureHookupsSocket) {
    this.realTimePeriodicBroadcaster?.newClient(socket);

    this.activeSmartFurnitureHookupsHandler
      .getCachedOrFreshData(this.BROADCAST_INTERVAL_MS)
      .then((data: SmartFurnitureHookupID[]) => {
        console.log("emit fist data");
        socket.emit(
          "activeSmartFurnitureHookupsUpdate",
          ActiveSmartFurnitureHookupsMapper.toDTO(data),
        );
      })
      .catch((error) => {
        console.error(
          `Failed to send initial data about active smart furniture hookup to ${socket.id}:`,
          error,
        );
        socket.emit("error", this.FAIL_DATA_FETCH_MSG);
      });
  }

  unsubscribe(socket: ActiveSmartFurnitureHookupsSocket) {
    this.realTimePeriodicBroadcaster?.clientDisconnected(socket);
  }
}
