import { defineConfig } from "vitest/config";
import path from "path";

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: "@/lib/auth", replacement: r("src/lib/__mocks__/auth.ts") },
      { find: "@/lib/db", replacement: r("src/lib/__mocks__/db.ts") },
      { find: "@/lib/email", replacement: r("src/lib/__mocks__/email.ts") },
      { find: "next/navigation", replacement: r("src/lib/__mocks__/next-navigation.ts") },
      { find: "next/server", replacement: r("src/lib/__mocks__/next-server.ts") },
      { find: "@", replacement: r("src") },
    ],
  },
});
