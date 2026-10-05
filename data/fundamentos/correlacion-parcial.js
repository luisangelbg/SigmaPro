SP_FICHA({
  "id": "correlacion-parcial",
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["correlacion", "matriz-correlacion", "regresion-lineal", "ancova", "modelo-lineal"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "x": "temperatura", "y": "rendimiento", "controles": ["altitud"] }, "opciones": {} },
  "formato": {
    "largo": [["finca", "altitud", "temperatura", "rendimiento"], ["F01", "1342", "23.2", "17.6"], ["F02", "1053", "25.3", "15.4"], ["F03", "1048", "24.6", "4"], ["F04", "1442", "22.8", "14.4"], ["F05", "1629", "21.1", "20.5"], ["F06", "1557", "22.2", "19.1"], ["F07", "1430", "22.5", "10.1"], ["F08", "1682", "20.6", "18.3"]],
    "ancho": null
  },
  "es": {
    "alias": ["Correlación parcial", "Correlación semiparcial", "Correlación parcial de Pearson", "Correlación parcial de Spearman"],
    "paraQue": "Mide la relación entre dos variables después de quitarles el efecto de otras que influyen en ambas.",
    "preguntas": [
      "¿Sigue relacionada la temperatura con el rendimiento de café cuando se descuenta la altitud de la finca?",
      "¿Se asocia el contenido de proteína del grano con el rendimiento una vez controlada la fecha de siembra?",
      "¿Cuánto explica la lluvia del rendimiento, por sí sola, además de lo que ya explica la fertilidad del suelo?"
    ],
    "teoria": [
      "Dos variables pueden estar correlacionadas solo porque una tercera las mueve a las dos. En las fincas de café, la temperatura baja con la altitud y el rendimiento sube con ella: la temperatura y el rendimiento salen correlacionados aunque la temperatura no tenga un efecto propio. La correlación parcial separa ese efecto común.",
      "SigmaPro la calcula con residuos. Primero ajusta una regresión lineal de x sobre las variables de control y otra de y sobre los mismos controles; los residuos de cada una son la parte de x y de y que los controles no explican. La correlación parcial es la correlación de Pearson entre esos dos residuos. La semiparcial quita los controles solo de una variable: la correlación de y con los residuos de x mide lo que x aporta por sí sola, y su cuadrado es el aumento de R² que se gana al añadir x a una regresión de y que ya tiene los controles. La app da las dos semiparciales (quitando los controles de x o de y).",
      "Cada coeficiente se prueba con una t de n − 2 − k grados de libertad, donde k es el número de controles, como el paquete ppcor de R; la correlación simple, con n − 2. Con la opción Spearman, todo se hace sobre los rangos de cada variable, lo que sirve para relaciones monótonas y datos con valores extremos. La conclusión compara la simple con la parcial y dice si los controles explican parte de la relación o si la ocultaban."
    ],
    "modelo": {
      "tex": "r_{xy \\cdot Z} = \\mathrm{cor}(e_{x \\mid Z}, e_{y \\mid Z}), \\quad sr_{y(x)} = \\mathrm{cor}(y, e_{x \\mid Z}), \\quad t = r \\sqrt{\\frac{n - 2 - k}{1 - r^2}}",
      "terminos": [
        ["r_{xy \\cdot Z}", "la correlación parcial de x y y con los controles Z constantes"],
        ["e_{x \\mid Z}, e_{y \\mid Z}", "los residuos de la regresión lineal (con intercepto) de x y de y sobre los controles"],
        ["sr_{y(x)}", "la correlación semiparcial: y con la parte de x que no explican los controles"],
        ["n, k", "el número de filas completas y el número de controles"],
        ["t", "el estadístico de la prueba, con n − 2 − k grados de libertad"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_{xy \\cdot Z} = 0", "h1": "\\rho_{xy \\cdot Z} \\ne 0", "texto": "Con los controles constantes, x y y no se relacionan. Prueba t bilateral con n − 2 − k gl; la misma prueba se aplica a cada semiparcial, y la simple usa n − 2 gl." }
    ],
    "supuestos": [
      { "nombre": "Relaciones lineales con los controles", "como": "Este análisis no tiene semáforo: la gráfica de variable agregada (residuos de x contra residuos de y) debe mostrar una nube sin curvatura. «Regresión lineal simple y múltiple» de y sobre x y los controles revisa la forma con la gráfica de residuos y la prueba RESET.", "verificar": "regresion-lineal", "siFalla": "Si alguna relación es curva pero monótona, usa la opción Spearman; si no, transforma la variable o añade términos curvos en un modelo lineal.", "alternativa": "modelo-lineal" },
      { "nombre": "Normalidad de los residuos (prueba t)", "como": "Revisa los residuos de la regresión lineal de y sobre x y los controles (Shapiro-Wilk y gráfico de cuantiles en «Regresión lineal simple y múltiple»).", "verificar": "regresion-lineal", "siFalla": "Con residuos sesgados o valores extremos, usa la opción Spearman, que trabaja con rangos.", "alternativa": null },
      { "nombre": "Los controles no determinan a x ni a y", "como": "SigmaPro avisa si una variable es combinación lineal de los controles; el VIF de la regresión lineal mide colinealidades fuertes.", "verificar": "regresion-lineal", "siFalla": "Quita los controles redundantes: si un control casi copia a x, la parcial se vuelve inestable.", "alternativa": null },
      { "nombre": "Filas independientes", "como": "Lo da el muestreo: cada fila es una unidad distinta. No se prueba con los datos.", "verificar": null, "siFalla": "Con varias filas de la misma unidad, promédialas o usa un modelo mixto.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "temperatura", "tipo": "numérica continua", "papel": "variable x" },
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "variable y" },
        { "nombre": "altitud", "tipo": "numérica continua (de 1 a 10 variables)", "papel": "controles" }
      ],
      "minimo": "SigmaPro pide más filas completas que controles más dos (n − 2 − k ≥ 1). Para una prueba útil, 20 o más unidades y bastantes más que controles.",
      "balance": "Usa solo las filas completas en x, y y todos los controles; el cuadro dice cuántas quedaron fuera.",
      "notaFormato": "Una fila por unidad (finca, planta, parcela) y una columna por variable: x, y y cada control.",
      "errores": [
        "Usar como control una variable que es consecuencia de x (por ejemplo, controlar el número de granos al estudiar la fertilización y el rendimiento): se quita parte del efecto que interesa.",
        "Poner como controles factores codificados con números (1, 2, 3 para tres variedades): se tratan como una variable continua.",
        "Controlar muchas variables con pocas unidades: los grados de libertad se agotan y la prueba pierde potencia.",
        "Leer la parcial como prueba de causa: solo descuenta los controles que pusiste, no los que no mediste."
      ]
    },
    "interpretacion": {
      "orden": [
        "Compara en el cuadro la correlación simple con la parcial: la conclusión dice si los controles explican parte de la relación o si la ocultaban.",
        "Lee la parcial con su t, sus grados de libertad y su valor p.",
        "Lee las semiparciales: su cuadrado es lo que cada variable aporta por sí sola a la otra, además de los controles.",
        "Mira la gráfica de variable agregada para ver si la relación que queda es lineal y si algún punto la domina."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La temperatura se correlacionó negativamente con el rendimiento (r = −0.50, p = 0.001), pero al controlar la altitud de la finca la correlación parcial no fue significativa (r parcial = 0.15, t(37) = 0.93, p = 0.36): la relación se debió a que ambas variables dependen de la altitud».",
      "guias": ["r", "rho", "t", "gl", "p", "r2"]
    },
    "limitaciones": [
      "Solo descuenta relaciones lineales (o monótonas con Spearman) con los controles; Kendall no está disponible aquí.",
      "Los controles deben ser numéricos; para estudiar la relación de y con una variable numérica dentro de los niveles de un factor (variedad, bloque), usa el análisis de covarianza o un modelo lineal.",
      "La prueba es siempre bilateral.",
      "Si lo que buscas es predecir y o estimar el efecto de x en sus unidades, usa la regresión lineal múltiple: la t de x en esa regresión equivale a la de la parcial."
    ],
    "referencias": [
      "Kim, S. (2015). ppcor: An R package for a fast calculation to semi-partial correlation coefficients. Communications for Statistical Applications and Methods, 22(6), 665–674.",
      "Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). Applied multiple regression/correlation analysis for the behavioral sciences (3rd ed.). Lawrence Erlbaum Associates.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman.",
      "Legendre, P., & Legendre, L. (2012). Numerical ecology (3rd English ed.). Elsevier."
    ]
  },
  "en": {
    "alias": ["Partial correlation", "Semipartial correlation", "Pearson partial correlation", "Spearman partial correlation"],
    "paraQue": "Measures the relationship between two variables after removing the effect of others that influence both.",
    "preguntas": [
      "Is temperature still related to coffee yield once farm altitude is accounted for?",
      "Is grain protein content associated with yield once sowing date is controlled?",
      "How much of yield does rainfall explain by itself, beyond what soil fertility already explains?"
    ],
    "teoria": [
      "Two variables can be correlated only because a third one moves both. On coffee farms, temperature drops with altitude and yield rises with it: temperature and yield come out correlated even if temperature has no effect of its own. The partial correlation separates that common effect.",
      "SigmaPro computes it with residuals. First it fits a linear regression of x on the control variables and another of y on the same controls; the residuals of each are the part of x and of y that the controls do not explain. The partial correlation is the Pearson correlation between those two sets of residuals. The semipartial removes the controls from only one variable: the correlation of y with the residuals of x measures what x contributes by itself, and its square is the increase in R² gained by adding x to a regression of y that already has the controls. The app gives both semipartials (removing the controls from x or from y).",
      "Each coefficient is tested with a t with n − 2 − k degrees of freedom, where k is the number of controls, as in the R package ppcor; the simple correlation, with n − 2. With the Spearman option, everything is done on the ranks of each variable, which suits monotonic relationships and data with extreme values. The conclusion compares the simple and the partial correlations and says whether the controls explain part of the relationship or were hiding it."
    ],
    "modelo": {
      "tex": "r_{xy \\cdot Z} = \\mathrm{cor}(e_{x \\mid Z}, e_{y \\mid Z}), \\quad sr_{y(x)} = \\mathrm{cor}(y, e_{x \\mid Z}), \\quad t = r \\sqrt{\\frac{n - 2 - k}{1 - r^2}}",
      "terminos": [
        ["r_{xy \\cdot Z}", "the partial correlation of x and y holding the controls Z constant"],
        ["e_{x \\mid Z}, e_{y \\mid Z}", "the residuals of the linear regression (with intercept) of x and of y on the controls"],
        ["sr_{y(x)}", "the semipartial correlation: y with the part of x not explained by the controls"],
        ["n, k", "the number of complete rows and the number of controls"],
        ["t", "the test statistic, with n − 2 − k degrees of freedom"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_{xy \\cdot Z} = 0", "h1": "\\rho_{xy \\cdot Z} \\ne 0", "texto": "With the controls held constant, x and y are not related. Two-sided t test with n − 2 − k df; the same test applies to each semipartial, and the simple correlation uses n − 2 df." }
    ],
    "supuestos": [
      { "nombre": "Linear relationships with the controls", "como": "This analysis has no assumptions checklist: the added-variable plot (residuals of x against residuals of y) should show a cloud with no curvature. “Simple and multiple linear regression” of y on x and the controls checks the shape with the residual plot and the RESET test.", "verificar": "regresion-lineal", "siFalla": "If a relationship is curved but monotonic, use the Spearman option; otherwise, transform the variable or add curved terms in a linear model.", "alternativa": "modelo-lineal" },
      { "nombre": "Normality of the residuals (t test)", "como": "Check the residuals of the linear regression of y on x and the controls (Shapiro-Wilk and quantile plot in “Simple and multiple linear regression”).", "verificar": "regresion-lineal", "siFalla": "With skewed residuals or extreme values, use the Spearman option, which works with ranks.", "alternativa": null },
      { "nombre": "The controls do not determine x or y", "como": "SigmaPro warns if a variable is a linear combination of the controls; the VIF of the linear regression measures strong collinearities.", "verificar": "regresion-lineal", "siFalla": "Remove redundant controls: if a control nearly copies x, the partial correlation becomes unstable.", "alternativa": null },
      { "nombre": "Independent rows", "como": "It comes from the sampling: each row is a different unit. It is not tested with the data.", "verificar": null, "siFalla": "With several rows from the same unit, average them or use a mixed model.", "alternativa": "modelo-mixto" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "temperatura", "tipo": "continuous numeric", "papel": "variable x" },
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "variable y" },
        { "nombre": "altitud", "tipo": "continuous numeric (1 to 10 variables)", "papel": "controls" }
      ],
      "minimo": "SigmaPro requires more complete rows than controls plus two (n − 2 − k ≥ 1). For a useful test, 20 or more units and many more than controls.",
      "balance": "Only rows complete in x, y and every control are used; the table says how many were left out.",
      "notaFormato": "One row per unit (farm, plant, plot) and one column per variable: x, y and each control.",
      "errores": [
        "Using as a control a variable that is a consequence of x (for example, controlling for kernel number when studying fertilization and yield): part of the effect of interest is removed.",
        "Entering as controls factors coded with numbers (1, 2, 3 for three varieties): they are treated as a continuous variable.",
        "Controlling for many variables with few units: the degrees of freedom run out and the test loses power.",
        "Reading the partial correlation as proof of cause: it only removes the controls you included, not the ones you did not measure."
      ]
    },
    "interpretacion": {
      "orden": [
        "Compare the simple and the partial correlations in the table: the conclusion says whether the controls explain part of the relationship or were hiding it.",
        "Read the partial correlation with its t, degrees of freedom and p-value.",
        "Read the semipartials: their square is what each variable contributes by itself to the other, beyond the controls.",
        "Look at the added-variable plot to see whether the remaining relationship is linear and whether a point dominates it."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Temperature was negatively correlated with yield (r = −0.50, p = 0.001), but after controlling for farm altitude the partial correlation was not significant (partial r = 0.15, t(37) = 0.93, p = 0.36): the relationship arose because both variables depend on altitude.”",
      "guias": ["r", "rho", "t", "gl", "p", "r2"]
    },
    "limitaciones": [
      "It only removes linear (or, with Spearman, monotonic) relationships with the controls; Kendall is not available here.",
      "The controls must be numeric; to study the relationship of y with a numeric variable within the levels of a factor (variety, block), use analysis of covariance or a linear model.",
      "The test is always two-sided.",
      "If you want to predict y or estimate the effect of x in its own units, use multiple linear regression: the t of x in that regression is equivalent to that of the partial correlation."
    ],
    "referencias": [
      "Kim, S. (2015). ppcor: An R package for a fast calculation to semi-partial correlation coefficients. Communications for Statistical Applications and Methods, 22(6), 665–674.",
      "Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). Applied multiple regression/correlation analysis for the behavioral sciences (3rd ed.). Lawrence Erlbaum Associates.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman.",
      "Legendre, P., & Legendre, L. (2012). Numerical ecology (3rd English ed.). Elsevier."
    ]
  }
});
