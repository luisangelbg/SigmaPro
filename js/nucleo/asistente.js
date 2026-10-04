/* SigmaPro — asistente: preguntas en lenguaje claro → análisis recomendado, con su porqué.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Módulo puro (sin DOM): la interfaz le pasa las respuestas y la descripción de la tabla, y recibe las preguntas que
   tocan y la recomendación. Así el árbol de decisión se prueba en node, rama por rama (tests/unidad/asistente.test.js).

     SP.asistente.info(tabla)                 columnas numéricas, factores, dosis numéricas, niveles y papeles probables
     SP.asistente.preguntas(respuestas, info)  [{ id, texto, ayuda, tipo, opciones, valor, max }] (solo las que aplican)
     SP.asistente.recomendar(respuestas, info) { metodo, e, op, titulo, resumen, porque, revisar, siFallan, despues, avisos }

   El árbol (cada hoja es un método del catálogo):
     objetivo = comparar tratamientos
       respuesta ordinal o «no normal» con un factor: Wilcoxon (2 grupos), Kruskal-Wallis, Friedman (con bloques)
       un factor de 2 niveles, sin bloques ni covariable: prueba t (Welch)
       con covariable (sin parcelas divididas): ANCOVA en completamente al azar o en bloques
       conteos: modelo lineal generalizado (Poisson o binomial negativa); proporciones con su total o 0/1: binomial
       medidas repetidas en el tiempo: modelo mixto con estructura de covarianza (motor R); sin unidad identificable,
         parcelas divididas con el tiempo en la subparcela (aproximación clásica)
       bloques aleatorios (si se pide): bloques, parcelas divididas o látice con modelo mixto; conteos y proporciones,
         modelo lineal generalizado mixto (motor R)
       parcelas grandes: divididas (2 factores; parcelas grandes en bloques, al azar o en cuadro latino),
                         subdivididas (3 factores) o franjas
       bloques incompletos: látice (agrupados en repeticiones) o BIB
       bloques en dos direcciones: cuadro latino;  en una: bloques completos al azar;  sin bloques: completamente al azar
       y después: polinomios o curva con meseta (dosis numérica), Dunnett (contra un testigo), Tukey o contrastes planeados
     objetivo = genotipos en varios ambientes
       análisis conjunto, estabilidad (Eberhart-Russell, Wricke, Shukla), AMMI o biplot GGE; y el modelo mixto con BLUP
     objetivo = relación entre variables numéricas
       sin respuesta: correlación (Pearson o Spearman), matriz de correlaciones o correlación parcial
       con respuesta: regresión lineal (recta), polinomial (curva), curva de crecimiento, dosis-respuesta, curva con
         meseta, múltiple, paso a paso, mejores subconjuntos o superficie de respuesta (combinación óptima)
     objetivo = asociación entre categorías
       casos independientes: tabla de contingencia · pareados: McNemar/Bowker · dos evaluadores: kappa ·
       por estratos: Cochran-Mantel-Haenszel
     objetivo = describir: descriptivos por grupos (bloque Explorar) */
SP.definir('asistente', function (SP) {
  'use strict';
  const T = SP.T;
  const lista = v => [].concat(v || []).filter(Boolean);

  const FREC = /^(n|frec.*|frecuencias?|conteos?|cuentas?|casos|semillas|veces|freq?)$/i;
  /* escalas de calificación: pocos enteros, como un factor numérico, pero son la respuesta */
  const ESCALA = /da[nñ]o|sever|escala|calific|puntaje|nota|vigor|incidencia/i;
  /** Lo que el asistente necesita saber de la tabla. */
  function info(tabla) {
    const pap = SP.estructura.adivinarPapeles(tabla);
    const numericas = tabla.nombres.filter(n => tabla.col(n).tipo === 'numerica' && !tabla.col(n).fecha);
    const numFactor = numericas.filter(n => !ESCALA.test(n) && SP.estructura.pareceFactorNumerico(tabla.col(n), tabla.n));
    const factores = tabla.nombres.filter(n => tabla.col(n).tipo === 'factor').concat(numFactor);
    const niveles = {};
    for (const f of factores) { try { niveles[f] = SP.estructura.comoFactor(tabla, f).niveles; } catch (e) { niveles[f] = []; } }
    const agrupables = factores.filter(f => niveles[f].length >= 2 && niveles[f].length <= 100);
    /* tipo probable de cada numérica: conteo (enteros ≥ 0 con ceros), proporción (0–1 o porcentaje) u ordinal (pocos enteros) */
    const tipoNum = {};
    for (const n of numericas) {
      const v = Array.from(tabla.col(n).valores).filter(x => x === x), enteros = v.every(x => x === Math.round(x)), distintos = new Set(v).size;
      const pct = /porc|pct|%|germin|propor|mortal|incid/i.test(n);
      tipoNum[n] = v.length > 1 && v.every(x => x === 0 || x === 1) && distintos === 2 ? 'proporcion' : pct && v.every(x => x >= 0 && x <= 100) ? 'proporcion' : v.length && v.every(x => x >= 0 && x <= 1) && distintos > 2 ? 'proporcion'
        : enteros && v.every(x => x >= 0) && (v.some(x => x === 0) || FREC.test(n)) && distintos > 2 ? 'conteo'
          : enteros && distintos <= 7 && distintos >= 3 && Math.max(...v) - Math.min(...v) <= 10 ? 'ordinal' : 'continua';
    }
    const medidas = numericas.filter(n => !numFactor.includes(n));
    const binarias = numericas.filter(n => { const v = Array.from(tabla.col(n).valores).filter(x => x === x); return v.length > 1 && v.every(x => x === 0 || x === 1); });
    /* pares de factores en que uno determina al otro (cada nivel de uno va con un solo nivel del otro): no se cruzan */
    const ligados = new Set(), cods = {};
    for (const f of agrupables) { try { cods[f] = SP.estructura.comoFactor(tabla, f).codigos; } catch (e) { /* nada */ } }
    for (let i = 0; i < agrupables.length && i < 12; i++) for (let j = i + 1; j < agrupables.length && j < 12; j++) {
      const a = cods[agrupables[i]], b = cods[agrupables[j]];
      if (!a || !b) continue;
      const ab = new Map(), ba = new Map();
      let fab = true, fba = true;
      for (let k = 0; k < tabla.n && (fab || fba); k++) {
        if (a[k] < 0 || b[k] < 0) continue;
        if (ab.has(a[k]) && ab.get(a[k]) !== b[k]) fab = false; else ab.set(a[k], b[k]);
        if (ba.has(b[k]) && ba.get(b[k]) !== a[k]) fba = false; else ba.set(b[k], a[k]);
      }
      if (fab || fba) { ligados.add(agrupables[i] + '|' + agrupables[j]); ligados.add(agrupables[j] + '|' + agrupables[i]); }
    }
    return { numericas, medidas, numFactor, factores: agrupables, niveles, tipoNum, pap, n: tabla.n, ligados: [...ligados], binarias };
  }

  /* respuestas con sus valores de omisión, según la tabla */
  function completar(r, inf) {
    const x = Object.assign({}, r);
    const medidas = inf.medidas.length ? inf.medidas : inf.numericas;
    const resp = inf.pap.respuestas.filter(n => medidas.includes(n));
    const ligado = (a, b) => (inf.ligados || []).includes(a + '|' + b);
    /* datos ya contados (solo una columna de frecuencias) → asociación entre categorías */
    const soloFrecuencias = medidas.length > 0 && medidas.every(n => FREC.test(n));
    /* un factor que parece ambiente y otro que parece genotipo: ensayo en varios ambientes */
    const ambCand = inf.factores.find(f => /^(amb|loc|env|sitio|ciclo|a[ñn]o)/i.test(f));
    const genCand = inf.factores.find(f => f !== ambCand && /^(gen|varied|h[ií]brido|clon|l[ií]nea|cultivar)/i.test(f));
    if (!x.objetivo) x.objetivo = soloFrecuencias && inf.factores.length >= 2 ? 'asociacion' : ambCand && genCand && medidas.length ? 'ambientes' : inf.factores.length && medidas.length ? 'comparar' : medidas.length >= 2 ? 'relacion' : inf.factores.length >= 2 ? 'asociacion' : 'describir';
    if (!inf.numericas.includes(x.respuesta)) x.respuesta = resp[resp.length - 1] || medidas[medidas.length - 1] || '';
    if (!x.tipoRespuesta || !['continua', 'conteo', 'proporcion', 'ordinal'].includes(x.tipoRespuesta)) x.tipoRespuesta = inf.tipoNum[x.respuesta] || 'continua';
    const bloqueProbable = inf.pap.bloque && inf.factores.includes(inf.pap.bloque) ? inf.pap.bloque : '';
    if (!Array.isArray(x.factores)) {
      x.factores = [];
      for (const f of inf.pap.factores) if (inf.factores.includes(f) && f !== bloqueProbable && f !== inf.pap.fila && f !== inf.pap.columna && x.factores.length < 2 && !x.factores.some(g => ligado(f, g))) x.factores.push(f);
    }
    x.factores = x.factores.filter(f => inf.factores.includes(f) && f !== x.respuesta).slice(0, 3);
    if (!x.bloques) x.bloques = inf.pap.fila && inf.pap.columna ? 'dos' : bloqueProbable ? 'uno' : 'no';
    const libres = inf.factores.filter(f => !x.factores.includes(f));
    if (!libres.includes(x.bloque)) x.bloque = libres.includes(bloqueProbable) ? bloqueProbable : libres[0] || '';
    if (!libres.includes(x.fila)) x.fila = libres.includes(inf.pap.fila) ? inf.pap.fila : libres[0] || '';
    if (!libres.includes(x.columna) || x.columna === x.fila) x.columna = libres.includes(inf.pap.columna) && inf.pap.columna !== x.fila ? inf.pap.columna : libres.find(f => f !== x.fila) || '';
    if (!libres.includes(x.repeticion) || x.repeticion === x.bloque) x.repeticion = libres.find(f => /^rep/i.test(f) && f !== x.bloque) || libres.find(f => f !== x.bloque) || '';
    if (!x.parcelas) x.parcelas = 'no';
    if (!x.factores.includes(x.parcelaGrande)) x.parcelaGrande = x.factores[0] || '';
    if (!x.latice) x.latice = 'no';
    if (x.covariable !== 'no' && !medidas.includes(x.covariable)) x.covariable = 'no';
    if (x.covariable === x.respuesta) x.covariable = 'no';
    if (!x.tiempo) x.tiempo = 'no';
    if (!inf.factores.concat(inf.numericas).includes(x.tiempoCol) || x.factores.includes(x.tiempoCol)) x.tiempoCol = libres.find(f => /fech|dia|día|tiempo|muestreo|semana|dds/i.test(f)) || '';
    if (!x.interes) x.interes = 'curva';
    if (!x.aleatorios) x.aleatorios = 'no';
    if (x.sujeto === undefined || (x.sujeto && (!libres.includes(x.sujeto) || x.sujeto === x.tiempoCol))) x.sujeto = libres.find(f => f !== x.tiempoCol && /planta|parcela|unidad|sujeto|indiv|[aá]rbol|animal/i.test(f)) || '';
    const medidasOtras = medidas.filter(n => n !== x.respuesta);
    if (x.ensayos === undefined || (x.ensayos && !medidasOtras.includes(x.ensayos))) x.ensayos = medidasOtras.find(n => /semilla|sembrad|total|evaluad|ensayo|plantas/i.test(n)) || '';
    /* varios ambientes */
    if (!inf.factores.includes(x.genotipo)) x.genotipo = genCand || inf.factores[0] || '';
    if (!inf.factores.includes(x.ambiente) || x.ambiente === x.genotipo) x.ambiente = ambCand && ambCand !== x.genotipo ? ambCand : inf.factores.find(f => f !== x.genotipo) || '';
    if (x.repMA === undefined || (x.repMA && (!inf.factores.includes(x.repMA) || [x.genotipo, x.ambiente].includes(x.repMA)))) x.repMA = inf.factores.find(f => ![x.genotipo, x.ambiente].includes(f) && /rep|bloq|block/i.test(f)) || '';
    if (!['conjunto', 'estabilidad', 'ammi', 'gge'].includes(x.interesMA)) x.interesMA = 'conjunto';
    if (!x.comparacion) x.comparacion = 'todas';
    const f0 = x.factores.find(f => inf.numFactor.includes(f)) || x.factores[0];
    if (!(f0 && inf.niveles[f0] || []).includes(x.testigo)) x.testigo = (f0 && inf.niveles[f0] || [])[0] || '';
    /* relación */
    if (x.y !== '' && !medidas.includes(x.y)) x.y = x.objetivo === 'relacion' ? (resp[resp.length - 1] || '') : '';
    if (!Array.isArray(x.predictores)) x.predictores = medidas.filter(n => n !== x.y).slice(0, 15);
    x.predictores = x.predictores.filter(n => inf.numericas.includes(n) && n !== x.y);
    if (!Array.isArray(x.variables)) x.variables = medidas.slice(0, 8);
    x.variables = x.variables.filter(n => inf.numericas.includes(n));
    if (!Array.isArray(x.controles)) x.controles = [];
    x.controles = x.controles.filter(n => inf.numericas.includes(n) && !x.variables.slice(0, 2).includes(n));
    if (!x.lineal) x.lineal = 'si';
    if (!x.forma) x.forma = 'recta';
    if (!x.elegir) x.elegir = 'todos';
    /* asociación */
    const cats = inf.factores;
    if (!cats.includes(x.cat1)) {
      /* el primer par de categorías que no se determinan una a otra */
      const orden = inf.pap.factores.filter(f => cats.includes(f)).concat(cats.filter(f => !inf.pap.factores.includes(f)));
      let par = null;
      for (let i = 0; i < orden.length && !par; i++) for (let j = i + 1; j < orden.length && !par; j++) if (!ligado(orden[i], orden[j])) par = [orden[i], orden[j]];
      [x.cat1, x.cat2] = par || [orden[0] || '', orden[1] || ''];
    }
    if (!cats.includes(x.cat2) || x.cat2 === x.cat1) x.cat2 = cats.find(f => f !== x.cat1 && !ligado(f, x.cat1)) || cats.find(f => f !== x.cat1) || '';
    if (!x.tipoAsoc) {
      /* las mismas categorías en las dos: el mismo caso clasificado dos veces (por dos evaluadores o en dos momentos) */
      const a = inf.niveles[x.cat1] || [], b = inf.niveles[x.cat2] || [];
      const mismas = a.length >= 2 && a.length === b.length && a.every(l => b.includes(l));
      x.tipoAsoc = mismas ? (/eval|juez|calific|observ|t[eé]cnico|rater/i.test(x.cat1 + x.cat2) ? 'evaluadores' : 'pareados') : 'independientes';
    }
    if (!cats.includes(x.estrato) || [x.cat1, x.cat2].includes(x.estrato)) x.estrato = cats.find(f => f !== x.cat1 && f !== x.cat2) || '';
    const conteos = inf.numericas.filter(n => inf.tipoNum[n] === 'conteo' || /^(n|frec.*|conteos?|casos|semillas|veces)$/i.test(n));
    if (x.frecuencia !== '' && !conteos.includes(x.frecuencia)) x.frecuencia = conteos.find(n => /^(n|frec.*|conteos?|casos|semillas|veces)$/i.test(n)) || '';
    return x;
  }

  /** Preguntas que tocan, con su valor actual. */
  function preguntas(r, inf) {
    const x = completar(r, inf), out = [], med = inf.medidas.length ? inf.medidas : inf.numericas;
    const P = (id, texto, tipo, opciones, ayuda, extra) => out.push(Object.assign({ id, texto, tipo, opciones, ayuda: ayuda || '', valor: x[id] }, extra || {}));
    const libres = inf.factores.filter(f => !x.factores.includes(f));
    P('objetivo', T('¿Qué quieres saber?'), 'opciones', [['comparar', T('Comparar tratamientos o grupos')], ['ambientes', T('Comparar genotipos en varios ambientes (estabilidad)')], ['relacion', T('Relación entre variables numéricas')],
      ['asociacion', T('Asociación entre categorías')], ['describir', T('Solo describir los datos')]]);
    if (x.objetivo === 'comparar') {
      P('respuesta', T('¿Qué mediste? (la respuesta)'), 'variable', med.map(n => [n, n]).concat(inf.numericas.filter(n => !med.includes(n)).map(n => [n, T('{n} (pocos valores)', { n })])));
      P('tipoRespuesta', T('¿Qué clase de dato es «{r}»?', { r: x.respuesta }), 'opciones', [['continua', T('Una medida continua (peso, altura, rendimiento)')], ['conteo', T('Un conteo (insectos, frutos, plantas)')],
        ['proporcion', T('Un porcentaje o proporción')], ['ordinal', T('Una escala ordenada (daño de 1 a 5) o datos que no son normales')]], T('Lo propuse a partir de los valores; cámbialo si no es así.'));
      if (x.tipoRespuesta === 'proporcion' && !(inf.binarias || []).includes(x.respuesta)) P('ensayos', T('¿De cuántas semillas o plantas es cada fila?'), 'variable',
        [['', T('No tengo el total (es un porcentaje)')]].concat(med.filter(n => n !== x.respuesta).map(n => [n, T('La columna «{n}»', { n })])),
        T('Con el total, el modelo binomial usa el número de éxitos de cada fila (germinadas, enfermas): «{r}» debe ser ese número, no el porcentaje.', { r: x.respuesta }));
      P('factores', T('¿Qué factores aplicaste? (hasta 3)'), 'variables', inf.factores.filter(f => f !== x.respuesta).map(f => [f, inf.numFactor.includes(f) ? T('{f} (dosis numérica)', { f }) : f]), '', { max: 3 });
      if (!x.factores.length) return out;
      P('bloques', T('¿Agrupaste las unidades en bloques?'), 'opciones', [['no', T('No, todo se sorteó al azar')], ['uno', T('Sí, en una dirección (bloques o repeticiones)')],
        ['dos', T('En dos direcciones (filas y columnas)')], ['incompletos', T('En bloques más chicos que el número de tratamientos')]]);
      if (x.bloques === 'uno' || x.bloques === 'incompletos') P('bloque', x.bloques === 'incompletos' ? T('¿Qué columna dice el bloque incompleto?') : T('¿Qué columna dice el bloque?'), 'variable', libres.map(f => [f, f]));
      if (x.bloques === 'dos') { P('fila', T('¿Qué columna dice la fila?'), 'variable', libres.map(f => [f, f])); P('columna', T('¿Y la columna?'), 'variable', libres.filter(f => f !== x.fila).map(f => [f, f])); }
      if (x.bloques === 'incompletos' && x.factores.length === 1) {
        P('latice', T('¿Los bloques incompletos están agrupados en repeticiones completas (látice o alfa-látice)?'), 'opciones', [['no', T('No (bloques incompletos balanceados)')], ['si', T('Sí')]]);
        if (x.latice === 'si') P('repeticion', T('¿Qué columna dice la repetición?'), 'variable', libres.filter(f => f !== x.bloque).map(f => [f, f]));
      }
      if (x.factores.length >= 2 && x.bloques !== 'incompletos') {
        P('parcelas', T('¿Algún factor se aplicó a parcelas grandes, que no se pueden sortear por parcela chica (riego, labranza, fecha de siembra)?'), 'opciones',
          [['no', T('No, todo se sorteó por parcela')], ['divididas', T('Sí: un factor en parcelas grandes y lo demás dentro de ellas')]].concat(x.factores.length === 2 && x.bloques === 'uno' ? [['franjas', T('Sí: los dos factores en franjas que se cruzan')]] : []),
          T('Si es así, cada factor tiene su propio error y analizarlo como factorial común da conclusiones falsas.'));
        if (x.parcelas !== 'no') P('parcelaGrande', x.parcelas === 'franjas' ? T('¿Qué factor va en las franjas horizontales?') : T('¿Qué factor va en las parcelas grandes?'), 'variable', x.factores.map(f => [f, f]));
        if (x.parcelas === 'divididas' && x.bloques === 'no') P('repeticion', T('¿Qué columna dice la repetición de cada parcela grande?'), 'variable', libres.map(f => [f, f]));
      }
      if (x.parcelas === 'no' && ['no', 'uno'].includes(x.bloques) && x.factores.length <= 2 && x.tipoRespuesta !== 'ordinal') {
        P('covariable', T('¿Mediste antes del tratamiento algo que influya en la respuesta (número de plantas, peso inicial)?'), 'variable',
          [['no', T('No')]].concat(med.filter(n => n !== x.respuesta).map(n => [n, T('Sí: «{n}»', { n })])), T('Con ella se ajustan las medias (ANCOVA) y se gana precisión.'));
      }
      if (x.factores.length === 1 && x.parcelas === 'no' && x.covariable === 'no' && x.tipoRespuesta !== 'ordinal') {
        P('tiempo', T('¿Mediste la misma unidad varias veces en el tiempo?'), 'opciones', [['no', T('No')], ['si', T('Sí, en varias fechas')]]);
        if (x.tiempo === 'si') {
          P('tiempoCol', T('¿Qué columna dice la fecha o el muestreo?'), 'variable', libres.map(f => [f, f]));
          P('sujeto', T('¿Qué columna dice la planta o parcela que mediste varias veces?'), 'variable', [['', T('Cada tratamiento en cada bloque es una unidad')]].concat(libres.filter(f => f !== x.tiempoCol && f !== x.bloque).map(f => [f, f])));
        }
      }
      const aleatorizable = (x.bloques === 'uno' && x.parcelas !== 'franjas' && x.tiempo !== 'si' && (x.parcelas === 'no' ? x.covariable === 'no' && x.factores.length <= 3 : x.factores.length === 2)) ||
        (x.bloques === 'incompletos' && x.latice === 'si' && x.factores.length === 1);
      if (aleatorizable && x.tipoRespuesta !== 'ordinal') P('aleatorios', T('¿Los bloques son una muestra de muchos posibles (efectos aleatorios)?'), 'opciones',
        [['no', T('No: bloques fijos (el análisis clásico)')], ['si', T('Sí: modelo mixto, que aprovecha la información entre bloques (motor R)')]],
        T('Con bloques aleatorios las conclusiones valen para otros bloques (sitios, fechas); el modelo mixto corre en el motor R.'));
      const dosis = x.factores.find(f => inf.numFactor.includes(f));
      if (x.tipoRespuesta !== 'ordinal') {
        if (dosis) P('interes', T('«{d}» es numérica: ¿qué te interesa?', { d: dosis }), 'opciones', [['curva', T('La forma de la respuesta y la dosis óptima')], ['todas', T('Comparar las dosis entre sí')], ['testigo', T('Comparar contra el testigo')]]);
        else P('comparacion', T('¿Cómo quieres comparar los tratamientos?'), 'opciones', [['todas', T('Todos contra todos')], ['testigo', T('Contra un testigo')], ['planeados', T('Con contrastes planeados de antemano')]]);
        if ((dosis ? x.interes : x.comparacion) === 'testigo') P('testigo', T('¿Cuál es el testigo?'), 'variable', (inf.niveles[dosis || x.factores[0]] || []).map(l => [l, l]));
      }
    } else if (x.objetivo === 'ambientes') {
      P('respuesta', T('¿Qué mediste? (la respuesta)'), 'variable', med.map(n => [n, n]));
      P('genotipo', T('¿Qué columna dice el genotipo (variedad, híbrido, línea)?'), 'variable', inf.factores.map(f => [f, f]));
      P('ambiente', T('¿Qué columna dice el ambiente (localidad, año o fecha de siembra)?'), 'variable', inf.factores.filter(f => f !== x.genotipo).map(f => [f, f]));
      P('repMA', T('¿Hay repeticiones dentro de cada ambiente?'), 'variable', [['', T('No: cada fila es la media de un genotipo en un ambiente')]]
        .concat(inf.factores.filter(f => f !== x.genotipo && f !== x.ambiente).map(f => [f, T('Sí: la columna «{f}»', { f })])));
      P('interesMA', T('¿Qué te interesa?'), 'opciones', [['conjunto', T('Si los genotipos difieren y si su orden cambia entre ambientes')], ['estabilidad', T('Qué genotipos son estables (Eberhart-Russell, Wricke, Shukla)')],
        ['ammi', T('Los patrones de la interacción (AMMI)')], ['gge', T('Cuál genotipo gana en cada ambiente (biplot GGE)')]]);
    } else if (x.objetivo === 'relacion') {
      P('y', T('¿Hay una respuesta que quieras explicar o predecir?'), 'variable', [['', T('No: solo ver si las variables se relacionan')]].concat(med.map(n => [n, T('Sí: «{n}»', { n })])));
      if (!x.y) {
        P('variables', T('¿Qué variables?'), 'variables', inf.numericas.map(n => [n, n]), '', { max: 30 });
        if (x.variables.length === 2) P('controles', T('¿Quieres descontar el efecto de otras variables (correlación parcial)?'), 'variables', inf.numericas.filter(n => !x.variables.includes(n)).map(n => [n, n]), T('Déjalo vacío si no.'), { max: 10 });
        P('lineal', T('¿La relación parece una línea recta, sin valores extremos?'), 'opciones', [['si', T('Sí (Pearson)')], ['no', T('No o no sé (Spearman, con rangos)')]]);
      } else {
        P('predictores', T('¿Con qué variables la quieres explicar?'), 'variables', inf.numericas.filter(n => n !== x.y).map(n => [n, n]), '', { max: 15 });
        if (x.predictores.length === 1) P('forma', T('¿Cómo es la relación?'), 'opciones', [['recta', T('Una recta')], ['curva', T('Una curva con máximo o mínimo (polinomio de grado 2)')],
          ['crecimiento', T('Un crecimiento en el tiempo que se estabiliza (logístico, Gompertz)')], ['dosis', T('Un efecto que baja con la dosis (dosis-respuesta, DE50)')],
          ['meseta', T('Una respuesta a la dosis que llega a una meseta (dosis óptima)')]]);
        if (x.predictores.length > 1) P('elegir', T('¿Qué buscas?'), 'opciones', [['todos', T('El modelo con todos los predictores')], ['pasos', T('Que el programa elija los predictores, paso a paso (AIC)')],
          ['subconjuntos', T('Que el programa revise todas las combinaciones de predictores')]].concat(x.predictores.length <= 6 ? [['superficie', T('La combinación óptima de los factores (superficie de respuesta)')]] : []));
      }
    } else if (x.objetivo === 'asociacion') {
      P('tipoAsoc', T('¿Cómo son tus datos?'), 'opciones', [['independientes', T('Dos clasificaciones de casos distintos (tabla de contingencia)')], ['pareados', T('El mismo caso clasificado dos veces (antes y después)')],
        ['evaluadores', T('Dos evaluadores calificaron los mismos casos')], ['estratos', T('La asociación en varios lotes, sitios o años')]]);
      const et = { independientes: [T('Primera variable (filas)'), T('Segunda variable (columnas)')], pareados: [T('Primera clasificación'), T('Segunda clasificación')],
        evaluadores: [T('Evaluador 1'), T('Evaluador 2')], estratos: [T('Primera variable (filas)'), T('Segunda variable (columnas)')] }[x.tipoAsoc];
      P('cat1', et[0], 'variable', inf.factores.map(f => [f, f]));
      P('cat2', et[1], 'variable', inf.factores.filter(f => f !== x.cat1).map(f => [f, f]));
      if (x.tipoAsoc === 'estratos') P('estrato', T('¿Qué columna dice el estrato?'), 'variable', inf.factores.filter(f => f !== x.cat1 && f !== x.cat2).map(f => [f, f]));
      P('frecuencia', T('¿Tus datos ya vienen contados?'), 'variable', [['', T('No: cada fila es un caso')]].concat(inf.numericas.map(n => [n, T('Sí: la columna «{n}»', { n })])));
    } else {
      P('respuesta', T('¿Qué variable quieres describir?'), 'variable', med.map(n => [n, n]));
      P('factores', T('¿Por grupos? (hasta 3)'), 'variables', inf.factores.filter(f => f !== x.respuesta).map(f => [f, f]), T('Déjalo vacío para describir todo junto.'), { max: 3 });
    }
    return out;
  }

  /* ---------------- recomendación ---------------- */
  const REVISAR_ANOVA = () => [T('normalidad de los residuos'), T('varianzas iguales entre tratamientos'), T('independencia'), T('valores atípicos')];
  function siFallan(tipo, unFactor) {
    return {
      continua: T('Si los supuestos fallan: transforma la respuesta con Box-Cox (bloque Datos → Transformar) o usa la prueba no paramétrica{np}.', { np: unFactor ? T(' (Kruskal-Wallis o Friedman)') : '' }),
      conteo: T('Los conteos suelen tener varianza que crece con la media: prueba √(x + 0.5) (bloque Datos → Transformar) o un modelo lineal generalizado desde una fórmula (catálogo).'),
      proporcion: T('Los porcentajes suelen pedir el arcoseno de √p (bloque Datos → Transformar); con el total de cada fila, el modelo binomial es mejor.'),
      ordinal: T('Con una escala ordenada, el ANOVA es solo aproximado: compara con la prueba de rangos (el modelo ordinal aún no está en SigmaPro).'),
    }[tipo];
  }
  function recomendar(r, inf) {
    const x = completar(r, inf), avisos = [];
    const y = x.respuesta, facs = x.factores, tipo = x.tipoRespuesta;
    if (x.objetivo === 'describir') {
      return { bloque: 3, metodo: 'descriptivos', e: { variables: [y], grupos: facs }, op: {}, titulo: T('Descriptivos por grupos'),
        resumen: T('Media, desviación, cuartiles e intervalos de «{y}»{g}.', { y, g: facs.length ? T(' en cada combinación de {f}', { f: facs.join(' × ') }) : '' }),
        porque: [T('Solo quieres describir: el bloque Explorar da los descriptivos con sus intervalos y el código R.')], revisar: [], siFallan: '', despues: [], avisos };
    }
    if (x.objetivo === 'ambientes') {
      const base = { revisar: [T('cada genotipo en cada ambiente'), T('errores parecidos entre ambientes')], siFallan: '', avisos };
      if (!y) return Object.assign(base, { metodo: null, titulo: T('Falta la respuesta'), resumen: T('La tabla no tiene una columna numérica para analizar.'), porque: [], despues: [] });
      if (!x.genotipo || !x.ambiente) return Object.assign(base, { metodo: null, titulo: T('Faltan columnas'), resumen: T('Hacen falta la columna del genotipo y la del ambiente.'), porque: [], despues: [] });
      const e = Object.assign({ respuesta: y, genotipo: x.genotipo, ambiente: x.ambiente }, x.repMA ? { repeticion: x.repMA } : {});
      const MA = {
        conjunto: ['ensayos-multiambiente', T('Análisis conjunto de varios ambientes'), T('¿Difieren los genotipos y cambia su orden entre ambientes?'),
          [T('Analiza cada ambiente y luego todos juntos: la interacción genotipo × ambiente dice si el mejor genotipo depende del lugar.'), T('Revisa que los errores de los ambientes sean parecidos (Bartlett).')]],
        estabilidad: ['estabilidad', T('Estabilidad de los genotipos'), T('¿Qué genotipos rinden parecido en todos los ambientes y cuáles aprovechan los buenos?'),
          [T('La pendiente sobre el índice ambiental (Eberhart y Russell) dice cómo responde cada genotipo al ambiente; S²d, qué tan predecible es.'), T('La ecovalencia de Wricke, la varianza de Shukla y la superioridad de Lin y Binns resumen la estabilidad en un número.')]],
        ammi: ['ammi', T('Modelo AMMI'), T('Los patrones de la interacción genotipo × ambiente.'),
          [T('Separa los efectos principales de la interacción y la resume en pocos ejes (con la prueba F_R de Cornelius).'), T('El ASV y el biplot muestran los genotipos estables y las combinaciones favorables.')]],
        gge: ['gge', T('Biplot GGE'), T('¿Qué genotipo gana en cada ambiente y cuál combina buena media con estabilidad?'),
          [T('El polígono de quién ganó dónde agrupa los ambientes en megaambientes con su genotipo ganador.'), T('La vista de media contra estabilidad ordena los genotipos por su desempeño promedio.')]],
      };
      const [metodo, titulo, resumen, porque] = MA[x.interesMA];
      const despues = Object.keys(MA).filter(k => k !== x.interesMA).map(k => ({ texto: MA[k][1], metodo: MA[k][0], e, op: {} }));
      if (x.repMA) despues.push({ texto: T('Genotipos y localidades aleatorios con BLUP (modelo mixto, motor R)'), metodo: 'mixto-localidades', e: { respuesta: y, genotipo: x.genotipo, localidad: x.ambiente, repeticion: x.repMA }, op: {} });
      if (!x.repMA) avisos.push(T('Sin repeticiones no hay error dentro de los ambientes: la interacción hace de error y no se prueban S²d, Shukla ni los ejes AMMI.'));
      return Object.assign(base, { metodo, e, op: {}, titulo, resumen, porque, despues });
    }
    if (x.objetivo === 'asociacion') {
      const fr = x.frecuencia ? { frecuencia: x.frecuencia } : {};
      const base = { porque: [], revisar: [], siFallan: '', despues: [], avisos };
      if (!x.cat1 || !x.cat2) return Object.assign(base, { metodo: null, titulo: T('Faltan variables'), resumen: T('Hacen falta dos columnas con categorías.') });
      if (x.tipoAsoc === 'pareados') return Object.assign(base, { metodo: 'mcnemar', e: Object.assign({ antes: x.cat1, despues: x.cat2 }, fr), op: { correccion: true }, titulo: T('Prueba de McNemar (o de simetría de Bowker)'),
        resumen: T('¿Cambió la proporción de cada categoría entre «{a}» y «{b}»?', { a: x.cat1, b: x.cat2 }),
        porque: [T('Cada caso aparece dos veces: las clasificaciones no son independientes y la ji cuadrada común no sirve.'), T('Solo cuentan los casos que cambiaron de categoría.')] });
      if (x.tipoAsoc === 'evaluadores') return Object.assign(base, { metodo: 'kappa', e: Object.assign({ evaluador1: x.cat1, evaluador2: x.cat2 }, fr), op: { ponderacion: 'cuadratica' }, titulo: T('Kappa de Cohen'),
        resumen: T('¿Qué tanto coinciden «{a}» y «{b}» más allá del azar?', { a: x.cat1, b: x.cat2 }),
        porque: [T('El porcentaje de acuerdo engaña: parte se da por azar. Kappa lo descuenta.'), T('La ponderada cuenta que los desacuerdos entre categorías vecinas pesan menos (para escalas ordenadas).')],
        despues: [{ texto: T('¿Uno califica más alto que el otro? (simetría de Bowker)'), metodo: 'mcnemar', e: Object.assign({ antes: x.cat1, despues: x.cat2 }, fr), op: { correccion: true } }] });
      if (x.tipoAsoc === 'estratos') {
        if (!x.estrato) return Object.assign(base, { metodo: null, titulo: T('Falta el estrato'), resumen: T('Hace falta una tercera columna con los estratos (lotes, sitios, años).') });
        return Object.assign(base, { metodo: 'mantel-haenszel', e: Object.assign({ fila: x.cat1, columna: x.cat2, estrato: x.estrato }, fr), op: { correccion: true }, titulo: T('Cochran-Mantel-Haenszel'),
          resumen: T('La asociación entre «{a}» y «{b}» controlando «{s}».', { a: x.cat1, b: x.cat2, s: x.estrato }),
          porque: [T('Juntar todos los estratos en una sola tabla puede crear o esconder una asociación (paradoja de Simpson).'), T('Con 2 × 2 da además la razón de momios común y si es igual en todos los estratos (Breslow-Day).')] });
      }
      return Object.assign(base, { metodo: 'tabla-contingencia', e: Object.assign({ fila: x.cat1, columna: x.cat2 }, fr), op: { correccion: true }, titulo: T('Tabla de contingencia'),
        resumen: T('¿La distribución de «{b}» cambia según «{a}»?', { a: x.cat1, b: x.cat2 }),
        porque: [T('Ji cuadrada de independencia; si hay frecuencias esperadas menores que 5, la prueba exacta de Fisher.'), T('Los residuos ajustados señalan las celdas que causan la asociación.')],
        revisar: [T('frecuencias esperadas de al menos 5 (si no, Fisher exacta)')] });
    }
    if (x.objetivo === 'relacion') {
      const base = { revisar: [], siFallan: '', despues: [], avisos };
      if (!x.y) {
        const v = x.variables, met = x.lineal === 'si' ? 'pearson' : 'spearman', nom = met === 'pearson' ? 'Pearson' : 'Spearman';
        if (v.length < 2) return Object.assign(base, { metodo: null, titulo: T('Faltan variables'), resumen: T('Elige al menos dos variables numéricas.'), porque: [] });
        if (v.length === 2 && x.controles.length) return Object.assign(base, { metodo: 'correlacion-parcial', e: { x: v[0], y: v[1], controles: x.controles }, op: { metodo: met }, titulo: T('Correlación parcial de {m}', { m: nom }),
          resumen: T('La relación de «{a}» y «{b}» descontando {c}.', { a: v[0], b: v[1], c: x.controles.join(', ') }),
          porque: [T('Dos variables pueden correlacionarse solo porque las dos dependen de una tercera: la parcial lo descuenta.')] });
        if (v.length === 2) return Object.assign(base, { metodo: 'correlacion', e: { x: v[0], y: v[1] }, op: { metodo: met }, titulo: T('Correlación de {m}', { m: nom }),
          resumen: T('¿«{a}» y «{b}» crecen juntas?', { a: v[0], b: v[1] }),
          porque: [met === 'pearson' ? T('Pearson mide la relación lineal; trae su intervalo de confianza.') : T('Spearman usa los rangos: sirve para relaciones curvas pero monótonas y resiste a los valores extremos.')],
          revisar: met === 'pearson' ? [T('que la nube de puntos sea más o menos recta'), T('sin valores extremos')] : [] });
        return Object.assign(base, { metodo: 'matriz-correlacion', e: { variables: v }, op: { metodo: met, ajuste: 'holm' }, titulo: T('Matriz de correlaciones de {m}', { m: nom }),
          resumen: T('Las {k} correlaciones entre {m} variables, con los valores p ajustados por Holm.', { k: v.length * (v.length - 1) / 2, m: v.length }),
          porque: [T('Con muchas correlaciones a la vez, alguna sale significativa por azar: el ajuste de Holm lo corrige.')] });
      }
      const p = x.predictores;
      if (!p.length) return Object.assign(base, { metodo: null, titulo: T('Faltan predictores'), resumen: T('Elige al menos una variable para explicar «{y}».', { y: x.y }), porque: [] });
      const revisarReg = [T('normalidad de los residuos'), T('varianza constante'), T('forma del modelo'), T('observaciones influyentes')];
      if (p.length === 1) {
        const NL = { crecimiento: ['curva-crecimiento', { respuesta: x.y, x: p[0] }, { modelo: 'logistico' }, T('Curva de crecimiento'), T('El crecimiento de «{y}» en el tiempo «{x}»: asíntota, punto de inflexión y velocidad.', { y: x.y, x: p[0] }),
            [T('El crecimiento sube y se estabiliza: el modelo logístico (o Gompertz, Weibull) da la asíntota y el momento de mayor crecimiento.'), T('Con grupos (variedades) se comparan las curvas.')]],
          dosis: ['dosis-respuesta', { respuesta: x.y, dosis: p[0] }, { modelo: 'll4' }, T('Dosis-respuesta (log-logístico)'), T('El efecto de «{x}» sobre «{y}»: la dosis que reduce la respuesta a la mitad (DE50).', { y: x.y, x: p[0] }),
            [T('El log-logístico de 4 parámetros describe la caída con la dosis entre dos límites y da la DE10, DE50 y DE90 con su intervalo.')]],
          meseta: ['respuesta-meseta', { respuesta: x.y, dosis: p[0] }, { modelo: 'lineal-meseta' }, T('Respuesta a la dosis con meseta'), T('La dosis de «{x}» a partir de la cual «{y}» ya no aumenta.', { y: x.y, x: p[0] }),
            [T('La respuesta sube y se estabiliza: lineal-meseta o cuadrático-meseta dan la dosis óptima y el valor de la meseta.')]] };
        if (NL[x.forma]) { const [metodo, e, op, titulo, resumen, porque] = NL[x.forma]; return Object.assign(base, { metodo, e, op, titulo, resumen, porque, revisar: [T('residuos sin patrón'), T('que el ajuste converja')] }); }
        if (x.forma === 'curva') return Object.assign(base, { metodo: 'regresion-polinomial', e: { respuesta: x.y, predictores: p[0] }, op: { grado: 2 }, titulo: T('Regresión polinomial de grado 2'),
          resumen: T('La curva de «{y}» en función de «{x}», con su máximo o mínimo.', { y: x.y, x: p[0] }),
          porque: [T('Una respuesta a dosis suele subir y luego estabilizarse o bajar: la cuadrática encuentra la dosis óptima.'), T('La prueba del término cuadrático dice si de verdad hace falta la curva.')], revisar: revisarReg });
        return Object.assign(base, { metodo: 'regresion-lineal', e: { respuesta: x.y, predictores: p }, op: {}, titulo: T('Regresión lineal simple'),
          resumen: T('Cuánto cambia «{y}» por cada unidad de «{x}».', { y: x.y, x: p[0] }),
          porque: [T('Una recta con su pendiente, su intervalo y las bandas de confianza y de predicción.'), T('Si hay repeticiones de «{x}», se prueba además la falta de ajuste.', { x: p[0] })], revisar: revisarReg });
      }
      if (x.elegir === 'superficie' && p.length <= 6) return Object.assign(base, { metodo: 'superficie-respuesta', e: { respuesta: x.y, factores: p }, op: { orden: 'segundo', objetivo: 'maximo' }, titulo: T('Superficie de respuesta'),
        resumen: T('La combinación de {f} que da la mejor «{y}».', { f: p.join(', '), y: x.y }),
        porque: [T('Un modelo de segundo orden con sus interacciones encuentra el punto óptimo (o dice si es un punto silla) y la cresta hacia la mejor respuesta.'), T('Pide un diseño con al menos tres niveles por factor (central compuesto o Box-Behnken).')],
        revisar: [T('falta de ajuste'), T('que el óptimo esté dentro de la región de los datos')] });
      if (x.elegir === 'pasos') return Object.assign(base, { metodo: 'seleccion-pasos', e: { respuesta: x.y, predictores: p }, op: { criterio: 'aic', direccion: 'ambas' }, titulo: T('Selección de variables paso a paso'),
        resumen: T('Qué predictores de {k} conviene conservar para explicar «{y}».', { k: p.length, y: x.y }),
        porque: [T('Quita y agrega predictores mientras baje el AIC (el mismo criterio que step de R).'), T('Es exploratorio: confirma el modelo con lo que sabes del cultivo.')], revisar: revisarReg });
      if (x.elegir === 'subconjuntos') return Object.assign(base, { metodo: 'mejores-subconjuntos', e: { respuesta: x.y, predictores: p }, op: {}, titulo: T('Mejores subconjuntos'),
        resumen: T('El mejor modelo con 1, 2, … {k} predictores, comparados por BIC, Cp y R² ajustada.', { k: p.length }),
        porque: [T('Revisa todas las combinaciones: no depende del orden en que entran las variables.')], revisar: revisarReg });
      return Object.assign(base, { metodo: 'regresion-lineal', e: { respuesta: x.y, predictores: p }, op: {}, titulo: T('Regresión lineal múltiple'),
        resumen: T('El efecto de cada predictor sobre «{y}» con los demás constantes.', { y: x.y }),
        porque: [T('Cada coeficiente es el efecto propio de su variable, ajustado por las demás.'), T('Revisa la colinealidad (VIF): predictores muy relacionados entre sí dan coeficientes inestables.')], revisar: revisarReg.concat([T('colinealidad')]) });
    }

    /* ---- comparar tratamientos ---- */
    if (!y) return { metodo: null, titulo: T('Falta la respuesta'), resumen: T('La tabla no tiene una columna numérica para analizar.'), porque: [], revisar: [], siFallan: '', despues: [], avisos };
    if (!facs.length) return { metodo: null, titulo: T('Faltan los factores'), resumen: T('Elige al menos un factor de tratamiento.'), porque: [], revisar: [], siFallan: '', despues: [], avisos };
    const k = (inf.niveles[facs[0]] || []).length, uno = facs.length === 1;
    const bloque = x.bloques === 'uno' ? x.bloque : '';
    if (x.bloques === 'uno' && !bloque) return { metodo: null, titulo: T('Falta el bloque'), resumen: T('Elige la columna que dice el bloque.'), porque: [], revisar: [], siFallan: '', despues: [], avisos };
    /* rangos */
    if (tipo === 'ordinal' && uno && ['no', 'uno'].includes(x.bloques)) {
      if (bloque) return { metodo: 'friedman', e: { respuesta: y, tratamiento: facs[0], bloque }, op: { posthoc: 'conover', ajuste: 'holm' }, titulo: T('Prueba de Friedman'),
        resumen: T('Compara los {k} tratamientos dentro de cada bloque usando rangos.', { k }), porque: [T('La respuesta es una escala ordenada o no es normal: los rangos no suponen normalidad.'), T('Friedman respeta los bloques (como el ANOVA de bloques, pero con rangos).')],
        revisar: [T('un dato por tratamiento en cada bloque')], siFallan: '', despues: [], avisos };
      if (k === 2) return { metodo: 'wilcoxon', e: { modo: 'independientes', respuesta: y, grupo: facs[0] }, op: {}, titulo: T('Prueba de Mann-Whitney (Wilcoxon)'),
        resumen: T('Compara los dos grupos con rangos.'), porque: [T('Dos grupos y una respuesta ordenada o no normal.')], revisar: [], siFallan: '', despues: [], avisos };
      return { metodo: 'kruskal-wallis', e: { respuesta: y, tratamiento: facs[0] }, op: { posthoc: 'dunn', ajuste: 'holm' }, titulo: T('Prueba de Kruskal-Wallis'),
        resumen: T('Compara los {k} tratamientos con rangos y, si difieren, los pares con Dunn.', { k }), porque: [T('Una respuesta ordenada o no normal y tratamientos sin bloques.')], revisar: [], siFallan: '', despues: [], avisos };
    }
    if (tipo === 'ordinal') avisos.push(T('Con una escala ordenada y este diseño no hay prueba de rangos equivalente: el ANOVA es aproximado.'));
    const MOTOR = T('Corre en el motor R dentro del navegador: la primera vez se descarga (unos 25 MB) y luego queda guardado.');
    /* conteos y proporciones: modelo lineal generalizado */
    const binaria = (inf.binarias || []).includes(y), conTotal = tipo === 'proporcion' && (binaria || x.ensayos);
    if ((tipo === 'conteo' || conTotal) && x.parcelas === 'no' && ['no', 'uno'].includes(x.bloques) && x.tiempo === 'no' && facs.length <= 3) {
      const conteo = tipo === 'conteo', ens = conteo || binaria ? {} : { ensayos: x.ensayos };
      if (bloque && x.aleatorios === 'si' && x.covariable === 'no') {
        return { metodo: 'glmm-bloques', e: Object.assign({ respuesta: y, tratamientos: facs, bloque }, ens), op: { familia: conteo ? 'poisson' : 'binomial', sobredispersion: 'auto' },
          titulo: conteo ? T('Conteos con bloques aleatorios (modelo mixto)') : T('Proporciones con bloques aleatorios (modelo mixto)'),
          resumen: T('{f} sobre «{y}», con los bloques como efecto aleatorio.', { f: may(nombreDe(facs)), y }),
          porque: [conteo ? T('Los conteos siguen la distribución de Poisson: la varianza crece con la media.') : T('Los éxitos de n siguen la distribución binomial.'), T('Con bloques aleatorios, el modelo lineal generalizado mixto (lme4) agrega un efecto por observación si hay sobredispersión.')],
          revisar: [T('sobredispersión'), T('ajuste singular (varianza de bloques en cero)')], siFallan: '', despues: [], avisos: avisos.concat([MOTOR]) };
      }
      const e = Object.assign({ respuesta: y, tratamientos: facs }, bloque ? { bloque } : {}, x.covariable !== 'no' ? { covariables: [x.covariable] } : {}, ens);
      const despues = [];
      if (bloque) despues.push({ texto: T('Con los bloques como efecto aleatorio (modelo mixto, motor R)'), metodo: 'glmm-bloques', e: Object.assign({ respuesta: y, tratamientos: facs, bloque }, ens), op: { familia: conteo ? 'poisson' : 'binomial', sobredispersion: 'auto' } });
      return { metodo: conteo ? 'glm-conteos' : 'glm-proporciones', e, op: { familia: 'auto' }, titulo: conteo ? T('Modelo lineal generalizado para conteos') : T('Modelo lineal generalizado para proporciones'),
        resumen: T('{f} sobre «{y}»{b}, en la escala de {s}.', { f: may(nombreDe(facs)), y, b: bloque ? T(' en bloques') : '', s: conteo ? T('los conteos (Poisson o binomial negativa)') : T('las proporciones (binomial)') }),
        porque: conteo ? [T('Los conteos no son normales y su varianza crece con la media: el modelo de Poisson los trata como lo que son.'), T('Si hay más variación de la que Poisson admite (sobredispersión), la familia automática pasa a la binomial negativa.')]
          : [binaria ? T('Cada fila es un sí o un no: el modelo binomial da la probabilidad de cada tratamiento.') : T('Con el total de cada fila, el modelo binomial pesa cada proporción por su número de semillas o plantas.'), T('Si hay sobredispersión, la familia automática pasa a la cuasibinomial.')],
        revisar: [T('sobredispersión'), T('residuos de Pearson')].concat(conteo || binaria ? [] : [T('«{r}» es el número de éxitos de «{n}»', { r: y, n: x.ensayos })]), siFallan: '', despues, avisos };
    }
    if (tipo === 'proporcion' && !conTotal) avisos.push(T('Para el modelo binomial hace falta el total de cada fila (semillas o plantas): se propone el ANOVA de los porcentajes.'));
    /* medidas repetidas en el tiempo: modelo mixto con estructura de covarianza */
    const sujetoRM = [x.sujeto, bloque, x.repeticion].find(v => v && v !== x.tiempoCol);
    if (x.tiempo === 'si' && uno && x.tiempoCol && sujetoRM && tipo !== 'ordinal') {
      const sujeto = sujetoRM;
      return { metodo: 'medidas-repetidas', e: Object.assign({ respuesta: y, tiempo: x.tiempoCol, sujeto, tratamientos: facs }, bloque ? { bloque } : {}), op: { estructura: 'auto', criterio: 'aic' },
        titulo: T('Medidas repetidas en el tiempo (modelo mixto)'), resumen: T('«{f}» sobre «{y}» a lo largo de «{t}», con la correlación entre fechas de la misma unidad.', { f: facs[0], y, t: x.tiempoCol }),
        porque: [T('Las mediciones de la misma unidad en el tiempo están correlacionadas, y más entre fechas cercanas.'), T('El modelo prueba varias estructuras de covarianza (simetría compuesta, AR(1), no estructurada) y elige la de menor AIC.')],
        revisar: [T('la estructura elegida'), T('residuos')], siFallan: '',
        despues: [{ texto: T('Aproximación clásica: parcelas divididas en el tiempo'), metodo: 'parcelas-divididas', e: Object.assign({ respuesta: y, parcelaGrande: facs[0], subparcela: x.tiempoCol, principal: bloque ? 'dbca' : 'dca' }, bloque ? { bloque } : { repeticion: x.repeticion }), op: {} }],
        avisos: avisos.concat([MOTOR]) };
    }
    /* bloques aleatorios: modelo mixto */
    if (x.aleatorios === 'si' && tipo !== 'ordinal') {
      if (x.bloques === 'incompletos' && x.latice === 'si' && uno && x.bloque && x.repeticion)
        return { metodo: 'mixto-latice', e: { respuesta: y, tratamiento: facs[0], repeticion: x.repeticion, bloque: x.bloque }, op: {}, titulo: T('Látice con recuperación de la información entre bloques'),
          resumen: T('Los {k} tratamientos de «{f}» con los bloques incompletos como efecto aleatorio.', { k, f: facs[0] }),
          porque: [T('Con bloques aleatorios, el modelo mixto aprovecha también la información entre bloques: las medias son más precisas que en el análisis intrabloque.')],
          revisar: [T('residuos'), T('componentes de varianza')], siFallan: '', despues: [], avisos: avisos.concat([MOTOR]) };
      if (bloque && x.parcelas === 'divididas' && facs.length === 2)
        return { metodo: 'mixto-divididas', e: { respuesta: y, parcelaGrande: x.parcelaGrande, subparcela: facs.find(f => f !== x.parcelaGrande), bloque }, op: {}, titulo: T('Parcelas divididas (modelo mixto)'),
          resumen: T('«{a}» en las parcelas grandes y «{b}» en las subparcelas, con bloques y parcelas grandes aleatorios.', { a: x.parcelaGrande, b: facs.find(f => f !== x.parcelaGrande) }),
          porque: [T('El modelo mixto da los mismos errores que el análisis clásico con datos completos y sigue siendo válido si faltan parcelas.')],
          revisar: [T('residuos'), T('componentes de varianza')], siFallan: '', despues: [], avisos: avisos.concat([MOTOR]) };
      if (bloque && x.parcelas === 'no' && x.covariable === 'no')
        return { metodo: 'mixto-bloques', e: { respuesta: y, tratamientos: facs, bloque }, op: {}, titulo: T('Bloques al azar con bloques aleatorios'),
          resumen: T('{f} sobre «{y}», con los bloques como efecto aleatorio.', { f: may(nombreDe(facs)), y }),
          porque: [T('Los bloques representan a muchos posibles (sitios, fechas): el modelo mixto estima su varianza y las conclusiones valen más allá de estos bloques.'), T('Con datos completos, las pruebas de los tratamientos coinciden con el ANOVA clásico.')],
          revisar: [T('residuos'), T('varianza de bloques')], siFallan: '', despues: [], avisos: avisos.concat([MOTOR]) };
    }
    /* prueba t */
    if (uno && k === 2 && x.bloques === 'no' && x.covariable === 'no' && x.tiempo === 'no') {
      return { metodo: 'prueba-t', e: { modo: 'independientes', respuesta: y, grupo: facs[0] }, op: { varIguales: false }, titulo: T('Prueba t de Welch'),
        resumen: T('Compara las medias de «{y}» en los dos grupos de «{f}».', { y, f: facs[0] }), porque: [T('Un solo factor con dos niveles y sin bloques: la prueba t es el ANOVA de una vía.'), T('Welch no supone varianzas iguales.')],
        revisar: [T('normalidad en cada grupo'), T('valores atípicos')], siFallan: T('Si no son normales: Mann-Whitney (Wilcoxon).'), despues: [], avisos };
    }
    /* diseño */
    let metodo, e = { respuesta: y }, titulo, porque = [], op = { tipoSC: 3 };
    const nombreFac = nombreDe(facs);
    if (x.covariable !== 'no' && x.parcelas === 'no' && ['no', 'uno'].includes(x.bloques) && facs.length <= 2) {
      const r2 = { metodo: 'ancova', e: Object.assign({ respuesta: y, tratamientos: facs, covariables: [x.covariable] }, bloque ? { bloque } : {}), op: { tipoSC: 3, metodo: 'tukey' },
        titulo: bloque ? T('Análisis de covarianza en bloques') : T('Análisis de covarianza'),
        resumen: T('{f} sobre «{y}», con las medias ajustadas por «{c}».', { f: nombreFac, y, c: x.covariable }),
        porque: [T('«{c}» se midió antes del tratamiento e influye en «{y}»: ajustar por ella quita ruido y compara los tratamientos en igualdad de condiciones.', { c: x.covariable, y }),
          T('Se prueba que las pendientes sean iguales y que la covariable no dependa de los tratamientos.')],
        revisar: REVISAR_ANOVA().concat([T('pendientes iguales'), T('covariable independiente de los tratamientos')]), siFallan: siFallan(tipo, false), despues: [], avisos };
      return r2;
    }
    if (x.tiempo === 'si' && uno) {
      if (!x.tiempoCol) return { metodo: null, titulo: T('Falta la fecha'), resumen: T('Elige la columna que dice la fecha o el muestreo.'), porque: [], revisar: [], siFallan: '', despues: [], avisos };
      metodo = 'parcelas-divididas';
      Object.assign(e, { parcelaGrande: facs[0], subparcela: x.tiempoCol, principal: bloque ? 'dbca' : 'dca' }, bloque ? { bloque } : { repeticion: x.repeticion });
      titulo = T('Parcelas divididas en el tiempo');
      porque.push(T('Las mediciones de la misma unidad en el tiempo no son independientes: el tratamiento va en la parcela grande y la fecha en la subparcela.'));
      avisos.push(T('Es la aproximación clásica: supone la misma correlación entre todas las fechas. El modelo mixto de medidas repetidas es el correcto: elige la columna que identifica cada planta o parcela.'));
    } else if (x.parcelas === 'franjas' && facs.length === 2 && bloque) {
      metodo = 'franjas';
      Object.assign(e, { franjaA: x.parcelaGrande, franjaB: facs.find(f => f !== x.parcelaGrande), bloque });
      titulo = T('Parcelas en franjas');
      porque.push(T('Los dos factores se aplicaron en franjas que se cruzan: cada uno y su interacción tienen su propio error.'));
    } else if (x.parcelas === 'divididas' && facs.length >= 2) {
      const resto = facs.filter(f => f !== x.parcelaGrande);
      if (facs.length === 3) {
        if (!bloque) return { metodo: null, titulo: T('Faltan los bloques'), resumen: T('Las parcelas subdivididas se analizan en bloques: elige la columna del bloque.'), porque: [], revisar: [], siFallan: '', despues: [], avisos };
        metodo = 'parcelas-subdivididas';
        Object.assign(e, { parcelaGrande: x.parcelaGrande, subparcela: resto[0], subsubparcela: resto[1], bloque });
        titulo = T('Parcelas subdivididas');
        porque.push(T('Tres niveles de parcela: «{a}» en las grandes, «{b}» en las subparcelas y «{c}» en las sub-subparcelas, cada uno con su error.', { a: x.parcelaGrande, b: resto[0], c: resto[1] }));
      } else {
        metodo = 'parcelas-divididas';
        const principal = x.bloques === 'dos' ? 'latino' : bloque ? 'dbca' : 'dca';
        Object.assign(e, { parcelaGrande: x.parcelaGrande, subparcela: resto[0], principal }, principal === 'dbca' ? { bloque } : principal === 'latino' ? { fila: x.fila, columna: x.columna } : { repeticion: x.repeticion });
        titulo = T('Parcelas divididas');
        porque.push(T('«{a}» se aplicó a parcelas grandes y «{b}» dentro de ellas: cada uno se prueba contra su propio error.', { a: x.parcelaGrande, b: resto[0] }));
      }
    } else if (x.bloques === 'incompletos' && uno) {
      metodo = x.latice === 'si' ? 'latice' : 'bib';
      Object.assign(e, { tratamientos: facs[0], bloque: x.bloque }, metodo === 'latice' ? { repeticion: x.repeticion } : {});
      titulo = metodo === 'latice' ? T('Látice o alfa-látice') : T('Bloques incompletos balanceados');
      porque.push(T('Los bloques son más chicos que el número de tratamientos: las medias se ajustan por bloque (análisis intrabloque).'));
      op = {};
    } else if (x.bloques === 'dos' && facs.length <= 2) {
      metodo = 'cuadro-latino';
      Object.assign(e, { tratamientos: facs, fila: x.fila, columna: x.columna });
      titulo = T('Cuadro latino');
      porque.push(T('Bloqueaste en dos direcciones (filas y columnas): las dos se quitan del error.'));
    } else if (x.bloques === 'uno') {
      metodo = 'dbca';
      Object.assign(e, { tratamientos: facs, bloque });
      titulo = facs.length > 1 ? T('Factorial en bloques completos al azar') : T('Bloques completos al azar');
      porque.push(T('{f} sorteados dentro de cada bloque: la variación entre bloques sale del error.', { f: nombreFac }));
    } else {
      if (x.bloques === 'incompletos' || x.bloques === 'dos') avisos.push(T('Ese bloqueo con más factores no tiene un método directo: se propone el análisis sin bloques; usa el constructor para ajustar el modelo.'));
      metodo = 'dca';
      Object.assign(e, { tratamientos: facs });
      titulo = facs.length > 1 ? T('Factorial completamente al azar') : T('Completamente al azar');
      porque.push(T('{f} sorteados al azar entre unidades parecidas.', { f: nombreFac }));
    }
    if (facs.length > 1 && !['parcelas-divididas', 'parcelas-subdivididas', 'franjas'].includes(metodo)) porque.push(T('Primero se mira la interacción: si es significativa, se compara un factor dentro de cada nivel del otro.'));
    /* después: comparaciones */
    const despues = [], diseno = metodo, dosis = facs.find(f => inf.numFactor.includes(f));
    const eCmp = Object.assign({ diseno }, e);
    const cmpFac = dosis || facs[0];
    if (tipo !== 'ordinal') {
      if (dosis && x.interes === 'curva') {
        despues.push({ texto: T('Forma de la respuesta a «{d}» y la dosis óptima (polinomios ortogonales)', { d: dosis }), metodo: 'polinomios', e: Object.assign({}, eCmp, { comparar: [dosis] }), op: { grado: 2 } });
        despues.push({ texto: T('Curva con meseta y dosis óptima (lineal-meseta)'), metodo: 'respuesta-meseta', e: Object.assign({ respuesta: y, dosis }, facs.length > 1 ? { grupo: facs.find(f => f !== dosis) } : {}), op: { modelo: 'lineal-meseta' } });
        porque.push(T('«{d}» es numérica: se descompone en lineal y cuadrática para hallar la dosis de máxima respuesta.', { d: dosis }));
      } else if ((dosis ? x.interes : x.comparacion) === 'testigo') {
        despues.push({ texto: T('Cada tratamiento contra el testigo «{t}» (Dunnett)', { t: x.testigo }), metodo: 'comparaciones-medias', e: Object.assign({}, eCmp, { comparar: [cmpFac] }), op: { metodo: 'dunnett', testigo: x.testigo } });
      } else if (!dosis && x.comparacion === 'planeados') {
        despues.push({ texto: T('Contrastes planeados entre los niveles de «{f}»', { f: cmpFac }), metodo: 'contrastes', e: Object.assign({}, eCmp, { comparar: [cmpFac] }), op: {} });
      } else {
        despues.push({ texto: T('Comparar las medias de «{f}» (Tukey)', { f: cmpFac }), metodo: 'comparaciones-medias', e: Object.assign({}, eCmp, { comparar: [cmpFac] }), op: { metodo: 'tukey' } });
      }
    }
    despues.push({ texto: T('Revisar los supuestos del modelo'), metodo: 'supuestos', e: { respuesta: y, tratamientos: facs.slice(0, 3), bloque: bloque || undefined }, op: {} });
    return { metodo, e, op, titulo, resumen: T('{f} sobre «{y}».', { f: may(nombreFac), y }), porque, revisar: REVISAR_ANOVA().concat(bloque ? [T('aditividad bloque × tratamiento')] : []),
      siFallan: siFallan(tipo, uno), despues, avisos };
  }
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nombreDe = facs => (facs.length === 1 ? T('«{f}»', { f: facs[0] }) : T('{k} factores cruzados ({f})', { k: facs.length, f: facs.join(' × ') }));

  SP.asistente = { info, completar, preguntas, recomendar };
});
