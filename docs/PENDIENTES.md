# Pendientes de SigmaPro

Estado tras la ampliación de la Fase 3 (Hito 3.9, 4 de octubre de 2026), los arreglos hallados al escribir el manual (versión 0.3.3) y los Hitos 4.0 y 4.1 de la Fase 4 (plan en [`propuesta/FASE4.md`](../propuesta/FASE4.md)). Antes: la Fase 2 (Hito 2.10, 3 de octubre) y la Fase 1 (Hito 1.12, 2 de octubre). Lo que falta para publicar, los límites conocidos de lo
que ya está y lo que viene en las fases 2 y 3 (detalle en [`propuesta/PROPUESTA.md`](../propuesta/PROPUESTA.md) §12).

## Antes de publicar

- **Nombre.** «SigmaPro» se parece al de un programa comercial de gráficas científicas: buscarlo en el IMPI antes de
  publicar con DOI (riesgo 6 de la propuesta).
- **Versión 1.0.0.** Hoy la app dice 0.3.3 (Fase 3 completa, su ampliación y los arreglos del manual); al publicar, subir a 1.0.0 en `js/nucleo/sp.js`
  (`SP.VERSION`), `sw.js` y el CHANGELOG.
- **Motor R sin conexión al publicar**: armar `motor-r/` con `node tools/motor-r/armar.mjs --fuentes` y publicarlo
  junto a la app (no va en el repositorio: unos 250 MB con las fuentes).
- **Manual de usuario**: escrito en español, un capítulo por bloque (`manual/`, PDF
  `manual/SigmaPro_Manual_de_usuario_ES.pdf`). Describe la versión 1.0: al subir la versión, rehacer las capturas y el
  PDF (pasos en [`manual/LEEME.md`](../manual/LEEME.md)) para que las pantallas digan 1.0.0.
- **Publicación**: repositorio en GitHub, GitHub Pages (ahí funciona el servicio sin conexión), su ficha en el
  catálogo del portal de la suite y registro en Zenodo con DOI.
- **INDAUTOR**: el ejemplar se arma solo con el código propio (núcleo, métodos, interfaz y exportadores). Los módulos
  comunes de la suite son del mismo autor; los íconos y demás componentes de terceros están en
  [`LICENSES-TERCEROS.md`](../LICENSES-TERCEROS.md).

## Límites conocidos de la Fase 1

- **PDF del reporte**: sale del diálogo de impresión del navegador (la página del reporte con estilos de impresión). Las
  figuras sí tienen su PDF vectorial propio.
- **Figuras en el .docx**: van como PNG a 300 ppp con su tamaño físico, no como vectores.
- **LaTeX**: se escribe el código de los cuadros (booktabs) y del documento, pero la app no lo compila.
- ~~**Guardar el trabajo**~~: resuelto (Hito 3.9, 4 oct 2026). Los datos y el reporte se guardan solos en el navegador
  (IndexedDB) y al volver a abrir se ofrece recuperarlos. Queda: con dos pestañas de SigmaPro abiertas a la vez, se
  guarda lo de la última que cambió; el historial de deshacer de la hoja no se guarda.
- **Asistente**: no reconoce en los datos una estructura de parcelas divididas; hay que indicarla con sus preguntas o en
  el constructor.
- **Tablas grandes**: el plan pedía calcular en un hilo de trabajo con más de 20 000 filas. Se midió y resultó más
  lento (el hilo arranca sin el código optimizado y con menos prioridad), así que los cálculos siguen en la página con
  el aviso «Calculando con n filas…». Volver a medir con un hilo que se quede abierto y ya optimizado.
- **Gráficas con muchas filas**: los cálculos usan todas las filas, pero cada gráfica de dispersión dibuja a lo más
  2 500 puntos (todos los marcados mientras no pasen de la mitad) y las cajas, 400 puntos por grupo.
- **Versiones de R**: las referencias se generaron con R 4.4.2 de escritorio; webR trae R 4.6. Antes de la Fase 2,
  actualizar el R de escritorio, regenerar las referencias (`tests/r/generar-todo.R`) y volver a validar.
- ~~**Letras con doble clic**~~: resuelto (3 oct 2026). Desde el navegador 1.1.2 y el estudio de figuras 1.5.1 los
  módulos comunes usan las letras del sistema; con doble clic ninguna petición sale del equipo (salvo el motor R).
- **Auditoría de accesibilidad**: usa el auditor de la suite (`LABG-Design/labg-audit.ps1`, fuera de este repositorio);
  sin él solo corre la revisión del foco con el teclado.
- **Idioma**: la interfaz está solo en español.

## Fase 2 · motor R en el navegador (webR)

Plan detallado en [`propuesta/FASE2.md`](../propuesta/FASE2.md). Hecho: Hito 2.0 (el motor R y el modelo lineal mixto
desde una fórmula), Hito 2.1 (medias marginales, comparaciones, prueba de los aleatorios, BLUP y los diseños con
efectos aleatorios), Hito 2.2 (medidas repetidas con estructuras de covarianza), Hito 2.3 (componentes de varianza por
REML en el núcleo, heredabilidad y repetibilidad) , Hito 2.4 (modelos lineales generalizados en el núcleo), Hito 2.5 (modelos
lineales generalizados mixtos en el motor R), Hito 2.6 (regresión no lineal en el núcleo), Hito 2.7 (superficies de
respuesta en el núcleo), Hito 2.8 (ensayos multiambiente y estabilidad en el núcleo) e Hito 2.9 (asistente y constructor
para la Fase 2) e Hito 2.10 (cierre: repositorio propio del motor R, motor R sin conexión, rendimiento de la Fase 2,
base común nueva). **La Fase 2 está completa.** Notas:

- Con doble clic el motor R necesita internet la primera vez (luego sale de la caché del navegador): el navegador no
  deja al hilo del motor leer archivos locales. Servida por http(s) con su repositorio propio (`motor-r/`), funciona
  sin internet desde la primera visita (`tests/sin-conexion.mjs` lo comprueba con el servidor apagado).
- `tests/codigo-r.mjs` corre en node y no cubre los métodos del motor R; su código R es el mismo que corre en el
  motor y lo validan sus casos (`tests/motor-r.mjs`).
- El asistente no propone la heredabilidad ni los componentes de varianza (se eligen en el catálogo); el constructor
  no arma estructuras de covarianza de medidas repetidas ni la binomial con ensayos (están en el catálogo).
- ~~Regresión no lineal~~: resuelto en el Hito 4.0 (4 oct 2026): intervalos perfilados, elección por AIC, pesos, la
  prueba de cada parámetro común en lineal-meseta, Michaelis-Menten, Brain-Cousens, la dosis económica y el eje
  logarítmico. Queda: los valores derivados (DE50, dosis óptima, dosis económica) siguen con intervalos de Wald por el
  método delta, y lineal-meseta con intervalos de Wald.
- ~~Multiambiente~~: resuelto en el Hito 4.1 (4 oct 2026): imputación EM-AMMI, Huehn, Kang, Annicchiarico, WAAS y
  WAASY, análisis en dos etapas y las vistas del GGE (genotipo y ambiente ideales, comparar dos genotipos). Queda: las
  dos etapas toman los genotipos como fijos (sus BLUE); con genotipos aleatorios, el modelo mixto de localidades.
- ~~Superficies de respuesta~~: resuelto en el Hito 4.2 (4 oct 2026): generador de diseños, codificación a mano,
  mezclas de Scheffé, deseabilidad y la superficie en 3D. Queda: las mezclas con restricciones (límites inferiores y
  superiores de cada componente, pseudocomponentes) y los diseños óptimos (D-óptimos) no están.
- ~~GLMM~~: resuelto en el Hito 4.3 (4 oct 2026): la cuadratura de Gauss-Hermite, la gamma mixta y la prueba de cada
  efecto aleatorio. Queda: la cuadratura con la binomial negativa o la gamma (lme4 no la da bien), la prueba de los
  aleatorios en la gamma, las pendientes aleatorias en la gamma y el p de la prueba con la mezcla de χ² (es conservador).
- ~~GLM~~: resuelto en el Hito 4.3 (4 oct 2026): intervalos perfilados, Firth, la gaussiana inversa, los enlaces raíz,
  1/μ² y de potencia, y la raíz en la binomial negativa. Queda: Firth con otros enlaces que logit y en Poisson, y los
  intervalos perfilados de las medias (siguen de Wald en la escala del enlace).
- Heredabilidad: los testigos (genotipos fijos dentro de un ensayo de genotipos aleatorios), las matrices de
  parentesco (modelo animal, como en BreedingPro) y los intervalos de confianza de H² quedan pendientes. El REML del
  núcleo admite hasta 2500 incógnitas fuera del término mayor; para modelos más grandes, el modelo mixto del motor R.
- Medidas repetidas: las pruebas usan los gl del error de nlme (N − p); los de Kenward-Roger para estas estructuras
  (como en otros programas) quedan pendientes. Faltan Toeplitz y antedependencia, y combinar un efecto aleatorio con
  la estructura (lme con correlación).
- Las letras de los modelos mixtos se arman con los p de emmeans; no se comparan aparte contra multcompView (el
  algoritmo de letras ya se validó en la Fase 1).
- webR deja en el registro del navegador «Refused to get unsafe header "Content-Encoding"» al descargar (su servidor
  no expone ese encabezado); no afecta el cálculo.

- Rendimiento (`tests/rendimiento/medir.mjs --motor`): los métodos de la Fase 2 en el núcleo con 100 000 filas y el
  modelo mixto del motor R con 20 000, todos en meta. El GLM de conteos tardaba minutos con 100 000 filas: la familia
  automática tomaba por sobredispersión una razón de 1.008 (p = 0.03) y la binomial negativa no convergía (θ → ∞);
  ahora pide razón > 1.1, reusa el ajuste y detiene θ en 10⁸. Las curvas no lineales y la falta de ajuste de las
  superficies trabajan por celdas.

## Fase 3

Plan detallado en [`propuesta/FASE3.md`](../propuesta/FASE3.md). Hecho: Hito 3.0 (tamaño de muestra y potencia), Hito 3.1 (muestreo), Hito 3.2 (supervivencia), Hito 3.3 (series de tiempo), Hito 3.4 (MANOVA y discriminante) e Hito 3.5 (asistente para la Fase 3 y cierre). **La Fase 3 está completa.** Después, Hito 3.6 (estratos en la supervivencia y prueba M de Box), Hito 3.7 (modelos ARIMA), Hito 3.8 (Cox y MANOVA desde el constructor) e Hito 3.9 (guardado automático). Notas:

- El constructor arma Cox (con un evento) y la MANOVA (con más respuestas); el muestreo, las series de tiempo y el
  discriminante se eligen en el asistente o en el catálogo. El asistente no propone el tamaño de muestra de un
  muestreo (está en el catálogo, sin datos).
- Potencia: sin la prueba t de Welch (varianzas distintas), las proporciones con la corrección de continuidad
  (strict), los diseños factoriales ni el tamaño de muestra de modelos mixtos o por simulación.
- Muestreo: sin muestreo por conglomerados (en una o dos etapas), sistemático, por razón o regresión, ni el tamaño de
  muestra del estratificado con un error dado (sí reparte un total). El tamaño de cada estrato se escribe a mano.
- Supervivencia: sin covariables que cambian con el tiempo, censura por intervalos
  (la revisión cada tantos días se trata como tiempo exacto), riesgos competitivos, modelos paramétricos (Weibull,
  log-normal) ni la gráfica de los residuos de Schoenfeld (sí su prueba). El EE de la concordancia no se calcula.
- Series de tiempo: sin regresores externos en ARIMA (sí la media) ni la búsqueda automática de d y D, sin STL (descomposición con loess), sin Mann-Kendall estacional
  ni corregido por autocorrelación, sin Pettitt (cambio de nivel) y sin series con intervalos desiguales o huecos
  (salvo la tendencia, que omite los faltantes).
- Multivariado: sin sumas de cuadrados tipo II o III en la
  MANOVA, sin discriminante cuadrático ni previas a elegir, sin variables canónicas con sus pruebas por dimensión
  (candisc) y sin el traspaso directo a PCAPro y ClusteringPro (hoy por CSV).

Lo que dice la propuesta para esta fase:

- Multivariado enlazando con PCAPro y ClusteringPro en lugar de duplicarlos («Abrir en PCAPro» por el almacenamiento
  local del navegador cuando comparten origen en GitHub Pages).
- Potencia y tamaño de muestra; muestreo; supervivencia y series de tiempo básicas.
