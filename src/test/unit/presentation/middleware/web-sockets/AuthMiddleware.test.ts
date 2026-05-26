import { beforeEach, describe, expect, it, vi } from "vitest";
import { Socket } from "socket.io";
import {
  ForbiddenError,
  InvalidTokenError,
  SocketAuthMiddleware,
} from "@presentation/web-sockets/middleware/SocketAuthMiddleware";

function mockSocket(headers: Record<string, string> = {}): Socket {
  return {
    handshake: { headers },
    data: {},
  } as unknown as Socket;
}

describe("SocketAuthMiddleware", () => {
  let middleware: SocketAuthMiddleware;

  beforeEach(() => {
    middleware = new SocketAuthMiddleware();
  });

  describe("authenticate()", () => {
    it("should set user in socket.data and call next when headers are valid", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "admin",
        "x-user-role": "ADMIN",
      });
      const next = vi.fn();

      middleware.authenticate(socket, next);

      expect(socket.data.user).toEqual({
        id: "user-1",
        username: "admin",
        role: "ADMIN",
      });
      expect(next).toHaveBeenCalledWith();
    });

    it("should default role to HOUSEHOLD when x-user-role is missing", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "bob",
      });
      const next = vi.fn();

      middleware.authenticate(socket, next);

      expect(socket.data.user).toMatchObject({ role: "HOUSEHOLD" });
      expect(next).toHaveBeenCalledWith();
    });

    it("should default username to empty string when x-user-username is missing", () => {
      const socket = mockSocket({ "x-user-id": "user-1" });
      const next = vi.fn();

      middleware.authenticate(socket, next);

      expect(socket.data.user).toMatchObject({ username: "" });
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with InvalidTokenError when x-user-id is missing", () => {
      const socket = mockSocket({});
      const next = vi.fn();

      middleware.authenticate(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(InvalidTokenError));
      expect(socket.data.user).toBeUndefined();
    });
  });

  describe("authenticateAdmin()", () => {
    it("should set user in socket.data and call next for ADMIN role", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "admin",
        "x-user-role": "ADMIN",
      });
      const next = vi.fn();

      middleware.authenticateAdmin(socket, next);

      expect(socket.data.user).toMatchObject({ role: "ADMIN" });
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with ForbiddenError for non-ADMIN role", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "bob",
        "x-user-role": "HOUSEHOLD",
      });
      const next = vi.fn();

      middleware.authenticateAdmin(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(socket.data.user).toBeUndefined();
    });

    it("should call next with InvalidTokenError when x-user-id is missing", () => {
      const socket = mockSocket({});
      const next = vi.fn();

      middleware.authenticateAdmin(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(InvalidTokenError));
    });
  });

  describe("requireRole()", () => {
    it("should set user and call next when user has a required role", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "admin",
        "x-user-role": "ADMIN",
      });
      const next = vi.fn();

      middleware.requireRole("ADMIN")(socket, next);

      expect(socket.data.user).toMatchObject({ role: "ADMIN" });
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with ForbiddenError when user lacks the required role", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "bob",
        "x-user-role": "HOUSEHOLD",
      });
      const next = vi.fn();

      middleware.requireRole("ADMIN")(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(socket.data.user).toBeUndefined();
    });

    it("should allow multiple roles", () => {
      const socket = mockSocket({
        "x-user-id": "user-1",
        "x-user-username": "bob",
        "x-user-role": "HOUSEHOLD",
      });
      const next = vi.fn();

      middleware.requireRole("ADMIN", "HOUSEHOLD")(socket, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with InvalidTokenError when x-user-id is missing", () => {
      const socket = mockSocket({});
      const next = vi.fn();

      middleware.requireRole("ADMIN")(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(InvalidTokenError));
    });
  });
});
