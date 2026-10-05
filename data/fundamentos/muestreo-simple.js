SP_FICHA({
  "id": "muestreo-simple",
  "familia": "potencia",
  "respuesta": "continua",
  "estructura": "una-muestra",
  "disenos": ["muestreo"],
  "relacionados": ["muestreo-estratificado", "tamano-muestra", "descriptivos", "proporciones"],
  "ejemplo": { "conjunto": "aguacate-huertas", "entradas": { "respuesta": "rendimiento_kg" }, "opciones": { "N": 1580 } },
  "formato": {
    "largo": [["huerta", "arbol", "rendimiento_kg", "con_trips"], ["Ladera", "1", "45.8", "0"], ["Ladera", "2", "42.6", "0"], ["Ladera", "3", "41.2", "0"], ["Ladera", "4", "53.8", "0"], ["Ladera", "5", "55.5", "0"], ["Ladera", "6", "52.8", "0"], ["Ladera", "7", "51.9", "0"], ["Ladera", "8", "43.4", "1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Muestreo aleatorio simple", "Estimación de la media y el total", "Corrección por población finita"],
    "paraQue": "Estima la media (o la proporción) y el total de una población a partir de una muestra tomada al azar, con su error estándar y su intervalo de confianza.",
    "preguntas": [
      "¿Cuál es la producción media por árbol y la cosecha total de una huerta de 1580 árboles si pesé la fruta de 36 árboles tomados al azar?",
      "¿Qué proporción de las plantas de un lote tiene síntomas de virosis, a partir de 150 plantas revisadas al azar?",
      "¿Cuántos kilogramos de grano hay en un almacén, estimados con el peso de 40 sacos elegidos al azar?"
    ],
    "teoria": [
      "En el muestreo aleatorio simple cada unidad de la población tiene la misma probabilidad de entrar en la muestra. La media muestral estima sin sesgo la media de la población, y su error estándar mide cuánto cambiaría de una muestra a otra: s/√n cuando la población es muy grande. Si la población es finita y la muestra es una parte apreciable de ella, el error es menor, porque ya se observó una fracción f = n/N de las unidades: el error estándar se multiplica por √(1 − f), la corrección por población finita.",
      "SigmaPro calcula la media, la varianza, el error estándar, el CV y el intervalo de confianza con la t de n − 1 grados de libertad. Si das el tamaño de la población N, aplica la corrección y estima además el total, N·ȳ, con su error estándar N·EE(ȳ). Si la columna solo vale 0 y 1 (presencia de una plaga, planta enferma), en modo automático estima una proporción: la media de los ceros y unos es la proporción p̂ y su varianza es p̂(1 − p̂)·n/(n − 1), como en Cochran. Las celdas vacías se excluyen. La gráfica muestra cómo cambiaría la semiamplitud del intervalo con otros tamaños de muestra, con la varianza observada.",
      "Estas fórmulas solo valen si la muestra se tomó al azar. Si se escogieron las plantas más accesibles o las de la orilla, o si la población tiene partes muy distintas que se muestrearon en proporciones distintas a su tamaño, la media simple puede estar sesgada: en ese caso conviene el muestreo estratificado."
    ],
    "modelo": {
      "tex": "\\bar{y} = \\frac{1}{n} \\sum_{i=1}^{n} y_i, \\quad \\mathrm{EE}(\\bar{y}) = \\sqrt{(1 - f) \\frac{s^{2}}{n}}, \\quad f = \\frac{n}{N}, \\quad \\bar{y} \\pm t_{n - 1} \\cdot \\mathrm{EE}(\\bar{y}), \\quad \\hat{Y} = N \\bar{y}",
      "terminos": [
        ["y_i", "el valor medido en la unidad i de la muestra"],
        ["n, N", "el tamaño de la muestra y el de la población; sin N (N = 0), f = 0"],
        ["s^{2}", "la varianza de la muestra; con datos 0/1, p̂(1 − p̂)·n/(n − 1)"],
        ["f", "la fracción de muestreo"],
        ["t_{n - 1}", "el cuantil de la t con n − 1 grados de libertad para la confianza pedida"],
        ["\\hat{Y}", "el total estimado de la población, con error estándar N·EE(ȳ)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Muestra tomada al azar", "como": "Depende de cómo se eligieron las unidades; no se revisa con los datos.", "verificar": null, "siFalla": "Si la muestra se tomó por partes (huertas, lotes) en proporciones distintas a su tamaño, usa el muestreo estratificado, que pesa cada parte por su tamaño.", "alternativa": "muestreo-estratificado" },
      { "nombre": "Media muestral aproximadamente normal", "como": "El intervalo usa la t; con muestras chicas y datos muy asimétricos, revisa la distribución en «Estadísticos descriptivos».", "verificar": "descriptivos", "siFalla": "Con pocos datos muy asimétricos o con valores extremos, aumenta la muestra o interpreta el intervalo con cautela.", "alternativa": null },
      { "nombre": "Proporción lejos de 0 y de 1 (con datos 0/1)", "como": "El intervalo de la proporción es el de Wald con t: funciona bien cuando n·p̂ y n·(1 − p̂) pasan de 5 o 10.", "verificar": null, "siFalla": "Con pocas unidades o proporciones extremas, usa los intervalos de Wilson o de Clopper-Pearson de «Proporciones e intervalos de confianza» (estos no llevan la corrección por población finita).", "alternativa": "proporciones" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "numérica continua", "papel": "variable medida en la muestra" },
        { "nombre": "con_trips", "tipo": "binaria (0/1)", "papel": "otra variable posible: con ella se estima la proporción de árboles con trips" }
      ],
      "minimo": "Al menos 2 observaciones; para un intervalo confiable conviene tener 20 o 30 o más. Si das N, debe ser mayor o igual que la muestra.",
      "balance": "Las celdas vacías de la variable se excluyen (en el ejemplo, dos pesadas perdidas: n = 36 de 38 árboles). Las demás columnas no intervienen.",
      "notaFormato": "Formato largo: una fila por unidad muestreada, con la variable medida en una columna. El tamaño de la población (N; en el ejemplo, 1580 árboles), qué estimar (automático, media o proporción) y el nivel de confianza se eligen en el formulario. Ojo: en el conjunto de ejemplo los árboles se tomaron por huerta (12, 16 y 10) y no en proporción a sus 420, 900 y 260 árboles; aquí sirve para practicar el cálculo, pero para esos datos la estimación correcta es la estratificada (54.3 kg por árbol frente a 51.9 kg de la media simple).",
      "errores": [
        "Escribir como N el número de unidades muestreadas: N es el total de unidades de la población (todos los árboles de la huerta).",
        "Capturar promedios de grupos de plantas en lugar de una fila por unidad muestreada.",
        "Analizar como aleatoria una muestra tomada por conveniencia (las plantas de la orilla o las más fáciles de alcanzar).",
        "Pedir una proporción con una columna que no es 0/1 (por ejemplo, 1 y 2): recodifícala antes.",
        "Usar el muestreo simple cuando la muestra se tomó por estratos en proporciones distintas a su tamaño."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: la media (o la proporción) con su intervalo y su error estándar y, si diste N, el total.",
        "En el cuadro de estimación revisa n, la fracción de muestreo f y el CV.",
        "Mira la gráfica de precisión según el tamaño de muestra para planear el próximo muestreo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas, como si los 36 árboles se hubieran tomado al azar de toda la plantación): «Con una muestra aleatoria simple de 36 de los 1580 árboles, la producción media fue de 51.9 kg por árbol (EE = 1.98; IC 95 %: 47.9 a 55.9) y la cosecha total estimada, de 82 000 kg (EE = 3120 kg)».",
      "guias": ["media", "ee", "ic", "cv", "n"]
    },
    "limitaciones": [
      "Si la población tiene partes muy distintas (huertas, lotes, suelos), el muestreo estratificado da estimaciones más precisas y sin el sesgo de una muestra desbalanceada entre partes.",
      "El intervalo de una proporción es el de Wald; con pocas unidades o proporciones extremas, usa Wilson o Clopper-Pearson.",
      "No sirve para muestreos por conglomerados (plantas dentro de surcos elegidos al azar) ni sistemáticos: su error estándar es otro."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole.",
      "Thompson, S. K. (2012). Sampling (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Simple random sampling", "Estimation of the mean and total", "Finite population correction"],
    "paraQue": "Estimates the mean (or proportion) and the total of a population from a random sample, with its standard error and confidence interval.",
    "preguntas": [
      "What are the mean yield per tree and the total harvest of a 1580-tree orchard if I weighed the fruit of 36 randomly chosen trees?",
      "What proportion of the plants in a field shows virus symptoms, based on 150 plants inspected at random?",
      "How many kilograms of grain are in a warehouse, estimated from the weight of 40 randomly chosen sacks?"
    ],
    "teoria": [
      "In simple random sampling every unit in the population has the same probability of entering the sample. The sample mean is an unbiased estimate of the population mean, and its standard error measures how much it would change from one sample to another: s/√n when the population is very large. If the population is finite and the sample is an appreciable part of it, the error is smaller, because a fraction f = n/N of the units has already been observed: the standard error is multiplied by √(1 − f), the finite population correction.",
      "SigmaPro calculates the mean, variance, standard error, CV and the confidence interval with the t on n − 1 degrees of freedom. If you give the population size N, it applies the correction and also estimates the total, N·ȳ, with standard error N·SE(ȳ). If the column only takes 0 and 1 (presence of a pest, diseased plant), in automatic mode it estimates a proportion: the mean of the zeros and ones is the proportion p̂ and its variance is p̂(1 − p̂)·n/(n − 1), as in Cochran. Empty cells are excluded. The plot shows how the half-width of the interval would change with other sample sizes, using the observed variance.",
      "These formulas hold only if the sample was taken at random. If the most accessible plants or those on the edge were chosen, or if the population has very different parts that were sampled out of proportion to their size, the simple mean can be biased: stratified sampling is then the better choice."
    ],
    "modelo": {
      "tex": "\\bar{y} = \\frac{1}{n} \\sum_{i=1}^{n} y_i, \\quad \\mathrm{SE}(\\bar{y}) = \\sqrt{(1 - f) \\frac{s^{2}}{n}}, \\quad f = \\frac{n}{N}, \\quad \\bar{y} \\pm t_{n - 1} \\cdot \\mathrm{SE}(\\bar{y}), \\quad \\hat{Y} = N \\bar{y}",
      "terminos": [
        ["y_i", "the value measured on unit i of the sample"],
        ["n, N", "the sample size and the population size; without N (N = 0), f = 0"],
        ["s^{2}", "the sample variance; with 0/1 data, p̂(1 − p̂)·n/(n − 1)"],
        ["f", "the sampling fraction"],
        ["t_{n - 1}", "the t quantile with n − 1 degrees of freedom for the requested confidence"],
        ["\\hat{Y}", "the estimated population total, with standard error N·SE(ȳ)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Sample taken at random", "como": "It depends on how the units were chosen; it is not checked with the data.", "verificar": null, "siFalla": "If the sample was taken by parts (orchards, fields) out of proportion to their size, use stratified sampling, which weights each part by its size.", "alternativa": "muestreo-estratificado" },
      { "nombre": "Approximately normal sample mean", "como": "The interval uses t; with small samples and very skewed data, check the distribution in “Descriptive statistics”.", "verificar": "descriptivos", "siFalla": "With few, very skewed data or extreme values, increase the sample or interpret the interval with caution.", "alternativa": null },
      { "nombre": "Proportion away from 0 and 1 (with 0/1 data)", "como": "The interval for the proportion is the Wald interval with t: it works well when n·p̂ and n·(1 − p̂) exceed 5 or 10.", "verificar": null, "siFalla": "With few units or extreme proportions, use the Wilson or Clopper-Pearson intervals in “Proportions and confidence intervals” (these do not include the finite population correction).", "alternativa": "proporciones" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "continuous numeric", "papel": "variable measured in the sample" },
        { "nombre": "con_trips", "tipo": "binary (0/1)", "papel": "another possible variable: with it the proportion of trees with thrips is estimated" }
      ],
      "minimo": "At least 2 observations; for a reliable interval, 20 or 30 or more are advisable. If you give N, it must be at least the sample size.",
      "balance": "Empty cells of the variable are excluded (in the example, two missing weighings: n = 36 of 38 trees). The other columns play no part.",
      "notaFormato": "Long format: one row per sampled unit, with the measured variable in one column. The population size (N; in the example, 1580 trees), what to estimate (automatic, mean or proportion) and the confidence level are chosen in the form. Note: in the example data set the trees were drawn by orchard (12, 16 and 10), not in proportion to their 420, 900 and 260 trees; here it serves to practice the calculation, but for those data the correct estimate is the stratified one (54.3 kg per tree against 51.9 kg from the simple mean).",
      "errores": [
        "Entering the number of sampled units as N: N is the total number of units in the population (all the trees in the orchard).",
        "Entering averages of groups of plants instead of one row per sampled unit.",
        "Analyzing a convenience sample (edge plants or the easiest to reach) as if it were random.",
        "Asking for a proportion with a column that is not 0/1 (for example, 1 and 2): recode it first.",
        "Using simple sampling when the sample was taken by strata out of proportion to their size."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the mean (or proportion) with its interval and standard error and, if you gave N, the total.",
        "In the estimation table, check n, the sampling fraction f and the CV.",
        "Look at the plot of precision by sample size to plan the next survey."
      ],
      "ejemplo": "Example write-up (illustrative figures, as if the 36 trees had been drawn at random from the whole plantation): “With a simple random sample of 36 of the 1580 trees, mean yield was 51.9 kg per tree (SE = 1.98; 95 % CI: 47.9 to 55.9) and the estimated total harvest was 82,000 kg (SE = 3120 kg).”",
      "guias": ["media", "ee", "ic", "cv", "n"]
    },
    "limitaciones": [
      "If the population has very different parts (orchards, fields, soils), stratified sampling gives more precise estimates without the bias of a sample unbalanced across parts.",
      "The interval for a proportion is the Wald interval; with few units or extreme proportions, use Wilson or Clopper-Pearson.",
      "It is not meant for cluster sampling (plants within randomly chosen rows) or systematic sampling: their standard error is different."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole.",
      "Thompson, S. K. (2012). Sampling (3rd ed.). Wiley."
    ]
  }
});
