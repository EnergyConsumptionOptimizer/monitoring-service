import { z } from "zod";
import { HouseholdUserUsername } from "@domain/HouseholdUserUsername";

export const usernameSchema = z
  .string()
  .nonempty()
  .transform((value) => new HouseholdUserUsername(value));
