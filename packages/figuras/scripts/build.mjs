// Genera un fragmento HTML por figura en dist/. Astro los importa con `?raw`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dondeGuardaGit from "../src/donde-guarda-git.mjs";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const FIGURAS = { "donde-guarda-git": dondeGuardaGit };

mkdirSync(DIST, { recursive: true });
for (const [name, figura] of Object.entries(FIGURAS)) {
  const html = figura.render();
  writeFileSync(join(DIST, `${name}.html`), html);
  console.log(`figuras: ${name}.html · ${(html.length / 1024).toFixed(0)} KB${figura.HASH ? ` · ${figura.HASH}` : ""}`);
}
