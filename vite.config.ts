import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the built site work at any URL,
// so GitHub Pages works no matter what you name the repo.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
