/* SigmaPro — las apps hermanas de la suite LABG (las tarjetas «Explora la suite LABG» y las sugerencias LABGSuggest).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un solo lugar para editar: agregar una app es agregar una entrada a «apps» (y su logo en img/suite/). Va como .js y
   no como .json porque con doble clic (file://) el navegador no deja leer archivos de datos; el contenido es JSON.
   Fuentes (4 oct 2026): codemeta.json, CITATION.cff y README.md de cada repositorio en https://github.com/luisangelbg,
   en su último commit publicado. Las características copian lo que dicen esos archivos; nada se agrega por cuenta
   propia. Los campos «PENDIENTE» esperan a que la app tenga repositorio público. */
window.SP_SUITE = {
  "actualizado": "2026-10-04",
  "portal": "https://luisangelbg.github.io/",
  "autor": { "nombre": "Luis Ángel Barrera-Guzmán", "familia": "Barrera-Guzmán", "dado": "Luis Ángel", "orcid": "0000-0001-8057-2583" },
  "apps": [
    {
      "id": "PCAPro",
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
      "id": "AgriDesign",
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
      "id": "CorrelationPro",
      "estado": "pendiente",
      "url": "PENDIENTE",
      "repo": "PENDIENTE",
      "logo": "img/suite/correlationpro.svg",
      "version": "PENDIENTE",
      "fecha": "PENDIENTE",
      "doi": "PENDIENTE",
      "titulo": "PENDIENTE",
      "manual": "PENDIENTE",
      "envio": "numericas",
      "palabras": ["correlación", "Pearson", "Spearman", "matriz de correlación", "asociación", "variables"],
      "es": {
        "eslogan": "PENDIENTE",
        "descripcion": "PENDIENTE: la app aún no tiene repositorio público; sus datos se completan al publicarla.",
        "caracteristicas": []
      },
      "en": {
        "eslogan": "PENDING",
        "descripcion": "PENDING: the app does not have a public repository yet; its details will be filled in when it is published.",
        "caracteristicas": []
      }
    },
    {
      "id": "BioModellingPro",
      "nombre": "BioModelling Pro",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/BioModellingPro/",
      "repo": "https://github.com/luisangelbg/BioModellingPro",
      "logo": "img/suite/biomodellingpro.svg",
      "version": "1.1.1",
      "fecha": "2026-09-23",
      "doi": "10.5281/zenodo.22907825",
      "titulo": "BioModelling Pro: biogeography and species distribution modelling in the browser",
      "manual": null,
      "envio": "largo",
      "palabras": ["distribución de especies", "biogeografía", "coordenadas", "GBIF", "mapas"],
      "es": { "eslogan": "Biogeografía y modelado de la distribución de especies, en tu navegador.", "descripcion": "Registros de presencia, variables bioclimáticas, de clima y de suelo, y diez algoritmos de distribución de especies con mapas y validación.", "caracteristicas": [] },
      "en": { "eslogan": "Biogeography and species distribution modelling, in your browser.", "descripcion": "Presence records, bioclimatic, climate and soil variables, and ten species distribution algorithms with maps and validation.", "caracteristicas": [] }
    },
    {
      "id": "PhenologyPro",
      "destacada": false,
      "estado": "publicada",
      "url": "https://luisangelbg.github.io/PhenologyPro/",
      "repo": "https://github.com/luisangelbg/PhenologyPro",
      "logo": "img/suite/phenologypro.svg",
      "version": "1.1.0",
      "fecha": "2026-09-30",
      "doi": "10.5281/zenodo.23004710",
      "titulo": "PhenologyPro: a browser-based platform for agroclimatology and crop phenology",
      "manual": null,
      "envio": "largo",
      "palabras": ["fenología", "grados día", "evapotranspiración", "clima", "fechas", "riego"],
      "es": { "eslogan": "Agroclimatología y fenología de cultivos, sin escribir código.", "descripcion": "Grados día, evapotranspiración, balance hídrico, riego, etapas fenológicas, horas frío, climogramas y riesgo de heladas.", "caracteristicas": [] },
      "en": { "eslogan": "Agroclimatology and crop phenology, without writing code.", "descripcion": "Degree-days, evapotranspiration, water balance, irrigation, phenological stages, winter chill, climographs and frost risk.", "caracteristicas": [] }
    }
  ]
};
