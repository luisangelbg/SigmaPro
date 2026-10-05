SP_FICHA({
  "id": "arima",
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": ["ninguno"],
  "relacionados": ["autocorrelacion", "descomposicion", "tendencia", "regresion-lineal"],
  "ejemplo": { "conjunto": "estacion-mensual", "entradas": { "respuesta": "precipitacion_mm", "tiempo": "periodo" }, "opciones": { "p": 1, "d": 0, "q": 0, "P": 0, "D": 1, "Q": 1, "periodo": 12, "horizonte": 12 } },
  "formato": {
    "largo": [["periodo", "anio", "mes", "precipitacion_mm"], ["1", "2017", "1", "0"], ["2", "2017", "2", "0"], ["3", "2017", "3", "17.8"], ["4", "2017", "4", "41"], ["5", "2017", "5", "94.1"], ["6", "2017", "6", "139.2"], ["7", "2017", "7", "111"], ["8", "2017", "8", "133.4"]],
    "ancho": null
  },
  "es": {
    "alias": ["Box-Jenkins", "SARIMA", "Modelo autorregresivo integrado de medias móviles", "Pronóstico de series de tiempo"],
    "paraQue": "Modela cómo depende cada valor de una serie de los anteriores y de su ciclo estacional, y pronostica los siguientes con su intervalo.",
    "preguntas": [
      "¿Cuánta lluvia se espera en cada mes del próximo año en la estación, y con qué incertidumbre?",
      "¿Qué precio mensual del frijol se espera para los próximos seis meses?",
      "¿Qué producción mensual de leche se espera en un establo el año siguiente, dado su ciclo anual?"
    ],
    "teoria": [
      "Un modelo ARIMA describe una serie con tres ingredientes. La parte autorregresiva (AR, de orden p) explica cada valor con los p valores anteriores; la de medias móviles (MA, de orden q), con los errores de pronóstico de los q pasos previos; y la integración (I, de orden d) diferencia la serie d veces (resta a cada valor el anterior) para quitarle la tendencia y volverla estacionaria, es decir, con media y varianza estables. El modelo estacional, SARIMA(p, d, q)(P, D, Q)s, añade los mismos ingredientes a la distancia de un ciclo s: con datos mensuales, cada mes se relaciona con el mismo mes del año anterior.",
      "SigmaPro estima los coeficientes por máxima verosimilitud exacta con el filtro de Kalman, como la función arima de R; los faltantes se quedan en su lugar y el filtro los salta. Puedes fijar el orden o pedir que busque el de menor AIC entre p, q = 0 a 2 (y P, Q = 0 a 1 si hay periodo), con la d y la D que elijas. La media de la serie se estima solo cuando no hay diferencias.",
      "Un buen modelo deja residuos sin autocorrelación (ruido blanco), lo que se revisa con la prueba de Ljung-Box y con la ACF de los residuos. El pronóstico prolonga la estructura del modelo y su intervalo se abre conforme se aleja del último dato."
    ],
    "modelo": {
      "tex": "\\phi(B) \\Phi(B^{s}) (1 - B)^{d} (1 - B^{s})^{D} y_t = \\theta(B) \\Theta(B^{s}) \\varepsilon_t, \\quad \\varepsilon_t \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_t", "la serie en el tiempo t (menos su media, si se estima)"],
        ["B", "el operador de rezago: aplicado a la serie da el valor anterior"],
        ["\\phi(B), \\theta(B)", "los polinomios autorregresivo (orden p) y de medias móviles (orden q): 1 − φ1B − … y 1 + θ1B + …"],
        ["\\Phi(B^{s}), \\Theta(B^{s})", "los mismos polinomios a la distancia de un ciclo s (órdenes P y Q)"],
        ["d, D", "el número de diferencias simples y estacionales"],
        ["\\varepsilon_t", "el error (ruido blanco), normal con media 0 y varianza σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\phi_j = 0", "h1": "\\phi_j \\ne 0", "texto": "Cada coeficiente (autorregresivo, de medias móviles, estacional o la media) se prueba con z = estimación/EE, con la aproximación normal." },
      { "h0": "\\rho_1(e) = \\cdots = \\rho_h(e) = 0", "h1": "\\text{algún } \\rho_k(e) \\ne 0", "texto": "Los residuos no tienen autocorrelación hasta el rezago h (Ljung-Box con h − (p + q + P + Q) grados de libertad). Aquí conviene no rechazar." }
    ],
    "supuestos": [
      { "nombre": "Serie estacionaria después de diferenciar", "como": "Revisa la ACF de la serie original: si baja muy despacio, hace falta d = 1; si el ciclo se repite año con año, D = 1.", "verificar": "autocorrelacion", "siFalla": "Aumenta d o D (casi nunca hace falta más de d = 1 y D = 1); la descomposición ayuda a ver si hay tendencia, ciclo o ambos.", "alternativa": null },
      { "nombre": "Residuos sin autocorrelación (ruido blanco)", "como": "El semáforo muestra la prueba de Ljung-Box de los residuos; en la gráfica de su ACF las barras deben quedar dentro de la banda.", "verificar": null, "siFalla": "Prueba otro orden (sube p o q si sale de la banda un rezago corto, P o Q si sale el del ciclo) o pide la búsqueda por AIC.", "alternativa": null },
      { "nombre": "Residuos normales con varianza constante", "como": "La verosimilitud y los intervalos del pronóstico los suponen; este análisis no los prueba.", "verificar": null, "siFalla": "Si la variación crece con el nivel, ajusta el modelo a la serie en logaritmos (Datos → Transformar, con una constante si hay ceros) y regresa los pronósticos a la escala original.", "alternativa": null },
      { "nombre": "Intervalos de tiempo iguales", "como": "SigmaPro ordena por la columna del tiempo y rechaza tiempos repetidos; que los pasos sean iguales no lo revisa. Los tiempos del pronóstico siguen el último paso de esa columna.", "verificar": null, "siFalla": "Si falta un mes, deja su fila con el valor vacío (el filtro de Kalman lo salta) en lugar de borrarla.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "numérica continua", "papel": "variable medida en el tiempo" },
        { "nombre": "periodo", "tipo": "numérica (orden del tiempo)", "papel": "tiempo, para ordenar la serie y numerar el pronóstico (opcional)" }
      ],
      "minimo": "La app pide al menos 8 observaciones; en la práctica, unas 50 para un modelo sin estacionalidad y al menos 4 o 5 ciclos completos para uno estacional.",
      "balance": "Admite faltantes dentro de la serie: deja la fila con el valor vacío y el filtro de Kalman la salta. Cada tiempo debe aparecer una sola vez.",
      "notaFormato": "Formato largo: una fila por tiempo, en orden, con la columna del tiempo y la de la variable.",
      "errores": [
        "Borrar las filas de los meses sin dato: la serie se acorta y los meses se desfasan; deja la fila con el valor vacío.",
        "Diferenciar de más (d = 2, o d = 1 junto con D = 1 sin necesidad): los pronósticos se vuelven muy inciertos.",
        "Elegir el orden solo por el AIC sin revisar los residuos.",
        "Tomar los pronósticos lejanos como precisos: el intervalo crece con el horizonte.",
        "Ajustar una variable que no puede ser negativa (lluvia, conteos) sin transformarla: los intervalos pueden bajar de cero."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: la prueba de Ljung-Box de los residuos debe dar p ≥ 0.05.",
        "Lee los coeficientes con su EE y su p, y en «Ajuste» σ², AIC y BIC (para comparar modelos con la misma d y la misma D).",
        "Si pediste la búsqueda, consulta «Modelos comparados por AIC»: los que quedan a menos de 2 del mejor son casi igual de buenos.",
        "Mira la gráfica «Serie y pronóstico» y el cuadro «Pronóstico» con sus intervalos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La precipitación mensual se ajustó con un ARIMA(1, 0, 0)(0, 1, 1)12 (φ1 = 0.52, EE = 0.09; Θ1 = −0.88, EE = 0.30; σ² = 290; AIC = 739.6). Los residuos no mostraron autocorrelación (Ljung-Box Q(22) = 16.1, p = 0.81). El pronóstico para julio del año siguiente fue de 155 mm (IC 95 %: 115 a 195 mm)».",
      "guias": ["coeficiente", "ee", "aic", "bic", "loglik", "p"]
    },
    "limitaciones": [
      "Es un modelo de una sola serie: no usa variables externas (la lluvia para explicar el rendimiento) ni compara tratamientos.",
      "Supone que la estructura del pasado se mantiene: los pronósticos a muchos pasos son muy inciertos y no anticipan cambios bruscos.",
      "La búsqueda por AIC solo prueba órdenes bajos (p, q ≤ 2; P, Q ≤ 1) y no elige d ni D: decídelos con la ACF y la descomposición.",
      "Con variables que no pueden ser negativas, los intervalos del pronóstico pueden bajar de cero: transforma la serie (logaritmo con una constante)."
    ],
    "referencias": [
      "Box, G. E. P., & Jenkins, G. M. (1976). Time series analysis: Forecasting and control (Rev. ed.). Holden-Day.",
      "Gardner, G., Harvey, A. C., & Phillips, G. D. A. (1980). Algorithm AS 154: An algorithm for exact maximum likelihood estimation of autoregressive-moving average models by means of Kalman filtering. Journal of the Royal Statistical Society: Series C (Applied Statistics), 29(3), 311–322.",
      "Ljung, G. M., & Box, G. E. P. (1978). On a measure of lack of fit in time series models. Biometrika, 65(2), 297–303.",
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723.",
      "Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and practice (3rd ed.). OTexts."
    ]
  },
  "en": {
    "alias": ["Box-Jenkins", "SARIMA", "Autoregressive integrated moving average model", "Time series forecasting"],
    "paraQue": "Models how each value of a series depends on the previous ones and on its seasonal cycle, and forecasts the next ones with their interval.",
    "preguntas": [
      "How much rain is expected in each month of next year at the station, and with what uncertainty?",
      "What monthly bean price is expected for the next six months?",
      "What monthly milk production is expected on a dairy farm next year, given its annual cycle?"
    ],
    "teoria": [
      "An ARIMA model describes a series with three ingredients. The autoregressive part (AR, of order p) explains each value with the p previous values; the moving average part (MA, of order q), with the forecast errors of the q previous steps; and integration (I, of order d) differences the series d times (subtracts the previous value from each value) to remove the trend and make it stationary, that is, with a stable mean and variance. The seasonal model, SARIMA(p, d, q)(P, D, Q)s, adds the same ingredients at the distance of one cycle s: with monthly data, each month is related to the same month of the previous year.",
      "SigmaPro estimates the coefficients by exact maximum likelihood with the Kalman filter, as the arima function of R does; missing values stay in place and the filter skips them. You can set the order or ask for a search for the lowest AIC among p, q = 0 to 2 (and P, Q = 0 to 1 if there is a period), with the d and D you choose. The mean of the series is estimated only when there is no differencing.",
      "A good model leaves residuals without autocorrelation (white noise), which is checked with the Ljung-Box test and with the ACF of the residuals. The forecast extends the structure of the model and its interval widens as it moves away from the last observation."
    ],
    "modelo": {
      "tex": "\\phi(B) \\Phi(B^{s}) (1 - B)^{d} (1 - B^{s})^{D} y_t = \\theta(B) \\Theta(B^{s}) \\varepsilon_t, \\quad \\varepsilon_t \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_t", "the series at time t (minus its mean, if estimated)"],
        ["B", "the backshift operator: applied to the series it gives the previous value"],
        ["\\phi(B), \\theta(B)", "the autoregressive (order p) and moving average (order q) polynomials: 1 − φ1B − … and 1 + θ1B + …"],
        ["\\Phi(B^{s}), \\Theta(B^{s})", "the same polynomials at the distance of one cycle s (orders P and Q)"],
        ["d, D", "the number of regular and seasonal differences"],
        ["\\varepsilon_t", "the error (white noise), normal with mean 0 and variance σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\phi_j = 0", "h1": "\\phi_j \\ne 0", "texto": "Each coefficient (autoregressive, moving average, seasonal or the mean) is tested with z = estimate/SE, using the normal approximation." },
      { "h0": "\\rho_1(e) = \\cdots = \\rho_h(e) = 0", "h1": "\\text{some } \\rho_k(e) \\ne 0", "texto": "The residuals have no autocorrelation up to lag h (Ljung-Box with h − (p + q + P + Q) degrees of freedom). Here you want not to reject." }
    ],
    "supuestos": [
      { "nombre": "Stationary series after differencing", "como": "Check the ACF of the original series: if it decays very slowly, d = 1 is needed; if the cycle repeats year after year, D = 1.", "verificar": "autocorrelacion", "siFalla": "Increase d or D (more than d = 1 and D = 1 is rarely needed); the decomposition helps to see whether there is a trend, a cycle or both.", "alternativa": null },
      { "nombre": "Residuals without autocorrelation (white noise)", "como": "The assumptions checklist shows the Ljung-Box test of the residuals; in the plot of their ACF the bars should stay within the band.", "verificar": null, "siFalla": "Try another order (raise p or q if a short lag falls outside the band, P or Q if the cycle lag does) or ask for the AIC search.", "alternativa": null },
      { "nombre": "Normal residuals with constant variance", "como": "The likelihood and the forecast intervals assume them; this analysis does not test them.", "verificar": null, "siFalla": "If the variation grows with the level, fit the model to the log of the series (Data → Transform, with a constant if there are zeros) and back-transform the forecasts.", "alternativa": null },
      { "nombre": "Equal time intervals", "como": "SigmaPro orders by the time column and rejects repeated times; it does not check that the steps are equal. Forecast times follow the last step of that column.", "verificar": null, "siFalla": "If a month is missing, leave its row with an empty value (the Kalman filter skips it) instead of deleting it.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "continuous numeric", "papel": "variable measured over time" },
        { "nombre": "periodo", "tipo": "numeric (time order)", "papel": "time, to order the series and number the forecast (optional)" }
      ],
      "minimo": "The app requires at least 8 observations; in practice, about 50 for a nonseasonal model and at least 4 or 5 full cycles for a seasonal one.",
      "balance": "Missing values within the series are allowed: leave the row with an empty value and the Kalman filter skips it. Each time must appear only once.",
      "notaFormato": "Long format: one row per time, in order, with the time column and the variable column.",
      "errores": [
        "Deleting the rows of months without data: the series gets shorter and the months shift; leave the row with an empty value.",
        "Overdifferencing (d = 2, or d = 1 together with D = 1 when not needed): forecasts become very uncertain.",
        "Choosing the order by AIC alone without checking the residuals.",
        "Taking distant forecasts as precise: the interval grows with the horizon.",
        "Fitting a variable that cannot be negative (rainfall, counts) without transforming it: the intervals may fall below zero."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: the Ljung-Box test of the residuals should give p ≥ 0.05.",
        "Read the coefficients with their SE and p, and in “Fit” σ², AIC and BIC (to compare models with the same d and the same D).",
        "If you asked for the search, see “Models compared by AIC”: those within 2 of the best are almost as good.",
        "Look at the “Series and forecast” plot and the “Forecast” table with its intervals."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Monthly rainfall was fitted with an ARIMA(1, 0, 0)(0, 1, 1)12 (φ1 = 0.52, SE = 0.09; Θ1 = −0.88, SE = 0.30; σ² = 290; AIC = 739.6). The residuals showed no autocorrelation (Ljung-Box Q(22) = 16.1, p = 0.81). The forecast for July of the following year was 155 mm (95% CI: 115 to 195 mm).”",
      "guias": ["coeficiente", "ee", "aic", "bic", "loglik", "p"]
    },
    "limitaciones": [
      "It is a single-series model: it uses no external variables (rainfall to explain yield) and does not compare treatments.",
      "It assumes the structure of the past persists: forecasts many steps ahead are very uncertain and do not anticipate abrupt changes.",
      "The AIC search only tries low orders (p, q ≤ 2; P, Q ≤ 1) and does not choose d or D: decide them with the ACF and the decomposition.",
      "With variables that cannot be negative, the forecast intervals may fall below zero: transform the series (logarithm with a constant)."
    ],
    "referencias": [
      "Box, G. E. P., & Jenkins, G. M. (1976). Time series analysis: Forecasting and control (Rev. ed.). Holden-Day.",
      "Gardner, G., Harvey, A. C., & Phillips, G. D. A. (1980). Algorithm AS 154: An algorithm for exact maximum likelihood estimation of autoregressive-moving average models by means of Kalman filtering. Journal of the Royal Statistical Society: Series C (Applied Statistics), 29(3), 311–322.",
      "Ljung, G. M., & Box, G. E. P. (1978). On a measure of lack of fit in time series models. Biometrika, 65(2), 297–303.",
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723.",
      "Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and practice (3rd ed.). OTexts."
    ]
  }
});
