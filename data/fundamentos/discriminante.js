SP_FICHA({
  "id": "discriminante",
  "familia": "multivariado",
  "respuesta": "multivariada",
  "estructura": "k-grupos",
  "disenos": ["ninguno"],
  "relacionados": ["manova", "matriz-correlacion", "glm-proporciones", "supuestos", "descriptivos"],
  "ejemplo": { "conjunto": "chile-frutos", "entradas": { "variables": ["largo_cm", "ancho_cm", "peso_g", "pared_mm"], "grupo": "variedad" }, "opciones": {} },
  "formato": {
    "largo": [["variedad", "bloque", "fruto", "largo_cm", "ancho_cm", "peso_g", "pared_mm"], ["Ancho", "1", "1", "10.9", "5.72", "47.6", "2.97"], ["Ancho", "1", "2", "12.05", "5.52", "57", "3.64"], ["Ancho", "1", "3", "12.76", "6.65", "61.7", "3.73"], ["Ancho", "1", "4", "11.83", "6.33", "60.6", "3.56"], ["Ancho", "1", "5", "11.62", "6.48", "58.4", "3.56"], ["Ancho", "2", "1", "10.72", "6.12", "58.4", "3.54"], ["Ancho", "2", "2", "11.17", "6.03", "56.1", "3.88"], ["Ancho", "2", "3", "12.02", "6.1", "62.3", "3.75"]],
    "ancho": null
  },
  "es": {
    "alias": ["Análisis discriminante lineal", "Discriminante de Fisher", "LDA", "Funciones discriminantes canónicas"],
    "paraQue": "Encuentra la combinación de variables que mejor separa grupos conocidos y mide qué tan bien clasifica cada unidad en su grupo.",
    "preguntas": [
      "¿Qué medidas del fruto distinguen mejor cuatro variedades de chile y con qué acierto se clasifica un fruto por sus medidas?",
      "¿Se puede identificar el origen de una muestra de semilla de maíz nativo por sus caracteres de grano?",
      "¿Qué variables del suelo separan las parcelas de alto, medio y bajo rendimiento?"
    ],
    "teoria": [
      "El análisis discriminante lineal busca la combinación de variables que mejor separa grupos ya conocidos: variedades por las medidas de su fruto, orígenes de una semilla por sus caracteres. La primera función discriminante es la combinación lineal de las variables que hace máxima la variación entre las medias de los grupos en relación con la variación dentro de ellos; la segunda hace lo mismo sin correlacionarse con la primera, y así hasta el menor de p y g − 1 funciones (p variables y g grupos).",
      "SigmaPro sigue a MASS::lda de R: escala las funciones para que su varianza dentro de los grupos sea 1 y da la proporción de la traza (cuánto de la separación entre grupos explica cada función), los coeficientes y los centroides de cada grupo. El signo de cada función es arbitrario; la app hace positivo el coeficiente de mayor valor absoluto. Los coeficientes no están estandarizados, así que solo se comparan entre variables de escala parecida.",
      "Para clasificar, cada unidad va al grupo de mayor probabilidad posterior, que combina la distancia de Mahalanobis al centroide del grupo con la probabilidad previa de cada grupo (aquí, su proporción en los datos). Clasificar las mismas unidades con las que se ajustó la función es optimista; por eso la tabla de clasificación usa validación cruzada dejando uno fuera: cada unidad se clasifica con la función calculada sin ella. El semáforo revisa el tamaño del grupo más chico frente al número de variables y la igualdad de las matrices de covarianza con la prueba M de Box."
    ],
    "modelo": {
      "tex": "z = a_1 x_1 + a_2 x_2 + \\cdots + a_p x_p, \\quad \\max_{\\mathbf{a}} \\frac{\\mathbf{a}^{T} B \\mathbf{a}}{\\mathbf{a}^{T} W \\mathbf{a}}, \\quad P(g \\mid \\mathbf{x}) = \\frac{\\pi_g \\exp \\left( -\\frac{1}{2} D_g^2 \\right)}{\\sum_{h} \\pi_h \\exp \\left( -\\frac{1}{2} D_h^2 \\right)}",
      "terminos": [
        ["z", "el puntaje de una unidad en una función discriminante"],
        ["a_1, \\ldots, a_p", "los coeficientes de la función, sin estandarizar y escalados para que z tenga varianza 1 dentro de los grupos"],
        ["B, W", "las matrices de variación entre grupos y dentro de grupos"],
        ["\\pi_g", "la probabilidad previa del grupo g: su proporción en los datos"],
        ["D_g^2", "la distancia de Mahalanobis al cuadrado de la unidad al centroide del grupo g"],
        ["P(g \\mid \\mathbf{x})", "la probabilidad posterior de que la unidad pertenezca al grupo g; se clasifica en el grupo de mayor probabilidad"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Normalidad multivariada dentro de cada grupo", "como": "El semáforo no la prueba; revisa cada variable en «Revisar los supuestos del modelo», con el grupo como tratamiento.", "verificar": "supuestos", "siFalla": "La regla lineal tolera desvíos moderados; transforma las variables muy sesgadas (Datos, «Transformar…») y juzga el resultado por la tabla de validación cruzada.", "alternativa": null },
      { "nombre": "Matrices de covarianza iguales entre grupos", "como": "El semáforo y un cuadro dan la prueba M de Box entre los grupos: verde con p ≥ 0.05, ámbar entre 0.001 y 0.05 y rojo por debajo de 0.001.", "verificar": null, "siFalla": "Con covarianzas distintas, la regla lineal puede clasificar peor los grupos más variables: revisa la tabla de validación cruzada grupo por grupo.", "alternativa": null },
      { "nombre": "Más unidades que variables en cada grupo", "como": "El semáforo se pone en verde si el grupo más chico tiene más unidades que variables.", "verificar": null, "siFalla": "Usa menos variables o mide más unidades por grupo.", "alternativa": null },
      { "nombre": "Variables no redundantes", "como": "SigmaPro se detiene si una variable es combinación lineal de otras; la matriz de correlaciones muestra las que casi se repiten.", "verificar": "matriz-correlacion", "siFalla": "Quita una de cada par de variables casi idénticas (por ejemplo, peso y volumen del fruto).", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, ancho_cm, peso_g, pared_mm", "tipo": "numérica continua (de 2 a 15 variables)", "papel": "variables" },
        { "nombre": "variedad", "tipo": "factor con g niveles", "papel": "grupo" },
        { "nombre": "bloque, fruto", "tipo": "factor e identificador", "papel": "no entran al análisis" }
      ],
      "minimo": "Cada grupo necesita al menos dos unidades y el total, más filas que variables más grupos. Para resultados estables, cada grupo debería tener varias veces más unidades que variables.",
      "balance": "Usa solo las filas completas. Los grupos pueden ser de distinto tamaño, pero las previas son sus proporciones: en los casos dudosos, la regla favorece a los grupos grandes.",
      "notaFormato": "Una fila por individuo (fruto, planta, semilla), una columna por variable medida y una con el grupo al que pertenece.",
      "errores": [
        "Juzgar la clasificación con las mismas unidades del ajuste en lugar de la validación cruzada.",
        "Ordenar la importancia de las variables por sus coeficientes cuando están en escalas distintas (gramos y milímetros).",
        "Usar una variable que define al grupo o se calcula a partir de él.",
        "Incluir variables casi idénticas (peso y volumen): la función se vuelve inestable."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: tamaño de los grupos y M de Box.",
        "Lee en «Funciones discriminantes» la proporción de la traza: cuántas funciones hacen falta para separar los grupos.",
        "Mira la gráfica de las unidades en las dos primeras funciones: qué grupos se separan y cuáles se enciman.",
        "Con los centroides y los coeficientes, interpreta qué variables separan a qué grupos (el signo de cada función es arbitrario).",
        "Lee la tabla de clasificación con validación cruzada: el porcentaje de aciertos de cada grupo es la medida honesta de qué tan bien se distinguen."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La primera función discriminante explicó el 67 % de la separación entre las cuatro variedades y la segunda, el 29 %. Con validación cruzada, el 95 % de los frutos se clasificó en su variedad; los errores se concentraron entre las dos variedades de fruto más grande».",
      "guias": ["chi2", "p", "n"]
    },
    "limitaciones": [
      "No prueba si cada función separa significativamente los grupos; para probar que los grupos difieren en sus medias, usa la MANOVA con el grupo como tratamiento.",
      "La regla es lineal y supone covarianzas iguales; no hay versión cuadrática ni selección de variables por pasos.",
      "Las previas son siempre las proporciones de los grupos en los datos; si en la población los grupos tienen otra frecuencia, las probabilidades de clasificación cambian.",
      "Con dos grupos y predictores mezclados (numéricos y factores), la regresión logística del modelo binomial es una alternativa que no supone normalidad."
    ],
    "referencias": [
      "Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. Annals of Eugenics, 7(2), 179–188.",
      "Lachenbruch, P. A., & Mickey, M. R. (1968). Estimation of error rates in discriminant analysis. Technometrics, 10(1), 1–11.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "Huberty, C. J., & Olejnik, S. (2006). Applied MANOVA and discriminant analysis (2nd ed.). Wiley.",
      "Johnson, R. A., & Wichern, D. W. (2007). Applied multivariate statistical analysis (6th ed.). Pearson Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Linear discriminant analysis", "Fisher’s discriminant", "LDA", "Canonical discriminant functions"],
    "paraQue": "Finds the combination of variables that best separates known groups and measures how well each unit is classified into its group.",
    "preguntas": [
      "Which fruit measurements best distinguish four chili pepper varieties, and how accurately is a fruit classified by its measurements?",
      "Can the origin of a native maize seed sample be identified from its grain traits?",
      "Which soil variables separate the high-, medium- and low-yielding plots?"
    ],
    "teoria": [
      "Linear discriminant analysis looks for the combination of variables that best separates groups that are already known: varieties by the measurements of their fruit, seed origins by their traits. The first discriminant function is the linear combination of the variables that maximizes the variation among the group means relative to the variation within them; the second does the same while uncorrelated with the first, and so on up to the smaller of p and g − 1 functions (p variables and g groups).",
      "SigmaPro follows R’s MASS::lda: it scales the functions so that their within-group variance is 1 and gives the proportion of trace (how much of the separation among groups each function explains), the coefficients and the centroid of each group. The sign of each function is arbitrary; the app makes the coefficient with the largest absolute value positive. The coefficients are not standardized, so they can only be compared among variables on similar scales.",
      "To classify, each unit goes to the group with the highest posterior probability, which combines the Mahalanobis distance to the group centroid with the prior probability of each group (here, its proportion in the data). Classifying the same units used to fit the function is optimistic; that is why the classification table uses leave-one-out cross-validation: each unit is classified with the function computed without it. The assumptions checklist reviews the size of the smallest group against the number of variables and the equality of the covariance matrices with Box’s M test."
    ],
    "modelo": {
      "tex": "z = a_1 x_1 + a_2 x_2 + \\cdots + a_p x_p, \\quad \\max_{\\mathbf{a}} \\frac{\\mathbf{a}^{T} B \\mathbf{a}}{\\mathbf{a}^{T} W \\mathbf{a}}, \\quad P(g \\mid \\mathbf{x}) = \\frac{\\pi_g \\exp \\left( -\\frac{1}{2} D_g^2 \\right)}{\\sum_{h} \\pi_h \\exp \\left( -\\frac{1}{2} D_h^2 \\right)}",
      "terminos": [
        ["z", "the score of a unit on a discriminant function"],
        ["a_1, \\ldots, a_p", "the coefficients of the function, unstandardized and scaled so that z has variance 1 within groups"],
        ["B, W", "the between-group and within-group variation matrices"],
        ["\\pi_g", "the prior probability of group g: its proportion in the data"],
        ["D_g^2", "the squared Mahalanobis distance from the unit to the centroid of group g"],
        ["P(g \\mid \\mathbf{x})", "the posterior probability that the unit belongs to group g; it is classified into the group with the highest probability"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Multivariate normality within each group", "como": "The assumptions checklist does not test it; check each variable in “Check the model assumptions”, with the group as the treatment.", "verificar": "supuestos", "siFalla": "The linear rule tolerates moderate departures; transform strongly skewed variables (Data, “Transform…”) and judge the result by the cross-validation table.", "alternativa": null },
      { "nombre": "Equal covariance matrices among groups", "como": "The assumptions checklist and a table give Box’s M test among the groups: green with p ≥ 0.05, amber between 0.001 and 0.05 and red below 0.001.", "verificar": null, "siFalla": "With different covariances, the linear rule can classify the more variable groups worse: check the cross-validation table group by group.", "alternativa": null },
      { "nombre": "More units than variables in each group", "como": "The assumptions checklist turns green if the smallest group has more units than variables.", "verificar": null, "siFalla": "Use fewer variables or measure more units per group.", "alternativa": null },
      { "nombre": "Non-redundant variables", "como": "SigmaPro stops if a variable is a linear combination of others; the correlation matrix shows the ones that nearly repeat each other.", "verificar": "matriz-correlacion", "siFalla": "Remove one of each pair of nearly identical variables (for example, fruit weight and volume).", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, ancho_cm, peso_g, pared_mm", "tipo": "continuous numeric (2 to 15 variables)", "papel": "variables" },
        { "nombre": "variedad", "tipo": "factor with g levels", "papel": "group" },
        { "nombre": "bloque, fruto", "tipo": "factor and identifier", "papel": "not used in the analysis" }
      ],
      "minimo": "Each group needs at least two units and the total, more rows than variables plus groups. For stable results, each group should have several times more units than variables.",
      "balance": "Only complete rows are used. Groups can have different sizes, but the priors are their proportions: in doubtful cases, the rule favors the large groups.",
      "notaFormato": "One row per individual (fruit, plant, seed), one column per measured variable and one with the group it belongs to.",
      "errores": [
        "Judging the classification with the same units used for fitting instead of cross-validation.",
        "Ranking the importance of the variables by their coefficients when they are on different scales (grams and millimeters).",
        "Using a variable that defines the group or is computed from it.",
        "Including nearly identical variables (weight and volume): the function becomes unstable."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: group size and Box’s M.",
        "Read the proportion of trace in “Discriminant functions”: how many functions are needed to separate the groups.",
        "Look at the plot of the units on the first two functions: which groups separate and which overlap.",
        "With the centroids and the coefficients, interpret which variables separate which groups (the sign of each function is arbitrary).",
        "Read the cross-validated classification table: the percentage of correct classifications in each group is the honest measure of how well they are told apart."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The first discriminant function explained 67 % of the separation among the four varieties and the second, 29 %. With cross-validation, 95 % of the fruits were classified into their variety; the errors were concentrated between the two varieties with the largest fruit.”",
      "guias": ["chi2", "p", "n"]
    },
    "limitaciones": [
      "It does not test whether each function separates the groups significantly; to test that the groups differ in their means, use MANOVA with the group as the treatment.",
      "The rule is linear and assumes equal covariances; there is no quadratic version or stepwise variable selection.",
      "The priors are always the group proportions in the data; if the groups have another frequency in the population, the classification probabilities change.",
      "With two groups and mixed predictors (numeric and factors), logistic regression with the binomial model is an alternative that does not assume normality."
    ],
    "referencias": [
      "Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. Annals of Eugenics, 7(2), 179–188.",
      "Lachenbruch, P. A., & Mickey, M. R. (1968). Estimation of error rates in discriminant analysis. Technometrics, 10(1), 1–11.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "Huberty, C. J., & Olejnik, S. (2006). Applied MANOVA and discriminant analysis (2nd ed.). Wiley.",
      "Johnson, R. A., & Wichern, D. W. (2007). Applied multivariate statistical analysis (6th ed.). Pearson Prentice Hall."
    ]
  }
});
