SP_FICHA({
  "id": "ammi",
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["gge", "estabilidad", "ensayos-multiambiente", "dos-etapas"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "ambiente": "ambiente", "repeticion": "repeticion" }, "opciones": { "objetivo": "maximo" } },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": [["ambiente", "genotipo", "1", "2", "3"], ["E1", "G1", "2.167", "2.50304", "2.42732"], ["E1", "G2", "3.2075", "2.9329", "2.56484"]]
  },
  "es": {
    "alias": ["Modelo AMMI", "Efectos principales aditivos e interacción multiplicativa", "Biplot AMMI", "WAAS"],
    "paraQue": "Separa la interacción genotipo × ambiente en unos pocos ejes, para ver qué genotipos y ambientes interactúan y cuáles genotipos son estables.",
    "preguntas": [
      "¿Cuántos patrones de interacción hay en un ensayo de avena en 14 ambientes, y qué ambientes los provocan?",
      "¿Qué genotipos son estables (puntajes cercanos a cero) sin sacrificar rendimiento?",
      "¿Qué línea de trigo se adapta específicamente a las localidades de temporal?"
    ],
    "teoria": [
      "El modelo AMMI combina dos herramientas: el análisis de varianza para los efectos principales de genotipos y ambientes, que son aditivos, y la descomposición en valores singulares para la interacción, que se escribe como una suma de productos (multiplicativa). Cada eje k tiene un valor singular λ_k y un puntaje para cada genotipo y para cada ambiente; el producto de los puntajes de un genotipo y de un ambiente, multiplicado por λ_k, es la parte de su interacción que explica ese eje.",
      "SigmaPro toma la interacción de la tabla de medias, la descompone y prueba cada eje con la F de Gollob (con g + e − 1 − 2k grados de libertad) y con la F_R de Cornelius, que prueba si la interacción que queda después de n ejes sigue siendo significativa; esta última es más confiable para decidir cuántos ejes retener. Los puntajes son simétricos: el vector singular multiplicado por la raíz del valor singular.",
      "Un genotipo con puntajes cercanos a cero en los ejes importantes es estable; un genotipo y un ambiente en la misma dirección interactúan a favor. El ASV de Purchase combina los dos primeros ejes ponderados por lo que explican, y el WAAS promedia los puntajes absolutos de los ejes significativos, ponderados por su porcentaje de la interacción; el WAASY combina el WAAS con la respuesta, con el peso que elijas. Los biplots AMMI1 (media contra EJE1) y AMMI2 (EJE1 contra EJE2) lo resumen en una figura."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu + G_i + A_j + \\sum_{k=1}^{n} \\lambda_k \\gamma_{ik} \\delta_{jk} + \\rho_{ij} + \\varepsilon_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "la media del genotipo i en el ambiente j"],
        ["\\mu, G_i, A_j", "la media general y los efectos aditivos del genotipo y del ambiente"],
        ["\\lambda_k", "el valor singular del eje k; r·λ_k² es su suma de cuadrados"],
        ["\\gamma_{ik}, \\delta_{jk}", "los puntajes del genotipo i y del ambiente j en el eje k"],
        ["\\rho_{ij}", "la interacción que no explican los n ejes retenidos (residuo AMMI)"],
        ["\\varepsilon_{ij}", "el error de la media"]
      ]
    },
    "hipotesis": [
      { "h0": "\\lambda_k^2 = 0", "h1": "\\lambda_k^2 > 0", "texto": "El eje k no explica interacción: F de Gollob = CM del eje / CME combinado." },
      { "h0": "\\sum_{k>n} \\lambda_k^2 = 0", "h1": "\\text{queda interacción después de } n \\text{ ejes}", "texto": "F_R de Cornelius: el número de ejes es el primer n cuyo residuo deja de ser significativo." }
    ],
    "supuestos": [
      { "nombre": "Errores homogéneos entre ambientes", "como": "Semáforo «Homogeneidad de los errores»: razón entre el mayor y el menor CME y prueba de Bartlett.", "verificar": null, "siFalla": "Las F de los ejes usan el error combinado: con errores muy distintos, interprétalas con cautela y apóyate en la F_R y en el porcentaje que explica cada eje.", "alternativa": null },
      { "nombre": "Tabla genotipo × ambiente completa", "como": "Si faltan combinaciones, la app las imputa por EM-AMMI y lo marca en el semáforo «Celdas imputadas»; cada celda imputada resta un grado de libertad a la interacción.", "verificar": null, "siFalla": "Con muchas celdas imputadas, quita los genotipos o ambientes muy incompletos o compara las medias con el análisis en dos etapas.", "alternativa": "dos-etapas" },
      { "nombre": "Normalidad de los residuos", "como": "Este análisis no la prueba: filtra un ambiente (Filtrar filas… en Datos) y revísalo en «Revisar los supuestos del modelo».", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en ↻ Transformar…) y repite el análisis.", "alternativa": null },
      { "nombre": "La interacción se resume en pocos ejes", "como": "El porcentaje de la interacción de cada eje (en la conclusión y en el análisis de varianza AMMI) y la F_R de Cornelius.", "verificar": null, "siFalla": "Si hacen falta muchos ejes, los biplots de dos ejes resumen mal: usa el WAAS, que considera todos los ejes significativos, o el GGE.", "alternativa": "gge" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (al menos 3)", "papel": "genotipos" },
        { "nombre": "ambiente", "tipo": "factor con e niveles (al menos 3)", "papel": "ambientes" },
        { "nombre": "repeticion", "tipo": "factor con r niveles (opcional)", "papel": "repeticiones o bloques dentro de cada ambiente" }
      ],
      "minimo": "Al menos 3 genotipos y 3 ambientes (el número de ejes es el menor de g − 1 y e − 1); conviene tener 6 o más de cada uno. Con repeticiones, los ejes se prueban contra el error.",
      "balance": "Las celdas vacías se imputan por EM-AMMI si la opción está activa (por omisión, con 1 eje). Con una sola media por celda no hay error: los ejes no se prueban y el WAAS usa todos.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para el ambiente, el genotipo, la repetición y la respuesta (o una media por genotipo y ambiente, sin repetición).",
      "errores": [
        "Interpretar el biplot AMMI2 cuando los dos primeros ejes explican poca interacción.",
        "Juzgar la estabilidad solo con el primer eje cuando hay más ejes significativos (para eso están el ASV y el WAAS).",
        "Dar una media por celda sin repeticiones y esperar pruebas F de los ejes: sin error no se prueban.",
        "Escribir un mismo genotipo con nombres distintos entre ambientes."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y la G × A del análisis de varianza AMMI.",
        "Mira cuántos ejes son significativos con la F de Gollob y, sobre todo, con la F_R de Cornelius, y qué porcentaje de la interacción explican.",
        "En los biplots, toma como estables los genotipos cercanos a cero en el EJE1 (AMMI1) o al origen (AMMI2), y como interacciones favorables los pares genotipo-ambiente en la misma dirección.",
        "Ordena por ASV y WAAS (menor, más estable) y por WAASY para combinar respuesta y estabilidad."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La interacción genotipo × ambiente fue significativa (F(117, 252) = 2.8, p < 0.001). La prueba F_R retuvo tres ejes AMMI, y los dos primeros explicaron el 66 % de la suma de cuadrados de la interacción. G3 fue el genotipo más estable (menor ASV y WAAS) y el de mayor WAASY, al combinar la estabilidad con un rendimiento superior a la media».",
      "guias": ["F", "p", "asv", "waas", "sc"]
    },
    "limitaciones": [
      "Los puntajes y los biplots describen la tabla de medias de estos ambientes; con pocos ambientes, los patrones pueden no repetirse en otros años.",
      "El signo de cada eje es arbitrario: importan las posiciones relativas, no si un puntaje es positivo o negativo.",
      "Para quién ganó dónde y los megaambientes, el GGE es más directo porque incluye el efecto del genotipo.",
      "La F de Gollob tiende a retener más ejes de los necesarios; prefiere la F_R."
    ],
    "referencias": [
      "Gollob, H. F. (1968). A statistical model which combines features of factor analytic and analysis of variance techniques. Psychometrika, 33(1), 73–115.",
      "Gauch, H. G. (1988). Model selection and validation for yield trials with interaction. Biometrics, 44(3), 705–715.",
      "Cornelius, P. L., Seyedsadr, M., & Crossa, J. (1992). Using the shifted multiplicative model to search for “separability” in crop cultivar trials. Theoretical and Applied Genetics, 84(1–2), 161–172.",
      "Purchase, J. L., Hatting, H., & van Deventer, C. S. (2000). Genotype × environment interaction of winter wheat (Triticum aestivum L.) in South Africa: II. Stability analysis of yield performance. South African Journal of Plant and Soil, 17(3), 101–107.",
      "Olivoto, T., Lúcio, A. D. C., da Silva, J. A. G., Marchioro, V. S., de Souza, V. Q., & Jost, E. (2019). Mean performance and stability in multi-environment trials I: Combining features of AMMI and BLUP techniques. Agronomy Journal, 111(6), 2949–2960."
    ]
  },
  "en": {
    "alias": ["AMMI model", "Additive main effects and multiplicative interaction", "AMMI biplot", "WAAS"],
    "paraQue": "Splits the genotype × environment interaction into a few axes, to see which genotypes and environments interact and which genotypes are stable.",
    "preguntas": [
      "How many interaction patterns are there in an oat trial across 14 environments, and which environments cause them?",
      "Which genotypes are stable (scores close to zero) without giving up yield?",
      "Which wheat line is specifically adapted to the rainfed locations?"
    ],
    "teoria": [
      "The AMMI model combines two tools: the analysis of variance for the main effects of genotypes and environments, which are additive, and the singular value decomposition for the interaction, which is written as a sum of products (multiplicative). Each axis k has a singular value λ_k and a score for each genotype and each environment; the product of the scores of a genotype and an environment, multiplied by λ_k, is the part of their interaction explained by that axis.",
      "SigmaPro takes the interaction from the table of means, decomposes it and tests each axis with Gollob's F (with g + e − 1 − 2k degrees of freedom) and with Cornelius's F_R, which tests whether the interaction left after n axes is still significant; the latter is more reliable for deciding how many axes to retain. The scores are symmetric: the singular vector multiplied by the square root of the singular value.",
      "A genotype with scores close to zero on the important axes is stable; a genotype and an environment in the same direction interact favorably. Purchase's ASV combines the first two axes weighted by what they explain, and the WAAS averages the absolute scores on the significant axes, weighted by their percentage of the interaction; the WAASY combines the WAAS with the response, with the weight you choose. The AMMI1 (mean vs. PC1) and AMMI2 (PC1 vs. PC2) biplots summarize it in one figure."
    ],
    "modelo": {
      "tex": "\\bar{y}_{ij} = \\mu + G_i + E_j + \\sum_{k=1}^{n} \\lambda_k \\gamma_{ik} \\delta_{jk} + \\rho_{ij} + \\varepsilon_{ij}",
      "terminos": [
        ["\\bar{y}_{ij}", "the mean of genotype i in environment j"],
        ["\\mu, G_i, E_j", "the overall mean and the additive effects of genotype and environment"],
        ["\\lambda_k", "the singular value of axis k; r·λ_k² is its sum of squares"],
        ["\\gamma_{ik}, \\delta_{jk}", "the scores of genotype i and environment j on axis k"],
        ["\\rho_{ij}", "the interaction not explained by the n retained axes (AMMI residual)"],
        ["\\varepsilon_{ij}", "the error of the mean"]
      ]
    },
    "hipotesis": [
      { "h0": "\\lambda_k^2 = 0", "h1": "\\lambda_k^2 > 0", "texto": "Axis k explains no interaction: Gollob's F = axis MS / pooled MSE." },
      { "h0": "\\sum_{k>n} \\lambda_k^2 = 0", "h1": "\\text{interaction remains after } n \\text{ axes}", "texto": "Cornelius's F_R: the number of axes is the first n whose residual is no longer significant." }
    ],
    "supuestos": [
      { "nombre": "Homogeneous errors across environments", "como": "“Homogeneity of errors” in the assumptions checklist: ratio between the largest and smallest MSE and Bartlett's test.", "verificar": null, "siFalla": "The F tests of the axes use the pooled error: with very different errors, interpret them with caution and rely on F_R and on the percentage each axis explains.", "alternativa": null },
      { "nombre": "Complete genotype × environment table", "como": "If combinations are missing, the app imputes them by EM-AMMI and flags it under “Imputed cells” in the checklist; each imputed cell removes one degree of freedom from the interaction.", "verificar": null, "siFalla": "With many imputed cells, remove the very incomplete genotypes or environments or compare the means with the two-stage analysis.", "alternativa": "dos-etapas" },
      { "nombre": "Normality of residuals", "como": "This analysis does not test it: filter one environment (Filter rows… in Data) and check it in “Check the model assumptions”.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in ↻ Transform…) and repeat the analysis.", "alternativa": null },
      { "nombre": "The interaction is summarized by a few axes", "como": "The percentage of the interaction of each axis (in the conclusion and in the AMMI analysis of variance) and Cornelius's F_R.", "verificar": null, "siFalla": "If many axes are needed, two-axis biplots summarize poorly: use the WAAS, which considers all significant axes, or GGE.", "alternativa": "gge" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (at least 3)", "papel": "genotypes" },
        { "nombre": "ambiente", "tipo": "factor with e levels (at least 3)", "papel": "environments" },
        { "nombre": "repeticion", "tipo": "factor with r levels (optional)", "papel": "replicates or blocks within each environment" }
      ],
      "minimo": "At least 3 genotypes and 3 environments (the number of axes is the smaller of g − 1 and e − 1); 6 or more of each are advisable. With replicates, the axes are tested against the error.",
      "balance": "Empty cells are imputed by EM-AMMI if the option is on (by default, with 1 axis). With a single mean per cell there is no error: the axes are not tested and the WAAS uses all of them.",
      "notaFormato": "Long format: one row per plot, with columns for environment, genotype, replicate and response (or one mean per genotype and environment, without replicate).",
      "errores": [
        "Interpreting the AMMI2 biplot when the first two axes explain little of the interaction.",
        "Judging stability from the first axis alone when more axes are significant (that is what ASV and WAAS are for).",
        "Giving one mean per cell without replicates and expecting F tests of the axes: without error they are not tested.",
        "Writing the same genotype with different names across environments."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and the G × E in the AMMI analysis of variance.",
        "See how many axes are significant by Gollob's F and, above all, by Cornelius's F_R, and what percentage of the interaction they explain.",
        "In the biplots, take as stable the genotypes close to zero on PC1 (AMMI1) or to the origin (AMMI2), and as favorable interactions the genotype-environment pairs pointing the same way.",
        "Rank by ASV and WAAS (lower, more stable) and by WAASY to combine response and stability."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The genotype × environment interaction was significant (F(117, 252) = 2.8, p < 0.001). The F_R test retained three AMMI axes, and the first two explained 66% of the interaction sum of squares. G3 was the most stable genotype (lowest ASV and WAAS) and had the highest WAASY, combining stability with above-average yield.”",
      "guias": ["F", "p", "asv", "waas", "sc"]
    },
    "limitaciones": [
      "The scores and biplots describe the table of means of these environments; with few environments, the patterns may not repeat in other years.",
      "The sign of each axis is arbitrary: what matters are the relative positions, not whether a score is positive or negative.",
      "For which-won-where and mega-environments, GGE is more direct because it includes the genotype effect.",
      "Gollob's F tends to retain more axes than needed; prefer F_R."
    ],
    "referencias": [
      "Gollob, H. F. (1968). A statistical model which combines features of factor analytic and analysis of variance techniques. Psychometrika, 33(1), 73–115.",
      "Gauch, H. G. (1988). Model selection and validation for yield trials with interaction. Biometrics, 44(3), 705–715.",
      "Cornelius, P. L., Seyedsadr, M., & Crossa, J. (1992). Using the shifted multiplicative model to search for “separability” in crop cultivar trials. Theoretical and Applied Genetics, 84(1–2), 161–172.",
      "Purchase, J. L., Hatting, H., & van Deventer, C. S. (2000). Genotype × environment interaction of winter wheat (Triticum aestivum L.) in South Africa: II. Stability analysis of yield performance. South African Journal of Plant and Soil, 17(3), 101–107.",
      "Olivoto, T., Lúcio, A. D. C., da Silva, J. A. G., Marchioro, V. S., de Souza, V. Q., & Jost, E. (2019). Mean performance and stability in multi-environment trials I: Combining features of AMMI and BLUP techniques. Agronomy Journal, 111(6), 2949–2960."
    ]
  }
});
