import { z } from "zod";

export const endpointSchema = z.string().nonempty();

export const smartFurnitureHookupIDSchema = z.string().nonempty();

export const registerSmartFurnitureHookupSchema = z.object({
  smartFurnitureHookupID: smartFurnitureHookupIDSchema,
  endpoint: endpointSchema,
});
