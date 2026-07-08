import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const PROD_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data:; connect-src 'none'; font-src 'self'; object-src 'none'; " +
  "base-uri 'none'; form-action 'none'";

// Inject the strict, offline CSP into the built HTML only. In dev we skip it so
// Vite's HMR websocket (connect-src) keeps working.
function injectProdCsp(): Plugin {
  return {
    name: "inject-prod-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "</title>",
        `</title>\n    <meta http-equiv="Content-Security-Policy" content="${PROD_CSP}" />`,
      );
    },
  };
}

// Static SPA. Base is relative so the built `dist/` works when opened from any
// path (static host subfolder, or even file:// after a tweak).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), injectProdCsp()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
  },
});
