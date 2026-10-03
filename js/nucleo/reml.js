/* SigmaPro — componentes de varianza por máxima verosimilitud restringida (REML).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Modelo:  y = Xb + Σₖ Zₖuₖ + e,  uₖ ~ N(0, σ²ₖ I),  e ~ N(0, σ²e I)
   con efectos aleatorios de factores (cada nivel con su efecto). Se resuelven las ecuaciones del modelo mixto de
   Henderson (1975), en la escala de σ²e:
       C [b; u] = [X'y; Z'y],   C = [X'X  X'Z; Z'X  Z'Z + Λ],   Λ = diag(σ²e / σ²ₖ)
   Cada término aleatorio de un solo factor tiene su bloque diagonal (cada fila lleva un solo nivel), y también un
   factor fijo de indicadoras (los genotipos fijos de los BLUE); el de más niveles (por ejemplo, genotipo × ambiente)
   se absorbe: C = [A B; B' D], S = A − B·D⁻¹·B' (complemento de Schur) y
   |C| = |D|·|S|. Solo S (los fijos y los demás aleatorios) se factoriza con Cholesky denso, y
   C⁻¹ = [S⁻¹, −S⁻¹BD⁻¹; ·, D⁻¹ + D⁻¹B'S⁻¹BD⁻¹] da las trazas, las PEV y la varianza de los fijos. Y
       −2ℓR = (n − p − q)·log σ²e + Σ qₖ·log σ²ₖ + log|C| + (y'y − ŝ'W'y)/σ²e + (n − p)·log 2π
   (la misma verosimilitud restringida que lme4 cuando X es la matriz de model.matrix).
   Los componentes se estiman por información promedio (Gilmour, Thompson y Cullis 1995): tres pasos EM para
   empezar y luego pasos de Newton con la matriz de información promedio, reduciendo el paso si la verosimilitud no
   mejora y sin dejar que un componente sea negativo. Un componente que llega a cero se fija en la frontera (vuelve
   si la verosimilitud mejora al soltarlo) y al final el modelo se ajusta sin él: el resultado es el de lme4 con ese
   componente en cero. Errores estándar: raíz de la diagonal de la inversa de la información promedio.
   Es el REML de BreedingPro (misma obra), con un criterio de convergencia más estricto. */
SP.definir('reml', function (SP) {
  'use strict';
  const T = SP.T;
  const { log, sqrt, abs, max, PI } = Math;
  const LIMITE = 2500;   // incógnitas de la parte densa (fijos y aleatorios que no se absorben)

  /* ---------------- álgebra densa por filas (d × d) ---------------- */
  /** Cholesky C = LLᵀ (L triangular inferior por filas); null si C no es definida positiva. */
  function chol(C, d) {
    const L = new Float64Array(d * d);
    for (let j = 0; j < d; j++) {
      const rj = j * d;
      let s = C[rj + j];
      for (let k = 0; k < j; k++) s -= L[rj + k] * L[rj + k];
      if (!(s > 0)) return null;
      const ljj = sqrt(s);
      L[rj + j] = ljj;
      for (let i = j + 1; i < d; i++) {
        const ri = i * d;
        let t = C[ri + j];
        for (let k = 0; k < j; k++) t -= L[ri + k] * L[rj + k];
        L[ri + j] = t / ljj;
      }
    }
    return L;
  }
  function resolver(L, d, b) {
    const z = new Float64Array(d);
    for (let i = 0; i < d; i++) { const ri = i * d; let s = b[i]; for (let k = 0; k < i; k++) s -= L[ri + k] * z[k]; z[i] = s / L[ri + i]; }
    for (let i = d - 1; i >= 0; i--) { let s = z[i]; for (let k = i + 1; k < d; k++) s -= L[k * d + i] * z[k]; z[i] = s / L[i * d + i]; }
    return z;
  }
  function inversa(L, d) {
    /* U = L⁻ᵀ por filas (la fila j es la columna j de L⁻¹: L·x = eⱼ) y C⁻¹[i][j] = Σ_{k ≥ máx(i, j)} U[i][k]·U[j][k];
       los dos pasos recorren la memoria en orden */
    const U = new Float64Array(d * d), x = new Float64Array(d);
    for (let j = 0; j < d; j++) {
      for (let i = j; i < d; i++) {
        const ri = i * d;
        let s = i === j ? 1 : 0;
        for (let k = j; k < i; k++) s -= L[ri + k] * x[k];
        x[i] = s / L[ri + i];
      }
      U.set(x.subarray(j, d), j * d + j);
    }
    const I = new Float64Array(d * d);
    for (let i = 0; i < d; i++) {
      const ri = i * d;
      for (let j = i; j < d; j++) {
        const rj = j * d;
        let s = 0;
        for (let k = j; k < d; k++) s += U[ri + k] * U[rj + k];
        I[ri + j] = s; I[rj + i] = s;
      }
    }
    return I;
  }
  /** Inversa de una matriz simétrica pequeña (arreglo de arreglos) por Gauss-Jordan; null si es singular. */
  function inversaChica(A) {
    const m = A.length, M = A.map((f, i) => f.slice().concat(Array.from({ length: m }, (_, j) => (i === j ? 1 : 0))));
    for (let c = 0; c < m; c++) {
      let piv = c;
      for (let r = c + 1; r < m; r++) if (abs(M[r][c]) > abs(M[piv][c])) piv = r;
      if (!(abs(M[piv][c]) > 1e-300)) return null;
      [M[c], M[piv]] = [M[piv], M[c]];
      const v = M[c][c];
      for (let j = 0; j < 2 * m; j++) M[c][j] /= v;
      for (let r = 0; r < m; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * m; j++) M[r][j] -= f * M[c][j]; }
    }
    return M.map(f => f.slice(m));
  }

  /**
   * Ajuste REML.
   * @param {object} mod  { y: Float64Array(n), X: Float64Array(n·p) por columnas y de rango completo, p,
   *                        aleatorios: [{ nombre, codigos: Int32Array(n) (−1 = sin efecto), niveles: [] }],
   *                        asignacion?: término de cada columna de X (para absorber un factor fijo grande) }
   * @param {object} [op]  { inicio: [σ²₁…σ²R, σ²e], maxIter, sinAbsorber (todo denso, para las pruebas) }
   * @returns {{ sigma2, frontera, nombres, cov, m2l, logLik, aic, bic, npar, n, p, iteraciones, convergio,
   *             b, u, pev(k), pevDif(k), varB, fijos, ajustados, media }}
   */
  function ajustar(mod, op) {
    op = op || {};
    const y = mod.y, n = y.length, p = mod.p, X = mod.X, A = mod.aleatorios, R = A.length;
    if (n - p < 1) throw new SP.ErrorSP(T('No quedan grados de libertad para el error: hay tantos efectos fijos como observaciones.'));
    const Xf = porFilas(X, n, p), xp = Xf.ptr, xc = Xf.col, xv = Xf.val;
    const qs = A.map(a => a.niveles.length), offs = [];
    let q = 0;
    for (const v of qs) { offs.push(p + q); q += v; }
    const d = p + q;
    /* el término absorbido (D, el de más niveles) y la parte densa A (el resto, en el orden original) */
    let rD = R ? qs.indexOf(max(...qs)) : -1, m = rD >= 0 ? qs[rD] : 0, oD = rD >= 0 ? offs[rD] : d;
    /* un factor fijo más grande, de indicadoras (a lo más un 1 por fila en sus columnas), también se absorbe (λ = 0) */
    const codFijo = mod.asignacion && !op.sinAbsorber ? factorFijoMayor(X, n, p, mod.asignacion, m) : null;
    if (codFijo) { rD = -1; m = codFijo.m; oD = codFijo.o0; }
    if (op.sinAbsorber) { rD = -1; m = 0; oD = d; }   // todo denso (para las pruebas)
    const nA = d - m;
    if (nA > LIMITE) throw new SP.ErrorSP(T('El modelo tiene {d} efectos fijos y aleatorios fuera del término mayor; el cálculo en el navegador admite hasta {l}.', { d: nA, l: LIMITE }),
      T('Usa el modelo lineal mixto del motor R para modelos más grandes.'));
    const aDe = j => (j < oD ? j : j - m), deA = a => (a < oD ? a : a + m);
    /* W'W por partes (A'A denso, D diagonal, B disperso) y W'y, con W = [X Z] */
    const AA = new Float64Array(nA * nA), Wy = new Float64Array(d), cntD = new Float64Array(m), Bmapa = Array.from({ length: m }, () => new Map());
    let yy = 0;
    const idx = new Int32Array(p + R), vv = new Float64Array(p + R);
    for (let i = 0; i < n; i++) {
      let c = 0;
      for (let t = xp[i]; t < xp[i + 1]; t++) { const j = xc[t]; if (codFijo && j >= oD && j < oD + m) continue; idx[c] = aDe(j); vv[c] = xv[t]; c++; }
      for (let r = 0; r < R; r++) { if (r === rD) continue; const k = A[r].codigos[i]; if (k >= 0) { idx[c] = aDe(offs[r] + k); vv[c] = 1; c++; } }
      const yi = y[i], dl = rD >= 0 ? A[rD].codigos[i] : codFijo ? codFijo.cod[i] : -1;
      for (let a = 0; a < c; a++) {
        const ia = idx[a], va = vv[a], fila = ia * nA;
        Wy[deA(ia)] += va * yi;
        for (let b = 0; b < c; b++) AA[fila + idx[b]] += va * vv[b];
        if (dl >= 0) { const mp = Bmapa[dl]; mp.set(ia, (mp.get(ia) || 0) + va); }
      }
      if (dl >= 0) { cntD[dl]++; Wy[oD + dl] += yi; }
      yy += yi * yi;
    }
    const Bi = Bmapa.map(mp => Int32Array.from(mp.keys())), Bv = Bmapa.map(mp => Float64Array.from(mp.values()));
    const Wpor = sol => {
      const out = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let t = xp[i]; t < xp[i + 1]; t++) s += xv[t] * sol[xc[t]];
        for (let r = 0; r < R; r++) { const k = A[r].codigos[i]; if (k >= 0) s += sol[offs[r] + k]; }
        out[i] = s;
      }
      return out;
    };
    const Wt = v => {
      const out = new Float64Array(d);
      for (let i = 0; i < n; i++) {
        const vi = v[i];
        if (vi === 0) continue;
        for (let t = xp[i]; t < xp[i + 1]; t++) out[xc[t]] += xv[t] * vi;
        for (let r = 0; r < R; r++) { const k = A[r].codigos[i]; if (k >= 0) out[offs[r] + k] += vi; }
      }
      return out;
    };

    /* varianza del modelo solo con efectos fijos: escala de los valores iniciales y de la cota inferior */
    const vy = normales(X, n, p, y, Xf).scr / (n - p);
    if (!(vy > 0)) throw new SP.ErrorSP(T('La respuesta no tiene variación que repartir entre componentes.'));
    const piso = 1e-9 * vy;
    const enFrontera = new Uint8Array(R);
    let th = op.inicio && op.inicio.length === R + 1 && op.inicio.every(v => v > 0) ? op.inicio.slice() : A.map(() => vy * 0.5 / max(1, R)).concat([vy * 0.5]);

    /** C·x = v (x y v en el orden original): xA = S⁻¹(vA − B·D⁻¹·vD), xD = D⁻¹(vD − B'·xA). */
    function resolverC(ev, v) {
      const rA = new Float64Array(nA);
      for (let a = 0; a < nA; a++) rA[a] = v[deA(a)];
      for (let i = 0; i < m; i++) { const f0 = v[oD + i] / ev.Dg[i], bi = Bi[i], bv = Bv[i]; for (let x = 0; x < bi.length; x++) rA[bi[x]] -= bv[x] * f0; }
      const xA = resolver(ev.L, nA, rA), out = new Float64Array(d);
      for (let a = 0; a < nA; a++) out[deA(a)] = xA[a];
      for (let i = 0; i < m; i++) { let t = v[oD + i]; const bi = Bi[i], bv = Bv[i]; for (let x = 0; x < bi.length; x++) t -= bv[x] * xA[bi[x]]; out[oD + i] = t / ev.Dg[i]; }
      return out;
    }
    const Sinv = ev => ev.Si || (ev.Si = inversa(ev.L, nA));
    /** Diagonal de C⁻¹ (orden original): S⁻¹ en A; D⁻¹ + D⁻¹B'S⁻¹BD⁻¹ en el término absorbido. */
    function diagInv(ev) {
      const Si = Sinv(ev), dg = new Float64Array(d);
      for (let a = 0; a < nA; a++) dg[deA(a)] = Si[a * nA + a];
      for (let i = 0; i < m; i++) {
        const bi = Bi[i], bv = Bv[i], k = bi.length, g = ev.Dg[i];
        let t = 0;
        for (let x = 0; x < k; x++) { const fila = bi[x] * nA; for (let z = 0; z < k; z++) t += bv[x] * Si[fila + bi[z]] * bv[z]; }
        dg[oD + i] = 1 / g + t / (g * g);
      }
      return dg;
    }
    /** Bloque [o0, o0 + k) de C⁻¹ (un término completo o los fijos, aunque abarque parte del bloque absorbido), k × k por filas:
        C⁻¹_AA = S⁻¹, C⁻¹_AD = −S⁻¹BD⁻¹, C⁻¹_DD = D⁻¹ + D⁻¹B'S⁻¹BD⁻¹. */
    function bloqueInv(ev, o0, k) {
      const Si = Sinv(ev), M = new Float64Array(k * k), enD = j => j >= oD && j < oD + m;
      const Tm = Array.from({ length: k }, (_, x) => {   // S⁻¹·bᵢ de los índices que caen en el bloque absorbido
        const j = o0 + x;
        if (!enD(j)) return null;
        const bi = Bi[j - oD], bv = Bv[j - oD], t = new Float64Array(nA);
        for (let z = 0; z < bi.length; z++) { const c = bi[z] * nA, v = bv[z]; for (let a = 0; a < nA; a++) t[a] += v * Si[c + a]; }
        return t;
      });
      for (let x = 0; x < k; x++) for (let z = x; z < k; z++) {
        const jx = o0 + x, jz = o0 + z;
        let v;
        if (!Tm[x] && !Tm[z]) v = Si[aDe(jx) * nA + aDe(jz)];
        else if (Tm[x] && Tm[z]) {
          const ix = jx - oD, iz = jz - oD, bz = Bi[iz], vz = Bv[iz];
          let t = 0;
          for (let w = 0; w < bz.length; w++) t += Tm[x][bz[w]] * vz[w];
          v = t / (ev.Dg[ix] * ev.Dg[iz]) + (ix === iz ? 1 / ev.Dg[ix] : 0);
        } else {
          const xd = Tm[x] ? x : z, xa = Tm[x] ? z : x;
          v = -Tm[xd][aDe(o0 + xa)] / ev.Dg[o0 + xd - oD];
        }
        M[x * k + z] = v; M[z * k + x] = v;
      }
      return M;
    }
    function evaluar(theta) {
      const s2e = theta[R], S = Float64Array.from(AA), Dg = new Float64Array(m);
      for (let r = 0; r < R; r++) {
        if (r === rD) continue;
        const lam = s2e / theta[r], o0 = aDe(offs[r]);
        for (let l = 0; l < qs[r]; l++) S[(o0 + l) * nA + o0 + l] += lam;
      }
      let logdet = 0;
      if (m) {
        const lam = rD >= 0 ? s2e / theta[rD] : 0;
        for (let i = 0; i < m; i++) {
          const g = cntD[i] + lam, bi = Bi[i], bv = Bv[i], k = bi.length;
          Dg[i] = g; logdet += log(g);
          for (let x = 0; x < k; x++) { const fx = bv[x] / g, fila = bi[x] * nA; for (let z = 0; z < k; z++) S[fila + bi[z]] -= fx * bv[z]; }
        }
      }
      const L = chol(S, nA);
      if (!L) return null;
      for (let j = 0; j < nA; j++) logdet += 2 * log(L[j * nA + j]);
      const ev0 = { L, Dg, Si: null }, sol = resolverC(ev0, Wy);
      let sw = 0;
      for (let j = 0; j < d; j++) sw += sol[j] * Wy[j];
      const yPy = max(0, yy - sw);   // σ²e · y'Py
      let m2l = (n - p - q) * log(s2e) + logdet + yPy / s2e;
      for (let r = 0; r < R; r++) m2l += qs[r] * log(theta[r]);
      return Object.assign(ev0, { theta: theta.slice(), sol, yPy, m2l });
    }
    /* tr(C^kk) de cada bloque aleatorio, de C⁻¹ en la escala de σ²e */
    function trazas(ev) {
      const dg = ev.dg || (ev.dg = diagInv(ev));
      return A.map((_, r) => { let s = 0; for (let l = 0; l < qs[r]; l++) s += dg[offs[r] + l]; return s; });
    }
    const uu = (r, sol) => { let s = 0; for (let l = 0; l < qs[r]; l++) { const v = sol[offs[r] + l]; s += v * v; } return s; };
    function pasoEM(ev) {
      const tr = trazas(ev), s2e = ev.theta[R], nt = ev.theta.slice();
      for (let r = 0; r < R; r++) if (!enFrontera[r]) nt[r] = max(piso, (uu(r, ev.sol) + s2e * tr[r]) / qs[r]);
      nt[R] = max(piso, ev.yPy / (n - p));
      return nt;
    }
    /* gradiente y matriz de información promedio de los parámetros libres */
    function informacion(ev) {
      const th0 = ev.theta, s2e = th0[R], tr = trazas(ev);
      const ajus = Wpor(ev.sol), e = new Float64Array(n);
      let ee = 0;
      for (let i = 0; i < n; i++) { e[i] = y[i] - ajus[i]; ee += e[i] * e[i]; }
      const libres = [];
      for (let r = 0; r < R; r++) if (!enFrontera[r]) libres.push(r);
      libres.push(R);
      const grad = libres.map(r => {
        if (r === R) { let s = (n - p - q) / s2e; for (let k = 0; k < R; k++) s += tr[k] / th0[k]; return -0.5 * (s - ee / (s2e * s2e)); }
        return -0.5 * (qs[r] / th0[r] - s2e * tr[r] / (th0[r] * th0[r]) - uu(r, ev.sol) / (th0[r] * th0[r]));
      });
      /* variables de trabajo: Zₖûₖ/σ²ₖ y ê/σ²e (= ∂V/∂θ · Py); AI = ½·w'Pw con P = (I − W C⁻¹ W')/σ²e */
      const w = libres.map(r => {
        if (r === R) return Float64Array.from(e, v => v / s2e);
        const x = new Float64Array(n);
        for (let i = 0; i < n; i++) { const k = A[r].codigos[i]; if (k >= 0) x[i] = ev.sol[offs[r] + k] / th0[r]; }
        return x;
      });
      const Ww = w.map(Wt), CWw = Ww.map(v => resolverC(ev, v)), F = libres.length;
      const AI = Array.from({ length: F }, () => new Array(F).fill(0));
      for (let a = 0; a < F; a++) for (let b = a; b < F; b++) {
        let s1 = 0, s2 = 0;
        for (let i = 0; i < n; i++) s1 += w[a][i] * w[b][i];
        for (let j = 0; j < d; j++) s2 += Ww[a][j] * CWw[b][j];
        AI[a][b] = AI[b][a] = 0.5 * (s1 - s2) / s2e;
      }
      return { libres, grad, AI };
    }

    let ev = evaluar(th);
    if (!ev) throw new SP.ErrorSP(T('Las ecuaciones del modelo mixto no tienen solución con estos datos.'));
    let it = 0, convergio = false;
    for (let k = 0; k < 3; k++) { const e2 = evaluar(pasoEM(ev)); if (!e2) break; ev = e2; it++; }
    const maxIter = op.maxIter || 300;
    for (let vuelta = 0; vuelta < 4; vuelta++) {
      convergio = false;
      let quietos = 0;
      for (; it < maxIter; it++) {
        const th0 = ev.theta, { libres, grad, AI } = informacion(ev), AIi = inversaChica(AI);
        let sig = null;
        if (AIi) {
          const delta = libres.map((_, a) => AIi[a].reduce((s, v, b) => s + v * grad[b], 0));
          for (let h = 0, t = 1; h < 14 && !sig; h++, t /= 2) {
            const nt = th0.slice();
            let neg = false;
            libres.forEach((r, a) => { nt[r] = th0[r] + t * delta[a]; if (!(nt[r] > piso)) neg = true; });
            if (neg) continue;
            const e2 = evaluar(nt);
            if (e2 && e2.m2l <= ev.m2l + 1e-12 * abs(ev.m2l)) sig = e2;
          }
          /* un componente que va hacia abajo de cero: a la frontera */
          if (!sig) {
            const nt = th0.slice();
            let fijo = false;
            libres.forEach((r, a) => { if (r < R && th0[r] + delta[a] <= piso) { nt[r] = piso; enFrontera[r] = 1; fijo = true; } });
            if (fijo) sig = evaluar(nt);
          }
        }
        if (!sig) sig = evaluar(pasoEM(ev));
        if (!sig) break;
        const cambio = max(...sig.theta.map((v, k) => abs(v - ev.theta[k]) / max(v, ev.theta[k], piso)));
        const dm2l = abs(sig.m2l - ev.m2l);
        ev = sig;
        /* convergencia: el cambio relativo de los componentes por debajo de 1e-10 dos veces seguidas (y el de −2ℓ, debajo de su
           ruido de redondeo: 1e-10 relativo) */
        quietos = cambio < 1e-10 && dm2l < 1e-10 * max(1, abs(sig.m2l)) ? quietos + 1 : 0;
        if (quietos >= 2) { convergio = true; it++; break; }
        /* componentes que la iteración sigue empujando a cero */
        for (let r = 0; r < R; r++) if (!enFrontera[r] && ev.theta[r] < 1e-8 * vy) { const t2 = ev.theta.slice(); t2[r] = piso; enFrontera[r] = 1; ev = evaluar(t2) || ev; quietos = 0; }
      }
      /* un componente en cero regresa si la verosimilitud mejora al crecer */
      let regreso = false;
      for (let r = 0; r < R; r++) {
        if (!enFrontera[r]) continue;
        const t2 = ev.theta.slice();
        t2[r] = 0.01 * vy;
        const e2 = evaluar(t2);
        if (e2 && e2.m2l < ev.m2l - 1e-8) { enFrontera[r] = 0; ev = e2; regreso = true; }
      }
      if (!regreso) break;
    }

    /* componentes en la frontera: el modelo sin ellos (exactamente en cero) */
    const quedan = A.map((_, r) => r).filter(r => !enFrontera[r]);
    if (quedan.length < R) {
      const sub = ajustar({ y, X, p, asignacion: mod.asignacion, aleatorios: quedan.map(r => A[r]) }, { inicio: quedan.map(r => ev.theta[r]).concat([ev.theta[R]]), maxIter, sinAbsorber: op.sinAbsorber });
      return expandir(sub, quedan, A, it);
    }
    ev = evaluar(ev.theta);
    const s2e = ev.theta[R];
    const fin = informacion(ev), AIi = inversaChica(fin.AI);
    const cov = Array.from({ length: R + 1 }, () => new Array(R + 1).fill(NaN));
    if (AIi) fin.libres.forEach((r, a) => fin.libres.forEach((s, b) => { cov[r][s] = AIi[a][b]; }));
    const b = Float64Array.from(ev.sol.subarray(0, p));
    const u = A.map((_, r) => Float64Array.from(ev.sol.subarray(offs[r], offs[r] + qs[r])));
    const fijos = new Float64Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let t = xp[i]; t < xp[i + 1]; t++) s += xv[t] * b[xc[t]]; fijos[i] = s; }
    const ajustados = Wpor(ev.sol);
    const bloque = (o0, k) => { const M = bloqueInv(ev, o0, k); for (let i = 0; i < M.length; i++) M[i] *= s2e; return M; };
    const npar = p + R + 1, m2l = ev.m2l + (n - p) * log(2 * PI);
    let media = 0;
    for (let i = 0; i < n; i++) media += fijos[i];
    return {
      sigma2: ev.theta.slice(), frontera: new Array(R).fill(false), nombres: A.map(a => a.nombre), cov,
      m2l, logLik: -0.5 * m2l, npar, aic: m2l + 2 * npar, bic: m2l + log(n) * npar, n, p, q,
      iteraciones: it, convergio, grad: fin.grad,
      b, u, fijos, ajustados, media: media / n,
      /** PEV de los efectos del término k: σ²e·C^kk (matriz qₖ × qₖ por filas) */
      pev: k => bloque(offs[k], qs[k]),
      /** varianza de los efectos fijos: σ²e·C^bb (p × p por filas) */
      varB: () => bloque(0, p),
    };
  }
  /** X (n × p por columnas) en forma dispersa por filas: los no ceros de la fila i son col/val[ptr[i] … ptr[i + 1]). */
  function porFilas(X, n, p) {
    let nnz = 0;
    for (let k = 0; k < n * p; k++) if (X[k] !== 0) nnz++;
    const ptr = new Int32Array(n + 1), col = new Int32Array(nnz), val = new Float64Array(nnz);
    for (let j = 0; j < p; j++) for (let i = 0; i < n; i++) if (X[i + j * n] !== 0) ptr[i + 1]++;
    for (let i = 0; i < n; i++) ptr[i + 1] += ptr[i];
    const pos = Int32Array.from(ptr.subarray(0, n));
    for (let j = 0; j < p; j++) for (let i = 0; i < n; i++) { const v = X[i + j * n]; if (v !== 0) { col[pos[i]] = j; val[pos[i]++] = v; } }
    return { ptr, col, val };
  }
  /**
   * Ecuaciones normales X'X y X'y armadas por filas (X por columnas, casi todo ceros en un diseño con factores) y su
   * Cholesky en el orden de las columnas, sin las que son combinación lineal de las anteriores (pivote menor que 1e-9 de
   * su diagonal; con factores la dependencia es exacta). Devuelve las columnas independientes y, con y, la suma de
   * cuadrados residual de mínimos cuadrados. Cuesta O(n·p + p³), sin la QR de n × p.
   */
  function normales(X, n, p, y, Xf) {
    const XX = new Float64Array(p * p), Xy = new Float64Array(p), { ptr, col, val } = Xf || porFilas(X, n, p);
    let yy = 0;
    for (let i = 0; i < n; i++) {
      for (let a = ptr[i]; a < ptr[i + 1]; a++) {
        const fa = col[a] * p, va = val[a];
        if (y) Xy[col[a]] += va * y[i];
        for (let b = ptr[i]; b < ptr[i + 1]; b++) XX[fa + col[b]] += va * val[b];
      }
      if (y) yy += y[i] * y[i];
    }
    const L = new Float64Array(p * p), columnas = [];
    for (let j = 0; j < p; j++) {
      const rj = j * p;
      for (let x = 0; x < columnas.length; x++) {
        const k = columnas[x], rk = k * p;
        let t = XX[rj + k];
        for (let z = 0; z < x; z++) { const l = columnas[z]; t -= L[rj + l] * L[rk + l]; }
        L[rj + k] = t / L[rk + k];
      }
      let t = XX[rj + j];
      for (const k of columnas) t -= L[rj + k] * L[rj + k];
      if (t > 0 && t > 1e-9 * XX[rj + j]) { L[rj + j] = sqrt(t); columnas.push(j); }
    }
    let scr = NaN;
    if (y) {
      /* z = L⁻¹X'y en las columnas independientes; SC residual = y'y − z'z */
      const z = new Float64Array(p);
      scr = yy;
      for (let x = 0; x < columnas.length; x++) {
        const j = columnas[x], rj = j * p;
        let t = Xy[j];
        for (let w = 0; w < x; w++) t -= L[rj + columnas[w]] * z[columnas[w]];
        z[j] = t / L[rj + j];
        scr -= z[j] * z[j];
      }
    }
    return { columnas, scr };
  }
  /**
   * El factor fijo con más columnas cuyas columnas son indicadoras con a lo más un 1 por fila (su bloque de X'X es
   * diagonal), si tiene más de «minimo» columnas: { o0, m, cod (columna de cada fila relativa a o0, −1 si ninguna) }.
   */
  function factorFijoMayor(X, n, p, asg, minimo) {
    let mejor = null;
    for (let j = 0; j < p;) {
      let k = j;
      while (k < p && asg[k] === asg[j]) k++;
      const m = k - j;
      if (asg[j] > 0 && m > minimo && (!mejor || m > mejor.m)) {
        const cod = new Int32Array(n).fill(-1);
        let ok = true;
        for (let i = 0; i < n && ok; i++) for (let c = j; c < k; c++) {
          const v = X[i + c * n];
          if (v === 0) continue;
          if (v !== 1 || cod[i] >= 0) { ok = false; break; }
          cod[i] = c - j;
        }
        if (ok) mejor = { o0: j, m, cod };
      }
      j = k;
    }
    return mejor;
  }
  /** Resultado del modelo sin los componentes en la frontera, con esos componentes en cero. */
  function expandir(sub, quedan, A, it) {
    const R = A.length, pos = new Array(R).fill(-1);
    quedan.forEach((r, k) => { pos[r] = k; });
    const Rs = quedan.length, map = r => (r === R ? Rs : pos[r]);
    const cov = Array.from({ length: R + 1 }, (_, i) => Array.from({ length: R + 1 }, (_, j) => (map(i) < 0 || map(j) < 0 ? NaN : sub.cov[map(i)][map(j)])));
    const sigma2 = A.map((_, r) => (pos[r] < 0 ? 0 : sub.sigma2[pos[r]])).concat([sub.sigma2[Rs]]);
    const npar = sub.p + R + 1, m2l = sub.m2l, n = sub.n;
    return Object.assign({}, sub, {
      sigma2, frontera: A.map((_, r) => pos[r] < 0), nombres: A.map(a => a.nombre), cov, npar, aic: m2l + 2 * npar, bic: m2l + log(n) * npar,
      iteraciones: it + sub.iteraciones,
      u: A.map((a, r) => (pos[r] < 0 ? new Float64Array(a.niveles.length) : sub.u[pos[r]])),
      pev: k => (pos[k] < 0 ? new Float64Array(A[k].niveles.length ** 2) : sub.pev(pos[k])),
    });
  }

  /* ---------------- armar el modelo desde una tabla ---------------- */
  const qf = v => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(v) ? v : '`' + v + '`');
  /**
   * Modelo desde una tabla: la parte fija como fórmula (sus factores ya como factores) y los términos aleatorios como
   * listas de factores (un término de varios factores es su combinación, como (1 | a:b) en lme4).
   * Solo entran las filas con todo completo. Las columnas de X que son combinación de otras se quitan (como lme4).
   * @param {object} tabla  SP.tabla
   * @param {string} y  respuesta
   * @param {string[][]} fijos  términos fijos (cada uno, lista de factores; [] = solo intercepto)
   * @param {string[][]} aleatorios  términos aleatorios
   */
  function modeloDe(tabla, y, fijos, aleatorios) {
    const facs = [...new Set(fijos.flat().concat(aleatorios.flat()))];
    const cols = {}, nombres = [y].concat(facs);
    cols[y] = tabla.col(y);
    if (cols[y].tipo !== 'numerica') throw new SP.ErrorSP(T('La respuesta debe ser numérica.'));
    for (const f of facs) cols[f] = SP.estructura.comoFactor(tabla, f);
    const t = { n: tabla.n, nombres, columnas: cols, col(nom) { const c = cols[nom]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: nom })); return c; } };
    const filas = [];
    const yv = cols[y].valores;
    for (let i = 0; i < tabla.n; i++) {
      if (yv[i] !== yv[i]) continue;
      let ok = true;
      for (const f of facs) if (cols[f].codigos[i] < 0) { ok = false; break; }
      if (ok) filas.push(i);
    }
    if (filas.length < 3) throw new SP.ErrorSP(T('Quedan muy pocas filas completas para el modelo.'));
    const derecha = fijos.length ? fijos.map(tm => tm.map(qf).join(':')).join(' + ') : '1';
    const mm = SP.formula.matrizModelo(t, qf(y) + ' ~ ' + derecha, { filas: Int32Array.from(filas) });
    /* columnas de rango completo: en orden, fuera las que son combinación de las anteriores (como R) */
    const keep = normales(mm.X, mm.n, mm.p).columnas;
    const n = mm.n, X = new Float64Array(n * keep.length);
    keep.forEach((j, k) => X.set(mm.X.subarray(j * n, (j + 1) * n), k * n));
    const ale = aleatorios.map(tm => terminoAleatorio(cols, tm, mm.filas));
    return { y: mm.y, X, p: keep.length, aleatorios: ale, filas: mm.filas, n, columnas: keep.map(j => mm.columnas[j]), asignacion: keep.map(j => mm.asignacion[j]),
      terminos: mm.terminos.map(tm => tm.variables.slice()), quitadas: mm.p - keep.length, formula: derecha, tabla: t };
  }
  /** Códigos de un término aleatorio (factor o combinación de factores) en las filas dadas; niveles en orden lexicográfico. */
  function terminoAleatorio(cols, tm, filas) {
    const cs = tm.map(f => cols[f]), n = filas.length, claves = new Map(), tupla = [];
    const cod = new Int32Array(n);
    for (let r = 0; r < n; r++) {
      const i = filas[r], partes = cs.map(c => c.codigos[i]), k = partes.join('|');
      let v = claves.get(k);
      if (v === undefined) { v = tupla.length; claves.set(k, v); tupla.push(partes); }
      cod[r] = v;
    }
    const orden = tupla.map((_, k) => k).sort((a, b) => { for (let j = 0; j < cs.length; j++) { const x = tupla[a][j] - tupla[b][j]; if (x) return x; } return 0; });
    const nuevo = new Int32Array(tupla.length);
    orden.forEach((k, pos) => { nuevo[k] = pos; });
    for (let r = 0; r < n; r++) cod[r] = nuevo[cod[r]];
    return { nombre: tm.join(':'), factores: tm.slice(), codigos: cod, niveles: orden.map(k => tupla[k].map((c, j) => cs[j].niveles[c]).join(':')) };
  }

  /* ---------------- utilidades ---------------- */
  /** Media de la varianza de las diferencias entre pares de efectos: 2·(g·tr M − ΣM) / (g(g − 1)), M de g × g por filas. */
  function mediaDifPares(M, g) {
    let tr = 0, s = 0;
    for (let i = 0; i < g; i++) { tr += M[i * g + i]; for (let j = 0; j < g; j++) s += M[i * g + j]; }
    return 2 * (g * tr - s) / (g * (g - 1));
  }
  /** p de la razón de verosimilitudes de un componente (frontera): ½·P(χ²₁ ≥ x), 1 si x = 0 (Self y Liang 1987). */
  const pFrontera = x => (x > 0 ? 0.5 * SP.dist.pchisq(x, 1, false) : 1);
  const armonica = v => v.length / v.reduce((s, x) => s + 1 / x, 0);

  SP.reml = { ajustar, modeloDe, terminoAleatorio, mediaDifPares, pFrontera, armonica, LIMITE, _alg: { chol, resolver, inversa, inversaChica, normales } };
});
