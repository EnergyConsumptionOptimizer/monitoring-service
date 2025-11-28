import { type NextFunction, type Request, type Response } from "express";
import axios from "axios";
import { InvalidTokenError } from "@interfaces/web-api/middlewares/authMiddewareErrors";

export class AuthMiddleware {
  private checkToken = (request: Request) => {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new InvalidTokenError();
    }

    return authHeader;
  };

  authenticate = async (
    request: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = this.checkToken(request);

      await axios.get(process.env.USER_SERVICE_URI + "/auth/verify", {
        headers: { Authorization: token },
      });

      next();
    } catch (error) {
      next(error);
    }
  };

  authenticateAdmin = async (
    request: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = this.checkToken(request);

      await axios.get(process.env.USER_SERVICE_URI + "/auth/verify-admin", {
        headers: { Authorization: token },
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}
