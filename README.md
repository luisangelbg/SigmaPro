# SigmaPro

**Estadística para la investigación agronómica y biológica, con cifras que se pueden comprobar.**

SigmaPro es una aplicación web de análisis estadístico: diseños experimentales, comparaciones de
medias, regresión y, más adelante, modelos mixtos y ensayos multiambiente. Forma parte de la
[LABG Suite](https://luisangelbg.github.io/).

- **Exactitud verificada.** Cada método se compara contra R con datos publicados o clásicos, número por
  número, con tolerancia de 1 × 10⁻⁶. Nada se libera sin su prueba. El reporte de validación está en la
  propia app (bloque 8) y en [`tests/reporte-validacion.html`](tests/reporte-validacion.html).
- **Reproducible.** Cada análisis trae el código R equivalente.
- **Privado.** Todo se calcula en el navegador; los datos no salen del equipo.
- **Sin instalación.** Se abre con doble clic en `index.html` y funciona sin conexión; publicada en la web, se
  guarda en el navegador la primera vez y después abre sin red.
- **Rápido con tablas grandes.** Probado con 100 000 filas: una ANOVA con Tukey en menos de una décima de segundo.

## Estado

**Fase 1 completa (hitos 1.0 a 1.12):** cimientos (registro de métodos, cálculos en
hilos de trabajo, pruebas automáticas en node y en el navegador, generador de referencias con R y reporte
de validación), núcleo numérico (distribuciones, álgebra, fórmulas y modelo lineal con sumas de cuadrados
tipo I, II y III) y el bloque de **Datos**: hoja de cálculo para 100 000 filas con deshacer, importación de
CSV, .xlsx y .ods con lectores propios, tipos de variable explicados, faltantes, filtros, variables
calculadas, transformaciones con Box-Cox, cambio de forma ancha ⇄ larga, diagnóstico del diseño del ensayo
y doce conjuntos de ejemplo; y el bloque **Explorar**: descriptivos por hasta tres factores con sus
intervalos, frecuencias, proporciones con seis intervalos y bondad de ajuste ji cuadrada, cada uno con el
código R que reproduce sus números; y la **revisión de los supuestos** del modelo (normalidad, varianzas, aditividad,
independencia y atípicos) con semáforo, recomendaciones y gráficas de diagnóstico; y las **pruebas t** (una muestra,
Student, Welch y pareada, con la F de varianzas y la d de Cohen y la g de Hedges con su intervalo) y **no
paramétricas** (Wilcoxon y Mann-Whitney con Hodges-Lehmann, Kruskal-Wallis y Friedman con Dunn, Conover-Iman,
Nemenyi o Wilcoxon pareada, ajustes de Holm, Bonferroni y BH, y letras de agrupación); y el **ANOVA de los diseños
experimentales** (completamente al azar, bloques completos —también generalizados y con parcelas perdidas—, cuadro
latino, factoriales de hasta tres factores, parcelas divididas, subdivididas y en franjas con un error por estrato,
bloques incompletos balanceados, látice y alfa-látice), con sumas de cuadrados tipo I, II y III, CV, R², eficiencia
relativa, medias marginales estimadas y efectos simples; y las **comparaciones de medias** (Tukey, DMS, Duncan, SNK,
Scheffé, Bonferroni, Šidák, Holm, Dunnett exacto y Games-Howell, con letras, también dentro de cada nivel de otro
factor y en parcelas divididas con Satterthwaite), contrastes, polinomios ortogonales con la dosis óptima y medias
ajustadas; y la **ANCOVA** (completamente al azar y bloques, con homogeneidad de pendientes, medias ajustadas y eficiencia)
y la **regresión** simple, múltiple y polinomial con diagnóstico completo (influencia, Breusch-Pagan, RESET,
Durbin-Watson, VIF, índices de condición), predicciones y selección de variables (paso a paso por AIC o valor p y mejores
subconjuntos); y la **correlación** (Pearson, Spearman y Kendall exactas o aproximadas, matrices con p ajustados, parcial y
semiparcial) y las **tablas de contingencia** (ji cuadrada, G², Fisher exacta 2 × 2 y r × c, residuos ajustados, medidas
nominales y ordinales, razón de momios, McNemar y Bowker, Cochran-Mantel-Haenszel con Breslow-Day y kappa); y el
**asistente** que pregunta en lenguaje del campo y recomienda el análisis con su porqué, el **constructor visual de
modelos** (variables arrastradas a sus zonas, o con teclas, y la fórmula que se puede editar con la explicación de cada
término) y el **modelo lineal general** desde una fórmula (anidados, interacciones con covariables, SC tipo I, II y III,
medias marginales); y el **Reporte LABG** (conclusión en palabras, cuadros de revista numerados, supuestos con
semáforo, el párrafo de métodos y resultados para la tesis o el artículo con la cita de cada prueba, detalles técnicos
y código R), las **figuras de publicación** (SVG, PDF vectorial, PNG y TIFF a 600 ppp) y las **exportaciones**: reporte
en .docx, PDF y HTML, cuadros en hoja de cálculo y LaTeX, y el **proyecto .labg** con la huella SHA-256 de cada archivo y
el código R que lo repite todo; y el cierre de la fase: **uso sin conexión**, **100 000 filas** en 43 operaciones
medidas dentro de su meta, la prueba de **privacidad** (ningún dato sale del navegador) y la **auditoría de
accesibilidad AA** en claro y oscuro, a 1280 y 360 px, con el foco revisado tecla por tecla. Validado contra R en 624
casos y 48 458 valores.

**Fase 2 en curso** (plan en [`propuesta/FASE2.md`](propuesta/FASE2.md)): el **motor R dentro del navegador** (webR,
que se descarga solo cuando se necesita; los datos no salen del equipo) y el **modelo lineal mixto** escrito como
fórmula, con efectos aleatorios como en lme4, grados de libertad de Satterthwaite o Kenward-Roger, componentes de
varianza, medias marginales con letras, prueba de cada aleatorio y BLUP; y los diseños con efectos aleatorios
(bloques aleatorios, parcelas divididas, látice y alfa-látice, varias localidades) y las **medidas repetidas en el
tiempo** con la comparación de estructuras de covarianza (simetría compuesta, AR(1), no estructurada…), validados en
el navegador contra R. Y, en el propio núcleo (sin internet), los **componentes de varianza por REML**, la
**heredabilidad** (en medias, de Cullis y de Piepho) con BLUP, BLUE y ganancia por selección, la **repetibilidad** y los
**modelos lineales generalizados** (conteos con Poisson o binomial negativa, proporciones, gamma), con las medias en la
escala de la respuesta; y, en el motor R, los **modelos lineales generalizados mixtos** (conteos y proporciones con
bloques aleatorios y el efecto por observación para la sobredispersión). Y la **regresión no lineal**: curvas de
crecimiento, dosis-respuesta con DE50 y respuesta con meseta (dosis óptima), con la comparación de curvas entre grupos.
Y las **superficies de respuesta**: punto óptimo, análisis canónico, cresta y ascenso más pronunciado. En total, 712
casos y 71 401 valores. Lo que falta para publicar y las
fases 2 y 3 están en
[`docs/PENDIENTES.md`](docs/PENDIENTES.md). El plan
completo está en
[`propuesta/PROPUESTA.md`](propuesta/PROPUESTA.md) y una maqueta navegable del flujo en
[`propuesta/maqueta.html`](propuesta/maqueta.html); capturas de la app en [`docs/capturas/`](docs/capturas/).

## Pruebas

```
Rscript tests/r/generar-todo.R    # referencias con R
node tests/correr.mjs             # pruebas y reporte
node tests/navegador.mjs          # las mismas pruebas en el navegador
node tests/codigo-r.mjs           # el código R que muestra la app corre en R y da lo mismo
node tests/exportar.mjs           # cada exportación, leída con lectores independientes (R y el sistema)
node tests/sin-conexion.mjs       # privacidad y uso sin conexión
node tests/rendimiento/medir.mjs  # rendimiento con 100 000 filas
node tests/accesibilidad/auditar.mjs  # accesibilidad AA
node tests/motor-r.mjs            # los métodos del motor R, en el navegador (necesita internet)
```

O abre `tests/index.html` con doble clic. Detalles en [`docs/VALIDACION.md`](docs/VALIDACION.md).

## Licencia

GPL-3.0 o posterior (ver [`LICENSE`](LICENSE)). Componentes de terceros en
[`LICENSES-TERCEROS.md`](LICENSES-TERCEROS.md).

---

*SigmaPro is a browser-based statistics application for agricultural and biological research. Every method
is validated number by number against R (tolerance 1e-6) on published datasets; data never leave the browser.
Interface in Spanish. Licensed under GPL-3.0-or-later.*
