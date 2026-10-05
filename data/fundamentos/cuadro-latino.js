SP_FICHA({
  "id": "cuadro-latino",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["latino"],
  "relacionados": ["dbca", "dca", "parcelas-divididas", "comparaciones-medias", "supuestos", "modelo-lineal"],
  "ejemplo": { "conjunto": "trigo", "entradas": { "respuesta": "rend", "tratamientos": ["variedad"], "fila": "hilera", "columna": "columna" }, "opciones": {} },
  "formato": {
    "largo": [["hilera", "columna", "variedad", "rend"], ["1", "1", "B", "5.53"], ["1", "2", "A", "5.37"], ["1", "3", "E", "5.23"], ["1", "4", "C", "4.92"], ["1", "5", "D", "5.5"], ["2", "1", "C", "4.98"], ["2", "2", "B", "5.52"]],
    "ancho": null
  },
  "es": {
    "alias": ["Cuadro latino", "Diseño en cuadro latino", "Bloqueo en dos direcciones", "Latin square"],
    "paraQue": "Compara tratamientos cuando el terreno o el material cambia en dos direcciones a la vez, quitando las dos con hileras y columnas.",
    "preguntas": [
      "¿Difieren cinco variedades de trigo en un terreno con pendiente de norte a sur y un gradiente de humedad de este a oeste?",
      "¿Cambia el peso del fruto con cuatro programas de fertilización en una huerta donde la edad de los árboles varía por hilera y el riego por columna?",
      "¿Qué dieta da más ganancia de peso cuando cada animal (hilera) recibe todas las dietas en periodos distintos (columna)?"
    ],
    "teoria": [
      "Cuando la variación del terreno corre en dos direcciones, por ejemplo una pendiente de norte a sur y un gradiente de humedad de este a oeste, un solo sistema de bloques no basta. El cuadro latino acomoda t tratamientos en t hileras y t columnas de modo que cada tratamiento aparezca una sola vez en cada hilera y una sola vez en cada columna. Así, las diferencias entre hileras y entre columnas salen del error al mismo tiempo, con solo t repeticiones.",
      "El análisis de varianza divide la variación total en hileras, columnas, tratamientos y error, que tiene (t − 1)(t − 2) grados de libertad. Por eso los cuadros chicos (3 × 3 o 4 × 4) dejan pocos grados de libertad para el error y los muy grandes son difíciles de manejar en campo. En SigmaPro los tratamientos pueden ser uno o dos factores cruzados (hilera + columna + A × B), con sumas de cuadrados tipo III, II o I y, con dos factores, los efectos simples de cada uno dentro de los niveles del otro.",
      "La app calcula además la eficiencia relativa del cuadro latino (Gomez y Gomez, 1984): cuánto ganó el ensayo frente a un diseño completamente al azar y frente a bloques completos que usaran solo las hileras o solo las columnas, con el factor de ajuste cuando el error tiene menos de 20 grados de libertad. Una eficiencia de 130 % quiere decir que el otro diseño habría necesitado 30 % más repeticiones para la misma precisión. El modelo supone que hileras, columnas y tratamientos no interactúan."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\rho_i + \\gamma_j + \\tau_k + \\varepsilon_{ijk}, \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "la respuesta de la parcela de la hilera i y la columna j, que recibió el tratamiento k"],
        ["\\mu", "la media general"],
        ["\\rho_i", "el efecto de la hilera i"],
        ["\\gamma_j", "el efecto de la columna j"],
        ["\\tau_k", "el efecto del tratamiento k (con dos factores: efectos principales e interacción)"],
        ["\\varepsilon_{ijk}", "el error experimental, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_k \\ne 0", "texto": "Los tratamientos tienen la misma media, una vez quitadas las hileras y las columnas. Se prueba con F = CM de tratamientos / CM del error; con dos factores, una prueba por efecto principal y otra por la interacción." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "«Revisar los supuestos del modelo» admite un solo bloque: pon los tratamientos y la hilera (o la columna) como bloque. Es una revisión aproximada, porque ese modelo no quita la otra dirección; su semáforo decide con Shapiro-Wilk y muestra el gráfico de cuantiles.", "verificar": "supuestos", "siFalla": "Con desvíos leves la F es robusta. Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) y vuelve a analizar.", "alternativa": null },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe, Levene, Bartlett y Fligner-Killeen por tratamiento en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo; para conteos o proporciones, un modelo lineal generalizado con la hilera y la columna en la fórmula.", "alternativa": "glm" },
      { "nombre": "Aditividad de hileras, columnas y tratamientos", "como": "No hay una prueba directa para el cuadro completo; la de no aditividad de Tukey en «Revisar los supuestos del modelo», con la hilera o la columna como bloque, da un indicio.", "verificar": "supuestos", "siFalla": "Si un tratamiento responde distinto según la hilera o la columna, una transformación (logaritmo) suele corregirlo.", "alternativa": null },
      { "nombre": "Independencia", "como": "La da el sorteo de hileras, columnas y tratamientos; Durbin-Watson, con una columna de orden que siga la posición en el campo, revisa si las parcelas vecinas se parecen.", "verificar": "supuestos", "siFalla": "Si la variación del terreno no es lineal por hileras y columnas, usa en el siguiente ensayo bloques más chicos (bloques incompletos).", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "variedad", "tipo": "factor con t niveles (1 o 2 factores)", "papel": "tratamientos" },
        { "nombre": "hilera", "tipo": "factor con t niveles", "papel": "filas (diseño)" },
        { "nombre": "columna", "tipo": "factor con t niveles", "papel": "columnas (diseño)" }
      ],
      "minimo": "Un cuadro de 5 × 5 a 8 × 8 deja al menos 12 grados de libertad para el error. Con 3 o 4 tratamientos, repite el cuadro y analiza los cuadros juntos con el modelo lineal general (cuadro, hilera y columna dentro de cada cuadro, y tratamiento).",
      "balance": "Cada tratamiento debe estar una vez en cada hilera y en cada columna; la app no revisa que el arreglo sea latino, solo ajusta el modelo. Si falta alguna parcela, usa sumas de cuadrados tipo III (o II), reporta medias marginales estimadas y no calcula la eficiencia relativa, que necesita las t × t parcelas.",
      "notaFormato": "Formato largo: una fila por parcela, con su hilera, su columna, el tratamiento y la respuesta. Las hileras y columnas pueden ser números: el diseño las toma como factores.",
      "errores": [
        "Capturar solo el número de parcela: el análisis necesita las dos coordenadas, hilera y columna.",
        "Usar un arreglo que no es latino (un tratamiento dos veces en la misma hilera): las pruebas dejan de estar balanceadas.",
        "Analizar un solo cuadro de 3 × 3 o 4 × 4: el error queda con 2 o 6 grados de libertad y la prueba casi no tiene potencia.",
        "Contar como repeticiones varias plantas de la misma parcela (pseudorreplicación)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los supuestos en «Revisar los supuestos del modelo», con una de las dos direcciones como bloque.",
        "En el cuadro de análisis de varianza, lee la F y la p de los tratamientos (y de su interacción, si son dos factores).",
        "Las F de hileras y columnas solo dicen si cada dirección de bloqueo ayudó.",
        "En el resumen del ensayo, mira el CV y las tres eficiencias relativas: frente a completamente al azar y frente a bloques por hileras o por columnas.",
        "Compara las medias con «Comparar las medias de este diseño»."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento difirió entre las cinco variedades (F(4, 12) = 9.8, p < 0.001). El coeficiente de variación fue de 4.1 %; la eficiencia relativa del cuadro latino fue de 140 % frente a un diseño completamente al azar y de 110 a 125 % frente a bloques en una sola dirección».",
      "guias": ["F", "p", "cv", "eficiencia", "r2"]
    },
    "limitaciones": [
      "Pide tantas repeticiones como tratamientos: con muchos tratamientos el cuadro se vuelve impráctico; usa bloques incompletos (látice).",
      "Supone que hileras, columnas y tratamientos no interactúan.",
      "Si un factor se aplica a parcelas grandes acomodadas en cuadro latino, usa parcelas divididas con las parcelas grandes en cuadro latino.",
      "Para conteos o proporciones, usa el modelo lineal generalizado (fórmula) con la hilera y la columna en el modelo."
    ],
    "referencias": [
      "Fisher, R. A. (1935). The design of experiments. Oliver and Boyd.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Latin square", "Latin square design", "Two-way blocking"],
    "paraQue": "Compares treatments when the field or the material changes in two directions at once, removing both with rows and columns.",
    "preguntas": [
      "Do five wheat varieties differ on a field with a north–south slope and an east–west moisture gradient?",
      "Does fruit weight change with four fertilization programs in an orchard where tree age varies by row and irrigation by column?",
      "Which diet gives the most weight gain when each animal (row) receives every diet in different periods (column)?"
    ],
    "teoria": [
      "When field variation runs in two directions, for example a north–south slope and an east–west moisture gradient, a single blocking system is not enough. The Latin square arranges t treatments in t rows and t columns so that each treatment appears exactly once in each row and once in each column. Differences between rows and between columns are thus removed from the error at the same time, with only t replicates.",
      "The analysis of variance splits the total variation into rows, columns, treatments and error, which has (t − 1)(t − 2) degrees of freedom. That is why small squares (3 × 3 or 4 × 4) leave few error degrees of freedom and very large ones are hard to handle in the field. In SigmaPro the treatments can be one or two crossed factors (row + column + A × B), with type III, II or I sums of squares and, with two factors, the simple effects of each one within the levels of the other.",
      "The app also computes the relative efficiency of the Latin square (Gomez and Gomez, 1984): how much the trial gained over a completely randomized design and over complete blocks using only the rows or only the columns, with the adjustment factor when the error has fewer than 20 degrees of freedom. An efficiency of 130% means the other design would have needed 30% more replicates for the same precision. The model assumes that rows, columns and treatments do not interact."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\rho_i + \\gamma_j + \\tau_k + \\varepsilon_{ijk}, \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "the response of the plot in row i and column j, which received treatment k"],
        ["\\mu", "the overall mean"],
        ["\\rho_i", "the effect of row i"],
        ["\\gamma_j", "the effect of column j"],
        ["\\tau_k", "the effect of treatment k (with two factors: main effects and interaction)"],
        ["\\varepsilon_{ijk}", "the experimental error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_k \\ne 0", "texto": "The treatments have the same mean once rows and columns are removed. Tested with F = treatment MS / error MS; with two factors, one test per main effect and one for the interaction." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "“Check the model assumptions” accepts a single block: enter the treatments and the row (or the column) as block. It is an approximate check, because that model does not remove the other direction; its checklist decides with the Shapiro-Wilk test and shows the quantile plot.", "verificar": "supuestos", "siFalla": "With mild departures the F test is robust. With strong departures, transform the response (Box-Cox in Data) and analyze again.", "alternativa": null },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe, Levene, Bartlett and Fligner-Killeen tests by treatment in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try a log transformation; for counts or proportions, a generalized linear model with row and column in the formula.", "alternativa": "glm" },
      { "nombre": "Additivity of rows, columns and treatments", "como": "There is no direct test for the whole square; Tukey’s nonadditivity test in “Check the model assumptions”, with the row or the column as block, gives a hint.", "verificar": "supuestos", "siFalla": "If a treatment responds differently depending on the row or the column, a transformation (log) usually fixes it.", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from randomizing rows, columns and treatments; the Durbin-Watson test, with an order column that follows the position in the field, checks whether neighboring plots are alike.", "verificar": "supuestos", "siFalla": "If field variation is not linear along rows and columns, use smaller blocks (incomplete blocks) in the next trial.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "variedad", "tipo": "factor with t levels (1 or 2 factors)", "papel": "treatments" },
        { "nombre": "hilera", "tipo": "factor with t levels", "papel": "rows (design)" },
        { "nombre": "columna", "tipo": "factor with t levels", "papel": "columns (design)" }
      ],
      "minimo": "A 5 × 5 to 8 × 8 square leaves at least 12 error degrees of freedom. With 3 or 4 treatments, repeat the square and analyze the squares together with the general linear model (square, row and column within each square, and treatment).",
      "balance": "Each treatment must appear once in each row and in each column; the app does not check that the layout is a Latin square, it only fits the model. If a plot is missing, it uses type III (or II) sums of squares, reports estimated marginal means and does not compute the relative efficiency, which needs all t × t plots.",
      "notaFormato": "Long format: one row per plot, with its row, its column, the treatment and the response. Rows and columns may be numbers: the design takes them as factors.",
      "errores": [
        "Entering only the plot number: the analysis needs both coordinates, row and column.",
        "Using a layout that is not a Latin square (a treatment twice in the same row): the tests are no longer balanced.",
        "Analyzing a single 3 × 3 or 4 × 4 square: the error is left with 2 or 6 degrees of freedom and the test has almost no power.",
        "Counting several plants from the same plot as replicates (pseudoreplication)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions in “Check the model assumptions”, with one of the two directions as block.",
        "In the analysis of variance table, read the F and p of the treatments (and of their interaction, if there are two factors).",
        "The row and column F tests only say whether each blocking direction helped.",
        "In the trial summary, look at the CV and the three relative efficiencies: against a completely randomized design and against blocks by rows or by columns.",
        "Compare the means with “Compare the means of this design”."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield differed among the five varieties (F(4, 12) = 9.8, p < 0.001). The coefficient of variation was 4.1%; the relative efficiency of the Latin square was 140% compared with a completely randomized design and 110 to 125% compared with blocks in a single direction.”",
      "guias": ["F", "p", "cv", "eficiencia", "r2"]
    },
    "limitaciones": [
      "It needs as many replicates as treatments: with many treatments the square becomes impractical; use incomplete blocks (lattice).",
      "It assumes that rows, columns and treatments do not interact.",
      "If one factor is applied to main plots arranged in a Latin square, use a split plot with the main plots in a Latin square.",
      "For counts or proportions, use the generalized linear model (formula) with row and column in the model."
    ],
    "referencias": [
      "Fisher, R. A. (1935). The design of experiments. Oliver and Boyd.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  }
});
