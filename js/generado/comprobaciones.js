/* Generado por las pruebas de tests/ (codigo-r, exportar, rendimiento, sin-conexion) — no editar a mano. */
window.SP_COMPROBACIONES = {
 "rendimiento": {
  "titulo": "Rendimiento con 99,941 filas",
  "ok": true,
  "resumen": "61 de 61 medidas dentro de su meta, en un navegador Chromium 154.0.0.0. Las metas del plan: Descriptivos de 10 variables: 139 ms (meta 150 ms); ANOVA de una vía + Tukey: 118 ms (meta 250 ms); Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 181 ms (meta 1.50 s).",
  "renglones": [
   "Crear la hoja (25 columnas): 266 ms (después 219 ms) · meta 1.50 s",
   "Leer un CSV de 9.8 MB: 739 ms (después 1.22 s) · meta 1.50 s",
   "Filtrar con una expresión: 34 ms (después 18 ms) · meta 500 ms",
   "Tabla de análisis (todas las columnas): 164 ms (después 0 ms) · meta 500 ms",
   "Cargar en la app (rejilla y estructura): 276 ms · meta 1.50 s",
   "Descriptivos de 10 variables: 139 ms (después 131 ms) · meta 150 ms",
   "Descriptivos de 10 variables en 20 grupos (trat × A): 303 ms (después 226 ms) · meta 800 ms",
   "Frecuencias trat × bloque: 3 ms (después 1 ms) · meta 200 ms",
   "Bondad de ajuste de trat: 2 ms (después 0 ms) · meta 200 ms",
   "Supuestos del modelo bloques + tratamientos: 689 ms (después 586 ms) · meta 2.00 s",
   "Prueba t de Welch: 33 ms (después 31 ms) · meta 300 ms",
   "Mann-Whitney con Hodges-Lehmann: 98 ms (después 85 ms) · meta 1.50 s",
   "Kruskal-Wallis con Dunn: 81 ms (después 110 ms) · meta 800 ms",
   "ANOVA de una vía + Tukey: 118 ms (después 111 ms) · meta 250 ms",
   "Bloques al azar (5 tratamientos, 10 bloques): 284 ms (después 265 ms) · meta 500 ms",
   "Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 181 ms (después 137 ms) · meta 1.50 s",
   "Factorial en bloques con dosis numérica (tipo III): 941 ms (después 879 ms) · meta 1.50 s",
   "Parcelas divididas (A en parcelas grandes, B): 268 ms (después 301 ms) · meta 3.00 s",
   "Tukey de A dentro de cada B (factorial): 151 ms (después 132 ms) · meta 1.50 s",
   "Polinomios ortogonales de la dosis: 285 ms (después 215 ms) · meta 1.00 s",
   "ANCOVA en bloques (5 tratamientos, 1 covariable): 313 ms (después 291 ms) · meta 3.00 s",
   "Regresión múltiple con 10 predictores y diagnóstico: 873 ms (después 718 ms) · meta 2.00 s",
   "Regresión polinomial de grado 2: 242 ms (después 307 ms) · meta 1.50 s",
   "Selección paso a paso (AIC) entre 10 predictores: 132 ms (después 121 ms) · meta 1.50 s",
   "Mejores subconjuntos de 10 predictores (1 023 modelos): 75 ms (después 65 ms) · meta 1.50 s",
   "Modelo lineal general bloque + A * B + covariable: 263 ms (después 239 ms) · meta 3.00 s",
   "Correlación de Pearson: 196 ms (después 174 ms) · meta 200 ms",
   "Correlación de Spearman: 268 ms (después 243 ms) · meta 600 ms",
   "Correlación de Kendall (τ-b de Knight): 259 ms (después 253 ms) · meta 800 ms",
   "Matriz de Pearson de 10 variables: 178 ms (después 164 ms) · meta 500 ms",
   "Matriz de Kendall de 10 variables (45 pares): 3.37 s (después 3.57 s) · meta 8.00 s",
   "Correlación parcial con 3 controles: 93 ms (después 62 ms) · meta 500 ms",
   "Tabla de contingencia trat × l: 3 ms (después 1 ms) · meta 500 ms",
   "McNemar-Bowker de dos evaluaciones: 2 ms (después 1 ms) · meta 300 ms",
   "Cochran-Mantel-Haenszel grupo × resp × l: 2 ms (después 1 ms) · meta 500 ms",
   "Kappa de Cohen: 1 ms (después 1 ms) · meta 300 ms",
   "Conteos (Poisson o binomial negativa) en bloques: 1.25 s (después 1.16 s) · meta 3.00 s",
   "Proporciones 0/1 (binomial) en bloques: 1.17 s (después 1.23 s) · meta 3.00 s",
   "Componentes de varianza por REML (bloque y l aleatorios, trat fijo): 846 ms (después 662 ms) · meta 5.00 s",
   "Respuesta con meseta (cuadrático-meseta) por A: 153 ms (después 104 ms) · meta 3.00 s",
   "Superficie de respuesta dosis × plantas: 136 ms (después 138 ms) · meta 3.00 s",
   "Ensayo en varios ambientes (5 genotipos × 6 ambientes, bloques): 329 ms (después 321 ms) · meta 3.00 s",
   "AMMI de 5 genotipos en 6 ambientes: 253 ms (después 289 ms) · meta 3.00 s",
   "Muestreo estratificado por trat (5 estratos, asignación de Neyman): 17 ms (después 15 ms) · meta 500 ms",
   "Kaplan-Meier de 5 grupos con log-rank: 150 ms (después 141 ms) · meta 1.50 s",
   "Cox con trat y una covariable (Efron, concordancia y riesgos proporcionales): 1.10 s (después 1.11 s) · meta 5.00 s",
   "Autocorrelación (50 rezagos) y Ljung-Box: 27 ms (después 19 ms) · meta 1.50 s",
   "Descomposición clásica (frecuencia 12): 46 ms (después 42 ms) · meta 1.50 s",
   "MANOVA de 3 respuestas en bloques: 1.03 s (después 1.05 s) · meta 3.00 s",
   "Discriminante de 5 grupos con 4 variables y validación cruzada: 492 ms (después 526 ms) · meta 3.00 s",
   "Tendencia de Mann-Kendall y Sen (3 000 valores, 4.5 millones de pares): 930 ms (después 945 ms) · meta 2.00 s",
   "Arrancar el motor R y cargar lme4: 12.18 s · meta 120.00 s",
   "Modelo mixto rend ~ trat * A + (1 | bloque): 6.53 s · meta 30.00 s",
   "Bloques al azar con bloques aleatorios: 2.37 s · meta 30.00 s",
   "Bloque Análisis: factorial en bloques, calculado y pintado: 1.30 s · meta 2.50 s",
   "Reporte de 5 análisis: calculado y pintado (bloque 5): 4.39 s · meta 5.00 s",
   "Figuras del reporte (bloque 6): 310 ms · meta 1.50 s",
   "Hoja de cálculo de los cuadros: 5 ms · meta 1.50 s",
   "Documento .docx (figuras a 300 ppp): 1.37 s · meta 3.00 s",
   "Proyecto .labg (datos completos, comprimido): 2.66 s · meta 3.00 s",
   "Abrir el .labg y verificar sus huellas: 841 ms · meta 2.00 s"
  ],
  "fecha": "2026-10-04T07:44:04.510Z",
  "motor": "node v24.19.0"
 },
 "sin-conexion": {
  "titulo": "Privacidad y uso sin conexión",
  "ok": true,
  "resumen": "Con datos, 7 análisis, reporte y seis exportaciones, ningún dato salió del navegador: servida por http, 472 peticiones GET sin datos, todas a la propia app; con doble clic, fuera del equipo solo se pide el código del motor R para el modelo mixto (43 descargas de webR y sus paquetes); servida por http con su repositorio propio, ni eso: el motor sale del mismo origen, todo con GET sin datos ni parámetros, también desde el hilo del motor. Sin red y con el servidor apagado, la app abre, calcula los análisis del núcleo y el modelo mixto en el motor R guardado, exporta y verifica las huellas del proyecto.",
  "renglones": [
   "Doble clic: 227 peticiones; fuera del equipo, solo 43 descargas del motor R (webR y paquetes).",
   "Servida por http: 472 peticiones GET a 268 archivos de la app, sin parámetros ni cuerpo.",
   "Servicio sin conexión activo con 267 archivos guardados.",
   "Sin red: 7 análisis, reporte, 6 exportaciones y huellas del proyecto verificadas."
  ],
  "fecha": "2026-11-04T03:05:38.850Z",
  "motor": "node v24.19.0"
 },
 "exportar": {
  "titulo": "Las exportaciones, leídas con lectores independientes",
  "ok": true,
  "resumen": "Hoja de cálculo: 258 números idénticos a la app y 24 valores del ANOVA y las medias iguales a R; .docx válido con 17 cuadros exactos y 12 figuras a 300 ppp; 7 PDF vectoriales y 7 PNG a 600 ppp; TIFF iguales al PNG; proyecto .labg con 7 huellas SHA-256 iguales, su código R corrido completo y reabierto con los mismos cuadros; el guardado automático recupera el trabajo con los mismos cuadros",
  "renglones": [
   "Lectores: readxl, xml2, pdftools, png, openssl, commonmark (R) y el lector de imágenes del sistema"
  ],
  "fecha": "2026-11-04T03:04:37.424Z",
  "motor": "node v24.19.0"
 },
 "codigo-r": {
  "titulo": "El código R equivalente",
  "ok": true,
  "resumen": "99 escenarios de 65 métodos: el código R que muestra la app corre en R y da 1,626 números iguales a los de la app (tolerancia 1e-6)",
  "fecha": "2026-11-04T03:02:33.475Z",
  "motor": "node v24.19.0"
 },
 "accesibilidad": {
  "titulo": "Accesibilidad (AA)",
  "ok": true,
  "resumen": "242 revisiones de 121 escenarios (cada bloque, análisis de todas las familias, diálogos y el reporte) a 1280 y 360 px: 195,600 textos con contraste AA en claro y en oscuro, nombres y etiquetas, sin desborde lateral, Alt+→ / Alt+← y atajos. El foco con Tab de verdad: 1314 paradas en los 10 bloques (1280 px en claro y 360 px en oscuro), todas con su anillo visible.",
  "renglones": [
   "Sin axe-core (SIGMAPRO_AXE con la ruta de axe.min.js, o node_modules/axe-core): no se corrió."
  ],
  "fecha": "2026-11-04T03:17:45.403Z",
  "motor": "node v24.19.0"
 },
 "idioma": {
  "titulo": "La interfaz en inglés",
  "ok": true,
  "resumen": "6984 textos traducidos; 810 casos con los mismos números en los dos idiomas (71,773 valores); 272 resultados armados en inglés sin textos pendientes",
  "fecha": "2026-11-04T03:03:14.249Z",
  "motor": "node v24.19.0"
 },
 "regresion": {
  "titulo": "Regresión de resultados y reportes",
  "ok": true,
  "resumen": "272 casos, 70697 números; resultado cambiado en 0, reporte en 0",
  "fecha": "2026-11-04T03:03:18.241Z",
  "motor": "node v24.19.0"
 },
 "intro": {
  "titulo": "Secuencia de apertura",
  "ok": true,
  "resumen": "secuencia completa hasta «Start»: 5648 ms, 332 cuadros (59 por segundo; mediana 16.7 ms, p95 16.8 ms, 2 de más de 34 ms); 0 tareas largas del hilo principal en ese lapso; peso: js/intro.js + css/intro.css = 39.2 KB (sin imágenes ni fuentes)",
  "renglones": [],
  "fecha": "2026-11-04T03:04:18.852Z",
  "motor": "node v24.19.0"
 },
 "fundamentos": {
  "titulo": "Fundamentos de cada análisis",
  "ok": true,
  "resumen": "78 de 78 fichas sin problemas (78 análisis); 63 ejemplos corridos en node; 1472 fórmulas convertidas a MathML y a Office Math",
  "renglones": [],
  "fecha": "2026-11-04T03:05:41.524Z",
  "motor": "node v24.19.0"
 },
 "suite": {
  "titulo": "Enlaces y logos de la suite LABG",
  "ok": true,
  "resumen": "CorrelationPro: PENDIENTE (sin repositorio público; logo marcador); 14 de 14 enlaces responden 200",
  "renglones": [],
  "fecha": "2026-11-04T03:05:55.523Z",
  "motor": "node v24.19.0"
 },
 "glosario": {
  "titulo": "Glosario y «Ver en acción»",
  "ok": true,
  "resumen": "js/generado/glosario.js al día; 257 lugares señalados en español; 133 lugares en inglés",
  "renglones": [],
  "fecha": "2026-11-04T03:03:46.513Z",
  "motor": "node v24.19.0"
 },
 "orientacion": {
  "titulo": "Inicio, historial, estados vacíos, árbol, ayudas, recorridos, presentación, errores, Validación y la ficha en modo enfocado",
  "ok": true,
  "resumen": "Inicio: tres caminos; el ejemplo lleva a Datos; historial: anota, vuelve a abrir con su ejemplo y se lista en Análisis; estados vacíos: Explorar carga el ejemplo ahí mismo; Exportar lleva a Análisis; árbol: del Inicio a los bloques con sus líneas, el ejemplo calculado y la recomendación del asistente señalada; ayudas: con el teclado, Esc sin mover el foco y el estadístico de un encabezado; recorridos: Análisis con el ejemplo (7 pasos); pasos por bloque {\"1\":7,\"2\":6,\"3\":3,\"4\":7,\"5\":1,\"6\":1,\"7\":3,\"8\":4,\"9\":3,\"10\":1}; presentación: 10 diapositivas del resultado de bloques, → Inicio Fin y Esc con el foco de vuelta; el reporte, con su sección; errores: «Hacen falta al menos dos observaciones.» con «Qué hacer: Revisa los faltantes y el fil…»; Validación por enlace directo: esqueleto desde el principio, 120 de 849 casos y «Mostrar más», el detalle al abrirlo; desplazamiento acumulado en la carga 0.002; la ficha de Fundamentos en el modo enfocado: sus 9 apartados a la vista y el índice lleva a cada uno",
  "renglones": [],
  "fecha": "2026-11-04T03:04:02.306Z",
  "motor": "node v24.19.0"
 },
 "calidad": {
  "titulo": "Escalas en sus bordes y coherencia entre textos y números",
  "ok": true,
  "resumen": "39 escalas (con sus contextos), 108 bordes probados antes, en y después del límite, 147 tarjetas, una por zona; 272 casos del núcleo JS: 7,363 números en sus textos, 56 de ellos calculados por el texto (con su dirección); 2,765 tarjetas con los valores reales de los cuadros; control: de 2,698 números alterados, la comparación habría aceptado el 6.1 % de los alterados un 7 % y el 3.9 % de los alterados un 37 %",
  "renglones": [],
  "fecha": "2026-11-04T03:03:22.751Z",
  "motor": "node v24.19.0"
 },
 "enlaces": {
  "titulo": "Los enlaces y los íconos de la app",
  "ok": true,
  "resumen": "132 archivos que nombra index.html, todos presentes; 3 anclas de la página, 12 data-ir, 0 términos del glosario y 1 fichas nombradas en la página y en la interfaz; en la página viva: 4 términos del glosario, 82 fichas, 1 análisis del árbol, 9 bloques y 3 anclas enlazados, todos existen; 5 íconos (manifiesto y pestaña) que existen y miden lo que declaran; 9 de 9 direcciones externas responden",
  "renglones": [],
  "fecha": "2026-11-04T03:05:54.520Z",
  "motor": "node v24.19.0"
 },
 "lighthouse": {
  "titulo": "Lighthouse (teléfono y escritorio)",
  "ok": true,
  "resumen": "inicio teléfono: 99/100/100/100; fundamentos teléfono: 99/100/100/100; suite teléfono: 99/100/100/100; validacion teléfono: 99/100/100/100; inicio escritorio: 100/100/100/100; fundamentos escritorio: 100/100/100/100; suite escritorio: 100/100/100/100; validacion escritorio: 100/100/100/100 (rendimiento/accesibilidad/buenas prácticas/SEO)",
  "renglones": [],
  "fecha": "2026-10-10T03:21:35.841Z",
  "motor": "node v24.19.0"
 }
};
