// Hero de la portada: un mono abstracto hecho de partículas, colgado de una rama.
// Canvas 2D sin librerías. Esqueleto con cinemática inversa (brazos), resortes (torso, piernas, pies) y
// una cola con física Verlet. Se pausa fuera de pantalla, con la pestaña oculta o desde el botón de pausa;
// con «reducir movimiento» se dibuja quieto. Sigue los tokens del tema (--particula, --particula-2, --brand, --accent).
(() => {
  const canvas = document.querySelector("[data-mono]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const botonPausa = document.querySelector("[data-mono-pausa]");
  const etiquetaPausa = botonPausa?.querySelector("[data-mono-etiqueta]");
  const mqReducido = matchMedia("(prefers-reduced-motion: reduce)");
  let reducido = mqReducido.matches;
  let pausadoPorUsuario = reducido;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (dt, vel) => 1 - Math.exp(-dt * vel); // factor de interpolación independiente de los FPS
  const GLIFOS = ["0", "1", "x", "{", "}", ">", "#", "a3", "f9", "0x", "=>", ";", "*", "ff", "7e"];

  // Coordenadas locales: la cabeza tiene radio 1 y está en (0, 0); la y crece hacia abajo.
  const dentroCirculo = (x, y, c) => (x - c.x) ** 2 + (y - c.y) ** 2 < c.r * c.r;
  const dentroElipse = (x, y, e) => ((x - e.x) / e.rx) ** 2 + ((y - e.y) / e.ry) ** 2 < 1;
  const rot = (x, y, ax, ay, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - ax, dy = y - ay; return [ax + dx * c - dy * s, ay + dx * s + dy * c]; };
  const puntos = [];
  const agregar = (x, y, grupo, peso = 1, extra = {}) =>
    puntos.push({ hx: x + rnd(-0.01, 0.01), hy: y + rnd(-0.01, 0.01), grupo, peso, ...extra });

  const orejas = [{ x: -1.01, y: 0.08, r: 0.29 }, { x: 1.01, y: 0.08, r: 0.29 }];
  const ojosZona = [{ x: -0.3, y: -0.14, r: 0.34 }, { x: 0.3, y: -0.14, r: 0.34 }];
  const hocico = { x: 0, y: 0.4, rx: 0.6, ry: 0.36 };
  // Lo que pasa por detrás de la cabeza no se dibuja (se calcula en cada cuadro)
  const tapaCabeza = (x, y) => dentroCirculo(x, y, { x: 0, y: 0, r: 1.04 }) || orejas.some((o) => dentroCirculo(x, y, { ...o, r: o.r * 1.16 }));

  // ======================= CABEZA (fiel al logo Mokya) =======================
  for (const radio of [1.0, 1.055]) {
    for (let i = 0; i < 260; i++) {
      const a = (i / 260) * TAU, x = Math.cos(a) * radio, y = Math.sin(a) * radio;
      if (!orejas.some((o) => dentroCirculo(x, y, { ...o, r: o.r * radio }))) agregar(x, y, "contorno");
    }
    for (const o of orejas) for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU, r = o.r * (radio === 1 ? 1 : 1.18), x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
      if (!dentroCirculo(x, y, { x: 0, y: 0, r: radio })) agregar(x, y, o.x < 0 ? "orejaI" : "orejaD");
    }
  }
  // Detalle interior de ambas orejas (simétrico, como en el logo)
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const aD = -1.15 + t * 3.1;
    agregar(1.02 + Math.cos(aD) * 0.13, 0.08 + Math.sin(aD) * 0.13, "orejaD", 0.9);
    const aI = Math.PI - aD;
    agregar(-1.02 + Math.cos(aI) * 0.13, 0.08 + Math.sin(aI) * 0.13, "orejaI", 0.9);
  }
  // Mechón/corona superior del logo (dos arcos suaves)
  for (const rP of [0.76, 0.81]) {
    for (let i = 0; i < 52; i++) {
      const a = 3.65 + (i / 51) * 1.95;
      agregar(0.08 + Math.cos(a) * rP, 0.16 + Math.sin(a) * rP, "pelo", rP === 0.76 ? 0.95 : 0.65);
    }
  }
  const enMascara = (x, y) => ojosZona.some((c) => dentroCirculo(x, y, c)) || dentroElipse(x, y, hocico);
  const borde = [];
  for (const c of ojosZona) for (let i = 0; i < 110; i++) { const a = (i / 110) * TAU; borde.push([c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r]); }
  for (let i = 0; i < 170; i++) { const a = (i / 170) * TAU; borde.push([hocico.x + Math.cos(a) * hocico.rx, hocico.y + Math.sin(a) * hocico.ry]); }
  for (const [x, y] of borde) {
    const dentro = ojosZona.some((c) => dentroCirculo(x, y, { ...c, r: c.r - 0.005 })) || dentroElipse(x, y, { ...hocico, rx: hocico.rx - 0.005, ry: hocico.ry - 0.005 });
    if (!dentro) agregar(x, y, "cara");
  }
  for (let i = 0; i < 140; i++) { const x = rnd(-0.65, 0.65), y = rnd(-0.5, 0.78); if (enMascara(x, y)) agregar(x, y, "relleno", 0.22); }
  for (let i = 0; i < 95; i++) {
    const a = rnd(0, TAU), r = Math.sqrt(rnd(0.55, 0.94));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (!enMascara(x, y)) agregar(x, y, "relleno", 0.16);
  }
  for (const lado of ["ojoI", "ojoD"]) for (let i = 0; i <= 22; i++) {
    const t = (i / 22 - 0.5) * 0.3;
    for (const g of [-0.018, 0, 0.018]) { agregar(t + g, t - g, lado); agregar(t + g, -t + g, lado); }
  }
  for (const sx of [-1, 1]) for (let i = 0; i < 22; i++) { const a = rnd(0, TAU), r = rnd(0, 1); agregar(sx * 0.1 + Math.cos(a) * 0.055 * r, 0.17 + Math.sin(a) * 0.035 * r, "nariz"); }
  for (let i = 0; i < 48; i++) { const t = i / 47; agregar(-0.42 + t * 0.84, 0.44 + Math.sin(t * Math.PI) * 0.06, "boca"); }
  // Lengua en U suave + línea central como en el logo
  for (const g of [0, 0.02]) {
    const w = 0.155 - g;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, xCurva = w * (1 - 0.08 * t * t);
      agregar(-xCurva, 0.48 + t * 0.27, "lengua");
      agregar(xCurva, 0.48 + t * 0.27, "lengua");
    }
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      agregar(Math.cos(a) * w * 0.92, 0.75 + Math.sin(a) * w * 0.96, "lengua");
    }
  }
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    agregar(0, 0.51 + t * 0.26, "lengua", 0.85);
  }

  // ======================= TORSO Y PANZA (silueta orgánica con uniones limpias) =======================
  const CUELLO = [0, 1.0];
  const HOMBRO_D = [0.38, 1.2], HOMBRO_I = [-0.38, 1.2], CADERA_I = [-0.24, 2.08], CADERA_D = [0.24, 2.08], BASE_COLA = [0.25, 2.0];
  const unionesTorso = [
    { x: HOMBRO_D[0], y: HOMBRO_D[1], r: 0.135 },
    { x: HOMBRO_I[0], y: HOMBRO_I[1], r: 0.135 },
    { x: CADERA_I[0], y: CADERA_I[1], r: 0.125 },
    { x: CADERA_D[0], y: CADERA_D[1], r: 0.125 },
  ];
  const puntoTorso = (a, k = 1) => {
    const rx = (0.49 + 0.085 * Math.max(0, Math.sin(a))) * k;
    return [Math.cos(a) * rx, 1.62 + Math.sin(a) * 0.59 * k];
  };
  for (const k of [1, 1.05]) {
    for (let i = 0; i < 168; i++) {
      const a = (i / 168) * TAU;
      const [x, y] = puntoTorso(a, k);
      const enCuello = y < 1.08 && Math.abs(x) < 0.24;
      if (!enCuello && !unionesTorso.some((u) => dentroCirculo(x, y, u))) agregar(x, y, "torso");
    }
  }
  const panza = { x: 0, y: 1.72, rx: 0.32, ry: 0.39 };
  for (let i = 0; i < 72; i++) { const a = (i / 72) * TAU; agregar(Math.cos(a) * panza.rx, panza.y + Math.sin(a) * panza.ry, "panza"); }
  for (let i = 0; i < 48; i++) { const x = rnd(-0.3, 0.3), y = rnd(1.34, 2.1); if (dentroElipse(x, y, panza)) agregar(x, y, "panza", 0.22); }

  // ======================= EXTREMIDADES (con adelgazamiento natural y relleno suave) =======================
  const cadenaPuntos = (grupo, n, anchoInicio, anchoFin, densidadRelleno = 0.28) => {
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const ancho = anchoInicio + (anchoFin - anchoInicio) * u;
      for (const lado of [-1, 1]) agregar(0, 0, grupo, 1, { u, lado, ancho });
      if (i > 1 && i < n - 1 && Math.random() < densidadRelleno) {
        agregar(0, 0, grupo, 0.26, { u, lado: rnd(-0.55, 0.55), ancho });
      }
    }
  };
  cadenaPuntos("brazoD", 58, 0.112, 0.072, 0.32);
  cadenaPuntos("brazoI", 44, 0.104, 0.068, 0.32);
  cadenaPuntos("piernaI", 36, 0.108, 0.068, 0.3);
  cadenaPuntos("piernaD", 36, 0.108, 0.068, 0.3);

  // Pies colgantes orgánicos (contorno de gota + relleno suave + detalle de dedos)
  for (const g of ["pieI", "pieD"]) {
    for (let i = 0; i < 28; i++) agregar(0, 0, g, 1, { tipo: "borde", a: (i / 28) * TAU });
    for (let i = 0; i < 10; i++) agregar(0, 0, g, 0.28, { tipo: "relleno", u: rnd(0.18, 0.86), v: rnd(-0.6, 0.6) });
    for (const v of [-0.34, 0.34]) for (let i = 0; i < 4; i++) agregar(0, 0, g, 0.85, { tipo: "dedoPie", t: i / 3, v });
  }

  // Mano que agarra la rama: palma debajo + 4 dedos curvados rodeando el frente + pulgar
  for (let i = 0; i <= 26; i++) agregar(0, 0, "palmaD", 1, { tipo: "copa", t: i / 26 });
  for (let i = 0; i < 14; i++) agregar(0, 0, "palmaD", 0.28, { tipo: "relleno", rx: rnd(-0.12, 0.12), ry: rnd(0.08, 0.19) });
  for (let f = 0; f < 4; f++) {
    for (let i = 0; i < 16; i++) agregar(0, 0, "dedoD", 1, { f, tipo: "borde", a: (i / 16) * TAU });
    for (let i = 0; i < 4; i++) agregar(0, 0, "dedoD", 0.32, { f, tipo: "relleno", ox: rnd(-0.45, 0.45), oy: rnd(-0.55, 0.55) });
  }
  for (let i = 0; i < 14; i++) agregar(0, 0, "pulgarD", 1, { a: (i / 14) * TAU });

  // Mano libre: palma orgánica conectada a la muñeca + 4 dedos espaciados con punta redonda + pulgar
  for (let i = 0; i < 26; i++) agregar(0, 0, "palmaI", 1, { tipo: "borde", a: (i / 26) * TAU });
  for (let i = 0; i < 12; i++) agregar(0, 0, "palmaI", 0.26, { tipo: "relleno", r: Math.sqrt(rnd(0, 0.72)), a: rnd(0, TAU) });
  for (let f = 0; f < 5; f++) {
    for (let i = 0; i <= 7; i++) for (const lado of [-1, 1]) agregar(0, 0, "dedoI", 0.96, { f, tipo: "lado", t: i / 7, lado });
    for (let i = 0; i < 5; i++) agregar(0, 0, "dedoI", 1, { f, tipo: "punta", a: -Math.PI / 2 + (i / 4) * Math.PI });
  }

  // Cola: adelgazamiento suave hasta una punta redondeada y cerrada + relleno central
  for (let i = 0; i <= 54; i++) {
    const u = i / 54;
    const ancho = 0.062 * (1 - 0.62 * u ** 0.85);
    for (const lado of [-1, 1]) agregar(0, 0, "cola", 1, { u, lado, ancho });
    if (i > 1 && i < 54 && i % 2 === 0) agregar(0, 0, "cola", 0.3, { u, lado: rnd(-0.45, 0.45), ancho });
  }
  for (let i = 0; i <= 12; i++) agregar(0, 0, "colaPunta", 1, { a: -Math.PI / 2 + (i / 12) * Math.PI });

  // ======================= RAMA Y HOJAS (brotes curvos y hojas unidas al tallo) =======================
  for (let i = 0; i < 210; i++) {
    const u = i / 209, grosor = 0.095 * (1.16 - u * 0.48);
    agregar(0, 0, "rama", 1, { u, ox: 0, oy: -grosor });
    agregar(0, 0, "rama", 1, { u, ox: 0, oy: grosor });
    if (Math.random() < 0.38) agregar(0, 0, "rama", 0.38, { u, ox: 0, oy: rnd(-grosor * 0.8, grosor * 0.8) });
  }
  // Hoja almendrada con punta definida que nace justo en (ox, oy)
  const hoja = (u, ox, oy, ang, tam) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const lx = t * tam * 2;
      const ly = Math.sin(t * Math.PI) * tam * 0.56 * (1 - 0.18 * t);
      for (const signo of [-1, 1]) {
        agregar(0, 0, "hoja", 0.95, { u, ox: ox + lx * c - (signo * ly) * s, oy: oy + lx * s + (signo * ly) * c });
      }
      if (i > 0 && i < 10 && i % 2 === 0) {
        agregar(0, 0, "hoja", 0.45, { u, ox: ox + lx * c, oy: oy + lx * s });
      }
    }
  };
  // Ramitas ligeramente curvas con hojas pegadas al tallo (sin huecos flotantes)
  for (const [u, dir, largo] of [[0.14, -1, 0.52], [0.28, 1, 0.36], [0.84, -1, 0.48], [0.92, 1, 0.34]]) {
    const ang = dir < 0 ? -0.78 : 0.72;
    const curva = dir < 0 ? -0.18 : 0.16;
    const pt = (t) => {
      const a = ang + curva * t;
      return [Math.cos(a) * largo * t, Math.sin(a) * largo * t];
    };
    for (let i = 0; i <= 14; i++) {
      const [bx, by] = pt(i / 14);
      agregar(0, 0, "rama", 0.82, { u, ox: bx, oy: by });
    }
    const [tx, ty] = pt(1);
    const [mx, my] = pt(0.58);
    hoja(u, tx, ty, ang + curva + 0.18, 0.155);
    hoja(u, mx, my, ang + (dir < 0 ? -0.78 : 0.78), 0.13);
  }
  hoja(0.05, 0, -0.05, -0.5, 0.14);
  hoja(0.96, 0, 0.04, 0.35, 0.15);

  const CABEZA = new Set(["contorno", "orejaI", "orejaD", "pelo", "cara", "relleno", "ojoI", "ojoD", "nariz", "boca", "lengua"]);
  const RASGOS = new Set(["ojoI", "ojoD", "nariz", "lengua", "boca"]);
  const CON_GLIFOS = new Set(["contorno", "pelo", "relleno", "torso"]);
  const ps = puntos.map((p) => ({
    ...p,
    cabeza: CABEZA.has(p.grupo),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    oculto: false,
    glifo: CON_GLIFOS.has(p.grupo) && Math.random() < 0.055 ? GLIFOS[(Math.random() * GLIFOS.length) | 0] : null,
    tam: RASGOS.has(p.grupo) ? rnd(2, 2.75) : p.grupo.startsWith("dedo") || p.grupo === "pulgarD" || p.grupo === "colaPunta" ? rnd(1.3, 1.85) : rnd(1.15, 2.15),
  }));
  const polvo = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, f: Math.random() * TAU, glifo: Math.random() < 0.15 ? GLIFOS[(Math.random() * GLIFOS.length) | 0] : null }));

  // ======================= ESTADO =======================
  let W = 0, H = 0, dpr = 1, escala = 1;
  const raton = { x: -9999, y: -9999, px: -9999, py: -9999, dentro: false, vel: 0, dx: 0, lx: 0, ly: 0 };
  const MANO = [1.14, -1.4]; // la mano que agarra: punto de giro del péndulo
  const est = {
    mirarX: 0, mirarY: 0, giro: 0, parpadeo: 0, proxParpadeo: 1.5, lengua: 0, proxLengua: 4, reinicio: 0, respira: 0,
    ladeo: 0, ladeoObj: 0, proxLadeo: 3,
    th: 0.12, om: 0, alfa: 0, golpe: 0, // péndulo
    incl: 0, inclV: 0, // inclinación del torso
    agarre: 0.65, // 0 = relajado, 1 = apretado
    alcance: 0, manoI: [HOMBRO_I[0] - 0.36, HOMBRO_I[1] + 1.16], // brazo libre
    piernas: [
      // Izquierda ligeramente recogida y juguetona; derecha colgando más suelta (pose natural asimétrica)
      { a1: Math.PI / 2 + 0.42, v1: 0, a2: -0.58, v2: 0, pr: 0.42, vp: 0, r1: Math.PI / 2 + 0.42, r2: -0.58, rp: 0.42, k1: 25, c1: 3.1, k2: 18, fase: 0 },
      { a1: Math.PI / 2 - 0.16, v1: 0, a2: 0.28, v2: 0, pr: -0.34, vp: 0, r1: Math.PI / 2 - 0.16, r2: 0.28, rp: -0.34, k1: 21, c1: 2.7, k2: 15, fase: 2.2 },
    ],
    cola: null, // cadena Verlet en pantalla
  };
  const esq = {}; // esqueleto del cuadro actual (coordenadas locales)
  let colores = {};
  const ondas = []; // ondas sutiles al hacer clic
  const leerColores = () => {
    const s = getComputedStyle(document.documentElement);
    colores = {
      p: s.getPropertyValue("--particula").trim(),
      p2: s.getPropertyValue("--particula-2").trim(),
      brand: s.getPropertyValue("--brand").trim() || "#f3ca47",
      accent: s.getPropertyValue("--accent").trim() || "#7a5c00",
    };
  };
  function medir() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    escala = Math.min(W * 0.195, H * 0.175);
    if (!ps[0].x) for (const p of ps) { p.x = W / 2 + rnd(-W, W) * 0.6; p.y = H / 2 + rnd(-H, H) * 0.6; }
    est.cola = null; // se rehace con la nueva escala
  }

  // Rama
  const pivoteX = () => W * 0.54;
  const comba = () => 3 + Math.abs(est.om) * 5 + est.golpe;
  const yRama = (x) => H * 0.12 + (x / W - 0.54) * H * 0.05 + Math.sin((x / W) * 5) * 4 + comba() * Math.exp(-(((x - pivoteX()) / (W * 0.28)) ** 2));

  // Local → pantalla (péndulo alrededor de la mano) y al revés
  const aPantalla = (x, y) => {
    const px = pivoteX(), py = yRama(px);
    const [rx, ry] = rot(x - MANO[0], y - MANO[1], 0, 0, est.th);
    return [px + rx * escala, py + ry * escala];
  };
  const aLocal = (sx, sy) => {
    const px = pivoteX(), py = yRama(px);
    const [rx, ry] = rot((sx - px) / escala, (sy - py) / escala, 0, 0, -est.th);
    return [rx + MANO[0], ry + MANO[1]];
  };
  // Torso: se inclina alrededor del cuello y respira suavemente
  const enTorso = (x, y) => {
    const sx = 1 + 0.02 * Math.sin(est.respira) + 0.025 * Math.min(1, Math.abs(est.om)), sy = 2 - sx;
    const dx = (x - CUELLO[0]) * sx, dy = (y - CUELLO[1]) * sy;
    return rot(CUELLO[0] + dx, CUELLO[1] + dy, CUELLO[0], CUELLO[1], est.incl);
  };
  // Cinemática inversa de dos huesos; signo elige hacia dónde dobla el codo
  function ik(a, b, l1, l2, signo) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.001);
    const fi = Math.atan2(dy, dx), al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const codo = [a[0] + Math.cos(fi + signo * al) * l1, a[1] + Math.sin(fi + signo * al) * l1];
    const fin = [a[0] + Math.cos(fi) * d, a[1] + Math.sin(fi) * d];
    return [codo, fin];
  }
  // Punto sobre una curva cuadrática que pasa por a, m y b
  function enCurva(a, m, b, u, lado, ancho) {
    const c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2];
    const B = (t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
    const [x, y] = B(u), [x2, y2] = B(Math.min(1, u + 0.01)), [x0, y0] = B(Math.max(0, u - 0.01));
    let nx = -(y2 - y0), ny = x2 - x0; const l = Math.hypot(nx, ny) || 1;
    return [x + (nx / l) * ancho * lado, y + (ny / l) * ancho * lado];
  }

  // ======================= ESQUELETO DEL CUADRO =======================
  function armarEsqueleto(t) {
    // Mano de la rama: alineada con la rama (gira al revés que el cuerpo para no soltarla)
    const aMano = (x, y) => { const [rx, ry] = rot(x, y, 0, 0, -est.th); return [MANO[0] + rx, MANO[1] + ry]; };
    esq.aMano = aMano;
    esq.munecaD = aMano(0, 0.21);
    const hD = enTorso(...HOMBRO_D);
    [esq.codoD] = ik(hD, esq.munecaD, 1.38, 1.34, 1);
    esq.hombroD = hD;

    // Brazo libre: proporciones equilibradas (curva suave en reposo, alcanza hacia el cursor)
    const hI = enTorso(...HOMBRO_I);
    esq.hombroI = hI;
    const reposo = rot(hI[0] - 0.36, hI[1] + 1.16, hI[0], hI[1], -est.om * 0.28 + est.incl * 0.45 + Math.sin(t * 0.9) * 0.05);
    const cerca = raton.dentro && Math.hypot(raton.lx - hI[0], raton.ly - hI[1]) < 3.2;
    let objetivo = reposo;
    if (est.alcance > 0.001) {
      const dx = raton.lx - hI[0], dy = raton.ly - hI[1], d = Math.hypot(dx, dy) || 1, max = Math.min(d, 1.34);
      const alc = [hI[0] + (dx / d) * max, hI[1] + (dy / d) * max];
      objetivo = [reposo[0] + (alc[0] - reposo[0]) * est.alcance, reposo[1] + (alc[1] - reposo[1]) * est.alcance];
    }
    esq.cerca = cerca; esq.objetivoI = objetivo;
    const [codoI, munecaI] = ik(hI, est.manoI, 0.72, 0.68, 1);
    esq.codoI = codoI; esq.munecaI = munecaI;
    const dir = Math.atan2(munecaI[1] - codoI[1], munecaI[0] - codoI[0]);
    const fx = Math.cos(dir), fy = Math.sin(dir);
    // Vector interior hacia el torso (lado del pulgar)
    const ix = fy, iy = -fx;
    esq.enManoI = (lx, ly) => [munecaI[0] + fx * lx + ix * ly, munecaI[1] + fy * lx + iy * ly];
    esq.dedosI = [];
    const abre = est.alcance;
    const largosI = [0.115, 0.145, 0.155, 0.135]; // meñique → índice
    for (let f = 0; f < 4; f++) {
      const angBase = (f - 1.5) * (0.38 + abre * 0.14);
      const bx = 0.088 + Math.cos(angBase) * 0.088;
      const by = Math.sin(angBase) * 0.092;
      const angF = angBase * 1.18 + (1 - abre) * 0.08 + Math.sin(t * 1.3 + f * 0.8) * 0.035;
      esq.dedosI.push({ bx, by, ang: angF, len: largosI[f], w0: 0.0155, w1: 0.011 });
    }
    // Pulgar en el lado interior (+ly), bien separado de la palma
    esq.dedosI.push({ bx: 0.048, by: 0.084, ang: 1.02 + abre * 0.22, len: 0.11, w0: 0.017, w1: 0.012 });

    // Piernas: dos huesos con ángulos de resorte; pies colgantes naturales
    esq.piernas = est.piernas.map((pg, i) => {
      const cad = enTorso(...(i === 0 ? CADERA_I : CADERA_D));
      const ang1 = pg.a1 + est.incl, rod = [cad[0] + Math.cos(ang1) * 0.48, cad[1] + Math.sin(ang1) * 0.48];
      const ang2 = ang1 + pg.a2, tob = [rod[0] + Math.cos(ang2) * 0.46, rod[1] + Math.sin(ang2) * 0.46];
      return { cad, rod, tob, angPie: ang2 + pg.pr };
    });
  }

  // ======================= COLA (Verlet en pantalla + rizo cerrado y suave) =======================
  const N_COLA = 24, L_COLA = 0.088;
  function formaCola(t) {
    const pts = [enTorso(...BASE_COLA)];
    let ang = 0.72 + est.incl * 0.7;
    for (let i = 1; i < N_COLA; i++) {
      const k = i / (N_COLA - 1);
      const rizo = k < 0.5 ? 0.092 + 0.04 * k : 0.095 + 0.34 * ((k - 0.48) / 0.52) ** 1.55;
      ang -= rizo + Math.sin(t * 1.45 + i * 0.36) * 0.026 + Math.sin(t * 0.7 + i * 0.18) * 0.016;
      const prev = pts[i - 1];
      pts.push([prev[0] + Math.cos(ang) * L_COLA, prev[1] + Math.sin(ang) * L_COLA]);
    }
    return pts.map((q) => aPantalla(...q));
  }
  function fisicaCola(t) {
    const reposo = formaCola(t);
    if (!est.cola) est.cola = reposo.map(([x, y]) => ({ x, y, px: x, py: y }));
    const c = est.cola, seg = L_COLA * escala, g = 0.0018 * escala;
    c[0].x = c[0].px = reposo[0][0]; c[0].y = c[0].py = reposo[0][1];
    for (let i = 1; i < N_COLA; i++) {
      const p = c[i], vx = (p.x - p.px) * 0.92, vy = (p.y - p.py) * 0.92;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g;
      // Firme en la base y con resorte suave en la punta para conservar el rizo limpio
      const k = 0.19 * (1 - i / N_COLA) ** 1.35 + 0.028;
      p.x += (reposo[i][0] - p.x) * k; p.y += (reposo[i][1] - p.y) * k;
      if (raton.dentro) {
        const dx = p.x - raton.x, dy = p.y - raton.y, d = Math.hypot(dx, dy), r = escala * 0.75;
        if (d < r && d > 0.01) { const f = (1 - d / r) * 2.0; p.x += (dx / d) * f; p.y += (dy / d) * f; }
      }
    }
    for (let it = 0; it < 5; it++) for (let i = 1; i < N_COLA; i++) {
      const a = c[i - 1], b = c[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, dif = (d - seg) / d;
      if (i === 1) { b.x -= dx * dif; b.y -= dy * dif; }
      else { a.x += dx * dif * 0.5; a.y += dy * dif * 0.5; b.x -= dx * dif * 0.5; b.y -= dy * dif * 0.5; }
    }
  }
  function tangenteCola(i) {
    const c = est.cola;
    const prev = c[Math.max(0, i - 1)], next = c[Math.min(N_COLA - 1, i + 1)];
    const dx = next.x - prev.x, dy = next.y - prev.y, l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  }
  function enCola(u, lado, ancho) {
    const c = est.cola, f = u * (N_COLA - 1), i = Math.min(N_COLA - 2, Math.floor(f)), r = f - i;
    const a = c[i], b = c[i + 1], x = a.x + (b.x - a.x) * r, y = a.y + (b.y - a.y) * r;
    const [t0x, t0y] = tangenteCola(i), [t1x, t1y] = tangenteCola(i + 1);
    let tx = t0x + (t1x - t0x) * r, ty = t0y + (t1y - t0y) * r;
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    return [x - ty * ancho * escala * lado, y + tx * ancho * escala * lado];
  }
  function enColaPunta(ang) {
    const c = est.cola, ult = c[N_COLA - 1];
    const [tx, ty] = tangenteCola(N_COLA - 1);
    const radio = 0.0235 * escala;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    return [ult.x + (tx * ca - ty * sa) * radio, ult.y + (ty * ca + tx * sa) * radio];
  }

  // ======================= DÓNDE VA CADA PARTÍCULA =======================
  function destino(p, t) {
    p.oculto = false;
    const g = p.grupo;
    if (g === "rama" || g === "hoja") {
      const bx = -0.05 * W + p.u * W * 1.1;
      const viento = g === "hoja" ? Math.sin(t * 1.7 + p.u * 9) * 0.032 : 0;
      const sx = bx + (p.ox + viento) * escala;
      const sy = yRama(bx) + (p.oy + viento * 0.45) * escala;
      // Ocultar el tramo de rama que queda detrás de los dedos agarrados para dar profundidad
      if (g === "rama") {
        const px = pivoteX(), py = yRama(px);
        if (Math.abs(sx - px) < 0.165 * escala && sy > py - 0.1 * escala && sy < py + 0.095 * escala) p.oculto = true;
      }
      return [sx, sy];
    }
    if (g === "cola") return enCola(p.u, p.lado, p.ancho);
    if (g === "colaPunta") return enColaPunta(p.a);
    let x = p.hx, y = p.hy;
    if (p.cabeza) {
      if (g === "ojoI" || g === "ojoD") {
        const c = g === "ojoI" ? ojosZona[0] : ojosZona[1];
        const gi = est.reinicio > 0 ? Math.sin(est.reinicio * Math.PI) * Math.PI * 0.75 : 0;
        const cg = Math.cos(gi), sg = Math.sin(gi);
        const ex = x * cg - y * sg, ey = (x * sg + y * cg) * (1 - est.parpadeo * 0.88);
        x = c.x + ex + est.mirarX * 0.09; y = c.y + ey + est.mirarY * 0.07;
      } else if (g === "lengua") {
        const fuera = 0.72 + est.lengua * 0.4;
        y = 0.48 + (y - 0.48) * fuera + Math.sin(t * 6 + y * 8) * 0.012 * est.lengua;
        x += Math.sin(t * 3) * 0.018 * est.lengua;
      } else if (g === "nariz" || g === "boca" || g === "relleno") {
        x += est.mirarX * 0.03; y += est.mirarY * 0.02;
      } else if (g === "orejaI" || g === "orejaD") {
        y += Math.sin(t * 2.2 + (g === "orejaI" ? 0 : 1.3)) * 0.012;
      }
      [x, y] = rot(x, y, 0, 0.85, est.giro + est.ladeo - est.th * 0.45 + est.incl * 0.4);
      return aPantalla(x, y);
    }
    if (g === "torso" || g === "panza") [x, y] = enTorso(x, y);
    else if (g === "brazoD") [x, y] = enCurva(esq.hombroD, esq.codoD, esq.munecaD, p.u, p.lado, p.ancho);
    else if (g === "brazoI") [x, y] = enCurva(esq.hombroI, esq.codoI, esq.munecaI, p.u, p.lado, p.ancho);
    else if (g === "piernaI" || g === "piernaD") {
      const pg = esq.piernas[g === "piernaI" ? 0 : 1];
      [x, y] = enCurva(pg.cad, pg.rod, pg.tob, p.u, p.lado, p.ancho);
    } else if (g === "pieI" || g === "pieD") {
      const pg = esq.piernas[g === "pieI" ? 0 : 1], a = pg.angPie;
      const ca = Math.cos(a), sa = Math.sin(a);
      let lx = 0, ly = 0;
      if (p.tipo === "borde") {
        // Silueta de gota orgánica: talón fino en el tobillo, frente redondeado hacia los dedos
        const ct = Math.cos(p.a), st = Math.sin(p.a);
        lx = 0.095 + ct * 0.135;
        const anchoLocal = 0.068 * (0.78 + 0.28 * ((ct + 1) * 0.5));
        ly = st * anchoLocal;
        if (lx < 0.005 && Math.abs(ly) < 0.044) p.oculto = true;
      } else if (p.tipo === "relleno") {
        lx = -0.01 + p.u * 0.21;
        ly = p.v * 0.052 * Math.sin(p.u * Math.PI);
      } else {
        lx = 0.165 + p.t * 0.052;
        ly = p.v * 0.06;
      }
      [x, y] = [pg.tob[0] + lx * ca - ly * sa, pg.tob[1] + lx * sa + ly * ca];
    } else if (g === "palmaD") {
      if (p.tipo === "copa") {
        const ang = p.t * Math.PI; // 0 (der) → π (izq) por debajo de la rama
        const lx = Math.cos(ang) * 0.155;
        const ly = 0.065 + Math.sin(ang) * 0.15;
        if (Math.abs(lx) < 0.064 && ly > 0.185) p.oculto = true;
        [x, y] = esq.aMano(lx, ly);
      } else {
        [x, y] = esq.aMano(p.rx, p.ry);
      }
    } else if (g === "dedoD") {
      const fx = -0.114 + p.f * 0.076;
      const rx = 0.035;
      const ry = 0.088 + (p.f === 1 || p.f === 2 ? 0.011 : 0);
      const fy = -0.012 + est.agarre * 0.014 + Math.sin(t * 1.2 + p.f * 0.9) * 0.006;
      if (p.tipo === "borde") {
        [x, y] = esq.aMano(fx + Math.cos(p.a) * rx, fy + Math.sin(p.a) * ry);
      } else {
        [x, y] = esq.aMano(fx + p.ox * rx, fy + p.oy * ry);
      }
    } else if (g === "pulgarD") {
      const lx = Math.cos(p.a) * 0.052, ly = Math.sin(p.a) * 0.028;
      const [rx, ry] = rot(lx, ly, 0, 0, 0.45);
      [x, y] = esq.aMano(-0.168 + rx, 0.092 + ry);
    } else if (g === "palmaI") {
      if (p.tipo === "borde") {
        const lx = 0.088 + Math.cos(p.a) * 0.088;
        const ly = Math.sin(p.a) * 0.092;
        if (lx < 0.018 && Math.abs(ly) < 0.062) p.oculto = true;
        [x, y] = esq.enManoI(lx, ly);
      } else {
        [x, y] = esq.enManoI(0.088 + Math.cos(p.a) * 0.07 * p.r, Math.sin(p.a) * 0.072 * p.r);
      }
    } else if (g === "dedoI") {
      const d = esq.dedosI[p.f];
      const ca = Math.cos(d.ang), sa = Math.sin(d.ang);
      if (p.tipo === "lado") {
        const dist = p.t * d.len;
        const w = d.w0 + (d.w1 - d.w0) * p.t;
        const lx = d.bx + ca * dist - sa * w * p.lado;
        const ly = d.by + sa * dist + ca * w * p.lado;
        [x, y] = esq.enManoI(lx, ly);
      } else {
        const cx = d.bx + ca * d.len, cy = d.by + sa * d.len;
        const pa = d.ang + p.a;
        [x, y] = esq.enManoI(cx + Math.cos(pa) * d.w1, cy + Math.sin(pa) * d.w1);
      }
    }
    if (tapaCabeza(x, y) && g !== "dedoD" && g !== "palmaD" && g !== "pulgarD") p.oculto = true;
    return aPantalla(x, y);
  }

  // ======================= FÍSICA (paso fijo de 1/60 s) =======================
  function actualizar(dt, t) {
    raton.dx = raton.x - raton.px;
    raton.vel = raton.vel * 0.8 + (Math.hypot(raton.dx, raton.y - raton.py) / dt) * 0.2;
    raton.px = raton.x; raton.py = raton.y;
    if (raton.dentro) [raton.lx, raton.ly] = aLocal(raton.x, raton.y);

    const [mx, my] = aPantalla(0, 0.6);
    const objX = raton.dentro ? clamp((raton.x - mx) / (W * 0.4), -1, 1) : Math.sin(t * 0.4) * 0.3;
    const objY = raton.dentro ? clamp((raton.y - my) / (H * 0.4), -1, 1) : Math.cos(t * 0.3) * 0.2;
    est.mirarX += (objX - est.mirarX) * suave(dt, 5); est.mirarY += (objY - est.mirarY) * suave(dt, 5);
    est.giro += (objX * 0.22 - est.giro) * suave(dt, 2.5);
    est.respira += dt * 1.6;

    // Péndulo
    let impulso = raton.dentro ? 0 : 0.1 * Math.sin(t * 2.4);
    if (raton.dentro && Math.hypot(raton.x - mx, raton.y - my) < escala * 3) impulso += clamp(raton.dx, -40, 40) * 0.06;
    est.alfa = -6.5 * Math.sin(est.th) - 0.45 * est.om + impulso;
    est.om += est.alfa * dt; est.th += est.om * dt;
    est.golpe *= Math.exp(-dt * 4);

    // Torso: se inclina hacia el cursor (resorte con inercia) y contra el balanceo
    const inclObj = raton.dentro ? clamp(raton.lx * 0.07, -0.18, 0.18) : Math.sin(t * 0.7) * 0.05;
    const inclA = (inclObj - est.incl) * 14 - est.inclV * 4.5 - est.alfa * 0.02;
    est.inclV += inclA * dt; est.incl += est.inclV * dt;

    // Agarre: más fuerte cuanto más rápido se balancea; respira un poco
    est.agarre += (clamp(0.55 + Math.abs(est.om) * 0.6, 0, 1) + Math.sin(t * 0.8) * 0.08 - est.agarre) * suave(dt, 4);

    // Brazo libre: interpolación suave hacia el objetivo
    armarEsqueleto(t);
    est.alcance += ((esq.cerca ? 1 : 0) - est.alcance) * suave(dt, esq.cerca ? 2.5 : 3.5);
    est.manoI[0] += (esq.objetivoI[0] - est.manoI[0]) * suave(dt, 6);
    est.manoI[1] += (esq.objetivoI[1] - est.manoI[1]) * suave(dt, 6);

    // Piernas: cada una es un resorte con su rigidez y su fase (balanceo independiente)
    for (const [i, pg] of est.piernas.entries()) {
      const empuje = -est.alfa * 0.05 - est.om * 0.35 - est.inclV * 0.4 + Math.sin(t * (1.1 + i * 0.35) + pg.fase) * 0.06;
      pg.v1 += ((pg.r1 + empuje - pg.a1) * pg.k1 - pg.v1 * pg.c1) * dt; pg.a1 += pg.v1 * dt;
      pg.v2 += ((pg.r2 - pg.a2) * pg.k2 - pg.v2 * 2.2 - pg.v1 * 4) * dt; pg.a2 += pg.v2 * dt;
      // Pie: reacciona con retraso a lo que hace el torso
      pg.vp += ((pg.rp - pg.pr) * 26 - pg.vp * 3.2 - est.inclV * 4 - est.om * 2.4 - pg.v2 * 1.8) * dt; pg.pr += pg.vp * dt;
    }

    est.proxParpadeo -= dt;
    if (est.proxParpadeo <= 0) { est.parpadeo = 1; est.proxParpadeo = rnd(2.5, 6); }
    est.parpadeo = Math.max(0, est.parpadeo - dt * 7);
    est.proxLengua -= dt;
    const lenguaObj = est.proxLengua < 0 && est.proxLengua > -1.6 ? 1 : 0;
    if (est.proxLengua < -1.6) est.proxLengua = rnd(4, 9);
    est.lengua += (lenguaObj - est.lengua) * suave(dt, 6);
    est.proxLadeo -= dt;
    if (est.proxLadeo <= 0) { est.proxLadeo = rnd(3, 7); est.ladeoObj = raton.dentro ? 0 : rnd(-0.18, 0.18); }
    est.ladeo += (est.ladeoObj - est.ladeo) * suave(dt, 1.5);
    est.reinicio = Math.max(0, est.reinicio - dt * 1.2);

    armarEsqueleto(t);
    fisicaCola(t);

    const rRep = Math.min(W, H) * 0.11, rapido = raton.vel > 1400;
    for (const p of ps) {
      const [tx, ty] = destino(p, t);
      p.vx += (tx - p.x) * 0.085; p.vy += (ty - p.y) * 0.085;
      if (raton.dentro) {
        const ex = p.x - raton.x, ey = p.y - raton.y, d = Math.hypot(ex, ey), radio = rapido ? rRep * 1.8 : rRep;
        if (d < radio && d > 0.01) { const f = (1 - d / radio) ** 2 * (rapido ? 9 : 2.6); p.vx += (ex / d) * f; p.vy += (ey / d) * f; }
      }
      p.vx *= 0.78; p.vy *= 0.78; p.x += p.vx; p.y += p.vy;
      if (p.glifo && Math.random() < 0.004) p.glifo = GLIFOS[(Math.random() * GLIFOS.length) | 0];
    }
    for (const q of polvo) {
      q.f += dt * 0.3;
      q.vx += Math.cos(q.f + q.y * 6) * 0.00004; q.vy += Math.sin(q.f * 0.7 + q.x * 5) * 0.00004 - 0.000012;
      if (raton.dentro) { const ex = q.x * W - raton.x, ey = q.y * H - raton.y, d = Math.hypot(ex, ey); if (d < rRep && d > 0.01) { q.vx += (ex / d) * 0.0006; q.vy += (ey / d) * 0.0006; } }
      q.vx *= 0.96; q.vy *= 0.96; q.x += q.vx; q.y += q.vy;
      if (q.x < -0.02) q.x = 1.02; if (q.x > 1.02) q.x = -0.02; if (q.y < -0.02) q.y = 1.02; if (q.y > 1.02) q.y = -0.02;
    }
    for (let i = ondas.length - 1; i >= 0; i--) {
      ondas[i].p += dt * 2.1;
      if (ondas[i].p >= 1) ondas.splice(i, 1);
    }
  }

  function dibujar(estela = true) {
    if (estela) {
      ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = 0.34;
      ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over";
    } else ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `500 ${Math.max(9, escala * 0.1)}px ui-monospace, Consolas, monospace`;
    for (const o of ondas) {
      const ease = 1 - (1 - o.p) ** 3;
      ctx.beginPath();
      ctx.arc(o.x, o.y, 10 + ease * escala * 1.45, 0, TAU);
      ctx.strokeStyle = colores.brand;
      ctx.lineWidth = 1.5 * (1 - o.p);
      ctx.globalAlpha = (1 - o.p) * 0.55;
      ctx.stroke();
    }
    ctx.fillStyle = colores.p2;
    for (const q of polvo) { ctx.globalAlpha = 0.35; if (q.glifo) ctx.fillText(q.glifo, q.x * W, q.y * H); else ctx.fillRect(q.x * W, q.y * H, 1.2, 1.2); }
    const impulsoActivo = est.reinicio > 0.08;
    for (const p of ps) {
      if (p.oculto) continue;
      const vel = Math.min(1, Math.hypot(p.vx, p.vy) / 11);
      if (p.grupo === "rama") ctx.fillStyle = colores.p2;
      else if (p.grupo === "lengua" || (impulsoActivo && (p.grupo === "ojoI" || p.grupo === "ojoD"))) ctx.fillStyle = colores.accent;
      else if (vel > 0.52) ctx.fillStyle = colores.brand;
      else ctx.fillStyle = colores.p;
      ctx.globalAlpha = Math.min(1, p.peso * (0.76 + vel * 0.24)) * (p.grupo === "hoja" ? 0.72 : 1);
      if (p.glifo) ctx.fillText(p.glifo, p.x, p.y);
      else ctx.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam);
    }
    ctx.globalAlpha = 1;
  }

  // ======================= BUCLE =======================
  const PASO = 1 / 60;
  let activo = true, visible = true, ultimo = performance.now(), raf = 0, acum = 0, reloj = 0;
  function sincronizarBoton() {
    if (!botonPausa) return;
    if (pausadoPorUsuario) {
      botonPausa.dataset.pausado = "";
      botonPausa.setAttribute("aria-label", botonPausa.dataset.reanudarAria || "Play");
      if (etiquetaPausa) etiquetaPausa.textContent = botonPausa.dataset.reanudar || "Play";
    } else {
      delete botonPausa.dataset.pausado;
      botonPausa.setAttribute("aria-label", botonPausa.dataset.pausarAria || "Pause");
      if (etiquetaPausa) etiquetaPausa.textContent = botonPausa.dataset.pausar || "Pause";
    }
  }
  function cuadro(ahora) {
    if (pausadoPorUsuario) { raf = 0; return; }
    acum = Math.min(0.25, acum + (ahora - ultimo) / 1000); ultimo = ahora;
    while (acum >= PASO) { reloj += PASO; actualizar(PASO, reloj); acum -= PASO; }
    dibujar();
    raf = activo && visible && !pausadoPorUsuario ? requestAnimationFrame(cuadro) : 0;
  }
  const detener = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  const arrancar = () => { if (!raf && activo && visible && !pausadoPorUsuario) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) arrancar(); else detener(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { activo = !document.hidden; if (activo) arrancar(); else detener(); });

  function estatico() {
    est.th = 0.08; est.om = 0;
    armarEsqueleto(0); est.cola = null; fisicaCola(0);
    for (const p of ps) { const [x, y] = destino(p, 0); p.x = x; p.y = y; p.vx = p.vy = 0; }
    ondas.length = 0;
    dibujar(false);
  }

  botonPausa?.addEventListener("click", () => {
    pausadoPorUsuario = !pausadoPorUsuario;
    sincronizarBoton();
    if (pausadoPorUsuario) {
      detener();
      ondas.length = 0;
      dibujar(false);
    } else {
      arrancar();
    }
  });

  mqReducido.addEventListener("change", (e) => {
    reducido = e.matches;
    pausadoPorUsuario = reducido;
    sincronizarBoton();
    if (pausadoPorUsuario) { detener(); estatico(); }
    else arrancar();
  });

  // ======================= ENTRADA =======================
  const posicion = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener("pointermove", (e) => {
    const [x, y] = posicion(e);
    if (!raton.dentro) { raton.px = x; raton.py = y; }
    raton.x = x; raton.y = y; raton.dentro = true;
  });
  canvas.addEventListener("pointerleave", () => { raton.dentro = false; raton.x = raton.y = -9999; });
  canvas.addEventListener("pointerdown", (e) => {
    const [x, y] = posicion(e);
    for (const p of ps) {
      const ex = p.x - x, ey = p.y - y, d = Math.hypot(ex, ey) || 1, f = 22 * Math.exp(-d / (escala * 1.6));
      p.vx += (ex / d) * f; p.vy += (ey / d) * f;
    }
    if (est.cola) for (const [i, q] of est.cola.entries()) q.px -= (x < q.x ? -1 : 1) * i * 0.9; // latigazo de cola
    est.om += (x < pivoteX() ? 1 : -1) * 1.6; est.golpe = 14;
    est.reinicio = 1; est.lengua = 1; est.proxLengua = -0.2;
    if (!pausadoPorUsuario) ondas.push({ x, y, p: 0 });
    else estatico();
  });

  // El botón de tema del sitio cambia data-theme en <html>: releer los colores
  new MutationObserver(() => { leerColores(); if (pausadoPorUsuario) dibujar(false); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => { medir(); if (pausadoPorUsuario) estatico(); }).observe(canvas);
  } else {
    addEventListener("resize", () => { medir(); if (pausadoPorUsuario) estatico(); });
  }
  leerColores(); medir(); sincronizarBoton();

  if (pausadoPorUsuario) estatico(); else arrancar();
})();
