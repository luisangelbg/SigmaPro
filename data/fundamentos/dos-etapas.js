SP_FICHA({
  "id": "dos-etapas",
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["ensayos-multiambiente", "mixto-localidades", "heredabilidad", "estabilidad", "gge"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "ambiente": "ambiente", "repeticion": "repeticion" }, "opciones": { "objetivo": "maximo" } },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": [["ambiente", "genotipo", "1", "2", "3"], ["E1", "G1", "2.167", "2.50304", "2.42732"], ["E1", "G2", "3.2075", "2.9329", "2.56484"]]
  },
  "es": {
    "alias": ["Análisis por etapas", "Análisis ponderado de medias", "Análisis en dos etapas con una varianza por ambiente"],
    "paraQue": "Combina los ensayos de varios ambientes dando a cada media el peso que merece según su precisión; sirve cuando los errores difieren entre ambientes o faltan genotipos.",
    "preguntas": [
      "¿Qué variedades de trigo rinden más en la red de ensayos, si algunas localidades fueron mucho más precisas que otras?",
      "¿Cómo comparar líneas de frijol que no se sembraron en todas las localidades?",
      "¿Cuánta varianza de interacción genotipo × ambiente queda una vez descontado el error de cada ensayo?"
    ],
    "teoria": [
      "El análisis conjunto clásico supone que todos los ambientes tienen el mismo error experimental. En las redes de ensayos eso rara vez ocurre: una localidad bien manejada puede tener un CME varias veces menor que otra afectada por granizo o sequía. El análisis en dos etapas atiende ese problema sin perder sencillez.",
      "En la primera etapa, SigmaPro analiza cada ambiente por separado (y ~ repetición + genotipo, o y ~ genotipo) y obtiene la media ajustada de cada genotipo y su varianza, el cuadrado de su error estándar. En la segunda, ajusta a esas medias un modelo con efectos de genotipo y de ambiente, una interacción G × A aleatoria con varianza σ²_GA y un error cuya varianza queda fija en la de la primera etapa. La σ²_GA se estima por máxima verosimilitud restringida (REML), y los efectos, por mínimos cuadrados generalizados con pesos 1/(σ²_GA + v_ij): las medias más precisas pesan más.",
      "El resultado son las medias ajustadas de los genotipos en el conjunto (un promedio con el mismo peso para cada ambiente) con su error estándar, y una prueba de Wald de que todos los genotipos tienen la misma media. Como cada media pesa lo que vale, los genotipos que faltan en algún ambiente no estorban, siempre que las celdas con datos conecten a todos los genotipos y ambientes."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu + G_i + A_j + u_{ij} + e_{ij}, \\quad u_{ij} \\sim \\mathcal{N}(0, \\sigma_{GA}^2), \\quad \\mathrm{Var}(e_{ij}) = v_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "la media ajustada del genotipo i en el ambiente j (primera etapa)"],
        ["\\mu", "la media general"],
        ["G_i", "el efecto fijo del genotipo i"],
        ["A_j", "el efecto fijo del ambiente j"],
        ["u_{ij}", "la interacción genotipo × ambiente, aleatoria"],
        ["\\sigma_{GA}^2", "la varianza de la interacción, estimada por REML"],
        ["v_{ij}", "la varianza de la media de la primera etapa (su EE al cuadrado), que se toma como conocida"]
      ]
    },
    "hipotesis": [
      { "h0": "G_1 = G_2 = \\cdots = G_g", "h1": "\\text{algún } G_i \\text{ es distinto}", "texto": "Prueba de Wald de los genotipos: F = Wald / (g − 1), con g − 1 grados de libertad en el numerador y celdas menos parámetros en el denominador." }
    ],
    "supuestos": [
      { "nombre": "Cada ambiente tiene su propio error", "como": "La app se detiene si un ambiente no tiene grados de libertad para el error (sin repeticiones ni varias parcelas por genotipo).", "verificar": null, "siFalla": "Sin repeticiones, usa el análisis conjunto con una media por celda.", "alternativa": "ensayos-multiambiente" },
      { "nombre": "Normalidad de los residuos en cada ambiente", "como": "Filtra un ambiente (Filtrar filas… en Datos) y revísalo en «Revisar los supuestos del modelo», con el genotipo como tratamiento y la repetición como bloque.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en ↻ Transformar…) antes de la primera etapa.", "alternativa": null },
      { "nombre": "Interacción G × A aleatoria con una sola varianza", "como": "Lo supone el modelo; la σ²_GA puede estimarse en cero si el error de cada ambiente explica las diferencias.", "verificar": null, "siFalla": "Para varianzas genéticas distintas por ambiente o correlaciones entre ambientes, plantea un modelo lineal mixto con fórmula.", "alternativa": "modelo-mixto" },
      { "nombre": "Genotipos y ambientes conectados", "como": "Si las celdas con datos no unen a todos los genotipos y ambientes, la app se detiene con un aviso.", "verificar": null, "siFalla": "Incluye testigos comunes en todas las localidades.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (al menos 3)", "papel": "genotipos" },
        { "nombre": "ambiente", "tipo": "factor con e niveles (al menos 3)", "papel": "ambientes" },
        { "nombre": "repeticion", "tipo": "factor con r niveles", "papel": "repeticiones o bloques dentro de cada ambiente (opcional si cada genotipo tiene varias parcelas)" }
      ],
      "minimo": "Al menos 3 genotipos y 3 ambientes, y error propio en cada ambiente: 2 o más repeticiones (o parcelas por genotipo).",
      "balance": "No necesita la tabla completa: si un genotipo falta en un ambiente, se usan las medias que hay y la conclusión dice cuántos ambientes quedaron incompletos. La media simple solo aparece para los genotipos presentes en todos los ambientes.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para el ambiente, el genotipo, la repetición y la respuesta. Si tus repeticiones están en columnas, conviértelas con Ancha ⇄ larga… en Datos.",
      "errores": [
        "Dar solo las medias por ambiente, sin las parcelas: la primera etapa necesita el error de cada ambiente.",
        "Escribir el mismo genotipo con nombres distintos entre localidades.",
        "Comparar la media simple de genotipos que no están en todos los ambientes: usa la media ajustada.",
        "Esperar que la ponderación rescate un ensayo malo: un ambiente con datos dudosos debe revisarse o descartarse antes."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo «Errores de los ambientes»: si difieren (razón máx./mín. mayor que 3), esta ponderación es la indicada.",
        "En «Primera etapa: cada ambiente», mira el CME, el CV y cuántos genotipos tuvo cada ensayo.",
        "Lee en las conclusiones la prueba de Wald de los genotipos y la varianza de la interacción (σ²_GA).",
        "Compara las medias ajustadas con su EE en la segunda etapa y en la gráfica con sus intervalos de 95 %."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con un análisis en dos etapas, que ponderó cada media por el inverso de su varianza más la de la interacción (σ²_GA = 0.05, REML), los genotipos difirieron (Wald: F(9, 117) = 6.0, p < 0.001). La mayor media ajustada fue la de G8 (3.02 ± 0.08 t/ha)».",
      "guias": ["F", "p", "media-ajustada", "ee", "componente", "cv"]
    },
    "limitaciones": [
      "La primera etapa supone bloques completos al azar (o un diseño completamente al azar) en cada ambiente.",
      "Toma la varianza de cada media como conocida; con pocas repeticiones esa varianza es imprecisa, y la ponderación también.",
      "No describe cómo es la interacción: para eso usa la estabilidad, el AMMI o el GGE.",
      "Para BLUP de genotipos y heredabilidad en varios ambientes, usa el modelo mixto de varias localidades o la heredabilidad."
    ],
    "referencias": [
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Smith, A., Cullis, B., & Gilmour, A. (2001). The analysis of crop variety evaluation data in Australia. Australian & New Zealand Journal of Statistics, 43(2), 129–145.",
      "Möhring, J., & Piepho, H.-P. (2009). Comparison of weighting in two-stage analysis of plant breeding trials. Crop Science, 49(6), 1977–1988.",
      "Piepho, H.-P., Möhring, J., Schulz-Streeck, T., & Ogutu, J. O. (2012). A stage-wise approach for the analysis of multi-environment trials. Biometrical Journal, 54(6), 844–860."
    ]
  },
  "en": {
    "alias": ["Stage-wise analysis", "Weighted analysis of means", "Two-stage analysis with one variance per environment"],
    "paraQue": "Combines trials from several environments giving each mean the weight it deserves according to its precision; useful when errors differ among environments or genotypes are missing.",
    "preguntas": [
      "Which wheat varieties yield most across the trial network, if some locations were much more precise than others?",
      "How can bean lines that were not sown at every location be compared?",
      "How much genotype × environment interaction variance remains once each trial's error is accounted for?"
    ],
    "teoria": [
      "The classical combined analysis assumes that every environment has the same experimental error. In trial networks this rarely happens: a well-managed location may have an MSE several times smaller than another hit by hail or drought. The two-stage analysis deals with that problem without losing simplicity.",
      "In the first stage, SigmaPro analyzes each environment separately (y ~ replicate + genotype, or y ~ genotype) and obtains the adjusted mean of each genotype and its variance, the square of its standard error. In the second stage, it fits to those means a model with genotype and environment effects, a random G × E interaction with variance σ²_GE and an error whose variance is fixed at the first-stage value. σ²_GE is estimated by restricted maximum likelihood (REML), and the effects by generalized least squares with weights 1/(σ²_GE + v_ij): the more precise means weigh more.",
      "The result is the adjusted genotype means across environments (an average giving each environment the same weight) with their standard errors, and a Wald test that all genotypes have the same mean. Since each mean weighs what it is worth, genotypes missing from some environment are no obstacle, as long as the cells with data connect all genotypes and environments."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu + G_i + E_j + u_{ij} + e_{ij}, \\quad u_{ij} \\sim \\mathcal{N}(0, \\sigma_{GE}^2), \\quad \\mathrm{Var}(e_{ij}) = v_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "the adjusted mean of genotype i in environment j (first stage)"],
        ["\\mu", "the overall mean"],
        ["G_i", "the fixed effect of genotype i"],
        ["E_j", "the fixed effect of environment j"],
        ["u_{ij}", "the genotype × environment interaction, random"],
        ["\\sigma_{GE}^2", "the interaction variance, estimated by REML"],
        ["v_{ij}", "the variance of the first-stage mean (its squared SE), taken as known"]
      ]
    },
    "hipotesis": [
      { "h0": "G_1 = G_2 = \\cdots = G_g", "h1": "\\text{some } G_i \\text{ differs}", "texto": "Wald test of genotypes: F = Wald / (g − 1), with g − 1 numerator degrees of freedom and cells minus parameters in the denominator." }
    ],
    "supuestos": [
      { "nombre": "Each environment has its own error", "como": "The app stops if an environment has no degrees of freedom for error (no replicates and no multiple plots per genotype).", "verificar": null, "siFalla": "Without replicates, use the combined analysis with one mean per cell.", "alternativa": "ensayos-multiambiente" },
      { "nombre": "Normality of residuals in each environment", "como": "Filter one environment (Filter rows… in Data) and check it in “Check the model assumptions”, with genotype as treatment and replicate as block.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in ↻ Transform…) before the first stage.", "alternativa": null },
      { "nombre": "Random G × E interaction with a single variance", "como": "The model assumes it; σ²_GE may be estimated as zero if each environment's error explains the differences.", "verificar": null, "siFalla": "For different genetic variances per environment or correlations among environments, set up a linear mixed model with a formula.", "alternativa": "modelo-mixto" },
      { "nombre": "Connected genotypes and environments", "como": "If the cells with data do not link all genotypes and environments, the app stops with a warning.", "verificar": null, "siFalla": "Include common checks at every location.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (at least 3)", "papel": "genotypes" },
        { "nombre": "ambiente", "tipo": "factor with e levels (at least 3)", "papel": "environments" },
        { "nombre": "repeticion", "tipo": "factor with r levels", "papel": "replicates or blocks within each environment (optional if each genotype has several plots)" }
      ],
      "minimo": "At least 3 genotypes and 3 environments, and an error of its own in each environment: 2 or more replicates (or plots per genotype).",
      "balance": "It does not need a complete table: if a genotype is missing from an environment, the available means are used and the conclusion states how many environments were incomplete. The simple mean is shown only for genotypes present in every environment.",
      "notaFormato": "Long format: one row per plot, with columns for environment, genotype, replicate and response. If your replicates are in columns, convert them with Wide ⇄ long… in Data.",
      "errores": [
        "Giving only the means per environment, without the plots: the first stage needs each environment's error.",
        "Writing the same genotype with different names across locations.",
        "Comparing the simple means of genotypes that are not in every environment: use the adjusted mean.",
        "Expecting the weighting to rescue a poor trial: an environment with doubtful data should be reviewed or discarded beforehand."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check “Environment errors” in the assumptions checklist: if they differ (max./min. ratio above 3), this weighting is the right choice.",
        "In “First stage: each environment”, look at the MSE, the CV and how many genotypes each trial had.",
        "Read in the conclusions the Wald test of genotypes and the interaction variance (σ²_GE).",
        "Compare the adjusted means with their SE in the second stage and in the plot with their 95% intervals."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With a two-stage analysis, which weighted each mean by the inverse of its variance plus the interaction variance (σ²_GE = 0.05, REML), genotypes differed (Wald: F(9, 117) = 6.0, p < 0.001). The highest adjusted mean was that of G8 (3.02 ± 0.08 t/ha).”",
      "guias": ["F", "p", "media-ajustada", "ee", "componente", "cv"]
    },
    "limitaciones": [
      "The first stage assumes randomized complete blocks (or a completely randomized design) in each environment.",
      "It takes the variance of each mean as known; with few replicates that variance is imprecise, and so is the weighting.",
      "It does not describe what the interaction looks like: for that use stability, AMMI or GGE.",
      "For genotype BLUPs and heritability across environments, use the mixed model for several locations or heritability."
    ],
    "referencias": [
      "Patterson, H. D., & Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.",
      "Smith, A., Cullis, B., & Gilmour, A. (2001). The analysis of crop variety evaluation data in Australia. Australian & New Zealand Journal of Statistics, 43(2), 129–145.",
      "Möhring, J., & Piepho, H.-P. (2009). Comparison of weighting in two-stage analysis of plant breeding trials. Crop Science, 49(6), 1977–1988.",
      "Piepho, H.-P., Möhring, J., Schulz-Streeck, T., & Ogutu, J. O. (2012). A stage-wise approach for the analysis of multi-environment trials. Biometrical Journal, 54(6), 844–860."
    ]
  }
});
