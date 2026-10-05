SP_FICHA({
  "id": "medias-ajustadas",
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca", "latino", "bib", "latice"],
  "relacionados": ["comparaciones-medias", "latice", "bib", "dbca", "ancova", "mixto-latice"],
  "ejemplo": { "conjunto": "alfa-latice", "entradas": { "diseno": "latice", "respuesta": "rendimiento", "tratamientos": ["genotipo"], "bloque": "bloque", "repeticion": "repeticion", "comparar": ["genotipo"] }, "opciones": { "nivel": 0.95 } },
  "formato": {
    "largo": [["repeticion", "bloque", "genotipo", "rendimiento"], ["R1", "B1", "G11", "4.1172"], ["R1", "B1", "G04", "4.4461"], ["R1", "B1", "G05", "5.8757"], ["R1", "B1", "G22", "4.5784"], ["R1", "B2", "G21", "4.654"], ["R1", "B2", "G10", "4.1736"], ["R1", "B2", "G20", "4.0141"]],
    "ancho": null
  },
  "es": {
    "alias": ["Medias marginales estimadas", "Medias de mínimos cuadrados", "LS means", "EMMeans"],
    "paraQue": "Da la media de cada tratamiento corregida por los bloques, las parcelas perdidas o los bloques incompletos, con su error estándar e intervalo de confianza.",
    "preguntas": [
      "¿Cuál es el rendimiento esperado de cada genotipo en un alfa-látice, quitando el efecto de los bloques incompletos en que le tocó estar?",
      "¿Qué media reporto para cada tratamiento si se perdieron dos parcelas en un ensayo en bloques?",
      "¿Qué intervalo de confianza acompaña la media de cada combinación variedad × fertilización?"
    ],
    "teoria": [
      "La media aritmética de un tratamiento es justa solo si todos los tratamientos se midieron en las mismas condiciones. Si faltan parcelas, o si cada genotipo aparece en bloques incompletos distintos (látice, BIB), un genotipo que cayó en bloques buenos tendrá una media cruda inflada. Las medias ajustadas, también llamadas medias marginales estimadas o de mínimos cuadrados, se calculan con el modelo del diseño: se predice la respuesta de cada combinación de niveles en una rejilla de referencia y se promedian esas predicciones con pesos iguales sobre los factores que no se piden. Así cada tratamiento se evalúa en un bloque «promedio» y con los demás factores balanceados.",
      "En SigmaPro cada media ajustada es una combinación lineal de los coeficientes del modelo. Su error estándar sale de la matriz de covarianzas de los coeficientes, CM del error · (XᵀX)⁻, y el intervalo de confianza usa la t con los grados de libertad del error. Si una media no es estimable (por ejemplo, una combinación sin datos), se marca como faltante en lugar de inventarla. Con datos balanceados las medias ajustadas son iguales a las crudas, pero su error estándar sigue saliendo del error del modelo y no de la dispersión de cada grupo.",
      "Puedes pedir las medias de un factor, de una combinación de factores o de un factor dentro de cada nivel de otro. Este análisis describe y no compara: para separar las medias usa «Comparaciones de medias», que parte de estas mismas medias."
    ],
    "modelo": {
      "tex": "\\hat{\\mu}_i = \\mathbf{l}_i^{T} \\hat{\\mathbf{b}}, \\quad \\mathrm{EE}(\\hat{\\mu}_i) = \\sqrt{\\mathbf{l}_i^{T} \\hat{\\mathbf{V}} \\mathbf{l}_i}, \\quad \\hat{\\mathbf{V}} = CM_E (\\mathbf{X}^{T} \\mathbf{X})^{-}, \\quad \\hat{\\mu}_i \\pm t_{1 - \\alpha/2, \\nu} \\mathrm{EE}(\\hat{\\mu}_i)",
      "terminos": [
        ["\\hat{\\mathbf{b}}", "los coeficientes estimados del modelo del diseño (bloques, tratamientos e interacciones)"],
        ["\\mathbf{l}_i", "los pesos que promedian las celdas de la rejilla de referencia del nivel i, iguales sobre los demás factores"],
        ["\\hat{\\mathbf{V}}", "la matriz de covarianzas de los coeficientes"],
        ["\\mathbf{X}", "la matriz del modelo; (XᵀX)⁻ es su inversa generalizada"],
        ["t_{1 - \\alpha/2, \\nu}", "el cuantil de la t con ν grados de libertad del error, según el nivel de confianza elegido"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "El modelo describe el experimento", "como": "Lo das tú al elegir el diseño y sus papeles (bloques, repeticiones): las medias se ajustan solo por lo que el modelo incluye.", "verificar": null, "siFalla": "Si omites los bloques o declaras otro diseño, el ajuste no corrige lo que debe: elige el diseño con que se sorteó el experimento.", "alternativa": null },
      { "nombre": "Normalidad y varianzas iguales de los residuos", "como": "Los intervalos suponen errores normales con varianza común; revísalos en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en Datos); para conteos o proporciones usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Un solo error experimental", "como": "SigmaPro lo exige: en parcelas divididas, subdivididas o en franjas no da estas medias con su intervalo.", "verificar": null, "siFalla": "En esos diseños compara las medias con «Comparaciones de medias», que usa el error de cada estrato, o analiza con el modelo mixto de parcelas divididas.", "alternativa": "mixto-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con k niveles", "papel": "tratamientos (las medias que se piden)" },
        { "nombre": "bloque", "tipo": "factor con b niveles", "papel": "bloque incompleto dentro de cada repetición" },
        { "nombre": "repeticion", "tipo": "factor con r niveles", "papel": "repetición (diseño)" }
      ],
      "minimo": "El del diseño. En un látice, cada tratamiento debe aparecer en al menos 2 repeticiones; en bloques completos, conviene tener al menos 3 bloques.",
      "balance": "Es el caso para el que existen: con parcelas perdidas, bloques incompletos o celdas desiguales, las medias se corrigen con el modelo. Una media que no es estimable aparece como faltante.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para repetición, bloque, tratamiento y respuesta. En el látice el bloque se anida en la repetición, así que los bloques pueden llamarse igual (B1, B2…) en cada repetición.",
      "errores": [
        "Reportar las medias crudas de un ensayo con bloques incompletos o parcelas perdidas.",
        "Comparar las medias por la superposición de sus intervalos: dos intervalos que se traslapan pueden corresponder a medias que difieren; usa «Comparaciones de medias».",
        "Analizar un látice como bloques completos al azar, con la repetición como bloque: las medias ya no se corrigen por los bloques incompletos.",
        "Usar el error estándar de cada grupo calculado a mano en lugar del que sale del modelo."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el análisis de varianza del diseño: si la interacción es significativa, pide las medias de las combinaciones o las de un factor dentro de cada nivel del otro.",
        "Lee la media ajustada de cada nivel con su error estándar y sus grados de libertad.",
        "Usa el intervalo de confianza para describir la precisión de cada media, no para compararlas.",
        "Pasa a «Comparaciones de medias» si quieres separar las medias con letras."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Las medias de rendimiento ajustadas por los bloques incompletos variaron de 3.5 t/ha (G12; IC 95 %: 3.1 a 3.9) a 5.2 t/ha (G03; IC 95 %: 4.8 a 5.6), con un error estándar de 0.20 t/ha».",
      "guias": ["media-ajustada", "ee", "ic", "gl"]
    },
    "limitaciones": [
      "En el látice las medias se ajustan con el análisis intrabloque (bloques fijos); para recuperar la información entre bloques usa el látice como modelo mixto.",
      "No compara medias: para eso usa «Comparaciones de medias», que parte de estas mismas medias.",
      "Para ajustar por una covariable medida en cada parcela (número de plantas, peso inicial) usa la ANCOVA.",
      "En diseños con varios errores (parcelas divididas, subdivididas o en franjas) no se dan estos intervalos."
    ],
    "referencias": [
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Lenth, R. V. (2016). Least-squares means: The R package lsmeans. Journal of Statistical Software, 69(1), 1–33.",
      "Milliken, G. A., & Johnson, D. E. (2009). Analysis of messy data: Vol. 1. Designed experiments (2nd ed.). CRC Press.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Estimated marginal means", "Least-squares means", "LS means", "EMMeans"],
    "paraQue": "Gives the mean of each treatment corrected for blocks, missing plots or incomplete blocks, with its standard error and confidence interval.",
    "preguntas": [
      "What is the expected yield of each genotype in an alpha-lattice, removing the effect of the incomplete blocks it happened to fall in?",
      "Which mean do I report for each treatment if two plots were lost in a block trial?",
      "Which confidence interval goes with the mean of each variety × fertilization combination?"
    ],
    "teoria": [
      "The arithmetic mean of a treatment is fair only if all treatments were measured under the same conditions. If plots are missing, or if each genotype appears in different incomplete blocks (lattice, BIB), a genotype that fell in good blocks will have an inflated raw mean. Adjusted means, also called estimated marginal means or least-squares means, are computed from the design model: the response of each combination of levels in a reference grid is predicted, and those predictions are averaged with equal weights over the factors not requested. Each treatment is thus evaluated in an “average” block and with the other factors balanced.",
      "In SigmaPro each adjusted mean is a linear combination of the model coefficients. Its standard error comes from the covariance matrix of the coefficients, error MS · (XᵀX)⁻, and the confidence interval uses the t with the error degrees of freedom. If a mean is not estimable (for example, a combination without data), it is marked as missing instead of being made up. With balanced data the adjusted means equal the raw ones, but their standard error still comes from the model error and not from the spread of each group.",
      "You can request the means of one factor, of a combination of factors or of one factor within each level of another. This analysis describes and does not compare: to separate the means use “Mean comparisons”, which starts from these same means."
    ],
    "modelo": {
      "tex": "\\hat{\\mu}_i = \\mathbf{l}_i^{T} \\hat{\\mathbf{b}}, \\quad \\mathrm{SE}(\\hat{\\mu}_i) = \\sqrt{\\mathbf{l}_i^{T} \\hat{\\mathbf{V}} \\mathbf{l}_i}, \\quad \\hat{\\mathbf{V}} = MS_E (\\mathbf{X}^{T} \\mathbf{X})^{-}, \\quad \\hat{\\mu}_i \\pm t_{1 - \\alpha/2, \\nu} \\mathrm{SE}(\\hat{\\mu}_i)",
      "terminos": [
        ["\\hat{\\mathbf{b}}", "the estimated coefficients of the design model (blocks, treatments and interactions)"],
        ["\\mathbf{l}_i", "the weights that average the reference-grid cells of level i, equal over the other factors"],
        ["\\hat{\\mathbf{V}}", "the covariance matrix of the coefficients"],
        ["\\mathbf{X}", "the model matrix; (XᵀX)⁻ is its generalized inverse"],
        ["t_{1 - \\alpha/2, \\nu}", "the quantile of t with ν error degrees of freedom, for the chosen confidence level"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "The model describes the experiment", "como": "You set it when you choose the design and its roles (blocks, replicates): the means are adjusted only for what the model includes.", "verificar": null, "siFalla": "If you leave out the blocks or declare another design, the adjustment does not correct what it should: choose the design with which the experiment was randomized.", "alternativa": null },
      { "nombre": "Normality and equal variances of residuals", "como": "The intervals assume normal errors with a common variance; check them in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in Data); for counts or proportions use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "A single experimental error", "como": "SigmaPro requires it: in split-plot, split-split-plot or strip-plot designs it does not give these means with their interval.", "verificar": null, "siFalla": "In those designs compare the means with “Mean comparisons”, which uses the error of each stratum, or analyze with the split-plot mixed model.", "alternativa": "mixto-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with k levels", "papel": "treatments (the means requested)" },
        { "nombre": "bloque", "tipo": "factor with b levels", "papel": "incomplete block within each replicate" },
        { "nombre": "repeticion", "tipo": "factor with r levels", "papel": "replicate (design)" }
      ],
      "minimo": "That of the design. In a lattice, each treatment must appear in at least 2 replicates; in complete blocks, at least 3 blocks are advisable.",
      "balance": "This is the case they exist for: with missing plots, incomplete blocks or unequal cells, the means are corrected by the model. A mean that is not estimable appears as missing.",
      "notaFormato": "Long format: one row per plot, with columns for replicate, block, treatment and response. In the lattice the block is nested in the replicate, so blocks can have the same names (B1, B2…) in each replicate.",
      "errores": [
        "Reporting the raw means of a trial with incomplete blocks or missing plots.",
        "Comparing means by whether their intervals overlap: two overlapping intervals may belong to means that differ; use “Mean comparisons”.",
        "Analyzing a lattice as a randomized complete block design, with the replicate as the block: the means are then no longer corrected for the incomplete blocks.",
        "Using the standard error of each group computed by hand instead of the one from the model."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the design’s analysis of variance: if the interaction is significant, request the means of the combinations or those of one factor within each level of the other.",
        "Read the adjusted mean of each level with its standard error and degrees of freedom.",
        "Use the confidence interval to describe the precision of each mean, not to compare them.",
        "Go to “Mean comparisons” if you want to separate the means with letters."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield means adjusted for the incomplete blocks ranged from 3.5 t/ha (G12; 95 % CI: 3.1 to 3.9) to 5.2 t/ha (G03; 95 % CI: 4.8 to 5.6), with a standard error of 0.20 t/ha.”",
      "guias": ["media-ajustada", "ee", "ic", "gl"]
    },
    "limitaciones": [
      "In the lattice the means are adjusted with the intra-block analysis (fixed blocks); to recover inter-block information use the lattice as a mixed model.",
      "It does not compare means: for that use “Mean comparisons”, which starts from these same means.",
      "To adjust for a covariate measured in each plot (number of plants, initial weight) use ANCOVA.",
      "In designs with several errors (split-plot, split-split-plot or strip-plot) these intervals are not given."
    ],
    "referencias": [
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Lenth, R. V. (2016). Least-squares means: The R package lsmeans. Journal of Statistical Software, 69(1), 1–33.",
      "Milliken, G. A., & Johnson, D. E. (2009). Analysis of messy data: Vol. 1. Designed experiments (2nd ed.). CRC Press.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley."
    ]
  }
});
