SP_FICHA({
  "id": "glm-conteos",
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "bloques",
  "disenos": ["dca", "dbca"],
  "relacionados": ["glm-proporciones", "glm-gamma", "glm", "glmm-bloques", "dbca", "kruskal-wallis"],
  "ejemplo": { "conjunto": "aguacate", "entradas": { "respuesta": "trips", "tratamientos": ["tratamiento"], "bloque": "bloque" }, "opciones": { "familia": "auto" } },
  "formato": {
    "largo": [["bloque", "tratamiento", "trips"], ["1", "Testigo", "8"], ["1", "Azadiractina", "6"], ["1", "Spinosad", "1"], ["1", "Jabón potásico", "1"], ["1", "Beauveria", "3"], ["2", "Testigo", "5"]],
    "ancho": null
  },
  "es": {
    "alias": ["GLM de Poisson", "Regresión de Poisson", "GLM binomial negativo", "Modelo para conteos"],
    "paraQue": "Compara tratamientos cuando la respuesta es un conteo (insectos, lesiones, plántulas) con una distribución hecha para conteos, en lugar de transformar los datos.",
    "preguntas": [
      "¿Reducen cinco insecticidas el número de trips por brote de aguacate, con bloques dentro de la huerta?",
      "¿Cambia el número de plántulas emergidas por surco con la densidad de siembra y el tratamiento de la semilla?",
      "¿Difiere la tasa de lesiones de roya por hoja entre fungicidas, si en cada parcela se revisó un número distinto de hojas?"
    ],
    "teoria": [
      "Un conteo solo toma valores enteros desde cero y su varianza crece con la media: un tratamiento con 2 insectos en promedio varía poco y uno con 40 varía mucho. El análisis de varianza supone lo contrario (normalidad y varianza constante), y transformar con raíz o logaritmo solo lo arregla en parte. El modelo lineal generalizado usa directamente una distribución de conteos y modela el logaritmo de la media, así que los efectos son multiplicativos: un tratamiento «reduce los trips a la mitad».",
      "La distribución de Poisson supone que la varianza es igual a la media. En campo casi siempre hay más variación (sobredispersión) porque las plagas se agregan, y entonces los errores estándar de Poisson son demasiado chicos y aparecen diferencias que no existen. Con la familia «Automática», SigmaPro ajusta primero el modelo de Poisson y revisa la ji cuadrada de Pearson entre sus grados de libertad: si p < 0.05 y la razón pasa de 1.1, cambia a la binomial negativa, cuya varianza (μ + μ²/θ) crece más rápido que la media. También puedes elegir la cuasi-Poisson, que multiplica la varianza por una dispersión estimada.",
      "Los efectos se prueban con el análisis de devianza: la devianza mide cuánto se aleja el modelo de los datos, y su aumento al quitar un término se compara con una χ² (o con una F en la cuasi-Poisson). Si las unidades difieren en tamaño (metros de surco, hojas revisadas), la columna de exposición entra como desplazamiento y las medias se vuelven tasas por unidad."
    ],
    "modelo": {
      "tex": "\\log(\\mu_{ij}) = \\log(t_{ij}) + \\alpha + \\tau_i + \\beta_j, \\quad \\mathrm{Var}(y_{ij}) = \\mu_{ij} + \\frac{\\mu_{ij}^{2}}{\\theta}",
      "terminos": [
        ["y_{ij}", "el conteo del tratamiento i en el bloque j"],
        ["\\mu_{ij}", "el conteo esperado (la media) de esa unidad"],
        ["t_{ij}", "la exposición (área, tiempo, hojas revisadas), si la das; sin ella el término no está"],
        ["\\alpha", "el intercepto: el logaritmo del conteo esperado del primer tratamiento en el primer bloque"],
        ["\\tau_i", "el efecto del tratamiento i en la escala logarítmica (con varios factores: efectos principales e interacciones); su exponencial es la razón de tasas frente al primer nivel"],
        ["\\beta_j", "el efecto del bloque j (opcional)"],
        ["\\theta", "el parámetro de la binomial negativa: mientras más chico, más sobredispersión; en la de Poisson la varianza es igual a la media"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma tasa. Se prueba con la razón de verosimilitudes: χ² = cambio de devianza al quitar el término (análisis de devianza tipo II por omisión; también I o III). Con la cuasi-Poisson, F = (cambio de devianza / gl) / φ." }
    ],
    "supuestos": [
      { "nombre": "Variación acorde a la familia (sin sobredispersión sin modelar)", "como": "El semáforo muestra la ji cuadrada de Pearson entre sus grados de libertad con su p; con la binomial negativa muestra θ y su EE. La familia «Automática» hace esta revisión por ti.", "verificar": null, "siFalla": "Usa la binomial negativa o la cuasi-Poisson; si la variación extra viene de unidades agrupadas, un modelo mixto con un efecto aleatorio por observación.", "alternativa": "glmm-bloques" },
      { "nombre": "Efectos multiplicativos (enlace logarítmico adecuado)", "como": "Gráfica de residuos de Pearson contra valores ajustados: sin forma y casi todos entre −2 y 2.", "verificar": null, "siFalla": "Si la nube se curva, agrega la interacción entre factores o prueba otro enlace (raíz cuadrada o identidad); si se abre, la varianza crece más que la de la familia.", "alternativa": null },
      { "nombre": "Independencia de los conteos", "como": "La da el diseño: una fila por unidad experimental sorteada. No se prueba con los datos.", "verificar": null, "siFalla": "Si contaste varias veces la misma trampa o varias plantas de una parcela, agrega su efecto aleatorio en el modelo lineal generalizado mixto.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "conteo", "papel": "respuesta" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (1 a 3 factores)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles (opcional)", "papel": "bloque" },
        { "nombre": "exposición", "tipo": "numérica continua positiva (opcional)", "papel": "exposición: área, tiempo u hojas revisadas" },
        { "nombre": "covariables", "tipo": "numérica continua (hasta 2, opcional)", "papel": "covariables" }
      ],
      "minimo": "Al menos 3 repeticiones por tratamiento y unas 15 unidades o más en total; la binomial negativa necesita datos suficientes para estimar θ (con pocas unidades su EE es grande).",
      "balance": "Las filas con datos faltantes se quitan (en el ejemplo quedan 28 de 30), igual que las de exposición cero o negativa. El desbalance no estorba: las pruebas tipo II no dependen del orden de los términos y las tasas de cada tratamiento son medias marginales que promedian los bloques por igual.",
      "notaFormato": "Formato largo: una fila por unidad experimental (brote, trampa, parcela) con el conteo crudo, una columna por factor de tratamiento y, si los hay, el bloque y la exposición.",
      "errores": [
        "Capturar porcentajes o promedios en lugar del conteo de cada unidad: el modelo necesita enteros.",
        "Transformar el conteo (raíz, logaritmo de x + 1) antes de analizarlo: con este modelo no hace falta y cambia la escala de las conclusiones.",
        "Comparar conteos de unidades de distinto tamaño sin dar la exposición: el tratamiento con unidades más grandes parece tener más plaga.",
        "Contar como repeticiones varias plantas o fechas de la misma parcela (pseudorreplicación)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee primero la conclusión sobre la familia (si se pasó a la binomial negativa por la sobredispersión) y revisa el semáforo: sobredispersión, atípicos y convergencia.",
        "En el análisis de devianza, lee la χ² y la p de cada término; con dos o más factores, primero la interacción.",
        "Lee la tasa estimada de cada tratamiento con su intervalo y sus letras: niveles con una letra en común no difieren.",
        "En las comparaciones por pares, cada razón dice cuántas veces es mayor la tasa de un tratamiento que la del otro.",
        "Los coeficientes y sus razones de tasas comparan cada nivel con el primero (el testigo, si lo pusiste primero)."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los conteos mostraron sobredispersión con la distribución de Poisson (χ²/gl = 2.2, p = 0.002), por lo que se ajustó un modelo binomial negativo con enlace logarítmico. El tratamiento afectó el número de trips por brote (χ² = 21.3, 4 gl, p < 0.001): con spinosad hubo 1.5 trips por brote frente a 7.8 en el testigo, una tasa 5.2 veces menor (Tukey, p < 0.001)».",
      "guias": ["devianza", "chi2", "razon-tasas", "theta-nb", "dispersion", "p-ajustado"]
    },
    "limitaciones": [
      "Si los bloques son una muestra de un conjunto mayor o mediste la misma unidad varias veces, usa el modelo mixto (conteos o proporciones en bloques aleatorios).",
      "SigmaPro no ajusta modelos inflados en ceros: si hay muchos más ceros de los esperados, la binomial negativa solo los acomoda en parte.",
      "Si el conteo es de éxitos sobre un total conocido (germinadas de 50 semillas), es una proporción: usa el GLM de proporciones.",
      "Con conteos grandes (cientos) y una variación parecida en todos los tratamientos, un análisis de varianza común suele llevar a las mismas conclusiones."
    ],
    "referencias": [
      "Nelder, J. A., & Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society: Series A (General), 135(3), 370–384.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "O'Hara, R. B., & Kotze, D. J. (2010). Do not log-transform count data. Methods in Ecology and Evolution, 1(2), 118–122."
    ]
  },
  "en": {
    "alias": ["Poisson GLM", "Poisson regression", "Negative binomial GLM", "Count model"],
    "paraQue": "Compares treatments when the response is a count (insects, lesions, seedlings) with a distribution built for counts, instead of transforming the data.",
    "preguntas": [
      "Do five insecticides reduce the number of thrips per avocado shoot, with blocks within the orchard?",
      "Does the number of emerged seedlings per row change with seeding rate and seed treatment?",
      "Does the rate of rust lesions per leaf differ among fungicides when a different number of leaves was checked in each plot?"
    ],
    "teoria": [
      "A count only takes whole values from zero up, and its variance grows with the mean: a treatment averaging 2 insects varies little and one averaging 40 varies a lot. The analysis of variance assumes the opposite (normality and constant variance), and a square-root or log transformation only partly fixes it. The generalized linear model uses a count distribution directly and models the logarithm of the mean, so effects are multiplicative: a treatment “cuts thrips in half”.",
      "The Poisson distribution assumes the variance equals the mean. In the field there is almost always more variation (overdispersion) because pests aggregate; Poisson standard errors are then too small and differences appear that do not exist. With the “Automatic” family, SigmaPro first fits the Poisson model and checks the Pearson chi-square over its degrees of freedom: if p < 0.05 and the ratio exceeds 1.1, it switches to the negative binomial, whose variance (μ + μ²/θ) grows faster than the mean. You can also choose the quasi-Poisson, which multiplies the variance by an estimated dispersion.",
      "Effects are tested with the analysis of deviance: the deviance measures how far the model is from the data, and its increase when a term is dropped is compared with a χ² (or with an F in the quasi-Poisson). If units differ in size (meters of row, leaves checked), the exposure column enters as an offset and the means become rates per unit."
    ],
    "modelo": {
      "tex": "\\log(\\mu_{ij}) = \\log(t_{ij}) + \\alpha + \\tau_i + \\beta_j, \\quad \\mathrm{Var}(y_{ij}) = \\mu_{ij} + \\frac{\\mu_{ij}^{2}}{\\theta}",
      "terminos": [
        ["y_{ij}", "the count of treatment i in block j"],
        ["\\mu_{ij}", "the expected count (the mean) of that unit"],
        ["t_{ij}", "the exposure (area, time, leaves checked), if you give it; without it the term is absent"],
        ["\\alpha", "the intercept: the log of the expected count of the first treatment in the first block"],
        ["\\tau_i", "the effect of treatment i on the log scale (with several factors: main effects and interactions); its exponential is the rate ratio against the first level"],
        ["\\beta_j", "the effect of block j (optional)"],
        ["\\theta", "the negative binomial parameter: the smaller it is, the more overdispersion; in the Poisson the variance equals the mean"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same rate. Tested with the likelihood ratio: χ² = change in deviance when the term is dropped (type II analysis of deviance by default; also I or III). With the quasi-Poisson, F = (change in deviance / df) / φ." }
    ],
    "supuestos": [
      { "nombre": "Variation consistent with the family (no unmodeled overdispersion)", "como": "The checklist shows the Pearson chi-square over its degrees of freedom with its p; with the negative binomial it shows θ and its SE. The “Automatic” family runs this check for you.", "verificar": null, "siFalla": "Use the negative binomial or the quasi-Poisson; if the extra variation comes from grouped units, a mixed model with an observation-level random effect.", "alternativa": "glmm-bloques" },
      { "nombre": "Multiplicative effects (suitable log link)", "como": "Plot of Pearson residuals vs. fitted values: no pattern and nearly all between −2 and 2.", "verificar": null, "siFalla": "If the cloud curves, add the interaction between factors or try another link (square root or identity); if it fans out, the variance grows faster than the family allows.", "alternativa": null },
      { "nombre": "Independence of the counts", "como": "It comes from the design: one row per randomized experimental unit. It is not tested with the data.", "verificar": null, "siFalla": "If you counted the same trap several times or several plants from one plot, add their random effect in the generalized linear mixed model.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "count", "papel": "response" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (1 to 3 factors)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels (optional)", "papel": "block" },
        { "nombre": "exposure", "tipo": "positive continuous numeric (optional)", "papel": "exposure: area, time or leaves checked" },
        { "nombre": "covariates", "tipo": "continuous numeric (up to 2, optional)", "papel": "covariates" }
      ],
      "minimo": "At least 3 replicates per treatment and about 15 units or more in total; the negative binomial needs enough data to estimate θ (with few units its SE is large).",
      "balance": "Rows with missing data are dropped (28 of 30 remain in the example), as are rows with zero or negative exposure. Imbalance is not a problem: type II tests do not depend on the order of the terms, and each treatment rate is a marginal mean that averages the blocks equally.",
      "notaFormato": "Long format: one row per experimental unit (shoot, trap, plot) with the raw count, one column per treatment factor and, if present, the block and the exposure.",
      "errores": [
        "Entering percentages or averages instead of the count of each unit: the model needs whole numbers.",
        "Transforming the count (square root, log of x + 1) before the analysis: this model does not need it, and it changes the scale of the conclusions.",
        "Comparing counts from units of different size without giving the exposure: the treatment with larger units seems to have more pests.",
        "Counting several plants or dates from the same plot as replicates (pseudoreplication)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read first the conclusion about the family (whether it switched to the negative binomial because of overdispersion) and check the checklist: overdispersion, outliers and convergence.",
        "In the analysis of deviance, read the χ² and p of each term; with two or more factors, the interaction first.",
        "Read the estimated rate of each treatment with its interval and letters: levels sharing a letter do not differ.",
        "In the pairwise comparisons, each ratio says how many times larger one treatment’s rate is than the other’s.",
        "The coefficients and their rate ratios compare each level with the first one (the control, if you put it first)."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The counts were overdispersed under the Poisson distribution (χ²/df = 2.2, p = 0.002), so a negative binomial model with a log link was fitted. Treatment affected the number of thrips per shoot (χ² = 21.3, 4 df, p < 0.001): spinosad had 1.5 thrips per shoot versus 7.8 in the control, a rate 5.2 times lower (Tukey, p < 0.001).”",
      "guias": ["devianza", "chi2", "razon-tasas", "theta-nb", "dispersion", "p-ajustado"]
    },
    "limitaciones": [
      "If the blocks are a sample from a larger set or you measured the same unit several times, use the mixed model (counts or proportions in random blocks).",
      "SigmaPro does not fit zero-inflated models: if there are many more zeros than expected, the negative binomial only partly accommodates them.",
      "If the count is successes out of a known total (germinated out of 50 seeds), it is a proportion: use the proportions GLM.",
      "With large counts (hundreds) and similar variation in all treatments, an ordinary analysis of variance usually leads to the same conclusions."
    ],
    "referencias": [
      "Nelder, J. A., & Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society: Series A (General), 135(3), 370–384.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "O'Hara, R. B., & Kotze, D. J. (2010). Do not log-transform count data. Methods in Ecology and Evolution, 1(2), 118–122."
    ]
  }
});
