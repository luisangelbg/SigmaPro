SP_FICHA({
  "id": "regresion-lineal",
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["regresion-polinomial", "seleccion-pasos", "mejores-subconjuntos", "matriz-correlacion", "ancova", "glm"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "respuesta": "rendimiento", "predictores": ["altitud", "materia_organica", "sombra"] }, "opciones": {} },
  "formato": {
    "largo": [["finca", "altitud", "materia_organica", "sombra", "rendimiento"], ["F01", "1342", "6.5", "33", "17.6"], ["F02", "1053", "6.8", "23", "15.4"], ["F03", "1048", "2.2", "61", "4"], ["F04", "1442", "4.2", "38", "14.4"], ["F05", "1629", "6.8", "29", "20.5"], ["F06", "1557", "6.6", "69", "19.1"], ["F07", "1430", "3.6", "61", "10.1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Regresión lineal múltiple", "Regresión por mínimos cuadrados", "Modelo de regresión lineal", "Regresión simple"],
    "paraQue": "Mide cómo cambia una respuesta con una o varias variables numéricas y permite predecirla, con el diagnóstico completo del modelo.",
    "preguntas": [
      "¿Cuánto aumenta el rendimiento del café por cada 100 m de altitud, a igual materia orgánica y sombra?",
      "¿Qué rendimiento se espera en una finca a 1200 m de altitud con 4 % de materia orgánica, y con qué intervalo de predicción?",
      "¿Cuánto de la variación del nitrógeno foliar explica la lectura del medidor de clorofila?"
    ],
    "teoria": [
      "La regresión lineal describe la media de una respuesta como una suma de efectos de predictores numéricos, y = β₀ + β₁x₁ + … + βₚxₚ + ε, y estima los coeficientes por mínimos cuadrados. En la regresión simple la pendiente es el cambio de y por unidad de x; en la múltiple, cada coeficiente es el cambio de y por unidad de su predictor con los demás fijos, por eso puede diferir del que daría ese predictor solo. La F global prueba si el modelo explica algo; la t de cada coeficiente, si ese predictor aporta además de los otros. El R² es la fracción de la variación explicada y la R² ajustada lo corrige por el número de predictores.",
      "SigmaPro da los coeficientes con sus intervalos de confianza y sus β estandarizados, el análisis de varianza de la regresión, R², σ, CV, AIC y BIC, y las sumas de cuadrados secuenciales (tipo I) y parciales (tipo II) de cada predictor. Si hay valores repetidos de los predictores, separa el error en falta de ajuste y error puro. El diagnóstico reúne Shapiro-Wilk, Breusch-Pagan estudentizada, RESET y Durbin-Watson; palancas, residuos estudentizados, Cook, DFFITS, DFBETAS y COVRATIO con los criterios de R; y la colinealidad, con el VIF y los índices de condición de Belsley, Kuh y Welsch. Con los valores que escribas, predice la media con su intervalo de confianza y un dato nuevo con su intervalo de predicción, siempre más ancho.",
      "Con datos de observación la regresión muestra asociación, no causa: un predictor puede parecer importante porque va junto con otro que no se midió."
    ],
    "modelo": {
      "tex": "y_i = \\beta_0 + \\beta_1 x_{1i} + \\beta_2 x_{2i} + \\cdots + \\beta_p x_{pi} + \\varepsilon_i, \\quad \\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_i", "la respuesta de la observación i"],
        ["\\beta_0", "el intercepto: la media de y cuando todos los predictores valen cero"],
        ["\\beta_j", "el cambio en la media de y por unidad de x_j, con los demás predictores fijos"],
        ["x_{ji}", "el valor del predictor j en la observación i (de 1 a 15 predictores numéricos)"],
        ["\\varepsilon_i", "el error, independiente y normal, con media 0 y varianza constante σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_p = 0", "h1": "\\text{algún } \\beta_j \\ne 0", "texto": "Prueba F global del análisis de varianza de la regresión: ¿explica el modelo parte de la variación de y?" },
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "Prueba t de cada coeficiente: ¿aporta x_j una vez que los demás predictores están en el modelo? Su cuadrado es la F parcial (tipo II)." }
    ],
    "supuestos": [
      { "nombre": "Relación lineal (forma del modelo)", "como": "Semáforo «Forma del modelo»: RESET con ŷ² y ŷ³ y, si hay valores repetidos de los predictores, la falta de ajuste; mira también la gráfica de residuos contra ajustados.", "verificar": null, "siFalla": "Agrega términos curvos con la regresión polinomial, transforma x o y, o usa un modelo no lineal.", "alternativa": "regresion-polinomial" },
      { "nombre": "Normalidad de los residuos", "como": "Semáforo con Shapiro-Wilk y gráfica Q-Q de los residuos estandarizados.", "verificar": null, "siFalla": "Con muestras grandes la regresión tolera desvíos leves; con desvíos fuertes, o si la respuesta es un conteo o una proporción, usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Varianza constante", "como": "Semáforo con Breusch-Pagan estudentizada (Koenker) y la gráfica de residuos contra ajustados, que toma forma de embudo si falla.", "verificar": null, "siFalla": "Transforma la respuesta (logaritmo o Box-Cox en Datos) o usa un modelo gamma si la varianza crece con la media.", "alternativa": "glm-gamma" },
      { "nombre": "Independencia", "como": "Semáforo con Durbin-Watson en el orden de las filas; solo tiene sentido si ese es el orden de medición o la posición en el campo, por eso no pasa de «Revisar».", "verificar": null, "siFalla": "Si mediste la misma unidad varias veces, esos datos no son independientes: usa medidas repetidas o un modelo mixto.", "alternativa": "medidas-repetidas" },
      { "nombre": "Sin colinealidad grave", "como": "Semáforo con el VIF máximo (ámbar sobre 5, rojo sobre 10) y el cuadro de índices de condición: un índice mayor que 30 con dos o más proporciones de varianza mayores que 0.5 señala colinealidad dañina.", "verificar": "matriz-correlacion", "siFalla": "Quita uno de los predictores que van juntos o combínalos; la colinealidad no sesga las predicciones, pero vuelve inestables los coeficientes.", "alternativa": "mejores-subconjuntos" },
      { "nombre": "Sin observaciones demasiado influyentes", "como": "Semáforo y cuadro de observaciones influyentes (rojo si alguna tiene una distancia de Cook grande) y la gráfica de residuos contra palanca.", "verificar": null, "siFalla": "Revisa que el dato esté bien capturado; si es correcto, reporta el modelo con y sin él en lugar de borrarlo.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta (y)" },
        { "nombre": "altitud, materia_organica, sombra", "tipo": "numérica continua", "papel": "predictores (de 1 a 15)" },
        { "nombre": "finca", "tipo": "identificador", "papel": "identifica la observación (no entra al modelo)" }
      ],
      "minimo": "Como guía, de 10 a 15 observaciones por predictor, y siempre más observaciones que coeficientes. Con un solo predictor, conviene cubrir todo el intervalo de x que interesa.",
      "balance": "Las filas con algún faltante en la respuesta o en los predictores no entran; SigmaPro dice cuántas quedaron fuera. Si un predictor es combinación exacta de otros, te pide quitarlo.",
      "notaFormato": "Una fila por observación (parcela, planta, finca) y una columna por variable. Los predictores deben ser numéricos; para comparar grupos ajustando por una variable numérica usa la ANCOVA.",
      "errores": [
        "Usar como predictor un factor codificado con números (variedad 1, 2, 3): SigmaPro lo tomaría como una cantidad.",
        "Incluir predictores casi equivalentes (altitud y temperatura) y leer sus coeficientes por separado: revisa el VIF.",
        "Predecir fuera del intervalo de los datos observados.",
        "Contar como observaciones independientes varias plantas de una misma parcela."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo de los supuestos y las cuatro gráficas de diagnóstico.",
        "Lee la F global y la R² ajustada para saber si el modelo explica algo y cuánto.",
        "En el cuadro de coeficientes, interpreta cada pendiente con su intervalo de confianza; los β estandarizados comparan predictores medidos en unidades distintas.",
        "Mira el VIF y las observaciones influyentes antes de dar por buenos los coeficientes.",
        "Si pediste predicciones, distingue el intervalo de confianza de la media del intervalo de predicción de un dato nuevo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento aumentó 1.2 qq/ha por cada 100 m de altitud (IC 95 %: 0.9 a 1.5) y 1.7 qq/ha por cada punto porcentual de materia orgánica (IC 95 %: 1.3 a 2.1), a igual sombra. El modelo explicó el 77 % de la variación (R² ajustada = 0.75; F(3, 36) = 41.0, p < 0.001), sin colinealidad (VIF < 1.5) ni desvíos importantes de los supuestos».",
      "guias": ["coeficiente", "r2-ajustada", "beta-std", "sigma", "vif", "cook", "breusch-pagan", "durbin-watson"]
    },
    "limitaciones": [
      "Solo admite predictores numéricos: para comparar grupos ajustando por una covariable usa la ANCOVA; para relaciones curvas, la regresión polinomial o un modelo no lineal.",
      "Con muchos predictores candidatos, elige con criterio agronómico y apóyate en la selección paso a paso o en mejores subconjuntos, que son exploratorias.",
      "Para conteos, proporciones o respuestas positivas cuya varianza crece con la media usa un modelo lineal generalizado.",
      "Si las observaciones están agrupadas (varias plantas por parcela, varias fechas por árbol), usa un modelo mixto."
    ],
    "referencias": [
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). Introduction to linear regression analysis (5th ed.). Wiley.",
      "Belsley, D. A., Kuh, E., & Welsch, R. E. (1980). Regression diagnostics: Identifying influential data and sources of collinearity. Wiley.",
      "Cook, R. D. (1977). Detection of influential observation in linear regression. Technometrics, 19(1), 15–18.",
      "Fox, J., & Weisberg, S. (2019). An R companion to applied regression (3rd ed.). Sage."
    ]
  },
  "en": {
    "alias": ["Multiple linear regression", "Least-squares regression", "Linear regression model", "Simple regression"],
    "paraQue": "Measures how a response changes with one or several numeric variables and lets you predict it, with full model diagnostics.",
    "preguntas": [
      "How much does coffee yield increase for every 100 m of altitude, at equal organic matter and shade?",
      "What yield is expected on a farm at 1200 m altitude with 4 % organic matter, and with what prediction interval?",
      "How much of the variation in leaf nitrogen does the chlorophyll meter reading explain?"
    ],
    "teoria": [
      "Linear regression describes the mean of a response as a sum of effects of numeric predictors, y = β₀ + β₁x₁ + … + βₚxₚ + ε, and estimates the coefficients by least squares. In simple regression the slope is the change in y per unit of x; in multiple regression, each coefficient is the change in y per unit of its predictor with the others held fixed, which is why it may differ from what that predictor alone would give. The overall F tests whether the model explains anything; the t of each coefficient, whether that predictor adds to the others. R² is the fraction of variation explained, and adjusted R² corrects it for the number of predictors.",
      "SigmaPro gives the coefficients with their confidence intervals and standardized βs, the regression analysis of variance, R², σ, CV, AIC and BIC, and the sequential (type I) and partial (type II) sums of squares of each predictor. If there are repeated predictor values, it splits the error into lack of fit and pure error. The diagnostics include Shapiro-Wilk, studentized Breusch-Pagan, RESET and Durbin-Watson; leverages, studentized residuals, Cook, DFFITS, DFBETAS and COVRATIO with R’s criteria; and collinearity, with the VIF and the Belsley, Kuh and Welsch condition indices. With the values you type, it predicts the mean with its confidence interval and a new observation with its prediction interval, which is always wider.",
      "With observational data regression shows association, not cause: a predictor may look important because it goes along with another one that was not measured."
    ],
    "modelo": {
      "tex": "y_i = \\beta_0 + \\beta_1 x_{1i} + \\beta_2 x_{2i} + \\cdots + \\beta_p x_{pi} + \\varepsilon_i, \\quad \\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_i", "the response of observation i"],
        ["\\beta_0", "the intercept: the mean of y when all predictors are zero"],
        ["\\beta_j", "the change in the mean of y per unit of x_j, with the other predictors held fixed"],
        ["x_{ji}", "the value of predictor j in observation i (1 to 15 numeric predictors)"],
        ["\\varepsilon_i", "the error, independent and normal, with mean 0 and constant variance σ²"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_p = 0", "h1": "\\text{some } \\beta_j \\ne 0", "texto": "Overall F test of the regression analysis of variance: does the model explain part of the variation in y?" },
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "t test of each coefficient: does x_j contribute once the other predictors are in the model? Its square is the partial (type II) F." }
    ],
    "supuestos": [
      { "nombre": "Linear relationship (model form)", "como": "Checklist item “Model form”: RESET with ŷ² and ŷ³ and, if there are repeated predictor values, lack of fit; also look at the residuals vs. fitted plot.", "verificar": null, "siFalla": "Add curved terms with polynomial regression, transform x or y, or use a nonlinear model.", "alternativa": "regresion-polinomial" },
      { "nombre": "Normality of residuals", "como": "Checklist with Shapiro-Wilk and the normal Q-Q plot of the standardized residuals.", "verificar": null, "siFalla": "With large samples regression tolerates mild departures; with strong departures, or if the response is a count or a proportion, use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "Constant variance", "como": "Checklist with the studentized (Koenker) Breusch-Pagan test and the residuals vs. fitted plot, which takes a funnel shape when it fails.", "verificar": null, "siFalla": "Transform the response (logarithm or Box-Cox in Data) or use a gamma model if the variance grows with the mean.", "alternativa": "glm-gamma" },
      { "nombre": "Independence", "como": "Checklist with Durbin-Watson in the order of the rows; it only makes sense if that is the measurement order or the position in the field, which is why it never goes beyond “Check”.", "verificar": null, "siFalla": "If you measured the same unit several times, those data are not independent: use repeated measures or a mixed model.", "alternativa": "medidas-repetidas" },
      { "nombre": "No serious collinearity", "como": "Checklist with the maximum VIF (amber above 5, red above 10) and the condition index table: an index above 30 with two or more variance proportions above 0.5 signals harmful collinearity.", "verificar": "matriz-correlacion", "siFalla": "Drop one of the predictors that go together or combine them; collinearity does not bias predictions, but it makes the coefficients unstable.", "alternativa": "mejores-subconjuntos" },
      { "nombre": "No overly influential observations", "como": "Checklist and influential observations table (red if any has a large Cook’s distance) and the residuals vs. leverage plot.", "verificar": null, "siFalla": "Check that the value was entered correctly; if it is correct, report the model with and without it instead of deleting it.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response (y)" },
        { "nombre": "altitud, materia_organica, sombra", "tipo": "continuous numeric", "papel": "predictors (1 to 15)" },
        { "nombre": "finca", "tipo": "identifier", "papel": "identifies the observation (not in the model)" }
      ],
      "minimo": "As a guide, 10 to 15 observations per predictor, and always more observations than coefficients. With a single predictor, cover the whole range of x of interest.",
      "balance": "Rows with any missing value in the response or the predictors are left out; SigmaPro tells you how many. If a predictor is an exact combination of others, it asks you to remove it.",
      "notaFormato": "One row per observation (plot, plant, farm) and one column per variable. Predictors must be numeric; to compare groups adjusting for a numeric variable use ANCOVA.",
      "errores": [
        "Using as a predictor a factor coded with numbers (variety 1, 2, 3): SigmaPro would take it as a quantity.",
        "Including nearly equivalent predictors (altitude and temperature) and reading their coefficients separately: check the VIF.",
        "Predicting outside the range of the observed data.",
        "Counting several plants from the same plot as independent observations."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and the four diagnostic plots.",
        "Read the overall F and the adjusted R² to know whether and how much the model explains.",
        "In the coefficients table, interpret each slope with its confidence interval; standardized βs compare predictors measured in different units.",
        "Look at the VIF and the influential observations before trusting the coefficients.",
        "If you requested predictions, tell the confidence interval of the mean from the prediction interval of a new observation."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield increased 1.2 qq/ha for every 100 m of altitude (95 % CI: 0.9 to 1.5) and 1.7 qq/ha per percentage point of organic matter (95 % CI: 1.3 to 2.1), at equal shade. The model explained 77 % of the variation (adjusted R² = 0.75; F(3, 36) = 41.0, p < 0.001), with no collinearity (VIF < 1.5) and no important departures from the assumptions.”",
      "guias": ["coeficiente", "r2-ajustada", "beta-std", "sigma", "vif", "cook", "breusch-pagan", "durbin-watson"]
    },
    "limitaciones": [
      "It only accepts numeric predictors: to compare groups adjusting for a covariate use ANCOVA; for curved relationships, polynomial regression or a nonlinear model.",
      "With many candidate predictors, choose with agronomic judgment and rely on stepwise selection or best subsets, which are exploratory.",
      "For counts, proportions or positive responses whose variance grows with the mean use a generalized linear model.",
      "If the observations are grouped (several plants per plot, several dates per tree), use a mixed model."
    ],
    "referencias": [
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). Introduction to linear regression analysis (5th ed.). Wiley.",
      "Belsley, D. A., Kuh, E., & Welsch, R. E. (1980). Regression diagnostics: Identifying influential data and sources of collinearity. Wiley.",
      "Cook, R. D. (1977). Detection of influential observation in linear regression. Technometrics, 19(1), 15–18.",
      "Fox, J., & Weisberg, S. (2019). An R companion to applied regression (3rd ed.). Sage."
    ]
  }
});
