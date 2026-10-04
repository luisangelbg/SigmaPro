# SigmaPro — referencia de los modelos ARIMA (Hito 3.7): arima y predict.Arima de stats, Box.test de los residuos.
# arima optimiza con BFGS y reltol = 1e-8: su óptimo solo tiene unas 4 a 5 cifras. La referencia lo pule en dos pasos:
# 1) desde el arima por omisión, ML con tolerancias estrictas (reltol = 1e-15, ndeps = 1e-7) da el óptimo;
# 2) arima con init en ese óptimo y maxit = 0 da lo que arima reporta ahí con sus opciones por omisión (el hessiano
#    numérico de optim con ndeps = 1e-3 y su parscale, σ², la verosimilitud, los residuos y el estado para predecir).
# Con diferenciación (d o D > 0), arima arranca la parte no estacionaria con la varianza difusa κ = 1e6: la resta
# P − MM'/F de los primeros pasos pierde unas 6 cifras y la verosimilitud trae un ruido de ~1e-13 (en R y en la app),
# así que el óptimo solo queda fijo a ~1e-6. Esos casos se comparan con 1e-5 (con el motivo en el caso).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

serie_arima <- function(datos, y, tiempo) {
  x <- datos[[y]]
  if (nzchar(tiempo)) x <- x[order(datos[[tiempo]])]
  x
}

# arima(method = "ML", init = ...) transforma init dos veces (al revisarlo y antes de optimizar): para que arranque en
# los coeficientes c se le da undoPars(c), que la primera transformación devuelve a c.
init_ml <- function(fit) .Call(stats:::C_ARIMA_undoPars, as.double(coef(fit)), fit$arma)

ajuste_arima <- function(x, orden, estacional, periodo, media) {
  xs <- ts(x, frequency = max(1, periodo))
  sea <- list(order = estacional, period = max(1, periodo))
  k <- sum(orden[-2]) + sum(estacional[-2]) + (media && orden[2] + estacional[2] == 0)
  a0 <- arima(xs, orden, seasonal = sea, include.mean = media)
  if (k == 0) return(a0)
  # ML con tolerancias estrictas desde el ajuste por omisión (en la etapa CSS una tolerancia extrema puede llevar un AR al borde)
  a1 <- arima(xs, orden, seasonal = sea, include.mean = media, method = "ML", init = init_ml(a0), optim.control = list(reltol = 1e-15, maxit = 5000, ndeps = rep(1e-7, k)))
  arima(xs, orden, seasonal = sea, include.mean = media, method = "ML", init = init_ml(a1), optim.control = list(maxit = 0))
}

ref_arima <- function(datos, y, tiempo = "", orden = c(1, 0, 0), estacional = c(0, 0, 0), periodo = 1, media = TRUE, h = 12, nivel = 0.95, lagBox = 0) {
  x <- serie_arima(datos, y, tiempo)
  fit <- ajuste_arima(x, orden, estacional, periodo, media)
  pr <- predict(fit, n.ahead = h)
  z <- qnorm(1 - (1 - nivel) / 2)
  res <- as.vector(residuals(fit))
  npar <- sum(fit$mask)
  lag <- if (lagBox > 0) lagBox else if (periodo > 1 && sum(estacional) > 0) min(2 * periodo, length(x) - 1) else min(10, length(x) - 1)
  bt <- Box.test(res, lag = lag, type = "Ljung-Box", fitdf = sum(orden[-2]) + sum(estacional[-2]))
  list(coef = I(unname(coef(fit))), nombres = I(names(coef(fit))), ee = I(if (npar) unname(sqrt(diag(fit$var.coef))) else numeric(0)),
       sigma2 = fit$sigma2, loglik = fit$loglik, aic = fit$aic, bic = BIC(fit), n = fit$nobs,
       residuos = I(res),
       pronostico = list(media = I(as.vector(pr$pred)), ee = I(as.vector(pr$se)), inf = I(as.vector(pr$pred - z * pr$se)), sup = I(as.vector(pr$pred + z * pr$se))),
       box = list(q = unname(bt$statistic), gl = unname(bt$parameter), p = bt$p.value, lag = lag))
}

# la búsqueda del orden: el AIC de cada (p, q) (y (P, Q) si hay periodo), con el d y D dados
ref_aic_rejilla <- function(datos, y, tiempo = "", d = 0, D = 0, periodo = 1, media = TRUE, maxpq = 2, maxPQ = 1) {
  x <- serie_arima(datos, y, tiempo)
  est <- periodo > 1 && maxPQ > 0
  filas <- list()
  for (P in 0:(if (est) maxPQ else 0)) for (Q in 0:(if (est) maxPQ else 0)) for (p in 0:maxpq) for (q in 0:maxpq) {
    a <- tryCatch(ajuste_arima(x, c(p, d, q), c(P, D, Q), periodo, media)$aic, error = function(e) NA)
    filas[[length(filas) + 1]] <- c(p, q, P, Q, a)
  }
  m <- do.call(rbind, filas)
  list(aic = unname(m[, 5]), elegido = unname(m[which.min(m[, 5]), 1:4]))
}
