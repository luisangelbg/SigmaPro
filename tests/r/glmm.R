# SigmaPro — referencia de los modelos lineales generalizados mixtos (lme4::glmer y glmer.nb, car::Anova y emmeans en el
# R de escritorio). Calcula lo mismo que los métodos de la app, que corren en el motor R del navegador:
# - el ajuste por aproximación de Laplace con el control estricto de la app (bobyqa con rhoend = 1e-12 y la tolerancia
#   del ajuste interno tolPwrss = 1e-12: con las de omisión, glmer se queda hasta 1e-5 del óptimo y su log-verosimilitud
#   se desvía 3e-6 por el ajuste interno sin converger);
# - el efecto por observación para la sobredispersión: «si», «no» o «auto» (si la prueba de Pearson del modelo sin él da
#   p < 0.05 y razón > 1.1, como en el GLM; con conteos o proporciones agrupadas);
# - los EE de la hessiana de la verosimilitud de Laplace (lo de omisión de lme4) y, con la binomial negativa o un ajuste
#   singular, de RX (lme4 2.0 no calcula ahí la hessiana; la 1.1 del escritorio sí: se fija RX en los dos lados);
# - las pruebas χ² de Wald de los efectos fijos (car::Anova tipo II; el III con contrastes de suma cero, reajustado desde
#   las θ del modelo), los coeficientes (summary), las razones de momios o de tasas (Wald), las varianzas de los
#   efectos aleatorios, el ajuste (logLik, AIC, BIC, Pearson χ²/gl) y las medias en la escala de la respuesta con sus
#   pares (emmeans, offset = 0).
# - Hito 4.3: la familia gamma (con sigma), la cuadratura adaptativa de Gauss-Hermite (nAGQ > 1, con un solo intercepto
#   aleatorio; con el efecto por observación vuelve a Laplace) y la prueba de razón de verosimilitudes de cada efecto
#   aleatorio contra el modelo sin él (glmer, o glm / MASS::glm.nb si no queda ninguno); la gamma va sin ella (su
#   verosimilitud de Laplace no se compara con la de glm) y la cuadratura solo con la binomial y la de Poisson.
# Sin library(): lme4::, car::, emmeans::.
suppressPackageStartupMessages({ requireNamespace("lme4"); requireNamespace("car"); requireNamespace("emmeans") })
emmeans::emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

GM_CTRL <- lme4::glmerControl(optimizer = "bobyqa", tolPwrss = 1e-12, optCtrl = list(rhobeg = 0.2, rhoend = 1e-12, maxfun = 1e5))
gm_v <- function(x) I(unname(as.numeric(x)))
gm_tx <- function(x) I(unname(as.character(x)))
gm_enlaceR <- function(e) if (e == "inverso") "inverse" else if (e == "identidad") "identity" else e

gm_fam <- function(familia, enlace) switch(familia, binomial = stats::binomial(gm_enlaceR(enlace)), poisson = stats::poisson(gm_enlaceR(enlace)), gamma = stats::Gamma(gm_enlaceR(enlace)))
gm_ajusta <- function(f, d, familia, enlace, contrastes = NULL, start = NULL, nAGQ = 1L) {
  if (familia == "binomial-negativa") {
    args <- list(formula = f, data = d, control = GM_CTRL, nAGQ = nAGQ)
    if (!is.null(contrastes)) args$contrasts <- contrastes
    return(do.call(lme4::glmer.nb, args))
  }
  lme4::glmer(f, family = gm_fam(familia, enlace), data = d, control = GM_CTRL, contrasts = contrastes, start = start, nAGQ = nAGQ)
}
gm_glm <- function(f, d, familia, enlace) {
  ctl <- stats::glm.control(epsilon = 1e-12, maxit = 100)
  if (familia == "binomial-negativa") MASS::glm.nb(f, data = d, control = ctl) else stats::glm(f, family = gm_fam(familia, enlace), data = d, control = ctl)
}

#' @param derecha  el lado derecho con sus términos aleatorios, como lo escribe la app: «tratamiento + (1 | bloque)»
ref_glmm <- function(datos, y, derecha, familia, enlace, ensayos = "", exposicion = "", comoFactor = character(0), olre = "no", tipo = 2,
                     comparar = character(0), dentro = "", ajuste = "tukey", nivel = 0.95, nagq = 1L, pruebaAleatorios = TRUE) {
  d <- datos
  vars <- all.vars(stats::as.formula(paste("~", derecha)))
  usadas <- unique(c(y, vars, if (nzchar(ensayos)) ensayos, if (nzchar(exposicion)) exposicion))
  d <- d[stats::complete.cases(d[usadas]), , drop = FALSE]
  for (v in vars) if (v %in% comoFactor || is.character(d[[v]]) || is.factor(d[[v]])) d[[v]] <- factor(d[[v]])
  d$.obs <- factor(seq_len(nrow(d)))
  izq <- if (nzchar(ensayos)) sprintf("cbind(%s, %s - %s)", y, ensayos, y) else y
  forma <- function(conObs) stats::as.formula(paste(izq, "~", derecha, if (conObs) "+ (1 | .obs)" else "", if (nzchar(exposicion)) sprintf("+ offset(log(%s))", exposicion) else ""))
  agrupada <- !(familia == "binomial" && !nzchar(ensayos)) && !familia %in% c("binomial-negativa", "gamma")
  prueba <- NULL; usaObs <- olre == "si" && agrupada
  if (olre == "auto" && agrupada) {
    m0 <- gm_ajusta(forma(FALSE), d, familia, enlace, nAGQ = nagq)
    pr <- sum(stats::residuals(m0, type = "pearson")^2); gl <- stats::df.residual(m0)
    prueba <- list(razon = pr / gl, p = stats::pchisq(pr, gl, lower.tail = FALSE))
    usaObs <- prueba$p < 0.05 && prueba$razon > 1.1
  }
  nq <- if (usaObs) 1L else as.integer(nagq)
  f <- forma(usaObs)
  m <- gm_ajusta(f, d, familia, enlace, nAGQ = nq)
  # EE: la hessiana, salvo con la binomial negativa o un ajuste singular, que van con RX (lo que hace lme4 2.0; la 1.1 usa la hessiana)
  gm_V <- function(x) as.matrix(if (familia == "binomial-negativa" || lme4::isSingular(x)) suppressWarnings(lme4::vcov.merMod(x, use.hessian = FALSE)) else stats::vcov(x))
  V <- gm_V(m)
  a <- if (tipo == 3) {
    fx <- names(Filter(is.factor, d[intersect(all.vars(lme4::nobars(stats::as.formula(paste("~", derecha)))), names(d))]))   # solo los factores fijos
    m3 <- gm_ajusta(f, d, familia, enlace, contrastes = stats::setNames(rep(list("contr.sum"), length(fx)), fx),
                    start = if (familia == "binomial-negativa") NULL else list(theta = lme4::getME(m, "theta")), nAGQ = nq)
    car::Anova(m3, type = 3, vcov. = gm_V(m3))
  } else car::Anova(m, type = 2, vcov. = V)
  a <- a[rownames(a) != "(Intercept)", , drop = FALSE]
  b <- lme4::fixef(m); se <- sqrt(diag(V)); cf <- cbind(b, se, b / se, 2 * stats::pnorm(-abs(b / se)))
  rz <- enlace %in% c("log", "logit"); z <- stats::qnorm(1 - (1 - nivel) / 2)
  vc <- as.data.frame(lme4::VarCorr(m))
  if (familia == "gamma") {   # (θ·σ)²: lo que da VarCorr de lme4 1.1; la app lo calcula aparte porque lme4 2.0 da θ²
    th <- lme4::getME(m, "theta") * stats::sigma(m)
    vc <- data.frame(grp = names(lme4::getME(m, "cnms")), vcov = th^2, stringsAsFactors = FALSE)
    stopifnot(max(abs(vc$vcov - as.data.frame(lme4::VarCorr(m))$vcov[seq_along(th)])) < 1e-12 * max(1, vc$vcov) || packageVersion("lme4") >= "2.0")
  }
  pr <- sum(stats::residuals(m, type = "pearson")^2)
  out <- list(
    obs = list(usado = usaObs, razon = if (is.null(prueba)) NA_real_ else prueba$razon, p = if (is.null(prueba)) NA_real_ else prueba$p),
    wald = list(termino = gm_tx(rownames(a)), chi2 = gm_v(a$Chisq), gl = gm_v(a$Df), p = gm_v(a[["Pr(>Chisq)"]])),
    coeficientes = list(nombre = gm_tx(names(b)), estimado = gm_v(cf[, 1]), ee = gm_v(cf[, 2]), z = gm_v(cf[, 3]), p = gm_v(cf[, 4])),
    varianzas = list(grupo = gm_tx(vc$grp[vc$grp != "Residual"]), varianza = gm_v(vc$vcov[vc$grp != "Residual"])),
    ajuste = list(n = stats::nobs(m), logLik = as.numeric(stats::logLik(m)), AIC = stats::AIC(m), BIC = stats::BIC(m),
                  pearson = pr, gl = stats::df.residual(m), dispersion = pr / stats::df.residual(m), nagq = nq))
  # con nAGQ > 1, lme4 omite la log-verosimilitud del saturado: se suma, y se coteja con la integral directa de la
  # verosimilitud marginal (integrate, grupo por grupo, en los parámetros del ajuste): otra cuenta, la misma cantidad
  if (nq > 1) {
    yv <- lme4::getME(m, "y"); wv <- stats::weights(m)
    lsat <- if (familia == "binomial") sum(stats::dbinom(round(yv * wv), round(wv), yv, log = TRUE)) else sum(stats::dpois(yv, yv, log = TRUE))
    out$ajuste$logLik <- out$ajuste$logLik + lsat; out$ajuste$AIC <- out$ajuste$AIC - 2 * lsat; out$ajuste$BIC <- out$ajuste$BIC - 2 * lsat
    eta0 <- drop(lme4::getME(m, "X") %*% lme4::fixef(m)) + (if (is.null(stats::model.offset(stats::model.frame(m)))) 0 else stats::model.offset(stats::model.frame(m)))
    gr <- lme4::getME(m, "flist")[[1]]; s <- sqrt(lme4::VarCorr(m)[[1]][1])
    ld <- sum(vapply(levels(gr), function(h) {
      i <- gr == h
      f <- function(u) vapply(u, function(v) { mu <- stats::family(m)$linkinv(eta0[i] + v)
        exp(sum(if (familia == "binomial") stats::dbinom(round(yv[i] * wv[i]), round(wv[i]), mu, log = TRUE) else stats::dpois(yv[i], mu, log = TRUE))) * stats::dnorm(v, 0, s) }, 0)
      log(stats::integrate(f, -Inf, Inf, rel.tol = 1e-12)$value)
    }, 0))
    stopifnot(abs(ld - out$ajuste$logLik) < 1e-5 * abs(ld))
  }
  if (familia == "gamma") out$ajuste$sigma <- stats::sigma(m)
  if (pruebaAleatorios && familia != "gamma") {
    fijos <- paste(deparse(lme4::nobars(stats::as.formula(paste("~", derecha)))[[2]]), collapse = "")
    aleat <- c(vapply(lme4::findbars(stats::as.formula(paste("~", derecha))), function(b) paste0("(", paste(deparse(b), collapse = ""), ")"), ""), if (usaObs) "(1 | .obs)")
    l1 <- stats::logLik(m); llM <- out$ajuste$logLik
    rv <- lapply(seq_along(aleat), function(k) {
      fk <- stats::as.formula(paste(izq, "~", fijos, paste(c("", aleat[-k]), collapse = " + "), if (nzchar(exposicion)) sprintf("+ offset(log(%s))", exposicion) else ""))
      mk <- suppressWarnings(if (length(aleat) > 1) gm_ajusta(fk, d, familia, enlace) else gm_glm(fk, d, familia, enlace))
      l0 <- stats::logLik(mk); g <- attr(l1, "df") - attr(l0, "df"); x <- 2 * (llM - as.numeric(l0))
      list(termino = aleat[k], gl = g, lrt = x, p = stats::pchisq(max(x, 0), g, lower.tail = FALSE))
    })
    out$pruebaAleatorios <- list(termino = gm_tx(vapply(rv, function(x) x$termino, "")), gl = gm_v(vapply(rv, function(x) x$gl, 0)),
                                 lrt = gm_v(vapply(rv, function(x) x$lrt, 0)), p = gm_v(vapply(rv, function(x) x$p, 0)))
  }
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
