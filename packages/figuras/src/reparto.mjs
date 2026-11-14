// GIT · 01b · ¿Quién decide en qué carpeta va cada objeto?
// Experimento interactivo: cada archivo se convierte en un blob real de Git, su SHA-1 (calculado de verdad
// en el navegador) elige uno de 256 cajones, y la figura lo compara con un método sin hash
// (el primer carácter del contenido). `render(idioma)` devuelve un fragmento HTML listo para insertar.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const kitScript = () => readFileSync(join(HERE, "..", "kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, "");
export const FIGURE_ID = "fig-reparto";

// ── El modelo ─────────────────────────────────────────────────────────────────────────────
// SHA-1 de un texto ASCII; devuelve las cinco palabras de 32 bits. Se copia tal cual a la página.
function sha1w(s) {
  const len = s.length;
  const n = ((len + 9 + 63) >> 6) << 6;
  const p = new Uint8Array(n);
  for (let i = 0; i < len; i++) p[i] = s.charCodeAt(i);
  p[len] = 0x80;
  const bits = len * 8;
  p[n - 4] = bits >>> 24;
  p[n - 3] = (bits >>> 16) & 255;
  p[n - 2] = (bits >>> 8) & 255;
  p[n - 1] = bits & 255;
  const w = new Int32Array(80);
  let h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (p[o + 4 * i] << 24) | (p[o + 4 * i + 1] << 16) | (p[o + 4 * i + 2] << 8) | p[o + 4 * i + 3];
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (x << 1) | (x >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f, q;
      if (i < 20) { f = (b & c) | (~b & d); q = 0x5a827999; }
      else if (i < 40) { f = b ^ c ^ d; q = 0x6ed9eba1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); q = 0x8f1bbcdc | 0; }
      else { f = b ^ c ^ d; q = 0xca62c1d6 | 0; }
      const t = (((a << 5) | (a >>> 27)) + f + e + q + w[i]) | 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return [h0 >>> 0, h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

// Archivos de código de mentira, pero realistas: casi todos empiezan igual («import», «const»…).
// Por eso elegir el cajón por el primer carácter del contenido amontona los archivos.
const OPEN = [
  ["import ", 30], ["const ", 22], ["function ", 10], ["// ", 8], ["export ", 8], ["class ", 5], ["let ", 4],
  ["#include ", 3], ["package ", 2], ["<?php ", 1], ["<!doctype html>", 3], ["{\n  \"name\": ", 3], ["# ", 3], ["def ", 2], ["\"use strict\";", 2],
];
const WORDS = ["usuario", "pedido", "config", "token", "handler", "cliente", "precio", "datos", "mensaje", "puerto"];
function archivo(i) {
  let a = (Math.imul(i + 1, 0x9e3779b1) ^ 0x85ebca6b) >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let total = 0;
  for (const o of OPEN) total += o[1];
  let u = r() * total;
  let inicio = OPEN[0][0];
  for (const o of OPEN) {
    if (u < o[1]) { inicio = o[0]; break; }
    u -= o[1];
  }
  return inicio + WORDS[Math.floor(r() * WORDS.length)] + "_" + i.toString(36) + " = " + Math.floor(r() * 1000000) + ";\n";
}

// La figura no puede mentir: su SHA-1 debe coincidir con el de Node, y los archivos deben ser todos distintos.
{
  const vistos = new Set();
  for (let i = 0; i < 30000; i++) {
    const c = archivo(i);
    if (vistos.has(c)) throw new Error(`archivo(${i}) repetido`);
    vistos.add(c);
    if (i < 300) {
      const git = createHash("sha1").update(`blob ${c.length}\0${c}`).digest("hex");
      const mio = sha1w(`blob ${c.length}\0${c}`).map((v) => v.toString(16).padStart(8, "0")).join("");
      if (git !== mio) throw new Error(`sha1 distinto para archivo(${i})`);
    }
  }
}

// ── Textos por idioma ─────────────────────────────────────────────────────────────────────
const TEXTOS = {
  es: {
    fig: "GIT · 01b",
    titulo: "256 cajones, ¿quién decide?",
    pista: "Añade archivos y compara los dos métodos",
    lang: "es-PE",
    tCajones: "256 cajones · 00 … ff",
    tObjetos: "objetos por cajón",
    stats: ["objetos", "promedio por cajón", "menor – mayor", "diferencia · % del promedio", "cajones vacíos", "parejas en un mismo cajón"],
    delPromedio: "del promedio",
    promedio: "promedio",
    maximo: "máx.",
    añadir: "Añadir archivos",
    metodo: "Cómo se elige el cajón",
    hash: "Hash SHA-1 (lo que hace Git)",
    byte: "Primer carácter del contenido",
    vaciar: "Vaciar",
    vacio: "0 objetos · pulsa «+10»",
    objetos: "objetos",
    porCajon: "por cajón",
    cajon: "cajón",
    tope: "Tope de 1 000 000 de objetos.",
    claves: [
      "Un cajón: una carpeta de .git/objects/ (00 … ff). Más oscuro, más objetos",
      "Cada barra: cuántos objetos hay en ese cajón",
      "El promedio: objetos ÷ 256",
    ],
    descripcion:
      "Una cuadrícula de 16 por 16 cajones, de 00 a ff, y debajo de cada archivo que añades el cajón que elige su hash SHA-1. A la derecha, una gráfica con las 256 barras de cuántos objetos hay en cada cajón y una línea punteada con el promedio, y seis cifras: objetos, promedio, menor y mayor, diferencia, cajones vacíos y parejas en un mismo cajón.",
    pie:
      "Cada archivo se convierte en un blob y su SHA-1 (el de verdad, calculado en tu navegador) elige un cajón: los dos primeros caracteres del hash. Añade archivos y mira: con pocos hay cajones vacíos y mucha irregularidad; con cientos de miles todos se acercan al promedio. Fíjate en la diferencia entre el cajón más lleno y el más vacío: crece en números, pero se achica en proporción. Nadie cuenta ni reparte nada. Cambia al segundo método, que elige el cajón por el primer carácter del contenido, y los mismos archivos se amontonan en unos pocos cajones, porque el código casi siempre empieza igual.",
    controles: "Controles del experimento: añadir archivos y elegir cómo se decide el cajón.",
    dicho: {
      añadidos: "Añadidos",
      cambio: "Método: ",
      vaciado: "Archivador vacío",
    },
  },
  en: {
    fig: "GIT · 01b",
    titulo: "256 drawers, who decides?",
    pista: "Add files and compare the two methods",
    lang: "en-US",
    tCajones: "256 drawers · 00 … ff",
    tObjetos: "objects per drawer",
    stats: ["objects", "average per drawer", "lowest – highest", "difference · % of the average", "empty drawers", "pairs in the same drawer"],
    delPromedio: "of the average",
    promedio: "average",
    maximo: "max",
    añadir: "Add files",
    metodo: "How the drawer is chosen",
    hash: "SHA-1 hash (what Git does)",
    byte: "First character of the content",
    vaciar: "Empty",
    vacio: "0 objects · press “+10”",
    objetos: "objects",
    porCajon: "per drawer",
    cajon: "drawer",
    tope: "Limit of 1,000,000 objects.",
    claves: [
      "One drawer: a folder in .git/objects/ (00 … ff). Darker, more objects",
      "Each bar: how many objects are in that drawer",
      "The average: objects ÷ 256",
    ],
    descripcion:
      "A 16 by 16 grid of drawers, from 00 to ff, where each file you add goes to the drawer chosen by its SHA-1 hash. On the right, a chart with 256 bars showing how many objects each drawer holds and a dashed line for the average, and six figures: objects, average, lowest and highest, difference, empty drawers and pairs in the same drawer.",
    pie:
      "Every file becomes a blob and its SHA-1 (the real one, computed in your browser) picks a drawer: the first two characters of the hash. Add files and watch: with a few there are empty drawers and lots of irregularity; with hundreds of thousands they all get close to the average. Look at the difference between the fullest and the emptiest drawer: it grows in numbers but shrinks in proportion. Nobody counts or distributes anything. Switch to the second method, which picks the drawer by the first character of the content, and the same files pile up in a few drawers, because code almost always starts the same way.",
    controles: "Experiment controls: add files and choose how the drawer is decided.",
    dicho: {
      añadidos: "Added",
      cambio: "Method: ",
      vaciado: "Cabinet emptied",
    },
  },
};
let t = TEXTOS.es;

// ── El dibujo ─────────────────────────────────────────────────────────────────────────────
const W = 720, H = 372;
const G = { x: 34, y: 56, c: 17 };
const CH = { x: 352, y: 56, w: 340, h: 148 };
const hex = "0123456789abcdef";

function svg() {
  const out = [];
  out.push(`<text class="rp-tit" x="${G.x}" y="30">${t.tCajones}</text><text class="rp-tit" x="${CH.x}" y="30">${t.tObjetos}</text>`);
  // cuadrícula
  out.push(`<rect class="rp-base" x="${G.x}" y="${G.y}" width="${G.c * 16}" height="${G.c * 16}" rx="3"/>`);
  const cel = [];
  const hit = [];
  for (let i = 0; i < 256; i++) {
    const x = G.x + (i % 16) * G.c, y = G.y + Math.floor(i / 16) * G.c;
    cel.push(`<rect class="rp-calor" data-calor="${i}" x="${x + 0.5}" y="${y + 0.5}" width="${G.c - 1}" height="${G.c - 1}" rx="1.5" fill-opacity="0"/>`);
    hit.push(`<rect class="rp-hit" data-i="${i}" x="${x}" y="${y}" width="${G.c}" height="${G.c}"/>`);
  }
  out.push(cel.join(""));
  let rejilla = "";
  for (let i = 0; i <= 16; i++) rejilla += `M${G.x + i * G.c} ${G.y}V${G.y + 16 * G.c}M${G.x} ${G.y + i * G.c}H${G.x + 16 * G.c}`;
  out.push(`<path class="iso-line" data-tone="faint" d="${rejilla}"/>`);
  for (let i = 0; i < 16; i++) {
    out.push(`<text class="rp-hex" x="${G.x + i * G.c + G.c / 2}" y="${G.y - 6}" text-anchor="middle">${hex[i]}</text>`);
    out.push(`<text class="rp-hex" x="${G.x - 7}" y="${G.y + i * G.c + G.c / 2 + 2.6}" text-anchor="middle">${hex[i]}</text>`);
  }
  out.push(hit.join(""));
  // gráfica de barras
  const bw = CH.w / 256;
  out.push(`<rect class="rp-base" x="${CH.x}" y="${CH.y}" width="${CH.w}" height="${CH.h}" rx="3"/>`);
  const barras = [];
  for (let i = 0; i < 256; i++) barras.push(`<rect class="rp-barra" data-barra="${i}" x="${(CH.x + i * bw).toFixed(2)}" y="${CH.y + CH.h}" width="${(bw - 0.3).toFixed(2)}" height="0"/>`);
  out.push(barras.join(""));
  out.push(`<path class="iso-line" data-tone="lo" d="M${CH.x} ${CH.y + CH.h}H${CH.x + CH.w}"/>`);
  out.push(`<path class="rp-media" data-media d="M${CH.x} ${CH.y + CH.h}H${CH.x + CH.w}"/>`);
  out.push(`<text class="rp-hex" data-stat="tope" x="${CH.x + CH.w}" y="${CH.y - 7}" text-anchor="end"></text>`);
  for (const [x, txt, a] of [[CH.x, "00", "start"], [CH.x + CH.w / 2, "80", "middle"], [CH.x + CH.w, "ff", "end"]]) out.push(`<text class="rp-hex" x="${x}" y="${CH.y + CH.h + 13}" text-anchor="${a}">${txt}</text>`);
  // cifras
  const cols = [CH.x, CH.x + 184];
  const filas = [262, 296, 330];
  const nombres = ["n", "prom", "rango", "dif", "vacias", "parejas"];
  nombres.forEach((nombre, idx) => {
    const x = cols[idx % 2], y = filas[Math.floor(idx / 2)];
    out.push(`<text class="rp-etq" x="${x}" y="${y}">${t.stats[idx]}</text><text class="rp-val" data-stat="${nombre}" x="${x}" y="${y + 17}">—</text>`);
  });
  return k.figureSvg({ width: W, height: H, label: t.descripcion, body: out.join("") });
}

const css = `<style>
.rp-tit{fill:var(--anatomy-muted);font:500 9.5px var(--anatomy-mono);letter-spacing:.08em;text-transform:uppercase}
.rp-hex{fill:var(--anatomy-mid);font:500 8px var(--anatomy-mono)}
.rp-base{fill:var(--anatomy-face);stroke:var(--anatomy-lo);stroke-width:.6px;vector-effect:non-scaling-stroke}
.rp-calor{fill:var(--anatomy-lit)}
.rp-hit{fill:transparent;cursor:crosshair}
.rp-hit:hover{stroke:var(--anatomy-lit);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.rp-barra{fill:var(--anatomy-hi)}
.rp-barra[data-hover]{fill:var(--anatomy-lit)}
.rp-media{fill:none;stroke:var(--anatomy-lit);stroke-width:1px;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
.rp-etq{fill:var(--anatomy-muted);font:500 9px var(--anatomy-mono)}
.rp-val{fill:var(--anatomy-strong);font:600 14px var(--anatomy-mono)}
.rp-controles{display:flex;flex-wrap:wrap;gap:12px 28px;margin:16px 0 4px}
.rp-grupo{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.rp-et{margin-right:4px;font:500 11px var(--anatomy-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--anatomy-muted)}
.rp-controles button{min-height:34px;padding:0 12px;border:1px solid var(--anatomy-lo);border-radius:8px;background:var(--anatomy-card);color:var(--anatomy-text);font:500 13px var(--anatomy-mono);cursor:pointer;transition:background-color .15s,color .15s,border-color .15s}
.rp-controles button:hover{border-color:var(--anatomy-hi);color:var(--anatomy-strong)}
.rp-controles button[aria-pressed="true"]{background:var(--anatomy-strong);border-color:var(--anatomy-strong);color:var(--anatomy-card)}
.rp-controles button:focus-visible{outline:2px solid var(--anatomy-muted);outline-offset:2px}
.rp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
</style>`;

const live = () => `
const OPEN = ${JSON.stringify(OPEN)}, WORDS = ${JSON.stringify(WORDS)};
const G = ${JSON.stringify(G)}, CH = ${JSON.stringify(CH)}, LANG = ${JSON.stringify(t.lang)}, T = ${JSON.stringify(t)};
const MAX_OBJETOS = 1000000, POR_CUADRO = 6000;
${sha1w.toString()}
${archivo.toString()}

const root = document.getElementById("${FIGURE_ID}");
const readout = root.querySelector("[data-readout]");
const status = root.querySelector("[data-status]");
const stage = root.querySelector(".rp-stage");
const still = matchMedia("(prefers-reduced-motion: reduce)");
// Mismo formato que los artículos: en español, espacio para los miles y coma decimal; en inglés, al revés.
const formato = (v, d) => {
  const s = new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(v);
  return LANG.startsWith("es") ? s.replace(/,/g, " ").replace(".", ",") : s;
};
const num = { format: (v) => formato(v, 0) };
const dec = { format: (v) => formato(v, 1) };
const celdas = [...root.querySelectorAll("[data-calor]")];
const barras = [...root.querySelectorAll("[data-barra]")];
const media = root.querySelector("[data-media]");
const stat = (nombre) => root.querySelector('[data-stat="' + nombre + '"]');
const botonesModo = [...root.querySelectorAll("[data-modo]")];

const cuentas = { hash: new Int32Array(256), byte: new Int32Array(256) };
let n = 0, serial = 0, modo = "hash", pendiente = 0, frame = 0, hover = -1;

function procesar(cantidad) {
  for (let j = 0; j < cantidad; j++) {
    const contenido = archivo(serial++);
    const h = sha1w("blob " + contenido.length + "\\0" + contenido);
    cuentas.hash[h[0] >>> 24]++;
    cuentas.byte[contenido.charCodeAt(0)]++;
    n++;
  }
}

function pintar() {
  const c = cuentas[modo];
  let min = 1e9, max = 0, vacias = 0, parejas = 0;
  for (let i = 0; i < 256; i++) {
    const v = c[i];
    if (v < min) min = v;
    if (v > max) max = v;
    if (!v) vacias++;
    parejas += (v * (v - 1)) / 2;
  }
  const prom = n / 256;
  const tope = Math.max(max, 4);
  for (let i = 0; i < 256; i++) {
    const alto = (c[i] / tope) * CH.h;
    barras[i].setAttribute("y", (CH.y + CH.h - alto).toFixed(2));
    barras[i].setAttribute("height", alto.toFixed(2));
    celdas[i].setAttribute("fill-opacity", max ? (c[i] / max).toFixed(3) : "0");
  }
  const ym = CH.y + CH.h - (prom / tope) * CH.h;
  media.setAttribute("d", "M" + CH.x + " " + ym.toFixed(2) + "H" + (CH.x + CH.w));
  stat("tope").textContent = n ? T.maximo + " " + num.format(max) + " · " + T.promedio + " " + dec.format(prom) + " (- - -)" : "";
  stat("n").textContent = num.format(n);
  stat("prom").textContent = n ? dec.format(prom) : "—";
  stat("rango").textContent = n ? num.format(min) + " – " + num.format(max) : "—";
  stat("dif").textContent = n ? num.format(max - min) + " · " + num.format(Math.round(((max - min) / prom) * 100)) + " %" : "—";
  stat("vacias").textContent = n ? num.format(vacias) : "—";
  stat("parejas").textContent = n ? num.format(parejas) : "—";
  if (hover >= 0) {
    readout.textContent = T.cajon + " " + hover.toString(16).padStart(2, "0") + ": " + num.format(c[hover]) + " " + T.objetos;
  } else {
    readout.textContent = n ? num.format(n) + " " + T.objetos + " · " + num.format(min) + "–" + num.format(max) + " " + T.porCajon : T.vacio;
  }
}

function tick() {
  frame = 0;
  const cuanto = still.matches ? pendiente : Math.min(pendiente, POR_CUADRO);
  procesar(cuanto);
  pendiente -= cuanto;
  pintar();
  if (pendiente > 0) frame = requestAnimationFrame(tick);
}
function agregar(cantidad) {
  const cabe = Math.max(0, Math.min(cantidad, MAX_OBJETOS - n - pendiente));
  if (!cabe) { status.textContent = T.tope; return; }
  pendiente += cabe;
  status.textContent = T.dicho.añadidos + " " + num.format(cabe) + " · " + num.format(n + pendiente) + " " + T.objetos;
  if (!frame) frame = requestAnimationFrame(tick);
}
function vaciar() {
  pendiente = 0;
  cuentas.hash.fill(0); cuentas.byte.fill(0);
  n = 0; serial = 0;
  status.textContent = T.dicho.vaciado;
  pintar();
}
function ponerModo(nuevo) {
  modo = nuevo;
  for (const b of botonesModo) b.setAttribute("aria-pressed", String(b.dataset.modo === nuevo));
  status.textContent = T.dicho.cambio + (nuevo === "hash" ? T.hash : T.byte);
  pintar();
}

// ── Pasar el ratón por un cajón (o una barra) muestra su cuenta ──
function resaltar(i) {
  if (hover >= 0) barras[hover].removeAttribute("data-hover");
  hover = i;
  if (i >= 0) barras[i].setAttribute("data-hover", "");
  pintar();
}
stage.addEventListener("pointerover", (e) => { const r = e.target.closest("[data-i]"); if (r) resaltar(Number(r.dataset.i)); });
stage.addEventListener("pointerleave", () => resaltar(-1));

// ── Recorrido automático ──
const TOUR = [["add", 10, 1.5], ["add", 90, 1.7], ["add", 900, 1.9], ["add", 99000, 3.4], ["modo", "byte", 4.6], ["modo", "hash", 2.2], ["vaciar", 0, 1.1]];
let touring = !still.matches, paso = 0, timer = 0, visible = false, idle = 0;
function siguiente() {
  clearTimeout(timer);
  if (!touring || !visible) return;
  const [tipo, valor, espera] = TOUR[paso];
  paso = (paso + 1) % TOUR.length;
  if (tipo === "add") agregar(valor); else if (tipo === "modo") ponerModo(valor); else vaciar();
  timer = setTimeout(siguiente, espera * 1000);
}
function tomar() {
  if (touring) { touring = false; clearTimeout(timer); }
  clearTimeout(idle);
  idle = setTimeout(() => { if (still.matches) return; touring = true; paso = 0; vaciar(); ponerModo("hash"); timer = setTimeout(siguiente, 800); }, 15000);
}
root.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  tomar();
  if (b.dataset.add) agregar(Number(b.dataset.add));
  else if (b.hasAttribute("data-vaciar")) vaciar();
  else if (b.dataset.modo) ponerModo(b.dataset.modo);
});
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible && touring) { clearTimeout(timer); timer = setTimeout(siguiente, 900); } else clearTimeout(timer);
}, { rootMargin: "120px 0px" }).observe(root);
pintar();
`;

export const HASH = "reparto";

export function render(idioma = "es") {
  t = TEXTOS[idioma];
  const controles = `<div class="rp-controles" role="group" aria-label="${t.controles}"><div class="rp-grupo" role="group" aria-label="${t.añadir}"><span class="rp-et">${t.añadir}</span>${[10, 100, 1000, 100000]
    .map((v) => `<button type="button" data-add="${v}">+${t.lang.startsWith("es") ? v.toLocaleString("en-US").replace(/,/g, " ") : v.toLocaleString("en-US")}</button>`)
    .join("")}<button type="button" data-vaciar>${t.vaciar}</button></div><div class="rp-grupo" role="group" aria-label="${t.metodo}"><span class="rp-et">${t.metodo}</span><button type="button" data-modo="hash" aria-pressed="true">${t.hash}</button><button type="button" data-modo="byte" aria-pressed="false">${t.byte}</button></div></div>`;
  let figura = k.plateHtml({
    fig: t.fig,
    title: t.titulo,
    hint: t.pista,
    readout: t.vacio,
    keys: [
      { mark: "lit", label: t.claves[0] },
      { mark: "raised", label: t.claves[1] },
      { mark: "dashed", label: t.claves[2] },
    ],
    caption: t.pie,
    body: `<div class="rp-stage" role="group" aria-label="${t.descripcion}">${svg()}<span class="rp-sr" role="status" aria-live="polite" data-status></span></div>`,
  });
  const antes = figura;
  figura = figura.replace('</div><figcaption class="iso-legend">', `</div>${controles}<figcaption class="iso-legend">`);
  if (figura === antes) throw new Error("plateHtml cambió: no encuentro dónde poner los controles");
  const script = (kitScript() + live()).replace(/<\/(script)/gi, "<\\/$1");
  return `<style>${k.ISO_CSS}</style>${css}<div class="iso" data-theme="light" data-figura id="${FIGURE_ID}">${figura}</div><script type="module">${script}</script>`;
}
