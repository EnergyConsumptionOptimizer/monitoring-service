import { ClientSocketLock } from "@interfaces/web-sockets/ClientSocketLock";
import { PeriodicSubscription } from "@interfaces/web-sockets/PeriodicSubscription";
import { UtilityMetersHandler } from "@interfaces/web-sockets/handlers/UtilityMetersHandler";
import { UtilityMetersSocket } from "@interfaces/web-sockets/sockets/UtilityMetersSocket";
import { UtilityMetersQueryDTO } from "@presentation/web-socket/UtilityMetersQueryDTO";
import { UtilityMetersQueryResultMapper } from "@presentation/web-socket/UtilityMetersQueryResultDTO";
import { UtilityConsumptionMapper } from "@presentation/TagsFilterDTO";

export class UtilityMetersSubscription {
  private periodicSubscription: PeriodicSubscription =
    new PeriodicSubscription();
  private clientsQueries = new Map<string, UtilityMetersQueryDTO[]>();

  private lock: ClientSocketLock = new ClientSocketLock();

  constructor(private readonly utilityMetersHandler: UtilityMetersHandler) {}

  async subscribe(
    socket: UtilityMetersSocket,
    queries: UtilityMetersQueryDTO[],
    interval?: number,
  ) {
    if (!queries || queries.length === 0) {
      console.log("No queries found.");
      socket.emit("error", "At least one query must be provided");
      return;
    }

    this.clientsQueries.set(socket.id, queries);

    try {
      await this.sendUtilityMetersUpdate(socket);
    } catch (error) {
      socket.emit("error", `Initial update failed: ${error}`);
      this.clientsQueries.delete(socket.id);
      return;
    }

    this.periodicSubscription.newSubscription(
      socket,
      async () => {
        await this.sendUtilityMetersUpdate(socket);
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
      socket.emit("error", "No active subscription found");
      return;
    }

    const release = await this.lock.acquire(socket.id);

    try {
      const queryIndex = queries?.findIndex((q) => q.label === query.label);

      if (queryIndex != -1) {
        queries.splice(queryIndex, 1);
      }

      const update = await this.getUtilityMetersQueryResult(query);

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
      socket.emit("error", "No active subscription found");
      return;
    }

    const release = await this.lock.acquire(socket.id);

    try {
      const index = queries.findIndex((q) => q.label === label);

      if (index === -1) {
        socket.emit("error", `Query with label '${label}' not found`);
        return;
      }

      queries.splice(index, 1);

      this.clientsQueries.set(socket.id, queries);
    } finally {
      release();
    }
  }

  private async sendUtilityMetersUpdate(
    socket: UtilityMetersSocket,
  ): Promise<void> {
    const release = await this.lock.acquire(socket.id);

    try {
      const queries = this.clientsQueries.get(socket.id);

      if (!queries) {
        return;
      }
      const updates = await Promise.all(
        queries.map(async (query) => this.getUtilityMetersQueryResult(query)),
      );

      socket.emit("utilityMetersUpdate", updates);
    } catch (error) {
      socket.emit("error", `Failed to fetch utility consumptions: ${error}`);
      console.error(`Error for ${socket.id}:`, error);
    } finally {
      release();
    }
  }

  private async getUtilityMetersQueryResult(query: UtilityMetersQueryDTO) {
    const utilityMetersData = await this.utilityMetersHandler.getUtilityMeters(
      query.filter,
      query.tagsFilter
        ? UtilityConsumptionMapper.toDomain(query.tagsFilter)
        : undefined,
    );

    return UtilityMetersQueryResultMapper.toDTO(query.label, utilityMetersData);
  }
}
