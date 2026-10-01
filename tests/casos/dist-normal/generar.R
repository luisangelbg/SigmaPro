# Distribución normal y log Γ: rejillas con colas de hasta 1e-300, en ambas colas.
fuente <- "Rejilla sintética con colas extremas"

x <- c(1e-10, 1e-5, 0.01, 0.1, 0.3, 0.5, 0.9, 1, 1.5, 2, 2.5, 3, 4.5, 7.3, 10, 33.3, 50.5, 100,
       1e3, 1e5, 1e7, 1e10)
sp_caso("rejilla", objetivo = "dist.lgamma", titulo = "log Γ(x) en 22 puntos, de 1e-10 a 1e10",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(x)),
  esperado = sp_arg(lgamma(x)), codigo = "lgamma(x)")

q <- c(-37, -30, -20, -12, -8, -6, -5, -4, -3, -2.5, -1.96, -1.5, -1, -0.6744897501960817, -0.3,
       -1e-8, 0, 1e-8, 0.3, 0.5, 1, 1.645, 2, 2.5, 3, 4, 5, 6, 8, 12, 20, 30, 37)
sp_caso("cola-inferior", objetivo = "dist.pnorm", titulo = "P(Z ≤ q) en 33 puntos, de −37 a 37",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(q), 0, 1, TRUE),
  esperado = sp_arg(pnorm(q)), codigo = "pnorm(q)", comparacion = list(modo = "relativo"))
sp_caso("cola-superior", objetivo = "dist.pnorm", titulo = "P(Z > q) en 33 puntos, de −37 a 37",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(q), 0, 1, FALSE),
  esperado = sp_arg(pnorm(q, lower.tail = FALSE)), codigo = "pnorm(q, lower.tail = FALSE)",
  comparacion = list(modo = "relativo"))
q2 <- c(-20, 0, 4.2, 9.7, 10, 13.5, 25, 41)
sp_caso("media-y-de", objetivo = "dist.pnorm", titulo = "Normal con media 10 y desviación estándar 3",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(q2), 10, 3, TRUE),
  esperado = sp_arg(pnorm(q2, 10, 3)), codigo = "pnorm(q, 10, 3)", comparacion = list(modo = "relativo"))

p <- c(1e-300, 1e-100, 1e-20, 1e-10, 1e-5, 0.001, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.45, 0.5,
       0.55, 0.7, 0.9, 0.95, 0.975, 0.99, 0.999, 1 - 1e-8)
sp_caso("cuantil-inferior", objetivo = "dist.qnorm", titulo = "Cuantiles de la normal para 22 probabilidades (cola inferior)",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(p), 0, 1, TRUE),
  esperado = sp_arg(qnorm(p)), codigo = "qnorm(p)")
sp_caso("cuantil-superior", objetivo = "dist.qnorm", titulo = "Cuantiles de la normal para 22 probabilidades (cola superior)",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(p), 0, 1, FALSE),
  esperado = sp_arg(qnorm(p, lower.tail = FALSE)), codigo = "qnorm(p, lower.tail = FALSE)")

z <- c(-30, -5, -1, 0, 0.5, 2, 8)
sp_caso("densidad", objetivo = "dist.dnorm", titulo = "Densidad normal en 7 puntos",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(z), 0, 1),
  esperado = sp_arg(dnorm(z)), codigo = "dnorm(z)", comparacion = list(modo = "relativo"))
