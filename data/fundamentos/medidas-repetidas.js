SP_FICHA({
  "id": "medidas-repetidas",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": ["medidas-repetidas"],
  "relacionados": ["modelo-mixto", "mixto-divididas", "curva-crecimiento", "repetibilidad", "manova", "glmm"],
  "ejemplo": { "conjunto": "maiz-altura", "entradas": { "respuesta": "altura", "tiempo": "dds", "sujeto": "planta", "tratamientos": ["tratamiento"], "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "tratamiento", "planta", "dds", "altura"], ["B1", "N0", "1", "15", "20.1"], ["B1", "N0", "1", "30", "59"], ["B1", "N0", "1", "45", "143.1"], ["B1", "N0", "1", "60", "187.8"], ["B1", "N0", "1", "75", "215.1"], ["B1", "N60", "1", "15", "23.5"], ["B1", "N60", "1", "30", "70.1"]],
    "ancho": [["bloque", "tratamiento", "planta", "altura_15", "altura_30", "altura_45", "altura_60", "altura_75"], ["B1", "N0", "1", "20.1", "59", "143.1", "187.8", "215.1"], ["B1", "N60", "1", "23.5", "70.1", "163.5", "226.9", "233.6"], ["B1", "N120", "1", "21.5", "72", "169.9", "235.4", "240.1"]]
  },
  "es": {
    "alias": ["Medidas repetidas en el tiempo", "Mediciones repetidas con estructuras de covarianza", "Mínimos cuadrados generalizados (gls)", "Datos longitudinales"],
    "paraQue": "Analiza la misma planta, parcela o animal medido en varias fechas, modelando la correlación entre fechas con la estructura de covarianza que mejor se ajusta.",
    "preguntas": [
      "¿Crece distinto el maíz con cuatro dosis de nitrógeno a lo largo de cinco fechas de medición, y desde cuándo se separan las dosis?",
      "¿Cambia con el tiempo el contenido de clorofila de hojas tratadas con tres bioestimulantes?",
      "¿Difiere el peso de los animales alimentados con dos dietas a lo largo de ocho pesajes semanales?"
    ],
    "teoria": [
      "Cuando se mide la misma unidad varias veces, las mediciones no son independientes: una planta alta a los 30 días probablemente siga alta a los 45, y la correlación suele ser mayor entre fechas cercanas que entre fechas lejanas. La varianza también suele crecer con el tiempo. Tratar las fechas como repeticiones independientes, o analizar cada fecha por separado, ignora esa estructura y da pruebas engañosas.",
      "SigmaPro ajusta un modelo de mínimos cuadrados generalizados por REML (gls de nlme, en el motor R de tu navegador) con los tratamientos (hasta dos factores), el tiempo como factor, sus interacciones y, si los hay, los bloques como efecto fijo aditivo. Entre las fechas de una unidad prueba varias estructuras de covarianza: independientes; simetría compuesta, con la misma correlación entre cualquier par de fechas, y su versión heterogénea; AR(1), con una correlación que baja con la distancia entre fechas, y su versión heterogénea; AR(1) continua para fechas desiguales, si el tiempo es numérico; y no estructurada, con 8 fechas o menos salvo que la pidas. Como todas tienen los mismos efectos fijos, compara sus AIC (o BIC) y elige la menor, o usa la que indiques.",
      "Con la estructura elegida da el análisis de varianza marginal (como tipo III) de tratamientos, tiempo e interacción, con los grados de libertad del error de nlme (N − p); la matriz de covarianzas y correlaciones entre fechas; los parámetros de correlación; y las medias marginales con letras, por omisión de los tratamientos dentro de cada fecha. La unidad es la combinación de sujeto, tratamiento y bloque."
    ],
    "modelo": {
      "tex": "y_{ijkt} = \\mu + \\tau_i + \\beta_k + \\gamma_t + (\\tau\\gamma)_{it} + \\varepsilon_{ijkt}, \\quad \\mathrm{Corr}(\\varepsilon_{ijkt}, \\varepsilon_{ijks}) = \\rho^{|t - s|}",
      "terminos": [
        ["y_{ijkt}", "la respuesta de la unidad j del tratamiento i en el bloque k, en la fecha t"],
        ["\\tau_i, \\beta_k", "los efectos fijos del tratamiento y del bloque (si hay bloques)"],
        ["\\gamma_t, (\\tau\\gamma)_{it}", "el efecto de la fecha (como factor) y la interacción tratamiento × fecha"],
        ["\\varepsilon_{ijkt}", "el error, correlacionado entre las fechas de una misma unidad e independiente entre unidades"],
        ["\\rho^{|t - s|}", "la correlación entre dos fechas con la estructura AR(1), que baja con la distancia entre ellas (las otras estructuras la modelan distinto)"]
      ]
    },
    "hipotesis": [
      { "h0": "(\\tau\\gamma)_{it} = 0", "h1": "\\text{alguna } (\\tau\\gamma)_{it} \\ne 0", "texto": "Los tratamientos cambian igual a lo largo del tiempo (curvas paralelas). Es la prueba que conviene leer primero." },
      { "h0": "\\tau_1 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Promediando las fechas, los tratamientos tienen la misma media. Prueba F marginal." },
      { "h0": "\\gamma_1 = \\cdots = \\gamma_f = 0", "h1": "\\text{algún } \\gamma_t \\ne 0", "texto": "La respuesta no cambia con el tiempo. Prueba F marginal." }
    ],
    "supuestos": [
      { "nombre": "Estructura de covarianza adecuada", "como": "El cuadro de estructuras comparadas muestra el AIC y el BIC de cada candidata ajustada por REML y marca la elegida (o las que no se pudieron ajustar).", "verificar": null, "siFalla": "Si dos estructuras difieren en menos de 2 unidades de AIC, prefiere la más sencilla; si ninguna converge, reduce las candidatas o el número de fechas.", "alternativa": null },
      { "nombre": "Normalidad de los residuos", "como": "El semáforo aplica Shapiro-Wilk a los residuos normalizados (los que ya descuentan la correlación entre fechas).", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox); si son conteos o proporciones, usa un modelo generalizado mixto.", "alternativa": "glmm" },
      { "nombre": "Varianzas entre fechas", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos normalizados entre fechas.", "verificar": null, "siFalla": "Pide una estructura heterogénea (simetría compuesta o AR(1) heterogéneas, o no estructurada), que da a cada fecha su propia varianza, o transforma la respuesta.", "alternativa": null },
      { "nombre": "Independencia entre unidades", "como": "La da el sorteo de los tratamientos entre unidades; no se prueba con los datos.", "verificar": null, "siFalla": "Si mediste varias plantas por parcela, la parcela es la unidad: promedia las plantas o escribe los efectos aleatorios de parcela y planta en el modelo mixto.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "dds", "tipo": "numérica (días, semanas) o factor", "papel": "tiempo (fecha de medición)" },
        { "nombre": "planta", "tipo": "identificador", "papel": "unidad medida en cada fecha (sujeto)" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (hasta 2 factores; pueden faltar)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles (opcional)", "papel": "bloques (fijos)" }
      ],
      "minimo": "Al menos 2 fechas (mejor 3 o más) y 3 o más unidades por tratamiento; la estructura no estructurada pide bastantes más unidades que fechas.",
      "balance": "Las fechas perdidas de una unidad no la eliminan: las filas con faltantes quedan fuera y el modelo usa las demás fechas de esa unidad. El cuadro de ajuste dice cuántas filas quedaron fuera.",
      "notaFormato": "Formato largo: una fila por unidad y fecha. Si tus datos tienen una columna por fecha (formato ancho), pásalos a largo en Datos con «Ancha ⇄ larga». El número de planta puede repetirse en cada tratamiento y bloque.",
      "errores": [
        "Analizar las fechas como repeticiones independientes (tratamiento × tiempo con un solo error): las pruebas del tiempo y de la interacción salen demasiado optimistas.",
        "Analizar cada fecha por separado: multiplica las pruebas y no responde si las curvas de los tratamientos difieren.",
        "Dejar los datos en formato ancho, con una columna por fecha.",
        "Elegir como unidad una columna que no identifica lo que se midió repetidamente (por ejemplo, un número distinto en cada fecha): sin unidades que se repitan no hay medidas repetidas."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira el cuadro de estructuras de covarianza comparadas: la elegida tiene el menor AIC (o BIC); diferencias menores que 2 no distinguen entre estructuras.",
        "Revisa el semáforo de los residuos normalizados.",
        "En el cuadro de efectos fijos, lee primero la interacción tratamiento × tiempo: si es significativa, compara los tratamientos dentro de cada fecha.",
        "Revisa la matriz de covarianzas y correlaciones entre fechas: cómo cambia la varianza con el tiempo y cuánto se parecen las fechas cercanas.",
        "Compara las medias de los tratamientos en cada fecha con sus letras."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La estructura AR(1) heterogénea tuvo el menor AIC entre las candidatas. La interacción dosis × fecha fue significativa (F(12, 57) = 5.7, p < 0.001): las dosis no difirieron a los 15 días, pero desde los 30 días las plantas sin nitrógeno fueron más bajas (Tukey, α = 0.05). La correlación entre fechas consecutivas de una misma planta fue de 0.62».",
      "guias": ["aic", "bic", "delta-aic", "F", "p", "loglik", "p-ajustado"]
    },
    "limitaciones": [
      "No incluye efectos aleatorios (por ejemplo, una pendiente por planta) ni varios niveles de agrupamiento: para eso usa la fórmula del modelo mixto.",
      "Los grados de libertad del denominador son los del error (N − p), como en nlme; con pocas unidades, la prueba de los tratamientos, que varían entre unidades, puede ser algo liberal.",
      "Trata el tiempo como factor: para describir la forma de la curva (logística, Gompertz) usa la curva de crecimiento.",
      "Para conteos o proporciones a lo largo del tiempo usa un modelo generalizado mixto."
    ],
    "referencias": [
      "Pinheiro, J. C., & Bates, D. M. (2000). Mixed-effects models in S and S-PLUS. Springer.",
      "Wolfinger, R. D. (1993). Covariance structure selection in general mixed models. Communications in Statistics – Simulation and Computation, 22(4), 1079–1106.",
      "Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464.",
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723."
    ]
  },
  "en": {
    "alias": ["Repeated measures over time", "Repeated measurements with covariance structures", "Generalized least squares (gls)", "Longitudinal data"],
    "paraQue": "Analyzes the same plant, plot or animal measured on several dates, modeling the correlation between dates with the covariance structure that fits best.",
    "preguntas": [
      "Does maize grow differently under four nitrogen rates over five measurement dates, and from when do the rates separate?",
      "Does the chlorophyll content of leaves treated with three biostimulants change over time?",
      "Does the weight of animals fed two diets differ over eight weekly weighings?"
    ],
    "teoria": [
      "When the same unit is measured several times, the measurements are not independent: a plant that is tall at 30 days will probably still be tall at 45, and the correlation is usually higher between close dates than between distant ones. The variance also tends to grow over time. Treating the dates as independent replicates, or analyzing each date separately, ignores that structure and gives misleading tests.",
      "SigmaPro fits a generalized least squares model by REML (gls from nlme, in the R engine inside your browser) with the treatments (up to two factors), time as a factor, their interactions and, if present, the blocks as an additive fixed effect. Among the dates of a unit it tries several covariance structures: independent; compound symmetry, with the same correlation between any pair of dates, and its heterogeneous version; AR(1), with a correlation that decreases with the distance between dates, and its heterogeneous version; continuous AR(1) for unequal dates, if time is numeric; and unstructured, with 8 dates or fewer unless you ask for it. Since all have the same fixed effects, it compares their AIC (or BIC) and picks the lowest, or uses the one you specify.",
      "With the chosen structure it gives the marginal analysis of variance (like type III) of treatments, time and interaction, with the nlme error degrees of freedom (N − p); the covariance and correlation matrix between dates; the correlation parameters; and the marginal means with letters, by default for the treatments within each date. The unit is the combination of subject, treatment and block."
    ],
    "modelo": {
      "tex": "y_{ijkt} = \\mu + \\tau_i + \\beta_k + \\gamma_t + (\\tau\\gamma)_{it} + \\varepsilon_{ijkt}, \\quad \\mathrm{Corr}(\\varepsilon_{ijkt}, \\varepsilon_{ijks}) = \\rho^{|t - s|}",
      "terminos": [
        ["y_{ijkt}", "the response of unit j of treatment i in block k, on date t"],
        ["\\tau_i, \\beta_k", "the fixed effects of treatment and block (if there are blocks)"],
        ["\\gamma_t, (\\tau\\gamma)_{it}", "the effect of the date (as a factor) and the treatment × date interaction"],
        ["\\varepsilon_{ijkt}", "the error, correlated between the dates of the same unit and independent between units"],
        ["\\rho^{|t - s|}", "the correlation between two dates under the AR(1) structure, which decreases with the distance between them (the other structures model it differently)"]
      ]
    },
    "hipotesis": [
      { "h0": "(\\tau\\gamma)_{it} = 0", "h1": "\\text{some } (\\tau\\gamma)_{it} \\ne 0", "texto": "The treatments change alike over time (parallel curves). This is the test to read first." },
      { "h0": "\\tau_1 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "Averaging over dates, the treatments have the same mean. Marginal F test." },
      { "h0": "\\gamma_1 = \\cdots = \\gamma_f = 0", "h1": "\\text{some } \\gamma_t \\ne 0", "texto": "The response does not change over time. Marginal F test." }
    ],
    "supuestos": [
      { "nombre": "Adequate covariance structure", "como": "The table of compared structures shows the AIC and BIC of each candidate fitted by REML and marks the chosen one (or those that could not be fitted).", "verificar": null, "siFalla": "If two structures differ by less than 2 AIC units, prefer the simpler one; if none converges, reduce the candidates or the number of dates.", "alternativa": null },
      { "nombre": "Normality of residuals", "como": "The assumptions checklist applies Shapiro-Wilk to the normalized residuals (which already remove the correlation between dates).", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox); if the data are counts or proportions, use a generalized linear mixed model.", "alternativa": "glmm" },
      { "nombre": "Variances across dates", "como": "The assumptions checklist applies Levene’s test (with the median) to the normalized residuals across dates.", "verificar": null, "siFalla": "Ask for a heterogeneous structure (heterogeneous compound symmetry or AR(1), or unstructured), which gives each date its own variance, or transform the response.", "alternativa": null },
      { "nombre": "Independence between units", "como": "It comes from randomizing the treatments among units; it is not tested with the data.", "verificar": null, "siFalla": "If you measured several plants per plot, the plot is the unit: average the plants or write the plot and plant random effects in the mixed model.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "dds", "tipo": "numeric (days, weeks) or factor", "papel": "time (measurement date)" },
        { "nombre": "planta", "tipo": "identifier", "papel": "unit measured on each date (subject)" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (up to 2 factors; optional)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels (optional)", "papel": "blocks (fixed)" }
      ],
      "minimo": "At least 2 dates (better 3 or more) and 3 or more units per treatment; the unstructured covariance needs many more units than dates.",
      "balance": "Missing dates of a unit do not remove it: rows with missing values are left out and the model uses the other dates of that unit. The model fit table says how many rows were left out.",
      "notaFormato": "Long format: one row per unit and date. If your data have one column per date (wide format), reshape them to long in Data with “Wide ⇄ long”. The plant number may repeat in each treatment and block.",
      "errores": [
        "Analyzing the dates as independent replicates (treatment × time with a single error): the tests of time and of the interaction come out too optimistic.",
        "Analyzing each date separately: it multiplies the tests and does not answer whether the treatment curves differ.",
        "Leaving the data in wide format, with one column per date.",
        "Choosing as the unit a column that does not identify what was measured repeatedly (for example, a different number on each date): without units that repeat there are no repeated measures."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the table of compared covariance structures: the chosen one has the lowest AIC (or BIC); differences smaller than 2 do not distinguish between structures.",
        "Check the assumptions checklist for the normalized residuals.",
        "In the fixed-effects table, read the treatment × time interaction first: if it is significant, compare the treatments within each date.",
        "Check the covariance and correlation matrix between dates: how the variance changes over time and how alike close dates are.",
        "Compare the treatment means on each date with their letters."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The heterogeneous AR(1) structure had the lowest AIC among the candidates. The rate × date interaction was significant (F(12, 57) = 5.7, p < 0.001): rates did not differ at 15 days, but from 30 days on the plants without nitrogen were shorter (Tukey, α = 0.05). The correlation between consecutive dates of the same plant was 0.62.”",
      "guias": ["aic", "bic", "delta-aic", "F", "p", "loglik", "p-ajustado"]
    },
    "limitaciones": [
      "It does not include random effects (for example, one slope per plant) or several grouping levels: for that use the mixed-model formula.",
      "The denominator degrees of freedom are those of the error (N − p), as in nlme; with few units, the test of the treatments, which vary between units, may be somewhat liberal.",
      "It treats time as a factor: to describe the shape of the curve (logistic, Gompertz) use the growth curve.",
      "For counts or proportions over time use a generalized linear mixed model."
    ],
    "referencias": [
      "Pinheiro, J. C., & Bates, D. M. (2000). Mixed-effects models in S and S-PLUS. Springer.",
      "Wolfinger, R. D. (1993). Covariance structure selection in general mixed models. Communications in Statistics – Simulation and Computation, 22(4), 1079–1106.",
      "Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464.",
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723."
    ]
  }
});
