// deno-lint-ignore-file no-explicit-any
import * as oak from "@oak/oak";
import { db } from "./db.ts";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insights.ts";
import deleteInsight from "./operations/delete-insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

console.log("Initialising server");

const router = new oak.Router({ prefix: "/api" });

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.get("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const result = lookupInsight({ db, id: params.id });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Body required" };
    return;
  }
  let payload: unknown;
  try {
    payload = await ctx.request.body.json();
  } catch {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid JSON" };
    return;
  }
  // validate the payload, check if brand is a positive number and text is not empty
  const p = payload as { text?: unknown; brand?: unknown };
  const brand = Number(p.brand);
  const text = String(p.text);
  if (
    !p || typeof text !== "string" || text.length === 0 ||
    Number.isNaN(brand) || brand < 0
  ) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: "brand (number) and text (non-empty) are required",
    };
    return;
  }
  const now = new Date();
  const item = {
    brand,
    text,
    createdAt: now.toISOString(),
  };
  const row = createInsight({ db, item });
  ctx.response.body = row;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const id = Number(ctx.params?.id);
  if (!Number.isInteger(id) || id <= 0) {
    ctx.response.status = 400;
    ctx.response.body = { error: "id must be a positive integer" };
    return;
  }
  const deleted = deleteInsight({ db, id });
  if (!deleted) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = deleted;
});

const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
