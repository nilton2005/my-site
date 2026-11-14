// Las series del diario: el hilo completo de la historia, aunque cada pieza sea corta.
// Esta es la ÚNICA fuente del plan: la línea de tiempo (components/LineaDeTiempo.astro) la lee y la cruza con
// los artículos reales. Una parte con `id` enlaza a su artículo cuando existe y está publicado; si no, se ve como
// «próximamente». Para añadir una parte o una rama: agrégala aquí y escribe sus dos artículos (ES y EN).
import type { Idioma } from "./i18n";

type Texto = Record<Idioma, string>;

export interface Rama {
  /** Carpeta del artículo en cada idioma (en src/content/diario/). */
  id?: Texto;
  /** Título de trabajo: solo se usa mientras el artículo no existe. */
  titulo: Texto;
}

export interface Parte {
  orden: number;
  id?: Texto;
  /** Título de trabajo: solo se usa mientras el artículo no existe. */
  titulo: Texto;
  /** Qué le pasa al archivo `hola.js` en esta parte (una línea: es lo que mantiene el hilo). */
  hilo: Texto;
  ramas?: Rama[];
}

export interface Serie {
  /** Debe coincidir con `serie.nombre` del frontmatter de cada artículo. */
  nombre: Texto;
  hilo: Texto;
  partes: Parte[];
}

export const SERIES: Record<string, Serie> = {
  "git-por-dentro": {
    nombre: { es: "Git por dentro", en: "Inside Git" },
    hilo: {
      es: "Seguimos a un solo archivo, hola.js, desde que lo guardas hasta que Git lo empaqueta. Al final lo reconstruimos en código.",
      en: "We follow a single file, hola.js, from the moment you save it until Git packs it. At the end we rebuild it in code.",
    },
    partes: [
      {
        orden: 1,
        id: { es: "donde-guarda-git", en: "where-git-stores-your-code" },
        titulo: { es: "¿Dónde guarda Git tu código?", en: "Where does Git store your code?" },
        hilo: {
          es: "hola.js entra a Git: su contenido se vuelve un blob, recibe una huella SHA-1 y cae en una de 256 carpetas.",
          en: "hola.js enters Git: its content becomes a blob, gets a SHA-1 fingerprint and lands in one of 256 folders.",
        },
        ramas: [
          {
            id: { es: "como-reparte-git-sus-objetos", en: "how-git-spreads-its-objects" },
            titulo: { es: "¿Quién decide en qué carpeta va cada objeto?", en: "Who decides which folder each object goes in?" },
          },
          {
            titulo: { es: "La ley de los grandes números, con gráficas", en: "The law of large numbers, with graphs" },
          },
          {
            titulo: { es: "Pensar en probabilidades, no en 0 o 1", en: "Thinking in probabilities, not in 0 or 1" },
          },
        ],
      },
      {
        orden: 2,
        id: { es: "que-hay-dentro-de-un-objeto", en: "whats-inside-a-git-object" },
        titulo: { es: "¿Qué hay dentro de un objeto?", en: "What's inside a Git object?" },
        hilo: {
          es: "Abrimos el archivo guardado: la cabecera, el byte nulo y el contenido, comprimidos con zlib.",
          en: "We open the stored file: the header, the null byte and the content, compressed with zlib.",
        },
      },
      {
        orden: 3,
        titulo: { es: "Los trees: dónde se guarda el nombre", en: "Trees: where the name is stored" },
        hilo: {
          es: "El blob no tiene nombre. Un tree guarda que ese contenido se llama hola.js y lo mete en una carpeta.",
          en: "The blob has no name. A tree records that this content is called hola.js and puts it in a folder.",
        },
      },
      {
        orden: 4,
        titulo: { es: "Los commits: la foto del proyecto", en: "Commits: a snapshot of the project" },
        hilo: {
          es: "Un commit apunta a un tree, a su padre y a quien lo hizo: la foto de todo el proyecto en un momento.",
          en: "A commit points to a tree, to its parent and to its author: a snapshot of the whole project at one moment.",
        },
      },
      {
        orden: 5,
        titulo: { es: "Ramas y HEAD: un archivo con un hash", en: "Branches and HEAD: a file with a hash" },
        hilo: {
          es: "Una rama es un archivo de texto con el hash de un commit; HEAD dice en cuál rama estás.",
          en: "A branch is a text file holding a commit's hash; HEAD says which branch you are on.",
        },
      },
      {
        orden: 6,
        titulo: { es: "El índice: lo que hay entre add y commit", en: "The index: what sits between add and commit" },
        hilo: {
          es: "Entre git add y git commit hay un archivo, .git/index, que prepara el siguiente tree.",
          en: "Between git add and git commit there is a file, .git/index, that prepares the next tree.",
        },
      },
      {
        orden: 7,
        titulo: { es: "Packfiles: cuando hay demasiados objetos", en: "Packfiles: when there are too many objects" },
        hilo: {
          es: "Con muchos objetos sueltos, git gc los junta y guarda solo las diferencias entre versiones.",
          en: "With many loose objects, git gc bundles them and stores only the differences between versions.",
        },
      },
      {
        orden: 8,
        titulo: { es: "Mini-Git: construirlo en TypeScript", en: "Mini-Git: building it in TypeScript" },
        hilo: {
          es: "Reconstruimos todo lo anterior en código: hash-object, cat-file, write-tree y commit.",
          en: "We rebuild everything above in code: hash-object, cat-file, write-tree and commit.",
        },
      },
    ],
  },
};

/** La serie a la que pertenece un nombre de serie del frontmatter (en cualquier idioma). */
export const serieDe = (nombre: string | undefined): [clave: string, serie: Serie] | undefined =>
  nombre ? Object.entries(SERIES).find(([, s]) => s.nombre.es === nombre || s.nombre.en === nombre) : undefined;
