import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  adapter: node({
    mode: "standalone"
  }),
  server: {
    host: true
  },
  vite: {
    server: {
      watch: {
        ignored: ["**/dist/**"]
      }
    }
  }
});
