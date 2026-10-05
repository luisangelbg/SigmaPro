/* SigmaPro — modelos lineales generalizados mixtos (familia Modelos lineales generalizados), en el motor R.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Conteos o proporciones con efectos aleatorios (bloques, parcelas, localidades) por aproximación de Laplace con
   lme4::glmer (binomial y Poisson) o glmer.nb (binomial negativa), con el control estricto (bobyqa con rhoend = 1e-12
   y tolPwrss = 1e-12): con el de omisión glmer se queda hasta 1e-5 del óptimo. La sobredispersión se modela con un
   efecto aleatorio por observación (Harrison 2014): «sí», «no» o «automática» (si la prueba de Pearson del modelo sin
   él da p < 0.05 y la razón pasa de 1.1, como en el GLM; solo con conteos o proporciones agrupadas). Da las pruebas χ² de Wald de los efectos fijos
   (car::Anova tipo II, o III con contrastes de suma cero reajustado desde las θ del modelo), los coeficientes con sus
   EE (de la hessiana por diferencias finitas, lo de omisión de lme4; en la binomial negativa, de RX, que es lo que da
   lme4 2.0: la 1.1 usaba la hessiana) y sus
   razones de momios o de tasas, las varianzas de los efectos aleatorios, el ajuste y las medias en la escala de la
   respuesta con sus pares y letras (emmeans, con offset = 0: tasas por unidad de exposición).
   Dos métodos: glmm-bloques (tratamientos en bloques aleatorios, desde un formulario) y glmm (desde una fórmula con
   términos aleatorios, como el modelo lineal mixto).
   Hito 4.3: la familia gamma (con su dispersión), la cuadratura adaptativa de Gauss-Hermite (nAGQ > 1, con un solo
   intercepto aleatorio, binomial o Poisson; con el efecto por observación vuelve a Laplace) y la prueba de razón de
   verosimilitudes de cada efecto aleatorio (el modelo sin él, con glmer o con glm si no queda ninguno). Dos límites
   comprobados en lme4: glmer.nb con nAGQ > 1 estima mal θ (la parte que omite depende de θ: 2.58 contra 27.6 con
   Laplace en unos conteos simulados), y la de Laplace de una gamma no se
   puede comparar con la de glm (con la varianza del bloque casi en cero salía 0.84 menor), así que la gamma va sin la
   prueba de los aleatorios. Y la varianza de los aleatorios de la gamma: glmer ajusta el modelo con la devianza sin
   dividir entre la dispersión, así que la del efecto en la escala del enlace es (θ·σ)²; VarCorr de lme4 1.1 la da así,
   pero la de lme4 2.0 (la del motor) da θ² (0.539 contra 0.028 en unos bloques simulados con 0.0225). La app la
   calcula aparte, (θ·σ)², y por eso la gamma solo admite interceptos aleatorios.
   Con nAGQ > 1, logLik de lme4 (1.1 y 2.0) omite la log-verosimilitud del modelo saturado (en cbpp da −50.005 y la
   integral directa −91.983; la diferencia es exactamente la del saturado, −41.978): la app se la suma, y así la
   log-verosimilitud, el AIC, el BIC y la prueba de los aleatorios contra glm quedan bien. */
SP.definir('glmm', function (SP) {
  'use strict';
  const T = SP.T;
  const M = () => SP.motorR, X = () => SP.mixtos;
  const { exp, sqrt, abs } = Math;
  const A = x => (x === null || x === undefined ? [] : Array.isArray(x) ? x : [x]);
  const lista = v => [].concat(v || []).filter(Boolean);
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const FAMILIAS = ['poisson', 'binomial', 'binomial-negativa', 'gamma'];
  /* los enlaces que glmer ajusta en C++ (la potencia y la raíz del GLM quedan fuera) */
  const ENLACES = { binomial: ['logit', 'probit', 'cloglog'], poisson: ['log', 'identidad'], 'binomial-negativa': ['log'], gamma: ['log', 'inverso', 'identidad'] };
  const R_FAM = { binomial: 'binomial', poisson: 'poisson', gamma: 'Gamma' };
  const nagqDe = op => { const k = Number(op.nagq); return Number.isInteger(k) && k >= 1 ? k : 1; };
  /** Un solo intercepto aleatorio, (1 | g): lo único que admite la cuadratura de Gauss-Hermite en glmer. */
  const unIntercepto = m => m.aleatorios.length === 1 && /^\(\s*1\s*\|[^|]+\)$/.test(m.aleatorios[0].texto.trim());
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
    exigir(FAMILIAS.includes(op.familia), T('Familia no válida para el modelo mixto generalizado: {f}.', { f: op.familia }), T('Usa binomial, Poisson, binomial negativa o gamma.'));
    exigir(ENLACES[op.familia].includes(enlaceDe(op)), T('El enlace {e} no es de la familia {f}.', { e: enlaceDe(op), f: op.familia }));
    const nq = Number(op.nagq === undefined || op.nagq === '' ? 1 : op.nagq);
    exigir(Number.isInteger(nq) && nq >= 1 && nq <= 25, T('Los nodos de la cuadratura van de 1 (Laplace) a 25.'));
    if (e.ensayos) exigir(op.familia === 'binomial', T('La columna de ensayos solo se usa con la familia binomial.'));
    if (e.exposicion) exigir(op.familia === 'poisson' || op.familia === 'binomial-negativa', T('La exposición solo se usa con conteos (Poisson o binomial negativa).'));
    exigir([2, 3].includes(Number(op.tipo)), T('Las pruebas de Wald son de tipo II o III.'));
    const { m } = partes(tabla, e, op);
    if (op.familia === 'gamma') exigir(m.aleatorios.every(a => /^\(\s*1\s*\|[^|]+\)$/.test(a.texto.trim())), T('Con la familia gamma, los efectos aleatorios son interceptos por grupo, como (1 | bloque).'),
      T('Las pendientes aleatorias con la gamma quedan fuera: su varianza no se informa igual en todas las versiones de lme4.'));
    if (nq > 1) {
      exigir(op.familia === 'binomial' || op.familia === 'poisson', T('La cuadratura de Gauss-Hermite está disponible con la binomial y la de Poisson.'), T('Con la binomial negativa o la gamma usa la aproximación de Laplace (1 nodo).'));
      exigir(unIntercepto(m), T('La cuadratura de Gauss-Hermite (más de un nodo) es solo con un efecto aleatorio: un intercepto por grupo, como (1 | bloque).'), T('Con más efectos aleatorios usa la aproximación de Laplace (1 nodo).'));
      exigir(olreDe(e, op) !== 'si', T('Con el efecto por observación hay dos efectos aleatorios: la cuadratura necesita uno solo.'), T('Elige «Automático» o «No» en el efecto por observación, o usa Laplace.'));
    }
    for (const k of ['ensayos', 'exposicion']) if (e[k]) { exigir(tabla.columnas[e[k]], T('No existe la columna «{c}».', { c: e[k] })); exigir(tabla.col(e[k]).tipo === 'numerica', T('«{c}» debe ser numérica.', { c: e[k] })); exigir(!m.variables.includes(e[k]) && e[k] !== e.respuesta, T('«{c}» está en dos papeles a la vez.', { c: e[k] })); }
    /* la respuesta debe valer para la familia, en las filas que entran */
    const y = tabla.col(e.respuesta).valores, n = e.ensayos ? tabla.col(e.ensayos).valores : null, ex = e.exposicion ? tabla.col(e.exposicion).valores : null;
    for (let i = 0; i < tabla.n; i++) {
      const v = y[i];
      if (v !== v || (n && n[i] !== n[i]) || (ex && ex[i] !== ex[i])) continue;
      if (op.familia === 'gamma') { exigir(v > 0, T('La familia gamma necesita valores positivos de «{r}».', { r: e.respuesta }), T('Si hay ceros, suma una constante pequeña en el bloque Datos.')); continue; }
      exigir(v >= 0 && Number.isInteger(v), op.familia === 'binomial' && !n ? T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }) : T('«{r}» debe ser un conteo (entero, sin negativos).', { r: e.respuesta }));
      if (op.familia === 'binomial') exigir(n ? n[i] > 0 && v <= n[i] : v <= 1, n ? T('Los éxitos de «{r}» deben ir entre 0 y los ensayos.', { r: e.respuesta }) : T('Sin la columna de ensayos, «{r}» debe valer 0 o 1.', { r: e.respuesta }),
        n ? '' : T('Si son conteos de éxitos (germinadas de 50), elige también la columna de ensayos.'));
      if (ex) exigir(ex[i] > 0, T('La exposición «{c}» debe ser positiva (área o tiempo muestreado).', { c: e.exposicion }));
    }
  }

  /** El trabajo para el motor R. */
  function preparar(tabla, e, op) {
    const { m, izq, off, fx } = partes(tabla, e, op), R = M(), fam = op.familia, enl = SP.glm.NOMBRE_ENLACE[enlaceDe(op)], olre = olreDe(e, op), tipo = tipoDe(op), nq = nagqDe(op);
    const prueba = op.pruebaAleatorios !== false && fam !== 'gamma';
    const { comparar, dentro } = X().comparacionesDe(m, op), nivel = Number(op.nivel) || 0.95, aj = X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey';
    /* car se carga en silencio: al cargarse avisa que reemplaza na.action.merMod de lme4 */
    const L = ['suppressPackageStartupMessages(library(lme4))', 'suppressPackageStartupMessages(requireNamespace("car"))'];
    if (comparar.length) L.push('suppressPackageStartupMessages(library(emmeans))', 'emm_options(msg.interaction = FALSE, msg.nesting = FALSE)');
    for (const v of m.aFactor) L.push('datos[[' + R.textoR(v) + ']] <- factor(datos[[' + R.textoR(v) + ']])');
    /* nAGQ: con el efecto por observación (dos aleatorios) vuelve a Laplace */
    L.push('datos$.obs <- factor(seq_len(nrow(datos)))', CTL, 'nq <- ' + nq + 'L',
      fam === 'binomial-negativa'
        ? 'ajusta <- function(f, contrastes = NULL, start = NULL, nAGQ = 1L) glmer.nb(f, data = datos, control = ctl, contrasts = contrastes, nAGQ = nAGQ)'
        : `ajusta <- function(f, contrastes = NULL, start = NULL, nAGQ = 1L) glmer(f, family = ${R_FAM[fam]}(link = "${enl}"), data = datos, control = ctl, contrasts = contrastes, start = start, nAGQ = nAGQ)`,
      'forma <- function(obs) as.formula(paste(' + R.textoR(izq + ' ~ ' + m.derechaR) + ', if (obs) "+ (1 | .obs)" else "", ' + R.textoR(off) + '))',
      'prueba <- NULL', 'usaObs <- ' + (olre === 'si' ? 'TRUE' : 'FALSE'));
    if (olre === 'auto') L.push('m0 <- ajusta(forma(FALSE), nAGQ = nq)', 'pr0 <- sum(residuals(m0, type = "pearson")^2); gl0 <- df.residual(m0)',
      'prueba <- list(razon = pr0 / gl0, p = pchisq(pr0, gl0, lower.tail = FALSE))', 'usaObs <- prueba$p < 0.05 && prueba$razon > 1.1');
    L.push('if (usaObs) nq <- 1L', 'f <- forma(usaObs)', 'modelo <- ajusta(f, nAGQ = nq)',
      /* la log-verosimilitud del modelo saturado, que lme4 omite con la cuadratura (binomial: la de cada k de n en k/n) */
      'y_ <- getME(modelo, "y"); w_ <- weights(modelo)',
      'lsat <- if (nq > 1L) ' + (fam === 'binomial' ? 'sum(dbinom(round(y_ * w_), round(w_), y_, log = TRUE))' : 'sum(dpois(y_, y_, log = TRUE))') + ' else 0',
      'llM <- as.numeric(logLik(modelo)) + lsat');
    /* EE: la hessiana (lo de omisión de lme4), salvo con la binomial negativa o un ajuste singular, que van con RX: es lo que hace
       lme4 2.0 (no calcula la hessiana ahí) y en la frontera la hessiana por diferencias finitas no es confiable */
    L.push('vc_ <- function(x) as.matrix(if (' + (fam === 'binomial-negativa' ? 'TRUE' : 'isSingular(x)') + ') suppressWarnings(vcov(x, use.hessian = FALSE)) else vcov(x))', 'V <- vc_(modelo)');
    if (tipo === 3 && fx.length) L.push('m3 <- ajusta(f, contrastes = setNames(rep(list("contr.sum"), ' + fx.length + '), c(' + fx.map(v => R.textoR(v)).join(', ') + '))' +
      (fam !== 'binomial-negativa' ? ', start = list(theta = getME(modelo, "theta"))' : '') + ', nAGQ = nq)', 'a <- suppressMessages(car::Anova(m3, type = 3, vcov. = vc_(m3)))');
    else L.push('a <- suppressMessages(car::Anova(modelo, type = ' + tipo + ', vcov. = V))');   // car avisa que usa la covarianza dada
    L.push('a <- a[rownames(a) != "(Intercept)", , drop = FALSE]', 'b <- fixef(modelo); se <- sqrt(diag(V)); cf <- cbind(b, se, b / se, 2 * pnorm(-abs(b / se)))',
      fam === 'gamma'
        /* gamma: (θ·σ)² para cada intercepto aleatorio, sin depender de VarCorr (lme4 2.0 da θ²) */
        ? 'th_ <- getME(modelo, "theta") * sigma(modelo); vc <- data.frame(grp = names(getME(modelo, "cnms")), var1 = "(Intercept)", var2 = NA_character_, vcov = th_^2, sdcor = abs(th_), stringsAsFactors = FALSE)'
        : 'vc <- as.data.frame(VarCorr(modelo))',
      'pr <- sum(residuals(modelo, type = "pearson")^2)');
    if (comparar.length) L.push('medias <- lapply(c(' + comparar.map(v => R.textoR(v)).join(', ') + '), function(fc) {',
      '  e <- emmeans(modelo, specs = fc' + (dentro ? ', by = ' + R.textoR(dentro) : '') + ', offset = 0, data = datos, vcov. = V)',
      '  list(factor = fc, enlace = as.data.frame(summary(e, infer = c(FALSE, FALSE))), respuesta = as.data.frame(summary(e, type = "response", level = ' + nivel + ')),',
      '       pares = if (nlevels(datos[[fc]]) <= ' + MAX_PARES + ') as.data.frame(summary(pairs(e, adjust = ' + R.textoR(aj) + '), infer = c(FALSE, TRUE))) else NULL)',
      '})');
    /* prueba de razón de verosimilitudes de cada efecto aleatorio: el modelo sin él (glmer, o glm si no queda ninguno) */
    if (prueba) L.push('aleat <- c(' + m.aleatorios.map(a => R.textoR(a.texto)).join(', ') + ', if (usaObs) "(1 | .obs)")',
      fam === 'binomial-negativa' ? 'ajustaGLM <- function(f) MASS::glm.nb(f, data = datos, control = glm.control(epsilon = 1e-12, maxit = 100))'
        : `ajustaGLM <- function(f) glm(f, family = ${R_FAM[fam]}(link = "${enl}"), data = datos, control = glm.control(epsilon = 1e-12, maxit = 100))`,
      'l1 <- logLik(modelo); g1 <- attr(l1, "df")',
      'rv <- lapply(seq_along(aleat), function(k) {',
      '  fk <- as.formula(paste(' + R.textoR(izq + ' ~ ' + m.fijos) + ', paste(c("", aleat[-k]), collapse = " + "), ' + R.textoR(off) + '))',
      '  mk <- tryCatch(suppressWarnings(if (length(aleat) > 1) ajusta(fk) else ajustaGLM(fk)), error = function(e) NULL)',
      '  if (is.null(mk)) return(list(termino = aleat[k], gl = NA_real_, lrt = NA_real_, p = NA_real_))',
      '  l0 <- logLik(mk); g <- g1 - attr(l0, "df"); x <- 2 * (llM - as.numeric(l0))',
      '  list(termino = aleat[k], gl = g, lrt = x, p = pchisq(max(x, 0), g, lower.tail = FALSE))',
      '})');
    L.push('nr <- vc$grp != "Residual"',
      'list(',
      '  obs = list(usado = usaObs, razon = if (is.null(prueba)) NA_real_ else prueba$razon, p = if (is.null(prueba)) NA_real_ else prueba$p),',
      '  wald = list(termino = rownames(a), chi2 = a$Chisq, gl = a$Df, p = a[["Pr(>Chisq)"]]),',
      '  coeficientes = list(nombre = names(b), estimado = unname(cf[, 1]), ee = unname(cf[, 2]), z = unname(cf[, 3]), p = unname(cf[, 4])),',
      '  varianzas = list(grupo = vc$grp[nr], var1 = vc$var1[nr], var2 = vc$var2[nr], varianza = vc$vcov[nr], de = vc$sdcor[nr]),',
      '  ajuste = list(n = nobs(modelo), logLik = llM, AIC = AIC(modelo) - 2 * lsat, BIC = BIC(modelo) - 2 * lsat, pearson = pr, gl = df.residual(modelo), dispersion = pr / df.residual(modelo), singular = isSingular(modelo), nagq = nq' +
        (fam === 'gamma' ? ', sigma = sigma(modelo)' : '') + '),',
      prueba ? '  aleatorios = list(termino = vapply(rv, function(x) x$termino, ""), gl = vapply(rv, function(x) x$gl, 0), lrt = vapply(rv, function(x) x$lrt, 0), p = vapply(rv, function(x) x$p, 0)),' : '  aleatorios = NULL,',
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
      ajuste: { n: Number(aj.n), logLik: aj.logLik, AIC: aj.AIC, BIC: aj.BIC, pearson: aj.pearson, gl: aj.gl, dispersion: aj.dispersion, singular: !!aj.singular,
        nagq: Number(aj.nagq) || 1, sigma: aj.sigma === undefined || aj.sigma === null ? undefined : Number(aj.sigma) },
      nagqPedido: nagqDe(op),
      pruebaAleatorios: v.aleatorios ? { termino: A(v.aleatorios.termino).map(String), gl: A(v.aleatorios.gl), lrt: A(v.aleatorios.lrt), p: A(v.aleatorios.p) } : null,
      medias: A(v.medias).map(x => Object.assign(leerMedias(x, dentro, alfa, X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey', enlace), { escala })),
      valores: { pearson: A(v.residuos), ajustados: A(v.ajustados) },
      n: Number(aj.n), excluidas: tabla.n - Number(aj.n),
      avisos: X().traducir(avisos), avisosR: A(avisos), versiones: v.versiones || {},
    };
    if (op.familia === 'binomial-negativa') out.theta = Number(v.theta);
    if (!out.razones) delete out.razones;
    if (op.familia === 'gamma' && op.pruebaAleatorios !== false) out.avisos.push(T('Con la familia gamma no se prueban los efectos aleatorios: la verosimilitud de Laplace de glmer no se puede comparar con la del modelo sin ellos.'));
    if (out.nagqPedido > 1 && out.ajuste.nagq === 1) out.avisos.push(T('Con el efecto por observación hay dos efectos aleatorios: se usó la aproximación de Laplace en lugar de la cuadratura.'));
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
    if (r.familia === 'gamma') out.push({ nombre: T('Dispersión'), color: 'verde', texto: T('Estimada en el modelo: φ = σ² = {f}.', { f: sig(r.ajuste.sigma * r.ajuste.sigma) }) });
    else if (r.familia === 'binomial-negativa') out.push({ nombre: T('Sobredispersión'), color: 'verde', texto: T('La binomial negativa la modela: θ = {t}.', { t: sig(r.theta) }) });
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
        T('Modelo: {f}, familia {fa}, enlace {e}; {a}.', { f: r.formula, fa: F[r.familia], e: E[r.enlace],
          a: r.ajuste.nagq > 1 ? T('cuadratura adaptativa de Gauss-Hermite con {k} nodos', { k: r.ajuste.nagq }) : T('aproximación de Laplace') })].concat(r.avisos) });
    const c = r.coeficientes, conR = !!r.razones, nomR = r.enlace === 'logit' ? T('Razón de momios') : r.familia === 'gamma' ? T('Razón de medias') : T('Razón de tasas');
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
    const pa = r.pruebaAleatorios;
    if (pa && pa.termino.length) cuadros.push({ id: 'prueba-aleatorios', titulo: T('Prueba de los efectos aleatorios (razón de verosimilitudes)'),
      columnas: [col('t', T('Efecto quitado'), 'texto'), col('gl', 'gl', 'entero'), col('lrt', 'χ²', 'forma2'), col('p', 'p', 'pvalor')],
      filas: pa.termino.map((t, k) => ({ t: t === '(1 | .obs)' ? T('cada observación (sobredispersión)') : t, gl: pa.gl[k], lrt: pa.lrt[k], p: pa.p[k] })),
      notas: [T('Cada fila compara el modelo con el que no tiene ese efecto (con glm si no queda ninguno). Como la varianza no puede ser negativa, este p es conservador: el verdadero suele ser la mitad.')] });
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
    if (r.ajuste.sigma !== undefined) filas.push({ medida: T('Dispersión de la gamma (σ²)'), valor: r.ajuste.sigma * r.ajuste.sigma, _dec: 4 });
    if (r.ajuste.nagq > 1) filas[1] = { medida: T('Log-verosimilitud (Gauss-Hermite, {k} nodos)', { k: r.ajuste.nagq }), valor: A0.logLik, _dec: 3 };
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
    const nq = res ? res.ajuste.nagq : nagqDe(op), nA = nq > 1 ? `, nAGQ = ${nq}` : '';
    L.push(CTL + '   # convergencia estricta: las mismas cifras que SigmaPro',
      fam === 'binomial-negativa' ? `modelo <- glmer.nb(${f}, data = datos, control = ctl${nA})` : `modelo <- glmer(${f}, family = ${R_FAM[fam]}(link = "${enl}"), data = datos, control = ctl${nA})` +
        (nq > 1 ? '   # cuadratura adaptativa de Gauss-Hermite' : ''),
      'sum(residuals(modelo, type = "pearson")^2) / df.residual(modelo)   # Pearson χ²/gl (sobredispersión)',
      tipo === 3 ? 'options(contrasts = c("contr.sum", "contr.poly")); car::Anova(update(modelo), type = 3); options(contrasts = c("contr.treatment", "contr.poly"))' : 'car::Anova(modelo, type = 2)   # χ² de Wald',
      'summary(modelo)' + (fam === 'binomial-negativa' ? '   # EE de RX: sqrt(diag(vcov(modelo, use.hessian = FALSE))), como lme4 2.0' : ''), 'VarCorr(modelo)');
    if (op.pruebaAleatorios !== false && fam !== 'gamma' && sep && sep.aleatorios.length === 1 && !obs) L.push(`m0 <- ${fam === 'binomial-negativa' ? `MASS::glm.nb(${izq} ~ ${sep.fijos || '1'}${e.exposicion ? ` + offset(log(${R.nombreR(e.exposicion)}))` : ''}, data = datos)`
      : `glm(${izq} ~ ${sep.fijos || '1'}${e.exposicion ? ` + offset(log(${R.nombreR(e.exposicion)}))` : ''}, family = ${R_FAM[fam]}(link = "${enl}"), data = datos)`}`,
      'x <- 2 * (as.numeric(logLik(modelo)) - as.numeric(logLik(m0))); c(chi2 = x, p = pchisq(x, attr(logLik(modelo), "df") - attr(logLik(m0), "df"), lower.tail = FALSE))   # prueba del efecto aleatorio');
    else if (op.pruebaAleatorios !== false && fam !== 'gamma') L.push('# prueba de cada efecto aleatorio: 2 × (logLik(modelo) − logLik(del modelo sin él)), con χ² de tantos gl como parámetros se quitan');
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
    sobredispersion: { tipo: 'texto', omision: 'auto' }, tipo: { tipo: 'numero', omision: 2 }, ajuste: { tipo: 'texto', omision: 'tukey' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 },
    nagq: { tipo: 'numero', omision: 1 }, pruebaAleatorios: { tipo: 'logico', omision: true } };
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
  SP.glmmGen = { partes, preparar, leer, reporte, codigoR, derechaBloques, opcionesBloques, FAMILIAS, ENLACES, unIntercepto };

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
    resumen: T('Binomial, Poisson, binomial negativa o gamma con efectos aleatorios escritos como en lme4: (1 | bloque).'),
    entradas: { respuesta: { tipo: 'numerica' }, ensayos: { tipo: 'numerica', opcional: true }, exposicion: { tipo: 'numerica', opcional: true } },
    opciones: Object.assign({}, OPC, { comparar: { tipo: 'lista', omision: undefined }, dentro: { tipo: 'texto', omision: '' } }),
    validar, preparar, leer, reporte, codigoR,
  });
});
