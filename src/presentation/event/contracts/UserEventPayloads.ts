import { z } from "zod";

export const userDeletedPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
});

export const userCreatedPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: z.string(),
});
