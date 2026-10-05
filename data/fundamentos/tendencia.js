SP_FICHA({
  "id": "tendencia",
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": ["ninguno"],
  "relacionados": ["regresion-lineal", "correlacion", "descomposicion", "autocorrelacion", "arima"],
  "ejemplo": { "conjunto": "estacion-mensual", "entradas": { "respuesta": "temperatura", "tiempo": "periodo" }, "opciones": { "nivel": 0.95 } },
  "formato": {
    "largo": [["periodo", "anio", "mes", "temperatura"], ["1", "2017", "1", "13.8"], ["2", "2017", "2", "15.5"], ["3", "2017", "3", "18.4"], ["4", "2017", "4", "19.4"], ["5", "2017", "5", "20.5"], ["6", "2017", "6", "21.8"], ["7", "2017", "7", "20.7"], ["8", "2017", "8", "19.2"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba de Mann-Kendall", "Pendiente de Sen", "Estimador de Theil-Sen", "Prueba de tendencia no paramétrica"],
    "paraQue": "Prueba si una variable medida en el tiempo tiende a subir o a bajar, sin suponer normalidad ni una recta, y estima cuánto cambia por paso de tiempo.",
    "preguntas": [
      "¿Aumentó la temperatura media de la estación entre 2017 y 2024?",
      "¿Bajó el rendimiento de maíz de temporal de un municipio en los últimos 30 años, y a qué ritmo?",
      "¿Crece año con año la incidencia de roya registrada en un cafetal?"
    ],
    "teoria": [
      "La prueba de Mann-Kendall compara cada observación con todas las posteriores y cuenta cuántas veces el valor posterior es mayor (+1) y cuántas es menor (−1). La suma S es grande y positiva si la serie tiende a subir, grande y negativa si tiende a bajar, y cercana a cero si no hay tendencia. No supone normalidad ni que el cambio sea lineal: basta con que sea monótono, es decir, que en general vaya en una sola dirección. Por eso resiste valores extremos y datos asimétricos, como la lluvia o los conteos de plagas.",
      "Si no hay tendencia, S tiene media cero y una varianza conocida, que SigmaPro corrige por los valores empatados; con la corrección de continuidad se obtiene un z que se compara con la normal estándar en una prueba bilateral. El estadístico τ, que es S dividido entre el número de pares (corregido por los empates), es la correlación de Kendall entre la variable y el tiempo, y va de −1 a 1.",
      "La magnitud se estima con la pendiente de Sen: la mediana de las pendientes entre todos los pares de observaciones. Como es una mediana, un año atípico casi no la mueve. Su intervalo de confianza sale de los rangos de esas pendientes ordenadas. La pendiente está en unidades de la variable por paso de la serie (por mes o por año) y se calcula con la posición de cada observación, así que supone pasos de tiempo iguales. Las observaciones faltantes se omiten."
    ],
    "modelo": {
      "tex": "S = \\sum_{i < j} \\mathrm{sgn}(y_j - y_i), \\quad z = \\frac{S - \\mathrm{sgn}(S)}{\\sqrt{\\mathrm{Var}(S)}}, \\quad \\hat{\\beta} = \\mathrm{mediana} \\left( \\frac{y_j - y_i}{j - i} \\right)",
      "terminos": [
        ["S", "el estadístico de Mann-Kendall: los pares que suben menos los que bajan"],
        ["y_i, y_j", "las observaciones en las posiciones i y j de la serie (i antes que j)"],
        ["\\mathrm{Var}(S)", "la varianza de S sin tendencia: n(n − 1)(2n + 5)/18, menos la corrección por empates"],
        ["z", "S estandarizado con la corrección de continuidad; se compara con la normal estándar"],
        ["\\hat{\\beta}", "la pendiente de Sen, en unidades de la variable por paso de la serie"]
      ]
    },
    "hipotesis": [
      { "h0": "\\text{sin tendencia monótona}", "h1": "\\text{tendencia creciente o decreciente}", "texto": "Las observaciones no tienden a subir ni a bajar con el tiempo (son independientes y con la misma distribución). Prueba bilateral con z; τ de Kendall da el signo y la fuerza de la tendencia." }
    ],
    "supuestos": [
      { "nombre": "Independencia entre observaciones sucesivas", "como": "La prueba no la revisa; la autocorrelación de la serie (Ljung-Box) sí.", "verificar": "autocorrelacion", "siFalla": "Con autocorrelación positiva, Mann-Kendall encuentra tendencias que no existen: resume la serie a una escala con menos dependencia (la media de cada año) y vuelve a probar.", "alternativa": null },
      { "nombre": "Sin ciclo estacional (o quitado)", "como": "Con datos mensuales o semanales, mira el ciclo en la descomposición o un pico en el rezago 12 de la ACF.", "verificar": "descomposicion", "siFalla": "El ciclo anual infla la variación y la dependencia: prueba la tendencia de cada mes por separado (Filtrar filas en Datos) o la de las medias anuales.", "alternativa": null },
      { "nombre": "Tendencia monótona", "como": "Mira la gráfica de la serie con la recta de Sen: la prueba detecta cambios en una sola dirección.", "verificar": null, "siFalla": "Si la serie sube y luego baja, Mann-Kendall puede no detectar nada: describe la forma con una regresión polinomial sobre el tiempo.", "alternativa": "regresion-polinomial" },
      { "nombre": "Pasos de tiempo iguales", "como": "La pendiente de Sen usa la posición en la serie (1, 2, 3…), no el valor de la columna del tiempo; no se revisa.", "verificar": null, "siFalla": "Si faltan años o las fechas no son regulares, la pendiente «por paso» no es por año: usa una regresión lineal con el tiempo real.", "alternativa": "regresion-lineal" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "temperatura", "tipo": "numérica continua (también conteos o proporciones)", "papel": "variable medida en el tiempo" },
        { "nombre": "periodo", "tipo": "numérica (orden del tiempo)", "papel": "tiempo, para ordenar la serie (opcional)" }
      ],
      "minimo": "La app corre desde 3 observaciones, pero con menos de 10 la prueba casi nunca detecta una tendencia. Admite hasta 3000 observaciones, porque compara todos los pares.",
      "balance": "Los faltantes se omiten y la serie se cierra sobre el hueco, así que la pendiente «por paso» se distorsiona si faltan muchos. Cada tiempo debe aparecer una sola vez.",
      "notaFormato": "Formato largo: una fila por tiempo, con la columna del tiempo y la de la variable. Con varias parcelas o estaciones, analiza cada serie por separado o su promedio por año.",
      "errores": [
        "Probar una serie mensual con un ciclo anual marcado como si no lo tuviera: usa las medias anuales o cada mes por separado.",
        "Reportar la pendiente «por paso» como si fuera por año cuando los datos son mensuales: multiplícala por 12.",
        "Meter varias repeticiones del mismo año (varias parcelas): SigmaPro rechaza tiempos repetidos; promedia primero.",
        "Confundir significancia con magnitud: en series largas, una pendiente minúscula puede salir significativa."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee τ, z y p de Mann-Kendall: p < 0.05 indica una tendencia; el signo de S o de τ, su dirección.",
        "Lee la pendiente de Sen y su intervalo: cuánto cambia la variable por paso de la serie; si el intervalo incluye el cero, la magnitud es incierta.",
        "Mira la gráfica de la serie con la recta de Sen para ver si la tendencia es monótona y si hay ciclos.",
        "Convierte la pendiente a una escala útil (por año, por década) para reportarla."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La temperatura media anual aumentó entre 1995 y 2024 (Mann-Kendall τ = 0.41, z = 3.12, p = 0.002); la pendiente de Sen fue de 0.03 °C por año (IC 95 %: 0.01 a 0.05), unos 0.3 °C por década».",
      "guias": ["tau", "z", "p", "ic", "mediana"]
    },
    "limitaciones": [
      "Mann-Kendall supone observaciones independientes y sin ciclo; con datos mensuales o con autocorrelación, prueba las medias anuales o cada mes por separado.",
      "Solo detecta tendencias monótonas; un cambio brusco o una curva en U piden otro análisis (regresión polinomial).",
      "La pendiente de Sen es una recta por paso de la serie: no dice si el cambio se acelera.",
      "Para separar la tendencia del ciclo y ver su forma, usa la descomposición."
    ],
    "referencias": [
      "Mann, H. B. (1945). Nonparametric tests against trend. Econometrica, 13(3), 245–259.",
      "Kendall, M. G. (1975). Rank correlation methods (4th ed.). Griffin.",
      "Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall’s tau. Journal of the American Statistical Association, 63(324), 1379–1389.",
      "Hirsch, R. M., Slack, J. R., & Smith, R. A. (1982). Techniques of trend analysis for monthly water quality data. Water Resources Research, 18(1), 107–121.",
      "Hamed, K. H., & Rao, A. R. (1998). A modified Mann-Kendall trend test for autocorrelated data. Journal of Hydrology, 204(1–4), 182–196."
    ]
  },
  "en": {
    "alias": ["Mann-Kendall test", "Sen’s slope", "Theil-Sen estimator", "Nonparametric trend test"],
    "paraQue": "Tests whether a variable measured over time tends to rise or fall, without assuming normality or a straight line, and estimates how much it changes per time step.",
    "preguntas": [
      "Did the mean temperature at the station increase between 2017 and 2024?",
      "Did rainfed maize yield in a municipality decline over the last 30 years, and at what rate?",
      "Does the coffee rust incidence recorded in a plantation grow from year to year?"
    ],
    "teoria": [
      "The Mann-Kendall test compares each observation with all later ones and counts how many times the later value is larger (+1) and how many times it is smaller (−1). The sum S is large and positive if the series tends to rise, large and negative if it tends to fall, and close to zero if there is no trend. It assumes neither normality nor a linear change: it only requires the change to be monotonic, that is, to go in one direction overall. That is why it resists extreme values and skewed data, such as rainfall or pest counts.",
      "If there is no trend, S has mean zero and a known variance, which SigmaPro corrects for tied values; with the continuity correction it yields a z that is compared with the standard normal in a two-sided test. The statistic τ, which is S divided by the number of pairs (corrected for ties), is Kendall’s correlation between the variable and time, and ranges from −1 to 1.",
      "The magnitude is estimated with Sen’s slope: the median of the slopes between all pairs of observations. Being a median, an atypical year barely moves it. Its confidence interval comes from the ranks of those sorted slopes. The slope is in units of the variable per step of the series (per month or per year) and is computed from the position of each observation, so it assumes equal time steps. Missing observations are omitted."
    ],
    "modelo": {
      "tex": "S = \\sum_{i < j} \\mathrm{sgn}(y_j - y_i), \\quad z = \\frac{S - \\mathrm{sgn}(S)}{\\sqrt{\\mathrm{Var}(S)}}, \\quad \\hat{\\beta} = \\mathrm{median} \\left( \\frac{y_j - y_i}{j - i} \\right)",
      "terminos": [
        ["S", "the Mann-Kendall statistic: the pairs that rise minus those that fall"],
        ["y_i, y_j", "the observations at positions i and j of the series (i before j)"],
        ["\\mathrm{Var}(S)", "the variance of S with no trend: n(n − 1)(2n + 5)/18, minus the correction for ties"],
        ["z", "S standardized with the continuity correction; compared with the standard normal"],
        ["\\hat{\\beta}", "Sen’s slope, in units of the variable per step of the series"]
      ]
    },
    "hipotesis": [
      { "h0": "\\text{no monotonic trend}", "h1": "\\text{increasing or decreasing trend}", "texto": "The observations do not tend to rise or fall over time (they are independent and identically distributed). Two-sided test with z; Kendall’s τ gives the sign and strength of the trend." }
    ],
    "supuestos": [
      { "nombre": "Independence between successive observations", "como": "The test does not check it; the autocorrelation of the series (Ljung-Box) does.", "verificar": "autocorrelacion", "siFalla": "With positive autocorrelation, Mann-Kendall finds trends that do not exist: summarize the series on a scale with less dependence (the mean of each year) and test again.", "alternativa": null },
      { "nombre": "No seasonal cycle (or removed)", "como": "With monthly or weekly data, look at the cycle in the decomposition or at a spike at lag 12 of the ACF.", "verificar": "descomposicion", "siFalla": "The annual cycle inflates variation and dependence: test the trend of each month separately (Filter rows in Data) or that of the annual means.", "alternativa": null },
      { "nombre": "Monotonic trend", "como": "Look at the plot of the series with Sen’s line: the test detects changes in a single direction.", "verificar": null, "siFalla": "If the series rises and then falls, Mann-Kendall may detect nothing: describe the shape with a polynomial regression on time.", "alternativa": "regresion-polinomial" },
      { "nombre": "Equal time steps", "como": "Sen’s slope uses the position in the series (1, 2, 3…), not the value of the time column; it is not checked.", "verificar": null, "siFalla": "If years are missing or dates are irregular, the slope “per step” is not per year: use a linear regression on the actual time.", "alternativa": "regresion-lineal" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "temperatura", "tipo": "continuous numeric (also counts or proportions)", "papel": "variable measured over time" },
        { "nombre": "periodo", "tipo": "numeric (time order)", "papel": "time, to order the series (optional)" }
      ],
      "minimo": "The app runs from 3 observations, but with fewer than 10 the test almost never detects a trend. It accepts up to 3000 observations, because it compares all pairs.",
      "balance": "Missing values are omitted and the series closes over the gap, so the slope “per step” is distorted if many are missing. Each time must appear only once.",
      "notaFormato": "Long format: one row per time, with the time column and the variable column. With several plots or stations, analyze each series separately or their mean per year.",
      "errores": [
        "Testing a monthly series with a marked annual cycle as if it had none: use the annual means or each month separately.",
        "Reporting the slope “per step” as if it were per year when the data are monthly: multiply it by 12.",
        "Entering several replicates of the same year (several plots): SigmaPro rejects repeated times; average them first.",
        "Confusing significance with magnitude: in long series, a tiny slope may come out significant."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read Mann-Kendall’s τ, z and p: p < 0.05 indicates a trend; the sign of S or τ, its direction.",
        "Read Sen’s slope and its interval: how much the variable changes per step of the series; if the interval includes zero, the magnitude is uncertain.",
        "Look at the plot of the series with Sen’s line to see whether the trend is monotonic and whether there are cycles.",
        "Convert the slope to a useful scale (per year, per decade) to report it."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Mean annual temperature increased between 1995 and 2024 (Mann-Kendall τ = 0.41, z = 3.12, p = 0.002); Sen’s slope was 0.03 °C per year (95% CI: 0.01 to 0.05), about 0.3 °C per decade.”",
      "guias": ["tau", "z", "p", "ic", "mediana"]
    },
    "limitaciones": [
      "Mann-Kendall assumes independent observations with no cycle; with monthly data or autocorrelation, test the annual means or each month separately.",
      "It only detects monotonic trends; an abrupt shift or a U-shaped curve calls for another analysis (polynomial regression).",
      "Sen’s slope is a straight line per step of the series: it does not tell whether the change is accelerating.",
      "To separate the trend from the cycle and see its shape, use the decomposition."
    ],
    "referencias": [
      "Mann, H. B. (1945). Nonparametric tests against trend. Econometrica, 13(3), 245–259.",
      "Kendall, M. G. (1975). Rank correlation methods (4th ed.). Griffin.",
      "Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall’s tau. Journal of the American Statistical Association, 63(324), 1379–1389.",
      "Hirsch, R. M., Slack, J. R., & Smith, R. A. (1982). Techniques of trend analysis for monthly water quality data. Water Resources Research, 18(1), 107–121.",
      "Hamed, K. H., & Rao, A. R. (1998). A modified Mann-Kendall trend test for autocorrelated data. Journal of Hydrology, 204(1–4), 182–196."
    ]
  }
});
