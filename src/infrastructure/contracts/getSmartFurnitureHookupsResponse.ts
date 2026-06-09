import { z } from "zod";

export const getSmartFurnitureHookupsResponse = z.object({
  smartFurnitureHookups: z.array(
    z.object({
      id: z.string(),
      utilityType: z.string(),
    }),
  ),
});
