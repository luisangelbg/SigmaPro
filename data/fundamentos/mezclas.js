SP_FICHA({
  "id": "mezclas",
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["superficie"],
  "relacionados": ["diseno-superficie", "superficie-respuesta", "deseabilidad", "regresion-lineal"],
  "ejemplo": { "conjunto": "hilo-mezcla", "entradas": { "respuesta": "alargamiento", "componentes": ["polietileno", "poliestireno", "polipropileno"] }, "opciones": { "modelo": "cuadratico", "objetivo": "maximo" } },
  "formato": {
    "largo": [["polietileno", "poliestireno", "polipropileno", "alargamiento"], ["1", "0", "0", "11"], ["1", "0", "0", "12.4"], ["0.5", "0.5", "0", "15"], ["0.5", "0.5", "0", "14.8"], ["0.5", "0.5", "0", "16.1"], ["0", "1", "0", "8.8"], ["0", "1", "0", "10"], ["0", "0.5", "0.5", "10"]],
    "ancho": null
  },
  "es": {
    "alias": ["Experimentos con mezclas", "Modelos de Scheffé", "Polinomios canónicos de Scheffé", "Diseños simplex"],
    "paraQue": "Analiza respuestas que dependen de las proporciones de los componentes de una mezcla (sustratos, raciones, formulaciones) y encuentra la mejor mezcla.",
    "preguntas": [
      "¿Qué proporción de tierra de monte, arena y composta da el mayor crecimiento de plántula de chile en almácigo?",
      "¿Mezclar dos pastos en el ensilado da más proteína de la que se espera de cada uno por separado (sinergia)?",
      "¿Qué combinación de tres harinas en una ración da la mayor ganancia de peso por kilo de alimento?"
    ],
    "teoria": [
      "En una mezcla importan las proporciones, no las cantidades: si sube un componente, otro tiene que bajar, porque todos suman 1 (o 100 %, o la masa total). Por eso no se usa un polinomio ordinario con intercepto, que tendría términos redundantes, sino los polinomios canónicos de Scheffé, sin intercepto.",
      "En el modelo lineal, cada coeficiente β_i es la respuesta del componente puro, y la de una mezcla es el promedio de las de sus componentes ponderado por sus proporciones. El cuadrático agrega un término β_ij·x_i·x_j por cada par: si es positivo, la mezcla da más de lo que suman sus partes (sinergia); si es negativo, menos (antagonismo). El cúbico especial agrega β_ijk·x_i·x_j·x_k para las mezclas de tres componentes.",
      "SigmaPro divide cada fila entre su suma, así que acepta proporciones, porcentajes o cantidades con el mismo total, y revisa que todas las filas sumen lo mismo. Ajusta el modelo por mínimos cuadrados; el análisis de varianza y la R² se calculan contra la media, porque la suma constante deja a la media dentro del modelo. Si hay mezclas repetidas, prueba la falta de ajuste contra su error puro. Al final busca la mezcla de mayor (o menor) respuesta en todo el simplex, en cada cara y en los vértices, con su intervalo de confianza."
    ],
    "modelo": {
      "tex": "y = \\sum_{i=1}^{q} \\beta_i x_i + \\sum_{i<j} \\beta_{ij} x_i x_j + \\sum_{i<j<k} \\beta_{ijk} x_i x_j x_k + \\varepsilon, \\quad \\sum_{i=1}^{q} x_i = 1",
      "terminos": [
        ["x_i", "la proporción del componente i (de 0 a 1)"],
        ["\\beta_i", "la respuesta estimada del componente i puro"],
        ["\\beta_{ij}", "el efecto de la mezcla de i con j: sinergia si es positivo, antagonismo si es negativo (modelo cuadrático)"],
        ["\\beta_{ijk}", "el efecto de la mezcla de tres componentes (cúbico especial)"],
        ["\\varepsilon", "el error, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_q \\text{ y todos los } \\beta_{ij} = 0", "h1": "\\text{la respuesta cambia con la mezcla}", "texto": "F del modelo contra la media, con p − 1 grados de libertad (p, el número de coeficientes)." },
      { "h0": "\\beta_{ij} = 0", "h1": "\\beta_{ij} \\ne 0", "texto": "Prueba t de cada término de mezcla; la conclusión señala las sinergias y los antagonismos significativos." },
      { "h0": "\\text{el modelo describe la respuesta}", "h1": "\\text{hace falta un modelo con más términos}", "texto": "Falta de ajuste contra el error puro de las mezclas repetidas; si hay tantas mezclas distintas como coeficientes, no se puede probar." }
    ],
    "supuestos": [
      { "nombre": "Los componentes suman una constante", "como": "SigmaPro lo revisa al calcular: si alguna fila no suma lo mismo o hay proporciones negativas, se detiene con un aviso.", "verificar": null, "siFalla": "Si también varía la cantidad total, no es un experimento de mezclas: analiza las cantidades como factores de una superficie de respuesta.", "alternativa": "superficie-respuesta" },
      { "nombre": "El modelo elegido capta la forma de la respuesta", "como": "Semáforo «Falta de ajuste» contra el error puro de las mezclas repetidas (gris si no hay con qué probarla).", "verificar": null, "siFalla": "Pasa del lineal al cuadrático o al cúbico especial; necesitas los puntos medios de las aristas y el centroide.", "alternativa": null },
      { "nombre": "Normalidad y varianza constante de los residuos", "como": "El semáforo «Observaciones atípicas» marca residuos mayores que 3σ; este análisis no incluye una prueba formal de normalidad.", "verificar": null, "siFalla": "Revisa las mezclas con residuos grandes o transforma la respuesta (Box-Cox en ↻ Transformar…).", "alternativa": null },
      { "nombre": "Independencia", "como": "La dan la preparación de cada mezcla por separado y el orden aleatorio; no se prueba con los datos.", "verificar": null, "siFalla": "Si mediste varias veces la misma mezcla preparada, promedia esas lecturas: no son repeticiones.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "alargamiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "polietileno, poliestireno, polipropileno", "tipo": "proporción (2 a 6 componentes que suman lo mismo en cada fila)", "papel": "componentes de la mezcla" }
      ],
      "minimo": "Más mezclas que coeficientes: el cuadrático con 3 componentes tiene 6 y el cúbico especial, 7. Repite algunas mezclas (vértices o centroide) para tener error puro y probar la falta de ajuste.",
      "balance": "Las filas con faltantes se excluyen. No se exige balance, pero el cuadrático necesita los puntos medios de las aristas y el cúbico especial, el centroide de cada cara de tres componentes; si faltan, la app avisa que no puede estimar el modelo.",
      "notaFormato": "Formato largo: una fila por mezcla preparada, una columna por componente (proporción, porcentaje o cantidad) y una para la respuesta.",
      "errores": [
        "Incluir como componente algo que no forma parte del total, como el agua de riego o un fertilizante que se aplica aparte.",
        "Capturar porcentajes que por redondeo no suman 100: ajusta las cifras para que todas las filas sumen lo mismo.",
        "Contar como repeticiones varias lecturas de la misma mezcla.",
        "Leer β_i como el efecto aislado de un componente: en una mezcla no se puede subir uno sin bajar otro."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: falta de ajuste y residuos atípicos.",
        "Lee la F del modelo en el análisis de varianza y la R² ajustada en el cuadro de ajuste.",
        "En los coeficientes de Scheffé, compara los componentes puros (β_i) y busca los términos de mezcla significativos: sinergia si son positivos, antagonismo si son negativos.",
        "Lee la mejor mezcla con su respuesta estimada e intervalo; con tres componentes, ubícala en el triángulo, y usa la traza de Cox para ver cuánto pesa cada componente."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El modelo cuadrático de Scheffé explicó el 95 % de la variación del alargamiento (R² ajustada = 0.92). La mezcla de polietileno con poliestireno mostró sinergia (β = 19.0, p < 0.001), igual que la de polietileno con polipropileno (β = 11.4, p = 0.002), y la de poliestireno con polipropileno, antagonismo (β = −9.6, p = 0.005). La mejor mezcla estimada fue 29 % de polietileno y 71 % de polipropileno, con un alargamiento de 17.4 (IC 95 %: 16.4 a 18.4)».",
      "guias": ["F", "r2-ajustada", "coeficiente", "t", "falta-ajuste", "ic"]
    },
    "limitaciones": [
      "Si los componentes tienen límites (por ejemplo, la arena entre 10 y 40 %), la región ya no es el simplex completo y la mejor mezcla que da la app puede caer en una zona que no probaste.",
      "La deseabilidad de SigmaPro trabaja con factores de superficie, no con componentes de mezcla: para varias respuestas de una mezcla, compara sus mejores mezclas por separado.",
      "Si además de la mezcla cambian factores de proceso (dosis total, riego), el modelo combinado de mezcla y proceso no está en este análisis.",
      "Un β_ij grande no significa un cambio grande en la respuesta: el producto x_i·x_j vale a lo más 1/4."
    ],
    "referencias": [
      "Scheffé, H. (1958). Experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 20(2), 344–360.",
      "Scheffé, H. (1963). The simplex-centroid design for experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 25(2), 235–263.",
      "Cox, D. R. (1971). A note on polynomial response functions for mixtures. Biometrika, 58(1), 155–159.",
      "Cornell, J. A. (2002). Experiments with mixtures: Designs, models, and the analysis of mixture data (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Mixture experiments", "Scheffé models", "Scheffé canonical polynomials", "Simplex designs"],
    "paraQue": "Analyzes responses that depend on the proportions of the components of a mixture (substrates, rations, formulations) and finds the best mixture.",
    "preguntas": [
      "Which proportion of forest soil, sand and compost gives the greatest growth of chili pepper seedlings in the nursery?",
      "Does mixing two grasses in silage give more protein than expected from each one separately (synergy)?",
      "Which combination of three meals in a ration gives the greatest weight gain per kilogram of feed?"
    ],
    "teoria": [
      "In a mixture the proportions matter, not the amounts: if one component goes up, another must go down, because they all add up to 1 (or 100%, or the total mass). That is why an ordinary polynomial with an intercept, which would have redundant terms, is not used; instead, Scheffé canonical polynomials without an intercept are used.",
      "In the linear model, each coefficient β_i is the response of the pure component, and that of a mixture is the average of its components weighted by their proportions. The quadratic model adds a term β_ij·x_i·x_j for each pair: if it is positive, the mixture gives more than the sum of its parts (synergy); if negative, less (antagonism). The special cubic adds β_ijk·x_i·x_j·x_k for three-component blends.",
      "SigmaPro divides each row by its sum, so it accepts proportions, percentages or amounts with the same total, and checks that every row has the same sum. It fits the model by least squares; the analysis of variance and R² are computed against the mean, because the constant sum keeps the mean inside the model. If there are replicated mixtures, it tests lack of fit against their pure error. Finally it searches for the mixture with the highest (or lowest) response over the whole simplex, on each face and at the vertices, with its confidence interval."
    ],
    "modelo": {
      "tex": "y = \\sum_{i=1}^{q} \\beta_i x_i + \\sum_{i<j} \\beta_{ij} x_i x_j + \\sum_{i<j<k} \\beta_{ijk} x_i x_j x_k + \\varepsilon, \\quad \\sum_{i=1}^{q} x_i = 1",
      "terminos": [
        ["x_i", "the proportion of component i (from 0 to 1)"],
        ["\\beta_i", "the estimated response of pure component i"],
        ["\\beta_{ij}", "the effect of blending i with j: synergy if positive, antagonism if negative (quadratic model)"],
        ["\\beta_{ijk}", "the effect of the three-component blend (special cubic)"],
        ["\\varepsilon", "the error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_q \\text{ and all } \\beta_{ij} = 0", "h1": "\\text{the response changes with the mixture}", "texto": "Model F against the mean, with p − 1 degrees of freedom (p, the number of coefficients)." },
      { "h0": "\\beta_{ij} = 0", "h1": "\\beta_{ij} \\ne 0", "texto": "t test for each blending term; the conclusion points out the significant synergies and antagonisms." },
      { "h0": "\\text{the model describes the response}", "h1": "\\text{a model with more terms is needed}", "texto": "Lack of fit against the pure error of the replicated mixtures; if there are as many distinct mixtures as coefficients, it cannot be tested." }
    ],
    "supuestos": [
      { "nombre": "The components add up to a constant", "como": "SigmaPro checks it when computing: if any row has a different sum or there are negative proportions, it stops with a warning.", "verificar": null, "siFalla": "If the total amount also varies, it is not a mixture experiment: analyze the amounts as factors of a response surface.", "alternativa": "superficie-respuesta" },
      { "nombre": "The chosen model captures the shape of the response", "como": "“Lack of fit” in the assumptions checklist, against the pure error of the replicated mixtures (gray if it cannot be tested).", "verificar": null, "siFalla": "Move from the linear to the quadratic or special cubic model; you need the edge midpoints and the centroid.", "alternativa": null },
      { "nombre": "Normality and constant variance of residuals", "como": "“Outlying observations” in the checklist flags residuals beyond 3σ; this analysis has no formal normality test.", "verificar": null, "siFalla": "Review the mixtures with large residuals or transform the response (Box-Cox in ↻ Transform…).", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from preparing each mixture separately and running them in random order; it is not tested with the data.", "verificar": null, "siFalla": "If you measured the same prepared mixture several times, average those readings: they are not replicates.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "alargamiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "polietileno, poliestireno, polipropileno", "tipo": "proportion (2 to 6 components with the same sum in every row)", "papel": "mixture components" }
      ],
      "minimo": "More mixtures than coefficients: the quadratic model with 3 components has 6 and the special cubic, 7. Replicate some mixtures (vertices or centroid) to get pure error and test lack of fit.",
      "balance": "Rows with missing values are excluded. Balance is not required, but the quadratic model needs the edge midpoints and the special cubic the centroid of each three-component face; if they are missing, the app warns that it cannot estimate the model.",
      "notaFormato": "Long format: one row per prepared mixture, one column per component (proportion, percentage or amount) and one for the response.",
      "errores": [
        "Including as a component something that is not part of the total, such as irrigation water or a fertilizer applied separately.",
        "Entering percentages that do not add up to 100 because of rounding: adjust the figures so every row has the same sum.",
        "Counting several readings of the same mixture as replicates.",
        "Reading β_i as the isolated effect of a component: in a mixture one cannot go up without another going down."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: lack of fit and outlying residuals.",
        "Read the model F in the analysis of variance and the adjusted R² in the fit table.",
        "In the Scheffé coefficients, compare the pure components (β_i) and look for significant blending terms: synergy if positive, antagonism if negative.",
        "Read the best mixture with its estimated response and interval; with three components, locate it in the triangle, and use the Cox trace to see how much each component weighs."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The quadratic Scheffé model explained 95% of the variation in elongation (adjusted R² = 0.92). The polyethylene–polystyrene blend showed synergy (β = 19.0, p < 0.001), as did the polyethylene–polypropylene blend (β = 11.4, p = 0.002), and the polystyrene–polypropylene blend, antagonism (β = −9.6, p = 0.005). The best estimated mixture was 29% polyethylene and 71% polypropylene, with an elongation of 17.4 (95% CI: 16.4 to 18.4).”",
      "guias": ["F", "r2-ajustada", "coeficiente", "t", "falta-ajuste", "ic"]
    },
    "limitaciones": [
      "If the components have bounds (for example, sand between 10 and 40%), the region is no longer the full simplex and the best mixture the app gives may fall in a zone you did not test.",
      "SigmaPro's desirability works with surface factors, not mixture components: for several responses of a mixture, compare their best mixtures separately.",
      "If process factors (total rate, irrigation) change along with the mixture, the combined mixture-process model is not in this analysis.",
      "A large β_ij does not mean a large change in the response: the product x_i·x_j is at most 1/4."
    ],
    "referencias": [
      "Scheffé, H. (1958). Experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 20(2), 344–360.",
      "Scheffé, H. (1963). The simplex-centroid design for experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 25(2), 235–263.",
      "Cox, D. R. (1971). A note on polynomial response functions for mixtures. Biometrika, 58(1), 155–159.",
      "Cornell, J. A. (2002). Experiments with mixtures: Designs, models, and the analysis of mixture data (3rd ed.). Wiley."
    ]
  }
});
