SP_FICHA({
  "id": "wilcoxon",
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "dos-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["prueba-t", "kruskal-wallis", "friedman", "mcnemar", "descriptivos"],
  "ejemplo": { "conjunto": "jitomate", "entradas": { "modo": "pareadas", "antes": "altura_60dds", "despues": "altura_45dds" }, "opciones": {} },
  "formato": {
    "largo": [["sustrato", "planta", "altura_45dds", "altura_60dds"], ["Tezontle", "P01", "118.7", "151.7"], ["Tezontle", "P02", "123.9", "157.1"], ["Tezontle", "P03", "123.5", "148.3"], ["Tezontle", "P04", "125.1", "148.7"], ["Tezontle", "P05", "122.9", "NA"], ["Tezontle", "P06", "127.4", "153.8"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba de rangos con signo de Wilcoxon", "Prueba U de Mann-Whitney", "Suma de rangos de Wilcoxon", "Estimador de Hodges-Lehmann"],
    "paraQue": "Compara dos grupos, dos mediciones pareadas o una muestra contra un valor usando rangos, sin suponer normalidad, y estima el desplazamiento con Hodges-Lehmann.",
    "preguntas": [
      "¿Cuánto crecieron las plantas de jitomate entre los 45 y los 60 días después del trasplante?",
      "¿Difiere el número de lesiones por hoja entre dos variedades de frijol, si los conteos tienen muchos ceros y valores extremos?",
      "¿Es la mediana de la calificación de daño de un lote distinta del valor que se tolera?"
    ],
    "teoria": [
      "Las pruebas de Wilcoxon cambian los datos por sus rangos (su lugar al ordenarlos), así que no dependen de que los datos sean normales y resisten mejor los valores extremos. SigmaPro tiene los mismos tres modos que la prueba t.",
      "Con una muestra o con datos pareados usa la prueba de rangos con signo: toma las diferencias respecto del valor de referencia (o entre las dos mediciones de cada par), ordena sus valores absolutos, les devuelve el signo y suma los rangos positivos (V). Las diferencias iguales a cero se descartan, como en R. Su estimador es la seudomediana de Hodges-Lehmann, la mediana de los promedios de todos los pares de diferencias; se lee como la mediana de las diferencias si estas son aproximadamente simétricas.",
      "Con dos grupos independientes usa la suma de rangos de Wilcoxon, equivalente a la U de Mann-Whitney (W): junta los dos grupos, los ordena y compara los rangos de uno con los del otro. Su estimador es la mediana de todas las diferencias entre un dato de cada grupo, con su intervalo de confianza. Se lee como un desplazamiento si las dos distribuciones tienen forma y dispersión parecidas; si no, la prueba dice si un grupo tiende a dar valores más altos que el otro.",
      "El valor p es exacto con menos de 50 datos (por grupo) y sin empates ni ceros; si no, usa la aproximación normal corregida por empates y, por omisión, por continuidad. Con muy pocos datos el intervalo no alcanza la confianza pedida, y la app informa la que logra."
    ],
    "modelo": {
      "tex": "V = \\sum_{d_i > 0} R_i, \\quad W = \\sum_{i=1}^{n_1} R_i - \\frac{n_1 (n_1 + 1)}{2}, \\quad \\hat{\\Delta} = \\mathrm{mediana} (x_i - y_j)",
      "terminos": [
        ["d_i", "la diferencia i (dato menos el valor de referencia, o primera menos segunda medición), sin las iguales a cero"],
        ["R_i", "en V, el rango de |d_i| entre todas las diferencias; en W, el rango del dato i del grupo 1 en la muestra combinada"],
        ["V", "el estadístico de rangos con signo: la suma de los rangos de las diferencias positivas"],
        ["W", "el estadístico de suma de rangos, igual a la U de Mann-Whitney"],
        ["\\hat{\\Delta}", "el estimador de Hodges-Lehmann del desplazamiento entre los grupos (x del grupo 1, y del grupo 2)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\Delta = \\Delta_0", "h1": "\\Delta \\ne \\Delta_0", "texto": "Dos grupos: no hay desplazamiento entre las dos distribuciones (Δ₀ = 0 por omisión). También hay alternativas de una cola." },
      { "h0": "\\theta = \\theta_0", "h1": "\\theta \\ne \\theta_0", "texto": "Una muestra o pareadas: las diferencias son simétricas alrededor de θ₀, el valor de referencia (0 en pareadas, por omisión)." }
    ],
    "supuestos": [
      { "nombre": "Independencia", "como": "Lo da el diseño: unidades distintas en cada grupo, o pares independientes entre sí. No se prueba con los datos.", "verificar": null, "siFalla": "Si mediste varias veces cada unidad a lo largo del tiempo, usa un modelo de medidas repetidas.", "alternativa": "medidas-repetidas" },
      { "nombre": "Simetría de las diferencias (una muestra y pareadas)", "como": "Mira la caja de las diferencias en la gráfica; para medir su asimetría, crea la diferencia con «Variable calculada» en Datos y revísala con los estadísticos descriptivos.", "verificar": "descriptivos", "siFalla": "Con diferencias muy asimétricas, la seudomediana deja de ser la mediana; informa también la mediana de las diferencias, que aparece en el cuadro de medianas y cuartiles.", "alternativa": null },
      { "nombre": "Forma parecida en los dos grupos (para hablar de desplazamiento)", "como": "Compara las cajas de la gráfica y los cuartiles del cuadro de medianas.", "verificar": "descriptivos", "siFalla": "Si un grupo es mucho más disperso, interpreta la prueba como «un grupo tiende a dar valores más altos», no como una diferencia de medianas; si los datos son casi normales, la t de Welch tolera varianzas distintas.", "alternativa": "prueba-t" },
      { "nombre": "Pocos empates", "como": "Las notas del cuadro dicen si el p es exacto o aproximado y si se corrigió por empates.", "verificar": null, "siFalla": "Con muchos empates (escalas de 0 a 5, conteos chicos) el p aproximado sigue siendo válido; con categorías ordenadas medidas dos veces en las mismas unidades también puedes usar McNemar o Bowker.", "alternativa": "mcnemar" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura_60dds", "tipo": "numérica continua", "papel": "primera medición (pareadas)" },
        { "nombre": "altura_45dds", "tipo": "numérica continua", "papel": "segunda medición (pareadas)" },
        { "nombre": "respuesta y grupo", "tipo": "numérica continua y factor con 2 o más niveles", "papel": "dos grupos independientes (otro modo)" }
      ],
      "minimo": "Con datos pareados, al menos 6 pares sin empates para que el p bilateral exacto pueda bajar de 0.05; con dos grupos del mismo tamaño, al menos 4 datos por grupo. Con menos, el p exacto no puede bajar de 0.05.",
      "balance": "Los grupos pueden tener tamaños distintos. Los faltantes se quitan, y en el modo pareado solo entran los pares completos (en el ejemplo, 16 de 18 plantas). Las diferencias iguales a cero no cuentan para la prueba, y la nota del cuadro dice cuántas fueron.",
      "notaFormato": "Pareadas: formato ancho, una fila por unidad con las dos mediciones en columnas; se analiza primera − segunda. Dos grupos: formato largo, una fila por unidad con su respuesta y su grupo.",
      "errores": [
        "Usar la prueba de dos grupos independientes con datos pareados, o al revés.",
        "Creer que Mann-Whitney compara medianas aunque los grupos tengan dispersiones muy distintas.",
        "Elegir las columnas pareadas en el orden contrario y leer mal el signo de la seudomediana, que se calcula como primera − segunda.",
        "Mezclar promedios de parcelas con datos de plantas individuales en la misma comparación."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: si hay diferencia, el estimador de Hodges-Lehmann (seudomediana o diferencia) con su intervalo, el estadístico V o W y su p.",
        "Revisa las notas del cuadro: si el p es exacto o aproximado, si hubo empates o ceros descartados y qué confianza alcanza el intervalo.",
        "Compara las medianas y los cuartiles de cada grupo, o de las diferencias, en el segundo cuadro.",
        "Mira las cajas de la gráfica; en una muestra y en pareadas, la línea discontinua marca el valor de referencia."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Entre los 45 y los 60 días las plantas crecieron 29 cm (seudomediana de Hodges-Lehmann; IC 95 %: 27 a 32 cm), de acuerdo con la prueba de rangos con signo de Wilcoxon (V = 136, 16 pares, p < 0.001)».",
      "guias": ["wilcoxon", "p", "hodges-lehmann", "ic", "mediana", "cuartil"]
    },
    "limitaciones": [
      "Compara solo dos grupos o dos mediciones: con tres o más tratamientos usa Kruskal-Wallis y, con bloques, Friedman.",
      "Cuando los datos son casi normales es algo menos potente que la prueba t (alrededor de 95 % de su eficiencia).",
      "No admite covariables ni otros factores; para conteos con muchos ceros, un modelo de conteos (Poisson o binomial negativa) aprovecha mejor la información.",
      "Las diferencias iguales a cero se descartan, lo que reduce la muestra efectiva cuando son muchas."
    ],
    "referencias": [
      "Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80–83.",
      "Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. The Annals of Mathematical Statistics, 18(1), 50–60.",
      "Hodges, J. L., & Lehmann, E. L. (1963). Estimates of location based on rank tests. The Annals of Mathematical Statistics, 34(2), 598–611.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Wilcoxon signed-rank test", "Mann-Whitney U test", "Wilcoxon rank-sum test", "Hodges-Lehmann estimator"],
    "paraQue": "Compares two groups, two paired measurements or one sample against a value using ranks, without assuming normality, and estimates the shift with Hodges-Lehmann.",
    "preguntas": [
      "How much did tomato plants grow between 45 and 60 days after transplanting?",
      "Does the number of lesions per leaf differ between two bean varieties when the counts have many zeros and extreme values?",
      "Is the median damage score of a lot different from the tolerated value?"
    ],
    "teoria": [
      "Wilcoxon tests replace the data by their ranks (their position when sorted), so they do not depend on the data being normal and they resist extreme values better. SigmaPro has the same three modes as the t test.",
      "With one sample or with paired data it uses the signed-rank test: it takes the differences from the reference value (or between the two measurements of each pair), ranks their absolute values, gives them back their sign and adds up the positive ranks (V). Differences equal to zero are dropped, as in R. Its estimator is the Hodges-Lehmann pseudomedian, the median of the averages of all pairs of differences; it can be read as the median of the differences if these are roughly symmetric.",
      "With two independent groups it uses the Wilcoxon rank-sum test, equivalent to the Mann-Whitney U (W): it pools the two groups, ranks them and compares the ranks of one with those of the other. Its estimator is the median of all differences between one observation from each group, with its confidence interval. It can be read as a shift if the two distributions have similar shape and spread; otherwise, the test says whether one group tends to give higher values than the other.",
      "The p-value is exact with fewer than 50 observations (per group) and no ties or zeros; otherwise it uses the normal approximation corrected for ties and, by default, for continuity. With very few data the interval cannot reach the requested confidence, and the app reports the level it achieves."
    ],
    "modelo": {
      "tex": "V = \\sum_{d_i > 0} R_i, \\quad W = \\sum_{i=1}^{n_1} R_i - \\frac{n_1 (n_1 + 1)}{2}, \\quad \\hat{\\Delta} = \\mathrm{median} (x_i - y_j)",
      "terminos": [
        ["d_i", "difference i (observation minus the reference value, or first minus second measurement), excluding those equal to zero"],
        ["R_i", "in V, the rank of |d_i| among all differences; in W, the rank of observation i of group 1 in the pooled sample"],
        ["V", "the signed-rank statistic: the sum of the ranks of the positive differences"],
        ["W", "the rank-sum statistic, equal to the Mann-Whitney U"],
        ["\\hat{\\Delta}", "the Hodges-Lehmann estimator of the shift between groups (x from group 1, y from group 2)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\Delta = \\Delta_0", "h1": "\\Delta \\ne \\Delta_0", "texto": "Two groups: there is no shift between the two distributions (Δ₀ = 0 by default). One-sided alternatives are also available." },
      { "h0": "\\theta = \\theta_0", "h1": "\\theta \\ne \\theta_0", "texto": "One sample or paired: the differences are symmetric around θ₀, the reference value (0 for paired data, by default)." }
    ],
    "supuestos": [
      { "nombre": "Independence", "como": "It comes from the design: different units in each group, or pairs that are independent of each other. It is not tested with the data.", "verificar": null, "siFalla": "If you measured each unit several times over time, use a repeated measures model.", "alternativa": "medidas-repetidas" },
      { "nombre": "Symmetric differences (one sample and paired)", "como": "Look at the box of the differences in the plot; to measure their skewness, create the difference with “Computed variable” in Data and check it with descriptive statistics.", "verificar": "descriptivos", "siFalla": "With strongly skewed differences, the pseudomedian is no longer the median; also report the median of the differences, which appears in the table of medians and quartiles.", "alternativa": null },
      { "nombre": "Similar shape in both groups (to speak of a shift)", "como": "Compare the box plots and the quartiles in the table of medians.", "verificar": "descriptivos", "siFalla": "If one group is much more spread out, read the test as “one group tends to give higher values”, not as a difference in medians; if the data are nearly normal, Welch's t tolerates unequal variances.", "alternativa": "prueba-t" },
      { "nombre": "Few ties", "como": "The table notes say whether the p-value is exact or approximate and whether it was corrected for ties.", "verificar": null, "siFalla": "With many ties (0 to 5 scales, small counts) the approximate p-value is still valid; with ordered categories measured twice on the same units you can also use McNemar or Bowker.", "alternativa": "mcnemar" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura_60dds", "tipo": "continuous numeric", "papel": "first measurement (paired)" },
        { "nombre": "altura_45dds", "tipo": "continuous numeric", "papel": "second measurement (paired)" },
        { "nombre": "response and group", "tipo": "continuous numeric and factor with 2 or more levels", "papel": "two independent groups (other mode)" }
      ],
      "minimo": "With paired data, at least 6 pairs without ties so that the exact two-sided p-value can go below 0.05; with two groups of equal size, at least 4 observations per group. With fewer, the exact p-value cannot go below 0.05.",
      "balance": "Groups may have different sizes. Missing values are removed, and in the paired mode only complete pairs enter (in the example, 16 of 18 plants). Differences equal to zero do not count for the test, and the table note says how many there were.",
      "notaFormato": "Paired: wide format, one row per unit with the two measurements in columns; first − second is analyzed. Two groups: long format, one row per unit with its response and its group.",
      "errores": [
        "Using the independent two-group test with paired data, or the other way around.",
        "Believing that Mann-Whitney compares medians even when the groups have very different spreads.",
        "Choosing the paired columns in the opposite order and misreading the sign of the pseudomedian, which is computed as first − second.",
        "Mixing plot means with data from individual plants in the same comparison."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: whether there is a difference, the Hodges-Lehmann estimator (pseudomedian or difference) with its interval, the V or W statistic and its p-value.",
        "Check the table notes: whether the p-value is exact or approximate, whether ties or zeros were dropped and what confidence the interval reaches.",
        "Compare the medians and quartiles of each group, or of the differences, in the second table.",
        "Look at the box plots; for one sample and paired data, the dashed line marks the reference value."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Between 45 and 60 days the plants grew 29 cm (Hodges-Lehmann pseudomedian; 95% CI: 27 to 32 cm), according to the Wilcoxon signed-rank test (V = 136, 16 pairs, p < 0.001).”",
      "guias": ["wilcoxon", "p", "hodges-lehmann", "ic", "mediana", "cuartil"]
    },
    "limitaciones": [
      "It compares only two groups or two measurements: with three or more treatments use Kruskal-Wallis and, with blocks, Friedman.",
      "When the data are nearly normal it is somewhat less powerful than the t test (about 95% of its efficiency).",
      "It does not handle covariates or other factors; for counts with many zeros, a count model (Poisson or negative binomial) makes better use of the information.",
      "Differences equal to zero are dropped, which reduces the effective sample when there are many."
    ],
    "referencias": [
      "Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80–83.",
      "Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. The Annals of Mathematical Statistics, 18(1), 50–60.",
      "Hodges, J. L., & Lehmann, E. L. (1963). Estimates of location based on rank tests. The Annals of Mathematical Statistics, 34(2), 598–611.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley."
    ]
  }
});
