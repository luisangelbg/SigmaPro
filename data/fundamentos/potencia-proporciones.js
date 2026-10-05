SP_FICHA({
  "id": "potencia-proporciones",
  "familia": "potencia",
  "respuesta": "ninguna",
  "estructura": "dos-grupos",
  "disenos": ["dca"],
  "relacionados": ["proporciones", "tabla-contingencia", "glm-proporciones", "potencia-medias", "tamano-muestra"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Potencia para dos proporciones", "Tamaño de muestra para comparar dos porcentajes", "power.prop.test"],
    "paraQue": "Calcula cuántas unidades por grupo necesitas para distinguir dos porcentajes (germinación, sobrevivencia, incidencia), o qué potencia tienes con un número dado.",
    "preguntas": [
      "¿Cuántas semillas por tratamiento debo sembrar para distinguir una germinación de 65 % de una de 80 %?",
      "Con 100 plantas por grupo, ¿qué probabilidad tengo de detectar que un fungicida baja la incidencia de marchitez de 30 % a 15 %?",
      "¿Cuántos esquejes por tratamiento hacen falta para comparar el enraizamiento con y sin auxinas si espero 50 % y 70 %?"
    ],
    "teoria": [
      "Cuando la respuesta de cada unidad es sí o no (germinó, sobrevivió, está enferma), los tratamientos se comparan por sus proporciones. La diferencia que se puede detectar depende de cuántas unidades se observan en cada grupo y también de dónde están las proporciones: la varianza de una proporción, p(1 − p), es máxima en 0.5 y pequeña cerca de 0 o de 1. Por eso, distinguir 45 % de 55 % pide muchas más unidades que distinguir 85 % de 95 %, aunque las dos diferencias sean de 10 puntos.",
      "SigmaPro usa la aproximación normal de power.prop.test de R: bajo la hipótesis nula, la diferencia de proporciones tiene una varianza calculada con la proporción promedio; bajo la alternativa, con la de cada grupo. La potencia es la probabilidad normal de que la diferencia observada rebase el valor crítico. Puedes calcular el tamaño de muestra por grupo o la potencia de un tamaño dado, con la alternativa bilateral o unilateral. El cuadro informa la h de Cohen, la diferencia de las dos proporciones en la escala del arcoseno, que sirve para juzgar si el efecto es pequeño o grande, y la gráfica muestra la potencia para cada tamaño de muestra.",
      "La unidad que cuenta en la n es la que se sortea de manera independiente. Si las semillas van en cajas o las plantas en macetas o parcelas, las de un mismo grupo se parecen entre sí y la n efectiva es menor que el número de semillas o de plantas: conviene planear por cajas o aumentar la n."
    ],
    "modelo": {
      "tex": "1 - \\beta = \\Phi\\left( \\frac{\\sqrt{n} |p_1 - p_2| - z_{c} \\sqrt{2 \\bar{p} (1 - \\bar{p})}}{\\sqrt{p_1 (1 - p_1) + p_2 (1 - p_2)}} \\right), \\quad \\bar{p} = \\frac{p_1 + p_2}{2}",
      "terminos": [
        ["p_1, p_2", "las proporciones esperadas en los dos grupos"],
        ["\\bar{p}", "su promedio"],
        ["n", "las unidades por grupo"],
        ["z_{c}", "el valor crítico de la normal estándar: deja α/2 arriba (bilateral) o α (unilateral)"],
        ["\\Phi", "la función de distribución normal estándar"],
        ["1 - \\beta", "la potencia"]
      ]
    },
    "hipotesis": [
      { "h0": "p_1 = p_2", "h1": "p_1 \\ne p_2", "texto": "La comparación de dos proporciones que se planea (por ejemplo, con una ji cuadrada o un modelo binomial). Con la alternativa unilateral, se prueba la dirección de la diferencia que escribes." }
    ],
    "supuestos": [
      { "nombre": "Unidades independientes", "como": "La da el sorteo de las unidades; no se revisa con datos.", "verificar": null, "siFalla": "Si las semillas o las plantas van agrupadas (cajas, macetas, parcelas), su respuesta se parece dentro del grupo y la potencia real baja: planea con más unidades y analiza después con un modelo binomial mixto en bloques.", "alternativa": "glmm-bloques" },
      { "nombre": "Aproximación normal adecuada", "como": "Funciona bien cuando n·p y n·(1 − p) pasan de 5 o 10 en los dos grupos; con proporciones extremas y n chicas es poco exacta.", "verificar": null, "siFalla": "Con proporciones muy cercanas a 0 o a 1, toma la n como mínima y añade un margen; el análisis final puede usar la prueba exacta de Fisher en la tabla de contingencia.", "alternativa": "tabla-contingencia" },
      { "nombre": "Proporciones esperadas realistas", "como": "Son un supuesto: tómalas de ensayos anteriores o de la literatura; con datos de un ensayo previo, «Proporciones e intervalos de confianza» las estima.", "verificar": "proporciones", "siFalla": "Si no estás seguro de la proporción del testigo, calcula con la más cercana a 0.5, que pide la n más grande.", "alternativa": null },
      { "nombre": "El mismo número de unidades en los dos grupos", "como": "La n es por grupo, como en power.prop.test.", "verificar": null, "siFalla": "Con grupos desiguales la potencia es menor que con grupos iguales del mismo total; planea con la n del grupo más chico.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "¿Qué quieres calcular?", "tipo": "elección: tamaño de muestra o potencia", "papel": "la incógnita" },
        { "nombre": "Proporción en el grupo 1 y en el grupo 2", "tipo": "números entre 0 y 1, distintos entre sí", "papel": "efecto" },
        { "nombre": "Tamaño de muestra (por grupo)", "tipo": "número de 2 en adelante", "papel": "solo si calculas la potencia" },
        { "nombre": "Potencia deseada y nivel de significancia", "tipo": "números entre 0 y 1", "papel": "riesgos que aceptas" },
        { "nombre": "Hipótesis alternativa", "tipo": "elección: bilateral o unilateral", "papel": "dirección de la prueba" }
      ],
      "minimo": "No hacen falta datos. Las dos proporciones deben ser distintas y estar entre 0 y 1; la n calculada es por grupo (el total es el doble).",
      "balance": "Supone el mismo número de unidades en los dos grupos. La n exacta sale con decimales y la conclusión la redondea hacia arriba.",
      "notaFormato": "Sin tabla: con la hoja vacía se abre desde Explorar con «Calcular un tamaño de muestra o una potencia»; con datos cargados, desde el catálogo. Las proporciones se escriben entre 0 y 1 (65 % es 0.65).",
      "errores": [
        "Escribir porcentajes (65) en lugar de proporciones (0.65).",
        "Contar semillas cuando lo que se sortea son cajas o macetas: la n efectiva se acerca más al número de cajas que al de semillas.",
        "Planear con la diferencia en puntos sin mirar dónde están las proporciones: 10 puntos cerca de 50 % piden mucho más que cerca de 90 %.",
        "Leer la n como el total de los dos grupos cuando es por grupo."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee la conclusión: las unidades por grupo (redondeadas hacia arriba y exactas) o la potencia.",
        "Revisa la h de Cohen en el cuadro de parámetros: 0.2 es una diferencia pequeña, 0.5 mediana y 0.8 grande.",
        "Usa la gráfica de la potencia según el tamaño de muestra para ver cuánto pierdes con menos unidades."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Para distinguir una germinación de 65 % de una de 80 % (h = 0.34) con una prueba bilateral, α = 0.05 y una potencia de 80 %, se necesitan 138 semillas por tratamiento (n exacta: 137.9)».",
      "guias": ["potencia", "alfa", "tamano-muestra", "h-cohen"]
    },
    "limitaciones": [
      "No calcula la diferencia detectable: para encontrarla, prueba varias proporciones del grupo 2 con la n que tienes y mira la potencia.",
      "Usa la aproximación normal: con proporciones muy cercanas a 0 o a 1 y n chicas, la potencia real puede ser distinta.",
      "Compara solo dos grupos; con más tratamientos, haz el cálculo para el par que más te importe y analiza después con un modelo binomial.",
      "Si la respuesta es un porcentaje continuo (cobertura, severidad), usa la potencia de medias con la desviación estándar de ese porcentaje."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Fleiss, J. L., Levin, B., & Paik, M. C. (2003). Statistical methods for rates and proportions (3rd ed.). Wiley.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  },
  "en": {
    "alias": ["Power for two proportions", "Sample size to compare two percentages", "power.prop.test"],
    "paraQue": "Calculates how many units per group you need to tell two percentages apart (germination, survival, incidence), or how much power you have with a given number.",
    "preguntas": [
      "How many seeds per treatment should I sow to tell 65 % germination from 80 %?",
      "With 100 plants per group, what is the probability of detecting that a fungicide lowers wilt incidence from 30 % to 15 %?",
      "How many cuttings per treatment are needed to compare rooting with and without auxins if I expect 50 % and 70 %?"
    ],
    "teoria": [
      "When the response of each unit is yes or no (germinated, survived, is diseased), treatments are compared through their proportions. The difference that can be detected depends on how many units are observed in each group and also on where the proportions lie: the variance of a proportion, p(1 − p), is largest at 0.5 and small near 0 or 1. That is why telling 45 % from 55 % requires many more units than telling 85 % from 95 %, even though both differences are 10 points.",
      "SigmaPro uses the normal approximation of R’s power.prop.test: under the null hypothesis, the difference in proportions has a variance computed with the average proportion; under the alternative, with that of each group. Power is the normal probability that the observed difference exceeds the critical value. You can calculate the sample size per group or the power of a given size, with a two-sided or one-sided alternative. The table reports Cohen’s h, the difference between the two proportions on the arcsine scale, which helps judge whether the effect is small or large, and the plot shows the power for each sample size.",
      "The unit that counts in n is the one randomized independently. If seeds are in boxes or plants in pots or plots, those in the same group resemble each other and the effective n is smaller than the number of seeds or plants: plan by boxes or increase n."
    ],
    "modelo": {
      "tex": "1 - \\beta = \\Phi\\left( \\frac{\\sqrt{n} |p_1 - p_2| - z_{c} \\sqrt{2 \\bar{p} (1 - \\bar{p})}}{\\sqrt{p_1 (1 - p_1) + p_2 (1 - p_2)}} \\right), \\quad \\bar{p} = \\frac{p_1 + p_2}{2}",
      "terminos": [
        ["p_1, p_2", "the expected proportions in the two groups"],
        ["\\bar{p}", "their average"],
        ["n", "the units per group"],
        ["z_{c}", "the critical value of the standard normal: it leaves α/2 above (two-sided) or α (one-sided)"],
        ["\\Phi", "the standard normal distribution function"],
        ["1 - \\beta", "the power"]
      ]
    },
    "hipotesis": [
      { "h0": "p_1 = p_2", "h1": "p_1 \\ne p_2", "texto": "The planned comparison of two proportions (for example, with a chi-square test or a binomial model). With the one-sided alternative, the direction of the difference you enter is tested." }
    ],
    "supuestos": [
      { "nombre": "Independent units", "como": "It comes from randomizing the units; it is not tested with data.", "verificar": null, "siFalla": "If seeds or plants are grouped (boxes, pots, plots), their response is similar within the group and the actual power drops: plan with more units and analyze later with a binomial mixed model in blocks.", "alternativa": "glmm-bloques" },
      { "nombre": "Adequate normal approximation", "como": "It works well when n·p and n·(1 − p) exceed 5 or 10 in both groups; with extreme proportions and small n it is not very accurate.", "verificar": null, "siFalla": "With proportions very close to 0 or 1, take n as a minimum and add a margin; the final analysis can use Fisher’s exact test in the contingency table.", "alternativa": "tabla-contingencia" },
      { "nombre": "Realistic expected proportions", "como": "They are an assumption: take them from previous trials or the literature; with data from an earlier trial, “Proportions and confidence intervals” estimates them.", "verificar": "proporciones", "siFalla": "If you are unsure of the control proportion, calculate with the one closest to 0.5, which requires the largest n.", "alternativa": null },
      { "nombre": "The same number of units in both groups", "como": "n is per group, as in power.prop.test.", "verificar": null, "siFalla": "With unequal groups, power is lower than with equal groups of the same total; plan with the n of the smaller group.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "What do you want to calculate?", "tipo": "choice: sample size or power", "papel": "the unknown" },
        { "nombre": "Proportion in group 1 and in group 2", "tipo": "numbers between 0 and 1, different from each other", "papel": "effect" },
        { "nombre": "Sample size (per group)", "tipo": "number from 2 up", "papel": "only if you calculate power" },
        { "nombre": "Target power and significance level", "tipo": "numbers between 0 and 1", "papel": "risks you accept" },
        { "nombre": "Alternative hypothesis", "tipo": "choice: two-sided or one-sided", "papel": "direction of the test" }
      ],
      "minimo": "No data are needed. The two proportions must differ and lie between 0 and 1; the calculated n is per group (the total is twice as much).",
      "balance": "It assumes the same number of units in both groups. The exact n has decimals and the conclusion rounds it up.",
      "notaFormato": "No table: with an empty sheet, open it from Explore with “Calculate a sample size or power”; with data loaded, from the catalog. Proportions are entered between 0 and 1 (65 % is 0.65).",
      "errores": [
        "Entering percentages (65) instead of proportions (0.65).",
        "Counting seeds when what is randomized is boxes or pots: the effective n is closer to the number of boxes than to the number of seeds.",
        "Planning with the difference in points without looking at where the proportions lie: 10 points near 50 % require much more than near 90 %.",
        "Reading n as the total of both groups when it is per group."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusion: the units per group (rounded up and exact) or the power.",
        "Check Cohen’s h in the parameters table: 0.2 is a small difference, 0.5 medium and 0.8 large.",
        "Use the plot of power by sample size to see how much you lose with fewer units."
      ],
      "ejemplo": "Example write-up (illustrative figures): “To tell 65 % germination from 80 % (h = 0.34) with a two-sided test, α = 0.05 and 80 % power, 138 seeds per treatment are needed (exact n: 137.9).”",
      "guias": ["potencia", "alfa", "tamano-muestra", "h-cohen"]
    },
    "limitaciones": [
      "It does not calculate the detectable difference: to find it, try several group 2 proportions with the n you have and look at the power.",
      "It uses the normal approximation: with proportions very close to 0 or 1 and small n, the actual power may differ.",
      "It compares only two groups; with more treatments, do the calculation for the pair that matters most and analyze later with a binomial model.",
      "If the response is a continuous percentage (cover, severity), use the power for means with the standard deviation of that percentage."
    ],
    "referencias": [
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      "Fleiss, J. L., Levin, B., & Paik, M. C. (2003). Statistical methods for rates and proportions (3rd ed.). Wiley.",
      "Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.",
      "Zar, J. H. (2010). Biostatistical analysis (5th ed.). Pearson Prentice Hall."
    ]
  }
});
