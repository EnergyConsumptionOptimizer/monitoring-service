import { UtilityConsumptionsQueryDTO } from "@presentation/UtilityConsumptionsQueryDTO";
import {
  UtilityConsumptionsQueryResultDTO,
  UtilityConsumptionsQueryResultMapper,
} from "@presentation/UtilityConsumptionsQueryResultDTO";
import { UtilityConsumptionsSocket } from "@presentation/web-sockets/sockets/UtilityConsumptionsSocket";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";
import { ClientSocketLock } from "@presentation/web-sockets/ClientSocketLock";
import { PeriodicSubscription } from "@presentation/web-sockets/PeriodicSubscription";
import { UtilityConsumptionPoint } from "@domain/values/UtilityConsumptionPoint";
import { UtilityType } from "@domain/values/UtilityType";
import { Logger } from "pino";

export class UtilityConsumptionsSubscription {
  private periodicSubscription: PeriodicSubscription =
    new PeriodicSubscription();
  private clientsQueries = new Map<string, UtilityConsumptionsQueryDTO[]>();

  private lock: ClientSocketLock = new ClientSocketLock();
  readonly #logger?: Logger;
  constructor(
    private readonly utilityConsumptionHandler: UtilityConsumptionsHandler,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  async subscribe(
    socket: UtilityConsumptionsSocket,
    queries: UtilityConsumptionsQueryDTO[],
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
      await this.sendUtilityConsumptionsUpdate(socket);
    } catch (error) {
      this.#logger?.error(
        {
          socket: socket.id,
          queries: queries,
        },
        "Initial update failed",
      );
      socket.emit("error", `Initial update failed: ${error}`);
      this.clientsQueries.delete(socket.id);
      return;
    }

    this.periodicSubscription.newSubscription(socket, async () => {
      await this.sendUtilityConsumptionsUpdate(socket);
    });
  }

  unsubscribe(socket: UtilityConsumptionsSocket) {
    this.periodicSubscription.unsubscribeSocket(socket);
    this.clientsQueries.delete(socket.id);
  }

  async addOrEditQuery(
    socket: UtilityConsumptionsSocket,
    query: UtilityConsumptionsQueryDTO,
  ) {
    const queries = this.clientsQueries.get(socket.id);

    if (!queries) {
      this.#logger?.error(
        {
          socket: socket.id,
          queries: queries,
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

      const update = await this.getUtilityConsumptionsQueryResult(query);

      socket.emit("utilityConsumptionsQueryUpdate", update);

      queries.push(query);

      this.clientsQueries.set(socket.id, queries);
    } finally {
      release();
    }
  }

  private async sendUtilityConsumptionsUpdate(
    socket: UtilityConsumptionsSocket,
  ): Promise<void> {
    const release = await this.lock.acquire(socket.id);

    try {
      const queries = this.clientsQueries.get(socket.id);

      if (!queries) {
        return;
      }
      const updates = await Promise.all(
        queries.map(async (query) =>
          this.getUtilityConsumptionsQueryResult(query),
        ),
      );

      socket.emit("utilityConsumptionsUpdate", updates);
    } catch (error) {
      socket.emit("error", `Failed to fetch utility consumptions: ${error}`);
      this.#logger?.error(
        {
          socket: socket.id,
        },
        "Failed to fetch utility consumptions",
      );
    } finally {
      release();
    }
  }

  private async getUtilityConsumptionsQueryResult(
    query: UtilityConsumptionsQueryDTO,
  ): Promise<UtilityConsumptionsQueryResultDTO> {
    const utilityType = query.utilityType;
    const utilityConsumptionsData: UtilityConsumptionPoint[] =
      await this.utilityConsumptionHandler.getUtilityConsumptions(utilityType, {
        ...query.filter,
        ...query.tagsFilter,
      });

    return UtilityConsumptionsQueryResultMapper.toDTO(
      UtilityType.from(utilityType) as UtilityType,
      query.label,
      utilityConsumptionsData,
    );
  }
}
