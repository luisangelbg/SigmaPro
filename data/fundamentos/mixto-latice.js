SP_FICHA({
  "id": "mixto-latice",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["latice"],
  "relacionados": ["latice", "bib", "heredabilidad", "mixto-bloques", "modelo-mixto", "componentes-varianza"],
  "ejemplo": { "conjunto": "alfa-latice", "entradas": { "respuesta": "rendimiento", "tratamiento": "genotipo", "repeticion": "repeticion", "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["repeticion", "bloque", "genotipo", "rendimiento"], ["R1", "B1", "G11", "4.1172"], ["R1", "B1", "G04", "4.4461"], ["R1", "B1", "G05", "5.8757"], ["R1", "B1", "G22", "4.5784"], ["R1", "B2", "G21", "4.654"], ["R1", "B2", "G10", "4.1736"], ["R1", "B2", "G20", "4.0141"]],
    "ancho": null
  },
  "es": {
    "alias": ["Látice con recuperación de la información entre bloques", "Alfa-látice mixto", "Bloques incompletos aleatorios"],
    "paraQue": "Analiza un látice o alfa-látice con los bloques incompletos como efecto aleatorio, para que las medias de los tratamientos recuperen la información que hay entre bloques.",
    "preguntas": [
      "¿Cuál de 24 genotipos de un vivero de mejoramiento rinde más, si cada repetición se dividió en bloques incompletos de cuatro parcelas?",
      "¿Cuánto mejora la precisión de las medias de 100 líneas al tomar en cuenta la heterogeneidad del terreno dentro de cada repetición?",
      "¿Qué variedades conviene avanzar de un ensayo con demasiadas entradas para formar bloques completos homogéneos?"
    ],
    "teoria": [
      "Cuando hay muchos tratamientos (genotipos, líneas, clones), un bloque completo es demasiado grande para ser homogéneo. En el látice y el alfa-látice cada repetición contiene todos los tratamientos, pero se divide en bloques incompletos pequeños que solo tienen algunos. Las comparaciones entre tratamientos del mismo bloque son muy precisas; las de tratamientos que nunca coinciden en un bloque dependen de cómo se ajusten los efectos de bloque.",
      "Si los bloques incompletos se consideran fijos, la comparación usa solo la información dentro de los bloques. Si se consideran aleatorios, como aquí, el modelo mixto combina la información de dentro y de entre bloques (la recuperación de la información entre bloques) y pondera cada fuente según las varianzas estimadas por REML. Cuando la varianza de bloques es grande, el resultado se acerca al análisis intrabloque; cuando es pequeña, al de bloques completos. Así las medias ajustadas de los tratamientos aprovechan toda la información del ensayo.",
      "SigmaPro arma la fórmula tratamiento + repetición + (1 | repetición:bloque): las repeticiones fijas y cada bloque identificado dentro de su repetición, de modo que el bloque B1 de una repetición no se confunde con el B1 de otra. Si lo pides, las repeticiones también entran como aleatorias. El ajuste corre en el motor R de tu navegador con lme4 y lmerTest y da la F de los tratamientos (y de las repeticiones fijas) con grados de libertad de Satterthwaite o de Kenward-Roger, las varianzas de bloques y residual, la prueba de razón de verosimilitudes de los bloques, las medias marginales de los tratamientos con su error estándar y letras, y los BLUP de los bloques."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\tau_i + \\rho_j + b_{k(j)} + \\varepsilon_{ijk}, \\quad b_{k(j)} \\sim \\mathcal{N}(0, \\sigma^2_b), \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "la respuesta del tratamiento i en el bloque incompleto k de la repetición j"],
        ["\\tau_i", "el efecto fijo del tratamiento i"],
        ["\\rho_j", "el efecto fijo de la repetición j (aleatorio si marcas «Repeticiones también aleatorias»)"],
        ["b_{k(j)}", "el efecto aleatorio del bloque incompleto k dentro de la repetición j, con varianza \\sigma^2_b"],
        ["\\varepsilon_{ijk}", "el error de parcela, con varianza \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma media. Prueba F tipo III con grados de libertad de Satterthwaite o de Kenward-Roger, que combina la información de dentro y de entre bloques." },
      { "h0": "\\sigma^2_b = 0", "h1": "\\sigma^2_b > 0", "texto": "Los bloques incompletos no difieren: bloquear dentro de las repeticiones no sirvió. Razón de verosimilitudes; el p que se muestra es conservador (el verdadero suele ser la mitad)." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis muestra la prueba de Shapiro-Wilk de los residuos.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox) y vuelve a ajustar.", "alternativa": null },
      { "nombre": "Normalidad de los efectos de bloque", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de los bloques incompletos (con 5 bloques o más).", "verificar": null, "siFalla": "Revisa los bloques con efectos extremos (orillas, fallas de riego) y sus datos.", "alternativa": null },
      { "nombre": "Varianzas iguales", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos entre tratamientos; con pocas parcelas por tratamiento es poco sensible.", "verificar": null, "siFalla": "Prueba una transformación de la respuesta.", "alternativa": null },
      { "nombre": "Ajuste estable (no singular)", "como": "El semáforo marca en ámbar el ajuste singular: la varianza de los bloques incompletos quedó en cero.", "verificar": null, "siFalla": "Si los bloques incompletos no aportan variación, el ensayo se comporta como bloques completos con las repeticiones como bloques; el análisis intrabloque clásico permite compararlo.", "alternativa": "latice" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con t niveles", "papel": "tratamientos (fijos)" },
        { "nombre": "repeticion", "tipo": "factor con r niveles", "papel": "repetición (fija o aleatoria)" },
        { "nombre": "bloque", "tipo": "factor (se identifica dentro de cada repetición)", "papel": "bloque incompleto (aleatorio)" }
      ],
      "minimo": "Al menos 2 repeticiones (mejor 3 o más), cada una con todos los tratamientos una vez, divididas en bloques de pocas parcelas (por ejemplo, de 3 a 10).",
      "balance": "Tolera parcelas perdidas y bloques de distinto tamaño: REML usa las filas completas y las medias marginales se ajustan.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para la repetición, el bloque incompleto, el tratamiento y la respuesta. Los bloques pueden numerarse de nuevo en cada repetición.",
      "errores": [
        "Analizar el ensayo como bloques completos ignorando los bloques incompletos: pierdes el control de la heterogeneidad dentro de las repeticiones.",
        "Intercambiar las columnas de repetición y de bloque: el bloque es la subdivisión pequeña dentro de la repetición.",
        "Reportar las medias aritméticas de los tratamientos: en bloques incompletos no son comparables; usa las medias marginales ajustadas.",
        "Confundir el análisis de comparación de genotipos (fijos) con la selección: para heredabilidad y BLUP de genotipos se necesitan los genotipos aleatorios."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y si el ajuste es singular.",
        "Lee la F y la p de los tratamientos en el cuadro de efectos fijos.",
        "Compara la varianza de los bloques incompletos con la residual y lee su prueba de razón de verosimilitudes: si es grande, bloquear dentro de las repeticiones valió la pena.",
        "Compara las medias marginales de los tratamientos con sus errores estándar y letras.",
        "Consulta los BLUP de los bloques para ubicar las zonas mejores y peores del terreno."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los genotipos difirieron en rendimiento (F(23, 36.4) = 4.8, p < 0.001; grados de libertad de Satterthwaite). La varianza entre bloques incompletos fue el 26 % de la variación aleatoria (razón de verosimilitudes, p = 0.01), por lo que la recuperación de la información entre bloques mejoró la precisión de las medias. El genotipo con la media ajustada más alta rindió 5.3 t/ha».",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "ee"]
    },
    "limitaciones": [
      "Trata los genotipos como fijos: para seleccionar con heredabilidad y BLUP de genotipos usa «Heredabilidad y BLUP de genotipos».",
      "No da el coeficiente de variación ni el R²; el análisis clásico de látice (intrabloque, con bloques fijos) sí los da y sirve para comparar.",
      "Con pocos bloques o sin variación entre ellos, el ajuste queda singular y equivale a analizar bloques completos.",
      "No genera el diseño: necesitas el plano de campo con la repetición y el bloque de cada parcela."
    ],
    "referencias": [
      "Patterson, H. D., & Williams, E. R. (1976). A new class of resolvable incomplete block designs. Biometrika, 63(1), 83–92.",
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26."
    ]
  },
  "en": {
    "alias": ["Lattice with recovery of inter-block information", "Mixed-model alpha lattice", "Random incomplete blocks"],
    "paraQue": "Analyzes a lattice or alpha lattice with the incomplete blocks as a random effect, so that the treatment means recover the information between blocks.",
    "preguntas": [
      "Which of 24 genotypes in a breeding nursery yields most, if each replicate was divided into incomplete blocks of four plots?",
      "How much does the precision of the means of 100 lines improve when the field heterogeneity within each replicate is taken into account?",
      "Which varieties should advance from a trial with too many entries to form homogeneous complete blocks?"
    ],
    "teoria": [
      "When there are many treatments (genotypes, lines, clones), a complete block is too large to be homogeneous. In the lattice and the alpha lattice each replicate contains every treatment, but it is divided into small incomplete blocks that hold only some of them. Comparisons between treatments in the same block are very precise; those between treatments that never meet in a block depend on how the block effects are adjusted.",
      "If incomplete blocks are considered fixed, the comparison uses only the information within blocks. If they are considered random, as here, the mixed model combines the information within and between blocks (the recovery of inter-block information) and weights each source according to the variances estimated by REML. When the block variance is large, the result approaches the intra-block analysis; when it is small, the complete block analysis. The adjusted treatment means thus use all the information in the trial.",
      "SigmaPro builds the formula treatment + replicate + (1 | replicate:block): fixed replicates and each block identified within its replicate, so that block B1 of one replicate is not confused with B1 of another. If you ask for it, replicates also enter as random. The fit runs in the R engine inside your browser with lme4 and lmerTest and gives the F for treatments (and for fixed replicates) with Satterthwaite or Kenward-Roger degrees of freedom, the block and residual variances, the likelihood ratio test of the blocks, the marginal means of the treatments with their standard errors and letters, and the block BLUPs."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\tau_i + \\rho_j + b_{k(j)} + \\varepsilon_{ijk}, \\quad b_{k(j)} \\sim \\mathcal{N}(0, \\sigma^2_b), \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "the response of treatment i in incomplete block k of replicate j"],
        ["\\tau_i", "the fixed effect of treatment i"],
        ["\\rho_j", "the fixed effect of replicate j (random if you check “Replicates also random”)"],
        ["b_{k(j)}", "the random effect of incomplete block k within replicate j, with variance \\sigma^2_b"],
        ["\\varepsilon_{ijk}", "the plot error, with variance \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean. Type III F test with Satterthwaite or Kenward-Roger degrees of freedom, combining the information within and between blocks." },
      { "h0": "\\sigma^2_b = 0", "h1": "\\sigma^2_b > 0", "texto": "The incomplete blocks do not differ: blocking within replicates did not help. Likelihood ratio; the p shown is conservative (the true one is usually half)." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist shows the Shapiro-Wilk test of the residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox) and refit.", "alternativa": null },
      { "nombre": "Normality of block effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of the incomplete blocks (with 5 blocks or more).", "verificar": null, "siFalla": "Check blocks with extreme effects (edges, irrigation failures) and their data.", "alternativa": null },
      { "nombre": "Equal variances", "como": "The assumptions checklist applies Levene’s test (with the median) to the residuals across treatments; with few plots per treatment it is not very sensitive.", "verificar": null, "siFalla": "Try a transformation of the response.", "alternativa": null },
      { "nombre": "Stable (nonsingular) fit", "como": "The assumptions checklist flags a singular fit in amber: the incomplete-block variance ended up at zero.", "verificar": null, "siFalla": "If the incomplete blocks add no variation, the trial behaves like complete blocks with the replicates as blocks; the classical intra-block analysis lets you compare.", "alternativa": "latice" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with t levels", "papel": "treatments (fixed)" },
        { "nombre": "repeticion", "tipo": "factor with r levels", "papel": "replicate (fixed or random)" },
        { "nombre": "bloque", "tipo": "factor (identified within each replicate)", "papel": "incomplete block (random)" }
      ],
      "minimo": "At least 2 replicates (better 3 or more), each with every treatment once, divided into blocks of few plots (for example, 3 to 10).",
      "balance": "It tolerates lost plots and blocks of different sizes: REML uses the complete rows and the marginal means adjust.",
      "notaFormato": "Long format: one row per plot, with columns for the replicate, the incomplete block, the treatment and the response. Blocks may be numbered again in each replicate.",
      "errores": [
        "Analyzing the trial as complete blocks, ignoring the incomplete blocks: you lose control of the heterogeneity within replicates.",
        "Swapping the replicate and block columns: the block is the small subdivision within the replicate.",
        "Reporting the arithmetic means of the treatments: in incomplete blocks they are not comparable; use the adjusted marginal means.",
        "Confusing the comparison of genotypes (fixed) with selection: heritability and genotype BLUPs require random genotypes."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and whether the fit is singular.",
        "Read the F and p of the treatments in the fixed-effects table.",
        "Compare the incomplete-block variance with the residual one and read its likelihood ratio test: if it is large, blocking within replicates paid off.",
        "Compare the marginal means of the treatments with their standard errors and letters.",
        "See the block BLUPs to locate the better and worse areas of the field."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Genotypes differed in yield (F(23, 36.4) = 4.8, p < 0.001; Satterthwaite degrees of freedom). The variance among incomplete blocks was 26% of the random variation (likelihood ratio, p = 0.01), so recovering the inter-block information improved the precision of the means. The genotype with the highest adjusted mean yielded 5.3 t/ha.”",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "ee"]
    },
    "limitaciones": [
      "It treats genotypes as fixed: to select with heritability and genotype BLUPs use “Heritability and genotype BLUPs”.",
      "It does not give the coefficient of variation or R²; the classical lattice analysis (intra-block, with fixed blocks) does and is useful for comparison.",
      "With few blocks or no variation among them, the fit is singular and amounts to analyzing complete blocks.",
      "It does not generate the design: you need the field plan with the replicate and block of each plot."
    ],
    "referencias": [
      "Patterson, H. D., & Williams, E. R. (1976). A new class of resolvable incomplete block designs. Biometrika, 63(1), 83–92.",
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26."
    ]
  }
});
