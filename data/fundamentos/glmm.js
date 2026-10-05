SP_FICHA({
  "id": "glmm",
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "aleatorios",
  "disenos": ["dbca", "parcelas", "latice", "medidas-repetidas", "multiambiente"],
  "relacionados": ["glmm-bloques", "glm", "modelo-mixto", "glm-conteos", "medidas-repetidas"],
  "ejemplo": { "conjunto": "aguacate", "entradas": { "respuesta": "trips" }, "opciones": { "derecha": "tratamiento + (1 | bloque)", "familia": "binomial-negativa" } },
  "formato": {
    "largo": [["bloque", "tratamiento", "trips"], ["1", "Testigo", "8"], ["1", "Azadiractina", "6"], ["1", "Spinosad", "1"], ["1", "Jabón potásico", "1"], ["1", "Beauveria", "3"], ["2", "Testigo", "5"]],
    "ancho": null
  },
  "es": {
    "alias": ["GLMM", "Modelo lineal generalizado mixto", "Modelo mixto generalizado", "GLMM binomial negativo"],
    "paraQue": "Ajusta un modelo lineal generalizado mixto con la fórmula que escribas: efectos fijos y efectos aleatorios como en lme4, por ejemplo (1 | bloque).",
    "preguntas": [
      "¿Difieren los insecticidas en trips por brote si la sobredispersión se modela con la binomial negativa y los bloques son aleatorios?",
      "¿Cambia la proporción de frutos dañados entre variedades, con bloques y parcelas dentro de bloques como efectos aleatorios?",
      "¿Varía el número de garrapatas por animal entre tratamientos, con mediciones repetidas en cada animal?"
    ],
    "teoria": [
      "Cuando los datos tienen varios niveles de agrupamiento (plantas dentro de parcelas, parcelas dentro de bloques, mediciones repetidas del mismo animal) y la respuesta es un conteo, una proporción o un valor positivo asimétrico, el modelo lineal generalizado mixto combina la familia del modelo lineal generalizado con un efecto aleatorio para cada agrupamiento. Cada efecto aleatorio aporta una varianza en la escala del enlace y reconoce que las unidades de un mismo grupo se parecen entre sí, lo que evita la pseudorreplicación.",
      "Escribes el lado derecho como en lme4: los efectos fijos con + y * (como en el modelo lineal) y los aleatorios entre paréntesis. (1 | bloque) da un intercepto por bloque, (1 | bloque/parcela) anida las parcelas en los bloques y (1 | animal) agrupa las mediciones de un mismo animal. SigmaPro lo ajusta en el motor R con glmer (binomial, Poisson o gamma) o glmer.nb (binomial negativa) por la aproximación de Laplace, o por cuadratura de Gauss-Hermite cuando hay un solo intercepto aleatorio con la binomial o la de Poisson. Con la gamma solo se admiten interceptos aleatorios.",
      "Los efectos fijos se prueban con χ² de Wald (tipo II o III) y cada efecto aleatorio con una razón de verosimilitudes (salvo con la gamma). Las medias se dan en la escala de la respuesta para un grupo típico, con los efectos aleatorios en cero. La sobredispersión se maneja con la binomial negativa o con un efecto aleatorio por observación."
    ],
    "modelo": {
      "tex": "g(\\mathrm{E}(y \\mid b)) = \\mathbf{X}\\beta + \\mathbf{Z}b, \\quad b \\sim \\mathcal{N}(0, \\mathbf{G})",
      "terminos": [
        ["y", "la respuesta: conteo, éxitos de n ensayos, 0/1 o valor positivo"],
        ["b", "los efectos aleatorios: un valor por bloque, parcela o animal"],
        ["g", "el enlace de la familia (logaritmo, logit, probit, inverso…)"],
        ["\\mathbf{X}\\beta", "la parte fija: factores, covariables e interacciones con sus coeficientes"],
        ["\\mathbf{Z}b", "la parte aleatoria: cada observación recibe el efecto de sus grupos"],
        ["\\mathbf{G}", "las varianzas (y covarianzas) de los efectos aleatorios, en la escala del enlace"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_k = 0 \\text{ en las columnas del término}", "h1": "\\text{algún } \\beta_k \\ne 0", "texto": "El término fijo no tiene efecto. χ² de Wald tipo II (o III, con contrastes de suma cero)." },
      { "h0": "\\sigma_{g}^{2} = 0", "h1": "\\sigma_{g}^{2} > 0", "texto": "El agrupamiento no aporta variación. Razón de verosimilitudes contra el modelo sin ese efecto (un modelo sin efectos aleatorios si no queda ninguno); el p es conservador." }
    ],
    "supuestos": [
      { "nombre": "Familia adecuada y sobredispersión", "como": "El semáforo muestra la θ de la binomial negativa, la dispersión de la gamma, la varianza del efecto por observación o la razón Pearson χ²/gl.", "verificar": null, "siFalla": "Con Poisson o binomial agrupada, agrega el efecto por observación («Automático» o «Sí, siempre») o cambia a la binomial negativa.", "alternativa": null },
      { "nombre": "Suficientes grupos y efectos aleatorios normales", "como": "No se prueba; cuenta los niveles de cada agrupamiento.", "verificar": null, "siFalla": "Con menos de 5 niveles, pon ese factor como efecto fijo.", "alternativa": "glm" },
      { "nombre": "Ajuste no singular y convergencia", "como": "El semáforo avisa del ajuste singular (una varianza en cero) o de los avisos del optimizador.", "verificar": null, "siFalla": "Simplifica la parte aleatoria: quita el efecto con varianza cero o las pendientes aleatorias.", "alternativa": null },
      { "nombre": "Independencia dados los efectos aleatorios", "como": "Dados los grupos, las observaciones son independientes; no se prueba con los datos.", "verificar": null, "siFalla": "Si las fechas cercanas se parecen más que las lejanas, un intercepto aleatorio no basta; con una respuesta continua usa medidas repetidas.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "conteo, éxitos de n, binaria (0/1) o numérica positiva", "papel": "respuesta" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles", "papel": "efecto fijo" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "agrupamiento aleatorio: (1 | bloque)" },
        { "nombre": "ensayos o exposición", "tipo": "conteo o numérica positiva (opcional)", "papel": "ensayos (binomial) o exposición (Poisson y binomial negativa)" }
      ],
      "minimo": "Al menos 5 o 6 niveles en cada agrupamiento aleatorio y varias observaciones por nivel; con menos, su varianza queda mal estimada.",
      "balance": "Las filas con faltantes se quitan; que los grupos tengan distinto número de observaciones no es problema para el ajuste por máxima verosimilitud.",
      "notaFormato": "Formato largo: una fila por observación, con una columna por cada factor de agrupamiento (bloque, parcela, animal). Los agrupamientos numéricos se tratan como factor.",
      "errores": [
        "Numerar las parcelas igual en todos los bloques (1, 2, 3…) y escribir (1 | parcela): junta parcelas distintas. Usa (1 | bloque/parcela) o un identificador único.",
        "Poner como aleatorio un factor de 2 o 3 niveles.",
        "Pedir pendientes aleatorias con la gamma (no se admiten) o con pocos datos por grupo.",
        "Poner la misma columna en dos papeles (como respuesta y en la fórmula, o como ensayos y como factor)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo (sobredispersión o dispersión, atípicos, ajuste singular o avisos del optimizador) y la nota con el modelo ajustado.",
        "Lee las pruebas χ² de Wald de los efectos fijos, primero las interacciones.",
        "Lee las varianzas de los efectos aleatorios y su prueba de razón de verosimilitudes.",
        "Lee los coeficientes con sus razones e intervalos, y las medias de cada nivel con sus letras.",
        "Compara fórmulas o familias distintas con el AIC (menor es mejor), siempre con los mismos datos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los trips por brote se analizaron con un modelo lineal generalizado mixto binomial negativo (θ = 5.5), con los bloques como efecto aleatorio. El tratamiento tuvo efecto (χ² de Wald = 16.8, 4 gl, p = 0.002). La varianza entre bloques fue nula (ajuste singular): los bloques no aportaron variación».",
      "guias": ["chi2", "componente", "lrt", "theta-nb", "aic", "loglik"]
    },
    "limitaciones": [
      "No tiene estructuras de correlación en el tiempo (como la autorregresiva): para mediciones repetidas de una respuesta continua usa medidas repetidas.",
      "Las pruebas de Wald no corrigen por pocos grupos; con 3 o 4 bloques los p son optimistas.",
      "La cuadratura de Gauss-Hermite solo está con un intercepto aleatorio en la binomial o la de Poisson; lo demás usa Laplace.",
      "Con la gamma solo hay interceptos aleatorios y no se prueban los efectos aleatorios."
    ],
    "referencias": [
      "Bolker, B. M., Brooks, M. E., Clark, C. J., Geange, S. W., Poulsen, J. R., Stevens, M. H. H., & White, J.-S. S. (2009). Generalized linear mixed models: A practical guide for ecology and evolution. Trends in Ecology & Evolution, 24(3), 127–135.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Pinheiro, J. C., & Bates, D. M. (1995). Approximations to the log-likelihood function in the nonlinear mixed-effects model. Journal of Computational and Graphical Statistics, 4(1), 12–35.",
      "Harrison, X. A. (2014). Using observation-level random effects to model overdispersion in count data in ecology and evolution. PeerJ, 2, e616.",
      "Stroup, W. W. (2013). Generalized linear mixed models: Modern concepts, methods and applications. CRC Press."
    ]
  },
  "en": {
    "alias": ["GLMM", "Generalized linear mixed model", "Generalized mixed model", "Negative binomial GLMM"],
    "paraQue": "Fits a generalized linear mixed model with the formula you write: fixed effects and random effects as in lme4, for example (1 | bloque).",
    "preguntas": [
      "Do the insecticides differ in thrips per shoot if overdispersion is modeled with the negative binomial and the blocks are random?",
      "Does the proportion of damaged fruits differ among varieties, with blocks and plots within blocks as random effects?",
      "Does the number of ticks per animal vary among treatments, with repeated measurements on each animal?"
    ],
    "teoria": [
      "When the data have several levels of grouping (plants within plots, plots within blocks, repeated measurements of the same animal) and the response is a count, a proportion or a skewed positive value, the generalized linear mixed model combines the family of the generalized linear model with a random effect for each grouping. Each random effect contributes a variance on the link scale and recognizes that units in the same group resemble each other, which avoids pseudoreplication.",
      "You write the right-hand side as in lme4: fixed effects with + and * (as in the linear model) and random effects in parentheses. (1 | bloque) gives one intercept per block, (1 | bloque/parcela) nests plots within blocks and (1 | animal) groups the measurements of the same animal. SigmaPro fits it in the R engine with glmer (binomial, Poisson or gamma) or glmer.nb (negative binomial) by the Laplace approximation, or by Gauss-Hermite quadrature when there is a single random intercept with the binomial or the Poisson. With the gamma only random intercepts are allowed.",
      "Fixed effects are tested with Wald χ² (type II or III) and each random effect with a likelihood ratio (except with the gamma). Means are given on the response scale for a typical group, with the random effects at zero. Overdispersion is handled with the negative binomial or with an observation-level random effect."
    ],
    "modelo": {
      "tex": "g(\\mathrm{E}(y \\mid b)) = \\mathbf{X}\\beta + \\mathbf{Z}b, \\quad b \\sim \\mathcal{N}(0, \\mathbf{G})",
      "terminos": [
        ["y", "the response: count, successes out of n trials, 0/1 or positive value"],
        ["b", "the random effects: one value per block, plot or animal"],
        ["g", "the link of the family (log, logit, probit, inverse…)"],
        ["\\mathbf{X}\\beta", "the fixed part: factors, covariates and interactions with their coefficients"],
        ["\\mathbf{Z}b", "the random part: each observation receives the effect of its groups"],
        ["\\mathbf{G}", "the variances (and covariances) of the random effects, on the link scale"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_k = 0 \\text{ in the columns of the term}", "h1": "\\text{some } \\beta_k \\ne 0", "texto": "The fixed term has no effect. Type II Wald χ² (or III, with sum-to-zero contrasts)." },
      { "h0": "\\sigma_{g}^{2} = 0", "h1": "\\sigma_{g}^{2} > 0", "texto": "The grouping adds no variation. Likelihood ratio against the model without that effect (a model without random effects if none is left); the p is conservative." }
    ],
    "supuestos": [
      { "nombre": "Suitable family and overdispersion", "como": "The checklist shows the negative binomial θ, the gamma dispersion, the variance of the observation-level effect or the Pearson χ²/df ratio.", "verificar": null, "siFalla": "With Poisson or grouped binomial data, add the observation-level effect (“Automatic” or “Yes, always”) or switch to the negative binomial.", "alternativa": null },
      { "nombre": "Enough groups and normal random effects", "como": "Not tested; count the levels of each grouping.", "verificar": null, "siFalla": "With fewer than 5 levels, enter that factor as a fixed effect.", "alternativa": "glm" },
      { "nombre": "Non-singular fit and convergence", "como": "The checklist warns of a singular fit (a variance at zero) or of optimizer warnings.", "verificar": null, "siFalla": "Simplify the random part: drop the effect with zero variance or the random slopes.", "alternativa": null },
      { "nombre": "Independence given the random effects", "como": "Given the groups, observations are independent; it is not tested with the data.", "verificar": null, "siFalla": "If nearby dates resemble each other more than distant ones, a random intercept is not enough; with a continuous response use repeated measures.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "count, successes out of n, binary (0/1) or positive numeric", "papel": "response" },
        { "nombre": "tratamiento", "tipo": "factor with k levels", "papel": "fixed effect" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "random grouping: (1 | bloque)" },
        { "nombre": "trials or exposure", "tipo": "count or positive numeric (optional)", "papel": "trials (binomial) or exposure (Poisson and negative binomial)" }
      ],
      "minimo": "At least 5 or 6 levels in each random grouping and several observations per level; with fewer, its variance is poorly estimated.",
      "balance": "Rows with missing values are dropped; groups with different numbers of observations are not a problem for maximum likelihood fitting.",
      "notaFormato": "Long format: one row per observation, with one column for each grouping factor (block, plot, animal). Numeric groupings are treated as factors.",
      "errores": [
        "Numbering plots the same way in every block (1, 2, 3…) and writing (1 | parcela): it lumps different plots together. Use (1 | bloque/parcela) or a unique identifier.",
        "Entering as random a factor with 2 or 3 levels.",
        "Requesting random slopes with the gamma (not allowed) or with few data per group.",
        "Putting the same column in two roles (as the response and in the formula, or as trials and as a factor)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist (overdispersion or dispersion, outliers, singular fit or optimizer warnings) and the note with the fitted model.",
        "Read the Wald χ² tests of the fixed effects, interactions first.",
        "Read the variances of the random effects and their likelihood ratio test.",
        "Read the coefficients with their ratios and intervals, and the means of each level with their letters.",
        "Compare different formulas or families with the AIC (lower is better), always on the same data."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Thrips per shoot were analyzed with a negative binomial generalized linear mixed model (θ = 5.5), with blocks as a random effect. Treatment had an effect (Wald χ² = 16.8, 4 df, p = 0.002). The between-block variance was zero (singular fit): the blocks added no variation.”",
      "guias": ["chi2", "componente", "lrt", "theta-nb", "aic", "loglik"]
    },
    "limitaciones": [
      "It has no correlation structures over time (such as autoregressive): for repeated measurements of a continuous response use repeated measures.",
      "Wald tests do not correct for few groups; with 3 or 4 blocks the p-values are optimistic.",
      "Gauss-Hermite quadrature is only available with a single random intercept in the binomial or the Poisson; everything else uses Laplace.",
      "With the gamma there are only random intercepts and the random effects are not tested."
    ],
    "referencias": [
      "Bolker, B. M., Brooks, M. E., Clark, C. J., Geange, S. W., Poulsen, J. R., Stevens, M. H. H., & White, J.-S. S. (2009). Generalized linear mixed models: A practical guide for ecology and evolution. Trends in Ecology & Evolution, 24(3), 127–135.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Pinheiro, J. C., & Bates, D. M. (1995). Approximations to the log-likelihood function in the nonlinear mixed-effects model. Journal of Computational and Graphical Statistics, 4(1), 12–35.",
      "Harrison, X. A. (2014). Using observation-level random effects to model overdispersion in count data in ecology and evolution. PeerJ, 2, e616.",
      "Stroup, W. W. (2013). Generalized linear mixed models: Modern concepts, methods and applications. CRC Press."
    ]
  }
});
