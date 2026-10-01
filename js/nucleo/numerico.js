/* SigmaPro — sumas, medias y varianzas exactas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Base de todo lo demás: cualquier suma de cuadrados del programa pasa por aquí.
   Se usan algoritmos que no pierden precisión con datos grandes o desplazados
   (p. ej. rendimientos en kg/ha alrededor de 10 000, o fechas juliano):

   - suma compensada de Neumaier (1974): el error no crece con n;
   - media en dos pasadas: m = Σx/n y luego m + Σ(x − m)/n, que corrige el
     redondeo de la primera división;
   - varianza en dos pasadas corregida (Chan, Golub y LeVeque, 1983):
     [Σ(x − m)² − (Σ(x − m))²/n] / (n − 1).

   Faltantes: NaN, null y undefined se descartan, como na.rm = TRUE en R.
   ±Infinity se conserva y se propaga, igual que en R. */
SP.definir('numerico', function (SP) {
  'use strict';

  /** Suma compensada de Neumaier sobre cualquier arreglo (Array o TypedArray). */
  function suma(x) {
    let s = 0, c = 0;
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      const t = s + v;
      if (Math.abs(s) >= Math.abs(v)) c += (s - t) + v;
      else c += (v - t) + s;
      s = t;
    }
    const r = s + c;
    /* con infinitos la compensación produce NaN (∞ − ∞): se devuelve la suma directa */
    return Number.isNaN(r) && !Number.isNaN(s) ? s : r;
  }

  /** Copia en Float64Array sin los faltantes (NaN, null, undefined). */
  function sinFaltantes(x) {
    let k = 0;
    const out = new Float64Array(x.length);
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      if (v === null || v === undefined || Number.isNaN(v)) continue;
      out[k++] = v;
    }
    return k === out.length ? out : out.slice(0, k);
  }

  /** Media aritmética en dos pasadas. Arreglo vacío → NaN (como mean(numeric(0)) en R). */
  function media(x) {
    const n = x.length;
    if (n === 0) return NaN;
    const m = suma(x) / n;
    if (!Number.isFinite(m)) return m;
    let r = 0, c = 0;   // Σ(x − m) compensada
    for (let i = 0; i < n; i++) {
      const v = x[i] - m;
      const t = r + v;
      if (Math.abs(r) >= Math.abs(v)) c += (r - t) + v; else c += (v - t) + r;
      r = t;
    }
    return m + (r + c) / n;
  }

  /** Varianza muestral (divisor n − 1) en dos pasadas corregida. n < 2 → NaN (NA en R). */
  function varianza(x) {
    const n = x.length;
    if (n < 2) return NaN;
    const m = media(x);
    if (!Number.isFinite(m)) return NaN;
    let s1 = 0, c1 = 0, s2 = 0, c2 = 0;
    for (let i = 0; i < n; i++) {
      const d = x[i] - m;
      let t = s1 + d;
      if (Math.abs(s1) >= Math.abs(d)) c1 += (s1 - t) + d; else c1 += (d - t) + s1;
      s1 = t;
      const d2 = d * d;
      t = s2 + d2;
      if (Math.abs(s2) >= Math.abs(d2)) c2 += (s2 - t) + d2; else c2 += (d2 - t) + s2;
      s2 = t;
    }
    const sd = s1 + c1;
    return ((s2 + c2) - sd * sd / n) / (n - 1);
  }

  /** Resumen básico de una columna numérica, sin faltantes. */
  function resumen(x) {
    const v = sinFaltantes(x);
    const n = v.length;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < n; i++) { if (v[i] < min) min = v[i]; if (v[i] > max) max = v[i]; }
    const s2 = varianza(v);
    return {
      n,
      faltantes: x.length - n,
      media: media(v),
      varianza: s2,
      de: Math.sqrt(s2),
      min: n ? min : NaN,
      max: n ? max : NaN,
    };
  }

  /**
   * Mínimo de una función de una variable en [a, b] por el método de Brent (1973):
   * sección dorada con interpolación parabólica. Es el método de optimize() en R.
   * tol: tolerancia relativa en x (por omisión, la raíz de la precisión de la máquina,
   * que es lo más fino que permite un mínimo, donde la función es plana).
   */
  function minimizar(f, a, b, tol) {
    const c = (3 - Math.sqrt(5)) / 2;
    const eps = Math.sqrt(2.220446049250313e-16);
    tol = tol || 1e-12;
    let v = a + c * (b - a), w = v, x = v, d = 0, e = 0;
    let fx = f(x), fv = fx, fw = fx;
    for (let iter = 0; iter < 500; iter++) {
      const xm = 0.5 * (a + b);
      const tol1 = eps * Math.abs(x) + tol / 3, tol2 = 2 * tol1;
      if (Math.abs(x - xm) <= tol2 - 0.5 * (b - a)) break;
      let usarDorada = true;
      if (Math.abs(e) > tol1) {
        let r = (x - w) * (fx - fv), q = (x - v) * (fx - fw), p = (x - v) * q - (x - w) * r;
        q = 2 * (q - r);
        if (q > 0) p = -p; else q = -q;
        const eAnt = e; e = d;
        if (Math.abs(p) < Math.abs(0.5 * q * eAnt) && p > q * (a - x) && p < q * (b - x)) {
          d = p / q;
          const u = x + d;
          if (u - a < tol2 || b - u < tol2) d = xm >= x ? tol1 : -tol1;
          usarDorada = false;
        }
      }
      if (usarDorada) { e = (x >= xm ? a : b) - x; d = c * e; }
      const u = Math.abs(d) >= tol1 ? x + d : x + (d > 0 ? tol1 : -tol1);
      const fu = f(u);
      if (fu <= fx) {
        if (u >= x) a = x; else b = x;
        v = w; fv = fw; w = x; fw = fx; x = u; fx = fu;
      } else {
        if (u < x) a = u; else b = u;
        if (fu <= fw || w === x) { v = w; fv = fw; w = u; fw = fu; }
        else if (fu <= fv || v === x || v === w) { v = u; fv = fu; }
      }
    }
    return { x, valor: fx };
  }

  /**
   * Raíz de f en [ax, bx] con el algoritmo de Brent tal como lo usa uniroot() de R (R_zeroin2 de zeroin.c):
   * mismos pasos y mismo criterio de paro, para que una función escalonada (p. ej. la de los intervalos de
   * Wilcoxon) dé la misma raíz que R. fa y fb son f(ax) y f(bx); tol por omisión ε^¼ y hasta 1000 iteraciones.
   */
  function raizR(f, ax, bx, fa, fb, tol, maxit) {
    const EPS = 2.220446049250313e-16;
    tol = tol === undefined ? Math.pow(EPS, 0.25) : tol;
    maxit = maxit === undefined ? 1000 : maxit;
    if (fa === undefined) fa = f(ax);
    if (fb === undefined) fb = f(bx);
    let a = ax, b = bx, c = a, fc = fa;
    if (fa === 0) return a;
    if (fb === 0) return b;
    let vueltas = maxit + 1;
    while (vueltas--) {
      const prevStep = b - a;
      if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
      const tolAct = 2 * EPS * Math.abs(b) + tol / 2;
      let newStep = (c - b) / 2;
      if (Math.abs(newStep) <= tolAct || fb === 0) return b;
      if (Math.abs(prevStep) >= tolAct && Math.abs(fa) > Math.abs(fb)) {
        let p, q, t1;
        const cb = c - b;
        if (a === c) { t1 = fb / fa; p = cb * t1; q = 1 - t1; }
        else {
          q = fa / fc; t1 = fb / fc; const t2 = fb / fa;
          p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
          q = (q - 1) * (t1 - 1) * (t2 - 1);
        }
        if (p > 0) q = -q; else p = -p;
        if (p < (0.75 * cb * q - Math.abs(tolAct * q) / 2) && p < Math.abs(prevStep * q / 2)) newStep = p / q;
      }
      if (Math.abs(newStep) < tolAct) newStep = newStep > 0 ? tolAct : -tolAct;
      a = b; fa = fb;
      b += newStep; fb = f(b);
      if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) { c = a; fc = fa; }
    }
    return b;
  }

  SP.num = { suma, sinFaltantes, media, varianza, resumen, minimizar, raizR };
});
