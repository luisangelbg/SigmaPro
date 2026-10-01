/* SigmaPro — análisis de varianza con estratos de error (parcelas divididas, subdivididas y en franjas).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.estratos.anova(tabla, 'rend ~ bloque + A * B', 'bloque/A')
       → { estratos: [{ nombre: 'bloque', filas, residual }, { nombre: 'bloque:A', … }, { nombre: 'Within', … }] }

   Es el procedimiento público de un análisis de varianza con término de error (Yates; el mismo que sigue aov con
   Error() en R):
   1. Se descompone por QR la matriz del modelo de error (bloque + bloque:A); las filas de Qᵀ se reparten en
      estratos: la del intercepto, las de cada término del modelo de error en orden, y las que sobran
      («Within», dentro de las unidades más pequeñas).
   2. La respuesta y cada columna del modelo de tratamientos se proyectan con Qᵀ.
   3. En cada estrato se ajusta por mínimos cuadrados la parte proyectada de la respuesta sobre la de las columnas
      que no se anulan ahí (suma de cuadrados > 1e-5, el mismo umbral absoluto de R) y se arma su tabla con sumas de
      cuadrados secuenciales; el residual de cada estrato es el error de ese estrato (error a, error b, …).
   Con datos balanceados cada término de tratamiento cae entero en un estrato; con desbalance un término puede
   repartirse y las pruebas de los estratos dejan de ser exactas (lo detecta SP.disenos y lo explica). */
SP.definir('estratos', function (SP) {
  'use strict';
  const T = SP.T;
  const D = () => SP.dist;
  const TOL = 1e-7;

  /** Filas completas para la respuesta y todas las variables de las dos fórmulas (el marco del modelo). */
  function filasCompletas(tabla, nombres) {
    const cols = nombres.map(v => tabla.col(v)), filas = [];
    for (let i = 0; i < tabla.n; i++) {
      let ok = true;
      for (const c of cols) if (c.tipo === 'numerica' ? Number.isNaN(c.valores[i]) : c.codigos[i] < 0) { ok = false; break; }
      if (ok) filas.push(i);
    }
    return filas;
  }

  /**
   * @param {object} tabla
   * @param {string} formula   respuesta ~ términos de tratamientos (y bloques)
   * @param {string} error     términos del modelo de error, p. ej. 'bloque/A' o 'bloque/(A + B)'
   * @param {object} [op]      { contrastes, puntajes } del modelo de tratamientos
   */
  function anova(tabla, formula, error, op) {
    op = op || {};
    const fija = SP.formula.analizar(formula), fe = SP.formula.analizar('~ ' + error);
    if (!fija.respuesta) throw new SP.ErrorSP(T('El modelo necesita una respuesta a la izquierda de «~».'));
    const filas = filasCompletas(tabla, [fija.respuesta, ...new Set(fija.variables.concat(fe.variables))]);
    if (!filas.length) throw new SP.ErrorSP(T('No queda ninguna fila completa con las variables del modelo.'), T('Revisa los valores faltantes.'));
    if (!fija.intercepto) fe.intercepto = false;
    const mE = SP.formula.matrizModelo(tabla, fe, { filas });
    const mX = SP.formula.matrizModelo(tabla, fija, Object.assign({}, op, { filas }));
    const p = mX.p;
    /* Tablas grandes con submuestras: todas las columnas (error y tratamientos) viven en el espacio de las celdas, así
       que el análisis se hace con las celdas ponderadas por √nᵍ (la misma geometría) y la variación dentro de las
       celdas se suma entera al último estrato. */
    let n = mX.n, XE = mE.X, X = mX.X, y = mX.y, dentro = null;
    const agrupar = op.agrupar !== undefined ? op.agrupar : n >= 2000;
    if (agrupar) {
      const pc = mE.p + p, C = new Float64Array(n * pc);
      C.set(mE.X, 0); C.set(mX.X, mE.p * n);
      const gr = SP.algebra.agruparFilas(C, n, pc, 0.25);
      if (gr) {
        const { g, rep, cuenta, G } = gr, media = new Float64Array(G), corr = new Float64Array(G);
        for (let i = 0; i < n; i++) media[g[i]] += y[i];
        for (let q = 0; q < G; q++) media[q] /= cuenta[q];
        for (let i = 0; i < n; i++) corr[g[i]] += y[i] - media[g[i]];
        for (let q = 0; q < G; q++) media[q] += corr[q] / cuenta[q];
        let sc = 0;
        for (let i = 0; i < n; i++) { const d = y[i] - media[g[i]]; sc += d * d; }
        dentro = { sc, gl: n - G };
        const pesar = (M, k) => { const out = new Float64Array(G * k); for (let q = 0; q < G; q++) { const w = Math.sqrt(cuenta[q]); for (let j = 0; j < k; j++) out[q + j * G] = w * M[rep[q] + j * n]; } return out; };
        XE = pesar(mE.X, mE.p); X = pesar(mX.X, p); y = Float64Array.from(media, (v, q) => Math.sqrt(cuenta[q]) * v);
        n = G;
      }
    }
    const dE = SP.algebra.qr(XE, n, mE.p, TOL);
    const avisos = [];
    if (dE.rango < mE.p) avisos.push(T('El modelo de error es singular: algún término del error está confundido con otro.'));

    /* proyecciones */
    const qy = SP.algebra.qty(dE, y);
    const qx = new Float64Array(n * p);
    for (let j = 0; j < p; j++) qx.set(SP.algebra.qty(dE, X.subarray(j * n, (j + 1) * n)), j * n);

    /* estrato de cada fila de Qᵀ */
    const nombres = ['(Intercept)', ...mE.terminos.map(t => t.etiqueta)];
    const estrato = new Int32Array(n);
    for (let jp = 0; jp < dE.rango; jp++) estrato[jp] = mE.asignacion[dE.pivote[jp]];
    const hayDentro = n > dE.rango || (dentro && dentro.gl > 0);
    if (hayDentro) { for (let i = dE.rango; i < n; i++) estrato[i] = nombres.length; nombres.push('Within'); }

    const etiquetas = ['(Intercept)', ...mX.terminos.map(t => t.etiqueta)];
    const estratos = [], coefs = [];
    nombres.forEach((nombre, s) => {
      const sel = [];
      for (let i = 0; i < n; i++) if (estrato[i] === s) sel.push(i);
      const ni = sel.length, ultimo = hayDentro && s === nombres.length - 1;
      if (!ni && !(ultimo && dentro)) return;
      const yi = Float64Array.from(sel, i => qy[i]);
      /* columnas que no se anulan en este estrato */
      const cols = [];
      for (let j = 0; j < p; j++) { let s2 = 0; for (const i of sel) s2 += qx[i + j * n] * qx[i + j * n]; if (s2 > 1e-5) cols.push(j); }
      const sc = new Map(), gl = new Map();
      let scRes = 0, glRes = ni;
      if (cols.length) {
        const pk = cols.length, Xi = new Float64Array(ni * pk);
        cols.forEach((j, c) => sel.forEach((i, r) => { Xi[r + c * ni] = qx[i + j * n]; }));
        const mc = SP.algebra.minimosCuadrados(Xi, ni, pk, yi, TOL), k = mc.qr.rango;
        for (let jp = 0; jp < k; jp++) {
          const t = mX.asignacion[cols[mc.qr.pivote[jp]]];
          sc.set(t, (sc.get(t) || 0) + mc.efectos[jp] * mc.efectos[jp]);
          gl.set(t, (gl.get(t) || 0) + 1);
        }
        for (let i = k; i < ni; i++) scRes += mc.efectos[i] * mc.efectos[i];
        glRes = ni - k;
        if (op.coeficientes) coefs.push({ s, cols, mc, k, ultimo });
      } else for (let i = 0; i < ni; i++) scRes += yi[i] * yi[i];
      if (ultimo && dentro) { scRes += dentro.sc; glRes += dentro.gl; }
      const cmRes = glRes > 0 ? scRes / glRes : NaN;
      const filasT = [...sc.keys()].filter(t => t > 0).sort((a, b) => a - b).map(t => {
        const g = gl.get(t), s2 = sc.get(t), cm = s2 / g, F = glRes > 0 ? cm / cmRes : NaN;
        return { fuente: etiquetas[t], gl: g, sc: s2, cm, F, p: glRes > 0 ? D().pf(F, g, glRes, false) : NaN };
      });
      if (op.coeficientes && coefs.length && coefs[coefs.length - 1].s === s) Object.assign(coefs[coefs.length - 1], { gl: glRes, cm: cmRes });
      if (!filasT.length && glRes === 0) return;
      estratos.push({ nombre, filas: filasT, residual: glRes > 0 ? { gl: glRes, sc: scRes, cm: cmRes } : null });
    });
    const out = { estratos, n: mX.n, avisos, agrupado: !!dentro, formula, error, terminos: mX.terminos.map(t => t.etiqueta), filas: mX.filas };
    if (op.coeficientes) Object.assign(out, combinarCoeficientes(coefs, p), { modelo: mX });
    return out;
  }

  /**
   * Coeficientes de los tratamientos combinando los estratos como emmeans con un modelo de estratos (contrastes de
   * suma cero): cada coeficiente se toma del estrato más bajo donde se estima, con la varianza de ese estrato
   * (CM del error del estrato · (XᵀX)⁻¹ en el estrato). Devuelve b y los bloques { idx, V, gl } para
   * Var(L·b) = Σ Lₛ Vₛ Lₛᵀ y los grados de libertad de Satterthwaite.
   */
  function combinarCoeficientes(coefs, p) {
    const b = new Float64Array(p).fill(NaN), asignado = new Uint8Array(p), bloques = [];
    for (let c = coefs.length - 1; c >= 0; c--) {
      const { cols, mc, k, gl, cm } = coefs[c];
      const Vk = SP.algebra.rtrInversa(mc.qr), usar = [];
      for (let jp = 0; jp < k; jp++) {
        const j = cols[mc.qr.pivote[jp]];
        if (!asignado[j]) { asignado[j] = 1; b[j] = mc.coeficientes[mc.qr.pivote[jp]]; usar.push(jp); }
      }
      if (!usar.length) continue;
      const m = usar.length, V = new Float64Array(m * m);
      usar.forEach((a, r) => usar.forEach((z, q) => { V[r + q * m] = cm * Vk[a + z * k]; }));
      bloques.push({ idx: usar.map(jp => cols[mc.qr.pivote[jp]]), V, gl });
    }
    return { b, bloques };
  }
  /** Var(L·b) y grados de libertad de Satterthwaite (solo las entradas no nulas de L). */
  function varianzaCombinada(co, L) {
    let tot = 0, den = 0, mx = 0;
    for (const v of L) mx = Math.max(mx, Math.abs(v));
    /* entradas de redondeo (p. ej. los coeficientes polinomiales normalizados suman 1e-17, no 0) cuentan como cero */
    const cero = 1e-12 * mx;
    for (const bl of co.bloques) {
      const m = bl.idx.length, x = bl.idx.map(j => (Math.abs(L[j]) <= cero ? 0 : L[j]));
      if (x.every(v => v === 0)) continue;
      let v = 0;
      for (let r = 0; r < m; r++) { if (!x[r]) continue; for (let q = 0; q < m; q++) if (x[q]) v += x[r] * bl.V[r + q * m] * x[q]; }
      if (v === 0) continue;
      tot += v; den += bl.gl > 0 ? v * v / bl.gl : NaN;
    }
    return { v: tot, gl: tot * tot / den };
  }

  /** Versión plana para las pruebas: una lista de tablas con el nombre del estrato. */
  function anovaTabla(tabla, formula, error, op) {
    const r = anova(tabla, formula, error, op);
    return r.estratos.map(e => {
      const filas = e.filas.concat(e.residual ? [Object.assign({ fuente: 'Residuals', F: NaN, p: NaN }, e.residual)] : []);
      return { estrato: e.nombre, fuente: filas.map(f => f.fuente), gl: filas.map(f => f.gl), sc: filas.map(f => f.sc), cm: filas.map(f => f.cm), F: filas.map(f => f.F), p: filas.map(f => f.p) };
    });
  }

  SP.estratos = { anova, anovaTabla, filasCompletas, varianzaCombinada };
});
