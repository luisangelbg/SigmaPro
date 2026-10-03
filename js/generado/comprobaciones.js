/* Generado por las pruebas de tests/ (codigo-r, exportar, rendimiento, sin-conexion) — no editar a mano. */
window.SP_COMPROBACIONES = {
 "rendimiento": {
  "titulo": "Rendimiento con 99,941 filas",
  "ok": true,
  "resumen": "43 de 43 medidas dentro de su meta, en Chrome/154.0.0.0. Las metas del plan: Descriptivos de 10 variables: 105 ms (meta 150 ms); ANOVA de una vía + Tukey: 82 ms (meta 250 ms); Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 142 ms (meta 1.50 s).",
  "renglones": [
   "Crear la hoja (23 columnas): 295 ms (después 233 ms) · meta 1.50 s",
   "Leer un CSV de 9.4 MB: 696 ms (después 856 ms) · meta 1.50 s",
   "Filtrar con una expresión: 19 ms (después 12 ms) · meta 500 ms",
   "Tabla de análisis (todas las columnas): 99 ms (después 0 ms) · meta 500 ms",
   "Cargar en la app (rejilla y estructura): 208 ms · meta 1.50 s",
   "Descriptivos de 10 variables: 105 ms (después 90 ms) · meta 150 ms",
   "Descriptivos de 10 variables en 20 grupos (trat × A): 189 ms (después 167 ms) · meta 800 ms",
   "Frecuencias trat × bloque: 2 ms (después 1 ms) · meta 200 ms",
   "Bondad de ajuste de trat: 1 ms (después 0 ms) · meta 200 ms",
   "Supuestos del modelo bloques + tratamientos: 445 ms (después 415 ms) · meta 2.00 s",
   "Prueba t de Welch: 21 ms (después 20 ms) · meta 300 ms",
   "Mann-Whitney con Hodges-Lehmann: 74 ms (después 64 ms) · meta 1.50 s",
   "Kruskal-Wallis con Dunn: 86 ms (después 79 ms) · meta 800 ms",
   "ANOVA de una vía + Tukey: 82 ms (después 71 ms) · meta 250 ms",
   "Bloques al azar (5 tratamientos, 10 bloques): 210 ms (después 185 ms) · meta 500 ms",
   "Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 142 ms (después 124 ms) · meta 1.50 s",
   "Factorial en bloques con dosis numérica (tipo III): 629 ms (después 641 ms) · meta 1.50 s",
   "Parcelas divididas (A en parcelas grandes, B): 207 ms (después 200 ms) · meta 3.00 s",
   "Tukey de A dentro de cada B (factorial): 122 ms (después 126 ms) · meta 1.50 s",
   "Polinomios ortogonales de la dosis: 173 ms (después 172 ms) · meta 1.00 s",
   "ANCOVA en bloques (5 tratamientos, 1 covariable): 246 ms (después 249 ms) · meta 3.00 s",
   "Regresión múltiple con 10 predictores y diagnóstico: 716 ms (después 661 ms) · meta 2.00 s",
   "Regresión polinomial de grado 2: 237 ms (después 209 ms) · meta 1.50 s",
   "Selección paso a paso (AIC) entre 10 predictores: 129 ms (después 98 ms) · meta 1.50 s",
   "Mejores subconjuntos de 10 predictores (1 023 modelos): 48 ms (después 55 ms) · meta 1.50 s",
   "Modelo lineal general bloque + A * B + covariable: 210 ms (después 195 ms) · meta 3.00 s",
   "Correlación de Pearson: 167 ms (después 159 ms) · meta 200 ms",
   "Correlación de Spearman: 196 ms (después 195 ms) · meta 600 ms",
   "Correlación de Kendall (τ-b de Knight): 217 ms (después 218 ms) · meta 800 ms",
   "Matriz de Pearson de 10 variables: 148 ms (después 132 ms) · meta 500 ms",
   "Matriz de Kendall de 10 variables (45 pares): 2.94 s (después 2.65 s) · meta 8.00 s",
   "Correlación parcial con 3 controles: 59 ms (después 55 ms) · meta 500 ms",
   "Tabla de contingencia trat × l: 3 ms (después 1 ms) · meta 500 ms",
   "McNemar-Bowker de dos evaluaciones: 1 ms (después 0 ms) · meta 300 ms",
   "Cochran-Mantel-Haenszel grupo × resp × l: 2 ms (después 1 ms) · meta 500 ms",
   "Kappa de Cohen: 1 ms (después 0 ms) · meta 300 ms",
   "Bloque Análisis: factorial en bloques, calculado y pintado: 726 ms · meta 2.50 s",
   "Reporte de 5 análisis: calculado y pintado (bloque 5): 2.97 s · meta 5.00 s",
   "Figuras del reporte (bloque 6): 158 ms · meta 1.50 s",
   "Hoja de cálculo de los cuadros: 4 ms · meta 1.50 s",
   "Documento .docx (figuras a 300 ppp): 992 ms · meta 3.00 s",
   "Proyecto .labg (datos completos, comprimido): 1.66 s · meta 3.00 s",
   "Abrir el .labg y verificar sus huellas: 461 ms · meta 2.00 s"
  ],
  "fecha": "2026-10-03T04:16:28.520Z",
  "motor": "node v24.19.0"
 },
 "sin-conexion": {
  "titulo": "Privacidad y uso sin conexión",
  "ok": true,
  "resumen": "Con datos, 7 análisis, reporte y seis exportaciones, ningún dato salió del navegador: servida por http, 155 peticiones GET sin datos, todas a la propia app; fuera del equipo o del origen solo se piden las letras de la suite (3 archivos .woff2) y el código del motor R para el modelo mixto (43 descargas de webR y sus paquetes), todo con GET sin datos ni parámetros, también desde el hilo del motor. Sin red y con el servidor apagado, la app abre, calcula los análisis del núcleo, exporta y verifica las huellas del proyecto.",
  "renglones": [
   "Doble clic: 154 peticiones; 3 de letras al portal de la suite; 43 descargas del motor R (webR y paquetes).",
   "Servida por http: 155 peticiones GET a 79 archivos de la app, sin parámetros ni cuerpo.",
   "Servicio sin conexión activo con 78 archivos guardados.",
   "Sin red: 6 análisis, reporte, 6 exportaciones y huellas del proyecto verificadas."
  ],
  "fecha": "2026-10-03T19:20:47.626Z",
  "motor": "node v24.19.0"
 },
 "exportar": {
  "titulo": "Las exportaciones, leídas con lectores independientes",
  "ok": true,
  "resumen": "Hoja de cálculo: 246 números idénticos a la app y 24 valores del ANOVA y las medias iguales a R; .docx válido con 16 cuadros exactos y 7 figuras a 300 ppp; 7 PDF vectoriales y 7 PNG a 600 ppp; TIFF iguales al PNG; proyecto .labg con 7 huellas SHA-256 iguales, su código R corrido completo y reabierto con los mismos cuadros",
  "renglones": [
   "Lectores: readxl, xml2, pdftools, png, openssl (R) y el lector de imágenes del sistema"
  ],
  "fecha": "2026-10-03T19:18:26.036Z",
  "motor": "node v24.19.0"
 },
 "codigo-r": {
  "titulo": "El código R equivalente",
  "ok": true,
  "resumen": "47 escenarios de 29 métodos: el código R que muestra la app corre en R y da 699 números iguales a los de la app (tolerancia 1e-6)",
  "fecha": "2026-10-03T19:17:59.436Z",
  "motor": "node v24.19.0"
 },
 "accesibilidad": {
  "titulo": "Accesibilidad (AA)",
  "ok": true,
  "resumen": "100 revisiones de 50 escenarios (cada bloque, análisis de todas las familias, diálogos y el reporte) a 1280 y 360 px: 40,634 textos con contraste AA en claro y en oscuro, nombres y etiquetas, sin desborde lateral, Alt+→ / Alt+← y atajos. El foco con Tab de verdad: 582 paradas en los 8 bloques (1280 px en claro y 360 px en oscuro), todas con su anillo visible.",
  "renglones": [],
  "fecha": "2026-10-03T20:24:03.038Z",
  "motor": "node v24.19.0"
 }
};
