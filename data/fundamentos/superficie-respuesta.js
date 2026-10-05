SP_FICHA({
  "id": "superficie-respuesta",
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["superficie"],
  "relacionados": ["diseno-superficie", "ascenso-pronunciado", "deseabilidad", "mezclas", "regresion-polinomial", "regresion-lineal"],
  "ejemplo": { "conjunto": "tomate-superficie", "entradas": { "respuesta": "rendimiento", "factores": ["N", "K"] }, "opciones": { "orden": "segundo", "objetivo": "maximo" } },
  "formato": {
    "largo": [["corrida", "N", "K", "rendimiento"], ["1", "120", "200", "55.5"], ["2", "180", "150", "63.4"], ["3", "95.1", "150", "48.8"], ["4", "180", "79.3", "52.9"], ["5", "180", "150", "59.9"], ["6", "180", "150", "62.5"], ["7", "120", "100", "47.8"]],
    "ancho": null
  },
  "es": {
    "alias": ["Metodología de superficie de respuesta", "Modelo de segundo orden", "MSR", "RSM"],
    "paraQue": "Encuentra la combinación de dosis o niveles de varios factores cuantitativos que da la mejor respuesta, con un modelo cuadrático ajustado a un diseño central compuesto o Box-Behnken.",
    "preguntas": [
      "¿Qué combinación de nitrógeno y potasio maximiza el rendimiento de tomate en invernadero?",
      "¿A qué temperatura y tiempo de secado se pierde menos germinación en semilla de maíz?",
      "¿Qué concentraciones de auxina y citocinina dan más brotes por explante en el cultivo in vitro?"
    ],
    "teoria": [
      "Cuando los tratamientos son dosis de varios factores cuantitativos (nitrógeno, potasio, riego, temperatura), no basta con saber si difieren: interesa dónde está la mejor combinación. La metodología de superficie de respuesta aproxima la respuesta, dentro de la región explorada, con un polinomio de segundo orden que tiene términos lineales, productos entre factores y cuadrados. Con ese modelo se dibujan las curvas de nivel y se localiza el óptimo.",
      "SigmaPro codifica cada factor como z = (x − centro) / paso, de modo que el diseño quede en −1, 0 y +1 (y en ±α los puntos axiales de un central compuesto); también puedes fijar a mano el −1 y el +1. Ajusta el modelo por mínimos cuadrados, con bloques si los hay, y separa la suma de cuadrados en primer orden, interacciones y cuadráticos puros. Si hay puntos repetidos (los centros), divide el residuo en falta de ajuste y error puro, y así prueba si el polinomio basta.",
      "El punto estacionario es donde todas las derivadas valen cero. El análisis canónico da los valores propios de la matriz de segundo orden: todos negativos indican un máximo; todos positivos, un mínimo; de signos distintos, un punto silla. Si el punto es una silla o queda fuera de la región, el análisis de cresta da la mejor combinación a cada distancia del centro sin extrapolar."
    ],
    "modelo": {
      "tex": "y = \\beta_0 + \\sum_{i=1}^{k} \\beta_i z_i + \\sum_{i<j} \\beta_{ij} z_i z_j + \\sum_{i=1}^{k} \\beta_{ii} z_i^2 + \\varepsilon, \\quad z_i = \\frac{x_i - c_i}{h_i}",
      "terminos": [
        ["y", "la respuesta (por ejemplo, el rendimiento)"],
        ["z_i", "el factor i codificado: x_i es su valor original, c_i el centro y h_i el paso"],
        ["\\beta_0", "la respuesta estimada en el centro del diseño"],
        ["\\beta_i", "el efecto lineal del factor i"],
        ["\\beta_{ij}", "la interacción entre los factores i y j"],
        ["\\beta_{ii}", "la curvatura del factor i"],
        ["\\varepsilon", "el error, independiente, con media 0 y varianza constante"],
        ["x_s = -\\frac{1}{2} B^{-1} b", "el punto estacionario: b reúne los β_i, y B tiene los β_ii en la diagonal y β_ij / 2 fuera de ella"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_{11} = \\beta_{22} = \\cdots = \\beta_{kk} = 0", "h1": "\\text{algún } \\beta_{ii} \\ne 0", "texto": "La respuesta no tiene curvatura. El análisis de varianza da una F por grupo de términos (primer orden, interacciones y cuadráticos puros), con sumas de cuadrados secuenciales; cada coeficiente tiene además su prueba t." },
      { "h0": "\\text{el modelo de segundo orden describe la respuesta}", "h1": "\\text{la respuesta tiene otra forma}", "texto": "Falta de ajuste: compara el residuo del modelo con el error puro de los puntos repetidos. Un p pequeño indica que el polinomio no capta la forma de la respuesta." }
    ],
    "supuestos": [
      { "nombre": "El modelo de segundo orden describe la respuesta en la región", "como": "Semáforo «Falta de ajuste»: prueba contra el error puro de los puntos repetidos; sin repeticiones queda en gris.", "verificar": null, "siFalla": "Reduce la región, transforma la respuesta o revisa si alguna corrida está mal medida; interpreta el óptimo con cautela.", "alternativa": null },
      { "nombre": "Normalidad y varianza constante de los residuos", "como": "La gráfica de residuos contra valores ajustados y el semáforo «Observaciones atípicas» (residuos mayores que 3σ). Para pruebas formales, calcula los cuadrados y productos de los factores con ƒ Variable calculada… y ajusta el mismo modelo en Regresión lineal, que da Shapiro-Wilk y Breusch-Pagan.", "verificar": "regresion-lineal", "siFalla": "Transforma la respuesta (Box-Cox en ↻ Transformar…) y repite el análisis.", "alternativa": null },
      { "nombre": "El óptimo está dentro de la región experimental", "como": "Semáforo «Punto estacionario»: verde si está dentro de la región y no es un punto silla.", "verificar": null, "siFalla": "Usa la cresta para elegir dentro de la región, o mueve el experimento con el camino de ascenso más pronunciado y monta un diseño nuevo alrededor del óptimo.", "alternativa": "ascenso-pronunciado" },
      { "nombre": "Independencia", "como": "La da correr las corridas en orden aleatorio (el generador de diseños lo sortea con una semilla); no se prueba con los datos.", "verificar": null, "siFalla": "Si las corridas se hicieron en días, lotes o invernaderos distintos, decláralos como bloques.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "N, K", "tipo": "numérica continua (2 a 6 factores, con al menos 3 niveles cada uno)", "papel": "factores del diseño" },
        { "nombre": "bloque", "tipo": "factor con b niveles (opcional)", "papel": "bloques" },
        { "nombre": "corrida", "tipo": "identificador", "papel": "orden de corrida (no entra al análisis)" }
      ],
      "minimo": "Más corridas que coeficientes: el modelo tiene 6 con 2 factores y 10 con 3. Conviene un central compuesto o un Box-Behnken con 3 a 6 puntos centrales repetidos para estimar el error puro.",
      "balance": "Las filas con algún valor faltante se excluyen. No se exige balance, pero el diseño debe permitir estimar todos los términos: si un factor tiene solo dos niveles, la app avisa que no puede ajustar el segundo orden.",
      "notaFormato": "Formato largo: una fila por corrida, con una columna numérica por factor (en unidades originales o ya codificadas) y una para la respuesta.",
      "errores": [
        "Capturar los factores como texto o marcarlos como factor: deben ser columnas numéricas.",
        "Repetir el centro midiendo varias veces la misma unidad: el error puro sale demasiado pequeño y la falta de ajuste parece significativa.",
        "Usar un factorial 2^k sin puntos axiales ni centros: con dos niveles no se estima la curvatura.",
        "Tomar como seguro un óptimo que queda fuera de la región del experimento: es una extrapolación."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: falta de ajuste, residuos atípicos y si el punto estacionario está dentro de la región.",
        "En el análisis de varianza, mira qué grupos de términos son significativos y la falta de ajuste contra el error puro.",
        "Lee la R² y la R² ajustada en el cuadro de ajuste, y los coeficientes en unidades codificadas (comparables entre factores); la ecuación en unidades originales sirve para predecir.",
        "Lee el punto estacionario y el análisis canónico: su naturaleza (máximo, mínimo o silla) y la respuesta estimada con su intervalo.",
        "Con un punto silla o un óptimo fuera de la región, elige la combinación con el cuadro de la cresta y las curvas de nivel."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El modelo de segundo orden explicó el 97.5 % de la variación del rendimiento (R² ajustada = 0.96), sin falta de ajuste (F(3, 4) = 0.04, p = 0.99). El análisis canónico indicó un máximo (valores propios −2.4 y −4.1) con 211 kg/ha de N y 166 kg/ha de K, y un rendimiento estimado de 63.8 t/ha (IC 95 %: 62.6 a 64.9)».",
      "guias": ["F", "falta-ajuste", "r2", "r2-ajustada", "valor-propio", "ic"]
    },
    "limitaciones": [
      "El polinomio describe la respuesta solo dentro de la región explorada; lejos del centro, la cresta y el óptimo son extrapolaciones.",
      "Si la región está lejos del óptimo, primero mueve el experimento con el ascenso más pronunciado.",
      "Para optimizar varias respuestas a la vez (rendimiento alto y costo bajo), combina sus superficies con la deseabilidad.",
      "Si la respuesta tiene meseta o forma asintótica con un solo factor, un modelo no lineal (respuesta a la dosis con meseta) la describe mejor."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Draper, N. R. (1963). “Ridge analysis” of response surfaces. Technometrics, 5(4), 469–479.",
      "Box, G. E. P., & Draper, N. R. (2007). Response surfaces, mixtures, and ridge analyses (2nd ed.). Wiley.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Response surface methodology", "Second-order model", "RSM"],
    "paraQue": "Finds the combination of rates or levels of several quantitative factors that gives the best response, with a quadratic model fitted to a central composite or Box-Behnken design.",
    "preguntas": [
      "Which combination of nitrogen and potassium maximizes greenhouse tomato yield?",
      "At what drying temperature and time is the least germination lost in maize seed?",
      "Which auxin and cytokinin concentrations give the most shoots per explant in in vitro culture?"
    ],
    "teoria": [
      "When the treatments are rates of several quantitative factors (nitrogen, potassium, irrigation, temperature), knowing whether they differ is not enough: what matters is where the best combination lies. Response surface methodology approximates the response, within the explored region, with a second-order polynomial that has linear terms, products between factors and squares. With that model the contour lines are drawn and the optimum is located.",
      "SigmaPro codes each factor as z = (x − center) / step, so that the design sits at −1, 0 and +1 (and the axial points of a central composite at ±α); you can also set the −1 and +1 levels by hand. It fits the model by least squares, with blocks if there are any, and splits the sum of squares into first order, interactions and pure quadratics. If there are replicated points (the center points), it splits the residual into lack of fit and pure error, and so tests whether the polynomial is enough.",
      "The stationary point is where all the derivatives are zero. The canonical analysis gives the eigenvalues of the second-order matrix: all negative indicate a maximum; all positive, a minimum; mixed signs, a saddle point. If the point is a saddle or falls outside the region, ridge analysis gives the best combination at each distance from the center without extrapolating."
    ],
    "modelo": {
      "tex": "y = \\beta_0 + \\sum_{i=1}^{k} \\beta_i z_i + \\sum_{i<j} \\beta_{ij} z_i z_j + \\sum_{i=1}^{k} \\beta_{ii} z_i^2 + \\varepsilon, \\quad z_i = \\frac{x_i - c_i}{h_i}",
      "terminos": [
        ["y", "the response (for example, yield)"],
        ["z_i", "factor i in coded units: x_i is its original value, c_i the center and h_i the step"],
        ["\\beta_0", "the estimated response at the design center"],
        ["\\beta_i", "the linear effect of factor i"],
        ["\\beta_{ij}", "the interaction between factors i and j"],
        ["\\beta_{ii}", "the curvature of factor i"],
        ["\\varepsilon", "the error, independent, with mean 0 and constant variance"],
        ["x_s = -\\frac{1}{2} B^{-1} b", "the stationary point: b collects the β_i, and B has the β_ii on the diagonal and β_ij / 2 off it"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_{11} = \\beta_{22} = \\cdots = \\beta_{kk} = 0", "h1": "\\text{some } \\beta_{ii} \\ne 0", "texto": "The response has no curvature. The analysis of variance gives one F per group of terms (first order, interactions and pure quadratics), with sequential sums of squares; each coefficient also has its t test." },
      { "h0": "\\text{the second-order model describes the response}", "h1": "\\text{the response has another shape}", "texto": "Lack of fit: compares the model residual with the pure error of the replicated points. A small p means the polynomial does not capture the shape of the response." }
    ],
    "supuestos": [
      { "nombre": "The second-order model describes the response in the region", "como": "“Lack of fit” in the assumptions checklist: tested against the pure error of the replicated points; without replicates it stays gray.", "verificar": null, "siFalla": "Narrow the region, transform the response or check whether a run was mismeasured; interpret the optimum with caution.", "alternativa": null },
      { "nombre": "Normality and constant variance of residuals", "como": "The plot of residuals against fitted values and “Outlying observations” in the checklist (residuals beyond 3σ). For formal tests, compute the squares and products of the factors with ƒ Computed variable… and fit the same model in linear regression, which gives Shapiro-Wilk and Breusch-Pagan.", "verificar": "regresion-lineal", "siFalla": "Transform the response (Box-Cox in ↻ Transform…) and repeat the analysis.", "alternativa": null },
      { "nombre": "The optimum lies inside the experimental region", "como": "“Stationary point” in the checklist: green if it is inside the region and is not a saddle point.", "verificar": null, "siFalla": "Use the ridge to choose within the region, or move the experiment along the path of steepest ascent and run a new design around the optimum.", "alternativa": "ascenso-pronunciado" },
      { "nombre": "Independence", "como": "It comes from running the runs in random order (the design generator randomizes them with a seed); it is not tested with the data.", "verificar": null, "siFalla": "If the runs were done on different days, batches or greenhouses, declare them as blocks.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "N, K", "tipo": "continuous numeric (2 to 6 factors, with at least 3 levels each)", "papel": "design factors" },
        { "nombre": "bloque", "tipo": "factor with b levels (optional)", "papel": "blocks" },
        { "nombre": "corrida", "tipo": "identifier", "papel": "run order (not used in the analysis)" }
      ],
      "minimo": "More runs than coefficients: the model has 6 with 2 factors and 10 with 3. A central composite or Box-Behnken design with 3 to 6 replicated center points is advisable to estimate pure error.",
      "balance": "Rows with any missing value are excluded. Balance is not required, but the design must allow every term to be estimated: if a factor has only two levels, the app warns that it cannot fit the second-order model.",
      "notaFormato": "Long format: one row per run, with one numeric column per factor (in original or already coded units) and one for the response.",
      "errores": [
        "Entering the factors as text or marking them as factors: they must be numeric columns.",
        "Replicating the center by measuring the same unit several times: pure error comes out too small and lack of fit looks significant.",
        "Using a 2^k factorial without axial or center points: with two levels curvature cannot be estimated.",
        "Taking an optimum outside the experimental region as reliable: it is an extrapolation."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: lack of fit, outlying residuals and whether the stationary point lies inside the region.",
        "In the analysis of variance, see which groups of terms are significant and the lack of fit against pure error.",
        "Read R² and adjusted R² in the fit table, and the coefficients in coded units (comparable across factors); the equation in original units is for prediction.",
        "Read the stationary point and the canonical analysis: its nature (maximum, minimum or saddle) and the estimated response with its interval.",
        "With a saddle point or an optimum outside the region, choose the combination from the ridge table and the contour plots."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The second-order model explained 97.5% of the variation in yield (adjusted R² = 0.96), with no lack of fit (F(3, 4) = 0.04, p = 0.99). The canonical analysis indicated a maximum (eigenvalues −2.4 and −4.1) at 211 kg/ha N and 166 kg/ha K, with an estimated yield of 63.8 t/ha (95% CI: 62.6 to 64.9).”",
      "guias": ["F", "falta-ajuste", "r2", "r2-ajustada", "valor-propio", "ic"]
    },
    "limitaciones": [
      "The polynomial describes the response only within the explored region; far from the center, the ridge and the optimum are extrapolations.",
      "If the region is far from the optimum, first move the experiment with steepest ascent.",
      "To optimize several responses at once (high yield and low cost), combine their surfaces with desirability.",
      "If the response levels off or is asymptotic with a single factor, a nonlinear model (rate response with a plateau) describes it better."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Draper, N. R. (1963). “Ridge analysis” of response surfaces. Technometrics, 5(4), 469–479.",
      "Box, G. E. P., & Draper, N. R. (2007). Response surfaces, mixtures, and ridge analyses (2nd ed.). Wiley.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley."
    ]
  }
});
