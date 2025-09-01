import { z } from "zod";

/**
 * Schema for creating a new Insight.
 * `brand`: must be a non-negative integer
 * `text`: must be a non-empty string
 */
export const InsightCreateSchema = z.object({
  brand: z.number().int().nonnegative(),
  text: z.string().min(1),
});

/**
 * Schema for validating an Insight identifier
 * `id`: must be a positive integer
 */
export const InsightIdSchema = z.object({
  id: z.number().int().positive(),
});
