SP_FICHA({
  "id": "glmm-bloques",
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "bloques",
  "disenos": ["dbca"],
  "relacionados": ["glm-conteos", "glm-proporciones", "glmm", "mixto-bloques", "dbca"],
  "ejemplo": { "conjunto": "aguacate", "entradas": { "respuesta": "trips", "tratamientos": ["tratamiento"], "bloque": "bloque" }, "opciones": { "familia": "poisson", "sobredispersion": "auto" } },
  "formato": {
    "largo": [["bloque", "tratamiento", "trips"], ["1", "Testigo", "8"], ["1", "Azadiractina", "6"], ["1", "Spinosad", "1"], ["1", "Jabón potásico", "1"], ["1", "Beauveria", "3"], ["2", "Testigo", "5"]],
    "ancho": null
  },
  "es": {
    "alias": ["GLMM en bloques", "Modelo lineal generalizado mixto", "GLMM de Poisson", "GLMM binomial"],
    "paraQue": "Compara tratamientos con conteos o proporciones cuando los bloques son una muestra de muchos posibles y se tratan como efectos aleatorios.",
    "preguntas": [
      "¿Difieren cinco insecticidas en trips por brote, con seis bloques de la huerta tomados como aleatorios?",
      "¿Cambia la proporción de plantas con virosis entre híbridos de chile evaluados en varias localidades, cada una como bloque aleatorio?",
      "¿Reduce un herbicida el número de malezas por cuadro, con bloques aleatorios y un área muestreada distinta en cada cuadro?"
    ],
    "teoria": [
      "El modelo lineal generalizado mixto junta dos ideas: una familia para la respuesta (Poisson o binomial negativa para conteos, binomial para proporciones, gamma para valores positivos asimétricos) con su enlace, y efectos aleatorios para los bloques. Tratar los bloques como aleatorios dice que son una muestra de las condiciones en que se aplicará el resultado: su variación se estima como una varianza en la escala del enlace, y las medias de los tratamientos se refieren a un bloque típico, con el efecto del bloque en cero.",
      "SigmaPro ajusta el modelo en el motor R dentro de tu navegador, con lme4 (glmer o glmer.nb), por la aproximación de Laplace y con un control estricto de la convergencia. Con la binomial o la de Poisson, y sin el efecto por observación, puedes pedir la cuadratura adaptativa de Gauss-Hermite, más exacta con pocos ensayos por unidad. Los tratamientos (hasta tres factores cruzados) se prueban con χ² de Wald tipo II o III, y cada efecto aleatorio con una razón de verosimilitudes contra el modelo sin él.",
      "La sobredispersión también aparece aquí. Con conteos de Poisson o proporciones agrupadas, la opción «Automático» ajusta primero el modelo sin corregir y, si la prueba de Pearson da p < 0.05 con una razón mayor que 1.1, agrega un efecto aleatorio por observación: un valor normal para cada fila, en la escala del enlace, que absorbe la variación de más. La otra salida es elegir la binomial negativa."
    ],
    "modelo": {
      "tex": "g(\\mu_{ij}) = \\alpha + \\tau_i + b_j + u_{ij}, \\quad b_j \\sim \\mathcal{N}(0, \\sigma_{b}^{2}), \\quad u_{ij} \\sim \\mathcal{N}(0, \\sigma_{u}^{2})",
      "terminos": [
        ["\\mu_{ij}", "la media (conteo esperado o probabilidad) del tratamiento i en el bloque j"],
        ["g", "el enlace: logaritmo para conteos; logit, probit o log-log complementario para proporciones"],
        ["\\alpha", "el intercepto"],
        ["\\tau_i", "el efecto fijo del tratamiento i (con varios factores: efectos principales e interacciones)"],
        ["b_j", "el efecto aleatorio del bloque j, con varianza entre bloques en la escala del enlace"],
        ["u_{ij}", "el efecto aleatorio por observación, solo si se agrega por la sobredispersión"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma media en un bloque típico. Se prueba con la χ² de Wald (tipo II, o III con contrastes de suma cero)." },
      { "h0": "\\sigma_{b}^{2} = 0", "h1": "\\sigma_{b}^{2} > 0", "texto": "Los bloques no varían. Razón de verosimilitudes contra el modelo sin ese efecto; como la varianza no puede ser negativa, el p que se informa es conservador (el verdadero suele ser la mitad). No se hace con la gamma." }
    ],
    "supuestos": [
      { "nombre": "Sobredispersión modelada", "como": "El semáforo dice si se agregó el efecto por observación (con su varianza), la θ de la binomial negativa o, si elegiste «No», la razón Pearson χ²/gl.", "verificar": null, "siFalla": "Elige «Automático» o «Sí, siempre» en el efecto por observación, o la familia binomial negativa.", "alternativa": null },
      { "nombre": "Suficientes bloques y efectos de bloque normales", "como": "No se prueba en SigmaPro; cuenta los bloques: con menos de 5 la varianza queda mal estimada.", "verificar": null, "siFalla": "Con pocos bloques, trátalos como fijos en el GLM de conteos o de proporciones.", "alternativa": "glm-conteos" },
      { "nombre": "Ajuste no singular", "como": "El semáforo avisa «Ajuste singular» cuando una varianza queda en cero; entonces los EE se calculan con la matriz RX de lme4.", "verificar": null, "siFalla": "Una varianza de bloques en cero dice que los bloques no aportan; la prueba de los tratamientos sigue siendo válida, pero puedes simplificar a bloques fijos.", "alternativa": "glm-conteos" },
      { "nombre": "Independencia dentro de cada bloque", "como": "Dado el bloque, las unidades son independientes; lo asegura el sorteo.", "verificar": null, "siFalla": "Si hay varias plantas por parcela o mediciones repetidas, agrega esos efectos en la fórmula del modelo mixto generalizado.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "conteo (o éxitos de n, o 0/1, o numérica positiva con la gamma)", "papel": "respuesta" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (1 a 3 factores)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloques (aleatorios)" },
        { "nombre": "ensayos o exposición", "tipo": "conteo o numérica positiva (opcional)", "papel": "ensayos (binomial) o exposición (conteos)" }
      ],
      "minimo": "Al menos 5 o 6 bloques para estimar su varianza con alguna precisión; con 3 o 4 la varianza es muy incierta y las pruebas de Wald tienden a ser liberales.",
      "balance": "Las filas con faltantes se quitan (en el ejemplo quedan 28 de 30). Con bloques aleatorios, los bloques incompletos también aportan información y el desbalance no impide el ajuste.",
      "notaFormato": "Formato largo: una fila por unidad experimental, con el bloque, los factores de tratamiento y el conteo (o los éxitos y los ensayos). Los bloques numerados se tratan como factor.",
      "errores": [
        "Tomar como aleatorios 2 o 3 bloques: no alcanzan para estimar una varianza.",
        "Capturar porcentajes en lugar de los éxitos y los ensayos.",
        "Esperar que las medias coincidan con los promedios crudos: son las de un bloque típico, en la escala de la respuesta.",
        "Contar como repeticiones las plantas de una misma parcela: necesitan su propio efecto aleatorio (escríbelo en la fórmula del modelo mixto generalizado)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee si se agregó el efecto por observación y revisa el semáforo: sobredispersión, atípicos y ajuste del modelo.",
        "En las pruebas de los efectos fijos, lee la χ² de Wald y la p de cada término (primero la interacción, si hay varios factores).",
        "Mira la varianza de los bloques (y la del efecto por observación) y su prueba de razón de verosimilitudes.",
        "Lee la media estimada de cada tratamiento con su intervalo y sus letras, y las razones de las comparaciones por pares.",
        "Compara alternativas (otra familia, con o sin efecto por observación) por su AIC, con los mismos datos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los trips por brote se analizaron con un modelo lineal generalizado mixto de Poisson con bloques aleatorios; como había sobredispersión (χ²/gl = 2.1, p = 0.002), se agregó un efecto aleatorio por observación. El tratamiento afectó el número de trips (χ² de Wald = 16.1, 4 gl, p = 0.003): en un bloque típico se esperaron 1.4 trips por brote con spinosad y 7.3 en el testigo. La varianza entre bloques fue prácticamente cero».",
      "guias": ["chi2", "componente", "lrt", "razon-tasas", "dispersion", "aic"]
    },
    "limitaciones": [
      "Para estructuras más complejas (parcelas dentro de bloques, varias plantas por parcela, localidades y bloques) escribe la fórmula en el modelo lineal generalizado mixto.",
      "Las pruebas χ² de Wald no corrigen por el número de bloques; con pocos bloques son algo liberales.",
      "Si la respuesta es continua y aproximadamente normal, el modelo mixto lineal de bloques aleatorios es más sencillo.",
      "Necesita el motor R: la primera vez tarda en cargar y corre más lento que los análisis del núcleo."
    ],
    "referencias": [
      "Bolker, B. M., Brooks, M. E., Clark, C. J., Geange, S. W., Poulsen, J. R., Stevens, M. H. H., & White, J.-S. S. (2009). Generalized linear mixed models: A practical guide for ecology and evolution. Trends in Ecology & Evolution, 24(3), 127–135.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Harrison, X. A. (2014). Using observation-level random effects to model overdispersion in count data in ecology and evolution. PeerJ, 2, e616.",
      "Stroup, W. W. (2013). Generalized linear mixed models: Modern concepts, methods and applications. CRC Press."
    ]
  },
  "en": {
    "alias": ["GLMM in blocks", "Generalized linear mixed model", "Poisson GLMM", "Binomial GLMM"],
    "paraQue": "Compares treatments with counts or proportions when the blocks are a sample of many possible ones and are treated as random effects.",
    "preguntas": [
      "Do five insecticides differ in thrips per shoot, with six orchard blocks taken as random?",
      "Does the proportion of virus-infected plants differ among chili hybrids assessed at several locations, each one a random block?",
      "Does a herbicide reduce the number of weeds per quadrat, with random blocks and a different sampled area in each quadrat?"
    ],
    "teoria": [
      "The generalized linear mixed model brings together two ideas: a family for the response (Poisson or negative binomial for counts, binomial for proportions, gamma for skewed positive values) with its link, and random effects for the blocks. Treating blocks as random states that they are a sample of the conditions where the result will be applied: their variation is estimated as a variance on the link scale, and the treatment means refer to a typical block, with the block effect at zero.",
      "SigmaPro fits the model in the R engine inside your browser, with lme4 (glmer or glmer.nb), by the Laplace approximation and with strict convergence control. With the binomial or the Poisson, and without the observation-level effect, you can request adaptive Gauss-Hermite quadrature, more accurate with few trials per unit. Treatments (up to three crossed factors) are tested with type II or III Wald χ², and each random effect with a likelihood ratio against the model without it.",
      "Overdispersion shows up here too. With Poisson counts or grouped proportions, the “Automatic” option first fits the uncorrected model and, if the Pearson test gives p < 0.05 with a ratio above 1.1, it adds an observation-level random effect: a normal value for each row, on the link scale, that absorbs the excess variation. The other way out is to choose the negative binomial."
    ],
    "modelo": {
      "tex": "g(\\mu_{ij}) = \\alpha + \\tau_i + b_j + u_{ij}, \\quad b_j \\sim \\mathcal{N}(0, \\sigma_{b}^{2}), \\quad u_{ij} \\sim \\mathcal{N}(0, \\sigma_{u}^{2})",
      "terminos": [
        ["\\mu_{ij}", "the mean (expected count or probability) of treatment i in block j"],
        ["g", "the link: log for counts; logit, probit or complementary log-log for proportions"],
        ["\\alpha", "the intercept"],
        ["\\tau_i", "the fixed effect of treatment i (with several factors: main effects and interactions)"],
        ["b_j", "the random effect of block j, with a between-block variance on the link scale"],
        ["u_{ij}", "the observation-level random effect, only if it is added because of overdispersion"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean in a typical block. Tested with the Wald χ² (type II, or III with sum-to-zero contrasts)." },
      { "h0": "\\sigma_{b}^{2} = 0", "h1": "\\sigma_{b}^{2} > 0", "texto": "The blocks do not vary. Likelihood ratio against the model without that effect; because a variance cannot be negative, the reported p is conservative (the true one is usually half). Not done with the gamma." }
    ],
    "supuestos": [
      { "nombre": "Overdispersion modeled", "como": "The assumptions checklist says whether the observation-level effect was added (with its variance), the negative binomial θ or, if you chose “No”, the Pearson χ²/df ratio.", "verificar": null, "siFalla": "Choose “Automatic” or “Yes, always” for the observation-level effect, or the negative binomial family.", "alternativa": null },
      { "nombre": "Enough blocks and normal block effects", "como": "Not tested in SigmaPro; count the blocks: with fewer than 5 the variance is poorly estimated.", "verificar": null, "siFalla": "With few blocks, treat them as fixed in the counts or proportions GLM.", "alternativa": "glm-conteos" },
      { "nombre": "Non-singular fit", "como": "The assumptions checklist warns “Singular fit” when a variance ends up at zero; the SEs are then computed from lme4’s RX matrix.", "verificar": null, "siFalla": "A block variance of zero says that blocks add nothing; the treatment test is still valid, but you can simplify to fixed blocks.", "alternativa": "glm-conteos" },
      { "nombre": "Independence within each block", "como": "Given the block, units are independent; randomization ensures it.", "verificar": null, "siFalla": "If there are several plants per plot or repeated measurements, add those effects in the formula of the generalized mixed model.", "alternativa": "glmm" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "count (or successes out of n, or 0/1, or positive numeric with the gamma)", "papel": "response" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (1 to 3 factors)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "blocks (random)" },
        { "nombre": "trials or exposure", "tipo": "count or positive numeric (optional)", "papel": "trials (binomial) or exposure (counts)" }
      ],
      "minimo": "At least 5 or 6 blocks to estimate their variance with some precision; with 3 or 4 the variance is very uncertain and Wald tests tend to be liberal.",
      "balance": "Rows with missing values are dropped (28 of 30 remain in the example). With random blocks, incomplete blocks still contribute information and imbalance does not prevent the fit.",
      "notaFormato": "Long format: one row per experimental unit, with the block, the treatment factors and the count (or the successes and trials). Numbered blocks are treated as a factor.",
      "errores": [
        "Taking 2 or 3 blocks as random: they are not enough to estimate a variance.",
        "Entering percentages instead of the successes and trials.",
        "Expecting the means to match the raw averages: they are those of a typical block, on the response scale.",
        "Counting plants from the same plot as replicates: they need their own random effect (write it in the formula of the generalized mixed model)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read whether the observation-level effect was added and check the assumptions checklist: overdispersion, outliers and model fit.",
        "In the tests of the fixed effects, read the Wald χ² and p of each term (the interaction first, if there are several factors).",
        "Look at the block variance (and that of the observation-level effect) and its likelihood ratio test.",
        "Read the estimated mean of each treatment with its interval and letters, and the ratios in the pairwise comparisons.",
        "Compare alternatives (another family, with or without the observation-level effect) by their AIC, on the same data."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Thrips per shoot were analyzed with a Poisson generalized linear mixed model with random blocks; because there was overdispersion (χ²/df = 2.1, p = 0.002), an observation-level random effect was added. Treatment affected the number of thrips (Wald χ² = 16.1, 4 df, p = 0.003): in a typical block, 1.4 thrips per shoot were expected with spinosad and 7.3 in the control. The between-block variance was practically zero.”",
      "guias": ["chi2", "componente", "lrt", "razon-tasas", "dispersion", "aic"]
    },
    "limitaciones": [
      "For more complex structures (plots within blocks, several plants per plot, locations and blocks) write the formula in the generalized linear mixed model.",
      "Wald χ² tests do not correct for the number of blocks; with few blocks they are somewhat liberal.",
      "If the response is continuous and roughly normal, the linear mixed model with random blocks is simpler.",
      "It needs the R engine: the first time it takes a while to load and it runs slower than the core analyses."
    ],
    "referencias": [
      "Bolker, B. M., Brooks, M. E., Clark, C. J., Geange, S. W., Poulsen, J. R., Stevens, M. H. H., & White, J.-S. S. (2009). Generalized linear mixed models: A practical guide for ecology and evolution. Trends in Ecology & Evolution, 24(3), 127–135.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Harrison, X. A. (2014). Using observation-level random effects to model overdispersion in count data in ecology and evolution. PeerJ, 2, e616.",
      "Stroup, W. W. (2013). Generalized linear mixed models: Modern concepts, methods and applications. CRC Press."
    ]
  }
});
