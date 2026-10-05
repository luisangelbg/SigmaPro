SP_FICHA({
  "id": "parcelas-subdivididas",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": ["parcelas"],
  "relacionados": ["parcelas-divididas", "mixto-divididas", "franjas", "comparaciones-medias", "medidas-repetidas"],
  "ejemplo": { "conjunto": "arroz-subdivididas", "entradas": { "respuesta": "rendimiento", "parcelaGrande": "riego", "subparcela": "variedad", "subsubparcela": "nitrogeno", "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "riego", "variedad", "nitrogeno", "rendimiento"], ["1", "Riego", "V1", "N0", "7.15"], ["1", "Riego", "V1", "N80", "8.12"], ["1", "Riego", "V2", "N0", "7.11"], ["1", "Riego", "V2", "N80", "8.2"], ["1", "Riego", "V3", "N0", "6.71"], ["1", "Riego", "V3", "N80", "7.7"], ["1", "Temporal", "V1", "N0", "5.08"], ["1", "Temporal", "V1", "N80", "6.12"]],
    "ancho": null
  },
  "es": {
    "alias": ["Parcelas subdivididas", "Diseño de parcelas sub-subdivididas", "ANOVA con tres errores", "Split-split plot"],
    "paraQue": "Analiza experimentos de tres factores aplicados en tres tamaños de parcela anidados (grandes, subparcelas y sub-subparcelas), con un error para cada tamaño.",
    "preguntas": [
      "¿Cómo responden tres híbridos de maíz (subparcelas) a cuatro dosis de nitrógeno (sub-subparcelas) bajo tres láminas de riego aplicadas en parcelas grandes?",
      "¿Depende el efecto de la fecha de corte de un forraje de la variedad y del sistema de labranza aplicado en parcelas grandes?",
      "¿Depende la respuesta de tres variedades de arroz a la dosis de nitrógeno de que el cultivo tenga riego o sea de temporal, si el riego solo se puede manejar en parcelas grandes?"
    ],
    "teoria": [
      "Las parcelas subdivididas extienden las parcelas divididas a tres factores y tres tamaños de parcela. El factor A se sortea en las parcelas grandes, el B en subparcelas dentro de cada parcela grande y el C en sub-subparcelas dentro de cada subparcela. Es común cuando un factor exige parcelas grandes (riego, labranza), otro parcelas medianas (híbridos, fechas de siembra) y el tercero cabe en parcelas chicas (dosis de fertilizante).",
      "Cada nivel de parcela tiene su propio error. El error a, la interacción bloque × A, prueba A; el error b, la variación entre subparcelas de la misma parcela grande, prueba B y A × B; el error c, la variación entre sub-subparcelas, prueba C y todas sus interacciones (A × C, B × C y A × B × C). SigmaPro hace el análisis por estratos de error, como aov con Error(bloque/A/B) en R o ssp.plot del paquete agricolae, con las parcelas grandes en bloques completos al azar, y da un coeficiente de variación por cada error.",
      "La precisión crece de la parcela grande a la sub-subparcela: C y sus interacciones se estiman mejor que A. Como el error a tiene pocos grados de libertad, (r − 1)(a − 1), conviene tener varios bloques. Las comparaciones de medias que mezclan niveles de distintos estratos combinan sus errores, con grados de libertad de Satterthwaite."
    ],
    "modelo": {
      "tex": "y_{ijkl} = \\mu + \\beta_l + \\alpha_i + \\delta_{il} + \\gamma_j + (\\alpha\\gamma)_{ij} + \\eta_{ijl} + \\lambda_k + (\\alpha\\lambda)_{ik} + (\\gamma\\lambda)_{jk} + (\\alpha\\gamma\\lambda)_{ijk} + \\varepsilon_{ijkl}",
      "terminos": [
        ["y_{ijkl}", "la respuesta de la sub-subparcela con el nivel k de C, en la subparcela con el nivel j de B, en la parcela grande con el nivel i de A, del bloque l"],
        ["\\mu", "la media general"],
        ["\\beta_l", "el efecto del bloque l"],
        ["\\alpha_i", "el efecto del factor de la parcela grande (A)"],
        ["\\delta_{il}", "el error a, variación entre parcelas grandes"],
        ["\\gamma_j, (\\alpha\\gamma)_{ij}", "el efecto del factor de la subparcela (B) y su interacción con A"],
        ["\\eta_{ijl}", "el error b, variación entre subparcelas"],
        ["\\lambda_k", "el efecto del factor de la sub-subparcela (C); los demás términos son sus interacciones con A y con B"],
        ["\\varepsilon_{ijkl}", "el error c, variación entre sub-subparcelas, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{algún } \\alpha_i \\ne 0", "texto": "El factor de la parcela grande no tiene efecto. F = CM(A) / CM(error a)." },
      { "h0": "\\gamma_j = 0, \\quad (\\alpha\\gamma)_{ij} = 0", "h1": "\\text{algún efecto} \\ne 0", "texto": "B y la interacción A × B no tienen efecto; cada uno se prueba contra el CM del error b." },
      { "h0": "\\lambda_k = 0, \\quad (\\alpha\\lambda)_{ik} = (\\gamma\\lambda)_{jk} = (\\alpha\\gamma\\lambda)_{ijk} = 0", "h1": "\\text{algún efecto} \\ne 0", "texto": "C y sus interacciones con A y con B no tienen efecto; cada uno se prueba contra el CM del error c." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los errores de cada estrato", "como": "El análisis por estratos no trae semáforo. «Parcelas divididas (modelo mixto)», con el factor de la sub-subparcela, ajusta el mismo diseño y su semáforo revisa los residuos y los efectos aleatorios; «Revisar los supuestos del modelo», con A, B y C como tratamientos y el bloque, da una revisión aproximada con un solo error.", "verificar": "mixto-divididas", "siFalla": "Transforma la respuesta (Box-Cox en Datos) y repite; para conteos o proporciones, usa un modelo lineal generalizado mixto.", "alternativa": "glmm" },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe y Levene por combinación A × B × C en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo de la respuesta.", "alternativa": null },
      { "nombre": "Diseño completo y balanceado", "como": "SigmaPro revisa que cada parcela y subparcela tenga todas sus divisiones, con un dato cada una, y avisa si no.", "verificar": null, "siFalla": "Con unidades perdidas las F de los estratos dejan de ser exactas: usa el modelo mixto.", "alternativa": "mixto-divididas" },
      { "nombre": "Independencia y tres sorteos", "como": "La dan los sorteos de A, de B dentro de A y de C dentro de B; no se prueba con los datos.", "verificar": null, "siFalla": "Si C son fechas de medición de la misma unidad, no se sortearon: usa medidas repetidas.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "riego", "tipo": "factor con a niveles", "papel": "parcela grande (factor A)" },
        { "nombre": "variedad", "tipo": "factor con b niveles", "papel": "subparcela (factor B)" },
        { "nombre": "nitrogeno", "tipo": "factor con c niveles", "papel": "sub-subparcela (factor C)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (diseño)" }
      ],
      "minimo": "Al menos 3 bloques, mejor 4 o más: con 3 bloques y 2 niveles de A, el error a solo tiene 2 grados de libertad.",
      "balance": "Debe haber un dato por sub-subparcela y todas las divisiones presentes. Si faltan, SigmaPro avisa que las F de los estratos dejan de ser exactas y recomienda el modelo mixto.",
      "notaFormato": "Formato largo: una fila por sub-subparcela, con el bloque, el nivel de A, el de B, el de C y la respuesta. Las dosis numéricas se toman como factor. El conjunto de ejemplo es ficticio, para practicar: riego o temporal en parcelas grandes, tres variedades de arroz en subparcelas y dos dosis de nitrógeno en sub-subparcelas, en tres bloques.",
      "errores": [
        "Analizarlo como un factorial en bloques con un solo error: A y B se prueban contra un error demasiado chico.",
        "Asignar los factores a un estrato distinto del que tuvieron en el campo: el papel lo decide el tamaño de parcela en que se sorteó cada factor.",
        "Usar el tercer estrato para fechas de medición o cortes sucesivos de la misma unidad: usa medidas repetidas.",
        "Promediar las sub-subparcelas antes de analizar: se pierde el error c."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la nota del cuadro: qué error prueba cada término (a entre parcelas grandes, b entre subparcelas, c entre sub-subparcelas).",
        "Lee primero las interacciones, de la triple a las dobles: si alguna es significativa, compara un factor (o las combinaciones de dos) dentro de cada nivel del otro con «Comparar las medias de este diseño». El cuadro de medias de las combinaciones y la gráfica de interacción solo muestran A × B.",
        "Lee la F de A (error a), de B (error b) y de C (error c); los bloques no se prueban.",
        "Mira los tres CV: suelen bajar del error a al c.",
        "Compara las medias con «Comparar las medias de este diseño», que usa el error de cada comparación con grados de libertad de Satterthwaite."
      ],
      "ejemplo": "Ejemplo de redacción con el conjunto de práctica (datos ficticios): «El riego aumentó el rendimiento (F(1, 2) = 95.8, p = 0.010, contra el error de las parcelas grandes) y las variedades difirieron (F(2, 8) = 36.3, p < 0.001). La respuesta al nitrógeno dependió del riego (riego × nitrógeno: F(1, 12) = 23.3, p < 0.001), por lo que el nitrógeno se comparó dentro de cada condición de riego. Los coeficientes de variación fueron de 8.5 %, 3.1 % y 2.2 % para los errores a, b y c».",
      "guias": ["F", "p", "cv", "gl"]
    },
    "limitaciones": [
      "El factor de la parcela grande se prueba con muy pocos grados de libertad: su prueba tiene poca potencia.",
      "Con unidades perdidas, usa «Parcelas divididas (modelo mixto)», que admite la sub-subparcela y el desbalance.",
      "Con muchas interacciones significativas, la lectura se complica: en «Comparaciones de medias» compara un factor dentro de cada nivel de otro («Dentro de cada nivel de» admite un solo factor).",
      "Si un nivel de parcela corresponde al tiempo, usa medidas repetidas."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  },
  "en": {
    "alias": ["Split-split plot", "Split-split-plot design", "ANOVA with three error terms"],
    "paraQue": "Analyzes three-factor experiments applied on three nested plot sizes (main plots, subplots and sub-subplots), with one error for each size.",
    "preguntas": [
      "How do three maize hybrids (subplots) respond to four nitrogen rates (sub-subplots) under three irrigation depths applied to main plots?",
      "Does the effect of the cutting date of a forage crop depend on the variety and on the tillage system applied to main plots?",
      "Does the response of three rice varieties to nitrogen rate depend on whether the crop is irrigated or rainfed, if irrigation can only be handled in main plots?"
    ],
    "teoria": [
      "The split-split plot extends the split plot to three factors and three plot sizes. Factor A is randomized to the main plots, B to subplots within each main plot and C to sub-subplots within each subplot. It is common when one factor requires large plots (irrigation, tillage), another medium plots (hybrids, sowing dates) and the third fits in small plots (fertilizer rates).",
      "Each plot level has its own error. Error a, the block × A interaction, tests A; error b, the variation among subplots of the same main plot, tests B and A × B; error c, the variation among sub-subplots, tests C and all its interactions (A × C, B × C and A × B × C). SigmaPro analyzes it by error strata, like aov with Error(block/A/B) in R or ssp.plot in the agricolae package, with the main plots in randomized complete blocks, and gives one coefficient of variation per error.",
      "Precision increases from the main plot to the sub-subplot: C and its interactions are estimated better than A. Because error a has few degrees of freedom, (r − 1)(a − 1), several blocks are advisable. Mean comparisons that mix levels from different strata combine their errors, with Satterthwaite degrees of freedom."
    ],
    "modelo": {
      "tex": "y_{ijkl} = \\mu + \\beta_l + \\alpha_i + \\delta_{il} + \\gamma_j + (\\alpha\\gamma)_{ij} + \\eta_{ijl} + \\lambda_k + (\\alpha\\lambda)_{ik} + (\\gamma\\lambda)_{jk} + (\\alpha\\gamma\\lambda)_{ijk} + \\varepsilon_{ijkl}",
      "terminos": [
        ["y_{ijkl}", "the response of the sub-subplot with level k of C, in the subplot with level j of B, in the main plot with level i of A, in block l"],
        ["\\mu", "the overall mean"],
        ["\\beta_l", "the effect of block l"],
        ["\\alpha_i", "the effect of the main-plot factor (A)"],
        ["\\delta_{il}", "error a, the variation among main plots"],
        ["\\gamma_j, (\\alpha\\gamma)_{ij}", "the effect of the subplot factor (B) and its interaction with A"],
        ["\\eta_{ijl}", "error b, the variation among subplots"],
        ["\\lambda_k", "the effect of the sub-subplot factor (C); the remaining terms are its interactions with A and B"],
        ["\\varepsilon_{ijkl}", "error c, the variation among sub-subplots, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{some } \\alpha_i \\ne 0", "texto": "The main-plot factor has no effect. F = MS(A) / MS(error a)." },
      { "h0": "\\gamma_j = 0, \\quad (\\alpha\\gamma)_{ij} = 0", "h1": "\\text{some effect} \\ne 0", "texto": "B and the A × B interaction have no effect; each is tested against the error b MS." },
      { "h0": "\\lambda_k = 0, \\quad (\\alpha\\lambda)_{ik} = (\\gamma\\lambda)_{jk} = (\\alpha\\gamma\\lambda)_{ijk} = 0", "h1": "\\text{some effect} \\ne 0", "texto": "C and its interactions with A and B have no effect; each is tested against the error c MS." }
    ],
    "supuestos": [
      { "nombre": "Normality of the errors in each stratum", "como": "The analysis by strata has no checklist. “Split plot (mixed model)”, with the sub-subplot factor, fits the same design and its checklist checks the residuals and the random effects; “Check the model assumptions”, with A, B and C as treatments and the block, gives an approximate check with a single error.", "verificar": "mixto-divididas", "siFalla": "Transform the response (Box-Cox in Data) and repeat; for counts or proportions, use a generalized linear mixed model.", "alternativa": "glmm" },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe and Levene tests by A × B × C combination in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try the log of the response.", "alternativa": null },
      { "nombre": "Complete, balanced design", "como": "SigmaPro checks that every plot and subplot has all its divisions, with one value each, and warns you if not.", "verificar": null, "siFalla": "With missing units the stratum F tests are no longer exact: use the mixed model.", "alternativa": "mixto-divididas" },
      { "nombre": "Independence and three randomizations", "como": "It comes from randomizing A, B within A and C within B; it is not tested with the data.", "verificar": null, "siFalla": "If C are measurement dates on the same unit, they were not randomized: use repeated measures.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "riego", "tipo": "factor with a levels", "papel": "main plot (factor A)" },
        { "nombre": "variedad", "tipo": "factor with b levels", "papel": "subplot (factor B)" },
        { "nombre": "nitrogeno", "tipo": "factor with c levels", "papel": "sub-subplot (factor C)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (design)" }
      ],
      "minimo": "At least 3 blocks, 4 or more is better: with 3 blocks and 2 levels of A, error a has only 2 degrees of freedom.",
      "balance": "There must be one value per sub-subplot and all divisions present. If some are missing, SigmaPro warns that the stratum F tests are no longer exact and recommends the mixed model.",
      "notaFormato": "Long format: one row per sub-subplot, with the block, the level of A, of B and of C, and the response. Numeric rates are taken as a factor. The example dataset is fictitious, for practice: irrigated or rainfed in main plots, three rice varieties in subplots and two nitrogen rates in sub-subplots, in three blocks.",
      "errores": [
        "Analyzing it as a factorial in blocks with a single error: A and B are tested against an error that is too small.",
        "Assigning factors to a stratum other than the one they had in the field: the role is set by the plot size on which each factor was randomized.",
        "Using the third stratum for measurement dates or successive cuts of the same unit: use repeated measures.",
        "Averaging the sub-subplots before the analysis: error c is lost."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the table note: which error tests each term (a among main plots, b among subplots, c among sub-subplots).",
        "Read the interactions first, from the three-way to the two-way ones: if any is significant, compare one factor (or the combinations of two) within each level of the other with “Compare the means of this design”. The table of combination means and the interaction plot only show A × B.",
        "Read the F of A (error a), B (error b) and C (error c); blocks are not tested.",
        "Look at the three CVs: they usually decrease from error a to error c.",
        "Compare the means with “Compare the means of this design”, which uses the error of each comparison with Satterthwaite degrees of freedom."
      ],
      "ejemplo": "Example write-up with the practice dataset (fictitious data): “Irrigation increased yield (F(1, 2) = 95.8, p = 0.010, against the main-plot error) and varieties differed (F(2, 8) = 36.3, p < 0.001). The response to nitrogen depended on irrigation (irrigation × nitrogen: F(1, 12) = 23.3, p < 0.001), so nitrogen was compared within each irrigation condition. The coefficients of variation were 8.5 %, 3.1 % and 2.2 % for errors a, b and c.”",
      "guias": ["F", "p", "cv", "gl"]
    },
    "limitaciones": [
      "The main-plot factor is tested with very few degrees of freedom: its test has little power.",
      "With missing units, use “Split plot (mixed model)”, which accepts the sub-subplot and imbalance.",
      "With many significant interactions, reading becomes hard: in “Mean comparisons” compare one factor within each level of another (“Within each level of” accepts a single factor).",
      "If one plot level corresponds to time, use repeated measures."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  }
});
