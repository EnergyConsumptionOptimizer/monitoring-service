import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export const healthCheck = (_request: Request, response: Response): void => {
  response.status(StatusCodes.OK).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
