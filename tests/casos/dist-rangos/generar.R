# Distribuciones exactas de Wilcoxon (rango con signo y suma de rangos) y t no central.
# Rejillas que cubren los tamaños con que wilcox.test usa la distribución exacta (n < 50)
# y todas las ramas de pnt.c (serie de Guenther, aproximación normal y colas extremas).
fuente <- "Rejilla sintética"

rejilla <- function(nombre, objetivo, titulo, args_js, valores, codigo, modo = NULL) {
  ok <- is.finite(valores) & (valores == 0 | abs(valores) >= 1e-290)
  args <- lapply(args_js, function(a) if (length(a) > 1) sp_arg(a[ok]) else a)
  sp_caso(nombre, objetivo = objetivo, titulo = sprintf(titulo, sum(ok)), fuente = fuente,
    vectorizar = TRUE, argumentos = args, esperado = sp_arg(valores[ok]), codigo = codigo,
    comparacion = if (!is.null(modo)) list(modo = modo))
}

# ---- rango con signo: x en fracciones del máximo n(n + 1)/2, más los bordes
tam <- c(1, 2, 3, 5, 8, 10, 13, 20, 30, 49, 50, 70)
g <- do.call(rbind, lapply(tam, function(n) {
  M <- n * (n + 1) / 2
  data.frame(x = unique(c(-1, 0, 1, round(c(0.05, 0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 0.95) * M), M - 1, M, M + 3)), n = n)
}))
rejilla("signrank-inferior", "dist.psignrank", "P(V ≤ x) del rango con signo en %d combinaciones de x y n",
  list(g$x, g$n, TRUE), psignrank(g$x, g$n), "psignrank(x, n)", modo = "relativo")
rejilla("signrank-superior", "dist.psignrank", "P(V > x) del rango con signo en %d combinaciones de x y n",
  list(g$x, g$n, FALSE), psignrank(g$x, g$n, lower.tail = FALSE), "psignrank(x, n, lower.tail = FALSE)", modo = "relativo")
g <- sp_rejilla(p = c(0, 1e-12, 1e-6, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.975, 0.99, 0.999, 1),
                n = c(1, 2, 4, 6, 9, 15, 25, 40, 49))
rejilla("signrank-cuantil-inferior", "dist.qsignrank", "Cuantiles del rango con signo en %d combinaciones (cola inferior)",
  list(g$p, g$n, TRUE), qsignrank(g$p, g$n), "qsignrank(p, n)")
rejilla("signrank-cuantil-superior", "dist.qsignrank", "Cuantiles del rango con signo en %d combinaciones (cola superior)",
  list(g$p, g$n, FALSE), qsignrank(g$p, g$n, lower.tail = FALSE), "qsignrank(p, n, lower.tail = FALSE)")
# las probabilidades acumuladas exactas en los propios cuantiles: el punto donde el margen de 10ε decide
g <- do.call(rbind, lapply(c(5, 10, 20), function(n) data.frame(p = psignrank(0:(n * (n + 1) / 2), n), n = n)))
rejilla("signrank-cuantil-en-saltos", "dist.qsignrank", "Cuantiles del rango con signo justo en los saltos (%d puntos)",
  list(g$p, g$n, TRUE), qsignrank(g$p, g$n), "qsignrank(psignrank(0:M, n), n)")

# ---- suma de rangos (U de Mann-Whitney)
pares <- data.frame(m = c(1, 1, 2, 3, 3, 4, 5, 6, 8, 10, 12, 15, 20, 7, 30, 49, 49, 25),
                    n = c(1, 6, 2, 3, 9, 4, 5, 11, 8, 10, 7, 15, 20, 40, 18, 2, 49, 49))
g <- do.call(rbind, lapply(seq_len(nrow(pares)), function(i) {
  m <- pares$m[i]; n <- pares$n[i]; M <- m * n
  data.frame(q = unique(c(-1, 0, round(c(0.02, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.98) * M), M - 1, M)), m = m, n = n)
}))
rejilla("wilcox-inferior", "dist.pwilcox", "P(W ≤ q) de la suma de rangos en %d combinaciones de q, m y n",
  list(g$q, g$m, g$n, TRUE), pwilcox(g$q, g$m, g$n), "pwilcox(q, m, n)", modo = "relativo")
rejilla("wilcox-superior", "dist.pwilcox", "P(W > q) de la suma de rangos en %d combinaciones de q, m y n",
  list(g$q, g$m, g$n, FALSE), pwilcox(g$q, g$m, g$n, lower.tail = FALSE), "pwilcox(q, m, n, lower.tail = FALSE)", modo = "relativo")
g <- merge(data.frame(p = c(0, 1e-9, 0.001, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.975, 0.99, 1)), pares, by = NULL)
# con m·n impar, P(W ≤ (mn − 1)/2) = 1/2 exactamente (simetría): esos puntos van aparte, en clase B
g <- g[!(g$p == 0.5 & (g$m * g$n) %% 2 == 1), ]
rejilla("wilcox-cuantil-inferior", "dist.qwilcox", "Cuantiles de la suma de rangos en %d combinaciones (cola inferior)",
  list(g$p, g$m, g$n, TRUE), qwilcox(g$p, g$m, g$n), "qwilcox(p, m, n)")
rejilla("wilcox-cuantil-superior", "dist.qwilcox", "Cuantiles de la suma de rangos en %d combinaciones (cola superior)",
  list(g$p, g$m, g$n, FALSE), qwilcox(g$p, g$m, g$n, lower.tail = FALSE), "qwilcox(p, m, n, lower.tail = FALSE)")
# Clase B. Con m·n impar la distribución es simétrica alrededor de mn/2 y P(W ≤ (mn − 1)/2) = 1/2 exactamente,
# así que el cuantil 0.5 es (mn − 1)/2. Con m = n = 49, choose(98, 49) de R (exp de lbeta) trae un error relativo
# de 4e-15, la suma acumulada queda 2.3e-15 por debajo de 1/2 —más allá del margen de 10ε— y qwilcox da 1201.
imp <- pares[(pares$m * pares$n) %% 2 == 1, ]
sp_caso("wilcox-cuantil-mediana-simetrica", objetivo = "dist.qwilcox", clase = "B", fuente = fuente,
  titulo = sprintf("Cuantil 0.5 con m·n impar (%d pares): exacto por simetría, (mn − 1)/2", nrow(imp)),
  vectorizar = TRUE, argumentos = list(sp_arg(rep(0.5, nrow(imp))), sp_arg(imp$m), sp_arg(imp$n), TRUE),
  esperado = sp_arg((imp$m * imp$n - 1) / 2),
  codigo = sprintf("(m * n - 1) / 2; R: qwilcox(0.5, m, n) = %s", paste(qwilcox(0.5, imp$m, imp$n), collapse = ", ")))
g <- do.call(rbind, lapply(list(c(4, 6), c(9, 7)), function(mn) data.frame(p = pwilcox(0:prod(mn), mn[1], mn[2]), m = mn[1], n = mn[2])))
rejilla("wilcox-cuantil-en-saltos", "dist.qwilcox", "Cuantiles de la suma de rangos justo en los saltos (%d puntos)",
  list(g$p, g$m, g$n, TRUE), qwilcox(g$p, g$m, g$n), "qwilcox(pwilcox(0:mn, m, n), m, n)")

# ---- t no central (AS 243 de Lenth, pnt.c). R acumula la serie en doble extendido y la app en doble:
# las diferencias quedan muy por debajo de 1e-6 (la cola superior se obtiene como 1 − P en ambos).
g <- sp_rejilla(t = c(-12, -4, -1.5, -0.2, 0, 0.3, 1, 2, 3.5, 6, 12, 45),
                gl = c(1, 2, 3.5, 6, 15, 40, 200, 5e3, 5e5),
                ncp = c(-6, -1.5, -0.3, 0.4, 1, 2.5, 5, 9, 20, 39, 41))
rejilla("tnc-inferior", "dist.ptnc", "P(T ≤ t) de la t no central en %d combinaciones de t, gl y ncp",
  list(g$t, g$gl, g$ncp, TRUE), suppressWarnings(pt(g$t, g$gl, g$ncp)), "pt(t, gl, ncp)")
rejilla("tnc-superior", "dist.ptnc", "P(T > t) de la t no central en %d combinaciones de t, gl y ncp",
  list(g$t, g$gl, g$ncp, FALSE), suppressWarnings(pt(g$t, g$gl, g$ncp, lower.tail = FALSE)), "pt(t, gl, ncp, lower.tail = FALSE)")
# Error relativo en las probabilidades de al menos 1e-6. Más abajo, la serie de R pierde cifras relativas:
# xodd baja por restas desde pbeta(x, ½, gl/2) y queda en un residuo de ±1e-12 (por el redondeo de
# lgamma(gl/2) en albeta), cuyo signo decide cuándo para la serie. Ahí se compara en absoluto, como toda probabilidad.
for (cola in c(TRUE, FALSE)) {
  v <- suppressWarnings(pt(g$t, g$gl, g$ncp, lower.tail = cola))
  ok <- v >= 1e-6
  rejilla(if (cola) "tnc-inferior-relativa" else "tnc-superior-relativa", "dist.ptnc",
    paste(if (cola) "P(T ≤ t)" else "P(T > t)", "de al menos 1e-6, con error relativo, en %d combinaciones"),
    list(g$t[ok], g$gl[ok], g$ncp[ok], cola), v[ok], sprintf("pt(t, gl, ncp, lower.tail = %s)", cola), modo = "relativo")
}
