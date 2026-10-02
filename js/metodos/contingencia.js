/* SigmaPro — tablas de contingencia: independencia, Fisher exacta, medidas de asociación, McNemar, Cochran-Mantel-
   Haenszel y concordancia (kappa).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     ji cuadrada      Pearson (con la corrección de Yates en 2 × 2, como chisq.test), razón de verosimilitudes G²,
                      esperados, residuos de Pearson y ajustados (estandarizados)
     Fisher exacta    2 × 2 como fisher.test (p bilateral con tolerancia relativa 1e-7, razón de momios condicional de
                      máxima verosimilitud y su intervalo exacto con uniroot); r × c sumando las tablas con los mismos
                      márgenes y probabilidad ≤ la observada (enumeración con tope)
     asociación       φ, V de Cramér, coeficiente de contingencia, λ de Goodman y Kruskal, coeficiente de incertidumbre;
                      para categorías ordenadas γ, τ-b, τ-c y d de Somers con sus errores estándar asintóticos (Agresti,
                      2002; Brown y Benedetti, 1977); en 2 × 2, razón de momios y riesgo relativo con IC de Woolf y Katz
     McNemar          2 × 2 con corrección por continuidad y binomial exacta; k × k es la prueba de simetría de Bowker
     CMH              Cochran-Mantel-Haenszel como mantelhaen.test; en 2 × 2 × K la razón de momios común de Mantel-
                      Haenszel con el IC de Robins, Breslow y Greenland y la homogeneidad de Breslow-Day (con Tarone)
     kappa            Cohen simple y ponderada (lineal o cuadrática) con la varianza de Fleiss, Cohen y Everitt (1969) */
SP.definir('contingencia', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, log, exp, max, min } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  Object.assign(SP.nombresFunciones, {
    'cont.independenciaDe': 'Tabla de contingencia: ji cuadrada, G², residuos y Fisher exacta',
    'cont.medidasDe': 'Medidas de asociación (φ, V, C, λ, U, γ, τ-b, τ-c, d de Somers, razón de momios, riesgo relativo)',
    'cont.mcnemarDe': 'McNemar y simetría de Bowker',
    'cont.cmhDe': 'Cochran-Mantel-Haenszel, razón de momios común y Breslow-Day',
    'cont.kappaDe': 'Kappa de Cohen simple y ponderada',
  });

  /* ---------------- tablas ---------------- */
  /**
   * Tabla cruzada de dos factores (o de tres, con estrato), con una columna de frecuencias opcional. Se quitan las
   * filas y columnas vacías (como factor() en chisq.test).
   */
  function cruzar(tabla, e, nombres) {
    const fs = nombres.map(c => SP.estructura.comoFactor(tabla, c)), w = e.frecuencia ? tabla.col(e.frecuencia).valores : null;
    const dims = fs.map(f => f.niveles.length), cuenta = new Float64Array(dims.reduce((a, b) => a * b, 1));
    let omitidas = 0, noEnteros = false;
    for (let i = 0; i < tabla.n; i++) {
      let k = 0, ok = true;
      for (let d = fs.length - 1; d >= 0; d--) { const c = fs[d].codigos[i]; if (c < 0) { ok = false; break; } k = k * dims[d] + c; }
      const v = w ? w[i] : 1;
      if (!ok || !(v >= 0)) { omitidas++; continue; }
      if (v !== Math.round(v)) noEnteros = true;
      cuenta[k] += v;
    }
    /* niveles con datos */
    const usados = fs.map((f, d) => f.niveles.map((_, j) => j).filter(j => {
      let s = 0;
      const paso = dims.slice(0, d).reduce((a, b) => a * b, 1), bloque = paso * dims[d];
      for (let base = 0; base < cuenta.length; base += bloque) for (let o = 0; o < paso; o++) s += cuenta[base + j * paso + o];
      return s > 0;
    }));
    const idx = (cs) => { let k = 0; for (let d = cs.length - 1; d >= 0; d--) k = k * dims[d] + cs[d]; return k; };
    const niveles = usados.map((u, d) => u.map(j => fs[d].niveles[j]));
    let x;
    if (nombres.length === 2) x = usados[0].map(i => usados[1].map(j => cuenta[idx([i, j])]));
    else x = usados[2].map(s => usados[0].map(i => usados[1].map(j => cuenta[idx([i, j, s])])));
    return { x, niveles, omitidas, noEnteros };
  }
  const sumaFilas = x => x.map(f => f.reduce((a, b) => a + b, 0));
  const sumaCols = x => x[0].map((_, j) => x.reduce((a, f) => a + f[j], 0));

  /* ---------------- independencia ---------------- */
  function chiCuadrada(x, correccion) {
    const R = x.length, C = x[0].length, sr = sumaFilas(x), sc = sumaCols(x), n = sr.reduce((a, b) => a + b, 0);
    const E = sr.map(r => sc.map(c => r * c / n));
    let yates = 0;
    if (correccion && R === 2 && C === 2) { yates = 0.5; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) yates = min(yates, abs(x[i][j] - E[i][j])); }
    let X2 = 0, G2 = 0, X2sin = 0;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const d = abs(x[i][j] - E[i][j]);
      X2 += (d - yates) ** 2 / E[i][j]; X2sin += d * d / E[i][j];
      if (x[i][j] > 0) G2 += 2 * x[i][j] * log(x[i][j] / E[i][j]);
    }
    const gl = (R - 1) * (C - 1);
    const pearson = x.map((f, i) => f.map((v, j) => (v - E[i][j]) / sqrt(E[i][j])));
    const ajustados = x.map((f, i) => f.map((v, j) => (v - E[i][j]) / sqrt(sc[j] * sr[i] * (n - sr[i]) * (n - sc[j]) / (n * n * n))));
    let menores5 = 0, minE = Infinity;
    for (const f of E) for (const v of f) { if (v < 5) menores5++; minE = min(minE, v); }
    return { n, gl, esperados: E, X2, p: D().pchisq(X2, gl, false), yates, X2_sin: X2sin, G2, p_G2: D().pchisq(G2, gl, false),
      residuos: pearson, ajustados, menores5, celdas: R * C, minimo: minE, filas: sr, columnas: sc };
  }

  /* ---------------- Fisher exacta ---------------- */
  /** 2 × 2 como fisher.test: p, razón de momios condicional de máxima verosimilitud y su IC exacto. */
  function fisher2x2(x, alternativa, nivel) {
    alternativa = alternativa || 'bilateral'; nivel = nivel || 0.95;
    const m = x[0][0] + x[1][0], n = x[0][1] + x[1][1], k = x[0][0] + x[0][1], a = x[0][0];
    const lo = max(0, k - n), hi = min(k, m), sop = [];
    for (let s = lo; s <= hi; s++) sop.push(s);
    const logdc = sop.map(s => D().ldhyper(s, m, n, k));
    const dnhyper = ncp => { const d = logdc.map((v, i) => v + log(ncp) * sop[i]), mx = max(...d), e = d.map(v => exp(v - mx)), s = e.reduce((u, v) => u + v, 0); return e.map(v => v / s); };
    const mnhyper = ncp => (ncp === 0 ? lo : ncp === Infinity ? hi : dnhyper(ncp).reduce((s, d, i) => s + sop[i] * d, 0));
    const phyper = (xx, superior) => { let s = 0; for (let i = 0; i < sop.length; i++) if (superior ? sop[i] > xx : sop[i] <= xx) s += exp(logdc[i]); return s; };
    const pnhyper = (qq, ncp, superior) => {
      if (ncp === 1) return superior ? phyper(a - 1, true) : phyper(a, false);
      if (ncp === 0) return (superior ? qq <= lo : qq >= lo) ? 1 : 0;
      if (ncp === Infinity) return (superior ? qq <= hi : qq >= hi) ? 1 : 0;
      const d = dnhyper(ncp);
      let s = 0; for (let i = 0; i < sop.length; i++) if (superior ? sop[i] >= qq : sop[i] <= qq) s += d[i];
      return s;
    };
    const raiz = (f, ax, bx) => SP.num.raizR(f, ax, bx);
    const EPS = 2.220446049250313e-16;
    let p;
    if (alternativa === 'menor') p = pnhyper(a, 1, false);
    else if (alternativa === 'mayor') p = pnhyper(a, 1, true);
    else { const d = dnhyper(1), dx = d[a - lo] * (1 + 1e-7); p = d.reduce((s, v) => (v <= dx ? s + v : s), 0); }
    const mle = () => {
      if (a === lo) return 0;
      if (a === hi) return Infinity;
      const mu = mnhyper(1);
      if (mu > a) return raiz(t => mnhyper(t) - a, 0, 1);
      if (mu < a) return 1 / raiz(t => mnhyper(1 / t) - a, EPS, 1);
      return 1;
    };
    const ncpU = alfa => {
      if (a === hi) return Infinity;
      const pp = pnhyper(a, 1, false);
      if (pp < alfa) return raiz(t => pnhyper(a, t, false) - alfa, 0, 1);
      if (pp > alfa) return 1 / raiz(t => pnhyper(a, 1 / t, false) - alfa, EPS, 1);
      return 1;
    };
    const ncpL = alfa => {
      if (a === lo) return 0;
      const pp = pnhyper(a, 1, true);
      if (pp > alfa) return raiz(t => pnhyper(a, t, true) - alfa, 0, 1);
      if (pp < alfa) return 1 / raiz(t => pnhyper(a, 1 / t, true) - alfa, EPS, 1);
      return 1;
    };
    const ic = alternativa === 'menor' ? [0, ncpU(1 - nivel)] : alternativa === 'mayor' ? [ncpL(1 - nivel), Infinity] : [ncpL((1 - nivel) / 2), ncpU((1 - nivel) / 2)];
    return { p, razon_momios: mle(), ic };
  }
  /**
   * r × c: suma de las probabilidades de las tablas con los mismos márgenes y P ≤ P(observada)·(1 + 1e-7), como el p
   * de fisher.test. Recorrido por columnas al estilo del algoritmo de red (Mehta y Patel, 1983): un nodo es lo que le
   * falta a cada fila (ordenado: las filas son intercambiables para lo que resta), y las ramas que llegan a un mismo
   * nodo se juntan con su probabilidad acumulada. En cada nodo, unas cotas de lo que falta (cada columna por separado:
   * lo más repartida y lo más concentrada) deciden si todas sus tablas quedan por debajo del corte —y se suman de
   * golpe con Σ Π 1/nᵢⱼ! = N′!/(Π rᵢ′! Π cⱼ′!)— o todas por encima. Devuelve null si pasa de limiteMs.
   */
  function fisherRxC(x, limiteMs) {
    limiteMs = limiteMs || 4000;
    const reloj = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now(), t0 = reloj();
    const R = x.length, C = x[0].length, sr = sumaFilas(x), n = sr.reduce((a, b) => a + b, 0);
    const sc = sumaCols(x).sort((a, b) => b - a);
    const lf = new Float64Array(n + 1);
    for (let i = 2; i <= n; i++) lf[i] = lf[i - 1] + log(i);
    const constante = sr.reduce((s, v) => s + lf[v], 0) + sc.reduce((s, v) => s + lf[v], 0) - lf[n];
    let obs = constante;
    for (const f of x) for (const v of f) obs -= lf[v];
    const corte = obs + log(1 + 1e-7);
    let suma = 0, pasos = 0, parar = false;
    const tarde = () => { if ((++pasos & 4095) === 0 && reloj() - t0 > limiteMs) parar = true; return parar; };
    /* cotas de Σ log n! de las columnas j.. con los topes caps (ascendentes) */
    function cotas(caps, j) {
      let mn = 0, mx = 0;
      for (let c = j; c < C; c++) {
        const t = sc[c];
        let quedan = t;
        for (let k = 0; k < R; k++) {
          const filas = R - k, parte = Math.floor(quedan / filas);
          if (caps[k] <= parte) { mn += lf[caps[k]]; quedan -= caps[k]; continue; }
          const extra = quedan - parte * filas;
          mn += extra * lf[parte + 1] + (filas - extra) * lf[parte];
          break;
        }
        quedan = t;
        for (let k = R - 1; k >= 0 && quedan > 0; k--) { const v = min(caps[k], quedan); mx += lf[v]; quedan -= v; }
      }
      return [mn, mx];
    }
    /* nivel j: nodo (clave de los restos ordenados) → { resto, pasados: Map(log P acumulada → multiplicidad) } */
    let nivel = new Map([[sr.slice().sort((a, b) => a - b).join(','), { resto: sr.slice().sort((a, b) => a - b), pasados: new Map([[0, 1]]) }]]);
    for (let j = 0; j < C; j++) {
      const siguiente = new Map();
      for (const nodo of nivel.values()) {
        if (tarde()) return null;
        const resto = nodo.resto;
        if (j === C - 1) {
          let fut = 0;
          for (let i = 0; i < R; i++) fut -= lf[resto[i]];
          for (const [pas, m] of nodo.pasados) { const l = constante + pas + fut; if (l <= corte) suma += m * exp(l); }
          continue;
        }
        if (j === C - 2) {
          /* las dos últimas columnas: todas las terminaciones del nodo, ordenadas, con sus sumas acumuladas de exp */
          const fut = new Map(), v = new Array(R);
          const llena = (i, quedan, delta) => {
            if (parar) return;
            if (i < 0) {
              if (quedan || tarde()) return;
              let d = delta;
              for (let k = 0; k < R; k++) d -= lf[resto[k] - v[k]];
              const kk = Math.round(d * 1e11) / 1e11;
              fut.set(kk, (fut.get(kk) || 0) + 1);
              return;
            }
            let antes = 0;
            for (let k = 0; k < i; k++) antes += resto[k];
            for (let a = max(0, quedan - antes); a <= min(resto[i], quedan); a++) { v[i] = a; llena(i - 1, quedan - a, delta - lf[a]); }
          };
          llena(R - 1, sc[j], 0);
          if (parar) return null;
          const vals = [...fut.keys()].sort((a, b) => a - b), acum = new Float64Array(vals.length);
          const ref = vals[vals.length - 1];
          let s2 = 0;
          vals.forEach((u, k) => { s2 += fut.get(u) * exp(u - ref); acum[k] = s2; });
          for (const [pas, m] of nodo.pasados) {
            const tope = corte - constante - pas;
            let lo = 0, hi = vals.length;                     // primera terminación por encima del tope
            while (lo < hi) { const md = (lo + hi) >> 1; if (vals[md] <= tope) lo = md + 1; else hi = md; }
            if (lo) suma += m * exp(constante + pas + ref) * acum[lo - 1];
          }
          continue;
        }
        const [mn, mx] = cotas(resto, j);
        let quedanN = 0;
        for (let c = j; c < C; c++) quedanN += sc[c];
        let todo = lf[quedanN];
        for (let i = 0; i < R; i++) todo -= lf[resto[i]];
        for (let c = j; c < C; c++) todo -= lf[sc[c]];
        const vivos = [];
        for (const [pas, m] of nodo.pasados) {
          if (constante + pas - mx > corte) continue;                                   // todas por encima
          if (constante + pas - mn <= corte) { suma += m * exp(constante + pas + todo); continue; }   // todas debajo
          vivos.push([pas, m]);
        }
        if (!vivos.length) continue;
        /* reparte la columna j entre las filas (de la última a la primera, con lo que cabe) */
        const v = new Array(R);
        const reparte = (i, quedan, delta) => {
          if (parar) return;
          if (i < 0) {
            if (quedan || tarde()) return;
            const nuevo = resto.map((r, k) => r - v[k]).sort((a, b) => a - b), clave = nuevo.join(',');
            let dest = siguiente.get(clave);
            if (!dest) { dest = { resto: nuevo, pasados: new Map() }; siguiente.set(clave, dest); }
            for (const [pas, m] of vivos) {
              const p2 = pas + delta, k2 = Math.round(p2 * 1e11) / 1e11;    // ramas con la misma probabilidad se juntan
              dest.pasados.set(k2, (dest.pasados.get(k2) || 0) + m);
            }
            return;
          }
          let antes = 0;
          for (let k = 0; k < i; k++) antes += resto[k];
          for (let a = max(0, quedan - antes); a <= min(resto[i], quedan); a++) { v[i] = a; reparte(i - 1, quedan - a, delta - lf[a]); }
        };
        reparte(R - 1, sc[j], 0);
        if (parar) return null;
      }
      nivel = siguiente;
    }
    return { p: min(1, suma), nodos: pasos };
  }

  /* ---------------- medidas de asociación ---------------- */
  function medidas(x, nivel) {
    nivel = nivel || 0.95;
    const R = x.length, C = x[0].length, sr = sumaFilas(x), sc = sumaCols(x), n = sr.reduce((a, b) => a + b, 0);
    const ch = chiCuadrada(x, false), X2 = ch.X2_sin, mm = min(R, C);
    const out = {
      phi: R === 2 && C === 2 ? (x[0][0] * x[1][1] - x[0][1] * x[1][0]) / sqrt(sr[0] * sr[1] * sc[0] * sc[1]) : sqrt(X2 / n),
      v_cramer: sqrt(X2 / (n * (mm - 1))), contingencia: sqrt(X2 / (X2 + n)),
    };
    /* λ de Goodman y Kruskal */
    const maxFila = x.map(f => max(...f)), maxCol = sc.map((_, j) => max(...x.map(f => f[j]))), Mc = max(...sc), Mr = max(...sr);
    const sMf = maxFila.reduce((a, b) => a + b, 0), sMc = maxCol.reduce((a, b) => a + b, 0);
    out.lambda_c_r = (sMf - Mc) / (n - Mc);
    out.lambda_r_c = (sMc - Mr) / (n - Mr);
    out.lambda_simetrica = (sMf + sMc - Mc - Mr) / (2 * n - Mc - Mr);
    /* coeficiente de incertidumbre (Theil) */
    const H = v => -v.reduce((s, c) => (c > 0 ? s + (c / n) * log(c / n) : s), 0);
    const Hr = H(sr), Hc = H(sc), Hrc = H(x.flat()), I = Hr + Hc - Hrc;
    out.incertidumbre_c_r = I / Hc; out.incertidumbre_r_c = I / Hr; out.incertidumbre_simetrica = 2 * I / (Hr + Hc);
    /* ordinales: A (concordantes) y D (discordantes) de cada celda */
    const A = x.map(() => new Float64Array(C)), Dd = x.map(() => new Float64Array(C));
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      let a = 0, d = 0;
      for (let k = 0; k < R; k++) for (let l = 0; l < C; l++) {
        if ((k > i && l > j) || (k < i && l < j)) a += x[k][l];
        else if ((k > i && l < j) || (k < i && l > j)) d += x[k][l];
      }
      A[i][j] = a; Dd[i][j] = d;
    }
    let P = 0, Q = 0;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { P += x[i][j] * A[i][j]; Q += x[i][j] * Dd[i][j]; }
    const suma = f => { let s = 0; for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) s += x[i][j] * f(i, j); return s; };
    const dd = (i, j) => A[i][j] - Dd[i][j];
    const sd2 = suma((i, j) => dd(i, j) ** 2) - (P - Q) ** 2 / n;
    const wr = n * n - sr.reduce((s, v) => s + v * v, 0), wc = n * n - sc.reduce((s, v) => s + v * v, 0), w = sqrt(wr * wc);
    const z = D().qnorm((1 + nivel) / 2);
    const med = (est, ase1, ase0) => ({ estimado: est, ee: ase1, ee0: ase0, z: est / ase0, p: 2 * D().pnorm(-abs(est / ase0)), ic: [est - z * ase1, est + z * ase1] });
    const g = (P - Q) / (P + Q);
    out.gamma = med(g, 4 / (P + Q) ** 2 * sqrt(suma((i, j) => (Q * A[i][j] - P * Dd[i][j]) ** 2)), 2 / (P + Q) * sqrt(sd2));
    const tb = (P - Q) / w;
    out.tau_b = med(tb, sqrt(suma((i, j) => (2 * w * dd(i, j) + tb * (sr[i] * wc + sc[j] * wr)) ** 2) - n ** 3 * tb * tb * (wr + wc) ** 2) / (w * w), 2 / w * sqrt(sd2));
    const tc = mm * (P - Q) / (n * n * (mm - 1)), atc = 2 * mm / ((mm - 1) * n * n) * sqrt(sd2);
    out.tau_c = med(tc, atc, atc);
    out.somers_c_r = med((P - Q) / wr, 2 / (wr * wr) * sqrt(suma((i, j) => (wr * dd(i, j) - (P - Q) * (n - sr[i])) ** 2)), 2 / wr * sqrt(sd2));
    out.somers_r_c = med((P - Q) / wc, 2 / (wc * wc) * sqrt(suma((i, j) => (wc * dd(i, j) - (P - Q) * (n - sc[j])) ** 2)), 2 / wc * sqrt(sd2));
    /* 2 × 2: razón de momios (Woolf) y riesgo relativo (Katz) de la primera columna, fila 1 contra fila 2 */
    if (R === 2 && C === 2) {
      const cero = x.flat().some(v => v === 0), [a, b] = x[0].map(v => v + (cero ? 0.5 : 0)), [c, d] = x[1].map(v => v + (cero ? 0.5 : 0));
      const or = a * d / (b * c), seor = sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      const rr = (a / (a + b)) / (c / (c + d)), serr = sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d));
      out.razon_momios = { estimado: or, ic: [or * exp(-z * seor), or * exp(z * seor)], corregida: cero };
      out.riesgo_relativo = { estimado: rr, ic: [rr * exp(-z * serr), rr * exp(z * serr)], corregida: cero };
    }
    return out;
  }

  /* ---------------- McNemar ---------------- */
  function mcnemar(x, correccion) {
    const k = x.length;
    let X2 = 0, gl = 0, vacios = 0;
    const corr = correccion && k === 2 && x[0][1] !== x[1][0];
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
      const s = x[i][j] + x[j][i];
      if (s === 0) { vacios++; continue; }
      const d = corr ? abs(x[i][j] - x[j][i]) - 1 : x[i][j] - x[j][i];
      X2 += d * d / s; gl++;
    }
    const out = { X2, gl, p: gl ? D().pchisq(X2, gl, false) : NaN, correccion: corr, vacios };
    if (k === 2) {
      const b = x[0][1], c = x[1][0], m = b + c;
      out.discordantes = [b, c];
      out.p_exacta = m === 0 || b === c ? 1 : min(1, 2 * D().pbinom(min(b, c), m, 0.5, true));
    }
    return out;
  }

  /* ---------------- Cochran-Mantel-Haenszel ---------------- */
  function cmh(xs, correccion, nivel) {
    nivel = nivel || 0.95;
    const K = xs.length, I = xs[0].length, J = xs[0][0].length;
    for (const x of xs) exigir(x.flat().reduce((a, b) => a + b, 0) >= 2, T('Cada estrato necesita al menos 2 observaciones.'));
    if (I === 2 && J === 2) {
      let delta = 0, vsum = 0, sd = 0, so = 0;
      for (const x of xs) {
        const n = x[0][0] + x[0][1] + x[1][0] + x[1][1], r1 = x[0][0] + x[0][1], r2 = x[1][0] + x[1][1], c1 = x[0][0] + x[1][0], c2 = x[0][1] + x[1][1];
        delta += x[0][0] - r1 * c1 / n;
        vsum += r1 * r2 * c1 * c2 / (n * n * (n - 1));
        sd += x[0][0] * x[1][1] / n; so += x[0][1] * x[1][0] / n;
      }
      const yates = correccion && abs(delta) >= 0.5 ? 0.5 : 0, X2 = (abs(delta) - yates) ** 2 / vsum;
      const or = sd / so;
      let s1 = 0, s2 = 0, s3 = 0;
      for (const x of xs) {
        const n = x[0][0] + x[0][1] + x[1][0] + x[1][1], a = x[0][0], b = x[0][1], c = x[1][0], d = x[1][1];
        s1 += (a + d) * a * d / (n * n); s2 += ((a + d) * b * c + (b + c) * a * d) / (n * n); s3 += (b + c) * b * c / (n * n);
      }
      const ee = sqrt(s1 / (2 * sd * sd) + s2 / (2 * sd * so) + s3 / (2 * so * so)), z = D().qnorm((1 - nivel) / 2);
      const out = { X2, gl: 1, p: D().pchisq(X2, 1, false), yates, razon_momios: or, ee_log: ee, ic: [or * exp(z * ee), or * exp(-z * ee)] };
      /* Breslow-Day, con y sin la corrección de Tarone; los estratos con un margen en cero no informan y no entran */
      let bd = 0, sa = 0, se = 0, sv = 0, valido = true, utiles = 0;
      for (const x of xs) {
        const n = x[0][0] + x[0][1] + x[1][0] + x[1][1], r1 = x[0][0] + x[0][1], c1 = x[0][0] + x[1][0], a = x[0][0];
        const lo = max(0, r1 + c1 - n), hi = min(r1, c1);
        if (hi === lo) continue;
        utiles++;
        /* E con la razón de momios común: E(n − r1 − c1 + E) = ψ (r1 − E)(c1 − E) */
        const A2 = 1 - or, B = n - r1 - c1 + or * (r1 + c1), Cq = -or * r1 * c1;
        let E;
        if (abs(A2) < 1e-12) E = -Cq / B;
        else { const disc = B * B - 4 * A2 * Cq, r = [(-B + sqrt(disc)) / (2 * A2), (-B - sqrt(disc)) / (2 * A2)]; E = r.find(v => v >= lo - 1e-9 && v <= hi + 1e-9); }
        if (E === undefined || !(E > lo && E < hi)) { valido = false; continue; }
        const v = 1 / (1 / E + 1 / (r1 - E) + 1 / (c1 - E) + 1 / (n - r1 - c1 + E));
        bd += (a - E) ** 2 / v; sa += a; se += E; sv += v;
      }
      if (valido && utiles > 1 && Number.isFinite(or) && or > 0) {
        const tarone = bd - (sa - se) ** 2 / sv, g = utiles - 1;
        out.breslow_day = { X2: bd, gl: g, p: D().pchisq(bd, g, false), X2_tarone: tarone, p_tarone: D().pchisq(tarone, g, false), estratos: utiles };
      }
      /* razón de momios de cada estrato (Woolf; con un cero, +0.5 a las cuatro celdas) */
      const zz = D().qnorm((1 + nivel) / 2);
      out.estratos = xs.map(x => {
        const cero = x.flat().some(v => v === 0), [a, b] = x[0].map(v => v + (cero ? 0.5 : 0)), [c, d] = x[1].map(v => v + (cero ? 0.5 : 0)), or1 = a * d / (b * c), s = sqrt(1 / a + 1 / b + 1 / c + 1 / d);
        return { razon_momios: or1, ic: [or1 * exp(-zz * s), or1 * exp(zz * s)], corregida: cero };
      });
      return out;
    }
    /* I × J × K: estadístico generalizado */
    const gl = (I - 1) * (J - 1), nv = new Float64Array(gl), mv = new Float64Array(gl), V = new Float64Array(gl * gl);
    for (const f of xs) {
      const ntot = f.flat().reduce((a, b) => a + b, 0), rs = sumaFilas(f).slice(0, I - 1), cs = sumaCols(f).slice(0, J - 1);
      /* vec por columnas de f[-I, -J] (las filas cambian más rápido) */
      for (let j = 0; j < J - 1; j++) for (let i = 0; i < I - 1; i++) { const k = i + j * (I - 1); nv[k] += f[i][j]; mv[k] += rs[i] * cs[j] / ntot; }
      /* kronecker(diag(ntot·cs) − cs csᵀ, diag(ntot·rs) − rs rsᵀ) / (ntot² (ntot − 1)) */
      const den = ntot * ntot * (ntot - 1);
      for (let ja = 0; ja < J - 1; ja++) for (let jb = 0; jb < J - 1; jb++) {
        const cA = (ja === jb ? ntot * cs[ja] : 0) - cs[ja] * cs[jb];
        for (let ia = 0; ia < I - 1; ia++) for (let ib = 0; ib < I - 1; ib++) {
          const rB = (ia === ib ? ntot * rs[ia] : 0) - rs[ia] * rs[ib];
          V[(ia + ja * (I - 1)) + (ib + jb * (I - 1)) * gl] += cA * rB / den;
        }
      }
    }
    const dif = Float64Array.from(nv, (v, k) => v - mv[k]);
    const L = SP.algebra.cholesky(V, gl);
    /* resolver L Lᵀ u = dif */
    const u = Float64Array.from(dif);
    for (let i = 0; i < gl; i++) { let s = u[i]; for (let k = 0; k < i; k++) s -= L[i + k * gl] * u[k]; u[i] = s / L[i + i * gl]; }
    let X2 = 0; for (let i = 0; i < gl; i++) X2 += u[i] * u[i];
    return { X2, gl, p: D().pchisq(X2, gl, false) };
  }

  /* ---------------- kappa ---------------- */
  function kappa(x, ponderacion, nivel) {
    nivel = nivel || 0.95;
    const k = x.length, n = x.flat().reduce((a, b) => a + b, 0), p = x.map(f => f.map(v => v / n));
    const rs = sumaFilas(p), cs = sumaCols(p);
    let po = 0, pc = 0;
    for (let i = 0; i < k; i++) { po += p[i][i]; pc += rs[i] * cs[i]; }
    const kap = (po - pc) / (1 - pc);
    /* varianza de Fleiss, Cohen y Everitt (1969): la no nula para el IC y la nula para la prueba */
    let a1 = 0, a2 = 0, sumPP = 0;
    for (let i = 0; i < k; i++) {
      a1 += p[i][i] * ((1 - pc) - (rs[i] + cs[i]) * (1 - po)) ** 2;
      sumPP += rs[i] * cs[i] * (rs[i] + cs[i]);
      for (let j = 0; j < k; j++) if (i !== j) a2 += p[i][j] * (cs[i] + rs[j]) ** 2;
    }
    const varK = (a1 + (1 - po) ** 2 * a2 - (po * pc - 2 * pc + po) ** 2) / (n * (1 - pc) ** 4);
    const var0 = (pc + pc * pc - sumPP) / (n * (1 - pc) ** 2);
    const e = ponderacion === 'lineal' ? 1 : 2;
    const W = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => 1 - abs(i - j) ** e / (k - 1) ** e));
    let wpo = 0, wpc = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { wpo += W[i][j] * p[i][j]; wpc += W[i][j] * rs[i] * cs[j]; }
    const wr = Array.from({ length: k }, (_, i) => W[i].reduce((s, w, j) => s + w * cs[j], 0)), wc = Array.from({ length: k }, (_, j) => W.reduce((s, f, i) => s + f[j] * rs[i], 0));
    let b1 = 0, b0 = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
      b1 += p[i][j] * (W[i][j] * (1 - wpc) - (wr[i] + wc[j]) * (1 - wpo)) ** 2;
      b0 += rs[i] * cs[j] * (W[i][j] - (wr[i] + wc[j])) ** 2;
    }
    const kw = (wpo - wpc) / (1 - wpc);
    const varKw = (b1 - (wpo * wpc - 2 * wpc + wpo) ** 2) / (n * (1 - wpc) ** 4), var0w = (b0 - wpc * wpc) / (n * (1 - wpc) ** 2);
    const z = D().qnorm((1 + nivel) / 2);
    const res = (est, v, v0) => ({ estimado: est, ee: sqrt(max(0, v)), ic: [est - z * sqrt(max(0, v)), est + z * sqrt(max(0, v))], z: est / sqrt(v0), p: 2 * D().pnorm(-abs(est / sqrt(v0))) });
    return { n, acuerdo: po, esperado: pc, simple: res(kap, varK, var0), ponderada: Object.assign(res(kw, varKw, var0w), { pesos: ponderacion === 'lineal' ? 'lineal' : 'cuadratica' }) };
  }

  /* ---------------- análisis (métodos) ---------------- */
  const etiquetaFisher = 4000;   // milisegundos que puede tardar la Fisher r × c antes de declararse impráctica
  function independencia(tabla, e, op) {
    op = Object.assign({ correccion: true, nivel: 0.95, alfa: 0.05, alternativa: 'bilateral' }, op || {});
    const t = cruzar(tabla, e, [e.fila, e.columna]), x = t.x, R = x.length, C = R ? x[0].length : 0;
    exigir(R >= 2 && C >= 2, T('Hacen falta al menos dos niveles con datos en cada variable.'));
    const ch = chiCuadrada(x, op.correccion), avisos = [];
    if (t.omitidas) avisos.push(T('{k} filas con algún faltante no entran.', { k: t.omitidas }));
    let fisher = null;
    const enteros = !t.noEnteros;
    if (enteros && R === 2 && C === 2) fisher = Object.assign({ tipo: '2x2' }, fisher2x2(x, op.alternativa, op.nivel));
    /* r × c: cuando hace falta (esperados < 5) o la tabla es chica; con miles de casos la ji cuadrada basta */
    else if (enteros && !op.sinFisher && ch.n <= 5000 && (ch.menores5 > 0 || ch.n <= 300)) { const f = fisherRxC(x, etiquetaFisher); fisher = f ? Object.assign({ tipo: 'rxc' }, f) : { tipo: 'rxc', p: NaN, demasiado: true }; }
    if (t.noEnteros) avisos.push(T('Las frecuencias no son enteras: la prueba exacta de Fisher no aplica.'));
    if (ch.menores5) avisos.push(T('{k} de {c} celdas tienen frecuencia esperada menor que 5 (mínima {m}): la ji cuadrada es aproximada; usa la prueba exacta de Fisher.', { k: ch.menores5, c: ch.celdas, m: ch.minimo.toFixed(2) }));
    return { tipo: 'contingencia', fila: e.fila, columna: e.columna, frecuencia: e.frecuencia || null, niveles: t.niveles, observados: x, chi: ch, fisher, medidas: medidas(x, op.nivel),
      alfa: op.alfa, nivel: op.nivel, correccion: op.correccion, avisos };
  }
  function analizarMcnemar(tabla, e, op) {
    op = Object.assign({ correccion: true, alfa: 0.05 }, op || {});
    const fa = SP.estructura.comoFactor(tabla, e.antes), fd = SP.estructura.comoFactor(tabla, e.despues);
    /* las mismas categorías en los dos: unión en el orden del primero */
    const niv = fa.niveles.slice();
    for (const l of fd.niveles) if (!niv.includes(l)) niv.push(l);
    const k = niv.length, x = Array.from({ length: k }, () => new Array(k).fill(0)), w = e.frecuencia ? tabla.col(e.frecuencia).valores : null;
    const ma = fa.niveles.map(l => niv.indexOf(l)), md = fd.niveles.map(l => niv.indexOf(l));
    let omitidas = 0;
    for (let i = 0; i < tabla.n; i++) {
      const a = fa.codigos[i], d = fd.codigos[i], v = w ? w[i] : 1;
      if (a < 0 || d < 0 || !(v >= 0)) { omitidas++; continue; }
      x[ma[a]][md[d]] += v;
    }
    /* sin categorías vacías en los dos márgenes */
    const usar = niv.map((_, i) => x[i].reduce((s, v) => s + v, 0) + x.reduce((s, f) => s + f[i], 0) > 0);
    const nv = niv.filter((_, i) => usar[i]), xx = x.filter((_, i) => usar[i]).map(f => f.filter((_, j) => usar[j]));
    exigir(nv.length >= 2, T('Hacen falta al menos dos categorías.'));
    const r = mcnemar(xx, op.correccion), n = xx.flat().reduce((s, v) => s + v, 0);
    const avisos = omitidas ? [T('{k} filas con algún faltante no entran.', { k: omitidas })] : [];
    if (r.vacios) avisos.push(T('{k} pares de categorías sin ningún cambio no entran a la prueba de Bowker (R daría NaN); sus grados de libertad bajan a {g}.', { k: r.vacios, g: r.gl }));
    /* proporción de cada categoría antes y después */
    const antes = sumaFilas(xx).map(v => v / n), despues = sumaCols(xx).map(v => v / n);
    return Object.assign({ tipo: 'mcnemar', antes: e.antes, despues: e.despues, niveles: nv, observados: xx, n, prop_antes: antes, prop_despues: despues, alfa: op.alfa, avisos }, r);
  }
  function analizarCmh(tabla, e, op) {
    op = Object.assign({ correccion: true, nivel: 0.95, alfa: 0.05 }, op || {});
    const t = cruzar(tabla, e, [e.fila, e.columna, e.estrato]);
    exigir(t.niveles[0].length >= 2 && t.niveles[1].length >= 2, T('Hacen falta al menos dos niveles con datos en cada variable.'));
    exigir(t.niveles[2].length >= 2, T('El estrato necesita al menos dos niveles; con uno, usa la tabla de contingencia.'));
    const r = cmh(t.x, op.correccion, op.nivel);
    return Object.assign({ tipo: 'cmh', fila: e.fila, columna: e.columna, estrato: e.estrato, niveles: t.niveles, tablas: t.x, alfa: op.alfa, nivel: op.nivel,
      avisos: t.omitidas ? [T('{k} filas con algún faltante no entran.', { k: t.omitidas })] : [] }, r);
  }
  function analizarKappa(tabla, e, op) {
    op = Object.assign({ ponderacion: 'cuadratica', nivel: 0.95, alfa: 0.05 }, op || {});
    const r = analizarMcnemar(tabla, { antes: e.evaluador1, despues: e.evaluador2, frecuencia: e.frecuencia }, { correccion: false });
    return Object.assign({ tipo: 'kappa', evaluador1: e.evaluador1, evaluador2: e.evaluador2, niveles: r.niveles, observados: r.observados, alfa: op.alfa, nivel: op.nivel, avisos: r.avisos.filter(a => !/Bowker/.test(a)) },
      kappa(r.observados, op.ponderacion, op.nivel));
  }

  /* ---------------- atajos planos para las pruebas ---------------- */
  function independenciaDe(tabla, e, op) {
    const r = independencia(tabla, e, op), c = r.chi;
    return { X2: c.X2, gl: c.gl, p: c.p, G2: c.G2, p_G2: c.p_G2, esperados: c.esperados, residuos: c.residuos, ajustados: c.ajustados, fisher: r.fisher };
  }
  const medidasDe = (tabla, e, op) => independencia(tabla, e, Object.assign({}, op, { sinFisher: true })).medidas;
  const mcnemarDe = (tabla, e, op) => { const r = analizarMcnemar(tabla, e, op); return { X2: r.X2, gl: r.gl, p: r.p, p_exacta: r.p_exacta === undefined ? null : r.p_exacta }; };
  const cmhDe = (tabla, e, op) => { const r = analizarCmh(tabla, e, op); return { X2: r.X2, gl: r.gl, p: r.p, razon_momios: r.razon_momios === undefined ? null : r.razon_momios, ic: r.ic || null, breslow_day: r.breslow_day || null, estratos: r.estratos || null }; };
  const kappaDe = (tabla, e, op) => { const r = analizarKappa(tabla, e, op); return { simple: r.simple, ponderada: r.ponderada }; };
  SP.cont = { cruzar, chiCuadrada, fisher2x2, fisherRxC, medidas, mcnemar, cmh, kappa, independencia, analizarMcnemar, analizarCmh, analizarKappa,
    independenciaDe, medidasDe, mcnemarDe, cmhDe, kappaDe };

  /* ======================= métodos ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : x === Infinity ? '∞' : '—');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nivelesFactor = (tabla, c) => { try { return SP.estructura.comoFactor(tabla, c).niveles.length; } catch (err) { return 0; } };
  function validarFactores(tabla, e, cols) {
    const usados = [];
    for (const c of cols) {
      exigir(c && tabla.columnas[c], T('Falta elegir una variable.'));
      exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c }));
      exigir(nivelesFactor(tabla, c) <= 50, T('«{c}» tiene demasiadas categorías para una tabla de contingencia (más de 50).', { c }));
      usados.push(c);
    }
    if (e.frecuencia) {
      exigir(tabla.columnas[e.frecuencia] && tabla.col(e.frecuencia).tipo === 'numerica', T('La columna de frecuencias debe ser numérica.'));
      exigir(!usados.includes(e.frecuencia), T('«{c}» está en dos papeles a la vez.', { c: e.frecuencia }));
    }
  }
  const tablaObservada = (r, titulo, filas, cols, x) => ({ id: 'observados', titulo,
    columnas: [col('f', '', 'texto')].concat(cols.map((c, j) => col('c' + j, c, 'entero'))).concat([col('tot', T('Total'), 'entero')]),
    filas: x.map((f, i) => Object.assign({ f: filas[i] }, Object.fromEntries(f.map((v, j) => ['c' + j, v])), { tot: f.reduce((a, b) => a + b, 0) }))
      .concat([Object.assign({ f: T('Total') }, Object.fromEntries(cols.map((_, j) => ['c' + j, x.reduce((s, f) => s + f[j], 0)])), { tot: x.flat().reduce((a, b) => a + b, 0) })]), notas: [] });

  function reporteIndependencia(r) {
    const a = r.alfa, c = r.chi, conclusiones = [], cuadros = [], [nf, nc] = r.niveles;
    const usarFisher = r.fisher && Number.isFinite(r.fisher.p) && c.menores5 > 0;
    const pPrincipal = usarFisher ? r.fisher.p : c.p;
    conclusiones.push(pPrincipal < a
      ? T('«{f}» y «{c}» están asociadas: la distribución de «{c}» cambia según «{f}» ({prueba}).', { f: r.fila, c: r.columna, prueba: usarFisher ? T('Fisher exacta, p {p}', { p: fp(r.fisher.p) }) : T('χ² = {x} con {g} gl, p {p}', { x: f3(c.X2), g: c.gl, p: fp(c.p) }) })
      : T('No hay evidencia de asociación entre «{f}» y «{c}» ({prueba}).', { f: r.fila, c: r.columna, prueba: usarFisher ? T('Fisher exacta, p {p}', { p: fp(r.fisher.p) }) : T('χ² = {x} con {g} gl, p {p}', { x: f3(c.X2), g: c.gl, p: fp(c.p) }) }));
    const m = r.medidas;
    conclusiones.push(T('V de Cramér = {v} ({f}).', { v: f3(m.v_cramer), f: m.v_cramer < 0.1 ? T('asociación despreciable') : m.v_cramer < 0.3 ? T('asociación débil') : m.v_cramer < 0.5 ? T('asociación moderada') : T('asociación fuerte') }));
    if (pPrincipal < a) {
      let mx = { v: 0 };
      c.ajustados.forEach((f, i) => f.forEach((v, j) => { if (abs(v) > abs(mx.v)) mx = { v, i, j }; }));
      if (abs(mx.v) > 1.96) conclusiones.push(T('La celda que más se aparta de la independencia: «{f}» con «{c}», con {m} casos de los que se esperarían (residuo ajustado {v}).', { f: nf[mx.i], c: nc[mx.j], m: mx.v > 0 ? T('más') : T('menos'), v: f3(mx.v) }));
    }
    if (m.razon_momios) conclusiones.push(T('Razón de momios = {o} (IC {n} %: {i} a {s}); riesgo relativo de «{c1}» = {rr} (IC: {ri} a {rs}).', { o: f3(m.razon_momios.estimado), n: Math.round(100 * r.nivel), i: f3(m.razon_momios.ic[0]), s: f3(m.razon_momios.ic[1]), c1: nc[0], rr: f3(m.riesgo_relativo.estimado), ri: f3(m.riesgo_relativo.ic[0]), rs: f3(m.riesgo_relativo.ic[1]) }));
    cuadros.push(Object.assign(tablaObservada(r, T('Frecuencias observadas: «{f}» × «{c}»', { f: r.fila, c: r.columna }), nf, nc, r.observados), { notas: r.frecuencia ? [T('Frecuencias de la columna «{w}».', { w: r.frecuencia })] : [] }));
    cuadros.push({ id: 'esperados', titulo: T('Frecuencias esperadas y residuos ajustados'),
      columnas: [col('f', '', 'texto')].concat(nc.map((cc, j) => col('c' + j, cc, 'texto'))),
      filas: nf.map((f, i) => Object.assign({ f }, Object.fromEntries(nc.map((_, j) => ['c' + j, `${c.esperados[i][j].toFixed(2)}  (${f3(c.ajustados[i][j])})`])))),
      notas: [T('Entre paréntesis, el residuo ajustado: más allá de ±1.96 la celda se aparta de la independencia (α = 0.05).')] });
    const pr = [{ prueba: T('Ji cuadrada de Pearson') + (c.yates ? T(' (Yates)') : ''), est: c.X2, gl: c.gl, p: c.p }, { prueba: T('Razón de verosimilitudes (G²)'), est: c.G2, gl: c.gl, p: c.p_G2 }];
    if (r.fisher) pr.push({ prueba: T('Fisher exacta') + (r.fisher.tipo === '2x2' ? '' : ` (${nf.length} × ${nc.length})`), est: NaN, gl: NaN, p: r.fisher.p });
    cuadros.push({ id: 'pruebas', titulo: T('Pruebas de independencia'), columnas: [col('prueba', T('Prueba'), 'texto'), col('est', T('Estadístico'), 'forma'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: pr, notas: r.avisos.concat(r.fisher && r.fisher.demasiado ? [T('La prueba exacta de Fisher requiere revisar demasiadas tablas con estos márgenes; usa la ji cuadrada o junta categorías.')] : [])
        .concat(r.fisher && r.fisher.tipo === '2x2' ? [T('Fisher 2 × 2: razón de momios condicional {o} (IC exacto {n} %: {i} a {s}).', { o: f3(r.fisher.razon_momios), n: Math.round(100 * r.nivel), i: f3(r.fisher.ic[0]), s: f3(r.fisher.ic[1]) })] : []) });
    const ord = m.gamma;
    const fil = [{ medida: 'φ', v: m.phi }, { medida: T('V de Cramér'), v: m.v_cramer }, { medida: T('Coeficiente de contingencia'), v: m.contingencia },
      { medida: T('λ ({c} a partir de {f})', { c: r.columna, f: r.fila }), v: m.lambda_c_r }, { medida: T('λ ({f} a partir de {c})', { c: r.columna, f: r.fila }), v: m.lambda_r_c }, { medida: T('λ simétrica'), v: m.lambda_simetrica },
      { medida: T('Incertidumbre ({c} a partir de {f})', { c: r.columna, f: r.fila }), v: m.incertidumbre_c_r }, { medida: T('Incertidumbre simétrica'), v: m.incertidumbre_simetrica }];
    cuadros.push({ id: 'nominales', titulo: T('Medidas de asociación'), columnas: [col('medida', T('Medida'), 'texto'), col('v', T('Valor'), 'forma')], filas: fil,
      notas: [T('λ y la incertidumbre dicen cuánto mejora la predicción de una variable al conocer la otra (0 = nada, 1 = por completo).')] });
    if (ord) {
      const of = [['γ (gamma)', m.gamma], ['τ-b de Kendall', m.tau_b], ['τ-c de Stuart', m.tau_c], [T('d de Somers ({c} | {f})', { c: r.columna, f: r.fila }), m.somers_c_r], [T('d de Somers ({f} | {c})', { c: r.columna, f: r.fila }), m.somers_r_c]];
      cuadros.push({ id: 'ordinales', titulo: T('Medidas para categorías ordenadas'),
        columnas: [col('medida', T('Medida'), 'texto'), col('v', T('Valor'), 'forma'), col('ee', T('EE asintótico'), 'forma'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig'), col('z', 'z', 'forma2'), col('p', 'p', 'pvalor')],
        filas: of.map(([n, z]) => ({ medida: n, v: z.estimado, ee: z.ee, ic: z.ic, z: z.z, p: z.p })),
        notas: [T('Solo tienen sentido si las categorías de las dos variables están en orden (p. ej., dosis o grados de daño). EE asintóticos de Agresti (2002); z con el EE bajo independencia.')] });
    }
    return { titulo: T('Tabla de contingencia'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoIndependencia(e, op) {
    const tab = e.frecuencia ? `xtabs(${q(e.frecuencia)} ~ ${q(e.fila)} + ${q(e.columna)}, data = datos)` : `table(datos$${q(e.fila)}, datos$${q(e.columna)})`;
    return ['# Tabla de contingencia (código R equivalente a SigmaPro)', `tabla <- ${tab}`, 'tabla <- tabla[rowSums(tabla) > 0, colSums(tabla) > 0]',
      `(prueba <- chisq.test(tabla, correct = ${op.correccion ? 'TRUE' : 'FALSE'}))`, 'prueba$expected; prueba$stdres   # esperados y residuos ajustados',
      'E <- prueba$expected; G2 <- 2 * sum(tabla[tabla > 0] * log(tabla[tabla > 0] / E[tabla > 0]))',
      'c(G2 = G2, p = pchisq(G2, prueba$parameter, lower.tail = FALSE))   # razón de verosimilitudes',
      `fisher.test(tabla, conf.level = ${op.nivel})   # exacta (en tablas grandes: workspace = 2e8)`,
      'X2 <- chisq.test(tabla, correct = FALSE)$statistic; sqrt(X2 / (sum(tabla) * (min(dim(tabla)) - 1)))   # V de Cramér',
      'cor(rep(row(tabla), tabla), rep(col(tabla), tabla), method = "kendall")   # τ-b (categorías ordenadas)',
      '# γ, τ-c, d de Somers, λ e incertidumbre: DescTools::GoodmanKruskalGamma(tabla, conf.level = …), StuartTauC, SomersDelta, Lambda, UncertCoef'].join('\n');
  }

  function reporteMcnemar(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], k = r.niveles.length;
    const nombre = k === 2 ? 'McNemar' : T('simetría de Bowker');
    const pp = k === 2 ? r.p_exacta : r.p;
    conclusiones.push(pp < a
      ? T('Las proporciones cambian entre «{a}» y «{d}» ({n}: χ² = {x} con {g} gl, p {p}{ex}).', { a: r.antes, d: r.despues, n: nombre, x: f3(r.X2), g: r.gl, p: fp(r.p), ex: k === 2 ? T('; binomial exacta p {p}', { p: fp(r.p_exacta) }) : '' })
      : T('No hay evidencia de cambio entre «{a}» y «{d}» ({n}: χ² = {x} con {g} gl, p {p}{ex}).', { a: r.antes, d: r.despues, n: nombre, x: f3(r.X2), g: r.gl, p: fp(r.p), ex: k === 2 ? T('; binomial exacta p {p}', { p: fp(r.p_exacta) }) : '' }));
    if (k === 2) conclusiones.push(T('Solo cuentan los casos que cambiaron: {b} de «{l1}» a «{l2}» y {c} de «{l2}» a «{l1}».', { b: r.discordantes[0], c: r.discordantes[1], l1: r.niveles[0], l2: r.niveles[1] }));
    cuadros.push(tablaObservada(r, T('«{a}» (filas) contra «{d}» (columnas)', { a: r.antes, d: r.despues }), r.niveles, r.niveles, r.observados));
    cuadros.push({ id: 'prueba', titulo: T('Prueba de {n}', { n: nombre }), columnas: [col('prueba', T('Prueba'), 'texto'), col('est', T('Estadístico'), 'forma'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: [{ prueba: nombre + (r.correccion ? T(' (con corrección por continuidad)') : ''), est: r.X2, gl: r.gl, p: r.p }].concat(k === 2 ? [{ prueba: T('Binomial exacta'), est: NaN, gl: NaN, p: r.p_exacta }] : []),
      notas: [T('Datos pareados: cada caso se clasificó dos veces (antes y después, o dos métodos).')].concat(r.avisos) });
    cuadros.push({ id: 'proporciones', titulo: T('Proporción de cada categoría'), columnas: [col('c', T('Categoría'), 'texto'), col('a', r.antes, 'prop'), col('d', r.despues, 'prop')],
      filas: r.niveles.map((l, i) => ({ c: l, a: r.prop_antes[i], d: r.prop_despues[i] })), notas: [] });
    return { titulo: k === 2 ? T('Prueba de McNemar') : T('Prueba de simetría de Bowker'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoMcnemar(e, op) {
    const tab = e.frecuencia ? `xtabs(${q(e.frecuencia)} ~ ${q(e.antes)} + ${q(e.despues)}, data = datos)` : `table(datos$${q(e.antes)}, datos$${q(e.despues)})`;
    return ['# McNemar / Bowker (código R equivalente a SigmaPro)', `tabla <- ${tab}`, `(prueba <- mcnemar.test(tabla, correct = ${op.correccion ? 'TRUE' : 'FALSE'}))`,
      '# 2 × 2, binomial exacta con los casos que cambiaron: binom.test(tabla[1, 2], tabla[1, 2] + tabla[2, 1])'].join('\n');
  }

  function reporteCmh(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], [nf, nc, ns] = r.niveles;
    conclusiones.push(r.p < a
      ? T('Controlando por «{s}», «{f}» y «{c}» están asociadas (Cochran-Mantel-Haenszel χ² = {x} con {g} gl, p {p}).', { s: r.estrato, f: r.fila, c: r.columna, x: f3(r.X2), g: r.gl, p: fp(r.p) })
      : T('Controlando por «{s}», no hay evidencia de asociación entre «{f}» y «{c}» (χ² = {x} con {g} gl, p {p}).', { s: r.estrato, f: r.fila, c: r.columna, x: f3(r.X2), g: r.gl, p: fp(r.p) }));
    if (r.razon_momios !== undefined) {
      conclusiones.push(T('Razón de momios común de Mantel-Haenszel = {o} (IC {n} %: {i} a {s}).', { o: f3(r.razon_momios), n: Math.round(100 * r.nivel), i: f3(r.ic[0]), s: f3(r.ic[1]) }));
      if (r.breslow_day) conclusiones.push(r.breslow_day.p_tarone < a
        ? T('Pero la razón de momios cambia entre estratos (Breslow-Day con Tarone p {p}): la razón común no resume bien; describe cada estrato.', { p: fp(r.breslow_day.p_tarone) })
        : T('La razón de momios es parecida en todos los estratos (Breslow-Day con Tarone p {p}).', { p: fp(r.breslow_day.p_tarone) }));
    }
    cuadros.push({ id: 'cmh', titulo: T('Prueba de Cochran-Mantel-Haenszel'), columnas: [col('prueba', T('Prueba'), 'texto'), col('est', T('Estadístico'), 'forma'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: [{ prueba: 'Cochran-Mantel-Haenszel' + (r.yates ? T(' (con corrección por continuidad)') : ''), est: r.X2, gl: r.gl, p: r.p }]
        .concat(r.breslow_day ? [{ prueba: T('Homogeneidad de Breslow-Day'), est: r.breslow_day.X2, gl: r.breslow_day.gl, p: r.breslow_day.p }, { prueba: T('Breslow-Day con la corrección de Tarone'), est: r.breslow_day.X2_tarone, gl: r.breslow_day.gl, p: r.breslow_day.p_tarone }] : []),
      notas: [T('Una tabla «{f}» × «{c}» por cada nivel de «{s}» ({k} estratos).', { f: r.fila, c: r.columna, s: r.estrato, k: ns.length })].concat(r.avisos) });
    if (r.estratos) {
      cuadros.push({ id: 'estratos', titulo: T('Razón de momios en cada estrato'), columnas: [col('s', r.estrato, 'texto'), col('t', T('Tabla (a b / c d)'), 'texto'), col('or', T('Razón de momios'), 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')],
        filas: r.estratos.map((s, k) => ({ s: ns[k], t: `${r.tablas[k][0][0]} ${r.tablas[k][0][1]} / ${r.tablas[k][1][0]} ${r.tablas[k][1][1]}`, or: s.razon_momios, ic: s.ic }))
          .concat([{ s: T('Común (MH)'), t: '', or: r.razon_momios, ic: r.ic }]),
        notas: [T('a = «{f1}» con «{c1}», b = «{f1}» con «{c2}», c = «{f2}» con «{c1}», d = «{f2}» con «{c2}». IC de Woolf en cada estrato (con una celda en cero se suma 0.5 a las cuatro) y de Robins, Breslow y Greenland para la común (MH: Mantel-Haenszel).', { f1: nf[0], f2: nf[1], c1: nc[0], c2: nc[1] })] });
    }
    return { titulo: T('Cochran-Mantel-Haenszel'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoCmh(e, op) {
    const tab = e.frecuencia ? `xtabs(${q(e.frecuencia)} ~ ${q(e.fila)} + ${q(e.columna)} + ${q(e.estrato)}, data = datos)` : `table(datos$${q(e.fila)}, datos$${q(e.columna)}, datos$${q(e.estrato)})`;
    return ['# Cochran-Mantel-Haenszel (código R equivalente a SigmaPro)', `tabla <- ${tab}`, `(mh <- mantelhaen.test(tabla, correct = ${op.correccion ? 'TRUE' : 'FALSE'}, conf.level = ${op.nivel}))`,
      '# homogeneidad de la razón de momios: DescTools::BreslowDayTest(tabla, correct = TRUE)'].join('\n');
  }

  function reporteKappa(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], k = r.simple, w = r.ponderada;
    const grado = v => (v < 0 ? T('peor que el azar') : v < 0.2 ? T('leve') : v < 0.4 ? T('aceptable') : v < 0.6 ? T('moderada') : v < 0.8 ? T('considerable') : T('casi perfecta'));
    conclusiones.push(T('Los dos evaluadores coinciden en el {a} % de los casos; por azar coincidirían en el {e} %.', { a: (100 * r.acuerdo).toFixed(1), e: (100 * r.esperado).toFixed(1) }));
    conclusiones.push(T('Kappa = {k} (IC {n} %: {i} a {s}): concordancia {g} según Landis y Koch (1977){p}.', { k: f3(k.estimado), n: Math.round(100 * r.nivel), i: f3(k.ic[0]), s: f3(k.ic[1]), g: grado(k.estimado), p: k.p < a ? T(', mayor que la del azar (p {p})', { p: fp(k.p) }) : T(', que no supera la del azar (p {p})', { p: fp(k.p) }) }));
    if (r.niveles.length > 2) conclusiones.push(T('Kappa ponderada ({w}) = {k}: cuenta que un desacuerdo entre categorías vecinas pesa menos que uno entre extremas.', { w: w.pesos === 'lineal' ? T('pesos lineales') : T('pesos cuadráticos'), k: f3(w.estimado) }));
    cuadros.push(tablaObservada(r, T('«{a}» (filas) contra «{b}» (columnas)', { a: r.evaluador1, b: r.evaluador2 }), r.niveles, r.niveles, r.observados));
    cuadros.push({ id: 'kappa', titulo: T('Concordancia'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'forma'), col('ee', T('EE'), 'forma'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig'), col('z', 'z', 'forma2'), col('p', 'p', 'pvalor')],
      filas: [{ m: T('Kappa de Cohen'), v: k.estimado, ee: k.ee, ic: k.ic, z: k.z, p: k.p }].concat(r.niveles.length > 2 ? [{ m: T('Kappa ponderada ({w})', { w: w.pesos === 'lineal' ? T('lineal') : T('cuadrática') }), v: w.estimado, ee: w.ee, ic: w.ic, z: w.z, p: w.p }] : []),
      notas: [T('EE de Fleiss, Cohen y Everitt (1969); la prueba z usa el EE bajo concordancia por azar. Las categorías se ordenan como en la primera columna, lo que importa para la ponderada.')].concat(r.avisos) });
    return { titulo: T('Concordancia entre evaluadores (kappa)'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoKappa(e, op) {
    const tab = e.frecuencia ? `xtabs(${q(e.frecuencia)} ~ ${q(e.evaluador1)} + ${q(e.evaluador2)}, data = datos)` : `table(datos$${q(e.evaluador1)}, datos$${q(e.evaluador2)})`;
    return ['# Kappa de Cohen (código R equivalente a SigmaPro)', `tabla <- ${tab}`, `(ck <- psych::cohen.kappa(unclass(tabla), w.exp = ${op.ponderacion === 'lineal' ? 1 : 2}, alpha = ${(1 - op.nivel).toFixed(4).replace(/0+$/, '')}))`,
      '# o: irr::kappa2(datos[c(…)], weight = "squared")'].join('\n');
  }

  const FREC = { frecuencia: { tipo: 'numerica', opcional: true } };
  SP.metodo({
    id: 'tabla-contingencia', familia: 'contingencia', motor: 'js', orden: 0, nombre: T('Tabla de contingencia'),
    resumen: T('Independencia de dos variables: ji cuadrada, G², Fisher exacta, residuos ajustados y medidas de asociación (también ordinales y razón de momios).'),
    entradas: Object.assign({ fila: { tipo: 'factor' }, columna: { tipo: 'factor' } }, FREC),
    opciones: { correccion: { tipo: 'logico', omision: true }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (tabla, e, op) => { validarFactores(tabla, e, [e.fila, e.columna]); exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.')); },
    calcular: independencia, reporte: reporteIndependencia, codigoR: codigoIndependencia,
  });
  SP.metodo({
    id: 'mcnemar', familia: 'contingencia', motor: 'js', orden: 1, nombre: T('McNemar y Bowker (datos pareados)'),
    resumen: T('Cambio en una clasificación medida dos veces sobre los mismos casos: McNemar en 2 × 2 (con binomial exacta) y simetría de Bowker con más categorías.'),
    entradas: Object.assign({ antes: { tipo: 'factor' }, despues: { tipo: 'factor' } }, FREC),
    opciones: { correccion: { tipo: 'logico', omision: true }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (tabla, e) => validarFactores(tabla, e, [e.antes, e.despues]),
    calcular: analizarMcnemar, reporte: reporteMcnemar, codigoR: codigoMcnemar,
  });
  SP.metodo({
    id: 'mantel-haenszel', familia: 'contingencia', motor: 'js', orden: 2, nombre: T('Cochran-Mantel-Haenszel (por estratos)'),
    resumen: T('Asociación de dos variables controlando una tercera (lotes, sitios, años): razón de momios común y homogeneidad de Breslow-Day.'),
    entradas: Object.assign({ fila: { tipo: 'factor' }, columna: { tipo: 'factor' }, estrato: { tipo: 'factor' } }, FREC),
    opciones: { correccion: { tipo: 'logico', omision: true }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (tabla, e) => validarFactores(tabla, e, [e.fila, e.columna, e.estrato]),
    calcular: analizarCmh, reporte: reporteCmh, codigoR: codigoCmh,
  });
  SP.metodo({
    id: 'kappa', familia: 'contingencia', motor: 'js', orden: 3, nombre: T('Concordancia entre evaluadores (kappa)'),
    resumen: T('Kappa de Cohen simple y ponderada (lineal o cuadrática) con su intervalo, para dos evaluadores o dos métodos de clasificación.'),
    entradas: Object.assign({ evaluador1: { tipo: 'factor' }, evaluador2: { tipo: 'factor' } }, FREC),
    opciones: { ponderacion: { tipo: 'texto', omision: 'cuadratica' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (tabla, e, op) => { validarFactores(tabla, e, [e.evaluador1, e.evaluador2]); exigir(['lineal', 'cuadratica'].includes(op.ponderacion), T('Ponderación no válida.')); },
    calcular: analizarKappa, reporte: reporteKappa, codigoR: codigoKappa,
  });
});
