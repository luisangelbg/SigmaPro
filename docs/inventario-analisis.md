# Inventario de análisis y fichas de Fundamentos

SigmaPro 0.5.0 · 78 análisis, 78 fichas

Cada análisis de SigmaPro tiene su ficha en el bloque 9 (Fundamentos). La tabla dice, por familia, con qué motor corre,
el estado de la ficha, su conjunto de ejemplo, la revisión técnica que la revisó (ver `docs/revision-fundamentos.md`) y
las apps de la suite LABG que se sugieren en su resultado o al pie de su familia (reglas en `data/suite-rules.js`).

- **Estado:** ✓ = la ficha tiene los nueve apartados en español y en inglés y pasa el validador (`node tests/fundamentos.mjs`).
- **Ejemplo:** el conjunto que carga «Cargar estos datos de ejemplo» (`datos/ejemplos.js`); los análisis de planeación no usan datos.
- **Revisión:** el grupo (R1 a R6) y si la ficha cambió en la revisión.


## Descriptivos e intervalos

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Estadísticos descriptivos | `descriptivos` | JavaScript | ✓ 9 apartados ES/EN | `chile-frutos` | R1 · corregida | — |
| Tablas de frecuencias | `frecuencias` | JavaScript | ✓ 9 apartados ES/EN | `roya-evaluadores` | R1 · sin cambios | — |
| Proporciones e intervalos de confianza | `proporciones` | JavaScript | ✓ 9 apartados ES/EN | `frijol` | R1 · corregida | — |
| Bondad de ajuste ji cuadrada | `bondad-ajuste` | JavaScript | ✓ 9 apartados ES/EN | `mendel` | R1 · corregida | — |

## Supuestos del modelo

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Revisar los supuestos del modelo | `supuestos` | JavaScript | ✓ 9 apartados ES/EN | `venenos` | R1 · corregida | — |

## Pruebas t

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Prueba t | `prueba-t` | JavaScript | ✓ 9 apartados ES/EN | `jitomate` | R1 · sin cambios | — |

## Pruebas no paramétricas

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Wilcoxon y Mann-Whitney | `wilcoxon` | JavaScript | ✓ 9 apartados ES/EN | `jitomate` | R1 · corregida | — |
| Kruskal-Wallis | `kruskal-wallis` | JavaScript | ✓ 9 apartados ES/EN | `aguacate-huertas` | R1 · sin cambios | — |
| Friedman | `friedman` | JavaScript | ✓ 9 apartados ES/EN | `aguacate` | R1 · corregida | — |

## Diseños experimentales

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Completamente al azar | `dca` | JavaScript | ✓ 9 apartados ES/EN | `venenos` | R1 · corregida | AgriDesign |
| Bloques completos al azar | `dbca` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R1 · corregida | AgriDesign |
| Cuadro latino | `cuadro-latino` | JavaScript | ✓ 9 apartados ES/EN | `trigo` | R1 · corregida | AgriDesign |
| Parcelas divididas | `parcelas-divididas` | JavaScript | ✓ 9 apartados ES/EN | `avena` | R2 · corregida | AgriDesign |
| Parcelas subdivididas | `parcelas-subdivididas` | JavaScript | ✓ 9 apartados ES/EN | `arroz-subdivididas` | R2 · corregida | AgriDesign |
| Parcelas en franjas | `franjas` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R2 · sin cambios | AgriDesign |
| Bloques incompletos balanceados | `bib` | JavaScript | ✓ 9 apartados ES/EN | `sorgo-bib` | R2 · corregida | AgriDesign |
| Látice y alfa-látice | `latice` | JavaScript | ✓ 9 apartados ES/EN | `alfa-latice` | R2 · corregida | AgriDesign |
| Modelo lineal general (fórmula) | `modelo-lineal` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R1 · sin cambios | AgriDesign |

## Comparaciones de medias y contrastes

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Comparaciones de medias | `comparaciones-medias` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R2 · corregida | AgriDesign |
| Contrastes | `contrastes` | JavaScript | ✓ 9 apartados ES/EN | `venenos` | R2 · corregida | AgriDesign |
| Polinomios ortogonales | `polinomios` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R2 · corregida | AgriDesign |
| Medias ajustadas | `medias-ajustadas` | JavaScript | ✓ 9 apartados ES/EN | `alfa-latice` | R2 · sin cambios | AgriDesign |

## ANCOVA y regresión

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Regresión lineal simple y múltiple | `regresion-lineal` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R2 · sin cambios | CorrelationPro, PCAPro |
| Regresión polinomial | `regresion-polinomial` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R2 · sin cambios | CorrelationPro, PCAPro |
| Selección paso a paso | `seleccion-pasos` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R2 · corregida | CorrelationPro, PCAPro |
| Mejores subconjuntos | `mejores-subconjuntos` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R3 · corregida | CorrelationPro, PCAPro |
| Análisis de covarianza (ANCOVA) | `ancova` | JavaScript | ✓ 9 apartados ES/EN | `sorgo` | R2 · corregida | CorrelationPro, PCAPro |

## Correlación

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Correlación de dos variables | `correlacion` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R3 · sin cambios | CorrelationPro, PCAPro |
| Matriz de correlaciones | `matriz-correlacion` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R3 · sin cambios | CorrelationPro, PCAPro |
| Correlación parcial y semiparcial | `correlacion-parcial` | JavaScript | ✓ 9 apartados ES/EN | `cafe` | R3 · sin cambios | CorrelationPro, PCAPro |

## Tablas de contingencia

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Tabla de contingencia | `tabla-contingencia` | JavaScript | ✓ 9 apartados ES/EN | `germinacion-lotes` | R3 · corregida | — |
| McNemar y Bowker (datos pareados) | `mcnemar` | JavaScript | ✓ 9 apartados ES/EN | `roya-evaluadores` | R3 · sin cambios | — |
| Cochran-Mantel-Haenszel (por estratos) | `mantel-haenszel` | JavaScript | ✓ 9 apartados ES/EN | `germinacion-lotes` | R3 · sin cambios | — |
| Concordancia entre evaluadores (kappa) | `kappa` | JavaScript | ✓ 9 apartados ES/EN | `roya-evaluadores` | R3 · corregida | — |

## Modelos mixtos

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Modelo lineal mixto (fórmula) | `modelo-mixto` | R en el navegador | ✓ 9 apartados ES/EN | `maiz` | R4 · corregida | — |
| Bloques al azar con bloques aleatorios | `mixto-bloques` | R en el navegador | ✓ 9 apartados ES/EN | `maiz` | R4 · corregida | AgriDesign |
| Parcelas divididas (modelo mixto) | `mixto-divididas` | R en el navegador | ✓ 9 apartados ES/EN | `avena` | R4 · corregida | AgriDesign |
| Látice y alfa-látice (recuperación entre bloques) | `mixto-latice` | R en el navegador | ✓ 9 apartados ES/EN | `alfa-latice` | R4 · corregida | AgriDesign |
| Ensayos en varias localidades | `mixto-localidades` | R en el navegador | ✓ 9 apartados ES/EN | `avena-ambientes` | R4 · corregida | — |
| Medidas repetidas en el tiempo | `medidas-repetidas` | R en el navegador | ✓ 9 apartados ES/EN | `maiz-altura` | R4 · corregida | — |

## Componentes de varianza y heredabilidad

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Componentes de varianza (REML) | `componentes-varianza` | JavaScript | ✓ 9 apartados ES/EN | `alfa-latice` | R4 · corregida | — |
| Heredabilidad y BLUP de genotipos | `heredabilidad` | JavaScript | ✓ 9 apartados ES/EN | `alfa-latice` | R4 · corregida | — |
| Repetibilidad | `repetibilidad` | JavaScript | ✓ 9 apartados ES/EN | `guayabo-cosechas` | R4 · corregida | — |

## Modelos lineales generalizados

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Conteos (Poisson y binomial negativa) | `glm-conteos` | JavaScript | ✓ 9 apartados ES/EN | `aguacate` | R5 · corregida | — |
| Proporciones (binomial) | `glm-proporciones` | JavaScript | ✓ 9 apartados ES/EN | `frijol` | R5 · sin cambios | — |
| Respuestas positivas asimétricas (gamma) | `glm-gamma` | JavaScript | ✓ 9 apartados ES/EN | `venenos` | R5 · sin cambios | — |
| Modelo lineal generalizado (fórmula) | `glm` | JavaScript | ✓ 9 apartados ES/EN | `frijol-germinacion` | R5 · corregida | — |
| Conteos o proporciones en bloques aleatorios (mixto) | `glmm-bloques` | R en el navegador | ✓ 9 apartados ES/EN | `aguacate` | R4 · corregida | — |
| Modelo lineal generalizado mixto (fórmula) | `glmm` | R en el navegador | ✓ 9 apartados ES/EN | `aguacate` | R5 · sin cambios | — |

## Regresión no lineal

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Curva de crecimiento | `curva-crecimiento` | JavaScript | ✓ 9 apartados ES/EN | `maiz-altura` | R5 · sin cambios | — |
| Dosis-respuesta (log-logístico) | `dosis-respuesta` | JavaScript | ✓ 9 apartados ES/EN | `herbicida-dosis` | R5 · sin cambios | — |
| Respuesta a la dosis con meseta | `respuesta-meseta` | JavaScript | ✓ 9 apartados ES/EN | `maiz` | R5 · corregida | — |

## Superficies de respuesta

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Superficie de respuesta (segundo orden) | `superficie-respuesta` | JavaScript | ✓ 9 apartados ES/EN | `tomate-superficie` | R5 · corregida | — |
| Primer orden y ascenso más pronunciado | `ascenso-pronunciado` | JavaScript | ✓ 9 apartados ES/EN | `tomate-superficie` | R5 · sin cambios | — |
| Generar un diseño de superficie o de mezclas | `diseno-superficie` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R5 · sin cambios | — |
| Mezclas (modelos de Scheffé) | `mezclas` | JavaScript | ✓ 9 apartados ES/EN | `hilo-mezcla` | R5 · corregida | — |
| Deseabilidad de varias respuestas | `deseabilidad` | JavaScript | ✓ 9 apartados ES/EN | `fruto-respuestas` | R5 · corregida | — |

## Ensayos multiambiente y estabilidad

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Análisis conjunto de varios ambientes | `ensayos-multiambiente` | JavaScript | ✓ 9 apartados ES/EN | `avena-ambientes` | R6 · corregida | ClusteringPro, PCAPro |
| Análisis en dos etapas (una varianza por ambiente) | `dos-etapas` | JavaScript | ✓ 9 apartados ES/EN | `avena-ambientes` | R6 · corregida | ClusteringPro, PCAPro |
| Estabilidad (Eberhart-Russell, Wricke, Shukla, Huehn, Kang, Annicchiarico) | `estabilidad` | JavaScript | ✓ 9 apartados ES/EN | `avena-ambientes` | R6 · corregida | ClusteringPro, PCAPro |
| AMMI (efectos principales aditivos e interacción multiplicativa) | `ammi` | JavaScript | ✓ 9 apartados ES/EN | `avena-ambientes` | R6 · corregida | ClusteringPro, PCAPro |
| Biplot GGE | `gge` | JavaScript | ✓ 9 apartados ES/EN | `avena-ambientes` | R6 · corregida | ClusteringPro, PCAPro |

## Tamaño de muestra, potencia y muestreo

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Potencia y tamaño de muestra: medias (prueba t) | `potencia-medias` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · corregida | AgriDesign |
| Potencia y repeticiones: ANOVA de varios tratamientos | `potencia-anova` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · sin cambios | AgriDesign |
| Potencia y tamaño de muestra: dos proporciones | `potencia-proporciones` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · sin cambios | AgriDesign |
| Potencia y tamaño de muestra: correlación | `potencia-correlacion` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · sin cambios | AgriDesign |
| Número de repeticiones de un experimento | `repeticiones` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · sin cambios | AgriDesign |
| Tamaño de muestra para estimar una media o una proporción | `tamano-muestra` | JavaScript | ✓ 9 apartados ES/EN | planeación (sin datos) | R6 · sin cambios | AgriDesign |
| Estimación con muestreo aleatorio simple | `muestreo-simple` | JavaScript | ✓ 9 apartados ES/EN | `aguacate-huertas` | R6 · corregida | AgriDesign |
| Estimación con muestreo estratificado | `muestreo-estratificado` | JavaScript | ✓ 9 apartados ES/EN | `aguacate-huertas` | R6 · corregida | AgriDesign |

## Supervivencia y series de tiempo

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| Curvas de supervivencia (Kaplan-Meier) | `kaplan-meier` | JavaScript | ✓ 9 apartados ES/EN | `frijol-germinacion` | R3 · corregida | — |
| Modelo de riesgos proporcionales de Cox | `cox` | JavaScript | ✓ 9 apartados ES/EN | `frijol-germinacion` | R3 · sin cambios | — |
| Autocorrelación de una serie de tiempo | `autocorrelacion` | JavaScript | ✓ 9 apartados ES/EN | `estacion-mensual` | R3 · sin cambios | — |
| Descomposición de una serie (tendencia y estacionalidad) | `descomposicion` | JavaScript | ✓ 9 apartados ES/EN | `estacion-mensual` | R4 · corregida | — |
| Tendencia monótona (Mann-Kendall y Sen) | `tendencia` | JavaScript | ✓ 9 apartados ES/EN | `estacion-mensual` | R4 · sin cambios | — |
| Modelo ARIMA y pronóstico | `arima` | JavaScript | ✓ 9 apartados ES/EN | `estacion-mensual` | R4 · sin cambios | — |

## Análisis multivariado

| Análisis | id | Motor | Ficha | Ejemplo | Revisión | Suite LABG |
|---|---|---|---|---|---|---|
| MANOVA (varias respuestas a la vez) | `manova` | JavaScript | ✓ 9 apartados ES/EN | `chile-frutos` | R3 · corregida | PCAPro, ClusteringPro |
| Análisis discriminante lineal | `discriminante` | JavaScript | ✓ 9 apartados ES/EN | `chile-frutos` | R3 · corregida | ClusteringPro, PCAPro |

## Totales

- 78 análisis y 78 fichas (cobertura 100 %).
- 71 fichas con conjunto de ejemplo y 7 de planeación.
- 78 fichas revisadas; 49 cambiaron en la revisión.
- 26 conjuntos de ejemplo distintos (de 27 en la app).
