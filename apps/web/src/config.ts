// Datos del sitio en un solo lugar. Cambia aquí tus enlaces y textos base.
export const SITE = {
  url: "https://niltontaco.pages.dev",
  name: "Nilton Taco",
  title: "Nilton Taco · Backend con Node.js y TypeScript",
  description:
    "Diario técnico de Nilton Taco: cómo funcionan por dentro las herramientas de backend, empezando por Git, explicado con figuras interactivas.",
  lang: "es",
  locale: "es_PE",
} as const;

export const AUTHOR = {
  name: "Nilton Taco",
  fullName: "Nilton Huayroccacya Taco",
  role: "Desarrollador backend junior · Node.js y TypeScript",
  // Deja vacío ("") lo que no quieras mostrar: el sitio oculta los enlaces vacíos.
  github: "https://github.com/HakDev-sudo",
  linkedin: "https://www.linkedin.com/in/nilton-huayroccacya-taco",
} as const;

// Perfiles para los datos estructurados: le dicen a Google que todos son la misma persona.
export const PERFILES = [AUTHOR.linkedin, AUTHOR.github, "https://github.com/nilton2005"].filter(Boolean);
