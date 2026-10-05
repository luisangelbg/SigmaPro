SP_FICHA({
  "id": "bib",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["bib"],
  "relacionados": ["latice", "dbca", "mixto-bloques", "comparaciones-medias", "medias-ajustadas"],
  "ejemplo": { "conjunto": "sorgo-bib", "entradas": { "respuesta": "rendimiento", "tratamientos": "linea", "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "linea", "rendimiento"], ["B1", "L2", "5.1"], ["B1", "L4", "5.16"], ["B1", "L1", "4.32"], ["B2", "L3", "3.64"], ["B2", "L5", "4.21"], ["B2", "L2", "4.45"]],
    "ancho": null
  },
  "es": {
    "alias": ["Bloques incompletos balanceados", "BIB", "Análisis intrabloque", "BIBD"],
    "paraQue": "Compara tratamientos cuando cada bloque homogéneo solo tiene lugar para algunos de ellos, con un arreglo en que cada par de tratamientos coincide el mismo número de veces.",
    "preguntas": [
      "¿Difieren en rendimiento siete líneas de sorgo si cada franja uniforme del terreno solo tiene lugar para tres parcelas?",
      "¿Qué variedad de frijol prefieren los consumidores cuando cada panelista solo puede probar cuatro de las siete muestras?",
      "¿Cambia la incidencia de una enfermedad con seis fungicidas aplicados en hojas, si cada planta (bloque) solo tiene cuatro hojas comparables?"
    ],
    "teoria": [
      "A veces el bloque homogéneo no alcanza para todos los tratamientos: una cámara con lugar para tres charolas, un panelista que solo puede probar cuatro muestras, una franja uniforme con espacio para cinco parcelas. En los bloques incompletos balanceados cada bloque recibe solo k de los t tratamientos, pero el arreglo está equilibrado: todos los bloques tienen el mismo tamaño k, cada tratamiento aparece r veces y cada par de tratamientos coincide en el mismo número de bloques, λ = r(k − 1)/(t − 1). Así todas las comparaciones entre pares tienen la misma precisión.",
      "Como no todos los tratamientos están en todos los bloques, las medias simples quedan mezcladas con el efecto de los bloques en que les tocó estar. El análisis intrabloque lo corrige: ajusta primero los bloques y después los tratamientos, con sumas de cuadrados secuenciales (tipo I), y así compara los tratamientos solo dentro de los bloques. Las medias que reporta SigmaPro son medias ajustadas por bloque (medias marginales estimadas), las mismas que da BIB.test del paquete agricolae.",
      "La app calcula λ y el factor de eficiencia E = λt/(rk), que siempre es menor que 1: la varianza de la diferencia entre dos tratamientos es 1/E veces la que tendría un diseño en bloques completos con el mismo error. Si el arreglo no es un BIB exacto (bloques de distinto tamaño o pares que no coinciden el mismo número de veces), lo dice; el análisis intrabloque sigue siendo válido, pero no calcula la eficiencia."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\beta_j + \\tau_i + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "la respuesta del tratamiento i en el bloque j (solo existe para los tratamientos que tocaron en ese bloque)"],
        ["\\mu", "la media general"],
        ["\\beta_j", "el efecto del bloque j, que se ajusta primero"],
        ["\\tau_i", "el efecto del tratamiento i, ajustado por los bloques"],
        ["\\varepsilon_{ij}", "el error intrabloque, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Las medias de los tratamientos, ajustadas por los bloques, son iguales. F = CM de tratamientos ajustados / CM del error intrabloque." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "«Revisar los supuestos del modelo», con el tratamiento y el bloque, ajusta el mismo modelo aditivo: su semáforo decide con Shapiro-Wilk y muestra el gráfico de cuantiles.", "verificar": "supuestos", "siFalla": "Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) y repite el análisis.", "alternativa": null },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe, Levene y Bartlett por tratamiento en «Revisar los supuestos del modelo»; con pocas repeticiones por tratamiento tienen poca potencia.", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo; para conteos o proporciones, un modelo lineal generalizado con el bloque en la fórmula.", "alternativa": "glm" },
      { "nombre": "Aditividad bloque × tratamiento", "como": "Prueba de no aditividad de Tukey en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si los tratamientos responden distinto según el bloque, prueba una transformación (logaritmo).", "alternativa": null },
      { "nombre": "Independencia", "como": "La da el sorteo de los bloques y, dentro de cada uno, de sus tratamientos; no se prueba con los datos.", "verificar": null, "siFalla": "Si los bloques son una muestra (panelistas, plantas) y quieres aprovechar también la información entre bloques, analízalos como aleatorios en un modelo mixto.", "alternativa": "mixto-bloques" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "linea", "tipo": "factor con t niveles (un solo factor)", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con b niveles, cada uno con k parcelas", "papel": "bloque (diseño)" }
      ],
      "minimo": "Un BIB necesita b = rt/k bloques; cada tratamiento debería repetirse al menos 3 veces y el error intrabloque tener 8 grados de libertad o más.",
      "balance": "El análisis intrabloque es válido aunque el arreglo no sea un BIB exacto o falte alguna parcela: SigmaPro avisa, ajusta igual las medias y no calcula la eficiencia. Las sumas de cuadrados son siempre tipo I, con los tratamientos al final.",
      "notaFormato": "Formato largo: una fila por parcela, con el bloque, el tratamiento que recibió y la respuesta. Cada bloque debe tener su propia etiqueta (B1, B2, B3…); los tratamientos que no tocaron en un bloque simplemente no aparecen. El conjunto de ejemplo es ficticio, para practicar: siete líneas de sorgo en siete bloques de tres parcelas (t = 7, k = 3, r = 3, λ = 1).",
      "errores": [
        "Comparar las medias simples de los tratamientos: están mezcladas con los bloques en que les tocó estar; usa las medias ajustadas.",
        "Repetir las mismas etiquetas de bloque en grupos distintos (por ejemplo, B1 a B6 en cada repetición): si el diseño tiene repeticiones completas, usa el látice.",
        "Agregar filas con la respuesta vacía para los tratamientos que no estaban en el bloque, o llenarlas con ceros.",
        "Interpretar la F de los bloques como prueba del efecto de bloque: está calculada sin ajustar por los tratamientos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los supuestos en «Revisar los supuestos del modelo», con el tratamiento y el bloque.",
        "En el cuadro de análisis de varianza, la fila de los tratamientos (al final, ajustados por los bloques) es la prueba que importa; la F de los bloques no está ajustada por los tratamientos y solo es un indicio.",
        "En el resumen del ensayo, mira el CV, λ y el factor de eficiencia E.",
        "Lee las medias ajustadas con su error estándar; la gráfica de cajas muestra los datos crudos de cada tratamiento, sin ajustar por los bloques.",
        "Compara las medias ajustadas con «Comparar las medias de este diseño»."
      ],
      "ejemplo": "Ejemplo de redacción con el conjunto de práctica (datos ficticios): «Las siete líneas de sorgo difirieron en rendimiento (F(6, 8) = 8.6, p = 0.004; análisis intrabloque de un diseño en bloques incompletos balanceados con t = 7, k = 3 y λ = 1; E = 0.78). Las medias ajustadas por bloque variaron de 3.26 t/ha (L6) a 4.56 t/ha (L4), con un error estándar de 0.17 t/ha».",
      "guias": ["F", "p", "media-ajustada", "cv", "ee"]
    },
    "limitaciones": [
      "El análisis intrabloque no usa la información entre bloques; si los bloques son aleatorios y difieren poco, un modelo mixto con bloques aleatorios da medias más precisas.",
      "Admite un solo factor de tratamiento; para factoriales en bloques incompletos, usa el modelo lineal general (fórmula).",
      "Si los bloques se agrupan en repeticiones completas, el látice o el alfa-látice es el análisis adecuado.",
      "Para conteos o proporciones, usa un modelo lineal generalizado con el bloque en la fórmula."
    ],
    "referencias": [
      "Yates, F. (1936). Incomplete randomized blocks. Annals of Eugenics, 7(2), 121–140.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Balanced incomplete blocks", "BIB", "Intrablock analysis", "BIBD"],
    "paraQue": "Compares treatments when each homogeneous block only has room for some of them, with a layout in which every pair of treatments occurs together the same number of times.",
    "preguntas": [
      "Do seven sorghum lines differ in yield if each uniform strip of land only has room for three plots?",
      "Which bean variety do consumers prefer when each panelist can only taste four of the seven samples?",
      "Does disease incidence change with six fungicides applied to leaves, if each plant (block) only has four comparable leaves?"
    ],
    "teoria": [
      "Sometimes a homogeneous block is not large enough for every treatment: a chamber with room for three trays, a panelist who can only taste four samples, a uniform strip with space for five plots. In balanced incomplete blocks each block receives only k of the t treatments, but the layout is balanced: all blocks have the same size k, each treatment appears r times and every pair of treatments occurs together in the same number of blocks, λ = r(k − 1)/(t − 1). All pairwise comparisons thus have the same precision.",
      "Because not every treatment is in every block, simple treatment means are mixed up with the effect of the blocks they happened to fall in. The intrablock analysis corrects this: it fits blocks first and then treatments, with sequential (type I) sums of squares, and so compares treatments only within blocks. The means SigmaPro reports are block-adjusted means (estimated marginal means), the same ones given by BIB.test in the agricolae package.",
      "The app computes λ and the efficiency factor E = λt/(rk), which is always less than 1: the variance of the difference between two treatments is 1/E times what a complete block design with the same error would give. If the layout is not an exact BIB (blocks of different size or pairs that do not occur together equally often), it says so; the intrablock analysis is still valid, but the efficiency is not computed."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\beta_j + \\tau_i + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "the response of treatment i in block j (it only exists for the treatments assigned to that block)"],
        ["\\mu", "the overall mean"],
        ["\\beta_j", "the effect of block j, fitted first"],
        ["\\tau_i", "the effect of treatment i, adjusted for blocks"],
        ["\\varepsilon_{ij}", "the intrablock error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatment means, adjusted for blocks, are equal. F = adjusted treatment MS / intrablock error MS." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "“Check the model assumptions”, with the treatment and the block, fits the same additive model: its checklist decides with the Shapiro-Wilk test and shows the quantile plot.", "verificar": "supuestos", "siFalla": "With strong departures, transform the response (Box-Cox in Data) and repeat the analysis.", "alternativa": null },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe, Levene and Bartlett tests by treatment in “Check the model assumptions”; with few replicates per treatment they have little power.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try the log; for counts or proportions, a generalized linear model with the block in the formula.", "alternativa": "glm" },
      { "nombre": "Block × treatment additivity", "como": "Tukey’s nonadditivity test in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If treatments respond differently depending on the block, try a transformation (log).", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from randomizing the blocks and, within each one, its treatments; it is not tested with the data.", "verificar": null, "siFalla": "If the blocks are a sample (panelists, plants) and you also want to use the information between blocks, analyze them as random in a mixed model.", "alternativa": "mixto-bloques" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "linea", "tipo": "factor with t levels (a single factor)", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with b levels, each with k plots", "papel": "block (design)" }
      ],
      "minimo": "A BIB needs b = rt/k blocks; each treatment should be replicated at least 3 times and the intrablock error should have 8 degrees of freedom or more.",
      "balance": "The intrablock analysis is valid even if the layout is not an exact BIB or a plot is missing: SigmaPro warns you, still adjusts the means and does not compute the efficiency. Sums of squares are always type I, with treatments last.",
      "notaFormato": "Long format: one row per plot, with the block, the treatment it received and the response. Each block must have its own label (B1, B2, B3…); treatments not assigned to a block simply do not appear. The example dataset is fictitious, for practice: seven sorghum lines in seven blocks of three plots (t = 7, k = 3, r = 3, λ = 1).",
      "errores": [
        "Comparing simple treatment means: they are mixed up with the blocks they fell in; use the adjusted means.",
        "Reusing the same block labels in different groups (for example, B1 to B6 in each replicate): if the design has complete replicates, use the lattice.",
        "Adding rows with an empty response for treatments that were not in the block, or filling them with zeros.",
        "Reading the block F as a test of the block effect: it is computed without adjusting for treatments."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions in “Check the model assumptions”, with the treatment and the block.",
        "In the analysis of variance table, the treatment row (last, adjusted for blocks) is the test that matters; the block F is not adjusted for treatments and is only a hint.",
        "In the trial summary, look at the CV, λ and the efficiency factor E.",
        "Read the adjusted means with their standard errors; the box plot shows the raw data of each treatment, not adjusted for blocks.",
        "Compare the adjusted means with “Compare the means of this design”."
      ],
      "ejemplo": "Example write-up with the practice dataset (fictitious data): “The seven sorghum lines differed in yield (F(6, 8) = 8.6, p = 0.004; intrablock analysis of a balanced incomplete block design with t = 7, k = 3 and λ = 1; E = 0.78). Block-adjusted means ranged from 3.26 t/ha (L6) to 4.56 t/ha (L4), with a standard error of 0.17 t/ha.”",
      "guias": ["F", "p", "media-ajustada", "cv", "ee"]
    },
    "limitaciones": [
      "The intrablock analysis does not use the information between blocks; if the blocks are random and differ little, a mixed model with random blocks gives more precise means.",
      "It accepts a single treatment factor; for factorials in incomplete blocks, use the general linear model (formula).",
      "If the blocks are grouped into complete replicates, the lattice or alpha-lattice is the right analysis.",
      "For counts or proportions, use a generalized linear model with the block in the formula."
    ],
    "referencias": [
      "Yates, F. (1936). Incomplete randomized blocks. Annals of Eugenics, 7(2), 121–140.",
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  }
});
