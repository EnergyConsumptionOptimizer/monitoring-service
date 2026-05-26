import { PeriodicBroadcaster } from "@presentation/web-sockets/PeriodicBroadcaster";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { Namespace } from "socket.io";
import { NamespaceRoom } from "@presentation/web-sockets/namespace/rooms/NamespaceRoom";
import { ActiveSmartFurnitureHookupsServersEvents } from "@presentation/web-sockets/events/serverEvents";
import { ActiveSmartFurnitureHookupsSocket } from "@presentation/web-sockets/sockets/ActiveSmartFurnitureHookupsSocket";
import { ActiveSmartFurnitureHookupsClientEvents } from "@presentation/web-sockets/events/clientEvents";
import { ActiveSmartFurnitureHookup } from "@domain/entities/ActiveSmartFurnitureHookup";
import {
  ActiveSmartFurnitureHookupsDTO,
  ActiveSmartFurnitureHookupsMapper,
} from "@presentation/ActiveSmartFurnitureHookupsDTO";
import { Logger } from "pino";

export class ActiveSmartFurnitureHookupsRoom implements NamespaceRoom {
  readonly #activeSmartFurnitureHookupsHandler: ActiveSmartFurnitureHookupsHandler;
  readonly #logger?: Logger;

  #realTimePeriodicBroadcaster?: PeriodicBroadcaster;
  readonly #BROADCAST_INTERVAL_MS = 5000;
  readonly #ROOM_NAME: string = "active-smart-furniture-hookup-room";
  readonly #FAIL_DATA_FETCH_MSG =
    "Failed to fetch active smart furniture hookup";

  constructor(
    activeSmartFurnitureHookupsHandler: ActiveSmartFurnitureHookupsHandler,
    logger?: Logger,
  ) {
    this.#activeSmartFurnitureHookupsHandler =
      activeSmartFurnitureHookupsHandler;
    this.#logger = logger;
  }

  name() {
    return this.#ROOM_NAME;
  }

  setup(
    namespace: Namespace<
      ActiveSmartFurnitureHookupsClientEvents,
      ActiveSmartFurnitureHookupsServersEvents
    >,
  ) {
    this.#realTimePeriodicBroadcaster = new PeriodicBroadcaster(
      "active-smart-furniture-hookup",
      async () => {
        try {
          const data =
            await this.#activeSmartFurnitureHookupsHandler.getActiveSmartFurnitureHookups();

          namespace
            .to(this.#ROOM_NAME)
            .emit(
              "activeSmartFurnitureHookupsUpdate",
              this.parseActiveSmartFurnitureHookups(data),
            );
        } catch (error) {
          this.#logger?.error(
            { error },
            "Failed to send data about active smart furniture hookup",
          );
          namespace.emit("error", this.#FAIL_DATA_FETCH_MSG);
        }
      },
      this.#BROADCAST_INTERVAL_MS,
      this.#logger,
    );
  }

  subscribe(socket: ActiveSmartFurnitureHookupsSocket) {
    this.#realTimePeriodicBroadcaster?.newClient(socket);

    this.#activeSmartFurnitureHookupsHandler
      .getCachedOrFreshData(this.#BROADCAST_INTERVAL_MS)
      .then((data: ActiveSmartFurnitureHookup[]) => {
        socket.emit(
          "activeSmartFurnitureHookupsUpdate",
          this.parseActiveSmartFurnitureHookups(data),
        );
      })
      .catch((error) => {
        this.#logger?.error(
          { socket: socket.id, error },
          "Failed to send initial data about active smart furniture hookup",
        );
        socket.emit("error", this.#FAIL_DATA_FETCH_MSG);
      });
  }

  private parseActiveSmartFurnitureHookups(
    activeSmartFurnitureHookups: ActiveSmartFurnitureHookup[],
  ): ActiveSmartFurnitureHookupsDTO {
    return ActiveSmartFurnitureHookupsMapper.toDTO(activeSmartFurnitureHookups);
  }

  unsubscribe(socket: ActiveSmartFurnitureHookupsSocket) {
    if (socket.rooms.has(this.#ROOM_NAME)) {
      this.#realTimePeriodicBroadcaster?.clientDisconnected(socket);
    }
  }
}
