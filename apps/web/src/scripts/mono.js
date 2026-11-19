// Hero de la portada: un mono abstracto hecho de partículas, colgado de una rama.
// Canvas 2D sin librerías. Esqueleto con cinemática inversa (brazos), resortes (torso, piernas, pies) y
// una cola con física Verlet. Se pausa fuera de pantalla o con la pestaña oculta; con «reducir movimiento»
// se dibuja quieto. Los colores salen de --particula y --particula-2 (tokens), así que sigue al tema.
(() => {
  const canvas = document.querySelector("[data-mono]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    puntos.push({ hx: x + rnd(-0.012, 0.012), hy: y + rnd(-0.012, 0.012), grupo, peso, ...extra });

  const orejas = [{ x: -1.02, y: 0.08, r: 0.3 }, { x: 1.02, y: 0.08, r: 0.3 }];
  const ojosZona = [{ x: -0.3, y: -0.14, r: 0.34 }, { x: 0.3, y: -0.14, r: 0.34 }];
  const hocico = { x: 0, y: 0.4, rx: 0.6, ry: 0.36 };
  // Lo que pasa por detrás de la cabeza no se dibuja (se calcula en cada cuadro)
  const tapaCabeza = (x, y) => dentroCirculo(x, y, { x: 0, y: 0, r: 1.1 }) || orejas.some((o) => dentroCirculo(x, y, { ...o, r: o.r * 1.3 }));

  // ======================= CABEZA (como el logo) =======================
  for (const radio of [1.0, 1.06]) {
    for (let i = 0; i < 260; i++) {
      const a = (i / 260) * TAU, x = Math.cos(a) * radio, y = Math.sin(a) * radio;
      if (!orejas.some((o) => dentroCirculo(x, y, { ...o, r: o.r * radio }))) agregar(x, y, "contorno");
    }
    for (const o of orejas) for (let i = 0; i < 70; i++) {
      const a = (i / 70) * TAU, r = o.r * (radio === 1 ? 1 : 1.2), x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
      if (!dentroCirculo(x, y, { x: 0, y: 0, r: radio })) agregar(x, y, o.x < 0 ? "orejaI" : "orejaD");
    }
  }
  for (let i = 0; i < 18; i++) { const a = rnd(-1.2, 2.2); agregar(1.04 + Math.cos(a) * 0.12, 0.08 + Math.sin(a) * 0.12, "orejaD"); }
  for (let i = 0; i < 70; i++) { const a = 3.55 + (i / 70) * 2.0; agregar(0.12 + Math.cos(a) * 0.74, 0.18 + Math.sin(a) * 0.74, "pelo"); }
  const enMascara = (x, y) => ojosZona.some((c) => dentroCirculo(x, y, c)) || dentroElipse(x, y, hocico);
  const borde = [];
  for (const c of ojosZona) for (let i = 0; i < 110; i++) { const a = (i / 110) * TAU; borde.push([c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r]); }
  for (let i = 0; i < 170; i++) { const a = (i / 170) * TAU; borde.push([hocico.x + Math.cos(a) * hocico.rx, hocico.y + Math.sin(a) * hocico.ry]); }
  for (const [x, y] of borde) {
    const dentro = ojosZona.some((c) => dentroCirculo(x, y, { ...c, r: c.r - 0.005 })) || dentroElipse(x, y, { ...hocico, rx: hocico.rx - 0.005, ry: hocico.ry - 0.005 });
    if (!dentro) agregar(x, y, "cara");
  }
  for (let i = 0; i < 150; i++) { const x = rnd(-0.65, 0.65), y = rnd(-0.5, 0.78); if (enMascara(x, y)) agregar(x, y, "relleno", 0.22); }
  for (const lado of ["ojoI", "ojoD"]) for (let i = 0; i <= 22; i++) {
    const t = (i / 22 - 0.5) * 0.3;
    for (const g of [-0.018, 0, 0.018]) { agregar(t + g, t - g, lado); agregar(t + g, -t + g, lado); }
  }
  for (const sx of [-1, 1]) for (let i = 0; i < 22; i++) { const a = rnd(0, TAU), r = rnd(0, 1); agregar(sx * 0.1 + Math.cos(a) * 0.055 * r, 0.17 + Math.sin(a) * 0.035 * r, "nariz"); }
  for (let i = 0; i < 46; i++) { const t = i / 45; agregar(-0.42 + t * 0.84, 0.44 + Math.sin(t * Math.PI) * 0.06, "boca"); }
  for (const g of [0, 0.022]) {
    for (let i = 0; i < 22; i++) { const t = i / 21; agregar(-0.15 + g, 0.5 + t * 0.26, "lengua"); agregar(0.15 - g, 0.5 + t * 0.26, "lengua"); }
    for (let i = 0; i < 24; i++) { const a = (i / 23) * Math.PI; agregar(Math.cos(a) * (0.15 - g), 0.76 + Math.sin(a) * (0.15 - g), "lengua"); }
  }

  // ======================= TORSO Y PANZA =======================
  const CUELLO = [0, 1.0];
  const torso = { x: 0, y: 1.62, rx: 0.56, ry: 0.62 };
  for (const k of [1, 1.06]) for (let i = 0; i < 150; i++) { const a = (i / 150) * TAU; agregar(torso.x + Math.cos(a) * torso.rx * k, torso.y + Math.sin(a) * torso.ry * k, "torso"); }
  const panza = { x: 0, y: 1.74, rx: 0.33, ry: 0.4 };
  for (let i = 0; i < 70; i++) { const a = (i / 70) * TAU; agregar(Math.cos(a) * panza.rx, panza.y + Math.sin(a) * panza.ry, "panza"); }
  for (let i = 0; i < 40; i++) { const x = rnd(-0.3, 0.3), y = rnd(1.35, 2.1); if (dentroElipse(x, y, panza)) agregar(x, y, "panza", 0.22); }

  // ======================= EXTREMIDADES (paramétricas: se calculan desde el esqueleto) =======================
  const cadenaPuntos = (grupo, n, ancho, afinar = 0) => {
    for (let i = 0; i <= n; i++) for (const lado of [-1, 1]) agregar(0, 0, grupo, 1, { u: i / n, lado, ancho: ancho * (1 - afinar * (i / n)) });
  };
  cadenaPuntos("brazoD", 64, 0.1);
  cadenaPuntos("brazoI", 50, 0.09);
  cadenaPuntos("piernaI", 34, 0.1);
  cadenaPuntos("piernaD", 34, 0.1);
  // Pies: elipses que giran en el tobillo
  for (const g of ["pieI", "pieD"]) for (let i = 0; i < 18; i++) agregar(0, 0, g, 1, { a: (i / 18) * TAU });
  // Palmas
  for (const g of ["palmaD", "palmaI"]) for (let i = 0; i < 20; i++) agregar(0, 0, g, 1, { a: (i / 20) * TAU });
  // Dedos: 4 dedos + pulgar, cada uno con dos falanges (dos segmentos) y nudillos marcados
  for (const g of ["dedoD", "dedoI"]) for (let f = 0; f < 5; f++) for (let seg = 0; seg < 2; seg++) for (let i = 0; i <= 6; i++) agregar(0, 0, g, 1, { f, seg, t: i / 6 });
  // Cola: cadena con física
  cadenaPuntos("cola", 48, 0.055, 0.45);

  // ======================= RAMA =======================
  for (let i = 0; i < 220; i++) {
    const u = i / 219, grosor = 0.1 * (1.15 - u * 0.5);
    agregar(0, 0, "rama", 1, { u, ox: 0, oy: -grosor }); agregar(0, 0, "rama", 1, { u, ox: 0, oy: grosor });
    if (Math.random() < 0.35) agregar(0, 0, "rama", 0.4, { u, ox: 0, oy: rnd(-grosor, grosor) });
  }
  const hoja = (u, ox, oy, ang, tam) => {
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * TAU, lx = Math.cos(t) * tam, ly = Math.sin(t) * tam * 0.38;
      agregar(0, 0, "hoja", 1, { u, ox: ox + lx * Math.cos(ang) - ly * Math.sin(ang), oy: oy + lx * Math.sin(ang) + ly * Math.cos(ang) });
    }
    for (let i = 0; i < 6; i++) { const t = (i / 5 - 0.5) * 1.6 * tam; agregar(0, 0, "hoja", 0.5, { u, ox: ox + t * Math.cos(ang), oy: oy + t * Math.sin(ang) }); }
  };
  for (const [u, dir, largo] of [[0.12, -1, 0.7], [0.3, 1, 0.5], [0.82, -1, 0.6], [0.93, 1, 0.45]]) {
    const ang = dir < 0 ? -0.9 : 0.8;
    for (let i = 0; i < 16; i++) { const t = (i / 15) * largo; agregar(0, 0, "rama", 0.8, { u, ox: Math.cos(ang) * t, oy: Math.sin(ang) * t }); }
    hoja(u, Math.cos(ang) * largo + 0.18, Math.sin(ang) * largo, ang + 0.6, 0.2);
    hoja(u, Math.cos(ang) * largo * 0.6 - 0.12, Math.sin(ang) * largo * 0.6 + dir * 0.08, ang - 1.2, 0.17);
  }
  hoja(0.02, 0.1, 0.1, 0.5, 0.2); hoja(0.99, -0.05, -0.12, -0.4, 0.22);

  const CABEZA = new Set(["contorno", "orejaI", "orejaD", "pelo", "cara", "relleno", "ojoI", "ojoD", "nariz", "boca", "lengua"]);
  const RASGOS = new Set(["ojoI", "ojoD", "nariz", "lengua", "boca"]);
  const CON_GLIFOS = new Set(["contorno", "pelo", "relleno", "torso"]);
  const ps = puntos.map((p) => ({ ...p, cabeza: CABEZA.has(p.grupo), x: 0, y: 0, vx: 0, vy: 0, oculto: false,
    glifo: CON_GLIFOS.has(p.grupo) && Math.random() < 0.06 ? GLIFOS[(Math.random() * GLIFOS.length) | 0] : null,
    tam: RASGOS.has(p.grupo) ? rnd(2, 2.8) : p.grupo.startsWith("dedo") ? rnd(1.3, 1.9) : rnd(1.1, 2.2) }));
  const polvo = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, f: Math.random() * TAU, glifo: Math.random() < 0.15 ? GLIFOS[(Math.random() * GLIFOS.length) | 0] : null }));

  // ======================= ESTADO =======================
  let W = 0, H = 0, dpr = 1, escala = 1;
  const raton = { x: -9999, y: -9999, px: -9999, py: -9999, dentro: false, vel: 0, dx: 0, lx: 0, ly: 0 };
  const MANO = [1.3, -1.5]; // la mano que agarra: punto de giro del péndulo
  const HOMBRO_D = [0.42, 1.18], HOMBRO_I = [-0.42, 1.18], CADERA_I = [-0.26, 2.1], CADERA_D = [0.26, 2.1], BASE_COLA = [0.08, 2.2];
  const est = {
    mirarX: 0, mirarY: 0, giro: 0, parpadeo: 0, proxParpadeo: 1.5, lengua: 0, proxLengua: 4, reinicio: 0, respira: 0,
    ladeo: 0, ladeoObj: 0, proxLadeo: 3,
    th: 0.15, om: 0, alfa: 0, golpe: 0, // péndulo
    incl: 0, inclV: 0, // inclinación del torso
    agarre: 0.6, // 0 = dedos abiertos, 1 = cerrados
    alcance: 0, manoI: [HOMBRO_I[0] - 0.35, HOMBRO_I[1] + 1.2], // brazo libre
    piernas: [ // muslo (a1) y espinilla (a2) como resortes independientes; pie relativo (pr)
      { a1: Math.PI / 2 + 0.3, v1: 0, a2: -0.4, v2: 0, pr: Math.PI / 2 + 0.1, vp: 0, r1: Math.PI / 2 + 0.3, r2: -0.4, rp: Math.PI / 2 + 0.1, k1: 26, c1: 3.2, k2: 18, fase: 0 },
      { a1: Math.PI / 2 - 0.3, v1: 0, a2: 0.4, v2: 0, pr: -(Math.PI / 2 + 0.1), vp: 0, r1: Math.PI / 2 - 0.3, r2: 0.4, rp: -(Math.PI / 2 + 0.1), k1: 21, c1: 2.6, k2: 15, fase: 2.1 },
    ],
    cola: null, // cadena Verlet en pantalla
  };
  const esq = {}; // esqueleto del cuadro actual (coordenadas locales)
  let colores = {};
  const leerColores = () => {
    const s = getComputedStyle(document.documentElement);
    colores = { p: s.getPropertyValue("--particula").trim(), p2: s.getPropertyValue("--particula-2").trim() };
  };
  function medir() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    escala = Math.min(W * 0.18, H * 0.165);
    if (!ps[0].x) for (const p of ps) { p.x = W / 2 + rnd(-W, W) * 0.6; p.y = H / 2 + rnd(-H, H) * 0.6; }
    est.cola = null; // se rehace con la nueva escala
  }

  // Rama
  const pivoteX = () => W * 0.6;
  const comba = () => 3 + Math.abs(est.om) * 5 + est.golpe;
  const yRama = (x) => H * 0.12 + (x / W - 0.6) * H * 0.05 + Math.sin((x / W) * 5) * 4 + comba() * Math.exp(-(((x - pivoteX()) / (W * 0.28)) ** 2));

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
  // Torso: se inclina alrededor del cuello y se deforma muy poco
  const enTorso = (x, y) => {
    const sx = 1 + 0.02 * Math.sin(est.respira) + 0.03 * Math.min(1, Math.abs(est.om)), sy = 2 - sx;
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
  // Punto sobre una curva que pasa por a, m y b (Bézier con control para pasar por m)
  function enCurva(a, m, b, u, lado, ancho) {
    const c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2];
    const B = (t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
    const [x, y] = B(u), [x2, y2] = B(Math.min(1, u + 0.01)), [x0, y0] = B(Math.max(0, u - 0.01));
    let nx = -(y2 - y0), ny = x2 - x0; const l = Math.hypot(nx, ny) || 1;
    return [x + (nx / l) * ancho * lado, y + (ny / l) * ancho * lado];
  }
  // Un dedo: dos falanges que salen de un nudillo
  const dedo = (base, ang, l1, curva, l2) => {
    const m = [base[0] + Math.cos(ang) * l1, base[1] + Math.sin(ang) * l1];
    return [base, m, [m[0] + Math.cos(ang + curva) * l2, m[1] + Math.sin(ang + curva) * l2]];
  };

  // ======================= ESQUELETO DEL CUADRO =======================
  function armarEsqueleto(t) {
    // Mano de la rama: alineada con la rama (gira al revés que el cuerpo para no soltarla)
    const aMano = (x, y) => { const [rx, ry] = rot(x, y, 0, 0, -est.th); return [MANO[0] + rx, MANO[1] + ry]; };
    esq.aMano = aMano;
    esq.munecaD = aMano(0, 0.27);
    const hD = enTorso(...HOMBRO_D);
    [esq.codoD] = ik(hD, esq.munecaD, 1.55, 1.55, 1);
    esq.hombroD = hD;
    // Dedos que rodean la rama: cada uno con su ritmo; aprietan más cuando se balancea fuerte
    esq.dedosD = [];
    const largos = [0.13, 0.16, 0.155, 0.12];
    for (let f = 0; f < 4; f++) {
      const curva = 1.2 + est.agarre * 1.1 + Math.sin(t * 1.1 + f * 0.9) * 0.12;
      esq.dedosD.push(dedo([-0.13 + f * 0.087, 0.05], -Math.PI / 2 + (f - 1.5) * 0.08, largos[f], curva, 0.1).map((q) => aMano(...q)));
    }
    esq.dedosD.push(dedo([-0.15, 0.16], 2.3, 0.12, -0.9 - est.agarre * 0.4, 0.09).map((q) => aMano(...q))); // pulgar

    // Brazo libre: busca el cursor si está cerca; si no, cuelga y se balancea
    const hI = enTorso(...HOMBRO_I);
    esq.hombroI = hI;
    const [reposo] = [rot(hI[0] - 0.35, hI[1] + 1.2, hI[0], hI[1], -est.om * 0.3 + est.incl * 0.5 + Math.sin(t * 0.9) * 0.05)];
    const cerca = raton.dentro && Math.hypot(raton.lx - hI[0], raton.ly - hI[1]) < 3.4;
    let objetivo = reposo;
    if (est.alcance > 0.001) {
      const dx = raton.lx - hI[0], dy = raton.ly - hI[1], d = Math.hypot(dx, dy) || 1, max = Math.min(d, 1.95);
      const alc = [hI[0] + (dx / d) * max, hI[1] + (dy / d) * max];
      objetivo = [reposo[0] + (alc[0] - reposo[0]) * est.alcance, reposo[1] + (alc[1] - reposo[1]) * est.alcance];
    }
    esq.cerca = cerca; esq.objetivoI = objetivo;
    const [codoI, munecaI] = ik(hI, est.manoI, 1.05, 1.0, 1);
    esq.codoI = codoI; esq.munecaI = munecaI;
    const dir = Math.atan2(munecaI[1] - codoI[1], munecaI[0] - codoI[0]);
    esq.dirManoI = dir;
    const palma = [munecaI[0] + Math.cos(dir) * 0.1, munecaI[1] + Math.sin(dir) * 0.1];
    esq.palmaI = palma;
    const abre = est.alcance, abanico = 0.18 + abre * 0.32;
    esq.dedosI = [];
    for (let f = 0; f < 4; f++) {
      const ang = dir + (f - 1.5) * abanico;
      const base = [palma[0] + Math.cos(ang) * 0.09, palma[1] + Math.sin(ang) * 0.09];
      esq.dedosI.push(dedo(base, ang, 0.11, (1 - abre) * 1.1 + 0.15 + Math.sin(t * 1.4 + f) * 0.08, 0.09));
    }
    esq.dedosI.push(dedo([palma[0] + Math.cos(dir - 1.6) * 0.08, palma[1] + Math.sin(dir - 1.6) * 0.08], dir - 1.1 - abre * 0.4, 0.1, 0.5 - abre * 0.4, 0.07));

    // Piernas: dos huesos con ángulos de resorte; pies que reaccionan al torso
    esq.piernas = est.piernas.map((pg, i) => {
      const cad = enTorso(...(i === 0 ? CADERA_I : CADERA_D));
      const ang1 = pg.a1 + est.incl, rod = [cad[0] + Math.cos(ang1) * 0.5, cad[1] + Math.sin(ang1) * 0.5];
      const ang2 = ang1 + pg.a2, tob = [rod[0] + Math.cos(ang2) * 0.48, rod[1] + Math.sin(ang2) * 0.48];
      return { cad, rod, tob, angPie: ang2 + pg.pr };
    });
  }

  // ======================= COLA (Verlet en pantalla + resorte hacia su forma) =======================
  const N_COLA = 18, L_COLA = 0.095;
  function formaCola(t) {
    // Forma de reposo en local: baja, gira a la derecha y termina en rizo. Pequeñas variaciones vivas.
    const pts = [enTorso(...BASE_COLA)];
    let ang = 0.95 + est.incl * 0.8;
    for (let i = 1; i < N_COLA; i++) {
      const k = i / (N_COLA - 1);
      ang -= 0.02 + 0.42 * k ** 2.4 + Math.sin(t * 1.6 + i * 0.45) * 0.05 + Math.sin(t * 0.7 + i * 0.2) * 0.03;
      const prev = pts[i - 1];
      pts.push([prev[0] + Math.cos(ang) * L_COLA, prev[1] + Math.sin(ang) * L_COLA]);
    }
    return pts.map((q) => aPantalla(...q));
  }
  function fisicaCola(t) {
    const reposo = formaCola(t);
    if (!est.cola) est.cola = reposo.map(([x, y]) => ({ x, y, px: x, py: y }));
    const c = est.cola, seg = L_COLA * escala, g = 0.0022 * escala;
    c[0].x = c[0].px = reposo[0][0]; c[0].y = c[0].py = reposo[0][1];
    for (let i = 1; i < N_COLA; i++) {
      const p = c[i], vx = (p.x - p.px) * 0.93, vy = (p.y - p.py) * 0.93;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g;
      // Resorte hacia la forma: firme en la base, suelto en la punta (por eso la punta llega tarde)
      const k = 0.16 * (1 - i / N_COLA) ** 1.6 + 0.012;
      p.x += (reposo[i][0] - p.x) * k; p.y += (reposo[i][1] - p.y) * k;
      if (raton.dentro) {
        const dx = p.x - raton.x, dy = p.y - raton.y, d = Math.hypot(dx, dy), r = escala * 0.8;
        if (d < r && d > 0.01) { const f = (1 - d / r) * 2.2; p.x += (dx / d) * f; p.y += (dy / d) * f; }
      }
    }
    for (let it = 0; it < 4; it++) for (let i = 1; i < N_COLA; i++) {
      const a = c[i - 1], b = c[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, dif = (d - seg) / d;
      if (i === 1) { b.x -= dx * dif; b.y -= dy * dif; }
      else { a.x += dx * dif * 0.5; a.y += dy * dif * 0.5; b.x -= dx * dif * 0.5; b.y -= dy * dif * 0.5; }
    }
  }
  function enCola(u, lado, ancho) {
    const c = est.cola, f = u * (N_COLA - 1), i = Math.min(N_COLA - 2, Math.floor(f)), r = f - i;
    const a = c[i], b = c[i + 1], x = a.x + (b.x - a.x) * r, y = a.y + (b.y - a.y) * r;
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1;
    return [x + (nx / l) * ancho * escala * lado, y + (ny / l) * ancho * escala * lado];
  }

  // ======================= DÓNDE VA CADA PARTÍCULA =======================
  const enSegmentos = (pts, seg, t) => { const a = pts[seg], b = pts[seg + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  function destino(p, t) {
    p.oculto = false;
    const g = p.grupo;
    if (g === "rama" || g === "hoja") {
      const bx = -0.05 * W + p.u * W * 1.1;
      const viento = g === "hoja" ? Math.sin(t * 1.7 + p.u * 9) * 0.04 : 0;
      return [bx + (p.ox + viento) * escala, yRama(bx) + (p.oy + viento * 0.5) * escala];
    }
    if (g === "cola") return enCola(p.u, p.lado, p.ancho);
    let x = p.hx, y = p.hy;
    if (p.cabeza) {
      if (g === "ojoI" || g === "ojoD") {
        const c = g === "ojoI" ? ojosZona[0] : ojosZona[1];
        const gi = est.reinicio > 0 ? Math.sin(est.reinicio * Math.PI) * Math.PI * 0.75 : 0;
        const cg = Math.cos(gi), sg = Math.sin(gi);
        const ex = x * cg - y * sg, ey = (x * sg + y * cg) * (1 - est.parpadeo * 0.88);
        x = c.x + ex + est.mirarX * 0.09; y = c.y + ey + est.mirarY * 0.07;
      } else if (g === "lengua") {
        const fuera = 0.7 + est.lengua * 0.45;
        y = 0.47 + (y - 0.47) * fuera + Math.sin(t * 6 + y * 8) * 0.012 * est.lengua;
        x += Math.sin(t * 3) * 0.02 * est.lengua;
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
      [x, y] = enCurva(pg.cad, pg.rod, pg.tob, p.u, p.lado, p.ancho * (1 - p.u * 0.2));
    } else if (g === "pieI" || g === "pieD") {
      const pg = esq.piernas[g === "pieI" ? 0 : 1], a = pg.angPie;
      const cx = pg.tob[0] + Math.cos(a) * 0.09, cy = pg.tob[1] + Math.sin(a) * 0.09;
      const lx = Math.cos(p.a) * 0.16, ly = Math.sin(p.a) * 0.065;
      [x, y] = [cx + lx * Math.cos(a) - ly * Math.sin(a), cy + lx * Math.sin(a) + ly * Math.cos(a)];
    } else if (g === "palmaD") [x, y] = esq.aMano(Math.cos(p.a) * 0.13, 0.15 + Math.sin(p.a) * 0.11);
    else if (g === "palmaI") [x, y] = [esq.palmaI[0] + Math.cos(p.a) * 0.1, esq.palmaI[1] + Math.sin(p.a) * 0.1];
    else if (g === "dedoD") [x, y] = enSegmentos(esq.dedosD[p.f], p.seg, p.t);
    else if (g === "dedoI") [x, y] = enSegmentos(esq.dedosI[p.f], p.seg, p.t);
    if (tapaCabeza(x, y) && g !== "dedoD" && g !== "palmaD") p.oculto = true;
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
      pg.vp += ((pg.rp - pg.pr) * 30 - pg.vp * 3 - est.inclV * 6 - est.om * 3 - pg.v2 * 2) * dt; pg.pr += pg.vp * dt;
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
      p.vx += (tx - p.x) * 0.07; p.vy += (ty - p.y) * 0.07;
      if (raton.dentro) {
        const ex = p.x - raton.x, ey = p.y - raton.y, d = Math.hypot(ex, ey), radio = rapido ? rRep * 1.8 : rRep;
        if (d < radio && d > 0.01) { const f = (1 - d / radio) ** 2 * (rapido ? 9 : 2.6); p.vx += (ex / d) * f; p.vy += (ey / d) * f; }
      }
      p.vx *= 0.8; p.vy *= 0.8; p.x += p.vx; p.y += p.vy;
      if (p.glifo && Math.random() < 0.004) p.glifo = GLIFOS[(Math.random() * GLIFOS.length) | 0];
    }
    for (const q of polvo) {
      q.f += dt * 0.3;
      q.vx += Math.cos(q.f + q.y * 6) * 0.00004; q.vy += Math.sin(q.f * 0.7 + q.x * 5) * 0.00004 - 0.000012;
      if (raton.dentro) { const ex = q.x * W - raton.x, ey = q.y * H - raton.y, d = Math.hypot(ex, ey); if (d < rRep && d > 0.01) { q.vx += (ex / d) * 0.0006; q.vy += (ey / d) * 0.0006; } }
      q.vx *= 0.96; q.vy *= 0.96; q.x += q.vx; q.y += q.vy;
      if (q.x < -0.02) q.x = 1.02; if (q.x > 1.02) q.x = -0.02; if (q.y < -0.02) q.y = 1.02; if (q.y > 1.02) q.y = -0.02;
    }
  }

  function dibujar(estela = true) {
    if (estela) {
      ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = 0.3;
      ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over";
    } else ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `500 ${Math.max(9, escala * 0.1)}px ui-monospace, Consolas, monospace`;
    ctx.fillStyle = colores.p2;
    for (const q of polvo) { ctx.globalAlpha = 0.35; if (q.glifo) ctx.fillText(q.glifo, q.x * W, q.y * H); else ctx.fillRect(q.x * W, q.y * H, 1.2, 1.2); }
    for (const p of ps) {
      if (p.oculto) continue;
      const vel = Math.min(1, Math.hypot(p.vx, p.vy) / 12);
      ctx.fillStyle = p.grupo === "rama" ? colores.p2 : colores.p;
      ctx.globalAlpha = Math.min(1, p.peso * (0.75 + vel * 0.25)) * (p.grupo === "hoja" ? 0.7 : 1);
      if (p.glifo) ctx.fillText(p.glifo, p.x, p.y);
      else ctx.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam);
    }
    ctx.globalAlpha = 1;
  }

  // ======================= BUCLE =======================
  const PASO = 1 / 60;
  let activo = true, visible = true, ultimo = performance.now(), raf = 0, acum = 0, reloj = 0;
  function cuadro(ahora) {
    acum = Math.min(0.25, acum + (ahora - ultimo) / 1000); ultimo = ahora;
    while (acum >= PASO) { reloj += PASO; actualizar(PASO, reloj); acum -= PASO; }
    dibujar();
    raf = activo && visible ? requestAnimationFrame(cuadro) : 0;
  }
  const arrancar = () => { if (!raf && activo && visible && !reducido) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; arrancar(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { activo = !document.hidden; arrancar(); });

  function estatico() {
    est.th = 0.08; est.om = 0;
    armarEsqueleto(0); est.cola = null; fisicaCola(0);
    for (const p of ps) { const [x, y] = destino(p, 0); p.x = x; p.y = y; p.vx = p.vy = 0; }
    dibujar(false);
  }

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
    if (reducido) estatico();
  });

  // El botón de tema del sitio cambia data-theme en <html>: releer los colores
  new MutationObserver(() => { leerColores(); if (reducido) estatico(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  addEventListener("resize", () => { medir(); if (reducido) estatico(); });
  leerColores(); medir();

  if (reducido) estatico(); else arrancar();
})();
