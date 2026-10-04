# SigmaPro — referencia del multivariado (Hito 3.4): manova y summary.manova (las cuatro pruebas) y summary.aov de
# stats; lda y predict.lda de MASS (Venables y Ripley, 2002), con la validación cruzada de lda(CV = TRUE); y la prueba M
# de Box de heplots::boxM (en la MANOVA, entre las celdas de los tratamientos).
# El signo de cada función discriminante lo fija LAPACK: se normaliza como en la app (el coeficiente de mayor valor
# absoluto, positivo).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

formula_diseno <- function(respuestas, tratamientos, bloque = "") {
  der <- paste(c(if (nzchar(bloque)) bloque, paste(tratamientos, collapse = " * ")), collapse = " + ")
  as.formula(sprintf("cbind(%s) ~ %s", paste(respuestas, collapse = ", "), der))
}

ref_manova <- function(datos, respuestas, tratamientos, bloque = "") {
  vars <- c(respuestas, tratamientos, if (nzchar(bloque)) bloque)
  d <- datos[stats::complete.cases(datos[, vars]), ]
  for (f in c(tratamientos, if (nzchar(bloque)) bloque)) d[[f]] <- factor(d[[f]])
  fit <- manova(formula_diseno(respuestas, tratamientos, bloque), data = d)
  pr <- c(pillai = "Pillai", wilks = "Wilks", hotelling = "Hotelling-Lawley", roy = "Roy")
  s <- lapply(pr, function(t) summary(fit, test = t))
  nt <- nrow(s$pillai$stats) - 1
  terminos <- lapply(seq_len(nt), function(i) {
    out <- list(termino = rownames(s$pillai$stats)[i], gl = s$pillai$stats[i, "Df"], propios = unname(s$pillai$Eigenvalues[i, ]),
                H = unname(s$pillai$SS[[i]]))
    out$pruebas <- lapply(pr, function(t) { st <- s[[match(t, pr)]]$stats[i, ]; list(estadistico = unname(st[2]), F = unname(st[3]), gl1 = unname(st[4]), gl2 = unname(st[5]), p = unname(st[6])) })
    out
  })
  ua <- summary.aov(fit)
  univariados <- lapply(seq_along(respuestas), function(k) { a <- ua[[k]]; list(F = I(unname(a[["F value"]][seq_len(nt)])), p = I(unname(a[["Pr(>F)"]][seq_len(nt)]))) })
  bm <- heplots::boxM(as.matrix(d[, respuestas]), interaction(d[tratamientos], drop = TRUE))
  boxM <- list(chi2 = unname(bm$statistic), gl = unname(bm$parameter), p = bm$p.value, logdet_combinada = unname(bm$logDet[["pooled"]]))
  list(terminos = terminos, E = unname(s$pillai$SS[["Residuals"]]), glE = fit$df.residual, n = nrow(d), univariados = univariados, boxM = boxM)
}

ref_lda <- function(datos, variables, grupo) {
  d <- datos[stats::complete.cases(datos[, c(variables, grupo)]), ]
  x <- as.matrix(d[, variables]); g <- factor(d[[grupo]])
  fit <- MASS::lda(x, g)
  sc <- fit$scaling
  for (k in seq_len(ncol(sc))) if (sc[which.max(abs(sc[, k])), k] < 0) sc[, k] <- -sc[, k]
  pr <- predict(fit)
  sgn <- sign(colSums(sc * fit$scaling))           # el mismo cambio de signo para los puntajes
  cv <- MASS::lda(x, g, CV = TRUE)
  list(n = nrow(d), escala = unname(sc), sv = I(fit$svd), proporcion = I(fit$svd^2 / sum(fit$svd^2)), medias = unname(fit$means), previa = unname(fit$prior),
       puntajes = unname(sweep(pr$x, 2, sgn, "*")), posterior = unname(pr$posterior), clase = as.integer(pr$class) - 1L,
       cv = list(posterior = unname(cv$posterior), clase = as.integer(cv$class) - 1L),
       boxM = (function(bm) list(chi2 = unname(bm$statistic), gl = unname(bm$parameter), p = bm$p.value, logdet = unname(bm$logDet[levels(g)]),
                                 logdet_combinada = unname(bm$logDet[["pooled"]])))(heplots::boxM(x, g)))
}
