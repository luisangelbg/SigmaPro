# Regresión lineal simple, múltiple y polinomial: coeficientes, ANOVA, falta de ajuste, ajuste, predicción,
# influencia, pruebas de los supuestos, colinealidad y selección de variables.
suppressPackageStartupMessages({ library(lmtest); library(car); library(leaps) })

F_CARS <- "Ezekiel (1930), Methods of Correlation Analysis; conjunto cars de R"
F_TREES <- "Atkinson (1985), Plots, Transformations and Regression; conjunto trees de R"
F_STACK <- "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R"
F_SWISS <- "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R"
F_MTCARS <- "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R"
F_LONG <- "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R"
F_WOMEN <- "The World Almanac and Book of Facts (1975); conjunto women de R"
F_AIR <- "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R"

v <- function(x) I(unname(as.numeric(x)))
modelo <- function(datos, y, xs, grado = 1) {
  rhs <- if (grado > 1) paste(c(xs[1], sprintf("I(%s^%d)", xs[1], 2:grado)), collapse = " + ") else paste(xs, collapse = " + ")
  lm(as.formula(paste(y, "~", rhs)), data = datos)
}

# coeficientes, ANOVA, falta de ajuste, SC secuenciales y parciales, ajuste, predicción y óptimo
ref_analizar <- function(m, nivel = 0.95, nuevos = NULL, grado = 1) {
  s <- summary(m); cf <- coef(s); ci <- confint(m, level = nivel)
  X <- model.matrix(m); y <- model.response(model.frame(m)); n <- nrow(X); p <- ncol(X)
  fs <- s$fstatistic; a1 <- anova(m); k <- nrow(a1) - 1; a2 <- car::Anova(m, type = 2)
  out <- list(
    coeficientes = list(estimado = v(cf[, 1]), ee = v(cf[, 2]), t = v(cf[, 3]), p = v(cf[, 4]), ic_inf = v(ci[, 1]), ic_sup = v(ci[, 2])),
    anova = list(regresion = list(gl = unname(fs[2]), sc = sum((fitted(m) - mean(y))^2), F = unname(fs[1]), p = unname(pf(fs[1], fs[2], fs[3], lower.tail = FALSE))),
                 error = list(gl = df.residual(m), sc = deviance(m), cm = deviance(m) / df.residual(m)), total = list(gl = n - 1, sc = sum((y - mean(y))^2))),
    terminos = list(gl = v(a1$Df[1:k]), sc1 = v(a1$`Sum Sq`[1:k]), F1 = v(a1$`F value`[1:k]), p1 = v(a1$`Pr(>F)`[1:k]),
                    sc2 = v(a2$`Sum Sq`[1:k]), F2 = v(a2$`F value`[1:k]), p2 = v(a2$`Pr(>F)`[1:k])),
    ajuste = list(r2 = s$r.squared, r2_ajustada = s$adj.r.squared, sigma = s$sigma, cv = 100 * s$sigma / mean(y),
                  logLik = as.numeric(logLik(m)), aic = AIC(m), bic = BIC(m)))
  if (grado == 1) out$coeficientes$beta <- v(c(NA, coef(m)[-1] * apply(X[, -1, drop = FALSE], 2, sd) / sd(y)))
  # falta de ajuste: el modelo contra uno con una media por cada combinación de valores de x
  g <- interaction(as.data.frame(X[, -1, drop = FALSE]), drop = TRUE)
  if (nlevels(g) < n && nlevels(g) > p) {
    dd <- model.frame(m); dd$g <- g
    af <- anova(m, lm(update(formula(m), . ~ g), data = dd))
    out$falta_ajuste <- list(grupos = nlevels(g), falta = list(gl = af$Df[2], sc = af$`Sum of Sq`[2], F = af$F[2], p = af$`Pr(>F)`[2]), puro = list(gl = af$Res.Df[2], sc = af$RSS[2]))
  } else out$falta_ajuste <- NA
  if (!is.null(nuevos)) {
    pc <- predict(m, nuevos, interval = "confidence", level = nivel, se.fit = TRUE)
    pp <- predict(m, nuevos, interval = "prediction", level = nivel)
    out$predicciones <- list(ajuste = v(pc$fit[, 1]), ee = v(pc$se.fit), ic_inf = v(pc$fit[, 2]), ic_sup = v(pc$fit[, 3]), ip_inf = v(pp[, 2]), ip_sup = v(pp[, 3]))
  }
  if (grado %in% 2:3) {
    b <- unname(coef(m)); x <- X[, 2]; ev <- function(z) sum(b * z^(0:grado))
    if (grado == 2) {
      xo <- -b[2] / (2 * b[3]); out$optimo <- list(x = xo, y = ev(xo), tipo = if (b[3] < 0) "maximo" else "minimo", dentro = xo >= min(x) && xo <= max(x))
    } else {
      r <- polyroot(c(b[2], 2 * b[3], 3 * b[4])); r <- sort(Re(r[abs(Im(r)) <= 1e-8 * pmax(1, abs(Re(r)))]))   # solo raíces reales
      pts <- lapply(r, function(z) list(x = z, y = ev(z), tipo = if (6 * b[4] * z + 2 * b[3] < 0) "maximo" else "minimo", dentro = z >= min(x) && z <= max(x)))
      den <- Filter(function(pt) pt$dentro, pts); mx <- Filter(function(pt) pt$tipo == "maximo", den)
      out$optimo <- if (length(mx)) mx[[1]] else if (length(den)) den[[1]] else NA
    }
  }
  out
}
caso_analizar <- function(nombre, titulo, fuente, datos, y, xs, nivel = 0.95, predecir = "", nuevos = NULL, grado = 1) {
  m <- modelo(datos, y, xs, grado)
  sp_caso(nombre, objetivo = "reg.analizarDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list(nivel = nivel, alfa = 0.05, predecir = predecir, grado = grado)),
    esperado = ref_analizar(m, nivel, nuevos, grado), paquetes = c("stats", "car"),
    codigo = sprintf("lm(%s); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))", deparse(formula(m))))
}

cars2 <- data.frame(dist = cars$dist, speed = cars$speed)
caso_analizar("simple-cars", "Regresión simple con repeticiones de x (falta de ajuste) y predicción", F_CARS, cars2, "dist", "speed",
  predecir = "10 21.5", nuevos = data.frame(speed = c(10, 21.5)))
trees2 <- data.frame(volumen = trees$Volume, diametro = trees$Girth, altura = trees$Height)
caso_analizar("multiple-arboles", "Dos predictores, IC al 90 % y predicción", F_TREES, trees2, "volumen", c("diametro", "altura"), nivel = 0.9,
  predecir = "8.3 70\n12,5 80\n17 85", nuevos = data.frame(diametro = c(8.3, 12.5, 17), altura = c(70, 80, 85)))
stack2 <- data.frame(perdida = stackloss$stack.loss, aire = stackloss$Air.Flow, agua = stackloss$Water.Temp, acido = stackloss$Acid.Conc.)
caso_analizar("multiple-stackloss", "Tres predictores (datos clásicos de influencia)", F_STACK, stack2, "perdida", c("aire", "agua", "acido"))
long2 <- longley[c("Employed", "GNP.deflator", "GNP", "Unemployed", "Armed.Forces", "Population", "Year")]
caso_analizar("multiple-longley", "Seis predictores muy colineales (prueba de exactitud numérica)", F_LONG, long2, "Employed", names(long2)[-1])
swiss2 <- swiss
caso_analizar("multiple-swiss", "Cinco predictores", F_SWISS, swiss2, "Fertility", names(swiss2)[-1])
air2 <- airquality[c("Ozone", "Solar.R", "Wind", "Temp")]
caso_analizar("multiple-faltantes", "Tres predictores con faltantes (filas incompletas fuera)", F_AIR, air2, "Ozone", c("Solar.R", "Wind", "Temp"))
women2 <- data.frame(peso = women$weight, estatura = women$height)
caso_analizar("polinomial-women-2", "Polinomio de grado 2", F_WOMEN, women2, "peso", "estatura", grado = 2, predecir = "60 70.5", nuevos = data.frame(estatura = c(60, 70.5)))
caso_analizar("polinomial-women-3", "Polinomio de grado 3", F_WOMEN, women2, "peso", "estatura", grado = 3)
set.seed(81)
mz <- data.frame(dosis = rep(c(0, 40, 80, 120, 160, 200), each = 4))
mz$rend <- round(3.1 + 0.032 * mz$dosis - 0.00011 * mz$dosis^2 + rnorm(24, 0, 0.25), 2)
mz <- mz[c("rend", "dosis")]
caso_analizar("polinomial-dosis", "Respuesta a la dosis: cuadrática con repeticiones y dosis óptima", "Datos sintéticos", mz, "rend", "dosis", grado = 2,
  predecir = "100", nuevos = data.frame(dosis = 100))
set.seed(83)
cr <- data.frame(dias = rep(seq(10, 100, by = 10), each = 3))
cr$altura <- round(5 + 0.2 * cr$dias + 0.012 * cr$dias^2 - 0.0001 * cr$dias^3 + rnorm(30, 0, 2), 1)
cr <- cr[c("altura", "dias")]
caso_analizar("polinomial-cubica", "Cúbica con máximo dentro de los datos", "Datos sintéticos", cr, "altura", "dias", grado = 3)

# influencia: influence.measures y sus criterios
ref_influencia <- function(m) {
  im <- influence.measures(m); inf <- im$infmat; k <- m$rank; isf <- im$is.inf; isf[is.na(isf)] <- FALSE
  list(palanca = v(inf[, "hat"]), rstandard = v(rstandard(m)), rstudent = v(rstudent(m)), cook = v(inf[, "cook.d"]), dffits = v(inf[, "dffit"]), covratio = v(inf[, "cov.r"]),
       dfbetas = lapply(1:k, function(j) v(inf[, j])), sigma_i = v(influence(m)$sigma), influyente = I(unname(apply(isf, 1, any))),
       banderas = list(dfbetas = I(unname(apply(isf[, 1:k, drop = FALSE], 1, any))), dffits = I(unname(isf[, k + 1])), covratio = I(unname(isf[, k + 2])),
                       cook = I(unname(isf[, k + 3])), palanca = I(unname(isf[, k + 4]))))
}
caso_influencia <- function(nombre, titulo, fuente, datos, y, xs, grado = 1) {
  m <- modelo(datos, y, xs, grado)
  sp_caso(nombre, objetivo = "reg.influenciaDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list(grado = grado)), esperado = ref_influencia(m),
    codigo = sprintf("influence.measures(lm(%s)); rstandard; rstudent; influence()$sigma", deparse(formula(m))))
}
caso_influencia("influencia-cars", "Regresión simple", F_CARS, cars2, "dist", "speed")
caso_influencia("influencia-stackloss", "Tres predictores", F_STACK, stack2, "perdida", c("aire", "agua", "acido"))
caso_influencia("influencia-arboles", "Dos predictores", F_TREES, trees2, "volumen", c("diametro", "altura"))
caso_influencia("influencia-swiss", "Cinco predictores", F_SWISS, swiss2, "Fertility", names(swiss2)[-1])
caso_influencia("influencia-faltantes", "Con filas incompletas fuera", F_AIR, air2, "Ozone", c("Solar.R", "Wind", "Temp"))
caso_influencia("influencia-polinomial", "Polinomio de grado 2", F_WOMEN, women2, "peso", "estatura", grado = 2)

# pruebas de los supuestos
ref_pruebas <- function(m) {
  sw <- shapiro.test(residuals(m)); bp <- bptest(m); rs <- resettest(m); dw <- dwtest(m)
  list(shapiro = list(W = unname(sw$statistic), p = sw$p.value), breusch_pagan = list(BP = unname(bp$statistic), gl = unname(bp$parameter), p = bp$p.value),
       reset = list(F = unname(rs$statistic), gl1 = unname(rs$parameter[1]), gl2 = unname(rs$parameter[2]), p = rs$p.value),
       durbin_watson = list(DW = unname(dw$statistic), p = dw$p.value))
}
caso_pruebas <- function(nombre, titulo, fuente, datos, y, xs, grado = 1) {
  m <- modelo(datos, y, xs, grado)
  sp_caso(nombre, objetivo = "reg.pruebasDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list(grado = grado)), esperado = ref_pruebas(m), paquetes = c("stats", "lmtest"),
    codigo = sprintf("m <- lm(%s); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)", deparse(formula(m))))
}
caso_pruebas("pruebas-cars", "Regresión simple (Durbin-Watson exacto)", F_CARS, cars2, "dist", "speed")
caso_pruebas("pruebas-arboles", "Dos predictores", F_TREES, trees2, "volumen", c("diametro", "altura"))
caso_pruebas("pruebas-stackloss", "Tres predictores", F_STACK, stack2, "perdida", c("aire", "agua", "acido"))
caso_pruebas("pruebas-swiss", "Cinco predictores", F_SWISS, swiss2, "Fertility", names(swiss2)[-1])
caso_pruebas("pruebas-faltantes", "111 datos: Durbin-Watson por la aproximación normal", F_AIR, air2, "Ozone", c("Solar.R", "Wind", "Temp"))
caso_pruebas("pruebas-longley", "Seis predictores colineales", F_LONG, long2, "Employed", names(long2)[-1])
caso_pruebas("pruebas-polinomial", "Polinomio de grado 2 con repeticiones", "Datos sintéticos", mz, "rend", "dosis", grado = 2)

# colinealidad: VIF e índices de condición de Belsley
ref_colinealidad <- function(m) {
  X <- model.matrix(m); Xs <- sweep(X, 2, sqrt(colSums(X^2)), "/"); sv <- svd(Xs)
  phi <- sweep(sv$v^2, 2, sv$d^2, "/"); prop <- t(phi / rowSums(phi))
  list(vif = v(car::vif(m)), indices = v(sv$d[1] / sv$d), valores_singulares = v(sv$d), proporciones = lapply(seq_len(nrow(prop)), function(j) v(prop[j, ])), kappa = max(sv$d) / min(sv$d))
}
caso_colinealidad <- function(nombre, titulo, fuente, datos, y, xs) {
  m <- modelo(datos, y, xs)
  sp_caso(nombre, objetivo = "reg.colinealidadDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list()), esperado = ref_colinealidad(m), paquetes = c("stats", "car"),
    codigo = sprintf("car::vif(lm(%s)); svd de la matriz del modelo con columnas de longitud 1", deparse(formula(m))))
}
caso_colinealidad("colinealidad-longley", "Seis predictores muy colineales", F_LONG, long2, "Employed", names(long2)[-1])
caso_colinealidad("colinealidad-swiss", "Cinco predictores", F_SWISS, swiss2, "Fertility", names(swiss2)[-1])
caso_colinealidad("colinealidad-arboles", "Dos predictores", F_TREES, trees2, "volumen", c("diametro", "altura"))
caso_colinealidad("colinealidad-stackloss", "Tres predictores", F_STACK, stack2, "perdida", c("aire", "agua", "acido"))

# selección paso a paso: step() por AIC; por valor p con add1/drop1 (test = "F")
ajusta <- function(d2, y, vs) lm(as.formula(paste(y, "~", if (length(vs)) paste(vs, collapse = " + ") else "1")), data = d2)
final_de <- function(m) { cf <- coef(summary(m)); list(estimado = v(cf[, 1]), ee = v(cf[, 2]), t = v(cf[, 3]), p = v(cf[, 4]), r2 = summary(m)$r.squared, r2_ajustada = summary(m)$adj.r.squared, aic = extractAIC(m)[2]) }
ref_pasos_aic <- function(datos, y, xs, direccion) {
  d2 <- model.frame(ajusta(datos, y, xs))
  s <- if (direccion == "adelante") step(ajusta(d2, y, character(0)), scope = as.formula(paste("~", paste(xs, collapse = " + "))), direction = "forward", trace = 0)
       else step(ajusta(d2, y, xs), direction = if (direccion == "atras") "backward" else "both", trace = 0)
  an <- s$anova
  pasos <- lapply(seq_len(nrow(an)), function(i) {
    st <- trimws(as.character(unclass(an$Step))[i])
    list(accion = if (st == "") NA else if (startsWith(st, "+")) "entra" else "sale", variable = if (st == "") NA else trimws(substring(st, 2)),
         gl = an$`Resid. Df`[i], rss = an$`Resid. Dev`[i], aic = an$AIC[i])
  })
  list(pasos = pasos, finales = I(attr(terms(s), "term.labels")), final = final_de(s))
}
ref_pasos_p <- function(datos, y, xs, direccion, entrada, salida) {
  d2 <- model.frame(ajusta(datos, y, xs))
  registro <- function(accion, var, vs, Fv = NULL, pv = NULL) {
    m <- ajusta(d2, y, vs)
    c(list(accion = accion, variable = var, gl = df.residual(m), rss = deviance(m), aic = extractAIC(m)[2], r2_ajustada = summary(m)$adj.r.squared), if (!is.null(Fv)) list(F = Fv, p = pv))
  }
  entra <- function(vs) {
    cand <- setdiff(xs, vs); if (!length(cand)) return(NULL)
    a <- add1(ajusta(d2, y, vs), scope = as.formula(paste("~ . +", paste(cand, collapse = " + "))), test = "F")[-1, ]
    i <- which.min(a$`Pr(>F)`); list(var = rownames(a)[i], F = a$`F value`[i], p = a$`Pr(>F)`[i])
  }
  sale <- function(vs) {
    a <- drop1(ajusta(d2, y, vs), test = "F")[-1, ]
    i <- which.max(a$`Pr(>F)`); list(var = rownames(a)[i], F = a$`F value`[i], p = a$`Pr(>F)`[i])
  }
  vs <- if (direccion == "atras") xs else character(0)
  pasos <- list(registro(NA, NA, vs))
  quitar <- function() {
    repeat {
      if (!length(vs)) break
      s <- sale(vs); if (!(s$p > salida)) break
      vs <<- setdiff(vs, s$var); pasos[[length(pasos) + 1]] <<- registro("sale", s$var, vs, s$F, s$p)
    }
  }
  if (direccion == "atras") quitar() else {
    for (it in seq_len(4 * length(xs) + 10)) {
      x <- entra(vs); if (is.null(x) || !(x$p < entrada)) break
      vs <- c(vs, x$var); pasos[[length(pasos) + 1]] <- registro("entra", x$var, vs, x$F, x$p)
      if (direccion == "mixta") quitar()
    }
  }
  list(pasos = pasos, finales = I(vs), final = final_de(ajusta(d2, y, vs)))
}
caso_pasos <- function(nombre, titulo, fuente, datos, y, xs, criterio, direccion, entrada = 0.05, salida = 0.1) {
  esp <- if (criterio == "aic") ref_pasos_aic(datos, y, xs, direccion) else ref_pasos_p(datos, y, xs, direccion, entrada, salida)
  sp_caso(nombre, objetivo = "reg.pasosDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list(criterio = criterio, direccion = direccion, entrada = entrada, salida = salida)),
    esperado = esp, codigo = if (criterio == "aic") sprintf("step(…, direction = \"%s\")$anova", direccion) else sprintf("add1/drop1(…, test = \"F\") con entrada %s y salida %s", entrada, salida))
}
mt <- mtcars
caso_pasos("pasos-aic-ambas-swiss", "AIC en ambas direcciones", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], "aic", "ambas")
caso_pasos("pasos-aic-atras-swiss", "AIC hacia atrás", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], "aic", "atras")
caso_pasos("pasos-aic-adelante-swiss", "AIC hacia adelante", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], "aic", "adelante")
caso_pasos("pasos-aic-ambas-mtcars", "AIC en ambas direcciones con 10 candidatos", F_MTCARS, mt, "mpg", names(mt)[-1], "aic", "ambas")
caso_pasos("pasos-aic-adelante-mtcars", "AIC hacia adelante con 10 candidatos", F_MTCARS, mt, "mpg", names(mt)[-1], "aic", "adelante")
caso_pasos("pasos-p-adelante-swiss", "Valor p hacia adelante", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], "p", "adelante")
caso_pasos("pasos-p-atras-swiss", "Valor p hacia atrás", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], "p", "atras")
caso_pasos("pasos-p-mixta-mtcars", "Valor p mixta (0.15 para entrar y salir)", F_MTCARS, mt, "mpg", names(mt)[-1], "p", "mixta", 0.15, 0.15)
caso_pasos("pasos-p-atras-longley", "Valor p hacia atrás con colinealidad", F_LONG, long2, "Employed", names(long2)[-1], "p", "atras", 0.05, 0.05)
caso_pasos("pasos-p-mixta-faltantes", "Valor p mixta con filas incompletas", F_AIR, air2, "Ozone", c("Solar.R", "Wind", "Temp"), "p", "mixta", 0.1, 0.1)

# mejores subconjuntos: leaps::regsubsets exhaustivo
ref_subconjuntos <- function(datos, y, xs, nb) {
  s <- summary(regsubsets(as.formula(paste(y, "~", paste(xs, collapse = " + "))), data = datos, nvmax = length(xs), nbest = nb, method = "exhaustive"))
  w <- s$which[, -1, drop = FALSE]; tam <- as.integer(rownames(s$which)); rango <- ave(tam, tam, FUN = seq_along); pr <- rango == 1
  list(filas = lapply(seq_len(nrow(w)), function(i) list(tamano = tam[i], rango = rango[i], variables = I(xs[w[i, ]]), rss = s$rss[i], r2 = s$rsq[i], r2_ajustada = s$adjr2[i], cp = s$cp[i], bic = s$bic[i])),
       elegido = list(r2_ajustada = tam[pr][which.max(s$adjr2[pr])], cp = tam[pr][which.min(s$cp[pr])], bic = tam[pr][which.min(s$bic[pr])]))
}
caso_subconjuntos <- function(nombre, titulo, fuente, datos, y, xs, nb = 1) {
  sp_caso(nombre, objetivo = "reg.subconjuntosDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y, predictores = I(xs)), list(mejores = nb)), esperado = ref_subconjuntos(datos, y, xs, nb), paquetes = c("stats", "leaps"),
    codigo = sprintf("summary(leaps::regsubsets(…, nvmax = %d, nbest = %d))", length(xs), nb))
}
caso_subconjuntos("subconjuntos-swiss", "Cinco candidatos", F_SWISS, swiss2, "Fertility", names(swiss2)[-1])
caso_subconjuntos("subconjuntos-swiss-2", "Los dos mejores de cada tamaño", F_SWISS, swiss2, "Fertility", names(swiss2)[-1], 2)
caso_subconjuntos("subconjuntos-mtcars", "Diez candidatos (1023 modelos)", F_MTCARS, mt, "mpg", names(mt)[-1])
caso_subconjuntos("subconjuntos-longley", "Seis candidatos colineales", F_LONG, long2, "Employed", names(long2)[-1], 3)

# los métodos completos
m_st <- modelo(stack2, "perdida", c("aire", "agua", "acido"))
r_st <- ref_analizar(m_st); i_st <- ref_influencia(m_st); p_st <- ref_pruebas(m_st); c_st <- ref_colinealidad(m_st)
sp_caso("metodo-regresion-stackloss", objetivo = "regresion-lineal", tipo = "metodo", titulo = "Regresión múltiple con diagnóstico completo", fuente = F_STACK, datos = stack2,
  entradas = list(respuesta = "perdida", predictores = I(c("aire", "agua", "acido"))), opciones = list(nivel = 0.95, alfa = 0.05),
  esperado = list(coeficientes = r_st$coeficientes, anova = r_st$anova, ajuste = r_st$ajuste, pruebas = p_st,
                  influencia = list(cook = i_st$cook, dffits = i_st$dffits, influyente = i_st$influyente, n_influyentes = sum(i_st$influyente)),
                  colinealidad = list(vif = c_st$vif, indices = c_st$indices)),
  paquetes = c("stats", "car", "lmtest"), codigo = "lm(perdida ~ aire + agua + acido); summary; anova; AIC; influence.measures; bptest; resettest; dwtest; vif; svd")
m_mz <- modelo(mz, "rend", "dosis", 2); r_mz <- ref_analizar(m_mz, grado = 2)
sp_caso("metodo-polinomial-dosis", objetivo = "regresion-polinomial", tipo = "metodo", titulo = "Cuadrática con dosis óptima y falta de ajuste", fuente = "Datos sintéticos", datos = mz,
  entradas = list(respuesta = "rend", predictores = "dosis"), opciones = list(grado = 2, nivel = 0.95, alfa = 0.05),
  esperado = list(coeficientes = r_mz$coeficientes, terminos = r_mz$terminos, falta_ajuste = r_mz$falta_ajuste, optimo = r_mz$optimo, pruebas = ref_pruebas(m_mz)),
  paquetes = c("stats", "car", "lmtest"), codigo = "lm(rend ~ poly(dosis, 2, raw = TRUE)); anova; óptimo −b1/(2·b2)")
sp_caso("metodo-pasos-swiss", objetivo = "seleccion-pasos", tipo = "metodo", titulo = "Paso a paso por AIC en ambas direcciones", fuente = F_SWISS, datos = swiss2,
  entradas = list(respuesta = "Fertility", predictores = I(names(swiss2)[-1])), opciones = list(criterio = "aic", direccion = "ambas"),
  esperado = ref_pasos_aic(swiss2, "Fertility", names(swiss2)[-1], "ambas"), codigo = "step(lm(Fertility ~ ., data = swiss))")
sp_caso("metodo-subconjuntos-mtcars", objetivo = "mejores-subconjuntos", tipo = "metodo", titulo = "Mejores subconjuntos con diez candidatos", fuente = F_MTCARS, datos = mt,
  entradas = list(respuesta = "mpg", predictores = I(names(mt)[-1])), opciones = list(mejores = 1),
  esperado = ref_subconjuntos(mt, "mpg", names(mt)[-1], 1), paquetes = c("stats", "leaps"), codigo = "summary(leaps::regsubsets(mpg ~ ., data = mtcars, nvmax = 10))")
