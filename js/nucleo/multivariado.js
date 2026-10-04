/* SigmaPro — multivariado: MANOVA y análisis discriminante lineal.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las mismas convenciones que R, escritas desde las fórmulas:
   - MANOVA (manova + summary.manova): matrices de sumas de cuadrados y productos secuenciales (tipo I) de cada término
     con la base ortonormal de las columnas del modelo en su orden (las columnas que dependen de las anteriores se
     omiten, como el pivoteo de qr); E = R'R de los residuos; valores propios de E⁻¹H (por Cholesky, simétricos) y las
     cuatro pruebas con sus F aproximadas: Pillai, Wilks, Hotelling-Lawley y Roy (la cota superior);
   - la prueba M de Box de igualdad de covarianzas (heplots::boxM, aproximación χ²);
   - discriminante lineal (MASS::lda, method = "moment", previas = proporciones): escalado por la DE dentro de grupos,
     SVD de la matriz dentro (con 1/(n − g)) y de la matriz entre medias (con n·previa/(g − 1)), las funciones
     discriminantes con su proporción de la traza, la clasificación por la regla de plug-in (predict.lda) y la
     validación cruzada dejando uno fuera con la fórmula exacta de lda(CV = TRUE). El signo de cada función
     discriminante es arbitrario (en R lo fija LAPACK): aquí el coeficiente de mayor valor absoluto es positivo. */
SP.definir('multivariado', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, log, exp, max, min } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };

  /* ---------------- álgebra chica ---------------- */
  /** Valores y vectores propios de una matriz simétrica (Jacobi cíclico), de mayor a menor. */
  function propios(A0) {
    const n = A0.length, A = A0.map(f => Array.from(f)), V = A.map((_, i) => A.map((__, j) => (i === j ? 1 : 0)));
    for (let barrido = 0; barrido < 100; barrido++) {
      let fuera = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) fuera += A[i][j] * A[i][j];
      if (fuera < 1e-30 * (1 + A.reduce((s, f, i) => s + f[i] * f[i], 0))) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (abs(A[p][q]) < 1e-300) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (abs(th) + sqrt(th * th + 1)), c = 1 / sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    const orden = A.map((f, i) => i).sort((a, b) => A[b][b] - A[a][a]);
    return { valores: orden.map(i => A[i][i]), vectores: orden.map(i => V.map(f => f[i])) };   // vectores[k] = k-ésimo vector propio
  }
  function cholesky(A) {
    const n = A.length, L = A.map(() => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      let s = A[j][j];
      for (let k = 0; k < j; k++) s -= L[j][k] * L[j][k];
      exigir(s > 0, T('La matriz del error no es definida positiva: hay variables que son combinación de otras o más variables que gl del error.'));
      L[j][j] = sqrt(s);
      for (let i = j + 1; i < n; i++) { let t = A[i][j]; for (let k = 0; k < j; k++) t -= L[i][k] * L[j][k]; L[i][j] = t / L[j][j]; }
    }
    return L;
  }
  /** L⁻¹ M L⁻ᵀ con L triangular inferior. */
  function sandwich(L, M) {
    const n = L.length, adel = B => {   // L⁻¹ B (columna por columna)
      const X = B.map(f => f.slice());
      for (let c = 0; c < n; c++) for (let i = 0; i < n; i++) { let s = X[i][c]; for (let k = 0; k < i; k++) s -= L[i][k] * X[k][c]; X[i][c] = s / L[i][i]; }
      return X;
    };
    const A = adel(M), At = A[0].map((_, j) => A.map(f => f[j]));
    const B = adel(At);
    return B[0].map((_, j) => B.map(f => f[j])).map((f, i, X) => f.map((v, j) => (v + X[j][i]) / 2));
  }
  const productoCruz = (A, B) => A[0].map((_, i) => B[0].map((__, j) => A.reduce((s, f, k) => s + f[i] * B[k][j], 0)));

  /* ---------------- MANOVA ---------------- */
  /** Las cuatro pruebas de summary.manova para los valores propios eig, q gl del término y gl del error. */
  function pruebas(eig, q, glE) {
    const p = eig.length, s = min(p, q), m = 0.5 * (abs(p - q) - 1), n = 0.5 * (glE - p - 1);
    const sale = (est, F, g1, g2) => ({ estadistico: est, F, gl1: g1, gl2: g2, p: F >= 0 && g1 > 0 && g2 > 0 ? D().pf(F, g1, g2, false) : NaN });
    const pil = eig.reduce((a, v) => a + v / (1 + v), 0), t1 = 2 * m + s + 1, t2 = 2 * n + s + 1;
    const wil = eig.reduce((a, v) => a / (1 + v), 1), w1 = glE - 0.5 * (p - q + 1), w2 = (p * q - 2) / 4, w3r = p * p + q * q - 5, w3 = w3r > 0 ? sqrt(((p * q) ** 2 - 4) / w3r) : 1;
    const hl = eig.reduce((a, v) => a + v, 0), h2 = 2 * (s * n + 1);
    const roy = max(...eig), r1 = max(p, q), r2 = glE - r1 + q;
    return {
      pillai: sale(pil, (t2 / t1 * pil) / (s - pil), s * t1, s * t2),
      wilks: sale(wil, ((wil ** (-1 / w3) - 1) * (w1 * w3 - 2 * w2)) / p / q, p * q, w1 * w3 - 2 * w2),
      hotelling: sale(hl, (h2 * hl) / s / s / t1, s * t1, h2),
      roy: sale(roy, (r2 * roy) / r1, r1, r2),
    };
  }
  /**
   * MANOVA. Y: filas × p respuestas; X: filas × columnas del modelo (con el intercepto en la 0); asignacion[j] = índice
   * del término de la columna j (0 = intercepto); terminos: nombres de los términos 1..k.
   */
  function manova(Y, X, asignacion, terminos) {
    const n = Y.length, p = Y[0].length, c = X[0].length;
    /* base ortonormal (Gram-Schmidt modificado con reortogonalización) de las columnas en su orden */
    const Q = [], qTerm = [], escala = X[0].map((_, j) => sqrt(X.reduce((s, f) => s + f[j] * f[j], 0)) || 1);
    for (let j = 0; j < c; j++) {
      let v = X.map(f => f[j]);
      for (let pasada = 0; pasada < 2; pasada++) for (const q of Q) { const d = q.reduce((s, x, i) => s + x * v[i], 0); v = v.map((x, i) => x - d * q[i]); }
      const nv = sqrt(v.reduce((s, x) => s + x * x, 0));
      if (nv < 1e-7 * escala[j]) continue;   // depende de las anteriores (como el pivoteo de qr)
      Q.push(v.map(x => x / nv)); qTerm.push(asignacion[j]);
    }
    const rango = Q.length, glE = n - rango;
    exigir(glE > 0, T('No quedan grados de libertad para el error.'));
    const efectos = Q.map(q => Y[0].map((_, k) => q.reduce((s, x, i) => s + x * Y[i][k], 0)));
    const R = Y.map((f, i) => f.map((y, k) => y - Q.reduce((s, q, r) => s + q[i] * efectos[r][k], 0)));
    const E = productoCruz(R, R);
    const L = cholesky(E);
    const filas = terminos.map((nombre, t) => {
      const idx = qTerm.map((a, r) => (a === t + 1 ? r : -1)).filter(r => r >= 0), q = idx.length;
      const H = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (__, b) => idx.reduce((s, r) => s + efectos[r][a] * efectos[r][b], 0)));
      if (!q) return { termino: nombre, gl: 0, H, propios: [], pruebas: null };
      const eig = propios(sandwich(L, H)).valores;
      return { termino: nombre, gl: q, H, propios: eig, pruebas: pruebas(eig, q, glE) };
    });
    return { terminos: filas, E, glE, rango, n, p };
  }

  /* ---------------- discriminante lineal ---------------- */
  /** Vectores singulares derechos y valores singulares de X (filas × p) por los propios de X'X. */
  function svdDerecha(X) {
    const pr = propios(productoCruz(X, X));
    return { d: pr.valores.map(v => sqrt(max(v, 0))), V: pr.vectores };
  }
  /** lda (method = "moment"): x filas × p, g códigos 0..k−1, previas (por omisión, las proporciones). */
  function lda(x, g, k, op) {
    const n = x.length, p = x[0].length, tol = 1e-4;
    const cuenta = new Array(k).fill(0);
    for (const h of g) cuenta[h]++;
    exigir(cuenta.every(v => v >= 2), T('Cada grupo necesita al menos dos observaciones.'));
    const previa = op && op.previas ? op.previas : cuenta.map(v => v / n);
    const medias = Array.from({ length: k }, (_, h) => x[0].map((_, j) => x.reduce((s, f, i) => s + (g[i] === h ? f[j] : 0), 0) / cuenta[h]));
    const dentro = x.map((f, i) => f.map((v, j) => v - medias[g[i]][j]));
    const md = x[0].map((_, j) => dentro.reduce((s, f) => s + f[j], 0) / n);
    const f1 = x[0].map((_, j) => sqrt(dentro.reduce((s, f) => s + (f[j] - md[j]) ** 2, 0) / (n - 1)));
    f1.forEach((v, j) => exigir(v >= tol, T('La variable {j} es constante dentro de los grupos.', { j: j + 1 })));
    /* escalado 1: DE dentro → SVD de la matriz dentro → esfera */
    const X1 = dentro.map(f => f.map((v, j) => sqrt(1 / (n - k)) * v / f1[j]));
    const s1 = svdDerecha(X1), r1 = s1.d.filter(v => v > tol).length;
    exigir(r1 === p, T('Las variables son colineales: alguna es combinación de otras.'));
    const esc1 = x[0].map((_, j) => s1.V.slice(0, r1).map((vec, c) => vec[j] / f1[j] / s1.d[c]));   // p × r1
    const xbar = x[0].map((_, j) => medias.reduce((s, m, h) => s + previa[h] * m[j], 0));
    const X2 = medias.map((m, h) => esc1[0].map((_, c) => sqrt(n * previa[h] / (k - 1)) * m.reduce((s, v, j) => s + (v - xbar[j]) * esc1[j][c], 0)));
    const s2 = svdDerecha(X2), r2 = s2.d.filter(v => v > tol * s2.d[0]).length;
    exigir(r2 >= 1, T('Las medias de los grupos son iguales: no hay nada que discriminar.'));
    let escala = esc1.map(f => s2.V.slice(0, r2).map(vec => f.reduce((s, v, c) => s + v * vec[c], 0)));   // p × r2
    /* signo: el coeficiente de mayor valor absoluto de cada función, positivo */
    for (let c = 0; c < r2; c++) {
      let jm = 0; for (let j = 1; j < p; j++) if (abs(escala[j][c]) > abs(escala[jm][c])) jm = j;
      if (escala[jm][c] < 0) escala = escala.map(f => f.map((v, cc) => (cc === c ? -v : v)));
    }
    const sv = s2.d.slice(0, r2), traza = sv.map(v => v * v), tt = traza.reduce((a, b) => a + b, 0);
    const proyectar = f => escala[0].map((_, c) => f.reduce((s, v, j) => s + (v - xbar[j]) * escala[j][c], 0));
    const puntajes = x.map(proyectar), dm = medias.map(proyectar);
    const posterior = puntajes.map(z => {
      const dist = dm.map((m, h) => 0.5 * m.reduce((s, v) => s + v * v, 0) - log(previa[h]) - m.reduce((s, v, c) => s + v * z[c], 0));
      const mn = min(...dist), w = dist.map(d => exp(-(d - mn))), sw = w.reduce((a, b) => a + b, 0);
      return w.map(v => v / sw);
    });
    const clase = posterior.map(ps => ps.indexOf(max(...ps)));
    return { medias, previa, cuenta, escala, sv, proporcion: traza.map(v => v / tt), puntajes, medias_puntaje: dm, posterior, clase, xbar, esc1,
      cv: validacionCruzada(x, g, k, medias, esc1, previa, cuenta) };
  }
  /** lda(CV = TRUE): la fórmula exacta de dejar uno fuera de MASS. */
  function validacionCruzada(x0, g, k, medias, esc, previa, cuenta) {
    const n = x0.length, r = esc[0].length, K = k;
    const x = x0.map(f => esc[0].map((_, c) => f.reduce((s, v, j) => s + v * esc[j][c], 0)));
    const dm = medias.map(m => esc[0].map((_, c) => m.reduce((s, v, j) => s + v * esc[j][c], 0)));
    const d2 = x.map(z => dm.map(m => m.reduce((s, v, c) => s + (z[c] - v) ** 2, 0)));
    const dist = x.map((z, i) => {
      const gi = g[i], nc = cuenta[gi], cc = nc / ((nc - 1) * (n - K)), propio = d2[i][gi];
      return dm.map((m, h) => {
        if (h === gi) return propio * (n - 1 - K) / (n - K) * (nc / (nc - 1)) ** 2 / (1 - cc * propio);
        let tmp = 0; for (let c = 0; c < r; c++) tmp += (z[c] - m[c]) * (z[c] - dm[gi][c]);
        return (n - 1 - K) / (n - K) * (d2[i][h] + cc * tmp * tmp / (1 - cc * propio));
      }).map((d, h) => 0.5 * d - log(previa[h]));
    });
    let mn = Infinity; for (const f of dist) for (const v of f) if (v < mn) mn = v;
    const posterior = dist.map(f => { const w = f.map(v => exp(-(v - mn))), s = w.reduce((a, b) => a + b, 0); return w.map(v => v / s); });
    return { posterior, clase: posterior.map(ps => ps.indexOf(max(...ps))) };
  }

  /**
   * Prueba M de Box de igualdad de las matrices de covarianza (heplots::boxM, aproximación χ² de Box, 1949):
   * −2 log M = Σ(n_i − 1)·log|S_p| − Σ(n_i − 1)·log|S_i|, con S_p la combinada; χ² = −2 log M·(1 − c) con
   * c = (2p² + 3p − 1)/(6(p + 1)(g − 1))·(Σ 1/(n_i − 1) − 1/Σ(n_i − 1)) y p(p + 1)(g − 1)/2 gl. Los grupos con menos
   * observaciones que variables (n_i − 1 < p) quedan fuera de las sumas (pero no de S_p), como en heplots.
   */
  function boxM(Y, g, k) {
    const p = Y[0].length, logdet = A => { try { return cholesky(A).reduce((s, f, i) => s + 2 * log(f[i]), 0); } catch (e) { return -Infinity; } };
    const grupos = Array.from({ length: k }, () => []);
    Y.forEach((f, i) => grupos[g[i]].push(f));
    const dfs = grupos.map(G => G.length - 1), covs = grupos.map(G => {
      const m = G[0].map((_, j) => G.reduce((s, f) => s + f[j], 0) / G.length);
      return m.map((_, a) => m.map((__, b) => G.reduce((s, f) => s + (f[a] - m[a]) * (f[b] - m[b]), 0) / (G.length - 1)));
    });
    const sdf = dfs.reduce((a, b) => a + b, 0), pooled = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (__, b) => covs.reduce((s, S, h) => s + dfs[h] * S[a][b], 0) / sdf));
    const validos = dfs.map(d => d >= p), lds = covs.map((S, h) => (validos[h] ? logdet(S) : -Infinity)), ldp = logdet(pooled);
    const dv = dfs.filter((_, h) => validos[h]), gv = dv.length, sdv = dv.reduce((a, b) => a + b, 0);
    const menos2logM = gv ? sdv * ldp - lds.reduce((s, l, h) => s + (validos[h] ? l * dfs[h] : 0), 0) : NaN;
    const c = ((2 * p * p + 3 * p - 1) / (6 * (p + 1) * (gv - 1))) * (dv.reduce((s, d) => s + 1 / d, 0) - 1 / sdv);
    const chi2 = menos2logM * (1 - c), gl = (p * (p - 1) / 2 + p) * (gv - 1);
    return { chi2, gl, p: D().pchisq(chi2, gl, false), menos2logM, c, logdet: lds, logdet_combinada: ldp, excluidos: validos.filter(v => !v).length };
  }

  SP.multivariado = { propios, manova, pruebas, lda, boxM };
});
