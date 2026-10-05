SP_FICHA({
  "id": "matriz-correlacion",
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["correlacion", "correlacion-parcial", "regresion-lineal", "seleccion-pasos", "mejores-subconjuntos"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "variables": ["altitud", "temperatura", "materia_organica", "sombra", "rendimiento"] }, "opciones": {} },
  "formato": {
    "largo": [["finca", "altitud", "temperatura", "materia_organica", "sombra", "rendimiento"], ["F01", "1342", "23.2", "6.5", "33", "17.6"], ["F02", "1053", "25.3", "6.8", "23", "15.4"], ["F03", "1048", "24.6", "2.2", "61", "4"], ["F04", "1442", "22.8", "4.2", "38", "14.4"], ["F05", "1629", "21.1", "6.8", "29", "20.5"], ["F06", "1557", "22.2", "6.6", "69", "19.1"], ["F07", "1430", "22.5", "3.6", "61", "10.1"], ["F08", "1682", "20.6", "4", "47", "18.3"]],
    "ancho": null
  },
  "es": {
    "alias": ["Matriz de correlaciones", "Correlaciones múltiples por pares", "Mapa de calor de correlaciones"],
    "paraQue": "Calcula de una vez la correlación entre cada par de varias variables numéricas y ajusta los valores p por hacer muchas pruebas.",
    "preguntas": [
      "¿Qué variables del sitio (altitud, temperatura, materia orgánica, sombra) se relacionan con el rendimiento de café y entre sí?",
      "¿Cuáles de diez caracteres morfológicos de mazorca de maíz están tan correlacionados que miden casi lo mismo?",
      "¿Qué propiedades del suelo varían juntas en un muestreo de 60 parcelas?"
    ],
    "teoria": [
      "Con k variables hay m = k(k − 1)/2 pares: con 5 variables son 10 correlaciones; con 10, ya son 45. SigmaPro calcula para cada par el coeficiente elegido (Pearson, Spearman o Kendall) y su prueba, exactamente como en «Correlación de dos variables», y los ordena en una matriz simétrica con unos en la diagonal. El mapa de calor la pinta en color: oro para las correlaciones positivas y gris para las negativas, más intenso cuanto más fuerte.",
      "El problema de tantas pruebas es que, aunque ninguna correlación fuera real, alguna saldría significativa por azar: con 45 pruebas al 5 % se esperan más de dos falsos positivos. Por eso los asteriscos de la matriz usan valores p ajustados. El ajuste de Holm (el que viene por omisión) y el de Bonferroni controlan la probabilidad de cometer al menos un error en todo el conjunto; Holm ordena los p de menor a mayor y es menos estricto que Bonferroni sin perder esa garantía. El de Benjamini-Hochberg controla la proporción esperada de falsos descubrimientos entre las correlaciones declaradas significativas, y conviene cuando exploras muchas variables. También puedes no ajustar, pero entonces lee la matriz como exploratoria.",
      "Si hay datos faltantes, puedes usar solo las filas completas en todas las variables (todas las correlaciones con las mismas unidades) o cada par con sus propias filas completas (más datos por par, pero con n distinto en cada uno)."
    ],
    "modelo": {
      "tex": "R = \\left( r_{jl} \\right), \\quad m = \\frac{k(k - 1)}{2}, \\quad \\tilde{p}_{(i)} = \\min \\left( 1, \\max_{h \\le i} (m - h + 1) p_{(h)} \\right)",
      "terminos": [
        ["R", "la matriz de correlaciones, simétrica, con unos en la diagonal"],
        ["r_{jl}", "la correlación entre la variable j y la variable l (Pearson, Spearman o Kendall)"],
        ["k, m", "el número de variables y el número de pares que se prueban"],
        ["p_{(h)}", "los valores p de los m pares, ordenados de menor a mayor"],
        ["\\tilde{p}_{(i)}", "el valor p ajustado por Holm (opción por omisión; también Bonferroni, Benjamini-Hochberg o sin ajuste)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_{jl} = 0", "h1": "\\rho_{jl} \\ne 0", "texto": "Para cada par de variables, que no hay correlación en la población. Cada par se prueba como en la correlación de dos variables (bilateral) y su valor p se ajusta por el número de pares." }
    ],
    "supuestos": [
      { "nombre": "Relación lineal o monótona en cada par", "como": "Este análisis no tiene semáforo: abre los pares que te interesen en «Correlación de dos variables» para ver su gráfica de dispersión y comparar Pearson con Spearman y Kendall.", "verificar": "correlacion", "siFalla": "Si alguna relación es curva o hay valores extremos, cambia el «Coeficiente» a Spearman o Kendall.", "alternativa": null },
      { "nombre": "Normalidad de cada variable (valores p e intervalos de Pearson)", "como": "Revisa cada variable en «Revisar los supuestos del modelo», con ella como respuesta y sin tratamientos (Shapiro-Wilk y gráfico de cuantiles).", "verificar": "supuestos", "siFalla": "Usa Spearman o Kendall, o transforma las variables sesgadas en Datos («Transformar…»).", "alternativa": null },
      { "nombre": "Filas independientes", "como": "Lo da el muestreo: cada fila es una unidad distinta. No se prueba con los datos.", "verificar": null, "siFalla": "Si hay varias filas de la misma unidad (fechas, submuestras), promédialas por unidad antes del análisis o usa un modelo mixto.", "alternativa": "modelo-mixto" },
      { "nombre": "Faltantes al azar", "como": "La opción «Filas con faltantes» decide cómo se tratan; el cuadro de pares da el n de cada correlación.", "verificar": null, "siFalla": "Si los faltantes se concentran en ciertas unidades (las de menor rendimiento, por ejemplo), las correlaciones pueden sesgarse: revisa por qué faltan antes de interpretar.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altitud, temperatura, materia_organica, sombra, rendimiento", "tipo": "numérica continua (de 2 a 30 variables)", "papel": "variables" }
      ],
      "minimo": "Al menos 3 filas completas por par para Pearson; en la práctica, 20 o más unidades. Con muchas variables y pocas unidades, el ajuste por multiplicidad deja pocas correlaciones significativas.",
      "balance": "Por omisión usa solo las filas completas en todas las variables y dice cuántas quedaron fuera. Con «Cada par con sus filas completas», cada correlación usa todos los datos de su par y el cuadro de pares da su n; las correlaciones ya no se calculan sobre las mismas unidades.",
      "notaFormato": "Una fila por unidad (finca, planta, parcela) y una columna por variable numérica. La columna que identifica la unidad no entra al análisis.",
      "errores": [
        "Meter muchas variables «por si acaso» y leer los valores p sin ajustar: algunas correlaciones saldrán significativas por azar.",
        "Incluir variables que son suma o porcentaje de otras (peso total y peso de sus partes): su correlación es obligada, no un hallazgo.",
        "Usar números como códigos de categorías (1 = arcilloso, 2 = arenoso) como si fueran variables numéricas.",
        "Mezclar unidades de grupos muy distintos (dos regiones) que crean correlaciones aparentes entre todas las variables."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira el mapa de calor para ubicar los bloques de variables muy relacionadas.",
        "Lee en la conclusión cuántos pares resultan significativos con el ajuste elegido y cuál es la correlación más fuerte.",
        "En el cuadro «Cada par de variables», lee el coeficiente, su intervalo de confianza (con Pearson), el p sin ajustar, el p ajustado y el n de cada par.",
        "Decide con el p ajustado; los asteriscos de la matriz y del mapa ya lo usan.",
        "Abre los pares importantes en «Correlación de dos variables» para revisar su gráfica de dispersión."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «De las 10 correlaciones entre las cinco variables, cuatro fueron significativas con el ajuste de Holm. El rendimiento se correlacionó con la materia orgánica (r = 0.66, p ajustado < 0.001) y con la altitud (r = 0.55, p ajustado = 0.002); la altitud y la temperatura estuvieron casi perfectamente correlacionadas (r = −0.96), por lo que no conviene usarlas juntas como predictores».",
      "guias": ["r", "p-ajustado", "p", "ic", "rho", "tau"]
    },
    "limitaciones": [
      "Cada correlación es simple: no descuenta el efecto de las demás variables. Para eso usa la correlación parcial.",
      "Dos predictores muy correlacionados entre sí (colinealidad) desestabilizan una regresión; revisa el VIF en la regresión lineal o elige predictores con la selección por pasos o los mejores subconjuntos.",
      "La matriz describe relaciones de dos en dos; para resumir la estructura de muchas variables a la vez hace falta un análisis de componentes principales, que SigmaPro no hace.",
      "Con «Cada par con sus filas completas», la matriz puede no ser coherente como conjunto (cada celda viene de unidades distintas)."
    ],
    "referencias": [
      "Holm, S. (1979). A simple sequentially rejective multiple test procedure. Scandinavian Journal of Statistics, 6(2), 65–70.",
      "Benjamini, Y., & Hochberg, Y. (1995). Controlling the false discovery rate: A practical and powerful approach to multiple testing. Journal of the Royal Statistical Society: Series B (Methodological), 57(1), 289–300.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Correlation matrix", "Pairwise correlations", "Correlation heat map"],
    "paraQue": "Computes at once the correlation between every pair of several numeric variables and adjusts the p-values for running many tests.",
    "preguntas": [
      "Which site variables (altitude, temperature, organic matter, shade) are related to coffee yield and to each other?",
      "Which of ten morphological traits of maize ears are so correlated that they measure almost the same thing?",
      "Which soil properties vary together in a survey of 60 plots?"
    ],
    "teoria": [
      "With k variables there are m = k(k − 1)/2 pairs: with 5 variables there are 10 correlations; with 10, already 45. For each pair SigmaPro computes the chosen coefficient (Pearson, Spearman or Kendall) and its test, exactly as in “Correlation between two variables”, and arranges them in a symmetric matrix with ones on the diagonal. The heat map paints it in color: gold for positive correlations and gray for negative ones, more intense the stronger they are.",
      "The problem with so many tests is that, even if no correlation were real, some would come out significant by chance: with 45 tests at 5 % you expect more than two false positives. That is why the asterisks in the matrix use adjusted p-values. The Holm adjustment (the default) and the Bonferroni adjustment control the probability of making at least one error in the whole set; Holm orders the p-values from smallest to largest and is less strict than Bonferroni without losing that guarantee. The Benjamini-Hochberg adjustment controls the expected proportion of false discoveries among the correlations declared significant, and suits exploring many variables. You can also skip the adjustment, but then read the matrix as exploratory.",
      "If there are missing values, you can use only the rows complete in all variables (every correlation with the same units) or each pair with its own complete rows (more data per pair, but a different n for each)."
    ],
    "modelo": {
      "tex": "R = \\left( r_{jl} \\right), \\quad m = \\frac{k(k - 1)}{2}, \\quad \\tilde{p}_{(i)} = \\min \\left( 1, \\max_{h \\le i} (m - h + 1) p_{(h)} \\right)",
      "terminos": [
        ["R", "the correlation matrix, symmetric, with ones on the diagonal"],
        ["r_{jl}", "the correlation between variable j and variable l (Pearson, Spearman or Kendall)"],
        ["k, m", "the number of variables and the number of pairs tested"],
        ["p_{(h)}", "the p-values of the m pairs, ordered from smallest to largest"],
        ["\\tilde{p}_{(i)}", "the Holm-adjusted p-value (the default; also Bonferroni, Benjamini-Hochberg or no adjustment)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_{jl} = 0", "h1": "\\rho_{jl} \\ne 0", "texto": "For each pair of variables, that there is no correlation in the population. Each pair is tested as in the correlation between two variables (two-sided) and its p-value is adjusted for the number of pairs." }
    ],
    "supuestos": [
      { "nombre": "Linear or monotonic relationship in each pair", "como": "This analysis has no assumptions checklist: open the pairs you care about in “Correlation between two variables” to see their scatter plot and compare Pearson with Spearman and Kendall.", "verificar": "correlacion", "siFalla": "If some relationship is curved or there are extreme values, switch the “Coefficient” to Spearman or Kendall.", "alternativa": null },
      { "nombre": "Normality of each variable (Pearson p-values and intervals)", "como": "Check each variable in “Check the model assumptions”, with it as the response and no treatments (Shapiro-Wilk and quantile plot).", "verificar": "supuestos", "siFalla": "Use Spearman or Kendall, or transform the skewed variables in Data (“Transform…”).", "alternativa": null },
      { "nombre": "Independent rows", "como": "It comes from the sampling: each row is a different unit. It is not tested with the data.", "verificar": null, "siFalla": "If there are several rows from the same unit (dates, subsamples), average them per unit before the analysis or use a mixed model.", "alternativa": "modelo-mixto" },
      { "nombre": "Values missing at random", "como": "The option “Rows with missing values” decides how they are handled; the pairs table gives the n of each correlation.", "verificar": null, "siFalla": "If missing values cluster in certain units (the lowest-yielding ones, for example), the correlations can be biased: check why they are missing before interpreting.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altitud, temperatura, materia_organica, sombra, rendimiento", "tipo": "continuous numeric (2 to 30 variables)", "papel": "variables" }
      ],
      "minimo": "At least 3 complete rows per pair for Pearson; in practice, 20 or more units. With many variables and few units, the multiplicity adjustment leaves few significant correlations.",
      "balance": "By default it uses only the rows complete in all variables and says how many were left out. With “Each pair with its complete rows”, each correlation uses all the data of its pair and the pairs table gives its n; the correlations are then no longer computed on the same units.",
      "notaFormato": "One row per unit (farm, plant, plot) and one column per numeric variable. The column that identifies the unit does not enter the analysis.",
      "errores": [
        "Adding many variables “just in case” and reading the unadjusted p-values: some correlations will be significant by chance.",
        "Including variables that are the sum or percentage of others (total weight and the weight of its parts): their correlation is forced, not a finding.",
        "Using numbers as category codes (1 = clay, 2 = sandy) as if they were numeric variables.",
        "Mixing units from very different groups (two regions) that create apparent correlations among all the variables."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the heat map to locate the blocks of strongly related variables.",
        "Read in the conclusion how many pairs are significant with the chosen adjustment and which correlation is strongest.",
        "In the table “Each pair of variables”, read the coefficient, its confidence interval (with Pearson), the unadjusted p, the adjusted p and the n of each pair.",
        "Decide with the adjusted p; the asterisks in the matrix and in the heat map already use it.",
        "Open the important pairs in “Correlation between two variables” to check their scatter plot."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Of the 10 correlations among the five variables, four were significant with Holm’s adjustment. Yield was correlated with organic matter (r = 0.66, adjusted p < 0.001) and with altitude (r = 0.55, adjusted p = 0.002); altitude and temperature were almost perfectly correlated (r = −0.96), so they should not be used together as predictors.”",
      "guias": ["r", "p-ajustado", "p", "ic", "rho", "tau"]
    },
    "limitaciones": [
      "Each correlation is a simple one: it does not remove the effect of the other variables. For that, use the partial correlation.",
      "Two predictors strongly correlated with each other (collinearity) destabilize a regression; check the VIF in linear regression or choose predictors with stepwise selection or best subsets.",
      "The matrix describes relationships two at a time; summarizing the structure of many variables at once requires a principal component analysis, which SigmaPro does not do.",
      "With “Each pair with its complete rows”, the matrix may not be consistent as a whole (each cell comes from different units)."
    ],
    "referencias": [
      "Holm, S. (1979). A simple sequentially rejective multiple test procedure. Scandinavian Journal of Statistics, 6(2), 65–70.",
      "Benjamini, Y., & Hochberg, Y. (1995). Controlling the false discovery rate: A practical and powerful approach to multiple testing. Journal of the Royal Statistical Society: Series B (Methodological), 57(1), 289–300.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  }
});
