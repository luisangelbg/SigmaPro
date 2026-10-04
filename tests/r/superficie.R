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
                           objetivo = "maximo", nivel = 0.95) {
  vars <- c(y, factores, if (nzchar(bloque)) bloque)
  d <- datos[complete.cases(datos[vars]), , drop = FALSE]
  k <- length(factores); n <- nrow(d); yv <- d[[y]]
  cod <- t(vapply(factores, function(f) sr_codificacion(d[[f]]), c(centro = 0, paso = 0)))
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
