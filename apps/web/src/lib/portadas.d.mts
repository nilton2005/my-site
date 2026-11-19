// Tipos de src/lib/portadas.mjs (las escenas de partículas de cada artículo).
export function tienePortada(id: string): boolean;
/** SVG recortado para el banner del artículo; los colores salen de las variables CSS del tema. */
export function portadaBanner(id: string): string | null;
/** SVG de la escena entera (1200 × 630) con colores fijos, para la imagen de redes. */
export function portadaCompleta(id: string, colores: { p: string; p2: string }): string | null;
