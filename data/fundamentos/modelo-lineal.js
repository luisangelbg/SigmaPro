SP_FICHA({
  "id": "modelo-lineal",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": ["dca", "dbca", "latino", "ninguno"],
  "relacionados": ["dbca", "dca", "ancova", "regresion-lineal", "modelo-mixto", "glm"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend" }, "opciones": { "derecha": "bloque + hibrido * dosis", "comoFactor": ["dosis"], "tipoSC": 3 } },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Modelo lineal general", "ANOVA con fórmula", "Mínimos cuadrados ordinarios", "lm de R"],
    "paraQue": "Ajusta cualquier modelo lineal de efectos fijos escrito como fórmula, para los análisis que no encajan en un diseño del catálogo.",
    "preguntas": [
      "¿Difieren las localidades en rendimiento si las repeticiones están anidadas dentro de cada localidad y el número de repeticiones cambia de una a otra?",
      "¿Cambia la pendiente de la relación entre el número de plantas y el rendimiento de una variedad de sorgo a otra?",
      "¿Qué interacciones dobles entre cuatro factores de manejo afectan el peso del fruto, sin incluir la interacción cuádruple?"
    ],
    "teoria": [
      "Los análisis de varianza de los diseños y la regresión lineal son casos de un mismo modelo: la respuesta es una combinación lineal de efectos de factores y de pendientes de covariables, más un error normal con varianza constante. El modelo lineal general permite escribir esa combinación como fórmula, con la notación de R: bloque + hibrido * dosis, factores anidados (localidad/repeticion), interacciones hasta cierto orden ((a + b + c)^2), un factor con una covariable y pendientes distintas (variedad * plantas) o un modelo sin intercepto. Las columnas numéricas entran como covariables, salvo las que marques como tratamientos (factor).",
      "SigmaPro ajusta el modelo por mínimos cuadrados y da el análisis de varianza con sumas de cuadrados tipo III (por omisión, con contrastes de suma cero; si no existen por celdas vacías o términos confundidos, pasa a la II), tipo II o tipo I (secuenciales, en el orden de la fórmula). Con datos balanceados las tres coinciden; con desbalance prueban hipótesis distintas. Da también los coeficientes con contrastes de tratamiento (cada nivel comparado con el primero, como summary de lm en R), la R², el error estándar residual y el CV, y las medias marginales estimadas de cada factor con su intervalo de confianza, con las covariables en su media.",
      "No admite estratos de error ni efectos aleatorios: unas parcelas divididas escritas aquí probarían la parcela grande contra el error equivocado. Para eso están los diseños del catálogo y los modelos mixtos."
    ],
    "modelo": {
      "tex": "\\mathbf{y} = \\mathbf{X} \\beta + \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2 \\mathbf{I})",
      "terminos": [
        ["\\mathbf{y}", "el vector de las respuestas, una por observación"],
        ["\\mathbf{X}", "la matriz del modelo: el intercepto, los contrastes de cada factor, las covariables y sus interacciones, según la fórmula"],
        ["\\beta", "los coeficientes que se estiman por mínimos cuadrados"],
        ["\\varepsilon", "los errores, independientes, con media 0 y varianza constante σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_T = 0", "h1": "\\beta_T \\ne 0", "texto": "Los coeficientes de un término T de la fórmula (un factor, una covariable o una interacción) son todos cero. F = CM del término / CM del error; qué se ajusta antes depende del tipo de suma de cuadrados." },
      { "h0": "\\beta_k = 0", "h1": "\\beta_k \\ne 0", "texto": "Cada coeficiente se prueba con t = estimado / EE; con contrastes de tratamiento, es la diferencia entre un nivel y el primero." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "Este método no trae revisión de residuos. Si tu modelo tiene hasta tres factores cruzados y un bloque, «Revisar los supuestos del modelo» ajusta el mismo modelo y lo revisa con su semáforo; con solo covariables, la regresión lineal trae Shapiro-Wilk y las gráficas de residuos.", "verificar": "supuestos", "siFalla": "Transforma la respuesta en Datos (Box-Cox, logaritmo) y vuelve a ajustar; para conteos, proporciones o datos positivos asimétricos, usa el modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Varianza constante", "como": "Brown-Forsythe y Levene por tratamiento en «Revisar los supuestos del modelo»; con covariables, Breusch-Pagan en la regresión lineal.", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, transforma la respuesta o usa un modelo lineal generalizado (gamma para datos positivos asimétricos).", "alternativa": "glm" },
      { "nombre": "Relación lineal con las covariables", "como": "Con covariables, el modelo supone una recta (o un plano); revísala en la regresión lineal con la prueba RESET y la gráfica de residuos contra ajustados.", "verificar": "regresion-lineal", "siFalla": "Agrega el cuadrado de la covariable, calculado en Datos, o márcala como factor si tiene pocos valores.", "alternativa": null },
      { "nombre": "Independencia y efectos fijos", "como": "Todas las observaciones deben ser independientes y todos los efectos, fijos; no se prueba con los datos.", "verificar": null, "siFalla": "Si hay parcelas, plantas o fechas que agrupan observaciones (bloques aleatorios, submuestras, mediciones repetidas), usa un modelo mixto.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "bloque, hibrido", "tipo": "factor con k niveles", "papel": "términos del modelo" },
        { "nombre": "dosis", "tipo": "numérica (como factor o como covariable)", "papel": "término del modelo (marcada como factor en el ejemplo)" }
      ],
      "minimo": "Más observaciones que coeficientes; conviene que el error tenga 10 grados de libertad o más. Cada combinación de niveles que aparece en una interacción necesita datos para que su media sea estimable.",
      "balance": "Acepta desbalance. Con tipo III, si faltan combinaciones pasa a tipo II y lo avisa; los coeficientes que no se pueden estimar (colineales) y los términos confundidos se señalan, y las medias no estimables salen con «—». Sin intercepto solo usa tipo I. Las filas con un faltante en alguna variable de la fórmula se excluyen.",
      "notaFormato": "Formato largo: una fila por observación y una columna por variable de la fórmula. Los nombres con espacios van entre comillas invertidas. Las transformaciones (logaritmo, raíz) se hacen antes en Datos: la fórmula no acepta funciones.",
      "errores": [
        "Escribir funciones dentro de la fórmula (log(rend), factor(dosis), poly(x, 2)): transforma en Datos y marca como factor las numéricas que lo son.",
        "Dejar como covariable una columna numérica que es un factor (bloque 1, 2, 3 o una dosis con pocos niveles): el modelo ajusta una recta en lugar de comparar niveles.",
        "Escribir aquí un diseño con parcelas grandes o mediciones repetidas como si tuviera un solo error: usa el diseño del catálogo o un modelo mixto.",
        "Cambiar de tipo de suma de cuadrados hasta encontrar un p menor que 0.05: elige el tipo antes, según la hipótesis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee las notas del cuadro: el tipo de suma de cuadrados, las numéricas tomadas como factor y los avisos (coeficientes sin estimar, términos confundidos).",
        "En el análisis de varianza, lee primero las interacciones de orden más alto; si son significativas, interpreta las medias de las combinaciones (gráfica de interacción).",
        "Lee la F y la p de cada término; la R², el error estándar y el CV dicen qué tan bien ajusta el modelo.",
        "Los coeficientes comparan cada nivel con el primero; para comparar medias entre sí, usa las medias marginales y sus intervalos de confianza."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «En el modelo rend ~ bloque + híbrido × dosis, con sumas de cuadrados tipo III, la dosis tuvo efecto (F(3, 33) = 85.3, p < 0.001) sin interacción con el híbrido (F(6, 33) = 1.2, p = 0.33). El modelo explicó 93 % de la variación (R² = 0.93; CV = 5.1 %)».",
      "guias": ["F", "p", "t", "coeficiente", "r2", "ic"]
    },
    "limitaciones": [
      "Solo efectos fijos y un error: para bloques o parcelas aleatorios, medidas repetidas o estratos de error, usa los modelos mixtos o el diseño del catálogo.",
      "Supone respuesta continua con varianza constante: para conteos, proporciones o datos positivos asimétricos, usa el modelo lineal generalizado (fórmula).",
      "No trae comparaciones de medias con letras ni revisión de residuos: si tu modelo es un diseño del catálogo, analízalo ahí para tener las dos cosas.",
      "No acepta funciones dentro de la fórmula; las transformaciones se hacen en Datos."
    ],
    "referencias": [
      "Wilkinson, G. N., & Rogers, C. E. (1973). Symbolic description of factorial models for analysis of variance. Journal of the Royal Statistical Society: Series C (Applied Statistics), 22(3), 392–399.",
      "Searle, S. R. (1971). Linear models. Wiley.",
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Kutner, M. H., Nachtsheim, C. J., Neter, J., & Li, W. (2005). Applied linear statistical models (5th ed.). McGraw-Hill/Irwin.",
      "Fox, J., & Weisberg, S. (2019). An R companion to applied regression (3rd ed.). Sage."
    ]
  },
  "en": {
    "alias": ["General linear model", "ANOVA from a formula", "Ordinary least squares", "R lm"],
    "paraQue": "Fits any fixed-effects linear model written as a formula, for analyses that do not fit a design in the catalog.",
    "preguntas": [
      "Do locations differ in yield when replicates are nested within each location and the number of replicates changes from one to another?",
      "Does the slope of the relationship between plant number and yield change from one sorghum variety to another?",
      "Which two-way interactions among four management factors affect fruit weight, leaving out the four-way interaction?"
    ],
    "teoria": [
      "The analyses of variance of the designs and linear regression are cases of one and the same model: the response is a linear combination of factor effects and covariate slopes, plus a normal error with constant variance. The general linear model lets you write that combination as a formula, in R notation: bloque + hibrido * dosis, nested factors (location/replicate), interactions up to a given order ((a + b + c)^2), a factor with a covariate and separate slopes (variety * plants) or a model without intercept. Numeric columns enter as covariates, except those you mark as treatments (factor).",
      "SigmaPro fits the model by least squares and gives the analysis of variance with type III sums of squares (by default, with sum-to-zero contrasts; if they do not exist because of empty cells or confounded terms, it switches to type II), type II or type I (sequential, in the order of the formula). With balanced data the three agree; with imbalance they test different hypotheses. It also gives the coefficients with treatment contrasts (each level compared with the first one, like summary of lm in R), the R², the residual standard error and the CV, and the estimated marginal means of each factor with their confidence intervals, with covariates at their mean.",
      "It does not accept error strata or random effects: a split plot written here would test the main plot against the wrong error. That is what the catalog designs and the mixed models are for."
    ],
    "modelo": {
      "tex": "\\mathbf{y} = \\mathbf{X} \\beta + \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2 \\mathbf{I})",
      "terminos": [
        ["\\mathbf{y}", "the vector of responses, one per observation"],
        ["\\mathbf{X}", "the model matrix: the intercept, the contrasts of each factor, the covariates and their interactions, as given by the formula"],
        ["\\beta", "the coefficients, estimated by least squares"],
        ["\\varepsilon", "the errors, independent, with mean 0 and constant variance σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_T = 0", "h1": "\\beta_T \\ne 0", "texto": "The coefficients of a term T of the formula (a factor, a covariate or an interaction) are all zero. F = term MS / error MS; what is adjusted first depends on the type of sums of squares." },
      { "h0": "\\beta_k = 0", "h1": "\\beta_k \\ne 0", "texto": "Each coefficient is tested with t = estimate / SE; with treatment contrasts, it is the difference between a level and the first one." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "This method does not check the residuals. If your model has up to three crossed factors and one block, “Check the model assumptions” fits the same model and checks it with its checklist; with covariates only, linear regression includes the Shapiro-Wilk test and residual plots.", "verificar": "supuestos", "siFalla": "Transform the response in Data (Box-Cox, log) and refit; for counts, proportions or positive skewed data, use the generalized linear model.", "alternativa": "glm" },
      { "nombre": "Constant variance", "como": "Brown-Forsythe and Levene tests by treatment in “Check the model assumptions”; with covariates, the Breusch-Pagan test in linear regression.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, transform the response or use a generalized linear model (gamma for positive skewed data).", "alternativa": "glm" },
      { "nombre": "Linear relationship with the covariates", "como": "With covariates, the model assumes a straight line (or a plane); check it in linear regression with the RESET test and the residuals-versus-fitted plot.", "verificar": "regresion-lineal", "siFalla": "Add the square of the covariate, computed in Data, or mark it as a factor if it has few values.", "alternativa": null },
      { "nombre": "Independence and fixed effects", "como": "All observations must be independent and all effects fixed; this is not tested with the data.", "verificar": null, "siFalla": "If plots, plants or dates group the observations (random blocks, subsamples, repeated measurements), use a mixed model.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "bloque, hibrido", "tipo": "factor with k levels", "papel": "model terms" },
        { "nombre": "dosis", "tipo": "numeric (as a factor or as a covariate)", "papel": "model term (marked as a factor in the example)" }
      ],
      "minimo": "More observations than coefficients; the error should have 10 degrees of freedom or more. Each combination of levels that appears in an interaction needs data for its mean to be estimable.",
      "balance": "It accepts imbalance. With type III, if combinations are missing it switches to type II and says so; coefficients that cannot be estimated (collinear) and confounded terms are flagged, and non-estimable means show as “—”. Without intercept it uses type I only. Rows with a missing value in any variable of the formula are excluded.",
      "notaFormato": "Long format: one row per observation and one column per variable in the formula. Names with spaces go between backquotes. Transformations (log, square root) are done beforehand in Data: the formula does not accept functions.",
      "errores": [
        "Writing functions inside the formula (log(rend), factor(dosis), poly(x, 2)): transform in Data and mark as factor the numeric columns that are factors.",
        "Leaving as a covariate a numeric column that is a factor (block 1, 2, 3 or a rate with few levels): the model fits a line instead of comparing levels.",
        "Writing here a design with main plots or repeated measurements as if it had a single error: use the catalog design or a mixed model.",
        "Switching the type of sums of squares until a p below 0.05 shows up: choose the type beforehand, according to the hypothesis."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the table notes: the type of sums of squares, the numeric columns taken as factors and the warnings (inestimable coefficients, confounded terms).",
        "In the analysis of variance, read the highest-order interactions first; if they are significant, interpret the means of the combinations (interaction plot).",
        "Read the F and p of each term; the R², the standard error and the CV tell how well the model fits.",
        "The coefficients compare each level with the first one; to compare means with each other, use the marginal means and their confidence intervals."
      ],
      "ejemplo": "Example write-up (illustrative figures): “In the model rend ~ block + hybrid × rate, with type III sums of squares, rate had an effect (F(3, 33) = 85.3, p < 0.001) with no interaction with hybrid (F(6, 33) = 1.2, p = 0.33). The model explained 93% of the variation (R² = 0.93; CV = 5.1%).”",
      "guias": ["F", "p", "t", "coeficiente", "r2", "ic"]
    },
    "limitaciones": [
      "Fixed effects and a single error only: for random blocks or plots, repeated measures or error strata, use the mixed models or the catalog design.",
      "It assumes a continuous response with constant variance: for counts, proportions or positive skewed data, use the generalized linear model (formula).",
      "It has no mean comparisons with letters and no residual checks: if your model is a catalog design, analyze it there to get both.",
      "It does not accept functions inside the formula; transformations are done in Data."
    ],
    "referencias": [
      "Wilkinson, G. N., & Rogers, C. E. (1973). Symbolic description of factorial models for analysis of variance. Journal of the Royal Statistical Society: Series C (Applied Statistics), 22(3), 392–399.",
      "Searle, S. R. (1971). Linear models. Wiley.",
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Kutner, M. H., Nachtsheim, C. J., Neter, J., & Li, W. (2005). Applied linear statistical models (5th ed.). McGraw-Hill/Irwin.",
      "Fox, J., & Weisberg, S. (2019). An R companion to applied regression (3rd ed.). Sage."
    ]
  }
});
