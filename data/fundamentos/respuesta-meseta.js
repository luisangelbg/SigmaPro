SP_FICHA({
  "id": "respuesta-meseta",
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["dca", "dbca", "ninguno"],
  "relacionados": ["polinomios", "regresion-polinomial", "dosis-respuesta", "curva-crecimiento", "superficie-respuesta"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend", "dosis": "dosis", "grupo": "hibrido" }, "opciones": { "modelo": "auto", "precioProducto": 5000, "precioInsumo": 25 } },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Lineal-meseta", "Cuadrático-meseta", "Modelo de Mitscherlich", "Dosis óptima de fertilización"],
    "paraQue": "Ajusta la respuesta del rendimiento a la dosis de un fertilizante o de riego que sube y luego se estabiliza, para estimar la dosis óptima, el rendimiento máximo y la dosis más rentable.",
    "preguntas": [
      "¿A partir de qué dosis de nitrógeno ya no aumenta el rendimiento de tres híbridos de maíz?",
      "¿Cuál es la dosis económica de fósforo para el frijol con el precio actual del grano y del fertilizante?",
      "¿Con qué lámina de riego se alcanza el rendimiento máximo del jitomate?"
    ],
    "teoria": [
      "Al aumentar la dosis de un nutriente, el rendimiento sube primero y luego se estabiliza: cuando el nutriente deja de limitar, más fertilizante ya no rinde. Una parábola describe la subida, pero obliga a que el rendimiento baje después del máximo, lo que suele exagerar la dosis óptima. Los modelos con meseta separan la subida de la estabilización.",
      "SigmaPro ofrece cinco: lineal-meseta, y = a + b · mín(x, x0), una recta que se vuelve plana en la dosis óptima x0; cuadrático-meseta, una parábola que se vuelve plana en su máximo, con dosis óptima −b/(2c) y meseta a − b²/(4c); Mitscherlich, y = a − b · exp(−c · x), que se acerca a la asíntota sin alcanzarla; y Michaelis-Menten, con o sin respuesta en la dosis cero. «El de menor AIC» los ajusta todos a los mismos datos y elige el de menor AIC, con el peso de Akaike de cada uno. En lineal-meseta la dosis óptima es el parámetro x0; la meseta (y, en cuadrático-meseta, la dosis óptima) lleva su EE por el método delta.",
      "La dosis económica óptima es aquella en que la última unidad de insumo apenas se paga con lo que agrega: donde la pendiente de la curva iguala la razón entre el precio del insumo y el del producto. Si das los dos precios, SigmaPro la calcula con su intervalo. Con un factor de grupo (híbridos, suelos), cada grupo tiene su curva y la prueba F de la suma de cuadrados extra dice si difieren."
    ],
    "modelo": {
      "tex": "y = a + b \\cdot \\min(x, x_{0}) + \\varepsilon",
      "terminos": [
        ["y", "el rendimiento u otra respuesta"],
        ["x", "la dosis del insumo (kg/ha de nitrógeno, lámina de riego)"],
        ["a", "la respuesta sin dosis (el intercepto)"],
        ["b", "el aumento por unidad de dosis antes de la meseta"],
        ["x_{0}", "la dosis óptima: donde empieza la meseta"],
        ["a + b x_{0}", "el valor en la meseta (el rendimiento máximo)"],
        ["\\varepsilon", "el error, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "a_1 = \\cdots = a_g, \\quad b_1 = \\cdots = b_g, \\quad x_{0,1} = \\cdots = x_{0,g}", "h1": "\\text{alguna curva difiere}", "texto": "Con grupos, una curva común describe a todos. Prueba F de la suma de cuadrados extra contra el modelo con una curva por grupo; después, una prueba por parámetro común." }
    ],
    "supuestos": [
      { "nombre": "Forma correcta (meseta brusca o gradual)", "como": "Mira la curva sobre los puntos y la gráfica de residuos contra valores ajustados; compara los modelos con «El de menor AIC».", "verificar": null, "siFalla": "Si los residuos muestran una curva, prueba otro modelo; si el rendimiento baja con las dosis más altas, ninguno de estos lo describe y conviene una regresión polinomial.", "alternativa": "regresion-polinomial" },
      { "nombre": "Varianza constante", "como": "Gráfica de residuos contra valores ajustados: la nube debe tener el mismo ancho.", "verificar": null, "siFalla": "Usa una columna de pesos (por ejemplo, el inverso de la varianza de cada dosis).", "alternativa": null },
      { "nombre": "Independencia y efecto de bloques despreciable", "como": "El modelo no incluye los bloques: su variación queda en el error.", "verificar": null, "siFalla": "Si los bloques difieren mucho, analiza la forma de la respuesta con polinomios ortogonales dentro del diseño en bloques.", "alternativa": "polinomios" },
      { "nombre": "Errores aproximadamente normales", "como": "El semáforo cuenta los residuos que pasan de 3σ.", "verificar": null, "siFalla": "Revisa esas observaciones; los intervalos y las pruebas F dependen de esta aproximación.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "dosis", "tipo": "numérica continua (cero o positiva)", "papel": "dosis (x)" },
        { "nombre": "hibrido", "tipo": "factor con k niveles (opcional)", "papel": "grupo: una curva por nivel" },
        { "nombre": "pesos", "tipo": "numérica continua positiva (opcional)", "papel": "pesos" }
      ],
      "minimo": "Al menos 4 dosis (mejor 5 o 6), con varias en la zona donde la respuesta se estabiliza; con 4 dosis el quiebre de lineal-meseta queda entre dos de ellas y su intervalo es ancho.",
      "balance": "Las filas con faltantes se quitan; las repeticiones de cada dosis se ajustan sobre su media pesada, con el mismo resultado. Los bloques no entran en el modelo.",
      "notaFormato": "Formato largo: una fila por parcela, con la dosis en sus unidades reales. Los precios del producto (por unidad de rendimiento) y del insumo (por unidad de dosis) se escriben en el formulario, en la misma moneda.",
      "errores": [
        "Escribir los precios en unidades distintas a las de los datos (rendimiento en t/ha y precio por kg): la razón de precios y la dosis económica salen mal.",
        "Probar solo dosis por debajo del óptimo: la meseta no se observa y el modelo no la puede estimar.",
        "Elegir el modelo solo por su R²: modelos con R² casi igual dan dosis óptimas muy distintas; compara su AIC y su sentido agronómico.",
        "Codificar las dosis (1, 2, 3, 4) en lugar de usar sus valores."
      ]
    },
    "interpretacion": {
      "orden": [
        "Si pediste «El de menor AIC», mira la comparación de modelos: con ΔAIC menor que 2, dos modelos describen los datos casi igual de bien y conviene ver si sus dosis óptimas difieren.",
        "Revisa el semáforo y la curva ajustada sobre los puntos.",
        "Lee la dosis óptima (x0 en lineal-meseta, o el valor derivado en cuadrático-meseta) y el valor en la meseta, con sus intervalos.",
        "Si diste los precios, lee la dosis económica óptima y la respuesta en ella.",
        "Con grupos, lee la prueba de una curva común y cuál parámetro difiere."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento de los tres híbridos se describió mejor con el modelo lineal-meseta (peso de Akaike = 0.75). Las curvas difirieron (F(6, 39) = 12.4, p < 0.001): la meseta fue de 6.3 t/ha en H-40 y de 7.2 t/ha en H-66, alcanzada con 102 y 96 kg/ha de nitrógeno, respectivamente».",
      "guias": ["aic", "delta-aic", "peso-akaike", "ic", "F", "r2"]
    },
    "limitaciones": [
      "No incluye los bloques del experimento: si son importantes, analiza la dosis con polinomios ortogonales dentro del diseño en bloques.",
      "En lineal-meseta los intervalos son siempre de Wald (el quiebre no deja perfilar) y la dosis económica coincide con x0 mientras la pendiente pague el insumo.",
      "La dosis económica depende de los precios del momento: recalcúlala si cambian.",
      "Ninguno de estos modelos describe una baja del rendimiento con dosis excesivas; para eso usa una regresión polinomial."
    ],
    "referencias": [
      "Cerrato, M. E., & Blackmer, A. M. (1990). Comparison of models for describing corn yield response to nitrogen fertilizer. Agronomy Journal, 82(1), 138–143.",
      "Anderson, R. L., & Nelson, L. A. (1975). A family of models involving intersecting straight lines and concomitant experimental designs useful in evaluating response to fertilizer nutrients. Biometrics, 31(2), 303–318.",
      "Archontoulis, S. V., & Miguez, F. E. (2015). Nonlinear regression models and applications in agricultural research. Agronomy Journal, 107(2), 786–798.",
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley."
    ]
  },
  "en": {
    "alias": ["Linear-plateau", "Quadratic-plateau", "Mitscherlich model", "Optimum fertilizer rate"],
    "paraQue": "Fits a yield response to a fertilizer or irrigation rate that rises and then levels off, to estimate the optimum rate, the maximum yield and the most profitable rate.",
    "preguntas": [
      "Beyond what nitrogen rate does the yield of three maize hybrids stop increasing?",
      "What is the economic phosphorus rate for beans at current grain and fertilizer prices?",
      "With what irrigation depth is the maximum tomato yield reached?"
    ],
    "teoria": [
      "As the rate of a nutrient increases, yield first rises and then levels off: once the nutrient is no longer limiting, more fertilizer does not pay. A parabola describes the rise, but it forces the yield to fall after the maximum, which usually overstates the optimum rate. Plateau models separate the rise from the leveling off.",
      "SigmaPro offers five: linear-plateau, y = a + b · min(x, x0), a straight line that becomes flat at the optimum rate x0; quadratic-plateau, a parabola that becomes flat at its maximum, with optimum rate −b/(2c) and plateau a − b²/(4c); Mitscherlich, y = a − b · exp(−c · x), which approaches the asymptote without reaching it; and Michaelis-Menten, with or without a response at zero rate. “Lowest AIC” fits them all to the same data and chooses the one with the lowest AIC, with the Akaike weight of each. In linear-plateau the optimum rate is the parameter x0; the plateau (and, in quadratic-plateau, the optimum rate) comes with its SE by the delta method.",
      "The economic optimum rate is the one at which the last unit of input barely pays for what it adds: where the slope of the curve equals the ratio of the input price to the product price. If you give both prices, SigmaPro computes it with its interval. With a group factor (hybrids, soils), each group gets its curve and the extra-sum-of-squares F test says whether they differ."
    ],
    "modelo": {
      "tex": "y = a + b \\cdot \\min(x, x_{0}) + \\varepsilon",
      "terminos": [
        ["y", "the yield or another response"],
        ["x", "the input rate (kg/ha of nitrogen, irrigation depth)"],
        ["a", "the response without the input (the intercept)"],
        ["b", "the increase per unit of rate before the plateau"],
        ["x_{0}", "the optimum rate: where the plateau begins"],
        ["a + b x_{0}", "the plateau value (the maximum yield)"],
        ["\\varepsilon", "the error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "a_1 = \\cdots = a_g, \\quad b_1 = \\cdots = b_g, \\quad x_{0,1} = \\cdots = x_{0,g}", "h1": "\\text{some curve differs}", "texto": "With groups, one common curve describes them all. Extra-sum-of-squares F test against the model with a curve per group; then one test per common parameter." }
    ],
    "supuestos": [
      { "nombre": "Correct shape (sharp or gradual plateau)", "como": "Look at the curve over the points and the plot of residuals vs. fitted values; compare the models with “Lowest AIC”.", "verificar": null, "siFalla": "If the residuals show a curve, try another model; if yield falls at the highest rates, none of these describes it and a polynomial regression is better.", "alternativa": "regresion-polinomial" },
      { "nombre": "Constant variance", "como": "Plot of residuals vs. fitted values: the cloud should have the same width.", "verificar": null, "siFalla": "Use a weights column (for example, the inverse of the variance of each rate).", "alternativa": null },
      { "nombre": "Independence and negligible block effect", "como": "The model does not include the blocks: their variation stays in the error.", "verificar": null, "siFalla": "If blocks differ a lot, analyze the shape of the response with orthogonal polynomials within the block design.", "alternativa": "polinomios" },
      { "nombre": "Approximately normal errors", "como": "The checklist counts the residuals beyond 3σ.", "verificar": null, "siFalla": "Check those observations; the intervals and F tests rely on this approximation.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "dosis", "tipo": "continuous numeric (zero or positive)", "papel": "rate (x)" },
        { "nombre": "hibrido", "tipo": "factor with k levels (optional)", "papel": "group: one curve per level" },
        { "nombre": "weights", "tipo": "positive continuous numeric (optional)", "papel": "weights" }
      ],
      "minimo": "At least 4 rates (better 5 or 6), with several in the zone where the response levels off; with 4 rates the linear-plateau break falls between two of them and its interval is wide.",
      "balance": "Rows with missing values are dropped; the replicates of each rate are fitted through their weighted mean, with the same result. Blocks do not enter the model.",
      "notaFormato": "Long format: one row per plot, with the rate in its real units. The prices of the product (per unit of yield) and of the input (per unit of rate) are typed in the form, in the same currency.",
      "errores": [
        "Typing the prices in units that differ from the data (yield in t/ha and price per kg): the price ratio and the economic rate come out wrong.",
        "Testing only rates below the optimum: the plateau is not observed and the model cannot estimate it.",
        "Choosing the model only by its R²: models with almost the same R² give very different optimum rates; compare their AIC and their agronomic sense.",
        "Coding the rates (1, 2, 3, 4) instead of using their values."
      ]
    },
    "interpretacion": {
      "orden": [
        "If you asked for “Lowest AIC”, look at the model comparison: with ΔAIC below 2, two models describe the data almost equally well and you should check whether their optimum rates differ.",
        "Check the checklist and the fitted curve over the points.",
        "Read the optimum rate (x0 in linear-plateau, or the derived value in quadratic-plateau) and the plateau value, with their intervals.",
        "If you gave the prices, read the economic optimum rate and the response at that rate.",
        "With groups, read the common-curve test and which parameter differs."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The yield of the three hybrids was best described by the linear-plateau model (Akaike weight = 0.75). The curves differed (F(6, 39) = 12.4, p < 0.001): the plateau was 6.3 t/ha in H-40 and 7.2 t/ha in H-66, reached with 102 and 96 kg/ha of nitrogen, respectively.”",
      "guias": ["aic", "delta-aic", "peso-akaike", "ic", "F", "r2"]
    },
    "limitaciones": [
      "It does not include the blocks of the experiment: if they matter, analyze the rate with orthogonal polynomials within the block design.",
      "In linear-plateau the intervals are always Wald intervals (the break cannot be profiled), and the economic rate equals x0 as long as the slope pays for the input.",
      "The economic rate depends on current prices: recompute it if they change.",
      "None of these models describes a yield drop at excessive rates; for that use a polynomial regression."
    ],
    "referencias": [
      "Cerrato, M. E., & Blackmer, A. M. (1990). Comparison of models for describing corn yield response to nitrogen fertilizer. Agronomy Journal, 82(1), 138–143.",
      "Anderson, R. L., & Nelson, L. A. (1975). A family of models involving intersecting straight lines and concomitant experimental designs useful in evaluating response to fertilizer nutrients. Biometrics, 31(2), 303–318.",
      "Archontoulis, S. V., & Miguez, F. E. (2015). Nonlinear regression models and applications in agricultural research. Agronomy Journal, 107(2), 786–798.",
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley."
    ]
  }
});
