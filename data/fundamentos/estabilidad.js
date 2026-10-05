SP_FICHA({
  "id": "estabilidad",
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["ensayos-multiambiente", "ammi", "gge", "dos-etapas"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "ambiente": "ambiente", "repeticion": "repeticion" }, "opciones": { "eeb": "propio", "objetivo": "maximo" } },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": [["ambiente", "genotipo", "1", "2", "3"], ["E1", "G1", "2.167", "2.50304", "2.42732"], ["E1", "G2", "3.2075", "2.9329", "2.56484"]]
  },
  "es": {
    "alias": ["Parámetros de estabilidad", "Regresión de Eberhart y Russell", "Ecovalencia de Wricke", "Varianza de estabilidad de Shukla"],
    "paraQue": "Mide qué tan estable es cada genotipo a través de los ambientes con varios índices clásicos, para recomendar los que rinden bien y de forma predecible.",
    "preguntas": [
      "¿Qué variedad de avena mantiene su rendimiento en años buenos y malos?",
      "¿Qué híbridos aprovechan los ambientes favorables (b > 1) y cuáles se defienden mejor en los desfavorables?",
      "¿Qué genotipo combina rendimiento alto y estabilidad para recomendarlo en toda la región?"
    ],
    "teoria": [
      "Cuando hay interacción genotipo × ambiente, la media no basta para elegir: interesa también cómo responde cada genotipo cuando cambia el ambiente. SigmaPro parte de la tabla de medias genotipo × ambiente y calcula varias medidas clásicas.",
      "Finlay y Wilkinson, y después Eberhart y Russell, hacen una regresión de cada genotipo sobre el índice ambiental, que es la media del ambiente menos la media general. La pendiente b mide la respuesta: b = 1 es la respuesta promedio; b > 1, un genotipo que aprovecha los buenos ambientes; b < 1, uno que se defiende en los malos. Las desviaciones de la regresión (S²d) miden qué tan predecible es esa respuesta: el genotipo deseable tiene media alta, b cerca de 1 y S²d cerca de 0. La app prueba b = 1 con una t y S²d = 0 con una F contra el error combinado, y presenta el análisis de varianza de Eberhart y Russell.",
      "La ecovalencia de Wricke (W) es la contribución de cada genotipo a la suma de cuadrados de la interacción; la varianza de Shukla (σ²) la convierte en una varianza con su prueba F. La superioridad de Lin y Binns (Pi) mide la distancia al mejor genotipo de cada ambiente. Las estadísticas de Huehn usan rangos y no dependen de la normalidad; el YS de Kang combina el rango de la media con una penalización por la varianza de Shukla, y el índice de Annicchiarico (Wi) estima el rendimiento relativo que el genotipo supera con alta probabilidad."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu_i + b_i I_j + \\delta_{ij}, \\quad I_j = \\bar{y}_{\\cdot j} - \\bar{y}_{\\cdot\\cdot}",
      "terminos": [
        ["\\bar{y}_{ij}", "la media del genotipo i en el ambiente j"],
        ["\\mu_i", "la media del genotipo i en todos los ambientes"],
        ["b_i", "la pendiente de estabilidad del genotipo i"],
        ["I_j", "el índice ambiental: la media del ambiente j menos la media general"],
        ["\\delta_{ij}", "la desviación de la regresión; su varianza, corregida por el error (CME/r), es S²d"]
      ]
    },
    "hipotesis": [
      { "h0": "b_i = 1", "h1": "b_i \\ne 1", "texto": "El genotipo tiene la respuesta promedio a los ambientes: t = (b − 1) / EE(b), con el EE de su propia regresión o del error combinado (a elegir)." },
      { "h0": "S_{di}^2 = 0", "h1": "S_{di}^2 > 0", "texto": "La respuesta del genotipo es predecible: F = CM de sus desviaciones / (CME/r)." },
      { "h0": "\\sigma_i^2 = 0", "h1": "\\sigma_i^2 > 0", "texto": "Varianza de estabilidad de Shukla, con F contra el error combinado." }
    ],
    "supuestos": [
      { "nombre": "Respuesta lineal al índice ambiental", "como": "La R² de cada genotipo en el cuadro de regresión y la gráfica de la regresión de cada genotipo sobre el índice (hasta 10 genotipos).", "verificar": null, "siFalla": "Si la relación no es lineal, apóyate en las medidas que no dependen de la recta (Wricke, Shukla, Huehn) o en el AMMI.", "alternativa": "ammi" },
      { "nombre": "Errores homogéneos entre ambientes", "como": "Semáforo «Homogeneidad de los errores»: razón entre el mayor y el menor CME y prueba de Bartlett.", "verificar": null, "siFalla": "Las F de S²d y de Shukla y el YS de Kang usan el error combinado: con errores muy distintos, tómalos como aproximados.", "alternativa": null },
      { "nombre": "Tabla genotipo × ambiente completa", "como": "Si faltan combinaciones, la app las imputa por EM-AMMI (opción activada por omisión) y lo marca en el semáforo «Celdas imputadas».", "verificar": null, "siFalla": "Con muchas celdas imputadas (semáforo en rojo), los índices pierden confiabilidad: quita los genotipos o ambientes muy incompletos.", "alternativa": null },
      { "nombre": "Normalidad de los residuos", "como": "Este análisis no la prueba: filtra un ambiente (Filtrar filas… en Datos) y revísalo en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Las estadísticas de Huehn, basadas en rangos, no la necesitan; apóyate en ellas.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (al menos 3)", "papel": "genotipos" },
        { "nombre": "ambiente", "tipo": "factor con e niveles (al menos 3)", "papel": "ambientes" },
        { "nombre": "repeticion", "tipo": "factor con r niveles (opcional)", "papel": "repeticiones o bloques dentro de cada ambiente" }
      ],
      "minimo": "Al menos 3 genotipos y 3 ambientes; para que la regresión sea útil conviene tener 8 o más ambientes con un rango amplio de índices. Con repeticiones se obtienen S²d, las F de Shukla y el YS de Kang.",
      "balance": "Igual que en el análisis conjunto: las celdas vacías se imputan por EM-AMMI si la opción está activa. El YS de Kang necesita el error combinado (repeticiones), y el índice de Annicchiarico solo se calcula cuando lo mejor es la mayor respuesta.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para el ambiente, el genotipo, la repetición y la respuesta (o una media por genotipo y ambiente, sin repetición).",
      "errores": [
        "Usar pocos ambientes o ambientes muy parecidos: la pendiente b queda mal estimada.",
        "Leer b < 1 como «mejor» sin mirar la media: un genotipo estable pero de bajo rendimiento rara vez interesa.",
        "Juntar en la misma tabla ambientes con unidades o manejos distintos (por ejemplo, riego y temporal sin separarlos).",
        "Recomendar con un solo índice: las medidas premian cosas distintas."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y, con el análisis conjunto de varios ambientes (este reporte no lo repite), si la G × A es significativa: sin interacción, la estabilidad importa poco.",
        "En la regresión sobre el índice ambiental, lee b con su prueba de b = 1, S²d y la R² de cada genotipo; usa la gráfica de media contra pendiente.",
        "Compara la ecovalencia (W y su %), la varianza de Shukla y la superioridad de Lin y Binns: menor es más estable o mejor.",
        "Revisa las estadísticas de Huehn (S1 y S2 con sus Z; S3 y S6), los seleccionados por el YS de Kang y el índice de Annicchiarico (Wi mayor que 100).",
        "Recomienda los genotipos en los que coinciden varias medidas, no los de un solo índice."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Según Eberhart y Russell, G3 tuvo una pendiente cercana a 1 (b = 1.03; prueba de b = 1, p = 0.52) y desviaciones no significativas (p = 0.84), con la menor ecovalencia (2.3 % de la interacción) y el mayor índice de Annicchiarico (Wi = 108 %); se recomienda como genotipo de adaptación general».",
      "guias": ["b-estabilidad", "s2d", "ecovalencia", "shukla", "lin-binns", "annicchiarico"]
    },
    "limitaciones": [
      "El índice ambiental se calcula con los mismos genotipos que se evalúan: la regresión no es independiente y, con pocos genotipos, se sesga.",
      "La regresión resume la interacción en una sola dirección; si la G × A tiene varios patrones, el AMMI o el GGE los describen mejor.",
      "Las medidas no siempre coinciden: unas premian la estabilidad estática (poca variación entre ambientes) y otras la dinámica (seguir la media de los ambientes).",
      "Con errores heterogéneos entre ambientes, las pruebas F de S²d y de Shukla son aproximadas."
    ],
    "referencias": [
      "Finlay, K. W., & Wilkinson, G. N. (1963). The analysis of adaptation in a plant-breeding programme. Australian Journal of Agricultural Research, 14(6), 742–754.",
      "Eberhart, S. A., & Russell, W. A. (1966). Stability parameters for comparing varieties. Crop Science, 6(1), 36–40.",
      "Shukla, G. K. (1972). Some statistical aspects of partitioning genotype-environmental components of variability. Heredity, 29(2), 237–245.",
      "Huehn, M. (1990). Nonparametric measures of phenotypic stability. Part 1: Theory. Euphytica, 47(3), 189–194.",
      "Kang, M. S. (1993). Simultaneous selection for yield and stability in crop performance trials: Consequences for growers. Agronomy Journal, 85(3), 754–757."
    ]
  },
  "en": {
    "alias": ["Stability parameters", "Eberhart and Russell regression", "Wricke's ecovalence", "Shukla's stability variance"],
    "paraQue": "Measures how stable each genotype is across environments with several classical indices, to recommend those that yield well and predictably.",
    "preguntas": [
      "Which oat variety keeps its yield in good and bad years?",
      "Which hybrids take advantage of favorable environments (b > 1) and which hold up better in unfavorable ones?",
      "Which genotype combines high yield and stability so it can be recommended for the whole region?"
    ],
    "teoria": [
      "When there is genotype × environment interaction, the mean is not enough to choose: it also matters how each genotype responds when the environment changes. SigmaPro starts from the genotype × environment table of means and computes several classical measures.",
      "Finlay and Wilkinson, and later Eberhart and Russell, regress each genotype on the environmental index, which is the environment mean minus the overall mean. The slope b measures the response: b = 1 is the average response; b > 1, a genotype that takes advantage of good environments; b < 1, one that holds up in poor ones. The deviations from regression (S²d) measure how predictable that response is: the desirable genotype has a high mean, b close to 1 and S²d close to 0. The app tests b = 1 with a t test and S²d = 0 with an F test against the pooled error, and presents the Eberhart and Russell analysis of variance.",
      "Wricke's ecovalence (W) is each genotype's contribution to the interaction sum of squares; Shukla's variance (σ²) turns it into a variance with its F test. Lin and Binns' superiority (Pi) measures the distance to the best genotype in each environment. Huehn's statistics use ranks and do not depend on normality; Kang's YS combines the rank of the mean with a penalty for Shukla's variance, and Annicchiarico's index (Wi) estimates the relative yield the genotype exceeds with high probability."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu_i + b_i I_j + \\delta_{ij}, \\quad I_j = \\bar{y}_{\\cdot j} - \\bar{y}_{\\cdot\\cdot}",
      "terminos": [
        ["\\bar{y}_{ij}", "the mean of genotype i in environment j"],
        ["\\mu_i", "the mean of genotype i across all environments"],
        ["b_i", "the stability slope of genotype i"],
        ["I_j", "the environmental index: the mean of environment j minus the overall mean"],
        ["\\delta_{ij}", "the deviation from regression; its variance, corrected for the error (MSE/r), is S²d"]
      ]
    },
    "hipotesis": [
      { "h0": "b_i = 1", "h1": "b_i \\ne 1", "texto": "The genotype has the average response to environments: t = (b − 1) / SE(b), with the SE from its own regression or from the pooled error (your choice)." },
      { "h0": "S_{di}^2 = 0", "h1": "S_{di}^2 > 0", "texto": "The genotype's response is predictable: F = MS of its deviations / (MSE/r)." },
      { "h0": "\\sigma_i^2 = 0", "h1": "\\sigma_i^2 > 0", "texto": "Shukla's stability variance, with F against the pooled error." }
    ],
    "supuestos": [
      { "nombre": "Linear response to the environmental index", "como": "The R² of each genotype in the regression table and the plot of each genotype's regression on the index (up to 10 genotypes).", "verificar": null, "siFalla": "If the relationship is not linear, rely on the measures that do not depend on the line (Wricke, Shukla, Huehn) or on AMMI.", "alternativa": "ammi" },
      { "nombre": "Homogeneous errors across environments", "como": "“Homogeneity of errors” in the assumptions checklist: ratio between the largest and smallest MSE and Bartlett's test.", "verificar": null, "siFalla": "The F tests of S²d and Shukla and Kang's YS use the pooled error: with very different errors, take them as approximate.", "alternativa": null },
      { "nombre": "Complete genotype × environment table", "como": "If combinations are missing, the app imputes them by EM-AMMI (option on by default) and flags it under “Imputed cells” in the checklist.", "verificar": null, "siFalla": "With many imputed cells (red in the checklist), the indices lose reliability: remove the very incomplete genotypes or environments.", "alternativa": null },
      { "nombre": "Normality of residuals", "como": "This analysis does not test it: filter one environment (Filter rows… in Data) and check it in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "Huehn's rank-based statistics do not need it; rely on them.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (at least 3)", "papel": "genotypes" },
        { "nombre": "ambiente", "tipo": "factor with e levels (at least 3)", "papel": "environments" },
        { "nombre": "repeticion", "tipo": "factor with r levels (optional)", "papel": "replicates or blocks within each environment" }
      ],
      "minimo": "At least 3 genotypes and 3 environments; for the regression to be useful, 8 or more environments with a wide range of indices are advisable. With replicates, S²d, Shukla's F tests and Kang's YS are obtained.",
      "balance": "As in the combined analysis: empty cells are imputed by EM-AMMI if the option is on. Kang's YS needs the pooled error (replicates), and Annicchiarico's index is computed only when the highest response is best.",
      "notaFormato": "Long format: one row per plot, with columns for environment, genotype, replicate and response (or one mean per genotype and environment, without replicate).",
      "errores": [
        "Using few environments or very similar ones: the slope b is poorly estimated.",
        "Reading b < 1 as “better” without looking at the mean: a stable but low-yielding genotype is seldom of interest.",
        "Putting environments with different units or management in the same table (for example, irrigated and rainfed without separating them).",
        "Recommending from a single index: the measures reward different things."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and, with the combined analysis of several environments (this report does not repeat it), whether G × E is significant: without interaction, stability matters little.",
        "In the regression on the environmental index, read b with its test of b = 1, S²d and the R² of each genotype; use the mean vs. slope plot.",
        "Compare the ecovalence (W and its %), Shukla's variance and Lin and Binns' superiority: lower is more stable or better.",
        "Review Huehn's statistics (S1 and S2 with their Z; S3 and S6), the genotypes selected by Kang's YS and Annicchiarico's index (Wi above 100).",
        "Recommend the genotypes on which several measures agree, not those of a single index."
      ],
      "ejemplo": "Example write-up (illustrative figures): “According to Eberhart and Russell, G3 had a slope close to 1 (b = 1.03; test of b = 1, p = 0.52) and nonsignificant deviations (p = 0.84), with the lowest ecovalence (2.3% of the interaction) and the highest Annicchiarico index (Wi = 108%); it is recommended as a genotype of general adaptation.”",
      "guias": ["b-estabilidad", "s2d", "ecovalencia", "shukla", "lin-binns", "annicchiarico"]
    },
    "limitaciones": [
      "The environmental index is computed from the same genotypes being evaluated: the regression is not independent and, with few genotypes, it is biased.",
      "The regression summarizes the interaction in a single direction; if G × E has several patterns, AMMI or GGE describe them better.",
      "The measures do not always agree: some reward static stability (little variation across environments) and others dynamic stability (following the environment mean).",
      "With heterogeneous errors across environments, the F tests of S²d and Shukla are approximate."
    ],
    "referencias": [
      "Finlay, K. W., & Wilkinson, G. N. (1963). The analysis of adaptation in a plant-breeding programme. Australian Journal of Agricultural Research, 14(6), 742–754.",
      "Eberhart, S. A., & Russell, W. A. (1966). Stability parameters for comparing varieties. Crop Science, 6(1), 36–40.",
      "Shukla, G. K. (1972). Some statistical aspects of partitioning genotype-environmental components of variability. Heredity, 29(2), 237–245.",
      "Huehn, M. (1990). Nonparametric measures of phenotypic stability. Part 1: Theory. Euphytica, 47(3), 189–194.",
      "Kang, M. S. (1993). Simultaneous selection for yield and stability in crop performance trials: Consequences for growers. Agronomy Journal, 85(3), 754–757."
    ]
  }
});
