/* SigmaPro — pruebas t, razón de varianzas y tamaños del efecto.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Funciones (SP.pruebaT), con el mismo cálculo que R:
     unaMuestra(x, op)              t.test(x, mu)
     dosMuestras(x, y, op)          t.test(x, y, var.equal) — Student (varianzas iguales) o Welch
     pareada(x, y, op)              t.test(x, y, paired = TRUE): la de una muestra sobre las diferencias
     razonVarianzas(x, y, op)       var.test(x, y)
     efecto(x, y, op)               d de Cohen (DE combinada; con una muestra o pareada, d_z) y g de Hedges con
                                    la corrección exacta J(gl) = Γ(gl/2) / (√(gl/2)·Γ((gl − 1)/2)); su IC invierte
                                    la t no central (Steiger y Fouladi, 1997): pt(t, gl, ncp) = 1 − α/2 y α/2.
   op: { mu, alternativa: 'bilateral' | 'menor' | 'mayor', nivel, varIguales }.
   Método registrado: 'prueba-t'. */
SP.definir('pruebas-t', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, max, exp, log } = Math;
  const D = () => SP.dist;
  const EPS = 2.220446049250313e-16;
  Object.assign(SP.nombresFunciones, {
    'pruebaT.unaMuestra': 't de una muestra', 'pruebaT.dosMuestras': 't de dos muestras (Student y Welch)',
    'pruebaT.pareada': 't pareada', 'pruebaT.razonVarianzas': 'F de razón de varianzas', 'pruebaT.efecto': 'd de Cohen y g de Hedges con IC',
    'dist.psignrank': 'Rango con signo de Wilcoxon: probabilidad acumulada', 'dist.qsignrank': 'Rango con signo de Wilcoxon: cuantiles',
    'dist.pwilcox': 'Suma de rangos de Wilcoxon: probabilidad acumulada', 'dist.qwilcox': 'Suma de rangos de Wilcoxon: cuantiles',
    'dist.ptnc': 't no central: probabilidad acumulada',
  });
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sin = x => SP.num.sinFaltantes(x);
  const OM = { mu: 0, alternativa: 'bilateral', nivel: 0.95, varIguales: false };

  function cierre(t, gl, ee, mu, op) {
    let p, ic;
    if (op.alternativa === 'menor') { p = D().pt(t, gl); ic = [-Infinity, t + D().qt(op.nivel, gl)]; }
    else if (op.alternativa === 'mayor') { p = D().pt(t, gl, false); ic = [t - D().qt(op.nivel, gl), Infinity]; }
    else { p = 2 * D().pt(-abs(t), gl); const c = D().qt(1 - (1 - op.nivel) / 2, gl); ic = [t - c, t + c]; }
    return { t, gl, p, ic: ic.map(v => mu + v * ee), ee };
  }
  function unaMuestra(xs, op) {
    op = Object.assign({}, OM, op || {});
    const x = sin(xs), n = x.length;
    exigir(n >= 2, T('Hacen falta al menos dos observaciones.'));
    const m = SP.num.media(x), v = SP.num.varianza(x), ee = sqrt(v / n);
    exigir(!(ee < 10 * EPS * abs(m)), T('Los datos son prácticamente constantes: no hay variación que probar.'));
    return Object.assign(cierre((m - op.mu) / ee, n - 1, ee, op.mu, op), { estimado: m, n, media: m, de: sqrt(v) });
  }
  function pareada(xs, ys, op) {
    const d = [];
    for (let i = 0; i < xs.length; i++) { const a = xs[i], b = ys[i]; if (!Number.isNaN(a) && !Number.isNaN(b) && a !== null && b !== null) d.push(a - b); }
    const r = unaMuestra(d, op);
    return Object.assign(r, { n_pares: d.length });
  }
  function dosMuestras(xs, ys, op) {
    op = Object.assign({}, OM, op || {});
    const x = sin(xs), y = sin(ys), nx = x.length, ny = y.length;
    exigir(nx >= 2 && ny >= 2, T('Cada grupo necesita al menos dos observaciones.'));
    const mx = SP.num.media(x), my = SP.num.media(y), vx = SP.num.varianza(x), vy = SP.num.varianza(y);
    let gl, ee;
    if (op.varIguales) {
      gl = nx + ny - 2;
      const v = ((nx - 1) * vx + (ny - 1) * vy) / gl;
      ee = sqrt(v * (1 / nx + 1 / ny));
    } else {
      const ex = sqrt(vx / nx), ey = sqrt(vy / ny);
      ee = sqrt(ex * ex + ey * ey);
      gl = ee ** 4 / (ex ** 4 / (nx - 1) + ey ** 4 / (ny - 1));
    }
    exigir(!(ee < 10 * EPS * max(abs(mx), abs(my))), T('Los datos son prácticamente constantes: no hay variación que probar.'));
    return Object.assign(cierre((mx - my - op.mu) / ee, gl, ee, op.mu, op), { estimado: [mx, my], diferencia: mx - my, n: [nx, ny], de: [sqrt(vx), sqrt(vy)], varIguales: !!op.varIguales });
  }
  /** F de razón de varianzas (var.test). Las colas se calculan cada una directamente. */
  function razonVarianzas(xs, ys, op) {
    op = Object.assign({ razon: 1, alternativa: 'bilateral', nivel: 0.95 }, op || {});
    const x = sin(xs).filter(Number.isFinite), y = sin(ys).filter(Number.isFinite);
    const glx = x.length - 1, gly = y.length - 1;
    exigir(glx >= 1 && gly >= 1, T('Cada grupo necesita al menos dos observaciones.'));
    const est = SP.num.varianza(x) / SP.num.varianza(y), F = est / op.razon;
    const inf = D().pf(F, glx, gly), sup = D().pf(F, glx, gly, false);
    let p, ic;
    if (op.alternativa === 'bilateral') { p = 2 * Math.min(inf, sup); const b = (1 - op.nivel) / 2; ic = [est / D().qf(1 - b, glx, gly), est / D().qf(b, glx, gly)]; }
    else if (op.alternativa === 'mayor') { p = sup; ic = [est / D().qf(op.nivel, glx, gly), Infinity]; }
    else { p = inf; ic = [0, est / D().qf(1 - op.nivel, glx, gly)]; }
    return { F, gl1: glx, gl2: gly, p, ic, estimado: est };
  }
  /** Corrección de Hedges, exacta. */
  const J = gl => exp(D().lgamma(gl / 2) - log(sqrt(gl / 2)) - D().lgamma((gl - 1) / 2));
  /** ncp tal que pt(t, gl, ncp) = prob (pt decrece con ncp). */
  function ncpPara(t, gl, prob) {
    const g = ncp => D().ptnc(t, gl, ncp) - prob;
    let a = t - 10, b = t + 10;
    while (g(a) < 0) a -= 10;
    while (g(b) > 0) b += 10;
    return D()._interno.brent(g, a, b, 0, 1e-13);
  }
  /**
   * d de Cohen y g de Hedges. Con y: dos muestras, d = (x̄ − ȳ)/s_combinada, t = d/√(1/nx + 1/ny); sin y:
   * una muestra (o las diferencias pareadas), d = (x̄ − μ)/s, t = d·√n.
   */
  function efecto(xs, ys, op) {
    op = Object.assign({ mu: 0, nivel: 0.95, pareada: false }, op || {});
    let d, gl, factor;
    if (ys && !op.pareada) {
      const x = sin(xs), y = sin(ys), nx = x.length, ny = y.length;
      gl = nx + ny - 2;
      const sp = sqrt(((nx - 1) * SP.num.varianza(x) + (ny - 1) * SP.num.varianza(y)) / gl);
      d = (SP.num.media(x) - SP.num.media(y) - op.mu) / sp;
      factor = sqrt(1 / nx + 1 / ny);
    } else {
      let x = sin(xs);
      if (ys) { const dd = []; for (let i = 0; i < xs.length; i++) if (!Number.isNaN(xs[i]) && !Number.isNaN(ys[i])) dd.push(xs[i] - ys[i]); x = Float64Array.from(dd); }
      const n = x.length;
      gl = n - 1;
      d = (SP.num.media(x) - op.mu) / sqrt(SP.num.varianza(x));
      factor = 1 / sqrt(n);
    }
    const t = d / factor, a = (1 - op.nivel) / 2;
    const ic = [ncpPara(t, gl, 1 - a) * factor, ncpPara(t, gl, a) * factor];
    const j = J(gl);
    return { d, g: d * j, J: j, gl, ic_d: ic, ic_g: ic.map(v => v * j) };
  }

  SP.pruebaT = { unaMuestra, dosMuestras, pareada, razonVarianzas, efecto, J };

  /* ======================= método: prueba t ======================= */
  const ALT = { bilateral: '≠', menor: '<', mayor: '>' };
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f = (x, d) => (Number.isFinite(x) ? x.toFixed(d === undefined ? 3 : d).replace(/^-/, '−') : '—');
  const nR = v => String(Number(v.toPrecision(12)));
  const nombreR = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');

  /** Las dos muestras según el modo: { x, y, etiquetas } */
  function muestras(tabla, e) {
    if (e.modo === 'una') return { x: tabla.col(e.variable).valores, y: null, etiquetas: [e.variable] };
    if (e.modo === 'pareadas') return { x: tabla.col(e.antes).valores, y: tabla.col(e.despues).valores, etiquetas: [e.antes, e.despues] };
    const g = SP.estructura.comoFactor(tabla, e.grupo), yv = tabla.col(e.respuesta).valores;
    const niveles = e.niveles && e.niveles.length === 2 ? e.niveles : g.niveles.slice(0, 2);
    const k0 = g.niveles.indexOf(niveles[0]), k1 = g.niveles.indexOf(niveles[1]);
    const x = [], y = [];
    for (let i = 0; i < yv.length; i++) { if (g.codigos[i] === k0) x.push(yv[i]); else if (g.codigos[i] === k1) y.push(yv[i]); }
    return { x: Float64Array.from(x), y: Float64Array.from(y), etiquetas: niveles };
  }
  function validarT(tabla, e, op) {
    exigir(['una', 'independientes', 'pareadas'].includes(e.modo), T('Elige el tipo de prueba t.'));
    const num = c => { exigir(c && tabla.columnas[c], T('Falta elegir una columna.')); exigir(tabla.col(c).tipo === 'numerica', T('«{c}» debe ser numérica.', { c })); };
    if (e.modo === 'una') num(e.variable);
    else if (e.modo === 'pareadas') { num(e.antes); num(e.despues); exigir(e.antes !== e.despues, T('Elige dos columnas distintas.')); }
    else {
      num(e.respuesta);
      exigir(e.grupo && tabla.columnas[e.grupo], T('Elige la columna que separa los dos grupos.'));
      const g = SP.estructura.comoFactor(tabla, e.grupo);
      exigir(g.niveles.length >= 2, T('«{c}» necesita al menos dos niveles.', { c: e.grupo }));
      if (e.niveles) exigir(e.niveles.length === 2 && e.niveles.every(n => g.niveles.includes(n)) && e.niveles[0] !== e.niveles[1], T('Elige dos niveles distintos de «{c}».', { c: e.grupo }));
    }
    exigir(op.nivel > 0 && op.nivel < 1, T('El nivel de confianza va entre 0 y 1.'));
    exigir(ALT[op.alternativa], T('Alternativa desconocida.'));
  }
  /** Diferencias de los pares completos. */
  function diferencias(x, y) {
    const d = [];
    for (let i = 0; i < x.length; i++) if (!Number.isNaN(x[i]) && !Number.isNaN(y[i])) d.push(x[i] - y[i]);
    return Float64Array.from(d);
  }
  /** Shapiro-Wilk si se puede (3 a 5000 datos no constantes); si no, sin dato (semáforo gris). */
  function normalidad(v, grupo) {
    let r = { W: NaN, p: NaN };
    try { r = SP.sup.shapiro(v); } catch (err) { /* fuera del alcance de la prueba */ }
    return { grupo, W: r.W, p: r.p };
  }
  const resumenDe = (v, nombre) => { const s = sin(v); return { nombre, n: s.length, media: SP.num.media(s), de: sqrt(SP.num.varianza(s)) }; };
  function calcularT(tabla, e, op) {
    const { x, y, etiquetas } = muestras(tabla, e);
    const o = { mu: +op.mu || 0, alternativa: op.alternativa, nivel: op.nivel, varIguales: !!op.varIguales };
    const out = { modo: e.modo, etiquetas, alternativa: op.alternativa, mu: o.mu, nivel: op.nivel, alfa: op.alfa };
    if (e.modo === 'una') {
      out.prueba = unaMuestra(x, o);
      out.efecto = efecto(x, null, { mu: o.mu, nivel: op.nivel });
      out.normalidad = [normalidad(x, etiquetas[0])];
      out.grupos = [resumenDe(x, etiquetas[0])];
      out.valores = [Array.from(sin(x))];
    } else if (e.modo === 'pareadas') {
      const d = diferencias(x, y);
      out.prueba = pareada(x, y, o);
      out.efecto = efecto(x, y, { mu: o.mu, nivel: op.nivel, pareada: true });
      out.normalidad = [normalidad(d, T('diferencias'))];
      out.grupos = [resumenDe(x, etiquetas[0]), resumenDe(y, etiquetas[1]), resumenDe(d, T('diferencia'))];
      out.valores = [Array.from(d)];
    } else {
      out.prueba = dosMuestras(x, y, o);
      out.otra = dosMuestras(x, y, Object.assign({}, o, { varIguales: !o.varIguales }));
      out.efecto = efecto(x, y, { mu: o.mu, nivel: op.nivel });
      out.varianzas = razonVarianzas(x, y, { nivel: op.nivel });
      out.normalidad = [normalidad(x, etiquetas[0]), normalidad(y, etiquetas[1])];
      out.grupos = [resumenDe(x, etiquetas[0]), resumenDe(y, etiquetas[1])];
      out.valores = [Array.from(sin(x)), Array.from(sin(y))];
    }
    return out;
  }
  function reporteT(r) {
    const a = r.alfa || 0.05, pr = r.prueba, nv = Math.round(r.nivel * 100), conclusiones = [];
    const sig = pr.p < a;
    const tam = abs(r.efecto.g) < 0.2 ? T('muy pequeño') : abs(r.efecto.g) < 0.5 ? T('pequeño') : abs(r.efecto.g) < 0.8 ? T('mediano') : T('grande');
    if (r.modo === 'independientes') {
      const [gx, gy] = r.grupos;
      conclusiones.push(sig
        ? T('La media de «{a}» ({ma}) difiere de la de «{b}» ({mb}): diferencia {d} (IC {nv} %: {i} a {s}); t = {t}, gl = {gl}, p {p}.', { a: gx.nombre, b: gy.nombre, ma: f(gx.media), mb: f(gy.media), d: f(r.prueba.estimado[0] - r.prueba.estimado[1]), nv, i: f(pr.ic[0]), s: f(pr.ic[1]), t: f(pr.t), gl: f(pr.gl, 2), p: fp(pr.p) })
        : T('No hay evidencia de que las medias de «{a}» ({ma}) y «{b}» ({mb}) difieran: t = {t}, gl = {gl}, p {p}; el IC {nv} % de la diferencia va de {i} a {s}.', { a: gx.nombre, b: gy.nombre, ma: f(gx.media), mb: f(gy.media), nv, i: f(pr.ic[0]), s: f(pr.ic[1]), t: f(pr.t), gl: f(pr.gl, 2), p: fp(pr.p) }));
    } else if (r.modo === 'pareadas') {
      const dd = r.grupos[2];
      conclusiones.push(sig
        ? T('«{a}» y «{b}» difieren en promedio {d} (IC {nv} %: {i} a {s}) en {n} pares: t = {t}, gl = {gl}, p {p}.', { a: r.etiquetas[0], b: r.etiquetas[1], d: f(dd.media), nv, i: f(pr.ic[0]), s: f(pr.ic[1]), n: dd.n, t: f(pr.t), gl: pr.gl, p: fp(pr.p) })
        : T('No hay evidencia de diferencia entre «{a}» y «{b}» en {n} pares (diferencia media {d}; t = {t}, gl = {gl}, p {p}).', { a: r.etiquetas[0], b: r.etiquetas[1], d: f(dd.media), n: dd.n, t: f(pr.t), gl: pr.gl, p: fp(pr.p) }));
    } else {
      conclusiones.push(sig
        ? T('La media de «{v}» ({m}) difiere de {mu}: t = {t}, gl = {gl}, p {p}; IC {nv} %: {i} a {s}.', { v: r.etiquetas[0], m: f(r.grupos[0].media), mu: r.mu, t: f(pr.t), gl: pr.gl, p: fp(pr.p), nv, i: f(pr.ic[0]), s: f(pr.ic[1]) })
        : T('No hay evidencia de que la media de «{v}» ({m}) difiera de {mu}: t = {t}, gl = {gl}, p {p}; IC {nv} %: {i} a {s}.', { v: r.etiquetas[0], m: f(r.grupos[0].media), mu: r.mu, t: f(pr.t), gl: pr.gl, p: fp(pr.p), nv, i: f(pr.ic[0]), s: f(pr.ic[1]) }));
    }
    conclusiones.push(T('Tamaño del efecto {t}: g de Hedges = {g} (IC {nv} %: {i} a {s}).', { t: tam, g: f(r.efecto.g), nv, i: f(r.efecto.ic_g[0]), s: f(r.efecto.ic_g[1]) }));
    const sem = [];
    const malN = r.normalidad.filter(x => x.p < a);
    sem.push({ clave: 'normalidad', nombre: T('Normalidad'), color: !r.normalidad.every(x => Number.isFinite(x.p)) ? 'gris' : malN.length ? (malN.some(x => x.p < a / 5) ? 'rojo' : 'ambar') : 'verde',
      texto: r.normalidad.map(x => T('{g}: Shapiro-Wilk p {p}', { g: x.grupo, p: fp(x.p) })).join('; ') });
    if (r.varianzas) {
      /* con Welch las varianzas distintas no son un problema: se informa, en verde */
      const c = SP.sup.color(r.varianzas.p, a), welch = !r.prueba.varIguales;
      sem.push({ clave: 'varianzas', nombre: welch ? T('Varianzas (t de Welch)') : T('Varianzas iguales'), color: welch ? 'verde' : c,
        texto: T('F = {F}, p {p}. {w}', { F: f(r.varianzas.F), p: fp(r.varianzas.p), w: welch ? (c === 'verde' ? T('La t de Welch no necesita varianzas iguales.') : T('Las varianzas difieren; la t de Welch no las supone iguales, así que la prueba sigue siendo válida.')) : c === 'verde' ? T('Se usó la t de Student, que las supone iguales.') : T('Conviene la t de Welch, que no las supone iguales.') }) });
    }
    const col = (clave, titulo, formato) => ({ clave, titulo, formato });
    const nombreT = r.modo === 'una' ? T('t de una muestra') : r.modo === 'pareadas' ? T('t pareada') : r.prueba.varIguales ? T('t de Student') : T('t de Welch');
    const filas = [{ prueba: nombreT, t: pr.t, gl: pr.gl, p: pr.p, ic: pr.ic, _dec: 3 }];
    if (r.otra) filas.push({ prueba: r.otra.varIguales ? T('t de Student') : T('t de Welch'), t: r.otra.t, gl: r.otra.gl, p: r.otra.p, ic: r.otra.ic, _dec: 3 });
    const hip = r.modo === 'una' ? T('H₀: μ = {m}; H₁: μ {s} {m}', { m: r.mu, s: ALT[r.alternativa] }) : T('H₀: diferencia = {m}; H₁: diferencia {s} {m}', { m: r.mu, s: ALT[r.alternativa] });
    return {
      titulo: nombreT, conclusiones, semaforo: sem,
      cuadros: [
        { id: 'prueba', titulo: T('{n} ({h})', { n: nombreT, h: hip }),
          columnas: [col('prueba', T('Prueba'), 'texto'), col('t', 't', 'forma'), col('gl', 'gl', 'num'), col('p', 'p', 'pvalor'), col('ic', T('IC {nv} %', { nv }), 'intervalo')],
          filas, notas: r.otra ? [T('La primera es la elegida; la segunda, como referencia.')] : [] },
        { id: 'grupos', titulo: T('Medias y desviaciones'),
          columnas: [col('nombre', T('Grupo'), 'texto'), col('n', 'n', 'entero'), col('media', T('Media'), 'forma'), col('de', T('DE'), 'forma')],
          filas: r.grupos, notas: [] },
        { id: 'efecto', titulo: T('Tamaño del efecto'),
          columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'forma'), col('ic', T('IC {nv} %', { nv }), 'intervalo')],
          filas: [{ medida: r.modo === 'pareadas' ? T('d_z de Cohen (diferencias)') : T('d de Cohen'), valor: r.efecto.d, ic: r.efecto.ic_d, _dec: 3 }, { medida: T('g de Hedges'), valor: r.efecto.g, ic: r.efecto.ic_g, _dec: 3 }],
          notas: [T('IC por la t no central (Steiger y Fouladi, 1997); g = d·J con la corrección exacta de Hedges. Guía de Cohen: 0.2 pequeño, 0.5 mediano, 0.8 grande.')] },
      ],
    };
  }
  function codigoT(e, op) {
    const alt = { bilateral: 'two.sided', menor: 'less', mayor: 'greater' }[op.alternativa || 'bilateral'], nivel = op.nivel || 0.95, mu = +op.mu || 0;
    const L = ['# Prueba t (código R equivalente a SigmaPro)'];
    const comun = `mu = ${mu}, alternative = "${alt}", conf.level = ${nivel}`;
    if (e.modo === 'una') L.push(`x <- datos$${nombreR(e.variable)}`, `prueba <- t.test(x, ${comun}); prueba`);
    else if (e.modo === 'pareadas') L.push(`x <- datos$${nombreR(e.antes)}; y <- datos$${nombreR(e.despues)}`, `prueba <- t.test(x, y, paired = TRUE, ${comun}); prueba`);
    else {
      const niv = e.niveles && e.niveles.length === 2 ? e.niveles : null, yv = `datos$${nombreR(e.respuesta)}`, gv = `datos$${nombreR(e.grupo)}`;
      L.push(niv ? `x <- ${yv}[${gv} == ${JSON.stringify(niv[0])}]; y <- ${yv}[${gv} == ${JSON.stringify(niv[1])}]`
        : `g <- factor(${gv}); x <- ${yv}[g == levels(g)[1]]; y <- ${yv}[g == levels(g)[2]]`);
      L.push(`prueba <- t.test(x, y, var.equal = ${op.varIguales ? 'TRUE' : 'FALSE'}, ${comun}); prueba`, `varianzas <- var.test(x, y, conf.level = ${nivel}); varianzas`);
    }
    L.push('# tamaño del efecto: d de Cohen y g de Hedges, IC por la t no central (Steiger y Fouladi, 1997)');
    if (e.modo === 'independientes') L.push('x <- x[!is.na(x)]; y <- y[!is.na(y)]; gl <- length(x) + length(y) - 2',
      `d <- (mean(x) - mean(y) - ${mu}) / sqrt(((length(x) - 1) * var(x) + (length(y) - 1) * var(y)) / gl); f <- sqrt(1 / length(x) + 1 / length(y))`);
    else L.push(e.modo === 'pareadas' ? 'x <- (x - y)[complete.cases(x, y)]' : 'x <- x[!is.na(x)]', `gl <- length(x) - 1; d <- (mean(x) - ${mu}) / sd(x); f <- 1 / sqrt(length(x))`);
    L.push(`ncp <- function(p) uniroot(function(n) suppressWarnings(pt(d / f, gl, n)) - p, d / f + c(-40, 40), tol = 1e-12)$root`,
      'J <- exp(lgamma(gl / 2) - log(sqrt(gl / 2)) - lgamma((gl - 1) / 2))',
      `ic_d <- f * c(ncp(1 - ${nR(1 - nivel)} / 2), ncp(${nR(1 - nivel)} / 2))`,
      'efecto <- c(d = d, d_inf = ic_d[1], d_sup = ic_d[2], g = d * J, g_inf = ic_d[1] * J, g_sup = ic_d[2] * J); efecto',
      '# effectsize::hedges_g() da prácticamente lo mismo (busca el IC con un optimizador)');
    return L.join('\n');
  }
  SP.metodo({
    id: 'prueba-t', familia: 'pruebas-t', motor: 'js',
    nombre: T('Prueba t'),
    resumen: T('Una muestra contra un valor, dos grupos independientes (Student o Welch) o mediciones pareadas, con el tamaño del efecto.'),
    entradas: { modo: { tipo: 'cualquiera' }, variable: { tipo: 'numerica', opcional: true }, respuesta: { tipo: 'numerica', opcional: true }, grupo: { tipo: 'factor', opcional: true },
      antes: { tipo: 'numerica', opcional: true }, despues: { tipo: 'numerica', opcional: true } },
    opciones: { mu: { tipo: 'numero', omision: 0 }, alternativa: { tipo: 'texto', omision: 'bilateral' }, nivel: { tipo: 'numero', omision: 0.95 }, varIguales: { tipo: 'logico', omision: false }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarT, calcular: calcularT, reporte: reporteT, codigoR: codigoT,
  });
});
