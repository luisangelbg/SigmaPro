# SigmaPro — propuesta de arquitectura y Fase 1

*30 de septiembre de 2026 · documento para aprobación, antes de escribir código de la app.*

Contenido: 1. Decisiones que necesito · 2. Revisión de LABGStat · 3. Lo que ya existe en la suite ·
4. Prueba de viabilidad del motor R · 5. Arquitectura · 6. Estructura de carpetas · 7. Validación ·
8. Fase 1 detallada · 9. Flujo principal (maqueta) · 10. Orden de construcción · 11. Riesgos y límites ·
12. Fases 2 y 3 (anticipo).

---

## 1. Decisiones tomadas (30 sep 2026)

| # | Pregunta | Decisión del autor |
|---|---|---|
| 1 | ¿Evolucionar LABGStat o repositorio nuevo? | **Repositorio nuevo `SigmaPro`.** LABGStat queda archivado tal cual y SigmaPro ocupa su lugar en el portal (hoy figura como «próximamente»). Razones en §2. |
| 2 | Identidad visual (el prompt pedía negro + esmeralda con Fraunces/Manrope; desde el 30 sep la suite es oro y negro). | **Solo oro y negro** de la marca LABG, con las letras del sistema como las demás apps. Sin esmeralda ni letras externas. La maqueta ya está así. |
| 3 | Idioma. | **Solo español**, con todos los textos pasando por una función `T()` para que una versión en inglés sea mecánica si algún día se pide. El selector ES \| EN de la barra común se oculta. |

Lo demás (motor, carpetas, validación) son decisiones técnicas que ya tomé abajo y que puedes objetar.

Identidad aplicada: color propio de la app = oro oscuro `#7D5B14` en claro (6:1 sobre blanco) y oro `#D4A848`
con texto negro en oscuro; neutros cálidos (negro `#0C0C0D`, gris cálido `#5B5750`); botones y barra de bloques
en el oro común. Las figuras usan por omisión negro, oro y gris cálido con marcadores distintos (se leen también
en blanco y negro), con paletas alternativas segura para daltonismo y en grises.

---

## 2. Revisión de LABGStat

Revisé `LABG Apps/LABGStat/` completa (solo lectura).

| Aspecto | Hallazgo |
|---|---|
| Motor | Python en el navegador (Pyodide 0.27.2 + numpy/scipy/pandas/statsmodels/scikit-learn/matplotlib). `vendor/` pesa **180 MB**. |
| Doble clic | **No funciona por `file://`**: exige el servidor local (`servidor.ps1`). |
| Cobertura | 119 métodos en 14 categorías. Faltan para SigmaPro: parcelas subdivididas, franjas, látice, LSD/Duncan/SNK/Scheffé/Šidák como pruebas de medias, contrastes y polinomios ortogonales, AMMI/GGE/estabilidad. Los modelos mixtos son de un solo factor de agrupamiento, sin Satterthwaite ni Kenward-Roger. |
| Validación | **Ninguna**: no hay `tests/`, ni scripts de R, ni valores de referencia. |
| Error confirmado | El ANOVA de dos vías (`m-param.js:1346`) usa SC tipo III con codificación de tratamiento: los efectos principales no coinciden con el tipo III correcto (contrastes de suma cero). |
| Originalidad | Su catálogo y sus 14 categorías calcan el menú de un programa comercial y lo nombran en 15 cabeceras de código y en textos visibles. Choca de frente con el principio 2 de SigmaPro. |
| Estado | No es repositorio git, no está en GitHub (el portal enlaza a una página 404), no entró al rediseño común, sin tocar desde el 7 sep. Licencia inconsistente (README dice AGPL, términos de uso son un borrador comercial). |

**Conclusión: no conviene evolucionarla.** Habría que tirar el motor (180 MB de Python que no da paridad con R), el
dibujo de figuras (matplotlib, incompatible con el editor ✎ común) y la taxonomía. Lo que sí se rescata, como
contenido y no como código: el patrón de registro declarativo de métodos, el contrato de resultado
(conclusión, tablas, figuras, interpretación, párrafo para artículo), unos 150 textos de interpretación en español
(limpiándolos de nombres comerciales) y su lista de trampas ya documentadas (letras por camarillas, AUC con empates…).

---

## 3. Lo que ya existe en la suite y se reutiliza

Inventario hecho sobre el código propio de las 16 apps. Todo es obra del mismo autor, así que se puede traer sin
problema de autoría.

| Pieza | Origen | ¿Validada? | Uso en SigmaPro |
|---|---|---|---|
| REML por información promedio, BLUP, medias MC (`linmod.js`) | BreedingPro | **Sí**: contra lme4, dif. ≤ 1e-8 | Componentes de varianza rápidos; látice con recuperación interbloque (Fase 2) |
| AMMI, GGE, Eberhart-Russell, Finlay-Wilkinson, Shukla, Wricke… (`gxe9.js`) | BreedingPro | **Sí**: 147 comparaciones con R, dif. máx. 3.8e-11 | Fase 2, casi directo |
| Heredabilidad, repetibilidad, H² de Cullis (`trial.js`, `select8.js`) | BreedingPro | **Sí** | Fase 2 |
| Modelo lineal, 13 diseños con estratos de error, 11 pruebas de medias, Dunnett, polinomios (`lm.js`, `designs.js`, `posthoc.js`) | AgriDesign | **No** (sin pruebas numéricas) | Punto de partida de la Fase 1, **re-validado contra R** antes de usarse |
| Shapiro-Wilk, Levene, Bartlett, Box-Cox, no aditividad (`assump.js`) | AgriDesign / BreedingPro | Parcial | Fase 1, re-validado |
| Lector y escritor de .xlsx propios (`sheets.js`), ZIP (`zip.js`) | AgriDesign / ClusteringPro | ZIP sí | Importar/exportar |
| Escritor .docx (`docx.js`) y PDF vectorial de figuras (`pdf.js`) | SciMetricsPro | **Sí** | Exportación |
| Motor de figuras SVG con PNG/TIFF a 600 ppp | BreedingPro | **Sí** (600 ppp decodificado) | Figuras |
| Editor ✎ de figuras (`labg-figedit.js`), barra común, esperas animadas (`labg-core.js`, `labg-base.css`) | LABG-Design | Sí | Sin cambios |
| Hilos de trabajo creados desde texto, que funcionan por doble clic (`worker.js`) | SciMetricsPro | Sí | Cálculos pesados sin congelar la página |

**Corrección (1 oct 2026):** el 30 sep por la noche se publicaron en el portal los módulos compartidos
**Navegador LABG** (`shared/navigator`, v1.0.0: barra lateral de bloques, índice de secciones, modo enfocado,
paleta Ctrl+K, enlaces `#bN/seccion`) y **Estudio de figuras LABG** (`shared/figure-studio`, v1.0.0: pantalla
dividida para editar y exportar cualquier figura). SigmaPro lleva una copia de ambos desde el Hito 1.0, como las
demás apps. **Nada tiene servicio sin conexión (service worker) ni exportador LaTeX**: se escriben nuevos.

Cuidados al traer código: AgriDesign y BreedingPro definen ambos `window.S` y `window.LM` con codificaciones
distintas, y `T()` recibe los idiomas en orden opuesto en cada una. En SigmaPro todo vive bajo un solo espacio de
nombres `SP` y se re-valida al traerse. Además, en el código heredado los valores p se calculan como
`1 − F(x)`, que da 0 por debajo de ~1e-16; SigmaPro calcula la cola superior directamente.

**Posicionamiento frente a las apps hermanas.** AgriDesign (diseño y análisis de experimentos, enseñanza y
artículo) y StatsPro (estadística sin código para alumnos) siguen como están. SigmaPro es la herramienta
profesional: paridad demostrada con R, modelos mixtos y ensayos multiambiente. Con el tiempo, el núcleo validado
de SigmaPro puede volver a AgriDesign como mejora.

---

## 4. Prueba de viabilidad del motor R (hecha hoy)

El riesgo mayor del prompt era que R en el navegador (webR) no arrancara al abrir la app con doble clic. Lo probé
con Edge sin ventana:

| Prueba | Resultado |
|---|---|
| webR v0.6.0 por `file://` (doble clic) | **Funciona.** R 4.6.0 listo en ~1.3 s (con caché). No requiere aislamiento de origen. |
| Instalar agricolae + emmeans | 8 s la primera vez. |
| Instalar lme4 (2.0.1) | 3.5 s + 2.7 s de carga. |
| `lmer(Reaction ~ Days + (Days \| Subject), sleepstudy)` | Efectos fijos y componentes de varianza **idénticos a 12 dígitos** a tu R 4.4.2 de escritorio (lme4 1.1.35.5). |
| `aov` de warpbreaks | Idéntico a 12 dígitos. |
| Instalar car + lmerTest + lme4 + nlme juntos | **Falló dos veces** al bajar dependencias sueltas (nnet, tibble) del repositorio público. |
| Versión «latest» | Apunta a la rama de desarrollo, no a la estable. |

Consecuencias de diseño:
1. **Versión de webR fijada** (v0.6.0) y versiones de paquetes fijadas.
2. **Repositorio de paquetes propio** publicado junto con la app en GitHub Pages (solo los binarios necesarios,
   con su índice): instalación fiable, versionada y disponible sin conexión después de la primera vez. Por doble
   clic no se pueden leer archivos locales desde el motor, así que ahí se usa el repositorio público, con
   reintentos e instalación uno por uno.
3. **Pocas dependencias en el motor R**: los tipos II/III, Levene y similares se hacen en el núcleo JS; en webR
   solo va lo que de verdad lo necesita (lme4, lmerTest, nlme, emmeans, pbkrtest).
4. **Cancelar** = cerrar el hilo de R y relanzarlo (sin aislamiento de origen no hay interrupción fina); los
   paquetes ya están en caché, así que relanzar tarda segundos.

---

## 5. Arquitectura

### 5.1 Restricciones que mandan

- **Doble clic (`file://`)**: sin módulos ES, sin `fetch` de archivos locales, sin servicio sin conexión. Todo en
  `<script>` clásicos bajo el espacio de nombres `window.SP`. Los hilos de trabajo se arman desde el texto de las
  funciones (patrón ya probado en la suite).
- **GitHub Pages**: ahí sí hay servicio sin conexión y repositorio propio de paquetes de R.
- **Privacidad**: ningún dato sale del navegador. La única red es la descarga del motor R y sus paquetes (código,
  no datos). Prueba automática: correr un análisis y verificar que no hubo ninguna petición con datos.
- **Obra propia**: el núcleo JS se implementa desde los algoritmos publicados (AS 241, AS R94, TOMS 708,
  Copenhaver-Holland…), no traduciendo código de terceros línea por línea. Las bibliotecas de terceros quedan
  fuera del núcleo; webR y los paquetes de R se declaran en `LICENSES-TERCEROS.md`.

### 5.2 Capas

```
 ┌─────────────────────────── Interfaz (DOM) ───────────────────────────┐
 │ barra común · bloques · rejilla virtual · asistente · constructor     │
 │ reporte · estudio de figuras · exportación · proyecto .labg           │
 └──────────────┬───────────────────────────────────────┬────────────────┘
                │ ficha del método (declarativa)        │
 ┌──────────────▼──────────────┐         ┌──────────────▼────────────────┐
 │ Métodos (un archivo por      │         │ Puente al motor R             │
 │ familia): calcular() puro,   │ ◄─────► │ carga diferida, cola, caché,  │
 │ reporte(), codigoR(),        │         │ cancelar, progreso            │
 │ casos de validación          │         │ (webR en su propio hilo)      │
 └──────────────┬──────────────┘         └───────────────────────────────┘
 ┌──────────────▼──────────────────────────────────────────────────────┐
 │ Núcleo numérico (sin DOM; corre en página, hilo de trabajo y node)   │
 │ distribuciones · álgebra (QR con pivoteo, Cholesky, eigen) ·          │
 │ tabla columnar · fórmula → matriz de diseño · modelo lineal (SC I/II/III, estratos) │
 └─────────────────────────────────────────────────────────────────────┘
```

**El núcleo no toca el DOM**, así que las mismas funciones corren en la página, en un hilo de trabajo y en
`node` para las pruebas automáticas (sin navegador).

### 5.3 Contrato de un método

Cada análisis se declara una vez y el motor arma formulario, validación, ejecución, reporte y código R:

```js
SP.metodo({
  id: 'anova-dbca-factorial', familia: 'disenos', nombre: 'Factorial en bloques completos al azar',
  motor: 'js',                         // 'js' | 'r' (webR) — el usuario no tiene que saberlo
  entradas: { respuesta: 'numerica', factores: 'factor+', bloque: 'factor' },
  opciones: { sc: ['auto','I','II','III'], comparacion: 'tukey', alfa: 0.05 },
  validar(datos, entradas) { … },      // mensajes en lenguaje claro: qué falta y cómo arreglarlo
  calcular(datos, entradas, opciones) { … },   // PURO: devuelve números, nada de texto
  reporte(res) { … },                  // conclusión, cuadros, supuestos (semáforo), figuras, detalles
  codigoR(entradas, opciones) { … },   // script equivalente, copiable
  validacion: ['tests/casos/anova-dbca-factorial/*']  // sin casos aprobados, no se publica
});
```

Separar `calcular` (números) de `reporte` (palabras) es lo que permite probar la exactitud sin la interfaz.

### 5.4 Rendimiento (100 000 filas)

- Datos **columnares**: `Float64Array` por columna numérica, códigos `Int32Array` + diccionario por factor.
- Rejilla **virtualizada**: solo se dibujan las filas visibles.
- Modelos lineales por **acumulación de la matriz de productos cruzados por bloques con QR** (estable y O(n·p²));
  diseños balanceados por sumas de celda (O(n)).
- Más de ~20 000 filas → hilo de trabajo, con la espera común de la suite (`LABG.work`).
- Metas medidas en `tests/rendimiento/`: descriptivos de 100 k × 10 variables < 150 ms; ANOVA de una vía + Tukey
  < 250 ms; factorial de 3 factores desbalanceado tipo III < 1.5 s.

### 5.5 Sin conexión

- **GitHub Pages**: servicio sin conexión (`sw.js`) que guarda la app y, la primera vez que se usan,
  el motor R y sus paquetes.
- **Doble clic**: el núcleo JS funciona siempre sin internet; el motor R (Fase 2) necesita internet en ese modo.

### 5.6 Accesibilidad

AA medido con el auditor de la suite (`LABG-Design/labg-audit.ps1`), recorrido completo con teclado (también en
el constructor de modelos: cada variable se asigna con una tecla, sin arrastrar), 360 px sin desplazamiento
lateral, claro y oscuro.

---

## 6. Estructura de carpetas

```
SigmaPro/
├─ index.html                  una sola página, bloques 1–8
├─ sw.js                       servicio sin conexión (solo en http/https)
├─ LICENSE                     GPL-3.0
├─ README.md · CITATION.cff · codemeta.json · CHANGELOG.md
├─ LICENSES-TERCEROS.md        webR y paquetes de R
├─ css/      labg-base.css (copia común) · sigma.css (identidad) · impresion.css
├─ js/
│  ├─ labg-core.js · labg-figedit.js        (copias comunes)
│  ├─ nucleo/      dist.js · algebra.js · tabla.js · formula.js · lineal.js · azar.js
│  ├─ metodos/     descriptiva.js · frecuencias.js · intervalos.js · normalidad.js · varianzas.js ·
│  │               atipicos.js · independencia.js · pruebas-t.js · no-parametricas.js · disenos.js ·
│  │               comparaciones.js · contrastes.js · medias-ajustadas.js · ancova.js ·
│  │               correlacion.js · regresion.js · contingencia.js
│  ├─ motor-r/     puente.js (webR) · plantillas-r.js
│  ├─ interfaz/    app.js · rejilla.js · importar.js · transformar.js · asistente.js ·
│  │               constructor.js · reporte.js · cuadros.js
│  ├─ figuras/     motor.js · medias.js · interaccion.js · residuos.js · qq.js · dispersion.js · …
│  └─ exportar/    docx.js · pdf.js · xlsx.js · latex.js · raster.js · proyecto.js · zip.js
├─ datos/        ejemplos agronómicos (.csv) + guia.md de cada uno
├─ r-repo/       binarios de paquetes para webR, fijados (Fase 2)
├─ tests/
│  ├─ index.html               corredor en el navegador (doble clic)
│  ├─ correr.mjs               corredor en node, sin navegador (núcleo y métodos)
│  ├─ casos/<método>/          datos.csv · referencia.json · generar.R
│  ├─ r/generar-todo.R         regenera TODAS las referencias; guarda sessionInfo()
│  ├─ rendimiento/             pruebas de 100 000 filas
│  ├─ capturas/                guiones de capturas (Playwright sobre el Edge instalado)
│  └─ reporte-validacion.html  generado: método → referencia → dif. máx. → aprobado
└─ docs/   ARQUITECTURA.md · VALIDACION.md · DECISIONES.md
```

---

## 7. Validación

### 7.1 Criterio

**Aprobado si |SigmaPro − R| ≤ 1e-6 · máx(1, |R|)** para cada número que la app muestra o exporta. Para valores
p menores de 1e-6 se compara además en escala logarítmica (que un p de 1e-20 no apruebe por ser «casi cero»).

Ser honestos con el criterio obliga a distinguir cinco clases de resultados:

| Clase | Ejemplos | Cómo se valida |
|---|---|---|
| A. Fórmula cerrada o algoritmo exacto | SC, F, t, estimadores, p de t/F/χ² | Contra R, 1e-6. |
| B. R usa una aproximación conocida | p de Shapiro-Wilk (Royston), Anderson-Darling, cuantiles del rango estudentizado | Se implementa el mismo algoritmo publicado → 1e-6 contra R. Si R mismo es menos preciso (p. ej. su cuantil del rango estudentizado converge a ~1e-4 por diseño), la referencia se calcula en R con tolerancia más fina (`uniroot`/`integrate` a 1e-12) y se documenta. |
| C. R usa azar | Dunnett por defecto (cuasi Monte Carlo), Fisher simulada, remuestreo | Referencia determinista calculada en R por integración numérica de alta precisión; el valor por defecto de R se compara aparte con tolerancia de su propio error (~1e-4) y se documenta. |
| D. Optimización iterativa | Box-Cox λ̂, (Fase 2: REML, GLM) | Criterios de convergencia ajustados en ambos lados; 1e-6 sobre el resultado convergido. |
| E. Libros y artículos publicados | Cuadros impresos con 2–4 decimales | Tolerancia = media unidad del último dígito impreso. Se cita el libro o artículo, **no el programa** con el que se calculó (regla de la suite de no nombrar programas comerciales). |

### 7.2 Cómo se genera y se corre

1. `tests/r/generar-todo.R` corre cada `generar.R`, escribe `referencia.json` con 15 dígitos y guarda
   `sessionInfo()` (versión de R y de cada paquete). En esta máquina: R 4.4.2 con lme4, nlme, emmeans, agricolae,
   car, multcomp, mvtnorm, nortest, PMCMRplus, FSA, dunn.test, MASS, leaps, lmtest, multcompView y metan. Hay que
   instalar ppcor, DescTools y outliers (solo para generar referencias; no viajan con la app).
2. `node tests/correr.mjs` compara la app contra todas las referencias (sin navegador) y escribe
   `tests/reporte-validacion.html` y su `.csv`.
3. `tests/index.html` corre lo mismo en el navegador por doble clic, más las pruebas de interfaz.
4. **Regla de liberación**: un método sin casos aprobados no aparece en la app (queda «pronto»).

### 7.3 Conjuntos de datos clásicos

De R base y paquetes (con resultados publicados en la literatura): PlantGrowth, npk (factorial en bloques),
OrchardSprays (cuadro latino), warpbreaks, sleep (pareada), InsectSprays, stackloss, HairEyeColor,
UCBAdmissions; `oats` de MASS (parcelas divididas, Yates 1935); sweetpotato y corn de agricolae. De libros:
ejemplos resueltos de diseños agrícolas (bloques, parcelas divididas y subdivididas, franjas, látice y bloques
incompletos), capturados a mano con su fuente y página en `datos/guia.md`.

---

## 8. Fase 1 detallada

Cada renglón = un método con su caso de validación. «Ref. R» es la función contra la que se compara.

### 8.1 Datos
| Función | Detalle | Validación |
|---|---|---|
| Rejilla tipo hoja de cálculo | Virtualizada (100 k filas), edición en celda, deshacer/rehacer, copiar y pegar rangos | Pruebas de interfaz |
| Pegar desde hoja de cálculo | Texto separado por tabuladores; detecta encabezados y separador decimal | Casos con coma decimal, comillas, celdas vacías |
| Importar CSV / XLSX | Separador, decimal, codificación (UTF-8, Latin-1), BOM; .xlsx/.ods con lector propio | Archivos de prueba |
| Tipos | numérica, factor (con orden de niveles), fecha, texto, identificador; detección automática con explicación | Casos ambiguos (códigos enteros como factor) |
| Faltantes | vacío, NA, «.», códigos configurables; conteo por variable | — |
| Transformaciones | log, log10, ln(x+c), √x, √(x+0.5), arcoseno √p (p o %), Box-Cox con λ̂ por perfil de verosimilitud y su IC; siempre en columna nueva | Ref. R: fórmulas; `MASS::boxcox` (λ̂ afinado con `optimize`) |
| Filtros y variables calculadas | Expresiones con analizador propio (sin `eval`), recodificar, tabla ancha ⇄ larga | Casos de prueba |
| Estructura del ensayo | Detecta bloques completos, balance, cuadro latino, niveles cuantitativos equiespaciados | Con los datos de ejemplo |

### 8.2 Descriptivos, frecuencias e intervalos
| Método | Ref. R |
|---|---|
| n, faltantes, media, mediana, moda, DE, varianza, EE, CV, mín, máx, rango, RIC, media recortada, geométrica y armónica, por hasta 3 factores | base R |
| Cuantiles con las 9 definiciones (por omisión la 7) | `quantile(type = 1:9)` |
| Asimetría y curtosis (3 definiciones) | fórmulas en R |
| IC de la media (t), de la mediana (orden binomial), de la varianza y DE (χ²) | `t.test`, DescTools |
| Tablas de frecuencia de 1 y 2 vías, %, acumulados | `table`, `prop.table` |
| IC de proporciones: Wilson, Clopper-Pearson, Agresti-Coull, Wald | `prop.test`, `binom.test`, DescTools |
| Bondad de ajuste χ² | `chisq.test(p = )` |

### 8.3 Supuestos
| Método | Ref. R |
|---|---|
| Shapiro-Wilk (n 3–5000, sobre residuos del modelo por omisión) | `shapiro.test` |
| Lilliefors (K-S con parámetros estimados) | `nortest::lillie.test` |
| Kolmogorov-Smirnov contra distribución dada (exacta y asintótica) | `ks.test` |
| Anderson-Darling | `nortest::ad.test` |
| Gráficos Q-Q con banda de confianza | fórmula de la banda por estadísticos de orden |
| Levene (media), Brown-Forsythe (mediana) | `car::leveneTest` |
| Bartlett; Fligner-Killeen | `bartlett.test`; `fligner.test` |
| No aditividad de Tukey (bloque × tratamiento) | `agricolae::nonadditivity` |
| Independencia: Durbin-Watson con p exacto; prueba de rachas; residuos según orden o posición en campo | `lmtest::dwtest`; rachas por fórmula |
| Atípicos: residuos estudentizados con Bonferroni, Grubbs, cercas de Tukey, distancia de Cook | `car::outlierTest`, `outliers::grubbs.test`, `cooks.distance` |
| Semáforo y recomendaciones | Reglas documentadas (verde/ámbar/rojo → transformar con Box-Cox, Welch, no paramétrica o GLM de la Fase 2) |

### 8.4 Pruebas t y no paramétricas
| Método | Ref. R |
|---|---|
| t de una muestra, dos muestras (Student y Welch), pareada; IC | `t.test` |
| F de razón de varianzas | `var.test` |
| Tamaños del efecto: d de Cohen, g de Hedges con IC (t no central) | fórmulas + `uniroot` en R |
| Wilcoxon de una muestra y pareada; Mann-Whitney (exacta sin empates, normal con corrección con empates); Hodges-Lehmann con IC | `wilcox.test(conf.int = TRUE)` |
| Kruskal-Wallis + Dunn (Bonferroni, Holm, BH), Conover-Iman, Nemenyi | `kruskal.test`, `dunn.test`, PMCMRplus |
| Friedman + Conover, Nemenyi, Wilcoxon pareada ajustada; W de Kendall | `friedman.test`, PMCMRplus |
| Letras de agrupación también para no paramétricas | mismo algoritmo de camarillas |

### 8.5 ANOVA de diseños experimentales
| Diseño | Ref. R |
|---|---|
| Completamente al azar (balanceado y desbalanceado) | `aov`, `car::Anova` |
| Bloques completos al azar; generalizado (varias repeticiones por bloque); parcelas perdidas | `aov`, `lm` |
| Cuadro latino | `aov` (OrchardSprays) |
| Factoriales de 2 y 3 factores en DCA y DBCA | `aov`, `car::Anova` |
| Parcelas divididas (en DBCA, DCA y cuadro latino) | `aov(… + Error(bloque/A))` (`MASS::oats`) |
| Parcelas subdivididas; franjas | `aov` con estratos; `agricolae::ssp.plot`, `strip.plot` |
| Bloques incompletos balanceados (análisis intrabloque, medias ajustadas) | `agricolae::BIB.test` |
| Látice y alfa-látice (intrabloque) | `lm` + `emmeans`; la recuperación interbloque va con modelos mixtos (Fase 2) |
| SC tipo I, II y III, con explicación interactiva de qué hipótesis prueba cada una y cuándo usarla (tipo III siempre con contrastes de suma cero) | `anova`, `car::Anova(type = 2/3)` |
| CV, R², media general, eficiencia relativa del bloqueo y del cuadro latino | fórmulas |
| Efectos simples cuando hay interacción | `emmeans::joint_tests`, `test(contrast(…, by =))` |

Desbalance en parcelas divididas: los estratos de error clásicos dejan de ser válidos. La app lo detecta, lo
explica y en la Fase 2 ofrece el modelo mixto.

### 8.6 Comparaciones de medias
| Método | Ref. R |
|---|---|
| Tukey (y Tukey-Kramer con n distintos) | `TukeyHSD`, `agricolae::HSD.test` |
| DMS de Fisher (protegida o no) | `agricolae::LSD.test` |
| Duncan; Student-Newman-Keuls; Scheffé | `agricolae::duncan.test`, `SNK.test`, `scheffe.test` |
| Bonferroni, Šidák, Holm | `pairwise.t.test`, `emmeans(adjust = )` |
| Dunnett (bilateral y unilateral, n iguales y distintos) | referencia por integración determinista en R; `multcomp` como comprobación (clase C) |
| Games-Howell (varianzas desiguales) | `PMCMRplus::gamesHowellTest` |
| Comparaciones con el error correcto en parcelas divididas (Satterthwaite) | `emmeans` sobre el modelo con estratos |
| Letras por camarillas máximas (un nivel puede llevar varias) | propiedad verificada + `multcompView::multcompLetters` |
| Contrastes ortogonales definidos por el usuario (verifica ortogonalidad, parte la SC) | `lm` con contrastes, `emmeans::contrast` |
| Polinomios ortogonales con niveles igual o desigualmente espaciados; curva ajustada y dosis de máximo | `contr.poly(scores = )` |
| Medias ajustadas (marginales estimadas) con EE e IC | `emmeans` |

### 8.7 ANCOVA, correlación y regresión
| Método | Ref. R |
|---|---|
| ANCOVA en DCA y DBCA; homogeneidad de pendientes; medias ajustadas y sus comparaciones | `lm`, `car::Anova`, `emmeans` |
| Pearson con IC (z de Fisher); Spearman (exacta y asintótica); Kendall (exacta y con empates) | `cor.test` |
| Matrices de correlación con p ajustados; correlación parcial y semiparcial | `cor.test`, `ppcor` |
| Regresión simple y múltiple: coeficientes, IC, ANOVA de la regresión, R² y R² ajustada, AIC/BIC, bandas de confianza y predicción | `lm`, `predict` |
| Diagnóstico: residuos crudos, estandarizados y estudentizados; apalancamiento, Cook, DFFITS, DFBETAS, COVRATIO; VIF; número de condición | `influence.measures`, `car::vif`, `kappa` |
| Pruebas: Breusch-Pagan, RESET, Durbin-Watson, falta de ajuste (con repeticiones) | `lmtest::bptest`, `resettest`, `dwtest`, `anova` |
| Selección: paso a paso por AIC; hacia adelante, atrás y mixta por valor p; mejores subconjuntos (Cp, R² aj., BIC) | `step`, `add1`/`drop1`, `leaps::regsubsets` |
| Regresión polinomial | `lm(y ~ poly(x, k, raw = TRUE))` |

### 8.8 Tablas de contingencia
| Método | Ref. R |
|---|---|
| χ² de Pearson (Yates en 2×2), razón de verosimilitudes G², residuos ajustados | `chisq.test`, DescTools |
| Fisher exacta 2×2 y r×c (r×c con límite de tamaño, por enumeración propia) | `fisher.test` |
| McNemar; Cochran-Mantel-Haenszel | `mcnemar.test`; `mantelhaen.test` |
| Medidas: phi, V de Cramér, coeficiente de contingencia, lambda, gamma, tau-b, tau-c, d de Somers, coeficiente de incertidumbre, kappa (simple y ponderada), razón de momios y riesgo relativo con IC | DescTools |

### 8.9 Experiencia de uso (también Fase 1)
- **Asistente** de preguntas en lenguaje claro → análisis recomendado, por qué, qué se revisará y qué hacer si los
  supuestos fallan. Árbol de decisión documentado y probado con un caso por rama.
- **Modo experto**: catálogo por familias.
- **Constructor visual**: arrastrar (o asignar con teclado) a respuesta, factores fijos, bloques, estructura de
  parcelas y covariables; fórmula visible y editable con analizador propio que valida y explica errores.
- **Reporte LABG**: conclusión en lenguaje sencillo → cuadros estilo revista (tres líneas) → supuestos con
  semáforo y recomendaciones → párrafo para tesis/artículo → detalles técnicos plegables → código R.
- **Figuras** de calidad de publicación por análisis: medias con barras de error (EE, IC o DE, siempre declarado
  en el pie) y letras, interacción, diagnóstico de residuos, Q-Q, dispersión con bandas, matriz de correlación,
  mosaico de contingencia; estudio de figuras + editor ✎ común.
- **Exportar**: reporte a .docx, PDF y HTML; cuadros a .xlsx y LaTeX (booktabs); figuras a PNG/SVG/PDF
  vectorial/TIFF a 600 ppp con el tamaño físico de la revista; proyecto `.labg` (ZIP con manifiesto, datos,
  análisis, estilos, código R y huella SHA-256).
- **Ejemplos agronómicos** para cada análisis con guía breve.

---

## 9. Flujo principal: maqueta

`propuesta/maqueta.html` se abre con doble clic y se puede recorrer. Todas las cifras que muestra son **reales**,
calculadas con R (`maqueta-datos.R`) sobre un ensayo ficticio de maíz: 3 híbridos × 4 dosis de N en bloques
completos al azar.

| Captura | Qué muestra |
|---|---|
| `capturas/1-inicio-oscuro.png` | Portada en tema oscuro (oro y negro) |
| `capturas/2-datos.png` | Rejilla con tipos, panel de variable, estructura detectada |
| `capturas/3-asistente.png` | Siete preguntas → recomendación con su porqué |
| `capturas/3b-constructor-oscuro.png` | Constructor visual y fórmula editable |
| `capturas/4-resultados.png` y `-oscuro` | Conclusión, cuadros estilo revista, semáforo, párrafo para tesis, código R |
| `capturas/5-figura.png` | Figura con letras + estudio de figura |
| `capturas/6-exportar-oscuro.png` | Reporte, cuadros (LaTeX), figuras y proyecto .labg |
| `capturas/7-movil-resultados.png` | 390 px de ancho, sin desplazamiento lateral |

---

## 10. Orden de construcción de la Fase 1

Cada hito termina con sus pruebas aprobadas contra R y un resumen tuyo antes de seguir.

| Hito | Contenido |
|---|---|
| 1.0 | Esqueleto: `index.html` con barra común, bloques, tema; registro de métodos; corredores de pruebas (node y navegador); `generar-todo.R`; formato del reporte de validación |
| 1.1 | **Núcleo numérico**: distribuciones (normal, t, F, χ², beta, gamma, binomial, rango estudentizado, Wilcoxon/Kendall/Spearman exactas), álgebra, fórmula → matriz, modelo lineal con SC I/II/III |
| 1.2 | Datos: rejilla, importar, tipos, faltantes, transformaciones, filtros, calculadas |
| 1.3 | Descriptivos, frecuencias, intervalos |
| 1.4 | Supuestos y semáforo |
| 1.5 | Pruebas t y no paramétricas |
| 1.6 | ANOVA de todos los diseños |
| 1.7 | Comparaciones, letras, contrastes, polinomios, medias ajustadas |
| 1.8 | ANCOVA y regresión con diagnóstico y selección |
| 1.9 | Correlación y contingencia |
| 1.10 | Asistente y constructor visual |
| 1.11 | Reporte, figuras, exportaciones y proyecto `.labg` |
| 1.12 | Servicio sin conexión, rendimiento 100 k, auditoría AA, capturas, reporte de validación y lista de pendientes |

---

## 11. Riesgos y límites conocidos

1. **Fisher exacta r×c**: el algoritmo de red de R es grande; se implementa enumeración propia con límite de
   tamaño y aviso claro por encima de él.
2. **Valores de libro impresos** solo validan a la precisión impresa (clase E), no a 1e-6.
3. **Versiones de R**: webR trae R 4.6.0 y tu escritorio 4.4.2. Las referencias se generan con versiones
   fijadas y registradas; conviene actualizar el R de escritorio a 4.6 para que coincidan.
4. **Licencias del motor R**: webR es GPL-3 (binarios) y MIT (resto); los paquetes de R que usaré son GPL ≥ 2,
   compatibles. Algunos son solo GPL-2 (multcomp, mvtnorm, dunn.test): se usan **solo para generar referencias**
   en tu equipo y **no se empaquetan** en el repositorio propio de paquetes.
5. **INDAUTOR**: el ejemplar se arma solo con el código propio (núcleo, métodos, interfaz). webR y los paquetes se
   declaran como componentes de terceros que se descargan en tiempo de ejecución.
6. **Nombre**: «SigmaPro» se parece al nombre de un programa comercial de gráficas científicas. Conviene una
   búsqueda en el IMPI antes de publicar con DOI.
7. **Capturas con Playwright**: no hay npm en este equipo; se usaría `playwright-core` con el Edge ya instalado,
   como herramienta de desarrollo que no viaja con la app (las capturas de esta propuesta se hicieron con el mismo
   protocolo de DevTools sobre Edge sin ventana).

---

## 12. Fases 2 y 3 (anticipo)

- **Fase 2**: modelos mixtos con webR (lme4, lmerTest con Satterthwaite y Kenward-Roger, nlme para estructuras
  de covarianza en medidas repetidas, emmeans); REML propio de BreedingPro para componentes de varianza
  instantáneos; GLM y GLMM con sobredispersión; no lineal (logístico, Gompertz, dosis-respuesta, plateau);
  superficies de respuesta; AMMI, GGE, Eberhart-Russell y Finlay-Wilkinson desde el código ya validado de
  BreedingPro; heredabilidad y repetibilidad.
- **Fase 3**: multivariado enlazando con PCAPro y ClusteringPro en lugar de duplicarlos (en GitHub Pages todas
  las apps comparten origen, así que «Abrir en PCAPro» puede pasar los datos por almacenamiento local del
  navegador sin subir nada); potencia y tamaño de muestra; muestreo; supervivencia y series de tiempo básicas.
