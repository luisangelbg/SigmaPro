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
   * La tabla del ensayo desde las parcelas: o = { y, gen, amb, rep (códigos o null), genos, ambs }.
   * Devuelve las medias, el error combinado, el análisis de cada ambiente, Bartlett y el análisis conjunto.
   */
  function preparar(o) {
    const n = o.y.length, G = o.genos.length, E = o.ambs.length;
    const Ysum = Array.from({ length: G }, () => new Float64Array(E)), N = Array.from({ length: G }, () => new Float64Array(E));
    for (let k = 0; k < n; k++) { Ysum[o.gen[k]][o.amb[k]] += o.y[k]; N[o.gen[k]][o.amb[k]]++; }
    const faltan = [];
    for (let i = 0; i < G; i++) for (let j = 0; j < E; j++) if (!N[i][j]) faltan.push(o.genos[i] + ' en ' + o.ambs[j]);
    if (faltan.length) throw new SP.ErrorSP(T('Faltan combinaciones genotipo × ambiente ({k}): {l}.', { k: faltan.length, l: faltan.slice(0, 4).join(', ') + (faltan.length > 4 ? '…' : '') }),
      T('El análisis multiambiente necesita cada genotipo en cada ambiente; quita los genotipos o ambientes incompletos.'));
    const Y = Ysum.map((f, i) => Array.from(f, (v, j) => v / N[i][j]));
    let inv = 0;
    for (let i = 0; i < G; i++) for (let j = 0; j < E; j++) inv += 1 / N[i][j];
    const r = G * E / inv;
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
    const out = { Y, N, r, gle, cme, ambientes: gle > 0 ? ambientes : null };
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
    const resGl = (g - 1) * (e - 1) - suma(glk.filter(v => v > 0)), resSc = ssGE - suma(ssk.filter((_, k) => glk[k] > 0));
    if (resGl > 0) {
      out.residuo = { sc: resSc, gl: resGl, cm: resSc / resGl };
      if (gle > 0) { out.residuo.F = out.residuo.cm / cme; out.residuo.p = pf(out.residuo.F, resGl, gle); }
    }
    if (gle > 0) {
      const fr = { n: [], sc: [], gl: [], cm: [], F: [], p: [] };
      let sc = ssGE;
      for (let k = 0; k < m; k++) {
        const gl = (g - 1 - k) * (e - 1 - k);
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

  SP.multiambiente = { svd, orientar, aditiva, preparar, estabilidad, ammi, envolvente, gge };
});
