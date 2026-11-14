import { getCollection, type CollectionEntry } from "astro:content";
import { RUTAS, UI, type Idioma } from "../i18n";

export type Articulo = CollectionEntry<"diario">;

/** Artículos publicados, del más nuevo al más antiguo. Sin idioma, devuelve todos. En `astro dev` también se ven los borradores. */
export async function getArticulos(idioma?: Idioma): Promise<Articulo[]> {
  const todos = await getCollection("diario", ({ data }) => (import.meta.env.DEV || !data.borrador) && (!idioma || data.idioma === idioma));
  return todos.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

export const urlDe = (articulo: Articulo) => `${RUTAS[articulo.data.idioma].diario}${articulo.id}/`;

/** El mismo artículo en el otro idioma, si existe y está publicado. */
export async function traduccionDe(articulo: Articulo): Promise<Articulo | undefined> {
  return (await getArticulos()).find((a) => a.id === articulo.data.traduccion);
}

/** Minutos de lectura a ~200 palabras por minuto, sin contar los bloques de código. */
export function minutosDeLectura(texto = ""): number {
  // Los paneles <Dato …/> son opcionales (se abren a demanda), así que no cuentan como lectura.
  const prosa = texto.replace(/<Dato[\s\S]*?\/>/g, " ").replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").replace(/^import .*$/gm, " ");
  const palabras = prosa.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

export const fechaLarga = (fecha: Date, idioma: Idioma) =>
  new Intl.DateTimeFormat(UI[idioma].sitio.fecha, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(fecha);
export const fechaIso = (fecha: Date) => fecha.toISOString().slice(0, 10);
