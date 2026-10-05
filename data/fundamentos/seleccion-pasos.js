SP_FICHA({
  "id": "seleccion-pasos",
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["mejores-subconjuntos", "regresion-lineal", "matriz-correlacion", "correlacion-parcial"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "respuesta": "rendimiento", "predictores": ["altitud", "temperatura", "lluvia", "materia_organica", "ph", "sombra", "edad"] }, "opciones": { "criterio": "aic", "direccion": "ambas" } },
  "formato": {
    "largo": [["finca", "altitud", "temperatura", "lluvia", "materia_organica", "ph", "sombra", "edad", "rendimiento"], ["F01", "1342", "23.2", "2818", "6.5", "5.1", "33", "21", "17.6"], ["F02", "1053", "25.3", "2117", "6.8", "5.3", "23", "5", "15.4"], ["F03", "1048", "24.6", "2537", "2.2", "5.7", "61", "16", "4"], ["F04", "1442", "22.8", "2731", "4.2", "5.8", "38", "15", "14.4"], ["F05", "1629", "21.1", "2625", "6.8", "5.4", "29", "6", "20.5"], ["F06", "1557", "22.2", "2743", "6.6", "4.8", "69", "13", "19.1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Regresión paso a paso", "Selección stepwise", "Eliminación hacia atrás", "Selección hacia adelante"],
    "paraQue": "Elige de forma automática qué predictores conservar en una regresión, agregando o quitando uno a la vez.",
    "preguntas": [
      "De siete variables del sitio (altitud, temperatura, lluvia, materia orgánica, pH, sombra y edad), ¿cuáles bastan para explicar el rendimiento del café?",
      "¿Qué variables del suelo conviene medir para predecir el rendimiento de trigo, si medirlas todas es caro?",
      "¿Qué medidas morfológicas del fruto predicen mejor su peso en aguacate?"
    ],
    "teoria": [
      "Cuando hay muchos predictores candidatos, no todos aportan: algunos repiten lo que dicen otros, y meterlos todos hace al modelo inestable. La selección paso a paso construye el modelo un predictor a la vez. En cada paso evalúa qué pasaría al agregar cada candidato que está fuera o al quitar cada uno que está dentro, hace el cambio que más mejora el criterio y se detiene cuando ningún cambio lo mejora.",
      "SigmaPro ofrece dos criterios. Con AIC, como la función step de R, el criterio es AIC = n·ln(SCE/n) + 2k, que premia el ajuste y castiga cada coeficiente; la búsqueda puede ir en ambas direcciones desde el modelo completo, hacia atrás, o hacia adelante desde el modelo con solo la media. Con el valor p, entra el candidato cuya F parcial tiene el menor p, si es menor que el nivel para entrar, y sale el de mayor p si supera el nivel para salir; la búsqueda mixta alterna los dos pasos. Todos los modelos se ajustan sobre las mismas filas, las que no tienen faltantes en ningún candidato, para que sean comparables.",
      "El resultado muestra cada paso con su SC del error, su AIC y su R² ajustada, una gráfica del AIC por paso y los coeficientes del modelo final. Los valores p de ese modelo son optimistas, porque los mismos datos sirvieron para elegirlo; por eso la selección automática es una herramienta exploratoria. Distintos criterios o direcciones pueden llevar a modelos distintos, y eso también informa: señala predictores intercambiables."
    ],
    "modelo": {
      "tex": "\\mathrm{AIC} = n \\ln \\left( \\frac{SCE}{n} \\right) + 2k, \\quad F = \\frac{(SCE_0 - SCE_1) / (k_1 - k_0)}{SCE_1 / (n - k_1)}",
      "terminos": [
        ["n", "el número de observaciones completas"],
        ["SCE", "la suma de cuadrados del error del modelo"],
        ["k", "el número de coeficientes del modelo, con el intercepto"],
        ["SCE_0, SCE_1", "la SC del error del modelo sin y con el predictor que se evalúa (k₀ y k₁ coeficientes)"],
        ["F", "la F parcial con que entra o sale un predictor en el criterio de valor p"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "Solo con el criterio de valor p: la F parcial de cada candidato decide si entra (p menor que el nivel para entrar) o sale (p mayor que el nivel para salir). Con AIC no hay prueba de hipótesis, sino comparación de modelos." }
    ],
    "supuestos": [
      { "nombre": "Los supuestos del modelo de regresión final", "como": "La selección no los revisa: ajusta el modelo elegido en «Regresión lineal simple y múltiple» y lee su semáforo.", "verificar": "regresion-lineal", "siFalla": "Corrige el modelo (transformaciones, términos curvos) y vuelve a seleccionar.", "alternativa": null },
      { "nombre": "Predictores sin colinealidad fuerte", "como": "Revisa sus correlaciones en la matriz de correlaciones y el VIF del modelo completo en la regresión lineal.", "verificar": "matriz-correlacion", "siFalla": "Con predictores muy correlacionados el camino de la selección es inestable: quita los redundantes con criterio agronómico o compara con mejores subconjuntos.", "alternativa": "mejores-subconjuntos" },
      { "nombre": "Suficientes observaciones", "como": "SigmaPro exige más observaciones que coeficientes del modelo completo.", "verificar": null, "siFalla": "Con pocas observaciones por candidato, reduce la lista de candidatos antes de seleccionar.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta (y)" },
        { "nombre": "altitud, temperatura, lluvia, materia_organica, ph, sombra, edad", "tipo": "numérica continua", "papel": "predictores candidatos (de 2 a 15)" },
        { "nombre": "finca", "tipo": "identificador", "papel": "identifica la observación (no se usa)" }
      ],
      "minimo": "De 2 a 15 candidatos numéricos y, como guía, al menos 10 observaciones por candidato.",
      "balance": "Las filas con un faltante en la respuesta o en cualquier candidato no entran, para que todos los modelos usen los mismos datos; SigmaPro dice cuántas quedaron fuera.",
      "notaFormato": "Una fila por observación y una columna por variable numérica; la columna de identificación no se usa.",
      "errores": [
        "Tomar el modelo elegido como el verdadero y reportar sus valores p sin advertir que son optimistas.",
        "Usar como candidatos variables calculadas a partir de la respuesta.",
        "Incluir factores codificados como números (1, 2, 3).",
        "Fijar en la búsqueda mixta un nivel para entrar mayor que el de salir (SigmaPro no lo permite, porque una variable podría entrar y salir sin fin)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee las conclusiones: cuántos predictores quedaron y cuáles.",
        "Recorre el cuadro de pasos: qué entró o salió en cada uno y cómo cambiaron el AIC y la R² ajustada; la gráfica muestra el AIC por paso.",
        "Revisa los coeficientes del modelo final y su sentido agronómico.",
        "Ajusta ese modelo en la regresión lineal para revisar su semáforo y la colinealidad."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «La selección por AIC en ambas direcciones, a partir de siete variables del sitio, solo quitó la temperatura, muy correlacionada con la altitud, y retuvo la altitud, la lluvia, la materia orgánica, el pH, la sombra y la edad del cafetal (R² ajustada = 0.85). Por su carácter exploratorio, el modelo se confirmó con su diagnóstico y con el conocimiento del cultivo».",
      "guias": ["aic", "r2-ajustada", "F", "p", "coeficiente"]
    },
    "limitaciones": [
      "El AIC de este análisis, n·ln(SCE/n) + 2k, difiere en una constante del que da la regresión lineal: compara valores de AIC solo dentro de un mismo análisis.",
      "La selección paso a paso no revisa todas las combinaciones y puede detenerse en un buen modelo que no es el mejor: compárala con mejores subconjuntos.",
      "Solo considera predictores numéricos, sin interacciones ni términos curvos; para esos modelos usa el modelo lineal general.",
      "Con predictores muy correlacionados, el modelo elegido cambia mucho con pequeñas variaciones de los datos."
    ],
    "referencias": [
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723.",
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "Harrell, F. E., Jr. (2015). Regression modeling strategies: With applications to linear models, logistic and ordinal regression, and survival analysis (2nd ed.). Springer."
    ]
  },
  "en": {
    "alias": ["Stepwise regression", "Stepwise selection", "Backward elimination", "Forward selection"],
    "paraQue": "Automatically chooses which predictors to keep in a regression, adding or removing one at a time.",
    "preguntas": [
      "Of seven site variables (altitude, temperature, rainfall, organic matter, pH, shade and age), which are enough to explain coffee yield?",
      "Which soil variables should be measured to predict wheat yield, if measuring all of them is expensive?",
      "Which fruit morphological measurements best predict avocado fruit weight?"
    ],
    "teoria": [
      "When there are many candidate predictors, not all of them contribute: some repeat what others say, and including all of them makes the model unstable. Stepwise selection builds the model one predictor at a time. At each step it evaluates what would happen when adding each candidate that is out or removing each one that is in, makes the change that most improves the criterion, and stops when no change improves it.",
      "SigmaPro offers two criteria. With AIC, like R’s step function, the criterion is AIC = n·ln(SSE/n) + 2k, which rewards fit and penalizes each coefficient; the search can go in both directions from the full model, backward, or forward from the intercept-only model. With the p-value, the candidate whose partial F has the smallest p enters if it is below the level to enter, and the one with the largest p is removed if it exceeds the level to remove; the stepwise (mixed) search alternates both steps. All models are fitted on the same rows, those with no missing value in any candidate, so that they are comparable.",
      "The result shows each step with its error SS, its AIC and its adjusted R², a plot of the AIC by step, and the coefficients of the final model. The p-values of that model are optimistic, because the same data were used to choose it; that is why automatic selection is an exploratory tool. Different criteria or directions may lead to different models, and that is informative too: it points to interchangeable predictors."
    ],
    "modelo": {
      "tex": "\\mathrm{AIC} = n \\ln \\left( \\frac{SSE}{n} \\right) + 2k, \\quad F = \\frac{(SSE_0 - SSE_1) / (k_1 - k_0)}{SSE_1 / (n - k_1)}",
      "terminos": [
        ["n", "the number of complete observations"],
        ["SSE", "the error sum of squares of the model"],
        ["k", "the number of coefficients in the model, including the intercept"],
        ["SSE_0, SSE_1", "the error SS of the model without and with the predictor being evaluated (k₀ and k₁ coefficients)"],
        ["F", "the partial F with which a predictor enters or leaves under the p-value criterion"]
      ]
    },
    "hipotesis": [
      { "h0": "\\beta_j = 0", "h1": "\\beta_j \\ne 0", "texto": "Only with the p-value criterion: the partial F of each candidate decides whether it enters (p below the level to enter) or leaves (p above the level to remove). With AIC there is no hypothesis test, but a comparison of models." }
    ],
    "supuestos": [
      { "nombre": "The assumptions of the final regression model", "como": "The selection does not check them: fit the chosen model in “Simple and multiple linear regression” and read its checklist.", "verificar": "regresion-lineal", "siFalla": "Fix the model (transformations, curved terms) and select again.", "alternativa": null },
      { "nombre": "Predictors without strong collinearity", "como": "Check their correlations in the correlation matrix and the VIF of the full model in linear regression.", "verificar": "matriz-correlacion", "siFalla": "With highly correlated predictors the selection path is unstable: drop the redundant ones with agronomic judgment or compare with best subsets.", "alternativa": "mejores-subconjuntos" },
      { "nombre": "Enough observations", "como": "SigmaPro requires more observations than coefficients in the full model.", "verificar": null, "siFalla": "With few observations per candidate, shorten the list of candidates before selecting.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response (y)" },
        { "nombre": "altitud, temperatura, lluvia, materia_organica, ph, sombra, edad", "tipo": "continuous numeric", "papel": "candidate predictors (2 to 15)" },
        { "nombre": "finca", "tipo": "identifier", "papel": "identifies the observation (not used)" }
      ],
      "minimo": "2 to 15 numeric candidates and, as a guide, at least 10 observations per candidate.",
      "balance": "Rows with a missing value in the response or in any candidate are left out, so that all models use the same data; SigmaPro tells you how many.",
      "notaFormato": "One row per observation and one column per numeric variable; the identification column is not used.",
      "errores": [
        "Taking the chosen model as the true one and reporting its p-values without warning that they are optimistic.",
        "Using as candidates variables computed from the response.",
        "Including factors coded as numbers (1, 2, 3).",
        "Setting, in the stepwise search, a level to enter larger than the level to remove (SigmaPro does not allow it, because a variable could enter and leave endlessly)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the conclusions: how many predictors remained and which ones.",
        "Go through the steps table: what entered or left at each step and how the AIC and adjusted R² changed; the plot shows the AIC by step.",
        "Review the coefficients of the final model and their agronomic sense.",
        "Fit that model in linear regression to check its assumptions checklist and collinearity."
      ],
      "ejemplo": "Example write-up (illustrative figures): “AIC selection in both directions, starting from seven site variables, only removed temperature, which is highly correlated with altitude, and retained altitude, rainfall, organic matter, pH, shade and plantation age (adjusted R² = 0.85). Given its exploratory nature, the model was confirmed with its diagnostics and with knowledge of the crop.”",
      "guias": ["aic", "r2-ajustada", "F", "p", "coeficiente"]
    },
    "limitaciones": [
      "The AIC of this analysis, n·ln(SSE/n) + 2k, differs by a constant from the one given by linear regression: compare AIC values only within the same analysis.",
      "Stepwise selection does not check every combination and may stop at a good model that is not the best: compare it with best subsets.",
      "It only considers numeric predictors, without interactions or curved terms; for such models use the general linear model.",
      "With highly correlated predictors, the chosen model changes a lot with small variations in the data."
    ],
    "referencias": [
      "Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723.",
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley.",
      "Venables, W. N., & Ripley, B. D. (2002). Modern applied statistics with S (4th ed.). Springer.",
      "Harrell, F. E., Jr. (2015). Regression modeling strategies: With applications to linear models, logistic and ordinal regression, and survival analysis (2nd ed.). Springer."
    ]
  }
});
