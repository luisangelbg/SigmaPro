# Inventario de estadísticos de SigmaPro

> Generado por `node tools/inventario/inventario.mjs` con la versión 0.5.6. No se edita a mano.

Qué muestra cada análisis: sus cuadros con las columnas (clave interna, título y formato), las medidas que aparecen
nombradas en las filas y los semáforos de supuestos. Cada columna numérica se relaciona con su ficha del registro de
estadísticos (`js/nucleo/guias.js`), de donde salen los medidores, la interpretación y el glosario. Las columnas que
llevan el nombre de un dato (un nivel, un ambiente, una variable) no son estadísticos y se cuentan aparte. Los análisis
del motor R no corren en node: sus columnas se leen del código. Cada caso se arma también con la interfaz en inglés
y el registro debe reconocer los mismos estadísticos.

## Resumen

| Concepto | Cantidad |
|---|---:|
| Análisis | 78 |
| Columnas en sus cuadros (sin repetir por análisis) | 1761 |
| Columnas numéricas con nombre de un dato | 178 |
| Columnas de estadísticos | 1124 |
| Columnas de estadísticos con ficha en el registro | 885 (79 %) |
| Fichas del registro | 121 (117 en uso) |
| Columnas distintas sin ficha | 129 |
| Diferencias entre español e inglés | 0 |

## Estadísticos del registro y dónde aparecen


### Estadísticos de prueba

| Ficha | Estadístico | Análisis |
|---|---|---|
| `p` | Valor p (p) | supuestos, prueba-t, friedman, kruskal-wallis, wilcoxon, dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, contrastes, polinomios, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, correlacion, correlacion-parcial, matriz-correlacion, mantel-haenszel, kappa, mcnemar, tabla-contingencia, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, ammi, ensayos-multiambiente, dos-etapas, estabilidad, componentes-varianza, heredabilidad, repetibilidad, manova, autocorrelacion, arima, cox |
| `p-ajustado` | Valor p ajustado (p aj.) | friedman, kruskal-wallis, comparaciones-medias, matriz-correlacion, mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma |
| `F` | F de Fisher (F) | dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, polinomios, ancova, regresion-lineal, regresion-polinomial, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, ammi, ensayos-multiambiente, dos-etapas, estabilidad, manova |
| `t` | t de Student (t) | prueba-t, friedman, kruskal-wallis, modelo-lineal, comparaciones-medias, contrastes, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, correlacion-parcial, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, estabilidad, kaplan-meier, arima |
| `z` | Estadístico z (z) | kruskal-wallis, kappa, tabla-contingencia, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, arima, cox |
| `chi2` | Ji cuadrada (χ²) | friedman, tabla-contingencia, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, cox |
| `chi2-celda` | Contribución a la ji cuadrada (χ²ᵢ) | bondad-ajuste |
| `lrt` | Razón de verosimilitudes (G²) | tabla-contingencia, mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, componentes-varianza, heredabilidad, repetibilidad |
| `gl` | Grados de libertad (gl) | prueba-t, friedman, kruskal-wallis, dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, comparaciones-medias, contrastes, medias-ajustadas, polinomios, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, correlacion-parcial, mantel-haenszel, mcnemar, tabla-contingencia, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, ammi, ensayos-multiambiente, dos-etapas, estabilidad, discriminante, manova, repeticiones, autocorrelacion, cox |
| `q` | Rango estudentizado (q) | friedman, kruskal-wallis, autocorrelacion |
| `wilcoxon` | Estadístico de Wilcoxon (V, W) | friedman, wilcoxon |
| `kruskal` | H de Kruskal-Wallis (H) | kruskal-wallis |
| `friedman` | Prueba de Friedman (χ²F) | friedman |
| `shapiro` | Shapiro-Wilk (W) | supuestos, regresion-lineal, regresion-polinomial |
| `lilliefors` | Lilliefors (D) | supuestos |
| `anderson-darling` | Anderson-Darling (A²) | supuestos |
| `levene` | Levene (F) | supuestos |
| `brown-forsythe` | Brown-Forsythe (F) | supuestos |
| `bartlett` | Bartlett (K²) | supuestos |
| `fligner` | Fligner-Killeen (χ²) | supuestos |

### Diagnóstico de observaciones

| Ficha | Estadístico | Análisis |
|---|---|---|
| `durbin-watson` | Durbin-Watson (DW) | supuestos, regresion-lineal, regresion-polinomial |

### Estadísticos de prueba

| Ficha | Estadístico | Análisis |
|---|---|---|
| `breusch-pagan` | Breusch-Pagan (BP) | regresion-lineal, regresion-polinomial |
| `reset` | RESET de Ramsey (F) | regresion-lineal, regresion-polinomial |
| `falta-ajuste` | Falta de ajuste (F) | regresion-lineal, regresion-polinomial |
| `rachas` | Prueba de rachas (z) | supuestos |
| `tukey-aditividad` | No aditividad de Tukey (F) | supuestos |
| `atipico-bonferroni` | Prueba de atípicos (Bonferroni) (t) | supuestos |
| `fisher-exacta` | Prueba exacta de Fisher (p) | tabla-contingencia |
| `mcnemar` | McNemar (χ²) | mcnemar |
| `binomial-exacta` | Prueba binomial exacta (p) | mcnemar |
| `cmh` | Cochran-Mantel-Haenszel (χ²) | mantel-haenszel |
| `breslow-day` | Breslow-Day (χ²) | mantel-haenszel |
| `pillai` | Traza de Pillai (V) | manova |
| `wilks` | Lambda de Wilks (Λ) | manova |
| `hotelling` | Traza de Hotelling-Lawley (T²) | manova |
| `roy` | Raíz mayor de Roy (θ) | manova |

### Tamaño del efecto y asociación

| Ficha | Estadístico | Análisis |
|---|---|---|
| `d-cohen` | d de Cohen (d) | prueba-t, deseabilidad, potencia-medias |

### Ajuste y comparación de modelos

| Ficha | Estadístico | Análisis |
|---|---|---|
| `deseabilidad` | Deseabilidad global (D) | deseabilidad |

### Tamaño del efecto y asociación

| Ficha | Estadístico | Análisis |
|---|---|---|
| `g-hedges` | g de Hedges (g) | prueba-t |
| `f-cohen` | f de Cohen (f) | potencia-anova |
| `h-cohen` | h de Cohen (h) | potencia-proporciones |
| `eta2-h` | η² de H (η²H) | kruskal-wallis |
| `w-kendall` | W de Kendall (W) | friedman |
| `r` | Correlación de Pearson (r) | correlacion-parcial, matriz-correlacion, potencia-correlacion |
| `rho` | Correlación de Spearman (ρ) | — |
| `tau` | τ de Kendall (τ) | correlacion, tabla-contingencia |
| `tau-c` | τ-c de Stuart (τc) | tabla-contingencia |
| `gamma-gk` | γ de Goodman y Kruskal (γ) | tabla-contingencia |
| `somers` | d de Somers (d) | tabla-contingencia |
| `phi` | Coeficiente φ (φ) | tabla-contingencia |
| `v-cramer` | V de Cramér (V) | tabla-contingencia |
| `contingencia` | Coeficiente de contingencia (C) | tabla-contingencia |
| `lambda-gk` | λ de Goodman y Kruskal (λ) | tabla-contingencia |
| `incertidumbre` | Coeficiente de incertidumbre (U) | tabla-contingencia |
| `kappa` | κ de Cohen (κ) | — |
| `razon-momios` | Razón de momios (OR) | mantel-haenszel, glm, glm-proporciones |
| `razon-tasas` | Razón de tasas (RT) | glm-conteos, glm |
| `razon-medias` | Razón de medias (RM) | glm-gamma |
| `eficiencia` | Eficiencia relativa (ER) | dbca, bib, cuadro-latino, ancova |

### Ajuste y comparación de modelos

| Ficha | Estadístico | Análisis |
|---|---|---|
| `r2` | Coeficiente de determinación (R²) | dbca, bib, dca, cuadro-latino, latice, ancova, mejores-subconjuntos, regresion-lineal, regresion-polinomial, curva-crecimiento, dosis-respuesta, respuesta-meseta, deseabilidad, mezclas, ascenso-pronunciado, superficie-respuesta, estabilidad, repetibilidad |
| `r2-ajustada` | R² ajustada (R²aj) | mejores-subconjuntos, regresion-lineal, regresion-polinomial, seleccion-pasos, mezclas, ascenso-pronunciado, superficie-respuesta |
| `aic` | Criterio de información de Akaike (AIC) | regresion-lineal, regresion-polinomial, seleccion-pasos, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, componentes-varianza, arima |
| `bic` | Criterio de información bayesiano (BIC) | mejores-subconjuntos, regresion-lineal, regresion-polinomial, medidas-repetidas, glm-conteos, glm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, componentes-varianza |
| `delta-aic` | Diferencia de AIC (ΔAIC) | dosis-respuesta, respuesta-meseta |
| `peso-akaike` | Peso de Akaike (w) | dosis-respuesta, respuesta-meseta |
| `loglik` | Log-verosimilitud (ℓ) | mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm, glm-proporciones, componentes-varianza |
| `devianza` | Devianza (D) | glm-conteos, glm, glm-proporciones, glm-gamma |
| `dispersion` | Dispersión (φ) | glm-conteos, glm, glm-proporciones, glm-gamma |
| `sigma` | Error estándar residual (σ) | regresion-lineal, regresion-polinomial, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta |
| `cp` | Cp de Mallows (Cp) | mejores-subconjuntos |
| `parametros` | Número de parámetros (k) | mejores-subconjuntos, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, dosis-respuesta, respuesta-meseta |
| `theta-nb` | θ de la binomial negativa (θ) | glm-conteos, glm |

### Estimaciones del modelo

| Ficha | Estadístico | Análisis |
|---|---|---|
| `coeficiente` | Coeficiente estimado (β) | modelo-lineal, contrastes, polinomios, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, arima, cox |
| `beta-std` | Coeficiente estandarizado (β*) | regresion-lineal |
| `diferencia` | Diferencia de medias (Δ) | friedman, kruskal-wallis, comparaciones-medias, mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, glm-conteos, glm-proporciones, glm-gamma, potencia-medias |
| `sc` | Suma de cuadrados (SC) | dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, contrastes, polinomios, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, ammi, ensayos-multiambiente, estabilidad |
| `cm` | Cuadrado medio (CM) | dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, ancova, regresion-lineal, regresion-polinomial, mezclas, ascenso-pronunciado, superficie-respuesta, ammi, ensayos-multiambiente, dos-etapas, estabilidad |
| `blup` | Mejor predictor lineal insesgado (BLUP) | mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, heredabilidad, repetibilidad |
| `valor-propio` | Valor propio (λ) | superficie-respuesta |
| `hodges-lehmann` | Estimador de Hodges-Lehmann (HL) | wilcoxon |

### Descriptivos

| Ficha | Estadístico | Análisis |
|---|---|---|
| `n` | Tamaño de muestra (n) | descriptivos, proporciones, supuestos, prueba-t, kruskal-wallis, wilcoxon, dbca, bib, dca, cuadro-latino, latice, parcelas-divididas, franjas, parcelas-subdivididas, ancova, regresion-lineal, regresion-polinomial, correlacion, matriz-correlacion, glm-conteos, glm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, ascenso-pronunciado, superficie-respuesta, componentes-varianza, kaplan-meier |
| `media` | Media (x̄) | descriptivos, prueba-t, dbca, bib, dca, cuadro-latino, latice, modelo-lineal, parcelas-divididas, franjas, parcelas-subdivididas, comparaciones-medias, medias-ajustadas, ancova, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glm-gamma, ammi, ensayos-multiambiente, dos-etapas, gge, estabilidad, componentes-varianza, heredabilidad, muestreo-estratificado |
| `media-ajustada` | Media ajustada (μ̂) | ancova, glm-conteos, glm, glm-proporciones, dos-etapas, heredabilidad |
| `mediana` | Mediana (Me) | descriptivos, friedman, kruskal-wallis, wilcoxon, kaplan-meier |
| `cuartil` | Cuartil (Q) | descriptivos, kruskal-wallis, wilcoxon |
| `extremo` | Mínimo y máximo (mín, máx) | descriptivos |
| `de` | Desviación estándar (DE) | descriptivos, prueba-t, mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, glmm-bloques, glmm, muestreo-estratificado, potencia-anova, potencia-medias |
| `varianza` | Varianza (s²) | supuestos, mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, glmm-bloques, glmm, componentes-varianza, heredabilidad, repetibilidad |
| `asimetria` | Asimetría (G₁) | — |
| `curtosis` | Curtosis (G₂) | — |
| `rango-medio` | Rango medio (R̄) | friedman, kruskal-wallis |

### Precisión

| Ficha | Estadístico | Análisis |
|---|---|---|
| `ee` | Error estándar (EE) | descriptivos, dbca, bib, dca, cuadro-latino, latice, modelo-lineal, comparaciones-medias, contrastes, medias-ajustadas, polinomios, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos, kappa, tabla-contingencia, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, dos-etapas, estabilidad, componentes-varianza, heredabilidad, repetibilidad, kaplan-meier, arima, cox |
| `ic` | Intervalo de confianza (IC) | descriptivos, prueba-t, wilcoxon, modelo-lineal, medias-ajustadas, ancova, regresion-lineal, regresion-polinomial, matriz-correlacion, mantel-haenszel, kappa, tabla-contingencia, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, kaplan-meier, arima, cox |
| `cv` | Coeficiente de variación (CV) | descriptivos, dbca, bib, dca, cuadro-latino, latice, parcelas-divididas, franjas, parcelas-subdivididas, ancova, regresion-lineal, regresion-polinomial, ensayos-multiambiente, dos-etapas, heredabilidad |

### Diagnóstico de observaciones

| Ficha | Estadístico | Análisis |
|---|---|---|
| `residuo-std` | Residuo estudentizado (r) | bondad-ajuste, regresion-lineal, regresion-polinomial |
| `palanca` | Palanca (h) | regresion-lineal, regresion-polinomial |
| `cook` | Distancia de Cook (D) | regresion-lineal, regresion-polinomial |
| `dffits` | DFFITS (DFFITS) | regresion-lineal, regresion-polinomial |
| `covratio` | COVRATIO (COVRATIO) | regresion-lineal, regresion-polinomial |
| `vif` | Factor de inflación de la varianza (VIF) | regresion-lineal |
| `condicion` | Índice de condición (κ) | regresion-lineal |

### Genética cuantitativa

| Ficha | Estadístico | Análisis |
|---|---|---|
| `heredabilidad` | Heredabilidad (H²) | heredabilidad |
| `repetibilidad` | Repetibilidad (r) | repetibilidad |
| `confiabilidad` | Confiabilidad (r²) | heredabilidad, repetibilidad |
| `componente` | Componente de varianza (σ²) | mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas, componentes-varianza, heredabilidad, repetibilidad |
| `cv-genetico` | Coeficiente de variación genético (CVg) | heredabilidad |
| `ganancia` | Ganancia por selección (ΔG) | heredabilidad |
| `b-estabilidad` | Coeficiente de regresión de estabilidad (b) | kappa, diseno-superficie, estabilidad |
| `s2d` | Desviaciones de la regresión (S²d) | estabilidad |
| `ecovalencia` | Ecovalencia de Wricke (W) | estabilidad |
| `shukla` | Varianza de estabilidad de Shukla (σ²) | estabilidad |
| `lin-binns` | Índice de superioridad de Lin y Binns (Pi) | estabilidad |
| `asv` | Valor de estabilidad AMMI (ASV) | ammi |
| `waas` | Promedio ponderado de los puntajes absolutos (WAAS) | ammi |
| `annicchiarico` | Índice de confiabilidad de Annicchiarico (Wi) | estabilidad |

### Descriptivos

| Ficha | Estadístico | Análisis |
|---|---|---|
| `supervivencia` | Supervivencia (S(t)) | kaplan-meier |

### Tamaño del efecto y asociación

| Ficha | Estadístico | Análisis |
|---|---|---|
| `hr` | Razón de riesgos (HR) | cox |

### Diagnóstico de observaciones

| Ficha | Estadístico | Análisis |
|---|---|---|
| `acf` | Autocorrelación (ACF) | autocorrelacion |

### Potencia y tamaño de muestra

| Ficha | Estadístico | Análisis |
|---|---|---|
| `potencia` | Potencia (1 − β) | potencia-anova, potencia-correlacion, potencia-proporciones, potencia-medias |
| `alfa` | Nivel de significancia (α) | potencia-anova, potencia-correlacion, potencia-proporciones, potencia-medias |
| `tamano-muestra` | Tamaño de muestra requerido (n) | repeticiones, potencia-anova, potencia-correlacion, potencia-proporciones, potencia-medias |

## Columnas sin ficha

Por clave y título (los números del título, como #). Las siguen los hitos 5.1 y 5.2.

| Columna | Análisis |
|---|---|
| valor · Valor | supuestos, prueba-t, dbca, bib, dca, cuadro-latino, latice, parcelas-divididas, franjas, parcelas-subdivididas, ancova, regresion-lineal, regresion-polinomial, mixto-bloques, mixto-localidades, mixto-latice, medidas-repetidas, modelo-mixto, mixto-divididas, glm-conteos, glmm-bloques, glm, glmm, glm-proporciones, glm-gamma, curva-crecimiento, dosis-respuesta, respuesta-meseta, mezclas, ascenso-pronunciado, superficie-respuesta, componentes-varianza, heredabilidad, repetibilidad, potencia-anova, potencia-correlacion, potencia-proporciones, potencia-medias |
| v · Valor | correlacion, kappa, tabla-contingencia, curva-crecimiento, dosis-respuesta, respuesta-meseta, muestreo-simple, muestreo-estratificado, tamano-muestra, arima, tendencia |
| de · DE o correlación | mixto-bloques, mixto-localidades, mixto-latice, modelo-mixto, mixto-divididas |
| est · Estadístico | regresion-lineal, regresion-polinomial, mantel-haenszel, mcnemar, tabla-contingencia |
| o · Orden | ammi, dos-etapas, gge, estabilidad |
| niveles · Niveles | componentes-varianza, heredabilidad, repetibilidad |
| tot · Total | kappa, mcnemar, tabla-contingencia |
| v · Razón | glm-conteos, glm, glm-gamma |
| v · Valor imputado | ammi, ensayos-multiambiente, estabilidad |
| aj · Ajustado | regresion-lineal, regresion-polinomial |
| c · Centro (z = #) | ascenso-pronunciado, superficie-respuesta |
| d · Distancia | ascenso-pronunciado, superficie-respuesta |
| fila · Fila | regresion-lineal, regresion-polinomial |
| l · log \|S\| | discriminante, manova |
| orden · Orden | heredabilidad, repetibilidad |
| s · Paso (z = #) | ascenso-pronunciado, superficie-respuesta |
| x · Original | deseabilidad, superficie-respuesta |
| y · Observado | regresion-lineal, regresion-polinomial |
| y · Predicción | ascenso-pronunciado, superficie-respuesta |
| z · Codificado | deseabilidad, superficie-respuesta |
| a · % correcto | discriminante |
| a · Aporte a la varianza | muestreo-estratificado |
| acumulada · Acumulada | frecuencias |
| aj · Ajuste por la DMS | estabilidad |
| b · Bloque | diseno-superficie |
| c · Calificación | estabilidad |
| c · Corrida | diseno-superficie |
| c0 · # | frecuencias |
| c0 · LD# | discriminante |
| c0 · Media de peso_inicial | ancova |
| c1 · # | frecuencias |
| c1 · LD# | discriminante |
| c2 · # | frecuencias |
| c2 · LD# | discriminante |
| c3 · (faltante) | frecuencias |
| d · Distancia al ideal | gge |
| d · Eventos | kaplan-meier |
| d · Valor singular | gge |
| de · DE (%) | estabilidad |
| dim · Dimensión | regresion-lineal |
| e · Esperados | kaplan-meier |
| e · Estacional | descomposicion |
| e · Eventos | kaplan-meier |
| e0 · EJE# | ammi |
| e1 · EJE# | ammi |
| E1 · EJE# | gge |
| e2 · EJE# | ammi |
| E2 · EJE# | gge |
| esperado · Esperado | bondad-ajuste |
| frecuencia · Frecuencia | frecuencias |
| h · Paso | arima |
| i · Corrida | deseabilidad |
| I · Índice | estabilidad |
| ic_agresti_coull · Agresti-Coull | proporciones |
| ic_clopper_pearson · Clopper-Pearson (exacto) | proporciones |
| ic_jeffreys · Jeffreys | proporciones |
| ic_wald · Wald | proporciones |
| ic_wilson · Wilson | proporciones |
| ic_wilson_cc · Wilson con corrección | proporciones |
| k · Eje | gge |
| k · Genotipos | dos-etapas |
| k · Posición | descomposicion |
| k · Rezago | autocorrelacion |
| L · Inferior | deseabilidad |
| m · Media (%) | estabilidad |
| m · Medidas (η) | repetibilidad |
| m · Pronóstico | arima |
| mc · Redondeado hacia arriba | repetibilidad |
| n · Bloques | friedman |
| n · Ejes ajustados | ammi |
| n · En riesgo | kaplan-meier |
| n · n_h | muestreo-estratificado |
| N · N_h | muestreo-estratificado |
| ny · Neyman | muestreo-estratificado |
| o · Diferencia observada | gge |
| o · Observados | kaplan-meier |
| observado · Observado | bondad-ajuste |
| oe · (O − E)²/E | kaplan-meier |
| p · % de G + G × A | gge |
| p · Diferencia en el biplot | gge |
| p · Predicción | deseabilidad |
| p · Proporción | mezclas |
| p · Proporción (%) | proporciones |
| p · Proporción de la traza | discriminante |
| p · Proporcional | muestreo-estratificado |
| paso · Paso | seleccion-pasos |
| pct · % de la media | heredabilidad |
| pe · Inestabilidad (distancia al eje) | gge |
| porcentaje · % | frecuencias |
| porcentaje_acumulado · % acumulado | frecuencias |
| pr · Desempeño (proyección) | gge |
| pr · Respuesta (#–#) | ammi |
| proporcion · Proporción esperada | bondad-ajuste |
| pw · Estabilidad (#–#) | ammi |
| q1 · Cuartil # % | kaplan-meier |
| q3 · Cuartil # % | kaplan-meier |
| R · Rango | estabilidad |
| r · Residuo | descomposicion |
| r · Valor | correlacion-parcial |
| s · Estándar | diseno-superficie |
| S1 · S# | estabilidad |
| S2 · S# | estabilidad |
| S3 · S# | estabilidad |
| S6 · S# | estabilidad |
| sm · Media simple | dos-etapas |
| sv · Valor singular | discriminante |
| t · Tiempo | arima |
| T · Valor meta | deseabilidad |
| t1 · t₁ | repeticiones |
| t2 · t₂ | repeticiones |
| total · Total | frecuencias |
| tr · Tendencia | descomposicion |
| U · Superior | deseabilidad |
| v · Efecto (unidades de la variable) | descomposicion |
| v · Estadístico | manova |
| v · Índice (# = sin efecto) | descomposicion |
| v0 · (Intercepto) | regresion-lineal |
| valor · Valor permanente | repetibilidad |
| W · W_h | muestreo-estratificado |
| w · Wald | dos-etapas |
| x · Cantidad | mezclas |
| x · Éxitos | proporciones |
| x · Frecuencia | proporciones |
| ys · YS | estabilidad |
| z0 · A | diseno-superficie |
| Z1 · Z# | estabilidad |
| z2 · C | diseno-superficie |
| Z2 · Z# | estabilidad |
| z3 · D | diseno-superficie |

## Por análisis

### Descriptivos e intervalos

#### Bondad de ajuste ji cuadrada (`bondad-ajuste`)

4 casos de validación armados.

- **Frecuencias observadas y esperadas** (`bondad`): Categoría · Observado [num] · Proporción esperada [prop] · Esperado [num2] · Residuo estandarizado [→ residuo-std] · Contribución a χ² [→ chi2-celda]

#### Estadísticos descriptivos (`descriptivos`)

7 casos de validación armados.

- **Estadísticos descriptivos de len por supp × dose** (`descriptivos`): supp · dose · n [→ n] · Media [→ media] · DE [→ de] · EE [→ ee] · CV (%) [→ cv] · IC # % de la media [→ ic] · Mín. [→ extremo] · Q# [→ cuartil] · Mediana [→ mediana] · Q# [→ cuartil] · Máx. [→ extremo] · Variable · spray · N · P · K · Month · group

#### Proporciones e intervalos de confianza (`proporciones`)

4 casos de validación armados.

- **Proporciones (%) e intervalos de confianza al # %** (`proporciones`): cilindros · Categoría · Frecuencia [entero] · n [→ n] · Proporción (%) [pct100] · Wilson [intervalo100] · Wilson con corrección [intervalo100] · Clopper-Pearson (exacto) [intervalo100] · Agresti-Coull [intervalo100] · Jeffreys [intervalo100] · Wald [intervalo100] · tratamiento · Éxitos [entero]

#### Tablas de frecuencias (`frecuencias`)

7 casos de validación armados.

- **Frecuencias de gear** (`frecuencias`): gear · Frecuencia [entero] · % [pct] · Acumulada [entero] · % acumulado [pct] · feed
- **Frecuencias de cyl × gear** (`conteos`): cyl \ gear · # [entero] · # [entero] · # [entero] · Total [entero] · mes \ ozono · bajo [dato] · medio [dato] · alto [dato] · (faltante) [entero]
- **Porcentaje dentro de cada cyl** (`pct-fila`): cyl \ gear · # [pct] · # [pct] · # [pct] · Total [pct] · mes \ ozono · bajo [dato] · medio [dato] · alto [dato] · (faltante) [pct]
- **Porcentaje dentro de cada gear** (`pct-columna`): cyl \ gear · # [pct] · # [pct] · # [pct] · Total [pct] · mes \ ozono · bajo [dato] · medio [dato] · alto [dato] · (faltante) [pct]
- **Porcentaje del total** (`pct-total`): cyl \ gear · # [pct] · # [pct] · # [pct] · Total [pct] · mes \ ozono · bajo [dato] · medio [dato] · alto [dato] · (faltante) [pct]

### Supuestos del modelo

#### Revisar los supuestos del modelo (`supuestos`)

7 casos de validación armados.

- **Pruebas de los supuestos sobre los residuos de count ~ spray** (`supuestos`): Prueba · Estadístico · Valor [auto4] · gl · p [→ p] · Revisa
- **Varianza de los residuos en cada tratamiento** (`varianzas`): Tratamiento · n [→ n] · Varianza [→ varianza]
- Medidas en las filas: Shapiro-Wilk [→ shapiro] · Lilliefors [→ lilliefors] · Anderson-Darling [→ anderson-darling] · Brown-Forsythe [→ brown-forsythe] · Levene [→ levene] · Bartlett [→ bartlett] · Fligner-Killeen [→ fligner] · Durbin-Watson [→ durbin-watson] · Rachas [→ rachas] · Residuo estudentizado (Bonferroni) [→ atipico-bonferroni] · No aditividad de Tukey [→ tukey-aditividad]
- Semáforo: Normalidad de los residuos · Varianzas iguales entre tratamientos · Aditividad bloque × tratamiento · Independencia de los residuos · Valores atípicos

### Pruebas t

#### Prueba t (`prueba-t`)

4 casos de validación armados.

- **t de Welch (H₀: diferencia = #; H₁: diferencia ≠ #)** (`prueba`): Prueba · t [→ t] · gl [→ gl] · p [→ p] · IC # % [→ ic]
- **Medias y desviaciones** (`grupos`): Grupo · n [→ n] · Media [→ media] · DE [→ de]
- **Tamaño del efecto** (`efecto`): Medida · Valor [forma] · IC # % [→ ic]
- Medidas en las filas: t de Welch [→ t] · t de Student [→ t] · d de Cohen [→ d-cohen] · g de Hedges [→ g-hedges] · t pareada [→ t] · d_z de Cohen (diferencias) [→ d-cohen] · t de una muestra [→ t]
- Semáforo: Normalidad · Varianzas (t de Welch)

### Pruebas no paramétricas

#### Friedman (`friedman`)

3 casos de validación armados.

- **Tratamientos ordenados por suma de rangos** (`grupos`): Tratamiento · Bloques [entero] · Mediana [→ mediana] · Suma de rangos [→ rango-medio] · Rango medio [→ rango-medio] · Grupo
- **Prueba de Friedman** (`prueba`): Prueba · χ² [→ chi2] · gl [→ gl] · p [→ p] · W de Kendall [→ w-kendall]
- **Comparaciones por pares: Wilcoxon pareada (Bonferroni)** (`pares`): Par · Mediana de las diferencias [→ diferencia] · V [→ wilcoxon] · p sin ajustar [→ p] · p ajustado [→ p-ajustado] · ¿Difieren? · Dif. de rangos medios [→ diferencia] · q [→ q] · Dif. de sumas de rangos [→ diferencia] · t [→ t]
- Medidas en las filas: Friedman [→ friedman]

#### Kruskal-Wallis (`kruskal-wallis`)

3 casos de validación armados.

- **Tratamientos ordenados por rango medio** (`grupos`): Tratamiento · n [→ n] · Mediana [→ mediana] · Q# [→ cuartil] · Q# [→ cuartil] · Rango medio [→ rango-medio] · Grupo
- **Prueba de Kruskal-Wallis** (`prueba`): Prueba · H [→ kruskal] · gl [→ gl] · p [→ p] · η² de H [→ eta2-h]
- **Comparaciones por pares: Conover-Iman (Tukey (un paso))** (`pares`): Par · Dif. de rangos medios [→ diferencia] · t [→ t] · p sin ajustar [→ p] · p ajustado [→ p-ajustado] · ¿Difieren? · z [→ z] · q [→ q]
- Medidas en las filas: Kruskal-Wallis [→ kruskal]

#### Wilcoxon y Mann-Whitney (`wilcoxon`)

3 casos de validación armados.

- **Suma de rangos de Wilcoxon (Mann-Whitney) (H₀: desplazamiento = #; H₁: desplazamiento ≠ #)** (`prueba`): W [→ wilcoxon] · p [→ p] · Diferencia (Hodges-Lehmann) [→ hodges-lehmann] · IC # % [→ ic] · V [→ wilcoxon] · Seudomediana [→ hodges-lehmann]
- **Medianas y cuartiles** (`grupos`): Grupo · n [→ n] · Mediana [→ mediana] · Q# [→ cuartil] · Q# [→ cuartil]

### Diseños experimentales

#### Bloques completos al azar (`dbca`)

5 casos de validación armados.

- **Análisis de varianza: Bloques completos al azar** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…» (marginales estimadas)** (`medias-hibrido`): hibrido · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-dosis`): dosis · Media [→ media] · EE [→ ee]
- **Medias de las combinaciones hibrido × dosis** (`celdas`): hibrido · dosis · Media [→ media] · EE [→ ee] · N · P
- **Efectos simples (pruebas F dentro de cada nivel)** (`simples`): Dentro de · Efecto de · gl [→ gl] · gl error [→ gl] · F [→ F] · p [→ p]
- **Medias de «…» (marginales estimadas)** (`medias-trat`): trat · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-N`): N · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-P`): P · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-K`): K · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-variedad`): variedad · Media [→ media] · EE [→ ee]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2] · Eficiencia relativa frente a completamente al azar, % [→ eficiencia]

#### Bloques incompletos balanceados (`bib`)

1 casos de validación armados.

- **Análisis de varianza: Bloques incompletos balanceados** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…» (marginales estimadas)** (`medias-trat`): trat · Media [→ media] · EE [→ ee]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2] · Factor de eficiencia del BIB (E = λt / rk) [→ eficiencia] · λ

#### Completamente al azar (`dca`)

8 casos de validación armados.

- **Análisis de varianza: Completamente al azar** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…» (marginales estimadas)** (`medias-A`): A · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-B`): B · Media [→ media] · EE [→ ee]
- **Medias de las combinaciones A × B** (`celdas`): A · B · Media [→ media] · EE [→ ee] · lana · tension · supp · dosis
- **Efectos simples (pruebas F dentro de cada nivel)** (`simples`): Dentro de · Efecto de · gl [→ gl] · gl error [→ gl] · F [→ F] · p [→ p]
- **Medias de «…» (marginales estimadas)** (`medias-lana`): lana · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-tension`): tension · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-supp`): supp · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-dosis`): dosis · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-grupo`): grupo · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-alimento`): alimento · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-C`): C · Media [→ media] · EE [→ ee]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2]

#### Cuadro latino (`cuadro-latino`)

2 casos de validación armados.

- **Análisis de varianza: Cuadro latino** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…» (marginales estimadas)** (`medias-trat`): trat · Media [→ media] · EE [→ ee]
- **Medias de «…» (marginales estimadas)** (`medias-tratamiento`): tratamiento · Media [→ media] · EE [→ ee]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2] · Eficiencia relativa frente a completamente al azar, % [→ eficiencia] · Eficiencia relativa frente a bloques (las filas como bloques), % [→ eficiencia] · Eficiencia relativa frente a bloques (las columnas como bloques), % [→ eficiencia]

#### Látice y alfa-látice (`latice`)

2 casos de validación armados.

- **Análisis de varianza: Látice y alfa-látice** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…» (marginales estimadas)** (`medias-trat`): trat · Media [→ media] · EE [→ ee]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2]

#### Modelo lineal general (fórmula) (`modelo-lineal`)

1 casos de validación armados.

- **Análisis de varianza: captacion ~ origen * tratamiento + conc** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Coeficientes** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **Medias marginales de «…»** (`medias-origen`): origen · Media [→ media] · EE [→ ee] · IC # % [→ ic]
- **Medias marginales de «…»** (`medias-tratamiento`): tratamiento · Media [→ media] · EE [→ ee] · IC # % [→ ic]
- **Medias marginales de «…»** (`medias-conc`): conc · Media [→ media] · EE [→ ee] · IC # % [→ ic]

#### Parcelas divididas (`parcelas-divididas`)

3 casos de validación armados.

- **Análisis de varianza: Parcelas divididas** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…»** (`medias-V`): V · Media [→ media] · n [→ n]
- **Medias de «…»** (`medias-N`): N · Media [→ media] · n [→ n]
- **Medias de las combinaciones V × N** (`celdas`): V · N · Media [→ media] · A · B
- **Medias de «…»** (`medias-A`): A · Media [→ media] · n [→ n]
- **Medias de «…»** (`medias-B`): B · Media [→ media] · n [→ n]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · CV (Error a), % [→ cv] · CV (Error b), % [→ cv]

#### Parcelas en franjas (`franjas`)

1 casos de validación armados.

- **Análisis de varianza: Parcelas en franjas** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…»** (`medias-A`): A · Media [→ media] · n [→ n]
- **Medias de «…»** (`medias-B`): B · Media [→ media] · n [→ n]
- **Medias de las combinaciones A × B** (`celdas`): A · B · Media [→ media]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · CV (Error a), % [→ cv] · CV (Error b), % [→ cv] · CV (Error c), % [→ cv]

#### Parcelas subdivididas (`parcelas-subdivididas`)

1 casos de validación armados.

- **Análisis de varianza: Parcelas subdivididas** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- **Medias de «…»** (`medias-A`): A · Media [→ media] · n [→ n]
- **Medias de «…»** (`medias-B`): B · Media [→ media] · n [→ n]
- **Medias de «…»** (`medias-C`): C · Media [→ media] · n [→ n]
- **Medias de las combinaciones A × B** (`celdas`): A · B · Media [→ media]
- Medidas en las filas: Media general [→ media] · Observaciones [→ n] · CV (Error a), % [→ cv] · CV (Error b), % [→ cv] · CV (Error c), % [→ cv]

### Comparaciones de medias y contrastes

#### Comparaciones de medias (`comparaciones-medias`)

6 casos de validación armados.

- **Medias de alimento con su grupo (Bonferroni)** (`medias-0`): alimento · Media [→ media] · EE [→ ee] · Grupo · dosis · trat · N · hibrido
- **Comparaciones por pares: Bonferroni** (`pares-1`): Par · Diferencia [→ diferencia] · EE [→ ee] · gl [→ gl] · t [→ t] · p ajustado [→ p-ajustado] · ¿Difieren?
- **Medias de dosis (hibrido = H#) con su grupo (DMS de Fisher)** (`medias-2`): dosis · Media [→ media] · EE [→ ee] · Grupo · N
- **Comparaciones por pares (hibrido = H#): DMS de Fisher** (`pares-3`): Par · Diferencia [→ diferencia] · EE [→ ee] · gl [→ gl] · t [→ t] · p ajustado [→ p-ajustado] · ¿Difieren?
- **Medias de dosis (hibrido = H#) con su grupo (DMS de Fisher)** (`medias-4`): dosis · Media [→ media] · EE [→ ee] · Grupo · N
- **Comparaciones por pares (hibrido = H#): DMS de Fisher** (`pares-5`): Par · Diferencia [→ diferencia] · EE [→ ee] · gl [→ gl] · t [→ t] · p ajustado [→ p-ajustado] · ¿Difieren?
- **Dunnett contra «…»** (`dunnett-0`): variedad · Diferencia con el testigo [→ diferencia] · EE [→ ee] · t [→ t] · p ajustado [→ p-ajustado] · ¿Difiere?

#### Contrastes (`contrastes`)

1 casos de validación armados.

- **Contrastes de «…»** (`contrastes-0`): Contraste · Coeficientes · Estimación [→ coeficiente] · EE [→ ee] · gl [→ gl] · t [→ t] · p [→ p] · SC [→ sc]

#### Medias ajustadas (`medias-ajustadas`)

1 casos de validación armados.

- **Medias marginales estimadas de hibrido** (`medias-0`): hibrido · Media [→ media] · EE [→ ee] · gl [→ gl] · IC # % [→ ic]

#### Polinomios ortogonales (`polinomios`)

1 casos de validación armados.

- **Polinomios ortogonales de «…»** (`polinomios-0`): Componente · Estimación [→ coeficiente] · EE [→ ee] · gl [→ gl] · F [→ F] · p [→ p] · SC [→ sc]

### ANCOVA y regresión

#### Análisis de covarianza (ANCOVA) (`ancova`)

1 casos de validación armados.

- **Análisis de covarianza** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Pendiente común de cada covariable** (`pendientes`): Covariable · Pendiente [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic]
- **Supuestos de la covarianza** (`supuestos`): Prueba · F [→ F] · gl · p [→ p]
- **Medias ajustadas de «…»** (`medias-tratamiento`): tratamiento · Media sin ajustar [→ media] · Media de peso_inicial [sig] · Media ajustada [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Resumen del ensayo** (`resumen`): Medida · Valor [escala]
- Medidas en las filas: Pendientes iguales: peso_inicial × tratamientos · Tratamientos sobre peso_inicial · Media general [→ media] · Observaciones [→ n] · Coeficiente de variación, % [→ cv] · R² [→ r2] · CM del error con covariable [→ cm] · CM del error sin covariable [→ cm] · Eficiencia relativa de la covarianza, % [→ eficiencia]
- Semáforo: Pendientes iguales (peso_inicial) · Covariable no afectada por los tratamientos (peso_inicial)

#### Mejores subconjuntos (`mejores-subconjuntos`)

1 casos de validación armados.

- **Mejores subconjuntos de cada tamaño** (`subconjuntos`): Predictores [→ parametros] · Variables · R² [→ r2] · R² ajustada [→ r2-ajustada] · Cp [→ cp] · BIC [→ bic] · Elegido por

#### Regresión lineal simple y múltiple (`regresion-lineal`)

1 casos de validación armados.

- **Coeficientes de la regresión** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic] · β estandarizado [→ beta-std] · VIF [→ vif]
- **Análisis de varianza de la regresión** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Bondad de ajuste** (`ajuste`): Medida · Valor [escala]
- **Aporte de cada predictor** (`terminos`): Predictor · gl [→ gl] · SC secuencial [→ sc] · F secuencial [→ F] · p [→ p] · SC parcial [→ sc] · F parcial [→ F] · p [→ p]
- **Pruebas de los supuestos** (`pruebas`): Prueba · Estadístico [sig] · gl · p [→ p] · Qué revisa
- **Observaciones influyentes** (`influyentes`): Fila [entero] · Observado [sig] · Ajustado [sig] · Residuo estudentizado [→ residuo-std] · Palanca [→ palanca] · Cook [→ cook] · DFFITS [→ dffits] · COVRATIO [→ covratio] · Criterio
- **Índices de condición y proporciones de varianza** (`condicion`): Dimensión [entero] · Índice de condición [→ condicion] · (Intercepto) [forma2] · aire [dato] · agua [dato] · acido [dato]
- Medidas en las filas: R² [→ r2] · R² ajustada [→ r2-ajustada] · Error estándar de la estimación (σ) [→ sigma] · Coeficiente de variación, % [→ cv] · AIC [→ aic] · BIC [→ bic] · Observaciones [→ n] · Shapiro-Wilk [→ shapiro] · Breusch-Pagan [→ breusch-pagan] · RESET [→ reset] · Falta de ajuste [→ falta-ajuste] · Durbin-Watson [→ durbin-watson]
- Semáforo: Normalidad de los residuos · Varianza constante · Forma del modelo · Independencia · Observaciones influyentes · Colinealidad

#### Regresión polinomial (`regresion-polinomial`)

1 casos de validación armados.

- **Coeficientes de la regresión** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic]
- **Análisis de varianza de la regresión** (`anova`): Fuente de variación · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Bondad de ajuste** (`ajuste`): Medida · Valor [escala]
- **Aporte de cada grado del polinomio** (`terminos`): Término · gl [→ gl] · SC secuencial [→ sc] · F secuencial [→ F] · p [→ p] · SC parcial [→ sc] · F parcial [→ F] · p [→ p]
- **Pruebas de los supuestos** (`pruebas`): Prueba · Estadístico [sig] · gl · p [→ p] · Qué revisa
- **Observaciones influyentes** (`influyentes`): Fila [entero] · Observado [sig] · Ajustado [sig] · Residuo estudentizado [→ residuo-std] · Palanca [→ palanca] · Cook [→ cook] · DFFITS [→ dffits] · COVRATIO [→ covratio] · Criterio
- Medidas en las filas: R² [→ r2] · R² ajustada [→ r2-ajustada] · Error estándar de la estimación (σ) [→ sigma] · Coeficiente de variación, % [→ cv] · AIC [→ aic] · BIC [→ bic] · Observaciones [→ n] · Shapiro-Wilk [→ shapiro] · Breusch-Pagan [→ breusch-pagan] · RESET [→ reset] · Falta de ajuste [→ falta-ajuste] · Durbin-Watson [→ durbin-watson]
- Semáforo: Normalidad de los residuos · Varianza constante · Forma del modelo · Independencia · Observaciones influyentes

#### Selección paso a paso (`seleccion-pasos`)

1 casos de validación armados.

- **Pasos de la selección** (`pasos`): Paso [entero] · Cambio · gl del error [→ gl] · SC del error [→ sc] · AIC [→ aic] · R² ajustada [→ r2-ajustada] · Predictores en el modelo
- **Coeficientes del modelo final** (`final`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]

### Correlación

#### Correlación de dos variables (`correlacion`)

1 casos de validación armados.

- **Correlación de Kendall entre «…» y «…»** (`prueba`): Medida · Valor
- **Los tres coeficientes** (`comparar`): Coeficiente · Valor [forma] · p [→ p]
- Medidas en las filas: Coeficiente (τ) [→ tau] · Estadístico · Valor p [→ p] · Cálculo del p · Pares de datos [→ n]

#### Correlación parcial y semiparcial (`correlacion-parcial`)

1 casos de validación armados.

- **Correlaciones de «…» y «…» (Pearson)** (`parcial`): Correlación · Valor [forma] · t [→ t] · gl [→ gl] · p [→ p]
- Medidas en las filas: Simple [→ r] · Parcial (controles quitados de las dos) [→ r] · Semiparcial: «…» con «…» sin los controles [→ r]

#### Matriz de correlaciones (`matriz-correlacion`)

1 casos de validación armados.

- **Matriz de correlaciones de Pearson** (`matriz`):  · Fertility · Agriculture · Examination · Education · Catholic
- **Cada par de variables** (`pares`): Variable # · Variable # · r [→ r] · IC # % [→ ic] · p [→ p] · p ajustado [→ p-ajustado] · n [→ n]

### Tablas de contingencia

#### Cochran-Mantel-Haenszel (por estratos) (`mantel-haenszel`)

1 casos de validación armados.

- **Prueba de Cochran-Mantel-Haenszel** (`cmh`): Prueba · Estadístico [forma] · gl [→ gl] · p [→ p]
- **Razón de momios en cada estrato** (`estratos`): departamento · Tabla (a b / c d) · Razón de momios [→ razon-momios] · IC # % [→ ic]
- Medidas en las filas: Cochran-Mantel-Haenszel (con corrección por continuidad) [→ cmh] · Homogeneidad de Breslow-Day [→ breslow-day] · Breslow-Day con la corrección de Tarone [→ breslow-day]

#### Concordancia entre evaluadores (kappa) (`kappa`)

1 casos de validación armados.

- **«…» (filas) contra «…» (columnas)** (`observados`):  · A [dato] · B [→ b-estabilidad] · C [dato] · Total [entero]
- **Concordancia** (`kappa`): Medida · Valor [forma] · EE [→ ee] · IC # % [→ ic] · z [→ z] · p [→ p]

#### McNemar y Bowker (datos pareados) (`mcnemar`)

1 casos de validación armados.

- **«…» (filas) contra «…» (columnas)** (`observados`):  · Aprueba [dato] · Desaprueba [dato] · Total [entero]
- **Prueba de McNemar** (`prueba`): Prueba · Estadístico [forma] · gl [→ gl] · p [→ p]
- **Proporción de cada categoría** (`proporciones`): Categoría · antes [dato] · despues [dato]
- Medidas en las filas: McNemar (con corrección por continuidad) [→ mcnemar] · Binomial exacta [→ binomial-exacta]

#### Tabla de contingencia (`tabla-contingencia`)

1 casos de validación armados.

- **Frecuencias observadas: «…» × «…»** (`observados`):  · Si [dato] · No [dato] · Total [entero]
- **Frecuencias esperadas y residuos ajustados** (`esperados`):  · Si · No
- **Pruebas de independencia** (`pruebas`): Prueba · Estadístico [forma] · gl [→ gl] · p [→ p]
- **Medidas de asociación** (`nominales`): Medida · Valor [forma]
- **Medidas para categorías ordenadas** (`ordinales`): Medida · Valor [forma] · EE asintótico [→ ee] · IC # % [→ ic] · z [→ z] · p [→ p]
- Medidas en las filas: Ji cuadrada de Pearson (Yates) [→ chi2] · Razón de verosimilitudes (G²) [→ lrt] · Fisher exacta [→ fisher-exacta] · φ [→ phi] · V de Cramér [→ v-cramer] · Coeficiente de contingencia [→ contingencia] · λ (condena a partir de gemelos) [→ lambda-gk] · λ (gemelos a partir de condena) [→ lambda-gk] · λ simétrica [→ lambda-gk] · Incertidumbre (condena a partir de gemelos) [→ incertidumbre] · Incertidumbre simétrica [→ incertidumbre] · γ (gamma) [→ gamma-gk] · τ-b de Kendall [→ tau] · τ-c de Stuart [→ tau-c] · d de Somers (condena | gemelos) [→ somers] · d de Somers (gemelos | condena) [→ somers]

### Modelos mixtos

#### Bloques al azar con bloques aleatorios (`mixto-bloques`, motor R)

Fuente: código (js/metodos/mixtos.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Grupo · Efecto · Varianza [→ varianza] · DE o correlación [sig] · % del total [→ componente] · Modelo sin… · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · LRT [→ lrt] · gl [→ gl] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Contraste · Diferencia [→ diferencia] · t [→ t] · p ajustado [→ p-ajustado] · Término · Estimado [→ coeficiente] · Nivel · BLUP [→ blup] · DE condicional [→ de] · Medida · Valor [sig]

#### Ensayos en varias localidades (`mixto-localidades`, motor R)

Fuente: código (js/metodos/mixtos.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Grupo · Efecto · Varianza [→ varianza] · DE o correlación [sig] · % del total [→ componente] · Modelo sin… · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · LRT [→ lrt] · gl [→ gl] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Contraste · Diferencia [→ diferencia] · t [→ t] · p ajustado [→ p-ajustado] · Término · Estimado [→ coeficiente] · Nivel · BLUP [→ blup] · DE condicional [→ de] · Medida · Valor [sig]

#### Látice y alfa-látice (recuperación entre bloques) (`mixto-latice`, motor R)

Fuente: código (js/metodos/mixtos.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Grupo · Efecto · Varianza [→ varianza] · DE o correlación [sig] · % del total [→ componente] · Modelo sin… · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · LRT [→ lrt] · gl [→ gl] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Contraste · Diferencia [→ diferencia] · t [→ t] · p ajustado [→ p-ajustado] · Término · Estimado [→ coeficiente] · Nivel · BLUP [→ blup] · DE condicional [→ de] · Medida · Valor [sig]

#### Medidas repetidas en el tiempo (`medidas-repetidas`, motor R)

Fuente: código (js/metodos/medidas-repetidas.js).

- **columnas que aparecen en el código del archivo** (`código`): Estructura · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · BIC [→ bic] ·  · Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Término · Estimado [→ coeficiente] · t [→ t] · Medida · Valor [sig]

#### Modelo lineal mixto (fórmula) (`modelo-mixto`, motor R)

Fuente: código (js/metodos/mixtos.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Grupo · Efecto · Varianza [→ varianza] · DE o correlación [sig] · % del total [→ componente] · Modelo sin… · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · LRT [→ lrt] · gl [→ gl] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Contraste · Diferencia [→ diferencia] · t [→ t] · p ajustado [→ p-ajustado] · Término · Estimado [→ coeficiente] · Nivel · BLUP [→ blup] · DE condicional [→ de] · Medida · Valor [sig]

#### Parcelas divididas (modelo mixto) (`mixto-divididas`, motor R)

Fuente: código (js/metodos/mixtos.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p] · Grupo · Efecto · Varianza [→ varianza] · DE o correlación [sig] · % del total [→ componente] · Modelo sin… · Parámetros [→ parametros] · Log-verosimilitud [→ loglik] · AIC [→ aic] · LRT [→ lrt] · gl [→ gl] · Media [→ media] · EE [→ ee] · IC # % · Grupo · Contraste · Diferencia [→ diferencia] · t [→ t] · p ajustado [→ p-ajustado] · Término · Estimado [→ coeficiente] · Nivel · BLUP [→ blup] · DE condicional [→ de] · Medida · Valor [sig]

### Modelos lineales generalizados

#### Conteos (Poisson y binomial negativa) (`glm-conteos`)

7 casos de validación armados.

- **Análisis de devianza (tipo II)** (`devianza`): Fuente de variación · gl [→ gl] · Devianza [→ devianza] · χ² [→ chi2] · p [→ p] · F [→ F]
- **Coeficientes (escala del enlace logaritmo)** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · z [→ z] · p [→ p] · Razón de tasas [→ razon-tasas] · IC # % [→ ic] · t [→ t]
- **Tasa estimada de cada nivel de «…»** (`medias-spray`): spray · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo · Media [→ media]
- **Comparaciones por pares de «…»** (`pares-spray`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado] · Diferencia (enlace) [→ diferencia]
- **Ajuste del modelo** (`ajuste`): Medida · Valor [escala]
- **Tasa estimada de cada nivel de «…»** (`medias-trat`): trat · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-trat`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Tasa estimada de cada nivel de «…» dentro de cada nivel de «…»** (`medias-tension`): wool · tension · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-tension`): wool · Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Tasa estimada de cada nivel de «…»** (`medias-dosis`): dosis · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-dosis`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- Medidas en las filas: Observaciones [→ n] · Devianza residual [→ devianza] · gl residuales [→ gl] · Devianza nula [→ devianza] · Dispersión (Pearson χ²/gl) [→ dispersion] · θ de la binomial negativa [→ theta-nb] · EE de θ [→ ee] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Sobredispersión · Observaciones atípicas · Ajuste · Dispersión

#### Conteos o proporciones en bloques aleatorios (mixto) (`glmm-bloques`, motor R)

Fuente: código (js/metodos/glmm.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · χ² [→ chi2] · gl [→ gl] · p [→ p] · Término · Estimado [→ coeficiente] · EE [→ ee] · z [→ z] · IC # % · Agrupamiento · Efecto · Varianza [→ varianza] · DE [→ de] · Efecto quitado · χ² [→ chi2] · Grupo · Contraste · EE (enlace) [→ ee] · p ajustado [→ p-ajustado] · Medida · Valor [escala]

#### Modelo lineal generalizado (fórmula) (`glm`)

10 casos de validación armados.

- **Análisis de devianza (tipo II)** (`devianza`): Fuente de variación · gl [→ gl] · Devianza [→ devianza] · χ² [→ chi2] · p [→ p] · F [→ F]
- **Coeficientes (escala del enlace logit)** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · z [→ z] · p [→ p] · Razón de momios [→ razon-momios] · IC # % [→ ic] · t [→ t] · χ² [→ chi2] · Razón de tasas [→ razon-tasas]
- **Probabilidad estimada de cada nivel de «…»** (`medias-Species`): Species · Probabilidad [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-Species`): Contraste · Razón de momios [→ razon-momios] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Ajuste del modelo** (`ajuste`): Medida · Valor [escala]
- **Probabilidad estimada de cada nivel de «…»** (`medias-variedad`): variedad · Probabilidad [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-variedad`): Contraste · Razón de momios [→ razon-momios] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Tasa estimada de cada nivel de «…»** (`medias-Age`): Age · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-Age`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Tasa estimada de cada nivel de «…» dentro de cada nivel de «…»** (`medias-tension`): wool · tension · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-tension`): wool · Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Tasa estimada de cada nivel de «…»** (`medias-Group`): Group · Tasa [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-Group`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- Medidas en las filas: Observaciones [→ n] · Devianza residual [→ devianza] · gl residuales [→ gl] · Devianza nula [→ devianza] · Dispersión (Pearson χ²/gl) [→ dispersion] · AIC [→ aic] · BIC [→ bic] · Log-verosimilitud penalizada [→ loglik] · θ de la binomial negativa [→ theta-nb] · EE de θ [→ ee]
- Semáforo: Sobredispersión · Observaciones atípicas · Ajuste · Dispersión

#### Modelo lineal generalizado mixto (fórmula) (`glmm`, motor R)

Fuente: código (js/metodos/glmm.js).

- **columnas que aparecen en el código del archivo** (`código`): Fuente de variación · χ² [→ chi2] · gl [→ gl] · p [→ p] · Término · Estimado [→ coeficiente] · EE [→ ee] · z [→ z] · IC # % · Agrupamiento · Efecto · Varianza [→ varianza] · DE [→ de] · Efecto quitado · χ² [→ chi2] · Grupo · Contraste · EE (enlace) [→ ee] · p ajustado [→ p-ajustado] · Medida · Valor [escala]

#### Proporciones (binomial) (`glm-proporciones`)

5 casos de validación armados.

- **Análisis de devianza (tipo II)** (`devianza`): Fuente de variación · gl [→ gl] · Devianza [→ devianza] · χ² [→ chi2] · p [→ p] · F [→ F]
- **Coeficientes (escala del enlace logit)** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · z [→ z] · p [→ p] · Razón de momios [→ razon-momios] · IC # % [→ ic] · χ² [→ chi2] · t [→ t]
- **Probabilidad estimada de cada nivel de «…»** (`medias-raza`): raza · Probabilidad [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-raza`): Contraste · Razón de momios [→ razon-momios] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- **Ajuste del modelo** (`ajuste`): Medida · Valor [escala]
- **Probabilidad estimada de cada nivel de «…»** (`medias-trat`): trat · Probabilidad [→ media-ajustada] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-trat`): Contraste · Razón de momios [→ razon-momios] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado] · Diferencia (enlace) [→ diferencia]
- Medidas en las filas: Observaciones [→ n] · Devianza residual [→ devianza] · gl residuales [→ gl] · Devianza nula [→ devianza] · Dispersión (Pearson χ²/gl) [→ dispersion] · AIC [→ aic] · BIC [→ bic] · Log-verosimilitud penalizada [→ loglik]
- Semáforo: Observaciones atípicas · Ajuste · Sobredispersión · Dispersión

#### Respuestas positivas asimétricas (gamma) (`glm-gamma`)

4 casos de validación armados.

- **Análisis de devianza (tipo II)** (`devianza`): Fuente de variación · gl [→ gl] · Devianza [→ devianza] · F [→ F] · p [→ p]
- **Coeficientes (escala del enlace inverso)** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic] · Razón de medias [→ razon-medias]
- **Media estimada de cada nivel de «…»** (`medias-lote`): lote · Media [→ media] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-lote`): Contraste · Diferencia (enlace) [→ diferencia] · EE (enlace) [→ ee] · t [→ t] · p ajustado [→ p-ajustado]
- **Ajuste del modelo** (`ajuste`): Medida · Valor [escala]
- **Media estimada de cada nivel de «…»** (`medias-trat`): trat · Media [→ media] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-trat`): Contraste · Razón [sig] · EE (enlace) [→ ee] · t [→ t] · p ajustado [→ p-ajustado]
- **Media estimada de cada nivel de «…»** (`medias-empaque`): empaque · Media [→ media] · EE [→ ee] · IC # % [→ ic] · Grupo
- **Comparaciones por pares de «…»** (`pares-empaque`): Contraste · Razón [sig] · EE (enlace) [→ ee] · z [→ z] · p ajustado [→ p-ajustado]
- Medidas en las filas: Observaciones [→ n] · Devianza residual [→ devianza] · gl residuales [→ gl] · Devianza nula [→ devianza] · Dispersión (Pearson χ²/gl) [→ dispersion] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Dispersión · Observaciones atípicas · Ajuste

### Regresión no lineal

#### Curva de crecimiento (`curva-crecimiento`)

4 casos de validación armados.

- **Parámetros del modelo Gompertz** (`parametros`): Parámetro · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic] · Significado · arbol
- **Valores derivados** (`derivados`): Cantidad · Valor [sig] · EE [→ ee] · IC # % [→ ic]
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- **Comparación de las curvas de «…»** (`comparacion`): Hipótesis · F [→ F] · gl num. [→ gl] · gl den. [→ gl] · p [→ p]
- Medidas en las filas: Observaciones [→ n] · gl del error [→ gl] · Suma de cuadrados residual [→ sc] · Error estándar residual (σ) [→ sigma] · R² (# − SCR/SCT) [→ r2] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Convergencia · Observaciones atípicas

#### Dosis-respuesta (log-logístico) (`dosis-respuesta`)

6 casos de validación armados.

- **Parámetros del modelo log-logístico de # parámetros** (`parametros`): Parámetro · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % (perfil) [→ ic] · Significado · herbicida · IC # % [→ ic]
- **Valores derivados** (`derivados`): Cantidad · Valor [sig] · EE [→ ee] · IC # % [→ ic] · herbicida
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- **Comparación de las curvas de «…»** (`comparacion`): Hipótesis · F [→ F] · gl num. [→ gl] · gl den. [→ gl] · p [→ p]
- **Comparación de modelos por AIC** (`modelos`): Modelo · Parámetros [→ parametros] · AIC [→ aic] · ΔAIC [→ delta-aic] · Peso de Akaike [→ peso-akaike] · σ [→ sigma] · R² [→ r2] · Nota
- Medidas en las filas: Observaciones [→ n] · gl del error [→ gl] · Suma de cuadrados residual [→ sc] · Error estándar residual (σ) [→ sigma] · R² (# − SCR/SCT) [→ r2] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Convergencia · Observaciones atípicas

#### Respuesta a la dosis con meseta (`respuesta-meseta`)

8 casos de validación armados.

- **Parámetros del modelo cuadrático-meseta** (`parametros`): Parámetro · hibrido · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p] · IC # % [→ ic] · Significado · IC # % (perfil) [→ ic] · estado
- **Valores derivados** (`derivados`): Cantidad · hibrido · Valor [sig] · EE [→ ee] · IC # % [→ ic]
- **Comparación de las curvas de «…»** (`comparacion`): Hipótesis · F [→ F] · gl num. [→ gl] · gl den. [→ gl] · p [→ p]
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- **Comparación de modelos por AIC** (`modelos`): Modelo · Parámetros [→ parametros] · AIC [→ aic] · ΔAIC [→ delta-aic] · Peso de Akaike [→ peso-akaike] · σ [→ sigma] · R² [→ r2] · Nota
- Medidas en las filas: Observaciones [→ n] · gl del error [→ gl] · Suma de cuadrados residual [→ sc] · Error estándar residual (σ) [→ sigma] · R² (# − SCR/SCT) [→ r2] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Convergencia · Observaciones atípicas

### Superficies de respuesta

#### Deseabilidad de varias respuestas (`deseabilidad`)

2 casos de validación armados.

- **La combinación más deseable** (`optimo`): Factor · Codificado [forma] · Original [sig]
- **Respuestas en ese punto** (`respuestas`): Respuesta · Meta · Inferior [sig] · Valor meta [sig] · Superior [sig] · Predicción [sig] · d [→ d-cohen] · R² del modelo [→ r2]
- **Deseabilidad de cada corrida** (`puntos`): Corrida [entero] · D [→ deseabilidad]

#### Generar un diseño de superficie o de mezclas (`diseno-superficie`)

14 casos de validación armados.

- **Corridas del diseño** (`corridas`): Corrida [entero] · Estándar [entero] · x# (codificado) [dato] · x# (codificado) [dato] · x# (codificado) [dato] · x# (codificado) [dato] · x# (codificado) [dato] · Bloque [entero] · x# (codificado) [dato] · A [auto4] · B [→ b-estabilidad] · C [auto4] · D [auto4]

#### Mezclas (modelos de Scheffé) (`mezclas`)

5 casos de validación armados.

- **Análisis de varianza del modelo cuadrático** (`anova`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Coeficientes de Scheffé** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **La mezcla de menor respuesta** (`optimo`): Componente · Proporción [forma] · Cantidad [sig]
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- Medidas en las filas: Mezclas · gl del error [→ gl] · Error estándar residual (σ) [→ sigma] · R² [→ r2] · R² ajustada [→ r2-ajustada]
- Semáforo: Falta de ajuste · Observaciones atípicas

#### Primer orden y ascenso más pronunciado (`ascenso-pronunciado`)

2 casos de validación armados.

- **Análisis de varianza del modelo de primer orden** (`anova`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Coeficientes en unidades codificadas** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **Ecuación en unidades originales** (`naturales`): Término · Coeficiente [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **Codificación de los factores** (`codificacion`): Factor · Centro (z = #) [sig] · Paso (z = #) [sig]
- **Camino de ascenso más pronunciado** (`cresta`): Distancia [forma2] · tiempo [dato] · temperatura [dato] · Predicción [sig] · EE [→ ee]
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- Medidas en las filas: Observaciones [→ n] · gl del error [→ gl] · Error estándar residual (σ) [→ sigma] · R² [→ r2] · R² ajustada [→ r2-ajustada]
- Semáforo: Falta de ajuste · Observaciones atípicas

#### Superficie de respuesta (segundo orden) (`superficie-respuesta`)

9 casos de validación armados.

- **Análisis de varianza del modelo de segundo orden** (`anova`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Coeficientes en unidades codificadas** (`coeficientes`): Término · Estimado [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **Ecuación en unidades originales** (`naturales`): Término · Coeficiente [→ coeficiente] · EE [→ ee] · t [→ t] · p [→ p]
- **Codificación de los factores** (`codificacion`): Factor · Centro (z = #) [sig] · Paso (z = #) [sig]
- **Punto estacionario: un máximo** (`estacionario`): Factor · Codificado [sig] · Original [sig]
- **Análisis canónico** (`canonico`): Valor propio [→ valor-propio] · lamina [dato] · frecuencia [dato] · N [→ n] · P [→ p] · K [dato] · ph [dato] · temperatura [dato] · ph [dato] · tiempo [dato] · densidad [dato] · dosis [dato] · intervalo [dato] · volumen [dato]
- **Cresta de máxima respuesta** (`cresta`): Distancia [forma2] · lamina [dato] · frecuencia [dato] · Predicción [sig] · EE [→ ee] · N [→ n] · P [→ p] · K [dato] · ph [dato] · S [dato] · Zn [dato] · temperatura [dato] · ph [dato] · tiempo [dato] · densidad [dato] · dosis [dato] · intervalo [dato] · volumen [dato]
- **Ajuste** (`ajuste`): Medida · Valor [escala]
- Medidas en las filas: Observaciones [→ n] · gl del error [→ gl] · Error estándar residual (σ) [→ sigma] · R² [→ r2] · R² ajustada [→ r2-ajustada]
- Semáforo: Falta de ajuste · Observaciones atípicas · Punto estacionario

### Ensayos multiambiente y estabilidad

#### AMMI (efectos principales aditivos e interacción multiplicativa) (`ammi`)

5 casos de validación armados.

- **Análisis de varianza AMMI** (`anova`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Prueba F_R de Cornelius: interacción que queda después de n ejes** (`fr`): Ejes ajustados [entero] · SC [→ sc] · gl [→ gl] · CM [→ cm] · F_R [→ F] · p [→ p]
- **Puntajes de los genotipos** (`puntajes`): Genotipo · Media [→ media] · EJE# [forma] · EJE# [forma] · EJE# [forma] · ASV [→ asv]
- **Puntajes de los ambientes** (`puntajes_ambientes`): Ambiente · Media [→ media] · EJE# [forma] · EJE# [forma] · EJE# [forma]
- **WAAS y WAASY: estabilidad y respuesta juntas** (`waas`): Genotipo · Media [→ media] · WAAS [→ waas] · Respuesta (#–#) [forma2] · Estabilidad (#–#) [forma2] · WAASY [→ waas] · Orden [entero]
- **Medias de los genotipos en cada ambiente** (`medias`): Genotipo · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · Media [→ media] · A# [dato] · A# [dato] · A# [dato] · A# [dato] · Ayac [dato] · Hyo# [dato] · LM# [dato] · LM# [dato] · SR# [dato] · SR# [dato]
- **Celdas imputadas por EM-AMMI** (`imputadas`): Genotipo · Ambiente · Valor imputado [sig]
- Semáforo: Homogeneidad de los errores · Celdas imputadas

#### Análisis conjunto de varios ambientes (`ensayos-multiambiente`)

4 casos de validación armados.

- **Análisis de varianza conjunto** (`anova`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Análisis de cada ambiente** (`ambientes`): Ambiente · Media [→ media] · CME [→ cm] · gl [→ gl] · CV (%) [→ cv] · F genotipos [→ F] · p [→ p]
- **Celdas imputadas por EM-AMMI** (`imputadas`): Genotipo · Ambiente · Valor imputado [sig]
- **Medias de los genotipos en cada ambiente** (`medias`): Genotipo · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · Media [→ media] · A# [dato] · A# [dato] · A# [dato] · A# [dato]
- Semáforo: Celdas imputadas · Homogeneidad de los errores

#### Análisis en dos etapas (una varianza por ambiente) (`dos-etapas`)

3 casos de validación armados.

- **Primera etapa: cada ambiente** (`etapa1`): Ambiente · Media [→ media] · CME [→ cm] · gl [→ gl] · CV (%) [→ cv] · Genotipos [entero]
- **Segunda etapa: medias ajustadas de los genotipos** (`genotipos`): Orden [entero] · Genotipo · Media ajustada [→ media-ajustada] · EE [→ ee] · Media simple [sig]
- **Prueba de los genotipos** (`wald`): Fuente · Wald [forma2] · gl num. [→ gl] · gl den. [→ gl] · F [→ F] · p [→ p]
- Semáforo: Errores de los ambientes

#### Biplot GGE (`gge`)

5 casos de validación armados.

- **Valores singulares** (`valores`): Eje [entero] · Valor singular [sig] · % de G + G × A [forma2]
- **Quién ganó dónde** (`ganadores`): Ambiente · Ganador en el biplot · EJE# [forma] · EJE# [forma]
- **Media contra estabilidad** (`media_estabilidad`): Genotipo · Media [→ media] · EJE# [forma] · EJE# [forma] · Desempeño (proyección) [forma] · Inestabilidad (distancia al eje) [forma]
- **Distancia al genotipo ideal** (`ideal`): Orden [entero] · Genotipo · Media [→ media] · Distancia al ideal [forma]
- **Distancia al ambiente ideal** (`ambiente_ideal`): Orden [entero] · Ambiente · Media [→ media] · Distancia al ideal [forma]
- **Comparación de G# con G#** (`comparacion_par`): Ambiente · Diferencia en el biplot [sig] · Diferencia observada [sig] · Mejor
- **Medias de los genotipos en cada ambiente** (`medias`): Genotipo · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · Media [→ media] · A# [dato] · A# [dato] · A# [dato] · A# [dato]
- Semáforo: Homogeneidad de los errores

#### Estabilidad (Eberhart-Russell, Wricke, Shukla, Huehn, Kang, Annicchiarico) (`estabilidad`)

7 casos de validación armados.

- **Regresión sobre el índice ambiental (Finlay y Wilkinson; Eberhart y Russell)** (`regresion`): Genotipo · Media [→ media] · b [→ b-estabilidad] · EE(b) [→ ee] · t (b = #) [→ t] · p [→ p] · S²d [→ s2d] · F (S²d = #) [→ F] · p [→ p] · R² [→ r2]
- **Varianzas de estabilidad y superioridad** (`varianzas`): Genotipo · Wricke W [→ ecovalencia] · W (%) [→ ecovalencia] · Shukla σ² [→ shukla] · F [→ F] · p [→ p] · Lin y Binns Pi [→ lin-binns]
- **Análisis de varianza de Eberhart y Russell** (`eberhart_russell`): Fuente · gl [→ gl] · SC [→ sc] · CM [→ cm] · F [→ F] · p [→ p]
- **Índice ambiental** (`indice`): Ambiente · Media [→ media] · Índice [sig]
- **Estadísticas no paramétricas de Huehn** (`huehn`): Genotipo · Media [→ media] · S# [forma] · Z# [forma2] · p [→ p] · S# [forma] · Z# [forma2] · p [→ p] · S# [forma] · S# [forma]
- **Rendimiento-estabilidad de Kang (YS)** (`kang`): Genotipo · Media [→ media] · Rango [entero] · Ajuste por la DMS [entero] · σ² de Shukla [→ shukla] · F [→ F] · Calificación [entero] · YS [entero] · Seleccionado
- **Índice de confianza de Annicchiarico (Wi, % de la media del ambiente)** (`annicchiarico`): Genotipo · Media (%) [forma2] · DE (%) [forma2] · Wi [→ annicchiarico] · Orden [num] · Wi favorables [→ annicchiarico] · Wi desfavorables [→ annicchiarico]
- **Celdas imputadas por EM-AMMI** (`imputadas`): Genotipo · Ambiente · Valor imputado [sig]
- **Medias de los genotipos en cada ambiente** (`medias`): Genotipo · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · E# [dato] · Media [→ media] · A# [dato] · A# [dato] · A# [dato] · A# [dato] · Ayac [dato] · Hyo# [dato] · LM# [dato] · LM# [dato] · SR# [dato] · SR# [dato]
- Semáforo: Celdas imputadas · Homogeneidad de los errores

### Componentes de varianza y heredabilidad

#### Componentes de varianza (REML) (`componentes-varianza`)

7 casos de validación armados.

- **Componentes de varianza de «…»** (`componentes`): Fuente de variación · Niveles [entero] · σ² [→ varianza] · EE [→ ee] · % del total [→ componente] · χ² (RV) [→ lrt] · p [→ p]
- **Ajuste del modelo** (`ajuste`): Medida · Valor [escala]
- Medidas en las filas: Observaciones [→ n] · Media general estimada [→ media] · Varianza total (suma de componentes) [→ componente] · Log-verosimilitud restringida [→ loglik] · AIC [→ aic] · BIC [→ bic]
- Semáforo: Normalidad de los residuos · Observaciones atípicas · Ajuste REML · Normalidad de los efectos aleatorios

#### Heredabilidad y BLUP de genotipos (`heredabilidad`)

7 casos de validación armados.

- **Componentes de varianza de «…»** (`componentes`): Fuente de variación · Niveles [entero] · σ² [→ varianza] · EE [→ ee] · % del total [→ componente] · χ² (RV) [→ lrt] · p [→ p]
- **Heredabilidad** (`heredabilidad`): Medida · Valor [forma] · Fórmula
- **Parámetros genéticos** (`parametros`): Medida · Valor [escala]
- **Ganancia esperada por selección** (`seleccion`): Criterio · Ganancia [→ ganancia] · % de la media [num2]
- **BLUP y BLUE de los genotipos** (`genotipos`): Orden [entero] · GEN · Valor genotípico (BLUP) [→ blup] · Efecto (BLUP) [→ blup] · EE (√PEV) [→ ee] · Confiabilidad [→ confiabilidad] · Media ajustada (BLUE) [→ media-ajustada] · EE BLUE [→ ee] · Seleccionado · linea
- Medidas en las filas: H² en medias de genotipos [→ heredabilidad] · EE de H² en medias [→ ee] · H² por parcela [→ heredabilidad] · H² de Cullis [→ heredabilidad] · H² de Piepho y Möhring [→ heredabilidad] · Media general estimada [→ media] · Varianza genética (σ²g) [→ componente] · Varianza fenotípica de las medias (σ²F) [→ componente] · CV genético, % [→ cv-genetico] · CV del error, % [→ cv] · Razón CVg / CVe [→ cv-genetico] · Por BLUP (media de los BLUP seleccionados) [→ ganancia] · Ecuación del criador: i · H² · σF [→ ganancia] · Diferencial de selección (BLUE) × H² [→ ganancia]
- Semáforo: Normalidad de los residuos · Normalidad de los efectos aleatorios · Observaciones atípicas · Ajuste REML

#### Repetibilidad (`repetibilidad`)

3 casos de validación armados.

- **Componentes de varianza de «…»** (`componentes`): Fuente de variación · Niveles [entero] · σ² [→ varianza] · EE [→ ee] · % del total [→ componente] · χ² (RV) [→ lrt] · p [→ p]
- **Repetibilidad** (`repetibilidad`): Medida · Valor [forma]
- **Medidas necesarias por individuo** (`medidas`): Determinación deseada (R²) [→ r2] · Medidas (η) [num2] · Redondeado hacia arriba [entero]
- **Valor permanente predicho de cada individuo** (`individuos`): Orden [entero] · arbol · Valor permanente [sig] · Efecto (BLUP) [→ blup] · EE (√PEV) [→ ee] · Confiabilidad [→ confiabilidad] · Subject · Rail
- Medidas en las filas: Repetibilidad (r) [→ repetibilidad] · EE de r [→ ee] · Medidas por individuo (media armónica) · Determinación con esas medidas (R²) [→ r2]
- Semáforo: Normalidad de los residuos · Normalidad de los efectos aleatorios · Observaciones atípicas · Ajuste REML

### Análisis multivariado

#### Análisis discriminante lineal (`discriminante`)

4 casos de validación armados.

- **Funciones discriminantes** (`funciones`): Función · Valor singular [forma] · Proporción de la traza [forma]
- **Coeficientes de las funciones discriminantes** (`coeficientes`): Variable · LD# [forma] · LD# [forma] · LD# [forma]
- **Centroides de los grupos** (`centroides`): region · LD# [forma] · LD# [forma] · LD# [forma] · origen · especie
- **Clasificación con validación cruzada (filas: grupo real)** (`clasificacion`): region · Centro [dato] · Costa [dato] · Norte [dato] · Sur [dato] · % correcto [pct] · origen · Introducida [dato] · Nativa [dato] · Norte [dato] · Centro [dato] · Sur [dato] · Isla [dato] · especie · setosa [dato] · versicolor [dato] · virginica [dato]
- **Prueba M de Box (igualdad de covarianzas entre los grupos)** (`box`): Grupo · gl [→ gl] · log \|S\| [forma]
- Semáforo: Tamaño de los grupos · Covarianzas iguales (M de Box)

#### MANOVA (varias respuestas a la vez) (`manova`)

4 casos de validación armados.

- **MANOVA: las cuatro pruebas** (`manova`): Término · gl [→ gl] · Prueba · Estadístico [forma] · F aprox. [→ F] · gl num. [→ gl] · gl den. [→ gl] · p [→ p]
- **ANOVA de cada respuesta (F y p)** (`univariados`): Respuesta · F · trat [→ F] · p · trat [→ p] · F · riego [→ F] · p · riego [→ p] · F · variedad [→ F] · p · variedad [→ p] · F · riego:variedad [→ F] · p · riego:variedad [→ p] · F · especie [→ F] · p · especie [→ p] · F · bloque [→ F] · p · bloque [→ p] · F · hibrido [→ F] · p · hibrido [→ p]
- **Prueba M de Box (igualdad de covarianzas entre las combinaciones de tratamientos)** (`box`): Grupo · gl [→ gl] · log \|S\| [forma]
- **Medias por «…»** (`medias-trat`): trat · largo [dato] · ancho [dato] · grosor [dato] · peso [dato]
- **Medias por «…»** (`medias-riego`): riego · biomasa [dato] · clorofila [dato]
- **Medias por «…»** (`medias-variedad`): variedad · biomasa [dato] · clorofila [dato]
- **Medias por «…»** (`medias-especie`): especie · largo_sepalo [dato] · ancho_sepalo [dato] · largo_petalo [dato] · ancho_petalo [dato]
- **Medias por «…»** (`medias-hibrido`): hibrido · rendimiento [dato] · altura [dato] · peso_grano [dato]
- Medidas en las filas: Pillai [→ pillai] · Wilks [→ wilks] · Hotelling-Lawley [→ hotelling] · Roy [→ roy]
- Semáforo: Observaciones por variable · Covarianzas iguales (M de Box)

### Tamaño de muestra, potencia y muestreo

#### Estimación con muestreo aleatorio simple (`muestreo-simple`)

4 casos de validación armados.

- **Estimación** (`estimacion`): Medida · Valor [sigEnt]

#### Estimación con muestreo estratificado (`muestreo-estratificado`)

3 casos de validación armados.

- **Estratos** (`estratos`): lote · N_h [entero] · n_h [entero] · W_h [forma] · Media [→ media] · DE [→ de] · Aporte a la varianza [sig] · region · suelo
- **Estimación estratificada** (`estimacion`): Medida · Valor [sigEnt]
- **Cómo repartir una muestra de #** (`asignacion`): lote · Proporcional [forma2] · Neyman [forma2] · region

#### Número de repeticiones de un experimento (`repeticiones`)

2 casos de validación armados.

- **Búsqueda de las repeticiones** (`iteraciones`): Repeticiones [→ tamano-muestra] · gl del error [→ gl] · t₁ [forma] · t₂ [forma] · Requeridas [→ tamano-muestra]

#### Potencia y repeticiones: ANOVA de varios tratamientos (`potencia-anova`)

3 casos de validación armados.

- **Parámetros** (`parametros`): Medida · Valor [sigEnt] · 
- **Potencia según el tamaño de muestra** (`curva`): Repeticiones [→ tamano-muestra] · Potencia [→ potencia]
- Medidas en las filas: Tratamientos · Repeticiones por tratamiento [→ tamano-muestra] · Varianza de las medias · Desviación estándar del error [→ de] · f de Cohen [→ f-cohen] · Nivel de significancia [→ alfa] · Potencia [→ potencia]

#### Potencia y tamaño de muestra: correlación (`potencia-correlacion`)

3 casos de validación armados.

- **Parámetros** (`parametros`): Medida · Valor [sigEnt] · 
- **Potencia según el tamaño de muestra** (`curva`): Pares [→ tamano-muestra] · Potencia [→ potencia]
- Medidas en las filas: Pares de observaciones · Correlación [→ r] · Nivel de significancia [→ alfa] · Potencia [→ potencia]

#### Potencia y tamaño de muestra: dos proporciones (`potencia-proporciones`)

2 casos de validación armados.

- **Parámetros** (`parametros`): Medida · Valor [sigEnt] · 
- **Potencia según el tamaño de muestra** (`curva`): n por grupo [→ tamano-muestra] · Potencia [→ potencia]
- Medidas en las filas: Tamaño de muestra por grupo [→ tamano-muestra] · Proporción # · h de Cohen [→ h-cohen] · Nivel de significancia [→ alfa] · Potencia [→ potencia]

#### Potencia y tamaño de muestra: medias (prueba t) (`potencia-medias`)

4 casos de validación armados.

- **Parámetros** (`parametros`): Medida · Valor [sigEnt] · 
- **Potencia según el tamaño de muestra** (`curva`): n (unidades por grupo) [→ tamano-muestra] · Potencia [→ potencia] · n (pares) [→ tamano-muestra] · n (observaciones) [→ tamano-muestra]
- Medidas en las filas: Tamaño de muestra (unidades por grupo) [→ tamano-muestra] · Diferencia [→ diferencia] · Desviación estándar [→ de] · d de Cohen [→ d-cohen] · Nivel de significancia [→ alfa] · Potencia [→ potencia] · Tamaño de muestra (pares) [→ tamano-muestra] · Tamaño de muestra (observaciones) [→ tamano-muestra]

#### Tamaño de muestra para estimar una media o una proporción (`tamano-muestra`)

4 casos de validación armados.

- **Tamaño de muestra** (`tamano`): Medida · Valor [sigEnt]

### Supervivencia y series de tiempo

#### Autocorrelación de una serie de tiempo (`autocorrelacion`)

4 casos de validación armados.

- **Autocorrelación simple y parcial** (`acf`): Rezago [entero] · ACF [→ acf] · PACF [→ acf]
- **Pruebas de independencia (rezagos # a #)** (`box`): Prueba · Q [→ q] · gl [→ gl] · p [→ p]

#### Curvas de supervivencia (Kaplan-Meier) (`kaplan-meier`)

7 casos de validación armados.

- **Mediana y cuartiles del tiempo hasta el evento** (`resumen`): insecticida · n [→ n] · Eventos [entero] · Cuartil # % [sigEnt] · Mediana [→ mediana] · IC inferior [→ ic] · IC superior [→ ic] · Cuartil # % [sigEnt] · tratamiento · Curva
- **Comparación de las curvas (log-rank)** (`comparacion`): insecticida · n [→ n] · Observados [forma2] · Esperados [forma2] · (O − E)²/E [forma2] · tratamiento
- **Tabla de supervivencia (tiempos con eventos)** (`curva`): insecticida · horas [dato] · En riesgo [entero] · Eventos [entero] · Supervivencia [→ supervivencia] · EE [→ ee] · IC inferior [→ ic] · IC superior [→ ic] · tratamiento · dias [dato] · t [→ t]
- Semáforo: Censura

#### Descomposición de una serie (tendencia y estacionalidad) (`descomposicion`)

3 casos de validación armados.

- **Componente estacional (posición en el ciclo)** (`figura`): Posición [entero] · Efecto (unidades de la variable) [forma] · Índice (# = sin efecto) [forma]
- **Serie y componentes** (`componentes`): mes [dato] · precipitacion [dato] · Tendencia [sig] · Estacional [sig] · Residuo [sig] · trimestre [dato] · toneladas [dato] · dia [dato] · insectos [dato]

#### Modelo ARIMA y pronóstico (`arima`)

10 casos de validación armados.

- **Coeficientes** (`coeficientes`): Término · Estimación [→ coeficiente] · EE [→ ee] · z [→ z] · p [→ p]
- **Ajuste** (`ajuste`): Medida · Valor [sigEnt]
- **Pronóstico** (`pronostico`): Paso [entero] · mes [dato] · Pronóstico [sig] · EE [→ ee] · IC inferior [→ ic] · IC superior [→ ic] · anio [dato] · semana [dato] · t [→ t] · Tiempo [sigEnt]
- **Modelos comparados por AIC** (`busqueda`): Modelo · AIC [→ aic]
- Semáforo: Residuos sin autocorrelación

#### Modelo de riesgos proporcionales de Cox (`cox`)

7 casos de validación armados.

- **Coeficientes y razones de riesgo** (`coeficientes`): Término · Coeficiente [→ coeficiente] · EE [→ ee] · z [→ z] · p [→ p] · HR [→ hr] · HR inferior [→ ic] · HR superior [→ ic]
- **Pruebas globales (todos los coeficientes = #)** (`pruebas`): Prueba · χ² [→ chi2] · gl [→ gl] · p [→ p]
- **Prueba de riesgos proporcionales** (`proporcionales`): Término · χ² [→ chi2] · gl [→ gl] · p [→ p]
- Semáforo: Riesgos proporcionales · Eventos por coeficiente · Convergencia

#### Tendencia monótona (Mann-Kendall y Sen) (`tendencia`)

4 casos de validación armados.

- **Prueba de tendencia y pendiente** (`tendencia`): Medida · Valor [sigEnt]
