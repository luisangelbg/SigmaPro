SP_FICHA({
  "id": "frecuencias",
  "familia": "descriptiva",
  "respuesta": "categorica",
  "estructura": "ninguna",
  "disenos": ["ninguno"],
  "relacionados": ["tabla-contingencia", "kappa", "proporciones", "bondad-ajuste", "mcnemar", "descriptivos"],
  "ejemplo": { "conjunto": "roya-evaluadores", "entradas": { "fila": "evaluador_A", "columna": "evaluador_B" }, "opciones": {} },
  "formato": {
    "largo": [["hoja", "evaluador_A", "evaluador_B"], ["H01", "0 sana", "0 sana"], ["H02", "0 sana", "0 sana"], ["H03", "3 severa", "3 severa"], ["H04", "0 sana", "1 leve"], ["H05", "1 leve", "1 leve"], ["H06", "0 sana", "1 leve"]],
    "ancho": null
  },
  "es": {
    "alias": ["Tabla de frecuencias", "Tabla cruzada", "Distribución de frecuencias", "Tabulación cruzada"],
    "paraQue": "Cuenta cuántas observaciones caen en cada categoría de un factor, o en cada combinación de dos factores, con sus porcentajes.",
    "preguntas": [
      "¿Cuántas hojas quedaron en cada clase de severidad de roya y qué porcentaje del total representan?",
      "¿Cómo se reparten los árboles muestreados de cada huerta entre los que tienen trips y los que no?",
      "¿En qué clases coinciden y en cuáles discrepan dos técnicos que califican las mismas hojas?"
    ],
    "teoria": [
      "Una variable categórica (variedad, clase de daño, presencia o ausencia de una plaga) no se resume con medias sino contando. La tabla de frecuencias de una vía da, para cada categoría, su frecuencia absoluta (cuántas observaciones tiene), su porcentaje del total y las frecuencias y porcentajes acumulados, que solo tienen sentido cuando las categorías siguen un orden natural, como las clases de severidad.",
      "La tabla cruzada cuenta las observaciones en cada combinación de las categorías de dos factores. Con ella se leen tres porcentajes distintos, y SigmaPro los muestra en vistas separadas: el porcentaje dentro de cada fila (cómo se reparten las columnas en cada categoría de la fila), el porcentaje dentro de cada columna y el porcentaje del total. Lo importante es elegir cuál leer: si la fila es el factor que explica (por ejemplo, el tratamiento) y la columna es el resultado (germinó o no), el porcentaje por fila compara directamente los tratamientos.",
      "Las tablas de frecuencias describen, no prueban. Si quieres saber si dos factores están asociados, usa la tabla de contingencia con su prueba ji cuadrada o la exacta de Fisher; si dos evaluadores coinciden, kappa; si una distribución sigue una proporción esperada, la bondad de ajuste. Los faltantes no entran en los porcentajes, salvo que pidas contarlos como una categoría más."
    ],
    "modelo": {
      "tex": "p_j = 100 \\frac{n_j}{n}, \\quad P_j = \\sum_{l=1}^{j} p_l, \\quad p_{j \\mid i} = 100 \\frac{n_{ij}}{n_{i\\cdot}}",
      "terminos": [
        ["n_j", "el número de observaciones en la categoría j"],
        ["n", "el total de observaciones con valor"],
        ["p_j", "el porcentaje de la categoría j"],
        ["P_j", "el porcentaje acumulado hasta la categoría j, en el orden de los niveles"],
        ["n_{ij}", "las observaciones en la fila i y la columna j de la tabla cruzada"],
        ["p_{j \\mid i}", "el porcentaje de la columna j dentro de la fila i; n_{i·} es el total de la fila"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Una fila por observación", "como": "SigmaPro cuenta filas; esta tabla no acepta una columna de pesos. Revisa en Datos que cada fila sea una unidad (hoja, planta, semilla).", "verificar": null, "siFalla": "Si tus datos ya vienen contados (una fila por combinación con su conteo), usa la tabla de contingencia, que acepta una columna de frecuencias.", "alternativa": "tabla-contingencia" },
      { "nombre": "Categorías excluyentes y escritas siempre igual", "como": "Revisa los niveles de cada factor en Datos: dos maneras de escribir la misma categoría (por ejemplo, «Sana» y «sana») cuentan como categorías distintas.", "verificar": null, "siFalla": "Unifica la escritura de los niveles en Datos antes de tabular.", "alternativa": null },
      { "nombre": "Observaciones independientes (para inferir después)", "como": "La tabla no lo necesita para describir, pero sí cualquier prueba que hagas con ella; depende del muestreo.", "verificar": null, "siFalla": "Si son las mismas unidades calificadas dos veces (antes y después, o dos evaluadores), compáralas con McNemar o con kappa, que respetan el pareo.", "alternativa": "mcnemar" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "evaluador_A", "tipo": "factor con k niveles", "papel": "variable (filas)" },
        { "nombre": "evaluador_B", "tipo": "factor con k niveles", "papel": "cruzar con (columnas, opcional)" }
      ],
      "minimo": "No hay mínimo. Los porcentajes de categorías con pocas observaciones son poco estables, y una tabla cruzada con muchas celdas vacías es difícil de leer: junta las categorías raras si tiene sentido.",
      "balance": "Los faltantes no entran en los porcentajes y la app dice cuántos quedaron fuera; con la opción «Contar los faltantes como una categoría» aparecen como «(faltante)». En la tabla cruzada, la conclusión cuenta las celdas sin ninguna observación.",
      "notaFormato": "Formato largo: una fila por unidad observada y una columna por factor. Las columnas numéricas con pocos valores (dosis, clases de 0 a 3) también se pueden tabular.",
      "errores": [
        "Tabular una tabla ya resumida (una fila por categoría con su conteo): cada fila cuenta como 1.",
        "Leer el porcentaje del total cuando la pregunta pide el porcentaje dentro de cada tratamiento (por fila).",
        "Escribir la misma categoría de dos maneras (mayúsculas, acentos), que se cuentan por separado.",
        "Interpretar porcentajes acumulados de categorías sin orden natural, como las variedades."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: cuántas categorías y observaciones hay y, en una vía, cuál categoría es la más frecuente.",
        "En una vía, revisa la frecuencia y el porcentaje de cada categoría; usa los acumulados solo si las categorías tienen orden.",
        "En la tabla cruzada, empieza por la vista de frecuencias para ver cuántos datos sostienen cada porcentaje y cuántas celdas están vacías.",
        "Cambia a «% por fila» o a «% por columna» según cuál factor explica y cuál es el resultado.",
        "Si necesitas una prueba de asociación o de concordancia, lleva los mismos factores a la tabla de contingencia o a kappa en el bloque Análisis."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «De 80 hojas, el primer técnico calificó 40 % como sanas, 29 % con daño leve, 16 % moderado y 15 % severo; los dos técnicos asignaron la misma clase a 82 % de las hojas, y todas las discrepancias fueron entre clases vecinas».",
      "guias": ["n"]
    },
    "limitaciones": [
      "No hace pruebas: para la asociación entre dos factores usa la tabla de contingencia (ji cuadrada, Fisher, V de Cramér).",
      "Para la concordancia entre dos evaluadores de las mismas unidades usa kappa; para un cambio antes y después en las mismas unidades, McNemar.",
      "Cruza solo dos factores; para tomar en cuenta un tercero (lote, localidad), filtra en Datos o usa Cochran-Mantel-Haenszel.",
      "No acepta una columna de pesos: con datos ya contados, usa la tabla de contingencia con su columna de frecuencias."
    ],
    "referencias": [
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  },
  "en": {
    "alias": ["Frequency table", "Cross-tabulation", "Frequency distribution", "Two-way table"],
    "paraQue": "Counts how many observations fall in each category of a factor, or in each combination of two factors, with their percentages.",
    "preguntas": [
      "How many leaves fell in each rust severity class, and what percentage of the total does each represent?",
      "How are the sampled trees of each orchard split between those with thrips and those without?",
      "In which classes do two technicians who rate the same leaves agree, and in which do they disagree?"
    ],
    "teoria": [
      "A categorical variable (variety, damage class, presence or absence of a pest) is not summarized with means but by counting. The one-way frequency table gives, for each category, its absolute frequency (how many observations it has), its percentage of the total and the cumulative frequencies and percentages, which only make sense when the categories follow a natural order, such as severity classes.",
      "The cross-tabulation counts the observations in each combination of the categories of two factors. Three different percentages can be read from it, and SigmaPro shows them in separate views: the percentage within each row (how the columns are distributed in each row category), the percentage within each column and the percentage of the total. What matters is choosing which one to read: if the row is the explanatory factor (for example, the treatment) and the column is the outcome (germinated or not), the row percentage compares the treatments directly.",
      "Frequency tables describe; they do not test. If you want to know whether two factors are associated, use the contingency table with its chi-square or Fisher's exact test; whether two raters agree, kappa; whether a distribution follows an expected ratio, the goodness of fit test. Missing values do not enter the percentages unless you ask to count them as one more category."
    ],
    "modelo": {
      "tex": "p_j = 100 \\frac{n_j}{n}, \\quad P_j = \\sum_{l=1}^{j} p_l, \\quad p_{j \\mid i} = 100 \\frac{n_{ij}}{n_{i\\cdot}}",
      "terminos": [
        ["n_j", "the number of observations in category j"],
        ["n", "the total number of non-missing observations"],
        ["p_j", "the percentage of category j"],
        ["P_j", "the cumulative percentage up to category j, in the order of the levels"],
        ["n_{ij}", "the observations in row i and column j of the cross-tabulation"],
        ["p_{j \\mid i}", "the percentage of column j within row i; n_{i·} is the row total"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "One row per observation", "como": "SigmaPro counts rows; this table does not take a weight column. Check in Data that each row is one unit (leaf, plant, seed).", "verificar": null, "siFalla": "If your data are already counted (one row per combination with its count), use the contingency table, which accepts a frequency column.", "alternativa": "tabla-contingencia" },
      { "nombre": "Mutually exclusive categories, always written the same way", "como": "Check the levels of each factor in Data: two spellings of the same category (for example, “Healthy” and “healthy”) count as different categories.", "verificar": null, "siFalla": "Make the spelling of the levels consistent in Data before tabulating.", "alternativa": null },
      { "nombre": "Independent observations (for later inference)", "como": "The table does not need it to describe, but any test you run on it does; it depends on the sampling.", "verificar": null, "siFalla": "If the same units were rated twice (before and after, or by two raters), compare them with McNemar or kappa, which respect the pairing.", "alternativa": "mcnemar" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "evaluador_A", "tipo": "factor with k levels", "papel": "variable (rows)" },
        { "nombre": "evaluador_B", "tipo": "factor with k levels", "papel": "cross with (columns, optional)" }
      ],
      "minimo": "There is no minimum. Percentages of categories with few observations are unstable, and a cross-tabulation with many empty cells is hard to read: merge rare categories if it makes sense.",
      "balance": "Missing values do not enter the percentages and the app reports how many were left out; with the option “Count missing values as a category” they appear as “(faltante)”. In the cross-tabulation, the conclusion counts the cells with no observations.",
      "notaFormato": "Long format: one row per observed unit and one column per factor. Numeric columns with few values (rates, classes 0 to 3) can also be tabulated.",
      "errores": [
        "Tabulating a table that is already summarized (one row per category with its count): each row counts as 1.",
        "Reading the percentage of the total when the question asks for the percentage within each treatment (by row).",
        "Writing the same category in two ways (capital letters, accents), which are counted separately.",
        "Interpreting cumulative percentages of categories with no natural order, such as varieties."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: how many categories and observations there are and, in a one-way table, which category is the most frequent.",
        "In a one-way table, check the frequency and percentage of each category; use the cumulative values only if the categories are ordered.",
        "In the cross-tabulation, start with the frequency view to see how many data support each percentage and how many cells are empty.",
        "Switch to “% by row” or “% by column” depending on which factor explains and which is the outcome.",
        "If you need a test of association or agreement, take the same factors to the contingency table or to kappa in the Analysis block."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Of 80 leaves, the first technician rated 40% as healthy, 29% with slight damage, 16% moderate and 15% severe; the two technicians assigned the same class to 82% of the leaves, and all disagreements were between neighboring classes.”",
      "guias": ["n"]
    },
    "limitaciones": [
      "It does not run tests: for the association between two factors use the contingency table (chi-square, Fisher, Cramér's V).",
      "For agreement between two raters of the same units use kappa; for a before-and-after change in the same units, McNemar.",
      "It crosses only two factors; to account for a third one (lot, location), filter in Data or use Cochran-Mantel-Haenszel.",
      "It does not take a weight column: with data that are already counted, use the contingency table with its frequency column."
    ],
    "referencias": [
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall.",
      "Sokal, R. R., & Rohlf, F. J. (2012). Biometry: The principles and practice of statistics in biological research (4th ed.). W. H. Freeman."
    ]
  }
});
