/* SigmaPro — modelos lineales generalizados mixtos (familia Modelos lineales generalizados), en el motor R.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Conteos o proporciones con efectos aleatorios (bloques, parcelas, localidades) por aproximación de Laplace con
   lme4::glmer (binomial y Poisson) o glmer.nb (binomial negativa), con el control estricto (bobyqa con rhoend = 1e-12
   y tolPwrss = 1e-12): con el de omisión glmer se queda hasta 1e-5 del óptimo. La sobredispersión se modela con un
   efecto aleatorio por observación (Harrison 2014): «sí», «no» o «automática» (si la prueba de Pearson del modelo sin
   él da p < 0.05; solo con conteos o proporciones agrupadas). Da las pruebas χ² de Wald de los efectos fijos
   (car::Anova tipo II, o III con contrastes de suma cero reajustado desde las θ del modelo), los coeficientes con sus
   EE (de la hessiana por diferencias finitas, lo de omisión de lme4; en la binomial negativa, de RX, que es lo que da
   lme4 2.0: la 1.1 usaba la hessiana) y sus
   razones de momios o de tasas, las varianzas de los efectos aleatorios, el ajuste y las medias en la escala de la
   respuesta con sus pares y letras (emmeans, con offset = 0: tasas por unidad de exposición).
   Dos métodos: glmm-bloques (tratamientos en bloques aleatorios, desde un formulario) y glmm (desde una fórmula con
   términos aleatorios, como el modelo lineal mixto). */
SP.definir('glmm', function (SP) {
  'use strict';
  const T = SP.T;
  const M = () => SP.motorR, X = () => SP.mixtos;
  const { exp, sqrt, abs } = Math;
  const A = x => (x === null || x === undefined ? [] : Array.isArray(x) ? x : [x]);
  const lista = v => [].concat(v || []).filter(Boolean);
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const FAMILIAS = ['poisson', 'binomial', 'binomial-negativa'];
  const MAX_PARES = 50;
  const enlaceDe = op => op.enlace || SP.glm.ENLACE_OMISION[op.familia];
  const agrupada = (e, op) => op.familia === 'poisson' || (op.familia === 'binomial' && !!e.ensayos);
  const olreDe = (e, op) => (agrupada(e, op) ? (['si', 'no', 'auto'].includes(op.sobredispersion) ? op.sobredispersion : 'auto') : 'no');
  const tipoDe = op => (Number(op.tipo) === 3 ? 3 : 2);
  const CTL = 'ctl <- glmerControl(optimizer = "bobyqa", tolPwrss = 1e-12, optCtrl = list(rhobeg = 0.2, rhoend = 1e-12, maxfun = 1e5))';

  /** Lado izquierdo, desplazamiento y factores fijos del modelo. */
  function partes(tabla, e, op) {
    const m = X().leerModelo(tabla, e, op), R = M();
    const izq = e.ensayos ? `cbind(${R.nombreR(e.respuesta)}, ${R.nombreR(e.ensayos)} - ${R.nombreR(e.respuesta)})` : R.nombreR(e.respuesta);
    const off = e.exposicion ? ` + offset(log(${R.nombreR(e.exposicion)}))` : '';
    const vfijas = SP.modeloLineal.leerFormula(e.respuesta, m.fijos).variables;
    const fx = vfijas.filter(v => tabla.col(v).tipo === 'factor' || m.comoFactor.includes(v));
    return { m, izq, off, fx };
  }

  function validar(tabla, e, op) {
    exigir(FAMILIAS.includes(op.familia), T('Familia no válida para el modelo mixto generalizado: {f}.', { f: op.familia }), T('Usa binomial, Poisson o binomial negativa.'));
    exigir(SP.glm.FAMILIAS[op.familia].enlaces.includes(enlaceDe(op)), T('El enlace {e} no es de la familia {f}.', { e: enlaceDe(op), f: op.familia }));
    if (e.ensayos) exigir(op.familia === 'binomial', T('La columna de ensayos solo se usa con la familia binomial.'));
    if (e.exposicion) exigir(op.familia !== 'binomial', T('La exposición solo se usa con conteos (Poisson o binomial negativa).'));
    exigir([2, 3].includes(Number(op.tipo)), T('Las pruebas de Wald son de tipo II o III.'));
    const { m } = partes(tabla, e, op);
    for (const k of ['ensayos', 'exposicion']) if (e[k]) { exigir(tabla.columnas[e[k]], T('No existe la columna «{c}».', { c: e[k] })); exigir(tabla.col(e[k]).tipo === 'numerica', T('«{c}» debe ser numérica.', { c: e[k] })); exigir(!m.variables.includes(e[k]) && e[k] !== e.respuesta, T('«{c}» está en dos papeles a la vez.', { c: e[k] })); }
    /* la respuesta debe valer para la familia, en las filas que entran */
    const y = tabla.col(e.respuesta).valores, n = e.ensayos ? tabla.col(e.ensayos).valores : null, ex = e.exposicion ? tabla.col(e.exposicion).valores : null;
    for (let i = 0; i < tabla.n; i++) {
      const v = y[i];
      if (v !== v || (n && n[i] !== n[i]) || (ex && ex[i] !== ex[i])) continue;
      exigir(v >= 0 && Number.isInteger(v), op.familia === 'binomial' && !n ? T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }) : T('«{r}» debe ser un conteo (entero, sin negativos).', { r: e.respuesta }));
      if (op.familia === 'binomial') exigir(n ? n[i] > 0 && v <= n[i] : v <= 1, n ? T('Los éxitos de «{r}» deben ir entre 0 y los ensayos.', { r: e.respuesta }) : T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }),
        n ? '' : T('Si son conteos de éxitos (germinadas de 50), elige también la columna de ensayos.'));
      if (ex) exigir(ex[i] > 0, T('La exposición «{c}» debe ser positiva (área o tiempo muestreado).', { c: e.exposicion }));
    }
  }

  /** El trabajo para el motor R. */
  function preparar(tabla, e, op) {
    const { m, izq, off, fx } = partes(tabla, e, op), R = M(), fam = op.familia, enl = SP.glm.NOMBRE_ENLACE[enlaceDe(op)], olre = olreDe(e, op), tipo = tipoDe(op);
    const { comparar, dentro } = X().comparacionesDe(m, op), nivel = Number(op.nivel) || 0.95, aj = X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey';
    /* car se carga en silencio: al cargarse avisa que reemplaza na.action.merMod de lme4 */
    const L = ['suppressPackageStartupMessages(library(lme4))', 'suppressPackageStartupMessages(requireNamespace("car"))'];
    if (comparar.length) L.push('suppressPackageStartupMessages(library(emmeans))', 'emm_options(msg.interaction = FALSE, msg.nesting = FALSE)');
    for (const v of m.aFactor) L.push('datos[[' + R.textoR(v) + ']] <- factor(datos[[' + R.textoR(v) + ']])');
    L.push('datos$.obs <- factor(seq_len(nrow(datos)))', CTL,
      fam === 'binomial-negativa'
        ? 'ajusta <- function(f, contrastes = NULL, start = NULL) glmer.nb(f, data = datos, control = ctl, contrasts = contrastes)'
        : `ajusta <- function(f, contrastes = NULL, start = NULL) glmer(f, family = ${fam}(link = "${enl}"), data = datos, control = ctl, contrasts = contrastes, start = start)`,
      'forma <- function(obs) as.formula(paste(' + R.textoR(izq + ' ~ ' + m.derechaR) + ', if (obs) "+ (1 | .obs)" else "", ' + R.textoR(off) + '))',
      'prueba <- NULL', 'usaObs <- ' + (olre === 'si' ? 'TRUE' : 'FALSE'));
    if (olre === 'auto') L.push('m0 <- ajusta(forma(FALSE))', 'pr0 <- sum(residuals(m0, type = "pearson")^2); gl0 <- df.residual(m0)',
      'prueba <- list(razon = pr0 / gl0, p = pchisq(pr0, gl0, lower.tail = FALSE))', 'usaObs <- prueba$p < 0.05');
    L.push('f <- forma(usaObs)', 'modelo <- ajusta(f)');
    /* EE: la hessiana (lo de omisión de lme4), salvo con la binomial negativa o un ajuste singular, que van con RX: es lo que hace
       lme4 2.0 (no calcula la hessiana ahí) y en la frontera la hessiana por diferencias finitas no es confiable */
    L.push('vc_ <- function(x) as.matrix(if (' + (fam === 'binomial-negativa' ? 'TRUE' : 'isSingular(x)') + ') suppressWarnings(vcov(x, use.hessian = FALSE)) else vcov(x))', 'V <- vc_(modelo)');
    if (tipo === 3 && fx.length) L.push('m3 <- ajusta(f, contrastes = setNames(rep(list("contr.sum"), ' + fx.length + '), c(' + fx.map(v => R.textoR(v)).join(', ') + '))' +
      (fam !== 'binomial-negativa' ? ', start = list(theta = getME(modelo, "theta"))' : '') + ')', 'a <- suppressMessages(car::Anova(m3, type = 3, vcov. = vc_(m3)))');
    else L.push('a <- suppressMessages(car::Anova(modelo, type = ' + tipo + ', vcov. = V))');   // car avisa que usa la covarianza dada
    L.push('a <- a[rownames(a) != "(Intercept)", , drop = FALSE]', 'b <- fixef(modelo); se <- sqrt(diag(V)); cf <- cbind(b, se, b / se, 2 * pnorm(-abs(b / se)))',
      'vc <- as.data.frame(VarCorr(modelo))',
      'pr <- sum(residuals(modelo, type = "pearson")^2)');
    if (comparar.length) L.push('medias <- lapply(c(' + comparar.map(v => R.textoR(v)).join(', ') + '), function(fc) {',
      '  e <- emmeans(modelo, specs = fc' + (dentro ? ', by = ' + R.textoR(dentro) : '') + ', offset = 0, data = datos, vcov. = V)',
      '  list(factor = fc, enlace = as.data.frame(summary(e, infer = c(FALSE, FALSE))), respuesta = as.data.frame(summary(e, type = "response", level = ' + nivel + ')),',
      '       pares = if (nlevels(datos[[fc]]) <= ' + MAX_PARES + ') as.data.frame(summary(pairs(e, adjust = ' + R.textoR(aj) + '), infer = c(FALSE, TRUE))) else NULL)',
      '})');
    L.push('nr <- vc$grp != "Residual"',
      'list(',
      '  obs = list(usado = usaObs, razon = if (is.null(prueba)) NA_real_ else prueba$razon, p = if (is.null(prueba)) NA_real_ else prueba$p),',
      '  wald = list(termino = rownames(a), chi2 = a$Chisq, gl = a$Df, p = a[["Pr(>Chisq)"]]),',
      '  coeficientes = list(nombre = names(b), estimado = unname(cf[, 1]), ee = unname(cf[, 2]), z = unname(cf[, 3]), p = unname(cf[, 4])),',
      '  varianzas = list(grupo = vc$grp[nr], var1 = vc$var1[nr], var2 = vc$var2[nr], varianza = vc$vcov[nr], de = vc$sdcor[nr]),',
      '  ajuste = list(n = nobs(modelo), logLik = as.numeric(logLik(modelo)), AIC = AIC(modelo), BIC = BIC(modelo), pearson = pr, gl = df.residual(modelo), dispersion = pr / df.residual(modelo), singular = isSingular(modelo)),',
      '  theta = ' + (fam === 'binomial-negativa' ? 'getME(modelo, "glmer.nb.theta")' : 'NULL') + ',',
      comparar.length ? '  medias = medias,' : '  medias = NULL,',
      '  residuos = unname(residuals(modelo, type = "pearson")), ajustados = unname(fitted(modelo)),',
      '  versiones = list(R = paste(R.version$major, R.version$minor, sep = "."), lme4 = as.character(packageVersion("lme4")), car = as.character(packageVersion("car"))' +
        (comparar.length ? ', emmeans = as.character(packageVersion("emmeans"))' : '') + ')',
      ')');
    return {
      columnas: [...new Set([e.respuesta, ...m.variables, e.ensayos, e.exposicion].filter(Boolean))], codigo: L.join('\n'), paquetes: comparar.length ? ['emmeans'] : [],
      mensaje: T('Ajustando el modelo mixto generalizado en el motor R…'),
      arreglo: T('Revisa que cada factor de agrupamiento tenga varios niveles con datos; si no converge, simplifica los efectos aleatorios.'),
    };
  }

  /** Medias de un factor (por grupos de «dentro»): las dos escalas, los pares, la razón y las letras. */
  function leerMedias(x, dentro, alfa, ajuste, enlace) {
    const f = String(x.factor), dl = (x.enlace && x.enlace.datos) || {}, dr = (x.respuesta && x.respuesta.datos) || {}, cols = (x.respuesta && x.respuesta.columnas) || Object.keys(dr);
    const lo = cols.find(c => /LCL$|^lower\.CL$/.test(c)), hi = cols.find(c => /UCL$|^upper\.CL$/.test(c)), rc = cols.find(c => ![f, dentro, 'SE', 'df', lo, hi].includes(c));
    const conRazon = enlace === 'log' || enlace === 'logit';
    const filas = A(dl[f]).map((niv, i) => ({ nivel: String(niv), por: dentro ? String(A(dl[dentro])[i]) : null, eta: A(dl.emmean)[i], ee_eta: A(dl.SE)[i],
      respuesta: A(dr[rc])[i], ee: A(dr.SE)[i], ic: [A(dr[lo])[i], A(dr[hi])[i]].sort((a, b) => a - b), letras: '' }));
    const dp = x.pares && x.pares.datos, est = dp ? Object.keys(dp).find(c => /ratio$/.test(c)) : null;
    const pares = dp ? A(dp.contrast).map((c, i) => {
      const r = { contraste: String(c), por: dentro ? String(A(dp[dentro])[i]) : null, dif: A(dp.estimate)[i], ee: A(dp.SE)[i], estadistico: A(dp[est])[i], p: A(dp['p.value'])[i] };
      if (conRazon) r.razon = exp(r.dif);
      return r;
    }) : [];
    for (const g of [...new Set(filas.map(r => r.por))]) {
      const idx = filas.map((r, i) => i).filter(i => filas[i].por === g), pq = pares.filter(p => p.por === g), k = idx.length;
      if (pq.length !== k * (k - 1) / 2 || !pq.length) continue;
      const lst = [];
      let n = 0;
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) lst.push({ a, b, p_ajustado: pq[n++].p });
      const l = SP.np.letrasPorOrden(idx.map(i => filas[i].respuesta), lst, alfa);
      idx.forEach((i, j) => { filas[i].letras = l[j]; });
    }
    return { factor: f, dentro: dentro || null, ajuste, filas, pares, sinPares: !dp };
  }

  function leer(v, avisos, tabla, e, op) {
    const { m, izq, off } = partes(tabla, e, op), { dentro } = X().comparacionesDe(m, op), alfa = Number(op.alfa) || 0.05, nivel = Number(op.nivel) || 0.95, enlace = enlaceDe(op);
    const ob = v.obs || {}, wa = v.wald || {}, cf = v.coeficientes || {}, vc = v.varianzas || {}, aj = v.ajuste || {};
    const est = A(cf.estimado), ee = A(cf.ee), cz = SP.dist.qnorm(1 - (1 - nivel) / 2), conRazon = enlace === 'log' || enlace === 'logit';
    const escala = SP.generalizados.escalaDe(op.familia, enlace);
    const usado = !!ob.usado, aleatorios = m.aleatorios.map(a => a.texto).concat(usado ? ['(1 | .obs)'] : []);
    const out = {
      tipo: 'glmm', respuesta: e.respuesta, ensayos: e.ensayos || '', exposicion: e.exposicion || '', familia: op.familia, enlace, tipoDev: tipoDe(op), alfa, nivel,
      formula: izq + ' ~ ' + m.derechaR + (usado ? ' + (1 | .obs)' : '') + off, aleatorios, sobredispersion: olreDe(e, op),
      obs: { usado, razon: Number.isFinite(ob.razon) ? ob.razon : NaN, p: Number.isFinite(ob.p) ? ob.p : NaN },
      wald: { termino: A(wa.termino), chi2: A(wa.chi2), gl: A(wa.gl), p: A(wa.p) },
      coeficientes: { nombre: A(cf.nombre), estimado: est, ee, z: A(cf.z), p: A(cf.p) },
      razones: conRazon ? { razon: est.map(exp), ic_inf: est.map((b, j) => exp(b - cz * ee[j])), ic_sup: est.map((b, j) => exp(b + cz * ee[j])) } : null,
      varianzas: { grupo: A(vc.grupo), var1: A(vc.var1), var2: A(vc.var2), varianza: A(vc.varianza), de: A(vc.de) },
      ajuste: { n: Number(aj.n), logLik: aj.logLik, AIC: aj.AIC, BIC: aj.BIC, pearson: aj.pearson, gl: aj.gl, dispersion: aj.dispersion, singular: !!aj.singular },
      medias: A(v.medias).map(x => Object.assign(leerMedias(x, dentro, alfa, X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey', enlace), { escala })),
      valores: { pearson: A(v.residuos), ajustados: A(v.ajustados) },
      n: Number(aj.n), excluidas: tabla.n - Number(aj.n),
      avisos: X().traducir(avisos), avisosR: A(avisos), versiones: v.versiones || {},
    };
    if (op.familia === 'binomial-negativa') out.theta = Number(v.theta);
    if (!out.razones) delete out.razones;
    return out;
  }

  /* ======================= reporte ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ESCALA = { probabilidad: T('Probabilidad'), tasa: T('Tasa'), media: T('Media') };
  /* una varianza en la frontera (ajuste singular) sale como 1e-17: se muestra 0 */
  const cero = v => (Math.abs(v) < 1e-10 ? 0 : v);
  function semaforo(r) {
    const out = [], A0 = r.ajuste, grandes = r.valores.pearson.filter(x => abs(x) > 3).length;
    if (r.familia === 'binomial-negativa') out.push({ nombre: T('Sobredispersión'), color: 'verde', texto: T('La binomial negativa la modela: θ = {t}.', { t: sig(r.theta) }) });
    else if (r.obs.usado) out.push({ nombre: T('Sobredispersión'), color: 'verde', texto: T('Modelada con un efecto aleatorio por observación (varianza {v}).', { v: sig(r.varianzas.varianza[r.varianzas.grupo.indexOf('.obs')]) }) });
    else if (r.sobredispersion === 'no' && !(r.familia === 'binomial' && !r.ensayos)) out.push({ nombre: T('Sobredispersión'), color: A0.dispersion > 1.5 ? 'rojo' : A0.dispersion > 1.2 ? 'ambar' : 'verde', texto: T('Pearson χ²/gl = {r}: con más de 1.2, agrega el efecto por observación.', { r: f2(A0.dispersion) }) });
    else if (Number.isFinite(r.obs.p)) out.push({ nombre: T('Sobredispersión'), color: 'verde', texto: T('Sin sobredispersión: Pearson χ²/gl = {r} (p {p}).', { r: f2(r.obs.razon), p: fp(r.obs.p) }) });
    out.push({ nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde', texto: grandes === 1 ? T('Un residuo de Pearson pasa de 3: revisa esa observación.') : grandes ? T('{k} residuos de Pearson pasan de 3: revisa esas observaciones.', { k: grandes }) : T('Ningún residuo de Pearson pasa de 3.') });
    const conv = r.avisosR.some(x => /converge|unidentifiable|eigenvalue/i.test(x));
    out.push({ nombre: T('Ajuste del modelo'), color: A0.singular || conv ? 'ambar' : 'verde',
      texto: A0.singular ? T('Ajuste singular: algún componente de varianza quedó en cero.') : conv ? T('El optimizador avisó que no convergió del todo.') : T('Sin avisos del optimizador.') });
    return out;
  }
  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], F = SP.generalizados.NOMBRE_FAM, E = SP.generalizados.NOMBRE_ENL;
    if (r.sobredispersion === 'auto' && Number.isFinite(r.obs.p)) conclusiones.push(r.obs.usado ? T('Había sobredispersión (Pearson χ²/gl = {r}, p {p}): se agregó un efecto aleatorio por observación.', { r: f2(r.obs.razon), p: fp(r.obs.p) })
      : T('Sin sobredispersión (Pearson χ²/gl = {r}, p {p}): el modelo no necesita el efecto por observación.', { r: f2(r.obs.razon), p: fp(r.obs.p) }));
    r.wald.termino.forEach((t, k) => {
      const s = { t: String(t).split(':').join(' × '), c: f2(r.wald.chi2[k]), g: r.wald.gl[k], p: fp(r.wald.p[k]) };
      conclusiones.push(r.wald.p[k] < a ? T('{t}: tiene efecto (χ² de Wald = {c}, {g} gl, p {p}).', s) : T('{t}: sin evidencia de efecto (χ² de Wald = {c}, {g} gl, p {p}).', s));
    });
    for (const m of r.medias) {
      if (m.dentro) continue;
      const fs = m.filas.slice().sort((x, y) => y.respuesta - x.respuesta);
      if (fs.length >= 2) conclusiones.push(T('{e} más alta de {f}: {a} ({v}); más baja: {b} ({w}).', { e: ESCALA[m.escala], f: m.factor, a: fs[0].nivel, v: sig(fs[0].respuesta), b: fs[fs.length - 1].nivel, w: sig(fs[fs.length - 1].respuesta) }));
    }
    cuadros.push({ id: 'wald', titulo: T('Pruebas de los efectos fijos (χ² de Wald, tipo {t})', { t: r.tipoDev === 3 ? 'III' : 'II' }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('chi2', 'χ²', 'forma2'), col('gl', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: r.wald.termino.map((t, k) => ({ fuente: String(t).split(':').join(' × '), chi2: r.wald.chi2[k], gl: r.wald.gl[k], p: r.wald.p[k] })),
      notas: [r.tipoDev === 3 ? T('Tipo III: cada término ajustado por todos los demás, con contrastes de suma cero.') : T('Tipo II: cada término ajustado por los demás que no lo contienen.'),
        T('Modelo: {f}, familia {fa}, enlace {e}; aproximación de Laplace.', { f: r.formula, fa: F[r.familia], e: E[r.enlace] })].concat(r.avisos) });
    const c = r.coeficientes, conR = !!r.razones, nomR = r.enlace === 'logit' ? T('Razón de momios') : T('Razón de tasas');
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes fijos (escala del enlace {e})', { e: E[r.enlace] }),
      columnas: [col('nombre', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('z', 'z', 'forma2'), col('p', 'p', 'pvalor')]
        .concat(conR ? [col('razon', nomR, 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')] : []),
      filas: c.nombre.map((nm, j) => ({ nombre: nm === '(Intercept)' ? T('(Intercepto)') : nm, b: c.estimado[j], ee: c.ee[j], z: c.z[j], p: c.p[j],
        razon: conR ? r.razones.razon[j] : NaN, ic: conR ? [r.razones.ic_inf[j], r.razones.ic_sup[j]] : null })),
      notas: [r.familia === 'binomial-negativa' ? T('Contrastes de tratamiento; EE de la matriz RX de lme4 (con θ fija).') : r.ajuste.singular ? T('Contrastes de tratamiento; ajuste singular: EE de la matriz RX de lme4 (la hessiana en la frontera no es confiable).') : T('Contrastes de tratamiento; EE de la hessiana de la verosimilitud de Laplace (lo de omisión de lme4).')].concat(conR ? [T('{n}: exp(coeficiente), con el intervalo de Wald.', { n: nomR })] : []) });
    const vc = r.varianzas;
    cuadros.push({ id: 'aleatorios', titulo: T('Efectos aleatorios'), columnas: [col('grupo', T('Agrupamiento'), 'texto'), col('efecto', T('Efecto'), 'texto'), col('v', T('Varianza'), 'sig'), col('de', T('DE'), 'sig')],
      filas: vc.grupo.map((g, k) => ({ grupo: g === '.obs' ? T('cada observación (sobredispersión)') : g, efecto: vc.var2[k] ? T('correlación') : vc.var1[k] === '(Intercept)' ? T('intercepto') : vc.var1[k], v: cero(vc.varianza[k]), de: cero(vc.varianza[k]) === 0 ? 0 : vc.de[k] })),
      notas: [T('Varianzas en la escala del enlace.')] });
    for (const m of r.medias) {
      cuadros.push({ id: 'medias-' + m.factor, titulo: T('{e} estimada de cada nivel de «{f}»', { e: ESCALA[m.escala], f: m.factor }) + (m.dentro ? T(' dentro de cada nivel de «{d}»', { d: m.dentro }) : ''),
        columnas: (m.dentro ? [col('por', m.dentro, 'texto')] : []).concat([col('nivel', m.factor, 'texto'), col('v', ESCALA[m.escala], 'sig'), col('ee', T('EE'), 'sig'),
          col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig'), col('letras', T('Grupo'), 'texto')]),
        filas: m.filas.map(x => ({ por: x.por, nivel: x.nivel, v: x.respuesta, ee: x.ee, ic: x.ic, letras: x.letras })),
        notas: [T('Medias marginales en la escala de la respuesta (efectos aleatorios en cero){o}.', { o: r.exposicion ? T(', por unidad de «{x}»', { x: r.exposicion }) : '' }),
          T('Comparaciones con {a} (α = {al}): niveles con una letra en común no difieren.', { a: X().NOMBRE_AJUSTE[m.ajuste] || m.ajuste, al: a })] });
      if (m.pares.length) {
        const razon = m.pares[0].razon !== undefined;
        cuadros.push({ id: 'pares-' + m.factor, titulo: T('Comparaciones por pares de «{f}»', { f: m.factor }),
          columnas: (m.dentro ? [col('por', m.dentro, 'texto')] : []).concat([col('c', T('Contraste'), 'texto'), col('v', razon ? (r.enlace === 'logit' ? T('Razón de momios') : T('Razón')) : T('Diferencia (enlace)'), 'sig'),
            col('ee', T('EE (enlace)'), 'sig'), col('z', 'z', 'forma2'), col('p', T('p ajustado'), 'pvalor')]),
          filas: m.pares.map(x => ({ por: x.por, c: razon ? x.contraste.replace(' - ', ' / ') : x.contraste, v: razon ? x.razon : x.dif, ee: x.ee, z: x.estadistico, p: x.p })),
          notas: [razon ? T('Razón = exp(diferencia en la escala del enlace); la prueba se hace en esa escala.') : T('Diferencias en la escala del enlace.')] });
      }
    }
    const A0 = r.ajuste, filas = [{ medida: T('Observaciones'), valor: A0.n, _dec: 0 }, { medida: T('Log-verosimilitud (Laplace)'), valor: A0.logLik, _dec: 3 }, { medida: 'AIC', valor: A0.AIC, _dec: 2 },
      { medida: 'BIC', valor: A0.BIC, _dec: 2 }, { medida: T('Pearson χ²/gl'), valor: A0.dispersion, _dec: 3 }];
    if (r.theta !== undefined) filas.push({ medida: T('θ de la binomial negativa'), valor: r.theta, _dec: 4 });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')], filas, notas: [] });
    return { titulo: T('Modelo lineal generalizado mixto: {f}, enlace {e}', { f: F[r.familia], e: E[r.enlace] }), conclusiones: conclusiones.map(may), cuadros, semaforo: semaforo(r) };
  }

  function codigoR(e, op, ctx) {
    const R = M(), res = ctx && ctx.resultado, fam = op.familia, enl = SP.glm.NOMBRE_ENLACE[enlaceDe(op)], tipo = tipoDe(op);
    let sep = null;
    try { sep = X().separar(op.derecha); } catch (err) { /* el código sale igual */ }
    const derecha = sep ? (sep.fijos || '1') + sep.aleatorios.map(a => ' + ' + a.texto).join('') : String(op.derecha || '');
    const izq = e.ensayos ? `cbind(${R.nombreR(e.respuesta)}, ${R.nombreR(e.ensayos)} - ${R.nombreR(e.respuesta)})` : R.nombreR(e.respuesta);
    const obs = res ? res.obs.usado : olreDe(e, op) === 'si';
    const f = izq + ' ~ ' + derecha + (obs ? ' + (1 | obs)' : '') + (e.exposicion ? ` + offset(log(${R.nombreR(e.exposicion)}))` : '');
    const L = ['# Modelo lineal generalizado mixto (código R equivalente a SigmaPro)', 'library(lme4)'];
    for (const v of lista(op.comoFactor)) L.push('datos$' + R.nombreR(v) + ' <- factor(datos$' + R.nombreR(v) + ')');
    if (obs || olreDe(e, op) === 'auto') L.push('datos$obs <- factor(seq_len(nrow(datos)))   # un nivel por observación: el efecto para la sobredispersión');
    L.push(CTL + '   # convergencia estricta: las mismas cifras que SigmaPro',
      fam === 'binomial-negativa' ? `modelo <- glmer.nb(${f}, data = datos, control = ctl)` : `modelo <- glmer(${f}, family = ${fam}(link = "${enl}"), data = datos, control = ctl)`,
      'sum(residuals(modelo, type = "pearson")^2) / df.residual(modelo)   # Pearson χ²/gl (sobredispersión)',
      tipo === 3 ? 'options(contrasts = c("contr.sum", "contr.poly")); car::Anova(update(modelo), type = 3); options(contrasts = c("contr.treatment", "contr.poly"))' : 'car::Anova(modelo, type = 2)   # χ² de Wald',
      'summary(modelo)' + (fam === 'binomial-negativa' ? '   # EE de RX: sqrt(diag(vcov(modelo, use.hessian = FALSE))), como lme4 2.0' : ''), 'VarCorr(modelo)');
    if (enl === 'log' || enl === 'logit') L.push('cf <- summary(modelo)$coefficients; exp(cbind(razon = cf[, 1], inf = cf[, 1] - qnorm(0.975) * cf[, 2], sup = cf[, 1] + qnorm(0.975) * cf[, 2]))');
    const comparar = res ? res.medias.map(m => m.factor) : lista(op.comparar), dentro = op.dentro || '';
    if (comparar.length) {
      L.push('library(emmeans)');
      for (const fc of comparar) L.push(`em <- emmeans(modelo, ${R.textoR(fc)}${dentro && dentro !== fc ? ', by = ' + R.textoR(dentro) : ''}, type = "response"${e.exposicion ? ', offset = 0' : ''}); em`, `pairs(em, adjust = "${op.ajuste || 'tukey'}")`);
    }
    return L.join('\n');
  }

  /* ======================= métodos ======================= */
  const OPC = { derecha: { tipo: 'texto', omision: '' }, comoFactor: { tipo: 'lista', omision: [] }, familia: { tipo: 'texto', omision: 'poisson' }, enlace: { tipo: 'texto', omision: '' },
    sobredispersion: { tipo: 'texto', omision: 'auto' }, tipo: { tipo: 'numero', omision: 2 }, ajuste: { tipo: 'texto', omision: 'tukey' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } };
  /** Tratamientos en bloques aleatorios: la fórmula se arma con los papeles. */
  const derechaBloques = e => lista(e.tratamientos).map(q).join(' * ') + ' + (1 | ' + q(e.bloque) + ')';
  const opcionesBloques = (tabla, e, op) => Object.assign({}, op, { derecha: derechaBloques(e), comoFactor: lista(e.tratamientos).filter(f => tabla.col(f).tipo === 'numerica') });
  function validarBloques(tabla, e, op) {
    const trs = lista(e.tratamientos), usados = [e.respuesta];
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(trs.length >= 1 && trs.length <= 3, T('Elige de uno a tres factores de tratamiento.'));
    exigir(e.bloque, T('Elige la columna de los bloques (aleatorios).'));
    for (const c of trs.concat([e.bloque])) { exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c })); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); }
    validar(tabla, e, opcionesBloques(tabla, e, op));
  }
  SP.glmmGen = { partes, preparar, leer, reporte, codigoR, derechaBloques, opcionesBloques, FAMILIAS };

  SP.metodo({
    id: 'glmm-bloques', familia: 'generalizados', motor: 'r', orden: 50, paquetes: ['lme4', 'car'], nombre: T('Conteos o proporciones en bloques aleatorios (mixto)'),
    resumen: T('Modelo lineal generalizado mixto: tratamientos con bloques aleatorios y, si hace falta, un efecto por observación para la sobredispersión.'),
    entradas: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 3 }, bloque: { tipo: 'factor' }, ensayos: { tipo: 'numerica', opcional: true }, exposicion: { tipo: 'numerica', opcional: true } },
    opciones: Object.assign({}, OPC, { comparar: { tipo: 'lista', omision: undefined }, dentro: { tipo: 'texto', omision: '' } }),
    validar: validarBloques,
    preparar: (tabla, e, op) => preparar(tabla, e, opcionesBloques(tabla, e, op)),
    leer: (v, avisos, tabla, e, op) => leer(v, avisos, tabla, e, opcionesBloques(tabla, e, op)),
    reporte, codigoR: (e, op, ctx) => codigoR(e, Object.assign({}, op, { derecha: derechaBloques(e), comoFactor: lista(e.tratamientos).concat([e.bloque]) }), ctx),
  });
  SP.metodo({
    id: 'glmm', familia: 'generalizados', motor: 'r', orden: 60, paquetes: ['lme4', 'car'], nombre: T('Modelo lineal generalizado mixto (fórmula)'),
    resumen: T('Binomial, Poisson o binomial negativa con efectos aleatorios escritos como en lme4: (1 | bloque).'),
    entradas: { respuesta: { tipo: 'numerica' }, ensayos: { tipo: 'numerica', opcional: true }, exposicion: { tipo: 'numerica', opcional: true } },
    opciones: Object.assign({}, OPC, { comparar: { tipo: 'lista', omision: undefined }, dentro: { tipo: 'texto', omision: '' } }),
    validar, preparar, leer, reporte, codigoR,
  });
});
