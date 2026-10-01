# Cambios

## Sin publicar

### Hito 1.1 · núcleo numérico (1 oct 2026)

- Distribuciones (`js/nucleo/dist.js`): log Γ (Lanczos), log B sin cancelación (Stirling reordenado), normal
  (Cody 1969, verificada contra serie y fracción continua propias), gamma y beta incompletas, t, F, ji cuadrada,
  gamma, beta, binomial, Poisson y rango estudentizado (Copenhaver y Holland 1988); cuantiles por el método de
  Brent en escala logarítmica o logit, hasta colas de 1e-300.
- Álgebra (`js/nucleo/algebra.js`): QR de Householder con el pivoteo limitado de R (tol 1e-7), mínimos
  cuadrados, (RᵀR)⁻¹, Cholesky y el espacio comprimido Q_kᵀX para ajustar submodelos en O(p³).
- Fórmulas (`js/nucleo/formula.js`): `~ + - * : / ^ %in% 0 1`, orden de términos de R, contrastes de
  tratamiento, suma cero, Helmert y polinomiales (también con dosis desiguales), regla de marginalidad para
  elegir contrastes o indicadoras, omisión de filas incompletas y de niveles sin datos.
- Modelo lineal (`js/nucleo/lineal.js`): coeficientes con EE, t y p, R², R² ajustada y F global; análisis de
  varianza con sumas de cuadrados tipo I, II y III (III siempre con suma cero y rechazada con alias).
- Validación: 68 casos nuevos contra R (6 813 valores), de los cuales 2 son de clase B documentados
  (`qtukey` y `qt` de R menos precisos que su propia función de distribución); 26 pruebas unitarias con
  identidades independientes de R; factorial con covariable de 100 000 filas en menos de 3 s.

### Hito 1.0 · cimientos (1 oct 2026)

- Núcleo sin DOM (`js/nucleo/`): espacio de nombres `SP` con textos centralizados (`SP.T`) y errores con
  arreglo (`SP.ErrorSP`); suma compensada, media y varianza en dos pasadas (`SP.num`); tabla en columnas
  con factores de niveles ordenados (`SP.tabla`); registro declarativo de métodos con regla de liberación
  (`SP.metodo`, `SP.metodoDisponible`); cálculos en hilos de trabajo armados desde el texto del núcleo,
  que funcionan con doble clic (`SP.hilo`).
- Validación: arnés de pruebas común a node y navegador, comparador con el criterio 1e-6 y sus reglas,
  generador de referencias con R (`tests/r/`), corredores `tests/correr.mjs` y `tests/navegador.mjs`,
  reporte HTML y CSV, y bloque 8 de la app con el mismo reporte.
- Interfaz: barra común de la suite, Navegador LABG y Estudio de figuras LABG (v1.0.0), portada con el
  estado de los hitos, bloques 2 a 7 anunciados y bloque 8 de validación.
- Primeros casos contra R: `SP.num.resumen` con PlantGrowth, airquality (37 faltantes), un desplazamiento
  de mil millones y magnitudes del orden de 1e-9.
