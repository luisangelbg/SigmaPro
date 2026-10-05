SP_FICHA({
  "id": "mantel-haenszel",
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "bloques",
  "disenos": ["dbca", "muestreo"],
  "relacionados": ["tabla-contingencia", "glm-proporciones", "glmm-bloques", "mcnemar", "proporciones"],
  "ejemplo": { "conjunto": "germinacion-lotes", "entradas": { "fila": "tratamiento", "columna": "germinacion", "estrato": "lote", "frecuencia": "semillas" }, "opciones": {} },
  "formato": {
    "largo": [["lote", "tratamiento", "germinacion", "semillas"], ["L1", "Fungicida", "Germinó", "80"], ["L1", "Fungicida", "No germinó", "20"], ["L1", "Testigo", "Germinó", "65"], ["L1", "Testigo", "No germinó", "35"], ["L2", "Fungicida", "Germinó", "79"], ["L2", "Fungicida", "No germinó", "21"], ["L2", "Testigo", "Germinó", "67"], ["L2", "Testigo", "No germinó", "33"]],
    "ancho": [["lote", "tratamiento", "Germinó", "No germinó"], ["L1", "Fungicida", "80", "20"], ["L1", "Testigo", "65", "35"], ["L2", "Fungicida", "79", "21"], ["L2", "Testigo", "67", "33"]]
  },
  "es": {
    "alias": ["Prueba de Cochran-Mantel-Haenszel", "Razón de momios común de Mantel-Haenszel", "Prueba de Breslow-Day", "Tablas 2 × 2 estratificadas"],
    "paraQue": "Prueba si dos variables categóricas están asociadas cuando los datos vienen de varios estratos (lotes, sitios, años) y resume esa asociación en una razón de momios común.",
    "preguntas": [
      "¿Mejora el fungicida la germinación del frijol cuando el ensayo se repite en cuatro lotes de semilla de distinta calidad?",
      "¿Es la variedad resistente menos atacada por el gusano cogollero que la comercial en cinco localidades?",
      "¿Se asocia el uso de acolchado con la presencia de virosis en jitomate, controlando el invernadero?"
    ],
    "teoria": [
      "Muchas veces una tabla 2 × 2 se repite en varios estratos: el mismo ensayo de fungicida en cuatro lotes de semilla, o la misma comparación de variedades en varios sitios. Sumar todo en una sola tabla puede engañar, porque los estratos difieren en su nivel de base (un lote germina mejor que otro) y en su tamaño; hasta puede invertirse el sentido de una asociación (paradoja de Simpson). La prueba de Cochran-Mantel-Haenszel compara las variables dentro de cada estrato y combina la evidencia.",
      "En cada estrato toma la celda a (primera fila y primera columna) y calcula lo que se esperaría de ella si no hubiera asociación, y su varianza, dados los totales del estrato. Luego suma las diferencias de todos los estratos, las eleva al cuadrado y las divide entre la suma de las varianzas; el resultado se compara con una ji cuadrada de 1 grado de libertad (por omisión, con corrección por continuidad, como mantelhaen.test de R). La razón de momios común de Mantel-Haenszel resume la asociación de todos los estratos en un solo número, con el intervalo de Robins, Breslow y Greenland.",
      "Esa razón común tiene sentido solo si la asociación es parecida en todos los estratos. La prueba de Breslow-Day, con la corrección de Tarone, revisa esa homogeneidad; si la rechaza, conviene describir cada estrato, y el cuadro y la gráfica muestran la razón de momios de cada uno con su intervalo. Si alguna variable tiene más de dos categorías, SigmaPro aplica el estadístico generalizado de asociación, con (I − 1)(J − 1) grados de libertad y sin razón de momios."
    ],
    "modelo": {
      "tex": "\\chi^2_{MH} = \\frac{\\left( \\left| \\sum_{k} \\left( a_k - E(a_k) \\right) \\right| - \\frac{1}{2} \\right)^2}{\\sum_{k} \\mathrm{Var}(a_k)}, \\quad \\hat{\\psi}_{MH} = \\frac{\\sum_{k} \\frac{a_k d_k}{n_k}}{\\sum_{k} \\frac{b_k c_k}{n_k}}",
      "terminos": [
        ["a_k, b_k, c_k, d_k", "las cuatro celdas de la tabla 2 × 2 del estrato k (a: primera fila con primera columna; b: primera fila con segunda columna; c y d, lo mismo en la segunda fila)"],
        ["E(a_k), \\mathrm{Var}(a_k)", "lo que se espera de a_k sin asociación y su varianza, dados los totales del estrato"],
        ["n_k", "el total de casos del estrato k"],
        ["\\frac{1}{2}", "la corrección por continuidad (opcional)"],
        ["\\hat{\\psi}_{MH}", "la razón de momios común de Mantel-Haenszel"]
      ]
    },
    "hipotesis": [
      { "h0": "\\psi_k = 1 \\text{ en todos los estratos}", "h1": "\\psi_{MH} \\ne 1", "texto": "Dentro de cada estrato, filas y columnas son independientes. Se prueba con la ji cuadrada de Cochran-Mantel-Haenszel (1 gl en tablas 2 × 2 × K); es más potente cuando la asociación va en el mismo sentido en todos los estratos." },
      { "h0": "\\psi_1 = \\psi_2 = \\cdots = \\psi_K", "h1": "\\text{algún } \\psi_k \\text{ es distinto}", "texto": "La razón de momios es la misma en todos los estratos. Prueba de Breslow-Day, con y sin la corrección de Tarone; solo en tablas 2 × 2 × K." }
    ],
    "supuestos": [
      { "nombre": "Asociación parecida en todos los estratos (para la razón común)", "como": "Este análisis no tiene semáforo: la prueba de Breslow-Day con la corrección de Tarone está en el cuadro de la prueba y la conclusión dice si la razón común resume bien.", "verificar": null, "siFalla": "Describe cada estrato con su razón de momios (cuadro y gráfica) o modela la interacción tratamiento × estrato con un modelo binomial.", "alternativa": "glm-proporciones" },
      { "nombre": "Casos independientes dentro de cada estrato", "como": "Lo da el diseño: cada semilla, planta o fruto cuenta una sola vez. No se prueba con los datos.", "verificar": null, "siFalla": "Si los casos vienen agrupados dentro del estrato (semillas de una misma caja, plantas de una misma parcela), la prueba es demasiado optimista: usa un modelo binomial mixto.", "alternativa": "glmm-bloques" },
      { "nombre": "Datos suficientes en cada estrato", "como": "SigmaPro exige al menos 2 observaciones por estrato; los estratos con un total de fila o de columna en cero no entran a Breslow-Day, y una celda en cero hace que se sume 0.5 a las cuatro celdas para la razón de ese estrato.", "verificar": null, "siFalla": "La prueba CMH funciona con muchos estratos chicos, pero Breslow-Day y las razones de cada estrato se vuelven inestables: junta estratos parecidos.", "alternativa": null },
      { "nombre": "El estrato no es consecuencia del tratamiento", "como": "Lo da el diseño (lote, sitio, año); no se prueba con los datos.", "verificar": null, "siFalla": "Si el estrato depende del tratamiento, controlarlo quita parte del efecto: analiza la tabla sin estratos.", "alternativa": "tabla-contingencia" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "lote", "tipo": "factor con K niveles", "papel": "estrato" },
        { "nombre": "tratamiento", "tipo": "factor con 2 o más niveles", "papel": "variable de las filas" },
        { "nombre": "germinacion", "tipo": "factor con 2 o más niveles", "papel": "variable de las columnas" },
        { "nombre": "semillas", "tipo": "conteo", "papel": "frecuencias (opcional)" }
      ],
      "minimo": "Al menos dos estratos, dos categorías por variable y 2 observaciones por estrato. La razón de momios común y Breslow-Day requieren una tabla 2 × 2 en cada estrato.",
      "balance": "Los estratos pueden tener tamaños distintos: la prueba pesa a cada uno por su información. Las filas con algún faltante no entran (una nota lo dice).",
      "notaFormato": "Formato largo: una fila por caso, o una fila por combinación de estrato, fila y columna con una columna de frecuencias, como en el ejemplo. Una tabla con una columna por resultado (formato ancho) se pasa a formato largo en Datos con «Ancha ⇄ larga…».",
      "errores": [
        "Sumar todos los estratos en una sola tabla y usar la ji cuadrada simple: el estrato puede confundir la asociación.",
        "Capturar porcentajes de germinación por lote en lugar de los conteos.",
        "Usar como estrato una variable con un nivel por caso: cada estrato debe reunir varias observaciones.",
        "Informar la razón de momios común cuando Breslow-Day indica que cambia entre estratos."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la ji cuadrada de Cochran-Mantel-Haenszel y su p: dicen si hay asociación al controlar el estrato.",
        "Lee la razón de momios común con su intervalo: cuántas veces son mayores los momios de la primera columna en la primera fila que en la segunda.",
        "Revisa Breslow-Day con Tarone: si su p es pequeño, la razón cambia entre estratos y la común no los resume bien.",
        "Compara en el cuadro y en la gráfica (escala logarítmica, con la línea en 1) la razón de momios de cada estrato."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Controlando por el lote, la semilla tratada con fungicida germinó más que el testigo (Cochran-Mantel-Haenszel χ²(1) = 30.5, p < 0.001; razón de momios común = 2.5, IC 95 %: 1.8 a 3.5), y la razón de momios fue homogénea entre los cuatro lotes (Breslow-Day con Tarone, χ²(3) = 4.1, p = 0.25)».",
      "guias": ["cmh", "razon-momios", "breslow-day", "ic", "p"]
    },
    "limitaciones": [
      "La razón de momios común y la prueba de Breslow-Day solo existen con tablas 2 × 2 en cada estrato; con más categorías, SigmaPro da solo la prueba general de asociación, que no aprovecha el orden de las categorías.",
      "Controla un solo factor de estratificación; para varios factores o covariables, usa el modelo binomial.",
      "Si los estratos son una muestra de muchos posibles (lotes, años) y quieres generalizar a todos, considera un modelo binomial mixto con el estrato como efecto aleatorio.",
      "Con pares de casos (la misma unidad clasificada dos veces) usa McNemar."
    ],
    "referencias": [
      "Cochran, W. G. (1954). Some methods for strengthening the common χ² tests. Biometrics, 10(4), 417–451.",
      "Mantel, N., & Haenszel, W. (1959). Statistical aspects of the analysis of data from retrospective studies of disease. Journal of the National Cancer Institute, 22(4), 719–748.",
      "Tarone, R. E. (1985). On heterogeneity tests based on efficient scores. Biometrika, 72(1), 91–95.",
      "Robins, J., Breslow, N., & Greenland, S. (1986). Estimators of the Mantel-Haenszel variance consistent in both sparse data and large-strata limiting models. Biometrics, 42(2), 311–323.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Cochran-Mantel-Haenszel test", "Mantel-Haenszel common odds ratio", "Breslow-Day test", "Stratified 2 × 2 tables"],
    "paraQue": "Tests whether two categorical variables are associated when the data come from several strata (lots, sites, years) and summarizes that association in a common odds ratio.",
    "preguntas": [
      "Does the fungicide improve bean germination when the trial is repeated in four seed lots of different quality?",
      "Is the resistant variety less attacked by fall armyworm than the commercial one across five locations?",
      "Is plastic mulch associated with viral disease in tomato, controlling for the greenhouse?"
    ],
    "teoria": [
      "A 2 × 2 table is often repeated over several strata: the same fungicide trial in four seed lots, or the same variety comparison at several sites. Pooling everything into a single table can mislead, because the strata differ in their baseline level (one lot germinates better than another) and in their size; the direction of an association can even reverse (Simpson’s paradox). The Cochran-Mantel-Haenszel test compares the variables within each stratum and combines the evidence.",
      "In each stratum it takes cell a (first row and first column) and computes what would be expected in it if there were no association, and its variance, given the stratum totals. It then adds up the differences over all strata, squares the sum and divides it by the sum of the variances; the result is compared with a chi-square with 1 degree of freedom (by default, with continuity correction, as R’s mantelhaen.test). The Mantel-Haenszel common odds ratio summarizes the association across all strata in a single number, with the Robins, Breslow and Greenland interval.",
      "That common odds ratio makes sense only if the association is similar in every stratum. The Breslow-Day test, with Tarone’s correction, checks that homogeneity; if it is rejected, describe each stratum, and the table and the plot show the odds ratio of each one with its interval. If some variable has more than two categories, SigmaPro applies the generalized association statistic, with (I − 1)(J − 1) degrees of freedom and no odds ratio."
    ],
    "modelo": {
      "tex": "\\chi^2_{MH} = \\frac{\\left( \\left| \\sum_{k} \\left( a_k - E(a_k) \\right) \\right| - \\frac{1}{2} \\right)^2}{\\sum_{k} \\mathrm{Var}(a_k)}, \\quad \\hat{\\psi}_{MH} = \\frac{\\sum_{k} \\frac{a_k d_k}{n_k}}{\\sum_{k} \\frac{b_k c_k}{n_k}}",
      "terminos": [
        ["a_k, b_k, c_k, d_k", "the four cells of the 2 × 2 table of stratum k (a: first row with first column; b: first row with second column; c and d, the same in the second row)"],
        ["E(a_k), \\mathrm{Var}(a_k)", "what is expected of a_k with no association and its variance, given the stratum totals"],
        ["n_k", "the total number of cases in stratum k"],
        ["\\frac{1}{2}", "the continuity correction (optional)"],
        ["\\hat{\\psi}_{MH}", "the Mantel-Haenszel common odds ratio"]
      ]
    },
    "hipotesis": [
      { "h0": "\\psi_k = 1 \\text{ in every stratum}", "h1": "\\psi_{MH} \\ne 1", "texto": "Within each stratum, rows and columns are independent. Tested with the Cochran-Mantel-Haenszel chi-square (1 df in 2 × 2 × K tables); it is most powerful when the association goes in the same direction in every stratum." },
      { "h0": "\\psi_1 = \\psi_2 = \\cdots = \\psi_K", "h1": "\\text{some } \\psi_k \\text{ differs}", "texto": "The odds ratio is the same in every stratum. Breslow-Day test, with and without Tarone’s correction; only in 2 × 2 × K tables." }
    ],
    "supuestos": [
      { "nombre": "Similar association in every stratum (for the common odds ratio)", "como": "This analysis has no assumptions checklist: the Breslow-Day test with Tarone’s correction is in the test table and the conclusion says whether the common odds ratio summarizes well.", "verificar": null, "siFalla": "Describe each stratum with its odds ratio (table and plot) or model the treatment × stratum interaction with a binomial model.", "alternativa": "glm-proporciones" },
      { "nombre": "Independent cases within each stratum", "como": "It comes from the design: each seed, plant or fruit counts only once. It is not tested with the data.", "verificar": null, "siFalla": "If the cases come in clusters within the stratum (seeds from the same box, plants from the same plot), the test is too optimistic: use a binomial mixed model.", "alternativa": "glmm-bloques" },
      { "nombre": "Enough data in each stratum", "como": "SigmaPro requires at least 2 observations per stratum; strata with a zero row or column total do not enter Breslow-Day, and a zero cell makes 0.5 be added to all four cells for that stratum’s odds ratio.", "verificar": null, "siFalla": "The CMH test works with many small strata, but Breslow-Day and the odds ratio of each stratum become unstable: merge similar strata.", "alternativa": null },
      { "nombre": "The stratum is not a consequence of the treatment", "como": "It comes from the design (lot, site, year); it is not tested with the data.", "verificar": null, "siFalla": "If the stratum depends on the treatment, controlling for it removes part of the effect: analyze the table without strata.", "alternativa": "tabla-contingencia" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "lote", "tipo": "factor with K levels", "papel": "stratum" },
        { "nombre": "tratamiento", "tipo": "factor with 2 or more levels", "papel": "row variable" },
        { "nombre": "germinacion", "tipo": "factor with 2 or more levels", "papel": "column variable" },
        { "nombre": "semillas", "tipo": "count", "papel": "frequencies (optional)" }
      ],
      "minimo": "At least two strata, two categories per variable and 2 observations per stratum. The common odds ratio and Breslow-Day require a 2 × 2 table in each stratum.",
      "balance": "Strata can have different sizes: the test weights each one by its information. Rows with any missing value are left out (a note says so).",
      "notaFormato": "Long format: one row per case, or one row per combination of stratum, row and column with a frequency column, as in the example. A table with one column per outcome (wide format) is converted to long format in Data with “Wide ⇄ long…”.",
      "errores": [
        "Pooling all strata into a single table and using the simple chi-square: the stratum can confound the association.",
        "Entering germination percentages per lot instead of the counts.",
        "Using as stratum a variable with one level per case: each stratum must gather several observations.",
        "Reporting the common odds ratio when Breslow-Day shows that it changes among strata."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the Cochran-Mantel-Haenszel chi-square and its p: they tell whether there is an association after controlling for the stratum.",
        "Read the common odds ratio with its interval: how many times larger the odds of the first column are in the first row than in the second.",
        "Check Breslow-Day with Tarone: if its p is small, the odds ratio changes among strata and the common one does not summarize them well.",
        "Compare in the table and in the plot (log scale, with the line at 1) the odds ratio of each stratum."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Controlling for lot, fungicide-treated seed germinated more than the control (Cochran-Mantel-Haenszel χ²(1) = 30.5, p < 0.001; common odds ratio = 2.5, 95 % CI: 1.8 to 3.5), and the odds ratio was homogeneous across the four lots (Breslow-Day with Tarone, χ²(3) = 4.1, p = 0.25).”",
      "guias": ["cmh", "razon-momios", "breslow-day", "ic", "p"]
    },
    "limitaciones": [
      "The common odds ratio and the Breslow-Day test exist only with 2 × 2 tables in each stratum; with more categories, SigmaPro gives only the general association test, which does not use the order of the categories.",
      "It controls a single stratification factor; for several factors or covariates, use the binomial model.",
      "If the strata are a sample from many possible ones (lots, years) and you want to generalize to all, consider a binomial mixed model with the stratum as a random effect.",
      "With paired cases (the same unit classified twice) use McNemar."
    ],
    "referencias": [
      "Cochran, W. G. (1954). Some methods for strengthening the common χ² tests. Biometrics, 10(4), 417–451.",
      "Mantel, N., & Haenszel, W. (1959). Statistical aspects of the analysis of data from retrospective studies of disease. Journal of the National Cancer Institute, 22(4), 719–748.",
      "Tarone, R. E. (1985). On heterogeneity tests based on efficient scores. Biometrika, 72(1), 91–95.",
      "Robins, J., Breslow, N., & Greenland, S. (1986). Estimators of the Mantel-Haenszel variance consistent in both sparse data and large-strata limiting models. Biometrics, 42(2), 311–323.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley."
    ]
  }
});
