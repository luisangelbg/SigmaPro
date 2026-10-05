/* Generado por node tools/fundamentos/indice.mjs a partir de data/fundamentos/<id>.js — no se edita a mano. */
window.SP_FUNDAMENTOS_INDICE = {
 "ammi": {
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Separa la interacción genotipo × ambiente en unos pocos ejes, para ver qué genotipos y ambientes interactúan y cuáles genotipos son estables.",
   "alias": [
    "Modelo AMMI",
    "Efectos principales aditivos e interacción multiplicativa",
    "Biplot AMMI",
    "WAAS"
   ]
  },
  "en": {
   "paraQue": "Splits the genotype × environment interaction into a few axes, to see which genotypes and environments interact and which genotypes are stable.",
   "alias": [
    "AMMI model",
    "Additive main effects and multiplicative interaction",
    "AMMI biplot",
    "WAAS"
   ]
  }
 },
 "ancova": {
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos quitando el efecto de una variable medida en cada parcela que no controlaste y que influye en la respuesta, como el número de plantas.",
   "alias": [
    "ANCOVA",
    "Análisis de covarianza",
    "Análisis de covariancia",
    "Ajuste por covariable"
   ]
  },
  "en": {
   "paraQue": "Compares treatments removing the effect of a variable measured in each plot that you did not control and that influences the response, such as the number of plants.",
   "alias": [
    "ANCOVA",
    "Analysis of covariance",
    "Covariance analysis",
    "Covariate adjustment"
   ]
  }
 },
 "arima": {
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Modela cómo depende cada valor de una serie de los anteriores y de su ciclo estacional, y pronostica los siguientes con su intervalo.",
   "alias": [
    "Box-Jenkins",
    "SARIMA",
    "Modelo autorregresivo integrado de medias móviles",
    "Pronóstico de series de tiempo"
   ]
  },
  "en": {
   "paraQue": "Models how each value of a series depends on the previous ones and on its seasonal cycle, and forecasts the next ones with their interval.",
   "alias": [
    "Box-Jenkins",
    "SARIMA",
    "Autoregressive integrated moving average model",
    "Time series forecasting"
   ]
  }
 },
 "ascenso-pronunciado": {
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "superficie"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta un plano a un factorial con puntos centrales y te dice en qué dirección mover las dosis para acercarte pronto a la mejor respuesta.",
   "alias": [
    "Ascenso más pronunciado",
    "Método de máxima pendiente",
    "Modelo de primer orden",
    "Steepest ascent"
   ]
  },
  "en": {
   "paraQue": "Fits a plane to a factorial with center points and tells you in which direction to move the rates to approach the best response quickly.",
   "alias": [
    "Steepest ascent",
    "Method of steepest ascent",
    "First-order model",
    "Steepest descent"
   ]
  }
 },
 "autocorrelacion": {
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide cuánto se parece cada valor de una serie de tiempo a los anteriores y prueba si la serie se comporta como datos independientes.",
   "alias": [
    "ACF y PACF",
    "Correlograma",
    "Prueba de Ljung-Box",
    "Prueba de Box-Pierce"
   ]
  },
  "en": {
   "paraQue": "Measures how much each value of a time series resembles the previous ones and tests whether the series behaves like independent data.",
   "alias": [
    "ACF and PACF",
    "Correlogram",
    "Ljung-Box test",
    "Box-Pierce test"
   ]
  }
 },
 "bib": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "bib"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando cada bloque homogéneo solo tiene lugar para algunos de ellos, con un arreglo en que cada par de tratamientos coincide el mismo número de veces.",
   "alias": [
    "Bloques incompletos balanceados",
    "BIB",
    "Análisis intrabloque",
    "BIBD"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when each homogeneous block only has room for some of them, with a layout in which every pair of treatments occurs together the same number of times.",
   "alias": [
    "Balanced incomplete blocks",
    "BIB",
    "Intrablock analysis",
    "BIBD"
   ]
  }
 },
 "bondad-ajuste": {
  "familia": "descriptiva",
  "respuesta": "categorica",
  "estructura": "una-muestra",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si las frecuencias observadas de las categorías siguen una proporción esperada, por ejemplo la segregación 9:3:3:1 de un cruzamiento dihíbrido.",
   "alias": [
    "Prueba ji cuadrada de bondad de ajuste",
    "Ji cuadrada de Pearson para una muestra",
    "Prueba de segregación",
    "Bondad de ajuste a una proporción"
   ]
  },
  "en": {
   "paraQue": "Tests whether the observed frequencies of the categories follow an expected ratio, for example the 9:3:3:1 segregation of a dihybrid cross.",
   "alias": [
    "Chi-square goodness of fit test",
    "Pearson's one-sample chi-square test",
    "Segregation test",
    "Goodness of fit to a ratio"
   ]
  }
 },
 "comparaciones-medias": {
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca",
   "latino",
   "parcelas",
   "bib",
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Después del análisis de varianza, dice qué tratamientos difieren entre sí y los agrupa con letras.",
   "alias": [
    "Pruebas de comparación múltiple",
    "Prueba de Tukey",
    "Separación de medias",
    "Pruebas post hoc"
   ]
  },
  "en": {
   "paraQue": "After the analysis of variance, tells which treatments differ from each other and groups them with letters.",
   "alias": [
    "Multiple comparison tests",
    "Tukey test",
    "Mean separation",
    "Post hoc tests"
   ]
  }
 },
 "componentes-varianza": {
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": [
   "muestreo",
   "dbca",
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Estima cuánta de la variación total de una respuesta se debe a cada fuente aleatoria (localidades, parcelas, plantas, evaluadores) y prueba si cada una aporta.",
   "alias": [
    "Componentes de varianza",
    "Partición de la varianza",
    "Estimación REML de varianzas",
    "Modelo de efectos aleatorios"
   ]
  },
  "en": {
   "paraQue": "Estimates how much of the total variation of a response is due to each random source (locations, plots, plants, raters) and tests whether each one contributes.",
   "alias": [
    "Variance components",
    "Variance partitioning",
    "REML variance estimation",
    "Random-effects model"
   ]
  }
 },
 "contrastes": {
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca",
   "latino",
   "parcelas",
   "bib",
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba comparaciones que planeaste antes del experimento, como el testigo contra el resto o un grupo de productos contra otro.",
   "alias": [
    "Contrastes ortogonales",
    "Contrastes planeados",
    "Comparaciones planeadas",
    "Contrastes lineales"
   ]
  },
  "en": {
   "paraQue": "Tests comparisons you planned before the experiment, such as the control versus the rest or one group of products versus another.",
   "alias": [
    "Orthogonal contrasts",
    "Planned contrasts",
    "Planned comparisons",
    "Linear contrasts"
   ]
  }
 },
 "correlacion-parcial": {
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide la relación entre dos variables después de quitarles el efecto de otras que influyen en ambas.",
   "alias": [
    "Correlación parcial",
    "Correlación semiparcial",
    "Correlación parcial de Pearson",
    "Correlación parcial de Spearman"
   ]
  },
  "en": {
   "paraQue": "Measures the relationship between two variables after removing the effect of others that influence both.",
   "alias": [
    "Partial correlation",
    "Semipartial correlation",
    "Pearson partial correlation",
    "Spearman partial correlation"
   ]
  }
 },
 "correlacion": {
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide qué tan fuerte y en qué sentido cambian juntas dos variables numéricas, y si esa relación es más que azar.",
   "alias": [
    "Correlación de Pearson",
    "Correlación de Spearman",
    "Tau de Kendall",
    "Coeficiente de correlación"
   ]
  },
  "en": {
   "paraQue": "Measures how strongly and in which direction two numeric variables change together, and whether that relationship is more than chance.",
   "alias": [
    "Pearson correlation",
    "Spearman correlation",
    "Kendall’s tau",
    "Correlation coefficient"
   ]
  }
 },
 "cox": {
  "familia": "supervivencia",
  "respuesta": "tiempo-evento",
  "estructura": "continua",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide cuántas veces más rápido (o más lento) ocurre un evento con cada tratamiento o por cada unidad de una covariable, aprovechando también las unidades que no lo tuvieron.",
   "alias": [
    "Regresión de Cox",
    "Modelo de riesgos proporcionales",
    "Modelo semiparamétrico de supervivencia"
   ]
  },
  "en": {
   "paraQue": "Measures how many times faster (or slower) an event occurs with each treatment or per unit of a covariate, also using the units that did not have it.",
   "alias": [
    "Cox regression",
    "Proportional hazards model",
    "Semiparametric survival model"
   ]
  }
 },
 "cuadro-latino": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "latino"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando el terreno o el material cambia en dos direcciones a la vez, quitando las dos con hileras y columnas.",
   "alias": [
    "Cuadro latino",
    "Diseño en cuadro latino",
    "Bloqueo en dos direcciones",
    "Latin square"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when the field or the material changes in two directions at once, removing both with rows and columns.",
   "alias": [
    "Latin square",
    "Latin square design",
    "Two-way blocking"
   ]
  }
 },
 "curva-crecimiento": {
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "dca",
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta una curva en forma de S al crecimiento en el tiempo (altura, biomasa, área foliar) para estimar el valor máximo, cuándo se crece más rápido y si las curvas de los tratamientos difieren.",
   "alias": [
    "Curva logística",
    "Modelo de Gompertz",
    "Modelo de Weibull",
    "Regresión no lineal de crecimiento"
   ]
  },
  "en": {
   "paraQue": "Fits an S-shaped curve to growth over time (height, biomass, leaf area) to estimate the maximum value, when growth is fastest and whether the treatment curves differ.",
   "alias": [
    "Logistic curve",
    "Gompertz model",
    "Weibull model",
    "Nonlinear growth regression"
   ]
  }
 },
 "dbca": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando el terreno o el material experimental cambia de un lugar a otro, quitando esa variación con bloques.",
   "alias": [
    "ANOVA en bloques",
    "Diseño en bloques completos al azar",
    "DBCA",
    "RCBD"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when the field or the experimental material changes from place to place, removing that variation with blocks.",
   "alias": [
    "Randomized complete block ANOVA",
    "Randomized complete block design",
    "RCBD"
   ]
  }
 },
 "dca": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos asignados por sorteo a unidades experimentales parecidas entre sí, como macetas en una cámara o cajas de germinación.",
   "alias": [
    "ANOVA de una o más vías",
    "Diseño completamente al azar",
    "DCA",
    "CRD"
   ]
  },
  "en": {
   "paraQue": "Compares treatments randomly assigned to experimental units that are alike, such as pots in a growth chamber or germination boxes.",
   "alias": [
    "One-way or factorial ANOVA",
    "Completely randomized design",
    "CRD"
   ]
  }
 },
 "descomposicion": {
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Separa una serie de tiempo en su tendencia de largo plazo, su ciclo estacional (cada año, cada semana) y lo que queda sin explicar.",
   "alias": [
    "Descomposición clásica",
    "Tendencia y estacionalidad",
    "Componente estacional",
    "Media móvil centrada"
   ]
  },
  "en": {
   "paraQue": "Splits a time series into its long-term trend, its seasonal cycle (every year, every week) and what is left unexplained.",
   "alias": [
    "Classical decomposition",
    "Trend and seasonality",
    "Seasonal component",
    "Centered moving average"
   ]
  }
 },
 "descriptivos": {
  "familia": "descriptiva",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Resume cada variable numérica con su centro, su dispersión, su forma y sus intervalos de confianza, en total o por grupos.",
   "alias": [
    "Estadística descriptiva",
    "Resumen numérico",
    "Medidas de tendencia central y de dispersión"
   ]
  },
  "en": {
   "paraQue": "Summarizes each numeric variable by its center, spread, shape and confidence intervals, overall or by groups.",
   "alias": [
    "Descriptive statistics",
    "Numerical summary",
    "Measures of central tendency and spread"
   ]
  }
 },
 "deseabilidad": {
  "familia": "superficies",
  "respuesta": "multivariada",
  "estructura": "continua",
  "disenos": [
   "superficie"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Busca la combinación de factores que deja a varias respuestas a la vez lo más cerca posible de lo que quieres: una alta, otra baja y otra en un valor meta.",
   "alias": [
    "Función de deseabilidad",
    "Optimización de varias respuestas",
    "Deseabilidad de Derringer y Suich"
   ]
  },
  "en": {
   "paraQue": "Searches for the combination of factors that brings several responses at once as close as possible to what you want: one high, another low and another at a target value.",
   "alias": [
    "Desirability function",
    "Multiple response optimization",
    "Derringer-Suich desirability"
   ]
  }
 },
 "discriminante": {
  "familia": "multivariado",
  "respuesta": "multivariada",
  "estructura": "k-grupos",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Encuentra la combinación de variables que mejor separa grupos conocidos y mide qué tan bien clasifica cada unidad en su grupo.",
   "alias": [
    "Análisis discriminante lineal",
    "Discriminante de Fisher",
    "LDA",
    "Funciones discriminantes canónicas"
   ]
  },
  "en": {
   "paraQue": "Finds the combination of variables that best separates known groups and measures how well each unit is classified into its group.",
   "alias": [
    "Linear discriminant analysis",
    "Fisher’s discriminant",
    "LDA",
    "Canonical discriminant functions"
   ]
  }
 },
 "diseno-superficie": {
  "familia": "superficies",
  "respuesta": "ninguna",
  "estructura": "ninguna",
  "disenos": [
   "superficie"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Arma la lista de corridas de un diseño para superficie de respuesta o para mezclas, en unidades codificadas y originales, en orden al azar y lista para capturar la respuesta.",
   "alias": [
    "Generador de diseños de superficie",
    "Diseño central compuesto",
    "Diseño Box-Behnken",
    "Simplex-látice y simplex-centroide"
   ]
  },
  "en": {
   "paraQue": "Builds the list of runs of a response surface or mixture design, in coded and original units, in random order and ready for recording the response.",
   "alias": [
    "Response surface design generator",
    "Central composite design",
    "Box-Behnken design",
    "Simplex-lattice and simplex-centroid designs"
   ]
  }
 },
 "dos-etapas": {
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Combina los ensayos de varios ambientes dando a cada media el peso que merece según su precisión; sirve cuando los errores difieren entre ambientes o faltan genotipos.",
   "alias": [
    "Análisis por etapas",
    "Análisis ponderado de medias",
    "Análisis en dos etapas con una varianza por ambiente"
   ]
  },
  "en": {
   "paraQue": "Combines trials from several environments giving each mean the weight it deserves according to its precision; useful when errors differ among environments or genotypes are missing.",
   "alias": [
    "Stage-wise analysis",
    "Weighted analysis of means",
    "Two-stage analysis with one variance per environment"
   ]
  }
 },
 "dosis-respuesta": {
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "dca",
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Describe cómo baja una respuesta (peso seco, crecimiento) al aumentar la dosis de un herbicida, fungicida o tóxico, y estima las dosis que causan el 10, el 50 y el 90 % del efecto.",
   "alias": [
    "Log-logístico",
    "Curva dosis-respuesta",
    "DE50",
    "Modelo de Brain-Cousens"
   ]
  },
  "en": {
   "paraQue": "Describes how a response (dry weight, growth) falls as the dose of a herbicide, fungicide or toxicant increases, and estimates the doses causing 10, 50 and 90% of the effect.",
   "alias": [
    "Log-logistic",
    "Dose-response curve",
    "ED50",
    "Brain-Cousens model"
   ]
  }
 },
 "ensayos-multiambiente": {
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza juntos los ensayos de los mismos genotipos en varias localidades o años para saber si difieren y si su orden cambia de un ambiente a otro.",
   "alias": [
    "Análisis combinado de experimentos",
    "Análisis conjunto",
    "Ensayos en varias localidades",
    "Interacción genotipo × ambiente"
   ]
  },
  "en": {
   "paraQue": "Analyzes together the trials of the same genotypes at several locations or years to find out whether they differ and whether their ranking changes from one environment to another.",
   "alias": [
    "Combined analysis of experiments",
    "Combined analysis",
    "Multi-location trials",
    "Genotype × environment interaction"
   ]
  }
 },
 "estabilidad": {
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide qué tan estable es cada genotipo a través de los ambientes con varios índices clásicos, para recomendar los que rinden bien y de forma predecible.",
   "alias": [
    "Parámetros de estabilidad",
    "Regresión de Eberhart y Russell",
    "Ecovalencia de Wricke",
    "Varianza de estabilidad de Shukla"
   ]
  },
  "en": {
   "paraQue": "Measures how stable each genotype is across environments with several classical indices, to recommend those that yield well and predictably.",
   "alias": [
    "Stability parameters",
    "Eberhart and Russell regression",
    "Wricke's ecovalence",
    "Shukla's stability variance"
   ]
  }
 },
 "franjas": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": [
   "parcelas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza experimentos de dos factores aplicados en franjas que se cruzan dentro de cada bloque, con un error para cada factor y otro para su interacción.",
   "alias": [
    "Parcelas en franjas",
    "Bloques divididos",
    "Franjas cruzadas",
    "Strip plot"
   ]
  },
  "en": {
   "paraQue": "Analyzes two-factor experiments applied in strips that cross within each block, with one error for each factor and another for their interaction.",
   "alias": [
    "Strip plot",
    "Strip-block design",
    "Split block"
   ]
  }
 },
 "frecuencias": {
  "familia": "descriptiva",
  "respuesta": "categorica",
  "estructura": "ninguna",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Cuenta cuántas observaciones caen en cada categoría de un factor, o en cada combinación de dos factores, con sus porcentajes.",
   "alias": [
    "Tabla de frecuencias",
    "Tabla cruzada",
    "Distribución de frecuencias",
    "Tabulación cruzada"
   ]
  },
  "en": {
   "paraQue": "Counts how many observations fall in each category of a factor, or in each combination of two factors, with their percentages.",
   "alias": [
    "Frequency table",
    "Cross-tabulation",
    "Frequency distribution",
    "Two-way table"
   ]
  }
 },
 "friedman": {
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tres o más tratamientos en bloques completos usando los rangos dentro de cada bloque, sin suponer normalidad.",
   "alias": [
    "Prueba de Friedman",
    "Análisis de varianza de dos vías por rangos",
    "W de Kendall",
    "Prueba de Conover para bloques"
   ]
  },
  "en": {
   "paraQue": "Compares three or more treatments in complete blocks using the ranks within each block, without assuming normality.",
   "alias": [
    "Friedman test",
    "Two-way analysis of variance on ranks",
    "Kendall's W",
    "Conover test for blocks"
   ]
  }
 },
 "gge": {
  "familia": "multiambiente",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Resume en un biplot el efecto del genotipo junto con su interacción con el ambiente, para ver quién ganó dónde, qué genotipos son altos y estables y qué ambientes discriminan mejor.",
   "alias": [
    "Biplot GGE",
    "Genotipo más interacción genotipo × ambiente",
    "Quién ganó dónde",
    "Megaambientes"
   ]
  },
  "en": {
   "paraQue": "Summarizes in a biplot the genotype effect together with its interaction with the environment, to see which won where, which genotypes are high-yielding and stable and which environments discriminate best.",
   "alias": [
    "GGE biplot",
    "Genotype plus genotype × environment",
    "Which-won-where",
    "Mega-environments"
   ]
  }
 },
 "glm-conteos": {
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "bloques",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando la respuesta es un conteo (insectos, lesiones, plántulas) con una distribución hecha para conteos, en lugar de transformar los datos.",
   "alias": [
    "GLM de Poisson",
    "Regresión de Poisson",
    "GLM binomial negativo",
    "Modelo para conteos"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when the response is a count (insects, lesions, seedlings) with a distribution built for counts, instead of transforming the data.",
   "alias": [
    "Poisson GLM",
    "Poisson regression",
    "Negative binomial GLM",
    "Count model"
   ]
  }
 },
 "glm-gamma": {
  "familia": "generalizados",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando la respuesta es positiva y asimétrica (tiempos, concentraciones, pesos) y su variación crece con la media.",
   "alias": [
    "GLM gamma",
    "Regresión gamma",
    "GLM gaussiano inverso"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when the response is positive and skewed (times, concentrations, weights) and its variation grows with the mean.",
   "alias": [
    "Gamma GLM",
    "Gamma regression",
    "Inverse Gaussian GLM"
   ]
  }
 },
 "glm-proporciones": {
  "familia": "generalizados",
  "respuesta": "proporcion",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos cuando la respuesta es cuántos de n tuvieron éxito (semillas germinadas, plantas enfermas, insectos muertos) o un sí o no por individuo.",
   "alias": [
    "Regresión logística",
    "GLM binomial",
    "Modelo logit",
    "Análisis de proporciones"
   ]
  },
  "en": {
   "paraQue": "Compares treatments when the response is how many out of n succeeded (germinated seeds, diseased plants, dead insects) or a yes or no per individual.",
   "alias": [
    "Logistic regression",
    "Binomial GLM",
    "Logit model",
    "Analysis of proportions"
   ]
  }
 },
 "glm": {
  "familia": "generalizados",
  "respuesta": "binaria",
  "estructura": "continua",
  "disenos": [
   "dca",
   "dbca",
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta un modelo lineal generalizado con los términos que tú escribas (factores, covariables, interacciones, anidamientos) y la familia que elijas.",
   "alias": [
    "Modelo lineal generalizado",
    "GLM",
    "Regresión logística con covariables",
    "Regresión de Poisson con covariables"
   ]
  },
  "en": {
   "paraQue": "Fits a generalized linear model with the terms you write (factors, covariates, interactions, nesting) and the family you choose.",
   "alias": [
    "Generalized linear model",
    "GLM",
    "Logistic regression with covariates",
    "Poisson regression with covariates"
   ]
  }
 },
 "glmm-bloques": {
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "bloques",
  "disenos": [
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tratamientos con conteos o proporciones cuando los bloques son una muestra de muchos posibles y se tratan como efectos aleatorios.",
   "alias": [
    "GLMM en bloques",
    "Modelo lineal generalizado mixto",
    "GLMM de Poisson",
    "GLMM binomial"
   ]
  },
  "en": {
   "paraQue": "Compares treatments with counts or proportions when the blocks are a sample of many possible ones and are treated as random effects.",
   "alias": [
    "GLMM in blocks",
    "Generalized linear mixed model",
    "Poisson GLMM",
    "Binomial GLMM"
   ]
  }
 },
 "glmm": {
  "familia": "generalizados",
  "respuesta": "conteo",
  "estructura": "aleatorios",
  "disenos": [
   "dbca",
   "parcelas",
   "latice",
   "medidas-repetidas",
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta un modelo lineal generalizado mixto con la fórmula que escribas: efectos fijos y efectos aleatorios como en lme4, por ejemplo (1 | bloque).",
   "alias": [
    "GLMM",
    "Modelo lineal generalizado mixto",
    "Modelo mixto generalizado",
    "GLMM binomial negativo"
   ]
  },
  "en": {
   "paraQue": "Fits a generalized linear mixed model with the formula you write: fixed effects and random effects as in lme4, for example (1 | bloque).",
   "alias": [
    "GLMM",
    "Generalized linear mixed model",
    "Generalized mixed model",
    "Negative binomial GLMM"
   ]
  }
 },
 "heredabilidad": {
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": [
   "dca",
   "dbca",
   "latice",
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Estima qué parte de la variación entre genotipos es genética, predice el valor de cada genotipo (BLUP) y calcula la ganancia esperada al seleccionar a los mejores.",
   "alias": [
    "Heredabilidad en sentido amplio",
    "H²",
    "BLUP de genotipos",
    "Ganancia por selección"
   ]
  },
  "en": {
   "paraQue": "Estimates how much of the variation among genotypes is genetic, predicts the value of each genotype (BLUP) and computes the expected gain from selecting the best ones.",
   "alias": [
    "Broad-sense heritability",
    "H²",
    "Genotype BLUPs",
    "Selection gain"
   ]
  }
 },
 "kaplan-meier": {
  "familia": "supervivencia",
  "respuesta": "tiempo-evento",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Describe cuánto tardan las unidades en tener un evento (germinar, morir, florecer), aunque algunas terminen el ensayo sin tenerlo, y compara esas curvas entre tratamientos.",
   "alias": [
    "Curvas de supervivencia",
    "Estimador producto-límite",
    "Prueba log-rank",
    "Análisis del tiempo hasta un evento"
   ]
  },
  "en": {
   "paraQue": "Describes how long units take to experience an event (germinate, die, flower), even when some finish the trial without it, and compares those curves among treatments.",
   "alias": [
    "Survival curves",
    "Product-limit estimator",
    "Log-rank test",
    "Time-to-event analysis"
   ]
  }
 },
 "kappa": {
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "dos-grupos",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide qué tanto coinciden dos evaluadores (o dos métodos) al clasificar los mismos casos, descontando las coincidencias que se darían por azar.",
   "alias": [
    "Kappa de Cohen",
    "Kappa ponderada",
    "Concordancia entre evaluadores",
    "Acuerdo entre observadores"
   ]
  },
  "en": {
   "paraQue": "Measures how much two raters (or two methods) agree when classifying the same cases, discounting the agreement expected by chance.",
   "alias": [
    "Cohen’s kappa",
    "Weighted kappa",
    "Inter-rater agreement",
    "Observer agreement"
   ]
  }
 },
 "kruskal-wallis": {
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara tres o más grupos independientes por los rangos de sus datos, sin suponer normalidad, y dice cuáles difieren con comparaciones por pares y letras.",
   "alias": [
    "Prueba H de Kruskal-Wallis",
    "Análisis de varianza de un factor por rangos",
    "Prueba de Dunn",
    "Comparaciones de Conover-Iman y de Nemenyi"
   ]
  },
  "en": {
   "paraQue": "Compares three or more independent groups through the ranks of their data, without assuming normality, and tells which ones differ with pairwise comparisons and letters.",
   "alias": [
    "Kruskal-Wallis H test",
    "One-way analysis of variance on ranks",
    "Dunn's test",
    "Conover-Iman and Nemenyi comparisons"
   ]
  }
 },
 "latice": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara muchos tratamientos, como los genotipos de un ensayo de mejoramiento, en bloques incompletos pequeños agrupados en repeticiones completas, con medias ajustadas por bloque.",
   "alias": [
    "Látice",
    "Alfa-látice",
    "Bloques incompletos resolubles",
    "Lattice"
   ]
  },
  "en": {
   "paraQue": "Compares many treatments, such as the genotypes of a breeding trial, in small incomplete blocks grouped into complete replicates, with block-adjusted means.",
   "alias": [
    "Lattice",
    "Alpha-lattice",
    "Resolvable incomplete blocks"
   ]
  }
 },
 "manova": {
  "familia": "multivariado",
  "respuesta": "multivariada",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si los tratamientos cambian a la vez varias variables respuesta medidas en las mismas unidades.",
   "alias": [
    "MANOVA",
    "Análisis de varianza multivariado",
    "Traza de Pillai",
    "Lambda de Wilks"
   ]
  },
  "en": {
   "paraQue": "Tests whether treatments change several response variables measured on the same units at once.",
   "alias": [
    "MANOVA",
    "Multivariate analysis of variance",
    "Pillai’s trace",
    "Wilks’ lambda"
   ]
  }
 },
 "mantel-haenszel": {
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "bloques",
  "disenos": [
   "dbca",
   "muestreo"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si dos variables categóricas están asociadas cuando los datos vienen de varios estratos (lotes, sitios, años) y resume esa asociación en una razón de momios común.",
   "alias": [
    "Prueba de Cochran-Mantel-Haenszel",
    "Razón de momios común de Mantel-Haenszel",
    "Prueba de Breslow-Day",
    "Tablas 2 × 2 estratificadas"
   ]
  },
  "en": {
   "paraQue": "Tests whether two categorical variables are associated when the data come from several strata (lots, sites, years) and summarizes that association in a common odds ratio.",
   "alias": [
    "Cochran-Mantel-Haenszel test",
    "Mantel-Haenszel common odds ratio",
    "Breslow-Day test",
    "Stratified 2 × 2 tables"
   ]
  }
 },
 "matriz-correlacion": {
  "familia": "correlacion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Calcula de una vez la correlación entre cada par de varias variables numéricas y ajusta los valores p por hacer muchas pruebas.",
   "alias": [
    "Matriz de correlaciones",
    "Correlaciones múltiples por pares",
    "Mapa de calor de correlaciones"
   ]
  },
  "en": {
   "paraQue": "Computes at once the correlation between every pair of several numeric variables and adjusts the p-values for running many tests.",
   "alias": [
    "Correlation matrix",
    "Pairwise correlations",
    "Correlation heat map"
   ]
  }
 },
 "mcnemar": {
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "dos-grupos",
  "disenos": [
   "medidas-repetidas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si cambia una clasificación cuando los mismos casos se clasifican dos veces: antes y después, o con dos métodos.",
   "alias": [
    "Prueba de McNemar",
    "Prueba de simetría de Bowker",
    "Ji cuadrada para datos pareados",
    "Proporciones correlacionadas"
   ]
  },
  "en": {
   "paraQue": "Tests whether a classification changes when the same cases are classified twice: before and after, or with two methods.",
   "alias": [
    "McNemar test",
    "Bowker symmetry test",
    "Chi-square for paired data",
    "Correlated proportions"
   ]
  }
 },
 "medias-ajustadas": {
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca",
   "latino",
   "bib",
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Da la media de cada tratamiento corregida por los bloques, las parcelas perdidas o los bloques incompletos, con su error estándar e intervalo de confianza.",
   "alias": [
    "Medias marginales estimadas",
    "Medias de mínimos cuadrados",
    "LS means",
    "EMMeans"
   ]
  },
  "en": {
   "paraQue": "Gives the mean of each treatment corrected for blocks, missing plots or incomplete blocks, with its standard error and confidence interval.",
   "alias": [
    "Estimated marginal means",
    "Least-squares means",
    "LS means",
    "EMMeans"
   ]
  }
 },
 "medidas-repetidas": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": [
   "medidas-repetidas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza la misma planta, parcela o animal medido en varias fechas, modelando la correlación entre fechas con la estructura de covarianza que mejor se ajusta.",
   "alias": [
    "Medidas repetidas en el tiempo",
    "Mediciones repetidas con estructuras de covarianza",
    "Mínimos cuadrados generalizados (gls)",
    "Datos longitudinales"
   ]
  },
  "en": {
   "paraQue": "Analyzes the same plant, plot or animal measured on several dates, modeling the correlation between dates with the covariance structure that fits best.",
   "alias": [
    "Repeated measures over time",
    "Repeated measurements with covariance structures",
    "Generalized least squares (gls)",
    "Longitudinal data"
   ]
  }
 },
 "mejores-subconjuntos": {
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Revisa todas las combinaciones de predictores y da las mejores de cada tamaño, para elegir un modelo sencillo que explique bien la respuesta.",
   "alias": [
    "Todas las regresiones posibles",
    "Selección exhaustiva de variables",
    "Best subsets",
    "Cp de Mallows"
   ]
  },
  "en": {
   "paraQue": "Checks every combination of predictors and gives the best ones of each size, to choose a simple model that explains the response well.",
   "alias": [
    "All possible regressions",
    "Exhaustive variable selection",
    "Best subsets",
    "Mallows’ Cp"
   ]
  }
 },
 "mezclas": {
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "superficie"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza respuestas que dependen de las proporciones de los componentes de una mezcla (sustratos, raciones, formulaciones) y encuentra la mejor mezcla.",
   "alias": [
    "Experimentos con mezclas",
    "Modelos de Scheffé",
    "Polinomios canónicos de Scheffé",
    "Diseños simplex"
   ]
  },
  "en": {
   "paraQue": "Analyzes responses that depend on the proportions of the components of a mixture (substrates, rations, formulations) and finds the best mixture.",
   "alias": [
    "Mixture experiments",
    "Scheffé models",
    "Scheffé canonical polynomials",
    "Simplex designs"
   ]
  }
 },
 "mixto-bloques": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza un experimento en bloques completos al azar con los bloques como efecto aleatorio, lo que aprovecha la información entre bloques cuando se pierden parcelas.",
   "alias": [
    "Bloques completos al azar con bloques aleatorios",
    "DBCA mixto",
    "RCBD con bloques aleatorios"
   ]
  },
  "en": {
   "paraQue": "Analyzes a randomized complete block experiment with blocks as a random effect, which uses the information between blocks when plots are lost.",
   "alias": [
    "Randomized complete blocks with random blocks",
    "Mixed-model RCBD",
    "RCBD with random blocks"
   ]
  }
 },
 "mixto-divididas": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": [
   "parcelas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza parcelas divididas (o subdivididas) como modelo mixto: el factor de la parcela grande se prueba contra la variación entre parcelas grandes y el de la subparcela contra la de las subparcelas.",
   "alias": [
    "Parcelas divididas con modelo mixto",
    "Parcelas subdivididas con modelo mixto",
    "Split-plot mixto"
   ]
  },
  "en": {
   "paraQue": "Analyzes split plots (or split-split plots) as a mixed model: the main-plot factor is tested against the variation among main plots and the subplot factor against that of the subplots.",
   "alias": [
    "Split plot with a mixed model",
    "Split-split plot with a mixed model",
    "Mixed-model split plot"
   ]
  }
 },
 "mixto-latice": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "bloques",
  "disenos": [
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza un látice o alfa-látice con los bloques incompletos como efecto aleatorio, para que las medias de los tratamientos recuperen la información que hay entre bloques.",
   "alias": [
    "Látice con recuperación de la información entre bloques",
    "Alfa-látice mixto",
    "Bloques incompletos aleatorios"
   ]
  },
  "en": {
   "paraQue": "Analyzes a lattice or alpha lattice with the incomplete blocks as a random effect, so that the treatment means recover the information between blocks.",
   "alias": [
    "Lattice with recovery of inter-block information",
    "Mixed-model alpha lattice",
    "Random incomplete blocks"
   ]
  }
 },
 "mixto-localidades": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "ambientes",
  "disenos": [
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara genotipos evaluados en varias localidades (o años) con repeticiones, con las localidades y la interacción genotipo × localidad como efectos aleatorios.",
   "alias": [
    "Ensayos multilocalidad con modelo mixto",
    "Análisis combinado con localidades aleatorias",
    "Ensayos regionales"
   ]
  },
  "en": {
   "paraQue": "Compares genotypes evaluated at several locations (or years) with replicates, with locations and the genotype × location interaction as random effects.",
   "alias": [
    "Multi-location trials with a mixed model",
    "Combined analysis with random locations",
    "Regional trials"
   ]
  }
 },
 "modelo-lineal": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": [
   "dca",
   "dbca",
   "latino",
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta cualquier modelo lineal de efectos fijos escrito como fórmula, para los análisis que no encajan en un diseño del catálogo.",
   "alias": [
    "Modelo lineal general",
    "ANOVA con fórmula",
    "Mínimos cuadrados ordinarios",
    "lm de R"
   ]
  },
  "en": {
   "paraQue": "Fits any fixed-effects linear model written as a formula, for analyses that do not fit a design in the catalog.",
   "alias": [
    "General linear model",
    "ANOVA from a formula",
    "Ordinary least squares",
    "R lm"
   ]
  }
 },
 "modelo-mixto": {
  "familia": "mixtos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": [
   "dbca",
   "parcelas",
   "latice",
   "multiambiente"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta un modelo con efectos fijos (los tratamientos que te interesan) y efectos aleatorios (bloques, parcelas, plantas, años) escrito como fórmula.",
   "alias": [
    "Modelo lineal mixto",
    "Modelo de efectos mixtos",
    "LMM",
    "lmer"
   ]
  },
  "en": {
   "paraQue": "Fits a model with fixed effects (the treatments you care about) and random effects (blocks, plots, plants, years) written as a formula.",
   "alias": [
    "Linear mixed model",
    "Mixed-effects model",
    "LMM",
    "lmer"
   ]
  }
 },
 "muestreo-estratificado": {
  "familia": "potencia",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "muestreo"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Estima la media y el total de una población dividida en estratos (huertas, lotes, regiones, tipos de suelo), pesando cada estrato por su tamaño, y propone cómo repartir una muestra nueva entre ellos.",
   "alias": [
    "Muestreo aleatorio estratificado",
    "Media y total por estratos",
    "Asignación de Neyman"
   ]
  },
  "en": {
   "paraQue": "Estimates the mean and total of a population divided into strata (orchards, fields, regions, soil types), weighting each stratum by its size, and proposes how to allocate a new sample among them.",
   "alias": [
    "Stratified random sampling",
    "Mean and total by strata",
    "Neyman allocation"
   ]
  }
 },
 "muestreo-simple": {
  "familia": "potencia",
  "respuesta": "continua",
  "estructura": "una-muestra",
  "disenos": [
   "muestreo"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Estima la media (o la proporción) y el total de una población a partir de una muestra tomada al azar, con su error estándar y su intervalo de confianza.",
   "alias": [
    "Muestreo aleatorio simple",
    "Estimación de la media y el total",
    "Corrección por población finita"
   ]
  },
  "en": {
   "paraQue": "Estimates the mean (or proportion) and the total of a population from a random sample, with its standard error and confidence interval.",
   "alias": [
    "Simple random sampling",
    "Estimation of the mean and total",
    "Finite population correction"
   ]
  }
 },
 "parcelas-divididas": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": [
   "parcelas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza experimentos de dos factores en los que uno se aplica a parcelas grandes y el otro a subparcelas dentro de ellas, con un error para cada tamaño de parcela.",
   "alias": [
    "Parcelas divididas",
    "Diseño de parcelas divididas",
    "ANOVA con dos errores",
    "Split plot"
   ]
  },
  "en": {
   "paraQue": "Analyzes two-factor experiments in which one factor is applied to main plots and the other to subplots within them, with one error for each plot size.",
   "alias": [
    "Split plot",
    "Split-plot design",
    "ANOVA with two error terms"
   ]
  }
 },
 "parcelas-subdivididas": {
  "familia": "disenos",
  "respuesta": "continua",
  "estructura": "parcelas",
  "disenos": [
   "parcelas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Analiza experimentos de tres factores aplicados en tres tamaños de parcela anidados (grandes, subparcelas y sub-subparcelas), con un error para cada tamaño.",
   "alias": [
    "Parcelas subdivididas",
    "Diseño de parcelas sub-subdivididas",
    "ANOVA con tres errores",
    "Split-split plot"
   ]
  },
  "en": {
   "paraQue": "Analyzes three-factor experiments applied on three nested plot sizes (main plots, subplots and sub-subplots), with one error for each size.",
   "alias": [
    "Split-split plot",
    "Split-split-plot design",
    "ANOVA with three error terms"
   ]
  }
 },
 "polinomios": {
  "familia": "comparaciones",
  "respuesta": "continua",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca",
   "latino",
   "parcelas",
   "bib",
   "latice"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Describe cómo cambia la respuesta con la dosis (recta, curva con un máximo…) dentro del análisis de varianza del experimento y estima la dosis óptima.",
   "alias": [
    "Polinomios ortogonales",
    "Contrastes de tendencia",
    "Análisis de tendencia",
    "Componentes lineal, cuadrático y cúbico"
   ]
  },
  "en": {
   "paraQue": "Describes how the response changes with the rate (straight line, curve with a maximum…) within the analysis of variance of the experiment and estimates the optimum rate.",
   "alias": [
    "Orthogonal polynomials",
    "Trend contrasts",
    "Trend analysis",
    "Linear, quadratic and cubic components"
   ]
  }
 },
 "potencia-anova": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "k-grupos",
  "disenos": [
   "dca"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántas repeticiones por tratamiento necesita un análisis de varianza para detectar las diferencias que esperas entre varias medias, o qué potencia tiene con las repeticiones que ya planeaste.",
   "alias": [
    "Potencia del ANOVA de una vía",
    "Repeticiones por tratamiento",
    "power.anova.test"
   ]
  },
  "en": {
   "paraQue": "Calculates how many replicates per treatment an analysis of variance needs to detect the differences you expect among several means, or how much power it has with the replicates you already planned.",
   "alias": [
    "One-way ANOVA power",
    "Replicates per treatment",
    "power.anova.test"
   ]
  }
 },
 "potencia-correlacion": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántos pares de observaciones necesitas para detectar una correlación de cierto tamaño, qué potencia tienes con los pares que hay o qué correlación alcanzarías a detectar.",
   "alias": [
    "Potencia para una correlación",
    "Tamaño de muestra para una correlación",
    "pwr.r.test"
   ]
  },
  "en": {
   "paraQue": "Calculates how many pairs of observations you need to detect a correlation of a given size, how much power you have with the pairs available, or what correlation you could detect.",
   "alias": [
    "Power for a correlation",
    "Sample size for a correlation",
    "pwr.r.test"
   ]
  }
 },
 "potencia-medias": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "dos-grupos",
  "disenos": [
   "dca"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántas unidades por grupo necesitas para detectar una diferencia entre dos medias, qué potencia tiene un ensayo ya planeado o qué diferencia alcanzaría a detectar.",
   "alias": [
    "Potencia de la prueba t",
    "Tamaño de muestra para comparar dos medias",
    "power.t.test"
   ]
  },
  "en": {
   "paraQue": "Calculates how many units per group you need to detect a difference between two means, how much power an already planned trial has, or what difference it could detect.",
   "alias": [
    "t-test power",
    "Sample size to compare two means",
    "power.t.test"
   ]
  }
 },
 "potencia-proporciones": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "dos-grupos",
  "disenos": [
   "dca"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántas unidades por grupo necesitas para distinguir dos porcentajes (germinación, sobrevivencia, incidencia), o qué potencia tienes con un número dado.",
   "alias": [
    "Potencia para dos proporciones",
    "Tamaño de muestra para comparar dos porcentajes",
    "power.prop.test"
   ]
  },
  "en": {
   "paraQue": "Calculates how many units per group you need to tell two percentages apart (germination, survival, incidence), or how much power you have with a given number.",
   "alias": [
    "Power for two proportions",
    "Sample size to compare two percentages",
    "power.prop.test"
   ]
  }
 },
 "proporciones": {
  "familia": "descriptiva",
  "respuesta": "proporcion",
  "estructura": "k-grupos",
  "disenos": [
   "ninguno",
   "muestreo"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Estima qué proporción de las unidades cumple una condición (germinó, murió, está enferma) y da su intervalo de confianza con hasta seis métodos.",
   "alias": [
    "Intervalo de confianza de una proporción",
    "Intervalo de Wilson",
    "Intervalo exacto de Clopper-Pearson",
    "Proporción binomial"
   ]
  },
  "en": {
   "paraQue": "Estimates what proportion of the units meets a condition (germinated, died, is diseased) and gives its confidence interval with up to six methods.",
   "alias": [
    "Confidence interval for a proportion",
    "Wilson interval",
    "Clopper-Pearson exact interval",
    "Binomial proportion"
   ]
  }
 },
 "prueba-t": {
  "familia": "pruebas-t",
  "respuesta": "continua",
  "estructura": "dos-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara la media de dos grupos, de dos mediciones de las mismas unidades o de una muestra contra un valor de referencia, con el tamaño del efecto.",
   "alias": [
    "Prueba t de Student",
    "Prueba t de Welch",
    "Prueba t pareada",
    "Prueba t de una muestra"
   ]
  },
  "en": {
   "paraQue": "Compares the mean of two groups, of two measurements on the same units or of one sample against a reference value, with the effect size.",
   "alias": [
    "Student's t test",
    "Welch's t test",
    "Paired t test",
    "One-sample t test"
   ]
  }
 },
 "regresion-lineal": {
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide cómo cambia una respuesta con una o varias variables numéricas y permite predecirla, con el diagnóstico completo del modelo.",
   "alias": [
    "Regresión lineal múltiple",
    "Regresión por mínimos cuadrados",
    "Modelo de regresión lineal",
    "Regresión simple"
   ]
  },
  "en": {
   "paraQue": "Measures how a response changes with one or several numeric variables and lets you predict it, with full model diagnostics.",
   "alias": [
    "Multiple linear regression",
    "Least-squares regression",
    "Linear regression model",
    "Simple regression"
   ]
  }
 },
 "regresion-polinomial": {
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta una curva (cuadrática, cúbica o cuártica) a una respuesta que no sigue una recta y encuentra su máximo o su mínimo.",
   "alias": [
    "Regresión cuadrática",
    "Regresión cúbica",
    "Curva de respuesta polinomial",
    "Regresión de segundo grado"
   ]
  },
  "en": {
   "paraQue": "Fits a curve (quadratic, cubic or quartic) to a response that does not follow a straight line and finds its maximum or minimum.",
   "alias": [
    "Quadratic regression",
    "Cubic regression",
    "Polynomial response curve",
    "Second-degree regression"
   ]
  }
 },
 "repetibilidad": {
  "familia": "geneticos",
  "respuesta": "continua",
  "estructura": "aleatorios",
  "disenos": [
   "medidas-repetidas"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Mide qué tanto se parecen las medidas repetidas de un mismo individuo (árbol, planta, animal) y cuántas medidas hacen falta para conocer su valor permanente.",
   "alias": [
    "Repetibilidad",
    "Coeficiente de repetibilidad",
    "Correlación intraclase",
    "Valor permanente"
   ]
  },
  "en": {
   "paraQue": "Measures how alike the repeated measurements of the same individual (tree, plant, animal) are and how many measurements are needed to know its permanent value.",
   "alias": [
    "Repeatability",
    "Repeatability coefficient",
    "Intraclass correlation",
    "Permanent value"
   ]
  }
 },
 "repeticiones": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántas repeticiones poner en un experimento a partir del coeficiente de variación esperado y de la diferencia entre tratamientos que te interesa detectar, en porcentaje de la media.",
   "alias": [
    "Número de repeticiones (Cochran y Cox)",
    "Repeticiones con el coeficiente de variación",
    "Fórmula de Cochran y Cox"
   ]
  },
  "en": {
   "paraQue": "Calculates how many replicates to use in an experiment from the expected coefficient of variation and the difference between treatments you want to detect, as a percentage of the mean.",
   "alias": [
    "Number of replicates (Cochran and Cox)",
    "Replicates from the coefficient of variation",
    "Cochran and Cox formula"
   ]
  }
 },
 "respuesta-meseta": {
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "dca",
   "dbca",
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Ajusta la respuesta del rendimiento a la dosis de un fertilizante o de riego que sube y luego se estabiliza, para estimar la dosis óptima, el rendimiento máximo y la dosis más rentable.",
   "alias": [
    "Lineal-meseta",
    "Cuadrático-meseta",
    "Modelo de Mitscherlich",
    "Dosis óptima de fertilización"
   ]
  },
  "en": {
   "paraQue": "Fits a yield response to a fertilizer or irrigation rate that rises and then levels off, to estimate the optimum rate, the maximum yield and the most profitable rate.",
   "alias": [
    "Linear-plateau",
    "Quadratic-plateau",
    "Mitscherlich model",
    "Optimum fertilizer rate"
   ]
  }
 },
 "seleccion-pasos": {
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Elige de forma automática qué predictores conservar en una regresión, agregando o quitando uno a la vez.",
   "alias": [
    "Regresión paso a paso",
    "Selección stepwise",
    "Eliminación hacia atrás",
    "Selección hacia adelante"
   ]
  },
  "en": {
   "paraQue": "Automatically chooses which predictors to keep in a regression, adding or removing one at a time.",
   "alias": [
    "Stepwise regression",
    "Stepwise selection",
    "Backward elimination",
    "Forward selection"
   ]
  }
 },
 "superficie-respuesta": {
  "familia": "superficies",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": [
   "superficie"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Encuentra la combinación de dosis o niveles de varios factores cuantitativos que da la mejor respuesta, con un modelo cuadrático ajustado a un diseño central compuesto o Box-Behnken.",
   "alias": [
    "Metodología de superficie de respuesta",
    "Modelo de segundo orden",
    "MSR",
    "RSM"
   ]
  },
  "en": {
   "paraQue": "Finds the combination of rates or levels of several quantitative factors that gives the best response, with a quadratic model fitted to a central composite or Box-Behnken design.",
   "alias": [
    "Response surface methodology",
    "Second-order model",
    "RSM"
   ]
  }
 },
 "supuestos": {
  "familia": "supuestos",
  "respuesta": "continua",
  "estructura": "factorial",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Revisa en los residuos de tu experimento si se cumplen los supuestos del análisis de varianza y te dice qué hacer si alguno falla.",
   "alias": [
    "Diagnóstico de residuos",
    "Revisión de los supuestos del ANOVA",
    "Pruebas de normalidad y de homogeneidad de varianzas"
   ]
  },
  "en": {
   "paraQue": "Checks in the residuals of your experiment whether the assumptions of the analysis of variance hold and tells you what to do if one fails.",
   "alias": [
    "Residual diagnostics",
    "Checking ANOVA assumptions",
    "Normality and homogeneity of variance tests"
   ]
  }
 },
 "tabla-contingencia": {
  "familia": "contingencia",
  "respuesta": "categorica",
  "estructura": "k-grupos",
  "disenos": [
   "dca",
   "muestreo"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si dos variables categóricas están asociadas, dónde está la diferencia y qué tan fuerte es.",
   "alias": [
    "Prueba de ji cuadrada de independencia",
    "Prueba exacta de Fisher",
    "Tabla cruzada",
    "Medidas de asociación"
   ]
  },
  "en": {
   "paraQue": "Tests whether two categorical variables are associated, where the difference lies and how strong it is.",
   "alias": [
    "Chi-square test of independence",
    "Fisher’s exact test",
    "Cross-tabulation",
    "Measures of association"
   ]
  }
 },
 "tamano-muestra": {
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "una-muestra",
  "disenos": [
   "muestreo"
  ],
  "ejemplo": false,
  "es": {
   "paraQue": "Calcula cuántas plantas, frutos, árboles o parcelas debes muestrear para estimar una media o una proporción con el error máximo que aceptas.",
   "alias": [
    "Tamaño de muestra para estimar",
    "Tamaño de muestra de Cochran",
    "Tamaño de muestra con población finita"
   ]
  },
  "en": {
   "paraQue": "Calculates how many plants, fruits, trees or plots you should sample to estimate a mean or a proportion within the maximum error you accept.",
   "alias": [
    "Sample size for estimation",
    "Cochran’s sample size",
    "Sample size with a finite population"
   ]
  }
 },
 "tendencia": {
  "familia": "supervivencia",
  "respuesta": "serie",
  "estructura": "ninguna",
  "disenos": [
   "ninguno"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Prueba si una variable medida en el tiempo tiende a subir o a bajar, sin suponer normalidad ni una recta, y estima cuánto cambia por paso de tiempo.",
   "alias": [
    "Prueba de Mann-Kendall",
    "Pendiente de Sen",
    "Estimador de Theil-Sen",
    "Prueba de tendencia no paramétrica"
   ]
  },
  "en": {
   "paraQue": "Tests whether a variable measured over time tends to rise or fall, without assuming normality or a straight line, and estimates how much it changes per time step.",
   "alias": [
    "Mann-Kendall test",
    "Sen’s slope",
    "Theil-Sen estimator",
    "Nonparametric trend test"
   ]
  }
 },
 "wilcoxon": {
  "familia": "no-parametricas",
  "respuesta": "continua",
  "estructura": "dos-grupos",
  "disenos": [
   "dca",
   "dbca"
  ],
  "ejemplo": true,
  "es": {
   "paraQue": "Compara dos grupos, dos mediciones pareadas o una muestra contra un valor usando rangos, sin suponer normalidad, y estima el desplazamiento con Hodges-Lehmann.",
   "alias": [
    "Prueba de rangos con signo de Wilcoxon",
    "Prueba U de Mann-Whitney",
    "Suma de rangos de Wilcoxon",
    "Estimador de Hodges-Lehmann"
   ]
  },
  "en": {
   "paraQue": "Compares two groups, two paired measurements or one sample against a value using ranks, without assuming normality, and estimates the shift with Hodges-Lehmann.",
   "alias": [
    "Wilcoxon signed-rank test",
    "Mann-Whitney U test",
    "Wilcoxon rank-sum test",
    "Hodges-Lehmann estimator"
   ]
  }
 }
};
