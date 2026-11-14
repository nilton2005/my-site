// Cruza el plan de una serie (src/series.ts) con los artículos reales: qué partes ya existen, cuáles son
// borrador y cuáles siguen siendo un plan. También responde «¿dónde estoy?» para un artículo o subartículo.
import type { Idioma } from "../i18n";
import { SERIES } from "../series";
import { getArticulos, urlDe, type Articulo } from "./diario";

/** `avance`: ya existe y se puede abrir, pero solo con el comienzo (ver src/lib/avance.mjs). */
export type Estado = "publicado" | "borrador" | "avance" | "proximamente";

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
  /** Subartículos (ramas) de esta parte. */
  ramas: ItemSerie[];
  /** Estado de la parte siguiente: colorea el tramo del camino que va hacia ella. */
  tramo?: Estado;
}

export async function resolverSerie(clave: string, idioma: Idioma): Promise<ParteResuelta[]> {
  const serie = SERIES[clave];
  if (!serie) return [];
  const articulos = await getArticulos(idioma);
  const porId = new Map(articulos.map((a) => [a.id, a]));

  const item = (id: string | undefined, titulo: string): ItemSerie => {
    const articulo: Articulo | undefined = id ? porId.get(id) : undefined;
    if (!articulo) return { titulo, estado: "proximamente" };
    return { titulo: articulo.data.titulo, url: urlDe(articulo), id: articulo.id, estado: articulo.data.borrador ? "borrador" : articulo.data.avance ? "avance" : "publicado" };
  };

  const partes: ParteResuelta[] = serie.partes.map((p) => ({
    ...item(p.id?.[idioma], p.titulo[idioma]),
    orden: p.orden,
    hilo: p.hilo[idioma],
    ramas: (p.ramas ?? []).map((r) => item(r.id?.[idioma], r.titulo[idioma])),
  }));
  partes.forEach((p, i) => {
    p.tramo = partes[i + 1]?.estado;
  });
  return partes;
}

export interface Ubicacion {
  nombre: string;
  hilo: string;
  total: number;
  partes: ParteResuelta[];
  /** La parte que se lee o, si se lee un subartículo, la parte de la que cuelga. */
  parte: ParteResuelta;
  /** Solo cuando se lee un subartículo. */
  sub?: ItemSerie;
  anterior?: ParteResuelta;
  siguiente?: ParteResuelta;
}

/** ¿Dónde cae este artículo en la serie? `undefined` si no pertenece a ella. */
export async function ubicar(clave: string, idioma: Idioma, actualId: string): Promise<Ubicacion | undefined> {
  const serie = SERIES[clave];
  if (!serie) return undefined;
  const partes = await resolverSerie(clave, idioma);
  const i = partes.findIndex((p) => p.id === actualId || p.ramas.some((r) => r.id === actualId));
  const parte = partes[i];
  if (!parte) return undefined;
  return {
    nombre: serie.nombre[idioma],
    hilo: serie.hilo[idioma],
    total: partes.length,
    partes,
    parte,
    sub: parte.id === actualId ? undefined : parte.ramas.find((r) => r.id === actualId),
    anterior: partes[i - 1],
    siguiente: partes[i + 1],
  };
}
