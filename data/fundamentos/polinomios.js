SP_FICHA({
  "id": "polinomios",
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca", "latino", "parcelas", "bib", "latice"],
  "relacionados": ["regresion-polinomial", "contrastes", "comparaciones-medias", "respuesta-meseta", "parcelas-divididas", "superficie-respuesta"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "diseno": "dbca", "respuesta": "rend", "tratamientos": ["hibrido", "dosis"], "bloque": "bloque", "comparar": ["dosis"] }, "opciones": { "grado": 2, "alfa": 0.05 } },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Polinomios ortogonales", "Contrastes de tendencia", "Análisis de tendencia", "Componentes lineal, cuadrático y cúbico"],
    "paraQue": "Describe cómo cambia la respuesta con la dosis (recta, curva con un máximo…) dentro del análisis de varianza del experimento y estima la dosis óptima.",
    "preguntas": [
      "¿El rendimiento del maíz crece en línea recta con el nitrógeno o llega a un máximo?",
      "¿Qué densidad de siembra de frijol da el mayor número de vainas por metro cuadrado?",
      "¿Cambia la forma de la respuesta a la lámina de riego entre variedades de trigo?"
    ],
    "teoria": [
      "Cuando los tratamientos son niveles de una variable cuantitativa (dosis de fertilizante, densidades, láminas de riego), comparar pares de dosis desperdicia información: lo interesante es la forma de la respuesta. Los polinomios ortogonales parten la suma de cuadrados del factor, con k − 1 grados de libertad, en componentes de un grado de libertad cada uno: lineal, cuadrático, cúbico, etc. Cada componente es un contraste entre las medias de las dosis y se prueba con una F (el cuadrado de su t) contra el error del diseño. Si solo el lineal es significativo, la respuesta es una recta; si también lo es el cuadrático, la curva tiene un máximo o un mínimo.",
      "SigmaPro calcula los coeficientes ortogonales con los valores reales de los niveles, así que sirven también con dosis desigualmente espaciadas (por ejemplo, 0, 50, 100 y 200 kg/ha), y prueba todos los componentes, de 1 a k − 1. Como trabaja sobre las medias marginales estimadas del diseño que elijas, promedia sobre los demás factores o repite el análisis dentro de cada nivel de otro, ajusta por bloques o parcelas perdidas y, en parcelas divididas, usa el error del estrato que corresponde con grados de libertad de Satterthwaite.",
      "Además ajusta a las medias de las dosis una curva del grado que elijas (recta, cuadrática o cúbica) y da su ecuación y su R². Con la cuadrática calcula la dosis del máximo o del mínimo, −b₁/(2b₂), y te avisa si cae fuera de las dosis probadas. Ese R² mide qué tanto sigue la curva a las medias, no a las parcelas."
    ],
    "modelo": {
      "tex": "L_j = \\sum_{i=1}^{k} c_{ij} \\hat{\\mu}_i, \\quad F_j = \\left( \\frac{\\hat{L}_j}{\\mathrm{EE}(\\hat{L}_j)} \\right)^2, \\quad \\hat{y} = b_0 + b_1 x + b_2 x^2, \\quad x_{\\text{óptimo}} = -\\frac{b_1}{2 b_2}",
      "terminos": [
        ["c_{ij}", "el coeficiente ortogonal de grado j para la dosis i, calculado con los valores reales de las dosis"],
        ["\\hat{\\mu}_i", "la media marginal estimada de la dosis i"],
        ["L_j", "el componente de grado j (1 lineal, 2 cuadrático, 3 cúbico…)"],
        ["F_j", "su prueba F con 1 y ν grados de libertad (ν, los del error)"],
        ["b_0, b_1, b_2", "los coeficientes de la curva ajustada a las medias de las dosis"],
        ["x_{\\text{óptimo}}", "la dosis del máximo (si b₂ < 0) o del mínimo (si b₂ > 0) de la curva cuadrática"]
      ]
    },
    "hipotesis": [
      { "h0": "L_j = 0", "h1": "L_j \\ne 0", "texto": "El componente de grado j no aporta a la forma de la respuesta. Un componente lineal significativo indica tendencia; uno cuadrático, curvatura." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "Son los del análisis de varianza del diseño: revísalos en «Revisar los supuestos del modelo» con los mismos tratamientos y bloques.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en Datos) o ajusta a los datos de las parcelas un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Varianzas iguales entre dosis", "como": "Pruebas de Levene, Brown-Forsythe y Bartlett en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si la varianza crece con la dosis, transforma la respuesta o usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Factor cuantitativo con al menos tres niveles", "como": "SigmaPro lo exige: los niveles deben ser números (dosis, densidades, días) y al menos tres.", "verificar": null, "siFalla": "Con dos niveles solo cabe la recta; con niveles cualitativos (variedades, productos), compara medias.", "alternativa": "comparaciones-medias" },
      { "nombre": "Una curva polinomial describe la respuesta", "como": "Compara las medias con la curva en la gráfica y revisa que los componentes de mayor grado no sean significativos.", "verificar": null, "siFalla": "Si la respuesta llega a una meseta o tiene forma de S, un modelo no lineal (lineal-meseta, Mitscherlich) describe mejor la biología.", "alternativa": "respuesta-meseta" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "dosis", "tipo": "factor con k niveles numéricos (k ≥ 3)", "papel": "factor cuantitativo que se descompone" },
        { "nombre": "hibrido", "tipo": "factor con a niveles", "papel": "otro factor de tratamiento (se promedia o se analiza dentro de cada nivel)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloque (diseño)" }
      ],
      "minimo": "Al menos 3 dosis (con 4 o 5 se ve mejor la curvatura) y 3 repeticiones por dosis. Con k dosis hay k − 1 componentes.",
      "balance": "Con parcelas perdidas se usan las medias ajustadas de cada dosis. La SC de cada componente solo se muestra en diseños de un solo error; en parcelas divididas se dan la F y su p con grados de libertad de Satterthwaite.",
      "notaFormato": "Formato largo, como en el diseño: la dosis va en una columna con sus valores numéricos (0, 60, 120, 180), y SigmaPro la trata como factor en el análisis de varianza.",
      "errores": [
        "Escribir las dosis como etiquetas (D1, D2, D3): SigmaPro necesita los valores reales para calcular los coeficientes.",
        "Extrapolar la dosis óptima fuera del intervalo de dosis probado.",
        "Leer el R² de la curva como precisión del experimento: es el ajuste a las medias, no a las parcelas.",
        "Ignorar un componente cúbico significativo y quedarse con la cuadrática solo porque da un óptimo."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa en el análisis de varianza del diseño la F de la dosis y su interacción con otros factores; si hay interacción, repite los polinomios dentro de cada nivel del otro factor.",
        "En el cuadro, busca el componente de mayor grado que sea significativo: ese es el grado de la curva.",
        "Lee en las notas la ecuación de la curva y su R², y mira la gráfica de las medias con la curva.",
        "Si la curva es cuadrática, lee la dosis del máximo o del mínimo y revisa si queda dentro de las dosis probadas."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La respuesta del rendimiento al nitrógeno tuvo componentes lineal (F(1, 33) = 410.2, p < 0.001) y cuadrático (F(1, 33) = 88.5, p < 0.001) significativos, pero no cúbico (p = 0.31). La curva ajustada, y = 4.5 + 0.030x − 0.0001x², alcanzó su máximo con 150 kg de N/ha (6.8 t/ha)».",
      "guias": ["F", "p", "sc", "r2", "gl"]
    },
    "limitaciones": [
      "Un polinomio no tiene sentido biológico fuera de las dosis probadas y puede curvarse de forma artificial: para respuestas con meseta usa los modelos de respuesta a la dosis con meseta.",
      "La dosis del máximo es la de mayor rendimiento, no la más rentable: la dosis económica, con precios del insumo y del producto, la da la respuesta con meseta.",
      "Con un solo factor cuantitativo y sin bloques puedes ajustar la curva a los datos individuales con regresión polinomial, que añade bandas de confianza y diagnóstico.",
      "Con dos factores cuantitativos (nitrógeno y fósforo) usa superficie de respuesta."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  },
  "en": {
    "alias": ["Orthogonal polynomials", "Trend contrasts", "Trend analysis", "Linear, quadratic and cubic components"],
    "paraQue": "Describes how the response changes with the rate (straight line, curve with a maximum…) within the analysis of variance of the experiment and estimates the optimum rate.",
    "preguntas": [
      "Does maize yield increase linearly with nitrogen or does it reach a maximum?",
      "Which bean seeding density gives the largest number of pods per square meter?",
      "Does the shape of the response to irrigation depth change among wheat varieties?"
    ],
    "teoria": [
      "When the treatments are levels of a quantitative variable (fertilizer rates, densities, irrigation depths), comparing pairs of rates wastes information: what matters is the shape of the response. Orthogonal polynomials split the factor sum of squares, with k − 1 degrees of freedom, into components of one degree of freedom each: linear, quadratic, cubic, and so on. Each component is a contrast among the rate means and is tested with an F (the square of its t) against the design error. If only the linear component is significant, the response is a straight line; if the quadratic one is too, the curve has a maximum or a minimum.",
      "SigmaPro computes the orthogonal coefficients from the actual level values, so they also work with unequally spaced rates (for example, 0, 50, 100 and 200 kg/ha), and it tests every component, from 1 to k − 1. Because it works on the estimated marginal means of the design you choose, it averages over the other factors or repeats the analysis within each level of another one, adjusts for blocks or missing plots and, in split-plot designs, uses the error of the corresponding stratum with Satterthwaite degrees of freedom.",
      "It also fits to the rate means a curve of the degree you choose (straight line, quadratic or cubic) and gives its equation and R². With the quadratic it computes the rate of the maximum or minimum, −b₁/(2b₂), and warns you if it falls outside the rates tested. That R² measures how closely the curve follows the means, not the plots."
    ],
    "modelo": {
      "tex": "L_j = \\sum_{i=1}^{k} c_{ij} \\hat{\\mu}_i, \\quad F_j = \\left( \\frac{\\hat{L}_j}{\\mathrm{SE}(\\hat{L}_j)} \\right)^2, \\quad \\hat{y} = b_0 + b_1 x + b_2 x^2, \\quad x_{\\text{optimum}} = -\\frac{b_1}{2 b_2}",
      "terminos": [
        ["c_{ij}", "the orthogonal coefficient of degree j for rate i, computed from the actual rate values"],
        ["\\hat{\\mu}_i", "the estimated marginal mean of rate i"],
        ["L_j", "the component of degree j (1 linear, 2 quadratic, 3 cubic…)"],
        ["F_j", "its F test with 1 and ν degrees of freedom (ν, those of the error)"],
        ["b_0, b_1, b_2", "the coefficients of the curve fitted to the rate means"],
        ["x_{\\text{optimum}}", "the rate of the maximum (if b₂ < 0) or the minimum (if b₂ > 0) of the quadratic curve"]
      ]
    },
    "hipotesis": [
      { "h0": "L_j = 0", "h1": "L_j \\ne 0", "texto": "The component of degree j does not contribute to the shape of the response. A significant linear component indicates a trend; a quadratic one, curvature." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "They are those of the design’s analysis of variance: check them in “Check the model assumptions” with the same treatments and blocks.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in Data) or fit a generalized linear model to the plot data.", "alternativa": "glm" },
      { "nombre": "Equal variances among rates", "como": "Levene, Brown-Forsythe and Bartlett tests in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If the variance grows with the rate, transform the response or use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "Quantitative factor with at least three levels", "como": "SigmaPro requires it: the levels must be numbers (rates, densities, days) and at least three.", "verificar": null, "siFalla": "With two levels only a straight line fits; with qualitative levels (varieties, products), compare means.", "alternativa": "comparaciones-medias" },
      { "nombre": "A polynomial curve describes the response", "como": "Compare the means with the curve in the plot and check that the higher-degree components are not significant.", "verificar": null, "siFalla": "If the response reaches a plateau or is S-shaped, a nonlinear model (linear-plateau, Mitscherlich) describes the biology better.", "alternativa": "respuesta-meseta" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "dosis", "tipo": "factor with k numeric levels (k ≥ 3)", "papel": "quantitative factor that is decomposed" },
        { "nombre": "hibrido", "tipo": "factor with a levels", "papel": "another treatment factor (averaged over or analyzed within each level)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "block (design)" }
      ],
      "minimo": "At least 3 rates (with 4 or 5 the curvature shows better) and 3 replicates per rate. With k rates there are k − 1 components.",
      "balance": "With missing plots the adjusted mean of each rate is used. The SS of each component is shown only in single-error designs; in split-plot designs the F and its p are given with Satterthwaite degrees of freedom.",
      "notaFormato": "Long format, as in the design: the rate goes in a column with its numeric values (0, 60, 120, 180), and SigmaPro treats it as a factor in the analysis of variance.",
      "errores": [
        "Typing the rates as labels (D1, D2, D3): SigmaPro needs the actual values to compute the coefficients.",
        "Extrapolating the optimum rate outside the range of rates tested.",
        "Reading the R² of the curve as the precision of the experiment: it is the fit to the means, not to the plots.",
        "Ignoring a significant cubic component and keeping the quadratic only because it gives an optimum."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check in the design’s analysis of variance the F of the rate and its interaction with other factors; if there is an interaction, repeat the polynomials within each level of the other factor.",
        "In the table, look for the highest-degree component that is significant: that is the degree of the curve.",
        "Read in the notes the equation of the curve and its R², and look at the plot of the means with the curve.",
        "If the curve is quadratic, read the rate of the maximum or minimum and check whether it lies within the rates tested."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The yield response to nitrogen had significant linear (F(1, 33) = 410.2, p < 0.001) and quadratic (F(1, 33) = 88.5, p < 0.001) components, but no cubic one (p = 0.31). The fitted curve, y = 4.5 + 0.030x − 0.0001x², reached its maximum at 150 kg N/ha (6.8 t/ha).”",
      "guias": ["F", "p", "sc", "r2", "gl"]
    },
    "limitaciones": [
      "A polynomial has no biological meaning outside the rates tested and can bend artificially: for responses with a plateau use the rate-response models with a plateau.",
      "The rate of the maximum is the one with the highest yield, not the most profitable: the economic rate, with input and product prices, is given by the plateau response.",
      "With a single quantitative factor and no blocks you can fit the curve to the individual data with polynomial regression, which adds confidence bands and diagnostics.",
      "With two quantitative factors (nitrogen and phosphorus) use response surface."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Little, T. M., & Hills, F. J. (1978). Agricultural experimentation: Design and analysis. Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  }
});
