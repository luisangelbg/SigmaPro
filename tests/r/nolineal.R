# SigmaPro — referencia de la regresión no lineal (stats::nls en el R de escritorio, con el gradiente analítico).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Cada modelo trae su valor y su gradiente analítico (atributo «gradient»): así nls converge con tol = 1e-10 al óptimo
# (tol = 1e-8: más abajo la suma de cuadrados ya no distingue mejoras de su redondeo; los parámetros quedan con ~9 cifras). Los parámetros pueden ser comunes o uno por grupo (vectores
# indexados por el grupo): con eso se comparan curvas (prueba F de la suma de cuadrados extra, como anova(m0, m1)).
# Lineal-meseta (no derivable en x0): el óptimo se busca por perfil (en cada intervalo entre dosis observadas, x0 por
# optimize con a y b por mínimos cuadrados; con x0 por grupo y a o b comunes, optim en cada combinación de intervalos
# de los grupos) y nls arranca ahí para dar el gradiente y los EE.
# Con pesos, nls(weights = w); log L y R² ponderados como logLik.nls.
# Intervalos de Wald con t (gl = n − p) o por perfil: la raíz exacta (uniroot) de τ(β) = ±t, con los demás parámetros
# reajustados por nls en cada β (confint() de nls interpola el perfil y se imprime solo para comparar).
# Derivados por el método delta: los de forma cerrada con su gradiente; los de Brain-Cousens (DE50, dosis de máxima
# respuesta) y la dosis económica (raíz de la derivada simbólica de la curva, stats::D) con el gradiente numérico de
# numDeriv (Richardson), que no depende de las fórmulas de la app.
NL_CTRL <- stats::nls.control(maxiter = 1000, tol = 1e-8, minFactor = 1e-10, warnOnly = TRUE)

#' Brain-Cousens: valor y gradiente en (b, c, d, e, f).
nl_bc <- function(x, b, c, d, e, f) {
  E <- ifelse(x > 0, (x / e)^b, if (b > 0) 0 else Inf); fin <- is.finite(E)
  N <- d - c + f * x; u <- 1 + E; lg <- ifelse(x > 0, log(x / e), 0)
  v <- ifelse(is.nan(E), NaN, ifelse(fin, c + N / u, c))   # e <= 0: fuera del dominio
  attr(v, "gradient") <- cbind(ifelse(fin, -N * E * lg / u^2, 0), ifelse(fin, E / u, 1), ifelse(fin, 1 / u, 0), ifelse(fin, N * E * (b / e) / u^2, 0), ifelse(fin, x / u, 0))
  v
}

# ---- los modelos: valor y gradiente (columnas en el orden de «par»)
nl_modelos <- list(
  logistico = list(par = c("Asym", "xmid", "scal"), f = function(x, p) {
    E <- exp((p[2] - x) / p[3]); v <- p[1] / (1 + E)
    attr(v, "gradient") <- cbind(1 / (1 + E), -p[1] * E / (1 + E)^2 / p[3], p[1] * E / (1 + E)^2 * (p[2] - x) / p[3]^2); v }),
  gompertz = list(par = c("Asym", "b2", "b3"), f = function(x, p) {
    B <- p[3]^x; E <- exp(-p[2] * B); v <- p[1] * E
    attr(v, "gradient") <- cbind(E, -p[1] * B * E, -p[1] * p[2] * x * p[3]^(x - 1) * E); v }),
  weibull = list(par = c("Asym", "Drop", "lrc", "pwr"), f = function(x, p) {
    u <- exp(p[3]) * x^p[4]; E <- exp(-u); v <- p[1] - p[2] * E
    attr(v, "gradient") <- cbind(1, -E, p[2] * E * u, ifelse(x > 0, p[2] * E * u * log(x), 0)); v }),
  ll4 = list(par = c("b", "c", "d", "e"), f = function(x, p) {
    E <- ifelse(x > 0, (x / p[4])^p[1], if (p[1] > 0) 0 else Inf); fin <- is.finite(E)
    v <- ifelse(is.nan(E), NaN, ifelse(fin, p[2] + (p[3] - p[2]) / (1 + E), p[2]))
    lg <- ifelse(x > 0, log(x / p[4]), 0)
    g <- cbind(ifelse(fin, -(p[3] - p[2]) * E * lg / (1 + E)^2, 0), ifelse(fin, E / (1 + E), 1), ifelse(fin, 1 / (1 + E), 0),
               ifelse(fin, (p[3] - p[2]) * E * (p[1] / p[4]) / (1 + E)^2, 0))
    attr(v, "gradient") <- g; v }),
  ll3 = list(par = c("b", "d", "e"), f = function(x, p) {
    E <- ifelse(x > 0, (x / p[3])^p[1], if (p[1] > 0) 0 else Inf); fin <- is.finite(E)
    v <- ifelse(is.nan(E), NaN, ifelse(fin, p[2] / (1 + E), 0))
    lg <- ifelse(x > 0, log(x / p[3]), 0)
    attr(v, "gradient") <- cbind(ifelse(fin, -p[2] * E * lg / (1 + E)^2, 0), ifelse(fin, 1 / (1 + E), 0), ifelse(fin, p[2] * E * (p[1] / p[3]) / (1 + E)^2, 0)); v }),
  bc5 = list(par = c("b", "c", "d", "e", "f"), f = function(x, p) nl_bc(x, p[1], p[2], p[3], p[4], p[5])),
  bc4 = list(par = c("b", "d", "e", "f"), f = function(x, p) { v <- nl_bc(x, p[1], 0, p[2], p[3], p[4]); attr(v, "gradient") <- attr(v, "gradient")[, c(1, 3, 4, 5), drop = FALSE]; v }),
  mitscherlich = list(par = c("a", "b", "c"), f = function(x, p) {
    E <- exp(-p[3] * x); v <- p[1] - p[2] * E
    attr(v, "gradient") <- cbind(1, -E, p[2] * x * E); v }),
  mm2 = list(par = c("d", "e"), f = function(x, p) { u <- p[2] + x; v <- p[1] * x / u; attr(v, "gradient") <- cbind(x / u, -p[1] * x / u^2); v }),
  mm3 = list(par = c("c", "d", "e"), f = function(x, p) { u <- p[3] + x; v <- p[1] + (p[2] - p[1]) * x / u; attr(v, "gradient") <- cbind(p[3] / u, x / u, -(p[2] - p[1]) * x / u^2); v }),
  "cuadratico-meseta" = list(par = c("a", "b", "c"), f = function(x, p) {
    x0 <- -p[2] / (2 * p[3]); bajo <- x < x0
    v <- ifelse(bajo, p[1] + p[2] * x + p[3] * x^2, p[1] - p[2]^2 / (4 * p[3]))
    attr(v, "gradient") <- cbind(1, ifelse(bajo, x, -p[2] / (2 * p[3])), ifelse(bajo, x^2, p[2]^2 / (4 * p[3]^2))); v }),
  "lineal-meseta" = list(par = c("a", "b", "x0"), f = function(x, p) {
    bajo <- x < p[3]; v <- p[1] + p[2] * pmin(x, p[3])
    attr(v, "gradient") <- cbind(1, pmin(x, p[3]), ifelse(bajo, 0, p[2])); v })
)
#' Las curvas como expresiones de R (para la derivada simbólica de la dosis económica).
nl_expresion <- list("cuadratico-meseta" = quote(a + b * x + c * x^2), mitscherlich = quote(a - b * exp(-c * x)),
                     mm2 = quote(d * x / (e + x)), mm3 = quote(c + (d - c) * x / (e + x)))

#' Función del modelo con parámetros comunes o por grupo para nls: devuelve el valor con su gradiente.
#' @param porGrupo  lógico por parámetro
nl_funcion <- function(modelo, porGrupo, G) {
  M <- nl_modelos[[modelo]]
  function(x, g, ...) {
    ps <- list(...); g <- as.integer(g); n <- length(x)
    v <- numeric(n); cols <- vapply(seq_along(ps), function(k) if (porGrupo[k]) G else 1L, 1L)
    grad <- matrix(0, n, sum(cols)); inicio <- c(0, cumsum(cols))[seq_along(ps)]
    for (h in seq_len(G)) {
      i <- which(g == h); if (!length(i)) next
      p <- vapply(seq_along(ps), function(k) if (porGrupo[k]) ps[[k]][h] else ps[[k]][1], 0)
      r <- M$f(x[i], p); v[i] <- r; gr <- attr(r, "gradient")
      for (k in seq_along(ps)) grad[i, inicio[k] + if (porGrupo[k]) h else 1] <- gr[, k]
    }
    attr(v, "gradient") <- grad; v
  }
}
#' Lineal-meseta por perfil: en cada intervalo entre x distintas, x0 por optimize (a y b por mínimos cuadrados).
nl_perfil_meseta <- function(x, y, w = rep(1, length(x))) {
  ux <- sort(unique(x)); mejor <- NULL
  rss <- function(x0) { z <- pmin(x, x0); sum(w * stats::lm.wfit(cbind(1, z), y, w)$residuals^2) }
  for (k in 2:(length(ux) - 1)) {
    o <- stats::optimize(rss, c(ux[k - 1], ux[k + 1]), tol = 1e-14)
    if (is.null(mejor) || o$objective < mejor$objective) mejor <- o
  }
  x0 <- mejor$minimum; z <- pmin(x, x0); ab <- stats::lm.wfit(cbind(1, z), y, w)$coefficients
  c(ab[[1]], ab[[2]], x0)
}
#' Lineal-meseta con a, b y x0 comunes o por grupo: dado x0, a y b por mínimos cuadrados ponderados. x0 común: optimize
#' en cada par de intervalos vecinos; x0 por grupo: optim (L-BFGS-B) en cada combinación de intervalos de los grupos.
#' Devuelve los valores iniciales en el orden de nls (lista por parámetro).
nl_meseta_patron <- function(d, porGrupo) {
  G <- nlevels(d$g); gi <- as.integer(d$g); pa <- porGrupo[1]; pb <- porGrupo[2]; px <- porGrupo[3]
  ind <- outer(gi, seq_len(G), "==") * 1
  X <- function(x0s) { z <- pmin(d$x, x0s[if (px) gi else rep(1L, length(gi))]); cbind(if (pa) ind else 1, if (pb) ind * z else z) }
  rss <- function(x0s) { f <- stats::lm.wfit(X(x0s), d$y, d$w); if (any(is.na(f$coefficients))) Inf else sum(d$w * f$residuals^2) }
  if (!px) {
    ux <- sort(unique(d$x)); mejor <- NULL
    for (k in 2:(length(ux) - 1)) { o <- stats::optimize(rss, c(ux[k - 1], ux[k + 1]), tol = 1e-14); if (is.null(mejor) || o$objective < mejor$objective) mejor <- o }
    x0s <- mejor$minimum
  } else {
    uxs <- lapply(levels(d$g), function(h) sort(unique(d$x[d$g == h])))
    combos <- expand.grid(lapply(uxs, function(u) 2:(length(u) - 1)))
    mejor <- NULL
    for (r in seq_len(nrow(combos))) {
      k <- unlist(combos[r, ]); lo <- mapply(function(u, j) u[j - 1], uxs, k); hi <- mapply(function(u, j) u[j + 1], uxs, k)
      o <- stats::optim((lo + hi) / 2, rss, method = "L-BFGS-B", lower = lo, upper = hi, control = list(factr = 10, pgtol = 0, maxit = 1000))
      if (is.null(mejor) || o$value < mejor$value) mejor <- o
    }
    x0s <- mejor$par
  }
  cf <- stats::lm.wfit(X(x0s), d$y, d$w)$coefficients; ka <- if (pa) G else 1
  list(unname(cf[seq_len(ka)]), unname(cf[-seq_len(ka)]), x0s)
}
#' Log-logístico por búsqueda global: con b y e fijos la curva es lineal en c y d (o en d), así que en una rejilla de
#' b y log e se resuelven por mínimos cuadrados y se toma el mejor punto como arranque.
nl_rejilla_ll <- function(d, cuatro) {
  pos <- d$x[d$x > 0]; mejor <- c(Inf, NA, NA)
  for (b in seq(0.2, 8, by = 0.05)) for (le in seq(log(min(pos)) - 1, log(max(pos)) + 1, length.out = 120)) {
    u <- 1 + ifelse(d$x > 0, exp(b * (log(pmax(d$x, 1e-300)) - le)), 0)
    X <- if (cuatro) cbind(1 - 1 / u, 1 / u) else cbind(1 / u)
    f <- stats::lm.wfit(X, d$y, d$w); r <- sum(d$w * f$residuals^2)
    if (r < mejor[1]) mejor <- c(r, b, le, f$coefficients)
  }
  if (cuatro) c(mejor[2], mejor[4], mejor[5], exp(mejor[3])) else c(mejor[2], mejor[4], exp(mejor[3]))
}
#' Valores iniciales (los de los selfStart de R o de drc donde los hay; si no, linealizaciones).
nl_inicio <- function(modelo, x, y) {
  d <- data.frame(x = x, y = y)
  switch(modelo,
    logistico = unname(stats::coef(stats::nls(y ~ SSlogis(x, Asym, xmid, scal), data = d))),
    gompertz = unname(stats::coef(stats::nls(y ~ SSgompertz(x, Asym, b2, b3), data = d))),
    weibull = unname(stats::coef(stats::nls(y ~ SSweibull(x, Asym, Drop, lrc, pwr), data = d))),
    mitscherlich = { cs <- stats::coef(stats::nls(y ~ SSasymp(x, Asym, R0, lrc), data = d)); c(cs[["Asym"]], cs[["Asym"]] - cs[["R0"]], exp(cs[["lrc"]])) },
    mm2 = unname(stats::coef(stats::nls(y ~ SSmicmen(x, Vm, K), data = d))),
    mm3 = unname(stats::coef(drc::drm(y ~ x, data = d, fct = drc::MM.3()))),
    bc5 = unname(stats::coef(drc::drm(y ~ x, data = d, fct = drc::BC.5()))),
    bc4 = unname(stats::coef(drc::drm(y ~ x, data = d, fct = drc::BC.4()))),
    ll4 = { cc <- min(y) - 0.05 * diff(range(y)); dd <- max(y) + 0.05 * diff(range(y)); i <- x > 0
            cf <- stats::coef(stats::lm(log((dd - y[i]) / (y[i] - cc)) ~ log(x[i]))); c(cf[[2]], cc, dd, exp(-cf[[1]] / cf[[2]])) },
    ll3 = { dd <- max(y) * 1.05; i <- x > 0 & y > 0; cf <- stats::coef(stats::lm(log((dd - y[i]) / y[i]) ~ log(x[i]))); c(cf[[2]], dd, exp(-cf[[1]] / cf[[2]])) },
    "cuadratico-meseta" = unname(stats::coef(stats::lm(y ~ x + I(x^2)))),
    "lineal-meseta" = nl_perfil_meseta(x, y))
}

#' Brain-Cousens: dosis de máxima respuesta (raíz de la derivada, con b > 1 y f > 0) y DE50 (después del máximo, la
#' respuesta baja a c + (d − c)/2), como MAX y ED de drc.
nl_bc_max <- function(p) {
  b <- p[["b"]]; c <- if ("c" %in% names(p)) p[["c"]] else 0; d <- p[["d"]]; e <- p[["e"]]; f <- p[["f"]]
  if (!(b > 1 && f > 0)) return(NA_real_)
  g <- function(x) { E <- (x / e)^b; f * (1 + E) - (d - c + f * x) * E * b / x }
  hi <- e; k <- 0; while (g(hi) > 0 && k < 80) { hi <- hi * 2; k <- k + 1 }
  stats::uniroot(g, c(e * 1e-8, hi), tol = 1e-15 * hi, maxiter = 2000)$root
}
nl_bc_ed50 <- function(p) {
  c <- if ("c" %in% names(p)) p[["c"]] else 0; e <- p[["e"]]
  resp <- function(x) as.numeric(nl_bc(x, p[["b"]], c, p[["d"]], e, p[["f"]]))
  meta <- c + 0.5 * (p[["d"]] - c); xm <- nl_bc_max(p)
  lo <- if (is.na(xm)) e * 1e-8 else xm; hi <- max(e, 2 * lo); k <- 0
  while (resp(hi) > meta && k < 80) { hi <- hi * 2; k <- k + 1 }
  stats::uniroot(function(x) resp(x) - meta, c(lo, hi), tol = 1e-15 * hi, maxiter = 2000)$root
}
#' Dosis económica: la raíz de f'(x) = R con la derivada simbólica de la curva; 0 si f'(0) ≤ R. Lineal-meseta: x0
#' mientras b pague el insumo.
nl_economica <- function(modelo, p, R) {
  if (modelo == "lineal-meseta") return(if (p[["b"]] > R) p[["x0"]] else 0)
  der <- stats::D(nl_expresion[[modelo]], "x"); en <- as.list(p)
  pend <- function(x) eval(der, c(en, list(x = x)))
  if (pend(0) <= R) return(0)
  hi <- 1; k <- 0; while (pend(hi) > R && k < 200) { hi <- hi * 2; k <- k + 1 }
  if (modelo == "cuadratico-meseta") hi <- min(hi, -p[["b"]] / (2 * p[["c"]]))
  stats::uniroot(function(x) pend(x) - R, c(0, hi), tol = 1e-15 * hi, maxiter = 2000)$root
}
#' Derivados con su gradiente: list(nombre, valor, gradiente).
nl_derivados <- function(modelo, p, R = NULL) {
  ed <- function(q) { k <- q / (100 - q); list(nombre = paste0("DE", q), valor = p[["e"]] * k^(1 / p[["b"]]), grad = c(b = -p[["e"]] * k^(1 / p[["b"]]) * log(k) / p[["b"]]^2, e = k^(1 / p[["b"]]))) }
  num <- function(nombre, fun) { v <- fun(p); if (is.na(v)) NULL else list(nombre = nombre, valor = v, grad = stats::setNames(numDeriv::grad(fun, p, method = "Richardson"), names(p))) }
  base <- switch(modelo,
    gompertz = list(list(nombre = "inflexion", valor = -log(p[["b2"]]) / log(p[["b3"]]), grad = c(b2 = -1 / (p[["b2"]] * log(p[["b3"]])), b3 = log(p[["b2"]]) / (p[["b3"]] * log(p[["b3"]])^2)))),
    ll4 = list(ed(10), ed(50), ed(90)), ll3 = list(ed(10), ed(50), ed(90)),
    bc5 = , bc4 = Filter(Negate(is.null), list(
      num("DE50", function(q) nl_bc_ed50(stats::setNames(q, names(p)))),
      num("dosis_maxima", function(q) nl_bc_max(stats::setNames(q, names(p)))),
      if (!is.na(nl_bc_max(p))) num("respuesta_maxima", function(q) { q <- stats::setNames(q, names(p)); xm <- nl_bc_max(q); as.numeric(nl_modelos[[modelo]]$f(xm, q)) }))),
    "cuadratico-meseta" = list(list(nombre = "dosis_optima", valor = -p[["b"]] / (2 * p[["c"]]), grad = c(b = -1 / (2 * p[["c"]]), c = p[["b"]] / (2 * p[["c"]]^2))),
                               list(nombre = "meseta", valor = p[["a"]] - p[["b"]]^2 / (4 * p[["c"]]), grad = c(a = 1, b = -p[["b"]] / (2 * p[["c"]]), c = p[["b"]]^2 / (4 * p[["c"]]^2)))),
    "lineal-meseta" = list(list(nombre = "meseta", valor = p[["a"]] + p[["b"]] * p[["x0"]], grad = c(a = 1, b = p[["x0"]], x0 = p[["b"]]))),
    list())
  if (!is.null(R) && modelo %in% c("cuadratico-meseta", "lineal-meseta", "mitscherlich", "mm2", "mm3")) {
    xe <- function(q) nl_economica(modelo, stats::setNames(q, names(p)), R)
    base <- c(base, list(num("dosis_economica", xe), num("respuesta_economica", function(q) as.numeric(nl_modelos[[modelo]]$f(xe(q), q)))))
  }
  base
}

#' Ajuste: nls (con el gradiente analítico) y luego Gauss-Newton puro hasta que el paso relativo baja de 1e-13 (nls se
#' detiene cuando la suma de cuadrados ya no distingue mejoras de su redondeo). Devuelve los parámetros en el orden de nls
#' (por parámetro y, dentro, por grupo), el gradiente J (multiplicado por √w) y la suma de cuadrados ponderada.
nl_ajuste <- function(d, modelo, porGrupo, inicio, G) {
  M <- nl_modelos[[modelo]]; fn <- nl_funcion(modelo, porGrupo, G)
  f <- stats::as.formula(paste0("y ~ fn(x, g, ", paste(M$par, collapse = ", "), ")"))
  st <- stats::setNames(lapply(seq_along(M$par), function(k) if (porGrupo[k]) rep_len(inicio[[k]], G) else inicio[[k]][1]), M$par)
  m <- suppressWarnings(stats::nls(f, data = d, start = st, weights = w, control = NL_CTRL))
  th <- stats::coef(m); largos <- vapply(st, length, 1L); sw <- sqrt(d$w)
  evalua <- function(th) { ps <- split(unname(th), rep(seq_along(largos), largos)); do.call(fn, c(list(d$x, d$g), ps)) }
  rssDe <- function(th) { v <- evalua(th); s <- sum(d$w * (d$y - as.numeric(v))^2); if (is.finite(s)) s else Inf }
  if (!isTRUE(m$convInfo$isConv)) {   # nls no llegó: BFGS con el gradiente analítico (−2 J'W r) hasta cerca del óptimo
    gr <- function(th) { v <- evalua(th); -2 * drop(crossprod(attr(v, "gradient"), d$w * (d$y - as.numeric(v)))) }
    th <- stats::setNames(stats::optim(th, rssDe, gr, method = "BFGS", control = list(maxit = 10000, reltol = 1e-16))$par, names(th))
  }
  # pulido hasta J'W r = 0: Gauss-Newton amortiguado (μ a la mitad mientras los pasos no se achican a la mitad); si no
  # llega o termina con más suma de cuadrados, queda el punto de antes
  th0 <- th; rss0 <- rssDe(th); mu <- 1; previo <- Inf; pulido <- FALSE
  for (k in 1:400) {
    v <- evalua(th); J <- attr(v, "gradient") * sw; paso <- tryCatch(qr.solve(J, sw * (d$y - as.numeric(v))), error = function(e) NULL)
    if (is.null(paso) || any(!is.finite(paso))) break
    tam <- max(abs(paso) / pmax(abs(th), 1e-10))
    if (tam > 0.5 * previo && mu > 1 / 1024) mu <- mu / 2
    previo <- tam; th <- th + mu * paso
    if (tam < 1e-13) { pulido <- TRUE; break }
  }
  if (!pulido || rssDe(th) > rss0 * (1 + 1e-9)) th <- th0
  v <- evalua(th)
  list(par = th, J = attr(v, "gradient") * sw, rss = sum(d$w * (d$y - as.numeric(v))^2), n = nrow(d), p = length(th), evalua = evalua, modelo = m)
}
#' Mínimos cuadrados con el parámetro j fijo en b, desde «desde»: Gauss-Newton con medios pasos y luego puro.
nl_fijo <- function(d, evalua, q, j, b, desde) {
  sw <- sqrt(d$w)
  ev <- function(th) { full <- numeric(q); full[j] <- b; full[-j] <- th; v <- evalua(full); list(v = as.numeric(v), J = attr(v, "gradient")[, -j, drop = FALSE]) }
  rssDe <- function(th) { r <- ev(th); s <- sum(d$w * (d$y - r$v)^2); if (is.finite(s)) s else Inf }
  th <- desde; actual <- rssDe(th)
  for (k in 1:500) {
    r <- ev(th); paso <- qr.solve(r$J * sw, sw * (d$y - r$v)); t <- 1
    repeat { nuevo <- th + t * paso; rn <- rssDe(nuevo); if (is.finite(rn) && rn <= actual) break; t <- t / 2; if (t < 1e-10) break }
    if (t < 1e-10) break
    th <- nuevo; actual <- rn
    if (max(abs(t * paso) / pmax(abs(th), 1e-10)) < 1e-11) break
  }
  for (k in 1:100) { r <- ev(th); paso <- qr.solve(r$J * sw, sw * (d$y - r$v)); th <- th + paso; if (max(abs(paso) / pmax(abs(th), 1e-10)) < 1e-13) break }
  list(th = th, rss = rssDe(th))
}
#' Intervalos por perfil: para cada parámetro, uniroot de τ(β) ∓ t con los demás reajustados; NA si no llega.
nl_perfil <- function(d, aj, s2, qt, ee) {
  q <- length(aj$par); th0 <- unname(aj$par); inf <- sup <- rep(NA_real_, q)
  for (j in seq_len(q)) {
    tau <- function(b, desde) { r <- tryCatch(nl_fijo(d, aj$evalua, q, j, b, desde), error = function(e) NULL); if (is.null(r) || !is.finite(r$rss)) return(NULL); list(t = sign(b - th0[j]) * sqrt(max(0, r$rss - aj$rss) / s2), th = r$th) }
    for (dir in c(-1, 1)) {
      prev <- list(b = th0[j], t = 0, th = th0[-j]); h <- 0.75 * qt * ee[j]; lim <- NA_real_
      for (it in 1:80) {
        b <- prev$b + dir * h; r <- tau(b, prev$th)
        if (is.null(r)) { h <- h / 2; if (h < 1e-9 * max(abs(th0[j]), ee[j])) break; next }   # fuera del dominio: medio paso
        if (abs(r$t) >= qt) {
          desde <- prev$th
          lim <- tryCatch(stats::uniroot(function(bb) tau(bb, desde)$t - dir * qt, sort(c(prev$b, b)), tol = 1e-13 * max(abs(th0[j]), ee[j]), maxiter = 1000)$root, error = function(e) NA_real_)
          break
        }
        prev <- list(b = b, t = r$t, th = r$th); h <- h * 1.6
      }
      if (dir < 0) inf[j] <- lim else sup[j] <- lim
    }
  }
  list(inf = inf, sup = sup)
}

#' Ajuste de referencia de un modelo: con «grupo», el modelo completo (cada parámetro por grupo), la curva común y la
#' prueba de cada parámetro común. EE, log-verosimilitud y pruebas F con las fórmulas de summary.nls, logLik.nls y
#' anova.nls.
ref_nolineal <- function(datos, y, x, modelo, grupo = "", nivel = 0.95, pesos = "", intervalo = "wald", precios = NULL) {
  vars <- c(y, x, if (nzchar(grupo)) grupo, if (nzchar(pesos)) pesos)
  d0 <- datos[stats::complete.cases(datos[vars]), vars, drop = FALSE]
  if (nzchar(pesos)) d0 <- d0[d0[[pesos]] > 0, , drop = FALSE]
  d <- data.frame(y = d0[[y]], x = d0[[x]], g = if (nzchar(grupo)) factor(d0[[grupo]]) else factor(rep(1, nrow(d0))), w = if (nzchar(pesos)) d0[[pesos]] else 1)
  G <- nlevels(d$g); M <- nl_modelos[[modelo]]; P <- length(M$par)
  solo <- function(h) { dd <- d[d$g == h, ]; dd$g <- factor(rep(1, nrow(dd))); dd }
  ajusta <- function(porGrupo) {
    if (modelo == "lineal-meseta") ini <- nl_meseta_patron(d, porGrupo)
    else if (any(porGrupo)) {   # por grupo: arranca de cada curva sola
      pg <- t(vapply(levels(d$g), function(h) { dd <- solo(h); nl_ajuste(dd, modelo, rep(FALSE, P), as.list(nl_inicio(modelo, dd$x, dd$y)), 1)$par }, numeric(P)))
      ini <- lapply(seq_len(P), function(k) if (porGrupo[k]) pg[, k] else mean(pg[, k]))
    } else {
      # una sola curva: además de la linealización, el arranque de drc (LL.4, LL.3); gana la menor suma de cuadrados
      otros <- switch(modelo, ll4 = list(unname(stats::coef(drc::drm(y ~ x, data = d, fct = drc::LL.4()))), nl_rejilla_ll(d, TRUE)),
                      ll3 = list(unname(stats::coef(drc::drm(y ~ x, data = d, fct = drc::LL.3()))), nl_rejilla_ll(d, FALSE)), list())
      ajustes <- lapply(c(list(nl_inicio(modelo, d$x, d$y)), otros), function(s) tryCatch(nl_ajuste(d, modelo, porGrupo, as.list(s), G), error = function(e) NULL))
      ajustes <- Filter(Negate(is.null), ajustes)
      return(ajustes[[which.min(vapply(ajustes, function(a) a$rss, 0))]])
    }
    nl_ajuste(d, modelo, porGrupo, ini, G)
  }
  completo <- ajusta(rep(G > 1, P))
  n <- completo$n; p <- completo$p; gl <- n - p; s2 <- completo$rss / gl; qt <- stats::qt(1 - (1 - nivel) / 2, gl)
  V <- s2 * chol2inv(qr.R(qr(completo$J))); b <- completo$par; ee <- sqrt(diag(V)); tv <- b / ee
  ll <- -n / 2 * (log(2 * pi) + 1 - log(n) - sum(log(d$w)) / n + log(completo$rss))
  # la fórmula es la de logLik.nls: con la suma de cuadrados del propio nls da su logLik
  rss_m <- sum(d$w * stats::residuals(completo$modelo)^2)
  stopifnot(abs(-n / 2 * (log(2 * pi) + 1 - log(n) - sum(log(d$w)) / n + log(rss_m)) - as.numeric(stats::logLik(completo$modelo))) < 1e-9 * max(1, abs(ll)))
  ic <- if (intervalo == "perfil" && modelo != "lineal-meseta") nl_perfil(d, completo, s2, qt, ee) else list(inf = unname(b - qt * ee), sup = unname(b + qt * ee))
  if (intervalo == "perfil") { cat("  perfil (raíz exacta) contra confint() de nls (perfil interpolado):\n"); print(cbind(inf = ic$inf, sup = ic$sup, tryCatch(suppressMessages(stats::confint(completo$modelo, level = nivel)), error = function(e) NA))) }
  sw <- sum(d$w); my <- sum(d$w * d$y) / sw
  out <- list(
    parametros = list(estimado = I(unname(b)), ee = I(ee), t = I(unname(tv)), p = I(unname(2 * stats::pt(-abs(tv), gl))),
                      ic_inf = I(ic$inf), ic_sup = I(ic$sup)),
    ajuste = list(n = n, gl = gl, rss = completo$rss, sigma = sqrt(s2), r2 = 1 - completo$rss / sum(d$w * (d$y - my)^2),
                  logLik = ll, AIC = -2 * ll + 2 * (p + 1), BIC = -2 * ll + log(n) * (p + 1)))
  R <- if (!is.null(precios)) precios[["insumo"]] / precios[["producto"]] else NULL
  der <- list()
  for (h in seq_len(G)) {
    idx <- if (G > 1) seq(h, by = G, length.out = P) else seq_len(P)
    ph <- stats::setNames(unname(b[idx]), M$par); Vh <- V[idx, idx, drop = FALSE]
    for (z in nl_derivados(modelo, ph, R)) {
      gr <- stats::setNames(numeric(P), M$par); gr[names(z$grad)] <- z$grad
      e <- sqrt(drop(t(gr) %*% Vh %*% gr))
      der[[length(der) + 1]] <- list(nombre = z$nombre, grupo = if (G > 1) levels(d$g)[h] else "", valor = z$valor, ee = e, ic = I(c(z$valor - qt * e, z$valor + qt * e)))
    }
  }
  out$derivados <- der
  if (G > 1) {
    ftest <- function(red) { g1 <- (n - red$p) - gl; Fv <- ((red$rss - completo$rss) / g1) / s2; list(F = Fv, gl1 = g1, gl2 = gl, p = stats::pf(Fv, g1, gl, lower.tail = FALSE)) }
    out$comparacion <- list(global = ftest(ajusta(rep(FALSE, P))),
      parametros = lapply(seq_len(P), function(k) { pg <- rep(TRUE, P); pg[k] <- FALSE; c(list(parametro = M$par[k]), ftest(ajusta(pg))) }))
  }
  out
}
#' Elección por AIC: cada modelo de la lista con los mismos datos; ΔAIC y pesos de Akaike.
ref_nolineal_aic <- function(datos, y, x, modelos, grupo = "", pesos = "") {
  aj <- lapply(modelos, function(m) ref_nolineal(datos, y, x, m, grupo, pesos = pesos)$ajuste)
  aic <- vapply(aj, function(a) a$AIC, 0); dl <- aic - min(aic); w <- exp(-dl / 2) / sum(exp(-dl / 2))
  list(elegido = modelos[which.min(aic)],
       seleccion = lapply(seq_along(modelos), function(k) list(modelo = modelos[k], parametros = aj[[k]]$n - aj[[k]]$gl, AIC = aic[k], BIC = aj[[k]]$BIC,
                                                               sigma = aj[[k]]$sigma, r2 = aj[[k]]$r2, delta = dl[k], peso = w[k])))
}
