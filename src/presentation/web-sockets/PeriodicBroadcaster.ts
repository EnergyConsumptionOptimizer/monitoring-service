import { Socket } from "socket.io";

export class PeriodicBroadcaster {
  private connectedClients = 0;
  private broadcastInterval?: NodeJS.Timeout;

  constructor(
    private readonly label: string,
    private broadcastCallback: () => void,
    private BROADCAST_INTERVAL_MS = 5000,
  ) {}

  newClient(socket: Socket) {
    this.connectedClients++;
    console.log(
      `[${this.label}] Client connected: ${socket.id}. Total: ${this.connectedClients}`,
    );

    if (this.connectedClients === 1) {
      this.startBroadcasting().catch((error) => {
        console.error(`[${this.label}] Failed to start to broadcast`, error);
        socket.emit("error", "Failed to connect");
        this.connectedClients--;
      });
    }
  }

  clientDisconnected(socket: Socket) {
    this.connectedClients--;
    console.log(
      `[${this.label}] Client disconnected: ${socket.id}. Total: ${this.connectedClients}`,
    );

    if (this.connectedClients === 0) {
      this.stopBroadcasting();
    }
  }

  private async startBroadcasting() {
    console.log(`[${this.label}] Starting broadcast...`);

    this.broadcastInterval = setInterval(
      this.broadcastCallback,
      this.BROADCAST_INTERVAL_MS,
    );
  }

  stopBroadcasting(): void {
    if (this.broadcastInterval) {
      console.log(`[${this.label}] Stopping broadcast...`);
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = undefined;
    }
  }
}
