import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../config";
import { getArticulos, urlDe } from "../lib/diario";

export async function GET(context: APIContext) {
  const articulos = await getArticulos();
  return rss({
    title: `Diario · ${SITE.name}`,
    description: SITE.description,
    site: context.site!,
    items: articulos.map((articulo) => ({
      title: articulo.data.titulo,
      description: articulo.data.descripcion,
      pubDate: articulo.data.fecha,
      link: urlDe(articulo),
      categories: articulo.data.etiquetas,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
