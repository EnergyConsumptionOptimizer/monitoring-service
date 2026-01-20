import { z } from "zod";
import { smartFurnitureHookupIDSchema } from "@presentation/validation/smartFurnitureHookupIDSchema";

export const endpointSchema = z.string().nonempty();

export const registerSmartFurnitureHookupSchema = z.object({
  smartFurnitureHookupID: smartFurnitureHookupIDSchema,
  endpoint: endpointSchema,
});
