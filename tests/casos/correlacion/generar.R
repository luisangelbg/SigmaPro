# Correlación: Pearson, Spearman y Kendall (cor.test), matrices con p ajustados, correlación parcial y semiparcial.
suppressPackageStartupMessages({ library(psych) })

F_HW <- "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)"
F_SWISS <- "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R"
F_AIR <- "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R"
F_MTCARS <- "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R"

v <- function(x) I(unname(as.numeric(x)))
ALT <- c(bilateral = "two.sided", mayor = "greater", menor = "less")

ref_prueba <- function(x, y, metodo, alternativa = "bilateral", nivel = 0.95, exacta = "auto", continuidad = FALSE) {
  ex <- if (exacta == "no") FALSE else NULL
  ct <- suppressWarnings(cor.test(x, y, method = metodo, alternative = ALT[[alternativa]], conf.level = nivel, exact = ex, continuity = continuidad))
  ok <- complete.cases(x, y); n <- sum(ok)
  tiesx <- length(unique(x[ok])) < n || length(unique(y[ok])) < n
  exact_usado <- if (metodo == "pearson") NA else if (metodo == "kendall") (is.null(ex) && n < 50 && !tiesx) else (is.null(ex) && !tiesx && n <= 1290)
  list(estimado = unname(ct$estimate), estadistico = unname(ct$statistic), gl = if (is.null(ct$parameter)) NA else unname(ct$parameter), p = ct$p.value,
       ic = if (is.null(ct$conf.int)) NA else v(ct$conf.int), n = n, exacta = exact_usado)
}
caso_prueba <- function(nombre, titulo, fuente, datos, x, y, metodo, alternativa = "bilateral", nivel = 0.95, exacta = "auto", continuidad = FALSE) {
  sp_caso(nombre, objetivo = "cor.pruebaDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(x = x, y = y), list(metodo = metodo, alternativa = alternativa, nivel = nivel, exacta = exacta, continuidad = continuidad)),
    esperado = ref_prueba(datos[[x]], datos[[y]], metodo, alternativa, nivel, exacta, continuidad),
    codigo = sprintf("cor.test(x, y, method = \"%s\", alternative = \"%s\", conf.level = %s%s%s)", metodo, ALT[[alternativa]], nivel, if (exacta == "no") ", exact = FALSE" else "", if (continuidad) ", continuity = TRUE" else ""))
}

hw <- data.frame(x = c(44.4, 45.9, 41.9, 53.3, 44.7, 44.1, 50.7, 45.2, 60.1), y = c(2.6, 3.1, 2.5, 5.0, 3.6, 4.0, 5.2, 2.8, 3.8))
for (m in c("pearson", "spearman", "kendall")) for (a in c("bilateral", "mayor", "menor")) caso_prueba(sprintf("hw-%s-%s", m, a), sprintf("%s, alternativa %s, n = 9 (exacta)", m, a), F_HW, hw, "x", "y", m, a)
caso_prueba("hw-pearson-90", "Pearson con IC al 90 %", F_HW, hw, "x", "y", "pearson", nivel = 0.9)
caso_prueba("hw-spearman-aprox", "Spearman sin la exacta (t de Student)", F_HW, hw, "x", "y", "spearman", exacta = "no")
caso_prueba("hw-kendall-aprox", "Kendall sin la exacta (normal)", F_HW, hw, "x", "y", "kendall", exacta = "no")
caso_prueba("hw-kendall-continuidad", "Kendall normal con corrección por continuidad", F_HW, hw, "x", "y", "kendall", exacta = "no", continuidad = TRUE)
# Spearman por la serie de Edgeworth (10 ≤ n ≤ 1290, sin empates) y exacta con n pequeños
set.seed(91)
for (n in c(4, 6, 10, 12, 20, 35, 80, 300)) {
  d <- data.frame(x = rnorm(n), y = 0)
  d$y <- 0.4 * d$x + rnorm(n)
  caso_prueba(sprintf("spearman-n%d", n), sprintf("Spearman sin empates, n = %d", n), "Datos sintéticos", d, "x", "y", "spearman")
  caso_prueba(sprintf("spearman-n%d-mayor", n), sprintf("Spearman sin empates, n = %d, una cola", n), "Datos sintéticos", d, "x", "y", "spearman", "mayor")
  caso_prueba(sprintf("kendall-n%d", n), sprintf("Kendall sin empates, n = %d", n), "Datos sintéticos", d, "x", "y", "kendall")
}
set.seed(93)
d49 <- data.frame(x = rnorm(49)); d49$y <- -0.3 * d49$x + rnorm(49)
caso_prueba("kendall-n49-menor", "Kendall exacta con n = 49, una cola", "Datos sintéticos", d49, "x", "y", "kendall", "menor")
d50 <- data.frame(x = rnorm(50)); d50$y <- 0.2 * d50$x + rnorm(50)
caso_prueba("kendall-n50", "Kendall con n = 50: ya por la normal", "Datos sintéticos", d50, "x", "y", "kendall")
# empates
air <- airquality[c("Ozone", "Temp", "Wind", "Solar.R")]
caso_prueba("faltantes-pearson", "Pearson con faltantes", F_AIR, air, "Ozone", "Temp", "pearson")
caso_prueba("empates-spearman", "Spearman con empates (t de Student)", F_AIR, air, "Ozone", "Temp", "spearman")
caso_prueba("empates-spearman-continuidad", "Spearman con empates y corrección por continuidad", F_AIR, air, "Ozone", "Wind", "spearman", continuidad = TRUE)
caso_prueba("empates-kendall", "Kendall con empates (varianza corregida)", F_AIR, air, "Ozone", "Temp", "kendall")
caso_prueba("empates-kendall-continuidad", "Kendall con empates y corrección por continuidad", F_AIR, air, "Wind", "Temp", "kendall", "menor", continuidad = TRUE)
set.seed(95)
grande <- data.frame(x = round(rnorm(3000), 1)); grande$y <- round(0.1 * grande$x + rnorm(3000), 1)
caso_prueba("grande-kendall", "Kendall con 3000 datos y muchos empates (algoritmo de Knight)", "Datos sintéticos", grande, "x", "y", "kendall")
caso_prueba("grande-spearman", "Spearman con 3000 datos y empates", "Datos sintéticos", grande, "x", "y", "spearman")

# matrices: cor.test por par y p.adjust
ADJ <- c(holm = "holm", bonferroni = "bonferroni", BH = "BH", ninguno = "none")
ref_matriz <- function(d, metodo, ajuste, faltantes, exacta = "auto") {
  vars <- names(d); m <- length(vars)
  if (faltantes == "completas") d <- d[complete.cases(d), ]
  r <- diag(1, m); nn <- matrix(0, m, m); pares <- list()
  for (i in 1:m) nn[i, i] <- sum(!is.na(d[[i]]))
  if (faltantes == "completas") diag(nn) <- nrow(d)
  for (i in 1:(m - 1)) for (j in (i + 1):m) {
    rp <- ref_prueba(d[[i]], d[[j]], metodo, exacta = exacta)
    r[i, j] <- r[j, i] <- rp$estimado; nn[i, j] <- nn[j, i] <- rp$n
    pares[[length(pares) + 1]] <- list(r = rp$estimado, p = rp$p, n = rp$n, ic = rp$ic)
  }
  pa <- p.adjust(sapply(pares, `[[`, "p"), ADJ[[ajuste]])
  for (k in seq_along(pares)) pares[[k]]$p_ajustado <- pa[k]
  list(r = lapply(1:m, function(i) v(r[i, ])), n = lapply(1:m, function(i) v(nn[i, ])), pares = pares)
}
caso_matriz <- function(nombre, titulo, fuente, d, metodo, ajuste, faltantes = "completas") {
  sp_caso(nombre, objetivo = "cor.matrizDe", titulo = titulo, fuente = fuente, datos = d,
    argumentos = list(list(tabla = TRUE), list(variables = I(names(d))), list(metodo = metodo, ajuste = ajuste, faltantes = faltantes, nivel = 0.95)),
    esperado = ref_matriz(d, metodo, ajuste, faltantes), codigo = sprintf("cor.test por par (%s) y p.adjust(\"%s\"); filas %s", metodo, ADJ[[ajuste]], faltantes))
}
caso_matriz("matriz-swiss-pearson-holm", "Cinco variables, Pearson con Holm", F_SWISS, swiss[1:5], "pearson", "holm")
caso_matriz("matriz-swiss-spearman-bh", "Cinco variables, Spearman con Benjamini-Hochberg", F_SWISS, swiss[1:5], "spearman", "BH")
caso_matriz("matriz-mtcars-kendall-bonferroni", "Seis variables con empates, Kendall con Bonferroni", F_MTCARS, mtcars[c("mpg", "cyl", "disp", "hp", "wt", "qsec")], "kendall", "bonferroni")
caso_matriz("matriz-faltantes-pares", "Faltantes: cada par con sus filas completas", F_AIR, air, "pearson", "ninguno", "pares")
caso_matriz("matriz-faltantes-completas", "Faltantes: solo las filas completas en todas", F_AIR, air, "spearman", "holm", "completas")

# parcial y semiparcial por residuos (la t con n − 2 − k gl, como ppcor); psych::partial.r como comprobación
ref_parcial <- function(d, x, y, ctrl, metodo) {
  d <- d[complete.cases(d[c(x, y, ctrl)]), c(x, y, ctrl)]
  if (metodo == "spearman") d[] <- lapply(d, rank)
  n <- nrow(d); k <- length(ctrl); gl <- n - 2 - k
  f <- function(v) residuals(lm(reformulate(ctrl, v), data = d))
  ex <- f(x); ey <- f(y)
  pr <- function(r, g = gl) { t <- r * sqrt(g / (1 - r^2)); list(r = r, t = t, gl = g, p = 2 * pt(-abs(t), g)) }
  rp <- cor(ex, ey)
  pc <- psych::partial.r(as.matrix(d), c(1, 2), 3:(2 + k))[1, 2]
  stopifnot(abs(pc - rp) < 1e-12)
  list(simple = pr(cor(d[[x]], d[[y]]), n - 2), parcial = pr(rp), semiparcial_x = pr(cor(d[[y]], ex)), semiparcial_y = pr(cor(d[[x]], ey)), n = n)
}
caso_parcial <- function(nombre, titulo, fuente, d, x, y, ctrl, metodo) {
  sp_caso(nombre, objetivo = "cor.parcialDe", titulo = titulo, fuente = fuente, datos = d,
    argumentos = list(list(tabla = TRUE), list(x = x, y = y, controles = I(ctrl)), list(metodo = metodo)), esperado = ref_parcial(d, x, y, ctrl, metodo), paquetes = c("stats", "psych"),
    codigo = "cor(residuals(lm(x ~ controles)), residuals(lm(y ~ controles))); semiparciales con el residuo de una sola; psych::partial.r")
}
caso_parcial("parcial-swiss", "Fertilidad y educación, controlando agricultura y catolicismo", F_SWISS, swiss, "Fertility", "Education", c("Agriculture", "Catholic"), "pearson")
caso_parcial("parcial-swiss-spearman", "Lo mismo con Spearman", F_SWISS, swiss, "Fertility", "Education", c("Agriculture", "Catholic"), "spearman")
caso_parcial("parcial-mtcars", "Rendimiento y peso controlando la potencia", F_MTCARS, mtcars, "mpg", "wt", "hp", "pearson")
caso_parcial("parcial-faltantes", "Con faltantes y tres controles", F_AIR, airquality, "Ozone", "Temp", c("Wind", "Solar.R", "Month"), "pearson")

# los métodos completos
sp_caso("metodo-correlacion-hw", objetivo = "correlacion", tipo = "metodo", titulo = "Kendall exacta con la tabla de los tres coeficientes", fuente = F_HW, datos = hw,
  entradas = list(x = "x", y = "y"), opciones = list(metodo = "kendall"),
  esperado = c(ref_prueba(hw$x, hw$y, "kendall")[c("estimado", "estadistico", "p", "n")],
    list(comparar = lapply(c("pearson", "spearman", "kendall"), function(m) { r <- ref_prueba(hw$x, hw$y, m); list(estimado = r$estimado, p = r$p) }))),
  codigo = "cor.test(x, y, method = …) con los tres coeficientes")
sp_caso("metodo-matriz-swiss", objetivo = "matriz-correlacion", tipo = "metodo", titulo = "Matriz de Pearson con Holm", fuente = F_SWISS, datos = swiss[1:5],
  entradas = list(variables = I(names(swiss)[1:5])), opciones = list(metodo = "pearson", ajuste = "holm"),
  esperado = (function(rf) list(r = rf$r, pares = lapply(rf$pares, function(z) z[c("r", "p", "p_ajustado", "ic")])))(ref_matriz(swiss[1:5], "pearson", "holm", "completas")),
  codigo = "cor.test por par y p.adjust(\"holm\")")
sp_caso("metodo-parcial-swiss", objetivo = "correlacion-parcial", tipo = "metodo", titulo = "Parcial y semiparciales", fuente = F_SWISS, datos = swiss,
  entradas = list(x = "Fertility", y = "Education", controles = I(c("Agriculture", "Catholic"))), opciones = list(metodo = "pearson"),
  esperado = ref_parcial(swiss, "Fertility", "Education", c("Agriculture", "Catholic"), "pearson")[c("simple", "parcial", "semiparcial_x", "semiparcial_y")], paquetes = c("stats", "psych"),
  codigo = "residuos de lm sobre los controles")
