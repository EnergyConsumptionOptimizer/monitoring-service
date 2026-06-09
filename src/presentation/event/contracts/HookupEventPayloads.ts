import { z } from "zod";

export const smartFurnitureHookupCreatedPayloadSchema = z.object({
  smartFurnitureHookupId: z.string(),
  utilityType: z.string(),
});

export const smartFurnitureHookupDeletedPayloadSchema = z.object({
  smartFurnitureHookupId: z.string(),
});

export const smartFurnitureHookupZoneChangedPayloadSchema = z.object({
  smartFurnitureHookupId: z.string(),
  zoneId: z.string().nullable(),
});

export type SmartFurnitureHookupCreatedPayload = z.infer<
  typeof smartFurnitureHookupCreatedPayloadSchema
>;
export type SmartFurnitureHookupDeletedPayload = z.infer<
  typeof smartFurnitureHookupDeletedPayloadSchema
>;
export type SmartFurnitureHookupZoneChangedPayload = z.infer<
  typeof smartFurnitureHookupZoneChangedPayloadSchema
>;
