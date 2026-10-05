SP_FICHA({
  "id": "componentes-varianza",
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": ["muestreo", "dbca", "latice"],
  "relacionados": ["heredabilidad", "repetibilidad", "modelo-mixto", "mixto-latice", "muestreo-estratificado"],
  "ejemplo": { "conjunto": "alfa-latice", "entradas": { "respuesta": "rendimiento", "aleatorios": ["repeticion", "bloque"], "fijos": ["genotipo"] }, "opciones": { "estructura": "anidados" } },
  "formato": {
    "largo": [["repeticion", "bloque", "genotipo", "rendimiento"], ["R1", "B1", "G11", "4.1172"], ["R1", "B1", "G04", "4.4461"], ["R1", "B1", "G05", "5.8757"], ["R1", "B1", "G22", "4.5784"], ["R1", "B2", "G21", "4.654"], ["R1", "B2", "G10", "4.1736"], ["R1", "B2", "G20", "4.0141"]],
    "ancho": null
  },
  "es": {
    "alias": ["Componentes de varianza", "Partición de la varianza", "Estimación REML de varianzas", "Modelo de efectos aleatorios"],
    "paraQue": "Estima cuánta de la variación total de una respuesta se debe a cada fuente aleatoria (localidades, parcelas, plantas, evaluadores) y prueba si cada una aporta.",
    "preguntas": [
      "¿Dónde está la mayor parte de la variación del peso del fruto: entre huertas, entre árboles de una misma huerta o entre frutos del mismo árbol?",
      "¿Cuánto de la variación del rendimiento en un alfa-látice se debe a las repeticiones y a los bloques incompletos dentro de ellas?",
      "¿Conviene muestrear más plantas por parcela o más parcelas, si casi toda la variación está entre plantas?"
    ],
    "teoria": [
      "Un componente de varianza es la parte de la varianza total que corresponde a una fuente de variación aleatoria. Si pesas frutos de varios árboles en varias huertas, la variación total se reparte entre huertas, entre árboles de una huerta y entre frutos de un mismo árbol, que es el error. Conocer esas partes sirve para planear muestreos (dónde conviene poner más esfuerzo), para calcular la heredabilidad o la repetibilidad y para saber qué fuente domina.",
      "SigmaPro estima los componentes por máxima verosimilitud restringida (REML), que no se sesga por los efectos fijos y funciona con datos desbalanceados, con el algoritmo de información promedio que corre en tu navegador, validado contra lme4 de R. Admite hasta cuatro factores aleatorios cruzados, anidados (cada uno dentro de los anteriores, en el orden de sus columnas en la tabla) o cruzados con sus interacciones dobles, y hasta tres factores fijos cuyos efectos se descuentan antes de repartir la varianza. Una varianza no puede ser negativa: si su estimación lo fuera, el componente se fija en cero, en la frontera, y el modelo se ajusta sin él.",
      "Para cada componente da su varianza, su error estándar asintótico, su porcentaje de la varianza total y una prueba de razón de verosimilitudes restringidas contra el modelo sin él. Como la hipótesis nula está en la frontera (varianza igual a cero), el valor p usa la mezcla ½χ²₀ + ½χ²₁, que es la mitad del p de la χ² con un grado de libertad."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + a_i + b_{j(i)} + \\varepsilon_{ijk}, \\quad \\sigma^2_y = \\sigma^2_a + \\sigma^2_b + \\sigma^2_e",
      "terminos": [
        ["y_{ijk}", "la observación k de la unidad j dentro del grupo i"],
        ["\\mu", "la media general (más los efectos fijos, si los hay)"],
        ["a_i", "el efecto aleatorio del primer factor, con varianza \\sigma^2_a"],
        ["b_{j(i)}", "el efecto aleatorio del segundo factor anidado en el primero, con varianza \\sigma^2_b (con factores cruzados, b_j y su interacción con a_i)"],
        ["\\varepsilon_{ijk}", "el error, con varianza \\sigma^2_e"],
        ["\\sigma^2_y", "la varianza total, suma de los componentes"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_a = 0", "h1": "\\sigma^2_a > 0", "texto": "El factor no aporta variación más allá de la del error. Razón de verosimilitudes restringidas contra el modelo sin ese componente, con p de la mezcla ½χ²₀ + ½χ²₁; un componente en cero tiene p = 1." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis aplica Shapiro-Wilk a los residuos condicionales (con 3 a 5000 residuos).", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox) y vuelve a estimar.", "alternativa": null },
      { "nombre": "Normalidad de los efectos aleatorios", "como": "El semáforo aplica Shapiro-Wilk a los BLUP del primer factor aleatorio, si tiene 5 niveles o más y su varianza no quedó en cero.", "verificar": null, "siFalla": "Revisa los niveles con efectos extremos; un nivel atípico puede inflar su componente.", "alternativa": null },
      { "nombre": "Sin observaciones atípicas", "como": "El semáforo cuenta los residuos que pasan de 3.5 desviaciones estándar del error.", "verificar": null, "siFalla": "Revisa esas observaciones (errores de captura, unidades dañadas) antes de interpretar los componentes.", "alternativa": null },
      { "nombre": "Ajuste REML estable", "como": "El semáforo indica si el cálculo convergió y qué componentes quedaron en cero (en la frontera).", "verificar": null, "siFalla": "Un componente en cero significa que esa fuente no se distingue del error con estos datos; si el cálculo no converge, quita factores aleatorios o revisa que cada uno tenga varios niveles.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "repeticion, bloque", "tipo": "factor con k niveles (1 a 4 factores)", "papel": "factores aleatorios (aquí, anidados: bloque dentro de repetición)" },
        { "nombre": "genotipo", "tipo": "factor con k niveles (hasta 3 factores, opcional)", "papel": "factores fijos" }
      ],
      "minimo": "Cada factor aleatorio necesita varios niveles: con 2 o 3 su varianza es muy imprecisa; 5 o más dan una estimación útil.",
      "balance": "No necesita balance: REML usa las filas completas (las que tienen faltantes en alguna columna del modelo quedan fuera). Las columnas fijas que son combinación de otras se quitan, como en R.",
      "notaFormato": "Formato largo: una fila por observación (fruto, planta o parcela), con una columna por factor aleatorio, una por factor fijo y la respuesta.",
      "errores": [
        "Elegir «Anidados» con las columnas en otro orden: en la tabla, la del nivel más alto debe ir primero (huerta, después árbol, después fruto).",
        "Numerar los árboles 1, 2, 3 dentro de cada huerta y declararlos cruzados: el árbol 1 de una huerta no es el árbol 1 de otra; usa «Anidados».",
        "Poner como aleatorio un factor cuyos niveles elegiste a propósito (dosis, variedades que te interesan): va como fijo.",
        "Promediar las submuestras antes del análisis: desaparece el componente que querías estimar."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: que el cálculo haya convergido y qué componentes quedaron en cero.",
        "En el cuadro de componentes, mira el porcentaje de la varianza total para saber qué fuente domina.",
        "Lee la χ² de razón de verosimilitudes y su p para cada componente.",
        "Compara cada varianza con su error estándar: si el EE es parecido a la varianza, la estimación es poco precisa.",
        "En el cuadro de ajuste, la varianza total y la media general; el AIC y el BIC solo comparan modelos con los mismos efectos fijos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los bloques incompletos dentro de las repeticiones explicaron el 24 % de la varianza total del rendimiento (σ² = 0.06, EE = 0.04; χ² = 5.0, p = 0.013) y las repeticiones, el 44 % (σ² = 0.11, EE = 0.13; χ² = 6.4, p = 0.006), aunque con solo tres repeticiones esta última varianza es muy imprecisa».",
      "guias": ["componente", "lrt", "p", "ee", "aic"]
    },
    "limitaciones": [
      "Solo interceptos aleatorios: no estima pendientes aleatorias ni correlaciones; para eso usa la fórmula del modelo mixto.",
      "No prueba los efectos fijos con F: para eso usa el modelo lineal mixto.",
      "Supone una sola varianza del error para todos los grupos.",
      "Para la heredabilidad o la repetibilidad con sus fórmulas, BLUP y ganancia, usa los métodos específicos."
    ],
    "referencias": [
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley.",
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Gilmour, A. R., Thompson, R., & Cullis, B. R. (1995). Average information REML: An efficient algorithm for variance parameter estimation in linear mixed models. Biometrics, 51(4), 1440–1450.",
      "Self, S. G., & Liang, K.-Y. (1987). Asymptotic properties of maximum likelihood estimators and likelihood ratio tests under nonstandard conditions. Journal of the American Statistical Association, 82(398), 605–610.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  },
  "en": {
    "alias": ["Variance components", "Variance partitioning", "REML variance estimation", "Random-effects model"],
    "paraQue": "Estimates how much of the total variation of a response is due to each random source (locations, plots, plants, raters) and tests whether each one contributes.",
    "preguntas": [
      "Where is most of the variation in fruit weight: among orchards, among trees within an orchard or among fruits of the same tree?",
      "How much of the yield variation in an alpha lattice is due to replicates and to the incomplete blocks within them?",
      "Is it better to sample more plants per plot or more plots, if almost all the variation is among plants?"
    ],
    "teoria": [
      "A variance component is the part of the total variance that belongs to a random source of variation. If you weigh fruits from several trees in several orchards, the total variation is split among orchards, among trees within an orchard and among fruits of the same tree, which is the error. Knowing those parts helps to plan sampling (where to put more effort), to compute heritability or repeatability and to know which source dominates.",
      "SigmaPro estimates the components by restricted maximum likelihood (REML), which is not biased by the fixed effects and works with unbalanced data, using the average information algorithm that runs in your browser, validated against R’s lme4. It allows up to four random factors that are crossed, nested (each within the previous ones, in the order of their columns in the table) or crossed with their two-way interactions, and up to three fixed factors whose effects are removed before the variance is split. A variance cannot be negative: if its estimate would be, the component is fixed at zero, on the boundary, and the model is fitted without it.",
      "For each component it gives its variance, its asymptotic standard error, its percentage of the total variance and a restricted likelihood ratio test against the model without it. Because the null hypothesis lies on the boundary (variance equal to zero), the p value uses the mixture ½χ²₀ + ½χ²₁, which is half the p of the χ² with one degree of freedom."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + a_i + b_{j(i)} + \\varepsilon_{ijk}, \\quad \\sigma^2_y = \\sigma^2_a + \\sigma^2_b + \\sigma^2_e",
      "terminos": [
        ["y_{ijk}", "observation k of unit j within group i"],
        ["\\mu", "the overall mean (plus the fixed effects, if any)"],
        ["a_i", "the random effect of the first factor, with variance \\sigma^2_a"],
        ["b_{j(i)}", "the random effect of the second factor nested in the first, with variance \\sigma^2_b (with crossed factors, b_j and its interaction with a_i)"],
        ["\\varepsilon_{ijk}", "the error, with variance \\sigma^2_e"],
        ["\\sigma^2_y", "the total variance, the sum of the components"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_a = 0", "h1": "\\sigma^2_a > 0", "texto": "The factor adds no variation beyond the error. Restricted likelihood ratio against the model without that component, with p from the mixture ½χ²₀ + ½χ²₁; a component at zero has p = 1." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist applies Shapiro-Wilk to the conditional residuals (with 3 to 5000 residuals).", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox) and estimate again.", "alternativa": null },
      { "nombre": "Normality of random effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of the first random factor, if it has 5 levels or more and its variance is not zero.", "verificar": null, "siFalla": "Check the levels with extreme effects; one outlying level can inflate its component.", "alternativa": null },
      { "nombre": "No outlying observations", "como": "The assumptions checklist counts the residuals beyond 3.5 error standard deviations.", "verificar": null, "siFalla": "Check those observations (data-entry errors, damaged units) before interpreting the components.", "alternativa": null },
      { "nombre": "Stable REML fit", "como": "The assumptions checklist says whether the computation converged and which components ended up at zero (on the boundary).", "verificar": null, "siFalla": "A component at zero means that source cannot be told apart from the error with these data; if the computation does not converge, remove random factors or check that each one has several levels.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "repeticion, bloque", "tipo": "factor with k levels (1 to 4 factors)", "papel": "random factors (here nested: block within replicate)" },
        { "nombre": "genotipo", "tipo": "factor with k levels (up to 3 factors, optional)", "papel": "fixed factors" }
      ],
      "minimo": "Each random factor needs several levels: with 2 or 3 its variance is very imprecise; 5 or more give a useful estimate.",
      "balance": "Balance is not required: REML uses the complete rows (rows with missing values in any model column are left out). Fixed columns that are combinations of others are dropped, as in R.",
      "notaFormato": "Long format: one row per observation (fruit, plant or plot), with a column for each random factor, one for each fixed factor and the response.",
      "errores": [
        "Choosing “Nested” with the columns in another order: in the table, the one for the highest level must come first (orchard, then tree, then fruit).",
        "Numbering trees 1, 2, 3 within each orchard and declaring them crossed: tree 1 of one orchard is not tree 1 of another; use “Nested”.",
        "Making random a factor whose levels you chose on purpose (rates, varieties you care about): it goes as fixed.",
        "Averaging subsamples before the analysis: the component you wanted to estimate disappears."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: that the computation converged and which components ended up at zero.",
        "In the components table, look at the percentage of the total variance to see which source dominates.",
        "Read the likelihood ratio χ² and its p for each component.",
        "Compare each variance with its standard error: if the SE is close to the variance, the estimate is imprecise.",
        "In the model fit table, the total variance and the overall mean; AIC and BIC only compare models with the same fixed effects."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Incomplete blocks within replicates accounted for 24% of the total yield variance (σ² = 0.06, SE = 0.04; χ² = 5.0, p = 0.013) and replicates for 44% (σ² = 0.11, SE = 0.13; χ² = 6.4, p = 0.006), although with only three replicates the latter variance is very imprecise.”",
      "guias": ["componente", "lrt", "p", "ee", "aic"]
    },
    "limitaciones": [
      "Random intercepts only: it does not estimate random slopes or correlations; for that use the mixed-model formula.",
      "It does not test the fixed effects with F: for that use the linear mixed model.",
      "It assumes a single error variance for all groups.",
      "For heritability or repeatability with their formulas, BLUPs and gain, use the specific methods."
    ],
    "referencias": [
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley.",
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Gilmour, A. R., Thompson, R., & Cullis, B. R. (1995). Average information REML: An efficient algorithm for variance parameter estimation in linear mixed models. Biometrics, 51(4), 1440–1450.",
      "Self, S. G., & Liang, K.-Y. (1987). Asymptotic properties of maximum likelihood estimators and likelihood ratio tests under nonstandard conditions. Journal of the American Statistical Association, 82(398), 605–610.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  }
});
