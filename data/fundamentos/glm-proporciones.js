SP_FICHA({
  "id": "glm-proporciones",
  "familia": "generalizados",
  "respuesta": "proporcion",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["glm-conteos", "glm", "glmm-bloques", "tabla-contingencia", "proporciones", "dca"],
  "ejemplo": { "conjunto": "frijol", "entradas": { "respuesta": "germinadas", "ensayos": "sembradas", "tratamientos": ["tratamiento"] }, "opciones": { "familia": "auto", "enlace": "logit" } },
  "formato": {
    "largo": [["caja", "tratamiento", "sembradas", "germinadas"], ["C01", "Testigo", "50", "17"], ["C02", "Testigo", "50", "8"], ["C03", "Testigo", "50", "19"], ["C04", "Testigo", "50", "12"], ["C05", "Remojo 24 h", "50", "33"], ["C06", "Remojo 24 h", "50", "22"]],
    "ancho": null
  },
  "es": {
    "alias": ["Regresión logística", "GLM binomial", "Modelo logit", "Análisis de proporciones"],
    "paraQue": "Compara tratamientos cuando la respuesta es cuántos de n tuvieron éxito (semillas germinadas, plantas enfermas, insectos muertos) o un sí o no por individuo.",
    "preguntas": [
      "¿Mejora la germinación del frijol con remojo, ácido giberélico o escarificación, contando las germinadas de 50 semillas por caja?",
      "¿Cambia la proporción de plantas con marchitez entre portainjertos de jitomate sembrados en bloques dentro del invernadero?",
      "¿Difiere la mortalidad de mosquita blanca entre cuatro formulaciones de un aceite, si en cada jaula había un número distinto de insectos?"
    ],
    "teoria": [
      "Una proporción de éxitos (7 de 20 semillas, 45 de 50) no se comporta como una medición continua: está acotada entre 0 y 1 y su varianza, π(1 − π)/n, depende de su valor; es máxima cerca de 50 % y mínima cerca de 0 y 100 %. Además, una proporción de 20 semillas es menos precisa que una de 200. Por eso analizar porcentajes con análisis de varianza, aun con la transformación arcoseno, pesa mal los datos y puede predecir porcentajes imposibles.",
      "El modelo binomial trata cada fila como n ensayos con probabilidad π de éxito y modela el logit, log(π/(1 − π)), como una suma de efectos. Así cada fila pesa según su número de ensayos y las probabilidades estimadas quedan entre 0 y 1. Los coeficientes son logaritmos de razones de momios: su exponencial dice cuántas veces aumentan los momios de germinar respecto al primer tratamiento. SigmaPro ofrece también los enlaces probit y log-log complementario.",
      "Si entre unidades tratadas igual hay más variación de la que permite la binomial (sobredispersión), la familia «Automática» la detecta con la prueba de Pearson y cambia a la cuasibinomial, que infla los errores estándar con una dispersión estimada y prueba con F. Cuando un tratamiento tiene 0 % o 100 % de éxitos (separación), el coeficiente se va al infinito; la corrección de Firth da estimados finitos, con pruebas de razón de verosimilitudes penalizadas e intervalos del perfil penalizado."
    ],
    "modelo": {
      "tex": "\\log\\left(\\frac{\\pi_{ij}}{1 - \\pi_{ij}}\\right) = \\alpha + \\tau_i + \\beta_j, \\quad y_{ij} \\sim \\mathrm{Binomial}(n_{ij}, \\pi_{ij})",
      "terminos": [
        ["y_{ij}", "los éxitos (germinadas, enfermas) del tratamiento i en el bloque j"],
        ["n_{ij}", "los ensayos de esa fila (semillas sembradas, plantas evaluadas); con respuesta 0/1, n = 1"],
        ["\\pi_{ij}", "la probabilidad de éxito de esa unidad"],
        ["\\alpha", "el intercepto: el logit del primer tratamiento en el primer bloque"],
        ["\\tau_i", "el efecto del tratamiento i en la escala logit (con varios factores: efectos principales e interacciones); su exponencial es la razón de momios frente al primer nivel"],
        ["\\beta_j", "el efecto del bloque j (opcional)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Todos los tratamientos tienen la misma probabilidad de éxito. Se prueba con χ² = cambio de devianza al quitar el término (razón de verosimilitudes, tipo II por omisión); con la cuasibinomial, con F; con Firth, con la razón de verosimilitudes penalizadas." }
    ],
    "supuestos": [
      { "nombre": "Éxitos de n ensayos", "como": "SigmaPro revisa que los éxitos sean enteros entre 0 y los ensayos, o que la respuesta valga 0 o 1 si no das la columna de ensayos.", "verificar": null, "siFalla": "Corrige la captura: la columna de ensayos lleva el total (sembradas), no los fracasos.", "alternativa": null },
      { "nombre": "Sin sobredispersión", "como": "El semáforo muestra Pearson χ²/gl y su p (solo con la columna de ensayos; con 0/1 no se puede revisar).", "verificar": null, "siFalla": "Usa la cuasibinomial (la «Automática» lo hace sola) o un modelo mixto con un efecto aleatorio por observación.", "alternativa": "glmm-bloques" },
      { "nombre": "Sin separación (ningún grupo con 0 % o 100 %)", "como": "El renglón «Ajuste» del semáforo se pone en rojo y un aviso cuenta las probabilidades ajustadas en 0 o 1.", "verificar": null, "siFalla": "Activa la corrección de Firth (binomial con enlace logit).", "alternativa": null },
      { "nombre": "Independencia entre unidades", "como": "La da el sorteo de los tratamientos a las cajas o parcelas; no se prueba con los datos.", "verificar": null, "siFalla": "Si evaluaste la misma planta en varias fechas o varias macetas por parcela, usa un modelo mixto generalizado con su efecto aleatorio.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germinadas", "tipo": "conteo (éxitos) o binaria (0/1)", "papel": "respuesta" },
        { "nombre": "sembradas", "tipo": "conteo (ensayos; opcional)", "papel": "ensayos" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (1 a 3 factores)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles (opcional)", "papel": "bloque" },
        { "nombre": "covariables", "tipo": "numérica continua (hasta 2, opcional)", "papel": "covariables" }
      ],
      "minimo": "Al menos 3 unidades (cajas, macetas, parcelas) por tratamiento; con pocos ensayos por unidad (menos de 10) conviene poner más repeticiones. Para revisar la sobredispersión hacen falta los ensayos de cada fila.",
      "balance": "Las filas con faltantes o con ensayos en cero se quitan. Que las unidades tengan distinto número de ensayos no es problema: cada fila pesa según sus ensayos. Con desbalance, la probabilidad de cada tratamiento es una media marginal.",
      "notaFormato": "Formato largo: una fila por unidad con los éxitos y los ensayos en dos columnas de conteos; o una fila por individuo con la respuesta 0/1, sin columna de ensayos.",
      "errores": [
        "Capturar el porcentaje de germinación en lugar de las germinadas y las sembradas: se pierde cuántos ensayos hubo y el modelo no puede pesar cada fila.",
        "Transformar con arcoseno y hacer un análisis de varianza: el modelo binomial ya toma en cuenta que la varianza depende de la proporción.",
        "Sumar en una sola fila las semillas de varias cajas: se pierde la variación entre cajas y no se puede revisar la sobredispersión.",
        "Poner los fracasos (no germinadas) en la columna de ensayos en lugar del total."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión sobre la familia y el semáforo: sobredispersión (Pearson χ²/gl), atípicos y si hubo separación.",
        "En el análisis de devianza, lee la χ² y la p de cada término (primero la interacción, si hay varios factores).",
        "Lee la probabilidad estimada de cada tratamiento con su intervalo y sus letras.",
        "En las comparaciones por pares, la razón de momios dice cuántas veces son mayores los momios de éxito de un tratamiento que los del otro.",
        "Si activaste Firth, la χ² de cada coeficiente sale de la razón de verosimilitudes penalizadas y no hay AIC."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La germinación difirió entre tratamientos (χ² = 242, 4 gl, p < 0.001; modelo binomial con enlace logit, sin sobredispersión: χ²/gl = 1.2, p = 0.28). Con escarificación la probabilidad de germinar fue de 0.94 (IC 95 %: 0.90 a 0.97) frente a 0.28 en el testigo; sus momios de germinar fueron 44 veces los del testigo».",
      "guias": ["devianza", "chi2", "razon-momios", "dispersion", "ic", "p-ajustado"]
    },
    "limitaciones": [
      "Si las unidades están en bloques que son una muestra de un conjunto mayor, o hay mediciones repetidas, usa el modelo mixto generalizado.",
      "La razón de momios no es una razón de probabilidades: con probabilidades altas, unos momios 44 veces mayores pueden ser poco más del triple de germinación; lee también las probabilidades.",
      "Si la respuesta tiene más de dos categorías ordenadas o no (sana, leve, severa), no es binomial: resume con una tabla de contingencia.",
      "Si la dosis es numérica y quieres la forma de la respuesta, ponla como covariable en el GLM por fórmula."
    ],
    "referencias": [
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Warton, D. I., & Hui, F. K. C. (2011). The arcsine is asinine: The analysis of proportions in ecology. Ecology, 92(1), 3–10.",
      "Firth, D. (1993). Bias reduction of maximum likelihood estimates. Biometrika, 80(1), 27–38.",
      "Heinze, G., & Schemper, M. (2002). A solution to the problem of separation in logistic regression. Statistics in Medicine, 21(16), 2409–2419."
    ]
  },
  "en": {
    "alias": ["Logistic regression", "Binomial GLM", "Logit model", "Analysis of proportions"],
    "paraQue": "Compares treatments when the response is how many out of n succeeded (germinated seeds, diseased plants, dead insects) or a yes or no per individual.",
    "preguntas": [
      "Does bean germination improve with soaking, gibberellic acid or scarification, counting the germinated seeds out of 50 per box?",
      "Does the proportion of wilted plants differ among tomato rootstocks grown in blocks within the greenhouse?",
      "Does whitefly mortality differ among four formulations of an oil when each cage held a different number of insects?"
    ],
    "teoria": [
      "A proportion of successes (7 out of 20 seeds, 45 out of 50) does not behave like a continuous measurement: it is bounded between 0 and 1, and its variance, π(1 − π)/n, depends on its value; it is largest near 50% and smallest near 0 and 100%. Also, a proportion based on 20 seeds is less precise than one based on 200. That is why analyzing percentages with an analysis of variance, even after an arcsine transformation, weights the data poorly and can predict impossible percentages.",
      "The binomial model treats each row as n trials with probability π of success and models the logit, log(π/(1 − π)), as a sum of effects. Each row thus weighs according to its number of trials and the estimated probabilities stay between 0 and 1. The coefficients are logs of odds ratios: their exponential tells how many times the odds of germinating increase relative to the first treatment. SigmaPro also offers the probit and complementary log-log links.",
      "If units treated alike vary more than the binomial allows (overdispersion), the “Automatic” family detects it with the Pearson test and switches to the quasi-binomial, which inflates the standard errors with an estimated dispersion and tests with F. When a treatment has 0% or 100% successes (separation), the coefficient goes to infinity; the Firth correction gives finite estimates, with penalized likelihood ratio tests and penalized profile intervals."
    ],
    "modelo": {
      "tex": "\\log\\left(\\frac{\\pi_{ij}}{1 - \\pi_{ij}}\\right) = \\alpha + \\tau_i + \\beta_j, \\quad y_{ij} \\sim \\mathrm{Binomial}(n_{ij}, \\pi_{ij})",
      "terminos": [
        ["y_{ij}", "the successes (germinated, diseased) of treatment i in block j"],
        ["n_{ij}", "the trials in that row (seeds sown, plants assessed); with a 0/1 response, n = 1"],
        ["\\pi_{ij}", "the probability of success of that unit"],
        ["\\alpha", "the intercept: the logit of the first treatment in the first block"],
        ["\\tau_i", "the effect of treatment i on the logit scale (with several factors: main effects and interactions); its exponential is the odds ratio against the first level"],
        ["\\beta_j", "the effect of block j (optional)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "All treatments have the same probability of success. Tested with χ² = change in deviance when the term is dropped (likelihood ratio, type II by default); with the quasi-binomial, with F; with Firth, with the penalized likelihood ratio." }
    ],
    "supuestos": [
      { "nombre": "Successes out of n trials", "como": "SigmaPro checks that the successes are whole numbers between 0 and the trials, or that the response is 0 or 1 if you give no trials column.", "verificar": null, "siFalla": "Fix the data entry: the trials column holds the total (seeds sown), not the failures.", "alternativa": null },
      { "nombre": "No overdispersion", "como": "The checklist shows Pearson χ²/df and its p (only with the trials column; with 0/1 it cannot be checked).", "verificar": null, "siFalla": "Use the quasi-binomial (the “Automatic” family does it by itself) or a mixed model with an observation-level random effect.", "alternativa": "glmm-bloques" },
      { "nombre": "No separation (no group with 0% or 100%)", "como": "The “Fit” line of the checklist turns red and a warning counts the fitted probabilities at 0 or 1.", "verificar": null, "siFalla": "Turn on the Firth correction (binomial with logit link).", "alternativa": null },
      { "nombre": "Independence among units", "como": "It comes from randomizing the treatments to boxes or plots; it is not tested with the data.", "verificar": null, "siFalla": "If you assessed the same plant on several dates or several pots per plot, use a generalized mixed model with their random effect.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germinadas", "tipo": "count (successes) or binary (0/1)", "papel": "response" },
        { "nombre": "sembradas", "tipo": "count (trials; optional)", "papel": "trials" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (1 to 3 factors)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels (optional)", "papel": "block" },
        { "nombre": "covariates", "tipo": "continuous numeric (up to 2, optional)", "papel": "covariates" }
      ],
      "minimo": "At least 3 units (boxes, pots, plots) per treatment; with few trials per unit (fewer than 10) use more replicates. Checking overdispersion requires the trials of each row.",
      "balance": "Rows with missing values or zero trials are dropped. Units with different numbers of trials are not a problem: each row weighs according to its trials. With imbalance, each treatment probability is a marginal mean.",
      "notaFormato": "Long format: one row per unit with the successes and the trials in two count columns; or one row per individual with a 0/1 response and no trials column.",
      "errores": [
        "Entering the germination percentage instead of the germinated and sown seeds: the number of trials is lost and the model cannot weight each row.",
        "Applying an arcsine transformation and running an analysis of variance: the binomial model already accounts for the variance depending on the proportion.",
        "Adding up the seeds of several boxes in a single row: the variation among boxes is lost and overdispersion cannot be checked.",
        "Putting the failures (not germinated) in the trials column instead of the total."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion about the family and the checklist: overdispersion (Pearson χ²/df), outliers and whether there was separation.",
        "In the analysis of deviance, read the χ² and p of each term (the interaction first, if there are several factors).",
        "Read the estimated probability of each treatment with its interval and letters.",
        "In the pairwise comparisons, the odds ratio says how many times larger one treatment’s odds of success are than the other’s.",
        "If you turned on Firth, the χ² of each coefficient comes from the penalized likelihood ratio and there is no AIC."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Germination differed among treatments (χ² = 242, 4 df, p < 0.001; binomial model with logit link, no overdispersion: χ²/df = 1.2, p = 0.28). With scarification the probability of germinating was 0.94 (95% CI: 0.90 to 0.97) versus 0.28 in the control; its odds of germinating were 44 times those of the control.”",
      "guias": ["devianza", "chi2", "razon-momios", "dispersion", "ic", "p-ajustado"]
    },
    "limitaciones": [
      "If the units are in blocks that are a sample from a larger set, or there are repeated measurements, use the generalized mixed model.",
      "An odds ratio is not a ratio of probabilities: with high probabilities, odds 44 times larger can mean little more than three times the germination; read the probabilities too.",
      "If the response has more than two categories, ordered or not (healthy, mild, severe), it is not binomial: summarize it with a contingency table.",
      "If the rate is numeric and you want the shape of the response, enter it as a covariate in the formula GLM."
    ],
    "referencias": [
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "McCullagh, P., & Nelder, J. A. (1989). Generalized linear models (2nd ed.). Chapman and Hall.",
      "Warton, D. I., & Hui, F. K. C. (2011). The arcsine is asinine: The analysis of proportions in ecology. Ecology, 92(1), 3–10.",
      "Firth, D. (1993). Bias reduction of maximum likelihood estimates. Biometrika, 80(1), 27–38.",
      "Heinze, G., & Schemper, M. (2002). A solution to the problem of separation in logistic regression. Statistics in Medicine, 21(16), 2409–2419."
    ]
  }
});
