export class ClientSocketLock {
  private locks = new Map<string, Promise<void>>();

  async acquire(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let releaseFn: () => void;

    const lockPromise = new Promise<void>((resolve) => {
      releaseFn = resolve;
    });

    this.locks.set(key, lockPromise);

    return () => {
      this.locks.delete(key);
      releaseFn();
    };
  }
}
