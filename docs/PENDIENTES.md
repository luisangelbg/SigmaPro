# Pendientes de SigmaPro

Estado al cerrar la Fase 1 (Hito 1.12, 2 de octubre de 2026). Lo que falta para publicar, los límites conocidos de lo
que ya está y lo que viene en las fases 2 y 3 (detalle en [`propuesta/PROPUESTA.md`](../propuesta/PROPUESTA.md) §12).

## Antes de publicar

- **Nombre.** «SigmaPro» se parece al de un programa comercial de gráficas científicas: buscarlo en el IMPI antes de
  publicar con DOI (riesgo 6 de la propuesta).
- **Versión 1.0.0.** Hoy la app dice 0.1.0; al publicar, subir a 1.0.0 en `js/nucleo/sp.js` (`SP.VERSION`),
  `sw.js` y el CHANGELOG.
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
- **Letras con doble clic**: el navegador y el estudio de figuras (módulos comunes de la suite) piden sus letras al
  portal de la suite, también al abrir con doble clic con internet: tres archivos .woff2, sin datos. Es una decisión de
  toda la suite; si se quiere que con doble clic ninguna petición salga del equipo, habría que empaquetar las letras
  junto a cada app (licencia OFL).
- **Auditoría de accesibilidad**: usa el auditor de la suite (`LABG-Design/labg-audit.ps1`, fuera de este repositorio);
  sin él solo corre la revisión del foco con el teclado.
- **Idioma**: la interfaz está solo en español.

## Fase 2 · motor R en el navegador (webR)

Plan detallado en [`propuesta/FASE2.md`](../propuesta/FASE2.md). Hecho: Hito 2.0 (el motor R y el modelo lineal mixto
desde una fórmula) e Hito 2.1 (medias marginales, comparaciones, prueba de los aleatorios, BLUP y los diseños con
efectos aleatorios) e Hito 2.2 (medidas repetidas con estructuras de covarianza). Notas:

- Con doble clic el motor R necesita internet la primera vez (luego sale de la caché del navegador); sin conexión
  llega en el cierre de la fase (Hito 2.10), con el repositorio propio de paquetes en Pages.
- `tests/codigo-r.mjs` corre en node y no cubre los métodos del motor R; su código R es el mismo que corre en el
  motor y lo validan sus casos (`tests/motor-r.mjs`).
- El asistente y el constructor todavía no proponen los modelos mixtos ni las medidas repetidas (Hito 2.9); se eligen
  en el catálogo.
- Medidas repetidas: las pruebas usan los gl del error de nlme (N − p); los de Kenward-Roger para estas estructuras
  (como en otros programas) quedan pendientes. Faltan Toeplitz y antedependencia, y combinar un efecto aleatorio con
  la estructura (lme con correlación).
- Las letras de los modelos mixtos se arman con los p de emmeans; no se comparan aparte contra multcompView (el
  algoritmo de letras ya se validó en la Fase 1).
- webR deja en el registro del navegador «Refused to get unsafe header "Content-Encoding"» al descargar (su servidor
  no expone ese encabezado); no afecta el cálculo.

Sigue:

- Modelos mixtos: lme4 y lmerTest (Satterthwaite y Kenward-Roger), nlme para estructuras de covarianza en medidas
  repetidas, emmeans; componentes de varianza instantáneos con el REML propio de BreedingPro.
- GLM y GLMM con sobredispersión; modelos no lineales (logístico, Gompertz, dosis-respuesta, meseta); superficies de
  respuesta.
- Ensayos multiambiente: AMMI, GGE, Eberhart-Russell y Finlay-Wilkinson desde el código ya validado de BreedingPro;
  heredabilidad y repetibilidad.
- Repositorio propio de paquetes de R en GitHub Pages (solo paquetes con licencia compatible) y su descarga diferida;
  con doble clic, el motor R necesita internet.

## Fase 3

- Multivariado enlazando con PCAPro y ClusteringPro en lugar de duplicarlos («Abrir en PCAPro» por el almacenamiento
  local del navegador cuando comparten origen en GitHub Pages).
- Potencia y tamaño de muestra; muestreo; supervivencia y series de tiempo básicas.
