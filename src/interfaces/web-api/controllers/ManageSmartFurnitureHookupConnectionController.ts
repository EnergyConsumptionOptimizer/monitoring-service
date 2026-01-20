import { NextFunction, Request, Response } from "express";
import {
  endpointSchema,
  registerSmartFurnitureHookupSchema,
} from "@presentation/web-api-requests/ManageSmartFurnitureHookupConnectionSchemas";
import axios from "axios";

export class ManageSmartFurnitureHookupConnectionController {
  private readonly EXTERNAL_API_HOST =
    process.env.EXTERNAL_API_HOST || "localhost";
  private readonly EXTERNAL_API_PORT = process.env.EXTERNAL_API_PORT || 80;
  private readonly HOST = process.env.NAME || "monitoring";

  private convertToDockerHost(originalUrl: string): string {
    try {
      const url = new URL(originalUrl);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        url.hostname = "host.docker.internal";
      }

      return url.toString();
    } catch (error) {
      console.error(error);
      console.error("Invalid URL received: ", originalUrl);
      return originalUrl;
    }
  }

  registerSmartFurnitureHookup = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const { smartFurnitureHookupID, endpoint } =
      registerSmartFurnitureHookupSchema.parse(request.body);
    const dockerizedEndpoint = this.convertToDockerHost(endpoint);
    try {
      await axios.patch(dockerizedEndpoint, {
        endpoint_url: `http://${this.EXTERNAL_API_HOST}:${this.EXTERNAL_API_PORT}/${this.HOST}/api/internal/measurements?smart_furniture_hookup_id=${smartFurnitureHookupID.value()}`,
      });
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  };

  disconnectSmartFurnitureHookup = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const endpoint = endpointSchema.parse(request.body.endpoint);

    try {
      await axios.patch(endpoint, {
        endpoint_url: ``,
      });
      response.status(200).send();
    } catch (error) {
      next(error);
    }
  };
}
