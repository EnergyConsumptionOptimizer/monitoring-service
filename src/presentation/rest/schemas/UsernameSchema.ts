import { z } from "zod";

export const usernameSchema = z.string().nonempty();

export const removeHouseholdUserTagSchema = z.object({
  params: z.object({
    username: usernameSchema,
  }),
});
