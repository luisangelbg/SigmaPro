# Modelos ARIMA (núcleo JS). La referencia (tests/r/arima.R) es arima de stats en su óptimo exacto (dos pasos: el
# óptimo con tolerancias estrictas y arima evaluado ahí con sus opciones por omisión), predict.Arima y Box.test de los
# residuos. Cubre AR, ARMA con media, integrados, un SARIMA con media, el modelo «airline» de los pasajeros aéreos,
# el lago Hurón, faltantes dentro de la serie (solo ML) y la búsqueda del orden por AIC.
source(file.path("..", "..", "r", "arima.R"), encoding = "UTF-8")
F_SINT <- "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_arima <- function(nombre, titulo, datos, y, tiempo = "", orden = c(1, 0, 0), estacional = c(0, 0, 0), periodo = 1, media = TRUE, h = 12, nivel = 0.95,
                       buscar = FALSE, fuente = F_SINT) {
  esperado <- if (buscar) {
    b <- ref_aic_rejilla(datos, y, tiempo, orden[2], estacional[2], periodo, media)
    el <- b$elegido
    c(ref_arima(datos, y, tiempo, c(el[1], orden[2], el[2]), c(el[3], estacional[2], el[4]), periodo, media, h, nivel), list(busqueda = list(aic = b$aic, elegido = el)))
  } else ref_arima(datos, y, tiempo, orden, estacional, periodo, media, h, nivel)
  # con diferenciación, la inicial difusa (κ = 1e6) deja en la verosimilitud un ruido de ~1e-13: el óptimo queda fijo a ~1e-6
  M <- "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
  cmp <- if (orden[2] + estacional[2] > 0) list(tolerancias = setNames(lapply(1:6, function(i) list(tol = if (estacional[2] > 0) 5e-5 else 1e-5, motivo = M)),
    c("coef[*]", "ee[*]", "residuos[*]", "pronostico.*", "box.*", "sigma2"))) else NULL
  sp_caso(nombre, objetivo = "arima", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", comparacion = cmp, datos = datos, entradas = ent(respuesta = y, tiempo = tiempo),
    opciones = list(p = orden[1], d = orden[2], q = orden[3], P = estacional[1], D = estacional[2], Q = estacional[3], periodo = periodo, media = media,
                    buscar = buscar, horizonte = h, nivel = nivel, lagBox = 0),
    esperado = esperado, paquetes = "stats", codigo = sprintf("arima(x, order = c(%s), seasonal = list(order = c(%s), period = %s), include.mean = %s) en su óptimo; predict; Box.test",
      paste(orden, collapse = ", "), paste(estacional, collapse = ", "), periodo, media))
}

# ---- 1. AR(1) con media
set.seed(371)
ar1 <- data.frame(anio = 1901:2020, y = round(as.vector(arima.sim(list(ar = 0.5), n = 120)) * 2 + 50, 3))
caso_arima("ar1-media", "AR(1) con media, pronóstico a 12 años", ar1, "y", "anio", c(1, 0, 0))

# ---- 2. ARMA(2, 1) con media y las filas desordenadas
set.seed(372)
arma <- data.frame(t = 1:150, rendimiento = round(as.vector(arima.sim(list(ar = c(0.5, -0.3), ma = 0.4), n = 150)) + 7, 4))
arma <- arma[sample(150), ]
caso_arima("arma21-desordenada", "ARMA(2, 1) con media, filas desordenadas que se ordenan por el tiempo, 90 %", arma, "rendimiento", "t", c(2, 0, 1), nivel = 0.9, h = 8)

# ---- 3. IMA(1, 1) y ARIMA(1, 1, 1) sin media (una diferencia)
set.seed(373)
ima <- data.frame(semana = 1:100, precio = round(cumsum(as.vector(arima.sim(list(ma = -0.4), n = 100))) + 30, 3))
caso_arima("ima11", "IMA(1, 1): una diferencia y una media móvil", ima, "precio", "semana", c(0, 1, 1))
caso_arima("arima111", "ARIMA(1, 1, 1)", ima, "precio", "semana", c(1, 1, 1), h = 6)

# ---- 4. el lago Hurón (nivel anual, 1875-1972): AR(2) con media (Brockwell y Davis)
lh <- data.frame(anio = 1875:1972, nivel = as.vector(datasets::LakeHuron))
caso_arima("lago-huron-ar2", "Nivel del lago Hurón: AR(2) con media", lh, "nivel", "anio", c(2, 0, 0), h = 10,
  fuente = "datasets::LakeHuron de R (Brockwell y Davis, 1991); referencia: stats::arima en su óptimo")

# ---- 5. el modelo «airline» con log de los pasajeros aéreos (Box y Jenkins)
ap <- data.frame(mes = 1:144, log_pasajeros = log(as.vector(datasets::AirPassengers)))
caso_arima("airline-pasajeros", "Pasajeros aéreos (log): SARIMA(0, 1, 1)(0, 1, 1)12, el modelo «airline»", ap, "log_pasajeros", "mes", c(0, 1, 1), c(0, 1, 1), 12, h = 24,
  fuente = "datasets::AirPassengers de R (Box y Jenkins, 1976); referencia: stats::arima en su óptimo")

# ---- 6. SARIMA(1, 0, 0)(0, 1, 1)12: lluvia mensual con su ciclo anual
set.seed(376)
m <- 1:96
lluvia <- data.frame(mes = m, mm = round(80 + 50 * sin(2 * pi * (m - 4) / 12) + as.vector(arima.sim(list(ar = 0.4), n = 96, sd = 12)), 1))
caso_arima("sarima-diferencia-estacional", "SARIMA(1, 0, 0)(0, 1, 1)12: diferencia estacional y media móvil estacional", lluvia, "mm", "mes", c(1, 0, 0), c(0, 1, 1), 12)

# ---- 7. faltantes dentro de la serie: el filtro de Kalman los salta (solo máxima verosimilitud)
falt <- ar1; falt$y[c(15, 16, 60, 101)] <- NA
caso_arima("ar1-faltantes", "AR(1) con cuatro faltantes dentro de la serie", falt, "y", "anio", c(1, 0, 0))

# ---- 8. MA(2) sin media
set.seed(378)
ma2 <- data.frame(y = round(as.vector(arima.sim(list(ma = c(0.6, 0.3)), n = 80)), 4))
caso_arima("ma2-sin-media", "MA(2) sin media y sin columna de tiempo", ma2, "y", orden = c(0, 0, 2), media = FALSE, h = 5)

# ---- 9. la búsqueda del orden por AIC (p, q = 0…2)
caso_arima("busqueda-aic", "Búsqueda del orden por AIC entre p, q = 0, 1, 2 (ARMA con media)", ar1, "y", "anio", c(1, 0, 0), buscar = TRUE, h = 5)
