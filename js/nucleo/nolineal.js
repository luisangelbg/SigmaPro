/* SigmaPro — regresión no lineal por mínimos cuadrados: modelos de crecimiento, dosis-respuesta y respuesta con meseta.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada modelo trae su valor y su gradiente analítico. El ajuste es de Levenberg-Marquardt (cada paso por QR de la
   matriz aumentada [J; √λ·D]) desde valores iniciales por linealización, y termina con pasos de Gauss-Newton puros hasta
   que el paso relativo baja de 1e-13 (como la referencia en R: nls se detiene cuando la suma de cuadrados ya no
   distingue mejoras de su redondeo). Lineal-meseta no es derivable en x0: su óptimo se busca por perfil (en cada
   intervalo entre dosis observadas, x0 por el método de Brent con a y b por mínimos cuadrados) y luego se pule igual.
   Con grupos, cada parámetro puede ser común o uno por grupo (en el orden de nls: por parámetro y, dentro, por grupo);
   así se comparan curvas con la prueba F de la suma de cuadrados extra.
   EE: σ²·(J'J)⁻¹ con σ² = SCR/(n − p), como summary.nls; log L = −n/2·(log 2π + 1 − log n + log SCR), como logLik.nls. */
SP.definir('nolineal', function (SP) {
  'use strict';
  const T = SP.T;
  const { exp, log, abs, max, min, sqrt, pow } = Math;

  /* ---------------- modelos: f(x, p) → [valor, gradiente] ---------------- */
  const MODELOS = {
    logistico: { par: ['Asym', 'xmid', 'scal'], f: (x, p) => { const E = exp((p[1] - x) / p[2]), u = 1 + E; return [p[0] / u, [1 / u, -p[0] * E / (u * u) / p[2], p[0] * E / (u * u) * (p[1] - x) / (p[2] * p[2])]]; } },
    gompertz: { par: ['Asym', 'b2', 'b3'], f: (x, p) => { const B = pow(p[2], x), E = exp(-p[1] * B); return [p[0] * E, [E, -p[0] * B * E, -p[0] * p[1] * x * pow(p[2], x - 1) * E]]; } },
    weibull: { par: ['Asym', 'Drop', 'lrc', 'pwr'], f: (x, p) => { const u = exp(p[2]) * pow(x, p[3]), E = exp(-u); return [p[0] - p[1] * E, [1, -E, p[1] * E * u, x > 0 ? p[1] * E * u * log(x) : 0]]; } },
    ll4: { par: ['b', 'c', 'd', 'e'], f: (x, p) => {
      const E = x > 0 ? pow(x / p[3], p[0]) : (p[0] > 0 ? 0 : Infinity);
      if (!Number.isFinite(E)) return [p[1], [0, 1, 0, 0]];
      const u = 1 + E, lg = x > 0 ? log(x / p[3]) : 0;
      return [p[1] + (p[2] - p[1]) / u, [x > 0 ? -(p[2] - p[1]) * E * lg / (u * u) : 0, E / u, 1 / u, (p[2] - p[1]) * E * (p[0] / p[3]) / (u * u)]];
    } },
    ll3: { par: ['b', 'd', 'e'], f: (x, p) => {
      const E = x > 0 ? pow(x / p[2], p[0]) : (p[0] > 0 ? 0 : Infinity);
      if (!Number.isFinite(E)) return [0, [0, 0, 0]];
      const u = 1 + E, lg = x > 0 ? log(x / p[2]) : 0;
      return [p[1] / u, [x > 0 ? -p[1] * E * lg / (u * u) : 0, 1 / u, p[1] * E * (p[0] / p[2]) / (u * u)]];
    } },
    mitscherlich: { par: ['a', 'b', 'c'], f: (x, p) => { const E = exp(-p[2] * x); return [p[0] - p[1] * E, [1, -E, p[1] * x * E]]; } },
    'cuadratico-meseta': { par: ['a', 'b', 'c'], f: (x, p) => {
      const x0 = -p[1] / (2 * p[2]);
      return x < x0 ? [p[0] + p[1] * x + p[2] * x * x, [1, x, x * x]] : [p[0] - p[1] * p[1] / (4 * p[2]), [1, -p[1] / (2 * p[2]), p[1] * p[1] / (4 * p[2] * p[2])]];
    } },
    'lineal-meseta': { par: ['a', 'b', 'x0'], f: (x, p) => (x < p[2] ? [p[0] + p[1] * x, [1, x, 0]] : [p[0] + p[1] * p[2], [1, p[2], p[1]]]) },
  };

  /* ---------------- valores iniciales ---------------- */
  /** Recta de mínimos cuadrados de w sobre z: [intercepto, pendiente]. */
  function recta(z, w) {
    const n = z.length;
    let mz = 0, mw = 0;
    for (let i = 0; i < n; i++) { mz += z[i]; mw += w[i]; }
    mz /= n; mw /= n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { sxy += (z[i] - mz) * (w[i] - mw); sxx += (z[i] - mz) ** 2; }
    const b = sxy / sxx;
    return [mw - b * mz, b];
  }
  const filtro = (x, y, ok, fz, fw) => { const z = [], w = []; for (let i = 0; i < x.length; i++) if (ok(x[i], y[i])) { z.push(fz(x[i], y[i])); w.push(fw(x[i], y[i])); } return [z, w]; };
  function inicio(modelo, x, y) {
    const ymax = max(...y), ymin = min(...y), rango = ymax - ymin;
    switch (modelo) {
      case 'logistico': { const A = ymax * 1.05, [z, w] = filtro(x, y, (a, b) => b > 0 && b < A, a => a, (a, b) => log(b / (A - b))), [i0, s] = recta(z, w); return [A, -i0 / s, 1 / s]; }
      case 'gompertz': { const A = ymax * 1.05, [z, w] = filtro(x, y, (a, b) => b > 0 && b < A, a => a, (a, b) => log(-log(b / A))), [i0, s] = recta(z, w); return [A, exp(i0), exp(s)]; }
      case 'weibull': { const A = ymax * 1.05, Dr = A - ymin * 0.95, [z, w] = filtro(x, y, (a, b) => a > 0 && (A - b) / Dr > 0 && (A - b) / Dr < 1, a => log(a), (a, b) => log(-log((A - b) / Dr))), [i0, s] = recta(z, w); return [A, Dr, i0, s]; }
      case 'mitscherlich': { const A = ymax * 1.05, [z, w] = filtro(x, y, (a, b) => A - b > 0, a => a, (a, b) => log(A - b)), [i0, s] = recta(z, w); return [A, exp(i0), -s]; }
      case 'll4': { const c = ymin - 0.05 * rango, d = ymax + 0.05 * rango, [z, w] = filtro(x, y, a => a > 0, a => log(a), (a, b) => log((d - b) / (b - c))), [i0, s] = recta(z, w); return [s, c, d, exp(-i0 / s)]; }
      case 'll3': { const d = ymax * 1.05, [z, w] = filtro(x, y, (a, b) => a > 0 && b > 0, a => log(a), (a, b) => log((d - b) / b)), [i0, s] = recta(z, w); return [s, d, exp(-i0 / s)]; }
      case 'cuadratico-meseta': {
        const n = x.length, X = new Float64Array(n * 3);
        for (let i = 0; i < n; i++) { X[i] = 1; X[i + n] = x[i]; X[i + 2 * n] = x[i] * x[i]; }
        return Array.from(SP.algebra.minimosCuadrados(X, n, 3, Float64Array.from(y)).coeficientes);
      }
      case 'lineal-meseta': return perfilMeseta(x, y);
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
  /** Lineal-meseta por perfil: en cada intervalo entre x distintas, x0 por Brent (a y b por mínimos cuadrados). */
  function perfilMeseta(x, y) {
    const ux = [...new Set(x)].sort((a, b) => a - b), n = x.length;
    exigir(ux.length >= 3, T('Lineal-meseta necesita al menos tres dosis distintas.'));
    const ab = x0 => { const z = x.map(v => min(v, x0)), [i0, s] = recta(z, y); let r = 0; for (let i = 0; i < n; i++) r += (y[i] - i0 - s * z[i]) ** 2; return { a: i0, b: s, rss: r }; };
    let mejor = null;
    for (let k = 1; k < ux.length - 1; k++) {
      const o = brentMin(x0 => ab(x0).rss, ux[k - 1], ux[k + 1], 1e-14);
      if (!mejor || o.f < mejor.f) mejor = o;
    }
    const r = ab(mejor.x);
    return [r.a, r.b, mejor.x];
  }
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };

  /* ---------------- ajuste ---------------- */
  /**
   * Valor y gradiente del modelo con parámetros comunes o por grupo.
   * @param {boolean[]} porGrupo  por parámetro
   * @returns {(th) => { v: Float64Array, J: Float64Array (n × q por columnas) }}
   */
  function evaluador(modelo, x, g, G, porGrupo) {
    const M = MODELOS[modelo], P = M.par.length, n = x.length, cols = porGrupo.map(pg => (pg ? G : 1)), ini = [];
    let q = 0;
    cols.forEach(c => { ini.push(q); q += c; });
    return {
      q, cols, ini,
      f(th) {
        const v = new Float64Array(n), J = new Float64Array(n * q), p = new Array(P);
        for (let i = 0; i < n; i++) {
          for (let k = 0; k < P; k++) p[k] = th[ini[k] + (porGrupo[k] ? g[i] : 0)];
          const [val, gr] = M.f(x[i], p);
          v[i] = val;
          for (let k = 0; k < P; k++) J[i + (ini[k] + (porGrupo[k] ? g[i] : 0)) * n] = gr[k];
        }
        return { v, J };
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
    /* pulido: Gauss-Newton puro, sin mirar la suma de cuadrados (está en su redondeo) */
    for (let k = 0; k < 200; k++) {
      const r = Float64Array.from(y, (v, i) => v - cur.v[i]), delta = paso(cur.J, n, q, r, 0);
      if (delta.some(v => !Number.isFinite(v))) break;
      const nuevo = Float64Array.from(th, (v, j) => v + delta[j]), e2 = ev.f(nuevo);
      if (e2.v.some(v => !Number.isFinite(v))) break;
      th = nuevo; cur = e2;
      if (Math.max(...Array.from(delta, (v, j) => abs(v) / max(abs(th[j]), 1e-10))) < 1e-13) { convergio = true; break; }
    }
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

  /* ---------------- derivados (método delta) ---------------- */
  function derivados(modelo, p) {
    const P = MODELOS[modelo].par, ix = n => P.indexOf(n), gr = obj => P.map(n => obj[n] || 0);
    const ed = q0 => { const k = q0 / (100 - q0), b = p[ix('b')], e = p[ix('e')]; return { nombre: 'DE' + q0, valor: e * pow(k, 1 / b), grad: gr({ b: -e * pow(k, 1 / b) * log(k) / (b * b), e: pow(k, 1 / b) }) }; };
    switch (modelo) {
      case 'gompertz': { const b2 = p[1], b3 = p[2]; return [{ nombre: 'inflexion', valor: -log(b2) / log(b3), grad: gr({ b2: -1 / (b2 * log(b3)), b3: log(b2) / (b3 * log(b3) ** 2) }) }]; }
      case 'll4': case 'll3': return [ed(10), ed(50), ed(90)];
      case 'cuadratico-meseta': { const [a, b, c] = p; return [{ nombre: 'dosis_optima', valor: -b / (2 * c), grad: gr({ b: -1 / (2 * c), c: b / (2 * c * c) }) },
        { nombre: 'meseta', valor: a - b * b / (4 * c), grad: gr({ a: 1, b: -b / (2 * c), c: b * b / (4 * c * c) }) }]; }
      case 'lineal-meseta': { const [a, b, x0] = p; return [{ nombre: 'meseta', valor: a + b * x0, grad: gr({ a: 1, b: x0, x0: b }) }]; }
      default: return [];
    }
  }

  /**
   * Ajuste completo: el modelo con cada parámetro por grupo (o una sola curva), sus EE, los derivados y, con grupos,
   * la comparación de curvas.
   * @param {number[]} x, y  datos completos
   * @param {Int32Array|null} g  código de grupo (0…G−1) o null
   * @param {string[]} niveles  nombres de los grupos
   */
  function analizar(modelo, x, y, g, niveles, nivel) {
    const M = MODELOS[modelo], P = M.par.length, G = g ? niveles.length : 1, gg = g || new Int32Array(x.length), n = x.length;
    const dosConGrupo = porGrupo => {
      let ini;
      if (modelo === 'lineal-meseta') {
        ini = porGrupo.some(Boolean) ? (() => { const pg = niveles.map((_, h) => { const i = idxDe(gg, h); return perfilMeseta(i.map(k => x[k]), i.map(k => y[k])); }); return M.par.map((_, k) => pg.map(v => v[k])); })()
          : inicio(modelo, x, y).map(v => [v]);
      } else if (porGrupo.some(Boolean)) {
        const pg = niveles.map((_, h) => { const i = idxDe(gg, h), xs = i.map(k => x[k]), ys = i.map(k => y[k]); return ajustar(evaluador(modelo, xs, new Int32Array(xs.length), 1, M.par.map(() => false)), ys, inicio(modelo, xs, ys)).th; });
        ini = M.par.map((_, k) => (porGrupo[k] ? pg.map(v => v[k]) : [pg.reduce((s, v) => s + v[k], 0) / G]));
      } else ini = inicio(modelo, x, y).map(v => [v]);
      const ev = evaluador(modelo, x, gg, G, porGrupo);
      return ajustar(ev, y, ini.flat());
    };
    const pgCompleto = M.par.map(() => G > 1), C = dosConGrupo(pgCompleto), q = C.q, gl = n - q;
    exigir(gl > 0, T('Hay tantos parámetros como observaciones: faltan datos para la curva.'));
    const s2 = C.rss / gl, V = covarianza(C.J, n, q, s2), ct = SP.dist.qt(1 - (1 - nivel) / 2, gl);
    const ee = C.th.map((_, j) => sqrt(V[j * q + j])), tv = C.th.map((b, j) => b / ee[j]);
    let my = 0; for (const v of y) my += v; my /= n;
    let tss = 0; for (const v of y) tss += (v - my) ** 2;
    const ll = -n / 2 * (log(2 * Math.PI) + 1 - log(n) + log(C.rss));
    const out = {
      parametros: { estimado: C.th, ee, t: tv, p: tv.map(t => 2 * SP.dist.pt(abs(t), gl, false)), ic_inf: C.th.map((b, j) => b - ct * ee[j]), ic_sup: C.th.map((b, j) => b + ct * ee[j]),
        nombre: G > 1 ? M.par.flatMap(pn => niveles.map(h => pn + '.' + h)) : M.par.slice(), parametro: G > 1 ? M.par.flatMap(pn => niveles.map(() => pn)) : M.par.slice(), grupo: G > 1 ? M.par.flatMap(() => niveles.slice()) : M.par.map(() => '') },
      ajuste: { n, gl, rss: C.rss, sigma: sqrt(s2), r2: 1 - C.rss / tss, logLik: ll, AIC: -2 * ll + 2 * (q + 1), BIC: -2 * ll + log(n) * (q + 1), convergio: C.convergio },
      ajustados: Array.from(C.v),
    };
    out.derivados = [];
    for (let h = 0; h < G; h++) {
      const idx = M.par.map((_, k) => (G > 1 ? k * G + h : k)), ph = idx.map(j => C.th[j]);
      for (const z of derivados(modelo, ph)) {
        let s = 0;
        for (let a = 0; a < P; a++) for (let b = 0; b < P; b++) s += z.grad[a] * V[idx[a] * q + idx[b]] * z.grad[b];
        const e = sqrt(s);
        out.derivados.push({ nombre: z.nombre, grupo: G > 1 ? niveles[h] : '', valor: z.valor, ee: e, ic: [z.valor - ct * e, z.valor + ct * e] });
      }
    }
    /* la curva de cada grupo para la gráfica */
    const xs = [min(...x), max(...x)], malla = Array.from({ length: 121 }, (_, k) => xs[0] + (xs[1] - xs[0]) * k / 120);
    out.curvas = Array.from({ length: G }, (_, h) => { const ph = M.par.map((_, k) => C.th[G > 1 ? k * G + h : k]); return { grupo: G > 1 ? niveles[h] : '', x: malla, y: malla.map(v => M.f(v, ph)[0]) }; });
    if (G > 1) {
      const ftest = red => { const g1 = (n - red.q) - gl, F = ((red.rss - C.rss) / g1) / s2; return { F, gl1: g1, gl2: gl, p: SP.dist.pf(F, g1, gl, false) }; };
      out.comparacion = { global: ftest(dosConGrupo(M.par.map(() => false))),
        parametros: modelo === 'lineal-meseta' ? [] : M.par.map((pn, k) => Object.assign({ parametro: pn }, ftest(dosConGrupo(M.par.map((_, j) => j !== k))))) };
    }
    return out;
  }
  const idxDe = (g, h) => { const r = []; for (let i = 0; i < g.length; i++) if (g[i] === h) r.push(i); return r; };

  SP.nolineal = { MODELOS, inicio, perfilMeseta, brentMin, ajustar, evaluador, analizar, derivados };
});
