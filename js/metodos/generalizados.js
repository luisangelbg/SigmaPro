/* SigmaPro — modelos lineales generalizados (familia Modelos lineales generalizados), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cuatro métodos con el mismo cálculo (SP.glm, validado contra glm, MASS::glm.nb, car::Anova y emmeans):
   - glm-conteos: conteos (insectos, lesiones, plántulas) con Poisson, cuasi-Poisson o binomial negativa; con la
     exposición (tamaño de la unidad) como desplazamiento log, las medias son tasas por unidad.
   - glm-proporciones: éxitos de n ensayos (germinadas de 50) o respuestas 0/1, binomial o cuasibinomial, con enlace
     logit, probit o log-log complementario.
   - glm-gamma: respuestas positivas y asimétricas (tiempos, concentraciones), gamma con enlace log, inverso o identidad.
   - glm: cualquier familia desde una fórmula escrita (como el modelo lineal general).
   «Automática» elige por la prueba de Pearson: con sobredispersión (p < 0.05), binomial negativa en conteos y
   cuasibinomial en proporciones agrupadas; con 0/1 se queda la binomial.
   Da el análisis de devianza tipo I (secuencial, como anova.glm), II o III (como car::Anova; el III con contrastes de
   suma cero): χ² = ΔD/φ con la dispersión fija y F = ΔD/(gl·φ̂) con la de Pearson (cuasi y gamma); los coeficientes
   con contrastes de tratamiento y su z (o t), las razones de momios o de tasas con su intervalo de Wald, la dispersión y
   la prueba de sobredispersión, y las medias marginales en la escala de la respuesta (las de emmeans con offset = 0)
   con sus pares (razones con los enlaces log y logit) y letras. */
SP.definir('generalizados', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, exp, log, min, max } = Math;
  const D = () => SP.dist, G = () => SP.glm;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const NOMBRE_FAM = { binomial: 'binomial', cuasibinomial: 'cuasibinomial', poisson: 'Poisson', cuasipoisson: 'cuasi-Poisson', 'binomial-negativa': 'binomial negativa', gamma: 'gamma' };
  const NOMBRE_ENL = { logit: 'logit', probit: 'probit', cloglog: 'log-log complementario', log: 'logaritmo', inverso: 'inverso', identidad: 'identidad' };
  const AJUSTES = { tukey: 'tukey', bonferroni: 'bonferroni', holm: 'holm', sidak: 'sidak', none: 'dms' };
  const NOMBRE_AJUSTE = { tukey: 'Tukey', bonferroni: 'Bonferroni', holm: 'Holm', sidak: 'Šidák', none: T('sin ajuste') };

  /** Vista de la tabla: la respuesta, los ensayos, la exposición y los factores (las numéricas pedidas como factor). */
  function vista(tabla, form, comoFactor, extra) {
    const cols = {}, nombres = [];
    for (const v of [form.respuesta, ...form.variables, ...extra]) {
      if (cols[v]) continue;
      exigir(tabla.columnas[v], T('No existe la columna «{c}».', { c: v }), T('Revisa cómo está escrito el nombre (mayúsculas, acentos); los nombres con espacios van entre `comillas invertidas`.'));
      cols[v] = v !== form.respuesta && !extra.includes(v) && comoFactor.includes(v) ? SP.estructura.comoFactor(tabla, v) : tabla.col(v);
      nombres.push(v);
    }
    exigir(cols[form.respuesta].tipo === 'numerica', T('La respuesta «{r}» debe ser numérica.', { r: form.respuesta }));
    for (const v of extra) exigir(cols[v].tipo === 'numerica', T('«{c}» debe ser numérica.', { c: v }));
    return { n: tabla.n, nombres, columnas: cols, col(n) { const c = cols[n]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: n })); return c; } };
  }

  /** Datos del ajuste: X, y en la escala de la familia (proporción con ensayos), pesos y desplazamiento. */
  function preparar(tabla, e, op) {
    const comoFactor = lista(op.comoFactor), form = SP.modeloLineal.leerFormula(e.respuesta, op.derecha);
    const extra = [e.ensayos, e.exposicion].filter(Boolean), t = vista(tabla, form, comoFactor, extra);
    const ok = [];
    for (let i = 0; i < tabla.n; i++) {
      if (extra.some(v => { const x = t.col(v).valores[i]; return x !== x || !(x > 0); })) continue;
      ok.push(i);
    }
    const mm = SP.formula.matrizModelo(t, form, { filas: Int32Array.from(ok) });
    const n = mm.n, yv = t.col(e.respuesta).valores, y = new Float64Array(n), w = new Float64Array(n).fill(1), off = new Float64Array(n);
    for (let r = 0; r < n; r++) {
      const i = mm.filas[r];
      if (e.ensayos) { const m = t.col(e.ensayos).valores[i]; w[r] = m; y[r] = yv[i] / m; } else y[r] = yv[i];
      if (e.exposicion) off[r] = log(t.col(e.exposicion).valores[i]);
    }
    return { form, t, mm, comoFactor, o: { X: mm.X, n, p: mm.p, y, w, desplazamiento: off } };
  }
  function revisarRespuesta(P, familia, e) {
    const { y, n, w } = P.o, base = familia.replace('cuasi', '').replace('binomial-negativa', 'poisson');
    for (let i = 0; i < n; i++) {
      if (base === 'binomial') {
        exigir(y[i] >= 0 && y[i] <= 1, e.ensayos ? T('Los éxitos de «{r}» deben ir entre 0 y el número de ensayos.', { r: e.respuesta }) : T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }),
          e.ensayos ? T('Revisa la fila con «{r}» mayor que «{n}».', { r: e.respuesta, n: e.ensayos }) : T('Si son conteos de éxitos (germinadas de 50), elige también la columna de ensayos.'));
        if (!e.ensayos) exigir(y[i] === 0 || y[i] === 1, T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }), T('Si son conteos de éxitos (germinadas de 50), elige también la columna de ensayos.'));
        else exigir(abs(y[i] * w[i] - Math.round(y[i] * w[i])) < 1e-8, T('Los éxitos y los ensayos deben ser números enteros.'));
      } else if (base === 'poisson') exigir(y[i] >= 0, T('Los conteos de «{r}» no pueden ser negativos.', { r: e.respuesta }));
      else exigir(y[i] > 0, T('La familia gamma necesita valores positivos de «{r}».', { r: e.respuesta }), T('Si hay ceros, suma una constante pequeña en el bloque Datos o usa otra familia.'));
    }
  }

  /** Ajuste del modelo completo. */
  function ajustarFam(P, familia, enlace) {
    const o = Object.assign({}, P.o, { familia, enlace }), fit = G().ajustar(o);
    return { o: Object.assign(o, { theta: fit.theta }), fit, st: G().estadisticas(o, fit) };
  }
  /** Ajuste con un subconjunto de columnas (θ fija en la binomial negativa). */
  function ajustarCols(o, X, cols) {
    const n = o.n, k = cols.length;
    if (!k) {
      const F = G().FAMILIAS[o.familia], E = G().ENLACES[o.enlace];
      let dv = 0;
      for (let i = 0; i < n; i++) dv += F.dev(o.y[i], E.inv(o.desplazamiento[i]), o.w[i], o.theta);
      return { devianza: dv, rango: 0 };
    }
    const Xs = new Float64Array(n * k);
    cols.forEach((j, c) => Xs.set(X.subarray(j * n, (j + 1) * n), c * n));
    return G().irls(Object.assign({}, o, { X: Xs, p: k }));
  }

  function analizar(tabla, e, op) {
    op = Object.assign({ familia: 'poisson', enlace: '', tipo: 2, comparar: [], dentro: '', ajuste: 'tukey', nivel: 0.95, alfa: 0.05 }, op || {});
    const P = preparar(tabla, e, op), mm = P.mm, avisos = [];
    let familia = op.familia, auto = null;
    if (familia === 'auto') {
      const base = op.base || 'poisson', enl = op.enlace || G().ENLACE_OMISION[base];
      revisarRespuesta(P, base, e);
      const r0 = ajustarFam(P, base, enl), binaria = base === 'binomial' && !e.ensayos;
      familia = !binaria && r0.st.pSobredispersion < 0.05 ? (base === 'poisson' ? 'binomial-negativa' : 'cuasibinomial') : base;
      auto = { base, razon: r0.st.sobredispersion, p: r0.st.pSobredispersion, binaria };
    }
    const enlace = op.enlace || G().ENLACE_OMISION[familia];
    exigir(G().FAMILIAS[familia], T('Familia desconocida: {f}.', { f: familia }));
    exigir(G().FAMILIAS[familia].enlaces.includes(enlace), T('El enlace {e} no es de la familia {f}.', { e: NOMBRE_ENL[enlace] || enlace, f: NOMBRE_FAM[familia] }));
    revisarRespuesta(P, familia, e);
    const A = ajustarFam(P, familia, enlace), { o, fit, st } = A, F = G().FAMILIAS[familia];
    if (!fit.convergio) avisos.push(T('El ajuste no convergió en 100 iteraciones; los resultados pueden no ser confiables.'));
    const n = o.n, p = o.p, phi = st.dispersion, gl = st.gl, fija = F.dispFija;
    /* coeficientes */
    const d = fit.qr, k = d.rango, Vk = SP.algebra.rtrInversa(d), pos = new Int32Array(p).fill(-1);
    for (let i = 0; i < k; i++) pos[d.pivote[i]] = i;
    const ee = Array.from({ length: p }, (_, j) => (pos[j] < 0 ? NaN : sqrt(phi * Vk[pos[j] + pos[j] * k])));
    const est = Array.from(fit.coef), z = est.map((b, j) => b / ee[j]);
    const pz = z.map(v => (fija ? 2 * D().pnorm(-abs(v)) : 2 * D().pt(abs(v), gl, false)));
    const nombres = mm.columnas.map(c => (c === '(Intercepto)' ? '(Intercept)' : c));
    const quitados = nombres.filter((_, j) => pos[j] < 0);
    if (quitados.length) avisos.push(T('Coeficientes sin estimar (colineales con otros): {c}.', { c: quitados.join(', ') }));
    const coeficientes = { nombre: nombres, estimado: est, ee, estadistico: z, p: pz };
    const cz = D().qnorm(1 - (1 - op.nivel) / 2), conRazon = enlace === 'log' || enlace === 'logit';
    const razones = conRazon ? { razon: est.map(exp), ic_inf: est.map((b, j) => exp(b - cz * ee[j])), ic_sup: est.map((b, j) => exp(b + cz * ee[j])) } : null;
    /* devianza nula: solo el intercepto (y el desplazamiento) */
    const sinX = ajustarCols(o, null, []);
    const nula = P.form.intercepto ? G().irls(Object.assign({}, o, { X: new Float64Array(n).fill(1), p: 1 })).devianza : sinX.devianza;
    /* análisis de devianza */
    let tipo = Number(op.tipo) || 2;
    if (!P.form.intercepto && tipo !== 1) { tipo = 1; avisos.push(T('Sin intercepto solo tiene sentido el análisis de devianza secuencial (tipo I); se usó ese.')); }
    const devianza = tablaDevianza(tabla, P, o, fit, tipo, phi, gl, fija);
    /* medias en la escala de la respuesta */
    const medias = lista(op.comparar).filter(f => f !== op.dentro).map(f => mediasDe(P, o, fit, phi, gl, familia, enlace, f, op));
    let nf = 0;
    if (familia === 'binomial' || familia === 'cuasibinomial') for (let i = 0; i < n; i++) if (fit.mu[i] < 1e-8 || fit.mu[i] > 1 - 1e-8) nf++;
    if (nf) avisos.push(T('{k} probabilidades ajustadas quedaron prácticamente en 0 o 1 (separación): los coeficientes de esos grupos y sus EE no son confiables.', { k: nf }));
    const E = G().ENLACES[enlace], resP = [], resD = [];
    for (let i = 0; i < n; i++) {
      const r = o.y[i] - fit.mu[i];
      resP.push(r * sqrt(o.w[i] / F.varianza(fit.mu[i], fit.theta)));
      resD.push(Math.sign(r) * sqrt(max(0, F.dev(o.y[i], fit.mu[i], o.w[i], fit.theta))));
    }
    const formula = (e.ensayos ? `cbind(${q(e.respuesta)}, ${q(e.ensayos)} - ${q(e.respuesta)})` : q(e.respuesta)) + ' ~ ' + String(op.derecha).trim() + (e.exposicion ? ` + offset(log(${q(e.exposicion)}))` : '');
    const out = {
      tipo: 'glm', respuesta: e.respuesta, ensayos: e.ensayos || '', exposicion: e.exposicion || '', formula, derecha: String(op.derecha).trim(), familia, enlace, auto,
      tipoDev: tipo, alfa: op.alfa, nivel: op.nivel, ajusteComp: op.ajuste, avisos, n, excluidas: tabla.n - n,
      coeficientes, razones, devianza, prueba: fija ? 'chi2' : 'F',
      ajuste: { n, devianza: fit.devianza, gl, devianza_nula: nula, gl_nula: n - (P.form.intercepto ? 1 : 0), dispersion: phi, pearson: st.pearson, sobredispersion: st.sobredispersion,
        p_sobredispersion: st.pSobredispersion, aic: st.aic, bic: st.bic, iteraciones: fit.iteraciones, convergio: fit.convergio },
      medias, valores: { ajustados: Array.from(fit.mu), observados: Array.from(o.y), pearson: resP, devianza: resD, eta: Array.from(fit.eta) },
      enlaceInv: E.inv,
    };
    if (familia === 'binomial-negativa') { out.theta = fit.theta; out.ee_theta = fit.eeTheta; }
    return out;
  }

  /** Análisis de devianza tipo I, II o III: los submodelos sin cada término (θ fija en la binomial negativa). */
  function tablaDevianza(tabla, P, o, fit, tipo, phi, gl, fija) {
    let X = P.mm.X, asg = P.mm.asignacion, devCompleto = fit.devianza, rangoCompleto = fit.rango;
    if (tipo === 3) {
      const m3 = SP.formula.matrizModelo(P.t, P.form, { filas: P.mm.filas, todosSuma: true });
      X = m3.X; asg = m3.asignacion;
      const f3 = G().irls(Object.assign({}, o, { X, p: m3.p, eta0: fit.eta }));
      devCompleto = f3.devianza; rangoCompleto = f3.rango;
    }
    const terms = P.mm.terminos, K = terms.length, p = asg.length;
    const sub = excl => { const cols = []; for (let j = 0; j < p; j++) if (!excl.has(asg[j])) cols.push(j); return ajustarCols(o, X, cols); };
    const contiene = (a, b) => b.variables.length > a.variables.length && a.variables.every(v => b.variables.includes(v));
    return terms.map((tm, k) => {
      const num = k + 1;
      let m1, m2;
      if (tipo === 1) { m1 = sub(new Set(terms.map((_, j) => j + 1).filter(j => j >= num))); m2 = sub(new Set(terms.map((_, j) => j + 1).filter(j => j > num))); }
      else if (tipo === 2) {
        const rel = terms.map((x, j) => (contiene(tm, x) ? j + 1 : 0)).filter(Boolean);
        m1 = sub(new Set([num, ...rel]));
        m2 = rel.length ? sub(new Set(rel)) : { devianza: devCompleto, rango: rangoCompleto };
      } else { m1 = sub(new Set([num])); m2 = { devianza: devCompleto, rango: rangoCompleto }; }
      const g = m2.rango - m1.rango, dv = m1.devianza - m2.devianza;
      if (g <= 0) return { termino: tm.etiqueta, gl: g, devianza: NaN, estadistico: NaN, p: NaN };
      return fija ? { termino: tm.etiqueta, gl: g, devianza: dv, estadistico: dv / phi, p: D().pchisq(dv / phi, g, false) }
        : { termino: tm.etiqueta, gl: g, devianza: dv, estadistico: dv / (g * phi), p: D().pf(dv / (g * phi), g, gl, false) };
    });
  }

  /** Medias marginales (rejilla de referencia, desplazamiento 0) y sus pares, en la escala del enlace y de la respuesta. */
  function mediasDe(P, o, fit, phi, gl, familia, enlace, factor, op) {
    exigir(P.t.col(factor).tipo === 'factor', T('«{f}» no es un factor del modelo: no se comparan sus medias.', { f: factor }), T('Márcala como factor si sus valores son niveles (dosis, fechas).'));
    exigir(P.mm.terminos.some(x => x.variables.includes(factor)), T('«{f}» no está en el modelo.', { f: factor }));
    const a = { modelo: P.mm, opciones: {}, qr: fit.qr, coeficientes: fit.coef, scResidual: phi * max(gl, 1), glResidual: max(gl, 1) };
    const M = SP.comp.modeloLineal(P.t, a, null), base = M.varianza.bind(M), glE = familia === 'gamma' ? gl : Infinity;
    M.varianza = L => ({ v: base(L).v, gl: glE });
    const dentro = op.dentro ? [op.dentro] : [];
    const grupos = SP.comp.pares(M, [factor], dentro, AJUSTES[op.ajuste] || 'tukey', op.alfa);
    const E = G().ENLACES[enlace], cq = Number.isFinite(glE) ? D().qt(1 - (1 - op.nivel) / 2, glE) : D().qnorm(1 - (1 - op.nivel) / 2), conRazon = enlace === 'log' || enlace === 'logit';
    const filas = [], pares = [];
    for (const g of grupos) {
      const resp = g.medias.map(m => E.inv(m.media));
      const letras = SP.np.letrasPorOrden(resp, g.pares, op.alfa);
      g.medias.forEach((m, i) => {
        const ic = [E.inv(m.media - cq * m.ee), E.inv(m.media + cq * m.ee)].sort((x, y) => x - y);
        filas.push({ nivel: m.nombre, por: dentro.length ? g.dentro[op.dentro] : null, eta: m.media, ee_eta: m.ee, respuesta: resp[i], ee: abs(E.deta(m.media)) * m.ee, ic, letras: letras[i] });
      });
      for (const x of g.pares) {
        const r = { contraste: g.medias[x.a].nombre + ' − ' + g.medias[x.b].nombre, por: dentro.length ? g.dentro[op.dentro] : null, dif: x.dif, ee: x.ee, estadistico: x.t, p: x.p_ajustado };
        if (conRazon) r.razon = exp(x.dif);
        pares.push(r);
      }
    }
    return { factor, dentro: op.dentro || null, ajuste: op.ajuste, filas, pares, escala: escalaDe(familia, enlace) };
  }
  const escalaDe = (familia, enlace) => (familia.includes('binomial') && familia !== 'binomial-negativa' ? 'probabilidad' : enlace === 'log' && familia !== 'gamma' ? 'tasa' : 'media');

  /* ======================= reporte ======================= */
  const colorP = p => (!Number.isFinite(p) ? 'gris' : p >= 0.05 ? 'verde' : p >= 0.01 ? 'ambar' : 'rojo');
  function semaforo(r) {
    const out = [], A = r.ajuste, F = G().FAMILIAS[r.familia];
    if (F.dispFija && r.familia !== 'binomial-negativa' && !(r.familia === 'binomial' && !r.ensayos)) {
      out.push({ nombre: T('Sobredispersión'), color: A.p_sobredispersion >= 0.05 ? 'verde' : A.sobredispersion < 1.5 ? 'ambar' : 'rojo',
        texto: T('Pearson χ²/gl = {r} (p {p}). {t}', { r: f2(A.sobredispersion), p: fp(A.p_sobredispersion),
          t: A.p_sobredispersion >= 0.05 ? T('La variación cabe en la de la familia.') : r.familia === 'poisson' ? T('Hay más variación que la de Poisson: usa binomial negativa o cuasi-Poisson.') : T('Hay más variación que la binomial: usa la cuasibinomial.') }) });
    } else if (r.familia === 'binomial-negativa') out.push({ nombre: T('Sobredispersión'), color: 'verde', texto: T('La binomial negativa la modela: θ = {t} (EE = {e}).', { t: sig(r.theta), e: sig(r.ee_theta) }) });
    else if (!F.dispFija) out.push({ nombre: T('Dispersión'), color: 'verde', texto: T('Estimada por Pearson: φ = {f}; los EE y las pruebas F la incluyen.', { f: sig(A.dispersion) }) });
    const grandes = r.valores.pearson.filter(v => abs(v) > 3).length;
    out.push({ nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde',
      texto: grandes === 1 ? T('Un residuo de Pearson pasa de 3: revisa esa observación.') : grandes ? T('{k} residuos de Pearson pasan de 3: revisa esas observaciones.', { k: grandes }) : T('Ningún residuo de Pearson pasa de 3.') });
    out.push({ nombre: T('Ajuste'), color: !A.convergio || r.avisos.some(x => /separación/.test(x)) ? 'rojo' : 'verde',
      texto: !A.convergio ? T('No convergió.') : r.avisos.some(x => /separación/.test(x)) ? T('Hay separación: probabilidades ajustadas en 0 o 1.') : A.iteraciones === 1 ? T('Convergió en una iteración.') : T('Convergió en {k} iteraciones.', { k: A.iteraciones }) });
    return out;
  }
  const NOMBRE_ESCALA = { probabilidad: T('Probabilidad'), tasa: T('Tasa'), media: T('Media') };
  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], est = r.prueba === 'chi2' ? 'χ²' : 'F';
    if (r.auto) conclusiones.push(r.auto.binaria ? T('Familia binomial (respuesta 0/1).')
      : r.familia === r.auto.base ? T('Familia {f}: la prueba de Pearson no muestra sobredispersión (χ²/gl = {r}, p {p}).', { f: NOMBRE_FAM[r.familia], r: f2(r.auto.razon), p: fp(r.auto.p) })
        : T('Se usó la {f}: con la {b} había sobredispersión (χ²/gl = {r}, p {p}).', { f: NOMBRE_FAM[r.familia], b: NOMBRE_FAM[r.auto.base], r: f2(r.auto.razon), p: fp(r.auto.p) }));
    for (const x of r.devianza) {
      if (!Number.isFinite(x.p)) continue;
      const stat = { t: x.termino.split(':').join(' × '), s: est, v: f2(x.estadistico), g: x.gl, p: fp(x.p) };
      conclusiones.push(x.p < a ? T('{t}: tiene efecto ({s} = {v}, {g} gl, p {p}).', stat) : T('{t}: sin evidencia de efecto ({s} = {v}, {g} gl, p {p}).', stat));
    }
    for (const m of r.medias) {
      if (m.dentro) continue;
      const fs = m.filas.slice().sort((x, y) => y.respuesta - x.respuesta);
      if (fs.length >= 2) conclusiones.push(T('{e} más alta de {f}: {a} ({v}); más baja: {b} ({w}).', { e: NOMBRE_ESCALA[m.escala], f: m.factor, a: fs[0].nivel, v: sig(fs[0].respuesta), b: fs[fs.length - 1].nivel, w: sig(fs[fs.length - 1].respuesta) }));
    }
    const filasD = r.devianza.map(x => ({ fuente: x.termino.split(':').join(' × '), gl: x.gl, dev: x.devianza, est: x.estadistico, p: x.p }));
    filasD.push({ fuente: T('Residual'), gl: r.ajuste.gl, dev: r.ajuste.devianza, est: NaN, p: NaN });
    cuadros.push({ id: 'devianza', titulo: T('Análisis de devianza (tipo {t})', { t: ['', 'I', 'II', 'III'][r.tipoDev] }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl', 'gl', 'entero'), col('dev', T('Devianza'), 'auto4'), col('est', est, 'forma2'), col('p', 'p', 'pvalor')], filas: filasD,
      notas: [r.prueba === 'chi2' ? T('χ² = cambio de devianza al quitar el término (razón de verosimilitudes).') : T('F = (cambio de devianza / gl) / φ, con φ la dispersión de Pearson ({f}).', { f: sig(r.ajuste.dispersion) }),
        [T('Tipo I: en el orden del modelo.'), T('Tipo II: cada término ajustado por los demás que no lo contienen.'), T('Tipo III: cada término ajustado por todos los demás, con contrastes de suma cero.')][r.tipoDev - 1]]
        .concat(r.familia === 'binomial-negativa' ? [T('Con la θ del modelo completo en todos los submodelos.')] : []).concat(r.avisos) });
    const c = r.coeficientes, conR = !!r.razones, nomR = r.enlace === 'logit' ? T('Razón de momios') : r.familia === 'gamma' ? T('Razón de medias') : T('Razón de tasas');
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes (escala del enlace {e})', { e: NOMBRE_ENL[r.enlace] }),
      columnas: [col('nombre', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('z', r.prueba === 'chi2' ? 'z' : 't', 'forma2'), col('p', 'p', 'pvalor')]
        .concat(conR ? [col('razon', nomR, 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')] : []),
      filas: c.nombre.map((nm, j) => ({ nombre: nm === '(Intercept)' ? T('(Intercepto)') : nm, b: c.estimado[j], ee: c.ee[j], z: c.estadistico[j], p: c.p[j],
        razon: conR ? r.razones.razon[j] : NaN, ic: conR ? [r.razones.ic_inf[j], r.razones.ic_sup[j]] : null })),
      notas: [T('Contrastes de tratamiento: cada coeficiente compara su nivel con el primero.')].concat(conR ? [T('{n}: exp(coeficiente), con el intervalo de Wald.', { n: nomR })] : []) });
    for (const m of r.medias) {
      cuadros.push({ id: 'medias-' + m.factor, titulo: T('{e} estimada de cada nivel de «{f}»', { e: NOMBRE_ESCALA[m.escala], f: m.factor }) + (m.dentro ? T(' dentro de cada nivel de «{d}»', { d: m.dentro }) : ''),
        columnas: (m.dentro ? [col('por', m.dentro, 'texto')] : []).concat([col('nivel', m.factor, 'texto'), col('v', NOMBRE_ESCALA[m.escala], 'sig'), col('ee', T('EE'), 'sig'),
          col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig'), col('letras', T('Grupo'), 'texto')]),
        filas: m.filas.map(x => ({ por: x.por, nivel: x.nivel, v: x.respuesta, ee: x.ee, ic: x.ic, letras: x.letras })),
        notas: [T('Medias marginales en la escala de la respuesta{o}: el intervalo se calcula en la escala del enlace y se transforma.', { o: r.exposicion ? T(' por unidad de «{x}»', { x: r.exposicion }) : '' }),
          T('Comparaciones con {a} (α = {al}): niveles con una letra en común no difieren.', { a: NOMBRE_AJUSTE[m.ajuste] || m.ajuste, al: a })] });
      const razon = m.pares.length && m.pares[0].razon !== undefined;
      cuadros.push({ id: 'pares-' + m.factor, titulo: T('Comparaciones por pares de «{f}»', { f: m.factor }),
        columnas: (m.dentro ? [col('por', m.dentro, 'texto')] : []).concat([col('c', T('Contraste'), 'texto'), col('v', razon ? (r.enlace === 'logit' ? T('Razón de momios') : T('Razón')) : T('Diferencia (enlace)'), 'sig'),
          col('ee', T('EE (enlace)'), 'sig'), col('z', r.prueba === 'chi2' || r.familia !== 'gamma' ? 'z' : 't', 'forma2'), col('p', T('p ajustado'), 'pvalor')]),
        filas: m.pares.map(x => ({ por: x.por, c: razon ? x.contraste.replace(' − ', ' / ') : x.contraste, v: razon ? x.razon : x.dif, ee: x.ee, z: x.estadistico, p: x.p })),
        notas: [razon ? T('Razón = exp(diferencia en la escala del enlace); la prueba se hace en esa escala.') : T('Diferencias en la escala del enlace.')] });
    }
    const A = r.ajuste, filas = [{ medida: T('Observaciones'), valor: A.n, _dec: 0 }, { medida: T('Devianza residual'), valor: A.devianza, _dec: 3 }, { medida: T('gl residuales'), valor: A.gl, _dec: 0 },
      { medida: T('Devianza nula'), valor: A.devianza_nula, _dec: 3 }, { medida: T('Dispersión (Pearson χ²/gl)'), valor: A.sobredispersion, _dec: 3 }];
    if (r.theta !== undefined) filas.push({ medida: T('θ de la binomial negativa'), valor: r.theta, _dec: 4 }, { medida: T('EE de θ'), valor: r.ee_theta, _dec: 4 });
    if (Number.isFinite(A.aic)) filas.push({ medida: 'AIC', valor: A.aic, _dec: 2 }, { medida: 'BIC', valor: A.bic, _dec: 2 });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')], filas,
      notas: [T('Familia {f} con enlace {e}.', { f: NOMBRE_FAM[r.familia], e: NOMBRE_ENL[r.enlace] }) + (Number.isFinite(A.aic) ? '' : ' ' + T('Las familias cuasi no tienen verosimilitud: sin AIC.'))] });
    return { titulo: T('Modelo lineal generalizado: {f}, enlace {e}', { f: NOMBRE_FAM[r.familia], e: NOMBRE_ENL[r.enlace] }), conclusiones: conclusiones.map(may), cuadros, semaforo: semaforo(r) };
  }

  /* ======================= código R ======================= */
  const R_FAM = { binomial: 'binomial', cuasibinomial: 'quasibinomial', poisson: 'poisson', cuasipoisson: 'quasipoisson', gamma: 'Gamma' };
  function codigoR(e, op, ctx) {
    const fam = ctx && ctx.resultado ? ctx.resultado.familia : op.familia === 'auto' ? (op.base || 'poisson') : op.familia;
    const enl = G().NOMBRE_ENLACE[(ctx && ctx.resultado && ctx.resultado.enlace) || op.enlace || G().ENLACE_OMISION[fam]];
    const facs = lista(op.comoFactor), vars = SP.modeloLineal.leerFormula(e.respuesta, op.derecha).variables;
    const usadas = [e.respuesta, ...vars, e.ensayos, e.exposicion].filter(Boolean);
    const izq = e.ensayos ? `cbind(${q(e.respuesta)}, ${q(e.ensayos)} - ${q(e.respuesta)})` : q(e.respuesta);
    const f = `${izq} ~ ${String(op.derecha).trim()}${e.exposicion ? ` + offset(log(${q(e.exposicion)}))` : ''}`, tipo = Number(op.tipo) || 2, fija = G().FAMILIAS[fam].dispFija;
    const L = ['# Modelo lineal generalizado (código R equivalente a SigmaPro)', `datos <- na.omit(datos[c(${[...new Set(usadas)].map(x => JSON.stringify(x)).join(', ')})])`,
      ...facs.map(x => `datos$${q(x)} <- factor(datos$${q(x)})`),
      'ctl <- glm.control(epsilon = 1e-12, maxit = 100)   # convergencia estricta: las mismas cifras que SigmaPro',
      fam === 'binomial-negativa' ? `m <- MASS::glm.nb(${f}, data = datos, link = ${enl}, control = ctl)` : `m <- glm(${f}, family = ${R_FAM[fam]}(link = "${enl}"), data = datos, control = ctl)`,
      'summary(m)'];
    if (enl === 'log' || enl === 'logit') L.push(`exp(cbind(${enl === 'logit' ? 'razon_momios' : fam === 'gamma' ? 'razon_medias' : 'razon_tasas'} = coef(m), confint.default(m, level = ${op.nivel || 0.95})))`);
    L.push(tipo === 1 ? `anova(m, test = "${fija ? 'Chisq' : 'F'}")` : (tipo === 3 ? 'options(contrasts = c("contr.sum", "contr.poly"))   # tipo III: contrastes de suma cero\n' +
      `car::Anova(update(m), type = 3, test.statistic = "${fija ? 'LR' : 'F'}")\noptions(contrasts = c("contr.treatment", "contr.poly"))` : `car::Anova(m, type = 2, test.statistic = "${fija ? 'LR' : 'F'}")`));
    L.push('sum(residuals(m, type = "pearson")^2) / df.residual(m)   # dispersión (Pearson χ²/gl)');
    for (const fc of lista(op.comparar).filter(x => x !== op.dentro)) {
      L.push(`em <- emmeans::emmeans(m, "${fc}"${op.dentro ? `, by = "${op.dentro}"` : ''}, type = "response"${e.exposicion ? ', offset = 0' : ''}); em`,
        `pairs(em, adjust = "${op.ajuste || 'tukey'}")`);
    }
    return L.join('\n');
  }

  /* ======================= métodos ======================= */
  const FAMILIAS_DE = { 'glm-conteos': ['auto', 'poisson', 'cuasipoisson', 'binomial-negativa'], 'glm-proporciones': ['auto', 'binomial', 'cuasibinomial'], 'glm-gamma': ['gamma'] };
  const BASE_DE = { 'glm-conteos': 'poisson', 'glm-proporciones': 'binomial', 'glm-gamma': 'gamma' };
  /** El lado derecho de un diseño: bloque + covariables + tratamientos cruzados. */
  const derechaDe = e => [e.bloque, ...lista(e.covariables)].filter(Boolean).map(q).concat(lista(e.tratamientos).length ? [lista(e.tratamientos).map(q).join(' * ')] : []).join(' + ');
  function opcionesDiseno(id, tabla, e, op) {
    const trs = lista(e.tratamientos), facs = trs.concat(e.bloque ? [e.bloque] : []).filter(f => tabla.col(f).tipo !== 'factor');
    return Object.assign({}, op, { derecha: derechaDe(e), comoFactor: facs, base: BASE_DE[id], comparar: op.comparar && op.comparar.length ? op.comparar : trs });
  }
  function validarComun(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    exigir([1, 2, 3].includes(Number(op.tipo)), T('El tipo de análisis de devianza es 1, 2 o 3.'));
    exigir(!op.ajuste || AJUSTES[op.ajuste], T('Ajuste de comparaciones desconocido: {a}.', { a: op.ajuste }));
    exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
  }
  function validarDiseno(id) {
    return (tabla, e, op) => {
      validarComun(tabla, e, op);
      const trs = lista(e.tratamientos), cov = lista(e.covariables), usados = [e.respuesta];
      exigir(trs.length >= 1 && trs.length <= 3, T('Elige de uno a tres factores de tratamiento.'));
      const usa = c => { exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c })); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); };
      trs.forEach(usa); if (e.bloque) usa(e.bloque); cov.forEach(usa); if (e.ensayos) usa(e.ensayos); if (e.exposicion) usa(e.exposicion);
      exigir(cov.length <= 2, T('Hasta dos covariables.'));
      exigir(FAMILIAS_DE[id].includes(op.familia), T('Familia no válida para este análisis: {f}.', { f: op.familia }));
    };
  }
  function validarFormula(tabla, e, op) {
    validarComun(tabla, e, op);
    exigir(G().FAMILIAS[op.familia], T('Familia desconocida: {f}.', { f: op.familia }));
    if (e.ensayos) exigir(op.familia === 'binomial' || op.familia === 'cuasibinomial', T('La columna de ensayos solo se usa con la familia binomial o cuasibinomial.'));
  }
  const conDiseno = id => (tabla, e, op) => analizar(tabla, e, opcionesDiseno(id, tabla, e, op));
  /* en los diseños, los tratamientos y el bloque siempre son factores (aunque vengan numerados) */
  const codigoDiseno = id => (e, op, ctx) => codigoR(e, Object.assign({}, op, { derecha: derechaDe(e), comoFactor: lista(e.tratamientos).concat(e.bloque ? [e.bloque] : []),
    base: BASE_DE[id], comparar: op.comparar && op.comparar.length ? op.comparar : lista(e.tratamientos) }), ctx);
  const OPC = { tipo: { tipo: 'numero', omision: 2 }, comparar: { tipo: 'lista', omision: [] }, dentro: { tipo: 'texto', omision: '' }, ajuste: { tipo: 'texto', omision: 'tukey' },
    nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } };
  const ENTR = { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 3 }, bloque: { tipo: 'factor', opcional: true }, covariables: { tipo: 'numerica+', opcional: true, maximo: 2 } };

  SP.generalizados = { analizar, preparar, derechaDe, opcionesDiseno, codigoR, reporte, NOMBRE_FAM, NOMBRE_ENL, FAMILIAS_DE, BASE_DE, escalaDe };

  SP.metodo({
    id: 'glm-conteos', familia: 'generalizados', motor: 'js', orden: 10, nombre: T('Conteos (Poisson y binomial negativa)'),
    resumen: T('Insectos, lesiones o plántulas por unidad: tratamientos en bloques, con la familia elegida por la sobredispersión.'),
    entradas: Object.assign({}, ENTR, { exposicion: { tipo: 'numerica', opcional: true } }),
    opciones: Object.assign({ familia: { tipo: 'texto', omision: 'auto' }, enlace: { tipo: 'texto', omision: 'log' } }, OPC),
    validar: validarDiseno('glm-conteos'), calcular: conDiseno('glm-conteos'), reporte, codigoR: codigoDiseno('glm-conteos'),
  });
  SP.metodo({
    id: 'glm-proporciones', familia: 'generalizados', motor: 'js', orden: 20, nombre: T('Proporciones (binomial)'),
    resumen: T('Germinadas de n semillas, plantas enfermas de n, o respuestas sí/no: razones de momios y probabilidades por tratamiento.'),
    entradas: Object.assign({}, ENTR, { ensayos: { tipo: 'numerica', opcional: true } }),
    opciones: Object.assign({ familia: { tipo: 'texto', omision: 'auto' }, enlace: { tipo: 'texto', omision: 'logit' } }, OPC),
    validar: validarDiseno('glm-proporciones'), calcular: conDiseno('glm-proporciones'), reporte, codigoR: codigoDiseno('glm-proporciones'),
  });
  SP.metodo({
    id: 'glm-gamma', familia: 'generalizados', motor: 'js', orden: 30, nombre: T('Respuestas positivas asimétricas (gamma)'),
    resumen: T('Tiempos, concentraciones o pesos con varianza que crece con la media: modelo gamma con enlace log.'),
    entradas: ENTR,
    opciones: Object.assign({ familia: { tipo: 'texto', omision: 'gamma' }, enlace: { tipo: 'texto', omision: 'log' } }, OPC),
    validar: validarDiseno('glm-gamma'), calcular: conDiseno('glm-gamma'), reporte, codigoR: codigoDiseno('glm-gamma'),
  });
  SP.metodo({
    id: 'glm', familia: 'generalizados', motor: 'js', orden: 40, nombre: T('Modelo lineal generalizado (fórmula)'),
    resumen: T('Cualquier familia (binomial, Poisson, binomial negativa, gamma, cuasi) desde una fórmula escrita.'),
    entradas: { respuesta: { tipo: 'numerica' }, ensayos: { tipo: 'numerica', opcional: true }, exposicion: { tipo: 'numerica', opcional: true } },
    opciones: Object.assign({ derecha: { tipo: 'texto', omision: '' }, comoFactor: { tipo: 'lista', omision: [] }, familia: { tipo: 'texto', omision: 'poisson' }, enlace: { tipo: 'texto', omision: '' } }, OPC),
    validar: validarFormula, calcular: analizar, reporte, codigoR,
  });
});
