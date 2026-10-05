SP_FICHA({
  "id": "tamano-muestra",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "una-muestra",
  "disenos": ["muestreo"],
  "relacionados": ["muestreo-simple", "muestreo-estratificado", "potencia-medias", "descriptivos", "proporciones"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Tamaño de muestra para estimar", "Tamaño de muestra de Cochran", "Tamaño de muestra con población finita"],
    "paraQue": "Calcula cuántas plantas, frutos, árboles o parcelas debes muestrear para estimar una media o una proporción con el error máximo que aceptas.",
    "preguntas": [
      "¿Cuántos árboles de una huerta de 900 debo revisar para estimar el porcentaje con trips con un error de ± 5 puntos?",
      "¿Cuántos frutos debo pesar para estimar el peso medio con un error de ± 10 % de la media si el CV ronda 20 %?",
      "¿Cuántas plantas de un lote hay que medir para conocer la altura media con un error de ± 2 cm?"
    ],
    "teoria": [
      "Cuando el objetivo no es comparar tratamientos sino estimar una característica de una población (el peso medio del fruto en una huerta, la incidencia de una plaga en un lote), la pregunta es cuántas unidades medir para que el intervalo de confianza quede dentro de un error aceptable. Cochran la resuelve igualando la semiamplitud del intervalo, z por el error estándar, con el error e que aceptas.",
      "Para una media, el tamaño inicial es n₀ = (z·S/e)², donde S es la desviación estándar esperada; si prefieres trabajar en porcentaje, S es el CV y e un porcentaje de la media. Para una proporción, n₀ = z²·p(1 − p)/e², con p la proporción esperada: si no la conoces, p = 0.5 da el tamaño más grande y, por tanto, el más seguro. El valor z sale de la normal para el nivel de confianza (1.96 al 95 %). Si la población es finita y conoces su tamaño N (los árboles de la huerta, los sacos del almacén), la corrección por población finita reduce la muestra: n = n₀/(1 + n₀/N) para una media y n = n₀/[1 + (n₀ − 1)/N] para una proporción, cuya varianza lleva el factor (N − n)/(N − 1). La corrección pesa cuando la muestra es una parte apreciable de la población; con N muy grande, n es casi n₀.",
      "SigmaPro muestra z, n₀, la n corregida y la redondeada hacia arriba, y una gráfica del tamaño de muestra según el error aceptado: reducir el error a la mitad cuadruplica la muestra cuando la población es grande. El cálculo supone muestreo aleatorio simple; con muestreo por estratos, por conglomerados o sistemático, el tamaño necesario es otro."
    ],
    "modelo": {
      "tex": "n_0 = \\left( \\frac{z S}{e} \\right)^{2} \\quad \\text{o} \\quad n_0 = \\frac{z^{2} p (1 - p)}{e^{2}}, \\qquad n = \\frac{n_0}{1 + \\frac{n_0}{N}} \\quad \\text{o} \\quad n = \\frac{n_0}{1 + \\frac{n_0 - 1}{N}}",
      "terminos": [
        ["n_0", "el tamaño de muestra sin la corrección por población finita"],
        ["z", "el cuantil de la normal estándar para la confianza pedida (1.96 al 95 %)"],
        ["S", "la desviación estándar esperada (o el CV, si el error va en % de la media)"],
        ["e", "el error máximo aceptable (±): en unidades de la variable, en % de la media o en proporción"],
        ["p", "la proporción esperada"],
        ["N", "el tamaño de la población; con N = 0 (población grande) no se corrige"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Muestreo aleatorio simple", "como": "La fórmula supone que cada unidad de la población tiene la misma probabilidad de entrar en la muestra; no se revisa con datos.", "verificar": null, "siFalla": "Si la población tiene partes muy distintas (huertas, lotes, tipos de suelo), muestrear por estratos suele dar el mismo error con menos unidades.", "alternativa": "muestreo-estratificado" },
      { "nombre": "Variación esperada bien estimada", "como": "La DE, el CV o la proporción son supuestos: tómalos de un muestreo previo o de la literatura (en SigmaPro, de «Estadísticos descriptivos» o de «Proporciones e intervalos de confianza» de un muestreo piloto).", "verificar": "descriptivos", "siFalla": "Si la variación real resulta mayor, el error será mayor que el planeado: usa el valor más alto razonable o, para proporciones, p = 0.5.", "alternativa": null },
      { "nombre": "Aproximación normal", "como": "El cálculo usa z de la normal; con muestras chicas o proporciones extremas es optimista.", "verificar": null, "siFalla": "Si la n calculada es muy pequeña (menos de unas 30 unidades) o la proporción esperada está muy cerca de 0 o de 1, añade un margen.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "¿Qué se quiere estimar?", "tipo": "elección: una media o una proporción", "papel": "objetivo" },
        { "nombre": "La variación y el error se dan", "tipo": "elección: en las unidades de la variable (DE y ± e) o en porcentaje de la media (CV y ± %)", "papel": "escala, solo para medias" },
        { "nombre": "Desviación estándar o CV esperados", "tipo": "número positivo", "papel": "variación (S)" },
        { "nombre": "Proporción esperada", "tipo": "número entre 0 y 1", "papel": "solo para proporciones (p)" },
        { "nombre": "Error máximo aceptable", "tipo": "número positivo (en proporciones, menor que 1)", "papel": "precisión (e)" },
        { "nombre": "Tamaño de la población y nivel de confianza", "tipo": "entero de 0 en adelante (0 si es muy grande); 90, 95 o 99 %", "papel": "corrección por población finita y valor de z" }
      ],
      "minimo": "No hacen falta datos. La DE, el CV o la proporción esperados conviene sacarlos de un muestreo piloto de unas 20 o 30 unidades, o de la literatura.",
      "balance": "No aplica. Con N mayor que 0 la app aplica la corrección por población finita e informa también el tamaño sin ella.",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. Las proporciones y su error van entre 0 y 1 (± 5 puntos es 0.05).",
      "errores": [
        "Escribir el error de una proporción en porcentaje (5) en vez de en proporción (0.05).",
        "Mezclar escalas: la DE en unidades de la variable con el error en porcentaje de la media, o al revés.",
        "Usar una proporción esperada extrema sin respaldo: si no la conoces, 0.5 es la opción segura.",
        "Olvidar que la n vale para cada población que quieras estimar por separado: si quieres una estimación por huerta, calcula una n por huerta."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: las unidades necesarias y, con población finita, cuántas serían sin la corrección.",
        "En el cuadro revisa z, n₀, la n corregida y la redondeada hacia arriba.",
        "Mira la gráfica del tamaño de muestra según el error para buscar un equilibrio entre precisión y costo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Para estimar la proporción de árboles con trips (esperada de 0.3) con un error de ± 0.05 y 95 % de confianza en una huerta de 900 árboles, se necesitan 238 árboles (323 sin la corrección por población finita), según las fórmulas de Cochran (1977)».",
      "guias": ["tamano-muestra", "ic", "ee", "de", "cv"]
    },
    "limitaciones": [
      "Supone muestreo aleatorio simple; con estratos, analiza y reparte la muestra con el muestreo estratificado (asignación de Neyman).",
      "Sirve para estimar, no para comparar: para detectar diferencias entre tratamientos usa los cálculos de potencia.",
      "Usa la z de la normal; con muestras pequeñas el intervalo real, que usa t, sale algo más ancho.",
      "La corrección por población finita supone que las unidades se eligen sin reemplazo; la app usa n₀/(1 + n₀/N) para una media y la forma de Cochran n₀/[1 + (n₀ − 1)/N] para una proporción."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole.",
      "Thompson, S. K. (2012). Sampling (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Sample size for estimation", "Cochran’s sample size", "Sample size with a finite population"],
    "paraQue": "Calculates how many plants, fruits, trees or plots you should sample to estimate a mean or a proportion within the maximum error you accept.",
    "preguntas": [
      "How many trees of a 900-tree orchard should I inspect to estimate the percentage with thrips within ± 5 points?",
      "How many fruits should I weigh to estimate the mean weight within ± 10 % of the mean if the CV is around 20 %?",
      "How many plants of a field must be measured to know the mean height within ± 2 cm?"
    ],
    "teoria": [
      "When the goal is not to compare treatments but to estimate a characteristic of a population (the mean fruit weight in an orchard, the incidence of a pest in a field), the question is how many units to measure so that the confidence interval stays within an acceptable error. Cochran answers it by setting the half-width of the interval, z times the standard error, equal to the error e you accept.",
      "For a mean, the initial size is n₀ = (z·S/e)², where S is the expected standard deviation; if you prefer working in percentages, S is the CV and e a percentage of the mean. For a proportion, n₀ = z²·p(1 − p)/e², with p the expected proportion: if you do not know it, p = 0.5 gives the largest and therefore safest size. The z value comes from the normal for the confidence level (1.96 at 95 %). If the population is finite and you know its size N (the trees in the orchard, the sacks in the warehouse), the finite population correction reduces the sample: n = n₀/(1 + n₀/N) for a mean and n = n₀/[1 + (n₀ − 1)/N] for a proportion, whose variance carries the factor (N − n)/(N − 1). The correction matters when the sample is an appreciable part of the population; with a very large N, n is almost n₀.",
      "SigmaPro shows z, n₀, the corrected n and the rounded-up n, plus a plot of sample size by acceptable error: halving the error quadruples the sample when the population is large. The calculation assumes simple random sampling; with stratified, cluster or systematic sampling, the required size is different."
    ],
    "modelo": {
      "tex": "n_0 = \\left( \\frac{z S}{e} \\right)^{2} \\quad \\text{or} \\quad n_0 = \\frac{z^{2} p (1 - p)}{e^{2}}, \\qquad n = \\frac{n_0}{1 + \\frac{n_0}{N}} \\quad \\text{or} \\quad n = \\frac{n_0}{1 + \\frac{n_0 - 1}{N}}",
      "terminos": [
        ["n_0", "the sample size without the finite population correction"],
        ["z", "the standard normal quantile for the requested confidence (1.96 at 95 %)"],
        ["S", "the expected standard deviation (or the CV, if the error is in % of the mean)"],
        ["e", "the maximum acceptable error (±): in units of the variable, in % of the mean or as a proportion"],
        ["p", "the expected proportion"],
        ["N", "the population size; with N = 0 (large population) no correction is made"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Simple random sampling", "como": "The formula assumes that every unit in the population has the same probability of entering the sample; it is not tested with data.", "verificar": null, "siFalla": "If the population has very different parts (orchards, fields, soil types), sampling by strata usually gives the same error with fewer units.", "alternativa": "muestreo-estratificado" },
      { "nombre": "Well-estimated expected variation", "como": "The SD, the CV or the proportion are assumptions: take them from a previous survey or the literature (in SigmaPro, from “Descriptive statistics” or “Proportions and confidence intervals” of a pilot sample).", "verificar": "descriptivos", "siFalla": "If the actual variation turns out larger, the error will be larger than planned: use the highest reasonable value or, for proportions, p = 0.5.", "alternativa": null },
      { "nombre": "Normal approximation", "como": "The calculation uses the normal z; with small samples or extreme proportions it is optimistic.", "verificar": null, "siFalla": "If the calculated n is very small (fewer than about 30 units) or the expected proportion is very close to 0 or 1, add a margin.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "What is to be estimated?", "tipo": "choice: a mean or a proportion", "papel": "goal" },
        { "nombre": "Variation and error are given", "tipo": "choice: in the units of the variable (SD and ± e) or as a percentage of the mean (CV and ± %)", "papel": "scale, only for means" },
        { "nombre": "Expected standard deviation or CV", "tipo": "positive number", "papel": "variation (S)" },
        { "nombre": "Expected proportion", "tipo": "number between 0 and 1", "papel": "only for proportions (p)" },
        { "nombre": "Maximum acceptable error", "tipo": "positive number (for proportions, less than 1)", "papel": "precision (e)" },
        { "nombre": "Population size and confidence level", "tipo": "integer from 0 up (0 if very large); 90, 95 or 99 %", "papel": "finite population correction and z value" }
      ],
      "minimo": "No data are needed. The expected SD, CV or proportion are best taken from a pilot sample of about 20 or 30 units, or from the literature.",
      "balance": "Not applicable. With N greater than 0 the app applies the finite population correction and also reports the size without it.",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. Proportions and their error go between 0 and 1 (± 5 points is 0.05).",
      "errores": [
        "Entering the error of a proportion as a percentage (5) instead of a proportion (0.05).",
        "Mixing scales: the SD in units of the variable with the error as a percentage of the mean, or the other way around.",
        "Using an extreme expected proportion without support: if you do not know it, 0.5 is the safe choice.",
        "Forgetting that n applies to each population you want to estimate separately: if you want one estimate per orchard, calculate one n per orchard."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the units needed and, with a finite population, how many there would be without the correction.",
        "In the table, check z, n₀, the corrected n and the rounded-up n.",
        "Look at the plot of sample size by error to find a balance between precision and cost."
      ],
      "ejemplo": "Example write-up (illustrative figures): “To estimate the proportion of trees with thrips (expected to be 0.3) within ± 0.05 at 95 % confidence in a 900-tree orchard, 238 trees are needed (323 without the finite population correction), according to Cochran’s (1977) formulas.”",
      "guias": ["tamano-muestra", "ic", "ee", "de", "cv"]
    },
    "limitaciones": [
      "It assumes simple random sampling; with strata, analyze and allocate the sample with stratified sampling (Neyman allocation).",
      "It is for estimating, not comparing: to detect differences between treatments use the power calculations.",
      "It uses the normal z; with small samples the actual interval, which uses t, is somewhat wider.",
      "The finite population correction assumes units are chosen without replacement; the app uses n₀/(1 + n₀/N) for a mean and Cochran’s form n₀/[1 + (n₀ − 1)/N] for a proportion."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole.",
      "Thompson, S. K. (2012). Sampling (3rd ed.). Wiley."
    ]
  }
});
