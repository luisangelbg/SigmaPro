SP_FICHA({
  "id": "curva-crecimiento",
  "familia": "no-lineal",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["dca", "ninguno"],
  "relacionados": ["dosis-respuesta", "respuesta-meseta", "regresion-polinomial", "medidas-repetidas", "regresion-lineal"],
  "ejemplo": { "conjunto": "maiz-altura", "entradas": { "respuesta": "altura", "x": "dds", "grupo": "tratamiento" }, "opciones": { "modelo": "logistico" } },
  "formato": {
    "largo": [["bloque", "tratamiento", "planta", "dds", "altura"], ["B1", "N0", "1", "15", "20.1"], ["B1", "N0", "1", "30", "59"], ["B1", "N0", "1", "45", "143.1"], ["B1", "N0", "1", "60", "187.8"], ["B1", "N0", "1", "75", "215.1"], ["B1", "N60", "1", "15", "23.5"], ["B1", "N60", "1", "30", "70.1"]],
    "ancho": [["bloque", "tratamiento", "planta", "15", "30", "45", "60", "75"], ["B1", "N0", "1", "20.1", "59", "143.1", "187.8", "215.1"], ["B1", "N60", "1", "23.5", "70.1", "163.5", "226.9", "233.6"], ["B1", "N120", "1", "21.5", "72", "169.9", "235.4", "240.1"]]
  },
  "es": {
    "alias": ["Curva logística", "Modelo de Gompertz", "Modelo de Weibull", "Regresión no lineal de crecimiento"],
    "paraQue": "Ajusta una curva en forma de S al crecimiento en el tiempo (altura, biomasa, área foliar) para estimar el valor máximo, cuándo se crece más rápido y si las curvas de los tratamientos difieren.",
    "preguntas": [
      "¿Alcanza el maíz una altura final mayor con más nitrógeno, y cambia el día en que crece más rápido?",
      "¿Cuál es la biomasa máxima de dos variedades de frijol y en qué día alcanzan la mitad de ella?",
      "¿Difiere entre huertas la curva de crecimiento del diámetro del fruto de aguacate?"
    ],
    "teoria": [
      "El crecimiento de una planta o de un órgano suele seguir una S: empieza lento, se acelera, alcanza su tasa máxima en el punto de inflexión y se frena al acercarse a un valor máximo, la asíntota. Un polinomio puede seguir esa forma dentro de los datos, pero sus coeficientes no tienen sentido biológico y fuera del intervalo medido se dispara. Los modelos no lineales de crecimiento tienen parámetros con significado: la asíntota, el momento de la inflexión y la rapidez de la subida.",
      "SigmaPro ofrece tres. El logístico, y = Asym / (1 + exp((xmid − x)/scal)), es simétrico alrededor de su inflexión xmid, donde la respuesta vale la mitad de la asíntota. El de Gompertz, y = Asym · exp(−b2 · b3^x), es asimétrico, con la inflexión antes de la mitad (la app la calcula con su EE). El de Weibull, y = Asym − Drop · exp(−exp(lrc) · x^pwr), es más flexible. Los ajusta por mínimos cuadrados no lineales, con el gradiente analítico (validado contra nls de R), y da intervalos de Wald o por verosimilitud perfilada. Con «El de menor AIC» ajusta los tres y elige.",
      "Con un factor de grupo (dosis, variedades), cada grupo tiene su propia curva, y la prueba F de la suma de cuadrados extra compara ese modelo con una curva común para todos y con cada parámetro común: así sabes si los tratamientos difieren en la asíntota, en el momento de la inflexión o en la rapidez."
    ],
    "modelo": {
      "tex": "y_{ij} = \\frac{\\mathrm{Asym}_i}{1 + \\exp\\left(\\frac{\\mathrm{xmid}_i - x_{ij}}{\\mathrm{scal}_i}\\right)} + \\varepsilon_{ij}",
      "terminos": [
        ["y_{ij}", "la respuesta (altura, biomasa) de la observación j del grupo i"],
        ["x_{ij}", "el tiempo (días después de la siembra, semanas)"],
        ["\\mathrm{Asym}_i", "la asíntota: el valor máximo que alcanza la curva del grupo i"],
        ["\\mathrm{xmid}_i", "el tiempo del punto de inflexión, cuando la curva vale la mitad de la asíntota y crece más rápido"],
        ["\\mathrm{scal}_i", "la escala: mientras menor, más rápida la subida; la tasa máxima de crecimiento es Asym/(4·scal)"],
        ["\\varepsilon_{ij}", "el error, independiente, con media 0 y varianza constante"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mathrm{Asym}_1 = \\cdots = \\mathrm{Asym}_g, \\quad \\mathrm{xmid}_1 = \\cdots = \\mathrm{xmid}_g, \\quad \\mathrm{scal}_1 = \\cdots = \\mathrm{scal}_g", "h1": "\\text{alguna curva difiere}", "texto": "Con grupos, una sola curva describe a todos. Prueba F de la suma de cuadrados extra del modelo con una curva común contra el de una curva por grupo; después, una prueba por parámetro (Asym común, xmid común, scal común)." },
      { "h0": "\\theta_k = 0", "h1": "\\theta_k \\ne 0", "texto": "Cada parámetro tiene su t y su p contra cero; rara vez es la pregunta de interés: importa más su intervalo de confianza." }
    ],
    "supuestos": [
      { "nombre": "Forma correcta de la curva", "como": "Mira la curva sobre los puntos y la gráfica de residuos contra valores ajustados (sin ondas); compara modelos con «El de menor AIC».", "verificar": null, "siFalla": "Si los residuos forman una onda, prueba Gompertz o Weibull; si la curva no se estabiliza, las fechas no llegan a la asíntota y conviene medir más tiempo.", "alternativa": null },
      { "nombre": "Varianza constante", "como": "Gráfica de residuos contra valores ajustados: la nube debe tener el mismo ancho a lo largo del eje.", "verificar": null, "siFalla": "Si las plantas grandes varían más, usa una columna de pesos (por ejemplo, el inverso de la varianza de cada fecha).", "alternativa": null },
      { "nombre": "Independencia de las observaciones", "como": "No se prueba. Si mediste la misma planta en todas las fechas, sus residuos se parecen entre sí.", "verificar": null, "siFalla": "Los EE salen demasiado chicos: ajusta una curva por planta (con la planta como grupo) y analiza sus parámetros con un diseño en bloques, o analiza la respuesta en el tiempo con medidas repetidas.", "alternativa": "medidas-repetidas" },
      { "nombre": "Errores aproximadamente normales", "como": "El semáforo cuenta los residuos que pasan de 3σ.", "verificar": null, "siFalla": "Revisa esas observaciones; los intervalos y las pruebas F dependen de esta aproximación.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura", "tipo": "numérica continua", "papel": "respuesta" },
        { "nombre": "dds", "tipo": "numérica continua (tiempo)", "papel": "tiempo (x)" },
        { "nombre": "tratamiento", "tipo": "factor con k niveles (opcional)", "papel": "grupo: una curva por nivel" },
        { "nombre": "pesos", "tipo": "numérica continua positiva (opcional)", "papel": "pesos" }
      ],
      "minimo": "Al menos 5 o 6 fechas que cubran la subida y el inicio de la estabilización; el modelo necesita más observaciones que parámetros (3 por grupo en el logístico y el de Gompertz, 4 en el de Weibull).",
      "balance": "Las filas con faltantes y las de peso cero se quitan; las fechas pueden ser distintas entre grupos. Si se repiten filas con la misma fecha y grupo, el ajuste usa sus medias pesadas, con el mismo óptimo.",
      "notaFormato": "Formato largo: una fila por medición, con el tiempo en una columna numérica y la respuesta en otra. Si tienes una columna por fecha (formato ancho), pásala a largo con «Ancha ⇄ larga…» en Datos.",
      "errores": [
        "Tener una columna por fecha (formato ancho) en lugar de una fila por medición.",
        "Usar fechas de calendario en lugar de días después de la siembra o del trasplante.",
        "Medir solo durante la subida: sin datos cerca de la estabilización, la asíntota no queda acotada y su intervalo es enorme.",
        "Ajustar la curva a las medias de las repeticiones sin pesos: se pierde la variación entre repeticiones (usa los datos crudos o pesa cada media por su número de plantas)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Revisa el semáforo (convergencia y atípicos) y la gráfica de la curva sobre los puntos.",
        "Si pediste «El de menor AIC», mira qué modelo ganó y su peso de Akaike.",
        "Lee los parámetros con sus intervalos: Asym (valor final), xmid (cuándo crece más rápido) y scal (rapidez); en Gompertz, el punto de inflexión está en los valores derivados.",
        "Con grupos, lee la prueba de una curva común y después cuál parámetro difiere entre grupos.",
        "Juzga el ajuste con σ y R², y usa el AIC solo para comparar modelos con los mismos datos."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La altura se ajustó a un modelo logístico por dosis de nitrógeno (R² = 0.99). Las curvas difirieron (F(9, 68) = 12.4, p < 0.001) solo en la asíntota (F(3, 68) = 9.5, p < 0.001): la altura final fue de 229 cm sin nitrógeno y de 267 cm con 120 kg/ha, mientras que el punto de inflexión (39 días) y la escala no cambiaron».",
      "guias": ["sigma", "r2", "F", "ic", "aic", "peso-akaike"]
    },
    "limitaciones": [
      "Trata cada observación como independiente: con la misma planta medida en varias fechas los EE son optimistas, y SigmaPro no tiene un modelo no lineal mixto.",
      "No incluye los bloques del experimento: su variación queda en el error.",
      "Para una respuesta que sube con la dosis y se estabiliza usa la respuesta a la dosis con meseta; para una que baja con la dosis, dosis-respuesta.",
      "Fuera del intervalo de tiempo medido, la curva es una extrapolación."
    ],
    "referencias": [
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley.",
      "Archontoulis, S. V., & Miguez, F. E. (2015). Nonlinear regression models and applications in agricultural research. Agronomy Journal, 107(2), 786–798.",
      "Paine, C. E. T., Marthews, T. R., Vogt, D. R., Purves, D., Rees, M., Hector, A., & Turnbull, L. A. (2012). How to fit nonlinear plant growth models and calculate growth rates: An update for ecologists. Methods in Ecology and Evolution, 3(2), 245–256.",
      "Seber, G. A. F., & Wild, C. J. (1989). Nonlinear regression. Wiley."
    ]
  },
  "en": {
    "alias": ["Logistic curve", "Gompertz model", "Weibull model", "Nonlinear growth regression"],
    "paraQue": "Fits an S-shaped curve to growth over time (height, biomass, leaf area) to estimate the maximum value, when growth is fastest and whether the treatment curves differ.",
    "preguntas": [
      "Does maize reach a greater final height with more nitrogen, and does the day of fastest growth change?",
      "What is the maximum biomass of two bean varieties, and on what day do they reach half of it?",
      "Does the growth curve of avocado fruit diameter differ among orchards?"
    ],
    "teoria": [
      "The growth of a plant or an organ usually follows an S: it starts slowly, speeds up, reaches its maximum rate at the inflection point and slows down as it approaches a maximum value, the asymptote. A polynomial can follow that shape within the data, but its coefficients have no biological meaning and it shoots off outside the measured range. Nonlinear growth models have parameters with meaning: the asymptote, the timing of the inflection and the speed of the rise.",
      "SigmaPro offers three. The logistic, y = Asym / (1 + exp((xmid − x)/scal)), is symmetric around its inflection xmid, where the response is half the asymptote. The Gompertz, y = Asym · exp(−b2 · b3^x), is asymmetric, with the inflection before the halfway point (the app computes it with its SE). The Weibull, y = Asym − Drop · exp(−exp(lrc) · x^pwr), is more flexible. It fits them by nonlinear least squares with the analytic gradient (validated against R’s nls) and gives Wald or profile likelihood intervals. With “Lowest AIC” it fits all three and chooses.",
      "With a group factor (rates, varieties), each group gets its own curve, and the extra-sum-of-squares F test compares that model with one common curve for all and with each parameter in common: this tells you whether treatments differ in the asymptote, in the timing of the inflection or in the speed."
    ],
    "modelo": {
      "tex": "y_{ij} = \\frac{\\mathrm{Asym}_i}{1 + \\exp\\left(\\frac{\\mathrm{xmid}_i - x_{ij}}{\\mathrm{scal}_i}\\right)} + \\varepsilon_{ij}",
      "terminos": [
        ["y_{ij}", "the response (height, biomass) of observation j in group i"],
        ["x_{ij}", "time (days after sowing, weeks)"],
        ["\\mathrm{Asym}_i", "the asymptote: the maximum value reached by the curve of group i"],
        ["\\mathrm{xmid}_i", "the time of the inflection point, when the curve is half the asymptote and grows fastest"],
        ["\\mathrm{scal}_i", "the scale: the smaller it is, the faster the rise; the maximum growth rate is Asym/(4·scal)"],
        ["\\varepsilon_{ij}", "the error, independent, with mean 0 and constant variance"]
      ]
    },
    "hipotesis": [
      { "h0": "\\mathrm{Asym}_1 = \\cdots = \\mathrm{Asym}_g, \\quad \\mathrm{xmid}_1 = \\cdots = \\mathrm{xmid}_g, \\quad \\mathrm{scal}_1 = \\cdots = \\mathrm{scal}_g", "h1": "\\text{some curve differs}", "texto": "With groups, a single curve describes them all. Extra-sum-of-squares F test of the model with one common curve against the one with a curve per group; then one test per parameter (common Asym, common xmid, common scal)." },
      { "h0": "\\theta_k = 0", "h1": "\\theta_k \\ne 0", "texto": "Each parameter has its t and p against zero; this is rarely the question of interest: its confidence interval matters more." }
    ],
    "supuestos": [
      { "nombre": "Correct shape of the curve", "como": "Look at the curve over the points and the plot of residuals vs. fitted values (no waves); compare models with “Lowest AIC”.", "verificar": null, "siFalla": "If the residuals form a wave, try Gompertz or Weibull; if the curve does not level off, the dates do not reach the asymptote and you should measure longer.", "alternativa": null },
      { "nombre": "Constant variance", "como": "Plot of residuals vs. fitted values: the cloud should have the same width along the axis.", "verificar": null, "siFalla": "If larger plants vary more, use a weights column (for example, the inverse of the variance of each date).", "alternativa": null },
      { "nombre": "Independence of the observations", "como": "Not tested. If you measured the same plant on every date, its residuals resemble each other.", "verificar": null, "siFalla": "The SEs come out too small: fit one curve per plant (with the plant as the group) and analyze its parameters in a block design, or analyze the response over time with repeated measures.", "alternativa": "medidas-repetidas" },
      { "nombre": "Approximately normal errors", "como": "The checklist counts the residuals beyond 3σ.", "verificar": null, "siFalla": "Check those observations; the intervals and F tests rely on this approximation.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "altura", "tipo": "continuous numeric", "papel": "response" },
        { "nombre": "dds", "tipo": "continuous numeric (time)", "papel": "time (x)" },
        { "nombre": "tratamiento", "tipo": "factor with k levels (optional)", "papel": "group: one curve per level" },
        { "nombre": "weights", "tipo": "positive continuous numeric (optional)", "papel": "weights" }
      ],
      "minimo": "At least 5 or 6 dates covering the rise and the start of the leveling off; the model needs more observations than parameters (3 per group in the logistic and Gompertz, 4 in the Weibull).",
      "balance": "Rows with missing values and rows with zero weight are dropped; dates can differ among groups. If rows repeat the same date and group, the fit uses their weighted means, with the same optimum.",
      "notaFormato": "Long format: one row per measurement, with time in one numeric column and the response in another. If you have one column per date (wide format), convert it to long with “Wide ⇄ long…” in Data.",
      "errores": [
        "Having one column per date (wide format) instead of one row per measurement.",
        "Using calendar dates instead of days after sowing or transplanting.",
        "Measuring only during the rise: without data near the leveling off, the asymptote is not bounded and its interval is huge.",
        "Fitting the curve to the replicate means without weights: the variation among replicates is lost (use the raw data or weight each mean by its number of plants)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Check the checklist (convergence and outliers) and the plot of the curve over the points.",
        "If you asked for “Lowest AIC”, see which model won and its Akaike weight.",
        "Read the parameters with their intervals: Asym (final value), xmid (when growth is fastest) and scal (speed); in Gompertz, the inflection point is in the derived values.",
        "With groups, read the common-curve test and then which parameter differs among groups.",
        "Judge the fit with σ and R², and use the AIC only to compare models on the same data."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Height was fitted to a logistic model by nitrogen rate (R² = 0.99). The curves differed (F(9, 68) = 12.4, p < 0.001) only in the asymptote (F(3, 68) = 9.5, p < 0.001): final height was 229 cm without nitrogen and 267 cm with 120 kg/ha, while the inflection point (39 days) and the scale did not change.”",
      "guias": ["sigma", "r2", "F", "ic", "aic", "peso-akaike"]
    },
    "limitaciones": [
      "It treats each observation as independent: with the same plant measured on several dates the SEs are optimistic, and SigmaPro has no nonlinear mixed model.",
      "It does not include the blocks of the experiment: their variation stays in the error.",
      "For a response that rises with the rate and levels off use the plateau response to rate; for one that falls with the dose, dose-response.",
      "Outside the measured time range, the curve is an extrapolation."
    ],
    "referencias": [
      "Bates, D. M., & Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley.",
      "Archontoulis, S. V., & Miguez, F. E. (2015). Nonlinear regression models and applications in agricultural research. Agronomy Journal, 107(2), 786–798.",
      "Paine, C. E. T., Marthews, T. R., Vogt, D. R., Purves, D., Rees, M., Hector, A., & Turnbull, L. A. (2012). How to fit nonlinear plant growth models and calculate growth rates: An update for ecologists. Methods in Ecology and Evolution, 3(2), 245–256.",
      "Seber, G. A. F., & Wild, C. J. (1989). Nonlinear regression. Wiley."
    ]
  }
});
