import { z } from "zod";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";
import { usernameSchema } from "@presentation/validation/usernameSchema";

export const realTimeConsumptionSchema = z.number().nonnegative();

export const timestampSchema = z.string().transform((value) => new Date(value));

export const smartFurnitureHookupIDSchema = z
  .string()
  .nonempty()
  .transform((value) => new SmartFurnitureHookupID(value));

export const createMeasurementSchema = z.object({
  realTimeConsumption: realTimeConsumptionSchema,
  timestamp: timestampSchema,
  username: usernameSchema.optional(),
});
