# Casos de SP.num.resumen: n, faltantes, media, varianza, DE, mínimo y máximo.
# Son los cimientos de toda suma de cuadrados del programa.

resumen <- function(x) list(
  n = sum(!is.na(x)), faltantes = sum(is.na(x)),
  media = mean(x, na.rm = TRUE), varianza = var(x, na.rm = TRUE), de = sd(x, na.rm = TRUE),
  min = min(x, na.rm = TRUE), max = max(x, na.rm = TRUE)
)
codigo <- paste(
  "n = sum(!is.na(x)); faltantes = sum(is.na(x))",
  "media = mean(x, na.rm = TRUE); varianza = var(x, na.rm = TRUE); de = sd(x, na.rm = TRUE)",
  "min = min(x, na.rm = TRUE); max = max(x, na.rm = TRUE)", sep = "\n")

sp_caso("plantgrowth", objetivo = "num.resumen",
  titulo = "Peso seco de 30 plantas (tres tratamientos juntos)",
  fuente = "Dobson (1983); conjunto PlantGrowth de R",
  datos = PlantGrowth["weight"], argumentos = list(list(columna = "weight")),
  esperado = resumen(PlantGrowth$weight), codigo = codigo)

sp_caso("ozono-con-faltantes", objetivo = "num.resumen",
  titulo = "Ozono diario con 37 faltantes de 153",
  fuente = "Chambers y col. (1983); conjunto airquality de R",
  datos = airquality["Ozone"], argumentos = list(list(columna = "Ozone")),
  esperado = resumen(airquality$Ozone), codigo = codigo)

# Datos con un desplazamiento enorme: la fórmula de una pasada, Σx² − (Σx)²/n,
# pierde todas las cifras aquí; la varianza exacta es 30.
d <- data.frame(x = 1e9 + c(4, 7, 13, 16))
sp_caso("desplazamiento-grande", objetivo = "num.resumen",
  titulo = "Cuatro valores alrededor de mil millones (varianza exacta = 30)",
  fuente = "Datos sintéticos (ejemplo clásico de cancelación numérica)",
  datos = d, argumentos = list(list(columna = "x")),
  esperado = resumen(d$x), codigo = codigo)

# Magnitudes muy pequeñas: el criterio mixto aprobaría cualquier cosa cerca de cero,
# así que este caso exige error relativo.
d <- data.frame(x = c(3.1e-9, 2.7e-9, 4.4e-9, 3.9e-9, 2.2e-9, 3.6e-9))
sp_caso("magnitudes-pequenas", objetivo = "num.resumen",
  titulo = "Seis concentraciones del orden de 1e-9 (comparación relativa)",
  fuente = "Datos sintéticos",
  datos = d, argumentos = list(list(columna = "x")),
  esperado = resumen(d$x), codigo = codigo,
  comparacion = list(modo = "relativo"))
