SP_FICHA({
  "id": "modelo-mixto",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": ["dbca", "parcelas", "latice", "multiambiente"],
  "relacionados": ["mixto-bloques", "mixto-divididas", "medidas-repetidas", "modelo-lineal", "glmm", "componentes-varianza"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend" }, "opciones": { "derecha": "hibrido * dosis + (1 | bloque)", "comoFactor": ["dosis"] } },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Modelo lineal mixto", "Modelo de efectos mixtos", "LMM", "lmer"],
    "paraQue": "Ajusta un modelo con efectos fijos (los tratamientos que te interesan) y efectos aleatorios (bloques, parcelas, plantas, años) escrito como fórmula.",
    "preguntas": [
      "¿Difieren los híbridos de maíz y las dosis de nitrógeno cuando los bloques se consideran una muestra aleatoria de las condiciones del terreno?",
      "¿Cuánto varía el peso del fruto entre plantas de una misma parcela y entre parcelas, además del efecto del sustrato?",
      "¿Crecen igual todas las plantas con los días, o cada planta tiene su propia pendiente de crecimiento?"
    ],
    "teoria": [
      "Muchos experimentos combinan dos clases de factores. Los efectos fijos son los niveles que elegiste y sobre los que quieres concluir: híbridos, dosis, sustratos. Los efectos aleatorios representan una población mayor de la que tus niveles son una muestra: bloques, parcelas, plantas, años o localidades; de ellos no interesa cada nivel, sino cuánto varían. El modelo lineal mixto los reúne: las observaciones de un mismo grupo comparten su efecto aleatorio, por eso están correlacionadas, y el modelo usa esa estructura para dar errores estándar y pruebas correctos.",
      "En SigmaPro escribes los términos como en lme4: los fijos como en el modelo lineal general y cada efecto aleatorio entre paréntesis con su agrupamiento, por ejemplo hibrido * dosis + (1 | bloque), (1 | bloque/parcela) para parcelas dentro de bloques o (dias | planta) para una pendiente por planta. El ajuste corre en el motor R de tu navegador con lme4 y lmerTest: estima las varianzas por REML (o por máxima verosimilitud), prueba los efectos fijos con F, sumas de cuadrados tipo III, II o I y grados de libertad de Satterthwaite o de Kenward-Roger, y calcula medias marginales (emmeans) con letras, también de un factor dentro de cada nivel de otro.",
      "Además prueba cada efecto aleatorio con una razón de verosimilitudes y predice el efecto de cada nivel (BLUP), encogido hacia cero según la información que hay de él. Si alguna varianza queda en cero, lme4 avisa de un ajuste singular: el modelo pide más de lo que los datos permiten estimar."
    ],
    "modelo": {
      "tex": "\\mathbf{y} = \\mathbf{X}\\beta + \\mathbf{Z}\\mathbf{u} + \\varepsilon, \\quad \\mathbf{u} \\sim \\mathcal{N}(0, \\mathbf{G}), \\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2 \\mathbf{I})",
      "terminos": [
        ["\\mathbf{y}", "el vector de respuestas, una por observación"],
        ["\\mathbf{X}\\beta", "la parte fija: los efectos de los tratamientos y covariables, con sus coeficientes"],
        ["\\mathbf{Z}\\mathbf{u}", "la parte aleatoria: el efecto de cada nivel de cada agrupamiento (bloque, parcela, planta)"],
        ["\\mathbf{G}", "las varianzas (y, con pendientes aleatorias, las correlaciones) de los efectos aleatorios"],
        ["\\sigma^2", "la varianza residual, la que queda dentro de los grupos"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Cada término fijo (efecto principal o interacción) no tiene efecto. Prueba F con los grados de libertad del denominador de Satterthwaite o de Kenward-Roger." },
      { "h0": "\\sigma^2_u = 0", "h1": "\\sigma^2_u > 0", "texto": "Un agrupamiento no aporta variación. Razón de verosimilitudes del modelo completo contra el modelo sin ese efecto aleatorio; como una varianza no puede ser negativa, el p que se muestra es conservador (el verdadero suele ser la mitad)." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis muestra la prueba de Shapiro-Wilk de los residuos (con 3 a 5000 residuos).", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox) y vuelve a ajustar; si son conteos o proporciones, usa un modelo generalizado mixto.", "alternativa": "glmm" },
      { "nombre": "Normalidad de los efectos aleatorios", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de un agrupamiento (dice cuál) cuando tiene 5 niveles o más.", "verificar": null, "siFalla": "Busca niveles atípicos (un bloque o una planta muy distintos) y revisa sus datos; con pocos niveles esta prueba tiene poco poder.", "alternativa": null },
      { "nombre": "Varianzas iguales", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos entre los niveles del primer factor fijo.", "verificar": null, "siFalla": "Si la varianza crece con la media, transforma la respuesta o usa un modelo generalizado mixto (gamma, Poisson).", "alternativa": "glmm" },
      { "nombre": "Ajuste estable (no singular)", "como": "El semáforo marca en ámbar el ajuste singular (una varianza en cero o una correlación en ±1) y la falta de convergencia; los avisos de lme4 aparecen traducidos.", "verificar": null, "siFalla": "Quita el efecto aleatorio cuya varianza quedó en cero o simplifica su estructura (sin correlación, con ||). Si ya no queda ningún efecto aleatorio, usa el modelo lineal general.", "alternativa": "modelo-lineal" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "hibrido, dosis", "tipo": "factor con k niveles (las numéricas se marcan como factor)", "papel": "efectos fijos" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "agrupamiento del efecto aleatorio" }
      ],
      "minimo": "Cada agrupamiento aleatorio necesita varios niveles con datos (5 o más para estimar bien su varianza) y debe haber más observaciones que niveles.",
      "balance": "No necesita datos balanceados: REML usa todas las filas completas; las que tienen faltantes en alguna columna del modelo quedan fuera y el cuadro de ajuste dice cuántas. Las medias marginales y los grados de libertad se ajustan al desbalance.",
      "notaFormato": "Formato largo: una fila por observación (parcela, planta o fecha), con una columna para la respuesta y una por cada factor fijo y cada agrupamiento.",
      "errores": [
        "Escribir la fórmula sin ningún término entre paréntesis, como (1 | bloque): sin efecto aleatorio la app pide usar el modelo lineal general.",
        "Dejar las dosis como numéricas sin marcarlas como factor: entran como una recta con un grado de libertad en vez de como niveles.",
        "Numerar las parcelas de nuevo dentro de cada bloque y escribir (1 | parcela): mezcla parcelas distintas; usa (1 | bloque/parcela) o un identificador único.",
        "Pedir un efecto aleatorio con 2 o 3 niveles (por ejemplo, dos años): su varianza casi no se puede estimar y el ajuste suele quedar singular.",
        "Promediar las submuestras (plantas, frutos) antes del análisis cuando quieres conocer la variación entre ellas."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee los avisos y el semáforo: un ajuste singular o sin convergencia pide simplificar los efectos aleatorios antes de interpretar.",
        "En el cuadro de efectos fijos, lee primero las interacciones; si son significativas, compara un factor dentro de cada nivel del otro («Dentro de cada nivel de»).",
        "Revisa los componentes de varianza (con interceptos aleatorios, también su porcentaje) y la prueba de los efectos aleatorios.",
        "Compara las medias marginales con sus letras y, si hace falta, las comparaciones por pares.",
        "Consulta los coeficientes y los BLUP para el detalle; el AIC y el BIC solo comparan modelos con los mismos efectos fijos cuando se ajustan por REML."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con los bloques como efecto aleatorio, el rendimiento difirió entre dosis de nitrógeno (F(3, 33) = 41.2, p < 0.001; grados de libertad de Satterthwaite), sin interacción con el híbrido (F(6, 33) = 1.1, p = 0.38). Los bloques explicaron el 18 % de la variación aleatoria (razón de verosimilitudes, p = 0.02)».",
      "guias": ["F", "p", "gl", "componente", "lrt", "blup", "media-ajustada", "aic"]
    },
    "limitaciones": [
      "Solo respuestas continuas con error normal: para conteos o proporciones con efectos aleatorios usa el modelo lineal generalizado mixto.",
      "Corre en el motor R dentro del navegador, que se descarga la primera vez; tarda más que los métodos del núcleo propio.",
      "No modela una correlación que baja con la distancia entre fechas de una misma unidad: para eso usa medidas repetidas con estructuras de covarianza.",
      "Con pocos niveles por agrupamiento, las varianzas y las pruebas F son imprecisas; Kenward-Roger corrige mejor con muestras chicas."
    ],
    "referencias": [
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Kenward, M. G., & Roger, J. H. (1997). Small sample inference for fixed effects from restricted maximum likelihood. Biometrics, 53(3), 983–997.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114.",
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley."
    ]
  },
  "en": {
    "alias": ["Linear mixed model", "Mixed-effects model", "LMM", "lmer"],
    "paraQue": "Fits a model with fixed effects (the treatments you care about) and random effects (blocks, plots, plants, years) written as a formula.",
    "preguntas": [
      "Do maize hybrids and nitrogen rates differ when blocks are considered a random sample of the field conditions?",
      "How much does fruit weight vary among plants within a plot and among plots, besides the effect of the substrate?",
      "Do all plants grow alike over the days, or does each plant have its own growth slope?"
    ],
    "teoria": [
      "Many experiments combine two kinds of factors. Fixed effects are the levels you chose and want to draw conclusions about: hybrids, rates, substrates. Random effects stand for a larger population of which your levels are a sample: blocks, plots, plants, years or locations; what matters is not each level but how much they vary. The linear mixed model brings them together: observations in the same group share their random effect, so they are correlated, and the model uses that structure to give correct standard errors and tests.",
      "In SigmaPro you write the terms as in lme4: fixed terms as in the general linear model and each random effect in parentheses with its grouping, for example hibrido * dosis + (1 | bloque), (1 | bloque/parcela) for plots within blocks, or (dias | planta) for one slope per plant. The fit runs in the R engine inside your browser with lme4 and lmerTest: it estimates the variances by REML (or maximum likelihood), tests the fixed effects with F, type III, II or I sums of squares and Satterthwaite or Kenward-Roger degrees of freedom, and computes marginal means (emmeans) with letters, also for one factor within each level of another.",
      "It also tests each random effect with a likelihood ratio and predicts the effect of each level (BLUP), shrunk toward zero according to how much information there is about it. If a variance ends up at zero, lme4 warns of a singular fit: the model asks for more than the data can estimate."
    ],
    "modelo": {
      "tex": "\\mathbf{y} = \\mathbf{X}\\beta + \\mathbf{Z}\\mathbf{u} + \\varepsilon, \\quad \\mathbf{u} \\sim \\mathcal{N}(0, \\mathbf{G}), \\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2 \\mathbf{I})",
      "terminos": [
        ["\\mathbf{y}", "the vector of responses, one per observation"],
        ["\\mathbf{X}\\beta", "the fixed part: the effects of treatments and covariates, with their coefficients"],
        ["\\mathbf{Z}\\mathbf{u}", "the random part: the effect of each level of each grouping (block, plot, plant)"],
        ["\\mathbf{G}", "the variances (and, with random slopes, the correlations) of the random effects"],
        ["\\sigma^2", "the residual variance, what is left within groups"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "Each fixed term (main effect or interaction) has no effect. F test with Satterthwaite or Kenward-Roger denominator degrees of freedom." },
      { "h0": "\\sigma^2_u = 0", "h1": "\\sigma^2_u > 0", "texto": "A grouping adds no variation. Likelihood ratio of the full model against the model without that random effect; since a variance cannot be negative, the p shown is conservative (the true one is usually half)." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist shows the Shapiro-Wilk test of the residuals (with 3 to 5000 residuals).", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox) and refit; if the data are counts or proportions, use a generalized linear mixed model.", "alternativa": "glmm" },
      { "nombre": "Normality of random effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of one grouping (it says which) when it has 5 levels or more.", "verificar": null, "siFalla": "Look for outlying levels (a block or a plant far from the rest) and check their data; with few levels this test has little power.", "alternativa": null },
      { "nombre": "Equal variances", "como": "The assumptions checklist applies Levene’s test (with the median) to the residuals across the levels of the first fixed factor.", "verificar": null, "siFalla": "If the variance grows with the mean, transform the response or use a generalized linear mixed model (gamma, Poisson).", "alternativa": "glmm" },
      { "nombre": "Stable (nonsingular) fit", "como": "The assumptions checklist flags in amber a singular fit (a variance at zero or a correlation at ±1) and lack of convergence; lme4 warnings are shown translated.", "verificar": null, "siFalla": "Drop the random effect whose variance is zero or simplify its structure (no correlation, with ||). If no random effect is left, use the general linear model.", "alternativa": "modelo-lineal" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "hibrido, dosis", "tipo": "factor with k levels (numeric columns are marked as factors)", "papel": "fixed effects" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "grouping of the random effect" }
      ],
      "minimo": "Each random grouping needs several levels with data (5 or more to estimate its variance well), and there must be more observations than levels.",
      "balance": "Balanced data are not required: REML uses every complete row; rows with missing values in any model column are left out and the model fit table says how many. Marginal means and degrees of freedom adjust to the imbalance.",
      "notaFormato": "Long format: one row per observation (plot, plant or date), with a column for the response and one for each fixed factor and each grouping.",
      "errores": [
        "Writing the formula with no term in parentheses, such as (1 | bloque): without a random effect the app asks you to use the general linear model.",
        "Leaving the rates as numeric without marking them as a factor: they enter as a straight line with one degree of freedom instead of as levels.",
        "Numbering plots again within each block and writing (1 | parcela): it mixes different plots; use (1 | bloque/parcela) or a unique identifier.",
        "Asking for a random effect with 2 or 3 levels (for example, two years): its variance can hardly be estimated and the fit is usually singular.",
        "Averaging subsamples (plants, fruits) before the analysis when you want to know the variation among them."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the warnings and the assumptions checklist: a singular or nonconverged fit calls for simplifying the random effects before interpreting.",
        "In the fixed-effects table, read the interactions first; if they are significant, compare one factor within each level of the other (“Within each level of”).",
        "Check the variance components (with random intercepts, also their percentage) and the test of the random effects.",
        "Compare the marginal means with their letters and, if needed, the pairwise comparisons.",
        "See the coefficients and BLUPs for detail; AIC and BIC only compare models with the same fixed effects when fitted by REML."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With blocks as a random effect, yield differed among nitrogen rates (F(3, 33) = 41.2, p < 0.001; Satterthwaite degrees of freedom), with no interaction with hybrid (F(6, 33) = 1.1, p = 0.38). Blocks accounted for 18% of the random variation (likelihood ratio, p = 0.02).”",
      "guias": ["F", "p", "gl", "componente", "lrt", "blup", "media-ajustada", "aic"]
    },
    "limitaciones": [
      "Only continuous responses with normal error: for counts or proportions with random effects use the generalized linear mixed model.",
      "It runs in the R engine inside the browser, which is downloaded the first time; it is slower than the methods of the built-in core.",
      "It does not model a correlation that decreases with the distance between dates of the same unit: for that use repeated measures with covariance structures.",
      "With few levels per grouping, the variances and F tests are imprecise; Kenward-Roger corrects better with small samples."
    ],
    "referencias": [
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Kenward, M. G., & Roger, J. H. (1997). Small sample inference for fixed effects from restricted maximum likelihood. Biometrics, 53(3), 983–997.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114.",
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley."
    ]
  }
});
