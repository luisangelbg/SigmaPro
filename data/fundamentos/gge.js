SP_FICHA({
  "id": "gge",
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["ammi", "estabilidad", "ensayos-multiambiente", "dos-etapas"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "ambiente": "ambiente", "repeticion": "repeticion" }, "opciones": { "escala": "ninguna", "particion": "simetrica", "objetivo": "maximo" } },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": [["ambiente", "genotipo", "1", "2", "3"], ["E1", "G1", "2.167", "2.50304", "2.42732"], ["E1", "G2", "3.2075", "2.9329", "2.56484"]]
  },
  "es": {
    "alias": ["Biplot GGE", "Genotipo más interacción genotipo × ambiente", "Quién ganó dónde", "Megaambientes"],
    "paraQue": "Resume en un biplot el efecto del genotipo junto con su interacción con el ambiente, para ver quién ganó dónde, qué genotipos son altos y estables y qué ambientes discriminan mejor.",
    "preguntas": [
      "¿Hay megaambientes en la red de ensayos de avena, cada uno con su propio genotipo ganador?",
      "¿Qué híbrido combina mejor un rendimiento alto con estabilidad entre localidades?",
      "¿Qué localidad de prueba distingue mejor a los genotipos y representa a las demás, para conservarla en la red?"
    ],
    "teoria": [
      "Para elegir genotipos no importa el efecto del ambiente, que afecta a todos por igual, sino el efecto del genotipo (G) y su interacción con el ambiente (G × A), juntos. El biplot GGE centra la tabla de medias por ambiente, para quitarle el efecto del ambiente, y la descompone en valores singulares; los dos primeros ejes se dibujan como puntos de genotipos y vectores de ambientes.",
      "En el biplot, el producto de los vectores de un genotipo y de un ambiente aproxima la respuesta de ese genotipo en ese ambiente respecto de la media del ambiente. De ahí salen varias vistas. En quién ganó dónde, el polígono une a los genotipos más alejados y sus rayos dividen a los ambientes en sectores: el vértice de cada sector es el mejor en esos ambientes, y los ambientes con distinto ganador sugieren megaambientes. En media contra estabilidad, la proyección de cada genotipo sobre el eje del ambiente promedio estima su desempeño, y la distancia al eje, su inestabilidad. Las distancias al genotipo ideal y al ambiente ideal ordenan genotipos y localidades de prueba, y la comparación de dos genotipos dice en qué ambientes conviene cada uno.",
      "SigmaPro permite dividir cada ambiente entre su desviación estándar y elegir la partición del valor singular: simétrica, por genotipo (para comparar genotipos) o por ambiente (para comparar ambientes)."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} - \\bar{y}_{\\cdot j} = \\sum_{k=1}^{2} \\lambda_k \\xi_{ik} \\eta_{jk} + \\varepsilon_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "la media del genotipo i en el ambiente j"],
        ["\\bar{y}_{\\cdot j}", "la media del ambiente j (con la opción de escala, la diferencia se divide además entre la desviación estándar del ambiente)"],
        ["\\lambda_k", "el valor singular del eje k"],
        ["\\xi_{ik}", "el puntaje del genotipo i en el eje k"],
        ["\\eta_{jk}", "el puntaje del ambiente j en el eje k"],
        ["\\varepsilon_{ij}", "lo que no explican los dos primeros ejes"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Los dos primeros ejes representan bien G + G × A", "como": "El porcentaje de G + G × A en «Valores singulares» y en la conclusión.", "verificar": null, "siFalla": "Si explican poco, revisa más ejes con el AMMI o confirma con las medias observadas (por ejemplo, en la comparación de dos genotipos).", "alternativa": "ammi" },
      { "nombre": "Errores comparables entre ambientes", "como": "Semáforo «Homogeneidad de los errores»: razón entre el mayor y el menor CME y prueba de Bartlett. El biplot no usa los errores: el semáforo solo avisa si algún ambiente es mucho menos preciso que los demás.", "verificar": null, "siFalla": "Elige la tabla centrada y dividida por la desviación de cada ambiente, para que todos pesen igual.", "alternativa": null },
      { "nombre": "Tabla genotipo × ambiente completa", "como": "Si faltan combinaciones, la app las imputa por EM-AMMI (opción activada por omisión) y lo marca en el semáforo «Celdas imputadas».", "verificar": null, "siFalla": "Con muchas celdas imputadas, el polígono puede reflejar la imputación más que los datos: quita los genotipos o ambientes muy incompletos.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (al menos 3)", "papel": "genotipos" },
        { "nombre": "ambiente", "tipo": "factor con e niveles (al menos 2)", "papel": "ambientes" },
        { "nombre": "repeticion", "tipo": "factor con r niveles (opcional)", "papel": "repeticiones o bloques dentro de cada ambiente" }
      ],
      "minimo": "Al menos 3 genotipos y 2 ambientes; para hablar de megaambientes conviene tener 8 o más ambientes y varios años.",
      "balance": "El biplot se calcula con la tabla de medias; las celdas vacías se imputan por EM-AMMI si la opción está activa. Las repeticiones solo sirven para el semáforo de los errores.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para el ambiente, el genotipo, la repetición y la respuesta (o una media por genotipo y ambiente, sin repetición).",
      "errores": [
        "Declarar megaambientes con un solo año de datos: el patrón debe repetirse en el tiempo.",
        "Comparar distancias entre genotipos con la partición por ambiente: para comparar genotipos usa la partición por genotipo.",
        "Ignorar el porcentaje de G + G × A que explican los dos ejes.",
        "Escribir un mismo genotipo con nombres distintos entre ambientes."
      ]
    },
    "interpretacion": {
      "orden": [
        "Mira el porcentaje de G + G × A que explican los dos primeros ejes.",
        "En «Quién ganó dónde», identifica los vértices del polígono y qué ambientes caen en el sector de cada uno.",
        "En «Media contra estabilidad», ordena los genotipos por su proyección (desempeño) y su distancia al eje (inestabilidad).",
        "Usa las distancias al genotipo ideal y al ambiente ideal para elegir genotipos y localidades de prueba.",
        "Si comparaste dos genotipos, contrasta la diferencia que predice el biplot con la observada en cada ambiente."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los dos primeros ejes del biplot GGE explicaron el 64 % de G + G × A. El polígono formó cuatro sectores, pero uno solo concentró la mayoría de los ambientes, con G8 como ganador; sin datos de otros años no se propusieron megaambientes. G8 tuvo el mejor desempeño medio y fue el más cercano al genotipo ideal; G3, el más estable entre los tres mejores».",
      "guias": ["media", "de", "bartlett"]
    },
    "limitaciones": [
      "Es descriptivo: no tiene pruebas de significancia para los ejes ni para los sectores.",
      "Dos ejes pueden resumir mal la tabla; el biplot es una aproximación, no los datos.",
      "Los ganadores del polígono son predicciones del biplot: confírmalos en la tabla de medias.",
      "Para probar formalmente la interacción y el número de ejes, usa el análisis conjunto y el AMMI."
    ],
    "referencias": [
      "Gabriel, K. R. (1971). The biplot graphic display of matrices with application to principal component analysis. Biometrika, 58(3), 453–467.",
      "Yan, W., Hunt, L. A., Sheng, Q., & Szlavnics, Z. (2000). Cultivar evaluation and mega-environment investigation based on the GGE biplot. Crop Science, 40(3), 597–605.",
      "Yan, W., & Kang, M. S. (2003). GGE biplot analysis: A graphical tool for breeders, geneticists, and agronomists. CRC Press.",
      "Yan, W., & Tinker, N. A. (2006). Biplot analysis of multi-environment trial data: Principles and applications. Canadian Journal of Plant Science, 86(3), 623–645.",
      "Yan, W., Kang, M. S., Ma, B., Woods, S., & Cornelius, P. L. (2007). GGE biplot vs. AMMI analysis of genotype-by-environment data. Crop Science, 47(2), 643–653."
    ]
  },
  "en": {
    "alias": ["GGE biplot", "Genotype plus genotype × environment", "Which-won-where", "Mega-environments"],
    "paraQue": "Summarizes in a biplot the genotype effect together with its interaction with the environment, to see which won where, which genotypes are high-yielding and stable and which environments discriminate best.",
    "preguntas": [
      "Are there mega-environments in the oat trial network, each with its own winning genotype?",
      "Which hybrid best combines high yield with stability across locations?",
      "Which test location best discriminates among genotypes and represents the others, so it should be kept in the network?"
    ],
    "teoria": [
      "To choose genotypes, the environment effect, which affects all of them equally, does not matter; what matters is the genotype effect (G) and its interaction with the environment (G × E), together. The GGE biplot centers the table of means by environment, to remove the environment effect, and decomposes it into singular values; the first two axes are drawn as genotype points and environment vectors.",
      "In the biplot, the product of the vectors of a genotype and an environment approximates that genotype's response in that environment relative to the environment mean. Several views follow from this. In which-won-where, the polygon joins the outermost genotypes and its rays divide the environments into sectors: the vertex of each sector is the best in those environments, and environments with different winners suggest mega-environments. In mean vs. stability, the projection of each genotype onto the average-environment axis estimates its performance, and the distance to the axis, its instability. The distances to the ideal genotype and the ideal environment rank genotypes and test locations, and the comparison of two genotypes tells in which environments each one is preferable.",
      "SigmaPro lets you divide each environment by its standard deviation and choose the singular value partitioning: symmetric, genotype-focused (to compare genotypes) or environment-focused (to compare environments)."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} - \\bar{y}_{\\cdot j} = \\sum_{k=1}^{2} \\lambda_k \\xi_{ik} \\eta_{jk} + \\varepsilon_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "the mean of genotype i in environment j"],
        ["\\bar{y}_{\\cdot j}", "the mean of environment j (with the scaling option, the difference is also divided by the environment's standard deviation)"],
        ["\\lambda_k", "the singular value of axis k"],
        ["\\xi_{ik}", "the score of genotype i on axis k"],
        ["\\eta_{jk}", "the score of environment j on axis k"],
        ["\\varepsilon_{ij}", "what the first two axes do not explain"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "The first two axes represent G + G × E well", "como": "The percentage of G + G × E in “Singular values” and in the conclusion.", "verificar": null, "siFalla": "If they explain little, look at more axes with AMMI or confirm with the observed means (for example, in the comparison of two genotypes).", "alternativa": "ammi" },
      { "nombre": "Comparable errors across environments", "como": "“Homogeneity of errors” in the assumptions checklist: ratio between the largest and smallest MSE and Bartlett's test. The biplot does not use the errors: the checklist only warns if some environment is much less precise than the others.", "verificar": null, "siFalla": "Choose the table centered and divided by the standard deviation of each environment, so that all environments weigh the same.", "alternativa": null },
      { "nombre": "Complete genotype × environment table", "como": "If combinations are missing, the app imputes them by EM-AMMI (option on by default) and flags it under “Imputed cells” in the checklist.", "verificar": null, "siFalla": "With many imputed cells, the polygon may reflect the imputation more than the data: remove the very incomplete genotypes or environments.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (at least 3)", "papel": "genotypes" },
        { "nombre": "ambiente", "tipo": "factor with e levels (at least 2)", "papel": "environments" },
        { "nombre": "repeticion", "tipo": "factor with r levels (optional)", "papel": "replicates or blocks within each environment" }
      ],
      "minimo": "At least 3 genotypes and 2 environments; to speak of mega-environments, 8 or more environments and several years are advisable.",
      "balance": "The biplot is computed from the table of means; empty cells are imputed by EM-AMMI if the option is on. Replicates are used only for the error check in the checklist.",
      "notaFormato": "Long format: one row per plot, with columns for environment, genotype, replicate and response (or one mean per genotype and environment, without replicate).",
      "errores": [
        "Declaring mega-environments from a single year of data: the pattern must repeat over time.",
        "Comparing distances between genotypes with environment-focused partitioning: to compare genotypes use genotype-focused partitioning.",
        "Ignoring the percentage of G + G × E explained by the two axes.",
        "Writing the same genotype with different names across environments."
      ]
    },
    "interpretacion": {
      "orden": [
        "Look at the percentage of G + G × E explained by the first two axes.",
        "In “Which won where”, identify the vertices of the polygon and which environments fall in each one's sector.",
        "In “Mean vs. stability”, rank the genotypes by their projection (performance) and their distance to the axis (instability).",
        "Use the distances to the ideal genotype and the ideal environment to choose genotypes and test locations.",
        "If you compared two genotypes, contrast the difference predicted by the biplot with the one observed in each environment."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The first two axes of the GGE biplot explained 64% of G + G × E. The polygon formed four sectors, but a single one held most environments, with G8 as the winner; without data from other years, no mega-environments were proposed. G8 had the best mean performance and was the closest to the ideal genotype; G3 was the most stable among the top three.”",
      "guias": ["media", "de", "bartlett"]
    },
    "limitaciones": [
      "It is descriptive: it has no significance tests for the axes or the sectors.",
      "Two axes may summarize the table poorly; the biplot is an approximation, not the data.",
      "The polygon winners are predictions of the biplot: confirm them in the table of means.",
      "To formally test the interaction and the number of axes, use the combined analysis and AMMI."
    ],
    "referencias": [
      "Gabriel, K. R. (1971). The biplot graphic display of matrices with application to principal component analysis. Biometrika, 58(3), 453–467.",
      "Yan, W., Hunt, L. A., Sheng, Q., & Szlavnics, Z. (2000). Cultivar evaluation and mega-environment investigation based on the GGE biplot. Crop Science, 40(3), 597–605.",
      "Yan, W., & Kang, M. S. (2003). GGE biplot analysis: A graphical tool for breeders, geneticists, and agronomists. CRC Press.",
      "Yan, W., & Tinker, N. A. (2006). Biplot analysis of multi-environment trial data: Principles and applications. Canadian Journal of Plant Science, 86(3), 623–645.",
      "Yan, W., Kang, M. S., Ma, B., Woods, S., & Cornelius, P. L. (2007). GGE biplot vs. AMMI analysis of genotype-by-environment data. Crop Science, 47(2), 643–653."
    ]
  }
});
