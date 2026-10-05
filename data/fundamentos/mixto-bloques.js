SP_FICHA({
  "id": "mixto-bloques",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": ["dbca"],
  "relacionados": ["dbca", "modelo-mixto", "glmm-bloques", "mixto-latice", "componentes-varianza", "friedman"],
  "ejemplo": { "conjunto": "maiz", "entradas": { "respuesta": "rend", "tratamientos": ["hibrido", "dosis"], "bloque": "bloque" }, "opciones": {} },
  "formato": {
    "largo": [["bloque", "hibrido", "dosis", "rend"], ["1", "H-40", "0", "4.61"], ["1", "H-40", "60", "5.71"], ["1", "H-40", "120", "6.41"], ["1", "H-40", "180", "6.56"], ["1", "H-52", "0", "4.8"], ["1", "H-52", "60", "6.34"], ["1", "H-52", "120", "6.99"]],
    "ancho": null
  },
  "es": {
    "alias": ["Bloques completos al azar con bloques aleatorios", "DBCA mixto", "RCBD con bloques aleatorios"],
    "paraQue": "Analiza un experimento en bloques completos al azar con los bloques como efecto aleatorio, lo que aprovecha la información entre bloques cuando se pierden parcelas.",
    "preguntas": [
      "¿Difieren cinco variedades de frijol sembradas en bloques, si los bloques representan la variación de todo el terreno donde se cultivará?",
      "¿Responde igual el rendimiento de tres híbridos de maíz a cuatro dosis de nitrógeno cuando se perdieron algunas parcelas?",
      "¿Cuánta de la variación del rendimiento se debe a las diferencias entre bloques y cuánta al error experimental?"
    ],
    "teoria": [
      "El diseño es el de bloques completos al azar: cada bloque contiene todos los tratamientos, sorteados dentro de él. Cambia el análisis: aquí los bloques se consideran una muestra de las condiciones posibles del terreno, con efectos que siguen una distribución normal con varianza σ²b, mientras que los tratamientos (uno a tres factores cruzados) siguen siendo fijos.",
      "Con datos completos y balanceados, las pruebas F de los tratamientos coinciden con las del análisis clásico con bloques fijos. La ventaja aparece cuando faltan parcelas: como los bloques son aleatorios, el modelo recupera la información que hay entre bloques, y las medias marginales de los tratamientos y sus errores estándar la incorporan sin tener que estimar los datos perdidos. Además, el modelo estima directamente cuánta variación aportan los bloques, y sus medias se pueden generalizar a otros bloques del mismo terreno.",
      "SigmaPro arma la fórmula tratamientos + (1 | bloque) —con los factores cruzados, por ejemplo hibrido * dosis— y la ajusta por REML en el motor R de tu navegador con lme4 y lmerTest; las columnas numéricas que elijas como tratamiento (dosis) se toman como factor. Da el cuadro de efectos fijos con F tipo III y grados de libertad de Satterthwaite o de Kenward-Roger, la varianza de bloques y la residual con su porcentaje, la prueba de razón de verosimilitudes del efecto de bloques, las medias marginales de cada factor con letras (Tukey, Bonferroni, Holm, Šidák o sin ajuste) y los BLUP de los bloques. Para comparar un factor dentro de cada nivel de otro, usa la opción «Dentro de cada nivel de» del mismo formulario."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + b_j + \\varepsilon_{ij}, \\quad b_j \\sim \\mathcal{N}(0, \\sigma^2_b), \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "la respuesta del tratamiento i en el bloque j"],
        ["\\mu", "la media general"],
        ["\\tau_i", "el efecto fijo del tratamiento i (con varios factores: efectos principales e interacciones)"],
        ["b_j", "el efecto aleatorio del bloque j, con varianza entre bloques \\sigma^2_b"],
        ["\\varepsilon_{ij}", "el error experimental, independiente de los bloques, con varianza \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los tratamientos tienen la misma media. Prueba F con los grados de libertad de Satterthwaite o de Kenward-Roger; con factores cruzados, una prueba por efecto principal y por interacción." },
      { "h0": "\\sigma^2_b = 0", "h1": "\\sigma^2_b > 0", "texto": "Los bloques no difieren entre sí. Razón de verosimilitudes contra el modelo sin bloques; el p que se muestra es conservador (el verdadero suele ser la mitad)." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis muestra la prueba de Shapiro-Wilk de los residuos.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar: logaritmo o Box-Cox) y vuelve a ajustar, o usa la prueba de Friedman, que compara por rangos dentro de los bloques.", "alternativa": "friedman" },
      { "nombre": "Varianzas iguales entre tratamientos", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos entre los niveles del primer factor de tratamiento.", "verificar": null, "siFalla": "Si la varianza crece con la media (conteos, proporciones), usa el modelo generalizado mixto en bloques aleatorios.", "alternativa": "glmm-bloques" },
      { "nombre": "Normalidad de los efectos de bloque", "como": "Con 5 bloques o más, el semáforo aplica Shapiro-Wilk a los BLUP de los bloques.", "verificar": null, "siFalla": "Revisa si algún bloque es muy distinto de los demás (una orilla, un encharcamiento) y sus datos.", "alternativa": null },
      { "nombre": "Ajuste estable (no singular)", "como": "El semáforo marca en ámbar el ajuste singular: la varianza de bloques quedó en cero.", "verificar": null, "siFalla": "Si la varianza de bloques es cero, el modelo junta los bloques con el error; el análisis clásico en bloques, con los bloques fijos, es la referencia más sencilla y suele llevar a conclusiones parecidas.", "alternativa": "dbca" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "hibrido, dosis", "tipo": "factor con k niveles (1 a 3 factores; las numéricas se toman como factor)", "papel": "tratamientos (fijos)" },
        { "nombre": "bloque", "tipo": "factor con r niveles", "papel": "bloques (aleatorios)" }
      ],
      "minimo": "Al menos 4 o 5 bloques para estimar la varianza de bloques con algo de precisión; con 2 o 3 bloques el ajuste puede quedar singular. Cada bloque debe tener todos los tratamientos.",
      "balance": "Las parcelas perdidas no obligan a estimar datos ni a cambiar de análisis: REML usa las filas completas, recupera la información entre bloques y las medias marginales se ajustan. El cuadro de ajuste dice cuántas filas quedaron fuera.",
      "notaFormato": "Formato largo: una fila por parcela, con una columna para el bloque, una por factor de tratamiento y una para la respuesta.",
      "errores": [
        "Capturar el promedio de cada tratamiento en lugar de una fila por parcela: sin repeticiones no hay error experimental.",
        "Contar como repeticiones las plantas o los frutos de una misma parcela (pseudorreplicación): promédialos por parcela o anídalos en la fórmula del modelo mixto.",
        "Esperar mucho de los bloques aleatorios con solo 2 o 3 bloques: su varianza se estima muy mal y, si sale en cero, el resultado es el del análisis clásico.",
        "Analizar porcentajes o conteos sin transformar cuando su varianza depende de la media."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y los avisos: si el ajuste es singular, la varianza de bloques es cero.",
        "En el cuadro de efectos fijos, lee primero la interacción; si es significativa, las medias marginales de cada factor promedian sobre el otro: compara un factor dentro de cada nivel del otro con la opción «Dentro de cada nivel de».",
        "Mira la varianza de bloques, su porcentaje de la variación aleatoria y su prueba de razón de verosimilitudes.",
        "Compara las medias marginales con sus letras y sus intervalos de confianza.",
        "Consulta los BLUP de los bloques para ver qué bloques fueron mejores o peores que el promedio."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «El rendimiento difirió entre dosis de nitrógeno (F(3, 33) = 40.8, p < 0.001; grados de libertad de Satterthwaite), sin interacción con el híbrido (F(6, 33) = 1.2, p = 0.33). Los bloques aportaron el 15 % de la variación aleatoria (σ²b = 0.05 frente a σ² = 0.28). La dosis de 120 kg/ha tuvo la media más alta (6.7 t/ha), sin diferir de la de 180 (Tukey, α = 0.05)».",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "blup"]
    },
    "limitaciones": [
      "No da el coeficiente de variación ni la eficiencia relativa del bloqueo: para eso usa el análisis clásico en bloques completos.",
      "Con pocos bloques la varianza de bloques es muy imprecisa y el ajuste puede quedar singular.",
      "Para conteos o proporciones usa el modelo generalizado mixto en bloques aleatorios.",
      "Si hay muchos tratamientos y los bloques dejan de ser homogéneos, usa bloques incompletos (látice con recuperación entre bloques)."
    ],
    "referencias": [
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Randomized complete blocks with random blocks", "Mixed-model RCBD", "RCBD with random blocks"],
    "paraQue": "Analyzes a randomized complete block experiment with blocks as a random effect, which uses the information between blocks when plots are lost.",
    "preguntas": [
      "Do five bean varieties sown in blocks differ, if the blocks represent the variation of the whole field where they will be grown?",
      "Does the yield of three maize hybrids respond alike to four nitrogen rates when some plots were lost?",
      "How much of the yield variation is due to differences among blocks and how much to experimental error?"
    ],
    "teoria": [
      "The design is the randomized complete block design: each block contains every treatment, randomized within it. What changes is the analysis: here blocks are considered a sample of the possible field conditions, with effects that follow a normal distribution with variance σ²b, while the treatments (one to three crossed factors) remain fixed.",
      "With complete, balanced data the F tests for treatments match those of the classical analysis with fixed blocks. The advantage appears when plots are missing: because blocks are random, the model recovers the information between blocks, and the marginal means of the treatments and their standard errors include it without having to estimate the lost data. The model also estimates directly how much variation the blocks contribute, and its means can be generalized to other blocks of the same field.",
      "SigmaPro builds the formula treatments + (1 | bloque), with crossed factors such as hibrido * dosis, and fits it by REML in the R engine inside your browser with lme4 and lmerTest; numeric columns you choose as treatments (rates) are taken as factors. It gives the fixed-effects table with type III F tests and Satterthwaite or Kenward-Roger degrees of freedom, the block and residual variances with their percentage, the likelihood ratio test of the block effect, the marginal means of each factor with letters (Tukey, Bonferroni, Holm, Šidák or unadjusted) and the BLUPs of the blocks. To compare one factor within each level of another, use the “Within each level of” option in the same form."
    ],
    "modelo": {
      "tex": "y_{ij} = \\mu + \\tau_i + b_j + \\varepsilon_{ij}, \\quad b_j \\sim \\mathcal{N}(0, \\sigma^2_b), \\quad \\varepsilon_{ij} \\sim \\mathcal{N}(0, \\sigma^2)",
      "terminos": [
        ["y_{ij}", "the response of treatment i in block j"],
        ["\\mu", "the overall mean"],
        ["\\tau_i", "the fixed effect of treatment i (with several factors: main effects and interactions)"],
        ["b_j", "the random effect of block j, with between-block variance \\sigma^2_b"],
        ["\\varepsilon_{ij}", "the experimental error, independent of the blocks, with variance \\sigma^2"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_t = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The treatments have the same mean. F test with Satterthwaite or Kenward-Roger degrees of freedom; with crossed factors, one test per main effect and per interaction." },
      { "h0": "\\sigma^2_b = 0", "h1": "\\sigma^2_b > 0", "texto": "The blocks do not differ. Likelihood ratio against the model without blocks; the p shown is conservative (the true one is usually half)." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist shows the Shapiro-Wilk test of the residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform: logarithm or Box-Cox) and refit, or use the Friedman test, which compares ranks within blocks.", "alternativa": "friedman" },
      { "nombre": "Equal variances among treatments", "como": "The assumptions checklist applies Levene’s test (with the median) to the residuals across the levels of the first treatment factor.", "verificar": null, "siFalla": "If the variance grows with the mean (counts, proportions), use the generalized linear mixed model in random blocks.", "alternativa": "glmm-bloques" },
      { "nombre": "Normality of block effects", "como": "With 5 blocks or more, the assumptions checklist applies Shapiro-Wilk to the block BLUPs.", "verificar": null, "siFalla": "Check whether one block is very different from the rest (an edge, a waterlogged spot) and its data.", "alternativa": null },
      { "nombre": "Stable (nonsingular) fit", "como": "The assumptions checklist flags a singular fit in amber: the block variance ended up at zero.", "verificar": null, "siFalla": "If the block variance is zero, the model pools the blocks with the error; the classical block analysis, with fixed blocks, is the simplest reference and usually leads to similar conclusions.", "alternativa": "dbca" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rend", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "hibrido, dosis", "tipo": "factor with k levels (1 to 3 factors; numeric columns are taken as factors)", "papel": "treatments (fixed)" },
        { "nombre": "bloque", "tipo": "factor with r levels", "papel": "blocks (random)" }
      ],
      "minimo": "At least 4 or 5 blocks to estimate the block variance with some precision; with 2 or 3 blocks the fit may be singular. Each block must contain every treatment.",
      "balance": "Lost plots do not force you to estimate data or change the analysis: REML uses the complete rows, recovers the information between blocks and the marginal means adjust. The model fit table says how many rows were left out.",
      "notaFormato": "Long format: one row per plot, with a column for the block, one per treatment factor and one for the response.",
      "errores": [
        "Entering the mean of each treatment instead of one row per plot: without replicates there is no experimental error.",
        "Counting plants or fruits of the same plot as replicates (pseudoreplication): average them per plot or nest them in the mixed-model formula.",
        "Expecting much from random blocks with only 2 or 3 blocks: their variance is poorly estimated and, if it comes out at zero, the result is that of the classical analysis.",
        "Analyzing untransformed percentages or counts when their variance depends on the mean."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and the warnings: if the fit is singular, the block variance is zero.",
        "In the fixed-effects table, read the interaction first; if it is significant, the marginal means of each factor average over the other: compare one factor within each level of the other with the “Within each level of” option.",
        "Look at the block variance, its percentage of the random variation and its likelihood ratio test.",
        "Compare the marginal means with their letters and confidence intervals.",
        "See the block BLUPs to know which blocks were better or worse than average."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Yield differed among nitrogen rates (F(3, 33) = 40.8, p < 0.001; Satterthwaite degrees of freedom), with no interaction with hybrid (F(6, 33) = 1.2, p = 0.33). Blocks contributed 15% of the random variation (σ²b = 0.05 versus σ² = 0.28). The 120 kg/ha rate had the highest mean (6.7 t/ha), not different from 180 (Tukey, α = 0.05).”",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "blup"]
    },
    "limitaciones": [
      "It does not give the coefficient of variation or the relative efficiency of blocking: for that use the classical randomized complete block analysis.",
      "With few blocks the block variance is very imprecise and the fit may be singular.",
      "For counts or proportions use the generalized linear mixed model in random blocks.",
      "If there are many treatments and blocks stop being homogeneous, use incomplete blocks (lattice with inter-block recovery)."
    ],
    "referencias": [
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.",
      "Searle, S. R., Casella, G., & McCulloch, C. E. (1992). Variance components. Wiley.",
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley."
    ]
  }
});
