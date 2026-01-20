import { z } from "zod";
import { ZoneID } from "@domain/ZoneID";

export const zoneIDSchema = z
  .string()
  .nonempty()
  .transform((value) => new ZoneID(value));
