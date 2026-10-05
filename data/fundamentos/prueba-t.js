SP_FICHA({
  "id": "prueba-t",
  "familia": "pruebas-t",
  "respuesta": "continua",
  "estructura": "dos-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["wilcoxon", "dca", "potencia-medias", "supuestos", "descriptivos", "comparaciones-medias"],
  "ejemplo": { "conjunto": "jitomate", "entradas": { "modo": "independientes", "respuesta": "altura_60dds", "grupo": "sustrato", "niveles": ["Tezontle", "Fibra de coco"] }, "opciones": {} },
  "formato": {
    "largo": [["sustrato", "planta", "altura_60dds"], ["Tezontle", "P01", "151.7"], ["Tezontle", "P02", "157.1"], ["Tezontle", "P03", "148.3"], ["Tezontle", "P04", "148.7"], ["Tezontle", "P05", "NA"], ["Tezontle", "P06", "153.8"], ["Fibra de coco", "P07", "166.1"], ["Fibra de coco", "P08", "171.9"]],
    "ancho": null
  },
  "es": {
    "alias": ["Prueba t de Student", "Prueba t de Welch", "Prueba t pareada", "Prueba t de una muestra"],
    "paraQue": "Compara la media de dos grupos, de dos mediciones de las mismas unidades o de una muestra contra un valor de referencia, con el tamaño del efecto.",
    "preguntas": [
      "¿Difiere la altura a los 60 días de las plantas de jitomate cultivadas en tezontle y en fibra de coco?",
      "¿Aumentó el contenido de clorofila de las mismas hojas después de aplicar un fertilizante foliar?",
      "¿Alcanza el peso medio de los frutos de un lote los 120 g que pide el comprador?"
    ],
    "teoria": [
      "La prueba t mide qué tan lejos está una diferencia de medias del valor que plantea la hipótesis nula (casi siempre cero), en unidades de su error estándar. Si la diferencia real fuera ese valor, t seguiría una distribución t de Student; un t grande en valor absoluto, con su p pequeño, es evidencia de que la diferencia existe. SigmaPro tiene tres modos.",
      "Con dos grupos independientes (plantas distintas en cada sustrato) compara las dos medias. Por omisión usa la t de Welch, que no supone varianzas iguales y ajusta los grados de libertad con la fórmula de Welch-Satterthwaite; si marcas «Suponer varianzas iguales», usa la t de Student con la varianza combinada. El cuadro muestra las dos: primero la elegida y después la otra, como referencia. Con mediciones pareadas (la misma hoja antes y después, dos tratamientos en la misma planta) analiza la diferencia de cada par con una t de una muestra: quitar la variación entre unidades la vuelve mucho más sensible. Con una muestra compara la media con un valor de referencia.",
      "El valor p dice si hay evidencia de diferencia, no qué tan grande es. Por eso la app informa el intervalo de confianza de la diferencia y el tamaño del efecto: la d de Cohen (la diferencia dividida entre la desviación estándar combinada, o entre la de las diferencias en datos pareados) y la g de Hedges, que corrige el sesgo de d con muestras chicas, ambas con su intervalo por la t no central. La hipótesis alternativa puede ser bilateral o de una cola."
    ],
    "modelo": {
      "tex": "t = \\frac{\\bar{y}_1 - \\bar{y}_2 - \\Delta_0}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}",
      "terminos": [
        ["\\bar{y}_1, \\bar{y}_2", "las medias de los dos grupos"],
        ["s_1^2, s_2^2", "las varianzas de los dos grupos"],
        ["n_1, n_2", "el número de datos de cada grupo"],
        ["\\Delta_0", "la diferencia bajo la hipótesis nula (0 por omisión)"],
        ["t", "el estadístico de Welch; en la t de Student el denominador usa la varianza combinada y gl = n_1 + n_2 − 2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 - \\mu_2 = \\Delta_0", "h1": "\\mu_1 - \\mu_2 \\ne \\Delta_0", "texto": "Dos grupos independientes; también puedes elegir una alternativa de una cola (menor o mayor). En datos pareados la hipótesis es sobre la media de las diferencias." },
      { "h0": "\\mu = \\mu_0", "h1": "\\mu \\ne \\mu_0", "texto": "Una muestra contra el valor de referencia μ₀." }
    ],
    "supuestos": [
      { "nombre": "Normalidad", "como": "El semáforo de la prueba aplica Shapiro-Wilk a cada grupo, o a las diferencias en datos pareados (ámbar si p < α y rojo si p < α/5). Las cajas de la gráfica muestran la forma y los atípicos.", "verificar": "supuestos", "siFalla": "Con 30 datos o más por grupo la t es robusta. Con pocos datos y desviaciones claras (asimetría fuerte, atípicos), usa Wilcoxon o Mann-Whitney, o transforma la respuesta en Datos.", "alternativa": "wilcoxon" },
      { "nombre": "Varianzas iguales (solo en la t de Student)", "como": "El semáforo informa la prueba F de razón de varianzas. Con la t de Welch, la opción por omisión, el renglón queda en verde porque Welch no lo necesita.", "verificar": null, "siFalla": "No marques «Suponer varianzas iguales»: usa la t de Welch.", "alternativa": null },
      { "nombre": "Independencia", "como": "Lo da el diseño: unidades distintas en cada grupo, o pares bien identificados en el modo pareado. No se prueba con los datos.", "verificar": null, "siFalla": "Si mediste las mismas unidades dos veces, usa el modo pareado; si comparas más de dos tratamientos o tienes bloques, usa un diseño experimental.", "alternativa": "dbca" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura_60dds", "tipo": "numérica continua", "papel": "respuesta (o variable, en una muestra)" },
        { "nombre": "sustrato", "tipo": "factor con 2 o más niveles (se comparan dos)", "papel": "grupos" },
        { "nombre": "dos columnas numéricas", "tipo": "numérica continua", "papel": "primera y segunda medición (modo pareado)" }
      ],
      "minimo": "Al menos 2 datos por grupo para calcular, pero conviene tener 5 o más; para detectar diferencias moderadas hacen falta bastantes más (calcúlalo con la potencia y el tamaño de muestra de medias).",
      "balance": "Los grupos pueden tener tamaños distintos. Los faltantes se quitan de cada grupo (en el ejemplo, la planta P05) y en el modo pareado solo entran los pares completos. Si el factor tiene más de dos niveles, eliges cuáles dos comparar.",
      "notaFormato": "Dos grupos: formato largo, una fila por unidad con su respuesta y su grupo. Pareadas: formato ancho, una fila por unidad con las dos mediciones en columnas (por ejemplo, altura_45dds y altura_60dds); se compara primera − segunda.",
      "errores": [
        "Usar la t de dos grupos con mediciones pareadas (la misma planta antes y después): se pierde la ventaja del pareo y el error queda inflado.",
        "Hacer muchas pruebas t entre pares de tratamientos en lugar de un análisis de varianza con comparaciones múltiples: el error tipo I se acumula.",
        "Contar como repeticiones varias plantas de la misma maceta o parcela (pseudorreplicación).",
        "Comparar dos niveles de un factor sin tomar en cuenta los demás factores o los bloques del experimento."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: la normalidad de cada grupo (o de las diferencias) y, con dos grupos, la comparación de varianzas.",
        "Lee la conclusión: la diferencia de medias, su intervalo, t, gl y p.",
        "En el cuadro de la prueba, la primera fila es la t elegida; la segunda (Student o Welch) es solo de referencia.",
        "Juzga la magnitud con la g de Hedges y su intervalo (0.2 pequeño, 0.5 mediano, 0.8 grande) y, en las unidades originales, con el intervalo de la diferencia.",
        "Mira las cajas de la gráfica para detectar atípicos o asimetrías."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «A los 60 días, las plantas en fibra de coco midieron en promedio 16.5 cm más que las cultivadas en tezontle (IC 95 %: 12.1 a 20.9 cm; t de Welch = 8.2, gl = 7.4, p < 0.001; g de Hedges = 4.1)».",
      "guias": ["t", "gl", "p", "ic", "d-cohen", "g-hedges", "shapiro"]
    },
    "limitaciones": [
      "Compara solo dos medias: con tres o más tratamientos usa un diseño experimental (completamente al azar o en bloques) y las comparaciones de medias.",
      "Con muestras chicas es sensible a los valores atípicos; en ese caso usa Wilcoxon o Mann-Whitney.",
      "No admite bloques ni covariables más allá del pareo: para eso usa el diseño en bloques o el análisis de covarianza.",
      "Para planear cuántas repeticiones necesitas, usa la potencia y el tamaño de muestra de medias."
    ],
    "referencias": [
      "Student. (1908). The probable error of a mean. Biometrika, 6(1), 1–25.",
      "Welch, B. L. (1947). The generalization of \"Student's\" problem when several different population variances are involved. Biometrika, 34(1/2), 28–35.",
      "Hedges, L. V. (1981). Distribution theory for Glass's estimator of effect size and related estimators. Journal of Educational Statistics, 6(2), 107–128.",
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Student's t test", "Welch's t test", "Paired t test", "One-sample t test"],
    "paraQue": "Compares the mean of two groups, of two measurements on the same units or of one sample against a reference value, with the effect size.",
    "preguntas": [
      "Does the height at 60 days of tomato plants grown in volcanic rock (tezontle) differ from that of plants grown in coconut fiber?",
      "Did the chlorophyll content of the same leaves increase after a foliar fertilizer was applied?",
      "Does the mean fruit weight of a lot reach the 120 g the buyer requires?"
    ],
    "teoria": [
      "The t test measures how far a difference in means is from the value stated by the null hypothesis (almost always zero), in units of its standard error. If the true difference were that value, t would follow a Student's t distribution; a t that is large in absolute value, with a small p-value, is evidence that the difference exists. SigmaPro has three modes.",
      "With two independent groups (different plants in each substrate) it compares the two means. By default it uses Welch's t, which does not assume equal variances and adjusts the degrees of freedom with the Welch-Satterthwaite formula; if you check “Assume equal variances”, it uses Student's t with the pooled variance. The table shows both: the chosen one first and the other one as a reference. With paired measurements (the same leaf before and after, two treatments on the same plant) it analyzes the difference of each pair with a one-sample t: removing the variation among units makes it much more sensitive. With one sample it compares the mean with a reference value.",
      "The p-value says whether there is evidence of a difference, not how large it is. That is why the app reports the confidence interval of the difference and the effect size: Cohen's d (the difference divided by the pooled standard deviation, or by that of the differences in paired data) and Hedges' g, which corrects the bias of d in small samples, both with their interval from the noncentral t distribution. The alternative hypothesis can be two-sided or one-sided."
    ],
    "modelo": {
      "tex": "t = \\frac{\\bar{y}_1 - \\bar{y}_2 - \\Delta_0}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}",
      "terminos": [
        ["\\bar{y}_1, \\bar{y}_2", "the means of the two groups"],
        ["s_1^2, s_2^2", "the variances of the two groups"],
        ["n_1, n_2", "the number of observations in each group"],
        ["\\Delta_0", "the difference under the null hypothesis (0 by default)"],
        ["t", "Welch's statistic; in Student's t the denominator uses the pooled variance and df = n_1 + n_2 − 2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mu_1 - \\mu_2 = \\Delta_0", "h1": "\\mu_1 - \\mu_2 \\ne \\Delta_0", "texto": "Two independent groups; you can also choose a one-sided alternative (less or greater). In paired data the hypothesis is about the mean of the differences." },
      { "h0": "\\mu = \\mu_0", "h1": "\\mu \\ne \\mu_0", "texto": "One sample against the reference value μ₀." }
    ],
    "supuestos": [
      { "nombre": "Normality", "como": "The test's checklist applies Shapiro-Wilk to each group, or to the differences in paired data (amber if p < α and red if p < α/5). The box plots show the shape and the outliers.", "verificar": "supuestos", "siFalla": "With 30 or more observations per group the t test is robust. With few data and clear departures (strong skewness, outliers), use Wilcoxon or Mann-Whitney, or transform the response in Data.", "alternativa": "wilcoxon" },
      { "nombre": "Equal variances (Student's t only)", "como": "The checklist reports the F test for the ratio of variances. With Welch's t, the default, the line stays green because Welch does not need it.", "verificar": null, "siFalla": "Do not check “Assume equal variances”: use Welch's t.", "alternativa": null },
      { "nombre": "Independence", "como": "It comes from the design: different units in each group, or well-identified pairs in the paired mode. It is not tested with the data.", "verificar": null, "siFalla": "If you measured the same units twice, use the paired mode; if you compare more than two treatments or have blocks, use an experimental design.", "alternativa": "dbca" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura_60dds", "tipo": "continuous numeric", "papel": "response (or variable, for one sample)" },
        { "nombre": "sustrato", "tipo": "factor with 2 or more levels (two are compared)", "papel": "groups" },
        { "nombre": "two numeric columns", "tipo": "continuous numeric", "papel": "first and second measurement (paired mode)" }
      ],
      "minimo": "At least 2 observations per group to compute, but 5 or more is advisable; detecting moderate differences takes quite a few more (work it out with the power and sample size for means).",
      "balance": "Groups may have different sizes. Missing values are removed from each group (in the example, plant P05) and in the paired mode only complete pairs enter. If the factor has more than two levels, you choose which two to compare.",
      "notaFormato": "Two groups: long format, one row per unit with its response and its group. Paired: wide format, one row per unit with the two measurements in columns (for example, altura_45dds and altura_60dds); first − second is compared.",
      "errores": [
        "Using the two-group t with paired measurements (the same plant before and after): the advantage of pairing is lost and the error is inflated.",
        "Running many t tests between pairs of treatments instead of an analysis of variance with multiple comparisons: the type I error builds up.",
        "Counting several plants from the same pot or plot as replicates (pseudoreplication).",
        "Comparing two levels of one factor without accounting for the other factors or the blocks of the experiment."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist: the normality of each group (or of the differences) and, with two groups, the comparison of variances.",
        "Read the conclusion: the difference in means, its interval, t, df and p.",
        "In the test table, the first row is the chosen t; the second one (Student or Welch) is for reference only.",
        "Judge the magnitude with Hedges' g and its interval (0.2 small, 0.5 medium, 0.8 large) and, in the original units, with the interval of the difference.",
        "Look at the box plots to spot outliers or skewness."
      ],
      "ejemplo": "Example write-up (illustrative figures): “At 60 days, plants in coconut fiber were on average 16.5 cm taller than those grown in tezontle (95% CI: 12.1 to 20.9 cm; Welch's t = 8.2, df = 7.4, p < 0.001; Hedges' g = 4.1).”",
      "guias": ["t", "gl", "p", "ic", "d-cohen", "g-hedges", "shapiro"]
    },
    "limitaciones": [
      "It compares only two means: with three or more treatments use an experimental design (completely randomized or blocks) and mean comparisons.",
      "With small samples it is sensitive to outliers; in that case use Wilcoxon or Mann-Whitney.",
      "It does not handle blocks or covariates beyond pairing: for that, use the block design or the analysis of covariance.",
      "To plan how many replicates you need, use the power and sample size for means."
    ],
    "referencias": [
      "Student. (1908). The probable error of a mean. Biometrika, 6(1), 1–25.",
      "Welch, B. L. (1947). The generalization of \"Student's\" problem when several different population variances are involved. Biometrika, 34(1/2), 28–35.",
      "Hedges, L. V. (1981). Distribution theory for Glass's estimator of effect size and related estimators. Journal of Educational Statistics, 6(2), 107–128.",
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  }
});
