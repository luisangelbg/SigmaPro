/* SigmaPro — potencia y tamaño de muestra.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las mismas fórmulas y la misma búsqueda de la raíz que R, para que con los valores por omisión den lo mismo:
   - medias (prueba t de una muestra, pareada o de dos muestras): power.t.test (t no central; n con uniroot en
     [2, 1e7] y la diferencia en sd·[1e-7, 1e7], con tol = ε^¼);
   - ANOVA de una vía con k grupos: power.anova.test (F no central; n con uniroot en [2, 1e5] y su tol por omisión);
   - dos proporciones: power.prop.test (aproximación normal; n en [1, 1e7]);
   - correlación: pwr.r.test del paquete pwr (transformación z de Fisher con la corrección r/(2(n − 1)); n en
     [4 + 1e-10, 1e9] y r en [1e-10, 1 − 1e-10]);
   - repeticiones de un experimento: Cochran y Cox (1957), r ≥ 2·(t₁ + t₂)²·(CV/d)², con t₁ = t(1 − α/2) y
     t₂ = t(potencia) en los gl del error del diseño, que dependen de r: la menor r entera que cumple.
   Las raíces se buscan con SP.num.raizR (el zeroin2 de R, paso por paso). La F no central es pnbeta de R (AS 226 con
   las mejoras R84, el mismo criterio de paro 1e-9) sobre la beta incompleta del núcleo. */
SP.definir('potencia', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, exp, log, log1p, floor, max, atanh, ceil } = Math;
  const D = () => SP.dist;
  const TOL = Math.pow(2.220446049250313e-16, 0.25);
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const raiz = (f, a, b, tol) => SP.num.raizR(f, a, b, undefined, undefined, tol === undefined ? TOL : tol, 1000);

  /* ---------------- F no central (pnbeta_raw de R) ---------------- */
  function pnbeta(x, ox, a, b, ncp) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const c = ncp / 2, x0 = floor(max(c - 7 * sqrt(c), 0)), a0 = a + x0;
    const lb = D().lgamma(a0) + D().lgamma(b) - D().lgamma(a0 + b);
    let temp = D().pbeta(x, a0, b, true);
    let gx = exp(a0 * log(x) + b * (x < 0.5 ? log1p(-x) : log(ox)) - lb - log(a0));
    let q = a0 > a ? exp(-c + x0 * log(c) - D().lgamma(x0 + 1)) : exp(-c);
    let sumq = 1 - q, ans = q * temp, errbd, j = x0;
    do {
      j++;
      temp -= gx;
      gx *= x * (a + b + j - 1) / (a + j);
      q *= c / j;
      sumq -= q;
      ans += temp * q;
      errbd = (temp - gx) * sumq;
    } while (errbd > 1e-9 && j < 10000 + x0);
    return ans;
  }
  /** P(F > f) con gl1, gl2 y no centralidad ncp (o la cola inferior). */
  function pfnc(f, gl1, gl2, ncp, inferior) {
    if (!(ncp > 0)) return D().pf(f, gl1, gl2, inferior);
    if (f <= 0) return inferior ? 0 : 1;
    const y = gl1 / gl2 * f, ans = pnbeta(y / (1 + y), 1 / (1 + y), gl1 / 2, gl2 / 2, ncp);
    return inferior ? ans : 1 - min1(ans);
  }
  const min1 = v => (v > 1 ? 1 : v);

  /* ---------------- medias: power.t.test ---------------- */
  function potenciaT(o) {
    const tsample = o.tipo === 'dos' ? 2 : 1, tside = o.alternativa === 'unilateral' ? 1 : 2;
    const cuerpo = (n, delta) => { const nu = max(1e-7, n - 1) * tsample; return D().ptnc(D().qt(o.alfa / tside, nu, false), nu, sqrt(n / tsample) * delta / o.de, false); };
    const d = tside === 2 ? abs(o.diferencia) : o.diferencia;
    const r = { n: o.n, diferencia: d, de: o.de, alfa: o.alfa, potencia: o.potencia };
    if (o.calcular === 'potencia') r.potencia = cuerpo(o.n, d);
    else if (o.calcular === 'n') r.n = raiz(n => cuerpo(n, d) - o.potencia, 2, 1e7);
    else r.diferencia = raiz(x => cuerpo(o.n, x) - o.potencia, o.de * 1e-7, o.de * 1e7);
    r.curva = curva(n => cuerpo(n, r.diferencia), r.n, 2);
    return r;
  }

  /* ---------------- ANOVA de una vía: power.anova.test ---------------- */
  function potenciaAnova(o) {
    const g = o.grupos;
    const cuerpo = (n, vb) => { const lambda = (g - 1) * n * (vb / o.varDentro); return pfnc(D().qf(o.alfa, g - 1, (n - 1) * g, false), g - 1, (n - 1) * g, lambda, false); };
    const r = { grupos: g, n: o.n, varEntre: o.varEntre, varDentro: o.varDentro, alfa: o.alfa, potencia: o.potencia };
    if (o.calcular === 'potencia') r.potencia = cuerpo(o.n, o.varEntre);
    else if (o.calcular === 'n') r.n = raiz(n => cuerpo(n, o.varEntre) - o.potencia, 2, 1e5);
    else r.varEntre = raiz(v => cuerpo(o.n, v) - o.potencia, o.varDentro * 1e-7, o.varDentro * 1e7);
    r.f = sqrt(r.varEntre * (g - 1) / g / o.varDentro);   // f de Cohen: desviación de las medias (con divisor k) / σ
    r.curva = curva(n => cuerpo(n, r.varEntre), r.n, 2);
    return r;
  }

  /* ---------------- dos proporciones: power.prop.test ---------------- */
  function potenciaProp(o) {
    const tside = o.alternativa === 'unilateral' ? 1 : 2, { p1, p2 } = o;
    const cuerpo = n => D().pnorm((sqrt(n) * abs(p1 - p2) - (D().qnorm(o.alfa / tside, 0, 1, false) * sqrt((p1 + p2) * (1 - (p1 + p2) / 2)))) / sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 0, 1, true);
    const r = { n: o.n, p1, p2, alfa: o.alfa, potencia: o.potencia, h: abs(2 * Math.asin(sqrt(p1)) - 2 * Math.asin(sqrt(p2))) };
    if (o.calcular === 'potencia') r.potencia = cuerpo(o.n);
    else r.n = raiz(n => cuerpo(n) - o.potencia, 1, 1e7);
    r.curva = curva(cuerpo, r.n, 1);
    return r;
  }

  /* ---------------- correlación: pwr.r.test ---------------- */
  function potenciaR(o) {
    const bilateral = o.alternativa !== 'unilateral';
    const cuerpo = (n, r) => {
      const ttt = D().qt(bilateral ? o.alfa / 2 : o.alfa, n - 2, false), rc = sqrt(ttt * ttt / (ttt * ttt + n - 2));
      const zr = atanh(r) + r / (2 * (n - 1)), zrc = atanh(rc);
      return D().pnorm((zr - zrc) * sqrt(n - 3), 0, 1, true) + (bilateral ? D().pnorm((-zr - zrc) * sqrt(n - 3), 0, 1, true) : 0);
    };
    const rr = bilateral ? abs(o.r) : o.r;
    const out = { n: o.n, r: rr, alfa: o.alfa, potencia: o.potencia };
    if (o.calcular === 'potencia') out.potencia = cuerpo(o.n, rr);
    else if (o.calcular === 'n') out.n = raiz(n => cuerpo(n, rr) - o.potencia, 4 + 1e-10, 1e9);
    else out.r = bilateral ? raiz(x => cuerpo(o.n, x) - o.potencia, 1e-10, 1 - 1e-10) : raiz(x => cuerpo(o.n, x) - o.potencia, -1 + 1e-10, 1 - 1e-10);
    out.curva = curva(n => cuerpo(n, out.r), out.n, 4);
    return out;
  }

  /* ---------------- repeticiones de un experimento (Cochran y Cox) ---------------- */
  const GL_ERROR = { dca: (t, r) => t * (r - 1), dbca: (t, r) => (t - 1) * (r - 1) };
  function repeticiones(o) {
    const req = r => { const gl = GL_ERROR[o.diseno](o.tratamientos, r), t1 = D().qt(1 - o.alfa / 2, gl, true), t2 = D().qt(o.potencia, gl, true); return { gl, t1, t2, r: 2 * (t1 + t2) ** 2 * (o.cv / o.diferencia) ** 2 }; };
    const tabla = [];
    let r = 2, x;
    for (; r <= 1000; r++) { x = req(r); tabla.push({ r, gl: x.gl, t1: x.t1, t2: x.t2, requeridas: x.r }); if (r >= x.r) break; }
    exigir(r <= 1000, T('Con ese CV y esa diferencia harían falta más de 1000 repeticiones.'), T('Revisa la diferencia (en % de la media) y el CV.'));
    return { repeticiones: r, gl: x.gl, t1: x.t1, t2: x.t2, requeridas: x.r, iteraciones: tabla };
  }

  /* la potencia para tamaños de 2 al doble del calculado (o 50), para la gráfica */
  function curva(fn, n, minimo) {
    const tope = max(10, ceil((Number.isFinite(n) ? n : 20) * 2)), paso = max(1, ceil((tope - minimo) / 60)), xs = [], ys = [];
    for (let k = ceil(minimo + (minimo === 4 ? 1 : 0)); k <= tope; k += paso) { const p = fn(k); if (Number.isFinite(p)) { xs.push(k); ys.push(p); } }
    return { n: xs, potencia: ys };
  }

  SP.potencia = { pfnc, pnbeta, potenciaT, potenciaAnova, potenciaProp, potenciaR, repeticiones, GL_ERROR };
});
