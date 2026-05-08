import { Socket } from "socket.io";

export class PeriodicSubscription {
  private intervals = new Map<string, NodeJS.Timeout>();
  private readonly UPDATE_INTERVAL_MS = 2000;

  newSubscription(socket: Socket, callback: () => void, interval?: number) {
    this.clearInterval(socket.id);

    if (interval && !this.isIntervalValid(interval)) {
      socket.emit(
        "error",
        `Interval must be at least ${this.UPDATE_INTERVAL_MS}ms (${this.UPDATE_INTERVAL_MS / 1000} seconds).`,
      );
      return;
    }

    const timeout = setInterval(callback, interval ?? this.UPDATE_INTERVAL_MS);

    this.intervals.set(socket.id, timeout);
  }

  unsubscribeSocket(socket: Socket) {
    this.clearInterval(socket.id);
  }

  private isIntervalValid(interval: number) {
    return interval >= this.UPDATE_INTERVAL_MS;
  }

  private clearInterval(socketId: string): void {
    const interval = this.intervals.get(socketId);

    if (interval) {
      clearInterval(interval);
      this.intervals.delete(socketId);
    }
  }
}
