SP_FICHA({
  "id": "manova",
  "familia": "multivariado",
  "respuesta": "multivariada",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["discriminante", "dbca", "dca", "medidas-repetidas", "comparaciones-medias", "supuestos"],
  "ejemplo": { "conjunto": "chile-frutos", "entradas": { "respuestas": ["largo_cm", "ancho_cm", "peso_g", "pared_mm"], "tratamientos": ["variedad"], "bloque": "bloque" }, "opciones": { "prueba": "pillai" } },
  "formato": {
    "largo": [["variedad", "bloque", "fruto", "largo_cm", "ancho_cm", "peso_g", "pared_mm"], ["Ancho", "1", "1", "10.9", "5.72", "47.6", "2.97"], ["Ancho", "1", "2", "12.05", "5.52", "57", "3.64"], ["Ancho", "1", "3", "12.76", "6.65", "61.7", "3.73"], ["Ancho", "1", "4", "11.83", "6.33", "60.6", "3.56"], ["Ancho", "1", "5", "11.62", "6.48", "58.4", "3.56"], ["Ancho", "2", "1", "10.72", "6.12", "58.4", "3.54"], ["Ancho", "2", "2", "11.17", "6.03", "56.1", "3.88"], ["Ancho", "2", "3", "12.02", "6.1", "62.3", "3.75"]],
    "ancho": null
  },
  "es": {
    "alias": ["MANOVA", "Análisis de varianza multivariado", "Traza de Pillai", "Lambda de Wilks"],
    "paraQue": "Prueba si los tratamientos cambian a la vez varias variables respuesta medidas en las mismas unidades.",
    "preguntas": [
      "¿Difieren cuatro variedades de chile en el conjunto de largo, ancho, peso y grosor de la pared del fruto?",
      "¿Cambian la dosis de nitrógeno y el híbrido de maíz, juntos, el rendimiento, la altura de planta y los días a floración?",
      "¿Modifican tres sustratos el perfil de calidad del jitomate (firmeza, sólidos solubles y acidez)?"
    ],
    "teoria": [
      "Muchos experimentos miden varias variables en cada unidad: largo, ancho, peso y grosor del fruto, o rendimiento, altura y días a floración. Analizar cada una con su ANOVA multiplica las pruebas y no aprovecha que las variables están correlacionadas. El análisis de varianza multivariado (MANOVA) prueba de una sola vez si los tratamientos cambian el vector de medias de todas las respuestas.",
      "En lugar de sumas de cuadrados, la MANOVA usa matrices de sumas de cuadrados y productos cruzados: H para cada término del modelo y E para el error. Si un tratamiento no tiene efecto, H es pequeña frente a E; los valores propios de E⁻¹H resumen cuánto separa el término a los grupos en las direcciones de mayor diferencia. De ellos salen cuatro estadísticos que SigmaPro da juntos, cada uno convertido a una F aproximada como en summary.manova de R: la traza de Pillai (la de omisión y la más robusta cuando fallan los supuestos), la lambda de Wilks (la más citada), la traza de Hotelling-Lawley y la raíz mayor de Roy (una cota superior de F, por lo que su p es optimista).",
      "El modelo admite de uno a tres factores de tratamiento cruzados, con o sin bloques, con sumas de cuadrados secuenciales (tipo I): el bloque entra primero y luego los factores y sus interacciones. La app da además el ANOVA de cada respuesta por separado, las medias por factor y un perfil de medias estandarizadas. Su semáforo revisa los grados de libertad del error frente al número de respuestas y la igualdad de las matrices de covarianza con la prueba M de Box."
    ],
    "modelo": {
      "tex": "\\mathbf{y}_{ij} = \\mu + \\tau_i + \\beta_j + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}_p(0, \\Sigma), \\quad V = \\sum_{s} \\frac{\\lambda_s}{1 + \\lambda_s}, \\quad \\Lambda = \\frac{|E|}{|H + E|}",
      "terminos": [
        ["\\mathbf{y}_{ij}", "el vector de las p respuestas del tratamiento i en el bloque j"],
        ["\\mu, \\tau_i, \\beta_j", "los vectores de la media general, del efecto del tratamiento i y del efecto del bloque j (el bloque es opcional; con varios factores, efectos principales e interacciones)"],
        ["\\varepsilon_{ij}", "el vector de errores, normal multivariado con la misma matriz de covarianza Σ en todos los grupos"],
        ["H, E", "las matrices de sumas de cuadrados y productos cruzados del término y del error"],
        ["\\lambda_s", "los valores propios de E⁻¹H"],
        ["V, \\Lambda", "la traza de Pillai y la lambda de Wilks (también se dan Hotelling-Lawley, la suma de los λ, y Roy, el mayor λ)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen el mismo vector de medias en las p respuestas. Hay una prueba por término (bloque, efectos principales e interacciones); la conclusión usa la «Prueba principal» elegida y el cuadro muestra las cuatro." }
    ],
    "supuestos": [
      { "nombre": "Normalidad multivariada de los residuos", "como": "El semáforo no la prueba; revisa cada respuesta en «Revisar los supuestos del modelo», con los mismos tratamientos y bloques.", "verificar": "supuestos", "siFalla": "Con desvíos moderados y grupos de tamaño parecido, Pillai es robusta. Transforma las respuestas muy sesgadas (logaritmo o Box-Cox en Datos, «Transformar…»).", "alternativa": null },
      { "nombre": "Matrices de covarianza iguales", "como": "El semáforo y un cuadro dan la prueba M de Box entre las combinaciones de tratamientos: verde con p ≥ 0.05; ámbar entre 0.001 y 0.05, porque la prueba es muy sensible (también a la falta de normalidad); rojo por debajo de 0.001.", "verificar": null, "siFalla": "Usa la traza de Pillai, la más robusta, y procura grupos del mismo tamaño.", "alternativa": null },
      { "nombre": "Suficientes grados de libertad del error", "como": "El semáforo se pone en verde si el error tiene al menos tres veces más grados de libertad que respuestas.", "verificar": null, "siFalla": "Usa menos respuestas (las más importantes o menos redundantes) o más repeticiones.", "alternativa": null },
      { "nombre": "Unidades independientes", "como": "Lo da el diseño: cada fila es una unidad experimental distinta. No se prueba con los datos.", "verificar": null, "siFalla": "Varios frutos o plantas de la misma parcela no son repeticiones: promédialos por parcela. Si mediste la misma variable en varias fechas, usa medidas repetidas.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, ancho_cm, peso_g, pared_mm", "tipo": "numérica continua (de 2 a 10 respuestas)", "papel": "respuestas" },
        { "nombre": "variedad", "tipo": "factor con t niveles (1 a 3 factores cruzados)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (opcional)" },
        { "nombre": "fruto", "tipo": "identificador", "papel": "no entra al análisis" }
      ],
      "minimo": "Más filas completas que respuestas más uno, y un error con bastantes más grados de libertad que respuestas (el semáforo pide al menos el triple). Para la M de Box, cada combinación de tratamientos necesita más unidades que respuestas.",
      "balance": "Usa solo las filas completas en todas las respuestas y factores. Con desbalance, las sumas de cuadrados secuenciales dependen del orden de los términos: entra primero el bloque y luego los factores en el orden de sus columnas en la tabla (no en el orden en que los marcas).",
      "notaFormato": "Formato largo: una fila por unidad, una columna por respuesta y una por factor. En el ejemplo hay cinco frutos por parcela y la MANOVA toma cada fruto como una repetición; para probar las variedades con el error correcto, promedia los frutos de cada parcela antes de importar los datos.",
      "errores": [
        "Contar como repeticiones los frutos o plantas de una misma parcela (pseudorreplicación): el error queda con demasiados grados de libertad y las pruebas, demasiado optimistas.",
        "Incluir respuestas que son suma o cociente de otras (peso total y peso de sus partes): la matriz del error no es invertible y el análisis se detiene.",
        "Meter muchas respuestas con pocas repeticiones.",
        "Dejar vacía una respuesta en algunas unidades: toda la fila sale del análisis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: grados de libertad del error y M de Box.",
        "En «MANOVA: las cuatro pruebas», lee primero la interacción (si hay varios factores) y luego los efectos principales con la prueba elegida (Pillai por omisión).",
        "Si un término es significativo, mira el ANOVA de cada respuesta para ver en cuáles difieren los tratamientos.",
        "Lee las medias por factor y el perfil de medias estandarizadas: perfiles paralelos indican un efecto parecido en todas las respuestas.",
        "Para ver qué combinación de respuestas separa mejor los grupos, sigue con el análisis discriminante; para comparar las medias de cada respuesta, con «Comparaciones de medias»."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Las variedades de chile difirieron en el conjunto de medidas del fruto (traza de Pillai = 2.4, F(12, 15) = 6.1, p < 0.001); por separado, el largo, el ancho, el peso y el grosor de la pared difirieron entre variedades (p < 0.01 en los cuatro ANOVA)».",
      "guias": ["pillai", "wilks", "hotelling", "roy", "F", "p"]
    },
    "limitaciones": [
      "Los bloques son fijos y hay un solo término de error: no sirve para parcelas divididas ni para bloques aleatorios; en esos casos analiza cada respuesta con el modelo mixto que corresponda.",
      "Una prueba significativa no dice qué respuestas ni qué tratamientos difieren: sigue con el ANOVA de cada respuesta, las comparaciones de medias o el análisis discriminante.",
      "Con la misma variable medida en varias fechas, el análisis de medidas repetidas modela la correlación en el tiempo.",
      "SigmaPro no hace componentes principales ni conglomerados; el botón de los resultados prepara el archivo CSV para hacerlos en otra aplicación."
    ],
    "referencias": [
      "Wilks, S. S. (1932). Certain generalizations in the analysis of variance. Biometrika, 24(3/4), 471–494.",
      "Pillai, K. C. S. (1955). Some new test criteria in multivariate analysis. The Annals of Mathematical Statistics, 26(1), 117–121.",
      "Box, G. E. P. (1949). A general distribution theory for a class of likelihood criteria. Biometrika, 36(3/4), 317–346.",
      "Johnson, R. A., & Wichern, D. W. (2007). Applied multivariate statistical analysis (6th ed.). Pearson Prentice Hall.",
      "Rencher, A. C., & Christensen, W. F. (2012). Methods of multivariate analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["MANOVA", "Multivariate analysis of variance", "Pillai’s trace", "Wilks’ lambda"],
    "paraQue": "Tests whether treatments change several response variables measured on the same units at once.",
    "preguntas": [
      "Do four chili pepper varieties differ in the set of fruit length, width, weight and wall thickness?",
      "Do nitrogen rate and maize hybrid jointly change yield, plant height and days to flowering?",
      "Do three substrates change the quality profile of tomato (firmness, soluble solids and acidity)?"
    ],
    "teoria": [
      "Many experiments measure several variables on each unit: fruit length, width, weight and thickness, or yield, height and days to flowering. Analyzing each one with its own ANOVA multiplies the tests and ignores that the variables are correlated. Multivariate analysis of variance (MANOVA) tests at once whether the treatments change the mean vector of all the responses.",
      "Instead of sums of squares, MANOVA uses matrices of sums of squares and cross products: H for each term of the model and E for the error. If a treatment has no effect, H is small compared with E; the eigenvalues of E⁻¹H summarize how much the term separates the groups along the directions of greatest difference. Four statistics come from them, and SigmaPro gives them together, each converted to an approximate F as in R’s summary.manova: Pillai’s trace (the default and the most robust when assumptions fail), Wilks’ lambda (the most cited), the Hotelling-Lawley trace and Roy’s largest root (an upper bound for F, so its p-value is optimistic).",
      "The model accepts one to three crossed treatment factors, with or without blocks, with sequential (type I) sums of squares: the block enters first and then the factors and their interactions. The app also gives the ANOVA of each response separately, the means by factor and a profile of standardized means. Its assumptions checklist reviews the error degrees of freedom against the number of responses and the equality of the covariance matrices with Box’s M test."
    ],
    "modelo": {
      "tex": "\\mathbf{y}_{ij} = \\mu + \\tau_i + \\beta_j + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}_p(0, \\Sigma), \\quad V = \\sum_{s} \\frac{\\lambda_s}{1 + \\lambda_s}, \\quad \\Lambda = \\frac{|E|}{|H + E|}",
      "terminos": [
        ["\\mathbf{y}_{ij}", "the vector of the p responses of treatment i in block j"],
        ["\\mu, \\tau_i, \\beta_j", "the vectors of the overall mean, the effect of treatment i and the effect of block j (the block is optional; with several factors, main effects and interactions)"],
        ["\\varepsilon_{ij}", "the error vector, multivariate normal with the same covariance matrix Σ in every group"],
        ["H, E", "the matrices of sums of squares and cross products of the term and of the error"],
        ["\\lambda_s", "the eigenvalues of E⁻¹H"],
        ["V, \\Lambda", "Pillai’s trace and Wilks’ lambda (Hotelling-Lawley, the sum of the λ, and Roy, the largest λ, are also given)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean vector in the p responses. There is one test per term (block, main effects and interactions); the conclusion uses the chosen “Main test” and the table shows all four." }
    ],
    "supuestos": [
      { "nombre": "Multivariate normality of the residuals", "como": "The assumptions checklist does not test it; check each response in “Check the model assumptions”, with the same treatments and blocks.", "verificar": "supuestos", "siFalla": "With moderate departures and groups of similar size, Pillai is robust. Transform strongly skewed responses (logarithm or Box-Cox in Data, “Transform…”).", "alternativa": null },
      { "nombre": "Equal covariance matrices", "como": "The assumptions checklist and a table give Box’s M test among the treatment combinations: green with p ≥ 0.05; amber between 0.001 and 0.05, because the test is very sensitive (also to non-normality); red below 0.001.", "verificar": null, "siFalla": "Use Pillai’s trace, the most robust, and aim for groups of equal size.", "alternativa": null },
      { "nombre": "Enough error degrees of freedom", "como": "The assumptions checklist turns green if the error has at least three times as many degrees of freedom as responses.", "verificar": null, "siFalla": "Use fewer responses (the most important or least redundant) or more replicates.", "alternativa": null },
      { "nombre": "Independent units", "como": "It comes from the design: each row is a different experimental unit. It is not tested with the data.", "verificar": null, "siFalla": "Several fruits or plants from the same plot are not replicates: average them per plot. If you measured the same variable on several dates, use repeated measures.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, ancho_cm, peso_g, pared_mm", "tipo": "continuous numeric (2 to 10 responses)", "papel": "responses" },
        { "nombre": "variedad", "tipo": "factor with t levels (1 to 3 crossed factors)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (optional)" },
        { "nombre": "fruto", "tipo": "identifier", "papel": "not used in the analysis" }
      ],
      "minimo": "More complete rows than responses plus one, and an error with many more degrees of freedom than responses (the assumptions checklist asks for at least three times as many). For Box’s M, each treatment combination needs more units than responses.",
      "balance": "Only rows complete in every response and factor are used. With imbalance, the sequential sums of squares depend on the order of the terms: the block enters first and then the factors in the order of their columns in the table (not the order in which you tick them).",
      "notaFormato": "Long format: one row per unit, one column per response and one per factor. In the example there are five fruits per plot and MANOVA takes each fruit as a replicate; to test the varieties with the right error, average the fruits of each plot before importing the data.",
      "errores": [
        "Counting fruits or plants from the same plot as replicates (pseudoreplication): the error gets too many degrees of freedom and the tests become too optimistic.",
        "Including responses that are the sum or ratio of others (total weight and the weight of its parts): the error matrix cannot be inverted and the analysis stops.",
        "Entering many responses with few replicates.",
        "Leaving a response empty in some units: the whole row drops out of the analysis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: error degrees of freedom and Box’s M.",
        "In “MANOVA: the four tests”, read the interaction first (with several factors) and then the main effects with the chosen test (Pillai by default).",
        "If a term is significant, look at the ANOVA of each response to see in which ones the treatments differ.",
        "Read the means by factor and the profile of standardized means: parallel profiles indicate a similar effect on every response.",
        "To see which combination of responses best separates the groups, continue with discriminant analysis; to compare the means of each response, with “Mean comparisons”."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The chili pepper varieties differed in the set of fruit measurements (Pillai’s trace = 2.4, F(12, 15) = 6.1, p < 0.001); separately, length, width, weight and wall thickness differed among varieties (p < 0.01 in all four ANOVAs).”",
      "guias": ["pillai", "wilks", "hotelling", "roy", "F", "p"]
    },
    "limitaciones": [
      "Blocks are fixed and there is a single error term: it does not handle split plots or random blocks; in those cases analyze each response with the appropriate mixed model.",
      "A significant test does not say which responses or which treatments differ: continue with the ANOVA of each response, mean comparisons or discriminant analysis.",
      "With the same variable measured on several dates, repeated measures analysis models the correlation over time.",
      "SigmaPro does not do principal components or clustering; the button in the results prepares the CSV file to do them in another application."
    ],
    "referencias": [
      "Wilks, S. S. (1932). Certain generalizations in the analysis of variance. Biometrika, 24(3/4), 471–494.",
      "Pillai, K. C. S. (1955). Some new test criteria in multivariate analysis. The Annals of Mathematical Statistics, 26(1), 117–121.",
      "Box, G. E. P. (1949). A general distribution theory for a class of likelihood criteria. Biometrika, 36(3/4), 317–346.",
      "Johnson, R. A., & Wichern, D. W. (2007). Applied multivariate statistical analysis (6th ed.). Pearson Prentice Hall.",
      "Rencher, A. C., & Christensen, W. F. (2012). Methods of multivariate analysis (3rd ed.). Wiley."
    ]
  }
});
