/* SigmaPro — modelos lineales mixtos (motor R: lme4, lmerTest y emmeans).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Modelo lineal mixto escrito como fórmula, como en lme4: los efectos fijos como en el modelo lineal general y cada
   efecto aleatorio entre paréntesis con su factor de agrupamiento: «hibrido * dosis + (1 | bloque)»,
   «(1 | bloque/parcela)», «Days + (Days | Subject)», «(1 | placa) + (1 | muestra)».
   Da el ANOVA de los efectos fijos (SC tipo III, II o I, con grados de libertad de Satterthwaite o de Kenward-Roger,
   lmerTest), los coeficientes, los componentes de varianza (REML o máxima verosimilitud) y el ajuste; las medias
   marginales de los factores fijos (emmeans, con los mismos gl) y sus comparaciones con letras, también dentro de cada
   nivel de otro factor; la prueba de razón de verosimilitudes de cada efecto aleatorio (ranova); los BLUP con su DE
   condicional; y el semáforo de los supuestos sobre los residuos. Los avisos de lme4 (ajuste singular, falta de
   convergencia) se muestran traducidos, con el texto original.

   Además, cuatro diseños con efectos aleatorios que se piden con un formulario y arman su fórmula: bloques al azar con
   bloques aleatorios, parcelas divididas (y subdivididas), látice y alfa-látice con recuperación de la información
   entre bloques, y ensayos en varias localidades.

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
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const AJUSTES = ['tukey', 'bonferroni', 'holm', 'sidak', 'none'];
  const NOMBRE_AJUSTE = { tukey: 'Tukey', bonferroni: 'Bonferroni', holm: 'Holm', sidak: 'Šidák', none: T('sin ajuste') };
  const MAX_PARES = 50;       // niveles: con más, solo las medias
  const MAX_BLUP = 2000;      // niveles en todos los agrupamientos: con más, sin BLUP

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
    /* factores fijos que entran como efecto principal: los que se pueden comparar */
    const esFactor = v => tabla.col(v).tipo === 'factor' || comoFactor.includes(v);
    const principales = form.terminos.filter(t => t.variables.length === 1 && esFactor(t.variables[0])).map(t => t.variables[0]);
    const enInteraccion = v => form.terminos.some(t => t.variables.length > 1 && t.variables.includes(v));
    return { fijos: textoFijos, aleatorios, variables, comoFactor, agrupan, agrupanNum, aFactor, derechaR, principales, enInteraccion,
      terminosFijos: form.terminos.map(x => x.etiqueta) };
  }

  const ddfDe = op => (op.gl === 'kenward-roger' ? 'Kenward-Roger' : 'Satterthwaite');
  const tipoDe = op => ([1, 2, 3].includes(Number(op.tipoSC)) ? Number(op.tipoSC) : 3);
  const ajusteDe = op => (AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey');
  /** Qué medias se comparan: las pedidas que son efecto principal (sin la de «dentro»), o ninguna. */
  function comparacionesDe(m, op) {
    const dentro = op.dentro && m.principales.includes(op.dentro) ? op.dentro : '';
    const comparar = (op.comparar === undefined ? m.principales.slice(0, 3) : lista(op.comparar)).filter(v => m.principales.includes(v) && v !== dentro);
    return { comparar, dentro: comparar.length ? dentro : '' };
  }
  const vectorR = xs => 'c(' + xs.map(x => M().textoR(x)).join(', ') + ')';

  /** El trabajo para el motor R. */
  function preparar(tabla, e, op) {
    const m = leerModelo(tabla, e, op), R = M(), reml = op.reml !== false, ddf = ddfDe(op);
    const { comparar, dentro } = comparacionesDe(m, op), nivel = Number(op.nivel) || 0.95;
    const L = ['suppressPackageStartupMessages(library(lmerTest))'];
    if (comparar.length) L.push('suppressPackageStartupMessages(library(emmeans))', 'emm_options(msg.interaction = FALSE, msg.nesting = FALSE)');
    for (const v of m.aFactor) L.push('datos[[' + R.textoR(v) + ']] <- factor(datos[[' + R.textoR(v) + ']])');
    L.push('modelo <- lmer(' + R.nombreR(e.respuesta) + ' ~ ' + m.derechaR + ', data = datos, REML = ' + (reml ? 'TRUE' : 'FALSE') + ')');
    L.push('ddf <- ' + R.textoR(ddf),
      's <- summary(modelo, ddf = ddf)',
      'a <- anova(modelo, type = ' + tipoDe(op) + ', ddf = ddf)',
      'cf <- coef(s)',
      'vc <- as.data.frame(VarCorr(modelo))',
      'g <- ngrps(modelo)');
    if (comparar.length) {
      L.push('medias <- lapply(' + vectorR(comparar) + ', function(f) {',
        '  e <- emmeans(modelo, specs = f' + (dentro ? ', by = ' + R.textoR(dentro) : '') + ', lmer.df = ' + R.textoR(ddf.toLowerCase()) + ')',
        '  list(factor = f, medias = as.data.frame(summary(e, level = ' + nivel + ', infer = c(TRUE, FALSE))),',
        '       pares = if (nlevels(datos[[f]]) <= ' + MAX_PARES + ') as.data.frame(pairs(e, adjust = ' + R.textoR(ajusteDe(op)) + ')) else NULL)',
        '})');
    }
    if (op.pruebaAleatorios !== false) L.push('rv <- tryCatch(as.data.frame(ranova(modelo)), error = function(e) NULL)');
    L.push('re <- if (sum(g) <= ' + MAX_BLUP + ') tryCatch(as.data.frame(ranef(modelo, condVar = TRUE)), error = function(e) NULL) else NULL',
      'list(',
      '  anova = list(termino = rownames(a), sc = a[["Sum Sq"]], cm = a[["Mean Sq"]], gl1 = a[["NumDF"]], gl2 = a[["DenDF"]], F = a[["F value"]], p = a[["Pr(>F)"]]),',
      '  coeficientes = list(nombre = rownames(cf), estimado = unname(cf[, 1]), ee = unname(cf[, 2]), gl = unname(cf[, 3]), t = unname(cf[, 4]), p = unname(cf[, 5])),',
      '  varianzas = list(grupo = vc$grp, var1 = vc$var1, var2 = vc$var2, varianza = vc$vcov, de = vc$sdcor),',
      '  ajuste = list(n = nobs(modelo), reml = isREML(modelo), logLik = as.numeric(logLik(modelo)), AIC = AIC(modelo), BIC = BIC(modelo), singular = isSingular(modelo)),',
      '  grupos = list(nombre = names(g), niveles = unname(as.numeric(g))),',
      comparar.length ? '  medias = medias,' : '  medias = NULL,',
      op.pruebaAleatorios !== false
        ? '  ranova = if (is.null(rv)) NULL else list(termino = rownames(rv), npar = rv$npar, logLik = rv$logLik, AIC = rv$AIC, LRT = rv$LRT, gl = rv$Df, p = rv[["Pr(>Chisq)"]]),'
        : '  ranova = NULL,',
      '  blup = if (is.null(re)) NULL else list(grupo = as.character(re$grpvar), termino = as.character(re$term), nivel = as.character(re$grp), valor = re$condval, de = re$condsd),',
      '  filas = as.integer(rownames(model.frame(modelo))),',
      '  residuos = unname(residuals(modelo)), ajustados = unname(fitted(modelo)),',
      '  versiones = list(R = paste(R.version$major, R.version$minor, sep = "."), lme4 = as.character(packageVersion("lme4")), lmerTest = as.character(packageVersion("lmerTest"))' +
        (comparar.length ? ', emmeans = as.character(packageVersion("emmeans"))' : '') + ')',
      ')');
    const paquetes = (comparar.length ? ['emmeans'] : []).concat(ddf === 'Kenward-Roger' ? ['pbkrtest'] : []);
    return {
      columnas: [e.respuesta, ...m.variables], codigo: L.join('\n'), paquetes,
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

  /** Medias marginales de un factor (por grupos de «dentro») con sus pares y letras. */
  function leerMedias(x, dentro, alfa, ajuste) {
    const dm = (x.medias && x.medias.datos) || {}, f = String(x.factor);
    const filas = A(dm[f]).map((niv, i) => ({ nivel: String(niv), por: dentro ? String(A(dm[dentro])[i]) : null, media: A(dm.emmean)[i], ee: A(dm.SE)[i],
      gl: A(dm.df)[i], ic: [A(dm['lower.CL'])[i], A(dm['upper.CL'])[i]], letras: '' }));
    const dp = x.pares && x.pares.datos;
    const pares = dp ? A(dp.contrast).map((c, i) => ({ contraste: String(c), por: dentro ? String(A(dp[dentro])[i]) : null, a: '', b: '', dif: A(dp.estimate)[i], ee: A(dp.SE)[i],
      gl: A(dp.df)[i], t: A(dp['t.ratio'])[i], p: A(dp['p.value'])[i] })) : [];
    /* emmeans da los pares en orden (1-2, 1-3, …, 2-3, …) dentro de cada grupo: con eso se arman las letras */
    for (const g of [...new Set(filas.map(r => r.por))]) {
      const idx = filas.map((r, i) => i).filter(i => filas[i].por === g), pq = pares.filter(p => p.por === g), k = idx.length;
      if (pq.length !== k * (k - 1) / 2 || !pq.length || idx.some(i => !Number.isFinite(filas[i].media))) continue;
      const lst = [];
      let n = 0;
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) { lst.push({ a, b, p_ajustado: pq[n].p }); pq[n].a = filas[idx[a]].nivel; pq[n].b = filas[idx[b]].nivel; n++; }
      const l = SP.np.letrasPorOrden(idx.map(i => filas[i].media), lst, alfa);
      idx.forEach((i, j) => { filas[i].letras = l[j]; });
    }
    return { factor: f, dentro: dentro || null, ajuste, filas, pares, sinPares: !dp };
  }

  /** Supuestos sobre los residuos condicionales y los BLUP (semáforo): pruebas del núcleo, ya validadas contra R. */
  function diagnostico(tabla, m, res, filas, blup) {
    const out = { normalidad: null, normalidadBlup: null, varianzas: null };
    const ok = res.filter(Number.isFinite);
    try { if (ok.length >= 3 && ok.length <= 5000) out.normalidad = SP.sup.shapiro(ok); } catch (e) { /* sin prueba */ }
    if (blup && blup.grupo.length) {
      const g0 = blup.grupo[0], vs = blup.valor.filter((v, i) => blup.grupo[i] === g0 && blup.termino[i] === '(Intercept)');
      try { if (vs.length >= 5) out.normalidadBlup = Object.assign(SP.sup.shapiro(vs), { grupo: g0 }); } catch (e) { /* sin prueba */ }
    }
    const f = m.principales[0];
    if (f && filas.length === res.length) {
      try {
        const col = m.comoFactor.includes(f) ? SP.estructura.comoFactor(tabla, f) : tabla.col(f);
        const g = Int32Array.from(filas, i => col.codigos[i - 1]);
        out.varianzas = Object.assign(SP.sup.levene(Float64Array.from(res), g), { factor: f });
      } catch (e) { /* sin prueba */ }
    }
    return out;
  }

  /** La salida de R → el resultado. */
  function leer(v, avisos, tabla, e, op) {
    const m = leerModelo(tabla, e, op), R = M(), { dentro } = comparacionesDe(m, op), alfa = Number(op.alfa) || 0.05;
    const an = v.anova || {}, cf = v.coeficientes || {}, vc = v.varianzas || {}, aj = v.ajuste || {}, gr = v.grupos || {}, rv = v.ranova, bl = v.blup;
    const n = Number(aj.n), residuos = A(v.residuos), filas = A(v.filas);
    const blup = bl ? { grupo: A(bl.grupo), termino: A(bl.termino), nivel: A(bl.nivel), valor: A(bl.valor), de: A(bl.de) } : null;
    return {
      tipo: 'mixto', respuesta: e.respuesta, formula: R.nombreR(e.respuesta) + ' ~ ' + m.derechaR, fijos: m.fijos,
      aleatorios: m.aleatorios.map(a => a.texto), comoFactor: m.comoFactor, agrupanNum: m.agrupanNum,
      tipoSC: tipoDe(op), gl: ddfDe(op), reml: !!aj.reml, alfa, nivel: Number(op.nivel) || 0.95,
      anova: { termino: A(an.termino), sc: A(an.sc), cm: A(an.cm), gl1: A(an.gl1), gl2: A(an.gl2), F: A(an.F), p: A(an.p) },
      coeficientes: { nombre: A(cf.nombre), estimado: A(cf.estimado), ee: A(cf.ee), gl: A(cf.gl), t: A(cf.t), p: A(cf.p) },
      varianzas: { grupo: A(vc.grupo), var1: A(vc.var1), var2: A(vc.var2), varianza: A(vc.varianza), de: A(vc.de) },
      ajuste: { n, reml: !!aj.reml, logLik: aj.logLik, AIC: aj.AIC, BIC: aj.BIC, singular: !!aj.singular },
      grupos: { nombre: A(gr.nombre), niveles: A(gr.niveles) },
      medias: A(v.medias).map(x => leerMedias(x, dentro, alfa, ajusteDe(op))).map(x => Object.assign(x, { enInteraccion: !dentro && m.enInteraccion(x.factor) })),
      ranova: rv ? { termino: A(rv.termino), npar: A(rv.npar), logLik: A(rv.logLik), AIC: A(rv.AIC), LRT: A(rv.LRT), gl: A(rv.gl), p: A(rv.p) } : null,
      blup,
      supuestos: diagnostico(tabla, m, residuos, filas, blup),
      n, excluidas: tabla.n - n,
      valores: { residuos, ajustados: A(v.ajustados) },
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
  const colorP = (p, alfa) => (SP.sup && SP.sup.color ? SP.sup.color(p, alfa) : 'gris');

  /** Proporción de cada componente (solo con interceptos aleatorios: entonces las varianzas se suman). */
  function proporciones(vc) {
    const soloInterceptos = vc.grupo.every((g, k) => g === 'Residual' || (vc.var1[k] === '(Intercept)' && (vc.var2[k] === null || vc.var2[k] === undefined)));
    if (!soloInterceptos) return null;
    const total = vc.varianza.reduce((s, x) => s + x, 0);
    return total > 0 ? vc.varianza.map(x => 100 * x / total) : null;
  }

  /** Semáforo de los supuestos y qué hacer. */
  function semaforo(r) {
    const s = r.supuestos || {}, a = 0.05, out = [], rec = [];
    if (s.normalidad) out.push({ nombre: T('Normalidad de los residuos'), color: colorP(s.normalidad.p, a), texto: T('Shapiro-Wilk W = {w}, p {p}.', { w: s.normalidad.W.toFixed(3), p: fp(s.normalidad.p) }) });
    else out.push({ nombre: T('Normalidad de los residuos'), color: 'gris', texto: T('Sin prueba (se necesitan entre 3 y 5000 residuos); revisa el gráfico Q-Q.') });
    if (s.normalidadBlup) out.push({ nombre: T('Normalidad de los efectos aleatorios'), color: colorP(s.normalidadBlup.p, a), texto: T('BLUP de {g}: Shapiro-Wilk W = {w}, p {p}.', { g: s.normalidadBlup.grupo, w: s.normalidadBlup.W.toFixed(3), p: fp(s.normalidadBlup.p) }) });
    if (s.varianzas) out.push({ nombre: T('Varianzas iguales'), color: colorP(s.varianzas.p, a), texto: T('Levene (mediana) de los residuos entre niveles de {f}: F = {F}, p {p}.', { f: s.varianzas.factor, F: f2(s.varianzas.F), p: fp(s.varianzas.p) }) });
    const singular = r.ajuste.singular || r.avisosR.some(x => /singular/i.test(x));
    out.push({ nombre: T('Ajuste del modelo'), color: singular || r.avisosR.some(x => /converge|unidentifiable/i.test(x)) ? 'ambar' : 'verde',
      texto: singular ? T('Ajuste singular: algún componente de varianza quedó en cero.') : r.avisosR.some(x => /converge/i.test(x)) ? T('El optimizador avisó que no convergió del todo.') : T('Sin avisos del optimizador.') });
    if (out.some(x => x.nombre === T('Normalidad de los residuos') && x.color !== 'verde' && x.color !== 'gris') || (s.varianzas && s.varianzas.p < a))
      rec.push(T('Prueba una transformación de la respuesta (bloque Datos → Transformar: logaritmo o Box-Cox) y vuelve a ajustar.'));
    if (singular) rec.push(T('Quita el efecto aleatorio cuya varianza quedó en cero o simplifica su estructura (por ejemplo, sin correlación: || ).'));
    return { semaforo: out, recomendaciones: rec };
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
    for (const md of r.medias || []) {
      if (md.dentro) continue;
      const orden = md.filas.filter(f => Number.isFinite(f.media)).sort((x, y) => y.media - x.media);
      if (!orden.length) continue;
      const grupos = new Set(md.filas.map(f => f.letras).join('').split('').filter(Boolean)).size;
      conclusiones.push(T('{f}: la media más alta es {n} ({m}){g}.', { f: md.factor, n: orden[0].nivel, m: f2(orden[0].media),
        g: !md.pares.length || !grupos ? '' : grupos === 1 ? T('; ninguna difiere de las demás ({a}, α = {al})', { a: NOMBRE_AJUSTE[md.ajuste], al: a })
          : T('; {k} grupos de letras ({a}, α = {al})', { k: grupos, a: NOMBRE_AJUSTE[md.ajuste], al: a }) }));
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
    if (r.ranova && r.ranova.termino.length > 1) {
      const rv = r.ranova;
      cuadros.push({ id: 'aleatorios', titulo: T('Prueba de los efectos aleatorios (razón de verosimilitudes)'),
        columnas: [col('termino', T('Modelo sin…'), 'texto'), col('npar', T('Parámetros'), 'entero'), col('logLik', T('Log-verosimilitud'), 'sig'), col('AIC', 'AIC', 'sig'), col('LRT', 'LRT', 'forma2'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor')],
        filas: rv.termino.map((t, k) => ({ termino: t === '<none>' ? T('(modelo completo)') : t, npar: rv.npar[k], logLik: rv.logLik[k], AIC: rv.AIC[k], LRT: rv.LRT[k], gl: rv.gl[k], p: rv.p[k] })),
        notas: [T('Cada fila quita un efecto aleatorio (o lo reduce a su intercepto) y lo compara con el modelo completo (lmerTest::ranova). Como la varianza no puede ser negativa, este p es conservador: el verdadero suele ser la mitad.')] });
    }
    for (const md of r.medias || []) {
      const conLetras = md.filas.some(f => f.letras);
      cuadros.push({ id: 'medias-' + md.factor, titulo: md.dentro ? T('Medias de «{f}» dentro de cada nivel de «{d}»', { f: md.factor, d: md.dentro }) : T('Medias marginales de «{f}»', { f: md.factor }),
        columnas: (md.dentro ? [col('por', md.dentro, 'texto')] : []).concat([col('nivel', md.factor, 'texto'), col('media', T('Media'), 'sig'), col('ee', T('EE'), 'sig'), col('gl', 'gl', 'forma2'),
          col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')]).concat(conLetras ? [col('letras', T('Grupo'), 'texto')] : []),
        filas: md.filas.map(f => ({ por: f.por, nivel: f.nivel, media: f.media, ee: f.ee, gl: f.gl, ic: f.ic, letras: f.letras })),
        notas: [T('Medias marginales estimadas (emmeans) con grados de libertad de {g}.', { g: r.gl })]
          .concat(conLetras ? [T('Medias con la misma letra no difieren según {a} (α = {al}).', { a: NOMBRE_AJUSTE[md.ajuste], al: r.alfa })] : [])
          .concat(md.enInteraccion ? [T('«{f}» interactúa con otro factor: estas medias promedian sobre sus niveles; para comparar dentro de cada nivel usa «Dentro de cada nivel de».', { f: md.factor })] : [])
          .concat(md.sinPares ? [T('Con más de {k} niveles solo se dan las medias.', { k: MAX_PARES })] : []) });
      if (md.pares.length && md.pares.length <= 45) {
        cuadros.push({ id: 'pares-' + md.factor, titulo: T('Comparaciones por pares de «{f}» ({a})', { f: md.factor, a: NOMBRE_AJUSTE[md.ajuste] }),
          columnas: (md.dentro ? [col('por', md.dentro, 'texto')] : []).concat([col('contraste', T('Contraste'), 'texto'), col('dif', T('Diferencia'), 'sig'), col('ee', T('EE'), 'sig'),
            col('gl', 'gl', 'forma2'), col('t', 't', 'forma2'), col('p', T('p ajustado'), 'pvalor')]),
          filas: md.pares.map(p => ({ por: p.por, contraste: p.contraste, dif: p.dif, ee: p.ee, gl: p.gl, t: p.t, p: p.p })), notas: [] });
      }
    }
    const c = r.coeficientes;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes de los efectos fijos'),
      columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('gl', 'gl', 'forma2'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: c.nombre.map((nm, j) => ({ termino: nm === '(Intercept)' ? T('(Intercepto)') : nm, b: c.estimado[j], ee: c.ee[j], gl: c.gl[j], t: c.t[j], p: c.p[j] })),
      notas: [T('Con contrastes de tratamiento: cada nivel comparado con el primero (como summary() de lmerTest).')]
        .concat(r.blup && r.blup.grupo.length > 120 ? [T('Las predicciones de los efectos aleatorios (BLUP) no se muestran: son {n} renglones (el cuadro llega hasta 120). El código R las da con ranef().', { n: r.blup.grupo.length })] : []) });
    if (r.blup && r.blup.grupo.length && r.blup.grupo.length <= 120) {
      const b = r.blup;
      cuadros.push({ id: 'blup', titulo: T('Predicciones de los efectos aleatorios (BLUP)'),
        columnas: [col('grupo', T('Grupo'), 'texto'), col('nivel', T('Nivel'), 'texto'), col('efecto', T('Efecto'), 'texto'), col('valor', 'BLUP', 'sig'), col('de', T('DE condicional'), 'sig')],
        filas: b.grupo.map((g, k) => ({ grupo: g, nivel: b.nivel[k], efecto: b.termino[k] === '(Intercept)' ? T('Intercepto') : b.termino[k], valor: b.valor[k], de: b.de[k] })),
        notas: [T('Desvío de cada nivel respecto de la media general, encogido hacia cero según cuánta información aporta.')] });
    }
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo'),
      columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'sig')],
      filas: [{ medida: T('Observaciones'), valor: r.ajuste.n }, { medida: T('Log-verosimilitud ({m})', { m: r.reml ? 'REML' : 'ML' }), valor: r.ajuste.logLik },
        { medida: 'AIC', valor: r.ajuste.AIC }, { medida: 'BIC', valor: r.ajuste.BIC }],
      notas: r.excluidas > 0 ? [T('{k} filas con datos faltantes quedaron fuera.', { k: r.excluidas })] : [] });
    return Object.assign({ titulo: T('Modelo lineal mixto'), conclusiones: conclusiones.map(may), cuadros }, semaforo(r));
  }

  function codigoR(e, op) {
    const R = M();
    let sep = null;
    try { sep = separar(op.derecha); } catch (err) { /* el código sale igual */ }
    const derecha = sep ? (sep.fijos || '1') + sep.aleatorios.map(a => ' + ' + a.texto).join('') : String(op.derecha || '');
    const ddf = ddfDe(op), tipo = tipoDe(op), comparar = lista(op.comparar), dentro = op.dentro || '';
    const L = ['# Modelo lineal mixto (código R equivalente a SigmaPro)', 'library(lmerTest)   # carga también lme4'];
    for (const v of lista(op.comoFactor)) L.push('datos$' + R.nombreR(v) + ' <- factor(datos$' + R.nombreR(v) + ')');
    L.push('modelo <- lmer(' + R.nombreR(e.respuesta) + ' ~ ' + derecha + ', data = datos, REML = ' + (op.reml !== false ? 'TRUE' : 'FALSE') + ')',
      'anova(modelo, type = ' + tipo + ', ddf = "' + ddf + '")   # efectos fijos',
      'summary(modelo, ddf = "' + ddf + '")   # coeficientes y componentes de varianza',
      'VarCorr(modelo)',
      'ranova(modelo)   # prueba de cada efecto aleatorio',
      'ranef(modelo, condVar = TRUE)   # BLUP');
    if (comparar.length) {
      L.push('library(emmeans)');
      for (const f of comparar) {
        L.push('medias <- emmeans(modelo, ' + R.textoR(f) + (dentro && dentro !== f ? ', by = ' + R.textoR(dentro) : '') + ', lmer.df = "' + ddf.toLowerCase() + '")',
          'medias', 'pairs(medias, adjust = "' + ajusteDe(op) + '")');
      }
    }
    return L.join('\n');
  }

  const nucleo = { separar, leerModelo, preparar, leer, traducir, reporte, codigoR, comparacionesDe, leerMedias, AJUSTES, NOMBRE_AJUSTE };
  SP.mixtos = nucleo;

  const OPCIONES = { derecha: { tipo: 'texto', omision: '' }, comoFactor: { tipo: 'lista', omision: [] }, tipoSC: { tipo: 'numero', omision: 3 },
    gl: { tipo: 'opcion', omision: 'satterthwaite' }, reml: { tipo: 'logico', omision: true }, comparar: { tipo: 'lista', omision: undefined }, dentro: { tipo: 'texto', omision: '' },
    ajuste: { tipo: 'opcion', omision: 'tukey' }, pruebaAleatorios: { tipo: 'logico', omision: true }, alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } };
  function validarOpciones(op) {
    exigir([1, 2, 3].includes(Number(op.tipoSC)), T('El tipo de suma de cuadrados es 1, 2 o 3.'));
    exigir(['satterthwaite', 'kenward-roger'].includes(op.gl), T('Los grados de libertad son de Satterthwaite o de Kenward-Roger.'));
    exigir(!(op.gl === 'kenward-roger' && op.reml === false), T('Kenward-Roger necesita el ajuste por REML.'), T('Elige REML o usa los grados de libertad de Satterthwaite.'));
    exigir(AJUSTES.includes(op.ajuste), T('El ajuste de las comparaciones es Tukey, Bonferroni, Holm, Šidák o ninguno.'));
  }

  SP.metodo({
    id: 'modelo-mixto', familia: 'mixtos', motor: 'r', orden: 10, nombre: T('Modelo lineal mixto (fórmula)'),
    resumen: T('Efectos fijos y aleatorios escritos como fórmula, por ejemplo hibrido * dosis + (1 | bloque): ANOVA con grados de libertad de Satterthwaite o Kenward-Roger, componentes de varianza, medias marginales con letras y BLUP.'),
    paquetes: ['lme4', 'lmerTest'],
    entradas: { respuesta: { tipo: 'numerica' } },
    opciones: OPCIONES,
    validar(tabla, e, op) { leerModelo(tabla, e, op); validarOpciones(op); },
    preparar, leer, reporte, codigoR,
  });

  /* ======================= diseños con efectos aleatorios ======================= */
  /* Cada diseño arma la fórmula del modelo mixto con sus papeles y usa el mismo cálculo, reporte y código. */
  const factoresNumericos = (tabla, vs) => vs.filter(v => v && tabla.columnas[v] && tabla.col(v).tipo === 'numerica');
  function exigirColumna(tabla, v, papel) {
    exigir(v, T('Elige la columna de {p}.', { p: papel }));
    exigir(tabla.columnas[v], T('No existe la columna «{c}».', { c: v }));
  }
  function exigirDistintas(vs) {
    const xs = vs.filter(Boolean);
    exigir(new Set(xs).size === xs.length, T('Cada papel del diseño necesita una columna distinta.'));
  }
  const DISENOS = {
    'mixto-bloques': {
      orden: 20, nombre: T('Bloques al azar con bloques aleatorios'),
      resumen: T('Uno a tres factores de tratamiento en bloques completos, con los bloques como efecto aleatorio: con parcelas perdidas recupera la información entre bloques.'),
      entradas: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+' }, bloque: { tipo: 'factor' } },
      validar(tabla, e) {
        const ts = lista(e.tratamientos);
        exigir(ts.length >= 1 && ts.length <= 3, T('Elige de uno a tres factores de tratamiento.'));
        ts.forEach(t => exigirColumna(tabla, t, T('tratamiento'))); exigirColumna(tabla, e.bloque, T('bloques'));
        exigirDistintas([e.respuesta, ...ts, e.bloque]);
      },
      formula: e => lista(e.tratamientos).map(q).join(' * ') + ' + (1 | ' + q(e.bloque) + ')',
      comparar: e => lista(e.tratamientos),
      tratamientos: e => lista(e.tratamientos),
    },
    'mixto-divididas': {
      orden: 30, nombre: T('Parcelas divididas (modelo mixto)'),
      resumen: T('Un factor en parcelas grandes y otro en subparcelas (y, si se pide, un tercero en sub-subparcelas), con bloques y parcelas como efectos aleatorios.'),
      entradas: { respuesta: { tipo: 'numerica' }, parcelaGrande: { tipo: 'factor' }, subparcela: { tipo: 'factor' }, subsubparcela: { tipo: 'factor' }, bloque: { tipo: 'factor' }, repeticion: { tipo: 'factor' } },
      validar(tabla, e) {
        exigirColumna(tabla, e.parcelaGrande, T('la parcela grande')); exigirColumna(tabla, e.subparcela, T('la subparcela'));
        if (e.subsubparcela) exigirColumna(tabla, e.subsubparcela, T('la sub-subparcela'));
        exigir(e.bloque || e.repeticion, T('Elige la columna de bloques o, si las parcelas grandes se sortearon sin bloques, la de repetición.'));
        if (e.bloque) exigirColumna(tabla, e.bloque, T('bloques')); else exigirColumna(tabla, e.repeticion, T('repetición'));
        exigirDistintas([e.respuesta, e.parcelaGrande, e.subparcela, e.subsubparcela, e.bloque || e.repeticion]);
      },
      formula(e) {
        const A = q(e.parcelaGrande), B = q(e.subparcela), C = e.subsubparcela ? q(e.subsubparcela) : '';
        const fijos = [A, B, C].filter(Boolean).join(' * ');
        if (e.bloque) {
          const b = q(e.bloque);
          return fijos + ' + (1 | ' + b + ') + (1 | ' + b + ':' + A + ')' + (C ? ' + (1 | ' + b + ':' + A + ':' + B + ')' : '');
        }
        const r = q(e.repeticion);
        return fijos + ' + (1 | ' + A + ':' + r + ')' + (C ? ' + (1 | ' + A + ':' + r + ':' + B + ')' : '');
      },
      comparar: e => [e.parcelaGrande, e.subparcela, e.subsubparcela].filter(Boolean),
      tratamientos: e => [e.parcelaGrande, e.subparcela, e.subsubparcela].filter(Boolean),
    },
    'mixto-latice': {
      orden: 40, nombre: T('Látice y alfa-látice (recuperación entre bloques)'),
      resumen: T('Bloques incompletos dentro de repeticiones, con los bloques aleatorios: las medias de los tratamientos recuperan la información entre bloques (REML).'),
      entradas: { respuesta: { tipo: 'numerica' }, tratamiento: { tipo: 'factor' }, repeticion: { tipo: 'factor' }, bloque: { tipo: 'factor' } },
      validar(tabla, e) {
        exigirColumna(tabla, e.tratamiento, T('tratamiento')); exigirColumna(tabla, e.repeticion, T('repetición')); exigirColumna(tabla, e.bloque, T('bloque incompleto'));
        exigirDistintas([e.respuesta, e.tratamiento, e.repeticion, e.bloque]);
      },
      formula: (e, op) => q(e.tratamiento) + (op.repeticionAleatoria ? ' + (1 | ' + q(e.repeticion) + ')' : ' + ' + q(e.repeticion)) + ' + (1 | ' + q(e.repeticion) + ':' + q(e.bloque) + ')',
      comparar: e => [e.tratamiento],
      tratamientos: e => [e.tratamiento],
    },
    'mixto-localidades': {
      orden: 50, nombre: T('Ensayos en varias localidades'),
      resumen: T('Genotipos (fijos) evaluados en varias localidades con repeticiones: localidad, repetición dentro de localidad y la interacción genotipo × localidad como efectos aleatorios.'),
      entradas: { respuesta: { tipo: 'numerica' }, genotipo: { tipo: 'factor' }, localidad: { tipo: 'factor' }, repeticion: { tipo: 'factor' } },
      validar(tabla, e) {
        exigirColumna(tabla, e.genotipo, T('genotipo')); exigirColumna(tabla, e.localidad, T('localidad')); exigirColumna(tabla, e.repeticion, T('repetición'));
        exigirDistintas([e.respuesta, e.genotipo, e.localidad, e.repeticion]);
      },
      formula(e, op) {
        const G = q(e.genotipo), L = q(e.localidad), R = q(e.repeticion);
        return op.localidadFija ? G + ' * ' + L + ' + (1 | ' + L + ':' + R + ')' : G + ' + (1 | ' + L + ') + (1 | ' + L + ':' + R + ') + (1 | ' + G + ':' + L + ')';
      },
      comparar: e => [e.genotipo],
      tratamientos: (e, op) => (op.localidadFija ? [e.genotipo, e.localidad] : [e.genotipo]),
    },
  };
  /** Las opciones del modelo mixto que corresponden a un diseño: su fórmula, qué comparar y los tratamientos numéricos como factor. */
  function opcionesDiseno(id, tabla, e, op) {
    const d = DISENOS[id], o = Object.assign({}, op);
    o.derecha = d.formula(e, op);
    o.comparar = op.comparar === undefined || !lista(op.comparar).length ? d.comparar(e, op) : lista(op.comparar);
    o.comoFactor = tabla ? factoresNumericos(tabla, d.tratamientos(e, op)) : lista(op.comoFactor);
    return o;
  }
  const OPCIONES_DIS = Object.assign({}, OPCIONES, { repeticionAleatoria: { tipo: 'logico', omision: false }, localidadFija: { tipo: 'logico', omision: false } });
  delete OPCIONES_DIS.derecha;
  delete OPCIONES_DIS.comoFactor;
  for (const [id, d] of Object.entries(DISENOS)) {
    SP.metodo({
      id, familia: 'mixtos', motor: 'r', orden: d.orden, nombre: d.nombre, resumen: d.resumen,
      paquetes: ['lme4', 'lmerTest'], entradas: d.entradas, opciones: OPCIONES_DIS,
      validar(tabla, e, op) {
        exigirColumna(tabla, e.respuesta, T('respuesta'));
        d.validar(tabla, e);
        const o = opcionesDiseno(id, tabla, e, op);
        leerModelo(tabla, { respuesta: e.respuesta }, o);
        validarOpciones(o);
      },
      preparar: (tabla, e, op) => preparar(tabla, { respuesta: e.respuesta }, opcionesDiseno(id, tabla, e, op)),
      leer: (v, av, tabla, e, op) => Object.assign(leer(v, av, tabla, { respuesta: e.respuesta }, opcionesDiseno(id, tabla, e, op)), { diseno: id, papeles: Object.assign({}, e) }),
      reporte: r => Object.assign(reporte(r), { titulo: d.nombre }),
      codigoR(e, op, ctx) {
        const o = opcionesDiseno(id, null, e, op);
        if (ctx && ctx.resultado && Array.isArray(ctx.resultado.comoFactor)) o.comoFactor = ctx.resultado.comoFactor;
        else if (ctx && Array.isArray(ctx.factoresNumericos)) o.comoFactor = d.tratamientos(e, op).filter(v => ctx.factoresNumericos.includes(v));
        return codigoR({ respuesta: e.respuesta }, o);
      },
    });
  }
  SP.mixtos.DISENOS = DISENOS;
  SP.mixtos.opcionesDiseno = opcionesDiseno;
});
