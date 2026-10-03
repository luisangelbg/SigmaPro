# SigmaPro — referencia de los modelos lineales mixtos (lme4 + lmerTest + emmeans en el R de escritorio), común a
# tests/casos/modelo-mixto/ y tests/casos/mixto-disenos/. Calcula lo mismo que el método de la app: ANOVA de los
# efectos fijos, coeficientes, componentes de varianza, ajuste, medias marginales y sus pares (emmeans), la prueba de
# cada efecto aleatorio (ranova) y los BLUP con su DE condicional.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Sin library(): cargar lmerTest dejaría su step() tapando al de stats en los generadores que siguen.
suppressPackageStartupMessages({ requireNamespace("lmerTest"); requireNamespace("emmeans") })
emmeans::emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

mx_v <- function(x) I(unname(as.numeric(x)))
mx_tx <- function(x) I(unname(as.character(x)))

#' Los factores fijos que entran como efecto principal (los que la app compara si no se piden otros).
mx_principales <- function(d, fijos) {
  tl <- attr(terms(as.formula(paste("~", fijos))), "term.labels")
  tl <- gsub("`", "", tl)
  tl[!grepl(":", tl, fixed = TRUE) & vapply(tl, function(v) v %in% names(d) && is.factor(d[[v]]), TRUE)]
}

#' @param fijos  la parte fija de la fórmula (para saber qué medias comparar por omisión)
ref_mixto <- function(datos, y, derecha, fijos, comoFactor = character(0), tipo = 3, ddf = "Satterthwaite", reml = TRUE,
                      comparar = NULL, dentro = "", ajuste = "tukey", nivel = 0.95) {
  d <- datos
  for (cn in comoFactor) d[[cn]] <- factor(d[[cn]])
  m <- lmerTest::lmer(as.formula(paste(y, "~", derecha)), data = d, REML = reml)
  s <- summary(m, ddf = ddf); a <- anova(m, type = tipo, ddf = ddf); cf <- coef(s); vc <- as.data.frame(lme4::VarCorr(m))
  if (is.null(comparar)) comparar <- head(mx_principales(d, fijos), 3)
  comparar <- setdiff(comparar, dentro)
  medias <- lapply(comparar, function(f) {
    e <- if (nzchar(dentro)) emmeans::emmeans(m, specs = f, by = dentro, lmer.df = tolower(ddf)) else emmeans::emmeans(m, specs = f, lmer.df = tolower(ddf))
    em <- as.data.frame(summary(e, level = nivel, infer = c(TRUE, FALSE)))
    filas <- lapply(seq_len(nrow(em)), function(i) list(nivel = as.character(em[[f]][i]), media = em$emmean[i], ee = em$SE[i], gl = em$df[i],
                                                       ic = I(c(em$lower.CL[i], em$upper.CL[i]))))
    pr <- as.data.frame(pairs(e, adjust = ajuste))
    pares <- lapply(seq_len(nrow(pr)), function(i) list(contraste = as.character(pr$contrast[i]), dif = pr$estimate[i], ee = pr$SE[i], gl = pr$df[i],
                                                        t = pr$t.ratio[i], p = pr$p.value[i]))
    list(factor = f, filas = filas, pares = pares)
  })
  rv <- as.data.frame(lmerTest::ranova(m))
  re <- as.data.frame(lme4::ranef(m, condVar = TRUE))
  list(anova = list(termino = mx_tx(rownames(a)), sc = mx_v(a[["Sum Sq"]]), cm = mx_v(a[["Mean Sq"]]), gl1 = mx_v(a[["NumDF"]]), gl2 = mx_v(a[["DenDF"]]),
                    F = mx_v(a[["F value"]]), p = mx_v(a[["Pr(>F)"]])),
       coeficientes = list(nombre = mx_tx(rownames(cf)), estimado = mx_v(cf[, 1]), ee = mx_v(cf[, 2]), gl = mx_v(cf[, 3]), t = mx_v(cf[, 4]), p = mx_v(cf[, 5])),
       varianzas = list(grupo = mx_tx(vc$grp), var1 = mx_tx(vc$var1), var2 = mx_tx(vc$var2), varianza = mx_v(vc$vcov), de = mx_v(vc$sdcor)),
       ajuste = list(n = nobs(m), logLik = as.numeric(logLik(m)), AIC = AIC(m), BIC = BIC(m), singular = lme4::isSingular(m)),
       medias = medias,
       ranova = list(termino = mx_tx(rownames(rv)), npar = mx_v(rv$npar), logLik = mx_v(rv$logLik), AIC = mx_v(rv$AIC), LRT = mx_v(rv$LRT), gl = mx_v(rv$Df), p = mx_v(rv[["Pr(>Chisq)"]])),
       blup = list(grupo = mx_tx(re$grpvar), termino = mx_tx(re$term), nivel = mx_tx(re$grp), valor = mx_v(re$condval), de = mx_v(re$condsd)))
}

#' El código R que va en el caso (lo que ve quien revisa la validación).
codigo_mixto <- function(y, derecha, comoFactor, tipo, ddf, reml, comparar, dentro, ajuste) {
  paste0(if (length(comoFactor)) paste0("datos$", comoFactor, " <- factor(datos$", comoFactor, "); ", collapse = "") else "",
         sprintf("modelo <- lmer(%s ~ %s, data = datos, REML = %s); anova(modelo, type = %d, ddf = \"%s\"); summary(modelo, ddf = \"%s\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE)",
                 y, derecha, reml, tipo, ddf, ddf),
         if (length(comparar)) sprintf("; emmeans(modelo, %s%s, lmer.df = \"%s\") y pairs(adjust = \"%s\")", paste0("\"", comparar, "\"", collapse = " | "),
                                       if (nzchar(dentro)) sprintf(", by = \"%s\"", dentro) else "", tolower(ddf), ajuste) else "")
}

#' Los p de Tukey (rango estudentizado) se calculan como 1 − P de una integral numérica: debajo de 1e-6 solo tienen
#' cifras absolutas (igual que en las comparaciones de la Fase 1).
mx_comparacion <- function(ajuste) {
  if (ajuste != "tukey") return(NULL)
  list(tolerancias = list("medias[*].pares[*].p" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6")))
}
