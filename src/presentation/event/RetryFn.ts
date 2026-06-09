import { Logger } from "pino";

export type RetryFn = (
  label: string,
  fn: () => Promise<void>,
  logger?: Logger,
) => Promise<void>;
