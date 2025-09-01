// server/tests/unit/insights.repo.test.ts
import { expect } from "@std/expect";
import { Database } from "@db/sqlite";
import { join } from "jsr:@std/path/join";
import { InsightsRepository } from "../../repositories/insights.repo.ts";

function iso(x: string) {
  return new Date(x).toISOString();
}

Deno.test("InsightsRepository CRUD with :memory: DB", async () => {
  const db = new Database(":memory:");
  const migration = await Deno.readTextFile(
    join("server", "db", "migrations", "001_init.sql"),
  );
  db.exec(migration);

  const repo = new InsightsRepository();
  await repo.init();

  const a = repo.insert(db, {
    brand: 1,
    createdAt: iso("2024-01-01"),
    text: "hello",
  });
  const b = repo.insert(db, {
    brand: 2,
    createdAt: iso("2024-02-02"),
    text: "world",
  });

  expect(a.id).toBeGreaterThan(0);
  expect(b.id).toBeGreaterThan(a.id);

  const gotA = repo.selectById(db, a.id);
  expect(gotA?.text).toBe("hello");

  const all = repo.selectAll(db);
  expect(all.map((r) => r.id)).toEqual([b.id, a.id]);

  repo.deleteById(db, a.id);
  const afterDelete = repo.selectAll(db);
  expect(afterDelete.map((r) => r.id)).toEqual([b.id]);

  const missing = repo.selectById(db, 99999);
  expect(missing).toBeNull();

  db.close();
});
