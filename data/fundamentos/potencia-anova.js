SP_FICHA({
  "id": "potencia-anova",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "k-grupos",
  "disenos": ["dca"],
  "relacionados": ["dca", "potencia-medias", "repeticiones", "comparaciones-medias", "dbca"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Potencia del ANOVA de una vía", "Repeticiones por tratamiento", "power.anova.test"],
    "paraQue": "Calcula cuántas repeticiones por tratamiento necesita un análisis de varianza para detectar las diferencias que esperas entre varias medias, o qué potencia tiene con las repeticiones que ya planeaste.",
    "preguntas": [
      "¿Cuántas repeticiones necesito para que el ANOVA detecte diferencias entre cuatro fertilizantes si espero rendimientos de 4.2, 4.8, 5.1 y 5.6 t/ha?",
      "Con 4 repeticiones de seis variedades de frijol, ¿qué potencia tiene el ensayo para las diferencias que considero importantes?",
      "Con 5 repeticiones, ¿qué tan dispersas deben estar las medias de los tratamientos para que el ANOVA lo note?"
    ],
    "teoria": [
      "La prueba F del análisis de varianza compara la variación entre las medias de los tratamientos con la variación dentro de ellos. Si los tratamientos difieren, el cociente F ya no sigue la F central sino una F no central, cuyo parámetro λ crece con las repeticiones y con la dispersión de las medias verdaderas frente al error. La potencia es la probabilidad de que esa F no central rebase el valor crítico de la F central con k − 1 y k(n − 1) grados de libertad.",
      "Para describir el efecto, SigmaPro pide la desviación estándar del error y, o bien las medias que esperas en los tratamientos, o bien el número de tratamientos y la varianza de sus medias (con divisor k − 1, como var de R). De ahí obtiene la f de Cohen: la desviación de las medias entre la del error. Tú eliges la incógnita: las repeticiones por tratamiento, la potencia con un número dado de repeticiones o la varianza entre medias que se alcanzaría a detectar. El cálculo reproduce power.anova.test de R, con la misma búsqueda de la raíz, y la gráfica muestra la potencia para cada número de repeticiones.",
      "La potencia se refiere a la prueba F global (que algún tratamiento difiere), no a la comparación de un par en particular: separar con la misma potencia los dos tratamientos más parecidos pide más repeticiones. El cálculo corresponde a un diseño completamente al azar de un factor; en bloques, el error tiene algunos grados de libertad menos y la desviación debe ser la del error una vez quitados los bloques."
    ],
    "modelo": {
      "tex": "\\lambda = \\frac{n \\sum_{i=1}^{k} (\\mu_i - \\bar{\\mu})^{2}}{\\sigma^{2}}, \\quad 1 - \\beta = P\\left( F_{k - 1, k(n - 1), \\lambda} > F_{c} \\right), \\quad f = \\frac{\\sigma_{\\mu}}{\\sigma}",
      "terminos": [
        ["k", "el número de tratamientos"],
        ["n", "las repeticiones por tratamiento"],
        ["\\mu_i", "la media esperada del tratamiento i; μ̄ es el promedio de las k medias"],
        ["\\sigma", "la desviación estándar del error"],
        ["\\lambda", "el parámetro de no centralidad de la F"],
        ["F_{c}", "el valor crítico de la F central con k − 1 y k(n − 1) grados de libertad al nivel α"],
        ["f", "la f de Cohen; σ_μ es la desviación estándar de las medias con divisor k"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 = \\mu_2 = \\cdots = \\mu_k", "h1": "\\text{alguna } \\mu_i \\ne \\mu_j", "texto": "La prueba F global del ANOVA de una vía que se planea." }
    ],
    "supuestos": [
      { "nombre": "Desviación estándar del error bien estimada", "como": "Es un supuesto del cálculo: tómala como la raíz del cuadrado medio del error de un ensayo anterior parecido (en el cuadro de ANOVA de ese ensayo).", "verificar": null, "siFalla": "Si el error real resulta mayor, la potencia será menor que la calculada; ante la duda, calcula con la desviación más alta que sea razonable.", "alternativa": null },
      { "nombre": "Normalidad y varianzas iguales", "como": "Las supone la F; se revisan después, con los datos del ensayo, en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Si esperas varianzas que crecen con la media (conteos, pesos), planea en la escala transformada o toma el resultado como aproximado; el análisis final puede ser por rangos o con un modelo lineal generalizado.", "alternativa": "kruskal-wallis" },
      { "nombre": "Las mismas repeticiones en todos los tratamientos", "como": "El cálculo supone un diseño balanceado con n repeticiones de cada tratamiento.", "verificar": null, "siFalla": "Si algunos tratamientos tendrán menos repeticiones, la potencia real será algo menor: planea con la n más pequeña.", "alternativa": null },
      { "nombre": "Diseño completamente al azar", "como": "Los grados de libertad del error son k(n − 1), los del diseño completamente al azar.", "verificar": null, "siFalla": "En bloques completos, usa la desviación del error del ANOVA en bloques; para planear con el CV en bloques, usa el número de repeticiones de Cochran y Cox.", "alternativa": "repeticiones" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "¿Qué quieres calcular?", "tipo": "elección: repeticiones, potencia o variación entre medias detectable", "papel": "la incógnita" },
        { "nombre": "Medias esperadas de los tratamientos (opcional)", "tipo": "lista de números separados por comas", "papel": "efecto; si la das, sustituye a los dos campos siguientes" },
        { "nombre": "Tratamientos y varianza de las medias de los tratamientos", "tipo": "entero de 2 en adelante y número positivo", "papel": "efecto, si no das las medias" },
        { "nombre": "Desviación estándar del error", "tipo": "número positivo", "papel": "variación del error (σ)" },
        { "nombre": "Repeticiones por tratamiento, potencia deseada y nivel de significancia", "tipo": "números (repeticiones de 2 en adelante; potencia y α entre 0 y 1)", "papel": "los valores que no son la incógnita" }
      ],
      "minimo": "No hacen falta datos. Al menos 2 tratamientos; las repeticiones se buscan entre 2 y 100 000.",
      "balance": "Supone el mismo número de repeticiones en cada tratamiento. La n exacta sale con decimales y la conclusión la redondea hacia arriba.",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. Las medias se escriben separadas por comas (por ejemplo, 4.2, 4.8, 5.1, 5.6).",
      "errores": [
        "Escribir la desviación estándar de las medias de los tratamientos donde va la del error.",
        "Calcular la «varianza de las medias» con divisor k: SigmaPro usa divisor k − 1, como var de R.",
        "Esperar que la potencia de la F global valga para cada comparación de pares: separar dos tratamientos parecidos pide más repeticiones.",
        "Usar el cuadrado medio del error de un ensayo con otro cultivo, otra variable u otro tamaño de parcela."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: las repeticiones por tratamiento (redondeadas hacia arriba y exactas), la potencia o la varianza entre medias detectable.",
        "Revisa la f de Cohen en el cuadro de parámetros: 0.10 es un efecto pequeño, 0.25 mediano y 0.40 grande.",
        "Con la gráfica de la potencia según las repeticiones, decide si una repetición más vale la pena.",
        "Si diste medias, comprueba en las notas del cuadro que son las que querías."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con medias esperadas de 4.2, 4.8, 5.1 y 5.6 t/ha y una desviación estándar del error de 0.6 t/ha (f = 0.84), el análisis de varianza necesita 5 repeticiones por tratamiento para una potencia de 80 % con α = 0.05 (n exacta: 4.915)».",
      "guias": ["potencia", "alfa", "tamano-muestra", "f-cohen", "F"]
    },
    "limitaciones": [
      "Corresponde a un factor con la prueba F global; en un factorial, la potencia de cada efecto y de la interacción depende de sus propios grados de libertad y aquí solo es una aproximación.",
      "Para planear las repeticiones de un ensayo en bloques con el CV de ensayos anteriores, usa el número de repeticiones (Cochran y Cox).",
      "Con dos tratamientos da prácticamente lo mismo que la potencia de la prueba t bilateral.",
      "Si la respuesta es un conteo o una proporción, el resultado es solo una aproximación."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  },
  "en": {
    "alias": ["One-way ANOVA power", "Replicates per treatment", "power.anova.test"],
    "paraQue": "Calculates how many replicates per treatment an analysis of variance needs to detect the differences you expect among several means, or how much power it has with the replicates you already planned.",
    "preguntas": [
      "How many replicates do I need for the ANOVA to detect differences among four fertilizers if I expect yields of 4.2, 4.8, 5.1 and 5.6 t/ha?",
      "With 4 replicates of six bean varieties, how much power does the trial have for the differences I consider important?",
      "With 5 replicates, how spread out must the treatment means be for the ANOVA to notice?"
    ],
    "teoria": [
      "The analysis of variance F test compares the variation among treatment means with the variation within them. If the treatments differ, the F ratio no longer follows the central F but a noncentral F, whose parameter λ grows with the replicates and with the spread of the true means relative to the error. Power is the probability that this noncentral F exceeds the critical value of the central F with k − 1 and k(n − 1) degrees of freedom.",
      "To describe the effect, SigmaPro asks for the error standard deviation and either the means you expect for the treatments or the number of treatments and the variance of their means (with divisor k − 1, like R’s var). From these it obtains Cohen’s f: the standard deviation of the means divided by that of the error. You choose the unknown: the replicates per treatment, the power with a given number of replicates or the variance among means that could be detected. The calculation reproduces R’s power.anova.test, with the same root search, and the plot shows the power for each number of replicates.",
      "Power refers to the overall F test (that some treatment differs), not to the comparison of a particular pair: separating the two most similar treatments with the same power requires more replicates. The calculation corresponds to a one-factor completely randomized design; in blocks, the error has a few fewer degrees of freedom and the standard deviation should be that of the error after removing blocks."
    ],
    "modelo": {
      "tex": "\\lambda = \\frac{n \\sum_{i=1}^{k} (\\mu_i - \\bar{\\mu})^{2}}{\\sigma^{2}}, \\quad 1 - \\beta = P\\left( F_{k - 1, k(n - 1), \\lambda} > F_{c} \\right), \\quad f = \\frac{\\sigma_{\\mu}}{\\sigma}",
      "terminos": [
        ["k", "the number of treatments"],
        ["n", "the replicates per treatment"],
        ["\\mu_i", "the expected mean of treatment i; μ̄ is the average of the k means"],
        ["\\sigma", "the error standard deviation"],
        ["\\lambda", "the noncentrality parameter of F"],
        ["F_{c}", "the critical value of the central F with k − 1 and k(n − 1) degrees of freedom at level α"],
        ["f", "Cohen’s f; σ_μ is the standard deviation of the means with divisor k"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 = \\mu_2 = \\cdots = \\mu_k", "h1": "\\text{some } \\mu_i \\ne \\mu_j", "texto": "The overall F test of the planned one-way ANOVA." }
    ],
    "supuestos": [
      { "nombre": "Well-estimated error standard deviation", "como": "It is an assumption of the calculation: take it as the square root of the error mean square of a similar previous trial (in that trial’s ANOVA table).", "verificar": null, "siFalla": "If the actual error turns out larger, power will be lower than calculated; when in doubt, calculate with the largest reasonable standard deviation.", "alternativa": null },
      { "nombre": "Normality and equal variances", "como": "The F test assumes them; they are checked later, with the trial data, in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "If you expect variances that grow with the mean (counts, weights), plan on the transformed scale or take the result as approximate; the final analysis can use ranks or a generalized linear model.", "alternativa": "kruskal-wallis" },
      { "nombre": "The same replicates for every treatment", "como": "The calculation assumes a balanced design with n replicates of each treatment.", "verificar": null, "siFalla": "If some treatments will have fewer replicates, the actual power will be somewhat lower: plan with the smallest n.", "alternativa": null },
      { "nombre": "Completely randomized design", "como": "The error degrees of freedom are k(n − 1), those of the completely randomized design.", "verificar": null, "siFalla": "In complete blocks, use the error standard deviation of the block ANOVA; to plan with the CV in blocks, use Cochran and Cox’s number of replicates.", "alternativa": "repeticiones" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "What do you want to calculate?", "tipo": "choice: replicates, power or detectable variation among means", "papel": "the unknown" },
        { "nombre": "Expected treatment means (optional)", "tipo": "list of comma-separated numbers", "papel": "effect; if given, it replaces the next two fields" },
        { "nombre": "Treatments and variance of the treatment means", "tipo": "integer from 2 up and positive number", "papel": "effect, if you do not give the means" },
        { "nombre": "Error standard deviation", "tipo": "positive number", "papel": "error variation (σ)" },
        { "nombre": "Replicates per treatment, target power and significance level", "tipo": "numbers (replicates from 2 up; power and α between 0 and 1)", "papel": "the values that are not the unknown" }
      ],
      "minimo": "No data are needed. At least 2 treatments; replicates are searched between 2 and 100,000.",
      "balance": "It assumes the same number of replicates in each treatment. The exact n has decimals and the conclusion rounds it up.",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. Means are entered separated by commas (for example, 4.2, 4.8, 5.1, 5.6).",
      "errores": [
        "Entering the standard deviation of the treatment means where the error SD goes.",
        "Calculating the “variance of the means” with divisor k: SigmaPro uses divisor k − 1, like R’s var.",
        "Expecting the power of the overall F to hold for each pairwise comparison: separating two similar treatments requires more replicates.",
        "Using the error mean square from a trial with another crop, another variable or another plot size."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the replicates per treatment (rounded up and exact), the power or the detectable variance among means.",
        "Check Cohen’s f in the parameters table: 0.10 is a small effect, 0.25 medium and 0.40 large.",
        "With the plot of power by number of replicates, decide whether one more replicate is worth it.",
        "If you gave means, check in the table notes that they are the ones you intended."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With expected means of 4.2, 4.8, 5.1 and 5.6 t/ha and an error standard deviation of 0.6 t/ha (f = 0.84), the analysis of variance needs 5 replicates per treatment for 80 % power at α = 0.05 (exact n: 4.915).”",
      "guias": ["potencia", "alfa", "tamano-muestra", "f-cohen", "F"]
    },
    "limitaciones": [
      "It corresponds to one factor with the overall F test; in a factorial, the power of each effect and of the interaction depends on its own degrees of freedom and here it is only an approximation.",
      "To plan the replicates of a block trial with the CV of previous trials, use the number of replicates (Cochran and Cox).",
      "With two treatments it gives practically the same as the power of the two-sided t test.",
      "If the response is a count or a proportion, the result is only an approximation."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Montgomery, D. C. (2017). Design and analysis of experiments (9th ed.). Wiley.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill."
    ]
  }
});
