SP_FICHA({
  "id": "mixto-localidades",
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": ["multiambiente"],
  "relacionados": ["ensayos-multiambiente", "dos-etapas", "estabilidad", "ammi", "heredabilidad", "modelo-mixto"],
  "ejemplo": { "conjunto": "avena-ambientes", "entradas": { "respuesta": "rendimiento", "genotipo": "genotipo", "localidad": "ambiente", "repeticion": "repeticion" }, "opciones": {} },
  "formato": {
    "largo": [["ambiente", "genotipo", "repeticion", "rendimiento"], ["E1", "G1", "1", "2.167"], ["E1", "G1", "2", "2.50304"], ["E1", "G1", "3", "2.42732"], ["E1", "G2", "1", "3.2075"], ["E1", "G2", "2", "2.9329"], ["E1", "G2", "3", "2.56484"], ["E1", "G3", "1", "2.7694"]],
    "ancho": null
  },
  "es": {
    "alias": ["Ensayos multilocalidad con modelo mixto", "Análisis combinado con localidades aleatorias", "Ensayos regionales"],
    "paraQue": "Compara genotipos evaluados en varias localidades (o años) con repeticiones, con las localidades y la interacción genotipo × localidad como efectos aleatorios.",
    "preguntas": [
      "¿Qué genotipos de avena rinden más en promedio en 14 ambientes que representan la región de producción?",
      "¿Es grande la interacción genotipo × localidad comparada con el error de parcela?",
      "¿Difieren las variedades de frijol cuando las localidades de prueba se consideran una muestra de las de la región?"
    ],
    "teoria": [
      "En un ensayo en varias localidades cada localidad tiene su propio experimento, con repeticiones y los mismos genotipos. Los genotipos son fijos: interesan esos. Las localidades, en cambio, suelen ser una muestra de los ambientes donde se sembrará el cultivo, por lo que conviene tratarlas como aleatorias; así la conclusión sobre los genotipos vale para la región y no solo para los sitios probados.",
      "SigmaPro arma el modelo genotipo + (1 | localidad) + (1 | localidad:repetición) + (1 | genotipo:localidad): las localidades, las repeticiones dentro de cada localidad y la interacción genotipo × localidad son aleatorias. La consecuencia más importante es que los genotipos se prueban, en esencia, contra la interacción genotipo × localidad y no contra el error de parcela: si los genotipos cambian mucho de orden entre sitios, sus diferencias promedio son menos seguras. Las medias marginales de los genotipos y sus errores estándar incluyen esa incertidumbre.",
      "Si solo te interesan las localidades probadas, puedes marcarlas como fijas; entonces el modelo es genotipo × localidad con las repeticiones aleatorias, y se prueban el genotipo, la localidad y su interacción. El ajuste corre por REML en el motor R de tu navegador con lme4 y lmerTest, con grados de libertad de Satterthwaite o de Kenward-Roger, y da los componentes de varianza con su porcentaje, la prueba de razón de verosimilitudes de cada efecto aleatorio, las medias de los genotipos con letras y los BLUP de localidades, repeticiones e interacción cuando no pasan de 120 renglones."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\tau_i + l_j + r_{k(j)} + (\\tau l)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "la respuesta del genotipo i en la repetición k de la localidad j"],
        ["\\tau_i", "el efecto fijo del genotipo i"],
        ["l_j", "el efecto aleatorio de la localidad j, con varianza \\sigma^2_l (fijo si marcas «Localidades fijas»)"],
        ["r_{k(j)}", "el efecto aleatorio de la repetición k dentro de la localidad j"],
        ["(\\tau l)_{ij}", "la interacción aleatoria genotipo × localidad, con varianza \\sigma^2_{gl}"],
        ["\\varepsilon_{ijk}", "el error de parcela, con una sola varianza \\sigma^2 para todas las localidades"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_g = 0", "h1": "\\text{algún } \\tau_i \\ne 0", "texto": "Los genotipos tienen la misma media en la región. Prueba F con grados de libertad de Satterthwaite o de Kenward-Roger, que dependen sobre todo de los de la interacción genotipo × localidad, (g − 1)(l − 1) con datos completos." },
      { "h0": "\\sigma^2_{gl} = 0", "h1": "\\sigma^2_{gl} > 0", "texto": "El orden de los genotipos es el mismo en todas las localidades (no hay interacción). Razón de verosimilitudes; el p que se muestra es conservador." }
    ],
    "supuestos": [
      { "nombre": "Normalidad de los residuos", "como": "El semáforo del análisis muestra la prueba de Shapiro-Wilk de los residuos.", "verificar": null, "siFalla": "Transforma la respuesta (Datos → Transformar) y vuelve a ajustar; revisa también si una localidad tiene datos extraños.", "alternativa": null },
      { "nombre": "Normalidad de los efectos aleatorios", "como": "El semáforo aplica Shapiro-Wilk a los BLUP de un agrupamiento (dice cuál) cuando tiene 5 niveles o más.", "verificar": null, "siFalla": "Un ambiente o una combinación genotipo × ambiente muy extremos merecen revisarse antes de seguir.", "alternativa": null },
      { "nombre": "Varianzas iguales entre genotipos", "como": "El semáforo aplica la prueba de Levene (con la mediana) a los residuos entre genotipos.", "verificar": null, "siFalla": "Prueba una transformación de la respuesta.", "alternativa": null },
      { "nombre": "Misma varianza del error en todas las localidades", "como": "El modelo supone un solo error de parcela; no se prueba en el semáforo. El análisis conjunto de varios ambientes da la razón entre el mayor y el menor cuadrado medio del error y la prueba de Bartlett.", "verificar": "ensayos-multiambiente", "siFalla": "Si la precisión cambia mucho de una localidad a otra, usa el análisis en dos etapas, que da a cada ambiente su propia varianza.", "alternativa": "dos-etapas" },
      { "nombre": "Ajuste estable (no singular)", "como": "El semáforo marca en ámbar el ajuste singular, por ejemplo cuando la varianza de repeticiones o de la interacción quedó en cero.", "verificar": null, "siFalla": "Un componente en cero suele ser inofensivo, pero si la varianza de localidades es cero o hay pocas localidades, conviene marcarlas como fijas.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "genotipo", "tipo": "factor con g niveles", "papel": "genotipos (fijos)" },
        { "nombre": "ambiente", "tipo": "factor con l niveles", "papel": "localidad o ambiente (aleatorio, o fijo si lo marcas)" },
        { "nombre": "repeticion", "tipo": "factor (se identifica dentro de cada localidad)", "papel": "repetición dentro de la localidad (aleatoria)" }
      ],
      "minimo": "Al menos 4 o 5 localidades para estimar su varianza y la de la interacción, con 2 o más repeticiones por localidad.",
      "balance": "Tolera parcelas perdidas y genotipos ausentes en alguna localidad: REML usa todas las filas completas y las medias marginales se ajustan.",
      "notaFormato": "Formato largo: una fila por parcela, con columnas para la localidad, la repetición, el genotipo y la respuesta. Las repeticiones pueden numerarse 1, 2, 3 en cada localidad.",
      "errores": [
        "Promediar las repeticiones de cada localidad antes del análisis: sin repeticiones, la interacción genotipo × localidad se confunde con el error.",
        "Tratar las localidades como fijas cuando quieres concluir para la región: el error de las pruebas sale demasiado pequeño.",
        "Juntar años y sitios en una sola columna sin pensarlo: si interesa separar año y sitio, escribe el modelo con la fórmula del modelo mixto.",
        "Esperar una varianza de localidades confiable con solo 2 o 3 localidades."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo y los avisos de ajuste singular.",
        "Lee la F de los genotipos y fíjate en sus grados de libertad del denominador, que con datos completos son los de la interacción genotipo × localidad, (g − 1)(l − 1).",
        "Compara la varianza de la interacción genotipo × localidad con la de las localidades y con la residual (los genotipos son fijos y no tienen varianza), y lee su prueba de razón de verosimilitudes.",
        "Compara las medias marginales de los genotipos con sus letras.",
        "Si la interacción es grande, describe su patrón con estabilidad, AMMI o biplot GGE."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Los genotipos difirieron en rendimiento promedio (F(9, 117) = 6.3, p < 0.001; grados de libertad de Satterthwaite). La interacción genotipo × ambiente explicó el 9 % de la variación aleatoria (razón de verosimilitudes, p < 0.001), mucho menos que los ambientes (71 %). El genotipo de mayor rendimiento promedió 3.1 t/ha».",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "blup"]
    },
    "limitaciones": [
      "Supone la misma varianza del error en todas las localidades; si difieren mucho, usa el análisis en dos etapas (una varianza por ambiente).",
      "No describe el patrón de la interacción: para eso usa estabilidad, AMMI o biplot GGE.",
      "Trata los genotipos como fijos: para heredabilidad, BLUP de genotipos y ganancia por selección en varios ambientes usa «Heredabilidad y BLUP de genotipos» con la columna de ambiente.",
      "No admite bloques incompletos dentro de cada localidad; para alfa-látices en varias localidades escribe el modelo en la fórmula del modelo mixto."
    ],
    "referencias": [
      "Smith, A., Cullis, B., & Gilmour, A. (2001). The analysis of crop variety evaluation data in Australia. Australian & New Zealand Journal of Statistics, 43(2), 129–145.",
      "Piepho, H.-P., Möhring, J., Schulz-Streeck, T., & Ogutu, J. O. (2012). A stage-wise approach for the analysis of multi-environment trials. Biometrical Journal, 54(6), 844–860.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26."
    ]
  },
  "en": {
    "alias": ["Multi-location trials with a mixed model", "Combined analysis with random locations", "Regional trials"],
    "paraQue": "Compares genotypes evaluated at several locations (or years) with replicates, with locations and the genotype × location interaction as random effects.",
    "preguntas": [
      "Which oat genotypes yield most on average across 14 environments that represent the production region?",
      "Is the genotype × location interaction large compared with the plot error?",
      "Do bean varieties differ when the test locations are considered a sample of those in the region?"
    ],
    "teoria": [
      "In a multi-location trial each location has its own experiment, with replicates and the same genotypes. Genotypes are fixed: those are the ones of interest. Locations, on the other hand, are usually a sample of the environments where the crop will be grown, so it is better to treat them as random; the conclusion about the genotypes then holds for the region and not only for the sites tested.",
      "SigmaPro builds the model genotype + (1 | location) + (1 | location:replicate) + (1 | genotype:location): locations, replicates within each location and the genotype × location interaction are random. The most important consequence is that genotypes are tested, in essence, against the genotype × location interaction and not against the plot error: if genotypes change rank a lot across sites, their average differences are less certain. The marginal means of the genotypes and their standard errors include that uncertainty.",
      "If you are only interested in the locations tested, you can mark them as fixed; the model is then genotype × location with random replicates, and genotype, location and their interaction are tested. The fit runs by REML in the R engine inside your browser with lme4 and lmerTest, with Satterthwaite or Kenward-Roger degrees of freedom, and gives the variance components with their percentage, the likelihood ratio test of each random effect, the genotype means with letters and the BLUPs of locations, replicates and interaction when they do not exceed 120 rows."
    ],
    "modelo": {
      "tex": "y_{ijk} = \\mu + \\tau_i + l_j + r_{k(j)} + (\\tau l)_{ij} + \\varepsilon_{ijk}",
      "terminos": [
        ["y_{ijk}", "the response of genotype i in replicate k of location j"],
        ["\\tau_i", "the fixed effect of genotype i"],
        ["l_j", "the random effect of location j, with variance \\sigma^2_l (fixed if you check “Fixed locations”)"],
        ["r_{k(j)}", "the random effect of replicate k within location j"],
        ["(\\tau l)_{ij}", "the random genotype × location interaction, with variance \\sigma^2_{gl}"],
        ["\\varepsilon_{ijk}", "the plot error, with a single variance \\sigma^2 for all locations"]
      ]
    },
    "hipotesis": [
      { "h0": "\\tau_1 = \\tau_2 = \\cdots = \\tau_g = 0", "h1": "\\text{some } \\tau_i \\ne 0", "texto": "The genotypes have the same mean in the region. F test with Satterthwaite or Kenward-Roger degrees of freedom, which depend mostly on those of the genotype × location interaction, (g − 1)(l − 1) with complete data." },
      { "h0": "\\sigma^2_{gl} = 0", "h1": "\\sigma^2_{gl} > 0", "texto": "The ranking of the genotypes is the same at every location (no interaction). Likelihood ratio; the p shown is conservative." }
    ],
    "supuestos": [
      { "nombre": "Normality of residuals", "como": "The analysis assumptions checklist shows the Shapiro-Wilk test of the residuals.", "verificar": null, "siFalla": "Transform the response (Data → Transform) and refit; also check whether one location has odd data.", "alternativa": null },
      { "nombre": "Normality of random effects", "como": "The assumptions checklist applies Shapiro-Wilk to the BLUPs of one grouping (it says which) when it has 5 levels or more.", "verificar": null, "siFalla": "A very extreme environment or genotype × environment combination deserves a check before going on.", "alternativa": null },
      { "nombre": "Equal variances among genotypes", "como": "The assumptions checklist applies Levene’s test (with the median) to the residuals across genotypes.", "verificar": null, "siFalla": "Try a transformation of the response.", "alternativa": null },
      { "nombre": "Same error variance at every location", "como": "The model assumes a single plot error; the assumptions checklist does not test it. The combined analysis of several environments gives the ratio of the largest to the smallest error mean square and Bartlett’s test.", "verificar": "ensayos-multiambiente", "siFalla": "If precision changes a lot from one location to another, use the two-stage analysis, which gives each environment its own variance.", "alternativa": "dos-etapas" },
      { "nombre": "Stable (nonsingular) fit", "como": "The assumptions checklist flags a singular fit in amber, for example when the replicate or interaction variance ended up at zero.", "verificar": null, "siFalla": "A component at zero is usually harmless, but if the location variance is zero or there are few locations, it is better to mark them as fixed.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "genotipo", "tipo": "factor with g levels", "papel": "genotypes (fixed)" },
        { "nombre": "ambiente", "tipo": "factor with l levels", "papel": "location or environment (random, or fixed if you check it)" },
        { "nombre": "repeticion", "tipo": "factor (identified within each location)", "papel": "replicate within location (random)" }
      ],
      "minimo": "At least 4 or 5 locations to estimate their variance and that of the interaction, with 2 or more replicates per location.",
      "balance": "It tolerates lost plots and genotypes missing at some location: REML uses every complete row and the marginal means adjust.",
      "notaFormato": "Long format: one row per plot, with columns for the location, the replicate, the genotype and the response. Replicates may be numbered 1, 2, 3 at each location.",
      "errores": [
        "Averaging the replicates of each location before the analysis: without replicates, the genotype × location interaction is confounded with the error.",
        "Treating locations as fixed when you want to conclude for the region: the error of the tests comes out too small.",
        "Lumping years and sites into a single column without thinking: if separating year and site matters, write the model with the mixed-model formula.",
        "Expecting a reliable location variance with only 2 or 3 locations."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist and any singular-fit warnings.",
        "Read the F of the genotypes and look at its denominator degrees of freedom, which with complete data are those of the genotype × location interaction, (g − 1)(l − 1).",
        "Compare the genotype × location interaction variance with the location and residual variances (genotypes are fixed and have no variance), and read its likelihood ratio test.",
        "Compare the marginal means of the genotypes with their letters.",
        "If the interaction is large, describe its pattern with stability, AMMI or GGE biplot."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Genotypes differed in average yield (F(9, 117) = 6.3, p < 0.001; Satterthwaite degrees of freedom). The genotype × environment interaction accounted for 9% of the random variation (likelihood ratio, p < 0.001), much less than environments (71%). The highest-yielding genotype averaged 3.1 t/ha.”",
      "guias": ["F", "p", "gl", "componente", "lrt", "media-ajustada", "blup"]
    },
    "limitaciones": [
      "It assumes the same error variance at every location; if they differ a lot, use the two-stage analysis (one variance per environment).",
      "It does not describe the pattern of the interaction: for that use stability, AMMI or GGE biplot.",
      "It treats genotypes as fixed: for heritability, genotype BLUPs and selection gain across environments use “Heritability and genotype BLUPs” with the environment column.",
      "It does not allow incomplete blocks within each location; for alpha lattices at several locations write the model in the mixed-model formula."
    ],
    "referencias": [
      "Smith, A., Cullis, B., & Gilmour, A. (2001). The analysis of crop variety evaluation data in Australia. Australian & New Zealand Journal of Statistics, 43(2), 129–145.",
      "Piepho, H.-P., Möhring, J., Schulz-Streeck, T., & Ogutu, J. O. (2012). A stage-wise approach for the analysis of multi-environment trials. Biometrical Journal, 54(6), 844–860.",
      "Bates, D., Mächler, M., Bolker, B., & Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.",
      "Kuznetsova, A., Brockhoff, P. B., & Christensen, R. H. B. (2017). lmerTest package: Tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26."
    ]
  }
});
