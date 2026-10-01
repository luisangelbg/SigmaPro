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

  SP.num = { suma, sinFaltantes, media, varianza, resumen };
});
