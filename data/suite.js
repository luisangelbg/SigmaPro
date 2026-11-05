/* SigmaPro — las apps hermanas de la suite LABG (el bloque 10 «Suite LABG», las tarjetas de Inicio y las sugerencias LABGSuggest).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un solo lugar para editar: agregar una app es agregar una entrada a «apps» (y su logo en img/suite/). Va como .js y
   no como .json porque con doble clic (file://) el navegador no deja leer archivos de datos; el contenido es JSON.
   Fuentes (5 nov 2026): el catálogo publicado del portal (https://luisangelbg.github.io/, data/apps.js) para el nombre,
   la versión, el DOI, la categoría, la descripción y los puntos de cada app; el CITATION.cff de cada repositorio en
   https://github.com/luisangelbg para el título de la cita y la fecha; y el ícono publicado de cada app para su logo.
   Nada se agrega por cuenta propia.
     «categoria»  agrupa las apps en el bloque 10, en el orden de «categorias»
     «destacada»  false: la app no sale en las tarjetas de Inicio (el bloque 10 muestra todas)
     «version»    null cuando la app no publica número de versión; «doi», null cuando aún no tiene DOI de Zenodo
     «estado»     «pendiente» para una app sin repositorio público (sus campos dicen PENDIENTE) */
window.SP_SUITE = {
  "actualizado": "2026-11-05",
  "portal": "https://luisangelbg.github.io/",
  "autor": { "nombre": "Luis Ángel Barrera-Guzmán", "familia": "Barrera-Guzmán", "dado": "Luis Ángel", "orcid": "0000-0001-8057-2583" },
  "categorias": [
    { "id": "estadistica", "es": "Estadística y análisis multivariado", "en": "Statistics and multivariate analysis" },
    { "id": "agronomia", "es": "Experimentación y agronomía", "en": "Experimentation and agronomy" },
    { "id": "genetica", "es": "Genética, mejoramiento y recursos genéticos", "en": "Genetics, breeding and genetic resources" },
    { "id": "biogeografia", "es": "Biogeografía y filogenia", "en": "Biogeography and phylogeny" },
    { "id": "botanica", "es": "Botánica para el aula", "en": "Botany for the classroom" },
    { "id": "ciencia", "es": "Herramientas para la ciencia", "en": "Tools for science" }
  ],
  "apps": [
    {
      "id": "PCAPro",
      "categoria": "estadistica",
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PCAPro/",
      "repo": "https://github.com/luisangelbg/PCAPro",
      "logo": "img/suite/pcapro.svg",
      "version": "1.1.0",
      "fecha": "2026-09-10",
      "doi": "10.5281/zenodo.22649709",
      "titulo": "PCAPro: an offline, browser-based platform for guided principal component analysis",
      "manual": "https://luisangelbg.github.io/PCAPro/manual/es/manual-completo.html",
      "envio": "numericas",
      "palabras": ["componentes principales", "ACP", "PCA", "biplot", "análisis factorial", "correspondencias", "rotación", "multivariado"],
      "es": {
        "eslogan": "Métodos de componentes principales, en tu navegador, sin nada que instalar.",
        "descripcion": "Análisis de componentes principales completo: preparación de datos, supuestos, extracción, rotación, mapas factoriales, interpretación y reporte.",
        "caracteristicas": [
          "Extracción con ocho criterios de retención y siete rotaciones.",
          "Análisis de correspondencias simple y múltiple, factorial de datos mixtos y factorial múltiple, sobre un mismo núcleo de SVD generalizada.",
          "Un recomendador que lee tu tabla y dice cuál de los cinco métodos le conviene.",
          "Clasificación jerárquica de los individuos sobre las coordenadas factoriales (HCPC).",
          "Mapas factoriales, interpretación y reporte listo para publicar, en español e inglés.",
          "Todo se calcula en el navegador: sin instalación, sin servidor y sin enviar tus datos."
        ]
      },
      "en": {
        "eslogan": "Principal component methods, in your browser, with nothing to install.",
        "descripcion": "Complete principal component analysis: data preparation, assumptions, extraction, rotation, factor maps, interpretation and report.",
        "caracteristicas": [
          "Extraction with eight retention criteria and seven rotations.",
          "Simple and multiple correspondence analysis, factor analysis of mixed data and multiple factor analysis, on one generalized-SVD core.",
          "A recommender that reads your table and says which of the five methods fits it.",
          "Hierarchical clustering of the individuals on the factor coordinates (HCPC).",
          "Factor maps, interpretation and a publication-ready report, in Spanish and English.",
          "Everything runs in the browser: no installation, no server, and your data are never sent."
        ]
      }
    },
    {
      "id": "ClusteringPro",
      "categoria": "estadistica",
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/ClusteringPro/",
      "repo": "https://github.com/luisangelbg/ClusteringPro",
      "logo": "img/suite/clusteringpro.svg",
      "version": "1.0.1",
      "fecha": "2026-09-10",
      "doi": "10.5281/zenodo.22682795",
      "titulo": "ClusteringPro: finding, validating and interpreting natural groups in biological, ecological and agronomic data without programming",
      "manual": "https://luisangelbg.github.io/ClusteringPro/manual/es/manual-completo.html",
      "envio": "numericas",
      "palabras": ["conglomerados", "agrupamiento", "cluster", "dendrograma", "k-medias", "distancias", "clasificación", "discriminante"],
      "es": {
        "eslogan": "Análisis de conglomerados para todo tipo de datos, sin escribir código.",
        "descripcion": "Del cuadro de datos a dendrogramas y mapas de grupos listos para publicar: distancias, métodos jerárquicos y de partición, validación y perfiles.",
        "caracteristicas": [
          "Tendencia al agrupamiento (estadístico de Hopkins, VAT) y 39 coeficientes de similitud y distancia para datos cuantitativos, binarios, nominales, ordinales, mixtos y ecológicos.",
          "Diez reglas de agrupamiento jerárquico, con un estudio de dendrogramas editable y tanglegramas.",
          "k-medias, PAM, CLARA, c-medias difuso, mezclas gaussianas, DBSCAN y agrupamiento espectral.",
          "Trece criterios para el número de grupos con voto de consenso, estabilidad por bootstrap y validación externa.",
          "Perfiles de los grupos con valores test y especies indicadoras; análisis discriminante y reglas de clasificación.",
          "Reporte automático y paquete ZIP con datos, cuadros y figuras."
        ]
      },
      "en": {
        "eslogan": "Cluster analysis for every kind of data, without writing code.",
        "descripcion": "From the raw table to publication-ready dendrograms and cluster maps: distances, hierarchical and partitioning methods, validation and profiles.",
        "caracteristicas": [
          "Clustering tendency (Hopkins statistic, VAT) and 39 similarity and dissimilarity coefficients for quantitative, binary, nominal, ordinal, mixed and ecological data.",
          "Ten hierarchical linkage rules, with an editable dendrogram studio and tanglegrams.",
          "k-means, PAM, CLARA, fuzzy c-means, Gaussian mixtures, DBSCAN and spectral clustering.",
          "Thirteen criteria for the number of clusters with a consensus vote, bootstrap stability and external validation.",
          "Cluster profiles with test values and indicator species; discriminant analysis and classification rules.",
          "Automatic report and a ZIP package of data, tables and figures."
        ]
      }
    },
    {
      "id": "CorrelationPro",
      "categoria": "estadistica",
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/CorrelationPro/",
      "repo": "https://github.com/luisangelbg/CorrelationPro",
      "logo": "img/suite/correlationpro.svg",
      "version": "1.0.0",
      "fecha": "2026-11-01",
      "doi": "10.5281/zenodo.23867439",
      "titulo": "CorrelationPro: a browser-based platform for correlation analysis of every kind, with its theory",
      "manual": "https://luisangelbg.github.io/CorrelationPro/manual/es/manual-completo.html",
      "envio": "numericas",
      "palabras": ["correlación", "Pearson", "Spearman", "matriz de correlación", "asociación", "variables", "correlación parcial", "metaanálisis"],
      "es": {
        "eslogan": "Correlación de todo tipo, con su teoría.",
        "descripcion": "Del cuadro de datos a la correlación bien elegida y bien reportada: coeficientes clásicos, robustos y no lineales, correlación parcial y entre conjuntos, medidas para variables categóricas, ordinales y latentes, acuerdo y fiabilidad, redes, comparación de correlaciones, potencia y metaanálisis.",
        "caracteristicas": [
          "Más de ochenta medidas, de Pearson a la dependencia no lineal.",
          "Parcial, canónica, categóricas, policóricas y acuerdo.",
          "Datos con grupos, series, espacio, filogenia y ángulos.",
          "Redes, comparación de correlaciones, potencia y metaanálisis."
        ]
      },
      "en": {
        "eslogan": "Correlation of every kind, with its theory.",
        "descripcion": "From the data table to a well-chosen, well-reported correlation: classical, robust and nonlinear coefficients, partial and between-set correlation, measures for categorical, ordinal and latent variables, agreement and reliability, networks, comparison of correlations, power and meta-analysis.",
        "caracteristicas": [
          "More than eighty measures, from Pearson to nonlinear dependence.",
          "Partial, canonical, categorical, polychoric and agreement measures.",
          "Data with groups, series, space, phylogeny and angles.",
          "Networks, comparison of correlations, power and meta-analysis."
        ]
      }
    },
    {
      "id": "AnalizaR",
      "nombre": "StatsPro",
      "categoria": "estadistica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/AnalizaR/",
      "repo": "https://github.com/luisangelbg/AnalizaR",
      "logo": "img/suite/analizar.svg",
      "version": null,
      "fecha": "2026-10-09",
      "doi": null,
      "titulo": "StatsPro: estadística rigurosa para el aula, sin código",
      "manual": null,
      "envio": "numericas",
      "palabras": ["descriptiva", "ANOVA", "regresión", "correlación", "docencia", "aula"],
      "es": {
        "eslogan": "Estadística rigurosa para el aula, sin código.",
        "descripcion": "Sube una hoja de cálculo y obtén estadística descriptiva, supuestos del ANOVA, regresión, comparación de medias, correlación y análisis multivariado, con gráficas editables de calidad para publicación.",
        "caracteristicas": [
          "Descriptiva, ANOVA y comparación de medias.",
          "Regresión y correlación.",
          "PCA y agrupamiento.",
          "Todo el cálculo dentro del navegador."
        ]
      },
      "en": {
        "eslogan": "Rigorous statistics for the classroom, without code.",
        "descripcion": "Upload a spreadsheet and get descriptive statistics, ANOVA assumptions, regression, mean comparisons, correlation and multivariate analysis, with editable publication-quality charts.",
        "caracteristicas": [
          "Descriptive statistics, ANOVA and mean comparisons.",
          "Regression and correlation.",
          "PCA and clustering.",
          "All the computing happens inside the browser."
        ]
      }
    },
    {
      "id": "AgriDesign",
      "categoria": "agronomia",
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/AgriDesign/",
      "repo": "https://github.com/luisangelbg/AgriDesign",
      "logo": "img/suite/agridesign.svg",
      "version": "1.0",
      "fecha": "2026-09-10",
      "doi": "10.5281/zenodo.22683046",
      "titulo": "AgriDesign: a browser-based platform for the design and analysis of agricultural experiments",
      "manual": "https://luisangelbg.github.io/AgriDesign/manual/AgriDesign%20User%27s%20Manual.pdf",
      "envio": "largo",
      "palabras": ["diseño experimental", "aleatorización", "croquis", "libro de campo", "bloques", "parcelas divididas", "ANOVA", "repeticiones"],
      "es": {
        "eslogan": "Diseño y análisis de experimentos agrícolas, sin escribir código.",
        "descripcion": "Del libro de campo a los resultados: diseños experimentales clásicos con sus pruebas de medias, figuras, reporte y generador de croquis aleatorizados.",
        "caracteristicas": [
          "Importación con diagnóstico de formato ordenado, roles de las variables, balance del diseño y paso de formato ancho a largo.",
          "Supuestos del ANOVA con diagnóstico de residuos, transformaciones (Box-Cox) y alternativas no paramétricas.",
          "Diseños clásicos: completamente al azar, bloques (también generalizados), cuadro latino, bloques incompletos, aumentados, factoriales, parcelas divididas, franjas, sub-subdivididas, anidados y ANCOVA, con sus estratos de error.",
          "Once procedimientos de separación de medias y figuras editables listas para publicar.",
          "Generador de diseños sin datos: aleatorización con semilla, croquis de campo editable, libro de campo y cálculo de repeticiones y potencia.",
          "Reporte automático en HTML."
        ]
      },
      "en": {
        "eslogan": "Design and analysis of agricultural experiments, without writing code.",
        "descripcion": "From the field book to the results: classical experimental designs with their mean-separation tests, figures, report and a randomized field-layout generator.",
        "caracteristicas": [
          "Data import with tidy-format diagnostics, variable roles, design structure and balance, and wide-to-long reshaping.",
          "ANOVA assumptions with residual diagnostics, transformations (Box-Cox) and non-parametric alternatives.",
          "Classical designs: completely randomized, blocks (also generalized), Latin square, incomplete blocks, augmented, factorials, split-plot, strip-plot, split-split-plot, nested and ANCOVA, with their error strata.",
          "Eleven mean-separation procedures and editable, publication-quality figures.",
          "Design generator with no data needed: seeded randomization, editable field map, field book and replicate and power calculations.",
          "Automatic HTML report."
        ]
      }
    },
    {
      "id": "PhenologyPro",
      "categoria": "agronomia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PhenologyPro/",
      "repo": "https://github.com/luisangelbg/PhenologyPro",
      "logo": "img/suite/phenologypro.svg",
      "version": "1.2.0",
      "fecha": "2026-10-10",
      "doi": "10.5281/zenodo.23004710",
      "titulo": "PhenologyPro: a browser-based platform for agroclimatology and crop phenology",
      "manual": "https://luisangelbg.github.io/PhenologyPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["fenología", "grados día", "evapotranspiración", "clima", "fechas", "riego"],
      "es": {
        "eslogan": "¿Cuánto calor, cuánta agua y para cuándo?",
        "descripcion": "Agroclimatología y fenología de cultivos, de la serie de la estación al informe: grados día, evapotranspiración, balance hídrico, riego, etapas fenológicas, horas frío, climogramas y riesgo de heladas.",
        "caracteristicas": [
          "Grados-día y etapas BBCH fechadas por tiempo térmico, con calibración.",
          "ETo por FAO-56 Penman–Monteith y cuatro métodos simples, con lo que la estación mida.",
          "Balance hídrico diario, calendario de riego y capacidad de diseño.",
          "Heladas, frío invernal, ventana de siembra y escenarios de +1, +2 y +3 °C."
        ]
      },
      "en": {
        "eslogan": "How much heat, how much water, and by when?",
        "descripcion": "Agroclimatology and crop phenology, from the station record to the report: degree-days, evapotranspiration, water balance, irrigation, phenological stages, winter chill, climographs and frost risk.",
        "caracteristicas": [
          "Degree-days and BBCH stages dated by thermal time, with calibration.",
          "ETo by FAO-56 Penman–Monteith and four simple methods, with whatever the station measures.",
          "Daily water balance, irrigation schedule and design capacity.",
          "Frost, winter chill, sowing window and +1, +2 and +3 °C scenarios."
        ]
      }
    },
    {
      "id": "EconomicsPro",
      "categoria": "agronomia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/EconomicsPro/",
      "repo": "https://github.com/luisangelbg/EconomicsPro",
      "logo": "img/suite/economicspro.svg",
      "version": "1.0.7",
      "fecha": "2026-09-28",
      "doi": "10.5281/zenodo.23005974",
      "titulo": "EconomicsPro: a browser-based platform for the economic and financial appraisal of agrifood projects",
      "manual": "https://luisangelbg.github.io/EconomicsPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["evaluación de proyectos", "VAN", "TIR", "costos", "rentabilidad", "análisis marginal"],
      "es": {
        "eslogan": "¿Conviene el proyecto, y cuánto aguanta?",
        "descripcion": "Evaluación económica y financiera de proyectos agrícolas y agroindustriales, del supuesto al informe: flujos, VAN, TIR, B/C, análisis marginal del CIMMYT, riesgo con Monte Carlo, precios cuenta y comparación de alternativas.",
        "caracteristicas": [
          "VAN, TIR y todos los indicadores de los dos flujos, con el dictamen redactado.",
          "Riesgo: valores límite, escenarios, Monte Carlo con correlación y árbol de decisión.",
          "Evaluación social con precios cuenta y un puente exacto del VAN privado al económico.",
          "Informe que se lee solo y paquete .zip que permite rehacer todos los cálculos."
        ]
      },
      "en": {
        "eslogan": "Is the project worth it, and how much can it withstand?",
        "descripcion": "Economic and financial appraisal of agricultural and agro-industrial projects, from the assumptions to the report: cash flows, NPV, IRR, B/C, CIMMYT marginal analysis, Monte Carlo risk, shadow prices and comparison of alternatives.",
        "caracteristicas": [
          "NPV, IRR and every indicator for both cash flows, with the written verdict.",
          "Risk: break-even values, scenarios, Monte Carlo with correlation and a decision tree.",
          "Social appraisal with shadow prices and an exact bridge from the private to the economic NPV.",
          "A self-explanatory report and a .zip package that lets you redo every calculation."
        ]
      }
    },
    {
      "id": "ForestPro",
      "categoria": "agronomia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/ForestPro/",
      "repo": "https://github.com/luisangelbg/ForestPro",
      "logo": "img/suite/forestpro.svg",
      "version": "1.0.0",
      "fecha": "2026-11-02",
      "doi": "10.5281/zenodo.23876374",
      "titulo": "ForestPro: a browser-based platform for forest inventory, mensuration, biomass, carbon and agroforestry",
      "manual": "https://luisangelbg.github.io/ForestPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["inventario forestal", "dasometría", "biomasa", "carbono", "agroforestería", "volumen"],
      "es": {
        "eslogan": "Del árbol medido a la tonelada de carbono.",
        "descripcion": "Inventario forestal y agroforestal, de la hoja de campo al informe: dasometría, diseños de muestreo con su error, biomasa y carbono con ecuaciones alométricas, crecimiento e índice de sitio, diversidad, sistemas agroforestales y mapas.",
        "caracteristicas": [
          "Volumen, ahusamiento y altura por ajuste no lineal; inventario con su error de muestreo.",
          "Biomasa y carbono con densidad de la madera, Monte Carlo y todos los reservorios.",
          "Crecimiento, índice de sitio, diversidad, ordenación y patrón espacial.",
          "Sombra y diseño agroforestal, mapas con kriging y GPX, informe autocontenido."
        ]
      },
      "en": {
        "eslogan": "From the measured tree to the tonne of carbon.",
        "descripcion": "Forest and agroforestry inventory, from the field sheet to the report: mensuration, sampling designs with their error, biomass and carbon with allometric equations, growth and site index, diversity, agroforestry systems and maps.",
        "caracteristicas": [
          "Volume, taper and height by nonlinear fitting; inventory with its sampling error.",
          "Biomass and carbon with wood density, Monte Carlo and every pool.",
          "Growth, site index, diversity, ordination and spatial pattern.",
          "Shade and agroforestry design, maps with kriging and GPX, a self-contained report."
        ]
      }
    },
    {
      "id": "PostHarvestPro",
      "categoria": "agronomia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PostHarvestPro/",
      "repo": "https://github.com/luisangelbg/PostHarvestPro",
      "logo": "img/suite/postharvestpro.svg",
      "version": "1.0.0",
      "fecha": "2026-11-02",
      "doi": "10.5281/zenodo.23935616",
      "titulo": "PostHarvestPro: postharvest physiology and technology, quality, shelf life and sensory evaluation in the browser",
      "manual": "https://luisangelbg.github.io/PostHarvestPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["poscosecha", "vida de anaquel", "calidad", "evaluación sensorial", "respiración", "almacenamiento"],
      "es": {
        "eslogan": "Del campo al consumidor: calidad, vida de anaquel y sensorial con datos.",
        "descripcion": "Fisiología y tecnología poscosecha en el navegador: índices de calidad y color, cinética de deterioro y vida de anaquel, respiración, etileno y atmósferas modificadas, pérdidas en la cadena de valor y evaluación sensorial con desempeño del panel.",
        "caracteristicas": [
          "Cinética de orden 0, 1 y 2 con AIC, Arrhenius, Q10 y vida de anaquel a cualquier temperatura.",
          "Kaplan–Meier, Weibull y log-normal para el tiempo hasta el rechazo.",
          "Respiración, climaterio, atmósfera modificada y carga de refrigeración.",
          "Sensorial con d′ de Thurstone, penalidades JAR, CATA y desempeño del panel."
        ]
      },
      "en": {
        "eslogan": "From the field to the consumer: quality, shelf life and sensory evaluation with data.",
        "descripcion": "Postharvest physiology and technology in the browser: quality and colour indices, deterioration kinetics and shelf life, respiration, ethylene and modified atmospheres, value-chain losses and sensory evaluation with panel performance.",
        "caracteristicas": [
          "Order 0, 1 and 2 kinetics with AIC, Arrhenius, Q10 and shelf life at any temperature.",
          "Kaplan–Meier, Weibull and log-normal models for the time to rejection.",
          "Respiration, climacteric, modified atmosphere and refrigeration load.",
          "Sensory analysis with Thurstonian d′, JAR penalties, CATA and panel performance."
        ]
      }
    },
    {
      "id": "BreedingPro",
      "categoria": "genetica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/BreedingPro/",
      "repo": "https://github.com/luisangelbg/BreedingPro",
      "logo": "img/suite/breedingpro.svg",
      "version": "1.0.1",
      "fecha": "2026-09-28",
      "doi": "10.5281/zenodo.23005938",
      "titulo": "BreedingPro: a browser-based platform for diallel crosses, mating designs, genetic parameters and prediction in plant and animal breeding",
      "manual": "https://luisangelbg.github.io/BreedingPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["mejoramiento genético", "dialélico", "heredabilidad", "índices de selección", "BLUP", "heterosis"],
      "es": {
        "eslogan": "De los progenitores al mejor híbrido.",
        "descripcion": "Cruzas dialélicas, diseños de apareamiento, medias generacionales, índices de selección, interacción genotipo × ambiente, modelo animal, predicción genómica y de híbridos, para mejoramiento vegetal y animal.",
        "caracteristicas": [
          "Griffing, Hayman–Jinks y Gardner–Eberhart.",
          "Heredabilidad, heterosis e índices de selección.",
          "Interacción G×A: AMMI y estabilidad.",
          "BLUP y predicción genómica."
        ]
      },
      "en": {
        "eslogan": "From the parents to the best hybrid.",
        "descripcion": "Diallel crosses, mating designs, generation means, selection indices, genotype × environment interaction, the animal model, and genomic and hybrid prediction, for plant and animal breeding.",
        "caracteristicas": [
          "Griffing, Hayman–Jinks and Gardner–Eberhart.",
          "Heritability, heterosis and selection indices.",
          "G×E interaction: AMMI and stability.",
          "BLUP and genomic prediction."
        ]
      }
    },
    {
      "id": "PopGeneticsPro",
      "categoria": "genetica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PopGeneticsPro/",
      "repo": "https://github.com/luisangelbg/PopGeneticsPro",
      "logo": "img/suite/popgeneticspro.svg",
      "version": "1.0.1",
      "fecha": "2026-09-14",
      "doi": "10.5281/zenodo.22740171",
      "titulo": "PopGeneticsPro: a browser-based platform for plant population genetics with codominant, dominant, sequence and morphological data",
      "manual": "https://luisangelbg.github.io/PopGeneticsPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["genética de poblaciones", "marcadores", "microsatélites", "SNP", "AMOVA", "diversidad genética"],
      "es": {
        "eslogan": "Genética de poblaciones de plantas, del campo al artículo.",
        "descripcion": "Microsatélites, SNP, isoenzimas, bandas AFLP/ISSR/RAPD, secuencias y caracteres morfológicos: diversidad, Hardy–Weinberg, AMOVA y estadísticos F, distancias, agrupamiento bayesiano, redes de haplotipos e historia demográfica.",
        "caracteristicas": [
          "Marcadores codominantes, dominantes y secuencias.",
          "AMOVA jerárquico y estadísticos F.",
          "Agrupamiento bayesiano y redes de haplotipos.",
          "Sistema de apareamiento y QST vs FST."
        ]
      },
      "en": {
        "eslogan": "Plant population genetics, from the field to the paper.",
        "descripcion": "Microsatellites, SNPs, isozymes, AFLP/ISSR/RAPD bands, sequences and morphological characters: diversity, Hardy–Weinberg, AMOVA and F-statistics, distances, Bayesian clustering, haplotype networks and demographic history.",
        "caracteristicas": [
          "Codominant and dominant markers, and sequences.",
          "Hierarchical AMOVA and F-statistics.",
          "Bayesian clustering and haplotype networks.",
          "Mating system and QST vs FST."
        ]
      }
    },
    {
      "id": "GermplasmPro",
      "categoria": "genetica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/GermplasmPro/",
      "repo": "https://github.com/luisangelbg/GermplasmPro",
      "logo": "img/suite/germplasmpro.svg",
      "version": "1.0.0",
      "fecha": "2026-10-01",
      "doi": null,
      "titulo": "GermplasmPro: a browser-based platform for the day-to-day management of plant genetic resources collections",
      "manual": "https://luisangelbg.github.io/GermplasmPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["germoplasma", "banco de semillas", "recursos fitogenéticos", "pasaporte", "colección núcleo", "viabilidad"],
      "es": {
        "eslogan": "El banco de germoplasma, accesión por accesión.",
        "descripcion": "Para el trabajo diario de una colección de recursos fitogenéticos de cualquier especie y forma de conservación: pasaporte MCPD, duplicados, mapas de colecta, diversidad, vacíos de colecta, colección núcleo, viabilidad, etiquetas e informe.",
        "caracteristicas": [
          "Pasaporte MCPD v2.1 con validación y control de duplicados.",
          "Mapas, diversidad geográfica y vacíos de colecta, sin internet.",
          "Colección núcleo validada y viabilidad proyectada lote por lote.",
          "Etiquetas con QR o Code 128 e informe con MCPD y Darwin Core."
        ]
      },
      "en": {
        "eslogan": "The genebank, accession by accession.",
        "descripcion": "For the day-to-day work of a plant genetic resources collection of any species and conservation method: MCPD passport data, duplicates, collecting maps, diversity, collecting gaps, core collection, viability, labels and report.",
        "caracteristicas": [
          "MCPD v2.1 passport data with validation and duplicate control.",
          "Maps, geographic diversity and collecting gaps, with no internet.",
          "A validated core collection and viability projected lot by lot.",
          "Labels with QR or Code 128 and a report with MCPD and Darwin Core."
        ]
      }
    },
    {
      "id": "CytogeneticsPro",
      "categoria": "genetica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/CytogeneticsPro/",
      "repo": "https://github.com/luisangelbg/CytogeneticsPro",
      "logo": "img/suite/cytogeneticspro.svg",
      "version": "1.0.0",
      "fecha": "2026-11-02",
      "doi": "10.5281/zenodo.23873606",
      "titulo": "CytogeneticsPro: plant cytogenetics in the browser",
      "manual": "https://luisangelbg.github.io/CytogeneticsPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["citogenética", "cariotipo", "cromosomas", "meiosis", "ploidía", "citometría de flujo"],
      "es": {
        "eslogan": "Del conteo cromosómico al cariotipo publicable.",
        "descripcion": "Citogenética vegetal en el navegador, de la fotomicrografía al informe: medición de cromosomas, cariotipo e idiograma, asimetría, meiosis, citometría de flujo, bandeo y FISH, comparación entre taxones y simuladores para la docencia.",
        "caracteristicas": [
          "Medición sobre la imagen, cariotipo, fórmula e idiograma a escala.",
          "Asimetría, meiosis con configuraciones esperadas y citometría de flujo.",
          "Bandeo y FISH, distancias, ACP y evolución del número sobre un árbol.",
          "Simuladores de mitosis y meiosis, ejercicios, informe y .zip reproducible."
        ]
      },
      "en": {
        "eslogan": "From the chromosome count to the publishable karyotype.",
        "descripcion": "Plant cytogenetics in the browser, from the photomicrograph to the report: chromosome measurement, karyotype and idiogram, asymmetry, meiosis, flow cytometry, banding and FISH, comparison among taxa and teaching simulators.",
        "caracteristicas": [
          "Measurement on the image, karyotype, formula and a to-scale idiogram.",
          "Asymmetry, meiosis with the expected configurations and flow cytometry.",
          "Banding and FISH, distances, PCA and chromosome-number evolution on a tree.",
          "Mitosis and meiosis simulators, exercises, report and a reproducible .zip."
        ]
      }
    },
    {
      "id": "BioModellingPro",
      "nombre": "BioModelling Pro",
      "categoria": "biogeografia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/BioModellingPro/",
      "repo": "https://github.com/luisangelbg/BioModellingPro",
      "logo": "img/suite/biomodellingpro.svg",
      "version": "1.1.1",
      "fecha": "2026-09-23",
      "doi": "10.5281/zenodo.22907825",
      "titulo": "BioModelling Pro: biogeography and species distribution modelling in the browser",
      "manual": "https://luisangelbg.github.io/BioModellingPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["distribución de especies", "biogeografía", "coordenadas", "GBIF", "mapas"],
      "es": {
        "eslogan": "De los registros al mapa de idoneidad.",
        "descripcion": "Registros de presencia, variables bioclimáticas, de clima y de suelo, y diez algoritmos de distribución de especies con un ensamble, validación, umbrales y proyecciones a escenarios climáticos.",
        "caracteristicas": [
          "Registros de presencia abiertos y su depuración.",
          "Máxima entropía y otros nueve algoritmos, más ensamble.",
          "Validación, umbrales e importancia de variables.",
          "Proyección a escenarios de cambio climático."
        ]
      },
      "en": {
        "eslogan": "From the records to the suitability map.",
        "descripcion": "Presence records, bioclimatic, climate and soil variables, and ten species distribution algorithms with an ensemble, validation, thresholds and projections to climate scenarios.",
        "caracteristicas": [
          "Open presence records and their cleaning.",
          "Maximum entropy and nine other algorithms, plus an ensemble.",
          "Validation, thresholds and variable importance.",
          "Projection to climate change scenarios."
        ]
      }
    },
    {
      "id": "PollinationPro",
      "categoria": "biogeografia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PollinationPro/",
      "repo": "https://github.com/luisangelbg/PollinationPro",
      "logo": "img/suite/pollinationpro.svg",
      "version": "1.2.5",
      "fecha": "2026-10-10",
      "doi": "10.5281/zenodo.23004694",
      "titulo": "PollinationPro: a browser-based platform for analysing plants, pollinators and their overlap with occurrence data",
      "manual": "https://luisangelbg.github.io/PollinationPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["polinización", "polinizadores", "coocurrencia", "fenología", "redes de interacción", "nicho"],
      "es": {
        "eslogan": "¿Coinciden la flor y su polinizador?",
        "descripcion": "Plantas, polinizadores y su solapamiento con datos de presencia: registros e interacciones publicadas, mapas, coocurrencia corregida por esfuerzo de muestreo, fenología circular, nicho ambiental, desajuste con clima futuro y redes de visitas.",
        "caracteristicas": [
          "Registros de presencia abiertos, interacciones publicadas y tus visitas.",
          "Coocurrencia de Veech con grupo objetivo y fenología circular.",
          "Nicho ambiental y desajuste planta–polinizador con clima futuro.",
          "Red de visitas contra modelos nulos, informe y paquete."
        ]
      },
      "en": {
        "eslogan": "Do the flower and its pollinator overlap?",
        "descripcion": "Plants, pollinators and their overlap with occurrence data: published records and interactions, maps, co-occurrence corrected for sampling effort, circular phenology, environmental niche, mismatch under future climate and visitation networks.",
        "caracteristicas": [
          "Open occurrence records, published interactions and your own visits.",
          "Veech co-occurrence with a target group and circular phenology.",
          "Environmental niche and plant–pollinator mismatch under future climate.",
          "Visitation network against null models, report and package."
        ]
      }
    },
    {
      "id": "PhylogenyPro",
      "categoria": "biogeografia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PhylogenyPro/",
      "repo": "https://github.com/luisangelbg/PhylogenyPro",
      "logo": "img/suite/phylogenypro.svg",
      "version": "1.4.0",
      "fecha": "2026-09-27",
      "doi": "10.5281/zenodo.23005815",
      "titulo": "PhylogenyPro: molecular phylogenetics in the browser, from the alignment to the dated tree",
      "manual": "https://luisangelbg.github.io/PhylogenyPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["filogenia", "alineamiento", "máxima verosimilitud", "inferencia bayesiana", "reloj molecular", "árbol"],
      "es": {
        "eslogan": "Del alineamiento al árbol fechado.",
        "descripcion": "Filogenia molecular completa: alineamiento, selección del modelo de sustitución, parsimonia, máxima verosimilitud e inferencia bayesiana, soporte de ramas, reloj molecular con fósiles, diversificación, caracteres y áreas ancestrales.",
        "caracteristicas": [
          "ADN, aminoácidos, codones y morfología.",
          "Parsimonia, máxima verosimilitud y MCMC bayesiano.",
          "Reloj molecular y calibración con fósiles.",
          "Reconstrucción de caracteres y áreas ancestrales."
        ]
      },
      "en": {
        "eslogan": "From the alignment to the dated tree.",
        "descripcion": "Complete molecular phylogenetics: alignment, substitution model selection, parsimony, maximum likelihood and Bayesian inference, branch support, molecular clock with fossils, diversification, ancestral characters and areas.",
        "caracteristicas": [
          "DNA, amino acids, codons and morphology.",
          "Parsimony, maximum likelihood and Bayesian MCMC.",
          "Molecular clock and fossil calibration.",
          "Reconstruction of ancestral characters and areas."
        ]
      }
    },
    {
      "id": "CladisticsPro",
      "categoria": "biogeografia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/CladisticsPro/",
      "repo": "https://github.com/luisangelbg/CladisticsPro",
      "logo": "img/suite/cladisticspro.svg",
      "version": "1.0.1",
      "fecha": "2026-10-08",
      "doi": "10.5281/zenodo.23147012",
      "titulo": "CladisticsPro: cladística morfológica en el navegador",
      "manual": "https://luisangelbg.github.io/CladisticsPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["cladística", "parsimonia", "cladograma", "caracteres morfológicos", "homología", "Bremer"],
      "es": {
        "eslogan": "Caracteres, homología y árboles.",
        "descripcion": "Cladística con caracteres morfológicos, de la matriz al cladograma diagnosticado: árboles más parsimoniosos por búsqueda exacta, TBR y ratchet, pesos implícitos, cada cambio sobre su rama, apoyo de Bremer, consensos y pruebas de hipótesis.",
        "caracteristicas": [
          "Matriz morfológica con inaplicables, continuos e imágenes.",
          "Búsqueda exacta, TBR, ratchet y pesos implícitos.",
          "Cada cambio sobre su rama, editable con el ratón.",
          "Bremer, remuestreos, consensos y pruebas de hipótesis."
        ]
      },
      "en": {
        "eslogan": "Characters, homology and trees.",
        "descripcion": "Cladistics with morphological characters, from the matrix to the diagnosed cladogram: most parsimonious trees by exact search, TBR and ratchet, implied weights, every change on its branch, Bremer support, consensus trees and hypothesis tests.",
        "caracteristicas": [
          "Morphological matrix with inapplicables, continuous characters and images.",
          "Exact search, TBR, ratchet and implied weights.",
          "Every change on its branch, editable with the mouse.",
          "Bremer support, resampling, consensus trees and hypothesis tests."
        ]
      }
    },
    {
      "id": "PalynoPro",
      "categoria": "biogeografia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PalynoPro/",
      "repo": "https://github.com/luisangelbg/PalynoPro",
      "logo": "img/suite/palynopro.svg",
      "version": "1.0.0",
      "fecha": "2026-11-02",
      "doi": "10.5281/zenodo.23883213",
      "titulo": "PalynoPro: quantitative pollen morphometry from electron micrographs",
      "manual": "https://luisangelbg.github.io/PalynoPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["polen", "palinología", "morfometría", "microscopía electrónica", "imágenes", "fertilidad"],
      "es": {
        "eslogan": "De la micrografía electrónica a la clave polínica.",
        "descripcion": "Morfometría polínica cuantitativa en micrografías electrónicas de barrido, de la carpeta de imágenes al informe: calibración, contorno, espinas, retículo y textura, fertilidad en las panorámicas y análisis estadístico con el grano como unidad.",
        "caracteristicas": [
          "Calibración por la magnificación, comprobada contra la barra de escala.",
          "Cuerpo sin espinas, anchos de Feret, espinas, lúmenes del retículo y textura.",
          "Fertilidad en las panorámicas por la solidez del cuerpo, con intervalos de Wilson.",
          "ANOVA, PERMANOVA, discriminante y bosque aleatorio con el grano como unidad."
        ]
      },
      "en": {
        "eslogan": "From the electron micrograph to the pollen key.",
        "descripcion": "Quantitative pollen morphometry on scanning electron micrographs, from the image folder to the report: calibration, outline, spines, reticulum and texture, fertility in the overview images and statistics with the grain as the unit.",
        "caracteristicas": [
          "Calibration by the magnification, checked against the scale bar.",
          "Body without spines, Feret widths, spines, reticulum lumina and texture.",
          "Fertility in the overview images by body solidity, with Wilson intervals.",
          "ANOVA, PERMANOVA, discriminant analysis and random forest with the grain as the unit."
        ]
      }
    },
    {
      "id": "FloralPro",
      "categoria": "botanica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/FloralPro/",
      "repo": "https://github.com/luisangelbg/FloralPro",
      "logo": "img/suite/floralpro.svg",
      "version": "1.0.0",
      "fecha": "2026-09-19",
      "doi": null,
      "titulo": "FloralPro: la flor, verticilo por verticilo — a browser-based app for teaching floral structure, floral formulas and floral diagrams",
      "manual": null,
      "envio": "largo",
      "palabras": ["flor", "morfología floral", "fórmula floral", "diagrama floral", "botánica", "docencia"],
      "es": {
        "eslogan": "La flor, verticilo por verticilo.",
        "descripcion": "Para enseñar y aprender la estructura de la flor: fórmulas y diagramas florales, la flor en 3D y en corte, un atlas de verticilos, 82 familias de angiospermas con énfasis en México, clave interactiva, autoevaluación y modo clase.",
        "caracteristicas": [
          "Fórmulas y diagramas florales.",
          "82 familias de angiospermas.",
          "Clave interactiva y autoevaluación.",
          "Modo clase para proyectar e imprimir."
        ]
      },
      "en": {
        "eslogan": "The flower, whorl by whorl.",
        "descripcion": "For teaching and learning floral structure: floral formulas and diagrams, the flower in 3D and in section, an atlas of whorls, 82 angiosperm families with an emphasis on Mexico, an interactive key, self-assessment and classroom mode.",
        "caracteristicas": [
          "Floral formulas and diagrams.",
          "82 angiosperm families.",
          "Interactive key and self-assessment.",
          "Classroom mode for projecting and printing."
        ]
      }
    },
    {
      "id": "LeafPro",
      "categoria": "botanica",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/LeafPro/",
      "repo": "https://github.com/luisangelbg/LeafPro",
      "logo": "img/suite/leafpro.svg",
      "version": "1.2.0",
      "fecha": "2026-10-14",
      "doi": null,
      "titulo": "LeafPro: la hoja, carácter por carácter — a browser-based app for teaching leaf morphology",
      "manual": null,
      "envio": "largo",
      "palabras": ["hoja", "morfología foliar", "filotaxia", "anatomía", "botánica", "docencia"],
      "es": {
        "eslogan": "La hoja, carácter por carácter.",
        "descripcion": "Morfología de la hoja para el aula: partes, haz y envés con un corte anatómico interactivo, filotaxia con simulador del ángulo de oro, un atlas de más de 140 términos ilustrados y un constructor de hojas con descripción botánica.",
        "caracteristicas": [
          "Corte anatómico interactivo.",
          "Atlas de más de 140 términos ilustrados.",
          "Constructor de hojas con descripción redactada.",
          "Autoevaluación generativa y modo clase."
        ]
      },
      "en": {
        "eslogan": "The leaf, character by character.",
        "descripcion": "Leaf morphology for the classroom: parts, upper and lower surfaces with an interactive anatomical section, phyllotaxis with a golden-angle simulator, an atlas of more than 140 illustrated terms and a leaf builder with a botanical description.",
        "caracteristicas": [
          "Interactive anatomical section.",
          "Atlas of more than 140 illustrated terms.",
          "Leaf builder with a written description.",
          "Generative self-assessment and classroom mode."
        ]
      }
    },
    {
      "id": "SciMetricsPro",
      "categoria": "ciencia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/SciMetricsPro/",
      "repo": "https://github.com/luisangelbg/SciMetricsPro",
      "logo": "img/suite/scimetricspro.svg",
      "version": "1.0.1",
      "fecha": "2026-09-21",
      "doi": "10.5281/zenodo.22879993",
      "titulo": "SciMetricsPro: a browser-based platform for bibliometric and scientometric analysis",
      "manual": "https://luisangelbg.github.io/SciMetricsPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["bibliometría", "cienciometría", "revisión sistemática", "PRISMA", "coautoría", "citas"],
      "es": {
        "eslogan": "De tu búsqueda bibliográfica a un artículo bibliométrico.",
        "descripcion": "Importa las exportaciones de las bases de datos, une duplicados, normaliza autores, instituciones y países, calcula los indicadores clásicos, dibuja las estructuras conceptual, intelectual y social y registra una revisión sistemática PRISMA 2020.",
        "caracteristicas": [
          "Lee exportaciones de las principales bases.",
          "Redes de coautoría, cocitación y temas.",
          "Diagrama PRISMA 2020.",
          "Texto metodológico redactado con tus datos."
        ]
      },
      "en": {
        "eslogan": "From your literature search to a bibliometric paper.",
        "descripcion": "Import the exports of the bibliographic databases, merge duplicates, normalize authors, institutions and countries, compute the classical indicators, map the conceptual, intellectual and social structures and record a PRISMA 2020 systematic review.",
        "caracteristicas": [
          "Reads exports from the main databases.",
          "Co-authorship, co-citation and topic networks.",
          "PRISMA 2020 flow diagram.",
          "Methods text written with your data."
        ]
      }
    },
    {
      "id": "ReviewPro",
      "categoria": "ciencia",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/ReviewPro/",
      "repo": "https://github.com/luisangelbg/ReviewPro",
      "logo": "img/suite/reviewpro.svg",
      "version": "1.0.0",
      "fecha": "2026-10-01",
      "doi": null,
      "titulo": "ReviewPro: a browser-based platform for narrative, scoping and systematic review articles and meta-analysis",
      "manual": "https://luisangelbg.github.io/ReviewPro/manual/es/manual-completo.html",
      "envio": "largo",
      "palabras": ["revisión sistemática", "meta-análisis", "PRISMA", "riesgo de sesgo", "cribado", "artículo de revisión"],
      "es": {
        "eslogan": "Del montón de artículos a una revisión que se sostiene.",
        "descripcion": "Un artículo de revisión de principio a fin, narrativo, exploratorio, sistemático o con meta-análisis: protocolo, búsqueda, cribado con acuerdo entre revisores, PRISMA, extracción, riesgo de sesgo con GRADE, meta-análisis multinivel y escritura orientada.",
        "caracteristicas": [
          "Protocolo con PRISMA-P y plantillas de registro PROSPERO y OSF.",
          "Cribado priorizado, regla de paro y acuerdo entre revisores.",
          "Riesgo de sesgo, GRADE y meta-análisis multinivel de tres niveles.",
          "Escritura orientada con verificador de afirmaciones, informe y paquete."
        ]
      },
      "en": {
        "eslogan": "From a pile of papers to a review that holds up.",
        "descripcion": "A review article from start to finish, narrative, scoping, systematic or with meta-analysis: protocol, search, screening with inter-reviewer agreement, PRISMA, extraction, risk of bias with GRADE, multilevel meta-analysis and guided writing.",
        "caracteristicas": [
          "Protocol with PRISMA-P and PROSPERO and OSF registration templates.",
          "Prioritized screening, stopping rule and inter-reviewer agreement.",
          "Risk of bias, GRADE and three-level multilevel meta-analysis.",
          "Guided writing with a claim checker, report and package."
        ]
      }
    }
  ]
};
