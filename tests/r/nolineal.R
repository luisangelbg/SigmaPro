# SigmaPro — referencia de la regresión no lineal (stats::nls en el R de escritorio, con el gradiente analítico).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Cada modelo trae su valor y su gradiente analítico (atributo «gradient»): así nls converge con tol = 1e-10 al óptimo
# (tol = 1e-8: más abajo la suma de cuadrados ya no distingue mejoras de su redondeo; los parámetros quedan con ~9 cifras). Los parámetros pueden ser comunes o uno por grupo (vectores
# indexados por el grupo): con eso se comparan curvas (prueba F de la suma de cuadrados extra, como anova(m0, m1)).
# Lineal-meseta (no derivable en x0): el óptimo se busca por perfil (en cada intervalo entre dosis observadas, x0 por
# optimize con a y b por mínimos cuadrados) y nls arranca ahí para dar el gradiente y los EE.
# Intervalos de Wald con t (gl = n − p); derivados (DE50, dosis óptima, meseta, punto de inflexión) por el método delta.
NL_CTRL <- stats::nls.control(maxiter = 1000, tol = 1e-8, minFactor = 1e-10, warnOnly = TRUE)

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
    v <- ifelse(fin, p[2] + (p[3] - p[2]) / (1 + E), p[2])
    lg <- ifelse(x > 0, log(x / p[4]), 0)
    g <- cbind(ifelse(fin, -(p[3] - p[2]) * E * lg / (1 + E)^2, 0), ifelse(fin, E / (1 + E), 1), ifelse(fin, 1 / (1 + E), 0),
               ifelse(fin, (p[3] - p[2]) * E * (p[1] / p[4]) / (1 + E)^2, 0))
    attr(v, "gradient") <- g; v }),
  ll3 = list(par = c("b", "d", "e"), f = function(x, p) {
    E <- ifelse(x > 0, (x / p[3])^p[1], if (p[1] > 0) 0 else Inf); fin <- is.finite(E)
    v <- ifelse(fin, p[2] / (1 + E), 0)
    lg <- ifelse(x > 0, log(x / p[3]), 0)
    attr(v, "gradient") <- cbind(ifelse(fin, -p[2] * E * lg / (1 + E)^2, 0), ifelse(fin, 1 / (1 + E), 0), ifelse(fin, p[2] * E * (p[1] / p[3]) / (1 + E)^2, 0)); v }),
  mitscherlich = list(par = c("a", "b", "c"), f = function(x, p) {
    E <- exp(-p[3] * x); v <- p[1] - p[2] * E
    attr(v, "gradient") <- cbind(1, -E, p[2] * x * E); v }),
  "cuadratico-meseta" = list(par = c("a", "b", "c"), f = function(x, p) {
    x0 <- -p[2] / (2 * p[3]); bajo <- x < x0
    v <- ifelse(bajo, p[1] + p[2] * x + p[3] * x^2, p[1] - p[2]^2 / (4 * p[3]))
    attr(v, "gradient") <- cbind(1, ifelse(bajo, x, -p[2] / (2 * p[3])), ifelse(bajo, x^2, p[2]^2 / (4 * p[3]^2))); v }),
  "lineal-meseta" = list(par = c("a", "b", "x0"), f = function(x, p) {
    bajo <- x < p[3]; v <- p[1] + p[2] * pmin(x, p[3])
    attr(v, "gradient") <- cbind(1, pmin(x, p[3]), ifelse(bajo, 0, p[2])); v })
)

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
nl_perfil_meseta <- function(x, y) {
  ux <- sort(unique(x)); mejor <- NULL
  rss <- function(x0) { z <- pmin(x, x0); sum(stats::lm.fit(cbind(1, z), y)$residuals^2) }
  for (k in 2:(length(ux) - 1)) {
    o <- stats::optimize(rss, c(ux[k - 1], ux[k + 1]), tol = 1e-14)
    if (is.null(mejor) || o$objective < mejor$objective) mejor <- o
  }
  x0 <- mejor$minimum; z <- pmin(x, x0); ab <- stats::lm.fit(cbind(1, z), y)$coefficients
  c(ab[[1]], ab[[2]], x0)
}
#' Valores iniciales (los de los selfStart de R donde los hay; si no, linealizaciones).
nl_inicio <- function(modelo, x, y) {
  d <- data.frame(x = x, y = y)
  switch(modelo,
    logistico = unname(stats::coef(stats::nls(y ~ SSlogis(x, Asym, xmid, scal), data = d))),
    gompertz = unname(stats::coef(stats::nls(y ~ SSgompertz(x, Asym, b2, b3), data = d))),
    weibull = unname(stats::coef(stats::nls(y ~ SSweibull(x, Asym, Drop, lrc, pwr), data = d))),
    mitscherlich = { cs <- stats::coef(stats::nls(y ~ SSasymp(x, Asym, R0, lrc), data = d)); c(cs[["Asym"]], cs[["Asym"]] - cs[["R0"]], exp(cs[["lrc"]])) },
    ll4 = { cc <- min(y) - 0.05 * diff(range(y)); dd <- max(y) + 0.05 * diff(range(y)); i <- x > 0
            cf <- stats::coef(stats::lm(log((dd - y[i]) / (y[i] - cc)) ~ log(x[i]))); c(cf[[2]], cc, dd, exp(-cf[[1]] / cf[[2]])) },
    ll3 = { dd <- max(y) * 1.05; i <- x > 0 & y > 0; cf <- stats::coef(stats::lm(log((dd - y[i]) / y[i]) ~ log(x[i]))); c(cf[[2]], dd, exp(-cf[[1]] / cf[[2]])) },
    "cuadratico-meseta" = unname(stats::coef(stats::lm(y ~ x + I(x^2)))),
    "lineal-meseta" = nl_perfil_meseta(x, y))
}

#' Derivados con su gradiente: list(nombre, valor, gradiente).
nl_derivados <- function(modelo, p) {
  ed <- function(q) { k <- q / (100 - q); list(nombre = paste0("DE", q), valor = p[["e"]] * k^(1 / p[["b"]]), grad = c(b = -p[["e"]] * k^(1 / p[["b"]]) * log(k) / p[["b"]]^2, e = k^(1 / p[["b"]]))) }
  switch(modelo,
    gompertz = list(list(nombre = "inflexion", valor = -log(p[["b2"]]) / log(p[["b3"]]), grad = c(b2 = -1 / (p[["b2"]] * log(p[["b3"]])), b3 = log(p[["b2"]]) / (p[["b3"]] * log(p[["b3"]])^2)))),
    ll4 = list(ed(10), ed(50), ed(90)), ll3 = list(ed(10), ed(50), ed(90)),
    "cuadratico-meseta" = list(list(nombre = "dosis_optima", valor = -p[["b"]] / (2 * p[["c"]]), grad = c(b = -1 / (2 * p[["c"]]), c = p[["b"]] / (2 * p[["c"]]^2))),
                               list(nombre = "meseta", valor = p[["a"]] - p[["b"]]^2 / (4 * p[["c"]]), grad = c(a = 1, b = -p[["b"]] / (2 * p[["c"]]), c = p[["b"]]^2 / (4 * p[["c"]]^2)))),
    "lineal-meseta" = list(list(nombre = "meseta", valor = p[["a"]] + p[["b"]] * p[["x0"]], grad = c(a = 1, b = p[["x0"]], x0 = p[["b"]]))),
    list())
}

#' Ajuste: nls (con el gradiente analítico) y luego Gauss-Newton puro hasta que el paso relativo baja de 1e-13 (nls se
#' detiene cuando la suma de cuadrados ya no distingue mejoras de su redondeo). Devuelve los parámetros en el orden de nls
#' (por parámetro y, dentro, por grupo), el gradiente J y la suma de cuadrados.
nl_ajuste <- function(d, modelo, porGrupo, inicio, G) {
  M <- nl_modelos[[modelo]]; fn <- nl_funcion(modelo, porGrupo, G)
  f <- stats::as.formula(paste0("y ~ fn(x, g, ", paste(M$par, collapse = ", "), ")"))
  st <- stats::setNames(lapply(seq_along(M$par), function(k) if (porGrupo[k]) rep_len(inicio[[k]], G) else inicio[[k]][1]), M$par)
  m <- suppressWarnings(stats::nls(f, data = d, start = st, control = NL_CTRL))
  th <- stats::coef(m); largos <- vapply(st, length, 1L)
  evalua <- function(th) { ps <- split(unname(th), rep(seq_along(largos), largos)); do.call(fn, c(list(d$x, d$g), ps)) }
  for (k in 1:200) {
    v <- evalua(th); J <- attr(v, "gradient"); paso <- qr.solve(J, d$y - as.numeric(v))
    th <- th + paso
    if (max(abs(paso) / pmax(abs(th), 1e-10)) < 1e-13) break
  }
  v <- evalua(th)
  list(par = th, J = attr(v, "gradient"), rss = sum((d$y - as.numeric(v))^2), n = nrow(d), p = length(th))
}

#' Ajuste de referencia de un modelo: con «grupo», el modelo completo (cada parámetro por grupo), la curva común y la
#' prueba de cada parámetro común (salvo en lineal-meseta). EE, log-verosimilitud y pruebas F con las fórmulas de
#' summary.nls, logLik.nls y anova.nls.
ref_nolineal <- function(datos, y, x, modelo, grupo = "", nivel = 0.95) {
  vars <- c(y, x, if (nzchar(grupo)) grupo)
  d0 <- datos[stats::complete.cases(datos[vars]), vars, drop = FALSE]
  d <- data.frame(y = d0[[y]], x = d0[[x]], g = if (nzchar(grupo)) factor(d0[[grupo]]) else factor(rep(1, nrow(d0))))
  G <- nlevels(d$g); M <- nl_modelos[[modelo]]; P <- length(M$par)
  solo <- function(h) { dd <- d[d$g == h, ]; dd$g <- factor(rep(1, nrow(dd))); dd }
  ajusta <- function(porGrupo) {
    if (modelo == "lineal-meseta") {
      ini <- if (any(porGrupo)) { pg <- t(vapply(levels(d$g), function(h) nl_perfil_meseta(d$x[d$g == h], d$y[d$g == h]), numeric(3))); lapply(1:3, function(k) pg[, k]) }
             else as.list(nl_inicio(modelo, d$x, d$y))
    } else if (any(porGrupo)) {   # por grupo: arranca de cada curva sola
      pg <- t(vapply(levels(d$g), function(h) { dd <- solo(h); nl_ajuste(dd, modelo, rep(FALSE, P), as.list(nl_inicio(modelo, dd$x, dd$y)), 1)$par }, numeric(P)))
      ini <- lapply(seq_len(P), function(k) if (porGrupo[k]) pg[, k] else mean(pg[, k]))
    } else ini <- as.list(nl_inicio(modelo, d$x, d$y))
    nl_ajuste(d, modelo, porGrupo, ini, G)
  }
  completo <- ajusta(rep(G > 1, P))
  n <- completo$n; p <- completo$p; gl <- n - p; s2 <- completo$rss / gl; qt <- stats::qt(1 - (1 - nivel) / 2, gl)
  V <- s2 * chol2inv(qr.R(qr(completo$J))); b <- completo$par; ee <- sqrt(diag(V)); tv <- b / ee
  ll <- -n / 2 * (log(2 * pi) + 1 - log(n) + log(completo$rss))
  out <- list(
    parametros = list(estimado = I(unname(b)), ee = I(ee), t = I(unname(tv)), p = I(unname(2 * stats::pt(-abs(tv), gl))),
                      ic_inf = I(unname(b - qt * ee)), ic_sup = I(unname(b + qt * ee))),
    ajuste = list(n = n, gl = gl, rss = completo$rss, sigma = sqrt(s2), r2 = 1 - completo$rss / sum((d$y - mean(d$y))^2),
                  logLik = ll, AIC = -2 * ll + 2 * (p + 1), BIC = -2 * ll + log(n) * (p + 1)))
  der <- list()
  for (h in seq_len(G)) {
    idx <- if (G > 1) seq(h, by = G, length.out = P) else seq_len(P)
    ph <- stats::setNames(unname(b[idx]), M$par); Vh <- V[idx, idx, drop = FALSE]
    for (z in nl_derivados(modelo, ph)) {
      gr <- stats::setNames(numeric(P), M$par); gr[names(z$grad)] <- z$grad
      e <- sqrt(drop(t(gr) %*% Vh %*% gr))
      der[[length(der) + 1]] <- list(nombre = z$nombre, grupo = if (G > 1) levels(d$g)[h] else "", valor = z$valor, ee = e, ic = I(c(z$valor - qt * e, z$valor + qt * e)))
    }
  }
  out$derivados <- der
  if (G > 1) {
    ftest <- function(red) { g1 <- (n - red$p) - gl; Fv <- ((red$rss - completo$rss) / g1) / s2; list(F = Fv, gl1 = g1, gl2 = gl, p = stats::pf(Fv, g1, gl, lower.tail = FALSE)) }
    out$comparacion <- list(global = ftest(ajusta(rep(FALSE, P))),
      parametros = if (modelo == "lineal-meseta") list() else lapply(seq_len(P), function(k) { pg <- rep(TRUE, P); pg[k] <- FALSE; c(list(parametro = M$par[k]), ftest(ajusta(pg))) }))
  }
  out
}
