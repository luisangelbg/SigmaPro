SP_FICHA({
  "id": "supuestos",
  "familia": "supuestos",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": ["dca", "dbca"],
  "relacionados": ["dca", "dbca", "kruskal-wallis", "friedman", "glm", "comparaciones-medias"],
  "ejemplo": { "conjunto": "venenos", "entradas": { "respuesta": "tiempo", "tratamientos": ["veneno", "tratamiento"] }, "opciones": {} },
  "formato": {
    "largo": [["veneno", "tratamiento", "tiempo"], ["I", "A", "0.31"], ["I", "A", "0.45"], ["I", "A", "0.46"], ["I", "A", "0.43"], ["I", "B", "0.82"], ["I", "B", "1.1"], ["I", "B", "0.88"]],
    "ancho": null
  },
  "es": {
    "alias": ["Diagnóstico de residuos", "Revisión de los supuestos del ANOVA", "Pruebas de normalidad y de homogeneidad de varianzas"],
    "paraQue": "Revisa en los residuos de tu experimento si se cumplen los supuestos del análisis de varianza y te dice qué hacer si alguno falla.",
    "preguntas": [
      "¿Puedo analizar con un ANOVA el tiempo de supervivencia de animales expuestos a tres venenos y cuatro tratamientos, o necesito transformarlo?",
      "¿Tienen la misma varianza los rendimientos de los híbridos de maíz en las cuatro dosis de nitrógeno?",
      "¿Se parecen entre sí las parcelas vecinas de un ensayo cuando ordeno los residuos por su posición en el campo?"
    ],
    "teoria": [
      "El análisis de varianza y las comparaciones de medias suponen que los errores son independientes, siguen una distribución normal con media cero y tienen la misma varianza en todos los tratamientos; en un diseño en bloques, además, que los efectos de bloque y de tratamiento se suman. Estos supuestos son sobre los errores, no sobre la variable cruda, y se revisan en los residuos: lo que queda de cada dato después de quitarle lo que explican el bloque y los tratamientos.",
      "SigmaPro ajusta el modelo lineal con tu respuesta, el bloque (si lo hay) y hasta tres factores de tratamiento cruzados con todas sus interacciones, y somete los residuos a cinco revisiones. Normalidad: Shapiro-Wilk (Anderson-Darling con más de 5000 datos), con Lilliefors y Anderson-Darling de apoyo y el gráfico de cuantiles con su banda de confianza. Varianzas iguales: Brown-Forsythe, la más robusta, con Levene, Bartlett y Fligner-Killeen de apoyo. Aditividad: la prueba de un grado de libertad de Tukey, cuando hay bloques y tratamientos. Independencia: Durbin-Watson y la prueba de rachas, en el orden de las filas o de la columna que elijas. Atípicos: el mayor residuo estudentizado con la corrección de Bonferroni.",
      "Cada renglón del semáforo es verde si p ≥ α, ámbar entre α/5 y α, y rojo por debajo de α/5. Con 50 residuos o más y una forma casi normal, la normalidad no pasa de ámbar, porque con muchos datos cualquier desvío es significativo y el ANOVA lo tolera. Si la normalidad o las varianzas fallan y la respuesta es positiva, la app estima la λ de Box-Cox y sugiere una transformación."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\beta_j + \\tau_i + \\varepsilon_{ij}, \\quad e_{ij} = y_{ij} - \\hat{y}_{ij}",
      "terminos": [
        ["y_{ij}", "la respuesta de la unidad que recibió el tratamiento i en el bloque j"],
        ["\\beta_j", "el efecto del bloque j (solo si eliges bloques)"],
        ["\\tau_i", "el efecto del tratamiento i: hasta tres factores cruzados, con sus interacciones"],
        ["\\varepsilon_{ij}", "el error, que se supone independiente y normal, con media 0 y varianza constante"],
        ["e_{ij}", "el residuo, lo observado menos lo ajustado: es lo que se revisa"]
      ]
    },
    "hipotesis": [
      { "h0": "\\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)", "h1": "\\text{los errores no son normales}", "texto": "Normalidad: Shapiro-Wilk sobre los residuos (Anderson-Darling si hay más de 5000)." },
      { "h0": "\\sigma_1^2 = \\sigma_2^2 = \\cdots = \\sigma_t^2", "h1": "\\text{alguna } \\sigma_i^2 \\text{ es distinta}", "texto": "Varianzas iguales entre las combinaciones de tratamientos: Brown-Forsythe, es decir, Levene con la mediana." },
      { "h0": "\\lambda = 0", "h1": "\\lambda \\ne 0", "texto": "Aditividad: en el modelo y = μ + τ + β + λ·τ·β, la prueba de Tukey pregunta si hace falta el término multiplicativo." },
      { "h0": "\\rho = 0", "h1": "\\rho > 0", "texto": "Independencia: Durbin-Watson busca autocorrelación positiva entre residuos vecinos en el orden elegido." },
      { "h0": "\\text{ningún residuo es atípico}", "h1": "\\text{el mayor residuo es atípico}", "texto": "Atípicos: el mayor residuo estudentizado, con su p multiplicado por el número de residuos (Bonferroni)." }
    ],
    "supuestos": [
      { "nombre": "El modelo revisado es el de tu análisis", "como": "Elige la misma respuesta, los mismos factores y el mismo bloque que usarás en el análisis: los residuos dependen del modelo, que aparece en el encabezado del resultado. En el Reporte, los análisis completamente al azar y en bloques traen esta revisión sola.", "verificar": null, "siFalla": "Esta revisión no acepta covariables: el análisis de covarianza revisa en su semáforo las pendientes iguales y que la covariable no dependa de los tratamientos, pero no los residuos. Los modelos mixtos traen su propio semáforo.", "alternativa": "ancova" },
      { "nombre": "Repeticiones suficientes", "como": "Hacen falta al menos 2 grados de libertad del error, y al menos 2 datos por tratamiento para comparar varianzas; con pocas repeticiones las pruebas tienen poca potencia y un verde no garantiza nada.", "verificar": null, "siFalla": "Apóyate más en los gráficos (cuantiles y residuos contra ajustados) que en los valores p.", "alternativa": null },
      { "nombre": "Un orden con sentido para la independencia", "como": "Durbin-Watson y las rachas usan el orden de las filas o el de la columna que elijas en «Orden para la independencia» (posición en el campo, fecha de medición).", "verificar": null, "siFalla": "Si las filas están ordenadas por tratamiento, esta revisión no dice nada útil: elige una columna con la posición o la fecha.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "veneno, tratamiento", "tipo": "factor con k niveles (hasta 3 factores)", "papel": "tratamientos (opcional)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloques (opcional)" },
        { "nombre": "posición o fecha", "tipo": "numérica continua o fecha", "papel": "orden para la independencia (opcional)" }
      ],
      "minimo": "Al menos 2 grados de libertad del error y 2 datos por combinación de tratamientos para comparar varianzas. Shapiro-Wilk pide de 3 a 5000 residuos, Lilliefors 5 y Anderson-Darling 8; con menos de 20 residuos todas tienen poca potencia.",
      "balance": "Las filas con algún faltante en la respuesta o en los factores no entran y la app dice cuántas. El desbalance no impide la revisión: el modelo se ajusta por mínimos cuadrados con las celdas que haya.",
      "notaFormato": "Formato largo: una fila por unidad experimental, con la respuesta y una columna por factor y otra para el bloque. Las dosis numéricas que elijas como tratamiento se tratan como niveles de un factor.",
      "errores": [
        "Probar la normalidad de la variable cruda con todos los tratamientos juntos: la mezcla de grupos con medias distintas no es normal aunque cada grupo lo sea. Lo que importa son los residuos.",
        "Revisar un modelo distinto del que vas a analizar, por ejemplo sin el bloque o sin la interacción.",
        "Tomar un p mayor que 0.05 con 6 datos como prueba de que el supuesto se cumple.",
        "Dejar las filas ordenadas por tratamiento y leer Durbin-Watson como si fuera el orden en el campo.",
        "Borrar un dato atípico sin revisar antes si es un error de captura."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee el color global y el veredicto de cada renglón del semáforo.",
        "Lee «Qué hacer»: según lo que falló y el tipo de respuesta, la app propone la transformación de Box-Cox, un modelo para conteos o porcentajes, o una prueba no paramétrica.",
        "Mira los tres gráficos: cuantiles normales con su banda, residuos contra ajustados (un embudo indica que la varianza crece con la media) y residuos en orden.",
        "Consulta el cuadro con todas las pruebas y, en «Varianza de los residuos por tratamiento», cuáles tratamientos varían más.",
        "Si transformaste la respuesta en Datos, vuelve a revisar antes de analizar."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los residuos del modelo veneno × tratamiento se alejaron de la normalidad (Shapiro-Wilk, W = 0.91, p = 0.002) y sus varianzas difirieron entre tratamientos (Brown-Forsythe, F(11, 36) = 4.1, p < 0.001). La λ de Box-Cox fue de −0.8 (IC 95 %: −1.3 a −0.3), por lo que se analizó el recíproco del tiempo, que puede leerse como una tasa de mortalidad».",
      "guias": ["shapiro", "brown-forsythe", "tukey-aditividad", "durbin-watson", "atipico-bonferroni", "residuo-std", "rachas"]
    },
    "limitaciones": [
      "Revisa modelos de efectos fijos con un solo término de error (completamente al azar, bloques, factoriales); en parcelas divididas el error de la parcela grande no se separa.",
      "Con muy pocos datos las pruebas casi nunca rechazan, y con muchísimos rechazan por desvíos sin importancia: combina el p con los gráficos.",
      "Si las varianzas difieren, con un solo factor puedes usar Games-Howell en «Comparaciones de medias» o Kruskal-Wallis; con varios factores o bloques SigmaPro no tiene un modelo con varianzas distintas por tratamiento: transforma la respuesta o, para conteos y proporciones, usa un modelo lineal generalizado.",
      "Durbin-Watson solo busca autocorrelación positiva entre vecinos inmediatos; no sustituye un análisis espacial."
    ],
    "referencias": [
      "Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). Biometrika, 52(3/4), 591–611.",
      "Brown, M. B., & Forsythe, A. B. (1974). Robust tests for the equality of variances. Journal of the American Statistical Association, 69(346), 364–367.",
      "Tukey, J. W. (1949). One degree of freedom for non-additivity. Biometrics, 5(3), 232–242.",
      "Durbin, J., & Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. Biometrika, 37(3/4), 409–428.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  },
  "en": {
    "alias": ["Residual diagnostics", "Checking ANOVA assumptions", "Normality and homogeneity of variance tests"],
    "paraQue": "Checks in the residuals of your experiment whether the assumptions of the analysis of variance hold and tells you what to do if one fails.",
    "preguntas": [
      "Can I analyze with an ANOVA the survival time of animals exposed to three poisons and four treatments, or do I need to transform it?",
      "Do the yields of the maize hybrids have the same variance at the four nitrogen rates?",
      "Do neighboring plots of a trial resemble each other when I order the residuals by their position in the field?"
    ],
    "teoria": [
      "The analysis of variance and mean comparisons assume that the errors are independent, follow a normal distribution with mean zero and have the same variance in every treatment; in a block design, also that block and treatment effects add up. These assumptions are about the errors, not about the raw variable, and they are checked on the residuals: what is left of each observation after removing what the block and the treatments explain.",
      "SigmaPro fits the linear model with your response, the block (if any) and up to three crossed treatment factors with all their interactions, and runs five checks on the residuals. Normality: Shapiro-Wilk (Anderson-Darling with more than 5000 data), with Lilliefors and Anderson-Darling as support and the quantile plot with its confidence band. Equal variances: Brown-Forsythe, the most robust, with Levene, Bartlett and Fligner-Killeen as support. Additivity: Tukey's one-degree-of-freedom test, when there are blocks and treatments. Independence: Durbin-Watson and the runs test, in the order of the rows or of the column you choose. Outliers: the largest studentized residual with the Bonferroni correction.",
      "Each line of the checklist is green if p ≥ α, amber between α/5 and α, and red below α/5. With 50 residuals or more and a nearly normal shape, normality does not go beyond amber, because with many data any departure is significant and the ANOVA tolerates it. If normality or equal variances fail and the response is positive, the app estimates the Box-Cox λ and suggests a transformation."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\beta_j + \\tau_i + \\varepsilon_{ij}, \\quad e_{ij} = y_{ij} - \\hat{y}_{ij}",
      "terminos": [
        ["y_{ij}", "the response of the unit that received treatment i in block j"],
        ["\\beta_j", "the effect of block j (only if you choose blocks)"],
        ["\\tau_i", "the effect of treatment i: up to three crossed factors, with their interactions"],
        ["\\varepsilon_{ij}", "the error, assumed independent and normal, with mean 0 and constant variance"],
        ["e_{ij}", "the residual, observed minus fitted: this is what is checked"]
      ]
    },
    "hipotesis": [
      { "h0": "\\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)", "h1": "\\text{the errors are not normal}", "texto": "Normality: Shapiro-Wilk on the residuals (Anderson-Darling if there are more than 5000)." },
      { "h0": "\\sigma_1^2 = \\sigma_2^2 = \\cdots = \\sigma_t^2", "h1": "\\text{some } \\sigma_i^2 \\text{ is different}", "texto": "Equal variances among treatment combinations: Brown-Forsythe, that is, Levene with the median." },
      { "h0": "\\lambda = 0", "h1": "\\lambda \\ne 0", "texto": "Additivity: in the model y = μ + τ + β + λ·τ·β, Tukey's test asks whether the multiplicative term is needed." },
      { "h0": "\\rho = 0", "h1": "\\rho > 0", "texto": "Independence: Durbin-Watson looks for positive autocorrelation between neighboring residuals in the chosen order." },
      { "h0": "\\text{no residual is an outlier}", "h1": "\\text{the largest residual is an outlier}", "texto": "Outliers: the largest studentized residual, with its p multiplied by the number of residuals (Bonferroni)." }
    ],
    "supuestos": [
      { "nombre": "The checked model is the one in your analysis", "como": "Choose the same response, factors and block that you will use in the analysis: the residuals depend on the model, which appears in the header of the result. In the Report, completely randomized and block analyses include this check automatically.", "verificar": null, "siFalla": "This check does not take covariates: the analysis of covariance checks equal slopes and a covariate unaffected by the treatments in its assumptions checklist, but not the residuals. Mixed models come with their own assumptions checklist.", "alternativa": "ancova" },
      { "nombre": "Enough replicates", "como": "At least 2 error degrees of freedom are needed, and at least 2 observations per treatment to compare variances; with few replicates the tests have little power and a green light guarantees nothing.", "verificar": null, "siFalla": "Rely more on the plots (quantiles and residuals vs. fitted values) than on the p-values.", "alternativa": null },
      { "nombre": "A meaningful order for independence", "como": "Durbin-Watson and the runs test use the order of the rows or of the column you choose in “Order for the independence check” (position in the field, measurement date).", "verificar": null, "siFalla": "If the rows are sorted by treatment, this check says nothing useful: choose a column with the position or the date.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "veneno, tratamiento", "tipo": "factor with k levels (up to 3 factors)", "papel": "treatments (optional)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "blocks (optional)" },
        { "nombre": "position or date", "tipo": "continuous numeric or date", "papel": "order for the independence check (optional)" }
      ],
      "minimo": "At least 2 error degrees of freedom and 2 observations per treatment combination to compare variances. Shapiro-Wilk needs 3 to 5000 residuals, Lilliefors 5 and Anderson-Darling 8; with fewer than 20 residuals all of them have little power.",
      "balance": "Rows with a missing value in the response or in the factors are left out and the app reports how many. Imbalance does not prevent the check: the model is fitted by least squares with the cells available.",
      "notaFormato": "Long format: one row per experimental unit, with the response, one column per factor and another for the block. Numeric rates that you choose as treatments are handled as levels of a factor.",
      "errores": [
        "Testing the normality of the raw variable with all treatments pooled: a mixture of groups with different means is not normal even if each group is. What matters are the residuals.",
        "Checking a model different from the one you will analyze, for example without the block or without the interaction.",
        "Taking a p-value above 0.05 with 6 observations as proof that the assumption holds.",
        "Leaving the rows sorted by treatment and reading Durbin-Watson as if it were the order in the field.",
        "Deleting an outlier without first checking whether it is a data-entry error."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the overall color and the verdict of each line of the checklist.",
        "Read “What to do”: depending on what failed and on the type of response, the app proposes the Box-Cox transformation, a model for counts or percentages, or a nonparametric test.",
        "Look at the three plots: normal quantiles with their band, residuals vs. fitted values (a funnel means the variance grows with the mean) and residuals in order.",
        "Check the table with all the tests and, in “Residual variance by treatment”, which treatments vary the most.",
        "If you transformed the response in Data, check again before analyzing."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The residuals of the poison × treatment model departed from normality (Shapiro-Wilk, W = 0.91, p = 0.002) and their variances differed among treatments (Brown-Forsythe, F(11, 36) = 4.1, p < 0.001). The Box-Cox λ was −0.8 (95% CI: −1.3 to −0.3), so the reciprocal of time, which can be read as a death rate, was analyzed.”",
      "guias": ["shapiro", "brown-forsythe", "tukey-aditividad", "durbin-watson", "atipico-bonferroni", "residuo-std", "rachas"]
    },
    "limitaciones": [
      "It checks fixed-effects models with a single error term (completely randomized, blocks, factorials); in split plots the main-plot error is not separated.",
      "With very few data the tests almost never reject, and with a great many they reject for unimportant departures: combine the p-value with the plots.",
      "If variances differ, with a single factor you can use Games-Howell in “Mean comparisons” or Kruskal-Wallis; with several factors or blocks SigmaPro has no model with a different variance per treatment: transform the response or, for counts and proportions, use a generalized linear model.",
      "Durbin-Watson only looks for positive autocorrelation between immediate neighbors; it does not replace a spatial analysis."
    ],
    "referencias": [
      "Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). Biometrika, 52(3/4), 591–611.",
      "Brown, M. B., & Forsythe, A. B. (1974). Robust tests for the equality of variances. Journal of the American Statistical Association, 69(346), 364–367.",
      "Tukey, J. W. (1949). One degree of freedom for non-additivity. Biometrics, 5(3), 232–242.",
      "Durbin, J., & Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. Biometrika, 37(3/4), 409–428.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  }
});
