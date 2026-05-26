import { Socket } from "socket.io";
import { type UserRole, UserRoles } from "@domain/values/UserRole";

type SocketNextFunction = (err?: Error) => void;

export interface AuthenticatedUser {
  readonly id: string;
  readonly username: string;
  readonly role: UserRole;
}

export class InvalidTokenError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "InvalidTokenError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden: Insufficient permissions");
    this.name = "ForbiddenError";
  }
}

export class SocketAuthMiddleware {
  private extractUser(socket: Socket): AuthenticatedUser {
    const headers = socket.handshake.headers;

    const userId = headers["x-user-id"];
    const username = headers["x-user-username"];
    const userRole = headers["x-user-role"];

    if (typeof userId !== "string" || !userId) {
      throw new InvalidTokenError();
    }

    return {
      id: userId,
      username: typeof username === "string" ? username : "",
      role: (userRole as UserRole) || UserRoles.HOUSEHOLD,
    };
  }

  authenticate = (socket: Socket, next: SocketNextFunction): void => {
    try {
      socket.data.user = this.extractUser(socket);
      next();
    } catch (error) {
      next(error as Error);
    }
  };

  authenticateAdmin = (socket: Socket, next: SocketNextFunction): void => {
    try {
      const user = this.extractUser(socket);

      if (user.role !== UserRoles.ADMIN) {
        next(new ForbiddenError());
      } else {
        socket.data.user = user;
        next();
      }
    } catch (error) {
      next(error as Error);
    }
  };

  requireRole = (...roles: UserRole[]) => {
    return (socket: Socket, next: SocketNextFunction): void => {
      try {
        const user = this.extractUser(socket);

        if (!roles.includes(user.role)) {
          next(new ForbiddenError());
        } else {
          socket.data.user = user;
          next();
        }
      } catch (error) {
        next(error as Error);
      }
    };
  };
}
