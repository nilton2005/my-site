// Artículos «en avance» (frontmatter `avance: true`): se publica solo el comienzo.
//
// Difuminar el resto con CSS no sirve: quien abre la consola del navegador lo quita y lee todo. Por eso el corte
// se hace AL COMPILAR, sobre el texto del .mdx, antes de que ningún procesador lo vea: se conserva todo hasta la
// línea `<VistaPrevia />` y se descarta lo demás. Lo que se publica no contiene ni el texto, ni los títulos, ni el
// código del resto del artículo (ni en el HTML ni en el JavaScript).
//
// Dos piezas:
//  · viteAvance():    plugin de Vite que hace el corte.
//  · guardiaAvance(): integración de Astro que, al terminar el build, comprueba que el corte funcionó. Si algún
//                     título de la parte cortada aparece en lo publicado, el build FALLA en lugar de publicar.
//
// Cuando el artículo esté listo: quita `avance: true` del frontmatter (la marca <VistaPrevia /> deja de hacer nada).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MARCA = /^<VistaPrevia\s*\/>[ \t]*\r?$/m;

/** ¿Este .mdx es un avance? Mira `avance: true` en su frontmatter. */
const esAvance = (texto) => {
  const cabecera = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!cabecera && /^avance:\s*true\s*\r?$/m.test(cabecera[1]);
};

/** Texto sin mayúsculas, signos ni espacios: así «isn't» y «isn&#39;t» se comparan igual. */
const normalizar = (texto) => texto.toLowerCase().replace(/&#?\w+;/g, "").replace(/[^\p{L}\p{N}]/gu, "");

export function viteAvance() {
  return {
    name: "niltontaco:avance",
    enforce: "pre",
    transform(codigo, id) {
      if (!id.split("?")[0].endsWith(".mdx") || !esAvance(codigo)) return null;
      const marca = MARCA.exec(codigo);
      if (!marca) {
        this.error(`${id}: con «avance: true» hace falta una línea <VistaPrevia /> que marque dónde se corta el artículo.`);
      }
      const hasta = codigo.slice(0, marca.index) + "<VistaPrevia activo />";
      return { code: hasta, map: null };
    },
  };
}

/** @returns {import("astro").AstroIntegration} */
export function guardiaAvance() {
  let raiz;
  return {
    name: "niltontaco:guardia-avance",
    hooks: {
      "astro:config:done": ({ config }) => {
        raiz = config.root;
      },
      "astro:build:done": ({ dir }) => {
        const carpetaDiario = new URL("src/content/diario/", raiz);
        const salida = fileURLToPath(dir);
        for (const slug of readdirSync(carpetaDiario)) {
          const fuente = new URL(`${slug}/index.mdx`, carpetaDiario);
          if (!existsSync(fuente)) continue;
          const texto = readFileSync(fuente, "utf8");
          if (!esAvance(texto)) continue;
          const marca = MARCA.exec(texto);
          if (!marca) throw new Error(`avance: ${slug} no tiene <VistaPrevia />.`);

          // Títulos (## y ###) de la parte que debía cortarse.
          const cortado = texto.slice(marca.index + marca[0].length);
          const titulos = [...cortado.matchAll(/^#{2,3}\s+(.+?)\s*$/gm)].map((m) => normalizar(m[1])).filter((t) => t.length >= 8);
          if (titulos.length === 0) continue;

          const paginas = [`diario/${slug}/index.html`, `en/journal/${slug}/index.html`]
            .map((ruta) => fileURLToPath(new URL(ruta, dir)))
            .filter(existsSync);
          for (const pagina of paginas) {
            const html = normalizar(readFileSync(pagina, "utf8"));
            const filtrado = titulos.find((t) => html.includes(t));
            if (filtrado) {
              throw new Error(
                `avance: ${pagina.replace(salida, "")} contiene un título de la parte que debía cortarse. ` +
                  `El corte no funcionó: NO publiques este build.`,
              );
            }
          }
        }
      },
    },
  };
}
