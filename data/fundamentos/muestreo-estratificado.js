SP_FICHA({
  "id": "muestreo-estratificado",
  "familia": "potencia",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": ["muestreo"],
  "relacionados": ["muestreo-simple", "tamano-muestra", "descriptivos", "dca"],
  "ejemplo": { "conjunto": "aguacate-huertas", "entradas": { "respuesta": "rendimiento_kg", "estrato": "huerta" }, "opciones": { "poblaciones": "Ladera=420; Planicie=900; Vega=260", "nTotal": 60 } },
  "formato": {
    "largo": [["huerta", "arbol", "rendimiento_kg", "con_trips"], ["Ladera", "1", "45.8", "0"], ["Ladera", "2", "42.6", "0"], ["Ladera", "3", "41.2", "0"], ["Ladera", "4", "53.8", "0"], ["Ladera", "5", "55.5", "0"], ["Ladera", "6", "52.8", "0"], ["Ladera", "7", "51.9", "0"], ["Ladera", "8", "43.4", "1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Muestreo aleatorio estratificado", "Media y total por estratos", "Asignación de Neyman"],
    "paraQue": "Estima la media y el total de una población dividida en estratos (huertas, lotes, regiones, tipos de suelo), pesando cada estrato por su tamaño, y propone cómo repartir una muestra nueva entre ellos.",
    "preguntas": [
      "¿Cuál es la producción media por árbol y la cosecha total de tres huertas de distinto tamaño si muestreé árboles al azar en cada una?",
      "¿Cuántos árboles conviene muestrear en cada huerta el próximo año para estimar la cosecha con el menor error?",
      "¿Qué contenido medio de materia orgánica tienen los suelos de una región muestreada por separado en lomeríos, valles y laderas?"
    ],
    "teoria": [
      "Cuando la población se divide en partes que difieren entre sí (huertas con distinto manejo, lotes, tipos de suelo), conviene muestrear al azar dentro de cada parte, o estrato, por separado. La media estratificada combina las medias de los estratos pesándolas por su tamaño en la población, W_h = N_h/N, de modo que un estrato grande cuenta más aunque se hayan muestreado pocas unidades en él. Como la variación entre estratos ya no entra en el error, la estimación suele ser bastante más precisa que la de un muestreo simple del mismo tamaño.",
      "SigmaPro informa, para cada estrato, su tamaño N_h (que escribes en el formulario), las unidades muestreadas n_h, el peso W_h, la media, la desviación estándar y su aporte a la varianza, W_h²(1 − f_h)s_h²/n_h, con la corrección por población finita de cada estrato. La varianza de la media estratificada es la suma de esos aportes. El intervalo de confianza usa la t con los grados de libertad efectivos de Satterthwaite, que combinan los de los estratos según su aporte. También estima el total, N·ȳ_st, con su error estándar, y la gráfica muestra la media de cada estrato con su intervalo junto a la media estratificada.",
      "Si escribes un tamaño total para una muestra nueva, la app propone cómo repartirla: en proporción al tamaño de cada estrato o con la asignación de Neyman, que pone más unidades en los estratos grandes y en los más variables y da la menor varianza para ese total. Neyman usa las desviaciones de esta muestra, y los valores se redondean hacia arriba."
    ],
    "modelo": {
      "tex": "\\bar{y}_{st} = \\sum_{h=1}^{H} W_h \\bar{y}_h, \\quad W_h = \\frac{N_h}{N}, \\quad V(\\bar{y}_{st}) = \\sum_{h=1}^{H} W_h^{2} (1 - f_h) \\frac{s_h^{2}}{n_h}, \\quad n_h = n \\frac{N_h s_h}{\\sum N_h s_h}",
      "terminos": [
        ["\\bar{y}_h, s_h", "la media y la desviación estándar de la muestra del estrato h"],
        ["N_h, n_h", "las unidades del estrato en la población y en la muestra; N es la suma de las N_h"],
        ["W_h", "el peso del estrato en la población"],
        ["f_h", "la fracción de muestreo del estrato, n_h/N_h"],
        ["V(\\bar{y}_{st})", "la varianza de la media estratificada; su raíz es el error estándar"],
        ["n", "el tamaño total de una muestra nueva; la última fórmula es su reparto de Neyman (el proporcional es n·N_h/N)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Muestra al azar dentro de cada estrato", "como": "Depende de cómo se tomaron las unidades; no se revisa con los datos.", "verificar": null, "siFalla": "Si dentro de un estrato se eligieron las unidades por conveniencia, su media puede estar sesgada y la ponderación no lo corrige.", "alternativa": null },
      { "nombre": "Tamaños de los estratos conocidos", "como": "Escribes N_h de cada estrato en el formulario; el análisis no corre si falta alguno o si un N_h es menor que su muestra.", "verificar": null, "siFalla": "Si solo conoces los tamaños de manera aproximada, usa tu mejor estimación (superficie o número de plantas) y considera que el total hereda ese error.", "alternativa": null },
      { "nombre": "Al menos dos unidades por estrato", "como": "Cada estrato necesita dos observaciones o más para estimar su varianza; la app lo exige.", "verificar": null, "siFalla": "Junta estratos parecidos que tengan una sola unidad, o muestrea más.", "alternativa": null },
      { "nombre": "Media de cada estrato aproximadamente normal", "como": "El intervalo usa la t con los grados de libertad de Satterthwaite; revisa la distribución de cada estrato en «Estadísticos descriptivos».", "verificar": "descriptivos", "siFalla": "Con estratos chicos y muy asimétricos, interpreta el intervalo con cautela o aumenta la muestra.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "numérica continua", "papel": "variable medida en la muestra" },
        { "nombre": "huerta", "tipo": "factor con H niveles (aquí, 3)", "papel": "estrato" }
      ],
      "minimo": "Al menos 2 unidades por estrato (mejor 5 o más) y el tamaño de la población de cada estrato (N_h).",
      "balance": "Los estratos pueden tener muestras de distinto tamaño: cada uno pesa por su N_h, no por su n_h. Las filas con la variable vacía se excluyen (en el ejemplo, una de la Ladera y una de la Vega).",
      "notaFormato": "Formato largo: una fila por unidad muestreada, con una columna para el estrato y otra para la variable (el ejemplo empieza con los árboles de la Ladera; siguen los de la Planicie y la Vega). Los tamaños de la población se escriben en el formulario, uno por estrato (en el ejemplo, Ladera 420, Planicie 900 y Vega 260); el tamaño de una muestra nueva para repartir es opcional.",
      "errores": [
        "Escribir como N_h las unidades muestreadas en lugar de todas las que hay en el estrato.",
        "Usar la media simple de toda la muestra cuando los estratos se muestrearon en proporciones distintas a su tamaño: se sesga hacia los estratos sobremuestreados.",
        "Definir los estratos después de ver los datos: deben fijarse antes de muestrear.",
        "Dejar estratos con una sola unidad muestreada."
      ]
    },
    "interpretacion": {
      "orden": [
        "En el cuadro de estratos revisa N_h, n_h, el peso W_h, la media, la DE y el aporte a la varianza de cada uno: el estrato que más aporta es el que más conviene reforzar.",
        "En la estimación estratificada lee la media, su error estándar, los grados de libertad efectivos, el intervalo y el total.",
        "En la gráfica compara la media de cada estrato con la línea de la media estratificada.",
        "Si diste un tamaño total, usa el cuadro de reparto (proporcional y de Neyman) para el próximo muestreo."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con un muestreo estratificado de 36 árboles en tres huertas (1580 árboles en total), la producción media fue de 54.3 kg por árbol (EE = 1.14; IC 95 %: 52.0 a 56.6, con 32.3 grados de libertad efectivos) y la cosecha total estimada, de 85 800 kg (EE = 1800 kg). Para una muestra nueva de 60 árboles, la asignación de Neyman toma 17 en la Ladera, 29 en la Planicie y 16 en la Vega».",
      "guias": ["media", "ee", "ic", "gl", "de"]
    },
    "limitaciones": [
      "Necesita el tamaño de cada estrato; sin ellos, solo cabe el muestreo simple.",
      "La asignación de Neyman usa las desviaciones de esta muestra: con pocas unidades por estrato es una guía aproximada y, al redondear hacia arriba, puede sumar un poco más que el total pedido.",
      "Estima la media de toda la población; para comparar los estratos entre sí, analízalos como grupos (por ejemplo, con un diseño completamente al azar).",
      "Estima medias y totales de una variable numérica; con una columna 0/1 la media es una proporción, pero su intervalo es el de la t."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Neyman, J. (1934). On the two different aspects of the representative method: The method of stratified sampling and the method of purposive selection. Journal of the Royal Statistical Society, 97(4), 558–625.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole."
    ]
  },
  "en": {
    "alias": ["Stratified random sampling", "Mean and total by strata", "Neyman allocation"],
    "paraQue": "Estimates the mean and total of a population divided into strata (orchards, fields, regions, soil types), weighting each stratum by its size, and proposes how to allocate a new sample among them.",
    "preguntas": [
      "What are the mean yield per tree and the total harvest of three orchards of different sizes if I sampled trees at random in each one?",
      "How many trees should be sampled in each orchard next year to estimate the harvest with the smallest error?",
      "What is the mean organic matter content of the soils of a region sampled separately on hills, valleys and slopes?"
    ],
    "teoria": [
      "When the population is divided into parts that differ from one another (orchards under different management, fields, soil types), it is best to sample at random within each part, or stratum, separately. The stratified mean combines the stratum means weighted by their size in the population, W_h = N_h/N, so a large stratum counts more even if few units were sampled in it. Because the variation between strata no longer enters the error, the estimate is usually much more precise than that of a simple sample of the same size.",
      "For each stratum, SigmaPro reports its size N_h (which you enter in the form), the sampled units n_h, the weight W_h, the mean, the standard deviation and its contribution to the variance, W_h²(1 − f_h)s_h²/n_h, with each stratum’s finite population correction. The variance of the stratified mean is the sum of those contributions. The confidence interval uses the t with Satterthwaite’s effective degrees of freedom, which combine those of the strata according to their contribution. It also estimates the total, N·ȳ_st, with its standard error, and the plot shows the mean of each stratum with its interval next to the stratified mean.",
      "If you enter a total size for a new sample, the app proposes how to allocate it: in proportion to the size of each stratum or with Neyman allocation, which puts more units in the large and the more variable strata and gives the smallest variance for that total. Neyman allocation uses the standard deviations of this sample, and the values are rounded up."
    ],
    "modelo": {
      "tex": "\\bar{y}_{st} = \\sum_{h=1}^{H} W_h \\bar{y}_h, \\quad W_h = \\frac{N_h}{N}, \\quad V(\\bar{y}_{st}) = \\sum_{h=1}^{H} W_h^{2} (1 - f_h) \\frac{s_h^{2}}{n_h}, \\quad n_h = n \\frac{N_h s_h}{\\sum N_h s_h}",
      "terminos": [
        ["\\bar{y}_h, s_h", "the sample mean and standard deviation of stratum h"],
        ["N_h, n_h", "the units of the stratum in the population and in the sample; N is the sum of the N_h"],
        ["W_h", "the weight of the stratum in the population"],
        ["f_h", "the sampling fraction of the stratum, n_h/N_h"],
        ["V(\\bar{y}_{st})", "the variance of the stratified mean; its square root is the standard error"],
        ["n", "the total size of a new sample; the last formula is its Neyman allocation (the proportional one is n·N_h/N)"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Random sample within each stratum", "como": "It depends on how the units were taken; it is not checked with the data.", "verificar": null, "siFalla": "If units within a stratum were chosen for convenience, its mean can be biased and weighting does not fix it.", "alternativa": null },
      { "nombre": "Known stratum sizes", "como": "You enter N_h for each stratum in the form; the analysis does not run if one is missing or if an N_h is smaller than its sample.", "verificar": null, "siFalla": "If you only know the sizes approximately, use your best estimate (area or number of plants) and keep in mind that the total inherits that error.", "alternativa": null },
      { "nombre": "At least two units per stratum", "como": "Each stratum needs two or more observations to estimate its variance; the app requires it.", "verificar": null, "siFalla": "Merge similar strata that have a single unit, or sample more.", "alternativa": null },
      { "nombre": "Approximately normal mean in each stratum", "como": "The interval uses t with Satterthwaite’s degrees of freedom; check the distribution of each stratum in “Descriptive statistics”.", "verificar": "descriptivos", "siFalla": "With small, very skewed strata, interpret the interval with caution or increase the sample.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento_kg", "tipo": "continuous numeric", "papel": "variable measured in the sample" },
        { "nombre": "huerta", "tipo": "factor with H levels (here, 3)", "papel": "stratum" }
      ],
      "minimo": "At least 2 units per stratum (better 5 or more) and the population size of each stratum (N_h).",
      "balance": "Strata can have samples of different sizes: each one is weighted by its N_h, not by its n_h. Rows with the variable empty are excluded (in the example, one from Ladera and one from Vega).",
      "notaFormato": "Long format: one row per sampled unit, with a column for the stratum and another for the variable (the example starts with the Ladera trees; those of Planicie and Vega follow). Population sizes are entered in the form, one per stratum (in the example, Ladera 420, Planicie 900 and Vega 260); the size of a new sample to allocate is optional.",
      "errores": [
        "Entering the sampled units as N_h instead of all the units in the stratum.",
        "Using the simple mean of the whole sample when the strata were sampled out of proportion to their size: it is biased toward the oversampled strata.",
        "Defining the strata after seeing the data: they must be set before sampling.",
        "Leaving strata with a single sampled unit."
      ]
    },
    "interpretacion": {
      "orden": [
        "In the strata table, check N_h, n_h, the weight W_h, the mean, the SD and the contribution to the variance of each one: the stratum that contributes most is the one most worth reinforcing.",
        "In the stratified estimate, read the mean, its standard error, the effective degrees of freedom, the interval and the total.",
        "In the plot, compare the mean of each stratum with the line of the stratified mean.",
        "If you gave a total size, use the allocation table (proportional and Neyman) for the next survey."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With a stratified sample of 36 trees in three orchards (1580 trees in all), mean yield was 54.3 kg per tree (SE = 1.14; 95 % CI: 52.0 to 56.6, with 32.3 effective degrees of freedom) and the estimated total harvest was 85,800 kg (SE = 1800 kg). For a new sample of 60 trees, Neyman allocation takes 17 in Ladera, 29 in Planicie and 16 in Vega.”",
      "guias": ["media", "ee", "ic", "gl", "de"]
    },
    "limitaciones": [
      "It needs the size of each stratum; without them, only simple sampling is possible.",
      "Neyman allocation uses the standard deviations of this sample: with few units per stratum it is a rough guide and, since values are rounded up, it may add up to slightly more than the requested total.",
      "It estimates the mean of the whole population; to compare the strata with each other, analyze them as groups (for example, with a completely randomized design).",
      "It estimates means and totals of a numeric variable; with a 0/1 column the mean is a proportion, but its interval is the t interval."
    ],
    "referencias": [
      "Cochran, W. G. (1977). Sampling techniques (3rd ed.). Wiley.",
      "Neyman, J. (1934). On the two different aspects of the representative method: The method of stratified sampling and the method of purposive selection. Journal of the Royal Statistical Society, 97(4), 558–625.",
      "Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114.",
      "Lohr, S. L. (2010). Sampling: Design and analysis (2nd ed.). Brooks/Cole."
    ]
  }
});
