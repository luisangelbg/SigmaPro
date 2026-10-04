/* SigmaPro — análisis multivariado (familia Análisis multivariado), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Varias variables respuesta a la vez (rendimiento, altura, peso de grano; o medidas de un fruto):
   - manova: el efecto de los tratamientos sobre el vector de respuestas en completamente al azar, bloques o
     factorial, con Pillai, Wilks, Hotelling-Lawley y Roy, y el ANOVA de cada respuesta, como manova y summary.manova;
   - discriminante: las funciones que mejor separan los grupos, sus coeficientes, los centroides y la tabla de
     clasificación con y sin validación cruzada, como MASS::lda.
   El ACP, las correspondencias y los conglomerados están en PCAPro y ClusteringPro (la app prepara el CSV). */
SP.definir('metodos-multivariado', function (SP) {
  'use strict';
  const T = SP.T;
  const MV = () => SP.multivariado;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const f2 = x => SP.formatos.texto(x, 'forma2');
  const f3 = x => SP.formatos.texto(x, 'forma');
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + SP.formatos.texto(p, 'forma'));
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nomR = n => (/^[A-Za-z.][A-Za-z0-9._]*$/.test(n) ? n : '`' + n.replace(/`/g, '') + '`');
  const PRUEBAS = { pillai: 'Pillai', wilks: 'Wilks', hotelling: 'Hotelling-Lawley', roy: 'Roy' };

  /** Filas completas, los códigos de cada factor (solo niveles con datos) y la matriz de respuestas. */
  function completas(tabla, numericas, factores) {
    const vs = numericas.map(v => tabla.col(v).valores), fs = factores.map(f => SP.estructura.comoFactor(tabla, f)), filas = [];
    for (let i = 0; i < tabla.n; i++) if (vs.every(v => v[i] === v[i]) && fs.every(f => f.codigos[i] >= 0)) filas.push(i);
    const cods = fs.map(f => {
      const usados = [...new Set(filas.map(i => f.codigos[i]))].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      return { niveles: usados.map(c => f.niveles[c]), cod: filas.map(i => mapa.get(f.codigos[i])) };
    });
    return { filas, Y: filas.map(i => vs.map(v => v[i])), cods, excluidas: tabla.n - filas.length };
  }

  /* ======================= MANOVA ======================= */
  /** Las columnas del modelo como model.matrix: intercepto, bloque, y los términos del factorial en el orden de R. */
  function modelo(cods, nombres, conBloque) {
    const n = cods.length ? cods[0].cod.length : 0, cols = [new Array(n).fill(1)], asig = [0], terminos = [];
    const dummies = k => cods[k].niveles.slice(1).map((_, l) => cods[k].cod.map(c => (c === l + 1 ? 1 : 0)));
    const agregar = (nombre, columnas) => { terminos.push(nombre); for (const c of columnas) { cols.push(c); asig.push(terminos.length); } };
    let desde = 0;
    if (conBloque) { agregar(nombres[0], dummies(0)); desde = 1; }
    const trat = nombres.slice(desde).map((nm, j) => ({ nm, k: desde + j }));
    /* términos del factorial por orden: efectos principales, dobles, triples */
    const combos = [];
    for (let orden = 1; orden <= trat.length; orden++) {
      const rec = (ini, acc) => { if (acc.length === orden) { combos.push(acc.slice()); return; } for (let j = ini; j < trat.length; j++) { acc.push(trat[j]); rec(j + 1, acc); acc.pop(); } };
      rec(0, []);
    }
    for (const cb of combos) {
      let columnas = [new Array(n).fill(1)];
      for (const t of cb) { const d = dummies(t.k); columnas = d.flatMap(dc => columnas.map(c0 => c0.map((v, i) => v * dc[i]))); }
      agregar(cb.map(t => t.nm).join(':'), columnas);
    }
    return { X: cols[0].map((_, i) => cols.map(c => c[i])), asignacion: asig, terminos };
  }
  function calcularManova(tabla, e, op) {
    const resp = [].concat(e.respuestas), trat = [].concat(e.tratamientos), facs = (e.bloque ? [e.bloque] : []).concat(trat);
    const C = completas(tabla, resp, facs);
    exigir(C.filas.length > resp.length + 1, T('Hay muy pocas filas completas.'));
    C.cods.forEach((c, k) => exigir(c.niveles.length >= 2, T('«{f}» tiene un solo nivel con datos.', { f: facs[k] })));
    const M = modelo(C.cods, facs, !!e.bloque), A = MV().manova(C.Y, M.X, M.asignacion, M.terminos);
    /* la M de Box entre las celdas de los tratamientos (sin los bloques): las combinaciones con datos */
    const ct = trat.map(tr => C.cods[facs.indexOf(tr)]), claves = C.filas.map((_, i) => ct.map(c => c.cod[i]).join('|')), celdas = [...new Set(claves)];
    const orden = celdas.map(k => k.split('|').map(Number)).sort((a, b) => { for (let j = a.length - 1; j >= 0; j--) if (a[j] !== b[j]) return a[j] - b[j]; return 0; }).map(v => v.join('|'));
    const box = Object.assign(MV().boxM(C.Y, claves.map(k => orden.indexOf(k)), orden.length), { celdas: orden.map(k => k.split('|').map((c, j) => ct[j].niveles[+c]).join(':')) });
    box.gl_grupo = orden.map(k => claves.filter(x => x === k).length - 1);
    /* el ANOVA de cada respuesta: la diagonal de cada H contra la de E */
    const univariados = resp.map((_, k) => ({ F: A.terminos.map(t => (t.H[k][k] / t.gl) / (A.E[k][k] / A.glE)), p: A.terminos.map(t => SP.dist.pf((t.H[k][k] / t.gl) / (A.E[k][k] / A.glE), t.gl, A.glE, false)) }));
    const medias = C.cods.length ? trat.map(tr => {
      const k = facs.indexOf(tr), c = C.cods[k];
      return { factor: tr, niveles: c.niveles, medias: c.niveles.map((_, l) => resp.map((__, j) => { let s = 0, m = 0; c.cod.forEach((v, i) => { if (v === l) { s += C.Y[i][j]; m++; } }); return s / m; })) };
    }) : [];
    return { tipo: 'multivariado', metodo: 'manova', respuestas: resp, tratamientos: trat, bloque: e.bloque || '', prueba: op.prueba, alfa: +op.alfa,
      terminos: A.terminos, E: A.E, glE: A.glE, n: A.n, excluidas: C.excluidas, univariados, medias, boxM: box };
  }
  function reporteManova(r) {
    const pr = r.prueba, nombre = PRUEBAS[pr], c = [];
    for (const t of r.terminos) {
      if (!t.pruebas) continue;
      const x = t.pruebas[pr];
      c.push(x.p < r.alfa ? T('«{t}» cambia el conjunto de respuestas: {n} = {v}, F({a}, {b}) = {f}, p {p}.', { t: t.termino, n: nombre, v: f3(x.estadistico), a: gl(x.gl1), b: gl(x.gl2), f: f2(x.F), p: fp(x.p) })
        : T('«{t}» no cambia el conjunto de respuestas: {n} = {v}, F({a}, {b}) = {f}, p {p}.', { t: t.termino, n: nombre, v: f3(x.estadistico), a: gl(x.gl1), b: gl(x.gl2), f: f2(x.F), p: fp(x.p) }));
    }
    const filas = [];
    for (const t of r.terminos) if (t.pruebas) for (const k of Object.keys(PRUEBAS)) { const x = t.pruebas[k]; filas.push({ t: k === 'pillai' ? t.termino : '', g: k === 'pillai' ? t.gl : null, prueba: PRUEBAS[k], v: x.estadistico, F: x.F, a: x.gl1, b: x.gl2, p: x.p }); }
    const cuadros = [{ id: 'manova', titulo: T('MANOVA: las cuatro pruebas'), columnas: [col('t', T('Término'), 'texto'), col('g', 'gl', 'entero'), col('prueba', T('Prueba'), 'texto'), col('v', T('Estadístico'), 'forma'),
      col('F', T('F aprox.'), 'forma2'), col('a', T('gl num.'), 'num'), col('b', T('gl den.'), 'num'), col('p', 'p', 'pvalor')], filas,
      notas: [T('Sumas de cuadrados secuenciales (tipo I), como summary.manova; error con {g} gl.', { g: r.glE }), T('Pillai es la más robusta si no se cumplen los supuestos; Roy da una cota superior de F (su p es optimista).')] },
    { id: 'univariados', titulo: T('ANOVA de cada respuesta (F y p)'), columnas: [col('y', T('Respuesta'), 'texto')].concat(r.terminos.flatMap((t, j) => [col('F' + j, 'F · ' + t.termino, 'forma2'), col('p' + j, 'p · ' + t.termino, 'pvalor')])),
      filas: r.respuestas.map((y, k) => Object.assign({ y }, ...r.terminos.map((t, j) => ({ ['F' + j]: r.univariados[k].F[j], ['p' + j]: r.univariados[k].p[j] })))),
      notas: [T('Cada respuesta por separado (summary.aov); con varias respuestas, la MANOVA controla el error del conjunto.')] }];
    if (r.boxM) cuadros.push(cuadroBox(r.boxM, r.boxM.celdas, T('las combinaciones de tratamientos')));
    for (const m of r.medias) cuadros.push({ id: 'medias-' + m.factor, titulo: T('Medias por «{f}»', { f: m.factor }), columnas: [col('n', m.factor, 'texto')].concat(r.respuestas.map((y, j) => col('m' + j, y, 'sig'))),
      filas: m.niveles.map((nv, l) => Object.assign({ n: nv }, ...m.medias[l].map((v, j) => ({ ['m' + j]: v })))) });
    return { titulo: T('MANOVA de {k} respuestas', { k: r.respuestas.length }), conclusiones: c.map(may), cuadros, semaforo: [
      { nombre: T('Observaciones por variable'), color: r.glE >= 3 * r.respuestas.length ? 'verde' : 'ambar', texto: T('{g} gl del error para {k} respuestas (se recomiendan varias veces más gl que respuestas).', { g: r.glE, k: r.respuestas.length }) }, semaforoBox(r.boxM, 'manova')] };
  }
  const gl = g => (Number.isInteger(g) ? String(g) : SP.formatos.texto(g, 'forma2'));
  function codigoManova(e, op) {
    const resp = [].concat(e.respuestas), trat = [].concat(e.tratamientos), facs = (e.bloque ? [e.bloque] : []).concat(trat);
    const der = (e.bloque ? [nomR(e.bloque)] : []).concat([trat.map(nomR).join(' * ')]).join(' + ');
    return ['# MANOVA (código R equivalente a SigmaPro)', `d <- na.omit(datos[, c(${resp.concat(facs).map(v => JSON.stringify(v)).join(', ')})])`]
      .concat(facs.map(f => `d$${nomR(f)} <- factor(d$${nomR(f)})`), [
        `fit <- manova(cbind(${resp.map(nomR).join(', ')}) ~ ${der}, data = d)`,
        `summary(fit, test = "${PRUEBAS[op.prueba] || 'Pillai'}")   # también "Pillai", "Wilks", "Hotelling-Lawley", "Roy"`,
        'summary.aov(fit)   # el ANOVA de cada respuesta',
        `heplots::boxM(d[, c(${resp.map(v => JSON.stringify(v)).join(', ')})], interaction(${trat.map(t => 'd$' + nomR(t)).join(', ')}, drop = TRUE))   # covarianzas iguales`]).join('\n');
  }

  /* ---------------- prueba M de Box (supuesto de la MANOVA y del discriminante) ---------------- */
  /** El color, el cuadro y la frase de la M de Box. */
  function semaforoBox(B, uso) {
    if (!B || !Number.isFinite(B.p)) return { nombre: T('Covarianzas iguales (M de Box)'), color: 'gris', texto: T('Hay muy pocas unidades por grupo para la prueba M de Box.') };
    const t = T('M de Box: χ²({g}) = {x}, p {p}.', { g: B.gl, x: f2(B.chi2), p: fp(B.p) });
    if (B.p >= 0.05) return { nombre: T('Covarianzas iguales (M de Box)'), color: 'verde', texto: t + ' ' + T('Sin evidencia de que las covarianzas difieran entre grupos.') };
    if (B.p >= 0.001) return { nombre: T('Covarianzas iguales (M de Box)'), color: 'ambar', texto: t + ' ' + T('La prueba es muy sensible (también a la falta de normalidad): con p entre 0.001 y 0.05 suele aceptarse.') };
    return { nombre: T('Covarianzas iguales (M de Box)'), color: 'rojo', texto: t + ' ' + (uso === 'manova'
      ? T('Las covarianzas difieren: usa la traza de Pillai, la más robusta, y procura grupos de tamaño parecido.')
      : T('Las covarianzas difieren: la regla lineal puede clasificar peor los grupos más variables; revisa la tabla de validación cruzada.')) };
  }
  function cuadroBox(B, nombres, quien) {
    return { id: 'box', titulo: T('Prueba M de Box (igualdad de covarianzas entre {q})', { q: quien }),
      columnas: [col('g', T('Grupo'), 'texto'), col('n', T('gl'), 'entero'), col('l', T('log |S|'), 'forma')],
      filas: nombres.map((nm, h) => ({ g: nm, n: B.gl_grupo[h], l: B.logdet[h] })).concat([{ g: T('Combinada'), n: B.gl_grupo.reduce((a, b) => a + b, 0), l: B.logdet_combinada }]),
      notas: [T('χ²({g}) = {x}, p {p} (aproximación de Box, como heplots::boxM).', { g: B.gl, x: f2(B.chi2), p: fp(B.p) })].concat(B.excluidos ? [T('{k} grupo(s) con menos unidades que variables quedan fuera de la prueba.', { k: B.excluidos })] : []) };
  }

  /* ======================= discriminante ======================= */
  function calcularLda(tabla, e, op) {
    const vars = [].concat(e.variables), C = completas(tabla, vars, [e.grupo]), g = C.cods[0];
    exigir(g.niveles.length >= 2, T('«{g}» necesita al menos dos grupos con datos.', { g: e.grupo }));
    exigir(C.filas.length > vars.length + g.niveles.length, T('Hay muy pocas filas completas para tantas variables.'));
    const L = MV().lda(C.Y, g.cod, g.niveles.length);
    const box = MV().boxM(C.Y, g.cod, g.niveles.length);
    box.gl_grupo = g.niveles.map((_, h) => g.cod.filter(c => c === h).length - 1);
    const tabla2 = cl => g.niveles.map((_, a) => g.niveles.map((__, b) => cl.reduce((s, c, i) => s + (g.cod[i] === a && c === b ? 1 : 0), 0)));
    const acierto = cl => cl.reduce((s, c, i) => s + (c === g.cod[i] ? 1 : 0), 0) / cl.length;
    return { tipo: 'multivariado', metodo: 'discriminante', variables: vars, grupo: e.grupo, niveles: g.niveles, n: C.filas.length, excluidas: C.excluidas,
      escala: L.escala, sv: L.sv, proporcion: L.proporcion, medias: L.medias, previa: L.previa, puntajes: L.puntajes, centroides: L.medias_puntaje,
      posterior: L.posterior, clase: L.clase, cv: L.cv, grupoReal: g.cod, filas: C.filas,
      clasificacion: tabla2(L.clase), clasificacion_cv: tabla2(L.cv.clase), acierto: acierto(L.clase), acierto_cv: acierto(L.cv.clase), boxM: box };
  }
  function reporteLda(r) {
    const k = r.sv.length, pct = x => SP.formatos.texto(100 * x, 'pct');
    const c = [k > 1 ? T('{k} funciones discriminantes: la primera explica el {p} % de la separación entre grupos.', { k, p: pct(r.proporcion[0]) })
      : T('Una función discriminante (con dos grupos, una sola basta para separarlos).'),
      T('Con validación cruzada (dejando uno fuera), el {a} % de las unidades se clasifica en su grupo (el {b} % con los mismos datos del ajuste, que es optimista).', { a: pct(r.acierto_cv), b: pct(r.acierto) })];
    const top = r.variables.map((v, j) => [v, Math.abs(r.escala[j][0])]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => '«' + x[0] + '»');
    c.push(T('Las variables con más peso en la primera función: {l} (coeficientes sin estandarizar: comparar solo si las escalas son parecidas).', { l: top.join(', ') }));
    const cuadros = [{ id: 'funciones', titulo: T('Funciones discriminantes'), columnas: [col('f', T('Función'), 'texto'), col('sv', T('Valor singular'), 'forma'), col('p', T('Proporción de la traza'), 'forma')],
      filas: r.sv.map((v, j) => ({ f: 'LD' + (j + 1), sv: v, p: r.proporcion[j] })), notas: [T('La proporción de la traza dice cuánto de la separación entre grupos explica cada función.')] },
    { id: 'coeficientes', titulo: T('Coeficientes de las funciones discriminantes'), columnas: [col('v', T('Variable'), 'texto')].concat(r.sv.map((_, j) => col('c' + j, 'LD' + (j + 1), 'forma'))),
      filas: r.variables.map((v, i) => Object.assign({ v }, ...r.sv.map((_, j) => ({ ['c' + j]: r.escala[i][j] })))), notas: [T('Como scaling de MASS::lda (la varianza dentro de grupos de cada función es 1). El signo de cada función es arbitrario: aquí el coeficiente mayor es positivo.')] },
    { id: 'centroides', titulo: T('Centroides de los grupos'), columnas: [col('g', r.grupo, 'texto')].concat(r.sv.map((_, j) => col('c' + j, 'LD' + (j + 1), 'forma'))),
      filas: r.niveles.map((nv, h) => Object.assign({ g: nv }, ...r.sv.map((_, j) => ({ ['c' + j]: r.centroides[h][j] })))) },
    { id: 'clasificacion', titulo: T('Clasificación con validación cruzada (filas: grupo real)'), columnas: [col('g', r.grupo, 'texto')].concat(r.niveles.map((nv, h) => col('k' + h, nv, 'entero')), [col('a', T('% correcto'), 'pct')]),
      filas: r.niveles.map((nv, a) => Object.assign({ g: nv, a: 100 * r.clasificacion_cv[a][a] / r.clasificacion_cv[a].reduce((s, v) => s + v, 0) }, ...r.niveles.map((_, b) => ({ ['k' + b]: r.clasificacion_cv[a][b] })))),
      notas: [T('Cada unidad se clasifica con la función ajustada sin ella (lda con CV = TRUE). Previas: las proporciones de los grupos.')] }];
    if (r.boxM) cuadros.push(cuadroBox(r.boxM, r.niveles, T('los grupos')));
    return { titulo: T('Análisis discriminante lineal por «{g}»', { g: r.grupo }), conclusiones: c, cuadros, semaforo: [
      { nombre: T('Tamaño de los grupos'), color: Math.min(...r.clasificacion.map(f => f.reduce((s, v) => s + v, 0))) > r.variables.length ? 'verde' : 'ambar',
        texto: T('El grupo más chico tiene {n} unidades para {k} variables (conviene que cada grupo tenga más unidades que variables).', { n: Math.min(...r.clasificacion.map(f => f.reduce((s, v) => s + v, 0))), k: r.variables.length }) }, semaforoBox(r.boxM, 'discriminante')] };
  }
  function codigoLda(e) {
    const vars = [].concat(e.variables);
    return ['# Análisis discriminante lineal (código R equivalente a SigmaPro)', 'library(MASS)', `d <- na.omit(datos[, c(${vars.concat([e.grupo]).map(v => JSON.stringify(v)).join(', ')})])`,
      `x <- as.matrix(d[, c(${vars.map(v => JSON.stringify(v)).join(', ')})]); g <- factor(d[[${JSON.stringify(e.grupo)}]])`,
      'fit <- lda(x, g); fit   # scaling: coeficientes; svd: valores singulares', 'prop <- fit$svd^2 / sum(fit$svd^2); prop',
      'cv <- lda(x, g, CV = TRUE); table(real = g, clasificado = cv$class)   # validación cruzada', 'mean(cv$class == g)',
      'heplots::boxM(x, g)   # covarianzas iguales entre grupos (M de Box)'].join('\n');
  }

  SP.metodosMultivariado = { modelo, completas, PRUEBAS };
  SP.metodo({ id: 'manova', familia: 'multivariado', motor: 'js', orden: 10, nombre: T('MANOVA (varias respuestas a la vez)'),
    resumen: T('El efecto de los tratamientos sobre varias variables juntas: Pillai, Wilks, Hotelling-Lawley y Roy.'),
    entradas: { respuestas: { tipo: 'numerica+', maximo: 10 }, tratamientos: { tipo: 'factor+', maximo: 3 }, bloque: { tipo: 'factor', opcional: true } },
    opciones: { prueba: { tipo: 'texto', omision: 'pillai' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (t, e, op) => {
      const resp = [].concat(e.respuestas || []), trat = [].concat(e.tratamientos || []);
      exigir(resp.length >= 2, T('Elige al menos dos variables respuesta (con una sola, usa el ANOVA).'));
      exigir(trat.length >= 1 && trat.length <= 3, T('Elige de uno a tres factores de tratamiento.'));
      exigir(new Set(resp.concat(trat, e.bloque ? [e.bloque] : [])).size === resp.length + trat.length + (e.bloque ? 1 : 0), T('Cada columna va en un solo papel.'));
      exigir(PRUEBAS[op.prueba], T('Prueba desconocida.'));
    }, calcular: calcularManova, reporte: reporteManova, codigoR: codigoManova });
  SP.metodo({ id: 'discriminante', familia: 'multivariado', motor: 'js', orden: 20, nombre: T('Análisis discriminante lineal'),
    resumen: T('Qué combinación de variables separa mejor los grupos (variedades, orígenes) y qué tan bien clasifica.'),
    entradas: { variables: { tipo: 'numerica+', maximo: 15 }, grupo: { tipo: 'factor' } }, opciones: {},
    validar: (t, e) => {
      const vs = [].concat(e.variables || []);
      exigir(vs.length >= 2, T('Elige al menos dos variables.'));
      exigir(e.grupo && t.columnas[e.grupo] && !vs.includes(e.grupo), T('Elige la columna de los grupos (distinta de las variables).'));
    }, calcular: calcularLda, reporte: reporteLda, codigoR: codigoLda });
});
