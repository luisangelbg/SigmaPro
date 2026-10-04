# SigmaPro — referencia de los modelos lineales generalizados (stats::glm, MASS::glm.nb y emmeans en el R de escritorio).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Calcula lo mismo que los métodos de la app: el ajuste por mínimos cuadrados iterativamente reponderados (glm con
# epsilon = 1e-14, para tener el óptimo con todas sus cifras), los coeficientes con su EE y su z (o t si la dispersión se
# estima), las razones de momios o de tasas con su intervalo de Wald (confint.default), el análisis de devianza tipo I
# (como anova.glm), II o III (como car::Anova; el III con contrastes de suma cero, y los coeficientes siempre con los de
# tratamiento), la dispersión de Pearson y la prueba de
# sobredispersión, y las medias marginales en la escala de la respuesta con sus pares (emmeans, con offset = 0: la tasa por
# unidad de exposición). La binomial negativa parte de glm.nb y se pule: theta por Newton hasta el óptimo exacto y el glm
# con esa theta, hasta que theta no cambie; su EE es la raíz del inverso de la información en el óptimo.
# Las tablas de devianza se arman con glm.fit sobre las columnas de la matriz del modelo (el algoritmo de car::Anova y
# anova.glm, que se cotejaron aparte), porque con la binomial negativa la dispersión es 1 y theta queda fija.
#
# Sin library(): stats::, MASS::, emmeans::.
suppressPackageStartupMessages({ requireNamespace("MASS"); requireNamespace("emmeans") })
emmeans::emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

GL_CTRL <- stats::glm.control(epsilon = 1e-14, maxit = 200)
gl_v <- function(x) I(unname(as.numeric(x)))
gl_tx <- function(x) I(unname(as.character(x)))

gl_enlaceR <- function(e) if (e == "inverso") "inverse" else if (e == "identidad") "identity" else e   # nombres de la app → R
gl_familia <- function(fam, enlace, theta = NULL) {
  enlace <- gl_enlaceR(enlace)
  switch(fam,
    binomial = stats::binomial(enlace), cuasibinomial = stats::quasibinomial(enlace),
    poisson = stats::poisson(enlace), cuasipoisson = stats::quasipoisson(enlace),
    gamma = stats::Gamma(enlace), "binomial-negativa" = MASS::negative.binomial(theta, enlace))
}
dispFija <- function(fam) fam %in% c("binomial", "poisson", "binomial-negativa")

# theta de la binomial negativa por Newton (el score y la información de MASS::theta.ml), hasta el óptimo exacto
nb_score <- function(th, mu, y, w) sum(w * (digamma(th + y) - digamma(th) + log(th) + 1 - log(th + mu) - (y + th) / (mu + th)))
nb_info <- function(th, mu, y, w) sum(w * (-trigamma(th + y) + trigamma(th) - 1 / th + 2 / (mu + th) - (y + th) / (mu + th)^2))
nb_theta <- function(y, mu, w, th) {
  for (k in 1:200) { del <- nb_score(th, mu, y, w) / nb_info(th, mu, y, w); th <- abs(th + del); if (abs(del) < 1e-15 * th) break }
  th
}
nb_loglik <- function(th, mu, y, w) sum(w * (lgamma(th + y) - lgamma(th) - lgamma(y + 1) + th * log(th) + y * log(mu + (y == 0)) - (th + y) * log(th + mu)))

#' Ajuste de referencia. Devuelve el glm (o el glm con la theta de la binomial negativa), la theta y su EE.
gl_ajuste <- function(f, d, familia, enlace) {
  if (familia != "binomial-negativa") return(list(m = stats::glm(f, family = gl_familia(familia, enlace), data = d, control = GL_CTRL), theta = NA_real_, ee_theta = NA_real_))
  m0 <- do.call(MASS::glm.nb, list(formula = f, data = d, link = as.name(gl_enlaceR(enlace)), control = GL_CTRL))   # glm.nb toma el enlace como símbolo
  th <- m0$theta; m <- m0
  yv <- m0$y; w <- m0$prior.weights
  for (k in 1:100) {
    th0 <- th
    th <- nb_theta(yv, stats::fitted(m), w, th)
    m <- stats::glm(f, family = MASS::negative.binomial(th, enlace), data = d, control = GL_CTRL, start = stats::coef(m))
    if (abs(th - th0) < 1e-13 * th) break
  }
  th <- nb_theta(yv, stats::fitted(m), w, th)
  list(m = m, theta = th, ee_theta = sqrt(1 / nb_info(th, stats::fitted(m), yv, w)), loglik = nb_loglik(th, stats::fitted(m), yv, w))
}

#' Términos de la fórmula y la columna de cada uno (assign), para las tablas de devianza.
gl_tablaDevianza <- function(m, tipo, familia, phi) {
  X <- stats::model.matrix(m); asg <- attr(X, "assign"); tl <- attr(stats::terms(m), "term.labels")
  fac <- attr(stats::terms(m), "factors")
  vars <- lapply(tl, function(t) rownames(fac)[fac[, t] > 0])
  y <- m$y; w <- m$prior.weights; off <- m$offset; fam <- m$family
  ajusta <- function(excl) stats::glm.fit(X[, !(asg %in% excl), drop = FALSE], y, w, offset = off, family = fam, control = GL_CTRL)
  dfres <- m$df.residual
  filas <- lapply(seq_along(tl), function(k) {
    if (tipo == 1) { m1 <- ajusta(k:length(tl)); m2 <- ajusta(if (k < length(tl)) (k + 1):length(tl) else integer(0)) }
    else if (tipo == 2) {
      rel <- which(vapply(vars, function(v) all(vars[[k]] %in% v) && length(v) > length(vars[[k]]), TRUE))
      m1 <- ajusta(c(k, rel)); m2 <- if (length(rel)) ajusta(rel) else m
    } else { m1 <- ajusta(k); m2 <- m }
    g <- m1$df.residual - m2$df.residual; D <- m1$deviance - m2$deviance
    if (dispFija(familia)) list(termino = tl[k], gl = g, devianza = D, estadistico = D / phi, p = stats::pchisq(D / phi, g, lower.tail = FALSE))
    else list(termino = tl[k], gl = g, devianza = D, estadistico = D / (g * phi), p = stats::pf(D / (g * phi), g, dfres, lower.tail = FALSE))
  })
  filas
}

ref_glm <- function(datos, y, derecha, familia, enlace, ensayos = "", exposicion = "", comoFactor = character(0), tipo = 2,
                    comparar = character(0), dentro = "", ajuste = "tukey", nivel = 0.95) {
  d <- datos
  for (v in comoFactor) d[[v]] <- factor(d[[v]])
  vars <- all.vars(stats::as.formula(paste("~", derecha)))
  usadas <- unique(c(y, vars, if (nzchar(ensayos)) ensayos, if (nzchar(exposicion)) exposicion))
  d <- d[stats::complete.cases(d[usadas]), , drop = FALSE]
  for (v in vars) if (is.factor(d[[v]])) d[[v]] <- droplevels(d[[v]])
  izq <- if (nzchar(ensayos)) sprintf("cbind(%s, %s - %s)", y, ensayos, y) else y
  f <- stats::as.formula(paste(izq, "~", derecha, if (nzchar(exposicion)) sprintf("+ offset(log(%s))", exposicion) else ""))
  aj <- gl_ajuste(f, d, familia, enlace); m <- aj$m
  pear <- sum(stats::residuals(m, type = "pearson")^2)
  # tipo III: el mismo modelo con contrastes de suma cero (los coeficientes se reportan con los de tratamiento)
  mt <- if (tipo != 3) m else local({
    op <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(op))
    stats::glm(f, family = gl_familia(familia, enlace, aj$theta), data = d, control = GL_CTRL)
  })
  phi <- if (dispFija(familia)) 1 else pear / m$df.residual
  cf <- if (dispFija(familia)) summary(m, dispersion = 1)$coefficients else summary(m)$coefficients   # t con la dispersión estimada
  b <- stats::coef(m); ok <- !is.na(b)
  rz <- enlace %in% c("log", "logit")
  z <- stats::qnorm(1 - (1 - nivel) / 2)
  aic <- if (familia == "binomial-negativa") -2 * aj$loglik + 2 * (m$rank + 1) else if (dispFija(familia) || familia == "gamma") m$aic else NA_real_
  k <- if (familia %in% c("binomial-negativa", "gamma")) m$rank + 1 else m$rank
  out <- list(
    coeficientes = list(nombre = gl_tx(rownames(cf)), estimado = gl_v(cf[, 1]), ee = gl_v(cf[, 2]), estadistico = gl_v(cf[, 3]), p = gl_v(cf[, 4])),
    devianza = gl_tablaDevianza(mt, tipo, familia, phi),
    ajuste = list(n = length(m$y), devianza = m$deviance, gl = m$df.residual, devianza_nula = m$null.deviance, gl_nula = m$df.null,
                  dispersion = phi, pearson = pear, sobredispersion = pear / m$df.residual,
                  p_sobredispersion = stats::pchisq(pear, m$df.residual, lower.tail = FALSE),
                  aic = aic, bic = if (is.na(aic)) NA_real_ else aic - 2 * k + log(length(m$y)) * k))
  if (rz) out$razones <- list(razon = gl_v(exp(cf[, 1])), ic_inf = gl_v(exp(cf[, 1] - z * cf[, 2])), ic_sup = gl_v(exp(cf[, 1] + z * cf[, 2])))
  if (familia == "binomial-negativa") { out$theta <- aj$theta; out$ee_theta <- aj$ee_theta }
  if (length(comparar)) {
    V <- summary(m, dispersion = phi)$cov.scaled
    out$medias <- lapply(setdiff(comparar, dentro), function(fc) {
      e <- emmeans::emmeans(m, specs = fc, by = if (nzchar(dentro)) dentro else NULL, offset = 0, data = d, vcov. = V)
      s <- as.data.frame(summary(e, infer = c(FALSE, FALSE)))
      r <- as.data.frame(summary(e, type = "response", level = nivel))
      pr <- as.data.frame(summary(pairs(e, adjust = ajuste), infer = c(FALSE, TRUE)))
      lo <- grep("LCL$|^lower.CL$", names(r), value = TRUE); hi <- grep("UCL$|^upper.CL$", names(r), value = TRUE); rc <- setdiff(names(r), c(fc, dentro, "SE", "df", lo, hi))[1]
      list(factor = fc,
           filas = lapply(seq_len(nrow(s)), function(i) list(nivel = as.character(s[[fc]][i]), eta = s$emmean[i], ee_eta = s$SE[i],
                                                       respuesta = r[[rc]][i], ee = r$SE[i], ic = I(sort(c(r[[lo]][i], r[[hi]][i]))))),
           pares = lapply(seq_len(nrow(pr)), function(i) {
             x <- list(dif = pr$estimate[i], ee = pr$SE[i], estadistico = pr[[grep("ratio$", names(pr), value = TRUE)[1]]][i], p = pr$p.value[i])
             if (rz) x$razon <- exp(pr$estimate[i])
             x
           }))
    })
  }
  out
}

#' Familia automática: con conteos (Poisson) o proporciones agrupadas (binomial), si la prueba de Pearson muestra
#' sobredispersión (p < 0.05), binomial negativa o cuasibinomial; con 0/1 se queda la binomial.
gl_auto <- function(datos, y, derecha, base, enlace, ensayos = "", exposicion = "", comoFactor = character(0)) {
  r <- ref_glm(datos, y, derecha, base, enlace, ensayos, exposicion, comoFactor)
  binaria <- base == "binomial" && !nzchar(ensayos)
  if (!binaria && r$ajuste$p_sobredispersion < 0.05) if (base == "poisson") "binomial-negativa" else "cuasibinomial" else base
}
