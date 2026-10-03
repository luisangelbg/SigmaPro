/* SigmaPro — supuestos del modelo: normalidad, varianzas, aditividad, independencia y atípicos.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Funciones puras (SP.sup), cada una validada contra la función de R que se indica:
     shapiro(x)                         Shapiro-Wilk, algoritmo AS R94 de Royston (1995)      shapiro.test
     lilliefors(x)                      K-S con media y DE estimadas (Dallal y Wilkinson)     nortest::lillie.test
     andersonDarling(x)                 con la corrección de Stephens (1986)                  nortest::ad.test
     kolmogorov(x, media, de, alt, exacta)  contra una normal dada; exacta de Marsaglia,
                                        Tsang y Wang (2003) o de Birnbaum y Tingey (1951)    ks.test
     levene(y, g, centro)               centro 'media' (Levene) o 'mediana' (Brown-Forsythe)  car::leveneTest
     bartlett(y, g), fligner(y, g)                                                            bartlett.test, fligner.test
     noAditividad(y, f1, f2, gl, cm)    un grado de libertad de Tukey (1949)                  agricolae::nonadditivity
     durbinWatson(ajuste, alt, exacta)  p exacto con el algoritmo AS 153 de Farebrother
                                        (1980, 1984) o normal con media y varianza exactas   lmtest::dwtest
     rachas(x, alt, exacta)             rachas arriba y abajo de la mediana                   randtests::runs.test
     influencia(ajuste)                 palancas, residuos estandarizados y estudentizados,
                                        distancia de Cook                                     hatvalues, rstandard, rstudent, cooks.distance
     grubbs(x)                          un atípico (Grubbs, 1950)                             outliers::grubbs.test
     cercasTukey(x)                     bigotes y valores fuera de 1.5·RIC (con las bisagras)  boxplot.stats
     bandaQQ(n, nivel)                  cuantiles teóricos y banda por estadísticos de orden  qnorm(ppoints(n)), qbeta
   Los algoritmos de R (AS R94, Marsaglia-Tsang-Wang, AS 153) se tradujeron de su código publicado. */
SP.definir('supuestos', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, log, exp, floor, ceil, min, max, cos, asin, atan, PI } = Math;
  const D = () => SP.dist;
  Object.assign(SP.nombresFunciones, {
    'sup.shapiro': 'Normalidad: Shapiro-Wilk', 'sup.lilliefors': 'Normalidad: Lilliefors', 'sup.andersonDarling': 'Normalidad: Anderson-Darling',
    'sup.kolmogorov': 'Kolmogorov-Smirnov contra una normal dada', 'sup.levene': 'Varianzas: Levene y Brown-Forsythe',
    'sup.bartlett': 'Varianzas: Bartlett', 'sup.fligner': 'Varianzas: Fligner-Killeen', 'sup.noAditividadTabla': 'No aditividad de Tukey',
    'sup.durbinWatsonModelo': 'Independencia: Durbin-Watson', 'sup.rachas': 'Independencia: prueba de rachas',
    'sup.influenciaModelo': 'Palancas, residuos estudentizados y distancia de Cook', 'sup.atipicoModelo': 'Atípico: residuo estudentizado con Bonferroni',
    'sup.grubbs': 'Atípico: prueba de Grubbs', 'sup.cercasTukey': 'Cercas de Tukey (diagrama de caja)', 'sup.bandaQQ': 'Gráfico Q-Q: cuantiles y banda de confianza',
  });

  const ordenado = x => SP.num.sinFaltantes(x).sort();
  /** Máximo y mínimo sin desplegar el arreglo (Math.max(...x) falla o se arrastra con 100 000 valores). */
  const mayor = x => { let m = -Infinity; for (let i = 0; i < x.length; i++) if (x[i] > m) m = x[i]; return m; };
  const menor = x => { let m = Infinity; for (let i = 0; i < x.length; i++) if (x[i] < m) m = x[i]; return m; };
  const exigir = (cond, msg, arreglo) => { if (!cond) throw new SP.ErrorSP(msg, arreglo); };

  /* ======================= normalidad ======================= */
  function poly(cc, x) {
    let r = cc[0];
    if (cc.length > 1) { let p = x * cc[cc.length - 1]; for (let j = cc.length - 2; j > 0; j--) p = (p + cc[j]) * x; r += p; }
    return r;
  }
  const C1 = [0, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056], C2 = [0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633];
  const C3 = [0.544, -0.39978, 0.025054, -6.714e-4], C4 = [1.3822, -0.77857, 0.062767, -0.0020322];
  const C5 = [-1.5861, -0.31082, -0.083751, 0.0038915], C6 = [-0.4803, -0.082676, 0.0030302], G = [-2.273, 0.459];
  /** Shapiro-Wilk: W y su p, con el código de R 4.4 (swilk.c, AS R94). */
  function shapiro(xs) {
    let x = ordenado(xs);
    const n = x.length;
    exigir(n >= 3 && n <= 5000, T('Shapiro-Wilk necesita entre 3 y 5000 observaciones (hay {n}).', { n }), T('Con más de 5000, usa Anderson-Darling o Lilliefors.'));
    const rng = x[n - 1] - x[0];
    exigir(rng !== 0, T('Todos los valores son iguales: no se puede probar la normalidad.'));
    if (rng < 1e-10) x = x.map(v => v / rng);
    const nn2 = floor(n / 2), a = new Float64Array(nn2 + 1), an = n;
    if (n === 3) a[1] = 0.70710678;
    else {
      const an25 = an + 0.25;
      let summ2 = 0;
      for (let i = 1; i <= nn2; i++) { a[i] = D().qnorm((i - 0.375) / an25); summ2 += a[i] * a[i]; }
      summ2 *= 2;
      const ssumm2 = sqrt(summ2), rsn = 1 / sqrt(an);
      const a1 = poly(C1, rsn) - a[1] / ssumm2;
      let i1, fac;
      if (n > 5) {
        i1 = 3;
        const a2 = -a[2] / ssumm2 + poly(C2, rsn);
        fac = sqrt((summ2 - 2 * (a[1] * a[1]) - 2 * (a[2] * a[2])) / (1 - 2 * (a1 * a1) - 2 * (a2 * a2)));
        a[2] = a2;
      } else {
        i1 = 2;
        fac = sqrt((summ2 - 2 * (a[1] * a[1])) / (1 - 2 * (a1 * a1)));
      }
      a[1] = a1;
      for (let i = i1; i <= nn2; i++) a[i] /= -fac;
    }
    const range = x[n - 1] - x[0];
    const sign = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
    let sx = x[0] / range, sa = -a[1];
    for (let i = 1, j = n - 1; i < n; j--) {
      sx += x[i] / range;
      i++;
      if (i !== j) sa += sign(i - j) * a[min(i, j)];
    }
    sa /= n; sx /= n;
    let ssa = 0, ssx = 0, sax = 0;
    for (let i = 0, j = n - 1; i < n; i++, j--) {
      const asa = i !== j ? sign(i - j) * a[1 + min(i, j)] - sa : -sa;
      const xsx = x[i] / range - sx;
      ssa += asa * asa; ssx += xsx * xsx; sax += asa * xsx;
    }
    const ssassx = sqrt(ssa * ssx);
    const w1 = (ssassx - sax) * (ssassx + sax) / (ssa * ssx);
    const W = 1 - w1;
    let p;
    if (n === 3) p = max(0, 1.90985931710274 * (asin(sqrt(W)) - 1.04719755119660));
    else {
      let y = log(w1), m, s;
      const xx = log(an);
      if (n <= 11) {
        const gamma = poly(G, an);
        if (y >= gamma) return { W, p: 1e-99, n };
        y = -log(gamma - y);
        m = poly(C3, an); s = exp(poly(C4, an));
      } else { m = poly(C5, xx); s = exp(poly(C6, xx)); }
      p = D().pnorm(y, m, s, false);
    }
    return { W, p, n };
  }

  /** Lilliefors: K-S con media y DE estimadas; p de Dallal y Wilkinson (1986), como nortest. */
  function lilliefors(xs) {
    const x = ordenado(xs), n = x.length;
    exigir(n >= 5, T('Lilliefors necesita al menos 5 observaciones.'));
    const m = SP.num.media(x), s = sqrt(SP.num.varianza(x));
    let dmas = -Infinity, dmenos = -Infinity;
    for (let i = 0; i < n; i++) { const p = D().pnorm((x[i] - m) / s); dmas = max(dmas, (i + 1) / n - p); dmenos = max(dmenos, p - i / n); }
    const K = max(dmas, dmenos);
    const Kd = n <= 100 ? K : K * Math.pow(n / 100, 0.49), nd = n <= 100 ? n : 100;
    let p = exp(-7.01256 * Kd * Kd * (nd + 2.78019) + 2.99587 * Kd * sqrt(nd + 2.78019) - 0.122119 + 0.974598 / sqrt(nd) + 1.67997 / nd);
    if (p > 0.1) {
      const KK = (sqrt(n) - 0.01 + 0.85 / sqrt(n)) * K;
      if (KK <= 0.302) p = 1;
      else if (KK <= 0.5) p = 2.76773 - 19.828315 * KK + 80.709644 * KK ** 2 - 138.55152 * KK ** 3 + 81.218052 * KK ** 4;
      else if (KK <= 0.9) p = -4.901232 + 40.662806 * KK - 97.490286 * KK ** 2 + 94.029866 * KK ** 3 - 32.355711 * KK ** 4;
      else if (KK <= 1.31) p = 6.198765 - 19.558097 * KK + 23.186922 * KK ** 2 - 12.234627 * KK ** 3 + 2.423045 * KK ** 4;
      else p = 0;
    }
    return { D: K, p, n };
  }

  /** log Φ(z) sin perder las colas. */
  function logPnorm(z) {
    if (z > 0) return Math.log1p(-D().pnorm(-z));
    if (z > -37) return log(D().pnorm(z));
    const y = -z, y2 = y * y;      // serie asintótica de Laplace: error relativo < 1e-13 desde y = 37
    return -y2 / 2 - log(y) - 0.918938533204672741780329736406 + Math.log1p(-1 / y2 + 3 / (y2 * y2) - 15 / (y2 * y2 * y2) + 105 / (y2 * y2 * y2 * y2));
  }
  /** Anderson-Darling con la corrección (1 + 0.75/n + 2.25/n²) y el p de Stephens, como nortest. */
  function andersonDarling(xs) {
    const x = ordenado(xs), n = x.length;
    exigir(n >= 8, T('Anderson-Darling necesita al menos 8 observaciones.'));
    const m = SP.num.media(x), s = sqrt(SP.num.varianza(x));
    let suma = 0;
    for (let i = 0; i < n; i++) {
      const lp1 = logPnorm((x[i] - m) / s), lp2 = logPnorm(-(x[n - 1 - i] - m) / s);
      suma += (2 * (i + 1) - 1) * (lp1 + lp2);
    }
    const A = -n - suma / n, AA = (1 + 0.75 / n + 2.25 / (n * n)) * A;
    let p;
    if (AA < 0.2) p = 1 - exp(-13.436 + 101.14 * AA - 223.73 * AA * AA);
    else if (AA < 0.34) p = 1 - exp(-8.318 + 42.796 * AA - 59.938 * AA * AA);
    else if (AA < 0.6) p = exp(0.9177 - 4.279 * AA - 1.38 * AA * AA);
    else if (AA < 10) p = exp(1.2937 - 5.709 * AA + 0.0186 * AA * AA);
    else p = 3.7e-24;
    return { A, p, n };
  }

  /* ---- Kolmogorov-Smirnov de una muestra ---- */
  /** P(D ≤ d) exacta para la bilateral (Marsaglia, Tsang y Wang, 2003), con el código de R. */
  function kolmogorovExacta(n, d) {
    const k = floor(n * d) + 1, m = 2 * k - 1, h = k - n * d;
    const H = new Float64Array(m * m);
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) H[i * m + j] = i - j + 1 < 0 ? 0 : 1;
    for (let i = 0; i < m; i++) { H[i * m] -= Math.pow(h, i + 1); H[(m - 1) * m + i] -= Math.pow(h, m - i); }
    H[(m - 1) * m] += 2 * h - 1 > 0 ? Math.pow(2 * h - 1, m) : 0;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) if (i - j + 1 > 0) for (let g = 1; g <= i - j + 1; g++) H[i * m + j] /= g;
    const mult = (A, B) => {
      const C = new Float64Array(m * m);
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { let s = 0; for (let l = 0; l < m; l++) s += A[i * m + l] * B[l * m + j]; C[i * m + j] = s; }
      return C;
    };
    function potencia(A, eA, e) {
      if (e === 1) return { V: Float64Array.from(A), eV: eA };
      const r = potencia(A, eA, floor(e / 2));
      const B = mult(r.V, r.V), eB = 2 * r.eV;
      let V, eV;
      if (e % 2 === 0) { V = B; eV = eB; } else { V = mult(A, B); eV = eA + eB; }
      if (V[floor(m / 2) * m + floor(m / 2)] > 1e140) { for (let i = 0; i < m * m; i++) V[i] *= 1e-140; eV += 140; }
      return { V, eV };
    }
    const { V, eV } = potencia(H, 0, n);
    let s = V[(k - 1) * m + k - 1], eQ = eV;
    for (let i = 1; i <= n; i++) { s = s * i / n; if (s < 1e-140) { s *= 1e140; eQ -= 140; } }
    return s * Math.pow(10, eQ);
  }
  /** Distribución límite de Kolmogorov, con la misma serie y tolerancia que R (1e-6). */
  function kolmogorovLimite(x, inferior, tol) {
    tol = tol || 1e-6;
    const kmax = floor(sqrt(2 - log(tol)));
    if (x <= 0) return inferior ? 0 : 1;
    if (x < 1) {
      const z = -(PI / 2 * PI / 4) / (x * x), w = log(x);
      let s = 0;
      for (let k = 1; k < kmax; k += 2) s += exp(k * k * z - w);
      const p = s / 0.398942280401432677939946059934;
      return inferior ? p : 1 - p;
    }
    const z = -2 * x * x;
    let s = -1, k, viejo, nuevo;
    if (inferior) { k = 1; viejo = 0; nuevo = 1; } else { k = 2; viejo = 0; nuevo = 2 * exp(z); }
    while (abs(viejo - nuevo) > tol) { viejo = nuevo; nuevo += 2 * s * exp(z * k * k); s *= -1; k++; }
    return nuevo;
  }
  /** K-S de una muestra contra N(media, de). alternativa: 'bilateral' | 'menor' | 'mayor'. */
  function kolmogorov(xs, media, de, alternativa, exacta) {
    alternativa = alternativa || 'bilateral';
    const x = ordenado(xs), n = x.length;
    exigir(n >= 1, T('No hay datos.'));
    exigir(de > 0, T('La desviación estándar de la normal de referencia debe ser mayor que cero.'));
    const empates = new Set(x).size < n;
    if (exacta === undefined || exacta === null) exacta = n < 100 && !empates;
    const d = Array.from(x, (v, i) => D().pnorm(v, media, de) - i / n);
    const Dmenos = mayor(d), Dmas = 1 / n - menor(d);
    const est = alternativa === 'bilateral' ? max(Dmenos, Dmas) : alternativa === 'mayor' ? Dmas : Dmenos;
    let p;
    if (est <= 0) p = 1;
    else if (est > 1) p = 0;
    else if (exacta) {
      if (alternativa === 'bilateral') p = 1 - kolmogorovExacta(n, est);
      else {
        let s = 0;
        for (let j = 0; j <= floor(n * (1 - est)); j++) {
          const lch = -log(n + 1) - D().lbeta(n - j + 1, j + 1);
          s += exp(lch + (n - j) * log(1 - est - j / n) + (j - 1) * log(est + j / n));
        }
        p = est * s;
      }
    } else p = alternativa === 'bilateral' ? kolmogorovLimite(sqrt(n) * est, false, 1e-6) : exp(-2 * n * est * est);
    return { D: est, p: min(1, max(0, p)), exacta: !!exacta, empates, n };
  }

  /* ======================= varianzas ======================= */
  /** Grupos presentes de y según los códigos del factor (sin faltantes en ninguno de los dos). */
  function porGrupo(y, g) {
    const cod = g.codigos || g, mapa = new Map();
    for (let i = 0; i < y.length; i++) {
      const c = cod[i], v = y[i];
      if (c < 0 || Number.isNaN(v) || v === null) continue;
      if (!mapa.has(c)) mapa.set(c, []);
      mapa.get(c).push(i);
    }
    return [...mapa.keys()].sort((a, b) => a - b).map(c => ({ codigo: c, filas: mapa.get(c), valores: Float64Array.from(mapa.get(c), i => y[i]) }));
  }
  /** F de un ANOVA de una vía sobre z con los grupos dados. */
  function anovaUnaVia(gs) {
    const N = gs.reduce((s, g) => s + g.valores.length, 0), k = gs.length;
    const todos = new Float64Array(N);
    let o = 0;
    for (const g of gs) { todos.set(g.valores, o); o += g.valores.length; }
    const mg = SP.num.media(todos);
    let entre = 0, dentro = 0;
    for (const g of gs) {
      const m = SP.num.media(g.valores);
      entre += g.valores.length * (m - mg) * (m - mg);
      for (const v of g.valores) dentro += (v - m) * (v - m);
    }
    const gl1 = k - 1, gl2 = N - k, F = (entre / gl1) / (dentro / gl2);
    return { F, gl1, gl2, p: D().pf(F, gl1, gl2, false) };
  }
  function levene(y, g, centro) {
    centro = centro || 'mediana';
    const gs = porGrupo(y, g);
    exigir(gs.length >= 2, T('Para comparar varianzas hacen falta al menos dos grupos.'));
    const z = gs.map(gr => {
      const c = centro === 'media' ? SP.num.media(gr.valores) : SP.desc.mediana(gr.valores);
      return { valores: Float64Array.from(gr.valores, v => abs(v - c)) };
    });
    return Object.assign(anovaUnaVia(z), { centro });
  }
  function bartlett(y, g) {
    const gs = porGrupo(y, g), k = gs.length;
    exigir(k >= 2, T('Para comparar varianzas hacen falta al menos dos grupos.'));
    exigir(gs.every(x => x.valores.length >= 2), T('Bartlett necesita al menos dos observaciones en cada grupo.'));
    const ni = gs.map(x => x.valores.length - 1), vi = gs.map(x => SP.num.varianza(x.valores));
    const n = ni.reduce((s, v) => s + v, 0);
    const v = ni.reduce((s, d, i) => s + d * vi[i], 0) / n;
    const K2 = (n * log(v) - ni.reduce((s, d, i) => s + d * log(vi[i]), 0)) / (1 + (ni.reduce((s, d) => s + 1 / d, 0) - 1 / n) / (3 * (k - 1)));
    return { K2, gl: k - 1, p: D().pchisq(K2, k - 1, false) };
  }
  /** Rangos con empates promediados (como rank() de R). */
  function rangos(v) {
    /* ordenamiento nativo de una copia; el rango promedio de cada racha de iguales se guarda en su primer lugar y
       cada valor encuentra ese lugar por búsqueda binaria */
    const n = v.length, s = Float64Array.from(v).sort(), r = new Float64Array(n), prom = new Float64Array(n);
    for (let a = 0; a < n;) { let b = a + 1; while (b < n && s[b] === s[a]) b++; prom[a] = (a + b + 1) / 2; a = b; }
    for (let i = 0; i < n; i++) {
      const x = v[i];
      let lo = 0, hi = n;
      while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < x) lo = m + 1; else hi = m; }
      r[i] = prom[lo];
    }
    return r;
  }
  function fligner(y, g) {
    const gs = porGrupo(y, g), k = gs.length;
    exigir(k >= 2, T('Para comparar varianzas hacen falta al menos dos grupos.'));
    const centrados = [], grupo = [];
    gs.forEach((gr, j) => { const md = SP.desc.mediana(gr.valores); for (const v of gr.valores) { centrados.push(abs(v - md)); grupo.push(j); } });
    /* |x − mediana| redondeado a 12 cifras de la escala de los datos: 0.015 − 0.010 y 0.020 − 0.015 deben empatar, y un
       valor igual a su mediana debe dar 0, aunque la resta binaria deje ruido (fligner.test de R los ordena como
       distintos; ver docs/VALIDACION.md) */
    const escala = mayor(centrados), dec = escala > 0 ? Math.min(100, Math.max(0, 12 - ceil(Math.log10(escala)))) : 0;
    for (let i = 0; i < centrados.length; i++) centrados[i] = Number(centrados[i].toFixed(dec));
    const n = centrados.length, r = rangos(centrados);
    const a = Float64Array.from(r, v => D().qnorm((1 + v / (n + 1)) / 2));
    const suma = new Float64Array(k), cuenta = new Float64Array(k);
    for (let i = 0; i < n; i++) { suma[grupo[i]] += a[i]; cuenta[grupo[i]]++; }
    let est = 0;
    for (let j = 0; j < k; j++) est += suma[j] * suma[j] / cuenta[j];
    const ma = SP.num.media(a);
    est = (est - n * ma * ma) / SP.num.varianza(a);
    return { X2: est, gl: k - 1, p: D().pchisq(est, k - 1, false) };
  }

  /* ======================= aditividad (Tukey) ======================= */
  /**
   * Un grado de libertad de Tukey, como agricolae::nonadditivity: el modelo aditivo se ajusta a las medias
   * de celda; gl y cm son los del error del modelo completo (si faltan, los del aditivo y ~ f1 + f2).
   */
  function noAditividad(y, f1, f2, gl, cm) {
    const A = f1.codigos, B = f2.codigos, nA = f1.niveles.length, nB = f2.niveles.length;
    const suma = new Float64Array(nA * nB), cuenta = new Float64Array(nA * nB);
    for (let i = 0; i < y.length; i++) {
      if (A[i] < 0 || B[i] < 0 || Number.isNaN(y[i])) continue;
      suma[A[i] * nB + B[i]] += y[i]; cuenta[A[i] * nB + B[i]]++;
    }
    const celdas = [];
    for (let a = 0; a < nA; a++) for (let b = 0; b < nB; b++) { const k = a * nB + b; if (cuenta[k]) celdas.push({ a, b, m: suma[k] / cuenta[k], n: cuenta[k] }); }
    exigir(celdas.length > nA + nB - 1, T('Faltan combinaciones para probar la aditividad.'));
    const r = 1 / SP.num.media(Float64Array.from(celdas, c => 1 / c.n));
    /* ajuste aditivo de las medias de celda: m ~ A + B (mínimos cuadrados) */
    const cols = { m: celdas.map(c => c.m), a: celdas.map(c => f1.niveles[c.a]), b: celdas.map(c => f2.niveles[c.b]) };
    const tab = SP.tabla.crear(cols, { a: { tipo: 'factor', niveles: f1.niveles }, b: { tipo: 'factor', niveles: f2.niveles } });
    const aj = SP.lineal.ajustar(tab, 'm ~ a + b');
    const q = Float64Array.from(aj.ajustados, v => v * v);
    const tq = SP.tabla.crear({ q: Array.from(q), a: cols.a, b: cols.b }, { a: { tipo: 'factor', niveles: f1.niveles }, b: { tipo: 'factor', niveles: f2.niveles } });
    const N = SP.lineal.ajustar(tq, 'q ~ a + b').residuales, e = aj.residuales;
    /* residual ~ Nonadditivity (con intercepto) */
    const me = SP.num.media(e), mN = SP.num.media(N);
    let sxy = 0, sxx = 0;
    for (let i = 0; i < e.length; i++) { sxy += (N[i] - mN) * (e[i] - me); sxx += (N[i] - mN) * (N[i] - mN); }
    const beta = sxy / sxx, scReg = sxy * sxy / sxx;
    if (gl === undefined || cm === undefined) {
      const tr = SP.tabla.crear({ y: Array.from(y), a: Array.from(A, c => (c < 0 ? null : f1.niveles[c])), b: Array.from(B, c => (c < 0 ? null : f2.niveles[c])) },
        { a: { tipo: 'factor', niveles: f1.niveles }, b: { tipo: 'factor', niveles: f2.niveles } });
      const full = SP.lineal.ajustar(tr, 'y ~ a + b');
      gl = full.glResidual; cm = full.scResidual / gl;
    }
    const P = r * scReg / beta, Q = P / beta, Sna = P * P / Q;
    let sc = gl * cm, glr = gl;
    if (r === 1) { sc -= Sna; glr -= 1; }
    const scNa = r * scReg, F = scNa / (sc / glr);
    return { P, Q, sc_no_aditividad: scNa, sc_residual: sc, gl_residual: glr, F, p: D().pf(F, 1, glr, false), r };
  }
  /** Para la validación: con la tabla y los nombres de las columnas. */
  function noAditividadTabla(tabla, respuesta, f1, f2) {
    return noAditividad(tabla.col(respuesta).valores, SP.estructura.comoFactor(tabla, f1), SP.estructura.comoFactor(tabla, f2));
  }

  /* ======================= independencia ======================= */
  /**
   * Algoritmo AS 153 (Farebrother 1980; versión corregida de 1984, con el arreglo de Cummins de 1996):
   * P(Σ aᵢ uᵢ² < x Σ uᵢ² + c) con uᵢ normales estándar. a[0] debe ser x; a[1..m] ordenados.
   */
  function pan(a, m, c, N) {
    let h, k, iu;
    if (a[1] > a[m]) { h = m; k = -1; iu = 1; } else { h = 1; k = 1; iu = m; }
    const x = a[0];
    let nu, hallado = false;
    for (nu = h; k > 0 ? nu <= iu : nu >= iu; nu += k) if (a[nu] >= x) { hallado = true; break; }
    if (!hallado && c >= 0) return 1;
    if (nu === h && c <= 0) return 0;
    if (k === 1) nu = nu - 1;
    h = m - nu;
    let y = c === 0 ? h - nu : c * (a[1] - a[m]);
    let d, j1, j2, j3, j4;
    if (y >= 0) { d = 2; h = nu; k = -k; j1 = 0; j2 = 2; j3 = 3; j4 = 1; }
    else { d = -2; nu = nu + 1; j1 = m - 2; j2 = m - 1; j3 = m + 1; j4 = m; }
    const pin = 2 * atan(1) / N;
    let suma = 0.5 * (k + 1), sgn = k / N;
    const n2 = N + N - 1;
    for (let l1 = h - 2 * Math.trunc(h / 2); l1 >= 0; l1--) {
      for (let cnt = max(0, Math.trunc((nu - j2 + d) / d)), l2 = j2; cnt > 0; cnt--, l2 += d) {
        let s1 = a[j4];
        const prod0 = a[l2];
        const u = 0.5 * (s1 + prod0), v = 0.5 * (s1 - prod0);
        s1 = 0;
        for (let i = 1; i <= n2; i += 2) {
          y = u - v * cos(i * pin);
          const num = y - x;
          let prod = exp(-c / num);
          for (let kk = 1; kk <= j1; kk++) prod = prod * num / (y - a[kk]);
          for (let kk = j3; kk <= m; kk++) prod = prod * num / (y - a[kk]);
          s1 += sqrt(abs(prod));
        }
        sgn = -sgn;
        suma += sgn * s1;
        j1 += d; j3 += d; j4 += d;
      }
      if (d === 2) j3 = j3 - 1; else j1 = j1 + 1;
      j2 = 0; nu = 0;
    }
    return suma;
  }
  /** Valores propios de una matriz simétrica (Jacobi cíclico), de mayor a menor. */
  function valoresPropios(S, n) {
    const A = Float64Array.from(S);
    for (let barrido = 0; barrido < 100; barrido++) {
      let fuera = 0, total = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = A[i * n + j] * A[i * n + j]; total += v; if (i !== j) fuera += v; }
      if (fuera <= 1e-30 * total) break;
      for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q];
        if (abs(apq) < 1e-300) continue;
        const app = A[p * n + p], aqq = A[q * n + q];
        const theta = (aqq - app) / (2 * apq);
        const t = (theta >= 0 ? 1 : -1) / (abs(theta) + sqrt(theta * theta + 1));
        const c = 1 / sqrt(t * t + 1), s = t * c;
        for (let r = 0; r < n; r++) {
          const arp = A[r * n + p], arq = A[r * n + q];
          A[r * n + p] = c * arp - s * arq; A[r * n + q] = s * arp + c * arq;
        }
        for (let r = 0; r < n; r++) {
          const apr = A[p * n + r], aqr = A[q * n + r];
          A[p * n + r] = c * apr - s * aqr; A[q * n + r] = s * apr + c * aqr;
        }
      }
    }
    return Array.from({ length: n }, (_, i) => A[i * n + i]).sort((a, b) => b - a);
  }
  /**
   * Durbin-Watson de los residuos de un ajuste de SP.lineal.ajustar (matriz X de rango completo). alternativa: 'mayor' (autocorrelación positiva, la de omisión de R), 'menor' o
   * 'bilateral'. exacta: por omisión si n < 100 (AS 153 con 15 términos, como lmtest).
   */
  function durbinWatson(aj, alternativa, exacta, iteraciones) {
    alternativa = alternativa || 'mayor'; iteraciones = iteraciones || 15;
    const d = aj.qr, e = aj.residuales, X = aj.modelo.X;
    const n = e.length, k = d.rango;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { den += e[i] * e[i]; if (i) num += (e[i] - e[i - 1]) ** 2; }
    const dw = num / den;
    if (exacta === undefined || exacta === null) exacta = n < 100;
    if (n < 3) return { DW: dw, p: 1, exacta: false, n };
    let p = NaN;
    if (exacta) {
      /* Q₁ (n × k): columnas de Q; M = I − Q₁Q₁ᵀ; los valores propios no nulos de M·A = los de M·A·M */
      const Q = [];
      for (let j = 0; j < k; j++) { const z = new Float64Array(n); z[j] = 1; Q.push(SP.algebra.qz(d, z)); }
      const M = new Float64Array(n * n);
      for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
        let s = i === j ? 1 : 0;
        for (let l = 0; l < k; l++) s -= Q[l][i] * Q[l][j];
        M[i * n + j] = M[j * n + i] = s;
      }
      /* A·M: A es la matriz de diferencias de Durbin-Watson */
      const AM = new Float64Array(n * n);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const diag = i === 0 || i === n - 1 ? 1 : 2;
        let s = diag * M[i * n + j];
        if (i > 0) s -= M[(i - 1) * n + j];
        if (i < n - 1) s -= M[(i + 1) * n + j];
        AM[i * n + j] = s;
      }
      const MAM = new Float64Array(n * n);
      for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
        let s = 0;
        for (let l = 0; l < n; l++) s += M[i * n + l] * AM[l * n + j];
        MAM[i * n + j] = MAM[j * n + i] = s;
      }
      const ev = valoresPropios(MAM, n).slice(0, n - k).filter(v => v > 1e-10);
      const pdw = pan([dw, ...ev], ev.length, 0, iteraciones);
      p = alternativa === 'bilateral' ? 2 * min(pdw, 1 - pdw) : alternativa === 'menor' ? 1 - pdw : pdw;
      if (!(p >= 0 && p <= 1)) exacta = false;
    }
    let media = NaN, varianza = NaN;
    if (!exacta) {
      /* media y varianza exactas de DW bajo independencia (como lmtest con n ≥ 100):
           P = 2(n − 1) − tr(XᵀAX·V),  Q = 2(3n − 4) − 2·tr((AX)ᵀ(AX)·V) + tr((XᵀAX·V)²),  V = (XᵀX)⁻¹.
         Como A = ΔᵀΔ (Δ: diferencias de filas vecinas), XᵀAX = Σ dₜdₜᵀ con dₜ = xₜ₊₁ − xₜ, y la fila t de AX es
         dₜ₋₁ − dₜ. Con factores, dₜ tiene pocas entradas distintas de cero: se suman solo esas (mismo resultado). */
      const piv = d.pivote, col = j => piv[j] * n;
      const V = SP.algebra.rtrInversa(d);           // (XᵀX)⁻¹ en el orden del pivoteo, k × k (por columnas)
      const XAX = new Float64Array(k * k), AXAX = new Float64Array(k * k);
      const dPrev = new Float64Array(k), dAct = new Float64Array(k), ax = new Float64Array(k);
      const idx = new Int32Array(k), idxAx = new Int32Array(k);
      for (let t = 0; t < n; t++) {
        /* dₜ (0 en la última fila) */
        let m = 0;
        for (let j = 0; j < k; j++) {
          const v = t < n - 1 ? X[col(j) + t + 1] - X[col(j) + t] : 0;
          dAct[j] = v;
          if (v !== 0) idx[m++] = j;
        }
        for (let a = 0; a < m; a++) { const ia = idx[a], va = dAct[ia]; for (let b = 0; b < m; b++) XAX[ia + idx[b] * k] += va * dAct[idx[b]]; }
        /* fila t de AX = dₜ₋₁ − dₜ (con d₋₁ = 0) */
        let q = 0;
        for (let j = 0; j < k; j++) { const v = dPrev[j] - dAct[j]; ax[j] = v; if (v !== 0) idxAx[q++] = j; }
        for (let a = 0; a < q; a++) { const ia = idxAx[a], va = ax[ia]; for (let b = 0; b < q; b++) AXAX[ia + idxAx[b] * k] += va * ax[idxAx[b]]; }
        dPrev.set(dAct);
      }
      const prod = (P1, P2) => { const C = new Float64Array(k * k); for (let a = 0; a < k; a++) for (let l = 0; l < k; l++) { const v = P1[a + l * k]; if (v === 0) continue; for (let b = 0; b < k; b++) C[a + b * k] += v * P2[l + b * k]; } return C; };
      const traza = M2 => { let s = 0; for (let j = 0; j < k; j++) s += M2[j + j * k]; return s; };
      const XAXQ = prod(XAX, V);
      const P = 2 * (n - 1) - traza(XAXQ);
      const Qv = 2 * (3 * n - 4) - 2 * traza(prod(AXAX, V)) + traza(prod(XAXQ, XAXQ));
      media = P / (n - k); varianza = 2 / ((n - k) * (n - k + 2)) * (Qv - P * media);
      const s = sqrt(varianza);
      p = alternativa === 'bilateral' ? 2 * D().pnorm(abs(dw - media), 0, s, false)
        : alternativa === 'menor' ? D().pnorm(dw, media, s, false) : D().pnorm(dw, media, s);
    }
    return { DW: dw, p, exacta: !!exacta, n, media, varianza };
  }
  /** Ajusta el modelo y aplica Durbin-Watson a sus residuos, en el orden de las filas. */
  function durbinWatsonModelo(tabla, formula, alternativa, exacta) {
    return durbinWatson(SP.lineal.ajustar(tabla, formula), alternativa, exacta);
  }
  /** Prueba de rachas arriba y abajo de la mediana (como randtests::runs.test). */
  function rachas(xs, alternativa, exacta) {
    alternativa = alternativa || 'bilateral';
    const x0 = SP.num.sinFaltantes(xs), umbral = SP.desc.mediana(x0);
    const s = Array.from(x0).filter(v => v !== umbral).map(v => (v > umbral ? 1 : -1));
    const n1 = s.filter(v => v > 0).length, n2 = s.length - n1, n = n1 + n2;
    exigir(n1 > 0 && n2 > 0, T('Todos los valores quedan del mismo lado de la mediana.'));
    let r = s.length ? 1 : 0;
    for (let i = 1; i < s.length; i++) if (s[i] !== s[i - 1]) r++;
    const mu = 1 + 2 * n1 * n2 / n, vr = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2) / (n * n * (n - 1)), z = (r - mu) / sqrt(vr);
    let p;
    if (exacta) {
      const lch = (a, b) => (b < 0 || b > a ? -Infinity : -log(a + 1) - D().lbeta(a - b + 1, b + 1));
      const total = lch(n, n1);
      const druns = x => (x % 2 === 0
        ? log(2) + lch(n1 - 1, x / 2 - 1) + lch(n2 - 1, x / 2 - 1)
        : log(exp(lch(n1 - 1, (x - 1) / 2) + lch(n2 - 1, (x - 3) / 2)) + exp(lch(n1 - 1, (x - 3) / 2) + lch(n2 - 1, (x - 1) / 2)))) - total;
      const prob = x => exp(druns(x));
      let bajo = 0, alto = 0;
      for (let x = 1; x <= r; x++) bajo += prob(x);
      for (let x = r; x <= n; x++) alto += prob(x);
      p = alternativa === 'bilateral' ? min(1, 2 * min(bajo, alto)) : alternativa === 'menor' ? bajo - prob(1) : alto;
    } else {
      const p0 = D().pnorm(z);
      p = alternativa === 'bilateral' ? 2 * min(p0, 1 - p0) : alternativa === 'menor' ? p0 : 1 - p0;
    }
    return { rachas: r, n1, n2, z, p, media: mu, varianza: vr, exacta: !!exacta };
  }

  /* ======================= atípicos e influencia ======================= */
  /** Palancas (hᵢᵢ) y residuos de un ajuste de SP.lineal.ajustar. */
  function influencia(aj) {
    const d = aj.qr, n = aj.modelo.n, k = d.rango, X = aj.modelo.X;    // n del modelo: la QR puede ser la de las celdas
    const R = new Float64Array(k * k);
    for (let i = 0; i < k; i++) for (let j = i; j < k; j++) R[i * k + j] = SP.algebra.elemR(d, i, j);
    const h = new Float64Array(n), u = new Float64Array(k), piv = d.pivote;
    /* Rᵀ u = x_i (columnas en el orden del pivoteo) y h = ‖u‖². La palanca solo depende de la fila de X: en un
       diseño con factores se calcula una vez por celda (las filas se agrupan por dos sumas al azar y se comprueba
       que sean idénticas antes de reutilizar el valor) */
    const r1 = Array.from({ length: k }, (_, j) => Math.sin(j + 1) * 1e3), r2 = Array.from({ length: k }, (_, j) => Math.cos(3 * j + 2) * 1e3);
    const rapida = i => {
      let s2 = 0;
      for (let j = 0; j < k; j++) {
        let s = X[piv[j] * n + i];
        for (let l = 0; l < j; l++) s -= R[l * k + j] * u[l];
        u[j] = s / R[j * k + j];
        s2 += u[j] * u[j];
      }
      return s2;
    };
    const vistos = new Map();
    if (aj.grupos) {
      const hg = Float64Array.from(aj.grupos.rep, i => rapida(i));
      for (let i = 0; i < n; i++) h[i] = hg[aj.grupos.g[i]];
    } else for (let i = 0; i < n; i++) {
      let a = 0, b = 0;
      for (let j = 0; j < k; j++) { const v = X[piv[j] * n + i]; a += v * r1[j]; b += v * r2[j]; }
      const clave = a + '|' + b, rep = vistos.get(clave);
      if (rep !== undefined) {
        let igual = true;
        for (let j = 0; j < k && igual; j++) igual = X[piv[j] * n + i] === X[piv[j] * n + rep];
        if (igual) { h[i] = h[rep]; continue; }
      }
      let s2 = 0;
      for (let j = 0; j < k; j++) {
        let s = X[piv[j] * n + i];
        for (let l = 0; l < j; l++) s -= R[l * k + j] * u[l];
        u[j] = s / R[j * k + j];
        s2 += u[j] * u[j];
      }
      h[i] = s2;
      if (rep === undefined && vistos.size < 50000) vistos.set(clave, i);
    }
    const e = aj.residuales, gl = n - k, sce = aj.scResidual, s = sqrt(sce / gl);
    const rstandard = new Float64Array(n), rstudent = new Float64Array(n), cook = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const uno = 1 - h[i];
      if (uno < 1e-10) { rstandard[i] = rstudent[i] = cook[i] = NaN; continue; }
      rstandard[i] = e[i] / (s * sqrt(uno));
      const si = sqrt((sce - e[i] * e[i] / uno) / (gl - 1));
      rstudent[i] = e[i] / (si * sqrt(uno));
      cook[i] = (e[i] / (s * uno)) ** 2 * h[i] / k;
    }
    return { palanca: h, rstandard, rstudent, cook, gl, s };
  }
  function influenciaModelo(tabla, formula) {
    const r = influencia(SP.lineal.ajustar(tabla, formula));
    return { palanca: Array.from(r.palanca), rstandard: Array.from(r.rstandard), rstudent: Array.from(r.rstudent), cook: Array.from(r.cook) };
  }
  /** Mayor residuo estudentizado y su p con Bonferroni (como car::outlierTest). */
  function atipicoDe(inf, filas) {
    const n = inf.rstudent.length, gl = inf.gl - 1;
    let i0 = -1;
    for (let i = 0; i < n; i++) if (Number.isFinite(inf.rstudent[i]) && (i0 < 0 || abs(inf.rstudent[i]) > abs(inf.rstudent[i0]))) i0 = i;
    const t = inf.rstudent[i0], p = 2 * D().pt(abs(t), gl, false);
    return { fila: filas ? filas[i0] : i0, rstudent: t, p, bonferroni: min(1, n * p), gl };
  }
  function atipicoModelo(tabla, formula) {
    const aj = SP.lineal.ajustar(tabla, formula), r = atipicoDe(influencia(aj), aj.modelo.filas);
    return { fila: r.fila + 1, rstudent: r.rstudent, p: r.p, bonferroni: r.bonferroni, gl: r.gl };
  }
  /** Grubbs (un atípico, la cola del valor más alejado), como outliers::grubbs.test. */
  function grubbs(xs) {
    const x = ordenado(xs), n = x.length;
    exigir(n >= 3, T('Grubbs necesita al menos 3 observaciones.'));
    const m = SP.num.media(x), s = sqrt(SP.num.varianza(x));
    const bajo = (x[n - 1] - m) < (m - x[0]);
    const o = bajo ? x[0] : x[n - 1], resto = bajo ? x.subarray(1) : x.subarray(0, n - 1);
    const Gv = abs(o - m) / s, U = SP.num.varianza(resto) / SP.num.varianza(x) * (n - 2) / (n - 1);
    const sv = (Gv * Gv * n * (2 - n)) / (Gv * Gv * n - (n - 1) * (n - 1));
    const p = sv >= 0 ? min(1, n * D().pt(sqrt(sv), n - 2, false)) : 0;
    return { G: Gv, U, p, valor: o, extremo: bajo ? 'menor' : 'mayor' };
  }
  /** Los cinco números de Tukey (fivenum de R). */
  function cincoNumeros(s) {
    const n = s.length;
    if (!n) return [NaN, NaN, NaN, NaN, NaN];
    const n4 = floor((n + 3) / 2) / 2;
    return [1, n4, (n + 1) / 2, n + 1 - n4, n].map(dd => 0.5 * (s[floor(dd) - 1] + s[ceil(dd) - 1]));
  }
  /** Bigotes, bisagras y valores fuera de las cercas (como boxplot.stats con coef = 1.5). */
  function cercasTukey(xs, coef) {
    coef = coef === undefined ? 1.5 : coef;
    const v = SP.num.sinFaltantes(xs), s = Float64Array.from(v).sort();
    const st = cincoNumeros(s), ric = st[3] - st[1];
    const lo = st[1] - coef * ric, hi = st[3] + coef * ric;
    const fuera = Array.from(v).filter(x => x < lo || x > hi);
    if (fuera.length) {
      const dentro = Array.from(s).filter(x => !(x < lo || x > hi));
      st[0] = dentro[0]; st[4] = dentro[dentro.length - 1];
    }
    return { estadisticos: st, fuera, cerca_inferior: lo, cerca_superior: hi };
  }
  /** Puntos de graficación (ppoints de R) y banda por estadísticos de orden de la normal estándar. */
  function bandaQQ(n, nivel) {
    nivel = nivel || 0.95;
    const a = n <= 10 ? 3 / 8 : 1 / 2, al = (1 - nivel) / 2;
    const teorico = [], inf = [], sup = [];
    for (let i = 1; i <= n; i++) {
      teorico.push(D().qnorm((i - a) / (n + 1 - 2 * a)));
      inf.push(D().qnorm(D().qbeta(al, i, n - i + 1)));
      sup.push(D().qnorm(D().qbeta(1 - al, i, n - i + 1)));
    }
    return { teorico, inf, sup };
  }

  /* ======================= método: revisar los supuestos ======================= */
  /*
     Reglas del semáforo (las mismas en el código R de referencia de las pruebas):
       verde  p ≥ α         ámbar  α/5 ≤ p < α (con α = 0.05: entre 0.01 y 0.05)         rojo  p < α/5
     Prueba que decide cada renglón:
       normalidad     Shapiro-Wilk de los residuos (Anderson-Darling si n > 5000). Si n ≥ 50 y la forma es
                      casi normal (|G₁| < 0.5 y |G₂| < 1), el renglón no pasa de ámbar: con muchas observaciones
                      cualquier desviación es significativa y el ANOVA la tolera.
       varianzas      Brown-Forsythe (Levene con la mediana) de los residuos por tratamiento; es la más robusta
                      a la falta de normalidad. Sin tratamientos no aplica.
       aditividad     un grado de libertad de Tukey, solo con bloques y tratamientos.
       independencia  Durbin-Watson (autocorrelación positiva) de los residuos en el orden de las filas o de la
                      columna elegida.
       atípicos       el mayor residuo estudentizado con la corrección de Bonferroni.
     El color global es el peor de los renglones. */
  const lista = v => (v === undefined || v === null || v === '' ? [] : Array.isArray(v) ? v : [v]);
  const nombreR = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  function color(p, alfa) { return !Number.isFinite(p) ? 'gris' : p >= alfa ? 'verde' : p >= alfa / 5 ? 'ambar' : 'rojo'; }
  const PEOR = { gris: 0, verde: 1, ambar: 2, rojo: 3 };

  /** Tabla para el modelo: factores (también las dosis numéricas) y, si se pide, filas ordenadas por una columna. */
  function tablaDelModelo(tabla, e) {
    const cols = {}, tipos = {}, n = tabla.n;
    let orden = Array.from({ length: n }, (_, i) => i);
    if (e.orden) {
      const o = tabla.col(e.orden).valores;
      orden.sort((a, b) => (Number.isNaN(o[a]) ? 1 : 0) - (Number.isNaN(o[b]) ? 1 : 0) || o[a] - o[b] || a - b);
    }
    cols[e.respuesta] = Array.from(orden, i => tabla.col(e.respuesta).valores[i]); tipos[e.respuesta] = { tipo: 'numerica' };
    for (const f of [e.bloque, ...lista(e.tratamientos)].filter(Boolean)) {
      const F = SP.estructura.comoFactor(tabla, f);
      cols[f] = Array.from(orden, i => (F.codigos[i] < 0 ? null : F.niveles[F.codigos[i]])); tipos[f] = { tipo: 'factor', niveles: F.niveles };
    }
    return { tab: SP.tabla.crear(cols, tipos), orden };
  }

  /**
   * Ajuste del modelo. Con 2000 filas o más y pocas filas distintas en X (un diseño solo con factores), se ajusta
   * por celdas (SP.algebra.minimosCuadradosAgrupados): mismos coeficientes, residuos y palancas, en O(n·p) en
   * lugar de O(n·p²). Con menos filas, la QR completa (la necesita el p exacto de Durbin-Watson).
   */
  function ajustarModelo(tab, formula) {
    const mm = SP.formula.matrizModelo(tab, formula);
    for (let i = 0; i < mm.X.length; i++) { const v = mm.X[i]; if (v - v !== 0) throw new SP.ErrorSP(T('Hay valores infinitos en las variables del modelo.')); }
    for (let i = 0; i < mm.n; i++) { const v = mm.y[i]; if (v - v !== 0) throw new SP.ErrorSP(T('Hay valores infinitos en la respuesta.')); }
    const gr = mm.n >= 2000 ? SP.algebra.agruparFilas(mm.X, mm.n, mm.p, 0.25) : null;
    const mc = gr ? SP.algebra.minimosCuadradosAgrupados(mm.X, mm.n, mm.p, mm.y, gr, 1e-7) : SP.algebra.minimosCuadrados(mm.X, mm.n, mm.p, mm.y, 1e-7);
    return Object.assign({ modelo: mm, glResidual: mm.n - mc.qr.rango, rango: mc.qr.rango }, mc);
  }

  function revisarSupuestos(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    const trs = lista(e.tratamientos);
    exigir(trs.length <= 3, T('Hasta tres factores de tratamiento.'));
    for (const c of [e.bloque, e.orden, ...trs].filter(Boolean)) exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c }));
    exigir(!trs.includes(e.bloque) && !trs.includes(e.respuesta) && e.bloque !== e.respuesta, T('Una columna no puede tener dos papeles en el modelo.'));
    if (e.orden) exigir(tabla.col(e.orden).tipo === 'numerica', T('La columna del orden debe ser numérica o una fecha.'));
    exigir(op.alfa > 0 && op.alfa < 0.5, T('El nivel de significancia va entre 0 y 0.5.'));
  }

  function calcularSupuestos(tabla, e, op) {
    const alfa = op.alfa, trs = lista(e.tratamientos);
    const { tab, orden } = tablaDelModelo(tabla, e);
    const derecha = [e.bloque ? nombreR(e.bloque) : '', trs.map(nombreR).join(' * ')].filter(Boolean).join(' + ') || '1';
    const formula = nombreR(e.respuesta) + ' ~ ' + derecha;
    const aj = ajustarModelo(tab, formula), mm = aj.modelo, n = mm.n;
    exigir(aj.glResidual >= 2, T('Quedan muy pocos grados de libertad del error ({g}) para revisar los supuestos.', { g: aj.glResidual }),
      T('Hacen falta repeticiones: con una sola observación por tratamiento no hay error que revisar.'));
    const filaOriginal = k => orden[mm.filas[k]];
    const res = aj.residuales, y = mm.y;
    /* las rachas y las cercas usan los residuos redondeados a 12 cifras de su escala: así un empate exacto de los
       datos (o un residuo igual a la mediana) no se rompe por el ruido del ajuste (≈ 1e-15), distinto en cada programa */
    let maxRes = 0; for (const v of res) if (abs(v) > maxRes) maxRes = abs(v);
    const dec12 = maxRes > 0 ? Math.min(100, Math.max(0, 12 - ceil(Math.log10(maxRes)))) : 0;
    const res12 = Float64Array.from(res, v => Number(v.toFixed(dec12)));
    const out = { formula, n, excluidas: tabla.n - n, gl_residual: aj.glResidual, cm_error: aj.scResidual / aj.glResidual, alfa };

    /* normalidad de los residuos */
    const nor = { shapiro: null, lilliefors: null, anderson: null };
    if (n >= 3 && n <= 5000) nor.shapiro = shapiro(res);
    if (n >= 5) nor.lilliefors = lilliefors(res);
    if (n >= 8) nor.anderson = andersonDarling(res);
    nor.asimetria = n >= 3 ? asimetriaDe2(res) : NaN; nor.curtosis = n >= 4 ? curtosisDe2(res) : NaN;
    nor.principal = nor.shapiro ? 'shapiro' : nor.anderson ? 'anderson' : null;
    out.normalidad = nor;

    /* varianzas: residuos por combinación de tratamientos */
    let codTrat = null, nivTrat = null;
    if (trs.length) {
      const facs = trs.map(f => SP.estructura.comoFactor(tab, f));
      const clave = new Map();
      nivTrat = []; codTrat = new Int32Array(n);
      for (let k = 0; k < n; k++) {
        const i = mm.filas[k], et = facs.map(f => f.niveles[f.codigos[i]]).join(' · ');
        if (!clave.has(et)) { clave.set(et, nivTrat.length); nivTrat.push(et); }
        codTrat[k] = clave.get(et);
      }
      /* niveles en el orden anidado de los factores */
      const ordenNiv = nivTrat.map((et, j) => j).sort((a, b) => {
        const pa = nivTrat[a].split(' · '), pb = nivTrat[b].split(' · ');
        for (let f = 0; f < facs.length; f++) { const d = facs[f].niveles.indexOf(pa[f]) - facs[f].niveles.indexOf(pb[f]); if (d) return d; }
        return 0;
      });
      const nuevo = new Int32Array(nivTrat.length); ordenNiv.forEach((j, k) => { nuevo[j] = k; });
      nivTrat = ordenNiv.map(j => nivTrat[j]); codTrat = codTrat.map(c => nuevo[c]);
      const g = { codigos: codTrat, niveles: nivTrat };
      const gs = porGrupo(res, g);
      if (gs.length >= 2 && gs.every(x => x.valores.length >= 2)) {
        const vari = gs.map(x => SP.num.varianza(x.valores));
        out.varianzas = {
          grupos: nivTrat, n_grupo: gs.map(x => x.valores.length), varianza_grupo: vari,
          razon_max_min: mayor(vari) / menor(vari),
          levene: levene(res, g, 'media'), brown_forsythe: levene(res, g, 'mediana'), bartlett: bartlett(res, g), fligner: fligner(res, g),
        };
      } else out.varianzas = null;
    } else out.varianzas = null;

    /* aditividad: bloque × tratamiento */
    out.aditividad = null;
    if (e.bloque && codTrat) {
      const B = SP.estructura.comoFactor(tab, e.bloque);
      const f1 = { codigos: Int32Array.from({ length: n }, (_, k) => B.codigos[mm.filas[k]]), niveles: B.niveles };
      const f2 = { codigos: codTrat, niveles: nivTrat };
      try { out.aditividad = noAditividad(y, f1, f2, aj.glResidual, aj.scResidual / aj.glResidual); } catch (err) { out.aditividad = null; }
    }

    /* independencia, en el orden de las filas (o de la columna elegida) */
    out.independencia = {
      orden: e.orden || null,
      durbin_watson: durbinWatson(aj, 'mayor'),
      rachas: (() => { try { return rachas(res12, 'bilateral', n < 30); } catch (err) { return null; } })(),
    };

    /* atípicos e influencia */
    const inf = influencia(aj), at = atipicoDe(inf);
    let ic = -1;
    for (let k = 0; k < n; k++) if (Number.isFinite(inf.cook[k]) && (ic < 0 || inf.cook[k] > inf.cook[ic])) ic = k;
    const ce = cercasTukey(res12);
    out.atipicos = {
      fila: filaOriginal(at.fila) + 1, rstudent: at.rstudent, p: at.p, bonferroni: at.bonferroni, gl: at.gl,
      cook_max: inf.cook[ic], cook_fila: filaOriginal(ic) + 1, cook_mayores: Array.from(inf.cook).filter(v => v > 4 / n).length,
      palanca_max: mayor(inf.palanca), fuera_cercas: ce.fuera.length,
    };

    /* semáforo */
    const pNor = nor.principal ? nor[nor.principal].p : NaN;
    let cNor = color(pNor, alfa);
    const formaLeve = n >= 50 && Math.abs(nor.asimetria) < 0.5 && Math.abs(nor.curtosis) < 1;
    if (cNor === 'rojo' && formaLeve) cNor = 'ambar';
    const sem = [
      { clave: 'normalidad', color: cNor, p: pNor, prueba: nor.principal, forma_leve: cNor !== 'verde' && formaLeve },
      { clave: 'varianzas', color: out.varianzas ? color(out.varianzas.brown_forsythe.p, alfa) : 'gris', p: out.varianzas ? out.varianzas.brown_forsythe.p : NaN, prueba: 'brown_forsythe' },
      { clave: 'aditividad', color: out.aditividad ? color(out.aditividad.p, alfa) : 'gris', p: out.aditividad ? out.aditividad.p : NaN, prueba: 'tukey' },
      { clave: 'independencia', color: color(out.independencia.durbin_watson.p, alfa), p: out.independencia.durbin_watson.p, prueba: 'durbin_watson' },
      { clave: 'atipicos', color: color(at.bonferroni, alfa), p: at.bonferroni, prueba: 'bonferroni' },
    ];
    out.semaforo = sem;
    out.global = sem.reduce((g, s) => (PEOR[s.color] > PEOR[g] ? s.color : g), 'verde');

    /* Box-Cox cuando la forma o las varianzas fallan y la respuesta es positiva */
    out.boxcox = null;
    let minY = Infinity; for (let k = 0; k < n; k++) if (y[k] < minY) minY = y[k];
    if ((sem[0].color !== 'verde' || sem[1].color !== 'verde') && minY > 0) {
      try { const b = SP.transformar.boxcox(tab, e.respuesta, formula, { modelo: mm, grupos: aj.grupos }); out.boxcox = { lambda: b.lambda, ic: b.ic, sugerencia: b.sugerencia }; } catch (err) { out.boxcox = null; }
    }
    /* naturaleza de la respuesta, para las recomendaciones */
    let enteros = true, max100 = true;
    for (let k = 0; k < n; k++) { if (y[k] < 0 || y[k] !== Math.floor(y[k])) enteros = false; if (y[k] < 0 || y[k] > 100) max100 = false; }
    /* porcentaje o proporción: el nombre lo dice y los valores caben en [0, 100] */
    const nombrePct = /(porc|pct|%|germin|incid|sever|mortal|sobreviv|cobert|prop)/i.test(e.respuesta);
    out.respuesta_tipo = enteros && minY >= 0 && !nombrePct ? 'conteos' : max100 && minY >= 0 && nombrePct ? 'porcentajes' : 'continua';
    out.un_factor = trs.length === 1 && !e.bloque;

    /* datos de las gráficas: Q-Q de los residuos estandarizados (adelgazado si hay muchos) y residuos */
    const rs = inf.rstandard, idxQ = [];
    for (let k = 0; k < n; k++) if (Number.isFinite(rs[k])) idxQ.push(k);
    const ordQ = Int32Array.from(idxQ).sort((a, b) => rs[a] - rs[b]);
    const m = ordQ.length, a0 = m <= 10 ? 3 / 8 : 1 / 2, al = (1 - op.nivel) / 2;
    /* puntos: todos si son pocos, si no ~600 más las colas completas; banda exacta en ≤ 150 posiciones */
    const qq = { teorico: [], observado: [], fila: [], banda: { teorico: [], inf: [], sup: [] } };
    const pasoP = Math.max(1, Math.ceil(m / 600)), cola = Math.min(m, 25);
    for (let i = 1; i <= m; i += (i <= cola || i > m - cola ? 1 : pasoP)) {
      qq.teorico.push(D().qnorm((i - a0) / (m + 1 - 2 * a0)));
      qq.observado.push(rs[ordQ[i - 1]]); qq.fila.push(filaOriginal(ordQ[i - 1]) + 1);
    }
    const pasoB = Math.max(1, Math.ceil(m / 150));
    for (let i = 1; i <= m; i += (i === 1 || i >= m - pasoB ? 1 : pasoB)) {
      qq.banda.teorico.push(D().qnorm((i - a0) / (m + 1 - 2 * a0)));
      qq.banda.inf.push(D().qnorm(D().qbeta(al, i, m - i + 1))); qq.banda.sup.push(D().qnorm(D().qbeta(1 - al, i, m - i + 1)));
    }
    out.graficas = { qq, ajustados: Array.from(aj.ajustados), residuos: Array.from(inf.rstandard), filas: Array.from(mm.filas, k => orden[k] + 1) };
    return out;
  }
  /* G₁ y G₂ de los residuos (los mismos de los descriptivos) */
  const asimetriaDe2 = v => SP.desc.asimetria ? SP.desc.asimetria(v, 2) : NaN;
  const curtosisDe2 = v => SP.desc.curtosis ? SP.desc.curtosis(v, 2) : NaN;

  /* ---------------- reporte ---------------- */
  const NOMBRE = { normalidad: 'Normalidad de los residuos', varianzas: 'Varianzas iguales entre tratamientos', aditividad: 'Aditividad bloque × tratamiento',
    independencia: 'Independencia de los residuos', atipicos: 'Valores atípicos' };
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3) : '—');
  function veredicto(s, r) {
    const ok = s.color === 'verde';
    switch (s.clave) {
      case 'normalidad': return s.color === 'gris' ? T('Muy pocas observaciones para probarla.')
        : ok ? T('Los residuos son compatibles con una distribución normal ({t}, p {p}).', { t: s.prueba === 'shapiro' ? 'Shapiro-Wilk' : 'Anderson-Darling', p: fp(s.p) })
        : s.forma_leve ? T('La prueba rechaza (p {p}), pero la forma es casi normal (G₁ = {a}, G₂ = {c}): con {n} residuos es una desviación pequeña.', { p: fp(s.p), a: f3(r.normalidad.asimetria), c: f3(r.normalidad.curtosis), n: r.n })
        : T('Los residuos se alejan de la normal ({t}, p {p}; G₁ = {a}, G₂ = {c}).', { t: s.prueba === 'shapiro' ? 'Shapiro-Wilk' : 'Anderson-Darling', p: fp(s.p), a: f3(r.normalidad.asimetria), c: f3(r.normalidad.curtosis) });
      case 'varianzas': return s.color === 'gris' ? T('No aplica: hacen falta tratamientos con al menos dos observaciones cada uno.')
        : ok ? T('Las varianzas de los tratamientos son homogéneas (Brown-Forsythe, p {p}; la mayor es {k} veces la menor).', { p: fp(s.p), k: r.varianzas.razon_max_min.toFixed(1) })
        : T('Las varianzas difieren entre tratamientos (Brown-Forsythe, p {p}; la mayor es {k} veces la menor).', { p: fp(s.p), k: r.varianzas.razon_max_min.toFixed(1) });
      case 'aditividad': return s.color === 'gris' ? T('No aplica: se revisa en diseños con bloques y tratamientos.')
        : ok ? T('Los efectos de bloque y tratamiento se suman (Tukey, p {p}).', { p: fp(s.p) })
        : T('Hay no aditividad bloque × tratamiento (Tukey, p {p}): el efecto de los tratamientos cambia con el nivel del bloque.', { p: fp(s.p) });
      case 'independencia': return ok ? T('Sin autocorrelación de los residuos en el orden {o} (Durbin-Watson = {d}, p {p}).', { o: r.independencia.orden ? T('de «{c}»', { c: r.independencia.orden }) : T('de las filas'), d: f3(r.independencia.durbin_watson.DW), p: fp(s.p) })
        : T('Los residuos vecinos se parecen (Durbin-Watson = {d}, p {p}) en el orden {o}.', { o: r.independencia.orden ? T('de «{c}»', { c: r.independencia.orden }) : T('de las filas'), d: f3(r.independencia.durbin_watson.DW), p: fp(s.p) });
      case 'atipicos': return ok ? T('Ningún residuo es atípico (el mayor residuo estudentizado, {t} en la fila {f}, tiene p de Bonferroni {p}).', { t: f3(r.atipicos.rstudent), f: r.atipicos.fila, p: fp(s.p) })
        : T('La fila {f} es atípica: residuo estudentizado {t}, p de Bonferroni {p}.', { f: r.atipicos.fila, t: f3(r.atipicos.rstudent), p: fp(s.p) });
    }
    return '';
  }
  function recomendaciones(r) {
    const s = Object.fromEntries(r.semaforo.map(x => [x.clave, x.color])), rec = [];
    const malo = c => c === 'rojo' || c === 'ambar';
    if (r.global === 'verde') rec.push(T('Los supuestos se cumplen razonablemente: el análisis de varianza y las comparaciones de medias serán confiables.'));
    if ((malo(s.normalidad) || malo(s.varianzas)) && r.boxcox) {
      const sug = { ninguna: T('ninguna transformación'), raiz: T('la raíz cuadrada'), log: T('el logaritmo'), 'reciproco de la raiz': T('el recíproco de la raíz'), reciproco: T('el recíproco'), cuadrado: T('el cuadrado') }[r.boxcox.sugerencia.transformacion];
      rec.push(T('Box-Cox con este modelo estima λ = {l} (IC 95 %: {a} a {b}); sugiere {s}. Transfórmala en el bloque Datos (la columna original no cambia) y vuelve a revisar.',
        { l: f3(r.boxcox.lambda), a: f3(r.boxcox.ic[0]), b: f3(r.boxcox.ic[1]), s: sug }));
    }
    if ((malo(s.normalidad) || malo(s.varianzas)) && r.respuesta_tipo === 'conteos') rec.push(T('La respuesta son conteos: √(x + 0.5) suele igualar las varianzas; un modelo de Poisson o binomial negativo (Fase 2) los trata directamente.'));
    if ((malo(s.normalidad) || malo(s.varianzas)) && r.respuesta_tipo === 'porcentajes') rec.push(T('Si la respuesta es un porcentaje, el arcoseno de la raíz lo estabiliza; un modelo binomial (Fase 2) es la opción directa.'));
    if (malo(s.varianzas) && r.un_factor) rec.push(T('Con varianzas distintas y un solo factor, el ANOVA de Welch (Hito 1.6) o la prueba de Kruskal-Wallis (Hito 1.5) no suponen varianzas iguales.'));
    if (malo(s.varianzas) && !r.un_factor && !r.boxcox) rec.push(T('Con varianzas distintas en un diseño de varios factores o con bloques, la vía es transformar la respuesta o un modelo que permita varianzas distintas (Fase 2).'));
    if (malo(s.normalidad) && !malo(s.varianzas)) rec.push(r.n >= 30
      ? T('Con {n} residuos y varianzas homogéneas, el ANOVA es robusto a esta falta de normalidad; reporta la prueba y una transformación como verificación.', { n: r.n })
      : T('Con pocos residuos, compara con una prueba no paramétrica (Kruskal-Wallis o, con bloques, Friedman; Hito 1.5).'));
    if (malo(s.aditividad)) rec.push(T('Para quitar la no aditividad suele bastar el logaritmo (vuelve aditivo un efecto multiplicativo); con repeticiones dentro de cada bloque, incluye la interacción en el modelo.'));
    if (malo(s.independencia)) rec.push(T('Revisa el orden: si las filas siguen la posición en el campo, parcelas vecinas se parecen. Considera bloques más chicos o un análisis espacial (Fase 2).'));
    if (malo(s.atipicos)) rec.push(T('Revisa la fila {f}: primero que no haya un error de captura; si el valor es real, analiza con y sin ella y repórtalo.', { f: r.atipicos.fila }));
    return rec;
  }
  function reporteSupuestos(r) {
    const col = (clave, titulo, formato) => ({ clave, titulo, formato });
    const fila = (prueba, est, valor, gl, p, nota) => ({ prueba, est, valor, gl, p, nota: nota || '' });
    const pruebas = [];
    const nr = r.normalidad;
    if (nr.shapiro) pruebas.push(fila('Shapiro-Wilk', 'W', nr.shapiro.W, '', nr.shapiro.p, T('normalidad (principal)')));
    if (nr.lilliefors) pruebas.push(fila('Lilliefors', 'D', nr.lilliefors.D, '', nr.lilliefors.p, T('normalidad')));
    if (nr.anderson) pruebas.push(fila('Anderson-Darling', 'A', nr.anderson.A, '', nr.anderson.p, nr.shapiro ? T('normalidad') : T('normalidad (principal)')));
    const v = r.varianzas;
    if (v) {
      pruebas.push(fila('Brown-Forsythe', 'F', v.brown_forsythe.F, v.brown_forsythe.gl1 + ', ' + v.brown_forsythe.gl2, v.brown_forsythe.p, T('varianzas (principal)')));
      pruebas.push(fila('Levene', 'F', v.levene.F, v.levene.gl1 + ', ' + v.levene.gl2, v.levene.p, T('varianzas')));
      pruebas.push(fila('Bartlett', 'K²', v.bartlett.K2, String(v.bartlett.gl), v.bartlett.p, T('varianzas; sensible a la falta de normalidad')));
      pruebas.push(fila('Fligner-Killeen', 'X²', v.fligner.X2, String(v.fligner.gl), v.fligner.p, T('varianzas; por rangos')));
    }
    if (r.aditividad) pruebas.push(fila(T('No aditividad de Tukey'), 'F', r.aditividad.F, '1, ' + r.aditividad.gl_residual, r.aditividad.p, T('aditividad')));
    const dw = r.independencia.durbin_watson;
    pruebas.push(fila('Durbin-Watson', 'DW', dw.DW, '', dw.p, dw.exacta ? T('independencia; p exacto') : T('independencia; p aproximado')));
    const ra = r.independencia.rachas;
    if (ra) pruebas.push(fila(T('Rachas'), 'R', ra.rachas, '', ra.p, ra.exacta ? T('independencia; p exacto') : T('independencia; aprox. normal')));
    pruebas.push(fila(T('Residuo estudentizado (Bonferroni)'), 't', r.atipicos.rstudent, String(r.atipicos.gl), r.atipicos.bonferroni, T('atípico: fila {f}', { f: r.atipicos.fila })));
    const cuadros = [{
      id: 'supuestos', titulo: T('Pruebas de los supuestos sobre los residuos de {m}', { m: r.formula }),
      columnas: [col('prueba', T('Prueba'), 'texto'), col('est', T('Estadístico'), 'texto'), col('valor', T('Valor'), 'auto4'), col('gl', 'gl', 'texto'), col('p', 'p', 'pvalor'), col('nota', T('Revisa'), 'texto')],
      filas: pruebas,
      notas: [T('Semáforo: verde p ≥ {a}; ámbar entre {b} y {a}; rojo p < {b}. Cada renglón lo decide la prueba marcada como principal.', { a: r.alfa, b: r.alfa / 5 }),
        T('Varianzas, normalidad y atípicos se prueban sobre los residuos del modelo; las varianzas se comparan por tratamiento.')],
    }];
    if (v) cuadros.push({
      id: 'varianzas', titulo: T('Varianza de los residuos en cada tratamiento'),
      columnas: [col('grupo', T('Tratamiento'), 'texto'), col('n', 'n', 'entero'), col('varianza', T('Varianza'), 'forma')],
      filas: v.grupos.map((gr, i) => ({ grupo: gr, n: v.n_grupo[i], varianza: v.varianza_grupo[i] })), notas: [],
    });
    return {
      titulo: T('Revisión de los supuestos'), conclusiones: [],
      semaforo: r.semaforo.map(s => ({ clave: s.clave, nombre: T(NOMBRE[s.clave]), color: s.color, texto: veredicto(s, r) })),
      global: r.global, recomendaciones: recomendaciones(r), cuadros,
    };
  }
  function codigoSupuestos(e, op, ctx) {
    op = SP.opcionesCon(SP.metodos.supuestos, op);
    const trs = lista(e.tratamientos), numericos = (ctx && ctx.factoresNumericos) || [];
    const derecha = [e.bloque || '', trs.join(' * ')].filter(Boolean).join(' + ') || '1';
    const grupo = trs.length ? (trs.length === 1 ? `datos$${trs[0]}` : `interaction(${trs.map(t => 'datos$' + t).join(', ')})`) : null;
    const L = [
      '# Revisión de los supuestos (código R equivalente a SigmaPro)',
      '# install.packages(c("nortest", "car", "lmtest", "agricolae", "randtests"))',
      ...[e.bloque, ...trs].filter(f => f && numericos.includes(f)).map(f => `datos$${f} <- factor(datos$${f})`),
      ...(e.orden ? [`datos <- datos[order(datos$${e.orden}), ]   # orden para Durbin-Watson y las rachas`] : []),
      `datos <- datos[complete.cases(datos[c(${[e.respuesta, e.bloque, ...trs].filter(Boolean).map(x => JSON.stringify(x)).join(', ')})]), ]`,
      `m <- lm(${e.respuesta} ~ ${derecha}, data = datos)`,
      'e <- residuals(m)',
      'sw <- shapiro.test(e); li <- nortest::lillie.test(e); ad <- nortest::ad.test(e)',
      ...(grupo ? [
        `g <- ${grupo}`,
        'bf <- car::leveneTest(e ~ g, center = median)   # Brown-Forsythe',
        'lv <- car::leveneTest(e ~ g, center = mean)     # Levene',
        'ba <- bartlett.test(e ~ g); fl <- fligner.test(e ~ g)   # SigmaPro conserva los empates exactos en Fligner'] : []),
      ...(e.bloque && grupo ? [`na <- agricolae::nonadditivity(datos$${e.respuesta}, datos$${e.bloque}, g, df.residual(m), deviance(m) / df.residual(m))`] : []),
      'dw <- lmtest::dwtest(m)                    # autocorrelación positiva',
      'ra <- randtests::runs.test(e)',
      'ot <- car::outlierTest(m); max(cooks.distance(m))',
      'list(sw, li, ad, dw, ra, ot)',
      `qqnorm(rstandard(m)); qqline(rstandard(m))`,
    ];
    return L.join('\n');
  }
  SP.metodo({
    id: 'supuestos', familia: 'supuestos', motor: 'js',
    nombre: T('Revisar los supuestos del modelo'),
    resumen: T('Normalidad, varianzas iguales, aditividad, independencia y atípicos de los residuos de tu experimento, con semáforo y recomendaciones.'),
    entradas: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', opcional: true, maximo: 3 }, bloque: { tipo: 'factor', opcional: true }, orden: { tipo: 'numerica', opcional: true } },
    opciones: { alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar: revisarSupuestos, calcular: calcularSupuestos, reporte: reporteSupuestos, codigoR: codigoSupuestos,
  });

  SP.sup = {
    ajustarModelo, shapiro, lilliefors, andersonDarling, kolmogorov, kolmogorovExacta, kolmogorovLimite,
    levene, bartlett, fligner, rangos, porGrupo, noAditividad, noAditividadTabla,
    pan, valoresPropios, durbinWatson, durbinWatsonModelo, rachas,
    influencia, influenciaModelo, atipicoDe, atipicoModelo, grubbs, cincoNumeros, cercasTukey, bandaQQ, color,
  };
});
