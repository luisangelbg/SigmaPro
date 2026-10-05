SP_FICHA({
  "id": "franjas",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": ["parcelas"],
  "relacionados": ["parcelas-divididas", "parcelas-subdivididas", "modelo-mixto", "dbca", "comparaciones-medias"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend", "franjaA": "hibrido", "franjaB": "dosis", "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Parcelas en franjas", "Bloques divididos", "Franjas cruzadas", "Strip plot"],
    "paraQue": "Analiza experimentos de dos factores aplicados en franjas que se cruzan dentro de cada bloque, con un error para cada factor y otro para su interacción.",
    "preguntas": [
      "¿Interactúan el sistema de labranza, hecho en franjas con tractor, y la lámina de riego, aplicada en franjas perpendiculares?",
      "¿Depende la respuesta de tres híbridos de maíz, sembrados en franjas con sembradora, de cuatro dosis de nitrógeno aplicadas en franjas transversales?",
      "¿Cambia el rendimiento de seis variedades de arroz con tres niveles de nitrógeno cuando los dos factores se manejan en franjas?"
    ],
    "teoria": [
      "En las parcelas en franjas, también llamadas bloques divididos, los dos factores necesitan parcelas grandes. Dentro de cada bloque, los niveles de A se sortean en franjas horizontales y los de B en franjas verticales que cruzan a las primeras; cada combinación A × B queda en la intersección de una franja de cada tipo. Es útil cuando los dos factores se manejan con maquinaria o con agua: labranza en un sentido y riego en el otro, o híbridos sembrados en surcos largos y dosis de fertilizante aplicadas en sentido perpendicular.",
      "Como hay tres tipos de unidad (la franja horizontal, la vertical y su intersección), hay tres errores. El error a, la interacción bloque × A, prueba A; el error b, la interacción bloque × B, prueba B; y el error c, la variación de las intersecciones, prueba la interacción A × B. SigmaPro hace el análisis por estratos de error, como aov con Error(bloque/(A + B)) en R o strip.plot del paquete agricolae, y da un coeficiente de variación por cada error.",
      "El precio de la comodidad en campo es la precisión de los efectos principales: A y B se prueban con errores que suelen tener pocos grados de libertad, mientras que la interacción se estima mejor que en un diseño de bloques. Por eso el diseño conviene cuando la interacción es lo que más interesa. Las comparaciones de medias que mezclan estratos combinan los errores, con grados de libertad de Satterthwaite."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\beta_k + \\alpha_i + \\delta_{ik} + \\gamma_j + \\eta_{jk} + (\\alpha\\gamma)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "la respuesta en la intersección de la franja horizontal con el nivel i de A y la vertical con el nivel j de B, en el bloque k"],
        ["\\mu", "la media general"],
        ["\\beta_k", "el efecto del bloque k"],
        ["\\alpha_i", "el efecto del factor de las franjas horizontales (A)"],
        ["\\delta_{ik}", "el error a, variación entre franjas horizontales"],
        ["\\gamma_j", "el efecto del factor de las franjas verticales (B)"],
        ["\\eta_{jk}", "el error b, variación entre franjas verticales"],
        ["(\\alpha\\gamma)_{ij}", "la interacción A × B"],
        ["\\varepsilon_{ijk}", "el error c, variación entre intersecciones, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{algún } \\alpha_i \\ne 0", "texto": "El factor de las franjas horizontales no tiene efecto. F = CM(A) / CM(error a)." },
      { "h0": "\\gamma_1 = \\cdots = \\gamma_b = 0", "h1": "\\text{algún } \\gamma_j \\ne 0", "texto": "El factor de las franjas verticales no tiene efecto. F = CM(B) / CM(error b)." },
      { "h0": "(\\alpha\\gamma)_{ij} = 0 \\text{ para toda } i, j", "h1": "\\text{alguna } (\\alpha\\gamma)_{ij} \\ne 0", "texto": "El efecto de un factor no depende del nivel del otro. F = CM(A × B) / CM(error c)." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los errores de cada estrato", "como": "El análisis por estratos no trae semáforo. «Revisar los supuestos del modelo», con A y B como tratamientos y el bloque, revisa los residuos de un modelo con un solo error (revisión aproximada). Para revisarlos sobre el modelo con sus tres errores, ajusta en «Modelo lineal mixto (fórmula)» A * B + (1 | bloque) + (1 | bloque:A) + (1 | bloque:B), que trae su semáforo.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en Datos) y repite el análisis.", "alternativa": null },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe y Levene por combinación A × B en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo de la respuesta.", "alternativa": null },
      { "nombre": "Diseño completo y balanceado", "como": "SigmaPro revisa que cada bloque tenga todas las intersecciones, con un dato cada una, y avisa si no.", "verificar": null, "siFalla": "Con intersecciones perdidas las F de los estratos dejan de ser exactas: usa el modelo lineal mixto con los tres efectos aleatorios.", "alternativa": "modelo-mixto" },
      { "nombre": "Independencia y sorteo de las franjas", "como": "La da el sorteo, en cada bloque, del orden de las franjas horizontales y del de las verticales; no se prueba con los datos.", "verificar": null, "siFalla": "Si repetiste el mismo orden de franjas en todos los bloques, el diseño queda sistemático y las pruebas pierden validez.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "hibrido", "tipo": "factor con a niveles", "papel": "franjas horizontales (factor A)" },
        { "nombre": "dosis", "tipo": "factor con b niveles", "papel": "franjas verticales (factor B)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (diseño)" }
      ],
      "minimo": "Al menos 3 bloques, mejor 4 o más: el error a tiene (r − 1)(a − 1) grados de libertad y el error b, (r − 1)(b − 1).",
      "balance": "Debe haber un dato por intersección y todas las intersecciones en cada bloque. Si faltan, SigmaPro avisa que las F de los estratos dejan de ser exactas y recomienda un modelo mixto.",
      "notaFormato": "Formato largo: una fila por intersección de franjas, con el bloque, el nivel de A, el nivel de B y la respuesta. En el ejemplo, los datos del maíz se leen como si los híbridos se hubieran sembrado en franjas y las dosis aplicado en franjas cruzadas.",
      "errores": [
        "Analizarlo como bloques completos al azar: A y B se prueban contra un error demasiado chico.",
        "Analizarlo como parcelas divididas: uno de los dos factores queda probado contra el error equivocado.",
        "Usar el mismo orden de franjas en todos los bloques en lugar de sortearlo en cada uno.",
        "Capturar el promedio de cada franja en lugar de una fila por intersección."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la nota del cuadro: el error a prueba A, el error b prueba B y el error c prueba la interacción.",
        "Lee primero la interacción A × B y la gráfica de interacción: si es significativa, compara un factor dentro de cada nivel del otro.",
        "Lee la F de cada factor contra su error; los bloques no se prueban.",
        "Mira los tres CV para juzgar la precisión de cada tipo de franja.",
        "Compara las medias con «Comparar las medias de este diseño», que usa el error de cada comparación con grados de libertad de Satterthwaite."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La interacción híbrido × dosis fue significativa (F(6, 18) = 4.3, p = 0.007, contra el error de las intersecciones), por lo que la respuesta a la dosis se comparó dentro de cada híbrido. Los coeficientes de variación fueron de 6 % (error a), 9 % (error b) y 4 % (error c)».",
      "guias": ["F", "p", "cv", "gl"]
    },
    "limitaciones": [
      "Los dos efectos principales se prueban con errores de pocos grados de libertad: el diseño sacrifica precisión en A y en B para ganarla en la interacción.",
      "Con intersecciones perdidas, usa el modelo lineal mixto (fórmula) con bloque, bloque × A y bloque × B como aleatorios.",
      "Si solo uno de los factores necesita parcelas grandes, usa parcelas divididas.",
      "Para conteos o proporciones, usa un modelo lineal generalizado mixto con los mismos efectos aleatorios."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  },
  "en": {
    "alias": ["Strip plot", "Strip-block design", "Split block"],
    "paraQue": "Analyzes two-factor experiments applied in strips that cross within each block, with one error for each factor and another for their interaction.",
    "preguntas": [
      "Do the tillage system, done in strips with a tractor, and the irrigation depth, applied in perpendicular strips, interact?",
      "Does the response of three maize hybrids, sown in strips with a planter, depend on four nitrogen rates applied in crossing strips?",
      "Does the yield of six rice varieties change with three nitrogen levels when both factors are handled in strips?"
    ],
    "teoria": [
      "In the strip plot, also called the split block, both factors need large plots. Within each block, the levels of A are randomized to horizontal strips and those of B to vertical strips that cross the first ones; each A × B combination lies at the intersection of one strip of each kind. It is useful when both factors are handled with machinery or water: tillage in one direction and irrigation in the other, or hybrids sown in long rows and fertilizer rates applied perpendicularly.",
      "Because there are three kinds of unit (the horizontal strip, the vertical strip and their intersection), there are three errors. Error a, the block × A interaction, tests A; error b, the block × B interaction, tests B; and error c, the variation among intersections, tests the A × B interaction. SigmaPro analyzes it by error strata, like aov with Error(block/(A + B)) in R or strip.plot in the agricolae package, and gives one coefficient of variation per error.",
      "The price of field convenience is the precision of the main effects: A and B are tested with errors that usually have few degrees of freedom, while the interaction is estimated better than in a block design. That is why the design pays off when the interaction is what matters most. Mean comparisons that mix strata combine the errors, with Satterthwaite degrees of freedom."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\beta_k + \\alpha_i + \\delta_{ik} + \\gamma_j + \\eta_{jk} + (\\alpha\\gamma)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "the response at the intersection of the horizontal strip with level i of A and the vertical strip with level j of B, in block k"],
        ["\\mu", "the overall mean"],
        ["\\beta_k", "the effect of block k"],
        ["\\alpha_i", "the effect of the horizontal-strip factor (A)"],
        ["\\delta_{ik}", "error a, the variation among horizontal strips"],
        ["\\gamma_j", "the effect of the vertical-strip factor (B)"],
        ["\\eta_{jk}", "error b, the variation among vertical strips"],
        ["(\\alpha\\gamma)_{ij}", "the A × B interaction"],
        ["\\varepsilon_{ijk}", "error c, the variation among intersections, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{some } \\alpha_i \\ne 0", "texto": "The horizontal-strip factor has no effect. F = MS(A) / MS(error a)." },
      { "h0": "\\gamma_1 = \\cdots = \\gamma_b = 0", "h1": "\\text{some } \\gamma_j \\ne 0", "texto": "The vertical-strip factor has no effect. F = MS(B) / MS(error b)." },
      { "h0": "(\\alpha\\gamma)_{ij} = 0 \\text{ for all } i, j", "h1": "\\text{some } (\\alpha\\gamma)_{ij} \\ne 0", "texto": "The effect of one factor does not depend on the level of the other. F = MS(A × B) / MS(error c)." }
    ],
    "supuestos": [
      { "nombre": "Normality of the errors in each stratum", "como": "The analysis by strata has no checklist. “Check the model assumptions”, with A and B as treatments and the block, checks the residuals of a single-error model (an approximate check). To check them on the model with its three errors, fit A * B + (1 | block) + (1 | block:A) + (1 | block:B) in “Linear mixed model (formula)”, which has its own checklist.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in Data) and repeat the analysis.", "alternativa": null },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe and Levene tests by A × B combination in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try the log of the response.", "alternativa": null },
      { "nombre": "Complete, balanced design", "como": "SigmaPro checks that every block has all the intersections, with one value each, and warns you if not.", "verificar": null, "siFalla": "With missing intersections the stratum F tests are no longer exact: use the linear mixed model with the three random effects.", "alternativa": "modelo-mixto" },
      { "nombre": "Independence and randomization of the strips", "como": "It comes from randomizing, in each block, the order of the horizontal strips and of the vertical ones; it is not tested with the data.", "verificar": null, "siFalla": "If you repeated the same strip order in every block, the design is systematic and the tests lose validity.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "hibrido", "tipo": "factor with a levels", "papel": "horizontal strips (factor A)" },
        { "nombre": "dosis", "tipo": "factor with b levels", "papel": "vertical strips (factor B)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (design)" }
      ],
      "minimo": "At least 3 blocks, 4 or more is better: error a has (r − 1)(a − 1) degrees of freedom and error b, (r − 1)(b − 1).",
      "balance": "There must be one value per intersection and all intersections in every block. If some are missing, SigmaPro warns that the stratum F tests are no longer exact and recommends a mixed model.",
      "notaFormato": "Long format: one row per strip intersection, with the block, the level of A, the level of B and the response. In the example, the maize data are read as if the hybrids had been sown in strips and the rates applied in crossing strips.",
      "errores": [
        "Analyzing it as randomized complete blocks: A and B are tested against an error that is too small.",
        "Analyzing it as a split plot: one of the two factors ends up tested against the wrong error.",
        "Using the same strip order in every block instead of randomizing it in each one.",
        "Entering the mean of each strip instead of one row per intersection."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the table note: error a tests A, error b tests B and error c tests the interaction.",
        "Read the A × B interaction and the interaction plot first: if it is significant, compare one factor within each level of the other.",
        "Read the F of each factor against its error; blocks are not tested.",
        "Look at the three CVs to judge the precision of each kind of strip.",
        "Compare the means with “Compare the means of this design”, which uses the error of each comparison with Satterthwaite degrees of freedom."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The hybrid × rate interaction was significant (F(6, 18) = 4.3, p = 0.007, against the intersection error), so the response to rate was compared within each hybrid. The coefficients of variation were 6 % (error a), 9 % (error b) and 4 % (error c).”",
      "guias": ["F", "p", "cv", "gl"]
    },
    "limitaciones": [
      "Both main effects are tested with low-df errors: the design gives up precision on A and B to gain it on the interaction.",
      "With missing intersections, use the linear mixed model (formula) with block, block × A and block × B as random.",
      "If only one factor needs large plots, use a split plot.",
      "For counts or proportions, use a generalized linear mixed model with the same random effects."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  }
});
