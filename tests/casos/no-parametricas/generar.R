# Pruebas no paramétricas: Wilcoxon (una muestra, pareada y suma de rangos) con Hodges-Lehmann,
# Kruskal-Wallis y Friedman con sus comparaciones (PMCMRplus), p.adjust y letras (multcompView).
suppressPackageStartupMessages({ library(PMCMRplus); library(multcompView) })
alt <- c(bilateral = "two.sided", menor = "less", mayor = "greater")
dos <- function(x, y) { n <- max(length(x), length(y)); data.frame(x = c(x, rep(NA, n - length(x))), y = c(y, rep(NA, n - length(y)))) }
opc <- function(op, k, omision) if (is.null(op[[k]])) omision else op[[k]]
exacta_r <- function(op) { e <- opc(op, "exacta", "auto"); if (e == "auto") NULL else e == "si" }
# lo que reporta wilcox.test, con los nombres de SigmaPro
wil <- function(w) list(estadistico = unname(w$statistic), p = w$p.value, ic = I(as.numeric(w$conf.int)),
  estimado = unname(w$estimate), nivelLogrado = attr(w$conf.int, "conf.level"), exacta = grepl("exact", w$method))
wil_codigo <- function(op, extra = "") sprintf('wilcox.test(%smu = %g, alternative = "%s", conf.int = TRUE, conf.level = %g%s%s)', extra,
  opc(op, "mu", 0), alt[[opc(op, "alternativa", "bilateral")]], opc(op, "nivel", 0.95),
  if (is.null(exacta_r(op))) "" else paste0(", exact = ", exacta_r(op)), if (isFALSE(op$correccion)) ", correct = FALSE" else "")
wtest <- function(x, y, op, paired = FALSE) suppressWarnings(wilcox.test(x, y, paired = paired, mu = opc(op, "mu", 0),
  alternative = alt[[opc(op, "alternativa", "bilateral")]], conf.int = TRUE, conf.level = opc(op, "nivel", 0.95),
  exact = exacta_r(op), correct = !isFALSE(op$correccion)))

set.seed(21)
# ---- rangos con signo: una muestra y pareada
una <- list(
  list("signo-exacta", sleep$extra[11:20], NULL, list(), "Sueño extra con el fármaco 2: exacta, sin empates ni ceros", "Cushny y Peebles (1905); conjunto sleep de R"),
  list("signo-empates-ozono", airquality$Ozone, NULL, list(mu = 30), "Ozono contra 30: empates, normal con corrección e IC por raíz", "Chambers y col. (1983); conjunto airquality de R"),
  list("signo-mayor-90", c(1.83, 0.50, 1.62, 2.48, 1.68, 1.88, 1.55, 3.06, 1.30), NULL, list(mu = 1, alternativa = "mayor", nivel = 0.9), "Exacta, cola superior, IC 90 %", "Datos sintéticos"),
  list("signo-menor", c(0.878, 0.647, 0.598, 2.05, 1.06, 1.29, 1.06, 3.14, 1.29), NULL, list(alternativa = "menor", mu = 1.2), "Con empates, cola inferior", "Datos sintéticos"),
  list("signo-sin-correccion", airquality$Wind, NULL, list(mu = 10, correccion = FALSE), "Viento contra 10, sin corrección por continuidad", "Chambers y col. (1983); conjunto airquality de R"),
  list("signo-n-80", round(rnorm(80, 0.2, 1), 5), NULL, list(), "80 valores distintos: normal por tamaño (n ≥ 50)", "Datos sintéticos"),
  list("signo-ceros", c(2.1, 3, 3, 1.7, 3.6, 4.2, 3, 2.9, 5.1, 0.4), NULL, list(mu = 3), "Tres valores iguales a μ (se quitan; normal)", "Datos sintéticos"),
  list("signo-exacta-forzada-empates", c(4, 6, 6, 2, 8, 9, 11, 5), NULL, list(mu = 5, exacta = "si"), "Exacta pedida con empates: R pasa a la normal", "Datos sintéticos"),
  list("signo-nivel-inalcanzable", c(1.2, 3.4, 2.2), NULL, list(), "Tres datos: el IC 95 % no se alcanza (queda en 75 %)", "Datos sintéticos"),
  list("signo-normal-pedida", sleep$extra[11:20], NULL, list(exacta = "no"), "Normal pedida aunque podría ser exacta", "Cushny y Peebles (1905); conjunto sleep de R"),
  list("pareada-sueno", sleep$extra[1:10], sleep$extra[11:20], list(), "Sueño con dos fármacos (pareada; empates y un cero)", "Cushny y Peebles (1905); conjunto sleep de R"),
  list("pareada-exacta", c(8.1, 7.4, 9.0, 6.6, 8.8, 7.9, 9.4, 7.2, 8.5), c(7.6, 7.5, 8.1, 6.2, 8.0, 7.0, 8.0, 7.4, 7.8), list(), "Pareada exacta", "Datos sintéticos"),
  list("pareada-faltantes", c(5.1, 4.8, NA, 6.2, 5.9, 5.0, 6.6, 7.1), c(4.7, 4.9, 5.5, NA, 5.2, 4.1, 6.0, 6.0), list(alternativa = "mayor"), "Pareada con pares incompletos", "Datos sintéticos"))
for (u in una) {
  w <- wtest(u[[2]], u[[3]], u[[4]], paired = !is.null(u[[3]]))
  sp_caso(u[[1]], objetivo = "np.signoRango", titulo = u[[5]], fuente = u[[6]],
    datos = if (is.null(u[[3]])) data.frame(x = u[[2]]) else data.frame(x = u[[2]], y = u[[3]]),
    argumentos = list(list(columna = "x"), if (is.null(u[[3]])) NULL else list(columna = "y"), u[[4]]),
    esperado = wil(w), codigo = wil_codigo(u[[4]], if (is.null(u[[3]])) "x, " else "x, y, paired = TRUE, "))
}

# ---- suma de rangos (Mann-Whitney)
pg <- split(PlantGrowth$weight, PlantGrowth$group)
ins <- split(InsectSprays$count, InsectSprays$spray)
sr <- list(
  list("suma-exacta", c(1.83, 0.50, 1.62, 2.48, 1.68, 1.88, 1.55, 3.06, 1.30), c(0.878, 0.647, 0.598, 2.05, 1.06, 1.29, 1.07, 3.14, 1.31, 2.2), list(), "Exacta, 9 contra 10"),
  list("suma-empates-plantas", pg$ctrl, pg$trt1, list(), "Testigo contra tratamiento 1 (un empate: normal)"),
  list("suma-insectos-mayor", ins$A, ins$C, list(alternativa = "mayor", nivel = 0.9), "Insecticida A contra C, cola superior, con empates"),
  list("suma-grandes", round(rnorm(60, 10, 2), 4), round(rnorm(70, 11, 2), 4), list(), "60 contra 70 sin empates (normal por tamaño)"),
  list("suma-mu", c(5.2, 6.1, 4.8, 7.3, 6.6, 5.9, 6.8), c(4.1, 3.9, 5.0, 4.4, 4.7, 3.6), list(mu = 0.5), "Exacta con desplazamiento μ = 0.5"),
  list("suma-desbalance-menor", c(12.1, 13.4, 11.8), round(runif(12, 11, 16), 3), list(alternativa = "menor", nivel = 0.9), "3 contra 12, exacta, cola inferior"),
  list("suma-nivel-inalcanzable", c(2.2, 3.1), c(1.5, 4.0, 2.7), list(), "2 contra 3: el IC 95 % no se alcanza"),
  list("suma-sin-correccion", ins$B, ins$F, list(correccion = FALSE), "Insecticidas B contra F, sin corrección"),
  list("suma-menor-normal", pg$trt1, pg$trt2, list(alternativa = "menor"), "Tratamiento 1 contra 2, cola inferior (normal)"))
for (u in sr) {
  w <- wtest(u[[2]], u[[3]], u[[4]])
  sp_caso(u[[1]], objetivo = "np.sumaRangos", titulo = u[[5]], fuente = "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
    datos = dos(u[[2]], u[[3]]), argumentos = list(list(columna = "x"), list(columna = "y"), u[[4]]),
    esperado = wil(w), codigo = wil_codigo(u[[4]], "x, y, "))
}

# ---- p.adjust
pv <- c(0.0004, 0.012, 0.012, 0.03, 0.2, 0.049, 0.85, 0.0031, NA, 0.6)
for (m in c("holm", "bonferroni", "BH")) {
  sp_caso(paste0("ajuste-", tolower(m)), objetivo = "np.ajustarP", titulo = paste("p.adjust con", m, "(empates y un faltante)"), fuente = "Datos sintéticos",
    argumentos = list(I(pv), m), esperado = I(p.adjust(pv, m)), codigo = sprintf('p.adjust(p, "%s")', m))
}

# ---- letras de agrupación (multcompLetters con una matriz lógica; los pares en el orden de lower.tri)
letras_r <- function(niv, sig) {
  m <- matrix(FALSE, length(niv), length(niv), dimnames = list(niv, niv)); m[lower.tri(m)] <- sig
  unname(multcompLetters(m | t(m))$Letters)
}
patrones <- list(
  "ninguno" = list(paste0("t", 1:4), rep(FALSE, 6)),
  "todos" = list(paste0("t", 1:4), rep(TRUE, 6)),
  "escalera" = list(paste0("t", 1:5), c(FALSE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE)),
  "extremos" = list(c("alto", "medio", "bajo"), c(FALSE, TRUE, FALSE)))
set.seed(7)
for (n in c(6, 8, 10, 13)) patrones[[paste0("azar-", n)]] <- list(paste0("T", seq_len(n)), runif(n * (n - 1) / 2) < 0.45)
# 60 tratamientos todos distintos: más de 52 letras (R sigue con «.a», «.b», …)
patrones[["sesenta"]] <- list(sprintf("v%02d", 1:60), rep(TRUE, 60 * 59 / 2))
for (k in names(patrones)) {
  p <- patrones[[k]]
  sp_caso(paste0("letras-", k), objetivo = "np.letras", titulo = sprintf("Letras: %s (%d tratamientos)", k, length(p[[1]])), fuente = "Patrones sintéticos",
    argumentos = list(I(p[[1]]), I(p[[2]])), esperado = I(letras_r(p[[1]], p[[2]])), paquetes = "multcompView",
    codigo = "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig")
}

# Clase B: con Nemenyi y con el ajuste de Tukey el p es 1 − ptukey(); el rango estudentizado se integra numéricamente
# (algoritmo AS 190) y por debajo de 1e-6 solo quedan cifras absolutas, en R y en SigmaPro.
usa_tukey <- function(metodo, ajuste) metodo == "nemenyi" || ajuste == "tukey"
tol_tukey <- function(ruta) list(tolerancias = setNames(list(list(absoluto = 1e-12,
  motivo = "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)")), ruta))

# ---- Kruskal-Wallis y comparaciones
kwd <- list(
  plantas = list(PlantGrowth$weight, PlantGrowth$group, "Peso seco de plantas, 3 tratamientos", "Dobson (1983); conjunto PlantGrowth de R"),
  insectos = list(InsectSprays$count, InsectSprays$spray, "Conteos por insecticida, 6 grupos con empates", "Beall (1942); conjunto InsectSprays de R"),
  ozono = list(airquality$Ozone, factor(airquality$Month), "Ozono por mes, con faltantes", "Chambers y col. (1983); conjunto airquality de R"),
  pollos = list(chickwts$weight, chickwts$feed, "Peso de pollos por alimento, 6 grupos desbalanceados", "Anónimo (1948); conjunto chickwts de R"))
for (k in names(kwd)) {
  d <- kwd[[k]]; y <- d[[1]]; g <- d[[2]]
  ok <- !is.na(y); r <- rank(y[ok]); gg <- droplevels(g[ok])
  kt <- kruskal.test(y, g); H <- unname(kt$statistic); n <- sum(ok); kk <- nlevels(gg)
  sp_caso(paste0("kruskal-", k), objetivo = "np.kruskal", titulo = d[[3]], fuente = d[[4]], datos = data.frame(y = y, g = g),
    argumentos = list(list(columna = "y"), list(columna = "g")),
    esperado = list(H = H, gl = unname(kt$parameter), p = kt$p.value, eta2 = (H - kk + 1) / (n - kk),
      grupos = lapply(levels(gg), function(l) list(n = sum(gg == l), mediana = median(y[ok][gg == l]),
        rangoMedio = mean(r[gg == l]), sumaRangos = sum(r[gg == l])))),
    codigo = "kruskal.test(y, g); eta2 = (H - k + 1) / (n - k); tapply(rank(y), g, mean)")
}
# los pares de SigmaPro, (a, b) con a < b, desde la tabla de pairwise.table (fila b, columna a)
par_de <- function(M, niv, f) { out <- list(); for (a in 1:(length(niv) - 1)) for (b in (a + 1):length(niv)) out[[length(out) + 1]] <- f(M[niv[b], niv[a]], a, b); out }
pares_kw <- function(y, g, metodo, ajuste) {
  ok <- !is.na(y); y <- y[ok]; g <- droplevels(g[ok]); niv <- levels(g); Rb <- tapply(rank(y), g, mean)
  aj <- c(holm = "holm", bonferroni = "bonferroni", BH = "BH", tukey = "single-step")[[ajuste]]
  if (metodo == "dunn") {
    a <- suppressWarnings(kwAllPairsDunnTest(y, g, p.adjust.method = aj)); s <- suppressWarnings(kwAllPairsDunnTest(y, g, p.adjust.method = "none"))
    par_de(a$statistic, niv, function(v, i, j) list(estadistico = sign(Rb[[i]] - Rb[[j]]) * v, p = s$p.value[niv[j], niv[i]], p_ajustado = a$p.value[niv[j], niv[i]]))
  } else if (metodo == "conover") {
    a <- suppressWarnings(kwAllPairsConoverTest(y, g, p.adjust.method = aj)); s <- suppressWarnings(kwAllPairsConoverTest(y, g, p.adjust.method = "none"))
    par_de(s$statistic, niv, function(v, i, j) list(estadistico = -v, p = s$p.value[niv[j], niv[i]], p_ajustado = a$p.value[niv[j], niv[i]]))
  } else {
    a <- suppressWarnings(kwAllPairsNemenyiTest(y, g))
    par_de(a$statistic, niv, function(v, i, j) list(estadistico = v, p_ajustado = a$p.value[niv[j], niv[i]]))
  }
}
combos <- list(c("plantas", "dunn", "holm"), c("plantas", "conover", "tukey"), c("plantas", "nemenyi", "tukey"),
  c("insectos", "dunn", "bonferroni"), c("insectos", "conover", "holm"), c("insectos", "nemenyi", "tukey"),
  c("ozono", "dunn", "BH"), c("ozono", "conover", "BH"), c("pollos", "dunn", "holm"), c("pollos", "conover", "bonferroni"), c("pollos", "nemenyi", "tukey"))
for (cb in combos) {
  d <- kwd[[cb[1]]]
  sp_caso(sprintf("pares-kruskal-%s-%s-%s", cb[1], cb[2], tolower(cb[3])), objetivo = "np.paresKruskal",
    titulo = sprintf("%s: %s con ajuste %s", d[[3]], cb[2], cb[3]), fuente = d[[4]], datos = data.frame(y = d[[1]], g = d[[2]]),
    argumentos = list(list(columna = "y"), list(columna = "g"), list(metodo = cb[2], ajuste = cb[3])),
    clase = if (usa_tukey(cb[2], cb[3])) "B" else "A", comparacion = if (usa_tukey(cb[2], cb[3])) tol_tukey("pares[*].p_ajustado"),
    esperado = list(pares = pares_kw(d[[1]], d[[2]], cb[2], cb[3])), paquetes = c("stats", "PMCMRplus"),
    codigo = sprintf("PMCMRplus::kwAllPairs%sTest(y, g%s)", c(dunn = "Dunn", conover = "Conover", nemenyi = "Nemenyi")[[cb[2]]],
      if (cb[2] == "nemenyi") "" else sprintf(', p.adjust.method = "%s"', c(holm = "holm", bonferroni = "bonferroni", BH = "BH", tukey = "single-step")[[cb[3]]])))
}

# ---- Friedman
redondeo <- matrix(c(5.40, 5.50, 5.55, 5.85, 5.70, 5.75, 5.20, 5.60, 5.50, 5.55, 5.50, 5.40, 5.90, 5.85, 5.70, 5.45, 5.55, 5.60,
  5.40, 5.40, 5.35, 5.45, 5.50, 5.35, 5.25, 5.15, 5.00, 5.85, 5.80, 5.70, 5.25, 5.20, 5.10, 5.65, 5.55, 5.45, 5.60, 5.35, 5.45,
  5.05, 5.00, 4.95, 5.50, 5.50, 5.40, 5.45, 5.55, 5.50, 5.55, 5.55, 5.35, 5.45, 5.50, 5.55, 5.50, 5.45, 5.25, 5.65, 5.60, 5.40,
  5.70, 5.65, 5.55, 6.30, 6.30, 6.25), nrow = 22, byrow = TRUE, dimnames = list(1:22, c("redonda", "angulo.estrecho", "angulo.amplio")))
largo <- function(m) data.frame(y = c(m), trat = factor(rep(colnames(m), each = nrow(m)), levels = colnames(m)),
  bloque = factor(rep(rownames(m), times = ncol(m)), levels = rownames(m)))
catas <- matrix(c(7, 5, 6, 8, 6, 6, 7, 9, 5, 4, 6, 7, 8, 6, 8, 9, 6, 5, 5, 7, 7, 6, 7, 8, 4, 4, 5, 6, 6, 5, 7, 8), ncol = 4, byrow = TRUE,
  dimnames = list(paste0("juez", 1:8), c("A", "B", "C", "D")))
set.seed(3)
campo <- matrix(round(rnorm(30, rep(c(40, 43, 45, 41, 47), each = 6), 3), 1), ncol = 5, dimnames = list(paste0("b", 1:6), c("v1", "v2", "v3", "v4", "v5")))
campo[4, 2] <- NA
frd <- list(
  redondeo = list(largo(redondeo), "Tiempo para rodear la base con tres métodos, 22 jugadores (empates)", "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test"),
  catas = list(largo(catas), "Calificaciones de 8 jueces a 4 muestras (muchos empates)", "Datos sintéticos"),
  campo = list(largo(campo), "5 variedades en 6 bloques, un faltante (el bloque sale)", "Datos sintéticos"))
for (k in names(frd)) {
  d <- frd[[k]][[1]]
  ft <- friedman.test(d$y, d$trat, d$bloque)
  M <- matrix(d$y, ncol = nlevels(d$trat)); M <- M[complete.cases(M), , drop = FALSE]; R <- t(apply(M, 1, rank)); n <- nrow(M)
  sp_caso(paste0("friedman-", k), objetivo = "np.friedman", titulo = frd[[k]][[2]], fuente = frd[[k]][[3]], datos = d,
    argumentos = list(list(columna = "y"), list(columna = "trat"), list(columna = "bloque")),
    esperado = list(Q = unname(ft$statistic), gl = unname(ft$parameter), p = ft$p.value, W = unname(ft$statistic) / (n * (ncol(M) - 1)), n = n,
      grupos = lapply(seq_len(ncol(M)), function(j) list(mediana = median(M[, j]), sumaRangos = sum(R[, j])))),
    codigo = "friedman.test(y, trat, bloque); W = Q / (n * (k - 1))")
}
# frdRanks de PMCMRplus falla si un bloque queda incompleto (no reajusta los nombres de las filas): se le pasan
# solo los bloques completos, que es lo mismo que hace friedman.test
completos <- function(d) { malos <- unique(d$bloque[is.na(d$y)]); droplevels(d[!d$bloque %in% malos, ]) }
pares_frd <- function(d, metodo, ajuste) {
  d <- completos(d); niv <- levels(d$trat); aj <- c(holm = "holm", bonferroni = "bonferroni", BH = "BH", tukey = "single-step")[[ajuste]]
  if (metodo == "conover") {
    a <- suppressWarnings(frdAllPairsConoverTest(d$y, d$trat, d$bloque, p.adjust.method = aj))
    s <- suppressWarnings(frdAllPairsConoverTest(d$y, d$trat, d$bloque, p.adjust.method = "none"))
    par_de(s$statistic, niv, function(v, i, j) list(estadistico = v, p = s$p.value[niv[j], niv[i]], p_ajustado = a$p.value[niv[j], niv[i]]))
  } else if (metodo == "nemenyi") {
    a <- suppressWarnings(frdAllPairsNemenyiTest(d$y, d$trat, d$bloque))
    par_de(a$statistic, niv, function(v, i, j) list(estadistico = v, p_ajustado = a$p.value[niv[j], niv[i]]))
  } else {
    M <- matrix(d$y, ncol = length(niv), dimnames = list(NULL, niv)); M <- M[complete.cases(M), , drop = FALSE]
    yy <- c(M); gg <- factor(rep(niv, each = nrow(M)), levels = niv)
    a <- suppressWarnings(pairwise.wilcox.test(yy, gg, paired = TRUE, p.adjust.method = aj))
    s <- suppressWarnings(pairwise.wilcox.test(yy, gg, paired = TRUE, p.adjust.method = "none"))
    out <- list(); for (i in 1:(length(niv) - 1)) for (j in (i + 1):length(niv)) {
      w <- suppressWarnings(wilcox.test(M[, i], M[, j], paired = TRUE))
      out[[length(out) + 1]] <- list(estadistico = unname(w$statistic), p = s$p.value[niv[j], niv[i]], p_ajustado = a$p.value[niv[j], niv[i]])
    }
    out
  }
}
combos <- list(c("redondeo", "conover", "holm"), c("redondeo", "conover", "tukey"), c("redondeo", "nemenyi", "tukey"), c("redondeo", "wilcoxon", "bonferroni"),
  c("catas", "conover", "BH"), c("catas", "nemenyi", "tukey"), c("catas", "wilcoxon", "holm"), c("campo", "conover", "holm"), c("campo", "wilcoxon", "BH"))
for (cb in combos) {
  d <- frd[[cb[1]]][[1]]
  sp_caso(sprintf("pares-friedman-%s-%s-%s", cb[1], cb[2], tolower(cb[3])), objetivo = "np.paresFriedman",
    titulo = sprintf("%s: %s con ajuste %s", frd[[cb[1]]][[2]], cb[2], cb[3]), fuente = frd[[cb[1]]][[3]], datos = d,
    argumentos = list(list(columna = "y"), list(columna = "trat"), list(columna = "bloque"), list(metodo = cb[2], ajuste = cb[3])),
    clase = if (usa_tukey(cb[2], cb[3])) "B" else "A", comparacion = if (usa_tukey(cb[2], cb[3])) tol_tukey("pares[*].p_ajustado"),
    esperado = list(pares = pares_frd(d, cb[2], cb[3])), paquetes = c("stats", "PMCMRplus"),
    codigo = if (cb[2] == "wilcoxon") sprintf('pairwise.wilcox.test(y, trat, paired = TRUE, p.adjust.method = "%s")', cb[3])
      else sprintf("PMCMRplus::frdAllPairs%sTest(y, trat, bloque%s)", c(conover = "Conover", nemenyi = "Nemenyi")[[cb[2]]],
        if (cb[2] == "nemenyi") "" else sprintf(', p.adjust.method = "%s"', c(holm = "holm", bonferroni = "bonferroni", BH = "BH", tukey = "single-step")[[cb[3]]])))
}

# ---- los métodos completos
letras_de <- function(valores, pares, alfa) {
  k <- length(valores); ord <- order(-valores)
  pm <- matrix(NA, k, k); idx <- 0
  for (a in 1:(k - 1)) for (b in (a + 1):k) { idx <- idx + 1; pm[a, b] <- pm[b, a] <- pares[[idx]]$p_ajustado }
  niv <- paste0("g", ord); m <- pm[ord, ord] < alfa; diag(m) <- FALSE; dimnames(m) <- list(niv, niv)
  l <- multcompLetters(m)$Letters; unname(l[paste0("g", 1:k)])
}
metodo_kw <- function(nombre, titulo, fuente, d, posthoc, ajuste, alfa = 0.05) {
  y <- d[[1]]; g <- d[[2]]; ok <- !is.na(y); gg <- droplevels(g[ok]); kt <- kruskal.test(y, g)
  H <- unname(kt$statistic); n <- sum(ok); kk <- nlevels(gg); Rb <- tapply(rank(y[ok]), gg, mean)
  pr <- pares_kw(y, g, posthoc, ajuste)
  sp_caso(nombre, objetivo = "kruskal-wallis", tipo = "metodo", titulo = titulo, fuente = fuente, datos = data.frame(y = y, g = g),
    entradas = list(respuesta = "y", tratamiento = "g"), opciones = list(posthoc = posthoc, ajuste = ajuste, alfa = alfa),
    clase = if (usa_tukey(posthoc, ajuste)) "B" else "A", comparacion = if (usa_tukey(posthoc, ajuste)) tol_tukey("comparaciones.pares[*].p_ajustado"),
    esperado = list(prueba = list(H = H, gl = unname(kt$parameter), p = kt$p.value, eta2 = (H - kk + 1) / (n - kk)),
      comparaciones = list(pares = pr), letras = I(letras_de(as.numeric(Rb), pr, alfa))),
    paquetes = c("stats", "PMCMRplus", "multcompView"), codigo = "kruskal.test; PMCMRplus::kwAllPairs*Test; multcompView::multcompLetters con los niveles por rango medio decreciente")
}
metodo_kw("metodo-kruskal-plantas", "Plantas: Dunn con Holm y letras", kwd$plantas[[4]], kwd$plantas, "dunn", "holm")
metodo_kw("metodo-kruskal-insectos", "Insecticidas: Conover-Iman con Tukey y letras", kwd$insectos[[4]], kwd$insectos, "conover", "tukey")
metodo_kw("metodo-kruskal-pollos", "Pollos: Nemenyi y letras con α = 0.01", kwd$pollos[[4]], kwd$pollos, "nemenyi", "tukey", 0.01)
metodo_frd <- function(nombre, titulo, k, posthoc, ajuste, alfa = 0.05) {
  d <- frd[[k]][[1]]; ft <- friedman.test(d$y, d$trat, d$bloque)
  M <- matrix(d$y, ncol = nlevels(d$trat)); M <- M[complete.cases(M), , drop = FALSE]; n <- nrow(M); R <- t(apply(M, 1, rank))
  pr <- pares_frd(d, posthoc, ajuste)
  sp_caso(nombre, objetivo = "friedman", tipo = "metodo", titulo = titulo, fuente = frd[[k]][[3]], datos = d,
    entradas = list(respuesta = "y", tratamiento = "trat", bloque = "bloque"), opciones = list(posthoc = posthoc, ajuste = ajuste, alfa = alfa),
    clase = if (usa_tukey(posthoc, ajuste)) "B" else "A", comparacion = if (usa_tukey(posthoc, ajuste)) tol_tukey("comparaciones.pares[*].p_ajustado"),
    esperado = list(prueba = list(Q = unname(ft$statistic), gl = unname(ft$parameter), p = ft$p.value, W = unname(ft$statistic) / (n * (ncol(M) - 1))),
      comparaciones = list(pares = pr), letras = I(letras_de(colSums(R), pr, alfa))),
    paquetes = c("stats", "PMCMRplus", "multcompView"), codigo = "friedman.test; PMCMRplus::frdAllPairs*Test o pairwise.wilcox.test(paired = TRUE); multcompLetters")
}
metodo_frd("metodo-friedman-redondeo", "Métodos para rodear la base: Conover con Holm", "redondeo", "conover", "holm")
metodo_frd("metodo-friedman-catas", "Catas: Nemenyi", "catas", "nemenyi", "tukey", 0.1)
metodo_frd("metodo-friedman-campo", "Variedades: Wilcoxon pareada con Bonferroni", "campo", "wilcoxon", "bonferroni")
metodo_w <- function(nombre, titulo, fuente, datos, entradas, opciones, x, y = NULL, pareada = FALSE) {
  w <- wtest(x, y, opciones, paired = pareada)
  sp_caso(nombre, objetivo = "wilcoxon", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos, entradas = entradas, opciones = opciones,
    esperado = list(prueba = wil(w)[c("estadistico", "p", "ic", "estimado")]), codigo = wil_codigo(opciones, "x, y, "))
}
pg2 <- droplevels(PlantGrowth[PlantGrowth$group != "trt1", ])
metodo_w("metodo-wilcoxon-dos", "Plantas: tratamiento 2 contra testigo", "Dobson (1983); conjunto PlantGrowth de R", pg2,
  list(modo = "independientes", respuesta = "weight", grupo = "group", niveles = I(c("trt2", "ctrl"))), list(), pg$trt2, pg$ctrl)
metodo_w("metodo-wilcoxon-pareada", "Sueño con dos fármacos", "Cushny y Peebles (1905); conjunto sleep de R",
  data.frame(f1 = sleep$extra[1:10], f2 = sleep$extra[11:20]), list(modo = "pareadas", antes = "f1", despues = "f2"), list(alternativa = "menor"),
  sleep$extra[1:10], sleep$extra[11:20], pareada = TRUE)
metodo_w("metodo-wilcoxon-una", "Ozono contra 40, IC 90 %", "Chambers y col. (1983); conjunto airquality de R", airquality["Ozone"],
  list(modo = "una", variable = "Ozone"), list(mu = 40, nivel = 0.9), airquality$Ozone)
