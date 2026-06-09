import { z } from "zod";

export const zoneDeletedPayloadSchema = z.object({
  zoneId: z.string(),
});

export type ZoneDeletedPayload = z.infer<typeof zoneDeletedPayloadSchema>;
