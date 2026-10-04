# SigmaPro — referencia de muestreo (Hito 3.1): las fórmulas de Cochran (1977, Sampling Techniques, 3.ª ed.) en R
# base, escritas por otro camino que la app: la varianza de una proporción 0/1 con var(), la del estratificado con
# (1/N²)·Σ N_h(N_h − n_h)s_h²/n_h y las medias por estrato con tapply.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

ref_tamano <- function(op) {
  z <- qnorm(1 - (1 - op$confianza) / 2)
  n0 <- if (op$tipo == "proporcion") z^2 * op$p * (1 - op$p) / op$error^2
        else if (op$escala == "relativo") (z * op$cv / op$error)^2
        else (z * op$de / op$error)^2
  n <- if (op$N > 0) n0 / (1 + n0 / op$N) else n0
  list(z = z, n0 = n0, n = n, n_entero = ceiling(n - 1e-9))
}

ref_simple <- function(y, N, confianza) {
  y <- y[!is.na(y)]; n <- length(y); f <- if (N > 0) n / N else 0
  m <- mean(y); s2 <- var(y); ee <- sqrt((1 - f) * s2 / n); t <- qt(1 - (1 - confianza) / 2, n - 1)
  out <- list(n = n, f = f, media = m, varianza = s2, de = sqrt(s2), ee = ee, t = t, ic = c(m - t * ee, m + t * ee))
  if (N > 0) out <- c(out, list(N = N, total = N * m, ee_total = N * ee, ic_total = N * c(m - t * ee, m + t * ee)))
  out
}

ref_estratificado <- function(y, h, Nh, confianza, nTotal = 0) {
  ok <- !is.na(y) & !is.na(h); y <- y[ok]; h <- factor(h[ok])
  Nh <- Nh[levels(h)]; N <- sum(Nh)
  nh <- as.vector(tapply(y, h, length)); m <- as.vector(tapply(y, h, mean)); s2 <- as.vector(tapply(y, h, var))
  W <- Nh / N; mst <- sum(Nh * m) / N
  V <- sum(Nh * (Nh - nh) * s2 / nh) / N^2; ee <- sqrt(V)
  g <- Nh * (Nh - nh) / nh
  gl <- sum(g * s2)^2 / sum((g * s2)^2 / (nh - 1))
  t <- qt(1 - (1 - confianza) / 2, gl)
  estratos <- lapply(seq_along(nh), function(k) list(estrato = levels(h)[k], Nh = unname(Nh[k]), nh = nh[k], W = unname(W[k]), f = nh[k] / unname(Nh[k]),
    media = m[k], varianza = s2[k], de = sqrt(s2[k]), aporte = unname(W[k])^2 * (1 - nh[k] / unname(Nh[k])) * s2[k] / nh[k]))
  out <- list(N = N, n = length(y), estratos = estratos, media = mst, ee = ee, gl = gl, t = t, ic = c(mst - t * ee, mst + t * ee),
              total = N * mst, ee_total = N * ee, ic_total = N * c(mst - t * ee, mst + t * ee))
  if (nTotal > 0) out$asignacion <- list(n = nTotal, proporcional = unname(nTotal * Nh / N), neyman = unname(nTotal * Nh * sqrt(s2) / sum(Nh * sqrt(s2))))
  out
}
