// Cruza el plan de una serie (src/series.ts) con los artículos reales: qué partes ya existen, cuáles son
// borrador y cuáles siguen siendo un plan.
import type { Idioma } from "../i18n";
import { SERIES } from "../series";
import { getArticulos, urlDe, type Articulo } from "./diario";

export type Estado = "publicado" | "borrador" | "proximamente";

export interface ItemSerie {
  titulo: string;
  /** Solo si el artículo existe en este idioma. */
  url?: string;
  estado: Estado;
  id?: string;
}

export interface ParteResuelta extends ItemSerie {
  orden: number;
  hilo: string;
  ramas: ItemSerie[];
}

export async function resolverSerie(clave: string, idioma: Idioma): Promise<ParteResuelta[]> {
  const serie = SERIES[clave];
  if (!serie) return [];
  const articulos = await getArticulos(idioma);
  const porId = new Map(articulos.map((a) => [a.id, a]));

  const item = (id: string | undefined, titulo: string): ItemSerie => {
    const articulo: Articulo | undefined = id ? porId.get(id) : undefined;
    if (!articulo) return { titulo, estado: "proximamente" };
    return { titulo: articulo.data.titulo, url: urlDe(articulo), id: articulo.id, estado: articulo.data.borrador ? "borrador" : "publicado" };
  };

  return serie.partes.map((p) => ({
    ...item(p.id?.[idioma], p.titulo[idioma]),
    orden: p.orden,
    hilo: p.hilo[idioma],
    ramas: (p.ramas ?? []).map((r) => item(r.id?.[idioma], r.titulo[idioma])),
  }));
}
