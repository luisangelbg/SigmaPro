# Rango estudentizado (base de la prueba de Tukey).
# ptukey: clase A frente a ptukey de R (mismo algoritmo publicado).
# qtukey: clase B. qtukey de R se detiene con tolerancia 1e-4 (se desvía hasta ~3e-7 de su
# propio ptukey), así que la referencia es la inversión exacta de ptukey con uniroot a 1e-14.
# Un caso aparte compara además contra qtukey de R tal cual.
fuente <- "Rejilla sintética"

g <- sp_rejilla(q = c(0.5, 1, 2, 3, 3.5, 4, 5, 6, 8), k = c(2, 3, 4, 6, 10, 20),
                gl = c(2, 3, 5, 10, 33, 100, 500, 3000, 1e4, 1e5, Inf))
sp_caso("rejilla", objetivo = "dist.ptukey", titulo = sprintf("P(Q ≤ q) del rango estudentizado en %d combinaciones de q, k y gl", nrow(g)),
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(g$q), sp_arg(g$k), sp_arg(g$gl), TRUE),
  esperado = sp_arg(ptukey(g$q, g$k, g$gl)), codigo = "ptukey(q, k, gl)")

g <- sp_rejilla(p = c(0.9, 0.95, 0.99), k = c(2, 3, 5, 10, 20), gl = c(2, 5, 10, 20, 33, 120, 1000))
exacto <- mapply(function(p, k, gl) uniroot(function(x) ptukey(x, k, gl) - p, c(0.01, 200), tol = 1e-14)$root,
                 g$p, g$k, g$gl)
sp_caso("inversion-exacta", objetivo = "dist.qtukey", clase = "B",
  titulo = sprintf("Cuantil del rango estudentizado en %d combinaciones (inversión exacta de ptukey)", nrow(g)),
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(g$p), sp_arg(g$k), sp_arg(g$gl), TRUE),
  esperado = sp_arg(exacto),
  codigo = "uniroot(function(x) ptukey(x, k, gl) - p, c(0.01, 200), tol = 1e-14)$root")
sp_caso("qtukey-de-r", objetivo = "dist.qtukey", clase = "B",
  titulo = sprintf("Contra qtukey de R tal cual (tolerancia 1e-4 por diseño), %d combinaciones", nrow(g)),
  fuente = fuente, vectorizar = TRUE, argumentos = list(sp_arg(g$p), sp_arg(g$k), sp_arg(g$gl), TRUE),
  esperado = sp_arg(qtukey(g$p, g$k, g$gl)), codigo = "qtukey(p, k, gl)")
