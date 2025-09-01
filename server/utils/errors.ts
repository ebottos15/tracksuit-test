// src/utils/errors.ts
import type { OakContext } from "./http.ts";
import { isZodError } from "./http.ts";

/** Base class for domain/application errors with an HTTP status hint. */
export class AppError extends Error {
  constructor(message: string, public readonly status: number = 400) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** Minimal controller-side error responder. */
export function respondError(ctx: OakContext, err: unknown) {
  if (isZodError(err)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request", issues: err.issues };
    return;
  }
  if (err instanceof AppError) {
    ctx.response.status = err.status;
    ctx.response.body = { error: err.message };
    return;
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  ctx.response.status = 500;
  ctx.response.body = { error: message };
}
