import { z } from "zod";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";

export const realTimeConsumptionSchema = z.number().nonnegative();

export const timestampSchema = z.date();

export const householdUserUsernameSchema = z
  .string()
  .nonempty()
  .transform((value) => new HouseholdUserUsername(value));

export const smartFurnitureHookupIDSchema = z
  .string()
  .nonempty()
  .transform((value) => new SmartFurnitureHookupID(value));

export const createMeasurementSchema = z.object({
  realTimeConsumption: realTimeConsumptionSchema,
  timestamp: timestampSchema,
  householdUserUsername: householdUserUsernameSchema.optional(),
});
