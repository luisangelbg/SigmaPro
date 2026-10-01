/* SigmaPro — distribuciones de probabilidad.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Funciones (todas con cola inferior por omisión; inferior = false da la superior,
   calculada directamente para no perder cifras en valores p diminutos):

     lgamma, lbeta
     pnorm, qnorm, dnorm            normal
     pt, qt, dt                     t de Student
     pf, qf, df                     F de Fisher-Snedecor
     pchisq, qchisq, dchisq         ji cuadrada
     pgamma, qgamma                 gamma (forma, escala)
     pbeta, qbeta                   beta
     dbinom, pbinom, dpois, ppois   discretas
     ptukey, qtukey                 rango estudentizado (comparaciones de Tukey)

   Métodos (todos publicados; ninguna constante memorizada que no se pueda comprobar):
   - log Γ: aproximación de Lanczos con los coeficientes de Godfrey (g = 607/128).
   - Normal: erf por su serie de términos positivos (|x| < 2) y erfc por la fracción
     continua de Laplace (|x| ≥ 2); el cuantil por Newton-Halley desde la aproximación
     26.2.23 de Abramowitz y Stegun.
   - Gamma y beta incompletas regularizadas: serie y fracción continua (algoritmo de Lentz
     modificado), eligiendo en cada región la forma que da directamente la cola pedida.
   - t, F y ji cuadrada salen de la beta y la gamma incompletas.
   - Rango estudentizado: método de Copenhaver y Holland (1988), con cuadratura de
     Gauss-Legendre de 12 puntos para la probabilidad del rango y de 16 puntos sobre la
     distribución de la desviación estándar.
   - Cuantiles: método de Brent sobre la función de distribución, hasta la precisión de
     la máquina.

   Validación contra R: carpetas tests/casos/dist-normal, dist-t-f-chisq, dist-gamma-beta y dist-tukey. */
SP.definir('dist', function (SP) {
  'use strict';
  const { exp, log, log1p, abs, sqrt, pow, trunc, floor, max, min, sin } = Math;

  const LN_SQRT_2PI = 0.9189385332046727418;   // log(√(2π))
  const SQRT2 = Math.SQRT2;
  const EPS = 2.220446049250313e-16;
  const MIN = 1e-300;

  /* ---------------- log Γ (Lanczos, coeficientes de Godfrey) ---------------- */
  const LZ_G = 607 / 128;
  const LZ = [0.99999999999999709182, 57.156235665862923517, -59.597960355475491248, 14.136097974741747174,
    -0.49191381609762019978, 0.33994649984811888699e-4, 0.46523628927048575665e-4, -0.98374475304879564677e-4,
    0.15808870322491248884e-3, -0.21026444172410488319e-3, 0.21743961811521264320e-3, -0.16431810653676389022e-3,
    0.84418223983852743293e-4, -0.26190838401581408670e-4, 0.36899182659531622704e-5];

  function lgamma(x) {
    if (Number.isNaN(x)) return NaN;
    if (x <= 0) return x === 0 ? Infinity : NaN;   // solo se usa con x > 0
    if (x < 0.5) return log(Math.PI / sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = LZ[0];
    const t = x + LZ_G + 0.5;
    for (let i = 1; i < 15; i++) a += LZ[i] / (x + i);
    return LN_SQRT_2PI + (x + 0.5) * log(t) - t + log(a);
  }
  /* Corrección de Stirling: δ(x) = log Γ(x) − [(x − ½) log x − x + ½ log 2π], para x ≥ 8. */
  function stirlingDelta(x) {
    const s = 1 / (x * x);
    return (1 / 12 - s * (1 / 360 - s * (1 / 1260 - s * (1 / 1680 - s * (1 / 1188 - s * (691 / 360360 - s / 156)))))) / x;
  }
  /**
   * log B(a, b) sin restar log Γ enormes: con parámetros grandes la resta perdía hasta
   * 8 cifras (B(0.5, 5e6) en la t con 1e7 grados de libertad). Se usan las formas de
   * Stirling reordenadas para que cada término se calcule sin cancelación.
   */
  function lbeta(a, b) {
    const p = min(a, b), q = max(a, b);
    if (p >= 8) {
      const s = p + q;
      return LN_SQRT_2PI - 0.5 * log(q) + (p - 0.5) * log(p / s) + q * log1p(-p / s) +
        stirlingDelta(p) + stirlingDelta(q) - stirlingDelta(s);
    }
    if (q >= 8) {
      /* log Γ(q) − log Γ(p + q) = p − (q − ½) log(1 + p/q) − p log(p + q) + δ(q) − δ(p + q) */
      const dif = p - (q - 0.5) * log1p(p / q) - p * log(p + q) + stirlingDelta(q) - stirlingDelta(p + q);
      return lgamma(p) + dif;
    }
    return lgamma(p) + lgamma(q) - lgamma(p + q);
  }

  /* ---------------- normal ---------------- */
  /* erf por la serie de términos positivos: erf(x) = 2/√π · e^{−x²} · Σ 2ⁿ x^{2n+1} / (1·3·…·(2n+1)) */
  function erfSerie(x) {
    const x2 = x * x;
    let termino = x, suma = x;
    for (let n = 1; n < 500; n++) {
      termino *= 2 * x2 / (2 * n + 1);
      suma += termino;
      if (termino < suma * 1e-17) break;
    }
    return 2 / sqrt(Math.PI) * exp(-x2) * suma;
  }
  /* erfc(x) para x > 0 por fracción continua de Laplace:
     erfc(x) = e^{−x²}/√π · 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + …)))) */
  function erfcFraccion(x) {
    let f = x, C = x, D = 0;
    for (let n = 1; n < 5000; n++) {
      const an = n / 2;
      D = x + an * D; D = abs(D) < MIN ? MIN : D; D = 1 / D;
      C = x + an / C; C = abs(C) < MIN ? MIN : C;
      const delta = C * D;
      f *= delta;
      if (abs(delta - 1) < 1e-16) break;
    }
    return exp(-x * x) / sqrt(Math.PI) / f;
  }
  /** erfc(x), x ≥ 0, con precisión relativa aun en la cola. */
  function erfcPositivo(x) {
    return x < 2 ? 1 - erfSerie(x) : erfcFraccion(x);
  }

  /* Aproximaciones racionales de Cody (1969) para la normal, en tres tramos de |z|.
     Son rápidas (las llama el rango estudentizado decenas de miles de veces); su
     exactitud se comprueba en las pruebas contra la serie y la fracción continua de
     arriba (coinciden a 1e-14) y contra R. */
  const CA = [2.2352520354606839287, 161.02823106855587881, 1067.6894854603709582, 18154.981253343561249, 0.065682337918207449113];
  const CB = [47.20258190468824187, 976.09855173777669322, 10260.932208618978205, 45507.789335026729956];
  const CC = [0.39894151208813466764, 8.8831497943883759412, 93.506656132177855979, 597.27027639480026226,
    2494.5375852903726711, 6848.1904505362823326, 11602.651437647350124, 9842.7148383839780218, 1.0765576773720192317e-8];
  const CD = [22.266688044328115691, 235.38790178262499861, 1519.377599407554805, 6485.558298266760755,
    18615.571640885098091, 34900.952721145977266, 38912.003286093271411, 19685.429676859990727];
  const CP = [0.21589853405795699, 0.1274011611602473639, 0.022235277870649807, 0.001421619193227893466,
    2.9112874951168792e-5, 0.02307344176494017303];
  const CQ = [1.28426009614491121, 0.468238212480865118, 0.0659881378689285515, 0.00378239633202758244, 7.29751555083966205e-5];

  /** P(Z > |z|) para la normal estándar (la cola lejana), con precisión relativa. */
  function colaNormal(z) {
    const y = abs(z);
    if (y <= 0.67448975) {
      /* tramo central: Φ(y) − 1/2 = y · R(y²) */
      let num = 0, den = 0;
      if (y > 1.1e-16) {
        const s = y * y;
        num = CA[4] * s; den = s;
        for (let i = 0; i < 3; i++) { num = (num + CA[i]) * s; den = (den + CB[i]) * s; }
      }
      return 0.5 - y * (num + CA[3]) / (den + CB[3]);
    }
    let r;
    if (y <= 5.656854249492380195) {             // √32
      let num = CC[8] * y, den = y;
      for (let i = 0; i < 7; i++) { num = (num + CC[i]) * y; den = (den + CD[i]) * y; }
      r = (num + CC[7]) / (den + CD[7]);
    } else if (y < 38.5) {
      const s = 1 / (y * y);
      let num = CP[5] * s, den = s;
      for (let i = 0; i < 4; i++) { num = (num + CP[i]) * s; den = (den + CQ[i]) * s; }
      r = (1 / sqrt(2 * Math.PI) - s * (num + CP[4]) / (den + CQ[4])) / y;
    } else return 0;
    /* e^{−y²/2} partida en dos factores para no perder cifras al elevar al cuadrado */
    const yc = trunc(y * 16) / 16;
    const del = (y - yc) * (y + yc);
    return exp(-yc * yc * 0.5) * exp(-del * 0.5) * r;
  }

  function pnorm(q, media, de, inferior) {
    media = media === undefined ? 0 : media; de = de === undefined ? 1 : de;
    inferior = inferior !== false;
    if (Number.isNaN(q) || Number.isNaN(media) || !(de >= 0)) return NaN;
    const z = (q - media) / de;
    if (z === Infinity) return inferior ? 1 : 0;
    if (z === -Infinity) return inferior ? 0 : 1;
    const cola = colaNormal(z);                // P(Z > |z|)
    const lejana = (z < 0) === inferior;      // la cola pedida es la del lado de z
    return lejana ? cola : 1 - cola;
  }
  /** La misma probabilidad por serie y fracción continua (más lenta): referencia de las pruebas. */
  function pnormSerie(z) {
    const cola = 0.5 * erfcPositivo(abs(z) / SQRT2);
    return z < 0 ? cola : 1 - cola;
  }
  const dnorm = (x, media, de) => {
    media = media === undefined ? 0 : media; de = de === undefined ? 1 : de;
    const z = (x - media) / de;
    return exp(-0.5 * z * z - LN_SQRT_2PI) / de;
  };

  function qnorm(p, media, de, inferior) {
    media = media === undefined ? 0 : media; de = de === undefined ? 1 : de;
    inferior = inferior !== false;
    if (Number.isNaN(p) || p < 0 || p > 1) return NaN;
    if (p === 0) return inferior ? -Infinity : Infinity;
    if (p === 1) return inferior ? Infinity : -Infinity;
    /* se trabaja con la cola menor, pc ≤ 1/2, cuyo cuantil z ≤ 0 se calcula con precisión;
       el resultado es z o −z según de qué lado quedó la probabilidad pedida */
    const izquierda = inferior ? p <= 0.5 : p > 0.5;
    const pc = izquierda ? (inferior ? p : 1 - p) : (inferior ? 1 - p : p);
    /* aproximación inicial (A y S 26.2.23, error < 4.5e-4), luego Newton-Halley */
    const t = sqrt(-2 * log(pc));
    let z = -(t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));
    for (let i = 0; i < 6; i++) {
      const f = pnorm(z) - pc;                 // z ≤ 0: cola izquierda con precisión relativa
      const d = f / dnorm(z);
      const paso = d / (1 + z * d / 2);
      z -= paso;
      if (abs(paso) <= 1e-16 * max(1, abs(z))) break;
    }
    return media + de * (izquierda ? z : -z);
  }

  /* ---------------- gamma incompleta regularizada ---------------- */
  /** Devuelve { inferior: P(a,x), superior: Q(a,x) }, ambas con precisión relativa en su cola. */
  function gammaInc(a, x) {
    if (Number.isNaN(a) || Number.isNaN(x) || a <= 0) return { inferior: NaN, superior: NaN };
    if (x <= 0) return { inferior: 0, superior: 1 };
    if (x === Infinity) return { inferior: 1, superior: 0 };
    const logPref = a * log(x) - x - lgamma(a);
    if (x < a + 1) {
      /* serie: P = e^{−x} x^a / Γ(a+1) · Σ xⁿ / ((a+1)…(a+n)) */
      let ap = a, suma = 1 / a, termino = 1 / a;
      for (let n = 0; n < 1e6; n++) {
        ap += 1;
        termino *= x / ap;
        suma += termino;
        if (termino < suma * 1e-17) break;
      }
      const P = exp(logPref) * suma;
      return { inferior: P, superior: 1 - P };
    }
    /* fracción continua de Legendre para Q (Lentz modificado) */
    let b = x + 1 - a, c = 1 / MIN, d = 1 / b, h = d;
    for (let i = 1; i < 1e6; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (abs(d) < MIN) d = MIN;
      c = b + an / c; if (abs(c) < MIN) c = MIN;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (abs(delta - 1) < 1e-16) break;
    }
    const Q = exp(logPref) * h;
    return { inferior: 1 - Q, superior: Q };
  }

  function pgamma(q, forma, escala, inferior) {
    escala = escala === undefined ? 1 : escala;
    if (!(forma > 0) || !(escala > 0)) return NaN;
    const r = gammaInc(forma, q / escala);
    return inferior === false ? r.superior : r.inferior;
  }
  function pchisq(q, gl, inferior) {
    if (!(gl > 0)) return NaN;
    return pgamma(q, gl / 2, 2, inferior);
  }
  function dchisq(x, gl) {
    if (x < 0) return 0;
    if (x === 0) return gl === 2 ? 0.5 : (gl < 2 ? Infinity : 0);
    const k = gl / 2;
    return exp((k - 1) * log(x) - x / 2 - k * Math.LN2 - lgamma(k));
  }

  /* ---------------- beta incompleta regularizada ---------------- */
  /* Fracción continua de I_x(a, b) (Lentz modificado). y = 1 − x exacto: el primer
     término, 1 − (a+b)x/(a+1), se escribe como (1 − b + (a+b)y)/(a+1), que no resta números
     casi iguales cuando x está cerca de 1 con parámetros enormes (t con 1e7 gl). */
  function betaFraccion(x, a, b, y) {
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = y !== undefined && x > 0.5 ? (1 - b + qab * y) / qap : 1 - qab * x / qap;
    if (abs(d) < MIN) d = MIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m < 1e6; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (abs(d) < MIN) d = MIN;
      c = 1 + aa / c; if (abs(c) < MIN) c = MIN;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (abs(d) < MIN) d = MIN;
      c = 1 + aa / c; if (abs(c) < MIN) c = MIN;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (abs(delta - 1) < 1e-16) break;
    }
    return h;
  }
  /**
   * I_x(a, b) y su complemento, ambos con precisión relativa en su cola.
   * y = 1 − x se puede pasar calculado aparte para no perder cifras cuando x ≈ 1, y
   * también log x y log y cuando x o y son tan pequeños que se harían cero.
   */
  function betaInc(x, a, b, y, lx, ly) {
    if (Number.isNaN(x) || !(a > 0) || !(b > 0)) return { inferior: NaN, superior: NaN };
    const yDado = y !== undefined;
    if (!yDado) y = 1 - x;
    if (lx === undefined) lx = log(x);
    if (ly === undefined) ly = yDado ? log(y) : log1p(-x);
    if (lx === -Infinity || x < 0) return { inferior: 0, superior: 1 };
    if (ly === -Infinity || y < 0) return { inferior: 1, superior: 0 };
    const logPref = a * lx + b * ly - lbeta(a, b);
    /* La fracción converge rápido con x por debajo de su media; por encima se usa la de
       I_y(b, a). Excepción comprobada contra R: con a ≤ 1, x < 0.1 y x hasta 3 veces el
       umbral (la t con millones de gl), la fracción en y ≈ 1 pierde hasta 1e-9 por
       cancelación y la directa sigue convergiendo con error < 1e-11. Con a grande la
       directa no converge pasado el umbral, por eso la excepción es solo para a ≤ 1. */
    const umbral = (a + 1) / (a + b + 2);
    if (x < umbral || (a <= 1 && y > 0.9 && x < 3 * umbral)) {
      const I = exp(logPref) * betaFraccion(x, a, b, y) / a;
      return { inferior: I, superior: 1 - I };
    }
    const J = exp(logPref) * betaFraccion(y, b, a, x) / b;   // I_y(b, a) = 1 − I_x(a, b)
    return { inferior: 1 - J, superior: J };
  }
  function pbeta(q, a, b, inferior) {
    const r = betaInc(q, a, b);
    return inferior === false ? r.superior : r.inferior;
  }

  /* ---------------- t de Student ---------------- */
  function pt(q, gl, inferior) {
    inferior = inferior !== false;
    if (Number.isNaN(q) || !(gl > 0)) return NaN;
    if (gl === Infinity) return pnorm(q, 0, 1, inferior);
    if (q === Infinity) return inferior ? 1 : 0;
    if (q === -Infinity) return inferior ? 0 : 1;
    if (q === 0) return 0.5;
    /* cola: P(|T| > |q|) / 2, por la forma de la beta que la da directamente.
       Se usa r = gl/q² calculado como (gl/q)/q: q² se desbordaría con |q| > 1e154. */
    const lr = log(gl) - 2 * log(abs(q));   // log(gl/q²), sin desbordes
    const r = exp(lr);
    const x = 1 / (1 + r), y = r / (1 + r);                // x = q²/(gl + q²),  y = gl/(gl + q²)
    /* log x y log y sin cancelación: y ≈ 1 − q²/gl cuando gl es enorme */
    const lx = -log1p(r), ly = r > 1 ? -log1p((q / gl) * q) : lr - log1p(r);
    let cola;
    if (r > 1) cola = 0.5 * betaInc(x, 0.5, gl / 2, y, lx, ly).superior;
    else cola = 0.5 * betaInc(y, gl / 2, 0.5, x, ly, lx).inferior;
    const lejana = (q < 0) === inferior;
    return lejana ? cola : 1 - cola;
  }
  function dt(x, gl) {
    return exp(lgamma((gl + 1) / 2) - lgamma(gl / 2) - 0.5 * log(gl * Math.PI) - (gl + 1) / 2 * log1p(x * x / gl));
  }

  /* ---------------- F ---------------- */
  function pf(q, gl1, gl2, inferior) {
    inferior = inferior !== false;
    if (Number.isNaN(q) || !(gl1 > 0) || !(gl2 > 0)) return NaN;
    if (q <= 0) return inferior ? 0 : 1;
    if (q === Infinity) return inferior ? 1 : 0;
    if (gl2 === Infinity) {
      if (gl1 === Infinity) return q < 1 ? (inferior ? 0 : 1) : (q > 1 ? (inferior ? 1 : 0) : 0.5);
      return pchisq(q * gl1, gl1, inferior);
    }
    if (gl1 === Infinity) return pchisq(gl2 / q, gl2, !inferior);
    const den = gl2 + gl1 * q;
    const razon = gl1 * q / gl2;   // x/y
    const r = betaInc(gl1 * q / den, gl1 / 2, gl2 / 2, gl2 / den, -log1p(1 / razon), -log1p(razon));
    return inferior ? r.inferior : r.superior;
  }
  function df(x, gl1, gl2) {
    if (x < 0) return 0;
    const a = gl1 / 2, b = gl2 / 2;
    return exp(a * log(gl1 / gl2) + (a - 1) * log(x) - (a + b) * log1p(gl1 * x / gl2) - lbeta(a, b));
  }

  /* ---------------- discretas ---------------- */
  function dbinom(k, n, p) {
    if (k < 0 || k > n || k !== floor(k)) return 0;
    if (p === 0) return k === 0 ? 1 : 0;
    if (p === 1) return k === n ? 1 : 0;
    return exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * log(p) + (n - k) * log1p(-p));
  }
  function pbinom(k, n, p, inferior) {
    inferior = inferior !== false;
    k = floor(k + 1e-7);
    if (k < 0) return inferior ? 0 : 1;
    if (k >= n) return inferior ? 1 : 0;
    /* P(X ≤ k) = I_{1−p}(n − k, k + 1) */
    const r = betaInc(1 - p, n - k, k + 1, p, log1p(-p), log(p));
    return inferior ? r.inferior : r.superior;
  }
  /**
   * Cuantil de la binomial: el menor k con P(X ≤ k) ≥ p (cola inferior) o con P(X > k) ≤ p (cola
   * superior, buscada con la cola superior misma para no perder las colas diminutas en 1 − p).
   */
  function qbinom(p, n, prob, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(n >= 0) || n !== floor(n) || !(prob >= 0 && prob <= 1)) return NaN;
    if (prob === 0 || n === 0) return 0;
    if (prob === 1) return n;
    if (inferior ? p === 0 : p === 1) return 0;
    if (inferior ? p === 1 : p === 0) return n;
    /* tolerancia relativa de 1e-12: si p cae justo en un salto de F (p. ej. 1/2 con n impar y prob = 1/2),
       el redondeo de P no debe mover el cuantil al siguiente entero. Cubre el error de pbinom con n de
       miles (≈ 1e-13: su factor exp(a log x + b log(1 − x) − log B) se calcula con exponentes de miles) */
    const e = 1e-12;
    const cumple = inferior ? k => pbinom(k, n, prob, true) >= p * (1 - e) : k => pbinom(k, n, prob, false) <= p * (1 + e);
    /* arranque normal con corrección de Cornish-Fisher; después, a pasos hasta el menor k que cumple */
    const mu = n * prob, s = sqrt(n * prob * (1 - prob)), g = (1 - 2 * prob) / s, z = qnorm(p, 0, 1, inferior);
    let k = max(0, min(n, floor(mu + s * (z + g * (z * z - 1) / 6) + 0.5)));
    if (cumple(k)) { while (k > 0 && cumple(k - 1)) k--; }
    else { while (k < n && !cumple(k)) k++; }
    return k;
  }
  /* ---------------- distribuciones exactas de rangos (Wilcoxon) ----------------
     Conteos exactos: c[k] = número de subconjuntos de {1, …, n} que suman k (rango con signo) y número de
     ordenaciones con estadístico U = k (suma de rangos, por la recurrencia f(k; m, n) = f(k − n; m − 1, n) +
     f(k; m, n − 1)). Solo sumas de positivos: sin cancelación. Las probabilidades suman la cola más corta y
     los cuantiles usan el margen de 10ε, como signrank.c y wilcox.c de R. */
  const conteoSR = new Map(), conteoW = new Map();
  function conteosSignrank(n) {
    let c = conteoSR.get(n);
    if (c) return c;
    const tope = n * (n + 1) / 2;
    c = new Float64Array(tope + 1); c[0] = 1;
    for (let i = 1; i <= n; i++) for (let s = i * (i + 1) / 2; s >= i; s--) c[s] += c[s - i];
    if (conteoSR.size > 50) conteoSR.clear();
    conteoSR.set(n, c);
    return c;
  }
  function psignrank(x, n, inferior) {
    inferior = inferior !== false;
    if (!(n > 0) || n !== floor(n)) return NaN;
    x = Math.round(x + 1e-7);
    if (x < 0) return inferior ? 0 : 1;
    if (x >= n * (n + 1) / 2) return inferior ? 1 : 0;
    const c = conteosSignrank(n), f = exp(-n * Math.LN2);
    let p = 0;
    if (x <= n * (n + 1) / 4) { for (let i = 0; i <= x; i++) p += c[i] * f; }
    else { const y = n * (n + 1) / 2 - x; for (let i = 0; i < y; i++) p += c[i] * f; inferior = !inferior; }
    return inferior ? p : 0.5 - p + 0.5;
  }
  function dsignrank(x, n) {
    if (x < 0 || x !== floor(x) || x > n * (n + 1) / 2) return 0;
    return exp(log(conteosSignrank(n)[x]) - n * Math.LN2);
  }
  function qsignrank(p, n, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(n > 0)) return NaN;
    if (!inferior) p = 0.5 - p + 0.5;
    if (p === 0) return 0;
    if (p === 1) return n * (n + 1) / 2;
    const c = conteosSignrank(n), f = exp(-n * Math.LN2), EPS = 2.220446049250313e-16;
    let s = 0, q = 0;
    if (p <= 0.5) { p = p - 10 * EPS; for (;;) { s += c[q] * f; if (s >= p) break; q++; } }
    else { p = 1 - p + 10 * EPS; for (;;) { s += c[q] * f; if (s > p) { q = n * (n + 1) / 2 - q; break; } q++; } }
    return q;
  }
  function conteosWilcox(m, n) {
    const clave = m + ',' + n;
    let c = conteoW.get(clave);
    if (c) return c;
    /* f[m'][k] para el n' en curso; se recorre n' = 0 … n */
    const tope = m * n;
    let f = Array.from({ length: m + 1 }, () => new Float64Array(tope + 1));
    for (let a = 0; a <= m; a++) f[a][0] = 1;
    for (let b = 1; b <= n; b++) {
      const g = Array.from({ length: m + 1 }, () => new Float64Array(tope + 1));
      g[0][0] = 1;
      for (let a = 1; a <= m; a++) {
        const ga = g[a], gant = g[a - 1], fa = f[a], lim = a * b;
        for (let k = 0; k <= lim; k++) ga[k] = (k >= b ? gant[k - b] : 0) + fa[k];
      }
      f = g;
    }
    c = f[m];
    if (conteoW.size > 50) conteoW.clear();
    conteoW.set(clave, c);
    return c;
  }
  /** C(N, k) como choose() de R: el k menor, producto si k < 30 y si no exp(−log(N + 1) − lbeta(N − k + 1, k + 1)). */
  function chooseR(N, k) {
    if (N - k < k) k = N - k;
    if (k < 30) { let r = N; for (let j = 2; j <= k; j++) r *= (N - j + 1) / j; return Math.round(r); }
    return Math.round(exp(-log(N + 1) - lbeta(N - k + 1, k + 1)));
  }
  function pwilcox(q, m, n, inferior) {
    inferior = inferior !== false;
    if (!(m > 0 && n > 0)) return NaN;
    q = floor(q + 1e-7);
    if (q < 0) return inferior ? 0 : 1;
    if (q >= m * n) return inferior ? 1 : 0;
    const c = conteosWilcox(m, n), tot = chooseR(m + n, n);
    let p = 0;
    if (q <= m * n / 2) { for (let i = 0; i <= q; i++) p += c[i] / tot; }
    else { const y = m * n - q; for (let i = 0; i < y; i++) p += c[i] / tot; inferior = !inferior; }
    return inferior ? p : 0.5 - p + 0.5;
  }
  function dwilcox(x, m, n) {
    if (x < 0 || x !== floor(x) || x > m * n) return 0;
    return conteosWilcox(m, n)[x] / chooseR(m + n, n);
  }
  function qwilcox(p, m, n, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(m > 0 && n > 0)) return NaN;
    if (!inferior) p = 0.5 - p + 0.5;
    if (p === 0) return 0;
    if (p === 1) return m * n;
    const c = conteosWilcox(m, n), tot = chooseR(m + n, n), EPS = 2.220446049250313e-16;
    let s = 0, q = 0;
    if (p <= 0.5) { p = p - 10 * EPS; for (;;) { s += c[q] / tot; if (s >= p) break; q++; } }
    else { p = 1 - p + 10 * EPS; for (;;) { s += c[q] / tot; if (s > p) { q = m * n - q; break; } q++; } }
    return q;
  }

  /* ---------------- t no central (AS 243 de Lenth, como pnt.c de R) ----------------
     Serie doble de Guenther con errmax = 1e-12 y hasta 1000 términos; R la acumula en doble extendido,
     aquí en doble (diferencias del orden de 1e-15). */
  function ptnc(t, gl, ncp, inferior) {
    inferior = inferior !== false;
    if (!(gl > 0)) return NaN;
    if (ncp === 0) return pt(t, gl, inferior);
    if (!Number.isFinite(t)) return (t < 0) === inferior ? 0 : 1;
    let negdel, tt, del;
    if (t >= 0) { negdel = false; tt = t; del = ncp; }
    else {
      if (ncp > 40) return inferior ? 0 : 1;          // R_DT_0: pt(q, gl, ncp) ≤ Φ(−ncp)
      negdel = true; tt = -t; del = -ncp;
    }
    if (gl > 4e5 || del * del > 2 * Math.LN2 * 1021) {
      const s = 1 / (4 * gl);
      return pnorm(tt * (1 - s), del, sqrt(1 + tt * tt * 2 * s), inferior !== negdel);
    }
    let x = t * t;
    let rxb = gl / (x + gl);
    x = x / (x + gl);
    let tnc;
    if (x > 0) {
      const lambda = del * del;
      let p = 0.5 * exp(-0.5 * lambda);
      if (p === 0) return inferior ? 0 : 1;               // |ncp| enorme: R devuelve R_DT_0
      let q = 0.797884560802865355879892119869 * p * del;
      let s = 0.5 - p;
      if (s < 1e-7) s = -0.5 * Math.expm1(-0.5 * lambda);
      let a = 0.5;
      const b = 0.5 * gl;
      rxb = Math.pow(rxb, b);
      const albeta = 0.572364942924700087071713675677 + lgamma(b) - lgamma(0.5 + b);
      let xodd = pbeta(x, a, b, true);
      let godd = 2 * rxb * exp(a * log(x) - albeta);
      tnc = b * x;
      let xeven = tnc < 2.220446049250313e-16 ? tnc : 1 - rxb;
      let geven = tnc * rxb;
      tnc = p * xodd + q * xeven;
      for (let it = 1; it <= 1000; it++) {
        a += 1;
        xodd -= godd;
        xeven -= geven;
        godd *= x * (a + b - 1) / a;
        geven *= x * (a + b - 0.5) / (a + 0.5);
        p *= lambda / (2 * it);
        q *= lambda / (2 * it + 1);
        tnc += p * xodd + q * xeven;
        s -= p;
        if (s < -1e-10) break;
        if (s <= 0 && it > 1) break;
        const errbd = 2 * s * (xodd - godd);
        if (abs(errbd) < 1e-12) break;
      }
    } else tnc = 0;
    tnc += pnorm(-del, 0, 1, true);
    const inf = inferior !== negdel;
    tnc = min(tnc, 1);
    return inf ? tnc : 0.5 - tnc + 0.5;
  }

  function dpois(k, lambda) {
    if (k < 0 || k !== floor(k)) return 0;
    if (lambda === 0) return k === 0 ? 1 : 0;
    return exp(k * log(lambda) - lambda - lgamma(k + 1));
  }
  function ppois(k, lambda, inferior) {
    inferior = inferior !== false;
    k = floor(k + 1e-7);
    if (k < 0) return inferior ? 0 : 1;
    if (lambda === 0) return inferior ? 1 : 0;
    /* P(X ≤ k) = Q(k + 1, λ) */
    const r = gammaInc(k + 1, lambda);
    return inferior ? r.superior : r.inferior;
  }

  /* ---------------- rango estudentizado (Copenhaver y Holland, 1988) ---------------- */
  /* Nodos y pesos de Gauss-Legendre (mitad positiva) de 12 y de 16 puntos. */
  const GL12_X = [0.981560634246719250690549090149, 0.904117256370474856678465866119, 0.769902674194304687036893833213,
    0.587317954286617447296702418941, 0.367831498998180193752691536644, 0.125233408511468915472441369464];
  const GL12_W = [0.047175336386511827194615961485, 0.106939325995318430960254718194, 0.160078328543346226334652529543,
    0.203167426723065921749064455810, 0.233492536538354808760849898925, 0.249147045813402785000562436043];
  const GL16_X = [0.989400934991649932596154173450, 0.944575023073232576077988415535, 0.865631202387831743880467897712,
    0.755404408355003033895101194847, 0.617876244402643748446671764049, 0.458016777657227386342419442984,
    0.281603550779258913230460501460, 0.950125098376374401853193354250e-1];
  const GL16_W = [0.271524594117540948517805724560e-1, 0.622535239386478928628438369944e-1, 0.951585116824927848099251076022e-1,
    0.124628971255533872052476282192, 0.149595988816576732081501730547, 0.169156519395002538189312079030,
    0.182603415044923588866763667969, 0.189450610455068496285396723208];

  /**
   * P(rango de k normales estándar < w), elevado a r (número de rangos).
   * Integra sobre el valor mínimo con Gauss-Legendre de 12 puntos en 2 o 3 tramos.
   */
  function probRango(w, r, k) {
    const mitad = w * 0.5;
    if (mitad >= 8) return 1;
    let pr = 2 * pnorm(mitad) - 1;            // P(|Z| < w/2)
    pr = pr >= 1 ? 1 : pow(pr, k);
    const tramos = w > 3 ? 2 : 3;
    let inf = mitad;
    const paso = (8 - mitad) / tramos;
    let sup = inf + paso;
    let suma = 0;
    const k1 = k - 1;
    const umbral = exp(-30 / k1);
    for (let t = 0; t < tramos; t++) {
      let parcial = 0;
      const a = 0.5 * (sup + inf), b = 0.5 * (sup - inf);
      for (let jj = 1; jj <= 12; jj++) {
        let j, xx;
        if (jj > 6) { j = 12 - jj + 1; xx = GL12_X[j - 1]; } else { j = jj; xx = -GL12_X[j - 1]; }
        const ac = a + b * xx;
        const qexpo = ac * ac;
        if (qexpo > 60) break;
        const dentro = pnorm(ac) - pnorm(ac - w);
        if (dentro >= umbral) parcial += GL12_W[j - 1] * exp(-0.5 * qexpo) * pow(dentro, k1);
      }
      suma += parcial * (2 * b * k / sqrt(2 * Math.PI));
      inf = sup;
      sup += paso;
    }
    pr += suma;
    if (pr <= exp(-30 / r)) return 0;
    pr = pow(pr, r);
    return pr >= 1 ? 1 : pr;
  }

  /**
   * P(Q < q) del rango estudentizado de k medias con gl grados de libertad del error
   * (r = número de rangos, 1 por omisión).
   */
  function ptukey(q, k, gl, inferior, r) {
    inferior = inferior !== false; r = r || 1;
    if (Number.isNaN(q) || Number.isNaN(k) || Number.isNaN(gl)) return NaN;
    if (q <= 0) return inferior ? 0 : 1;
    if (gl < 2 || r < 1 || k < 2) return NaN;
    if (q === Infinity) return inferior ? 1 : 0;
    let P;
    if (gl > 25000) P = probRango(q, r, k);
    else {
      const f2 = gl * 0.5;
      const f21 = f2 - 1;
      const ff4 = gl * 0.25;
      const ulen = gl <= 100 ? 1 : gl <= 800 ? 0.5 : gl <= 5000 ? 0.25 : 0.125;
      const f2lf = f2 * log(gl) - gl * Math.LN2 - lgamma(f2) + log(ulen);
      P = 0;
      let parcial = 0;
      for (let i = 1; i <= 50; i++) {
        parcial = 0;
        const twa1 = (2 * i - 1) * ulen;
        for (let jj = 1; jj <= 16; jj++) {
          let j, t1, u;
          if (jj > 8) { j = jj - 9; u = twa1 + GL16_X[j] * ulen; t1 = f2lf + f21 * log(u) - u * ff4; }
          else { j = jj - 1; u = twa1 - GL16_X[j] * ulen; t1 = f2lf + f21 * log(u) - u * ff4; }
          if (t1 >= -30) {
            const qsqz = q * sqrt(u * 0.5);
            parcial += probRango(qsqz, r, k) * GL16_W[j] * exp(t1);
          }
        }
        if (i * ulen >= 1 && parcial <= 1e-14) break;
        P += parcial;
      }
      if (P > 1) P = 1;
    }
    return inferior ? P : 1 - P;
  }

  /* ---------------- cuantiles por el método de Brent ---------------- */
  /**
   * Raíz de f en [a, b] (f(a) y f(b) de signo contrario) con el método de Brent (1973).
   * Se detiene cuando el intervalo mide menos que tolRel·|b| + tolAbs.
   */
  function brent(f, a, b, tolRel, tolAbs) {
    tolRel = tolRel === undefined ? 1e-15 : tolRel;
    tolAbs = tolAbs || 0;
    let fa = f(a), fb = f(b);
    if (fa === 0) return a;
    if (fb === 0) return b;
    if (fa * fb > 0) return NaN;
    let c = a, fc = fa, d = b - a, e = d;
    for (let i = 0; i < 300; i++) {
      if (fb * fc > 0) { c = a; fc = fa; d = b - a; e = d; }
      if (abs(fc) < abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
      const tol1 = 2 * EPS * abs(b) + 0.5 * (tolRel * abs(b) + tolAbs);
      const m = 0.5 * (c - b);
      if (abs(m) <= tol1 || fb === 0) return b;
      if (abs(e) >= tol1 && abs(fa) > abs(fb)) {
        let p, q, r;
        const s = fb / fa;
        if (a === c) { p = 2 * m * s; q = 1 - s; }
        else { q = fa / fc; r = fb / fc; p = s * (2 * m * q * (q - r) - (b - a) * (r - 1)); q = (q - 1) * (r - 1) * (s - 1); }
        if (p > 0) q = -q; else p = -p;
        if (2 * p < min(3 * m * q - abs(tol1 * q), abs(e * q))) { e = d; d = p / q; }
        else { d = m; e = d; }
      } else { d = m; e = d; }
      a = b; fa = fb;
      b += abs(d) > tol1 ? d : (m > 0 ? tol1 : -tol1);
      fb = f(b);
    }
    return b;
  }

  /** Amplía [a, b] (en pasos que se duplican) hasta que g(a) ≤ 0 ≤ g(b); g creciente. */
  function encerrar(g, a, b) {
    let paso = b - a;
    for (let i = 0; i < 200 && g(b) < 0; i++) { a = b; paso *= 2; b += paso; }
    for (let i = 0; i < 200 && g(a) > 0; i++) { b = a; paso *= 2; a -= paso; }
    return [a, b];
  }
  /* g(x) creciente cuya raíz es el cuantil: con la cola pedida, para no perder cifras */
  const objetivo = (cdf, p, inferior) => (inferior ? x => cdf(x, true) - p : x => p - cdf(x, false));
  const pValido = p => !(Number.isNaN(p) || p < 0 || p > 1);

  /** Cuantil en la recta real, partiendo de x0. */
  function invertirReal(cdf, p, inferior, x0) {
    const g = objetivo(cdf, p, inferior);
    const [a, b] = encerrar(g, x0 - 1, x0 + 1);
    return brent(g, a, b, 1e-15, 1e-300);
  }
  /** Cuantil en (0, ∞): se busca u = log x, así las colas extremas no cuestan más. */
  function invertirPositivo(cdf, p, inferior, x0) {
    const g = objetivo(cdf, p, inferior);
    const G = u => g(exp(u));
    const u0 = log(x0);
    const [a, b] = encerrar(G, u0 - 1, u0 + 1);
    return exp(brent(G, a, b, 0, 1e-15));
  }

  function qt(p, gl, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(gl > 0)) return NaN;
    if (gl === Infinity) return qnorm(p, 0, 1, inferior);
    if (p === 0) return inferior ? -Infinity : Infinity;
    if (p === 1) return inferior ? Infinity : -Infinity;
    if (p === 0.5) return 0;
    /* por simetría se busca x > 0 con P(T > x) = cola, en escala logarítmica
       (con pocos grados de libertad los cuantiles extremos son enormes) */
    const izquierda = inferior ? p < 0.5 : p > 0.5;
    const cola = p < 0.5 ? p : 1 - p;
    const x = invertirPositivo((v, inf) => pt(v, gl, inf), cola, false, max(0.5, -qnorm(cola)));
    return izquierda ? -x : x;
  }
  function qchisq(p, gl, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(gl > 0)) return NaN;
    if (p === (inferior ? 0 : 1)) return 0;
    if (p === (inferior ? 1 : 0)) return Infinity;
    return invertirPositivo((x, inf) => pchisq(x, gl, inf), p, inferior, max(gl, 0.5));
  }
  function qgamma(p, forma, escala, inferior) {
    escala = escala === undefined ? 1 : escala;
    inferior = inferior !== false;
    if (!pValido(p) || !(forma > 0) || !(escala > 0)) return NaN;
    if (p === (inferior ? 0 : 1)) return 0;
    if (p === (inferior ? 1 : 0)) return Infinity;
    return escala * invertirPositivo((x, inf) => pgamma(x, forma, 1, inf), p, inferior, max(forma, 0.5));
  }
  function qf(p, gl1, gl2, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(gl1 > 0) || !(gl2 > 0)) return NaN;
    if (p === (inferior ? 0 : 1)) return 0;
    if (p === (inferior ? 1 : 0)) return Infinity;
    return invertirPositivo((x, inf) => pf(x, gl1, gl2, inf), p, inferior, 1);
  }
  /** Cuantil de la beta: se busca z = logit x, con x e 1 − x calculados aparte. */
  function qbeta(p, a, b, inferior) {
    inferior = inferior !== false;
    if (!pValido(p) || !(a > 0) || !(b > 0)) return NaN;
    if (p === (inferior ? 0 : 1)) return 0;
    if (p === (inferior ? 1 : 0)) return 1;
    const en = z => betaInc(1 / (1 + exp(-z)), a, b, 1 / (1 + exp(z)));
    const G = inferior ? z => en(z).inferior - p : z => p - en(z).superior;
    const z0 = log(a / b);
    const [lo, hi] = encerrar(G, z0 - 1, z0 + 1);
    const z = brent(G, lo, hi, 0, 1e-15);
    return 1 / (1 + exp(-z));
  }
  /** Cuantil del rango estudentizado, invertido hasta la precisión de ptukey (clase B). */
  function qtukey(p, k, gl, inferior, r) {
    inferior = inferior !== false; r = r || 1;
    if (!pValido(p) || gl < 2 || k < 2 || r < 1) return NaN;
    if (p === (inferior ? 0 : 1)) return 0;
    if (p === (inferior ? 1 : 0)) return Infinity;
    return invertirPositivo((x, inf) => ptukey(x, k, gl, inf, r), p, inferior, 3);
  }

  SP.dist = {
    lgamma, lbeta,
    pnorm, qnorm, dnorm,
    pt, qt, dt,
    pf, qf, df,
    pchisq, qchisq, dchisq,
    pgamma, qgamma, pbeta, qbeta,
    dbinom, pbinom, qbinom, dpois, ppois,
    psignrank, dsignrank, qsignrank, pwilcox, dwilcox, qwilcox, ptnc,
    ptukey, qtukey,
    _interno: { betaInc, gammaInc, brent, encerrar, erfcPositivo, pnormSerie, colaNormal, probRango },
  };
});
