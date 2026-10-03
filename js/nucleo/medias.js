/* SigmaPro — medias marginales estimadas y efectos simples sobre una rejilla de referencia.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   La rejilla de referencia (Searle, Speed y Milliken, 1980) es la tabla con todas las combinaciones de los niveles
   de los factores del modelo (las covariables en su media). Cada combinación tiene su fila de la matriz del modelo,
   x_g, y su media estimada x_g·b. Una media marginal promedia esas filas con pesos iguales sobre los factores que
   no se piden; su error estándar es √(L V Lᵀ), con V = s² (XᵀX)⁻ de los coeficientes estimables.

   Estimabilidad: si hay coeficientes sin estimar (celdas vacías, confusión), una combinación lineal L es estimable
   solo si es ortogonal a la base del espacio nulo de X; si no, la media no existe y se marca como faltante (como
   lo hace el paquete estimability de R, con tolerancia 1e-8).

   Efectos simples (pruebas conjuntas): dentro de cada nivel de los factores «por», para cada conjunto de los demás
   factores se prueban a la vez todos sus contrastes de interacción entre medias (diferencias consecutivas,
   F = (Lb)ᵀ(LVLᵀ)⁻¹(Lb)/r con r el rango de L); así es la prueba de un factor dentro de cada nivel de otro.

     SP.medias.emm(tabla, ajuste, ['A'], ['B'])            medias de A dentro de cada nivel de B
     SP.medias.pruebasConjuntas(tabla, ajuste, ['A'])      efectos de los demás factores en cada nivel de A */
SP.definir('medias', function (SP) {
  'use strict';
  const T = SP.T;
  const D = () => SP.dist;
  const { sqrt, abs } = Math;
  const TOL_EST = 1e-8;

  /** Rejilla: combinaciones de niveles (el primer factor varía más rápido) y su matriz del modelo. */
  function rejilla(tabla, a) {
    const mm = a.modelo, form = mm.formula;
    const factores = form.variables.filter(v => tabla.col(v).tipo === 'factor');
    const numericas = form.variables.filter(v => tabla.col(v).tipo !== 'factor');
    const niveles = factores.map(f => mm.niveles[f]);
    const G = niveles.reduce((g, l) => g * l.length, 1);
    const cols = {}, tipos = {};
    let paso = 1;
    factores.forEach((f, k) => {
      const l = niveles[k], ps = paso;
      cols[f] = Array.from({ length: G }, (_, g) => l[Math.floor(g / ps) % l.length]);
      tipos[f] = { tipo: 'factor', niveles: l };
      paso *= l.length;
    });
    for (const v of numericas) {
      const c = tabla.col(v);
      let s = 0;
      for (const i of mm.filas) s += c.valores[i];
      cols[v] = new Array(G).fill(s / mm.n);
    }
    if (!Object.keys(cols).length) cols['(intercepto)'] = new Array(G).fill(1);
    const tg = SP.tabla.crear(cols, tipos);
    const mg = SP.formula.matrizModelo(tg, Object.assign({}, form, { respuesta: null }), a.opciones || {});
    if (mg.p !== mm.p || mg.columnas.some((c, j) => c !== mm.columnas[j])) throw new Error('rejilla: columnas distintas de las del modelo');
    let codigos = factores.map(f => tg.col(f).codigos), X = mg.X, G2 = G;
    /* anidamiento: se promedia solo sobre las combinaciones anidadas que existen en los datos */
    const nidos = anidamientos(tabla, a, factores);
    if (Object.keys(nidos).length) {
      const vistos = {};
      for (const [f, padres] of Object.entries(nidos)) {
        const cs = [f, ...padres].map(v => tabla.col(v)), mapas = [f, ...padres].map(v => new Map(mm.niveles[v].map((l, k) => [l, k])));
        vistos[f] = new Set(Array.from(mm.filas, i => cs.map((c, k) => mapas[k].get(c.niveles[c.codigos[i]])).join('|')));
      }
      const quedan = [];
      for (let g = 0; g < G; g++) {
        let ok = true;
        for (const [f, padres] of Object.entries(nidos)) {
          const k = [f, ...padres].map(v => codigos[factores.indexOf(v)][g]).join('|');
          if (!vistos[f].has(k)) { ok = false; break; }
        }
        if (ok) quedan.push(g);
      }
      G2 = quedan.length;
      X = new Float64Array(G2 * mg.p);
      for (let j = 0; j < mg.p; j++) quedan.forEach((g, r) => { X[r + j * G2] = mg.X[g + j * G]; });
      codigos = codigos.map(c => Int32Array.from(quedan, g => c[g]));
    }
    return { factores, niveles, G: G2, X, p: mg.p, codigos, nidos };
  }

  /**
   * Factores anidados, como los detecta emmeans: f está anidado en g si cada nivel de f aparece con un solo nivel
   * de g en los datos, o si f entra al modelo solo en interacciones, codificado por contrastes dentro de los niveles
   * de otros factores (y ~ rep/bloque). Devuelve { factor: [padres] }.
   */
  function anidamientos(tabla, a, factores) {
    const mm = a.modelo, res = {};
    const nms = factores.filter(f => mm.niveles[f].length > 1);
    if (nms.length < 2) return res;
    const cod = f => { const c = tabla.col(f).codigos, x = new Int32Array(mm.n); for (let r = 0; r < mm.n; r++) x[r] = c[mm.filas[r]]; return x; };
    const datos = Object.fromEntries(nms.map(f => [f, cod(f)]));
    for (const nm of nms) {
      const excl = Object.keys(res).filter(l => res[l].includes(nm));
      const otros = nms.filter(x => x !== nm && !excl.includes(x));
      /* o es padre si cada nivel de nm aparece con un solo nivel de o */
      const padres = otros.filter(o => {
        const a = datos[nm], b = datos[o], visto = new Int32Array(tabla.col(nm).niveles.length).fill(-1);
        for (let r = 0; r < a.length; r++) { const p = visto[a[r]]; if (p < 0) visto[a[r]] = b[r]; else if (p !== b[r]) return false; }
        return true;
      });
      if (padres.length) res[nm] = padres;
    }
    /* por los términos: factores que no son efecto principal */
    const terms = mm.terminos, codif = mm.codificacion;
    const principales = new Set(terms.filter(t => t.variables.length === 1).map(t => t.variables[0]));
    for (const nm of nms.filter(x => !principales.has(x))) {
      let cols = terms.map((t, ti) => ({ t, ti })).filter(({ t, ti }) => t.variables.includes(nm) && codif[ti][t.variables.indexOf(nm)] === 'contrastes');
      if (!cols.length) cols = terms.map((t, ti) => ({ t, ti })).filter(({ t }) => t.variables.includes(nm));
      let conj = cols.map(({ t, ti }) => t.variables.filter((v, vi) => v !== nm && nms.includes(v) && codif[ti][vi] === 'indicadoras'));
      conj = conj.sort((x, y) => x.length - y.length).filter((s, i, arr) => !arr.slice(0, i).some(r => r.every(v => s.includes(v))));
      const nst = [...new Set(conj.flat())];
      if (nst.length) res[nm] = [...new Set((res[nm] || []).concat(nst))];
    }
    for (const nm of Object.keys(res)) res[nm] = [...new Set(res[nm].flatMap(p => res[p] || []).concat(res[nm]))];
    for (const nm of Object.keys(res)) if (res[nm].includes(nm)) delete res[nm];
    return res;
  }

  /** Coeficientes (aliados en 0), covarianza V (p × p, orden original) y base ortonormal del espacio nulo. */
  function partes(a) {
    if (a._medias) return a._medias;
    const d = a.qr, k = d.rango, p = d.p;
    const s2 = a.glResidual > 0 ? a.scResidual / a.glResidual : NaN;
    const b = Float64Array.from(a.coeficientes, v => (Number.isNaN(v) ? 0 : v));
    const Vk = SP.algebra.rtrInversa(d), V = new Float64Array(p * p);
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) V[d.pivote[i] + d.pivote[j] * p] = s2 * Vk[i + j * k];
    let nula = null;
    if (k < p) {
      nula = [];
      for (let jp = k; jp < p; jp++) {
        const c = new Float64Array(k);
        for (let i = 0; i < k; i++) c[i] = SP.algebra.elemR(d, i, jp);
        const sol = SP.algebra.resolverR(d, c), z = new Float64Array(p);
        for (let i = 0; i < k; i++) z[d.pivote[i]] = -sol[i];
        z[d.pivote[jp]] = 1;
        for (let pasada = 0; pasada < 2; pasada++) for (const q of nula) { let pr = 0; for (let i = 0; i < p; i++) pr += z[i] * q[i]; for (let i = 0; i < p; i++) z[i] -= pr * q[i]; }
        let nz = 0; for (let i = 0; i < p; i++) nz += z[i] * z[i];
        nz = sqrt(nz);
        if (nz > 1e-12) nula.push(z.map(v => v / nz));
      }
    }
    a._medias = { b, V, nula, p, s2 };
    return a._medias;
  }
  function estimable(L, nula) {
    if (!nula) return true;
    let ssx = 0;
    for (const v of L) ssx += v * v;
    if (ssx < TOL_EST) ssx = 1;
    let s = 0;
    for (const q of nula) { let c = 0; for (let i = 0; i < L.length; i++) c += q[i] * L[i]; s += c * c; }
    return s < TOL_EST * ssx;
  }
  const punto = (L, b) => { let s = 0; for (let i = 0; i < L.length; i++) s += L[i] * b[i]; return s; };
  function forma(L1, V, L2, p) {
    let s = 0;
    for (let j = 0; j < p; j++) { if (!L2[j]) continue; let t = 0; for (let i = 0; i < p; i++) t += L1[i] * V[i + j * p]; s += t * L2[j]; }
    return s;
  }

  /** Filas L (promedios de la rejilla) de las medias de «spec» dentro de cada combinación de «por». */
  function filasMedias(R, spec, por) {
    const idx = f => { const k = R.factores.indexOf(f); if (k < 0) throw new SP.ErrorSP(T('«{f}» no es un factor del modelo.', { f })); return k; };
    const vars = spec.concat(por).map(idx);
    const tam = vars.map(k => R.niveles[k].length);
    const C = tam.reduce((x, y) => x * y, 1);
    const L = Array.from({ length: C }, () => new Float64Array(R.p)), cuenta = new Float64Array(C);
    for (let g = 0; g < R.G; g++) {
      let c = 0, m = 1;
      vars.forEach((k, v) => { c += R.codigos[k][g] * m; m *= tam[v]; });
      cuenta[c]++;
      const fila = L[c];
      for (let j = 0; j < R.p; j++) fila[j] += R.X[g + j * R.G];
    }
    L.forEach((fila, c) => { for (let j = 0; j < R.p; j++) fila[j] /= cuenta[c]; });
    const etiquetas = Array.from({ length: C }, (_, c) => {
      const o = {}; let m = c;
      vars.forEach((k, v) => { o[R.factores[k]] = R.niveles[k][m % tam[v]]; m = Math.floor(m / tam[v]); });
      return o;
    });
    return { L, etiquetas, tam, nSpec: spec.length };
  }

  /** Medias marginales estimadas con su error estándar y grados de libertad. */
  function emm(tabla, a, spec, por) {
    por = por || [];
    const R = rejilla(tabla, a), P = partes(a), M = filasMedias(R, spec, por);
    return M.L.map((L, c) => {
      const ok = estimable(L, P.nula);
      return { niveles: M.etiquetas[c], emm: ok ? punto(L, P.b) : NaN, ee: ok ? sqrt(forma(L, P.V, L, P.p)) : NaN, gl: ok ? a.glResidual : NaN, estimable: ok };
    });
  }
  /** Versión plana para las pruebas. */
  function emmTabla(tabla, a, spec, por) {
    const filas = emm(tabla, a, spec, por);
    const out = { emm: filas.map(f => f.emm), ee: filas.map(f => f.ee), gl: filas.map(f => f.gl) };
    for (const f of spec.concat(por || [])) out[f] = filas.map(x => x.niveles[f]);
    return out;
  }

  /** Prueba F conjunta de las filas de L (se quitan las nulas y las no estimables). */
  function pruebaF(Ls, P, gl2) {
    const p = P.p;
    const filas = Ls.filter(L => { let mx = 0; for (const v of L) mx = Math.max(mx, abs(v)); return mx > 1e-8 && estimable(L, P.nula); });
    if (!filas.length) return null;
    const m = filas.length, Lt = new Float64Array(p * m);
    filas.forEach((L, j) => Lt.set(L, j * p));
    const d = SP.algebra.qr(Lt, p, m, 1e-7), r = d.rango;
    if (!r) return null;
    /* base ortonormal del espacio de las filas de L */
    const Q = [];
    for (let i = 0; i < r; i++) { const e = new Float64Array(p); e[i] = 1; Q.push(SP.algebra.qz(d, e)); }
    const est = Q.map(q => punto(q, P.b));
    const A = new Float64Array(r * r);
    for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) A[i + j * r] = forma(Q[i], P.V, Q[j], p);
    const Lc = SP.algebra.cholesky(A, r);
    /* z = Lc⁻¹ est; F = zᵀz / r */
    const z = new Float64Array(r);
    for (let i = 0; i < r; i++) { let s = est[i]; for (let k = 0; k < i; k++) s -= Lc[i + k * r] * z[k]; z[i] = s / Lc[i + i * r]; }
    let F = 0;
    for (let i = 0; i < r; i++) F += z[i] * z[i];
    F /= r;
    return { gl1: r, gl2, F, p: D().pf(F, r, gl2, false) };
  }
  /** Contrastes de diferencias consecutivas de un factor con k niveles: (k − 1) × k. */
  const consecutivos = k => Array.from({ length: k - 1 }, (_, i) => Array.from({ length: k }, (_, j) => (j === i + 1 ? 1 : j === i ? -1 : 0)));

  /**
   * Efectos simples: para cada combinación de niveles de «por» y cada conjunto no vacío de los demás factores
   * (de uno en uno, luego de dos en dos…), la prueba conjunta de sus contrastes de interacción.
   */
  function pruebasConjuntas(tabla, a, por) {
    por = por || [];
    const R = rejilla(tabla, a), P = partes(a);
    const resto = R.factores.filter(f => !por.includes(f));
    const conjuntos = [];
    for (let tam = 1; tam <= resto.length; tam++) {
      const combina = (desde, act) => { if (act.length === tam) { conjuntos.push(act.slice()); return; } for (let i = desde; i < resto.length; i++) { act.push(resto[i]); combina(i + 1, act); act.pop(); } };
      combina(0, []);
    }
    const nPor = por.reduce((x, f) => x * R.niveles[R.factores.indexOf(f)].length, 1);
    const out = [];
    for (let g = 0; g < nPor; g++) {
      for (const conj of conjuntos) {
        const M = filasMedias(R, conj, por);
        const tamS = M.tam.slice(0, conj.length), celdas = tamS.reduce((x, y) => x * y, 1);
        /* contrastes de interacción: producto de Kronecker de las diferencias consecutivas (el primero, más rápido) */
        let K = [[1]];
        tamS.forEach(k => { const c = consecutivos(k), nuevo = []; for (const fb of c) for (const fa of K) nuevo.push(fb.flatMap(vb => fa.map(va => va * vb))); K = nuevo; });
        const Ls = K.map(coef => {
          const L = new Float64Array(R.p);
          for (let s = 0; s < celdas; s++) if (coef[s]) { const fila = M.L[s + g * celdas]; for (let j = 0; j < R.p; j++) L[j] += coef[s] * fila[j]; }
          return L;
        });
        const prueba = pruebaF(Ls, P, a.glResidual);
        if (!prueba) continue;
        const nivelesPor = {};
        if (por.length) Object.assign(nivelesPor, M.etiquetas[g * celdas]);
        for (const f of conj) delete nivelesPor[f];
        out.push(Object.assign({ por: nivelesPor, termino: conj.join(':') }, prueba));
      }
    }
    return out;
  }

  /* atajos para las pruebas: ajustan el modelo de la fórmula y devuelven la tabla plana */
  const emmDe = (tabla, formula, spec, por, op) => emmTabla(tabla, SP.lineal.ajustar(tabla, formula, op), spec, por);
  function pruebasConjuntasDe(tabla, formula, por, op) {
    const r = pruebasConjuntas(tabla, SP.lineal.ajustar(tabla, formula, op), por);
    const out = { termino: r.map(x => x.termino), gl1: r.map(x => x.gl1), gl2: r.map(x => x.gl2), F: r.map(x => x.F), p: r.map(x => x.p) };
    for (const f of por || []) out[f] = r.map(x => x.por[f]);
    return out;
  }

  SP.medias = { rejilla, emm, emmTabla, pruebasConjuntas, emmDe, pruebasConjuntasDe, estimable: (a, L) => estimable(L, partes(a).nula),
    filasMedias, partes, esEstimable: estimable, pruebaF };
});
