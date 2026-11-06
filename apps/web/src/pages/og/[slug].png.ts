// Imagen para redes (1200 × 630) generada al compilar para cada artículo.
// Se usa cuando el artículo no trae su propia `imagen` en el frontmatter.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { APIRoute, GetStaticPaths } from "astro";
import { SITE } from "../../config";
import { getArticulos, minutosDeLectura, type Articulo } from "../../lib/diario";

const require = createRequire(join(process.cwd(), "package.json"));
const fuente = (archivo: string) => readFileSync(require.resolve(archivo));
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
  const { data, body } = (props as { articulo: Articulo }).articulo;
  const serie = data.serie ? `${data.serie.nombre} · ${String(data.serie.orden).padStart(2, "0")}` : "Diario";
  const largo = data.titulo.length > 42 ? 64 : 76;

  const fila = { width: "100%", alignItems: "center", justifyContent: "space-between" };
  const arbol = h(
    "div",
    { width: 1200 - 128, height: 630 - 112, paddingTop: 56, paddingBottom: 56, paddingLeft: 64, paddingRight: 64, flexDirection: "column", background: "#f2f2ef", fontFamily: "Inter", color: "#18181a" },
    h(
      "div",
      { ...fila, height: 32, fontFamily: "Mono", fontSize: 22 },
      h("div", { color: "#0b7a57", textTransform: "uppercase", letterSpacing: 2 }, serie),
      h("div", { color: "#18181a" }, "~/niltontaco.pages.dev"),
    ),
    h(
      "div",
      { width: "100%", flexGrow: 1, flexDirection: "column", justifyContent: "center" },
      h("div", { fontSize: largo, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24 }, data.titulo),
      h("div", { fontSize: 30, lineHeight: 1.35, color: "#45454a", maxWidth: 960 }, data.descripcion),
    ),
    h(
      "div",
      { ...fila, height: 32, fontSize: 24, color: "#45454a" },
      h("div", { alignItems: "center" }, h("div", { width: 12, height: 26, marginRight: 14, background: "#0b7a57" }), SITE.name),
      h("div", { fontFamily: "Mono", fontSize: 22 }, `${minutosDeLectura(body)} min de lectura`),
    ),
  );

  const svg = await satori(arbol as never, { width: 1200, height: 630, fonts: FUENTES });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
