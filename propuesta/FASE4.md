# SigmaPro — Fase 4 detallada

Plan de la cuarta fase (4 de octubre de 2026), después de la Fase 3, su ampliación (Hitos 3.6 a 3.9) y el manual de
usuario (versión 0.3.3). Reúne las mejoras que `docs/PENDIENTES.md` dejaba para versiones futuras en los análisis más
usados en un ensayo agronómico: la regresión no lineal, los ensayos multiambiente, las superficies de respuesta, los
modelos generalizados y el asistente; al final, la interfaz en inglés. Se valida contra R con la misma regla de
siempre (1e-6, `docs/VALIDACION.md`).

Contenido: 1. Decisiones · 2. Métodos · 3. Validación · 4. Orden de construcción · 5. Riesgos.

## 1. Decisiones

| # | Tema | Decisión |
|---|---|---|
| 1 | Motor | Lo nuevo de la regresión no lineal, el multiambiente, las superficies y el GLM corre en el núcleo JS, como lo que ya está. Lo del GLMM (cuadratura de Gauss-Hermite, gamma, prueba de cada aleatorio) va en el motor R, donde ya corre el GLMM. |
| 2 | Referencias | Paquetes instalados en el R de escritorio (4.4.2): stats (nls con su perfil, glm, `confint`), drc (Michaelis-Menten y Brain-Cousens), metan (WAAS, Annicchiarico, Huehn, la imputación EM-AMMI), agricolae (Kang), lme4. Lo que necesitaría paquetes no instalados (rsm, desirability, mixexp, brglm2) se escribe en R base con otro algoritmo que el de la app: los diseños con `expand.grid`, la deseabilidad con `optim` desde varios puntos, Firth maximizando la verosimilitud penalizada con `optim` y pulida con Newton. No se instalan ni se actualizan paquetes de R. |
| 3 | Superficies 3D | La superficie se dibuja en SVG propio (malla en perspectiva con giro), sin bibliotecas: con doble clic ninguna petición sale del equipo. |
| 4 | Idioma | La interfaz en inglés usa el catálogo que `SP.T` ya prevé (clave = texto en español). Es el último hito: mientras tanto todo texto nuevo pasa por `SP.T`. |
| 5 | Versión | Al cerrar los hitos de cálculo (4.0 a 4.4): 0.4.0. La 1.0.0 queda para la publicación. |

## 2. Métodos

**Regresión no lineal** (Hito 4.0)
- Michaelis-Menten (2 parámetros y con límite inferior, como `drc::MM.2` y `MM.3`) en la respuesta con meseta.
- Brain-Cousens (hormesis, 4 y 5 parámetros, como `drc::BC.4` y `BC.5`) en dosis-respuesta, con la DE50 y la dosis
  de máxima estimulación.
- Pesos por observación (columna), como `nls(weights = )`.
- Intervalos por verosimilitud perfilada, como `confint()` de nls (perfil de t con el método de MASS).
- Elegir el modelo por AIC: ajusta todos los de la familia y los ordena.
- Lineal-meseta con grupos: la prueba de cada parámetro común.
- Dosis económica óptima con el precio del producto y del insumo (cuadrático-meseta, lineal-meseta, Mitscherlich y
  Michaelis-Menten), con su EE por el método delta.
- Gráfica con el eje de la dosis en escala logarítmica.

**Ensayos multiambiente** (Hito 4.1)
- Imputación EM-AMMI de las celdas genotipo × ambiente vacías, como `metan::impute_missing_val`.
- Estadísticas no paramétricas de Huehn (S1, S2, S3, S6), como `metan::Huehn`; suma de rangos de Kang (YS), como
  `agricolae::stability.par`; índice de confianza de Annicchiarico, como `metan::Annicchiarico`.
- WAAS (promedio ponderado de las puntuaciones AMMI) y WAASY, como `metan::waas`.
- Análisis en dos etapas: medias por ambiente con su varianza y el análisis conjunto ponderado con una varianza por
  ambiente.
- GGE: las vistas «comparar dos genotipos» y «genotipo ideal» / «ambiente ideal» (distancias al ideal).

**Superficies de respuesta** (Hito 4.2)
- Generador de diseños: central compuesto (α rotable, ortogonal o de cara centrada; con bloques y centros) y
  Box-Behnken, en unidades codificadas y reales, con orden aleatorio por semilla; se abre en Datos.
- Codificación a mano (centro y semirrango de cada factor).
- Mezclas: diseños simplex-látice y simplex-centroide y los modelos de Scheffé (lineal, cuadrático, cúbico especial).
- Deseabilidad de varias respuestas (Derringer-Suich: maximizar, minimizar o un valor meta) y la mejor combinación.
- Superficie en 3D, además de las curvas de nivel.

**Modelos generalizados** (Hito 4.3)
- GLM: intervalos por verosimilitud perfilada (como `confint()` de glm); Firth para la separación completa en la
  binomial; la gaussiana inversa y los enlaces de potencia.
- GLMM (motor R): cuadratura adaptativa de Gauss-Hermite (nAGQ > 1 con un solo efecto aleatorio), la familia gamma y
  la prueba de razón de verosimilitudes de cada efecto aleatorio.

**Asistente** (Hito 4.4)
- Reconoce en los datos las parcelas divididas (un factor constante dentro de cada parcela grande del bloque) y las
  franjas, y lo propone sin preguntarlo.

**Interfaz en inglés** (Hito 4.5)
- Catálogo inglés de todos los textos y el selector de idioma en la barra, como en las demás apps de la suite.

## 3. Validación

Casos en `tests/casos/<familia>/` con su generador en R, como siempre. Clase A para las fórmulas cerradas
(estadísticas de estabilidad, WAAS, diseños, deseabilidad en un punto, Scheffé), clase D para lo iterativo (perfiles,
Firth, EM-AMMI, la búsqueda de la mejor deseabilidad, el GLMM). Cada método trae su conclusión, cuadros, supuestos,
figuras, párrafo con citas y el código R equivalente, que `tests/codigo-r.mjs` corre.

## 4. Orden de construcción

| Hito | Contenido |
|---|---|
| 4.0 | Regresión no lineal: Michaelis-Menten, Brain-Cousens, pesos, IC perfilados, elección por AIC, dosis económica, eje logarítmico |
| 4.1 | Multiambiente: EM-AMMI, Huehn, Kang, Annicchiarico, WAAS, dos etapas, vistas del GGE |
| 4.2 | Superficies: generador de diseños, codificación a mano, mezclas, deseabilidad, superficie 3D |
| 4.3 | Generalizados: IC perfilados, Firth, gaussiana inversa y enlaces de potencia; GLMM con Gauss-Hermite, gamma y prueba de los aleatorios |
| 4.4 | Asistente: parcelas divididas y franjas desde los datos; cierre de los cálculos (0.4.0) |
| 4.5 | Interfaz en inglés |

## 5. Riesgos

1. **Perfiles de nls**: `confint` de nls usa el perfil de MASS con interpolación por splines; la app reproduce el
   perfil de t y busca la raíz exacta, y la referencia pide la raíz con `uniroot` sobre el perfil (`profile` con paso
   fino) para comparar a 1e-6.
2. **EM-AMMI**: el resultado depende del número de ejes y del criterio de paro; se usa el de metan (tolerancia y
   máximo de iteraciones explícitos) y se comparan las celdas imputadas.
3. **Firth sin paquete**: la referencia maximiza la verosimilitud penalizada con `optim` y la pule con Newton; la app
   usa la puntuación modificada (IRLS). Dos algoritmos distintos que deben llegar al mismo óptimo.
4. **Inglés**: más de 4 000 textos; se traduce por bloques y una prueba revisa que ningún texto visible quede sin su
   traducción.
