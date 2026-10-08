/* SigmaPro — el glosario (hito 5.5).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Junta en una sola lista los estadísticos del registro (SP.guias: su nombre, su símbolo y qué es) y los conceptos del
   diseño y del análisis que no son un número de un cuadro (bloque, interacción, REML, censura…). Cada término dice
   dónde aparece y, si se puede, «ver en acción»: el análisis de ejemplo (el de su ficha de Fundamentos) y el cuadro,
   la columna o el renglón donde está. Esos lugares los calcula tools/glosario/glosario.mjs corriendo los ejemplos y
   los guarda en js/generado/glosario.js (self.SP_GLOSARIO), que la interfaz carga al abrir el glosario.
   Módulo puro (sin DOM), probado en node:

     SP.glosario.terminos()            todos: [{ id, tipo: 'estadistico' | 'concepto', grupo, nombre, simbolo, que,
                                        relacionados }], en orden alfabético
     SP.glosario.termino(id)           uno
     SP.glosario.grupos()              [[id, nombre]]: los conceptos y los grupos del registro
     SP.glosario.buscar(texto, grupo)  los términos que coinciden, del más al menos parecido
     SP.glosario.lugares(id, datos)    dónde verlo en acción: [{ metodo, cuadro, modo, x }] (modo 'c' columna por su
                                        clave, 'f' renglón por su número, 'q' el cuadro, 's' un selector); datos =
                                        SP_GLOSARIO
     SP.glosario.aparece(id, datos)    los análisis donde aparece (ids de SP.metodos)
     SP.glosario.CONCEPTOS             [id, nombre, qué es, claves de búsqueda, relacionados, en acción] (para el
                                        generador) */
SP.definir('glosario', function (SP) {
  'use strict';
  const T = SP.T;

  /* los conceptos: [id, nombre, qué es, claves de búsqueda (también en inglés), relacionados, en acción]
     en acción: [método, cuadro, modo, x] con el renglón por su primera celda (el generador lo vuelve número) */
  const CONCEPTOS = () => [
    ['unidad-experimental', T('Unidad experimental'), T('La unidad a la que se asigna un tratamiento y en la que se mide la respuesta: una parcela, una maceta, un animal. Varias mediciones de la misma unidad no son repeticiones.'),
      ['parcela', 'experimental unit', 'pseudorreplica'], ['repeticion', 'tratamiento'], null],
    ['repeticion', T('Repetición'), T('Cada unidad experimental independiente que recibe el mismo tratamiento. Las repeticiones muestran cuánto varía la respuesta sin cambiar el tratamiento, y de ahí sale el error experimental.'),
      ['replica', 'replicate', 'replication'], ['unidad-experimental', 'bloque'], null],
    ['tratamiento', T('Tratamiento'), T('Cada condición que se compara en un experimento: un nivel de un factor o una combinación de niveles de varios factores, como un híbrido con una dosis de nitrógeno.'),
      ['treatment', 'combinacion'], ['factor-nivel', 'interaccion'], ['dbca', 'celdas', 'q']],
    ['factor-nivel', T('Factor y nivel'), T('Un factor es una variable de clasificación cuyo efecto se estudia (el híbrido, la dosis tomada como tratamiento); sus niveles son los valores que toma (cada híbrido, cada dosis).'),
      ['factor', 'nivel', 'level', 'variable de clasificacion'], ['tratamiento', 'interaccion'], ['dbca', 'medias-hibrido', 'q']],
    ['bloque', T('Bloque'), T('Un grupo de unidades experimentales parecidas entre sí (un tramo del terreno, un invernadero, un día de trabajo) que recibe todos los tratamientos; la variación entre bloques sale del error.'),
      ['block', 'bloques'], ['repeticion', 'efecto-fijo-aleatorio'], ['dbca', 'anova', 'f', 'bloque']],
    ['interaccion', T('Interacción'), T('Cuando el efecto de un factor depende del nivel de otro (un híbrido responde más al nitrógeno que otro). Si es significativa, conviene comparar un factor dentro de cada nivel del otro.'),
      ['interaction', 'efectos simples'], ['factor-nivel', 'tratamiento'], ['dbca', 'anova', 'f', 'hibrido × dosis']],
    ['interaccion-ga', T('Interacción genotipo × ambiente'), T('Cuando el orden de los genotipos cambia de un ambiente a otro, o sus diferencias cambian de tamaño. Es lo que estudian los análisis multiambiente (AMMI, GGE) y la estabilidad.'),
      ['GxE', 'GxA', 'genotype by environment', 'estabilidad'], ['interaccion', 'megaambiente', 'asv'], ['ammi', 'anova', 'f', 'G × A']],
    ['covariable', T('Covariable'), T('Una variable numérica que no es tratamiento pero explica parte de la respuesta (el número de plantas, la altitud). El análisis de covarianza compara los tratamientos como si todos tuvieran el mismo valor de la covariable.'),
      ['covariate', 'ancova'], ['media-ajustada'], ['ancova', 'anova', 'f', 'plantas']],
    ['efecto-fijo-aleatorio', T('Efecto fijo y aleatorio'), T('Fijo: los niveles se eligieron a propósito y se quiere concluir sobre ellos. Aleatorio: los niveles son una muestra de muchos posibles (bloques, localidades, años); de un efecto aleatorio se estima su varianza.'),
      ['fixed effect', 'random effect', 'efecto aleatorio', 'efecto fijo', 'modelo mixto', 'mixed model'], ['componente', 'reml', 'blup'], ['componentes-varianza', 'componentes', 'q']],
    ['estrato-error', T('Estrato de error'), T('Cada tamaño de unidad de un diseño con parcelas de varios tamaños, con su propio error. En parcelas divididas, el factor de la parcela grande se prueba con el error a y el de la subparcela con el error b.'),
      ['error a', 'error b', 'parcela grande', 'whole plot', 'split plot'], ['bloque', 'unidad-experimental'], ['parcelas-divididas', 'anova', 'f', 'Error a']],
    ['sc-tipos', T('Sumas de cuadrados tipo I, II y III'), T('Tres maneras de probar cada término cuando los datos están desbalanceados: en el orden del modelo (tipo I), ajustado por los términos que no lo contienen (tipo II) o ajustado por todos los demás (tipo III). Con datos balanceados dan lo mismo.'),
      ['tipo III', 'type III', 'secuencial', 'parcial', 'desbalanceado'], ['sc'], ['dbca', 'anova', 'c', 'sc']],
    ['hipotesis', T('Hipótesis nula y alternativa'), T('La hipótesis nula (H₀) dice que no hay efecto: las medias son iguales, la correlación vale 0. La alternativa (H₁) dice que sí lo hay. Una prueba mide qué tan compatibles son los datos con H₀; no demuestra que sea cierta.'),
      ['H0', 'H1', 'null hypothesis', 'hipotesis'], ['p', 'alfa', 'errores-tipo'], ['prueba-t', 'prueba', 'q']],
    ['errores-tipo', T('Errores tipo I y tipo II'), T('Error tipo I: declarar un efecto que no existe; su probabilidad es α. Error tipo II: no detectar un efecto que sí existe; su probabilidad es β, y la potencia es 1 − β.'),
      ['falso positivo', 'falso negativo', 'type I error', 'type II error', 'beta'], ['alfa', 'potencia', 'hipotesis'], null],
    ['comparaciones-multiples', T('Comparaciones múltiples'), T('Al comparar muchas parejas de medias, la probabilidad de declarar alguna diferencia que no existe crece con el número de comparaciones. Tukey, Bonferroni y Holm, entre otros, ajustan los valores p para que esa probabilidad no pase de α.'),
      ['post hoc', 'posthoc', 'tukey', 'multiple comparisons', 'separacion de medias'], ['p-ajustado', 'letras'], ['comparaciones-medias', 'pares-1', 'c', 'p']],
    ['letras', T('Letras de las comparaciones'), T('En las comparaciones de medias, dos medias con una letra en común no difieren al nivel α elegido; la a va con la media más alta.'),
      ['agrupamiento', 'grupos de medias', 'letters', 'compact letter display'], ['comparaciones-multiples'], ['comparaciones-medias', 'medias-0', 'c', 'letras']],
    ['supuestos', T('Supuestos'), T('Las condiciones que un análisis da por ciertas para que sus valores p e intervalos valgan. En un análisis de varianza: residuos independientes, con distribución normal y con la misma varianza en todos los tratamientos; en bloques, además, sin interacción bloque × tratamiento.'),
      ['assumptions', 'normalidad', 'homogeneidad de varianzas', 'homocedasticidad', 'independencia'], ['residuo', 'semaforo', 'transformacion'], ['supuestos', 'supuestos', 'q']],
    ['residuo', T('Residuo'), T('Lo que queda de cada observación después de restarle lo que predice el modelo. Los supuestos de un modelo se revisan en sus residuos.'),
      ['residual', 'residuals', 'error'], ['residuo-std', 'supuestos'], ['supuestos', 'varianzas', 'q']],
    ['transformacion', T('Transformación'), T('Cambiar la escala de la respuesta (logaritmo, raíz cuadrada, recíproco) para que los residuos se acerquen a la normal o sus varianzas se igualen. El método de Box-Cox sugiere la potencia; los resultados se leen en la nueva escala.'),
      ['box-cox', 'boxcox', 'logaritmo', 'transformation'], ['supuestos'], ['supuestos', null, 's', '.sp-alternativas']],
    ['semaforo', T('Semáforo'), T('El recuadro que dice si se cumplen los supuestos de un análisis: verde, bien; ámbar, revisar; rojo, problema; gris, no aplica o no hay datos suficientes para revisarlo.'),
      ['traffic light', 'semaforo de supuestos'], ['supuestos'], ['prueba-t', null, 's', '.semaforo']],
    ['blue', T('BLUE'), T('Mejor estimador lineal insesgado: la media ajustada de un genotipo tomado como efecto fijo.'),
      ['mejor estimador lineal insesgado', 'best linear unbiased estimator'], ['blup', 'media-ajustada'], ['heredabilidad', 'genotipos', 'c', 'blue']],
    ['reml', T('REML'), T('Máxima verosimilitud restringida: estima los componentes de varianza descontando los grados de libertad que gastan los efectos fijos, y así corrige el sesgo hacia abajo de la máxima verosimilitud.'),
      ['maxima verosimilitud restringida', 'restricted maximum likelihood'], ['componente', 'efecto-fijo-aleatorio', 'loglik'], ['componentes-varianza', 'ajuste', 'f', 'Log-verosimilitud restringida']],
    ['censura', T('Censura'), T('En supervivencia, una unidad que terminó el ensayo sin el evento: se sabe que su tiempo es mayor que el observado y cuenta en el análisis hasta ese momento. En el resumen de Kaplan-Meier, las censuradas son las que faltan a los eventos para llegar a n.'),
      ['censored', 'dato censurado', 'censurado'], ['supervivencia', 'hr'], ['kaplan-meier', 'resumen', 'c', 'e']],
    ['de50', T('DE50'), T('En una curva dosis-respuesta, la dosis que da la mitad del efecto entre los límites de la curva; en el modelo log-logístico es el parámetro e. La DE10 y la DE90 dan el 10 y el 90 %.'),
      ['ED50', 'LD50', 'DL50', 'CI50', 'IC50', 'dosis efectiva media'], ['coeficiente'], ['dosis-respuesta', 'derivados', 'f', 'DE50']],
    ['sobredispersion', T('Sobredispersión'), T('Más variación de la que admite la distribución supuesta (Poisson, binomial). Se mide con la dispersión (la χ² de Pearson entre sus grados de libertad): cerca de 1 no la hay; si pasa claramente de 1, conviene un modelo que la admita, como la binomial negativa.'),
      ['overdispersion', 'sobre dispersion'], ['dispersion', 'theta-nb'], ['glm-conteos', 'ajuste', 'f', 'Dispersión (Pearson χ²/gl)']],
    ['megaambiente', T('Megaambiente'), T('Un grupo de ambientes en que gana el mismo genotipo, de forma repetida entre años. Con los datos de un solo ciclo, los sectores del biplot GGE son megaambientes posibles.'),
      ['mega-environment', 'quien gano donde', 'which-won-where'], ['interaccion-ga'], ['gge', 'ganadores', 'q']],
  ];

  /* claves de búsqueda de los estadísticos del registro: abreviaturas y nombres en inglés y otros nombres en español */
  const CLAVES = {
    p: ['p-value', 'p valor', 'significancia', 'sig'], 'p-ajustado': ['adjusted p', 'bonferroni', 'holm'],
    F: ['fisher', 'anova', 'f de snedecor'], t: ['student', 'welch'], chi2: ['chi cuadrada', 'chi cuadrado', 'chi-square', 'x2', 'ji2'],
    gl: ['df', 'degrees of freedom'], q: ['tukey', 'studentized range'], wilcoxon: ['mann-whitney', 'mann whitney', 'u'],
    kruskal: ['kruskal wallis'], shapiro: ['normalidad', 'shapiro wilk'], levene: ['homogeneidad de varianzas'],
    'durbin-watson': ['autocorrelacion', 'independencia'], 'falta-ajuste': ['lack of fit'],
    'd-cohen': ['cohen', 'tamano del efecto'], 'g-hedges': ['hedges'], 'eta2-h': ['eta cuadrada'], r: ['pearson', 'correlacion'],
    rho: ['spearman'], tau: ['kendall'], 'v-cramer': ['cramer'], kappa: ['cohen kappa', 'concordancia', 'acuerdo'],
    'razon-momios': ['odds ratio', 'momios'], hr: ['hazard ratio', 'razon de riesgos'], r2: ['r2', 'r cuadrada', 'coefficient of determination'],
    'r2-ajustada': ['r2 ajustada', 'adjusted r2'], aic: ['akaike'], bic: ['schwarz', 'bayesian information criterion'],
    dispersion: ['sobredispersion', 'overdispersion'], sigma: ['rmse', 'error estandar de la estimacion'],
    sc: ['ss', 'sum of squares'], cm: ['ms', 'mean square', 'cuadrado medio del error'], 'media-ajustada': ['media marginal', 'emmeans', 'ls means', 'medias de minimos cuadrados', 'blue'],
    media: ['mean', 'promedio'], de: ['sd', 'standard deviation', 'desviacion tipica'], ee: ['se', 'sem', 'standard error'],
    ic: ['ci', 'confidence interval', 'ic 95'], cv: ['cv%', 'coefficient of variation'], 'residuo-std': ['residuo', 'rstudent'],
    cook: ['influencia', 'cook'], vif: ['colinealidad', 'multicolinealidad'], heredabilidad: ['heritability', 'h2'],
    componente: ['varianza genetica', 'variance component', 'σ2g'], blup: ['best linear unbiased predictor', 'predictor'],
    potencia: ['power', 'beta'], alfa: ['alpha', 'nivel de significacion', 'significancia'], n: ['tamano de muestra', 'sample size', 'observaciones'],
    'tamano-muestra': ['sample size', 'cuantas repeticiones'], supervivencia: ['kaplan-meier', 'survival'], acf: ['autocorrelation', 'correlograma'],
    deseabilidad: ['desirability', 'derringer'], ecovalencia: ['wricke'], asv: ['ammi stability value', 'estabilidad'],
  };

  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/²/g, '2').replace(/₀/g, '0').replace(/₁/g, '1').replace(/[«»“”"'’()[\],;:.¿?¡!]/g, ' ').replace(/\s+/g, ' ').trim();

  let cache = null, porId = null;
  function armar() {
    if (cache && cache.catalogo === SP.T.catalogo) return cache.lista;
    const lista = [];
    for (const f of SP.guias.fichas())
      lista.push({ id: f.id, tipo: 'estadistico', grupo: f.grupo, nombre: f.nombre, simbolo: f.simbolo, que: f.que, claves: CLAVES[f.id] || [], relacionados: [] });
    for (const [id, nombre, que, claves, rel, accion] of CONCEPTOS())
      lista.push({ id, tipo: 'concepto', grupo: 'concepto', nombre, simbolo: '', que, claves, relacionados: rel, accion });
    lista.sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre), 'es'));
    for (const x of lista) x._n = { nombre: norm(x.nombre), simbolo: norm(x.simbolo), claves: x.claves.map(norm), que: norm(x.que) };
    porId = new Map(lista.map(x => [x.id, x]));
    /* el estadístico que nombra un concepto lo tiene de relacionado */
    for (const x of lista) if (x.tipo === 'concepto') for (const r of x.relacionados) { const y = porId.get(r); if (y && y.tipo === 'estadistico' && !y.relacionados.includes(x.id)) y.relacionados.push(x.id); }
    cache = { catalogo: SP.T.catalogo, lista };
    return lista;
  }
  const publico = x => ({ id: x.id, tipo: x.tipo, grupo: x.grupo, nombre: x.nombre, simbolo: x.simbolo, que: x.que, relacionados: x.relacionados.slice() });

  function terminos() { return armar().map(publico); }
  function termino(id) { armar(); const x = porId.get(id); return x ? publico(x) : null; }
  function grupos() { return [['concepto', T('Conceptos del diseño y del análisis')]].concat(SP.guias.GRUPOS); }

  /* qué tanto se parece un término a una palabra buscada (0: nada) */
  const empiezaPalabra = (texto, w) => texto === w || texto.startsWith(w) || texto.includes(' ' + w);
  function puntaje(x, w) {
    const n = x._n;
    if (n.nombre === w) return 120;
    /* con el mismo símbolo (F de Levene, F de Fisher…), primero el que lo lleva en el nombre */
    if (n.claves.includes(w) || n.simbolo === w) return (n.claves.includes(w) ? 100 : 95) + (n.nombre.split(' ').includes(w) ? 10 : 0);
    if (n.nombre.startsWith(w)) return 80;
    if (n.claves.some(k => k.startsWith(w))) return 70;
    if (w.length > 1 && n.simbolo.startsWith(w)) return 60;
    if (empiezaPalabra(n.nombre, w)) return 55;
    if (n.claves.some(k => empiezaPalabra(k, w))) return 45;
    if (w.length > 2 && n.nombre.includes(w)) return 40;
    if (w.length > 2 && n.claves.some(k => k.includes(w))) return 30;
    if (w.length > 3 && empiezaPalabra(n.que, w)) return 15;
    return 0;
  }
  /** Los términos que coinciden con el texto (todas sus palabras), del más al menos parecido; sin texto, todos. */
  function buscar(texto, grupo) {
    const lista = armar().filter(x => !grupo || x.grupo === grupo);
    const q = norm(texto), crudo = String(texto || '').trim();
    if (!q) return lista.map(publico);
    const palabras = q.split(' ');
    const conPuntaje = [];
    for (const x of lista) {
      /* la frase completa cuenta como una palabra más (para «falta de ajuste», «r2 ajustada»); el símbolo escrito igual,
         con su mayúscula, desempata («F» de Fisher y «f» de Cohen) */
      let total = (palabras.length > 1 ? Math.max(0, puntaje(x, q)) : 0) + (crudo === x.simbolo ? 3 : 0), todas = true;
      for (const w of palabras) { const p = puntaje(x, w); if (!p) { todas = false; break; } total += p; }
      if (todas || total >= 80) conPuntaje.push([total, x]);
    }
    return conPuntaje.sort((a, b) => b[0] - a[0] || a[1]._n.nombre.localeCompare(b[1]._n.nombre, 'es')).map(([, x]) => publico(x));
  }

  /** Dónde verlo en acción (con los datos generados). */
  function lugares(id, datos) {
    if (!datos) return [];
    const L = (datos.conceptos && datos.conceptos[id] ? [datos.conceptos[id]] : (datos.ver && datos.ver[id]) || []);
    return L.filter(l => datos.pedidos && datos.pedidos[l[0]]).map(([metodo, cuadro, modo, x]) => ({ metodo, cuadro, modo, x }));
  }
  /** Los análisis donde aparece. */
  function aparece(id, datos) {
    const t = termino(id);
    if (!t) return [];
    if (t.tipo === 'concepto') return lugares(id, datos).map(l => l.metodo);
    return ((datos && datos.donde && datos.donde[id]) || []).filter(m => SP.metodos[m]);
  }

  SP.glosario = { terminos, termino, grupos, buscar, lugares, aparece, normalizar: norm, get CONCEPTOS() { return CONCEPTOS(); } };
});
