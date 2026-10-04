/* SigmaPro — supervivencia: Kaplan-Meier, comparación de curvas (log-rank) y el modelo de riesgos proporcionales de Cox.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las mismas convenciones que el paquete survival de R (Therneau, 2024), escritas desde las fórmulas:
   - Kaplan-Meier (survfit): S(t) = Π (1 − d/n) en cada tiempo distinto (con evento o censura); el error estándar de
     −log S es el de Greenwood, √Σ d/(n(n − d)); los intervalos «log», «log-log» y «plain» como survfit_confint; los
     cuantiles (la mediana) como quantile.survfit: el primer tiempo en que la curva baja a 1 − p o menos, el punto medio
     si la curva se queda justo en 1 − p (tolerancia √ε), y los límites con las curvas de los límites;
   - log-rank y Peto-Peto (survdiff con ρ = 0 o 1): observados y esperados con el peso S(t−)^ρ de la curva conjunta
     (continua por la izquierda), su matriz de varianza hipergeométrica y χ² con k − 1 gl;
   - Cox (coxph): verosimilitud parcial con empates de Efron o de Breslow, Newton-Raphson desde β = 0 con la mitad del
     paso si la verosimilitud baja, pulido hasta que el paso relativo sea menor que 1e-13; razón de verosimilitudes,
     Wald y la prueba score en β = 0; la concordancia de Harrell como concordance; y la prueba de riesgos
     proporcionales de cox.zph (prueba score de agregar x·g(t), con g = 1 − S(t−) de Kaplan-Meier, centrada en los
     eventos). */
SP.definir('supervivencia', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, exp, log, abs, max, min } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const TOL_Q = sqrt(2.220446049250313e-16);

  /** Inversa de una matriz chica (arreglo de arreglos) por Gauss-Jordan con pivote parcial. */
  function inversa(A) {
    const m = A.length, M = A.map((f, i) => Array.from(f).concat(Array.from({ length: m }, (_, j) => (i === j ? 1 : 0))));
    for (let c = 0; c < m; c++) {
      let piv = c;
      for (let r = c + 1; r < m; r++) if (abs(M[r][c]) > abs(M[piv][c])) piv = r;
      exigir(abs(M[piv][c]) > 1e-300, T('La matriz de información es singular: alguna covariable es constante o es combinación de otras.'));
      [M[c], M[piv]] = [M[piv], M[c]];
      const v = M[c][c];
      for (let j = 0; j < 2 * m; j++) M[c][j] /= v;
      for (let r = 0; r < m; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * m; j++) M[r][j] -= f * M[c][j]; }
    }
    return M.map(f => f.slice(m));
  }
  const resolver = (A, u) => inversa(A).map(f => f.reduce((s, v, j) => s + v * u[j], 0));

  /* ---------------- Kaplan-Meier ---------------- */
  /** Una curva: t (tiempos), ev (1 evento, 0 censura), conf = { tipo: 'log' | 'log-log' | 'plain', nivel }. */
  function km(t, ev, conf) {
    const ord = t.map((_, i) => i).sort((a, b) => t[a] - t[b]);
    const out = { tiempo: [], n_riesgo: [], eventos: [], censuras: [], S: [], ee: [], inf: [], sup: [] };
    let n = t.length, s = 1, g = 0;
    for (let k = 0; k < ord.length;) {
      const tt = t[ord[k]];
      let d = 0, c = 0;
      while (k < ord.length && t[ord[k]] === tt) { if (ev[ord[k]]) d++; else c++; k++; }
      out.tiempo.push(tt); out.n_riesgo.push(n); out.eventos.push(d); out.censuras.push(c);
      if (d > 0) { s *= (n - d) / n; g += d < n ? d / (n * (n - d)) : Infinity; }
      out.S.push(s); out.ee.push(sqrt(g));
      n -= d + c;
    }
    const lim = confianza(out.S, out.ee, conf);
    out.inf = lim.inf; out.sup = lim.sup;
    out.n = t.length; out.total_eventos = ev.reduce((a, b) => a + (b ? 1 : 0), 0);
    return out;
  }
  /** Los límites de S con el EE de −log S (survfit_confint con logse = TRUE). */
  function confianza(S, ee, conf) {
    const z = D().qnorm(1 - (1 - conf.nivel) / 2, 0, 1, true), inf = [], sup = [];
    for (let i = 0; i < S.length; i++) {
      const p = S[i], se = ee[i];
      if (conf.tipo === 'plain') {
        const se2 = se * p * z;
        if (!Number.isFinite(se2)) { inf.push(NaN); sup.push(NaN); continue; }
        inf.push(max(p - se2, 0)); sup.push(min(p + se2, 1));
      } else if (conf.tipo === 'log-log') {
        if (p === 0 || p === 1) { inf.push(NaN); sup.push(NaN); continue; }
        const se2 = z * se / log(p), ll = log(-log(p));
        inf.push(exp(-exp(ll - se2))); sup.push(exp(-exp(ll + se2)));
      } else {
        if (p === 0) { inf.push(NaN); sup.push(NaN); continue; }
        const se2 = z * se;
        inf.push(exp(log(p) - se2)); sup.push(min(exp(log(p) + se2), 1));
      }
    }
    return { inf, sup };
  }
  /** findq de survival: x = c(0, tiempos), y = c(0, 1 − curva), el cuantil p (con la tolerancia y el punto medio). */
  function findq(x, y, p) {
    if (!(max(...y.filter(v => v === v)) >= p)) return NaN;
    const xmax = x[x.length - 1], X = [], Y = [];
    const vistos = [];
    for (let i = 0; i < y.length; i++) {
      const v = y[i], dup = vistos.some(w => (w !== w && v !== v) || w === v);
      vistos.push(v);
      if (!dup) { X.push(x[i]); Y.push(v); }
    }
    const n = Y.length;
    /* approx(y ± tol, 1:n, p, method = "constant", f = 1): el índice del extremo derecho; sin los pares con NA */
    const indice = des => {
      const pares = [];
      for (let i = 0; i < n; i++) if (Y[i] === Y[i]) pares.push([Y[i] + des, i]);
      pares.sort((a, b) => a[0] - b[0]);
      if (!pares.length || p < pares[0][0] || p > pares[pares.length - 1][0]) return -1;
      for (let k = 0; k < pares.length; k++) {
        if (pares[k][0] === p) return pares[k][1];
        if (pares[k][0] > p) return pares[k][1];
      }
      return -1;
    };
    const i1 = indice(TOL_Q), i2 = indice(-TOL_Q);
    let q = i1 >= 0 && i2 >= 0 ? (X[i1] + X[i2]) / 2 : NaN;
    if (p === 0) q = X[0];
    if (Y[n - 1] === Y[n - 1] && abs(p - Y[n - 1]) < TOL_Q) q = i1 >= 0 ? (X[i1] + xmax) / 2 : NaN;
    return q;
  }
  /** Cuantiles de una curva (quantile.survfit): p en (0, 1), p. ej. 0.5 para la mediana. */
  function cuantiles(curva, probs) {
    const x = [0].concat(curva.tiempo), uno = v => [0].concat(v.map(s => 1 - s));
    return probs.map(p => ({ p, tiempo: findq(x, uno(curva.S), p), inf: findq(x, uno(curva.inf), p), sup: findq(x, uno(curva.sup), p) }));
  }

  /* ---------------- log-rank ---------------- */
  /** survdiff: t, ev, g (códigos 0..k−1), k grupos, rho (0: log-rank; 1: Peto-Peto). */
  function logrank(t, ev, g, k, rho) {
    const n = t.length, ord = t.map((_, i) => i).sort((a, b) => (t[a] - t[b]) || (ev[b] - ev[a]));
    /* la curva conjunta continua por la izquierda (solo hace falta con rho ≠ 0) */
    const kap = new Float64Array(n);
    if (rho !== 0) {
      let s = 1;
      for (let i = 0; i < n;) {
        let j = i, d = 0;
        while (j < n && t[ord[j]] === t[ord[i]]) { kap[j] = s; d += ev[ord[j]] ? 1 : 0; j++; }
        s *= (n - i - d) / (n - i);
        i = j;
      }
    }
    const obs = new Float64Array(k), esp = new Float64Array(k), V = Array.from({ length: k }, () => new Float64Array(k)), riesgo = new Float64Array(k);
    for (let i = n - 1; i >= 0;) {
      let w = rho === 0 ? 1 : kap[i] ** rho, d = 0, j = i;
      for (; j >= 0 && t[ord[j]] === t[ord[i]]; j--) { const h = g[ord[j]]; d += ev[ord[j]] ? 1 : 0; riesgo[h] += 1; obs[h] += (ev[ord[j]] ? 1 : 0) * w; }
      const nr = n - (j + 1);
      i = j;
      if (d > 0) {
        for (let h = 0; h < k; h++) esp[h] += w * d * riesgo[h] / nr;
        if (nr === 1) continue;
        w *= w;
        for (let a = 0; a < k; a++) {
          const tmp = w * d * riesgo[a] * (nr - d) / (nr * (nr - 1));
          V[a][a] += tmp;
          for (let b = 0; b < k; b++) V[a][b] -= tmp * riesgo[b] / nr;
        }
      }
    }
    const usar = [...Array(k).keys()].filter(h => esp[h] > 0);
    let chi = 0;
    if (usar.length >= 2) {
      const idx = usar.slice(1), u = idx.map(h => obs[h] - esp[h]), M = idx.map(a => idx.map(b => V[a][b]));
      const x = resolver(M, u);
      chi = x.reduce((s, v, i) => s + v * u[i], 0);
    }
    const gl = usar.length - 1;
    return { observados: Array.from(obs), esperados: Array.from(esp), varianza: V.map(f => Array.from(f)), chi2: chi, gl, p: gl > 0 ? D().pchisq(chi, gl, false) : NaN };
  }

  /* ---------------- Cox ---------------- */
  /** Las sumas de cada tiempo con eventos, de mayor a menor tiempo: S0, S1, S2 del conjunto de riesgo y de los eventos. */
  function porTiempo(t, ev, X, beta, efron, cb) {
    const n = t.length, p = beta.length, ord = t.map((_, i) => i).sort((a, b) => t[b] - t[a]);
    let s0 = 0;
    const s1 = new Float64Array(p), s2 = Array.from({ length: p }, () => new Float64Array(p));
    const r = new Float64Array(n), eta = new Float64Array(n);
    for (let i = 0; i < n; i++) { let e = 0; for (let j = 0; j < p; j++) e += X[i][j] * beta[j]; eta[i] = e; }
    /* centrar eta evita desbordes (no cambia los cocientes) */
    const em = eta.reduce((a, b) => max(a, b), -Infinity);
    for (let i = 0; i < n; i++) r[i] = exp(eta[i] - (em > 50 ? em - 50 : 0));
    for (let k = 0; k < n;) {
      const tt = t[ord[k]], muertos = [];
      let d0 = 0;
      const d1 = new Float64Array(p), d2 = Array.from({ length: p }, () => new Float64Array(p));
      for (; k < n && t[ord[k]] === tt; k++) {
        const i = ord[k], xi = X[i], ri = r[i];
        s0 += ri;
        for (let a = 0; a < p; a++) { s1[a] += ri * xi[a]; for (let b = 0; b <= a; b++) s2[a][b] += ri * xi[a] * xi[b]; }
        if (ev[i]) {
          muertos.push(i); d0 += ri;
          for (let a = 0; a < p; a++) { d1[a] += ri * xi[a]; for (let b = 0; b <= a; b++) d2[a][b] += ri * xi[a] * xi[b]; }
        }
      }
      if (!muertos.length) continue;
      const m = muertos.length, partes = [];
      for (let q = 0; q < m; q++) {
        const f = efron ? q / m : 0, S0 = s0 - f * d0, S1 = new Float64Array(p), S2 = Array.from({ length: p }, () => new Float64Array(p));
        for (let a = 0; a < p; a++) { S1[a] = s1[a] - f * d1[a]; for (let b = 0; b <= a; b++) S2[a][b] = S2[b][a] = s2[a][b] - f * d2[a][b]; }
        partes.push({ S0, S1, S2 });
      }
      cb(tt, muertos, partes, eta, em > 50 ? em - 50 : 0);
    }
  }
  /** Verosimilitud parcial, gradiente e información en beta. */
  function evaluar(t, ev, X, beta, efron) {
    const p = beta.length;
    let ll = 0;
    const U = new Float64Array(p), I = Array.from({ length: p }, () => new Float64Array(p));
    porTiempo(t, ev, X, beta, efron, (tt, muertos, partes, eta, corr) => {
      for (const i of muertos) { ll += eta[i]; for (let a = 0; a < p; a++) U[a] += X[i][a]; }
      for (const { S0, S1, S2 } of partes) {
        ll -= log(S0) + corr;
        for (let a = 0; a < p; a++) {
          const ma = S1[a] / S0;
          U[a] -= ma;
          for (let b = 0; b < p; b++) I[a][b] += S2[a][b] / S0 - ma * S1[b] / S0;
        }
      }
    });
    return { ll, U: Array.from(U), I: I.map(f => Array.from(f)) };
  }
  /** Ajuste del modelo de Cox. X: filas de covariables (sin intercepto). op = { empates: 'efron' | 'breslow' }. */
  function cox(t, ev, X, op) {
    const p = X[0].length, efron = (op && op.empates) !== 'breslow';
    let beta = new Array(p).fill(0), e = evaluar(t, ev, X, beta, efron);
    const e0 = e;
    const score0 = cuadratica(e0.I, e0.U);
    let iter = 0, convergio = false;
    for (; iter < 100; iter++) {
      const paso = resolver(e.I, e.U);
      let lam = 1, nb, ne;
      for (let h = 0; h < 40; h++) {
        nb = beta.map((b, j) => b + lam * paso[j]);
        ne = evaluar(t, ev, X, nb, efron);
        if (Number.isFinite(ne.ll) && ne.ll >= e.ll - 1e-12 * abs(e.ll)) break;
        lam /= 2;
      }
      const rel = max(...paso.map((v, j) => abs(lam * v) / max(1, abs(nb[j]))));
      const dll = ne.ll - e.ll;
      beta = nb; e = ne;
      if (rel < 1e-13 || (dll <= 1e-15 * abs(e.ll) && rel < 1e-9)) { convergio = true; iter++; break; }
    }
    const V = inversa(e.I);
    const ee = V.map((f, j) => sqrt(f[j]));
    return { coef: beta, ee, var: V, ll0: e0.ll, ll: e.ll, score: score0, wald: cuadraticaInv(e.I, beta), lr: 2 * (e.ll - e0.ll), gl: p, iteraciones: iter, convergio, info: e.I };
  }
  /** u' A⁻¹ u */
  function cuadratica(A, u) { const x = resolver(A, u); return x.reduce((s, v, i) => s + v * u[i], 0); }
  /** b' A b */
  function cuadraticaInv(A, b) { let s = 0; for (let i = 0; i < b.length; i++) for (let j = 0; j < b.length; j++) s += b[i] * A[i][j] * b[j]; return s; }

  /**
   * Concordancia de Harrell (concordance de survival, sin pesos): para cada evento, los que siguen en riesgo después
   * (o censurados en el mismo tiempo) son comparables; es concordante si el evento tenía el mayor riesgo predicho.
   * En O(n log n): los tiempos de mayor a menor y un árbol de Fenwick con los rangos del predictor de los que ya entraron.
   */
  function concordancia(t, ev, lp) {
    const n = t.length, porLp = [...Array(n).keys()].sort((a, b) => lp[a] - lp[b]), rango = new Int32Array(n);
    let r = 0;
    for (let k = 0; k < n; k++) { if (k > 0 && lp[porLp[k]] !== lp[porLp[k - 1]]) r++; rango[porLp[k]] = r + 1; }
    const m = r + 1, arbol = new Float64Array(m + 1);
    const sumar = i => { for (; i <= m; i += i & -i) arbol[i]++; }, hasta = i => { let s = 0; for (; i > 0; i -= i & -i) s += arbol[i]; return s; };
    const porT = [...Array(n).keys()].sort((a, b) => t[b] - t[a]);
    let conc = 0, disc = 0, empX = 0, empY = 0, dentro = 0;
    for (let k = 0; k < n;) {
      let j = k;
      while (j < n && t[porT[j]] === t[porT[k]]) j++;
      for (let q = k; q < j; q++) if (!ev[porT[q]]) { sumar(rango[porT[q]]); dentro++; }   // censurados en este tiempo: comparables
      let d = 0;
      for (let q = k; q < j; q++) {
        const i = porT[q];
        if (!ev[i]) continue;
        d++;
        const menos = hasta(rango[i] - 1), igual = hasta(rango[i]) - menos;
        conc += menos; empX += igual; disc += dentro - menos - igual;
      }
      empY += d * (d - 1) / 2;
      for (let q = k; q < j; q++) if (ev[porT[q]]) { sumar(rango[porT[q]]); dentro++; }
      k = j;
    }
    return { concordantes: conc, discordantes: disc, empates_x: empX, empates_y: empY, C: (conc + empX / 2) / (conc + disc + empX) };
  }

  /** Prueba de riesgos proporcionales (cox.zph con transform = "km"): χ² de cada variable (o de cada término) y global. */
  function zph(t, ev, X, beta, efron, terminos) {
    const n = t.length, p = beta.length;
    /* g(t) = 1 − S(t−) de Kaplan-Meier de todos, centrada en los tiempos con evento */
    const curva = km(t, ev, { tipo: 'log', nivel: 0.95 });
    const Sizq = tt => { let s = 1; for (let k = 0; k < curva.tiempo.length && curva.tiempo[k] < tt; k++) s = curva.S[k]; return s; };
    const gt = t.map(tt => 1 - Sizq(tt));
    let sg = 0, ne = 0;
    for (let i = 0; i < n; i++) if (ev[i]) { sg += gt[i]; ne++; }
    const gm = sg / ne, g = gt.map(v => v - gm);
    const U2 = new Float64Array(p), I = Array.from({ length: 2 * p }, () => new Float64Array(2 * p));
    porTiempo(t, ev, X, beta, efron, (tt, muertos, partes) => {
      const gg = g[muertos[0]];
      for (const i of muertos) for (let a = 0; a < p; a++) U2[a] += gg * X[i][a];
      for (const { S0, S1, S2 } of partes) {
        for (let a = 0; a < p; a++) {
          U2[a] -= gg * S1[a] / S0;
          for (let b = 0; b < p; b++) {
            const v = S2[a][b] / S0 - (S1[a] / S0) * (S1[b] / S0);
            I[a][b] += v; I[a][p + b] += gg * v; I[p + a][b] += gg * v; I[p + a][p + b] += gg * gg * v;
          }
        }
      }
    });
    const prueba = cols => {
      const kk = [...Array(p).keys()].concat(cols.map(c => c + p));
      const M = kk.map(a => kk.map(b => I[a][b])), u = kk.map(a => (a < p ? 0 : U2[a - p]));
      const chi = cuadratica(M, u);
      return { chi2: chi, gl: cols.length, p: D().pchisq(chi, cols.length, false) };
    };
    const filas = (terminos || [...Array(p).keys()].map(j => ({ nombre: String(j), columnas: [j] }))).map(tm => Object.assign({ termino: tm.nombre }, prueba(tm.columnas)));
    return { terminos: filas, global: prueba([...Array(p).keys()]) };
  }

  SP.supervivencia = { km, confianza, cuantiles, findq, logrank, cox, evaluar, concordancia, zph };
});
