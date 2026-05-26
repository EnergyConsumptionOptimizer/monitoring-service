import { Socket } from "socket.io";
import { Logger } from "pino";

export class PeriodicBroadcaster {
  private connectedClients = 0;
  private broadcastInterval?: NodeJS.Timeout;
  readonly #logger?: Logger;

  constructor(
    private readonly label: string,
    private broadcastCallback: () => void,
    private BROADCAST_INTERVAL_MS = 5000,
    logger?: Logger,
  ) {
    this.#logger = logger;
  }

  newClient(socket: Socket) {
    this.connectedClients++;

    this.#logger?.debug(
      { socket: socket.id, label: this.label },
      `New client connected  Total: ${this.connectedClients}`,
    );

    if (this.connectedClients === 1) {
      this.startBroadcasting().catch((error) => {
        this.#logger?.error(
          { socket: socket.id, label: this.label, error },
          "Failed to start to broadcast",
        );
        socket.emit("error", "Failed to connect");
        this.connectedClients--;
      });
    }
  }

  clientDisconnected(socket: Socket) {
    this.connectedClients--;

    this.#logger?.debug(
      { socket: socket.id, label: this.label },
      `Client disconnected. Total: ${this.connectedClients}`,
    );

    if (this.connectedClients === 0) {
      this.stopBroadcasting();
    }
  }

  private async startBroadcasting() {
    this.#logger?.debug({ label: this.label }, "Starting broadcast...");

    this.broadcastInterval = setInterval(
      this.broadcastCallback,
      this.BROADCAST_INTERVAL_MS,
    );
  }

  stopBroadcasting(): void {
    if (this.broadcastInterval) {
      this.#logger?.debug({ label: this.label }, "Stopping broadcast...");

      clearInterval(this.broadcastInterval);
      this.broadcastInterval = undefined;
    }
  }
}
