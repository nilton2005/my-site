// Imagen para redes (1200 × 630) generada al compilar para cada artículo.
// Se usa cuando el artículo no trae su propia `imagen` en el frontmatter. Si el artículo tiene escena
// (src/lib/portadas.mjs), la escena ocupa el fondo y el título va encima, sobre el lado que la escena deja libre.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { APIRoute, GetStaticPaths } from "astro";
import { SITE } from "../../config";
import { UI } from "../../i18n";
import { getArticulos, minutosDeLectura, type Articulo } from "../../lib/diario";
import { portadaCompleta } from "../../lib/portadas.mjs";

const require = createRequire(join(process.cwd(), "package.json"));
const fuente = (archivo: string) => readFileSync(require.resolve(archivo));
// Logo de Mokya incrustado: satori no lee archivos, solo URLs de datos.
const LOGO = `data:image/png;base64,${readFileSync(join(process.cwd(), "public", "mokya-logo.png")).toString("base64")}`;
const TINTA = "#2a2612";
const BANANA = "#f3ca47";
const PAPEL = "#f3eed8";
const FUENTES = [
  { name: "Inter", data: fuente("@fontsource/inter/files/inter-latin-400-normal.woff"), weight: 400 as const },
  { name: "Inter", data: fuente("@fontsource/inter/files/inter-latin-700-normal.woff"), weight: 700 as const },
  { name: "Mono", data: fuente("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"), weight: 500 as const },
];

export const getStaticPaths: GetStaticPaths = async () =>
  (await getArticulos()).map((articulo) => ({ params: { slug: articulo.id }, props: { articulo } }));

// Satori recibe un árbol tipo React; esta función lo arma sin JSX.
type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Nodo | string)[]): Nodo => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});

export const GET: APIRoute = async ({ props }) => {
  const { id, data, body } = (props as { articulo: Articulo }).articulo;
  // La escena se rasteriza primero (satori solo acepta imágenes ya listas) con los colores del tema oscuro
  // Lleva incluido un velo a la izquierda para que el título se lea encima.
  const velo = `<defs><linearGradient id="velo"><stop offset="0.3" stop-color="${TINTA}"/><stop offset="0.62" stop-color="${TINTA}" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#velo)"/>`;
  const escena = portadaCompleta(id, { p: BANANA, p2: "#8a8566" })?.replace(/^(<svg[^>]*>)/, `$1<rect width="1200" height="630" fill="${TINTA}"/>`).replace("</svg>", `${velo}</svg>`);
  const fondo = escena && `data:image/png;base64,${Buffer.from(new Resvg(escena, { fitTo: { mode: "width", value: 1200 } }).render().asPng()).toString("base64")}`;
  const ancho = fondo ? 640 : 960;
  const serie = data.serie ? `${data.serie.nombre} · ${String(data.serie.orden).padStart(2, "0")}` : UI[data.idioma].nav.diario;
  const largo = fondo ? (data.titulo.length > 42 ? 54 : 64) : data.titulo.length > 42 ? 64 : 76;

  const fila = { width: "100%", alignItems: "center", justifyContent: "space-between" };
  const arbol = h(
    "div",
    {
      width: 1200 - 128, height: 630 - 112, paddingTop: 56, paddingBottom: 56, paddingLeft: 64, paddingRight: 64, flexDirection: "column", background: TINTA, fontFamily: "Inter", color: PAPEL,
      // La escena va de fondo del contenedor (un elemento absoluto quedaría por encima del texto en satori)
      ...(fondo && { backgroundImage: `url(${fondo})`, backgroundSize: "1200px 630px" }),
    },
    h(
      "div",
      { ...fila, height: 32, fontFamily: "Mono", fontSize: 22 },
      h("div", { alignItems: "center" }, { type: "img", props: { src: LOGO, width: 40, height: 38, style: { marginRight: 14 } } }, h("div", { color: BANANA, textTransform: "uppercase", letterSpacing: 2 }, serie)),
      h("div", { color: PAPEL }, "niltontaco.pages.dev"),
    ),
    h(
      "div",
      { width: "100%", flexGrow: 1, flexDirection: "column", justifyContent: "center" },
      h("div", { fontSize: largo, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, maxWidth: ancho }, data.titulo),
      h("div", { fontSize: fondo ? 25 : 30, lineHeight: 1.35, color: "#c9c4a8", maxWidth: ancho }, data.descripcion),
    ),
    h(
      "div",
      { ...fila, height: 32, fontSize: 24, color: "#c9c4a8" },
      h("div", { alignItems: "center" }, h("div", { width: 12, height: 26, marginRight: 14, background: BANANA }), SITE.name),
      h("div", { fontFamily: "Mono", fontSize: 22 }, `${minutosDeLectura(body)} ${UI[data.idioma].articulo.lectura}`),
    ),
  );

  const svg = await satori(arbol as never, { width: 1200, height: 630, fonts: FUENTES });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
