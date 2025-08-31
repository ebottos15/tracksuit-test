import deno from "@deno/vite-plugin";
import { Port } from "../lib/utils/index.ts";
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import process from "node:process";

const env = {
  clientPort: Port.parse(Deno.env.get("CLIENT_PORT")),
  serverBaseUrl: String(Deno.env.get("SERVER_BASE_URL")),
  serverPort: Port.parse(Deno.env.get("SERVER_PORT")),
};

export default defineConfig({
  root: "./src",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [react(), deno()],
  server: {
    port: env.clientPort,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
    },
    proxy: {
      "/api": {
        target: `${env.serverBaseUrl}:${env.serverPort}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
