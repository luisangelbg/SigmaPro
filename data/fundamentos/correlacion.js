SP_FICHA({
  "id": "correlacion",
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["matriz-correlacion", "correlacion-parcial", "regresion-lineal", "regresion-polinomial", "potencia-correlacion"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "x": "altitud", "y": "rendimiento" }, "opciones": {} },
  "formato": {
    "largo": [["finca", "altitud", "rendimiento"], ["F01", "1342", "17.6"], ["F02", "1053", "15.4"], ["F03", "1048", "4"], ["F04", "1442", "14.4"], ["F05", "1629", "20.5"], ["F06", "1557", "19.1"], ["F07", "1430", "10.1"], ["F08", "1682", "18.3"]],
    "ancho": null
  },
  "es": {
    "alias": ["Correlación de Pearson", "Correlación de Spearman", "Tau de Kendall", "Coeficiente de correlación"],
    "paraQue": "Mide qué tan fuerte y en qué sentido cambian juntas dos variables numéricas, y si esa relación es más que azar.",
    "preguntas": [
      "¿Rinden más las fincas de café que están a mayor altitud?",
      "¿Se relaciona la lectura de clorofila de la hoja (SPAD) con el nitrógeno foliar en trigo?",
      "¿Las plantas de frijol más altas a los 30 días son también las que producen más vainas?"
    ],
    "teoria": [
      "La correlación resume en un número entre −1 y 1 cómo cambian juntas dos variables medidas en las mismas unidades (fincas, plantas, parcelas). El signo da el sentido: positivo si las dos crecen juntas, negativo si una baja cuando la otra sube; el valor absoluto da la fuerza. Una correlación no indica causa: dos variables pueden moverse juntas porque ambas dependen de una tercera.",
      "SigmaPro calcula tres coeficientes y los pone lado a lado. El de Pearson (r) mide la relación lineal: es la covarianza de las dos variables dividida entre el producto de sus desviaciones estándar; su prueba usa una t con n − 2 grados de libertad y su intervalo de confianza sale de la transformación z de Fisher. El de Spearman (ρ) es la correlación de Pearson calculada sobre los rangos, y el τ-b de Kendall compara los pares de unidades que se ordenan igual (concordantes) con los que se ordenan al revés (discordantes). Estos dos miden relaciones monótonas (que siempre suben o siempre bajan, aunque no en línea recta), no suponen normalidad y resisten mejor los valores extremos. Sin empates, sus valores p se calculan como en R, de forma exacta o casi exacta (Spearman hasta 1290 pares; Kendall con menos de 50); con empates, son aproximados.",
      "La conclusión califica la fuerza según Cohen (1988): menos de 0.1, despreciable; de 0.1 a 0.3, débil; de 0.3 a 0.5, moderada; 0.5 o más, fuerte. Con Pearson, r² es la fracción de la variación que comparten las dos variables."
    ],
    "modelo": {
      "tex": "r = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^{n} (x_i - \\bar{x})^2 \\sum_{i=1}^{n} (y_i - \\bar{y})^2}}, \\quad t = \\frac{r \\sqrt{n - 2}}{\\sqrt{1 - r^2}}",
      "terminos": [
        ["r", "el coeficiente de correlación de Pearson (con Spearman, la misma fórmula sobre los rangos de cada variable)"],
        ["x_i, y_i", "los dos valores medidos en la unidad i"],
        ["\\bar{x}, \\bar{y}", "las medias de cada variable"],
        ["n", "el número de pares completos"],
        ["t", "el estadístico de la prueba de Pearson, con n − 2 grados de libertad"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho = 0", "h1": "\\rho \\ne 0", "texto": "No hay correlación en la población. La alternativa puede ser bilateral (distinta de cero), positiva o negativa. Pearson se prueba con t; Spearman con S y Kendall con T (exactos) o con una aproximación cuando hay empates o muchos datos." }
    ],
    "supuestos": [
      { "nombre": "Relación lineal (para Pearson)", "como": "Este análisis no tiene semáforo: mira la gráfica de dispersión con su recta y el cuadro «Los tres coeficientes»; si Pearson y Spearman difieren mucho, la relación no es lineal. «Regresión lineal simple y múltiple» añade la gráfica de residuos y la prueba RESET.", "verificar": "regresion-lineal", "siFalla": "Si la relación es monótona pero curva, usa Spearman o Kendall (opción «Coeficiente»). Si sube y luego baja, la correlación no la describe: ajusta una curva.", "alternativa": "regresion-polinomial" },
      { "nombre": "Normalidad de las dos variables (prueba e intervalo de Pearson)", "como": "Revisa cada variable en «Revisar los supuestos del modelo», con ella como respuesta y sin tratamientos: da la prueba de Shapiro-Wilk y el gráfico de cuantiles.", "verificar": "supuestos", "siFalla": "Con distribuciones sesgadas, usa Spearman o Kendall, o transforma la variable (logaritmo o Box-Cox en Datos, «Transformar…»).", "alternativa": null },
      { "nombre": "Sin valores extremos que dominen", "como": "Se ven en la gráfica de dispersión; en «Regresión lineal simple y múltiple», la distancia de Cook señala los puntos influyentes.", "verificar": "regresion-lineal", "siFalla": "Revisa si el valor es un error de captura; si es real, informa también Spearman o Kendall, que resisten los extremos.", "alternativa": null },
      { "nombre": "Pares independientes", "como": "Lo da el muestreo: cada par viene de una unidad distinta. No se prueba con los datos.", "verificar": null, "siFalla": "Si mediste la misma planta en varias fechas o tomaste varias plantas por parcela, los pares no son independientes: promedia por unidad o usa un modelo mixto.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altitud", "tipo": "numérica continua", "papel": "variable x" },
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "variable y" }
      ],
      "minimo": "Pearson necesita al menos 3 pares (4 para el intervalo de confianza). Para detectar una correlación moderada (r = 0.3) con potencia de 80 % hacen falta unos 85 pares: calcúlalo en «Potencia y tamaño de muestra: correlación».",
      "balance": "Usa solo las filas con las dos variables completas; el cuadro de la prueba dice cuántas quedaron fuera. Al no haber grupos, no hay desbalance que corregir.",
      "notaFormato": "Una fila por unidad (finca, planta, parcela) y una columna por variable; los dos valores de cada fila deben venir de la misma unidad.",
      "errores": [
        "Correlacionar promedios de tratamientos en lugar de unidades: con pocas medias la correlación se infla y su prueba no vale.",
        "Mezclar en una sola nube grupos distintos (variedades, sitios) que por sí solos crean una correlación aparente.",
        "Medir una variable en un intervalo muy estrecho (solo fincas altas): la correlación sale más baja que en toda la población.",
        "Escribir cero donde falta el dato: deja la celda vacía para que la fila quede fuera."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira primero la gráfica de dispersión: la forma de la nube, los valores extremos y los grupos.",
        "Lee el coeficiente, su signo y la fuerza que indica la conclusión; con Pearson, también su intervalo de confianza.",
        "Lee el valor p y cómo se calculó (t de Student, exacto o aproximado) en el cuadro de la prueba.",
        "Compara los tres coeficientes: si Pearson se aparta mucho de Spearman y Kendall, la relación no es lineal o hay puntos que pesan demasiado.",
        "Con Pearson, r² dice qué fracción de la variación comparten las dos variables."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento de café aumentó con la altitud de la finca (r de Pearson = 0.52, IC 95 %: 0.25 a 0.72; t(38) = 3.75, p < 0.001; n = 40); la altitud y el rendimiento compartieron el 27 % de su variación».",
      "guias": ["r", "rho", "tau", "ic", "p", "r2"]
    },
    "limitaciones": [
      "La correlación no prueba causa ni sirve para predecir: para estimar cuánto cambia y por cada unidad de x, usa la regresión lineal.",
      "Si una tercera variable afecta a las dos (la altitud a la temperatura y al rendimiento), calcula la correlación parcial.",
      "Con más de dos variables, la matriz de correlaciones da todos los pares con valores p ajustados.",
      "Pearson mide relaciones lineales y Spearman o Kendall, monótonas: una relación en forma de U puede dar una correlación cercana a cero."
    ],
    "referencias": [
      "Pearson, K. (1895). Notes on regression and inheritance in the case of two parents. Proceedings of the Royal Society of London, 58, 240–242.",
      "Spearman, C. (1904). The proof and measurement of association between two things. The American Journal of Psychology, 15(1), 72–101.",
      "Kendall, M. G. (1938). A new measure of rank correlation. Biometrika, 30(1/2), 81–93.",
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Pearson correlation", "Spearman correlation", "Kendall’s tau", "Correlation coefficient"],
    "paraQue": "Measures how strongly and in which direction two numeric variables change together, and whether that relationship is more than chance.",
    "preguntas": [
      "Do coffee farms at higher altitude yield more?",
      "Is the leaf chlorophyll reading (SPAD) related to leaf nitrogen in wheat?",
      "Are the tallest bean plants at 30 days also the ones that produce the most pods?"
    ],
    "teoria": [
      "Correlation summarizes in a number between −1 and 1 how two variables measured on the same units (farms, plants, plots) change together. The sign gives the direction: positive if both grow together, negative if one drops when the other rises; the absolute value gives the strength. A correlation does not imply cause: two variables may move together because both depend on a third one.",
      "SigmaPro computes three coefficients and shows them side by side. Pearson’s coefficient (r) measures the linear relationship: it is the covariance of the two variables divided by the product of their standard deviations; its test uses a t with n − 2 degrees of freedom and its confidence interval comes from Fisher’s z transformation. Spearman’s coefficient (ρ) is the Pearson correlation computed on the ranks, and Kendall’s τ-b compares the pairs of units that are ordered the same way (concordant) with those ordered the opposite way (discordant). These two measure monotonic relationships (always rising or always falling, though not in a straight line), do not assume normality and are more resistant to extreme values. Without ties, their p-values are computed as in R, exactly or almost exactly (Spearman up to 1290 pairs; Kendall with fewer than 50); with ties, they are approximate.",
      "The conclusion rates the strength following Cohen (1988): below 0.1, negligible; 0.1 to 0.3, weak; 0.3 to 0.5, moderate; 0.5 or more, strong. With Pearson, r² is the fraction of the variation shared by the two variables."
    ],
    "modelo": {
      "tex": "r = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^{n} (x_i - \\bar{x})^2 \\sum_{i=1}^{n} (y_i - \\bar{y})^2}}, \\quad t = \\frac{r \\sqrt{n - 2}}{\\sqrt{1 - r^2}}",
      "terminos": [
        ["r", "Pearson’s correlation coefficient (with Spearman, the same formula on the ranks of each variable)"],
        ["x_i, y_i", "the two values measured on unit i"],
        ["\\bar{x}, \\bar{y}", "the means of each variable"],
        ["n", "the number of complete pairs"],
        ["t", "the statistic of Pearson’s test, with n − 2 degrees of freedom"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho = 0", "h1": "\\rho \\ne 0", "texto": "There is no correlation in the population. The alternative can be two-sided (different from zero), positive or negative. Pearson is tested with t; Spearman with S and Kendall with T (exact) or with an approximation when there are ties or many data." }
    ],
    "supuestos": [
      { "nombre": "Linear relationship (for Pearson)", "como": "This analysis has no assumptions checklist: look at the scatter plot with its line and at the table “The three coefficients”; if Pearson and Spearman differ a lot, the relationship is not linear. “Simple and multiple linear regression” adds the residual plot and the RESET test.", "verificar": "regresion-lineal", "siFalla": "If the relationship is monotonic but curved, use Spearman or Kendall (option “Coefficient”). If it rises and then falls, correlation does not describe it: fit a curve.", "alternativa": "regresion-polinomial" },
      { "nombre": "Normality of both variables (Pearson’s test and interval)", "como": "Check each variable in “Check the model assumptions”, with it as the response and no treatments: it gives the Shapiro-Wilk test and the quantile plot.", "verificar": "supuestos", "siFalla": "With skewed distributions, use Spearman or Kendall, or transform the variable (logarithm or Box-Cox in Data, “Transform…”).", "alternativa": null },
      { "nombre": "No dominant extreme values", "como": "They show in the scatter plot; in “Simple and multiple linear regression”, Cook’s distance flags the influential points.", "verificar": "regresion-lineal", "siFalla": "Check whether the value is a data-entry error; if it is real, also report Spearman or Kendall, which resist extremes.", "alternativa": null },
      { "nombre": "Independent pairs", "como": "It comes from the sampling: each pair comes from a different unit. It is not tested with the data.", "verificar": null, "siFalla": "If you measured the same plant on several dates or took several plants per plot, the pairs are not independent: average per unit or use a mixed model.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altitud", "tipo": "continuous numeric", "papel": "variable x" },
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "variable y" }
      ],
      "minimo": "Pearson needs at least 3 pairs (4 for the confidence interval). To detect a moderate correlation (r = 0.3) with 80 % power you need about 85 pairs: compute it in “Power and sample size: correlation”.",
      "balance": "Only rows with both variables complete are used; the test table says how many were left out. Since there are no groups, there is no imbalance to correct.",
      "notaFormato": "One row per unit (farm, plant, plot) and one column per variable; the two values in each row must come from the same unit.",
      "errores": [
        "Correlating treatment means instead of units: with few means the correlation is inflated and its test is not valid.",
        "Mixing in a single cloud different groups (varieties, sites) that by themselves create an apparent correlation.",
        "Measuring one variable over a very narrow range (only high farms): the correlation comes out lower than in the whole population.",
        "Typing zero where the value is missing: leave the cell empty so the row is left out."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look first at the scatter plot: the shape of the cloud, the extreme values and the groups.",
        "Read the coefficient, its sign and the strength stated in the conclusion; with Pearson, also its confidence interval.",
        "Read the p-value and how it was computed (Student’s t, exact or approximate) in the test table.",
        "Compare the three coefficients: if Pearson departs a lot from Spearman and Kendall, the relationship is not linear or some points weigh too much.",
        "With Pearson, r² tells what fraction of the variation the two variables share."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Coffee yield increased with farm altitude (Pearson’s r = 0.52, 95 % CI: 0.25 to 0.72; t(38) = 3.75, p < 0.001; n = 40); altitude and yield shared 27 % of their variation.”",
      "guias": ["r", "rho", "tau", "ic", "p", "r2"]
    },
    "limitaciones": [
      "Correlation neither proves cause nor predicts: to estimate how much y changes per unit of x, use linear regression.",
      "If a third variable affects both (altitude affects temperature and yield), compute the partial correlation.",
      "With more than two variables, the correlation matrix gives every pair with adjusted p-values.",
      "Pearson measures linear relationships and Spearman or Kendall, monotonic ones: a U-shaped relationship can give a correlation close to zero."
    ],
    "referencias": [
      "Pearson, K. (1895). Notes on regression and inheritance in the case of two parents. Proceedings of the Royal Society of London, 58, 240–242.",
      "Spearman, C. (1904). The proof and measurement of association between two things. The American Journal of Psychology, 15(1), 72–101.",
      "Kendall, M. G. (1938). A new measure of rank correlation. Biometrika, 30(1/2), 81–93.",
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Prentice Hall."
    ]
  }
});
