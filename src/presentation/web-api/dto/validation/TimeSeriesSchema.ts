import { z } from "zod";
import { TimeString } from "@application/utils/TimeString";

function toTimeString(value?: string) {
  if (!value) return undefined;

  return value as TimeString;
}

export const fromSchema = z.string().optional().transform(toTimeString);
export const toSchema = z.string().optional().transform(toTimeString);
export const granularitySchema = z.string().optional().transform(toTimeString);
