import { TimeString } from "@domain/TimeString";
import z from "zod";
import { utilityTypeSchema } from "@presentation/rest/schemas/utilityTypeSchema";
import { usernameSchema } from "@presentation/rest/schemas/UsernameSchema";
import { zoneIDSchema } from "@presentation/rest/schemas/ZoneIDSchema";

function toTimeString(value?: string) {
  if (!value) return undefined;

  return value as TimeString;
}

export const fromSchema = z.string().optional().transform(toTimeString);
export const toSchema = z.string().optional().transform(toTimeString);
export const granularitySchema = z.string().optional().transform(toTimeString);

export const getUtilityConsumptionsSchema = z.object({
  params: z.object({
    utilityType: utilityTypeSchema,
  }),
  query: z
    .object({
      from: fromSchema,
      to: toSchema,
      granularity: granularitySchema,
      username: usernameSchema.optional(),
      zoneID: zoneIDSchema.optional(),
    })
    .optional(),
});
