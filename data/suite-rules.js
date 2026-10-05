/* SigmaPro — dónde se sugiere cada app de la suite LABG (LABGSuggest) y por qué.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El criterio: se sugiere una app solo cuando continúa el trabajo del análisis que tienes delante (planear el diseño,
   explorar muchas variables, reducir dimensiones, agrupar), nunca como publicidad. Cada regla dice dónde aparece:
     «metodos»   en el resultado de esos análisis (bloque Análisis) y en el apartado 9 de su ficha de Fundamentos
     «familias»  en la franja «Herramientas relacionadas» al pie de esa familia en el catálogo de Fundamentos
     «datos»     en el bloque Datos, cuando la tabla cargada tiene esa estructura
   «motivo» es la frase de por qué conviene ahí. Va como .js (contenido JSON) para que funcione con doble clic. */
window.SP_SUITE_REGLAS = {
  "motivos": {
    "AgriDesign-diseno": {
      "es": "Genera la aleatorización, el croquis y la hoja de campo de tu diseño antes de analizar.",
      "en": "Generates the randomization, the field map and the field book of your design before you analyze."
    },
    "AgriDesign-planear": {
      "es": "Calcula repeticiones y potencia y genera el croquis aleatorizado del ensayo que vas a sembrar.",
      "en": "Computes replicates and power and generates the randomized field map of the trial you are about to sow."
    },
    "CorrelationPro-relaciones": {
      "es": "Explora y visualiza las relaciones entre muchas variables a la vez.",
      "en": "Explores and visualizes the relationships among many variables at once."
    },
    "PCAPro-dimensiones": {
      "es": "Reduce las dimensiones de tus variables y revisa sus relaciones en biplots.",
      "en": "Reduces the dimensions of your variables and reviews their relationships in biplots."
    },
    "PCAPro-colinealidad": {
      "es": "Con predictores muy correlacionados (VIF alto), los componentes principales los resumen en ejes independientes.",
      "en": "With highly correlated predictors (high VIF), principal components summarize them in independent axes."
    },
    "ClusteringPro-grupos": {
      "es": "Clasifica genotipos, sitios o individuos en grupos con distancias, dendrogramas y su validación.",
      "en": "Classifies genotypes, sites or individuals into groups with distances, dendrograms and their validation."
    },
    "BioModellingPro-mapas": {
      "es": "Con coordenadas puedes mapear tus sitios, extraer variables de clima y suelo y modelar la distribución de una especie.",
      "en": "With coordinates you can map your sites, extract climate and soil variables and model a species distribution."
    },
    "PhenologyPro-clima": {
      "es": "Con fechas y clima diario calcula grados día, evapotranspiración, etapas fenológicas y riesgo de heladas.",
      "en": "With dates and daily weather it computes degree-days, evapotranspiration, phenological stages and frost risk."
    },
    "ClusteringPro-discriminante": {
      "es": "Busca primero los grupos naturales de tus datos y valida si los separa el discriminante.",
      "en": "First find the natural groups in your data and check whether the discriminant separates them."
    }
  },
  "metodos": {
    "dca": [["AgriDesign", "AgriDesign-diseno"]],
    "dbca": [["AgriDesign", "AgriDesign-diseno"]],
    "cuadro-latino": [["AgriDesign", "AgriDesign-diseno"]],
    "parcelas-divididas": [["AgriDesign", "AgriDesign-diseno"]],
    "parcelas-subdivididas": [["AgriDesign", "AgriDesign-diseno"]],
    "franjas": [["AgriDesign", "AgriDesign-diseno"]],
    "bib": [["AgriDesign", "AgriDesign-diseno"]],
    "latice": [["AgriDesign", "AgriDesign-diseno"]],
    "mixto-latice": [["AgriDesign", "AgriDesign-diseno"]],
    "mixto-bloques": [["AgriDesign", "AgriDesign-diseno"]],
    "mixto-divididas": [["AgriDesign", "AgriDesign-diseno"]],
    "repeticiones": [["AgriDesign", "AgriDesign-planear"]],
    "potencia-anova": [["AgriDesign", "AgriDesign-planear"]],
    "correlacion": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-dimensiones"]],
    "matriz-correlacion": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-dimensiones"]],
    "correlacion-parcial": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-dimensiones"]],
    "regresion-lineal": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-colinealidad"]],
    "seleccion-pasos": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-colinealidad"]],
    "mejores-subconjuntos": [["CorrelationPro", "CorrelationPro-relaciones"], ["PCAPro", "PCAPro-colinealidad"]],
    "manova": [["PCAPro", "PCAPro-dimensiones"], ["ClusteringPro", "ClusteringPro-grupos"]],
    "discriminante": [["ClusteringPro", "ClusteringPro-discriminante"], ["PCAPro", "PCAPro-dimensiones"]],
    "ammi": [["ClusteringPro", "ClusteringPro-grupos"], ["PCAPro", "PCAPro-dimensiones"]],
    "gge": [["ClusteringPro", "ClusteringPro-grupos"], ["PCAPro", "PCAPro-dimensiones"]],
    "estabilidad": [["ClusteringPro", "ClusteringPro-grupos"]],
    "ensayos-multiambiente": [["ClusteringPro", "ClusteringPro-grupos"]]
  },
  "familias": {
    "disenos": ["AgriDesign"],
    "comparaciones": ["AgriDesign"],
    "potencia": ["AgriDesign"],
    "correlacion": ["CorrelationPro", "PCAPro"],
    "regresion": ["CorrelationPro", "PCAPro"],
    "multivariado": ["PCAPro", "ClusteringPro"],
    "multiambiente": ["ClusteringPro", "PCAPro"]
  },
  "datos": [
    { "si": "diseno", "app": "AgriDesign", "motivo": "AgriDesign-diseno",
      "explica": { "es": "La tabla tiene tratamientos y bloques o repeticiones.", "en": "The table has treatments and blocks or replicates." } },
    { "si": "muchasNumericas", "minimo": 8, "app": "PCAPro", "motivo": "PCAPro-dimensiones",
      "explica": { "es": "La tabla tiene {n} variables numéricas.", "en": "The table has {n} numeric variables." } },
    { "si": "muchasNumericas", "minimo": 8, "app": "CorrelationPro", "motivo": "CorrelationPro-relaciones",
      "explica": { "es": "La tabla tiene {n} variables numéricas.", "en": "The table has {n} numeric variables." } },
    { "si": "muchasNumericas", "minimo": 8, "app": "ClusteringPro", "motivo": "ClusteringPro-grupos",
      "explica": { "es": "La tabla tiene {n} variables numéricas.", "en": "The table has {n} numeric variables." } },
    { "si": "coordenadas", "app": "BioModellingPro", "motivo": "BioModellingPro-mapas",
      "explica": { "es": "La tabla tiene columnas de latitud y longitud.", "en": "The table has latitude and longitude columns." } },
    { "si": "fechas", "app": "PhenologyPro", "motivo": "PhenologyPro-clima",
      "explica": { "es": "La tabla tiene fechas.", "en": "The table has dates." } }
  ]
};
