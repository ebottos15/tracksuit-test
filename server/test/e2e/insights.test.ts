// server/test/e2e/insights.test.ts
import { expect } from "@std/expect";
import { drain, withRunningApp } from "../_helpers/http.ts";
import { createTestApp } from "../_helpers/test-utils.ts";
import type { InsightRow } from "../../types/insights.types.ts";

Deno.test("GET /_health", async () => {
  const app = await createTestApp();
  await withRunningApp(app, async (base) => {
    const res = await fetch(`${base}/_health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

Deno.test("CRUD /api/insights", async () => {
  const app = await createTestApp();
  await withRunningApp(app, async (base) => {
    // list empty
    {
      const res = await fetch(`${base}/api/insights`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    }

    // create
    let createdId = 0;
    {
      const res = await fetch(`${base}/api/insights`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brand: 3, text: "hello e2e" }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      createdId = body.id;
    }

    // list has created
    {
      const res = await fetch(`${base}/api/insights`);
      expect(res.status).toBe(200);
      const items: InsightRow[] = await res.json();
      expect(items.some((r) => r.id === createdId)).toBe(true);
    }

    // get by id
    {
      const res = await fetch(`${base}/api/insights/${createdId}`);
      expect(res.status).toBe(200);
      await drain(res);
    }

    // delete by id
    {
      const res = await fetch(`${base}/api/insights/${createdId}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(200);
      await drain(res);
    }

    // 404 after delete
    {
      const res1 = await fetch(`${base}/api/insights/${createdId}`);
      const res2 = await fetch(`${base}/api/insights/${createdId}`, {
        method: "DELETE",
      });
      expect(res1.status).toBe(404);
      expect(res2.status).toBe(404);
      await Promise.all([drain(res1), drain(res2)]);
    }
  });
});
