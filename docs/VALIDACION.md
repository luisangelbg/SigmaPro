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

Casos en que la referencia no es la función de R tal cual, porque R mismo es menos preciso por diseño.
En los dos, el valor de SigmaPro se comprobó con la propia función de distribución de R.

| Función | Qué pasa en R | Cómo se valida |
|---|---|---|
| Cuantil del rango estudentizado (`qtukey`) | Su iteración se detiene con tolerancia 1e-4; se desvía hasta 2.7e-7 de su propio `ptukey`. | Referencia = inversión exacta de `ptukey` con `uniroot` a 1e-14 (dif. 6e-12). Un caso aparte contra `qtukey` tal cual: dif. 7.5e-8, dentro del criterio. |
| Cuantil de t con menos de 1 gl y colas diminutas (`qt`) | `pt(qt(1e-8, 0.5, lower.tail = FALSE), 0.5, lower.tail = FALSE)` da 9.99999986e-9: error relativo 2.9e-8. | Referencia = inversión exacta de `pt` en escala logarítmica (dif. 2.8e-14). |

Nota: para la t con más de 4 × 10⁵ grados de libertad, R usa una aproximación normal corregida; SigmaPro usa la
beta incompleta exacta. Coinciden a 4.5e-11.

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
