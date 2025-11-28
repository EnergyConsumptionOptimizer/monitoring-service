import { NextFunction, Request, Response } from "express";
import { InvalidSmartFurnitureHookupIDError } from "@domain/errors";
import axios from "axios";
import { ZodError } from "zod";

const msgError = (message: string) => {
  return { error: message };
};

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  void next;

  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "ValidationError",
      message: "Invalid request payload",
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  if (error instanceof InvalidSmartFurnitureHookupIDError) {
    return response.status(400).json(msgError(error.message));
  }

  if (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  ) {
    return response.status(error.response?.status).json(error.response?.data);
  }

  return response.status(500).send();
};
