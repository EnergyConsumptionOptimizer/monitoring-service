import { z } from "zod";

export const utilityTypeSchema = z.string().nonempty();
