/* SigmaPro — álgebra lineal para modelos lineales.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Matrices densas guardadas por columnas: el elemento (i, j) de una matriz n × p
   está en v[i + j·n]. Así una columna es un tramo contiguo de memoria.

   La pieza central es la descomposición QR de Householder con pivoteo limitado:
   las columnas se procesan en orden y una columna cuya parte no explicada por las
   anteriores mide menos que tol · (su norma original) se considera colineal y se
   pasa al final. Es el mismo criterio que usa R al ajustar modelos lineales
   (tol = 1e-7), así que los coeficientes que quedan sin estimar (alias) son los
   mismos y en el mismo orden. */
SP.definir('algebra', function (SP) {
  'use strict';
  const { sqrt, abs } = Math;

  /** Norma euclidiana de v[desde .. hasta) con escalado (sin desbordes). */
  function norma(v, desde, hasta) {
    let escala = 0, ssq = 1;
    for (let i = desde; i < hasta; i++) {
      const x = v[i];
      if (x !== 0) {
        const a = abs(x);
        if (escala < a) { ssq = 1 + ssq * (escala / a) * (escala / a); escala = a; }
        else ssq += (a / escala) * (a / escala);
      }
    }
    return escala * sqrt(ssq);
  }

  /**
   * Descomposición QR de Householder con pivoteo limitado.
   * @param {Float64Array} X  n × p por columnas (no se modifica)
   * @returns {{ qr, beta, rango, pivote, n, p }}
   *   qr: copia transformada (R arriba de la diagonal; vectores de Householder abajo y en la diagonal)
   *   beta: escalares de cada reflexión H = I − beta·v·vᵀ
   *   pivote[j]: columna original que quedó en la posición j
   */
  function qr(X, n, p, tol) {
    tol = tol === undefined ? 1e-7 : tol;
    const A = Float64Array.from(X);
    const pivote = new Int32Array(p);
    const original = new Float64Array(p);
    for (let j = 0; j < p; j++) {
      pivote[j] = j;
      original[j] = norma(A, j * n, j * n + n);
      if (original[j] === 0) original[j] = 1;
    }
    const beta = new Float64Array(p);
    const diagR = new Float64Array(p);
    let k = p;                      // columnas candidatas que quedan (las colineales se mandan al final)
    const lmax = Math.min(n, p);
    let rango = 0;
    const tmp = new Float64Array(n);
    for (let l = 0; l < lmax && l < k; l++) {
      /* buscar la siguiente columna no colineal */
      while (l < k && norma(A, l * n + l, l * n + n) < tol * original[l]) {
        /* rotar la columna l al final */
        tmp.set(A.subarray(l * n, l * n + n));
        A.copyWithin(l * n, (l + 1) * n, p * n);
        A.set(tmp, (p - 1) * n);
        const pv = pivote[l], on = original[l];
        for (let j = l; j < p - 1; j++) { pivote[j] = pivote[j + 1]; original[j] = original[j + 1]; }
        pivote[p - 1] = pv; original[p - 1] = on;
        k--;
      }
      if (l >= k) break;
      /* reflexión de Householder que anula A[l+1.., l] */
      const c = l * n;
      const alfa = norma(A, c + l, c + n);
      const xl = A[c + l];
      const r = xl >= 0 ? -alfa : alfa;   // nuevo valor de la diagonal de R
      A[c + l] = xl - r;                  // v = x − r·e1, guardado en la columna misma
      /* ‖v‖² = 2·alfa·(alfa + |x_l|), sin cancelación; H = I − beta·v·vᵀ */
      beta[l] = 1 / (alfa * (alfa + abs(xl)));
      for (let j = l + 1; j < p; j++) {
        const cj = j * n;
        let s = 0;
        for (let i = l; i < n; i++) s += A[c + i] * A[cj + i];
        s *= beta[l];
        if (s !== 0) for (let i = l; i < n; i++) A[cj + i] -= s * A[c + i];
      }
      diagR[l] = r;
      rango++;
    }
    return { qr: A, beta, diagR, rango, pivote, n, p };
  }

  /** Aplica Qᵀ (las reflexiones en orden) a una copia de y: los «efectos». */
  function qty(d, y) {
    const { qr: A, beta, rango, n } = d;
    const e = Float64Array.from(y);
    for (let l = 0; l < rango; l++) {
      const c = l * n;
      let s = 0;
      for (let i = l; i < n; i++) s += A[c + i] * e[i];
      s *= beta[l];
      if (s !== 0) for (let i = l; i < n; i++) e[i] -= s * A[c + i];
    }
    return e;
  }

  /** Aplica Q (las reflexiones en orden inverso) a una copia de z. */
  function qz(d, z) {
    const { qr: A, beta, rango, n } = d;
    const e = Float64Array.from(z);
    for (let l = rango - 1; l >= 0; l--) {
      const c = l * n;
      let s = 0;
      for (let i = l; i < n; i++) s += A[c + i] * e[i];
      s *= beta[l];
      if (s !== 0) for (let i = l; i < n; i++) e[i] -= s * A[c + i];
    }
    return e;
  }

  /** Elemento (i, j) de R (i ≤ j < p, en orden pivoteado). */
  const elemR = (d, i, j) => (i === j ? d.diagR[i] : d.qr[i + j * d.n]);

  /** Resuelve R_k b = c (triangular superior de rango k). */
  function resolverR(d, c) {
    const k = d.rango, b = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = c[i];
      for (let j = i + 1; j < k; j++) s -= elemR(d, i, j) * b[j];
      b[i] = s / d.diagR[i];
    }
    return b;
  }

  /**
   * (R_kᵀ R_k)⁻¹: la matriz de covarianzas sin escalar de los coeficientes estimables,
   * en orden pivoteado (k × k, por columnas).
   */
  function rtrInversa(d) {
    const k = d.rango;
    /* Rinv triangular superior */
    const Ri = new Float64Array(k * k);
    for (let j = 0; j < k; j++) {
      Ri[j + j * k] = 1 / d.diagR[j];
      for (let i = j - 1; i >= 0; i--) {
        let s = 0;
        for (let m = i + 1; m <= j; m++) s += elemR(d, i, m) * Ri[m + j * k];
        Ri[i + j * k] = -s / d.diagR[i];
      }
    }
    /* Rinv · Rinvᵀ */
    const V = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = i; j < k; j++) {
        let s = 0;
        for (let m = j; m < k; m++) s += Ri[i + m * k] * Ri[j + m * k];
        V[i + j * k] = s; V[j + i * k] = s;
      }
    }
    return V;
  }

  /**
   * Mínimos cuadrados completos: coeficientes en el orden ORIGINAL de las columnas
   * (NaN en las colineales), efectos, ajustados, residuales y suma de cuadrados residual.
   */
  function minimosCuadrados(X, n, p, y, tol) {
    const d = qr(X, n, p, tol);
    const efectos = qty(d, y);
    const b = resolverR(d, efectos);
    const coef = new Float64Array(p).fill(NaN);
    for (let j = 0; j < d.rango; j++) coef[d.pivote[j]] = b[j];
    /* residuales = Q (0, …, 0, efectos[k..n)) — como lo hace R */
    const z = new Float64Array(n);
    for (let i = d.rango; i < n; i++) z[i] = efectos[i];
    const residuales = qz(d, z);
    const ajustados = new Float64Array(n);
    for (let i = 0; i < n; i++) ajustados[i] = y[i] - residuales[i];
    let sc = 0;
    for (let i = 0; i < n; i++) sc += residuales[i] * residuales[i];
    return { qr: d, efectos, coeficientes: coef, residuales, ajustados, scResidual: sc };
  }

  /**
   * Matriz «comprimida» de un ajuste: C = Q_kᵀ X (k × p, orden original) y c = Q_kᵀ y.
   * Como X = Q_k C, cualquier submodelo con un subconjunto S de columnas tiene
   * SC_residual(S) = SC_residual(completo) + SC_residual de regresar c sobre C[:, S],
   * que cuesta O(p³) en lugar de O(n p²). Lo usan las sumas de cuadrados de tipo II y III.
   */
  function comprimir(d, efectos) {
    const { rango: k, p, n, qr: A } = d;
    const C = new Float64Array(k * p);
    for (let jp = 0; jp < p; jp++) {
      const jo = d.pivote[jp];
      /* columna estimable: su columna de R (ceros bajo la diagonal); colineal: Q_kᵀx completa */
      for (let i = 0; i < k; i++) C[i + jo * k] = i < jp ? A[i + jp * n] : (i === jp ? d.diagR[i] : 0);
    }
    const c = efectos.slice(0, k);
    return { C, c, k, p };
  }

  /** SC residual y rango de regresar c sobre las columnas S de C (en el espacio comprimido). */
  function scResidualSub(comp, S, tol) {
    const { C, c, k } = comp;
    const m = S.length;
    if (!m) { let s = 0; for (let i = 0; i < k; i++) s += c[i] * c[i]; return { sc: s, rango: 0 }; }
    const Xs = new Float64Array(k * m);
    for (let j = 0; j < m; j++) Xs.set(C.subarray(S[j] * k, S[j] * k + k), j * k);
    const d = qr(Xs, k, m, tol);
    const e = qty(d, c);
    let s = 0;
    for (let i = d.rango; i < k; i++) s += e[i] * e[i];
    return { sc: s, rango: d.rango };
  }

  /** Factorización de Cholesky A = LLᵀ de una matriz simétrica definida positiva (p × p). */
  function cholesky(A, p) {
    const L = new Float64Array(p * p);
    for (let j = 0; j < p; j++) {
      let s = A[j + j * p];
      for (let m = 0; m < j; m++) s -= L[j + m * p] * L[j + m * p];
      if (!(s > 0)) throw new SP.ErrorSP(SP.T('La matriz no es definida positiva.'));
      const ljj = sqrt(s);
      L[j + j * p] = ljj;
      for (let i = j + 1; i < p; i++) {
        let t = A[i + j * p];
        for (let m = 0; m < j; m++) t -= L[i + m * p] * L[j + m * p];
        L[i + j * p] = t / ljj;
      }
    }
    return L;
  }

  /**
   * Agrupa las filas idénticas de X (n × p, por columnas): en un diseño solo con factores hay una por celda.
   * Clave: dos combinaciones lineales «al azar»; luego se comprueba fila por fila que el grupo sea idéntico.
   * Devuelve { g, rep, cuenta, G } o null si hay más de tope·n grupos distintos.
   */
  function agruparFilas(X, n, p, tope) {
    tope = tope === undefined ? 0.5 : tope;
    const r1 = new Float64Array(p), r2 = new Float64Array(p);
    for (let j = 0; j < p; j++) { r1[j] = Math.sin(j + 1) * 1e3; r2[j] = Math.cos(3 * j + 2) * 1e3; }
    const g = new Int32Array(n), mapa = new Map(), rep = [];
    for (let i = 0; i < n; i++) {
      let a = 0, b = 0;
      for (let j = 0; j < p; j++) { const v = X[j * n + i]; a += v * r1[j]; b += v * r2[j]; }
      const k = a + '|' + b;
      let q = mapa.get(k);
      if (q === undefined) { q = rep.length; mapa.set(k, q); rep.push(i); if (rep.length > tope * n) return null; }
      g[i] = q;
    }
    for (let i = 0; i < n; i++) { const r = rep[g[i]]; for (let j = 0; j < p; j++) if (X[j * n + i] !== X[j * n + r]) return null; }
    const cuenta = new Float64Array(rep.length);
    for (let i = 0; i < n; i++) cuenta[g[i]]++;
    return { g, rep: Int32Array.from(rep), cuenta, G: rep.length };
  }

  /**
   * Mínimos cuadrados con las filas agrupadas: la QR de √nᵍ·xᵍ (G × p) en vez de la de X (n × p). Los
   * coeficientes resuelven las mismas ecuaciones normales (XᵀX = Σ nᵍ xᵍxᵍᵀ, Xᵀy = Σ nᵍ xᵍ ȳᵍ); R es la de X
   * salvo el signo de sus filas, así que palancas y (XᵀX)⁻¹ salen iguales. Los residuos se calculan fila por
   * fila. Para tablas grandes con pocas celdas: O(n·p + G·p²) en vez de O(n·p²).
   */
  function minimosCuadradosAgrupados(X, n, p, y, gr, tol) {
    const { g, rep, cuenta, G } = gr;
    const Xg = new Float64Array(G * p), media = new Float64Array(G);
    for (let i = 0; i < n; i++) media[g[i]] += y[i];
    for (let q = 0; q < G; q++) media[q] /= cuenta[q];
    /* segunda pasada de la media por grupo (como la media en dos pasadas) */
    const corr = new Float64Array(G);
    for (let i = 0; i < n; i++) corr[g[i]] += y[i] - media[g[i]];
    for (let q = 0; q < G; q++) media[q] += corr[q] / cuenta[q];
    for (let q = 0; q < G; q++) { const w = Math.sqrt(cuenta[q]); for (let j = 0; j < p; j++) Xg[j * G + q] = w * X[j * n + rep[q]]; }
    const d = qr(Xg, G, p, tol);
    const u = Float64Array.from(media, (m, q) => Math.sqrt(cuenta[q]) * m);
    const b = resolverR(d, qty(d, u));
    const coef = new Float64Array(p).fill(NaN);
    for (let j = 0; j < d.rango; j++) coef[d.pivote[j]] = b[j];
    const ajg = new Float64Array(G);
    for (let q = 0; q < G; q++) { let s = 0; for (let j = 0; j < d.rango; j++) s += X[d.pivote[j] * n + rep[q]] * b[j]; ajg[q] = s; }
    const ajustados = new Float64Array(n), residuales = new Float64Array(n);
    let sc = 0;
    for (let i = 0; i < n; i++) { ajustados[i] = ajg[g[i]]; residuales[i] = y[i] - ajg[g[i]]; sc += residuales[i] * residuales[i]; }
    return { qr: d, efectos: qty(d, u), coeficientes: coef, residuales, ajustados, scResidual: sc, agrupado: true, grupos: gr };
  }

  SP.algebra = { norma, qr, qty, qz, resolverR, rtrInversa, minimosCuadrados, comprimir, scResidualSub, cholesky, elemR, agruparFilas, minimosCuadradosAgrupados };
});
