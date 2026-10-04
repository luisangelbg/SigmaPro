/* SigmaPro — modelos lineales generalizados: familias, enlaces y ajuste por mínimos cuadrados iterativamente reponderados.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El ajuste sigue a glm.fit de R (Nelder y Wedderburn 1972; McCullagh y Nelder 1989): desde μ inicial de la familia,
   cada paso resuelve por QR (pivoteo limitado, columnas colineales fuera) la regresión ponderada de la respuesta de
   trabajo z = η − desplazamiento + (y − μ)/(dμ/dη) con pesos w·(dμ/dη)²/V(μ); si la devianza no es finita o μ no es
   válida, el paso se reduce a la mitad. Converge cuando el cambio relativo de la devianza baja de 1e-14 (R usa 1e-8;
   así el óptimo queda con todas sus cifras). Los límites de los enlaces (μ en [ε, 1 − ε], η en ±30 en logit…) son los
   de R, para que con datos extremos el resultado sea el mismo.
   Binomial negativa (como MASS::glm.nb): se alternan el ajuste con θ fija y θ por Newton (el gradiente y la
   información de theta.ml) hasta que θ no cambie; el EE de θ es la raíz del inverso de la información en el óptimo.
   La covarianza de los coeficientes es φ·(X'WX)⁻¹ con los pesos del óptimo; φ = 1 en binomial, Poisson y binomial
   negativa, y la de Pearson (Σ w(y − μ)²/V(μ) / gl) en las cuasi y la gamma. */
SP.definir('glm', function (SP) {
  'use strict';
  const T = SP.T;
  const { log, exp, sqrt, abs, max, min, expm1, log1p } = Math;
  const EPS = 2.220446049250313e-16;
  const D = () => SP.dist;

  /* ---------------- funciones especiales ---------------- */
  /** ψ(x) (digamma), x > 0: recurrencia hasta x ≥ 10 y la serie asintótica. */
  function digamma(x) {
    let r = 0;
    while (x < 10) { r -= 1 / x; x += 1; }
    const f = 1 / (x * x);
    return r + log(x) - 0.5 / x - f * (1 / 12 - f * (1 / 120 - f * (1 / 252 - f * (1 / 240 - f * (1 / 132 - f * (691 / 32760 - f / 12))))));
  }
  /** ψ'(x) (trigamma), x > 0. */
  function trigamma(x) {
    let r = 0;
    while (x < 10) { r += 1 / (x * x); x += 1; }
    const f = 1 / (x * x);
    return r + 1 / x + f / 2 + (f / x) * (1 / 6 - f * (1 / 30 - f * (1 / 42 - f * (1 / 30 - f * (5 / 66 - f * (691 / 2730 - f * 7 / 6))))));
  }
  const lg = x => D().lgamma(x);

  /* ---------------- enlaces (los de R: make.link y binomial) ---------------- */
  const PROBIT = -D().qnorm(EPS);   // umbral de η en probit (|η| ≤ 8.12)
  const ENLACES = {
    logit: {
      fun: m => log(m / (1 - m)),
      inv: e => { const t = e < -30 ? EPS : e > 30 ? 1 / EPS : exp(e); return t / (1 + t); },
      deta: e => { if (e > 30 || e < -30) return EPS; const t = exp(e); return t / ((1 + t) * (1 + t)); },
      valido: () => true,
    },
    probit: {
      fun: m => D().qnorm(m),
      inv: e => D().pnorm(min(max(e, -PROBIT), PROBIT)),
      deta: e => max(exp(-0.5 * e * e) / 2.5066282746310002, EPS),
      valido: () => true,
    },
    cloglog: {
      fun: m => log(-log1p(-m)),
      inv: e => max(min(-expm1(-exp(e)), 1 - EPS), EPS),
      deta: e => { e = min(e, 700); return max(exp(e) * exp(-exp(e)), EPS); },
      valido: () => true,
    },
    log: { fun: m => log(m), inv: e => max(exp(e), EPS), deta: e => max(exp(e), EPS), valido: () => true },
    inverso: { fun: m => 1 / m, inv: e => 1 / e, deta: e => -1 / (e * e), valido: e => Number.isFinite(e) && e !== 0 },
    identidad: { fun: m => m, inv: e => e, deta: () => 1, valido: () => true },
  };
  const NOMBRE_ENLACE = { logit: 'logit', probit: 'probit', cloglog: 'cloglog', log: 'log', inverso: 'inverse', identidad: 'identity' };

  /* ---------------- familias ---------------- */
  const yLogY = (y, m) => (y !== 0 ? y * log(y / m) : 0);
  const FAMILIAS = {
    binomial: {
      nombre: 'binomial', enlaces: ['logit', 'probit', 'cloglog'], dispFija: true,
      varianza: m => m * (1 - m),
      dev: (y, m, w) => 2 * w * (yLogY(y, m) + yLogY(1 - y, 1 - m)),
      inicio: (y, w) => (w * y + 0.5) / (w + 1),
      valida: m => Number.isFinite(m) && m > 0 && m < 1,
      /* −2 log L: Σ log dbinom(round(n·y), round(n), μ) con n = el peso previo (los ensayos) */
      m2ll: (y, m, w) => { const n = Math.round(w), k = Math.round(w * y); return -2 * (lg(n + 1) - lg(k + 1) - lg(n - k + 1) + (k > 0 ? k * log(m) : 0) + (n - k > 0 ? (n - k) * log1p(-m) : 0)); },
    },
    poisson: {
      nombre: 'poisson', enlaces: ['log', 'identidad'], dispFija: true,
      varianza: m => m,
      dev: (y, m, w) => 2 * (y > 0 ? w * (y * log(y / m) - (y - m)) : m * w),
      inicio: y => y + 0.1,
      valida: m => Number.isFinite(m) && m > 0,
      m2ll: (y, m, w) => -2 * w * ((y > 0 ? y * log(m) : 0) - m - lg(y + 1)),
    },
    gamma: {
      nombre: 'Gamma', enlaces: ['log', 'inverso', 'identidad'], dispFija: false, extra: 1,
      varianza: m => m * m,
      dev: (y, m, w) => -2 * w * (log(y === 0 ? 1 : y / m) - (y - m) / m),
      inicio: y => y,
      valida: m => Number.isFinite(m) && m > 0,
    },
    'binomial-negativa': {
      nombre: 'Negative Binomial', enlaces: ['log', 'identidad'], dispFija: true, extra: 1,
      varianza: (m, th) => m + m * m / th,
      dev: (y, m, w, th) => 2 * w * (y * log(max(1, y) / m) - (y + th) * log((y + th) / (m + th))),
      inicio: y => y + (y === 0 ? 1 / 6 : 0),
      valida: m => Number.isFinite(m) && m > 0,
      ll: (y, m, w, th) => w * (lg(th + y) - lg(th) - lg(y + 1) + th * log(th) + y * log(m + (y === 0 ? 1 : 0)) - (th + y) * log(th + m)),
    },
  };
  FAMILIAS.cuasibinomial = Object.assign({}, FAMILIAS.binomial, { nombre: 'quasibinomial', dispFija: false, m2ll: null });
  FAMILIAS.cuasipoisson = Object.assign({}, FAMILIAS.poisson, { nombre: 'quasipoisson', dispFija: false, m2ll: null });
  const ENLACE_OMISION = { binomial: 'logit', cuasibinomial: 'logit', poisson: 'log', cuasipoisson: 'log', gamma: 'inverso', 'binomial-negativa': 'log' };

  /**
   * Ajuste IRLS.
   * @param {object} o  { X: Float64Array(n·p) por columnas, n, p, y, w (pesos previos), desplazamiento, familia, enlace,
   *                      theta (binomial negativa), eta0 (inicio), maxIter }
   * @returns {{ coef, rango, pivote, qr, eta, mu, devianza, iteraciones, convergio, pesos }}
   */
  function irls(o) {
    const { X, n, p, y } = o, w = o.w, off = o.desplazamiento || new Float64Array(n), F = FAMILIAS[o.familia], E = ENLACES[o.enlace], th = o.theta;
    let eta = new Float64Array(n), mu = new Float64Array(n);
    if (o.eta0) for (let i = 0; i < n; i++) { eta[i] = o.eta0[i]; mu[i] = E.inv(eta[i]); }
    else for (let i = 0; i < n; i++) { mu[i] = F.inicio(y[i], w[i]); eta[i] = E.fun(mu[i]); }
    const dev = m => { let s = 0; for (let i = 0; i < n; i++) s += F.dev(y[i], m[i], w[i], th); return s; };
    const validos = (e, m) => { for (let i = 0; i < n; i++) if (!E.valido(e[i]) || !F.valida(m[i])) return false; return true; };
    let devAnt = dev(mu), coefAnt = null, coef = null, d = null, convergio = false, it = 0;
    const Xw = new Float64Array(n * p), zw = new Float64Array(n);
    for (it = 1; it <= (o.maxIter || 100); it++) {
      for (let i = 0; i < n; i++) {
        const me = E.deta(eta[i]), ww = sqrt(w[i] * me * me / F.varianza(mu[i], th));
        zw[i] = ((eta[i] - off[i]) + (y[i] - mu[i]) / me) * ww;
        for (let j = 0; j < p; j++) Xw[i + j * n] = X[i + j * n] * ww;
      }
      d = SP.algebra.qr(Xw, n, p, 1e-11);
      const bk = SP.algebra.resolverR(d, SP.algebra.qty(d, zw));
      let nuevo = new Float64Array(p);
      for (let k = 0; k < d.rango; k++) nuevo[d.pivote[k]] = bk[k];
      const evalua = b => { const e = new Float64Array(n), m = new Float64Array(n); for (let i = 0; i < n; i++) { let s = off[i]; for (let j = 0; j < p; j++) s += X[i + j * n] * b[j]; e[i] = s; m[i] = E.inv(s); } return { e, m }; };
      let r = evalua(nuevo), dv = dev(r.m);
      for (let h = 0; (!Number.isFinite(dv) || !validos(r.e, r.m)) && coefAnt && h < 60; h++) {
        nuevo = nuevo.map((v, j) => (v + coefAnt[j]) / 2);
        r = evalua(nuevo); dv = dev(r.m);
      }
      if (!Number.isFinite(dv) || !validos(r.e, r.m)) throw new SP.ErrorSP(T('El ajuste no encontró coeficientes válidos para esta familia y enlace.'),
        T('Prueba otro enlace (por ejemplo, log en lugar de identidad o inverso) o revisa que la respuesta sea válida para la familia.'));
      const cambio = abs(dv - devAnt) / (abs(dv) + 0.1);
      eta = r.e; mu = r.m; coef = nuevo; coefAnt = nuevo; devAnt = dv;
      if (cambio < 1e-14) { convergio = true; break; }
    }
    /* pesos y QR en el óptimo (la covarianza de los coeficientes) */
    const pesos = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const me = E.deta(eta[i]), W = w[i] * me * me / F.varianza(mu[i], th), ww = sqrt(W);
      pesos[i] = W;
      for (let j = 0; j < p; j++) Xw[i + j * n] = X[i + j * n] * ww;
    }
    d = SP.algebra.qr(Xw, n, p, 1e-11);
    const c = new Float64Array(p).fill(NaN);
    for (let k = 0; k < d.rango; k++) c[d.pivote[k]] = coef[d.pivote[k]];
    return { coef: c, rango: d.rango, qr: d, eta, mu, devianza: devAnt, iteraciones: min(it, o.maxIter || 100), convergio, pesos };
  }

  /* ---------------- binomial negativa: θ por Newton ---------------- */
  function scoreTheta(th, mu, y, w) { let s = 0; for (let i = 0; i < y.length; i++) s += w[i] * (digamma(th + y[i]) - digamma(th) + log(th) + 1 - log(th + mu[i]) - (y[i] + th) / (mu[i] + th)); return s; }
  function infoTheta(th, mu, y, w) { let s = 0; for (let i = 0; i < y.length; i++) s += w[i] * (-trigamma(th + y[i]) + trigamma(th) - 1 / th + 2 / (mu[i] + th) - (y[i] + th) / ((mu[i] + th) * (mu[i] + th))); return s; }
  function thetaML(y, mu, w, th) {
    if (!(th > 0)) { let s = 0, sw = 0; for (let i = 0; i < y.length; i++) { const r = y[i] / mu[i] - 1; s += w[i] * r * r; sw += w[i]; } th = sw / s; }
    for (let k = 0; k < 200; k++) {
      const del = scoreTheta(th, mu, y, w) / infoTheta(th, mu, y, w);
      th = abs(th + del);
      if (!Number.isFinite(th)) throw new SP.ErrorSP(T('La θ de la binomial negativa no converge: los datos no muestran sobredispersión.'), T('Usa la familia de Poisson.'));
      if (abs(del) < 1e-15 * th) break;
    }
    return th;
  }
  /** Binomial negativa: θ y los coeficientes alternados hasta que θ no cambie. */
  function ajustarNB(o) {
    let fit = irls(Object.assign({}, o, { familia: 'poisson' })), th = thetaML(o.y, fit.mu, o.w, 0), total = fit.iteraciones;
    for (let k = 0; k < 100; k++) {
      fit = irls(Object.assign({}, o, { familia: 'binomial-negativa', theta: th, eta0: fit.eta }));
      total += fit.iteraciones;
      const th0 = th;
      th = thetaML(o.y, fit.mu, o.w, th);
      if (abs(th - th0) < 1e-13 * th) break;
    }
    const ee = sqrt(1 / infoTheta(th, fit.mu, o.y, o.w));
    return Object.assign(fit, { theta: th, eeTheta: ee, iteraciones: total });
  }

  /** Ajuste completo de una familia (la binomial negativa estima θ si no se da). */
  function ajustar(o) {
    if (o.familia === 'binomial-negativa' && !(o.theta > 0)) return ajustarNB(o);
    return irls(o);
  }

  /** Estadísticas del ajuste: Pearson, dispersión, −2 log L, AIC y BIC (como R). */
  function estadisticas(o, fit) {
    const F = FAMILIAS[o.familia], n = o.n, th = fit.theta || o.theta;
    let pear = 0;
    for (let i = 0; i < n; i++) { const r = o.y[i] - fit.mu[i]; pear += o.w[i] * r * r / F.varianza(fit.mu[i], th); }
    const gl = n - fit.rango, phi = F.dispFija ? 1 : pear / gl;
    let aic = NaN;
    if (F.m2ll) { let s = 0; for (let i = 0; i < n; i++) s += F.m2ll(o.y[i], fit.mu[i], o.w[i]); aic = s + 2 * fit.rango; }
    else if (o.familia === 'gamma') {
      let sw = 0;
      for (let i = 0; i < n; i++) sw += o.w[i];
      const disp = fit.devianza / sw, k = 1 / disp;
      let s = 0;
      for (let i = 0; i < n; i++) { const sc = fit.mu[i] * disp; s += o.w[i] * (-lg(k) - k * log(sc) + (k - 1) * log(o.y[i]) - o.y[i] / sc); }
      aic = -2 * s + 2 + 2 * fit.rango;
    } else if (o.familia === 'binomial-negativa') {
      let s = 0;
      for (let i = 0; i < n; i++) s += F.ll(o.y[i], fit.mu[i], o.w[i], th);
      aic = -2 * s + 2 * (fit.rango + 1);
    }
    const k = fit.rango + (F.extra || 0);
    return { pearson: pear, gl, dispersion: phi, aic, bic: Number.isFinite(aic) ? aic - 2 * k + log(n) * k : NaN, sobredispersion: pear / gl, pSobredispersion: D().pchisq(pear, gl, false) };
  }

  SP.glm = { FAMILIAS, ENLACES, ENLACE_OMISION, NOMBRE_ENLACE, irls, ajustar, ajustarNB, thetaML, estadisticas, digamma, trigamma, infoTheta };
});
