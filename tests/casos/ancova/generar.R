# Análisis de covarianza en completamente al azar y en bloques: ANOVA (SC I, II y III), pendientes comunes,
# homogeneidad de pendientes, independencia de la covariable, medias ajustadas con comparaciones y eficiencia.
suppressPackageStartupMessages({ library(car); library(emmeans); library(multcompView); library(MASS) })
emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

F_ANOREXIA <- "Hand, Daly, McConway, Lunn y Ostrowski (1993), A Handbook of Small Data Sets, conjunto 285; anorexia del paquete MASS"
F_FRIJOL <- "Oriente antioqueño (1972), ICA, Colombia; conjunto frijol del paquete agricolae"
F_SOILS <- "Horton, Russell y Moore (1968), Biometrics 24: 845-858; conjunto Soils del paquete carData"

v <- function(x) I(unname(as.numeric(x)))
ADJ <- c(dms = "none", tukey = "tukey", scheffe = "scheffe", bonferroni = "bonferroni", sidak = "sidak", holm = "holm")
letras_r <- function(medias, p, alfa = 0.05) {
  k <- length(medias); ord <- order(-medias)
  pm <- matrix(1, k, k); idx <- 0
  for (a in 1:(k - 1)) for (b in (a + 1):k) { idx <- idx + 1; pm[a, b] <- pm[b, a] <- p[idx] }
  niv <- paste0("g", ord); m <- pm[ord, ord] < alfa; diag(m) <- FALSE; dimnames(m) <- list(niv, niv)
  unname(multcompLetters(m)$Letters[paste0("g", 1:k)])
}

ref_ancova <- function(datos, y, trs, covs, bloque = NULL, tipo = 3, metodo = "tukey", nivel = 0.95, alfa = 0.05) {
  datos <- datos[complete.cases(datos[c(y, covs, trs, bloque)]), ]
  for (f in c(trs, bloque)) datos[[f]] <- factor(datos[[f]])
  assign("datos", datos, envir = globalenv())                  # emmeans vuelve a evaluar los datos de la llamada
  trt <- paste(trs, collapse = " * "); base <- if (is.null(bloque)) "1" else bloque
  f <- as.formula(paste(y, "~", paste(c(bloque, covs, trt), collapse = " + ")))
  ctr <- if (tipo == 3) setNames(rep(list("contr.sum"), length(c(trs, bloque))), c(trs, bloque)) else NULL
  m <- lm(f, data = datos, contrasts = ctr)
  an <- if (tipo == 1) anova(m) else car::Anova(m, type = tipo)
  an <- an[rownames(an) != "(Intercept)", ]
  cf <- coef(summary(m)); ci <- confint(m, level = nivel)
  inter <- function(c) paste0(c, ":", c(trs, if (length(trs) == 2) paste(trs, collapse = ":")))
  hom <- lapply(covs, function(c) {
    a <- anova(m, update(m, as.formula(paste(". ~ . +", paste(inter(c), collapse = " + ")))))
    list(F = a$F[2], gl1 = a$Df[2], gl2 = a$Res.Df[2], p = a$`Pr(>F)`[2])
  })
  ind <- lapply(covs, function(c) {
    a <- anova(lm(as.formula(paste(c, "~", base)), data = datos), lm(as.formula(paste(c, "~", base, "+", trt)), data = datos))
    # covariable idéntica en todos los tratamientos: la SC es cero y por redondeo sale −1e-15; R da F = NA (no acepta F < 0),
    # SigmaPro la toma como cero (F = 0, p = 1)
    Fv <- a$F[2]; pv <- a$`Pr(>F)`[2]; sc <- a$`Sum of Sq`[2]
    if (is.na(Fv) && abs(sc) <= 1e-9 * a$RSS[2]) { Fv <- 0; pv <- 1; sc <- 0 }
    list(F = Fv, gl1 = a$Df[2], gl2 = a$Res.Df[2], p = pv, sc_trat = sc, sc_error = a$RSS[2])
  })
  sin <- lm(as.formula(paste(y, "~", base, "+", trt)), data = datos)
  cme <- deviance(m) / df.residual(m); cm_sin <- deviance(sin) / df.residual(sin); yy <- model.response(model.frame(m))
  out <- list(
    anova = list(gl = v(an$Df), sc = v(an$`Sum Sq`), F = v(an$`F value`), p = v(an$`Pr(>F)`)),
    pendientes = lapply(covs, function(c) list(estimado = cf[c, 1], ee = cf[c, 2], t = cf[c, 3], p = cf[c, 4], ic = v(ci[c, ]))),
    homogeneidad = hom, independencia = ind,
    resumen = list(media = mean(yy), cme = cme, cv = 100 * sqrt(cme) / mean(yy), r2 = summary(m)$r.squared, cme_sin = cm_sin),
    medias = lapply(trs, function(t) { e <- as.data.frame(confint(emmeans(m, t), level = nivel)); list(factor = t, media = v(e$emmean), ee = v(e$SE), ic_inf = v(e$lower.CL), ic_sup = v(e$upper.CL)) }),
    comparaciones = lapply(trs, function(t) {
      em <- emmeans(m, t); pr <- as.data.frame(pairs(em, adjust = ADJ[[metodo]])); med <- as.data.frame(em)$emmean
      list(factor = t, letras = I(letras_r(med, pr$p.value, alfa)), dif = v(pr$estimate), ee = v(pr$SE), t = v(pr$t.ratio), p = v(pr$p.value))
    }))
  if (length(covs) == 1) {
    cm_ef <- cme * (1 + (ind[[1]]$sc_trat / ind[[1]]$gl1) / ind[[1]]$sc_error)
    out$eficiencia <- list(cm_sin = cm_sin, cm_efectivo = cm_ef, relativa = 100 * cm_sin / cm_ef)
  } else out$eficiencia <- NA
  out
}
caso_ancova <- function(nombre, titulo, fuente, datos, y, trs, covs, bloque = NULL, tipo = 3, metodo = "tukey", nivel = 0.95) {
  e <- c(list(respuesta = y, tratamientos = I(trs), covariables = I(covs)), if (!is.null(bloque)) list(bloque = bloque))
  esp <- ref_ancova(datos, y, trs, covs, bloque, tipo, metodo, nivel)
  sp_caso(nombre, objetivo = "ancova.analizarDe", titulo = titulo, fuente = fuente, datos = datos, clase = if (metodo %in% c("tukey", "sidak")) "B" else "A",
    comparacion = list(tolerancias = list("comparaciones[*].p[*]" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"))),
    argumentos = list(list(tabla = TRUE), e, list(tipoSC = tipo, metodo = metodo, alfa = 0.05, nivel = nivel)), esperado = esp, paquetes = c("stats", "car", "emmeans", "multcompView"),
    codigo = sprintf("lm(%s ~ %s); %s; anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"%s\")", y, paste(c(bloque, covs, paste(trs, collapse = " * ")), collapse = " + "),
                     if (tipo == 1) "anova(m)" else sprintf("car::Anova(m, type = %d)", tipo), ADJ[[metodo]]))
}

an <- data.frame(peso_final = anorexia$Postwt, peso_inicial = anorexia$Prewt, tratamiento = anorexia$Treat)
caso_ancova("anorexia-tipo3", "Un factor desbalanceado, SC tipo III, Tukey", F_ANOREXIA, an, "peso_final", "tratamiento", "peso_inicial")
caso_ancova("anorexia-tipo1", "Un factor desbalanceado, SC tipo I (tratamientos ajustados por la covariable)", F_ANOREXIA, an, "peso_final", "tratamiento", "peso_inicial", tipo = 1, metodo = "dms")
caso_ancova("anorexia-tipo2", "Un factor desbalanceado, SC tipo II, Bonferroni, IC 90 %", F_ANOREXIA, an, "peso_final", "tratamiento", "peso_inicial", tipo = 2, metodo = "bonferroni", nivel = 0.9)
data("frijol", package = "agricolae", envir = environment()); fr <- frijol
fr <- data.frame(produccion = fr$production, indice = fr$index, tecnologia = fr$technology)
caso_ancova("frijol", "Cuatro tecnologías con su índice: la covariable es la misma en cada tecnología (F = 0; R da NA)", F_FRIJOL, fr, "produccion", "tecnologia", "indice", metodo = "holm")
so <- carData::Soils
so <- data.frame(N = so$N, densidad = so$Dens, pH = so$pH, contorno = so$Contour, profundidad = so$Depth, bloque = so$Block)
caso_ancova("suelos-bloques-factorial", "Bloques con factorial 3 × 4 y una covariable", F_SOILS, so, "N", c("contorno", "profundidad"), "densidad", bloque = "bloque")
caso_ancova("suelos-dos-covariables", "Bloques con factorial y dos covariables, SC tipo II", F_SOILS, so, "N", c("contorno", "profundidad"), c("densidad", "pH"), bloque = "bloque", tipo = 2, metodo = "scheffe")
set.seed(909)
sg <- expand.grid(variedad = paste("Línea", 1:5), bloque = paste0("B", 1:4), stringsAsFactors = FALSE)
sg$variedad[sg$variedad == "Línea 5"] <- "Testigo"
sg$variedad <- factor(sg$variedad, levels = c(paste("Línea", 1:4), "Testigo")); sg$bloque <- factor(sg$bloque)
sg$plantas <- round(rnorm(20, 118, 9))
sg$rend <- round(3.2 + c(0.5, 0.25, -0.1, 0.35, -0.4)[match(sg$variedad, c(paste("Línea", 1:4), "Testigo"))] + c(0.3, 0.1, -0.15, -0.25)[match(sg$bloque, paste0("B", 1:4))] +
                 0.028 * (sg$plantas - 118) + rnorm(20, 0, 0.15), 2)
sg <- sg[c("rend", "plantas", "variedad", "bloque")]
caso_ancova("sorgo-bloques", "Bloques completos con una covariable (número de plantas)", "Datos sintéticos", sg, "rend", "variedad", "plantas", bloque = "bloque", metodo = "dms")
sgf <- sg; sgf$rend[c(3, 14)] <- NA
caso_ancova("sorgo-faltantes", "Bloques con dos parcelas sin dato (medias ajustadas)", "Datos sintéticos", sgf, "rend", "variedad", "plantas", bloque = "bloque", tipo = 2, metodo = "sidak")

# el método completo
r_an <- ref_ancova(an, "peso_final", "tratamiento", "peso_inicial")
sp_caso("metodo-ancova-anorexia", objetivo = "ancova", tipo = "metodo", titulo = "ANCOVA con Tukey y eficiencia relativa", fuente = F_ANOREXIA, datos = an, clase = "B",
  comparacion = list(tolerancias = list("comparaciones[*].pares[*].p_ajustado" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190)"))),
  entradas = list(respuesta = "peso_final", tratamientos = I("tratamiento"), covariables = I("peso_inicial")), opciones = list(tipoSC = 3, metodo = "tukey", alfa = 0.05, nivel = 0.95),
  esperado = list(anova = r_an$anova, pendientes = r_an$pendientes, homogeneidad = r_an$homogeneidad, independencia = r_an$independencia, eficiencia = r_an$eficiencia,
    medias = list(list(filas = lapply(seq_along(r_an$medias[[1]]$media), function(i) list(media = as.numeric(r_an$medias[[1]]$media)[i], ee = as.numeric(r_an$medias[[1]]$ee)[i], ic = v(c(as.numeric(r_an$medias[[1]]$ic_inf)[i], as.numeric(r_an$medias[[1]]$ic_sup)[i])))))),
    comparaciones = list(list(medias = lapply(r_an$comparaciones[[1]]$letras, function(l) list(letras = l)),
                              pares = lapply(seq_along(r_an$comparaciones[[1]]$dif), function(i) list(dif = as.numeric(r_an$comparaciones[[1]]$dif)[i], ee = as.numeric(r_an$comparaciones[[1]]$ee)[i], p_ajustado = as.numeric(r_an$comparaciones[[1]]$p)[i]))))),
  paquetes = c("stats", "car", "emmeans", "multcompView"), codigo = "lm(peso_final ~ peso_inicial + tratamiento, contrasts = contr.sum); car::Anova(type = 3); emmeans; pairs(adjust = \"tukey\")")
