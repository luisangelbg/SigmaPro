SP_FICHA({
  "id": "ancova",
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["dbca", "dca", "medias-ajustadas", "modelo-lineal", "regresion-lineal", "comparaciones-medias"],
  "ejemplo": { "conjunto": "sorgo", "entradas": { "respuesta": "rend", "tratamientos": ["variedad"], "bloque": "bloque", "covariables": ["plantas"] }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "variedad", "plantas", "rend"], ["1", "Línea 1", "98", "3.83"], ["1", "Línea 2", "101", "3.35"], ["1", "Línea 3", "115", "3.34"], ["1", "Línea 4", "114", "3.97"], ["1", "Línea 5", "120", "3.85"], ["1", "Testigo", "118", "3.42"], ["2", "Línea 1", "133", "4.6"]],
    "ancho": null
  },
  "es": {
    "alias": ["ANCOVA", "Análisis de covarianza", "Análisis de covariancia", "Ajuste por covariable"],
    "paraQue": "Compara tratamientos quitando el efecto de una variable medida en cada parcela que no controlaste y que influye en la respuesta, como el número de plantas.",
    "preguntas": [
      "¿Difieren las variedades de sorgo en rendimiento una vez ajustado por el número de plantas cosechadas en cada parcela?",
      "¿Difieren tres fungicidas en la severidad final de la roya, ajustando por la severidad medida antes de aplicarlos?",
      "¿Gana precisión un ensayo de fertilización si se ajusta por la materia orgánica inicial de cada parcela?"
    ],
    "teoria": [
      "A veces una característica de cada parcela, medida pero no controlada, influye en la respuesta: el número de plantas logradas, la severidad inicial de una enfermedad, el peso al inicio. Si no se toma en cuenta queda en el error y, si por azar algún tratamiento tuvo valores altos, su media sale favorecida. El análisis de covarianza combina el análisis de varianza con una regresión: el modelo incluye los tratamientos, los bloques (si los hay) y una pendiente común de la respuesta sobre la covariable.",
      "Con esa pendiente, las medias se ajustan a lo que valdría cada tratamiento si todas las parcelas tuvieran la covariable en su media general, ȳᵢ − b(x̄ᵢ − x̄). El error también se reduce, porque la parte de la variación que explica la covariable sale de él. SigmaPro acepta uno o dos factores de tratamiento cruzados, en completamente al azar o en bloques, y una o dos covariables. Da el análisis de covarianza con sumas de cuadrados tipo III (o II o I), la pendiente común con su intervalo, las medias ajustadas con su error estándar, su intervalo y sus letras (Tukey u otro método), las medias sin ajustar y las de la covariable, el CV y, con una covariable, la eficiencia relativa de Cochran y Cox, que dice a cuántas veces las repeticiones del análisis sin covariable equivale el ajuste.",
      "Dos condiciones deciden si el ajuste es válido, y SigmaPro las prueba en el semáforo: que la pendiente sea la misma en todos los tratamientos y que la covariable no dependa de ellos. Si los tratamientos cambiaron la covariable, ajustar por ella quita parte del efecto que quieres medir."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\beta_j + \\gamma (x_{ij} - \\bar{x}) + \\varepsilon_{ij}, \\quad \\hat{\\mu}_i = \\bar{y}_i - \\hat{\\gamma} (\\bar{x}_i - \\bar{x})",
      "terminos": [
        ["y_{ij}", "la respuesta del tratamiento i en el bloque j"],
        ["\\tau_i", "el efecto del tratamiento i (con dos factores: efectos principales e interacción)"],
        ["\\beta_j", "el efecto del bloque j (no va en completamente al azar)"],
        ["\\gamma", "la pendiente común de la respuesta sobre la covariable"],
        ["x_{ij}, \\bar{x}", "la covariable en la parcela y su media general"],
        ["\\hat{\\mu}_i", "la media ajustada del tratamiento i, con la covariable llevada a su media"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos no difieren una vez ajustados por la covariable: F de tratamientos del análisis de covarianza." },
      { "h0": "\\gamma = 0", "h1": "\\gamma \\ne 0", "texto": "La covariable no se relaciona con la respuesta; si no es significativa, el ajuste casi no cambia las medias ni gana precisión." },
      { "h0": "\\gamma_1 = \\gamma_2 = \\cdots = \\gamma_t", "h1": "\\text{alguna pendiente difiere}", "texto": "Homogeneidad de pendientes: compara el modelo de pendiente común con uno de una pendiente por tratamiento." }
    ],
    "supuestos": [
      { "nombre": "Pendientes iguales en todos los tratamientos", "como": "Semáforo «Pendientes iguales»: F que compara la pendiente común con una pendiente por tratamiento (también por la interacción si hay dos factores).", "verificar": null, "siFalla": "La diferencia entre tratamientos cambia con la covariable y las medias ajustadas valen solo en su media: ajusta pendientes distintas en el modelo lineal general (por ejemplo, bloque + variedad * plantas). Sus medias marginales quedan en la media de la covariable; para comparar en otro valor, céntrala en ese valor con una variable calculada en Datos y lee los coeficientes de los tratamientos.", "alternativa": "modelo-lineal" },
      { "nombre": "Covariable no afectada por los tratamientos", "como": "Semáforo «Covariable no afectada por los tratamientos»: análisis de varianza de la covariable con el mismo diseño.", "verificar": null, "siFalla": "Usa como covariable solo lo que se midió antes de aplicar los tratamientos o lo que estos no pueden cambiar; si no, analiza el diseño sin covariable.", "alternativa": "dbca" },
      { "nombre": "Relación lineal entre la respuesta y la covariable", "como": "Revisa la gráfica de la respuesta contra la covariable, con una recta paralela por tratamiento.", "verificar": null, "siFalla": "Si la relación es curva, transforma la covariable (por ejemplo, con su logaritmo) en Datos.", "alternativa": null },
      { "nombre": "Normalidad y varianza constante de los residuos", "como": "El semáforo de la ANCOVA no las prueba; como aproximación, revisa los residuos del diseño sin covariable en «Revisar los supuestos del modelo» y la dispersión de la gráfica.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en Datos); para conteos o proporciones usa un modelo lineal generalizado con la covariable en la fórmula.", "alternativa": "glm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "variedad", "tipo": "factor con k niveles", "papel": "tratamientos (1 o 2 factores cruzados)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (opcional)" },
        { "nombre": "plantas", "tipo": "conteo", "papel": "covariable (1 o 2, numéricas)" }
      ],
      "minimo": "Al menos 3 repeticiones por tratamiento; cada covariable consume un grado de libertad del error, así que conviene que el error tenga 10 o más. La covariable debe variar dentro de cada tratamiento.",
      "balance": "Las filas con faltantes en la respuesta, la covariable o los factores no entran. Con celdas vacías no existen las sumas de cuadrados tipo III: SigmaPro usa las de tipo II y lo avisa. Si la covariable es constante dentro de los bloques o los tratamientos, queda confundida con ellos y no se puede ajustar.",
      "notaFormato": "Formato largo: una fila por parcela con el bloque, el tratamiento, la covariable y la respuesta. La covariable se mide en la misma parcela que la respuesta.",
      "errores": [
        "Usar como covariable algo que los tratamientos modificaron (por ejemplo, la altura final de la planta al comparar fertilizantes).",
        "Ajustar por una covariable medida en otra unidad (el promedio del bloque) en lugar de la de cada parcela.",
        "Reportar las medias sin ajustar como si fueran las del análisis.",
        "Seguir con la ANCOVA cuando las pendientes difieren entre tratamientos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: pendientes iguales y covariable no afectada por los tratamientos.",
        "Lee la pendiente común: si no es significativa, el ajuste casi no cambia las medias ni gana precisión.",
        "En el cuadro de análisis de covarianza, lee la F de los tratamientos ajustados (y la interacción, si hay dos factores).",
        "Compara las medias ajustadas con sus letras, frente a las medias sin ajustar y las de la covariable.",
        "Mira el CV y la eficiencia relativa para saber cuánto ganaste con la covariable."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Ajustado por el número de plantas cosechadas (pendiente común = 0.025 t/ha por planta, p < 0.001), el rendimiento difirió entre variedades (F(5, 14) = 28.4, p < 0.001). Las pendientes fueron homogéneas (p = 0.62) y el número de plantas no dependió de la variedad (p = 0.30). La covarianza fue 5.5 veces más eficiente que el análisis sin covariable».",
      "guias": ["F", "p", "media-ajustada", "coeficiente", "eficiencia", "cv"]
    },
    "limitaciones": [
      "Admite hasta dos factores de tratamiento y dos covariables, en completamente al azar o en bloques; para otros diseños o para pendientes distintas usa el modelo lineal general.",
      "Con pendientes distintas no hay una sola diferencia entre tratamientos: compáralos a varios valores de la covariable.",
      "Si la respuesta es un conteo o una proporción, usa un modelo lineal generalizado.",
      "La covariable corrige diferencias que ocurrieron por azar; no sustituye un buen diseño ni un bloqueo bien hecho."
    ],
    "referencias": [
      "Cochran, W. G. (1957). Analysis of covariance: Its nature and uses. Biometrics, 13(3), 261–281.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Milliken, G. A., & Johnson, D. E. (2002). Analysis of messy data: Vol. 3. Analysis of covariance. Chapman & Hall/CRC."
    ]
  },
  "en": {
    "alias": ["ANCOVA", "Analysis of covariance", "Covariance analysis", "Covariate adjustment"],
    "paraQue": "Compares treatments removing the effect of a variable measured in each plot that you did not control and that influences the response, such as the number of plants.",
    "preguntas": [
      "Do sorghum varieties differ in yield once adjusted for the number of plants harvested in each plot?",
      "Do three fungicides differ in final rust severity, adjusting for the severity measured before applying them?",
      "Does a fertilization trial gain precision if it is adjusted for the initial organic matter of each plot?"
    ],
    "teoria": [
      "Sometimes a characteristic of each plot, measured but not controlled, influences the response: the number of established plants, the initial severity of a disease, the starting weight. If it is not taken into account it stays in the error and, if by chance some treatment had high values, its mean is favored. Analysis of covariance combines the analysis of variance with a regression: the model includes the treatments, the blocks (if any) and a common slope of the response on the covariate.",
      "With that slope, the means are adjusted to what each treatment would be worth if every plot had the covariate at its overall mean, ȳᵢ − b(x̄ᵢ − x̄). The error is also reduced, because the part of the variation explained by the covariate is removed from it. SigmaPro accepts one or two crossed treatment factors, in a completely randomized design or in blocks, and one or two covariates. It gives the analysis of covariance with type III (or II or I) sums of squares, the common slope with its interval, the adjusted means with their standard error, interval and letters (Tukey or another method), the unadjusted means and those of the covariate, the CV and, with one covariate, Cochran and Cox’s relative efficiency, which tells how many times the replicates of the analysis without covariate the adjustment is worth.",
      "Two conditions decide whether the adjustment is valid, and SigmaPro tests them in the checklist: that the slope is the same in all treatments and that the covariate does not depend on them. If the treatments changed the covariate, adjusting for it removes part of the effect you want to measure."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\beta_j + \\gamma (x_{ij} - \\bar{x}) + \\varepsilon_{ij}, \\quad \\hat{\\mu}_i = \\bar{y}_i - \\hat{\\gamma} (\\bar{x}_i - \\bar{x})",
      "terminos": [
        ["y_{ij}", "the response of treatment i in block j"],
        ["\\tau_i", "the effect of treatment i (with two factors: main effects and interaction)"],
        ["\\beta_j", "the effect of block j (absent in a completely randomized design)"],
        ["\\gamma", "the common slope of the response on the covariate"],
        ["x_{ij}, \\bar{x}", "the covariate in the plot and its overall mean"],
        ["\\hat{\\mu}_i", "the adjusted mean of treatment i, with the covariate brought to its mean"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments do not differ once adjusted for the covariate: treatment F of the analysis of covariance." },
      { "h0": "\\gamma = 0", "h1": "\\gamma \\ne 0", "texto": "The covariate is not related to the response; if it is not significant, the adjustment barely changes the means or gains precision." },
      { "h0": "\\gamma_1 = \\gamma_2 = \\cdots = \\gamma_t", "h1": "\\text{some slope differs}", "texto": "Homogeneity of slopes: compares the common-slope model with one with a slope per treatment." }
    ],
    "supuestos": [
      { "nombre": "Equal slopes in all treatments", "como": "Checklist item “Equal slopes”: F comparing the common slope with one slope per treatment (also per interaction if there are two factors).", "verificar": null, "siFalla": "The difference between treatments changes with the covariate and the adjusted means hold only at its mean: fit different slopes in the general linear model (for example, bloque + variedad * plantas). Its marginal means stay at the covariate mean; to compare at another value, center the covariate on that value with a computed variable in Data and read the treatment coefficients.", "alternativa": "modelo-lineal" },
      { "nombre": "Covariate not affected by the treatments", "como": "Checklist item “Covariate not affected by the treatments”: analysis of variance of the covariate with the same design.", "verificar": null, "siFalla": "Use as a covariate only what was measured before applying the treatments or what they cannot change; otherwise, analyze the design without a covariate.", "alternativa": "dbca" },
      { "nombre": "Linear relationship between response and covariate", "como": "Check the plot of the response against the covariate, with one parallel line per treatment.", "verificar": null, "siFalla": "If the relationship is curved, transform the covariate (for example, with its logarithm) in Data.", "alternativa": null },
      { "nombre": "Normality and constant variance of residuals", "como": "The ANCOVA checklist does not test them; as an approximation, check the residuals of the design without covariate in “Check the model assumptions” and the spread in the plot.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in Data); for counts or proportions use a generalized linear model with the covariate in the formula.", "alternativa": "glm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "variedad", "tipo": "factor with k levels", "papel": "treatments (1 or 2 crossed factors)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (optional)" },
        { "nombre": "plantas", "tipo": "count", "papel": "covariate (1 or 2, numeric)" }
      ],
      "minimo": "At least 3 replicates per treatment; each covariate uses up one error degree of freedom, so the error should have 10 or more. The covariate must vary within each treatment.",
      "balance": "Rows with missing values in the response, the covariate or the factors are left out. With empty cells type III sums of squares do not exist: SigmaPro uses type II and says so. If the covariate is constant within blocks or treatments, it is confounded with them and cannot be adjusted.",
      "notaFormato": "Long format: one row per plot with the block, the treatment, the covariate and the response. The covariate is measured on the same plot as the response.",
      "errores": [
        "Using as a covariate something the treatments modified (for example, final plant height when comparing fertilizers).",
        "Adjusting for a covariate measured on another unit (the block average) instead of that of each plot.",
        "Reporting the unadjusted means as if they were those of the analysis.",
        "Going on with ANCOVA when the slopes differ among treatments."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist: equal slopes and covariate not affected by the treatments.",
        "Read the common slope: if it is not significant, the adjustment barely changes the means or gains precision.",
        "In the analysis of covariance table, read the F of the adjusted treatments (and the interaction, if there are two factors).",
        "Compare the adjusted means and their letters with the unadjusted means and those of the covariate.",
        "Look at the CV and the relative efficiency to know how much you gained with the covariate."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Adjusted for the number of plants harvested (common slope = 0.025 t/ha per plant, p < 0.001), yield differed among varieties (F(5, 14) = 28.4, p < 0.001). Slopes were homogeneous (p = 0.62) and plant number did not depend on variety (p = 0.30). The covariance analysis was 5.5 times as efficient as the analysis without covariate.”",
      "guias": ["F", "p", "media-ajustada", "coeficiente", "eficiencia", "cv"]
    },
    "limitaciones": [
      "It accepts up to two treatment factors and two covariates, in a completely randomized design or in blocks; for other designs or for different slopes use the general linear model.",
      "With different slopes there is no single difference between treatments: compare them at several covariate values.",
      "If the response is a count or a proportion, use a generalized linear model.",
      "The covariate corrects differences that arose by chance; it does not replace a good design or well-made blocking."
    ],
    "referencias": [
      "Cochran, W. G. (1957). Analysis of covariance: Its nature and uses. Biometrics, 13(3), 261–281.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Milliken, G. A., & Johnson, D. E. (2002). Analysis of messy data: Vol. 3. Analysis of covariance. Chapman & Hall/CRC."
    ]
  }
});
