SP_FICHA({
  "id": "friedman",
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["dbca"],
  "relacionados": ["dbca", "kruskal-wallis", "wilcoxon", "glmm-bloques", "mixto-bloques", "supuestos"],
  "ejemplo": { "conjunto": "aguacate", "entradas": { "respuesta": "trips", "tratamiento": "tratamiento", "bloque": "bloque" }, "opciones": { "posthoc": "conover", "ajuste": "holm" } },
  "formato": {
    "largo": [["bloque", "tratamiento", "trips"], ["1", "Testigo", "8"], ["1", "Azadiractina", "6"], ["1", "Spinosad", "1"], ["1", "Jabón potásico", "1"], ["1", "Beauveria", "3"], ["2", "Testigo", "5"], ["2", "Azadiractina", "NA"]],
    "ancho": [["bloque", "Testigo", "Azadiractina", "Spinosad", "Jabón potásico", "Beauveria"], ["1", "8", "6", "1", "1", "3"], ["2", "5", "NA", "3", "3", "1"], ["3", "12", "2", "1", "9", "7"], ["4", "2", "15", "0", "11", "4"]]
  },
  "es": {
    "alias": ["Prueba de Friedman", "Análisis de varianza de dos vías por rangos", "W de Kendall", "Prueba de Conover para bloques"],
    "paraQue": "Compara tres o más tratamientos en bloques completos usando los rangos dentro de cada bloque, sin suponer normalidad.",
    "preguntas": [
      "¿Difiere el número de trips por brote entre cinco tratamientos aplicados en seis bloques de una huerta de aguacate?",
      "¿Prefieren los jueces de un panel alguna de cuatro variedades de jitomate, si cada juez califica las cuatro?",
      "¿Cambia la severidad de una enfermedad entre fechas de muestreo evaluadas en las mismas parcelas?"
    ],
    "teoria": [
      "La prueba de Friedman es la versión por rangos del análisis de varianza en bloques completos al azar. En lugar de comparar los valores, ordena los tratamientos dentro de cada bloque (1 al menor y k al mayor; los empates reciben el rango promedio) y suma los rangos de cada tratamiento en todos los bloques. Así la diferencia entre bloques desaparece: un bloque fértil y uno pobre aportan los mismos rangos. Si los tratamientos no tuvieran efecto, cada uno recibiría en promedio el rango medio y sus sumas serían parecidas; el estadístico, corregido por empates, mide qué tanto se separan y se compara con una ji cuadrada con k − 1 grados de libertad.",
      "SigmaPro informa también la W de Kendall, que va de 0 a 1 y mide qué tanto coinciden los bloques en el orden de los tratamientos: es a la vez un tamaño del efecto y una medida de concordancia, útil cuando los bloques son jueces o evaluadores.",
      "La prueba necesita exactamente un dato por tratamiento en cada bloque. Si en un bloque la respuesta de algún tratamiento está vacía, ese bloque completo sale del análisis, como en R; si falta la fila de una combinación, la app se detiene y te pide completarla. Si la prueba es significativa, las comparaciones por pares de Conover (por omisión), de Nemenyi o de Wilcoxon pareada dicen qué tratamientos difieren, con los valores p ajustados (Holm, Bonferroni, Benjamini-Hochberg o, en la de Conover, Tukey) y letras de agrupación: la «a» al tratamiento de mayor suma de rangos."
    ],
    "modelo": {
      "tex": "Q = \\frac{12 \\sum_{j=1}^{k} \\left( R_j - \\frac{n(k+1)}{2} \\right)^2}{n k (k+1) - \\frac{\\sum (t^3 - t)}{k-1}}, \\quad W = \\frac{Q}{n(k-1)}",
      "terminos": [
        ["n", "el número de bloques completos"],
        ["k", "el número de tratamientos"],
        ["R_j", "la suma de los rangos del tratamiento j en todos los bloques"],
        ["\\frac{n(k+1)}{2}", "la suma de rangos que se espera si los tratamientos no difieren"],
        ["t", "el tamaño de cada conjunto de empates dentro de un bloque"],
        ["W", "la W de Kendall: la concordancia entre bloques, de 0 a 1"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_k", "h1": "\\text{algún } \\tau_j \\ne \\tau_l", "texto": "Dentro de cada bloque todos los órdenes de los tratamientos son igual de probables, es decir, no hay efecto de tratamiento. Se prueba con Q frente a una ji cuadrada con k − 1 gl." }
    ],
    "supuestos": [
      { "nombre": "Un dato por tratamiento en cada bloque", "como": "SigmaPro lo revisa: si hay repeticiones dentro de un bloque o falta la fila de algún tratamiento, se detiene y te lo dice; los bloques con la respuesta vacía en algún tratamiento se excluyen y la nota del cuadro dice cuántos.", "verificar": null, "siFalla": "Promedia las repeticiones de cada tratamiento por bloque antes de cargar los datos (los descriptivos agrupados por tratamiento y bloque dan esas medias; el bloque Datos no promedia filas); si faltan muchos datos, usa un modelo mixto con bloques aleatorios, que aprovecha los bloques incompletos.", "alternativa": "mixto-bloques" },
      { "nombre": "Bloques independientes entre sí", "como": "Lo da el diseño: cada bloque (parcela, juez, árbol) es una unidad distinta. No se prueba con los datos.", "verificar": null, "siFalla": "Si los tratamientos son fechas medidas en las mismas unidades y te interesa la tendencia en el tiempo, usa un modelo de medidas repetidas.", "alternativa": "medidas-repetidas" },
      { "nombre": "Sin interacción bloque × tratamiento", "como": "La prueba supone que el orden de los tratamientos es el mismo en todos los bloques salvo por azar; una W de Kendall baja indica que no coinciden. «Revisar los supuestos del modelo» con bloque y tratamiento aplica la prueba de no aditividad de Tukey.", "verificar": "supuestos", "siFalla": "Si los tratamientos se ordenan distinto según el bloque, la prueba pierde potencia; analiza con un modelo que incluya esa variación.", "alternativa": "mixto-bloques" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "conteo", "papel": "respuesta" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles", "papel": "tratamientos" },
        { "nombre": "bloque", "tipo": "factor con n niveles", "papel": "bloques" }
      ],
      "minimo": "Al menos 2 tratamientos y 2 bloques completos; para que la aproximación ji cuadrada funcione y las comparaciones tengan potencia, conviene tener 5 bloques o más.",
      "balance": "Cada bloque debe tener una fila de cada tratamiento. Los bloques con la respuesta vacía en algún tratamiento salen completos (en el ejemplo quedan 4 de 6 bloques). Si falta la fila de una combinación, o hay más de un dato por tratamiento en un bloque, la app se detiene y te dice qué corregir.",
      "notaFormato": "Formato largo: una fila por parcela con el bloque, el tratamiento y la respuesta. El formato ancho (un renglón por bloque y una columna por tratamiento) ayuda a ver que cada bloque esté completo; pásalo a largo en Datos con «Ancha ⇄ larga».",
      "errores": [
        "Tener varias parcelas o plantas por tratamiento en cada bloque sin promediarlas antes.",
        "Usar Kruskal-Wallis con datos en bloques: la variación entre bloques queda en el error y se pierde sensibilidad.",
        "No notar que un solo faltante elimina el bloque completo del análisis.",
        "Intercambiar bloque y tratamiento al llenar el formulario: los rangos se calculan dentro de cada bloque."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: si algún tratamiento difiere (χ², gl y p) y la W de Kendall, con el número de bloques usados.",
        "Revisa la nota de bloques excluidos por faltantes.",
        "En el cuadro de tratamientos, ordenados por suma de rangos, mira las medianas, los rangos medios y las letras.",
        "En las comparaciones por pares, lee el p ajustado y la decisión de cada par.",
        "Mira las cajas con letras, que incluyen solo los bloques completos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El número de trips por brote difirió entre tratamientos (Friedman, χ² = 12.4, gl = 4, p = 0.015; W de Kendall = 0.78, con 4 bloques completos); Spinosad tuvo la menor suma de rangos y difirió del testigo (Conover con ajuste de Holm, α = 0.05)».",
      "guias": ["friedman", "w-kendall", "rango-medio", "mediana", "chi2", "p-ajustado"]
    },
    "limitaciones": [
      "Un solo factor de tratamiento y un factor de bloque, sin repeticiones dentro del bloque: para factoriales en bloques usa el diseño en bloques completos, transformando la respuesta si hace falta.",
      "Usa solo el orden dentro de cada bloque y descarta la magnitud de las diferencias, así que es menos potente que el ANOVA cuando este es válido.",
      "Para conteos o proporciones en bloques, un modelo lineal generalizado mixto con bloques aleatorios aprovecha mejor la información.",
      "Pierde bloques completos por un solo faltante; con muchos faltantes, un modelo mixto es mejor opción."
    ],
    "referencias": [
      "Friedman, M. (1937). The use of ranks to avoid the assumption of normality implicit in the analysis of variance. Journal of the American Statistical Association, 32(200), 675–701.",
      "Kendall, M. G., & Babington Smith, B. (1939). The problem of m rankings. The Annals of Mathematical Statistics, 10(3), 275–287.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Friedman test", "Two-way analysis of variance on ranks", "Kendall's W", "Conover test for blocks"],
    "paraQue": "Compares three or more treatments in complete blocks using the ranks within each block, without assuming normality.",
    "preguntas": [
      "Does the number of thrips per shoot differ among five treatments applied in six blocks of an avocado orchard?",
      "Do the judges of a panel prefer one of four tomato varieties when each judge scores all four?",
      "Does disease severity change among sampling dates assessed on the same plots?"
    ],
    "teoria": [
      "The Friedman test is the rank version of the analysis of variance for randomized complete blocks. Instead of comparing the values, it ranks the treatments within each block (1 for the smallest and k for the largest; ties get the average rank) and adds up the ranks of each treatment over all blocks. The difference among blocks thus disappears: a fertile block and a poor one contribute the same ranks. If the treatments had no effect, each would receive the middle rank on average and their sums would be similar; the statistic, corrected for ties, measures how far apart they are and is compared with a chi-square distribution with k − 1 degrees of freedom.",
      "SigmaPro also reports Kendall's W, which ranges from 0 to 1 and measures how much the blocks agree on the order of the treatments: it is both an effect size and a measure of agreement, useful when the blocks are judges or raters.",
      "The test needs exactly one observation per treatment in each block. If the response of a treatment is empty in a block, the whole block is dropped from the analysis, as in R; if the row of a combination is missing, the app stops and asks you to complete it. If the test is significant, the pairwise comparisons of Conover (the default), Nemenyi or the paired Wilcoxon test tell which treatments differ, with adjusted p-values (Holm, Bonferroni, Benjamini-Hochberg or, for Conover, Tukey) and grouping letters: “a” goes to the treatment with the highest rank sum."
    ],
    "modelo": {
      "tex": "Q = \\frac{12 \\sum_{j=1}^{k} \\left( R_j - \\frac{n(k+1)}{2} \\right)^2}{n k (k+1) - \\frac{\\sum (t^3 - t)}{k-1}}, \\quad W = \\frac{Q}{n(k-1)}",
      "terminos": [
        ["n", "the number of complete blocks"],
        ["k", "the number of treatments"],
        ["R_j", "the sum of the ranks of treatment j over all blocks"],
        ["\\frac{n(k+1)}{2}", "the rank sum expected if the treatments do not differ"],
        ["t", "the size of each set of ties within a block"],
        ["W", "Kendall's W: the agreement among blocks, from 0 to 1"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_k", "h1": "\\text{some } \\tau_j \\ne \\tau_l", "texto": "Within each block all orderings of the treatments are equally likely, that is, there is no treatment effect. It is tested with Q against a chi-square distribution with k − 1 df." }
    ],
    "supuestos": [
      { "nombre": "One observation per treatment in each block", "como": "SigmaPro checks it: if there are replicates within a block or the row of a treatment is missing, it stops and tells you; blocks with an empty response for some treatment are excluded and the table note says how many.", "verificar": null, "siFalla": "Average the replicates of each treatment per block before loading the data (descriptive statistics grouped by treatment and block give those means; the Data block does not average rows); if many data are missing, use a mixed model with random blocks, which makes use of incomplete blocks.", "alternativa": "mixto-bloques" },
      { "nombre": "Blocks independent of each other", "como": "It comes from the design: each block (plot, judge, tree) is a different unit. It is not tested with the data.", "verificar": null, "siFalla": "If the treatments are dates measured on the same units and you care about the trend over time, use a repeated measures model.", "alternativa": "medidas-repetidas" },
      { "nombre": "No block × treatment interaction", "como": "The test assumes that the order of the treatments is the same in every block except for chance; a low Kendall's W means the blocks do not agree. “Check the model assumptions” with block and treatment runs Tukey's test for nonadditivity.", "verificar": "supuestos", "siFalla": "If the treatments rank differently depending on the block, the test loses power; analyze with a model that includes that variation.", "alternativa": "mixto-bloques" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "trips", "tipo": "count", "papel": "response" },
        { "nombre": "tratamiento", "tipo": "factor with k levels", "papel": "treatments" },
        { "nombre": "bloque", "tipo": "factor with n levels", "papel": "blocks" }
      ],
      "minimo": "At least 2 treatments and 2 complete blocks; for the chi-square approximation to work and the comparisons to have power, 5 or more blocks are advisable.",
      "balance": "Each block must have one row for each treatment. Blocks with an empty response for some treatment are dropped entirely (in the example 4 of 6 blocks remain). If the row of a combination is missing, or there is more than one observation per treatment in a block, the app stops and tells you what to fix.",
      "notaFormato": "Long format: one row per plot with the block, the treatment and the response. The wide format (one row per block and one column per treatment) helps you see that each block is complete; convert it to long format in Data with “Wide ⇄ long”.",
      "errores": [
        "Having several plots or plants per treatment in each block without averaging them first.",
        "Using Kruskal-Wallis with blocked data: the variation among blocks stays in the error and sensitivity is lost.",
        "Not noticing that a single missing value removes the whole block from the analysis.",
        "Swapping block and treatment when filling in the form: the ranks are computed within each block."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: whether some treatment differs (χ², df and p) and Kendall's W, with the number of blocks used.",
        "Check the note on blocks excluded because of missing values.",
        "In the table of treatments, sorted by rank sum, look at the medians, mean ranks and letters.",
        "In the pairwise comparisons, read the adjusted p-value and the decision for each pair.",
        "Look at the box plots with letters, which include only the complete blocks."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The number of thrips per shoot differed among treatments (Friedman, χ² = 12.4, df = 4, p = 0.015; Kendall's W = 0.78, with 4 complete blocks); Spinosad had the lowest rank sum and differed from the control (Conover with Holm adjustment, α = 0.05).”",
      "guias": ["friedman", "w-kendall", "rango-medio", "mediana", "chi2", "p-ajustado"]
    },
    "limitaciones": [
      "A single treatment factor and a single block factor, with no replicates within the block: for factorials in blocks use the randomized complete block design, transforming the response if needed.",
      "It uses only the order within each block and discards the size of the differences, so it is less powerful than the ANOVA when the latter is valid.",
      "For counts or proportions in blocks, a generalized linear mixed model with random blocks makes better use of the information.",
      "It loses whole blocks because of a single missing value; with many missing values, a mixed model is a better choice."
    ],
    "referencias": [
      "Friedman, M. (1937). The use of ranks to avoid the assumption of normality implicit in the analysis of variance. Journal of the American Statistical Association, 32(200), 675–701.",
      "Kendall, M. G., & Babington Smith, B. (1939). The problem of m rankings. The Annals of Mathematical Statistics, 10(3), 275–287.",
      "Conover, W. J. (1999). Practical nonparametric statistics (3rd ed.). Wiley.",
      "Hollander, M., Wolfe, D. A., & Chicken, E. (2014). Nonparametric statistical methods (3rd ed.). Wiley."
    ]
  }
});
