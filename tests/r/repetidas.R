# SigmaPro — referencia de las medidas repetidas en el tiempo (nlme::gls + emmeans en el R de escritorio). Calcula lo
# mismo que el método de la app: cada estructura de covarianza candidata por REML (npar, logLik, AIC, BIC), la elegida,
# su ANOVA marginal, coeficientes, parámetros de correlación y de varianza, σ, la matriz de covarianzas entre fechas de
# una unidad completa, el ajuste y las medias marginales con sus pares (gl del error de nlme, N − p).
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Sin library(): las funciones se llaman con nlme:: y emmeans::.
suppressPackageStartupMessages({ requireNamespace("nlme"); requireNamespace("emmeans") })
emmeans::emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

rp_v <- function(x) I(unname(as.numeric(x)))
rp_tx <- function(x) I(unname(as.character(x)))

ref_repetidas <- function(datos, y, tiempo, sujeto, trats = character(0), bloque = "", estructuras = NULL, forzada = "", criterio = "aic",
                          comparar = NULL, dentro = NULL, ajuste = "tukey", nivel = 0.95) {
  d <- datos
  num <- is.numeric(d[[tiempo]])
  tnum <- if (num) d[[tiempo]] / min(diff(sort(unique(d[[tiempo]])))) else NULL   # en unidades del intervalo más corto (como la app)
  d[[tiempo]] <- factor(d[[tiempo]])
  d$.orden <- as.integer(d[[tiempo]])
  d$.tnum <- if (num) tnum else d$.orden
  for (v in trats) if (is.numeric(d[[v]])) d[[v]] <- factor(d[[v]])
  d$.unidad <- interaction(d[c(sujeto, trats, if (nzchar(bloque)) bloque)], drop = TRUE, lex.order = TRUE)
  d <- d[order(d$.unidad, d$.orden), ]
  fijos <- paste0(if (length(trats)) paste0(paste(trats, collapse = " * "), " * ") else "", tiempo, if (nzchar(bloque)) paste0(" + ", bloque) else "")
  f <- as.formula(paste(y, "~", fijos))
  vi <- nlme::varIdent(form = as.formula(paste("~ 1 |", tiempo)))
  todas <- list(
    independiente = list(cor = NULL, pesos = NULL),
    cs = list(cor = nlme::corCompSymm(form = ~ .orden | .unidad), pesos = NULL),
    csh = list(cor = nlme::corCompSymm(form = ~ .orden | .unidad), pesos = vi),
    ar1 = list(cor = nlme::corAR1(form = ~ .orden | .unidad), pesos = NULL),
    arh1 = list(cor = nlme::corAR1(form = ~ .orden | .unidad), pesos = vi),
    car1 = list(cor = nlme::corCAR1(form = ~ .tnum | .unidad), pesos = NULL),
    un = list(cor = nlme::corSymm(form = ~ .orden | .unidad), pesos = vi))
  k <- nlevels(d[[tiempo]])
  if (is.null(estructuras)) estructuras <- names(todas)
  estructuras <- estructuras[estructuras != "car1" | num]
  estructuras <- estructuras[estructuras != "un" | k <= 8 | estructuras == forzada]
  if (nzchar(forzada) && !forzada %in% estructuras) estructuras <- c(estructuras, forzada)
  datos_gls <- d
  aj <- lapply(todas[estructuras], function(s) tryCatch({
    args <- list(model = f, data = quote(datos_gls), method = "REML", na.action = stats::na.omit)
    if (!is.null(s$cor)) args$correlation <- s$cor
    if (!is.null(s$pesos)) args$weights <- s$pesos
    do.call(nlme::gls, args)
  }, error = function(e) conditionMessage(e)))
  info <- function(fn) vapply(aj, function(m) if (is.character(m)) NA_real_ else fn(m), 0)
  crit <- if (criterio == "bic") info(BIC) else info(AIC)
  elegida <- if (nzchar(forzada)) forzada else names(crit)[which.min(crit)]
  m <- aj[[elegida]]
  gle <- m$dims$N - m$dims$p
  a <- anova(m, type = "marginal"); a <- a[rownames(a) != "(Intercept)", , drop = FALSE]
  tt <- summary(m)$tTable
  cs <- m$modelStruct$corStruct; vs <- m$modelStruct$varStruct
  g <- nlme::getGroups(m); kk <- which.max(tabulate(as.integer(g)))
  V <- if (is.null(cs)) NULL else unclass(nlme::getVarCov(m, individual = kk))
  uso <- datos_gls[names(residuals(m)), ]
  if (is.null(comparar)) { comparar <- if (length(trats)) trats[1] else tiempo; if (is.null(dentro)) dentro <- if (length(trats)) tiempo else "" }
  if (is.null(dentro)) dentro <- ""
  medias <- lapply(setdiff(comparar, dentro), function(fc) {
    e <- if (nzchar(dentro)) emmeans::emmeans(m, specs = fc, by = dentro, mode = "df.error", data = datos_gls) else emmeans::emmeans(m, specs = fc, mode = "df.error", data = datos_gls)
    e <- update(e, df = gle)
    em <- as.data.frame(summary(e, level = nivel, infer = c(TRUE, FALSE)))
    pr <- as.data.frame(pairs(e, adjust = ajuste))
    list(factor = fc,
         filas = lapply(seq_len(nrow(em)), function(i) list(nivel = as.character(em[[fc]][i]), media = em$emmean[i], ee = em$SE[i], gl = em$df[i], ic = I(c(em$lower.CL[i], em$upper.CL[i])))),
         pares = lapply(seq_len(nrow(pr)), function(i) list(contraste = as.character(pr$contrast[i]), dif = pr$estimate[i], ee = pr$SE[i], gl = pr$df[i], t = pr$t.ratio[i], p = pr$p.value[i])))
  })
  list(estructuras = list(clave = rp_tx(names(aj))),   # (npar, logLik, AIC y BIC de cada una: abajo, en «estructuras_filas»)
       elegida = elegida, gl = gle,
       anova = list(termino = rp_tx(rownames(a)), gl1 = rp_v(a$numDF), F = rp_v(a[["F-value"]]), p = rp_v(a[["p-value"]])),
       coeficientes = list(nombre = rp_tx(rownames(tt)), estimado = rp_v(tt[, 1]), ee = rp_v(tt[, 2]), t = rp_v(tt[, 3]), p = rp_v(tt[, 4])),
       correlacion = if (is.null(cs)) NULL else list(valor = rp_v(coef(cs, unconstrained = FALSE))),
       varianzas = if (is.null(vs)) NULL else list(nivel = rp_tx(names(coef(vs, unconstrained = FALSE, allCoef = TRUE))), razon = rp_v(coef(vs, unconstrained = FALSE, allCoef = TRUE))),
       sigma = m$sigma,
       covarianza = if (is.null(V)) NULL else list(tiempos = rp_tx(uso[[tiempo]][uso$.unidad == levels(g)[kk]]), matriz = unname(V)),
       ajuste = list(n = m$dims$N, logLik = as.numeric(logLik(m)), AIC = AIC(m), BIC = BIC(m)),
       medias = medias,
       .tabla = list(npar = info(function(x) attr(logLik(x), "df")), logLik = info(function(x) as.numeric(logLik(x))), AIC = info(AIC), BIC = info(BIC)))
}

#' El esperado del caso: las estructuras como filas { clave, npar, logLik, AIC, BIC } (las que no se ajustan, sin números).
esperado_repetidas <- function(r) {
  t <- r$.tabla
  r$estructuras <- lapply(seq_along(r$estructuras$clave), function(i) {
    x <- list(clave = r$estructuras$clave[[i]])
    if (!is.na(t$AIC[i])) x <- c(x, list(npar = t$npar[[i]], logLik = t$logLik[[i]], AIC = t$AIC[[i]], BIC = t$BIC[[i]]))
    x
  })
  r$.tabla <- NULL
  r
}
