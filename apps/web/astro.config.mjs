// @ts-check
import { rename, rm } from "node:fs/promises";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import { transformerMarco } from "./src/lib/codigo.mjs";

// Cloudflare Pages busca un 404.html en cada carpeta, pero Astro genera en/404/index.html.
const error404EnIngles = {
  name: "niltontaco:404-en",
  hooks: {
    /** @param {{ dir: URL }} opciones */
    "astro:build:done": async ({ dir }) => {
      await rename(new URL("en/404/index.html", dir), new URL("en/404.html", dir));
      await rm(new URL("en/404/", dir), { recursive: true });
    },
  },
};

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // URL pública: la usan el sitemap, el RSS, las URLs canónicas y las imágenes de Open Graph.
  site: "https://niltontaco.pages.dev",
  // Todas las URLs terminan en "/" (así las sirve Cloudflare Pages): una sola URL canónica por página.
  trailingSlash: "always",
  build: { format: "directory" },
  // Español en la raíz, inglés en /en/. Astro.currentLocale sale de aquí.
  i18n: { defaultLocale: "es", locales: ["es", "en"], routing: { prefixDefaultLocale: false } },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/og/") && !page.includes("/404") }), error404EnIngles],
  markdown: {
    shikiConfig: {
      // Dos temas: el CSS elige uno según el tema del sitio (ver styles/global.css).
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
      transformers: [transformerNotationHighlight(), transformerNotationDiff(), transformerMarco()],
    },
  },
});
