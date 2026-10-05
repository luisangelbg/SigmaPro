SP_FICHA({
  "id": "latice",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["latice"],
  "relacionados": ["mixto-latice", "bib", "dbca", "heredabilidad", "comparaciones-medias", "medias-ajustadas"],
  "ejemplo": { "conjunto": "alfa-latice", "entradas": { "respuesta": "rendimiento", "tratamientos": "genotipo", "bloque": "bloque", "repeticion": "repeticion" }, "opciones": {} },
  "formato": {
    "largo": [["repeticion", "bloque", "genotipo", "rendimiento"], ["R1", "B1", "G11", "4.1172"], ["R1", "B1", "G04", "4.4461"], ["R1", "B1", "G05", "5.8757"], ["R1", "B1", "G22", "4.5784"], ["R1", "B2", "G21", "4.654"], ["R1", "B2", "G10", "4.1736"], ["R1", "B2", "G20", "4.0141"]],
    "ancho": null
  },
  "es": {
    "alias": ["Látice", "Alfa-látice", "Bloques incompletos resolubles", "Lattice"],
    "paraQue": "Compara muchos tratamientos, como los genotipos de un ensayo de mejoramiento, en bloques incompletos pequeños agrupados en repeticiones completas, con medias ajustadas por bloque.",
    "preguntas": [
      "¿Difieren en rendimiento 24 líneas de avena evaluadas en tres repeticiones, cada una con seis bloques incompletos de cuatro parcelas?",
      "¿Qué híbridos experimentales de maíz superan a los testigos en un ensayo de 100 entradas sembrado en látice 10 × 10?",
      "¿Cambia la altura entre 36 progenies de frijol cuando el terreno es demasiado heterogéneo para bloques completos?"
    ],
    "teoria": [
      "Los ensayos de mejoramiento comparan decenas o cientos de genotipos, y un bloque completo con todos ellos ocupa tanto terreno que deja de ser homogéneo. Los diseños en látice dividen cada repetición completa en bloques incompletos pequeños: en el látice clásico (Yates, 1936) hay k² tratamientos en bloques de k, y en el alfa-látice (Patterson y Williams, 1976) el número de tratamientos solo tiene que ser múltiplo del tamaño del bloque. Cada repetición contiene todos los tratamientos, así que el diseño es resoluble: si se ignoran los bloques, queda un diseño en bloques completos.",
      "SigmaPro hace el análisis intrabloque con el modelo repetición + bloque dentro de repetición + tratamiento, con sumas de cuadrados secuenciales (tipo I) en ese orden: primero la repetición, después los bloques dentro de cada repetición y al final los tratamientos, ajustados por los bloques. Por eso las medias de los genotipos son medias ajustadas (marginales estimadas), que corrigen la ventaja o desventaja del bloque donde le tocó a cada uno. Como los bloques se anidan en la repetición, puedes numerarlos de nuevo dentro de cada una (B1, B2… en todas).",
      "El análisis intrabloque usa solo la información de dentro de los bloques. Cuando los bloques difieren poco, también hay información útil entre ellos; para recuperarla, con los bloques como efecto aleatorio, usa «Látice y alfa-látice (recuperación entre bloques)». Con los genotipos también aleatorios, el mismo diseño da la heredabilidad y los BLUP en «Heredabilidad y BLUP de genotipos»."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\rho_j + \\beta_{k(j)} + \\tau_i + \\varepsilon_{ijk}, \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "la respuesta del tratamiento i en el bloque k de la repetición j"],
        ["\\mu", "la media general"],
        ["\\rho_j", "el efecto de la repetición j"],
        ["\\beta_{k(j)}", "el efecto del bloque incompleto k dentro de la repetición j"],
        ["\\tau_i", "el efecto del tratamiento (genotipo) i, ajustado por los bloques"],
        ["\\varepsilon_{ijk}", "el error intrabloque, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Las medias de los tratamientos, ajustadas por los bloques, son iguales. F = CM de tratamientos ajustados / CM del error intrabloque." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "En Datos, crea una variable calculada paste0(repeticion, bloque) y úsala como bloque en «Revisar los supuestos del modelo», con el tratamiento: ese modelo da los mismos residuos que el látice y su semáforo decide con Shapiro-Wilk. Con la columna de bloque sola (B1 se repite en cada repetición) los residuos no son los del látice.", "verificar": "supuestos", "siFalla": "Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) y repite el análisis.", "alternativa": null },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Brown-Forsythe y Levene por tratamiento en «Revisar los supuestos del modelo»; con dos o tres repeticiones por genotipo tienen poca potencia, así que mira también la gráfica de residuos contra ajustados.", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, prueba el logaritmo de la respuesta.", "alternativa": null },
      { "nombre": "Aditividad bloque × tratamiento", "como": "Prueba de no aditividad de Tukey en «Revisar los supuestos del modelo», con la columna repetición-bloque como bloque.", "verificar": "supuestos", "siFalla": "Si los genotipos responden distinto según el bloque, prueba una transformación.", "alternativa": null },
      { "nombre": "Independencia", "como": "Durbin-Watson, en «Revisar los supuestos del modelo», con una columna de orden que siga la posición de las parcelas en el campo.", "verificar": "supuestos", "siFalla": "Si las parcelas vecinas se siguen pareciendo dentro de los bloques, el control local no bastó: ni el análisis intrabloque ni los bloques aleatorios modelan esa correlación (un análisis espacial aún no está en SigmaPro); usa bloques más chicos en el siguiente ensayo.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con t niveles (un solo factor)", "papel": "tratamientos" },
        { "nombre": "repeticion", "tipo": "factor con r niveles", "papel": "repetición completa (diseño)" },
        { "nombre": "bloque", "tipo": "factor con s niveles por repetición", "papel": "bloque incompleto dentro de cada repetición (diseño)" }
      ],
      "minimo": "Al menos 2 repeticiones completas (látice simple), mejor 3 o más, para que el error intrabloque tenga suficientes grados de libertad y las medias ajustadas sean estables.",
      "balance": "Cada repetición debe tener todos los tratamientos. La app ajusta el modelo aunque falte alguna parcela (las medias se ajustan igual), pero no revisa que el arreglo sea un látice. Las sumas de cuadrados son siempre tipo I, en el orden del cuadro.",
      "notaFormato": "Formato largo: una fila por parcela, con la repetición, el bloque incompleto, el tratamiento y la respuesta. Las etiquetas de bloque pueden repetirse en cada repetición.",
      "errores": [
        "Ignorar los bloques incompletos y analizar cada repetición como un bloque completo: se desperdicia el control local del diseño.",
        "Usar la columna de bloque sin la repetición en otros análisis (supuestos, modelo lineal) cuando las etiquetas B1, B2… se repiten en cada repetición: une repetición y bloque.",
        "Comparar las medias crudas de los genotipos en lugar de las ajustadas por bloque.",
        "Interpretar la F de los bloques como prueba limpia: está calculada antes de ajustar por los tratamientos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los supuestos con la columna repetición-bloque como bloque.",
        "En el cuadro de análisis de varianza, el tratamiento va al final: su F, ajustada por los bloques, es la prueba que importa.",
        "La F de la repetición y la de los bloques dentro de repetición solo indican si hubo variación entre ellos; la de bloques no está ajustada por los tratamientos.",
        "En el resumen del ensayo, mira el CV y la R².",
        "Compara las medias ajustadas con «Comparar las medias de este diseño» (Tukey, DMS, Bonferroni…). Dunnett contra un testigo casi nunca corre aquí: en bloques incompletos las comparaciones contra el testigo no suelen tener la correlación que exige su cálculo exacto, y SigmaPro lo avisa (así pasa con el alfa-látice del ejemplo)."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los genotipos difirieron en rendimiento (F(23, 31) = 4.6, p < 0.001, análisis intrabloque de un alfa-látice con tres repeticiones y bloques de cuatro parcelas). El coeficiente de variación fue de 6.8 % y las medias ajustadas por bloque variaron de 3.7 a 5.2 t/ha».",
      "guias": ["F", "p", "media-ajustada", "cv", "ee"]
    },
    "limitaciones": [
      "No recupera la información entre bloques: con bloques que difieren poco, «Látice y alfa-látice (recuperación entre bloques)» da medias más precisas.",
      "No calcula la eficiencia del látice frente a bloques completos; compara su error con el de un análisis en bloques completos al azar con la repetición como bloque.",
      "Para la heredabilidad y la selección de genotipos, usa «Heredabilidad y BLUP de genotipos».",
      "Con varias localidades, usa «Ensayos en varias localidades» o «Análisis conjunto de varios ambientes»."
    ],
    "referencias": [
      "Yates, F. (1936). A new method of arranging variety trials involving a large number of varieties. The Journal of Agricultural Science, 26(3), 424–455.",
      "Patterson, H. D., & Williams, E. R. (1976). A new class of resolvable incomplete block designs. Biometrika, 63(1), 83–92.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "John, J. A., & Williams, E. R. (1995). Cyclic and computer generated designs (2nd ed.). Chapman & Hall."
    ]
  },
  "en": {
    "alias": ["Lattice", "Alpha-lattice", "Resolvable incomplete blocks"],
    "paraQue": "Compares many treatments, such as the genotypes of a breeding trial, in small incomplete blocks grouped into complete replicates, with block-adjusted means.",
    "preguntas": [
      "Do 24 oat lines evaluated in three replicates, each with six incomplete blocks of four plots, differ in yield?",
      "Which experimental maize hybrids outperform the checks in a 100-entry trial sown as a 10 × 10 lattice?",
      "Does plant height differ among 36 bean progenies when the field is too heterogeneous for complete blocks?"
    ],
    "teoria": [
      "Breeding trials compare dozens or hundreds of genotypes, and a complete block containing all of them takes up so much land that it stops being homogeneous. Lattice designs split each complete replicate into small incomplete blocks: in the classic lattice (Yates, 1936) there are k² treatments in blocks of k, and in the alpha-lattice (Patterson and Williams, 1976) the number of treatments only needs to be a multiple of the block size. Each replicate contains every treatment, so the design is resolvable: if blocks are ignored, it becomes a complete block design.",
      "SigmaPro performs the intrablock analysis with the model replicate + block within replicate + treatment, with sequential (type I) sums of squares in that order: first the replicate, then the blocks within each replicate and finally the treatments, adjusted for blocks. That is why the genotype means are adjusted means (estimated marginal means), which correct for the advantage or disadvantage of the block each one fell in. Because blocks are nested in replicates, you can number them again within each one (B1, B2… in all of them).",
      "The intrablock analysis uses only the information within blocks. When blocks differ little, there is also useful information between them; to recover it, with blocks as a random effect, use “Lattice and alpha-lattice (inter-block recovery)”. With genotypes also random, the same design gives heritability and BLUPs in “Heritability and genotype BLUPs”."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\rho_j + \\beta_{k(j)} + \\tau_i + \\varepsilon_{ijk}, \\quad \\varepsilon_{ijk} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ijk}", "the response of treatment i in block k of replicate j"],
        ["\\mu", "the overall mean"],
        ["\\rho_j", "the effect of replicate j"],
        ["\\beta_{k(j)}", "the effect of incomplete block k within replicate j"],
        ["\\tau_i", "the effect of treatment (genotype) i, adjusted for blocks"],
        ["\\varepsilon_{ijk}", "the intrablock error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatment means, adjusted for blocks, are equal. F = adjusted treatment MS / intrablock error MS." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "In Data, create a computed variable paste0(repeticion, bloque) and use it as the block in “Check the model assumptions”, with the treatment: that model gives the same residuals as the lattice and its checklist decides with the Shapiro-Wilk test. With the block column alone (B1 repeats in every replicate) the residuals are not those of the lattice.", "verificar": "supuestos", "siFalla": "With strong departures, transform the response (Box-Cox in Data) and repeat the analysis.", "alternativa": null },
      { "nombre": "Equal variances among treatments", "como": "Brown-Forsythe and Levene tests by treatment in “Check the model assumptions”; with two or three replicates per genotype they have little power, so also look at the residuals-versus-fitted plot.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, try the log of the response.", "alternativa": null },
      { "nombre": "Block × treatment additivity", "como": "Tukey’s nonadditivity test in “Check the model assumptions”, with the replicate-block column as block.", "verificar": "supuestos", "siFalla": "If genotypes respond differently depending on the block, try a transformation.", "alternativa": null },
      { "nombre": "Independence", "como": "The Durbin-Watson test in “Check the model assumptions”, with an order column that follows the position of the plots in the field.", "verificar": "supuestos", "siFalla": "If neighboring plots are still alike within blocks, local control was not enough: neither the intrablock analysis nor random blocks model that correlation (a spatial analysis is not yet in SigmaPro); use smaller blocks in the next trial.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with t levels (a single factor)", "papel": "treatments" },
        { "nombre": "repeticion", "tipo": "factor with r levels", "papel": "complete replicate (design)" },
        { "nombre": "bloque", "tipo": "factor with s levels per replicate", "papel": "incomplete block within each replicate (design)" }
      ],
      "minimo": "At least 2 complete replicates (simple lattice), 3 or more is better, so the intrablock error has enough degrees of freedom and the adjusted means are stable.",
      "balance": "Each replicate must contain every treatment. The app fits the model even if a plot is missing (the means are still adjusted), but it does not check that the layout is a lattice. Sums of squares are always type I, in the order of the table.",
      "notaFormato": "Long format: one row per plot, with the replicate, the incomplete block, the treatment and the response. Block labels may repeat in each replicate.",
      "errores": [
        "Ignoring the incomplete blocks and analyzing each replicate as a complete block: the local control of the design is wasted.",
        "Using the block column without the replicate in other analyses (assumptions, linear model) when labels B1, B2… repeat in each replicate: combine replicate and block.",
        "Comparing raw genotype means instead of block-adjusted ones.",
        "Reading the block F as a clean test: it is computed before adjusting for treatments."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions with the replicate-block column as block.",
        "In the analysis of variance table, the treatment comes last: its F, adjusted for blocks, is the test that matters.",
        "The replicate F and the blocks-within-replicate F only show whether there was variation among them; the block F is not adjusted for treatments.",
        "In the trial summary, look at the CV and the R².",
        "Compare the adjusted means with “Compare the means of this design” (Tukey, LSD, Bonferroni…). Dunnett against a check almost never runs here: with incomplete blocks, the comparisons against the check usually lack the correlation its exact computation requires, and SigmaPro warns you (as happens with the alpha-lattice in the example)."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Genotypes differed in yield (F(23, 31) = 4.6, p < 0.001, intrablock analysis of an alpha-lattice with three replicates and blocks of four plots). The coefficient of variation was 6.8 % and block-adjusted means ranged from 3.7 to 5.2 t/ha.”",
      "guias": ["F", "p", "media-ajustada", "cv", "ee"]
    },
    "limitaciones": [
      "It does not recover the information between blocks: when blocks differ little, “Lattice and alpha-lattice (inter-block recovery)” gives more precise means.",
      "It does not compute the efficiency of the lattice relative to complete blocks; compare its error with that of a randomized complete block analysis using the replicate as block.",
      "For heritability and genotype selection, use “Heritability and genotype BLUPs”.",
      "With several locations, use “Trials at several locations” or “Combined analysis of several environments”."
    ],
    "referencias": [
      "Yates, F. (1936). A new method of arranging variety trials involving a large number of varieties. The Journal of Agricultural Science, 26(3), 424–455.",
      "Patterson, H. D., & Williams, E. R. (1976). A new class of resolvable incomplete block designs. Biometrika, 63(1), 83–92.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "John, J. A., & Williams, E. R. (1995). Cyclic and computer generated designs (2nd ed.). Chapman & Hall."
    ]
  }
});
