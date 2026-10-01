/* SigmaPro — modelo lineal: ajuste, resumen y análisis de varianza.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     const a = SP.lineal.ajustar(tabla, 'rend ~ bloque + hibrido * N');
     SP.lineal.resumen(a)                       coeficientes, EE, t, p, σ, R², F global
     SP.lineal.anova(tabla, formula, { tipo })  sumas de cuadrados tipo 1, 2 o 3

   Sumas de cuadrados:
   - Tipo I (secuenciales): cada término ajustado por los anteriores, en el orden de la
     fórmula. Salen de los «efectos» Qᵀy de la descomposición QR.
   - Tipo II: cada término ajustado por todos los demás que NO lo contienen (respeta la
     marginalidad). SC = SC_res(sin el término ni los que lo contienen) − SC_res(sin los
     que lo contienen).
   - Tipo III: cada término ajustado por todos los demás, con contrastes de suma cero
     en todos los factores (con contrastes de tratamiento la hipótesis no sería la de
     las medias marginales; por eso se recalcula siempre con suma cero).
   Con datos balanceados las tres coinciden.

   Los submodelos de los tipos II y III se ajustan en el espacio comprimido Q_kᵀX
   (SP.algebra.comprimir): exacto y O(p³) por término, aunque haya 100 000 filas. */
SP.definir('lineal', function (SP) {
  'use strict';
  const T = SP.T;
  const D = () => SP.dist;
  const TOL = 1e-7;

  /** Ajuste por mínimos cuadrados. */
  function ajustar(tabla, formula, op) {
    op = op || {};
    const mm = SP.formula.matrizModelo(tabla, formula, op);
    if (!mm.respuesta) throw new SP.ErrorSP(T('El modelo necesita una respuesta a la izquierda de «~».'));
    for (let i = 0; i < mm.X.length; i++) {
      const v = mm.X[i];
      if (v - v !== 0) throw new SP.ErrorSP(T('Hay valores infinitos en las variables del modelo.'), T('Revisa las transformaciones (por ejemplo, logaritmo de cero).'));
    }
    for (let i = 0; i < mm.n; i++) {
      const v = mm.y[i];
      if (v - v !== 0) throw new SP.ErrorSP(T('Hay valores infinitos en la respuesta.'), T('Revisa las transformaciones (por ejemplo, logaritmo de cero).'));
    }
    /* tablas grandes con pocas celdas (solo factores, con submuestras o repeticiones): mínimos cuadrados por celdas,
       que tienen las mismas ecuaciones normales, la misma R (salvo signos) y por eso las mismas sumas de cuadrados */
    const agrupar = op.agrupar !== undefined ? op.agrupar : mm.n >= 2000;
    const gr = agrupar ? SP.algebra.agruparFilas(mm.X, mm.n, mm.p, 0.25) : null;
    const mc = gr ? SP.algebra.minimosCuadradosAgrupados(mm.X, mm.n, mm.p, mm.y, gr, TOL) : SP.algebra.minimosCuadrados(mm.X, mm.n, mm.p, mm.y, TOL);
    return Object.assign({ modelo: mm, opciones: op, glResidual: mm.n - mc.qr.rango, rango: mc.qr.rango }, mc);
  }

  /** Coeficientes con error estándar, t y p (como el resumen de un modelo lineal). */
  function resumen(a) {
    const { modelo: mm, qr, coeficientes, residuales, glResidual: gl } = a;
    const n = mm.n, p = mm.p, k = qr.rango;
    let scr = 0;
    for (let i = 0; i < n; i++) scr += residuales[i] * residuales[i];
    const s2 = gl > 0 ? scr / gl : NaN;
    const V = SP.algebra.rtrInversa(qr);
    const ee = new Float64Array(p).fill(NaN), t = new Float64Array(p).fill(NaN), pv = new Float64Array(p).fill(NaN);
    for (let jp = 0; jp < k; jp++) {
      const j = qr.pivote[jp];
      ee[j] = Math.sqrt(s2 * V[jp + jp * k]);
      t[j] = coeficientes[j] / ee[j];
      pv[j] = 2 * D().pt(Math.abs(t[j]), gl, false);
    }
    /* R² y F global (contra el modelo con solo intercepto, o contra cero si no hay) */
    const y = mm.y;
    let media = 0;
    if (mm.intercepto) { for (let i = 0; i < n; i++) media += y[i]; media /= n; }
    let sct = 0;
    for (let i = 0; i < n; i++) { const d = y[i] - media; sct += d * d; }
    const glInt = mm.intercepto ? 1 : 0;
    const r2 = sct > 0 ? 1 - scr / sct : NaN;
    const r2aj = 1 - (1 - r2) * ((n - glInt) / gl);
    const gl1 = k - glInt;
    const Fv = gl1 > 0 ? ((sct - scr) / gl1) / s2 : NaN;
    return {
      coeficientes: {
        nombre: mm.columnas.slice(),
        estimado: Array.from(coeficientes), ee: Array.from(ee), t: Array.from(t), p: Array.from(pv),
      },
      alias: mm.columnas.filter((_, j) => Number.isNaN(coeficientes[j])),
      sigma: Math.sqrt(s2), gl_residual: gl, n, rango: k,
      r2, r2_ajustada: r2aj,
      F: { valor: Fv, gl1, gl2: gl, p: gl1 > 0 ? D().pf(Fv, gl1, gl, false) : NaN },
    };
  }

  /* columnas de cada término (índices en el orden original de la matriz) */
  function columnasPorTermino(mm) {
    const out = Array.from({ length: mm.terminos.length + 1 }, () => []);
    mm.asignacion.forEach((t, j) => out[t].push(j));
    return out;     // out[0] = intercepto
  }
  /* ¿el término j contiene todas las variables del término i? */
  const contiene = (mm, j, i) => mm.terminos[i].variables.every(v => mm.terminos[j].variables.includes(v));

  function fila(fuente, gl, sc, scRes, glRes) {
    const cm = gl > 0 ? sc / gl : NaN;
    const F = gl > 0 ? cm / (scRes / glRes) : NaN;
    return { fuente, gl, sc, cm, F, p: gl > 0 && glRes > 0 ? D().pf(F, gl, glRes, false) : NaN };
  }
  const comoTabla = filas => ({
    fuente: filas.map(f => f.fuente), gl: filas.map(f => f.gl), sc: filas.map(f => f.sc),
    cm: filas.map(f => f.cm), F: filas.map(f => f.F), p: filas.map(f => f.p),
  });

  /**
   * Tabla de análisis de varianza.
   * @param {object} tabla
   * @param {string} formula
   * @param {object} [op] { tipo: 1 | 2 | 3, contrastes }
   */
  function anova(tabla, formula, op) {
    op = op || {};
    const tipo = Number(op.tipo || 1);
    if (![1, 2, 3].includes(tipo)) throw new SP.ErrorSP(T('El tipo de suma de cuadrados es 1, 2 o 3.'));
    const a = ajustar(tabla, formula, tipo === 3 ? Object.assign({}, op, { todosSuma: true }) : op);
    const mm = a.modelo, d = a.qr, k = d.rango, glRes = a.glResidual, scRes = a.scResidual;
    if (tipo === 3 && k < mm.p) {
      throw new SP.ErrorSP(
        T('Las sumas de cuadrados tipo III no están definidas: hay coeficientes que no se pueden estimar ({c}).',
          { c: mm.columnas.filter((_, j) => Number.isNaN(a.coeficientes[j])).join(', ') }),
        T('Suele deberse a celdas vacías o a un término confundido con otro. Usa el tipo II o quita el término.'));
    }
    const filas = [];

    if (tipo === 1) {
      /* efectos de las k columnas estimables, sumados por término */
      const sc = new Float64Array(mm.terminos.length + 1), gl = new Int32Array(mm.terminos.length + 1);
      for (let jp = 0; jp < k; jp++) { const t = mm.asignacion[d.pivote[jp]]; sc[t] += a.efectos[jp] * a.efectos[jp]; gl[t]++; }
      mm.terminos.forEach((t, i) => { if (gl[i + 1] > 0) filas.push(fila(t.etiqueta, gl[i + 1], sc[i + 1], scRes, glRes)); });
    } else {
      const comp = SP.algebra.comprimir(d, a.efectos);
      const porTermino = columnasPorTermino(mm);
      const todas = mm.asignacion.map((_, j) => j);
      const sub = S => SP.algebra.scResidualSub(comp, S, TOL);
      const base = { sc: 0, rango: k };   // el modelo completo en el espacio comprimido
      const scDe = r => r.sc;             // SC residual extra sobre la del modelo completo
      if (tipo === 2) {
        mm.terminos.forEach((t, i) => {
          const ti = i + 1;
          const parientes = mm.terminos.map((_, j) => j).filter(j => j !== i && contiene(mm, j, i)).map(j => j + 1);
          const fuera = new Set(parientes.flatMap(j => porTermino[j]));
          const S2 = todas.filter(j => !fuera.has(j));
          const S1 = S2.filter(j => mm.asignacion[j] !== ti);
          const r1 = sub(S1), r2 = sub(S2);
          const gl = r2.rango - r1.rango;
          if (gl > 0) filas.push(fila(t.etiqueta, gl, scDe(r1) - scDe(r2), scRes, glRes));
        });
      } else {
        const r0 = base;
        const fuentes = [mm.intercepto ? '(Intercepto)' : null, ...mm.terminos.map(t => t.etiqueta)];
        fuentes.forEach((nom, ti) => {
          if (nom === null) return;
          const S = todas.filter(j => mm.asignacion[j] !== ti);
          const r = sub(S);
          const gl = r0.rango - r.rango;
          if (gl > 0) filas.push(fila(nom, gl, scDe(r), scRes, glRes));
        });
      }
    }
    filas.push({ fuente: 'Residuales', gl: glRes, sc: scRes, cm: glRes > 0 ? scRes / glRes : NaN, F: NaN, p: NaN });
    return Object.assign(comoTabla(filas), { tipo, n: mm.n });
  }

  SP.lineal = { ajustar, resumen, anova };

  /** Atajo para las pruebas y la interfaz: resumen directo desde la tabla. */
  SP.lineal.resumenDe = (tabla, formula, op) => resumen(ajustar(tabla, formula, op));
});
