import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "~": fileURLToPath(new URL("./app/frontend", import.meta.url)) },
  },
  esbuild: { loader: "jsx", include: /\.js$/, exclude: [] },
  test: {
    include: ["app/frontend/**/*.test.js"],
    environment: "node",
  },
});
