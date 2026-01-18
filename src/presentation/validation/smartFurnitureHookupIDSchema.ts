import { z } from "zod";
import { SmartFurnitureHookupID } from "@domain/SmartFurnitureHookupID";

export const smartFurnitureHookupIDSchema = z
  .string()
  .nonempty()
  .transform((value) => new SmartFurnitureHookupID(value));
