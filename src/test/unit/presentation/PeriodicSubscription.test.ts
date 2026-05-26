import { PeriodicSubscription } from "@presentation/web-sockets/PeriodicSubscription";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockedObject,
  vi,
} from "vitest";
import { Socket } from "socket.io";

function mockSocket(id = "socket-1") {
  return { id, emit: vi.fn() } as MockedObject<Socket>;
}

describe("PeriodicSubscription", () => {
  let subscription: PeriodicSubscription;

  beforeEach(() => {
    vi.useFakeTimers();
    subscription = new PeriodicSubscription();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call callback on the default interval", () => {
    const socket = mockSocket();
    const callback = vi.fn();
    subscription.newSubscription(socket, callback);
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should call callback on a custom interval", () => {
    const socket = mockSocket();
    const callback = vi.fn();
    subscription.newSubscription(socket, callback, 4000);
    vi.advanceTimersByTime(4000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should reject an interval below the minimum and not start", () => {
    const socket = mockSocket();
    const callback = vi.fn();
    subscription.newSubscription(socket, callback, 500);
    vi.advanceTimersByTime(10000);
    expect(callback).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith("error", expect.any(String));
  });

  it("should replace the existing subscription when called again for the same socket", () => {
    const socket = mockSocket();
    const first = vi.fn();
    const second = vi.fn();
    subscription.newSubscription(socket, first, 2000);
    subscription.newSubscription(socket, second, 2000); // replaces first
    vi.advanceTimersByTime(2000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("should stop calling callback after unsubscribe", () => {
    const socket = mockSocket();
    const callback = vi.fn();
    subscription.newSubscription(socket, callback);
    subscription.unsubscribeSocket(socket);
    vi.advanceTimersByTime(10000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle unsubscribing a socket that never subscribed", () => {
    expect(() => subscription.unsubscribeSocket(mockSocket())).not.toThrow();
  });

  it("should manage subscriptions independently per socket", () => {
    const s1 = mockSocket("s-1");
    const s2 = mockSocket("s-2");
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    subscription.newSubscription(s1, cb1, 2000);
    subscription.newSubscription(s2, cb2, 2000);
    subscription.unsubscribeSocket(s1);
    vi.advanceTimersByTime(2000);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});
