SP_FICHA({
  "id": "cox",
  "familia": "supervivencia",
  "respuesta": "tiempo-evento",
  "estructura": "continua",
  "disenos": ["dca", "dbca"],
  "relacionados": ["kaplan-meier", "glm-proporciones", "glm", "regresion-lineal", "glmm-bloques"],
  "ejemplo": { "conjunto": "frijol-germinacion", "entradas": { "tiempo": "dias", "evento": "germino", "factores": ["tratamiento"], "covariables": ["peso_semilla"] }, "opciones": { "empates": "efron" } },
  "formato": {
    "largo": [["tratamiento", "lote", "peso_semilla", "dias", "germino"], ["Testigo", "L1", "0.439", "19", "1"], ["Testigo", "L2", "0.435", "15", "1"], ["Testigo", "L3", "0.365", "4", "1"], ["Testigo", "L1", "0.363", "10", "1"], ["Testigo", "L2", "0.28", "1", "1"], ["Testigo", "L3", "0.456", "21", "0"], ["Testigo", "L1", "0.467", "3", "1"], ["Testigo", "L2", "0.409", "6", "1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Regresión de Cox", "Modelo de riesgos proporcionales", "Modelo semiparamétrico de supervivencia"],
    "paraQue": "Mide cuántas veces más rápido (o más lento) ocurre un evento con cada tratamiento o por cada unidad de una covariable, aprovechando también las unidades que no lo tuvieron.",
    "preguntas": [
      "¿Cuántas veces más rápido germina la semilla escarificada que el testigo, una vez descontado el peso de la semilla?",
      "¿Cambia el riesgo de muerte de las plántulas de chile por pudrición de la raíz con la variedad y con la humedad del suelo?",
      "¿Brotan antes las yemas de durazno con dos productos para romper el letargo, si cada huerta tiene su propio ritmo de brotación?"
    ],
    "teoria": [
      "El modelo de Cox relaciona el tiempo hasta un evento con tratamientos y covariables sin suponer una forma para la curva de supervivencia. Trabaja con el riesgo instantáneo: la tasa a la que ocurre el evento en un momento dado entre las unidades que aún no lo tienen. Supone que el riesgo de cada unidad es un riesgo base común, que puede tener cualquier forma en el tiempo, multiplicado por un factor que depende de sus variables. Así, cada coeficiente se convierte en una razón de riesgos (HR): un HR de 2 significa que el evento ocurre al doble de tasa en todo momento; uno de 0.5, a la mitad.",
      "Los coeficientes se estiman maximizando la verosimilitud parcial, que en cada tiempo con eventos compara a la unidad que tuvo el evento con todas las que seguían en riesgo; las censuradas participan mientras siguen en el ensayo. Los tiempos empatados, frecuentes cuando se revisa una vez al día, se tratan con la aproximación de Efron o con la de Breslow. En SigmaPro cada factor se codifica comparando cada nivel con el primero, las covariables entran con un efecto lineal y, si declaras un estrato (lote, sitio, fecha), cada estrato tiene su propio riesgo base, sin coeficiente.",
      "La app da las tres pruebas globales (razón de verosimilitudes, Wald y score), la concordancia de Harrell y la prueba de riesgos proporcionales de Grambsch y Therneau, que revisa si algún efecto cambia con el tiempo."
    ],
    "modelo": {
      "tex": "h(t \\mid \\mathbf{x}) = h_0(t) \\exp(\\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_p x_p)",
      "terminos": [
        ["h(t \\mid \\mathbf{x})", "el riesgo instantáneo del evento al tiempo t para una unidad con valores x"],
        ["h_0(t)", "el riesgo base (el de la referencia), sin forma supuesta; con estratos, uno por estrato"],
        ["x_j", "la indicadora de un nivel de un factor (frente al primer nivel) o el valor de una covariable"],
        ["\\beta_j", "el coeficiente; su exponencial es la razón de riesgos (HR)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_p = 0", "h1": "\\text{algún } \\beta_j \\ne 0", "texto": "Ningún término cambia el riesgo. Se prueba con la razón de verosimilitudes, Wald y score (log-rank), cada una con una ji cuadrada de p grados de libertad." },
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "Cada coeficiente por separado (HR = 1), con la prueba z de Wald y el intervalo de la razón de riesgos." },
      { "h0": "\\beta_j(t) = \\beta_j", "h1": "\\beta_j(t) \\text{ cambia con } t", "texto": "Riesgos proporcionales: el efecto de cada término es constante en el tiempo (prueba score de cox.zph, por término y global)." }
    ],
    "supuestos": [
      { "nombre": "Riesgos proporcionales", "como": "El semáforo muestra la prueba global; el cuadro «Prueba de riesgos proporcionales» da una por término. Curvas de Kaplan-Meier que se cruzan también lo sugieren.", "verificar": "kaplan-meier", "siFalla": "Si un factor no cumple, decláralo como estrato (cada nivel con su riesgo base, sin HR) o analiza por separado los tramos de tiempo; si lo dejas, su HR es un promedio en el tiempo.", "alternativa": "kaplan-meier" },
      { "nombre": "Censura no informativa", "como": "No se prueba con los datos; depende de por qué salieron las unidades del ensayo.", "verificar": null, "siFalla": "Si las pérdidas se relacionan con el evento o con el tratamiento, los HR se sesgan: registra la causa de cada pérdida y no la mezcles con la censura al final del ensayo.", "alternativa": null },
      { "nombre": "Efecto lineal de las covariables", "como": "SigmaPro no lo prueba: cada covariable entra con un solo coeficiente (el logaritmo del riesgo cambia lo mismo por cada unidad).", "verificar": null, "siFalla": "Agrupa la covariable en clases (Datos → Variable calculada) y métela como factor; si los HR de las clases no siguen una línea, deja la covariable como factor.", "alternativa": null },
      { "nombre": "Suficientes eventos por coeficiente", "como": "El semáforo «Eventos por coeficiente» pide 10 o más (ámbar de 5 a 10, rojo con menos) y «Convergencia» avisa si un coeficiente se va al infinito.", "verificar": null, "siFalla": "Quita términos o junta niveles con pocos eventos; si un grupo no tuvo ningún evento, compara las curvas con Kaplan-Meier.", "alternativa": "kaplan-meier" },
      { "nombre": "Independencia entre unidades", "como": "La da el diseño: cada fila es una unidad que se observa por separado; no se prueba con los datos.", "verificar": null, "siFalla": "Si las unidades comparten caja, maceta o árbol, declara ese agrupamiento (o el lote) como estrato.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "dias", "tipo": "numérica continua", "papel": "tiempo hasta el evento o hasta la censura" },
        { "nombre": "germino", "tipo": "binaria (0/1)", "papel": "evento (1 = ocurrió, 0 = censura)" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (hasta 4 factores)", "papel": "factores (el primer nivel es la referencia)" },
        { "nombre": "peso_semilla", "tipo": "numérica continua (hasta 10 covariables)", "papel": "covariables" },
        { "nombre": "lote", "tipo": "factor con k niveles", "papel": "estrato (opcional)" }
      ],
      "minimo": "Unos 10 eventos por coeficiente (cada nivel de un factor, salvo el primero, y cada covariable cuentan como uno); SigmaPro exige más eventos que coeficientes.",
      "balance": "Los grupos pueden tener tamaños distintos. Se excluyen las filas con faltantes en el tiempo, el evento, los factores, las covariables o el estrato; el cuadro de pruebas globales dice cuántas unidades y eventos entraron.",
      "notaFormato": "Formato largo: una fila por unidad (semilla, planta, insecto) con su tiempo, su evento 0/1, sus factores y sus covariables.",
      "errores": [
        "Dejar como referencia un nivel que no es el testigo: el primer nivel del factor es la referencia; cambia el orden de los niveles en Datos.",
        "Meter una covariable en una escala en que un cambio de 1 es enorme (gramos, con semillas de 0.4 g): el HR por unidad sale extremo; cámbiala a centigramos para que sea interpretable.",
        "Usar como covariable algo medido después del inicio (la altura de la plántula ya emergida): el modelo supone covariables fijas desde el tiempo cero.",
        "Invertir el código del evento (1 = censura).",
        "Contar como independientes las semillas de una misma caja sin declarar la caja o el lote como estrato."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo: riesgos proporcionales, eventos por coeficiente y convergencia.",
        "Lee las pruebas globales (razón de verosimilitudes, Wald y score): ¿explica algo el modelo?",
        "En «Coeficientes y razones de riesgo», lee cada HR con su intervalo: mayor que 1, el evento llega antes que en la referencia; menor que 1, después.",
        "Revisa la prueba de riesgos proporcionales por término y la concordancia (0.5 es azar; 1, orden perfecto).",
        "Acompaña los HR con las curvas de Kaplan-Meier para mostrar los tiempos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Con el peso de la semilla en el modelo, la semilla escarificada germinó a una tasa 4.8 veces mayor que el testigo (HR = 4.8; IC 95 %: 2.8 a 8.2; p < 0.001) y la remojada, 2.1 veces mayor (IC 95 %: 1.3 a 3.5; p = 0.004). No hubo evidencia contra los riesgos proporcionales (χ²(3) = 1.9, p = 0.59) y la concordancia fue de 0.70».",
      "guias": ["hr", "ic", "lrt", "z", "p"]
    },
    "limitaciones": [
      "El HR dice cuánto más rápido ocurre el evento, no cuántos días se adelanta: para los tiempos (medianas) usa las curvas de Kaplan-Meier.",
      "SigmaPro ajusta efectos principales: no incluye interacciones entre factores ni covariables que cambien con el tiempo.",
      "Si los riesgos no son proporcionales, el HR es un promedio que puede ocultar efectos opuestos en distintos momentos: estratifica o separa el tiempo en tramos.",
      "Si solo importa la germinación final y no su rapidez, usa un modelo binomial de proporciones."
    ],
    "referencias": [
      "Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society: Series B (Methodological), 34(2), 187–220.",
      "Efron, B. (1977). The efficiency of Cox’s likelihood function for censored data. Journal of the American Statistical Association, 72(359), 557–565.",
      "Grambsch, P. M., & Therneau, T. M. (1994). Proportional hazards tests and diagnostics based on weighted residuals. Biometrika, 81(3), 515–526.",
      "Harrell, F. E., Califf, R. M., Pryor, D. B., Lee, K. L., & Rosati, R. A. (1982). Evaluating the yield of medical tests. JAMA, 247(18), 2543–2546.",
      "Therneau, T. M., & Grambsch, P. M. (2000). Modeling survival data: Extending the Cox model. Springer."
    ]
  },
  "en": {
    "alias": ["Cox regression", "Proportional hazards model", "Semiparametric survival model"],
    "paraQue": "Measures how many times faster (or slower) an event occurs with each treatment or per unit of a covariate, also using the units that did not have it.",
    "preguntas": [
      "How many times faster does scarified seed germinate than the control, once seed weight is accounted for?",
      "Does the risk of death of chili seedlings from root rot change with the variety and with soil moisture?",
      "Do peach buds break sooner with two dormancy-breaking products, when each orchard has its own pace of budbreak?"
    ],
    "teoria": [
      "The Cox model relates the time to an event to treatments and covariates without assuming a shape for the survival curve. It works with the hazard: the rate at which the event occurs at a given moment among the units that do not yet have it. It assumes that the hazard of each unit is a common baseline hazard, which may have any shape over time, multiplied by a factor that depends on its variables. Each coefficient thus becomes a hazard ratio (HR): an HR of 2 means the event occurs at twice the rate at every moment; one of 0.5, at half the rate.",
      "The coefficients are estimated by maximizing the partial likelihood, which at each event time compares the unit that had the event with all the units still at risk; censored units take part while they remain in the trial. Tied times, common when units are inspected once a day, are handled with the Efron or the Breslow approximation. In SigmaPro each factor is coded by comparing every level with the first, covariates enter with a linear effect and, if you declare a stratum (lot, site, date), each stratum has its own baseline hazard, with no coefficient.",
      "The app gives the three global tests (likelihood ratio, Wald and score), Harrell’s concordance and the Grambsch and Therneau proportional hazards test, which checks whether any effect changes over time."
    ],
    "modelo": {
      "tex": "h(t \\mid \\mathbf{x}) = h_0(t) \\exp(\\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_p x_p)",
      "terminos": [
        ["h(t \\mid \\mathbf{x})", "the hazard of the event at time t for a unit with values x"],
        ["h_0(t)", "the baseline hazard (that of the reference), with no assumed shape; with strata, one per stratum"],
        ["x_j", "the indicator of a factor level (versus the first level) or the value of a covariate"],
        ["\\beta_j", "the coefficient; its exponential is the hazard ratio (HR)"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_1 = \\beta_2 = \\cdots = \\beta_p = 0", "h1": "\\text{some } \\beta_j \\ne 0", "texto": "No term changes the hazard. Tested with the likelihood ratio, Wald and score (log-rank) tests, each a chi-square with p degrees of freedom." },
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "Each coefficient separately (HR = 1), with the Wald z test and the interval of the hazard ratio." },
      { "h0": "\\beta_j(t) = \\beta_j", "h1": "\\beta_j(t) \\text{ changes with } t", "texto": "Proportional hazards: the effect of each term is constant over time (cox.zph score test, per term and global)." }
    ],
    "supuestos": [
      { "nombre": "Proportional hazards", "como": "The assumptions checklist shows the global test; the “Proportional hazards test” table gives one per term. Kaplan-Meier curves that cross also suggest it.", "verificar": "kaplan-meier", "siFalla": "If a factor fails, declare it as a stratum (each level with its own baseline hazard, no HR) or analyze the time periods separately; if you keep it, its HR is an average over time.", "alternativa": "kaplan-meier" },
      { "nombre": "Non-informative censoring", "como": "It is not tested with the data; it depends on why units left the trial.", "verificar": null, "siFalla": "If losses are related to the event or to the treatment, the HRs are biased: record the cause of each loss and do not mix it with censoring at the end of the trial.", "alternativa": null },
      { "nombre": "Linear effect of covariates", "como": "SigmaPro does not test it: each covariate enters with a single coefficient (the log hazard changes by the same amount per unit).", "verificar": null, "siFalla": "Group the covariate into classes (Data → Computed variable) and enter it as a factor; if the class HRs do not follow a line, keep the covariate as a factor.", "alternativa": null },
      { "nombre": "Enough events per coefficient", "como": "The “Events per coefficient” item asks for 10 or more (amber from 5 to 10, red below) and “Convergence” warns if a coefficient goes to infinity.", "verificar": null, "siFalla": "Drop terms or merge levels with few events; if a group had no events at all, compare the curves with Kaplan-Meier.", "alternativa": "kaplan-meier" },
      { "nombre": "Independence among units", "como": "It comes from the design: each row is a unit observed separately; it is not tested with the data.", "verificar": null, "siFalla": "If units share a dish, pot or tree, declare that grouping (or the lot) as a stratum.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "dias", "tipo": "continuous numeric", "papel": "time to the event or to censoring" },
        { "nombre": "germino", "tipo": "binary (0/1)", "papel": "event (1 = occurred, 0 = censored)" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (up to 4 factors)", "papel": "factors (the first level is the reference)" },
        { "nombre": "peso_semilla", "tipo": "continuous numeric (up to 10 covariates)", "papel": "covariates" },
        { "nombre": "lote", "tipo": "factor with k levels", "papel": "stratum (optional)" }
      ],
      "minimo": "About 10 events per coefficient (each factor level except the first, and each covariate, counts as one); SigmaPro requires more events than coefficients.",
      "balance": "Groups may have different sizes. Rows with missing time, event, factors, covariates or stratum are excluded; the global tests table tells how many units and events entered.",
      "notaFormato": "Long format: one row per unit (seed, plant, insect) with its time, its 0/1 event, its factors and its covariates.",
      "errores": [
        "Leaving as reference a level that is not the control: the first level of the factor is the reference; change the order of the levels in Data.",
        "Entering a covariate on a scale where a change of 1 is huge (grams, with 0.4 g seeds): the HR per unit becomes extreme; switch to centigrams so it can be interpreted.",
        "Using as a covariate something measured after the start (the height of an emerged seedling): the model assumes covariates fixed from time zero.",
        "Reversing the event code (1 = censored).",
        "Counting seeds from the same dish as independent without declaring the dish or the lot as a stratum."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the assumptions checklist: proportional hazards, events per coefficient and convergence.",
        "Read the global tests (likelihood ratio, Wald and score): does the model explain anything?",
        "In “Coefficients and hazard ratios”, read each HR with its interval: above 1, the event comes sooner than in the reference; below 1, later.",
        "Check the proportional hazards test per term and the concordance (0.5 is chance; 1, perfect ordering).",
        "Present the HRs together with the Kaplan-Meier curves to show the times."
      ],
      "ejemplo": "Example write-up (illustrative figures): “With seed weight in the model, scarified seed germinated at a rate 4.8 times that of the control (HR = 4.8; 95% CI: 2.8 to 8.2; p < 0.001) and soaked seed at 2.1 times (95% CI: 1.3 to 3.5; p = 0.004). There was no evidence against proportional hazards (χ²(3) = 1.9, p = 0.59) and the concordance was 0.70.”",
      "guias": ["hr", "ic", "lrt", "z", "p"]
    },
    "limitaciones": [
      "The HR tells how much faster the event occurs, not how many days earlier: for the times (medians) use the Kaplan-Meier curves.",
      "SigmaPro fits main effects: it includes no interactions between factors and no time-varying covariates.",
      "If hazards are not proportional, the HR is an average that may hide opposite effects at different moments: stratify or split time into periods.",
      "If only final germination matters and not its speed, use a binomial model for proportions."
    ],
    "referencias": [
      "Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society: Series B (Methodological), 34(2), 187–220.",
      "Efron, B. (1977). The efficiency of Cox’s likelihood function for censored data. Journal of the American Statistical Association, 72(359), 557–565.",
      "Grambsch, P. M., & Therneau, T. M. (1994). Proportional hazards tests and diagnostics based on weighted residuals. Biometrika, 81(3), 515–526.",
      "Harrell, F. E., Califf, R. M., Pryor, D. B., Lee, K. L., & Rosati, R. A. (1982). Evaluating the yield of medical tests. JAMA, 247(18), 2543–2546.",
      "Therneau, T. M., & Grambsch, P. M. (2000). Modeling survival data: Extending the Cox model. Springer."
    ]
  }
});
