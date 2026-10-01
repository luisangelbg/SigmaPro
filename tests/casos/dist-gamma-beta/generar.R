# Gamma y beta incompletas (base de t, F y ji cuadrada) y distribuciones discretas.
fuente <- "Rejilla sintética con colas extremas"
util <- function(v) is.finite(v) & v >= 1e-290
caso <- function(nombre, objetivo, titulo, args_js, valores, codigo, relativo = TRUE, filtrar = relativo) {
  ok <- if (filtrar) util(valores) else is.finite(valores)
  args <- lapply(args_js, function(a) if (length(a) > 1) sp_arg(a[ok]) else a)
  sp_caso(nombre, objetivo = objetivo, titulo = sprintf(titulo, sum(ok)), fuente = fuente,
    vectorizar = TRUE, argumentos = args, esperado = sp_arg(valores[ok]), codigo = codigo,
    comparacion = if (relativo) list(modo = "relativo"))
}

# ---- gamma (forma, escala)
g <- sp_rejilla(q = c(1e-3, 0.1, 0.5, 1, 2, 5, 10, 50, 1e3, 2e4),
                forma = c(0.01, 0.5, 1, 2.5, 10, 100, 1e4))
caso("gamma-inferior", "dist.pgamma", "P(X ≤ q) gamma en %d combinaciones de q y forma",
  list(g$q, g$forma, 1, TRUE), pgamma(g$q, g$forma), "pgamma(q, forma)")
caso("gamma-superior", "dist.pgamma", "P(X > q) gamma en %d combinaciones de q y forma",
  list(g$q, g$forma, 1, FALSE), pgamma(g$q, g$forma, lower.tail = FALSE), "pgamma(q, forma, lower.tail = FALSE)")
g <- sp_rejilla(q = c(0.2, 1, 3, 9, 30), forma = c(0.7, 3, 40))
caso("gamma-escala", "dist.pgamma", "Gamma con escala 2.5 en %d puntos",
  list(g$q, g$forma, 2.5, TRUE), pgamma(g$q, g$forma, scale = 2.5), "pgamma(q, forma, scale = 2.5)")
g <- sp_rejilla(p = c(1e-40, 1e-6, 0.01, 0.2, 0.5, 0.8, 0.99), forma = c(0.05, 0.5, 2, 30, 5000))
caso("gamma-cuantil", "dist.qgamma", "Cuantiles de la gamma en %d combinaciones",
  list(g$p, g$forma, 1, TRUE), qgamma(g$p, g$forma), "qgamma(p, forma)", relativo = FALSE)

# ---- beta
pares <- data.frame(a = c(0.1, 0.5, 1, 2, 0.5, 30, 10, 100, 2000, 1e4, 1e5, 0.2),
                    b = c(0.1, 0.5, 1, 3, 30, 0.5, 10, 250, 3000, 1e4, 0.5, 7))
g <- merge(data.frame(x = c(1e-6, 0.001, 0.05, 0.2, 0.4, 0.5, 0.6, 0.8, 0.95, 0.999, 1 - 1e-6)), pares, by = NULL)
caso("beta-inferior", "dist.pbeta", "I_x(a, b) en %d combinaciones de x, a y b",
  list(g$x, g$a, g$b, TRUE), pbeta(g$x, g$a, g$b), "pbeta(x, a, b)")
caso("beta-superior", "dist.pbeta", "1 − I_x(a, b) en %d combinaciones de x, a y b",
  list(g$x, g$a, g$b, FALSE), pbeta(g$x, g$a, g$b, lower.tail = FALSE), "pbeta(x, a, b, lower.tail = FALSE)")
g <- merge(data.frame(p = c(1e-30, 1e-5, 0.01, 0.3, 0.5, 0.7, 0.99, 1 - 1e-9)), pares[1:10, ], by = NULL)
caso("beta-cuantil", "dist.qbeta", "Cuantiles de la beta en %d combinaciones",
  list(g$p, g$a, g$b, TRUE), qbeta(g$p, g$a, g$b), "qbeta(p, a, b)", relativo = FALSE)

# ---- binomial y Poisson
g <- do.call(rbind, lapply(c(1, 10, 50, 500), function(n) {
  k <- unique(round(c(0, 1, n * 0.05, n * 0.3, n / 2, n * 0.7, n - 1, n)))
  sp_rejilla(k = k[k >= 0 & k <= n], n = n, p = c(0.01, 0.3, 0.5, 0.9))
}))
caso("binomial-masa", "dist.dbinom", "P(X = k) binomial en %d combinaciones de k, n y p",
  list(g$k, g$n, g$p), dbinom(g$k, g$n, g$p), "dbinom(k, n, p)")
caso("binomial-inferior", "dist.pbinom", "P(X ≤ k) binomial en %d combinaciones",
  list(g$k, g$n, g$p, TRUE), pbinom(g$k, g$n, g$p), "pbinom(k, n, p)")
caso("binomial-superior", "dist.pbinom", "P(X > k) binomial en %d combinaciones",
  list(g$k, g$n, g$p, FALSE), pbinom(g$k, g$n, g$p, lower.tail = FALSE), "pbinom(k, n, p, lower.tail = FALSE)")
g <- sp_rejilla(k = c(0, 1, 2, 5, 12, 30, 80, 450, 550), lambda = c(0.1, 1, 4.5, 30, 500))
caso("poisson-masa", "dist.dpois", "P(X = k) Poisson en %d combinaciones", list(g$k, g$lambda),
  dpois(g$k, g$lambda), "dpois(k, lambda)")
caso("poisson-inferior", "dist.ppois", "P(X ≤ k) Poisson en %d combinaciones", list(g$k, g$lambda, TRUE),
  ppois(g$k, g$lambda), "ppois(k, lambda)")
caso("poisson-superior", "dist.ppois", "P(X > k) Poisson en %d combinaciones", list(g$k, g$lambda, FALSE),
  ppois(g$k, g$lambda, lower.tail = FALSE), "ppois(k, lambda, lower.tail = FALSE)")
