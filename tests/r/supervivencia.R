# SigmaPro — referencia de supervivencia (Hito 3.2): el paquete survival de R (Therneau, 2024).
# Kaplan-Meier con survfit (intervalos log, log-log o plain) y sus cuantiles con quantile.survfit; la comparación de
# curvas con survdiff (ρ = 0: log-rank; ρ = 1: Peto-Peto); el modelo de Cox con coxph (Efron o Breslow), pulido con
# eps = 1e-12, con sus pruebas, la concordancia y la prueba de riesgos proporcionales de cox.zph.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
suppressPackageStartupMessages(library(survival))

na_a_texto <- function(v) { v <- as.numeric(v); ifelse(is.na(v), NA, v) }

ref_km <- function(datos, tiempo, evento, grupo = "", conf = "log", nivel = 0.95, rho = 0, estrato = "") {
  d <- datos[!is.na(datos[[tiempo]]) & !is.na(datos[[evento]]) & (if (nzchar(grupo)) !is.na(datos[[grupo]]) else TRUE) & (if (nzchar(estrato)) !is.na(datos[[estrato]]) else TRUE), ]
  f <- if (nzchar(grupo)) as.formula(sprintf("Surv(%s, %s) ~ %s", tiempo, evento, grupo)) else as.formula(sprintf("Surv(%s, %s) ~ 1", tiempo, evento))
  fit <- survfit(f, data = d, conf.type = conf, conf.int = nivel)
  q <- quantile(fit, c(0.25, 0.5, 0.75))
  estratos <- if (is.null(fit$strata)) rep(1L, length(fit$time)) else rep(seq_along(fit$strata), fit$strata)
  niveles <- if (nzchar(grupo)) levels(factor(d[[grupo]])) else "todos"
  grupos <- lapply(seq_along(niveles), function(k) {
    i <- which(estratos == k)
    qq <- function(m) if (is.matrix(m)) unname(m[k, ]) else unname(m)
    list(nombre = niveles[k], n = if (nzchar(grupo)) sum(d[[grupo]] == niveles[k]) else nrow(d),
         eventos = sum(fit$n.event[i]),
         curva = list(tiempo = fit$time[i], n_riesgo = fit$n.risk[i], eventos = fit$n.event[i], censuras = fit$n.censor[i],
                      S = fit$surv[i], ee = fit$std.err[i], inf = fit$lower[i], sup = fit$upper[i]),
         cuantiles = list(tiempo = qq(q$quantile), inf = qq(q$lower), sup = qq(q$upper)))
  })
  out <- list(grupos = grupos)
  if (nzchar(grupo)) {
    sd <- survdiff(as.formula(sprintf("Surv(%s, %s) ~ %s%s", tiempo, evento, grupo, if (nzchar(estrato)) sprintf(" + strata(%s)", estrato) else "")), data = d, rho = rho)
    # con estratos, survdiff da observados y esperados por grupo × estrato: la prueba usa la suma de cada grupo
    obs <- if (is.matrix(sd$obs)) rowSums(sd$obs) else sd$obs; esp <- if (is.matrix(sd$exp)) rowSums(sd$exp) else sd$exp
    gl <- sum(esp > 0) - 1
    out$comparacion <- list(observados = unname(obs), esperados = unname(esp), varianza = unname(sd$var), chi2 = sd$chisq, gl = gl,
                            p = pchisq(sd$chisq, gl, lower.tail = FALSE))
  }
  out
}

ref_cox <- function(datos, tiempo, evento, factores = character(0), covariables = character(0), empates = "efron", nivel = 0.95, estrato = "") {
  vars <- c(factores, covariables)
  d <- datos[stats::complete.cases(datos[, c(tiempo, evento, vars, if (nzchar(estrato)) estrato)]), ]
  for (f in factores) d[[f]] <- factor(d[[f]])
  form <- as.formula(sprintf("Surv(%s, %s) ~ %s%s", tiempo, evento, paste(vars, collapse = " + "), if (nzchar(estrato)) sprintf(" + strata(%s)", estrato) else ""))
  fit <- coxph(form, data = d, ties = empates, control = coxph.control(eps = 1e-12, toler.chol = 1e-13, iter.max = 100))
  s <- summary(fit, conf.int = nivel)
  z <- qnorm(1 - (1 - nivel) / 2)
  b <- unname(coef(fit)); ee <- unname(sqrt(diag(fit$var)))
  zph <- cox.zph(fit)
  cc <- fit$concordance
  list(coef = b, ee = ee, z = b / ee, p = 2 * pnorm(-abs(b / ee)), hr = exp(b), hr_inf = exp(b - z * ee), hr_sup = exp(b + z * ee),
       ll0 = fit$loglik[1], ll = fit$loglik[2],
       lr = unname(s$logtest["test"]), score = unname(s$sctest["test"]), wald = unname(fit$wald.test), gl = length(b),   # summary() redondea Wald a 2 decimales
       p_lr = unname(s$logtest["pvalue"]), p_score = unname(s$sctest["pvalue"]), p_wald = pchisq(unname(fit$wald.test), length(b), lower.tail = FALSE),
       n = fit$n, eventos = fit$nevent,
       concordancia = list(concordantes = unname(cc["concordant"]), discordantes = unname(cc["discordant"]), empates_x = unname(cc["tied.x"]),
                           C = unname(cc["concordance"])),
       zph = list(chi2 = unname(zph$table[, "chisq"]), gl = unname(zph$table[, "df"]), p = unname(zph$table[, "p"])),
       nombres = names(coef(fit)))
}
