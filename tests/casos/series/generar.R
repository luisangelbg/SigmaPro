# Series de tiempo (núcleo JS). La referencia (tests/r/series.R) son acf, pacf, Box.test y decompose de stats, y
# mk.test y sens.slope del paquete trend. Datos sintéticos: precipitación mensual con estacionalidad, una serie AR(1)
# y otra independiente, rendimientos anuales con tendencia y empates, una serie desordenada que se ordena por el
# tiempo, un ciclo de frecuencia impar y la descomposición multiplicativa.
source(file.path("..", "..", "r", "series.R"), encoding = "UTF-8")
F_SINT <- "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_acf <- function(nombre, titulo, datos, y, tiempo = "", rezagos = 0, lagBox = 0, fitdf = 0, nivel = 0.95)
  sp_caso(nombre, objetivo = "autocorrelacion", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "A", datos = datos,
    entradas = ent(respuesta = y, tiempo = tiempo), opciones = list(rezagos = rezagos, lagBox = lagBox, fitdf = fitdf, nivel = nivel),
    esperado = ref_acf(datos, y, tiempo, rezagos, lagBox, fitdf, nivel), paquetes = "stats", codigo = "acf(); pacf(); Box.test() (tests/r/series.R)")
caso_desc <- function(nombre, titulo, datos, y, tiempo = "", frecuencia = 12, tipo = "aditiva")
  sp_caso(nombre, objetivo = "descomposicion", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "A", datos = datos,
    entradas = ent(respuesta = y, tiempo = tiempo), opciones = list(frecuencia = frecuencia, tipo = tipo),
    esperado = ref_desc(datos, y, tiempo, frecuencia, tipo), paquetes = "stats", codigo = sprintf("decompose(ts(x, frequency = %s), type = \"%s\")", frecuencia, tipo))
caso_tend <- function(nombre, titulo, datos, y, tiempo = "", nivel = 0.95)
  sp_caso(nombre, objetivo = "tendencia", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "A", datos = datos,
    entradas = ent(respuesta = y, tiempo = tiempo), opciones = list(nivel = nivel),
    esperado = ref_tend(datos, y, tiempo, nivel), paquetes = "trend", codigo = sprintf("trend::mk.test(x); trend::sens.slope(x, conf.level = %s)", nivel))

# ---- 1. precipitación mensual de 6 años (estacional, con una ligera tendencia)
set.seed(331)
m <- 1:72
lluvia <- data.frame(mes = m, precipitacion = round(pmax(0, 60 + 0.3 * m + 55 * sin(2 * pi * (m - 4) / 12) + rnorm(72, 0, 12)), 1))
caso_acf("lluvia-acf", "Precipitación mensual: ACF y PACF automáticas, Ljung-Box con 12 rezagos", lluvia, "precipitacion", "mes", lagBox = 12)
caso_desc("lluvia-aditiva", "Precipitación mensual: descomposición aditiva (frecuencia 12)", lluvia, "precipitacion", "mes")
caso_tend("lluvia-tendencia", "Precipitación mensual: Mann-Kendall y Sen", lluvia, "precipitacion", "mes")

# ---- 2. ventas trimestrales de semilla (multiplicativa), filas desordenadas que se ordenan por el tiempo
set.seed(332)
q <- 1:28
sem <- data.frame(trimestre = q, toneladas = round(exp(log(40) + 0.02 * q + log(c(0.7, 1.3, 1.2, 0.8))[(q - 1) %% 4 + 1] + rnorm(28, 0, 0.05)), 2))
sem <- sem[sample(28), ]
caso_desc("semilla-multiplicativa", "Ventas trimestrales: descomposición multiplicativa, filas desordenadas", sem, "toneladas", "trimestre", frecuencia = 4, tipo = "multiplicativa")
caso_acf("semilla-acf-ordenada", "Ventas trimestrales ordenadas por el tiempo: 8 rezagos, Box con fitdf = 1, 90 %", sem, "toneladas", "trimestre", rezagos = 8, lagBox = 6, fitdf = 1, nivel = 0.9)

# ---- 3. AR(1) y ruido blanco, sin columna de tiempo
set.seed(333)
ar <- data.frame(y = round(as.vector(arima.sim(list(ar = 0.7), n = 50)), 3), ruido = round(rnorm(50), 3))
caso_acf("ar1-acf", "Serie AR(1) con φ = 0.7: la PACF se corta en el rezago 1", ar, "y")
caso_acf("ruido-blanco", "Ruido blanco: sin autocorrelación", ar, "ruido", lagBox = 5)

# ---- 4. rendimiento anual con tendencia, empates y un año faltante
rend <- data.frame(anio = 2001:2024, rendimiento = c(3.1, 3.3, 3.2, 3.5, 3.5, 3.4, 3.8, 3.6, 3.9, 4.0, 3.9, 4.2, 4.1, 4.4, 4.4, 4.3, 4.6, NA, 4.8, 4.7, 5.0, 4.9, 5.2, 5.1))
caso_tend("rendimiento-anual-empates", "Rendimiento anual con empates y un año faltante (se omite)", rend, "rendimiento", "anio")
caso_tend("rendimiento-anual-90", "El mismo rendimiento con intervalo de Sen al 90 %", rend, "rendimiento", "anio", nivel = 0.9)

# ---- 5. sin tendencia y frecuencia impar (días de la semana: capturas en una trampa)
set.seed(334)
dd <- 1:35
trampa <- data.frame(dia = dd, insectos = round(20 + c(2, 5, 8, 6, 1, -4, -6)[(dd - 1) %% 7 + 1] + rnorm(35, 0, 2)))
caso_desc("trampa-frecuencia-7", "Capturas diarias con ciclo semanal (frecuencia impar, 7)", trampa, "insectos", "dia", frecuencia = 7)
caso_tend("trampa-sin-tendencia", "Capturas diarias sin tendencia (muchos empates)", trampa, "insectos", "dia")
