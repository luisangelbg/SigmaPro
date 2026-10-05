SP_FICHA({
  "id": "ensayos-multiambiente",
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["dos-etapas", "estabilidad", "ammi", "gge", "mixto-localidades", "heredabilidad"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "ambiente": "ambiente", "repeticion": "repeticion" }, "opciones": { "objetivo": "maximo" } },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": [["ambiente", "genotipo", "1", "2", "3"], ["E1", "G1", "2.167", "2.50304", "2.42732"], ["E1", "G2", "3.2075", "2.9329", "2.56484"]]
  },
  "es": {
    "alias": ["Análisis combinado de experimentos", "Análisis conjunto", "Ensayos en varias localidades", "Interacción genotipo × ambiente"],
    "paraQue": "Analiza juntos los ensayos de los mismos genotipos en varias localidades o años para saber si difieren y si su orden cambia de un ambiente a otro.",
    "preguntas": [
      "¿Difieren en rendimiento diez líneas de avena evaluadas en 14 ambientes, y cambia su orden de un ambiente a otro?",
      "¿Conviene recomendar el mismo híbrido de maíz para los valles altos y para el trópico?",
      "¿Es igual de preciso el ensayo de frijol en todas las localidades, o alguna tiene un error mucho mayor?"
    ],
    "teoria": [
      "Un ensayo en una sola localidad y un solo año dice poco de cómo se comportará un genotipo en otras condiciones. Por eso se repite el mismo experimento en varios ambientes (localidades, años o fechas de siembra) y se analiza en conjunto. La pregunta central es la interacción genotipo × ambiente (G × A): si es significativa, los genotipos no responden igual en todos los ambientes y su orden puede cambiar, lo que complica la recomendación.",
      "SigmaPro primero analiza cada ambiente por separado (en bloques completos al azar si das la repetición, completamente al azar si no) y da su media, su cuadrado medio del error (CME), su CV y la F de genotipos. Con esos CME revisa la homogeneidad de los errores con la razón entre el mayor y el menor y con la prueba de Bartlett. El error combinado es el promedio de los CME ponderado por sus grados de libertad.",
      "Después hace el análisis de varianza conjunto: los ambientes se prueban contra las repeticiones dentro de ambientes, y los genotipos y la G × A contra el error combinado. Además da la F de genotipos contra G × A, la adecuada si los ambientes son una muestra al azar de la región. Si faltan combinaciones genotipo × ambiente, puede imputarlas por EM-AMMI. Este análisis es el punto de partida de la estabilidad, el AMMI y el GGE."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + A_j + R_{k(j)} + G_i + (GA)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "la respuesta del genotipo i en la repetición k del ambiente j"],
        ["\\mu", "la media general"],
        ["A_j", "el efecto del ambiente j"],
        ["R_{k(j)}", "el efecto de la repetición (bloque) k dentro del ambiente j"],
        ["G_i", "el efecto del genotipo i"],
        ["(GA)_{ij}", "la interacción genotipo × ambiente"],
        ["\\varepsilon_{ijk}", "el error experimental, con una varianza que se supone igual en todos los ambientes"]
      ]
    },
    "hipotesis": [
      { "h0": "(GA)_{ij} = 0 \\text{ para todo } i, j", "h1": "\\text{alguna } (GA)_{ij} \\ne 0", "texto": "Los genotipos responden igual en todos los ambientes: F = CM de G × A / CM del error combinado." },
      { "h0": "G_1 = G_2 = \\cdots = G_g", "h1": "\\text{algún } G_i \\text{ es distinto}", "texto": "Los genotipos tienen la misma media en el conjunto: F contra el error y, con ambientes aleatorios, contra G × A (en la conclusión)." }
    ],
    "supuestos": [
      { "nombre": "Errores homogéneos entre ambientes", "como": "Semáforo «Homogeneidad de los errores»: razón entre el mayor y el menor CME (verde hasta 3, ámbar hasta 9, rojo más) y prueba de Bartlett.", "verificar": null, "siFalla": "Las F del análisis conjunto se vuelven aproximadas; usa el análisis en dos etapas, que pondera cada media por su varianza.", "alternativa": "dos-etapas" },
      { "nombre": "Normalidad de los residuos dentro de cada ambiente", "como": "Este análisis no la prueba: filtra un ambiente (Filtrar filas… en Datos) y revísalo en «Revisar los supuestos del modelo», con el genotipo como tratamiento y la repetición como bloque.", "verificar": "supuestos", "siFalla": "Transforma la respuesta (Box-Cox en ↻ Transformar…); para conteos o proporciones, plantea un modelo lineal generalizado.", "alternativa": "glm" },
      { "nombre": "Tabla genotipo × ambiente completa", "como": "Si faltan combinaciones, la app las imputa por EM-AMMI (opción activada por omisión) y lo marca en el semáforo «Celdas imputadas»: ámbar hasta 10 % de las celdas, rojo más.", "verificar": null, "siFalla": "Con muchas celdas vacías, usa el análisis en dos etapas, que trabaja solo con las medias que hay.", "alternativa": "dos-etapas" },
      { "nombre": "Ambientes fijos o aleatorios", "como": "El cuadro trata a los ambientes como fijos; la conclusión agrega la F de genotipos contra G × A, la que corresponde si los ambientes son una muestra de la región.", "verificar": null, "siFalla": "Si los ambientes son aleatorios y quieres componentes de varianza o BLUP de los genotipos, usa el modelo mixto de varias localidades.", "alternativa": "mixto-localidades" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles (al menos 3)", "papel": "genotipos (variedades, híbridos, líneas)" },
        { "nombre": "ambiente", "tipo": "factor con e niveles (al menos 3)", "papel": "ambientes (localidades, años, fechas)" },
        { "nombre": "repeticion", "tipo": "factor con r niveles (opcional)", "papel": "repeticiones o bloques dentro de cada ambiente" }
      ],
      "minimo": "Al menos 3 genotipos y 3 ambientes; en la práctica, 6 o más ambientes y de 2 a 4 repeticiones por ambiente para estimar bien la interacción y el error de cada uno.",
      "balance": "Las repeticiones pueden variar entre celdas (r es su media armónica). Si falta alguna combinación genotipo × ambiente, la app la imputa por EM-AMMI o, si apagas esa opción, se detiene. Sin repeticiones y con una sola fila por celda, la G × A hace de residuo y no se prueba.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para el ambiente, el genotipo, la repetición y la respuesta. Si tus repeticiones están en columnas (formato ancho), conviértelas con Ancha ⇄ larga… en Datos.",
      "errores": [
        "Capturar solo la media de cada genotipo en cada ambiente cuando sí hubo repeticiones: se pierde el error de cada ambiente.",
        "Escribir un mismo genotipo de forma distinta entre localidades (G1 y G-1): la app los toma como genotipos diferentes.",
        "Creer que la repetición 1 de una localidad es la misma que la 1 de otra: SigmaPro anida las repeticiones en el ambiente, que es lo correcto.",
        "Juntar ambientes con errores muy distintos sin revisar la homogeneidad."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: la homogeneidad de los errores y, si las hay, las celdas imputadas.",
        "En «Análisis de cada ambiente», mira el CV y la F de genotipos de cada uno: un ambiente con un CV muy alto aporta más ruido que información.",
        "En el análisis de varianza conjunto, lee primero la G × A: si es significativa, el orden de los genotipos cambia y conviene estudiar la estabilidad, el AMMI o el GGE.",
        "Lee la F de genotipos contra el error y, en la conclusión, contra G × A.",
        "Usa la tabla de medias y la gráfica de cada genotipo en los ambientes (aparece con 12 genotipos o menos) para ver dónde se cruzan las líneas."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La interacción genotipo × ambiente fue significativa (F(117, 252) = 2.8, p < 0.001), por lo que el orden de las líneas cambió entre ambientes. Las líneas difirieron aun probadas contra la interacción (F(9, 117) = 5.4, p < 0.001); la de mayor rendimiento medio fue G8 (3.0 t/ha). Los errores de los ambientes no fueron homogéneos (razón máx./mín. de 6.7; Bartlett, p < 0.001), así que las pruebas conjuntas se tomaron como aproximadas».",
      "guias": ["F", "p", "cv", "bartlett", "cm"]
    },
    "limitaciones": [
      "Con errores muy distintos entre ambientes o con genotipos que faltan, el análisis en dos etapas es más adecuado.",
      "Una G × A significativa dice que hay interacción, no cómo es: para describirla usa la estabilidad, el AMMI o el GGE.",
      "Trata a los genotipos como fijos; para predecir su valor genético (BLUP) o calcular la heredabilidad en varios ambientes, usa el modelo mixto de varias localidades o la heredabilidad.",
      "Supone bloques completos (o un diseño completamente al azar) en cada ambiente; con bloques incompletos dentro de cada localidad, el error de cada ambiente no se estima bien aquí."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "McIntosh, M. S. (1983). Analysis of combined experiments. Agronomy Journal, 75(1), 153–155.",
      "Bartlett, M. S. (1937). Properties of sufficiency and statistical tests. Proceedings of the Royal Society of London. Series A, Mathematical and Physical Sciences, 160(901), 268–282.",
      "Crossa, J. (1990). Statistical analyses of multilocation trials. Advances in Agronomy, 44, 55–85."
    ]
  },
  "en": {
    "alias": ["Combined analysis of experiments", "Combined analysis", "Multi-location trials", "Genotype × environment interaction"],
    "paraQue": "Analyzes together the trials of the same genotypes at several locations or years to find out whether they differ and whether their ranking changes from one environment to another.",
    "preguntas": [
      "Do ten oat lines tested in 14 environments differ in yield, and does their ranking change from one environment to another?",
      "Should the same maize hybrid be recommended for the highlands and for the tropics?",
      "Is the bean trial equally precise at every location, or does one have a much larger error?"
    ],
    "teoria": [
      "A trial at a single location in a single year says little about how a genotype will perform under other conditions. That is why the same experiment is repeated in several environments (locations, years or sowing dates) and analyzed together. The central question is the genotype × environment interaction (G × E): if it is significant, the genotypes do not respond the same way in every environment and their ranking may change, which complicates the recommendation.",
      "SigmaPro first analyzes each environment separately (as a randomized complete block design if you give the replicate, as a completely randomized design if not) and reports its mean, its error mean square (MSE), its CV and the genotype F. With those MSE values it checks the homogeneity of errors through the ratio between the largest and the smallest and through Bartlett's test. The pooled error is the average of the MSE values weighted by their degrees of freedom.",
      "Then it runs the combined analysis of variance: environments are tested against replicates within environments, and genotypes and G × E against the pooled error. It also gives the genotype F against G × E, the right one if environments are a random sample of the region. If genotype × environment combinations are missing, it can impute them by EM-AMMI. This analysis is the starting point for stability, AMMI and GGE."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + E_j + R_{k(j)} + G_i + (GE)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "the response of genotype i in replicate k of environment j"],
        ["\\mu", "the overall mean"],
        ["E_j", "the effect of environment j"],
        ["R_{k(j)}", "the effect of replicate (block) k within environment j"],
        ["G_i", "the effect of genotype i"],
        ["(GE)_{ij}", "the genotype × environment interaction"],
        ["\\varepsilon_{ijk}", "the experimental error, with a variance assumed equal in every environment"]
      ]
    },
    "hipotesis": [
      { "h0": "(GE)_{ij} = 0 \\text{ for all } i, j", "h1": "\\text{some } (GE)_{ij} \\ne 0", "texto": "Genotypes respond the same way in every environment: F = G × E MS / pooled error MS." },
      { "h0": "G_1 = G_2 = \\cdots = G_g", "h1": "\\text{some } G_i \\text{ differs}", "texto": "Genotypes have the same mean across environments: F against the error and, with random environments, against G × E (in the conclusion)." }
    ],
    "supuestos": [
      { "nombre": "Homogeneous errors across environments", "como": "“Homogeneity of errors” in the assumptions checklist: ratio between the largest and smallest MSE (green up to 3, amber up to 9, red above) and Bartlett's test.", "verificar": null, "siFalla": "The F tests of the combined analysis become approximate; use the two-stage analysis, which weights each mean by its variance.", "alternativa": "dos-etapas" },
      { "nombre": "Normality of residuals within each environment", "como": "This analysis does not test it: filter one environment (Filter rows… in Data) and check it in “Check the model assumptions”, with genotype as treatment and replicate as block.", "verificar": "supuestos", "siFalla": "Transform the response (Box-Cox in ↻ Transform…); for counts or proportions, set up a generalized linear model.", "alternativa": "glm" },
      { "nombre": "Complete genotype × environment table", "como": "If combinations are missing, the app imputes them by EM-AMMI (option on by default) and flags it under “Imputed cells” in the checklist: amber up to 10% of the cells, red above.", "verificar": null, "siFalla": "With many empty cells, use the two-stage analysis, which works only with the means available.", "alternativa": "dos-etapas" },
      { "nombre": "Fixed or random environments", "como": "The table treats environments as fixed; the conclusion adds the genotype F against G × E, the right one if the environments are a sample of the region.", "verificar": null, "siFalla": "If environments are random and you want variance components or genotype BLUPs, use the mixed model for several locations.", "alternativa": "mixto-localidades" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels (at least 3)", "papel": "genotypes (varieties, hybrids, lines)" },
        { "nombre": "ambiente", "tipo": "factor with e levels (at least 3)", "papel": "environments (locations, years, dates)" },
        { "nombre": "repeticion", "tipo": "factor with r levels (optional)", "papel": "replicates or blocks within each environment" }
      ],
      "minimo": "At least 3 genotypes and 3 environments; in practice, 6 or more environments and 2 to 4 replicates per environment to estimate the interaction and each environment's error well.",
      "balance": "Replicates may vary among cells (r is their harmonic mean). If a genotype × environment combination is missing, the app imputes it by EM-AMMI or, if you turn that option off, stops. Without replicates and with a single row per cell, G × E acts as the residual and is not tested.",
      "notaFormato": "Long format: one row per plot, with columns for environment, genotype, replicate and response. If your replicates are in columns (wide format), convert them with Wide ⇄ long… in Data.",
      "errores": [
        "Entering only the mean of each genotype in each environment when there were replicates: each environment's error is lost.",
        "Writing the same genotype differently across locations (G1 and G-1): the app treats them as different genotypes.",
        "Thinking that replicate 1 at one location is the same as replicate 1 at another: SigmaPro nests replicates within environments, which is correct.",
        "Pooling environments with very different errors without checking homogeneity."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: homogeneity of errors and, if any, the imputed cells.",
        "In “Analysis of each environment”, look at the CV and the genotype F of each one: an environment with a very high CV adds more noise than information.",
        "In the combined analysis of variance, read G × E first: if it is significant, the genotype ranking changes and stability, AMMI or GGE are worth studying.",
        "Read the genotype F against the error and, in the conclusion, against G × E.",
        "Use the table of means and the plot of each genotype across environments (shown with 12 genotypes or fewer) to see where the lines cross."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The genotype × environment interaction was significant (F(117, 252) = 2.8, p < 0.001), so the ranking of the lines changed across environments. The lines differed even when tested against the interaction (F(9, 117) = 5.4, p < 0.001); the highest mean yield was that of G8 (3.0 t/ha). Environment errors were not homogeneous (max./min. ratio of 6.7; Bartlett, p < 0.001), so the combined tests were taken as approximate.”",
      "guias": ["F", "p", "cv", "bartlett", "cm"]
    },
    "limitaciones": [
      "With very different errors across environments or with missing genotypes, the two-stage analysis is more suitable.",
      "A significant G × E says there is interaction, not what it looks like: to describe it use stability, AMMI or GGE.",
      "It treats genotypes as fixed; to predict their genetic value (BLUP) or compute heritability across environments, use the mixed model for several locations or heritability.",
      "It assumes complete blocks (or a completely randomized design) in each environment; with incomplete blocks within each location, each environment's error is not estimated well here."
    ],
    "referencias": [
      "Gomez, K. A., & Gomez, A. A. (1984). Statistical procedures for agricultural research (2nd ed.). Wiley.",
      "McIntosh, M. S. (1983). Analysis of combined experiments. Agronomy Journal, 75(1), 153–155.",
      "Bartlett, M. S. (1937). Properties of sufficiency and statistical tests. Proceedings of the Royal Society of London. Series A, Mathematical and Physical Sciences, 160(901), 268–282.",
      "Crossa, J. (1990). Statistical analyses of multilocation trials. Advances in Agronomy, 44, 55–85."
    ]
  }
});
