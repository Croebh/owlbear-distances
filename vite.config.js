import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "show-distances": resolve(__dirname, "show-distances.html"),
      },
    },
  },
});