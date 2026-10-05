SP_FICHA({
  "id": "glm-gamma",
  "familia": "generalizados",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": ["dca", "dbca"],
  "relacionados": ["glm", "glm-conteos", "dca", "dbca", "glmm", "kaplan-meier"],
  "ejemplo": { "conjunto": "venenos", "entradas": { "respuesta": "tiempo", "tratamientos": ["veneno", "tratamiento"] }, "opciones": { "familia": "gamma", "enlace": "log" } },
  "formato": {
    "largo": [["veneno", "tratamiento", "tiempo"], ["I", "A", "0.31"], ["I", "A", "0.45"], ["I", "A", "0.46"], ["I", "A", "0.43"], ["I", "B", "0.82"], ["I", "B", "1.1"], ["I", "B", "0.88"]],
    "ancho": null
  },
  "es": {
    "alias": ["GLM gamma", "Regresión gamma", "GLM gaussiano inverso"],
    "paraQue": "Compara tratamientos cuando la respuesta es positiva y asimétrica (tiempos, concentraciones, pesos) y su variación crece con la media.",
    "preguntas": [
      "¿Cuánto tardan en morir los insectos expuestos a tres venenos y cuatro antídotos, y depende el efecto del antídoto del veneno?",
      "¿Cambia la concentración de nitratos en el fruto con el tipo de fertilizante, si los valores altos varían mucho más que los bajos?",
      "¿Difieren en días a floración las variedades de frijol sembradas en bloques, si todas las plantas llegaron a florecer?"
    ],
    "teoria": [
      "Muchas respuestas agronómicas son positivas, tienen una cola larga hacia la derecha y varían más cuando su media es mayor: el tiempo a la muerte de un insecto, la concentración de un residuo, el peso de un fruto. En el análisis de varianza esto rompe el supuesto de varianza constante; la salida usual es transformar con logaritmo o con el inverso, pero entonces las medias se informan en otra escala.",
      "El modelo gamma supone que la desviación estándar es proporcional a la media: el coeficiente de variación es el mismo en todos los tratamientos y la varianza es φμ². Con el enlace logarítmico (el de omisión en este análisis), los efectos son multiplicativos y las medias se informan en la escala original: «el antídoto B duplica el tiempo de supervivencia». También puedes elegir el enlace inverso (el canónico), la identidad o uno de potencia. La familia gaussiana inversa, en la misma opción, sirve cuando la varianza crece todavía más rápido, como μ³.",
      "Como la dispersión φ se estima con los residuos de Pearson, los términos se prueban con F = (cambio de devianza / gl) / φ en un análisis de devianza tipo II (o I o III), y los coeficientes con t. Los datos de venenos de Box y Cox (1964), un clásico del tema, lo muestran bien: en la escala original la varianza crece con la media, y el modelo gamma lo absorbe sin transformar la respuesta."
    ],
    "modelo": {
      "tex": "\\log(\\mu_{ij}) = \\alpha + \\tau_i + \\beta_j, \\quad \\mathrm{Var}(y_{ij}) = \\phi \\mu_{ij}^{2}",
      "terminos": [
        ["y_{ij}", "la respuesta positiva (tiempo, concentración) del tratamiento i en el bloque j"],
        ["\\mu_{ij}", "su media"],
        ["\\alpha", "el intercepto: el logaritmo de la media del primer tratamiento (en el primer bloque)"],
        ["\\tau_i", "el efecto del tratamiento i en escala logarítmica (con dos o tres factores: efectos principales e interacciones); su exponencial es una razón de medias"],
        ["\\beta_j", "el efecto del bloque j (opcional)"],
        ["\\phi", "la dispersión: el cuadrado del coeficiente de variación; se estima con los residuos de Pearson"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma media. Se prueba con F = (cambio de devianza al quitar el término / gl) / φ; con factores cruzados, una prueba por efecto principal y por interacción." }
    ],
    "supuestos": [
      { "nombre": "Desviación estándar proporcional a la media (coeficiente de variación constante)", "como": "Gráfica de residuos de Pearson contra valores ajustados: la nube debe tener el mismo ancho a lo largo del eje. El semáforo solo informa la dispersión φ estimada.", "verificar": null, "siFalla": "Si la nube todavía se abre hacia los valores altos, prueba la gaussiana inversa; si la varianza no cambia con la media, basta un análisis de varianza.", "alternativa": "dca" },
      { "nombre": "Respuesta estrictamente positiva", "como": "SigmaPro lo revisa y se detiene si hay ceros o negativos.", "verificar": null, "siFalla": "Si hay ceros reales, suma una constante pequeña en Datos o analiza por separado la presencia y la cantidad.", "alternativa": null },
      { "nombre": "Efectos multiplicativos (enlace adecuado)", "como": "Residuos de Pearson contra ajustados sin curvatura; el AIC compara enlaces con los mismos datos.", "verificar": null, "siFalla": "Prueba el enlace inverso o la identidad, o agrega la interacción entre factores.", "alternativa": null },
      { "nombre": "Independencia y tiempos completos", "como": "La da el diseño; cada tiempo debe haberse observado hasta el evento.", "verificar": null, "siFalla": "Si algunas unidades seguían vivas o sin florecer al terminar, los tiempos están censurados: usa los métodos de supervivencia.", "alternativa": "kaplan-meier" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "numérica continua positiva", "papel": "respuesta" },
        { "nombre": "veneno, tratamiento", "tipo": "factor con k niveles (1 a 3 factores)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles (opcional)", "papel": "bloque" },
        { "nombre": "covariables", "tipo": "numérica continua (hasta 2, opcional)", "papel": "covariables" }
      ],
      "minimo": "Al menos 3 o 4 repeticiones por combinación de tratamientos; el ejemplo tiene 4 en cada una de las 12 combinaciones (48 filas).",
      "balance": "Las filas con faltantes se quitan; con desbalance, el análisis de devianza tipo II (o III) y las medias marginales siguen siendo válidos.",
      "notaFormato": "Formato largo: una fila por unidad experimental, con una columna por factor y la respuesta en su escala original, sin transformar.",
      "errores": [
        "Transformar la respuesta (logaritmo, inverso) antes de ajustar el modelo gamma: el enlace ya hace ese trabajo y así las medias quedan en la escala original.",
        "Incluir ceros: la familia gamma solo admite valores positivos.",
        "Usar como completos los tiempos de unidades que no llegaron al evento al terminar el ensayo (censura).",
        "Promediar las repeticiones antes del análisis: sin ellas no se puede estimar la dispersión."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo (dispersión, atípicos, convergencia) y la gráfica de residuos de Pearson contra valores ajustados.",
        "En el análisis de devianza, lee primero la interacción; si no es significativa, lee la F de cada factor.",
        "Lee la media estimada de cada nivel con su intervalo, en la escala original, y sus letras; con interacción, compara un factor «Dentro de cada nivel de» el otro.",
        "Las razones de las comparaciones por pares y de los coeficientes dicen cuántas veces es mayor la media de un nivel que la del otro."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El tiempo de supervivencia se analizó con un modelo gamma con enlace logarítmico. Difirió entre venenos (F(2, 36) = 48.9, p < 0.001) y entre antídotos (F(3, 36) = 23.7, p < 0.001), sin interacción (F(6, 36) = 1.5, p = 0.19). Con el antídoto B el tiempo medio fue 2.1 veces el del antídoto A».",
      "guias": ["devianza", "F", "dispersion", "razon-medias", "ic"]
    },
    "limitaciones": [
      "Si la varianza no cambia con la media, el análisis de varianza común (completamente al azar o en bloques) es más sencillo y lleva a lo mismo.",
      "Con tiempos censurados usa los métodos de supervivencia (Kaplan-Meier o Cox).",
      "Con bloques que son una muestra o mediciones repetidas, el modelo mixto generalizado admite la familia gamma con interceptos aleatorios.",
      "Los pocos valores muy cercanos a cero pesan mucho en la gamma: revisa los atípicos del semáforo."
    ],
    "referencias": [
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Dunn, P. K., & Smyth, G. K. (2018). Generalized linear models with examples in R. Springer.",
      "Myers, R. H., Montgomery, D. C., Vining, G. G., & Robinson, T. J. (2010). Generalized linear models: With applications in engineering and the sciences (2nd ed.). Wiley.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  },
  "en": {
    "alias": ["Gamma GLM", "Gamma regression", "Inverse Gaussian GLM"],
    "paraQue": "Compares treatments when the response is positive and skewed (times, concentrations, weights) and its variation grows with the mean.",
    "preguntas": [
      "How long do insects exposed to three poisons and four antidotes take to die, and does the antidote effect depend on the poison?",
      "Does the nitrate concentration in the fruit change with the type of fertilizer, if high values vary much more than low ones?",
      "Do bean varieties sown in blocks differ in days to flowering, if all plants flowered?"
    ],
    "teoria": [
      "Many agronomic responses are positive, have a long right tail and vary more when their mean is larger: the time to death of an insect, the concentration of a residue, the weight of a fruit. In the analysis of variance this breaks the constant-variance assumption; the usual way out is a log or reciprocal transformation, but then the means are reported on another scale.",
      "The gamma model assumes that the standard deviation is proportional to the mean: the coefficient of variation is the same in every treatment and the variance is φμ². With the log link (the default in this analysis), effects are multiplicative and means are reported on the original scale: “antidote B doubles the survival time”. You can also choose the inverse link (the canonical one), the identity or a power link. The inverse Gaussian family, in the same option, fits when the variance grows even faster, like μ³.",
      "Because the dispersion φ is estimated from the Pearson residuals, the terms are tested with F = (change in deviance / df) / φ in a type II analysis of deviance (or I or III), and the coefficients with t. The poisons data of Box and Cox (1964), a classic on this topic, show it well: on the original scale the variance grows with the mean, and the gamma model absorbs it without transforming the response."
    ],
    "modelo": {
      "tex": "\\log(\\mu_{ij}) = \\alpha + \\tau_i + \\beta_j, \\quad \\mathrm{Var}(y_{ij}) = \\phi \\mu_{ij}^{2}",
      "terminos": [
        ["y_{ij}", "the positive response (time, concentration) of treatment i in block j"],
        ["\\mu_{ij}", "its mean"],
        ["\\alpha", "the intercept: the log of the mean of the first treatment (in the first block)"],
        ["\\tau_i", "the effect of treatment i on the log scale (with two or three factors: main effects and interactions); its exponential is a ratio of means"],
        ["\\beta_j", "the effect of block j (optional)"],
        ["\\phi", "the dispersion: the square of the coefficient of variation; estimated from the Pearson residuals"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean. Tested with F = (change in deviance when the term is dropped / df) / φ; with crossed factors, one test per main effect and per interaction." }
    ],
    "supuestos": [
      { "nombre": "Standard deviation proportional to the mean (constant coefficient of variation)", "como": "Plot of Pearson residuals vs. fitted values: the cloud should have the same width along the axis. The checklist only reports the estimated dispersion φ.", "verificar": null, "siFalla": "If the cloud still fans out toward high values, try the inverse Gaussian; if the variance does not change with the mean, an analysis of variance is enough.", "alternativa": "dca" },
      { "nombre": "Strictly positive response", "como": "SigmaPro checks it and stops if there are zeros or negative values.", "verificar": null, "siFalla": "If there are true zeros, add a small constant in Data or analyze presence and amount separately.", "alternativa": null },
      { "nombre": "Multiplicative effects (suitable link)", "como": "Pearson residuals vs. fitted values without curvature; the AIC compares links on the same data.", "verificar": null, "siFalla": "Try the inverse or identity link, or add the interaction between factors.", "alternativa": null },
      { "nombre": "Independence and complete times", "como": "It comes from the design; every time must have been observed until the event.", "verificar": null, "siFalla": "If some units were still alive or had not flowered when the trial ended, the times are censored: use the survival methods.", "alternativa": "kaplan-meier" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "positive continuous numeric", "papel": "response" },
        { "nombre": "veneno, tratamiento", "tipo": "factor with k levels (1 to 3 factors)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels (optional)", "papel": "block" },
        { "nombre": "covariates", "tipo": "continuous numeric (up to 2, optional)", "papel": "covariates" }
      ],
      "minimo": "At least 3 or 4 replicates per treatment combination; the example has 4 in each of the 12 combinations (48 rows).",
      "balance": "Rows with missing values are dropped; with imbalance, the type II (or III) analysis of deviance and the marginal means remain valid.",
      "notaFormato": "Long format: one row per experimental unit, with one column per factor and the response on its original scale, untransformed.",
      "errores": [
        "Transforming the response (log, reciprocal) before fitting the gamma model: the link already does that job, and this way the means stay on the original scale.",
        "Including zeros: the gamma family only accepts positive values.",
        "Treating as complete the times of units that had not reached the event when the trial ended (censoring).",
        "Averaging the replicates before the analysis: without them the dispersion cannot be estimated."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist (dispersion, outliers, convergence) and the plot of Pearson residuals vs. fitted values.",
        "In the analysis of deviance, read the interaction first; if it is not significant, read the F of each factor.",
        "Read the estimated mean of each level with its interval, on the original scale, and its letters; with an interaction, compare one factor “Within each level of” the other.",
        "The ratios in the pairwise comparisons and in the coefficients tell how many times larger the mean of one level is than that of the other."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Survival time was analyzed with a gamma model with a log link. It differed among poisons (F(2, 36) = 48.9, p < 0.001) and among antidotes (F(3, 36) = 23.7, p < 0.001), with no interaction (F(6, 36) = 1.5, p = 0.19). With antidote B the mean time was 2.1 times that with antidote A.”",
      "guias": ["devianza", "F", "dispersion", "razon-medias", "ic"]
    },
    "limitaciones": [
      "If the variance does not change with the mean, the ordinary analysis of variance (completely randomized or in blocks) is simpler and leads to the same result.",
      "With censored times use the survival methods (Kaplan-Meier or Cox).",
      "With blocks that are a sample or repeated measurements, the generalized mixed model accepts the gamma family with random intercepts.",
      "The few values very close to zero weigh a lot in the gamma: check the outliers in the checklist."
    ],
    "referencias": [
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Dunn, P. K., & Smyth, G. K. (2018). Generalized linear models with examples in R. Springer.",
      "Myers, R. H., Montgomery, D. C., Vining, G. G., & Robinson, T. J. (2010). Generalized linear models: With applications in engineering and the sciences (2nd ed.). Wiley.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  }
});
