# Cambios

## Sin publicar

### Hito 1.7 · comparaciones de medias, contrastes y medias ajustadas (1 oct 2026)

- `js/metodos/comparaciones.js`: un motor de combinaciones lineales sobre las medias marginales del diseño, con un
  solo error o con estratos (cada diferencia con el error de su estrato y los gl de Satterthwaite, como emmeans).
  Pares con DMS (también protegida), Tukey-Kramer, Duncan, SNK, Scheffé, Bonferroni, Šidák y Holm; Dunnett bilateral o
  de una cola con la t multivariada exacta (integral doble de Gauss-Kronrod adaptativa, que reproduce el cuadro de
  Dunnett, 1955); Games-Howell; letras por inserción y absorción con la «a» para la media más alta; comparaciones
  dentro de cada nivel de otro factor; contrastes escritos como texto con su prueba, su SC y la revisión de
  ortogonalidad; polinomios ortogonales con dosis igual o desigualmente espaciadas, la curva ajustada a las medias y la
  dosis óptima; medias ajustadas con su intervalo.
- `SP.estratos` entrega los coeficientes por estrato y la varianza combinada; `SP.medias` expone la rejilla y las
  filas de medias.
- Bloque 4: familia «Comparaciones de medias y contrastes» (cuatro métodos) con el diseño y sus papeles en el mismo
  formulario, gráfica de medias con barras de error y letras (`SP.graficas.medias`), varias gráficas cuando se compara
  dentro de cada nivel, curva de los polinomios, y el botón «Comparar las medias de este diseño» en cada ANOVA.
- Validación: 49 casos nuevos contra R (5 642 valores) con emmeans, agricolae, PMCMRplus y una integral independiente
  para Dunnett; hallazgos documentados: el Šidák de emmeans pierde cifras con p diminutos (clase B) y el ptukey de R
  tiene un error de hasta 2e-5 con pocos gl (con una sola comparación se usa la t, como emmeans). 6 pruebas unitarias
  y 5 escenarios del código R nuevos (29 en total), que verifican también las letras.
- Con 100 000 filas, cada comparación tarda entre 0.4 y 1.5 s.

### Hito 1.6 · ANOVA de diseños experimentales (1 oct 2026)

- Núcleo: `js/nucleo/estratos.js`, análisis de varianza con estratos de error como `aov(… + Error())` (parcelas
  divididas, subdivididas y en franjas); `js/nucleo/medias.js`, rejilla de referencia con medias marginales estimadas,
  su EE, estimabilidad con celdas vacías o términos confundidos, detección de factores anidados como emmeans, y efectos
  simples por pruebas F conjuntas (como `joint_tests`). El modelo de la fórmula acepta `filas` para ajustar dos
  modelos sobre las mismas filas.
- `js/metodos/disenos.js`: un método por diseño (completamente al azar, bloques completos al azar, cuadro latino,
  parcelas divididas con las grandes en bloques, al azar o en cuadro latino, subdivididas, franjas, bloques incompletos
  balanceados, látice y alfa-látice), factoriales de hasta tres factores, bloques generalizados y parcelas perdidas
  detectados solos, SC tipo I, II y III con la explicación de cada una (tipo II automático si el III no existe),
  avisos de términos confundidos y de desbalance en estratos, media, CV (uno por error), R², eficiencia relativa de los
  bloques y del cuadro latino (Gomez y Gomez, 1984) y efectos simples.
- Bloque 4: formularios por diseño con los papeles propuestos a partir de la tabla (bloques, filas, columnas,
  repeticiones), gráfica de interacción con marcadores y trazos distintos (`SP.graficas.lineas`) y cuadros de ANOVA
  con el total, resumen, medias y efectos simples. El catálogo ordena los diseños de lo simple a lo complejo.
- Ejemplo nuevo: la avena en parcelas divididas de Yates (1935), cotejada con la copia de R.
- Validación: 45 casos nuevos contra R (1 905 valores), con agricolae (sp.plot, ssp.plot, strip.plot, BIB.test) además de
  aov, car y emmeans; clase B nueva: emmeans redondea la F de las pruebas conjuntas. 7 pruebas unitarias nuevas y 5
  escenarios más del código R (24 en total).
- Rendimiento: con 2 000 filas o más y pocas celdas, el modelo lineal y los estratos se ajustan por celdas ponderadas
  (mismas sumas de cuadrados): un bloque generalizado de 100 000 filas pasó de 23 s a 2 s, unas subdivididas de 16 s a 1 s.

### Hito 1.5 · pruebas t y no paramétricas (1 oct 2026)

- Núcleo: distribuciones exactas del rango con signo y de la suma de rangos de Wilcoxon (`psignrank`, `qsignrank`,
  `pwilcox`, `qwilcox`, con los conteos y el margen de 10ε de R), la t no central (AS 243, como `pnt.c`) y
  `SP.num.raizR`, traducción paso a paso del `uniroot` de R para llegar a la misma raíz en funciones escalonadas.
- `js/metodos/pruebas-t.js`: t de una muestra, de dos (Student y Welch) y pareada como `t.test`, F de razón de
  varianzas como `var.test`, y d de Cohen y g de Hedges (corrección exacta) con su IC por la t no central. Método
  «Prueba t» con semáforo de normalidad y varianzas (con Welch, varianzas distintas no son un problema).
- `js/metodos/no-parametricas.js`: Wilcoxon de una muestra y pareada y Mann-Whitney con el estimador e intervalo de
  Hodges-Lehmann (exacto o por la normal, como `wilcox.test`); Kruskal-Wallis con η² de H y comparaciones de Dunn,
  Conover-Iman o Nemenyi; Friedman con la W de Kendall y comparaciones de Conover, Nemenyi o Wilcoxon pareada;
  ajustes de Holm, Bonferroni, Benjamini-Hochberg o Tukey; y letras de agrupación por inserción y absorción (como
  `multcompLetters`), con la «a» para el tratamiento de mayor rango.
- Bloque 4 de la app: formularios para la prueba t y Wilcoxon (que comparten lo elegido) y para Kruskal-Wallis y
  Friedman; gráfica de cajas con los puntos, la media y las letras (`SP.graficas.grupos`); un botón de copiar por
  cuadro. Las marcas de los ejes usan los decimales que pide el paso (0.25 ya no se muestra como 0.3).
- Validación: 115 casos nuevos contra R (7 471 valores) y dos hallazgos de clase B: `qwilcox(0.5, 49, 49)` da 1201
  en vez de 1200 (C(98, 49) con error relativo de 4e-15), y los p de Nemenyi y de Tukey son 1 − `ptukey()`, que
  debajo de 1e-6 solo tiene cifras absolutas (nueva regla `absoluto` del comparador). Documentado también: dunn.test
  no hace monótonos sus p de Holm y BH, y PMCMRplus falla con bloques incompletos tras Friedman.
- `tests/codigo-r.mjs`: 9 escenarios más (19 en total); el tamaño del efecto se escribe en R base. 9 pruebas
  unitarias nuevas (reportes, errores con su arreglo, letras que respetan cada par, `p.adjust` monótono).
- Con 100 000 filas: t en 0.03 s, Kruskal-Wallis en 0.11 s, Friedman en 0.18 s y Wilcoxon con su intervalo en
  menos de 1 s.

### Hito 1.4 · supuestos y semáforo (1 oct 2026)

- `js/metodos/supuestos.js`: normalidad (Shapiro-Wilk con el algoritmo AS R94 de R, Lilliefors, Anderson-Darling,
  Kolmogorov-Smirnov contra una normal dada, exacta de Marsaglia-Tsang-Wang y de Birnbaum-Tingey o asintótica),
  varianzas (Levene, Brown-Forsythe, Bartlett, Fligner-Killeen), no aditividad de Tukey, independencia
  (Durbin-Watson con p exacto por el algoritmo AS 153 de Farebrother o con media y varianza exactas; rachas exactas
  o normales), atípicos e influencia (palancas, residuos estandarizados y estudentizados con Bonferroni, distancia de
  Cook, Grubbs, cercas de Tukey) y la banda del gráfico Q-Q por estadísticos de orden.
- Método «Revisar los supuestos del modelo»: ajusta el modelo del experimento (bloques + tratamientos cruzados),
  prueba sus residuos y arma un semáforo de cinco renglones con reglas documentadas, más recomendaciones (Box-Cox
  con el mismo modelo, conteos, porcentajes, Welch o Kruskal-Wallis, revisar una fila atípica, el orden en campo).
- Bloque 4 de la app: catálogo de análisis por familias (los que faltan muestran su hito), formulario del modelo,
  semáforo (el color siempre con su palabra), gráficas Q-Q con banda, residuos contra ajustados y en orden
  (`js/interfaz/graficas.js`, SVG propio que sigue al tema), cuadro de pruebas y código R.
- Validación: 103 casos nuevos contra R (3 921 valores) y dos hallazgos de clase B documentados (`fligner.test` rompe
  empates exactos por el redondeo de la resta; agricolae calcula p = 1 − pf y pierde cifras con p diminuto). El
  AS 153 reproduce la tabla publicada por Farebrother (1984). `tests/codigo-r.mjs` corre también el código R de
  los supuestos (10 escenarios).
- Rendimiento: el ajuste por celdas (`SP.algebra.minimosCuadradosAgrupados`) evita la QR completa en tablas grandes
  de solo factores; Durbin-Watson normal por diferencias dispersas; palancas por celda. Con 100 000 filas: 1.1 s con
  un factor y 2.5 s con bloques × factorial de 109 columnas (antes 7.3 s), con aviso «Calculando…».
- La prueba del código R encontró y corrigió un `$` perdido en la línea de no aditividad. `sp_caso` ahora se detiene
  si dos casos de una carpeta comparten nombre: así apareció un caso de expresión del Hito 1.2 («estandarizar») que
  otro del mismo nombre había pisado; se restauró.

### Hito 1.3 · explorar (1 oct 2026)

- Métodos registrados (`js/metodos/`), los primeros que ofrece la app bajo la regla de liberación:
  **descriptivos** (n, faltantes, media, mediana, moda, DE, varianza, EE, CV, extremos, cuartiles con las nueve
  definiciones de Hyndman y Fan, RIC, media recortada, geométrica y armónica, asimetría y curtosis en las tres
  definiciones de Joanes y Gill con sus errores estándar, percentiles a elegir, e intervalos de la media por t,
  de la mediana por estadísticos de orden y de la varianza y la DE por ji cuadrada) por hasta tres factores;
  **frecuencias** de una y dos vías con porcentajes y acumulados; **proporciones** de categorías o de éxitos
  sobre ensayos con seis intervalos (Wilson, Wilson con corrección, Clopper-Pearson, Agresti-Coull, Jeffreys
  y Wald); y **bondad de ajuste ji cuadrada** con proporciones como «9:3:3:1».
- Bloque 3 de la app: formulario por resumen, cálculo inmediato, conclusión en palabras, cuadro de revista
  (con el factor repetido escrito una vez), columnas adicionales a elegir, copia a hoja de cálculo y código R.
- `tests/codigo-r.mjs`: el código R que muestra la app se ejecuta en R y reproduce sus números
  (8 escenarios, 209 valores).
- Núcleo: cuantil de la binomial (`SP.dist.qbinom`), validado; en los empates exactos (p justo en un salto)
  da el valor exacto, donde R se equivoca por redondeo (clase B documentada).
- Validación: 46 casos nuevos contra R (5 079 valores); los cuantiles coinciden con `quantile()` sin ninguna
  diferencia. 10 pruebas unitarias nuevas.
- Un séptimo ejemplo: la F2 dihíbrida del chícharo de Mendel (1866); el frijol trae ahora las semillas
  sembradas.
- Con 100 000 filas, cada resumen tarda menos de 0.1 s (200 grupos con dos variables, interfaz incluida).

### Hito 1.2 · datos (1 oct 2026)

- Lectores propios, sin bibliotecas: CSV y texto (RFC 4180, separador y decimal detectados, UTF-8, Latin-1 y
  UTF-16), .xlsx y .ods (descompresor DEFLATE, lector ZIP y XML propios; fechas, base 1904, errores de celda).
  Libros grandes se leen en un hilo de trabajo.
- Tipos de variable inferidos con su explicación (numérica, factor, fecha, texto, identificador), con
  números con textos sueltos tomados como faltantes y códigos con cero inicial respetados; el usuario decide.
- Hoja editable (`js/nucleo/hoja.js`) con deshacer y rehacer de 200 pasos, pegar desde hojas de cálculo,
  variables calculadas y filtros con expresiones de semántica de R (`js/nucleo/expresiones.js`),
  transformaciones siempre en columna nueva (`js/nucleo/transformar.js`) y Box-Cox con λ̂, intervalo,
  sugerencia de potencia sencilla y perfil, estimado en un hilo con el modelo del experimento.
- Cambio de forma ancha ⇄ larga (`js/nucleo/reformar.js`) y diagnóstico del ensayo
  (`js/nucleo/estructura.js`): tratamientos y factorial, balance, celdas vacías, bloques completos o no,
  cuadro latino, dosis numéricas tomadas como factor del diseño, identificadores y fechas fuera del diseño.
- Bloque 2 de la app: rejilla virtualizada con teclado de hoja de cálculo (accesible como `grid`), lista de
  variables con resumen, menú por columna, ventanas de importar, pegar, calcular, transformar, filtrar,
  cambiar la forma, renombrar y ordenar niveles; seis ejemplos agronómicos (`datos/ejemplos.js`, generados
  por `datos/generar-ejemplos.R`), entre ellos los venenos de Box y Cox (1964).
- Validación: 35 casos nuevos contra R (7 156 valores): CSV contra `read.csv`, .xlsx contra readxl en
  6 610 celdas, 16 expresiones, 8 transformaciones y 3 estimaciones de Box-Cox (clase D).
- Rendimiento con 100 000 filas: crear la hoja 0.4 s, pintar 0.4 s, desplazar 3 a 10 ms, filtrar 0.1 s,
  Box-Cox 0.6 s con la descomposición exacta por celdas (antes 3.9 s).
- Correcciones al Navegador LABG compartido: ya no falla si la página se desplaza antes de arrancar.

### Hito 1.1 · núcleo numérico (1 oct 2026)

- Distribuciones (`js/nucleo/dist.js`): log Γ (Lanczos), log B sin cancelación (Stirling reordenado), normal
  (Cody 1969, verificada contra serie y fracción continua propias), gamma y beta incompletas, t, F, ji cuadrada,
  gamma, beta, binomial, Poisson y rango estudentizado (Copenhaver y Holland 1988); cuantiles por el método de
  Brent en escala logarítmica o logit, hasta colas de 1e-300.
- Álgebra (`js/nucleo/algebra.js`): QR de Householder con el pivoteo limitado de R (tol 1e-7), mínimos
  cuadrados, (RᵀR)⁻¹, Cholesky y el espacio comprimido Q_kᵀX para ajustar submodelos en O(p³).
- Fórmulas (`js/nucleo/formula.js`): `~ + - * : / ^ %in% 0 1`, orden de términos de R, contrastes de
  tratamiento, suma cero, Helmert y polinomiales (también con dosis desiguales), regla de marginalidad para
  elegir contrastes o indicadoras, omisión de filas incompletas y de niveles sin datos.
- Modelo lineal (`js/nucleo/lineal.js`): coeficientes con EE, t y p, R², R² ajustada y F global; análisis de
  varianza con sumas de cuadrados tipo I, II y III (III siempre con suma cero y rechazada con alias).
- Validación: 68 casos nuevos contra R (6 813 valores), de los cuales 2 son de clase B documentados
  (`qtukey` y `qt` de R menos precisos que su propia función de distribución); 26 pruebas unitarias con
  identidades independientes de R; factorial con covariable de 100 000 filas en menos de 3 s.

### Hito 1.0 · cimientos (1 oct 2026)

- Núcleo sin DOM (`js/nucleo/`): espacio de nombres `SP` con textos centralizados (`SP.T`) y errores con
  arreglo (`SP.ErrorSP`); suma compensada, media y varianza en dos pasadas (`SP.num`); tabla en columnas
  con factores de niveles ordenados (`SP.tabla`); registro declarativo de métodos con regla de liberación
  (`SP.metodo`, `SP.metodoDisponible`); cálculos en hilos de trabajo armados desde el texto del núcleo,
  que funcionan con doble clic (`SP.hilo`).
- Validación: arnés de pruebas común a node y navegador, comparador con el criterio 1e-6 y sus reglas,
  generador de referencias con R (`tests/r/`), corredores `tests/correr.mjs` y `tests/navegador.mjs`,
  reporte HTML y CSV, y bloque 8 de la app con el mismo reporte.
- Interfaz: barra común de la suite, Navegador LABG y Estudio de figuras LABG (v1.0.0), portada con el
  estado de los hitos, bloques 2 a 7 anunciados y bloque 8 de validación.
- Primeros casos contra R: `SP.num.resumen` con PlantGrowth, airquality (37 faltantes), un desplazamiento
  de mil millones y magnitudes del orden de 1e-9.
