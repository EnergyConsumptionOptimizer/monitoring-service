import { z } from "zod";
import { smartFurnitureHookupIDSchema } from "@presentation/web-api-requests/MeasurementSchemas";

export const endpointSchema = z.string().nonempty();

export const registerSmartFurnitureHookupSchema = z.object({
  smartFurnitureHookupID: smartFurnitureHookupIDSchema,
  endpoint: endpointSchema,
});
