import { z } from "zod";

export const zoneIDSchema = z.string().nonempty();

export const removeZoneIDTagSchema = z.object({
  params: z.object({
    zoneID: zoneIDSchema,
  }),
});
