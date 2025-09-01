// server/tests/unit/insights.controller.validation.test.ts
import { expect } from "@std/expect";
import { drain, withRunningApp } from "../_helpers/http.ts";
import { createTestApp } from "../_helpers/test-utils.ts";

Deno.test("POST /api/insights validates body", async () => {
  const app = await createTestApp();

  await withRunningApp(app, async (base) => {
    const cases = [
      { brand: -1, text: "" }, // brand >= 0, text non-empty
      { brand: 1 }, // missing text
      { text: "x" }, // missing brand
    ];

    for (const body of cases) {
      const res = await fetch(`${base}/api/insights`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      expect(res.status).toBe(400);
      await drain(res);
    }
  });
});
