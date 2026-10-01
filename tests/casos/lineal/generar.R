# Modelo lineal: matriz de diseño, resumen (coeficientes, EE, t, p, R², F) y análisis de
# varianza con sumas de cuadrados tipo I (anova), II y III (car::Anova).
# El tipo III se calcula como lo pide la teoría: con contrastes de suma cero.
suppressPackageStartupMessages(library(car))

intercepto <- function(x) sub("^\\(Intercept\\)$", "(Intercepto)", x)

# ---- utilidades que replican la salida de SigmaPro
matriz <- function(f, d, contrastes = NULL) {
  mf <- model.frame(f, d, drop.unused.levels = TRUE)
  X <- model.matrix(f, mf, contrasts.arg = contrastes)
  list(columnas = I(intercepto(colnames(X))), asignacion = I(attr(X, "assign")),
       valores = lapply(seq_len(ncol(X)), function(j) I(unname(X[, j]))), n = nrow(X))
}
resumen <- function(m) {
  s <- summary(m)
  b <- coef(m)
  tab <- matrix(NA_real_, length(b), 4, dimnames = list(names(b), NULL))
  tab[rownames(s$coefficients), ] <- s$coefficients
  f <- if (!is.null(s$fstatistic)) s$fstatistic else c(value = NA, numdf = NA, dendf = NA)
  list(coeficientes = list(nombre = I(intercepto(names(b))), estimado = I(unname(b)), ee = I(unname(tab[, 2])),
                           t = I(unname(tab[, 3])), p = I(unname(tab[, 4]))),
       sigma = s$sigma, gl_residual = m$df.residual, n = length(m$residuals), rango = m$rank,
       r2 = s$r.squared, r2_ajustada = s$adj.r.squared,
       F = list(valor = unname(f[1]), gl1 = unname(f[2]), gl2 = unname(f[3]),
                p = unname(pf(f[1], f[2], f[3], lower.tail = FALSE))))
}
tabla_anova <- function(a) {
  a <- as.data.frame(a)
  if ("Df" %in% names(a)) a <- a[!is.na(a$Df) & a$Df > 0, ]  # sin filas de 0 gl (términos confundidos)
  fuente <- intercepto(trimws(rownames(a)))
  fuente[fuente == "Residuals"] <- "Residuales"
  sc <- if ("Sum Sq" %in% names(a)) a[["Sum Sq"]] else a[["Sum Sq"]]
  list(fuente = I(fuente), gl = I(a$Df), sc = I(sc), cm = I(sc / a$Df),
       F = I(a[["F value"]]), p = I(a[["Pr(>F)"]]))
}
anova_sum <- function(f, d) {
  m <- lm(f, d, contrasts = setNames(rep(list("contr.sum"), sum(sapply(d, is.factor))), names(d)[sapply(d, is.factor)]))
  Anova(m, type = 3)
}

caso_resumen <- function(nombre, titulo, fuente, f, d, contrastes = NULL, clase = "A") {
  m <- lm(f, d, contrasts = contrastes)
  sp_caso(paste0("resumen-", nombre), objetivo = "lineal.resumenDe", titulo = titulo, fuente = fuente, clase = clase,
    datos = d, argumentos = list(list(tabla = TRUE), deparse(f), list(contrastes = lapply(contrastes, cont_js))),
    esperado = resumen(m), paquetes = "stats", codigo = sprintf("summary(lm(%s))", deparse(f)))
}
cont_js <- function(x) c(contr.treatment = "tratamiento", contr.sum = "suma", contr.helmert = "helmert", contr.poly = "polinomial")[[x]]
caso_anova <- function(nombre, titulo, fuente, f, d, tipo) {
  esperado <- switch(as.character(tipo),
    "1" = tabla_anova(anova(lm(f, d))),
    "2" = tabla_anova(Anova(lm(f, d), type = 2)),
    "3" = tabla_anova(anova_sum(f, d)))
  codigo <- switch(as.character(tipo),
    "1" = sprintf("anova(lm(%s))", deparse(f)),
    "2" = sprintf("car::Anova(lm(%s), type = 2)", deparse(f)),
    "3" = sprintf("car::Anova(lm(%s, contrasts = <contr.sum en todos los factores>), type = 3)", deparse(f)))
  sp_caso(sprintf("anova%d-%s", tipo, nombre), objetivo = "lineal.anova", titulo = titulo, fuente = fuente,
    datos = d, argumentos = list(list(tabla = TRUE), deparse(f), list(tipo = tipo)),
    esperado = esperado, paquetes = if (tipo == 1) "stats" else c("stats", "car"), codigo = codigo)
}

# ---- conjuntos
wb <- warpbreaks
npk2 <- npk
moore <- carData::Moore
moore$fcategory <- factor(moore$fcategory, levels = c("low", "medium", "high"))
moore$partner.status <- factor(moore$partner.status, levels = c("low", "high"))
mt <- data.frame(mpg = mtcars$mpg, wt = mtcars$wt, hp = mtcars$hp,
                 cyl = factor(mtcars$cyl), am = factor(mtcars$am, labels = c("auto", "manual")))
aq <- airquality[c("Ozone", "Solar.R", "Wind", "Temp")]
set.seed(7)
col <- data.frame(x1 = round(rnorm(20, 10, 2), 2), x2 = round(rnorm(20, 5, 1), 2))
col$x3 <- col$x1 + col$x2
col$y <- round(3 + 0.8 * col$x1 - 1.2 * col$x2 + rnorm(20, 0, 0.5), 3)

f_wb <- breaks ~ wool * tension
f_npk <- yield ~ block + N * P * K
f_moore <- conformity ~ fcategory * partner.status
f_mt <- mpg ~ wt + cyl + am
f_mt2 <- mpg ~ wt * am

# ---- matriz de diseño (codificación de factores y nombres de columnas)
mat <- function(nombre, titulo, f, d, contrastes = NULL, fuente) {
  sp_caso(paste0("matriz-", nombre), objetivo = "formula.matrizComoColumnas", titulo = titulo, fuente = fuente,
    datos = d, argumentos = list(list(tabla = TRUE), deparse(f), list(contrastes = lapply(contrastes, cont_js))),
    esperado = matriz(f, d, contrastes), codigo = sprintf("model.matrix(%s)", deparse(f)))
}
mat("factorial", "Factorial 2 × 3 con contrastes de tratamiento", f_wb, wb, fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("suma-y-helmert", "Contrastes de suma cero y de Helmert", f_wb, wb, list(wool = "contr.sum", tension = "contr.helmert"),
    fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("polinomial", "Contrastes polinomiales ortogonales (.L, .Q)", breaks ~ tension, wb, list(tension = "contr.poly"),
    fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("anidado", "Factor anidado: tension dentro de wool (a/b)", breaks ~ wool / tension, wb, fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("sin-intercepto", "Sin intercepto: el primer factor con indicadoras, el segundo con contrastes", breaks ~ 0 + wool + tension, wb,
    fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("solo-interaccion", "Interacción sin efectos principales (indicadoras)", breaks ~ wool:tension, wb, fuente = "Tippett (1950); conjunto warpbreaks de R")
mat("pendientes", "Covariable con pendientes por grupo (x + x:a)", mpg ~ wt + wt:am, mt, fuente = "Henderson y Velleman (1981); conjunto mtcars de R")
mat("potencia", "Interacciones hasta orden 2 de tres factores ((a + b + c)^2)", yield ~ (N + P + K)^2, npk2,
    fuente = "Yates (1935); conjunto npk de R")
mat("faltantes", "Filas con faltantes omitidas", Ozone ~ Solar.R + Wind, aq, fuente = "Chambers y col. (1983); conjunto airquality de R")

# ---- resumen
caso_resumen("factorial", "Factorial 2 × 3: coeficientes, EE, t, p, R² y F", "Tippett (1950); conjunto warpbreaks de R", f_wb, wb)
caso_resumen("alias", "Factorial en bloques con N:P:K confundido con bloques (coeficiente no estimable)",
  "Yates (1935); conjunto npk de R", f_npk, npk2)
caso_resumen("regresion-con-factor", "Regresión con covariable y dos factores", "Henderson y Velleman (1981); conjunto mtcars de R", f_mt, mt)
caso_resumen("faltantes", "Regresión múltiple con 42 filas incompletas omitidas", "Chambers y col. (1983); conjunto airquality de R",
  Ozone ~ Solar.R + Wind + Temp, aq)
caso_resumen("colineal", "Colinealidad exacta: x3 = x1 + x2 queda sin estimar", "Datos sintéticos", y ~ x1 + x2 + x3, col)
caso_resumen("suma-cero", "Contrastes de suma cero", "Fox y Weisberg (2019); conjunto Moore de carData", f_moore, moore,
  list(fcategory = "contr.sum", partner.status = "contr.sum"))
caso_resumen("sin-intercepto", "Modelo sin intercepto", "Tippett (1950); conjunto warpbreaks de R", breaks ~ 0 + tension, wb)

# ---- análisis de varianza
for (tipo in 1:3) {
  caso_anova("factorial", sprintf("Factorial 2 × 3 balanceado, SC tipo %d (las tres coinciden)", tipo),
    "Tippett (1950); conjunto warpbreaks de R", f_wb, wb, tipo)
  caso_anova("desbalanceado", sprintf("Factorial 3 × 2 desbalanceado, SC tipo %d", tipo),
    "Fox y Weisberg (2019); conjunto Moore de carData", f_moore, moore, tipo)
  caso_anova("covariable-y-factores", sprintf("Covariable y dos factores desbalanceados, SC tipo %d", tipo),
    "Henderson y Velleman (1981); conjunto mtcars de R", f_mt, mt, tipo)
  caso_anova("pendientes", sprintf("Covariable por factor (pendientes distintas), SC tipo %d", tipo),
    "Henderson y Velleman (1981); conjunto mtcars de R", f_mt2, mt, tipo)
}
caso_anova("alias", "Factorial en bloques con N:P:K confundido, SC tipo 1", "Yates (1935); conjunto npk de R", f_npk, npk2, 1)
caso_anova("alias", "Factorial en bloques con N:P:K confundido, SC tipo 2 (por comparación de modelos)", "Yates (1935); conjunto npk de R", f_npk, npk2, 2)
