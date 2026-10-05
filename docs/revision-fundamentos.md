# Revisión técnica de las fichas de Fundamentos

SigmaPro 0.5.0 · 4 y 5 de octubre de 2026

Las 78 fichas del bloque 9 (Fundamentos) pasaron por una revisión independiente antes de publicarse. Seis revisiones
(R1 a R6), de 13 fichas cada una, contrastaron lo que dice cada ficha con lo que hace la app. Este documento resume el
resultado, los errores de la app que salieron en el camino (y cómo se corrigieron) y las observaciones que quedan
como mejoras. Al final están los seis reportes completos.

## Cómo se revisó

Cada revisión siguió la misma lista de verificación por ficha:

| Punto | Qué se comprobó |
|---|---|
| Modelo | La ecuación y sus términos coinciden con lo que ajusta el código (`js/metodos/`, `js/nucleo/`). |
| Hipótesis | H₀ y H₁ son las que prueba la app, con el estadístico y la distribución que usa. |
| Supuestos | Cada supuesto se revisa en SigmaPro donde la ficha dice (semáforo, «Revisar los supuestos del modelo», gráficas), y la alternativa propuesta existe. |
| Datos | Columnas, tipos y papeles coinciden con las entradas del método; la tabla «larga» copia filas reales y consecutivas del conjunto de ejemplo. |
| Ejemplo | «Cargar estos datos de ejemplo» abre el análisis con sus entradas y corre; las cifras de la redacción son las que da la app (o se declaran ilustrativas). |
| Interpretación | Lo que la ficha manda mirar existe en la salida (cuadros, columnas, semáforo, gráficas) y se lee como dice. |
| Referencias | Autor, año, título, revista o editorial, volumen, páginas y DOI; 3 a 5 por ficha, en APA. |

Además: los identificadores de guías, alternativas y métodos relacionados existen; las etiquetas citadas aparecen en la
interfaz y en el catálogo inglés; ES y EN dicen lo mismo con las mismas cifras; la ficha no menciona instituciones.
El validador automático (`node tests/fundamentos.mjs`) comprueba después la estructura de las nueve secciones en los
dos idiomas, corre en node los ejemplos de los métodos que no usan el motor R, convierte todas las fórmulas a MathML y
revisa que el índice corresponda a las fichas.

## Resultado

| Revisión | Fichas | Con alguna corrección |
|---|---|---|
| R1 · descriptiva, supuestos, pruebas y diseños de un error | descriptivos, frecuencias, proporciones, bondad-ajuste, supuestos, prueba-t, wilcoxon, kruskal-wallis, friedman, dca, dbca, cuadro-latino, modelo-lineal | 9 |
| R2 · diseños con estratos, comparaciones y regresión | parcelas-divididas, parcelas-subdivididas, franjas, bib, latice, comparaciones-medias, contrastes, polinomios, medias-ajustadas, ancova, regresion-lineal, regresion-polinomial, seleccion-pasos | 9 |
| R3 · regresión, correlación, contingencia, multivariado y supervivencia | mejores-subconjuntos, correlacion, matriz-correlacion, correlacion-parcial, tabla-contingencia, mcnemar, mantel-haenszel, kappa, manova, discriminante, kaplan-meier, cox, autocorrelacion | 6 |
| R4 · series, mixtos y genéticos | descomposicion, tendencia, arima, modelo-mixto, mixto-bloques, mixto-divididas, mixto-latice, mixto-localidades, medidas-repetidas, componentes-varianza, heredabilidad, repetibilidad, glmm-bloques | 11 |
| R5 · GLM, GLMM, no lineal y superficies | glmm, glm-conteos, glm-proporciones, glm-gamma, glm, curva-crecimiento, dosis-respuesta, respuesta-meseta, superficie-respuesta, ascenso-pronunciado, diseno-superficie, mezclas, deseabilidad | 6 |
| R6 · multiambiente, potencia y muestreo | ensayos-multiambiente, dos-etapas, estabilidad, ammi, gge, potencia-medias, potencia-anova, potencia-proporciones, potencia-correlacion, repeticiones, tamano-muestra, muestreo-simple, muestreo-estratificado | 8 |
| **Total** | **78** | **49** |

Las correcciones fueron de cinco tipos:

- **Atribuir a la app algo que no hace:** herramientas que no existen (promediar en «Datos → Reformar»), semáforos que
  el método no tiene (los diseños revisan sus supuestos con «Revisar los supuestos del modelo»), protecciones que no
  da (Scheffé solo prueba pares), opciones que no corren (Dunnett en el látice).
- **Interpretación:** qué cuadro o columna mirar, qué pruebas admite cada revisión de supuestos, qué muestra cada
  gráfica (datos crudos frente a medias ajustadas).
- **Cifras de los ejemplos:** donde la redacción no coincidía con lo que da la app, se corrigió con el resultado real
  (por ejemplo, la selección paso a paso con `cafe` retiene 6 variables y da R² ajustada de 0.85).
- **Datos:** columnas y papeles del ejemplo, letras de niveles repetidas, tablas «larga» con filas reales; las fichas
  de planeación (potencia, repeticiones, tamaño de muestra, diseño de superficies) quedaron sin conjunto de datos.
- **Referencias y formato:** páginas de Box y Cox (1964): 211–252; títulos según el DOI; porcentajes sin espacio en
  inglés; «assumptions checklist» como nombre del semáforo en inglés.

Dos conjuntos de ejemplo nuevos, ficticios y declarados como tales, dan a las fichas de parcelas subdivididas y de
bloques incompletos balanceados un ejemplo propio: `arroz-subdivididas` (36 parcelas: riego × variedad × nitrógeno en
3 bloques) y `sorgo-bib` (7 líneas en 7 bloques de 3; t = 7, k = 3, r = 3, λ = 1). Se generan con
`datos/generar-ejemplos.R` (semillas 93 y 94).

Al terminar, el validador da **78 de 78 fichas sin problemas**: 63 ejemplos corridos en node (los otros 15 usan el
motor R o son de planeación) y 1472 fórmulas convertidas a MathML.

## Errores de la app encontrados y corregidos

La revisión encontró errores en la app misma. Se corrigieron en esta versión; los de cálculo tienen un caso nuevo o
actualizado contra R.

| # | Dónde | Qué pasaba | Corrección |
|---|---|---|---|
| 1 | Kappa ponderada (`js/metodos/contingencia.js`) | Si el primer evaluador no usaba alguna categoría, esa categoría quedaba al final de la tabla y la ponderación usaba un orden falso (en una prueba, 0.029 en lugar de 0.789). | La tabla une los niveles de los dos evaluadores en su orden (numérico si lo son). Caso nuevo contra R: `contingencia/severidad-sin-categoria`. |
| 2 | Potencia del ANOVA con la varianza entre medias (`js/metodos/potencia.js`) | El código R pasaba `between.var` junto con `n` y `power`: ningún argumento quedaba en `NULL` y `power.anova.test` fallaba. Las notas mostraban medias que ese modo no usa. | Sin medias en ese modo; el código R deja en `NULL` lo que se despeja y toma los grupos indicados. |
| 3 | Tamaño de muestra para una proporción con población finita (`js/nucleo/muestreo.js`) | Usaba n₀/(1 + n₀/N), la forma de la media. | n = n₀/[1 + (n₀ − 1)/N] (Cochran, 1977, cap. 4), porque la varianza de la proporción lleva (N − n)/(N − 1). Nota, código R y referencia de las pruebas actualizados. |
| 4 | Muestreo estratificado con todos los estratos completos | Los gl de Satterthwaite daban 0/0 y el intervalo salía `NaN`. | Un censo no tiene error de muestreo: EE = 0, el intervalo es el punto y la conclusión lo dice. Prueba unitaria nueva. |
| 5 | Eficiencia relativa del cuadro latino (`js/metodos/disenos.js`) | Las etiquetas frente a bloques estaban invertidas: «las filas como bloques» usaba el CM de filas. Con las filas como bloques, lo que pasa al error es la variación de las columnas. | «Filas como bloques» usa el CM de columnas, y al revés. Referencia en R y casos `latino-cinco` y `latino-huertos` regenerados; prueba unitaria nueva. |
| 6 | Recomendaciones de «Revisar los supuestos del modelo» | Mostraban al usuario «Hito 1.5» e «Hito 1.6» y proponían un «ANOVA de Welch» para k grupos que la app no tiene. | Remiten a Games-Howell (Comparaciones de medias) y a Kruskal-Wallis o Friedman. |
| 7 | Reabrir un análisis desde el Reporte o desde una ficha (`aplicar` en `js/interfaz/analisis.js`) | En la prueba t y Wilcoxon no volvían los dos grupos ni las opciones; en Kruskal-Wallis y Friedman, la prueba posterior y el ajuste; en supuestos se borraba la columna de orden. | Vuelven todos. |
| 8 | Frecuencias con faltantes | La categoría «(faltante)» salía en español en la interfaz inglesa. | Pasa por el catálogo de traducción. |
| 9 | GLM, nota de los intervalos | «con el intervalo de el perfil…». | «del perfil…» (y «de Wald»). |
| 10 | Mezclas | El aviso de modelo no estimable mostraba el identificador interno («cubico-especial»). | Muestra el nombre del modelo, traducido. |
| 11 | Guía del WAAS | Decía «en todos los ejes AMMI». | En los ejes significativos (o los que elija el usuario), como calcula la app. |
| 12 | Friedman con repeticiones | El mensaje proponía promediar con «Datos → Reformar», que no promedia (y esa etiqueta no existe en pantalla). | Propone promediar en la hoja de cálculo e importar la tabla de medias. |
| 13 | Dunnett sin solución exacta | Sugería «Bonferroni u Holm contra el testigo», opción que no existe. | Explica que Bonferroni y Holm ajustan todos los pares y resultan conservadoras contra el testigo. |
| 14 | Diseños mixtos (bloques y parcelas divididas) | La nota del cuadro de medias pedía usar «dentro de», pero el formulario no lo ofrecía. El cuadro de BLUP desaparecía sin aviso con más de 120 renglones. | El formulario ofrece «Dentro de cada nivel de» (probado con la avena de Yates en el motor R). Una nota avisa cuando los BLUP no se muestran. |
| 15 | Interacción en los diseños con estratos | La conclusión remitía a «los efectos simples», un cuadro que esos diseños no tienen. | Remite a comparar dentro de cada nivel en Comparaciones de medias. |
| 16 | Asignación de Neyman | Al redondear hacia arriba, la suma pasaba del total pedido sin decirlo. | La conclusión da la suma redondeada cuando pasa del total. |
| 17 | Cohen (1968) en el informe y el manual | Título con «with provision». | Título del DOI: «Nominal scale agreement provision for scaled disagreement or partial credit». |
| 18 | Fichas de Explorar | «Cargar estos datos de ejemplo» de descriptivos, frecuencias, proporciones y bondad de ajuste abría Análisis. | Abre el bloque 3 (Explorar) con sus entradas. |

## Observaciones que quedan como mejoras

No son errores de cálculo. Las fichas ya advierten lo que afecta al usuario; las demás quedan para versiones futuras.

**Pruebas, diseños y comparaciones**

- «Revisar los supuestos del modelo» admite tratamientos y un solo bloque: en el cuadro latino, el látice y los diseños
  con estratos la revisión es aproximada.
- En el BIB y el látice, la F de bloques sale sin ajustar por tratamientos (SC secuencial) y la gráfica muestra datos
  crudos, no medias ajustadas. El cuadro del BIB no muestra t, b, k y r.
- En parcelas subdivididas, el cuadro de combinaciones y la gráfica solo cubren A × B (con `arroz-subdivididas`, la
  interacción significativa es riego × nitrógeno).
- Parcelas divididas con parcelas grandes en cuadro latino: la nota «Los bloques no se prueban» no corresponde a esa
  variante; con parcelas grandes completamente al azar puede salir «El modelo de error es singular» con datos correctos.
- Dunnett exacto es muy lento con t grandes y pocos gl (minutos en un BIB de 7 tratamientos); no hay comparación solo
  contra el testigo con Bonferroni u Holm.
- La DMS protegida usa la F tipo I del diseño; en factoriales desbalanceados puede no ser la tipo III que vio el usuario.
- El semáforo de parcelas divididas mixtas aplica Levene solo entre los niveles de A.
- Bondad de ajuste, los ocho diseños y el modelo lineal general no informan las filas excluidas por faltantes.
- Friedman: el reporte dice «Conover-Iman» y el selector, «Conover».

**Regresión, correlación, contingencia y multivariado**

- El AIC de la selección paso a paso (n·ln(SCE/n) + 2k, como `step()`) y el de la regresión lineal (log-verosimilitud)
  difieren en una constante. Mejores subconjuntos marca el menor Cp, no el criterio Cp ≈ p.
- La ANCOVA no revisa los residuos; la revisión de supuestos no acepta covariables.
- McNemar 2 × 2 decide con la binomial exacta aunque se elija la corrección por continuidad; γ, τ y d de Somers salen
  también con variables nominales.
- El ejemplo `chile-frutos` mide 5 frutos por parcela: la MANOVA los toma como repeticiones (la ficha lo advierte).
- MANOVA: SC secuencial en el orden de las columnas; M de Box entre celdas sin quitar bloques.
- Con frecuencias no enteras, la tabla de contingencia dice a la vez que Fisher no aplica y que se use Fisher.

**Series, supervivencia, mixtos y genéticos**

- «Ancha → larga» apila por columna: una tabla años × meses queda por mes; las series con «las filas ya están en orden»
  quedan desordenadas, y Datos no permite ordenar filas.
- Kaplan-Meier, Cox y autocorrelación deciden con α = 0.05 fijo; la conclusión de autocorrelación nombra solo los
  primeros 8 rezagos.
- Medidas repetidas usa los gl del error de nlme (N − p) para todos los términos. Hay dos p distintos para un componente
  de varianza (el de `ranova` y la mezcla ½χ²₀ + ½χ²₁ de los genéticos).

**GLM, no lineal, superficies y multiambiente**

- En gamma, cuasi y gaussiana inversa, el renglón «Dispersión» del semáforo informa φ pero no revisa el CV constante.
- Dosis-respuesta: intervalos de Wald simétricos para las DE efectivas (pueden llegar a negativos).
- Deseabilidad sin semáforo; mezclas sin gráfica de residuos.
- AMMI: la conclusión cuenta los ejes significativos consecutivos y el WAAS usa todos los ejes con p < α; difieren si
  hay un eje no significativo entre significativos. GGE llama «megaambientes» a los sectores de una sola tabla.

**Potencia y muestreo**

- Con diferencia o r negativas y prueba unilateral, se prueba la dirección positiva sin avisar.
- `aguacate-huertas` es una muestra estratificada no proporcional: sirve para practicar el muestreo simple, pero la
  estimación correcta para esos datos es la estratificada (la ficha lo dice: 54.3 kg por árbol frente a 51.9).

## Reportes completos

Los seis reportes se conservan como los entregó cada revisión. Lo que quedó resuelto después (por ejemplo, la
eficiencia del cuadro latino, que R1 marcó como posible error) está en la sección de errores corregidos.

### Revisión técnica R1: descriptiva, supuestos, pruebas y diseños

Revisé 13 fichas contra `js/metodos/` (descriptiva, frecuencias, supuestos, pruebas-t, no-parametricas, disenos, modelo-lineal), `js/interfaz/explorar.js` y `js/interfaz/analisis.js` (cuadros, semáforo, gráficas y etiquetas), `js/i18n/en.js` y los conjuntos de `datos/ejemplos.js`. Corrí cada ejemplo con el motor de la app. Las tablas `formato.largo` copian filas reales y consecutivas. La validación final da 13 de 13 fichas sin problemas.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| descriptivos | ✓ | ✓ (no aplica) | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | Cambié «resume por parcela (Datos → Reformar)» por «agrupa este cuadro por tratamiento y bloque», porque Reformar no promedia. La teoría ahora dice que el aviso de asimetría solo sale en grupos con 8 o más valores. «Más estadísticos en el cuadro» ya trae de inicio los faltantes, el intervalo de la mediana, la asimetría y la curtosis, y los percentiles se piden en «Percentiles adicionales». ES y EN. |
| frecuencias | ✓ | ✓ (no aplica) | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. |
| proporciones | ✓ | ✓ (no aplica) | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La conclusión muestra hasta 4 proporciones (las demás quedan en el cuadro) con el intervalo de Wilson, o con el del primer método marcado si se quita Wilson. ES y EN. |
| bondad-ajuste | ✓ | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | El ejemplo pasa a `mendel` (categoria = fenotipo, conteo = semillas, proporciones [9, 3, 3, 1]), con sus 4 filas completas en `formato.largo`. Corre y da χ² = 0.470, gl = 3, p = 0.925. Columnas y nota de formato ajustadas al ejemplo. «Las filas sin categoría… se cuentan» ahora dice que la app no avisa cuántas quedaron fuera. |
| supuestos | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | ✓ | Decía que la ANCOVA «trae su propia revisión de supuestos». Ahora dice que esta revisión no acepta covariables y que el semáforo de la ANCOVA revisa pendientes iguales y que la covariable no dependa de los tratamientos, pero no los residuos. |
| prueba-t | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Comprobado: Welch por omisión, Student como referencia, semáforo de normalidad y de varianzas, d y g con IC por la t no central. |
| wilcoxon | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | ✓ | Para la simetría de las diferencias: los descriptivos no ven las diferencias si antes no se crean con «Variable calculada» en Datos. Se mira la caja de las diferencias en la gráfica. Comprobado: 16 de 18 pares, V = 136, p exacto. |
| kruskal-wallis | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Comprobado: n = 11, 16 y 9; Dunn con Holm por omisión; letras. |
| friedman | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✗→corregido | ✓ | Si la respuesta está vacía, el bloque sale completo. Si falta la fila de una combinación, la app se detiene y no excluye el bloque. Quité «Datos → Reformar» para promediar (esa herramienta no promedia) y nombré «Ancha ⇄ larga» para el cambio de forma. En el ejemplo de redacción, 5 bloques pasan a 4 (los que quedan) y la W pasa a 0.78, coherente con χ²/(n(k − 1)). Teoría, supuestos, balance y nota de formato, en ES y EN. |
| dca | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✗→corregido | El diseño no tiene semáforo: ahora cada renglón remite al de «Revisar los supuestos del modelo». Quité «el cuadro agrega la distancia de Cook», que no se muestra; en su lugar, la fila del atípico y las marcas de ±2 de la gráfica. Antes, «3 repeticiones dan 12 gl» no cuadraba; ahora dice que el error tiene t(r − 1) gl. En Box y Cox (1964) cambié las páginas 211–243 por 211–252. En EN, los porcentajes van sin espacio. |
| dbca | ✓ | ✓ | ✓ | ✗→corregido | ✓ | ✗→corregido | ✓ | La eficiencia relativa no se calcula con parcelas perdidas ni con bloques generalizados. En el ejemplo de redacción, la eficiencia va en por ciento (130 %), como la muestra la app, y no «1.3 veces». |
| cuadro-latino | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Eficiencias en por ciento, como en la app. Frente a bloques en una sola dirección, el ejemplo no dice cuál es cuál, por la posible inversión de etiquetas (hallazgo 1). En EN, los porcentajes van sin espacio. |
| modelo-lineal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Solo el formato de los porcentajes en EN. Comprobado: no tiene semáforo, SC III → II con celdas vacías, sin intercepto solo tipo I, gráfica de medias marginales de la primera interacción doble. |

Otras comprobaciones:

- Los ids de `guias`, `verificar`, `alternativa` y `relacionados` existen.
- Las etiquetas citadas existen en la interfaz y en `en.js`: «Qué hacer», «Varianza de los residuos por tratamiento», «Orden para la independencia», «Suponer varianzas iguales», «% por fila», «Contar los faltantes como una categoría», «Conteos», «Comparar las medias de este diseño», «Número de repeticiones de un experimento».
- La clasificación es correcta: ninguno de estos métodos es de planeación sin datos.
- ES y EN tienen las mismas cifras en todos los campos.

#### Hallazgos sobre la app

1. **Cuadro latino: las etiquetas de eficiencia relativa frente a bloques parecen invertidas** (`disenos.js`, `eficienciaLatino` y `CONTRA`).
   - Lo que hace el código: «frente a bloques (las filas como bloques)» usa (CM_fila + (t − 1)·CMe)/(t·CMe).
   - El problema: en un DBCA que usa las filas como bloques, la variación que pasa al error es la de las columnas. La fórmula frente a «filas como bloques» debería llevar el CM de columnas, y al revés para las columnas. Así lo plantean Steel, Torrie y Dickey (1997, sec. 9.3).
   - En el ejemplo (trigo): la app da 123.7 % con las filas como bloques y 111.1 % con las columnas; debería ser al revés.
   - Falta confirmar con Gomez y Gomez (1984, p. 37) cómo nombran R.E.(RCB, row).
2. **Friedman: el arreglo del error sugiere una herramienta que no promedia** (`no-parametricas.js`, l. 411).
   - Lo que dice: con repeticiones dentro de un bloque, propone «Promedia las repeticiones… (Datos → Reformar)».
   - El problema: el bloque Datos no promedia filas. Solo tiene Variable calculada, Transformar, Filtrar y Ancha ⇄ larga, y las expresiones no agregan por grupos.
   - Además, en español «Reformar» no aparece en pantalla: el botón dice «Ancha ⇄ larga…» y el diálogo, «Cambiar la forma de la tabla».
3. **Bondad de ajuste no informa las filas excluidas.** `calcularBondad` cuenta `excluidas`, pero `reporteBondad` no lo usa. Frecuencias y proporciones sí avisan.
4. **Los diseños (los 8 del catálogo) y el modelo lineal general no informan las filas que quedan fuera por faltantes.**
   - Lo que pasa: `resumen.excluidas` y `excluidas` se calculan pero no se muestran; solo aparecen las «Observaciones».
   - Contraste: «Revisar los supuestos del modelo» sí lo dice (`analisis.js`, l. 1449).
5. **Descriptivos: el aviso de asimetría mezcla definiciones.** Compara la asimetría del tipo elegido (`tipoForma` 1, 2 o 3) con el error estándar de G₁ (`eeForma`, que es del tipo 2). Con el tipo 1 o el 3, la regla «más del doble de su EE» mezcla las dos definiciones.
6. **Integración de Fundamentos, en `S/fundamentos.js` y no en la app: los cuatro métodos de Explorar no se abren.**
   - Lo que pasa: `abrirMetodo()` siempre va al bloque Análisis (`SP.app.ir(4)` y `SP.app.analisis.usar`). Pero descriptivos, frecuencias, proporciones y bondad-ajuste viven en Explorar (bloque 3). `aplicar()` no tiene rama para ellos y el catálogo de Análisis excluye la familia `descriptiva`.
   - Consecuencia: «Cargar estos datos de ejemplo» carga el conjunto pero no abre el resumen ni pone sus entradas. Por ejemplo, mendel no queda con «Conteos» = semillas ni con la proporción 9:3:3:1.
   - Arreglo propuesto: para la familia `descriptiva`, ir al bloque 3 y llenar `SP.app.explorar.tipo` y su estado (desc, frec, prop o bondad; en bondad, la proporción como texto «9:3:3:1»).

### Revisión técnica, grupo R2

Fichas revisadas contra `js/metodos/disenos.js`, `comparaciones.js`, `ancova.js`, `regresion.js`, `supuestos.js`,
`mixtos.js` y `js/nucleo/estratos.js`; cada ejemplo se corrió en Node con el núcleo de la app y se comparó con lo que
dice la ficha. Validador: 13 de 13 fichas sin problemas.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| parcelas-divididas | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✓ | El semáforo del mixto aplica Levene con la mediana entre los niveles de A (no «Levene de los residuos» en general). El aviso de desbalance recomienda «un modelo mixto», sin nombrar el método: la ficha ya no lo pone en boca de la app. |
| parcelas-subdivididas | ✓ | ✓ | ✓ | ✗→corregido | ✗→corregido | ✗→corregido | ✓ | Ejemplo `arroz-subdivididas` (entradas: rendimiento, riego, variedad, nitrogeno, bloque) con 8 filas reales. Columnas de datos según el conjunto, que se presenta como ficticio, para practicar. Una pregunta se cambió a la del conjunto. Redacción con los resultados reales (F(1, 2) = 95.8; riego × nitrógeno F(1, 12) = 23.3; CV 8.5/3.1/2.2 %). Orden de lectura y limitación: «Dentro de cada nivel de» admite un solo factor, y el cuadro de combinaciones y la gráfica solo muestran A × B. |
| franjas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Sin cambios. Con maiz da errores a/b/c con 6/9/18 gl, como dice la ficha. |
| bib | ✓ | ✓ | ✓ | ✗→corregido | ✗→corregido | ✗→corregido | ✓ | Ejemplo `sorgo-bib` (entradas: rendimiento, linea, bloque) con 6 filas reales (dos bloques completos). Columnas según el conjunto, que se presenta como ficticio, para practicar (t = 7, k = 3, r = 3, λ = 1). Pregunta 1 alineada al conjunto. Redacción con los resultados reales (F(6, 8) = 8.6, p = 0.004; E = 0.78; medias de 3.26 a 4.56 t/ha, EE 0.17). Aviso de que la gráfica de cajas muestra los datos crudos, no las medias ajustadas. |
| latice | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | Independencia: recomendaba el mixto con bloques aleatorios para parcelas vecinas parecidas, pero eso no modela la correlación espacial; ahora recomienda bloques más chicos y dice que el análisis espacial aún no existe (alternativa null). Interpretación: sugería Dunnett contra testigos, pero con el alfa-látice del ejemplo Dunnett no corre (correlaciones que no son de forma producto). Teoría: la heredabilidad es otro método (geneticos.js), no «la base» del mixto-látice. Limitación: ahora nombra los métodos por su nombre. |
| comparaciones-medias | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✓ | «Revisar los supuestos» solo admite tratamientos y un bloque, así que en cuadro latino, látice o parcelas la revisión es aproximada. Dunnett también falla con bloques incompletos, y el Bonferroni/Holm que sugiere la app ajusta todos los pares, no solo los del testigo. |
| contrastes | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✓ | Decía «usa Scheffé en Comparaciones de medias, que protege cualquier contraste», pero ese Scheffé solo prueba pares. Ahora da el criterio de Scheffé para el contraste: F = t² contra (k − 1)·F crítica. La limitación de multiplicidad dice cómo ajustar a mano. El tipo del segundo factor pasa de «k niveles» a «b niveles». |
| polinomios | ✓ | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | Menor: el híbrido estaba como «factor con k niveles», la misma letra que las dosis; ahora es «a niveles». Lo demás coincide: k − 1 componentes, óptimo −b₁/2b₂ y SC solo con un error (dosis 147.7 en el ejemplo). |
| medias-ajustadas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Sin cambios. Con el alfa-látice da EE de 0.194 a 0.195 y 31 gl. |
| ancova | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | ✓ | Con pendientes distintas decía «compara a varios valores de la covariable», cosa que la app no hace directamente. Ahora explica que el modelo lineal general da medias en la media de la covariable y que, para comparar en otro valor, se centra la covariable con una variable calculada y se leen los coeficientes. |
| regresion-lineal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Sin cambios. El semáforo, las 4 gráficas, el tope de independencia en «Revisar» (ámbar) y VIF 5/10 coinciden con regresion.js. |
| regresion-polinomial | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Sin cambios. Falta de ajuste con F(1, 44); óptimo con grados 2–3 solo si el último término es significativo; sin VIF ni β. |
| seleccion-pasos | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La redacción decía que con cafe (AIC, ambas direcciones) se retenían 5 variables con R² ajustada de 0.83. La app solo quita la temperatura (colineal con la altitud), retiene 6 y da R² ajustada de 0.85. Ahora la ficha dice eso. |

Referencias: todas son clásicas y sus datos coinciden. Revisé Yates 1935, 1936a y 1936b; Patterson y Williams 1976;
Cochran 1957; Searle, Speed y Milliken 1980; Lenth 2016; Tukey 1949; Duncan 1955; Dunnett 1955; Cook 1977;
Akaike 1974; Satterthwaite 1946; y los libros. No quité ninguna.

#### Entradas con que corre cada conjunto nuevo

- parcelas-subdivididas, `arroz-subdivididas`: `{ respuesta: "rendimiento", parcelaGrande: "riego", subparcela: "variedad", subsubparcela: "nitrogeno", bloque: "bloque" }`, `opciones: {}`. Da errores a/b/c con 2/8/12 gl.
- bib, `sorgo-bib`: `{ respuesta: "rendimiento", tratamientos: "linea", bloque: "bloque" }`, `opciones: {}`. Da F(6, 8) = 8.60, E = 0.778 y λ = 1.
- Con los CSV de `tests/casos/disenos` (antes de agregar los conjuntos nuevos) también corren:
  - subdivididas.csv: `{ respuesta: "y", parcelaGrande: "A", subparcela: "B", subsubparcela: "C", bloque: "bloque" }`.
  - bib-siete.csv: `{ respuesta: "y", tratamientos: "trat", bloque: "bloque" }`. Sin `tipos`, los niveles quedan en orden de aparición (T4 antes que T3).

#### Hallazgos sobre la app (solo lo nuevo)

1. **Dunnett exacto es muy lento con t grandes y pocos gl.** `comp.dunnettProb` integra con Gauss-Kronrod adaptativo a
   tolerancia relativa 1e-12 y profundidad hasta 40. Cuando el p es chico, la bisección se multiplica. Con 6
   comparaciones, gl = 8 y λ² = 0.5, una sola probabilidad tarda 1.6 s con t = 2, 9 s con t = 5 y 44 s con t = 8. El BIB
   de `tests/casos/disenos/bib-siete.csv` con testigo T1 (t de hasta 11.9) tardó 153 s en Node, y con sorgo-bib tarda 9 s.
   Corre en el hilo de trabajo, pero el usuario espera minutos. Convendría una tolerancia absoluta en la cola (p < 1e-6
   no necesita 12 cifras) o cortar la integral cuando el aporte sea despreciable.
2. **Dunnett no corre en látice ni en alfa-látice, y la salida que sugiere la app no existe.** Con el alfa-látice del
   ejemplo sale el error de «correlación de forma producto» y el consejo «Usa Bonferroni u Holm contra el testigo». Pero
   Bonferroni y Holm de «Comparaciones de medias» ajustan todos los pares (276 con 24 genotipos): no hay opción para
   comparar solo contra el testigo. Falta esa opción, o un Dunnett aproximado (t multivariada por Genz) para
   correlaciones arbitrarias.
3. **En los diseños con estratos falta lo que pide la conclusión.** La conclusión dice «interpreta los efectos simples
   y las medias de las combinaciones», pero `out.simples` solo se calcula en diseños de un error. En parcelas
   subdivididas, el cuadro de combinaciones y la gráfica de interacción solo usan los dos primeros factores (A × B).
   Con `arroz-subdivididas` la interacción significativa es riego × nitrógeno (p < 0.001) y no tiene cuadro ni gráfica;
   solo se ve riego × variedad, que no es significativa.
4. **La gráfica del BIB y del látice muestra datos crudos.** Son cajas de los datos por tratamiento (`valoresPor`),
   mientras los cuadros dan medias ajustadas. En el látice del ejemplo son 24 cajas de 3 datos que mezclan el efecto de
   los bloques. Convendría graficar las medias ajustadas con su EE o IC.
5. **El semáforo de «Parcelas divididas (modelo mixto)» revisa poco las varianzas.** Aplica Levene con la mediana
   solo entre los niveles del primer factor fijo (A). No mira B ni las combinaciones A × B, que es donde un split-plot
   suele mostrar varianzas distintas.

### Revisión técnica, grupo R3

Fichas: mejores-subconjuntos, correlacion, matriz-correlacion, correlacion-parcial, tabla-contingencia, mcnemar,
mantel-haenszel, kappa, manova, discriminante, kaplan-meier, cox, autocorrelacion.

Método: cada ejemplo se corrió con el núcleo de la app (SP.ejecutar + reporte) y se compararon cuadros, semáforo,
conclusiones y gráficas (js/interfaz/analisis.js) con lo que dice la ficha; los textos de la interfaz, con
js/i18n/en.js; los ids de guías, con js/nucleo/guias.js. Validador: 13 de 13 sin problemas.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| mejores-subconjuntos | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | El último paso de la lectura remite ahora al botón «Analizar el modelo de…» (sale entre las gráficas y el cuadro), que lleva el modelo a la regresión lineal. En la redacción, la R² ajustada pasa de 0.84 a 0.85, que es lo que da el ejemplo (las demás cifras ya coincidían). |
| correlacion | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Comprobado: los cortes de Cohen, exacto/aproximado como cor.test, n ≈ 85 para r = 0.3 y la coherencia interna de t(38) y del IC del ejemplo. |
| matriz-correlacion | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Holm por omisión, IC solo con Pearson, prueba bilateral y faltantes «completas/pares», como en el código. |
| correlacion-parcial | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Verificado que gl = n − 2 − k (ppcor), las dos semiparciales, Spearman sobre rangos (también los controles) y la gráfica de variable agregada. |
| tabla-contingencia | ✓ | ✗→corregido | ✓ | ✓ | ✓ | ✓ | ✓ | La teoría dice ahora cuándo se calcula Fisher en tablas r × c: hasta 5000 casos, y solo si alguna esperada es menor que 5 o hay 300 casos o menos (antes decía «pocos casos», sin límite). |
| mcnemar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno (corrección solo con b ≠ c y Bowker sin los pares vacíos, como dice la ficha). |
| mantel-haenszel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno (corrección por continuidad, IC de Robins, Breslow y Greenland, Breslow-Day con Tarone y el estadístico generalizado I × J × K, todo comprobado). |
| kappa | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✓ | El supuesto «Mismas categorías y, para la ponderada, en orden» avisa ahora que una categoría que solo usó el evaluador 2 queda al final de la tabla. Pide revisar el orden en la tabla cruzada antes de leer la ponderada y poner como evaluador 2 al que no usó alguna categoría. «balance» dice lo mismo. Cohen (1968): el título de la ficha es el del registro DOI y se deja así (ver hallazgo 9). |
| manova | ✓ | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | «balance» decía que los factores entran en la SC secuencial «en el orden en que los elegiste». En realidad entran en el orden de sus columnas en la tabla (la interfaz junta las casillas marcadas en el orden del formulario). Corregido en ES y EN. F(12, 15) del ejemplo coincide con el error de las medias por parcela (6 gl), como recomienda la ficha. |
| discriminante | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La guía «valor-propio» explica la curvatura de una superficie de respuesta y no sirve aquí. Se cambia por «chi2» (M de Box): las guías quedan [chi2, p, n]. |
| kaplan-meier | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La teoría decía que la mediana y los cuartiles salen «con sus intervalos». El cuadro solo da el IC de la mediana; ahora dice «la mediana con su intervalo y los cuartiles 25 % y 75 %». |
| cox | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Comprobados el semáforo (riesgos proporcionales global, eventos por coeficiente 10/5, convergencia), las tres pruebas globales, la C de Harrell y la tabla de cox.zph. |
| autocorrelacion | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. El método no tiene semáforo (semaforo: []) y la ficha no dice que lo tenga. Coinciden los rezagos por omisión (10·log10 n y 10 para Box), h − fitdf gl y que no admite faltantes ni tiempos repetidos. |

Resumen: 6 de 13 fichas con algo que corregir. Ningún modelo, hipótesis ni referencia estaba mal. Todo lo corregido
eran precisiones sobre lo que la app hace de verdad: cuándo se calcula Fisher, el orden de los factores en la MANOVA,
el orden de las categorías en kappa, los IC de los cuartiles en Kaplan-Meier y el botón de mejores subconjuntos.
Además, una guía que no correspondía (discriminante).

#### Hallazgos sobre la app

1. **Kappa ponderada con el orden equivocado (error de cálculo).** En contingencia.js, analizarMcnemar (que también
   usa analizarKappa) une las categorías de las dos columnas así: primero las del evaluador 1, en su orden, y después,
   al final, las que solo aparecen en el evaluador 2. Si el evaluador 1 no usó la categoría más baja, esa categoría
   queda al final de la tabla y la ponderación usa un orden que no es el real.
   - Prueba hecha: el evaluador 1 usa leve, media y alta, y el evaluador 2 además «sana». La tabla queda
     [leve, media, alta, sana] y la kappa ponderada cuadrática sale 0.029; con el orden natural sería 0.789.
   - Declarar los niveles en los tipos no lo arregla, porque los niveles sin datos se pierden.
   - Posible arreglo: ordenar la unión con los niveles del evaluador 2 cuando sean compatibles, o avisar cuando el
     orden no sale de una sola columna.
   - McNemar y Bowker no cambian con el orden; solo se ve en el orden de la tabla.
2. **Notas contradictorias en la tabla de contingencia.**
   - Con frecuencias no enteras aparecen a la vez «la prueba exacta de Fisher no aplica» y «…la ji cuadrada es
     aproximada; usa la prueba exacta de Fisher».
   - En tablas r × c con más de 5000 casos y esperadas menores que 5, la nota también recomienda Fisher, pero la app no
     la calcula (ch.n <= 5000) y no explica por qué falta.
3. **MANOVA: el orden de los factores no es el que el usuario elige.** Para la SC tipo I, los factores entran en el
   orden de sus columnas en la tabla, no en el orden en que se marcan; la interfaz no lo dice. Con desbalance cambia
   la prueba de cada término.
4. **Autocorrelación: la conclusión se corta.** Solo nombra los primeros 8 rezagos fuera de la banda (fuera.slice(0, 8)),
   sin «…». Con estacion-mensual omite el rezago 12 (r = 0.76), que es justo el del ciclo anual.
5. **Guías (js/nucleo/guias.js):**
   - «valor-propio» solo habla de superficies de respuesta. No hay guía para los valores propios de E⁻¹H de la MANOVA
     ni para el valor singular y la proporción de la traza del discriminante.
   - «cmh» dice «dos factores de dos niveles», aunque la app también hace el estadístico generalizado I × J × K.
   - «kappa» dice «0.61–0.80 sustancial» y el reporte dice «considerable». Además, el corte cae distinto: 0.60 es
     «considerable» en el reporte y «moderado» en la guía.
6. **Kaplan-Meier, Cox y autocorrelación usan α = 0.05 fijo.** Deciden con 0.05 en las conclusiones (y Cox en el
   semáforo) y no tienen la opción «Nivel de significancia» que sí tienen las demás familias.
7. **Kaplan-Meier:** los IC de los cuartiles 25 % y 75 % se calculan (cuantiles inf/sup), pero el cuadro solo muestra
   los de la mediana. No es un error; sería fácil mostrarlos.
8. **Bowker (cosmético):** en el cuadro de la prueba, la fila se llama «simetría de Bowker», con minúscula
   (T('simetría de Bowker') se usa también dentro de la oración).
9. **Cohen (1968), que estaba «por verificar».**
   - El registro del DOI 10.1037/h0026256 (Crossref/APA) titula el artículo «Weighted kappa: Nominal scale agreement
     provision for scaled disagreement or partial credit», sin «with». Así está en la ficha.
   - js/nucleo/informe.js usa «…agreement with provision for…», la forma más citada (Wikipedia, por ejemplo).
   - Las dos remiten al mismo artículo. Si se quiere unificar, la del DOI es la del registro.

### Revisión del grupo R4 (series, mixtos, genéticos y GLMM en bloques)

Revisé cada ficha contra `js/metodos/series.js`, `arima.js`, `mixtos.js`, `medidas-repetidas.js`, `geneticos.js` y `glmm.js`, el núcleo (`js/nucleo/series.js`, `arima.js`, `reml.js`) y la interfaz (`js/interfaz/analisis.js`, Datos). Los ejemplos de los métodos JS los corrí en node. En los del motor R (mixtos, medidas repetidas y glmm-bloques) corrí el código que arma `preparar()` en el R 4.4.2 local (lme4, lmerTest, nlme, emmeans y car) y pasé su salida por `leer()` y `reporte()`. Todos corren con las entradas de la ficha y la tabla `formato` copia filas reales del conjunto. El validador da 13 de 13.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| descomposicion | ✓ | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✓ | notaFormato (ES/EN): «Ancha ⇄ larga» deja los datos ordenados por mes y luego por año, y Datos no tiene herramienta para ordenar filas. Ahora se indica crear con «Variable calculada» una columna de tiempo continua, (anio - 2017) * 12 + mes, y usarla como columna del tiempo |
| tendencia | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno |
| arima | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno (redacción ilustrativa cercana al resultado real) |
| modelo-mixto | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | EN: «traffic light» → «assumptions checklist» (supuestos e interpretación); «18 %» → «18%» |
| mixto-bloques | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✗→corregido | ✓ | Teoría e interpretación: el formulario del diseño no tiene «Dentro de cada nivel de»; se remite al modelo mixto con fórmula. Supuesto singular: si la varianza de bloques es 0, el modelo junta bloques y error, así que las conclusiones son «parecidas», no «las mismas». Mínimo y error frecuente: con 2 o 3 bloques el ajuste «puede» quedar singular (antes decía que la varianza sale siempre en cero). Redacción: con el ejemplo, la media más alta es la de 120 y no difiere de 180. EN: terminología y «%» |
| mixto-divididas | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | Teoría e interpretación: sin «Dentro de cada nivel de» en el formulario; se remite al modelo mixto con fórmula. Supuesto singular: con σ²w = 0 la prueba de la parcela grande no es «equivalente» a la clásica (va contra el error de subparcela); la clásica es la referencia conservadora. EN: terminología |
| mixto-latice | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | EN: terminología del semáforo y «%» |
| mixto-localidades | ✓ | ✗→corregido | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | gl del denominador de los genotipos: con datos completos son los de G × L, (g − 1)(l − 1) (117 en el ejemplo), no «el número de localidades». Interpretación: los genotipos son fijos y no tienen varianza; se compara σ²GL con la de localidades y la residual. Teoría: los BLUP solo salen si no pasan de 120 renglones; en el ejemplo hay 196 y no aparecen. EN: terminología y «%» |
| medidas-repetidas | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | Redacción: «desde los 30 días» (con el ejemplo, N0 ya difiere a los 30 días). EN: terminología |
| componentes-varianza | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | Redacción: decía que la varianza de repeticiones salió en cero, pero con el ejemplo es el 44 % (p = 0.006). Se usan las cifras reales con la advertencia de que con 3 repeticiones esa varianza es imprecisa (EE 0.13). EN: terminología y «%» |
| heredabilidad | ✓ | ✓ | ✗→corregido | ✗→corregido | ✓ | ✗→corregido | ✓ | Error frecuente: la app solo se detiene con una parcela por genotipo y ambiente; si no se indica la repetición, su variación pasa al error, sin aviso. Interpretación: el cuadro ya viene ordenado por BLUP, y el número seleccionado se redondea (con 24 genotipos y 10 % son 2). EN: terminología y «%» |
| repetibilidad | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | EN: terminología del semáforo |
| glmm-bloques | ✓ | ✓ | ✗→corregido | ✓ | ✓ | ✗→corregido | ✓ | EN: «the checklist» → «the assumptions checklist» (la redacción coincide con el resultado real: χ²/gl = 2.12, Wald 16.07, tasas 1.39 y 7.28, varianza de bloques 0) |

Notas de verificación:
- **Semáforo:**
  - descomposicion y tendencia no tienen semáforo, y sus fichas no lo mencionan.
  - arima: solo Ljung-Box (más «Ajuste» si hay avisos).
  - Mixtos lme4: SW de los residuos, SW de los BLUP del primer agrupamiento con 5 niveles o más, Levene (mediana) entre niveles del primer factor fijo y ajuste.
  - medidas-repetidas: SW y Levene entre fechas, sobre residuos normalizados.
  - Genéticos: SW, SW de los BLUP del primer término, atípicos > 3.5 DE y ajuste REML (sin Levene).
  - glmm: sobredispersión o dispersión, atípicos de Pearson > 3 y ajuste.

  Las fichas corresponden a esto.
- Las guías y los ids de `verificar`, `alternativa` y `relacionados` existen (validador).
- Referencias: todas reales, con autores, año, revista, volumen y páginas correctos. Kendall y Stuart (1983) es la misma que citan `decompose` de R y `informe.js`.

#### Hallazgos sobre la app (nuevos)

1. **Los diseños mixtos no ofrecen «Dentro de cada nivel de», pero la nota lo pide.** Afecta a mixto-bloques, mixto-divididas, mixto-latice y mixto-localidades: `formDisenoMixto` llama a `formCompararMx(..., false)` en `analisis.js` (~l. 603). Aun así, la nota del cuadro de medias (`mixtos.js` l. 316) dice «para comparar dentro de cada nivel usa «dentro de»» cuando el factor interactúa. Pasa con el ejemplo de parcelas divididas (avena: variedad × nitrógeno). Las opciones del método ya aceptan `dentro` (`OPCIONES_DIS` hereda de `OPCIONES`). Basta con mostrar la casilla en esos formularios, o cambiar la nota para remitir al modelo mixto con fórmula.
2. **«Ancha → larga» desordena las series de tiempo sin aviso.** Apila por columna (`reformar.js` aLarga, como `stack()`): una tabla años × meses queda ordenada por mes y luego por año. En descomposición, ARIMA y Mann-Kendall, la opción «— las filas ya están en orden —» analiza entonces una serie desordenada, y Datos no tiene herramienta para ordenar filas. Sugerencia: en «Ancha → larga», una opción para ordenar por unidad (fila de origen y luego medida), o permitir año + mes como tiempo en los métodos de series.
3. **El cuadro de BLUP desaparece sin nota.** En los mixtos de lme4 se omite cuando pasa de 120 renglones (`mixtos.js` l. 330, sin `else`). Con mixto-localidades y avena-ambientes (140 + 42 + 14 = 196 BLUP), el usuario no sabe por qué no aparece. Conviene una nota del tipo «BLUP omitidos: más de 120 niveles; están en el código R».

### Revisión técnica, grupo R5 (GLM, GLMM, no lineal y superficies)

Fichas revisadas contra `js/metodos/generalizados.js`, `glmm.js`, `nolineal.js` y `superficie.js` y su núcleo (`js/nucleo/glm.js`, `nolineal.js`, `superficie.js`), además de las gráficas y los formularios de `js/interfaz/analisis.js`. El ejemplo de cada ficha se corrió con el código de la app (Node) y se compararon los cuadros, el semáforo y las conclusiones con lo que dice la ficha. En `glmm` se ejecutó en R 4.4.2 local (lme4 1.1.35.5) el código que arma `preparar()`. Corre sin errores y da θ = 5.51, χ² de Wald = 16.8 con 4 gl, p = 0.0021 y ajuste singular, como dice la ficha. Las cifras de español e inglés se compararon campo por campo: son las mismas. El validador pasa las 13 fichas.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| glmm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Se comprobó en R el código de `preparar()` (glmer.nb, Anova tipo II con la covarianza RX, prueba de razón de verosimilitudes contra glm.nb). |
| glm-conteos | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | En la redacción, la p de Tukey de Testigo / Spinosad era «= 0.001». La app da 0.0006, así que ahora dice «< 0.001» (ES y EN). |
| glm-proporciones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Las cifras de la redacción coinciden con el ejemplo (χ² = 242, χ²/gl = 1.18, 0.945 contra 0.28, OR = 44). |
| glm-gamma | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. Las F(2, 36), F(3, 36) y F(6, 36) y la razón B/A ≈ 2.1 coinciden. |
| glm | ✗→corregido | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Al término «g» le faltaba el enlace 1/μ² (el canónico de la gaussiana inversa): se agregó (ES y EN). |
| curva-crecimiento | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. El formato ancho copia filas reales. |
| dosis-respuesta | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. DE50 de 75 y 174 con sus IC y F(1, 48) = 29.4 para «e común» coinciden. |
| respuesta-meseta | ✗→corregido | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | La teoría decía que «la dosis óptima y la meseta llevan su EE por el método delta». En lineal-meseta, la dosis óptima es el parámetro x0 (EE de la covarianza), y el método delta se usa para la meseta y para la dosis óptima de cuadrático-meseta. Se precisó (ES y EN). |
| superficie-respuesta | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La redacción traía cifras que no salen del ejemplo (96 %, F = 0.2, valores propios −2.1 y −4.3, N = 205, K = 160, 63.5 t/ha). Se cambiaron por las del ejemplo: 97.5 %, R² aj. = 0.96, F(3, 4) = 0.04, p = 0.99, −2.4 y −4.1, N = 211, K = 166, 63.8 (62.6 a 64.9). |
| ascenso-pronunciado | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Ninguno. La redacción describe un factorial 2² con 5 centros (gl coherentes) y está marcada como ilustrativa. |
| diseno-superficie | ✓ | n/a | ✓ | ✓ | ✓ (null) | ✓ | ✓ | Ninguno. CCD rotable de 3 factores con 20 corridas, α = 1.682 y 6 centros, igual que la app. Grados del látice 2–4, como en el formulario. |
| mezclas | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La redacción traía β = 18.5 y −9.0 y la mezcla 28/72 con 17.2. Ahora dice β = 19.0 y −9.6 (p = 0.005) y la mezcla 29/71 con 17.4 (16.4 a 18.4). También menciona la sinergia polietileno × polipropileno (β = 11.4, p = 0.002), que la app marca y la redacción omitía. |
| deseabilidad | ✓ | n/a | ✓ | ✓ | ✓ | ✗→corregido | ✓ | La redacción traía N = 170, riego 26.5, D = 0.77 y d = 0.54, 0.78 y 0.98. Ahora tiene las cifras reales: 176 y 25.9, D = 0.79, rendimiento 79.5 (d = 0.59), costo 11.7 (d = 0.82) y pH 6.5 (d = 1.00). |

Notas de la verificación (sin cambios):
- La clasificación (respuesta, estructura, diseños), los relacionados, las ids de `verificar`/`alternativa` y las guías existen y tienen sentido.
- Los semáforos que describen las fichas coinciden con los del código: sobredispersión, dispersión, atípicos y ajuste en GLM y GLMM; convergencia y atípicos en los no lineales; falta de ajuste, atípicos y punto estacionario en superficies. Mezclas tiene falta de ajuste y atípicos, y deseabilidad no tiene semáforo.
- Las gráficas citadas existen: residuos de Pearson contra ajustados (GLM y GLMM), curva sobre los puntos y residuos (no lineal), contornos, 3D, cresta y residuos (superficie), triángulo y traza de Cox (mezclas), contornos de D (deseabilidad).
- Los nombres de menú y opciones citados existen en ES y EN: «Ancha ⇄ larga…», «ƒ Variable calculada…», «↻ Transformar…» (Box-Cox), «El de menor AIC», «Dosis en escala logarítmica en la gráfica», «Dentro de cada nivel de», «Automática», «Sí, siempre».
- Las medias de las cuasi y de la gaussiana inversa se comparan con z, y las de la gamma con t. Esto coincide con emmeans 1.10.6 (df = Inf salvo en Gamma; comprobado en R), así que no es un error.
- Las referencias (autores, año, título, revista, volumen y páginas) se revisaron una por una y todas son correctas.

#### Hallazgos sobre la app

1. `js/nucleo/superficie.js`, `mezclas()` (~l. 356): el aviso «Las mezclas no permiten estimar el modelo {m}» recibe `o.modelo` crudo. El usuario lee «modelo cubico-especial» o «modelo cuadratico», sin acento y sin traducir en la interfaz en inglés. Debería usar el nombre (`MODELOS_MEZCLA` de `js/metodos/superficie.js`). Se reproduce con hilo-mezcla y el modelo cúbico especial.
2. `js/metodos/superficie.js`, semáforo «Punto estacionario» (~l. 138): queda en verde («Está dentro de la región experimental») aunque el punto no sea del tipo que se busca, por ejemplo un máximo con el objetivo «mínima». La conclusión sí lo maneja, porque usa la cresta. Con tomate-superficie y `objetivo: 'minimo'`, el semáforo sale verde y la conclusión da la menor respuesta sobre la cresta a 1.5 del centro. Conviene que el semáforo compare la naturaleza del punto con el objetivo.

### Revisión R6: multiambiente, potencia y muestreo

Revisé contra `js/metodos/multiambiente.js`, `js/nucleo/multiambiente.js`, `js/metodos/potencia.js`, `js/nucleo/potencia.js`,
`js/metodos/muestreo.js`, `js/nucleo/muestreo.js`, los formularios y gráficas de `js/interfaz/analisis.js` y `js/i18n/en.js`.
Corrí cada ejemplo en node con el núcleo de la app y comparé las cifras de redacción con la salida real. El validador pasa
con las 13 fichas.

| Ficha | Modelo | Hipótesis | Supuestos | Datos | Ejemplo | Interpretación | Referencias | Cambios hechos |
|---|---|---|---|---|---|---|---|---|
| ensayos-multiambiente | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Cifras de la redacción tomadas de la salida real: F(117, 252) = 2.8 (decía 2.7), F(9, 117) = 5.4 (decía 5.2), razón máx./mín. 6.7 (decía 6.5). Se aclara que la gráfica de cada genotipo solo aparece con 12 genotipos o menos (ES/EN). |
| dos-etapas | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Wald F(9, 117) = 6.0 (decía 6.1; la app da 5.99) (ES/EN). |
| estabilidad | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Ecovalencia de G3 = 2.3 % (decía 2.4) y Wi = 108 % (decía 107). El primer paso de lectura remitía a la G × A «en el análisis conjunto», pero el reporte de estabilidad no trae ese cuadro: ahora dice que se lee en el análisis conjunto de varios ambientes, que este reporte no repite (ES/EN). |
| ammi | ✓ | ✓ | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Los dos primeros ejes explican 66 % (decía 65; la app da 66.22 %) (ES/EN). |
| gge | ✓ | ✓ (sin pruebas) | ✗→corregido | ✓ | ✓ | ✓ | ✓ | En «Errores comparables entre ambientes» se aclara que el biplot no usa los errores y que el semáforo solo avisa si un ambiente es mucho menos preciso (ES/EN). |
| potencia-medias | ✗→corregido | ✓ | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: continua → ninguna. Teoría: en la prueba bilateral no se suma la cola opuesta (strict = FALSE de power.t.test), así que no es exactamente «exacto» (ES/EN). |
| potencia-anova | ✓ | ✓ | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: continua → ninguna. Ejemplo comprobado: n = 4.915 → 5, f = 0.84. |
| potencia-proporciones | ✓ | ✓ | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: binaria → ninguna. Ejemplo comprobado: n = 137.9 → 138, h = 0.34. |
| potencia-correlacion | ✓ | ✓ | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: continua → ninguna. Cifras comprobadas: 28.25 / 84.07 / 781.8 pares para ρ = 0.5 / 0.3 / 0.1; r detectable con 40 pares = 0.4265. |
| repeticiones | ✓ | ✓ | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: continua → ninguna. Ejemplo comprobado: 11 repeticiones (CV 12, d 15, 6 trat., DBCA). |
| tamano-muestra | ✓ | ✓ (sin hipótesis) | ✓ | ✓ | ✓ (null) | ✓ | ✓ | `respuesta`: continua → ninguna. Limitación nueva: en proporciones, la corrección exacta de Cochran es n₀/[1 + (n₀ − 1)/N] y la app usa n₀/(1 + n₀/N), que da menos de una unidad por debajo (ES/EN). Ejemplo comprobado: 238 (323 sin corrección). |
| muestreo-simple | ✓ | ✓ (sin hipótesis) | ✓ | ✓ | ✗→corregido | ✓ | ✓ | El conjunto aguacate-huertas es una muestra por huerta, no proporcional (12, 16 y 10 árboles de 420, 900 y 260). La ficha lo usaba como muestra aleatoria simple y caía en el error que ella misma advierte. Ahora `notaFormato` lo dice (media simple 51.9 frente a 54.3 estratificada) y la redacción aclara «como si los 36 árboles se hubieran tomado al azar de toda la plantación» (ES/EN). Las cifras coinciden con la app. |
| muestreo-estratificado | ✓ | ✓ (sin hipótesis) | ✓ | ✓ | ✓ | ✗→corregido | ✓ | Límite superior del IC: 56.6 (decía 56.7; la app da 56.6499) (ES/EN). |

Comprobaciones hechas sin cambios:
- Los modelos (TeX) coinciden con el código:
  - λ = n·Σ(μᵢ − μ̄)²/σ² y f con divisor k;
  - la potencia de proporciones con √(2p̄(1 − p̄));
  - pwr.r.test con la corrección ρ/(2(n − 1));
  - r ≥ 2(t₁ + t₂)²(CV/d)² con t₂ = qt(potencia);
  - V(ȳ_st) = Σ W²(1 − f)s²/n y Neyman n·N_h·s_h/Σ N_h·s_h;
  - el modelo de dos etapas con REML + GLS;
  - Gollob g + e − 1 − 2k;
  - los puntajes simétricos;
  - el GGE centrado por ambiente.
- Los nombres de la interfaz que citan las fichas existen en ES y EN. Son «Ancha ⇄ larga…», «Filtrar filas…», «↻ Transformar…», «Calcular un tamaño de muestra o una potencia», los cuadros y los semáforos.
- Los ids de `verificar`, `alternativa` y `guias` existen.
- Todas las referencias son reales y sus datos están bien: Cochran (1977), Cochran y Cox (1957), Cohen (1988), Champely (2020), Fisher (1921), Fleiss et al. (2003), Neyman (1934), Satterthwaite (1946), Lohr (2010), Thompson (2012), McIntosh (1983), Crossa (1990), Möhring y Piepho (2009), Yan et al. (2007), Gabriel (1971) y las que ya cita `informe.js`.

#### Hallazgos sobre la app

1. **Corrección por población finita en proporciones (tamano-muestra), contra Cochran.**
   - No pude ver la página del libro de 1977 (sec. 4.4), así que no doy cita textual.
   - Sí confirmé la fórmula por dos vías:
     - Despejando n de d = z·√V(p), con la varianza de p del muestreo aleatorio simple de Cochran, V(p) = [(N − n)/(N − 1)]·PQ/n. Sale n = n₀/[1 + (n₀ − 1)/N].
     - Con una fuente secundaria: Israel (1992, *Determining sample size*, PEOD-6) atribuye a Cochran (1963, p. 75) exactamente «n = n₀ / [1 + (n₀ − 1)/N]».
   - Para medias, n₀/(1 + n₀/N) sí es la forma exacta (con S² de divisor N − 1).
   - La app (`js/nucleo/muestreo.js` l. 31; nota del cuadro y código R en `js/metodos/muestreo.js` l. 32 y 37) usa n₀/(1 + n₀/N) también en proporciones.
   - La diferencia siempre es menor que una unidad: en el ejemplo, 237.53 contra 237.72, y las dos redondean a 238. Tras el redondeo puede faltar a lo más una unidad.
   - Sugerencia: para `tipo: 'proporcion'`, usar n₀/[1 + (n₀ − 1)/N] y ajustar la nota y `codigoR`.
2. **Número de ecuación equivocado en un comentario.** `js/nucleo/muestreo.js` (l. 10) cita «gl efectivos de Satterthwaite (5.42)». En Cochran (1977, 3.ª ed.) la fórmula de n_e es la ec. (5.16), sec. 5.4, p. 96; lo verifiqué en un escaneo del cap. 5. Solo afecta al comentario; la fórmula del código es la correcta.
3. **El conjunto `aguacate-huertas` no es una muestra aleatoria simple de la plantación.** Se muestrearon 12, 16 y 10 árboles de huertas con 420, 900 y 260.
   - Aun así, su descripción y `tests/codigo-r.mjs` (l. 262) lo usan con muestreo-simple para la proporción de árboles con trips.
   - La estimación simple queda sesgada. Rendimiento: 51.9 kg contra 54.3 de la estratificada. Trips: 0.158 contra 0.110 de la estratificada.
   - Es justo el error que la ficha (y el método) advierten.
   - Sugerencia: agregar un conjunto de muestreo aleatorio simple, o describir este como «para comparar el simple con el estratificado».
4. **AMMI: dos conteos distintos de «ejes significativos por Gollob».**
   - La conclusión cuenta solo los ejes significativos consecutivos desde el primero (`js/metodos/multiambiente.js` l. 204).
   - `waas()` (`js/nucleo/multiambiente.js` l. 347) usa el total de ejes con p < α, como metan, y toma los k primeros.
   - Si un eje no significativo queda entre ejes significativos, el WAAS incluye un eje no significativo y su número difiere del que da la conclusión. En el ejemplo coinciden (4).
5. **El reporte de estabilidad no incluye la prueba de G × A.** No trae el ANOVA conjunto ni las conclusiones base, cuando lo primero que hay que saber es si hay interacción. Mejora: añadir `conclusionesBase(r)`, o al menos la línea de G × A, en el reporte de estabilidad.
6. **GGE: la conclusión llama «megaambientes» a los sectores del polígono de una sola tabla.**
   - En el ejemplo da «4 megaambientes»: uno con 9 de los 14 ambientes y otro con un solo ambiente.
   - No advierte que un megaambiente exige que el patrón se repita entre años (Yan y Tinker, 2006).
   - Sugerencia: «sectores (posibles megaambientes)».
