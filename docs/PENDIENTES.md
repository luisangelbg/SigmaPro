# Pendientes de SigmaPro

Estado al cerrar la Fase 3 (Hito 3.5, 4 de octubre de 2026; versión 0.3.0). Antes: la Fase 2 (Hito 2.10, 3 de octubre) y la Fase 1 (Hito 1.12, 2 de octubre). Lo que falta para publicar, los límites conocidos de lo
que ya está y lo que viene en las fases 2 y 3 (detalle en [`propuesta/PROPUESTA.md`](../propuesta/PROPUESTA.md) §12).

## Antes de publicar

- **Nombre.** «SigmaPro» se parece al de un programa comercial de gráficas científicas: buscarlo en el IMPI antes de
  publicar con DOI (riesgo 6 de la propuesta).
- **Versión 1.0.0.** Hoy la app dice 0.3.0 (Fase 3 completa); al publicar, subir a 1.0.0 en `js/nucleo/sp.js`
  (`SP.VERSION`), `sw.js` y el CHANGELOG.
- **Motor R sin conexión al publicar**: armar `motor-r/` con `node tools/motor-r/armar.mjs --fuentes` y publicarlo
  junto a la app (no va en el repositorio: unos 250 MB con las fuentes).
- **Manual de usuario** en español, en PDF, con un capítulo por bloque.
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
- **Guardar el trabajo**: los datos y el reporte no se guardan solos; al cerrar la pestaña se pierden si no se guardó
  el proyecto .labg. Pendiente: guardado automático en el almacenamiento del navegador, con aviso.
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
- Regresión no lineal: los intervalos son de Wald (los de verosimilitud perfilada quedan pendientes), no hay elección
  automática del modelo por AIC ni pesos, y lineal-meseta no tiene la prueba de cada parámetro común (sí la global).
  Faltan Michaelis-Menten, Brain-Cousens (hormesis), la dosis económica óptima con precios y el eje logarítmico de la
  dosis en la gráfica.
- Multiambiente: cada genotipo debe estar en cada ambiente (falta la imputación EM-AMMI de BreedingPro); faltan las
  estadísticas de rangos de Huehn, Kang, Annicchiarico, WAAS, el análisis en dos etapas con una varianza por ambiente
  y las vistas del GGE de comparar dos genotipos y del ambiente ideal.
- Superficies de respuesta: sin generador de diseños (central compuesto, Box-Behnken), sin mezclas ni optimización
  de varias respuestas (deseabilidad); la codificación es automática (no se puede fijar a mano) y la gráfica de
  superficie en 3D queda pendiente (hay curvas de nivel).
- GLMM: solo aproximación de Laplace (nAGQ = 1); la cuadratura adaptativa de Gauss-Hermite, la familia gamma mixta y la
  prueba de razón de verosimilitudes de cada efecto aleatorio quedan pendientes.
- GLM: los intervalos de las razones son de Wald (confint.default); los de verosimilitud perfilada quedan pendientes.
  Con separación completa en la binomial (una probabilidad ajustada en 0 o 1) la app avisa, pero no corrige (Firth).
  Faltan la gaussiana inversa, los enlaces de potencia y la binomial negativa con otros enlaces que log e identidad.
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

Plan detallado en [`propuesta/FASE3.md`](../propuesta/FASE3.md). Hecho: Hito 3.0 (tamaño de muestra y potencia), Hito 3.1 (muestreo), Hito 3.2 (supervivencia), Hito 3.3 (series de tiempo), Hito 3.4 (MANOVA y discriminante) e Hito 3.5 (asistente para la Fase 3 y cierre). **La Fase 3 está completa.** Notas:

- El constructor de modelos no arma los métodos de la Fase 3 (no son modelos de fórmula): se eligen en el asistente o
  en el catálogo. El asistente no propone el tamaño de muestra de un muestreo (está en el catálogo, sin datos).
- Potencia: sin la prueba t de Welch (varianzas distintas), las proporciones con la corrección de continuidad
  (strict), los diseños factoriales ni el tamaño de muestra de modelos mixtos o por simulación.
- Muestreo: sin muestreo por conglomerados (en una o dos etapas), sistemático, por razón o regresión, ni el tamaño de
  muestra del estratificado con un error dado (sí reparte un total). El tamaño de cada estrato se escribe a mano.
- Supervivencia: sin estratos en Cox ni en log-rank, covariables que cambian con el tiempo, censura por intervalos
  (la revisión cada tantos días se trata como tiempo exacto), riesgos competitivos, modelos paramétricos (Weibull,
  log-normal) ni la gráfica de los residuos de Schoenfeld (sí su prueba). El EE de la concordancia no se calcula.
- Series de tiempo: sin modelos ARIMA ni pronósticos, sin STL (descomposición con loess), sin Mann-Kendall estacional
  ni corregido por autocorrelación, sin Pettitt (cambio de nivel) y sin series con intervalos desiguales o huecos
  (salvo la tendencia, que omite los faltantes).
- Multivariado: sin la prueba M de Box (igualdad de covarianzas), sin sumas de cuadrados tipo II o III en la
  MANOVA, sin discriminante cuadrático ni previas a elegir, sin variables canónicas con sus pruebas por dimensión
  (candisc) y sin el traspaso directo a PCAPro y ClusteringPro (hoy por CSV).

Lo que dice la propuesta para esta fase:

- Multivariado enlazando con PCAPro y ClusteringPro en lugar de duplicarlos («Abrir en PCAPro» por el almacenamiento
  local del navegador cuando comparten origen en GitHub Pages).
- Potencia y tamaño de muestra; muestreo; supervivencia y series de tiempo básicas.
