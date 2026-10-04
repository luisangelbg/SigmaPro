# SigmaPro — Fase 3 detallada

Plan de la tercera fase (3 de octubre de 2026), después de cerrar la Fase 2 (versión 0.2.0). Sigue la propuesta
(`PROPUESTA.md` §12): multivariado enlazando con PCAPro y ClusteringPro en lugar de duplicarlos; potencia y tamaño de
muestra; muestreo; supervivencia y series de tiempo básicas. Todo corre en el núcleo JS (sin motor R ni internet) y
se valida contra R con la misma regla de siempre (1e-6, `docs/VALIDACION.md`).

Contenido: 1. Decisiones · 2. Métodos · 3. Validación · 4. Orden de construcción · 5. Riesgos.

## 1. Decisiones

| # | Tema | Decisión |
|---|---|---|
| 1 | Motor | Todo en el núcleo JS: son cálculos cerrados o iterativos pequeños (Newton en Cox), sin paquetes que portar. |
| 2 | Multivariado | El ACP, el análisis de correspondencias y los conglomerados ya están validados en PCAPro y ClusteringPro: SigmaPro no los duplica. Agrega lo que esas apps no tienen y que pide un ensayo agronómico (MANOVA y análisis discriminante) y un botón que prepara los datos para ellas (CSV con las variables elegidas y la liga a la app). El traspaso directo por el almacenamiento local del navegador necesita que PCAPro y ClusteringPro lo lean: queda como pendiente de la suite (no se tocan otras apps). |
| 3 | Referencias | R base (power.t.test, power.prop.test, power.anova.test, summary.manova, acf, pacf, Box.test, decompose), pwr, survival, MASS, Kendall y trend; el muestreo, con las fórmulas de Cochran escritas en R base (survey no está instalado). |
| 4 | Versión | Al cerrar la fase: 0.3.0. La 1.0.0 queda para la publicación. |

## 2. Métodos

**Potencia y tamaño de muestra** (familia `potencia`, «Tamaño de muestra, potencia y muestreo»)
- Prueba t (una muestra, pareada, dos muestras): potencia, n o diferencia detectable, como power.t.test.
- Proporciones (dos grupos): como power.prop.test; una proporción y correlación: como pwr (h de Cohen, z de Fisher).
- ANOVA de una vía (k grupos): como power.anova.test; con f de Cohen, como pwr.anova.test.
- Repeticiones de un experimento: cuántas repeticiones hacen falta para detectar una diferencia de d % con un CV dado
  (fórmula iterativa de Cochran y Cox con t de los gl del error del diseño).

**Muestreo** (en la misma familia `potencia`)
- Tamaño de muestra para estimar una media o una proporción con un error dado, con población finita.
- Estimación con muestreo aleatorio simple y estratificado: media, total, proporción, sus EE con corrección por
  población finita e intervalos; asignación proporcional y de Neyman.

**Supervivencia** (familia `supervivencia`, «Supervivencia y series de tiempo»)
- Kaplan-Meier por grupos con IC (log, log-log, plano), mediana con su IC, como survfit.
- Prueba log-rank (y la de Peto-Peto con ρ = 1), como survdiff.
- Modelo de Cox con empates de Efron o Breslow: coeficientes, razones de riesgo con IC, pruebas de Wald, razón de
  verosimilitudes y score, como coxph.

**Series de tiempo** (en la misma familia `supervivencia`)
- Autocorrelación y autocorrelación parcial con sus bandas, Box-Pierce y Ljung-Box, como acf, pacf y Box.test.
- Descomposición clásica aditiva o multiplicativa (tendencia por medias móviles, estacionalidad y residuo), como
  decompose.
- Tendencia: Mann-Kendall (con la corrección por empates) y la pendiente de Sen con su IC, como Kendall y trend.

**Multivariado** (familia `multivariado`)
- MANOVA de diseños (completamente al azar, bloques, factorial) con Pillai, Wilks, Hotelling-Lawley y Roy, como
  summary.manova; las matrices de sumas de cuadrados y productos.
- Análisis discriminante lineal: funciones canónicas, proporción de la traza, coeficientes, medias de grupo y la tabla
  de clasificación (con y sin validación cruzada), como MASS::lda.
- «Preparar para PCAPro / ClusteringPro»: el CSV con las variables elegidas y la liga a la app.

## 3. Validación

Casos en `tests/casos/<familia>/` con su generador en R, como en las fases 1 y 2. Clase A (fórmulas cerradas) para
potencia, muestreo, MANOVA, discriminante, ACF y descomposición; clase D (iterativos) para el modelo de Cox, con el
óptimo pulido en los dos lados. Cada método trae, como siempre: conclusión, cuadros, supuestos, figuras, párrafo con
citas y código R equivalente (que `tests/codigo-r.mjs` corre).

## 4. Orden de construcción

| Hito | Contenido |
|---|---|
| 3.0 | Potencia y tamaño de muestra |
| 3.1 | Muestreo |
| 3.2 | Supervivencia: Kaplan-Meier, log-rank y Cox |
| 3.3 | Series de tiempo básicas |
| 3.4 | Multivariado: MANOVA, discriminante y preparación para PCAPro y ClusteringPro |
| 3.5 | Asistente y constructor para la Fase 3; cierre (rendimiento, accesibilidad, capturas, pendientes, 0.3.0) |

## 5. Riesgos

1. **Cox con empates**: la verosimilitud de Efron debe coincidir con coxph a 1e-6; se pule con Newton hasta el paso
   relativo de 1e-13 y se compara contra coxph con `control = coxph.control(eps = 1e-12, iter.max = 100)`.
2. **power.t.test** resuelve n con uniroot: la referencia se pide con `tol = 1e-12` y la app usa el mismo algoritmo de
   raíz (SP.num.raizR).
3. **lda** escala las funciones discriminantes de una forma propia (varianza dentro de grupos = 1): se reproduce esa
   convención; el signo de cada función se fija como en el ACP de las otras apps.
