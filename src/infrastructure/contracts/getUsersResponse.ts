import { z } from "zod";

export const getUsersResponse = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
  }),
);
