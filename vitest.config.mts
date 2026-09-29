import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || "development", process.cwd(), "");
  // Asignar variables de .env.local a process.env para pruebas de integración
  Object.assign(process.env, env);

  return {
    test: {
      environment: "node",
      testTimeout: 20000,
      exclude: ["**/node_modules/**", "**/e2e/**", "**/tests/**"],
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
  };
});
