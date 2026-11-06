// GIT · 01 · ¿Dónde guarda Git tu código?
// Figura isométrica interactiva hecha con el kit anatomy. `render(idioma)` devuelve un fragmento HTML
// (estilos + figura + script) para insertar en cualquier página; scripts/build.mjs lo escribe en dist/.
//
// Tres etapas, como en el boceto: archivo → máquina git hash-object → almacén .git/objects/
//   1 · el archivo hola.js: el letrero con el nombre se queda en la mesa; solo viaja la hoja (el contenido)
//   2 · dentro de la máquina: la ventanilla muestra lo que entra ("blob 21\0" + contenido) y el tablero
//       muestra las cinco palabras de 32 bits de SHA-1 (A–E) girando ronda a ronda; el tambor cuenta las 80 rondas
//   3 · la hoja sale con el hash estampado y entra al archivador: cajón = los 2 primeros caracteres
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const kitScript = () => readFileSync(join(HERE, "..", "kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, "");
export const FIGURE_ID = "fig-donde-guarda-git";

// ── Los textos de la figura, por idioma ───────────────────────────────────────────────────
const TEXTOS = {
  es: {
    etapa1: "1 · tu archivo",
    contenido: "contenido",
    sinNombre: "sin nombre · sin fecha",
    titulo: "Así guarda Git un archivo",
    pista: "Enter procesa · clic en la hoja cambia una letra",
    claves: [
      "La hoja: el contenido. El nombre hola.js se queda en la mesa",
      "Las cinco palabras de 32 bits de SHA-1 (A–E): 5 × 8 = 40 caracteres",
      "256 cajones, de 00 a ff: .git/objects/",
    ],
    descripcion:
      "Tres etapas sobre una placa de banco. 1: una hoja con el contenido del archivo, console.log(\"hola\");, sobre un carro; delante, un letrero con el nombre hola.js que se queda en la mesa. 2: una máquina git hash-object con un túnel; la ventanilla muestra lo que entra a SHA-1, blob 21\\0 más el contenido, y un tablero muestra las cinco palabras de 32 bits, A a E, que giran 80 rondas; un tambor cuenta las rondas. La hoja sale con el hash 8472c73b… estampado. 3: un archivador de 256 cajones, de 00 a ff, donde la hoja se guarda en el cajón 84.",
    pie:
      "1 · Tu archivo hola.js tiene un nombre y un contenido; a Git solo entra el contenido (21 bytes con el salto de línea final). 2 · git hash-object -w le antepone la cabecera blob 21\\0 y pasa todo por SHA-1: el mensaje se rellena hasta un bloque de 512 bits y las cinco palabras A–E se mezclan durante 80 rondas; al final, juntas, son el hash de 40 caracteres, 8472c73b5ad6a5727750f015fbff152a72ecea74. 3 · El objeto se guarda en .git/objects/84/72c73b… (los 2 primeros caracteres son la carpeta), comprimido con zlib. Cambia el nombre y el hash no cambia: ya existía. Cambia una letra y casi todo el hash cambia.",
    controles: "Git hash-object en tres etapas. Enter procesa la hoja; H cambia una letra del contenido; N cambia el nombre del archivo; Escape vacía el archivador.",
    vivo: {
      listo: "Enter procesa",
      entra: "entra el contenido · el nombre ",
      seQueda: " se queda",
      bloque: "bloque",
      de: "de",
      ronda: "ronda",
      cambiaron: " de 40 cambiaron",
      caracteres: " · 40 caracteres",
      nuevo: "nuevo",
      yaExistia: "ya existía",
      objeto: " objeto",
      objetos: " objetos",
      guardado: "Guardado en .git/objects/",
      existia: "Ya existía en .git/objects/",
      nadaNuevo: "/: no se guarda nada nuevo",
      otroNombre: "otro nombre, mismo contenido",
      otraLetra: "una letra distinta: h → H",
    },
  },
  en: {
    etapa1: "1 · your file",
    contenido: "content",
    sinNombre: "no name · no date",
    titulo: "How Git stores a file",
    pista: "Enter runs it · click the sheet to change a letter",
    claves: [
      "The sheet: the content. The name hola.js stays on the table",
      "The five 32-bit words of SHA-1 (A–E): 5 × 8 = 40 characters",
      "256 drawers, from 00 to ff: .git/objects/",
    ],
    descripcion:
      "Three stages on a bench plate. 1: a sheet with the content of the file, console.log(\"hola\");, on a carriage; in front of it, a sign with the name hola.js that stays on the table. 2: a git hash-object machine with a tunnel; a window shows what goes into SHA-1, blob 21\\0 plus the content, and a board shows the five 32-bit words, A to E, turning over 80 rounds; a drum counts the rounds. The sheet comes out stamped with the hash 8472c73b… 3: a cabinet of 256 drawers, from 00 to ff, where the sheet is stored in drawer 84.",
    pie:
      "1 · Your file hola.js has a name and content; only the content goes into Git (21 bytes, including the final newline). 2 · git hash-object -w prepends the header blob 21\\0 and runs it all through SHA-1: the message is padded to a 512-bit block and the five words A–E are mixed over 80 rounds; at the end, together, they are the 40-character hash, 8472c73b5ad6a5727750f015fbff152a72ecea74. 3 · The object is stored in .git/objects/84/72c73b… (the first 2 characters are the folder), compressed with zlib. Change the name and the hash stays the same: it already existed. Change one letter and almost the whole hash changes.",
    controles: "Git hash-object in three stages. Enter runs the sheet; H changes a letter of the content; N changes the file name; Escape empties the cabinet.",
    vivo: {
      listo: "Enter runs it",
      entra: "the content goes in · the name ",
      seQueda: " stays behind",
      bloque: "block",
      de: "of",
      ronda: "round",
      cambiaron: " of 40 changed",
      caracteres: " · 40 characters",
      nuevo: "new",
      yaExistia: "already there",
      objeto: " object",
      objetos: " objects",
      guardado: "Saved to .git/objects/",
      existia: "Already in .git/objects/",
      nadaNuevo: "/: nothing new is stored",
      otroNombre: "different name, same content",
      otraLetra: "one letter changed: h → H",
    },
  },
};
// El idioma que se está generando: render() lo fija antes de construir la figura.
let t = TEXTOS.es;

// ── El modelo: SHA-1 con traza de cada ronda, y el blob como lo arma Git ─────────────────
function sha1Trace(bytes) {
  const length = bytes.length;
  const padded = new Uint8Array(((length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[length] = 0x80;
  const view = new DataView(padded.buffer);
  const bits = length * 8;
  view.setUint32(padded.length - 4, bits >>> 0);
  view.setUint32(padded.length - 8, Math.floor(bits / 4294967296));
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  const blocks = [];
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (x << 1) | (x >>> 31);
    }
    let [a, b, c, d, e] = h;
    const rounds = [];
    for (let i = 0; i < 80; i++) {
      const f = i < 20 ? (b & c) | (~b & d) : i < 40 ? b ^ c ^ d : i < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d;
      const q = i < 20 ? 0x5a827999 : i < 40 ? 0x6ed9eba1 : i < 60 ? 0x8f1bbcdc : 0xca62c1d6;
      const t = (((a << 5) | (a >>> 27)) + f + e + q + w[i]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = t;
      rounds.push([a, b, c, d, e]);
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    blocks.push({ rounds, h: [...h] });
  }
  return { blocks, hash: h.map((v) => v.toString(16).padStart(8, "0")).join("") };
}
function blobOf(text) {
  const body = new TextEncoder().encode(text + "\n");
  const head = new TextEncoder().encode("blob " + body.length + "\0");
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  return { size: body.length, ...sha1Trace(all) };
}

// La figura no puede mentir: el SHA-1 propio debe coincidir con Node y con Git.
for (const text of ['console.log("hola");', 'console.log("Hola");', "", "ñandú ✓", "x".repeat(200)]) {
  const git = createHash("sha1").update(Buffer.from(`blob ${Buffer.byteLength(text + "\n")}\0${text}\n`)).digest("hex");
  if (blobOf(text).hash !== git) throw new Error(`sha1 mismatch for ${JSON.stringify(text)}`);
}
if (blobOf('console.log("hola");').hash !== "8472c73b5ad6a5727750f015fbff152a72ecea74") throw new Error("hola.js should hash to 8472c73b…");

// ── El mundo ──────────────────────────────────────────────────────────────────────────────
const WIDTH = 700;
const HEIGHT = 340;

const PLATE = { x: -254, y: -44, w: 452, d: 96, r: 10 };
const PLATE_H = 12;
const FOOT_H = 5;
const PLATE_FRONT = PLATE.y + PLATE.d;

const RAIL = { from: -246, to: 120 };
const CAR_Z = 5;
const SHEET = { w: 60, h: 38, t: 0.8, z0: 9.6 };
const SHEET_TOP = SHEET.z0 + SHEET.h;
const FACE = SHEET.t;
const TEXT_X = -27;
const EAR = 7;

// etapa 1
const S1 = -205;
// etapa 2: la máquina, con un túnel de lado a lado
const M = { x: -160, y: -26, w: 84, d: 52, r: 5 };
const M_TOP = 124;
const M_FRONT = M.y + M.d;
const M_RIGHT = M.x + M.w;
const MID = M.x + M.w / 2;
const TUNNEL = { y0: -9, y1: 9, z0: 4, z1: 52 };
const INWIN = { x0: -152, x1: -84, z0: 105, z1: 116, r: 2, depth: 2 };
const REGS = { x0: -144, cw: 7, w: 6.2, h: 7.6, top: 100, step: 9 };
const DISPLAY = { x0: -153, x1: -83, z0: 53, z1: 102.4, r: 3, depth: 3 };
const DRUM = [MID, 0];
const DRUM_Z = M_TOP + 2.4;
const DRUM_H = 10;
const DRUM_R = 18;
// entre etapas: la hoja se detiene a la vista con el hash estampado
const OUT = -42;
// etapa 3: el archivador
const C = { x: 16, y: -30, w: 118, d: 60, r: 4 };
const C_TOP = 108;
const C_FRONT = C.y + C.d;
const C_SIDE = C.x + C.w;
const GRID = { x0: 29, z0: 10, cw: 6, ch: 5.2 };
const GRID_TOP = GRID.z0 + GRID.ch * 16;
const PULL = 9;
const INSIDE = C.x + 40;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(M, 0, M_TOP), [DRUM[0], DRUM[1] - DRUM_R, DRUM_Z + DRUM_H + 3], ...k.boxCorners(C, 0, C_TOP + 3)],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 70 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 6) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
const onSide = (x, y0, z0, y1, z1, r, steps = 4) => k.pathOf(k.roundedPlan({ x: y0, y: z0, w: y1 - y0, d: z1 - z0, r }, steps).map(([y, z]) => at([x, y, z])), true);
const hex = "0123456789abcdef";

// Un hueco en una cara frontal, con sus paredes interiores sombreadas (del ejemplo desk-computer).
let clips = 0;
function recess({ x0, x1, z0, z1, r, depth }, y, back = "", backClass = "hx-well") {
  const id = `gdg-clip-${clips++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = k.pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${planeOf(y - depth)}"><path class="${backClass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    `</g>`,
    `<g transform="${planeOf(y)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // regla delante del riel
  const strip = { x: -236, y: 31, w: 230, d: 6.4, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.2, 0.6])], { size: 0.45 }));
  // las tres etapas, grabadas en el canto de la placa
  const stage = (n, x, label) => `<text class="hx-stage" data-stage="${n}" x="${x}" y="8" font-size="6" text-anchor="middle">${label}</text>`;
  out.push(`<g transform="${planeOf(PLATE_FRONT)}">${stage(1, S1, t.etapa1)}${stage(2, MID + 6, "2 · SHA-1")}${stage(3, C.x + C.w / 2, "3 · .git/objects/")}</g>`);
  return out.join("");
}

function rail() {
  const out = [];
  out.push(S(k.slabOf({ x: RAIL.from, y: -5, w: RAIL.to - RAIL.from, d: 10, r: 1.2 }, 0, 2, P, 3), { tone: "lo" }));
  out.push(S(k.slabOf({ x: RAIL.from, y: -1.5, w: RAIL.to - RAIL.from, d: 3, r: 0.8 }, 2, CAR_Z - 2, P, 3, 0.4), { tone: "mid" }));
  const pins = [];
  for (const x of [-238, -214, -190, -66, -42, -18]) pins.push(at([x, -3.4, 2]), at([x, 3.4, 2]));
  out.push(D(pins, { size: 0.4, tone: "lo" }));
  const stop = { x: RAIL.from - 6, y: -6, w: 6, d: 12, r: 1.2 };
  out.push(S(k.slabOf(stop, 0, 9, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([stop.x + 3, -3.5, 9]), at([stop.x + 3, 3.5, 9])], { size: 0.45 }));
  return out.join("");
}

// ── 1. El letrero con el nombre: se queda en la mesa ────────────────────────────────────
function namePlate() {
  const plan = { x: S1 - 19, y: 9, w: 38, d: 2, r: 0.6 };
  const out = [];
  for (const x of [S1 - 14, S1 + 12]) out.push(S(k.slabOf({ x, y: 7, w: 2, d: 6, r: 0.6 }, 0, 1.6, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf(plan, 1.6, 9, P, 2, 0.3), { tone: "hi", crease: "lo" }));
  out.push(`<g transform="${planeOf(plan.y + plan.d)}"><text class="hx-name" data-part="name" x="${S1}" y="${-(1.6 + 2.6)}" font-size="5.6" text-anchor="middle">hola.js</text></g>`);
  return `<g data-part="nameplate" class="hx-click">${out.join("")}</g>`;
}

// ── La hoja sobre su carro (construida en x = 0; la parte viva la traslada) ──────────────
function carriage(which) {
  const base = { x: -SHEET.w / 2 - 2, y: -5, w: SHEET.w + 4, d: 10, r: 2 };
  const out = [`<path class="iso-halo" d="${k.haloOf(base, CAR_Z, 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(base, CAR_Z, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(D([-26, -12, 12, 26].map((x) => at([x, 3.6, CAR_Z + 4])), { size: 0.4, tone: "lo" }));
  out.push(S(k.slabOf({ x: -SHEET.w / 2 - 1, y: -1.6, w: SHEET.w + 2, d: 1.6, r: 0.5 }, CAR_Z + 4, 2.6, P, 2), { tone: "mid" }));
  const top = SHEET_TOP;
  const right = SHEET.w / 2;
  const face = [
    // esquina doblada
    `<path class="hx-ear" d="M${right - EAR} ${-top}L${right} ${-(top - EAR)}H${right - EAR}Z"/>`,
    `<path class="iso-line" data-tone="lo" d="M${right - EAR} ${-top}V${-(top - EAR)}H${right}"/>`,
    which === "b"
      ? `<text class="hx-head" x="${TEXT_X}" y="${-(top - 6.4)}" font-size="3.6" data-part="head-b">blob 21\\0</text>`
      : `<text class="hx-head" x="${TEXT_X}" y="${-(top - 6.4)}" font-size="3.6">${t.contenido}</text>`,
    `<text class="hx-code" data-part="code-${which}" x="${TEXT_X}" y="${-(top - 16)}" font-size="4.4">console.log("hola");</text>`,
    `<path class="iso-line" data-tone="faint" d="M${-SHEET.w / 2} ${-(top - 21)}H${right}"/>`,
  ];
  if (which === "b") {
    face.push(`<text class="hx-lead" data-part="lead" x="${TEXT_X}" y="${-(top - 30)}" font-size="6"></text>`);
    face.push(`<text class="hx-hashtext" data-part="rest" x="${TEXT_X + 9}" y="${-(top - 30)}" font-size="4.6"></text>`);
  } else {
    face.push(`<text class="hx-head" x="${TEXT_X}" y="${-(top - 30)}" font-size="3.6">${t.sinNombre}</text>`);
  }
  const sheet = [
    S(k.slabOf({ x: -SHEET.w / 2, y: 0, w: SHEET.w, d: SHEET.t, r: 0.3 }, SHEET.z0, SHEET.h, P, 2), { tone: "hi", crease: "lo", lit: true }),
    `<g transform="${planeOf(FACE)}">${face.join("")}</g>`,
  ].join("");
  out.push(`<g data-part="sheet-${which}" class="hx-click">${sheet}</g>`);
  out.push(S(k.slabOf({ x: -SHEET.w / 2 - 1, y: FACE, w: SHEET.w + 2, d: 1.6, r: 0.5 }, CAR_Z + 4, 2.6, P, 2), { tone: "mid" }));
  out.push(D([at([-SHEET.w / 2 + 1, FACE + 1.6, CAR_Z + 5.3]), at([SHEET.w / 2 - 1, FACE + 1.6, CAR_Z + 5.3])], { size: 0.4 }));
  return out.join("");
}

// ── 2. La máquina git hash-object, por dentro ─────────────────────────────────────────────
function machine() {
  const out = [`<path class="iso-halo" d="${k.haloOf(M, 0, 8, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(M, 3), 0, 4, P, 6), { tone: "lo" }));
  out.push(S(k.slabOf(M, 4, M_TOP - 4, P, 6, 1.4), { tone: "mid", inner: L(k.sideSeam(M, 118, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(M, 3.6), M_TOP, P, 4), { tone: "faint" }));
  out.push(D(k.corners(M, 6).map(([x, y]) => at([x, y, M_TOP])), { size: 0.45 }));
  out.push(L(Array.from({ length: 5 }, (_, i) => k.planOutline({ x: M.x + 66 + i * 3.4, y: -20, w: 1.4, d: 12, r: 0.7 }, M_TOP, P, 3)).join(""), { tone: "faint" }));
  // ventanilla de entrada: lo que realmente se pasa a SHA-1
  const inText = [
    `<text class="hx-in" x="${INWIN.x0 + 1.6}" y="${-(INWIN.z0 + 3.6)}" font-size="3.6"><tspan class="hx-in-head" data-part="in-head">blob 21\\0</tspan><tspan data-part="in-body">console.log("hola");\\n</tspan></text>`,
  ].join("");
  out.push(recess(INWIN, M_FRONT, inText, "hx-glass"));
  // tablero de registros: las cinco palabras de 32 bits (A–E), 8 caracteres hex cada una
  const regs = [];
  for (let row = 0; row < 5; row++) {
    const cz = REGS.top - row * REGS.step - REGS.h / 2;
    regs.push(`<text class="hx-reglabel" x="${REGS.x0 - 4.6}" y="${(-cz + 1.3).toFixed(2)}" font-size="3.6" text-anchor="middle">${"ABCDE"[row]}</text>`);
    for (let col = 0; col < 8; col++) {
      const i = row * 8 + col;
      const cx = REGS.x0 + col * REGS.cw + REGS.w / 2;
      const box = flat(-REGS.w / 2, -REGS.h / 2, REGS.w / 2, REGS.h / 2, 0.7, 3);
      regs.push(`<g class="hx-flap" data-flap="${i}"${i < 2 ? " data-lead" : ""} transform="translate(${cx.toFixed(2)} ${(-cz).toFixed(2)})"><path class="hx-card" d="${box}"/><text class="hx-char" y="2.1" font-size="5.8" text-anchor="middle"></text><path class="hx-split" d="M${-REGS.w / 2} 0H${REGS.w / 2}"/><path class="iso-line" data-tone="lo" d="${box}"/></g>`);
    }
  }
  out.push(recess(DISPLAY, M_FRONT, regs.join(""), "hx-glass"));
  // placa con el comando y rejilla
  const label = { x0: -151, x1: -85, z0: 34, z1: 44 };
  out.push(S(k.slabOf({ x: label.x0, y: M_FRONT, w: label.x1 - label.x0, d: 0.8, r: 0.6 }, label.z0, label.z1 - label.z0, P, 2), { tone: "lo", crease: "none" }));
  out.push(`<g transform="${planeOf(M_FRONT + 0.8)}"><text class="hx-cmd" x="${(label.x0 + label.x1) / 2}" y="${-(label.z0 + 3.2)}" font-size="4.4" text-anchor="middle">git hash-object -w</text></g>`);
  out.push(D([at([label.x0 + 2, M_FRONT + 0.8, label.z1 - 2]), at([label.x1 - 2, M_FRONT + 0.8, label.z1 - 2])], { size: 0.4 }));
  out.push(`<g transform="${planeOf(M_FRONT)}">${L(Array.from({ length: 12 }, (_, i) => flat(-146 + i * 4.6, 12, -144.6 + i * 4.6, 26, 0.7, 3)).join(""), { tone: "lo" })}</g>`);
  out.push(`<g data-part="led">${D([at([-84, M_FRONT, 20])], { size: 0.9, tone: "hi" })}</g>`);
  // la salida del túnel en el costado derecho, con su pared superior
  const hole = [[TUNNEL.y0, TUNNEL.z0], [TUNNEL.y1, TUNNEL.z0], [TUNNEL.y1, TUNNEL.z1], [TUNNEL.y0, TUNNEL.z1]];
  out.push(`<path class="hx-hole" d="${k.pathOf(hole.map(([y, z]) => at([M_RIGHT, y, z])), true)}"/>`);
  out.push(L(onSide(M_RIGHT, TUNNEL.y0, TUNNEL.z0, TUNNEL.y1, TUNNEL.z1, 0.01, 1), { tone: "lo" }));
  out.push(L(onSide(M_RIGHT, TUNNEL.y0 - 2.4, TUNNEL.z0, TUNNEL.y1 + 2.4, TUNNEL.z1 + 2.4, 1.6, 3), { tone: "faint" }));
  out.push(L(Array.from({ length: 5 }, (_, i) => onSide(M_RIGHT, -22 + i * 2.6, 70, -20.8 + i * 2.6, 100, 0.6)).join(""), { tone: "faint" }));
  // el tambor SHA-1: 80 marcas, una por ronda
  const [x, y] = DRUM;
  out.push(S(k.cylinder(x, y, DRUM_R + 3, M_TOP, 2.4, P, 56), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, DRUM_R, DRUM_Z, DRUM_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DRUM_R, DRUM_Z + 2, DRUM_Z + DRUM_H - 2, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, DRUM_R, DRUM_Z + 2, P, 40) + k.sideArc(x, y, DRUM_R, DRUM_Z + DRUM_H - 2, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, DRUM_R - 2.4, DRUM_Z + DRUM_H, P, 56), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, DRUM_R - 2.4, 80, 10, DRUM_Z + DRUM_H, [1, 2.4], P);
  out.push(L(ticks.minor, { tone: "faint" }), L(ticks.major, { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 4, DRUM_Z + DRUM_H, 2, P, 24), { tone: "mid" }));
  return `<g class="hx-machine hx-click" data-part="machine">${out.join("")}</g>`;
}

const needleAt = (turn) => {
  const [x, y] = DRUM;
  const top = DRUM_Z + DRUM_H;
  const a = turn * Math.PI * 2;
  return k.lineOnTop([x + Math.sin(a) * 4.2, y - Math.cos(a) * 4.2], [x + Math.sin(a) * (DRUM_R - 3.6), y - Math.cos(a) * (DRUM_R - 3.6)], top + 0.1, P);
};

// ── 3. El archivador .git/objects/ ───────────────────────────────────────────────────────
function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(C, 0, 10, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(C, 3), 0, 5, P, 4), { tone: "lo" }));
  out.push(S(k.slabOf(C, 5, C_TOP - 5, P, 4, 1), { tone: "mid", inner: L(k.sideSeam(C, 8, P, 4), { tone: "faint" }) }));
  out.push(S(k.slabOf(k.insetPlan(C, -1.6), C_TOP, 3, P, 4, 0.8), { tone: "mid" }));
  const top = C_TOP + 3;
  out.push(L(k.planOutline(k.insetPlan(C, 3), top, P, 4), { tone: "faint" }));
  out.push(D(k.corners(C, 5).map(([x, y]) => at([x, y, top])), { size: 0.45 }));
  const label = { x: C.x + 14, y: -12, w: 50, d: 13, r: 1.2 };
  out.push(S(k.slabOf(label, top, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.4), top + 0.8, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 8.6], top + 0.8, P, "x"), ".git/objects/", { size: 5, tone: "hi" }));
  const face = [];
  face.push(L(flat(GRID.x0 - 1, GRID.z0 - 1, GRID.x0 + GRID.cw * 16 + 1, GRID_TOP + 1, 1.2, 3), { tone: "lo" }));
  const fronts = [];
  const pulls = [];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const x0 = GRID.x0 + c * GRID.cw;
      const z1 = GRID_TOP - r * GRID.ch;
      fronts.push(flat(x0 + 0.45, z1 - GRID.ch + 0.45, x0 + GRID.cw - 0.45, z1 - 0.45, 0.5, 2));
      pulls.push(at([x0 + GRID.cw / 2, C_FRONT, z1 - GRID.ch / 2]));
    }
  }
  face.push(L(fronts.join(""), { tone: "lo" }));
  for (let i = 0; i < 16; i++) {
    face.push(`<text class="hx-index" data-col="${hex[i]}" x="${GRID.x0 + i * GRID.cw + GRID.cw / 2}" y="${-(GRID_TOP + 2.6)}" font-size="3.2" text-anchor="middle">${hex[i]}</text>`);
    face.push(`<text class="hx-index" data-row="${hex[i]}" x="${GRID.x0 - 4.4}" y="${-(GRID_TOP - i * GRID.ch - GRID.ch / 2 - 1.1)}" font-size="3.2" text-anchor="middle">${hex[i]}</text>`);
  }
  out.push(`<g transform="${planeOf(C_FRONT)}">${face.join("")}</g>`);
  out.push(D(pulls, { size: 0.28, tone: "lo" }));
  out.push(L(onSide(C_SIDE, C.y + 6, 14, C_FRONT - 6, C_TOP - 8, 2.4, 4), { tone: "faint" }));
  out.push(D([[C.y + 9, 17], [C_FRONT - 9, 17], [C.y + 9, C_TOP - 11], [C_FRONT - 9, C_TOP - 11]].map(([y, z]) => at([C_SIDE, y, z])), { size: 0.45 }));
  for (const y of [-24, 10]) out.push(S(k.slabOf({ x: C_SIDE, y: y - 2, w: 3, d: 4, r: 1 }, 72, 4, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: C_SIDE + 3, y: -26, w: 2.6, d: 38, r: 1.2 }, 71.6, 4.8, P, 3, 0.4), { tone: "mid" }));
  return `<g class="hx-cabinet">${out.join("")}</g>`;
}

// la hoja que sale del túnel se recorta en el plano del costado derecho de la máquina
const exitX = at([M_RIGHT, TUNNEL.y1, 0])[0];

const svg = () => k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: t.descripcion,
  body: [
    plate(),
    rail(),
    `<g data-part="car-a" transform="${k.translateAlong(P, [S1, 0, 0])}">${carriage("a")}</g>`,
    namePlate(),
    machine(),
    `<path data-part="needle" class="iso-line" data-tone="hi" data-free="end" d="${needleAt(0)}" style="stroke-width:1"/>`,
    `<clipPath id="gdg-exit"><rect x="${exitX.toFixed(2)}" y="-50" width="${WIDTH}" height="${HEIGHT + 100}"/></clipPath>`,
    `<g clip-path="url(#gdg-exit)"><g data-part="car-b" style="display:none">${carriage("b")}</g></g>`,
    cabinet(),
    `<g data-part="trail" class="hx-trail" transform="${planeOf(C_FRONT)}"></g>`,
    `<g data-part="drawers"></g>`,
  ],
});

// ── La parte viva ─────────────────────────────────────────────────────────────────────────
const live = () => `
const P = ${JSON.stringify(P)};
const S1 = ${S1}, MID = ${MID}, OUT = ${OUT}, INSIDE = ${INSIDE}, M_RIGHT = ${M_RIGHT};
const C_FRONT = ${C_FRONT}, PULL = ${PULL}, GRID = ${JSON.stringify(GRID)}, GRID_TOP = ${GRID_TOP};
const DRUM = ${JSON.stringify(DRUM)}, DRUM_Z = ${DRUM_Z}, DRUM_H = ${DRUM_H}, DRUM_R = ${DRUM_R};
const TEXT_X = ${TEXT_X};
const ZERO = "\\\\0";
const T = ${JSON.stringify(t.vivo)};
${sha1Trace.toString()}
${blobOf.toString()}
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};

const root = document.getElementById("${FIGURE_ID}");
const stage = root.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = root.querySelector("[data-readout]");
const status = root.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (name) => svg.querySelector('[data-part="' + name + '"]');
const flapEls = [...svg.querySelectorAll("[data-flap] text")];
const carA = $("car-a"), carB = $("car-b"), sheetA = $("sheet-a"), sheetB = $("sheet-b");
const codeA = $("code-a"), codeB = $("code-b"), headB = $("head-b"), leadEl = $("lead"), restEl = $("rest");
const nameEl = $("name"), inHead = $("in-head"), inBody = $("in-body"), needleEl = $("needle"), drawersEl = $("drawers"), trailEl = $("trail");
const stageEls = [...svg.querySelectorAll("[data-stage]")];
const indexEls = [...svg.querySelectorAll("[data-row], [data-col]")];
const ROUND = 0.03;

let name = "hola.js", text = 'console.log("hola");';
let state = "ready", clock = 0, carX = S1, carTarget = S1, sheetOn = true;
let job = null, block = 0, round = -1, roundClock = 0, lastHash = null, changed = -1, filed = "", result = "", note = "";
const store = new Map();
const drawers = new Map();
let frame = 0, previous = 0, visible = false, touring = !still.matches, idleTimer = 0;

const TOUR = [
  { do: "send", wait: 1.6 },
  { do: "rename", name: "copia.js", note: T.otroNombre, wait: 1.8 },
  { do: "send", wait: 0.3 },
  { do: "edit", name: "hola.js", text: 'console.log("Hola");', note: T.otraLetra, wait: 1.8 },
  { do: "send", wait: 0.3 },
  { do: "hold", wait: 3.4 },
  { do: "reset", wait: 1.0 },
];
let tour = { step: 0, wait: 1.6 };

const hex8 = (v) => v.toString(16).padStart(8, "0");
function showWords(words) {
  const all = words.map(hex8).join("");
  for (let i = 0; i < 40; i++) if (flapEls[i].textContent !== all[i]) flapEls[i].textContent = all[i];
}
function writeSheet() {
  nameEl.textContent = name;
  codeA.textContent = text;
  codeB.textContent = text;
  const b = blobOf(text);
  headB.textContent = "blob " + b.size + ZERO;
  inHead.textContent = "blob " + b.size + ZERO;
  inBody.textContent = text + "\\\\n";
}
function setFile(nextName, nextText) {
  if (state !== "ready") return;
  name = nextName;
  text = nextText;
  result = "";
  writeSheet();
  say();
}
function send() {
  if (state !== "ready") return;
  job = blobOf(text);
  note = "";
  carTarget = MID;
  enter("toMachine");
}
function finishHash() {
  showWords(job.blocks[job.blocks.length - 1].h);
  changed = -1;
  if (lastHash) { changed = 0; for (let i = 0; i < 40; i++) if (lastHash[i] !== job.hash[i]) changed++; }
  lastHash = job.hash;
  leadEl.textContent = job.hash.slice(0, 2);
  restEl.textContent = job.hash.slice(2, 12) + "…";
  restEl.setAttribute("x", (TEXT_X + leadEl.getComputedTextLength() + 1.6).toFixed(2));
  status.textContent = "SHA-1: " + job.hash;
}
function file() {
  const prefix = job.hash.slice(0, 2);
  const list = store.get(prefix) || [];
  const fresh = !list.includes(job.hash);
  if (fresh) list.push(job.hash);
  store.set(prefix, list);
  filed = job.hash;
  for (const [key, d] of drawers) if (key !== prefix) d.target = 0;
  const d = drawers.get(prefix) || { ext: 0, target: 0, drop: 0, bump: 0 };
  d.target = PULL;
  if (fresh) d.drop = still.matches ? 0 : 1; else d.bump = still.matches ? 0 : 1;
  drawers.set(prefix, d);
  hot(prefix);
  const total = [...store.values()].reduce((sum, l) => sum + l.length, 0);
  result = "objects/" + prefix + "/" + job.hash.slice(2, 8) + "… · " + (fresh ? T.nuevo : T.yaExistia) + " · " + total + (total === 1 ? T.objeto : T.objetos);
  status.textContent = fresh ? T.guardado + prefix + "/" + job.hash.slice(2) : T.existia + prefix + T.nadaNuevo;
}
const cellPath = (r, c) => {
  const x0 = GRID.x0 + c * GRID.cw, z1 = GRID_TOP - r * GRID.ch;
  return pathOf(roundedPlan({ x: x0 + 0.45, y: z1 - GRID.ch + 0.45, w: GRID.cw - 0.9, d: GRID.ch - 0.9, r: 0.5 }, 2).map(([u, z]) => [u, -z]), true);
};
function hot(prefix) {
  for (const el of indexEls) el.toggleAttribute("data-hot", !!prefix && (el.dataset.row === prefix[0] || el.dataset.col === prefix[1]));
  if (!prefix) { trailEl.innerHTML = ""; return; }
  const r = parseInt(prefix[0], 16), c = parseInt(prefix[1], 16);
  const cells = [];
  for (let i = 0; i < c; i++) cells.push(cellPath(r, i));
  for (let i = 0; i < r; i++) cells.push(cellPath(i, c));
  trailEl.innerHTML = '<path class="hx-trail-cells" d="' + cells.join("") + '"/><path class="hx-trail-cell" d="' + cellPath(r, c) + '"/>';
}
function reset() {
  store.clear();
  for (const d of drawers.values()) d.target = 0;
  hot("");
  lastHash = null; filed = ""; result = ""; note = "";
  for (const el of flapEls) el.textContent = "";
  if (state === "ready") { name = "hola.js"; text = 'console.log("hola");'; writeSheet(); }
  say();
  run();
}
function enter(next) {
  state = next;
  clock = 0;
  const n = state === "ready" ? 1 : state === "toMachine" || state === "sha" ? 2 : 3;
  for (const el of stageEls) el.toggleAttribute("data-hot", Number(el.dataset.stage) === n || (state === "out" && Number(el.dataset.stage) === 2));
  say();
  run();
}
function say() {
  let line;
  if (state === "ready") line = note || result || (name + " · " + blobOf(text).size + " B · " + T.listo);
  else if (state === "toMachine") line = T.entra + name + T.seQueda;
  else if (state === "sha") line = round < 0 ? "SHA-1 · " + T.bloque + " " + (block + 1) + " " + T.de + " " + job.blocks.length : "SHA-1 · " + T.bloque + " " + (block + 1) + "/" + job.blocks.length + " · " + T.ronda + " " + (round + 1) + "/80";
  else if (state === "out" || state === "toCab") line = "hash " + job.hash.slice(0, 8) + "…" + (changed >= 0 ? " · " + changed + T.cambiaron : T.caracteres);
  else line = result;
  if (readout.textContent !== line) readout.textContent = line;
}

function drawerSvg(prefix, d) {
  const r = parseInt(prefix[0], 16), c = parseInt(prefix[1], 16);
  const x0 = GRID.x0 + c * GRID.cw, z1 = GRID_TOP - r * GRID.ch, zb = z1 - GRID.ch;
  const ext = d.ext;
  const out = [];
  const hole = [[x0 + 0.45, zb + 0.45], [x0 + GRID.cw - 0.45, zb + 0.45], [x0 + GRID.cw - 0.45, z1 - 0.45], [x0 + 0.45, z1 - 0.45]];
  out.push('<path class="hx-dark" style="opacity:' + Math.min(1, ext / 3).toFixed(2) + '" d="' + pathOf(hole.map(([x, z]) => iso([x, C_FRONT, z], P)), true) + '"/>');
  if (ext > 1.4) {
    const box = { x: x0 + 0.8, y: C_FRONT, w: GRID.cw - 1.6, d: ext - 1, r: 0.3 };
    out.push(solidSvg(slabOf(box, zb + 0.8, 2.8, P, 2), { tone: "mid", crease: "faint" }));
    out.push('<path class="hx-dark" d="' + pathOf(roundedPlan(insetPlan(box, 0.4), 2).map(([x, y]) => iso([x, y, zb + 3.6], P)), true) + '"/>');
    const shown = (store.get(prefix) || []).slice(-3);
    shown.forEach((hash, i) => {
      const last = hash === filed;
      const y = C_FRONT + ext - 2.2 - (shown.length - 1 - i) * 1.8;
      if (y < C_FRONT + 0.6) return;
      const lift = last ? d.drop * 8 + Math.sin(Math.min(1, d.bump) * Math.PI) * 1.4 : 0;
      out.push(solidSvg(slabOf({ x: x0 + 1.3, y: y - 0.5, w: GRID.cw - 2.6, d: 0.5, r: 0.1 }, zb + 1.4 + lift, 6.4, P, 1), { tone: last ? "hi" : "mid", lit: last, crease: "none" }));
    });
  }
  out.push(solidSvg(slabOf({ x: x0 + 0.45, y: C_FRONT + ext - 1, w: GRID.cw - 0.9, d: 1, r: 0.3 }, zb + 0.45, GRID.ch - 0.9, P, 2, 0.25), { tone: "hi", crease: "lo", lit: true }));
  if (ext > PULL * 0.6) out.push(faceTextSvg(sideMatrix([0, C_FRONT + ext], 0, P, "left") + " translate(" + (x0 + GRID.cw / 2) + " " + -(zb + 1.3) + ")", prefix, { size: 2.6, tone: "hi", anchor: "middle" }));
  return out.join("");
}
function drawDrawers() {
  const centre = (p) => [GRID.x0 + parseInt(p[1], 16) * GRID.cw, C_FRONT, GRID_TOP - parseInt(p[0], 16) * GRID.ch];
  const open = [...drawers].filter(([, d]) => d.ext > 0.05).sort((a, b) => depthOf(centre(a[0]), P) - depthOf(centre(b[0]), P));
  drawersEl.innerHTML = open.map(([prefix, d]) => drawerSvg(prefix, d)).join("");
}

function tourStep(dt) {
  if (state !== "ready") return;
  tour.wait -= dt;
  if (tour.wait > 0) return;
  const step = TOUR[tour.step];
  tour.step = (tour.step + 1) % TOUR.length;
  tour.wait = step.wait;
  if (step.do === "send") send();
  else if (step.do === "rename") { setFile(step.name, text); note = step.note; say(); }
  else if (step.do === "edit") { setFile(step.name, step.text); note = step.note; say(); }
  else if (step.do === "reset") reset();
}

const ease = (value, target, dt, tau) => value + (target - value) * (1 - Math.exp(-dt / tau));
function tick(now) {
  const dt = previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60;
  previous = now;
  const calm = still.matches;
  if (touring) tourStep(dt);
  clock += dt;
  let busy = touring || state !== "ready";

  carX = calm ? carTarget : ease(carX, carTarget, dt, 0.34);
  if (Math.abs(carX - carTarget) < 0.2) carX = carTarget;
  const arrived = carX === carTarget;
  const past = carX > MID;
  carA.style.display = past ? "none" : "";
  carB.style.display = past ? "" : "none";
  (past ? carB : carA).setAttribute("transform", translateAlong(P, [carX, 0, 0]));
  sheetA.style.display = sheetOn ? "" : "none";
  sheetB.style.display = sheetOn ? "" : "none";

  if (state === "toMachine" && arrived) { block = 0; round = -1; roundClock = 0; enter("sha"); }
  else if (state === "sha") {
    roundClock += dt;
    if (calm) { finishHash(); carTarget = OUT; enter("out"); }
    while (roundClock >= ROUND && state === "sha") {
      roundClock -= ROUND;
      if (round < 79) { round++; showWords(job.blocks[block].rounds[round]); needleEl.setAttribute("d", needleAt((round + 1) / 80)); }
      else if (block < job.blocks.length - 1) { showWords(job.blocks[block].h); block++; round = -1; roundClock = -0.35; }
      else { finishHash(); carTarget = OUT; enter("out"); break; }
    }
    say();
  } else if (state === "out" && arrived && clock > 2.2) { carTarget = INSIDE; enter("toCab"); }
  else if (state === "toCab" && arrived) { file(); enter("filed"); }
  else if (state === "filed" && clock > 0.6) { sheetOn = false; carTarget = S1; enter("return"); }
  else if (state === "return" && arrived) { sheetOn = true; writeSheet(); enter("ready"); }

  let moved = false;
  for (const [key, d] of drawers) {
    const ext0 = d.ext;
    d.ext = calm ? d.target : ease(d.ext, d.target, dt, 0.16);
    if (Math.abs(d.target - d.ext) < 0.02) d.ext = d.target;
    if (d.ext > PULL * 0.85 && d.drop > 0) { d.drop = Math.max(0, d.drop - dt / 0.35); moved = true; }
    if (d.ext > PULL * 0.85 && d.bump > 0) { d.bump += dt / 0.5; if (d.bump >= 2) d.bump = 0; moved = true; }
    if (d.ext !== ext0) moved = true;
    if (d.ext === 0 && d.target === 0) drawers.delete(key);
  }
  if (moved) { drawDrawers(); busy = true; }
  frame = visible && busy ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { previous = 0; frame = requestAnimationFrame(tick); } }
function takeOver() {
  if (touring) { touring = false; tour = { step: 0, wait: 1.6 }; note = ""; say(); }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (still.matches) return; touring = true; tour = { step: 0, wait: 0.8 }; reset(); run(); }, 12000);
}
const toggleLetter = () => setFile(name, text.includes('"hola"') ? 'console.log("Hola");' : 'console.log("hola");');
const toggleName = () => setFile(name === "hola.js" ? "copia.js" : "hola.js", text);
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key;
  if (key === "Tab") return;
  takeOver();
  if (key === "Enter" || key === " ") { event.preventDefault(); send(); }
  else if (key === "h" || key === "H") { event.preventDefault(); toggleLetter(); }
  else if (key === "n" || key === "N") { event.preventDefault(); toggleName(); }
  else if (key === "Escape") { event.preventDefault(); reset(); }
});
svg.addEventListener("click", (event) => {
  takeOver();
  if (event.target.closest('[data-part="sheet-a"]')) toggleLetter();
  else if (event.target.closest('[data-part="nameplate"]')) toggleName();
  else if (event.target.closest('[data-part="machine"]')) send();
  stage.focus({ preventScroll: true });
});
writeSheet();
enter("ready");
`;

const css = `<style>
.hx-glass{fill:var(--anatomy-shade-0)}
.hx-well{fill:var(--anatomy-shade-1)}
.hx-dark{fill:var(--anatomy-shade-0)}
.hx-hole{fill:#050505}
.iso[data-theme="light"] .hx-hole{fill:#bdbdb9}
.hx-card{fill:var(--anatomy-face)}
.hx-ear{fill:var(--anatomy-shade-1)}
.hx-split{fill:none;stroke:var(--anatomy-shade-0);stroke-width:.5px;vector-effect:non-scaling-stroke}
.hx-char{fill:var(--anatomy-hi);font-family:var(--anatomy-mono);font-weight:500}
[data-lead] .hx-char{fill:var(--anatomy-lit);font-weight:700}
[data-lead] .hx-card{fill:var(--anatomy-lit-shade)}
.hx-reglabel{fill:var(--anatomy-mid);font-family:var(--anatomy-mono);font-weight:600}
.hx-in{fill:var(--anatomy-hi);font-family:var(--anatomy-mono)}
.hx-in-head{fill:var(--anatomy-lit);font-weight:700}
.hx-code{fill:var(--anatomy-lit);font-family:var(--anatomy-mono);font-weight:600}
.hx-head{fill:var(--anatomy-mid);font-family:var(--anatomy-mono)}
.hx-lead{fill:var(--anatomy-lit);font-family:var(--anatomy-mono);font-weight:700}
.hx-hashtext{fill:var(--anatomy-hi);font-family:var(--anatomy-mono)}
.hx-name{fill:var(--anatomy-hi);font-family:var(--anatomy-mono);font-weight:600}
.hx-cmd{fill:var(--anatomy-hi);font-family:var(--anatomy-mono);font-weight:600}
.hx-index{fill:var(--anatomy-mid);font-family:var(--anatomy-mono)}
.hx-index[data-hot]{fill:var(--anatomy-lit);font-weight:700}
.hx-trail path{fill:none;vector-effect:non-scaling-stroke;animation:hx-in .5s var(--anatomy-ease) both}
.hx-trail-cells{stroke:var(--anatomy-hi);stroke-width:.8px}
.hx-trail-cell{stroke:var(--anatomy-lit);stroke-width:1.2px}
@keyframes hx-in{from{opacity:0}}
.hx-stage{fill:var(--anatomy-mid);font-family:var(--anatomy-mono);letter-spacing:.04em;transition:fill .3s var(--anatomy-ease)}
.hx-stage[data-hot]{fill:var(--anatomy-lit);font-weight:700}
.hx-click{cursor:pointer}
.hx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage{touch-action:pan-y}
.iso-stage:focus{outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
</style>`;

const first = blobOf('console.log("hola");');
const body = () =>
  css +
  k.plateHtml({
    fig: "GIT · 01",
    title: t.titulo,
    hint: t.pista,
    readout: `hola.js · ${first.size} B · ${t.vivo.listo}`,
    keys: [
      { mark: "lit", label: t.claves[0] },
      { mark: "raised", label: t.claves[1] },
      { mark: "flat", label: t.claves[2] },
    ],
    caption: t.pie,
    body: `<div class="iso-stage" tabindex="0" role="group" aria-label="${t.controles}">${svg()}<span class="hx-sr" role="status" aria-live="polite" data-status></span></div>`,
  });

export const HASH = first.hash;

// Fragmento para insertar en una página: el tema lo pone la página (data-theme en el contenedor .iso).
export function render(idioma = "es") {
  t = TEXTOS[idioma];
  clips = 0;
  const script = (kitScript() + live()).replace(/<\/(script)/gi, "<\\/$1");
  return `<style>${k.ISO_CSS}</style><div class="iso" data-theme="light" data-figura id="${FIGURE_ID}">${body()}</div><script type="module">${script}</script>`;
}
