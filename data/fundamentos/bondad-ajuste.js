SP_FICHA({
  "id": "bondad-ajuste",
  "familia": "descriptiva",
  "respuesta": "categorica",
  "estructura": "una-muestra",
  "disenos": ["ninguno"],
  "relacionados": ["frecuencias", "proporciones", "tabla-contingencia", "glm-proporciones"],
  "ejemplo": { "conjunto": "mendel", "entradas": { "categoria": "fenotipo", "conteo": "semillas" }, "opciones": { "proporciones": [9, 3, 3, 1] } },
  "formato": {
    "largo": [["fenotipo", "forma", "color", "semillas"], ["redonda amarilla", "redonda", "amarilla", "315"], ["redonda verde", "redonda", "verde", "108"], ["rugosa amarilla", "rugosa", "amarilla", "101"], ["rugosa verde", "rugosa", "verde", "32"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba ji cuadrada de bondad de ajuste", "Ji cuadrada de Pearson para una muestra", "Prueba de segregación", "Bondad de ajuste a una proporción"],
    "paraQue": "Prueba si las frecuencias observadas de las categorías siguen una proporción esperada, por ejemplo la segregación 9:3:3:1 de un cruzamiento dihíbrido.",
    "preguntas": [
      "¿La F2 de un cruzamiento dihíbrido de chícharo segrega en la proporción 9:3:3:1?",
      "¿Se reparten por igual las hojas evaluadas entre las cuatro clases de severidad de roya?",
      "¿Es 1:1 la proporción de hembras y machos en una cría de un insecto benéfico?"
    ],
    "teoria": [
      "La prueba ji cuadrada de bondad de ajuste de Pearson compara lo que observaste con lo que esperarías si una hipótesis sobre las proporciones fuera cierta. Para cada una de las k categorías calcula la frecuencia esperada, n por la proporción que dice la hipótesis; luego suma las diferencias al cuadrado entre lo observado y lo esperado, cada una dividida entre lo esperado. Si la hipótesis es correcta, ese total se distribuye aproximadamente como una ji cuadrada con k − 1 grados de libertad, y un valor grande es evidencia en su contra.",
      "En genética es la prueba clásica de segregación: si una F2 dihíbrida sigue la herencia mendeliana con dominancia completa y genes independientes, sus cuatro fenotipos aparecen en proporción 9:3:3:1. En SigmaPro escribes la proporción con dos puntos (9:3:3:1, 1:2:1, 3:1) en el orden de los niveles que muestra el formulario, o la dejas vacía para probar que todas las categorías son igual de frecuentes; la app la reescala para que sume 1. Los datos pueden venir como una fila por observación o ya contados, con una columna de conteos.",
      "Además del estadístico y su valor p, el cuadro da para cada categoría lo esperado, su contribución a la ji cuadrada y el residuo estandarizado, que señala qué categoría se aleja más: más de 2 en valor absoluto merece atención. La aproximación ji cuadrada necesita esperados grandes; la app avisa cuando alguna categoría espera menos de 5 observaciones. Un valor p grande no demuestra la hipótesis: solo dice que los datos son compatibles con ella."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\sum_{j=1}^{k} \\frac{(O_j - E_j)^2}{E_j}, \\quad E_j = n \\pi_{0j}, \\quad gl = k - 1",
      "terminos": [
        ["O_j", "la frecuencia observada de la categoría j"],
        ["E_j", "la frecuencia esperada de la categoría j si la hipótesis es cierta"],
        ["\\pi_{0j}", "la proporción esperada de la categoría j, reescalada para que todas sumen 1"],
        ["n", "el total de observaciones"],
        ["k", "el número de categorías"],
        ["r_j = \\frac{O_j - E_j}{\\sqrt{n \\pi_{0j} (1 - \\pi_{0j})}}", "el residuo estandarizado de la categoría j"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_j = \\pi_{0j} \\text{ para toda } j", "h1": "\\pi_j \\ne \\pi_{0j} \\text{ para alguna } j", "texto": "Las proporciones de la población son las esperadas. Se rechaza si χ² es grande frente a una ji cuadrada con k − 1 grados de libertad." }
    ],
    "supuestos": [
      { "nombre": "Observaciones independientes", "como": "Cada observación (semilla, hoja, insecto) cae en una sola categoría y no influye en las demás; lo da el muestreo y no se prueba con los datos.", "verificar": null, "siFalla": "Si contaste varias veces la misma unidad o las unidades vienen en racimos (frutos de un mismo árbol), la prueba exagera la evidencia; analiza por unidad de muestreo.", "alternativa": null },
      { "nombre": "Frecuencias esperadas suficientes", "como": "La conclusión avisa cuántas categorías esperan menos de 5 observaciones, y el cuadro muestra cada esperado.", "verificar": null, "siFalla": "Junta categorías vecinas que tengan sentido biológico o aumenta la muestra; con solo dos categorías, estima la proporción con su intervalo exacto de Clopper-Pearson.", "alternativa": "proporciones" },
      { "nombre": "Proporción fijada antes de ver los datos", "como": "La app usa siempre k − 1 grados de libertad, lo correcto cuando la proporción viene de la teoría (como 9:3:3:1) y no se estimó con los mismos datos.", "verificar": null, "siFalla": "Si estimaste algo con los datos (por ejemplo, la frecuencia de un alelo para probar Hardy-Weinberg), hay que restar un grado de libertad por cada parámetro estimado: el p de la app quedaría demasiado grande.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "fenotipo", "tipo": "factor con k niveles", "papel": "categorías" },
        { "nombre": "semillas", "tipo": "conteo", "papel": "conteos (opcional): cuántas observaciones representa cada fila" }
      ],
      "minimo": "Que ninguna categoría espere menos de 5 observaciones. Con proporciones desiguales manda la categoría más rara: en 9:3:3:1 hacen falta al menos 80 observaciones para que la de 1/16 espere 5.",
      "balance": "Las filas sin categoría, o con el conteo faltante, no entran, y la app no dice cuántas quedaron fuera: compara el total del cuadro con el número de observaciones que esperabas. Si una categoría esperada no apareció en tus datos, agrégala con conteo 0 en una tabla ya contada para que entre en la prueba.",
      "notaFormato": "Dos formas: una tabla ya contada con una fila por categoría y una columna con su conteo (como en este ejemplo, la F2 dihíbrida de Mendel), que eliges en «Conteos», o una fila por observación con su categoría, dejando «Conteos» vacío. La proporción esperada se escribe en el orden de los niveles que muestra el formulario.",
      "errores": [
        "Escribir la proporción esperada en un orden distinto del de los niveles del factor (9:3:3:1 contra 1:3:3:9).",
        "Usar porcentajes o proporciones observadas en lugar de conteos: la prueba necesita frecuencias absolutas.",
        "Dejar categorías con esperados menores que 5 sin juntarlas.",
        "Probar con los mismos datos una proporción que se estimó con ellos, sin ajustar los grados de libertad."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: si las frecuencias son compatibles o no con la proporción esperada, con χ², gl y p.",
        "Revisa el aviso de esperados menores que 5 antes de confiar en el p.",
        "Si se rechaza, busca en el cuadro la categoría con el mayor residuo estandarizado (más de 2 en valor absoluto) y su contribución a χ².",
        "Compara lo observado con lo esperado para describir el sentido de la desviación: qué categorías tienen más, o menos, de lo esperado."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los cuatro fenotipos de la F2 (n = 556 semillas) fueron compatibles con la segregación 9:3:3:1 (χ² = 0.47, gl = 3, p = 0.93), lo que concuerda con dos genes independientes con dominancia completa».",
      "guias": ["chi2", "chi2-celda", "gl", "p", "residuo-std"]
    },
    "limitaciones": [
      "Compara una sola distribución con una teórica; para comparar la distribución entre grupos (tratamientos, localidades) usa la tabla de contingencia.",
      "No tiene una prueba exacta multinomial: con esperados pequeños, junta categorías; con dos categorías, usa la proporción con su intervalo exacto.",
      "No ajusta los grados de libertad por parámetros estimados con los mismos datos (por ejemplo, frecuencias alélicas).",
      "Con muestras muy grandes cualquier desviación mínima resulta significativa: mira también el tamaño de los residuos."
    ],
    "referencias": [
      "Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 50(302), 157–175.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  },
  "en": {
    "alias": ["Chi-square goodness of fit test", "Pearson's one-sample chi-square test", "Segregation test", "Goodness of fit to a ratio"],
    "paraQue": "Tests whether the observed frequencies of the categories follow an expected ratio, for example the 9:3:3:1 segregation of a dihybrid cross.",
    "preguntas": [
      "Does the F2 of a dihybrid pea cross segregate in a 9:3:3:1 ratio?",
      "Are the rated leaves evenly distributed among the four rust severity classes?",
      "Is the ratio of females to males 1:1 in a rearing of a beneficial insect?"
    ],
    "teoria": [
      "Pearson's chi-square goodness of fit test compares what you observed with what you would expect if a hypothesis about the proportions were true. For each of the k categories it computes the expected frequency, n times the proportion stated by the hypothesis; it then adds up the squared differences between observed and expected, each divided by the expected value. If the hypothesis is correct, that total approximately follows a chi-square distribution with k − 1 degrees of freedom, and a large value is evidence against it.",
      "In genetics it is the classic segregation test: if a dihybrid F2 follows Mendelian inheritance with complete dominance and independent genes, its four phenotypes appear in a 9:3:3:1 ratio. In SigmaPro you type the ratio with colons (9:3:3:1, 1:2:1, 3:1) in the order of the levels shown in the form, or leave it empty to test that all categories are equally frequent; the app rescales it so it adds up to 1. The data can come as one row per observation or already counted, with a count column.",
      "Besides the statistic and its p-value, the table gives for each category the expected value, its contribution to chi-square and the standardized residual, which points to the category that departs the most: more than 2 in absolute value deserves attention. The chi-square approximation needs large expected values; the app warns when any category expects fewer than 5 observations. A large p-value does not prove the hypothesis: it only says the data are compatible with it."
    ],
    "modelo": {
      "tex": "\\chi^2 = \\sum_{j=1}^{k} \\frac{(O_j - E_j)^2}{E_j}, \\quad E_j = n \\pi_{0j}, \\quad df = k - 1",
      "terminos": [
        ["O_j", "the observed frequency of category j"],
        ["E_j", "the expected frequency of category j if the hypothesis is true"],
        ["\\pi_{0j}", "the expected proportion of category j, rescaled so that they all add up to 1"],
        ["n", "the total number of observations"],
        ["k", "the number of categories"],
        ["r_j = \\frac{O_j - E_j}{\\sqrt{n \\pi_{0j} (1 - \\pi_{0j})}}", "the standardized residual of category j"]
      ]
    },
    "hipotesis": [
      { "h0": "\\pi_j = \\pi_{0j} \\text{ for every } j", "h1": "\\pi_j \\ne \\pi_{0j} \\text{ for some } j", "texto": "The population proportions are the expected ones. It is rejected if χ² is large compared with a chi-square distribution with k − 1 degrees of freedom." }
    ],
    "supuestos": [
      { "nombre": "Independent observations", "como": "Each observation (seed, leaf, insect) falls into a single category and does not influence the others; it comes from the sampling and is not tested with the data.", "verificar": null, "siFalla": "If you counted the same unit several times or the units come in clusters (fruits from the same tree), the test overstates the evidence; analyze by sampling unit.", "alternativa": null },
      { "nombre": "Large enough expected frequencies", "como": "The conclusion warns how many categories expect fewer than 5 observations, and the table shows each expected value.", "verificar": null, "siFalla": "Merge neighboring categories that make biological sense or increase the sample; with only two categories, estimate the proportion with its exact Clopper-Pearson interval.", "alternativa": "proporciones" },
      { "nombre": "Ratio fixed before seeing the data", "como": "The app always uses k − 1 degrees of freedom, which is correct when the ratio comes from theory (such as 9:3:3:1) and was not estimated from the same data.", "verificar": null, "siFalla": "If you estimated something from the data (for example, an allele frequency to test Hardy-Weinberg), one degree of freedom must be subtracted for each estimated parameter: the app's p-value would be too large.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "fenotipo", "tipo": "factor with k levels", "papel": "categories" },
        { "nombre": "semillas", "tipo": "count", "papel": "counts (optional): how many observations each row stands for" }
      ],
      "minimo": "No category should expect fewer than 5 observations. With unequal ratios the rarest category rules: for 9:3:3:1 you need at least 80 observations for the 1/16 category to expect 5.",
      "balance": "Rows with no category, or with a missing count, are left out, and the app does not report how many: compare the total in the table with the number of observations you expected. If an expected category did not appear in your data, add it with a count of 0 in an already counted table so that it enters the test.",
      "notaFormato": "Two layouts: an already counted table with one row per category and a column with its count (as in this example, Mendel's dihybrid F2), which you choose in “Counts”, or one row per observation with its category, leaving “Counts” empty. The expected ratio is typed in the order of the levels shown in the form.",
      "errores": [
        "Typing the expected ratio in an order different from that of the factor levels (9:3:3:1 versus 1:3:3:9).",
        "Using observed percentages or proportions instead of counts: the test needs absolute frequencies.",
        "Keeping categories with expected values below 5 without merging them.",
        "Testing, with the same data, a ratio that was estimated from them without adjusting the degrees of freedom."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: whether the frequencies are compatible with the expected ratio, with χ², df and p.",
        "Check the warning about expected values below 5 before trusting the p-value.",
        "If the hypothesis is rejected, look in the table for the category with the largest standardized residual (more than 2 in absolute value) and its contribution to χ².",
        "Compare observed and expected values to describe the direction of the departure: which categories have more, or fewer, than expected."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The four F2 phenotypes (n = 556 seeds) were compatible with a 9:3:3:1 segregation (χ² = 0.47, df = 3, p = 0.93), consistent with two independent genes with complete dominance.”",
      "guias": ["chi2", "chi2-celda", "gl", "p", "residuo-std"]
    },
    "limitaciones": [
      "It compares a single distribution with a theoretical one; to compare the distribution among groups (treatments, locations) use the contingency table.",
      "It has no exact multinomial test: with small expected values, merge categories; with two categories, use the proportion with its exact interval.",
      "It does not adjust the degrees of freedom for parameters estimated from the same data (for example, allele frequencies).",
      "With very large samples any tiny departure becomes significant: also look at the size of the residuals."
    ],
    "referencias": [
      "Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 50(302), 157–175.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  }
});
