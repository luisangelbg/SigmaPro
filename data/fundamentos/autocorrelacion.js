SP_FICHA({
  "id": "autocorrelacion",
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": ["ninguno"],
  "relacionados": ["arima", "descomposicion", "tendencia", "supuestos", "medidas-repetidas"],
  "ejemplo": { "conjunto": "estacion-mensual", "entradas": { "respuesta": "precipitacion_mm", "tiempo": "periodo" }, "opciones": { "lagBox": 12 } },
  "formato": {
    "largo": [["periodo", "anio", "mes", "precipitacion_mm"], ["1", "2017", "1", "0"], ["2", "2017", "2", "0"], ["3", "2017", "3", "17.8"], ["4", "2017", "4", "41"], ["5", "2017", "5", "94.1"], ["6", "2017", "6", "139.2"], ["7", "2017", "7", "111"], ["8", "2017", "8", "133.4"]],
    "ancho": null
  },
  "es": {
    "alias": ["ACF y PACF", "Correlograma", "Prueba de Ljung-Box", "Prueba de Box-Pierce"],
    "paraQue": "Mide cuánto se parece cada valor de una serie de tiempo a los anteriores y prueba si la serie se comporta como datos independientes.",
    "preguntas": [
      "¿La lluvia de un mes se parece a la del mes anterior y a la del mismo mes del año pasado?",
      "¿Las capturas semanales de mosca de la fruta en una trampa dependen de las de las semanas previas?",
      "¿Quedó autocorrelación en los residuos del modelo ajustado a los rendimientos anuales de una región?"
    ],
    "teoria": [
      "Cuando una variable se mide una y otra vez en el mismo lugar a intervalos iguales (lluvia mensual, capturas semanales, rendimiento por año), los valores cercanos en el tiempo suelen parecerse. La autocorrelación de rezago k (ACF) es la correlación de la serie consigo misma k pasos atrás: con datos mensuales, el rezago 1 compara cada mes con el anterior y el rezago 12, con el mismo mes del año previo. La autocorrelación parcial (PACF) mide lo mismo después de quitar el efecto de los rezagos intermedios; SigmaPro la calcula con el algoritmo de Durbin-Levinson.",
      "Si la serie fuera ruido independiente, cada coeficiente caería casi siempre dentro de la banda de ± z/√n. Las pruebas de Box-Pierce y de Ljung-Box resumen los primeros h rezagos en un solo estadístico Q, que se compara con una ji cuadrada; Ljung-Box corrige a Box-Pierce en series cortas. Con los residuos de un modelo ARMA(p, q) se descuentan p + q grados de libertad (la opción fitdf).",
      "La forma del correlograma orienta: una ACF que baja muy despacio indica tendencia; picos en los rezagos 12 y 24 con datos mensuales, un ciclo anual; una PACF que se corta después del rezago p sugiere un modelo autorregresivo de orden p, y una ACF que se corta después de q, uno de medias móviles. Además, la autocorrelación advierte que los datos no son independientes: un ANOVA o una regresión común darían errores estándar demasiado chicos."
    ],
    "modelo": {
      "tex": "r_k = \\frac{\\sum_{t=1}^{n-k} (y_t - \\bar{y})(y_{t+k} - \\bar{y})}{\\sum_{t=1}^{n} (y_t - \\bar{y})^2}, \\quad Q = n(n+2) \\sum_{k=1}^{h} \\frac{r_k^2}{n-k}",
      "terminos": [
        ["r_k", "la autocorrelación de rezago k"],
        ["y_t", "el valor de la serie en el tiempo t (ordenada por la columna del tiempo)"],
        ["\\bar{y}", "la media de la serie"],
        ["n", "el número de observaciones"],
        ["Q", "el estadístico de Ljung-Box con h rezagos; el de Box-Pierce es n veces la suma de los r_k al cuadrado"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_1 = \\rho_2 = \\cdots = \\rho_h = 0", "h1": "\\text{algún } \\rho_k \\ne 0", "texto": "La serie no tiene autocorrelación hasta el rezago h (es ruido independiente). Q se compara con una ji cuadrada de h − fitdf grados de libertad." }
    ],
    "supuestos": [
      { "nombre": "Intervalos de tiempo iguales y sin huecos", "como": "SigmaPro ordena la serie por la columna del tiempo, rechaza los tiempos repetidos y no corre si hay faltantes; que los intervalos sean iguales no lo revisa.", "verificar": null, "siFalla": "Rellena los faltantes en Datos (por ejemplo, con el promedio de los vecinos) o lleva la serie a una escala regular (la media de cada mes).", "alternativa": null },
      { "nombre": "Serie estacionaria (media y varianza estables)", "como": "Una ACF que baja muy despacio delata una tendencia; la descomposición y la prueba de Mann-Kendall la muestran.", "verificar": "descomposicion", "siFalla": "La autocorrelación de una serie con tendencia refleja sobre todo la tendencia: diferencia la serie con un modelo ARIMA (d = 1) y revisa la autocorrelación de sus residuos.", "alternativa": "arima" },
      { "nombre": "Suficientes observaciones para los rezagos", "como": "La app corre desde 4 observaciones; por omisión calcula 10·log10(n) rezagos (como R) y prueba 10 con Ljung-Box.", "verificar": null, "siFalla": "En series cortas las autocorrelaciones de rezagos altos son muy inestables: no interpretes más de unos n/4 rezagos.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "numérica continua", "papel": "variable medida en el tiempo" },
        { "nombre": "periodo", "tipo": "numérica (orden del tiempo)", "papel": "tiempo, para ordenar la serie (opcional)" }
      ],
      "minimo": "Unas 50 observaciones para leer bien el correlograma; con datos mensuales, al menos 4 años para ver los rezagos 12 y 24. La app corre desde 4.",
      "balance": "No admite faltantes: si la serie tiene huecos, SigmaPro avisa y no corre. Cada tiempo debe aparecer una sola vez (una serie, no un ensayo con repeticiones).",
      "notaFormato": "Formato largo: una fila por tiempo, con la columna del tiempo (periodo, mes, año) y la de la variable. Si las filas ya están en orden, la columna del tiempo es opcional.",
      "errores": [
        "Capturar la serie como una tabla de años por meses (formato ancho): pásala a una sola columna con «Ancha ⇄ larga» en Datos.",
        "Mezclar varias estaciones o parcelas en la misma columna: cada serie se analiza por separado (Filtrar filas en Datos).",
        "Borrar los meses sin dato: los pasos dejan de ser iguales y los rezagos se desfasan.",
        "Leer como importante cada rezago que toca la banda: con 20 rezagos, uno puede salir por azar; fíjate en la prueba de Ljung-Box y en el patrón.",
        "Dejar fitdf en 0 al revisar los residuos de un modelo ARMA: la prueba queda demasiado permisiva."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la prueba de Ljung-Box: p < 0.05 indica que la serie no es independiente.",
        "Mira la gráfica de la ACF: qué rezagos salen de la banda y si bajan rápido o despacio.",
        "Busca picos en el rezago del ciclo (12 con meses, 4 con trimestres) para la estacionalidad.",
        "Mira la PACF para proponer el orden autorregresivo de un modelo ARIMA."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La precipitación mensual mostró una autocorrelación fuerte (Ljung-Box Q(12) = 410.3, p < 0.001): positiva en el rezago 1 (r = 0.79) y en el 12 (r = 0.75) y negativa alrededor del rezago 6 (r = −0.78), el patrón de un ciclo anual».",
      "guias": ["acf", "chi2", "gl", "p"]
    },
    "limitaciones": [
      "Describe la dependencia, pero no la modela ni pronostica: para eso ajusta un modelo ARIMA.",
      "La banda de ± z/√n vale para una serie independiente; si los rezagos bajos están autocorrelacionados, los coeficientes de rezagos altos varían más de lo que la banda sugiere.",
      "Con una tendencia o un ciclo marcados, la ACF los refleja y oculta lo demás: quítalos primero (descomposición o diferencias en un modelo ARIMA).",
      "Es para una sola serie; con varias parcelas medidas en el tiempo, usa medidas repetidas."
    ],
    "referencias": [
      "Box, G. E. P., & Pierce, D. A. (1970). Distribution of residual autocorrelations in autoregressive-integrated moving average time series models. Journal of the American Statistical Association, 65(332), 1509–1526.",
      "Ljung, G. M., & Box, G. E. P. (1978). On a measure of lack of fit in time series models. Biometrika, 65(2), 297–303.",
      "Box, G. E. P., & Jenkins, G. M. (1976). Time series analysis: Forecasting and control (Rev. ed.). Holden-Day.",
      "Shumway, R. H., & Stoffer, D. S. (2017). Time series analysis and its applications: With R examples (4th ed.). Springer.",
      "Chatfield, C. (2004). The analysis of time series: An introduction (6th ed.). Chapman & Hall/CRC."
    ]
  },
  "en": {
    "alias": ["ACF and PACF", "Correlogram", "Ljung-Box test", "Box-Pierce test"],
    "paraQue": "Measures how much each value of a time series resembles the previous ones and tests whether the series behaves like independent data.",
    "preguntas": [
      "Is the rainfall of a month similar to that of the previous month and to that of the same month last year?",
      "Do the weekly fruit fly catches in a trap depend on those of the previous weeks?",
      "Is there autocorrelation left in the residuals of the model fitted to the annual yields of a region?"
    ],
    "teoria": [
      "When a variable is measured again and again at the same place at equal intervals (monthly rainfall, weekly catches, yield per year), values close in time tend to be alike. The lag-k autocorrelation (ACF) is the correlation of the series with itself k steps back: with monthly data, lag 1 compares each month with the previous one and lag 12 with the same month of the previous year. The partial autocorrelation (PACF) measures the same after removing the effect of the intermediate lags; SigmaPro computes it with the Durbin-Levinson algorithm.",
      "If the series were independent noise, each coefficient would almost always fall within the ± z/√n band. The Box-Pierce and Ljung-Box tests summarize the first h lags in a single statistic Q, which is compared with a chi-square; Ljung-Box corrects Box-Pierce in short series. With the residuals of an ARMA(p, q) model, p + q degrees of freedom are subtracted (the fitdf option).",
      "The shape of the correlogram is a guide: an ACF that decays very slowly signals a trend; spikes at lags 12 and 24 with monthly data, an annual cycle; a PACF that cuts off after lag p suggests an autoregressive model of order p, and an ACF that cuts off after q, a moving average model. Autocorrelation also warns that the data are not independent: an ordinary ANOVA or regression would give standard errors that are too small."
    ],
    "modelo": {
      "tex": "r_k = \\frac{\\sum_{t=1}^{n-k} (y_t - \\bar{y})(y_{t+k} - \\bar{y})}{\\sum_{t=1}^{n} (y_t - \\bar{y})^2}, \\quad Q = n(n+2) \\sum_{k=1}^{h} \\frac{r_k^2}{n-k}",
      "terminos": [
        ["r_k", "the lag-k autocorrelation"],
        ["y_t", "the value of the series at time t (ordered by the time column)"],
        ["\\bar{y}", "the mean of the series"],
        ["n", "the number of observations"],
        ["Q", "the Ljung-Box statistic with h lags; the Box-Pierce statistic is n times the sum of the squared r_k"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho_1 = \\rho_2 = \\cdots = \\rho_h = 0", "h1": "\\text{some } \\rho_k \\ne 0", "texto": "The series has no autocorrelation up to lag h (it is independent noise). Q is compared with a chi-square with h − fitdf degrees of freedom." }
    ],
    "supuestos": [
      { "nombre": "Equal time intervals and no gaps", "como": "SigmaPro orders the series by the time column, rejects repeated times and does not run if there are missing values; it does not check that the intervals are equal.", "verificar": null, "siFalla": "Fill in the missing values in Data (for example, with the average of their neighbors) or bring the series to a regular scale (the mean of each month).", "alternativa": null },
      { "nombre": "Stationary series (stable mean and variance)", "como": "An ACF that decays very slowly reveals a trend; the decomposition and the Mann-Kendall test show it.", "verificar": "descomposicion", "siFalla": "The autocorrelation of a trending series mostly reflects the trend: difference the series with an ARIMA model (d = 1) and check the autocorrelation of its residuals.", "alternativa": "arima" },
      { "nombre": "Enough observations for the lags", "como": "The app runs from 4 observations; by default it computes 10·log10(n) lags (as R does) and tests 10 with Ljung-Box.", "verificar": null, "siFalla": "In short series the autocorrelations at high lags are very unstable: do not interpret more than about n/4 lags.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "continuous numeric", "papel": "variable measured over time" },
        { "nombre": "periodo", "tipo": "numeric (time order)", "papel": "time, to order the series (optional)" }
      ],
      "minimo": "About 50 observations to read the correlogram well; with monthly data, at least 4 years to see lags 12 and 24. The app runs from 4.",
      "balance": "Missing values are not allowed: if the series has gaps, SigmaPro warns and does not run. Each time must appear only once (a series, not a trial with replicates).",
      "notaFormato": "Long format: one row per time, with the time column (period, month, year) and the variable column. If the rows are already in order, the time column is optional.",
      "errores": [
        "Entering the series as a table of years by months (wide format): turn it into a single column with “Wide ⇄ long” in Data.",
        "Mixing several stations or plots in the same column: each series is analyzed separately (Filter rows in Data).",
        "Deleting the months without data: the steps are no longer equal and the lags shift.",
        "Reading every lag that touches the band as important: with 20 lags, one may come out by chance; look at the Ljung-Box test and at the pattern.",
        "Leaving fitdf at 0 when checking the residuals of an ARMA model: the test becomes too lenient."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the Ljung-Box test: p < 0.05 indicates the series is not independent.",
        "Look at the ACF plot: which lags fall outside the band and whether they decay quickly or slowly.",
        "Look for spikes at the cycle lag (12 with months, 4 with quarters) for seasonality.",
        "Look at the PACF to propose the autoregressive order of an ARIMA model."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Monthly rainfall showed strong autocorrelation (Ljung-Box Q(12) = 410.3, p < 0.001): positive at lag 1 (r = 0.79) and at lag 12 (r = 0.75) and negative around lag 6 (r = −0.78), the pattern of an annual cycle.”",
      "guias": ["acf", "chi2", "gl", "p"]
    },
    "limitaciones": [
      "It describes the dependence but neither models nor forecasts it: fit an ARIMA model for that.",
      "The ± z/√n band holds for an independent series; if the low lags are autocorrelated, the coefficients at high lags vary more than the band suggests.",
      "With a marked trend or cycle, the ACF reflects them and hides everything else: remove them first (decomposition, or differencing in an ARIMA model).",
      "It is meant for a single series; with several plots measured over time, use repeated measures."
    ],
    "referencias": [
      "Box, G. E. P., & Pierce, D. A. (1970). Distribution of residual autocorrelations in autoregressive-integrated moving average time series models. Journal of the American Statistical Association, 65(332), 1509–1526.",
      "Ljung, G. M., & Box, G. E. P. (1978). On a measure of lack of fit in time series models. Biometrika, 65(2), 297–303.",
      "Box, G. E. P., & Jenkins, G. M. (1976). Time series analysis: Forecasting and control (Rev. ed.). Holden-Day.",
      "Shumway, R. H., & Stoffer, D. S. (2017). Time series analysis and its applications: With R examples (4th ed.). Springer.",
      "Chatfield, C. (2004). The analysis of time series: An introduction (6th ed.). Chapman & Hall/CRC."
    ]
  }
});
