// Transformador de Shiki: envuelve cada bloque de código en un marco con cabecera (título o lenguaje)
// y un botón «Copiar». Se genera al compilar, así que la página no salta al cargar.
//
// En Markdown/MDX:
//   ```js title="hola.js"      → la cabecera muestra «hola.js»
//   ```bash lineas             → numera las líneas
//   // [!code highlight]       → resalta esa línea (y [!code ++] / [!code --] para diffs)

const ETIQUETAS = {
  bash: "terminal",
  sh: "terminal",
  shell: "terminal",
  zsh: "terminal",
  powershell: "PowerShell",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  json: "JSON",
  yaml: "YAML",
  html: "HTML",
  css: "CSS",
  astro: "Astro",
  mdx: "MDX",
  md: "Markdown",
  text: "texto",
  plaintext: "texto",
  txt: "texto",
};

const el = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const text = (value) => ({ type: "text", value });

/** @returns {import("shiki").ShikiTransformer} */
export function transformerMarco() {
  return {
    name: "niltontaco:marco",
    pre(pre) {
      const meta = this.options.meta?.__raw ?? "";
      if (/(^|\s)lineas(\s|$)/.test(meta)) pre.properties["data-lineas"] = "";
    },
    root(root) {
      const index = root.children.findIndex((node) => node.type === "element" && node.tagName === "pre");
      if (index < 0) return;
      const pre = root.children[index];
      const meta = this.options.meta?.__raw ?? "";
      const titulo = /title="([^"]+)"/.exec(meta)?.[1];
      const lang = this.options.lang ?? "text";
      const etiqueta = titulo ?? ETIQUETAS[lang] ?? lang;
      const terminal = ["bash", "sh", "shell", "zsh", "powershell"].includes(lang);
      const cabecera = el("div", { class: "codigo-cabecera", "data-pagefind-ignore": "" }, [
        el("span", { class: titulo ? "codigo-titulo es-archivo" : "codigo-titulo" }, [text(etiqueta)]),
        el("button", { type: "button", class: "codigo-copiar", "data-copiar": "", "aria-label": "Copiar el código" }, [text("Copiar")]),
      ]);
      root.children[index] = el("figure", { class: "codigo", "data-terminal": terminal ? "" : undefined }, [cabecera, pre]);
    },
  };
}
