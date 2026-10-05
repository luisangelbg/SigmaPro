SP_FICHA({
  "id": "proporciones",
  "familia": "descriptiva",
  "respuesta": "proporcion",
  "estructura": "k-grupos",
  "disenos": ["ninguno", "muestreo"],
  "relacionados": ["glm-proporciones", "tabla-contingencia", "bondad-ajuste", "frecuencias", "potencia-proporciones", "tamano-muestra"],
  "ejemplo": { "conjunto": "frijol", "entradas": { "exitos": "germinadas", "ensayos": "sembradas", "grupo": "tratamiento" }, "opciones": { "metodos": ["wilson", "clopper_pearson"] } },
  "formato": {
    "largo": [["caja", "tratamiento", "sembradas", "germinadas"], ["C01", "Testigo", "50", "17"], ["C02", "Testigo", "50", "8"], ["C03", "Testigo", "50", "19"], ["C04", "Testigo", "50", "12"], ["C05", "Remojo 24 h", "50", "33"], ["C06", "Remojo 24 h", "50", "22"]],
    "ancho": null
  },
  "es": {
    "alias": ["Intervalo de confianza de una proporción", "Intervalo de Wilson", "Intervalo exacto de Clopper-Pearson", "Proporción binomial"],
    "paraQue": "Estima qué proporción de las unidades cumple una condición (germinó, murió, está enferma) y da su intervalo de confianza con hasta seis métodos.",
    "preguntas": [
      "¿Qué porcentaje de germinación alcanza cada tratamiento pregerminativo del frijol y con qué precisión se conoce?",
      "¿Qué proporción de los árboles de una huerta tiene trips?",
      "¿Qué incidencia de una enfermedad hay en un lote, si de 120 plantas revisadas 9 estaban enfermas?"
    ],
    "teoria": [
      "Cuando cada unidad tiene solo dos resultados posibles (germina o no, vive o muere), lo que se estima es una proporción: el número de éxitos x entre el número de ensayos n. Si los ensayos son independientes y todos tienen la misma probabilidad de éxito, x sigue una distribución binomial, y su variación depende de la propia proporción: es mayor cerca de 50 % y menor cerca de 0 o de 100 %.",
      "SigmaPro acepta dos formas de datos: un factor cuyas categorías se cuentan (cada fila es una unidad y se da la proporción de cada categoría), o dos columnas numéricas con los éxitos y los ensayos de cada fila (por ejemplo, semillas germinadas y sembradas por caja). En la segunda forma suma los éxitos y los ensayos de todas las filas de cada grupo y da una proporción por grupo.",
      "Para el intervalo de confianza ofrece seis métodos. El de Wald, p ± z·EE, es el de los libros de texto, pero su cobertura real es mala con pocos ensayos o con proporciones cercanas a 0 o 1: la app lo conserva solo como referencia y avisa cuando hay menos de 30 ensayos. Los de Wilson (por puntaje), Jeffreys (bayesiano, con previa beta de un medio y un medio) y Agresti-Coull tienen una cobertura cercana a la pedida; Brown, Cai y DasGupta recomiendan el de Wilson o el de Jeffreys. El de Clopper-Pearson es exacto, por la distribución beta, y por eso conservador: su cobertura nunca baja de la pedida y suele pasarla. Wilson con corrección por continuidad reproduce el de prop.test de R."
    ],
    "modelo": {
      "tex": "\\hat{p} = \\frac{x}{n}, \\quad \\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z \\sqrt{\\frac{\\hat{p}(1 - \\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}",
      "terminos": [
        ["x", "el número de éxitos del grupo (germinadas, enfermas…)"],
        ["n", "el número de ensayos del grupo (sembradas, revisadas…)"],
        ["\\hat{p}", "la proporción estimada"],
        ["z", "el cuantil de la normal estándar para la confianza elegida (1.96 con 95 %)"],
        ["\\pm", "da los dos límites del intervalo de Wilson: el inferior con − y el superior con +"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Ensayos independientes", "como": "Lo da el diseño: cada semilla, planta o insecto responde por su cuenta. No se prueba con los datos.", "verificar": null, "siFalla": "Si las semillas de una misma caja se parecen entre sí (efecto de caja), los ensayos no son independientes y el intervalo queda demasiado estrecho; analiza las cajas como repeticiones con un modelo binomial.", "alternativa": "glm-proporciones" },
      { "nombre": "La misma probabilidad de éxito dentro de cada grupo", "como": "SigmaPro suma las cajas de un grupo como si fueran una sola muestra. Compara el porcentaje de las cajas de cada grupo con los estadísticos descriptivos (por ejemplo, de la columna germinacion).", "verificar": "descriptivos", "siFalla": "Si las repeticiones de un tratamiento difieren más de lo que permite la binomial (sobredispersión), usa el modelo binomial con la dispersión estimada (cuasibinomial) o con bloques aleatorios.", "alternativa": "glm-proporciones" },
      { "nombre": "Suficientes ensayos para el método elegido", "como": "La conclusión avisa si usas Wald con menos de 30 ensayos; el cuadro pone lado a lado los métodos que elijas.", "verificar": null, "siFalla": "Con pocos ensayos o con proporciones cerca de 0 o de 100 %, informa el de Wilson, el de Jeffreys o el de Clopper-Pearson.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germinadas", "tipo": "conteo", "papel": "éxitos" },
        { "nombre": "sembradas", "tipo": "conteo", "papel": "ensayos" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles", "papel": "por grupo (opcional)" },
        { "nombre": "una columna categórica (la otra forma)", "tipo": "factor con k niveles", "papel": "categoría: una proporción por nivel" }
      ],
      "minimo": "Cualquier número de ensayos da un intervalo, pero con menos de 30 por grupo solo los de Wilson, Jeffreys y Clopper-Pearson son confiables. Para estimar una proporción cercana a 50 % con un error de ±5 puntos hacen falta unos 400 ensayos.",
      "balance": "Las filas con éxitos o ensayos faltantes, o sin grupo, no entran y la conclusión dice cuántas. Los grupos pueden tener distinto número de ensayos; cada uno lleva su propio intervalo. Éxitos negativos, no enteros o mayores que los ensayos detienen el cálculo con un mensaje que señala la fila.",
      "notaFormato": "Con éxitos y ensayos: una fila por repetición (caja, maceta, trampa) con los dos conteos y el grupo. Con un factor: una fila por unidad y una columna con su categoría (por ejemplo, «Germinó» o «No germinó»).",
      "errores": [
        "Capturar solo el porcentaje en lugar de los conteos: sin el número de ensayos no hay intervalo.",
        "Usar el intervalo de Wald con pocos ensayos o con proporciones cercanas a 0 o a 100 %.",
        "Sumar cajas o parcelas muy distintas entre sí como si fueran una sola muestra binomial (sobredispersión).",
        "Intercambiar las columnas de éxitos y de ensayos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: la proporción de cada grupo (hasta cuatro; las demás están en el cuadro), cuántos éxitos de cuántos ensayos y su intervalo de Wilson (o el del primer método marcado, si quitas Wilson).",
        "En el cuadro, compara los intervalos de los métodos elegidos: si casi coinciden, el método no importa; si difieren, prefiere el de Wilson o el de Jeffreys.",
        "Juzga la precisión por el ancho del intervalo, no solo por la proporción.",
        "Para comparar grupos con una prueba, y no solo viendo si los intervalos se enciman, usa el modelo binomial o la tabla de contingencia."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La germinación fue de 30 % en el testigo (60 de 200 semillas; IC 95 % de Wilson: 24 a 37 %) y de 92 % con escarificación (184 de 200; IC 95 %: 87 a 95 %)».",
      "guias": ["ic", "n"]
    },
    "limitaciones": [
      "No compara grupos con una prueba: que dos intervalos se enciman no demuestra que las proporciones sean iguales. Para comparar tratamientos usa el modelo binomial (con bloques, si los hay) o la tabla de contingencia.",
      "Supone ensayos independientes con la misma probabilidad; con repeticiones heterogéneas el intervalo es demasiado optimista.",
      "Para planear cuántos ensayos necesitas, usa el tamaño de muestra para estimar una proporción o la potencia para comparar dos proporciones."
    ],
    "referencias": [
      "Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158), 209–212.",
      "Clopper, C. J., & Pearson, E. S. (1934). The use of confidence or fiducial limits illustrated in the case of the binomial. Biometrika, 26(4), 404–413.",
      "Agresti, A., & Coull, B. A. (1998). Approximate is better than \"exact\" for interval estimation of binomial proportions. The American Statistician, 52(2), 119–126.",
      "Brown, L. D., Cai, T. T., & DasGupta, A. (2001). Interval estimation for a binomial proportion. Statistical Science, 16(2), 101–133.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Confidence interval for a proportion", "Wilson interval", "Clopper-Pearson exact interval", "Binomial proportion"],
    "paraQue": "Estimates what proportion of the units meets a condition (germinated, died, is diseased) and gives its confidence interval with up to six methods.",
    "preguntas": [
      "What germination percentage does each bean seed treatment reach, and how precisely is it known?",
      "What proportion of the trees in an orchard has thrips?",
      "What is the incidence of a disease in a field if 9 of 120 inspected plants were diseased?"
    ],
    "teoria": [
      "When each unit has only two possible outcomes (germinates or not, lives or dies), what you estimate is a proportion: the number of successes x divided by the number of trials n. If the trials are independent and all have the same probability of success, x follows a binomial distribution, and its variation depends on the proportion itself: it is largest near 50% and smallest near 0 or 100%.",
      "SigmaPro accepts two data layouts: a factor whose categories are counted (each row is one unit and you get the proportion of each category), or two numeric columns with the successes and trials of each row (for example, germinated and sown seeds per box). In the second layout it adds up the successes and trials of all rows in each group and gives one proportion per group.",
      "For the confidence interval it offers six methods. The Wald interval, p ± z·SE, is the textbook one, but its actual coverage is poor with few trials or with proportions near 0 or 1: the app keeps it only as a reference and warns when there are fewer than 30 trials. The Wilson (score), Jeffreys (Bayesian, with a beta prior of one half and one half) and Agresti-Coull intervals have coverage close to the nominal level; Brown, Cai and DasGupta recommend Wilson or Jeffreys. The Clopper-Pearson interval is exact, based on the beta distribution, and therefore conservative: its coverage never falls below the requested level and usually exceeds it. Wilson with continuity correction reproduces the one in R's prop.test."
    ],
    "modelo": {
      "tex": "\\hat{p} = \\frac{x}{n}, \\quad \\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z \\sqrt{\\frac{\\hat{p}(1 - \\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}",
      "terminos": [
        ["x", "the number of successes in the group (germinated, diseased…)"],
        ["n", "the number of trials in the group (sown, inspected…)"],
        ["\\hat{p}", "the estimated proportion"],
        ["z", "the standard normal quantile for the chosen confidence (1.96 for 95%)"],
        ["\\pm", "gives the two limits of the Wilson interval: the lower one with − and the upper one with +"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Independent trials", "como": "It comes from the design: each seed, plant or insect responds on its own. It is not tested with the data.", "verificar": null, "siFalla": "If the seeds in the same box resemble each other (box effect), the trials are not independent and the interval is too narrow; analyze the boxes as replicates with a binomial model.", "alternativa": "glm-proporciones" },
      { "nombre": "The same probability of success within each group", "como": "SigmaPro adds up the boxes of a group as if they were a single sample. Compare the percentage of the boxes in each group with descriptive statistics (for example, of the germinacion column).", "verificar": "descriptivos", "siFalla": "If the replicates of a treatment differ more than the binomial allows (overdispersion), use the binomial model with estimated dispersion (quasibinomial) or with random blocks.", "alternativa": "glm-proporciones" },
      { "nombre": "Enough trials for the chosen method", "como": "The conclusion warns you if you use Wald with fewer than 30 trials; the table shows the methods you choose side by side.", "verificar": null, "siFalla": "With few trials or with proportions near 0 or 100%, report the Wilson, Jeffreys or Clopper-Pearson interval.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "germinadas", "tipo": "count", "papel": "successes" },
        { "nombre": "sembradas", "tipo": "count", "papel": "trials" },
        { "nombre": "tratamiento", "tipo": "factor with k levels", "papel": "by group (optional)" },
        { "nombre": "a categorical column (the other layout)", "tipo": "factor with k levels", "papel": "category: one proportion per level" }
      ],
      "minimo": "Any number of trials gives an interval, but with fewer than 30 per group only the Wilson, Jeffreys and Clopper-Pearson intervals are reliable. To estimate a proportion near 50% within ±5 points you need about 400 trials.",
      "balance": "Rows with missing successes or trials, or with no group, are left out and the conclusion reports how many. Groups may have different numbers of trials; each gets its own interval. Negative or non-integer successes, or successes larger than the trials, stop the calculation with a message that points to the row.",
      "notaFormato": "With successes and trials: one row per replicate (box, pot, trap) with both counts and the group. With a factor: one row per unit and a column with its category (for example, “Germinated” or “Not germinated”).",
      "errores": [
        "Entering only the percentage instead of the counts: without the number of trials there is no interval.",
        "Using the Wald interval with few trials or with proportions near 0 or 100%.",
        "Adding up boxes or plots that differ a lot from each other as if they were a single binomial sample (overdispersion).",
        "Swapping the successes and trials columns."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the proportion of each group (up to four; the rest are in the table), how many successes out of how many trials and its Wilson interval (or that of the first method checked, if you uncheck Wilson).",
        "In the table, compare the intervals of the chosen methods: if they nearly match, the method does not matter; if they differ, prefer Wilson or Jeffreys.",
        "Judge the precision by the width of the interval, not only by the proportion.",
        "To compare groups with a test, and not just by checking whether the intervals overlap, use the binomial model or the contingency table."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Germination was 30% in the control (60 of 200 seeds; Wilson 95% CI: 24 to 37%) and 92% with scarification (184 of 200; 95% CI: 87 to 95%).”",
      "guias": ["ic", "n"]
    },
    "limitaciones": [
      "It does not compare groups with a test: overlapping intervals do not show that the proportions are equal. To compare treatments use the binomial model (with blocks, if any) or the contingency table.",
      "It assumes independent trials with the same probability; with heterogeneous replicates the interval is too optimistic.",
      "To plan how many trials you need, use the sample size for estimating a proportion or the power for comparing two proportions."
    ],
    "referencias": [
      "Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158), 209–212.",
      "Clopper, C. J., & Pearson, E. S. (1934). The use of confidence or fiducial limits illustrated in the case of the binomial. Biometrika, 26(4), 404–413.",
      "Agresti, A., & Coull, B. A. (1998). Approximate is better than \"exact\" for interval estimation of binomial proportions. The American Statistician, 52(2), 119–126.",
      "Brown, L. D., Cai, T. T., & DasGupta, A. (2001). Interval estimation for a binomial proportion. Statistical Science, 16(2), 101–133.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  }
});
