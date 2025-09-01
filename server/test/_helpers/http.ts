// server/test/_helpers/http.ts
import type { Application } from "@oak/oak";

async function getFreePort(): Promise<number> {
  const l = await Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const { port } = l.addr as Deno.NetAddr;
  l.close();
  return port;
}

async function waitForPort(hostname: string, port: number, timeoutMs = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const c = await Deno.connect({ hostname, port });
      c.close();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 20));
    }
  }
  throw new Error(
    `Server did not start on ${hostname}:${port} within ${timeoutMs}ms`,
  );
}

export async function withRunningApp<T>(
  app: Application,
  fn: (baseUrl: string) => Promise<T>,
): Promise<T> {
  const hostname = "127.0.0.1";
  const port = await getFreePort();
  const ac = new AbortController();

  // 👇 Cast once so TS accepts a 1-arg handler
  const oneArgHandler = (req: Request) =>
    (app.fetch as unknown as (r: Request) => Promise<Response>)(req);

  const server = Deno.serve(
    { hostname, port, signal: ac.signal },
    oneArgHandler,
  );

  await waitForPort(hostname, port);
  const baseUrl = `http://${hostname}:${port}`;

  try {
    return await fn(baseUrl);
  } finally {
    ac.abort();
    await server.finished.catch(() => {});
  }
}

export async function drain(res: Response) {
  if (!res.body || res.bodyUsed) return;
  try {
    // Consume quickly without string/JSON decoding cost.
    await res.arrayBuffer();
  } catch {
    // If reading fails (e.g., already aborted), ensure the stream is closed.
    await res.body?.cancel().catch(() => {});
  }
}
