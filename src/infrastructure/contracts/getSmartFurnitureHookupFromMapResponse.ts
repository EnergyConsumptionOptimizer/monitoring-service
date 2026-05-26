import { z } from "zod";

export const getSmartFurnitureHookupResponse = z.object({
  zoneID: z.string(),
});
