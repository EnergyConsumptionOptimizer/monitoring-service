import { ClientSocketLock } from "@presentation/web-sockets/ClientSocketLock";
import { PeriodicSubscription } from "@presentation/web-sockets/PeriodicSubscription";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { UtilityMetersSocket } from "@presentation/web-sockets/sockets/UtilityMetersSocket";
import { UtilityMetersQueryDTO } from "@presentation/UtilityMetersQueryDTO";
import { UtilityMetersQueryResultMapper } from "@presentation/UtilityMetersQueryResultDTO";
import { UtilityMeters } from "@domain/values/UtilityMeters";
import { UtilityMetersMapper } from "@presentation/UtilityMetersDTO";
import { Logger } from "pino";

export class UtilityMetersSubscription {
  readonly #logger?: Logger;
  readonly #utilityMetersHandler: UtilityMetersHandler;
  private periodicSubscription: PeriodicSubscription =
    new PeriodicSubscription();
  private clientsQueries = new Map<string, UtilityMetersQueryDTO[]>();

  private lock: ClientSocketLock = new ClientSocketLock();

  constructor(utilityMetersHandler: UtilityMetersHandler, logger?: Logger) {
    this.#utilityMetersHandler = utilityMetersHandler;
    this.#logger = logger;
  }

  async subscribe(
    socket: UtilityMetersSocket,
    queries: UtilityMetersQueryDTO[],
    interval?: number,
  ) {
    if (!queries || queries.length === 0) {
      this.#logger?.error(
        {
          socket: socket.id,
          queries: queries,
        },
        "No queries found",
      );
      socket.emit("error", "At least one query must be provided");
      return;
    }

    this.clientsQueries.set(socket.id, queries);

    try {
      await this.#sendUtilityMetersUpdate(socket);
    } catch (error) {
      this.#logger?.error(
        {
          socket: socket.id,
          error,
        },
        "Initial update failed",
      );
      socket.emit("error", `Initial update failed: ${error}`);
      this.clientsQueries.delete(socket.id);
      return;
    }

    this.periodicSubscription.newSubscription(
      socket,
      async () => {
        await this.#sendUtilityMetersUpdate(socket);
      },
      interval,
    );
  }

  unsubscribe(socket: UtilityMetersSocket) {
    this.periodicSubscription.unsubscribeSocket(socket);
    this.clientsQueries.delete(socket.id);
  }

  async addOrEditQuery(
    socket: UtilityMetersSocket,
    query: UtilityMetersQueryDTO,
  ) {
    const queries = this.clientsQueries.get(socket.id);

    if (!queries) {
      this.#logger?.error(
        {
          socket: socket.id,
        },
        "No query found",
      );
      socket.emit("error", "No query found");
      return;
    }

    const release = await this.lock.acquire(socket.id);

    try {
      const queryIndex = queries?.findIndex((q) => q.label === query.label);

      if (queryIndex != -1) {
        queries.splice(queryIndex, 1);
      }

      const update = await this.#getUtilityMetersQueryResult(query);

      socket.emit("utilityMetersQueryUpdate", update);

      queries.push(query);

      this.clientsQueries.set(socket.id, queries);
    } finally {
      release();
    }
  }

  async deleteQuery(socket: UtilityMetersSocket, label: string) {
    const queries = this.clientsQueries.get(socket.id);

    if (!queries) {
      this.#logger?.error(
        {
          socket: socket.id,
        },
        "No query found",
      );
      socket.emit("error", "No query found");
      return;
    }

    const release = await this.lock.acquire(socket.id);

    try {
      const index = queries.findIndex((q) => q.label === label);

      if (index === -1) {
        this.#logger?.error(
          {
            socket: socket.id,
            queries,
          },
          `Query with label '${label}' not found`,
        );
        socket.emit("error", `Query with label '${label}' not found`);
        return;
      }

      queries.splice(index, 1);

      this.clientsQueries.set(socket.id, queries);
    } finally {
      release();
    }
  }

  async #sendUtilityMetersUpdate(socket: UtilityMetersSocket): Promise<void> {
    const release = await this.lock.acquire(socket.id);

    try {
      const queries = this.clientsQueries.get(socket.id);

      if (!queries) {
        return;
      }
      const updates = await Promise.all(
        queries.map(async (query) => this.#getUtilityMetersQueryResult(query)),
      );

      socket.emit("utilityMetersUpdate", updates);
    } catch (error) {
      this.#logger?.error(
        {
          socket: socket.id,
          error,
        },
        "Failed to fetch utility consumptions",
      );
      socket.emit("error", `Failed to fetch utility consumptions: ${error}`);
    } finally {
      release();
    }
  }

  async #getUtilityMetersQueryResult(query: UtilityMetersQueryDTO) {
    const utilityMetersData = await this.#utilityMetersHandler.getUtilityMeters(
      {
        ...query?.filter,
        ...query?.tagsFilter,
      },
    );

    return UtilityMetersQueryResultMapper.toDTO(
      query.label,
      this.#parseUtilityMeters(utilityMetersData),
    );
  }

  #parseUtilityMeters(utilityMeters: UtilityMeters) {
    return UtilityMetersMapper.toDTO(utilityMeters);
  }
}
