import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { ZodError } from "zod";

import {
  InvalidSmartFurnitureHookupIDError,
  InvalidUtilityTypeError,
} from "@domain/errors";

interface ErrorConfig {
  status: number;
  code: string;
  field?: string;
}

const ERROR_MAP = new Map<string, ErrorConfig>([
  [
    InvalidSmartFurnitureHookupIDError.name,
    { status: 404, code: "BAD_REQUEST" },
  ],
  [
    InvalidUtilityTypeError.name,
    { status: 404, code: "VALIDATION_ERROR", field: "utilityType" },
  ],
]);

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  void next;

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};

    error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });

    return response.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      errors: fieldErrors,
    });
  }

  const config = ERROR_MAP.get(error.name);

  if (config) {
    const errorsPayload = config.field ? { [config.field]: error.message } : {};

    return response.status(config.status).json({
      code: config.code,
      message: config.field ? "Validation failed" : error.message,
      errors: errorsPayload,
    });
  }

  if (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  ) {
    return response.status(error.response.status).json(error.response.data);
  }

  console.error("Unhandled error:", error);

  return response.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Internal Server Error",
    errors: {},
  });
};
