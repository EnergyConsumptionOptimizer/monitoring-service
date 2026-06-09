import { z } from "zod";

export const getSmartFurnitureHookupsZoneResponse = z.object({
  smartFurnitureHookups: z.array(
    z.object({
      id: z.string().nonempty(),
      zoneId: z.string(),
    }),
  ),
});
