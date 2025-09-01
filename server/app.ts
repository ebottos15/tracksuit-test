// Bootstraps the HTTP server, database, repositories, services, and routes.
import { Application, Router } from "@oak/oak";
import { join } from "jsr:@std/path/join";
//import { fromFileUrl } from "jsr:@std/path/from-file-url";
import { openDb } from "./db/client.ts";
import { InsightsRepository } from "./repositories/insights.repo.ts";
import { InsightsService } from "./services/insights.service.ts";
import { makeInsightsController } from "./controllers/insights.controller.ts";
import { registerInsightsRoutes } from "./routes/insights.routes.ts";

/**
 * Run all SQL migration files in src/db/migrations in filename order.
 * This keeps schema concerns out of application code.
 */
async function runMigrations(databasePath: string): Promise<void> {
  const db = openDb(databasePath);
  try {
    const migrationsDir = join(projectRoot(), "db", "migrations");
    const files: string[] = [];
    for await (const entry of Deno.readDir(migrationsDir)) {
      if (entry.isFile && entry.name.toLowerCase().endsWith(".sql")) {
        files.push(join(migrationsDir, entry.name));
      }
    }
    files.sort();
    db.exec("BEGIN");
    try {
      for (const file of files) {
        const sql = await Deno.readTextFile(file);
        db.exec(sql);
      }
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  } finally {
    db.close();
  }
}

/** Resolve the repository root folder on disk. */
function projectRoot(): string {
  return Deno.cwd();
}

async function main(): Promise<void> {
  // Configuration
  const PORT = Number(Deno.env.get("SERVER_PORT") ?? 8000);
  const DB_PATH = Deno.env.get("DB_PATH") ??
    join(projectRoot(), "tmp", "db.sqlite3");

  // 1) Ensure schema is up-to-date
  await runMigrations(DB_PATH);

  // 2) Open shared DB connection for the app
  const db = openDb(DB_PATH);

  // 3) Init repositories (load SQL files, etc.)
  const insightsRepo = new InsightsRepository();
  await insightsRepo.init();

  // 4) Construct services
  const insightsSvc = new InsightsService(insightsRepo, db);

  // 5) Construct controllers
  const insightsCtrl = makeInsightsController(insightsSvc);

  // 6) Register routes
  const router = new Router();
  // Health check: always OK
  router.get("/_health", (ctx) => {
    ctx.response.status = 200;
    ctx.response.type = "application/json";
    ctx.response.body = { status: "ok" };
  });
  registerInsightsRoutes(router, insightsCtrl);

  // 7) Start HTTP server
  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());

  // Graceful shutdown on Ctrl+C / SIGTERM
  const abort = new AbortController();
  const { signal } = abort;

  const serverPromise = app.listen({ port: PORT, signal });
  console.log(`Server listening on http://localhost:${PORT}`);

  // Close DB on exit
  const close = () => {
    try {
      db.close();
    } catch {
      // ignore
    }
  };

  // Wire signals
  const onShutdown = () => {
    console.log("Shutting down…");
    abort.abort();
    close();
  };
  addEventListener("SIGINT", onShutdown);
  addEventListener("SIGTERM", onShutdown);

  try {
    await serverPromise;
  } finally {
    removeEventListener("SIGINT", onShutdown);
    removeEventListener("SIGTERM", onShutdown);
    close();
  }
}

// Run if executed directly (not imported)
if (import.meta.main) {
  await main();
}
