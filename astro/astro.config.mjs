import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://toolbite.org",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file"
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
