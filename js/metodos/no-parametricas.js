/* SigmaPro — pruebas no paramétricas, comparaciones múltiples por rangos y letras de agrupación.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Funciones (SP.np), con el mismo cálculo que R:
     signoRango(x, y, op)        wilcox.test(x, mu) o wilcox.test(x, y, paired = TRUE): exacta sin empates ni
                                 ceros (n < 50), si no normal con corrección por continuidad; IC y estimador de
                                 Hodges-Lehmann (promedios de Walsh, o la raíz de la normal con uniroot y tol 1e-4)
     sumaRangos(x, y, op)        wilcox.test(x, y): W = U de Mann-Whitney; mismas reglas, diferencias x − y
     kruskal(y, g)               kruskal.test, más η²[H] = (H − k + 1)/(n − k) (Tomczak y Tomczak, 2014)
     paresKruskal(y, g, op)      Dunn, Conover-Iman y Nemenyi como kwAllPairs*Test de PMCMRplus
     friedman(y, trat, bloque)   friedman.test, más la W de Kendall = χ²/(n(k − 1))
     paresFriedman(…, op)        Conover y Nemenyi como frdAllPairs*Test de PMCMRplus, o Wilcoxon pareada ajustada
                                 (pairwise.wilcox.test(paired = TRUE))
     ajustarP(p, metodo)         p.adjust: holm, bonferroni, BH (o ninguno)
     letras(niveles, sig)        multcompLetters de multcompView (inserción y absorción, Piepho 2004)
   Métodos registrados: 'wilcoxon', 'kruskal-wallis', 'friedman'. */
SP.definir('no-parametricas', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, max, min, SQRT2 } = Math;
  const D = () => SP.dist;
  Object.assign(SP.nombresFunciones, {
    'np.signoRango': 'Wilcoxon de rangos con signo (una muestra o pareada) con IC de Hodges-Lehmann',
    'np.sumaRangos': 'Wilcoxon-Mann-Whitney de suma de rangos con IC de Hodges-Lehmann',
    'np.kruskal': 'Kruskal-Wallis y η² de H', 'np.paresKruskal': 'Comparaciones tras Kruskal-Wallis (Dunn, Conover-Iman, Nemenyi)',
    'np.friedman': 'Friedman y W de Kendall', 'np.paresFriedman': 'Comparaciones tras Friedman (Conover, Nemenyi, Wilcoxon pareada)',
    'np.ajustarP': 'Ajuste de valores p (Holm, Bonferroni, Benjamini-Hochberg)', 'np.letras': 'Letras de agrupación (inserción y absorción)',
  });
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sin = x => SP.num.sinFaltantes(x);
  const rangos = v => SP.sup.rangos(v);
  const mediana = v => SP.desc.mediana(v);
  const signif2 = v => Number(v.toPrecision(2));
  const menor = v => { let m = Infinity; for (const x of v) if (x < m) m = x; return m; };
  const mayor = v => { let m = -Infinity; for (const x of v) if (x > m) m = x; return m; };

  /** Σ(t³ − t) de los valores repetidos (la corrección por empates). */
  function empates(v) {
    const s = Float64Array.from(v).sort();
    let tot = 0;
    for (let i = 0; i < s.length;) {
      let j = i + 1;
      while (j < s.length && s[j] === s[i]) j++;
      const t = j - i;
      if (t > 1) tot += t * t * t - t;
      i = j;
    }
    return tot;
  }
  const correccionDe = (alt, z, usar) => (!usar ? 0 : alt === 'bilateral' ? Math.sign(z) * 0.5 : alt === 'mayor' ? 0.5 : -0.5);
  function pNormal(z, alt) {
    if (alt === 'menor') return D().pnorm(z, 0, 1, true);
    if (alt === 'mayor') return D().pnorm(z, 0, 1, false);
    return 2 * min(D().pnorm(z, 0, 1, true), D().pnorm(z, 0, 1, false));
  }
  const qnormSup = p => D().qnorm(p, 0, 1, false);
  const OPW = { mu: 0, alternativa: 'bilateral', nivel: 0.95, exacta: null, correccion: true, ic: true };
  const exactaPedida = (op, porOmision) => (op.exacta === null || op.exacta === undefined || op.exacta === 'auto' ? porOmision : op.exacta === true || op.exacta === 'si');

  /* ======================= Wilcoxon de rangos con signo ======================= */
  function signoRango(xs, ys, op) {
    op = Object.assign({}, OPW, op || {});
    let x;
    if (ys) { x = []; for (let i = 0; i < xs.length; i++) if (!Number.isNaN(xs[i]) && !Number.isNaN(ys[i])) x.push(xs[i] - ys[i]); }
    else x = Array.from(sin(xs));
    exigir(x.length >= 1, T('No hay observaciones completas.'));
    const mu = op.mu, alt = op.alternativa;
    let xm = x.map(v => v - mu);
    const total = xm.length;
    xm = xm.filter(v => v !== 0);
    const ceros = total - xm.length, n = xm.length;
    exigir(n >= 1, T('Todas las diferencias son cero: no hay nada que probar.'));
    const exacta = exactaPedida(op, n < 50);
    const r = rangos(xm.map(abs));
    let V = 0;
    for (let i = 0; i < n; i++) if (xm[i] > 0) V += r[i];
    const te = empates(r);
    const out = { estadistico: V, n, ceros, empates: te > 0, nivel: op.nivel };
    const M = n * (n + 1) / 2;
    if (exacta && te === 0 && ceros === 0) {
      out.exacta = true; out.correccion = false;
      const P = D().psignrank;
      out.p = alt === 'mayor' ? P(V - 1, n, false) : alt === 'menor' ? P(V, n) : min(2 * (V > n * (n + 1) / 4 ? P(V - 1, n, false) : P(V, n)), 1);
      if (op.ic) {
        const xx = xm.map(v => v + mu), alfa = 1 - op.nivel, w = [];
        for (let i = 0; i < n; i++) for (let j = i; j < n; j++) w.push(xx[i] + xx[j]);
        const dif = Float64Array.from(w).sort().map(v => v / 2);
        let qu, logrado;
        if (alt === 'bilateral') {
          qu = D().qsignrank(alfa / 2, n); if (qu === 0) qu = 1;
          logrado = 2 * P(qu - 1, n);
          out.ic = [dif[qu - 1], dif[M - qu]];
        } else {
          qu = D().qsignrank(alfa, n); if (qu === 0) qu = 1;
          logrado = P(qu - 1, n);
          out.ic = alt === 'mayor' ? [dif[qu - 1], Infinity] : [-Infinity, dif[M - qu]];
        }
        out.nivelLogrado = logrado - alfa > alfa / 2 ? 1 - signif2(logrado) : op.nivel;
        out.estimado = mediana(dif);
      }
    } else {
      out.exacta = false; out.correccion = !!op.correccion;
      const z0 = V - n * (n + 1) / 4;
      const sigma = sqrt(n * (n + 1) * (2 * n + 1) / 24 - te / 48);
      out.z = (z0 - correccionDe(alt, z0, op.correccion)) / sigma;
      out.p = pNormal(out.z, alt);
      if (op.ic) Object.assign(out, icSignoNormal(xm.map(v => v + mu), op));
    }
    return out;
  }
  /** IC y estimador de Hodges-Lehmann por la aproximación normal, paso a paso como wilcox.test. */
  function icSignoNormal(xx, op) {
    const alt = op.alternativa, nivel = op.nivel;
    let alfa = 1 - nivel, corregir = !!op.correccion;
    const mumin = menor(xx), mumax = mayor(xx);
    const W = d => {
      const xd = xx.map(v => v - d).filter(v => v !== 0), nx = xd.length;
      const dr = rangos(xd.map(abs));
      let zd = -nx * (nx + 1) / 4;
      for (let i = 0; i < nx; i++) if (xd[i] > 0) zd += dr[i];
      const s = sqrt(nx * (nx + 1) * (2 * nx + 1) / 24 - empates(dr) / 48);
      return (zd - correccionDe(alt, zd, corregir)) / s;
    };
    const wmin = W(mumin), wmax = Number.isFinite(wmin) ? W(mumax) : NaN;
    if (!Number.isFinite(wmax)) return { ic: [alt === 'menor' ? -Infinity : NaN, alt === 'mayor' ? Infinity : NaN], nivelLogrado: 0, estimado: (mumin + mumax) / 2 };
    const raiz = zq => SP.num.raizR(d => W(d) - zq, mumin, mumax, wmin - zq, wmax - zq, 1e-4);
    let logrado = nivel, ic;
    const ajustar = () => { if (alfa >= 1 || 1 - nivel < alfa * 0.75) logrado = 1 - min(1, alfa); };
    if (alt === 'bilateral') {
      for (let k = 0; k < 60 && (wmin - qnormSup(alfa / 2) < 0 || wmax - D().qnorm(alfa / 2) > 0); k++) alfa *= 2;
      ajustar();
      ic = alfa < 1 ? [raiz(qnormSup(alfa / 2)), raiz(D().qnorm(alfa / 2))] : [mediana(xx), mediana(xx)];
    } else if (alt === 'mayor') {
      for (let k = 0; k < 60 && wmin - qnormSup(alfa) < 0; k++) alfa *= 2;
      ajustar();
      ic = [alfa < 1 ? raiz(qnormSup(alfa)) : mediana(xx), Infinity];
    } else {
      /* como R: el ciclo de la cola inferior compara con qnorm(α/2) aunque la raíz use qnorm(α) */
      for (let k = 0; k < 60 && wmax - D().qnorm(alfa / 2) > 0; k++) alfa *= 2;
      ajustar();
      ic = [-Infinity, alfa < 1 ? raiz(D().qnorm(alfa)) : mediana(xx)];
    }
    corregir = false;
    const estimado = SP.num.raizR(W, mumin, mumax, W(mumin), W(mumax), 1e-4);
    return { ic, nivelLogrado: logrado, estimado };
  }

  /* ======================= suma de rangos (Mann-Whitney) ======================= */
  function sumaRangos(xs, ys, op) {
    op = Object.assign({}, OPW, op || {});
    const x = Array.from(sin(xs)), y = Array.from(sin(ys)), nx = x.length, ny = y.length;
    exigir(nx >= 1 && ny >= 1, T('Cada grupo necesita al menos una observación.'));
    const mu = op.mu, alt = op.alternativa;
    const r = rangos(x.map(v => v - mu).concat(y));
    let W = -nx * (nx + 1) / 2;
    for (let i = 0; i < nx; i++) W += r[i];
    const te = empates(r);
    const exacta = exactaPedida(op, nx < 50 && ny < 50);
    const out = { estadistico: W, n: [nx, ny], empates: te > 0, nivel: op.nivel };
    if (exacta && te === 0) {
      out.exacta = true; out.correccion = false;
      const P = D().pwilcox;
      out.p = alt === 'mayor' ? P(W - 1, nx, ny, false) : alt === 'menor' ? P(W, nx, ny) : min(2 * (W > nx * ny / 2 ? P(W - 1, nx, ny, false) : P(W, nx, ny)), 1);
      if (op.ic) {
        const alfa = 1 - op.nivel, d = [];
        for (const a of x) for (const b of y) d.push(a - b);
        const dif = Float64Array.from(d).sort();
        let qu, logrado;
        if (alt === 'bilateral') {
          qu = D().qwilcox(alfa / 2, nx, ny); if (qu === 0) qu = 1;
          logrado = 2 * P(qu - 1, nx, ny);
          out.ic = [dif[qu - 1], dif[nx * ny - qu]];
        } else {
          qu = D().qwilcox(alfa, nx, ny); if (qu === 0) qu = 1;
          logrado = P(qu - 1, nx, ny);
          out.ic = alt === 'mayor' ? [dif[qu - 1], Infinity] : [-Infinity, dif[nx * ny - qu]];
        }
        out.nivelLogrado = logrado - alfa > alfa / 2 ? 1 - logrado : op.nivel;
        out.estimado = mediana(dif);
      }
    } else {
      out.exacta = false; out.correccion = !!op.correccion;
      const z0 = W - nx * ny / 2, N = nx + ny;
      const sigma = sqrt((nx * ny / 12) * ((N + 1) - te / (N * (N - 1))));
      out.z = (z0 - correccionDe(alt, z0, op.correccion)) / sigma;
      out.p = pNormal(out.z, alt);
      if (op.ic) {
        const alfa = 1 - op.nivel;
        let corregir = !!op.correccion;
        const mumin = menor(x) - mayor(y), mumax = mayor(x) - menor(y);
        const Wd = d => {
          const dr = rangos(x.map(v => v - d).concat(y));
          let dz = -nx * (nx + 1) / 2 - nx * ny / 2;
          for (let i = 0; i < nx; i++) dz += dr[i];
          const s = sqrt((nx * ny / 12) * ((N + 1) - empates(dr) / (N * (N - 1))));
          return (dz - correccionDe(alt, dz, corregir)) / s;
        };
        const wmin = Wd(mumin), wmax = Wd(mumax);
        const raiz = zq => {
          const fl = wmin - zq; if (fl <= 0) return mumin;
          const fu = wmax - zq; if (fu >= 0) return mumax;
          return SP.num.raizR(d => Wd(d) - zq, mumin, mumax, fl, fu, 1e-4);
        };
        out.ic = alt === 'bilateral' ? [raiz(qnormSup(alfa / 2)), raiz(D().qnorm(alfa / 2))]
          : alt === 'mayor' ? [raiz(qnormSup(alfa)), Infinity] : [-Infinity, raiz(D().qnorm(alfa))];
        out.nivelLogrado = op.nivel;
        corregir = false;
        out.estimado = SP.num.raizR(Wd, mumin, mumax, Wd(mumin), Wd(mumax), 1e-4);
      }
    }
    return out;
  }

  /* ======================= ajuste de valores p (p.adjust) ======================= */
  const AJUSTES = ['holm', 'bonferroni', 'BH', 'ninguno'];
  function ajustarP(ps, metodo) {
    const out = Array.from(ps), idx = [];
    for (let i = 0; i < out.length; i++) if (!Number.isNaN(out[i]) && out[i] !== null) idx.push(i);
    const p = idx.map(i => out[i]), n = p.length;
    if (n <= 1 || metodo === 'ninguno' || metodo === 'none') return out;
    let adj;
    if (metodo === 'bonferroni') adj = p.map(v => min(1, n * v));
    else if (metodo === 'holm') {
      const o = p.map((v, i) => i).sort((a, b) => p[a] - p[b] || a - b);
      adj = new Array(n); let cm = -Infinity;
      o.forEach((k, i) => { cm = max(cm, (n - i) * p[k]); adj[k] = min(1, cm); });
    } else if (metodo === 'BH') {
      const o = p.map((v, i) => i).sort((a, b) => p[b] - p[a] || a - b);
      adj = new Array(n); let cm = Infinity;
      o.forEach((k, j) => { cm = min(cm, n / (n - j) * p[k]); adj[k] = min(1, cm); });
    } else throw new SP.ErrorSP(T('Ajuste desconocido: {m}.', { m: metodo }));
    idx.forEach((i, j) => { out[i] = adj[j]; });
    return out;
  }

  /* ======================= letras de agrupación (multcompLetters) ======================= */
  const LETRAS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'.split('');
  function absorber(A) {
    for (;;) {
      let cambio = false;
      busca: for (let i = 0; i < A.length - 1; i++) for (let j = i + 1; j < A.length; j++) {
        if (A[j].every((v, f) => !v || A[i][f])) { A = A.filter((_, c) => c !== j); cambio = true; break busca; }
        if (A[i].every((v, f) => !v || A[j][f])) { A = A.filter((_, c) => c !== i); cambio = true; break busca; }
      }
      if (!cambio) return A;
    }
  }
  function ordenarColumnas(B) {
    const primera = c => { const k = c.indexOf(true); return k < 0 ? Infinity : k; };
    B = B.map((c, i) => [primera(c), i]).sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] < b[0] ? -1 : 1)).map(([, i]) => B[i].slice());
    const fr = B.map(primera);
    for (let i = 0; i < B.length - 1; i++) {
      if (!(Number.isFinite(fr[i]) && fr[i] === fr[i + 1])) continue;
      const desde = fr[i] + 1;
      const sub = ordenarColumnas([B[i].slice(desde), B[i + 1].slice(desde)]);
      B[i] = B[i].slice(0, desde).concat(sub[0]);
      B[i + 1] = B[i + 1].slice(0, desde).concat(sub[1]);
    }
    return B;
  }
  function nombresLetras(k, base) {
    const kL = base.length;
    if (k < kL) return base.slice(0, k);
    const sigue = base.slice(0, kL - 1).map(l => base[kL - 1] + l).concat([base[kL - 1]]);
    return base.slice(0, kL - 1).concat(nombresLetras(k - kL + 1, sigue));
  }
  /**
   * Letras para niveles en el orden dado; sig[i] dice si el par i difiere, con los pares en el orden de
   * lower.tri de R: (1, 2), (1, 3), …, (1, n), (2, 3), …
   */
  function letras(niveles, sig) {
    const n = niveles.length;
    if (!sig.some(Boolean)) return niveles.map(() => LETRAS[0]);
    let L = [new Array(n).fill(true)], idx = 0;
    for (let j = 0; j < n - 1; j++) for (let i = j + 1; i < n; i++) {
      if (!sig[idx++]) continue;
      const comun = L.map(c => c[j] && c[i]);
      if (!comun.some(Boolean)) continue;
      const nuevas = L.filter((_, c) => comun[c]).map(c => { const cc = c.slice(); cc[j] = false; return cc; });
      L.forEach((c, k) => { if (comun[k]) c[i] = false; });
      L = absorber(L.concat(nuevas));
    }
    L = ordenarColumnas(L);
    const nom = nombresLetras(L.length, LETRAS);
    return niveles.map((_, f) => L.map((c, k) => (c[f] ? nom[k] : '')).join(''));
  }
  /** Letras con los niveles ordenados de mayor a menor «valor» (la «a» al más alto), devueltas en el orden original. */
  function letrasPorOrden(valores, pares, alfa) {
    const k = valores.length;
    const orden = valores.map((v, i) => i).sort((a, b) => (valores[b] - valores[a]) || a - b);
    const pos = new Map(), sig = [];
    for (const p of pares) pos.set(p.a + ',' + p.b, p.p_ajustado);
    for (let j = 0; j < k - 1; j++) for (let i = j + 1; i < k; i++) {
      const a = orden[j], b = orden[i];
      const p = pos.has(a + ',' + b) ? pos.get(a + ',' + b) : pos.get(b + ',' + a);
      sig.push(p < alfa);
    }
    const l = letras(orden, sig), out = new Array(k);
    orden.forEach((g, j) => { out[g] = l[j]; });
    return out;
  }

  /* ======================= Kruskal-Wallis ======================= */
  /** Respuesta y grupo sin faltantes; los niveles sin datos se quitan (como factor() en R). */
  function porNivel(ys, f) {
    const cuenta = new Array(f.niveles.length).fill(0);
    for (let i = 0; i < ys.length; i++) if (f.codigos[i] >= 0 && !Number.isNaN(ys[i])) cuenta[f.codigos[i]]++;
    const nuevo = cuenta.map(() => -1), niveles = [];
    cuenta.forEach((c, j) => { if (c > 0) { nuevo[j] = niveles.length; niveles.push(f.niveles[j]); } });
    const y = [], g = [];
    for (let i = 0; i < ys.length; i++) if (f.codigos[i] >= 0 && !Number.isNaN(ys[i])) { y.push(ys[i]); g.push(nuevo[f.codigos[i]]); }
    return { y: Float64Array.from(y), g: Int32Array.from(g), niveles, k: niveles.length, n: y.length };
  }
  function resumenRangos(d) {
    const r = rangos(d.y), suma = new Float64Array(d.k), cuenta = new Float64Array(d.k), vals = Array.from({ length: d.k }, () => []);
    for (let i = 0; i < d.n; i++) { suma[d.g[i]] += r[i]; cuenta[d.g[i]]++; vals[d.g[i]].push(d.y[i]); }
    return { r, suma, cuenta, vals, media: Array.from(suma, (s, j) => s / cuenta[j]) };
  }
  function kruskal(ys, f) {
    const d = porNivel(ys, f);
    exigir(d.k >= 2, T('Hacen falta al menos dos grupos con datos.'));
    exigir(d.n >= 3, T('Hay muy pocas observaciones.'));
    const R = resumenRangos(d), n = d.n, te = empates(d.y);
    exigir(te < n * n * n - n, T('Todos los valores son iguales: no hay nada que comparar.'));
    let S = 0;
    for (let j = 0; j < d.k; j++) S += R.suma[j] * R.suma[j] / R.cuenta[j];
    const H = (12 * S / (n * (n + 1)) - 3 * (n + 1)) / (1 - te / (n * n * n - n));
    const gl = d.k - 1;
    return {
      H, gl, p: D().pchisq(H, gl, false), eta2: (H - d.k + 1) / (n - d.k), n, k: d.k, empates: te > 0,
      grupos: d.niveles.map((nombre, j) => {
        const c = SP.desc.cuantil(R.vals[j], [0.25, 0.75]);
        return { nombre, n: R.cuenta[j], mediana: mediana(R.vals[j]), q1: c[0], q3: c[1], sumaRangos: R.suma[j], rangoMedio: R.media[j] };
      }),
    };
  }
  function paresKruskal(ys, f, op) {
    op = Object.assign({ metodo: 'dunn', ajuste: 'holm' }, op || {});
    const d = porNivel(ys, f), k = d.k, n = d.n;
    exigir(k >= 2, T('Hacen falta al menos dos grupos con datos.'));
    const R = resumenRangos(d), te = empates(d.y), pares = [];
    let gl = null, est;
    if (op.metodo === 'dunn') {
      est = 'z';
      const C = te / (12 * (n - 1)), A = n * (n + 1) / 12;
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const dif = R.media[a] - R.media[b], z = dif / sqrt((A - C) * (1 / R.cuenta[a] + 1 / R.cuenta[b]));
        pares.push({ a, b, dif, estadistico: z, p: 2 * D().pnorm(abs(z), 0, 1, false) });
      }
    } else if (op.metodo === 'conover') {
      est = 't'; gl = n - k;
      let S = 0, r2 = 0;
      for (let j = 0; j < k; j++) S += R.suma[j] * R.suma[j] / R.cuenta[j];
      for (let i = 0; i < n; i++) r2 += R.r[i] * R.r[i];
      const H0 = (12 / (n * (n + 1))) * S - 3 * (n + 1), C = min(1, 1 - te / (n * n * n - n));
      const S2 = C === 1 ? n * (n + 1) / 12 : (r2 - n * (n + 1) * (n + 1) / 4) / (n - 1);
      const Dd = (n - 1 - H0 / C) / (n - k);
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const dif = R.media[a] - R.media[b], t = dif / sqrt(S2 * (1 / R.cuenta[a] + 1 / R.cuenta[b]) * Dd);
        pares.push({ a, b, dif, estadistico: t, p: 2 * D().pt(abs(t), gl, false), p_tukey: D().ptukey(SQRT2 * abs(t), k, gl, false) });
      }
    } else if (op.metodo === 'nemenyi') {
      est = 'q';
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const dif = R.media[a] - R.media[b], q = abs(dif) / sqrt((n * (n + 1) / 12) * (1 / R.cuenta[a] + 1 / R.cuenta[b])) * SQRT2;
        const p = 1 - D().ptukey(q, k, Infinity);
        pares.push({ a, b, dif, estadistico: q, p, p_ajustado: p });
      }
    } else throw new SP.ErrorSP(T('Comparación desconocida: {m}.', { m: op.metodo }));
    cerrarPares(pares, op);
    return { metodo: op.metodo, ajuste: op.metodo === 'nemenyi' ? 'tukey' : op.ajuste, estadistico: est, gl, niveles: d.niveles, pares, empates: te > 0 };
  }
  /** p ajustado: Tukey de un paso (Conover y Nemenyi) o p.adjust. */
  function cerrarPares(pares, op) {
    if (op.metodo === 'nemenyi') return;
    if (op.ajuste === 'tukey') {
      exigir(op.metodo === 'conover', T('El ajuste de Tukey solo aplica a la prueba de Conover.'));
      for (const x of pares) x.p_ajustado = x.p_tukey;
    } else {
      exigir(AJUSTES.includes(op.ajuste), T('Ajuste desconocido: {m}.', { m: op.ajuste }));
      const adj = ajustarP(pares.map(x => x.p), op.ajuste);
      pares.forEach((x, i) => { x.p_ajustado = adj[i]; });
    }
    for (const x of pares) delete x.p_tukey;
  }

  /* ======================= Friedman ======================= */
  /** Matriz bloques × tratamientos de un diseño de bloques completos sin repetición; los bloques incompletos se quitan. */
  function matrizBloques(ys, trat, bloque) {
    const nf = ys.length;
    for (let i = 0; i < nf; i++) exigir(trat.codigos[i] >= 0 && bloque.codigos[i] >= 0, T('Hay filas sin tratamiento o sin bloque.'), T('Completa esas celdas o filtra esas filas en Datos.'));
    const usadosT = new Set(trat.codigos), usadosB = new Set(bloque.codigos);
    const tj = trat.niveles.map((_, j) => j).filter(j => usadosT.has(j)), bj = bloque.niveles.map((_, j) => j).filter(j => usadosB.has(j));
    const posT = new Map(tj.map((j, c) => [j, c])), posB = new Map(bj.map((j, c) => [j, c]));
    const k = tj.length, M = bj.map(() => new Array(k).fill(undefined));
    for (let i = 0; i < nf; i++) {
      const fila = M[posB.get(bloque.codigos[i])], c = posT.get(trat.codigos[i]);
      exigir(fila[c] === undefined, T('Friedman necesita exactamente un dato por tratamiento en cada bloque, y hay repeticiones.'), T('Promedia las repeticiones de cada tratamiento en cada bloque (Datos → Reformar) y vuelve a intentarlo.'));
      fila[c] = ys[i];
    }
    exigir(M.every(f => f.every(v => v !== undefined)), T('Friedman necesita los mismos tratamientos en todos los bloques, y faltan combinaciones.'), T('Revisa que cada bloque tenga una fila por tratamiento.'));
    const completos = [], nombres = [];
    M.forEach((f, b) => { if (f.every(v => !Number.isNaN(v))) { completos.push(f); nombres.push(bloque.niveles[bj[b]]); } });
    exigir(k >= 2, T('Hacen falta al menos dos tratamientos.'));
    exigir(completos.length >= 2, T('Hacen falta al menos dos bloques completos.'));
    return { y: completos, n: completos.length, k, tratamientos: tj.map(j => trat.niveles[j]), bloques: nombres, excluidos: M.length - completos.length };
  }
  function rangosBloques(m) {
    const r = m.y.map(f => Array.from(rangos(f)));
    let te = 0;
    for (const f of r) te += empates(f);
    const suma = new Array(m.k).fill(0);
    for (const f of r) f.forEach((v, j) => { suma[j] += v; });
    return { r, te, suma };
  }
  function friedman(ys, trat, bloque) {
    const m = matrizBloques(ys, trat, bloque), n = m.n, k = m.k, R = rangosBloques(m);
    let ss = 0;
    for (const s of R.suma) ss += (s - n * (k + 1) / 2) ** 2;
    const Q = 12 * ss / (n * k * (k + 1) - R.te / (k - 1));
    const gl = k - 1;
    return {
      Q, gl, p: D().pchisq(Q, gl, false), W: Q / (n * (k - 1)), n, k, excluidos: m.excluidos, empates: R.te > 0,
      grupos: m.tratamientos.map((nombre, j) => ({ nombre, n, mediana: mediana(m.y.map(f => f[j])), sumaRangos: R.suma[j], rangoMedio: R.suma[j] / n })),
    };
  }
  function paresFriedman(ys, trat, bloque, op) {
    op = Object.assign({ metodo: 'conover', ajuste: 'holm' }, op || {});
    const m = matrizBloques(ys, trat, bloque), n = m.n, k = m.k, R = rangosBloques(m), pares = [];
    let gl = null, est;
    if (op.metodo === 'conover') {
      est = 't'; gl = n * k - k - n + 1;
      let r2 = 0, t2 = 0;
      for (const f of R.r) for (const v of f) r2 += v * v;
      const S2 = 1 / (k - 1) * (r2 - k * n * (k + 1) * (k + 1) / 4);
      for (const s of R.suma) t2 += (s - n * (k + 1) / 2) ** 2;
      const T2 = t2 / S2, A = S2 * (2 * n * (k - 1)) / gl, B = 1 - T2 / (n * (k - 1));
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const dif = R.suma[a] - R.suma[b], t = dif / (sqrt(A) * sqrt(B));
        pares.push({ a, b, dif, estadistico: t, p: 2 * D().pt(abs(t), gl, false), p_tukey: D().ptukey(SQRT2 * abs(t), k, Infinity, false) });
      }
    } else if (op.metodo === 'nemenyi') {
      est = 'q';
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const dif = (R.suma[a] - R.suma[b]) / n, q = abs(dif) / sqrt(k * (k + 1) / (6 * n)) * SQRT2;
        const p = 1 - D().ptukey(q, k, Infinity);
        pares.push({ a, b, dif, estadistico: q, p, p_ajustado: p });
      }
    } else if (op.metodo === 'wilcoxon') {
      est = 'V';
      const col = j => m.y.map(f => f[j]);
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        let w;
        try { w = signoRango(col(a), col(b), { ic: false }); } catch (e) { w = { estadistico: NaN, p: NaN }; }
        pares.push({ a, b, dif: mediana(m.y.map(f => f[a] - f[b])), estadistico: w.estadistico, p: w.p, exacta: w.exacta });
      }
    } else throw new SP.ErrorSP(T('Comparación desconocida: {m}.', { m: op.metodo }));
    cerrarPares(pares, op);
    return { metodo: op.metodo, ajuste: op.metodo === 'nemenyi' ? 'tukey' : op.ajuste, estadistico: est, gl, niveles: m.tratamientos, pares, empates: R.te > 0 };
  }

  SP.np = { signoRango, sumaRangos, kruskal, paresKruskal, friedman, paresFriedman, ajustarP, letras, letrasPorOrden, empates, AJUSTES };

  /* ======================= métodos ======================= */
  const ALT = { bilateral: '≠', menor: '<', mayor: '>' };
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : x === Infinity ? '∞' : x === -Infinity ? '−∞' : '—');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const NOMBRE_AJUSTE = { holm: 'Holm', bonferroni: 'Bonferroni', BH: 'Benjamini-Hochberg', ninguno: 'sin ajuste', tukey: 'Tukey (un paso)' };
  const NOMBRE_PAR = { dunn: 'Dunn', conover: 'Conover-Iman', nemenyi: 'Nemenyi', wilcoxon: 'Wilcoxon pareada' };
  const resumenGrupo = (v, nombre) => {
    const s = sin(v), c = s.length ? SP.desc.cuantil(s, [0.25, 0.75]) : [NaN, NaN];
    return { nombre, n: s.length, mediana: s.length ? mediana(s) : NaN, q1: c[0], q3: c[1] };
  };
  const decimales = (tabla, nombre) => { try { return SP.desc.decimalesDe(tabla.col(nombre).valores); } catch (e) { return 2; } };

  /* ---- Wilcoxon y Mann-Whitney ---- */
  function muestras(tabla, e) {
    if (e.modo === 'una') return { x: tabla.col(e.variable).valores, y: null, etiquetas: [e.variable], dec: decimales(tabla, e.variable) };
    if (e.modo === 'pareadas') return { x: tabla.col(e.antes).valores, y: tabla.col(e.despues).valores, etiquetas: [e.antes, e.despues], dec: decimales(tabla, e.antes) };
    const g = SP.estructura.comoFactor(tabla, e.grupo), yv = tabla.col(e.respuesta).valores;
    const niveles = e.niveles && e.niveles.length === 2 ? e.niveles : g.niveles.slice(0, 2);
    const k0 = g.niveles.indexOf(niveles[0]), k1 = g.niveles.indexOf(niveles[1]), x = [], y = [];
    for (let i = 0; i < yv.length; i++) { if (g.codigos[i] === k0) x.push(yv[i]); else if (g.codigos[i] === k1) y.push(yv[i]); }
    return { x: Float64Array.from(x), y: Float64Array.from(y), etiquetas: niveles, dec: decimales(tabla, e.respuesta) };
  }
  function validarDos(tabla, e, op) {
    exigir(['una', 'independientes', 'pareadas'].includes(e.modo), T('Elige el tipo de prueba.'));
    const num = c => { exigir(c && tabla.columnas[c], T('Falta elegir una columna.')); exigir(tabla.col(c).tipo === 'numerica', T('«{c}» debe ser numérica.', { c })); };
    if (e.modo === 'una') num(e.variable);
    else if (e.modo === 'pareadas') { num(e.antes); num(e.despues); exigir(e.antes !== e.despues, T('Elige dos columnas distintas.')); }
    else {
      num(e.respuesta);
      exigir(e.grupo && tabla.columnas[e.grupo], T('Elige la columna que separa los dos grupos.'));
      const g = SP.estructura.comoFactor(tabla, e.grupo);
      exigir(g.niveles.length >= 2, T('«{c}» necesita al menos dos niveles.', { c: e.grupo }));
      if (e.niveles) exigir(e.niveles.length === 2 && e.niveles.every(n => g.niveles.includes(n)) && e.niveles[0] !== e.niveles[1], T('Elige dos niveles distintos de «{c}».', { c: e.grupo }));
    }
    exigir(op.nivel > 0 && op.nivel < 1, T('El nivel de confianza va entre 0 y 1.'));
    exigir(ALT[op.alternativa], T('Alternativa desconocida.'));
  }
  function calcularWilcoxon(tabla, e, op) {
    const { x, y, etiquetas, dec } = muestras(tabla, e);
    const o = { mu: +op.mu || 0, alternativa: op.alternativa, nivel: op.nivel, exacta: op.exacta, correccion: op.correccion !== false };
    const out = { modo: e.modo, etiquetas, alternativa: op.alternativa, mu: o.mu, nivel: op.nivel, alfa: op.alfa, dec };
    if (e.modo === 'independientes') {
      out.prueba = sumaRangos(x, y, o);
      out.grupos = [resumenGrupo(x, etiquetas[0]), resumenGrupo(y, etiquetas[1])];
      out.valores = [Array.from(sin(x)), Array.from(sin(y))];
    } else {
      out.prueba = signoRango(x, e.modo === 'pareadas' ? y : null, o);
      out.grupos = e.modo === 'pareadas'
        ? [resumenGrupo(x, etiquetas[0]), resumenGrupo(y, etiquetas[1]), resumenGrupo(Array.from(x, (v, i) => v - y[i]), T('diferencia'))]
        : [resumenGrupo(x, etiquetas[0])];
      out.valores = e.modo === 'pareadas' ? [Array.from(x, (v, i) => v - y[i]).filter(v => !Number.isNaN(v))] : [Array.from(sin(x))];
    }
    return out;
  }
  function reporteWilcoxon(r) {
    const a = r.alfa || 0.05, pr = r.prueba, nv = Math.round(r.nivel * 100), sig = pr.p < a, conclusiones = [];
    const nombre = r.modo === 'independientes' ? T('Suma de rangos de Wilcoxon (Mann-Whitney)') : r.modo === 'pareadas' ? T('Rangos con signo de Wilcoxon (pareada)') : T('Rangos con signo de Wilcoxon (una muestra)');
    const est = r.modo === 'independientes' ? 'W' : 'V';
    const ic = pr.ic ? T('IC {nv} %: {i} a {s}', { nv: Math.round((pr.nivelLogrado || r.nivel) * 100), i: f3(pr.ic[0]), s: f3(pr.ic[1]) }) : '';
    if (r.modo === 'independientes') {
      conclusiones.push(sig
        ? T('«{a}» y «{b}» difieren en ubicación: diferencia estimada (Hodges-Lehmann) {d}, {ic}; {e} = {w}, p {p}.', { a: r.etiquetas[0], b: r.etiquetas[1], d: f3(pr.estimado), ic, e: est, w: pr.estadistico, p: fp(pr.p) })
        : T('No hay evidencia de que «{a}» y «{b}» difieran en ubicación ({e} = {w}, p {p}); diferencia estimada (Hodges-Lehmann) {d}, {ic}.', { a: r.etiquetas[0], b: r.etiquetas[1], d: f3(pr.estimado), ic, e: est, w: pr.estadistico, p: fp(pr.p) }));
    } else if (r.modo === 'pareadas') {
      conclusiones.push(sig
        ? T('«{a}» y «{b}» difieren: seudomediana de las diferencias {d}, {ic}; V = {w}, p {p}.', { a: r.etiquetas[0], b: r.etiquetas[1], d: f3(pr.estimado), ic, w: pr.estadistico, p: fp(pr.p) })
        : T('No hay evidencia de diferencia entre «{a}» y «{b}» (V = {w}, p {p}); seudomediana de las diferencias {d}, {ic}.', { a: r.etiquetas[0], b: r.etiquetas[1], d: f3(pr.estimado), ic, w: pr.estadistico, p: fp(pr.p) }));
    } else {
      conclusiones.push(sig
        ? T('La ubicación de «{v}» difiere de {mu}: seudomediana {d}, {ic}; V = {w}, p {p}.', { v: r.etiquetas[0], mu: r.mu, d: f3(pr.estimado), ic, w: pr.estadistico, p: fp(pr.p) })
        : T('No hay evidencia de que la ubicación de «{v}» difiera de {mu} (V = {w}, p {p}); seudomediana {d}, {ic}.', { v: r.etiquetas[0], mu: r.mu, d: f3(pr.estimado), ic, w: pr.estadistico, p: fp(pr.p) }));
    }
    const notas = [pr.exacta ? T('Valor p exacto (sin empates ni ceros).') : T('Valor p por la aproximación normal{c}{e}.', { c: pr.correccion ? T(' con corrección por continuidad') : '', e: pr.empates || pr.ceros ? T(', corregida por empates') : '' })];
    if (pr.ceros) notas.push(T('{k} diferencias iguales a {mu} no entran (como en R).', { k: pr.ceros, mu: r.mu }));
    if (pr.nivelLogrado !== undefined && pr.nivelLogrado < r.nivel - 1e-12) notas.push(T('Con tan pocos datos el IC alcanza solo {n} % de confianza.', { n: (pr.nivelLogrado * 100).toFixed(0) }));
    const hip = r.modo === 'una' ? T('H₀: ubicación = {m}; H₁: ubicación {s} {m}', { m: r.mu, s: ALT[r.alternativa] }) : T('H₀: desplazamiento = {m}; H₁: desplazamiento {s} {m}', { m: r.mu, s: ALT[r.alternativa] });
    return {
      titulo: nombre, conclusiones,
      cuadros: [
        { id: 'prueba', titulo: T('{n} ({h})', { n: nombre, h: hip }),
          columnas: [col(est.toLowerCase(), est, 'num'), col('p', 'p', 'pvalor'), col('estimado', r.modo === 'independientes' ? T('Diferencia (Hodges-Lehmann)') : T('Seudomediana'), 'escala2'), col('ic', T('IC {nv} %', { nv }), 'intervalo2')],
          filas: [{ [est.toLowerCase()]: pr.estadistico, p: pr.p, estimado: pr.estimado, ic: pr.ic, _dec: r.dec }], notas },
        { id: 'grupos', titulo: T('Medianas y cuartiles'),
          columnas: [col('nombre', T('Grupo'), 'texto'), col('n', 'n', 'entero'), col('mediana', T('Mediana'), 'escala'), col('q1', T('Q1'), 'escala'), col('q3', T('Q3'), 'escala')],
          filas: r.grupos.map(g => Object.assign({ _dec: r.dec }, g)), notas: [] },
      ],
    };
  }
  const nombreR = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const ALT_R = { bilateral: 'two.sided', menor: 'less', mayor: 'greater' };
  function codigoWilcoxon(e, op) {
    const alt = ALT_R[op.alternativa || 'bilateral'], nivel = op.nivel || 0.95, mu = +op.mu || 0;
    const extra = (op.exacta === 'si' ? ', exact = TRUE' : op.exacta === 'no' ? ', exact = FALSE' : '') + (op.correccion === false ? ', correct = FALSE' : '');
    const L = ['# Wilcoxon (código R equivalente a SigmaPro)'];
    const comun = `mu = ${mu}, alternative = "${alt}", conf.int = TRUE, conf.level = ${nivel}${extra}`;
    if (e.modo === 'una') L.push(`prueba <- wilcox.test(datos$${nombreR(e.variable)}, ${comun}); prueba`);
    else if (e.modo === 'pareadas') L.push(`prueba <- wilcox.test(datos$${nombreR(e.antes)}, datos$${nombreR(e.despues)}, paired = TRUE, ${comun}); prueba`);
    else {
      const niv = e.niveles && e.niveles.length === 2 ? e.niveles : null;
      L.push(niv ? `x <- datos$${nombreR(e.respuesta)}[datos$${nombreR(e.grupo)} == ${JSON.stringify(niv[0])}]; y <- datos$${nombreR(e.respuesta)}[datos$${nombreR(e.grupo)} == ${JSON.stringify(niv[1])}]`
        : `g <- factor(datos$${nombreR(e.grupo)}); x <- datos$${nombreR(e.respuesta)}[g == levels(g)[1]]; y <- datos$${nombreR(e.respuesta)}[g == levels(g)[2]]`);
      L.push(`prueba <- wilcox.test(x, y, ${comun}); prueba`);
    }
    return L.join('\n');
  }
  SP.metodo({
    id: 'wilcoxon', familia: 'no-parametricas', motor: 'js',
    nombre: T('Wilcoxon y Mann-Whitney'),
    resumen: T('Alternativa por rangos a la prueba t: una muestra, dos grupos independientes o mediciones pareadas, con el estimador de Hodges-Lehmann.'),
    entradas: { modo: { tipo: 'cualquiera' }, variable: { tipo: 'numerica', opcional: true }, respuesta: { tipo: 'numerica', opcional: true }, grupo: { tipo: 'factor', opcional: true },
      antes: { tipo: 'numerica', opcional: true }, despues: { tipo: 'numerica', opcional: true } },
    opciones: { mu: { tipo: 'numero', omision: 0 }, alternativa: { tipo: 'texto', omision: 'bilateral' }, nivel: { tipo: 'numero', omision: 0.95 },
      exacta: { tipo: 'texto', omision: 'auto' }, correccion: { tipo: 'logico', omision: true }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarDos, calcular: calcularWilcoxon, reporte: reporteWilcoxon, codigoR: codigoWilcoxon,
  });

  /* ---- Kruskal-Wallis y Friedman ---- */
  function validarGrupos(tabla, e, op, conBloque) {
    exigir(e.respuesta && tabla.columnas[e.respuesta] && tabla.col(e.respuesta).tipo === 'numerica', T('Elige una respuesta numérica.'));
    exigir(e.tratamiento && tabla.columnas[e.tratamiento], T('Elige la columna de los tratamientos.'));
    exigir(e.tratamiento !== e.respuesta, T('La respuesta no puede ser también el tratamiento.'));
    if (conBloque) {
      exigir(e.bloque && tabla.columnas[e.bloque], T('Elige la columna de los bloques.'));
      exigir(e.bloque !== e.tratamiento && e.bloque !== e.respuesta, T('Los bloques deben ser otra columna.'));
    }
    exigir(op.alfa > 0 && op.alfa < 1, T('El nivel de significancia va entre 0 y 1.'));
    exigir(AJUSTES.includes(op.ajuste) || op.ajuste === 'tukey', T('Ajuste desconocido: {m}.', { m: op.ajuste }));
  }
  function calcularKruskal(tabla, e, op) {
    const y = tabla.col(e.respuesta).valores, g = SP.estructura.comoFactor(tabla, e.tratamiento);
    const prueba = kruskal(y, g);
    const ajuste = op.posthoc === 'nemenyi' ? 'tukey' : op.posthoc !== 'conover' && op.ajuste === 'tukey' ? 'holm' : op.ajuste;
    const comparaciones = paresKruskal(y, g, { metodo: op.posthoc, ajuste });
    const letrasG = letrasPorOrden(prueba.grupos.map(x => x.rangoMedio), comparaciones.pares, op.alfa);
    return { tipo: 'kruskal', respuesta: e.respuesta, tratamiento: e.tratamiento, alfa: op.alfa, dec: decimales(tabla, e.respuesta), prueba, comparaciones, letras: letrasG, valores: valoresPorGrupo(y, g, prueba.grupos) };
  }
  function calcularFriedman(tabla, e, op) {
    const y = tabla.col(e.respuesta).valores, t = SP.estructura.comoFactor(tabla, e.tratamiento), b = SP.estructura.comoFactor(tabla, e.bloque);
    const prueba = friedman(y, t, b);
    const ajuste = op.posthoc === 'nemenyi' ? 'tukey' : op.posthoc !== 'conover' && op.ajuste === 'tukey' ? 'holm' : op.ajuste;
    const comparaciones = paresFriedman(y, t, b, { metodo: op.posthoc, ajuste });
    const letrasG = letrasPorOrden(prueba.grupos.map(x => x.sumaRangos), comparaciones.pares, op.alfa);
    return { tipo: 'friedman', respuesta: e.respuesta, tratamiento: e.tratamiento, bloque: e.bloque, alfa: op.alfa, dec: decimales(tabla, e.respuesta), prueba, comparaciones, letras: letrasG,
      valores: (filas => prueba.grupos.map((_, j) => filas.map(f => f[j])))(matrizBloques(y, t, b).y) };   // solo los bloques completos
  }
  /** Valores de cada grupo, para la gráfica. */
  function valoresPorGrupo(y, g, grupos) {
    const pos = new Map(grupos.map((x, j) => [x.nombre, j])), out = grupos.map(() => []);
    for (let i = 0; i < y.length; i++) {
      if (g.codigos[i] < 0 || Number.isNaN(y[i])) continue;
      const j = pos.get(g.niveles[g.codigos[i]]);
      if (j !== undefined) out[j].push(y[i]);
    }
    return out;
  }
  function reporteRangos(r) {
    const a = r.alfa, pr = r.prueba, cp = r.comparaciones, kw = r.tipo === 'kruskal';
    const sig = pr.p < a, conclusiones = [];
    const est = kw ? T('H = {h}, gl = {gl}, p {p}', { h: f3(pr.H), gl: pr.gl, p: fp(pr.p) }) : T('χ² = {q}, gl = {gl}, p {p}', { q: f3(pr.Q), gl: pr.gl, p: fp(pr.p) });
    conclusiones.push(sig
      ? T('Al menos un tratamiento difiere de los demás en «{v}» ({e}).', { v: r.respuesta, e: est })
      : T('No hay evidencia de diferencias entre tratamientos en «{v}» ({e}).', { v: r.respuesta, e: est }));
    conclusiones.push(kw ? T('Tamaño del efecto: η² de H = {e}.', { e: f3(pr.eta2) }) : T('Concordancia entre bloques: W de Kendall = {w} ({n} bloques).', { w: f3(pr.W), n: pr.n }));
    const orden = pr.grupos.map((g, j) => j).sort((x, y) => (kw ? pr.grupos[y].rangoMedio - pr.grupos[x].rangoMedio : pr.grupos[y].sumaRangos - pr.grupos[x].sumaRangos) || x - y);
    const distintos = cp.pares.filter(p => p.p_ajustado < a).length;
    conclusiones.push(T('Comparaciones de {m} ({aj}): {d} de {t} pares difieren con α = {a}. Tratamientos con una letra en común no difieren.', { m: NOMBRE_PAR[cp.metodo], aj: NOMBRE_AJUSTE[cp.ajuste], d: distintos, t: cp.pares.length, a }));
    const notas = [];
    if (pr.empates) notas.push(T('Hay empates: el estadístico está corregido por empates.'));
    if (!kw && pr.excluidos) notas.push(T('{k} bloques con algún faltante no entran (como en R).', { k: pr.excluidos }));
    const filaPrueba = kw ? { prueba: T('Kruskal-Wallis'), est: pr.H, gl: pr.gl, p: pr.p, efecto: pr.eta2 } : { prueba: T('Friedman'), est: pr.Q, gl: pr.gl, p: pr.p, efecto: pr.W };
    const titEst = { z: 'z', t: 't', q: 'q', V: 'V' }[cp.estadistico];
    return {
      titulo: kw ? T('Kruskal-Wallis') : T('Friedman'), conclusiones,
      cuadros: [
        { id: 'grupos', titulo: T('Tratamientos ordenados por {c}', { c: kw ? T('rango medio') : T('suma de rangos') }),
          columnas: [col('nombre', T('Tratamiento'), 'texto'), col('n', kw ? 'n' : T('Bloques'), 'entero'), col('mediana', T('Mediana'), 'escala')].concat(kw ? [col('q1', T('Q1'), 'escala'), col('q3', T('Q3'), 'escala'), col('rangoMedio', T('Rango medio'), 'num2')] : [col('sumaRangos', T('Suma de rangos'), 'num'), col('rangoMedio', T('Rango medio'), 'num2')]).concat([col('letras', T('Grupo'), 'texto')]),
          filas: orden.map(j => Object.assign({ _dec: r.dec, letras: r.letras[j] }, pr.grupos[j])), notas: [T('Letras por {m} con ajuste {aj} y α = {a}.', { m: NOMBRE_PAR[cp.metodo], aj: NOMBRE_AJUSTE[cp.ajuste], a })] },
        { id: 'prueba', titulo: kw ? T('Prueba de Kruskal-Wallis') : T('Prueba de Friedman'),
          columnas: [col('prueba', T('Prueba'), 'texto'), col('est', kw ? 'H' : 'χ²', 'forma'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor'), col('efecto', kw ? T('η² de H') : T('W de Kendall'), 'forma')],
          filas: [filaPrueba], notas },
        { id: 'pares', titulo: T('Comparaciones por pares: {m} ({aj})', { m: NOMBRE_PAR[cp.metodo], aj: NOMBRE_AJUSTE[cp.ajuste] }),
          columnas: [col('par', T('Par'), 'texto'), col('dif', cp.metodo === 'wilcoxon' ? T('Mediana de las diferencias') : kw || cp.metodo === 'nemenyi' ? T('Dif. de rangos medios') : T('Dif. de sumas de rangos'), cp.metodo === 'wilcoxon' ? 'escala' : 'num2'),
            col('estadistico', titEst, cp.estadistico === 'V' ? 'num' : 'forma'), col('p', T('p sin ajustar'), 'pvalor'), col('p_ajustado', T('p ajustado'), 'pvalor'), col('decision', T('¿Difieren?'), 'texto')],
          filas: cp.pares.map(p => ({ par: cp.niveles[p.a] + ' – ' + cp.niveles[p.b], dif: p.dif, estadistico: p.estadistico, p: p.p, p_ajustado: p.p_ajustado, decision: p.p_ajustado < a ? T('sí') : T('no'), _dec: r.dec })),
          notas: cp.gl ? [T('{e} con {gl} grados de libertad.', { e: titEst, gl: cp.gl })] : [] },
      ],
    };
  }
  const R_AJUSTE = { holm: 'holm', bonferroni: 'bonferroni', BH: 'BH', ninguno: 'none', tukey: 'single-step' };
  function codigoKruskal(e, op) {
    op = Object.assign({ posthoc: 'dunn', ajuste: 'holm', alfa: 0.05 }, op);
    const y = `datos$${nombreR(e.respuesta)}`, g = `factor(datos$${nombreR(e.tratamiento)})`, aj = R_AJUSTE[op.ajuste] || 'holm';
    const L = ['# Kruskal-Wallis (código R equivalente a SigmaPro)', `prueba <- kruskal.test(${y}, ${g}); prueba`, `(prueba$statistic - nlevels(${g}) + 1) / (sum(!is.na(${y})) - nlevels(${g}))   # η² de H`, '# comparaciones: install.packages(c("PMCMRplus", "multcompView"))'];
    if (op.posthoc === 'conover') L.push(`pc <- PMCMRplus::kwAllPairsConoverTest(${y}, ${g}, p.adjust.method = "${aj}")`);
    else if (op.posthoc === 'nemenyi') L.push(`pc <- PMCMRplus::kwAllPairsNemenyiTest(${y}, ${g})`);
    else L.push(`pc <- PMCMRplus::kwAllPairsDunnTest(${y}, ${g}, p.adjust.method = "${aj === 'single-step' ? 'holm' : aj}")`);
    L.push('summary(pc)', `# letras: los niveles ordenados por rango medio decreciente y multcompView::multcompLetters(p < ${op.alfa})`);
    return L.join('\n');
  }
  function codigoFriedman(e, op) {
    op = Object.assign({ posthoc: 'conover', ajuste: 'holm', alfa: 0.05 }, op);
    const aj = R_AJUSTE[op.ajuste] || 'holm';
    const L = ['# Friedman (código R equivalente a SigmaPro)',
      `d <- data.frame(y = datos$${nombreR(e.respuesta)}, trat = factor(datos$${nombreR(e.tratamiento)}), bloque = factor(datos$${nombreR(e.bloque)}))`,
      'd <- droplevels(d[!d$bloque %in% d$bloque[is.na(d$y)], ])   # solo bloques completos, como friedman.test',
      'd <- d[order(d$trat, d$bloque), ]',
      'prueba <- friedman.test(d$y, d$trat, d$bloque); prueba',
      'W <- unname(prueba$statistic) / (nlevels(d$bloque) * (nlevels(d$trat) - 1)); W   # W de Kendall',
      '# comparaciones: install.packages(c("PMCMRplus", "multcompView"))'];
    if (op.posthoc === 'nemenyi') L.push('pc <- PMCMRplus::frdAllPairsNemenyiTest(d$y, d$trat, d$bloque)');
    else if (op.posthoc === 'wilcoxon') L.push(`pc <- pairwise.wilcox.test(d$y, d$trat, paired = TRUE, p.adjust.method = "${aj === 'single-step' ? 'holm' : aj}")`);
    else L.push(`pc <- PMCMRplus::frdAllPairsConoverTest(d$y, d$trat, d$bloque, p.adjust.method = "${aj}")`);
    L.push(op.posthoc === 'wilcoxon' ? 'pc' : 'summary(pc)', `# letras: los tratamientos ordenados por suma de rangos decreciente y multcompView::multcompLetters(p < ${op.alfa})`);
    return L.join('\n');
  }
  const OP_RANGOS = { posthoc: { tipo: 'texto', omision: 'dunn' }, ajuste: { tipo: 'texto', omision: 'holm' }, alfa: { tipo: 'numero', omision: 0.05 } };
  SP.metodo({
    id: 'kruskal-wallis', familia: 'no-parametricas', motor: 'js',
    nombre: T('Kruskal-Wallis'),
    resumen: T('Compara tres o más tratamientos por rangos (alternativa al ANOVA de un factor), con comparaciones de Dunn, Conover-Iman o Nemenyi y letras.'),
    entradas: { respuesta: { tipo: 'numerica' }, tratamiento: { tipo: 'factor' } },
    opciones: OP_RANGOS,
    validar: (t, e, op) => { validarGrupos(t, e, op, false); exigir(['dunn', 'conover', 'nemenyi'].includes(op.posthoc), T('Comparación desconocida.')); },
    calcular: calcularKruskal, reporte: reporteRangos, codigoR: codigoKruskal,
  });
  SP.metodo({
    id: 'friedman', familia: 'no-parametricas', motor: 'js',
    nombre: T('Friedman'),
    resumen: T('Compara tratamientos en bloques completos por rangos (alternativa al ANOVA en bloques), con la W de Kendall, comparaciones y letras.'),
    entradas: { respuesta: { tipo: 'numerica' }, tratamiento: { tipo: 'factor' }, bloque: { tipo: 'factor' } },
    opciones: Object.assign({}, OP_RANGOS, { posthoc: { tipo: 'texto', omision: 'conover' } }),
    validar: (t, e, op) => { validarGrupos(t, e, op, true); exigir(['conover', 'nemenyi', 'wilcoxon'].includes(op.posthoc), T('Comparación desconocida.')); },
    calcular: calcularFriedman, reporte: reporteRangos, codigoR: codigoFriedman,
  });
});
