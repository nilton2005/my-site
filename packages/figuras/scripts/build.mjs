// Genera un fragmento HTML por figura en dist/. Astro los importa con `?raw`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dondeGuardaGit from "../src/donde-guarda-git.mjs";
import * as reparto from "../src/reparto.mjs";
import { TEMA_MOKYA } from "../src/tema-mokya.mjs";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const FIGURAS = { "donde-guarda-git": dondeGuardaGit, reparto };

mkdirSync(DIST, { recursive: true });
for (const [name, figura] of Object.entries(FIGURAS)) {
  for (const idioma of ["es", "en"]) {
    const archivo = `${name}.${idioma}.html`;
    // El primer </style> cierra el CSS del kit; el tema de marca va justo después para ganar por orden.
    const html = figura.render(idioma).replace("</style>", `${TEMA_MOKYA}</style>`);
    writeFileSync(join(DIST, archivo), html);
    console.log(`figuras: ${archivo} · ${(html.length / 1024).toFixed(0)} KB${figura.HASH ? ` · ${figura.HASH}` : ""}`);
  }
}
