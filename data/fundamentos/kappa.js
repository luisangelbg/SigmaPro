SP_FICHA({
  "id": "kappa",
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "dos-grupos",
  "disenos": ["ninguno"],
  "relacionados": ["mcnemar", "tabla-contingencia", "repetibilidad", "frecuencias"],
  "ejemplo": { "conjunto": "roya-evaluadores", "entradas": { "evaluador1": "evaluador_A", "evaluador2": "evaluador_B" }, "opciones": {} },
  "formato": {
    "largo": [["hoja", "evaluador_A", "evaluador_B"], ["H01", "0 sana", "0 sana"], ["H02", "0 sana", "0 sana"], ["H03", "3 severa", "3 severa"], ["H04", "0 sana", "1 leve"], ["H05", "1 leve", "1 leve"], ["H06", "0 sana", "1 leve"], ["H07", "0 sana", "1 leve"], ["H08", "0 sana", "0 sana"]],
    "ancho": null
  },
  "es": {
    "alias": ["Kappa de Cohen", "Kappa ponderada", "Concordancia entre evaluadores", "Acuerdo entre observadores"],
    "paraQue": "Mide qué tanto coinciden dos evaluadores (o dos métodos) al clasificar los mismos casos, descontando las coincidencias que se darían por azar.",
    "preguntas": [
      "¿Califican igual dos técnicos la severidad de roya (sana, leve, moderada, severa) en las mismas hojas de café?",
      "¿Concuerda la clasificación visual de la madurez del aguacate con la del contenido de materia seca?",
      "¿Es confiable una escala de daño por helada para que la usen varios evaluadores en un ensayo regional?"
    ],
    "teoria": [
      "Cuando dos personas o dos métodos clasifican los mismos casos, el porcentaje de coincidencias exagera la concordancia: aunque calificaran al azar coincidirían en parte, y más si casi todo cae en una misma categoría. La kappa de Cohen corrige eso: compara la proporción de coincidencias observada (la diagonal de la tabla) con la que se esperaría por azar a partir de los totales de cada evaluador, y la expresa como fracción del máximo posible. Vale 1 si coinciden siempre, 0 si coinciden lo mismo que por azar y es negativa si coinciden menos.",
      "Con categorías ordenadas, como grados de severidad, no es igual confundir «sana» con «leve» que «sana» con «severa». La kappa ponderada da crédito parcial a los desacuerdos entre categorías vecinas: con pesos cuadráticos (los de omisión), un desacuerdo de dos grados pesa cuatro veces más que uno de un grado; con pesos lineales, el doble. SigmaPro la muestra cuando hay más de dos categorías, ordenadas como en la primera columna.",
      "El error estándar es el de Fleiss, Cohen y Everitt (1969): el intervalo de confianza usa el error estándar general y la prueba z, el que corresponde a una concordancia por azar. La conclusión califica la kappa con la escala de Landis y Koch (1977): leve hasta 0.2, aceptable hasta 0.4, moderada hasta 0.6, considerable hasta 0.8 y casi perfecta por encima; un valor negativo es peor que el azar."
    ],
    "modelo": {
      "tex": "\\kappa = \\frac{p_o - p_e}{1 - p_e}, \\quad p_o = \\sum_{i} p_{ii}, \\quad p_e = \\sum_{i} p_{i+} p_{+i}, \\quad w_{ij} = 1 - \\frac{(i - j)^2}{(k - 1)^2}",
      "terminos": [
        ["p_{ij}", "la proporción de casos que el evaluador 1 puso en la categoría i y el evaluador 2 en la j"],
        ["p_o", "la proporción de coincidencias observada (la diagonal de la tabla)"],
        ["p_e", "la proporción de coincidencias esperada por azar, con los totales de cada evaluador"],
        ["w_{ij}", "el peso de la kappa ponderada (cuadrático; el lineal es 1 − |i − j| entre k − 1); la ponderada usa la misma fórmula con las proporciones multiplicadas por estos pesos"],
        ["k", "el número de categorías"]
      ]
    },
    "hipotesis": [
      { "h0": "\\kappa = 0", "h1": "\\kappa \\ne 0", "texto": "La concordancia no supera la del azar. Prueba z con el error estándar bajo concordancia por azar; rechazarla solo dice que hay más acuerdo que el azar, no que el acuerdo sea bueno." }
    ],
    "supuestos": [
      { "nombre": "Los mismos casos, calificados de forma independiente", "como": "Lo da el diseño: los dos evaluadores califican los mismos casos sin ver la calificación del otro. No se prueba con los datos.", "verificar": null, "siFalla": "Si un evaluador conoce la calificación del otro, la kappa se infla: repite la evaluación a ciegas.", "alternativa": null },
      { "nombre": "Mismas categorías y, para la ponderada, en orden", "como": "Este análisis no tiene semáforo. SigmaPro arma una tabla cuadrada con las categorías de las dos columnas, en el orden de la primera (el orden se fija en Datos con «Ordenar niveles…»); una categoría que solo usó el evaluador 2 se intercala después de la que la precede en su columna, y si todas las categorías son números se ordenan de menor a mayor.", "verificar": null, "siFalla": "Unifica los nombres de las categorías y ordénalas de menor a mayor. Antes de leer la kappa ponderada, revisa en la tabla cruzada que las categorías estén en su orden natural; si un evaluador no usó alguna, ponlo como evaluador 2.", "alternativa": null },
      { "nombre": "Sin sesgo sistemático entre evaluadores", "como": "La kappa no separa el sesgo del desacuerdo al azar: compara lo que califica cada evaluador con McNemar (Bowker, con más de dos categorías) sobre las mismas dos columnas.", "verificar": "mcnemar", "siFalla": "Si un evaluador califica más alto, capacita a los dos con una escala de referencia e informa el sesgo junto con la kappa.", "alternativa": null },
      { "nombre": "Suficientes casos", "como": "El intervalo y la prueba usan errores estándar de muestras grandes.", "verificar": null, "siFalla": "Con pocos casos el intervalo es muy ancho: califica más unidades, que cubran todas las categorías.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "hoja", "tipo": "identificador", "papel": "no entra al análisis" },
        { "nombre": "evaluador_A", "tipo": "factor con k niveles", "papel": "evaluador 1" },
        { "nombre": "evaluador_B", "tipo": "factor con los mismos k niveles", "papel": "evaluador 2" }
      ],
      "minimo": "Al menos dos categorías; conviene calificar 50 o más casos que cubran todas las categorías para que el intervalo sea útil.",
      "balance": "Las filas a las que les falta alguna de las dos calificaciones no entran. Si un evaluador no usó alguna categoría, la tabla cuadrada la conserva con ceros, en su lugar.",
      "notaFormato": "Una fila por caso calificado, con una columna para cada evaluador, o una fila por combinación con una columna de frecuencias.",
      "errores": [
        "Medir la concordancia solo con el porcentaje de coincidencias, sin descontar el azar.",
        "Usar la kappa ponderada con categorías sin orden (colores, tipos de daño).",
        "Dejar las categorías en un orden que no es el natural (por ejemplo, «alta», «baja», «media» en orden alfabético): fija el orden en Datos antes de leer la ponderada.",
        "Que cada evaluador califique casos distintos: la kappa requiere los mismos casos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira la tabla y el mapa de calor: la diagonal son las coincidencias y las celdas vecinas, los desacuerdos de un grado.",
        "Compara en la conclusión el porcentaje de coincidencias con el que se esperaría por azar.",
        "Lee la kappa con su intervalo y la calificación de Landis y Koch; con categorías ordenadas, lee también la kappa ponderada.",
        "La p solo dice si el acuerdo supera al azar: juzga la calidad por el valor de la kappa y su intervalo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los dos evaluadores coincidieron en el 80 % de las hojas, frente al 30 % esperado por azar (kappa = 0.71, IC 95 %: 0.59 a 0.83; concordancia considerable según Landis y Koch); con pesos cuadráticos, la kappa ponderada fue de 0.90».",
      "guias": ["kappa", "ic", "ee", "z", "p"]
    },
    "limitaciones": [
      "Solo compara dos evaluadores a la vez; con más, calcula la kappa de cada par.",
      "La kappa depende de qué tan frecuentes son las categorías: si una domina, puede salir baja aunque el porcentaje de coincidencias sea alto.",
      "Para mediciones numéricas (altura, número de lesiones) no uses kappa: la repetibilidad (una correlación intraclase) mide la concordancia entre medidas del mismo individuo.",
      "La escala de Landis y Koch es una convención; informa siempre el valor y su intervalo."
    ],
    "referencias": [
      "Cohen, J. (1960). A coefficient of agreement for nominal scales. Educational and Psychological Measurement, 20(1), 37–46.",
      "Cohen, J. (1968). Weighted kappa: Nominal scale agreement provision for scaled disagreement or partial credit. Psychological Bulletin, 70(4), 213–220.",
      "Fleiss, J. L., Cohen, J., & Everitt, B. S. (1969). Large sample standard errors of kappa and weighted kappa. Psychological Bulletin, 72(5), 323–327.",
      "Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159–174.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Cohen’s kappa", "Weighted kappa", "Inter-rater agreement", "Observer agreement"],
    "paraQue": "Measures how much two raters (or two methods) agree when classifying the same cases, discounting the agreement expected by chance.",
    "preguntas": [
      "Do two technicians score rust severity (healthy, mild, moderate, severe) the same way on the same coffee leaves?",
      "Does the visual ripeness classification of avocado agree with the one based on dry matter content?",
      "Is a frost damage scale reliable enough to be used by several raters in a regional trial?"
    ],
    "teoria": [
      "When two people or two methods classify the same cases, the percentage of agreement overstates the concordance: even scoring at random they would agree in part, and more so if almost everything falls in one category. Cohen’s kappa corrects for that: it compares the observed proportion of agreement (the diagonal of the table) with the one expected by chance from each rater’s totals, and expresses it as a fraction of the maximum possible. It is 1 if they always agree, 0 if they agree as much as chance and negative if they agree less.",
      "With ordered categories, such as severity grades, confusing “healthy” with “mild” is not the same as confusing “healthy” with “severe”. Weighted kappa gives partial credit to disagreements between neighboring categories: with quadratic weights (the default), a disagreement of two grades weighs four times as much as one of one grade; with linear weights, twice as much. SigmaPro shows it when there are more than two categories, ordered as in the first column.",
      "The standard error is that of Fleiss, Cohen and Everitt (1969): the confidence interval uses the general standard error and the z test, the one that corresponds to chance agreement. The conclusion rates kappa with the Landis and Koch (1977) scale: slight up to 0.2, fair up to 0.4, moderate up to 0.6, substantial up to 0.8 and almost perfect above; a negative value is worse than chance."
    ],
    "modelo": {
      "tex": "\\kappa = \\frac{p_o - p_e}{1 - p_e}, \\quad p_o = \\sum_{i} p_{ii}, \\quad p_e = \\sum_{i} p_{i+} p_{+i}, \\quad w_{ij} = 1 - \\frac{(i - j)^2}{(k - 1)^2}",
      "terminos": [
        ["p_{ij}", "the proportion of cases that rater 1 placed in category i and rater 2 in category j"],
        ["p_o", "the observed proportion of agreement (the diagonal of the table)"],
        ["p_e", "the proportion of agreement expected by chance, from each rater’s totals"],
        ["w_{ij}", "the weight of the weighted kappa (quadratic; the linear one is 1 − |i − j| divided by k − 1); the weighted kappa uses the same formula with the proportions multiplied by these weights"],
        ["k", "the number of categories"]
      ]
    },
    "hipotesis": [
      { "h0": "\\kappa = 0", "h1": "\\kappa \\ne 0", "texto": "Agreement does not exceed chance. z test with the standard error under chance agreement; rejecting it only says that there is more agreement than chance, not that agreement is good." }
    ],
    "supuestos": [
      { "nombre": "The same cases, rated independently", "como": "It comes from the design: both raters score the same cases without seeing each other’s score. It is not tested with the data.", "verificar": null, "siFalla": "If one rater knows the other’s score, kappa is inflated: repeat the rating blind.", "alternativa": null },
      { "nombre": "Same categories and, for the weighted kappa, ordered", "como": "This analysis has no assumptions checklist. SigmaPro builds a square table with the categories of both columns, in the order of the first (the order is set in Data with “Order levels…”); a category used only by rater 2 is placed right after the one that precedes it in that column, and if all categories are numbers they are sorted from lowest to highest.", "verificar": null, "siFalla": "Make the category names identical and order them from lowest to highest. Before reading the weighted kappa, check in the crossed table that the categories are in their natural order; if one rater did not use some category, enter that rater as rater 2.", "alternativa": null },
      { "nombre": "No systematic bias between raters", "como": "Kappa does not separate bias from chance disagreement: compare what each rater scores with McNemar (Bowker, with more than two categories) on the same two columns.", "verificar": "mcnemar", "siFalla": "If one rater scores higher, train both with a reference scale and report the bias together with kappa.", "alternativa": null },
      { "nombre": "Enough cases", "como": "The interval and the test use large-sample standard errors.", "verificar": null, "siFalla": "With few cases the interval is very wide: rate more units, covering every category.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "hoja", "tipo": "identifier", "papel": "not used in the analysis" },
        { "nombre": "evaluador_A", "tipo": "factor with k levels", "papel": "rater 1" },
        { "nombre": "evaluador_B", "tipo": "factor with the same k levels", "papel": "rater 2" }
      ],
      "minimo": "At least two categories; rate 50 or more cases covering every category so that the interval is useful.",
      "balance": "Rows missing either of the two ratings are left out. If a rater did not use some category, the square table keeps it with zeros, in its place.",
      "notaFormato": "One row per rated case, with one column for each rater, or one row per combination with a frequency column.",
      "errores": [
        "Measuring agreement only with the percentage of matches, without discounting chance.",
        "Using the weighted kappa with unordered categories (colors, types of damage).",
        "Leaving the categories in an order that is not the natural one (for example, “high”, “low”, “medium” in alphabetical order): set the order in Data before reading the weighted kappa.",
        "Having each rater score different cases: kappa requires the same cases."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the table and the heat map: the diagonal holds the matches and the neighboring cells, the one-grade disagreements.",
        "Compare in the conclusion the percentage of agreement with the one expected by chance.",
        "Read kappa with its interval and the Landis and Koch rating; with ordered categories, also read the weighted kappa.",
        "The p-value only says whether agreement exceeds chance: judge the quality by the value of kappa and its interval."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The two raters agreed on 80 % of the leaves, against 30 % expected by chance (kappa = 0.71, 95 % CI: 0.59 to 0.83; substantial agreement according to Landis and Koch); with quadratic weights, the weighted kappa was 0.90.”",
      "guias": ["kappa", "ic", "ee", "z", "p"]
    },
    "limitaciones": [
      "It compares only two raters at a time; with more, compute the kappa of each pair.",
      "Kappa depends on how frequent the categories are: if one dominates, it can be low even when the percentage of agreement is high.",
      "For numeric measurements (height, number of lesions) do not use kappa: repeatability (an intraclass correlation) measures agreement between measurements of the same individual.",
      "The Landis and Koch scale is a convention; always report the value and its interval."
    ],
    "referencias": [
      "Cohen, J. (1960). A coefficient of agreement for nominal scales. Educational and Psychological Measurement, 20(1), 37–46.",
      "Cohen, J. (1968). Weighted kappa: Nominal scale agreement provision for scaled disagreement or partial credit. Psychological Bulletin, 70(4), 213–220.",
      "Fleiss, J. L., Cohen, J., & Everitt, B. S. (1969). Large sample standard errors of kappa and weighted kappa. Psychological Bulletin, 72(5), 323–327.",
      "Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159–174.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  }
});
