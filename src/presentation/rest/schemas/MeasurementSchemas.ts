import { z } from "zod";
import { usernameSchema } from "@presentation/rest/schemas/UsernameSchema";
import { smartFurnitureHookupIDSchema } from "@presentation/rest/schemas/smartFurnitureHookupIDSchema";

const realTimeConsumptionSchema = z.number().nonnegative();

const timestampSchema = z.string().transform((value) => new Date(value));

export const createMeasurementSchema = z.object({
  body: z.object({
    realTimeConsumption: realTimeConsumptionSchema,
    timestamp: timestampSchema,
    username: usernameSchema.nullish(),
  }),
  query: z.object({
    smart_furniture_hookup_id: smartFurnitureHookupIDSchema,
  }),
});
