SP_FICHA({
  "id": "regresion-polinomial",
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["regresion-lineal", "polinomios", "respuesta-meseta", "superficie-respuesta", "curva-crecimiento"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend", "predictores": "dosis" }, "opciones": { "grado": 2 } },
  "formato": {
    "largo": [["dosis", "rend"], ["0", "4.61"], ["60", "5.71"], ["120", "6.41"], ["180", "6.56"], ["0", "4.8"], ["60", "6.34"], ["120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Regresión cuadrática", "Regresión cúbica", "Curva de respuesta polinomial", "Regresión de segundo grado"],
    "paraQue": "Ajusta una curva (cuadrática, cúbica o cuártica) a una respuesta que no sigue una recta y encuentra su máximo o su mínimo.",
    "preguntas": [
      "¿Con qué dosis de nitrógeno se alcanza el mayor rendimiento de maíz dentro de las dosis probadas?",
      "¿A qué temperatura es máxima la velocidad de germinación de una semilla?",
      "¿Qué densidad de plantas minimiza el daño por una plaga, dentro de las densidades ensayadas?"
    ],
    "teoria": [
      "Muchas respuestas agronómicas suben y luego bajan, o se curvan: el rendimiento frente a la dosis de fertilizante, la germinación frente a la temperatura. La regresión polinomial agrega potencias de x al modelo lineal, y = β₀ + β₁x + β₂x² + … + β_g x^g + ε, y lo sigue ajustando por mínimos cuadrados, porque es lineal en los coeficientes. Con grado 2 la curva es una parábola: si β₂ es negativo tiene un máximo en x = −β₁/(2β₂); si es positivo, un mínimo.",
      "SigmaPro usa las potencias crudas de x, como poly(x, g, raw = TRUE) de R, con grado 2, 3 o 4. La t del término de mayor grado dice si la curva lo necesita, y el cuadro «Aporte de cada grado del polinomio» da la suma de cuadrados secuencial de cada potencia, lo que agrega a las anteriores. Con grados 2 y 3 busca el máximo o el mínimo de la curva y lo reporta cuando el término de mayor grado es significativo; si cae fuera del intervalo de los datos, te advierte que no lo extrapoles. Como en la regresión lineal, da el análisis de varianza, la falta de ajuste cuando hay valores repetidos de x (por ejemplo, varias parcelas por dosis), el diagnóstico de residuos e influencia, la curva con sus bandas de confianza y de predicción, y las predicciones que pidas.",
      "Las potencias de x están muy correlacionadas entre sí; por eso no se dan VIF ni β estandarizados: lo que se interpreta es la curva completa, no cada coeficiente por separado. Un grado alto sigue a los datos, pero produce curvas que oscilan; elige el grado más bajo que no muestre falta de ajuste."
    ],
    "modelo": {
      "tex": "y_i = \\beta_0 + \\beta_1 x_i + \\beta_2 x_i^{2} + \\cdots + \\beta_g x_i^{g} + \\varepsilon_i, \\quad \\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_i", "la respuesta de la observación i"],
        ["x_i", "el valor del predictor (dosis, temperatura, densidad)"],
        ["\\beta_1, \\ldots, \\beta_g", "los coeficientes de cada potencia de x; se interpretan juntos, como la curva"],
        ["g", "el grado del polinomio: 2, 3 o 4"],
        ["\\varepsilon_i", "el error, independiente y normal, con varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_g = 0", "h1": "\\beta_g \\ne 0", "texto": "La t del término de mayor grado: si no es significativa, basta un grado menor." },
      { "h0": "E(y \\mid x) = \\beta_0 + \\beta_1 x + \\cdots + \\beta_g x^{g}", "h1": "E(y \\mid x) \\ne \\beta_0 + \\beta_1 x + \\cdots + \\beta_g x^{g}", "texto": "Falta de ajuste: con valores repetidos de x, compara lo que la curva no explica de las medias de cada x con el error puro entre repeticiones." }
    ],
    "supuestos": [
      { "nombre": "La curva tiene la forma adecuada", "como": "Semáforo «Forma del modelo»: falta de ajuste (con repeticiones de x) y RESET; mira también la curva con los datos.", "verificar": null, "siFalla": "Sube un grado si el siguiente término es significativo; si la respuesta llega a una meseta, usa un modelo con meseta.", "alternativa": "respuesta-meseta" },
      { "nombre": "Normalidad de los residuos", "como": "Semáforo con Shapiro-Wilk y gráfica Q-Q de los residuos estandarizados.", "verificar": null, "siFalla": "Transforma la respuesta o, si es un conteo o una proporción, usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Varianza constante", "como": "Semáforo con Breusch-Pagan estudentizada y la gráfica de residuos contra ajustados.", "verificar": null, "siFalla": "Transforma la respuesta (Box-Cox en Datos) o usa un modelo gamma si la varianza crece con la media.", "alternativa": "glm-gamma" },
      { "nombre": "Independencia", "como": "Semáforo con Durbin-Watson en el orden de las filas; si los datos vienen ordenados por bloque o por otro factor, puede marcar «Revisar» aunque no haya dependencia en el tiempo.", "verificar": null, "siFalla": "Si los datos vienen de un experimento con bloques o con otro factor, la regresión no los toma en cuenta: usa polinomios ortogonales dentro del análisis del diseño.", "alternativa": "polinomios" },
      { "nombre": "Sin observaciones demasiado influyentes", "como": "Semáforo, cuadro de observaciones influyentes y gráfica de residuos contra palanca; los extremos de x suelen tener palanca alta.", "verificar": null, "siFalla": "Revisa que el dato esté bien capturado; no subas el grado para alcanzar un punto aislado.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta (y)" },
        { "nombre": "dosis", "tipo": "numérica continua", "papel": "predictor x (uno solo)" }
      ],
      "minimo": "Al menos g + 1 valores distintos de x (3 para la cuadrática), y mejor 4 o 5 con repeticiones en cada uno, para poder probar la falta de ajuste.",
      "balance": "Las filas con faltantes no entran. Puede haber distinto número de repeticiones por valor de x; si x tiene menos de g + 1 valores distintos, SigmaPro te pide bajar el grado.",
      "notaFormato": "Una fila por observación, con una columna para x y otra para la respuesta. No crees columnas con x² o x³: SigmaPro las calcula.",
      "errores": [
        "Subir el grado hasta que el R² casi llegue a 1: la curva sigue al ruido y oscila entre los puntos.",
        "Ajustar la curva a un experimento con bloques sin tomarlos en cuenta: el error queda inflado (usa polinomios ortogonales).",
        "Extrapolar la curva o su máximo fuera del intervalo de x observado.",
        "Promediar las repeticiones antes de ajustar: se pierde el error puro y la prueba de falta de ajuste."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo; en «Forma del modelo», la falta de ajuste dice si el grado elegido basta.",
        "Lee la t del término de mayor grado: si no es significativa, baja el grado.",
        "Mira la curva con sus bandas: la sombreada es la de confianza de la media y la de borde discontinuo, la de predicción.",
        "Si la curva tiene máximo o mínimo dentro de los datos, léelo en las conclusiones y valora su sentido práctico."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento siguió una respuesta cuadrática al nitrógeno (y = 4.4 + 0.032x − 0.00011x²; R² = 0.80), sin falta de ajuste (F(1, 44) = 0.6, p = 0.44). El rendimiento máximo estimado, 6.7 t/ha, se alcanzó con 145 kg de N/ha».",
      "guias": ["coeficiente", "r2", "falta-ajuste", "reset", "ic", "sigma"]
    },
    "limitaciones": [
      "Un polinomio no tiene asíntotas: si la respuesta llega a una meseta, un modelo lineal-meseta o de Mitscherlich describe mejor la biología y da una dosis óptima más realista.",
      "Usa un solo predictor: con dos factores cuantitativos usa superficie de respuesta.",
      "No toma en cuenta bloques ni otros factores; en experimentos diseñados usa polinomios ortogonales dentro del análisis de varianza.",
      "Para el crecimiento en el tiempo, con forma de S, usa curvas de crecimiento."
    ],
    "referencias": [
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). Introduction to linear regression analysis (5th ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  },
  "en": {
    "alias": ["Quadratic regression", "Cubic regression", "Polynomial response curve", "Second-degree regression"],
    "paraQue": "Fits a curve (quadratic, cubic or quartic) to a response that does not follow a straight line and finds its maximum or minimum.",
    "preguntas": [
      "At which nitrogen rate is the highest maize yield reached within the rates tested?",
      "At what temperature is the germination rate of a seed highest?",
      "Which plant density minimizes pest damage, within the densities tested?"
    ],
    "teoria": [
      "Many agronomic responses rise and then fall, or bend: yield against fertilizer rate, germination against temperature. Polynomial regression adds powers of x to the linear model, y = β₀ + β₁x + β₂x² + … + β_g x^g + ε, and still fits it by least squares, because it is linear in the coefficients. With degree 2 the curve is a parabola: if β₂ is negative it has a maximum at x = −β₁/(2β₂); if positive, a minimum.",
      "SigmaPro uses the raw powers of x, like R’s poly(x, g, raw = TRUE), with degree 2, 3 or 4. The t of the highest-degree term tells whether the curve needs it, and the table “Contribution of each polynomial degree” gives the sequential sum of squares of each power, what it adds to the previous ones. With degrees 2 and 3 it looks for the maximum or minimum of the curve and reports it when the highest-degree term is significant; if it falls outside the range of the data, it warns you not to extrapolate it. As in linear regression, it gives the analysis of variance, the lack of fit when x has repeated values (for example, several plots per rate), residual and influence diagnostics, the curve with its confidence and prediction bands, and the predictions you request.",
      "The powers of x are highly correlated with each other; that is why no VIF or standardized βs are given: what is interpreted is the whole curve, not each coefficient separately. A high degree follows the data but produces curves that oscillate; choose the lowest degree that shows no lack of fit."
    ],
    "modelo": {
      "tex": "y_i = \\beta_0 + \\beta_1 x_i + \\beta_2 x_i^{2} + \\cdots + \\beta_g x_i^{g} + \\varepsilon_i, \\quad \\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_i", "the response of observation i"],
        ["x_i", "the value of the predictor (rate, temperature, density)"],
        ["\\beta_1, \\ldots, \\beta_g", "the coefficients of each power of x; they are interpreted together, as the curve"],
        ["g", "the polynomial degree: 2, 3 or 4"],
        ["\\varepsilon_i", "the error, independent and normal, with constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_g = 0", "h1": "\\beta_g \\ne 0", "texto": "The t of the highest-degree term: if it is not significant, a lower degree is enough." },
      { "h0": "E(y \\mid x) = \\beta_0 + \\beta_1 x + \\cdots + \\beta_g x^{g}", "h1": "E(y \\mid x) \\ne \\beta_0 + \\beta_1 x + \\cdots + \\beta_g x^{g}", "texto": "Lack of fit: with repeated x values, it compares what the curve leaves unexplained in the means of each x with the pure error among replicates." }
    ],
    "supuestos": [
      { "nombre": "The curve has the right shape", "como": "Checklist item “Model form”: lack of fit (with repeated x values) and RESET; also look at the curve with the data.", "verificar": null, "siFalla": "Go up one degree if the next term is significant; if the response reaches a plateau, use a plateau model.", "alternativa": "respuesta-meseta" },
      { "nombre": "Normality of residuals", "como": "Checklist with Shapiro-Wilk and the normal Q-Q plot of the standardized residuals.", "verificar": null, "siFalla": "Transform the response or, if it is a count or a proportion, use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "Constant variance", "como": "Checklist with the studentized Breusch-Pagan test and the residuals vs. fitted plot.", "verificar": null, "siFalla": "Transform the response (Box-Cox in Data) or use a gamma model if the variance grows with the mean.", "alternativa": "glm-gamma" },
      { "nombre": "Independence", "como": "Checklist with Durbin-Watson in the order of the rows; if the data are sorted by block or by another factor, it may show “Check” even without dependence in time.", "verificar": null, "siFalla": "If the data come from an experiment with blocks or another factor, the regression ignores them: use orthogonal polynomials within the design analysis.", "alternativa": "polinomios" },
      { "nombre": "No overly influential observations", "como": "Checklist, influential observations table and residuals vs. leverage plot; the extremes of x usually have high leverage.", "verificar": null, "siFalla": "Check that the value was entered correctly; do not raise the degree to reach an isolated point.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response (y)" },
        { "nombre": "dosis", "tipo": "continuous numeric", "papel": "predictor x (a single one)" }
      ],
      "minimo": "At least g + 1 distinct x values (3 for the quadratic), and preferably 4 or 5 with replicates at each, to be able to test lack of fit.",
      "balance": "Rows with missing values are left out. There may be different numbers of replicates per x value; if x has fewer than g + 1 distinct values, SigmaPro asks you to lower the degree.",
      "notaFormato": "One row per observation, with a column for x and another for the response. Do not create columns with x² or x³: SigmaPro computes them.",
      "errores": [
        "Raising the degree until R² almost reaches 1: the curve follows the noise and oscillates between the points.",
        "Fitting the curve to an experiment with blocks without accounting for them: the error is inflated (use orthogonal polynomials).",
        "Extrapolating the curve or its maximum outside the observed range of x.",
        "Averaging the replicates before fitting: the pure error and the lack-of-fit test are lost."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist; under “Model form”, the lack of fit tells whether the chosen degree is enough.",
        "Read the t of the highest-degree term: if it is not significant, lower the degree.",
        "Look at the curve with its bands: the shaded one is the confidence band of the mean and the one with a dashed border, the prediction band.",
        "If the curve has a maximum or minimum within the data, read it in the conclusions and judge its practical meaning."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield followed a quadratic response to nitrogen (y = 4.4 + 0.032x − 0.00011x²; R² = 0.80), with no lack of fit (F(1, 44) = 0.6, p = 0.44). The estimated maximum yield, 6.7 t/ha, was reached at 145 kg N/ha.”",
      "guias": ["coeficiente", "r2", "falta-ajuste", "reset", "ic", "sigma"]
    },
    "limitaciones": [
      "A polynomial has no asymptotes: if the response reaches a plateau, a linear-plateau or Mitscherlich model describes the biology better and gives a more realistic optimum rate.",
      "It uses a single predictor: with two quantitative factors use response surface.",
      "It does not account for blocks or other factors; in designed experiments use orthogonal polynomials within the analysis of variance.",
      "For S-shaped growth over time, use growth curves."
    ],
    "referencias": [
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). Introduction to linear regression analysis (5th ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  }
});
