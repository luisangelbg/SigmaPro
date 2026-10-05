SP_FICHA({
  "id": "repetibilidad",
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": ["medidas-repetidas"],
  "relacionados": ["componentes-varianza", "heredabilidad", "medidas-repetidas", "modelo-mixto", "kappa"],
  "ejemplo": { "conjunto": "guayabo-cosechas", "entradas": { "respuesta": "rendimiento", "individuo": "arbol", "fijos": ["cosecha"] }, "opciones": {} },
  "formato": {
    "largo": [["arbol", "cosecha", "rendimiento"], ["G01", "2022", "36.2"], ["G01", "2023", "38.5"], ["G01", "2024", "35.4"], ["G01", "2025", "35.5"], ["G02", "2022", "40.5"], ["G02", "2023", "45.1"], ["G02", "2024", "NA"]],
    "ancho": [["arbol", "2022", "2023", "2024", "2025"], ["G01", "36.2", "38.5", "35.4", "35.5"], ["G02", "40.5", "45.1", "NA", "51.7"], ["G03", "48.5", "52.1", "29.2", "51.9"]]
  },
  "es": {
    "alias": ["Repetibilidad", "Coeficiente de repetibilidad", "Correlación intraclase", "Valor permanente"],
    "paraQue": "Mide qué tanto se parecen las medidas repetidas de un mismo individuo (árbol, planta, animal) y cuántas medidas hacen falta para conocer su valor permanente.",
    "preguntas": [
      "¿Bastan dos cosechas para saber qué árboles de guayabo son los más productivos, o hacen falta más?",
      "¿Qué tan constante es la producción de fruta de un clon de aguacate de un año a otro?",
      "¿Cuántas lecturas del contenido de clorofila por planta se necesitan para ordenar bien a las plantas?"
    ],
    "teoria": [
      "Cuando un mismo individuo se mide varias veces (cosechas, años, lecturas), cada medida combina un valor permanente del individuo, que reúne su genética y su ambiente permanente, y una desviación temporal propia de esa medida. La repetibilidad es la correlación entre dos medidas del mismo individuo: r = σ²u / (σ²u + σ²e), donde σ²u es la varianza entre individuos y σ²e la varianza temporal entre medidas. Va de 0 a 1 y es el límite superior de la heredabilidad del carácter.",
      "SigmaPro estima las dos varianzas por REML en tu navegador, con el individuo como efecto aleatorio y, si los indicas, hasta tres factores fijos (la cosecha, el año, el evaluador), cuyas diferencias de media se descuentan antes. Da r con su error estándar por el método delta y la prueba de razón de verosimilitudes de la varianza entre individuos. Con m medidas por individuo (media armónica), la determinación del valor permanente es R² = m·r / (1 + (m − 1)·r), y el número de medidas necesario para una determinación deseada, de 80 % a 99 %, es η = R²(1 − r) / [(1 − R²)·r].",
      "Por último predice el valor permanente de cada individuo (media general + BLUP), encogido hacia la media cuando tiene pocas medidas o la repetibilidad es baja, con su error y su confiabilidad. Una repetibilidad alta indica que pocas medidas bastan para elegir a los mejores individuos; una baja, que hacen falta muchas."
    ],
    "modelo": {
      "tex": "y_{ik} = \\mu + \\beta_k + u_i + \\varepsilon_{ik}, \\quad u_i \\sim \\mathcal{N}(0, \\sigma^2_u), \\quad r = \\frac{\\sigma^2_u}{\\sigma^2_u + \\sigma^2_e}",
      "terminos": [
        ["y_{ik}", "la medida k del individuo i"],
        ["\\beta_k", "los efectos fijos opcionales (la cosecha, el año o el evaluador de esa medida)"],
        ["u_i", "el efecto permanente del individuo i, con varianza entre individuos \\sigma^2_u (σ²i en los cuadros)"],
        ["\\varepsilon_{ik}", "la desviación temporal de esa medida, con varianza \\sigma^2_e"],
        ["r", "la repetibilidad: la correlación entre dos medidas del mismo individuo"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_u = 0", "h1": "\\sigma^2_u > 0", "texto": "Los individuos no difieren de manera permanente (r = 0). Razón de verosimilitudes restringidas contra el modelo sin individuos, con p de la mezcla ½χ²₀ + ½χ²₁." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis aplica Shapiro-Wilk a los residuos condicionales.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar) y vuelve a estimar.", "alternativa": null },
      { "nombre": "Normalidad de los efectos de individuo", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de los individuos (con 5 o más y varianza mayor que cero).", "verificar": null, "siFalla": "Revisa los individuos con valores permanentes extremos y sus datos.", "alternativa": null },
      { "nombre": "Sin observaciones atípicas", "como": "El semáforo cuenta los residuos que pasan de 3.5 desviaciones estándar del error.", "verificar": null, "siFalla": "Revisa esas medidas (errores de captura, daños por granizo o plagas) antes de interpretar.", "alternativa": null },
      { "nombre": "Misma correlación entre cualquier par de medidas", "como": "El modelo supone que dos cosechas cercanas se parecen igual que dos lejanas y que la varianza no cambia entre cosechas; no se prueba aquí.", "verificar": "medidas-repetidas", "siFalla": "Si la correlación baja con el tiempo o la varianza cambia mucho entre cosechas, compara estructuras de covarianza en medidas repetidas e interpreta r como un promedio.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "arbol", "tipo": "identificador", "papel": "individuo medido varias veces" },
        { "nombre": "cosecha", "tipo": "factor con k niveles (hasta 3 factores, opcional)", "papel": "factores fijos (cosecha, año, evaluador)" }
      ],
      "minimo": "Al menos 2 medidas por individuo en varios individuos (20 o más dan una estimación útil); la app exige que algún individuo tenga más de una medida.",
      "balance": "Tolera medidas perdidas: REML usa todas las que hay y el número de medidas por individuo se resume con la media armónica. Los individuos con menos medidas tienen valores permanentes más encogidos y menos confiables.",
      "notaFormato": "Formato largo: una fila por medida, con el individuo, los factores fijos (cosecha) y la respuesta. Si tienes una columna por cosecha, pásala a largo en Datos con «Ancha ⇄ larga».",
      "errores": [
        "Dejar los datos en formato ancho, con una columna por cosecha.",
        "No incluir la cosecha o el año como factor fijo cuando hubo años buenos y malos: esa diferencia se suma al error temporal y la repetibilidad baja.",
        "Usar identificadores que se repiten entre grupos (el árbol 1 de cada huerta) como si fueran el mismo individuo.",
        "Confundir repetibilidad con heredabilidad: r incluye el ambiente permanente del individuo, por eso es solo un límite superior."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: que el cálculo haya convergido y que la varianza entre individuos no haya quedado en cero.",
        "En el cuadro de componentes, compara la varianza entre individuos con el error temporal y lee su prueba de razón de verosimilitudes.",
        "Lee la repetibilidad r con su EE: baja si es menor que 0.3, media hasta 0.6 y alta desde 0.6.",
        "Mira la determinación R² que dan las medidas que ya tienes y, en el cuadro de medidas necesarias, cuántas harían falta para 80 % a 99 %.",
        "Ordena a los individuos por su valor permanente y fíjate en su confiabilidad."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La repetibilidad del rendimiento fue media (r = 0.48, EE = 0.10; χ² = 21.3, p < 0.001). Con 3.8 cosechas por árbol, la determinación del valor permanente fue R² = 0.78; para llegar a 90 % harían falta 10 cosechas».",
      "guias": ["repetibilidad", "componente", "blup", "confiabilidad", "lrt"]
    },
    "limitaciones": [
      "Supone la misma correlación entre todas las medidas y la misma varianza en cada una; si la correlación baja con el tiempo, revísalo con medidas repetidas.",
      "Es un límite superior de la heredabilidad, no la heredabilidad: para ella usa «Heredabilidad y BLUP de genotipos» con genotipos en un diseño.",
      "Para la concordancia entre evaluadores con escalas de categorías (sana, leve, severa), usa kappa.",
      "Un solo nivel de agrupamiento (el individuo); para árboles dentro de huertas o lotes usa componentes de varianza o el modelo mixto."
    ],
    "referencias": [
      "Falconer, D. S., & Mackay, T. F. C. (1996). Introduction to quantitative genetics (4th ed.). Longman.",
      "Lessells, C. M., & Boag, P. T. (1987). Unrepeatable repeatabilities: A common mistake. The Auk, 104(1), 116–121.",
      "Nakagawa, S., & Schielzeth, H. (2010). Repeatability for Gaussian and non-Gaussian data: A practical guide for biologists. Biological Reviews, 85(4), 935–956.",
      "Henderson, C. R. (1975). Best linear unbiased estimation and prediction under a selection model. Biometrics, 31(2), 423–447."
    ]
  },
  "en": {
    "alias": ["Repeatability", "Repeatability coefficient", "Intraclass correlation", "Permanent value"],
    "paraQue": "Measures how alike the repeated measurements of the same individual (tree, plant, animal) are and how many measurements are needed to know its permanent value.",
    "preguntas": [
      "Are two harvests enough to know which guava trees are the most productive, or are more needed?",
      "How constant is the fruit production of an avocado clone from one year to the next?",
      "How many chlorophyll readings per plant are needed to rank the plants well?"
    ],
    "teoria": [
      "When the same individual is measured several times (harvests, years, readings), each measurement combines a permanent value of the individual, which brings together its genetics and its permanent environment, and a temporary deviation specific to that measurement. Repeatability is the correlation between two measurements of the same individual: r = σ²u / (σ²u + σ²e), where σ²u is the variance among individuals and σ²e the temporary variance between measurements. It ranges from 0 to 1 and is the upper limit of the heritability of the trait.",
      "SigmaPro estimates both variances by REML in your browser, with the individual as a random effect and, if you give them, up to three fixed factors (harvest, year, rater), whose mean differences are removed first. It gives r with its standard error by the delta method and the likelihood ratio test of the variance among individuals. With m measurements per individual (harmonic mean), the determination of the permanent value is R² = m·r / (1 + (m − 1)·r), and the number of measurements needed for a desired determination, from 80% to 99%, is η = R²(1 − r) / [(1 − R²)·r].",
      "Finally it predicts the permanent value of each individual (overall mean + BLUP), shrunk toward the mean when it has few measurements or repeatability is low, with its error and reliability. A high repeatability means that a few measurements are enough to choose the best individuals; a low one, that many are needed."
    ],
    "modelo": {
      "tex": "y_{ik} = \\mu + \\beta_k + u_i + \\varepsilon_{ik}, \\quad u_i \\sim \\mathcal{N}(0, \\sigma^2_u), \\quad r = \\frac{\\sigma^2_u}{\\sigma^2_u + \\sigma^2_e}",
      "terminos": [
        ["y_{ik}", "measurement k of individual i"],
        ["\\beta_k", "the optional fixed effects (the harvest, year or rater of that measurement)"],
        ["u_i", "the permanent effect of individual i, with among-individual variance \\sigma^2_u (σ²i in the tables)"],
        ["\\varepsilon_{ik}", "the temporary deviation of that measurement, with variance \\sigma^2_e"],
        ["r", "repeatability: the correlation between two measurements of the same individual"]
      ]
    },
    "hipotesis": [
      { "h0": "\\sigma^2_u = 0", "h1": "\\sigma^2_u > 0", "texto": "Individuals do not differ permanently (r = 0). Restricted likelihood ratio against the model without individuals, with p from the mixture ½χ²₀ + ½χ²₁." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist applies Shapiro-Wilk to the conditional residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform) and estimate again.", "alternativa": null },
      { "nombre": "Normality of individual effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of the individuals (with 5 or more and a variance above zero).", "verificar": null, "siFalla": "Check the individuals with extreme permanent values and their data.", "alternativa": null },
      { "nombre": "No outlying observations", "como": "The assumptions checklist counts the residuals beyond 3.5 error standard deviations.", "verificar": null, "siFalla": "Check those measurements (data-entry errors, hail or pest damage) before interpreting.", "alternativa": null },
      { "nombre": "Same correlation between any pair of measurements", "como": "The model assumes that two close harvests are as alike as two distant ones and that the variance does not change between harvests; it is not tested here.", "verificar": "medidas-repetidas", "siFalla": "If the correlation decreases over time or the variance changes a lot between harvests, compare covariance structures in repeated measures and read r as an average.", "alternativa": "medidas-repetidas" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "arbol", "tipo": "identifier", "papel": "individual measured several times" },
        { "nombre": "cosecha", "tipo": "factor with k levels (up to 3 factors, optional)", "papel": "fixed factors (harvest, year, rater)" }
      ],
      "minimo": "At least 2 measurements per individual on several individuals (20 or more give a useful estimate); the app requires at least one individual with more than one measurement.",
      "balance": "It tolerates missing measurements: REML uses all those available and the number of measurements per individual is summarized with the harmonic mean. Individuals with fewer measurements have more shrunken and less reliable permanent values.",
      "notaFormato": "Long format: one row per measurement, with the individual, the fixed factors (harvest) and the response. If you have one column per harvest, reshape it to long in Data with “Wide ⇄ long”.",
      "errores": [
        "Leaving the data in wide format, with one column per harvest.",
        "Not including the harvest or year as a fixed factor when there were good and bad years: that difference is added to the temporary error and repeatability drops.",
        "Using identifiers that repeat across groups (tree 1 of each orchard) as if they were the same individual.",
        "Confusing repeatability with heritability: r includes the permanent environment of the individual, so it is only an upper limit."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: that the computation converged and that the among-individual variance did not end up at zero.",
        "In the components table, compare the among-individual variance with the temporary error and read its likelihood ratio test.",
        "Read the repeatability r with its SE: low below 0.3, medium up to 0.6 and high from 0.6.",
        "Look at the determination R² given by the measurements you already have and, in the table of measurements needed, how many would be required for 80% to 99%.",
        "Rank the individuals by their permanent value and look at their reliability."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield repeatability was medium (r = 0.48, SE = 0.10; χ² = 21.3, p < 0.001). With 3.8 harvests per tree, the determination of the permanent value was R² = 0.78; reaching 90% would require 10 harvests.”",
      "guias": ["repetibilidad", "componente", "blup", "confiabilidad", "lrt"]
    },
    "limitaciones": [
      "It assumes the same correlation between all measurements and the same variance for each; if the correlation decreases over time, check it with repeated measures.",
      "It is an upper limit of heritability, not heritability: for that use “Heritability and genotype BLUPs” with genotypes in a design.",
      "For agreement between raters on category scales (healthy, mild, severe), use kappa.",
      "A single grouping level (the individual); for trees within orchards or lots use variance components or the mixed model."
    ],
    "referencias": [
      "Falconer, D. S., & Mackay, T. F. C. (1996). Introduction to quantitative genetics (4th ed.). Longman.",
      "Lessells, C. M., & Boag, P. T. (1987). Unrepeatable repeatabilities: A common mistake. The Auk, 104(1), 116–121.",
      "Nakagawa, S., & Schielzeth, H. (2010). Repeatability for Gaussian and non-Gaussian data: A practical guide for biologists. Biological Reviews, 85(4), 935–956.",
      "Henderson, C. R. (1975). Best linear unbiased estimation and prediction under a selection model. Biometrics, 31(2), 423–447."
    ]
  }
});
