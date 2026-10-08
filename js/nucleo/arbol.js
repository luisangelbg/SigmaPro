/* SigmaPro — el árbol de decisiones (hito 5.7): de la pregunta de la investigación al análisis, sin datos.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada nodo es una pregunta en lenguaje del campo con sus opciones; cada opción lleva a otra pregunta o a una hoja con
   uno o más análisis (con cuándo conviene cada uno). Sigue las mismas ramas que el asistente (js/nucleo/asistente.js),
   que decide con los datos cargados; el árbol sirve antes de tenerlos y para ver todas las ramas a la vez. Lo dibuja
   js/interfaz/arbol.js (Fundamentos, vista «Árbol de decisiones»).
   Módulo puro (sin DOM), probado en node (cada análisis de SP.metodos está en alguna hoja):

     SP.arbol.raiz()                 el árbol: { id, pregunta, ayuda, opciones: [{ id, texto, detalle, sig | hoja }] }
                                     hoja = [[método, cuándo]]
     SP.arbol.nodo(camino)           el nodo al que lleva un camino (ids de opciones), o null
     SP.arbol.caminos(metodo)        los caminos (ids de opciones) que llevan a una hoja con ese método
     SP.arbol.metodos()              los métodos que aparecen en alguna hoja */
SP.definir('arbol', function (SP) {
  'use strict';
  const T = SP.T;
  /* una opción que lleva a otra pregunta, y una que termina en análisis */
  const rama = (id, texto, detalle, sig) => ({ id, texto, detalle, sig });
  const hoja = (id, texto, detalle, metodos) => ({ id, texto, detalle, hoja: metodos });
  const pregunta = (id, texto, ayuda, opciones) => ({ id, pregunta: texto, ayuda, opciones });

  function construir() {
    return pregunta('inicio', T('¿Qué quieres hacer con tus datos?'), T('Elige lo que más se parece a tu pregunta de investigación.'), [
      rama('describir', T('Describirlos'), T('Centro, dispersión, frecuencias y porcentajes, antes de probar nada.'),
        pregunta('describir', T('¿Qué datos describes?'), '', [
          hoja('medidas', T('Medidas numéricas'), T('Rendimiento, altura, peso…'), [['descriptivos', T('media, desviación estándar, CV, cuartiles, por grupo')]]),
          hoja('categorias', T('Categorías'), T('Variedad, calificación de daño…'), [['frecuencias', T('cuántas veces aparece cada categoría; tablas cruzadas')]]),
          hoja('porcentajes', T('Porcentajes de un resultado'), T('Germinación, sobrevivencia…'), [['proporciones', T('la proporción con su intervalo de confianza')]]),
          hoja('esperado', T('Frecuencias contra una proporción esperada'), T('Una segregación 9:3:3:1, por ejemplo.'), [['bondad-ajuste', T('ji cuadrada de bondad de ajuste')]]),
        ])),
      rama('comparar', T('Comparar tratamientos o grupos'), T('¿Difieren las variedades, las dosis, los manejos?'),
        pregunta('respuesta', T('¿Qué mediste?'), T('La variable de respuesta decide la familia del análisis.'), [
          rama('continua', T('Una medida continua'), T('Rendimiento, altura, peso, contenido de un compuesto.'),
            pregunta('diseno', T('¿Cómo se organizó el ensayo?'), T('El diseño decide el modelo: cada forma de repartir los tratamientos tiene su análisis de varianza.'), [
              hoja('dos', T('Dos grupos'), T('Un testigo y un tratamiento, dos variedades.'), [['prueba-t', T('t de Welch o de Student; pareada si las mismas unidades se midieron dos veces')], ['wilcoxon', T('si los datos se alejan mucho de la normal')]]),
              hoja('dca', T('Tres o más tratamientos, todos al azar'), T('Unidades parecidas entre sí, sin bloques.'), [['dca', T('completamente al azar, con uno o varios factores')]]),
              hoja('dbca', T('En bloques completos'), T('Cada bloque tiene todos los tratamientos.'), [['dbca', T('bloques completos al azar')], ['mixto-bloques', T('con los bloques como efecto aleatorio')]]),
              hoja('latino', T('En bloques de filas y columnas'), T('Dos gradientes, uno en cada dirección.'), [['cuadro-latino', T('cuadro latino')]]),
              hoja('incompletos', T('En bloques incompletos'), T('Muchos tratamientos; cada bloque tiene solo algunos.'), [['latice', T('látice y alfa-látice, agrupados en repeticiones')], ['bib', T('bloques incompletos balanceados')], ['mixto-latice', T('recupera la información entre bloques')]]),
              hoja('parcelas', T('Parcelas grandes y parcelas chicas'), T('Un factor se aplicó a parcelas grandes y otro dentro de ellas.'), [['parcelas-divididas', T('dos factores')], ['parcelas-subdivididas', T('tres factores')], ['franjas', T('dos factores en franjas cruzadas')], ['mixto-divididas', T('como modelo mixto, también con datos faltantes')]]),
              hoja('covariable', T('Con una covariable'), T('Plantas por parcela, peso inicial, una lectura previa.'), [['ancova', T('compara las medias ajustadas a un mismo valor de la covariable')]]),
              hoja('repetidas', T('La misma unidad medida en varias fechas'), T('Altura cada semana, rendimiento de cada árbol en varias cosechas.'), [['medidas-repetidas', T('modelo mixto con la correlación entre fechas')]]),
              hoja('formula', T('Otro modelo, escrito como fórmula'), T('Para quien piensa en términos de modelo.'), [['modelo-lineal', T('efectos fijos, con sumas de cuadrados tipo I, II o III')], ['modelo-mixto', T('con efectos aleatorios')]]),
            ])),
          rama('rangos', T('Rangos, calificaciones o datos muy lejos de la normal'), T('Escalas de daño, preferencias, datos con valores extremos.'),
            pregunta('grupos', T('¿Cómo están los grupos?'), '', [
              hoja('dos-r', T('Dos grupos, o antes y después'), '', [['wilcoxon', T('Mann-Whitney para grupos independientes; rangos con signo para pareados')]]),
              hoja('varios-r', T('Tres o más grupos'), '', [['kruskal-wallis', T('Kruskal-Wallis con comparaciones de Dunn o Conover')]]),
              hoja('bloques-r', T('En bloques'), '', [['friedman', T('Friedman')]]),
            ])),
          hoja('conteos', T('Conteos'), T('Insectos por planta, frutos, plantas emergidas.'), [['glm-conteos', T('Poisson o binomial negativa')], ['glmm-bloques', T('con bloques aleatorios')]]),
          hoja('proporcion', T('Proporciones o sí / no'), T('Semillas que germinaron de un total, plantas vivas o muertas.'), [['glm-proporciones', T('binomial')], ['glmm-bloques', T('con bloques aleatorios')]]),
          hoja('positivos', T('Valores positivos y asimétricos'), T('Tiempos, concentraciones, pesos con cola larga.'), [['glm-gamma', T('gamma')], ['glm', T('otras familias y enlaces, escritos como fórmula')], ['glmm', T('generalizado con efectos aleatorios')]]),
          hoja('medias', T('Ya tengo el análisis de varianza: ¿qué medias difieren?'), T('El paso que sigue a un efecto significativo.'), [['comparaciones-medias', T('Tukey, Duncan, Dunnett, Bonferroni…')], ['contrastes', T('comparaciones planeadas antes del ensayo')], ['polinomios', T('para dosis numéricas: tendencia lineal, cuadrática…')], ['medias-ajustadas', T('medias marginales con su intervalo')]]),
          hoja('supuestos', T('Revisar los supuestos del análisis'), T('Normalidad de los residuos, varianzas iguales, independencia.'), [['supuestos', T('el semáforo de los supuestos, con su alternativa')]]),
        ])),
      rama('relacion', T('Relacionar variables numéricas'), T('¿Van juntas? ¿Una explica a la otra?'),
        pregunta('explicar', T('¿Hay una variable que quieras explicar o predecir?'), '', [
          rama('asociar', T('No: solo ver si van juntas'), T('Correlación, sin causa ni efecto.'),
            pregunta('cuantas', T('¿Cuántas variables?'), '', [
              hoja('dos-v', T('Dos'), '', [['correlacion', T('Pearson, Spearman o Kendall')]]),
              hoja('varias-v', T('Varias a la vez'), '', [['matriz-correlacion', T('todas las parejas, con el p ajustado')]]),
              hoja('controlar', T('Dos, descontando otras'), '', [['correlacion-parcial', T('parcial y semiparcial')]]),
            ])),
          rama('explicar-y', T('Sí: una respuesta'), T('Rendimiento según la dosis, peso según la edad.'),
            pregunta('forma', T('¿Qué forma tiene la relación?'), '', [
              hoja('recta', T('Una recta, con uno o varios predictores'), '', [['regresion-lineal', T('regresión lineal simple o múltiple')]]),
              hoja('curva', T('Una curva'), '', [['regresion-polinomial', T('polinomio de grado 2 o 3')]]),
              hoja('crecimiento', T('Crecimiento en el tiempo, en forma de S'), '', [['curva-crecimiento', T('logístico, Gompertz o Weibull')]]),
              hoja('dosis', T('Respuesta a dosis de un producto'), T('Inhibición, mortalidad, control.'), [['dosis-respuesta', T('log-logístico o Brain-Cousens, con la DE50')]]),
              hoja('meseta', T('Sube y se estabiliza'), T('Rendimiento según la dosis de nitrógeno.'), [['respuesta-meseta', T('lineal o cuadrática con meseta, Mitscherlich o Michaelis-Menten, y la dosis económica')]]),
              hoja('seleccion', T('Muchos predictores: ¿cuáles sirven?'), '', [['seleccion-pasos', T('paso a paso, por AIC')], ['mejores-subconjuntos', T('todas las combinaciones, por BIC, Cp o R² ajustada')]]),
            ])),
          hoja('optimo', T('Buscar la combinación óptima de factores'), T('Nitrógeno y potasio para el mayor rendimiento.'), [['diseno-superficie', T('genera el diseño antes del ensayo')], ['superficie-respuesta', T('modelo de segundo orden y su punto estacionario')], ['ascenso-pronunciado', T('primer orden, para acercarse al óptimo')], ['mezclas', T('cuando los factores son proporciones que suman 1')], ['deseabilidad', T('varias respuestas a la vez')]]),
        ])),
      rama('categorias', T('Asociar categorías'), T('¿Depende una clasificación de otra?'),
        pregunta('casos', T('¿Cómo son los casos?'), '', [
          hoja('independientes', T('Independientes'), T('Cada unidad se clasificó una vez.'), [['tabla-contingencia', T('ji cuadrada o prueba exacta de Fisher')]]),
          hoja('pareados', T('Pareados: la misma unidad dos veces'), T('Antes y después.'), [['mcnemar', T('McNemar o Bowker')]]),
          hoja('evaluadores', T('Dos evaluadores califican lo mismo'), '', [['kappa', T('concordancia kappa')]]),
          hoja('estratos', T('En varios estratos'), T('Varias localidades o lotes.'), [['mantel-haenszel', T('Cochran-Mantel-Haenszel')]]),
        ])),
      hoja('ambientes', T('Comparar genotipos en varios ambientes'), T('Localidades, años o ciclos; la interacción genotipo × ambiente.'), [['ensayos-multiambiente', T('análisis conjunto')], ['dos-etapas', T('con una varianza del error por ambiente')], ['estabilidad', T('Eberhart-Russell, Wricke, Shukla y otros')], ['ammi', T('ejes de la interacción, ASV y WAAS')], ['gge', T('quién ganó dónde y el genotipo ideal')], ['mixto-localidades', T('modelo mixto con localidades aleatorias')]]),
      hoja('genetica', T('Estimar varianzas genéticas'), T('Heredabilidad, BLUP, repetibilidad.'), [['componentes-varianza', T('cuánto aporta cada fuente aleatoria')], ['heredabilidad', T('heredabilidad, BLUP y ganancia por selección')], ['repetibilidad', T('medidas repetidas del mismo individuo')]]),
      hoja('evento', T('Analizar el tiempo hasta un evento'), T('Días a la germinación, a la muerte, a la floración.'), [['kaplan-meier', T('curvas de supervivencia y log-rank')], ['cox', T('con covariables: razón de riesgos')]]),
      hoja('serie', T('Analizar una serie de tiempo'), T('Lluvia mensual, precios, capturas en trampas.'), [['tendencia', T('¿sube o baja? Mann-Kendall y Sen')], ['descomposicion', T('tendencia y ciclo estacional')], ['autocorrelacion', T('dependencia entre fechas')], ['arima', T('modelo y pronóstico')]]),
      hoja('varias', T('Analizar varias respuestas a la vez'), T('Largo, ancho y peso del fruto juntos.'), [['manova', T('¿difieren los tratamientos en el conjunto?')], ['discriminante', T('¿qué variables separan los grupos?')]]),
      hoja('muestreo', T('Estimar con una muestra'), T('Una población de árboles, parcelas o productores.'), [['muestreo-simple', T('muestreo aleatorio simple')], ['muestreo-estratificado', T('por estratos')], ['tamano-muestra', T('cuántas unidades medir')]]),
      hoja('planear', T('Planear un ensayo'), T('Antes de tener datos: cuántas repeticiones o unidades.'), [['repeticiones', T('repeticiones con el CV de la variable')], ['potencia-anova', T('varios tratamientos')], ['potencia-medias', T('dos medias')], ['potencia-proporciones', T('dos proporciones')], ['potencia-correlacion', T('una correlación')], ['tamano-muestra', T('estimar una media o una proporción')]]),
    ]);
  }

  let cache = null;
  const raiz = () => { if (!cache || cache.catalogo !== SP.T.catalogo) cache = { catalogo: SP.T.catalogo, arbol: construir() }; return cache.arbol; };
  /** El nodo (pregunta u opción final) al que lleva un camino de ids de opciones. */
  function nodo(camino) {
    let n = raiz();
    for (const id of camino || []) {
      if (!n || !n.opciones) return null;
      const o = n.opciones.find(x => x.id === id);
      if (!o) return null;
      n = o.sig || o;
    }
    return n;
  }
  /** Los caminos que terminan en una hoja con el método. */
  function caminos(metodo) {
    const out = [];
    (function rec(n, c) {
      for (const o of n.opciones) {
        if (o.hoja) { if (o.hoja.some(([m]) => m === metodo)) out.push(c.concat(o.id)); }
        else rec(o.sig, c.concat(o.id));
      }
    })(raiz(), []);
    return out;
  }
  function metodos() {
    const s = new Set();
    (function rec(n) { for (const o of n.opciones) { if (o.hoja) o.hoja.forEach(([m]) => s.add(m)); else rec(o.sig); } })(raiz());
    return [...s];
  }
  SP.arbol = { raiz, nodo, caminos, metodos };
});
