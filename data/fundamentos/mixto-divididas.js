SP_FICHA({
  "id": "mixto-divididas",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": ["parcelas"],
  "relacionados": ["parcelas-divididas", "parcelas-subdivididas", "franjas", "modelo-mixto", "mixto-bloques", "medidas-repetidas"],
  "ejemplo": { "conjunto": "avena", "entradas": { "respuesta": "rendimiento", "parcelaGrande": "variedad", "subparcela": "nitrogeno", "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "variedad", "nitrogeno", "rendimiento"], ["I", "Victory", "0", "111"], ["I", "Victory", "0.2", "130"], ["I", "Victory", "0.4", "157"], ["I", "Victory", "0.6", "174"], ["I", "Golden rain", "0", "117"], ["I", "Golden rain", "0.2", "114"], ["I", "Golden rain", "0.4", "161"]],
    "ancho": null
  },
  "es": {
    "alias": ["Parcelas divididas con modelo mixto", "Parcelas subdivididas con modelo mixto", "Split-plot mixto"],
    "paraQue": "Analiza parcelas divididas (o subdivididas) como modelo mixto: el factor de la parcela grande se prueba contra la variación entre parcelas grandes y el de la subparcela contra la de las subparcelas.",
    "preguntas": [
      "¿Difieren tres variedades de avena (parcelas grandes) y cuatro dosis de nitrógeno (subparcelas), y depende la respuesta al nitrógeno de la variedad?",
      "¿Cómo afectan tres niveles de riego, aplicados a parcelas grandes por razones prácticas, al rendimiento de cuatro variedades de trigo?",
      "¿Interactúan el sistema de labranza (parcela grande), la fecha de siembra (subparcela) y el híbrido (sub-subparcela)?"
    ],
    "teoria": [
      "En un experimento en parcelas divididas un factor se aplica a parcelas grandes (el riego, la labranza o la variedad, que exigen superficies amplias) y el otro se sortea dentro de cada parcela grande, en subparcelas. Hay entonces dos tamaños de unidad experimental y dos errores: el de las parcelas grandes, casi siempre mayor y con pocos grados de libertad, y el de las subparcelas. El factor de la parcela grande se estima con menos precisión; el de la subparcela y la interacción, con más.",
      "El modelo mixto expresa esa estructura con efectos aleatorios: los bloques y la parcela grande dentro de cada bloque son aleatorios, y el residual es el error de las subparcelas. Con un tercer factor en sub-subparcelas se añade como aleatoria la subparcela dentro de la parcela grande y el bloque. Si las parcelas grandes se sortearon sin bloques, indicas la columna de repetición y el efecto aleatorio es la parcela grande dentro de su repetición.",
      "SigmaPro arma la fórmula, por ejemplo variedad * nitrogeno + (1 | bloque) + (1 | bloque:variedad), y la ajusta por REML en el motor R de tu navegador con lme4 y lmerTest; las columnas numéricas de los factores se toman como factor. Prueba los efectos fijos con F tipo III y grados de libertad de Satterthwaite o de Kenward-Roger, que asignan a cada efecto el error que le corresponde aun con subparcelas perdidas. Da además las varianzas de bloques, parcelas grandes y residual, la prueba de razón de verosimilitudes de cada efecto aleatorio, las medias marginales de cada factor con letras y los BLUP. Para comparar un factor dentro de cada nivel de otro, usa la opción «Dentro de cada nivel de» del mismo formulario."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\alpha_i + \\beta_j + (\\alpha\\beta)_{ij} + b_k + w_{ik} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "la respuesta del nivel i de la parcela grande y el nivel j de la subparcela en el bloque k"],
        ["\\alpha_i, \\beta_j, (\\alpha\\beta)_{ij}", "los efectos fijos de la parcela grande, de la subparcela y de su interacción"],
        ["b_k", "el efecto aleatorio del bloque k, con varianza \\sigma^2_b"],
        ["w_{ik}", "el efecto aleatorio de la parcela grande i del bloque k (error de las parcelas grandes), con varianza \\sigma^2_w"],
        ["\\varepsilon_{ijk}", "el error de las subparcelas, con varianza \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{algún } \\alpha_i \\ne 0", "texto": "El factor de la parcela grande no tiene efecto. Su F tiene pocos grados de libertad en el denominador porque depende de la variación entre parcelas grandes." },
      { "h0": "\\beta_1 = \\cdots = \\beta_b = 0", "h1": "\\text{algún } \\beta_j \\ne 0", "texto": "El factor de la subparcela no tiene efecto. Se prueba contra el error de las subparcelas." },
      { "h0": "(\\alpha\\beta)_{ij} = 0", "h1": "\\text{alguna } (\\alpha\\beta)_{ij} \\ne 0", "texto": "La respuesta al factor de la subparcela es la misma en todos los niveles de la parcela grande." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis muestra la prueba de Shapiro-Wilk de los residuos.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox) y vuelve a ajustar.", "alternativa": null },
      { "nombre": "Normalidad de los efectos aleatorios", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de un agrupamiento (dice cuál) cuando tiene 5 niveles o más.", "verificar": null, "siFalla": "Revisa las parcelas grandes o los bloques con efectos extremos y sus datos.", "alternativa": null },
      { "nombre": "Varianzas iguales", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos entre los niveles del factor de la parcela grande.", "verificar": null, "siFalla": "Prueba una transformación; si la varianza depende de la media por ser conteos o proporciones, usa un modelo generalizado mixto.", "alternativa": "glmm" },
      { "nombre": "Ajuste estable (no singular)", "como": "El semáforo marca en ámbar el ajuste singular, por ejemplo cuando la varianza entre parcelas grandes quedó en cero.", "verificar": null, "siFalla": "Con la varianza de parcelas grandes en cero, el modelo prueba el factor de la parcela grande contra el error de las subparcelas; el análisis clásico de parcelas divididas, que conserva el error de las parcelas grandes, es la referencia más conservadora.", "alternativa": "parcelas-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "variedad", "tipo": "factor con a niveles", "papel": "factor de la parcela grande" },
        { "nombre": "nitrogeno", "tipo": "factor con b niveles (las numéricas se toman como factor)", "papel": "factor de la subparcela" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloques (aleatorios); sin bloques, la repetición de cada parcela grande" }
      ],
      "minimo": "Al menos 3 bloques, mejor 4 o más: el error de las parcelas grandes tiene (r − 1)(a − 1) grados de libertad y con menos es muy impreciso.",
      "balance": "Tolera subparcelas perdidas: REML usa las filas completas y los grados de libertad de Satterthwaite o de Kenward-Roger se ajustan, sin estimar los datos faltantes.",
      "notaFormato": "Formato largo: una fila por subparcela, con columnas para el bloque, el factor de la parcela grande, el de la subparcela (y el de la sub-subparcela, si lo hay) y la respuesta.",
      "errores": [
        "Analizarlo como un factorial en bloques: usa un solo error y declara significativo el factor de la parcela grande con demasiada facilidad.",
        "Intercambiar los papeles: el factor de la parcela grande es el que se aplicó a las unidades grandes, no el que más te interesa.",
        "Sin bloques, no indicar la repetición que identifica cada parcela grande: el modelo no sabe qué subparcelas comparten parcela.",
        "Capturar las medias por parcela grande en lugar de una fila por subparcela."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y los avisos de ajuste singular.",
        "En el cuadro de efectos fijos, lee primero la interacción; si es significativa, las medias marginales de cada factor promedian sobre el otro: compara el factor de la subparcela dentro de cada nivel de la parcela grande con la opción «Dentro de cada nivel de».",
        "Lee la F del factor de la parcela grande sabiendo que tiene pocos grados de libertad en el denominador.",
        "Compara las varianzas de bloques, de parcelas grandes y residual, y sus pruebas de razón de verosimilitudes.",
        "Compara las medias marginales con sus letras."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El nitrógeno aumentó el rendimiento (F(3, 45) = 35.2, p < 0.001), sin diferencias entre variedades (F(2, 10) = 1.6, p = 0.25) ni interacción variedad × nitrógeno (F(6, 45) = 0.4, p = 0.88; grados de libertad de Satterthwaite). La varianza entre parcelas grandes fue de 110 y la de las subparcelas de 170».",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada"]
    },
    "limitaciones": [
      "Si los dos factores se aplican en franjas que se cruzan, el diseño es de parcelas en franjas: usa ese análisis.",
      "No admite parcelas grandes en cuadro latino; el análisis clásico de parcelas divididas sí tiene esa opción.",
      "Con pocos bloques, la varianza de las parcelas grandes puede quedar en cero (ajuste singular).",
      "Si la subparcela es el tiempo (la misma parcela medida en varias fechas), la correlación entre fechas no es constante: usa medidas repetidas."
    ],
    "referencias": [
      "Yates, F. (1935). Complex experiments. Supplement to the Journal of the Royal Statistical Society, 2(2), 181–247.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Kenward, M. G., & Roger, J. H. (1997). Small sample inference for fixed effects from restricted maximum likelihood. Biometrics, 53(3), 983–997."
    ]
  },
  "en": {
    "alias": ["Split plot with a mixed model", "Split-split plot with a mixed model", "Mixed-model split plot"],
    "paraQue": "Analyzes split plots (or split-split plots) as a mixed model: the main-plot factor is tested against the variation among main plots and the subplot factor against that of the subplots.",
    "preguntas": [
      "Do three oat varieties (main plots) and four nitrogen rates (subplots) differ, and does the response to nitrogen depend on the variety?",
      "How do three irrigation levels, applied to main plots for practical reasons, affect the yield of four wheat varieties?",
      "Do the tillage system (main plot), sowing date (subplot) and hybrid (sub-subplot) interact?"
    ],
    "teoria": [
      "In a split-plot experiment one factor is applied to main plots (irrigation, tillage or variety, which require large areas) and the other is randomized within each main plot, in subplots. There are then two sizes of experimental unit and two errors: that of the main plots, usually larger and with few degrees of freedom, and that of the subplots. The main-plot factor is estimated less precisely; the subplot factor and the interaction, more precisely.",
      "The mixed model expresses that structure with random effects: blocks and the main plot within each block are random, and the residual is the subplot error. With a third factor in sub-subplots, the subplot within the main plot and block is added as random. If the main plots were randomized without blocks, you give the replicate column and the random effect is the main plot within its replicate.",
      "SigmaPro builds the formula, for example variedad * nitrogeno + (1 | bloque) + (1 | bloque:variedad), and fits it by REML in the R engine inside your browser with lme4 and lmerTest; numeric factor columns are taken as factors. It tests the fixed effects with type III F tests and Satterthwaite or Kenward-Roger degrees of freedom, which assign each effect its proper error even with lost subplots. It also gives the block, main-plot and residual variances, the likelihood ratio test of each random effect, the marginal means of each factor with letters and the BLUPs. To compare one factor within each level of another, use the “Within each level of” option in the same form."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\alpha_i + \\beta_j + (\\alpha\\beta)_{ij} + b_k + w_{ik} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "the response of main-plot level i and subplot level j in block k"],
        ["\\alpha_i, \\beta_j, (\\alpha\\beta)_{ij}", "the fixed effects of the main plot, the subplot and their interaction"],
        ["b_k", "the random effect of block k, with variance \\sigma^2_b"],
        ["w_{ik}", "the random effect of main plot i in block k (main-plot error), with variance \\sigma^2_w"],
        ["\\varepsilon_{ijk}", "the subplot error, with variance \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\alpha_1 = \\cdots = \\alpha_a = 0", "h1": "\\text{some } \\alpha_i \\ne 0", "texto": "The main-plot factor has no effect. Its F has few denominator degrees of freedom because it depends on the variation among main plots." },
      { "h0": "\\beta_1 = \\cdots = \\beta_b = 0", "h1": "\\text{some } \\beta_j \\ne 0", "texto": "The subplot factor has no effect. It is tested against the subplot error." },
      { "h0": "(\\alpha\\beta)_{ij} = 0", "h1": "\\text{some } (\\alpha\\beta)_{ij} \\ne 0", "texto": "The response to the subplot factor is the same at every main-plot level." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist shows the Shapiro-Wilk test of the residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox) and refit.", "alternativa": null },
      { "nombre": "Normality of random effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of one grouping (it says which) when it has 5 levels or more.", "verificar": null, "siFalla": "Check the main plots or blocks with extreme effects and their data.", "alternativa": null },
      { "nombre": "Equal variances", "como": "The assumptions checklist applies Levene’s test (with the median) to the residuals across the levels of the main-plot factor.", "verificar": null, "siFalla": "Try a transformation; if the variance depends on the mean because the data are counts or proportions, use a generalized linear mixed model.", "alternativa": "glmm" },
      { "nombre": "Stable (nonsingular) fit", "como": "The assumptions checklist flags a singular fit in amber, for example when the main-plot variance ended up at zero.", "verificar": null, "siFalla": "With the main-plot variance at zero, the model tests the main-plot factor against the subplot error; the classical split-plot analysis, which keeps the main-plot error, is the more conservative reference.", "alternativa": "parcelas-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "variedad", "tipo": "factor with a levels", "papel": "main-plot factor" },
        { "nombre": "nitrogeno", "tipo": "factor with b levels (numeric columns are taken as factors)", "papel": "subplot factor" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "blocks (random); without blocks, the replicate of each main plot" }
      ],
      "minimo": "At least 3 blocks, better 4 or more: the main-plot error has (r − 1)(a − 1) degrees of freedom and with fewer it is very imprecise.",
      "balance": "It tolerates lost subplots: REML uses the complete rows and the Satterthwaite or Kenward-Roger degrees of freedom adjust, without estimating the missing data.",
      "notaFormato": "Long format: one row per subplot, with columns for the block, the main-plot factor, the subplot factor (and the sub-subplot factor, if any) and the response.",
      "errores": [
        "Analyzing it as a factorial in blocks: it uses a single error and declares the main-plot factor significant too easily.",
        "Swapping the roles: the main-plot factor is the one applied to the large units, not the one you care about most.",
        "Without blocks, not giving the replicate that identifies each main plot: the model cannot tell which subplots share a main plot.",
        "Entering the means per main plot instead of one row per subplot."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and any singular-fit warnings.",
        "In the fixed-effects table, read the interaction first; if it is significant, the marginal means of each factor average over the other: compare the subplot factor within each main-plot level with the “Within each level of” option.",
        "Read the F of the main-plot factor knowing that it has few denominator degrees of freedom.",
        "Compare the block, main-plot and residual variances and their likelihood ratio tests.",
        "Compare the marginal means with their letters."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Nitrogen increased yield (F(3, 45) = 35.2, p < 0.001), with no differences among varieties (F(2, 10) = 1.6, p = 0.25) and no variety × nitrogen interaction (F(6, 45) = 0.4, p = 0.88; Satterthwaite degrees of freedom). The main-plot variance was 110 and the subplot variance 170.”",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada"]
    },
    "limitaciones": [
      "If the two factors are applied in crossing strips, the design is a strip plot: use that analysis.",
      "It does not allow main plots in a Latin square; the classical split-plot analysis has that option.",
      "With few blocks, the main-plot variance may end up at zero (singular fit).",
      "If the subplot is time (the same plot measured on several dates), the correlation between dates is not constant: use repeated measures."
    ],
    "referencias": [
      "Yates, F. (1935). Complex experiments. Supplement to the Journal of the Royal Statistical Society, 2(2), 181–247.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Kenward, M. G., & Roger, J. H. (1997). Small sample inference for fixed effects from restricted maximum likelihood. Biometrics, 53(3), 983–997."
    ]
  }
});
