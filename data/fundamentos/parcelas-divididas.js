SP_FICHA({
  "id": "parcelas-divididas",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": ["parcelas"],
  "relacionados": ["mixto-divididas", "parcelas-subdivididas", "franjas", "dbca", "comparaciones-medias", "medidas-repetidas"],
  "ejemplo": { "conjunto": "avena", "entradas": { "respuesta": "rendimiento", "parcelaGrande": "variedad", "subparcela": "nitrogeno", "bloque": "bloque", "principal": "dbca" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "variedad", "nitrogeno", "rendimiento"], ["I", "Victory", "0", "111"], ["I", "Victory", "0.2", "130"], ["I", "Victory", "0.4", "157"], ["I", "Victory", "0.6", "174"], ["I", "Golden rain", "0", "117"], ["I", "Golden rain", "0.2", "114"], ["I", "Golden rain", "0.4", "161"]],
    "ancho": null
  },
  "es": {
    "alias": ["Parcelas divididas", "Diseño de parcelas divididas", "ANOVA con dos errores", "Split plot"],
    "paraQue": "Analiza experimentos de dos factores en los que uno se aplica a parcelas grandes y el otro a subparcelas dentro de ellas, con un error para cada tamaño de parcela.",
    "preguntas": [
      "¿Cómo responden cuatro variedades de trigo (subparcelas) a tres láminas de riego que solo se pueden aplicar a parcelas grandes?",
      "¿Depende la respuesta del maíz a la dosis de nitrógeno del sistema de labranza, si la labranza se hizo en franjas anchas con tractor?",
      "¿Difieren tres variedades de avena y cuatro dosis de nitrógeno cuando cada variedad se sembró en una parcela grande dividida para las dosis?"
    ],
    "teoria": [
      "Algunos factores no se pueden aplicar a parcelas chicas: el riego, la labranza o la fecha de siembra necesitan parcelas grandes, mientras que las variedades o las dosis de fertilizante caben en parcelas más pequeñas. En el diseño de parcelas divididas se sortea primero el factor A en las parcelas grandes y, dentro de cada parcela grande, se sortean los niveles del factor B en subparcelas. Hay dos sorteos y dos tamaños de unidad experimental, y por eso dos errores.",
      "El error a mide la variación entre parcelas grandes que recibieron el mismo nivel de A (con bloques, la interacción bloque × A) y sirve para probar A. El error b mide la variación entre subparcelas dentro de las parcelas grandes y sirve para probar B y la interacción A × B. Como hay menos parcelas grandes, A se estima con menos precisión: conviene poner en la parcela grande el factor que solo se puede manejar en grande o el que menos interesa. SigmaPro hace el análisis por estratos de error, como aov con Error(bloque/A) en R. Las parcelas grandes pueden estar en bloques completos, completamente al azar (el error a es la repetición dentro de A) o en cuadro latino (el error a es hilera × columna).",
      "El resumen da un coeficiente de variación por cada error. Las comparaciones de medias que mezclan niveles de A y de B usan una combinación de los dos errores, con grados de libertad de Satterthwaite."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\beta_k + \\alpha_i + \\delta_{ik} + \\gamma_j + (\\alpha\\gamma)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "la respuesta de la subparcela con el nivel j de B, en la parcela grande con el nivel i de A, del bloque k"],
        ["\\mu", "la media general"],
        ["\\beta_k", "el efecto del bloque k"],
        ["\\alpha_i", "el efecto del nivel i del factor de la parcela grande (A)"],
        ["\\delta_{ik}", "el error a, variación entre parcelas grandes, con media 0 y su propia varianza"],
        ["\\gamma_j", "el efecto del nivel j del factor de la subparcela (B)"],
        ["(\\alpha\\gamma)_{ij}", "la interacción A × B"],
        ["\\varepsilon_{ijk}", "el error b, variación entre subparcelas, con media 0 y su propia varianza"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\alpha_2 = \\cdots = \\alpha_a = 0", "h1": "\\text{algún } \\alpha_i \\ne 0", "texto": "El factor de la parcela grande no tiene efecto. F = CM(A) / CM(error a)." },
      { "h0": "\\gamma_1 = \\gamma_2 = \\cdots = \\gamma_b = 0", "h1": "\\text{algún } \\gamma_j \\ne 0", "texto": "El factor de la subparcela no tiene efecto. F = CM(B) / CM(error b)." },
      { "h0": "(\\alpha\\gamma)_{ij} = 0 \\text{ para toda } i, j", "h1": "\\text{alguna } (\\alpha\\gamma)_{ij} \\ne 0", "texto": "El efecto de B no depende del nivel de A. F = CM(A × B) / CM(error b)." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los errores de cada estrato", "como": "El análisis por estratos no trae semáforo. «Parcelas divididas (modelo mixto)» ajusta el mismo diseño y su semáforo revisa la normalidad de los residuos y de los efectos aleatorios; «Revisar los supuestos del modelo», con A y B como tratamientos y el bloque, da una revisión aproximada con un solo error.", "verificar": "mixto-divididas", "siFalla": "Transforma la respuesta (Box-Cox en Datos) y repite el análisis; para conteos o proporciones, usa un modelo lineal generalizado mixto.", "alternativa": "glmm" },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe y Levene por combinación A × B en «Revisar los supuestos del modelo»; el modelo mixto aplica Levene (con la mediana) a sus residuos entre los niveles de A.", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo de la respuesta.", "alternativa": null },
      { "nombre": "Diseño completo y balanceado", "como": "SigmaPro revisa que cada parcela grande tenga todas sus subparcelas, con un dato cada una, y avisa si no.", "verificar": null, "siFalla": "Con parcelas perdidas las F de los estratos dejan de ser exactas: usa el modelo mixto, que maneja el desbalance.", "alternativa": "mixto-divididas" },
      { "nombre": "Independencia y dos sorteos", "como": "La dan el sorteo de A en las parcelas grandes y el de B dentro de cada una; no se prueba con los datos.", "verificar": null, "siFalla": "Si los niveles de B son fechas de medición de la misma parcela, no se sortearon: usa medidas repetidas.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "variedad", "tipo": "factor con a niveles", "papel": "parcela grande (factor A)" },
        { "nombre": "nitrogeno", "tipo": "factor con b niveles", "papel": "subparcela (factor B)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (o repetición de la parcela grande, o hilera y columna)" }
      ],
      "minimo": "Al menos 3 bloques, mejor 4 o más: el error a tiene (r − 1)(a − 1) grados de libertad y, con pocos bloques, la prueba de A casi no tiene potencia.",
      "balance": "Debe haber un dato por subparcela y todas las subparcelas en cada parcela grande. Si faltan, SigmaPro avisa que las F de los estratos dejan de ser exactas y recomienda un modelo mixto: usa «Parcelas divididas (modelo mixto)».",
      "notaFormato": "Formato largo: una fila por subparcela, con el bloque, el nivel de A de su parcela grande, el nivel de B y la respuesta. Si las parcelas grandes se sortearon sin bloques, en lugar del bloque va el número de repetición de cada parcela grande dentro de su tratamiento; en cuadro latino, su hilera y su columna.",
      "errores": [
        "Analizarlo como bloques completos al azar con un solo error: A se prueba contra un error demasiado chico y aparecen diferencias que no existen.",
        "Intercambiar los papeles: la parcela grande es la del factor que se sorteó en las unidades grandes, no la del factor que más interesa.",
        "Usar parcelas divididas para fechas de medición de la misma parcela: el tiempo no se sortea; usa medidas repetidas.",
        "Promediar las subparcelas de cada parcela grande antes de analizar: se pierde el error b y la prueba de B."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la nota del cuadro: qué error prueba cada término (error a entre parcelas grandes, error b dentro de ellas).",
        "Lee primero la interacción A × B y la gráfica de interacción: si es significativa, compara B dentro de cada nivel de A (y A dentro de cada B).",
        "Lee la F de A (contra el error a) y la de B (contra el error b); los bloques no se prueban.",
        "Mira los dos CV: el del error a suele ser mayor; uno muy alto indica parcelas grandes poco uniformes.",
        "Compara las medias con «Comparar las medias de este diseño»: cada comparación usa su error, con grados de libertad de Satterthwaite. Las medias del cuadro son medias simples con su número de datos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento respondió al nitrógeno (F(3, 45) = 28.4, p < 0.001), pero no difirió entre variedades (F(2, 10) = 2.1, p = 0.17), que se probaron contra el error de las parcelas grandes; no hubo interacción variedad × nitrógeno (F(6, 45) = 0.6, p = 0.73). Los coeficientes de variación fueron de 19 % (error a) y 11 % (error b)».",
      "guias": ["F", "p", "cv", "gl", "media"]
    },
    "limitaciones": [
      "A se estima con menos precisión que B y que A × B: si puedes, no pongas en la parcela grande el factor que más te interesa.",
      "Con parcelas perdidas o desbalance, las pruebas por estratos no son exactas: usa «Parcelas divididas (modelo mixto)».",
      "Si los dos factores se aplican en franjas que se cruzan, usa parcelas en franjas; con un tercer factor en parcelas más chicas, parcelas subdivididas.",
      "Si la subparcela es el momento de medición, usa medidas repetidas, que modelan la correlación entre fechas."
    ],
    "referencias": [
      "Yates, F. (1935). Complex experiments. Supplement to the Journal of the Royal Statistical Society, 2(2), 181–247.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  },
  "en": {
    "alias": ["Split plot", "Split-plot design", "ANOVA with two error terms"],
    "paraQue": "Analyzes two-factor experiments in which one factor is applied to main plots and the other to subplots within them, with one error for each plot size.",
    "preguntas": [
      "How do four wheat varieties (subplots) respond to three irrigation depths that can only be applied to main plots?",
      "Does the response of maize to nitrogen rate depend on the tillage system, when tillage was done in wide strips with a tractor?",
      "Do three oat varieties and four nitrogen rates differ when each variety was sown in a main plot divided for the rates?"
    ],
    "teoria": [
      "Some factors cannot be applied to small plots: irrigation, tillage or sowing date need large plots, while varieties or fertilizer rates fit in smaller ones. In the split-plot design, factor A is first randomized to the main plots and, within each main plot, the levels of factor B are randomized to subplots. There are two randomizations and two sizes of experimental unit, and therefore two errors.",
      "Error a measures the variation among main plots that received the same level of A (with blocks, the block × A interaction) and is used to test A. Error b measures the variation among subplots within main plots and is used to test B and the A × B interaction. Because there are fewer main plots, A is estimated with less precision: put on the main plot the factor that can only be handled in large plots or the one of least interest. SigmaPro analyzes it by error strata, like aov with Error(block/A) in R. Main plots can be in complete blocks, completely randomized (error a is the replicate within A) or in a Latin square (error a is row × column).",
      "The summary gives one coefficient of variation per error. Mean comparisons that mix levels of A and B use a combination of both errors, with Satterthwaite degrees of freedom."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\beta_k + \\alpha_i + \\delta_{ik} + \\gamma_j + (\\alpha\\gamma)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "the response of the subplot with level j of B, in the main plot with level i of A, in block k"],
        ["\\mu", "the overall mean"],
        ["\\beta_k", "the effect of block k"],
        ["\\alpha_i", "the effect of level i of the main-plot factor (A)"],
        ["\\delta_{ik}", "error a, the variation among main plots, with mean 0 and its own variance"],
        ["\\gamma_j", "the effect of level j of the subplot factor (B)"],
        ["(\\alpha\\gamma)_{ij}", "the A × B interaction"],
        ["\\varepsilon_{ijk}", "error b, the variation among subplots, with mean 0 and its own variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\alpha_2 = \\cdots = \\alpha_a = 0", "h1": "\\text{some } \\alpha_i \\ne 0", "texto": "The main-plot factor has no effect. F = MS(A) / MS(error a)." },
      { "h0": "\\gamma_1 = \\gamma_2 = \\cdots = \\gamma_b = 0", "h1": "\\text{some } \\gamma_j \\ne 0", "texto": "The subplot factor has no effect. F = MS(B) / MS(error b)." },
      { "h0": "(\\alpha\\gamma)_{ij} = 0 \\text{ for all } i, j", "h1": "\\text{some } (\\alpha\\gamma)_{ij} \\ne 0", "texto": "The effect of B does not depend on the level of A. F = MS(A × B) / MS(error b)." }
    ],
    "supuestos": [
      { "nombre": "Normality of the errors in each stratum", "como": "The analysis by strata has no checklist. “Split plot (mixed model)” fits the same design and its checklist checks the normality of the residuals and of the random effects; “Check the model assumptions”, with A and B as treatments and the block, gives an approximate check with a single error.", "verificar": "mixto-divididas", "siFalla": "Transform the response (Box-Cox in Data) and repeat the analysis; for counts or proportions, use a generalized linear mixed model.", "alternativa": "glmm" },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe and Levene tests by A × B combination in “Check the model assumptions”; the mixed model applies Levene’s test (with the median) to its residuals across the levels of A.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try the log of the response.", "alternativa": null },
      { "nombre": "Complete, balanced design", "como": "SigmaPro checks that every main plot has all its subplots, with one value each, and warns you if not.", "verificar": null, "siFalla": "With missing plots the stratum F tests are no longer exact: use the mixed model, which handles imbalance.", "alternativa": "mixto-divididas" },
      { "nombre": "Independence and two randomizations", "como": "It comes from randomizing A to the main plots and B within each of them; it is not tested with the data.", "verificar": null, "siFalla": "If the levels of B are measurement dates on the same plot, they were not randomized: use repeated measures.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "variedad", "tipo": "factor with a levels", "papel": "main plot (factor A)" },
        { "nombre": "nitrogeno", "tipo": "factor with b levels", "papel": "subplot (factor B)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (or main-plot replicate, or row and column)" }
      ],
      "minimo": "At least 3 blocks, 4 or more is better: error a has (r − 1)(a − 1) degrees of freedom and, with few blocks, the test of A has almost no power.",
      "balance": "There must be one value per subplot and all subplots in every main plot. If some are missing, SigmaPro warns that the stratum F tests are no longer exact and recommends a mixed model: use “Split plot (mixed model)”.",
      "notaFormato": "Long format: one row per subplot, with the block, the level of A of its main plot, the level of B and the response. If main plots were randomized without blocks, the block is replaced by the replicate number of each main plot within its treatment; in a Latin square, by its row and column.",
      "errores": [
        "Analyzing it as randomized complete blocks with a single error: A is tested against an error that is too small and differences appear that do not exist.",
        "Swapping roles: the main plot holds the factor that was randomized to the large units, not the factor of most interest.",
        "Using a split plot for measurement dates on the same plot: time is not randomized; use repeated measures.",
        "Averaging the subplots of each main plot before the analysis: error b and the test of B are lost."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the table note: which error tests each term (error a among main plots, error b within them).",
        "Read the A × B interaction and the interaction plot first: if it is significant, compare B within each level of A (and A within each B).",
        "Read the F of A (against error a) and of B (against error b); blocks are not tested.",
        "Look at both CVs: the one for error a is usually larger; a very high one points to non-uniform main plots.",
        "Compare the means with “Compare the means of this design”: each comparison uses its own error, with Satterthwaite degrees of freedom. The means in the table are simple means with their number of values."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield responded to nitrogen (F(3, 45) = 28.4, p < 0.001) but did not differ among varieties (F(2, 10) = 2.1, p = 0.17), which were tested against the main-plot error; there was no variety × nitrogen interaction (F(6, 45) = 0.6, p = 0.73). The coefficients of variation were 19 % (error a) and 11 % (error b).”",
      "guias": ["F", "p", "cv", "gl", "media"]
    },
    "limitaciones": [
      "A is estimated with less precision than B and A × B: if you can, do not put the factor you care most about on the main plot.",
      "With missing plots or imbalance, the tests by strata are not exact: use “Split plot (mixed model)”.",
      "If both factors are applied in crossing strips, use a strip plot; with a third factor on smaller plots, a split-split plot.",
      "If the subplot is the time of measurement, use repeated measures, which model the correlation among dates."
    ],
    "referencias": [
      "Yates, F. (1935). Complex experiments. Supplement to the Journal of the Royal Statistical Society, 2(2), 181–247.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114."
    ]
  }
});
