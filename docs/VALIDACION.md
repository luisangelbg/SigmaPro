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

Casos en que la referencia no es la función de R tal cual, porque R mismo es menos preciso por diseño
o por redondeo. En los tres, el valor de SigmaPro se comprobó con la propia función de distribución de R o
con una identidad exacta.

| Función | Qué pasa en R | Cómo se valida |
|---|---|---|
| Cuantil del rango estudentizado (`qtukey`) | Su iteración se detiene con tolerancia 1e-4; se desvía hasta 2.7e-7 de su propio `ptukey`. | Referencia = inversión exacta de `ptukey` con `uniroot` a 1e-14 (dif. 6e-12). Un caso aparte contra `qtukey` tal cual: dif. 7.5e-8, dentro del criterio. |
| Cuantil de la binomial justo en un salto (`qbinom`) | Con n impar y prob = ½, P(X ≤ (n − 1)/2) = ½ exactamente; el `pbinom` de R da 0.5 − 2.2e-15 con n = 51 y su `qbinom(0.5, 51, 0.5)` responde 26 en vez de 25. | Referencia = (n − 1)/2 exacto por simetría; la rejilla general (378 valores) se compara contra `qbinom` tal cual. SigmaPro tolera 1e-12 relativo en el salto, que cubre el redondeo de su propia binomial con n de miles. |
| Cuantil de t con menos de 1 gl y colas diminutas (`qt`) | `pt(qt(1e-8, 0.5, lower.tail = FALSE), 0.5, lower.tail = FALSE)` da 9.99999986e-9: error relativo 2.9e-8. | Referencia = inversión exacta de `pt` en escala logarítmica (dif. 2.8e-14). |

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

Dos convenciones de R que la app sigue a propósito: los números se muestran y se copian con 15 cifras
significativas, como `as.character()` (0.1 + 0.2 se ve «0.3»), y los niveles sin observaciones (por un filtro
o por la edición) se quitan antes del análisis, como `droplevels()`.

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
```

En Windows, `tests/pruebas.ps1` encuentra R, node y el navegador y corre todo.

## Regla de liberación

Un método **no aparece en la app** hasta que tiene casos de validación y todos aprueban
(`SP.metodoDisponible`, que lee el reporte generado en `js/generado/validacion.js`).

## Nombres

Por la regla de la suite, en el código, la interfaz y los reportes no se nombran programas comerciales:
los ejemplos publicados se citan por su libro o artículo.
