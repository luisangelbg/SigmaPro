# SigmaPro — referencia de los ensayos multiambiente y la estabilidad (Hito 2.8), en R base (sin paquetes).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Todo parte de la tabla de medias genotipo × ambiente (tapply) con el error combinado de los análisis de cada
# ambiente (lm(y ~ repetición + genotipo) en cada uno; r = media armónica de las parcelas por celda):
#   - análisis conjunto: anova(lm(y ~ amb + amb:rep + gen + gen:amb)); ambientes contra repeticiones dentro de
#     ambientes, lo demás contra el error; genotipos contra G × A (ambientes aleatorios) aparte; Bartlett con los
#     cuadrados medios del error de cada ambiente;
#   - estabilidad: un lm por genotipo sobre el índice ambiental (Finlay y Wilkinson 1963; Eberhart y Russell 1966), con
#     el EE de b de su propia regresión o del error combinado (como metan); el análisis de Eberhart y Russell con las
#     desviaciones combinadas en g(e − 2) gl, como el original; ecovalencia de Wricke (1962, escala de parcela), varianza
#     de Shukla (1972, escala de medias) y superioridad de Lin y Binns (1988), en fórmula cerrada;
#   - AMMI: svd() de la interacción, F de Gollob (1968) y F_R de Cornelius et al. (1992), puntajes simétricos, ASV;
#   - GGE: svd() de la tabla centrada por ambiente, tres particiones del valor singular, quién ganó dónde (producto
#     interno y chull()) y media contra estabilidad (coordenada del ambiente promedio, Yan 2001).
# El signo de cada eje es arbitrario: se fija con el ambiente de mayor |puntaje| positivo (en el GGE, el primer eje
# con la suma de los puntajes de ambiente positiva), como en la app.

ma_preparar <- function(datos, y, gen, amb, rep = "") {
  vars <- c(y, gen, amb, if (nzchar(rep)) rep)
  d <- datos[complete.cases(datos[vars]), , drop = FALSE]
  G <- droplevels(d[[gen]]); A <- droplevels(d[[amb]]); R <- if (nzchar(rep)) droplevels(factor(d[[rep]])) else NULL
  Y <- tapply(d[[y]], list(G, A), mean); N <- tapply(d[[y]], list(G, A), length)
  stopifnot(!anyNA(Y))
  list(d = d, y = d[[y]], G = G, A = A, R = R, Y = unname(Y), N = unname(N), genos = levels(G), ambs = levels(A))
}

ma_orientar <- function(U, V, primero_suma = FALSE) {
  for (k in seq_len(ncol(V))) {
    voltear <- if (primero_suma && k == 1) sum(V[, k]) < 0 else V[which.max(abs(V[, k])), k] < 0
    if (voltear) { U[, k] <- -U[, k]; V[, k] <- -V[, k] }
  }
  list(U = U, V = V)
}

ref_multiambiente <- function(datos, y, gen, amb, rep = "", alfa = 0.05, escala = "ninguna", particion = "simetrica", objetivo = "maximo", eeb = "propio") {
  p <- ma_preparar(datos, y, gen, amb, rep)
  Y <- p$Y; g <- nrow(Y); e <- ncol(Y); r <- 1 / mean(1 / p$N)
  gm <- rowMeans(Y); em <- colMeans(Y); gran <- mean(Y)
  Z <- Y - outer(gm, rep(1, e)) - outer(rep(1, g), em) + gran
  # error de cada ambiente
  amb_tab <- NULL; cme <- NA; gle <- 0
  por <- lapply(seq_len(e), function(j) {
    s <- p$A == p$ambs[j]; yy <- p$y[s]; GG <- droplevels(p$G[s])
    m <- if (!is.null(p$R)) lm(yy ~ droplevels(p$R[s]) + GG) else lm(yy ~ GG)
    a <- if (m$df.residual > 0) anova(m) else NULL; fg <- if (is.null(a)) 0 else nrow(a) - 1
    list(media = mean(yy), cme = if (m$df.residual > 0) deviance(m) / m$df.residual else NA, gl = m$df.residual,
         F = if (m$df.residual > 0) a[fg, "F value"] else NA, p = if (m$df.residual > 0) a[fg, "Pr(>F)"] else NA)
  })
  con <- vapply(por, function(x) x$gl > 0, TRUE)
  out <- list(genotipos = p$genos, ambientes_nombre = p$ambs, tabla = Y, r = r)
  if (any(con)) {
    gle <- sum(vapply(por[con], function(x) x$gl, 0)); cme <- sum(vapply(por[con], function(x) x$cme * x$gl, 0)) / gle
    out$ambientes <- list(media = vapply(por, function(x) x$media, 0), cme = vapply(por, function(x) x$cme, 0), gl = vapply(por, function(x) x$gl, 0),
                          cv = vapply(por, function(x) 100 * sqrt(x$cme) / x$media, 0), F = vapply(por, function(x) x$F, 0), p = vapply(por, function(x) x$p, 0))
    out$cme <- cme; out$gle <- gle
    if (sum(con) >= 2) {
      s2 <- vapply(por[con], function(x) x$cme, 0); nu <- vapply(por[con], function(x) x$gl, 0); k <- length(s2)
      C <- 1 + (sum(1 / nu) - 1 / sum(nu)) / (3 * (k - 1))
      chi <- (sum(nu) * log(sum(nu * s2) / sum(nu)) - sum(nu * log(s2))) / C
      out$bartlett <- list(chi2 = chi, gl = k - 1, p = pchisq(chi, k - 1, lower.tail = FALSE), razon = max(s2) / min(s2))
    }
  }
  # análisis conjunto
  yv <- p$y; A <- p$A; G <- p$G
  m <- if (!is.null(p$R)) lm(yv ~ A + A:p$R + G + G:A) else if (gle > 0) lm(yv ~ A + G + G:A) else lm(yv ~ A + G)
  a <- anova(m)
  fuentes <- c("Ambientes", if (!is.null(p$R)) "Repeticiones/Ambientes", "Genotipos", "G × A", if (gle > 0) "Error")
  if (gle == 0) fuentes[length(fuentes)] <- "G × A (residuo)"
  orden <- if (!is.null(p$R)) c(1, 3, 2, 4, 5) else seq_len(nrow(a))     # A, A:R, G, G:A, error
  a <- a[orden, ]
  cm <- a[, "Mean Sq"]; F <- cm / cm[nrow(a)]; pv <- pf(F, a[, "Df"], a[nrow(a), "Df"], lower.tail = FALSE)
  if (!is.null(p$R)) { F[1] <- cm[1] / cm[2]; pv[1] <- pf(F[1], a[1, "Df"], a[2, "Df"], lower.tail = FALSE) }
  F[nrow(a)] <- NA; pv[nrow(a)] <- NA
  out$anova <- list(fuente = fuentes, gl = a[, "Df"], sc = a[, "Sum Sq"], cm = cm, F = F, p = pv)
  if (gle > 0) {
    iG <- which(fuentes == "Genotipos"); iGA <- which(fuentes == "G × A")
    Fg <- cm[iG] / cm[iGA]
    out$genotipos_vs_ga <- list(F = Fg, gl1 = a[iG, "Df"], gl2 = a[iGA, "Df"], p = pf(Fg, a[iG, "Df"], a[iGA, "Df"], lower.tail = FALSE))
  }
  out$medias <- gm; out$medias_ambiente <- em; out$media_general <- gran
  # estabilidad
  I <- em - gran; sI2 <- sum(I^2); mse_m <- cme / r
  reg <- lapply(seq_len(g), function(i) {
    mi <- lm(Y[i, ] ~ I); dev <- residuals(mi); ssd <- sum(dev^2); msd <- ssd / (e - 2)
    b <- unname(coef(mi)[2]); se <- sqrt((if (eeb == "error") mse_m else msd) / sI2); t <- (b - 1) / se
    c(b = b, ee = se, t = t, p = 2 * pt(abs(t), if (eeb == "error") gle else e - 2, lower.tail = FALSE), s2d = msd - mse_m, F = msd / mse_m,
      p_dev = pf(msd / mse_m, e - 2, gle, lower.tail = FALSE), r2 = summary(mi)$r.squared, ssd = ssd)
  })
  reg <- do.call(rbind, reg)
  out$indice <- unname(I)
  out$regresion <- list(b = reg[, "b"], ee = reg[, "ee"], t = reg[, "t"], p = reg[, "p"], s2d = reg[, "s2d"], F = reg[, "F"], p_dev = reg[, "p_dev"], r2 = reg[, "r2"])
  if (gle == 0) out$regresion[c("s2d", "F", "p_dev")] <- NULL
  # análisis de Eberhart y Russell (escala de parcela)
  ssG <- r * e * sum((gm - gran)^2); ssE <- r * g * sI2; ssLin <- r * sum(reg[, "b"]^2) * sI2; ssHet <- ssLin - ssE
  ssTot <- r * sum((Y - gran)^2); ssPool <- r * sum(reg[, "ssd"]); dfPool <- g * (e - 2); msPool <- ssPool / dfPool
  er <- list(fuente = c("Genotipos", "Ambientes + G × A", "Ambientes (lineal)", "G × A (lineal)", "Desviaciones combinadas"),
             gl = c(g - 1, g * (e - 1), 1, g - 1, dfPool), sc = c(ssG, ssTot - ssG, ssE, ssHet, ssPool))
  er$cm <- er$sc / er$gl; er$cm[2] <- NA
  er$F <- c(er$cm[1] / msPool, NA, NA, er$cm[4] / msPool, if (gle > 0) msPool / cme else NA)
  er$p <- c(pf(er$F[1], g - 1, dfPool, lower.tail = FALSE), NA, NA, pf(er$F[4], g - 1, dfPool, lower.tail = FALSE),
            if (gle > 0) pf(er$F[5], dfPool, gle, lower.tail = FALSE) else NA)
  out$eberhart_russell <- er
  W <- r * rowSums(Z^2); sW <- sum(W)
  sig <- (g * (g - 1) * W - sW) / ((g - 1) * (g - 2) * (e - 1))
  out$wricke <- list(W = W, pct = 100 * W / sW)
  out$shukla <- if (gle > 0) list(sigma2 = sig / r, F = sig / cme, p = pf(pmax(0, sig / cme), e - 1, gle, lower.tail = FALSE)) else list(sigma2 = sig / r)
  mejor <- apply(Y, 2, if (objetivo == "maximo") max else min)
  out$lin_binns <- rowSums((Y - outer(rep(1, g), mejor))^2) / (2 * e)
  # AMMI
  s <- svd(Z); mm <- min(g - 1, e - 1); o <- ma_orientar(s$u[, 1:mm, drop = FALSE], s$v[, 1:mm, drop = FALSE]); dd <- s$d[1:mm]
  ssGE <- r * sum(Z^2); ssk <- r * dd^2; glk <- g + e - 1 - 2 * seq_len(mm)
  ok <- glk > 0
  ejes <- list(sv = dd, sc = ssk, pct = 100 * ssk / ssGE, acum = 100 * cumsum(ssk) / ssGE, gl = ifelse(ok, glk, NA))
  ejes$cm <- ifelse(ok, ssk / glk, NA)
  if (gle > 0) { ejes$F <- ejes$cm / cme; ejes$p <- pf(ejes$F, ejes$gl, gle, lower.tail = FALSE) }
  out$ammi <- list(ejes = ejes)
  res_gl <- (g - 1) * (e - 1) - sum(glk[ok]); res_sc <- ssGE - sum(ssk[ok])
  if (res_gl > 0) { out$ammi$residuo <- list(sc = res_sc, gl = res_gl, cm = res_sc / res_gl)
    if (gle > 0) { out$ammi$residuo$F <- res_sc / res_gl / cme; out$ammi$residuo$p <- pf(out$ammi$residuo$F, res_gl, gle, lower.tail = FALSE) } }
  if (gle > 0) {
    n <- 0:(mm - 1); glr <- (g - 1 - n) * (e - 1 - n); n <- n[glr > 0]; glr <- glr[glr > 0]
    scr <- ssGE - c(0, cumsum(ssk))[n + 1]
    out$ammi$fr <- list(n = n, sc = scr, gl = glr, cm = scr / glr, F = scr / glr / cme, p = pf(scr / glr / cme, glr, gle, lower.tail = FALSE))
    nfr <- which(!(out$ammi$fr$p < alfa))[1]; out$ammi$n_fr <- if (is.na(nfr)) length(n) else nfr - 1
  }
  out$ammi$genotipos <- o$U %*% diag(sqrt(dd), mm)
  out$ammi$ambientes <- o$V %*% diag(sqrt(dd), mm)
  if (mm >= 2) out$ammi$asv <- sqrt((ssk[1] / ssk[2] * out$ammi$genotipos[, 1])^2 + out$ammi$genotipos[, 2]^2)
  # GGE
  sd_e <- apply(Y, 2, sd); sgn <- if (objetivo == "maximo") 1 else -1
  Zg <- sgn * sweep(Y, 2, em); if (escala == "desviacion") Zg <- sweep(Zg, 2, sd_e, "/")
  s <- svd(Zg); k <- min(g, e); dd <- s$d[1:k]; keep <- dd > 1e-11 * dd[1]; dd <- dd[keep]
  o <- ma_orientar(s$u[, seq_along(dd), drop = FALSE], s$v[, seq_along(dd), drop = FALSE], primero_suma = TRUE)
  f <- c(simetrica = 0.5, genotipo = 1, ambiente = 0)[[particion]]
  Gc <- o$U[, 1:2] %*% diag(dd[1:2]^f); Ec <- o$V[, 1:2] %*% diag(dd[1:2]^(1 - f))
  ganador <- apply(Gc %*% t(Ec), 2, which.max)
  a2 <- colMeans(Ec); u <- a2 / sqrt(sum(a2^2))
  out$gge <- list(valores = dd, pct = 100 * dd^2 / sum(dd^2), genotipos = Gc, ambientes = Ec,
                  ganador = p$genos[ganador], vertices = sort(p$genos[chull(Gc)]),
                  proyeccion = drop(Gc %*% u), perpendicular = abs(Gc[, 1] * u[2] - Gc[, 2] * u[1]))
  out
}
