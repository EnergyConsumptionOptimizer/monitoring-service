import { NextFunction, Request, Response } from "express";
import {
  endpointSchema,
  registerSmartFurnitureHookupSchema,
} from "@presentation/web-api-requests/ManageSmartFurnitureHookupConnectionSchemas";
import axios from "axios";

export class ManageSmartFurnitureHookupConnectionController {
  private readonly MONITORING_SERVICE_HOST = `${process.env.MONITORING_SERVICE_HOST || "monitoring"}`;
  private readonly EXTERNAL_PORT = process.env.EXTERNAL_PORT || 3003;

  registerSmartFurnitureHookup = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const { smartFurnitureHookupID, endpoint } =
      registerSmartFurnitureHookupSchema.parse(request.body);

    try {
      await axios.patch(endpoint, {
        endpoint_url: `http://${this.MONITORING_SERVICE_HOST}:${this.EXTERNAL_PORT}/api/internal/measurements?smart_furniture_hookup=${smartFurnitureHookupID}`,
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
