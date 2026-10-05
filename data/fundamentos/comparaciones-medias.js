SP_FICHA({
  "id": "comparaciones-medias",
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca", "latino", "parcelas", "bib", "latice"],
  "relacionados": ["dca", "dbca", "contrastes", "polinomios", "medias-ajustadas", "kruskal-wallis"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "diseno": "dbca", "respuesta": "rend", "tratamientos": ["hibrido", "dosis"], "bloque": "bloque", "comparar": ["hibrido"] }, "opciones": { "metodo": "tukey", "alfa": 0.05 } },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Pruebas de comparación múltiple", "Prueba de Tukey", "Separación de medias", "Pruebas post hoc"],
    "paraQue": "Después del análisis de varianza, dice qué tratamientos difieren entre sí y los agrupa con letras.",
    "preguntas": [
      "Tras un análisis de varianza significativo, ¿cuáles de tres híbridos de maíz rinden distinto?",
      "¿Qué insecticidas biológicos reducen los trips del aguacate respecto al testigo sin aplicación?",
      "Si hay interacción híbrido × dosis, ¿qué híbridos difieren dentro de cada dosis de nitrógeno?"
    ],
    "teoria": [
      "La prueba F del análisis de varianza solo dice si hay alguna diferencia entre los tratamientos, no cuáles. Comparar todos los pares con pruebas t sueltas infla el error: con 10 tratamientos hay 45 pares y, al 5 %, es casi seguro declarar alguna diferencia que no existe. Las comparaciones múltiples controlan ese riesgo de distintas maneras. La DMS de Fisher no corrige nada (su versión protegida solo separa medias si la F del factor fue significativa); Tukey controla la probabilidad de cometer al menos un error en el conjunto de pares; Scheffé la controla para cualquier contraste y por eso es la más conservadora; Bonferroni, Šidák y Holm corrigen los valores p de la DMS; Duncan y Student-Newman-Keuls ajustan según cuántas medias abarca cada comparación; Dunnett compara cada tratamiento solo contra el testigo y gana potencia al hacer menos comparaciones.",
      "SigmaPro trabaja sobre las medias marginales estimadas del diseño que eliges (completamente al azar, bloques, cuadro latino, parcelas divididas, subdivididas o en franjas, BIB o látice): con datos balanceados son las medias de siempre y con parcelas perdidas o bloques incompletos son las ajustadas. Cada diferencia lleva su propio error estándar (Tukey-Kramer si las repeticiones difieren) y los grados de libertad del error; en parcelas divididas cada comparación usa el error de su estrato, con grados de libertad de Satterthwaite. Las letras se asignan con la «a» para la media más alta: medias que comparten letra no difieren. Con interacción puedes comparar un factor dentro de cada nivel de otro. Games-Howell, que no supone varianzas iguales, se ofrece solo con un factor en completamente al azar."
    ],
    "modelo": {
      "tex": "t_{ij} = \\frac{\\hat{\\mu}_i - \\hat{\\mu}_j}{\\mathrm{EE}(\\hat{\\mu}_i - \\hat{\\mu}_j)}, \\quad p_{\\text{Tukey}} = P\\left( q_{k, \\nu} \\ge \\sqrt{2} |t_{ij}| \\right)",
      "terminos": [
        ["\\hat{\\mu}_i", "la media marginal estimada del nivel i (ajustada si faltan parcelas o los bloques son incompletos)"],
        ["\\mathrm{EE}(\\hat{\\mu}_i - \\hat{\\mu}_j)", "el error estándar de la diferencia; con un solo error y r repeticiones vale √(2·CMerror/r)"],
        ["k", "el número de medias que se comparan en el grupo"],
        ["\\nu", "los grados de libertad del error (de Satterthwaite en parcelas divididas)"],
        ["q_{k, \\nu}", "la distribución del rango estudentizado de Tukey; las demás pruebas solo cambian esta referencia (t, F de Scheffé, t multivariada de Dunnett…)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_i = \\mu_j", "h1": "\\mu_i \\ne \\mu_j", "texto": "Una prueba por cada par de tratamientos; con Dunnett, cada tratamiento contra el testigo, bilateral o de una cola. El p ajustado controla el error del conjunto de comparaciones." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "Son los del análisis de varianza del diseño: revísalos en «Revisar los supuestos del modelo» con los mismos tratamientos y bloques (este análisis no repite el semáforo). Esa revisión admite solo tratamientos y un bloque: en cuadro latino, látice o parcelas divididas es aproximada.", "verificar": "supuestos", "siFalla": "Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) o compara por rangos: Kruskal-Wallis en completamente al azar o Friedman en bloques, ambas con sus comparaciones y letras.", "alternativa": "kruskal-wallis" },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Pruebas de Levene, Brown-Forsythe y Bartlett en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Con un factor en completamente al azar elige Games-Howell en este mismo análisis; si la varianza crece con la media (conteos, porcentajes), usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "El diseño declarado es el del experimento", "como": "Lo das tú al elegir el diseño: de él salen el error y los grados de libertad de cada comparación.", "verificar": null, "siFalla": "Si comparas subparcelas con el error de un diseño en bloques, las pruebas salen demasiado optimistas: declara parcelas divididas para que cada diferencia use el error de su estrato.", "alternativa": "parcelas-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "hibrido, dosis", "tipo": "factor con k niveles", "papel": "tratamientos (se comparan los marcados en «Medias de»)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (según el diseño)" }
      ],
      "minimo": "El del diseño: al menos 3 repeticiones por tratamiento y unos 12 grados de libertad del error. Dunnett necesita el testigo entre los niveles; Games-Howell, al menos 2 datos por grupo.",
      "balance": "Con parcelas perdidas o bloques incompletos se comparan medias ajustadas, cada par con su propio error estándar. Duncan y SNK usan un error común con la media armónica de las repeticiones. Dunnett exacto necesita correlaciones de forma producto; si el desbalance o los bloques incompletos (látice) las rompen, SigmaPro no lo calcula y sugiere Bonferroni u Holm, que aquí ajustan todos los pares, no solo los del testigo.",
      "notaFormato": "Los mismos datos del análisis del diseño, en formato largo: una fila por unidad experimental, con columnas para los factores, los bloques y la respuesta. También se abre desde el resultado del diseño con «Comparar las medias de este diseño».",
      "errores": [
        "Comparar las medias de un factor promediadas sobre otro cuando la interacción es significativa: compara dentro de cada nivel del otro factor.",
        "Separar con letras dosis o densidades: en niveles cuantitativos conviene describir la tendencia con polinomios ortogonales.",
        "Elegir la prueba después de ver cuál separa más medias: decide antes si quieres todos los pares (Tukey) o solo contra el testigo (Dunnett).",
        "Declarar un diseño distinto del que se sorteó (por ejemplo, parcelas divididas analizadas como bloques), lo que cambia el error de cada comparación."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa primero el análisis de varianza del diseño: la F del factor y, si la hay, la interacción.",
        "En el cuadro de medias, ordenadas de mayor a menor, lee las letras: medias con una letra en común no difieren.",
        "En el cuadro de comparaciones por pares, mira la diferencia, su EE y el p ajustado de cada par.",
        "Juzga si las diferencias significativas importan en la práctica (t/ha, días, por ciento), no solo su valor p."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Según la prueba de Tukey (α = 0.05), el híbrido H-66 rindió más (6.2 t/ha, a) que H-52 (5.8 t/ha, b) y H-40 (5.4 t/ha, c); la diferencia entre H-66 y H-40 fue de 0.8 t/ha (EE = 0.09, p < 0.001)».",
      "guias": ["p-ajustado", "diferencia", "ee", "media-ajustada", "q"]
    },
    "limitaciones": [
      "Las comparaciones por pares no describen tendencias: para dosis o niveles cuantitativos usa polinomios ortogonales o una regresión.",
      "Si tus preguntas son pocas y planeadas (testigo contra el resto, orgánicos contra químicos), los contrastes tienen más potencia que comparar todos los pares.",
      "Duncan, SNK y Dunnett necesitan un solo error: en parcelas divididas, subdivididas o en franjas usa Tukey, DMS, Bonferroni u Holm.",
      "Para conteos o proporciones con varianza ligada a la media, analiza con un modelo lineal generalizado."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Tukey, J. W. (1949). Comparing individual means in the analysis of variance. Biometrics, 5(2), 99–114.",
      "Duncan, D. B. (1955). Multiple range and multiple F tests. Biometrics, 11(1), 1–42.",
      "Dunnett, C. W. (1955). A multiple comparison procedure for comparing several treatments with a control. Journal of the American Statistical Association, 50(272), 1096–1121.",
      "Hsu, J. C. (1996). Multiple comparisons: Theory and methods. Chapman & Hall."
    ]
  },
  "en": {
    "alias": ["Multiple comparison tests", "Tukey test", "Mean separation", "Post hoc tests"],
    "paraQue": "After the analysis of variance, tells which treatments differ from each other and groups them with letters.",
    "preguntas": [
      "After a significant analysis of variance, which of three maize hybrids yield differently?",
      "Which biological insecticides reduce avocado thrips compared with the untreated control?",
      "If there is a hybrid × rate interaction, which hybrids differ within each nitrogen rate?"
    ],
    "teoria": [
      "The F test of the analysis of variance only says whether there is some difference among the treatments, not which ones. Comparing every pair with separate t tests inflates the error: with 10 treatments there are 45 pairs and, at 5 %, declaring some difference that does not exist is almost certain. Multiple comparisons control that risk in different ways. Fisher’s LSD corrects nothing (its protected version only separates means if the F of the factor was significant); Tukey controls the probability of making at least one error across all pairs; Scheffé controls it for any contrast and is therefore the most conservative; Bonferroni, Šidák and Holm adjust the LSD p-values; Duncan and Student-Newman-Keuls adjust according to how many means each comparison spans; Dunnett compares each treatment only with the control and gains power by making fewer comparisons.",
      "SigmaPro works on the estimated marginal means of the design you choose (completely randomized, blocks, Latin square, split-plot, split-split-plot or strip-plot, BIB or lattice): with balanced data they are the usual means, and with missing plots or incomplete blocks they are the adjusted ones. Each difference carries its own standard error (Tukey-Kramer when replicates differ) and the error degrees of freedom; in split-plot designs each comparison uses the error of its stratum, with Satterthwaite degrees of freedom. Letters are assigned with “a” for the highest mean: means that share a letter do not differ. With an interaction you can compare one factor within each level of another. Games-Howell, which does not assume equal variances, is offered only for one factor in a completely randomized design."
    ],
    "modelo": {
      "tex": "t_{ij} = \\frac{\\hat{\\mu}_i - \\hat{\\mu}_j}{\\mathrm{SE}(\\hat{\\mu}_i - \\hat{\\mu}_j)}, \\quad p_{\\text{Tukey}} = P\\left( q_{k, \\nu} \\ge \\sqrt{2} |t_{ij}| \\right)",
      "terminos": [
        ["\\hat{\\mu}_i", "the estimated marginal mean of level i (adjusted if plots are missing or blocks are incomplete)"],
        ["\\mathrm{SE}(\\hat{\\mu}_i - \\hat{\\mu}_j)", "the standard error of the difference; with a single error and r replicates it equals √(2·error MS/r)"],
        ["k", "the number of means compared in the group"],
        ["\\nu", "the error degrees of freedom (Satterthwaite in split-plot designs)"],
        ["q_{k, \\nu}", "Tukey’s studentized range distribution; the other tests only change this reference (t, Scheffé’s F, Dunnett’s multivariate t…)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_i = \\mu_j", "h1": "\\mu_i \\ne \\mu_j", "texto": "One test per pair of treatments; with Dunnett, each treatment against the control, two-sided or one-sided. The adjusted p controls the error of the whole set of comparisons." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "They are those of the design’s analysis of variance: check them in “Check the model assumptions” with the same treatments and blocks (this analysis does not repeat the checklist). That check accepts only treatments and one block: in a Latin square, lattice or split-plot design it is approximate.", "verificar": "supuestos", "siFalla": "With strong departures, transform the response (Box-Cox in Data) or compare ranks: Kruskal-Wallis in a completely randomized design or Friedman in blocks, both with their comparisons and letters.", "alternativa": "kruskal-wallis" },
      { "nombre": "Equal variances among treatments", "como": "Levene, Brown-Forsythe and Bartlett tests in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "With one factor in a completely randomized design choose Games-Howell in this same analysis; if the variance grows with the mean (counts, percentages), use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "The declared design is the experiment’s design", "como": "You set it when you choose the design: the error and degrees of freedom of each comparison come from it.", "verificar": null, "siFalla": "If you compare subplots with the error of a block design, the tests are too optimistic: declare a split-plot design so each difference uses the error of its stratum.", "alternativa": "parcelas-divididas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "hibrido, dosis", "tipo": "factor with k levels", "papel": "treatments (those checked in “Means of” are compared)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (depending on the design)" }
      ],
      "minimo": "That of the design: at least 3 replicates per treatment and about 12 error degrees of freedom. Dunnett needs the control among the levels; Games-Howell, at least 2 values per group.",
      "balance": "With missing plots or incomplete blocks, adjusted means are compared, each pair with its own standard error. Duncan and SNK use a common error with the harmonic mean of the replicates. Exact Dunnett needs product-form correlations; if imbalance or incomplete blocks (lattice) break them, SigmaPro does not compute it and suggests Bonferroni or Holm, which here adjust all pairs, not only those with the control.",
      "notaFormato": "The same data as the design analysis, in long format: one row per experimental unit, with columns for the factors, the blocks and the response. It also opens from the design result with “Compare the means of this design”.",
      "errores": [
        "Comparing the means of one factor averaged over another when the interaction is significant: compare within each level of the other factor.",
        "Separating rates or densities with letters: for quantitative levels it is better to describe the trend with orthogonal polynomials.",
        "Choosing the test after seeing which one separates more means: decide beforehand whether you want all pairs (Tukey) or only against the control (Dunnett).",
        "Declaring a design other than the one randomized (for example, a split-plot analyzed as blocks), which changes the error of each comparison."
      ]
    },
    "interpretacion": {
      "orden": [
        "First check the design’s analysis of variance: the F of the factor and, if present, the interaction.",
        "In the table of means, sorted from highest to lowest, read the letters: means sharing a letter do not differ.",
        "In the pairwise comparisons table, look at the difference, its SE and the adjusted p of each pair.",
        "Judge whether significant differences matter in practice (t/ha, days, percent), not only their p-value."
      ],
      "ejemplo": "Example write-up (illustrative figures): “According to Tukey’s test (α = 0.05), hybrid H-66 yielded more (6.2 t/ha, a) than H-52 (5.8 t/ha, b) and H-40 (5.4 t/ha, c); the difference between H-66 and H-40 was 0.8 t/ha (SE = 0.09, p < 0.001).”",
      "guias": ["p-ajustado", "diferencia", "ee", "media-ajustada", "q"]
    },
    "limitaciones": [
      "Pairwise comparisons do not describe trends: for rates or quantitative levels use orthogonal polynomials or a regression.",
      "If your questions are few and planned (control versus the rest, organic versus synthetic), contrasts have more power than comparing all pairs.",
      "Duncan, SNK and Dunnett need a single error: in split-plot, split-split-plot or strip-plot designs use Tukey, LSD, Bonferroni or Holm.",
      "For counts or proportions whose variance is tied to the mean, analyze with a generalized linear model."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Tukey, J. W. (1949). Comparing individual means in the analysis of variance. Biometrics, 5(2), 99–114.",
      "Duncan, D. B. (1955). Multiple range and multiple F tests. Biometrics, 11(1), 1–42.",
      "Dunnett, C. W. (1955). A multiple comparison procedure for comparing several treatments with a control. Journal of the American Statistical Association, 50(272), 1096–1121.",
      "Hsu, J. C. (1996). Multiple comparisons: Theory and methods. Chapman & Hall."
    ]
  }
});
