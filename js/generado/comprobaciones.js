/* Generado por las pruebas de tests/ (codigo-r, exportar, rendimiento, sin-conexion) — no editar a mano. */
window.SP_COMPROBACIONES = {
 "rendimiento": {
  "titulo": "Rendimiento con 99,941 filas",
  "ok": true,
  "resumen": "53 de 53 medidas dentro de su meta, en Chrome/154.0.0.0. Las metas del plan: Descriptivos de 10 variables: 127 ms (meta 150 ms); ANOVA de una vía + Tukey: 85 ms (meta 250 ms); Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 141 ms (meta 1.50 s).",
  "renglones": [
   "Crear la hoja (25 columnas): 246 ms (después 213 ms) · meta 1.50 s",
   "Leer un CSV de 9.8 MB: 726 ms (después 824 ms) · meta 1.50 s",
   "Filtrar con una expresión: 20 ms (después 13 ms) · meta 500 ms",
   "Tabla de análisis (todas las columnas): 98 ms (después 0 ms) · meta 500 ms",
   "Cargar en la app (rejilla y estructura): 213 ms · meta 1.50 s",
   "Descriptivos de 10 variables: 127 ms (después 112 ms) · meta 150 ms",
   "Descriptivos de 10 variables en 20 grupos (trat × A): 181 ms (después 173 ms) · meta 800 ms",
   "Frecuencias trat × bloque: 2 ms (después 1 ms) · meta 200 ms",
   "Bondad de ajuste de trat: 3 ms (después 0 ms) · meta 200 ms",
   "Supuestos del modelo bloques + tratamientos: 488 ms (después 463 ms) · meta 2.00 s",
   "Prueba t de Welch: 28 ms (después 26 ms) · meta 300 ms",
   "Mann-Whitney con Hodges-Lehmann: 75 ms (después 69 ms) · meta 1.50 s",
   "Kruskal-Wallis con Dunn: 105 ms (después 83 ms) · meta 800 ms",
   "ANOVA de una vía + Tukey: 85 ms (después 74 ms) · meta 250 ms",
   "Bloques al azar (5 tratamientos, 10 bloques): 241 ms (después 192 ms) · meta 500 ms",
   "Factorial 4 × 3 × 2 desbalanceado, SC tipo III: 141 ms (después 132 ms) · meta 1.50 s",
   "Factorial en bloques con dosis numérica (tipo III): 681 ms (después 672 ms) · meta 1.50 s",
   "Parcelas divididas (A en parcelas grandes, B): 163 ms (después 169 ms) · meta 3.00 s",
   "Tukey de A dentro de cada B (factorial): 135 ms (después 130 ms) · meta 1.50 s",
   "Polinomios ortogonales de la dosis: 166 ms (después 163 ms) · meta 1.00 s",
   "ANCOVA en bloques (5 tratamientos, 1 covariable): 308 ms (después 242 ms) · meta 3.00 s",
   "Regresión múltiple con 10 predictores y diagnóstico: 805 ms (después 754 ms) · meta 2.00 s",
   "Regresión polinomial de grado 2: 228 ms (después 208 ms) · meta 1.50 s",
   "Selección paso a paso (AIC) entre 10 predictores: 129 ms (después 127 ms) · meta 1.50 s",
   "Mejores subconjuntos de 10 predictores (1 023 modelos): 72 ms (después 70 ms) · meta 1.50 s",
   "Modelo lineal general bloque + A * B + covariable: 253 ms (después 214 ms) · meta 3.00 s",
   "Correlación de Pearson: 138 ms (después 135 ms) · meta 200 ms",
   "Correlación de Spearman: 168 ms (después 174 ms) · meta 600 ms",
   "Correlación de Kendall (τ-b de Knight): 192 ms (después 193 ms) · meta 800 ms",
   "Matriz de Pearson de 10 variables: 236 ms (después 237 ms) · meta 500 ms",
   "Matriz de Kendall de 10 variables (45 pares): 3.02 s (después 3.01 s) · meta 8.00 s",
   "Correlación parcial con 3 controles: 83 ms (después 82 ms) · meta 500 ms",
   "Tabla de contingencia trat × l: 4 ms (después 2 ms) · meta 500 ms",
   "McNemar-Bowker de dos evaluaciones: 2 ms (después 1 ms) · meta 300 ms",
   "Cochran-Mantel-Haenszel grupo × resp × l: 4 ms (después 1 ms) · meta 500 ms",
   "Kappa de Cohen: 1 ms (después 0 ms) · meta 300 ms",
   "Conteos (Poisson o binomial negativa) en bloques: 1.13 s (después 1.08 s) · meta 3.00 s",
   "Proporciones 0/1 (binomial) en bloques: 1.11 s (después 1.12 s) · meta 3.00 s",
   "Componentes de varianza por REML (bloque y l aleatorios, trat fijo): 583 ms (después 558 ms) · meta 5.00 s",
   "Respuesta con meseta (cuadrático-meseta) por A: 108 ms (después 91 ms) · meta 3.00 s",
   "Superficie de respuesta dosis × plantas: 99 ms (después 87 ms) · meta 3.00 s",
   "Ensayo en varios ambientes (5 genotipos × 6 ambientes, bloques): 192 ms (después 185 ms) · meta 3.00 s",
   "AMMI de 5 genotipos en 6 ambientes: 204 ms (después 193 ms) · meta 3.00 s",
   "Arrancar el motor R y cargar lme4: 9.27 s · meta 120.00 s",
   "Modelo mixto rend ~ trat * A + (1 | bloque): 4.33 s · meta 30.00 s",
   "Bloques al azar con bloques aleatorios: 1.54 s · meta 30.00 s",
   "Bloque Análisis: factorial en bloques, calculado y pintado: 1.08 s · meta 2.50 s",
   "Reporte de 5 análisis: calculado y pintado (bloque 5): 3.28 s · meta 5.00 s",
   "Figuras del reporte (bloque 6): 154 ms · meta 1.50 s",
   "Hoja de cálculo de los cuadros: 6 ms · meta 1.50 s",
   "Documento .docx (figuras a 300 ppp): 1.16 s · meta 3.00 s",
   "Proyecto .labg (datos completos, comprimido): 1.95 s · meta 3.00 s",
   "Abrir el .labg y verificar sus huellas: 938 ms · meta 2.00 s"
  ],
  "fecha": "2026-10-04T04:44:08.684Z",
  "motor": "node v24.19.0"
 },
 "sin-conexion": {
  "titulo": "Privacidad y uso sin conexión",
  "ok": true,
  "resumen": "Con datos, 7 análisis, reporte y seis exportaciones, ningún dato salió del navegador: servida por http, 271 peticiones GET sin datos, todas a la propia app; con doble clic, fuera del equipo solo se pide el código del motor R para el modelo mixto (43 descargas de webR y sus paquetes); servida por http con su repositorio propio, ni eso: el motor sale del mismo origen, todo con GET sin datos ni parámetros, también desde el hilo del motor. Sin red y con el servidor apagado, la app abre, calcula los análisis del núcleo y el modelo mixto en el motor R guardado, exporta y verifica las huellas del proyecto.",
  "renglones": [
   "Doble clic: 167 peticiones; fuera del equipo, solo 43 descargas del motor R (webR y paquetes).",
   "Servida por http: 271 peticiones GET a 136 archivos de la app, sin parámetros ni cuerpo.",
   "Servicio sin conexión activo con 135 archivos guardados.",
   "Sin red: 7 análisis, reporte, 6 exportaciones y huellas del proyecto verificadas."
  ],
  "fecha": "2026-10-04T05:35:17.802Z",
  "motor": "node v24.19.0"
 },
 "exportar": {
  "titulo": "Las exportaciones, leídas con lectores independientes",
  "ok": true,
  "resumen": "Hoja de cálculo: 246 números idénticos a la app y 24 valores del ANOVA y las medias iguales a R; .docx válido con 16 cuadros exactos y 7 figuras a 300 ppp; 7 PDF vectoriales y 7 PNG a 600 ppp; TIFF iguales al PNG; proyecto .labg con 7 huellas SHA-256 iguales, su código R corrido completo y reabierto con los mismos cuadros",
  "renglones": [
   "Lectores: readxl, xml2, pdftools, png, openssl (R) y el lector de imágenes del sistema"
  ],
  "fecha": "2026-10-04T05:51:47.914Z",
  "motor": "node v24.19.0"
 },
 "codigo-r": {
  "titulo": "El código R equivalente",
  "ok": true,
  "resumen": "69 escenarios de 50 métodos: el código R que muestra la app corre en R y da 909 números iguales a los de la app (tolerancia 1e-6)",
  "fecha": "2026-10-04T05:34:19.485Z",
  "motor": "node v24.19.0"
 },
 "accesibilidad": {
  "titulo": "Accesibilidad (AA)",
  "ok": true,
  "resumen": "150 revisiones de 75 escenarios (cada bloque, análisis de todas las familias, diálogos y el reporte) a 1280 y 360 px: 76,528 textos con contraste AA en claro y en oscuro, nombres y etiquetas, sin desborde lateral, Alt+→ / Alt+← y atajos. El foco con Tab de verdad: 569 paradas en los 8 bloques (1280 px en claro y 360 px en oscuro), todas con su anillo visible.",
  "renglones": [],
  "fecha": "2026-10-04T05:41:35.647Z",
  "motor": "node v24.19.0"
 }
};
