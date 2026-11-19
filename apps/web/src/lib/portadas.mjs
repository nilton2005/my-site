// Portadas abstractas del diario: escenas de naturaleza hechas de partículas y algo de código.
// Se generan como SVG estático con una semilla fija (cada compilación da la misma imagen).
// Los colores salen de variables CSS, así que siguen el tema claro/oscuro de la página.

const TAU = Math.PI * 2;

// Generador pseudoaleatorio con semilla (mulberry32)
export function rng(semilla) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Lienzo {
  constructor(W, H, semilla) {
    this.W = W; this.H = H;
    this.r = rng(semilla);
    this.capas = new Map(); // "clase|opacidad" → comandos de path
    this.textos = [];
  }
  rnd(a = 0, b = 1) { return a + this.r() * (b - a); }
  // Un punto es un cuadradito: muchos puntos de la misma capa van en un solo <path>
  punto(x, y, { capa = "p", tam = 1.6, alfa = 1 } = {}) {
    if (alfa <= 0.04 || x < -4 || y < -4 || x > this.W + 4 || y > this.H + 4) return;
    const clave = `${capa}|${Math.min(1, Math.round(alfa * 10) / 10)}`;
    const t = +tam.toFixed(1);
    if (!this.capas.has(clave)) this.capas.set(clave, []);
    this.capas.get(clave).push(`M${(x - t / 2).toFixed(1)} ${(y - t / 2).toFixed(1)}h${t}v${t}h-${t}z`);
  }
  // Línea punteada con un poco de temblor (parece dibujada con partículas)
  linea(x1, y1, x2, y2, { paso = 5, temblor = 0.6, ...op } = {}) {
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / paso));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      this.punto(x1 + (x2 - x1) * t + this.rnd(-temblor, temblor), y1 + (y2 - y1) * t + this.rnd(-temblor, temblor), op);
    }
  }
  // Curva de Bézier cúbica punteada; alfa puede ser una función de t
  curva(p0, p1, p2, p3, { paso = 5, temblor = 0.6, alfa = 1, ...op } = {}) {
    const B = (t) => {
      const u = 1 - t;
      return [u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0], u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]];
    };
    let largo = 0, prev = B(0);
    for (let i = 1; i <= 20; i++) { const q = B(i / 20); largo += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; }
    const n = Math.max(2, Math.round(largo / paso));
    for (let i = 0; i <= n; i++) {
      const t = i / n, [x, y] = B(t);
      this.punto(x + this.rnd(-temblor, temblor), y + this.rnd(-temblor, temblor), { ...op, alfa: typeof alfa === "function" ? alfa(t) : alfa });
    }
    return B;
  }
  // Reparte los puntos por longitud de arco (por ángulo se amontonarían en las puntas de una elipse chata)
  elipse(cx, cy, rx, ry, rotacion = 0, { paso = 4, ...op } = {}) {
    const c = Math.cos(rotacion), s = Math.sin(rotacion);
    const perimetro = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    const n = Math.max(6, Math.round(perimetro / paso)), d = perimetro / n;
    let a = this.rnd(0, TAU), recorrido = 0;
    for (let i = 0; i < n; i++) {
      const lx = Math.cos(a) * rx, ly = Math.sin(a) * ry;
      this.punto(cx + lx * c - ly * s + this.rnd(-0.4, 0.4), cy + lx * s + ly * c + this.rnd(-0.4, 0.4), op);
      // avanzar el ángulo lo justo para recorrer «d» sobre la curva
      for (recorrido = 0; recorrido < d; ) { const v = Math.hypot(rx * Math.sin(a), ry * Math.cos(a)) || 1; const da = Math.min(0.05, (d - recorrido) / v); a += da; recorrido += v * da; }
    }
  }
  texto(x, y, str, { capa = "p2", tam = 11, alfa = 0.6 } = {}) { this.textos.push({ x, y, str, capa, tam, alfa }); }
  // viewBox: encuadre (por defecto, la escena entera). colores: valores fijos en vez de variables CSS
  // (los necesita resvg para la imagen de redes, que no entiende var()).
  svg(etiqueta, { viewBox = `0 0 ${this.W} ${this.H}`, colores = null } = {}) {
    const color = (capa) => (colores ? ` fill="${colores[capa]}"` : ` class="${capa}"`);
    const paths = [...this.capas].map(([clave, cmds]) => {
      const [capa, alfa] = clave.split("|");
      return `<path${color(capa)}${alfa !== "1" ? ` fill-opacity="${alfa}"` : ""} d="${cmds.join("")}"/>`;
    });
    const textos = this.textos.map((t) => `<text${color(t.capa)} x="${t.x.toFixed(1)}" y="${t.y.toFixed(1)}" font-size="${t.tam}" fill-opacity="${t.alfa}" font-family="ui-monospace, Consolas, monospace" text-anchor="middle" dominant-baseline="middle">${t.str}</text>`);
    const estilo = colores ? "" : `<style>.escena .p{fill:var(--particula)}.escena .p2{fill:var(--particula-2)}</style>`;
    return `<svg class="escena" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${etiqueta}">` +
      estilo + paths.join("") + textos.join("") + `</svg>`;
  }
}

const GLIFOS = ["0x", "a3", "f9", "{", "}", "=>", "7e", "#", "1", "0"];
const hex2 = (n) => n.toString(16).padStart(2, "0");

// Polvo de fondo: deja vivo el espacio vacío sin distraer
function polvo(L, n, desvanecer) {
  for (let i = 0; i < n; i++) {
    const x = L.rnd(0, L.W), y = L.rnd(0, L.H), a = L.rnd(0.15, 0.45) * desvanecer(x, y);
    if (L.r() < 0.08) L.texto(x, y, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: a * 0.8, tam: 10 });
    else L.punto(x, y, { capa: "p2", tam: L.rnd(1, 1.8), alfa: a });
  }
}

// ======================================================================
// «¿Dónde guarda Git tu código?» — Una abeja deja una gota en una celda.
// Las celdas no tienen nombre: algunas llevan grabados dos caracteres.
// ======================================================================
export function colmena({ semilla = 84, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  // La escena vive a la derecha; a la izquierda queda aire para el título
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 120) / 520));
  polvo(L, 260, desvanecer);

  // Panal: hexágonos de punta plana, en una mancha irregular
  const R = 36, dx = R * 1.5, dy = R * Math.sqrt(3);
  const centro = [850, 330];
  const celdas = [];
  for (let c = -9; c <= 9; c++) for (let f = -6; f <= 6; f++) {
    const x = centro[0] + c * dx, y = centro[1] + f * dy + (c & 1 ? dy / 2 : 0);
    const ang = Math.atan2(y - centro[1], x - centro[0]);
    const borde = 300 + Math.sin(ang * 3 + 1.3) * 45 + Math.sin(ang * 5) * 25; // contorno orgánico
    const d = Math.hypot((x - centro[0]) * 0.95, (y - centro[1]) * 1.25) / borde;
    if (d < 1 && L.r() > d * d * 0.55) celdas.push({ x, y, d });
  }
  // La celda destino: la más cercana a la abeja
  const abeja = [560, 205];
  const destino = celdas.reduce((m, c) => (Math.hypot(c.x - abeja[0] - 90, c.y - abeja[1] - 40) < Math.hypot(m.x - abeja[0] - 90, m.y - abeja[1] - 40) ? c : m));
  const etiquetas = new Set();
  for (const c of celdas) {
    const vis = (1 - c.d ** 2.2) * desvanecer(c.x);
    const esDestino = c === destino;
    // Pared de cera (un poco más chica que la celda: entre dos celdas se ven dos paredes)
    for (let k = 0; k < 6; k++) {
      const a1 = (k / 6) * TAU, a2 = ((k + 1) / 6) * TAU, r = R * 0.86;
      L.linea(c.x + Math.cos(a1) * r, c.y + Math.sin(a1) * r, c.x + Math.cos(a2) * r, c.y + Math.sin(a2) * r,
        { paso: esDestino ? 3.2 : 4.6, alfa: esDestino ? 1 : vis * 0.85, tam: esDestino ? 2 : 1.5 });
    }
    const tirada = L.r();
    if (!esDestino && tirada < 0.32 * (1 - c.d)) {
      // Celda con miel (contenido): partículas dentro
      const n = Math.round(L.rnd(30, 70));
      for (let i = 0; i < n; i++) {
        const a = L.rnd(0, TAU), rr = Math.sqrt(L.r()) * R * 0.66;
        L.punto(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, { alfa: vis * L.rnd(0.35, 0.8), tam: L.rnd(1, 1.8) });
      }
    } else if (!esDestino && tirada > 0.86 && vis > 0.35) {
      // Algunas celdas vacías llevan grabados dos caracteres, como las carpetas de .git/objects
      let e; do { e = hex2((L.r() * 256) | 0); } while (etiquetas.has(e) || e === "84");
      etiquetas.add(e);
      L.texto(c.x, c.y, e, { alfa: vis * 0.6, tam: 11 });
    }
  }
  L.texto(destino.x, destino.y + 1, "84", { capa: "p", alfa: 0.95, tam: 13 });

  // Abeja: cuerpo con rayas, cabeza, alas, antenas; vuela hacia la celda destino
  const dir = Math.atan2(destino.y - abeja[1], destino.x - abeja[0]);
  const c = Math.cos(dir), s = Math.sin(dir);
  const E = 1.6; // tamaño de la abeja
  const enAbeja = (lx, ly) => [abeja[0] + (lx * c - ly * s) * E, abeja[1] + (lx * s + ly * c) * E];
  L.elipse(abeja[0], abeja[1], 27 * E, 15 * E, dir, { paso: 2.8, tam: 1.9 });
  for (const lx of [-12, -3, 6]) { const [x1, y1] = enAbeja(lx, -14), [x2, y2] = enAbeja(lx, 14); L.linea(x1, y1, x2, y2, { paso: 2.4, tam: 2.1 }); }
  const [hx, hy] = enAbeja(36, 0);
  L.elipse(hx, hy, 10 * E, 9 * E, dir, { paso: 2.6, tam: 1.9 });
  for (const lado of [-1, 1]) {
    const [wx, wy] = enAbeja(-4, -24 * lado);
    L.elipse(wx, wy, 24 * E, 10 * E, dir - 0.5 * lado, { paso: 3.2, tam: 1.4, alfa: 0.55 });
    const [a0x, a0y] = enAbeja(42, 4 * lado), [a1x, a1y] = enAbeja(56, 14 * lado), [a2x, a2y] = enAbeja(62, 10 * lado);
    L.curva([a0x, a0y], [a1x, a1y], [a1x, a1y], [a2x, a2y], { paso: 2.4, tam: 1.3 });
  }
  const [sx, sy] = enAbeja(-30, 0), [tx, ty] = enAbeja(-38, 0);
  L.linea(sx, sy, tx, ty, { paso: 2, tam: 1.6 });
  // La gota (el contenido) que lleva entre las patas
  const [gx, gy] = enAbeja(14, 26);
  for (let i = 0; i < 60; i++) { const a = L.rnd(0, TAU), rr = Math.sqrt(L.r()); L.punto(gx + Math.cos(a) * 10 * rr, gy + Math.sin(a) * 10 * rr - (Math.sin(a) < 0 ? rr * 6 * Math.abs(Math.cos(a)) : 0), { tam: 1.7 }); }
  // Estela del vuelo: viene de lejos, con algunos caracteres sueltos
  const B = L.curva([120, 470], [300, 520], [330, 180], enAbeja(-40, 0), { paso: 7, temblor: 1.2, tam: 1.4, alfa: (t) => t * 0.55 });
  for (const t of [0.35, 0.55, 0.72]) { const [x, y] = B(t); L.texto(x + L.rnd(-10, 10), y - 14, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: t * 0.5, tam: 10 }); }
  return { lienzo: L, etiqueta: "Una abeja hecha de partículas lleva una gota a una celda del panal", encuadre: "400 80 800 400" };
}

// ======================================================================
// «¿Quién decide en qué carpeta va cada objeto?» — Un diente de león al viento.
// Las semillas vuelan al azar pero cada parcela del campo recibe casi lo mismo.
// ======================================================================
export function dienteDeLeon({ semilla = 256, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.15, (x - 100) / 480));
  polvo(L, 220, desvanecer);

  const C = [900, 215]; // centro de la cabeza
  // Tallo
  L.curva([945, H + 10], [930, 470], [880, 360], [C[0], C[1] + 14], { paso: 3.2, tam: 1.8, capa: "p2", alfa: 0.9 });
  L.curva([952, H + 10], [938, 470], [888, 360], [C[0] + 4, C[1] + 16], { paso: 3.6, tam: 1.4, capa: "p2", alfa: 0.6 });
  // Hojas dentadas en la base
  for (const [lado, alto] of [[-1, 520], [1, 560]]) {
    const base = [940, H], punta = [940 + lado * 170, alto];
    L.curva(base, [base[0] + lado * 40, alto + 40], [punta[0] - lado * 60, punta[1] + 10], punta, { paso: 4, capa: "p2", alfa: 0.55, tam: 1.4 });
    for (let k = 1; k < 5; k++) { const t = k / 5, x = base[0] + (punta[0] - base[0]) * t, y = base[1] + (punta[1] - base[1]) * t; L.linea(x, y, x + lado * 10, y - 16, { paso: 3, capa: "p2", alfa: 0.5, tam: 1.3 }); }
  }
  // Núcleo
  for (let i = 0; i < 70; i++) { const a = L.rnd(0, TAU), rr = Math.sqrt(L.r()) * 15; L.punto(C[0] + Math.cos(a) * rr, C[1] + Math.sin(a) * rr, { tam: 1.8 }); }

  // Vilano: una semilla con su sombrilla de pelitos
  const semillaEn = (x, y, ang, escala = 1, alfa = 1) => {
    const lx = Math.cos(ang), ly = Math.sin(ang);
    const largo = 26 * escala;
    L.linea(x, y, x + lx * largo, y + ly * largo, { paso: 2.6, tam: 1.2, alfa: alfa * 0.8, temblor: 0.3 });
    const px = x + lx * largo, py = y + ly * largo;
    for (let k = 0; k < 9; k++) {
      const a = ang + (k / 8 - 0.5) * 2.1, l = 13 * escala;
      L.linea(px, py, px + Math.cos(a) * l, py + Math.sin(a) * l, { paso: 2.4, tam: 1, alfa: alfa * 0.65, temblor: 0.2 });
    }
    L.punto(x, y, { tam: 2.2, alfa });
  };
  // Cabeza: semillas en todas direcciones, menos el lado del viento (ya se fueron)
  for (let i = 0; i < 72; i++) {
    const ang = (i / 72) * TAU + L.rnd(-0.04, 0.04);
    const a = ((ang % TAU) + TAU) % TAU;
    if (a > 2.5 && a < 4.2 && L.r() < 0.85) continue;
    const r0 = 16, r1 = L.rnd(78, 96);
    L.linea(C[0] + Math.cos(ang) * r0, C[1] + Math.sin(ang) * r0, C[0] + Math.cos(ang) * r1, C[1] + Math.sin(ang) * r1, { paso: 5, tam: 1, alfa: 0.45, temblor: 0.3 });
    const px = C[0] + Math.cos(ang) * r1, py = C[1] + Math.sin(ang) * r1;
    for (let k = 0; k < 5; k++) { const b = ang + (k / 4 - 0.5) * 1.8; L.linea(px, py, px + Math.cos(b) * 13, py + Math.sin(b) * 13, { paso: 3.2, tam: 1, alfa: 0.6, temblor: 0.2 }); }
  }

  // Campo: 16 parcelas abajo. Las semillas caen al azar, pero cada parcela termina con casi lo mismo
  const campo = { x0: 150, x1: 1130, y: 585, n: 16 };
  const ancho = (campo.x1 - campo.x0) / campo.n;
  L.linea(campo.x0, campo.y, campo.x1, campo.y, { paso: 4, capa: "p2", alfa: 0.5, tam: 1.3 });
  for (let k = 0; k <= campo.n; k++) {
    const x = campo.x0 + k * ancho;
    L.linea(x, campo.y - 6, x, campo.y + 6, { paso: 2, capa: "p2", alfa: 0.6 * desvanecer(x), tam: 1.3 });
  }
  for (let k = 0; k < campo.n; k++) {
    const x = campo.x0 + k * ancho, cant = 11 + Math.round(L.rnd(-2, 2));
    for (let i = 0; i < cant; i++) L.punto(x + L.rnd(6, ancho - 6), campo.y - L.rnd(4, 16), { tam: L.rnd(1.4, 2.2), alfa: desvanecer(x) * L.rnd(0.55, 0.95) });
    if (k % 5 === 0) L.texto(x + ancho / 2, campo.y + 22, hex2(k * 16), { alfa: 0.45 * desvanecer(x), tam: 10 });
  }

  // Semillas en vuelo: salen de la cabeza, el viento las lleva a la izquierda y bajan al campo
  // Repartidas a lo largo del viaje: unas recién salen, otras ya casi llegan al campo
  for (let i = 0; i < 16; i++) {
    const salida = [C[0] - L.rnd(70, 95), C[1] + L.rnd(-40, 40)];
    const llegada = [campo.x0 + 30 + ((i * 7) % 16) * ((campo.x1 - campo.x0 - 160) / 15), campo.y - 30];
    const t = 0.12 + (i / 15) * 0.8 + L.rnd(-0.04, 0.04);
    const p1 = [salida[0] - L.rnd(120, 260), salida[1] - L.rnd(60, 140)], p2 = [llegada[0] + L.rnd(-80, 120), llegada[1] - L.rnd(150, 260)];
    const B = L.curva(salida, p1, p2, llegada, { paso: 9, temblor: 1, capa: "p2", tam: 1.1, alfa: (u) => (u < t ? 0.3 * (u / t) : 0) });
    const [x, y] = B(t), [x2, y2] = B(Math.min(1, t + 0.02));
    const vuelo = Math.atan2(y2 - y, x2 - x);
    semillaEn(x, y, vuelo + Math.PI + L.rnd(-0.4, 0.4) - Math.PI / 2 + 1.2, L.rnd(0.8, 1.05), desvanecer(x) * 0.95 + 0.05);
  }
  // Ráfagas de viento con algún carácter
  for (let i = 0; i < 4; i++) {
    const y = L.rnd(120, 420), x0 = L.rnd(700, 820);
    const B = L.curva([x0, y], [x0 - 200, y - 40], [x0 - 380, y + 40], [x0 - 600, y - 10], { paso: 8, capa: "p2", tam: 1.1, alfa: (u) => Math.sin(u * Math.PI) * 0.35 });
    const [gx, gy] = B(0.5); L.texto(gx, gy - 10, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: 0.35, tam: 10 });
  }
  return { lienzo: L, etiqueta: "Un diente de león de partículas suelta sus semillas, que caen repartidas en un campo dividido en parcelas", encuadre: "330 120 870 500" };
}

// ======================================================================
// «La ley de los grandes números» — Lluvia sobre un estanque.
// Con pocas gotas el agua se ve desordenada; con muchas, pareja. Encima, una libélula
// que zigzaguea al principio y luego vuela recto: la proporción que se acerca al 50 %.
// ======================================================================
export function lluvia({ semilla = 10000, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 120) / 480));
  polvo(L, 200, desvanecer);

  // Orilla y superficie del agua
  const agua = 330;
  L.curva([360, agua], [600, agua - 6], [900, agua + 6], [1200, agua - 2], { paso: 5, capa: "p2", alfa: (t) => 0.25 + t * 0.4, tam: 1.3 });
  // Juncos a la derecha
  for (let i = 0; i < 7; i++) {
    const x = 1080 + i * 17 + L.rnd(-5, 5), alto = L.rnd(120, 230), curva = L.rnd(-30, 10);
    L.curva([x, agua + 20], [x, agua - alto * 0.4], [x + curva, agua - alto * 0.8], [x + curva * 1.4, agua - alto], { paso: 4, capa: "p2", tam: 1.3, alfa: 0.7 });
    if (i % 3 === 0) L.elipse(x + curva * 1.4, agua - alto - 14, 4, 15, 0.15, { paso: 2.4, tam: 1.5, alfa: 0.8 });
  }
  // Gotas: la densidad crece hacia la derecha (pocas → muchas)
  const ondas = (x, y, r, alfa) => {
    // Dos anillos chatos: el de afuera más tenue (la onda que se abre)
    L.elipse(x, y, r, r * 0.2, 0, { paso: 3.6, tam: 1.4, alfa });
    L.elipse(x, y, r * 1.9, r * 0.36, 0, { paso: 5.5, tam: 1.1, alfa: alfa * 0.45 });
  };
  const columnas = 24;
  for (let c = 0; c < columnas; c++) {
    const x0 = 430 + c * 29, cuantas = Math.round(1 + (c / (columnas - 1)) ** 2.2 * 11);
    for (let i = 0; i < cuantas; i++) {
      // Al principio las gotas caen donde quieren; luego se reparten parejo en la franja
      const orden = c / (columnas - 1);
      const y = agua + 24 + (orden > 0.5 ? ((i + 0.5) / cuantas) * 240 + L.rnd(-6, 6) : L.rnd(0, 240) ** 1.05);
      const x = x0 + L.rnd(-12, 12);
      const vis = desvanecer(x) * (0.35 + 0.65 * (1 - (y - agua) / 300));
      ondas(x, y, L.rnd(9, 14) * (1 - orden * 0.3) * (0.7 + (y - agua) / 400), vis * 0.8);
    }
    // Hilos de lluvia en el aire
    for (let i = 0; i < Math.ceil(cuantas / 3); i++) {
      const x = x0 + L.rnd(-12, 12), y = L.rnd(60, agua - 30);
      L.linea(x, y, x - 3, y + L.rnd(10, 22), { paso: 3, tam: 1.1, alfa: 0.4 * desvanecer(x), temblor: 0.2 });
    }
  }
  // Vuelo de la libélula: zigzag grande que se va aplanando (amplitud ~ 1/√n)
  const nivel = 215, puntosVuelo = [];
  for (let i = 0; i <= 260; i++) {
    const t = i / 260, x = 300 + t * 690;
    const amp = 120 / Math.sqrt(1 + t * 60);
    puntosVuelo.push([x, nivel + Math.sin(t * 46 + Math.sin(t * 7) * 2) * amp]);
  }
  for (const [i, [x, y]] of puntosVuelo.entries()) if (i % 2 === 0) L.punto(x, y, { capa: "p2", tam: 1.2, alfa: 0.55 * desvanecer(x) });
  // La libélula al final del vuelo
  const [lx, ly] = puntosVuelo[puntosVuelo.length - 1];
  // Cuerpo largo con segmentos, cabeza con ojos grandes y cuatro alas en X
  L.linea(lx - 78, ly + 4, lx + 4, ly, { paso: 2.2, tam: 2 });
  for (let k = 1; k < 7; k++) { const x = lx - 74 + k * 10; L.linea(x, ly - 2.5, x, ly + 4.5, { paso: 1.6, tam: 1.2, alfa: 0.7 }); }
  L.elipse(lx + 13, ly - 1, 9, 8, 0, { paso: 2.2, tam: 1.9 });
  L.elipse(lx + 17, ly - 5, 3.5, 3.5, 0, { paso: 1.5, tam: 1.4 });
  for (const [dx, ang, largo] of [[-2, -2.2, 64], [-2, 2.2, 64], [-12, -2.6, 56], [-12, 2.6, 56]]) {
    const cx = lx + dx + Math.cos(ang) * largo * 0.5, cy = ly + Math.sin(ang) * largo * 0.5;
    L.elipse(cx, cy, largo * 0.5, 9, ang, { paso: 3.2, tam: 1.3, alfa: 0.6 });
    L.linea(lx + dx, ly, lx + dx + Math.cos(ang) * largo * 0.9, ly + Math.sin(ang) * largo * 0.9, { paso: 4, tam: 1, alfa: 0.35 });
  }
  // Una marca discreta del 50 %: la altura donde el vuelo ya no se mueve
  L.texto(lx + 60, ly + 2, "0.5", { alfa: 0.5, tam: 10 });
  return { lienzo: L, etiqueta: "Lluvia de partículas sobre un estanque y una libélula cuyo vuelo se va aplanando", encuadre: "390 100 810 420" };
}

// ======================================================================
// «Pensar en probabilidades, no en 0 o 1» — Un hormiguero.
// Cada hormiga camina al azar; entre todas forman un camino firme hasta la hoja.
// ======================================================================
export function hormigas({ semilla = 1997, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 120) / 480));
  polvo(L, 200, desvanecer);

  const nido = [520, 500], hoja = [1030, 190];
  // Hormiguero: un montículo con su entrada
  L.curva([440, 520], [470, 470], [570, 470], [600, 520], { paso: 3, capa: "p2", tam: 1.6, alfa: 0.8 });
  for (let i = 0; i < 90; i++) { const a = L.rnd(Math.PI, TAU), r = Math.sqrt(L.r()); L.punto(520 + Math.cos(a) * 75 * r, 520 + Math.sin(a) * 45 * r, { capa: "p2", tam: L.rnd(1, 1.8), alfa: L.rnd(0.25, 0.6) }); }
  L.elipse(nido[0], nido[1] + 4, 10, 5, 0, { paso: 2, tam: 1.6 });
  L.linea(380, 522, 1180, 522, { paso: 6, capa: "p2", alfa: 0.35, tam: 1.2 });

  // La hoja (la comida)
  const angHoja = -0.5;
  const enHoja = (lx, ly) => [hoja[0] + lx * Math.cos(angHoja) - ly * Math.sin(angHoja), hoja[1] + lx * Math.sin(angHoja) + ly * Math.cos(angHoja)];
  for (const lado of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(enHoja(-90 + t * 180, lado * Math.sin(t * Math.PI) * 48 * (1 - t * 0.25))); }
    for (const [x, y] of pts) L.punto(x + L.rnd(-0.5, 0.5), y + L.rnd(-0.5, 0.5), { tam: 1.7 });
    for (let k = 1; k < 6; k++) { const t = k / 6, [x0, y0] = enHoja(-90 + t * 180, 0), [x1, y1] = enHoja(-90 + t * 180 + 26, lado * Math.sin(t * Math.PI) * 38); L.linea(x0, y0, x1, y1, { paso: 3, tam: 1.1, alfa: 0.55 }); }
  }
  { const [a0, b0] = enHoja(-110, 0), [a1, b1] = enHoja(90, 0); L.linea(a0, b0, a1, b1, { paso: 3, tam: 1.3, alfa: 0.7 }); }

  // Una hormiga: abdomen, tórax, cabeza, seis patas y antenas
  const hormiga = (x, y, ang, alfa = 1, carga = null) => {
    const c = Math.cos(ang), s = Math.sin(ang), en = (lx, ly) => [x + lx * c - ly * s, y + lx * s + ly * c];
    for (const [lx, rx, ry] of [[-6, 4.2, 3], [0, 2.4, 2], [5, 2.6, 2.3]]) { const [cx, cy] = en(lx, 0); L.elipse(cx, cy, rx, ry, ang, { paso: 2.1, tam: 1.2, alfa }); }
    for (const lado of [-1, 1]) {
      for (const k of [-1, 0, 1]) { const [a, b] = en(k * 1.6, 0), [d, e] = en(k * 3.5 - 1, lado * 6); L.linea(a, b, d, e, { paso: 2.2, tam: 0.9, alfa: alfa * 0.8, temblor: 0.1 }); }
      const [a, b] = en(7, lado * 1), [d, e] = en(12, lado * 4); L.linea(a, b, d, e, { paso: 1.6, tam: 0.9, alfa: alfa * 0.8, temblor: 0.1 });
    }
    if (carga) { const [cx, cy] = en(12, 0); L.texto(cx, cy - 6, carga, { capa: "p", alfa: alfa * 0.8, tam: 9 }); }
  };

  // Exploradoras: caminatas al azar que salen del nido (cada una por su lado)
  for (let i = 0; i < 26; i++) {
    let x = nido[0] + L.rnd(-20, 20), y = nido[1] - 6, ang = L.rnd(-Math.PI * 0.95, -Math.PI * 0.05);
    const pasos = Math.round(L.rnd(40, 110));
    for (let k = 0; k < pasos; k++) {
      ang += L.rnd(-0.55, 0.55);
      x += Math.cos(ang) * 6; y += Math.sin(ang) * 6;
      if (y > 515) { y = 515; ang = -Math.abs(ang); }
      if (k % 2 === 0) L.punto(x, y, { capa: "p2", tam: 1, alfa: 0.22 * desvanecer(x) });
    }
    hormiga(x, y, ang, 0.85 * desvanecer(x));
  }
  // El camino: entre todas lo marcan, y ya no es azar
  const B = L.curva([nido[0] + 6, nido[1] - 8], [700, 420], [820, 330], enHoja(-88, 0), { paso: 3.4, temblor: 1.4, tam: 1.3, alfa: 0.45 });
  const cargas = ["0x", null, "1", null, "f9", null, null, "a3", null, "0"];
  for (let i = 0; i < 18; i++) {
    const t = 0.05 + (i / 17) * 0.9, [x, y] = B(t), [x2, y2] = B(Math.min(1, t + 0.01));
    const vuelta = i % 2 === 1; // unas van, otras vuelven con un pedacito
    hormiga(x + L.rnd(-4, 4), y + L.rnd(-4, 4), Math.atan2(y2 - y, x2 - x) + (vuelta ? Math.PI : 0), 1, vuelta ? cargas[i % cargas.length] : null);
  }
  return { lienzo: L, etiqueta: "Un hormiguero de partículas: hormigas que caminan al azar y, entre todas, un camino firme hasta una hoja", encuadre: "390 90 810 450" };
}

// ======================================================================
// Qué escena lleva cada artículo (las dos versiones de idioma comparten la misma).
// Para un artículo nuevo: escribe su escena arriba y agrégala aquí.
// ======================================================================
const ESCENAS = {
  "donde-guarda-git": colmena,
  "where-git-stores-your-code": colmena,
  "como-reparte-git-sus-objetos": dienteDeLeon,
  "how-git-spreads-its-objects": dienteDeLeon,
  "ley-de-los-grandes-numeros": lluvia,
  "law-of-large-numbers": lluvia,
  "pensar-en-probabilidades": hormigas,
  "thinking-in-probabilities": hormigas,
};

const cache = new Map();
const escenaDe = (id) => {
  if (!ESCENAS[id]) return null;
  const fn = ESCENAS[id];
  if (!cache.has(fn)) cache.set(fn, fn());
  return cache.get(fn);
};

export const tienePortada = (id) => Boolean(ESCENAS[id]);

/** SVG de la portada recortada para el banner del artículo (colores con las variables CSS del tema). */
export function portadaBanner(id) {
  const e = escenaDe(id);
  return e ? e.lienzo.svg(e.etiqueta, { viewBox: e.encuadre }) : null;
}

/** SVG de la escena entera con colores fijos, para la imagen de redes (1200 × 630). */
export function portadaCompleta(id, colores) {
  const e = escenaDe(id);
  return e ? e.lienzo.svg(e.etiqueta, { colores }) : null;
}
