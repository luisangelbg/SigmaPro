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

ma_preparar <- function(datos, y, gen, amb, rep = "", ejes_imputar = 1) {
  vars <- c(y, gen, amb, if (nzchar(rep)) rep)
  d <- datos[complete.cases(datos[vars]), , drop = FALSE]
  G <- droplevels(d[[gen]]); A <- droplevels(d[[amb]]); R <- if (nzchar(rep)) droplevels(factor(d[[rep]])) else NULL
  Y <- tapply(d[[y]], list(G, A), mean); N <- tapply(d[[y]], list(G, A), length); N[is.na(N)] <- 0
  imputacion <- NULL
  if (anyNA(Y)) {
    # EM-AMMI de metan, con una tolerancia más fina que la de omisión (la app usa 1e-12)
    im <- metan::impute_missing_val(Y, naxis = ejes_imputar, algorithm = "EM-AMMI", tol = 1e-14, max_iter = 100000, verbose = FALSE)
    vacias <- which(is.na(Y), arr.ind = TRUE); vacias <- vacias[order(vacias[, 1], vacias[, 2]), , drop = FALSE]
    imputacion <- list(celdas = lapply(seq_len(nrow(vacias)), function(k) list(genotipo = levels(G)[vacias[k, 1]], ambiente = levels(A)[vacias[k, 2]],
                                                                                valor = unname(im$.data[vacias[k, 1], vacias[k, 2]]))),
                       ejes = im$final_naxis)
    Y[] <- im$.data
  }
  list(d = d, y = d[[y]], G = G, A = A, R = R, Y = unname(Y), N = unname(N), genos = levels(G), ambs = levels(A), imputacion = imputacion)
}

#' Huehn (Nassar y Huehn 1987) en R base; se compara con agricolae::stability.nonpar (S1, S2 y Z2: su Z1 usa g² en lugar
#' de g² − 1 en la varianza de S1, una errata) y se cuida que metan::Huehn no sirve de referencia (su S1 compara un solo
#' par de ambientes y redondea a 4 decimales).
ma_huehn <- function(Y, objetivo) {
  s <- if (objetivo == "maximo") 1 else -1; g <- nrow(Y); e <- ncol(Y)
  # rangos con 12 cifras: dos medias iguales sumadas en otro orden empatan (como en la app)
  Rc <- apply(signif(s * (Y - rowMeans(Y) + mean(Y)), 12), 2, rank); Ry <- apply(signif(s * Y, 12), 2, rank); pares <- utils::combn(e, 2)
  S1 <- apply(Rc, 1, function(v) mean(abs(v[pares[1, ]] - v[pares[2, ]]))); S2 <- apply(Rc, 1, var)
  S3 <- rowSums((Ry - rowMeans(Ry))^2) / rowMeans(Ry); S6 <- rowSums(abs(Ry - rowMeans(Ry))) / rowMeans(Ry)
  E1 <- (g^2 - 1) / (3 * g); E2 <- (g^2 - 1) / 12
  V1 <- (g^2 - 1) * ((g^2 - 4) * (e + 3) + 30) / (45 * g^2 * e * (e - 1)); V2 <- (g^2 - 1) * (2 * (g^2 - 4) * (e - 1) + 5 * (g^2 - 1)) / (360 * e * (e - 1))
  Z1 <- (S1 - E1)^2 / V1; Z2 <- (S2 - E2)^2 / V2
  ag <- agricolae::stability.nonpar(data.frame(gen = paste0("g", seq_len(g)), s * Y))$ranking
  stopifnot(max(abs(ag$s1 - S1)) < 1e-10, max(abs(ag$s2 - S2)) < 1e-10, max(abs(ag$Z2 - Z2)) < 1e-8)
  list(S1 = unname(S1), S2 = unname(S2), S3 = unname(S3), S6 = unname(S6), Z1 = unname(Z1), Z2 = unname(Z2),
       p1 = pchisq(Z1, 1, lower.tail = FALSE), p2 = pchisq(Z2, 1, lower.tail = FALSE), esperado = list(S1 = E1, S2 = E2, V1 = V1, V2 = V2),
       suma = list(Z1 = sum(Z1), Z2 = sum(Z2), p1 = pchisq(sum(Z1), g, lower.tail = FALSE), p2 = pchisq(sum(Z2), g, lower.tail = FALSE)))
}
#' YS de Kang (1993) en R base, comprobado contra agricolae::stability.par con datos balanceados (sus gl son m·(g − 1)·(r − 1)).
ma_kang <- function(Y, r, cme, gle, objetivo, balanceado) {
  s <- if (objetivo == "maximo") 1 else -1; g <- nrow(Y); e <- ncol(Y); mv <- s * rowMeans(Y); mes <- mean(mv)
  Z <- Y - outer(rowMeans(Y), colMeans(Y), "+") + mean(Y); W <- rowSums(Z^2)
  SI <- r * (g * (g - 1) * W - sum(W)) / ((g - 1) * (g - 2) * (e - 1)); dms <- qt(0.95, gle) * sqrt(2 * cme / (r * e))
  aj <- ifelse(mv >= mes + 2 * dms, 3, ifelse(mv >= mes + dms, 2, ifelse(mv > mes, 1, ifelse(mv <= mes - 2 * dms, -3, ifelse(mv <= mes - dms, -2, ifelse(mv < mes, -1, 0))))))
  F <- SI / cme; cal <- ifelse(F >= qf(0.99, e - 1, gle), -8, ifelse(F >= qf(0.95, e - 1, gle), -4, ifelse(F >= qf(0.9, e - 1, gle), -2, 0)))
  mr <- signif(mv, 12); rango <- vapply(mr, function(v) 1 + sum(mr < v), 0); YS <- rango + aj + cal
  if (balanceado) {
    ys <- s * Y; rownames(ys) <- paste0("g", seq_len(g))
    ag <- agricolae::stability.par(ys, rep = r, MSerror = cme)$stability
    stopifnot(all(ag$YSi == YS), all(ag$Rank == rango), all(ag$Adj.rank == aj), all(ag$Stab.rating == cal), max(abs(ag$Stab.var - SI)) < 1e-5)
  }
  list(rango = unname(rango), ajuste = unname(aj), dms = dms, sigma2 = unname(SI), F = unname(F), p = pf(F, e - 1, gle, lower.tail = FALSE), califica = unname(cal),
       YS = unname(YS), YS_media = mean(YS), seleccionado = unname(YS > mean(YS)))
}
#' Índice de Annicchiarico (1992) en R base, comprobado contra metan::Annicchiarico con las parcelas.
ma_annicchiarico <- function(Y, prob, parcelas = NULL) {
  em <- colMeans(Y); idx <- em - mean(Y); z <- qnorm(1 - prob)
  uno <- function(cols) {
    if (length(cols) < 2) return(NULL)
    P <- sweep(Y[, cols, drop = FALSE], 2, em[cols], "/") * 100; m <- rowMeans(P); de <- apply(P, 1, sd); W <- m - z * de
    list(media = unname(rowMeans(Y[, cols, drop = FALSE])), pct = unname(m), de = unname(de), Wi = unname(W), rango = unname(rank(-signif(W, 12))))
  }
  out <- list(prob = prob, z = z, indice = unname(idx), general = uno(seq_along(em)), favorables = uno(which(idx >= 0)), desfavorables = uno(which(idx < 0)))
  if (!is.null(parcelas)) {
    mt <- metan::Annicchiarico(parcelas, ENV, GEN, REP, Y, prob = prob, verbose = FALSE)[[1]]
    stopifnot(max(abs(mt$general$Wi - out$general$Wi)) < 1e-8)
  }
  out[!vapply(out, is.null, TRUE)]
}
#' WAAS (Olivoto et al. 2019) en R base; metan::waas usa las proporciones de cada eje redondeadas (se imprime la diferencia).
ma_waas <- function(ammi, medias, k, peso, objetivo) {
  pct <- ammi$ejes$pct; w <- function(S) apply(abs(S[, 1:k, drop = FALSE]), 1, weighted.mean, w = pct[1:k])
  Wg <- w(ammi$genotipos); We <- w(ammi$ambientes)
  pr <- if (objetivo == "maximo") 100 * (medias - min(medias)) / diff(range(medias)) else 100 * (max(medias) - medias) / diff(range(medias))
  pw <- 100 * (max(Wg) - Wg) / diff(range(Wg))
  list(ejes = k, genotipos = unname(Wg), ambientes = unname(We), pct_respuesta = unname(pr), pct_waas = unname(pw), waasy = unname((pr * peso + pw * (100 - peso)) / 100), peso_respuesta = peso)
}
#' Análisis en dos etapas: emmeans en cada ambiente; la REML de σ²_GA escrita en R (matrices densas, optimize) y comprobada
#' contra metafor::rma (el mismo modelo: varianzas conocidas más un efecto aleatorio) y su Wald (QM). nlme::lme con
#' lmeControl(sigma = 1) y varFixed no sirve: con sigma fija su REML no es la de Harville (0.0435 contra 0.0541 en la
#' avena; la de Harville por contrastes de error y metafor dan 0.0541; su ML sí coincide).
ref_dos_etapas <- function(datos, y, gen, amb, rep = "", objetivo = "maximo") {
  p <- ma_preparar(datos, y, gen, amb, rep)
  por <- lapply(seq_along(p$ambs), function(j) {
    s <- p$A == p$ambs[j]; dd <- data.frame(y = p$y[s], G = factor(p$G[s], levels = p$genos), R = if (!is.null(p$R)) droplevels(p$R[s]) else NA)
    dd$G <- droplevels(dd$G)
    m <- if (!is.null(p$R)) lm(y ~ R + G, data = dd) else lm(y ~ G, data = dd)
    em <- as.data.frame(emmeans::emmeans(m, "G")); em <- em[is.finite(em$emmean), ]
    list(media = mean(dd$y), cme = deviance(m) / m$df.residual, gl = m$df.residual, k = nrow(em),
         filas = data.frame(gen = factor(as.character(em$G), levels = p$genos), amb = factor(p$ambs[j], levels = p$ambs), m = em$emmean, v = em$SE^2))
  })
  e1 <- do.call(rbind, lapply(por, `[[`, "filas")); X <- model.matrix(~ gen + amb, e1); N <- nrow(e1); G <- length(p$genos); E <- length(p$ambs)
  menos2 <- function(s2) { w <- 1 / (s2 + e1$v); A <- crossprod(X, X * w); b <- solve(A, crossprod(X, w * e1$m)); res <- e1$m - drop(X %*% b)
    sum(log(s2 + e1$v)) + as.numeric(determinant(A)$modulus) + sum(w * res^2) }
  tope <- max(10 * var(e1$m), 1e-8); s2 <- optimize(menos2, c(0, tope), tol = 1e-15)$minimum
  # se pule con la raíz del score de la REML, tr(P) − y'P²y, con la P densa
  score <- function(s2) { Vi <- diag(1 / (s2 + e1$v)); P <- Vi - Vi %*% X %*% solve(t(X) %*% Vi %*% X, t(X) %*% Vi); sum(diag(P)) - drop(t(e1$m) %*% P %*% P %*% e1$m) }
  if (menos2(0) <= menos2(s2) || score(0) >= 0) s2 <- 0 else s2 <- uniroot(score, s2 * c(0.999, 1.001), extendInt = "upX", tol = 1e-15 * s2, maxiter = 1000)$root
  mf <- metafor::rma(yi = m, vi = v, mods = ~ gen + amb, data = e1, method = "REML", control = list(threshold = 1e-14, maxiter = 10000))
  stopifnot(abs(mf$tau2 - s2) < 1e-7 * max(1, s2))
  w <- 1 / (s2 + e1$v); C <- solve(crossprod(X, X * w)); b <- drop(C %*% crossprod(X, w * e1$m))
  L <- t(vapply(seq_len(G), function(i) c(1, if (G > 1) as.numeric(seq_len(G - 1) + 1 == i) else NULL, rep(1 / E, E - 1)), numeric(ncol(X))))
  ig <- 2:G; W <- drop(t(b[ig]) %*% solve(C[ig, ig]) %*% b[ig]); gl2 <- N - ncol(X)
  stopifnot(abs(anova(mf, btt = ig)$QM - W) < 1e-6 * W)
  simple <- vapply(seq_len(G), function(i) { x <- e1$m[e1$gen == p$genos[i]]; if (length(x) == E) mean(x) else NA_real_ }, 0)
  list(genotipos = p$genos, ambientes_nombre = p$ambs,
       ambientes = list(media = vapply(por, `[[`, 0, "media"), cme = vapply(por, `[[`, 0, "cme"), gl = vapply(por, `[[`, 0, "gl"),
                        cv = vapply(por, function(x) 100 * sqrt(x$cme) / x$media, 0), genotipos = vapply(por, `[[`, 0, "k")),
       celdas = N, sigma2_ga = s2, estimados = list(media = drop(L %*% b), ee = sqrt(diag(L %*% C %*% t(L))), simple = simple),
       wald = list(F = W / (G - 1), gl1 = G - 1, gl2 = gl2, p = pf(W / (G - 1), G - 1, gl2, lower.tail = FALSE), W = W))
}

ma_orientar <- function(U, V, primero_suma = FALSE) {
  for (k in seq_len(ncol(V))) {
    voltear <- if (primero_suma && k == 1) sum(V[, k]) < 0 else V[which.max(abs(V[, k])), k] < 0
    if (voltear) { U[, k] <- -U[, k]; V[, k] <- -V[, k] }
  }
  list(U = U, V = V)
}

ref_multiambiente <- function(datos, y, gen, amb, rep = "", alfa = 0.05, escala = "ninguna", particion = "simetrica", objetivo = "maximo", eeb = "propio",
                              ejesImputar = 1, ejesWaas = 0, pesoRespuesta = 50, probAnnicchiarico = 0.25, genotipoA = "", genotipoB = "") {
  p <- ma_preparar(datos, y, gen, amb, rep, ejesImputar)
  Y <- p$Y; g <- nrow(Y); e <- ncol(Y); r <- 1 / mean(1 / p$N[p$N > 0]); faltan <- sum(p$N == 0)
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
  if (!is.null(p$imputacion)) out$imputacion <- p$imputacion
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
  out$huehn <- ma_huehn(Y, objetivo)
  if (gle > 0) out$kang <- ma_kang(Y, r, cme, gle, objetivo, balanceado = length(unique(c(p$N))) == 1 && !is.null(p$R))
  if (objetivo == "maximo") out$annicchiarico <- ma_annicchiarico(Y, probAnnicchiarico,
    if (!is.null(p$R) && length(unique(c(p$N))) == 1) data.frame(ENV = p$A, GEN = p$G, REP = p$R, Y = p$y) else NULL)
  # AMMI
  s <- svd(Z); mm <- min(g - 1, e - 1); o <- ma_orientar(s$u[, 1:mm, drop = FALSE], s$v[, 1:mm, drop = FALSE]); dd <- s$d[1:mm]
  ssGE <- r * sum(Z^2); ssk <- r * dd^2; glk <- g + e - 1 - 2 * seq_len(mm)
  ok <- glk > 0
  ejes <- list(sv = dd, sc = ssk, pct = 100 * ssk / ssGE, acum = 100 * cumsum(ssk) / ssGE, gl = ifelse(ok, glk, NA))
  ejes$cm <- ifelse(ok, ssk / glk, NA)
  if (gle > 0) { ejes$F <- ejes$cm / cme; ejes$p <- pf(ejes$F, ejes$gl, gle, lower.tail = FALSE) }
  out$ammi <- list(ejes = ejes)
  res_gl <- (g - 1) * (e - 1) - faltan - sum(glk[ok]); res_sc <- ssGE - sum(ssk[ok])
  if (res_gl > 0) { out$ammi$residuo <- list(sc = res_sc, gl = res_gl, cm = res_sc / res_gl)
    if (gle > 0) { out$ammi$residuo$F <- res_sc / res_gl / cme; out$ammi$residuo$p <- pf(out$ammi$residuo$F, res_gl, gle, lower.tail = FALSE) } }
  if (gle > 0) {
    n <- 0:(mm - 1); glr <- (g - 1 - n) * (e - 1 - n) - faltan; n <- n[glr > 0]; glr <- glr[glr > 0]
    scr <- ssGE - c(0, cumsum(ssk))[n + 1]
    out$ammi$fr <- list(n = n, sc = scr, gl = glr, cm = scr / glr, F = scr / glr / cme, p = pf(scr / glr / cme, glr, gle, lower.tail = FALSE))
    nfr <- which(!(out$ammi$fr$p < alfa))[1]; out$ammi$n_fr <- if (is.na(nfr)) length(n) else nfr - 1
  }
  out$ammi$genotipos <- o$U %*% diag(sqrt(dd), mm)
  out$ammi$ambientes <- o$V %*% diag(sqrt(dd), mm)
  if (mm >= 2) out$ammi$asv <- sqrt((ssk[1] / ssk[2] * out$ammi$genotipos[, 1])^2 + out$ammi$genotipos[, 2]^2)
  kw <- if (ejesWaas > 0) ejesWaas else if (gle > 0) sum(ejes$p < alfa, na.rm = TRUE) else mm
  out$waas <- ma_waas(out$ammi, gm, max(1, min(kw, mm)), pesoRespuesta, objetivo)
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
  # vistas (Yan y Tinker 2006): ideales sobre el eje del ambiente promedio, a la distancia del vector más largo
  ig <- max(sqrt(rowSums(Gc^2))) * u; ie <- max(sqrt(rowSums(Ec^2))) * u
  out$gge$genotipo_ideal <- ig; out$gge$ambiente_ideal <- ie
  out$gge$distancia_genotipos <- sqrt(rowSums(sweep(Gc, 2, ig)^2)); out$gge$distancia_ambientes <- sqrt(rowSums(sweep(Ec, 2, ie)^2))
  if (nzchar(genotipoA)) {
    a <- match(genotipoA, p$genos); b <- match(genotipoB, p$genos); esc <- sgn * (if (escala == "desviacion") sd_e else 1)
    out$gge$comparacion <- list(a = genotipoA, b = genotipoB, prevista = unname(drop((Gc[a, ] - Gc[b, ]) %*% t(Ec)) * esc), observada = unname(Y[a, ] - Y[b, ]))
  }
  out
}
