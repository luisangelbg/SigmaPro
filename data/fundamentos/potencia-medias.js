SP_FICHA({
  "id": "potencia-medias",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "dos-grupos",
  "disenos": ["dca"],
  "relacionados": ["prueba-t", "potencia-anova", "potencia-proporciones", "repeticiones", "tamano-muestra"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Potencia de la prueba t", "Tamaño de muestra para comparar dos medias", "power.t.test"],
    "paraQue": "Calcula cuántas unidades por grupo necesitas para detectar una diferencia entre dos medias, qué potencia tiene un ensayo ya planeado o qué diferencia alcanzaría a detectar.",
    "preguntas": [
      "¿Cuántas parcelas por variedad hacen falta para detectar una diferencia de 0.5 t/ha en rendimiento entre dos variedades de trigo?",
      "Con 8 macetas por tratamiento, ¿qué probabilidad tengo de detectar que un bioestimulante aumenta 10 g el peso seco de la raíz?",
      "Si mido la clorofila de las mismas 15 hojas antes y después de una aplicación foliar, ¿qué cambio mínimo podré detectar?"
    ],
    "teoria": [
      "Antes de sembrar conviene saber si el ensayo podrá ver la diferencia que te interesa. La potencia es la probabilidad de que la prueba t rechace la hipótesis nula cuando la diferencia real entre las medias es δ; su complemento, β, es el riesgo de no verla aunque exista. La potencia, el tamaño de muestra, la diferencia que interesa, la desviación estándar del error y el nivel de significancia α están ligados: si fijas todos menos uno, ese queda determinado. SigmaPro calcula el que elijas: el tamaño de muestra, la potencia de un tamaño dado o la diferencia que se puede detectar.",
      "El cálculo es exacto, el mismo de power.t.test de R. Si la diferencia real es δ, el estadístico t no sigue la t central sino una t no central con parámetro λ = (δ/σ)·√(n/2) en dos grupos independientes, o (δ/σ)·√n en una muestra contra un valor o en pares. La potencia es la probabilidad de que esa t no central rebase el valor crítico de la t central (en la prueba bilateral, como power.t.test por omisión, no se suma la cola opuesta, que es despreciable). Para hallar n, la app busca la raíz de la ecuación potencia(n) = potencia deseada; por eso la n exacta sale con decimales y la conclusión la redondea hacia arriba. La gráfica muestra la potencia para cada tamaño de muestra con la misma diferencia.",
      "Lo que más pesa es el cociente δ/σ, la d de Cohen: duplicar la diferencia, o reducir a la mitad la desviación, divide la n entre cuatro, más o menos. Por eso la desviación estándar debe venir de ensayos anteriores parecidos y la diferencia, de lo que tiene importancia agronómica o económica, no de lo que esperas encontrar."
    ],
    "modelo": {
      "tex": "\\lambda = \\frac{\\delta}{\\sigma} \\sqrt{\\frac{n}{2}}, \\quad \\nu = 2(n - 1), \\quad 1 - \\beta = P\\left( T_{\\nu, \\lambda} > t_{c} \\right)",
      "terminos": [
        ["\\delta", "la diferencia entre medias que interesa detectar, en las unidades de la variable"],
        ["\\sigma", "la desviación estándar del error (en pares, la de las diferencias)"],
        ["n", "las unidades por grupo (en una muestra, las observaciones; en pares, los pares)"],
        ["\\lambda", "el parámetro de no centralidad; en una muestra o en pares vale (δ/σ)·√n, con ν = n − 1"],
        ["T_{\\nu, \\lambda}", "una t no central con ν grados de libertad y no centralidad λ"],
        ["t_{c}", "el valor crítico de la t central: deja α arriba (unilateral) o α/2 (bilateral)"],
        ["1 - \\beta", "la potencia"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 = \\mu_2", "h1": "\\mu_1 \\ne \\mu_2", "texto": "La prueba t que se planea: dos medias iguales contra distintas (o una media contra un valor, o la media de las diferencias contra cero). Con la alternativa unilateral, SigmaPro prueba una diferencia positiva: escribe δ en esa dirección." }
    ],
    "supuestos": [
      { "nombre": "Desviación estándar bien estimada", "como": "Es un valor que tú supones; el cálculo no lo revisa. Tómalo de un ensayo anterior parecido: la raíz del cuadrado medio del error de su ANOVA o la DE de «Estadísticos descriptivos».", "verificar": "descriptivos", "siFalla": "Si la DE real resulta mayor, la potencia real será menor que la calculada. Ante la duda, calcula con la DE más alta que sea razonable o añade un margen de unidades.", "alternativa": null },
      { "nombre": "Normalidad de la respuesta (o de las diferencias, en pares)", "como": "La supone la t no central; se revisa después, con los datos del ensayo, en la prueba t o en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Con datos muy asimétricos o con muchos ceros, la potencia real se aparta de la calculada: planea en la escala en que vas a analizar (por ejemplo, logaritmos) o con una prueba por rangos.", "alternativa": "wilcoxon" },
      { "nombre": "Grupos del mismo tamaño y con la misma varianza", "como": "El cálculo supone n unidades en cada grupo y una sola σ, como power.t.test.", "verificar": null, "siFalla": "Si un grupo será más variable, usa la DE mayor; con grupos desiguales la potencia baja frente a la de grupos iguales con el mismo total. El análisis final puede usar la t de Welch.", "alternativa": "prueba-t" },
      { "nombre": "Unidades independientes", "como": "La da el sorteo de los tratamientos; no se revisa con datos.", "verificar": null, "siFalla": "Las plantas de una misma parcela o las lecturas repetidas de una unidad no son unidades independientes: cuenta parcelas, o usa la comparación en pares si mides la misma unidad dos veces.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "¿Qué quieres calcular?", "tipo": "elección: tamaño de muestra, potencia o diferencia detectable", "papel": "la incógnita" },
        { "nombre": "Comparación", "tipo": "elección: dos grupos independientes, pares o una media contra un valor", "papel": "tipo de prueba t" },
        { "nombre": "Diferencia entre medias que interesa", "tipo": "número, en las unidades de la variable", "papel": "efecto (δ)" },
        { "nombre": "Desviación estándar", "tipo": "número positivo", "papel": "variación del error (σ)" },
        { "nombre": "Tamaño de muestra, potencia deseada y nivel de significancia", "tipo": "números (n de 2 en adelante; potencia y α entre 0 y 1)", "papel": "los valores que no son la incógnita" },
        { "nombre": "Hipótesis alternativa", "tipo": "elección: bilateral o unilateral", "papel": "dirección de la prueba" }
      ],
      "minimo": "No hacen falta datos: todo sale de los valores del formulario. El tamaño de muestra se busca desde 2 por grupo; aunque la fórmula dé muy pocas unidades, conviene no bajar de 4 o 5 para estimar el error con algo de confianza.",
      "balance": "Supone el mismo número de unidades en cada grupo. La n exacta sale con decimales: la conclusión la redondea hacia arriba y el cuadro de parámetros muestra el valor exacto.",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. Con dos grupos, n es por grupo (el total es 2n); en pares, n es el número de pares.",
      "errores": [
        "Usar la desviación estándar de las medias de los tratamientos en lugar de la del error (la de las unidades dentro de un tratamiento).",
        "En pares, escribir la DE de las mediciones en lugar de la DE de las diferencias entre antes y después.",
        "Elegir la diferencia que se espera encontrar en vez de la mínima que tiene importancia práctica.",
        "Leer n como el total de los dos grupos cuando es por grupo.",
        "Calcular la potencia después del ensayo con la diferencia observada: esa «potencia observada» no añade nada al valor p."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: el tamaño de muestra (redondeado hacia arriba y el exacto), la potencia o la diferencia detectable.",
        "En el cuadro de parámetros revisa la d de Cohen (δ/σ): dice si el efecto que planeas es pequeño, mediano o grande.",
        "Mira la gráfica de la potencia según el tamaño de muestra: muestra cuánto ganas o pierdes con unas unidades más o menos.",
        "Repite el cálculo con otra DE o con otra diferencia para ver qué tan sensible es la n."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Para detectar una diferencia de 0.5 t/ha entre dos variedades, con una desviación estándar del error de 0.4 t/ha (d = 1.25), α = 0.05 y una potencia de 80 %, se necesitan 12 parcelas por variedad en una prueba t bilateral de dos muestras independientes (n exacta: 11.09)».",
      "guias": ["potencia", "alfa", "tamano-muestra", "d-cohen"]
    },
    "limitaciones": [
      "Solo compara dos medias: para tres o más tratamientos usa la potencia del ANOVA y, para planear con el CV de ensayos anteriores, el número de repeticiones.",
      "El resultado es tan bueno como la DE supuesta: con la DE de un ensayo pequeño, la n calculada suele ser optimista.",
      "Para porcentajes de unidades que responden sí o no (germinación, sobrevivencia) usa la potencia de dos proporciones.",
      "No considera pérdidas: si esperas perder parcelas o plantas, aumenta la n en esa proporción."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Lenth, R. V. (2001). Some practical guidelines for effective sample size determination. The American Statistician, 55(3), 187–193.",
      "Hoenig, J. M., & Heisey, D. M. (2001). The abuse of power: The pervasive fallacy of power calculations for data analysis. The American Statistician, 55(1), 19–24."
    ]
  },
  "en": {
    "alias": ["t-test power", "Sample size to compare two means", "power.t.test"],
    "paraQue": "Calculates how many units per group you need to detect a difference between two means, how much power an already planned trial has, or what difference it could detect.",
    "preguntas": [
      "How many plots per variety are needed to detect a 0.5 t/ha yield difference between two wheat varieties?",
      "With 8 pots per treatment, what is the probability of detecting that a biostimulant increases root dry weight by 10 g?",
      "If I measure chlorophyll on the same 15 leaves before and after a foliar application, what is the smallest change I can detect?"
    ],
    "teoria": [
      "Before sowing, it pays to know whether the trial will be able to see the difference you care about. Power is the probability that the t test rejects the null hypothesis when the true difference between the means is δ; its complement, β, is the risk of missing it even though it exists. Power, sample size, the difference of interest, the error standard deviation and the significance level α are linked: if you fix all but one, that one is determined. SigmaPro calculates the one you choose: the sample size, the power of a given size or the difference that can be detected.",
      "The calculation is exact, the same as R’s power.t.test. If the true difference is δ, the t statistic does not follow the central t but a noncentral t with parameter λ = (δ/σ)·√(n/2) for two independent groups, or (δ/σ)·√n for one sample against a value or for pairs. Power is the probability that this noncentral t exceeds the critical value of the central t (in the two-sided test, as in power.t.test by default, the opposite tail, which is negligible, is not added). To find n, the app searches for the root of the equation power(n) = target power; that is why the exact n has decimals and the conclusion rounds it up. The plot shows the power for each sample size with the same difference.",
      "What matters most is the ratio δ/σ, Cohen’s d: doubling the difference, or halving the standard deviation, divides n by about four. The standard deviation should therefore come from similar previous trials, and the difference from what matters agronomically or economically, not from what you expect to find."
    ],
    "modelo": {
      "tex": "\\lambda = \\frac{\\delta}{\\sigma} \\sqrt{\\frac{n}{2}}, \\quad \\nu = 2(n - 1), \\quad 1 - \\beta = P\\left( T_{\\nu, \\lambda} > t_{c} \\right)",
      "terminos": [
        ["\\delta", "the difference between means you want to detect, in the units of the variable"],
        ["\\sigma", "the error standard deviation (for pairs, that of the differences)"],
        ["n", "the units per group (for one sample, the observations; for pairs, the pairs)"],
        ["\\lambda", "the noncentrality parameter; for one sample or pairs it is (δ/σ)·√n, with ν = n − 1"],
        ["T_{\\nu, \\lambda}", "a noncentral t with ν degrees of freedom and noncentrality λ"],
        ["t_{c}", "the critical value of the central t: it leaves α above (one-sided) or α/2 (two-sided)"],
        ["1 - \\beta", "the power"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 = \\mu_2", "h1": "\\mu_1 \\ne \\mu_2", "texto": "The planned t test: two equal means against different ones (or one mean against a value, or the mean of the differences against zero). With the one-sided alternative, SigmaPro tests a positive difference: enter δ in that direction." }
    ],
    "supuestos": [
      { "nombre": "Well-estimated standard deviation", "como": "It is a value you assume; the calculation does not check it. Take it from a similar previous trial: the square root of the error mean square of its ANOVA or the SD from “Descriptive statistics”.", "verificar": "descriptivos", "siFalla": "If the true SD turns out larger, the actual power will be lower than calculated. When in doubt, calculate with the largest reasonable SD or add a margin of units.", "alternativa": null },
      { "nombre": "Normality of the response (or of the differences, for pairs)", "como": "The noncentral t assumes it; it is checked later, with the trial data, in the t test or in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "With very skewed data or many zeros, the actual power departs from the calculated one: plan on the scale you will analyze (for example, logarithms) or with a rank test.", "alternativa": "wilcoxon" },
      { "nombre": "Groups of the same size and with the same variance", "como": "The calculation assumes n units in each group and a single σ, like power.t.test.", "verificar": null, "siFalla": "If one group will be more variable, use the larger SD; with unequal groups, power drops compared with equal groups of the same total. The final analysis can use Welch’s t.", "alternativa": "prueba-t" },
      { "nombre": "Independent units", "como": "It comes from randomizing the treatments; it is not tested with data.", "verificar": null, "siFalla": "Plants in the same plot or repeated readings of one unit are not independent units: count plots, or use the paired comparison if you measure the same unit twice.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "What do you want to calculate?", "tipo": "choice: sample size, power or detectable difference", "papel": "the unknown" },
        { "nombre": "Comparison", "tipo": "choice: two independent groups, paired or one mean vs. a value", "papel": "type of t test" },
        { "nombre": "Difference between means of interest", "tipo": "number, in the units of the variable", "papel": "effect (δ)" },
        { "nombre": "Standard deviation", "tipo": "positive number", "papel": "error variation (σ)" },
        { "nombre": "Sample size, target power and significance level", "tipo": "numbers (n from 2 up; power and α between 0 and 1)", "papel": "the values that are not the unknown" },
        { "nombre": "Alternative hypothesis", "tipo": "choice: two-sided or one-sided", "papel": "direction of the test" }
      ],
      "minimo": "No data are needed: everything comes from the values in the form. The sample size is searched from 2 per group; even if the formula gives very few units, it is wise not to go below 4 or 5 to estimate the error with some confidence.",
      "balance": "It assumes the same number of units in each group. The exact n has decimals: the conclusion rounds it up and the parameters table shows the exact value.",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. With two groups, n is per group (the total is 2n); for pairs, n is the number of pairs.",
      "errores": [
        "Using the standard deviation of the treatment means instead of the error SD (that of the units within a treatment).",
        "For pairs, entering the SD of the measurements instead of the SD of the before–after differences.",
        "Choosing the difference you expect to find instead of the smallest one with practical importance.",
        "Reading n as the total of both groups when it is per group.",
        "Calculating power after the trial with the observed difference: that “observed power” adds nothing to the p value."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the sample size (rounded up and exact), the power or the detectable difference.",
        "In the parameters table, check Cohen’s d (δ/σ): it tells whether the effect you plan for is small, medium or large.",
        "Look at the plot of power by sample size: it shows how much you gain or lose with a few more or fewer units.",
        "Repeat the calculation with another SD or another difference to see how sensitive n is."
      ],
      "ejemplo": "Example write-up (illustrative figures): “To detect a difference of 0.5 t/ha between two varieties, with an error standard deviation of 0.4 t/ha (d = 1.25), α = 0.05 and 80 % power, 12 plots per variety are needed in a two-sided two-sample t test (exact n: 11.09).”",
      "guias": ["potencia", "alfa", "tamano-muestra", "d-cohen"]
    },
    "limitaciones": [
      "It only compares two means: for three or more treatments use ANOVA power and, to plan with the CV of previous trials, the number of replicates.",
      "The result is only as good as the assumed SD: with the SD from a small trial, the calculated n is usually optimistic.",
      "For percentages of units that respond yes or no (germination, survival) use the power for two proportions.",
      "It does not account for losses: if you expect to lose plots or plants, increase n by that proportion."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Lenth, R. V. (2001). Some practical guidelines for effective sample size determination. The American Statistician, 55(3), 187–193.",
      "Hoenig, J. M., & Heisey, D. M. (2001). The abuse of power: The pervasive fallacy of power calculations for data analysis. The American Statistician, 55(1), 19–24."
    ]
  }
});
