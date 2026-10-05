SP_FICHA({
  "id": "kaplan-meier",
  "familia": "supervivencia",
  "respuesta": "tiempo-evento",
  "estructura": "k-grupos",
  "disenos": ["dca", "dbca"],
  "relacionados": ["cox", "glm-proporciones", "curva-crecimiento", "kruskal-wallis", "glmm-bloques"],
  "ejemplo": { "conjunto": "frijol-germinacion", "entradas": { "tiempo": "dias", "evento": "germino", "grupo": "tratamiento" }, "opciones": { "conf": "log", "rho": 0 } },
  "formato": {
    "largo": [["tratamiento", "lote", "dias", "germino"], ["Testigo", "L1", "19", "1"], ["Testigo", "L2", "15", "1"], ["Testigo", "L3", "4", "1"], ["Testigo", "L1", "10", "1"], ["Testigo", "L2", "1", "1"], ["Testigo", "L3", "21", "0"], ["Testigo", "L1", "3", "1"], ["Testigo", "L2", "6", "1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Curvas de supervivencia", "Estimador producto-límite", "Prueba log-rank", "Análisis del tiempo hasta un evento"],
    "paraQue": "Describe cuánto tardan las unidades en tener un evento (germinar, morir, florecer), aunque algunas terminen el ensayo sin tenerlo, y compara esas curvas entre tratamientos.",
    "preguntas": [
      "¿Germinan antes las semillas de frijol escarificadas o remojadas que las del testigo, si algunas no germinan en los 21 días del ensayo?",
      "¿En cuántos días muere la mitad de las larvas de gusano cogollero expuestas a tres cepas de un hongo entomopatógeno?",
      "¿Florecen antes las plantas de una variedad precoz que las de una tardía cuando algunas se pierden antes de florecer?"
    ],
    "teoria": [
      "En muchos ensayos lo que se mide es el tiempo hasta que ocurre algo: que una semilla germine, que una larva muera o que una planta florezca. Casi siempre algunas unidades terminan el ensayo sin el evento; de ellas solo se sabe que su tiempo es mayor que el último día de revisión. Esos datos están censurados por la derecha. Si se descartan, o si se les asigna el último día como si hubieran tenido el evento, los tiempos quedan sesgados.",
      "El estimador de Kaplan-Meier aprovecha las unidades censuradas. En cada tiempo con eventos calcula la proporción que sigue sin el evento entre las que todavía están en riesgo, y la curva de supervivencia es el producto acumulado de esas proporciones: baja en escalones y nunca sube. Una unidad censurada cuenta en el grupo en riesgo hasta su tiempo y después sale sin bajar la curva. SigmaPro calcula el error estándar de Greenwood, el intervalo de cada punto (log, log-log o lineal), la mediana (el tiempo en que la curva cruza 0.5) con su intervalo y los cuartiles 25 % y 75 %.",
      "Para comparar grupos, la prueba log-rank suma, en cada tiempo con eventos, los eventos observados y los que se esperarían en cada grupo si todas las curvas fueran iguales; la discrepancia se resume en una ji cuadrada con k − 1 grados de libertad. La variante de Peto-Peto da más peso a los tiempos tempranos. Si hay lotes, sitios o fechas con distinto riesgo base, la prueba estratificada compara los grupos dentro de cada estrato y suma los resultados."
    ],
    "modelo": {
      "tex": "\\hat{S}(t) = \\prod_{t_i \\le t} \\left( 1 - \\frac{d_i}{n_i} \\right)",
      "terminos": [
        ["\\hat{S}(t)", "la proporción estimada de unidades que siguen sin el evento al tiempo t"],
        ["t_i", "cada tiempo en que ocurrió al menos un evento"],
        ["d_i", "el número de eventos en ese tiempo"],
        ["n_i", "el número de unidades en riesgo justo antes de ese tiempo (sin evento y sin censura previa)"]
      ]
    },
    "hipotesis": [
      { "h0": "S_1(t) = S_2(t) = \\cdots = S_k(t) \\text{ para todo } t", "h1": "\\text{alguna curva difiere}", "texto": "Las curvas de supervivencia de los k grupos son iguales. Se prueba con log-rank (o Peto-Peto), una ji cuadrada con k − 1 grados de libertad que compara los eventos observados y esperados de cada grupo; con estratos, dentro de cada estrato." }
    ],
    "supuestos": [
      { "nombre": "Censura no informativa", "como": "No se prueba con los datos. El semáforo muestra cuántas unidades están censuradas y se pone en ámbar si son más de la mitad.", "verificar": null, "siFalla": "Si las unidades salen del ensayo por causas ligadas al evento (plántulas que se pudren y se retiran), la curva se sesga: registra esas pérdidas aparte y no las mezcles con las que terminaron el ensayo sin el evento.", "alternativa": null },
      { "nombre": "Independencia entre unidades", "como": "La da el diseño: cada fila es una unidad que se observa por separado; no se prueba con los datos.", "verificar": null, "siFalla": "Si las semillas comparten caja o maceta, no son repeticiones independientes: declara el lote o la caja como estrato o resume la germinación por caja y analízala con un modelo binomial mixto.", "alternativa": "glmm-bloques" },
      { "nombre": "Riesgos proporcionales (para log-rank)", "como": "Mira si las curvas se cruzan en la gráfica; la prueba de riesgos proporcionales del modelo de Cox lo revisa formalmente.", "verificar": "cox", "siFalla": "Log-rank es la prueba más potente cuando un grupo tiene siempre más riesgo que otro; si las diferencias son tempranas y luego se borran, elige Peto-Peto en las opciones.", "alternativa": null },
      { "nombre": "Mismo origen del tiempo", "como": "Depende del registro: el tiempo se cuenta para todas las unidades desde la siembra, la inoculación o el inicio del ensayo.", "verificar": null, "siFalla": "Si las unidades entraron en fechas distintas, calcula el tiempo de cada una desde su propia entrada (Datos → Variable calculada).", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "dias", "tipo": "numérica continua", "papel": "tiempo hasta el evento o hasta la censura" },
        { "nombre": "germino", "tipo": "binaria (0/1)", "papel": "evento (1 = ocurrió, 0 = censura)" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (hasta 12)", "papel": "grupos que se comparan (opcional)" },
        { "nombre": "lote", "tipo": "factor con k niveles", "papel": "estrato (opcional; solo con grupos)" }
      ],
      "minimo": "Unas 20 a 30 unidades por grupo y que la mayoría tenga el evento; con pocos eventos la mediana no se alcanza o su intervalo queda muy ancho. La app pide al menos dos unidades y un evento.",
      "balance": "Los grupos pueden tener tamaños distintos. SigmaPro deja fuera las filas con el tiempo, el evento, el grupo o el estrato faltantes; el n de cada grupo en el cuadro de la mediana dice cuántas entraron.",
      "notaFormato": "Formato largo: una fila por unidad (semilla, planta, insecto) con su tiempo, su evento 0/1 y, si hay, su grupo y su estrato.",
      "errores": [
        "Escribir el último día (21) como tiempo de las semillas que no germinaron y marcarlas con 1: se cuentan como germinadas ese día.",
        "Borrar las unidades que no tuvieron el evento: la curva parece más rápida de lo que es.",
        "Invertir el código del evento (1 = censura): SigmaPro toma 1 como «ocurrió el evento».",
        "Capturar la fecha de calendario en lugar de los días desde el inicio del ensayo.",
        "Capturar los conteos diarios de germinadas por caja en lugar de una fila por semilla: cada conteo debe convertirse en tantas filas como semillas."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo de censura y el n y los eventos de cada grupo.",
        "Mira la gráfica: la curva que baja antes es la del grupo en que el evento ocurre más rápido; las marcas son unidades censuradas.",
        "Lee en «Mediana y cuartiles» el tiempo en que la mitad tuvo el evento, con su intervalo («—» si la curva no baja hasta ahí).",
        "Con grupos, lee la χ² y la p de la comparación (log-rank o Peto-Peto) y, en su cuadro, qué grupos tuvieron más eventos observados que esperados.",
        "Consulta la tabla de supervivencia para la proporción sin el evento en un día concreto."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La mediana de días a la germinación fue de 4 días (IC 95 %: 3 a 5) en la semilla escarificada, de 6 días (4 a 11) con remojo y de 16 días (12 a 20) en el testigo. Las curvas difirieron (log-rank χ²(2) = 35.2, p < 0.001): el testigo tuvo menos germinaciones que las esperadas si los tres tratamientos fueran iguales».",
      "guias": ["supervivencia", "mediana", "ic", "chi2", "p"]
    },
    "limitaciones": [
      "Compara curvas, pero no dice cuántas veces más rápido ocurre el evento ni ajusta por covariables (peso o vigor de la semilla): para eso usa el modelo de Cox.",
      "Si revisas cada semana y no cada día, muchos tiempos quedan empatados y el tiempo real queda entre dos revisiones: revisa tan seguido como puedas.",
      "Si solo te interesa la germinación final y no su rapidez, un modelo binomial de proporciones es más directo.",
      "Si hay unidades que nunca tendrán el evento (semillas muertas), la curva se aplana sobre esa fracción y la mediana puede no alcanzarse."
    ],
    "referencias": [
      "Kaplan, E. L., & Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association, 53(282), 457–481.",
      "Mantel, N. (1966). Evaluation of survival data and two new rank order statistics arising in its consideration. Cancer Chemotherapy Reports, 50(3), 163–170.",
      "Peto, R., & Peto, J. (1972). Asymptotically efficient rank invariant test procedures. Journal of the Royal Statistical Society: Series A (General), 135(2), 185–207.",
      "Klein, J. P., & Moeschberger, M. L. (2003). Survival analysis: Techniques for censored and truncated data (2nd ed.). Springer.",
      "McNair, J. N., Sunkara, A., & Frobish, D. (2012). How to analyse seed germination data using statistical time-to-event analysis: Non-parametric and semi-parametric methods. Seed Science Research, 22(2), 77–95."
    ]
  },
  "en": {
    "alias": ["Survival curves", "Product-limit estimator", "Log-rank test", "Time-to-event analysis"],
    "paraQue": "Describes how long units take to experience an event (germinate, die, flower), even when some finish the trial without it, and compares those curves among treatments.",
    "preguntas": [
      "Do scarified or soaked bean seeds germinate sooner than the control, when some seeds do not germinate during the 21-day trial?",
      "In how many days do half of the fall armyworm larvae exposed to three strains of an entomopathogenic fungus die?",
      "Do plants of an early variety flower sooner than those of a late one when some plants are lost before flowering?"
    ],
    "teoria": [
      "In many trials the response is the time until something happens: a seed germinates, a larva dies or a plant flowers. Almost always some units finish the trial without the event; for them we only know that their time is longer than the last inspection day. These data are right-censored. If they are dropped, or given the last day as if they had the event, the times are biased.",
      "The Kaplan-Meier estimator makes use of the censored units. At each time with events it computes the proportion still without the event among the units still at risk, and the survival curve is the cumulative product of those proportions: it falls in steps and never rises. A censored unit counts in the risk set up to its time and then leaves without lowering the curve. SigmaPro computes the Greenwood standard error, the interval at each point (log, log-log or plain), the median (the time at which the curve crosses 0.5) with its interval, and the 25 % and 75 % quartiles.",
      "To compare groups, the log-rank test adds up, at each time with events, the observed events and those expected in each group if all curves were equal; the discrepancy is summarized as a chi-square with k − 1 degrees of freedom. The Peto-Peto variant gives more weight to early times. If there are lots, sites or dates with different baseline risks, the stratified test compares the groups within each stratum and adds up the results."
    ],
    "modelo": {
      "tex": "\\hat{S}(t) = \\prod_{t_i \\le t} \\left( 1 - \\frac{d_i}{n_i} \\right)",
      "terminos": [
        ["\\hat{S}(t)", "the estimated proportion of units still without the event at time t"],
        ["t_i", "each time at which at least one event occurred"],
        ["d_i", "the number of events at that time"],
        ["n_i", "the number of units at risk just before that time (no event and not censored earlier)"]
      ]
    },
    "hipotesis": [
      { "h0": "S_1(t) = S_2(t) = \\cdots = S_k(t) \\text{ for all } t", "h1": "\\text{some curve differs}", "texto": "The survival curves of the k groups are equal. Tested with the log-rank (or Peto-Peto) test, a chi-square with k − 1 degrees of freedom that compares the observed and expected events of each group; with strata, within each stratum." }
    ],
    "supuestos": [
      { "nombre": "Non-informative censoring", "como": "It is not tested with the data. The assumptions checklist shows how many units are censored and turns amber if more than half are.", "verificar": null, "siFalla": "If units leave the trial for reasons tied to the event (seedlings that rot and are removed), the curve is biased: record those losses separately and do not mix them with the units that finished the trial without the event.", "alternativa": null },
      { "nombre": "Independence among units", "como": "It comes from the design: each row is a unit observed separately; it is not tested with the data.", "verificar": null, "siFalla": "If seeds share a dish or a pot, they are not independent replicates: declare the lot or the dish as a stratum, or summarize germination per dish and analyze it with a binomial mixed model.", "alternativa": "glmm-bloques" },
      { "nombre": "Proportional hazards (for the log-rank test)", "como": "Check whether the curves cross in the plot; the proportional hazards test of the Cox model checks it formally.", "verificar": "cox", "siFalla": "The log-rank test is the most powerful when one group always has a higher risk than another; if the differences are early and then fade, choose Peto-Peto in the options.", "alternativa": null },
      { "nombre": "Same time origin", "como": "It depends on the records: time is counted for every unit from sowing, inoculation or the start of the trial.", "verificar": null, "siFalla": "If units entered on different dates, compute each unit’s time from its own entry (Data → Computed variable).", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "dias", "tipo": "continuous numeric", "papel": "time to the event or to censoring" },
        { "nombre": "germino", "tipo": "binary (0/1)", "papel": "event (1 = occurred, 0 = censored)" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (up to 12)", "papel": "groups to compare (optional)" },
        { "nombre": "lote", "tipo": "factor with k levels", "papel": "stratum (optional; only with groups)" }
      ],
      "minimo": "About 20 to 30 units per group, most of them with the event; with few events the median is not reached or its interval is very wide. The app requires at least two units and one event.",
      "balance": "Groups may have different sizes. SigmaPro leaves out rows with a missing time, event, group or stratum; the n of each group in the median table tells how many entered.",
      "notaFormato": "Long format: one row per unit (seed, plant, insect) with its time, its 0/1 event and, if any, its group and stratum.",
      "errores": [
        "Entering the last day (21) as the time of seeds that did not germinate and coding them 1: they are counted as germinated on that day.",
        "Deleting the units that did not have the event: the curve looks faster than it is.",
        "Reversing the event code (1 = censored): SigmaPro takes 1 as “the event occurred”.",
        "Entering the calendar date instead of the days since the start of the trial.",
        "Entering daily counts of germinated seeds per dish instead of one row per seed: each count must become as many rows as seeds."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the censoring item of the assumptions checklist and the n and events of each group.",
        "Look at the plot: the curve that falls first belongs to the group in which the event happens faster; the marks are censored units.",
        "Read in “Median and quartiles” the time at which half of the units had the event, with its interval (“—” if the curve does not fall that far).",
        "With groups, read the χ² and p of the comparison (log-rank or Peto-Peto) and, in its table, which groups had more observed than expected events.",
        "Use the survival table for the proportion without the event on a given day."
      ],
      "ejemplo": "Example write-up (illustrative figures): “The median time to germination was 4 days (95% CI: 3 to 5) for scarified seed, 6 days (4 to 11) for soaked seed and 16 days (12 to 20) for the control. The curves differed (log-rank χ²(2) = 35.2, p < 0.001): the control had fewer germinations than expected if the three treatments were equal.”",
      "guias": ["supervivencia", "mediana", "ic", "chi2", "p"]
    },
    "limitaciones": [
      "It compares curves but does not say how many times faster the event occurs, nor does it adjust for covariates (seed weight or vigor): use the Cox model for that.",
      "If you inspect weekly instead of daily, many times are tied and the true time lies between two inspections: inspect as often as you can.",
      "If you only care about final germination and not its speed, a binomial model for proportions is more direct.",
      "If some units will never have the event (dead seeds), the curve levels off above that fraction and the median may not be reached."
    ],
    "referencias": [
      "Kaplan, E. L., & Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association, 53(282), 457–481.",
      "Mantel, N. (1966). Evaluation of survival data and two new rank order statistics arising in its consideration. Cancer Chemotherapy Reports, 50(3), 163–170.",
      "Peto, R., & Peto, J. (1972). Asymptotically efficient rank invariant test procedures. Journal of the Royal Statistical Society: Series A (General), 135(2), 185–207.",
      "Klein, J. P., & Moeschberger, M. L. (2003). Survival analysis: Techniques for censored and truncated data (2nd ed.). Springer.",
      "McNair, J. N., Sunkara, A., & Frobish, D. (2012). How to analyse seed germination data using statistical time-to-event analysis: Non-parametric and semi-parametric methods. Seed Science Research, 22(2), 77–95."
    ]
  }
});
