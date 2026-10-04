# Validación de SigmaPro

Cada número que SigmaPro muestra o exporta se compara contra R. Este documento dice cómo,
con qué criterio y cómo repetirlo.

## Criterio

Un caso **aprueba** si en cada número

```
|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)
```

Reglas adicionales (las aplica `tests/lib/comparar.js`):

| Regla | Para qué |
|---|---|
| **Valores p diminutos.** Si la clave se llama `p`, empieza con `p_` o termina en `_p`, y 0 < \|R\| < 1e-6, se exige además error relativo ≤ 1e-6. | Que un p de 1e-20 no apruebe solo por ser «casi cero». |
| **Modo relativo** (`comparacion: { modo: 'relativo' }`): \|SigmaPro − R\| ≤ 1e-6 · \|R\|. | Magnitudes pequeñas que no son valores p (concentraciones, varianzas de 1e-18). |
| **Tolerancia propia por ruta**, siempre con su motivo: `tolerancias: { 'dunnett.p[*]': { tol: 1e-4, motivo: '…' } }`. | Clases B, C y E (abajo). El motivo aparece en el reporte. |
| **Piso absoluto por ruta**, con su motivo: `tolerancias: { 'pares[*].p_ajustado': { absoluto: 1e-12, motivo: '…' } }`; el límite nunca baja de ese piso. | Valores p que R obtiene como 1 − P de una integral numérica (rango estudentizado): debajo de 1e-6 solo tienen cifras absolutas, en R y en cualquier programa. |
| `"NA"` y `"NaN"` en la referencia esperan un faltante; `"Inf"` y `"-Inf"`, infinito. Textos y lógicos se comparan exactos. | Paridad con R también en los casos límite. |
| Solo se comparan las claves que trae la referencia, pero **todas** deben existir en el resultado. | El resultado puede traer más información que R. |

## Cinco clases de resultados

| Clase | Ejemplos | Cómo se valida |
|---|---|---|
| **A** · fórmula cerrada o algoritmo exacto | sumas de cuadrados, F, t, estimadores, p de t, F y χ² | Contra R, 1e-6. |
| **B** · R usa una aproximación publicada | p de Shapiro-Wilk, Anderson-Darling, cuantiles del rango estudentizado | Se implementa el mismo algoritmo publicado. Si R mismo es menos preciso por diseño, la referencia se calcula en R con tolerancia más fina (`uniroot`, `integrate` a 1e-12) y se documenta. |
| **C** · R usa azar | Dunnett por omisión (cuasi Monte Carlo), Fisher simulada, remuestreo | Referencia determinista por integración numérica de alta precisión; el valor por omisión de R se compara aparte con la tolerancia de su propio error. |
| **D** · optimización iterativa | Box-Cox λ̂; en la Fase 2, REML y GLM | Criterios de convergencia ajustados en ambos lados; 1e-6 sobre el resultado convergido. |
| **E** · libros y artículos | cuadros impresos con 2 a 4 decimales | Media unidad del último dígito impreso. Se cita el libro o el artículo, **no el programa** con que se calculó. |

## Hallazgos documentados (clase B)

Casos en que la referencia no es la función de R (o de su paquete) tal cual, porque es menos precisa por
diseño o por redondeo. En todos, el valor de SigmaPro se comprobó con la propia función de distribución de R o
con una identidad exacta.

| Función | Qué pasa en R | Cómo se valida |
|---|---|---|
| Cuantil del rango estudentizado (`qtukey`) | Su iteración se detiene con tolerancia 1e-4; se desvía hasta 2.7e-7 de su propio `ptukey`. | Referencia = inversión exacta de `ptukey` con `uniroot` a 1e-14 (dif. 6e-12). Un caso aparte contra `qtukey` tal cual: dif. 7.5e-8, dentro del criterio. |
| Cuantil de la binomial justo en un salto (`qbinom`) | Con n impar y prob = ½, P(X ≤ (n − 1)/2) = ½ exactamente; el `pbinom` de R da 0.5 − 2.2e-15 con n = 51 y su `qbinom(0.5, 51, 0.5)` responde 26 en vez de 25. | Referencia = (n − 1)/2 exacto por simetría; la rejilla general (378 valores) se compara contra `qbinom` tal cual. SigmaPro tolera 1e-12 relativo en el salto, que cubre el redondeo de su propia binomial con n de miles. |
| Fligner-Killeen (`fligner.test`) | Centra con la mediana y ordena \|x − mediana\|; la resta binaria deja casi-empates como 0.0049999999999999888 y 0.0050000000000000001 (los dos son 0.005) y R los ordena como distintos: su estadístico depende del ruido del punto flotante. | Referencia = la misma fórmula en R con \|x − mediana\| redondeado a 12 cifras de la escala antes de los rangos; SigmaPro conserva así los empates. Con datos sin casi-empates (conteos, enteros) coincide con `fligner.test` tal cual. |
| No aditividad de Tukey (`agricolae::nonadditivity`) | Calcula p = 1 − pf(F, 1, gl): con p ≈ 7e-13 pierde cifras (error relativo 7.9e-5). | Referencia = `pf(F, 1, gl, lower.tail = FALSE)` con el F de agricolae, que coincide en todo lo demás. |
| Cuantil de t con menos de 1 gl y colas diminutas (`qt`) | `pt(qt(1e-8, 0.5, lower.tail = FALSE), 0.5, lower.tail = FALSE)` da 9.99999986e-9: error relativo 2.9e-8. | Referencia = inversión exacta de `pt` en escala logarítmica (dif. 2.8e-14). |
| Cuantil exacto de la suma de rangos en la mediana (`qwilcox`) | Con m · n impar, P(W ≤ (mn − 1)/2) = ½ exactamente. Con m = n = 49, `choose(98, 49)` de R (exp de lbeta) trae un error relativo de 4e-15, la suma queda 2.3e-15 debajo de ½ —más allá de su margen de 10ε— y `qwilcox(0.5, 49, 49)` da 1201 en vez de 1200. | Referencia = (mn − 1)/2 exacto por simetría, en los 8 pares con m · n impar; la rejilla general se compara contra `qwilcox` tal cual. |
| F de los efectos simples (`emmeans::joint_tests`, `test(joint = TRUE)`) | emmeans redondea a propósito la F a 3 decimales (y los gl a 2) al guardarla, aunque calcula el p con la F exacta. | Referencia = la F exacta que corresponde a su p (`qf(p, gl1, gl2, lower.tail = FALSE)`); el generador comprueba que redondeada a 3 decimales es la de emmeans. |
| Independencia de la covariable en la ANCOVA (`anova(m0, m1)`) | Si la covariable es la misma en cada tratamiento (datos frijol de agricolae), la SC entre tratamientos es cero y por redondeo sale −1e-15; `stat.anova` no acepta una F negativa y da `NA`. | Referencia = F = 0 y p = 1 cuando \|SC\| ≤ 1e-9 · SC del error (el generador lo comprueba); SigmaPro toma como cero toda diferencia negativa entre modelos anidados. |
| p de Nemenyi y de Conover con ajuste de Tukey (PMCMRplus) | El p es 1 − `ptukey()`, una integral numérica (AS 190): por debajo de 1e-6 solo tiene cifras absolutas, en R y en cualquier programa (con p ≈ 3e-11, R y SigmaPro difieren 1.4e-14, un 5e-4 relativo). | Mismo algoritmo; en esas rutas el límite tiene un piso absoluto de 1e-12 (regla `absoluto`, con su motivo en el reporte). Los p mayores siguen con 1e-6. |

Nota: para la t con más de 4 × 10⁵ grados de libertad, R usa una aproximación normal corregida; SigmaPro usa la
beta incompleta exacta. Coinciden a 4.5e-11.

## Datos (Hito 1.2)

Lo que entra a los análisis también se valida: si una celda se lee distinto, todo lo demás sale distinto.

| Qué | Contra qué | Casos |
|---|---|---|
| Lector de CSV (separador y decimal detectados, comillas, saltos de línea dentro de celdas, códigos de faltante) | `read.csv` / `read.csv2` / `read.delim` | 3 |
| Lector propio de .xlsx (cadenas compartidas, fechas, base 1904, errores, filas y columnas vacías) | readxl 1.4.3, con sus cinco libros de ejemplo: 6 610 celdas | 5 |
| Expresiones de las variables calculadas y los filtros (aritmética, `%%` y `round` de R, lógica de tres valores con NA, `ifelse`, agregados, textos) | la misma expresión evaluada en R | 16 |
| Transformaciones (logaritmos, raíces, arcoseno, recíproco, Box-Cox con λ dada, estandarizar) | sus fórmulas en R | 8 |
| Box-Cox: λ̂, intervalo al 95 % y log-verosimilitud perfilada | la verosimilitud perfilada de Box y Cox con los residuales de `lm`, maximizada en R con `optimize` a 1e-12 y el intervalo con `uniroot` (clase D); con venenos × tratamientos de Box y Cox (1964), cerezos de Ryan, Joiner y Ryan (1976) y ozono de Chambers y col. (1983) | 3 |

Para 100 000 filas, Box-Cox no recorre la QR completa en cada λ: en un diseño con solo factores las filas de
X se repiten por celda y la suma de cuadrados residual se descompone exactamente en la variación dentro de
celdas más un ajuste ponderado sobre las celdas. Una prueba unitaria comprueba que las dos rutas dan la misma
suma (a 1e-9 relativo) y los casos contra R pasan por la ruta rápida.

## Explorar (Hito 1.3)

| Qué | Contra qué | Casos |
|---|---|---|
| Cuantiles, nueve definiciones × 19 probabilidades (con n = 1, 2 y 3, faltantes, empates y múltiplos de 1/20 que prueban el margen de 4ε) | `quantile(type = 1:9)`: diferencia 0 en los 1 215 valores | 7 |
| Asimetría y curtosis, tipos 1, 2 y 3 (también alrededor de 10⁹) | `e1071::skewness` y `kurtosis` | 8 |
| Descriptivos completos por grupo (33 estadísticos y percentiles) | base R y e1071 con PlantGrowth, npk (tres factores), airquality (faltantes), InsectSprays (empates), ToothGrowth (dosis numérica), faithful (sin grupos) y factores faltantes | 7 |
| Intervalos de una proporción: Wilson, Wilson con corrección, Clopper-Pearson, Agresti-Coull, Jeffreys y Wald en 93 combinaciones de x, n y nivel | `prop.test`, `binom.test` y sus fórmulas | 6 |
| Frecuencias de una y dos vías, con y sin la categoría de faltantes | `table`, `prop.table` | 7 |
| Proporciones por categoría o por éxitos sobre ensayos, con grupos | lo mismo por grupo | 4 |
| Bondad de ajuste ji cuadrada (Mendel 9:3:3:1 y 3:1, proporciones iguales, esperados menores que 5) | `chisq.test(p = , rescale.p = TRUE)` | 4 |
| Cuantil de la binomial (lo usa el intervalo de la mediana) | `qbinom` (y un caso de clase B) | 3 |

Además, `tests/codigo-r.mjs` toma el **código R equivalente** que la app muestra en cada resumen, lo ejecuta
con Rscript sobre los ejemplos y compara sus números con los de la app (1e-6): 8 escenarios, 209 valores.
Así el código que alguien copia para su tesis o para la revisión por pares da exactamente lo mismo.

## Supuestos (Hito 1.4)

| Qué | Contra qué | Casos |
|---|---|---|
| Shapiro-Wilk en todas las ramas de AS R94 (n = 3, 4–5, 6–11, ≥ 12, p «obvio», rango diminuto, n = 5000) | `shapiro.test` | 13 |
| Lilliefors (incluida la corrección para n > 100) y Anderson-Darling (incluido un atípico con z ≈ −60) | `nortest::lillie.test`, `ad.test` | 15 |
| Kolmogorov-Smirnov contra una normal dada: exacta bilateral y de una cola, asintótica | `ks.test` | 7 |
| Levene, Brown-Forsythe, Bartlett y Fligner-Killeen | `car::leveneTest`, `bartlett.test`, `fligner.test` | 16 |
| No aditividad de Tukey (aditivo, multiplicativo, el maíz del ejemplo, celdas con repeticiones) | `agricolae::nonadditivity` | 4 |
| Durbin-Watson: p exacto (AS 153) con n < 100 y aproximación normal con n ≥ 100, tres alternativas | `lmtest::dwtest` | 8 |
| Rachas arriba y abajo de la mediana, exacta y normal | `randtests::runs.test` | 6 |
| Palancas, residuos estandarizados y estudentizados, Cook, y el mayor residuo con Bonferroni | `hatvalues`, `rstandard`, `rstudent`, `cooks.distance`, `car::outlierTest` | 8 |
| Grubbs y cercas de Tukey | `outliers::grubbs.test`, `boxplot.stats` | 9 |
| Banda del gráfico Q-Q por estadísticos de orden | `qnorm(ppoints(n))`, `qbeta` | 10 |
| El método completo: modelo, pruebas de los residuos, semáforo y Box-Cox (siete experimentos) | todo lo anterior en R, con las mismas reglas del semáforo | 7 |

Las pruebas que dependen de empates exactos entre residuos (Fligner, rachas, cercas) usan los residuos redondeados a
12 cifras de su escala: R y SigmaPro calculan los residuos con un ruido de ~1e-15 distinto, y sin ese redondeo un
empate de los datos se rompería al azar de un modo distinto en cada programa. Una prueba unitaria comprueba que el
ajuste por celdas (tablas grandes) da los mismos residuos, palancas y Durbin-Watson que la QR completa (1e-10).

Dos convenciones de R que la app sigue a propósito: los números se muestran y se copian con 15 cifras
significativas, como `as.character()` (0.1 + 0.2 se ve «0.3»), y los niveles sin observaciones (por un filtro
o por la edición) se quitan antes del análisis, como `droplevels()`.

## Pruebas t y no paramétricas (Hito 1.5)

| Qué | Contra qué | Casos |
|---|---|---|
| Rango con signo y suma de rangos de Wilcoxon: probabilidades exactas (ambas colas, error relativo), cuantiles y cuantiles justo en los saltos, con n y m hasta 70 | `psignrank`, `qsignrank`, `pwilcox`, `qwilcox` (y un caso de clase B) | 11 |
| t no central: rejilla de 1 188 puntos con t negativo, ncp > 40 y gl > 4 × 10⁵ (todas las ramas de AS 243) | `pt(q, gl, ncp)` | 4 |
| t de una muestra, de dos (Student y Welch, con cola, μ ≠ 0, desbalance, faltantes) y pareada | `t.test` | 17 |
| F de razón de varianzas, bilateral y de una cola, con razón ≠ 1 | `var.test` | 3 |
| d de Cohen y g de Hedges con su IC por la t no central (una muestra, pareada, dos muestras, efecto nulo y enorme) | las fórmulas, con el IC por `uniroot` a 1e-13 sobre `pt(t, gl, ncp)` | 6 |
| Wilcoxon de una muestra y pareada: exacta, normal con y sin corrección, empates, ceros, n ≥ 50, exacta pedida con empates, IC inalcanzable | `wilcox.test(conf.int = TRUE)`: estadístico, p, IC de Hodges-Lehmann, estimador y nivel logrado | 13 |
| Suma de rangos (Mann-Whitney) en los mismos escenarios, con desplazamiento μ | `wilcox.test(x, y, conf.int = TRUE)` | 9 |
| Kruskal-Wallis con η² de H (empates, faltantes, 6 grupos desbalanceados) | `kruskal.test` | 4 |
| Dunn, Conover-Iman y Nemenyi con Holm, Bonferroni, BH y Tukey | `PMCMRplus::kwAllPairsDunnTest`, `kwAllPairsConoverTest`, `kwAllPairsNemenyiTest` | 11 |
| Friedman y W de Kendall (con empates y un bloque incompleto) | `friedman.test` | 3 |
| Conover, Nemenyi y Wilcoxon pareada tras Friedman | `PMCMRplus::frdAllPairsConoverTest`, `frdAllPairsNemenyiTest`, `pairwise.wilcox.test(paired = TRUE)` | 9 |
| Ajuste de valores p (con empates y un faltante) | `p.adjust` | 3 |
| Letras de agrupación (sin diferencias, todas, escalera, al azar con hasta 13 tratamientos y 60 tratamientos con más de 52 letras) | `multcompView::multcompLetters` | 9 |
| Los métodos completos: prueba t, Wilcoxon, Kruskal-Wallis y Friedman con letras | todo lo anterior | 13 |

El intervalo de Hodges-Lehmann por la aproximación normal es la raíz de una función escalonada que R busca con
`uniroot(tol = 1e-4)`: SigmaPro traduce paso a paso el mismo algoritmo (`R_zeroin2` de `zeroin.c`), así que llega
al mismo punto y no solo a un punto parecido. Las distribuciones exactas se calculan con los mismos conteos que
`signrank.c` y `wilcox.c` (incluido el margen de 10ε de los cuantiles).

Tres notas sobre los paquetes de referencia:

- **dunn.test** (y FSA, que lo usa) reporta con Holm y con BH valores p ajustados que no son monótonos (no aplica
  el máximo o el mínimo acumulado); sus decisiones coinciden con las de Holm y BH, pero sus p no. SigmaPro sigue
  `p.adjust`, como PMCMRplus, que es la referencia.
- **PMCMRplus** falla con un bloque incompleto en las pruebas tras Friedman (`frdRanks` no reajusta los nombres de
  los bloques). La referencia le pasa solo los bloques completos, que es lo mismo que hace `friedman.test`, y el
  código R que muestra la app hace ese filtro antes.
- **t no central:** R acumula la serie de `pnt.c` en doble extendido y SigmaPro en doble. Por encima de 1e-6 las
  probabilidades coinciden en error relativo (hasta 2e-7); más abajo, en la cola inferior con t muy por debajo de
  ncp, ninguna de las dos conserva cifras relativas (el residuo de la serie es de ±1e-12) y se comparan en
  absoluto, como toda probabilidad. Esas colas no intervienen en ningún intervalo de la app.

`tests/codigo-r.mjs` corre también el código R de los cuatro métodos nuevos (9 escenarios más): el tamaño del
efecto se escribe con la t no central en R base, sin paquetes, para que dé exactamente lo mismo que la app.

## Diseños experimentales (Hito 1.6)

| Qué | Contra qué | Casos |
|---|---|---|
| Estratos de error: parcelas divididas en bloques (avena de Yates, también sin tres subparcelas), al azar y en cuadro latino; subdivididas; franjas | `summary(aov(… + Error(…)))` | 7 |
| Medias marginales estimadas con EE (por factor, por celdas, dentro de otro factor, con covariable en su media, con celdas vacías y con la interacción confundida con los bloques: no estimables) | `emmeans` | 8 |
| Efectos simples: un factor dentro de cada nivel de otro, dos factores «por», tres factores y una celda vacía (pierde un grado de libertad) | `emmeans::joint_tests` (clase B por el redondeo de F) | 7 |
| Completamente al azar: un factor balanceado y desbalanceado, factorial 2 × 3 con tipos I, II y III, factorial de tres factores, celda vacía (el tipo III no existe y se usa el II) | `anova`, `car::Anova(type = 2 y 3)`, CV, R², `emmeans`, `joint_tests` | 8 |
| Bloques completos al azar: simple con eficiencia relativa, con parcelas perdidas, generalizado, factorial con dosis numérica, factorial 2³ con N:P:K confundida | lo mismo, y la eficiencia relativa de Gomez y Gomez (1984) | 5 |
| Cuadro latino 8 × 8 (sin ajuste por gl) y 5 × 5 (con ajuste) | lo mismo, con la eficiencia frente a completamente al azar y a bloques por filas y por columnas | 2 |
| Bloques incompletos balanceados (t = 7, k = 3, λ = 1) | `anova` intrabloque, `emmeans`, y `agricolae::BIB.test` (medias ajustadas, su EE, CV y factor de eficiencia coinciden) | 1 |
| Látice simple 3 × 3 y alfa-látice (12 tratamientos, bloques de 3) | `anova` de `y ~ rep/bloque + trat` y `emmeans` | 2 |
| Parcelas divididas, subdivididas y franjas como métodos completos, con CV de cada error | `aov` con estratos y `agricolae::sp.plot`, `ssp.plot`, `strip.plot` (sus errores coinciden) | 5 |

Notas sobre las referencias:

- **Estratos de error.** SigmaPro sigue el mismo procedimiento público que `aov` con `Error()`: Qᵀ de la QR del
  modelo de error reparte las filas en estratos y en cada uno se ajustan las columnas que no se anulan (umbral absoluto
  de 1e-5, el de R). Coincide hasta con datos desbalanceados (a 3e-14), donde la app además avisa que las pruebas por
  estratos ya no son exactas y que corresponde un modelo mixto (Fase 2).
- **Bloques en parcelas divididas.** `agricolae::sp.plot` y `ssp.plot` prueban los bloques contra el error del último
  estrato, y `strip.plot` les copia la F de la interacción; SigmaPro sigue la estructura de estratos de `aov`, donde los
  bloques no tienen error propio y no se prueban. Los errores a, b y c y sus CV coinciden con los de agricolae.
- **Términos confundidos.** `car::Anova` lista con 0 gl un término confundido (N:P:K con los bloques en npk); SigmaPro
  no lo lista y lo explica en un aviso. La referencia quita esas filas de 0 gl.
- **Anidamiento.** emmeans detecta los factores anidados (bloques con etiquetas únicas dentro de repeticiones, o un
  factor que solo entra en interacciones como en `rep/bloque`) y promedia solo sobre las combinaciones que existen;
  SigmaPro replica esa detección (el alfa-látice lo prueba: sin ella, las medias saldrían no estimables).
- **Tablas grandes.** Con 2 000 filas o más y pocas celdas (submuestras, repeticiones), el modelo lineal y los
  estratos se ajustan por celdas ponderadas por √n: las mismas ecuaciones normales y la misma geometría, así que
  las mismas sumas de cuadrados. Una prueba unitaria compara las dos rutas (tipos I, II y III y estratos) a 1e-9.

`tests/codigo-r.mjs` corre también el código R de cinco diseños (24 escenarios en total).

## Comparaciones de medias y contrastes (Hito 1.7)

| Qué | Contra qué | Casos |
|---|---|---|
| Pares con DMS, Tukey(-Kramer), Scheffé, Bonferroni, Šidák y Holm: un factor balanceado y desbalanceado, factorial en bloques (también dentro de cada nivel del otro factor), factorial desbalanceado (dentro y combinaciones), bloques con parcelas perdidas, BIB (medias ajustadas correlacionadas), y letras | `pairs(emmeans(…), adjust = …)` y `multcompView::multcompLetters` | 10 |
| Lo mismo con estratos: avena (variedades, nitrógeno, cada uno dentro del otro), subdivididas y franjas, con los gl de Satterthwaite | `emmeans` con el modelo `aov(… + Error(…))` | 5 |
| Duncan y Student-Newman-Keuls (balanceado, desbalanceado con la media armónica, medias de un factorial) | las fórmulas de `agricolae::duncan.test` y `SNK.test` sin redondear (sus p redondeados coinciden) | 6 |
| Dunnett bilateral y de una cola, n iguales y distintos, en bloques y dentro de otro factor | la integral doble de la t multivariada con `integrate` (rel.tol 1e-12); `emmeans(adjust = "mvt")` como comprobación (clase C) | 6 |
| Games-Howell | `PMCMRplus::gamesHowellTest` | 2 |
| Contrastes definidos por el usuario (ortogonales y no, en bloques y en parcelas divididas) con su SC | `emmeans::contrast(method = list(…))` y la partición de `summary.aov(split = …)` | 3 |
| Polinomios ortogonales con dosis igual y desigualmente espaciadas, dentro de otro factor y en parcelas divididas; curva ajustada a las medias y dosis óptima | `contr.poly(k, scores = dosis)`, `emmeans::contrast`, `summary.aov(split)` y `lm(medias ~ poly(dosis, 2, raw = TRUE))` | 4 |
| Medias marginales con intervalo de confianza (90, 95 y 99 %, BIB, celdas con parcelas perdidas) | `confint(emmeans(…))` | 4 |
| Los métodos completos (Tukey, DMS dentro de otro factor, Tukey en parcelas divididas, Bonferroni, DMS protegida, Dunnett, contrastes, polinomios y medias) | todo lo anterior | 9 |

Notas sobre las referencias:

- **Šidák** (clase B): emmeans calcula 1 − (1 − p)^m, que pierde cifras con p diminutos; SigmaPro usa
  −expm1(m·log1p(−p)). La referencia es esa forma exacta con los p sin ajustar de emmeans (coinciden en absoluto).
- **Tukey con un solo par:** emmeans no ajusta cuando la familia tiene una comparación (es la t); SigmaPro hace lo
  mismo, porque la integral del rango estudentizado con pocos gl tiene un error de hasta 2e-5 (con 2.2 gl de
  Satterthwaite, por ejemplo) y el resultado exacto es la t.
- **p de Tukey, Duncan, SNK y Games-Howell diminutos:** son 1 − ptukey(); se comparan con el piso absoluto de 1e-12.
- **Duncan y SNK:** agricolae redondea sus p a 4 decimales antes de asignar letras y usa un algoritmo secuencial
  propio para las letras; SigmaPro compara los p exactos con las mismas fórmulas y asigna las letras por inserción y
  absorción (multcompView), con la «a» para la media más alta.
- **Dunnett exacto** (clase C): emmeans y multcomp integran la t multivariada con el método aleatorio de Genz (error
  ~1e-4). SigmaPro la integra de forma determinista cuando las correlaciones son de forma producto λᵢλⱼ (un factor,
  bloques completos, medias independientes), con cuadratura adaptativa de Gauss-Kronrod; reproduce además el cuadro
  publicado de Dunnett (1955) y, si la correlación no es de forma producto, lo explica y sugiere Bonferroni u Holm.
- **Parcelas divididas:** las diferencias toman cada coeficiente del estrato donde se estima, con su error, y los gl
  de Satterthwaite, como emmeans con el modelo de estratos. El código R que muestra la app pone los bloques solo en
  `Error()`, como los necesita emmeans.

`tests/codigo-r.mjs` corre también el código R de las comparaciones (29 escenarios en total): Tukey con sus letras,
Tukey en parcelas divididas, contrastes, polinomios y medias ajustadas.

## ANCOVA y regresión (Hito 1.8)

| Qué | Contra qué | Casos |
|---|---|---|
| ANCOVA en completamente al azar (desbalanceado, SC tipo I, II y III) y en bloques (factorial 3 × 4, dos covariables, parcelas sin dato): ANOVA, pendientes comunes con IC, homogeneidad de pendientes, independencia de la covariable, medias ajustadas con IC, comparaciones (Tukey, DMS, Bonferroni, Holm, Scheffé, Šidák) con letras y eficiencia relativa | `lm`, `anova`, `car::Anova`, `anova(m0, m1)`, `emmeans`, `pairs`, `multcompLetters` y la fórmula de Cochran y Cox | 9 |
| Regresión simple, múltiple (con faltantes y con la colinealidad de Longley) y polinomial de grado 2 y 3: coeficientes con IC, β estandarizados, ANOVA de la regresión, falta de ajuste con repeticiones, SC secuenciales y parciales, R², R² ajustada, σ, CV, log-verosimilitud, AIC, BIC, predicciones con IC y de predicción, y el máximo o mínimo de la curva | `lm`, `summary`, `confint`, `anova`, `car::Anova(type = 2)`, `AIC`, `BIC`, `predict`, `polyroot` | 10 |
| Palancas, residuos estandarizados y estudentizados, Cook, DFFITS, DFBETAS, COVRATIO, σ₍ᵢ₎ y los criterios de influencia | `influence.measures`, `rstandard`, `rstudent`, `influence` | 6 |
| Shapiro-Wilk de los residuos, Breusch-Pagan estudentizada, RESET y Durbin-Watson (exacto y por la normal con 111 datos) | `shapiro.test`, `lmtest::bptest`, `resettest`, `dwtest` | 7 |
| VIF e índices de condición con sus proporciones de varianza | `car::vif` y `svd` de la matriz escalada | 4 |
| Paso a paso por AIC (ambas direcciones, atrás y adelante, con 5 y 10 candidatos) y por valor p (adelante, atrás y mixta) | `step`, `extractAIC`, y `add1`/`drop1(test = "F")` en el mismo procedimiento | 10 |
| Mejores subconjuntos (1, 2 y 3 mejores por tamaño) | `leaps::regsubsets` exhaustivo y su `summary` | 4 |
| Los métodos completos (regresión con diagnóstico, polinomial con óptimo, paso a paso, subconjuntos y ANCOVA) | todo lo anterior | 5 |

Son 54 casos y 7 689 valores; la mayor diferencia escalada es 1.4e-11, también con los datos de Longley (1967),
el conjunto clásico para probar la exactitud de los programas de regresión.

Notas sobre las referencias:

- **Selección por valor p:** R no trae una función; la referencia es el mismo procedimiento escrito en R con las F
  parciales de `add1` y `drop1(test = "F")` (entra la de menor p si p < entrada; sale la de mayor p si p > salida;
  en la mixta, después de cada entrada se revisan las salidas). Es el código R que muestra la app.
- **Índices de condición:** la SVD se calcula por Jacobi sobre la R de la QR (exactitud relativa en los valores
  pequeños); los vectores singulares solo entran al cuadrado, así que su signo no importa.
- **Muchas filas:** con 2000 filas o más, los modelos con factores y covariables se ajustan comprimiendo cada celda
  a q + 1 filas por su QR (mismas XᵀX y Xᵀy); una prueba unitaria compara coeficientes, SC tipo I, II y III y medias
  ajustadas contra el ajuste completo (dif. < 1e-9).

`tests/codigo-r.mjs` corre el código R de la regresión, la polinomial, la selección (AIC y valor p), los
subconjuntos y la ANCOVA (37 escenarios en total).

## Correlación y tablas de contingencia (Hito 1.9)

| Qué | Contra qué | Casos |
|---|---|---|
| Pearson (con IC al 90 y 95 %), Spearman y Kendall con las tres hipótesis alternativas: exactas sin empates (Spearman con n ≤ 9 por enumeración y hasta 1290 por la serie de Edgeworth de AS 89; Kendall con n < 50), aproximadas con empates, con corrección por continuidad, con faltantes y con 3000 datos | `cor.test` | 46 |
| Matrices de correlación (Pearson, Spearman, Kendall) con Holm, Bonferroni, Benjamini-Hochberg o sin ajuste; filas completas o por pares | `cor.test` por par y `p.adjust` | 5 |
| Correlación parcial y las dos semiparciales con su t (Pearson y Spearman; con faltantes) | residuos de `lm`; `psych::partial.r` como comprobación | 4 |
| Ji cuadrada (con y sin Yates), G², esperados, residuos de Pearson y ajustados; Fisher exacta 2 × 2 (bilateral y de una cola, con la razón de momios condicional y su IC exacto) y r × c (2 × 3, 3 × 3, 3 × 3 con una fila vacía y la 4 × 4 de Agresti) | `chisq.test`, `fisher.test` | 11 |
| φ, V de Cramér, coeficiente de contingencia, λ, coeficiente de incertidumbre, γ, τ-b, τ-c y d de Somers con sus EE, z e IC; razón de momios y riesgo relativo (también con una celda en cero) | fórmulas de Agresti (2002) en R base; τ-b cotejada con `cor(method = "kendall")` | 5 |
| McNemar (con y sin corrección) con la binomial exacta, y simetría de Bowker | `mcnemar.test`, `binom.test` | 4 |
| Cochran-Mantel-Haenszel 2 × 2 × K (con y sin corrección, estratos con ceros) e I × J × K, razón de momios común con IC, Breslow-Day con y sin Tarone y la razón de cada estrato | `mantelhaen.test` y la fórmula de Breslow y Day (1980) | 4 |
| Kappa de Cohen simple y ponderada (lineal y cuadrática) con EE, IC y z | `psych::cohen.kappa`; la z con la varianza nula de Fleiss, Cohen y Everitt (1969) | 4 |
| Los métodos completos (correlación con los tres coeficientes, matriz, parcial, tabla de contingencia, McNemar, Mantel-Haenszel y kappa) | todo lo anterior | 7 |

Son 90 casos y 1 754 valores; la mayor diferencia escalada es 8.6e-13.

Notas sobre las referencias:

- **Distribuciones exactas:** Kendall con los conteos de inversiones de `ckendall` y Spearman con el algoritmo AS 89 de
  `prho.c` (enumeración con n ≤ 9 y serie de Edgeworth hasta 1290), igual que R; las colas se calculan como R, incluso
  donde R resta de 1.
- **Fisher r × c:** R usa el algoritmo de red de FEXACT; SigmaPro recorre las tablas columna por columna juntando las
  ramas que llegan a los mismos totales restantes, poda con cotas y suma de golpe las ramas enteras debajo del corte, y
  resuelve las dos últimas columnas con la lista ordenada de terminaciones. El corte es P ≤ P(observada)·(1 + 1e-7),
  como en 2 × 2. La 4 × 4 de Agresti (n = 104) tarda 0.4 s; si una tabla tardaría más de 4 s, se avisa y se usa la ji
  cuadrada.
- **Bowker con un par de categorías sin cambios:** R da NaN (0/0); SigmaPro deja fuera ese par y baja los gl, y lo
  avisa. Los casos contra R usan tablas sin pares vacíos.
- **Breslow-Day:** R base no lo trae; la referencia es la fórmula publicada, con el esperado de cada estrato por
  `uniroot` (tolerancia 1e-13). Los estratos con un margen en cero no informan y no entran (ni a los gl).
- **Medidas ordinales y nominales:** las fórmulas de Agresti (2002) y Brown y Benedetti (1977) se programaron en R
  base de forma independiente (las mismas que usa el paquete DescTools); τ-b se coteja además con `cor(method = "kendall")`.
- **Arnés:** un argumento `{ columna: 'x' }` es una referencia a la columna x de los datos solo si no trae otras
  claves; así, las entradas de las tablas de contingencia (`{ fila, columna, frecuencia }`) pasan tal cual.

`tests/codigo-r.mjs` corre también el código R de la correlación, la matriz, la parcial, la tabla de contingencia,
Mantel-Haenszel y kappa (44 escenarios en total).

## Modelo lineal general, asistente y constructor (Hito 1.10)

| Qué | Contra qué | Casos |
|---|---|---|
| Factorial 2 × 3 balanceado y desbalanceado con SC tipo I (en el orden escrito), II y III; sin intercepto con R² sin centrar | `lm`, `anova`, `car::Anova` con `contr.sum` para el tipo III | 4 |
| Un factor con su propia pendiente de una covariable (tipo II y III), numérica tomada como factor, `(a + b + c)^2` y faltantes | lo mismo y `emmeans` | 5 |
| Factor anidado (`a / b` y `a + a:b`), tipo I y III | lo mismo | 2 |
| Producto de dos covariables más una tercera (tipo I y II) | lo mismo | 2 |
| El método completo: ANOVA, coeficientes, resumen, total y medias marginales con IC | todo lo anterior | 1 |

Son 14 casos y 976 valores; la mayor diferencia escalada es 2.5e-13. En cada caso se comparan los gl, SC, F y p del
ANOVA, los coeficientes de `summary(lm)` con sus EE, t y p, σ, R² y R² ajustada, y las medias marginales de `emmeans`
con su EE (en el método, también el IC).

El asistente y el constructor no calculan: eligen el método y sus papeles. El árbol de decisión está escrito al
principio de `js/nucleo/asistente.js` y se prueba con 11 pruebas unitarias
(`tests/unidad/asistente.test.js`) que recorren todas sus ramas: cada recomendación nombra un método que existe
y lo arma con las columnas correctas; el constructor lleva cada combinación de papeles a su diseño y su fórmula, y la
lectura de fórmulas explica cada término o da el error con su arreglo. Una de ellas comprueba además que el modelo
lineal general da el mismo ANOVA que el modelo de bloques al azar.

`tests/codigo-r.mjs` corre el código R del modelo lineal general con SC tipo III y una numérica como factor, con tipo
II y una covariable que interactúa, y sin intercepto (47 escenarios en total).

## Reporte, figuras y exportaciones (Hito 1.11)

Las exportaciones no calculan: llevan a un archivo los números que ya se validaron contra R. Lo que se valida es que
lleguen **completos e intactos** y que el archivo esté **bien hecho**, leyéndolo con lectores que no son de SigmaPro.
`tests/exportar.mjs` abre la app por file:// en un navegador sin ventana, arma un reporte con cinco análisis del
ejemplo del maíz (bloques al azar, Tukey, polinomios, regresión polinomial y descriptivos), exporta todo y revisa:

| Qué | Con qué lector | Resultado |
|---|---|---|
| Hoja de cálculo (.xlsx) | readxl | cada celda idéntica a la de la app (246 números con todas sus cifras y 105 textos) |
| Los mismos números, contra R | car::Anova (tipo III) y emmeans, calculados desde los datos | gl, SC, F y p del ANOVA y medias y EE de Tukey iguales (24 valores, ≤ 1e-9) |
| Reporte .docx | xml2 y png | las 9 partes son XML válido; el texto de los 16 cuadros es exacto; 7 figuras a 300 ppp del ancho pedido; campos SEQ; frases clave («F(2, 33) = 60.63», las citas) |
| Página HTML | xml2 | los 16 cuadros y las 7 figuras vectoriales |
| Figuras | pdftools, png y el lector de imágenes del sistema | cada PDF de una página del tamaño pedido, con su texto en Helvetica y sin caracteres perdidos; cada PNG a 600 ppp; cada TIFF a 600 ppp, del tamaño del PNG e igual a él en todos los píxeles muestreados (44 733) |
| Proyecto .labg | openssl y R | las 7 huellas SHA-256 del manifiesto; datos.csv idéntico a los datos originales; el código R del proyecto corre de principio a fin |
| Reabrir el proyecto | la app, en una página nueva | los mismos análisis dan exactamente los mismos cuadros |
| LaTeX | revisión estructural (no hay compilador instalado) | un entorno table por cuadro, las tres reglas de booktabs y llaves balanceadas |

Las pruebas unitarias (`tests/unidad/exportar.test.js`) cubren además la huella SHA-256 (los vectores de FIPS 180-4 y
300 mensajes al azar contra crypto de node), el ZIP comprimido, la hoja de cálculo leída con el lector propio, el
escapado de LaTeX, el bloque de resolución del PNG con su CRC, el TIFF decodificado píxel por píxel, los párrafos de 14
métodos (sin huecos, con su estadística y con cada cita en la lista de referencias), la numeración del documento y el
proyecto con un archivo alterado (la huella lo detecta).

La validación atrapó un subíndice («hᵢᵢ») que el PDF escribía como «h??»: ahora los subíndices y superíndices de letras
se escriben con su letra normal, que sí está en las fuentes estándar.

Los párrafos para la tesis no se comparan con R: describen la prueba y sus números (los mismos de los cuadros) con la
cita de cada método. Las referencias son las publicaciones originales de cada prueba.

## Rendimiento, privacidad, sin conexión y accesibilidad (Hito 1.12)

Cuatro pruebas más, que no comparan números con R sino cómo se comporta la app. Cada una escribe su resultado en
`js/generado/comprobaciones.js` y la app lo muestra en el bloque 8, en «Otras comprobaciones».

**Rendimiento con 100 000 filas** (`tests/rendimiento/medir.mjs`). Un ensayo sintético con semilla fija (99 941 filas:
5 tratamientos, 10 bloques, tres factores desbalanceados, una dosis, una covariable, diez variables correlacionadas y
categorías para contingencia) se mide en el navegador, por file://, como lo usa la app: la primera vez y la mediana de
tres más. 43 operaciones con su meta: leer un CSV de 9.4 MB, cada familia de análisis (calcular y armar el reporte), el
bloque Análisis pintado, el reporte de cinco análisis, sus figuras, el .docx, el proyecto .labg y su apertura. Las
metas del plan (propuesta §5.4) se cumplen con holgura: descriptivos de 10 variables en 105 ms (meta 150 ms), ANOVA de
una vía con Tukey en 82 ms (meta 250 ms) y el factorial 4 × 3 × 2 desbalanceado con SC tipo III en 142 ms (meta 1.5 s).
El plan pedía además un hilo de trabajo con más de 20 000 filas; medido, el hilo resultó más lento (arranca sin el
código optimizado), así que el cálculo sigue en la página con un aviso mientras dura (ver `docs/PENDIENTES.md`). Las
optimizaciones de este hito no cambiaron ningún número: los 624 casos contra R siguen aprobados con la misma diferencia
máxima.

**Privacidad y sin conexión** (`tests/sin-conexion.mjs`). Con el ejemplo del maíz se usan seis análisis de familias
distintas, el asistente, el constructor, el reporte y seis exportaciones mientras se registra cada petición de red:

| Cómo se abre | Qué se comprueba | Resultado |
|---|---|---|
| Doble clic (file://) | ninguna petición sale del equipo | ninguna, salvo el código del motor R (ver abajo) |
| Servida por http | todas las peticiones son GET, sin parámetros ni cuerpo, a archivos de la propia app | 73 peticiones, todas así |
| Servida por http | el servicio sin conexión (`sw.js`) queda activo y guarda la app | activo, 75 archivos |
| Sin red y con el servidor apagado | la app abre, carga datos, calcula, arma el reporte, exporta y verifica las huellas del proyecto | igual que con red |

La única excepción, declarada: los métodos del motor R (Fase 2) descargan webR y sus paquetes (código, con GET y sin
datos). Las letras ya no son excepción: desde el navegador 1.1.2 y el estudio de figuras 1.5.1 los módulos comunes
usan las del sistema, y una petición de letras al portal hace fallar la prueba.

**Accesibilidad AA** (`tests/accesibilidad/auditar.mjs`). 46 escenarios (cada bloque vacío y con datos, análisis de
todas las familias, el asistente, el constructor, diálogos, el reporte, las figuras y la exportación) pasan por el
auditor de la suite a 1280 y 360 px: 92 revisiones con 19 370 textos medidos en claro y en oscuro, todos con el
contraste AA; ningún botón ni enlace sin nombre, ningún campo sin etiqueta, ningún id repetido, sin desborde lateral;
Alt+→ y Alt+← cambian de bloque y «?» abre los atajos. El foco se revisa aparte con el teclado de verdad (eventos de
teclado del navegador): 294 paradas de Tab en los 8 bloques a 1280 px en claro y 275 a 360 px en oscuro, todas con su
anillo visible.

## Motor R en el navegador (Fase 2, Hito 2.0)

Los métodos de la Fase 2 que necesitan paquetes de R (modelos mixtos con lme4 y lmerTest) corren en R dentro del
navegador (webR 0.6.0, R 4.6.0). Ahí no se reimplementa el algoritmo: lo que se valida es que **el puente** lleve los
datos y las opciones a R tal cual (numéricas con sus faltantes, factores con sus niveles en orden, nombres con
espacios) y traiga los resultados completos y con todas sus cifras, y que el modelo sea el mismo que el del R de
escritorio con el que se calcula la referencia.

- **Casos**: el mismo formato de siempre (`tests/casos/modelo-mixto/`, clase D), con la referencia del R de
  escritorio 4.4.2 (lme4 1.1-35.5, lmerTest 3.2-1, pbkrtest 0.5.3).
- **Dónde corren**: `node tests/motor-r.mjs` abre la app por file:// en un navegador sin ventana, carga el motor
  (necesita internet: lo descarga) y corre cada caso con `SPT.ejecutarCasoAsync`, con el mismo criterio de comparación.
  Guarda el resultado de cada caso en `tests/generado/motor-r.json` con las versiones de webR, R y los paquetes.
- **Cómo entran al reporte**: `tests/correr.mjs` toma ese resultado solo si la huella coincide: SHA-256 del archivo
  del caso, del puente (`js/nucleo/motor-r.js`), del registro y del archivo que define el método
  (`tests/lib/huella-motor-r.mjs`). Si alguno cambió después de la corrida, el caso queda **sin aprobar** y el método
  no aparece en la app hasta volver a correrlo.
- **Resultado** (Hito 2.2): 28 casos de 6 métodos, 15 992 valores, diferencia escalada máxima 1.4 × 10⁻⁷ (medidas
  repetidas: nlme 3.1-169 en el motor y 3.1-166 en el escritorio). Hasta el Hito 2.1: 22 casos, diferencia máxima 4.7 × 10⁻⁹, a pesar de que
  el motor trae lme4 2.0-1 y emmeans 2.0.3 y el escritorio lme4 1.1-35.5 y emmeans 1.10.6. La referencia común está en
  `tests/r/mixto.R`: ANOVA, coeficientes, componentes de varianza, ajuste, medias marginales y sus pares (emmeans),
  ranova y BLUP. Los p de Tukey se comparan con un piso absoluto de 1e-12 (son 1 − ptukey, una integral numérica: con 28
  genotipos hay p de 10⁻¹² que difieren en la cuarta cifra entre R 4.6 en WebAssembly y R 4.4.2 de escritorio). Las
  letras se calculan en el núcleo JS (ya validado en la Fase 1) a partir de esos p.

| Caso | Qué cubre |
|---|---|
| sleepstudy (Belenky et al. 2003) | intercepto y pendiente aleatorios correlacionados `(Days \| Subject)` y sin correlación `(Days \|\| Subject)`; cuatro respuestas faltantes |
| Penicillin (Davies y Goldsmith 1972) | dos aleatorios cruzados y solo el intercepto fijo (ANOVA vacía) |
| Oats (Yates 1935) | parcelas divididas `(1 \| bloque/variedad)` con Satterthwaite y con Kenward-Roger; nitrógeno como covariable por máxima verosimilitud |
| Machines (Milliken y Johnson 1992) | operario aleatorio y su interacción con la máquina; desbalanceado (gl no enteros) con SC tipo III y tipo I; el operario como columna numérica |
| Maíz de los ejemplos | factorial con bloques aleatorios: balanceado, da las mismas F que el ANOVA de bloques del núcleo JS; con tres parcelas perdidas y Kenward-Roger |
| npk (Yates 1935) | factorial 2 × 2 × 2 en bloques aleatorios con N × P × K confundida con los bloques: se estima con la información entre bloques |
| plots (agricolae) | parcelas divididas sin bloques: la repetición identifica cada parcela grande |
| data_alpha (Olivoto y Lúcio 2020) | alfa-látice de 24 genotipos, con repeticiones fijas y aleatorias |
| Orthodont (Potthoff y Roy 1964), BodyWeight (Crowder y Hand 1990), sleepstudy y el maíz de los ejemplos | medidas repetidas: siete estructuras de covarianza con elección por AIC y BIC, la no estructurada pedida, fechas desiguales (AR(1) continua), faltantes, bloques, sin tratamientos (`tests/r/repetidas.R`) |
| Dyestuff, Dyestuff2, Penicillin y Pastes (Davies y Goldsmith 1972; Box y Tiao 1973), Rail y ergoStool (Pinheiro y Bates 2000), data_alpha, data_ge y data_ge2 (Olivoto y Lúcio 2020) | componentes de varianza cruzados, anidados y con interacción, frontera, desbalance; heredabilidad en completamente al azar, bloques, alfa-látice y varios ambientes; repetibilidad con y sin efectos fijos (`tests/r/geneticos.R`) |
| data_ge y data_ge2 (Olivoto y Lúcio 2020, metan), plrv (agricolae) | ensayos multiambiente: análisis conjunto, Bartlett, Eberhart-Russell, Wricke, Shukla, Lin-Binns, AMMI con Gollob y F_R, GGE; parcelas perdidas y una media por celda (`tests/r/multiambiente.R`) |
| Centrales compuestos, Box-Behnken y factoriales con centros (sintéticos) | superficies de respuesta: segundo orden, interacciones y primer orden, bloques, sin error puro, silla, máximo y mínimo, dos a cuatro factores (`tests/r/superficie.R`) |
| Orange, ChickWeight, DNase y Loblolly (R), herbicidas, tóxico y nitrógeno (sintéticos) | regresión no lineal: ocho modelos, una curva y varias por grupo, comparación de curvas, dosis cero, meseta por perfil (`tests/r/nolineal.R`) |
| cbpp (Lesnoff et al. 2004), grouseticks (Elston et al. 2001) y el aguacate de los ejemplos | modelos lineales generalizados mixtos: binomial con ensayos, Poisson con dos agrupamientos y exposición, binomial negativa, efecto por observación, ajuste singular, Wald tipo II y III (`tests/r/glmm.R`) |
| InsectSprays (Beall 1942), warpbreaks, snails, quine, Insurance y birthwt (MASS), escarabajos de Bliss (1935), coagulación (McCullagh y Nelder 1989) | modelos lineales generalizados: seis familias, cinco enlaces, exposición, familia automática, tipos I a III, medias y pares en la escala de la respuesta (`tests/r/glm.R`) |
| data_ge (Olivoto y Lúcio 2020) y plrv (CIP, agricolae) | ensayos en varias localidades: localidad, repetición y G × L aleatorios; localidades fijas con 28 clones (378 pares de Tukey) |

Las piezas puras del puente (lectura de la salida de R, nombres, columnas, código que se manda) tienen pruebas unitarias
en node (`tests/unidad/motor-r.test.js`). La prueba de privacidad registra también las peticiones del hilo del motor:
solo descargas de código de webR y de su repositorio de paquetes, sin datos.

Comprobado aparte: el tipo III de lmerTest da las mismas F con contrastes de tratamiento o de suma cero aun con datos
desbalanceados, así que los coeficientes conservan los contrastes de tratamiento (como `summary()`).

## Muestreo en el núcleo JS (Hito 3.1)

- **Referencia** (`tests/r/muestreo.R`): las fórmulas de Cochran (1977, caps. 2 a 5) en R base, escritas por otro
  camino que la app: la varianza de una proporción 0/1 con var(), la de la media estratificada como
  (1/N²)·Σ N_h(N_h − n_h)s_h²/n_h y las medias de los estratos con tapply.
- **Resultado**: 11 casos (tamaño de muestra de una media con DE o con CV y de una proporción, con y sin población
  finita; aleatorio simple con faltantes, con total y con proporciones; estratificado con faltantes, con fracciones de
  muestreo altas y con la asignación proporcional y de Neyman): 217 valores, diferencia escalada máxima 1.2 × 10⁻¹⁴.
- **Pruebas unitarias** (`tests/unidad/muestreo.test.js`): valores de libro (n₀ = 384.15 para p = 0.5, ± 0.05 y
  95 %), un censo sin error de muestreo, el estratificado con un solo estrato igual al aleatorio simple, las
  asignaciones que suman la muestra, la lectura de los tamaños de los estratos y los mensajes de error.

## Tamaño de muestra y potencia en el núcleo JS (Hito 3.0)

- **Referencia** (`tests/r/potencia.R`): las funciones de R con sus valores por omisión (power.t.test,
  power.anova.test y power.prop.test de stats; pwr.r.test de pwr) y el lazo de Cochran y Cox en R base. La app busca
  las raíces con SP.num.raizR, que es el zeroin2 de uniroot paso por paso, con el mismo intervalo y la misma tolerancia:
  el n que da R con su tolerancia por omisión (ε^¼) coincide a 1e-14, no solo a la tolerancia.
- **Resultado**: 14 casos de 5 métodos (las tres incógnitas de cada función, bilateral y unilateral), 1020 valores,
  diferencia escalada máxima 3.5 × 10⁻¹⁴.
- **Pruebas unitarias** (`tests/unidad/potencia.test.js`): la F no central contra pf(q, gl1, gl2, ncp) de R (1e-13),
  la ida y vuelta (con el n calculado, la potencia pedida) y el lazo de Cochran y Cox.

## Cierre de la Fase 2: motor R sin conexión y rendimiento (Hito 2.10)

- **Repositorio propio del motor R** (`tools/motor-r/armar.mjs`): el manifiesto fija webR 0.6.0 (13 archivos, 23.5 MB)
  y los 70 paquetes que piden los métodos del motor y sus dependencias (79.1 MB), con el MD5 del índice de webR y un
  SHA-256 propio de cada archivo; el armado verifica todo y escribe el índice `PACKAGES.rds` con R. Los archivos de webR
  se midieron con el navegador (las peticiones del hilo del motor al cargar los seis paquetes).
- **Motor R sin conexión** (`tests/sin-conexion.mjs`, con `motor-r/` armado): servida por http, el motor sale del
  mismo origen (87 peticiones a `motor-r/`, ninguna externa) y el servicio sin conexión lo guarda; con la red cortada y
  el servidor apagado, la app abre y calcula los siete análisis del uso, el modelo mixto incluido.
- **Rendimiento** (`tests/rendimiento/medir.mjs --motor`): 53 operaciones, todas en meta. Con 100 000 filas: conteos
  (Poisson) en 1.1 s, binomial 0/1 en 1.1 s, REML con dos aleatorios en 0.6 s, cuadrático-meseta por grupo en 0.1 s,
  superficie de respuesta en 0.1 s, ensayo multiambiente en 0.2 s y AMMI en 0.2 s; con 20 000 filas en el motor R, el
  modelo mixto en 4.3 s y los bloques aleatorios en 1.5 s (arrancar el motor y cargar lme4 con la caché vacía: 9.3 s).
- **Hallazgos al medir**, corregidos sin cambiar ningún número de los casos (se volvieron a generar las referencias y
  salieron idénticas):
  1. La familia automática del GLM tomaba por sobredispersión una razón de 1.008 (p = 0.03 con 100 000 filas) y la
     binomial negativa, con datos de Poisson, no convergía (θ crece sin fin): seis minutos. Ahora pide además razón >
     1.1 (igual en el efecto por observación del GLMM y en las referencias de R), reusa el ajuste de la familia base y
     detiene θ en 10⁸ con un aviso.
  2. IRLS solo paraba cuando la devianza cambiaba menos de 1e-14 relativo, que con decenas de miles de filas queda
     debajo de su redondeo (el modelo nulo tardaba 60 iteraciones); ahora también cuando los coeficientes no cambian.
  3. Las curvas no lineales se ajustaban sobre todas las filas: ahora sobre la media de cada celda (x, grupo) pesada
     por su número de filas, que da el mismo óptimo, la misma J'J y la misma suma de cuadrados (4.2 s → 0.1 s).
  4. La falta de ajuste de las superficies armaba una matriz de indicadoras de filas × combinaciones; ahora la suma de
     cuadrados dentro de cada combinación (con bloques, el ajuste por celdas de SP.lineal).

## Ensayos multiambiente y estabilidad en el núcleo JS (Hito 2.8)

- **Referencia** (`tests/r/multiambiente.R`, solo R base): tapply y un lm por ambiente para la tabla de medias y el
  error combinado; anova(lm(y ~ amb + amb:rep + gen + gen:amb)) para el análisis conjunto; Bartlett con su fórmula
  sobre los CME; un lm por genotipo sobre el índice ambiental; Wricke, Shukla y Lin y Binns en fórmula cerrada; svd()
  para AMMI y GGE y chull() para el polígono de quién ganó dónde. Las convenciones (desviaciones combinadas con
  g(e − 2) gl, Shukla en la escala de medias, EE de b con el error combinado) se cotejaron contra metan.
- **Resultado**: 15 casos de 4 métodos, 3 248 valores, diferencia escalada máxima 2.8 × 10⁻¹³.
- **Pruebas unitarias** (`tests/unidad/multiambiente.test.js`): la SVD reconstruye la tabla con vectores ortonormales,
  la envolvente convexa, la media de las b es 1, W en % suma 100 y los ejes AMMI suman la SC de G × A.

## Superficies de respuesta en el núcleo JS (Hito 2.7)

- **Referencia** (`tests/r/superficie.R`, solo R base): lm sobre los factores codificados con los términos en el orden
  de la metodología; un lm aparte sobre las variables originales (comprueba la transformación exacta de la app); ANOVA
  por grupos con diferencias de SCR de modelos anidados; error puro con lm(y ~ bloque + combinación de x); eigen(B)
  con el signo de cada vector fijado por su primer componente no despreciable; cresta con uniroot (tolerancia mínima)
  sobre el radio.
- **Resultado**: 10 casos de 2 métodos, 2 015 valores, diferencia escalada máxima 5.9 × 10⁻¹³.
- **Pruebas unitarias** (`tests/unidad/superficie.test.js`): la codificación, los valores propios (A·v = λ·v), cada
  punto de la cresta contra 400 puntos al azar de su esfera y la ecuación original con las mismas predicciones.

## Regresión no lineal en el núcleo JS (Hito 2.6)

- **Referencia** (`tests/r/nolineal.R`): nls con el gradiente analítico de cada modelo (atributo «gradient»); con
  derivadas numéricas nls no pasa de una tolerancia de 1e-8, y aun con el gradiente analítico se detiene cuando la suma
  de cuadrados ya no distingue mejoras de su redondeo: el óptimo se pule con Gauss-Newton puro hasta un paso relativo
  de 1e-13 (lo mismo hace la app). EE, log-verosimilitud y pruebas F con las fórmulas de summary.nls, logLik.nls y
  anova.nls; derivados por el método delta con gradientes analíticos.
- **Resultado**: 10 casos de 3 métodos, 572 valores, diferencia escalada máxima 3.3 × 10⁻¹³.
- **Pruebas unitarias** (`tests/unidad/nolineal.test.js`): los ocho gradientes contra diferencias finitas, el mínimo
  de Brent, el perfil de lineal-meseta y la dosis cero del log-logístico.

## Modelos lineales generalizados mixtos (Hito 2.5, motor R)

- **Referencia** (`tests/r/glmm.R`): glmer o glmer.nb en el R de escritorio con el mismo control estricto que la app
  (bobyqa con rhoend = 1e-12 y tolPwrss = 1e-12; con el de omisión, glmer se queda hasta 1.4 × 10⁻⁴ del óptimo), el
  efecto por observación con la misma regla, car::Anova (Wald) y emmeans con la misma covarianza.
- **Versiones**: el motor trae lme4 2.0-1 y car 3.1-5; el escritorio, lme4 1.1-35.5 y car 3.1-3. lme4 2.0 ya no calcula
  la hessiana con glmer.nb ni en un ajuste singular (la 1.1 sí, y los EE difieren hasta 2 %): en esos dos casos los EE
  salen de RX en los dos lados; en los demás, de la hessiana, que coincide en 7 cifras.
- **Tolerancias**: los p menores que 1e-6 de los coeficientes, de Wald y de los pares se comparan en absoluto (1e-10):
  la diferencia de 1e-7 en los EE se amplifica en ellos (dp/p ≈ z²·dEE/EE). En grouseticks (118 nidadas y 63
  localidades) la hessiana se evalúa en óptimos que difieren 1e-7 y los EE coinciden en 5 cifras (tolerancia 1e-5).
- **Resultado**: 8 casos de 2 métodos, 907 valores, diferencia escalada máxima 4.1 × 10⁻⁶ (sin grouseticks, 8.6 × 10⁻⁷).

## Componentes de varianza y heredabilidad en el núcleo JS (Hito 2.3)

El REML de la familia nueva corre en JavaScript (`js/nucleo/reml.js`, información promedio sobre las ecuaciones de
Henderson), así que se valida como los métodos de la Fase 1, en node, con `tests/correr.mjs`.

- **Referencia** (`tests/r/geneticos.R`): lme4 1.1-35.5 con REML y tolerancia estricta de bobyqa da el punto de
  partida; luego se pule con pasos de Newton sobre la verosimilitud restringida escrita con matrices completas
  (V = Σ σ²ₖZₖZₖ' + σ²eI, P, gradiente e información promedio) hasta que el gradiente queda en 10⁻¹³. Con sus
  tolerancias de omisión lme4 se queda hasta 6 × 10⁻⁵ del óptimo (Penicillin), más que el criterio de 1e-6. Con esos
  componentes, también con matrices completas: los efectos fijos, los BLUP (σ²ₖZₖ'Py), las PEV
  (σ²ₖI − σ⁴ₖZₖ'PZₖ), los EE (inversa de la información promedio) y −2ℓR, que coincide con el de lme4. Los BLUE salen
  de un segundo ajuste con los genotipos fijos y de `model.matrix` con cada genotipo en todas las parcelas.
- **Razón de verosimilitudes**: el modelo sin cada término, con las mismas filas; un componente en cero da χ² = 0 y
  p = 1 en los dos lados.
- **Resultado**: 17 casos de 3 métodos, 1 451 valores, diferencia escalada máxima 4.9 × 10⁻¹⁰.
- **El código R** que muestra la app (lme4 con la misma tolerancia estricta, la PEV con V y P completas para la H² de
  Cullis y emmeans con gl asintóticos para la de Piepho) se corre en R en 4 escenarios de `tests/codigo-r.mjs`.
- **Pruebas unitarias** (`tests/unidad/geneticos.test.js`): absorber el término mayor (aleatorio, o un factor fijo de
  indicadoras) da lo mismo que el cálculo denso, la frontera y los mensajes de error.

## Modelos lineales generalizados en el núcleo JS (Hito 2.4)

- **Referencia** (`tests/r/glm.R`): glm con `epsilon = 1e-14` (con el 1e-8 de omisión, la dispersión de Pearson que usa
  anova.glm sale de los pesos de la penúltima iteración y difiere 2 × 10⁻⁶); la binomial negativa parte de glm.nb y se
  pule (θ por Newton hasta el óptimo y glm con esa θ, hasta que θ no cambie; su EE, en el óptimo: glm.nb lo evalúa en la
  iteración anterior y difiere 10⁻⁶). Las tablas de devianza siguen el algoritmo de anova.glm (tipo I) y de car::Anova
  (tipos II y III, con glm.fit sobre las columnas de la matriz del modelo), cotejado contra los dos; con la binomial
  negativa θ queda fija. Las medias, con emmeans (offset = 0: tasa por unidad de exposición; gl infinitos salvo en la
  gamma, como emmeans).
- **Resultado**: 15 casos de 4 métodos, 2 006 valores, diferencia escalada máxima 7.4 × 10⁻⁸ (una p de Tukey, con piso
  absoluto de 1e-12 como en la Fase 1).
- **El código R** de la app (glm o glm.nb con convergencia estricta, car::Anova o anova y emmeans) se corre en R en 4
  escenarios de `tests/codigo-r.mjs`.
- **Pruebas unitarias** (`tests/unidad/generalizados.test.js`): digamma y trigamma, enlaces y sus límites, columnas
  colineales, la familia automática, θ como punto fijo y los mensajes de error.

## Dónde está cada cosa

```
tests/
├─ casos/<objetivo>/generar.R     script de R que escribe los casos de esa función o método
├─ casos/<objetivo>/<caso>.json   datos + resultado de R + versión de R y paquetes + código R
├─ casos/<objetivo>/<caso>.csv    los mismos datos, para leerlos a mano
├─ r/comun.R                      sp_caso(): escribe un caso
├─ r/generar-todo.R               corre todos los generar.R y guarda r/sesion.txt (sessionInfo)
├─ lib/comparar.js                el criterio de arriba
├─ lib/validar.js                 corre un caso contra la app
├─ unidad/*.test.js               pruebas unitarias con valores resueltos a mano
├─ correr.mjs                     corredor en node (sin navegador)
├─ navegador.mjs                  las mismas pruebas en Edge o Chrome sin ventana, por file://
├─ codigo-r.mjs                   el código R que muestra la app, corrido en R contra los números de la app
├─ exportar.mjs                   cada exportación, leída con R (readxl, xml2, pdftools, png, openssl) y con el sistema
├─ sin-conexion.mjs               privacidad (cada petición de red) y uso sin red con el servicio sin conexión
├─ rendimiento/medir.mjs          53 operaciones con 100 000 filas en el navegador (--motor: el motor R con 20 000) (pagina.js: lo que corre en la página)
├─ accesibilidad/auditar.mjs      77 escenarios con el auditor de la suite y el foco con Tab de verdad
├─ motor-r.mjs                    los casos de los métodos del motor R, en el navegador (guarda generado/motor-r.json)
├─ lib/huella-motor-r.mjs         la huella que decide si un resultado del motor R sigue valiendo
├─ lib/navegador.mjs              cómo abren las pruebas el navegador sin ventana
├─ lib/comprobaciones.mjs         escribe js/generado/comprobaciones.js (bloque 8, «Otras comprobaciones»)
├─ index.html                     las mismas pruebas con doble clic
└─ reporte-validacion.html/.csv   el reporte publicado (también en la app, bloque 8)
```

## Formato de un caso (`esquema: 1`)

```json
{
  "esquema": 1,
  "id": "num.resumen/plantgrowth",
  "objetivo": { "tipo": "funcion", "nombre": "num.resumen" },
  "titulo": "Peso seco de 30 plantas",
  "fuente": "Dobson (1983); conjunto PlantGrowth de R",
  "clase": "A",
  "datos": { "columnas": { "weight": [4.1699999999999999, 5.5800000000000001, …] }, "tipos": { "weight": { "tipo": "numerica" } } },
  "argumentos": [{ "columna": "weight" }],
  "esperado": { "n": 30, "media": 5.0730000000000004, … },
  "comparacion": { "modo": "relativo" },
  "referencia": { "r": "R version 4.4.2 …", "paquetes": { "stats": "4.4.2" }, "codigo": "mean(x, na.rm = TRUE) …" }
}
```

- `objetivo.tipo` es `"funcion"` (una función del núcleo, `SP.<nombre>`) o `"metodo"` (un método registrado
  con `SP.metodo`, que recibe `entradas` y `opciones` en lugar de `argumentos`).
- Un argumento `{ "columna": "x" }` se convierte en esa columna; `{ "tabla": true }`, en la tabla completa.
- Los números van con 17 cifras significativas: la app lee exactamente los mismos valores que usó R.
- Los factores llevan `niveles` en el orden de R, para que medias y contrastes salgan en el mismo orden.

## Cómo repetirlo

Requisitos: R ≥ 4.4 con los paquetes que pida cada caso, y node ≥ 20 (cualquier node; no hace falta npm).

```
Rscript tests/r/generar-todo.R      # regenera todas las referencias con tu R
node tests/correr.mjs               # compara y escribe los reportes
node tests/navegador.mjs            # lo mismo en el navegador, por file://
node tests/codigo-r.mjs             # el código R que muestra la app da lo mismo en R
node tests/exportar.mjs             # las exportaciones, leídas con R y con el sistema
node tests/sin-conexion.mjs         # privacidad y uso sin conexión
node tests/rendimiento/medir.mjs    # rendimiento con 100 000 filas (--json guarda resultados.json)
node tests/accesibilidad/auditar.mjs   # accesibilidad AA (el auditor está en LABG-Design, junto a SigmaPro)
node tests/motor-r.mjs              # los métodos del motor R, en el navegador (necesita internet); luego correr.mjs
```

En Windows, `tests/pruebas.ps1` encuentra R, node y el navegador y corre las pruebas; con `-Completo`, también las
exportaciones, la privacidad, el rendimiento y la accesibilidad.

## Regla de liberación

Un método **no aparece en la app** hasta que tiene casos de validación y todos aprueban
(`SP.metodoDisponible`, que lee el reporte generado en `js/generado/validacion.js`).

## Nombres

Por la regla de la suite, en el código, la interfaz y los reportes no se nombran programas comerciales:
los ejemplos publicados se citan por su libro o artículo.
