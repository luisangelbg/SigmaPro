# SigmaPro — Fase 2 detallada

*3 de octubre de 2026 · continúa [`PROPUESTA.md`](PROPUESTA.md) (§12 era el anticipo). La Fase 1 cerró con el Hito 1.12
(commit 03a6172): 34 métodos del núcleo JS validados en 624 casos contra R, reporte, figuras, exportaciones, uso sin
conexión, 100 000 filas y accesibilidad AA.*

Contenido: 1. Decisiones técnicas · 2. Qué corre en JS y qué en el motor R · 3. Métodos de la fase · 4. El puente con
el motor R · 5. Validación · 6. Orden de construcción · 7. Riesgos.

---

## 1. Decisiones técnicas

| # | Tema | Decisión |
|---|---|---|
| 1 | Motor R | **webR v0.6.0** (R 4.6.0), fijado. Es la última versión estable publicada (3 oct 2026; `latest` apunta a la rama de desarrollo). Comprobado de nuevo por doble clic: R listo en 1.3 s, lme4 + lmerTest instalados en 11 s, `lmer` correcto. |
| 2 | Paquetes en el motor | Solo los indispensables: **lme4 2.0-1, lmerTest 3.2-1, pbkrtest 0.5.5, nlme 3.1-169, emmeans 2.0.3** y sus dependencias. Todo lo que se pueda hacer bien en JS se hace en JS (más rápido, sin internet, sin descargas). |
| 3 | Licencias | lme4, lmerTest, pbkrtest, nlme: GPL ≥ 2; emmeans, MASS: GPL-2 \| GPL-3. Dos dependencias son **solo GPL-2** (minqa, de lme4; numDeriv, de lmerTest). Se descargan en tiempo de ejecución como componentes de terceros (LICENSES-TERCEROS.md); en el repositorio propio de paquetes (cierre de la fase) van con su código fuente, como pide la GPL-2. glmmTMB (AGPL-3) y drc (GPL-2) no se usan. |
| 4 | Doble clic | El núcleo JS sigue funcionando sin internet. Los métodos del motor R piden internet la primera vez con doble clic (el navegador guarda la descarga en su caché); en GitHub Pages se instalan desde el repositorio propio y quedan sin conexión. |
| 5 | Privacidad | Igual que en la Fase 1: **ningún dato sale del navegador**. El motor R corre dentro de la página; la red solo trae código (R y paquetes). La prueba de privacidad se amplía al hilo del motor R. |
| 6 | Referencias | Siguen saliendo del R de escritorio (4.4.2). Las versiones de escritorio difieren de las del motor (lme4 1.1-35.5 frente a 2.0-1, emmeans 1.10.6 frente a 2.0.3); la prueba de viabilidad dio 12 cifras iguales. Si algún caso no aprueba por la versión, se igualan los paquetes de escritorio (con tu permiso) y se documenta. |

## 2. Qué corre en JS y qué en el motor R

| En el núcleo JS (sin internet, instantáneo) | En el motor R (webR) |
|---|---|
| GLM: binomial, Poisson, gamma, cuasi y binomial negativa (IRLS propio) | Modelos lineales mixtos generales (lme4 + lmerTest: Satterthwaite, Kenward-Roger) |
| Regresión no lineal y dosis-respuesta (Levenberg-Marquardt propio) | Medidas repetidas con estructuras de covarianza (nlme: simetría compuesta, AR(1), no estructurada, varianzas heterogéneas) |
| Superficies de respuesta (segundo orden, análisis canónico, cresta) | GLMM: glmer binomial y Poisson, con sobredispersión |
| Multiambiente y estabilidad: AMMI, GGE, Eberhart-Russell, Finlay-Wilkinson, Shukla, Wricke (de BreedingPro, ya validado) | Medias marginales y comparaciones de modelos mixtos (emmeans) |
| Componentes de varianza por REML en diseños comunes, heredabilidad, repetibilidad (REML propio de BreedingPro, validado contra lme4) | |

Cada ficha declara su motor; quien usa la app no tiene que saberlo. La app avisa cuando un análisis necesita el
motor R (y que la primera vez se descarga).

## 3. Métodos de la fase

**Modelos mixtos** (familia `mixtos`)
- Modelo lineal mixto desde una fórmula (`y ~ fijos + (1 | bloque)`): ANOVA de efectos fijos tipo III/II/I con gl de
  Satterthwaite o Kenward-Roger, coeficientes, componentes de varianza con su DE y correlaciones, BLUPs, prueba de razón
  de verosimilitudes de cada aleatorio, AIC/BIC, aviso de ajuste singular o sin convergencia.
- Diseños con efectos aleatorios desde un formulario: bloques al azar con bloques aleatorios, parcelas divididas
  (bloque y parcela grande aleatorios), látice y alfa-látice con recuperación de información interbloque, ensayos en
  varias localidades (localidad y G × L aleatorios).
- Medias marginales (emmeans) y comparaciones con letras, con los gl del modelo mixto.
- Medidas repetidas en el tiempo (nlme): estructuras de covarianza, selección por AIC/BIC y razón de verosimilitudes.

**Componentes de varianza y heredabilidad** (familia `geneticos`)
- Componentes de varianza por REML (JS) en diseños comunes; heredabilidad en sentido amplio por medias, de Cullis y de
  Piepho; repetibilidad; BLUP y BLUE de genotipos; ganancia esperada por selección.

**Modelos lineales generalizados** (familia `generalizados`)
- GLM (JS): conteos, proporciones (éxitos/ensayos o 0/1), gamma; enlaces logit, probit, cloglog, log, inverso;
  sobredispersión (cuasi y binomial negativa); análisis de devianza; razones de momios y de tasas; medias en la escala
  de la respuesta.
- GLMM (motor R): glmer con bloques aleatorios y efecto por observación para sobredispersión.

**Regresión no lineal** (familia `no-lineal`)
- Logístico, Gompertz, Weibull, log-logístico de 3 y 4 parámetros (DE50 con su intervalo), Mitscherlich, lineal-meseta
  y cuadrático-meseta (dosis óptima); valores iniciales automáticos; comparación de curvas entre grupos.

**Superficies de respuesta** (familia `superficies`)
- Modelo de segundo orden, falta de ajuste, análisis canónico, punto estacionario (máximo, mínimo o silla) y cresta.

**Ensayos multiambiente y estabilidad** (familia `multiambiente`)
- ANOVA combinado con homogeneidad de varianzas entre ambientes, AMMI con la prueba de Gollob y la F_R de Cornelius,
  GGE biplot (quién ganó dónde, media contra estabilidad), Eberhart-Russell, Finlay-Wilkinson, Shukla, Wricke,
  superioridad de Lin y Binns, ASV.

Cada método trae, como en la Fase 1: conclusión en palabras, cuadros de revista, supuestos, figuras, párrafo para tesis
con sus citas, detalles y el código R equivalente; entra al asistente, al constructor y al reporte.

## 4. El puente con el motor R (`js/nucleo/motor-r.js`)

- **Carga diferida**: nada se descarga hasta que se usa un método del motor R. La espera común de la suite muestra cada
  paso («Descargando R, solo la primera vez», «Instalando lme4…»).
- **Paquetes**: se instalan uno por uno con reintentos; la lista y las versiones se fijan en la ficha de cada método.
- **Cola**: un trabajo a la vez; cada uno recibe sus columnas (numéricas con NA, factores con sus niveles en orden) y
  devuelve una lista de R.
- **Serialización propia**: R escribe el resultado en JSON con 17 cifras y marca NA, NaN e infinitos, y conserva
  dimensiones y nombres (la conversión automática de webR convierte NA, NaN e infinitos en `null` y pierde las
  dimensiones de las matrices).
- **Errores y avisos de R** (ajuste singular, falta de convergencia) llegan a la interfaz traducidos y con el texto
  original.
- **Cancelar** = cerrar el motor y relanzarlo (los paquetes quedan en la caché del navegador).
- **Contrato de una ficha `motor: 'r'`**: `paquetes`, `preparar(tabla, e, op)` → `{ columnas, codigo }` y
  `leer(salida, …)` → resultado. Las dos son puras: el código R que se manda y la lectura de la salida se prueban en
  node sin R. `SP.ejecutarAsync` corre cualquier método (JS o R); el bloque Análisis, el reporte y las exportaciones lo
  usan.

## 5. Validación

- Los casos tienen el mismo formato que en la Fase 1 (`tests/casos/<método>/`), con la referencia calculada en el R de
  escritorio. Los métodos JS se validan igual que siempre.
- Los métodos del motor R se validan **en el navegador** (`tests/motor-r.mjs`): abre la app por file://, carga el
  motor, corre cada caso y guarda el resultado con la versión de webR, de R y de cada paquete. `tests/correr.mjs` lo
  integra al reporte de validación; si un caso cambió o no se ha corrido en el motor, queda **sin aprobar** y su método
  no aparece en la app (regla de liberación).
- Clase D (optimización iterativa: REML, GLM, no lineal): criterios de convergencia estrictos en los dos lados y 1e-6
  sobre el resultado convergido; donde el óptimo es plano (componentes de varianza cerca de cero) se documenta la
  tolerancia y su motivo.
- Conjuntos clásicos: sleepstudy (Belenky et al. 2003), Penicillin (Davies y Goldsmith 1972), Oats (Yates 1935),
  Machines (Milliken y Johnson 1992), ensayos de BreedingPro ya validados, y los ejemplos agronómicos de la app.

## 6. Orden de construcción

| Hito | Contenido |
|---|---|
| 2.0 | **Motor R**: puente, carga diferida, paquetes con reintentos, cola, cancelar, estado en la interfaz; contrato `motor: 'r'` y ejecución asíncrona en Análisis, reporte y exportaciones; validación en el navegador; privacidad ampliada. Método piloto: **modelo lineal mixto desde una fórmula** |
| 2.1 | Modelos mixtos completos: medias marginales y comparaciones (emmeans), Kenward-Roger, prueba de cada aleatorio, BLUPs, diagnóstico; diseños con efectos aleatorios desde el formulario (bloques aleatorios, parcelas divididas, látice con recuperación interbloque, varias localidades) |
| 2.2 | Medidas repetidas (nlme) con estructuras de covarianza y su selección |
| 2.3 | Componentes de varianza por REML en JS, heredabilidad, repetibilidad, BLUPs de genotipos, ganancia por selección |
| 2.4 | GLM en JS: binomial, Poisson, gamma, cuasi, binomial negativa |
| 2.5 | GLMM en el motor R, con sobredispersión |
| 2.6 | Regresión no lineal y dosis-respuesta |
| 2.7 | Superficies de respuesta |
| 2.8 | Ensayos multiambiente y estabilidad |
| 2.9 | Asistente y constructor para la Fase 2 (aleatorios, medidas repetidas, conteos y proporciones, curvas, multiambiente); párrafos y citas de los métodos nuevos |
| 2.10 | Cierre: repositorio propio de paquetes en Pages (binarios y fuentes), motor R sin conexión, rendimiento, accesibilidad, capturas y pendientes |

## 7. Riesgos

1. **Tiempo de la primera vez**: R (unos 20 MB) más los paquetes tardan decenas de segundos en una conexión lenta; se
   avisa antes y se muestra el avance. Las siguientes veces salen de la caché.
2. **Memoria y velocidad del motor R** con tablas grandes: un modelo mixto con 100 000 filas en el navegador puede
   tardar o agotar la memoria. Meta inicial de la Fase 2: 20 000 filas; se mide en el cierre.
3. **Versiones de los paquetes** del motor y del escritorio: ver decisión 6.
4. **El repositorio público de webR** puede fallar al bajar dependencias sueltas (visto el 30 sep): reintentos e
   instalación uno por uno; en Pages, el repositorio propio.
5. **Sin aislamiento de origen** el canal con el motor es por mensajes: no hay interrupción fina ni consola anidada
   (no hacen falta); cancelar reinicia el motor.
