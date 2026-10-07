/* SigmaPro — registro de estadísticos (Fase 5).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una ficha por estadístico, una sola vez para toda la app: su nombre, símbolo, grupo, qué es (en palabras claras) y
   los títulos de columna o de fila con que aparece en los cuadros de los análisis. De aquí salen los medidores, la
   interpretación y el glosario (Hitos 5.1 a 5.5) y el inventario (tools/inventario/inventario.mjs).
   Módulo puro (sin DOM), probado en node:

     SP.guias.fichas()               todas, en el orden del glosario
     SP.guias.ficha(id)              una por su id
     SP.guias.buscar(clave, titulo)  la ficha del estadístico de una columna (o de una fila, sin clave), o null

   Los títulos se reconocen en español; con la interfaz en inglés, SP.T.origen devuelve el título en español del que
   salió cada texto traducido. */
SP.definir('guias', function (SP) {
  'use strict';
  const T = SP.T;

  const GRUPOS = [
    ['prueba', T('Estadísticos de prueba')], ['efecto', T('Tamaño del efecto y asociación')], ['ajuste', T('Ajuste y comparación de modelos')],
    ['modelo', T('Estimaciones del modelo')], ['descriptivo', T('Descriptivos')], ['precision', T('Precisión')],
    ['diagnostico', T('Diagnóstico de observaciones')], ['genetica', T('Genética cuantitativa')], ['potencia', T('Potencia y tamaño de muestra')],
  ];

  /* [id, grupo, símbolo, nombre, qué es, [títulos]] — los títulos, sin acentos y en minúsculas; un par [título, clave]
     pide además la clave interna de la columna (la «d» de Cohen y la «D» de la deseabilidad se escriben igual) */
  const F = [
    /* ---- pruebas ---- */
    ['p', 'prueba', 'p', T('Valor p'), T('Probabilidad de obtener un resultado tan extremo como el observado, o más, si la hipótesis nula fuera cierta. Un p menor que α es evidencia contra la hipótesis nula; no es la probabilidad de que esta sea cierta ni dice qué tan grande es el efecto.'),
      [/^p$/, /^valor p$/, /^p sin ajustar$/, /^p · /]],
    ['p-ajustado', 'prueba', 'p aj.', T('Valor p ajustado'), T('Valor p corregido porque se hicieron varias pruebas a la vez (Tukey, Holm, Bonferroni…), para que la probabilidad de declarar alguna diferencia que no existe no pase de α.'),
      [/^p ajustado$/]],
    ['F', 'prueba', 'F', T('F de Fisher'), T('Cociente entre el cuadrado medio de un término y el del error. Cerca de 1, el término no explica más variación que el azar; mientras más grande, más evidencia de que tiene efecto.'),
      [/^f$/, /^f (secuencial|parcial|genotipos|aprox\.)$/, /^f_r$/, /^f · /, /^f \(/]],
    ['t', 'prueba', 't', T('t de Student'), T('Distancia entre lo estimado y el valor de la hipótesis nula, medida en errores estándar. Con muchos grados de libertad, |t| mayor que 2 corresponde más o menos a p < 0.05.'),
      [/^t$/, /^t de (student|welch|una muestra)$/, /^t pareada$/, /^t \(/]],
    ['z', 'prueba', 'z', T('Estadístico z'), T('Distancia entre lo estimado y el valor de la hipótesis nula en errores estándar, comparada con la normal estándar: |z| mayor que 1.96 corresponde a p < 0.05 en una prueba bilateral.'),
      [/^z$/]],
    ['chi2', 'prueba', 'χ²', T('Ji cuadrada'), T('Suma de las diferencias entre lo observado y lo esperado bajo la hipótesis nula, al cuadrado y relativas a lo esperado. Mientras más grande frente a sus grados de libertad, más se alejan los datos de la hipótesis.'),
      [/^χ²$/, /^ji cuadrada de pearson/]],
    ['chi2-celda', 'prueba', 'χ²ᵢ', T('Contribución a la ji cuadrada'), T('Lo que aporta cada celda a la χ² total: señala dónde se aleja más lo observado de lo esperado.'),
      [/^contribucion a χ²$/]],
    ['lrt', 'prueba', 'G²', T('Razón de verosimilitudes'), T('Dos veces la diferencia de log-verosimilitud entre un modelo y otro más sencillo contenido en él; se compara con una χ² con tantos grados de libertad como parámetros de diferencia.'),
      [/^lrt$/, /^χ² \(rv\)$/, /^razon de verosimilitudes/]],
    ['gl', 'prueba', 'gl', T('Grados de libertad'), T('Cantidad de información independiente con que se estima una variación; fija la forma de la distribución de referencia (t, F o χ²).'),
      [/^gl( num\.| den\.| error| del error| residuales)?$/]],
    ['q', 'prueba', 'q', T('Rango estudentizado'), T('Diferencia entre dos medias dividida entre su error estándar, comparada con la distribución del rango estudentizado (la de la prueba de Tukey).'),
      [/^q$/]],
    ['wilcoxon', 'prueba', 'V, W', T('Estadístico de Wilcoxon'), T('Suma de rangos (V para una muestra o datos pareados; W, igual a la U de Mann-Whitney, para dos grupos). Compara posiciones sin suponer normalidad.'),
      [/^[vw]$/]],
    ['kruskal', 'prueba', 'H', T('H de Kruskal-Wallis'), T('Compara tres o más grupos por los rangos de sus datos; se aproxima a una χ² con k − 1 grados de libertad. No supone normalidad.'),
      [/^h$/, /^kruskal-wallis$/]],
    ['friedman', 'prueba', 'χ²F', T('Prueba de Friedman'), T('Compara tratamientos dentro de bloques por rangos (la alternativa al ANOVA en bloques sin suponer normalidad).'),
      [/^friedman$/]],
    ['shapiro', 'prueba', 'W', T('Shapiro-Wilk'), T('Prueba de normalidad. W cerca de 1 indica datos (o residuos) compatibles con la normal; un p pequeño, que se alejan de ella. Con muchos datos detecta desvíos sin importancia práctica: mira también el gráfico de cuantiles.'),
      [/^shapiro-wilk$/]],
    ['lilliefors', 'prueba', 'D', T('Lilliefors'), T('Prueba de normalidad de Kolmogorov-Smirnov con la media y la desviación estimadas de los datos: mide la mayor distancia entre la distribución acumulada observada y la normal.'),
      [/^lilliefors$/]],
    ['anderson-darling', 'prueba', 'A²', T('Anderson-Darling'), T('Prueba de normalidad que da más peso a las colas que la de Lilliefors.'),
      [/^anderson-darling$/]],
    ['levene', 'prueba', 'F', T('Levene'), T('Prueba de varianzas iguales entre grupos: un ANOVA de las desviaciones absolutas a la media de cada grupo.'),
      [/^levene$/]],
    ['brown-forsythe', 'prueba', 'F', T('Brown-Forsythe'), T('Variante de Levene con las desviaciones a la mediana: más robusta si los datos no son normales.'),
      [/^brown-forsythe$/]],
    ['bartlett', 'prueba', 'K²', T('Bartlett'), T('Prueba de varianzas iguales entre grupos; potente con datos normales pero sensible a la falta de normalidad.'),
      [/^bartlett$/]],
    ['fligner', 'prueba', 'χ²', T('Fligner-Killeen'), T('Prueba de varianzas iguales por rangos, la más robusta ante datos no normales y atípicos.'),
      [/^fligner-killeen$/]],
    ['durbin-watson', 'diagnostico', 'DW', T('Durbin-Watson'), T('Revisa si los residuos consecutivos están correlacionados. Cerca de 2: sin autocorrelación; menor que 2, positiva; mayor que 2, negativa.'),
      [/^durbin-watson$/]],
    ['breusch-pagan', 'prueba', 'BP', T('Breusch-Pagan'), T('Prueba de varianza constante de los residuos en una regresión: un p pequeño indica que la variación cambia con los predictores.'),
      [/^breusch-pagan$/]],
    ['reset', 'prueba', 'F', T('RESET de Ramsey'), T('Prueba de la forma del modelo: revisa si potencias de los valores ajustados explican algo más (falta una curva o una interacción).'),
      [/^reset$/]],
    ['falta-ajuste', 'prueba', 'F', T('Falta de ajuste'), T('Compara el error del modelo con el error puro de las repeticiones: un p pequeño indica que el modelo no sigue la forma de los datos.'),
      [/^falta de ajuste$/]],
    ['rachas', 'prueba', 'z', T('Prueba de rachas'), T('Revisa si los signos de los residuos, en orden, se alternan al azar; pocas o demasiadas rachas sugieren falta de independencia.'),
      [/^rachas$/]],
    ['tukey-aditividad', 'prueba', 'F', T('No aditividad de Tukey'), T('Prueba de un grado de libertad para la interacción bloque × tratamiento que el diseño en bloques supone ausente.'),
      [/^no aditividad de tukey$/]],
    ['atipico-bonferroni', 'prueba', 't', T('Prueba de atípicos (Bonferroni)'), T('El mayor residuo estudentizado, con su p corregido por el número de observaciones: un p pequeño señala una observación atípica.'),
      [/^residuo estudentizado \(bonferroni\)$/]],
    ['fisher-exacta', 'prueba', 'p', T('Prueba exacta de Fisher'), T('Probabilidad exacta de tablas tan o más extremas que la observada con los mismos totales; sirve con frecuencias esperadas pequeñas.'),
      [/^fisher exacta$/]],
    ['mcnemar', 'prueba', 'χ²', T('McNemar'), T('Compara dos proporciones pareadas (el mismo individuo antes y después) con los pares que cambiaron.'),
      [/^mcnemar/]],
    ['binomial-exacta', 'prueba', 'p', T('Prueba binomial exacta'), T('Probabilidad exacta, con la distribución binomial, de un número de éxitos tan o más alejado de lo esperado.'),
      [/^binomial exacta$/]],
    ['cmh', 'prueba', 'χ²', T('Cochran-Mantel-Haenszel'), T('Prueba de asociación entre dos factores de dos niveles controlando un tercero (estratos).'),
      [/^cochran-mantel-haenszel/]],
    ['breslow-day', 'prueba', 'χ²', T('Breslow-Day'), T('Revisa si la razón de momios es la misma en todos los estratos (la condición para combinarla).'),
      [/^homogeneidad de breslow-day$/, /^breslow-day/]],
    ['pillai', 'prueba', 'V', T('Traza de Pillai'), T('Estadístico del MANOVA, el más robusto cuando las covarianzas difieren entre grupos.'),
      [/^pillai$/]],
    ['wilks', 'prueba', 'Λ', T('Lambda de Wilks'), T('Estadístico del MANOVA: la proporción de variación multivariada que no explican los tratamientos (cerca de 0, mucho efecto).'),
      [/^wilks$/]],
    ['hotelling', 'prueba', 'T²', T('Traza de Hotelling-Lawley'), T('Estadístico del MANOVA: suma de las razones entre variación de tratamientos y del error en cada dirección.'),
      [/^hotelling-lawley$/]],
    ['roy', 'prueba', 'θ', T('Raíz mayor de Roy'), T('Estadístico del MANOVA que solo mira la dirección de mayor separación: potente si el efecto está en una sola dirección.'),
      [/^roy$/]],
    /* ---- tamaño del efecto y asociación ---- */
    ['d-cohen', 'efecto', 'd', T('d de Cohen'), T('Diferencia de medias medida en desviaciones estándar. Guía de Cohen (1988): 0.2 pequeña, 0.5 mediana, 0.8 grande.'),
      [/^d de cohen$/, /^d_z de cohen/, [/^d$/, /^d$/]]],
    ['deseabilidad', 'ajuste', 'D', T('Deseabilidad global'), T('Media geométrica de las deseabilidades de cada respuesta: 0 si alguna queda fuera de lo aceptable, 1 si todas están en su meta.'),
      [/^deseabilidad/, [/^d$/, /^D$/]]],
    ['g-hedges', 'efecto', 'g', T('g de Hedges'), T('La d de Cohen corregida por el sesgo de las muestras pequeñas; se lee con la misma guía.'),
      [/^g de hedges$/]],
    ['f-cohen', 'efecto', 'f', T('f de Cohen'), T('Tamaño del efecto en un ANOVA: la desviación de las medias de los tratamientos entre la del error. Guía de Cohen: 0.10 pequeño, 0.25 mediano, 0.40 grande.'),
      [/^f de cohen$/]],
    ['h-cohen', 'efecto', 'h', T('h de Cohen'), T('Diferencia entre dos proporciones en la escala del arcoseno. Guía de Cohen: 0.2 pequeña, 0.5 mediana, 0.8 grande.'),
      [/^h de cohen$/]],
    ['eta2-h', 'efecto', 'η²H', T('η² de H'), T('Tamaño del efecto de Kruskal-Wallis: la parte de la variación de los rangos que explican los grupos.'),
      [/^η² de h$/]],
    ['w-kendall', 'efecto', 'W', T('W de Kendall'), T('Concordancia entre bloques en la prueba de Friedman: 0 sin acuerdo, 1 todos los bloques ordenan igual a los tratamientos.'),
      [/^w de kendall$/]],
    ['r', 'efecto', 'r', T('Correlación de Pearson'), T('Asociación lineal entre dos variables, de −1 a 1. Guía de Cohen: 0.1 débil, 0.3 moderada, 0.5 fuerte. No implica causa.'),
      [/^r$/, /^correlacion$/, /^coeficiente \(r\)$/, /^simple$/, /^parcial/, /^semiparcial/]],
    ['rho', 'efecto', 'ρ', T('Correlación de Spearman'), T('Correlación entre los rangos: mide asociación monótona (que crezcan juntas aunque no en línea recta), de −1 a 1.'),
      [/^ρ$/, /^coeficiente \(ρ\)$/]],
    ['tau', 'efecto', 'τ', T('τ de Kendall'), T('Asociación por pares concordantes y discordantes, de −1 a 1; sus valores son más bajos que los de ρ para la misma asociación.'),
      [/^τ$/, /^coeficiente \(τ\)$/, /^τ-b de kendall$/]],
    ['tau-c', 'efecto', 'τc', T('τ-c de Stuart'), T('Variante de τ para tablas rectangulares de factores ordenados.'),
      [/^τ-c de stuart$/]],
    ['gamma-gk', 'efecto', 'γ', T('γ de Goodman y Kruskal'), T('Asociación entre factores ordenados con los pares concordantes y discordantes, sin contar empates; de −1 a 1.'),
      [/^γ \(gamma\)$/]],
    ['somers', 'efecto', 'd', T('d de Somers'), T('Asociación asimétrica entre factores ordenados: cuánto predice uno el orden del otro.'),
      [/^d de somers/]],
    ['phi', 'efecto', 'φ', T('Coeficiente φ'), T('Asociación en una tabla 2 × 2, de −1 a 1 (igual a la correlación entre dos variables 0/1).'),
      [/^φ$/]],
    ['v-cramer', 'efecto', 'V', T('V de Cramér'), T('Asociación entre dos factores, de 0 (independientes) a 1; corrige la χ² por el tamaño de la muestra y de la tabla.'),
      [/^v de cramer$/]],
    ['contingencia', 'efecto', 'C', T('Coeficiente de contingencia'), T('Asociación entre dos factores a partir de la χ²; su máximo es menor que 1 y depende del tamaño de la tabla.'),
      [/^coeficiente de contingencia$/]],
    ['lambda-gk', 'efecto', 'λ', T('λ de Goodman y Kruskal'), T('Cuánto se reduce el error al predecir un factor conociendo el otro (0 nada, 1 por completo).'),
      [/^λ \(/, /^λ simetrica$/]],
    ['incertidumbre', 'efecto', 'U', T('Coeficiente de incertidumbre'), T('Proporción de la entropía de un factor que se explica con el otro (0 a 1).'),
      [/^incertidumbre/]],
    ['kappa', 'efecto', 'κ', T('κ de Cohen'), T('Acuerdo entre dos calificaciones más allá del azar: 0 como el azar, 1 acuerdo perfecto. Guía de Landis y Koch: 0.41–0.60 moderada, 0.61–0.80 considerable.'),
      [/^κ/, /kappa/]],
    ['razon-momios', 'efecto', 'OR', T('Razón de momios'), T('Cuántas veces más (o menos) probable es el evento frente a no ocurrir en un grupo que en otro; 1 es sin efecto.'),
      [/^razon de momios$/, /^or$/]],
    ['razon-tasas', 'efecto', 'RT', T('Razón de tasas'), T('Cociente entre las tasas (conteos esperados) de dos grupos; 1 es sin efecto, 1.2 es 20 % más.'),
      [/^razon de tasas$/]],
    ['razon-medias', 'efecto', 'RM', T('Razón de medias'), T('Cociente entre las medias de dos grupos en un modelo con enlace logarítmico; 1 es sin efecto.'),
      [/^razon de medias$/]],
    ['eficiencia', 'efecto', 'ER', T('Eficiencia relativa'), T('Cuánta más precisión dio el diseño o la covariable que la alternativa más sencilla: 150 % equivale a tener 1.5 veces las repeticiones.'),
      [/^eficiencia relativa/, /^factor de eficiencia del bib/]],
    /* ---- ajuste y comparación de modelos ---- */
    ['r2', 'ajuste', 'R²', T('Coeficiente de determinación'), T('Proporción de la variación de la respuesta que explica el modelo, de 0 a 1. Sube siempre que se agregan términos: para comparar modelos usa la R² ajustada o el AIC.'),
      [/^r²$/, /^r² del modelo$/, /^r² \(.*scr\/sct\)$/, /^determinacion/]],
    ['r2-ajustada', 'ajuste', 'R²aj', T('R² ajustada'), T('R² que descuenta los términos del modelo: solo sube si el término nuevo explica más de lo que explicaría el azar.'),
      [/^r² ajustada$/]],
    ['aic', 'ajuste', 'AIC', T('Criterio de información de Akaike'), T('Equilibrio entre ajuste y número de parámetros para comparar modelos con los mismos datos: menor es mejor; diferencias menores que 2 no distinguen a los modelos.'),
      [/^aic$/]],
    ['bic', 'ajuste', 'BIC', T('Criterio de información bayesiano'), T('Como el AIC pero castiga más los parámetros cuando hay muchos datos: menor es mejor.'),
      [/^bic$/]],
    ['delta-aic', 'ajuste', 'ΔAIC', T('Diferencia de AIC'), T('AIC de cada modelo menos el del mejor. Hasta 2, apoyo sustancial; de 4 a 7, bastante menos; más de 10, casi nada (Burnham y Anderson, 2002).'),
      [/^δaic$/]],
    ['peso-akaike', 'ajuste', 'w', T('Peso de Akaike'), T('Probabilidad relativa de que cada modelo sea el mejor de los comparados; suman 1.'),
      [/^peso de akaike$/]],
    ['loglik', 'ajuste', 'ℓ', T('Log-verosimilitud'), T('Qué tan probables son los datos con el modelo ajustado; sirve para comparar modelos anidados (razón de verosimilitudes) y para el AIC.'),
      [/^log-verosimilitud( penalizada| restringida)?$/]],
    ['devianza', 'ajuste', 'D', T('Devianza'), T('Falta de ajuste de un modelo generalizado frente al modelo perfecto (el que reproduce cada dato). La nula es la del modelo sin predictores.'),
      [/^devianza( residual| nula)?$/]],
    ['dispersion', 'ajuste', 'φ', T('Dispersión'), T('χ² de Pearson entre sus grados de libertad. En Poisson y binomial debería estar cerca de 1; mucho mayor indica sobredispersión.'),
      [/^dispersion \(pearson χ²\/gl\)$/]],
    ['sigma', 'ajuste', 'σ', T('Error estándar residual'), T('Desviación típica de los residuos, en las unidades de la respuesta: el error típico de una predicción del modelo.'),
      [/^error estandar (residual|de la estimacion) \(σ\)$/, /^σ$/]],
    ['cp', 'ajuste', 'Cp', T('Cp de Mallows'), T('Para elegir predictores: un buen subconjunto tiene Cp cerca del número de parámetros.'),
      [/^cp$/]],
    ['parametros', 'ajuste', 'k', T('Número de parámetros'), T('Cuántos valores estima el modelo; entra en el AIC, el BIC y los grados de libertad.'),
      [/^parametros$/, /^predictores$/]],
    ['theta-nb', 'ajuste', 'θ', T('θ de la binomial negativa'), T('Parámetro de forma de la binomial negativa: mientras más pequeño, más sobredispersión; muy grande equivale a Poisson.'),
      [/^θ de la binomial negativa$/]],
    /* ---- estimaciones del modelo ---- */
    ['coeficiente', 'modelo', 'β', T('Coeficiente estimado'), T('Cambio esperado en la respuesta (o en su escala de enlace) por cada unidad del predictor, o la diferencia de un nivel frente al de referencia.'),
      [/^(estimado|coeficiente|estimacion|pendiente)$/]],
    ['beta-std', 'modelo', 'β*', T('Coeficiente estandarizado'), T('Coeficiente en desviaciones estándar de la respuesta por desviación estándar del predictor: permite comparar predictores en unidades distintas.'),
      [/^β estandarizado$/]],
    ['diferencia', 'modelo', 'Δ', T('Diferencia de medias'), T('Diferencia estimada entre dos medias o niveles, en las unidades de la respuesta.'),
      [/^diferencia( \(enlace\))?$/, /^dif\. de/, /^diferencia con el testigo$/, /^mediana de las diferencias$/]],
    ['sc', 'modelo', 'SC', T('Suma de cuadrados'), T('Variación (suma de desviaciones al cuadrado) que se atribuye a una fuente del modelo.'),
      [/^sc( secuencial| parcial| del error)?$/, /^suma de cuadrados residual$/]],
    ['cm', 'modelo', 'CM', T('Cuadrado medio'), T('Suma de cuadrados entre sus grados de libertad: una varianza. El del error (CME) estima la varianza residual.'),
      [/^cm$/, /^cme$/, /^cm del error/]],
    ['blup', 'modelo', 'BLUP', T('Mejor predictor lineal insesgado'), T('Predicción de un efecto aleatorio (un genotipo, un bloque) encogida hacia la media según la información que hay de él.'),
      [/^blup$/, /^efecto \(blup\)$/, /^valor genotipico \(blup\)$/]],
    ['valor-propio', 'modelo', 'λ', T('Valor propio'), T('Curvatura de la superficie de respuesta en cada dirección principal: todos negativos, un máximo; todos positivos, un mínimo; de signos mixtos, un punto de silla.'),
      [/^valor propio$/]],
    ['hodges-lehmann', 'modelo', 'HL', T('Estimador de Hodges-Lehmann'), T('Diferencia (o centro) típica estimada por rangos: la mediana de las diferencias por pares; robusta ante atípicos.'),
      [/^diferencia \(hodges-lehmann\)$/, /^seudomediana$/]],
    /* ---- descriptivos ---- */
    ['n', 'descriptivo', 'n', T('Tamaño de muestra'), T('Número de observaciones (o de pares, o de unidades) con que se calculó el resultado.'),
      [/^n$/, /^observaciones$/, /^pares de datos$/]],
    ['media', 'descriptivo', 'x̄', T('Media'), T('Promedio aritmético: la suma de los datos entre su número. Sensible a los valores extremos.'),
      [/^media( general| general estimada| sin ajustar)?$/]],
    ['media-ajustada', 'descriptivo', 'μ̂', T('Media ajustada'), T('Media estimada por el modelo, corregida por bloques, covariables o celdas faltantes (media marginal): la que se compara entre tratamientos.'),
      [/^media ajustada/, /^media marginal/, /^(tasa|probabilidad)$/]],
    ['mediana', 'descriptivo', 'Me', T('Mediana'), T('Valor que deja a la mitad de los datos por debajo y a la mitad por encima; no la mueven los extremos.'),
      [/^mediana$/]],
    ['cuartil', 'descriptivo', 'Q', T('Cuartil'), T('Q1 deja una cuarta parte de los datos por debajo; Q3, tres cuartas partes. Entre ellos está la mitad central.'),
      [/^q[13]$/]],
    ['extremo', 'descriptivo', 'mín, máx', T('Mínimo y máximo'), T('El menor y el mayor de los datos.'),
      [/^min\.?$/, /^max\.?$/]],
    ['de', 'descriptivo', 'DE', T('Desviación estándar'), T('Dispersión típica de los datos alrededor de su media, en sus mismas unidades.'),
      [/^de$/, /^desviacion estandar( del error)?$/, /^de condicional$/]],
    ['varianza', 'descriptivo', 's²', T('Varianza'), T('Promedio de las desviaciones al cuadrado: la desviación estándar al cuadrado.'),
      [/^varianza$/, /^σ²$/]],
    ['asimetria', 'descriptivo', 'G₁', T('Asimetría'), T('Mide hacia dónde se alarga la distribución: 0 es simétrica; positiva, cola larga a la derecha (valores grandes poco frecuentes); negativa, a la izquierda.'),
      [/^asimetria \(/, /^asimetria$/]],
    ['curtosis', 'descriptivo', 'G₂', T('Curtosis'), T('Exceso de curtosis: 0 en la normal; positiva, colas más pesadas y pico más agudo (más valores extremos); negativa, colas más ligeras.'),
      [/^curtosis \(/, /^curtosis$/]],
    ['rango-medio', 'descriptivo', 'R̄', T('Rango medio'), T('Promedio de las posiciones (rangos) de los datos de un grupo al ordenar todos juntos; lo comparan las pruebas no paramétricas.'),
      [/^rango medio$/, /^suma de rangos$/]],
    /* ---- precisión ---- */
    ['ee', 'precision', 'EE', T('Error estándar'), T('Cuánto variaría la estimación si se repitiera el experimento: la precisión de una media o de un coeficiente (no la dispersión de los datos).'),
      [/^ee( \(enlace\)| asintotico| \(√pev\))?$/, /^ee( de |\(| )/, /^error estandar$/]],
    ['ic', 'precision', 'IC', T('Intervalo de confianza'), T('Rango de valores compatibles con los datos para el parámetro: con el método repetido muchas veces, el 95 % de esos intervalos contendría el valor real.'),
      [/^ic \d+ %/, /^ic (inferior|superior)$/, /^hr (inferior|superior)$/]],
    ['cv', 'precision', 'CV', T('Coeficiente de variación'), T('Desviación estándar del error como porcentaje de la media: mide la precisión del experimento. Qué tan bajo es bueno depende del cultivo y la variable (rendimiento, altura, conteos…).'),
      [/^cv( \(%\)| \(error [abc]\), %| del error, %)$/, /^coeficiente de variacion, %$/]],
    /* ---- diagnóstico ---- */
    ['residuo-std', 'diagnostico', 'r', T('Residuo estudentizado'), T('Residuo dividido entre su error estándar: más allá de ±2 es poco común; más allá de ±3, posible atípico.'),
      [/^residuo estudentizado$/, /^residuo estandarizado$/]],
    ['palanca', 'diagnostico', 'h', T('Palanca'), T('Qué tan alejada está una observación del centro de los predictores; mucha palanca da mucho peso a ese punto en la recta.'),
      [/^palanca$/]],
    ['cook', 'diagnostico', 'D', T('Distancia de Cook'), T('Cuánto cambian todas las predicciones al quitar una observación; mayor que 4/n merece revisarse.'),
      [/^cook$/]],
    ['dffits', 'diagnostico', 'DFFITS', T('DFFITS'), T('Cambio en la predicción de una observación al quitarla, en errores estándar.'),
      [/^dffits$/]],
    ['covratio', 'diagnostico', 'COVRATIO', T('COVRATIO'), T('Cuánto cambia la precisión de los coeficientes al quitar una observación; lejos de 1, la observación influye.'),
      [/^covratio$/]],
    ['vif', 'diagnostico', 'VIF', T('Factor de inflación de la varianza'), T('Cuánto se infla la varianza de un coeficiente por su correlación con los demás predictores: mayor que 5 o 10 indica colinealidad.'),
      [/^vif$/]],
    ['condicion', 'diagnostico', 'κ', T('Índice de condición'), T('Colinealidad del conjunto de predictores: mayor que 30 indica dependencias fuertes.'),
      [/^indice de condicion$/]],
    /* ---- genética cuantitativa ---- */
    ['heredabilidad', 'genetica', 'H²', T('Heredabilidad'), T('Proporción de la variación (de las parcelas o de las medias de los genotipos) que se debe a diferencias genéticas; de 0 a 1. Indica qué tanto responderá la selección.'),
      [/^h²/]],
    ['repetibilidad', 'genetica', 'r', T('Repetibilidad'), T('Correlación entre medidas repetidas del mismo individuo: el límite superior de la heredabilidad y la base para decidir cuántas medidas tomar.'),
      [/^repetibilidad/]],
    ['confiabilidad', 'genetica', 'r²', T('Confiabilidad'), T('Precisión de un BLUP: la correlación al cuadrado entre el efecto predicho y el verdadero (de 0 a 1).'),
      [/^confiabilidad$/]],
    ['componente', 'genetica', 'σ²', T('Componente de varianza'), T('Parte de la varianza total que corresponde a una fuente aleatoria (genotipos, bloques, ambientes, error).'),
      [/^varianza (genetica|fenotipica|total)/, /^componente/, /^% del total$/]],
    ['cv-genetico', 'genetica', 'CVg', T('Coeficiente de variación genético'), T('Desviación genética como porcentaje de la media; su razón con el CV del error (CVg/CVe) mayor que 1 favorece la selección.'),
      [/^cv genetico, %$/, /^razon cvg \/ cve$/]],
    ['ganancia', 'genetica', 'ΔG', T('Ganancia por selección'), T('Mejora esperada de la media en la siguiente generación al seleccionar a los mejores: intensidad × heredabilidad × desviación fenotípica.'),
      [/^ecuacion del criador/, /^diferencial de seleccion/, /^por blup/, /^ganancia$/]],
    /* ---- estabilidad de genotipos (ensayos multiambiente) ---- */
    ['b-estabilidad', 'genetica', 'b', T('Coeficiente de regresión de estabilidad'), T('Pendiente del genotipo frente al índice ambiental (Finlay y Wilkinson; Eberhart y Russell): 1, respuesta promedio; mayor que 1, aprovecha más los buenos ambientes; menor que 1, más estable.'),
      [/^b$/]],
    ['s2d', 'genetica', 'S²d', T('Desviaciones de la regresión'), T('Varianza de los desvíos del genotipo respecto a su recta de estabilidad (Eberhart y Russell): cerca de 0, su respuesta a los ambientes es predecible.'),
      [/^s²d$/]],
    ['ecovalencia', 'genetica', 'W', T('Ecovalencia de Wricke'), T('Contribución del genotipo a la interacción genotipo × ambiente: menor es más estable.'),
      [/^wricke w$/, /^w \(%\)$/]],
    ['shukla', 'genetica', 'σ²', T('Varianza de estabilidad de Shukla'), T('Varianza de la interacción de cada genotipo con los ambientes: menor es más estable.'),
      [/^shukla σ²$/, /^σ² de shukla$/]],
    ['lin-binns', 'genetica', 'Pi', T('Índice de superioridad de Lin y Binns'), T('Distancia cuadrática media del genotipo al mejor de cada ambiente: menor es mejor (alto rendimiento y estable a la vez).'),
      [/^lin y binns pi$/]],
    ['asv', 'genetica', 'ASV', T('Valor de estabilidad AMMI'), T('Distancia del genotipo al origen en el plano de los dos primeros ejes AMMI, con los ejes ponderados por lo que explican: menor es más estable.'),
      [/^asv$/]],
    ['waas', 'genetica', 'WAAS', T('Promedio ponderado de los puntajes absolutos'), T('Promedio de los puntajes absolutos del genotipo en los ejes AMMI significativos (o los que elijas), ponderado por lo que explica cada eje: menor es más estable; WAASY lo combina con el rendimiento.'),
      [/^waas$/, /^waasy$/]],
    ['annicchiarico', 'genetica', 'Wi', T('Índice de confiabilidad de Annicchiarico'), T('Rendimiento relativo (en % de la media de cada ambiente) que el genotipo supera con alta probabilidad: mayor que 100 indica superar la media de manera confiable.'),
      [/^wi( favorables| desfavorables)?$/]],
    /* ---- supervivencia y series ---- */
    ['supervivencia', 'descriptivo', 'S(t)', T('Supervivencia'), T('Probabilidad de que el evento (muerte, germinación, falla…) aún no haya ocurrido al tiempo t, estimada por Kaplan-Meier con los datos censurados.'),
      [/^supervivencia$/]],
    ['hr', 'efecto', 'HR', T('Razón de riesgos'), T('Cuántas veces mayor es el riesgo instantáneo del evento en un grupo (o por unidad del predictor) que en la referencia; 1 es sin efecto.'),
      [/^hr$/]],
    ['acf', 'diagnostico', 'ACF', T('Autocorrelación'), T('Correlación de la serie consigo misma k pasos atrás (ACF); la parcial (PACF) quita el efecto de los rezagos intermedios. Fuera de ±1.96/√n es notable.'),
      [/^acf$/, /^pacf$/]],
    /* ---- potencia ---- */
    ['potencia', 'potencia', '1 − β', T('Potencia'), T('Probabilidad de detectar un efecto del tamaño supuesto si existe. Lo usual es planear con 0.80 o más.'),
      [/^potencia$/]],
    ['alfa', 'potencia', 'α', T('Nivel de significancia'), T('Probabilidad aceptada de declarar un efecto que no existe (error tipo I); lo usual, 0.05.'),
      [/^nivel de significancia$/]],
    ['tamano-muestra', 'potencia', 'n', T('Tamaño de muestra requerido'), T('Unidades necesarias para alcanzar la potencia buscada con el efecto y la variación supuestos.'),
      [/^tamano de muestra/, /^repeticiones por tratamiento$/, /^n (por grupo|\(.*\))$/, /^(repeticiones|pares|requeridas)$/]],
  ];

  const FICHAS = F.map(([id, grupo, simbolo, nombre, que, titulos]) => ({ id, grupo, simbolo, nombre, que, titulos }));
  const POR_ID = new Map(FICHAS.map(f => [f.id, f]));

  /* ---------------- escalas (hito 5.1) ----------------
     Los estadísticos que tienen una guía de lectura publicada traen su escala: el intervalo del medidor, sus zonas (de
     menor a mayor: cada una llega hasta su límite y la última hasta el máximo) y la fuente. Las guías son convenciones,
     no leyes: cada zona se nombra con las palabras de su fuente, y la nota dice cuándo conviene leerla con cuidado.
       eje   'lineal'; 'log' (el valor p); 'abs' (cuenta el valor absoluto: el signo solo da la dirección); 'logabs' (una
             razón: 1/2 se lee como 2)
       tono  'n0' a 'n3', magnitud sin juicio (más oscuro, más grande); 'ok', 'ok2' (bien, más claro), 'aviso', 'mal', calidad
     Algunas dependen del contexto: el α del análisis, el n, el tamaño de la tabla o el título de la columna. */
  const FUENTES = {
    asa2016: ['Wasserstein y Lazar (2016)', 'Wasserstein, R. L. y Lazar, N. A. (2016). The ASA statement on p-values: context, process, and purpose. The American Statistician, 70(2), 129–133.'],
    cohen1988: ['Cohen (1988)', 'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2.ª ed.). Lawrence Erlbaum.'],
    tomczak2014: ['Tomczak y Tomczak (2014)', 'Tomczak, M. y Tomczak, E. (2014). The need to report effect size estimates revisited. An overview of some recommended measures of effect size. Trends in Sport Sciences, 1(21), 19–25.'],
    landis1977: ['Landis y Koch (1977)', 'Landis, J. R. y Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159–174.'],
    chen2010: ['Chen, Cohen y Chen (2010)', 'Chen, H., Cohen, P. y Chen, S. (2010). How big is a big odds ratio? Interpreting the magnitudes of odds ratios in epidemiological studies. Communications in Statistics—Simulation and Computation, 39(4), 860–864.'],
    pimentel2009: ['Pimentel-Gomes (2009)', 'Pimentel-Gomes, F. (2009). Curso de estatística experimental (15.ª ed.). FEALQ.'],
    gomez1984: ['Gomez y Gomez (1984)', 'Gomez, K. A. y Gomez, A. A. (1984). Statistical procedures for agricultural research (2.ª ed.). Wiley.'],
    james2013: ['James et al. (2013)', 'James, G., Witten, D., Hastie, T. y Tibshirani, R. (2013). An introduction to statistical learning. Springer.'],
    montgomery2012: ['Montgomery, Peck y Vining (2012)', 'Montgomery, D. C., Peck, E. A. y Vining, G. G. (2012). Introduction to linear regression analysis (5.ª ed.). Wiley.'],
    belsley1980: ['Belsley, Kuh y Welsch (1980)', 'Belsley, D. A., Kuh, E. y Welsch, R. E. (1980). Regression diagnostics: identifying influential data and sources of collinearity. Wiley.'],
    durbin1950: ['Durbin y Watson (1950)', 'Durbin, J. y Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. Biometrika, 37(3/4), 409–428.'],
    bollen1990: ['Bollen y Jackman (1990)', 'Bollen, K. A. y Jackman, R. W. (1990). Regression diagnostics: an expository treatment of outliers and influential cases. En J. Fox y J. S. Long (Eds.), Modern methods of data analysis (pp. 257–291). Sage.'],
    cook1982: ['Cook y Weisberg (1982)', 'Cook, R. D. y Weisberg, S. (1982). Residuals and influence in regression. Chapman and Hall.'],
    bulmer1979: ['Bulmer (1979)', 'Bulmer, M. G. (1979). Principles of statistics. Dover.'],
    johnson1955: ['Johnson, Robinson y Comstock (1955)', 'Johnson, H. W., Robinson, H. F. y Comstock, R. E. (1955). Estimates of genetic and environmental variability in soybeans. Agronomy Journal, 47(7), 314–318.'],
    burnham2002: ['Burnham y Anderson (2002)', 'Burnham, K. P. y Anderson, D. R. (2002). Model selection and multimodel inference: a practical information-theoretic approach (2.ª ed.). Springer.'],
  };
  /* una zona llega hasta su límite (sin incluirlo, salvo en las escalas inclusivas; «estricta» lo excluye siempre) */
  const z = (hasta, etiqueta, tono, estricta) => ({ hasta, etiqueta, tono, estricta: !!estricta });
  const alfaDe = c => (c && c.alfa > 0 && c.alfa < 1 ? +c.alfa : 0.05);
  /* las magnitudes de Cohen: menor que pequeño, pequeño, mediano y grande */
  const cohen = (a, b, c, max, fuente, extra) => Object.assign({ min: 0, max, eje: 'abs', fuente: fuente || 'cohen1988',
    zonas: [z(a, T('menor que pequeño'), 'n0'), z(b, T('pequeño'), 'n1'), z(c, T('mediano'), 'n2'), z(max, T('grande'), 'n3')] }, extra || {});
  const ESCALAS = {
    p: c => {
      const a = alfaDe(c), cortes = [[0.001, T('muy fuerte')], [0.01, T('fuerte')]].filter(([x]) => x < a);
      return { min: 1e-4, max: 1, eje: 'log', fuente: 'asa2016', titulo: T('Evidencia contra la hipótesis nula'),
        zonas: cortes.map(([x, e], i) => z(x, e, 'n' + (3 - i))).concat([z(a, T('suficiente (p < α)'), 'n1'), z(1, T('insuficiente (p ≥ α)'), 'n0')]),
        referencias: [{ valor: a, etiqueta: 'α = ' + a }],
        nota: T('El p dice cuánta evidencia hay contra la hipótesis nula, no qué tan grande es el efecto.') };
    },
    'd-cohen': () => cohen(0.2, 0.5, 0.8, 1.6),
    'g-hedges': () => cohen(0.2, 0.5, 0.8, 1.6),
    'h-cohen': () => cohen(0.2, 0.5, 0.8, 1.6),
    'f-cohen': () => cohen(0.1, 0.25, 0.4, 0.8),
    'eta2-h': () => cohen(0.01, 0.06, 0.14, 0.4, 'tomczak2014'),
    'w-kendall': () => cohen(0.1, 0.3, 0.5, 1, 'tomczak2014'),
    r: () => cohen(0.1, 0.3, 0.5, 1),
    rho: () => cohen(0.1, 0.3, 0.5, 1),
    phi: () => cohen(0.1, 0.3, 0.5, 1),
    /* la V de Cramér se compara con los límites de w (Cohen) divididos entre la raíz de min(filas, columnas) − 1 */
    'v-cramer': c => {
      if (!(c && c.gl > 0)) return null;
      const k = c.gl, s = Math.sqrt(k), r = x => +(x / s).toFixed(3);
      return cohen(r(0.1), r(0.3), r(0.5), 1, 'cohen1988', { nota: T('Límites de w divididos entre la raíz de min(filas, columnas) − 1 = {k}.', { k }) });
    },
    'razon-momios': () => ({ min: 1, max: 12, eje: 'logabs', fuente: 'chen2010',
      zonas: [z(1.68, T('menor que pequeño'), 'n0'), z(3.47, T('pequeño'), 'n1'), z(6.71, T('mediano'), 'n2'), z(12, T('grande'), 'n3')],
      nota: T('Una razón menor que 1 se lee por su inversa (0.5 como 2).') }),
    kappa: () => ({ min: -0.2, max: 1, eje: 'lineal', fuente: 'landis1977', inclusivo: true,
      zonas: [z(0, T('peor que el azar'), 'n0', true), z(0.2, T('leve'), 'n0'), z(0.4, T('aceptable'), 'n1'), z(0.6, T('moderada'), 'n1'), z(0.8, T('considerable'), 'n2'), z(1, T('casi perfecta'), 'n3')] }),
    /* la R² con las magnitudes de f² de Cohen (0.02, 0.15 y 0.35) */
    r2: () => ({ min: 0, max: 1, eje: 'lineal', fuente: 'cohen1988', titulo: T('Tamaño del efecto del modelo'),
      zonas: [z(0.02, T('menor que pequeño'), 'n0'), z(0.13, T('pequeño'), 'n1'), z(0.26, T('mediano'), 'n2'), z(1, T('grande'), 'n3')],
      nota: T('En experimentos diseñados la R² suele ser alta; compárala con la de ensayos parecidos.') }),
    'r2-ajustada': c => ESCALAS.r2(c),
    /* la guía es la del CV del error de un experimento: en los descriptivos (el CV de los datos de cada grupo) no aplica */
    cv: c => (c && c.descriptivo ? null : { min: 0, max: 50, eje: 'lineal', fuente: 'pimentel2009', titulo: T('Precisión del experimento'),
      zonas: [z(10, T('bajo (alta precisión)'), 'ok'), z(20, T('medio'), 'ok2'), z(30, T('alto'), 'aviso'), z(50, T('muy alto (baja precisión)'), 'mal')],
      nota: T('Guía general para ensayos de campo: cada cultivo y variable tiene la suya (los conteos y las plagas suelen dar CV más altos).') }),
    /* eficiencia relativa en %: más de 100 % quiere decir que el diseño (o la covariable) ganó precisión */
    eficiencia: c => (c && c.titulo && !/%/.test(c.titulo) ? null : { min: 0, max: 300, eje: 'lineal', fuente: 'gomez1984',
      zonas: [z(100, T('no ganó precisión'), 'aviso'), z(300, T('ganó precisión'), 'ok')] }),
    vif: () => ({ min: 1, max: 20, eje: 'lineal', fuente: 'james2013',
      zonas: [z(5, T('sin colinealidad que preocupe'), 'ok'), z(10, T('colinealidad moderada'), 'aviso'), z(20, T('colinealidad grave'), 'mal')] }),
    condicion: () => ({ min: 1, max: 60, eje: 'lineal', fuente: 'belsley1980',
      zonas: [z(10, T('débil'), 'ok'), z(30, T('moderada'), 'aviso'), z(60, T('fuerte'), 'mal')] }),
    'durbin-watson': () => ({ min: 0, max: 4, eje: 'lineal', fuente: 'durbin1950',
      zonas: [z(1, T('autocorrelación positiva fuerte'), 'mal'), z(1.5, T('posible autocorrelación positiva'), 'aviso'), z(2.5, T('sin autocorrelación aparente'), 'ok'),
        z(3, T('posible autocorrelación negativa'), 'aviso'), z(4, T('autocorrelación negativa fuerte'), 'mal')],
      nota: T('Regla práctica: la decisión la da el p de la prueba.') }),
    'residuo-std': () => ({ min: 0, max: 5, eje: 'abs', fuente: 'montgomery2012',
      zonas: [z(2, T('común'), 'ok'), z(3, T('poco común: revisar'), 'aviso'), z(5, T('posible atípico'), 'mal')] }),
    cook: c => {
      const n = c && c.n > 4 ? c.n : null, a = n ? +(4 / n).toFixed(3) : 0.5;
      return { min: 0, max: 1.5, eje: 'lineal', fuente: n ? 'bollen1990' : 'cook1982',
        zonas: [z(a, T('sin influencia que preocupe'), 'ok'), z(1, T('revisar'), 'aviso'), z(1.5, T('influyente'), 'mal')],
        nota: n ? T('Revisar desde 4/n = {a} (Bollen y Jackman, 1990); influyente desde 1 (Cook y Weisberg, 1982).', { a }) : T('Influyente desde 1 (Cook y Weisberg, 1982).') };
    },
    asimetria: () => ({ min: 0, max: 3, eje: 'abs', fuente: 'bulmer1979',
      zonas: [z(0.5, T('aproximadamente simétrica'), 'n0'), z(1, T('asimetría moderada'), 'n1'), z(3, T('asimetría marcada'), 'n3')],
      nota: T('El signo dice hacia dónde: positivo, cola larga a la derecha; negativo, a la izquierda.') }),
    heredabilidad: () => ({ min: 0, max: 1, eje: 'lineal', fuente: 'johnson1955',
      zonas: [z(0.3, T('baja'), 'n0'), z(0.6, T('media'), 'n1'), z(1, T('alta'), 'n3')] }),
    potencia: () => ({ min: 0, max: 1, eje: 'lineal', fuente: 'cohen1988',
      zonas: [z(0.8, T('insuficiente'), 'aviso'), z(1, T('adecuada (0.80 o más)'), 'ok')] }),
    'delta-aic': () => ({ min: 0, max: 15, eje: 'lineal', fuente: 'burnham2002',
      zonas: [z(2, T('apoyo sustancial'), 'n3'), z(7, T('bastante menos apoyo'), 'n2'), z(10, T('muy poco apoyo'), 'n1'), z(15, T('prácticamente sin apoyo'), 'n0')] }),
  };
  ESCALAS['p-ajustado'] = ESCALAS.p;

  /** La escala de un estadístico (por el id de su ficha) en un contexto { alfa, n, gl, titulo }, o null. */
  function escala(id, contexto) {
    const f = ESCALAS[id];
    if (!f) return null;
    const e = f(contexto || {});
    if (!e) return null;
    const fu = FUENTES[e.fuente] || [e.fuente, e.fuente];
    return Object.assign({ id, inclusivo: false, referencias: [], abierto: !(e.max === 1 || (id === 'durbin-watson')) }, e, { fuenteCorta: fu[0], fuenteCompleta: fu[1] });
  }
  /** El valor como lo lee su escala (absoluto, o la razón mayor que 1). */
  const leido = (e, v) => (e.eje === 'abs' ? Math.abs(v) : e.eje === 'logabs' ? (v > 0 ? Math.max(v, 1 / v) : NaN) : v);
  /** La zona en que cae un valor: { indice, etiqueta, tono, escala }, o null si no hay escala o el valor no es un número. */
  function zona(id, valor, contexto) {
    const e = escala(id, contexto);
    if (!e || typeof valor !== 'number' || !Number.isFinite(valor)) return null;
    const v = leido(e, valor);
    if (!Number.isFinite(v)) return null;
    let i = e.zonas.findIndex(q => (e.inclusivo && !q.estricta ? v <= q.hasta : v < q.hasta));
    if (i < 0) i = e.zonas.length - 1;
    return { indice: i, etiqueta: e.zonas[i].etiqueta, tono: e.zonas[i].tono, escala: e };
  }
  /* la distribución de referencia de cada estadístico de prueba (para su curva) */
  const DIST = { F: 'F', levene: 'F', 'brown-forsythe': 'F', reset: 'F', 'falta-ajuste': 'F', 'tukey-aditividad': 'F',
    t: 't', z: 'z', rachas: 'z',
    chi2: 'chi2', lrt: 'chi2', mcnemar: 'chi2', cmh: 'chi2', 'breslow-day': 'chi2', kruskal: 'chi2', friedman: 'chi2', fligner: 'chi2', bartlett: 'chi2', 'breusch-pagan': 'chi2' };
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

  /** La ficha del estadístico de una columna (clave interna y título) o de una fila (solo título), o null. */
  function buscar(clave, titulo) {
    const O = SP.T.origen;
    let o = (O && O.get(titulo)) || titulo;
    /* un título armado en dos partes («IC 95 %» + « (perfil)»): se busca también el origen de la primera */
    if (O && O.size && typeof o === 'string' && o.indexOf(' (') > 0) {
      const a = O.get(o.slice(0, o.indexOf(' (')));
      if (a) o = a + o.slice(o.indexOf(' ('));
    }
    const t = norm(o);
    if (!t) return null;
    for (const f of FICHAS) if (f.titulos.some(r => (Array.isArray(r) ? r[0].test(t) && clave != null && r[1].test(String(clave)) : r.test(t)))) return f;
    return null;
  }

  SP.guias = {
    GRUPOS,
    fichas: () => FICHAS.slice(),
    ficha: id => POR_ID.get(id) || null,
    buscar,
    normalizar: norm,
    escala,
    zona,
    distribucion: id => DIST[id] || null,
    fuentes: () => Object.keys(FUENTES).map(k => ({ id: k, corta: FUENTES[k][0], completa: FUENTES[k][1] })),
  };
});
