/* SigmaPro — muestreo: tamaño de muestra y estimación con muestreo aleatorio simple y estratificado.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las fórmulas de Cochran (1977, Sampling Techniques, 3.ª ed.):
   - tamaño de muestra para una media: n₀ = (z·S/e)² (con e absoluto, o S = CV·media y e relativo); para una
     proporción: n₀ = z²·p(1 − p)/e²; con población finita, n = n₀/(1 + n₀/N) para la media y n = n₀/[1 + (n₀ − 1)/N]
     para la proporción, cuya varianza lleva el factor (N − n)/(N − 1) (cap. 4); z = qnorm(1 − α/2);
   - aleatorio simple (cap. 2 y 3): ȳ, s², EE(ȳ) = √((1 − f)·s²/n) con f = n/N; total Nȳ con EE N·EE(ȳ); una
     proporción p̂ con EE = √((1 − f)·p̂(1 − p̂)/(n − 1)); intervalos con t de n − 1 gl;
   - estratificado (cap. 5): ȳ_st = Σ W_h·ȳ_h con W_h = N_h/N, V(ȳ_st) = Σ W_h²·(1 − f_h)·s_h²/n_h; intervalos con t de
     los gl efectivos de Satterthwaite (ec. 5.16); asignación proporcional n_h = n·N_h/N y de Neyman n_h = n·N_h·s_h/Σ N_h·s_h
     para un tamaño total n. */
SP.definir('muestreo', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, ceil } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const media = v => v.reduce((a, b) => a + b, 0) / v.length;
  const varianza = v => { const m = media(v); return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1); };

  /** Tamaño de muestra. o = { tipo: 'media' | 'proporcion', de, cv, media, p, error, relativo, N, confianza }. */
  function tamano(o) {
    const z = D().qnorm(1 - (1 - o.confianza) / 2, 0, 1, true);
    let n0, S = null, e = o.error;
    if (o.tipo === 'proporcion') n0 = z * z * o.p * (1 - o.p) / (e * e);
    else {
      if (o.relativo) { S = o.cv; e = o.error; }     // CV y error en % de la media: n₀ = (z·CV/e)²
      else S = o.de;
      n0 = (z * S / e) ** 2;
    }
    const n = !(o.N > 0) ? n0 : o.tipo === 'proporcion' ? n0 / (1 + (n0 - 1) / o.N) : n0 / (1 + n0 / o.N);
    return { z, n0, n, n_entero: ceil(n - 1e-9) };
  }

  /** Aleatorio simple: o = { y (valores), N, confianza, proporcion: true si y es 0/1 }. */
  function simple(o) {
    const y = o.y, n = y.length, N = o.N, f = N > 0 ? n / N : 0;
    exigir(n >= 2, T('Hacen falta al menos dos observaciones.'));
    if (N > 0) exigir(N >= n, T('La población (N) no puede ser menor que la muestra.'));
    const t = D().qt(1 - (1 - o.confianza) / 2, n - 1, true), m = media(y);
    const s2 = o.proporcion ? m * (1 - m) * n / (n - 1) : varianza(y);
    const ee = sqrt((1 - f) * s2 / n);
    const out = { n, N: N > 0 ? N : null, f, media: m, varianza: s2, de: sqrt(s2), ee, t, ic: [m - t * ee, m + t * ee], cv: 100 * sqrt(s2) / m };
    if (N > 0) Object.assign(out, { total: N * m, ee_total: N * ee, ic_total: [N * (m - t * ee), N * (m + t * ee)] });
    return out;
  }

  /** Estratificado: o = { y, estrato (códigos 0..H−1), niveles, Nh (por nivel), confianza, nTotal (para la asignación) }. */
  function estratificado(o) {
    const H = o.niveles.length, N = o.Nh.reduce((a, b) => a + b, 0);
    const grupos = o.niveles.map((_, h) => o.y.filter((_, i) => o.estrato[i] === h));
    grupos.forEach((g, h) => exigir(g.length >= 2, T('El estrato «{e}» necesita al menos dos observaciones.', { e: o.niveles[h] })));
    o.Nh.forEach((Nh, h) => exigir(Nh >= grupos[h].length, T('En «{e}» la población ({N}) es menor que la muestra ({n}).', { e: o.niveles[h], N: Nh, n: grupos[h].length })));
    const filas = grupos.map((g, h) => {
      const nh = g.length, Nh = o.Nh[h], W = Nh / N, fh = nh / Nh, m = media(g), s2 = varianza(g);
      return { estrato: o.niveles[h], Nh, nh, W, f: fh, media: m, varianza: s2, de: sqrt(s2), aporte: W * W * (1 - fh) * s2 / nh };
    });
    const mst = filas.reduce((s, x) => s + x.W * x.media, 0), V = filas.reduce((s, x) => s + x.aporte, 0), ee = sqrt(V);
    /* gl efectivos de Satterthwaite: (Σ g_h s_h²)² / Σ (g_h s_h²)²/(n_h − 1), con g_h = N_h(N_h − n_h)/n_h */
    const gs = filas.map(x => x.Nh * (x.Nh - x.nh) / x.nh * x.varianza);
    /* con todos los estratos medidos completos (un censo) no hay error de muestreo: EE = 0 y el intervalo es el punto */
    const den = gs.reduce((s, v, h) => s + v * v / (filas[h].nh - 1), 0);
    const gl = den > 0 ? gs.reduce((a, b) => a + b, 0) ** 2 / den : Infinity;
    const t = Number.isFinite(gl) ? D().qt(1 - (1 - o.confianza) / 2, gl, true) : D().qnorm(1 - (1 - o.confianza) / 2, 0, 1, true);
    const out = { N, n: o.y.length, estratos: filas, media: mst, ee, gl, t, ic: [mst - t * ee, mst + t * ee], total: N * mst, ee_total: N * ee, ic_total: [N * (mst - t * ee), N * (mst + t * ee)] };
    /* cómo repartir un tamaño total entre los estratos: proporcional y de Neyman (con las s_h de esta muestra) */
    if (o.nTotal > 0) {
      const sNs = filas.reduce((s, x) => s + x.Nh * x.de, 0);
      out.asignacion = { n: o.nTotal, proporcional: filas.map(x => o.nTotal * x.Nh / N), neyman: filas.map(x => o.nTotal * x.Nh * x.de / sNs) };
    }
    return out;
  }

  SP.muestreo = { tamano, simple, estratificado };
});
