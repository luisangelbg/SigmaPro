# Modelo lineal general escrito como fórmula: ANOVA con SC tipo I, II o III, coeficientes con contrastes de tratamiento
# (como summary(lm)), R², y medias marginales (emmeans) de cada factor que entra como efecto principal. Cubre factoriales
# desbalanceados, factores anidados, interacción de un factor con una covariable, numéricas tomadas como factor, el
# atajo (a + b + c)^2, un producto de covariables y el modelo sin intercepto.
suppressPackageStartupMessages({ library(car); library(emmeans) })
emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

F_WARP <- "Tippett (1950), Technological Applications of Statistics, p. 106; conjunto warpbreaks de R"
F_CO2 <- "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R"
F_STACK <- "Brownlee (1960), Statistical Theory and Methodology in Science and Engineering; conjunto stackloss de R"

v <- function(x) I(unname(as.numeric(x)))

ref_ml <- function(datos, y, derecha, comoFactor = character(0), tipo = 3, nivel = 0.95) {
  f <- as.formula(paste(y, "~", derecha))
  d <- datos[complete.cases(datos[all.vars(f)]), ]
  for (cn in comoFactor) d[[cn]] <- factor(d[[cn]])
  for (cn in names(d)) if (is.character(d[[cn]])) d[[cn]] <- factor(d[[cn]])
  datos <- d; assign("datos", d, envir = globalenv())     # emmeans vuelve a evaluar los datos de la llamada
  m <- lm(f, data = datos)
  an <- if (tipo == 1) anova(m) else if (tipo == 2) car::Anova(m, type = 2) else {
    viejo <- options(contrasts = c("contr.sum", "contr.poly")); on.exit(options(viejo))
    car::Anova(lm(f, data = datos), type = 3)
  }
  an <- an[rownames(an) != "(Intercept)", ]
  s <- summary(m); cf <- coef(s)
  tl <- attr(terms(m), "term.labels")
  vars <- all.vars(f)[-1]
  principales <- Filter(function(x) is.factor(d[[x]]) && x %in% tl, vars)
  medias <- lapply(principales, function(x) {
    e <- as.data.frame(confint(emmeans(m, x), level = nivel))
    list(factor = x, media = v(e$emmean), ee = v(e$SE), ic_inf = v(e$lower.CL), ic_sup = v(e$upper.CL))
  })
  yy <- model.response(model.frame(m)); cme <- deviance(m) / df.residual(m)
  list(anova = list(gl = v(an$Df), sc = v(an$`Sum Sq`), F = v(an$`F value`), p = v(an$`Pr(>F)`)),
       coeficientes = list(estimado = v(cf[, 1]), ee = v(cf[, 2]), t = v(cf[, 3]), p = v(cf[, 4])),
       resumen = list(sigma = s$sigma, r2 = s$r.squared, r2_ajustada = s$adj.r.squared, media = mean(yy), cme = cme, cv = 100 * sqrt(cme) / mean(yy)),
       total = list(gl = length(yy) - attr(terms(m), "intercept"), sc = if (attr(terms(m), "intercept")) sum((yy - mean(yy))^2) else sum(yy^2)),
       medias = medias, n = length(yy))
}
caso_ml <- function(nombre, titulo, fuente, datos, y, derecha, comoFactor = character(0), tipo = 3) {
  r <- ref_ml(datos, y, derecha, comoFactor, tipo)
  esp <- list(anova = r$anova, coeficientes = r$coeficientes, resumen = r$resumen[c("sigma", "r2", "r2_ajustada")],
              medias = lapply(r$medias, function(m) m[c("factor", "media", "ee")]))
  sp_caso(nombre, objetivo = "modeloLineal.analizarDe", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), list(respuesta = y), list(derecha = derecha, comoFactor = I(comoFactor), tipoSC = tipo, alfa = 0.05, nivel = 0.95)),
    esperado = esp, paquetes = c("stats", "car", "emmeans"),
    codigo = sprintf("%slm(%s ~ %s); summary(m); %s; emmeans(m, factor)", if (length(comoFactor)) sprintf("factor(%s); ", paste(comoFactor, collapse = ", ")) else "",
                     y, derecha, if (tipo == 1) "anova(m)" else if (tipo == 2) "car::Anova(m, type = 2)" else "options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3)"))
}

wb <- data.frame(roturas = warpbreaks$breaks, lana = warpbreaks$wool, tension = warpbreaks$tension)
caso_ml("lana-factorial-tipo3", "Factorial 2 × 3 balanceado, SC tipo III", F_WARP, wb, "roturas", "lana * tension")
wbd <- wb[-c(2, 15, 16, 30, 41, 47), ]
caso_ml("lana-desbalanceado-tipo2", "Factorial desbalanceado (seis datos menos), SC tipo II", F_WARP, wbd, "roturas", "lana * tension", tipo = 2)
caso_ml("lana-desbalanceado-tipo1", "Factorial desbalanceado, SC tipo I en el orden escrito (tensión primero)", F_WARP, wbd, "roturas", "tension * lana", tipo = 1)
caso_ml("lana-sin-intercepto", "Sin intercepto («- 1»): una media por tensión, SC tipo I y R² sin centrar", F_WARP, wbd, "roturas", "tension + lana - 1", tipo = 1)

co <- data.frame(captacion = CO2$uptake, origen = factor(as.character(CO2$Type), levels = c("Quebec", "Mississippi")),
                 tratamiento = factor(as.character(CO2$Treatment), levels = c("nonchilled", "chilled")), conc = CO2$conc)
levels(co$tratamiento) <- c("sin frío", "con frío")
caso_ml("co2-covariable-interaccion-tipo2", "Un factor con su propia pendiente de una covariable (tratamiento × conc), SC tipo II", F_CO2, co, "captacion", "origen + tratamiento * conc", tipo = 2)
caso_ml("co2-covariable-interaccion-tipo3", "La misma interacción factor × covariable con SC tipo III", F_CO2, co, "captacion", "origen + tratamiento * conc", tipo = 3)
caso_ml("co2-dosis-como-factor", "Concentración numérica tomada como factor de 7 niveles", F_CO2, co, "captacion", "origen * tratamiento + conc", comoFactor = "conc")
caso_ml("co2-interacciones-dobles", "(a + b + c)^2: efectos principales e interacciones dobles, sin la triple", F_CO2, co, "captacion", "(origen + tratamiento + conc)^2", comoFactor = "conc")
cof <- co; cof$captacion[c(5, 22, 40, 61, 77)] <- NA
caso_ml("co2-faltantes-tipo3", "Con cinco datos faltantes: las medias marginales ya no son las aritméticas", F_CO2, cof, "captacion", "origen * tratamiento + conc", comoFactor = "conc")

set.seed(1110)
fe <- expand.grid(planta = 1:3, parcela = 1:4, fertilizante = c("Testigo", "Urea", "Sulfato"), stringsAsFactors = FALSE)
efp <- rnorm(12, 0, 4)
k <- match(fe$fertilizante, c("Testigo", "Urea", "Sulfato"))
fe$altura <- round(80 + c(0, 9, 6)[k] + efp[(k - 1) * 4 + fe$parcela] + rnorm(36, 0, 3), 1)
fe$fertilizante <- factor(fe$fertilizante, levels = c("Testigo", "Urea", "Sulfato")); fe$parcela <- factor(fe$parcela)
fe <- fe[c("altura", "fertilizante", "parcela", "planta")]
caso_ml("fertilizante-anidado-tipo3", "Parcelas anidadas en fertilizante (fertilizante / parcela), SC tipo III", "Datos sintéticos", fe, "altura", "fertilizante / parcela")
caso_ml("fertilizante-anidado-tipo1", "Anidado escrito como término (fertilizante + fertilizante:parcela), SC tipo I", "Datos sintéticos", fe, "altura", "fertilizante + fertilizante:parcela", tipo = 1)

sl <- data.frame(perdida = stackloss$stack.loss, aire = stackloss$Air.Flow, agua = stackloss$Water.Temp, acido = stackloss$Acid.Conc.)
caso_ml("planta-superficie-tipo1", "Producto de dos covariables (aire × agua) más una tercera, SC tipo I", F_STACK, sl, "perdida", "aire * agua + acido", tipo = 1)
caso_ml("planta-superficie-tipo2", "El mismo modelo con SC tipo II", F_STACK, sl, "perdida", "aire * agua + acido", tipo = 2)

# el método completo
r <- ref_ml(co, "captacion", "origen * tratamiento + conc", "conc", 3)
sp_caso("metodo-modelo-lineal-co2", objetivo = "modelo-lineal", tipo = "metodo", titulo = "Modelo lineal general con una numérica como factor: ANOVA III, coeficientes y medias con IC", fuente = F_CO2, datos = co,
  entradas = list(respuesta = "captacion"), opciones = list(derecha = "origen * tratamiento + conc", comoFactor = I("conc"), tipoSC = 3, alfa = 0.05, nivel = 0.95),
  esperado = list(n = r$n, anova = r$anova, coeficientes = r$coeficientes, resumen = r$resumen, total = r$total,
    medias = lapply(r$medias, function(m) list(factor = m$factor, filas = lapply(seq_along(m$media), function(i) list(media = as.numeric(m$media)[i], ee = as.numeric(m$ee)[i], ic = v(c(as.numeric(m$ic_inf)[i], as.numeric(m$ic_sup)[i]))))))),
  paquetes = c("stats", "car", "emmeans"), codigo = "lm(captacion ~ origen * tratamiento + factor(conc)); car::Anova(type = 3) con contr.sum; summary(m); confint(emmeans(m, factor))")
