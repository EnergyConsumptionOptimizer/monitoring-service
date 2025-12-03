import { utilityTypeFromString } from "@domain/UtilityType";
import { UtilityConsumptionsQueryDTO } from "@presentation/web-socket/UtilityConsumptionsQueryDTO";
import { UtilityConsumptionsQueryResultMapper } from "@presentation/web-socket/UtilityConsumptionsQueryResultDTO";
import { UtilityConsumptionsSocket } from "@interfaces/web-sockets/sockets/UtilityConsumptionsSocket";
import { UtilityConsumptionsHandler } from "@interfaces/web-sockets/handlers/UtilityConsumptionsHandler";
import { ClientSocketLock } from "@interfaces/web-sockets/ClientSocketLock";
import { PeriodicSubscription } from "@interfaces/web-sockets/PeriodicSubscription";

export class UtilityConsumptionsSubscription {
  private periodicSubscription: PeriodicSubscription =
    new PeriodicSubscription();
  private clientsQueries = new Map<string, UtilityConsumptionsQueryDTO[]>();

  private lock: ClientSocketLock = new ClientSocketLock();

  constructor(
    private readonly utilityConsumptionHandler: UtilityConsumptionsHandler,
  ) {}

  async subscribe(
    socket: UtilityConsumptionsSocket,
    queries: UtilityConsumptionsQueryDTO[],
  ) {
    if (!queries || queries.length === 0) {
      console.log("No queries found.");
      socket.emit("error", "At least one query must be provided");
      return;
    }

    this.clientsQueries.set(socket.id, queries);

    try {
      await this.sendUtilityConsumptionsUpdate(socket);
    } catch (error) {
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
      socket.emit("error", "No active subscription found");
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
      console.error(`Error for ${socket.id}:`, error);
    } finally {
      release();
    }
  }

  private async getUtilityConsumptionsQueryResult(
    query: UtilityConsumptionsQueryDTO,
  ) {
    const utilityConsumptionsData =
      await this.utilityConsumptionHandler.getUtilityConsumptions(
        utilityTypeFromString(query.utilityType),
        query.filter,
        query.tagFilter,
      );

    return UtilityConsumptionsQueryResultMapper.toDTO(
      query.label,
      utilityConsumptionsData,
    );
  }
}
