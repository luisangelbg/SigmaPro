# SigmaPro — referencia de los componentes de varianza por REML, la heredabilidad y la repetibilidad.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Los componentes salen de lme4 (lmer con REML y tolerancia estricta de bobyqa) y luego se pulen con pasos de Newton
# sobre la verosimilitud restringida escrita con matrices completas: V = Σ σ²ₖ ZₖZₖ' + σ²e I,
# P = V⁻¹ − V⁻¹X(X'V⁻¹X)⁻¹X'V⁻¹, gradiente −½[tr(PVₖ) − y'PVₖPy] e información promedio ½·y'PVₖPVₗPy. Así la
# referencia queda en el óptimo con 12 cifras (lme4 con sus tolerancias de omisión se queda a 1e-5 en algunos casos).
# Con esos componentes, también con matrices completas: b = (X'V⁻¹X)⁻¹X'V⁻¹y, BLUP û = σ²ₖZₖ'Py,
# PEV = σ²ₖI − σ⁴ₖZₖ'PZₖ, los errores estándar (inversa de la información promedio) y −2ℓR =
# log|V| + log|X'V⁻¹X| + y'Py + (n − p)·log 2π. Un componente que lme4 deja en cero queda fuera del modelo.
#
# Sin library(): lme4:: y stats::.
suppressPackageStartupMessages(requireNamespace("lme4"))

gn_fija <- function(fijos) if (length(fijos)) paste(vapply(fijos, function(t) paste(t, collapse = ":"), ""), collapse = " + ") else "1"
gn_nombre <- function(tm) paste(tm, collapse = ":")

#' Ajuste REML exacto. fijos y aleatorios: listas de términos (vectores de nombres de factores).
gn_reml <- function(datos, y, fijos = list(), aleatorios = list()) {
  vars <- unique(c(y, unlist(fijos), unlist(aleatorios)))
  d <- datos[stats::complete.cases(datos[vars]), vars, drop = FALSE]
  for (v in setdiff(vars, y)) d[[v]] <- factor(d[[v]])
  ff <- stats::as.formula(paste(y, "~", gn_fija(fijos)))
  X0 <- stats::model.matrix(ff, d)
  qx <- qr(X0, tol = 1e-7)
  quedan <- sort(qx$pivot[seq_len(qx$rank)])
  X <- X0[, quedan, drop = FALSE]
  yv <- d[[y]]; n <- length(yv); p <- ncol(X)
  fac <- lapply(aleatorios, function(tm) if (length(tm) == 1) factor(d[[tm]]) else interaction(d[tm], drop = TRUE, lex.order = TRUE, sep = ":"))
  Z <- lapply(fac, function(f) stats::model.matrix(~ f - 1))
  R <- length(Z)
  nombres <- vapply(aleatorios, gn_nombre, "")
  # inicio: lme4 con tolerancia estricta
  s2 <- rep(0, R + 1)
  if (R) {
    fr <- stats::as.formula(paste(y, "~", gn_fija(fijos), "+", paste0("(1 | ", nombres, ")", collapse = " + ")))
    ctl <- lme4::lmerControl(optimizer = "bobyqa", optCtrl = list(rhobeg = 0.2, rhoend = 1e-12, maxfun = 1e5), calc.derivs = FALSE,
                             check.conv.singular = "ignore", check.rankX = "silent.drop.cols")
    m <- lme4::lmer(fr, data = d, REML = TRUE, control = ctl)
    vc <- as.data.frame(lme4::VarCorr(m))
    s2[seq_len(R)] <- vc$vcov[match(nombres, vc$grp)]
    s2[R + 1] <- vc$vcov[vc$grp == "Residual"]
  } else s2[1] <- sum(stats::lm.fit(X, yv)$residuals^2) / (n - p)
  libres <- c(which(s2[seq_len(R)] > 1e-10 * stats::var(yv)), R + 1)
  s2[setdiff(seq_len(R), libres)] <- 0
  Vk <- c(lapply(Z, tcrossprod), list(diag(n)))
  calc <- function(s2) {
    V <- Reduce(`+`, Map(`*`, Vk, s2))
    Vi <- solve(V); XtVi <- crossprod(X, Vi); XVX <- XtVi %*% X
    P <- Vi - t(XtVi) %*% solve(XVX, XtVi)
    Py <- drop(P %*% yv)
    grad <- vapply(libres, function(k) -0.5 * (sum(P * Vk[[k]]) - sum(Py * (Vk[[k]] %*% Py))), 0)
    W <- sapply(libres, function(k) drop(Vk[[k]] %*% Py))
    AI <- 0.5 * crossprod(W, P %*% W)
    list(V = V, Vi = Vi, XVX = XVX, P = P, Py = Py, grad = grad, AI = AI)
  }
  for (it in 1:60) {
    cc <- calc(s2)
    delta <- solve(cc$AI, cc$grad)
    nuevo <- s2; nuevo[libres] <- s2[libres] + delta
    if (any(nuevo[libres] <= 0)) break
    s2 <- nuevo
    if (max(abs(delta) / s2[libres]) < 1e-14) break
  }
  cc <- calc(s2)
  cov <- matrix(NA_real_, R + 1, R + 1); cov[libres, libres] <- solve(cc$AI)
  b <- drop(solve(cc$XVX, crossprod(X, cc$Vi %*% yv)))
  m2l <- as.numeric(determinant(cc$V)$modulus + determinant(cc$XVX)$modulus) + sum(yv * cc$Py) + (n - p) * log(2 * pi)
  npar <- p + R + 1
  u <- lapply(seq_len(R), function(k) setNames(s2[k] * drop(crossprod(Z[[k]], cc$Py)), levels(fac[[k]])))
  pev <- lapply(seq_len(R), function(k) s2[k] * diag(ncol(Z[[k]])) - s2[k]^2 * crossprod(Z[[k]], cc$P %*% Z[[k]]))
  list(sigma2 = s2, nombres = nombres, frontera = s2[seq_len(R)] == 0, cov = cov, grad = cc$grad, m2l = m2l, logLik = -m2l / 2, npar = npar,
       aic = m2l + 2 * npar, bic = m2l + log(n) * npar, n = n, p = p, b = setNames(b, colnames(X)), varB = solve(cc$XVX), X = X, quedan = quedan, ff = ff,
       fijos_ajuste = drop(X %*% b), media = mean(X %*% b), u = u, pev = pev, niveles = lapply(fac, levels), datos = d, fac = fac)
}

#' Razón de verosimilitudes restringidas de cada término aleatorio (el modelo sin él), p con la mezcla ½χ²₀ + ½χ²₁.
gn_lrt <- function(datos, y, fijos, aleatorios, completo) {
  lapply(seq_along(aleatorios), function(k) {
    if (completo$frontera[k]) return(list(termino = gn_nombre(aleatorios[[k]]), chi2 = 0, p = 1))   # en cero: el modelo sin él es el mismo
    red <- gn_reml(completo$datos, y, fijos, aleatorios[-k])   # las mismas filas del modelo completo
    x <- max(0, 2 * (completo$logLik - red$logLik))
    list(termino = gn_nombre(aleatorios[[k]]), chi2 = x, p = if (x > 0) 0.5 * stats::pchisq(x, 1, lower.tail = FALSE) else 1)
  })
}
gn_pares <- function(M) { g <- nrow(M); 2 * (g * sum(diag(M)) - sum(M)) / (g * (g - 1)) }
gn_armonica <- function(v) length(v) / sum(1 / v)
gn_componentes <- function(a) {
  R <- length(a$nombres)
  lapply(seq_len(R + 1), function(k) list(termino = if (k <= R) a$nombres[k] else "Residual", sigma2 = a$sigma2[k], ee = if (is.na(a$cov[k, k])) NA_real_ else sqrt(a$cov[k, k]),
                                         porcentaje = 100 * a$sigma2[k] / sum(a$sigma2)))
}

#' Componentes de varianza de un diseño con factores aleatorios (cruzados, anidados o cruzados con interacciones).
terminos_aleatorios <- function(aleatorios, estructura) {
  if (estructura == "anidados") return(lapply(seq_along(aleatorios), function(k) aleatorios[seq_len(k)]))
  t <- as.list(aleatorios)
  if (estructura == "cruzados-interaccion" && length(aleatorios) > 1) for (i in 1:(length(aleatorios) - 1)) for (j in (i + 1):length(aleatorios)) t <- c(t, list(aleatorios[c(i, j)]))
  t
}
ref_componentes <- function(datos, y, aleatorios, estructura = "cruzados", fijos = character(0)) {
  fj <- as.list(fijos); al <- terminos_aleatorios(aleatorios, estructura)
  a <- gn_reml(datos, y, fj, al)
  list(componentes = gn_componentes(a), lrt = gn_lrt(datos, y, fj, al, a),
       niveles = I(vapply(a$niveles, length, 0)), ajuste = list(n = a$n, logLik = a$logLik, AIC = a$aic, BIC = a$bic), media = a$media)
}

#' Heredabilidad, BLUP y BLUE de genotipos y ganancia por selección (genotipos aleatorios; ambientes y repeticiones fijos).
disenoGenetico <- function(gen, rep, bloque, amb) {
  fijos <- list(); if (nzchar(amb)) fijos <- c(fijos, list(amb)); if (nzchar(rep)) fijos <- c(fijos, list(c(if (nzchar(amb)) amb, rep)))
  al <- list(gen); if (nzchar(amb)) al <- c(al, list(c(gen, amb)))
  if (nzchar(bloque)) al <- c(al, list(c(if (nzchar(amb)) amb, if (nzchar(rep)) rep, bloque)))
  list(fijos = fijos, aleatorios = al)
}
ref_heredabilidad <- function(datos, y, gen, rep = "", bloque = "", amb = "", seleccion = 0.1, direccion = "mayor") {
  ds <- disenoGenetico(gen, rep, bloque, amb)
  a <- gn_reml(datos, y, ds$fijos, ds$aleatorios)
  d <- a$datos; R <- length(ds$aleatorios)
  s2g <- a$sigma2[1]; s2ge <- if (nzchar(amb)) a$sigma2[2] else 0; s2e <- a$sigma2[R + 1]
  ng <- nlevels(d[[gen]])
  ph <- gn_armonica(as.numeric(table(d[[gen]])))
  eh <- if (nzchar(amb)) gn_armonica(as.numeric(rowSums(table(d[[gen]], d[[amb]]) > 0))) else 1
  Dn <- s2g + s2ge / eh + s2e / ph
  H2 <- s2g / Dn
  # EE por el método delta con la covarianza de (σ²g, σ²ge, σ²e); los componentes en la frontera no cuentan
  ig <- c(1, if (nzchar(amb)) 2, R + 1)
  gr <- c((s2ge / eh + s2e / ph) / Dn^2, if (nzchar(amb)) -s2g / (eh * Dn^2), -s2g / (ph * Dn^2))
  C <- a$cov[ig, ig, drop = FALSE]; C[is.na(C)] <- 0
  eeH2 <- if (a$frontera[1]) NA_real_ else sqrt(drop(t(gr) %*% C %*% gr))
  vblup <- gn_pares(a$pev[[1]])
  cullis <- if (s2g > 0) 1 - vblup / (2 * s2g) else 0
  # BLUE: genotipos fijos (al final de la parte fija), los demás aleatorios
  b <- gn_reml(d, y, c(ds$fijos, list(gen)), ds$aleatorios[-1])
  niv <- levels(b$datos[[gen]])
  L <- t(vapply(niv, function(g0) { d2 <- b$datos; d2[[gen]] <- factor(rep(g0, nrow(d2)), levels = niv); colMeans(stats::model.matrix(b$ff, d2)[, b$quedan, drop = FALSE]) }, numeric(b$p)))
  blue <- drop(L %*% b$b); VL <- L %*% b$varB %*% t(L)
  vblue <- gn_pares(VL)
  piepho <- s2g / (s2g + vblue / 2)
  u <- a$u[[1]]; pev <- diag(a$pev[[1]])
  s <- if (direccion == "menor") -1 else 1
  k <- max(1, floor(seleccion * ng + 0.5)); pe <- k / ng; i <- stats::dnorm(stats::qnorm(1 - pe)) / pe
  selU <- order(-s * u, method = "radix")[seq_len(k)]
  selB <- order(-s * blue, method = "radix")[seq_len(k)]
  dgb <- mean(u[selU]); DS <- mean(blue[selB]) - mean(blue)
  list(componentes = gn_componentes(a), lrt = gn_lrt(datos, y, ds$fijos, ds$aleatorios, a),
       ajuste = list(n = a$n, logLik = a$logLik, AIC = a$aic, BIC = a$bic),
       heredabilidad = list(estandar = H2, ee = eeH2, parcela = s2g / (s2g + s2ge + s2e), cullis = cullis, piepho = piepho, vblup = vblup, vblue = vblue,
                            ph = ph, eh = eh),
       media = a$media, cvg = 100 * sqrt(s2g) / a$media, cve = 100 * sqrt(s2e) / a$media,
       blup = lapply(seq_len(ng), function(j) list(genotipo = names(u)[j], u = unname(u[j]), pev = unname(pev[j]), confiabilidad = if (s2g > 0) 1 - unname(pev[j]) / s2g else NA_real_)),
       blue = lapply(seq_len(ng), function(j) list(genotipo = niv[j], media = unname(blue[j]), ee = sqrt(VL[j, j]))),
       seleccion = list(k = k, intensidad = i, dg_blup = dgb, dg_blup_pct = 100 * dgb / a$media, dg_clasica = s * i * H2 * sqrt(Dn),
                        ds = DS, dg_ds = H2 * DS, seleccionados = I(names(u)[selU])))
}

#' Repetibilidad: individuos aleatorios, otros factores fijos.
ref_repetibilidad <- function(datos, y, individuo, fijos = character(0), objetivos = c(0.8, 0.85, 0.9, 0.95, 0.99)) {
  fj <- as.list(fijos)
  a <- gn_reml(datos, y, fj, list(individuo))
  sI <- a$sigma2[1]; sE <- a$sigma2[2]; D <- sI + sE
  r <- sI / D
  gr <- c(sE / D^2, -sI / D^2); C <- a$cov; C[is.na(C)] <- 0
  m <- gn_armonica(as.numeric(table(a$datos[[individuo]])))
  u <- a$u[[1]]; pev <- diag(a$pev[[1]])
  list(componentes = gn_componentes(a), lrt = gn_lrt(datos, y, fj, list(individuo), a),
       ajuste = list(n = a$n, logLik = a$logLik, AIC = a$aic, BIC = a$bic),
       repetibilidad = list(r = r, ee = if (a$frontera[1]) NA_real_ else sqrt(drop(t(gr) %*% C %*% gr)), m = m, R2 = m * r / (1 + (m - 1) * r)),
       necesarias = lapply(objetivos, function(o) list(R2 = o, medidas = if (r > 0) o * (1 - r) / ((1 - o) * r) else NA_real_)),
       media = a$media,
       blup = lapply(seq_along(u), function(j) list(individuo = names(u)[j], u = unname(u[j]), pev = unname(pev[j]), confiabilidad = if (sI > 0) 1 - unname(pev[j]) / sI else NA_real_)))
}
