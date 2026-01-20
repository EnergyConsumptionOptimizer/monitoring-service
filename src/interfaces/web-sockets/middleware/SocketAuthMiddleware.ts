import axios from "axios";
import { InvalidTokenError } from "@interfaces/authMiddewareErrors";
import { Socket } from "socket.io";

import { parse } from "cookie";

type SocketNextFunction = (err?: Error) => void;

export class SocketAuthMiddleware {
  private readonly USER_SERVICE_URI =
    process.env.USER_SERVICE_URI ||
    `http://${process.env.USER_SERVICE_HOST || "user"}:${process.env.USER_SERVICE_PORT || 3000}`;

  private readonly AUTH_BASE_URL = "api/internal/auth";

  private getAuthTokenFromHandshake = (socket: Socket): string => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      console.error("Cookie not found.");
      throw new InvalidTokenError();
    }

    const cookies = parse(cookieHeader);

    const authToken = cookies["authToken"];

    if (!authToken) {
      throw new InvalidTokenError();
    }

    return authToken;
  };

  private async verifyToken(
    endpoint: string,
    socket: Socket,
    next: SocketNextFunction,
  ) {
    try {
      const token = this.getAuthTokenFromHandshake(socket);

      console.log(
        "url:",
        `${this.USER_SERVICE_URI}/${this.AUTH_BASE_URL}/${endpoint}`,
      );

      await axios.get(
        `${this.USER_SERVICE_URI}/${this.AUTH_BASE_URL}/${endpoint}`,
        {
          headers: {
            Cookie: `authToken=${token}`,
          },
          withCredentials: true,
        },
      );

      next();
    } catch (error) {
      console.error(error);
      next(new InvalidTokenError());
    }
  }

  authenticate = async (
    socket: Socket,
    next: SocketNextFunction,
  ): Promise<void> => {
    await this.verifyToken("verify", socket, next);
  };

  authenticateAdmin = async (
    socket: Socket,
    next: SocketNextFunction,
  ): Promise<void> => {
    await this.verifyToken("verify-admin", socket, next);
  };
}
