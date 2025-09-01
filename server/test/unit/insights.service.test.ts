// server/tests/unit/insights.service.test.ts
import { expect } from "@std/expect";
import { assertThrows } from "@std/assert";
import { createMemoryDb } from "../_helpers/test-utils.ts";
import { InsightsRepository } from "../../repositories/insights.repo.ts";
import { InsightsService } from "../../services/insights.service.ts";
import { NotFoundError } from "../../utils/errors.ts";

Deno.test("InsightsService happy path", async () => {
  const db = await createMemoryDb();
  const repo = new InsightsRepository();
  await repo.init();

  const service = new InsightsService(repo, db);

  const created = service.create({ brand: 7, text: "svc" });
  expect(created.id).toBeGreaterThan(0);

  const list = service.listAll();
  expect(list.length).toBe(1);
  expect(list[0].text).toBe("svc");

  const byId = service.getById(created.id);
  expect(byId?.id).toBe(created.id);
});

Deno.test("InsightsService delete enforces existence", async () => {
  const db = await createMemoryDb();
  const repo = new InsightsRepository();
  await repo.init();
  const service = new InsightsService(repo, db);

  const a = service.create({ brand: 1, text: "x" });

  const deleted = service.delete(a.id);
  expect(deleted.id).toBe(a.id);

  assertThrows(() => service.delete(a.id), NotFoundError);
});
