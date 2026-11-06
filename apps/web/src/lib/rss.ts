import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../config";
import { UI, type Idioma } from "../i18n";
import { getArticulos, urlDe } from "./diario";

export async function rssDe(idioma: Idioma, context: APIContext) {
  const articulos = await getArticulos(idioma);
  return rss({
    title: `${UI[idioma].diario.rss} · ${SITE.name}`,
    description: UI[idioma].sitio.descripcion,
    site: context.site!,
    items: articulos.map((articulo) => ({
      title: articulo.data.titulo,
      description: articulo.data.descripcion,
      pubDate: articulo.data.fecha,
      link: urlDe(articulo),
      categories: articulo.data.etiquetas,
    })),
    customData: `<language>${idioma}</language>`,
  });
}
