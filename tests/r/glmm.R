# SigmaPro — referencia de los modelos lineales generalizados mixtos (lme4::glmer y glmer.nb, car::Anova y emmeans en el
# R de escritorio). Calcula lo mismo que los métodos de la app, que corren en el motor R del navegador:
# - el ajuste por aproximación de Laplace con el control estricto de la app (bobyqa con rhoend = 1e-12 y la tolerancia
#   del ajuste interno tolPwrss = 1e-12: con las de omisión, glmer se queda hasta 1e-5 del óptimo y su log-verosimilitud
#   se desvía 3e-6 por el ajuste interno sin converger);
# - el efecto por observación para la sobredispersión: «si», «no» o «auto» (si la prueba de Pearson del modelo sin él da
#   p < 0.05, con conteos o proporciones agrupadas);
# - los EE de la hessiana de la verosimilitud de Laplace (lo de omisión de lme4) y, con la binomial negativa o un ajuste
#   singular, de RX (lme4 2.0 no calcula ahí la hessiana; la 1.1 del escritorio sí: se fija RX en los dos lados);
# - las pruebas χ² de Wald de los efectos fijos (car::Anova tipo II; el III con contrastes de suma cero, reajustado desde
#   las θ del modelo), los coeficientes (summary), las razones de momios o de tasas (Wald), las varianzas de los
#   efectos aleatorios, el ajuste (logLik, AIC, BIC, Pearson χ²/gl) y las medias en la escala de la respuesta con sus
#   pares (emmeans, offset = 0).
# Sin library(): lme4::, car::, emmeans::.
suppressPackageStartupMessages({ requireNamespace("lme4"); requireNamespace("car"); requireNamespace("emmeans") })
emmeans::emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

GM_CTRL <- lme4::glmerControl(optimizer = "bobyqa", tolPwrss = 1e-12, optCtrl = list(rhobeg = 0.2, rhoend = 1e-12, maxfun = 1e5))
gm_v <- function(x) I(unname(as.numeric(x)))
gm_tx <- function(x) I(unname(as.character(x)))
gm_enlaceR <- function(e) if (e == "inverso") "inverse" else if (e == "identidad") "identity" else e

gm_ajusta <- function(f, d, familia, enlace, contrastes = NULL, start = NULL) {
  if (familia == "binomial-negativa") {
    args <- list(formula = f, data = d, control = GM_CTRL)
    if (!is.null(contrastes)) args$contrasts <- contrastes
    return(do.call(lme4::glmer.nb, args))
  }
  fam <- if (familia == "binomial") stats::binomial(gm_enlaceR(enlace)) else stats::poisson(gm_enlaceR(enlace))
  lme4::glmer(f, family = fam, data = d, control = GM_CTRL, contrasts = contrastes, start = start)
}

#' @param derecha  el lado derecho con sus términos aleatorios, como lo escribe la app: «tratamiento + (1 | bloque)»
ref_glmm <- function(datos, y, derecha, familia, enlace, ensayos = "", exposicion = "", comoFactor = character(0), olre = "no", tipo = 2,
                     comparar = character(0), dentro = "", ajuste = "tukey", nivel = 0.95) {
  d <- datos
  vars <- all.vars(stats::as.formula(paste("~", derecha)))
  usadas <- unique(c(y, vars, if (nzchar(ensayos)) ensayos, if (nzchar(exposicion)) exposicion))
  d <- d[stats::complete.cases(d[usadas]), , drop = FALSE]
  for (v in vars) if (v %in% comoFactor || is.character(d[[v]]) || is.factor(d[[v]])) d[[v]] <- factor(d[[v]])
  d$.obs <- factor(seq_len(nrow(d)))
  izq <- if (nzchar(ensayos)) sprintf("cbind(%s, %s - %s)", y, ensayos, y) else y
  forma <- function(conObs) stats::as.formula(paste(izq, "~", derecha, if (conObs) "+ (1 | .obs)" else "", if (nzchar(exposicion)) sprintf("+ offset(log(%s))", exposicion) else ""))
  agrupada <- !(familia == "binomial" && !nzchar(ensayos)) && familia != "binomial-negativa"
  prueba <- NULL; usaObs <- olre == "si" && agrupada
  if (olre == "auto" && agrupada) {
    m0 <- gm_ajusta(forma(FALSE), d, familia, enlace)
    pr <- sum(stats::residuals(m0, type = "pearson")^2); gl <- stats::df.residual(m0)
    prueba <- list(razon = pr / gl, p = stats::pchisq(pr, gl, lower.tail = FALSE))
    usaObs <- prueba$p < 0.05
  }
  f <- forma(usaObs)
  m <- gm_ajusta(f, d, familia, enlace)
  # EE: la hessiana, salvo con la binomial negativa o un ajuste singular, que van con RX (lo que hace lme4 2.0; la 1.1 usa la hessiana)
  gm_V <- function(x) as.matrix(if (familia == "binomial-negativa" || lme4::isSingular(x)) suppressWarnings(lme4::vcov.merMod(x, use.hessian = FALSE)) else stats::vcov(x))
  V <- gm_V(m)
  a <- if (tipo == 3) {
    fx <- names(Filter(is.factor, d[intersect(all.vars(lme4::nobars(stats::as.formula(paste("~", derecha)))), names(d))]))   # solo los factores fijos
    m3 <- gm_ajusta(f, d, familia, enlace, contrastes = stats::setNames(rep(list("contr.sum"), length(fx)), fx),
                    start = if (familia == "binomial-negativa") NULL else list(theta = lme4::getME(m, "theta")))
    car::Anova(m3, type = 3, vcov. = gm_V(m3))
  } else car::Anova(m, type = 2, vcov. = V)
  a <- a[rownames(a) != "(Intercept)", , drop = FALSE]
  b <- lme4::fixef(m); se <- sqrt(diag(V)); cf <- cbind(b, se, b / se, 2 * stats::pnorm(-abs(b / se)))
  rz <- enlace %in% c("log", "logit"); z <- stats::qnorm(1 - (1 - nivel) / 2)
  vc <- as.data.frame(lme4::VarCorr(m))
  pr <- sum(stats::residuals(m, type = "pearson")^2)
  out <- list(
    obs = list(usado = usaObs, razon = if (is.null(prueba)) NA_real_ else prueba$razon, p = if (is.null(prueba)) NA_real_ else prueba$p),
    wald = list(termino = gm_tx(rownames(a)), chi2 = gm_v(a$Chisq), gl = gm_v(a$Df), p = gm_v(a[["Pr(>Chisq)"]])),
    coeficientes = list(nombre = gm_tx(names(b)), estimado = gm_v(cf[, 1]), ee = gm_v(cf[, 2]), z = gm_v(cf[, 3]), p = gm_v(cf[, 4])),
    varianzas = list(grupo = gm_tx(vc$grp[vc$grp != "Residual"]), varianza = gm_v(vc$vcov[vc$grp != "Residual"])),
    ajuste = list(n = stats::nobs(m), logLik = as.numeric(stats::logLik(m)), AIC = stats::AIC(m), BIC = stats::BIC(m),
                  pearson = pr, gl = stats::df.residual(m), dispersion = pr / stats::df.residual(m)))
  if (rz) out$razones <- list(razon = gm_v(exp(cf[, 1])), ic_inf = gm_v(exp(cf[, 1] - z * cf[, 2])), ic_sup = gm_v(exp(cf[, 1] + z * cf[, 2])))
  if (familia == "binomial-negativa") out$theta <- lme4::getME(m, "glmer.nb.theta")
  if (length(comparar)) {
    out$medias <- lapply(setdiff(comparar, dentro), function(fc) {
      e <- emmeans::emmeans(m, specs = fc, by = if (nzchar(dentro)) dentro else NULL, offset = 0, data = d, vcov. = V)
      s <- as.data.frame(summary(e, infer = c(FALSE, FALSE)))
      r <- as.data.frame(summary(e, type = "response", level = nivel))
      pa <- as.data.frame(summary(pairs(e, adjust = ajuste), infer = c(FALSE, TRUE)))
      lo <- grep("LCL$|^lower.CL$", names(r), value = TRUE); hi <- grep("UCL$|^upper.CL$", names(r), value = TRUE)
      rc <- setdiff(names(r), c(fc, dentro, "SE", "df", lo, hi))[1]
      list(factor = fc,
           filas = lapply(seq_len(nrow(s)), function(i) list(nivel = as.character(s[[fc]][i]), eta = s$emmean[i], ee_eta = s$SE[i],
                                                       respuesta = r[[rc]][i], ee = r$SE[i], ic = I(sort(c(r[[lo]][i], r[[hi]][i]))))),
           pares = lapply(seq_len(nrow(pa)), function(i) {
             x <- list(dif = pa$estimate[i], ee = pa$SE[i], estadistico = pa[[grep("ratio$", names(pa), value = TRUE)[1]]][i], p = pa$p.value[i])
             if (rz) x$razon <- exp(pa$estimate[i])
             x
           }))
    })
  }
  out
}
