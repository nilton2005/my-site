import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Cada artículo vive en src/content/diario/<slug>/index.mdx, con sus imágenes al lado.
// Si falta un dato de SEO o una fecha es inválida, la compilación falla: nunca se publica a medias.
const diario = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/diario", generateId: ({ entry }) => entry.split("/")[0]! }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(80),
      descripcion: z.string().min(50).max(170),
      fecha: z.coerce.date(),
      actualizado: z.coerce.date().optional(),
      serie: z.object({ nombre: z.string(), orden: z.number().int().positive() }).optional(),
      etiquetas: z.array(z.string()).default([]),
      // Imagen para redes sociales y listados: 1200 × 630.
      imagen: image().optional(),
      imagenAlt: z.string().optional(),
      borrador: z.boolean().default(false),
      idioma: z.enum(["es", "en"]).default("es"),
      // Carpeta del mismo artículo en el otro idioma: el switch y los hreflang la usan.
      traduccion: z.string().optional(),
    }),
});

export const collections = { diario };
