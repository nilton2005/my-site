// Genera un fragmento HTML por figura en dist/. Astro los importa con `?raw`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dondeGuardaGit from "../src/donde-guarda-git.mjs";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const FIGURAS = { "donde-guarda-git": dondeGuardaGit };

mkdirSync(DIST, { recursive: true });
for (const [name, figura] of Object.entries(FIGURAS)) {
  for (const idioma of ["es", "en"]) {
    const archivo = `${name}.${idioma}.html`;
    const html = figura.render(idioma);
    writeFileSync(join(DIST, archivo), html);
    console.log(`figuras: ${archivo} · ${(html.length / 1024).toFixed(0)} KB${figura.HASH ? ` · ${figura.HASH}` : ""}`);
  }
}
