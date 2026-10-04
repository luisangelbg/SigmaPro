# SigmaPro — referencia de series de tiempo (Hito 3.3): acf, pacf, Box.test y decompose de stats; mk.test y
# sens.slope del paquete trend (Pohlert, 2023).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

serie_de <- function(datos, y, tiempo) {
  x <- datos[[y]]
  if (nzchar(tiempo)) x <- x[order(datos[[tiempo]])]
  x
}

ref_acf <- function(datos, y, tiempo = "", rezagos = 0, lagBox = 0, fitdf = 0, nivel = 0.95) {
  x <- serie_de(datos, y, tiempo); n <- length(x)
  L <- if (rezagos > 0) min(rezagos, n - 1) else min(floor(10 * log10(n)), n - 1)
  lag <- min(if (lagBox > 0) lagBox else min(10, n - 1), n - 1)
  lb <- Box.test(x, lag = lag, type = "Ljung-Box", fitdf = fitdf); bp <- Box.test(x, lag = lag, type = "Box-Pierce", fitdf = fitdf)
  list(n = n, rezagos = L, acf = as.vector(acf(x, lag.max = L, plot = FALSE)$acf), pacf = as.vector(pacf(x, lag.max = L, plot = FALSE)$acf),
       banda = qnorm((1 + nivel) / 2) / sqrt(n),
       box = list(ljung_box = unname(lb$statistic), p_ljung_box = lb$p.value, box_pierce = unname(bp$statistic), p_box_pierce = bp$p.value, gl = unname(lb$parameter), lag = lag))
}

ref_desc <- function(datos, y, tiempo = "", frecuencia = 12, tipo = "aditiva") {
  x <- serie_de(datos, y, tiempo)
  d <- decompose(ts(x, frequency = frecuencia), type = if (tipo == "multiplicativa") "multiplicative" else "additive")
  list(n = length(x), frecuencia = frecuencia, tendencia = as.vector(d$trend), estacional = as.vector(d$seasonal), residuo = as.vector(d$random), figura = d$figure)
}

ref_tend <- function(datos, y, tiempo = "", nivel = 0.95) {
  x <- serie_de(datos, y, tiempo); x <- x[!is.na(x)]
  mk <- trend::mk.test(x); sn <- trend::sens.slope(x, conf.level = nivel)
  list(n = length(x), S = unname(mk$estimates["S"]), varS = unname(mk$estimates["varS"]), tau = unname(mk$estimates["tau"]), z = unname(mk$statistic), p = mk$p.value,
       pendiente = unname(sn$estimates), pendiente_inf = sn$conf.int[1], pendiente_sup = sn$conf.int[2])
}
