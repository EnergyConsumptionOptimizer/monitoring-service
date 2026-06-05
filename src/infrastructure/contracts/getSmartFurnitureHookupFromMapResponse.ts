import { z } from "zod";

export const getSmartFurnitureHookupResponse = z.object({
  zoneId: z.string(),
});
