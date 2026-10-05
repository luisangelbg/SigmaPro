# Modelos lineales generalizados (núcleo JS: mínimos cuadrados iterativamente reponderados). La referencia
# (tests/r/glm.R) ajusta con glm y MASS::glm.nb (con el óptimo pulido), arma el análisis de devianza tipo I, II o III
# como anova.glm y car::Anova, y saca las medias en la escala de la respuesta y sus pares con emmeans. Cubre las seis
# familias (binomial con ensayos y 0/1, cuasibinomial, Poisson, cuasi-Poisson, binomial negativa, gamma), los enlaces
# logit, probit, log-log complementario, log e inverso, la exposición como desplazamiento, la familia automática por la
# sobredispersión, bloques, covariables, factores numéricos y comparaciones dentro de los niveles de otro factor (clase D).
source(file.path("..", "..", "r", "glm.R"), encoding = "UTF-8")

F_INSECT <- "Beall (1942), Biometrika 32: 243-262; conjunto InsectSprays de R"
F_WARP <- "Tippett (1950), Technological Applications of Statistics; conjunto warpbreaks de R"
F_SNAILS <- "Venables y Ripley (2002), Modern Applied Statistics with S; conjunto snails de MASS (exposición de 2 a 4 semanas)"
F_BLISS <- "Bliss (1935), Annals of Applied Biology 22: 134-167: mortalidad de escarabajos con disulfuro de carbono"
F_BIRTH <- "Hosmer y Lemeshow (1989), Applied Logistic Regression; conjunto birthwt de MASS"
F_COAG <- "McCullagh y Nelder (1989), Generalized Linear Models, sección 8.4.2: tiempos de coagulación"
F_QUINE <- "Aitkin (1978), J. R. Stat. Soc. A 141: 195-223; conjunto quine de MASS (Venables y Ripley 2002)"
F_INSUR <- "Baxter, Coutts y Ross (1980); conjunto Insurance de MASS (factores ordenados tomados como nominales)"
F_SINT <- "Datos sintéticos (generados en este archivo)"

dfx <- function(x) { x <- as.data.frame(x); for (v in names(x)) if (is.factor(x[[v]])) x[[v]] <- factor(as.character(x[[v]]), levels = levels(x[[v]])); x }
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }
TOL <- list(tolerancias = list("medias[*].pares[*].p" = list(absoluto = 1e-12, motivo = "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6")))

#' Un caso de método de diseño (conteos, proporciones, gamma): el lado derecho como lo arma la app.
caso_dis <- function(nombre, objetivo, titulo, fuente, datos, y, trats, bloque = "", covs = character(0), ensayos = "", exposicion = "",
                     familia, enlace, tipo = 2, comparar = NULL, dentro = "", ajuste = "tukey", intervalo = "wald", lambda = 1) {
  derecha <- paste(c(if (nzchar(bloque)) bloque, covs, paste(trats, collapse = " * ")), collapse = " + ")
  comoFactor <- Filter(function(v) is.numeric(datos[[v]]), c(trats, if (nzchar(bloque)) bloque))
  base <- c("glm-conteos" = "poisson", "glm-proporciones" = "binomial", "glm-gamma" = "gamma")[[objetivo]]
  fam <- if (familia == "auto") gl_auto(datos, y, derecha, base, enlace, ensayos, exposicion, comoFactor) else familia
  if (is.null(comparar)) comparar <- trats
  r <- ref_glm(datos, y, derecha, fam, enlace, ensayos, exposicion, comoFactor, tipo, comparar, dentro, ajuste, intervalo = intervalo, lambda = lambda)
  r$familia <- fam
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, tratamientos = I(trats), bloque = bloque, covariables = if (length(covs)) I(covs), ensayos = ensayos, exposicion = exposicion),
    opciones = c(list(familia = familia, enlace = enlace, tipo = tipo, comparar = I(comparar), dentro = dentro, ajuste = ajuste), if (intervalo != "wald") list(intervalo = intervalo),
                 if (enlace == "potencia") list(lambda = lambda)),
    esperado = r, comparacion = if (ajuste == "tukey") TOL, paquetes = c("stats", "MASS", "car", "emmeans"),
    codigo = sprintf("glm(%s ~ %s, family = %s(link = %s)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"%s\")",
                     y, derecha, fam, enlace, ajuste))
}
caso_f <- function(nombre, titulo, fuente, datos, y, derecha, familia, enlace, ensayos = "", exposicion = "", comoFactor = character(0), tipo = 2,
                   comparar = character(0), dentro = "", ajuste = "tukey", intervalo = "wald", lambda = 1) {
  r <- ref_glm(datos, y, derecha, familia, enlace, ensayos, exposicion, comoFactor, tipo, comparar, dentro, ajuste, intervalo = intervalo, lambda = lambda)
  r$familia <- familia
  sp_caso(nombre, objetivo = "glm", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, ensayos = ensayos, exposicion = exposicion),
    opciones = c(list(derecha = derecha, comoFactor = I(comoFactor), familia = familia, enlace = enlace, tipo = tipo, comparar = I(comparar), dentro = dentro, ajuste = ajuste),
                 if (intervalo != "wald") list(intervalo = intervalo), if (enlace == "potencia") list(lambda = lambda)),
    esperado = r, comparacion = if (ajuste == "tukey" && length(comparar)) TOL, paquetes = c("stats", "MASS", "car", "emmeans"),
    codigo = sprintf("glm(%s ~ %s, family = %s(link = %s)); tipo %d; emmeans", y, derecha, familia, enlace, tipo))
}

# ---- conteos
ins <- dfx(InsectSprays)
caso_dis("insectos-automatica", "glm-conteos", "Seis insecticidas: la familia automática pasa a binomial negativa por la sobredispersión", F_INSECT, ins, "count", "spray", familia = "auto", enlace = "log")
caso_dis("insectos-cuasipoisson", "glm-conteos", "Seis insecticidas con cuasi-Poisson (pruebas F y dispersión de Pearson), Holm", F_INSECT, ins, "count", "spray", familia = "cuasipoisson", enlace = "log", ajuste = "holm")
wb <- dfx(warpbreaks)
caso_dis("roturas-poisson-tipo3", "glm-conteos", "Dos factores con interacción, Poisson, tipo III y tensión dentro de cada lana (Bonferroni)", F_WARP, wb, "breaks", c("wool", "tension"),
         familia = "poisson", enlace = "log", tipo = 3, comparar = "tension", dentro = "wool", ajuste = "bonferroni")
set.seed(31)
pl <- expand.grid(bloque = factor(paste0("B", 1:4)), trat = factor(c("T0", "T1", "T2", "T3", "T4")))
pl$area <- round(runif(20, 0.5, 2), 2)                                     # m² muestreados: distinta en cada parcela
pl$plantulas <- rpois(20, pl$area * c(12, 18, 25, 15, 30)[as.integer(pl$trat)] * c(1, 1.1, 0.9, 1.05)[as.integer(pl$bloque)])
pl <- pl[c("bloque", "trat", "area", "plantulas")]
caso_dis("plantulas-exposicion", "glm-conteos", "Plántulas por parcela con área muestreada distinta (desplazamiento log) en bloques; la automática se queda en Poisson", F_SINT, pl,
         "plantulas", "trat", bloque = "bloque", exposicion = "area", familia = "auto", enlace = "log")
set.seed(32)
tr <- expand.grid(bloque = 1:4, dosis = c(0, 50, 100, 150))
tr$trips <- rnbinom(16, size = 3, mu = 40 * exp(-0.008 * tr$dosis))
tr <- tr[c("bloque", "dosis", "trips")]
caso_dis("trips-dosis-numericas", "glm-conteos", "Trips con la dosis y el bloque numéricos tomados como factores, binomial negativa", F_SINT, tr, "trips", "dosis", bloque = "bloque",
         familia = "binomial-negativa", enlace = "log")

# ---- proporciones
set.seed(41)
ge <- expand.grid(bloque = factor(paste0("B", 1:4)), trat = factor(c("Testigo", "Fungicida", "Imbibición", "Ambos")))
ge$sembradas <- 50
pm <- plogis(qlogis(c(0.55, 0.7, 0.65, 0.8))[as.integer(ge$trat)] + rnorm(16, 0, 0.45))   # variación entre macetas: sobredispersión
ge$germinadas <- rbinom(16, 50, pm)
ge <- ge[c("bloque", "trat", "sembradas", "germinadas")]
caso_dis("germinacion-automatica", "glm-proporciones", "Germinadas de 50 en bloques: la automática pasa a cuasibinomial", F_SINT, ge, "germinadas", "trat", bloque = "bloque", ensayos = "sembradas",
         familia = "auto", enlace = "logit")
caso_dis("germinacion-probit-tipo3", "glm-proporciones", "Germinadas de 50 con enlace probit, binomial y tipo III", F_SINT, ge, "germinadas", "trat", bloque = "bloque", ensayos = "sembradas",
         familia = "binomial", enlace = "probit", tipo = 3)
bw <- MASS::birthwt; bw <- data.frame(bajo = bw$low, raza = bw$race, fuma = bw$smoke, peso_madre = bw$lwt)
caso_dis("bajo-peso-binaria", "glm-proporciones", "Respuesta 0/1 con dos factores numéricos y una covariable (la automática se queda en binomial)", F_BIRTH, bw, "bajo", c("raza", "fuma"),
         covs = "peso_madre", familia = "auto", enlace = "logit", comparar = "raza")

# ---- gamma
coag <- data.frame(lote = factor(rep(c("lote1", "lote2"), each = 9)), log_u = rep(log(c(5, 10, 15, 20, 30, 40, 60, 80, 100)), 2),
                   tiempo = c(118, 58, 42, 35, 27, 25, 21, 19, 18, 69, 35, 26, 21, 18, 16, 13, 12, 12))
caso_dis("coagulacion-inverso", "glm-gamma", "Tiempo de coagulación con la concentración (log) como covariable, enlace inverso", F_COAG, coag, "tiempo", "lote", covs = "log_u", familia = "gamma", enlace = "inverso")
set.seed(51)
gd <- expand.grid(bloque = factor(paste0("B", 1:5)), trat = factor(c("Testigo", "GA3", "KNO3", "Frío")))
gd$dias <- round(rgamma(20, shape = 6, rate = 6 / (c(14, 9, 11, 10)[as.integer(gd$trat)] * c(1, 1.1, 0.95, 1.05, 1)[as.integer(gd$bloque)])), 1)
gd <- gd[c("bloque", "trat", "dias")]
caso_dis("dias-germinacion-log", "glm-gamma", "Días a germinación en bloques, gamma con enlace log (razones de medias)", F_SINT, gd, "dias", "trat", bloque = "bloque", familia = "gamma", enlace = "log")

# ---- desde la fórmula
qu <- dfx(MASS::quine)
caso_f("quine-binomial-negativa", "Días de ausencia escolar: cuatro factores, binomial negativa, tipo II", F_QUINE, qu, "Days", "Eth + Sex + Age + Lrn", "binomial-negativa", "log", comparar = "Age")
isu <- MASS::Insurance; isu <- data.frame(District = factor(as.character(isu$District)), Group = factor(as.character(isu$Group), levels = levels(isu$Group)),
                                         Age = factor(as.character(isu$Age), levels = levels(isu$Age)), Holders = isu$Holders, Claims = isu$Claims)
caso_f("seguros-exposicion", "Reclamaciones por asegurado: Poisson con el número de asegurados como exposición", F_INSUR, isu, "Claims", "District + Group + Age", "poisson", "log",
       exposicion = "Holders", comparar = "Group")
sn <- subset(MASS::snails, Exposure > 1); sn <- data.frame(Species = sn$Species, Exposure = sn$Exposure, Rel.Hum = sn$Rel.Hum, Temp = sn$Temp, N = sn$N, Deaths = sn$Deaths)
caso_f("caracoles-binomial", "Mortalidad de caracoles: binomial con ensayos, factores numéricos y una covariable", F_SNAILS, sn, "Deaths", "Species + Exposure + Rel.Hum + Temp", "binomial", "logit",
       ensayos = "N", comoFactor = c("Exposure", "Rel.Hum"), comparar = "Species")
bliss <- data.frame(dosis = c(1.6907, 1.7242, 1.7552, 1.7842, 1.8113, 1.8369, 1.8610, 1.8839), n = c(59, 60, 62, 56, 63, 59, 62, 60), muertos = c(6, 13, 18, 28, 52, 53, 61, 60))
caso_f("escarabajos-cloglog", "Dosis-respuesta con enlace log-log complementario", F_BLISS, bliss, "muertos", "dosis", "binomial", "cloglog", ensayos = "n")
caso_f("roturas-cuasipoisson-tipo1", "Análisis de devianza secuencial (tipo I) con cuasi-Poisson y la interacción", F_WARP, wb, "breaks", "wool * tension", "cuasipoisson", "log", tipo = 1,
       comparar = "tension", dentro = "wool")

# ---- Hito 4.3: intervalos perfilados, gaussiana inversa, enlaces raíz y de potencia, y Firth
caso_dis("insectos-raiz", "glm-conteos", "Seis insecticidas: Poisson con enlace raíz cuadrada (la escala de la transformación clásica)", F_INSECT, ins, "count", "spray",
         familia = "poisson", enlace = "raiz")
caso_dis("insectos-perfil-nb", "glm-conteos", "Seis insecticidas: binomial negativa con intervalos por verosimilitud perfilada (θ fija, como profile.glm)", F_INSECT, ins, "count", "spray",
         familia = "binomial-negativa", enlace = "log", intervalo = "perfil")
caso_f("escarabajos-perfil", "Dosis-respuesta logit con intervalos por verosimilitud perfilada (la raíz exacta del perfil de confint)", F_BLISS, bliss, "muertos", "dosis", "binomial", "logit",
       ensayos = "n", intervalo = "perfil")
caso_dis("coagulacion-perfil", "glm-gamma", "Gamma con enlace inverso: intervalos perfilados con la dispersión de Pearson", F_COAG, coag, "tiempo", "lote", covs = "log_u", familia = "gamma", enlace = "inverso",
         intervalo = "perfil")
caso_dis("germinacion-cuasi-perfil", "glm-proporciones", "Germinadas de 50 con la cuasibinomial: intervalos perfilados con la dispersión estimada", F_SINT, ge, "germinadas", "trat", bloque = "bloque",
         ensayos = "sembradas", familia = "cuasibinomial", enlace = "logit", intervalo = "perfil")
# gaussiana inversa: datos sintéticos con el método de Michael, Schucany y Haas (1976)
rig <- function(n, mu, lambda) { nu <- rnorm(n)^2; x <- mu + mu^2 * nu / (2 * lambda) - mu / (2 * lambda) * sqrt(4 * mu * lambda * nu + mu^2 * nu^2); ifelse(runif(n) <= mu / (mu + x), x, mu^2 / x) }
set.seed(72)
va <- expand.grid(bloque = factor(paste0("B", 1:5)), empaque = factor(c("Charola", "Película", "Atmósfera", "Cera")))
va$dias <- round(rig(20, c(9, 12, 16, 13)[as.integer(va$empaque)] * c(1, 1.1, 0.9, 1.05, 0.95)[as.integer(va$bloque)], 120), 2)
va <- va[c("bloque", "empaque", "dias")]
caso_dis("vida-anaquel-inversa", "glm-gamma", "Días de vida de anaquel en bloques: gaussiana inversa con enlace log (razones de medias, emmeans con gl infinitos)", F_SINT, va, "dias", "empaque",
         bloque = "bloque", familia = "inversa-gaussiana", enlace = "log")
set.seed(73)
dg <- data.frame(temperatura = rep(c(10, 15, 20, 25, 30, 35), each = 4), lote = factor(rep(c("L1", "L2"), 12)))
dg$horas <- round(rig(24, 1 / sqrt(0.004 + 0.0011 * dg$temperatura + 0.002 * (dg$lote == "L2")), 400), 3)
caso_f("degradacion-canonica", "Horas de degradación con la temperatura: gaussiana inversa con su enlace canónico 1/μ², tipo I e intervalos perfilados", F_SINT, dg, "horas", "lote + temperatura",
       "inversa-gaussiana", "inverso2", tipo = 1, intervalo = "perfil")
caso_f("dias-potencia", "Días a germinación en bloques: gamma con enlace de potencia μ^0.5 (power() de R)", F_SINT, gd, "dias", "bloque + trat", "gamma", "potencia", lambda = 0.5)

# Firth: referencia en R base (optim y Newton sobre la verosimilitud penalizada; ver tests/r/glm.R)
caso_firth <- function(nombre, objetivo, titulo, fuente, datos, y, derecha, entradas, opciones, ensayos = "", comoFactor = character(0), tipo = 2,
                       comparar = character(0), dentro = "", ajuste = "tukey") {
  r <- ref_firth(datos, y, derecha, ensayos, comoFactor, tipo, comparar, dentro, ajuste)
  r$familia <- "binomial"; r$firth <- TRUE
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos, entradas = entradas,
    opciones = c(opciones, list(firth = TRUE, tipo = tipo, comparar = I(comparar), dentro = dentro, ajuste = ajuste)),
    esperado = r, comparacion = if (length(comparar)) TOL, paquetes = c("stats", "emmeans"),
    codigo = sprintf("Firth en R base: l*(β) = l(β) + ½·log|X'WX| con optim y Newton; χ² de la razón de verosimilitudes penalizadas; perfil penalizado; tipo %d; emmeans::qdrg", tipo))
}
set.seed(74)
sx <- expand.grid(bloque = factor(paste0("B", 1:4)), trat = factor(c("Sin escarificar", "Lija", "Ácido", "Agua caliente")))
sx$sembradas <- 20
sx$germinadas <- rbinom(16, 20, c(0, 0.35, 0.7, 0.55)[as.integer(sx$trat)])   # sin escarificar no germina ninguna: separación
sx <- sx[c("bloque", "trat", "sembradas", "germinadas")]
caso_firth("escarificacion-firth", "glm-proporciones", "Germinadas de 20 en bloques con un tratamiento sin ninguna germinada (separación): Firth", F_SINT, sx, "germinadas", "bloque + trat",
           entradas = list(respuesta = "germinadas", tratamientos = I("trat"), bloque = "bloque", ensayos = "sembradas"), opciones = list(familia = "binomial", enlace = "logit"),
           ensayos = "sembradas", comparar = "trat")
set.seed(75)
en <- data.frame(variedad = factor(rep(c("Resistente", "Intermedia", "Susceptible"), each = 10), levels = c("Resistente", "Intermedia", "Susceptible")), altura = round(runif(30, 40, 90), 1))
en$enferma <- ifelse(en$variedad == "Resistente", 0L, rbinom(30, 1, plogis(-3 + 2.5 * (en$variedad == "Susceptible") + 0.04 * en$altura)))
caso_firth("enfermedad-binaria-firth", "glm", "Plantas enfermas (0/1) con una variedad sin enfermas (separación) y la altura: Firth con tipo III", F_SINT, en, "enferma", "variedad + altura",
           entradas = list(respuesta = "enferma"), opciones = list(derecha = "variedad + altura", comoFactor = I(character(0)), familia = "binomial", enlace = "logit"),
           tipo = 3, comparar = "variedad")
caso_firth("escarabajos-firth", "glm", "Dosis-respuesta de Bliss con Firth (sin separación: corrige el sesgo), tipo I", F_BLISS, bliss, "muertos", "dosis",
           entradas = list(respuesta = "muertos", ensayos = "n"), opciones = list(derecha = "dosis", comoFactor = I(character(0)), familia = "binomial", enlace = "logit"),
           ensayos = "n", tipo = 1)
