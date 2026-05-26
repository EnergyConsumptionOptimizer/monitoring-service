import { z } from "zod";

export const getUserByUsernameResponse = z.object({
  username: z.string(),
});
