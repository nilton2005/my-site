// Idiomas del sitio: rutas y textos de la interfaz. El español va en la raíz (/) y el inglés en /en/.
// El idioma de una página sale de su URL (Astro.currentLocale), según `i18n` en astro.config.mjs.
export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const idiomaDe = (locale: string | undefined): Idioma => (locale === "en" ? "en" : "es");
export const otroIdioma = (idioma: Idioma): Idioma => (idioma === "es" ? "en" : "es");

export const RUTAS = {
  es: { inicio: "/", diario: "/diario/", rss: "/rss.xml", og: "/og.png" },
  en: { inicio: "/en/", diario: "/en/journal/", rss: "/en/rss.xml", og: "/og-en.png" },
} as const;

const es = {
  sitio: {
    titulo: "Nilton Taco · Backend con Node.js y TypeScript",
    descripcion:
      "Diario técnico de Nilton Taco: cómo funcionan por dentro las herramientas de backend, empezando por Git, explicado con figuras interactivas.",
    locale: "es_PE",
    fecha: "es-PE",
  },
  nav: {
    principal: "Principal",
    marca: "Nilton Taco, inicio",
    inicio: "Quién soy",
    diario: "Diario",
    buscar: "Buscar",
    rss: "RSS del diario",
    tema: "Cambiar entre tema claro y oscuro",
    temaCorto: "Tema claro / oscuro",
    idioma: "Idioma",
    leerEn: "Leer en español",
    saltar: "Saltar al contenido",
  },
  pie: { hecho: "Hecho con Astro · publicado en Cloudflare Pages" },
  diario: {
    titulo: "Lo que aprendo, por dentro.",
    entrada:
      "Notas sobre backend escritas para entender cómo funcionan las cosas, no solo cómo se usan. Cada artículo trae comandos que puedes reproducir y, cuando ayuda, una figura que puedes tocar.",
    descripcion:
      "Diario técnico de Nilton Taco: cómo funcionan por dentro Git y las herramientas de backend, con comandos reproducibles y figuras interactivas.",
    rss: "Diario",
  },
  articulo: {
    enEste: "En este artículo",
    lectura: "min de lectura",
    actualizado: "actualizado el",
    etiquetas: "Etiquetas",
    cierre: "Escribo sobre cómo funcionan por dentro las herramientas de backend.",
    siTeSirvio: "Si te sirvió,",
    sigueme: "sígueme en LinkedIn",
    o: "o",
    suscribete: "suscríbete por",
    volver: "← Volver al diario",
  },
  inicio: {
    saludo: "Hola, soy Nilton Taco.",
    entrada:
      "Desarrollador backend con <strong>Node.js</strong> y <strong>TypeScript</strong>. Me gusta entender cómo funcionan las herramientas por dentro, y en este diario lo explico con figuras que puedes tocar.",
    leer: "Leer el diario",
    resumen: "Resumen",
    ultimo: "Último del diario",
    ahora: "Ahora",
    ahoraLista: [
      "Escribiendo la serie <strong>Git por dentro</strong>.",
      "Construyendo un <strong>Mini-Git en TypeScript</strong>, un comando a la vez.",
      "Preparando una <strong>terminal en el navegador</strong> para probar los comandos.",
    ],
    numeros: "El diario en números",
    articulo: "artículo",
    articulos: "artículos",
    minutos: "min de lectura",
    figura: "figura interactiva",
    figuras: "figuras interactivas",
    quien: "Quién soy",
    bio: [
      "Soy Nilton Huayroccacya Taco, desarrollador backend junior en Arequipa, Perú, con 2 años construyendo sistemas en producción con Node.js. Me formé en Diseño y Desarrollo de Software en Tecsup.",
      "Fui líder técnico de <strong>Joya Express</strong>, una app de mototaxis para La Joya (Arequipa): lideré un equipo de 4 personas y diseñé su arquitectura en tiempo real con Kafka, Redis y WebSockets. Después trabajé en <strong>ViiuTech</strong> (Chile), en una plataforma de compensación de CO₂.",
    ],
    tecnologias: "Tecnologías",
    serie: "Git por dentro",
    rotuloSerie: "Serie",
    proximo: "Próximo: los <em>trees</em>, o cómo recuerda Git los nombres",
  },
  paleta: {
    etiqueta: "Buscar y navegar",
    campo: "Buscar artículos, temas o comandos",
    placeholder: "Busca artículos, temas o comandos…",
    resultados: "Resultados",
    moverte: "moverte",
    abrir: "abrir",
    cerrar: "cerrar",
    vacio: "Sin resultados. Prueba con otra palabra.",
    irA: "Ir a",
    articulos: "Artículos",
    acciones: "Acciones",
    enlaces: "Enlaces",
    enElDiario: "En el diario",
    cambiarTema: "Cambiar tema claro / oscuro",
    otroIdioma: "Read in English",
  },
  e404: {
    titulo: "Página no encontrada",
    descripcion: "Esta página no existe.",
    texto: "Esa página no existe (o todavía no la escribo). Prueba con el",
    diario: "diario",
    o: "o vuelve al",
    inicio: "inicio",
  },
};

const en: typeof es = {
  sitio: {
    titulo: "Nilton Taco · Backend with Node.js and TypeScript",
    descripcion:
      "Nilton Taco's technical journal: how backend tools work on the inside, starting with Git, explained with interactive figures.",
    locale: "en_US",
    fecha: "en-US",
  },
  nav: {
    principal: "Main",
    marca: "Nilton Taco, home",
    inicio: "About",
    diario: "Journal",
    buscar: "Search",
    rss: "Journal RSS feed",
    tema: "Switch between light and dark theme",
    temaCorto: "Light / dark theme",
    idioma: "Language",
    leerEn: "Read in English",
    saltar: "Skip to content",
  },
  pie: { hecho: "Built with Astro · hosted on Cloudflare Pages" },
  diario: {
    titulo: "What I learn, from the inside.",
    entrada:
      "Backend notes written to understand how things work, not just how to use them. Every article comes with commands you can reproduce and, when it helps, a figure you can play with.",
    descripcion:
      "Nilton Taco's technical journal: how Git and backend tools work on the inside, with reproducible commands and interactive figures.",
    rss: "Journal",
  },
  articulo: {
    enEste: "In this article",
    lectura: "min read",
    actualizado: "updated on",
    etiquetas: "Tags",
    cierre: "I write about how backend tools work on the inside.",
    siTeSirvio: "If this helped,",
    sigueme: "follow me on LinkedIn",
    o: "or",
    suscribete: "subscribe via",
    volver: "← Back to the journal",
  },
  inicio: {
    saludo: "Hi, I'm Nilton Taco.",
    entrada:
      "Backend developer working with <strong>Node.js</strong> and <strong>TypeScript</strong>. I like to understand how tools work on the inside, and in this journal I explain it with figures you can play with.",
    leer: "Read the journal",
    resumen: "Overview",
    ultimo: "Latest from the journal",
    ahora: "Now",
    ahoraLista: [
      "Writing the <strong>Inside Git</strong> series.",
      "Building a <strong>Mini-Git in TypeScript</strong>, one command at a time.",
      "Preparing an <strong>in-browser terminal</strong> to try the commands.",
    ],
    numeros: "The journal in numbers",
    articulo: "article",
    articulos: "articles",
    minutos: "min of reading",
    figura: "interactive figure",
    figuras: "interactive figures",
    quien: "About me",
    bio: [
      "I'm Nilton Huayroccacya Taco, a junior backend developer based in Arequipa, Peru, with 2 years of experience building production systems with Node.js. I studied Software Design and Development at Tecsup.",
      "I was the technical lead of <strong>Joya Express</strong>, a mototaxi ride-hailing app for La Joya (Arequipa): I led a 4-person team and designed its real-time architecture with Kafka, Redis and WebSockets. After that I worked at <strong>ViiuTech</strong> (Chile) on a CO₂ compensation platform.",
    ],
    tecnologias: "Technologies",
    serie: "Inside Git",
    rotuloSerie: "Series",
    proximo: "Next: <em>trees</em>, or how Git remembers names",
  },
  paleta: {
    etiqueta: "Search and navigate",
    campo: "Search articles, topics or commands",
    placeholder: "Search articles, topics or commands…",
    resultados: "Results",
    moverte: "move",
    abrir: "open",
    cerrar: "close",
    vacio: "No results. Try another word.",
    irA: "Go to",
    articulos: "Articles",
    acciones: "Actions",
    enlaces: "Links",
    enElDiario: "In the journal",
    cambiarTema: "Switch light / dark theme",
    otroIdioma: "Leer en español",
  },
  e404: {
    titulo: "Page not found",
    descripcion: "This page does not exist.",
    texto: "That page does not exist (or I haven't written it yet). Try the",
    diario: "journal",
    o: "or go back",
    inicio: "home",
  },
};

export const UI = { es, en };
