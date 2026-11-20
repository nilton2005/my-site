// Portadas abstractas del diario: escenas de naturaleza hechas de partículas y algo de código.
// Se generan como SVG estático con una semilla fija (cada compilación da la misma imagen).
// Los colores salen de variables CSS (--particula, --particula-2, --accent), así que siguen el tema claro/oscuro.

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
      return [
        u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
        u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1],
      ];
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
      this.punto(cx + lx * c - ly * s + this.rnd(-0.35, 0.35), cy + lx * s + ly * c + this.rnd(-0.35, 0.35), op);
      for (recorrido = 0; recorrido < d; ) {
        const v = Math.hypot(rx * Math.sin(a), ry * Math.cos(a)) || 1;
        const da = Math.min(0.05, (d - recorrido) / v);
        a += da;
        recorrido += v * da;
      }
    }
  }
  // Relleno orgánico interior dentro de una elipse rotada
  rellenoElipse(cx, cy, rx, ry, rotacion = 0, n = 24, op = {}) {
    const c = Math.cos(rotacion), s = Math.sin(rotacion);
    for (let i = 0; i < n; i++) {
      const a = this.rnd(0, TAU), rr = Math.sqrt(this.r());
      const lx = Math.cos(a) * rx * rr, ly = Math.sin(a) * ry * rr;
      this.punto(cx + lx * c - ly * s, cy + lx * s + ly * c, op);
    }
  }
  texto(x, y, str, { capa = "p2", tam = 11, alfa = 0.6 } = {}) { this.textos.push({ x, y, str, capa, tam, alfa }); }
  // viewBox: encuadre (por defecto, la escena entera). colores: valores fijos en vez de variables CSS
  // (los necesita resvg para la imagen de redes, que no entiende var()).
  svg(etiqueta, { viewBox = `0 0 ${this.W} ${this.H}`, colores = null } = {}) {
    const color = (capa) => (colores ? ` fill="${colores[capa] ?? colores.p}"` : ` class="${capa}"`);
    const paths = [...this.capas].map(([clave, cmds]) => {
      const [capa, alfa] = clave.split("|");
      return `<path${color(capa)}${alfa !== "1" ? ` fill-opacity="${alfa}"` : ""} d="${cmds.join("")}"/>`;
    });
    const textos = this.textos.map((t) => `<text${color(t.capa)} x="${t.x.toFixed(1)}" y="${t.y.toFixed(1)}" font-size="${t.tam}" fill-opacity="${t.alfa}" font-family="ui-monospace, Consolas, monospace" text-anchor="middle" dominant-baseline="middle">${t.str}</text>`);
    const estilo = colores ? "" : `<style>.escena .p{fill:var(--particula)}.escena .p2{fill:var(--particula-2)}.escena .a{fill:var(--accent)}</style>`;
    return `<svg class="escena" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${etiqueta}">` +
      estilo + paths.join("") + textos.join("") + `</svg>`;
  }
}

const GLIFOS = ["0x", "a3", "f9", "{", "}", "=>", "7e", "#", "1", "0"];
const hex2 = (n) => n.toString(16).padStart(2, "0");

// Polvo de fondo: deja vivo el espacio vacío sin distraer
function polvo(L, n, desvanecer) {
  for (let i = 0; i < n; i++) {
    const x = L.rnd(0, L.W), y = L.rnd(0, L.H), a = L.rnd(0.14, 0.42) * desvanecer(x, y);
    if (L.r() < 0.08) L.texto(x, y, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: a * 0.78, tam: 10 });
    else L.punto(x, y, { capa: "p2", tam: L.rnd(1, 1.7), alfa: a });
  }
}

// ======================================================================
// «¿Dónde guarda Git tu código?» — Una abeja deja una gota en una celda.
// Las celdas no tienen nombre: algunas llevan grabados dos caracteres.
// ======================================================================
export function colmena({ semilla = 84, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 160) / 500));
  polvo(L, 240, desvanecer);

  // Panal: hexágonos de punta plana, desplazado a la derecha para convivir limpio con el título
  const R = 36, dx = R * 1.5, dy = R * Math.sqrt(3);
  const centro = [900, 325];
  const celdas = [];
  for (let c = -8; c <= 8; c++) for (let f = -6; f <= 6; f++) {
    const x = centro[0] + c * dx, y = centro[1] + f * dy + (c & 1 ? dy / 2 : 0);
    const ang = Math.atan2(y - centro[1], x - centro[0]);
    const borde = 290 + Math.sin(ang * 3 + 1.3) * 44 + Math.sin(ang * 5) * 24;
    const d = Math.hypot((x - centro[0]) * 0.94, (y - centro[1]) * 1.24) / borde;
    if (d < 1 && L.r() > d * d * 0.55) celdas.push({ x, y, d });
  }
  // Abeja en vuelo hacia la celda destino (totalmente libre del texto en la tarjeta OG)
  const abeja = [725, 162];
  const destino = celdas.reduce((m, c) =>
    Math.hypot(c.x - (abeja[0] + 62), c.y - (abeja[1] + 92)) < Math.hypot(m.x - (abeja[0] + 62), m.y - (abeja[1] + 92)) ? c : m
  );
  const etiquetas = new Set();
  for (const c of celdas) {
    const vis = (1 - c.d ** 2.2) * desvanecer(c.x);
    const esDestino = c === destino;
    for (let k = 0; k < 6; k++) {
      const a1 = (k / 6) * TAU, a2 = ((k + 1) / 6) * TAU, r = R * 0.86;
      L.linea(c.x + Math.cos(a1) * r, c.y + Math.sin(a1) * r, c.x + Math.cos(a2) * r, c.y + Math.sin(a2) * r, {
        capa: esDestino ? "a" : "p",
        paso: esDestino ? 2.8 : 4.6,
        alfa: esDestino ? 1 : vis * 0.85,
        tam: esDestino ? 2.1 : 1.5,
      });
      if (esDestino) {
        const rIn = R * 0.75;
        L.linea(c.x + Math.cos(a1) * rIn, c.y + Math.sin(a1) * rIn, c.x + Math.cos(a2) * rIn, c.y + Math.sin(a2) * rIn, {
          capa: "p", paso: 5, alfa: 0.45, tam: 1.2,
        });
      }
    }
    const tirada = L.r();
    if (!esDestino && tirada < 0.34 * (1 - c.d)) {
      const n = Math.round(L.rnd(32, 68));
      for (let i = 0; i < n; i++) {
        const a = L.rnd(0, TAU), rr = Math.sqrt(L.r()) * R * 0.64;
        L.punto(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, { capa: L.r() < 0.25 ? "a" : "p", alfa: vis * L.rnd(0.32, 0.78), tam: L.rnd(1, 1.7) });
      }
    } else if (!esDestino && tirada > 0.86 && vis > 0.35) {
      let e; do { e = hex2((L.r() * 256) | 0); } while (etiquetas.has(e) || e === "84");
      etiquetas.add(e);
      L.texto(c.x, c.y, e, { alfa: vis * 0.62, tam: 11 });
    }
  }
  L.texto(destino.x, destino.y + 1, "84", { capa: "a", alfa: 1, tam: 14 });

  // Abeja con anatomía clara: abdomen rayado + aguijón, tórax peludo, cabeza con ojo, alas venadas desde el tórax y patas sosteniendo la gota
  const dir = Math.atan2(destino.y - abeja[1], destino.x - abeja[0]);
  const ca = Math.cos(dir), sa = Math.sin(dir);
  const E = 1.42;
  const enAbeja = (lx, ly) => [abeja[0] + (lx * ca - ly * sa) * E, abeja[1] + (lx * sa + ly * ca) * E];

  // Abdomen ligeramente ahusado hacia el aguijón (x de -30 a +6)
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU;
    const ct = Math.cos(a), st = Math.sin(a);
    const lx = -12 + ct * 19;
    const ly = st * 12.2 * (0.86 + 0.14 * ct);
    L.punto(...enAbeja(lx, ly), { tam: 1.85, alfa: 0.96 });
  }
  // Rayas curvas ajustadas exactamente al contorno del abdomen (nunca se salen)
  for (const bx of [-21, -13, -5]) {
    const u = clampUnit((bx + 12) / 19);
    const maxY = 11.4 * Math.sqrt(Math.max(0.08, 1 - u * u)) * (0.86 + 0.14 * u);
    for (let i = -8; i <= 8; i++) {
      const f = i / 8;
      const lx = bx - (1 - f * f) * 2.2;
      const ly = f * maxY;
      L.punto(...enAbeja(lx, ly), { tam: 1.9, alfa: 0.9 });
      L.punto(...enAbeja(lx + 1.6, ly), { tam: 1.4, alfa: 0.55 });
    }
  }
  L.rellenoElipse(...enAbeja(-12, 0), 16 * E, 9.5 * E, dir, 30, { tam: 1.3, alfa: 0.28 });
  // Aguijón fino en la punta trasera
  L.linea(...enAbeja(-31, 0), ...enAbeja(-39, 0.5), { paso: 2, tam: 1.5, temblor: 0.15 });

  // Tórax redondeado con textura suave
  const [tx, ty] = enAbeja(15, -0.5);
  L.elipse(tx, ty, 11.5 * E, 10.5 * E, dir, { paso: 2.5, tam: 1.85 });
  L.rellenoElipse(tx, ty, 9.5 * E, 8.5 * E, dir, 26, { tam: 1.35, alfa: 0.35 });

  // Cabeza + ojo compuesto + antenas curvas con punta
  const [hx, hy] = enAbeja(31, 1.5);
  L.elipse(hx, hy, 8.2 * E, 7.6 * E, dir, { paso: 2.3, tam: 1.85 });
  L.rellenoElipse(...enAbeja(33, -0.5), 3.2 * E, 2.4 * E, dir, 12, { capa: "a", tam: 1.4, alfa: 0.95 });
  for (const lado of [-1, 1]) {
    const p0 = enAbeja(37, 1.5 + 3.2 * lado);
    const p1 = enAbeja(46, 1.5 + 8.5 * lado);
    const p2 = enAbeja(52, 1.5 + 11.5 * lado);
    const p3 = enAbeja(55, 1.5 + 7.5 * lado);
    L.curva(p0, p1, p2, p3, { paso: 2.2, tam: 1.3, temblor: 0.18 });
    L.punto(...p3, { tam: 2.1, alfa: 0.95 });
  }

  // Dos pares de alas translúcidas en gota que nacen limpias del tórax hacia atrás
  const ala = (baseX, baseY, angRel, largo, ancho, alfa) => {
    const a = dir + angRel, cw = Math.cos(a), sw = Math.sin(a);
    const [bx, by] = enAbeja(baseX, baseY);
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      const dist = t * largo * E;
      const w = Math.sin(t * Math.PI) ** 0.75 * ancho * E * (0.65 + 0.35 * t);
      for (const s of [-1, 1]) {
        L.punto(bx + dist * cw - s * w * sw, by + dist * sw + s * w * cw, { tam: 1.35, alfa });
      }
      if (i > 2 && i < 24 && i % 3 === 0) {
        L.punto(bx + dist * cw, by + dist * sw, { capa: "p2", tam: 1.1, alfa: alfa * 0.6 });
      }
    }
  };
  // Ala delantera + trasera superior (visibles arriba del lomo) y ala lejana más tenue
  ala(15, -7, -2.08, 34, 9.2, 0.74);
  ala(11, -6, -2.42, 24, 6.8, 0.5);
  ala(16, 4, 2.22, 26, 7.2, 0.34);

  // Patas recogidas sosteniendo una gota de miel definida (en forma de lágrima)
  const [gx, gy] = enAbeja(17, 22);
  for (const [px, py, mx, my] of [[10, 8, 12, 17], [17, 9, 17, 17], [23, 8, 22, 17]]) {
    L.curva(enAbeja(px, py), enAbeja(mx, my), enAbeja(mx, my), enAbeja(px + (17 - px) * 0.55, 20), { paso: 2.2, tam: 1.2, temblor: 0.15, alfa: 0.85 });
  }
  // Contorno nítido de la gota de miel + núcleo luminoso
  for (let i = 0; i <= 28; i++) {
    const t = (i / 28) * TAU;
    const rx = 7.5 * E * Math.sin(t) * (0.72 + 0.28 * Math.sin(t * 0.5));
    const lx = Math.sin(t) * 7.2 * E * (0.65 + 0.35 * (1 - Math.cos(t)) * 0.5);
    const ly = -Math.cos(t) * 9.5 * E;
    L.punto(gx + (lx * 0.65 + rx * 0.35), gy + ly, { capa: "a", tam: 1.75, alfa: 0.96 });
  }
  L.rellenoElipse(gx, gy + 1.5 * E, 5.4 * E, 6.2 * E, 0, 26, { capa: "a", tam: 1.4, alfa: 0.55 });

  // Estela del vuelo: viene desde la izquierda con algunos glifos
  const B = L.curva([180, 445], [380, 470], [490, 145], enAbeja(-42, 0), { paso: 7, temblor: 1.1, tam: 1.35, alfa: (t) => t * 0.55 });
  for (const t of [0.36, 0.58, 0.78]) { const [x, y] = B(t); L.texto(x + L.rnd(-8, 8), y - 14, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: t * 0.52, tam: 10 }); }
  return { lienzo: L, etiqueta: "Una abeja hecha de partículas lleva una gota de miel a la celda 84 del panal", encuadre: "460 60 740 430" };
}

function clampUnit(v) { return Math.max(-0.99, Math.min(0.99, v)); }

// ======================================================================
// «¿Quién decide en qué carpeta va cada objeto?» — Un diente de león al viento.
// Las semillas vuelan al azar pero cada parcela del campo recibe casi lo mismo.
// ======================================================================
export function dienteDeLeon({ semilla = 256, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.15, (x - 130) / 460));
  polvo(L, 210, desvanecer);

  const C = [915, 212]; // centro de la cabeza
  // Tallo orgánico ligeramente cónico con relleno suave
  const T1 = L.curva([960, H + 10], [945, 468], [898, 355], [C[0] - 2, C[1] + 22], { paso: 3.2, tam: 1.75, capa: "p2", alfa: 0.88 });
  const T2 = L.curva([970, H + 10], [954, 468], [906, 355], [C[0] + 4, C[1] + 22], { paso: 3.4, tam: 1.5, capa: "p2", alfa: 0.7 });
  for (let i = 1; i < 36; i++) {
    const t = i / 36, [x1, y1] = T1(t), [x2, y2] = T2(t);
    L.punto((x1 + x2) * 0.5 + L.rnd(-1.2, 1.2), (y1 + y2) * 0.5, { capa: "p2", tam: 1.2, alfa: 0.35 });
  }
  // Cáliz / brácteas curvadas justo bajo el núcleo
  for (const lado of [-1, 1]) {
    L.curva([C[0] + lado * 4, C[1] + 15], [C[0] + lado * 16, C[1] + 24], [C[0] + lado * 26, C[1] + 34], [C[0] + lado * 22, C[1] + 44], { paso: 2.4, capa: "p2", tam: 1.4, alfa: 0.85, temblor: 0.2 });
    L.curva([C[0] + lado * 2, C[1] + 16], [C[0] + lado * 10, C[1] + 28], [C[0] + lado * 13, C[1] + 40], [C[0] + lado * 9, C[1] + 48], { paso: 2.5, capa: "p2", tam: 1.2, alfa: 0.65, temblor: 0.2 });
  }
  // Hojas dentadas de diente de león en la base (silueta cerrada con lóbulos)
  for (const [lado, largo, alto] of [[-1, 165, 92], [1, 145, 72]]) {
    const base = [962, H + 4];
    for (let i = 0; i <= 42; i++) {
      const t = i / 42;
      const x = base[0] + lado * t * largo;
      const yBase = base[1] - Math.sin(t * Math.PI * 0.68) * alto;
      const diente = Math.sin(t * Math.PI * 5) > 0 ? 11 * Math.sin(t * Math.PI) : 0;
      L.punto(x, yBase - diente, { capa: "p2", tam: 1.4, alfa: 0.62 });
      L.punto(x, yBase + 10 * Math.sin(t * Math.PI) + 2, { capa: "p2", tam: 1.2, alfa: 0.45 });
    }
  }
  // Receptáculo / núcleo luminoso
  L.elipse(C[0], C[1], 16, 15, 0, { capa: "a", paso: 2.8, tam: 1.7, alfa: 0.92 });
  L.rellenoElipse(C[0], C[1], 14, 13, 0, 62, { capa: "a", tam: 1.65, alfa: 0.82 });

  // Vilano detallado: aquenio en gota + tallo fino + paraguas arqueado de filamentos
  const semillaEn = (x, y, ang, escala = 1, alfa = 1) => {
    const lx = Math.cos(ang), ly = Math.sin(ang);
    const nx = -ly, ny = lx;
    // Aquenio (cuerpo alargado de la semilla)
    for (let i = 0; i <= 5; i++) {
      const u = i / 5;
      L.punto(x - lx * u * 7 * escala, y - ly * u * 7 * escala, { capa: "a", tam: (2.2 - u * 0.8) * escala, alfa });
    }
    const largo = 24 * escala;
    const px = x + lx * largo, py = y + ly * largo;
    L.curva([x, y], [x + lx * largo * 0.45 + nx * 2 * escala, y + ly * largo * 0.45 + ny * 2 * escala], [x + lx * largo * 0.75, y + ly * largo * 0.75], [px, py], { paso: 2.4, tam: 1.15, alfa: alfa * 0.85, temblor: 0.18 });
    // Sombrilla arqueada (filamentos curvos hacia afuera)
    for (let k = 0; k < 9; k++) {
      const frac = k / 8 - 0.5;
      const a = ang + frac * 1.95;
      const l = (12 + (1 - Math.abs(frac) * 2) * 3.5) * escala;
      const mx = px + Math.cos(ang + frac * 1.35) * l * 0.55;
      const my = py + Math.sin(ang + frac * 1.35) * l * 0.55;
      const fx = px + Math.cos(a) * l, fy = py + Math.sin(a) * l;
      L.curva([px, py], [mx, my], [mx, my], [fx, fy], { paso: 2.3, tam: 1.0, alfa: alfa * 0.68, temblor: 0.15 });
      L.punto(fx, fy, { tam: 1.25, alfa: alfa * 0.75 });
    }
  };

  // Cabeza esférica: transición orgánica en el lado del viento (sin corte recto tipo Pac-Man)
  for (let i = 0; i < 86; i++) {
    const ang = (i / 86) * TAU + L.rnd(-0.03, 0.03);
    const a = ((ang % TAU) + TAU) % TAU;
    // Distancia angular al vector de viento (hacia la izquierda, π ≈ 3.14)
    const distViento = Math.abs(Math.atan2(Math.sin(a - 3.22), Math.cos(a - 3.22)));
    const probVolo = Math.exp(-((distViento / 0.72) ** 2));
    if (L.r() < probVolo * 0.88) continue;
    // Las semillas cercanas al borde del viento ya están soltándose un poco
    const despegue = distViento < 1.05 ? (1.05 - distViento) * L.rnd(6, 22) : 0;
    const r0 = 16 + despegue;
    const r1 = L.rnd(78, 94) + despegue;
    const x0 = C[0] + Math.cos(ang) * r0, y0 = C[1] + Math.sin(ang) * r0;
    const px = C[0] + Math.cos(ang) * r1, py = C[1] + Math.sin(ang) * r1;
    L.linea(x0, y0, px, py, { paso: 4.5, tam: 1.0, alfa: 0.44, temblor: 0.25 });
    for (let k = 0; k < 5; k++) {
      const b = ang + (k / 4 - 0.5) * 1.65;
      L.linea(px, py, px + Math.cos(b) * 12.5, py + Math.sin(b) * 12.5, { paso: 3, tam: 1.05, alfa: 0.64, temblor: 0.2 });
    }
  }

  // Campo: 16 parcelas legibles y equilibradas (el azar produce reparto parejo)
  const campo = { x0: 210, x1: 1130, y: 556, n: 16 };
  const ancho = (campo.x1 - campo.x0) / campo.n;
  L.linea(campo.x0, campo.y, campo.x1, campo.y, { paso: 3.8, capa: "p2", alfa: 0.58, tam: 1.35 });
  for (let k = 0; k <= campo.n; k++) {
    const x = campo.x0 + k * ancho;
    L.linea(x, campo.y - 7, x, campo.y + 7, { paso: 2, capa: "p2", alfa: 0.65 * desvanecer(x), tam: 1.35 });
  }
  for (let k = 0; k < campo.n; k++) {
    const x = campo.x0 + k * ancho, cant = 14 + Math.round(L.rnd(-2, 2));
    for (let i = 0; i < cant; i++) {
      const cx = x + ancho * 0.5 + L.rnd(-ancho * 0.36, ancho * 0.36);
      const alto = (1 - Math.abs(cx - (x + ancho * 0.5)) / (ancho * 0.5)) * 14 + 3;
      L.punto(cx, campo.y - L.rnd(3, alto), { capa: i < 4 ? "a" : "p", tam: L.rnd(1.5, 2.2), alfa: desvanecer(x) * L.rnd(0.6, 0.95) });
    }
    if (k === 0 || k === 4 || k === 8 || k === 12 || k === 15) {
      L.texto(x + ancho / 2, campo.y + 20, k === 15 ? "ff" : hex2(k * 16), { alfa: 0.55 * desvanecer(x), tam: 10 });
    }
  }

  // Semillas en vuelo: arco elegante desde la cabeza hacia las parcelas
  for (let i = 0; i < 15; i++) {
    const salida = [C[0] - L.rnd(68, 98), C[1] + L.rnd(-48, 44)];
    const llegada = [campo.x0 + 28 + ((i * 5) % 16) * ((campo.x1 - campo.x0 - 110) / 15), campo.y - 26];
    const t = 0.14 + (i / 14) * 0.78 + L.rnd(-0.03, 0.03);
    const p1 = [salida[0] - L.rnd(115, 240), salida[1] - L.rnd(55, 130)];
    const p2 = [llegada[0] + L.rnd(-70, 110), llegada[1] - L.rnd(140, 240)];
    const B = L.curva(salida, p1, p2, llegada, { paso: 9, temblor: 0.9, capa: "p2", tam: 1.05, alfa: (u) => (u < t ? 0.32 * (u / t) : 0) });
    const [x, y] = B(t), [x2, y2] = B(Math.min(1, t + 0.02));
    const vuelo = Math.atan2(y2 - y, x2 - x);
    semillaEn(x, y, vuelo - 1.35 + L.rnd(-0.28, 0.28), L.rnd(0.84, 1.08), desvanecer(x) * 0.92 + 0.08);
  }
  for (let i = 0; i < 4; i++) {
    const y = L.rnd(115, 410), x0 = L.rnd(710, 830);
    const B = L.curva([x0, y], [x0 - 190, y - 36], [x0 - 370, y + 36], [x0 - 580, y - 8], { paso: 8, capa: "p2", tam: 1.05, alfa: (u) => Math.sin(u * Math.PI) * 0.34 });
    const [gx, gy] = B(0.5); L.texto(gx, gy - 10, GLIFOS[(L.r() * GLIFOS.length) | 0], { alfa: 0.38, tam: 10 });
  }
  return { lienzo: L, etiqueta: "Un diente de león de partículas suelta sus semillas al viento, repartiéndose de forma pareja en 16 parcelas", encuadre: "340 85 840 500" };
}

// ======================================================================
// «La ley de los grandes números» — Lluvia sobre un estanque.
// Con pocas gotas el agua se ve desordenada; con muchas, pareja. Encima, una libélula
// que zigzaguea al principio y luego vuela recto: la proporción que se acerca al 50 %.
// ======================================================================
export function lluvia({ semilla = 10000, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 130) / 460));
  polvo(L, 190, desvanecer);

  const agua = 345;
  L.curva([350, agua], [600, agua - 5], [900, agua + 5], [1200, agua - 2], { paso: 4.5, capa: "p2", alfa: (t) => 0.28 + t * 0.44, tam: 1.35 });

  // Juncos y totoras a la derecha: la espiga abraza el tallo (sin flotar) y salen hojas curvas del agua
  for (let i = 0; i < 7; i++) {
    const x = 1072 + i * 17 + L.rnd(-4, 4), alto = L.rnd(125, 225), curva = L.rnd(-28, 8);
    const B = L.curva([x, agua + 24], [x, agua - alto * 0.38], [x + curva, agua - alto * 0.78], [x + curva * 1.35, agua - alto], { paso: 3.6, capa: "p2", tam: 1.35, alfa: 0.72 });
    if (i % 2 === 0) {
      // Espiga de totora envuelta alrededor de t = 0.78..0.92 del propio tallo
      const [sx, sy] = B(0.84), [sx2, sy2] = B(0.88);
      const ang = Math.atan2(sy2 - sy, sx2 - sx);
      L.elipse(sx, sy, 14, 4.4, ang, { capa: "p", paso: 2.2, tam: 1.55, alfa: 0.88 });
      L.rellenoElipse(sx, sy, 12, 3.4, ang, 18, { capa: "a", tam: 1.35, alfa: 0.72 });
    }
    if (i % 2 === 1) {
      const lado = i % 4 === 1 ? -1 : 1;
      L.curva([x, agua + 16], [x + lado * 10, agua - alto * 0.28], [x + lado * 28, agua - alto * 0.52], [x + lado * 48, agua - alto * 0.44], { paso: 3.8, capa: "p2", tam: 1.2, alfa: 0.55 });
    }
  }

  // Gotas y ondas con perspectiva: desorden a la izquierda → uniformidad a la derecha
  const ondas = (x, y, r, alfa, conCorona = false) => {
    L.elipse(x, y, r, r * 0.22, 0, { paso: 3.4, tam: 1.45, alfa });
    L.elipse(x, y, r * 1.85, r * 0.38, 0, { paso: 5.2, tam: 1.1, alfa: alfa * 0.46 });
    if (conCorona) {
      for (const s of [-1, 0, 1]) L.punto(x + s * 3.5, y - (s === 0 ? 5.5 : 3.5), { capa: "a", tam: 1.35, alfa: alfa * 0.9 });
    }
  };
  const columnas = 24;
  for (let c = 0; c < columnas; c++) {
    const x0 = 430 + c * 29, cuantas = Math.round(1 + (c / (columnas - 1)) ** 2.15 * 10);
    const orden = c / (columnas - 1);
    for (let i = 0; i < cuantas; i++) {
      const y = agua + 22 + (orden > 0.5 ? ((i + 0.5) / cuantas) * 225 + L.rnd(-6, 6) : L.rnd(0, 225) ** 1.05);
      const x = x0 + L.rnd(-11, 11);
      const prof = (y - agua) / 260;
      const vis = desvanecer(x) * (0.4 + 0.6 * (1 - prof * 0.45));
      ondas(x, y, L.rnd(9, 13.5) * (1 - orden * 0.25) * (0.72 + prof * 0.65), vis * 0.85, L.r() < 0.14);
    }
    for (let i = 0; i < Math.ceil(cuantas / 3); i++) {
      const x = x0 + L.rnd(-12, 12), y = L.rnd(68, agua - 28);
      L.linea(x, y, x - 3.5, y + L.rnd(12, 24), { paso: 2.8, tam: 1.15, alfa: 0.42 * desvanecer(x), temblor: 0.15 });
    }
  }

  // Vuelo de la libélula: amplitud que decae como 1/√n hacia la línea 0.5
  const nivel = 208, puntosVuelo = [];
  for (let i = 0; i <= 260; i++) {
    const t = i / 260, x = 310 + t * 655;
    const amp = 115 / Math.sqrt(1 + t * 62);
    puntosVuelo.push([x, nivel + Math.sin(t * 46 + Math.sin(t * 7) * 2) * amp]);
  }
  // Línea sutil de referencia del 50 %
  for (let x = 520; x <= 1020; x += 14) {
    L.punto(x, nivel, { capa: "p2", tam: 1.15, alfa: 0.3 * desvanecer(x) });
  }
  for (const [i, [x, y]] of puntosVuelo.entries()) if (i % 2 === 0) L.punto(x, y, { capa: "p2", tam: 1.25, alfa: 0.58 * desvanecer(x) });

  // Libélula esculpida: abdomen segmentado ahusado, tórax redondeado, ojos compuestos y 4 alas en gota venadas
  const [lx, ly] = puntosVuelo[puntosVuelo.length - 1];
  // Abdomen de 8 segmentos que adelgazan suavemente hacia la cola bifurcada
  let ax = lx - 4;
  for (let k = 0; k < 8; k++) {
    const f = k / 7;
    const segLen = 9.5 - f * 1.4;
    const segH = 3.6 - f * 1.7;
    const cx = ax - segLen * 0.5;
    const cy = ly + f * 3.5;
    L.elipse(cx, cy, segLen * 0.54, segH, 0.05, { paso: 2.1, tam: 1.65 - f * 0.35, alfa: 0.94 });
    if (k % 2 === 0) L.punto(cx, cy, { capa: "a", tam: 1.4, alfa: 0.78 });
    ax -= segLen * 0.92;
  }
  // Cercos finos en la punta de la cola
  L.linea(ax, ly + 3.5, ax - 7, ly + 1.5, { paso: 2, tam: 1.1, temblor: 0.1 });
  L.linea(ax, ly + 3.5, ax - 7, ly + 5.8, { paso: 2, tam: 1.1, temblor: 0.1 });

  // Tórax redondeado con volumen
  L.elipse(lx + 4, ly, 10.5, 7.6, -0.08, { paso: 2.2, tam: 1.85 });
  L.rellenoElipse(lx + 4, ly, 8.5, 5.8, -0.08, 22, { tam: 1.35, alfa: 0.42 });

  // Cabeza con dos ojos compuestos bien definidos
  L.elipse(lx + 17.5, ly - 0.5, 6.2, 6.8, 0, { paso: 2.1, tam: 1.8 });
  L.rellenoElipse(lx + 19.5, ly - 3.6, 3.2, 2.7, 0.2, 12, { capa: "a", tam: 1.35, alfa: 0.96 });
  L.rellenoElipse(lx + 19.5, ly + 2.8, 2.8, 2.4, -0.2, 10, { capa: "a", tam: 1.3, alfa: 0.85 });

  // Cuatro alas esbeltas que nacen del tórax, se ensanchan suavemente y llevan vena central + estigma en la punta
  const alaLib = (bx, by, ang, largo, ancho, alfa) => {
    const cw = Math.cos(ang), sw = Math.sin(ang);
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const dist = t * largo;
      const w = Math.sin(t * Math.PI) ** 0.72 * ancho * (0.42 + 0.58 * t);
      for (const s of [-1, 1]) {
        L.punto(bx + dist * cw - s * w * sw, by + dist * sw + s * w * cw, { tam: 1.3, alfa });
      }
      if (i > 1 && i < 29 && i % 2 === 0) {
        L.punto(bx + dist * cw, by + dist * sw, { capa: "p2", tam: 1.05, alfa: alfa * 0.58 });
      }
    }
    // Estigma sutil cerca del borde de ataque
    const px = bx + largo * 0.78 * cw, py = by + largo * 0.78 * sw;
    L.punto(px, py, { capa: "a", tam: 1.7, alfa: alfa * 0.95 });
  };
  alaLib(lx + 5, ly - 3, -2.02, 68, 9.8, 0.72);
  alaLib(lx + 5, ly + 3, 2.04, 68, 9.8, 0.72);
  alaLib(lx - 1, ly - 3, -2.42, 56, 8.6, 0.56);
  alaLib(lx - 1, ly + 3, 2.44, 56, 8.6, 0.56);

  L.texto(lx + 54, ly + 1, "0.5", { capa: "a", alfa: 0.82, tam: 11 });
  return { lienzo: L, etiqueta: "Lluvia de partículas sobre un estanque y una libélula cuyo vuelo se aplana hacia el 0.5", encuadre: "380 85 820 435" };
}

// ======================================================================
// «Pensar en probabilidades, no en 0 o 1» — Un hormiguero.
// Cada hormiga camina al azar; entre todas forman un camino firme hasta la hoja.
// ======================================================================
export function hormigas({ semilla = 1997, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 130) / 460));
  polvo(L, 190, desvanecer);

  const nido = [530, 492], hoja = [1038, 188];
  // Suelo ligeramente ondulado con briznas de hierba
  L.curva([360, 526], [620, 522], [900, 530], [1185, 523], { paso: 5.5, capa: "p2", alfa: 0.42, tam: 1.25 });
  for (const gx of [420, 645, 790, 960, 1110]) {
    for (const ang of [-1.85, -1.5, -1.18]) {
      const h = L.rnd(12, 22);
      L.linea(gx, 525, gx + Math.cos(ang) * h, 525 + Math.sin(ang) * h, { paso: 2.6, capa: "p2", tam: 1.05, alfa: 0.48, temblor: 0.25 });
    }
  }
  // Hormiguero con volumen natural y cráter en la cima (sin óvalo flotante)
  L.curva([442, 526], [478, 514], [496, 486], [516, 488], { paso: 2.8, capa: "p2", tam: 1.6, alfa: 0.85 });
  L.curva([544, 488], [564, 486], [584, 514], [618, 526], { paso: 2.8, capa: "p2", tam: 1.6, alfa: 0.85 });
  L.elipse(nido[0], nido[1] - 3, 14, 4.5, 0, { capa: "p", paso: 2.2, tam: 1.55, alfa: 0.9 });
  for (let i = 0; i < 110; i++) {
    const u = L.rnd(-1, 1), hMax = Math.exp(-(u * u) * 2.4) * 34;
    const px = nido[0] + u * 80, py = 524 - L.r() * hMax;
    if (Math.hypot((px - nido[0]) * 0.7, (py - (nido[1] - 3)) * 1.8) > 10) {
      L.punto(px, py, { capa: "p2", tam: L.rnd(1.0, 1.7), alfa: L.rnd(0.24, 0.62) });
    }
  }

  // Hoja con tallo curvo, nervaduras suaves y dos mordiscos de hormiga en el borde
  const angHoja = -0.48;
  const enHoja = (lx, ly) => [hoja[0] + lx * Math.cos(angHoja) - ly * Math.sin(angHoja), hoja[1] + lx * Math.sin(angHoja) + ly * Math.cos(angHoja)];
  for (const lado of [-1, 1]) {
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      let yBorde = Math.sin(t * Math.PI) * 48 * (1 - t * 0.24);
      // Dos muescas donde ya cortaron pedacitos de hoja
      if (lado === 1 && Math.abs(t - 0.34) < 0.085) {
        yBorde -= Math.cos(((t - 0.34) / 0.085) * (Math.PI / 2)) * 13;
      }
      if (lado === 1 && Math.abs(t - 0.62) < 0.065) {
        yBorde -= Math.cos(((t - 0.62) / 0.065) * (Math.PI / 2)) * 10;
      }
      const [x, y] = enHoja(-90 + t * 180, lado * yBorde);
      L.punto(x + L.rnd(-0.35, 0.35), y + L.rnd(-0.35, 0.35), { tam: 1.75 });
    }
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const p0 = enHoja(-90 + t * 180, 0);
      const p1 = enHoja(-90 + t * 180 + 12, lado * Math.sin(t * Math.PI) * 20);
      const p2 = enHoja(-90 + t * 180 + 26, lado * Math.sin(t * Math.PI) * 36 * (1 - t * 0.2));
      L.curva(p0, p1, p1, p2, { paso: 3, tam: 1.1, alfa: 0.54, temblor: 0.2 });
    }
  }
  L.curva(enHoja(-118, 8), enHoja(-102, 2), enHoja(-90, 0), enHoja(90, 0), { paso: 3, tam: 1.35, alfa: 0.74, temblor: 0.15 });
  for (let i = 0; i < 65; i++) {
    const t = L.rnd(0.08, 0.92), maxY = Math.sin(t * Math.PI) * 40 * (1 - t * 0.24);
    const [x, y] = enHoja(-90 + t * 180, L.rnd(-maxY, maxY));
    L.punto(x, y, { capa: "p2", tam: 1.15, alfa: 0.28 });
  }

  // Hormiga detallada: abdomen con volumen, tórax fino, cabeza, antenas acodadas y 6 patas articuladas
  const hormiga = (x, y, ang, alfa = 1, carga = null) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    const en = (lx, ly) => [x + lx * c - ly * s, y + lx * s + ly * c];
    // Abdomen, tórax y cabeza
    for (const [lx, rx, ry, nRel] of [[-7.2, 4.6, 3.2, 10], [-0.4, 2.5, 1.9, 5], [5.4, 2.7, 2.3, 6]]) {
      const [cx, cy] = en(lx, 0);
      L.elipse(cx, cy, rx, ry, ang, { paso: 2.0, tam: 1.25, alfa });
      L.rellenoElipse(cx, cy, rx * 0.72, ry * 0.72, ang, nRel, { tam: 1.05, alfa: alfa * 0.45 });
    }
    // 6 patas articuladas en ángulos naturales (delantera, media, trasera)
    for (const lado of [-1, 1]) {
      for (const [bx, mx, my, fx, fy] of [
        [-1.8, -4.5, 4.2, -8.2, 6.8],
        [-0.2, -0.5, 4.5, -1.6, 7.6],
        [1.6, 4.2, 4.0, 6.8, 6.5],
      ]) {
        L.linea(...en(bx, lado * 1.4), ...en(mx, lado * my), { paso: 2.0, tam: 0.95, alfa: alfa * 0.82, temblor: 0.08 });
        L.linea(...en(mx, lado * my), ...en(fx, lado * fy), { paso: 2.0, tam: 0.9, alfa: alfa * 0.75, temblor: 0.08 });
      }
      // Antena acodada (rasgo real de las hormigas)
      L.linea(...en(7.6, lado * 1.1), ...en(10.6, lado * 3.6), { paso: 1.5, tam: 0.9, alfa: alfa * 0.85, temblor: 0.08 });
      L.linea(...en(10.6, lado * 3.6), ...en(13.6, lado * 2.5), { paso: 1.5, tam: 0.85, alfa: alfa * 0.8, temblor: 0.08 });
    }
    if (carga) {
      const [cx, cy] = en(11.5, 0);
      L.punto(cx, cy, { capa: "a", tam: 2.8, alfa });
      if (typeof carga === "string") L.texto(cx, cy - 10, carga, { capa: "a", alfa: alfa * 0.88, tam: 9.5 });
    }
  };

  // Exploradoras: caminatas al azar bien visibles saliendo del hormiguero
  for (let i = 0; i < 20; i++) {
    let x = nido[0] + L.rnd(-18, 18), y = nido[1] - 8, ang = L.rnd(-Math.PI * 0.92, -Math.PI * 0.08);
    const pasos = Math.round(L.rnd(36, 96));
    for (let k = 0; k < pasos; k++) {
      ang += L.rnd(-0.48, 0.48);
      x += Math.cos(ang) * 6; y += Math.sin(ang) * 6;
      if (y > 515) { y = 515; ang = -Math.abs(ang); }
      if (k % 2 === 0) L.punto(x, y, { capa: "p2", tam: 1.05, alfa: 0.28 * desvanecer(x) });
    }
    hormiga(x, y, ang, 0.82 * desvanecer(x));
  }

  // Camino de feromonas en dos carriles sutiles (ida y vuelta sin amontonarse)
  const B = L.curva([nido[0] + 10, nido[1] - 6], [690, 428], [820, 326], enHoja(-96, 4), { paso: 3.4, temblor: 1.5, capa: "p2", tam: 1.25, alfa: 0.5 });
  const cargas = ["0x", true, "1", true, "f9", true, "a3", true];
  const totalFila = 13;
  for (let i = 0; i < totalFila; i++) {
    const t = 0.07 + (i / (totalFila - 1)) * 0.85;
    const [x, y] = B(t), [x2, y2] = B(Math.min(1, t + 0.01));
    const ang = Math.atan2(y2 - y, x2 - x);
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    const vuelta = i % 2 === 1;
    const carril = vuelta ? -8.5 : 8.5;
    hormiga(x + nx * carril, y + ny * carril, ang + (vuelta ? Math.PI : 0), 0.98, vuelta ? cargas[i % cargas.length] : null);
  }
  return { lienzo: L, etiqueta: "Un hormiguero de partículas: hormigas explorando al azar y dos carriles ordenados hasta una hoja", encuadre: "390 75 810 465" };
}

// ======================================================================
// «¿Qué hay dentro de un objeto?» — Una vaina/semilla que se abre.
// Al abrir la cáscara comprimida (zlib) aparece la estructura interior: cabecera, byte nulo y contenido.
// ======================================================================
export function capsula({ semilla = 1978, W = 1200, H = 630 } = {}) {
  const L = new Lienzo(W, H, semilla);
  const desvanecer = (x) => Math.min(1, Math.max(0.12, (x - 150) / 480));
  polvo(L, 210, desvanecer);

  const centro = [855, 318];
  const angBase = -0.22;
  const rotar = (lx, ly, extra = 0) => {
    const a = angBase + extra, c = Math.cos(a), s = Math.sin(a);
    return [centro[0] + lx * c - ly * s, centro[1] + lx * s + ly * c];
  };

  // Tallo botánico que sujeta la vaina por la izquierda
  L.curva(rotar(-240, 38), rotar(-195, 18), rotar(-162, 6), rotar(-132, 0), { paso: 3.2, capa: "p2", tam: 1.7, alfa: 0.82 });
  L.curva(rotar(-240, 44), rotar(-195, 24), rotar(-162, 11), rotar(-132, 4), { paso: 3.6, capa: "p2", tam: 1.35, alfa: 0.55 });

  // Dos valvas (mitades de la cáscara) abiertas en ángulo desde la bisagra (-132, 0)
  const valva = (lado, apertura) => {
    const piv = [-132, 0];
    const enV = (lx, ly) => {
      const dx = lx - piv[0], dy = ly - piv[1];
      const ca = Math.cos(apertura * lado), sa = Math.sin(apertura * lado);
      return rotar(piv[0] + dx * ca - dy * sa, piv[1] + dx * sa + dy * ca);
    };
    // Borde exterior curvo de la cáscara + borde interior
    for (let i = 0; i <= 56; i++) {
      const t = i / 56;
      const lx = -132 + t * 290;
      const arcoExt = Math.sin(t * Math.PI) ** 0.8 * 76 * lado;
      const arcoInt = Math.sin(t * Math.PI) ** 0.9 * 22 * lado;
      L.punto(...enV(lx, arcoExt), { tam: 1.9, alfa: 0.94 });
      L.punto(...enV(lx, arcoExt * 0.93), { tam: 1.4, alfa: 0.55 });
      L.punto(...enV(lx, arcoInt), { capa: "p2", tam: 1.4, alfa: 0.72 });
      // Nervaduras fibrosas (evocan las capas comprimidas)
      if (i > 4 && i < 52 && i % 6 === 0) {
        L.linea(...enV(lx, arcoInt), ...enV(lx + 10, arcoExt * 0.94), { paso: 4.2, capa: "p2", tam: 1.15, alfa: 0.42, temblor: 0.25 });
      }
    }
    // Textura suave dentro de la cáscara
    for (let i = 0; i < 60; i++) {
      const t = L.rnd(0.08, 0.92), lx = -132 + t * 290;
      const ext = Math.sin(t * Math.PI) ** 0.8 * 70 * lado;
      const intr = Math.sin(t * Math.PI) ** 0.9 * 24 * lado;
      L.punto(...enV(lx, intr + L.r() * (ext - intr)), { capa: "p2", tam: 1.2, alfa: L.rnd(0.2, 0.45) });
    }
  };
  valva(-1, 0.34); // valva superior abierta hacia arriba
  valva(1, 0.3);   // valva inferior abierta hacia abajo

  // Interior estructurado en 3 semillas luminosas: cabecera ("blob"), separador ("\0") y contenido
  const semillas = [
    { lx: -54, rx: 32, ry: 22, etiqueta: "blob" },
    { lx: 12, rx: 16, ry: 15, etiqueta: "\\0" },
    { lx: 88, rx: 46, ry: 26, etiqueta: "hola.js" },
  ];
  for (const s of semillas) {
    const [sx, sy] = rotar(s.lx, 0);
    L.elipse(sx, sy, s.rx, s.ry, angBase, { capa: "a", paso: 2.5, tam: 1.9, alfa: 0.96 });
    L.elipse(sx, sy, s.rx * 0.82, s.ry * 0.8, angBase, { capa: "p", paso: 3.8, tam: 1.25, alfa: 0.48 });
    L.rellenoElipse(sx, sy, s.rx * 0.72, s.ry * 0.72, angBase, Math.round(s.rx * 1.1), { capa: "a", tam: 1.35, alfa: 0.36 });
    L.texto(sx, sy + 1, s.etiqueta, { capa: "p", alfa: 0.92, tam: s.etiqueta === "\\0" ? 12 : 11 });
  }
  // Filamentos que unen las 3 partes dentro de la vaina
  L.linea(...rotar(-20, 0), ...rotar(-5, 0), { paso: 2.4, capa: "a", tam: 1.4, alfa: 0.75 });
  L.linea(...rotar(30, 0), ...rotar(41, 0), { paso: 2.4, capa: "a", tam: 1.4, alfa: 0.75 });

  // Partículas y bytes zlib (78 9c) escapando suavemente por la abertura al descomprimir
  const bytes = ["78", "9c", "0x", "a3", "14", "00"];
  for (let i = 0; i < 6; i++) {
    const a = -0.55 + (i / 5) * 1.1;
    const p0 = rotar(128, Math.sin(a) * 18);
    const p1 = rotar(185, Math.sin(a) * 65);
    const p2 = rotar(240, Math.sin(a) * 115);
    const B = L.curva(p0, p1, p1, p2, { paso: 7, capa: "p2", tam: 1.15, alfa: (t) => (1 - t) * 0.45, temblor: 1 });
    const [bx, by] = B(0.68);
    L.texto(bx, by, bytes[i], { capa: i < 2 ? "a" : "p2", alfa: 0.6, tam: 10 });
  }

  return { lienzo: L, etiqueta: "Una vaina botánica de partículas abierta en dos mitades, mostrando la cabecera, el byte nulo y el contenido en su interior", encuadre: "430 80 760 450" };
}

// ======================================================================
// Qué escena lleva cada artículo (las dos versiones de idioma comparten la misma).
// Para un artículo nuevo: escribe su escena arriba y agrégala aquí.
// ======================================================================
const ESCENAS = {
  "donde-guarda-git": colmena,
  "where-git-stores-your-code": colmena,
  "que-hay-dentro-de-un-objeto": capsula,
  "whats-inside-a-git-object": capsula,
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
