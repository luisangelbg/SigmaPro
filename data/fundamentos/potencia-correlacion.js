SP_FICHA({
  "id": "potencia-correlacion",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["correlacion", "matriz-correlacion", "correlacion-parcial", "regresion-lineal", "potencia-medias"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Potencia para una correlación", "Tamaño de muestra para una correlación", "pwr.r.test"],
    "paraQue": "Calcula cuántos pares de observaciones necesitas para detectar una correlación de cierto tamaño, qué potencia tienes con los pares que hay o qué correlación alcanzarías a detectar.",
    "preguntas": [
      "¿Cuántas plantas debo medir para detectar una correlación de 0.3 entre el contenido de clorofila y el rendimiento por planta?",
      "Con 40 fincas, ¿qué correlación mínima entre la altitud y el rendimiento de café puedo detectar con una potencia de 80 %?",
      "Con 25 árboles, ¿qué potencia tengo para detectar una correlación de 0.5 entre el diámetro del tronco y la producción de fruta?"
    ],
    "teoria": [
      "Para saber si dos variables medidas en las mismas unidades se asocian, se prueba si su correlación de Pearson difiere de cero. Con pocas unidades, una correlación moderada puede pasar inadvertida: la potencia es la probabilidad de declarar significativa la correlación muestral cuando la correlación en la población es ρ, y depende del número de pares, de ρ y del nivel α.",
      "SigmaPro reproduce pwr.r.test del paquete pwr de R. Primero obtiene la correlación crítica, la más pequeña que resultaría significativa con n pares, a partir de la t con n − 2 grados de libertad. Después pasa ρ y esa correlación crítica a la escala z de Fisher, en la que la correlación muestral se distribuye casi normal con varianza 1/(n − 3); a ρ le suma la pequeña corrección ρ/(2(n − 1)) por el sesgo de la transformación. La potencia es la probabilidad normal de quedar más allá del valor crítico, en una o en las dos colas. Puedes pedir el número de pares, la potencia o la correlación detectable, con la alternativa bilateral o unilateral, y la gráfica muestra la potencia para cada número de pares.",
      "El tamaño de muestra crece muy rápido al bajar ρ: con α = 0.05 bilateral y potencia de 80 %, detectar 0.5 pide unos 30 pares, 0.3 unos 85 y 0.1 casi 800. Por eso conviene fijar la correlación que tiene importancia práctica antes de medir."
    ],
    "modelo": {
      "tex": "z_{\\rho} = \\frac{1}{2} \\ln \\frac{1 + \\rho}{1 - \\rho} + \\frac{\\rho}{2(n - 1)}, \\quad 1 - \\beta = \\Phi\\left( (z_{\\rho} - z_{c}) \\sqrt{n - 3} \\right) + \\Phi\\left( (-z_{\\rho} - z_{c}) \\sqrt{n - 3} \\right)",
      "terminos": [
        ["\\rho", "la correlación de Pearson en la población que interesa detectar"],
        ["n", "el número de pares de observaciones"],
        ["z_{\\rho}", "ρ en la escala z de Fisher, con la corrección por sesgo"],
        ["z_{c}", "la correlación crítica en la escala z; la correlación crítica sale de la t con n − 2 grados de libertad"],
        ["\\Phi", "la función de distribución normal estándar; con la alternativa unilateral solo se suma el primer término"],
        ["1 - \\beta", "la potencia"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho = 0", "h1": "\\rho \\ne 0", "texto": "La prueba de la correlación que se planea. Con la alternativa unilateral, SigmaPro prueba ρ > 0 (como pwr.r.test con «greater»): para una correlación negativa, escribe su valor absoluto." }
    ],
    "supuestos": [
      { "nombre": "Relación lineal y normalidad conjunta de las dos variables", "como": "La prueba de Pearson y la escala z de Fisher las suponen; se revisan después, con los datos, en el diagrama de dispersión de «Correlación de dos variables».", "verificar": "correlacion", "siFalla": "Si esperas una relación curva o valores extremos, el análisis final será la correlación de Spearman: planea con un margen de unidades.", "alternativa": "correlacion" },
      { "nombre": "Pares independientes", "como": "Cada par viene de una unidad distinta (planta, finca, árbol); no se revisa con datos.", "verificar": null, "siFalla": "Las mediciones repetidas de la misma unidad, o unidades vecinas que se parecen, no son independientes: la n efectiva es menor que la que cuentas.", "alternativa": null },
      { "nombre": "Correlación esperada realista", "como": "Es un supuesto: tómala de estudios anteriores o de la importancia práctica.", "verificar": null, "siFalla": "Si dudas, calcula con la correlación más pequeña que te importaría.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "¿Qué quieres calcular?", "tipo": "elección: pares, potencia o correlación detectable", "papel": "la incógnita" },
        { "nombre": "Correlación que interesa detectar", "tipo": "número entre −1 y 1, distinto de 0", "papel": "efecto (ρ)" },
        { "nombre": "Pares de observaciones", "tipo": "número mayor que 4", "papel": "si no es la incógnita" },
        { "nombre": "Potencia deseada y nivel de significancia", "tipo": "números entre 0 y 1", "papel": "riesgos que aceptas" },
        { "nombre": "Hipótesis alternativa", "tipo": "elección: bilateral o unilateral", "papel": "dirección de la prueba" }
      ],
      "minimo": "No hacen falta datos. Para calcular la potencia o la correlación detectable hacen falta más de 4 pares; el número de pares se busca a partir de 4.",
      "balance": "No aplica: cada par es una unidad con las dos variables medidas. La n exacta sale con decimales y la conclusión la redondea hacia arriba.",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. Después, los datos irán en dos columnas numéricas, una fila por unidad.",
      "errores": [
        "Contar como pares las mediciones repetidas de la misma planta o parcela.",
        "Escribir una correlación negativa con la alternativa unilateral: SigmaPro prueba ρ > 0, así que escribe su valor absoluto.",
        "Planear con la correlación que se espera encontrar en lugar de la mínima que importa.",
        "Pensar que una correlación detectable es útil para predecir: r = 0.3 comparte solo 9 % de la variación."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: los pares necesarios (redondeados hacia arriba y exactos), la potencia o la correlación detectable.",
        "Compara la correlación con la guía de Cohen (0.1 débil, 0.3 moderada, 0.5 fuerte) y con r², la proporción de variación compartida.",
        "Revisa la gráfica de la potencia según el número de pares."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con 40 fincas, una prueba bilateral con α = 0.05 tiene una potencia de 80 % para detectar una correlación de 0.43 o mayor entre la altitud y el rendimiento; correlaciones más débiles podrían pasar inadvertidas».",
      "guias": ["potencia", "alfa", "tamano-muestra", "r"]
    },
    "limitaciones": [
      "Es para la correlación de Pearson entre dos variables; para la de Spearman, el resultado es solo una aproximación (suele pedir algo más de pares).",
      "No sirve para planear una regresión múltiple ni una correlación parcial con otras variables controladas.",
      "Usa la aproximación de la z de Fisher, como pwr.r.test; con muy pocos pares es poco exacta."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Champely, S. (2020). pwr: Basic functions for power analysis (Version 1.3-0) [R package].",
      "Fisher, R. A. (1921). On the “probable error” of a coefficient of correlation deduced from a small sample. Metron, 1, 3–32.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Power for a correlation", "Sample size for a correlation", "pwr.r.test"],
    "paraQue": "Calculates how many pairs of observations you need to detect a correlation of a given size, how much power you have with the pairs available, or what correlation you could detect.",
    "preguntas": [
      "How many plants should I measure to detect a correlation of 0.3 between chlorophyll content and yield per plant?",
      "With 40 farms, what is the smallest correlation between altitude and coffee yield I can detect with 80 % power?",
      "With 25 trees, how much power do I have to detect a correlation of 0.5 between trunk diameter and fruit production?"
    ],
    "teoria": [
      "To find out whether two variables measured on the same units are associated, one tests whether their Pearson correlation differs from zero. With few units, a moderate correlation can go unnoticed: power is the probability of declaring the sample correlation significant when the population correlation is ρ, and it depends on the number of pairs, on ρ and on the level α.",
      "SigmaPro reproduces pwr.r.test from R’s pwr package. First it obtains the critical correlation, the smallest one that would be significant with n pairs, from the t with n − 2 degrees of freedom. Then it moves ρ and that critical correlation to Fisher’s z scale, on which the sample correlation is nearly normal with variance 1/(n − 3); to ρ it adds the small correction ρ/(2(n − 1)) for the bias of the transformation. Power is the normal probability of falling beyond the critical value, in one tail or in both. You can ask for the number of pairs, the power or the detectable correlation, with a two-sided or one-sided alternative, and the plot shows the power for each number of pairs.",
      "The sample size grows very fast as ρ falls: with two-sided α = 0.05 and 80 % power, detecting 0.5 requires about 30 pairs, 0.3 about 85 and 0.1 almost 800. It is therefore wise to set the correlation of practical importance before measuring."
    ],
    "modelo": {
      "tex": "z_{\\rho} = \\frac{1}{2} \\ln \\frac{1 + \\rho}{1 - \\rho} + \\frac{\\rho}{2(n - 1)}, \\quad 1 - \\beta = \\Phi\\left( (z_{\\rho} - z_{c}) \\sqrt{n - 3} \\right) + \\Phi\\left( (-z_{\\rho} - z_{c}) \\sqrt{n - 3} \\right)",
      "terminos": [
        ["\\rho", "the population Pearson correlation you want to detect"],
        ["n", "the number of pairs of observations"],
        ["z_{\\rho}", "ρ on Fisher’s z scale, with the bias correction"],
        ["z_{c}", "the critical correlation on the z scale; the critical correlation comes from the t with n − 2 degrees of freedom"],
        ["\\Phi", "the standard normal distribution function; with the one-sided alternative only the first term is added"],
        ["1 - \\beta", "the power"]
      ]
    },
    "hipotesis": [
      { "h0": "\\rho = 0", "h1": "\\rho \\ne 0", "texto": "The planned test of the correlation. With the one-sided alternative, SigmaPro tests ρ > 0 (like pwr.r.test with “greater”): for a negative correlation, enter its absolute value." }
    ],
    "supuestos": [
      { "nombre": "Linear relationship and joint normality of the two variables", "como": "Pearson’s test and Fisher’s z scale assume them; they are checked later, with the data, in the scatter plot of “Correlation between two variables”.", "verificar": "correlacion", "siFalla": "If you expect a curved relationship or extreme values, the final analysis will be Spearman’s correlation: plan with a margin of units.", "alternativa": "correlacion" },
      { "nombre": "Independent pairs", "como": "Each pair comes from a different unit (plant, farm, tree); it is not tested with data.", "verificar": null, "siFalla": "Repeated measurements of the same unit, or neighboring units that resemble each other, are not independent: the effective n is smaller than the one you count.", "alternativa": null },
      { "nombre": "Realistic expected correlation", "como": "It is an assumption: take it from previous studies or from practical importance.", "verificar": null, "siFalla": "When in doubt, calculate with the smallest correlation that would matter to you.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "What do you want to calculate?", "tipo": "choice: pairs, power or detectable correlation", "papel": "the unknown" },
        { "nombre": "Correlation to detect", "tipo": "number between −1 and 1, other than 0", "papel": "effect (ρ)" },
        { "nombre": "Pairs of observations", "tipo": "number greater than 4", "papel": "if it is not the unknown" },
        { "nombre": "Target power and significance level", "tipo": "numbers between 0 and 1", "papel": "risks you accept" },
        { "nombre": "Alternative hypothesis", "tipo": "choice: two-sided or one-sided", "papel": "direction of the test" }
      ],
      "minimo": "No data are needed. To calculate power or the detectable correlation, more than 4 pairs are required; the number of pairs is searched from 4 up.",
      "balance": "Not applicable: each pair is one unit with both variables measured. The exact n has decimals and the conclusion rounds it up.",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. Later, the data will go in two numeric columns, one row per unit.",
      "errores": [
        "Counting repeated measurements of the same plant or plot as pairs.",
        "Entering a negative correlation with the one-sided alternative: SigmaPro tests ρ > 0, so enter its absolute value.",
        "Planning with the correlation you expect to find instead of the smallest one that matters.",
        "Thinking that a detectable correlation is useful for prediction: r = 0.3 shares only 9 % of the variation."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the pairs needed (rounded up and exact), the power or the detectable correlation.",
        "Compare the correlation with Cohen’s guide (0.1 weak, 0.3 moderate, 0.5 strong) and with r², the proportion of shared variation.",
        "Check the plot of power by number of pairs."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With 40 farms, a two-sided test with α = 0.05 has 80 % power to detect a correlation of 0.43 or larger between altitude and yield; weaker correlations could go unnoticed.”",
      "guias": ["potencia", "alfa", "tamano-muestra", "r"]
    },
    "limitaciones": [
      "It is for the Pearson correlation between two variables; for Spearman’s, the result is only an approximation (it usually requires a few more pairs).",
      "It is not meant for planning a multiple regression or a partial correlation with other variables controlled.",
      "It uses Fisher’s z approximation, like pwr.r.test; with very few pairs it is not very accurate."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Champely, S. (2020). pwr: Basic functions for power analysis (Version 1.3-0) [R package].",
      "Fisher, R. A. (1921). On the “probable error” of a coefficient of correlation deduced from a small sample. Metron, 1, 3–32.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  }
});
