/* SigmaPro — series de tiempo básicas: autocorrelación, descomposición clásica y tendencia monótona.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las mismas convenciones que R, escritas desde las fórmulas:
   - acf y pacf (stats): r_k = Σ (x_t − x̄)(x_{t+k} − x̄) / Σ (x_t − x̄)², hasta 10·log10(n) rezagos (como mucho n − 1);
     la parcial por Durbin-Levinson; la banda ±z/√n; Box.test de Box-Pierce (n Σ r²) y de Ljung-Box
     (n(n + 2) Σ r²/(n − k)) con lag − fitdf gl;
   - decompose (stats): tendencia con la media móvil centrada (pesos ½, 1, …, 1, ½ con frecuencia par), figura
     estacional con la media de cada posición del ciclo (contada desde la primera observación) centrada en 0 (o
     dividida entre su media, multiplicativa), y el residuo;
   - Mann-Kendall (trend::mk.test): S = Σ sign(x_j − x_i), su varianza con empates, τ = S/D, z con la corrección de
     continuidad; pendiente de Sen (trend::sens.slope): la mediana de (x_j − x_i)/(j − i) y su intervalo con los rangos
     redondeados como round de R (la mitad al par). */
SP.definir('series', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, floor, log10, min, max } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const media = v => v.reduce((a, b) => a + b, 0) / v.length;
  /** round de R: la mitad va al par (IEC 60559). */
  const redondearR = x => { const f = Math.floor(x), d = x - f; return d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 === 0 ? f : f + 1); };

  /** Rezagos por omisión de acf: floor(10·log10(n)), como mucho n − 1. */
  const rezagosR = n => min(floor(10 * log10(n)), n - 1);

  /** Autocorrelación (k = 0..lagMax). */
  function acf(x, lagMax) {
    const n = x.length, m = media(x), d = x.map(v => v - m), c0 = d.reduce((s, v) => s + v * v, 0) / n, out = [];
    for (let k = 0; k <= lagMax; k++) { let s = 0; for (let t = 0; t + k < n; t++) s += d[t] * d[t + k]; out.push(s / n / c0); }
    return out;
  }
  /** Autocorrelación parcial (k = 1..lagMax) por Durbin-Levinson desde la acf. */
  function pacf(r, lagMax) {
    const out = [], phi = [];
    for (let k = 1; k <= lagMax; k++) {
      let num = r[k], den = 1;
      for (let j = 1; j < k; j++) { num -= phi[j - 1] * r[k - j]; den -= phi[j - 1] * r[j]; }
      const a = num / den, nuevo = phi.slice();
      for (let j = 1; j < k; j++) nuevo[j - 1] = phi[j - 1] - a * phi[k - j - 1];
      nuevo[k - 1] = a;
      phi.length = 0; phi.push(...nuevo);
      out.push(a);
    }
    return out;
  }
  /** Box.test: Box-Pierce y Ljung-Box con lag rezagos y fitdf parámetros ajustados. */
  function box(r, n, lag, fitdf) {
    let q = 0, lb = 0;
    for (let k = 1; k <= lag; k++) { q += r[k] * r[k]; lb += r[k] * r[k] / (n - k); }
    const gl = lag - (fitdf || 0);
    q *= n; lb *= n * (n + 2);
    return { box_pierce: q, ljung_box: lb, gl, p_box_pierce: D().pchisq(q, gl, false), p_ljung_box: D().pchisq(lb, gl, false) };
  }

  /** La media móvil centrada de decompose (filter con sides = 2): NaN donde no alcanza la ventana. */
  function mediaMovil(x, f) {
    const w = f % 2 ? Array(f).fill(1 / f) : [0.5 / f].concat(Array(f - 1).fill(1 / f), [0.5 / f]), h = (w.length - 1) / 2, n = x.length, out = new Array(n).fill(NaN);
    for (let t = h; t < n - h; t++) { let s = 0; for (let j = 0; j < w.length; j++) s += w[j] * x[t - h + j]; out[t] = s; }
    return out;
  }
  /** decompose: x (sin faltantes), f (observaciones por ciclo), tipo 'aditiva' | 'multiplicativa'. */
  function descomponer(x, f, tipo) {
    const n = x.length, mult = tipo === 'multiplicativa';
    exigir(f >= 2 && n >= 2 * f, T('Hacen falta al menos dos ciclos completos ({k} observaciones con {f} por ciclo).', { k: 2 * f, f }));
    if (mult) exigir(x.every(v => v > 0), T('La descomposición multiplicativa necesita valores positivos.'));
    const tendencia = mediaMovil(x, f), est = x.map((v, i) => (mult ? v / tendencia[i] : v - tendencia[i]));
    let figura = [];
    for (let i = 0; i < f; i++) { const vs = []; for (let k = i; k < n; k += f) if (Number.isFinite(est[k])) vs.push(est[k]); figura.push(vs.length ? media(vs) : NaN); }
    const mf = media(figura);
    figura = figura.map(v => (mult ? v / mf : v - mf));
    const estacional = x.map((_, i) => figura[i % f]);
    const residuo = x.map((v, i) => (mult ? v / estacional[i] / tendencia[i] : v - estacional[i] - tendencia[i]));
    return { tendencia, estacional, residuo, figura };
  }

  /** Mann-Kendall (trend::mk.test, bilateral con la corrección de continuidad). */
  function mannKendall(x) {
    const n = x.length;
    exigir(n >= 3, T('Hacen falta al menos 3 observaciones.'));
    let S = 0;
    for (let j = 1; j < n; j++) for (let i = 0; i < j; i++) S += Math.sign(x[j] - x[i]);
    const cuenta = new Map();
    for (const v of x) cuenta.set(v, (cuenta.get(v) || 0) + 1);
    let tv = 0, td = 0;
    for (const t of cuenta.values()) { tv += t * (t - 1) * (2 * t + 5); td += t * (t - 1); }
    const varS = (n * (n - 1) * (2 * n + 5) - tv) / 18, Dn = sqrt(0.5 * n * (n - 1) - 0.5 * td) * sqrt(0.5 * n * (n - 1));
    const z = varS > 0 ? Math.sign(S) * (abs(S) - 1) / sqrt(varS) : NaN;
    return { S, varS, tau: S / Dn, z, p: 2 * min(0.5, D().pnorm(abs(z), 0, 1, false)), n };
  }
  /** Pendiente de Sen (trend::sens.slope) con su intervalo. */
  function sen(x, nivel) {
    /* las n(n − 1)/2 pendientes en un arreglo tipado, ordenadas una sola vez (con 3000 valores son 4.5 millones) */
    const n = x.length, k = n * (n - 1) / 2, s = new Float64Array(k);
    let q = 0;
    for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) s[q++] = (x[j] - x[i]) / (j - i);
    s.sort();
    const mk = mannKendall(x), C = D().qnorm(1 - (1 - nivel) / 2, 0, 1, true) * sqrt(mk.varS);
    const arriba = redondearR((k + C) / 2 + 1), abajo = redondearR((k - C) / 2);
    const tomar = r => (r >= 1 && r <= k ? s[r - 1] : NaN);
    return { pendiente: k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2, inf: tomar(abajo), sup: tomar(arriba), rangos: [abajo, arriba], pares: k };
  }

  SP.series = { acf, pacf, box, rezagosR, mediaMovil, descomponer, mannKendall, sen, redondearR };
});
