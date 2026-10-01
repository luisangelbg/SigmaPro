# Pruebas t, F de razón de varianzas y tamaños del efecto (d de Cohen y g de Hedges).
alt <- c(bilateral = "two.sided", menor = "less", mayor = "greater")
# dos vectores de distinto largo en una tabla: el corto se rellena con faltantes
dos <- function(x, y) { n <- max(length(x), length(y)); data.frame(x = c(x, rep(NA, n - length(x))), y = c(y, rep(NA, n - length(y)))) }
tt <- function(t) list(t = unname(t$statistic), gl = unname(t$parameter), p = t$p.value, ic = I(as.numeric(t$conf.int)), estimado = if (length(t$estimate) > 1) I(unname(t$estimate)) else unname(t$estimate))

# ---- t de una muestra
set.seed(15)
una <- list(
  list("una-sueno", sleep$extra[sleep$group == 1], list(), "Horas extra de sueño, grupo 1, contra 0", "Cushny y Peebles (1905); conjunto sleep de R"),
  list("una-ozono-mayor", airquality$Ozone, list(mu = 40, alternativa = "mayor", nivel = 0.9), "Ozono (37 faltantes) contra 40, cola superior, 90 %", "Chambers y col. (1983); conjunto airquality de R"),
  list("una-plantas-menor", PlantGrowth$weight[1:10], list(mu = 5.3, alternativa = "menor", nivel = 0.99), "Peso del testigo contra 5.3, cola inferior, 99 %", "Dobson (1983); conjunto PlantGrowth de R"),
  list("una-dos-datos", c(3.2, 4.1), list(mu = 1), "Solo dos observaciones (1 gl)", "Datos sintéticos"),
  list("una-grande", round(rnorm(2000, 100.3, 15), 2), list(mu = 100), "2000 valores", "Datos sintéticos"))
for (u in una) {
  op <- u[[3]]; mu <- if (is.null(op$mu)) 0 else op$mu; a <- if (is.null(op$alternativa)) "bilateral" else op$alternativa
  nv <- if (is.null(op$nivel)) 0.95 else op$nivel
  t <- t.test(u[[2]], mu = mu, alternative = alt[[a]], conf.level = nv)
  sp_caso(u[[1]], objetivo = "pruebaT.unaMuestra", titulo = u[[4]], fuente = u[[5]], datos = data.frame(x = u[[2]]),
    argumentos = list(list(columna = "x"), op), esperado = tt(t),
    codigo = sprintf('t.test(x, mu = %g, alternative = "%s", conf.level = %g)', mu, alt[[a]], nv))
}

# ---- t de dos muestras, Student y Welch
pg <- split(PlantGrowth$weight, PlantGrowth$group)
dosm <- list(
  list("dos-plantas", pg$ctrl, pg$trt1, list(), "Testigo contra tratamiento 1", "Dobson (1983); conjunto PlantGrowth de R"),
  list("dos-plantas-trt2", pg$trt2, pg$ctrl, list(mu = 0.2, alternativa = "mayor"), "Tratamiento 2 contra testigo, diferencia > 0.2", "Dobson (1983); conjunto PlantGrowth de R"),
  list("dos-insectos", InsectSprays$count[InsectSprays$spray == "C"], InsectSprays$count[InsectSprays$spray == "A"], list(alternativa = "menor", nivel = 0.9), "Insecticida C contra A: varianzas muy distintas", "Beall (1942); conjunto InsectSprays de R"),
  list("dos-desbalance", c(12.1, 13.4, 11.8), round(rnorm(40, 12, 3), 2), list(), "3 contra 40 observaciones", "Datos sintéticos"),
  list("dos-ozono-meses", airquality$Ozone[airquality$Month == 5], airquality$Ozone[airquality$Month == 8], list(nivel = 0.99), "Ozono de mayo contra agosto, con faltantes", "Chambers y col. (1983); conjunto airquality de R"))
for (u in dosm) for (vi in c(FALSE, TRUE)) {
  op <- u[[4]]; mu <- if (is.null(op$mu)) 0 else op$mu; a <- if (is.null(op$alternativa)) "bilateral" else op$alternativa
  nv <- if (is.null(op$nivel)) 0.95 else op$nivel
  t <- t.test(u[[2]], u[[3]], mu = mu, alternative = alt[[a]], conf.level = nv, var.equal = vi)
  op$varIguales <- vi
  sp_caso(paste0(u[[1]], if (vi) "-student" else "-welch"), objetivo = "pruebaT.dosMuestras", titulo = paste(u[[5]], if (vi) "· Student" else "· Welch"),
    fuente = u[[6]], datos = dos(u[[2]], u[[3]]), argumentos = list(list(columna = "x"), list(columna = "y"), op), esperado = tt(t),
    codigo = sprintf('t.test(x, y, var.equal = %s, mu = %g, alternative = "%s", conf.level = %g)', vi, mu, alt[[a]], nv))
}

# ---- t pareada
par <- list(
  list("pareada-sueno", sleep$extra[1:10], sleep$extra[11:20], list(), "Sueño extra con dos fármacos en los mismos 10 pacientes", "Cushny y Peebles (1905); conjunto sleep de R"),
  list("pareada-faltante", c(5.1, 4.8, NA, 6.2, 5.9, 5.0, 6.6), c(4.7, 4.9, 5.5, NA, 5.2, 4.1, 6.0), list(alternativa = "mayor", mu = 0.1), "Pares con faltantes (se quitan los pares incompletos)", "Datos sintéticos"))
for (u in par) {
  op <- u[[4]]; mu <- if (is.null(op$mu)) 0 else op$mu; a <- if (is.null(op$alternativa)) "bilateral" else op$alternativa
  t <- t.test(u[[2]], u[[3]], paired = TRUE, mu = mu, alternative = alt[[a]])
  sp_caso(u[[1]], objetivo = "pruebaT.pareada", titulo = u[[5]], fuente = u[[6]], datos = data.frame(x = u[[2]], y = u[[3]]),
    argumentos = list(list(columna = "x"), list(columna = "y"), op), esperado = tt(t),
    codigo = sprintf('t.test(x, y, paired = TRUE, mu = %g, alternative = "%s")', mu, alt[[a]]))
}

# ---- F de razón de varianzas
vt <- list(
  list("varianzas-plantas", pg$ctrl, pg$trt1, list(), "Testigo contra tratamiento 1"),
  list("varianzas-insectos-mayor", InsectSprays$count[InsectSprays$spray == "A"], InsectSprays$count[InsectSprays$spray == "C"], list(alternativa = "mayor", nivel = 0.9), "Insecticida A contra C, cola superior"),
  list("varianzas-desbalance-menor", c(12.1, 13.4, 11.8), round(rnorm(40, 12, 3), 2), list(alternativa = "menor", razon = 0.5), "3 contra 40, razón 0.5, cola inferior"))
for (u in vt) {
  op <- u[[4]]; a <- if (is.null(op$alternativa)) "bilateral" else op$alternativa
  nv <- if (is.null(op$nivel)) 0.95 else op$nivel; rz <- if (is.null(op$razon)) 1 else op$razon
  t <- var.test(u[[2]], u[[3]], ratio = rz, alternative = alt[[a]], conf.level = nv)
  sp_caso(u[[1]], objetivo = "pruebaT.razonVarianzas", titulo = u[[5]], fuente = "Conjuntos de R y datos sintéticos", datos = dos(u[[2]], u[[3]]),
    argumentos = list(list(columna = "x"), list(columna = "y"), op),
    esperado = list(F = unname(t$statistic), gl1 = unname(t$parameter[1]), gl2 = unname(t$parameter[2]), p = t$p.value, ic = I(as.numeric(t$conf.int)), estimado = unname(t$estimate)),
    codigo = sprintf('var.test(x, y, ratio = %g, alternative = "%s", conf.level = %g)', rz, alt[[a]], nv))
}

# ---- tamaños del efecto. El IC invierte la t no central: ncp tal que pt(t, gl, ncp) = 1 − α/2 y α/2
# (Steiger y Fouladi, 1997), resuelto con uniroot a 1e-13; g = d · J(gl), J exacta (Hedges, 1981).
J <- function(gl) exp(lgamma(gl / 2) - log(sqrt(gl / 2)) - lgamma((gl - 1) / 2))
ncp_para <- function(t, gl, prob) suppressWarnings(uniroot(function(n) pt(t, gl, n) - prob, c(t - 30, t + 30), tol = 1e-13)$root)
efecto_r <- function(x, y = NULL, mu = 0, nivel = 0.95, pareada = FALSE) {
  x <- x[!is.na(x)]
  if (!is.null(y) && !pareada) {
    y <- y[!is.na(y)]; nx <- length(x); ny <- length(y); gl <- nx + ny - 2
    s <- sqrt(((nx - 1) * var(x) + (ny - 1) * var(y)) / gl); d <- (mean(x) - mean(y) - mu) / s; f <- sqrt(1 / nx + 1 / ny)
  } else {
    if (!is.null(y)) { d0 <- x - y; x <- d0[!is.na(d0)] }
    gl <- length(x) - 1; d <- (mean(x) - mu) / sd(x); f <- 1 / sqrt(length(x))
  }
  t <- d / f; a <- (1 - nivel) / 2
  ic <- c(ncp_para(t, gl, 1 - a), ncp_para(t, gl, a)) * f
  list(d = d, g = d * J(gl), J = J(gl), gl = gl, ic_d = I(ic), ic_g = I(ic * J(gl)))
}
ef <- list(
  list("efecto-dos-plantas", pg$ctrl, pg$trt2, list(), "Testigo contra tratamiento 2 (d ≈ −1.3)"),
  list("efecto-dos-desbalance", c(12.1, 13.4, 11.8), round(rnorm(40, 12, 3), 2), list(nivel = 0.9), "3 contra 40, IC 90 %"),
  list("efecto-dos-grande", round(rnorm(300, 10, 2), 3), round(rnorm(250, 13.5, 2), 3), list(), "300 contra 250, efecto enorme (d ≈ −1.75)"),
  list("efecto-una", airquality$Ozone, NULL, list(mu = 30), "Una muestra con faltantes contra 30"),
  list("efecto-pareada", sleep$extra[1:10], sleep$extra[11:20], list(pareada = TRUE), "Pareada: d_z de las diferencias"),
  list("efecto-nulo", c(4.1, 5.2, 3.9, 4.8, 5.0), c(4.4, 4.6, 5.1, 4.2, 4.7), list(), "Efecto casi nulo con 5 por grupo"))
for (u in ef) {
  op <- u[[4]]
  sp_caso(u[[1]], objetivo = "pruebaT.efecto", titulo = u[[5]], fuente = "Conjuntos de R y datos sintéticos",
    datos = if (is.null(u[[3]])) data.frame(x = u[[2]]) else dos(u[[2]], u[[3]]),
    argumentos = c(list(list(columna = "x")), if (is.null(u[[3]])) list(NULL) else list(list(columna = "y")), list(op)),
    esperado = do.call(efecto_r, c(list(u[[2]], u[[3]]), op)),
    codigo = "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)")
}

# ---- el método completo
metodo <- function(nombre, titulo, fuente, datos, entradas, opciones, x, y = NULL, pareada = FALSE) {
  a <- if (is.null(opciones$alternativa)) "bilateral" else opciones$alternativa
  nv <- if (is.null(opciones$nivel)) 0.95 else opciones$nivel; mu <- if (is.null(opciones$mu)) 0 else opciones$mu
  vi <- isTRUE(opciones$varIguales)
  t <- if (is.null(y)) t.test(x, mu = mu, alternative = alt[[a]], conf.level = nv)
       else t.test(x, y, paired = pareada, var.equal = vi, mu = mu, alternative = alt[[a]], conf.level = nv)
  nrm <- function(v) { v <- v[!is.na(v)]; s <- shapiro.test(v); list(W = unname(s$statistic), p = s$p.value) }
  esp <- list(prueba = list(t = unname(t$statistic), gl = unname(t$parameter), p = t$p.value, ic = I(as.numeric(t$conf.int))),
    efecto = efecto_r(x, y, mu, nv, pareada)[c("d", "g", "ic_d", "ic_g")],
    normalidad = if (is.null(y)) list(nrm(x)) else if (pareada) list(nrm(x - y)) else list(nrm(x), nrm(y)))
  if (!is.null(y) && !pareada) {
    o <- t.test(x, y, var.equal = !vi, mu = mu, alternative = alt[[a]], conf.level = nv)
    v <- var.test(x, y, conf.level = nv)
    esp$otra <- list(t = unname(o$statistic), gl = unname(o$parameter), p = o$p.value)
    esp$varianzas <- list(F = unname(v$statistic), p = v$p.value)
  }
  sp_caso(nombre, objetivo = "prueba-t", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos,
    entradas = entradas, opciones = opciones, esperado = esp, paquetes = "stats",
    codigo = "t.test(...); var.test(x, y); shapiro.test(...); IC del efecto por la t no central")
}
pg2 <- droplevels(PlantGrowth[PlantGrowth$group != "trt2", ])
metodo("metodo-dos-plantas", "Peso: testigo contra tratamiento 1 (Welch)", "Dobson (1983); conjunto PlantGrowth de R", pg2,
  list(modo = "independientes", respuesta = "weight", grupo = "group"), list(), pg$ctrl, pg$trt1)
metodo("metodo-niveles-elegidos", "Peso: tratamiento 2 contra testigo, Student, cola superior", "Dobson (1983); conjunto PlantGrowth de R", PlantGrowth,
  list(modo = "independientes", respuesta = "weight", grupo = "group", niveles = I(c("trt2", "ctrl"))), list(varIguales = TRUE, alternativa = "mayor"), pg$trt2, pg$ctrl)
metodo("metodo-pareada", "Sueño extra con dos fármacos (pareada)", "Cushny y Peebles (1905); conjunto sleep de R",
  data.frame(farmaco1 = sleep$extra[1:10], farmaco2 = sleep$extra[11:20]),
  list(modo = "pareadas", antes = "farmaco1", despues = "farmaco2"), list(), sleep$extra[1:10], sleep$extra[11:20], pareada = TRUE)
metodo("metodo-una", "Ozono contra 40, IC 90 %", "Chambers y col. (1983); conjunto airquality de R", airquality["Ozone"],
  list(modo = "una", variable = "Ozone"), list(mu = 40, nivel = 0.9), airquality$Ozone)
