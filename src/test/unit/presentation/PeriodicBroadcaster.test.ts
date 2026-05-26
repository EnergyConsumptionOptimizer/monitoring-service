import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
  MockedObject,
} from "vitest";
import { PeriodicBroadcaster } from "@presentation/web-sockets/PeriodicBroadcaster";
import { Socket } from "socket.io";

function mockSocket(id = "socket-1") {
  return { id, emit: vi.fn() } as MockedObject<Socket>;
}

describe("PeriodicBroadcaster", () => {
  let callback: () => void;
  let broadcaster: PeriodicBroadcaster;

  beforeEach(() => {
    vi.useFakeTimers();
    callback = vi.fn();
    broadcaster = new PeriodicBroadcaster("test", callback, 5000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start broadcasting when the first client connects", () => {
    broadcaster.newClient(mockSocket());
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not start a second interval when a second client connects", () => {
    broadcaster.newClient(mockSocket("s-1"));
    broadcaster.newClient(mockSocket("s-2"));
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should keep broadcasting when one of many clients disconnects", () => {
    const s1 = mockSocket("s-1");
    const s2 = mockSocket("s-2");
    broadcaster.newClient(s1);
    broadcaster.newClient(s2);
    broadcaster.clientDisconnected(s1);
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should stop broadcasting when the last client disconnects", () => {
    const socket = mockSocket();
    broadcaster.newClient(socket);
    broadcaster.clientDisconnected(socket);
    vi.advanceTimersByTime(10000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should resume broadcasting when a new client connects after all disconnected", () => {
    const s1 = mockSocket("s-1");
    broadcaster.newClient(s1);
    broadcaster.clientDisconnected(s1);

    broadcaster.newClient(mockSocket("s-2"));
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("stopBroadcasting() should be idempotent", () => {
    broadcaster.newClient(mockSocket());
    broadcaster.stopBroadcasting();
    broadcaster.stopBroadcasting();
    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });
});
