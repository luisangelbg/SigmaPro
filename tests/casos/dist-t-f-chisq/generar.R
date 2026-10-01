# Distribuciones t, F y ji cuadrada: rejillas con grados de libertad de 0.3 a 1e7 e infinito,
# en ambas colas. Se descartan los puntos cuyo valor exacto cae por debajo de 1e-290
# (números subnormales, sin precisión relativa en ninguna implementación).
fuente <- "Rejilla sintética con colas extremas"
util <- function(v) is.finite(v) & v >= 1e-290

caso_cdf <- function(nombre, objetivo, titulo, g, args_js, valores, codigo) {
  ok <- util(valores)
  args <- lapply(args_js, function(a) if (length(a) > 1) sp_arg(a[ok]) else a)
  sp_caso(nombre, objetivo = objetivo, titulo = sprintf(titulo, sum(ok)), fuente = fuente,
    vectorizar = TRUE, argumentos = args, esperado = sp_arg(valores[ok]), codigo = codigo,
    comparacion = list(modo = "relativo"))
}
caso_q <- function(nombre, objetivo, titulo, args_js, valores, codigo) {
  ok <- is.finite(valores)
  args <- lapply(args_js, function(a) if (length(a) > 1) sp_arg(a[ok]) else a)
  sp_caso(nombre, objetivo = objetivo, titulo = sprintf(titulo, sum(ok)), fuente = fuente,
    vectorizar = TRUE, argumentos = args, esperado = sp_arg(valores[ok]), codigo = codigo)
}

# ---- t de Student
g <- sp_rejilla(q = c(-200, -40, -10, -5, -3, -2, -1, -0.5, -0.01, 0, 0.01, 0.5, 1, 1.5, 2, 2.5, 3, 5, 10, 40, 200),
                gl = c(0.5, 1, 2, 3, 4.5, 7, 12, 33, 100, 1000, 1e5, 3e5, 1e7, Inf))
caso_cdf("t-inferior", "dist.pt", "P(T ≤ q) en %d combinaciones de q y gl", g, list(g$q, g$gl, TRUE),
  pt(g$q, g$gl), "pt(q, gl)")
caso_cdf("t-superior", "dist.pt", "P(T > q) en %d combinaciones de q y gl", g, list(g$q, g$gl, FALSE),
  pt(g$q, g$gl, lower.tail = FALSE), "pt(q, gl, lower.tail = FALSE)")
g <- sp_rejilla(p = c(1e-100, 1e-20, 1e-8, 1e-4, 0.001, 0.01, 0.025, 0.05, 0.1, 0.25, 0.4, 0.6, 0.9, 0.975, 0.995, 0.9999),
                gl = c(0.5, 1, 2, 5, 10, 33, 120, 1e4, Inf))
caso_q("t-cuantil-inferior", "dist.qt", "Cuantiles de t en %d combinaciones (cola inferior)", list(g$p, g$gl, TRUE),
  qt(g$p, g$gl), "qt(p, gl)")
caso_q("t-cuantil-superior", "dist.qt", "Cuantiles de t en %d combinaciones (cola superior)", list(g$p, g$gl, FALSE),
  qt(g$p, g$gl, lower.tail = FALSE), "qt(p, gl, lower.tail = FALSE)")

# qt de R con menos de un grado de libertad y colas diminutas no alcanza la precisión de su
# propio pt (p. ej. pt(qt(1e-8, 0.5, lower.tail = FALSE), 0.5, lower.tail = FALSE) = 9.99999986e-9).
# Clase B: la referencia es la inversión exacta de pt, en escala logarítmica.
# (con 0.3 gl y p = 1e-60 el cuantil pasaría de 1e300: se omite)
g <- rbind(sp_rejilla(p = c(1e-60, 1e-20, 1e-8, 1e-4), gl = c(0.5, 0.8)),
           sp_rejilla(p = c(1e-20, 1e-8, 1e-4), gl = 0.3))
exacto <- mapply(function(p, gl) exp(uniroot(function(u) log(pt(exp(u), gl, lower.tail = FALSE)) - log(p),
                                             c(-5, 700), tol = 1e-15)$root), g$p, g$gl)
sp_caso("t-cuantil-inversion-exacta", objetivo = "dist.qt", clase = "B",
  titulo = "Cuantiles de t con menos de 1 grado de libertad y colas diminutas (inversión exacta de pt)",
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(g$p), sp_arg(g$gl), FALSE),
  esperado = sp_arg(exacto),
  codigo = "exp(uniroot(function(u) log(pt(exp(u), gl, lower.tail = FALSE)) - log(p), c(-5, 700), tol = 1e-15)$root)")

# ---- F
pares <- data.frame(g1 = c(1, 1, 2, 3, 6, 4, 11, 5, 10, 40, 100, 3, 0.5, 2),
                    g2 = c(1, 5, 10, 33, 33, 9, 36, 100, 1000, 40, 1e4, 1e5, 3, 2.5))
qf_ <- c(0.001, 0.05, 0.2, 0.5, 0.9, 1, 1.5, 2.5, 4, 7, 15, 50, 300, 5000)
g <- merge(data.frame(q = qf_), pares, by = NULL)
caso_cdf("f-inferior", "dist.pf", "P(F ≤ q) en %d combinaciones de q, gl1 y gl2", g, list(g$q, g$g1, g$g2, TRUE),
  pf(g$q, g$g1, g$g2), "pf(q, gl1, gl2)")
caso_cdf("f-superior", "dist.pf", "P(F > q) en %d combinaciones de q, gl1 y gl2", g, list(g$q, g$g1, g$g2, FALSE),
  pf(g$q, g$g1, g$g2, lower.tail = FALSE), "pf(q, gl1, gl2, lower.tail = FALSE)")
g <- merge(data.frame(p = c(1e-30, 1e-6, 0.001, 0.01, 0.05, 0.1, 0.5, 0.9, 0.95, 0.99)), pares[1:12, ], by = NULL)
caso_q("f-cuantil-inferior", "dist.qf", "Cuantiles de F en %d combinaciones (cola inferior)", list(g$p, g$g1, g$g2, TRUE),
  qf(g$p, g$g1, g$g2), "qf(p, gl1, gl2)")
caso_q("f-cuantil-superior", "dist.qf", "Cuantiles de F en %d combinaciones (cola superior)", list(g$p, g$g1, g$g2, FALSE),
  qf(g$p, g$g1, g$g2, lower.tail = FALSE), "qf(p, gl1, gl2, lower.tail = FALSE)")

# ---- ji cuadrada
g <- sp_rejilla(q = c(1e-5, 0.01, 0.3, 1, 2, 3.84, 7, 15, 30, 80, 200, 1000, 5e4),
                gl = c(0.3, 1, 2, 3, 7, 25, 100, 1000, 5e4))
caso_cdf("ji2-inferior", "dist.pchisq", "P(X² ≤ q) en %d combinaciones de q y gl", g, list(g$q, g$gl, TRUE),
  pchisq(g$q, g$gl), "pchisq(q, gl)")
caso_cdf("ji2-superior", "dist.pchisq", "P(X² > q) en %d combinaciones de q y gl", g, list(g$q, g$gl, FALSE),
  pchisq(g$q, g$gl, lower.tail = FALSE), "pchisq(q, gl, lower.tail = FALSE)")
g <- sp_rejilla(p = c(1e-50, 1e-8, 0.001, 0.025, 0.1, 0.5, 0.9, 0.975, 0.999),
                gl = c(0.3, 1, 2, 5, 17, 100, 1e4))
caso_q("ji2-cuantil-inferior", "dist.qchisq", "Cuantiles de ji cuadrada en %d combinaciones (cola inferior)",
  list(g$p, g$gl, TRUE), qchisq(g$p, g$gl), "qchisq(p, gl)")
caso_q("ji2-cuantil-superior", "dist.qchisq", "Cuantiles de ji cuadrada en %d combinaciones (cola superior)",
  list(g$p, g$gl, FALSE), qchisq(g$p, g$gl, lower.tail = FALSE), "qchisq(p, gl, lower.tail = FALSE)")

# ---- densidades
g <- sp_rejilla(x = c(-4, -1, 0, 0.7, 2.5, 6), gl = c(1, 3, 30, 1e4))
sp_caso("t-densidad", objetivo = "dist.dt", titulo = "Densidad de t en 24 puntos", fuente = fuente,
  vectorizar = TRUE, argumentos = list(sp_arg(g$x), sp_arg(g$gl)), esperado = sp_arg(dt(g$x, g$gl)),
  codigo = "dt(x, gl)", comparacion = list(modo = "relativo"))
g <- merge(data.frame(x = c(0.05, 0.5, 1, 2.2, 6)), pares[2:8, ], by = NULL)
sp_caso("f-densidad", objetivo = "dist.df", titulo = "Densidad de F en 35 puntos", fuente = fuente,
  vectorizar = TRUE, argumentos = list(sp_arg(g$x), sp_arg(g$g1), sp_arg(g$g2)),
  esperado = sp_arg(df(g$x, g$g1, g$g2)), codigo = "df(x, gl1, gl2)", comparacion = list(modo = "relativo"))
