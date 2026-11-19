// Genera src/data/grandes-numeros.ts: los datos de las gráficas de «La ley de los grandes números».
// Todo es reproducible: las monedas usan un generador con semilla fija y los hashes son SHA-1 reales de Git.
// Uso (desde apps/web): node scripts/datos-grandes-numeros.mjs
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";

// --- Monedas: 5 corridas de 100 000 lanzamientos (mulberry32, semilla fija) ---
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const N = 100_000;
const SEMILLAS = [7, 21, 42, 99, 2026];
const logPuntos = [...new Set([...Array.from({ length: 90 }, (_, i) => Math.round(10 ** (i / 89 * 5))), 10, 100, 1000, 10000, 100000])].sort((x, y) => x - y); // 1 … 100 000
const linPuntos = Array.from({ length: 201 }, (_, i) => i * 500 || 1);
const corridas = SEMILLAS.map((semilla) => {
  const azar = mulberry32(semilla);
  let caras = 0;
  const proporcion = [], diferencia = [];
  const enLog = new Set(logPuntos), enLin = new Set(linPuntos);
  for (let n = 1; n <= N; n++) {
    if (azar() < 0.5) caras++;
    if (enLog.has(n)) proporcion.push([n, +((caras / n) * 100).toFixed(3)]);
    if (enLin.has(n)) diferencia.push([n, +(caras - n / 2).toFixed(1)]);
  }
  return { semilla, proporcion, diferencia, finalCaras: caras };
});

// --- Carpetas: SHA-1 real de blobs «archivo i\n» (el mismo guion que reparto.mjs del subartículo anterior) ---
const reparto = (n) => {
  const c = new Array(256).fill(0);
  for (let i = 0; i < n; i++) {
    const cuerpo = `archivo ${i}\n`;
    c[createHash("sha1").update(`blob ${Buffer.byteLength(cuerpo)}\0${cuerpo}`).digest()[0]]++;
  }
  return c;
};
const estadisticas = (c, n) => {
  const media = n / 256;
  const sd = Math.sqrt(c.reduce((s, x) => s + (x - media) ** 2, 0) / 256);
  return { n, min: Math.min(...c), max: Math.max(...c), media: +media.toFixed(2), sd: +sd.toFixed(2), sdRelativa: +((sd / media) * 100).toFixed(2), vacias: c.filter((x) => x === 0).length };
};
const TAMANOS = [10, 100, 1_000, 10_000, 100_000, 1_000_000];
const carpetas = TAMANOS.map((n) => { const c = reparto(n); return { ...estadisticas(c, n), conteos: c }; });

// Un solo archivo con todo; las gráficas solo importan lo que necesitan.
mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../src/data/grandes-numeros.ts", import.meta.url),
  `// GENERADO por scripts/datos-grandes-numeros.mjs: no se edita a mano.\n` +
    `export const corridas = ${JSON.stringify(corridas)} as const;\n` +
    `export const carpetas = ${JSON.stringify(carpetas)} as const;\n`,
);
for (const c of carridasResumen()) console.log(c);
function carridasResumen() {
  return [
    ...corridas.map((r) => `moneda semilla ${r.semilla}: ${r.finalCaras} caras de ${N} (${((r.finalCaras / N) * 100).toFixed(2)} %) diferencia ${r.finalCaras - N / 2}`),
    ...carpetas.map(({ conteos, ...r }) => JSON.stringify(r)),
  ];
}
