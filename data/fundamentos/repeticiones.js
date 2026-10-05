SP_FICHA({
  "id": "repeticiones",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["potencia-anova", "potencia-medias", "dbca", "dca", "descriptivos"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Número de repeticiones (Cochran y Cox)", "Repeticiones con el coeficiente de variación", "Fórmula de Cochran y Cox"],
    "paraQue": "Calcula cuántas repeticiones poner en un experimento a partir del coeficiente de variación esperado y de la diferencia entre tratamientos que te interesa detectar, en porcentaje de la media.",
    "preguntas": [
      "Si el CV del rendimiento de maíz en mi zona ronda 12 %, ¿cuántos bloques necesito para detectar diferencias de 15 % entre seis híbridos?",
      "¿Cuántas repeticiones hacen falta en un ensayo completamente al azar en invernadero, con un CV de 8 %, para detectar diferencias de 10 % en la altura?",
      "¿Vale la pena pasar de 4 a 6 bloques en un ensayo de variedades de frijol con un CV de 18 %?"
    ],
    "teoria": [
      "En los ensayos agrícolas la variación del error se conoce mejor como coeficiente de variación (CV), la desviación estándar del error en porcentaje de la media, porque es bastante estable para un cultivo, una variable y un tamaño de parcela. Cochran y Cox propusieron calcular las repeticiones con ese CV y con la diferencia d entre dos medias de tratamientos que interesa detectar, también en porcentaje de la media: r ≥ 2(t₁ + t₂)²(CV/d)².",
      "En la fórmula, t₁ es el valor de t para el nivel de significancia (bilateral) y t₂ el que corresponde a la potencia, de modo que una diferencia d se declare significativa con la probabilidad deseada. Los dos dependen de los grados de libertad del error, que a su vez dependen de r: k(r − 1) en un diseño completamente al azar y (k − 1)(r − 1) en bloques completos al azar, con k tratamientos. Por eso SigmaPro no despeja r de una vez: prueba r = 2, 3, 4…, calcula las repeticiones que pide la fórmula con esos grados de libertad y se detiene en la primera r que ya cubre lo que se pide. El cuadro «Búsqueda de las repeticiones» muestra cada paso y la gráfica compara las repeticiones requeridas con las puestas.",
      "La diferencia d se refiere a la comparación de dos medias de tratamientos con una prueba t, como la diferencia mínima significativa, no a la prueba F global. Como el CV entra al cuadrado, un CV mal elegido cambia mucho el resultado: usa el de ensayos del mismo cultivo, variable, zona y tamaño de parcela."
    ],
    "modelo": {
      "tex": "r \\ge 2 (t_1 + t_2)^{2} \\left( \\frac{\\mathrm{CV}}{d} \\right)^{2}",
      "terminos": [
        ["r", "las repeticiones por tratamiento: la menor entera que cumple"],
        ["t_1", "el cuantil 1 − α/2 de la t con los grados de libertad del error"],
        ["t_2", "el cuantil de la t que corresponde a la potencia deseada (1 − β), con los mismos grados de libertad"],
        ["\\mathrm{CV}", "el coeficiente de variación esperado del error, en %"],
        ["d", "la diferencia entre dos medias que interesa detectar, en % de la media"],
        ["\\nu", "los grados de libertad del error: k(r − 1) en completamente al azar y (k − 1)(r − 1) en bloques, con k tratamientos"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_i = \\mu_j", "h1": "\\mu_i \\ne \\mu_j", "texto": "La comparación de dos medias de tratamientos con una prueba t bilateral en los grados de libertad del error del experimento; d es la diferencia que se quiere detectar con la potencia pedida." }
    ],
    "supuestos": [
      { "nombre": "CV esperado representativo", "como": "Es un supuesto del cálculo: tómalo de ensayos anteriores del mismo cultivo y variable (en SigmaPro, el CV que informa el análisis de un ensayo en bloques completos al azar).", "verificar": "dbca", "siFalla": "Si el CV real resulta mayor, la potencia será menor que la pedida; ante la duda, calcula con el CV más alto que hayas visto en esos ensayos.", "alternativa": null },
      { "nombre": "Error normal con varianza constante", "como": "Lo supone la prueba t; se revisa después del ensayo en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Con conteos o porcentajes el CV cambia con la media: planea en la escala en que vas a analizar (transformada) o toma el resultado como aproximado.", "alternativa": null },
      { "nombre": "Diseño completamente al azar o en bloques completos, balanceado", "como": "Los grados de libertad del error son los de esos dos diseños con r repeticiones de cada tratamiento.", "verificar": null, "siFalla": "En otros diseños (parcelas divididas, látice) el resultado es aproximado, porque los grados de libertad y el error de cada comparación son otros.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "Coeficiente de variación esperado (%)", "tipo": "número positivo", "papel": "variación del error" },
        { "nombre": "Diferencia que interesa detectar (% de la media)", "tipo": "número positivo", "papel": "efecto (d)" },
        { "nombre": "Tratamientos", "tipo": "entero de 2 en adelante", "papel": "fija los grados de libertad del error" },
        { "nombre": "Diseño", "tipo": "elección: bloques completos al azar o completamente al azar", "papel": "fija los grados de libertad del error" },
        { "nombre": "Potencia deseada y nivel de significancia", "tipo": "números entre 0 y 1", "papel": "riesgos que aceptas (t₂ y t₁)" }
      ],
      "minimo": "No hacen falta datos. La búsqueda empieza en 2 repeticiones y se detiene en 1000; si harían falta más, la app avisa que revises el CV y la diferencia.",
      "balance": "Supone r repeticiones de cada tratamiento (diseño balanceado).",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. El CV y la diferencia van en porcentaje (12, no 0.12).",
      "errores": [
        "Escribir el CV o la diferencia como fracción (0.12) en lugar de porcentaje (12).",
        "Usar el CV de un ensayo con otro tamaño de parcela, otro cultivo u otra variable.",
        "Confundir el CV del error con el CV de los datos crudos, que incluye el efecto de los tratamientos y de los bloques.",
        "Esperar que d sea la diferencia que detecta la F global: es la de la comparación de dos medias."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: las repeticiones necesarias con el CV, la diferencia, los tratamientos y el diseño que diste.",
        "En el cuadro «Búsqueda de las repeticiones», la última fila es la respuesta: las repeticiones puestas ya cubren las requeridas con sus grados de libertad del error.",
        "En la gráfica, la respuesta es el primer punto que queda por debajo de la diagonal.",
        "Repite el cálculo con otros CV o diferencias para ver qué tan sensible es el número."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con un CV esperado de 12 %, seis tratamientos en bloques completos al azar, α = 0.05 y una potencia de 80 %, se requieren 11 repeticiones para detectar una diferencia de 15 % de la media entre dos tratamientos (fórmula de Cochran y Cox)».",
      "guias": ["cv", "gl", "t", "potencia", "alfa", "tamano-muestra"]
    },
    "limitaciones": [
      "Se refiere a la comparación de dos medias; para la prueba F global de varios tratamientos usa la potencia del ANOVA.",
      "Solo distingue entre completamente al azar y bloques completos; en otros diseños úsalo como aproximación.",
      "El resultado depende mucho del CV supuesto, que entra al cuadrado.",
      "No considera pérdidas de parcelas: si esperas perder alguna, añade una repetición."
    ],
    "referencias": [
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  },
  "en": {
    "alias": ["Number of replicates (Cochran and Cox)", "Replicates from the coefficient of variation", "Cochran and Cox formula"],
    "paraQue": "Calculates how many replicates to use in an experiment from the expected coefficient of variation and the difference between treatments you want to detect, as a percentage of the mean.",
    "preguntas": [
      "If the CV of maize yield in my area is around 12 %, how many blocks do I need to detect 15 % differences among six hybrids?",
      "How many replicates are needed in a completely randomized greenhouse trial, with a CV of 8 %, to detect 10 % differences in height?",
      "Is it worth going from 4 to 6 blocks in a bean variety trial with a CV of 18 %?"
    ],
    "teoria": [
      "In agricultural trials, error variation is best known as the coefficient of variation (CV), the error standard deviation as a percentage of the mean, because it is fairly stable for a crop, a variable and a plot size. Cochran and Cox proposed calculating replicates from that CV and from the difference d between two treatment means that you want to detect, also as a percentage of the mean: r ≥ 2(t₁ + t₂)²(CV/d)².",
      "In the formula, t₁ is the t value for the significance level (two-sided) and t₂ the one corresponding to the power, so that a difference d is declared significant with the desired probability. Both depend on the error degrees of freedom, which in turn depend on r: k(r − 1) in a completely randomized design and (k − 1)(r − 1) in randomized complete blocks, with k treatments. That is why SigmaPro does not solve for r at once: it tries r = 2, 3, 4…, computes the replicates the formula requires with those degrees of freedom and stops at the first r that already covers the requirement. The “Search for the number of replicates” table shows each step and the plot compares required with assumed replicates.",
      "The difference d refers to the comparison of two treatment means with a t test, like the least significant difference, not to the overall F test. Because the CV enters squared, a poorly chosen CV changes the result a lot: use the one from trials with the same crop, variable, area and plot size."
    ],
    "modelo": {
      "tex": "r \\ge 2 (t_1 + t_2)^{2} \\left( \\frac{\\mathrm{CV}}{d} \\right)^{2}",
      "terminos": [
        ["r", "the replicates per treatment: the smallest integer that meets the condition"],
        ["t_1", "the 1 − α/2 quantile of t with the error degrees of freedom"],
        ["t_2", "the t quantile corresponding to the target power (1 − β), with the same degrees of freedom"],
        ["\\mathrm{CV}", "the expected coefficient of variation of the error, in %"],
        ["d", "the difference between two means you want to detect, in % of the mean"],
        ["\\nu", "the error degrees of freedom: k(r − 1) in completely randomized and (k − 1)(r − 1) in blocks, with k treatments"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_i = \\mu_j", "h1": "\\mu_i \\ne \\mu_j", "texto": "The comparison of two treatment means with a two-sided t test on the experiment’s error degrees of freedom; d is the difference to be detected with the requested power." }
    ],
    "supuestos": [
      { "nombre": "Representative expected CV", "como": "It is an assumption of the calculation: take it from previous trials with the same crop and variable (in SigmaPro, the CV reported by the analysis of a randomized complete block trial).", "verificar": "dbca", "siFalla": "If the actual CV turns out larger, power will be lower than requested; when in doubt, calculate with the highest CV you have seen in those trials.", "alternativa": null },
      { "nombre": "Normal error with constant variance", "como": "The t test assumes it; it is checked after the trial in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "With counts or percentages the CV changes with the mean: plan on the scale you will analyze (transformed) or take the result as approximate.", "alternativa": null },
      { "nombre": "Balanced completely randomized or complete block design", "como": "The error degrees of freedom are those of these two designs with r replicates of each treatment.", "verificar": null, "siFalla": "In other designs (split plots, lattices) the result is approximate, because the degrees of freedom and the error of each comparison are different.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "Expected coefficient of variation (%)", "tipo": "positive number", "papel": "error variation" },
        { "nombre": "Difference to detect (% of the mean)", "tipo": "positive number", "papel": "effect (d)" },
        { "nombre": "Treatments", "tipo": "integer from 2 up", "papel": "sets the error degrees of freedom" },
        { "nombre": "Design", "tipo": "choice: randomized complete blocks or completely randomized", "papel": "sets the error degrees of freedom" },
        { "nombre": "Target power and significance level", "tipo": "numbers between 0 and 1", "papel": "risks you accept (t₂ and t₁)" }
      ],
      "minimo": "No data are needed. The search starts at 2 replicates and stops at 1000; if more would be needed, the app asks you to check the CV and the difference.",
      "balance": "It assumes r replicates of each treatment (balanced design).",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. The CV and the difference are entered as percentages (12, not 0.12).",
      "errores": [
        "Entering the CV or the difference as a fraction (0.12) instead of a percentage (12).",
        "Using the CV from a trial with another plot size, another crop or another variable.",
        "Confusing the error CV with the CV of the raw data, which includes the effects of treatments and blocks.",
        "Expecting d to be the difference detected by the overall F: it is that of the comparison of two means."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the replicates needed with the CV, difference, treatments and design you gave.",
        "In the “Search for the number of replicates” table, the last row is the answer: the assumed replicates already cover those required with their error degrees of freedom.",
        "In the plot, the answer is the first point that falls below the diagonal.",
        "Repeat the calculation with other CVs or differences to see how sensitive the number is."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With an expected CV of 12 %, six treatments in randomized complete blocks, α = 0.05 and 80 % power, 11 replicates are required to detect a difference of 15 % of the mean between two treatments (Cochran and Cox formula).”",
      "guias": ["cv", "gl", "t", "potencia", "alfa", "tamano-muestra"]
    },
    "limitaciones": [
      "It refers to the comparison of two means; for the overall F test of several treatments use ANOVA power.",
      "It only distinguishes completely randomized from complete block designs; in other designs use it as an approximation.",
      "The result depends heavily on the assumed CV, which enters squared.",
      "It does not account for lost plots: if you expect to lose some, add one replicate."
    ],
    "referencias": [
      "Cochran, W. G., & Cox, G. M. (1957). Experimental designs (2nd ed.). Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "Steel, R. G. D., Torrie, J. H., & Dickey, D. A. (1997). Principles and procedures of statistics: A biometrical approach (3rd ed.). McGraw-Hill.",
      "Kuehl, R. O. (2000). Design of experiments: Statistical principles of research design and analysis (2nd ed.). Duxbury."
    ]
  }
});
