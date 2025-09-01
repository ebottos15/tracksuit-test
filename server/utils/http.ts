import { ZodError } from "zod";
import type { RouterContext } from "@oak/oak";

/** Narrow request/response shapes we actually use*/
export type JsonBodyReader = { value: Promise<unknown> };

/** Access the HTTP request body as JSON. */
export interface OakRequest {
  body: (opts?: { type: "json" }) => JsonBodyReader;
}
export interface OakResponse {
  status: number;
  body?: unknown;
}

/** Simplified context type passed into controllers. */
export interface OakContext {
  params?: Record<string, string>;
  request: OakRequest;
  response: OakResponse;
}

/** Helper to read and parse the request body as JSON. Controllers use this instead of dealing with Oak directly. */
export async function readJson<T = unknown>(ctx: OakContext): Promise<T> {
  const reader = ctx.request.body({ type: "json" });
  return (await reader.value) as T;
}

/** Type guard for identifying Zod validation errors. */
export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}

/** Convert Oak's RouterContext into our minimal OakContext type. */
export function asOakContext<P extends string>(
  ctx: RouterContext<P>,
): OakContext {
  const params = ctx.params as Record<string, string>;
  const body = (): JsonBodyReader => {
    const webBody = ctx.request.body as unknown as Body;
    return { value: webBody.json() as Promise<unknown> };
  };

  return {
    params,
    request: { body },
    response: ctx.response,
  };
}

/** Wrap a controller handler so it can be registered directly as an Oak router middleware.  */
export const wrap = <P extends string>(
  handler: (ctx: OakContext) => void | Promise<void>,
) =>
(ctx: RouterContext<P>): void | Promise<void> => handler(asOakContext(ctx));
