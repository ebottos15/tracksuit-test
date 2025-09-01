// src/controllers/insights.controller.ts
import {
  InsightCreateSchema,
  InsightIdSchema,
} from "../schemas/insights.schema.ts";
import type { InsightsService } from "../services/insights.service.ts";
import type { OakContext } from "../utils/http.ts";
import { readJson } from "../utils/http.ts";
import { respondError } from "../utils/errors.ts";

export function makeInsightsController(service: InsightsService) {
  return {
    /** GET /insights — return all insights. */
    listAll: (ctx: OakContext) => {
      try {
        console.log("list all");
        const rows = service.listAll();
        ctx.response.status = 200;
        ctx.response.body = rows;
      } catch (err) {
        respondError(ctx, err);
      }
    },

    /** GET /insights/:id — return a single insight by id. */
    getById: (ctx: OakContext) => {
      try {
        const id = readIdParam(ctx);
        const row = service.getById(id);
        ctx.response.status = 200;
        ctx.response.body = row;
      } catch (err) {
        respondError(ctx, err);
      }
    },

    /** POST /insights — create a new insight and return it. */
    create: async (ctx: OakContext) => {
      try {
        const raw = await readJson(ctx);
        const input = InsightCreateSchema.parse(raw);
        const created = service.create(input);
        ctx.response.status = 201;
        ctx.response.body = created;
      } catch (err) {
        respondError(ctx, err);
      }
    },

    /** DELETE /insights/:id — delete and return the deleted row. */
    delete: (ctx: OakContext) => {
      try {
        const id = readIdParam(ctx);
        const deleted = service.delete(id);
        ctx.response.status = 200;
        ctx.response.body = deleted;
      } catch (err) {
        respondError(ctx, err);
      }
    },
  };
}

/** Parse and validate the `:id` route param. */
function readIdParam(ctx: OakContext): number {
  const raw = ctx.params?.id;
  const { id } = InsightIdSchema.parse({ id: Number(raw) });
  return id;
}

export type InsightsController = ReturnType<typeof makeInsightsController>;
