import { getCollection, type CollectionEntry } from "astro:content";

export type Articulo = CollectionEntry<"diario">;

/** Artículos publicados, del más nuevo al más antiguo. En `astro dev` también se ven los borradores. */
export async function getArticulos(): Promise<Articulo[]> {
  const todos = await getCollection("diario", ({ data }) => import.meta.env.DEV || !data.borrador);
  return todos.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

export const urlDe = (articulo: Articulo) => `/diario/${articulo.id}/`;

/** Minutos de lectura a ~200 palabras por minuto, sin contar los bloques de código. */
export function minutosDeLectura(texto = ""): number {
  const prosa = texto.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").replace(/^import .*$/gm, " ");
  const palabras = prosa.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

const formato = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const fechaLarga = (fecha: Date) => formato.format(fecha);
export const fechaIso = (fecha: Date) => fecha.toISOString().slice(0, 10);
