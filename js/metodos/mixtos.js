/* SigmaPro — modelos lineales mixtos (motor R: lme4 + lmerTest).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Modelo lineal mixto escrito como fórmula, como en lme4: los efectos fijos como en el modelo lineal general y cada
   efecto aleatorio entre paréntesis con su factor de agrupamiento: «hibrido * dosis + (1 | bloque)»,
   «(1 | bloque/parcela)», «Days + (Days | Subject)», «(1 | placa) + (1 | muestra)».
   Da el ANOVA de los efectos fijos (SC tipo III, II o I, con grados de libertad de Satterthwaite o de Kenward-Roger,
   lmerTest), los coeficientes, los componentes de varianza (REML o máxima verosimilitud) y el ajuste. Los avisos de
   lme4 (ajuste singular, falta de convergencia) se muestran traducidos, con el texto original.

   preparar() y leer() son puras: el código R que se manda y la lectura de su salida se prueban en node. */
SP.definir('mixtos', function (SP) {
  'use strict';
  const T = SP.T;
  const M = () => SP.motorR;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const lista = v => [].concat(v || []).filter(Boolean);
  const A = x => (x === null || x === undefined ? [] : Array.isArray(x) ? x : [x]);
  const NOMBRE = /`[^`]*`|[\p{L}_.][\p{L}\p{N}_.]*/gu;
  const nombres = s => (String(s).match(NOMBRE) || []).map(x => (x.startsWith('`') ? x.slice(1, -1) : x)).filter(x => !/^\.?\d/.test(x));

  /** Separa los términos aleatorios «( … | … )» del resto de la fórmula. */
  function separar(derecha) {
    const texto = String(derecha || '').trim(), aleatorios = [];
    let fijos = '', i = 0;
    const saltaComillas = j => { const k = texto.indexOf('`', j + 1); return k < 0 ? texto.length : k; };
    while (i < texto.length) {
      const ch = texto[i];
      if (ch === '`') { const k = saltaComillas(i); fijos += texto.slice(i, k + 1); i = k + 1; continue; }
      if (ch !== '(') { fijos += ch; i++; continue; }
      let prof = 0, j = i, barra = -1;
      for (; j < texto.length; j++) {
        const c = texto[j];
        if (c === '`') { j = saltaComillas(j); continue; }
        if (c === '(') prof++;
        else if (c === ')') { prof--; if (prof === 0) break; }
        else if (c === '|' && prof === 1 && barra < 0) barra = j;
      }
      exigir(j < texto.length, T('Falta cerrar un paréntesis en la fórmula.'));
      if (barra < 0) { fijos += texto.slice(i, j + 1); i = j + 1; continue; }
      const doble = texto[barra + 1] === '|';
      const expr = texto.slice(i + 1, barra).trim(), grupos = texto.slice(barra + (doble ? 2 : 1), j).trim();
      exigir(expr, T('Falta lo que varía en «({t})»: escribe 1 para un intercepto aleatorio, como (1 | bloque).', { t: texto.slice(i + 1, j) }));
      exigir(grupos && nombres(grupos).length, T('Falta el factor de agrupamiento en «({t})», como (1 | bloque).', { t: texto.slice(i + 1, j) }));
      exigir(/^[\s\p{L}\p{N}_.`:/]+$/u.test(grupos), T('El agrupamiento «{g}» solo admite factores unidos con «/» (anidados) o «:».', { g: grupos }));
      aleatorios.push({ expr, grupos, doble, texto: '(' + expr + (doble ? ' || ' : ' | ') + grupos + ')', variables: nombres(expr), agrupan: nombres(grupos) });
      i = j + 1;
    }
    fijos = fijos.replace(/\+(\s*\+)+/g, '+').replace(/^\s*\+\s*/, '').replace(/\s*\+\s*$/, '').trim();
    return { fijos, aleatorios };
  }

  /** Lee y valida el modelo completo contra la tabla. */
  function leerModelo(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta «{r}» debe ser numérica.', { r: e.respuesta }));
    const { fijos, aleatorios } = separar(op.derecha);
    exigir(aleatorios.length, T('El modelo mixto necesita al menos un efecto aleatorio, como (1 | bloque).'), T('Sin efectos aleatorios, usa el modelo lineal general.'));
    const textoFijos = fijos || '1';
    exigir(!nombres(textoFijos).includes(e.respuesta) && !aleatorios.some(a => a.variables.concat(a.agrupan).includes(e.respuesta)),
      T('La respuesta no puede estar también del lado derecho.'));
    const form = SP.modeloLineal.leerFormula(e.respuesta, textoFijos);
    const variables = [...new Set(form.variables.concat(...aleatorios.map(a => a.variables.concat(a.agrupan))))];
    for (const v of variables) {
      exigir(tabla.columnas[v], T('No existe la columna «{c}».', { c: v }), T('Revisa cómo está escrito el nombre (mayúsculas, acentos); los nombres con espacios van entre `comillas invertidas`.'));
      exigir(v !== e.respuesta, T('La respuesta no puede estar también del lado derecho.'));
    }
    const comoFactor = lista(op.comoFactor).filter(v => variables.includes(v) && tabla.col(v).tipo === 'numerica');
    const agrupan = [...new Set(aleatorios.flatMap(a => a.agrupan))];
    const agrupanNum = agrupan.filter(v => tabla.col(v).tipo === 'numerica');
    const aFactor = [...new Set(comoFactor.concat(agrupanNum))];
    const derechaR = (fijos ? [fijos] : ['1']).concat(aleatorios.map(a => a.texto)).join(' + ');
    return { fijos: textoFijos, aleatorios, variables, comoFactor, agrupan, agrupanNum, aFactor, derechaR, terminosFijos: form.terminos.map(x => x.etiqueta) };
  }

  const ddfDe = op => (op.gl === 'kenward-roger' ? 'Kenward-Roger' : 'Satterthwaite');
  const tipoDe = op => ([1, 2, 3].includes(Number(op.tipoSC)) ? Number(op.tipoSC) : 3);

  /** El trabajo para el motor R. */
  function preparar(tabla, e, op) {
    const m = leerModelo(tabla, e, op), R = M(), reml = op.reml !== false, ddf = ddfDe(op);
    const L = ['suppressPackageStartupMessages(library(lmerTest))'];
    for (const v of m.aFactor) L.push('datos[[' + R.textoR(v) + ']] <- factor(datos[[' + R.textoR(v) + ']])');
    L.push('modelo <- lmer(' + R.nombreR(e.respuesta) + ' ~ ' + m.derechaR + ', data = datos, REML = ' + (reml ? 'TRUE' : 'FALSE') + ')');
    L.push('ddf <- ' + R.textoR(ddf),
      's <- summary(modelo, ddf = ddf)',
      'a <- anova(modelo, type = ' + tipoDe(op) + ', ddf = ddf)',
      'cf <- coef(s)',
      'vc <- as.data.frame(VarCorr(modelo))',
      'g <- ngrps(modelo)',
      'list(',
      '  anova = list(termino = rownames(a), sc = a[["Sum Sq"]], cm = a[["Mean Sq"]], gl1 = a[["NumDF"]], gl2 = a[["DenDF"]], F = a[["F value"]], p = a[["Pr(>F)"]]),',
      '  coeficientes = list(nombre = rownames(cf), estimado = unname(cf[, 1]), ee = unname(cf[, 2]), gl = unname(cf[, 3]), t = unname(cf[, 4]), p = unname(cf[, 5])),',
      '  varianzas = list(grupo = vc$grp, var1 = vc$var1, var2 = vc$var2, varianza = vc$vcov, de = vc$sdcor),',
      '  ajuste = list(n = nobs(modelo), reml = isREML(modelo), logLik = as.numeric(logLik(modelo)), AIC = AIC(modelo), BIC = BIC(modelo), singular = isSingular(modelo)),',
      '  grupos = list(nombre = names(g), niveles = unname(as.numeric(g))),',
      '  residuos = unname(residuals(modelo)), ajustados = unname(fitted(modelo)),',
      '  versiones = list(R = paste(R.version$major, R.version$minor, sep = "."), lme4 = as.character(packageVersion("lme4")), lmerTest = as.character(packageVersion("lmerTest")))',
      ')');
    return {
      columnas: [e.respuesta, ...m.variables], codigo: L.join('\n'), paquetes: ddf === 'Kenward-Roger' ? ['pbkrtest'] : [],
      mensaje: T('Ajustando el modelo mixto en el motor R…'),
      arreglo: T('Revisa que cada factor de agrupamiento tenga varios niveles con datos y que haya más observaciones que niveles.'),
    };
  }

  /** Los avisos de lme4, en palabras (con el texto original). */
  function traducir(avisos) {
    return A(avisos).map(a => {
      if (/boundary \(singular\) fit/i.test(a)) return T('Ajuste singular: al menos un componente de varianza quedó en cero (o una correlación en ±1); el modelo pide más efectos aleatorios de los que los datos permiten estimar. Conviene simplificarlo.');
      if (/failed to converge/i.test(a)) return T('El optimizador no convergió del todo (R: «{m}»). Revisa la escala de las variables o simplifica los efectos aleatorios.', { m: a });
      if (/nearly unidentifiable|very large eigenvalue/i.test(a)) return T('El modelo está casi sin identificar (R: «{m}»). Conviene centrar o reescalar las covariables.', { m: a });
      if (/rank deficient/i.test(a)) return T('Algunos coeficientes fijos no se pueden estimar (colineales o celdas vacías) y se quitaron (R: «{m}»).', { m: a });
      return T('Aviso de R: «{m}».', { m: a });
    });
  }

  /** La salida de R → el resultado. */
  function leer(v, avisos, tabla, e, op) {
    const m = leerModelo(tabla, e, op), R = M();
    const an = v.anova || {}, cf = v.coeficientes || {}, vc = v.varianzas || {}, aj = v.ajuste || {}, gr = v.grupos || {};
    const n = Number(aj.n);
    return {
      tipo: 'mixto', respuesta: e.respuesta, formula: R.nombreR(e.respuesta) + ' ~ ' + m.derechaR, fijos: m.fijos,
      aleatorios: m.aleatorios.map(a => a.texto), comoFactor: m.comoFactor, agrupanNum: m.agrupanNum,
      tipoSC: tipoDe(op), gl: ddfDe(op), reml: !!aj.reml, alfa: op.alfa, nivel: op.nivel,
      anova: { termino: A(an.termino), sc: A(an.sc), cm: A(an.cm), gl1: A(an.gl1), gl2: A(an.gl2), F: A(an.F), p: A(an.p) },
      coeficientes: { nombre: A(cf.nombre), estimado: A(cf.estimado), ee: A(cf.ee), gl: A(cf.gl), t: A(cf.t), p: A(cf.p) },
      varianzas: { grupo: A(vc.grupo), var1: A(vc.var1), var2: A(vc.var2), varianza: A(vc.varianza), de: A(vc.de) },
      ajuste: { n, reml: !!aj.reml, logLik: aj.logLik, AIC: aj.AIC, BIC: aj.BIC, singular: !!aj.singular },
      grupos: { nombre: A(gr.nombre), niveles: A(gr.niveles) },
      n, excluidas: tabla.n - n,
      valores: { residuos: A(v.residuos), ajustados: A(v.ajustados) },
      avisos: traducir(avisos), avisosR: A(avisos), versiones: v.versiones || {},
    };
  }

  /* ======================= reporte ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const gl = x => (Number.isFinite(x) ? (Math.abs(x - Math.round(x)) < 1e-6 ? String(Math.round(x)) : x.toFixed(1)) : '—');
  const etiqueta = s => String(s).split(':').join(' × ');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nombreEfecto = (v1, v2) => (v1 === null || v1 === undefined ? '' : v2 === null || v2 === undefined ? (v1 === '(Intercept)' ? T('Intercepto') : v1)
    : T('correlación {a} · {b}', { a: v1 === '(Intercept)' ? T('intercepto') : v1, b: v2 === '(Intercept)' ? T('intercepto') : v2 }));

  /** Proporción de cada componente (solo con interceptos aleatorios: entonces las varianzas se suman). */
  function proporciones(vc) {
    const soloInterceptos = vc.grupo.every((g, k) => g === 'Residual' || (vc.var1[k] === '(Intercept)' && (vc.var2[k] === null || vc.var2[k] === undefined)));
    if (!soloInterceptos) return null;
    const total = vc.varianza.reduce((s, x) => s + x, 0);
    return total > 0 ? vc.varianza.map(x => 100 * x / total) : null;
  }

  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [];
    r.anova.termino.forEach((t, k) => {
      if (!Number.isFinite(r.anova.p[k])) return;
      const stat = { t: etiqueta(t), g1: gl(r.anova.gl1[k]), g2: gl(r.anova.gl2[k]), F: f2(r.anova.F[k]), p: fp(r.anova.p[k]) };
      conclusiones.push(r.anova.p[k] < a ? T('{t}: tiene efecto (F({g1}, {g2}) = {F}, p {p}).', stat) : T('{t}: sin evidencia de efecto (F({g1}, {g2}) = {F}, p {p}).', stat));
    });
    const pct = proporciones(r.varianzas);
    if (pct) {
      const partes = r.varianzas.grupo.map((g, k) => (g === 'Residual' ? T('residual {p} %', { p: pct[k].toFixed(1) }) : T('{g} {p} %', { g, p: pct[k].toFixed(1) })));
      conclusiones.push(T('Variación aleatoria: {l}.', { l: partes.join(', ') }));
    }
    if (r.ajuste.singular) conclusiones.push(T('Ajuste singular: algún componente de varianza quedó en cero.'));

    const notasA = [T('Sumas de cuadrados tipo {t}; grados de libertad de {g}.', { t: ['', 'I', 'II', 'III'][r.tipoSC], g: r.gl })]
      .concat(r.comoFactor.length ? [T('Numéricas tomadas como factor: {c}.', { c: r.comoFactor.join(', ') })] : [])
      .concat(r.agrupanNum.length ? [T('Agrupamientos numéricos tomados como factor: {c}.', { c: r.agrupanNum.join(', ') })] : []);
    cuadros.push({ id: 'anova', titulo: T('Efectos fijos: {f}', { f: r.formula }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl1', T('gl num.'), 'entero'), col('gl2', T('gl den.'), 'forma2'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.anova.termino.map((t, k) => ({ fuente: etiqueta(t), gl1: r.anova.gl1[k], gl2: r.anova.gl2[k], F: r.anova.F[k], p: r.anova.p[k] })),
      notas: notasA.concat(r.avisos) });
    const vc = r.varianzas;
    cuadros.push({ id: 'varianzas', titulo: r.reml ? T('Componentes de varianza (REML)') : T('Componentes de varianza (máxima verosimilitud)'),
      columnas: [col('grupo', T('Grupo'), 'texto'), col('efecto', T('Efecto'), 'texto'), col('varianza', T('Varianza'), 'sig'), col('de', T('DE o correlación'), 'sig')].concat(pct ? [col('pct', T('% del total'), 'forma2')] : []),
      filas: vc.grupo.map((g, k) => {
        const esCor = vc.var2[k] !== null && vc.var2[k] !== undefined;
        return { grupo: g === 'Residual' ? T('Residual') : g, efecto: g === 'Residual' ? '' : nombreEfecto(vc.var1[k], vc.var2[k]), varianza: esCor ? NaN : vc.varianza[k], de: vc.de[k], pct: pct ? pct[k] : NaN };
      }),
      notas: [T('Niveles por grupo: {l}.', { l: r.grupos.nombre.map((g, k) => g + ' ' + r.grupos.niveles[k]).join(', ') })] });
    const c = r.coeficientes;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes de los efectos fijos'),
      columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('gl', 'gl', 'forma2'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: c.nombre.map((nm, j) => ({ termino: nm === '(Intercept)' ? T('(Intercepto)') : nm, b: c.estimado[j], ee: c.ee[j], gl: c.gl[j], t: c.t[j], p: c.p[j] })),
      notas: [T('Con contrastes de tratamiento: cada nivel comparado con el primero (como summary() de lmerTest).')] });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo'),
      columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'sig')],
      filas: [{ medida: T('Observaciones'), valor: r.ajuste.n }, { medida: T('Log-verosimilitud ({m})', { m: r.reml ? 'REML' : 'ML' }), valor: r.ajuste.logLik },
        { medida: 'AIC', valor: r.ajuste.AIC }, { medida: 'BIC', valor: r.ajuste.BIC }],
      notas: r.excluidas > 0 ? [T('{k} filas con datos faltantes quedaron fuera.', { k: r.excluidas })] : [] });
    return { titulo: T('Modelo lineal mixto'), conclusiones: conclusiones.map(may), cuadros };
  }

  function codigoR(e, op) {
    const R = M();
    let m = null;
    try { m = { derechaR: (separar(op.derecha).fijos || '1') + separar(op.derecha).aleatorios.map(a => ' + ' + a.texto).join(''), aFactor: lista(op.comoFactor) }; } catch (err) { /* el código sale igual */ }
    const ddf = ddfDe(op), tipo = tipoDe(op);
    const L = ['# Modelo lineal mixto (código R equivalente a SigmaPro)', 'library(lmerTest)   # carga también lme4'];
    for (const v of (m ? m.aFactor : [])) L.push('datos$' + R.nombreR(v) + ' <- factor(datos$' + R.nombreR(v) + ')');
    L.push('modelo <- lmer(' + R.nombreR(e.respuesta) + ' ~ ' + (m ? m.derechaR : String(op.derecha || '')) + ', data = datos, REML = ' + (op.reml !== false ? 'TRUE' : 'FALSE') + ')',
      'anova(modelo, type = ' + tipo + ', ddf = "' + ddf + '")   # efectos fijos',
      'summary(modelo, ddf = "' + ddf + '")   # coeficientes y componentes de varianza',
      'VarCorr(modelo)');
    return L.join('\n');
  }

  SP.mixtos = { separar, leerModelo, preparar, leer, traducir };

  SP.metodo({
    id: 'modelo-mixto', familia: 'mixtos', motor: 'r', orden: 10, nombre: T('Modelo lineal mixto (fórmula)'),
    resumen: T('Efectos fijos y aleatorios escritos como fórmula, por ejemplo hibrido * dosis + (1 | bloque): ANOVA con grados de libertad de Satterthwaite o Kenward-Roger y componentes de varianza (REML).'),
    paquetes: ['lme4', 'lmerTest'],
    entradas: { respuesta: { tipo: 'numerica' } },
    opciones: { derecha: { tipo: 'texto', omision: '' }, comoFactor: { tipo: 'lista', omision: [] }, tipoSC: { tipo: 'numero', omision: 3 },
      gl: { tipo: 'opcion', omision: 'satterthwaite' }, reml: { tipo: 'logico', omision: true }, alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar(tabla, e, op) {
      leerModelo(tabla, e, op);
      exigir([1, 2, 3].includes(Number(op.tipoSC)), T('El tipo de suma de cuadrados es 1, 2 o 3.'));
      exigir(['satterthwaite', 'kenward-roger'].includes(op.gl), T('Los grados de libertad son de Satterthwaite o de Kenward-Roger.'));
      exigir(!(op.gl === 'kenward-roger' && op.reml === false), T('Kenward-Roger necesita el ajuste por REML.'), T('Elige REML o usa los grados de libertad de Satterthwaite.'));
    },
    preparar, leer, reporte, codigoR,
  });
});
