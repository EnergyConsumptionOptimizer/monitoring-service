import { type NextFunction, type Request, type Response } from "express";
import axios from "axios";
import { InvalidTokenError } from "@interfaces/authMiddewareErrors";

export class AuthMiddleware {
  private readonly USER_SERVICE_URI =
    process.env.USER_SERVICE_URI ||
    `http://${process.env.USER_SERVICE_HOST || "user"}:${process.env.USER_SERVICE_PORT || 3000}`;

  private readonly AUTH_BASE_URL = "api/internal/auth";

  private getAuthTokenFromCookies = (request: Request) => {
    const token = request.cookies?.["authToken"];
    if (!token) {
      throw new InvalidTokenError();
    }

    return token;
  };

  private async verifyToken(
    endpoint: string,
    request: Request,
    next: NextFunction,
  ) {
    try {
      const token = this.getAuthTokenFromCookies(request);

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
      next(error);
    }
  }

  authenticate = async (
    request: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.verifyToken("verify", request, next);
  };

  authenticateAdmin = async (
    request: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.verifyToken("verify-admin", request, next);
  };
}
