SP_FICHA({
  "id": "mejores-subconjuntos",
  "familia": "regresion",
  "respuesta": "continua",
  "estructura": "continua",
  "disenos": ["ninguno"],
  "relacionados": ["seleccion-pasos", "regresion-lineal", "matriz-correlacion", "correlacion-parcial"],
  "ejemplo": { "conjunto": "cafe", "entradas": { "respuesta": "rendimiento", "predictores": ["altitud", "temperatura", "lluvia", "materia_organica", "ph", "sombra", "edad"] }, "opciones": { "mejores": 2 } },
  "formato": {
    "largo": [["finca", "altitud", "temperatura", "lluvia", "materia_organica", "ph", "sombra", "edad", "rendimiento"], ["F01", "1342", "23.2", "2818", "6.5", "5.1", "33", "21", "17.6"], ["F02", "1053", "25.3", "2117", "6.8", "5.3", "23", "5", "15.4"], ["F03", "1048", "24.6", "2537", "2.2", "5.7", "61", "16", "4"], ["F04", "1442", "22.8", "2731", "4.2", "5.8", "38", "15", "14.4"], ["F05", "1629", "21.1", "2625", "6.8", "5.4", "29", "6", "20.5"], ["F06", "1557", "22.2", "2743", "6.6", "4.8", "69", "13", "19.1"]],
    "ancho": null
  },
  "es": {
    "alias": ["Todas las regresiones posibles", "Selección exhaustiva de variables", "Best subsets", "Cp de Mallows"],
    "paraQue": "Revisa todas las combinaciones de predictores y da las mejores de cada tamaño, para elegir un modelo sencillo que explique bien la respuesta.",
    "preguntas": [
      "Con siete variables del sitio, ¿cuál es la mejor combinación de dos, de tres o de cuatro para explicar el rendimiento del café?",
      "¿Hay varios modelos casi igual de buenos para predecir la biomasa de un pasto a partir de variables del suelo?",
      "¿A partir de cuántos predictores deja de compensar agregar otro?"
    ],
    "teoria": [
      "En lugar de avanzar un paso a la vez, la búsqueda de mejores subconjuntos ajusta todas las regresiones posibles con los candidatos: con m predictores son 2^m − 1 modelos. Para cada tamaño (1, 2, …, m predictores) ordena los modelos por su suma de cuadrados del error y conserva los mejores. Dentro de un mismo tamaño, el de menor SCE es también el de mayor R²; el problema es elegir entre tamaños, porque el R² siempre crece al agregar predictores.",
      "Para eso SigmaPro da tres criterios, con las fórmulas de leaps::regsubsets de R. La R² ajustada castiga levemente cada coeficiente. El Cp de Mallows compara la SCE de cada modelo con la varianza del error del modelo completo: un buen modelo tiene un Cp cercano o menor que su número de coeficientes, p, y SigmaPro señala el de menor Cp. El BIC de Schwarz, relativo al modelo con solo la media, castiga más cada predictor y suele elegir el modelo más sencillo. El cuadro marca el tamaño que elige cada criterio, y las gráficas muestran el BIC por tamaño y el Cp contra p con la recta Cp = p.",
      "Puedes pedir el mejor modelo de cada tamaño o los dos o tres mejores: ver modelos casi empatados con predictores distintos dice que esos predictores son intercambiables. La búsqueda es exacta, admite hasta 15 candidatos (32 767 modelos) y usa las mismas filas para todos ellos."
    ],
    "modelo": {
      "tex": "C_p = \\frac{SCE_p}{\\hat{\\sigma}^2} - (n - 2p), \\quad \\mathrm{BIC} = n \\ln \\left( \\frac{SCE_p}{SCT} \\right) + p \\ln n, \\quad R^2_{aj} = 1 - \\frac{SCE_p / (n - p)}{SCT / (n - 1)}",
      "terminos": [
        ["p", "el número de coeficientes del modelo, con el intercepto"],
        ["SCE_p", "la suma de cuadrados del error del modelo con p coeficientes"],
        ["\\hat{\\sigma}^2", "el cuadrado medio del error del modelo con todos los candidatos"],
        ["SCT", "la suma de cuadrados total (la del modelo con solo la media)"],
        ["n", "el número de observaciones completas"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "Los supuestos del modelo de regresión final", "como": "La búsqueda no los revisa: ajusta el modelo elegido en «Regresión lineal simple y múltiple» y lee su semáforo.", "verificar": "regresion-lineal", "siFalla": "Corrige el modelo (transformaciones, términos curvos) y vuelve a comparar subconjuntos.", "alternativa": null },
      { "nombre": "El modelo completo estima bien el error", "como": "El Cp toma el error del modelo con todos los candidatos como la varianza verdadera; revisa ese modelo completo en la regresión lineal.", "verificar": "regresion-lineal", "siFalla": "Si al modelo completo le falta una curvatura o un predictor importante, el Cp pierde su referencia: apóyate más en el BIC y en el criterio agronómico.", "alternativa": null },
      { "nombre": "Suficientes observaciones", "como": "SigmaPro exige más observaciones que coeficientes del modelo completo.", "verificar": null, "siFalla": "Con pocas observaciones por candidato, reduce la lista de candidatos antes de buscar.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "numérica continua", "papel": "respuesta (y)" },
        { "nombre": "altitud, temperatura, lluvia, materia_organica, ph, sombra, edad", "tipo": "numérica continua", "papel": "predictores candidatos (de 2 a 15)" },
        { "nombre": "finca", "tipo": "identificador", "papel": "identifica la observación (no se usa)" }
      ],
      "minimo": "De 2 a 15 candidatos numéricos, más observaciones que coeficientes del modelo completo y, como guía, 10 observaciones por candidato.",
      "balance": "Las filas con un faltante en la respuesta o en cualquier candidato no entran, para que todos los modelos usen los mismos datos; SigmaPro dice cuántas quedaron fuera.",
      "notaFormato": "Una fila por observación y una columna por variable numérica; la columna de identificación no se usa.",
      "errores": [
        "Quedarse con el modelo de mayor R²: siempre es el que tiene todos los predictores.",
        "Reportar los valores p del modelo elegido como si se hubiera planeado de antemano.",
        "Ignorar modelos casi empatados con otros predictores, que pueden ser más baratos de medir o más fáciles de explicar.",
        "Incluir factores codificados como números (1, 2, 3)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee en las conclusiones qué tamaño elige cada criterio (BIC, Cp y R² ajustada).",
        "En el cuadro, compara los mejores modelos de cada tamaño y la columna «Elegido por».",
        "En las gráficas, busca dónde el BIC deja de bajar y qué modelos quedan cerca o debajo de la recta Cp = p.",
        "Si los criterios no coinciden, prefiere el modelo más sencillo que tenga sentido agronómico y revísalo en la regresión lineal con el botón «Analizar el modelo de…», que aparece entre las gráficas y el cuadro."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Entre los 127 modelos posibles con siete variables del sitio, el BIC eligió uno de cinco predictores (R² ajustada = 0.85), mientras que el Cp de Mallows y la R² ajustada favorecieron uno de seis, con una ganancia de ajuste mínima; se adoptó el modelo más sencillo».",
      "guias": ["cp", "bic", "r2-ajustada", "r2"]
    },
    "limitaciones": [
      "Admite hasta 15 candidatos: con más, reduce la lista con criterio agronómico antes de buscar.",
      "Solo considera predictores numéricos, sin interacciones ni términos curvos.",
      "El mejor subconjunto en estos datos puede no serlo en otros: valida el modelo con datos nuevos cuando puedas.",
      "Los criterios eligen entre modelos, pero no garantizan que el elegido cumpla los supuestos: revísalo en la regresión lineal."
    ],
    "referencias": [
      "Mallows, C. L. (1973). Some comments on Cp. Technometrics, 15(4), 661–675.",
      "Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464.",
      "Furnival, G. M., & Wilson, R. W. (1974). Regressions by leaps and bounds. Technometrics, 16(4), 499–511.",
      "Hocking, R. R. (1976). The analysis and selection of variables in linear regression. Biometrics, 32(1), 1–49.",
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["All possible regressions", "Exhaustive variable selection", "Best subsets", "Mallows’ Cp"],
    "paraQue": "Checks every combination of predictors and gives the best ones of each size, to choose a simple model that explains the response well.",
    "preguntas": [
      "With seven site variables, which is the best combination of two, three or four to explain coffee yield?",
      "Are there several nearly equally good models to predict the biomass of a grass from soil variables?",
      "From how many predictors on does adding another one stop paying off?"
    ],
    "teoria": [
      "Instead of moving one step at a time, the best subsets search fits every possible regression with the candidates: with m predictors there are 2^m − 1 models. For each size (1, 2, …, m predictors) it ranks the models by their error sum of squares and keeps the best. Within a given size, the one with the smallest SSE also has the largest R²; the problem is to choose among sizes, because R² always grows when predictors are added.",
      "For that SigmaPro gives three criteria, with the formulas of R’s leaps::regsubsets. Adjusted R² mildly penalizes each coefficient. Mallows’ Cp compares the SSE of each model with the error variance of the full model: a good model has a Cp close to or below its number of coefficients, p, and SigmaPro flags the one with the smallest Cp. Schwarz’s BIC, relative to the intercept-only model, penalizes each predictor more and tends to choose the simplest model. The table marks the size chosen by each criterion, and the plots show the BIC by size and Cp against p with the line Cp = p.",
      "You can request the best model of each size or the best two or three: seeing nearly tied models with different predictors tells you those predictors are interchangeable. The search is exact, accepts up to 15 candidates (32,767 models) and uses the same rows for all of them."
    ],
    "modelo": {
      "tex": "C_p = \\frac{SSE_p}{\\hat{\\sigma}^2} - (n - 2p), \\quad \\mathrm{BIC} = n \\ln \\left( \\frac{SSE_p}{SST} \\right) + p \\ln n, \\quad R^2_{adj} = 1 - \\frac{SSE_p / (n - p)}{SST / (n - 1)}",
      "terminos": [
        ["p", "the number of coefficients in the model, including the intercept"],
        ["SSE_p", "the error sum of squares of the model with p coefficients"],
        ["\\hat{\\sigma}^2", "the error mean square of the model with all the candidates"],
        ["SST", "the total sum of squares (that of the intercept-only model)"],
        ["n", "the number of complete observations"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "The assumptions of the final regression model", "como": "The search does not check them: fit the chosen model in “Simple and multiple linear regression” and read its checklist.", "verificar": "regresion-lineal", "siFalla": "Fix the model (transformations, curved terms) and compare subsets again.", "alternativa": null },
      { "nombre": "The full model estimates the error well", "como": "Cp takes the error of the model with all the candidates as the true variance; check that full model in linear regression.", "verificar": "regresion-lineal", "siFalla": "If the full model lacks a curvature or an important predictor, Cp loses its reference: rely more on BIC and on agronomic judgment.", "alternativa": null },
      { "nombre": "Enough observations", "como": "SigmaPro requires more observations than coefficients in the full model.", "verificar": null, "siFalla": "With few observations per candidate, shorten the list of candidates before searching.", "alternativa": null }
    ],
    "datos": {
      "columnas": [
        { "nombre": "rendimiento", "tipo": "continuous numeric", "papel": "response (y)" },
        { "nombre": "altitud, temperatura, lluvia, materia_organica, ph, sombra, edad", "tipo": "continuous numeric", "papel": "candidate predictors (2 to 15)" },
        { "nombre": "finca", "tipo": "identifier", "papel": "identifies the observation (not used)" }
      ],
      "minimo": "2 to 15 numeric candidates, more observations than coefficients in the full model and, as a guide, 10 observations per candidate.",
      "balance": "Rows with a missing value in the response or in any candidate are left out, so that all models use the same data; SigmaPro tells you how many.",
      "notaFormato": "One row per observation and one column per numeric variable; the identification column is not used.",
      "errores": [
        "Keeping the model with the highest R²: it is always the one with all the predictors.",
        "Reporting the p-values of the chosen model as if it had been planned beforehand.",
        "Ignoring nearly tied models with other predictors, which may be cheaper to measure or easier to explain.",
        "Including factors coded as numbers (1, 2, 3)."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read in the conclusions which size each criterion chooses (BIC, Cp and adjusted R²).",
        "In the table, compare the best models of each size and the “Chosen by” column.",
        "In the plots, look for where the BIC stops decreasing and which models lie near or below the line Cp = p.",
        "If the criteria disagree, prefer the simplest model that makes agronomic sense and check it in linear regression with the “Analyze the model chosen by…” button, shown between the plots and the table."
      ],
      "ejemplo": "Example write-up (illustrative figures): “Among the 127 possible models with seven site variables, BIC chose one with five predictors (adjusted R² = 0.85), whereas Mallows’ Cp and adjusted R² favored one with six, with a minimal gain in fit; the simpler model was adopted.”",
      "guias": ["cp", "bic", "r2-ajustada", "r2"]
    },
    "limitaciones": [
      "It accepts up to 15 candidates: with more, shorten the list with agronomic judgment before searching.",
      "It only considers numeric predictors, without interactions or curved terms.",
      "The best subset in these data may not be the best in others: validate the model with new data when you can.",
      "The criteria choose among models, but they do not guarantee that the chosen one meets the assumptions: check it in linear regression."
    ],
    "referencias": [
      "Mallows, C. L. (1973). Some comments on Cp. Technometrics, 15(4), 661–675.",
      "Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464.",
      "Furnival, G. M., & Wilson, R. W. (1974). Regressions by leaps and bounds. Technometrics, 16(4), 499–511.",
      "Hocking, R. R. (1976). The analysis and selection of variables in linear regression. Biometrics, 32(1), 1–49.",
      "Draper, N. R., & Smith, H. (1998). Applied regression analysis (3rd ed.). Wiley."
    ]
  }
});
