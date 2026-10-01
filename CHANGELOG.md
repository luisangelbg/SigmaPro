# Cambios

## Sin publicar

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
