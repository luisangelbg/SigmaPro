/* SigmaPro — ensayos multiambiente y estabilidad: análisis conjunto, regresión sobre el índice ambiental, varianzas de
   estabilidad, superioridad, AMMI y GGE.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Adaptado del motor del bloque 9 de BreedingPro (gxe9.js, del mismo autor, validado contra R el 17 sep 2026).
   Todo parte de la tabla de medias genotipo × ambiente (cada genotipo en cada ambiente) con el error combinado de los
   análisis de cada ambiente (y ~ repetición + genotipo; r = media armónica de las parcelas por celda):
   - análisis conjunto: y ~ amb + amb:rep + gen + gen:amb, secuencial (SP.lineal); ambientes contra repeticiones
     dentro de ambientes, lo demás contra el error; genotipos contra G × A aparte (ambientes aleatorios); Bartlett con
     los cuadrados medios del error de cada ambiente;
   - Finlay y Wilkinson (1963) y Eberhart y Russell (1966): regresión de cada genotipo sobre el índice ambiental, con el
     EE de b de su propia regresión o del error combinado; análisis de Eberhart y Russell con las desviaciones
     combinadas en g(e − 2) gl, como el original; ecovalencia de Wricke (1962, escala de parcela), varianza de Shukla
     (1972, escala de medias, F contra CME/r) y superioridad de Lin y Binns (1988);
   - AMMI: SVD de la interacción (Jacobi de un lado), F de Gollob (1968) y F_R de Cornelius et al. (1992), puntajes
     simétricos U·√λ y V·√λ, ASV (Purchase et al. 2000);
   - GGE (Yan et al. 2000): SVD de la tabla centrada por ambiente (o también escalada), partición del valor singular
     simétrica, por genotipo o por ambiente; quién ganó dónde y media contra estabilidad (Yan 2001).
   El signo de cada eje es arbitrario: el ambiente de mayor |puntaje| queda positivo (en el GGE, el primer eje con la
   suma de los puntajes de ambiente positiva). */
SP.definir('multiambiente', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, max, min, hypot, log } = Math;
  const suma = a => { let s = 0; for (const v of a) s += v; return s; };
  const media = a => suma(a) / a.length;
  const cuad = x => x * x;
  const pf = (F, a, b) => (Number.isFinite(F) && a > 0 && b > 0 ? SP.dist.pf(F, a, b, false) : NaN);

  /* ---------------- descomposición en valores singulares (Jacobi de un lado, Hestenes 1958) ---------------- */
  function svd(Z) {
    const g = Z.length, e = Z[0].length, tr = e > g, m = tr ? e : g, n = tr ? g : e;
    const A = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (tr ? Z[j][i] : Z[i][j])));
    const W = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let barrido = 0; barrido < 80; barrido++) {
      let fuera = 0;
      for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
        let al = 0, be = 0, ga = 0;
        for (let i = 0; i < m; i++) { const x = A[i][p], y = A[i][q]; al += x * x; be += y * y; ga += x * y; }
        if (al === 0 || be === 0) continue;
        const rel = abs(ga) / sqrt(al * be);
        if (rel < 1e-15) continue;
        fuera = max(fuera, rel);
        const z = (be - al) / (2 * ga), t = (z >= 0 ? 1 : -1) / (abs(z) + sqrt(1 + z * z)), c = 1 / sqrt(1 + t * t), s = c * t;
        for (let i = 0; i < m; i++) { const x = A[i][p], y = A[i][q]; A[i][p] = c * x - s * y; A[i][q] = s * x + c * y; }
        for (let i = 0; i < n; i++) { const x = W[i][p], y = W[i][q]; W[i][p] = c * x - s * y; W[i][q] = s * x + c * y; }
      }
      if (fuera < 1e-15) break;
    }
    const normas = Array.from({ length: n }, (_, k) => sqrt(suma(A.map(f => f[k] * f[k]))));
    const orden = normas.map((_, k) => k).sort((a, b) => normas[b] - normas[a]), tope = normas[orden[0]] || 0;
    const quedan = orden.filter(k => normas[k] > 1e-11 * tope && normas[k] > 0), d = quedan.map(k => normas[k]);
    const L = A.map(f => quedan.map((k, q) => f[k] / d[q])), R = W.map(f => quedan.map(k => f[k]));
    return tr ? { d, U: R, V: L } : { d, U: L, V: R };
  }
  function orientar(sv, primeroSuma) {
    sv.d.forEach((_, k) => {
      let voltear;
      if (primeroSuma && k === 0) voltear = suma(sv.V.map(f => f[k])) < 0;
      else {
        let mejor = 0, arg = 0;
        sv.V.forEach((f, j) => { if (abs(f[k]) > mejor + 1e-12) { mejor = abs(f[k]); arg = j; } });
        voltear = sv.V[arg][k] < 0;
      }
      if (voltear) { sv.U.forEach(f => { f[k] = -f[k]; }); sv.V.forEach(f => { f[k] = -f[k]; }); }
    });
    return sv;
  }
  /** Descomposición aditiva de una tabla completa. */
  function aditiva(Y) {
    const g = Y.length, e = Y[0].length, gran = media(Y.flat()), gm = Y.map(media), em = Y[0].map((_, j) => media(Y.map(f => f[j])));
    return { g, e, gran, gm, em, Z: Y.map((f, i) => f.map((v, j) => v - gm[i] - em[j] + gran)) };
  }

  /**
   * Imputación EM-AMMI (Gauch y Zobel 1990), como metan::impute_missing_val(algorithm = "EM-AMMI"): las celdas vacías
   * empiezan en media de la fila + media de la columna − media general (de lo observado); en cada vuelta, con la tabla
   * completa, se recalculan la media, los efectos de fila y columna y los primeros k ejes de la interacción (SVD), y
   * cada celda vacía toma su valor ajustado; termina cuando la raíz del cambio cuadrático medio en las celdas vacías
   * baja de tol. k no pasa de min(celdas observadas por fila y por columna) − 1.
   * @param {number[][]} Y  medias con NaN en las celdas vacías
   */
  function imputarEMAMMI(Y, ejes, tol, maxIter) {
    const g = Y.length, e = Y[0].length, vacia = Y.map(f => f.map(v => v !== v));
    const obsFila = vacia.map(f => f.filter(v => !v).length), obsCol = Y[0].map((_, j) => vacia.filter(f => !f[j]).length);
    if (obsFila.some(v => v === 0) || obsCol.some(v => v === 0)) throw new SP.ErrorSP(T('Un genotipo o un ambiente no tiene ninguna celda con datos: no se puede imputar.'));
    const k = Math.max(0, Math.min(ejes, Math.min(...obsFila, ...obsCol) - 1));
    const obs = [];
    Y.forEach((f, i) => f.forEach((v, j) => { if (!vacia[i][j]) obs.push(v); }));
    const mObs = media(obs), mFila = Y.map((f, i) => media(f.filter((_, j) => !vacia[i][j]))), mCol = Y[0].map((_, j) => media(Y.filter((_, i) => !vacia[i][j]).map(f => f[j])));
    let X = Y.map((f, i) => f.map((v, j) => (vacia[i][j] ? mFila[i] + mCol[j] - mObs : v)));
    let cambio = Infinity, it = 1;
    while (cambio > tol && it < maxIter) {
      const A = aditiva(X), ajuste = Array.from({ length: g }, () => new Float64Array(e));
      if (k >= 1) {
        const sv = svd(A.Z);
        for (let q = 0; q < Math.min(k, sv.d.length); q++) for (let i = 0; i < g; i++) for (let j = 0; j < e; j++) ajuste[i][j] += sv.U[i][q] * sv.d[q] * sv.V[j][q];
      }
      let s = 0, m = 0;
      const nuevo = X.map((f, i) => f.map((v, j) => {
        if (!vacia[i][j]) return v;
        const w = A.gran + (A.gm[i] - A.gran) + (A.em[j] - A.gran) + ajuste[i][j];
        s += (w - v) ** 2; m++;
        return w;
      }));
      cambio = sqrt(s / m); it++; X = nuevo;
    }
    return { Y: X, ejes: k, iteraciones: it, cambio, convergio: cambio <= tol };
  }

  /**
   * La tabla del ensayo desde las parcelas: o = { y, gen, amb, rep (códigos o null), genos, ambs }.
   * Devuelve las medias, el error combinado, el análisis de cada ambiente, Bartlett y el análisis conjunto.
   * op = { imputar: false | true, ejes: 1 }: con celdas genotipo × ambiente vacías, las imputa por EM-AMMI (si no, error).
   */
  function preparar(o, op) {
    const opc = op || {}, n = o.y.length, G = o.genos.length, E = o.ambs.length;
    const Ysum = Array.from({ length: G }, () => new Float64Array(E)), N = Array.from({ length: G }, () => new Float64Array(E));
    for (let k = 0; k < n; k++) { Ysum[o.gen[k]][o.amb[k]] += o.y[k]; N[o.gen[k]][o.amb[k]]++; }
    const faltan = [];
    for (let i = 0; i < G; i++) for (let j = 0; j < E; j++) if (!N[i][j]) faltan.push(o.genos[i] + ' en ' + o.ambs[j]);
    if (faltan.length && !opc.imputar) throw new SP.ErrorSP(T('Faltan combinaciones genotipo × ambiente ({k}): {l}.', { k: faltan.length, l: faltan.slice(0, 4).join(', ') + (faltan.length > 4 ? '…' : '') }),
      T('Activa «Imputar las celdas vacías (EM-AMMI)» o quita los genotipos o ambientes incompletos.'));
    let Y = Ysum.map((f, i) => Array.from(f, (v, j) => (N[i][j] ? v / N[i][j] : NaN))), imputacion = null;
    if (faltan.length) {
      const im = imputarEMAMMI(Y, opc.ejes === undefined ? 1 : opc.ejes, 1e-12, 10000);
      imputacion = { celdas: [], ejes: im.ejes, iteraciones: im.iteraciones, cambio: im.cambio, convergio: im.convergio };
      for (let i = 0; i < G; i++) for (let j = 0; j < E; j++) if (!N[i][j]) imputacion.celdas.push({ genotipo: o.genos[i], ambiente: o.ambs[j], valor: im.Y[i][j] });
      Y = im.Y;
    }
    /* r: media armónica de las parcelas de las celdas con datos */
    let inv = 0, obs = 0;
    for (let i = 0; i < G; i++) for (let j = 0; j < E; j++) if (N[i][j]) { inv += 1 / N[i][j]; obs++; }
    const r = obs / inv;
    /* cada ambiente: y ~ rep + gen */
    const lab = (c, k) => 'n' + c[k];
    const ambientes = { media: [], cme: [], gl: [], cv: [], F: [], p: [] };
    for (let j = 0; j < E; j++) {
      const idx = [];
      for (let k = 0; k < n; k++) if (o.amb[k] === j) idx.push(k);
      const cols = { y: idx.map(k => o.y[k]), g: idx.map(k => lab(o.gen, k)) };
      if (o.rep) cols.r = idx.map(k => lab(o.rep, k));
      const t = SP.tabla.crear(cols, o.rep ? { g: { tipo: 'factor' }, r: { tipo: 'factor' } } : { g: { tipo: 'factor' } });
      const a = SP.lineal.anova(t, o.rep ? 'y ~ r + g' : 'y ~ g', { tipo: 1 }), u = a.fuente.length - 1, ig = a.fuente.indexOf('g');
      const m = media(cols.y), gl = a.gl[u], cme = gl > 0 ? a.sc[u] / gl : NaN;
      ambientes.media.push(m); ambientes.cme.push(cme); ambientes.gl.push(gl); ambientes.cv.push(100 * sqrt(cme) / m);
      ambientes.F.push(gl > 0 ? a.F[ig] : NaN); ambientes.p.push(gl > 0 ? a.p[ig] : NaN);
    }
    const con = ambientes.gl.map(v => v > 0);
    const gle = suma(ambientes.gl.filter((_, j) => con[j])), cme = gle > 0 ? suma(ambientes.cme.map((v, j) => (con[j] ? v * ambientes.gl[j] : 0))) / gle : NaN;
    const out = { Y, N, r, gle, cme, ambientes: gle > 0 ? ambientes : null, imputacion };
    if (con.filter(Boolean).length >= 2) {
      const s2 = ambientes.cme.filter((_, j) => con[j]), nu = ambientes.gl.filter((_, j) => con[j]), k = s2.length, sn = suma(nu);
      const C = 1 + (suma(nu.map(v => 1 / v)) - 1 / sn) / (3 * (k - 1));
      const chi = (sn * log(suma(nu.map((v, h) => v * s2[h])) / sn) - suma(nu.map((v, h) => v * log(s2[h])))) / C;
      out.bartlett = { chi2: chi, gl: k - 1, p: SP.dist.pchisq(chi, k - 1, false), razon: max(...s2) / min(...s2) };
    }
    /* análisis conjunto */
    const cols = { y: Array.from(o.y), a: Array.from(o.amb, (c, k) => lab(o.amb, k)), g: Array.from(o.gen, (c, k) => lab(o.gen, k)) };
    const tipos = { a: { tipo: 'factor' }, g: { tipo: 'factor' } };
    if (o.rep) { cols.r = Array.from(o.rep, (c, k) => lab(o.rep, k)); tipos.r = { tipo: 'factor' }; }
    const f = o.rep ? 'y ~ a + a:r + g + g:a' : gle > 0 ? 'y ~ a + g + g:a' : 'y ~ a + g';
    const a = SP.lineal.anova(SP.tabla.crear(cols, tipos), f, { tipo: 1 });
    const fila = et => a.fuente.findIndex(x => x.split(':').sort().join(':') === et);
    const orden = [fila('a')].concat(o.rep ? [fila('a:r')] : [], [fila('g')], gle > 0 ? [fila('a:g')] : [], [a.fuente.length - 1]);
    const nombres = [T('Ambientes')].concat(o.rep ? [T('Repeticiones/Ambientes')] : [], [T('Genotipos')], gle > 0 ? [T('G × A'), T('Error')] : [T('G × A (residuo)')]);
    const an = { fuente: nombres, gl: orden.map(i => a.gl[i]), sc: orden.map(i => a.sc[i]) };
    an.cm = an.sc.map((s, i) => s / an.gl[i]);
    const u = an.cm.length - 1;
    an.F = an.cm.map((v, i) => (i === u ? NaN : v / an.cm[u]));
    an.p = an.F.map((F, i) => (i === u ? NaN : pf(F, an.gl[i], an.gl[u])));
    if (o.rep) { an.F[0] = an.cm[0] / an.cm[1]; an.p[0] = pf(an.F[0], an.gl[0], an.gl[1]); }
    out.anova = an;
    if (gle > 0) {
      const iG = nombres.indexOf(T('Genotipos')), iGA = nombres.indexOf(T('G × A')), F = an.cm[iG] / an.cm[iGA];
      out.genotipos_vs_ga = { F, gl1: an.gl[iG], gl2: an.gl[iGA], p: pf(F, an.gl[iG], an.gl[iGA]) };
    }
    return out;
  }

  /** Regresión sobre el índice ambiental, Eberhart y Russell, Wricke, Shukla y Lin y Binns. */
  function estabilidad(Y, o) {
    const A = aditiva(Y), { g, e, gran, gm, em, Z } = A, r = o.r, cme = o.cme, gle = o.gle, hayError = gle > 0;
    const I = em.map(v => v - gran), sI2 = suma(I.map(cuad)), cmeM = cme / r;
    const filas = Y.map((f, i) => {
      const b = suma(f.map((v, j) => (v - gm[i]) * I[j])) / sI2, dev = f.map((v, j) => v - gm[i] - b * I[j]);
      const ssd = suma(dev.map(cuad)), msd = ssd / (e - 2), sst = suma(f.map(v => cuad(v - gm[i])));
      const errorComb = o.eeb === 'error' && hayError, ee = sqrt((errorComb ? cmeM : msd) / sI2), t = (b - 1) / ee, glt = errorComb ? gle : e - 2;
      return { b, ee, t, p: 2 * SP.dist.pt(abs(t), glt, false), s2d: msd - cmeM, F: msd / cmeM, p_dev: pf(msd / cmeM, e - 2, gle), r2: 1 - ssd / sst, ssd };
    });
    const col = k => filas.map(x => x[k]);
    const regresion = { b: col('b'), ee: col('ee'), t: col('t'), p: col('p'), r2: col('r2') };
    if (hayError) Object.assign(regresion, { s2d: col('s2d'), F: col('F'), p_dev: col('p_dev') });
    const ssG = r * e * suma(gm.map(v => cuad(v - gran))), ssE = r * g * sI2, ssLin = r * suma(filas.map(x => x.b * x.b)) * sI2, ssHet = ssLin - ssE;
    const ssTot = r * suma(Y.flat().map(v => cuad(v - gran))), ssPool = r * suma(col('ssd')), dfPool = g * (e - 2), msPool = ssPool / dfPool;
    const er = { fuente: [T('Genotipos'), T('Ambientes + G × A'), T('Ambientes (lineal)'), T('G × A (lineal)'), T('Desviaciones combinadas')],
      gl: [g - 1, g * (e - 1), 1, g - 1, dfPool], sc: [ssG, ssTot - ssG, ssE, ssHet, ssPool] };
    er.cm = er.sc.map((s, i) => (i === 1 ? NaN : s / er.gl[i]));
    er.F = [er.cm[0] / msPool, NaN, NaN, er.cm[3] / msPool, hayError ? msPool / cme : NaN];
    er.p = [pf(er.F[0], g - 1, dfPool), NaN, NaN, pf(er.F[3], g - 1, dfPool), hayError ? pf(er.F[4], dfPool, gle) : NaN];
    const W = Z.map(f => r * suma(f.map(cuad))), sW = suma(W);
    const sig = W.map(w => (g * (g - 1) * w - sW) / ((g - 1) * (g - 2) * (e - 1)));
    const shukla = { sigma2: sig.map(v => v / r) };
    if (hayError) Object.assign(shukla, { F: sig.map(v => v / cme), p: sig.map(v => pf(max(0, v / cme), e - 1, gle)) });
    const mejor = Y[0].map((_, j) => (o.objetivo === 'minimo' ? min : max)(...Y.map(f => f[j])));
    return { indice: I, regresion, eberhart_russell: er, wricke: { W, pct: W.map(w => 100 * w / sW) }, shukla,
      lin_binns: Y.map(f => suma(f.map((v, j) => cuad(v - mejor[j]))) / (2 * e)) };
  }

  /** AMMI: ejes con la F de Gollob, F_R de Cornelius, puntajes simétricos y ASV. */
  function ammi(Y, o) {
    const A = aditiva(Y), { g, e, Z } = A, r = o.r, cme = o.cme, gle = o.gle, alfa = o.alfa || 0.05;
    const sv = orientar(svd(Z)), m = min(sv.d.length, g - 1, e - 1), ssGE = r * suma(Z.flat().map(cuad));
    const d = sv.d.slice(0, m), ssk = d.map(v => r * v * v), glk = d.map((_, k) => g + e - 1 - 2 * (k + 1));
    let acum = 0;
    const ejes = { sv: d, sc: ssk, pct: ssk.map(s => 100 * s / ssGE), acum: ssk.map(s => 100 * (acum += s) / ssGE), gl: glk.map(v => (v > 0 ? v : NaN)) };
    ejes.cm = ssk.map((s, k) => (glk[k] > 0 ? s / glk[k] : NaN));
    if (gle > 0) { ejes.F = ejes.cm.map(v => v / cme); ejes.p = ejes.F.map((F, k) => pf(F, glk[k], gle)); }
    const out = { ejes };
    /* cada celda imputada quita un gl a la interacción (Gauch y Zobel 1990) */
    const m0 = o.faltan || 0, resGl = (g - 1) * (e - 1) - m0 - suma(glk.filter(v => v > 0)), resSc = ssGE - suma(ssk.filter((_, k) => glk[k] > 0));
    if (resGl > 0) {
      out.residuo = { sc: resSc, gl: resGl, cm: resSc / resGl };
      if (gle > 0) { out.residuo.F = out.residuo.cm / cme; out.residuo.p = pf(out.residuo.F, resGl, gle); }
    }
    if (gle > 0) {
      const fr = { n: [], sc: [], gl: [], cm: [], F: [], p: [] };
      let sc = ssGE;
      for (let k = 0; k < m; k++) {
        const gl = (g - 1 - k) * (e - 1 - k) - m0;
        if (gl <= 0) break;
        fr.n.push(k); fr.sc.push(sc); fr.gl.push(gl); fr.cm.push(sc / gl); fr.F.push(sc / gl / cme); fr.p.push(pf(sc / gl / cme, gl, gle));
        sc -= ssk[k];
      }
      out.fr = fr;
      const nf = fr.p.findIndex(p => !(p < alfa));
      out.n_fr = nf < 0 ? fr.n.length : nf;
    }
    out.genotipos = sv.U.map(f => f.slice(0, m).map((v, k) => v * sqrt(d[k])));
    out.ambientes = sv.V.map(f => f.slice(0, m).map((v, k) => v * sqrt(d[k])));
    if (m >= 2) out.asv = out.genotipos.map(s => sqrt(cuad(ssk[0] / ssk[1] * s[0]) + cuad(s[1])));
    return out;
  }

  /* envolvente convexa (cadena monótona de Andrew), en sentido antihorario */
  function envolvente(P) {
    const idx = P.map((_, i) => i).sort((a, b) => P[a][0] - P[b][0] || P[a][1] - P[b][1]);
    const cruz = (o, a, b) => (P[a][0] - P[o][0]) * (P[b][1] - P[o][1]) - (P[a][1] - P[o][1]) * (P[b][0] - P[o][0]);
    const abajo = [], arriba = [];
    idx.forEach(i => { while (abajo.length >= 2 && cruz(abajo[abajo.length - 2], abajo[abajo.length - 1], i) <= 1e-12) abajo.pop(); abajo.push(i); });
    idx.slice().reverse().forEach(i => { while (arriba.length >= 2 && cruz(arriba[arriba.length - 2], arriba[arriba.length - 1], i) <= 1e-12) arriba.pop(); arriba.push(i); });
    return abajo.slice(0, -1).concat(arriba.slice(0, -1));
  }

  /** GGE: o = { escala: 'ninguna' | 'desviacion', particion: 'simetrica' | 'genotipo' | 'ambiente', objetivo }. */
  function gge(Y, o) {
    const g = Y.length, em = Y[0].map((_, j) => media(Y.map(f => f[j])));
    const de = Y[0].map((_, j) => sqrt(suma(Y.map(f => cuad(f[j] - em[j]))) / (g - 1))), sgn = o.objetivo === 'minimo' ? -1 : 1;
    const Z = Y.map(f => f.map((v, j) => sgn * (v - em[j]) / (o.escala === 'desviacion' && de[j] > 0 ? de[j] : 1)));
    const sv = orientar(svd(Z), true), tot = suma(sv.d.map(cuad));
    if (sv.d.length < 2) throw new SP.ErrorSP(T('La tabla centrada tiene un solo eje: el biplot GGE necesita al menos dos.'));
    const f = { simetrica: 0.5, genotipo: 1, ambiente: 0 }[o.particion || 'simetrica'];
    const Gc = sv.U.map(u => [0, 1].map(k => u[k] * Math.pow(sv.d[k], f))), Ec = sv.V.map(v => [0, 1].map(k => v[k] * Math.pow(sv.d[k], 1 - f)));
    const ganador = Ec.map(s => { let mejor = -Infinity, arg = -1; Gc.forEach((p, i) => { const v = p[0] * s[0] + p[1] * s[1]; if (v > mejor) { mejor = v; arg = i; } }); return arg; });
    const a = [media(Ec.map(s => s[0])), media(Ec.map(s => s[1]))], la = hypot(a[0], a[1]) || 1, u = [a[0] / la, a[1] / la];
    return { valores: sv.d, pct: sv.d.map(v => 100 * v * v / tot), genotipos: Gc, ambientes: Ec, ganador, vertices: envolvente(Gc),
      proyeccion: Gc.map(s => s[0] * u[0] + s[1] * u[1]), perpendicular: Gc.map(s => abs(s[0] * u[1] - s[1] * u[0])), media_ambiente: u };
  }

  /** Rangos de menor a mayor con los empates promediados (como rank() de R). Se ordena con 12 cifras: dos medias iguales
      que se sumaron en otro orden empatan aunque difieran en la última cifra. */
  function rangos(v0) {
    const v = v0.map(x => +x.toPrecision(12)), idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]), r = new Array(v.length);
    for (let i = 0; i < idx.length;) {
      let j = i;
      while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
      for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  }
  /**
   * Estadísticas no paramétricas de Huehn (1990; Nassar y Huehn 1987). Con los rangos de cada ambiente sobre la
   * respuesta corregida por el efecto del genotipo (y − ȳi + ȳ): S1, la diferencia absoluta media entre pares de
   * ambientes, y S2, la varianza de los rangos, con sus pruebas Z = (S − E)²/V frente a lo esperado sin interacción
   * (cada una contra χ² con 1 gl y su suma contra χ² con g gl). Con los rangos de la respuesta sin corregir, S3 y S6,
   * que combinan respuesta y estabilidad (menor, mejor). Rangos de menor a mayor; con la menor respuesta como objetivo,
   * sobre −y.
   */
  function huehn(Y, objetivo) {
    const s = objetivo === 'minimo' ? -1 : 1, g = Y.length, e = Y[0].length, A = aditiva(Y);
    const porColumna = M => { const R = Y.map(() => new Array(e)); for (let j = 0; j < e; j++) rangos(M.map(f => f[j])).forEach((v, i) => { R[i][j] = v; }); return R; };
    const Rc = porColumna(Y.map((f, i) => f.map(v => s * (v - A.gm[i] + A.gran)))), Ry = porColumna(Y.map(f => f.map(v => s * v)));
    const S1 = Rc.map(f => { let t = 0; for (let j = 0; j < e - 1; j++) for (let k = j + 1; k < e; k++) t += abs(f[j] - f[k]); return t / (e * (e - 1) / 2); });
    const S2 = Rc.map(f => { const m = media(f); return suma(f.map(v => cuad(v - m))) / (e - 1); });
    const S3 = Ry.map(f => { const m = media(f); return suma(f.map(v => cuad(v - m))) / m; });
    const S6 = Ry.map(f => { const m = media(f); return suma(f.map(v => abs(v - m))) / m; });
    const g2 = g * g, E1 = (g2 - 1) / (3 * g), E2 = (g2 - 1) / 12;
    const V1 = (g2 - 1) * ((g2 - 4) * (e + 3) + 30) / (45 * g2 * e * (e - 1)), V2 = (g2 - 1) * (2 * (g2 - 4) * (e - 1) + 5 * (g2 - 1)) / (360 * e * (e - 1));
    const Z1 = S1.map(v => cuad(v - E1) / V1), Z2 = S2.map(v => cuad(v - E2) / V2), pc = (x, gl) => SP.dist.pchisq(x, gl, false);
    return { S1, S2, S3, S6, Z1, Z2, p1: Z1.map(z => pc(z, 1)), p2: Z2.map(z => pc(z, 1)), esperado: { S1: E1, S2: E2, V1, V2 },
      suma: { Z1: suma(Z1), Z2: suma(Z2), p1: pc(suma(Z1), g), p2: pc(suma(Z2), g) } };
  }
  /**
   * Rendimiento-estabilidad YS de Kang (1993), como agricolae::stability.par: el rango de la media (1 = la menor; con
   * empates, el menor) ajustado por la DMS (t de una cola al 5 % con los gl del error combinado): +1 sobre la media
   * general, +2 a una DMS y +3 a dos (y −1, −2, −3 debajo); más la calificación por la varianza de Shukla (escala de
   * parcela, F contra el CME con e − 1 y los gl del error): −2, −4 u −8 si pasa del cuantil 90, 95 o 99 %. Se
   * seleccionan los de YS mayor que el YS medio. Con la menor respuesta como objetivo, sobre −y.
   */
  function kang(Y, o) {
    const s = o.objetivo === 'minimo' ? -1 : 1, g = Y.length, e = Y[0].length, r = o.r, cme = o.cme, gl = o.gle;
    const A = aditiva(Y), mv = A.gm.map(v => s * v), mes = media(mv);
    const W = A.Z.map(f => suma(f.map(cuad))), sW = suma(W);
    const SI = W.map(w => r * (g * (g - 1) * w - sW) / ((g - 1) * (g - 2) * (e - 1)));
    const dms = SP.dist.qt(0.95, gl) * sqrt(2 * cme / (r * e));
    const ajuste = mv.map(v => { let a = 0; if (v > mes) a = 1; if (v >= mes + dms) a = 2; if (v >= mes + 2 * dms) a = 3; if (v < mes) a = -1; if (v <= mes - dms) a = -2; if (v <= mes - 2 * dms) a = -3; return a; });
    const F10 = SP.dist.qf(0.9, e - 1, gl), F05 = SP.dist.qf(0.95, e - 1, gl), F01 = SP.dist.qf(0.99, e - 1, gl);
    const F = SI.map(v => v / cme), califica = F.map(f => (f >= F01 ? -8 : f >= F05 ? -4 : f >= F10 ? -2 : 0));
    const mr = mv.map(x => +x.toPrecision(12)), rango = mr.map(v => 1 + mr.filter(x => x < v).length), YS = rango.map((x, i) => x + ajuste[i] + califica[i]), mYS = media(YS);
    return { rango, ajuste, dms, sigma2: SI, F, p: F.map(f => pf(f, e - 1, gl)), califica, YS, YS_media: mYS, seleccionado: YS.map(v => v > mYS) };
  }
  /**
   * Índice de confianza de Annicchiarico (1992), como metan::Annicchiarico: la respuesta de cada genotipo en % de la
   * media del ambiente; Wi = media de esos % − z(1 − prob)·su desviación estándar (prob = 0.25 por omisión). En todos
   * los ambientes, en los favorables (índice ambiental ≥ 0) y en los desfavorables.
   */
  function annicchiarico(Y, prob) {
    const A = aditiva(Y), z = SP.dist.qnorm(1 - prob);
    const uno = cols => {
      if (cols.length < 2) return null;
      const P = Y.map(f => cols.map(j => 100 * f[j] / A.em[j])), m = P.map(media);
      const de = P.map((f, i) => sqrt(suma(f.map(v => cuad(v - m[i]))) / (cols.length - 1))), W = m.map((v, i) => v - z * de[i]);
      return { ambientes: cols, media: Y.map(f => media(cols.map(j => f[j]))), pct: m, de, Wi: W, rango: rangos(W.map(v => -v)) };
    };
    const todos = Y[0].map((_, j) => j);
    return { prob, z, indice: A.em.map(v => v - A.gran), general: uno(todos), favorables: uno(todos.filter(j => A.em[j] - A.gran >= 0)), desfavorables: uno(todos.filter(j => A.em[j] - A.gran < 0)) };
  }
  /**
   * WAAS (Olivoto et al. 2019), como metan::waas: el promedio de los puntajes AMMI absolutos en los primeros k ejes,
   * ponderado por el % de la interacción de cada eje; k = los ejes significativos por la F de Gollob (todos sin error,
   * o los que se pidan). WAASY combina la respuesta y la estabilidad reescaladas de 0 a 100 (100 = la mejor) con el peso
   * dado a la respuesta (50 por omisión).
   */
  function waas(X, medias, o) {
    const ej = X.ejes, m = ej.sv.length;
    let k = o.ejes || (ej.p ? ej.p.filter(p => p < (o.alfa || 0.05)).length : m);
    k = max(1, min(k, m, X.genotipos[0].length));
    const pct = ej.pct.slice(0, k), sp = suma(pct), w = S => S.map(f => suma(f.slice(0, k).map((v, q) => abs(v) * pct[q])) / sp);
    const Wg = w(X.genotipos), We = w(X.ambientes), s = o.objetivo === 'minimo' ? -1 : 1;
    const ymax = max(...medias), ymin = min(...medias), wmax = max(...Wg), wmin = min(...Wg), peso = o.pesoRespuesta === undefined ? 50 : o.pesoRespuesta;
    const pr = medias.map(v => (s > 0 ? 100 * (v - ymin) : 100 * (ymax - v)) / (ymax - ymin)), pw = Wg.map(v => 100 * (wmax - v) / (wmax - wmin));
    return { ejes: k, criterio: o.ejes ? 'pedido' : ej.p ? 'gollob' : 'todos', genotipos: Wg, ambientes: We, pct_respuesta: pr, pct_waas: pw, waasy: pr.map((v, i) => (v * peso + pw[i] * (100 - peso)) / 100), peso_respuesta: peso };
  }
  /**
   * Vistas del GGE (Yan y Tinker 2006). El genotipo ideal es el punto sobre el eje del ambiente promedio, del lado
   * positivo, a la distancia del vector de genotipo más largo; el ambiente ideal, igual con el vector de ambiente más
   * largo; cada genotipo y cada ambiente se ordena por su distancia al suyo (menor, mejor). Comparar A con B: en cada
   * ambiente, la diferencia que predicen los dos ejes, (gA − gB)·e_j, devuelta a las unidades de la respuesta, y la
   * observada.
   */
  function ggeVistas(q, Y, o) {
    const u = q.media_ambiente, largo = P => max(...P.map(p => hypot(p[0], p[1])));
    const Lg = largo(q.genotipos), Le = largo(q.ambientes), ig = [Lg * u[0], Lg * u[1]], ie = [Le * u[0], Le * u[1]];
    const out = { genotipo_ideal: ig, ambiente_ideal: ie, distancia_genotipos: q.genotipos.map(p => hypot(p[0] - ig[0], p[1] - ig[1])),
      distancia_ambientes: q.ambientes.map(p => hypot(p[0] - ie[0], p[1] - ie[1])) };
    if (o.a !== undefined && o.b !== undefined && o.a !== o.b) {
      const g = Y.length, em = Y[0].map((_, j) => media(Y.map(f => f[j]))), sgn = o.objetivo === 'minimo' ? -1 : 1;
      const de = Y[0].map((_, j) => sqrt(suma(Y.map(f => cuad(f[j] - em[j]))) / (g - 1))), A = q.genotipos[o.a], B = q.genotipos[o.b];
      const esc = j => sgn * (o.escala === 'desviacion' && de[j] > 0 ? de[j] : 1);
      out.comparacion = { a: o.a, b: o.b, prevista: q.ambientes.map((e, j) => ((A[0] - B[0]) * e[0] + (A[1] - B[1]) * e[1]) * esc(j)), observada: Y[0].map((_, j) => Y[o.a][j] - Y[o.b][j]) };
    }
    return out;
  }

  /**
   * Análisis en dos etapas con una varianza por ambiente (Smith et al. 2001; Piepho et al. 2012).
   * Etapa 1: en cada ambiente, y ~ repetición + genotipo (o y ~ genotipo), las medias ajustadas de los genotipos y su
   * varianza (EE²), como emmeans. Etapa 2: media_ij = μ + G_i + A_j + u_ij + e_ij con u_ij ~ N(0, σ²_GA) y la varianza de
   * e_ij fija en la de la etapa 1. σ²_GA por REML (una dimensión: V es diagonal, Brent en [0, 10·var]) y los efectos por
   * mínimos cuadrados generalizados con pesos 1/(σ²_GA + v_ij); la media de cada genotipo en el conjunto (promedio igual
   * de los ambientes) con su EE y la prueba de Wald de los genotipos (F con g − 1 y celdas − rango gl). Las celdas
   * vacías no estorban: cada media pesa lo que vale.
   */
  function dosEtapas(o) {
    const G = o.genos.length, E = o.ambs.length, lab = c => 'n' + c, cod = s => +s.slice(1);
    const m = [], v = [], gi = [], aj = [], porAmb = { media: [], cme: [], gl: [], cv: [], genotipos: [] };
    for (let j = 0; j < E; j++) {
      const idx = [];
      for (let k = 0; k < o.y.length; k++) if (o.amb[k] === j) idx.push(k);
      const cols = { y: idx.map(k => o.y[k]), g: idx.map(k => lab(o.gen[k])) }, tipos = { g: { tipo: 'factor' } };
      if (o.rep) { cols.r = idx.map(k => lab(o.rep[k])); tipos.r = { tipo: 'factor' }; }
      const t = SP.tabla.crear(cols, tipos), a = SP.lineal.ajustar(t, o.rep ? 'y ~ r + g' : 'y ~ g');
      if (!(a.glResidual > 0)) throw new SP.ErrorSP(T('El ambiente {a} no tiene grados de libertad para el error: la primera etapa necesita repeticiones.', { a: o.ambs[j] }));
      const cme = a.scResidual / a.glResidual, my = media(cols.y);
      porAmb.media.push(my); porAmb.cme.push(cme); porAmb.gl.push(a.glResidual); porAmb.cv.push(100 * sqrt(cme) / my);
      const em = SP.medias.emm(t, a, ['g']).filter(x => x.estimable);
      porAmb.genotipos.push(em.length);
      for (const x of em) { m.push(x.emm); v.push(x.ee * x.ee); gi.push(cod(x.niveles.g)); aj.push(j); }
    }
    const N = m.length, p = G + E - 1, X = new Float64Array(N * p);
    for (let c = 0; c < N; c++) { X[c] = 1; if (gi[c] > 0) X[c + gi[c] * N] = 1; if (aj[c] > 0) X[c + (G - 1 + aj[c]) * N] = 1; }
    /* −2 × la log-verosimilitud restringida (sin la constante), con V = diag(σ² + v) */
    const ajusteCon = s2 => {
      const raiz = v.map(x => 1 / sqrt(s2 + x)), Xw = new Float64Array(N * p), mw = Float64Array.from(m, (x, c) => x * raiz[c]);
      for (let k = 0; k < p; k++) for (let c = 0; c < N; c++) Xw[c + k * N] = X[c + k * N] * raiz[c];
      const ls = SP.algebra.minimosCuadrados(Xw, N, p, mw, 1e-10);
      let ld = 0; for (let k = 0; k < ls.qr.rango; k++) ld += 2 * log(abs(ls.qr.diagR[k]));
      return { ls, menos2: suma(v.map(x => log(s2 + x))) + ld + ls.scResidual };
    };
    const vm = media(m), tope = max(10 * suma(m.map(x => cuad(x - vm))) / (N - 1), 1e-8);
    let s2 = SP.num.minimizar(x => ajusteCon(x).menos2, 0, tope, 1e-14).x;
    /* el mínimo de Brent se pule con la raíz del score, d(−2ℓ)/dσ² = tr(P) − y'P²y: con V diagonal, P·y = W·r y
       tr(P) = Σw − Σ_c w_c²·x_c'(X'WX)⁻¹x_c (cada fila de X tiene a lo más tres unos) */
    const score = x => {
      const f = ajusteCon(x), d0 = f.ls.qr, k0 = d0.rango, Vk0 = SP.algebra.rtrInversa(d0), C0 = new Float64Array(p * p);
      for (let a = 0; a < k0; a++) for (let b = 0; b < k0; b++) C0[d0.pivote[a] * p + d0.pivote[b]] = Vk0[a + b * k0];
      let s = 0;
      for (let c = 0; c < N; c++) {
        const w = 1 / (x + v[c]), z = [0].concat(gi[c] > 0 ? [gi[c]] : [], aj[c] > 0 ? [G - 1 + aj[c]] : []);
        let q = 0; for (const a of z) for (const b of z) q += C0[a * p + b];
        s += w - w * w * q - w * f.ls.residuales[c] * f.ls.residuales[c];
      }
      return s;
    };
    if (ajusteCon(0).menos2 <= ajusteCon(s2).menos2 || score(0) >= 0) s2 = 0;
    else {
      let lo = s2 * (1 - 1e-3), hi = s2 * (1 + 1e-3), sl = score(lo), sh = score(hi);
      for (let it = 0; it < 60 && sl > 0; it++) { lo /= 2; sl = score(lo); }
      for (let it = 0; it < 60 && sh < 0; it++) { hi *= 2; sh = score(hi); }
      if (sl < 0 && sh > 0) s2 = SP.num.raizR(score, lo, hi, sl, sh, 1e-15 * s2, 300);
    }
    const fin = ajusteCon(s2), d = fin.ls.qr, k = d.rango;
    if (k < p) throw new SP.ErrorSP(T('Los genotipos y los ambientes no quedan conectados por las celdas con datos: no se pueden comparar todos.'));
    const Vk = SP.algebra.rtrInversa(d), C = new Float64Array(p * p);
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) C[d.pivote[a] * p + d.pivote[b]] = Vk[a + b * k];
    const b = fin.ls.coeficientes, quad = (L1, L2) => { let s = 0; for (let a = 0; a < p; a++) if (L1[a]) for (let c = 0; c < p; c++) if (L2[c]) s += L1[a] * C[a * p + c] * L2[c]; return s; };
    const Lmedia = i => { const L = new Float64Array(p); L[0] = 1; if (i > 0) L[i] = 1; for (let j = 1; j < E; j++) L[G - 1 + j] = 1 / E; return L; };
    const medias = Array.from({ length: G }, (_, i) => { const L = Lmedia(i); let s = 0; for (let a = 0; a < p; a++) s += L[a] * b[a]; return s; });
    const ee = Array.from({ length: G }, (_, i) => sqrt(quad(Lmedia(i), Lmedia(i))));
    /* Wald de los genotipos: los g − 1 coeficientes de genotipo */
    const ig = Array.from({ length: G - 1 }, (_, i) => i + 1), Cg = ig.map(a => ig.map(c => C[a * p + c])), bg = ig.map(a => b[a]);
    const inv = invertir(Cg);
    let W = 0; for (let a = 0; a < G - 1; a++) for (let c = 0; c < G - 1; c++) W += bg[a] * inv[a][c] * bg[c];
    const gl2 = N - k, F = W / (G - 1);
    const simples = Array.from({ length: G }, (_, i) => { const xs = m.filter((_, c) => gi[c] === i); return xs.length === E ? media(xs) : NaN; });
    return { ambientes: porAmb, etapa1: { media: m, varianza: v, genotipo: gi, ambiente: aj }, celdas: N, sigma2_ga: s2,
      menos2logLikR: fin.menos2, estimados: { media: medias, ee, simple: simples }, wald: { F, gl1: G - 1, gl2, p: pf(F, G - 1, gl2), W } };
  }
  /** Inversa de una matriz simétrica pequeña (Gauss-Jordan con pivote). */
  function invertir(A) {
    const n = A.length, M = A.map((f, i) => f.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (abs(M[r][c]) > abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      const d = M[c][c];
      for (let j = 0; j < 2 * n; j++) M[c][j] /= d;
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j]; }
    }
    return M.map(f => f.slice(n));
  }

  SP.multiambiente = { svd, orientar, aditiva, imputarEMAMMI, preparar, estabilidad, ammi, envolvente, gge, rangos, huehn, kang, annicchiarico, waas, ggeVistas, dosEtapas };
});
