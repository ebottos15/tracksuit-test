import type { Router } from "@oak/oak";
import type { InsightsController } from "../controllers/insights.controller.ts";
import { wrap } from "../utils/http.ts";

export function registerInsightsRoutes(
  router: Router,
  controller: InsightsController,
): void {
  router.get("/api/insights/:id", wrap(controller.getById));
  router.post("/api/insights", wrap(controller.create));
  router.delete("/api/insights/:id", wrap(controller.delete));
  router.get("/api/insights", wrap(controller.listAll));
}
