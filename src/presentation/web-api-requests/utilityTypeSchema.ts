import { z } from "zod";
import { utilityTypeFromString } from "@domain/UtilityType";

export const utilityTypeSchema = z
  .string()
  .nonempty()
  .transform(utilityTypeFromString);
