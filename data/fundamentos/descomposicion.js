SP_FICHA({
  "id": "descomposicion",
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": ["ninguno"],
  "relacionados": ["autocorrelacion", "tendencia", "arima", "regresion-polinomial"],
  "ejemplo": { "conjunto": "estacion-mensual", "entradas": { "respuesta": "precipitacion_mm", "tiempo": "periodo" }, "opciones": { "frecuencia": 12, "tipo": "aditiva" } },
  "formato": {
    "largo": [["periodo", "anio", "mes", "precipitacion_mm"], ["1", "2017", "1", "0"], ["2", "2017", "2", "0"], ["3", "2017", "3", "17.8"], ["4", "2017", "4", "41"], ["5", "2017", "5", "94.1"], ["6", "2017", "6", "139.2"], ["7", "2017", "7", "111"], ["8", "2017", "8", "133.4"]],
    "ancho": [["anio", "1", "2", "3", "4", "5", "6", "7", "8"], ["2017", "0", "0", "17.8", "41", "94.1", "139.2", "111", "133.4"]]
  },
  "es": {
    "alias": ["Descomposición clásica", "Tendencia y estacionalidad", "Componente estacional", "Media móvil centrada"],
    "paraQue": "Separa una serie de tiempo en su tendencia de largo plazo, su ciclo estacional (cada año, cada semana) y lo que queda sin explicar.",
    "preguntas": [
      "¿En qué meses llueve más que el promedio en la estación, y cuánto más?",
      "¿Sube con los años el precio mensual del jitomate, aparte de su ciclo anual?",
      "¿Las capturas semanales de un insecto plaga siguen un ciclo que se repite cada temporada?"
    ],
    "teoria": [
      "Muchas series agrícolas y climáticas combinan tres cosas: un nivel que cambia despacio con los años (la tendencia), un patrón que se repite en cada ciclo, como la temporada de lluvias de cada año (la estacionalidad), y una variación irregular. La descomposición clásica separa estas partes con promedios, sin ajustar un modelo.",
      "Primero estima la tendencia con una media móvil centrada que abarca un ciclo completo: con datos mensuales (frecuencia 12) promedia trece meses, con peso de un medio para los dos extremos, de modo que cada mes del año pesa lo mismo y el ciclo se cancela. Luego resta (o divide) la tendencia a la serie y promedia lo que queda en cada posición del ciclo; ese promedio, centrado para que los efectos sumen cero (o promedien uno), es el efecto estacional. El residuo es lo que sobra después de quitar ambas partes.",
      "En la forma aditiva el ciclo suma la misma cantidad cada año (la lluvia de agosto queda tantos milímetros arriba de la tendencia); en la multiplicativa el ciclo es un porcentaje del nivel, crece con él y requiere valores positivos. SigmaPro informa, además, qué fracción de la variación sin tendencia explica la estacionalidad: 1 − var(residuo)/var(serie sin tendencia). La media móvil no alcanza a calcularse en medio ciclo de cada extremo, así que ahí faltan la tendencia y el residuo."
    ],
    "modelo": {
      "tex": "y_t = T_t + S_t + e_t \\quad \\text{o} \\quad y_t = T_t \\times S_t \\times e_t",
      "terminos": [
        ["y_t", "el valor de la serie en el tiempo t"],
        ["T_t", "la tendencia: la media móvil centrada de un ciclo (f observaciones)"],
        ["S_t", "el efecto estacional de la posición de t en el ciclo, el mismo en todos los ciclos"],
        ["e_t", "el residuo, lo que queda sin tendencia ni ciclo"],
        ["f", "la frecuencia: observaciones por ciclo (12 meses, 4 trimestres, 7 días)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Ciclo estable de un año a otro", "como": "La descomposición clásica impone el mismo efecto estacional en todos los ciclos; míralo en la gráfica del residuo: si queda un patrón que cambia con los años, el ciclo no es estable.", "verificar": null, "siFalla": "Descompón por separado tramos más cortos de la serie o modela el ciclo con un ARIMA estacional.", "alternativa": "arima" },
      { "nombre": "Tipo correcto (aditivo o multiplicativo)", "como": "En la gráfica «Serie y tendencia», mira si la amplitud del ciclo crece con el nivel de la serie.", "verificar": null, "siFalla": "Si el ciclo crece con el nivel, usa la forma multiplicativa (solo con valores positivos) o pasa la serie a logaritmos en Datos → Transformar y usa la aditiva.", "alternativa": null },
      { "nombre": "Serie completa y a intervalos iguales", "como": "SigmaPro no corre si hay faltantes o tiempos repetidos y pide al menos dos ciclos completos; que los pasos sean iguales no lo revisa.", "verificar": null, "siFalla": "Rellena los huecos en Datos o lleva la serie a una escala regular (la media de cada mes).", "alternativa": null },
      { "nombre": "Frecuencia que corresponde al ciclo real", "como": "La das tú: 12 para meses en un año, 4 para trimestres, 7 para días de la semana, 52 para semanas.", "verificar": "autocorrelacion", "siFalla": "Si no conoces la longitud del ciclo, búscala en la ACF: el rezago del pico más alto después de los primeros suele ser el periodo.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "numérica continua", "papel": "variable medida en el tiempo" },
        { "nombre": "periodo", "tipo": "numérica (orden del tiempo)", "papel": "tiempo, para ordenar la serie (opcional)" }
      ],
      "minimo": "Al menos dos ciclos completos (24 observaciones mensuales); para un efecto estacional estable conviene tener 4 ciclos o más.",
      "balance": "No admite faltantes ni tiempos repetidos: SigmaPro avisa y no corre. La posición 1 del ciclo es la de la primera observación, así que conviene que la serie empiece al inicio de un ciclo (en enero).",
      "notaFormato": "Formato largo: una fila por tiempo, con la columna del tiempo y la de la variable; SigmaPro ordena la serie por la columna del tiempo. Si tus datos están como tabla de años por meses (el formato ancho de abajo), apílalos con «Ancha ⇄ larga» en Datos: quedan ordenados por mes y luego por año, así que crea con «Variable calculada» una columna de tiempo continua, por ejemplo (as.numeric(anio) - 2017) * 12 + mes (as.numeric vuelve número el año, que está como factor), y elígela como columna del tiempo.",
      "errores": [
        "Empezar la serie en un mes que no es el primero del ciclo y leer la posición 1 como enero: la posición 1 es siempre la de la primera observación.",
        "Poner una frecuencia que no corresponde a los datos (12 con datos semanales).",
        "Elegir la forma multiplicativa con ceros (meses sin lluvia): solo funciona con valores positivos.",
        "Mezclar en una columna varias estaciones o parcelas: cada serie se descompone por separado."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira la gráfica «Serie y tendencia» para ver si el nivel sube, baja o se mantiene.",
        "Lee el cuadro del componente estacional: qué posiciones del ciclo quedan por encima o por debajo de la tendencia y cuánto.",
        "Revisa qué fracción de la variación sin tendencia explica la estacionalidad.",
        "Revisa la gráfica del residuo: debe verse como ruido, sin patrón ni valores muy extremos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La precipitación tuvo un ciclo anual marcado: agosto quedó 70 mm por encima de la tendencia y enero, 65 mm por debajo; la estacionalidad explicó el 90 % de la variación sin tendencia. La tendencia, una media móvil de 12 meses, pasó de 66 a 88 mm entre 2017 y 2024».",
      "guias": ["media", "varianza", "acf"]
    },
    "limitaciones": [
      "Es descriptiva: no prueba si la tendencia o el ciclo son significativos. Para probar la tendencia usa Mann-Kendall y Sen; para pronosticar, un modelo ARIMA estacional.",
      "Supone el mismo ciclo en todos los años; si el patrón estacional cambia, el residuo lo absorbe.",
      "No da la tendencia en medio ciclo de cada extremo (los primeros y los últimos seis meses con datos mensuales).",
      "Un valor extremo (un huracán) se reparte en la media móvil y en el efecto de su posición del ciclo."
    ],
    "referencias": [
      "Kendall, M., & Stuart, A. (1983). The advanced theory of statistics (Vol. 3, 4th ed.). Griffin.",
      "Chatfield, C. (2004). The analysis of time series: An introduction (6th ed.). Chapman & Hall/CRC.",
      "Brockwell, P. J., & Davis, R. A. (2016). Introduction to time series and forecasting (3rd ed.). Springer.",
      "Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and practice (3rd ed.). OTexts."
    ]
  },
  "en": {
    "alias": ["Classical decomposition", "Trend and seasonality", "Seasonal component", "Centered moving average"],
    "paraQue": "Splits a time series into its long-term trend, its seasonal cycle (every year, every week) and what is left unexplained.",
    "preguntas": [
      "In which months does it rain more than average at the station, and by how much?",
      "Does the monthly price of tomato rise over the years, apart from its annual cycle?",
      "Do the weekly catches of an insect pest follow a cycle that repeats every season?"
    ],
    "teoria": [
      "Many agricultural and climate series combine three things: a level that changes slowly over the years (the trend), a pattern that repeats in every cycle, such as each year’s rainy season (the seasonality), and irregular variation. Classical decomposition separates these parts with averages, without fitting a model.",
      "First it estimates the trend with a centered moving average spanning a full cycle: with monthly data (frequency 12) it averages thirteen months, with a weight of one half for the two ends, so that every month of the year weighs the same and the cycle cancels out. Then it subtracts (or divides) the trend from the series and averages what is left at each position of the cycle; that average, centered so that the effects add up to zero (or average one), is the seasonal effect. The residual is what remains after removing both parts.",
      "In the additive form the cycle adds the same amount every year (August rainfall is so many millimeters above the trend); in the multiplicative form the cycle is a percentage of the level, grows with it and requires positive values. SigmaPro also reports what fraction of the detrended variation the seasonality explains: 1 − var(residual)/var(detrended series). The moving average cannot be computed for half a cycle at each end, so the trend and the residual are missing there."
    ],
    "modelo": {
      "tex": "y_t = T_t + S_t + e_t \\quad \\text{or} \\quad y_t = T_t \\times S_t \\times e_t",
      "terminos": [
        ["y_t", "the value of the series at time t"],
        ["T_t", "the trend: the centered moving average over one cycle (f observations)"],
        ["S_t", "the seasonal effect of the position of t in the cycle, the same in every cycle"],
        ["e_t", "the residual, what is left without trend or cycle"],
        ["f", "the frequency: observations per cycle (12 months, 4 quarters, 7 days)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Cycle stable from year to year", "como": "Classical decomposition imposes the same seasonal effect on every cycle; check it in the residual plot: if a pattern that changes over the years remains, the cycle is not stable.", "verificar": null, "siFalla": "Decompose shorter stretches of the series separately or model the cycle with a seasonal ARIMA.", "alternativa": "arima" },
      { "nombre": "Correct type (additive or multiplicative)", "como": "In the “Series and trend” plot, check whether the amplitude of the cycle grows with the level of the series.", "verificar": null, "siFalla": "If the cycle grows with the level, use the multiplicative form (positive values only) or log-transform the series in Data → Transform and use the additive form.", "alternativa": null },
      { "nombre": "Complete series at equal intervals", "como": "SigmaPro does not run with missing values or repeated times and requires at least two full cycles; it does not check that the steps are equal.", "verificar": null, "siFalla": "Fill in the gaps in Data or bring the series to a regular scale (the mean of each month).", "alternativa": null },
      { "nombre": "Frequency matching the real cycle", "como": "You set it: 12 for months in a year, 4 for quarters, 7 for days of the week, 52 for weeks.", "verificar": "autocorrelacion", "siFalla": "If you do not know the length of the cycle, look for it in the ACF: the lag of the highest spike after the first few is usually the period.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "precipitacion_mm", "tipo": "continuous numeric", "papel": "variable measured over time" },
        { "nombre": "periodo", "tipo": "numeric (time order)", "papel": "time, to order the series (optional)" }
      ],
      "minimo": "At least two full cycles (24 monthly observations); for a stable seasonal effect, 4 cycles or more are advisable.",
      "balance": "Missing values and repeated times are not allowed: SigmaPro warns and does not run. Position 1 of the cycle is that of the first observation, so the series should start at the beginning of a cycle (in January).",
      "notaFormato": "Long format: one row per time, with the time column and the variable column; SigmaPro orders the series by the time column. If your data are a table of years by months (the wide format below), stack them with “Wide ⇄ long” in Data: they come out ordered by month and then by year, so create a continuous time column with “Computed variable”, for example (as.numeric(anio) - 2017) * 12 + mes (as.numeric turns the year, stored as a factor, into a number), and choose it as the time column.",
      "errores": [
        "Starting the series in a month that is not the first of the cycle and reading position 1 as January: position 1 is always that of the first observation.",
        "Setting a frequency that does not match the data (12 with weekly data).",
        "Choosing the multiplicative form with zeros (months without rain): it only works with positive values.",
        "Mixing several stations or plots in one column: each series is decomposed separately."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the “Series and trend” plot to see whether the level rises, falls or stays the same.",
        "Read the seasonal component table: which positions of the cycle lie above or below the trend, and by how much.",
        "Check what fraction of the detrended variation the seasonality explains.",
        "Check the residual plot: it should look like noise, with no pattern and no very extreme values."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Rainfall had a marked annual cycle: August was 70 mm above the trend and January 65 mm below it; seasonality explained 90% of the detrended variation. The trend, a 12-month moving average, went from 66 to 88 mm between 2017 and 2024.”",
      "guias": ["media", "varianza", "acf"]
    },
    "limitaciones": [
      "It is descriptive: it does not test whether the trend or the cycle is significant. To test the trend use Mann-Kendall and Sen; to forecast, a seasonal ARIMA model.",
      "It assumes the same cycle in every year; if the seasonal pattern changes, the residual absorbs it.",
      "It gives no trend for half a cycle at each end (the first and last six months with monthly data).",
      "An extreme value (a hurricane) is spread over the moving average and over the effect of its position in the cycle."
    ],
    "referencias": [
      "Kendall, M., & Stuart, A. (1983). The advanced theory of statistics (Vol. 3, 4th ed.). Griffin.",
      "Chatfield, C. (2004). The analysis of time series: An introduction (6th ed.). Chapman & Hall/CRC.",
      "Brockwell, P. J., & Davis, R. A. (2016). Introduction to time series and forecasting (3rd ed.). Springer.",
      "Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and practice (3rd ed.). OTexts."
    ]
  }
});
