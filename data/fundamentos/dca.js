SP_FICHA({
  "id": "dca",
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca"],
  "relacionados": ["dbca", "kruskal-wallis", "comparaciones-medias", "supuestos", "glm-gamma", "repeticiones"],
  "ejemplo": { "conjunto": "venenos", "entradas": { "respuesta": "tiempo", "tratamientos": ["veneno", "tratamiento"] }, "opciones": {} },
  "formato": {
    "largo": [["veneno", "tratamiento", "tiempo"], ["I", "A", "0.31"], ["I", "A", "0.45"], ["I", "A", "0.46"], ["I", "A", "0.43"], ["I", "B", "0.82"], ["I", "B", "1.1"], ["I", "B", "0.88"]],
    "ancho": null
  },
  "es": {
    "alias": ["ANOVA de una o más vías", "Diseño completamente al azar", "DCA", "CRD"],
    "paraQue": "Compara tratamientos asignados por sorteo a unidades experimentales parecidas entre sí, como macetas en una cámara o cajas de germinación.",
    "preguntas": [
      "¿Difiere la germinación de semillas de chile con cinco tratamientos pregerminativos aplicados en cajas de Petri dentro de la misma cámara?",
      "¿Cambia la altura de plántulas de jitomate con tres sustratos y dos dosis de fertilizante, y depende el efecto del sustrato de la dosis?",
      "¿Cuál de cuatro insecticidas acorta más el tiempo de supervivencia de un insecto plaga criado en laboratorio?"
    ],
    "teoria": [
      "El diseño completamente al azar es el más sencillo: cada tratamiento se asigna por sorteo a varias unidades experimentales (macetas, cajas, animales) sin ninguna restricción. Por eso solo conviene cuando las unidades son homogéneas, como en un laboratorio o un invernadero con condiciones controladas; si cambian de un lugar a otro, esa variación se queda en el error y la prueba pierde sensibilidad.",
      "El análisis de varianza separa la variación total en la parte que explican los tratamientos y la que queda dentro de ellos, el error. La razón F compara el cuadrado medio de los tratamientos con el del error: si los tratamientos no tuvieran efecto, los dos estimarían la misma varianza y F estaría cerca de 1. En SigmaPro los tratamientos pueden ser hasta tres factores cruzados (por ejemplo, veneno × antídoto); entonces el efecto se reparte en efectos principales e interacciones, y la app agrega los efectos simples: la prueba F de cada factor dentro de cada nivel del otro.",
      "No hace falta el mismo número de repeticiones en todos los tratamientos. Con datos desbalanceados, las sumas de cuadrados tipo I, II y III dejan de coincidir: SigmaPro usa la tipo III por omisión (puedes elegir la II o la I) y, si falta alguna combinación de niveles, pasa a la II, porque la III no existe. Las medias se reportan como medias marginales estimadas, con su error estándar."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "la respuesta de la repetición j del tratamiento i"],
        ["\\mu", "la media general"],
        ["\\tau_i", "el efecto del tratamiento i (con varios factores: efectos principales e interacciones)"],
        ["\\varepsilon_{ij}", "el error experimental, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma media. Se prueba con F = CM de tratamientos / CM del error; con factores cruzados, una prueba por efecto principal y por interacción, más los efectos simples dentro de cada nivel." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "«Revisar los supuestos del modelo», con los mismos tratamientos y sin bloques, ajusta este mismo modelo: su semáforo decide con Shapiro-Wilk y muestra el gráfico de cuantiles con su banda. En el Reporte, los supuestos de este diseño se revisan solos.", "verificar": "supuestos", "siFalla": "Con grupos de tamaño parecido la F tolera desvíos leves. Con desvíos fuertes, transforma la respuesta (Box-Cox en Datos) o, con un solo factor, usa la prueba de Kruskal-Wallis.", "alternativa": "kruskal-wallis" },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "En «Revisar los supuestos del modelo»: Brown-Forsythe (la que decide su semáforo), Levene, Bartlett y Fligner-Killeen sobre los residuos de cada tratamiento, con la razón entre la varianza mayor y la menor.", "verificar": "supuestos", "siFalla": "Si la varianza crece con la media, aplica la transformación que propone Box-Cox (logaritmo, recíproco…) o usa un modelo lineal generalizado; para tiempos o pesos positivos y asimétricos, el modelo gamma.", "alternativa": "glm-gamma" },
      { "nombre": "Independencia", "como": "La da el sorteo. Durbin-Watson, en el semáforo de «Revisar los supuestos del modelo», la revisa en el orden de las filas o en el de la columna que elijas (por ejemplo, la posición en la mesa).", "verificar": "supuestos", "siFalla": "Si las unidades vecinas se parecen, agrúpalas en bloques en el siguiente ensayo; si mediste la misma unidad varias veces, esas mediciones no son repeticiones: usa medidas repetidas.", "alternativa": "medidas-repetidas" },
      { "nombre": "Sin valores atípicos", "como": "El semáforo de «Revisar los supuestos del modelo» prueba el mayor residuo estudentizado con la corrección de Bonferroni y dice en qué fila está; las gráficas de residuos marcan los que pasan de ±2.", "verificar": "supuestos", "siFalla": "Revisa primero que no sea un error de captura; si el dato es real, analiza con y sin él y repórtalo.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "veneno, tratamiento", "tipo": "factor con k niveles (1 a 3 factores)", "papel": "tratamientos" }
      ],
      "minimo": "Al menos 3 repeticiones por tratamiento (mejor 4 o más), y que el error tenga unos 12 grados de libertad o más: con t tratamientos y r repeticiones tiene t(r − 1). «Número de repeticiones de un experimento» te ayuda a calcularlas.",
      "balance": "Las repeticiones pueden ser distintas entre tratamientos: SigmaPro usa sumas de cuadrados tipo III (o II o I, a elegir) y medias marginales estimadas. Si falta una combinación de niveles, lo avisa, pasa a tipo II y marca con «—» las medias que no se pueden estimar. Las filas con un faltante en la respuesta o en un factor se excluyen.",
      "notaFormato": "Formato largo: una fila por unidad experimental, una columna por factor de tratamiento y una para la respuesta. Si tienes una columna por tratamiento (formato ancho), pásala a larga en Datos (Ancha ⇄ larga).",
      "errores": [
        "Capturar el promedio de cada tratamiento en lugar de una fila por unidad: sin repeticiones no hay error experimental.",
        "Contar como repeticiones varias plantas de la misma maceta o varias lecturas de la misma caja (pseudorreplicación): promédialas por unidad.",
        "Usar este diseño cuando las unidades no son homogéneas (un gradiente de luz en el invernadero): esa variación infla el error; mejor bloquea.",
        "Analizar porcentajes o conteos sin transformar cuando su varianza depende de la media."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa los supuestos en «Revisar los supuestos del modelo» (en el Reporte se revisan solos).",
        "En el cuadro de análisis de varianza, lee primero la interacción (con dos o más factores): si es significativa, ve a los efectos simples, a las medias de las combinaciones y a la gráfica de interacción.",
        "Lee la F y la p de cada efecto principal; la nota del cuadro dice si los datos están balanceados y qué tipo de suma de cuadrados se usó.",
        "En el resumen del ensayo, mira el CV y la R² para juzgar la precisión.",
        "Compara las medias con «Comparar las medias de este diseño» (Tukey, Duncan, Dunnett, contrastes o polinomios)."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La germinación difirió entre los cinco tratamientos pregerminativos (F(4, 15) = 12.6, p < 0.001). El coeficiente de variación fue de 8.2 % y los tratamientos explicaron 77 % de la variación (R² = 0.77)».",
      "guias": ["F", "p", "cv", "r2", "ee"]
    },
    "limitaciones": [
      "Si las unidades no son homogéneas (pendiente, gradiente de luz, fechas de siembra), bloquéalas: bloques completos al azar o cuadro latino.",
      "Con más de tres factores o con covariables, usa el modelo lineal general (fórmula) o el análisis de covarianza.",
      "Con varianzas muy distintas y un solo factor, la prueba de Kruskal-Wallis es más segura.",
      "Para conteos o proporciones, usa un modelo lineal generalizado de conteos o de proporciones."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  },
  "en": {
    "alias": ["One-way or factorial ANOVA", "Completely randomized design", "CRD"],
    "paraQue": "Compares treatments randomly assigned to experimental units that are alike, such as pots in a growth chamber or germination boxes.",
    "preguntas": [
      "Does the germination of chili pepper seeds differ among five pregermination treatments applied in Petri dishes inside the same chamber?",
      "Does the height of tomato seedlings change with three substrates and two fertilizer rates, and does the substrate effect depend on the rate?",
      "Which of four insecticides most shortens the survival time of a pest insect reared in the laboratory?"
    ],
    "teoria": [
      "The completely randomized design is the simplest one: each treatment is assigned at random to several experimental units (pots, boxes, animals) without any restriction. For that reason it only pays off when the units are homogeneous, as in a laboratory or a greenhouse with controlled conditions; if they change from place to place, that variation stays in the error and the test loses sensitivity.",
      "The analysis of variance splits the total variation into the part explained by the treatments and the part left within them, the error. The F ratio compares the treatment mean square with the error mean square: if treatments had no effect, both would estimate the same variance and F would be close to 1. In SigmaPro the treatments can be up to three crossed factors (for example, poison × antidote); the effect is then split into main effects and interactions, and the app adds the simple effects: the F test of each factor within each level of the other.",
      "Treatments do not need the same number of replicates. With unbalanced data, type I, II and III sums of squares no longer agree: SigmaPro uses type III by default (you can choose II or I) and, if some combination of levels is missing, it switches to type II, because type III does not exist. Means are reported as estimated marginal means with their standard errors."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + \\varepsilon_{ij}, \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "the response of replicate j of treatment i"],
        ["\\mu", "the overall mean"],
        ["\\tau_i", "the effect of treatment i (with several factors: main effects and interactions)"],
        ["\\varepsilon_{ij}", "the experimental error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean. Tested with F = treatment MS / error MS; with crossed factors, one test per main effect and per interaction, plus the simple effects within each level." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "“Check the model assumptions”, with the same treatments and no blocks, fits this same model: its checklist decides with the Shapiro-Wilk test and shows the quantile plot with its band. In the Report, the assumptions of this design are checked automatically.", "verificar": "supuestos", "siFalla": "With groups of similar size the F test tolerates mild departures. With strong departures, transform the response (Box-Cox in Data) or, with a single factor, use the Kruskal-Wallis test.", "alternativa": "kruskal-wallis" },
      { "nombre": "Equal variances among treatments", "como": "In “Check the model assumptions”: Brown-Forsythe (the one that decides its checklist), Levene, Bartlett and Fligner-Killeen tests on the residuals of each treatment, with the ratio of the largest to the smallest variance.", "verificar": "supuestos", "siFalla": "If the variance grows with the mean, apply the transformation suggested by Box-Cox (log, reciprocal…) or use a generalized linear model; for positive, skewed times or weights, the gamma model.", "alternativa": "glm-gamma" },
      { "nombre": "Independence", "como": "It comes from randomization. The Durbin-Watson test in the checklist of “Check the model assumptions” checks it in the order of the rows or of the column you choose (for example, the position on the bench).", "verificar": "supuestos", "siFalla": "If neighboring units are alike, group them into blocks in the next trial; if you measured the same unit several times, those measurements are not replicates: use repeated measures.", "alternativa": "medidas-repetidas" },
      { "nombre": "No outliers", "como": "The checklist of “Check the model assumptions” tests the largest studentized residual with the Bonferroni correction and says which row it is in; the residual plots mark those beyond ±2.", "verificar": "supuestos", "siFalla": "First make sure it is not a data-entry error; if the value is real, analyze with and without it and report both.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "veneno, tratamiento", "tipo": "factor with k levels (1 to 3 factors)", "papel": "treatments" }
      ],
      "minimo": "At least 3 replicates per treatment (4 or more is better), and an error with about 12 degrees of freedom or more: with t treatments and r replicates it has t(r − 1). “Number of replicates for an experiment” helps you compute them.",
      "balance": "Replicates may differ among treatments: SigmaPro uses type III sums of squares (or II or I, your choice) and estimated marginal means. If a combination of levels is missing, it says so, switches to type II and marks with “—” the means that cannot be estimated. Rows with a missing value in the response or in a factor are excluded.",
      "notaFormato": "Long format: one row per experimental unit, one column per treatment factor and one for the response. If you have one column per treatment (wide format), convert it to long in Data (Wide ⇄ long).",
      "errores": [
        "Entering the mean of each treatment instead of one row per unit: without replicates there is no experimental error.",
        "Counting several plants from the same pot or several readings from the same box as replicates (pseudoreplication): average them per unit.",
        "Using this design when units are not homogeneous (a light gradient in the greenhouse): that variation inflates the error; block instead.",
        "Analyzing untransformed percentages or counts when their variance depends on the mean."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions in “Check the model assumptions” (in the Report they are checked automatically).",
        "In the analysis of variance table, read the interaction first (with two or more factors): if it is significant, go to the simple effects, the means of the combinations and the interaction plot.",
        "Read the F and p of each main effect; the table note says whether the data are balanced and which type of sums of squares was used.",
        "In the trial summary, look at the CV and the R² to judge precision.",
        "Compare the means with “Compare the means of this design” (Tukey, Duncan, Dunnett, contrasts or polynomials)."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Germination differed among the five pregermination treatments (F(4, 15) = 12.6, p < 0.001). The coefficient of variation was 8.2% and the treatments explained 77% of the variation (R² = 0.77).”",
      "guias": ["F", "p", "cv", "r2", "ee"]
    },
    "limitaciones": [
      "If the units are not homogeneous (slope, light gradient, sowing dates), block them: randomized complete blocks or a Latin square.",
      "With more than three factors or with covariates, use the general linear model (formula) or the analysis of covariance.",
      "With very different variances and a single factor, the Kruskal-Wallis test is safer.",
      "For counts or proportions, use a generalized linear model for counts or for proportions."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Searle, S. R., Speed, F. M., & Milliken, G. A. (1980). Population marginal means in the linear model: An alternative to least squares means. The American Statistician, 34(4), 216–221.",
      "Box, G. E. P., & Cox, D. R. (1964). An analysis of transformations. Journal of the Royal Statistical Society: Series B (Methodological), 26(2), 211–252."
    ]
  }
});
