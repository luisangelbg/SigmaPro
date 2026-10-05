SP_FICHA({
  "id": "heredabilidad",
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": ["dca", "dbca", "latice", "multiambiente"],
  "relacionados": ["componentes-varianza", "repetibilidad", "mixto-latice", "mixto-localidades", "ensayos-multiambiente", "estabilidad"],
  "ejemplo": { "conjunto": "alfa-latice", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "repeticion": "repeticion", "bloque": "bloque" }, "opciones": { "seleccion": 0.1, "direccion": "mayor" } },
  "formato": {
    "largo": [["repeticion", "bloque", "genotipo", "rendimiento"], ["R1", "B1", "G11", "4.1172"], ["R1", "B1", "G04", "4.4461"], ["R1", "B1", "G05", "5.8757"], ["R1", "B1", "G22", "4.5784"], ["R1", "B2", "G21", "4.654"], ["R1", "B2", "G10", "4.1736"], ["R1", "B2", "G20", "4.0141"]],
    "ancho": null
  },
  "es": {
    "alias": ["Heredabilidad en sentido amplio", "H²", "BLUP de genotipos", "Ganancia por selección"],
    "paraQue": "Estima qué parte de la variación entre genotipos es genética, predice el valor de cada genotipo (BLUP) y calcula la ganancia esperada al seleccionar a los mejores.",
    "preguntas": [
      "¿Qué tan heredable es el rendimiento de 24 líneas evaluadas en un alfa-látice, y cuáles conviene seleccionar?",
      "¿Cuánto se ganaría al seleccionar el 10 % de los genotipos de avena más rendidores evaluados en 14 ambientes?",
      "¿Se puede seleccionar por precocidad (menos días a floración) con una sola localidad, o la interacción con el ambiente lo impide?"
    ],
    "teoria": [
      "La heredabilidad en sentido amplio (H²) es la proporción de la variación fenotípica que se debe a diferencias genéticas entre genotipos. Con los genotipos como efecto aleatorio, REML estima la varianza genética (σ²g), la del error y, si hay varios ambientes, la de la interacción genotipo × ambiente. Una H² alta indica que las diferencias entre genotipos se repetirían en otro ensayo y que la selección será eficaz.",
      "SigmaPro admite cuatro diseños: completamente al azar, bloques completos (repeticiones fijas), bloques incompletos aleatorios dentro de repeticiones (alfa-látice) y varios ambientes (ambientes y repeticiones fijos, interacción genotipo × ambiente aleatoria). Calcula la H² en medias de genotipos, σ²g / (σ²g + σ²ga/a + σ²e/n), con medias armónicas de parcelas y de ambientes por genotipo, y su error estándar por el método delta; la H² por parcela; y las de Cullis y de Piepho y Möhring, basadas en la varianza media de la diferencia entre dos genotipos, que son más fieles con datos desbalanceados o bloques incompletos.",
      "También predice el valor genotípico de cada genotipo (media general + BLUP) con su error y su confiabilidad, estima las medias ajustadas con los genotipos fijos (BLUE), los coeficientes de variación genético y del error, y la ganancia esperada al seleccionar una proporción de genotipos por el mayor o el menor valor: con la media de los BLUP seleccionados, con la ecuación del criador (i · H² · σF) y con el diferencial de selección. Todo corre en tu navegador con un REML validado contra lme4."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + g_i + \\beta_j + \\varepsilon_{ij}, \\quad g_i \\sim \\mathcal{N}(0, \\sigma^2_g), \\quad H^2 = \\frac{\\sigma^2_g}{\\sigma^2_g + \\sigma^2_e / n}",
      "terminos": [
        ["y_{ij}", "la respuesta del genotipo i en la repetición j"],
        ["g_i", "el efecto aleatorio del genotipo i, con varianza genética \\sigma^2_g"],
        ["\\beta_j", "el efecto fijo de la repetición j (con alfa-látice, más el bloque incompleto aleatorio; con varios ambientes, el ambiente y la repetición fijos y la interacción genotipo × ambiente aleatoria)"],
        ["\\varepsilon_{ij}", "el error de parcela, con varianza \\sigma^2_e"],
        ["n", "las parcelas por genotipo (media armónica); con a ambientes se suma \\sigma^2_{ga} / a en el denominador"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_g = 0", "h1": "\\sigma^2_g > 0", "texto": "No hay variación genética entre los genotipos. Razón de verosimilitudes restringidas contra el modelo sin genotipos, con p de la mezcla ½χ²₀ + ½χ²₁." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis aplica Shapiro-Wilk a los residuos condicionales.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar) y vuelve a estimar; recuerda que la H² cambia con la escala.", "alternativa": null },
      { "nombre": "Normalidad de los efectos genéticos", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de los genotipos (con 5 o más y σ²g mayor que cero).", "verificar": null, "siFalla": "Un grupo de genotipos muy distinto (por ejemplo, testigos de otro origen) desvía la distribución: analiza la población por separado.", "alternativa": null },
      { "nombre": "Sin observaciones atípicas", "como": "El semáforo cuenta los residuos que pasan de 3.5 desviaciones estándar del error.", "verificar": null, "siFalla": "Revisa esas parcelas (errores de captura, daños) antes de interpretar.", "alternativa": null },
      { "nombre": "Ajuste REML estable y σ²g mayor que cero", "como": "El semáforo indica si el cálculo convergió y si algún componente quedó en cero.", "verificar": null, "siFalla": "Con σ²g en cero no hay diferencias genéticas detectables y la selección no daría ganancia; aumenta repeticiones o ambientes.", "alternativa": null },
      { "nombre": "Genotipos como muestra de una población", "como": "Es una condición del diseño: no se prueba con los datos.", "verificar": null, "siFalla": "Si solo te interesa comparar esos genotipos, trátalos como fijos y compara sus medias.", "alternativa": "mixto-latice" },
      { "nombre": "Misma varianza del error en todos los ambientes", "como": "No se prueba aquí; el análisis conjunto de varios ambientes da la prueba de Bartlett con el error de cada ambiente.", "verificar": "ensayos-multiambiente", "siFalla": "Si los ambientes difieren mucho en precisión, interpreta la H² con cautela; el análisis en dos etapas da a cada ambiente su varianza.", "alternativa": "dos-etapas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (3 o más)", "papel": "genotipos (aleatorios)" },
        { "nombre": "repeticion", "tipo": "factor con r niveles (opcional)", "papel": "repetición o bloque completo (fijo)" },
        { "nombre": "bloque", "tipo": "factor (opcional; se identifica dentro de la repetición)", "papel": "bloque incompleto (aleatorio)" },
        { "nombre": "ambiente", "tipo": "factor (opcional)", "papel": "ambiente o localidad (fijo)" }
      ],
      "minimo": "La app exige al menos 3 genotipos, pero para estimar σ²g con precisión conviene tener 20 o más, con 2 o más repeticiones. Con varios ambientes, más de una parcela por genotipo y ambiente.",
      "balance": "Tolera parcelas perdidas y genotipos ausentes en algún ambiente: usa medias armónicas del número de parcelas y de ambientes por genotipo. Con desbalance o bloques incompletos, prefiere las H² de Cullis y de Piepho y Möhring.",
      "notaFormato": "Formato largo: una fila por parcela, con el genotipo, la repetición, el bloque incompleto y el ambiente que correspondan, y la respuesta.",
      "errores": [
        "Usar la media de cada genotipo en lugar de las parcelas: sin repeticiones no se puede separar la varianza genética del error.",
        "En varios ambientes, capturar una sola parcela (o la media) por genotipo y ambiente: la interacción genotipo × ambiente se confunde con el error y la app no corre. Indica también la repetición dentro de cada ambiente; si no, su variación se suma al error.",
        "Mezclar testigos de otro origen con las líneas de la población que se selecciona: desvían σ²g y la H².",
        "Interpretar la H² de un solo ambiente como si valiera para la región: incluye la interacción genotipo × ambiente y tiende a sobrestimarse.",
        "Elegir la dirección equivocada: para días a floración, altura o daño, se seleccionan los valores menores."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: si σ²g quedó en cero, no hay nada que seleccionar con estos datos.",
        "En el cuadro de componentes, lee σ²g, su porcentaje y su prueba de razón de verosimilitudes.",
        "En el cuadro de heredabilidad, lee la H² en medias con su EE y compárala con las de Cullis y de Piepho y Möhring; si difieren mucho, prefiere estas dos.",
        "En los parámetros genéticos, una razón CVg/CVe mayor que 1 favorece la selección.",
        "Lee la ganancia esperada y los genotipos seleccionados (el número se redondea: con 24 genotipos y 10 % se seleccionan 2); el cuadro de genotipos ya viene ordenado por BLUP: fíjate en la confiabilidad de cada uno."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La varianza genética fue significativa (σ²g = 0.21; χ² = 18.4, p < 0.001). La heredabilidad en medias fue alta (H² = 0.72, EE = 0.08; de Cullis, 0.70; de Piepho y Möhring, 0.71) y la razón CVg/CVe fue de 1.2. Al seleccionar el 10 % de los genotipos por su BLUP, la ganancia esperada fue de 0.48 t/ha (10 % de la media general)».",
      "guias": ["heredabilidad", "componente", "blup", "confiabilidad", "cv-genetico", "ganancia", "lrt"]
    },
    "limitaciones": [
      "Es heredabilidad en sentido amplio (incluye dominancia y epistasis): no estima la heredabilidad en sentido estricto ni usa parentesco.",
      "Un carácter a la vez: no estima correlaciones genéticas ni índices de selección.",
      "Supone una sola varianza del error (y una sola de bloques incompletos) para todos los ambientes; para estructuras más complejas escribe la fórmula del modelo mixto, aunque ahí no se calcula la H².",
      "No describe la interacción genotipo × ambiente: para eso usa estabilidad, AMMI o biplot GGE."
    ],
    "referencias": [
      "Holland, J. B., Nyquist, W. E., & Cervantes-Martínez, C. T. (2003). Estimating and interpreting heritability for plant breeding: An update. Plant Breeding Reviews, 22, 9–112.",
      "Cullis, B. R., Smith, A. B., & Coombes, N. E. (2006). On the design of early generation variety trials with correlated data. Journal of Agricultural, Biological, and Environmental Statistics, 11(4), 381–393.",
      "Piepho, H.-P., & Möhring, J. (2007). Computing heritability and selection response from unbalanced plant breeding trials. Genetics, 177(3), 1881–1888.",
      "Schmidt, P., Hartung, J., Rath, J., & Piepho, H.-P. (2019). Estimating broad-sense heritability with unbalanced data from agricultural cultivar trials. Crop Science, 59(2), 525–536.",
      "Falconer, D. S., & Mackay, T. F. C. (1996). Introduction to quantitative genetics (4th ed.). Longman."
    ]
  },
  "en": {
    "alias": ["Broad-sense heritability", "H²", "Genotype BLUPs", "Selection gain"],
    "paraQue": "Estimates how much of the variation among genotypes is genetic, predicts the value of each genotype (BLUP) and computes the expected gain from selecting the best ones.",
    "preguntas": [
      "How heritable is the yield of 24 lines evaluated in an alpha lattice, and which ones should be selected?",
      "How much would be gained by selecting the 10% highest-yielding oat genotypes evaluated in 14 environments?",
      "Can we select for earliness (fewer days to flowering) with a single location, or does the interaction with the environment prevent it?"
    ],
    "teoria": [
      "Broad-sense heritability (H²) is the proportion of the phenotypic variation that is due to genetic differences among genotypes. With genotypes as a random effect, REML estimates the genetic variance (σ²g), the error variance and, with several environments, the genotype × environment interaction variance. A high H² means that the differences among genotypes would repeat in another trial and that selection will be effective.",
      "SigmaPro handles four designs: completely randomized, complete blocks (fixed replicates), random incomplete blocks within replicates (alpha lattice) and several environments (fixed environments and replicates, random genotype × environment interaction). It computes H² on a genotype-mean basis, σ²g / (σ²g + σ²ga/a + σ²e/n), with harmonic means of plots and environments per genotype, and its standard error by the delta method; the plot-basis H²; and the Cullis and the Piepho and Möhring versions, based on the mean variance of the difference between two genotypes, which are more faithful with unbalanced data or incomplete blocks.",
      "It also predicts the genotypic value of each genotype (overall mean + BLUP) with its error and reliability, estimates the adjusted means with genotypes fixed (BLUEs), the genetic and error coefficients of variation, and the expected gain from selecting a proportion of genotypes with the highest or lowest value: with the mean of the selected BLUPs, with the breeder’s equation (i · H² · σF) and with the selection differential. Everything runs in your browser with a REML validated against lme4."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + g_i + \\beta_j + \\varepsilon_{ij}, \\quad g_i \\sim \\mathcal{N}(0, \\sigma^2_g), \\quad H^2 = \\frac{\\sigma^2_g}{\\sigma^2_g + \\sigma^2_e / n}",
      "terminos": [
        ["y_{ij}", "the response of genotype i in replicate j"],
        ["g_i", "the random effect of genotype i, with genetic variance \\sigma^2_g"],
        ["\\beta_j", "the fixed effect of replicate j (with an alpha lattice, plus the random incomplete block; with several environments, fixed environment and replicate and a random genotype × environment interaction)"],
        ["\\varepsilon_{ij}", "the plot error, with variance \\sigma^2_e"],
        ["n", "the plots per genotype (harmonic mean); with a environments, \\sigma^2_{ga} / a is added to the denominator"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_g = 0", "h1": "\\sigma^2_g > 0", "texto": "There is no genetic variation among the genotypes. Restricted likelihood ratio against the model without genotypes, with p from the mixture ½χ²₀ + ½χ²₁." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist applies Shapiro-Wilk to the conditional residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform) and estimate again; remember that H² changes with the scale.", "alternativa": null },
      { "nombre": "Normality of genetic effects", "como": "The assumptions checklist applies Shapiro-Wilk to the genotype BLUPs (with 5 or more and σ²g above zero).", "verificar": null, "siFalla": "A very different group of genotypes (for example, checks of another origin) skews the distribution: analyze the population separately.", "alternativa": null },
      { "nombre": "No outlying observations", "como": "The assumptions checklist counts the residuals beyond 3.5 error standard deviations.", "verificar": null, "siFalla": "Check those plots (data-entry errors, damage) before interpreting.", "alternativa": null },
      { "nombre": "Stable REML fit and σ²g above zero", "como": "The assumptions checklist says whether the computation converged and whether any component ended up at zero.", "verificar": null, "siFalla": "With σ²g at zero there are no detectable genetic differences and selection would give no gain; increase replicates or environments.", "alternativa": null },
      { "nombre": "Genotypes as a sample of a population", "como": "It is a condition of the design: it is not tested with the data.", "verificar": null, "siFalla": "If you only want to compare those genotypes, treat them as fixed and compare their means.", "alternativa": "mixto-latice" },
      { "nombre": "Same error variance in every environment", "como": "It is not tested here; the combined analysis of several environments gives Bartlett’s test with the error of each environment.", "verificar": "ensayos-multiambiente", "siFalla": "If environments differ a lot in precision, interpret H² with caution; the two-stage analysis gives each environment its own variance.", "alternativa": "dos-etapas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (3 or more)", "papel": "genotypes (random)" },
        { "nombre": "repeticion", "tipo": "factor with r levels (optional)", "papel": "replicate or complete block (fixed)" },
        { "nombre": "bloque", "tipo": "factor (optional; identified within the replicate)", "papel": "incomplete block (random)" },
        { "nombre": "ambiente", "tipo": "factor (optional)", "papel": "environment or location (fixed)" }
      ],
      "minimo": "The app requires at least 3 genotypes, but to estimate σ²g precisely you should have 20 or more, with 2 or more replicates. With several environments, more than one plot per genotype and environment.",
      "balance": "It tolerates lost plots and genotypes missing in some environment: it uses harmonic means of the number of plots and environments per genotype. With imbalance or incomplete blocks, prefer the Cullis and the Piepho and Möhring H².",
      "notaFormato": "Long format: one row per plot, with the genotype, the replicate, the incomplete block and the environment where applicable, and the response.",
      "errores": [
        "Using the mean of each genotype instead of the plots: without replicates the genetic variance cannot be separated from the error.",
        "With several environments, entering a single plot (or the mean) per genotype and environment: the genotype × environment interaction is confounded with the error and the app does not run. Also give the replicate within each environment; otherwise its variation is added to the error.",
        "Mixing checks of another origin with the lines of the population under selection: they bias σ²g and H².",
        "Reading the H² of a single environment as if it held for the region: it includes the genotype × environment interaction and tends to be overestimated.",
        "Choosing the wrong direction: for days to flowering, height or damage, the lowest values are selected."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: if σ²g ended up at zero, there is nothing to select with these data.",
        "In the components table, read σ²g, its percentage and its likelihood ratio test.",
        "In the heritability table, read the mean-basis H² with its SE and compare it with the Cullis and the Piepho and Möhring values; if they differ a lot, prefer these two.",
        "In the genetic parameters, a CVg/CVe ratio above 1 favors selection.",
        "Read the expected gain and the selected genotypes (the number is rounded: with 24 genotypes and 10%, 2 are selected); the genotype table is already sorted by BLUP: look at the reliability of each one."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The genetic variance was significant (σ²g = 0.21; χ² = 18.4, p < 0.001). Mean-basis heritability was high (H² = 0.72, SE = 0.08; Cullis, 0.70; Piepho and Möhring, 0.71) and the CVg/CVe ratio was 1.2. Selecting 10% of the genotypes by their BLUP, the expected gain was 0.48 t/ha (10% of the overall mean).”",
      "guias": ["heredabilidad", "componente", "blup", "confiabilidad", "cv-genetico", "ganancia", "lrt"]
    },
    "limitaciones": [
      "It is broad-sense heritability (it includes dominance and epistasis): it does not estimate narrow-sense heritability or use pedigree.",
      "One trait at a time: it does not estimate genetic correlations or selection indices.",
      "It assumes a single error variance (and a single incomplete-block variance) for all environments; for more complex structures write the mixed-model formula, although H² is not computed there.",
      "It does not describe the genotype × environment interaction: for that use stability, AMMI or GGE biplot."
    ],
    "referencias": [
      "Holland, J. B., Nyquist, W. E., & Cervantes-Martínez, C. T. (2003). Estimating and interpreting heritability for plant breeding: An update. Plant Breeding Reviews, 22, 9–112.",
      "Cullis, B. R., Smith, A. B., & Coombes, N. E. (2006). On the design of early generation variety trials with correlated data. Journal of Agricultural, Biological, and Environmental Statistics, 11(4), 381–393.",
      "Piepho, H.-P., & Möhring, J. (2007). Computing heritability and selection response from unbalanced plant breeding trials. Genetics, 177(3), 1881–1888.",
      "Schmidt, P., Hartung, J., Rath, J., & Piepho, H.-P. (2019). Estimating broad-sense heritability with unbalanced data from agricultural cultivar trials. Crop Science, 59(2), 525–536.",
      "Falconer, D. S., & Mackay, T. F. C. (1996). Introduction to quantitative genetics (4th ed.). Longman."
    ]
  }
});
