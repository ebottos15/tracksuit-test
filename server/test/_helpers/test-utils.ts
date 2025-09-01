// server/tests/_helpers/test-utils.ts
import { Database } from "@db/sqlite";
import { join } from "jsr:@std/path/join";
import { Application, Router } from "@oak/oak";
import { InsightsRepository } from "../../repositories/insights.repo.ts";
import { InsightsService } from "../../services/insights.service.ts";
import { makeInsightsController } from "../../controllers/insights.controller.ts";
import { registerInsightsRoutes } from "../../routes/insights.routes.ts";

/** Create a fresh in-memory SQLite DB and run migrations. */
export async function createMemoryDb(): Promise<Database> {
  // Use an actual in-memory DB for isolation & speed.
  const db = new Database(":memory:");
  const migration1 = await Deno.readTextFile(
    join(Deno.cwd(), "db", "migrations", "001_init.sql"),
  );
  db.exec(migration1);
  return db;
}

/** Build the app with an in-memory DB (for E2E tests). */
export async function createTestApp(): Promise<Application> {
  const db = await createMemoryDb();

  const repo = new InsightsRepository();
  await repo.init(); // loads .sql queries into memory

  const service = new InsightsService(repo, db);
  const controller = makeInsightsController(service);

  const router = new Router();

  // handy for E2E & liveness
  router.get("/_health", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = { ok: true };
  });

  registerInsightsRoutes(router, controller);

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}
