// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import { transformerMarco } from "./src/lib/codigo.mjs";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // URL pública: la usan el sitemap, el RSS, las URLs canónicas y las imágenes de Open Graph.
  site: "https://niltontaco.pages.dev",
  // Todas las URLs terminan en "/" (así las sirve Cloudflare Pages): una sola URL canónica por página.
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/og/") })],
  markdown: {
    shikiConfig: {
      // Dos temas: el CSS elige uno según el tema del sitio (ver styles/global.css).
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
      transformers: [transformerNotationHighlight(), transformerNotationDiff(), transformerMarco()],
    },
  },
});
