# SigmaPro — referencia de las superficies de respuesta (Hito 2.7), en R base (sin paquetes).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Codificación: con cinco niveles simétricos (central compuesto) el centro es el nivel del medio y el paso, la mitad de la
# distancia entre el segundo y el cuarto (los axiales quedan en ±α); si no, el centro y el paso son el punto medio y la
# mitad del rango. Datos ya codificados (−1, 0, 1 o −α … α) quedan igual.
# Modelo en unidades codificadas z = (x − centro) / paso, con los términos en el orden de la metodología de
# superficies de respuesta: bloques, primer orden (z₁ … z_k), interacciones (z_i·z_j, i < j) y cuadráticos puros (z_j²).
#   - Coeficientes con lm; los de unidades originales, con un lm aparte sobre x (comprueba la transformación de la app).
#   - ANOVA secuencial por grupos de términos (diferencias de SCR de los modelos anidados), falta de ajuste contra el
#     error puro de lm(y ~ bloque + combinación de x).
#   - Análisis canónico: b (primer orden) y B (cuadráticos en la diagonal, interacciones / 2 fuera); punto
#     estacionario −½·B⁻¹b; eigen(B) con cada vector con su primer componente no despreciable positivo.
#   - Cresta (Hoerl 1959; Draper 1963): para cada radio r, x(μ) = ½·(μI − B)⁻¹b con μ > λ_max (máximo) o μ < λ_min
#     (mínimo) y ‖x‖ = r, μ por uniroot. Primer orden: ascenso más pronunciado r·b/‖b‖ (o descenso).
#   - Predicción y su EE en cada punto con los bloques promediados.

sr_codificacion <- function(x) {
  u <- sort(unique(x))
  r <- u[length(u)] - u[1]
  if (length(u) == 5 && abs((u[1] + u[5]) - (u[2] + u[4])) <= 1e-6 * r && abs((u[2] + u[4]) - 2 * u[3]) <= 1e-6 * r)
    return(c(centro = u[3], paso = (u[4] - u[2]) / 2))
  c(centro = (u[1] + u[length(u)]) / 2, paso = r / 2)
}

# columnas del modelo (sin intercepto ni bloques) a partir de la matriz de variables (codificadas o no)
sr_columnas <- function(Z, nombres, orden) {
  k <- ncol(Z); n <- nrow(Z)
  pares <- if (k > 1) t(combn(k, 2)) else matrix(0L, 0, 2)
  FO <- Z; colnames(FO) <- nombres
  TWI <- if (orden != "primer" && nrow(pares)) {
    m <- vapply(seq_len(nrow(pares)), function(r) Z[, pares[r, 1]] * Z[, pares[r, 2]], numeric(n))
    m <- matrix(m, n); colnames(m) <- paste0(nombres[pares[, 1]], ":", nombres[pares[, 2]]); m
  } else matrix(0, n, 0)
  PQ <- if (orden == "segundo") { m <- Z^2; colnames(m) <- paste0(nombres, "^2"); m } else matrix(0, n, 0)
  list(FO = FO, TWI = TWI, PQ = PQ, pares = pares)
}

sr_signo <- function(V) {
  for (j in seq_len(ncol(V))) { i <- which(abs(V[, j]) > 1e-6)[1]; if (V[i, j] < 0) V[, j] <- -V[, j] }
  V
}

ref_superficie <- function(datos, y, factores, orden = "segundo", bloque = "",
                           objetivo = "maximo", nivel = 0.95, bajos = NULL, altos = NULL) {
  vars <- c(y, factores, if (nzchar(bloque)) bloque)
  d <- datos[complete.cases(datos[vars]), , drop = FALSE]
  k <- length(factores); n <- nrow(d); yv <- d[[y]]
  cod <- t(vapply(factores, function(f) sr_codificacion(d[[f]]), c(centro = 0, paso = 0)))
  if (!is.null(bajos)) cod <- cbind(centro = (bajos + altos) / 2, paso = (altos - bajos) / 2)   # codificación a mano: −1 y +1 dados
  Xn <- sapply(factores, function(f) d[[f]])
  Z <- sweep(sweep(Xn, 2, cod[, "centro"]), 2, cod[, "paso"], "/")
  cz <- sr_columnas(Z, factores, orden)
  if (nzchar(bloque)) {
    fb <- droplevels(factor(d[[bloque]], levels = levels(datos[[bloque]])))
    Bm <- model.matrix(~ fb)[, -1, drop = FALSE]; colnames(Bm) <- paste0(bloque, levels(fb)[-1])
  } else Bm <- matrix(0, n, 0)
  X <- cbind("(Intercepto)" = 1, Bm, cz$FO, cz$TWI, cz$PQ)
  m <- lm(yv ~ 0 + X)
  stopifnot(m$rank == ncol(X))
  cf <- summary(m)$coefficients
  gl <- m$df.residual; scr <- sum(residuals(m)^2); s2 <- scr / gl
  coef <- unname(cf[, 1]); V <- vcov(m)
  # ANOVA secuencial por grupos
  grupos <- list(); hasta <- 1
  agrega <- function(nombre, nc) { if (nc > 0) { hasta <<- hasta + nc; grupos[[length(grupos) + 1]] <<- list(nombre = nombre, hasta = hasta, gl = nc) } }
  agrega("Bloques", ncol(Bm)); agrega("Primer orden", ncol(cz$FO)); agrega("Interacciones", ncol(cz$TWI)); agrega("Cuadráticos puros", ncol(cz$PQ))
  rss_hasta <- function(h) sum(lm.fit(X[, seq_len(h), drop = FALSE], yv)$residuals^2)
  previo <- rss_hasta(1)
  fuente <- character(); glv <- numeric(); sc <- numeric()
  for (g in grupos) { r <- rss_hasta(g$hasta); fuente <- c(fuente, g$nombre); glv <- c(glv, g$gl); sc <- c(sc, previo - r); previo <- r }
  Fv <- (sc / glv) / s2; pv <- pf(Fv, glv, gl, lower.tail = FALSE)
  fuente <- c(fuente, "Residuo"); glv <- c(glv, gl); sc <- c(sc, scr); Fv <- c(Fv, NA); pv <- c(pv, NA)
  # falta de ajuste
  combo <- factor(do.call(paste, c(lapply(factores, function(f) as.character(d[[f]])), sep = "|")))
  mpe <- if (nzchar(bloque)) lm(yv ~ fb + combo) else lm(yv ~ combo)
  glpe <- mpe$df.residual; scpe <- sum(residuals(mpe)^2); gllof <- gl - glpe
  falta <- NULL
  if (glpe > 0 && gllof > 0) {
    Fl <- ((scr - scpe) / gllof) / (scpe / glpe)
    falta <- list(F = Fl, gl1 = gllof, gl2 = glpe, p = pf(Fl, gllof, glpe, lower.tail = FALSE))
    fuente <- c(fuente, "Falta de ajuste", "Error puro"); glv <- c(glv, gllof, glpe); sc <- c(sc, scr - scpe, scpe)
    Fv <- c(Fv, Fl, NA); pv <- c(pv, falta$p, NA)
  }
  anova <- list(fuente = fuente, gl = glv, sc = sc, cm = sc / glv, F = Fv, p = pv)
  sct <- sum((yv - mean(yv))^2)
  ajuste <- list(n = n, gl = gl, sigma = sqrt(s2), r2 = 1 - scr / sct, r2_ajustada = 1 - (scr / gl) / (sct / (n - 1)))
  # unidades originales: el mismo modelo con x
  cx <- sr_columnas(Xn, factores, orden)
  mn <- lm(yv ~ 0 + cbind("(Intercepto)" = 1, Bm, cx$FO, cx$TWI, cx$PQ))
  cn <- summary(mn)$coefficients
  qt_ <- qt(1 - (1 - nivel) / 2, gl)
  # predicción con los bloques promediados
  nb <- ncol(Bm)
  fila <- function(z) {
    tw <- if (ncol(cz$TWI)) z[cz$pares[, 1]] * z[cz$pares[, 2]] else numeric()
    pq <- if (ncol(cz$PQ)) z^2 else numeric()
    c(1, rep(1 / (nb + 1), nb), z, tw, pq)
  }
  pred <- function(z) { a <- fila(z); c(sum(a * coef), sqrt(drop(t(a) %*% V %*% a))) }
  b <- coef[1 + nb + seq_len(k)]
  B <- matrix(0, k, k)
  if (ncol(cz$TWI)) for (r in seq_len(nrow(cz$pares))) { v <- coef[1 + nb + k + r] / 2; B[cz$pares[r, 1], cz$pares[r, 2]] <- v; B[cz$pares[r, 2], cz$pares[r, 1]] <- v }
  if (ncol(cz$PQ)) diag(B) <- coef[1 + nb + k + ncol(cz$TWI) + seq_len(k)]
  radio <- max(sqrt(rowSums(Z^2)))
  out <- list(
    coeficientes = list(nombre = colnames(X), estimado = coef, ee = unname(cf[, 2]), t = unname(cf[, 3]), p = unname(cf[, 4])),
    naturales = list(estimado = unname(cn[, 1]), ee = unname(cn[, 2]), t = unname(cn[, 3]), p = unname(cn[, 4])),
    anova = anova, ajuste = ajuste,
    codificacion = list(factor = factores, centro = unname(cod[, "centro"]), paso = unname(cod[, "paso"])),
    radio = radio)
  if (!is.null(falta)) out$falta_ajuste <- falta
  if (orden == "segundo") {
    xs <- -0.5 * solve(B, b)
    e <- eigen(B, symmetric = TRUE)
    pr <- pred(xs)
    out$estacionario <- list(codificado = xs, natural = unname(cod[, "centro"] + cod[, "paso"] * xs), prediccion = pr[1], ee = pr[2],
                             ic_inf = pr[1] - qt_ * pr[2], ic_sup = pr[1] + qt_ * pr[2], distancia = sqrt(sum(xs^2)),
                             naturaleza = if (all(e$values < 0)) "maximo" else if (all(e$values > 0)) "minimo" else "silla")
    out$canonico <- list(valores = e$values, vectores = sr_signo(e$vectors))
  }
  # cresta o ascenso más pronunciado
  sgn <- if (objetivo == "maximo") 1 else -1
  if (orden == "primer") {
    dist <- seq(0, 5, by = 0.5)
    camino <- t(vapply(dist, function(r) sgn * r * b / sqrt(sum(b^2)), numeric(k)))
  } else {
    dist <- seq(0, ceiling(radio / 0.25 - 1e-9) * 0.25, by = 0.25)
    e <- eigen(B, symmetric = TRUE); lam <- e$values; cc <- drop(t(e$vectors) %*% b)
    j <- if (objetivo == "maximo") 1 else k
    xmu <- function(mu) drop(e$vectors %*% (0.5 * cc / (mu - lam)))
    camino <- t(vapply(dist, function(r) {
      if (r == 0) return(numeric(k))
      f <- function(t) log(sqrt(sum(xmu(lam[j] + sgn * t)^2))) - log(r)
      lo <- abs(cc[j]) / (2 * r) * 0.5; hi <- sqrt(sum(b^2)) / (2 * r)
      t <- uniroot(f, c(lo, hi), tol = 1e-300, maxiter = 5000)$root
      xmu(lam[j] + sgn * t)
    }, numeric(k)))
  }
  camino <- matrix(camino, ncol = k)
  pp <- t(apply(camino, 1, pred))
  out$cresta <- list(distancia = dist, codificado = camino,
                     natural = sweep(sweep(camino, 2, cod[, "paso"], "*"), 2, cod[, "centro"], "+"),
                     prediccion = pp[, 1], ee = pp[, 2])
  out
}

# ---- Fase 4 (Hito 4.2): diseños, mezclas y deseabilidad -------------------------------------------------------

#' Diseño en unidades codificadas y en el orden estándar (el de la app), con las fórmulas de α escritas aparte:
#' rotable F^(1/4); ortogonal (F·Q/4)^(1/4) con Q = (√(F + 2k + n0) − √F)²; caras 1; dos bloques ortogonales
#' √(k(1 + nA/(2k))/(1 + nF/F)) (Box y Hunter 1957). Con k ≥ 5 la parte factorial es la media fracción I = ABC….
sr_diseno <- function(tipo, k, alfa = "rotable", centros = NULL, grado = 2) {
  fila <- list(); bloque <- integer(); a <- NULL; F <- 0L
  pon <- function(z, b = 1L) { fila[[length(fila) + 1]] <<- z; bloque <<- c(bloque, b) }
  if (tipo == "ccd") {
    base <- as.matrix(expand.grid(rep(list(c(-1, 1)), if (k >= 5) k - 1 else k)))
    if (k >= 5) base <- cbind(base, apply(base, 1, prod))
    F <- nrow(base); n0 <- if (is.null(centros)) c("2" = 5, "3" = 6, "4" = 7, "5" = 6, "6" = 9)[[as.character(k)]] else centros
    nF <- if (alfa == "bloques") ceiling(n0 / 2) else n0; nA <- if (alfa == "bloques") n0 - nF else 0
    a <- switch(alfa, rotable = F^(1 / 4), cara = 1, ortogonal = (F * (sqrt(F + 2 * k + n0) - sqrt(F))^2 / 4)^(1 / 4), bloques = sqrt(k * (1 + nA / (2 * k)) / (1 + nF / F)))
    for (r in seq_len(F)) pon(unname(base[r, ]))
    for (c in seq_len(nF)) pon(rep(0, k))
    for (j in seq_len(k)) for (s in c(-1, 1)) { z <- rep(0, k); z[j] <- s * a; pon(z, if (alfa == "bloques") 2L else 1L) }
    for (c in seq_len(nA)) pon(rep(0, k), 2L)
  } else if (tipo == "bbd") {
    p <- t(combn(k, 2))
    for (r in seq_len(nrow(p))) for (s in list(c(-1, -1), c(1, -1), c(-1, 1), c(1, 1))) { z <- rep(0, k); z[p[r, ]] <- s; pon(z) }
    for (c in seq_len(if (is.null(centros)) (if (k == 5) 6 else 3) else centros)) pon(rep(0, k))
  } else if (tipo == "factorial") {
    base <- as.matrix(expand.grid(rep(list(c(-1, 1)), k)))
    for (r in seq_len(nrow(base))) pon(unname(base[r, ]))
    for (c in seq_len(if (is.null(centros)) 4 else centros)) pon(rep(0, k))
  } else if (tipo == "latice") {
    rec <- function(resto, pref) { if (length(pref) == k - 1) { pon(c(pref, resto) / grado); return(invisible()) }; for (x in resto:0) rec(resto - x, c(pref, x)) }
    rec(grado, numeric())
    for (c in seq_len(if (is.null(centros)) 0 else centros)) pon(rep(1 / k, k))
  } else if (tipo == "centroide") {
    subs <- seq_len(2^k - 1); tam <- vapply(subs, function(s) sum(bitwAnd(s, 2^(0:(k - 1))) > 0), 0)
    for (s in subs[order(tam, subs)]) { b <- bitwAnd(s, 2^(0:(k - 1))) > 0; pon(ifelse(b, 1 / sum(b), 0)) }
    for (c in seq_len(if (is.null(centros)) 0 else centros - 1)) pon(rep(1 / k, k))
  }
  list(alfa = if (is.null(a)) NA else a, factorial = F, codificado = do.call(rbind, fila), bloque = bloque)
}

#' Mezclas: lm sin intercepto con los términos de Scheffé sobre las proporciones; ANOVA contra la media; falta de ajuste.
#' La mejor mezcla: en cada cara del simplex (y en los vértices), optim (BFGS) sobre las coordenadas libres desde
#' varios arranques, con la última proporción igual a 1 − la suma de las demás; se pule con un segundo optim. No usa el
#' método de la app (Newton con multiplicadores de Lagrange).
ref_mezclas <- function(datos, y, comps, modelo = "cuadratico", objetivo = "maximo", nivel = 0.95) {
  d <- datos[complete.cases(datos[c(y, comps)]), , drop = FALSE]; q <- length(comps); n <- nrow(d); yv <- d[[y]]
  X <- as.matrix(d[comps]); X <- X / rowSums(X)
  terms <- c(as.list(seq_len(q)), if (modelo != "lineal") lapply(seq_len(ncol(combn(q, 2))), function(r) combn(q, 2)[, r]),
             if (modelo == "cubico-especial" && q >= 3) lapply(seq_len(ncol(combn(q, 3))), function(r) combn(q, 3)[, r]))
  M <- matrix(sapply(terms, function(t) apply(X[, t, drop = FALSE], 1, prod)), n)
  m <- lm(yv ~ 0 + M); stopifnot(m$rank == ncol(M))
  cf <- summary(m)$coefficients; coef <- unname(cf[, 1]); p <- length(coef); gl <- m$df.residual; scr <- sum(residuals(m)^2); s2 <- scr / gl
  sct <- sum((yv - mean(yv))^2); scm <- sct - scr; Fm <- (scm / (p - 1)) / s2
  anova <- list(fuente = c("Modelo", "Residuo"), gl = c(p - 1, gl), sc = c(scm, scr), cm = c(scm / (p - 1), s2), F = c(Fm, NA), p = c(pf(Fm, p - 1, gl, lower.tail = FALSE), NA))
  combo <- factor(apply(round(X, 10), 1, paste, collapse = "|")); mpe <- lm(yv ~ combo); glpe <- mpe$df.residual; scpe <- sum(residuals(mpe)^2); gllof <- gl - glpe
  falta <- NULL
  if (glpe > 0 && gllof > 0) {
    Fl <- ((scr - scpe) / gllof) / (scpe / glpe); falta <- list(F = Fl, gl1 = gllof, gl2 = glpe, p = pf(Fl, gllof, glpe, lower.tail = FALSE))
    anova$fuente <- c(anova$fuente, "Falta de ajuste", "Error puro"); anova$gl <- c(anova$gl, gllof, glpe); anova$sc <- c(anova$sc, scr - scpe, scpe)
    anova$cm <- c(anova$cm, (scr - scpe) / gllof, scpe / glpe); anova$F <- c(anova$F, Fl, NA); anova$p <- c(anova$p, falta$p, NA)
  }
  fx <- function(x) sum(coef * vapply(terms, function(t) prod(x[t]), 0)); sgn <- if (objetivo == "maximo") 1 else -1
  mejor <- list(val = -Inf)
  for (i in seq_len(q)) { x <- rep(0, q); x[i] <- 1; v <- sgn * fx(x); if (v > mejor$val + 1e-13) mejor <- list(val = v, x = x) }
  if (modelo != "lineal") for (s in seq_len(2^q - 1)) {
    S <- which(bitwAnd(s, 2^(0:(q - 1))) > 0); if (length(S) < 2) next
    full <- function(u) { x <- rep(0, q); x[S] <- c(u, 1 - sum(u)); x }
    obj <- function(u) { x <- full(u); if (any(x[S] < 0)) return(1e10 + sum(pmin(x, 0)^2)); -sgn * fx(x) }
    for (r in 1:12) {
      w <- (seq_along(S) * r) %% 7 + 1; u0 <- (w / sum(w))[-length(S)]
      o <- optim(u0, obj, method = "BFGS", control = list(reltol = 1e-15, maxit = 10000))
      o <- optim(o$par, obj, method = "BFGS", control = list(reltol = 1e-16, maxit = 10000))
      x <- full(o$par); if (all(x[S] > 1e-6)) { v <- sgn * fx(x); if (v > mejor$val + 1e-13) mejor <- list(val = v, x = x) }
    }
  }
  V <- vcov(m); a <- vapply(terms, function(t) prod(mejor$x[t]), 0); pr <- sum(a * coef); epr <- sqrt(drop(t(a) %*% V %*% a)); qt_ <- qt(1 - (1 - nivel) / 2, gl)
  out <- list(coeficientes = list(estimado = coef, ee = unname(cf[, 2]), t = unname(cf[, 3]), p = unname(cf[, 4])), anova = anova,
              ajuste = list(n = n, gl = gl, sigma = sqrt(s2), r2 = scm / sct, r2_ajustada = 1 - s2 / (sct / (n - 1))),
              optimo = list(mezcla = mejor$x, prediccion = pr, ee = epr, ic_inf = pr - qt_ * epr, ic_sup = pr + qt_ * epr))
  if (!is.null(falta)) out$falta_ajuste <- falta
  out
}

#' Deseabilidad (Derringer y Suich 1980): cada respuesta con su modelo de segundo orden (ref_superficie), d y D en
#' fórmula cerrada y la mayor D por optim (Nelder-Mead de R) desde cada punto del diseño y el centro, con el punto
#' llevado a la región (cubo de los niveles codificados o esfera de radio la mayor distancia).
ref_deseabilidad <- function(datos, factores, respuestas, region = "cubo") {
  nombres <- vapply(respuestas, function(rs) rs$nombre, "")
  d <- datos[complete.cases(datos[c(factores, nombres)]), , drop = FALSE]; k <- length(factores)
  mods <- lapply(respuestas, function(rs) ref_superficie(d, rs$nombre, factores, "segundo"))
  cod <- mods[[1]]$codificacion; Z <- sweep(sweep(sapply(factores, function(f) d[[f]]), 2, cod$centro), 2, cod$paso, "/"); n <- nrow(Z)
  lo <- apply(Z, 2, min); hi <- apply(Z, 2, max); radio <- max(sqrt(rowSums(Z^2)))
  llevar <- function(z) if (region == "esfera") { r <- sqrt(sum(z^2)); if (r > radio) z * radio / r else z } else pmin(hi, pmax(lo, z))
  predice <- function(mo, z) { cf <- mo$coeficientes$estimado; pr <- if (k > 1) { p <- t(combn(k, 2)); z[p[, 1]] * z[p[, 2]] } else numeric(); sum(cf * c(1, z, pr, z^2)) }
  dfun <- function(y, rs) {
    s <- if (is.null(rs$s)) 1 else rs$s; t <- if (is.null(rs$t)) 1 else rs$t
    switch(rs$meta, max = if (y <= rs$L) 0 else if (y >= rs$U) 1 else ((y - rs$L) / (rs$U - rs$L))^s,
                    min = if (y >= rs$U) 0 else if (y <= rs$L) 1 else ((rs$U - y) / (rs$U - rs$L))^s,
                    valor = if (y < rs$L || y > rs$U) 0 else if (y <= rs$T) ((y - rs$L) / (rs$T - rs$L))^s else ((rs$U - y) / (rs$U - rs$T))^t)
  }
  imp <- vapply(respuestas, function(rs) if (is.null(rs$r)) 1 else rs$r, 0)
  evalua <- function(z) {
    yp <- vapply(mods, predice, 0, z = z); ds <- vapply(seq_along(respuestas), function(i) dfun(yp[i], respuestas[[i]]), 0)
    list(yp = yp, ds = ds, D = if (any(ds <= 0)) 0 else exp(sum(imp * log(ds)) / sum(imp)))
  }
  mejor <- list(D = -1)
  for (r in seq_len(n + 1)) {
    z0 <- if (r <= n) unname(Z[r, ]) else rep(0, k)
    o <- optim(z0, function(z) -evalua(llevar(z))$D, method = "Nelder-Mead", control = list(reltol = 1e-15, maxit = 20000))
    o <- optim(o$par, function(z) -evalua(llevar(z))$D, method = "Nelder-Mead", control = list(reltol = 1e-15, maxit = 20000))
    z <- llevar(o$par); e <- evalua(z); if (e$D > mejor$D + 1e-12) mejor <- c(list(z = z), e)
  }
  pts <- vapply(seq_len(n), function(r) evalua(unname(Z[r, ]))$D, 0)
  list(optimo = list(codificado = mejor$z, natural = cod$centro + cod$paso * mejor$z, prediccion = mejor$yp, d = mejor$ds, D = mejor$D),
       puntos = list(D = pts), radio = radio)
}
