import type { Request } from "express";

export function mockRequest(overrides?: Partial<Request>): Request {
  return {
    params: {},
    body: {},
    query: {},
    cookies: {},
    secure: false,
    ...overrides,
  } as Request;
}
