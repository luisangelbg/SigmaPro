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
   negativa, y la de Pearson (Σ w(y − μ)²/V(μ) / gl) en las cuasi, la gamma y la gaussiana inversa.
   Hito 4.3: la gaussiana inversa, los enlaces raíz, 1/μ² y de potencia (power() de R), los intervalos por verosimilitud
   perfilada (confint de glm, con la raíz exacta) y la regresión logística de Firth (logistf). */
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
    raiz: { fun: m => sqrt(m), inv: e => e * e, deta: e => 2 * e, valido: e => Number.isFinite(e) && e > 0 },
    inverso2: { fun: m => 1 / (m * m), inv: e => 1 / sqrt(e), deta: e => -1 / (2 * Math.pow(e, 1.5)), valido: e => Number.isFinite(e) && e > 0 },
  };
  const NOMBRE_ENLACE = { logit: 'logit', probit: 'probit', cloglog: 'cloglog', log: 'log', inverso: 'inverse', identidad: 'identity', raiz: 'sqrt', inverso2: '1/mu^2', potencia: 'power' };
  /** El enlace de potencia μ^λ (power() de R): con λ ≤ 0 es el log y con λ = 1 la identidad, como en R. */
  function potencia(l) {
    if (!(l > 0)) return ENLACES.log;
    if (l === 1) return ENLACES.identidad;
    return { fun: m => Math.pow(m, l), inv: e => max(Math.pow(e, 1 / l), EPS), deta: e => max(Math.pow(e, 1 / l - 1) / l, EPS), valido: e => Number.isFinite(e) && e > 0 };
  }
  /** El enlace por su nombre (la potencia con su λ). */
  const enlace = (nombre, lambda) => (nombre === 'potencia' ? potencia(Number(lambda)) : ENLACES[nombre]);

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
      nombre: 'poisson', enlaces: ['log', 'identidad', 'raiz', 'potencia'], dispFija: true,
      varianza: m => m,
      dev: (y, m, w) => 2 * (y > 0 ? w * (y * log(y / m) - (y - m)) : m * w),
      inicio: y => y + 0.1,
      valida: m => Number.isFinite(m) && m > 0,
      m2ll: (y, m, w) => -2 * w * ((y > 0 ? y * log(m) : 0) - m - lg(y + 1)),
    },
    gamma: {
      nombre: 'Gamma', enlaces: ['log', 'inverso', 'identidad', 'potencia'], dispFija: false, extra: 1,
      varianza: m => m * m,
      dev: (y, m, w) => -2 * w * (log(y === 0 ? 1 : y / m) - (y - m) / m),
      inicio: y => y,
      valida: m => Number.isFinite(m) && m > 0,
    },
    'binomial-negativa': {
      nombre: 'Negative Binomial', enlaces: ['log', 'identidad', 'raiz'], dispFija: true, extra: 1,
      varianza: (m, th) => m + m * m / th,
      dev: (y, m, w, th) => 2 * w * (y * log(max(1, y) / m) - (y + th) * log((y + th) / (m + th))),
      inicio: y => y + (y === 0 ? 1 / 6 : 0),
      valida: m => Number.isFinite(m) && m > 0,
      ll: (y, m, w, th) => w * (lg(th + y) - lg(th) - lg(y + 1) + th * log(th) + y * log(m + (y === 0 ? 1 : 0)) - (th + y) * log(th + m)),
    },
    'inversa-gaussiana': {
      nombre: 'inverse.gaussian', enlaces: ['inverso2', 'inverso', 'log', 'identidad', 'potencia'], dispFija: false, extra: 1,
      varianza: m => m * m * m,
      dev: (y, m, w) => w * (y - m) * (y - m) / (y * m * m),
      inicio: y => y,
      valida: m => Number.isFinite(m) && m > 0,
    },
  };
  FAMILIAS.cuasibinomial = Object.assign({}, FAMILIAS.binomial, { nombre: 'quasibinomial', dispFija: false, m2ll: null });
  FAMILIAS.cuasipoisson = Object.assign({}, FAMILIAS.poisson, { nombre: 'quasipoisson', dispFija: false, m2ll: null });
  const ENLACE_OMISION = { binomial: 'logit', cuasibinomial: 'logit', poisson: 'log', cuasipoisson: 'log', gamma: 'inverso', 'binomial-negativa': 'log', 'inversa-gaussiana': 'inverso2' };

  /**
   * Ajuste IRLS.
   * @param {object} o  { X: Float64Array(n·p) por columnas, n, p, y, w (pesos previos), desplazamiento, familia, enlace,
   *                      lambda (enlace de potencia), theta (binomial negativa), eta0 (inicio), maxIter }
   * @returns {{ coef, rango, pivote, qr, eta, mu, devianza, iteraciones, convergio, pesos }}
   */
  function irls(o) {
    const { X, n, p, y } = o, w = o.w, off = o.desplazamiento || new Float64Array(n), F = FAMILIAS[o.familia], E = enlace(o.enlace, o.lambda), th = o.theta;
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
      /* con decenas de miles de filas el redondeo de la devianza no baja de 1e-14: también basta que los coeficientes ya
         no cambien (1e-12 relativo) */
      let quieto = !!coef;
      if (coef) for (let j = 0; j < p && quieto; j++) if (abs(nuevo[j] - coef[j]) > 1e-12 * max(1, abs(nuevo[j]))) quieto = false;
      eta = r.e; mu = r.m; coef = nuevo; coefAnt = nuevo; devAnt = dv;
      if (cambio < 1e-14 || quieto) { convergio = true; break; }
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
      if (th > 1e8) return th;   // sin sobredispersión θ crece sin fin: la binomial negativa ya es la de Poisson
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
      if (abs(th - th0) < 1e-13 * th || th > 1e8) break;
    }
    const ee = sqrt(1 / infoTheta(th, fit.mu, o.y, o.w));
    return Object.assign(fit, { theta: th, eeTheta: ee, iteraciones: total, thetaLimite: th > 1e8 });
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
    } else if (o.familia === 'inversa-gaussiana') {
      /* inverse.gaussian()$aic: Σw·(log(2π·disp) + 1) + 3·Σ w·log y + 2, con disp = D/Σw */
      let sw = 0, sl = 0;
      for (let i = 0; i < n; i++) { sw += o.w[i]; sl += o.w[i] * log(o.y[i]); }
      aic = sw * (log(2 * Math.PI * fit.devianza / sw) + 1) + 3 * sl + 2 + 2 * fit.rango;
    }
    const k = fit.rango + (F.extra || 0);
    return { pearson: pear, gl, dispersion: phi, aic, bic: Number.isFinite(aic) ? aic - 2 * k + log(n) * k : NaN, sobredispersion: pear / gl, pSobredispersion: D().pchisq(pear, gl, false) };
  }

  /* ---------------- intervalos por verosimilitud perfilada (Hito 4.3) ---------------- */
  /**
   * Intervalos por verosimilitud perfilada de los coeficientes, los de confint() de glm (profile.glm), con la raíz
   * exacta en lugar de la interpolación por splines del perfil: con β_j fijo en b (x_j·b entra al desplazamiento) se
   * reajustan los demás y τ(b) = signo(b − β̂)·√((D(b) − D̂)/φ) se lleva a ±z_{1−α/2}, con φ la de Pearson si la
   * dispersión se estima y θ fija en la binomial negativa (como profile.glm). Se avanza desde β̂ en pasos crecientes
   * (cada ajuste arranca del anterior) hasta pasar el corte y la raíz se pule con el método de Brent; si la devianza no
   * llega (separación, un coeficiente que los datos no acotan) o el ajuste falla, el límite queda faltante.
   * @param {object} o    los datos del ajuste (como en irls)
   * @param {object} fit  el ajuste completo
   * @param {number} phi  la dispersión
   * @param {number[]} ee los EE de Wald (el tamaño del primer paso)
   */
  function perfil(o, fit, phi, nivel, ee) {
    const { X, n, p } = o, ct = D().qnorm(1 - (1 - nivel) / 2), inf = new Array(p).fill(NaN), sup = new Array(p).fill(NaN);
    const off0 = o.desplazamiento || new Float64Array(n), F = FAMILIAS[o.familia], E = enlace(o.enlace, o.lambda);
    const activas = [];
    for (let j = 0; j < p; j++) if (Number.isFinite(fit.coef[j])) activas.push(j);
    for (const j of activas) {
      const resto = activas.filter(k => k !== j), Xs = new Float64Array(n * resto.length), bj = fit.coef[j];
      resto.forEach((k, c) => Xs.set(X.subarray(k * n, (k + 1) * n), c * n));
      const ajusteEn = (b, eta0) => {
        const off = new Float64Array(n);
        for (let i = 0; i < n; i++) off[i] = off0[i] + X[i + j * n] * b;
        try {
          if (!resto.length) {
            let dv = 0;
            for (let i = 0; i < n; i++) { const m = E.inv(off[i]); if (!E.valido(off[i]) || !F.valida(m)) return null; dv += F.dev(o.y[i], m, o.w[i], o.theta); }
            return Number.isFinite(dv) ? { devianza: dv, eta: off } : null;
          }
          const r = irls(Object.assign({}, o, { X: Xs, p: resto.length, desplazamiento: off, eta0 }));
          return Number.isFinite(r.devianza) && r.convergio ? r : null;
        } catch (e) { return null; }
      };
      const tau = (b, r) => Math.sign(b - bj) * sqrt(max(0, r.devianza - fit.devianza) / phi);
      for (const dir of [-1, 1]) {
        let prev = { b: bj, t: 0, eta: fit.eta }, h = 0.75 * ct * ee[j], lim = NaN;
        for (let it = 0; it < 80 && h > 0; it++) {
          const b = prev.b + dir * h, r = ajusteEn(b, prev.eta);
          if (!r) { h /= 2; if (h < 1e-9 * max(abs(bj), ee[j])) break; continue; }
          const t = tau(b, r);
          if (abs(t) >= ct) {
            let falla = false;
            const Fz = bb => { const rr = ajusteEn(bb, prev.eta); if (!rr) { falla = true; return 0; } return tau(bb, rr) - dir * ct; };
            const raiz = SP.num.raizR(Fz, prev.b, b, prev.t - dir * ct, t - dir * ct, 1e-13 * max(abs(bj), ee[j]), 300);
            if (!falla) lim = raiz;
            break;
          }
          prev = { b, t, eta: r.eta };
          h *= 1.6;
        }
        (dir < 0 ? inf : sup)[j] = lim;
      }
    }
    return { inf, sup };
  }

  /* ---------------- regresión logística de Firth (Hito 4.3) ---------------- */
  /** Inversa y log-determinante de una matriz simétrica definida positiva (p × p, por columnas) por Cholesky. */
  function invSPD(A, p) {
    const L = SP.algebra.cholesky(A, p), Li = new Float64Array(p * p);
    let logdet = 0;
    for (let j = 0; j < p; j++) logdet += 2 * log(L[j + j * p]);
    for (let j = 0; j < p; j++) {
      Li[j + j * p] = 1 / L[j + j * p];
      for (let i = j + 1; i < p; i++) {
        let s = 0;
        for (let m = j; m < i; m++) s += L[i + m * p] * Li[m + j * p];
        Li[i + j * p] = -s / L[i + i * p];
      }
    }
    const V = new Float64Array(p * p);   // (LLᵀ)⁻¹ = L⁻ᵀ L⁻¹
    for (let i = 0; i < p; i++) for (let j = i; j < p; j++) {
      let s = 0;
      for (let m = j; m < p; m++) s += Li[m + i * p] * Li[m + j * p];
      V[i + j * p] = s; V[j + i * p] = s;
    }
    return { V, logdet };
  }
  /** log μ y log(1 − μ) del logit sin pérdida de cifras. */
  const logPlogis = s => (s < 0 ? s - log1p(exp(s)) : -log1p(exp(-s)));
  /**
   * Regresión logística de Firth (1993; Heinze y Schemper 2002): el máximo de la verosimilitud penalizada
   * l*(β) = l(β) + ½·log|X'WX| (W = m·μ·(1 − μ)), que existe aun con separación completa. Pasos de Newton con la
   * puntuación modificada U*_j = Σ x_ij·(m_i·(y_i − μ_i) + h_i·(½ − μ_i)) (h, la diagonal de la matriz sombrero de
   * W^½X) y la información X'WX; el paso se limita a 5 y se parte a la mitad mientras no mejore l* (como logistf).
   * Con `fijos` ({ j: valor }) esos coeficientes no se mueven y los demás se ajustan con la penalización del modelo
   * completo: la verosimilitud penalizada restringida de las pruebas y de los perfiles de logistf.
   * l incluye la constante de la binomial (como logLik de glm).
   * @returns {{ coef, eta, mu, pl, loglik, V, iteraciones, convergio }}
   */
  function firth(o, fijos, beta0) {
    const { X, n, p, y, w } = o, off = o.desplazamiento || new Float64Array(n);
    const libre = [];
    for (let j = 0; j < p; j++) if (!(fijos && Object.prototype.hasOwnProperty.call(fijos, j))) libre.push(j);
    const q = libre.length;
    let b = beta0 ? Float64Array.from(beta0) : new Float64Array(p);
    if (fijos) for (const j of Object.keys(fijos)) b[+j] = fijos[j];
    let cte = 0;
    for (let i = 0; i < n; i++) { const m = Math.round(w[i]), k = Math.round(w[i] * y[i]); cte += lg(m + 1) - lg(k + 1) - lg(m - k + 1); }
    const evalua = bb => {
      const eta = new Float64Array(n), mu = new Float64Array(n), W = new Float64Array(n), I = new Float64Array(p * p);
      let l = cte;
      for (let i = 0; i < n; i++) {
        let s = off[i];
        for (let j = 0; j < p; j++) s += X[i + j * n] * bb[j];
        const lm = logPlogis(s), l1m = lm - s, m = exp(lm);
        eta[i] = s; mu[i] = m; W[i] = w[i] * exp(lm + l1m);   // μ(1 − μ) sin cancelación cerca de 0 o 1
        l += w[i] * ((y[i] > 0 ? y[i] * lm : 0) + (y[i] < 1 ? (1 - y[i]) * l1m : 0));
        for (let a = 0; a < p; a++) { const xa = X[i + a * n] * W[i]; if (xa !== 0) for (let c = a; c < p; c++) I[a + c * p] += xa * X[i + c * n]; }
      }
      for (let a = 0; a < p; a++) for (let c = a + 1; c < p; c++) I[c + a * p] = I[a + c * p];
      let inv;
      try { inv = invSPD(I, p); } catch (e) { return null; }
      return { eta, mu, W, I, V: inv.V, l, pl: l + 0.5 * inv.logdet };
    };
    let e = evalua(b);
    /* un arranque degenerado (μ en 0 o 1 en todas las filas): los libres desde cero */
    if (!e || !Number.isFinite(e.pl)) { for (const j of libre) b[j] = 0; e = evalua(b); }
    if (!e) throw new SP.ErrorSP(T('La información del modelo es singular: hay coeficientes que los datos no permiten estimar.'), T('Quita los términos colineales o con niveles sin datos.'));
    let convergio = false, it = 0;
    for (it = 1; it <= 200; it++) {
      /* puntuación modificada */
      const U = new Float64Array(p);
      for (let i = 0; i < n; i++) {
        let h = 0;
        for (let a = 0; a < p; a++) { const xa = X[i + a * n]; if (xa !== 0) for (let c = 0; c < p; c++) h += xa * e.V[a + c * p] * X[i + c * n]; }
        h *= e.W[i];
        const r = w[i] * (y[i] - e.mu[i]) + h * (0.5 - e.mu[i]);
        for (let j = 0; j < p; j++) U[j] += X[i + j * n] * r;
      }
      /* paso de Newton en los libres: (I_LL)⁻¹ U_L */
      const ILL = new Float64Array(q * q);
      for (let a = 0; a < q; a++) for (let c = 0; c < q; c++) ILL[a + c * q] = e.I[libre[a] + libre[c] * p];
      let dl;
      try { const iv = invSPD(ILL, q).V; dl = libre.map((_, a) => { let s = 0; for (let c = 0; c < q; c++) s += iv[a + c * q] * U[libre[c]]; return s; }); } catch (err) { break; }
      let mx = 0;
      for (const v of dl) mx = max(mx, abs(v));
      if (mx > 5) dl = dl.map(v => v * 5 / mx);
      let nuevo = null;
      for (let k = 0; k < 40; k++) {
        const bb = Float64Array.from(b);
        libre.forEach((j, a) => { bb[j] += dl[a]; });
        const en = evalua(bb);
        if (en && en.pl >= e.pl - 1e-12 * abs(e.pl)) { nuevo = { bb, en }; break; }
        dl = dl.map(v => v / 2);
      }
      if (!nuevo) { convergio = mx < 1e-8; break; }
      let paso = 0;
      libre.forEach((j, a) => { paso = max(paso, abs(nuevo.bb[j] - b[j]) / max(1, abs(b[j]))); });
      b = nuevo.bb; e = nuevo.en;
      if (paso < 1e-13) { convergio = true; break; }
    }
    /* sin restricciones: la QR de W^½X en el óptimo (las medias y sus pares usan la covarianza (X'WX)⁻¹ de ahí) */
    let qr = null;
    if (!fijos) {
      const Xw = new Float64Array(n * p);
      for (let i = 0; i < n; i++) { const s = sqrt(e.W[i]); for (let j = 0; j < p; j++) Xw[i + j * n] = X[i + j * n] * s; }
      qr = SP.algebra.qr(Xw, n, p, 1e-11);
    }
    return { coef: b, eta: e.eta, mu: e.mu, pl: e.pl, loglik: e.l, V: e.V, qr, rango: p, iteraciones: min(it, 200), convergio };
  }

  /**
   * Intervalos de la verosimilitud penalizada perfilada de Firth (los de logistf): con β_j fijo en b y los demás
   * reajustados, τ(b) = signo(b − β̃)·√(2·(l*(β̃) − l*(b))) se lleva a ±z_{1−α/2}; como perfil(), con pasos crecientes
   * y la raíz por Brent.
   */
  function perfilFirth(o, fit, nivel, ee) {
    const p = o.p, ct = D().qnorm(1 - (1 - nivel) / 2), inf = new Array(p).fill(NaN), sup = new Array(p).fill(NaN);
    for (let j = 0; j < p; j++) {
      const bj = fit.coef[j];
      const ajusteEn = (b, desde) => { try { const r = firth(o, { [j]: b }, desde); return r.convergio ? r : null; } catch (e) { return null; } };
      const tau = (b, r) => Math.sign(b - bj) * sqrt(max(0, 2 * (fit.pl - r.pl)));
      for (const dir of [-1, 1]) {
        let prev = { b: bj, t: 0, coef: fit.coef }, h = 0.75 * ct * ee[j], lim = NaN;
        for (let it = 0; it < 80 && h > 0; it++) {
          const b = prev.b + dir * h, r = ajusteEn(b, prev.coef);
          if (!r) { h /= 2; if (h < 1e-9 * max(abs(bj), ee[j])) break; continue; }
          const t = tau(b, r);
          if (abs(t) >= ct) {
            let falla = false;
            const Fz = bb => { const rr = ajusteEn(bb, prev.coef); if (!rr) { falla = true; return 0; } return tau(bb, rr) - dir * ct; };
            const raiz = SP.num.raizR(Fz, prev.b, b, prev.t - dir * ct, t - dir * ct, 1e-12 * max(abs(bj), ee[j]), 300);
            if (!falla) lim = raiz;
            break;
          }
          prev = { b, t, coef: r.coef };
          h *= 1.6;
        }
        (dir < 0 ? inf : sup)[j] = lim;
      }
    }
    return { inf, sup };
  }

  SP.glm = { FAMILIAS, ENLACES, ENLACE_OMISION, NOMBRE_ENLACE, enlace, potencia, irls, ajustar, ajustarNB, thetaML, estadisticas, digamma, trigamma, infoTheta,
    perfil, firth, perfilFirth, invSPD };
});
