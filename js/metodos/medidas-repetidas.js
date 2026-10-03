/* SigmaPro — medidas repetidas en el tiempo con estructuras de covarianza (motor R: nlme y emmeans).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   La misma unidad (planta, parcela, animal) medida en varias fechas: las mediciones de una unidad están
   correlacionadas y su varianza puede cambiar con el tiempo. Se ajusta el modelo de mínimos cuadrados generalizados
   (nlme::gls, REML) con los tratamientos entre unidades, el tiempo como factor y, si los hay, los bloques:
     respuesta ~ tratamientos * tiempo + bloque
   con cada estructura de covarianza candidata entre las fechas de una unidad —independientes, simetría compuesta
   (también heterogénea), AR(1) (también heterogénea), AR(1) continua para fechas desiguales y no estructurada—; se
   elige la de menor AIC (o BIC), o la que se pida. De la elegida: ANOVA marginal de los efectos fijos (tipo III),
   coeficientes, parámetros de correlación y de varianza, la matriz de covarianzas entre fechas, medias marginales
   (emmeans, con los gl del error de nlme, N − p) y sus comparaciones con letras (por omisión, los tratamientos
   dentro de cada fecha) y el semáforo de los supuestos sobre los residuos normalizados.

   La unidad es la combinación de sujeto, tratamientos y bloque: así no importa si las plantas se numeran de nuevo
   en cada tratamiento. preparar() y leer() son puras (se prueban en node). */
SP.definir('medidas-repetidas', function (SP) {
  'use strict';
  const T = SP.T;
  const M = () => SP.motorR;
  const X = () => SP.mixtos;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const lista = v => [].concat(v || []).filter(Boolean);
  const A = x => (x === null || x === undefined ? [] : Array.isArray(x) ? x : [x]);
  const MAX_UN = 8;   // fechas: con más, la no estructurada no entra sola (demasiados parámetros)

  const ESTRUCTURAS = {
    independiente: { nombre: T('Independientes'), cor: '', pesos: false },
    cs: { nombre: T('Simetría compuesta'), cor: 'corCompSymm(form = ~ .orden | .unidad)', pesos: false },
    csh: { nombre: T('Simetría compuesta heterogénea'), cor: 'corCompSymm(form = ~ .orden | .unidad)', pesos: true },
    ar1: { nombre: 'AR(1)', cor: 'corAR1(form = ~ .orden | .unidad)', pesos: false },
    arh1: { nombre: T('AR(1) heterogénea'), cor: 'corAR1(form = ~ .orden | .unidad)', pesos: true },
    car1: { nombre: T('AR(1) continua'), cor: 'corCAR1(form = ~ .tnum | .unidad)', pesos: false, numerico: true },
    un: { nombre: T('No estructurada'), cor: 'corSymm(form = ~ .orden | .unidad)', pesos: true },
  };

  /** Lee y valida los papeles. */
  function leerDiseno(tabla, e) {
    const col = (v, papel) => {
      exigir(v, T('Elige la columna de {p}.', { p: papel }));
      exigir(tabla.columnas[v], T('No existe la columna «{c}».', { c: v }));
      return tabla.col(v);
    };
    exigir(col(e.respuesta, T('respuesta')).tipo === 'numerica', T('La respuesta «{r}» debe ser numérica.', { r: e.respuesta }));
    const ct = col(e.tiempo, T('tiempo')), cs = col(e.sujeto, T('unidad medida (sujeto)'));
    const trats = lista(e.tratamientos);
    exigir(trats.length <= 2, T('Elige hasta dos factores de tratamiento.'));
    trats.forEach(t => col(t, T('tratamiento')));
    if (e.bloque) col(e.bloque, T('bloques'));
    const todas = [e.respuesta, e.tiempo, e.sujeto, ...trats, e.bloque].filter(Boolean);
    exigir(new Set(todas).size === todas.length, T('Cada papel del diseño necesita una columna distinta.'));
    const tiempoNum = ct.tipo === 'numerica';
    const fechas = new Set();
    for (let i = 0; i < tabla.n; i++) { const v = tiempoNum ? ct.valores[i] : ct.codigos[i]; if (v === v && v !== -1) fechas.add(v); }
    exigir(fechas.size >= 2, T('El tiempo necesita al menos dos fechas distintas.'));
    exigir(cs.tipo === 'factor' || cs.tipo === 'numerica', T('La unidad medida debe identificar cada planta, parcela o animal.'));
    return { trats, tiempoNum, k: fechas.size, aFactor: trats.filter(t => tabla.col(t).tipo === 'numerica'), sujetoNum: cs.tipo === 'numerica', bloqueNum: e.bloque && tabla.col(e.bloque).tipo === 'numerica' };
  }

  /** Las estructuras que se ajustan: las pedidas que aplican (la continua solo con tiempo numérico; la no estructurada
      solo con pocas fechas, salvo que se pida), más la que se fuerce. */
  function estructurasDe(d, op) {
    const pedida = op.estructura && op.estructura !== 'auto' ? op.estructura : '';
    const base = op.estructuras && lista(op.estructuras).length ? lista(op.estructuras) : Object.keys(ESTRUCTURAS);
    const ks = base.filter(k => ESTRUCTURAS[k] && (!ESTRUCTURAS[k].numerico || d.tiempoNum) && (k !== 'un' || d.k <= MAX_UN || k === pedida));
    if (pedida && !ks.includes(pedida)) ks.push(pedida);
    return ks;
  }
  /** Por omisión: los tratamientos dentro de cada fecha; sin tratamientos, las fechas. */
  function comparacionesDe(d, e, op) {
    if (op.comparar !== undefined) {
      const validos = d.trats.concat([e.tiempo]);
      const comparar = lista(op.comparar).filter(v => validos.includes(v));
      const dentro = op.dentro && validos.includes(op.dentro) ? op.dentro : '';
      return { comparar: comparar.filter(v => v !== dentro), dentro: comparar.some(v => v !== dentro) ? dentro : '' };
    }
    if (d.trats.length) return { comparar: d.trats.slice(0, 1), dentro: op.dentro === '' ? '' : e.tiempo };
    return { comparar: [e.tiempo], dentro: '' };
  }
  const fijosDe = (d, e) => (d.trats.length ? d.trats.map(t => M().nombreR(t)).join(' * ') + ' * ' + M().nombreR(e.tiempo) : M().nombreR(e.tiempo)) + (e.bloque ? ' + ' + M().nombreR(e.bloque) : '');

  function preparar(tabla, e, op) {
    const d = leerDiseno(tabla, e), R = M(), ks = estructurasDe(d, op), { comparar, dentro } = comparacionesDe(d, e, op);
    exigir(ks.length, T('Elige al menos una estructura de covarianza.'));
    const forzada = op.estructura && op.estructura !== 'auto' ? op.estructura : '';
    exigir(!forzada || ESTRUCTURAS[forzada], T('Estructura de covarianza desconocida: {e}.', { e: forzada }));
    const t = R.textoR(e.tiempo), nivel = Number(op.nivel) || 0.95, F = R.nombreR(e.respuesta) + ' ~ ' + fijosDe(d, e);
    const L = ['suppressPackageStartupMessages(library(nlme))'];
    if (comparar.length) L.push('suppressPackageStartupMessages(library(emmeans))', 'emm_options(msg.interaction = FALSE, msg.nesting = FALSE)');
    for (const v of d.aFactor) L.push('datos[[' + R.textoR(v) + ']] <- factor(datos[[' + R.textoR(v) + ']])');
    /* el tiempo numérico en unidades del intervalo más corto entre fechas: así la AR(1) continua es la AR(1) cuando las fechas
       son parejas y su parámetro es la correlación entre dos fechas seguidas (con días, el optimizador se atora) */
    L.push(d.tiempoNum ? '.tnum <- datos[[' + t + ']] / min(diff(sort(unique(datos[[' + t + ']]))))' : '.tnum <- as.integer(datos[[' + t + ']])',
      'datos[[' + t + ']] <- factor(datos[[' + t + ']])',
      'datos$.orden <- as.integer(datos[[' + t + ']])',
      'datos$.tnum <- .tnum',
      'datos$.unidad <- interaction(datos[' + 'c(' + [e.sujeto, ...d.trats, e.bloque].filter(Boolean).map(R.textoR).join(', ') + ')], drop = TRUE, lex.order = TRUE)',
      'datos <- datos[order(datos$.unidad, datos$.orden), ]',
      'ajustes <- list(');
    ks.forEach((k, i) => {
      const E = ESTRUCTURAS[k];
      L.push('  ' + k + ' = tryCatch(gls(' + F + ', data = datos' + (E.cor ? ', correlation = ' + E.cor : '') +
        (E.pesos ? ', weights = varIdent(form = ~ 1 | ' + R.nombreR(e.tiempo) + ')' : '') + ', method = "REML", na.action = na.omit), error = function(e) conditionMessage(e))' + (i < ks.length - 1 ? ',' : ''));
    });
    L.push(')',
      'crit <- vapply(ajustes, function(m) if (is.character(m)) NA_real_ else ' + (op.criterio === 'bic' ? 'BIC' : 'AIC') + '(m), 0)',
      forzada ? 'elegida <- ' + R.textoR(forzada) : 'elegida <- names(crit)[which.min(crit)]',
      'if (!length(elegida)) stop("ninguna estructura de covarianza se pudo ajustar")',
      'if (is.character(ajustes[[elegida]])) stop(ajustes[[elegida]])',
      'm <- ajustes[[elegida]]',
      'gle <- m$dims$N - m$dims$p',
      'a <- anova(m, type = "marginal")',
      'a <- a[rownames(a) != "(Intercept)", , drop = FALSE]',
      'tt <- summary(m)$tTable',
      'V <- tryCatch({ g <- getGroups(m); k <- which.max(tabulate(as.integer(g))); uso <- datos[names(residuals(m)), ]',
      '  list(tiempos = as.character(uso[[' + t + ']][uso$.unidad == levels(g)[k]]), matriz = unclass(getVarCov(m, individual = k))) }, error = function(e) NULL)',
      'cs <- m$modelStruct$corStruct',
      'vs <- m$modelStruct$varStruct',
      'info <- function(f) unname(vapply(ajustes, function(x) if (is.character(x)) NA_real_ else f(x), 0))');
    if (comparar.length) {
      L.push('medias <- lapply(' + 'c(' + comparar.map(R.textoR).join(', ') + '), function(f) {',
        '  e <- update(emmeans(m, specs = f' + (dentro ? ', by = ' + R.textoR(dentro) : '') + ', mode = "df.error", data = datos), df = gle)',
        '  list(factor = f, medias = as.data.frame(summary(e, level = ' + nivel + ', infer = c(TRUE, FALSE))),',
        '       pares = if (nlevels(datos[[f]]) <= 50) as.data.frame(pairs(e, adjust = ' + R.textoR(X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey') + ')) else NULL)',
        '})');
    }
    L.push('list(',
      '  estructuras = list(clave = names(ajustes), npar = info(function(x) attr(logLik(x), "df")), logLik = info(function(x) as.numeric(logLik(x))), AIC = info(AIC), BIC = info(BIC),',
      '                     error = unname(vapply(ajustes, function(x) if (is.character(x)) x else "", ""))),',
      '  elegida = elegida, gl = gle,',
      '  anova = list(termino = rownames(a), gl1 = a$numDF, F = a[["F-value"]], p = a[["p-value"]]),',
      '  coeficientes = list(nombre = rownames(tt), estimado = unname(tt[, 1]), ee = unname(tt[, 2]), t = unname(tt[, 3]), p = unname(tt[, 4])),',
      '  correlacion = if (is.null(cs)) NULL else list(parametro = names(coef(cs, unconstrained = FALSE)), valor = unname(coef(cs, unconstrained = FALSE))),',
      '  varianzas = if (is.null(vs)) NULL else list(nivel = names(coef(vs, unconstrained = FALSE, allCoef = TRUE)), razon = unname(coef(vs, unconstrained = FALSE, allCoef = TRUE))),',
      '  sigma = m$sigma, covarianza = V,',
      '  ajuste = list(n = m$dims$N, logLik = as.numeric(logLik(m)), AIC = AIC(m), BIC = BIC(m)),',
      comparar.length ? '  medias = medias,' : '  medias = NULL,',
      '  filas = as.integer(names(residuals(m))),',
      '  residuos = unname(as.numeric(resid(m, type = "normalized"))), ajustados = unname(as.numeric(fitted(m))),',
      '  versiones = list(R = paste(R.version$major, R.version$minor, sep = "."), nlme = as.character(packageVersion("nlme"))' + (comparar.length ? ', emmeans = as.character(packageVersion("emmeans"))' : '') + ')',
      ')');
    return { columnas: [e.respuesta, e.tiempo, e.sujeto, ...d.trats, e.bloque].filter(Boolean), codigo: L.join('\n'), paquetes: comparar.length ? ['emmeans'] : [],
      mensaje: T('Ajustando las estructuras de covarianza en el motor R…'),
      arreglo: T('Revisa que cada unidad tenga varias fechas y que la columna de unidad identifique cada planta, parcela o animal.') };
  }

  /** Supuestos sobre los residuos normalizados (pruebas del núcleo, ya validadas). */
  function diagnostico(tabla, e, res, filas) {
    const out = { normalidad: null, varianzas: null }, ok = res.filter(Number.isFinite);
    try { if (ok.length >= 3 && ok.length <= 5000) out.normalidad = SP.sup.shapiro(ok); } catch (err) { /* sin prueba */ }
    if (filas.length === res.length) {
      try {
        const col = tabla.col(e.tiempo).tipo === 'factor' ? tabla.col(e.tiempo) : SP.estructura.comoFactor(tabla, e.tiempo);
        out.varianzas = SP.sup.levene(Float64Array.from(res), Int32Array.from(filas, i => col.codigos[i - 1]));
      } catch (err) { /* sin prueba */ }
    }
    return out;
  }

  function leer(v, avisos, tabla, e, op) {
    const d = leerDiseno(tabla, e), R = M(), { dentro } = comparacionesDe(d, e, op), alfa = Number(op.alfa) || 0.05;
    const es = v.estructuras || {}, an = v.anova || {}, cf = v.coeficientes || {}, aj = v.ajuste || {}, gl = Number(v.gl);
    const claves = A(es.clave);
    const res = A(v.residuos), filas = A(v.filas);
    const cor = v.correlacion ? { parametro: A(v.correlacion.parametro), valor: A(v.correlacion.valor) } : null;
    const cov = v.covarianza ? { tiempos: A(v.covarianza.tiempos), matriz: v.covarianza.matriz && v.covarianza.matriz.valores ? v.covarianza.matriz.valores : [[Number(v.covarianza.matriz)]] } : null;
    return {
      tipo: 'repetidas', respuesta: e.respuesta, tiempo: e.tiempo, sujeto: e.sujeto, tratamientos: d.trats, bloque: e.bloque || '',
      formula: R.nombreR(e.respuesta) + ' ~ ' + fijosDe(d, e), criterio: op.criterio === 'bic' ? 'BIC' : 'AIC', forzada: op.estructura && op.estructura !== 'auto' ? op.estructura : '',
      alfa, nivel: Number(op.nivel) || 0.95,
      estructuras: claves.map((k, i) => ({ clave: k, nombre: ESTRUCTURAS[k] ? ESTRUCTURAS[k].nombre : k, npar: A(es.npar)[i], logLik: A(es.logLik)[i], AIC: A(es.AIC)[i], BIC: A(es.BIC)[i], error: A(es.error)[i] || '' })),
      elegida: String(v.elegida), gl,
      anova: { termino: A(an.termino), gl1: A(an.gl1), gl2: A(an.termino).map(() => gl), F: A(an.F), p: A(an.p) },
      coeficientes: { nombre: A(cf.nombre), estimado: A(cf.estimado), ee: A(cf.ee), gl: A(cf.nombre).map(() => gl), t: A(cf.t), p: A(cf.p) },
      correlacion: cor, varianzas: v.varianzas ? { nivel: A(v.varianzas.nivel), razon: A(v.varianzas.razon) } : null,
      sigma: Number(v.sigma), covarianza: cov,
      ajuste: { n: Number(aj.n), logLik: aj.logLik, AIC: aj.AIC, BIC: aj.BIC },
      medias: A(v.medias).map(x => X().leerMedias(x, dentro, alfa, X().AJUSTES.includes(op.ajuste) ? op.ajuste : 'tukey')),
      supuestos: diagnostico(tabla, e, res, filas),
      n: Number(aj.n), excluidas: tabla.n - Number(aj.n),
      valores: { residuos: res, ajustados: A(v.ajustados), filas },
      avisos: X().traducir(avisos), avisosR: A(avisos), versiones: v.versiones || {},
    };
  }

  /* ======================= reporte ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const etiqueta = s => String(s).split(':').join(' × ');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const colorP = (p, alfa) => (SP.sup && SP.sup.color ? SP.sup.color(p, alfa) : 'gris');

  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [];
    const el = r.estructuras.find(x => x.clave === r.elegida) || { nombre: r.elegida };
    conclusiones.push(r.forzada ? T('Estructura de covarianza pedida: {e} ({c} = {v}).', { e: el.nombre, c: r.criterio, v: f2(el[r.criterio]) })
      : T('La estructura de covarianza con menor {c} es {e} ({c} = {v}).', { c: r.criterio, e: el.nombre, v: f2(el[r.criterio]) }));
    r.anova.termino.forEach((t, k) => {
      if (!Number.isFinite(r.anova.p[k])) return;
      const s = { t: etiqueta(t), g1: r.anova.gl1[k], g2: r.anova.gl2[k], F: f2(r.anova.F[k]), p: fp(r.anova.p[k]) };
      conclusiones.push(r.anova.p[k] < a ? T('{t}: tiene efecto (F({g1}, {g2}) = {F}, p {p}).', s) : T('{t}: sin evidencia de efecto (F({g1}, {g2}) = {F}, p {p}).', s));
    });
    if (r.correlacion && r.correlacion.parametro.length === 1 && r.correlacion.parametro[0]) {
      conclusiones.push(T('Correlación entre fechas de una misma unidad: {p} = {v}.', { p: r.correlacion.parametro[0] === 'Phi' ? 'φ' : 'ρ', v: r.correlacion.valor[0].toFixed(3) }));
    }
    cuadros.push({ id: 'estructuras', titulo: T('Estructuras de covarianza comparadas (REML)'),
      columnas: [col('nombre', T('Estructura'), 'texto'), col('npar', T('Parámetros'), 'entero'), col('logLik', T('Log-verosimilitud'), 'sig'), col('AIC', 'AIC', 'sig'), col('BIC', 'BIC', 'sig'), col('marca', '', 'texto')],
      filas: r.estructuras.map(x => ({ nombre: x.nombre, npar: x.npar, logLik: x.logLik, AIC: x.AIC, BIC: x.BIC, marca: x.clave === r.elegida ? T('elegida') : x.error ? T('no se pudo ajustar') : '' })),
      notas: [T('Todas con los mismos efectos fijos y por REML, así que sus AIC y BIC se pueden comparar. El menor indica la mejor.')]
        .concat(r.estructuras.some(x => x.error) ? [T('Las que no se pudieron ajustar suelen pedir más parámetros de los que los datos sostienen.')] : []) });
    cuadros.push({ id: 'anova', titulo: T('Efectos fijos con {e}: {f}', { e: el.nombre, f: r.formula }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl1', T('gl num.'), 'entero'), col('gl2', T('gl den.'), 'entero'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.anova.termino.map((t, k) => ({ fuente: etiqueta(t), gl1: r.anova.gl1[k], gl2: r.anova.gl2[k], F: r.anova.F[k], p: r.anova.p[k] })),
      notas: [T('Pruebas marginales (como las sumas de cuadrados tipo III); grados de libertad del error, N − p, como nlme.')].concat(r.avisos) });
    if (r.covarianza && r.covarianza.matriz.length > 1) {
      const tv = r.covarianza.tiempos, Mx = r.covarianza.matriz;
      cuadros.push({ id: 'covarianza', titulo: T('Covarianzas entre fechas (abajo y en la diagonal) y correlaciones (arriba)'),
        columnas: [col('t', r.tiempo, 'texto')].concat(tv.map((x, j) => col('c' + j, x, 'sig'))),
        filas: tv.map((x, i) => Object.assign({ t: x }, Object.fromEntries(tv.map((y, j) => ['c' + j, j <= i ? Mx[i][j] : Mx[i][j] / Math.sqrt(Mx[i][i] * Mx[j][j])])))),
        notas: [T('Matriz estimada para una unidad medida en todas las fechas.')] });
    }
    for (const md of r.medias) {
      const conLetras = md.filas.some(f => f.letras);
      cuadros.push({ id: 'medias-' + md.factor, titulo: md.dentro ? T('Medias de «{f}» en cada «{d}»', { f: md.factor, d: md.dentro }) : T('Medias marginales de «{f}»', { f: md.factor }),
        columnas: (md.dentro ? [col('por', md.dentro, 'texto')] : []).concat([col('nivel', md.factor, 'texto'), col('media', T('Media'), 'sig'), col('ee', T('EE'), 'sig'),
          col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')]).concat(conLetras ? [col('letras', T('Grupo'), 'texto')] : []),
        filas: md.filas.map(f => ({ por: f.por, nivel: f.nivel, media: f.media, ee: f.ee, ic: f.ic, letras: f.letras })),
        notas: [T('Medias marginales estimadas (emmeans) con {g} grados de libertad.', { g: r.gl })]
          .concat(conLetras ? [T('Medias con la misma letra no difieren según {a} (α = {al}).', { a: X().NOMBRE_AJUSTE[md.ajuste], al: a })] : []) });
    }
    const c = r.coeficientes;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes de los efectos fijos'),
      columnas: [col('termino', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: c.nombre.map((nm, j) => ({ termino: nm === '(Intercept)' ? T('(Intercepto)') : nm, b: c.estimado[j], ee: c.ee[j], t: c.t[j], p: c.p[j] })),
      notas: [T('Con contrastes de tratamiento: cada nivel comparado con el primero.')] });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo elegido'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'sig')],
      filas: [{ medida: T('Observaciones'), valor: r.ajuste.n }, { medida: T('Desviación estándar residual (σ)'), valor: r.sigma }, { medida: T('Log-verosimilitud (REML)'), valor: r.ajuste.logLik },
        { medida: 'AIC', valor: r.ajuste.AIC }, { medida: 'BIC', valor: r.ajuste.BIC }].concat(r.correlacion ? r.correlacion.valor.slice(0, 1).map((x, i) => ({ medida: T('Parámetro de correlación ({p})', { p: r.correlacion.parametro[i] || 'ρ' }), valor: x })) : []),
      notas: r.excluidas > 0 ? [T('{k} filas con datos faltantes quedaron fuera.', { k: r.excluidas })] : [] });
    const s = r.supuestos, semaforo = [], recomendaciones = [];
    semaforo.push(s.normalidad ? { nombre: T('Normalidad de los residuos'), color: colorP(s.normalidad.p, 0.05), texto: T('Residuos normalizados: Shapiro-Wilk W = {w}, p {p}.', { w: s.normalidad.W.toFixed(3), p: fp(s.normalidad.p) }) }
      : { nombre: T('Normalidad de los residuos'), color: 'gris', texto: T('Sin prueba; revisa el gráfico Q-Q.') });
    if (s.varianzas) semaforo.push({ nombre: T('Varianzas entre fechas'), color: colorP(s.varianzas.p, 0.05), texto: T('Levene (mediana) de los residuos normalizados entre fechas: F = {F}, p {p}.', { F: f2(s.varianzas.F), p: fp(s.varianzas.p) }) });
    if (semaforo.some(x => x.color === 'rojo' || x.color === 'ambar')) recomendaciones.push(T('Prueba una estructura heterogénea (varianza distinta en cada fecha) o una transformación de la respuesta.'));
    return { titulo: T('Medidas repetidas en el tiempo'), conclusiones: conclusiones.map(may), cuadros, semaforo, recomendaciones };
  }

  function codigoR(e, op, ctx) {
    const R = M(), trats = lista(e.tratamientos), forzada = op.estructura && op.estructura !== 'auto' ? op.estructura : '';
    const fijos = (trats.length ? trats.map(R.nombreR).join(' * ') + ' * ' + R.nombreR(e.tiempo) : R.nombreR(e.tiempo)) + (e.bloque ? ' + ' + R.nombreR(e.bloque) : '');
    const F = R.nombreR(e.respuesta) + ' ~ ' + fijos, ver = forzada || (ctx && ctx.resultado && ctx.resultado.elegida) || 'ar1';
    const E = ESTRUCTURAS[ver] || ESTRUCTURAS.ar1;
    const L = ['# Medidas repetidas en el tiempo (código R equivalente a SigmaPro)', 'library(nlme)',
      'datos$.tnum <- datos$' + R.nombreR(e.tiempo) + '            # el tiempo como número (para AR(1) continua)',
      'datos$' + R.nombreR(e.tiempo) + ' <- factor(datos$' + R.nombreR(e.tiempo) + ')',
      'datos$.orden <- as.integer(datos$' + R.nombreR(e.tiempo) + ')',
      'datos$.unidad <- interaction(datos[c(' + [e.sujeto, ...trats, e.bloque].filter(Boolean).map(R.textoR).join(', ') + ')], drop = TRUE)',
      '# una estructura (la elegida); SigmaPro ajusta todas las candidatas y compara su ' + (op.criterio === 'bic' ? 'BIC' : 'AIC'),
      'modelo <- gls(' + F + ', data = datos' + (E.cor ? ', correlation = ' + E.cor : '') + (E.pesos ? ', weights = varIdent(form = ~ 1 | ' + R.nombreR(e.tiempo) + ')' : '') + ', method = "REML", na.action = na.omit)',
      'AIC(modelo); BIC(modelo)',
      'anova(modelo, type = "marginal")   # efectos fijos',
      'summary(modelo)', 'getVarCov(modelo)   # covarianzas entre fechas de una unidad'];
    const { comparar, dentro } = comparacionesDe({ trats }, e, op);
    if (comparar.length) {
      L.push('library(emmeans)');
      for (const f of comparar) L.push('medias <- update(emmeans(modelo, ' + R.textoR(f) + (dentro ? ', by = ' + R.textoR(dentro) : '') + ', mode = "df.error"), df = modelo$dims$N - modelo$dims$p)', 'medias', 'pairs(medias, adjust = "' + (op.ajuste || 'tukey') + '")');
    }
    return L.join('\n');
  }

  SP.repetidas = { ESTRUCTURAS, leerDiseno, estructurasDe, comparacionesDe, preparar, leer, reporte, codigoR };

  SP.metodo({
    id: 'medidas-repetidas', familia: 'mixtos', motor: 'r', orden: 60, nombre: T('Medidas repetidas en el tiempo'),
    resumen: T('La misma planta, parcela o animal medida en varias fechas: compara las estructuras de covarianza entre fechas (simetría compuesta, AR(1), no estructurada…), elige la mejor y prueba tratamientos, tiempo y su interacción.'),
    paquetes: ['nlme'],
    entradas: { respuesta: { tipo: 'numerica' }, tiempo: { tipo: 'cualquiera' }, sujeto: { tipo: 'cualquiera' }, tratamientos: { tipo: 'factor+' }, bloque: { tipo: 'factor' } },
    opciones: { estructura: { tipo: 'opcion', omision: 'auto' }, estructuras: { tipo: 'lista', omision: [] }, criterio: { tipo: 'opcion', omision: 'aic' }, comparar: { tipo: 'lista', omision: undefined },
      dentro: { tipo: 'texto', omision: undefined }, ajuste: { tipo: 'opcion', omision: 'tukey' }, alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar(tabla, e, op) {
      const d = leerDiseno(tabla, e);
      exigir(estructurasDe(d, op).length, T('Elige al menos una estructura de covarianza.'));
      exigir(!op.estructura || op.estructura === 'auto' || ESTRUCTURAS[op.estructura], T('Estructura de covarianza desconocida: {e}.', { e: op.estructura }));
      exigir(!(op.estructura === 'car1' && !d.tiempoNum), T('La AR(1) continua necesita el tiempo como número (días, semanas).'));
      exigir(['aic', 'bic'].includes(op.criterio), T('El criterio para elegir la estructura es AIC o BIC.'));
      exigir(X().AJUSTES.includes(op.ajuste), T('El ajuste de las comparaciones es Tukey, Bonferroni, Holm, Šidák o ninguno.'));
    },
    preparar, leer, reporte, codigoR,
  });
});
