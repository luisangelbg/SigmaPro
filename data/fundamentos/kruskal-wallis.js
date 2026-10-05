SP_FICHA({
  "id": "kruskal-wallis",
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["dca"],
  "relacionados": ["dca", "wilcoxon", "friedman", "glm-conteos", "comparaciones-medias", "supuestos"],
  "ejemplo": { "conjunto": "aguacate-huertas", "entradas": { "respuesta": "rendimiento_kg", "tratamiento": "huerta" }, "opciones": { "posthoc": "dunn", "ajuste": "holm" } },
  "formato": {
    "largo": [["huerta", "arbol", "rendimiento_kg"], ["Ladera", "1", "45.8"], ["Ladera", "2", "42.6"], ["Ladera", "3", "41.2"], ["Ladera", "4", "53.8"], ["Ladera", "5", "55.5"], ["Ladera", "6", "52.8"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba H de Kruskal-Wallis", "Análisis de varianza de un factor por rangos", "Prueba de Dunn", "Comparaciones de Conover-Iman y de Nemenyi"],
    "paraQue": "Compara tres o más grupos independientes por los rangos de sus datos, sin suponer normalidad, y dice cuáles difieren con comparaciones por pares y letras.",
    "preguntas": [
      "¿Difiere el rendimiento por árbol entre tres huertas de aguacate?",
      "¿Cambia el número de larvas por planta entre cinco insecticidas, si los conteos son muy asimétricos?",
      "¿Difieren las calificaciones de sabor (de 1 a 9) de cuatro variedades de jitomate, si cada variedad la probaron consumidores distintos?"
    ],
    "teoria": [
      "La prueba de Kruskal-Wallis es la versión por rangos del análisis de varianza de un factor en un diseño completamente al azar. Junta todas las observaciones, las ordena de menor a mayor y cambia cada valor por su rango; los empates reciben el rango promedio. Si los grupos vinieran de la misma distribución, sus rangos medios serían parecidos; el estadístico H mide qué tanto se separan y, corregido por empates, se compara con una ji cuadrada con k − 1 grados de libertad.",
      "Como usa rangos, no supone normalidad ni sufre la sensibilidad de la media a los valores extremos: sirve para datos muy asimétricos, conteos pequeños o escalas ordinales. A cambio, lo que prueba es si algún grupo tiende a dar valores más altos que otro; solo se lee como una diferencia de medianas si las distribuciones tienen forma y dispersión parecidas. SigmaPro informa como tamaño del efecto la η² de H, la fracción de la variación de los rangos que explican los grupos.",
      "Si H es significativa, las comparaciones por pares dicen cuáles grupos difieren: la de Dunn (una z con el error de los rangos de todo el experimento; es la opción por omisión), la de Conover-Iman (una t, más potente) o la de Nemenyi (con la distribución del rango estudentizado). Los valores p se ajustan por Holm (por omisión), Bonferroni o Benjamini-Hochberg, o por Tukey en la de Conover-Iman. Con ellas la app asigna letras: la «a» al grupo de mayor rango medio, y dos grupos con una letra en común no difieren."
    ],
    "modelo": {
      "tex": "H = \\frac{\\frac{12}{N(N+1)} \\sum_{j=1}^{k} \\frac{R_j^2}{n_j} - 3(N+1)}{1 - \\frac{\\sum (t^3 - t)}{N^3 - N}}, \\quad \\eta_H^2 = \\frac{H - k + 1}{N - k}",
      "terminos": [
        ["N", "el total de observaciones"],
        ["k", "el número de grupos"],
        ["n_j", "el número de observaciones del grupo j"],
        ["R_j", "la suma de los rangos del grupo j en la muestra combinada"],
        ["t", "el tamaño de cada conjunto de valores empatados (corrección por empates)"],
        ["\\eta_H^2", "el tamaño del efecto, η² de H"]
      ]
    },
    "hipotesis": [
      { "h0": "F_1 = F_2 = \\cdots = F_k", "h1": "\\text{alguna } F_j \\text{ está desplazada}", "texto": "Todos los grupos vienen de la misma distribución, contra que al menos uno tiende a dar valores más altos o más bajos. Se prueba con H frente a una ji cuadrada con k − 1 gl." }
    ],
    "supuestos": [
      { "nombre": "Observaciones independientes", "como": "Lo da el diseño completamente al azar: unidades distintas en cada grupo. No se prueba con los datos.", "verificar": null, "siFalla": "Si los grupos se midieron en los mismos bloques o en las mismas unidades, usa Friedman.", "alternativa": "friedman" },
      { "nombre": "Forma y dispersión parecidas (para hablar de medianas)", "como": "Compara las cajas de la gráfica y los cuartiles del cuadro; «Revisar los supuestos del modelo» con este factor da la prueba de Brown-Forsythe de las varianzas.", "verificar": "supuestos", "siFalla": "Interpreta el resultado como dominancia (un grupo tiende a dar valores mayores), no como diferencia de medianas; si la dispersión crece con la media en una respuesta positiva, un modelo gamma la modela directamente.", "alternativa": "glm-gamma" },
      { "nombre": "Suficientes datos por grupo", "como": "El p usa la aproximación ji cuadrada, que funciona bien con 5 o más datos por grupo.", "verificar": null, "siFalla": "Con grupos muy chicos el p es aproximado; interprétalo con cautela y apóyate en las medianas y en la gráfica.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "huerta", "tipo": "factor con k niveles", "papel": "tratamientos (grupos)" }
      ],
      "minimo": "Para calcular bastan 2 grupos con datos y 3 observaciones; para que la aproximación ji cuadrada sea buena y las comparaciones tengan potencia, 5 o más por grupo.",
      "balance": "Los grupos pueden tener tamaños distintos (en el ejemplo, 11, 16 y 9 árboles con dato). Los faltantes se quitan, y los niveles sin datos no cuentan como grupos.",
      "notaFormato": "Formato largo: una fila por unidad (árbol, planta, parcela) con la respuesta y el grupo al que pertenece.",
      "errores": [
        "Usarla con bloques o con mediciones repetidas de las mismas unidades: para eso está Friedman.",
        "Leer el resultado como una diferencia de medianas cuando los grupos tienen dispersiones muy distintas.",
        "Hacer pruebas de Mann-Whitney entre todos los pares sin ajustar los valores p.",
        "Analizar por rangos datos que cumplen los supuestos del ANOVA: se pierde algo de potencia y la posibilidad de estudiar interacciones."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: si algún grupo difiere (H, gl y p) y el tamaño del efecto, η² de H.",
        "En el cuadro de grupos, ordenados por rango medio, revisa las medianas, los cuartiles y las letras.",
        "En el cuadro de comparaciones por pares, mira el p ajustado de cada par y la decisión.",
        "Revisa la gráfica de cajas con letras para ver la forma y la dispersión de cada grupo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento por árbol difirió entre huertas (Kruskal-Wallis, H = 21.8, gl = 2, p < 0.001; η² de H = 0.60). La huerta de Planicie (mediana de 61 kg) superó a las de Ladera (46 kg) y Vega (41 kg), que no difirieron entre sí (Dunn con ajuste de Holm, α = 0.05)».",
      "guias": ["kruskal", "eta2-h", "rango-medio", "mediana", "z", "p-ajustado"]
    },
    "limitaciones": [
      "Un solo factor y sin bloques: con bloques completos usa Friedman; con varios factores o interacciones, un diseño experimental, transformando la respuesta si hace falta.",
      "Con conteos o proporciones, un modelo lineal generalizado (Poisson, binomial) suele ser más potente y da estimaciones en la escala original.",
      "Para dos grupos usa Wilcoxon y Mann-Whitney: da el mismo p que Kruskal-Wallis cuando usa la aproximación normal sin corrección por continuidad, y además el estimador de Hodges-Lehmann.",
      "No da intervalos de confianza para las diferencias entre grupos."
    ],
    "referencias": [
      "Kruskal, W. H., & Wallis, W. A. (1952). Use of ranks in one-criterion variance analysis. Journal of the American Statistical Association, 47(260), 583–621.",
      "Dunn, O. J. (1964). Multiple comparisons using rank sums. Technometrics, 6(3), 241–252.",
      "Holm, S. (1979). A simple sequentially rejective multiple test procedure. Scandinavian Journal of Statistics, 6(2), 65–70.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Kruskal-Wallis H test", "One-way analysis of variance on ranks", "Dunn's test", "Conover-Iman and Nemenyi comparisons"],
    "paraQue": "Compares three or more independent groups through the ranks of their data, without assuming normality, and tells which ones differ with pairwise comparisons and letters.",
    "preguntas": [
      "Does yield per tree differ among three avocado orchards?",
      "Does the number of larvae per plant change among five insecticides when the counts are strongly skewed?",
      "Do flavor scores (1 to 9) differ among four tomato varieties when each variety was tasted by different consumers?"
    ],
    "teoria": [
      "The Kruskal-Wallis test is the rank version of the one-way analysis of variance in a completely randomized design. It pools all observations, sorts them from smallest to largest and replaces each value by its rank; ties get the average rank. If the groups came from the same distribution, their mean ranks would be similar; the H statistic measures how far apart they are and, corrected for ties, is compared with a chi-square distribution with k − 1 degrees of freedom.",
      "Because it uses ranks, it does not assume normality and does not share the mean's sensitivity to extreme values: it works for strongly skewed data, small counts or ordinal scales. In exchange, what it tests is whether some group tends to give higher values than another; it can be read as a difference in medians only if the distributions have similar shape and spread. SigmaPro reports the H-based η² as the effect size, the fraction of the variation in ranks explained by the groups.",
      "If H is significant, pairwise comparisons tell which groups differ: Dunn's test (a z with the rank error of the whole experiment; the default), Conover-Iman's (a t, more powerful) or Nemenyi's (with the studentized range distribution). The p-values are adjusted by Holm (the default), Bonferroni or Benjamini-Hochberg, or by Tukey in Conover-Iman's test. With them the app assigns letters: “a” goes to the group with the highest mean rank, and two groups sharing a letter do not differ."
    ],
    "modelo": {
      "tex": "H = \\frac{\\frac{12}{N(N+1)} \\sum_{j=1}^{k} \\frac{R_j^2}{n_j} - 3(N+1)}{1 - \\frac{\\sum (t^3 - t)}{N^3 - N}}, \\quad \\eta_H^2 = \\frac{H - k + 1}{N - k}",
      "terminos": [
        ["N", "the total number of observations"],
        ["k", "the number of groups"],
        ["n_j", "the number of observations in group j"],
        ["R_j", "the sum of the ranks of group j in the pooled sample"],
        ["t", "the size of each set of tied values (tie correction)"],
        ["\\eta_H^2", "the effect size, H-based η²"]
      ]
    },
    "hipotesis": [
      { "h0": "F_1 = F_2 = \\cdots = F_k", "h1": "\\text{some } F_j \\text{ is shifted}", "texto": "All groups come from the same distribution, against at least one tending to give higher or lower values. It is tested with H against a chi-square distribution with k − 1 df." }
    ],
    "supuestos": [
      { "nombre": "Independent observations", "como": "It comes from the completely randomized design: different units in each group. It is not tested with the data.", "verificar": null, "siFalla": "If the groups were measured in the same blocks or on the same units, use Friedman.", "alternativa": "friedman" },
      { "nombre": "Similar shape and spread (to speak of medians)", "como": "Compare the box plots and the quartiles in the table; “Check the model assumptions” with this factor gives the Brown-Forsythe test of the variances.", "verificar": "supuestos", "siFalla": "Read the result as dominance (one group tends to give larger values), not as a difference in medians; if the spread grows with the mean in a positive response, a gamma model handles it directly.", "alternativa": "glm-gamma" },
      { "nombre": "Enough data per group", "como": "The p-value uses the chi-square approximation, which works well with 5 or more observations per group.", "verificar": null, "siFalla": "With very small groups the p-value is approximate; interpret it with caution and rely on the medians and the plot.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "huerta", "tipo": "factor with k levels", "papel": "treatments (groups)" }
      ],
      "minimo": "To compute, 2 groups with data and 3 observations are enough; for a good chi-square approximation and pairwise comparisons with some power, 5 or more per group.",
      "balance": "Groups may have different sizes (in the example, 11, 16 and 9 trees with data). Missing values are removed, and levels with no data do not count as groups.",
      "notaFormato": "Long format: one row per unit (tree, plant, plot) with the response and the group it belongs to.",
      "errores": [
        "Using it with blocks or with repeated measurements of the same units: that is what Friedman is for.",
        "Reading the result as a difference in medians when the groups have very different spreads.",
        "Running Mann-Whitney tests between all pairs without adjusting the p-values.",
        "Analyzing by ranks data that meet the ANOVA assumptions: some power is lost, along with the chance to study interactions."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: whether some group differs (H, df and p) and the effect size, H-based η².",
        "In the table of groups, sorted by mean rank, check the medians, quartiles and letters.",
        "In the pairwise comparisons table, look at the adjusted p-value of each pair and the decision.",
        "Check the box plot with letters to see the shape and spread of each group."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield per tree differed among orchards (Kruskal-Wallis, H = 21.8, df = 2, p < 0.001; H-based η² = 0.60). The Planicie orchard (median 61 kg) outyielded Ladera (46 kg) and Vega (41 kg), which did not differ from each other (Dunn with Holm adjustment, α = 0.05).”",
      "guias": ["kruskal", "eta2-h", "rango-medio", "mediana", "z", "p-ajustado"]
    },
    "limitaciones": [
      "One factor and no blocks: with complete blocks use Friedman; with several factors or interactions, an experimental design, transforming the response if needed.",
      "With counts or proportions, a generalized linear model (Poisson, binomial) is usually more powerful and gives estimates on the original scale.",
      "For two groups use Wilcoxon and Mann-Whitney: it gives the same p-value as Kruskal-Wallis when it uses the normal approximation without continuity correction, plus the Hodges-Lehmann estimator.",
      "It gives no confidence intervals for the differences between groups."
    ],
    "referencias": [
      "Kruskal, W. H., & Wallis, W. A. (1952). Use of ranks in one-criterion variance analysis. Journal of the American Statistical Association, 47(260), 583–621.",
      "Dunn, O. J. (1964). Multiple comparisons using rank sums. Technometrics, 6(3), 241–252.",
      "Holm, S. (1979). A simple sequentially rejective multiple test procedure. Scandinavian Journal of Statistics, 6(2), 65–70.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley."
    ]
  }
});
