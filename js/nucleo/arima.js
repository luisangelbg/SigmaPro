/* SigmaPro — modelos ARIMA y SARIMA por máxima verosimilitud exacta, con su pronóstico.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El procedimiento de arima de R (stats; Gardner, Harvey y Phillips, 1980; Durbin y Koopman, 2012), escrito desde
   las fórmulas:
   - el modelo en espacio de estados de la serie sin diferenciar (makeARIMA): estado de dimensión r + d con
     r = max(p, q + 1), la parte no estacionaria con varianza inicial κ = 1e6 y la estacionaria con su covarianza
     exacta (la ecuación de Lyapunov, resuelta por duplicación; da lo mismo que Gardner1980 y Rossignol2011);
   - el filtro de Kalman de ARIMA_Like con la estructura de T (cada paso en O(r·(r + d))), sin contar las
     observaciones cuya varianza de predicción pasa de 1e4 (las d primeras, difusas) ni las faltantes;
   - la función objetivo de armafn, ½·(log(S/ν) + Σ log F/ν), sobre los parámetros transformados (los AR por tanh y
     Durbin-Levinson, como partrans, para quedar en la región estacionaria; los MA se invierten con maInvert);
   - el arranque por suma de cuadrados condicional (CSS, como ARIMA_CSS) y el óptimo de la verosimilitud pulido con
     Newton hasta un paso de 1e-10;
   - el error estándar como arima: el hessiano numérico de optim (diferencias centrales de gradientes numéricos con
     ndeps = 1e-3 y parscale: 1 para los ARMA y 10 veces el EE de la media para la media) en el espacio transformado,
     llevado a los coeficientes con el jacobiano de ARIMA_Gradtrans (diferencias hacia adelante de 1e-3);
   - el pronóstico de KalmanForecast desde el estado final, con su varianza Z'PZ·σ². */
SP.definir('arima', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, log, max, min, tanh, atanh } = Math;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const KAPPA = 1e6;

  /* ---------------- transformación de los parámetros ---------------- */
  function partrans(raw) {
    const p = raw.length, nuevo = raw.map(v => tanh(v)), work = nuevo.slice();
    for (let j = 1; j < p; j++) {
      const a = nuevo[j];
      for (let k = 0; k < j; k++) work[k] -= a * nuevo[j - k - 1];
      for (let k = 0; k < j; k++) nuevo[k] = work[k];
    }
    return nuevo;
  }
  function invpartrans(phi) {
    const p = phi.length, nuevo = phi.slice(), work = phi.slice();
    for (let j = p - 1; j > 0; j--) {
      const a = nuevo[j];
      for (let k = 0; k < j; k++) work[k] = (nuevo[k] + a * nuevo[j - k - 1]) / (1 - a * a);
      for (let k = 0; k < j; k++) nuevo[k] = work[k];
    }
    return nuevo.map(v => atanh(v));
  }
  /** arma = { p, q, P, Q, s, d, D }. Los parámetros van como en R: ar, ma, sar, sma (y después la media). */
  function transPars(par, arma, trans) {
    const { p: mp, q: mq, P: msp, Q: msq, s: ns } = arma;
    let params = par.slice();
    if (trans) {
      if (mp > 0) params.splice(0, mp, ...partrans(par.slice(0, mp)));
      if (msp > 0) params.splice(mp + mq, msp, ...partrans(par.slice(mp + mq, mp + mq + msp)));
    }
    const p = mp + ns * msp, q = mq + ns * msq, phi = new Array(p).fill(0), theta = new Array(q).fill(0);
    for (let i = 0; i < mp; i++) phi[i] = params[i];
    for (let i = 0; i < mq; i++) theta[i] = params[i + mp];
    if (ns > 0) {
      for (let j = 0; j < msp; j++) {
        phi[(j + 1) * ns - 1] += params[j + mp + mq];
        for (let i = 0; i < mp; i++) phi[(j + 1) * ns + i] -= params[i] * params[j + mp + mq];
      }
      for (let j = 0; j < msq; j++) {
        theta[(j + 1) * ns - 1] += params[j + mp + mq + msp];
        for (let i = 0; i < mq; i++) theta[(j + 1) * ns + i] += params[i + mp] * params[j + mp + mq + msp];
      }
    }
    return { phi, theta };
  }
  const undoPars = (par, arma) => transPars2(par, arma, partrans);
  const invTrans = (par, arma) => transPars2(par, arma, invpartrans);
  function transPars2(par, arma, f) {
    const out = par.slice(), { p, q, P } = arma;
    if (p > 0) out.splice(0, p, ...f(par.slice(0, p)));
    if (P > 0) out.splice(p + q, P, ...f(par.slice(p + q, p + q + P)));
    return out;
  }
  /** ARIMA_Gradtrans: A[i][j] = ∂(transformado_j)/∂(crudo_i) por diferencias hacia adelante de 1e-3. */
  function gradTrans(par, arma) {
    const n = par.length, eps = 1e-3, A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
    const bloque = (desde, k) => {
      if (k <= 0) return;
      const w1 = par.slice(desde, desde + k), w2 = partrans(w1);
      for (let i = 0; i < k; i++) { w1[i] += eps; const w3 = partrans(w1); for (let j = 0; j < k; j++) A[desde + i][desde + j] = (w3[j] - w2[j]) / eps; w1[i] -= eps; }
    };
    bloque(0, arma.p); bloque(arma.p + arma.q, arma.P);
    return A;
  }

  /* ---------------- raíces de polinomios (para revisar AR e invertir MA) ---------------- */
  /** Raíces de c0 + c1 z + … + cn z^n (Durand-Kerner). */
  function raices(c) {
    let n = c.length - 1;
    while (n > 0 && c[n] === 0) n--;
    if (n < 1) return [];
    const a = c.slice(0, n + 1).map(v => v / c[n]);
    let z = Array.from({ length: n }, (_, k) => [0.4 * Math.cos(2 * Math.PI * k / n + 0.4) + 0.9 * (k + 1) / n, 0.9 * Math.sin(2 * Math.PI * k / n + 0.4)]);
    const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
    const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
    const evalp = x => { let r = [1, 0]; for (let k = n - 1; k >= 0; k--) r = [r[0] * x[0] - r[1] * x[1] + a[k], r[0] * x[1] + r[1] * x[0]]; return r; };
    for (let it = 0; it < 500; it++) {
      let cambio = 0;
      z = z.map((zi, i) => {
        let den = [1, 0];
        z.forEach((zj, j) => { if (j !== i) den = mul(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
        const paso = div(evalp(zi), den);
        cambio = max(cambio, abs(paso[0]) + abs(paso[1]));
        return [zi[0] - paso[0], zi[1] - paso[1]];
      });
      if (cambio < 1e-15) break;
    }
    return z;
  }
  const modulo = z => Math.hypot(z[0], z[1]);
  function arEstacionario(ar) {
    let p = ar.length; while (p > 0 && ar[p - 1] === 0) p--;
    if (!p) return true;
    return raices([1].concat(ar.slice(0, p).map(v => -v))).every(z => modulo(z) > 1);
  }
  /** maInvert de R: refleja las raíces del MA que quedan dentro del círculo unitario. */
  function maInvert(ma) {
    const q = ma.length;
    let q0 = q; while (q0 > 0 && ma[q0 - 1] === 0) q0--;
    if (!q0) return ma.slice();
    const rs = raices([1].concat(ma.slice(0, q0))), dentro = rs.map(z => modulo(z) < 1);
    if (!dentro.some(Boolean)) return ma.slice();
    if (q0 === 1) return [1 / ma[0]].concat(new Array(q - q0).fill(0));
    const r2 = rs.map((z, i) => (dentro[i] ? (() => { const d = z[0] * z[0] + z[1] * z[1]; return [z[0] / d, -z[1] / d]; })() : z));
    /* x = Π (1 − z/r) */
    let x = [[1, 0]];
    for (const r of r2) {
      const d = r[0] * r[0] + r[1] * r[1], inv = [r[0] / d, -r[1] / d];
      const sig = x.map(() => [0, 0]).concat([[0, 0]]);
      x.forEach((v, k) => { sig[k][0] += v[0]; sig[k][1] += v[1]; const m = [v[0] * inv[0] - v[1] * inv[1], v[0] * inv[1] + v[1] * inv[0]]; sig[k + 1][0] -= m[0]; sig[k + 1][1] -= m[1]; });
      x = sig;
    }
    return x.slice(1).map(v => v[0]).concat(new Array(q - q0).fill(0));
  }

  /* ---------------- el modelo en espacio de estados ---------------- */
  /** Delta: los coeficientes de la diferenciación (1 − B)^d (1 − B^s)^D, sin el 1, con signo cambiado (como arima). */
  function deltaDe(d, D, s) {
    let poli = [1];
    const conv = (a, b) => { const out = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
    for (let i = 0; i < d; i++) poli = conv(poli, [1, -1]);
    for (let i = 0; i < D; i++) poli = conv(poli, [1].concat(new Array(s - 1).fill(0), [-1]));
    return poli.slice(1).map(v => -v);
  }
  /** La covarianza estacionaria del estado ARMA (r × r): P = TPT' + RR', por duplicación. */
  function q0(phi, theta, r) {
    const n2 = r * r, R = new Float64Array(r);
    R[0] = 1; for (let i = 1; i < r; i++) R[i] = theta[i - 1] || 0;
    let A = new Float64Array(n2), B = new Float64Array(n2), Pm = new Float64Array(n2), W = new Float64Array(n2), X = new Float64Array(n2);
    for (let i = 0; i < r; i++) { A[i * r] = phi[i] || 0; if (i + 1 < r) A[i * r + i + 1] = 1; for (let j = 0; j < r; j++) Pm[i * r + j] = R[i] * R[j]; }
    for (let it = 0; it < 80; it++) {
      /* W = A·P; X = W·A' (= A P A'); P += X; A = A·A */
      for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) { let t = 0; for (let k = 0; k < r; k++) t += A[i * r + k] * Pm[k * r + j]; W[i * r + j] = t; }
      let mx = 0, mp = 0;
      for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) { let t = 0; for (let k = 0; k < r; k++) t += W[i * r + k] * A[j * r + k]; X[i * r + j] = t; }
      for (let k = 0; k < n2; k++) { mx = max(mx, abs(X[k])); mp = max(mp, abs(Pm[k])); Pm[k] += X[k]; }
      if (mx <= 1e-17 * mp) break;
      for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) { let t = 0; for (let k = 0; k < r; k++) t += A[i * r + k] * A[k * r + j]; B[i * r + j] = t; }
      [A, B] = [B, A];
    }
    return Array.from({ length: r }, (_, i) => Array.from(Pm.subarray(i * r, i * r + r)));
  }
  /** makeARIMA: phi, theta (expandidos), Delta. */
  function modelo(phi, theta, Delta) {
    const p = phi.length, q = theta.length, r = max(p, q + 1), d = Delta.length, rd = r + d;
    const Pn = Array.from({ length: rd }, () => new Float64Array(rd));
    if (r > 1) { const Q = q0(phi, theta, r); for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) Pn[i][j] = Q[i][j]; }
    else Pn[0][0] = p > 0 ? 1 / (1 - phi[0] * phi[0]) : 1;
    for (let i = 0; i < d; i++) Pn[r + i][r + i] = KAPPA;
    return { phi, theta, Delta, r, d, rd, Pn };
  }
  /**
   * El filtro de Kalman de ARIMA_Like. y con faltantes (NaN). Devuelve la suma de cuadrados estandarizada, Σ log F,
   * cuántas observaciones cuentan, los residuos estandarizados (si se piden) y el estado final (a, P).
   */
  function kalman(y, mod, conResiduos) {
    const { phi, theta, Delta, r, d, rd } = mod, p = phi.length, q = theta.length, n = y.length;
    let a = new Float64Array(rd), P = Array.from({ length: rd }, () => new Float64Array(rd));
    const anew = new Float64Array(rd), M = new Float64Array(rd), mm = Array.from({ length: rd }, () => new Float64Array(rd));
    let Pnew = mod.Pn.map(f => Float64Array.from(f));
    let ssq = 0, sumlog = 0, nu = 0;
    const resid = conResiduos ? new Float64Array(n) : null;
    for (let l = 0; l < n; l++) {
      for (let i = 0; i < r; i++) { let tmp = i < r - 1 ? a[i + 1] : 0; if (i < p) tmp += phi[i] * a[0]; anew[i] = tmp; }
      if (d > 0) {
        for (let i = r + 1; i < rd; i++) anew[i] = a[i - 1];
        let tmp = a[0]; for (let i = 0; i < d; i++) tmp += Delta[i] * a[r + i];
        anew[r] = tmp;
      }
      if (l > 0) {
        /* Pnew = T P T' + V con la estructura de T: primero mm = T P, luego mm T' */
        for (let i = 0; i < r; i++) for (let j = 0; j < rd; j++) { let tmp = 0; if (i < p) tmp += phi[i] * P[0][j]; if (i < r - 1) tmp += P[i + 1][j]; mm[i][j] = tmp; }
        if (d > 0) {
          for (let j = 0; j < rd; j++) { let tmp = P[0][j]; for (let k = 0; k < d; k++) tmp += Delta[k] * P[r + k][j]; mm[r][j] = tmp; }
          for (let i = 1; i < d; i++) for (let j = 0; j < rd; j++) mm[r + i][j] = P[r + i - 1][j];
        }
        for (let i = 0; i < rd; i++) {
          for (let j = 0; j < r; j++) { let tmp = 0; if (j < p) tmp += phi[j] * mm[i][0]; if (j < r - 1) tmp += mm[i][j + 1]; Pnew[i][j] = tmp; }
          if (d > 0) {
            let tmp = mm[i][0]; for (let k = 0; k < d; k++) tmp += Delta[k] * mm[i][r + k];
            Pnew[i][r] = tmp;
            for (let k = 1; k < d; k++) Pnew[i][r + k] = mm[i][r + k - 1];
          }
        }
        for (let i = 0; i <= q; i++) { const vi = i === 0 ? 1 : theta[i - 1]; for (let j = 0; j <= q; j++) Pnew[i][j] += vi * (j === 0 ? 1 : theta[j - 1]); }
      }
      if (y[l] === y[l]) {
        let resid0 = y[l] - anew[0];
        for (let i = 0; i < d; i++) resid0 -= Delta[i] * anew[r + i];
        /* M = Pnew·Z y la ganancia F = Z'·Pnew·Z, con Z = (1, 0, …, Delta) */
        for (let i = 0; i < rd; i++) { let tmp = Pnew[i][0]; for (let k = 0; k < d; k++) tmp += Pnew[i][r + k] * Delta[k]; M[i] = tmp; }
        let gain = M[0];
        for (let i = 0; i < d; i++) gain += Delta[i] * M[r + i];
        if (gain < 1e4) { nu++; ssq += resid0 * resid0 / gain; sumlog += log(gain); }
        if (resid) resid[l] = resid0 / sqrt(gain);
        for (let i = 0; i < rd; i++) a[i] = anew[i] + M[i] * resid0 / gain;
        for (let i = 0; i < rd; i++) for (let j = 0; j < rd; j++) P[i][j] = Pnew[i][j] - M[i] * M[j] / gain;
      } else {
        for (let i = 0; i < rd; i++) a[i] = anew[i];
        for (let i = 0; i < rd; i++) P[i].set(Pnew[i]);
        if (resid) resid[l] = NaN;
      }
    }
    return { ssq, sumlog, nu, resid, a, P };
  }
  /** KalmanForecast: h pasos desde el estado final; la media y la varianza (sin σ²). */
  function pronostico(mod, estado, h) {
    const { phi, theta, Delta, r, d, rd } = mod;
    const Tm = Array.from({ length: rd }, (_, i) => new Float64Array(rd));
    for (let i = 0; i < r; i++) { if (i < phi.length) Tm[i][0] = phi[i]; if (i < r - 1) Tm[i][i + 1] = 1; }
    if (d > 0) { Tm[r][0] = 1; for (let k = 0; k < d; k++) Tm[r][r + k] = Delta[k]; for (let i = 1; i < d; i++) Tm[r + i][r + i - 1] = 1; }
    const Rv = new Float64Array(rd); Rv[0] = 1; for (let i = 0; i < theta.length; i++) Rv[i + 1] = theta[i];
    const Z = new Float64Array(rd); Z[0] = 1; for (let k = 0; k < d; k++) Z[r + k] = Delta[k];
    let a = Float64Array.from(estado.a), P = estado.P.map(f => Float64Array.from(f));
    const media = [], varianza = [];
    for (let l = 0; l < h; l++) {
      const an = new Float64Array(rd);
      for (let i = 0; i < rd; i++) { let s = 0; for (let k = 0; k < rd; k++) s += Tm[i][k] * a[k]; an[i] = s; }
      a = an;
      media.push(a.reduce((s, v, i) => s + v * Z[i], 0));
      const mm = Tm.map(f => { const o = new Float64Array(rd); for (let j = 0; j < rd; j++) { let s = 0; for (let k = 0; k < rd; k++) s += f[k] * P[k][j]; o[j] = s; } return o; });
      P = mm.map((f, i) => { const o = new Float64Array(rd); for (let j = 0; j < rd; j++) { let s = Rv[i] * Rv[j]; for (let k = 0; k < rd; k++) s += f[k] * Tm[j][k]; o[j] = s; } return o; });
      let v = 0; for (let i = 0; i < rd; i++) for (let j = 0; j < rd; j++) v += Z[i] * Z[j] * P[i][j];
      varianza.push(v);
    }
    return { media, varianza };
  }

  /* ---------------- suma de cuadrados condicional (arranque) ---------------- */
  function css(x, arma, phi, theta, ncond) {
    const n = x.length, w = Float64Array.from(x);
    for (let i = 0; i < arma.d; i++) for (let l = n - 1; l > 0; l--) w[l] -= w[l - 1];
    for (let i = 0; i < arma.D; i++) for (let l = n - 1; l >= arma.s; l--) w[l] -= w[l - arma.s];
    const resid = new Float64Array(n), p = phi.length, q = theta.length;
    let ssq = 0, nu = 0;
    for (let l = ncond; l < n; l++) {
      let tmp = w[l];
      for (let j = 0; j < p; j++) tmp -= phi[j] * w[l - j - 1];
      for (let j = 0; j < min(l - ncond, q); j++) tmp -= theta[j] * resid[l - j - 1];
      resid[l] = tmp;
      if (tmp === tmp) { nu++; ssq += tmp * tmp; }
    }
    return ssq / nu;
  }

  /* ---------------- optimización ---------------- */
  /** Gradiente por diferencias centrales y un cuasi-Newton (BFGS con búsqueda de Armijo); después Newton con hessiano numérico. */
  function minimizar(f, x0, opciones) {
    const n = x0.length, hG = opciones.hG || 1e-6;
    /* diferencias centrales; con «adelante» (solo para el AIC de la búsqueda), hacia adelante: la mitad de evaluaciones */
    const grad = opciones.adelante
      ? x => { const f0 = f(x); return x.map((v, i) => { const h = 1e-7 * max(1, abs(v)), a = x.slice(); a[i] += h; return (f(a) - f0) / h; }); }
      : x => x.map((v, i) => { const h = hG * max(1, abs(v)), a = x.slice(), b = x.slice(); a[i] += h; b[i] -= h; return (f(a) - f(b)) / (2 * h); });
    let x = x0.slice(), fx = f(x), g = grad(x), H = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
    for (let it = 0; it < (opciones.maxit || 300); it++) {
      const dir = H.map(f2 => -f2.reduce((s, v, j) => s + v * g[j], 0));
      let pend = dir.reduce((s, v, i) => s + v * g[i], 0);
      if (!(pend < 0)) { H = H.map((f2, i) => f2.map((_, j) => (i === j ? 1 : 0))); continue; }
      let t = 1, xn, fn;
      for (let k = 0; k < 60; k++) { xn = x.map((v, i) => v + t * dir[i]); fn = f(xn); if (Number.isFinite(fn) && fn <= fx + 1e-4 * t * pend) break; t /= 2; }
      if (!(fn < fx)) break;
      const gn = grad(xn), s = xn.map((v, i) => v - x[i]), yv = gn.map((v, i) => v - g[i]), sy = s.reduce((a, v, i) => a + v * yv[i], 0);
      if (sy > 1e-300) {
        const Hy = H.map(f2 => f2.reduce((a, v, j) => a + v * yv[j], 0)), yHy = yv.reduce((a, v, i) => a + v * Hy[i], 0);
        H = H.map((f2, i) => f2.map((v, j) => v + ((sy + yHy) * s[i] * s[j]) / (sy * sy) - (Hy[i] * s[j] + s[i] * Hy[j]) / sy));
      }
      const dif = abs(fx - fn);
      x = xn; fx = fn; g = gn;
      if (dif < (opciones.tol || 1e-10) * (abs(fx) + 1e-14)) break;
    }
    if (opciones.pulir) {
      /* Newton con el hessiano de los gradientes numéricos, hasta un paso de 1e-10 */
      for (let it = 0; it < 30; it++) {
        const hH = 1e-4, Hm = x.map((v, i) => { const h = hH * max(1, abs(v)), a = x.slice(), b = x.slice(); a[i] += h; b[i] -= h; const ga = grad(a), gb = grad(b); return ga.map((u, j) => (u - gb[j]) / (2 * h)); });
        const Hs = Hm.map((f2, i) => f2.map((v, j) => (v + Hm[j][i]) / 2));
        let paso;
        try { paso = resolver(Hs, g.map(v => -v)); } catch (e) { break; }
        let t = 1, xn, fn;
        for (let k = 0; k < 30; k++) { xn = x.map((v, i) => v + t * paso[i]); fn = f(xn); if (Number.isFinite(fn) && fn <= fx + 1e-15 * abs(fx)) break; t /= 2; }
        if (!(fn <= fx + 1e-15 * abs(fx))) break;
        const tam = max(...paso.map((v, i) => abs(t * v) / max(1, abs(x[i]))));
        x = xn; fx = fn; g = grad(x);
        if (tam < 1e-10) break;
      }
    }
    return { x, valor: fx };
  }
  function resolver(A, b) {
    const n = b.length, M = A.map((f, i) => f.slice().concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (abs(M[r][c]) > abs(M[piv][c])) piv = r;
      exigir(abs(M[piv][c]) > 1e-300, T('La matriz es singular.'));
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; if (f) for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j]; }
    }
    return M.map((f, i) => f[n] / f[i]);
  }
  function inversa(A) { const n = A.length; return A[0].map((_, j) => resolver(A, A.map((__, i) => (i === j ? 1 : 0)))).map((col, j, X) => X.map(c => c[j])); }

  /* ---------------- el ajuste ---------------- */
  /**
   * arima(x, order, seasonal, include.mean) con method = "CSS-ML" (o ML si hay faltantes).
   * o = { p, d, q, P, D, Q, s, media (bool) }. x con NaN donde falta.
   */
  function ajustar(x, o) {
    const arma = { p: o.p, q: o.q, P: o.P, Q: o.Q, s: o.P || o.D || o.Q ? o.s : 0, d: o.d, D: o.D };
    const narma = arma.p + arma.q + arma.P + arma.Q, Delta = deltaDe(o.d, o.D, arma.s || 1), nd = o.d + o.D;
    const conMedia = !!o.media && nd === 0, nobs = x.filter(v => v === v).length, nUsed = nobs - Delta.length;
    exigir(nUsed > narma + (conMedia ? 1 : 0) + 1, T('La serie es muy corta para este modelo ({n} observaciones útiles).', { n: nUsed }));
    /* la media y su parscale (10 × su EE, como el lm de arima) */
    let media0 = 0, escalaMedia = 1;
    if (conMedia) {
      const v = x.filter(z => z === z), m = v.reduce((a, b) => a + b, 0) / v.length, sd = sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
      media0 = m; escalaMedia = 10 * sd / sqrt(v.length);
    }
    const npar = narma + (conMedia ? 1 : 0), escala = new Array(narma).fill(1).concat(conMedia ? [escalaMedia] : []);
    const centrar = par => (conMedia ? x.map(v => v - par[narma]) : x);
    /* la verosimilitud (armafn) en el espacio transformado o no */
    const objetivo = (par, trans) => {
      let tp;
      try { tp = transPars(par, arma, trans); } catch (e) { return Infinity; }
      if (tp.phi.some(v => !Number.isFinite(v)) || tp.theta.some(v => !Number.isFinite(v))) return Infinity;
      const mod = modelo(tp.phi, tp.theta, Delta), k = kalman(centrar(par), mod, false);
      const s2 = k.ssq / k.nu, v = 0.5 * (log(s2) + k.sumlog / k.nu);
      return Number.isFinite(v) ? v : Infinity;
    };
    /* 1) arranque por CSS (sin faltantes) */
    let init = new Array(narma).fill(0).concat(conMedia ? [media0] : []), avisos = [];
    const hayFaltantes = nobs < x.length;
    if (!hayFaltantes && narma > 0) {
      const ncond = o.d + o.D * (arma.s || 0) + arma.p + (arma.s || 0) * arma.P;
      const fcss = par => { const tp = transPars(par, arma, false), r = css(centrar(par), arma, tp.phi, tp.theta, ncond); return r > 0 ? 0.5 * log(r) : Infinity; };
      const c = minimizar(fcss, init, { maxit: 200 });
      const ar = c.x.slice(0, arma.p), sar = c.x.slice(arma.p + arma.q, arma.p + arma.q + arma.P);
      if (arEstacionario(ar) && arEstacionario(sar)) init = c.x;
      else avisos.push(T('El arranque por suma de cuadrados condicional quedó fuera de la región estacionaria: se arrancó desde cero.'));
    }
    /* 2) al espacio transformado, con las MA invertibles */
    let u = invTrans(init, arma);
    if (arma.q > 0) u.splice(arma.p, arma.q, ...maInvert(u.slice(arma.p, arma.p + arma.q)));
    if (arma.Q > 0) u.splice(arma.p + arma.q + arma.P, arma.Q, ...maInvert(u.slice(arma.p + arma.q + arma.P, narma)));
    /* 3) máxima verosimilitud y pulido */
    const fml = par => objetivo(par, true);
    let opt = npar ? minimizar(fml, u, { maxit: 400, pulir: !o.soloAIC, tol: o.soloAIC ? 1e-12 : 1e-10, adelante: !!o.soloAIC }) : { x: [], valor: fml([]) };
    let coefT = opt.x.slice();
    if (arma.q > 0) coefT.splice(arma.p, arma.q, ...maInvert(coefT.slice(arma.p, arma.p + arma.q)));
    if (arma.Q > 0) coefT.splice(arma.p + arma.q + arma.P, arma.Q, ...maInvert(coefT.slice(arma.p + arma.q + arma.P, narma)));
    const valor = fml(coefT);
    if (o.soloAIC) { const vt = 2 * nUsed * valor + nUsed + nUsed * log(2 * Math.PI); return { aic: vt + 2 * npar + 2, loglik: -0.5 * vt }; }
    /* 4) el hessiano como optim (ndeps = 1e-3 con parscale) y el jacobiano de la transformación */
    let varCoef = null;
    if (npar) {
      const nd3 = 1e-3;
      const gradOptim = par => par.map((v, j) => { const h = nd3 * escala[j], a = par.slice(), b = par.slice(); a[j] += h; b[j] -= h; return (fml(a) - fml(b)) / (2 * nd3 * escala[j]); });
      const Hm = coefT.map((v, i) => { const a = coefT.slice(), b = coefT.slice(); a[i] += nd3; b[i] -= nd3; const ga = gradOptim(a), gb = gradOptim(b); return ga.map((gj, j) => (gj - gb[j]) / (2 * nd3)); });
      const Hs = Hm.map((f2, i) => f2.map((v, j) => 0.5 * (v + Hm[j][i])));
      const A = gradTrans(coefT, arma).map(f2 => f2.slice(0, npar)).slice(0, npar);
      const Hn = Hs.map(f2 => f2.map(v => v * nUsed));
      const X = A[0].map((_, j) => resolver(Hn, A.map(f2 => f2[j])));   // columnas de Hn⁻¹ A
      varCoef = A[0].map((_, i) => A[0].map((__, j) => A.reduce((s, f2, k) => s + f2[i] * X[j][k], 0)));
    }
    const coef = undoPars(coefT, arma);
    /* 5) σ², residuos y estado final con los coeficientes */
    const tp = transPars(coef, arma, false), mod = modelo(tp.phi, tp.theta, Delta), k = kalman(centrar(coef), mod, true);
    const sigma2 = k.ssq / nUsed, valorTotal = 2 * nUsed * valor + nUsed + nUsed * log(2 * Math.PI);
    const loglik = -0.5 * valorTotal, aic = valorTotal + 2 * npar + 2, bic = -2 * loglik + log(nUsed) * (npar + 1);
    const nombres = [].concat(Array.from({ length: arma.p }, (_, i) => 'ar' + (i + 1)), Array.from({ length: arma.q }, (_, i) => 'ma' + (i + 1)),
      Array.from({ length: arma.P }, (_, i) => 'sar' + (i + 1)), Array.from({ length: arma.Q }, (_, i) => 'sma' + (i + 1)), conMedia ? ['intercept'] : []);
    return { coef, nombres, var: varCoef, ee: varCoef ? varCoef.map((f2, i) => sqrt(f2[i])) : [], sigma2, loglik, aic, bic, nUsed, residuos: Array.from(k.resid),
      arma, conMedia, mod, estado: { a: k.a, P: k.P }, avisos };
  }
  /** El pronóstico de h pasos con su EE (predict.Arima). */
  function predecir(aj, h) {
    const f = pronostico(aj.mod, aj.estado, h), m = aj.conMedia ? aj.coef[aj.coef.length - 1] : 0;
    return { media: f.media.map(v => v + m), ee: f.varianza.map(v => sqrt(v * aj.sigma2)) };
  }

  SP.arima = { ajustar, predecir, transPars, partrans, invpartrans, maInvert, raices, arEstacionario, deltaDe, q0, kalman, modelo, css };
});
