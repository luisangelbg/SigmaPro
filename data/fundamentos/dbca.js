SP_FICHA({
  "id": "dbca",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
    "dbca"
  ],
  "relacionados": [
    "dca",
    "cuadro-latino",
    "friedman",
    "mixto-bloques",
    "comparaciones-medias",
    "supuestos"
  ],
  "ejemplo": {
    "conjunto": "maiz",
    "entradas": {
      "respuesta": "rend",
      "tratamientos": [
        "hibrido",
        "dosis"
      ],
      "bloque": "bloque"
    },
    "opciones": {}
  },
  "formato": {
    "largo": [
      [
        "bloque",
        "hibrido",
        "dosis",
        "rend"
      ],
      [
        "1",
        "H-40",
        "0",
        "4.61"
      ],
      [
        "1",
        "H-40",
        "60",
        "5.71"
      ],
      [
        "1",
        "H-40",
        "120",
        "6.41"
      ],
      [
        "1",
        "H-40",
        "180",
        "6.56"
      ],
      [
        "1",
        "H-52",
        "0",
        "4.8"
      ],
      [
        "1",
        "H-52",
        "60",
        "6.34"
      ],
      [
        "1",
        "H-52",
        "120",
        "6.99"
      ]
    ],
    "ancho": null
  },
  "es": {
    "alias": [
      "ANOVA en bloques",
      "Diseño en bloques completos al azar",
      "DBCA",
      "RCBD"
    ],
    "paraQue": "Compara tratamientos cuando el terreno o el material experimental cambia de un lugar a otro, quitando esa variación con bloques.",
    "preguntas": [
      "¿Difieren en rendimiento cuatro variedades de frijol sembradas en un terreno con pendiente, con un bloque por franja de la pendiente?",
      "¿Cómo responde el rendimiento de dos híbridos de maíz a cuatro dosis de nitrógeno, y depende la respuesta del híbrido?",
      "¿Cambia el peso del fruto de jitomate con tres sustratos cuando cada invernadero es un bloque?"
    ],
    "teoria": [
      "En un experimento de campo las parcelas no son iguales: cambian la fertilidad, la humedad o la pendiente. El diseño en bloques completos al azar agrupa las parcelas parecidas en bloques y, dentro de cada bloque, sortea todos los tratamientos una vez. Así cada tratamiento se compara con los demás en condiciones parecidas y la diferencia entre bloques sale del error experimental, que se vuelve más pequeño y hace la prueba más sensible.",
      "El análisis de varianza divide la variación total de la respuesta en tres partes: la que se debe a los bloques, la que se debe a los tratamientos y la que queda sin explicar (el error). Si los tratamientos no tuvieran efecto, su cuadrado medio estimaría lo mismo que el del error y la razón F estaría cerca de 1. En SigmaPro los tratamientos pueden ser hasta tres factores cruzados (por ejemplo, híbrido × dosis): entonces el efecto de los tratamientos se separa en los efectos principales y sus interacciones. Si un bloque tiene más de una parcela por tratamiento, la app ajusta un modelo de bloques generalizados, y si faltan parcelas usa sumas de cuadrados tipo III (o II), que no dependen del orden de los términos.",
      "El bloque es una restricción del sorteo, no un tratamiento: su prueba F solo dice si bloquear sirvió, y la eficiencia relativa estima cuánto ganaste frente a un diseño completamente al azar."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\beta_j + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        [
          "y_{ij}",
          "la respuesta del tratamiento i en el bloque j"
        ],
        [
          "\\mu",
          "la media general"
        ],
        [
          "\\tau_i",
          "el efecto del tratamiento i (con varios factores: efectos principales e interacciones)"
        ],
        [
          "\\beta_j",
          "el efecto del bloque j"
        ],
        [
          "\\varepsilon_{ij}",
          "el error experimental, independiente, con media 0 y varianza constante"
        ]
      ]
    },
    "hipotesis": [
      {
        "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0",
        "h1": "\\text{algún } \\tau_i \\ne 0",
        "texto": "Los tratamientos tienen la misma media. Se prueba con F = CM de tratamientos / CM del error; con factores cruzados, una prueba por efecto principal y por interacción."
      }
    ],
    "supuestos": [
      {
        "nombre": "Normalidad de los residuos",
        "como": "En «Revisar los supuestos del modelo» con la misma respuesta, tratamientos y bloque: prueba de Shapiro-Wilk y gráfico de cuantiles. En el Reporte se revisan solos.",
        "verificar": "supuestos",
        "siFalla": "Con desvíos leves y bloques balanceados la F es robusta. Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) o usa la prueba de Friedman, que compara por rangos dentro de los bloques.",
        "alternativa": "friedman"
      },
      {
        "nombre": "Varianzas iguales entre tratamientos",
        "como": "Pruebas de Levene, Brown-Forsythe y Bartlett en «Revisar los supuestos del modelo».",
        "verificar": "supuestos",
        "siFalla": "Si la varianza crece con la media (conteos, pesos) prueba una transformación logarítmica o un modelo lineal generalizado.",
        "alternativa": "glm"
      },
      {
        "nombre": "Aditividad bloque × tratamiento",
        "como": "Prueba de no aditividad de Tukey (un grado de libertad) en «Revisar los supuestos del modelo».",
        "verificar": "supuestos",
        "siFalla": "Si los tratamientos responden distinto según el bloque, una transformación suele corregirlo; si no, analiza con bloques aleatorios en un modelo mixto.",
        "alternativa": "mixto-bloques"
      },
      {
        "nombre": "Independencia",
        "como": "La da el sorteo de los tratamientos dentro de cada bloque; no se prueba con los datos.",
        "verificar": null,
        "siFalla": "Si mediste varias veces la misma parcela, esos datos no son repeticiones: usa medidas repetidas.",
        "alternativa": "medidas-repetidas"
      }
    ],
    "datos": {
      "columnas": [
        {
          "nombre": "rend",
          "tipo": "numérica continua",
          "papel": "respuesta"
        },
        {
          "nombre": "hibrido, dosis",
          "tipo": "factor con k niveles (1 a 3 factores)",
          "papel": "tratamientos"
        },
        {
          "nombre": "bloque",
          "tipo": "factor con r niveles",
          "papel": "bloque (diseño)"
        }
      ],
      "minimo": "Al menos 3 bloques; conviene que el error tenga 12 grados de libertad o más. Cada bloque debe tener todos los tratamientos.",
      "balance": "Si faltan algunas parcelas, SigmaPro lo detecta y usa sumas de cuadrados tipo III (o II, a elegir); las medias se comparan como medias ajustadas. Si hay más de una parcela por tratamiento en cada bloque, ajusta bloques generalizados. En esos dos casos no calcula la eficiencia relativa de los bloques.",
      "notaFormato": "Formato largo: una fila por parcela, con una columna para el bloque, una por factor de tratamiento y una para la respuesta.",
      "errores": [
        "Capturar el promedio de cada tratamiento en lugar de una fila por parcela: sin repeticiones no hay error experimental.",
        "Escribir las dosis (0, 60, 120…) como números y analizarlas como variable continua: en un diseño son niveles de un factor (para la forma de la respuesta usa polinomios ortogonales).",
        "Contar como repeticiones las plantas o los frutos de una misma parcela (pseudorreplicación): promédialos por parcela o usa un modelo mixto.",
        "Analizar porcentajes o conteos sin transformar cuando su varianza depende de la media."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los supuestos con «Revisar los supuestos del modelo» (en el Reporte aparecen solos) antes de leer las pruebas.",
        "En el cuadro de análisis de varianza, lee primero la interacción (si hay dos o más factores): si es significativa, compara un factor dentro de cada nivel del otro.",
        "Lee la F y la p de cada efecto principal; la F de bloques solo dice si bloquear ayudó.",
        "Mira el CV y la eficiencia relativa para juzgar la precisión del experimento.",
        "Compara las medias (Tukey, Duncan, contrastes o polinomios) en «Comparaciones de medias»."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento difirió entre dosis de nitrógeno (F(3, 33) = 41.2, p < 0.001) sin interacción con el híbrido (F(6, 33) = 1.1, p = 0.38). El coeficiente de variación fue de 7.4 % y la eficiencia relativa de los bloques frente a un diseño completamente al azar fue de 130 %».",
      "guias": [
        "F",
        "p",
        "cv",
        "eficiencia",
        "r2"
      ]
    },
    "limitaciones": [
      "Si los bloques son muy grandes (muchos tratamientos) dejan de ser homogéneos: usa bloques incompletos (látice o BIB).",
      "Si la variación va en dos direcciones (hileras y columnas), el cuadro latino quita las dos.",
      "Si los bloques son una muestra de un conjunto mayor (localidades, años), trátalos como aleatorios en un modelo mixto.",
      "Para conteos o proporciones con varianza ligada a la media, usa un modelo lineal generalizado."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  },
  "en": {
    "alias": [
      "Randomized complete block ANOVA",
      "Randomized complete block design",
      "RCBD"
    ],
    "paraQue": "Compares treatments when the field or the experimental material changes from place to place, removing that variation with blocks.",
    "preguntas": [
      "Do four bean varieties sown on a sloping field differ in yield, with one block per strip of the slope?",
      "How does the yield of two maize hybrids respond to four nitrogen rates, and does the response depend on the hybrid?",
      "Does tomato fruit weight change with three substrates when each greenhouse is a block?"
    ],
    "teoria": [
      "In a field experiment the plots are not alike: fertility, moisture or slope change. The randomized complete block design groups similar plots into blocks and, within each block, randomizes every treatment once. Each treatment is thus compared with the others under similar conditions, and the difference between blocks is removed from the experimental error, which becomes smaller and makes the test more sensitive.",
      "The analysis of variance splits the total variation of the response into three parts: the part due to blocks, the part due to treatments and the part left unexplained (the error). If treatments had no effect, their mean square would estimate the same as the error mean square and the F ratio would be close to 1. In SigmaPro the treatments can be up to three crossed factors (for example, hybrid × rate): the treatment effect is then split into main effects and their interactions. If a block has more than one plot per treatment, the app fits a generalized block model, and if plots are missing it uses type III (or II) sums of squares, which do not depend on the order of the terms.",
      "The block is a restriction on randomization, not a treatment: its F test only says whether blocking helped, and the relative efficiency estimates how much you gained over a completely randomized design."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\beta_j + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        [
          "y_{ij}",
          "the response of treatment i in block j"
        ],
        [
          "\\mu",
          "the overall mean"
        ],
        [
          "\\tau_i",
          "the effect of treatment i (with several factors: main effects and interactions)"
        ],
        [
          "\\beta_j",
          "the effect of block j"
        ],
        [
          "\\varepsilon_{ij}",
          "the experimental error, independent, with mean 0 and constant variance"
        ]
      ]
    },
    "hipotesis": [
      {
        "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0",
        "h1": "\\text{some } \\tau_i \\ne 0",
        "texto": "The treatments have the same mean. Tested with F = treatment MS / error MS; with crossed factors, one test per main effect and per interaction."
      }
    ],
    "supuestos": [
      {
        "nombre": "Normality of residuals",
        "como": "In “Check the model assumptions” with the same response, treatments and block: Shapiro-Wilk test and quantile plot. In the Report they are checked automatically.",
        "verificar": "supuestos",
        "siFalla": "With mild departures and balanced blocks the F test is robust. With strong departures, transform the response (Box-Cox in Data) or use the Friedman test, which compares ranks within blocks.",
        "alternativa": "friedman"
      },
      {
        "nombre": "Equal variances among treatments",
        "como": "Levene, Brown-Forsythe and Bartlett tests in “Check the model assumptions”.",
        "verificar": "supuestos",
        "siFalla": "If the variance grows with the mean (counts, weights), try a log transformation or a generalized linear model.",
        "alternativa": "glm"
      },
      {
        "nombre": "Block × treatment additivity",
        "como": "Tukey’s one-degree-of-freedom test for nonadditivity in “Check the model assumptions”.",
        "verificar": "supuestos",
        "siFalla": "If treatments respond differently depending on the block, a transformation usually fixes it; otherwise, analyze with random blocks in a mixed model.",
        "alternativa": "mixto-bloques"
      },
      {
        "nombre": "Independence",
        "como": "It comes from randomizing the treatments within each block; it is not tested with the data.",
        "verificar": null,
        "siFalla": "If you measured the same plot several times, those data are not replicates: use repeated measures.",
        "alternativa": "medidas-repetidas"
      }
    ],
    "datos": {
      "columnas": [
        {
          "nombre": "rend",
          "tipo": "continuous numeric",
          "papel": "response"
        },
        {
          "nombre": "hibrido, dosis",
          "tipo": "factor with k levels (1 to 3 factors)",
          "papel": "treatments"
        },
        {
          "nombre": "bloque",
          "tipo": "factor with r levels",
          "papel": "block (design)"
        }
      ],
      "minimo": "At least 3 blocks; the error should have 12 degrees of freedom or more. Each block must contain every treatment.",
      "balance": "If some plots are missing, SigmaPro detects it and uses type III (or II, your choice) sums of squares; means are compared as adjusted means. If there is more than one plot per treatment in each block, it fits generalized blocks. In those two cases it does not compute the relative efficiency of the blocks.",
      "notaFormato": "Long format: one row per plot, with a column for the block, one per treatment factor and one for the response.",
      "errores": [
        "Entering the mean of each treatment instead of one row per plot: without replicates there is no experimental error.",
        "Typing the rates (0, 60, 120…) as numbers and analyzing them as a continuous variable: in a design they are levels of a factor (for the shape of the response use orthogonal polynomials).",
        "Counting plants or fruits of the same plot as replicates (pseudoreplication): average them per plot or use a mixed model.",
        "Analyzing untransformed percentages or counts when their variance depends on the mean."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions with “Check the model assumptions” (in the Report they appear automatically) before reading the tests.",
        "In the analysis of variance table, read the interaction first (with two or more factors): if it is significant, compare one factor within each level of the other.",
        "Read the F and p of each main effect; the block F only says whether blocking helped.",
        "Look at the CV and the relative efficiency to judge the precision of the experiment.",
        "Compare the means (Tukey, Duncan, contrasts or polynomials) in “Mean comparisons”."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield differed among nitrogen rates (F(3, 33) = 41.2, p < 0.001) with no interaction with hybrid (F(6, 33) = 1.1, p = 0.38). The coefficient of variation was 7.4% and the relative efficiency of the blocks compared with a completely randomized design was 130%.”",
      "guias": [
        "F",
        "p",
        "cv",
        "eficiencia",
        "r2"
      ]
    },
    "limitaciones": [
      "If blocks are very large (many treatments) they stop being homogeneous: use incomplete blocks (lattice or BIB).",
      "If variation runs in two directions (rows and columns), the Latin square removes both.",
      "If the blocks are a sample from a larger set (locations, years), treat them as random in a mixed model.",
      "For counts or proportions whose variance is tied to the mean, use a generalized linear model."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  }
});
