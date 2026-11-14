# niltontaco.pages.dev

Sitio personal de **Nilton Taco**: quién soy y un diario técnico sobre cómo funcionan por dentro las
herramientas de backend, con figuras interactivas.

## Estructura (monorepo con pnpm)

```
apps/
  web/          Astro: «Quién soy» + Diario (sitio estático, SEO)
packages/
  figuras/      Figuras isométricas interactivas (kit anatomy) que se insertan en los artículos
  tokens/       Colores y tipografías compartidos (mismo papel y tinta que las figuras)
```

Más adelante: `apps/app` (Next.js, paneles) y `apps/api` (NestJS).

## Requisitos

- **pnpm 12** (`npm i -g pnpm`).
- Node no hace falta instalarlo a mano: `devEngines` en `package.json` hace que pnpm descargue
  **Node 24** solo para este proyecto. Tu Node global no se toca.

## Comandos (desde la raíz)

| Comando | Qué hace |
| --- | --- |
| `pnpm install` | Instala todo (y Node 24 para el proyecto) |
| `pnpm dev` | Genera las figuras y abre el sitio en http://localhost:4321 |
| `pnpm build` | Genera las figuras y compila el sitio en `apps/web/dist/` |
| `pnpm preview` | Sirve la compilación para revisarla antes de publicar |
| `pnpm check` | Revisión de tipos de TypeScript y Astro |

## Escribir un artículo

1. Crea `apps/web/src/content/diario/<slug>/index.mdx`. El slug es la URL: `/diario/<slug>/`.
2. Completa el frontmatter. El esquema está en `apps/web/src/content.config.ts` y la compilación
   falla si falta algo:

   ```yaml
   ---
   titulo: "Título (máx. 80 caracteres)"
   descripcion: "Entre 50 y 170 caracteres: es lo que muestra Google."
   fecha: 2026-11-06
   serie: { nombre: "Git por dentro", orden: 2 }
   etiquetas: ["git"]
   imagen: ./imagen.png        # 1200 × 630, para LinkedIn y X
   imagenAlt: "Descripción de la imagen"
   borrador: true              # no se publica; en `pnpm dev` sí se ve
   ---
   ```

3. Para una figura, importa su componente en el MDX (ver `donde-guarda-git/index.mdx`).
4. Si no pones `imagen`, se genera una automáticamente en `/og/<slug>.png` (título, serie y minutos).

### Bloques de código

````md
```js title="hola.js"        → cabecera con el nombre del archivo
```bash lineas               → numera las líneas
console.log("hola"); // [!code highlight]   → resalta la línea ([!code ++] / [!code --] para diffs)
````

En los bloques de terminal, «Copiar» copia solo los comandos (sin `$` ni la salida).

## Dos idiomas (ES / EN)

- Español en la raíz (`/diario/…`) e inglés en `/en/` (`/en/journal/…`). El switch ES / EN está en la cabecera y,
  en un artículo, lleva a su traducción.
- Los textos de la interfaz están en `apps/web/src/i18n.ts`.
- Para traducir un artículo: crea su carpeta en inglés con `idioma: en` y `traduccion: <carpeta-en-español>`, y pon en
  el español `traduccion: <carpeta-en-inglés>`. Eso genera los `hreflang` que Google usa para mostrar cada idioma a quien corresponde.
- Un artículo sin traducción no aparece en el otro idioma, y el switch lleva a la portada.
- Las figuras se generan en los dos idiomas (`packages/figuras`).

## Subartículos (ramas) de un artículo

Un **subartículo** (una *rama*) es un artículo que profundiza en una duda de otro. Se declara en su frontmatter con
`rama: <carpeta-del-artículo-principal>`; el principal muestra la lista de sus ramas al final y la rama lleva un
aviso «Rama de …». En el artículo principal, el bloque `<Pausa …/>` plantea la pregunta, da pistas que se abren una a una
y enlaza a la rama (ver `donde-guarda-git/index.mdx`).

## Paneles opcionales: historia, curiosidades, ejemplos

Para no sobrecargar un artículo, el material extra va en paneles que el lector abre si quiere: una palabra con subrayado
punteado que, al pasar el cursor (o tocarla), despliega un panel mientras cientos de dígitos hexadecimales vuelan y se
juntan hasta formar el texto. Con «reducir movimiento» el texto aparece sin animación.

```mdx
import Dato from "../../../components/Dato.astro";
import { historia } from "./datos.ts";

La <Dato etiqueta="historia" titulo="Historia de SHA-1" items={historia} /> de SHA-1…
```

- El contenido de cada panel va en un `datos.ts` junto al artículo (`items` es una lista de renglones con HTML en línea:
  `<strong>`, `<code>`, `<sup>`). Cada idioma tiene su propio `datos.ts`.
- Ratón: se abre al pasar el cursor; un clic lo fija. Táctil y teclado: toque o Enter. Se cierra con Esc, con la ×, o
  al pulsar fuera. Se coloca solo del lado con más espacio y, si no cabe, el contenido se desplaza dentro.
- El texto siempre está en el HTML (lectores de pantalla y buscadores lo ven) y sin JavaScript se muestra como un bloque más.
- No cuenta para los «min de lectura». **Verifica cada dato antes de ponerlo**: los del artículo 1 se comprobaron con
  `git hash-object`, la documentación de Git y las notas de versión.

## Series: artículos, subartículos y el mapa

Cada artículo es una pieza corta, pero la serie cuenta una sola historia. Hay dos clases de piezas:

- **Artículo (parte)**: el camino principal, en orden (`serie: { nombre: "Git por dentro", orden: 2 }`).
- **Subartículo**: una duda que sale de un artículo (`rama: <carpeta-del-artículo>`). No es la siguiente parte: se lee y se vuelve.

El plan completo vive en **un solo archivo**, `apps/web/src/series.ts`: las partes en orden, qué le pasa a `hola.js` en cada
una (el *hilo*) y los subartículos previstos. Con él se dibuja todo lo demás, con la forma de un `git log --graph`
(el camino principal con nodos y los subartículos como ramas que salen, corren en paralelo y vuelven a unirse):

- **Franja de ubicación** arriba de cada artículo (`UbicacionSerie`): «Parte 2 de 8 · continúa de la parte 1», un mini mapa,
  y en un subartículo, «es una duda, vuelve al camino principal».
- **Tarjeta de cierre** abajo: «Siguiente parte» o, en un subartículo, «Vuelve a donde lo dejaste» (lleva a la `#pausa` del artículo).
- **Mapa completo** (`MapaSerie`) al final de cada artículo y en su propia página: `/diario/serie/<slug>/` y `/en/journal/series/<slug>/`.
  La portada muestra el camino principal en pequeño.
- **Estado**: línea continua = publicado; punteada = todavía no. Una parte sin artículo se ve «próximamente»; con
  `borrador: true` solo se ve en `pnpm dev` (con la etiqueta «borrador») y en producción sigue como «próximamente»,
  sin enlace y sin entrar en el sitemap, el RSS ni el buscador.

Añadir una parte o un subartículo: agrégalo en `series.ts` con sus textos en ES y EN y escribe los dos artículos. El `id` es la
carpeta de cada uno. Para **publicar un borrador**: quita `borrador: true` de los dos idiomas, ajusta `fecha` y, si hace falta,
añade el enlace en el «Lo que viene» del artículo anterior. Los títulos de lo que aún no existe son **de trabajo**: cuando el
artículo existe, el mapa usa su título real.

## Qué trae el sitio

- **Paleta de comandos** con `Ctrl K` / `⌘ K` o `/`: navegar, cambiar el tema y buscar en todo el diario.
  La búsqueda de texto usa **Pagefind**, que indexa el sitio al compilar: en `pnpm dev` solo se filtran
  comandos y títulos; con `pnpm build && pnpm preview` funciona completa.
- **Índice flotante** en los artículos (desplegable en el celular) y **barra de progreso** de lectura.
- **Inicio en bento**: artículo destacado, «Ahora», números reales del diario, quién soy y la serie.
- **Tema claro/oscuro** persistente; las figuras cambian junto con la página.
- **Transiciones entre páginas** con CSS (View Transitions), sin JavaScript.

## Publicar en Cloudflare Pages

Conecta el repositorio de GitHub en *Workers & Pages → Create → Pages → Connect to Git* con:

| Ajuste | Valor |
| --- | --- |
| Nombre del proyecto | `niltontaco` → `niltontaco.pages.dev` |
| Rama de producción | `main` |
| Framework preset | None |
| Build command | `pnpm build` |
| Build output directory | `apps/web/dist` |
| Variables de entorno | `NODE_VERSION=24`, `PNPM_VERSION=12.4.1` |

Cada rama distinta de `main` genera una URL de vista previa.

## SEO incluido

`sitemap-index.xml`, `rss.xml`, `robots.txt`, URL canónica, Open Graph y Twitter Card con imagen
por artículo, JSON-LD (`Person` en el inicio y `BlogPosting` en cada artículo) y `lang="es"`.
Cabeceras de caché y seguridad en `apps/web/public/_headers`.
