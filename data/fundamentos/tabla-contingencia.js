SP_FICHA({
  "id": "tabla-contingencia",
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "k-grupos",
  "disenos": ["dca", "muestreo"],
  "relacionados": ["mantel-haenszel", "mcnemar", "frecuencias", "bondad-ajuste", "glm-proporciones", "proporciones"],
  "ejemplo": { "conjunto": "germinacion-lotes", "entradas": { "fila": "tratamiento", "columna": "germinacion", "frecuencia": "semillas" }, "opciones": {} },
  "formato": {
    "largo": [["lote", "tratamiento", "germinacion", "semillas"], ["L1", "Fungicida", "Germinó", "80"], ["L1", "Fungicida", "No germinó", "20"], ["L1", "Testigo", "Germinó", "65"], ["L1", "Testigo", "No germinó", "35"], ["L2", "Fungicida", "Germinó", "79"], ["L2", "Fungicida", "No germinó", "21"], ["L2", "Testigo", "Germinó", "67"], ["L2", "Testigo", "No germinó", "33"]],
    "ancho": [["lote", "tratamiento", "Germinó", "No germinó"], ["L1", "Fungicida", "80", "20"], ["L1", "Testigo", "65", "35"], ["L2", "Fungicida", "79", "21"], ["L2", "Testigo", "67", "33"]]
  },
  "es": {
    "alias": ["Prueba de ji cuadrada de independencia", "Prueba exacta de Fisher", "Tabla cruzada", "Medidas de asociación"],
    "paraQue": "Prueba si dos variables categóricas están asociadas, dónde está la diferencia y qué tan fuerte es.",
    "preguntas": [
      "¿Germina más la semilla de frijol tratada con fungicida que la no tratada?",
      "¿Depende la incidencia de mancha de asfalto (presente o ausente) de la variedad de maíz?",
      "¿Se distribuyen igual los grados de daño por plaga (leve, moderado, severo) en tres huertas de aguacate?"
    ],
    "teoria": [
      "Una tabla de contingencia cuenta cuántos casos caen en cada combinación de dos variables categóricas: semillas que germinaron o no según el tratamiento, plantas sanas o enfermas según la variedad. La pregunta es si las variables son independientes, es decir, si la proporción de cada columna es la misma en todas las filas. Bajo independencia, la frecuencia esperada de una celda es el total de su fila por el de su columna, dividido entre el total general.",
      "La ji cuadrada de Pearson suma, celda por celda, el cuadrado de la diferencia entre lo observado y lo esperado, dividido entre lo esperado; la razón de verosimilitudes G² mide lo mismo con logaritmos. Las dos se comparan con una ji cuadrada de (r − 1)(c − 1) grados de libertad, aproximación que falla con frecuencias esperadas pequeñas. Por eso SigmaPro calcula también la prueba exacta de Fisher: siempre en tablas 2 × 2 y, en tablas mayores de hasta 5000 casos, cuando alguna esperada es menor que 5 o hay 300 casos o menos. Si hay esperadas menores que 5, la conclusión se basa en Fisher. En tablas 2 × 2, la ji cuadrada lleva por omisión la corrección de Yates.",
      "Rechazar la independencia no dice dónde está la diferencia: los residuos ajustados señalan las celdas con muchos más o muchos menos casos de los esperados (más allá de ±1.96). La fuerza de la asociación se mide con la V de Cramér, además de φ, el coeficiente de contingencia, la λ de Goodman y Kruskal y el coeficiente de incertidumbre; en tablas 2 × 2, con la razón de momios y el riesgo relativo, y si las categorías tienen orden, con γ, τ-b, τ-c y la d de Somers."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\sum_{i=1}^{r} \\sum_{j=1}^{c} \\frac{(n_{ij} - E_{ij})^2}{E_{ij}}, \\quad E_{ij} = \\frac{n_{i+} n_{+j}}{n}, \\quad G^2 = 2 \\sum_{i=1}^{r} \\sum_{j=1}^{c} n_{ij} \\ln \\frac{n_{ij}}{E_{ij}}",
      "terminos": [
        ["n_{ij}", "los casos observados en la fila i y la columna j"],
        ["E_{ij}", "los casos esperados en esa celda si las variables fueran independientes"],
        ["n_{i+}, n_{+j}", "los totales de la fila i y de la columna j"],
        ["n", "el total de casos"],
        ["r, c", "el número de categorías de las filas y de las columnas; las dos pruebas tienen (r − 1)(c − 1) grados de libertad"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_{ij} = \\pi_{i+} \\pi_{+j}", "h1": "\\pi_{ij} \\ne \\pi_{i+} \\pi_{+j} \\text{ en alguna celda}", "texto": "Las dos variables son independientes: la distribución de la variable de las columnas es la misma en cada fila. Se prueba con la ji cuadrada de Pearson, la razón de verosimilitudes G² y la exacta de Fisher." }
    ],
    "supuestos": [
      { "nombre": "Casos independientes", "como": "Lo da el diseño: cada caso aparece una sola vez en la tabla. No se prueba con los datos.", "verificar": null, "siFalla": "Si el mismo caso se clasificó dos veces (antes y después, o dos evaluadores), la tabla es pareada: usa McNemar.", "alternativa": "mcnemar" },
      { "nombre": "Frecuencias esperadas suficientes", "como": "Este análisis no tiene semáforo: bajo el cuadro de pruebas, SigmaPro avisa cuántas celdas tienen frecuencia esperada menor que 5 y cuál es la mínima; en ese caso calcula Fisher y basa la conclusión en ella.", "verificar": null, "siFalla": "Lee la exacta de Fisher. Si la tabla es tan grande que Fisher tarda demasiado (la app lo indica), junta las categorías poco frecuentes.", "alternativa": null },
      { "nombre": "Conteos, no porcentajes", "como": "Si la columna de frecuencias no es entera, SigmaPro lo avisa y no calcula la prueba de Fisher.", "verificar": null, "siFalla": "Captura el número de casos. Si tienes la proporción de germinadas con su número de semillas por unidad, usa el modelo binomial.", "alternativa": "glm-proporciones" },
      { "nombre": "Sin una tercera variable que confunda", "como": "No se revisa aquí: si los datos vienen de varios lotes, sitios o años, compara la asociación dentro de cada uno con Cochran-Mantel-Haenszel y su prueba de Breslow-Day.", "verificar": "mantel-haenszel", "siFalla": "Juntar estratos con proporciones distintas puede crear, ocultar o invertir una asociación (paradoja de Simpson): analiza por estratos.", "alternativa": "mantel-haenszel" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tratamiento", "tipo": "factor con r niveles", "papel": "variable de las filas" },
        { "nombre": "germinacion", "tipo": "factor con c niveles", "papel": "variable de las columnas" },
        { "nombre": "semillas", "tipo": "conteo", "papel": "frecuencias (opcional)" }
      ],
      "minimo": "Cada variable necesita al menos dos categorías con datos (hasta 50). Conviene que todas las frecuencias esperadas sean de 5 o más; si no, SigmaPro se apoya en la exacta de Fisher.",
      "balance": "No hacen falta totales iguales por fila. Las filas con algún faltante no entran (el cuadro lo dice) y las categorías sin casos se quitan de la tabla.",
      "notaFormato": "Formato largo: una fila por caso (cada semilla con su tratamiento y su resultado) o, como en el ejemplo, una fila por combinación con una columna de frecuencias. Una tabla ya cruzada, con una columna por categoría (como el formato ancho), se pasa a formato largo en Datos con «Ancha ⇄ larga…».",
      "errores": [
        "Capturar porcentajes o proporciones en lugar del número de casos.",
        "Contar varias veces la misma unidad (cada fruto de un mismo árbol como caso independiente).",
        "Sumar lotes, sitios o años con proporciones distintas sin revisar cada uno.",
        "Dejar muchas categorías con pocos casos: junta las raras antes del análisis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira la tabla observada y el mosaico: el ancho de cada barra es el total de la fila y las alturas, la proporción de cada columna.",
        "Lee las pruebas de independencia y sus notas: si alguna frecuencia esperada es menor que 5, decide con la exacta de Fisher.",
        "Si hay asociación, busca en el cuadro de esperados las celdas con residuo ajustado mayor que 1.96 en valor absoluto.",
        "Mide la fuerza con la V de Cramér; en 2 × 2, con la razón de momios y el riesgo relativo y sus intervalos.",
        "Usa las medidas ordinales (γ, τ-b, τ-c, d de Somers) solo si las categorías de las dos variables tienen orden."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La germinación dependió del tratamiento de la semilla (χ²(1) = 28.4, p < 0.001; V de Cramér = 0.19): germinó el 82 % de la semilla con fungicida y el 67 % del testigo (razón de momios = 2.3, IC 95 %: 1.7 a 3.2)».",
      "guias": ["chi2", "lrt", "fisher-exacta", "v-cramer", "razon-momios", "p"]
    },
    "limitaciones": [
      "Solo cruza dos variables; si los datos vienen de varios estratos (lotes, sitios, años), usa Cochran-Mantel-Haenszel.",
      "Con datos pareados (la misma unidad clasificada dos veces) la prueba no vale: usa McNemar.",
      "No modela varios factores a la vez ni covariables: para una respuesta sí o no, o de éxitos sobre ensayos, usa el modelo binomial.",
      "La asociación no indica causa, y las medidas ordinales no tienen sentido con categorías sin orden."
    ],
    "referencias": [
      "Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 50(302), 157–175.",
      "Fisher, R. A. (1922). On the interpretation of χ² from contingency tables, and the calculation of P. Journal of the Royal Statistical Society, 85(1), 87–94.",
      "Yates, F. (1934). Contingency tables involving small numbers and the χ² test. Supplement to the Journal of the Royal Statistical Society, 1(2), 217–235.",
      "Mehta, C. R., & Patel, N. R. (1983). A network algorithm for performing Fisher’s exact test in r × c contingency tables. Journal of the American Statistical Association, 78(382), 427–434.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Chi-square test of independence", "Fisher’s exact test", "Cross-tabulation", "Measures of association"],
    "paraQue": "Tests whether two categorical variables are associated, where the difference lies and how strong it is.",
    "preguntas": [
      "Does bean seed treated with fungicide germinate more than untreated seed?",
      "Does the incidence of tar spot (present or absent) depend on the maize variety?",
      "Are pest damage grades (mild, moderate, severe) distributed alike in three avocado orchards?"
    ],
    "teoria": [
      "A contingency table counts how many cases fall in each combination of two categorical variables: seeds that germinated or not by treatment, healthy or diseased plants by variety. The question is whether the variables are independent, that is, whether the proportion in each column is the same in every row. Under independence, the expected frequency of a cell is its row total times its column total, divided by the grand total.",
      "Pearson’s chi-square adds up, cell by cell, the squared difference between observed and expected, divided by the expected; the likelihood ratio G² measures the same with logarithms. Both are compared with a chi-square with (r − 1)(c − 1) degrees of freedom, an approximation that fails with small expected frequencies. That is why SigmaPro also computes Fisher’s exact test: always in 2 × 2 tables and, in larger tables with up to 5,000 cases, when some expected frequency is below 5 or there are 300 cases or fewer. If some expected frequencies are below 5, the conclusion is based on Fisher. In 2 × 2 tables, the chi-square uses the Yates correction by default.",
      "Rejecting independence does not tell where the difference lies: the adjusted residuals flag the cells with many more or many fewer cases than expected (beyond ±1.96). The strength of the association is measured with Cramér’s V, along with φ, the contingency coefficient, Goodman and Kruskal’s λ and the uncertainty coefficient; in 2 × 2 tables, with the odds ratio and the relative risk, and if the categories are ordered, with γ, τ-b, τ-c and Somers’ d."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\sum_{i=1}^{r} \\sum_{j=1}^{c} \\frac{(n_{ij} - E_{ij})^2}{E_{ij}}, \\quad E_{ij} = \\frac{n_{i+} n_{+j}}{n}, \\quad G^2 = 2 \\sum_{i=1}^{r} \\sum_{j=1}^{c} n_{ij} \\ln \\frac{n_{ij}}{E_{ij}}",
      "terminos": [
        ["n_{ij}", "the cases observed in row i and column j"],
        ["E_{ij}", "the cases expected in that cell if the variables were independent"],
        ["n_{i+}, n_{+j}", "the totals of row i and column j"],
        ["n", "the total number of cases"],
        ["r, c", "the number of row and column categories; both tests have (r − 1)(c − 1) degrees of freedom"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_{ij} = \\pi_{i+} \\pi_{+j}", "h1": "\\pi_{ij} \\ne \\pi_{i+} \\pi_{+j} \\text{ in some cell}", "texto": "The two variables are independent: the distribution of the column variable is the same in every row. Tested with Pearson’s chi-square, the likelihood ratio G² and Fisher’s exact test." }
    ],
    "supuestos": [
      { "nombre": "Independent cases", "como": "It comes from the design: each case appears only once in the table. It is not tested with the data.", "verificar": null, "siFalla": "If the same case was classified twice (before and after, or two raters), the table is paired: use McNemar.", "alternativa": "mcnemar" },
      { "nombre": "Large enough expected frequencies", "como": "This analysis has no assumptions checklist: below the tests table, SigmaPro reports how many cells have an expected frequency below 5 and the smallest one; in that case it computes Fisher and bases the conclusion on it.", "verificar": null, "siFalla": "Read Fisher’s exact test. If the table is so large that Fisher takes too long (the app says so), merge the rare categories.", "alternativa": null },
      { "nombre": "Counts, not percentages", "como": "If the frequency column is not whole numbers, SigmaPro warns and does not compute Fisher’s test.", "verificar": null, "siFalla": "Enter the number of cases. If you have the proportion germinated with its number of seeds per unit, use the binomial model.", "alternativa": "glm-proporciones" },
      { "nombre": "No confounding third variable", "como": "It is not checked here: if the data come from several lots, sites or years, compare the association within each with Cochran-Mantel-Haenszel and its Breslow-Day test.", "verificar": "mantel-haenszel", "siFalla": "Pooling strata with different proportions can create, hide or reverse an association (Simpson’s paradox): analyze by strata.", "alternativa": "mantel-haenszel" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tratamiento", "tipo": "factor with r levels", "papel": "row variable" },
        { "nombre": "germinacion", "tipo": "factor with c levels", "papel": "column variable" },
        { "nombre": "semillas", "tipo": "count", "papel": "frequencies (optional)" }
      ],
      "minimo": "Each variable needs at least two categories with data (up to 50). All expected frequencies should be 5 or more; otherwise, SigmaPro relies on Fisher’s exact test.",
      "balance": "Row totals need not be equal. Rows with any missing value are left out (the table says so) and categories without cases are dropped from the table.",
      "notaFormato": "Long format: one row per case (each seed with its treatment and its outcome) or, as in the example, one row per combination with a frequency column. An already crossed table, with one column per category (like the wide format), is converted to long format in Data with “Wide ⇄ long…”.",
      "errores": [
        "Entering percentages or proportions instead of the number of cases.",
        "Counting the same unit several times (each fruit from the same tree as an independent case).",
        "Pooling lots, sites or years with different proportions without checking each one.",
        "Keeping many categories with few cases: merge the rare ones before the analysis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the observed table and the mosaic plot: the width of each bar is the row total and the heights, the proportion of each column.",
        "Read the tests of independence and their notes: if some expected frequency is below 5, decide with Fisher’s exact test.",
        "If there is an association, look in the expected-frequencies table for the cells with an adjusted residual larger than 1.96 in absolute value.",
        "Measure the strength with Cramér’s V; in 2 × 2 tables, with the odds ratio and the relative risk and their intervals.",
        "Use the ordinal measures (γ, τ-b, τ-c, Somers’ d) only if the categories of both variables are ordered."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Germination depended on the seed treatment (χ²(1) = 28.4, p < 0.001; Cramér’s V = 0.19): 82 % of the fungicide-treated seed germinated versus 67 % of the control (odds ratio = 2.3, 95 % CI: 1.7 to 3.2).”",
      "guias": ["chi2", "lrt", "fisher-exacta", "v-cramer", "razon-momios", "p"]
    },
    "limitaciones": [
      "It crosses only two variables; if the data come from several strata (lots, sites, years), use Cochran-Mantel-Haenszel.",
      "With paired data (the same unit classified twice) the test is not valid: use McNemar.",
      "It does not model several factors at once or covariates: for a yes/no response, or successes out of trials, use the binomial model.",
      "Association does not imply cause, and the ordinal measures make no sense with unordered categories."
    ],
    "referencias": [
      "Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 50(302), 157–175.",
      "Fisher, R. A. (1922). On the interpretation of χ² from contingency tables, and the calculation of P. Journal of the Royal Statistical Society, 85(1), 87–94.",
      "Yates, F. (1934). Contingency tables involving small numbers and the χ² test. Supplement to the Journal of the Royal Statistical Society, 1(2), 217–235.",
      "Mehta, C. R., & Patel, N. R. (1983). A network algorithm for performing Fisher’s exact test in r × c contingency tables. Journal of the American Statistical Association, 78(382), 427–434.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  }
});
