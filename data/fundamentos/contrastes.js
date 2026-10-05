SP_FICHA({
  "id": "contrastes",
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca", "latino", "parcelas", "bib", "latice"],
  "relacionados": ["comparaciones-medias", "polinomios", "medias-ajustadas", "dca", "dbca"],
  "ejemplo": { "conjunto": "venenos", "entradas": { "diseno": "dca", "respuesta": "tiempo", "tratamientos": ["veneno", "tratamiento"], "comparar": ["veneno"] }, "opciones": { "contrastes": "I y II vs III: 1 1 -2\nI vs II: 1 -1 0", "alfa": 0.05 } },
  "formato": {
    "largo": [["veneno", "tratamiento", "tiempo"], ["I", "A", "0.31"], ["I", "A", "0.45"], ["I", "A", "0.46"], ["I", "A", "0.43"], ["I", "B", "0.82"], ["I", "B", "1.1"], ["I", "B", "0.88"]],
    "ancho": null
  },
  "es": {
    "alias": ["Contrastes ortogonales", "Contrastes planeados", "Comparaciones planeadas", "Contrastes lineales"],
    "paraQue": "Prueba comparaciones que planeaste antes del experimento, como el testigo contra el resto o un grupo de productos contra otro.",
    "preguntas": [
      "¿Difiere el testigo sin fertilizar del promedio de los cuatro abonos probados?",
      "¿Rinden distinto los abonos orgánicos que los químicos y, entre los orgánicos, la composta que el estiércol?",
      "¿Reducen más la plaga los insecticidas biológicos que los de síntesis?"
    ],
    "teoria": [
      "Un contraste es una suma ponderada de las medias de los tratamientos, L = Σ cᵢμᵢ, con coeficientes que suman cero. Con los coeficientes 1 1 −2 comparas el promedio de los dos primeros niveles contra el tercero; con 1 −1 0, el primero contra el segundo. Cada contraste tiene un grado de libertad y responde una pregunta concreta, por lo que es más potente que comparar todos los pares cuando la pregunta se planeó antes de ver los datos.",
      "Dos contrastes son ortogonales cuando sus coeficientes cumplen Σ cᵢc′ᵢ/nᵢ = 0. Un juego de k − 1 contrastes ortogonales parte la suma de cuadrados del factor en piezas que no se traslapan y que suman exactamente la del factor. SigmaPro revisa esa condición con las repeticiones reales de cada nivel y te avisa si algún renglón no suma cero, porque entonces no compara medias sino que estima una combinación lineal de ellas.",
      "Los contrastes se calculan sobre las medias marginales estimadas del diseño que elijas, así que con parcelas perdidas o bloques incompletos usan las medias ajustadas. Cada uno lleva su estimación, su error estándar y una prueba t bilateral con los grados de libertad del error (F = t²); en diseños de un solo error se da además su suma de cuadrados, SC = t²·CM del error. En parcelas divididas, el error de cada contraste sale de su estrato con grados de libertad de Satterthwaite. Puedes repetir los mismos contrastes dentro de cada nivel de otro factor."
    ],
    "modelo": {
      "tex": "L = \\sum_{i=1}^{k} c_i \\mu_i, \\quad \\sum_{i=1}^{k} c_i = 0, \\quad t = \\frac{\\hat{L}}{\\mathrm{EE}(\\hat{L})}, \\quad SC_L = t^2 \\cdot CM_E",
      "terminos": [
        ["c_i", "el coeficiente del nivel i, en el orden de los niveles del factor"],
        ["\\mu_i", "la media del nivel i (la marginal estimada del diseño)"],
        ["\\hat{L}", "la estimación del contraste con las medias de tus datos"],
        ["\\mathrm{EE}(\\hat{L})", "su error estándar; con un solo error y r repeticiones vale √(CMerror·Σcᵢ²/r)"],
        ["SC_L", "la suma de cuadrados del contraste, con un grado de libertad"],
        ["CM_E", "el cuadrado medio del error del diseño"]
      ]
    },
    "hipotesis": [
      { "h0": "L = \\sum c_i \\mu_i = 0", "h1": "L \\ne 0", "texto": "Las dos partes que compara el contraste tienen la misma media. Prueba t bilateral con los grados de libertad del error, equivalente a una F con 1 grado de libertad en el numerador." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "Son los del análisis de varianza del diseño: revísalos en «Revisar los supuestos del modelo» con los mismos tratamientos y bloques.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en Datos); los contrastes se interpretan entonces en la escala transformada.", "alternativa": null },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "Pruebas de Levene, Brown-Forsythe y Bartlett en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "El contraste usa el error común: si un grupo es mucho más variable, la prueba puede engañar. Transforma la respuesta o usa un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Contrastes definidos antes de ver los datos", "como": "No se prueba con los datos: depende de cómo planeaste el análisis.", "verificar": null, "siFalla": "Si eliges un contraste porque los datos lo sugieren, su valor p es demasiado optimista: júzgalo con el criterio de Scheffé, que protege cualquier contraste (compara su F = t² con (k − 1) veces la F crítica con k − 1 y los gl del error). El Scheffé de «Comparaciones de medias» solo se aplica a pares de medias.", "alternativa": "comparaciones-medias" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "veneno", "tipo": "factor con k niveles", "papel": "factor cuyos niveles se contrastan" },
        { "nombre": "tratamiento", "tipo": "factor con b niveles", "papel": "otro factor de tratamiento del diseño" }
      ],
      "minimo": "Al menos 2 repeticiones por nivel (mejor 3 o más) y tantos coeficientes como niveles tenga el factor. Con k niveles puedes formar a lo más k − 1 contrastes ortogonales.",
      "balance": "Con datos desbalanceados los contrastes usan medias ajustadas, y la ortogonalidad se revisa con las repeticiones reales de cada nivel: coeficientes ortogonales con datos balanceados pueden dejar de serlo.",
      "notaFormato": "Formato largo, como el del diseño. Los contrastes se escriben en el formulario, uno por renglón, como «nombre: coeficientes» en el orden de los niveles que muestra SigmaPro (por ejemplo, «I y II vs III: 1 1 -2»).",
      "errores": [
        "Escribir los coeficientes en otro orden que el de los niveles del factor: revisa la nota «Coeficientes en el orden de los niveles».",
        "Usar coeficientes que no suman cero: así no comparas medias, sino que estimas una combinación lineal.",
        "Plantear más de k − 1 contrastes, o contrastes no ortogonales, y sumar sus SC como si partieran la del factor.",
        "Definir los contrastes después de ver qué medias quedaron más separadas."
      ]
    },
    "interpretacion": {
      "orden": [
        "Confirma en la nota del cuadro el orden de los niveles con que se leyeron los coeficientes.",
        "Lee la estimación de cada contraste: su signo dice qué lado tiene la media mayor.",
        "Mira t y p de cada contraste; en diseños de un solo error, la SC dice cuánto de la variación del factor explica.",
        "Revisa la nota de ortogonalidad antes de sumar o comparar sumas de cuadrados."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los abonos orgánicos superaron a los químicos en 0.42 t/ha (t(24) = 3.1, p = 0.005), mientras que la composta y el estiércol no difirieron entre sí (t(24) = 0.8, p = 0.43)».",
      "guias": ["t", "p", "sc", "ee", "F"]
    },
    "limitaciones": [
      "SigmaPro no ajusta los valores p de los contrastes por multiplicidad: si planteas muchos, interprétalos con cautela o ajústalos tú (Bonferroni: multiplica cada p por el número de contrastes); «Comparaciones de medias» solo ajusta comparaciones por pares.",
      "Para niveles cuantitativos (dosis, densidades), los polinomios ortogonales construyen por ti los contrastes de tendencia, también con niveles desigualmente espaciados.",
      "Se definen sobre los niveles de un solo factor; para contrastarlo en cada nivel de otro factor usa «Dentro de cada nivel de»."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Lenth, R. V. (2016). Least-squares means: The R package lsmeans. Journal of Statistical Software, 69(1), 1–33."
    ]
  },
  "en": {
    "alias": ["Orthogonal contrasts", "Planned contrasts", "Planned comparisons", "Linear contrasts"],
    "paraQue": "Tests comparisons you planned before the experiment, such as the control versus the rest or one group of products versus another.",
    "preguntas": [
      "Does the unfertilized control differ from the average of the four fertilizers tested?",
      "Do organic fertilizers yield differently from synthetic ones and, among the organic ones, compost from manure?",
      "Do biological insecticides reduce the pest more than synthetic ones?"
    ],
    "teoria": [
      "A contrast is a weighted sum of the treatment means, L = Σ cᵢμᵢ, with coefficients that add up to zero. With the coefficients 1 1 −2 you compare the average of the first two levels against the third; with 1 −1 0, the first against the second. Each contrast has one degree of freedom and answers a specific question, so it is more powerful than comparing all pairs when the question was planned before seeing the data.",
      "Two contrasts are orthogonal when their coefficients satisfy Σ cᵢc′ᵢ/nᵢ = 0. A set of k − 1 orthogonal contrasts splits the factor sum of squares into non-overlapping pieces that add up exactly to that of the factor. SigmaPro checks this condition with the actual replicates of each level and warns you if a row does not add up to zero, because then it does not compare means but estimates a linear combination of them.",
      "Contrasts are computed on the estimated marginal means of the design you choose, so with missing plots or incomplete blocks they use the adjusted means. Each one carries its estimate, its standard error and a two-sided t test with the error degrees of freedom (F = t²); in single-error designs its sum of squares is also given, SS = t²·error MS. In split-plot designs, the error of each contrast comes from its stratum, with Satterthwaite degrees of freedom. You can repeat the same contrasts within each level of another factor."
    ],
    "modelo": {
      "tex": "L = \\sum_{i=1}^{k} c_i \\mu_i, \\quad \\sum_{i=1}^{k} c_i = 0, \\quad t = \\frac{\\hat{L}}{\\mathrm{SE}(\\hat{L})}, \\quad SS_L = t^2 \\cdot MS_E",
      "terminos": [
        ["c_i", "the coefficient of level i, in the order of the factor levels"],
        ["\\mu_i", "the mean of level i (the estimated marginal mean of the design)"],
        ["\\hat{L}", "the estimate of the contrast from the means of your data"],
        ["\\mathrm{SE}(\\hat{L})", "its standard error; with a single error and r replicates it equals √(error MS·Σcᵢ²/r)"],
        ["SS_L", "the sum of squares of the contrast, with one degree of freedom"],
        ["MS_E", "the error mean square of the design"]
      ]
    },
    "hipotesis": [
      { "h0": "L = \\sum c_i \\mu_i = 0", "h1": "L \\ne 0", "texto": "The two parts compared by the contrast have the same mean. Two-sided t test with the error degrees of freedom, equivalent to an F with 1 numerator degree of freedom." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "They are those of the design’s analysis of variance: check them in “Check the model assumptions” with the same treatments and blocks.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in Data); the contrasts are then interpreted on the transformed scale.", "alternativa": null },
      { "nombre": "Equal variances among treatments", "como": "Levene, Brown-Forsythe and Bartlett tests in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "The contrast uses the common error: if one group is much more variable, the test can mislead. Transform the response or use a generalized linear model.", "alternativa": "glm" },
      { "nombre": "Contrasts defined before seeing the data", "como": "It is not tested with the data: it depends on how you planned the analysis.", "verificar": null, "siFalla": "If you choose a contrast because the data suggest it, its p-value is too optimistic: judge it with Scheffé’s criterion, which protects any contrast (compare its F = t² with k − 1 times the critical F with k − 1 and the error df). The Scheffé test in “Mean comparisons” only applies to pairs of means.", "alternativa": "comparaciones-medias" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "tiempo", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "veneno", "tipo": "factor with k levels", "papel": "factor whose levels are contrasted" },
        { "nombre": "tratamiento", "tipo": "factor with b levels", "papel": "another treatment factor of the design" }
      ],
      "minimo": "At least 2 replicates per level (3 or more is better) and as many coefficients as the factor has levels. With k levels you can form at most k − 1 orthogonal contrasts.",
      "balance": "With unbalanced data the contrasts use adjusted means, and orthogonality is checked with the actual replicates of each level: coefficients that are orthogonal with balanced data may stop being so.",
      "notaFormato": "Long format, as in the design. Contrasts are typed in the form, one per line, as “name: coefficients” in the order of the levels SigmaPro shows (for example, “I y II vs III: 1 1 -2”).",
      "errores": [
        "Typing the coefficients in an order other than that of the factor levels: check the note “Coefficients in the order of the levels”.",
        "Using coefficients that do not add up to zero: then you are not comparing means but estimating a linear combination.",
        "Setting more than k − 1 contrasts, or non-orthogonal contrasts, and adding their SS as if they split that of the factor.",
        "Defining the contrasts after seeing which means ended up farthest apart."
      ]
    },
    "interpretacion": {
      "orden": [
        "Confirm in the table note the order of the levels used to read the coefficients.",
        "Read the estimate of each contrast: its sign tells which side has the larger mean.",
        "Look at t and p of each contrast; in single-error designs, the SS tells how much of the factor variation it explains.",
        "Check the orthogonality note before adding or comparing sums of squares."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Organic fertilizers outyielded synthetic ones by 0.42 t/ha (t(24) = 3.1, p = 0.005), whereas compost and manure did not differ from each other (t(24) = 0.8, p = 0.43).”",
      "guias": ["t", "p", "sc", "ee", "F"]
    },
    "limitaciones": [
      "SigmaPro does not adjust contrast p-values for multiplicity: if you set many, interpret them with caution or adjust them yourself (Bonferroni: multiply each p by the number of contrasts); “Mean comparisons” only adjusts pairwise comparisons.",
      "For quantitative levels (rates, densities), orthogonal polynomials build the trend contrasts for you, also with unequally spaced levels.",
      "They are defined on the levels of a single factor; to contrast it within each level of another factor use “Within each level of”."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Lenth, R. V. (2016). Least-squares means: The R package lsmeans. Journal of Statistical Software, 69(1), 1–33."
    ]
  }
});
