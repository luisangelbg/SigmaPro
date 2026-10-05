SP_FICHA({
  "id": "deseabilidad",
  "familia": "superficies",
  "respuesta": "multivariada",
  "estructura": "continua",
  "disenos": ["superficie"],
  "relacionados": ["superficie-respuesta", "diseno-superficie", "ascenso-pronunciado", "mezclas", "manova"],
  "ejemplo": { "conjunto": "fruto-respuestas", "entradas": { "respuestas": ["rendimiento", "costo", "ph"], "factores": ["N", "riego"] }, "opciones": { "metas": ["max", "min", "valor"], "inferiores": [70, 11, 6], "superiores": [86, 15, 7], "objetivos": [0, 0, 6.5], "exponentes": [1, 1, 1], "exponentes2": [1, 1, 1], "importancias": [1, 1, 1], "region": "cubo" } },
  "formato": {
    "largo": [["N", "riego", "rendimiento", "costo", "ph"], ["140", "20", "66.03", "12.9", "5.43"], ["220", "20", "75.01", "15.61", "6"], ["140", "30", "70.11", "11.07", "6.38"], ["220", "30", "85.48", "14.12", "7.39"], ["123.43", "25", "62.97", "11.67", "5.57"], ["236.57", "25", "81.71", "15.96", "6.61"], ["180", "17.93", "70.89", "14.34", "5.84"], ["180", "32.07", "79.05", "11.93", "7.12"]],
    "ancho": null
  },
  "es": {
    "alias": ["Función de deseabilidad", "Optimización de varias respuestas", "Deseabilidad de Derringer y Suich"],
    "paraQue": "Busca la combinación de factores que deja a varias respuestas a la vez lo más cerca posible de lo que quieres: una alta, otra baja y otra en un valor meta.",
    "preguntas": [
      "¿Qué dosis de nitrógeno y lámina de riego dan un rendimiento alto de fruto con un costo bajo y un pH cercano a 6.5?",
      "¿Qué temperatura y tiempo de deshidratado conservan más vitamina C sin pasar de cierta humedad final?",
      "¿Qué dosis de dos fungicidas reducen la severidad de la enfermedad sin bajar el rendimiento?"
    ],
    "teoria": [
      "Casi nunca interesa una sola respuesta: se quiere rendimiento alto, pero también costo bajo y una calidad dentro de norma, y el óptimo de cada una suele estar en un lugar distinto. La función de deseabilidad convierte cada respuesta en un número d entre 0 y 1: 0 si queda fuera de lo aceptable y 1 si llega a la meta. Para maximizar, d sube de 0 en el límite inferior L a 1 en el superior U; para minimizar, al revés; para un valor meta T, sube de L a T y baja de T a U. Un exponente mayor que 1 exige acercarse más a la meta para tener una d alta.",
      "La deseabilidad global D es la media geométrica de las d, ponderadas por la importancia de cada respuesta. Si una sola respuesta queda fuera de sus límites, D vale 0: ninguna respuesta buena compensa a otra inaceptable.",
      "SigmaPro ajusta a cada respuesta su modelo de segundo orden con los mismos factores codificados, calcula D con las predicciones y busca la combinación de mayor D con el método simplex de Nelder y Mead, que arranca desde cada punto del diseño y desde el centro. La búsqueda se limita al cubo de los niveles del experimento o a la esfera del diseño (para un central compuesto rotable), para no extrapolar."
    ],
    "modelo": {
      "tex": "D = \\left( \\prod_{i=1}^{m} d_i^{r_i} \\right)^{1 / \\sum r_i}, \\quad d_i = \\left( \\frac{\\hat{y}_i - L_i}{U_i - L_i} \\right)^{s_i}",
      "terminos": [
        ["D", "la deseabilidad global, de 0 a 1"],
        ["d_i", "la deseabilidad de la respuesta i (la fórmula mostrada es la de maximizar, entre L_i y U_i)"],
        ["\\hat{y}_i", "la respuesta i predicha por su modelo de segundo orden"],
        ["L_i, U_i", "los límites inferior y superior aceptables de la respuesta i"],
        ["s_i", "el exponente: 1 es lineal; mayor que 1 exige acercarse más a la meta"],
        ["r_i", "la importancia de la respuesta i"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Cada respuesta está bien descrita por su modelo de segundo orden", "como": "El cuadro «Respuestas en ese punto» da la R² de cada modelo y la conclusión avisa si alguna es menor que 0.7. Revisa cada respuesta por separado en superficie de respuesta (falta de ajuste y residuos).", "verificar": "superficie-respuesta", "siFalla": "Transforma esa respuesta o dale menos importancia; si su modelo no sirve, la D tampoco.", "alternativa": null },
      { "nombre": "Límites y metas con sentido agronómico", "como": "No se prueba con los datos: D depende de los límites, la meta, los exponentes y las importancias que escribes.", "verificar": null, "siFalla": "Prueba otros límites razonables y comprueba si la combinación elegida cambia mucho; si D = 0 en toda la región, afloja algún límite.", "alternativa": null },
      { "nombre": "La mejor combinación está dentro de la región del experimento", "como": "La búsqueda se limita al cubo o a la esfera del diseño; las curvas de nivel de D muestran si el óptimo queda en el borde.", "verificar": null, "siFalla": "Si la mayor D está en el borde de la región, explora más allá con un nuevo diseño en esa dirección.", "alternativa": "ascenso-pronunciado" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento, costo, ph", "tipo": "numérica continua (1 a 6 respuestas)", "papel": "respuestas" },
        { "nombre": "N, riego", "tipo": "numérica continua (2 a 6 factores)", "papel": "factores del diseño" }
      ],
      "minimo": "El de una superficie de segundo orden: más corridas que coeficientes (6 con 2 factores, 10 con 3) y al menos tres niveles por factor, como en un central compuesto o un Box-Behnken.",
      "balance": "Se usan solo las filas con todas las respuestas y todos los factores; una fila con alguna respuesta faltante se excluye completa.",
      "notaFormato": "Formato largo: una fila por corrida, una columna por factor y una por respuesta. Para cada respuesta, el formulario pide la meta (la mayor, la menor o un valor meta), los límites inferior y superior, los exponentes y la importancia.",
      "errores": [
        "Poner límites que ninguna combinación alcanza: D vale 0 en toda la región.",
        "Combinar respuestas cuyos modelos son pobres (R² baja): la combinación «óptima» refleja ruido.",
        "Olvidar que d se calcula con la predicción del modelo y no con el valor observado: el cuadro de deseabilidad de cada corrida usa las predicciones."
      ]
    },
    "interpretacion": {
      "orden": [
        "Antes, revisa cada respuesta en superficie de respuesta: si un modelo es pobre, la deseabilidad no sirve.",
        "Lee la D de la mejor combinación y sus factores en unidades originales en «La combinación más deseable».",
        "En «Respuestas en ese punto», mira la predicción y la d de cada respuesta: la de d más baja es la que limita.",
        "Usa las curvas de nivel de D para ver qué tan amplia es la zona buena: si es plana, puedes elegir la combinación más barata o práctica dentro de ella."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con la función de deseabilidad (rendimiento máximo, costo mínimo y pH meta de 6.5), la mejor combinación fue 176 kg/ha de N y 25.9 cm de riego (D = 0.79), con un rendimiento estimado de 79.5 t/ha (d = 0.59), un costo de 11.7 (d = 0.82) y un pH de 6.5 (d = 1.00)».",
      "guias": ["deseabilidad", "r2"]
    },
    "limitaciones": [
      "D resume, pero esconde compromisos: revisa siempre cada respuesta en el punto elegido.",
      "Cada respuesta se modela con el segundo orden completo; si alguna necesita otro modelo (de mezcla o no lineal), este análisis no lo permite.",
      "No da la incertidumbre de la combinación óptima: confírmala con corridas nuevas.",
      "Para probar si los tratamientos difieren en varias respuestas a la vez, usa el MANOVA."
    ],
    "referencias": [
      "Harrington, E. C., Jr. (1965). The desirability function. Industrial Quality Control, 21(10), 494–498.",
      "Derringer, G., & Suich, R. (1980). Simultaneous optimization of several response variables. Journal of Quality Technology, 12(4), 214–219.",
      "Nelder, J. A., & Mead, R. (1965). A simplex method for function minimization. The Computer Journal, 7(4), 308–313.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Desirability function", "Multiple response optimization", "Derringer-Suich desirability"],
    "paraQue": "Searches for the combination of factors that brings several responses at once as close as possible to what you want: one high, another low and another at a target value.",
    "preguntas": [
      "Which nitrogen rate and irrigation depth give high fruit yield with low cost and a pH close to 6.5?",
      "Which drying temperature and time keep the most vitamin C without exceeding a given final moisture?",
      "Which rates of two fungicides reduce disease severity without lowering yield?"
    ],
    "teoria": [
      "A single response is rarely the only interest: high yield is wanted, but also low cost and quality within standards, and the optimum of each one is usually in a different place. The desirability function turns each response into a number d between 0 and 1: 0 if it falls outside what is acceptable and 1 if it reaches the goal. To maximize, d rises from 0 at the lower limit L to 1 at the upper limit U; to minimize, the other way around; for a target value T, it rises from L to T and falls from T to U. An exponent greater than 1 requires getting closer to the goal to obtain a high d.",
      "The overall desirability D is the geometric mean of the d values, weighted by the importance of each response. If a single response falls outside its limits, D is 0: no good response makes up for an unacceptable one.",
      "SigmaPro fits each response with its own second-order model on the same coded factors, computes D from the predictions and searches for the combination with the highest D with the Nelder-Mead simplex method, starting from each design point and from the center. The search is restricted to the cube of the experiment levels or to the design sphere (for a rotatable central composite design), so as not to extrapolate."
    ],
    "modelo": {
      "tex": "D = \\left( \\prod_{i=1}^{m} d_i^{r_i} \\right)^{1 / \\sum r_i}, \\quad d_i = \\left( \\frac{\\hat{y}_i - L_i}{U_i - L_i} \\right)^{s_i}",
      "terminos": [
        ["D", "the overall desirability, from 0 to 1"],
        ["d_i", "the desirability of response i (the formula shown is the one for maximizing, between L_i and U_i)"],
        ["\\hat{y}_i", "response i predicted by its second-order model"],
        ["L_i, U_i", "the lower and upper acceptable limits of response i"],
        ["s_i", "the exponent: 1 is linear; greater than 1 requires getting closer to the goal"],
        ["r_i", "the importance of response i"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Each response is well described by its second-order model", "como": "The “Responses at that point” table gives the R² of each model and the conclusion warns if any is below 0.7. Check each response separately in the response surface (lack of fit and residuals).", "verificar": "superficie-respuesta", "siFalla": "Transform that response or give it less importance; if its model is poor, so is D.", "alternativa": null },
      { "nombre": "Agronomically meaningful limits and goals", "como": "It is not tested with the data: D depends on the limits, target, exponents and importances you enter.", "verificar": null, "siFalla": "Try other reasonable limits and check whether the chosen combination changes much; if D = 0 over the whole region, relax some limit.", "alternativa": null },
      { "nombre": "The best combination lies inside the experimental region", "como": "The search is restricted to the design cube or sphere; the contour plot of D shows whether the optimum lies on the edge.", "verificar": null, "siFalla": "If the highest D is on the edge of the region, explore beyond it with a new design in that direction.", "alternativa": "ascenso-pronunciado" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento, costo, ph", "tipo": "continuous numeric (1 to 6 responses)", "papel": "responses" },
        { "nombre": "N, riego", "tipo": "continuous numeric (2 to 6 factors)", "papel": "design factors" }
      ],
      "minimo": "That of a second-order surface: more runs than coefficients (6 with 2 factors, 10 with 3) and at least three levels per factor, as in a central composite or Box-Behnken design.",
      "balance": "Only rows with every response and every factor are used; a row with any missing response is excluded entirely.",
      "notaFormato": "Long format: one row per run, one column per factor and one per response. For each response, the form asks for the goal (highest, lowest or a target value), the lower and upper limits, the exponents and the importance.",
      "errores": [
        "Setting limits that no combination reaches: D is 0 over the whole region.",
        "Combining responses whose models are poor (low R²): the “optimal” combination reflects noise.",
        "Forgetting that d is computed from the model prediction and not from the observed value: the desirability-of-each-run table uses the predictions."
      ]
    },
    "interpretacion": {
      "orden": [
        "First, check each response in the response surface: if a model is poor, desirability is useless.",
        "Read the D of the best combination and its factors in original units in “The most desirable combination”.",
        "In “Responses at that point”, look at the prediction and the d of each response: the one with the lowest d is the limiting one.",
        "Use the contour plot of D to see how wide the good zone is: if it is flat, you can choose the cheapest or most practical combination within it."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With the desirability function (maximum yield, minimum cost and a target pH of 6.5), the best combination was 176 kg/ha N and 25.9 cm of irrigation (D = 0.79), with an estimated yield of 79.5 t/ha (d = 0.59), a cost of 11.7 (d = 0.82) and a pH of 6.5 (d = 1.00).”",
      "guias": ["deseabilidad", "r2"]
    },
    "limitaciones": [
      "D summarizes, but hides trade-offs: always review each response at the chosen point.",
      "Each response is modeled with the full second-order model; if one needs another model (mixture or nonlinear), this analysis does not allow it.",
      "It gives no uncertainty for the optimal combination: confirm it with new runs.",
      "To test whether treatments differ in several responses at once, use MANOVA."
    ],
    "referencias": [
      "Harrington, E. C., Jr. (1965). The desirability function. Industrial Quality Control, 21(10), 494–498.",
      "Derringer, G., & Suich, R. (1980). Simultaneous optimization of several response variables. Journal of Quality Technology, 12(4), 214–219.",
      "Nelder, J. A., & Mead, R. (1965). A simplex method for function minimization. The Computer Journal, 7(4), 308–313.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley."
    ]
  }
});
