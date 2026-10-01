/* SigmaPro — transformaciones de variables (siempre producen una columna nueva).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.transformar.aplicar(nombre, valores, parametros) → Float64Array
       'log'  ln(x)            'log10' log₁₀(x)        'logc'   ln(x + c)
       'raiz' √x               'raiz05' √(x + 0.5)      'arcoseno' asin(√p)  (p en proporción o en %)
       'reciproco' 1/x         'boxcox' (x^λ − 1)/λ, ln x si λ = 0
       'estandarizar' (x − media)/DE
     SP.transformar.boxcox(tabla, respuesta, formula?) → { lambda, ic, loglik, sugerencia, L(λ) para graficar el perfil }

   Box-Cox: λ maximiza la verosimilitud perfilada
       L(λ) = −(n/2) · log( SC_residual de z_λ ),   z_λ = (y^λ − 1) / (λ · ẏ^(λ−1)),   z_0 = ẏ · log y
   (ẏ = media geométrica), con los residuales del modelo del experimento (por omisión, solo la
   media). El intervalo de confianza al 95 % son los λ con 2[L(λ̂) − L(λ)] ≤ χ²₀.₉₅(1).
   (y^λ − 1)/λ se calcula como expm1(λ·log y)/λ, exacto aun con λ cerca de 0. */
SP.definir('transformar', function (SP) {
  'use strict';
  const T = SP.T;
  const { log, sqrt, asin, expm1, exp } = Math;

  const NOMBRES = {
    log: 'logaritmo natural', log10: 'logaritmo base 10', logc: 'logaritmo de x + c', raiz: 'raíz cuadrada',
    raiz05: 'raíz de x + 0.5', arcoseno: 'arcoseno de la raíz', reciproco: 'recíproco', boxcox: 'Box-Cox', estandarizar: 'estandarizar',
  };

  /** Comprueba el dominio y explica qué hacer si no se cumple. */
  function revisar(nombre, x, p) {
    const vals = Array.from(x).filter(v => !Number.isNaN(v));
    const min = vals.length ? Math.min(...vals) : 0, max = vals.length ? Math.max(...vals) : 0;
    if ((nombre === 'log' || nombre === 'log10' || nombre === 'boxcox') && min <= 0) {
      throw new SP.ErrorSP(T('El logaritmo y Box-Cox necesitan valores mayores que cero; el menor es {m}.', { m: min }),
        T('Usa ln(x + c) con una constante c que haga positivos todos los valores (por ejemplo c = 1 para conteos con ceros).'));
    }
    if (nombre === 'logc' && min + (p.c || 0) <= 0) {
      throw new SP.ErrorSP(T('Con c = {c} quedan valores ≤ 0 (el menor es {m}).', { c: p.c, m: min }), T('Aumenta la constante c.'));
    }
    if ((nombre === 'raiz' || nombre === 'raiz05') && min + (nombre === 'raiz05' ? 0.5 : 0) < 0) {
      throw new SP.ErrorSP(T('La raíz cuadrada necesita valores no negativos; el menor es {m}.', { m: min }));
    }
    if (nombre === 'arcoseno') {
      const tope = p.porcentaje ? 100 : 1;
      if (min < 0 || max > tope) {
        throw new SP.ErrorSP(T('El arcoseno necesita proporciones entre 0 y {t}; hay valores entre {a} y {b}.', { t: tope, a: min, b: max }),
          T(p.porcentaje ? 'Revisa que los porcentajes estén entre 0 y 100.' : 'Si los datos son porcentajes, marca «en porcentaje».'));
      }
    }
    if (nombre === 'reciproco' && vals.some(v => v === 0)) throw new SP.ErrorSP(T('Hay ceros: el recíproco no está definido.'));
  }

  function aplicar(nombre, valores, p) {
    p = p || {};
    const x = Float64Array.from(valores);
    revisar(nombre, x, p);
    const out = new Float64Array(x.length);
    let f;
    switch (nombre) {
      case 'log': f = v => log(v); break;
      case 'log10': f = v => Math.log10(v); break;
      case 'logc': f = v => log(v + (p.c || 0)); break;
      case 'raiz': f = v => sqrt(v); break;
      case 'raiz05': f = v => sqrt(v + 0.5); break;
      case 'arcoseno': { const k = p.porcentaje ? 100 : 1; const g = p.grados ? 180 / Math.PI : 1; f = v => asin(sqrt(v / k)) * g; break; }
      case 'reciproco': f = v => 1 / v; break;
      case 'boxcox': {
        const la = p.lambda;
        if (!Number.isFinite(la)) throw new SP.ErrorSP(T('Box-Cox necesita el valor de λ.'));
        f = la === 0 ? v => log(v) : v => expm1(la * log(v)) / la;
        break;
      }
      case 'estandarizar': {
        const m = SP.num.media(SP.num.sinFaltantes(x)), s = sqrt(SP.num.varianza(SP.num.sinFaltantes(x)));
        f = v => (v - m) / s; break;
      }
      default: throw new SP.ErrorSP(T('Transformación desconocida: «{t}».', { t: nombre }));
    }
    for (let i = 0; i < x.length; i++) out[i] = Number.isNaN(x[i]) ? NaN : f(x[i]);
    return out;
  }

  /* ---------------- Box-Cox ---------------- */
  /**
   * Devuelve sc(z) = suma de cuadrados residual de z sobre las columnas de X (n × p, por columnas).
   * Si las filas de X se repiten mucho (diseños con solo factores: una fila distinta por celda),
   * se usa la descomposición exacta
   *     SC_residual = Σ_g Σ_{i∈g} (z_i − z̄_g)²  +  min_β Σ_g n_g (z̄_g − x_g β)²,
   * la segunda con la QR de √n_g · x_g (G celdas en vez de n filas): mismo resultado, sin restas
   * que pierdan cifras, y con 100 000 filas pasa de segundos a milésimas por cada λ.
   */
  function residualRapido(X, n, p) {
    /* agrupar filas idénticas: dos combinaciones lineales al azar como clave; luego se comprueba */
    const r1 = Array.from({ length: p }, (_, j) => Math.sin(j + 1) * 1e3), r2 = Array.from({ length: p }, (_, j) => Math.cos(3 * j + 2) * 1e3);
    const g = new Int32Array(n), mapa = new Map(), rep = [];
    for (let i = 0; i < n; i++) {
      let a = 0, b = 0;
      for (let j = 0; j < p; j++) { const v = X[j * n + i]; a += v * r1[j]; b += v * r2[j]; }
      const k = a + '|' + b;
      let q = mapa.get(k);
      if (q === undefined) { q = rep.length; mapa.set(k, q); rep.push(i); }
      g[i] = q;
      if (rep.length > n / 2) break;
    }
    const G = rep.length;
    let agrupado = G <= n / 2;
    for (let i = 0; agrupado && i < n; i++) for (let j = 0; j < p; j++) if (X[j * n + i] !== X[j * n + rep[g[i]]]) { agrupado = false; break; }
    if (!agrupado) {
      const d = SP.algebra.qr(X, n, p);
      return z => { const e = SP.algebra.qty(d, z); let s = 0; for (let i = d.rango; i < n; i++) s += e[i] * e[i]; return s; };
    }
    const cuenta = new Float64Array(G);
    for (let i = 0; i < n; i++) cuenta[g[i]]++;
    const Xg = new Float64Array(G * p);
    for (let q = 0; q < G; q++) { const w = sqrt(cuenta[q]); for (let j = 0; j < p; j++) Xg[j * G + q] = w * X[j * n + rep[q]]; }
    const dg = SP.algebra.qr(Xg, G, p);
    const suma = new Float64Array(G), u = new Float64Array(G);
    return z => {
      suma.fill(0);
      for (let i = 0; i < n; i++) suma[g[i]] += z[i];
      for (let q = 0; q < G; q++) suma[q] /= cuenta[q];
      let dentro = 0;
      for (let i = 0; i < n; i++) { const e = z[i] - suma[g[i]]; dentro += e * e; }
      for (let q = 0; q < G; q++) u[q] = sqrt(cuenta[q]) * suma[q];
      const e = SP.algebra.qty(dg, u);
      let entre = 0;
      for (let q = dg.rango; q < G; q++) entre += e[q] * e[q];
      return dentro + entre;
    };
  }

  function boxcox(tabla, respuesta, formula, op) {
    op = op || {};
    const f = formula ? (formula.indexOf('~') >= 0 ? formula : respuesta + ' ~ ' + formula) : respuesta + ' ~ 1';
    const mm = SP.formula.matrizModelo(tabla, f);
    const y = mm.y, n = mm.n;
    for (let i = 0; i < n; i++) {
      if (!(y[i] > 0)) {
        throw new SP.ErrorSP(T('Box-Cox necesita una respuesta mayor que cero; hay valores ≤ 0.'),
          T('Suma una constante a la respuesta (ln(x + c)) o usa otra transformación.'));
      }
    }
    const logy = Float64Array.from(y, Math.log);
    const lgm = SP.num.media(logy);          // log de la media geométrica
    const gm = exp(lgm);
    const z = new Float64Array(n);
    const sc = residualRapido(mm.X, n, mm.p);
    function L(la) {
      if (Math.abs(la) < 1e-300) for (let i = 0; i < n; i++) z[i] = gm * logy[i];
      else {
        const esc = exp((la - 1) * lgm);
        for (let i = 0; i < n; i++) z[i] = expm1(la * logy[i]) / (la * esc);
      }
      return -n / 2 * log(sc(z));
    }
    const lo = op.desde === undefined ? -5 : op.desde, hi = op.hasta === undefined ? 5 : op.hasta;
    const m = SP.num.minimizar(la => -L(la), lo, hi, 1e-12);
    const lambda = m.x, Lmax = -m.valor;
    const corte = Lmax - SP.dist.qchisq(0.95, 1) / 2;
    const g = la => L(la) - corte;
    const raiz = (a, b) => (g(a) * g(b) < 0 ? SP.dist._interno.brent(g, a, b, 0, 1e-12) : NaN);
    const ic = [raiz(lo, lambda), raiz(lambda, hi)];
    /* sugerencia: la transformación «redonda» dentro del intervalo más cercana a λ̂ */
    const redondas = [[1, 'ninguna'], [0.5, 'raiz'], [0, 'log'], [-0.5, 'reciproco de la raiz'], [-1, 'reciproco'], [2, 'cuadrado']];
    const dentro = redondas.filter(([v]) => (Number.isNaN(ic[0]) || v >= ic[0]) && (Number.isNaN(ic[1]) || v <= ic[1]));
    const sug = (dentro.length ? dentro : redondas).slice().sort((a, b) => Math.abs(a[0] - lambda) - Math.abs(b[0] - lambda))[0];
    return { lambda, ic, loglik: Lmax, n, sugerencia: { lambda: sug[0], transformacion: sug[1], enIntervalo: dentro.length > 0 }, L };
  }

  /** Resultado plano para la validación. */
  function boxcoxResumen(tabla, respuesta, formula) {
    const r = boxcox(tabla, respuesta, formula);
    return { lambda: r.lambda, ic: r.ic, loglik: r.loglik, n: r.n };
  }

  /**
   * Para la interfaz, dentro de un hilo: recibe columnas planas (lo que acepta SP.tabla.crear),
   * estima λ y devuelve además el perfil L(λ) en una ventana centrada en λ̂ para graficarlo.
   */
  function boxcoxPerfil(columnas, tipos, respuesta, formula) {
    const r = boxcox(SP.tabla.crear(columnas, tipos), respuesta, formula);
    const ancho = Number.isFinite(r.ic[0]) && Number.isFinite(r.ic[1]) ? r.ic[1] - r.ic[0] : 2;
    const medio = Math.max(1.5, 1.25 * ancho);
    const a = Math.max(-3, r.lambda - medio), b = Math.min(3, r.lambda + medio);
    const x = Array.from({ length: 121 }, (_, k) => a + (b - a) * k / 120);
    return { lambda: r.lambda, ic: r.ic, loglik: r.loglik, n: r.n, sugerencia: r.sugerencia, perfil: { x, y: x.map(r.L) } };
  }

  SP.transformar = { aplicar, boxcox, boxcoxResumen, boxcoxPerfil, NOMBRES, _interno: { residualRapido } };
});
