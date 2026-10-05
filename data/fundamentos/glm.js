SP_FICHA({
  "id": "glm",
  "familia": "generalizados",
  "respuesta": "binaria",
  "estructura": "continua",
  "disenos": ["dca", "dbca", "ninguno"],
  "relacionados": ["glm-conteos", "glm-proporciones", "glm-gamma", "modelo-lineal", "glmm", "regresion-lineal"],
  "ejemplo": { "conjunto": "frijol-germinacion", "entradas": { "respuesta": "germino" }, "opciones": { "derecha": "lote + tratamiento + peso_semilla", "familia": "binomial", "firth": true, "comparar": ["tratamiento"] } },
  "formato": {
    "largo": [["tratamiento", "lote", "semilla", "peso_semilla", "germino"], ["Testigo", "L1", "1", "0.439", "1"], ["Testigo", "L2", "2", "0.435", "1"], ["Testigo", "L3", "3", "0.365", "1"], ["Testigo", "L1", "4", "0.363", "1"], ["Testigo", "L2", "5", "0.28", "1"], ["Testigo", "L3", "6", "0.456", "0"], ["Testigo", "L1", "7", "0.467", "1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Modelo lineal generalizado", "GLM", "Regresión logística con covariables", "Regresión de Poisson con covariables"],
    "paraQue": "Ajusta un modelo lineal generalizado con los términos que tú escribas (factores, covariables, interacciones, anidamientos) y la familia que elijas.",
    "preguntas": [
      "¿Depende la probabilidad de que una semilla germine de su tratamiento y de su peso, tomando en cuenta el lote?",
      "¿Aumenta el número de frutos por planta con la dosis de potasio como variable continua, y cambia la pendiente con la variedad?",
      "¿Se relaciona la presencia de una plaga en un árbol (sí o no) con la altitud de la huerta y el tipo de manejo?"
    ],
    "teoria": [
      "Un modelo lineal generalizado tiene tres partes: una distribución para la respuesta (la familia), un predictor lineal que suma los efectos de factores y covariables, y una función de enlace que une la media de la respuesta con ese predictor. Con la familia normal y el enlace identidad es el modelo lineal de siempre; con la binomial y el logit es la regresión logística, y con la de Poisson y el logaritmo, la regresión de Poisson.",
      "Aquí escribes el lado derecho de la fórmula como en R: + suma términos, * cruza con su interacción, : deja solo la interacción y / anida. Las columnas numéricas entran como covariables (una pendiente en la escala del enlace), salvo las que marques como factor. Hay siete familias (binomial, cuasibinomial, Poisson, cuasi-Poisson, binomial negativa, gamma y gaussiana inversa) con sus enlaces, incluido el de potencia μ^λ, y el ajuste es por mínimos cuadrados iterativamente reponderados, como glm de R. Las pruebas salen de un análisis de devianza tipo I, II o III: χ² con dispersión fija y F con la dispersión estimada por Pearson.",
      "Con una respuesta 0/1 puede ocurrir la separación: un grupo en el que todos tuvieron éxito, como las semillas escarificadas del ejemplo. La máxima verosimilitud lleva entonces el coeficiente al infinito y su error estándar no sirve. La corrección de Firth penaliza la verosimilitud, da estimados finitos y prueba cada término con la razón de verosimilitudes penalizadas, con intervalos del perfil penalizado. Sin Firth, los intervalos de los coeficientes pueden ser de Wald o por verosimilitud perfilada."
    ],
    "modelo": {
      "tex": "g(\\mu_i) = \\eta_i = \\beta_0 + \\beta_1 x_{1i} + \\cdots + \\beta_p x_{pi}, \\quad \\mathrm{Var}(y_i) = \\phi V(\\mu_i)",
      "terminos": [
        ["y_i", "la respuesta de la fila i: 0/1, éxitos de n ensayos, conteo o valor positivo"],
        ["\\mu_i", "su media (la probabilidad de éxito, en la binomial)"],
        ["g", "la función de enlace: logit, probit, log-log complementario, logaritmo, inverso, 1/μ², identidad, raíz o potencia"],
        ["\\eta_i", "el predictor lineal: la suma de los efectos en la escala del enlace"],
        ["x_{ki}", "las columnas del modelo: indicadoras de los niveles de cada factor (contrastes de tratamiento), covariables e interacciones"],
        ["\\beta_k", "los coeficientes"],
        ["V(\\mu_i)", "la función de varianza de la familia: μ(1 − μ) en la binomial, μ en la de Poisson, μ² en la gamma"],
        ["\\phi", "la dispersión: 1 en la binomial, la de Poisson y la binomial negativa; estimada por Pearson en las cuasi, la gamma y la gaussiana inversa"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_k = 0 \\text{ en todas las columnas del término}", "h1": "\\text{algún } \\beta_k \\ne 0", "texto": "El término no aporta al modelo. Se prueba con el cambio de devianza al quitarlo: χ² (razón de verosimilitudes) con dispersión fija, F con dispersión estimada, o la razón de verosimilitudes penalizadas con Firth." }
    ],
    "supuestos": [
      { "nombre": "Familia adecuada (varianza y dispersión)", "como": "El semáforo muestra la razón Pearson χ²/gl con su p en la de Poisson y en la binomial con ensayos, θ en la binomial negativa y φ en las familias con dispersión estimada.", "verificar": null, "siFalla": "Con sobredispersión pasa a la cuasibinomial o a la cuasi-Poisson, o a la binomial negativa si son conteos.", "alternativa": null },
      { "nombre": "Relación lineal en la escala del enlace", "como": "Gráfica de residuos de Pearson contra valores ajustados: sin curvatura.", "verificar": null, "siFalla": "Si una covariable se curva, crea su cuadrado con «Variable calculada» en Datos y agrégalo: dentro de la fórmula no se usan funciones como log() o poly().", "alternativa": null },
      { "nombre": "Sin separación (respuestas 0/1 o proporciones)", "como": "Un aviso y el renglón «Ajuste» del semáforo en rojo cuando hay probabilidades ajustadas en 0 o 1.", "verificar": null, "siFalla": "Activa la corrección de Firth (binomial con enlace logit).", "alternativa": null },
      { "nombre": "Independencia", "como": "La da el diseño o el muestreo; no se prueba con los datos.", "verificar": null, "siFalla": "Si las filas comparten parcela, árbol o lote y estos son una muestra de un conjunto mayor, usa el modelo lineal generalizado mixto.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germino", "tipo": "binaria (0/1); también conteo, éxitos de n o numérica positiva", "papel": "respuesta" },
        { "nombre": "tratamiento, lote", "tipo": "factor con k niveles", "papel": "términos del modelo" },
        { "nombre": "peso_semilla", "tipo": "numérica continua", "papel": "covariable" },
        { "nombre": "ensayos o exposición", "tipo": "conteo o numérica positiva (opcional)", "papel": "ensayos (binomial) o exposición (conteos)" }
      ],
      "minimo": "Con una respuesta 0/1, al menos unos 10 casos del resultado menos frecuente por cada coeficiente del modelo; con conteos o proporciones agrupadas, varias unidades por combinación de factores.",
      "balance": "Las filas con faltantes, o con ensayos o exposición no positivos, se quitan. El desbalance se maneja con el análisis de devianza tipo II (por omisión) o III; el tipo I depende del orden de los términos.",
      "notaFormato": "Formato largo: una fila por unidad o por individuo. Los factores capturados con números (lote 1, 2, 3; dosis) se marcan en «Numéricas que son factor».",
      "errores": [
        "Dejar como covariable un factor codificado con números (bloque 1, 2, 3): el modelo estima una pendiente sin sentido.",
        "Escribir log(x) u offset() dentro de la fórmula (no se admiten), o x^2 esperando un término cuadrático (en la notación de fórmulas solo repite x): calcula la columna en Datos y usa la columna de exposición para el desplazamiento.",
        "Dar una proporción (0.34) como respuesta binomial sin la columna de ensayos.",
        "Leer los coeficientes como si estuvieran en la escala de la respuesta: con logit son logaritmos de razones de momios."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los avisos y el semáforo: convergencia, separación, sobredispersión y atípicos.",
        "En el análisis de devianza, lee primero los términos de orden más alto (interacciones) y después los efectos principales.",
        "Lee los coeficientes: con logit o logaritmo, la razón (de momios, de tasas o de medias) y su intervalo dan el tamaño del efecto; en una covariable, por cada unidad que aumenta.",
        "Si pediste comparar un factor, lee sus medias en la escala de la respuesta, sus letras y las comparaciones por pares."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La germinación se analizó con regresión logística con la corrección de Firth, porque todas las semillas escarificadas germinaron. El tratamiento afectó la probabilidad de germinar (χ² = 15.1, 2 gl, p < 0.001), sin efecto del lote (p = 0.37) ni del peso de la semilla (p = 0.32); la probabilidad estimada fue de 0.99 con escarificación y de 0.71 en el testigo».",
      "guias": ["devianza", "chi2", "razon-momios", "coeficiente", "ic", "aic"]
    },
    "limitaciones": [
      "No tiene efectos aleatorios: para bloques, parcelas o lotes que son una muestra, usa el modelo lineal generalizado mixto.",
      "Dentro de la fórmula no hay funciones: las transformaciones se hacen en Datos y el desplazamiento se da con la columna de exposición.",
      "Para tratamientos en bloques, los análisis de conteos, proporciones o gamma arman la fórmula por ti, y los dos primeros eligen la familia por la sobredispersión.",
      "Con Firth no hay AIC (la verosimilitud está penalizada) y solo aplica a la binomial con enlace logit."
    ],
    "referencias": [
      "Nelder, J. A., & Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society: Series A (General), 135(3), 370–384.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Firth, D. (1993). Bias reduction of maximum likelihood estimates. Biometrika, 80(1), 27–38.",
      "Heinze, G., & Schemper, M. (2002). A solution to the problem of separation in logistic regression. Statistics in Medicine, 21(16), 2409–2419.",
      "Venzon, D. J., & Moolgavkar, S. H. (1988). A method for computing profile-likelihood-based confidence intervals. Journal of the Royal Statistical Society: Series C (Applied Statistics), 37(1), 87–94."
    ]
  },
  "en": {
    "alias": ["Generalized linear model", "GLM", "Logistic regression with covariates", "Poisson regression with covariates"],
    "paraQue": "Fits a generalized linear model with the terms you write (factors, covariates, interactions, nesting) and the family you choose.",
    "preguntas": [
      "Does the probability that a seed germinates depend on its treatment and its weight, accounting for the seed lot?",
      "Does the number of fruits per plant increase with the potassium rate as a continuous variable, and does the slope change with the variety?",
      "Is the presence of a pest on a tree (yes or no) related to the orchard’s altitude and type of management?"
    ],
    "teoria": [
      "A generalized linear model has three parts: a distribution for the response (the family), a linear predictor that adds up the effects of factors and covariates, and a link function that connects the mean of the response with that predictor. With the normal family and the identity link it is the usual linear model; with the binomial and the logit it is logistic regression, and with the Poisson and the log, Poisson regression.",
      "Here you write the right-hand side of the formula as in R: + adds terms, * crosses with their interaction, : keeps only the interaction and / nests. Numeric columns enter as covariates (a slope on the link scale), except those you mark as factors. There are seven families (binomial, quasi-binomial, Poisson, quasi-Poisson, negative binomial, gamma and inverse Gaussian) with their links, including the power link μ^λ, and the fit is by iteratively reweighted least squares, like R’s glm. Tests come from a type I, II or III analysis of deviance: χ² with fixed dispersion and F with the dispersion estimated by Pearson.",
      "With a 0/1 response separation can occur: a group in which every unit succeeded, like the scarified seeds in the example. Maximum likelihood then pushes the coefficient to infinity and its standard error is useless. The Firth correction penalizes the likelihood, gives finite estimates and tests each term with the penalized likelihood ratio, with penalized profile intervals. Without Firth, the coefficient intervals can be Wald or profile likelihood intervals."
    ],
    "modelo": {
      "tex": "g(\\mu_i) = \\eta_i = \\beta_0 + \\beta_1 x_{1i} + \\cdots + \\beta_p x_{pi}, \\quad \\mathrm{Var}(y_i) = \\phi V(\\mu_i)",
      "terminos": [
        ["y_i", "the response in row i: 0/1, successes out of n trials, count or positive value"],
        ["\\mu_i", "its mean (the probability of success, in the binomial)"],
        ["g", "the link function: logit, probit, complementary log-log, log, inverse, 1/μ², identity, square root or power"],
        ["\\eta_i", "the linear predictor: the sum of the effects on the link scale"],
        ["x_{ki}", "the model columns: indicators for the levels of each factor (treatment contrasts), covariates and interactions"],
        ["\\beta_k", "the coefficients"],
        ["V(\\mu_i)", "the variance function of the family: μ(1 − μ) in the binomial, μ in the Poisson, μ² in the gamma"],
        ["\\phi", "the dispersion: 1 in the binomial, Poisson and negative binomial; estimated by Pearson in the quasi families, the gamma and the inverse Gaussian"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_k = 0 \\text{ for all columns of the term}", "h1": "\\text{some } \\beta_k \\ne 0", "texto": "The term adds nothing to the model. Tested with the change in deviance when it is dropped: χ² (likelihood ratio) with fixed dispersion, F with estimated dispersion, or the penalized likelihood ratio with Firth." }
    ],
    "supuestos": [
      { "nombre": "Suitable family (variance and dispersion)", "como": "The checklist shows the Pearson χ²/df ratio with its p in the Poisson and in the binomial with trials, θ in the negative binomial and φ in the families with estimated dispersion.", "verificar": null, "siFalla": "With overdispersion switch to the quasi-binomial or quasi-Poisson, or to the negative binomial for counts.", "alternativa": null },
      { "nombre": "Linear relationship on the link scale", "como": "Plot of Pearson residuals vs. fitted values: no curvature.", "verificar": null, "siFalla": "If a covariate curves, create its square with “Computed variable” in Data and add it: functions such as log() or poly() are not used inside the formula.", "alternativa": null },
      { "nombre": "No separation (0/1 responses or proportions)", "como": "A warning and the “Fit” line of the checklist in red when there are fitted probabilities at 0 or 1.", "verificar": null, "siFalla": "Turn on the Firth correction (binomial with logit link).", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from the design or the sampling; it is not tested with the data.", "verificar": null, "siFalla": "If rows share a plot, tree or lot and these are a sample from a larger set, use the generalized linear mixed model.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germino", "tipo": "binary (0/1); also count, successes out of n or positive numeric", "papel": "response" },
        { "nombre": "tratamiento, lote", "tipo": "factor with k levels", "papel": "model terms" },
        { "nombre": "peso_semilla", "tipo": "continuous numeric", "papel": "covariate" },
        { "nombre": "trials or exposure", "tipo": "count or positive numeric (optional)", "papel": "trials (binomial) or exposure (counts)" }
      ],
      "minimo": "With a 0/1 response, at least about 10 cases of the less frequent outcome per model coefficient; with counts or grouped proportions, several units per combination of factors.",
      "balance": "Rows with missing values, or with non-positive trials or exposure, are dropped. Imbalance is handled by the type II (default) or III analysis of deviance; type I depends on the order of the terms.",
      "notaFormato": "Long format: one row per unit or per individual. Factors entered as numbers (lot 1, 2, 3; rates) are marked in “Numeric columns that are factors”.",
      "errores": [
        "Leaving as a covariate a factor coded with numbers (block 1, 2, 3): the model estimates a meaningless slope.",
        "Writing log(x) or offset() inside the formula (they are not accepted), or x^2 expecting a quadratic term (in formula notation it just repeats x): compute the column in Data and use the exposure column for the offset.",
        "Giving a proportion (0.34) as a binomial response without the trials column.",
        "Reading the coefficients as if they were on the response scale: with the logit they are logs of odds ratios."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the warnings and the checklist: convergence, separation, overdispersion and outliers.",
        "In the analysis of deviance, read the highest-order terms (interactions) first and then the main effects.",
        "Read the coefficients: with the logit or log link, the ratio (odds, rate or mean ratio) and its interval give the size of the effect; for a covariate, per unit increase.",
        "If you asked to compare a factor, read its means on the response scale, its letters and the pairwise comparisons."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Germination was analyzed by logistic regression with the Firth correction, because all scarified seeds germinated. Treatment affected the probability of germinating (χ² = 15.1, 2 df, p < 0.001), with no effect of lot (p = 0.37) or seed weight (p = 0.32); the estimated probability was 0.99 with scarification and 0.71 in the control.”",
      "guias": ["devianza", "chi2", "razon-momios", "coeficiente", "ic", "aic"]
    },
    "limitaciones": [
      "It has no random effects: for blocks, plots or lots that are a sample, use the generalized linear mixed model.",
      "There are no functions inside the formula: transformations are done in Data and the offset is given with the exposure column.",
      "For treatments in blocks, the counts, proportions or gamma analyses build the formula for you, and the first two choose the family by overdispersion.",
      "With Firth there is no AIC (the likelihood is penalized), and it only applies to the binomial with a logit link."
    ],
    "referencias": [
      "Nelder, J. A., & Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society: Series A (General), 135(3), 370–384.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Firth, D. (1993). Bias reduction of maximum likelihood estimates. Biometrika, 80(1), 27–38.",
      "Heinze, G., & Schemper, M. (2002). A solution to the problem of separation in logistic regression. Statistics in Medicine, 21(16), 2409–2419.",
      "Venzon, D. J., & Moolgavkar, S. H. (1988). A method for computing profile-likelihood-based confidence intervals. Journal of the Royal Statistical Society: Series C (Applied Statistics), 37(1), 87–94."
    ]
  }
});
