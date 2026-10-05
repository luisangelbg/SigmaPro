SP_FICHA({
  "id": "ascenso-pronunciado",
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["superficie"],
  "relacionados": ["superficie-respuesta", "diseno-superficie", "regresion-lineal", "deseabilidad"],
  "ejemplo": { "conjunto": "tomate-superficie", "entradas": { "respuesta": "rendimiento", "factores": ["N", "K"] }, "opciones": { "objetivo": "maximo" } },
  "formato": {
    "largo": [["corrida", "N", "K", "rendimiento"], ["1", "120", "200", "55.5"], ["2", "180", "150", "63.4"], ["3", "95.1", "150", "48.8"], ["4", "180", "79.3", "52.9"], ["5", "180", "150", "59.9"], ["6", "180", "150", "62.5"], ["7", "120", "100", "47.8"]],
    "ancho": null
  },
  "es": {
    "alias": ["Ascenso más pronunciado", "Método de máxima pendiente", "Modelo de primer orden", "Steepest ascent"],
    "paraQue": "Ajusta un plano a un factorial con puntos centrales y te dice en qué dirección mover las dosis para acercarte pronto a la mejor respuesta.",
    "preguntas": [
      "Si el rendimiento de tomate sigue subiendo en las dosis más altas de nitrógeno y potasio que probaste, ¿en qué proporción conviene aumentar ambas en el siguiente ensayo?",
      "¿Hacia qué combinación de temperatura y humedad relativa conviene mover la cámara para acortar el tiempo a germinación de una semilla forestal?",
      "¿Hay curvatura en la respuesta del forraje al riego y al fósforo dentro de la región estudiada, o todavía estás lejos del óptimo?"
    ],
    "teoria": [
      "La metodología de superficie de respuesta trabaja por etapas. Lejos del óptimo, la respuesta cambia casi como un plano inclinado, y un diseño pequeño (un factorial 2^k con puntos centrales) basta para estimar su pendiente. El ascenso más pronunciado consiste en caminar desde el centro del diseño en la dirección en que la respuesta cambia más rápido y hacer corridas a lo largo de ese camino hasta que la respuesta deje de mejorar; ahí se monta un nuevo diseño.",
      "SigmaPro codifica los factores como z = (x − centro) / paso, o con el −1 y el +1 que des a mano, y ajusta el modelo de primer orden por mínimos cuadrados, con bloques si los hay. El camino es proporcional a los coeficientes: por cada unidad codificada de distancia, cada factor avanza su coeficiente dividido entre la longitud del vector de coeficientes; si buscas el mínimo, el camino va en sentido contrario (descenso). El cuadro del camino da la predicción y su error estándar de 0 a 5 unidades codificadas, con los factores ya en sus unidades originales.",
      "Los puntos centrales repetidos dan el error puro, y la falta de ajuste del plano revela curvatura o interacción. Si es significativa, probablemente ya estás cerca del óptimo y conviene ampliar a un diseño de segundo orden."
    ],
    "modelo": {
      "tex": "y = \\beta_0 + \\sum_{i=1}^{k} \\beta_i z_i + \\varepsilon, \\quad z(r) = \\frac{r}{\\sqrt{\\sum_{i} \\beta_i^2}} \\left( \\beta_1, \\ldots, \\beta_k \\right)",
      "terminos": [
        ["y", "la respuesta"],
        ["z_i", "el factor i codificado (−1 y +1 en los niveles del factorial, 0 en el centro)"],
        ["\\beta_0", "la respuesta estimada en el centro del diseño"],
        ["\\beta_i", "la pendiente del factor i en unidades codificadas"],
        ["z(r)", "el punto del camino a distancia r del centro (con signo contrario para el descenso)"],
        ["\\varepsilon", "el error, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_k = 0", "h1": "\\text{algún } \\beta_i \\ne 0", "texto": "La respuesta no cambia con los factores en la región: F del primer orden en el análisis de varianza; cada pendiente tiene además su prueba t." },
      { "h0": "\\text{el plano describe la respuesta}", "h1": "\\text{hay curvatura o interacción}", "texto": "Falta de ajuste contra el error puro de los puntos repetidos (los centros)." }
    ],
    "supuestos": [
      { "nombre": "El modelo de primer orden basta en la región (sin curvatura)", "como": "Semáforo «Falta de ajuste»: prueba contra el error puro de los centros; sin puntos repetidos queda en gris.", "verificar": null, "siFalla": "Estás cerca del óptimo: agrega puntos axiales (central compuesto) y ajusta el modelo de segundo orden.", "alternativa": "superficie-respuesta" },
      { "nombre": "Normalidad y varianza constante de los residuos", "como": "La gráfica de residuos contra valores ajustados y el semáforo «Observaciones atípicas» (residuos mayores que 3σ). Para pruebas formales, ajusta el mismo modelo en Regresión lineal con los factores como predictores (Shapiro-Wilk y Breusch-Pagan).", "verificar": "regresion-lineal", "siFalla": "Transforma la respuesta (Box-Cox en ↻ Transformar…) y repite el análisis.", "alternativa": null },
      { "nombre": "Independencia", "como": "La da el orden aleatorio de las corridas; no se prueba con los datos.", "verificar": null, "siFalla": "Si las corridas se hicieron en días o lotes distintos, decláralos como bloques.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "N, K", "tipo": "numérica continua (2 a 6 factores)", "papel": "factores del diseño" },
        { "nombre": "bloque", "tipo": "factor con b niveles (opcional)", "papel": "bloques" }
      ],
      "minimo": "Un factorial 2^k (o una fracción) con 3 a 5 puntos centrales: más corridas que coeficientes (k + 1) y centros repetidos para probar la curvatura.",
      "balance": "Las filas incompletas se excluyen. Con datos de un central compuesto, como el ejemplo, el plano se ajusta a todas las corridas, incluidos los puntos axiales, y la falta de ajuste suele delatar la curvatura.",
      "notaFormato": "Formato largo: una fila por corrida, con una columna numérica por factor y una para la respuesta.",
      "errores": [
        "Seguir el camino mucho más allá de la región sin corridas de confirmación: la predicción es una extrapolación cada vez menos precisa.",
        "Olvidar que la dirección depende del paso de cada factor: con otra codificación el camino cambia.",
        "Omitir los puntos centrales: sin ellos no hay error puro ni prueba de curvatura.",
        "Capturar los factores como texto o marcarlos como factor en vez de numéricos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: si hay falta de ajuste, la respuesta se curva y el camino pierde sentido.",
        "En el análisis de varianza y los coeficientes, confirma que el primer orden es significativo y mira el signo y el tamaño de cada pendiente.",
        "Lee en la conclusión cuánto cambia cada factor, en unidades originales, por unidad codificada de distancia.",
        "En el cuadro del camino, elige las siguientes corridas; más allá de la línea vertical de la gráfica (hasta donde llegan los datos) es extrapolación."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El modelo de primer orden fue significativo (F(2, 6) = 18.4, p = 0.003) y no mostró falta de ajuste (F(2, 4) = 1.3, p = 0.37). El camino de ascenso más pronunciado aumenta 50 kg/ha de N y 25 kg/ha de K por unidad codificada; las siguientes corridas se harán a 1, 2 y 3 unidades del centro».",
      "guias": ["F", "falta-ajuste", "coeficiente", "r2", "ee"]
    },
    "limitaciones": [
      "El camino solo es confiable cerca de la región del diseño; confirma cada paso con corridas reales.",
      "La dirección depende de la escala (el paso) que elijas para cada factor.",
      "Con curvatura (falta de ajuste significativa), pasa a un diseño de segundo orden y a la superficie de respuesta.",
      "No sirve para factores cualitativos (variedades, tipos de sustrato): para ellos usa un diseño factorial con comparaciones de medias."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Box, G. E. P., Hunter, J. S., & Hunter, W. G. (2005). Statistics for experimenters: Design, innovation, and discovery (2nd ed.). Wiley.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Steepest ascent", "Method of steepest ascent", "First-order model", "Steepest descent"],
    "paraQue": "Fits a plane to a factorial with center points and tells you in which direction to move the rates to approach the best response quickly.",
    "preguntas": [
      "If tomato yield keeps rising at the highest nitrogen and potassium rates you tested, in what proportion should both be increased in the next trial?",
      "Toward which combination of temperature and relative humidity should the chamber be moved to shorten the time to germination of a forest seed?",
      "Is there curvature in the forage response to irrigation and phosphorus within the studied region, or are you still far from the optimum?"
    ],
    "teoria": [
      "Response surface methodology works in stages. Far from the optimum, the response changes almost like a tilted plane, and a small design (a 2^k factorial with center points) is enough to estimate its slope. Steepest ascent consists of walking from the design center in the direction in which the response changes fastest and making runs along that path until the response stops improving; a new design is set up there.",
      "SigmaPro codes the factors as z = (x − center) / step, or with the −1 and +1 levels you give by hand, and fits the first-order model by least squares, with blocks if there are any. The path is proportional to the coefficients: for each coded unit of distance, each factor moves by its coefficient divided by the length of the coefficient vector; if you seek the minimum, the path goes the opposite way (descent). The path table gives the prediction and its standard error from 0 to 5 coded units, with the factors already in their original units.",
      "Replicated center points provide pure error, and the lack of fit of the plane reveals curvature or interaction. If it is significant, you are probably close to the optimum and should expand to a second-order design."
    ],
    "modelo": {
      "tex": "y = \\beta_0 + \\sum_{i=1}^{k} \\beta_i z_i + \\varepsilon, \\quad z(r) = \\frac{r}{\\sqrt{\\sum_{i} \\beta_i^2}} \\left( \\beta_1, \\ldots, \\beta_k \\right)",
      "terminos": [
        ["y", "the response"],
        ["z_i", "factor i in coded units (−1 and +1 at the factorial levels, 0 at the center)"],
        ["\\beta_0", "the estimated response at the design center"],
        ["\\beta_i", "the slope of factor i in coded units"],
        ["z(r)", "the point on the path at distance r from the center (with the opposite sign for descent)"],
        ["\\varepsilon", "the error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_k = 0", "h1": "\\text{some } \\beta_i \\ne 0", "texto": "The response does not change with the factors in the region: first-order F in the analysis of variance; each slope also has its t test." },
      { "h0": "\\text{the plane describes the response}", "h1": "\\text{there is curvature or interaction}", "texto": "Lack of fit against the pure error of the replicated points (the center points)." }
    ],
    "supuestos": [
      { "nombre": "The first-order model is enough in the region (no curvature)", "como": "“Lack of fit” in the assumptions checklist: tested against the pure error of the center points; without replicates it stays gray.", "verificar": null, "siFalla": "You are close to the optimum: add axial points (central composite) and fit the second-order model.", "alternativa": "superficie-respuesta" },
      { "nombre": "Normality and constant variance of residuals", "como": "The plot of residuals against fitted values and “Outlying observations” in the checklist (residuals beyond 3σ). For formal tests, fit the same model in linear regression with the factors as predictors (Shapiro-Wilk and Breusch-Pagan).", "verificar": "regresion-lineal", "siFalla": "Transform the response (Box-Cox in ↻ Transform…) and repeat the analysis.", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from the random order of the runs; it is not tested with the data.", "verificar": null, "siFalla": "If the runs were done on different days or batches, declare them as blocks.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "N, K", "tipo": "continuous numeric (2 to 6 factors)", "papel": "design factors" },
        { "nombre": "bloque", "tipo": "factor with b levels (optional)", "papel": "blocks" }
      ],
      "minimo": "A 2^k factorial (or a fraction) with 3 to 5 center points: more runs than coefficients (k + 1) and replicated centers to test curvature.",
      "balance": "Incomplete rows are excluded. With data from a central composite design, like the example, the plane is fitted to every run, axial points included, and lack of fit usually reveals the curvature.",
      "notaFormato": "Long format: one row per run, with one numeric column per factor and one for the response.",
      "errores": [
        "Following the path far beyond the region without confirmation runs: the prediction is an increasingly imprecise extrapolation.",
        "Forgetting that the direction depends on the step of each factor: with another coding the path changes.",
        "Leaving out the center points: without them there is no pure error and no curvature test.",
        "Entering the factors as text or marking them as factors instead of numeric."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: if there is lack of fit, the response is curving and the path loses meaning.",
        "In the analysis of variance and the coefficients, confirm that the first order is significant and look at the sign and size of each slope.",
        "Read in the conclusion how much each factor changes, in original units, per coded unit of distance.",
        "In the path table, choose the next runs; beyond the vertical line on the plot (as far as the data reach) is extrapolation."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The first-order model was significant (F(2, 6) = 18.4, p = 0.003) and showed no lack of fit (F(2, 4) = 1.3, p = 0.37). The path of steepest ascent increases N by 50 kg/ha and K by 25 kg/ha per coded unit; the next runs will be made at 1, 2 and 3 units from the center.”",
      "guias": ["F", "falta-ajuste", "coeficiente", "r2", "ee"]
    },
    "limitaciones": [
      "The path is reliable only near the design region; confirm each step with real runs.",
      "The direction depends on the scale (the step) you choose for each factor.",
      "With curvature (significant lack of fit), move to a second-order design and the response surface.",
      "It does not work for qualitative factors (varieties, substrate types): for those use a factorial design with mean comparisons."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Box, G. E. P., Hunter, J. S., & Hunter, W. G. (2005). Statistics for experimenters: Design, innovation, and discovery (2nd ed.). Wiley.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  }
});
