SP_FICHA({
  "id": "mcnemar",
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "dos-grupos",
  "disenos": ["medidas-repetidas"],
  "relacionados": ["kappa", "tabla-contingencia", "proporciones", "wilcoxon", "glmm"],
  "ejemplo": { "conjunto": "roya-evaluadores", "entradas": { "antes": "evaluador_A", "despues": "evaluador_B" }, "opciones": {} },
  "formato": {
    "largo": [["hoja", "evaluador_A", "evaluador_B"], ["H01", "0 sana", "0 sana"], ["H02", "0 sana", "0 sana"], ["H03", "3 severa", "3 severa"], ["H04", "0 sana", "1 leve"], ["H05", "1 leve", "1 leve"], ["H06", "0 sana", "1 leve"], ["H07", "0 sana", "1 leve"], ["H08", "0 sana", "0 sana"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba de McNemar", "Prueba de simetría de Bowker", "Ji cuadrada para datos pareados", "Proporciones correlacionadas"],
    "paraQue": "Prueba si cambia una clasificación cuando los mismos casos se clasifican dos veces: antes y después, o con dos métodos.",
    "preguntas": [
      "¿Aumenta la proporción de árboles con síntomas de una enfermedad entre la primera y la segunda revisión del huerto?",
      "¿Detecta un método rápido de laboratorio la misma proporción de semillas infectadas que el método de referencia, aplicados a las mismas semillas?",
      "¿Califica un evaluador sistemáticamente más alto que otro la severidad de roya en las mismas hojas?"
    ],
    "teoria": [
      "Cuando cada caso se clasifica dos veces, las dos clasificaciones no son independientes y la ji cuadrada de una tabla de contingencia no sirve. En una tabla 2 × 2 de «antes» contra «después», los casos de la diagonal no cambiaron y no dicen nada sobre el cambio; la información está en los casos discordantes: los que pasaron de la primera categoría a la segunda (n12) y los que pasaron de la segunda a la primera (n21). Si no hubiera un cambio neto, los dos tipos de cambio serían igual de probables.",
      "La prueba de McNemar compara esos dos conteos con una ji cuadrada de 1 grado de libertad; por omisión lleva la corrección por continuidad, que resta 1 a la diferencia. SigmaPro da además la prueba binomial exacta: n12 de n12 + n21 cambios con probabilidad 1/2. En 2 × 2, la conclusión se basa en la binomial exacta, que no depende de tener muchos casos discordantes.",
      "Con más de dos categorías (por ejemplo, grados de severidad), la app aplica la prueba de simetría de Bowker: compara cada par de celdas opuestas a la diagonal (de i a j contra de j a i) y suma las ji cuadradas, con un grado de libertad por par. Los pares de categorías sin ningún cambio no aportan información; SigmaPro los deja fuera y baja los grados de libertad (R, en cambio, da un resultado indefinido). El cuadro de proporciones muestra cuánto pesa cada categoría en la primera y en la segunda clasificación."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\frac{(|n_{12} - n_{21}| - 1)^2}{n_{12} + n_{21}}, \\quad \\chi^2_{B} = \\sum_{i < j} \\frac{(n_{ij} - n_{ji})^2}{n_{ij} + n_{ji}}",
      "terminos": [
        ["n_{12}, n_{21}", "los casos que cambiaron de la categoría 1 a la 2 y de la 2 a la 1 (filas: primera clasificación; columnas: segunda)"],
        ["- 1", "la corrección por continuidad (opcional, solo en 2 × 2)"],
        ["\\chi^2", "el estadístico de McNemar, con 1 grado de libertad"],
        ["\\chi^2_{B}", "el estadístico de Bowker, con un grado de libertad por cada par de categorías con algún cambio"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_{12} = \\pi_{21}", "h1": "\\pi_{12} \\ne \\pi_{21}", "texto": "En 2 × 2: los dos tipos de cambio son igual de probables, así que la proporción de cada categoría es la misma en las dos clasificaciones. Se prueba con la ji cuadrada de McNemar y con la binomial exacta." },
      { "h0": "\\pi_{ij} = \\pi_{ji} \\text{ para todo } i < j", "h1": "\\pi_{ij} \\ne \\pi_{ji} \\text{ para algún par}", "texto": "Con más de dos categorías: la tabla es simétrica (cada cambio de i a j es tan probable como el de j a i). Se prueba con la ji cuadrada de Bowker." }
    ],
    "supuestos": [
      { "nombre": "Datos pareados", "como": "Lo da el diseño: cada fila es el mismo caso clasificado dos veces. No se prueba con los datos.", "verificar": null, "siFalla": "Si las dos clasificaciones vienen de casos distintos (dos grupos de plantas), no hay pares: usa la tabla de contingencia.", "alternativa": "tabla-contingencia" },
      { "nombre": "Mismas categorías en las dos clasificaciones", "como": "SigmaPro junta las categorías de las dos columnas en una tabla cuadrada, en el orden de la primera; una categoría escrita distinto («Sana» y «sana») cuenta como otra.", "verificar": null, "siFalla": "Unifica los nombres de las categorías antes del análisis; el orden se fija en Datos con «Ordenar niveles…».", "alternativa": null },
      { "nombre": "Suficientes casos discordantes", "como": "Este análisis no tiene semáforo. En 2 × 2, la binomial exacta se calcula siempre y la conclusión se basa en ella; con más categorías, una nota avisa de los pares sin cambios que quedaron fuera.", "verificar": null, "siFalla": "Con pocos cambios en tablas grandes, junta categorías vecinas para que la aproximación de Bowker sea confiable.", "alternativa": null },
      { "nombre": "Casos independientes entre sí", "como": "Lo da el muestreo: cada caso (hoja, árbol, semilla) es distinto de los demás. No se prueba con los datos.", "verificar": null, "siFalla": "Si los casos vienen agrupados (varias hojas por planta), considera un modelo mixto con la planta como efecto aleatorio.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "hoja", "tipo": "identificador", "papel": "no entra al análisis" },
        { "nombre": "evaluador_A", "tipo": "factor con k niveles", "papel": "primera clasificación (antes)" },
        { "nombre": "evaluador_B", "tipo": "factor con los mismos k niveles", "papel": "segunda clasificación (después)" }
      ],
      "minimo": "Al menos dos categorías. Para confiar en la ji cuadrada de McNemar conviene tener unos 10 o más casos discordantes; con menos, lee la binomial exacta.",
      "balance": "Las filas a las que les falta alguna de las dos clasificaciones no entran (una nota lo dice). Las categorías que no aparecen en ninguna de las dos se quitan.",
      "notaFormato": "Una fila por caso, con una columna para cada clasificación (o una fila por combinación con una columna de frecuencias). No apiles las dos clasificaciones en una sola columna: se perdería el par.",
      "errores": [
        "Analizar los datos pareados como dos grupos independientes con la tabla de contingencia.",
        "Capturar solo los totales de cada clasificación: sin la tabla cruzada no se sabe quién cambió.",
        "Escribir las categorías de forma distinta en las dos columnas.",
        "Usar McNemar para medir concordancia: dice si hay cambio neto, no qué tanto coinciden las clasificaciones (para eso, kappa)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira la tabla cruzada y el mapa de calor: la diagonal son los casos que no cambiaron y fuera de ella están los cambios.",
        "En 2 × 2, lee los dos conteos discordantes en la conclusión y decide con la binomial exacta (la ji cuadrada de McNemar la acompaña).",
        "Con más categorías, lee la ji cuadrada de Bowker, sus grados de libertad y las notas sobre pares sin cambios.",
        "Si hay cambio, el cuadro «Proporción de cada categoría» muestra en qué sentido."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La proporción de árboles con síntomas aumentó de 22 % en la primera revisión a 35 % en la segunda: 14 árboles pasaron de sanos a enfermos y 3 en sentido contrario (McNemar χ²(1) = 5.9, p = 0.015; binomial exacta p = 0.013)».",
      "guias": ["mcnemar", "binomial-exacta", "chi2", "gl", "p"]
    },
    "limitaciones": [
      "Compara solo dos clasificaciones; con tres o más revisiones de una respuesta sí o no, usa un modelo mixto binomial con el caso como efecto aleatorio.",
      "Bowker prueba la simetría completa de la tabla, una condición más exigente que la igualdad de las proporciones de cada categoría.",
      "No mide qué tanto coinciden las dos clasificaciones: para eso usa la concordancia (kappa).",
      "Con una respuesta numérica medida dos veces (no categorías), usa la prueba t pareada o Wilcoxon."
    ],
    "referencias": [
      "McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. Psychometrika, 12(2), 153–157.",
      "Bowker, A. H. (1948). A test for symmetry in contingency tables. Journal of the American Statistical Association, 43(244), 572–574.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  },
  "en": {
    "alias": ["McNemar test", "Bowker symmetry test", "Chi-square for paired data", "Correlated proportions"],
    "paraQue": "Tests whether a classification changes when the same cases are classified twice: before and after, or with two methods.",
    "preguntas": [
      "Does the proportion of trees with disease symptoms increase between the first and the second inspection of the orchard?",
      "Does a quick laboratory method detect the same proportion of infected seeds as the reference method, both applied to the same seeds?",
      "Does one rater systematically score rust severity higher than another on the same leaves?"
    ],
    "teoria": [
      "When each case is classified twice, the two classifications are not independent and the chi-square of a contingency table does not apply. In a 2 × 2 table of “before” against “after”, the cases on the diagonal did not change and say nothing about change; the information is in the discordant cases: those that moved from the first category to the second (n12) and those that moved from the second to the first (n21). If there were no net change, both kinds of change would be equally likely.",
      "The McNemar test compares those two counts with a chi-square with 1 degree of freedom; by default it uses the continuity correction, which subtracts 1 from the difference. SigmaPro also gives the exact binomial test: n12 out of n12 + n21 changes with probability 1/2. In 2 × 2 tables, the conclusion is based on the exact binomial, which does not depend on having many discordant cases.",
      "With more than two categories (for example, severity grades), the app applies Bowker’s symmetry test: it compares each pair of cells opposite the diagonal (from i to j against from j to i) and adds up the chi-squares, with one degree of freedom per pair. Pairs of categories with no change carry no information; SigmaPro leaves them out and lowers the degrees of freedom (R, instead, returns an undefined result). The proportions table shows how much each category weighs in the first and in the second classification."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\frac{(|n_{12} - n_{21}| - 1)^2}{n_{12} + n_{21}}, \\quad \\chi^2_{B} = \\sum_{i < j} \\frac{(n_{ij} - n_{ji})^2}{n_{ij} + n_{ji}}",
      "terminos": [
        ["n_{12}, n_{21}", "the cases that changed from category 1 to 2 and from 2 to 1 (rows: first classification; columns: second)"],
        ["- 1", "the continuity correction (optional, 2 × 2 only)"],
        ["\\chi^2", "the McNemar statistic, with 1 degree of freedom"],
        ["\\chi^2_{B}", "Bowker’s statistic, with one degree of freedom for each pair of categories with some change"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_{12} = \\pi_{21}", "h1": "\\pi_{12} \\ne \\pi_{21}", "texto": "In 2 × 2: both kinds of change are equally likely, so the proportion of each category is the same in both classifications. Tested with McNemar’s chi-square and with the exact binomial." },
      { "h0": "\\pi_{ij} = \\pi_{ji} \\text{ for all } i < j", "h1": "\\pi_{ij} \\ne \\pi_{ji} \\text{ for some pair}", "texto": "With more than two categories: the table is symmetric (each change from i to j is as likely as from j to i). Tested with Bowker’s chi-square." }
    ],
    "supuestos": [
      { "nombre": "Paired data", "como": "It comes from the design: each row is the same case classified twice. It is not tested with the data.", "verificar": null, "siFalla": "If the two classifications come from different cases (two groups of plants), there are no pairs: use the contingency table.", "alternativa": "tabla-contingencia" },
      { "nombre": "Same categories in both classifications", "como": "SigmaPro merges the categories of the two columns into a square table, in the order of the first; a category spelled differently (“Healthy” and “healthy”) counts as another one.", "verificar": null, "siFalla": "Make the category names identical before the analysis; the order is set in Data with “Order levels…”.", "alternativa": null },
      { "nombre": "Enough discordant cases", "como": "This analysis has no assumptions checklist. In 2 × 2 tables, the exact binomial is always computed and the conclusion is based on it; with more categories, a note reports the pairs without changes that were left out.", "verificar": null, "siFalla": "With few changes in large tables, merge neighboring categories so that Bowker’s approximation is reliable.", "alternativa": null },
      { "nombre": "Cases independent of each other", "como": "It comes from the sampling: each case (leaf, tree, seed) is different from the others. It is not tested with the data.", "verificar": null, "siFalla": "If the cases come in clusters (several leaves per plant), consider a mixed model with the plant as a random effect.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "hoja", "tipo": "identifier", "papel": "not used in the analysis" },
        { "nombre": "evaluador_A", "tipo": "factor with k levels", "papel": "first classification (before)" },
        { "nombre": "evaluador_B", "tipo": "factor with the same k levels", "papel": "second classification (after)" }
      ],
      "minimo": "At least two categories. To trust McNemar’s chi-square you should have about 10 or more discordant cases; with fewer, read the exact binomial.",
      "balance": "Rows with a missing value in either classification are left out (a note says so). Categories that appear in neither are dropped.",
      "notaFormato": "One row per case, with one column for each classification (or one row per combination with a frequency column). Do not stack both classifications in a single column: the pairing would be lost.",
      "errores": [
        "Analyzing paired data as two independent groups with the contingency table.",
        "Entering only the totals of each classification: without the crossed table you cannot tell who changed.",
        "Spelling the categories differently in the two columns.",
        "Using McNemar to measure agreement: it says whether there is net change, not how much the classifications agree (for that, kappa)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the crossed table and the heat map: the diagonal holds the cases that did not change and the changes lie off it.",
        "In 2 × 2 tables, read the two discordant counts in the conclusion and decide with the exact binomial (McNemar’s chi-square goes with it).",
        "With more categories, read Bowker’s chi-square, its degrees of freedom and the notes on pairs without changes.",
        "If there is change, the table “Proportion of each category” shows in which direction."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The proportion of trees with symptoms rose from 22 % at the first inspection to 35 % at the second: 14 trees went from healthy to diseased and 3 the other way (McNemar χ²(1) = 5.9, p = 0.015; exact binomial p = 0.013).”",
      "guias": ["mcnemar", "binomial-exacta", "chi2", "gl", "p"]
    },
    "limitaciones": [
      "It compares only two classifications; with three or more inspections of a yes/no response, use a binomial mixed model with the case as a random effect.",
      "Bowker tests the full symmetry of the table, a stricter condition than equal proportions for each category.",
      "It does not measure how much the two classifications agree: for that, use agreement (kappa).",
      "With a numeric response measured twice (not categories), use the paired t test or Wilcoxon."
    ],
    "referencias": [
      "McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. Psychometrika, 12(2), 153–157.",
      "Bowker, A. H. (1948). A test for symmetry in contingency tables. Journal of the American Statistical Association, 43(244), 572–574.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  }
});
