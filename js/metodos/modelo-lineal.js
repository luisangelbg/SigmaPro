/* SigmaPro — modelo lineal general a partir de una fórmula escrita (la del constructor de modelos).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Para los modelos que no son un diseño del catálogo: factores anidados (a/b), interacciones con covariables
   (pendientes distintas), interacciones hasta cierto orden ((a + b + c)^2), sin intercepto… Da el ANOVA con SC tipo
   I, II o III (car::Anova; el III con contrastes de suma cero y, si no existe, el II), los coeficientes con
   contrastes de tratamiento (summary(lm)), el ajuste (R², σ, CV) y las medias marginales estimadas de cada factor
   (emmeans, con las covariables en su media).
   Las columnas numéricas entran como covariables, salvo las que se piden como factor (opción comoFactor: la dosis
   como tratamiento). */
SP.definir('modelo-lineal', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);
  Object.assign(SP.nombresFunciones, { 'modeloLineal.analizarDe': 'Modelo lineal general desde una fórmula: ANOVA, coeficientes y medias marginales' });

  /** Lee el lado derecho: términos y variables, con un mensaje claro si algo no cuadra. */
  function leerFormula(respuesta, derecha) {
    const texto = String(derecha || '').trim();
    exigir(texto, T('Escribe los términos del modelo después de «~».'), T('Por ejemplo: bloque + variedad * dosis'));
    if (/\bError\s*\(/.test(texto)) throw new SP.ErrorSP(T('Los estratos de error (Error(…)) no van en el modelo lineal general.'), T('Para parcelas divididas, subdivididas o en franjas usa ese diseño del catálogo o márcalo en el constructor.'));
    if (/\b(factor|log|sqrt|exp|poly|I)\s*\(/.test(texto)) throw new SP.ErrorSP(T('Las funciones dentro de la fórmula (factor(), log(), poly()…) no se usan aquí.'), T('Transforma la variable en el bloque Datos (Calcular o Transformar) y marca como factor las numéricas que lo son.'));
    return SP.formula.analizar(q(respuesta) + ' ~ ' + texto);
  }
  /** Vista de la tabla: la respuesta, los factores y las numéricas pedidas como factor convertidas. */
  function vista(tabla, form, comoFactor) {
    const cols = {}, nombres = [];
    for (const v of [form.respuesta, ...form.variables]) {
      exigir(tabla.columnas[v], T('No existe la columna «{c}».', { c: v }), T('Revisa cómo está escrito el nombre (mayúsculas, acentos); los nombres con espacios van entre `comillas invertidas`.'));
      cols[v] = v !== form.respuesta && comoFactor.includes(v) ? SP.estructura.comoFactor(tabla, v) : tabla.col(v);
      nombres.push(v);
    }
    exigir(cols[form.respuesta].tipo === 'numerica', T('La respuesta «{r}» debe ser numérica.', { r: form.respuesta }));
    return { n: tabla.n, nombres, columnas: cols, col(n) { const c = cols[n]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: n })); return c; } };
  }

  function analizar(tabla, e, op) {
    op = Object.assign({ tipoSC: 3, alfa: 0.05, nivel: 0.95 }, op || {});
    const comoFactor = lista(op.comoFactor), form = leerFormula(e.respuesta, op.derecha), avisos = [];
    const t = vista(tabla, form, comoFactor), formula = q(e.respuesta) + ' ~ ' + String(op.derecha).trim();
    let tipo = Number(op.tipoSC) || 3, tablaA;
    if (!form.intercepto && tipo !== 1) { tipo = 1; avisos.push(T('Sin intercepto, solo las sumas de cuadrados tipo I tienen sentido; se usaron esas.')); }
    try { tablaA = SP.lineal.anova(t, formula, { tipo }); }
    catch (err) {
      if (tipo !== 3) throw err;
      tipo = 2; tablaA = SP.lineal.anova(t, formula, { tipo });
      avisos.push(T('Las sumas de cuadrados tipo III no existen con coeficientes sin estimar (celdas vacías o términos confundidos); se usaron las de tipo II.'));
    }
    const a = SP.lineal.ajustar(t, formula), res = SP.lineal.resumen(a), mm = a.modelo;
    if (res.alias.length) avisos.push(T('Coeficientes sin estimar (colineales con otros): {c}.', { c: res.alias.join(', ') }));
    const idx = tablaA.fuente.map((_, k) => k).filter(k => tablaA.fuente[k] !== '(Intercepto)');
    const anova = { fuente: idx.map(k => tablaA.fuente[k]), gl: idx.map(k => tablaA.gl[k]), sc: idx.map(k => tablaA.sc[k]), cm: idx.map(k => tablaA.cm[k]), F: idx.map(k => tablaA.F[k]), p: idx.map(k => tablaA.p[k]) };
    const confundidos = mm.terminos.map(x => x.etiqueta).filter(x => !tablaA.fuente.includes(x));
    if (confundidos.length) avisos.push(T('{t} no tiene grados de libertad propios: está confundido con otro término.', { t: confundidos.join(', ') }));
    const y = mm.y, n = mm.n;
    let my = 0; for (let i = 0; i < n; i++) my += y[i]; my /= n;
    let sct = 0; for (let i = 0; i < n; i++) sct += (y[i] - my) ** 2;
    const cme = a.glResidual > 0 ? a.scResidual / a.glResidual : NaN;
    /* medias marginales de cada factor que es efecto principal */
    const factores = form.variables.filter(v => t.col(v).tipo === 'factor');
    const principales = factores.filter(f => mm.terminos.some(x => x.variables.length === 1 && x.variables[0] === f));
    const cq = D().qt(1 - (1 - op.nivel) / 2, a.glResidual);
    const medias = principales.map(f => ({ factor: f, filas: SP.medias.emm(t, a, [f]).map(m => ({ nivel: m.niveles[f], media: m.emm, ee: m.ee, gl: m.gl, ic: [m.emm - cq * m.ee, m.emm + cq * m.ee], estimable: m.estimable })) }));
    const out = {
      tipo: 'modelo', respuesta: e.respuesta, formula, derecha: String(op.derecha).trim(), comoFactor, tipoSC: tipo, alfa: op.alfa, nivel: op.nivel, avisos,
      n, excluidas: tabla.n - n, anova, total: { gl: n - (form.intercepto ? 1 : 0), sc: form.intercepto ? sct : y.reduce((s, v) => s + v * v, 0) },
      coeficientes: res.coeficientes, resumen: { media: my, cme, gl: a.glResidual, sigma: sqrt(cme), cv: 100 * sqrt(cme) / my, r2: res.r2, r2_ajustada: res.r2_ajustada },
      terminos: mm.terminos.map(x => ({ etiqueta: x.etiqueta, variables: x.variables, tipo: x.variables.every(v => t.col(v).tipo === 'factor') ? 'factor' : x.variables.every(v => t.col(v).tipo !== 'factor') ? 'covariable' : 'mixto' })),
      medias,
    };
    /* las celdas de la primera interacción entre dos factores que tenga el modelo (no la de un bloque con un tratamiento) */
    const par = mm.terminos.find(x => x.variables.length === 2 && x.variables.every(v => t.col(v).tipo === 'factor'));
    if (par) out.celdas = { factores: par.variables.slice(), filas: SP.medias.emm(t, a, par.variables) };
    out.valores = { ajustados: Array.from(a.ajustados), observados: Array.from(y) };
    return out;
  }
  function analizarDe(tabla, e, op) {
    const r = analizar(tabla, e, op);
    return { anova: r.anova, coeficientes: { estimado: r.coeficientes.estimado, ee: r.coeficientes.ee, t: r.coeficientes.t, p: r.coeficientes.p },
      resumen: { sigma: r.resumen.sigma, r2: r.resumen.r2, r2_ajustada: r.resumen.r2_ajustada },
      medias: r.medias.map(m => ({ factor: m.factor, media: m.filas.map(f => f.media), ee: m.filas.map(f => f.ee) })) };
  }
  SP.modeloLineal = { leerFormula, analizar, analizarDe };

  /* ======================= método ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const etiqueta = s => String(s).split(':').join(' × ');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [];
    r.anova.fuente.forEach((f, k) => {
      if (f === 'Residuales' || !Number.isFinite(r.anova.p[k])) return;
      conclusiones.push(r.anova.p[k] < a ? T('{t}: tiene efecto (F = {F}, p {p}).', { t: etiqueta(f), F: f3(r.anova.F[k]), p: fp(r.anova.p[k]) })
        : T('{t}: sin evidencia de efecto (F = {F}, p {p}).', { t: etiqueta(f), F: f3(r.anova.F[k]), p: fp(r.anova.p[k]) }));
    });
    conclusiones.push(T('R² = {r}; error estándar {s}; CV = {cv} %.', { r: r.resumen.r2.toFixed(3), s: f3(r.resumen.sigma), cv: r.resumen.cv.toFixed(1) }));
    const filas = r.anova.fuente.map((f, k) => ({ fuente: f === 'Residuales' ? T('Error') : etiqueta(f), gl: r.anova.gl[k], sc: r.anova.sc[k], cm: r.anova.cm[k], F: r.anova.F[k], p: r.anova.p[k] }));
    filas.push({ fuente: T('Total'), gl: r.total.gl, sc: r.total.sc, cm: NaN, F: NaN, p: NaN });
    cuadros.push({ id: 'anova', titulo: T('Análisis de varianza: {f}', { f: r.formula }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'auto4'), col('cm', T('CM'), 'auto4'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')], filas,
      notas: [T('Sumas de cuadrados tipo {t}.', { t: ['', 'I', 'II', 'III'][r.tipoSC] })].concat(r.comoFactor.length ? [T('Numéricas tomadas como factor: {c}.', { c: r.comoFactor.join(', ') })] : []).concat(r.avisos) });
    const c = r.coeficientes;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes'), columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: c.nombre.map((nm, j) => ({ termino: nm === '(Intercepto)' ? T(nm) : nm, b: c.estimado[j], ee: c.ee[j], t: c.t[j], p: c.p[j] })),
      notas: [T('Con contrastes de tratamiento: cada nivel comparado con el primero (como summary(lm) de R).')] });
    for (const m of r.medias) {
      cuadros.push({ id: 'medias-' + m.factor, titulo: T('Medias marginales de «{f}»', { f: m.factor }),
        columnas: [col('nivel', m.factor, 'texto'), col('media', T('Media'), 'sig'), col('ee', T('EE'), 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')],
        filas: m.filas.map(f => ({ nivel: f.nivel, media: f.media, ee: f.ee, ic: f.ic })), notas: m.filas.some(f => !f.estimable) ? [T('«—»: media no estimable.')] : [] });
    }
    return { titulo: T('Modelo lineal general'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoR(e, op) {
    const cf = lista(op.comoFactor), tipo = Number(op.tipoSC || 3);
    const facs = []; try { const form = leerFormula(e.respuesta, op.derecha); for (const v of form.variables) facs.push(v); } catch (err) { /* el código sale igual */ }
    const L = ['# Modelo lineal general (código R equivalente a SigmaPro)', ...cf.map(v => `datos$${q(v)} <- factor(datos$${q(v)})`),
      `modelo <- lm(${q(e.respuesta)} ~ ${String(op.derecha || '').trim()}, data = datos)`, 'summary(modelo)'];
    if (tipo === 1) L.push('anova(modelo)');
    else if (tipo === 2) L.push('car::Anova(modelo, type = 2)');
    else L.push('options(contrasts = c("contr.sum", "contr.poly"))', 'car::Anova(update(modelo), type = 3)', 'options(contrasts = c("contr.treatment", "contr.poly"))');
    L.push('# medias marginales: emmeans::emmeans(modelo, "factor")');
    return L.join('\n');
  }

  SP.metodo({
    id: 'modelo-lineal', familia: 'disenos', motor: 'js', orden: 50, nombre: T('Modelo lineal general (fórmula)'),
    resumen: T('Cualquier modelo lineal escrito como fórmula (factores anidados, interacciones con covariables…), con ANOVA tipo I, II o III y medias marginales.'),
    entradas: { respuesta: { tipo: 'numerica' } },
    opciones: { derecha: { tipo: 'texto', omision: '' }, comoFactor: { tipo: 'lista', omision: [] }, tipoSC: { tipo: 'numero', omision: 3 }, alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar(tabla, e, op) {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      exigir([1, 2, 3].includes(Number(op.tipoSC)), T('El tipo de suma de cuadrados es 1, 2 o 3.'));
      const form = leerFormula(e.respuesta, op.derecha);
      exigir(!form.terminos.some(x => x.variables.includes(e.respuesta)), T('La respuesta no puede estar también del lado derecho.'));
    },
    calcular: analizar, reporte, codigoR,
  });
});
