// Datos del sitio en un solo lugar. Los textos de cada idioma están en i18n.ts.
export const SITE = {
  url: "https://niltontaco.pages.dev",
  name: "Nilton Taco",
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
