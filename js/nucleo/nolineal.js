/* SigmaPro — regresión no lineal por mínimos cuadrados: modelos de crecimiento, dosis-respuesta y respuesta con meseta.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada modelo trae su valor y su gradiente analítico. El ajuste es de Levenberg-Marquardt (cada paso por QR de la
   matriz aumentada [J; √λ·D]) desde valores iniciales por linealización, y termina con pasos de Gauss-Newton puros hasta
   que el paso relativo baja de 1e-13 (como la referencia en R: nls se detiene cuando la suma de cuadrados ya no
   distingue mejoras de su redondeo). Lineal-meseta no es derivable en x0: su óptimo se busca por perfil (en cada
   intervalo entre dosis observadas, x0 por el método de Brent con a y b por mínimos cuadrados; con x0 por grupo y a o b
   comunes, por grupos alternados hasta que la suma de cuadrados ya no baja) y luego se pule igual.
   Con grupos, cada parámetro puede ser común o uno por grupo (en el orden de nls: por parámetro y, dentro, por grupo);
   así se comparan curvas con la prueba F de la suma de cuadrados extra.
   Con pesos, se minimiza Σ w·(y − f)², como nls(weights = w): cada fila entra multiplicada por √w.
   EE: σ²·(J'J)⁻¹ con σ² = SCR/(n − p), como summary.nls; log L = −n/2·(log 2π + 1 − log n − media(log w) + log SCR),
   como logLik.nls. Intervalos de Wald (con t) o por verosimilitud perfilada: el valor del parámetro donde el perfil
   τ(β) = signo(β − β̂)·√((SCR(β) − SCR)/σ²), con los demás parámetros reajustados, llega a ±t (lo que aproxima
   confint() de nls con su perfil interpolado).
   Con filas repetidas (la misma x en el mismo grupo, como las repeticiones de un ensayo) el ajuste se hace sobre la
   media de cada celda pesada por su número de filas (o la suma de sus pesos): el mismo óptimo, la misma J'J y la misma
   SCR (más la de dentro de las celdas); con 100 000 filas y pocas dosis, milisegundos en lugar de segundos. */
SP.definir('nolineal', function (SP) {
  'use strict';
  const T = SP.T;
  const { exp, log, abs, max, min, sqrt, pow } = Math;

  /* ---------------- modelos: f(x, p) → [valor, gradiente] ---------------- */
  /** Brain-Cousens (hormesis): c + (d − c + f·x) / (1 + (x/e)^b), con su gradiente en (b, c, d, e, f). */
  function brainCousens(x, b, c, d, e, f) {
    const E = x > 0 ? pow(x / e, b) : (b > 0 ? 0 : Infinity);
    if (E !== E) return [NaN, [NaN, NaN, NaN, NaN, NaN]];   // e ≤ 0: fuera del dominio
    if (!Number.isFinite(E)) return [c, [0, 1, 0, 0, 0]];
    const u = 1 + E, N = d - c + f * x, lg = x > 0 ? log(x / e) : 0;
    return [c + N / u, [x > 0 ? -N * E * lg / (u * u) : 0, E / u, 1 / u, N * E * (b / e) / (u * u), x / u]];
  }
  const MODELOS = {
    logistico: { par: ['Asym', 'xmid', 'scal'], f: (x, p) => { const E = exp((p[1] - x) / p[2]), u = 1 + E; return [p[0] / u, [1 / u, -p[0] * E / (u * u) / p[2], p[0] * E / (u * u) * (p[1] - x) / (p[2] * p[2])]]; } },
    gompertz: { par: ['Asym', 'b2', 'b3'], f: (x, p) => { const B = pow(p[2], x), E = exp(-p[1] * B); return [p[0] * E, [E, -p[0] * B * E, -p[0] * p[1] * x * pow(p[2], x - 1) * E]]; } },
    weibull: { par: ['Asym', 'Drop', 'lrc', 'pwr'], f: (x, p) => { const u = exp(p[2]) * pow(x, p[3]), E = exp(-u); return [p[0] - p[1] * E, [1, -E, p[1] * E * u, x > 0 ? p[1] * E * u * log(x) : 0]]; } },
    ll4: { par: ['b', 'c', 'd', 'e'], f: (x, p) => {
      const E = x > 0 ? pow(x / p[3], p[0]) : (p[0] > 0 ? 0 : Infinity);
      if (E !== E) return [NaN, [NaN, NaN, NaN, NaN]];   // e ≤ 0: fuera del dominio
      if (!Number.isFinite(E)) return [p[1], [0, 1, 0, 0]];
      const u = 1 + E, lg = x > 0 ? log(x / p[3]) : 0;
      return [p[1] + (p[2] - p[1]) / u, [x > 0 ? -(p[2] - p[1]) * E * lg / (u * u) : 0, E / u, 1 / u, (p[2] - p[1]) * E * (p[0] / p[3]) / (u * u)]];
    } },
    ll3: { par: ['b', 'd', 'e'], f: (x, p) => {
      const E = x > 0 ? pow(x / p[2], p[0]) : (p[0] > 0 ? 0 : Infinity);
      if (E !== E) return [NaN, [NaN, NaN, NaN]];   // e ≤ 0: fuera del dominio
      if (!Number.isFinite(E)) return [0, [0, 0, 0]];
      const u = 1 + E, lg = x > 0 ? log(x / p[2]) : 0;
      return [p[1] / u, [x > 0 ? -p[1] * E * lg / (u * u) : 0, 1 / u, p[1] * E * (p[0] / p[2]) / (u * u)]];
    } },
    bc5: { par: ['b', 'c', 'd', 'e', 'f'], f: (x, p) => brainCousens(x, p[0], p[1], p[2], p[3], p[4]) },
    bc4: { par: ['b', 'd', 'e', 'f'], f: (x, p) => { const [v, g] = brainCousens(x, p[0], 0, p[1], p[2], p[3]); return [v, [g[0], g[2], g[3], g[4]]]; } },
    mitscherlich: { par: ['a', 'b', 'c'], f: (x, p) => { const E = exp(-p[2] * x); return [p[0] - p[1] * E, [1, -E, p[1] * x * E]]; } },
    mm2: { par: ['d', 'e'], f: (x, p) => { const u = p[1] + x; return [p[0] * x / u, [x / u, -p[0] * x / (u * u)]]; } },
    mm3: { par: ['c', 'd', 'e'], f: (x, p) => { const u = p[2] + x; return [p[0] + (p[1] - p[0]) * x / u, [p[2] / u, x / u, -(p[1] - p[0]) * x / (u * u)]]; } },
    'cuadratico-meseta': { par: ['a', 'b', 'c'], f: (x, p) => {
      const x0 = -p[1] / (2 * p[2]);
      return x < x0 ? [p[0] + p[1] * x + p[2] * x * x, [1, x, x * x]] : [p[0] - p[1] * p[1] / (4 * p[2]), [1, -p[1] / (2 * p[2]), p[1] * p[1] / (4 * p[2] * p[2])]];
    } },
    'lineal-meseta': { par: ['a', 'b', 'x0'], f: (x, p) => (x < p[2] ? [p[0] + p[1] * x, [1, x, 0]] : [p[0] + p[1] * p[2], [1, p[2], p[1]]]) },
  };
  /** Lineal-meseta tiene un quiebre en x0: su perfil no es suave y queda con intervalos de Wald. */
  const SIN_PERFIL = new Set(['lineal-meseta']);

  /* ---------------- valores iniciales ---------------- */
  /** Recta de mínimos cuadrados (ponderados si hay pesos) de w sobre z: [intercepto, pendiente]. */
  function recta(z, w, p) {
    const n = z.length;
    let sp = 0, mz = 0, mw = 0;
    for (let i = 0; i < n; i++) { const k = p ? p[i] : 1; sp += k; mz += k * z[i]; mw += k * w[i]; }
    mz /= sp; mw /= sp;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { const k = p ? p[i] : 1; sxy += k * (z[i] - mz) * (w[i] - mw); sxx += k * (z[i] - mz) ** 2; }
    const b = sxy / sxx;
    return [mw - b * mz, b];
  }
  const filtro = (x, y, ok, fz, fw) => { const z = [], w = []; for (let i = 0; i < x.length; i++) if (ok(x[i], y[i])) { z.push(fz(x[i], y[i])); w.push(fw(x[i], y[i])); } return [z, w]; };
  /** Michaelis-Menten por la linealización de Hanes-Woolf: x/(y − c) = e/(d − c) + x/(d − c). */
  function mmInicio(x, y, c) {
    const [z, w] = filtro(x, y, (a, b) => a > 0 && b - c > 0, a => a, (a, b) => a / (b - c));
    if (z.length >= 2) { const [i0, s] = recta(z, w); if (s > 0 && i0 > 0) return [c + 1 / s, i0 / s]; }
    const pos = x.filter(v => v > 0).sort((a, b) => a - b);
    return [max(...y) * 1.05, pos[pos.length >> 1] || 1];
  }
  /** Ajuste sin grupos ni pesos (para arrancar otro modelo desde este); si no converge, sus valores iniciales. */
  function ajusteSolo(modelo, x, y) {
    const p0 = inicio(modelo, x, y);
    try { return ajustar(evaluador(modelo, x, new Int32Array(x.length), 1, MODELOS[modelo].par.map(() => false), null), y, p0).th; } catch (e) { return p0; }
  }
  function inicio(modelo, x, y, w) {
    const ymax = max(...y), ymin = min(...y), rango = ymax - ymin;
    switch (modelo) {
      case 'logistico': { const A = ymax * 1.05, [z, v] = filtro(x, y, (a, b) => b > 0 && b < A, a => a, (a, b) => log(b / (A - b))), [i0, s] = recta(z, v); return [A, -i0 / s, 1 / s]; }
      case 'gompertz': { const A = ymax * 1.05, [z, v] = filtro(x, y, (a, b) => b > 0 && b < A, a => a, (a, b) => log(-log(b / A))), [i0, s] = recta(z, v); return [A, exp(i0), exp(s)]; }
      case 'weibull': { const A = ymax * 1.05, Dr = A - ymin * 0.95, [z, v] = filtro(x, y, (a, b) => a > 0 && (A - b) / Dr > 0 && (A - b) / Dr < 1, a => log(a), (a, b) => log(-log((A - b) / Dr))), [i0, s] = recta(z, v); return [A, Dr, i0, s]; }
      case 'mitscherlich': { const A = ymax * 1.05, [z, v] = filtro(x, y, (a, b) => A - b > 0, a => a, (a, b) => log(A - b)), [i0, s] = recta(z, v); return [A, exp(i0), -s]; }
      case 'll4': { const c = ymin - 0.05 * rango, d = ymax + 0.05 * rango, [z, v] = filtro(x, y, a => a > 0, a => log(a), (a, b) => log((d - b) / (b - c))), [i0, s] = recta(z, v); return [s, c, d, exp(-i0 / s)]; }
      case 'll3': { const d = ymax * 1.05, [z, v] = filtro(x, y, (a, b) => a > 0 && b > 0, a => log(a), (a, b) => log((d - b) / b)), [i0, s] = recta(z, v); return [s, d, exp(-i0 / s)]; }
      /* Brain-Cousens arranca del log-logístico ajustado, sin estímulo (f = 0) */
      case 'bc5': { const p = ajusteSolo('ll4', x, y); return [p[0], p[1], p[2], p[3], 0]; }
      case 'bc4': { const p = ajusteSolo('ll3', x, y); return [p[0], p[1], p[2], 0]; }
      case 'mm2': return mmInicio(x, y, 0);
      case 'mm3': {
        const x0 = min(...x), en0 = y.filter((_, i) => x[i] === x0), c = x0 === 0 ? en0.reduce((s, v) => s + v, 0) / en0.length - 0.05 * rango : ymin - 0.05 * rango;
        const [d, e] = mmInicio(x, y, c);
        return [c, d, e];
      }
      case 'cuadratico-meseta': {
        const n = x.length, X = new Float64Array(n * 3);
        for (let i = 0; i < n; i++) { X[i] = 1; X[i + n] = x[i]; X[i + 2 * n] = x[i] * x[i]; }
        return Array.from(SP.algebra.minimosCuadrados(X, n, 3, Float64Array.from(y)).coeficientes);
      }
      case 'lineal-meseta': return perfilMeseta(x, y, w);
    }
    throw new Error('modelo desconocido: ' + modelo);
  }
  /** Mínimo de f en [a, b] por el método de Brent (como optimize de R). */
  function brentMin(f, a, b, tol) {
    const C = 0.3819660112501051;
    let x = a + C * (b - a), w = x, v = x, fx = f(x), fw = fx, fv = fx, d = 0, e = 0;
    for (let it = 0; it < 500; it++) {
      const m = 0.5 * (a + b), tol1 = 1.4901161193847656e-8 * abs(x) + tol / 3, tol2 = 2 * tol1;
      if (abs(x - m) <= tol2 - 0.5 * (b - a)) break;
      let p = 0, q = 0, r = 0, u;
      if (abs(e) > tol1) {
        r = (x - w) * (fx - fv); q = (x - v) * (fx - fw); p = (x - v) * q - (x - w) * r; q = 2 * (q - r);
        if (q > 0) p = -p; else q = -q;
        r = e; e = d;
      }
      if (abs(p) >= abs(0.5 * q * r) || p <= q * (a - x) || p >= q * (b - x)) { e = x < m ? b - x : a - x; d = C * e; }
      else { d = p / q; u = x + d; if (u - a < tol2 || b - u < tol2) d = x < m ? tol1 : -tol1; }
      u = abs(d) >= tol1 ? x + d : d > 0 ? x + tol1 : x - tol1;
      const fu = f(u);
      if (fu <= fx) { if (u < x) b = x; else a = x; v = w; fv = fw; w = x; fw = fx; x = u; fx = fu; }
      else { if (u < x) a = u; else b = u; if (fu <= fw || w === x) { v = w; fv = fw; w = u; fw = fu; } else if (fu <= fv || v === x || v === w) { v = u; fv = fu; } }
    }
    return { x, f: fx };
  }
  /** El mejor x0 entre dosis distintas: Brent en cada par de intervalos vecinos. */
  function mejorQuiebre(ux, rss) {
    let mejor = null;
    for (let k = 1; k < ux.length - 1; k++) {
      const o = brentMin(rss, ux[k - 1], ux[k + 1], 1e-14);
      if (!mejor || o.f < mejor.f) mejor = o;
    }
    return mejor;
  }
  /** Lineal-meseta por perfil: en cada intervalo entre x distintas, x0 por Brent (a y b por mínimos cuadrados). */
  function perfilMeseta(x, y, w) {
    const ux = [...new Set(x)].sort((a, b) => a - b), n = x.length;
    exigir(ux.length >= 3, T('Lineal-meseta necesita al menos tres dosis distintas.'));
    const ab = x0 => { const z = x.map(v => min(v, x0)), [i0, s] = recta(z, y, w); let r = 0; for (let i = 0; i < n; i++) r += (w ? w[i] : 1) * (y[i] - i0 - s * z[i]) ** 2; return { a: i0, b: s, rss: r }; };
    const mejor = mejorQuiebre(ux, x0 => ab(x0).rss), r = ab(mejor.x);
    return [r.a, r.b, mejor.x];
  }
  /**
   * Lineal-meseta con cada parámetro común o por grupo: dado x0 (uno o uno por grupo), a y b salen por mínimos
   * cuadrados; x0 común se busca por perfil en todas las dosis; x0 por grupo, grupo por grupo hasta que la suma de
   * cuadrados ya no baja. Devuelve los parámetros en el orden de nls.
   */
  function mesetaPorPatron(x, y, w, g, G, porGrupo) {
    const n = x.length, [pa, pb, px] = porGrupo, ka = pa ? G : 1, kb = pb ? G : 1, q = ka + kb;
    const raiz = Float64Array.from({ length: n }, (_, i) => (w ? sqrt(w[i]) : 1)), yw = Float64Array.from(y, (v, i) => v * raiz[i]);
    const ls = x0s => {
      const X = new Float64Array(n * q);
      for (let i = 0; i < n; i++) { const h = g[i]; X[i + (pa ? h : 0) * n] = raiz[i]; X[i + (ka + (pb ? h : 0)) * n] = min(x[i], x0s[px ? h : 0]) * raiz[i]; }
      return SP.algebra.minimosCuadrados(X, n, q, yw, 1e-12);
    };
    const rssDeX0 = x0s => { const r = ls(x0s); return r.coeficientes.some(v => v !== v) ? Infinity : r.scResidual; };
    const deGrupo = h => { const i = idxDe(g, h); return { x: i.map(k => x[k]), y: i.map(k => y[k]), w: w ? i.map(k => w[k]) : null }; };
    let x0s;
    if (!px) {
      const ux = [...new Set(x)].sort((a, b) => a - b);
      exigir(ux.length >= 3, T('Lineal-meseta necesita al menos tres dosis distintas.'));
      x0s = [mejorQuiebre(ux, v => rssDeX0([v])).x];
    } else {
      x0s = Array.from({ length: G }, (_, h) => { const d = deGrupo(h); return perfilMeseta(d.x, d.y, d.w)[2]; });
      if (!(pa && pb)) {
        /* x0 por grupo con a o b comunes: cada x0 por perfil con los demás fijos, por vueltas */
        const uxs = Array.from({ length: G }, (_, h) => [...new Set(deGrupo(h).x)].sort((a, b) => a - b));
        let actual = rssDeX0(x0s);
        for (let vuelta = 0; vuelta < 100; vuelta++) {
          for (let h = 0; h < G; h++) {
            const o = mejorQuiebre(uxs[h], v => { const z = x0s.slice(); z[h] = v; return rssDeX0(z); });
            if (o.f < rssDeX0(x0s)) x0s[h] = o.x;
          }
          const nuevo = rssDeX0(x0s);
          if (actual - nuevo <= 1e-13 * nuevo) break;
          actual = nuevo;
        }
      }
    }
    const cf = ls(x0s).coeficientes;
    return Array.from(cf).concat(x0s);
  }
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };

  /* ---------------- ajuste ---------------- */
  /**
   * Valor y gradiente del modelo con parámetros comunes o por grupo.
   * @param {boolean[]} porGrupo  por parámetro
   * @returns {(th) => { v: Float64Array, J: Float64Array (n × q por columnas) }}
   */
  function evaluador(modelo, x, g, G, porGrupo, raiz) {
    const M = MODELOS[modelo], P = M.par.length, n = x.length, cols = porGrupo.map(pg => (pg ? G : 1)), ini = [];
    let q = 0;
    cols.forEach(c => { ini.push(q); q += c; });
    return {
      q, cols, ini,
      f(th) {
        const v = new Float64Array(n), J = new Float64Array(n * q), p = new Array(P);
        for (let i = 0; i < n; i++) {
          for (let k = 0; k < P; k++) p[k] = th[ini[k] + (porGrupo[k] ? g[i] : 0)];
          const [val, gr] = M.f(x[i], p), w = raiz ? raiz[i] : 1;
          v[i] = val * w;
          for (let k = 0; k < P; k++) J[i + (ini[k] + (porGrupo[k] ? g[i] : 0)) * n] = gr[k] * w;
        }
        return { v, J };
      },
    };
  }
  /** El mismo evaluador con el parámetro j fijo en b (para el perfil). */
  function fijo(ev, j, b) {
    const q = ev.q;
    return {
      q: q - 1,
      f(thr) {
        const th = new Float64Array(q);
        for (let k = 0, m = 0; k < q; k++) th[k] = k === j ? b : thr[m++];
        const r = ev.f(th), n = r.v.length, J = new Float64Array(n * (q - 1));
        for (let k = 0, m = 0; k < q; k++) { if (k === j) continue; J.set(r.J.subarray(k * n, (k + 1) * n), m * n); m++; }
        return { v: r.v, J };
      },
    };
  }
  const rssDe = (y, v) => { let s = 0; for (let i = 0; i < y.length; i++) s += (y[i] - v[i]) ** 2; return s; };
  /** Paso de mínimos cuadrados de [J; √λ·D] contra [r; 0] (λ = 0: Gauss-Newton). */
  function paso(J, n, q, r, lam, D) {
    if (!lam) return SP.algebra.minimosCuadrados(J, n, q, r, 1e-12).coeficientes;
    const m = n + q, A = new Float64Array(m * q), b = new Float64Array(m);
    for (let j = 0; j < q; j++) { A.set(J.subarray(j * n, (j + 1) * n), j * m); A[n + j + j * m] = sqrt(lam) * D[j]; }
    b.set(r);
    return SP.algebra.minimosCuadrados(A, m, q, b, 1e-12).coeficientes;
  }
  /** Levenberg-Marquardt y después Gauss-Newton puro hasta el paso relativo < 1e-13. */
  function ajustar(ev, y, th0) {
    const n = y.length, q = ev.q;
    let th = Float64Array.from(th0), cur = ev.f(th), rss = rssDe(y, cur.v), lam = 1e-3, convergio = false;
    exigir(Number.isFinite(rss), T('Los valores iniciales dan predicciones no válidas.'), T('Revisa que el modelo corresponda a la forma de los datos (crecimiento, caída, meseta).'));
    for (let it = 0; it < 1000; it++) {
      const r = Float64Array.from(y, (v, i) => v - cur.v[i]), D = new Float64Array(q);
      for (let j = 0; j < q; j++) { let s = 0; for (let i = 0; i < n; i++) s += cur.J[i + j * n] ** 2; D[j] = sqrt(s) || 1; }
      let acepto = false, delta = null;
      for (let h = 0; h < 40; h++) {
        delta = paso(cur.J, n, q, r, lam, D);
        if (delta.some(v => !Number.isFinite(v))) { lam = lam ? lam * 10 : 1e-6; continue; }
        const nuevo = Float64Array.from(th, (v, j) => v + delta[j]), e2 = ev.f(nuevo), r2 = rssDe(y, e2.v);
        if (Number.isFinite(r2) && r2 <= rss) { th = nuevo; cur = e2; acepto = true; rss = r2; lam = lam / 10 < 1e-12 ? 0 : lam / 10; break; }
        lam = lam ? lam * 10 : 1e-6;
        if (lam > 1e12) break;
      }
      if (!acepto || lam > 1e12) break;
      if (Math.max(...Array.from(delta, (v, j) => abs(v) / max(abs(th[j]), 1e-10))) < 1e-12) { convergio = true; break; }
    }
    /* pulido: Gauss-Newton sin mirar la suma de cuadrados (está en su redondeo), hasta J'r = 0. Con residuos grandes
       (un modelo que no describe del todo los datos, como un log-logístico ante hormesis) el paso completo puede
       alejarse del óptimo: si los pasos no se achican a la mitad, se amortiguan (μ a la mitad). Si el pulido no llega
       o termina con más suma de cuadrados, se queda el punto de Levenberg-Marquardt. */
    const thLM = th, curLM = cur, rssLM = rss;
    let mu = 1, previo = Infinity, pulido = false;
    for (let k = 0; k < 400; k++) {
      const r = Float64Array.from(y, (v, i) => v - cur.v[i]), delta = paso(cur.J, n, q, r, 0);
      if (delta.some(v => !Number.isFinite(v))) break;
      const tam = Math.max(...Array.from(delta, (v, j) => abs(v) / max(abs(th[j]), 1e-10)));
      if (tam > 0.5 * previo && mu > 1 / 1024) mu /= 2;
      previo = tam;
      const nuevo = Float64Array.from(th, (v, j) => v + mu * delta[j]), e2 = ev.f(nuevo);
      if (e2.v.some(v => !Number.isFinite(v))) break;
      th = nuevo; cur = e2;
      if (tam < 1e-13) { pulido = true; break; }
    }
    if (!pulido || rssDe(y, cur.v) > rssLM * (1 + 1e-9)) { th = thLM; cur = curLM; }
    else convergio = true;
    rss = rssDe(y, cur.v);
    exigir(Number.isFinite(rss) && th.every(Number.isFinite), T('La curva no converge con estos datos.'), T('Prueba otro modelo o revisa que los datos tengan la forma que el modelo supone.'));
    return { th: Array.from(th), J: cur.J, v: cur.v, rss, convergio, q };
  }

  /** Covarianza σ²(J'J)⁻¹ (q × q por filas) por QR. */
  function covarianza(J, n, q, s2) {
    const d = SP.algebra.qr(J, n, q, 1e-12);
    exigir(d.rango === q, T('Los parámetros no se pueden estimar todos con estos datos (gradiente singular).'), T('Hacen falta más dosis o fechas distintas, o un modelo con menos parámetros.'));
    const Vk = SP.algebra.rtrInversa(d), V = new Float64Array(q * q);
    for (let i = 0; i < q; i++) for (let j = 0; j < q; j++) V[d.pivote[i] * q + d.pivote[j]] = s2 * Vk[i + j * q];
    return V;
  }

  /**
   * Intervalos por verosimilitud perfilada: para cada parámetro, el valor donde τ llega a −t y a +t. Se avanza desde
   * el estimado en pasos crecientes (cada ajuste arranca del anterior) hasta pasar ±t y la raíz se pule con el método
   * de Brent. Si el perfil no llega (una asíntota que los datos no acotan) o el ajuste falla, el límite queda faltante.
   */
  function intervalosPerfil(ev, Y0, C, rssSin, V, s2, ct) {
    const q = C.q, th = C.th, inf = new Array(q).fill(NaN), sup = new Array(q).fill(NaN);
    for (let j = 0; j < q; j++) {
      const ee = sqrt(V[j * q + j]), resto = th.filter((_, k) => k !== j);
      const ajusteEn = (b, desde) => { try { const r = ajustar(fijo(ev, j, b), Y0, desde); return Number.isFinite(r.rss) ? r : null; } catch (e) { return null; } };
      const tau = (b, r) => Math.sign(b - th[j]) * sqrt(max(0, r.rss - rssSin) / s2);
      for (const dir of [-1, 1]) {
        let prev = { b: th[j], t: 0, th: resto }, h = 0.75 * ct * ee, lim = NaN;
        for (let it = 0; it < 80; it++) {
          const b = prev.b + dir * h, r = ajusteEn(b, prev.th);
          /* fuera del dominio del modelo (p. ej. e ≤ 0) o sin ajuste: medio paso desde el último punto bueno */
          if (!r) { h /= 2; if (h < 1e-9 * max(abs(th[j]), ee)) break; continue; }
          const t = tau(b, r);
          if (abs(t) >= ct) {
            const desde = prev.th;
            let falla = false;
            const F = bb => { const rr = ajusteEn(bb, desde); if (!rr) { falla = true; return 0; } return tau(bb, rr) - dir * ct; };
            const raiz = SP.num.raizR(F, prev.b, b, prev.t - dir * ct, t - dir * ct, 1e-13 * max(abs(th[j]), ee), 300);
            if (!falla) lim = raiz;
            break;
          }
          prev = { b, t, th: r.th };
          h *= 1.6;
        }
        (dir < 0 ? inf : sup)[j] = lim;
      }
    }
    return { inf, sup };
  }

  /* ---------------- derivados (método delta) ---------------- */
  /** Pendiente de la curva df/dx (para la dosis económica). */
  function pendiente(modelo, x, p) {
    switch (modelo) {
      case 'cuadratico-meseta': return x < -p[1] / (2 * p[2]) ? p[1] + 2 * p[2] * x : 0;
      case 'mitscherlich': return p[1] * p[2] * exp(-p[2] * x);
      case 'mm2': return p[0] * p[1] / (p[1] + x) ** 2;
      case 'mm3': return (p[1] - p[0]) * p[2] / (p[2] + x) ** 2;
      case 'lineal-meseta': return x < p[2] ? p[1] : 0;
      default: return NaN;
    }
  }
  /** Parámetros de Brain-Cousens con nombre (c = 0 en el de 4 parámetros). */
  const bcPar = (modelo, p) => (modelo === 'bc5' ? { b: p[0], c: p[1], d: p[2], e: p[3], f: p[4] } : { b: p[0], c: 0, d: p[1], e: p[2], f: p[3] });
  /**
   * Hormesis: la dosis de máxima respuesta, donde f'(x) = 0, es la raíz de g(x) = f·(1 + E) − (d − c + f·x)·E·b/x (como
   * MAX de drc); existe con b > 1 y f > 0. La DEp es la dosis, más allá del máximo, donde la respuesta baja a
   * c + (1 − p/100)(d − c) (como ED de drc). Sus EE por la derivada implícita.
   */
  function derivadosBC(modelo, p, gr) {
    const { b, c, d, e, f } = bcPar(modelo, p), out = [], P = MODELOS[modelo].par;
    const val = x => brainCousens(x, b, c, d, e, f);
    const fx = x => { const E = pow(x / e, b), u = 1 + E, N = d - c + f * x; return (f * u - N * E * b / x) / (u * u); };
    let xmax = NaN;
    if (b > 1 && f > 0) {
      const gfun = x => { const E = pow(x / e, b); return f * (1 + E) - (d - c + f * x) * E * b / x; };
      let lo = e * 1e-8, hi = e;
      for (let k = 0; k < 80 && gfun(hi) > 0; k++) hi *= 2;
      if (gfun(lo) > 0 && gfun(hi) < 0) xmax = SP.num.raizR(gfun, lo, hi, undefined, undefined, 1e-14 * hi, 500);
    }
    const aGrad = o => P.map(n => o[n] || 0);
    if (Number.isFinite(xmax)) {
      const x = xmax, E = pow(x / e, b), L = log(x / e), N = d - c + f * x;
      const dgdx = N * b * E * (1 - b) / (x * x);
      const dg = { b: f * E * L - N * E * (1 + b * L) / x, c: b * E / x, d: -b * E / x, e: -f * b * E / e + N * b * b * E / (x * e), f: 1 + E * (1 - b) };
      const gx = {};
      for (const k of P) gx[k] = -dg[k] / dgdx;
      out.push({ nombre: 'dosis_maxima', valor: x, grad: aGrad(gx) });
      const [y, gy] = val(x), gyN = { b: gy[0], c: gy[1], d: gy[2], e: gy[3], f: gy[4] };
      out.push({ nombre: 'respuesta_maxima', valor: y, grad: aGrad(gyN) });
    }
    /* DE50: después del máximo (o desde la dosis cero), la respuesta baja a la mitad entre d y c */
    const t = 0.5, meta = c + t * (d - c), G = x => val(x)[0] - meta;
    let lo = Number.isFinite(xmax) ? xmax : e * 1e-8, hi = max(e, lo * 2);
    for (let k = 0; k < 80 && G(hi) > 0; k++) hi *= 2;
    if (G(lo) > 0 && G(hi) < 0) {
      const x = SP.num.raizR(G, lo, hi, undefined, undefined, 1e-14 * hi, 500), [, gf] = val(x), dfdx = fx(x);
      const gfN = { b: gf[0], c: gf[1], d: gf[2], e: gf[3], f: gf[4] }, dm = { c: 1 - t, d: t }, gx = {};
      for (const k of P) gx[k] = -(gfN[k] - (dm[k] || 0)) / dfdx;
      out.unshift({ nombre: 'DE50', valor: x, grad: aGrad(gx) });
    }
    return out;
  }
  function derivados(modelo, p) {
    const P = MODELOS[modelo].par, ix = n => P.indexOf(n), gr = obj => P.map(n => obj[n] || 0);
    const ed = q0 => { const k = q0 / (100 - q0), b = p[ix('b')], e = p[ix('e')]; return { nombre: 'DE' + q0, valor: e * pow(k, 1 / b), grad: gr({ b: -e * pow(k, 1 / b) * log(k) / (b * b), e: pow(k, 1 / b) }) }; };
    switch (modelo) {
      case 'gompertz': { const b2 = p[1], b3 = p[2]; return [{ nombre: 'inflexion', valor: -log(b2) / log(b3), grad: gr({ b2: -1 / (b2 * log(b3)), b3: log(b2) / (b3 * log(b3) ** 2) }) }]; }
      case 'll4': case 'll3': return [ed(10), ed(50), ed(90)];
      case 'bc4': case 'bc5': return derivadosBC(modelo, p);
      case 'cuadratico-meseta': { const [a, b, c] = p; return [{ nombre: 'dosis_optima', valor: -b / (2 * c), grad: gr({ b: -1 / (2 * c), c: b / (2 * c * c) }) },
        { nombre: 'meseta', valor: a - b * b / (4 * c), grad: gr({ a: 1, b: -b / (2 * c), c: b * b / (4 * c * c) }) }]; }
      case 'lineal-meseta': { const [a, b, x0] = p; return [{ nombre: 'meseta', valor: a + b * x0, grad: gr({ a: 1, b: x0, x0: b }) }]; }
      default: return [];
    }
  }
  /** Modelos con dosis económica: la curva sube con pendiente que decrece. */
  const ECONOMICOS = new Set(['cuadratico-meseta', 'lineal-meseta', 'mitscherlich', 'mm2', 'mm3']);
  /**
   * Dosis económica óptima: donde la pendiente de la curva iguala la razón de precios r = precio del insumo / precio del
   * producto (cada unidad más de insumo ya no paga lo que cuesta). Si la curva empieza más plana que r, no conviene
   * aplicar (dosis 0, sin EE). En lineal-meseta es el inicio de la meseta mientras la pendiente pague el insumo.
   */
  function dosisEconomica(modelo, p, r) {
    const P = MODELOS[modelo].par, gr = obj => P.map(n => obj[n] || 0);
    let x, g;
    switch (modelo) {
      case 'cuadratico-meseta': { const [, b, c] = p; x = (r - b) / (2 * c); g = { b: -1 / (2 * c), c: -(r - b) / (2 * c * c) }; break; }
      case 'mitscherlich': { const [, b, c] = p, L = log(b * c / r); x = L / c; g = { b: 1 / (b * c), c: (1 - L) / (c * c) }; break; }
      case 'mm2': { const [d, e] = p, s = sqrt(d * e / r); x = s - e; g = { d: 0.5 * sqrt(e / (d * r)), e: 0.5 * sqrt(d / (e * r)) - 1 }; break; }
      case 'mm3': { const [c, d, e] = p, k = d - c, s = sqrt(k * e / r); x = s - e; g = { c: -0.5 * sqrt(e / (k * r)), d: 0.5 * sqrt(e / (k * r)), e: 0.5 * sqrt(k / (e * r)) - 1 }; break; }
      case 'lineal-meseta': { const [, b, x0] = p; if (b > r) { x = x0; g = { x0: 1 }; } else { x = 0; g = null; } break; }
      default: return [];
    }
    if (!(x > 0)) return [{ nombre: 'dosis_economica', valor: 0, grad: P.map(() => NaN), recortada: true }, { nombre: 'respuesta_economica', valor: MODELOS[modelo].f(0, p)[0], grad: MODELOS[modelo].f(0, p)[1], recortada: true }];
    const gx = gr(g), [y, gf] = MODELOS[modelo].f(x, p), m = modelo === 'lineal-meseta' ? 0 : pendiente(modelo, x, p);
    /* respuesta en la dosis económica: ∂f/∂θ + f'(x)·∂x/∂θ (en lineal-meseta, la meseta a + b·x0) */
    return [{ nombre: 'dosis_economica', valor: x, grad: gx }, { nombre: 'respuesta_economica', valor: y, grad: gf.map((v, k) => v + m * gx[k]) }];
  }

  /**
   * Ajuste completo: el modelo con cada parámetro por grupo (o una sola curva), sus EE, los derivados y, con grupos,
   * la comparación de curvas.
   * @param {number[]} x, y  datos completos
   * @param {Int32Array|null} g  código de grupo (0…G−1) o null
   * @param {string[]} niveles  nombres de los grupos
   * @param {object} [extra]  { pesos: number[] | null, intervalo: 'wald' | 'perfil', precios: { producto, insumo } | null }
   */
  function analizar(modelo, x, y, g, niveles, nivel, extra) {
    const ex = extra || {}, w = ex.pesos || null;
    const M = MODELOS[modelo], P = M.par.length, G = g ? niveles.length : 1, gg = g || new Int32Array(x.length), n = x.length;
    /* las celdas (x, grupo): con al menos dos filas por celda en promedio, el ajuste va sobre sus medias pesadas */
    const K = celdas(x, y, gg, w);
    const X0 = K ? K.x : x, G0 = K ? K.g : gg, R0 = K ? K.raiz : (w ? Float64Array.from(w, sqrt) : null);
    const Y0 = K ? K.y : (w ? Float64Array.from(y, (v, i) => v * R0[i]) : y), dentro = K ? K.dentro : 0;
    const sub = (a, i) => i.map(k => a[k]);
    const ajustePatron = porGrupo => {
      let ini;
      if (modelo === 'lineal-meseta') ini = mesetaPorPatron(x, y, w, gg, G, porGrupo.length ? porGrupo : [false, false, false]);
      else if (porGrupo.some(Boolean)) {
        const pg = niveles.map((_, h) => {
          const i = idxDe(gg, h), c = idxDe(G0, h);
          return ajustar(evaluador(modelo, sub(X0, c), new Int32Array(c.length), 1, M.par.map(() => false), R0 ? sub(R0, c) : null), sub(Y0, c), inicio(modelo, sub(x, i), sub(y, i), w && sub(w, i))).th;
        });
        ini = M.par.map((_, k) => (porGrupo[k] ? pg.map(v => v[k]) : [pg.reduce((s, v) => s + v[k], 0) / G]));
      } else ini = inicio(modelo, x, y, w).map(v => [v]);
      const ev = evaluador(modelo, X0, G0, G, porGrupo, R0), r = ajustar(ev, Y0, ini.flat());
      return Object.assign(r, { rssSin: r.rss, rss: r.rss + dentro, ev });
    };
    const pgCompleto = M.par.map(() => G > 1), C = ajustePatron(pgCompleto), q = C.q, gl = n - q;
    exigir(gl > 0, T('Hay tantos parámetros como observaciones: faltan datos para la curva.'));
    const s2 = C.rss / gl, V = covarianza(C.J, X0.length, q, s2), ct = SP.dist.qt(1 - (1 - nivel) / 2, gl);
    const parDe = h => M.par.map((_, k) => C.th[G > 1 ? k * G + h : k]);
    const ajustados = (K || w) ? (() => { const ph = Array.from({ length: G }, (_, h) => parDe(h)); return Array.from(x, (v, i) => M.f(v, ph[gg[i]])[0]); })() : Array.from(C.v);
    const ee = C.th.map((_, j) => sqrt(V[j * q + j])), tv = C.th.map((b, j) => b / ee[j]);
    let sw = 0, my = 0, slw = 0;
    for (let i = 0; i < n; i++) { const k = w ? w[i] : 1; sw += k; my += k * y[i]; slw += log(k); }
    my /= sw;
    let tss = 0; for (let i = 0; i < n; i++) tss += (w ? w[i] : 1) * (y[i] - my) ** 2;
    const ll = -n / 2 * (log(2 * Math.PI) + 1 - log(n) - slw / n + log(C.rss));
    const perfil = ex.intervalo === 'perfil' && !SIN_PERFIL.has(modelo);
    const ic = perfil ? intervalosPerfil(C.ev, Y0, C, C.rssSin, V, s2, ct) : { inf: C.th.map((b, j) => b - ct * ee[j]), sup: C.th.map((b, j) => b + ct * ee[j]) };
    const out = {
      parametros: { estimado: C.th, ee, t: tv, p: tv.map(t => 2 * SP.dist.pt(abs(t), gl, false)), ic_inf: ic.inf, ic_sup: ic.sup,
        nombre: G > 1 ? M.par.flatMap(pn => niveles.map(h => pn + '.' + h)) : M.par.slice(), parametro: G > 1 ? M.par.flatMap(pn => niveles.map(() => pn)) : M.par.slice(), grupo: G > 1 ? M.par.flatMap(() => niveles.slice()) : M.par.map(() => '') },
      intervalo: perfil ? 'perfil' : 'wald',
      ajuste: { n, gl, rss: C.rss, sigma: sqrt(s2), r2: 1 - C.rss / tss, logLik: ll, AIC: -2 * ll + 2 * (q + 1), BIC: -2 * ll + log(n) * (q + 1), convergio: C.convergio, ponderado: !!w },
      ajustados,
    };
    const pr = ex.precios, econ = pr && pr.producto > 0 && pr.insumo > 0 && ECONOMICOS.has(modelo);
    if (econ) out.precios = { producto: pr.producto, insumo: pr.insumo, razon: pr.insumo / pr.producto };
    out.derivados = [];
    for (let h = 0; h < G; h++) {
      const idx = M.par.map((_, k) => (G > 1 ? k * G + h : k)), ph = idx.map(j => C.th[j]);
      const lista = derivados(modelo, ph).concat(econ ? dosisEconomica(modelo, ph, out.precios.razon) : []);
      for (const z of lista) {
        let s = 0;
        for (let a = 0; a < P; a++) for (let b = 0; b < P; b++) s += z.grad[a] * V[idx[a] * q + idx[b]] * z.grad[b];
        const e = z.recortada ? NaN : sqrt(s);
        out.derivados.push(Object.assign({ nombre: z.nombre, grupo: G > 1 ? niveles[h] : '', valor: z.valor, ee: e, ic: [z.valor - ct * e, z.valor + ct * e] }, z.recortada ? { recortada: true } : {}));
      }
    }
    /* la curva de cada grupo para la gráfica */
    const xs = [min(...x), max(...x)], malla = Array.from({ length: 121 }, (_, k) => xs[0] + (xs[1] - xs[0]) * k / 120);
    out.curvas = Array.from({ length: G }, (_, h) => { const ph = parDe(h); return { grupo: G > 1 ? niveles[h] : '', x: malla, y: malla.map(v => M.f(v, ph)[0]), parametros: ph }; });
    if (G > 1) {
      const ftest = red => { const g1 = (n - red.q) - gl, F = ((red.rss - C.rss) / g1) / s2; return { F, gl1: g1, gl2: gl, p: SP.dist.pf(F, g1, gl, false) }; };
      out.comparacion = { global: ftest(ajustePatron(M.par.map(() => false))),
        parametros: M.par.map((pn, k) => Object.assign({ parametro: pn }, ftest(ajustePatron(M.par.map((_, j) => j !== k))))) };
    }
    return out;
  }
  const idxDe = (g, h) => { const r = []; for (let i = 0; i < g.length; i++) if (g[i] === h) r.push(i); return r; };
  /** Las celdas (x, grupo) con su peso total, √peso·media y la suma de cuadrados dentro; null si casi no se repiten. */
  function celdas(x, y, g, w) {
    const n = x.length, mapa = new Map(), cod = new Int32Array(n);
    for (let i = 0; i < n; i++) { const k = g[i] + '|' + x[i]; let c = mapa.get(k); if (c === undefined) { c = mapa.size; mapa.set(k, c); } cod[i] = c; }
    const m = mapa.size;
    if (m > n / 2) return null;
    const cx = new Float64Array(m), cg = new Int32Array(m), cn = new Float64Array(m), cs = new Float64Array(m);
    for (let i = 0; i < n; i++) { const c = cod[i], k = w ? w[i] : 1; cx[c] = x[i]; cg[c] = g[i]; cn[c] += k; cs[c] += k * y[i]; }
    const media = Float64Array.from(cs, (v, c) => v / cn[c]);
    let dentro = 0;
    for (let i = 0; i < n; i++) dentro += (w ? w[i] : 1) * (y[i] - media[cod[i]]) ** 2;
    const raiz = Float64Array.from(cn, sqrt);
    return { x: cx, g: cg, raiz, y: Float64Array.from(media, (v, c) => v * raiz[c]), dentro };
  }

  SP.nolineal = { MODELOS, SIN_PERFIL, ECONOMICOS, inicio, perfilMeseta, mesetaPorPatron, brentMin, ajustar, evaluador, fijo, analizar, derivados, dosisEconomica, pendiente };
});
