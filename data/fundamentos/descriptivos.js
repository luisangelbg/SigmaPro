SP_FICHA({
  "id": "descriptivos",
  "familia": "descriptiva",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["ninguno"],
  "relacionados": ["frecuencias", "supuestos", "prueba-t", "kruskal-wallis", "dca", "componentes-varianza"],
  "ejemplo": { "conjunto": "chile-frutos", "entradas": { "variables": ["largo_cm", "peso_g"], "grupos": ["variedad"] }, "opciones": {} },
  "formato": {
    "largo": [["variedad", "bloque", "fruto", "largo_cm", "peso_g"], ["Ancho", "1", "1", "10.9", "47.6"], ["Ancho", "1", "2", "12.05", "57"], ["Ancho", "1", "3", "12.76", "61.7"], ["Ancho", "1", "4", "11.83", "60.6"], ["Ancho", "1", "5", "11.62", "58.4"], ["Ancho", "2", "1", "10.72", "58.4"]],
    "ancho": null
  },
  "es": {
    "alias": ["Estadística descriptiva", "Resumen numérico", "Medidas de tendencia central y de dispersión"],
    "paraQue": "Resume cada variable numérica con su centro, su dispersión, su forma y sus intervalos de confianza, en total o por grupos.",
    "preguntas": [
      "¿Cuánto pesan en promedio los frutos de cada variedad de chile y qué tanto varían dentro de cada una?",
      "¿Está sesgada a la derecha la distribución del número de trips por brote antes de analizarla?",
      "¿Entre qué valores está, con 95 % de confianza, la altura media de las plantas de jitomate a los 60 días?"
    ],
    "teoria": [
      "Antes de cualquier prueba conviene mirar los datos. Los estadísticos descriptivos resumen una variable numérica en pocos números: dónde está su centro (media, mediana, moda, media recortada, geométrica y armónica), qué tanto se dispersa (desviación estándar, varianza, rango, rango intercuartílico y coeficiente de variación) y qué forma tiene (asimetría y curtosis). SigmaPro los calcula para una o varias variables a la vez y, si eliges hasta tres factores de agrupación, para cada combinación de niveles presente en los datos.",
      "La media usa todos los valores y es la base del análisis de varianza, pero un solo valor extremo la mueve; la mediana y la media recortada (por omisión quita 10 % de cada extremo) son resistentes. Los cuartiles se calculan con cualquiera de las nueve definiciones de Hyndman y Fan; la 7, que se usa por omisión, es la de R. La asimetría y la curtosis siguen las tres definiciones de Joanes y Gill; la de uso común vale 0 en una distribución normal y trae su error estándar, de modo que una asimetría mayor que el doble de su error estándar sugiere una distribución sesgada, y la app lo avisa en los grupos con 8 o más valores.",
      "Los intervalos de confianza dicen qué tan precisa es cada estimación: el de la media usa la t de Student; el de la mediana usa los estadísticos de orden y la binomial, sin suponer normalidad, y por eso informa la confianza real que alcanza; los de la varianza y la desviación estándar usan la ji cuadrada y sí suponen normalidad."
    ],
    "modelo": {
      "tex": "\\bar{y} = \\frac{1}{n} \\sum_{i=1}^{n} y_i, \\quad s = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (y_i - \\bar{y})^2}, \\quad CV = 100 \\frac{s}{\\bar{y}}, \\quad \\bar{y} \\pm t_{1-\\alpha/2,\\, n-1} \\frac{s}{\\sqrt{n}}",
      "terminos": [
        ["y_i", "el valor i de la variable en el grupo (sin los faltantes)"],
        ["n", "el número de valores no faltantes del grupo"],
        ["\\bar{y}", "la media aritmética"],
        ["s", "la desviación estándar muestral, con divisor n − 1"],
        ["CV", "el coeficiente de variación, en por ciento"],
        ["t_{1-\\alpha/2,\\, n-1}", "el cuantil de la t de Student para el intervalo de confianza de la media"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Observaciones independientes", "como": "Depende de cómo se tomaron los datos; no se prueba con ellos.", "verificar": null, "siFalla": "Si mediste varias plantas o frutos de la misma parcela, la n del cuadro exagera la precisión: resume primero por parcela (agrupa este cuadro por tratamiento y bloque para obtener la media de cada parcela) o separa la variación entre parcelas y dentro de ellas con componentes de varianza.", "alternativa": "componentes-varianza" },
      { "nombre": "Normalidad (solo para algunos intervalos)", "como": "Con pocos datos y una distribución muy sesgada, el intervalo de la media es solo aproximado; los de la varianza y la desviación estándar suponen normalidad. Mira la asimetría y la curtosis con sus errores estándar; para los residuos de un modelo usa «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Informa la mediana con su intervalo, que no supone normalidad, o transforma la variable en Datos (logaritmo, raíz cuadrada, Box-Cox).", "alternativa": null },
      { "nombre": "Valores positivos para las medias geométrica y armónica", "como": "SigmaPro solo las calcula si todos los valores del grupo son mayores que cero; si no, deja la celda vacía.", "verificar": null, "siFalla": "Usa la media aritmética o la mediana.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, peso_g", "tipo": "numérica continua", "papel": "variables (una o varias)" },
        { "nombre": "variedad", "tipo": "factor con k niveles (hasta 3 factores)", "papel": "agrupar por (opcional)" }
      ],
      "minimo": "No hay un mínimo para calcular, pero con menos de 5 a 8 valores por grupo la desviación estándar, la asimetría y la curtosis son muy inestables; la asimetría pide al menos 3 valores y la curtosis al menos 4.",
      "balance": "Los faltantes de cada variable se cuentan y se excluyen grupo por grupo, sin borrar la fila para las demás variables; las filas sin nivel en algún factor de agrupación quedan fuera y la app dice cuántas. Los grupos pueden tener tamaños distintos.",
      "notaFormato": "Formato largo: una fila por unidad medida (planta, fruto, parcela), con una columna por variable numérica y una por cada factor de agrupación. Una columna numérica con pocos valores repetidos (por ejemplo, la dosis) también sirve para agrupar.",
      "errores": [
        "Capturar los promedios de cada tratamiento en lugar de los datos de cada unidad: la desviación estándar resultante describe medias, no individuos.",
        "Confundir la desviación estándar (variación entre unidades) con el error estándar (precisión de la media).",
        "Calcular el coeficiente de variación de una variable con valores negativos o con media cercana a cero (temperaturas en °C, diferencias): pierde sentido.",
        "Dejar un código de faltante como 0 o 999 en vez de una celda vacía o NA: entra en los cálculos como un valor real."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee primero la conclusión en palabras: qué grupo tiene la media más alta y cuál la más baja, y si algún grupo tiene una asimetría marcada.",
        "En el cuadro, compara la media con la mediana: si se separan mucho, la distribución está sesgada o hay valores extremos.",
        "Mira la DE y el CV para juzgar la variación dentro de cada grupo, y el EE y el intervalo de la media para juzgar su precisión.",
        "Abre «Más estadísticos en el cuadro» para añadir o quitar columnas (de inicio vienen los faltantes, el intervalo de la mediana, la asimetría y la curtosis; también hay moda, varianza, media recortada, medias geométrica y armónica e intervalos de la varianza y la DE); los percentiles se piden en «Percentiles adicionales».",
        "Si quieres saber si las diferencias entre grupos son reales, pasa al bloque Análisis (prueba t, diseño experimental o Kruskal-Wallis)."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El peso del fruto fue mayor en la variedad Ancho (media de 56.8 g; DE = 4.4 g; IC 95 %: 54.4 a 59.2 g; CV = 7.7 %) y menor en Serrano (media de 8.9 g; DE = 1.6 g); en ambas variedades la media y la mediana casi coincidieron, sin asimetría importante».",
      "guias": ["media", "mediana", "de", "ee", "cv", "ic", "cuartil"]
    },
    "limitaciones": [
      "Describe la muestra pero no prueba diferencias: para comparar grupos usa la prueba t, un diseño experimental o Kruskal-Wallis.",
      "Para variables categóricas (variedad, clase de daño) usa las tablas de frecuencias; para éxitos sobre ensayos, las proporciones con su intervalo.",
      "Con submuestras (varias plantas por parcela) la n y el intervalo de la media tratan cada planta como independiente; resume por parcela o separa la variación con componentes de varianza."
    ],
    "referencias": [
      "Hyndman, R. J., & Fan, Y. (1996). Sample quantiles in statistical packages. The American Statistician, 50(4), 361–365.",
      "Joanes, D. N., & Gill, C. A. (1998). Comparing measures of sample skewness and kurtosis. Journal of the Royal Statistical Society: Series D (The Statistician), 47(1), 183–189.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  },
  "en": {
    "alias": ["Descriptive statistics", "Numerical summary", "Measures of central tendency and spread"],
    "paraQue": "Summarizes each numeric variable by its center, spread, shape and confidence intervals, overall or by groups.",
    "preguntas": [
      "How much do the fruits of each chili pepper variety weigh on average, and how much do they vary within each one?",
      "Is the distribution of the number of thrips per shoot skewed to the right before you analyze it?",
      "Between which values does the mean height of tomato plants at 60 days lie, with 95% confidence?"
    ],
    "teoria": [
      "Before any test, look at the data. Descriptive statistics summarize a numeric variable in a few numbers: where its center is (mean, median, mode, trimmed mean, geometric and harmonic means), how spread out it is (standard deviation, variance, range, interquartile range and coefficient of variation) and what shape it has (skewness and kurtosis). SigmaPro computes them for one or several variables at once and, if you choose up to three grouping factors, for each combination of levels present in the data.",
      "The mean uses every value and is the basis of the analysis of variance, but a single extreme value moves it; the median and the trimmed mean (by default it removes 10% from each end) are resistant. Quartiles can follow any of the nine definitions of Hyndman and Fan; type 7, the default, is the one R uses. Skewness and kurtosis follow the three definitions of Joanes and Gill; the common one is 0 for a normal distribution and comes with its standard error, so a skewness larger than twice its standard error suggests a skewed distribution, and the app flags it in groups with 8 or more values.",
      "Confidence intervals tell how precise each estimate is: the interval for the mean uses Student's t; the interval for the median uses order statistics and the binomial distribution, without assuming normality, so it reports the actual confidence it reaches; the intervals for the variance and the standard deviation use the chi-square distribution and do assume normality."
    ],
    "modelo": {
      "tex": "\\bar{y} = \\frac{1}{n} \\sum_{i=1}^{n} y_i, \\quad s = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (y_i - \\bar{y})^2}, \\quad CV = 100 \\frac{s}{\\bar{y}}, \\quad \\bar{y} \\pm t_{1-\\alpha/2,\\, n-1} \\frac{s}{\\sqrt{n}}",
      "terminos": [
        ["y_i", "value i of the variable in the group (missing values excluded)"],
        ["n", "the number of non-missing values in the group"],
        ["\\bar{y}", "the arithmetic mean"],
        ["s", "the sample standard deviation, with divisor n − 1"],
        ["CV", "the coefficient of variation, in percent"],
        ["t_{1-\\alpha/2,\\, n-1}", "the Student's t quantile for the confidence interval of the mean"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Independent observations", "como": "It depends on how the data were collected; it is not tested with them.", "verificar": null, "siFalla": "If you measured several plants or fruits from the same plot, the n in the table overstates the precision: summarize by plot first (group this table by treatment and block to get the mean of each plot) or separate the variation between and within plots with variance components.", "alternativa": "componentes-varianza" },
      { "nombre": "Normality (only for some intervals)", "como": "With few data and a strongly skewed distribution, the interval for the mean is only approximate; the intervals for the variance and the standard deviation assume normality. Look at skewness and kurtosis with their standard errors; for the residuals of a model use “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "Report the median with its interval, which does not assume normality, or transform the variable in Data (logarithm, square root, Box-Cox).", "alternativa": null },
      { "nombre": "Positive values for the geometric and harmonic means", "como": "SigmaPro computes them only if every value in the group is greater than zero; otherwise it leaves the cell empty.", "verificar": null, "siFalla": "Use the arithmetic mean or the median.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "largo_cm, peso_g", "tipo": "continuous numeric", "papel": "variables (one or several)" },
        { "nombre": "variedad", "tipo": "factor with k levels (up to 3 factors)", "papel": "group by (optional)" }
      ],
      "minimo": "There is no minimum to compute, but with fewer than 5 to 8 values per group the standard deviation, skewness and kurtosis are very unstable; skewness needs at least 3 values and kurtosis at least 4.",
      "balance": "Missing values of each variable are counted and excluded group by group, without dropping the row for the other variables; rows with no level in a grouping factor are left out and the app reports how many. Groups may have different sizes.",
      "notaFormato": "Long format: one row per measured unit (plant, fruit, plot), with one column per numeric variable and one per grouping factor. A numeric column with few repeated values (for example, the rate) can also be used to group.",
      "errores": [
        "Entering the mean of each treatment instead of the data of each unit: the resulting standard deviation describes means, not individuals.",
        "Confusing the standard deviation (variation among units) with the standard error (precision of the mean).",
        "Computing the coefficient of variation of a variable with negative values or a mean close to zero (temperatures in °C, differences): it becomes meaningless.",
        "Leaving a missing-value code such as 0 or 999 instead of an empty cell or NA: it enters the calculations as a real value."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion in words first: which group has the highest mean and which the lowest, and whether any group is clearly skewed.",
        "In the table, compare the mean with the median: if they are far apart, the distribution is skewed or has extreme values.",
        "Look at the SD and the CV to judge the variation within each group, and at the SE and the interval for the mean to judge its precision.",
        "Open “More statistics in the table” to add or remove columns (missing values, the interval for the median, skewness and kurtosis are on at first; there are also the mode, variance, trimmed mean, geometric and harmonic means and the intervals for the variance and the SD); percentiles are requested in “Additional percentiles”.",
        "If you want to know whether the differences among groups are real, go to the Analysis block (t test, experimental design or Kruskal-Wallis)."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Fruit weight was highest in the Ancho variety (mean 56.8 g; SD = 4.4 g; 95% CI: 54.4 to 59.2 g; CV = 7.7%) and lowest in Serrano (mean 8.9 g; SD = 1.6 g); in both varieties the mean and the median nearly matched, with no important skewness.”",
      "guias": ["media", "mediana", "de", "ee", "cv", "ic", "cuartil"]
    },
    "limitaciones": [
      "It describes the sample but does not test differences: to compare groups use the t test, an experimental design or Kruskal-Wallis.",
      "For categorical variables (variety, damage class) use frequency tables; for successes out of trials, proportions with their interval.",
      "With subsamples (several plants per plot) the n and the interval for the mean treat each plant as independent; summarize by plot or separate the variation with variance components."
    ],
    "referencias": [
      "Hyndman, R. J., & Fan, Y. (1996). Sample quantiles in statistical packages. The American Statistician, 50(4), 361–365.",
      "Joanes, D. N., & Gill, C. A. (1998). Comparing measures of sample skewness and kurtosis. Journal of the Royal Statistical Society: Series D (The Statistician), 47(1), 183–189.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  }
});
