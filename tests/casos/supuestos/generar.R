# Supuestos: normalidad, varianzas, aditividad, independencia, atípicos e influencia.
suppressPackageStartupMessages({ library(nortest); library(car); library(lmtest); library(agricolae); library(outliers); library(randtests) })

una <- function(nombre, objetivo, titulo, fuente, x, esperado, codigo, paquetes = "stats", ...) {
  sp_caso(nombre, objetivo = objetivo, titulo = titulo, fuente = fuente, datos = data.frame(x = x),
    argumentos = c(list(list(columna = "x")), list(...)), esperado = esperado, codigo = codigo, paquetes = paquetes)
}

# ---- Shapiro-Wilk: todas las ramas del algoritmo (n = 3, 4–5, 6–11, ≥ 12, el p «obvio» y el reescalado)
set.seed(44)
muestras <- list(
  "n3" = list(c(2.1, 5.3, 4.4), "Tres valores (p exacto)", "Datos sintéticos"),
  "n4" = list(c(1, 3.2, 2.5, 9), "Cuatro valores", "Datos sintéticos"),
  "n5" = list(c(10.2, 9.8, 11.5, 10.1, 13.9), "Cinco valores", "Datos sintéticos"),
  "n6" = list(c(5.5, 6.1, 4.9, 5.8, 7.2, 5.0), "Seis valores (segunda fórmula de los coeficientes)", "Datos sintéticos"),
  "n11" = list(round(rnorm(11, 20, 3), 2), "Once valores (último tamaño con la primera transformación)", "Datos sintéticos"),
  "n12" = list(round(rexp(12, 0.2), 2), "Doce valores exponenciales (primer tamaño de la segunda)", "Datos sintéticos"),
  "p-obvio" = list(c(rep(0, 9), 1), "Nueve ceros y un uno: R da p = 1e-99", "Datos sintéticos"),
  "rango-diminuto" = list(1e-12 * c(3, 1, 4, 1.5, 9, 2.6, 5.3, 5.8), "Rango menor que 1e-10 (R reescala)", "Datos sintéticos"),
  "plantas" = list(PlantGrowth$weight, "Peso seco de 30 plantas", "Dobson (1983); conjunto PlantGrowth de R"),
  "ozono" = list(airquality$Ozone, "Ozono con 37 faltantes, sesgado (p diminuto)", "Chambers y col. (1983); conjunto airquality de R"),
  "erupciones" = list(faithful$eruptions, "272 erupciones bimodales (p muy pequeño)", "Azzalini y Bowman (1990); conjunto faithful de R"),
  "normal-5000" = list(round(rnorm(5000, 50, 8), 3), "5000 valores normales (el máximo permitido)", "Datos sintéticos"),
  "uniforme-5000" = list(round(runif(5000), 4), "5000 valores uniformes (p del orden de 1e-30)", "Datos sintéticos"))
for (k in names(muestras)) {
  m <- muestras[[k]]; t <- shapiro.test(m[[1]])
  una(paste0("shapiro-", k), "sup.shapiro", m[[2]], m[[3]], m[[1]], list(W = unname(t$statistic), p = t$p.value), "shapiro.test(x)")
}

# ---- Lilliefors y Anderson-Darling
lil <- list("plantas" = PlantGrowth$weight, "precipitacion" = as.numeric(precip), "ozono-n-mayor-100" = airquality$Ozone,
  "erupciones" = faithful$eruptions, "normal-200-p-grande" = round(rnorm(200), 4), "uniforme-50" = round(runif(50), 4),
  "seis-valores" = c(5.5, 6.1, 4.9, 5.8, 7.2, 5.0))
for (k in names(lil)) {
  t <- lillie.test(lil[[k]])
  una(paste0("lilliefors-", k), "sup.lilliefors", paste("Lilliefors:", k), "Conjuntos de R y datos sintéticos", lil[[k]],
    list(D = unname(t$statistic), p = t$p.value), "nortest::lillie.test(x)", paquetes = "nortest")
}
extremo <- c(round(rnorm(1999, 0, 1), 4), -60)
ad <- list("plantas" = PlantGrowth$weight, "precipitacion" = as.numeric(precip), "ozono" = airquality$Ozone,
  "erupciones" = faithful$eruptions, "normal-200" = round(rnorm(200), 4), "uniforme-50" = round(runif(50), 4),
  "ocho-valores" = c(3.1, 2.7, 3.5, 2.9, 3.8, 3.0, 2.6, 4.9), "atipico-extremo" = extremo)
for (k in names(ad)) {
  t <- ad.test(ad[[k]])
  una(paste0("anderson-", k), "sup.andersonDarling", paste("Anderson-Darling:", k), "Conjuntos de R y datos sintéticos", ad[[k]],
    list(A = unname(t$statistic), p = t$p.value), "nortest::ad.test(x)", paquetes = "nortest")
}

# ---- Kolmogorov-Smirnov contra una normal dada
alt <- c(bilateral = "two.sided", mayor = "greater", menor = "less")
ks <- function(nombre, titulo, x, media, de, a, exacta = NULL) {
  t <- suppressWarnings(ks.test(x, "pnorm", media, de, alternative = alt[[a]], exact = exacta))
  una(nombre, "sup.kolmogorov", titulo, "Datos sintéticos", x,
    list(D = unname(t$statistic), p = t$p.value, exacta = isTRUE(t$exact)),
    sprintf('ks.test(x, "pnorm", %g, %g, alternative = "%s"%s)', media, de, alt[[a]], if (is.null(exacta)) "" else paste0(", exact = ", exacta)),
    paquetes = "stats", media, de, a, if (is.null(exacta)) NULL else exacta)
}
x20 <- round(rnorm(20, 10, 2), 5); x60 <- round(rnorm(60, 0.3, 1), 5); x150 <- round(rnorm(150, 0, 1.2), 5)
ks("ks-exacta-bilateral", "n = 20, bilateral exacta (Marsaglia, Tsang y Wang)", x20, 10, 2, "bilateral")
ks("ks-exacta-desplazada", "n = 60 con la media corrida, bilateral exacta", x60, 0, 1, "bilateral")
ks("ks-exacta-mayor", "n = 20, cola superior exacta (Birnbaum y Tingey)", x20, 11, 2, "mayor")
ks("ks-exacta-menor", "n = 60, cola inferior exacta", x60, 0, 1, "menor")
ks("ks-asintotica-bilateral", "n = 150: distribución límite de Kolmogorov", x150, 0, 1, "bilateral")
ks("ks-asintotica-forzada", "n = 20 con exact = FALSE", x20, 9, 2, "bilateral", FALSE)
ks("ks-asintotica-mayor", "n = 150, cola superior asintótica", x150, -0.2, 1, "mayor")

# ---- varianzas: Levene (media), Brown-Forsythe (mediana), Bartlett y Fligner-Killeen
# Fligner con los empates conservados: la fórmula de fligner.test, pero con |x − mediana| a 12 cifras (de la escala) antes de los
# rangos (fligner.test rompe empates exactos por el redondeo de la resta). Si difiere de fligner.test, clase B.
fligner_r <- function(x, g) {
  ok <- complete.cases(x, g); x <- x[ok]; g <- factor(g[ok]); n <- length(x); k <- nlevels(g)
  x <- x - tapply(x, g, median)[g]
  ax <- abs(x); ax <- round(ax, max(0, 12 - ceiling(log10(max(ax)))))
  a <- qnorm((1 + rank(ax) / (n + 1)) / 2)
  est <- (sum(tapply(a, g, sum)^2 / tapply(a, g, length)) - n * mean(a)^2) / var(a)
  list(X2 = est, gl = k - 1, p = pchisq(est, k - 1, lower.tail = FALSE), tal_cual = unname(fligner.test(x, g)$statistic))
}
var_caso <- function(nombre, titulo, fuente, y, g) {
  d <- data.frame(y = y, g = factor(g))
  for (centro in c("media", "mediana")) {
    t <- leveneTest(y ~ g, data = d, center = if (centro == "media") mean else median)
    sp_caso(paste0(nombre, "-", if (centro == "media") "levene" else "brown-forsythe"), objetivo = "sup.levene", titulo = paste(titulo, "·", centro),
      fuente = fuente, datos = d, argumentos = list(list(columna = "y"), list(columna = "g"), centro),
      esperado = list(F = t[1, "F value"], gl1 = t[1, "Df"], gl2 = t[2, "Df"], p = t[1, "Pr(>F)"]), paquetes = "car",
      codigo = sprintf("car::leveneTest(y ~ g, center = %s)", if (centro == "media") "mean" else "median"))
  }
  b <- bartlett.test(y ~ g, data = d)
  sp_caso(paste0(nombre, "-bartlett"), objetivo = "sup.bartlett", titulo = titulo, fuente = fuente, datos = d,
    argumentos = list(list(columna = "y"), list(columna = "g")), codigo = "bartlett.test(y ~ g)",
    esperado = list(K2 = unname(b$statistic), gl = unname(b$parameter), p = b$p.value))
  f <- fligner_r(d$y, d$g); ft <- fligner.test(y ~ g, data = d)
  sp_caso(paste0(nombre, "-fligner"), objetivo = "sup.fligner", titulo = titulo, fuente = fuente, datos = d,
    clase = if (abs(f$X2 - unname(ft$statistic)) > 1e-6 * f$X2) "B" else "A",
    argumentos = list(list(columna = "y"), list(columna = "g")),
    codigo = paste0("fórmula de fligner.test con rank(round(abs(x - mediana), 12 cifras de la escala)); fligner.test tal cual da X2 = ", signif(unname(ft$statistic), 10)),
    esperado = list(X2 = f$X2, gl = f$gl, p = f$p))
}
var_caso("insectos", "Conteos por insecticida (varianzas muy distintas)", "Beall (1942); conjunto InsectSprays de R", InsectSprays$count, InsectSprays$spray)
var_caso("plantas", "Peso seco por tratamiento", "Dobson (1983); conjunto PlantGrowth de R", PlantGrowth$weight, PlantGrowth$group)
var_caso("roturas-lana-tension", "Roturas por lana × tensión (seis grupos)", "Tippett (1950); conjunto warpbreaks de R",
  warpbreaks$breaks, interaction(warpbreaks$wool, warpbreaks$tension))
var_caso("ozono-por-mes", "Ozono por mes, con faltantes", "Chambers y col. (1983); conjunto airquality de R", airquality$Ozone, airquality$Month)

# ---- no aditividad de Tukey (agricolae, con gl y CM del modelo aditivo y ~ f1 + f2)
noad <- function(nombre, titulo, fuente, d) {
  m <- aov(y ~ f1 + f2, data = d)
  invisible(capture.output(r <- nonadditivity(d$y, d$f1, d$f2, df.residual(m), deviance(m) / df.residual(m))))
  a <- r$ANOVA
  # agricolae calcula p = 1 - pf(F, 1, gl) y pierde cifras cuando p es diminuto: la referencia es la cola
  # superior de pf con el mismo F (clase B si las dos difieren en más de 1e-6 relativo)
  p_preciso <- pf(a["Nonadditivity", "F value"], 1, a["Residuals", "Df"], lower.tail = FALSE)
  clase <- if (abs(p_preciso - a["Nonadditivity", "Pr(>F)"]) > 1e-6 * p_preciso) "B" else "A"
  sp_caso(nombre, objetivo = "sup.noAditividadTabla", titulo = titulo, fuente = fuente, datos = d, clase = clase,
    argumentos = list(list(tabla = TRUE), "y", "f1", "f2"), paquetes = "agricolae",
    esperado = list(P = unname(r$P), Q = unname(r$Q), sc_no_aditividad = a["Nonadditivity", "Sum Sq"], sc_residual = a["Residuals", "Sum Sq"],
      gl_residual = a["Residuals", "Df"], F = a["Nonadditivity", "F value"], p = p_preciso),
    codigo = paste0("m <- aov(y ~ f1 + f2); agricolae::nonadditivity(y, f1, f2, df.residual(m), deviance(m) / df.residual(m))\n",
      "p <- pf(F, 1, gl_residual, lower.tail = FALSE)   # agricolae da ", signif(a["Nonadditivity", "Pr(>F)"], 10), " con 1 - pf()"))
}
set.seed(7)
b <- factor(rep(1:5, each = 6)); t <- factor(rep(LETTERS[1:6], 5))
eb <- c(-2, -1, 0, 1, 2)[b]; et <- c(-3, -1, 0, 1, 2, 4)[t]
noad("bloques-aditivo", "Bloques × tratamientos aditivo (5 × 6, sin interacción)", "Datos sintéticos",
  data.frame(y = round(20 + eb + et + rnorm(30, 0, 1), 2), f1 = b, f2 = t))
noad("bloques-multiplicativo", "Efectos multiplicativos (la no aditividad debe salir significativa)", "Datos sintéticos",
  data.frame(y = round(20 * (1 + eb / 10) * (1 + et / 8) + rnorm(30, 0, 0.3), 2), f1 = b, f2 = t))
# el maíz del ejemplo de la app (3 híbridos × 4 dosis en 4 bloques; misma semilla que datos/generar-ejemplos.R)
set.seed(2026)
mz <- expand.grid(bloque = factor(1:4), hibrido = factor(c("H-40", "H-52", "H-66")), dosis = c(0, 60, 120, 180))
resp_n <- function(n, h) (0.026 + 0.004 * (h == "H-66")) * n - (0.000085 + 0.00001 * (h == "H-66")) * n^2
mz$rend <- round(4.6 + c(0.25, 0.05, -0.10, -0.20)[mz$bloque] + c("H-40" = -0.35, "H-52" = 0.10, "H-66" = 0.25)[as.character(mz$hibrido)] +
                 resp_n(mz$dosis, mz$hibrido) + rnorm(nrow(mz), 0, 0.22), 2)
noad("maiz-bloques-tratamientos", "Maíz: bloque × (híbrido · dosis), 4 × 12", "Datos sintéticos del ejemplo de la app",
  data.frame(y = mz$rend, f1 = mz$bloque, f2 = interaction(mz$hibrido, mz$dosis, lex.order = TRUE)))
noad("roturas-replicado", "Lana × tensión con 9 repeticiones por celda (r = 9: el residual no se corrige)", "Tippett (1950); conjunto warpbreaks de R",
  data.frame(y = warpbreaks$breaks, f1 = warpbreaks$wool, f2 = warpbreaks$tension))

# ---- Durbin-Watson (p exacto con AS 153 si n < 100; normal con media y varianza exactas si no)
dw <- function(nombre, titulo, fuente, d, formula, a = "mayor", exacta = NULL) {
  nombre <- paste0("dw-", nombre)
  ra <- c(mayor = "greater", menor = "less", bilateral = "two.sided")[[a]]
  t <- dwtest(as.formula(formula), data = d, alternative = ra, exact = exacta)
  sp_caso(nombre, objetivo = "sup.durbinWatsonModelo", titulo = titulo, fuente = fuente, datos = d, paquetes = "lmtest",
    argumentos = c(list(list(tabla = TRUE), formula, a), if (!is.null(exacta)) list(exacta)),
    esperado = list(DW = unname(t$statistic), p = t$p.value),
    codigo = sprintf('lmtest::dwtest(%s, alternative = "%s"%s)', formula, ra, if (is.null(exacta)) "" else paste0(", exact = ", exacta)))
}
dw("frenado", "Distancia de frenado contra velocidad (n = 50, exacto)", "Ezekiel (1930); conjunto cars de R", cars, "dist ~ speed")
dw("arboles", "Volumen contra diámetro y altura (n = 31, exacto)", "Ryan, Joiner y Ryan (1976); conjunto trees de R", trees, "Volume ~ Girth + Height")
dw("arboles-bilateral", "Lo mismo, bilateral", "Ryan, Joiner y Ryan (1976); conjunto trees de R", trees, "Volume ~ Girth + Height", "bilateral")
dw("arboles-menor", "Lo mismo, autocorrelación negativa", "Ryan, Joiner y Ryan (1976); conjunto trees de R", trees, "Volume ~ Girth + Height", "menor")
lago <- data.frame(nivel = as.numeric(LakeHuron), anio = as.numeric(time(LakeHuron)))
dw("lago-huron", "Nivel del lago Hurón contra el año (n = 98, autocorrelación fuerte)", "Brockwell y Davis (1991); conjunto LakeHuron de R", lago, "nivel ~ anio")
aq <- na.omit(airquality[c("Ozone", "Solar.R", "Wind", "Temp")])
dw("ozono-normal", "Ozono contra radiación, viento y temperatura (n = 111: aproximación normal)", "Chambers y col. (1983); conjunto airquality de R",
  aq, "Ozone ~ Solar.R + Wind + Temp")
dw("frenado-normal-forzada", "Frenado con exact = FALSE", "Ezekiel (1930); conjunto cars de R", cars, "dist ~ speed", "mayor", FALSE)
dw("plantas-factor", "Peso seco contra tratamiento, en el orden de las filas", "Dobson (1983); conjunto PlantGrowth de R", PlantGrowth, "weight ~ group", "bilateral")

# ---- rachas arriba y abajo de la mediana
ra <- function(nombre, titulo, fuente, x, a = "bilateral", exacta = FALSE) {
  r_alt <- c(bilateral = "two.sided", menor = "left.sided", mayor = "right.sided")[[a]]
  t <- runs.test(x, alternative = r_alt, pvalue = if (exacta) "exact" else "normal")
  una(nombre, "sup.rachas", titulo, fuente, x, paquetes = "randtests",
    esperado = list(rachas = unname(t$runs), n1 = unname(t$parameter["n1"]), n2 = unname(t$parameter["n2"]), z = unname(t$statistic),
      p = min(1, t$p.value), media = t$mu, varianza = t$var),
    codigo = sprintf('randtests::runs.test(x, alternative = "%s", pvalue = "%s")   # p recortado a 1', r_alt, if (exacta) "exact" else "normal"),
    a, exacta)
}
ra("lago", "Nivel del lago Hurón (98 años): muy pocas rachas", "Brockwell y Davis (1991); conjunto LakeHuron de R", as.numeric(LakeHuron))
ra("lago-exacta", "Lo mismo con la distribución exacta", "Brockwell y Davis (1991); conjunto LakeHuron de R", as.numeric(LakeHuron), "bilateral", TRUE)
ra("precipitacion", "Precipitación de 70 ciudades en el orden de la tabla", "McNeil (1977); conjunto precip de R", as.numeric(precip))
x12 <- c(5.1, 4.8, 6.0, 5.5, 4.2, 6.3, 5.9, 4.4, 5.0, 6.1, 4.6, 5.7)
ra("doce-exacta", "Doce valores alternados, exacta", "Datos sintéticos", x12, "bilateral", TRUE)
ra("doce-mayor", "Doce valores, cola de muchas rachas, exacta", "Datos sintéticos", x12, "mayor", TRUE)
ra("lago-menor", "Lago Hurón, cola de pocas rachas, normal", "Brockwell y Davis (1991); conjunto LakeHuron de R", as.numeric(LakeHuron), "menor")

# ---- influencia: palancas, residuos estandarizados y estudentizados, distancia de Cook
infl <- function(nombre, titulo, fuente, d, formula) {
  nombre <- paste0("influencia-", nombre)
  m <- lm(as.formula(formula), data = d)
  sp_caso(nombre, objetivo = "sup.influenciaModelo", titulo = titulo, fuente = fuente, datos = d, argumentos = list(list(tabla = TRUE), formula),
    esperado = list(palanca = I(unname(hatvalues(m))), rstandard = I(unname(rstandard(m))), rstudent = I(unname(rstudent(m))), cook = I(unname(cooks.distance(m)))),
    codigo = sprintf("m <- lm(%s); hatvalues(m); rstandard(m); rstudent(m); cooks.distance(m)", formula))
  rs <- rstudent(m); i <- which.max(abs(rs)); p <- 2 * pt(abs(rs[i]), df.residual(m) - 1, lower.tail = FALSE)
  ot <- outlierTest(m, cutoff = Inf, n.max = 1)
  stopifnot(isTRUE(all.equal(unname(ot$rstudent), unname(rs[i]))))
  sp_caso(paste0(nombre, "-atipico"), objetivo = "sup.atipicoModelo", titulo = paste(titulo, "· mayor residuo estudentizado"), fuente = fuente,
    datos = d, argumentos = list(list(tabla = TRUE), formula), paquetes = c("stats", "car"),
    esperado = list(fila = as.integer(names(i)), rstudent = unname(rs[i]), p = unname(p), bonferroni = min(1, length(rs) * unname(p)), gl = df.residual(m) - 1),
    codigo = sprintf("car::outlierTest(lm(%s))", formula))
}
infl("arboles", "Volumen ~ diámetro + altura", "Ryan, Joiner y Ryan (1976); conjunto trees de R", trees, "Volume ~ Girth + Height")
infl("frenado", "Distancia ~ velocidad", "Ezekiel (1930); conjunto cars de R", cars, "dist ~ speed")
infl("npk-factorial", "Chícharo: bloque + N × P × K", "Yates (1935); conjunto npk de R", npk, "yield ~ block + N * P * K")
aq2 <- airquality[c("Ozone", "Temp", "Wind")]
infl("ozono-faltantes", "Ozono ~ temperatura + viento, con filas faltantes (los números de fila son los de la tabla)", "Chambers y col. (1983); conjunto airquality de R",
  aq2, "Ozone ~ Temp + Wind")

# ---- Grubbs y cercas de Tukey
gr <- list("plantas" = PlantGrowth$weight, "atipico-alto" = c(4.1, 4.5, 4.3, 4.8, 4.4, 4.6, 4.2, 4.7, 9.8),
  "atipico-bajo" = c(12.1, 12.5, 11.9, 12.3, 12.8, 12.0, 12.6, 8.4, 12.2, 12.4), "precipitacion" = as.numeric(precip))
for (k in names(gr)) {
  tg <- grubbs.test(gr[[k]])
  una(paste0("grubbs-", k), "sup.grubbs", paste("Grubbs:", k), "Conjuntos de R y datos sintéticos", gr[[k]], paquetes = "outliers",
    esperado = list(G = unname(tg$statistic["G"]), U = unname(tg$statistic["U"]), p = tg$p.value), codigo = "outliers::grubbs.test(x)")
}
ce <- list("insectos" = InsectSprays$count, "ozono" = airquality$Ozone, "precipitacion" = as.numeric(precip),
  "erupciones" = faithful$eruptions, "pares-de-bisagras" = c(1, 2, 3, 4, 5, 6, 7, 8, 30, -12))
for (k in names(ce)) {
  bs <- boxplot.stats(ce[[k]])
  una(paste0("cercas-", k), "sup.cercasTukey", paste("Cercas de Tukey:", k), "Conjuntos de R y datos sintéticos", ce[[k]],
    esperado = list(estadisticos = I(bs$stats), fuera = I(bs$out)), codigo = "boxplot.stats(x)")
}

# ---- gráfico Q-Q: cuantiles teóricos y banda por estadísticos de orden
for (n in c(5, 10, 11, 50, 300)) for (nivel in c(0.95, 0.9)) {
  i <- seq_len(n); al <- (1 - nivel) / 2
  sp_caso(sprintf("banda-qq-n%d-%g", n, 100 * nivel), objetivo = "sup.bandaQQ", titulo = sprintf("n = %d, banda al %g %%", n, 100 * nivel),
    fuente = "Fórmulas", argumentos = list(n, nivel),
    esperado = list(teorico = I(qnorm(ppoints(n))), inf = I(qnorm(qbeta(al, i, n - i + 1))), sup = I(qnorm(qbeta(1 - al, i, n - i + 1)))),
    codigo = "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))")
}

# ---- el método completo: modelo del experimento, pruebas sobre sus residuos y semáforo
color_r <- function(p, alfa) if (!is.finite(p)) "gris" else if (p >= alfa) "verde" else if (p >= alfa / 5) "ambar" else "rojo"
boxcox_r <- function(y, m) {                          # la verosimilitud perfilada de Box y Cox, como en tests/casos/datos
  X <- model.matrix(m); n <- length(y); lgm <- mean(log(y))
  ll <- function(la) { z <- if (abs(la) < 1e-300) exp(lgm) * log(y) else expm1(la * log(y)) / (la * exp((la - 1) * lgm)); -n / 2 * log(sum(qr.resid(qr(X), z)^2)) }
  o <- optimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12); corte <- o$objective - qchisq(0.95, 1) / 2
  g <- function(la) ll(la) - corte
  ic <- c(if (g(-5) * g(o$maximum) < 0) uniroot(g, c(-5, o$maximum), tol = 1e-12)$root else NA,
          if (g(o$maximum) * g(5) < 0) uniroot(g, c(o$maximum, 5), tol = 1e-12)$root else NA)
  list(lambda = o$maximum, ic = I(ic))
}
supuestos <- function(nombre, titulo, fuente, datos, resp, trs = character(0), bloque = NULL, orden = NULL, alfa = 0.05) {
  d <- datos
  for (f in c(bloque, trs)) d[[f]] <- factor(d[[f]])
  if (!is.null(orden)) d <- d[order(d[[orden]]), ]
  d <- d[complete.cases(d[c(resp, bloque, trs)]), ]
  der <- paste(c(bloque, if (length(trs)) paste(trs, collapse = " * ")), collapse = " + "); if (der == "") der <- "1"
  m <- lm(as.formula(paste(resp, "~", der)), data = d)
  e <- residuals(m); n <- length(e); y <- d[[resp]]
  e12 <- round(e, max(0, 12 - ceiling(log10(max(abs(e))))))   # rachas y cercas: 12 cifras de la escala (empates estables)
  sw <- shapiro.test(e); li <- lillie.test(e); an <- ad.test(e)
  g1 <- e1071::skewness(e, type = 2); g2 <- e1071::kurtosis(e, type = 2)
  nor <- list(shapiro = list(W = unname(sw$statistic), p = sw$p.value), lilliefors = list(D = unname(li$statistic), p = li$p.value),
    anderson = list(A = unname(an$statistic), p = an$p.value), asimetria = g1, curtosis = g2)
  vr <- NULL; ad <- NULL; cv <- "gris"; ca <- "gris"; pv <- NA; pa <- NA
  if (length(trs)) {
    g <- interaction(d[trs], lex.order = TRUE, drop = TRUE, sep = " · ")
    bf <- leveneTest(e ~ g, center = median); lv <- leveneTest(e ~ g, center = mean); ba <- bartlett.test(e ~ g); fl <- fligner_r(e, g)
    vg <- tapply(e, g, stats::var)
    vr <- list(grupos = I(levels(g)), n_grupo = I(as.vector(table(g))), varianza_grupo = I(as.vector(vg)), razon_max_min = max(vg) / min(vg),
      levene = list(F = lv[1, "F value"], gl1 = lv[1, "Df"], gl2 = lv[2, "Df"], p = lv[1, "Pr(>F)"]),
      brown_forsythe = list(F = bf[1, "F value"], gl1 = bf[1, "Df"], gl2 = bf[2, "Df"], p = bf[1, "Pr(>F)"]),
      bartlett = list(K2 = unname(ba$statistic), gl = unname(ba$parameter), p = ba$p.value),
      fligner = list(X2 = fl$X2, gl = fl$gl, p = fl$p))
    pv <- bf[1, "Pr(>F)"]; cv <- color_r(pv, alfa)
    if (!is.null(bloque)) {
      invisible(capture.output(na <- nonadditivity(y, d[[bloque]], g, df.residual(m), deviance(m) / df.residual(m))))
      pa <- pf(na$ANOVA["Nonadditivity", "F value"], 1, na$ANOVA["Residuals", "Df"], lower.tail = FALSE)
      ad <- list(F = na$ANOVA["Nonadditivity", "F value"], p = pa, gl_residual = na$ANOVA["Residuals", "Df"]); ca <- color_r(pa, alfa)
    }
  }
  dw <- dwtest(m); ru <- runs.test(e12, pvalue = if (n < 30) "exact" else "normal")
  rs <- rstudent(m); i <- which.max(abs(rs)); p1 <- 2 * pt(abs(rs[i]), df.residual(m) - 1, lower.tail = FALSE); bonf <- min(1, n * p1)
  cd <- cooks.distance(m)
  cn <- color_r(sw$p.value, alfa)
  leve <- n >= 50 && abs(g1) < 0.5 && abs(g2) < 1
  if (cn == "rojo" && leve) cn <- "ambar"
  sem <- c(normalidad = cn, varianzas = cv, aditividad = ca, independencia = color_r(dw$p.value, alfa), atipicos = color_r(bonf, alfa))
  orden_peor <- c(gris = 0, verde = 1, ambar = 2, rojo = 3)
  global <- names(orden_peor)[max(orden_peor[c("verde", sem)]) + 1]
  bc <- if ((sem[["normalidad"]] != "verde" || sem[["varianzas"]] != "verde") && min(y) > 0) boxcox_r(y, m) else NULL
  esperado <- list(n = n, excluidas = nrow(datos) - n, gl_residual = df.residual(m), cm_error = deviance(m) / df.residual(m),
    normalidad = nor, varianzas = vr, aditividad = ad,
    independencia = list(durbin_watson = list(DW = unname(dw$statistic), p = dw$p.value),
      rachas = list(rachas = unname(ru$runs), p = min(1, ru$p.value))),
    atipicos = list(fila = as.integer(names(i)), rstudent = unname(rs[i]), bonferroni = bonf, gl = df.residual(m) - 1,
      cook_max = max(cd), cook_fila = as.integer(names(which.max(cd))), cook_mayores = sum(cd > 4 / n),
      palanca_max = max(hatvalues(m)), fuera_cercas = length(boxplot.stats(e12)$out)),
    semaforo = lapply(names(sem), function(k) list(clave = k, color = sem[[k]])), global = global)
  if (!is.null(bc)) esperado$boxcox <- bc
  sp_caso(nombre, objetivo = "supuestos", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos[c(resp, bloque, trs, orden)],
    clase = if (!is.null(bc)) "D" else "A",
    entradas = c(list(respuesta = resp, tratamientos = I(trs)), if (!is.null(bloque)) list(bloque = bloque), if (!is.null(orden)) list(orden = orden)),
    opciones = list(alfa = alfa), esperado = esperado, paquetes = c("stats", "nortest", "car", "lmtest", "agricolae", "randtests", "e1071"),
    codigo = paste0("m <- lm(", resp, " ~ ", der, "); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); ",
      "car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); ",
      "lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = ", alfa))
}
supuestos("metodo-plantas", "Peso seco por tratamiento (un factor, sin bloques)", "Dobson (1983); conjunto PlantGrowth de R", PlantGrowth, "weight", "group")
supuestos("metodo-maiz", "Maíz: bloques + híbrido × dosis (dosis numérica)", "Datos sintéticos del ejemplo de la app",
  data.frame(rend = mz$rend, bloque = mz$bloque, hibrido = mz$hibrido, dosis = mz$dosis), "rend", c("hibrido", "dosis"), "bloque")
supuestos("metodo-insectos", "Conteos por insecticida: varianzas muy distintas (rojo)", "Beall (1942); conjunto InsectSprays de R", InsectSprays, "count", "spray")
supuestos("metodo-venenos", "Venenos × tratamientos: varianzas desiguales, con Box-Cox", "Box y Cox (1964); conjunto poisons del paquete boot",
  boot::poisons, "time", c("poison", "treat"))
supuestos("metodo-roturas", "Roturas por lana × tensión", "Tippett (1950); conjunto warpbreaks de R", warpbreaks, "breaks", c("wool", "tension"))
supuestos("metodo-ozono-ordenado", "Ozono por mes en el orden del día del mes, con faltantes", "Chambers y col. (1983); conjunto airquality de R",
  airquality, "Ozone", "Month", orden = "Day")
supuestos("metodo-una-muestra", "Tiempo de espera entre erupciones, sin tratamientos", "Azzalini y Bowman (1990); conjunto faithful de R", faithful, "waiting")
