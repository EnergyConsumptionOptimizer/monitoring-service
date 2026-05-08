import { z } from "zod";
import { smartFurnitureHookupIDSchema } from "@presentation/web-api/dto/validation/smartFurnitureHookupIDSchema";

export const endpointSchema = z.string().nonempty();

export const registerSmartFurnitureHookupSchema = z.object({
  smartFurnitureHookupID: smartFurnitureHookupIDSchema,
  endpoint: endpointSchema,
});
