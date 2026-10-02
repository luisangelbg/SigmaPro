/* SigmaPro — regresión lineal simple, múltiple y polinomial, con diagnóstico y selección de variables.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Ajuste por mínimos cuadrados (SP.lineal) con predictores numéricos; la polinomial usa las potencias crudas de x
   (como poly(x, k, raw = TRUE) de R). Además del resumen de siempre (coeficientes con IC, ANOVA, R², AIC y BIC):
     falta de ajuste    con repeticiones de x: el error se parte en falta de ajuste y error puro
     influencia         palancas, residuos estandarizados y estudentizados, Cook, DFFITS, DFBETAS y COVRATIO con
                        los criterios de influence.measures de R
     pruebas            Shapiro-Wilk de los residuos, Breusch-Pagan estudentizada (Koenker), RESET con ŷ² y ŷ³,
                        Durbin-Watson (p exacto con menos de 100 datos)
     colinealidad       VIF y los índices de condición de Belsley, Kuh y Welsch con sus proporciones de varianza
     predicción         intervalos de confianza de la media y de predicción de un dato nuevo
   Selección de variables: paso a paso por AIC (como step), por valor p (adelante, atrás y mixta, con las F de
   add1 y drop1) y mejores subconjuntos (como leaps::regsubsets exhaustivo). Todos los submodelos se ajustan en
   el espacio comprimido del modelo completo (SP.algebra.comprimir): exactos y O(p³) cada uno. */
SP.definir('regresion', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, log, max, min, PI } = Math;
  const D = () => SP.dist;
  const EPS = 2.220446049250313e-16;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);
  const SUP = ['', '', '²', '³', '⁴', '⁵'];
  Object.assign(SP.nombresFunciones, {
    'reg.analizarDe': 'Regresión: coeficientes, ANOVA, falta de ajuste, ajuste y predicciones',
    'reg.influenciaDe': 'Regresión: palancas, residuos, Cook, DFFITS, DFBETAS y COVRATIO',
    'reg.pruebasDe': 'Regresión: Breusch-Pagan, RESET, Durbin-Watson y Shapiro-Wilk de los residuos',
    'reg.colinealidadDe': 'Regresión: VIF e índices de condición',
    'reg.pasosDe': 'Selección de variables paso a paso (AIC y valor p)',
    'reg.subconjuntosDe': 'Selección de variables: mejores subconjuntos',
  });

  /* ---------------- datos ---------------- */
  /** Vista de la tabla con las columnas pedidas y, si se dan, columnas calculadas (las potencias de x). */
  function vista(tabla, nombres, extra) {
    const cols = {};
    for (const n of nombres) cols[n] = tabla.col(n);
    Object.assign(cols, extra || {});
    return { n: tabla.n, nombres: Object.keys(cols), columnas: cols, col(n) { const c = cols[n]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: n })); return c; } };
  }
  /** Tabla de trabajo y nombres de las columnas del modelo (x, x^2, … en la polinomial). */
  function preparar(tabla, respuesta, predictores, grado) {
    const extra = {}, xs = predictores.slice();
    if (grado > 1) {
      const x = tabla.col(predictores[0]).valores;
      for (let g = 2; g <= grado; g++) { const nom = predictores[0] + '^' + g; extra[nom] = { tipo: 'numerica', valores: Float64Array.from(x, v => v ** g) }; xs.push(nom); }
    }
    return { t: vista(tabla, [respuesta, ...predictores], extra), xs };
  }
  const nombreBonito = (c, base, grado) => (grado > 1 && c.startsWith(base + '^') ? base + SUP[Number(c.slice(base.length + 1))] : c);

  function ajustarModelo(t, respuesta, xs, grado) {
    const formula = q(respuesta) + ' ~ ' + (xs.length ? xs.map(q).join(' + ') : '1');
    const a = SP.lineal.ajustar(t, formula);
    if (a.rango < a.modelo.p) {
      if (grado > 1) {
        throw new SP.ErrorSP(T('La curva de grado {g} necesita al menos {k} valores distintos de «{x}».', { g: grado, k: grado + 1, x: xs[0] }), T('Baja el grado del polinomio.'));
      }
      const alias = a.modelo.columnas.filter((_, j) => Number.isNaN(a.coeficientes[j]));
      throw new SP.ErrorSP(T('«{c}» es combinación lineal exacta de los demás predictores (colinealidad perfecta): su coeficiente no se puede estimar.', { c: alias.join('», «') }),
        T('Quita esa variable del modelo.'));
    }
    return a;
  }
  /** (XᵀX)⁻¹ en el orden original de las columnas (modelo de rango completo). */
  function covOriginal(a) {
    const d = a.qr, k = d.rango, p = d.p, Vk = SP.algebra.rtrInversa(d), V = new Float64Array(p * p);
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) V[d.pivote[i] + d.pivote[j] * p] = Vk[i + j * k];
    return V;
  }
  const media = v => { let s = 0; for (const x of v) s += x; let m = s / v.length, c = 0; for (const x of v) c += x - m; return m + c / v.length; };
  function desviacion(v) { const m = media(v); let s = 0; for (const x of v) s += (x - m) * (x - m); return sqrt(s / (v.length - 1)); }
  const columna = (mm, j) => mm.X.subarray(j * mm.n, (j + 1) * mm.n);

  /* ---------------- falta de ajuste ---------------- */
  /** Con repeticiones de x: SC de error puro (dentro de cada combinación de x) y de falta de ajuste. */
  function faltaAjuste(a) {
    const mm = a.modelo, n = mm.n, y = mm.y;
    const gr = SP.algebra.agruparFilas(mm.X, n, mm.p, 1);
    if (!gr || gr.G === n) return null;
    const G = gr.G, glPuro = n - G, glFalta = G - a.rango;
    if (glFalta < 1 || glPuro < 1) return null;
    const m = new Float64Array(G);
    for (let i = 0; i < n; i++) m[gr.g[i]] += y[i];
    for (let g = 0; g < G; g++) m[g] /= gr.cuenta[g];
    const c = new Float64Array(G);
    for (let i = 0; i < n; i++) c[gr.g[i]] += y[i] - m[gr.g[i]];
    for (let g = 0; g < G; g++) m[g] += c[g] / gr.cuenta[g];
    let scPuro = 0;
    for (let i = 0; i < n; i++) scPuro += (y[i] - m[gr.g[i]]) ** 2;
    const scFalta = a.scResidual - scPuro, cmPuro = scPuro / glPuro, cmFalta = scFalta / glFalta, F = cmFalta / cmPuro;
    return { grupos: G, falta: { gl: glFalta, sc: scFalta, cm: cmFalta, F, p: D().pf(F, glFalta, glPuro, false) }, puro: { gl: glPuro, sc: scPuro, cm: cmPuro } };
  }

  /* ---------------- influencia (como influence.measures de R) ---------------- */
  function influencia(a, V) {
    const mm = a.modelo, n = mm.n, p = mm.p, gl = a.glResidual, e = a.residuales;
    V = V || covOriginal(a);
    const h = Float64Array.from(SP.sup.influencia(a).palanca);
    for (let i = 0; i < n; i++) if (h[i] > 1 - 10 * EPS) h[i] = 1;
    /* R pone en cero los residuos diminutos (< 100 ε · mediana |e|) antes de calcular σ₍ᵢ₎ y los DFBETAS */
    const ae = Float64Array.from(e, Math.abs).sort(), med = n % 2 ? ae[(n - 1) / 2] : (ae[n / 2 - 1] + ae[n / 2]) / 2;
    const ez = Float64Array.from(e, v => (abs(v) < 100 * EPS * med ? 0 : v));
    let sz = 0, se = 0;
    for (let i = 0; i < n; i++) { sz += ez[i] * ez[i]; se += e[i] * e[i]; }
    const s = sqrt(se / gl);
    const fin = v => (Number.isFinite(v) ? v : NaN);
    const si = new Float64Array(n), rstandard = new Float64Array(n), rstudent = new Float64Array(n), cook = new Float64Array(n), dffits = new Float64Array(n), covratio = new Float64Array(n);
    const dfbetas = Array.from({ length: p }, () => new Float64Array(n)), raiz = Float64Array.from({ length: p }, (_, j) => sqrt(V[j + j * p]));
    const x = new Float64Array(p);
    for (let i = 0; i < n; i++) {
      const hi = h[i];
      si[i] = hi < 1 ? sqrt((sz - ez[i] * ez[i] / (1 - hi)) / (gl - 1)) : sqrt(sz / (gl - 1));
      rstandard[i] = fin(ez[i] / (s * sqrt(1 - hi)));
      rstudent[i] = fin(ez[i] / (si[i] * sqrt(1 - hi)));
      cook[i] = fin((e[i] / (s * (1 - hi))) ** 2 * hi / p);
      dffits[i] = fin(e[i] * sqrt(hi) / (si[i] * (1 - hi)));
      covratio[i] = fin((si[i] / s) ** (2 * p) / (1 - hi));
      const f = hi === 1 ? 0 : ez[i] / (1 - hi);
      for (let j = 0; j < p; j++) x[j] = mm.X[j * n + i];
      for (let j = 0; j < p; j++) {
        let w = 0;
        for (let l = 0; l < p; l++) w += V[j + l * p] * x[l];
        dfbetas[j][i] = fin(w * f / (si[i] * raiz[j]));
      }
    }
    /* criterios de influence.measures (k coeficientes, n casos con palanca > 0) */
    let nh = 0; for (let i = 0; i < n; i++) if (h[i] > 0) nh++;
    const cotas = { dfbetas: 1, dffits: 3 * sqrt(p / (nh - p)), covratio: 3 * p / (nh - p), palanca: 3 * p / nh };
    const banderas = { dfbetas: new Array(n), dffits: new Array(n), covratio: new Array(n), cook: new Array(n), palanca: new Array(n) };
    const influyente = new Array(n);
    for (let i = 0; i < n; i++) {
      banderas.dfbetas[i] = dfbetas.some(c => abs(c[i]) > 1);
      banderas.dffits[i] = abs(dffits[i]) > cotas.dffits;
      banderas.covratio[i] = abs(1 - covratio[i]) > cotas.covratio;
      banderas.cook[i] = Number.isFinite(cook[i]) && D().pf(cook[i], p, nh - p) > 0.5;
      banderas.palanca[i] = h[i] > cotas.palanca;
      influyente[i] = banderas.dfbetas[i] || banderas.dffits[i] || banderas.covratio[i] || banderas.cook[i] || banderas.palanca[i];
    }
    return { palanca: h, rstandard, rstudent, cook, dffits, covratio, dfbetas, sigma_i: si, s, banderas, influyente, cotas };
  }

  /* ---------------- pruebas del modelo ---------------- */
  /** Breusch-Pagan estudentizada (Koenker), con los mismos regresores que el modelo, como lmtest::bptest. */
  function breuschPagan(a) {
    const mm = a.modelo, n = mm.n, e = a.residuales;
    let s2 = 0; for (let i = 0; i < n; i++) s2 += e[i] * e[i];
    s2 /= n;
    const w = Float64Array.from(e, v => v * v - s2);
    const aux = SP.algebra.minimosCuadrados(mm.X, n, mm.p, w, 1e-7);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { const f = w[i] - aux.residuales[i]; num += f * f; den += w[i] * w[i]; }
    const BP = n * num / den, gl = aux.qr.rango - 1;
    return { BP, gl, p: gl > 0 ? D().pchisq(BP, gl, false) : NaN };
  }
  /** RESET de Ramsey con ŷ² y ŷ³ (lmtest::resettest con sus valores de omisión). */
  function reset(a) {
    const mm = a.modelo, n = mm.n, k = mm.p, y = mm.y;
    if (n - (k + 2) < 1) return null;
    const m = media(y), s = desviacion(y), ys = Float64Array.from(y, v => (v - m) / s);
    const f1 = SP.algebra.minimosCuadrados(mm.X, n, k, ys, 1e-7);
    const XZ = new Float64Array(n * (k + 2));
    XZ.set(mm.X);
    for (let i = 0; i < n; i++) { const f = ys[i] - f1.residuales[i]; XZ[k * n + i] = f * f; XZ[(k + 1) * n + i] = f * f * f; }
    const f2 = SP.algebra.minimosCuadrados(XZ, n, k + 2, ys, 1e-7);
    const gl1 = 2, gl2 = n - (k + 2), F = (gl2 / gl1) * ((f1.scResidual - f2.scResidual) / f2.scResidual);
    return { F, gl1, gl2, p: D().pf(F, gl1, gl2, false) };
  }
  function pruebas(a) {
    const n = a.modelo.n, e = Array.from(a.residuales);
    return {
      shapiro: n >= 3 && n <= 5000 ? (() => { try { return SP.sup.shapiro(e); } catch (err) { return null; } })() : null,
      breusch_pagan: a.modelo.p >= 2 ? breuschPagan(a) : null,
      reset: reset(a),
      durbin_watson: n >= 3 ? SP.sup.durbinWatson(a) : null,
    };
  }

  /* ---------------- colinealidad ---------------- */
  /** VIF (car::vif) y los índices de condición de Belsley con las columnas escaladas a longitud 1 (con intercepto). */
  function colinealidad(a) {
    const mm = a.modelo, n = mm.n, p = mm.p;
    const cols = mm.columnas.map((_, j) => j).filter(j => mm.asignacion[j] > 0), m = cols.length;
    if (m < 2) return null;
    /* VIF_j = ‖x_j − x̄_j‖² · [(X_cᵀX_c)⁻¹]_jj */
    const Xc = new Float64Array(n * m), norma2 = new Float64Array(m);
    cols.forEach((j, c) => {
      const x = columna(mm, j), mu = media(x);
      for (let i = 0; i < n; i++) { const v = x[i] - mu; Xc[c * n + i] = v; norma2[c] += v * v; }
    });
    const dc = SP.algebra.qr(Xc, n, m, 1e-7), Vc = SP.algebra.rtrInversa(dc), vif = new Array(m).fill(NaN);
    for (let jp = 0; jp < dc.rango; jp++) vif[dc.pivote[jp]] = norma2[dc.pivote[jp]] * Vc[jp + jp * dc.rango];
    /* índices de condición: SVD de la matriz escalada (por la R de su QR, con Jacobi) */
    const Xs = new Float64Array(n * p);
    for (let j = 0; j < p; j++) { const x = columna(mm, j), nr = SP.algebra.norma(x, 0, n); for (let i = 0; i < n; i++) Xs[j * n + i] = x[i] / nr; }
    const ds = SP.algebra.qr(Xs, n, p, 1e-7), k = ds.rango, R = new Float64Array(k * k);
    for (let i = 0; i < k; i++) for (let j = i; j < k; j++) R[i + j * k] = SP.algebra.elemR(ds, i, j);
    const sv = SP.algebra.svdJacobi(R, k, k);
    const indices = Array.from(sv.d, v => sv.d[0] / v);
    /* proporciones de la varianza de cada coeficiente (columnas) que van con cada dimensión (filas) */
    const phi = Array.from({ length: p }, () => new Float64Array(k));
    for (let jp = 0; jp < k; jp++) for (let dim = 0; dim < k; dim++) phi[ds.pivote[jp]][dim] = sv.V[jp + dim * k] ** 2 / (sv.d[dim] * sv.d[dim]);
    const tot = phi.map(f => f.reduce((s, v) => s + v, 0));
    const proporciones = Array.from({ length: k }, (_, dim) => Array.from({ length: p }, (_, j) => phi[j][dim] / tot[j]));
    return { predictores: cols.map(j => mm.columnas[j]), vif, indices, valores_singulares: Array.from(sv.d), proporciones, kappa: indices[indices.length - 1] };
  }

  /* ---------------- predicción ---------------- */
  /** Predicción en las filas x0 (cada una con los p valores de la matriz del modelo). */
  function predecir(a, V, filas, nivel) {
    const p = a.modelo.p, s = sqrt(a.scResidual / a.glResidual), c = D().qt(1 - (1 - nivel) / 2, a.glResidual);
    const b = a.coeficientes, out = { ajuste: [], ee: [], ic_inf: [], ic_sup: [], ip_inf: [], ip_sup: [] };
    for (const x0 of filas) {
      let f = 0, v = 0;
      for (let j = 0; j < p; j++) { f += x0[j] * b[j]; let u = 0; for (let l = 0; l < p; l++) u += V[j + l * p] * x0[l]; v += u * x0[j]; }
      const ee = s * sqrt(v), ep = sqrt(s * s + ee * ee);
      out.ajuste.push(f); out.ee.push(ee); out.ic_inf.push(f - c * ee); out.ic_sup.push(f + c * ee); out.ip_inf.push(f - c * ep); out.ip_sup.push(f + c * ep);
    }
    return out;
  }
  /** Lee los valores para predecir: un renglón por punto; separados por espacios o «;»; coma decimal aceptada. */
  function leerValores(texto, q0) {
    const renglones = String(texto || '').split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    const leer = r => r.replace(/(\d),(\d)/g, '$1.$2').split(/[\s;,]+/).filter(Boolean).map(v => {
      const x = Number(v.replace('−', '-'));
      exigir(Number.isFinite(x), T('«{v}» no es un número en los valores para predecir.', { v }));
      return x;
    });
    if (q0 === 1) return renglones.flatMap(leer).map(x => [x]);
    return renglones.map(r => {
      const v = leer(r);
      exigir(v.length === q0, T('Cada renglón de los valores para predecir lleva {k} números, uno por predictor, en su orden.', { k: q0 }));
      return v;
    });
  }

  /* ---------------- análisis completo ---------------- */
  /**
   * @param {object} tabla
   * @param {object} e   { respuesta, predictores: [...] } (polinomial: un predictor)
   * @param {object} op  { grado (1 = lineal), nivel, alfa, predecir: texto }
   */
  function analizar(tabla, e, op) {
    op = Object.assign({ grado: 1, nivel: 0.95, alfa: 0.05, predecir: '' }, op || {});
    const preds = lista(e.predictores), grado = Number(op.grado) || 1, nivel = Number(op.nivel);
    const { t, xs } = preparar(tabla, e.respuesta, preds, grado);
    const a = ajustarModelo(t, e.respuesta, xs, grado);
    const mm = a.modelo, n = mm.n, p = mm.p, gl = a.glResidual;
    exigir(gl >= 1, T('Hacen falta más observaciones ({n}) que coeficientes ({p}).', { n, p }), T('Quita predictores o reúne más datos.'));
    const V = covOriginal(a), res = SP.lineal.resumen(a), avisos = [];
    const y = mm.y, my = media(y), sy = desviacion(y);
    const cq = D().qt(1 - (1 - nivel) / 2, gl);
    const nombres = mm.columnas.map(c => (c === '(Intercepto)' ? c : nombreBonito(c, preds[0], grado)));
    const coef = {
      nombre: nombres, estimado: res.coeficientes.estimado, ee: res.coeficientes.ee, t: res.coeficientes.t, p: res.coeficientes.p,
      ic_inf: res.coeficientes.estimado.map((b, j) => b - cq * res.coeficientes.ee[j]), ic_sup: res.coeficientes.estimado.map((b, j) => b + cq * res.coeficientes.ee[j]),
      beta: mm.columnas.map((c, j) => (mm.asignacion[j] > 0 ? res.coeficientes.estimado[j] * desviacion(columna(mm, j)) / sy : NaN)),
    };
    /* ANOVA de la regresión: SC de la regresión = Σ(ŷ − ȳ)² (como summary.lm) */
    let scReg = 0, sct = 0;
    for (let i = 0; i < n; i++) { scReg += (a.ajustados[i] - my) ** 2; sct += (y[i] - my) ** 2; }
    const glReg = p - 1, cme = a.scResidual / gl, F = (scReg / glReg) / cme;
    const anova = {
      regresion: { gl: glReg, sc: scReg, cm: scReg / glReg, F, p: glReg > 0 ? D().pf(F, glReg, gl, false) : NaN },
      error: { gl, sc: a.scResidual, cm: cme }, total: { gl: n - 1, sc: sct },
    };
    const falta = faltaAjuste(a);
    /* SC secuenciales (tipo I) y parciales (tipo II) de cada término */
    const formula = q(e.respuesta) + ' ~ ' + xs.map(q).join(' + ');
    const t1 = SP.lineal.anova(t, formula, { tipo: 1 }), t2 = SP.lineal.anova(t, formula, { tipo: 2 });
    const k1 = t1.fuente.length - 1;
    const terminos = {
      fuente: t1.fuente.slice(0, k1).map(f => nombreBonito(f, preds[0], grado)), gl: t1.gl.slice(0, k1),
      sc1: t1.sc.slice(0, k1), F1: t1.F.slice(0, k1), p1: t1.p.slice(0, k1),
      sc2: t2.sc.slice(0, k1), F2: t2.F.slice(0, k1), p2: t2.p.slice(0, k1),
    };
    const logLik = -0.5 * n * (log(2 * PI) + 1 - log(n) + log(a.scResidual));
    const ajuste = {
      r2: res.r2, r2_ajustada: res.r2_ajustada, sigma: sqrt(cme), cv: 100 * sqrt(cme) / my, logLik,
      aic: -2 * logLik + 2 * (p + 1), bic: -2 * logLik + log(n) * (p + 1), n, gl,
    };
    const inf = influencia(a, V);
    /* ajuste perfecto (los datos caen sobre la recta o curva): no hay error que diagnosticar */
    const perfecto = !(sqrt(cme) > 1e-10 * sy);
    if (perfecto) avisos.push(T('Ajuste perfecto: los datos caen exactamente sobre el modelo y no queda error que analizar. Revisa que la respuesta no se haya calculado a partir de los predictores.'));
    const out = {
      perfecto,
      tipo: 'regresion', modelo: grado > 1 ? 'polinomial' : preds.length > 1 ? 'multiple' : 'simple', grado, respuesta: e.respuesta, predictores: preds,
      formula: grado > 1 ? `${q(e.respuesta)} ~ poly(${q(preds[0])}, ${grado}, raw = TRUE)` : formula, n, excluidas: tabla.n - n, nivel, alfa: Number(op.alfa),
      coeficientes: coef, anova, falta_ajuste: falta, terminos, ajuste, pruebas: perfecto ? { shapiro: null, breusch_pagan: null, reset: null, durbin_watson: null } : pruebas(a),
      influencia: Object.assign({}, inf, { n_influyentes: inf.influyente.filter(Boolean).length }),
      colinealidad: grado > 1 ? null : colinealidad(a), avisos,
    };
    if (out.colinealidad && out.colinealidad.vif.some(v => v > 10)) avisos.push(T('Hay predictores con VIF mayor que 10: sus coeficientes son inestables (colinealidad).'));
    /* filas para graficar y para identificar observaciones (número de fila de la tabla, desde 1) */
    out.filas = Array.from(mm.filas, i => i + 1);
    out.observados = Array.from(y); out.ajustados = Array.from(a.ajustados); out.residuos = Array.from(a.residuales);
    if (preds.length === 1) {
      const x = Array.from(columna(mm, 1)), x0 = Math.min(...x), x1 = Math.max(...x);
      const malla = Array.from({ length: 101 }, (_, i) => x0 + (x1 - x0) * i / 100);
      out.x = x;
      out.banda = Object.assign({ x: malla }, predecir(a, V, malla.map(v => Array.from({ length: p }, (_, g) => v ** g)), nivel));
      if (grado >= 2 && grado <= 3) out.optimo = optimo(coef.estimado, x0, x1);
    }
    if (String(op.predecir || '').trim()) {
      const vals = leerValores(op.predecir, preds.length);
      const filas = vals.map(v => (grado > 1 ? Array.from({ length: p }, (_, g) => v[0] ** g) : [1, ...v]));
      out.predicciones = Object.assign({ valores: vals }, predecir(a, V, filas, nivel));
    }
    return out;
  }
  /** Puntos donde la curva de grado 2 o 3 tiene su máximo o mínimo (derivada = 0) dentro del intervalo de los datos. */
  function optimo(b, x0, x1) {
    const ev = x => b.reduce((s, c, g) => s + c * x ** g, 0);
    if (b.length === 3) {
      const x = -b[1] / (2 * b[2]);
      return { x, y: ev(x), tipo: b[2] < 0 ? 'maximo' : 'minimo', dentro: x >= x0 && x <= x1 };
    }
    /* cúbica: 3b₃x² + 2b₂x + b₁ = 0 */
    const A = 3 * b[3], B = 2 * b[2], C = b[1], disc = B * B - 4 * A * C;
    if (!(disc > 0)) return null;
    const r = sqrt(disc), qq = -0.5 * (B + (B >= 0 ? r : -r));
    const raices = [qq / A, C / qq].sort((u, v) => u - v);
    const puntos = raices.map(x => ({ x, y: ev(x), tipo: 6 * b[3] * x + 2 * b[2] < 0 ? 'maximo' : 'minimo', dentro: x >= x0 && x <= x1 }));
    const dentro = puntos.filter(pt => pt.dentro);
    return dentro.find(pt => pt.tipo === 'maximo') || dentro[0] || null;
  }

  /* ---------------- selección de variables ---------------- */
  function espacioCompleto(tabla, respuesta, candidatos) {
    const { t } = preparar(tabla, respuesta, candidatos, 1);
    const a = ajustarModelo(t, respuesta, candidatos);
    const n = a.modelo.n, comp = SP.algebra.comprimir(a.qr, a.efectos), base = a.scResidual;
    exigir(a.glResidual >= 1, T('Hacen falta más observaciones ({n}) que coeficientes del modelo completo ({p}).', { n, p: a.modelo.p }));
    /* columna 0: intercepto; la j + 1: el candidato j */
    const ajusteDe = S => { const r = SP.algebra.scResidualSub(comp, [0, ...S.map(j => j + 1)], 1e-7); return { rss: base + r.sc, rango: r.rango }; };
    let sct = 0; const y = a.modelo.y, my = media(y);
    for (const v of y) sct += (v - my) ** 2;
    return { t, a, n, ajusteDe, sct };
  }
  /**
   * Paso a paso. criterio 'aic': direccion 'ambas' (desde el modelo completo, como step(modelo)), 'atras' o 'adelante'
   * (desde el modelo nulo); con AIC = n·log(SCE/n) + 2·k (extractAIC). criterio 'p': 'adelante', 'atras' o 'mixta' con
   * las F de add1 y drop1: entra la de menor p si p < entrada; sale la de mayor p si p > salida.
   */
  function pasos(tabla, e, op) {
    op = Object.assign({ criterio: 'aic', direccion: 'ambas', entrada: 0.05, salida: 0.1 }, op || {});
    const cand = lista(e.predictores), m = cand.length;
    const E = espacioCompleto(tabla, e.respuesta, cand), n = E.n;
    const aic = f => n * log(f.rss / n) + 2 * f.rango;
    const r2aj = f => 1 - (f.rss / (n - f.rango)) / (E.sct / (n - 1));
    const registro = (accion, j, actual, extra) => {
      const f = E.ajusteDe(actual);
      return Object.assign({ accion, variable: j === null ? null : cand[j], variables: actual.map(x => cand[x]), rss: f.rss, gl: n - f.rango, aic: aic(f), r2_ajustada: r2aj(f) }, extra || {});
    };
    let actual, camino = [];
    if (op.criterio === 'aic') {
      const atras = op.direccion !== 'adelante', adelante = op.direccion !== 'atras';
      actual = op.direccion === 'adelante' ? [] : cand.map((_, j) => j);
      camino.push(registro(null, null, actual));
      for (let it = 0; it < 1000; it++) {
        const aic0 = aic(E.ajusteDe(actual)), filas = [{ aic: aic0 }];
        if (atras) for (const j of actual) filas.push({ signo: '-', j, aic: aic(E.ajusteDe(actual.filter(x => x !== j))) });
        if (adelante) for (let j = 0; j < m; j++) if (!actual.includes(j)) filas.push({ signo: '+', j, aic: aic(E.ajusteDe([...actual, j])) });
        let mejor = 0;
        for (let r = 1; r < filas.length; r++) if (filas[r].aic < filas[mejor].aic) mejor = r;
        if (mejor === 0) break;
        const f = filas[mejor];
        if (f.aic >= aic0 + 1e-7) break;
        actual = f.signo === '-' ? actual.filter(x => x !== f.j) : [...actual, f.j];
        camino.push(registro(f.signo === '-' ? 'sale' : 'entra', f.j, actual));
      }
    } else {
      const entra = () => {
        const f0 = E.ajusteDe(actual);
        let mejor = null;
        for (let j = 0; j < m; j++) {
          if (actual.includes(j)) continue;
          const f = E.ajusteDe([...actual, j]), df = f.rango - f0.rango;
          if (df < 1) continue;
          const F = ((f0.rss - f.rss) / df) / (f.rss / (n - f.rango)), p = D().pf(F, df, n - f.rango, false);
          if (!mejor || p < mejor.p) mejor = { j, F, p };
        }
        return mejor;
      };
      const sale = () => {
        const f0 = E.ajusteDe(actual);
        let peor = null;
        for (const j of actual) {
          const f = E.ajusteDe(actual.filter(x => x !== j)), df = f0.rango - f.rango;
          if (df < 1) continue;
          const F = ((f.rss - f0.rss) / df) / (f0.rss / (n - f0.rango)), p = D().pf(F, df, n - f0.rango, false);
          if (!peor || p > peor.p) peor = { j, F, p };
        }
        return peor;
      };
      actual = op.direccion === 'atras' ? cand.map((_, j) => j) : [];
      camino.push(registro(null, null, actual));
      if (op.direccion === 'atras') {
        for (let s; actual.length && (s = sale()) && s.p > op.salida;) { actual = actual.filter(x => x !== s.j); camino.push(registro('sale', s.j, actual, { F: s.F, p: s.p })); }
      } else {
        for (let it = 0; it < 4 * m + 10; it++) {
          const x = entra();
          if (!x || !(x.p < op.entrada)) break;
          actual = [...actual, x.j]; camino.push(registro('entra', x.j, actual, { F: x.F, p: x.p }));
          if (op.direccion === 'mixta') {
            for (let s; actual.length && (s = sale()) && s.p > op.salida;) { actual = actual.filter(z => z !== s.j); camino.push(registro('sale', s.j, actual, { F: s.F, p: s.p })); }
          }
        }
      }
    }
    /* modelo final, ajustado sobre las mismas filas */
    const finales = actual.map(j => cand[j]);
    const af = SP.lineal.ajustar(E.t, q(e.respuesta) + ' ~ ' + (finales.length ? finales.map(q).join(' + ') : '1'), { filas: Array.from(E.a.modelo.filas) });
    const rf = SP.lineal.resumen(af);
    return {
      tipo: 'seleccion', criterio: op.criterio, direccion: op.direccion, respuesta: e.respuesta, candidatos: cand, n, excluidas: tabla.n - n,
      entrada: op.entrada, salida: op.salida, pasos: camino, finales,
      final: { nombre: rf.coeficientes.nombre, estimado: rf.coeficientes.estimado, ee: rf.coeficientes.ee, t: rf.coeficientes.t, p: rf.coeficientes.p, r2: rf.r2, r2_ajustada: rf.r2_ajustada, sigma: rf.sigma, aic: aic(E.ajusteDe(actual)) },
    };
  }
  /** Mejores subconjuntos de cada tamaño por SCE (búsqueda exhaustiva), con R², R² ajustada, Cp y BIC como leaps. */
  function subconjuntos(tabla, e, op) {
    op = Object.assign({ mejores: 1 }, op || {});
    const cand = lista(e.predictores), m = cand.length, nb = Math.max(1, Math.min(5, Number(op.mejores) || 1));
    const E = espacioCompleto(tabla, e.respuesta, cand), n = E.n;
    const nulo = E.ajusteDe([]).rss, completo = E.ajusteDe(cand.map((_, j) => j)).rss;
    const sigma2 = completo / (n - (m + 1));
    const filas = [];
    for (let s = 1; s <= m; s++) {
      const mejores = [];
      const S = Array.from({ length: s }, (_, i) => i);
      for (;;) {
        const rss = E.ajusteDe(S).rss;
        if (mejores.length < nb || rss < mejores[mejores.length - 1].rss) {
          let k = mejores.length;
          while (k > 0 && mejores[k - 1].rss > rss) k--;
          mejores.splice(k, 0, { S: S.slice(), rss });
          if (mejores.length > nb) mejores.pop();
        }
        let i = s - 1;
        while (i >= 0 && S[i] === m - s + i) i--;
        if (i < 0) break;
        S[i]++;
        for (let j = i + 1; j < s; j++) S[j] = S[j - 1] + 1;
      }
      mejores.forEach((b, r) => {
        const i = s + 1, vr = b.rss / nulo;
        filas.push({ tamano: s, rango: r + 1, variables: b.S.map(j => cand[j]), rss: b.rss, r2: 1 - vr, r2_ajustada: 1 - vr * (n - 1) / (n - i), cp: b.rss / sigma2 - (n - 2 * i), bic: n * log(vr) + i * log(n) });
      });
    }
    const primeros = filas.filter(f => f.rango === 1);
    const elige = (clave, mayor) => primeros.reduce((b, f) => (b === null || (mayor ? f[clave] > b[clave] : f[clave] < b[clave]) ? f : b), null).tamano;
    return { tipo: 'subconjuntos', respuesta: e.respuesta, candidatos: cand, n, excluidas: tabla.n - n, mejores: nb, filas, elegido: { r2_ajustada: elige('r2_ajustada', true), cp: elige('cp', false), bic: elige('bic', false) } };
  }

  /* ---------------- atajos planos para las pruebas ---------------- */
  const plano = v => Array.from(v);
  function analizarDe(tabla, e, op) {
    const r = analizar(tabla, e, op);
    return { coeficientes: r.coeficientes, anova: r.anova, falta_ajuste: r.falta_ajuste, terminos: r.terminos, ajuste: r.ajuste, predicciones: r.predicciones || null, optimo: r.optimo || null };
  }
  function influenciaDe(tabla, e, op) {
    const r = analizar(tabla, e, op), f = r.influencia;
    return { palanca: plano(f.palanca), rstandard: plano(f.rstandard), rstudent: plano(f.rstudent), cook: plano(f.cook), dffits: plano(f.dffits), covratio: plano(f.covratio),
      dfbetas: f.dfbetas.map(plano), sigma_i: plano(f.sigma_i), influyente: f.influyente, banderas: f.banderas };
  }
  const pruebasDe = (tabla, e, op) => analizar(tabla, e, op).pruebas;
  const colinealidadDe = (tabla, e, op) => analizar(tabla, e, op).colinealidad;
  const pasosDe = (tabla, e, op) => { const r = pasos(tabla, e, op); return { pasos: r.pasos, finales: r.finales, final: r.final }; };
  const subconjuntosDe = (tabla, e, op) => { const r = subconjuntos(tabla, e, op); return { filas: r.filas, elegido: r.elegido }; };

  SP.reg = { analizar, influencia, breuschPagan, reset, colinealidad, faltaAjuste, predecir, leerValores, pasos, subconjuntos, optimo, covOriginal,
    analizarDe, influenciaDe, pruebasDe, colinealidadDe, pasosDe, subconjuntosDe };

  /* ======================= métodos ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const color = (p, alfa) => (!Number.isFinite(p) ? 'gris' : p >= alfa ? 'verde' : p >= alfa / 5 ? 'ambar' : 'rojo');
  const PEOR = { gris: 0, verde: 1, ambar: 2, rojo: 3 };
  const peor = (...cs) => cs.reduce((a, b) => (PEOR[b] > PEOR[a] ? b : a), 'gris');

  function validarRegresion(polinomial) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
      const xs = lista(e.predictores);
      exigir(xs.length >= 1, polinomial ? T('Elige la variable x.') : T('Elige al menos un predictor.'));
      exigir(!polinomial || xs.length === 1, T('La regresión polinomial usa un solo predictor.'));
      exigir(xs.length <= 15, T('Hasta 15 predictores.'));
      for (const x of xs) {
        exigir(tabla.columnas[x], T('No existe la columna «{c}».', { c: x }));
        exigir(tabla.col(x).tipo === 'numerica', T('«{c}» debe ser numérica; para comparar grupos con una covariable usa la ANCOVA.', { c: x }));
        exigir(x !== e.respuesta, T('La respuesta no puede ser también predictor.'));
      }
      exigir(new Set(xs).size === xs.length, T('Un predictor está repetido.'));
      if (polinomial) exigir([2, 3, 4].includes(Number(op.grado)), T('El grado del polinomio va de 2 a 4.'));
      exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
      exigir(op.alfa > 0 && op.alfa < 0.5, T('El nivel de significancia va entre 0 y 0.5.'));
    };
  }

  /** Semáforo de los supuestos de la regresión. */
  function semaforo(r) {
    if (r.perfecto) return [{ nombre: T('Ajuste perfecto'), color: 'gris', texto: T('Sin error no hay supuestos que revisar.') }];
    const a = r.alfa, pr = r.pruebas, sem = [];
    const sw = pr.shapiro;
    sem.push({ nombre: T('Normalidad de los residuos'), color: sw ? color(sw.p, a) : 'gris',
      texto: sw ? T('Shapiro-Wilk W = {w}, p {p}.', { w: sw.W.toFixed(4), p: fp(sw.p) }) : T('Shapiro-Wilk necesita entre 3 y 5000 residuos.') });
    const bp = pr.breusch_pagan;
    sem.push({ nombre: T('Varianza constante'), color: bp ? color(bp.p, a) : 'gris',
      texto: bp ? T('Breusch-Pagan = {b} con {g} gl, p {p}.', { b: f3(bp.BP), g: bp.gl, p: fp(bp.p) }) : T('No aplica.') });
    const rs = pr.reset, fa = r.falta_ajuste;
    const cForma = peor(rs ? color(rs.p, a) : 'gris', fa ? color(fa.falta.p, a) : 'gris');
    sem.push({ nombre: T('Forma del modelo'), color: cForma,
      texto: [rs ? T('RESET F = {F}, p {p}', { F: f3(rs.F), p: fp(rs.p) }) : '', fa ? T('falta de ajuste F = {F}, p {p}', { F: f3(fa.falta.F), p: fp(fa.falta.p) }) : ''].filter(Boolean).join('; ') + '.' });
    const dw = pr.durbin_watson;
    /* el orden de las filas solo dice algo si es el de medición o el del campo: a lo más «revisar» */
    sem.push({ nombre: T('Independencia'), color: dw ? (color(dw.p, a) === 'rojo' ? 'ambar' : color(dw.p, a)) : 'gris',
      texto: dw ? T('Durbin-Watson = {d}, p {p}, en el orden de las filas: importa solo si ese es el orden de medición o la posición en el campo.', { d: dw.DW.toFixed(3), p: fp(dw.p) }) : T('No aplica.') });
    const inf = r.influencia, nCook = inf.banderas.cook.filter(Boolean).length;
    sem.push({ nombre: T('Observaciones influyentes'), color: nCook ? 'rojo' : inf.n_influyentes ? 'ambar' : 'verde',
      texto: nCook ? T('{k} con distancia de Cook grande; {m} señaladas en total.', { k: nCook, m: inf.n_influyentes })
        : inf.n_influyentes ? T('{m} señaladas por algún criterio (palanca, DFFITS, DFBETAS o COVRATIO); ninguna con Cook grande.', { m: inf.n_influyentes }) : T('Ninguna observación sobresale.') });
    if (r.colinealidad) {
      const vmax = Math.max(...r.colinealidad.vif);
      sem.push({ nombre: T('Colinealidad'), color: vmax > 10 ? 'rojo' : vmax > 5 ? 'ambar' : 'verde',
        texto: T('VIF máximo {v}; número de condición {k}.', { v: vmax.toFixed(2), k: r.colinealidad.kappa.toFixed(1) }) });
    }
    return sem;
  }

  function reporteRegresion(r) {
    const a = r.alfa, c = r.coeficientes, conclusiones = [], cuadros = [];
    const titulo = r.modelo === 'polinomial' ? T('Regresión polinomial de grado {g}', { g: r.grado }) : r.modelo === 'multiple' ? T('Regresión lineal múltiple') : T('Regresión lineal simple');
    const pct = Math.round(100 * r.nivel), an = r.anova;
    if (r.perfecto) { /* sin error no hay pruebas que reportar */ } else if (r.modelo === 'simple') {
      const b = c.estimado[1];
      conclusiones.push(c.p[1] < a
        ? T('Por cada unidad más de «{x}», «{y}» {v} en promedio {b} (IC {c} %: {i} a {s}); la relación es significativa (t = {t}, p {p}).', { x: r.predictores[0], y: r.respuesta, v: b >= 0 ? T('aumenta') : T('disminuye'), b: f3(abs(b)), c: pct, i: f3(c.ic_inf[1]), s: f3(c.ic_sup[1]), t: f3(c.t[1]), p: fp(c.p[1]) })
        : T('No hay evidencia de relación lineal entre «{x}» y «{y}» (pendiente {b}, t = {t}, p {p}).', { x: r.predictores[0], y: r.respuesta, b: f3(b), t: f3(c.t[1]), p: fp(c.p[1]) }));
    } else {
      conclusiones.push(an.regresion.p < a
        ? T('El modelo es significativo (F = {F} con {g1} y {g2} gl, p {p}).', { F: f3(an.regresion.F), g1: an.regresion.gl, g2: an.error.gl, p: fp(an.regresion.p) })
        : T('El modelo no es significativo (F = {F} con {g1} y {g2} gl, p {p}).', { F: f3(an.regresion.F), g1: an.regresion.gl, g2: an.error.gl, p: fp(an.regresion.p) }));
      if (r.modelo === 'multiple') {
        const sig = c.nombre.filter((nm, j) => j > 0 && c.p[j] < a);
        conclusiones.push(sig.length ? T('Predictores con efecto propio (ajustado por los demás): {v}.', { v: sig.join(', ') }) : T('Ningún predictor tiene efecto significativo una vez ajustado por los demás.'));
      } else {
        const j = c.nombre.length - 1;
        conclusiones.push(c.p[j] < a ? T('El término de grado {g} es significativo (p {p}): la curva lo necesita.', { g: r.grado, p: fp(c.p[j]) })
          : T('El término de grado {g} no es significativo (p {p}): basta un grado menor.', { g: r.grado, p: fp(c.p[j]) }));
        if (r.optimo && c.p[j] < a && r.optimo.dentro) conclusiones.push(T('La curva tiene su {t} en {x} = {v}, con {y} estimado de {e}.', { t: r.optimo.tipo === 'maximo' ? T('máximo') : T('mínimo'), x: r.predictores[0], v: f3(r.optimo.x), y: r.respuesta, e: f3(r.optimo.y) }));
        else if (r.optimo && c.p[j] < a) conclusiones.push(T('El {t} de la curva queda fuera del intervalo de los datos ({x} = {v}): no lo extrapoles.', { t: r.optimo.tipo === 'maximo' ? T('máximo') : T('mínimo'), x: r.predictores[0], v: f3(r.optimo.x) }));
      }
    }
    if (r.perfecto) conclusiones.unshift(r.avisos[0]);
    conclusiones.push(T('R² = {r} (R² ajustada = {ra}): el modelo explica el {p} % de la variación de «{y}»; error estándar de la estimación {s}.', { r: r.ajuste.r2.toFixed(3), ra: r.ajuste.r2_ajustada.toFixed(3), p: (100 * r.ajuste.r2).toFixed(1), y: r.respuesta, s: f3(r.ajuste.sigma) }));
    if (r.falta_ajuste) conclusiones.push(r.falta_ajuste.falta.p < a ? T('Hay falta de ajuste (F = {F}, p {p}): con las repeticiones se ve que el modelo no sigue la forma de los datos.', { F: f3(r.falta_ajuste.falta.F), p: fp(r.falta_ajuste.falta.p) })
      : T('Sin falta de ajuste (F = {F}, p {p}).', { F: f3(r.falta_ajuste.falta.F), p: fp(r.falta_ajuste.falta.p) }));

    /* cuadro 1: coeficientes */
    const vif = r.colinealidad ? r.colinealidad.vif : null;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes de la regresión'),
      columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor'),
        col('ic', T('IC {c} %', { c: pct }), 'intervaloSig')].concat(r.modelo !== 'polinomial' ? [col('beta', T('β estandarizado'), 'forma2')] : []).concat(vif ? [col('vif', 'VIF', 'forma2')] : []),
      filas: c.nombre.map((nm, j) => ({ termino: nm, b: c.estimado[j], ee: c.ee[j], t: c.t[j], p: c.p[j], ic: [c.ic_inf[j], c.ic_sup[j]], beta: c.beta[j], vif: j > 0 && vif ? vif[j - 1] : NaN })),
      notas: (r.modelo !== 'polinomial' ? [T('β estandarizado: cambio en desviaciones estándar de «{y}» por cada desviación estándar del predictor.', { y: r.respuesta })] : []).concat(vif ? [T('VIF: cuánto crece la varianza de cada coeficiente por su correlación con los demás predictores (> 10, colinealidad seria).')] : []).concat(r.avisos) });
    /* cuadro 2: ANOVA de la regresión */
    const fa = r.falta_ajuste, filas = [{ fuente: T('Regresión'), gl: an.regresion.gl, sc: an.regresion.sc, cm: an.regresion.cm, F: an.regresion.F, p: an.regresion.p },
      { fuente: T('Error'), gl: an.error.gl, sc: an.error.sc, cm: an.error.cm, F: NaN, p: NaN, _clase: 'error' }];
    if (fa) filas.push({ fuente: '\u2003' + T('Falta de ajuste'), gl: fa.falta.gl, sc: fa.falta.sc, cm: fa.falta.cm, F: fa.falta.F, p: fa.falta.p }, { fuente: '\u2003' + T('Error puro'), gl: fa.puro.gl, sc: fa.puro.sc, cm: fa.puro.cm, F: NaN, p: NaN });
    filas.push({ fuente: T('Total'), gl: an.total.gl, sc: an.total.sc, cm: NaN, F: NaN, p: NaN });
    cuadros.push({ id: 'anova', titulo: T('Análisis de varianza de la regresión'),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl', 'gl', 'entero'), col('sc', T('SC'), 'auto4'), col('cm', T('CM'), 'auto4'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas, notas: fa ? [T('Error puro: variación entre repeticiones del mismo valor de x ({g} combinaciones distintas); falta de ajuste: lo que el modelo no explica de las medias de esas combinaciones.', { g: fa.grupos })] : [] });
    /* cuadro 3: ajuste */
    const aj = r.ajuste;
    cuadros.push({ id: 'ajuste', titulo: T('Bondad de ajuste'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: 'R²', valor: aj.r2, _dec: 4 }, { medida: T('R² ajustada'), valor: aj.r2_ajustada, _dec: 4 }, { medida: T('Error estándar de la estimación (σ)'), valor: aj.sigma, _dec: 4 },
        { medida: T('Coeficiente de variación, %'), valor: aj.cv, _dec: 2 }, { medida: 'AIC', valor: aj.aic, _dec: 3 }, { medida: 'BIC', valor: aj.bic, _dec: 3 }, { medida: T('Observaciones'), valor: r.n, _dec: 0 }],
      notas: [T('AIC y BIC sirven para comparar modelos con la misma respuesta y los mismos datos: menor es mejor.')].concat(r.excluidas ? [T('{k} filas con algún faltante no entran.', { k: r.excluidas })] : []) });
    /* cuadro 4: SC secuencial y parcial */
    const tm = r.terminos;
    if (tm.fuente.length > 1) {
      cuadros.push({ id: 'terminos', titulo: r.modelo === 'polinomial' ? T('Aporte de cada grado del polinomio') : T('Aporte de cada predictor'),
        columnas: [col('fuente', r.modelo === 'polinomial' ? T('Término') : T('Predictor'), 'texto'), col('gl', 'gl', 'entero'), col('sc1', T('SC secuencial'), 'auto4'), col('F1', T('F secuencial'), 'forma2'), col('p1', 'p', 'pvalor'),
          col('sc2', T('SC parcial'), 'auto4'), col('F2', T('F parcial'), 'forma2'), col('p2', 'p', 'pvalor')],
        filas: tm.fuente.map((f, k) => ({ fuente: f, gl: tm.gl[k], sc1: tm.sc1[k], F1: tm.F1[k], p1: tm.p1[k], sc2: tm.sc2[k], F2: tm.F2[k], p2: tm.p2[k] })),
        notas: [T('Secuencial (tipo I): lo que agrega cada término a los anteriores, en el orden del modelo. Parcial (tipo II): lo que agrega con todos los demás ya en el modelo; su F es el cuadrado de la t del coeficiente.')] });
    }
    /* cuadro 5: pruebas */
    const pr = r.pruebas, pf = [];
    if (pr.shapiro) pf.push({ prueba: 'Shapiro-Wilk', est: pr.shapiro.W, gl: '', p: pr.shapiro.p, revisa: T('normalidad de los residuos') });
    if (pr.breusch_pagan) pf.push({ prueba: 'Breusch-Pagan', est: pr.breusch_pagan.BP, gl: String(pr.breusch_pagan.gl), p: pr.breusch_pagan.p, revisa: T('varianza constante') });
    if (pr.reset) pf.push({ prueba: 'RESET', est: pr.reset.F, gl: `${pr.reset.gl1}, ${pr.reset.gl2}`, p: pr.reset.p, revisa: T('forma del modelo (curvatura omitida)') });
    if (fa) pf.push({ prueba: T('Falta de ajuste'), est: fa.falta.F, gl: `${fa.falta.gl}, ${fa.puro.gl}`, p: fa.falta.p, revisa: T('forma del modelo (con repeticiones)') });
    if (pr.durbin_watson) pf.push({ prueba: 'Durbin-Watson', est: pr.durbin_watson.DW, gl: '', p: pr.durbin_watson.p, revisa: T('independencia en el orden de las filas') });
    cuadros.push({ id: 'pruebas', titulo: T('Pruebas de los supuestos'), columnas: [col('prueba', T('Prueba'), 'texto'), col('est', T('Estadístico'), 'sig'), col('gl', 'gl', 'texto'), col('p', 'p', 'pvalor'), col('revisa', T('Qué revisa'), 'texto')],
      filas: pf, notas: [T('Breusch-Pagan estudentizada (Koenker); RESET con ŷ² y ŷ³; Durbin-Watson con p exacto si hay menos de 100 datos (autocorrelación positiva).')] });
    /* cuadro 6: observaciones influyentes */
    const inf = r.influencia;
    if (inf.n_influyentes && !r.perfecto) {
      const idx = inf.influyente.map((v, i) => (v ? i : -1)).filter(i => i >= 0).sort((x, y) => (inf.cook[y] || 0) - (inf.cook[x] || 0)).slice(0, 25);
      const crit = i => [inf.banderas.cook[i] ? 'Cook' : '', inf.banderas.palanca[i] ? T('palanca') : '', inf.banderas.dffits[i] ? 'DFFITS' : '', inf.banderas.dfbetas[i] ? 'DFBETAS' : '', inf.banderas.covratio[i] ? 'COVRATIO' : ''].filter(Boolean).join(', ');
      cuadros.push({ id: 'influyentes', titulo: T('Observaciones influyentes'),
        columnas: [col('fila', T('Fila'), 'entero'), col('y', T('Observado'), 'sig'), col('aj', T('Ajustado'), 'sig'), col('rst', T('Residuo estudentizado'), 'forma2'), col('h', T('Palanca'), 'forma2'),
          col('cook', 'Cook', 'forma2'), col('dffits', 'DFFITS', 'forma2'), col('covr', 'COVRATIO', 'forma2'), col('crit', T('Criterio'), 'texto')],
        filas: idx.map(i => ({ fila: r.filas[i], y: r.observados[i], aj: r.ajustados[i], rst: inf.rstudent[i], h: inf.palanca[i], cook: inf.cook[i], dffits: inf.dffits[i], covr: inf.covratio[i], crit: crit(i) })),
        notas: [T('Criterios de influence.measures de R: |DFBETAS| > 1, |DFFITS| > {d}, |1 − COVRATIO| > {c}, F(Cook) > 0.5, palanca > {h}. Revisa que el dato sea correcto antes de pensar en quitarlo.', { d: inf.cotas.dffits.toFixed(3), c: inf.cotas.covratio.toFixed(3), h: inf.cotas.palanca.toFixed(3) })]
          .concat(inf.n_influyentes > idx.length ? [T('Se muestran las {k} de mayor distancia de Cook de {m}.', { k: idx.length, m: inf.n_influyentes })] : []) });
    }
    /* cuadro 7: colinealidad */
    if (r.colinealidad) {
      const cl = r.colinealidad, nom = c.nombre;
      cuadros.push({ id: 'condicion', titulo: T('Índices de condición y proporciones de varianza'),
        columnas: [col('dim', T('Dimensión'), 'entero'), col('indice', T('Índice de condición'), 'forma2')].concat(nom.map((nm, j) => col('v' + j, nm, 'forma2'))),
        filas: cl.indices.map((v, d) => Object.assign({ dim: d + 1, indice: v }, Object.fromEntries(nom.map((_, j) => ['v' + j, cl.proporciones[d][j]])))),
        notas: [T('Belsley, Kuh y Welsch (1980): columnas escaladas a longitud 1, con el intercepto. Un índice mayor que 30 con dos o más proporciones mayores que 0.5 señala colinealidad dañina entre esos coeficientes.')] });
    }
    /* cuadro 8: predicciones */
    if (r.predicciones) {
      const pd = r.predicciones;
      cuadros.push({ id: 'predicciones', titulo: T('Predicciones'),
        columnas: [col('x', r.predictores.join(', '), 'texto'), col('aj', T('Predicción'), 'sig'), col('ee', T('EE de la media'), 'sig'), col('ic', T('IC {c} % de la media', { c: pct }), 'intervaloSig'), col('ip', T('Intervalo de predicción {c} %', { c: pct }), 'intervaloSig')],
        filas: pd.ajuste.map((f, i) => ({ x: pd.valores[i].map(v => String(v)).join(', '), aj: f, ee: pd.ee[i], ic: [pd.ic_inf[i], pd.ic_sup[i]], ip: [pd.ip_inf[i], pd.ip_sup[i]] })),
        notas: [T('El intervalo de confianza es para la media de «{y}» con esos valores; el de predicción, para un dato nuevo (siempre más ancho).', { y: r.respuesta })] });
    }
    return { titulo, conclusiones: conclusiones.map(may), cuadros, semaforo: semaforo(r) };
  }

  function codigoRegresion(polinomial) {
    return (e, op) => {
      const xs = lista(e.predictores), y = q(e.respuesta), g = Number(op.grado) || 2;
      const f = polinomial ? `${y} ~ poly(${q(xs[0])}, ${g}, raw = TRUE)` : `${y} ~ ${xs.map(q).join(' + ')}`;
      const L = [`# ${polinomial ? T('Regresión polinomial') : T('Regresión lineal')} (código R equivalente a SigmaPro)`,
        `modelo <- lm(${f}, data = datos)`, 'summary(modelo)', `confint(modelo, level = ${op.nivel})`,
        'anova(modelo)                    # SC secuenciales (tipo I)'];
      if (!polinomial && xs.length > 1) L.push('car::Anova(modelo, type = 2)     # SC parciales (tipo II)');
      if (!polinomial) L.push(`b <- coef(modelo)[-1]; b * sapply(model.frame(modelo)[-1], sd) / sd(model.response(model.frame(modelo)))   # β estandarizados`);
      L.push('AIC(modelo); BIC(modelo)',
        `# falta de ajuste (con repeticiones de x): anova(modelo, lm(${y} ~ factor(interaction(${xs.map(q).join(', ')})), data = datos))`,
        'shapiro.test(residuals(modelo))', 'lmtest::bptest(modelo)           # Breusch-Pagan estudentizada', 'lmtest::resettest(modelo)        # RESET con ŷ² y ŷ³',
        'lmtest::dwtest(modelo)           # Durbin-Watson', 'summary(influence.measures(modelo))   # observaciones influyentes');
      if (!polinomial && xs.length > 1) {
        L.push('car::vif(modelo)',
          'X <- model.matrix(modelo); Xs <- sweep(X, 2, sqrt(colSums(X^2)), "/"); sv <- svd(Xs)',
          'sv$d[1] / sv$d                   # índices de condición',
          'phi <- sweep(sv$v^2, 2, sv$d^2, "/"); t(phi / rowSums(phi))   # proporciones de varianza');
      }
      if (String(op.predecir || '').trim()) {
        const vals = leerValores(op.predecir, xs.length);
        const nd = polinomial ? `data.frame(${q(xs[0])} = c(${vals.map(v => v[0]).join(', ')}))` : `data.frame(${xs.map((x, j) => `${q(x)} = c(${vals.map(v => v[j]).join(', ')})`).join(', ')})`;
        L.push(`nuevos <- ${nd}`, `(ic <- predict(modelo, nuevos, interval = "confidence", level = ${op.nivel}))   # IC de la media`,
          `(ip <- predict(modelo, nuevos, interval = "prediction", level = ${op.nivel}))   # intervalo de predicción`);
      }
      return L.join('\n');
    };
  }

  /* selección */
  function validarSeleccion(subconj) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
      const xs = lista(e.predictores);
      exigir(xs.length >= 2, T('Elige al menos dos predictores candidatos.'));
      exigir(xs.length <= 15, T('Hasta 15 candidatos (la búsqueda revisa todas las combinaciones).'));
      for (const x of xs) {
        exigir(tabla.columnas[x] && tabla.col(x).tipo === 'numerica', T('«{c}» debe ser una columna numérica.', { c: x }));
        exigir(x !== e.respuesta, T('La respuesta no puede ser también predictor.'));
      }
      exigir(new Set(xs).size === xs.length, T('Un predictor está repetido.'));
      if (!subconj) {
        exigir(['aic', 'p'].includes(op.criterio), T('El criterio es AIC o valor p.'));
        exigir(op.criterio === 'aic' ? ['ambas', 'atras', 'adelante'].includes(op.direccion) : ['mixta', 'atras', 'adelante'].includes(op.direccion), T('Dirección de la búsqueda no válida.'));
        if (op.criterio === 'p') {
          exigir(op.entrada > 0 && op.entrada < 1 && op.salida > 0 && op.salida < 1, T('Los niveles para entrar y salir van entre 0 y 1.'));
          exigir(op.direccion !== 'mixta' || op.entrada <= op.salida, T('Para entrar el nivel debe ser menor o igual que para salir; si no, una variable podría entrar y salir sin fin.'));
        }
      }
    };
  }
  const DIRECCION = { ambas: 'en ambas direcciones desde el modelo completo', atras: 'hacia atrás', adelante: 'hacia adelante', mixta: 'mixta (entra y sale)' };
  function reportePasos(r) {
    const conclusiones = [], cuadros = [];
    const crit = r.criterio === 'aic' ? 'AIC' : T('valor p');
    conclusiones.push(r.finales.length
      ? T('La selección por {c} {d} se queda con {k} de {m} predictores: {v}.', { c: crit, d: T(DIRECCION[r.direccion]), k: r.finales.length, m: r.candidatos.length, v: r.finales.join(', ') })
      : T('La selección por {c} {d} no deja ningún predictor: ninguno mejora el modelo con solo la media.', { c: crit, d: T(DIRECCION[r.direccion]) }));
    conclusiones.push(T('Modelo final: R² = {r}, R² ajustada = {ra}, AIC = {a}.', { r: r.final.r2.toFixed(3), ra: r.final.r2_ajustada.toFixed(3), a: f3(r.final.aic) }));
    conclusiones.push(T('La selección automática es exploratoria: confirma el modelo con el conocimiento del cultivo y revisa su diagnóstico.'));
    const conP = r.criterio === 'p';
    cuadros.push({ id: 'pasos', titulo: T('Pasos de la selección'),
      columnas: [col('paso', T('Paso'), 'entero'), col('cambio', T('Cambio'), 'texto')].concat(conP ? [col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')] : [])
        .concat([col('gl', T('gl del error'), 'entero'), col('rss', T('SC del error'), 'auto4'), col('aic', 'AIC', 'forma2'), col('r2', T('R² ajustada'), 'forma2'), col('vars', T('Predictores en el modelo'), 'texto')]),
      filas: r.pasos.map((s, k) => ({ paso: k, cambio: s.accion ? (s.accion === 'entra' ? '+ ' : '− ') + s.variable : (k === 0 ? T('inicio') : ''), F: s.F, p: s.p, gl: s.gl, rss: s.rss, aic: s.aic, r2: s.r2_ajustada, vars: s.variables.join(', ') || T('(solo la media)') })),
      notas: [r.criterio === 'aic' ? T('AIC = n·log(SCE/n) + 2k, como step() de R: en cada paso se hace el cambio que más baja el AIC; se para cuando ninguno lo baja.')
        : T('Entra la variable de menor p si p < {e}; sale la de mayor p si p > {s} (F parciales, como add1 y drop1 de R).', { e: r.entrada, s: r.salida })]
        .concat(r.excluidas ? [T('{k} filas con algún faltante en los candidatos no entran.', { k: r.excluidas })] : []) });
    const f = r.final;
    cuadros.push({ id: 'final', titulo: T('Coeficientes del modelo final'),
      columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: f.nombre.map((nm, j) => ({ termino: nm, b: f.estimado[j], ee: f.ee[j], t: f.t[j], p: f.p[j] })), notas: [] });
    return { titulo: T('Selección de variables paso a paso'), conclusiones: conclusiones.map(may), cuadros };
  }
  function reporteSubconjuntos(r) {
    const conclusiones = [], cuadros = [], el = r.elegido;
    const prim = s => r.filas.find(f => f.tamano === s && f.rango === 1);
    conclusiones.push(T('Con BIC el mejor modelo tiene {k} predictores: {v}.', { k: el.bic, v: prim(el.bic).variables.join(', ') }));
    conclusiones.push(T('Con Cp de Mallows: {k} predictores ({v}); con la R² ajustada: {k2} ({v2}).', { k: el.cp, v: prim(el.cp).variables.join(', '), k2: el.r2_ajustada, v2: prim(el.r2_ajustada).variables.join(', ') }));
    conclusiones.push(T('BIC castiga más los predictores que Cp y la R² ajustada: cuando no coinciden, el modelo de BIC es el más sencillo.'));
    cuadros.push({ id: 'subconjuntos', titulo: T('Mejores subconjuntos de cada tamaño'),
      columnas: [col('tam', T('Predictores'), 'entero')].concat(r.mejores > 1 ? [col('rango', T('Lugar'), 'entero')] : [])
        .concat([col('vars', T('Variables'), 'texto'), col('r2', 'R²', 'forma2'), col('r2aj', T('R² ajustada'), 'forma2'), col('cp', 'Cp', 'forma2'), col('bic', 'BIC', 'forma2'), col('marca', T('Elegido por'), 'texto')]),
      filas: r.filas.map(f => ({ tam: f.tamano, rango: f.rango, vars: f.variables.join(', '), r2: f.r2, r2aj: f.r2_ajustada, cp: f.cp, bic: f.bic,
        marca: f.rango === 1 ? [el.bic === f.tamano ? 'BIC' : '', el.cp === f.tamano ? 'Cp' : '', el.r2_ajustada === f.tamano ? T('R² aj.') : ''].filter(Boolean).join(', ') : '' })),
      notas: [T('Búsqueda exhaustiva por suma de cuadrados del error, como leaps::regsubsets. BIC y Cp con las fórmulas de leaps (BIC relativo al modelo con solo la media).')]
        .concat(r.excluidas ? [T('{k} filas con algún faltante en los candidatos no entran.', { k: r.excluidas })] : []) });
    return { titulo: T('Mejores subconjuntos de predictores'), conclusiones: conclusiones.map(may), cuadros };
  }
  const codigoPasos = (e, op) => {
    const xs = lista(e.predictores), y = q(e.respuesta), comp = `lm(${y} ~ ${xs.map(q).join(' + ')}, data = datos)`;
    const L = ['# Selección paso a paso (código R equivalente a SigmaPro)', `completo <- ${comp}`, `datos2 <- model.frame(completo)   # las mismas filas para todos los modelos`];
    if (op.criterio === 'aic') {
      if (op.direccion === 'adelante') L.push(`sel <- step(lm(${y} ~ 1, data = datos2), scope = ~ ${xs.map(q).join(' + ')}, direction = "forward")`);
      else L.push(`sel <- step(lm(${y} ~ ${xs.map(q).join(' + ')}, data = datos2), direction = "${op.direccion === 'atras' ? 'backward' : 'both'}")`);
      L.push('sel$anova   # los pasos', 'summary(sel)');
      return L.join('\n');
    }
    /* por valor p: el mismo procedimiento, con las F parciales de add1 y drop1 */
    const sal = ['  repeat {   # sale la de mayor p si p > ' + op.salida, '    if (!length(vs)) break', '    d <- drop1(ajusta(vs), test = "F")[-1, ]', `    if (max(d$\`Pr(>F)\`) <= ${op.salida}) break`,
      `    vs <- setdiff(vs, rownames(d)[which.max(d$\`Pr(>F)\`)])`, '  }'];
    L.push(`xs <- c(${xs.map(x => JSON.stringify(q(x))).join(', ')})`, `ajusta <- function(vs) lm(reformulate(if (length(vs)) vs else "1", "${e.respuesta}"), data = datos2)`);
    if (op.direccion === 'atras') L.push('vs <- xs', 'repeat {', ...sal.slice(1, -1).map(x => x.slice(2)), '}');
    else {
      L.push('vs <- character(0)', 'repeat {   # entra la de menor p si p < ' + op.entrada, '  cand <- setdiff(xs, vs); if (!length(cand)) break', '  a <- add1(ajusta(vs), scope = reformulate(c(vs, cand)), test = "F")[-1, ]',
        `  if (min(a$\`Pr(>F)\`) >= ${op.entrada}) break`, `  vs <- c(vs, rownames(a)[which.min(a$\`Pr(>F)\`)])`);
      if (op.direccion === 'mixta') L.push(...sal);
      L.push('}');
    }
    L.push('summary(ajusta(vs))');
    return L.join('\n');
  };
  const codigoSubconjuntos = (e, op) => {
    const xs = lista(e.predictores), y = q(e.respuesta);
    return ['# Mejores subconjuntos (código R equivalente a SigmaPro)', `s <- summary(leaps::regsubsets(${y} ~ ${xs.map(q).join(' + ')}, data = datos, nvmax = ${xs.length}, nbest = ${op.mejores || 1}))`,
      's$which; s$rsq; s$adjr2; s$cp; s$bic'].join('\n');
  };

  const OPC_REG = { nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 }, predecir: { tipo: 'texto', omision: '' } };
  SP.metodo({
    id: 'regresion-lineal', familia: 'regresion', motor: 'js', orden: 1, nombre: T('Regresión lineal simple y múltiple'),
    resumen: T('Coeficientes con IC, ANOVA, R², AIC y BIC, falta de ajuste, diagnóstico de residuos e influencia, colinealidad y predicciones.'),
    entradas: { respuesta: { tipo: 'numerica' }, predictores: { tipo: 'numerica+', maximo: 15 } }, opciones: OPC_REG,
    validar: validarRegresion(false), calcular: (tabla, e, op) => analizar(tabla, e, Object.assign({}, op, { grado: 1 })), reporte: reporteRegresion, codigoR: codigoRegresion(false),
  });
  SP.metodo({
    id: 'regresion-polinomial', familia: 'regresion', motor: 'js', orden: 2, nombre: T('Regresión polinomial'),
    resumen: T('Curva de grado 2 a 4 con la prueba de cada grado, el máximo o mínimo, bandas de confianza y de predicción, y el diagnóstico.'),
    entradas: { respuesta: { tipo: 'numerica' }, predictores: { tipo: 'numerica' } }, opciones: Object.assign({ grado: { tipo: 'numero', omision: 2 } }, OPC_REG),
    validar: validarRegresion(true), calcular: analizar, reporte: reporteRegresion, codigoR: codigoRegresion(true),
  });
  SP.metodo({
    id: 'seleccion-pasos', familia: 'regresion', motor: 'js', orden: 3, nombre: T('Selección paso a paso'),
    resumen: T('Elige predictores por AIC (como step) o por valor p hacia adelante, atrás o mixta.'),
    entradas: { respuesta: { tipo: 'numerica' }, predictores: { tipo: 'numerica+', maximo: 15 } },
    opciones: { criterio: { tipo: 'texto', omision: 'aic' }, direccion: { tipo: 'texto', omision: 'ambas' }, entrada: { tipo: 'numero', omision: 0.05 }, salida: { tipo: 'numero', omision: 0.1 } },
    validar: validarSeleccion(false), calcular: pasos, reporte: reportePasos, codigoR: codigoPasos,
  });
  SP.metodo({
    id: 'mejores-subconjuntos', familia: 'regresion', motor: 'js', orden: 4, nombre: T('Mejores subconjuntos'),
    resumen: T('Revisa todas las combinaciones de predictores y da las mejores de cada tamaño con R² ajustada, Cp y BIC.'),
    entradas: { respuesta: { tipo: 'numerica' }, predictores: { tipo: 'numerica+', maximo: 15 } },
    opciones: { mejores: { tipo: 'numero', omision: 1 } },
    validar: validarSeleccion(true), calcular: subconjuntos, reporte: reporteSubconjuntos, codigoR: codigoSubconjuntos,
  });
});
