SP_FICHA({
  "id": "dosis-respuesta",
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["dca", "ninguno"],
  "relacionados": ["respuesta-meseta", "curva-crecimiento", "glm-proporciones", "glm", "regresion-polinomial"],
  "ejemplo": { "conjunto": "herbicida-dosis", "entradas": { "respuesta": "peso_seco", "dosis": "dosis", "grupo": "herbicida" }, "opciones": { "modelo": "ll4" } },
  "formato": {
    "largo": [["herbicida", "rep", "dosis", "peso_seco"], ["Glifosato", "1", "0", "5.56"], ["Glifosato", "2", "0", "5.49"], ["Glifosato", "3", "0", "6.63"], ["Glifosato", "4", "0", "5.69"], ["Glifosato", "1", "15", "5.74"], ["Glifosato", "2", "15", "5.19"], ["Glifosato", "3", "15", "5.19"]],
    "ancho": null
  },
  "es": {
    "alias": ["Log-logístico", "Curva dosis-respuesta", "DE50", "Modelo de Brain-Cousens"],
    "paraQue": "Describe cómo baja una respuesta (peso seco, crecimiento) al aumentar la dosis de un herbicida, fungicida o tóxico, y estima las dosis que causan el 10, el 50 y el 90 % del efecto.",
    "preguntas": [
      "¿Qué dosis de glifosato reduce a la mitad el peso seco de la maleza, y es distinta la del glufosinato?",
      "¿Es resistente una población de maleza, es decir, necesita una DE50 varias veces mayor que la población susceptible?",
      "¿Estimula el crecimiento una dosis baja de un regulador antes de inhibirlo (hormesis)?"
    ],
    "teoria": [
      "La respuesta de una planta a dosis crecientes de un herbicida casi nunca es una recta: con dosis bajas casi no pasa nada, en una zona intermedia la respuesta cae rápido y con dosis altas se estabiliza en un mínimo. Graficada contra el logaritmo de la dosis, la curva es una S invertida. El modelo log-logístico de cuatro parámetros la describe con d, la respuesta sin herbicida; c, el límite inferior; e, la DE50 (la dosis que produce la mitad del efecto entre d y c), y b, la pendiente alrededor de la DE50.",
      "SigmaPro ajusta el log-logístico de 4 parámetros, el de 3 (con el límite inferior en cero) y el de Brain-Cousens de 5 o 4, que agrega un término f·x para el estímulo a dosis bajas (hormesis); en este último, si hay estímulo, la app calcula la dosis de máxima respuesta y la DE50 después del máximo, como el paquete drc de R. El ajuste es por mínimos cuadrados no lineales, y la DE10, la DE50 y la DE90 llevan su EE por el método delta y su intervalo de Wald.",
      "Con un factor de grupo (dos herbicidas, una población resistente y una susceptible), cada grupo tiene su curva y la prueba F de la suma de cuadrados extra dice si basta una curva común y cuál parámetro difiere. Si solo difiere e, las curvas son paralelas y una DE50 mayor indica menor potencia o resistencia. La opción «El de menor AIC» compara los cuatro modelos con los mismos datos."
    ],
    "modelo": {
      "tex": "y = c + \\frac{d - c}{1 + \\exp(b(\\log x - \\log e))} + \\varepsilon",
      "terminos": [
        ["y", "la respuesta (peso seco, altura, cobertura)"],
        ["x", "la dosis, incluido el testigo sin aplicar (x = 0)"],
        ["d", "el límite superior: la respuesta sin dosis"],
        ["c", "el límite inferior: la respuesta con dosis muy altas (0 en el modelo de 3 parámetros)"],
        ["e", "la DE50: la dosis con la mitad del efecto entre d y c"],
        ["b", "la pendiente alrededor de la DE50 (positiva cuando la respuesta baja)"],
        ["\\varepsilon", "el error, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "b_1 = \\cdots = b_g, \\quad c_1 = \\cdots = c_g, \\quad d_1 = \\cdots = d_g, \\quad e_1 = \\cdots = e_g", "h1": "\\text{alguna curva difiere}", "texto": "Con grupos, una curva común describe a todos. Prueba F de la suma de cuadrados extra contra el modelo con una curva por grupo; después, una prueba por parámetro: la de «e común» dice si las DE50 difieren." }
    ],
    "supuestos": [
      { "nombre": "Forma log-logística (sin estímulo a dosis bajas)", "como": "Mira la curva sobre los puntos con la dosis en escala logarítmica y la gráfica de residuos contra valores ajustados; compara modelos con «El de menor AIC».", "verificar": null, "siFalla": "Si las dosis bajas suben la respuesta por encima del testigo, usa Brain-Cousens; si el límite inferior es cero, el log-logístico de 3 parámetros.", "alternativa": null },
      { "nombre": "Varianza constante", "como": "Gráfica de residuos contra valores ajustados: con dosis altas, cuando las plantas mueren, la nube suele cerrarse.", "verificar": null, "siFalla": "Usa una columna de pesos (por ejemplo, el inverso de la varianza de cada dosis).", "alternativa": null },
      { "nombre": "Independencia de las unidades", "como": "La da el sorteo de las macetas o parcelas; no se prueba con los datos.", "verificar": null, "siFalla": "Si mediste varias plantas de una maceta, promédialas por maceta o pesa cada media por su número de plantas.", "alternativa": null },
      { "nombre": "Errores aproximadamente normales", "como": "El semáforo cuenta los residuos que pasan de 3σ.", "verificar": null, "siFalla": "Revisa esas observaciones; los intervalos y las pruebas F dependen de esta aproximación.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "peso_seco", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "dosis", "tipo": "numérica continua (cero o positiva)", "papel": "dosis (x)" },
        { "nombre": "herbicida", "tipo": "factor con k niveles (opcional)", "papel": "grupo: una curva por nivel" },
        { "nombre": "pesos", "tipo": "numérica continua positiva (opcional)", "papel": "pesos" }
      ],
      "minimo": "Al menos 5 o 6 dosis más el testigo sin aplicar, repartidas en escala geométrica (cada una el doble de la anterior) para cubrir toda la caída, con 3 o 4 repeticiones por dosis.",
      "balance": "Las filas con faltantes se quitan; las repeticiones de una misma dosis se ajustan sobre su media pesada, con el mismo resultado. Los grupos pueden tener dosis distintas.",
      "notaFormato": "Formato largo: una fila por maceta o unidad, con la dosis en sus unidades reales (no codificada) y el grupo en otra columna.",
      "errores": [
        "Codificar las dosis (1, 2, 3…) en lugar de usar su valor real: la DE50 sale en esas unidades sin sentido.",
        "Omitir el testigo sin aplicar: sin él, d queda mal estimado.",
        "Elegir dosis que no llegan al efecto máximo: c y la DE90 quedan sin acotar.",
        "Analizar las dosis como factor en un análisis de varianza: no da la DE50 y pierde la forma de la respuesta."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y la gráfica de la curva (marca «Dosis en escala logarítmica en la gráfica» para ver la S).",
        "Lee los parámetros con sus intervalos: d (testigo), c (mínimo), e (DE50) y b (pendiente).",
        "Lee los valores derivados: DE10, DE50 y DE90 con su intervalo; en Brain-Cousens, la dosis de máxima respuesta si hay hormesis.",
        "Con grupos, lee la prueba de una curva común y la de cada parámetro común; la de «e común» dice si las DE50 difieren."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El peso seco se ajustó a un modelo log-logístico de cuatro parámetros por herbicida (R² = 0.98). Las curvas difirieron solo en la DE50 (F(1, 48) = 29.4, p < 0.001): 75 g/ha (IC 95 %: 63 a 87) con glifosato y 174 g/ha (IC 95 %: 122 a 227) con glufosinato, unas 2.3 veces mayor».",
      "guias": ["coeficiente", "ee", "ic", "F", "sigma", "r2"]
    },
    "limitaciones": [
      "Es para respuestas continuas: si cuentas plantas muertas de n tratadas, la respuesta es binomial y va en el GLM por fórmula, con la dosis como covariable.",
      "No calcula la potencia relativa (el cociente de DE50) con su intervalo; la prueba de «e común» dice si las DE50 difieren.",
      "Los intervalos de las DE son de Wald, simétricos; una DE90 lejos de las dosis probadas puede tener un intervalo muy ancho.",
      "Trata las observaciones como independientes y no incluye bloques."
    ],
    "referencias": [
      "Seefeldt, S. S., Jensen, J. E., & Fuerst, E. P. (1995). Log-logistic analysis of herbicide dose-response relationships. Weed Technology, 9(2), 218–227.",
      "Ritz, C., Baty, F., Streibig, J. C., & Gerhard, D. (2015). Dose-response analysis using R. PLOS ONE, 10(12), e0146021.",
      "Brain, P., & Cousens, R. (1989). An equation to describe dose responses where there is stimulation of growth at low doses. Weed Research, 29(2), 93–96.",
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley."
    ]
  },
  "en": {
    "alias": ["Log-logistic", "Dose-response curve", "ED50", "Brain-Cousens model"],
    "paraQue": "Describes how a response (dry weight, growth) falls as the dose of a herbicide, fungicide or toxicant increases, and estimates the doses causing 10, 50 and 90% of the effect.",
    "preguntas": [
      "What glyphosate dose halves the weed dry weight, and is it different for glufosinate?",
      "Is a weed population resistant, that is, does it need an ED50 several times larger than the susceptible population?",
      "Does a low dose of a growth regulator stimulate growth before inhibiting it (hormesis)?"
    ],
    "teoria": [
      "A plant’s response to increasing doses of a herbicide is almost never a straight line: at low doses almost nothing happens, in an intermediate zone the response drops quickly and at high doses it levels off at a minimum. Plotted against the logarithm of the dose, the curve is an inverted S. The four-parameter log-logistic model describes it with d, the response without herbicide; c, the lower limit; e, the ED50 (the dose producing half the effect between d and c), and b, the slope around the ED50.",
      "SigmaPro fits the 4-parameter log-logistic, the 3-parameter one (with the lower limit at zero) and the 5- or 4-parameter Brain-Cousens, which adds an f·x term for stimulation at low doses (hormesis); in the latter, if there is stimulation, the app computes the dose of maximum response and the ED50 beyond the maximum, as R’s drc package does. The fit is by nonlinear least squares, and the ED10, ED50 and ED90 come with their SE by the delta method and their Wald interval.",
      "With a group factor (two herbicides, a resistant and a susceptible population), each group gets its curve and the extra-sum-of-squares F test says whether one common curve is enough and which parameter differs. If only e differs, the curves are parallel and a larger ED50 means lower potency or resistance. The “Lowest AIC” option compares the four models on the same data."
    ],
    "modelo": {
      "tex": "y = c + \\frac{d - c}{1 + \\exp(b(\\log x - \\log e))} + \\varepsilon",
      "terminos": [
        ["y", "the response (dry weight, height, cover)"],
        ["x", "the dose, including the untreated control (x = 0)"],
        ["d", "the upper limit: the response without dose"],
        ["c", "the lower limit: the response at very high doses (0 in the 3-parameter model)"],
        ["e", "the ED50: the dose with half the effect between d and c"],
        ["b", "the slope around the ED50 (positive when the response falls)"],
        ["\\varepsilon", "the error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "b_1 = \\cdots = b_g, \\quad c_1 = \\cdots = c_g, \\quad d_1 = \\cdots = d_g, \\quad e_1 = \\cdots = e_g", "h1": "\\text{some curve differs}", "texto": "With groups, one common curve describes them all. Extra-sum-of-squares F test against the model with a curve per group; then one test per parameter: the “common e” test says whether the ED50s differ." }
    ],
    "supuestos": [
      { "nombre": "Log-logistic shape (no stimulation at low doses)", "como": "Look at the curve over the points with the dose on a log scale and at the plot of residuals vs. fitted values; compare models with “Lowest AIC”.", "verificar": null, "siFalla": "If low doses raise the response above the control, use Brain-Cousens; if the lower limit is zero, the 3-parameter log-logistic.", "alternativa": null },
      { "nombre": "Constant variance", "como": "Plot of residuals vs. fitted values: at high doses, when plants die, the cloud often narrows.", "verificar": null, "siFalla": "Use a weights column (for example, the inverse of the variance of each dose).", "alternativa": null },
      { "nombre": "Independence of the units", "como": "It comes from randomizing pots or plots; it is not tested with the data.", "verificar": null, "siFalla": "If you measured several plants per pot, average them per pot or weight each mean by its number of plants.", "alternativa": null },
      { "nombre": "Approximately normal errors", "como": "The checklist counts the residuals beyond 3σ.", "verificar": null, "siFalla": "Check those observations; the intervals and F tests rely on this approximation.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "peso_seco", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "dosis", "tipo": "continuous numeric (zero or positive)", "papel": "dose (x)" },
        { "nombre": "herbicida", "tipo": "factor with k levels (optional)", "papel": "group: one curve per level" },
        { "nombre": "weights", "tipo": "positive continuous numeric (optional)", "papel": "weights" }
      ],
      "minimo": "At least 5 or 6 doses plus the untreated control, spread on a geometric scale (each one double the previous) to cover the whole drop, with 3 or 4 replicates per dose.",
      "balance": "Rows with missing values are dropped; replicates of the same dose are fitted through their weighted mean, with the same result. Groups can have different doses.",
      "notaFormato": "Long format: one row per pot or unit, with the dose in its real units (not coded) and the group in another column.",
      "errores": [
        "Coding the doses (1, 2, 3…) instead of using their real value: the ED50 comes out in those meaningless units.",
        "Leaving out the untreated control: without it, d is poorly estimated.",
        "Choosing doses that do not reach the maximum effect: c and the ED90 are left unbounded.",
        "Analyzing the doses as a factor in an analysis of variance: it gives no ED50 and loses the shape of the response."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist and the plot of the curve (tick “Dose on a logarithmic scale in the plot” to see the S).",
        "Read the parameters with their intervals: d (control), c (minimum), e (ED50) and b (slope).",
        "Read the derived values: ED10, ED50 and ED90 with their interval; in Brain-Cousens, the dose of maximum response if there is hormesis.",
        "With groups, read the common-curve test and the test for each common parameter; the “common e” test says whether the ED50s differ."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Dry weight was fitted to a four-parameter log-logistic model by herbicide (R² = 0.98). The curves differed only in the ED50 (F(1, 48) = 29.4, p < 0.001): 75 g/ha (95% CI: 63 to 87) with glyphosate and 174 g/ha (95% CI: 122 to 227) with glufosinate, about 2.3 times larger.”",
      "guias": ["coeficiente", "ee", "ic", "F", "sigma", "r2"]
    },
    "limitaciones": [
      "It is for continuous responses: if you count dead plants out of n treated, the response is binomial and goes in the formula GLM, with the dose as a covariate.",
      "It does not compute the relative potency (the ratio of ED50s) with its interval; the “common e” test says whether the ED50s differ.",
      "The ED intervals are Wald intervals, symmetric; an ED90 far from the doses tested can have a very wide interval.",
      "It treats the observations as independent and does not include blocks."
    ],
    "referencias": [
      "Seefeldt, S. S., Jensen, J. E., & Fuerst, E. P. (1995). Log-logistic analysis of herbicide dose-response relationships. Weed Technology, 9(2), 218–227.",
      "Ritz, C., Baty, F., Streibig, J. C., & Gerhard, D. (2015). Dose-response analysis using R. PLOS ONE, 10(12), e0146021.",
      "Brain, P., & Cousens, R. (1989). An equation to describe dose responses where there is stimulation of growth at low doses. Weed Research, 29(2), 93–96.",
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley."
    ]
  }
});
