# Tablas de contingencia: ji cuadrada, G², residuos, Fisher exacta, medidas de asociación, McNemar, Cochran-Mantel-Haenszel
# y kappa.
suppressPackageStartupMessages({ library(psych); library(MASS) })

F_TEA <- "Fisher (1935), The Design of Experiments (la dama que prueba el té; ejemplo de fisher.test)"
F_CONV <- "Fisher (1962), Confidence limits for a cross-product ratio, Aust. J. Stat. 4: 41 (gemelos y condenas; ejemplo de fisher.test)"
F_HAIR <- "Snee (1974), Graphical display of two-way contingency tables, Am. Stat. 28: 9-12; conjunto HairEyeColor de R"
F_JOB <- "Agresti (1990), Categorical Data Analysis, p. 21 (satisfacción laboral e ingreso; ejemplo de fisher.test)"
F_OCC <- "Glass (1954), Social Mobility in Britain; conjunto occupationalStatus de R"
F_APPROVAL <- "Agresti (1990), Categorical Data Analysis, p. 350 (aprobación presidencial; ejemplo de mcnemar.test)"
F_UCB <- "Bickel, Hammel y O'Connell (1975), Science 187: 398-403; conjunto UCBAdmissions de R"
F_RABBITS <- "Mantel (1963), J. Am. Stat. Assoc. 58: 690-700 (penicilina en conejos; ejemplo de mantelhaen.test)"
F_SATIS <- "Agresti (1990), Categorical Data Analysis, p. 287 (satisfacción por ingreso y sexo; ejemplo de mantelhaen.test)"
F_COHEN <- "Cohen (1968), Psychol. Bull. 70: 213-220 (ejemplo de psych::cohen.kappa, 200 casos)"

v <- function(x) I(unname(as.numeric(x)))
filas <- function(m) lapply(seq_len(nrow(m)), function(i) v(m[i, ]))
# tabla → datos con columna de frecuencias (los niveles en el orden de la tabla)
a_datos <- function(tab, nombres) { d <- as.data.frame(as.table(tab), stringsAsFactors = TRUE); names(d) <- c(nombres, "n"); d }

ref_indep <- function(tab, correccion = TRUE, alternativa = "two.sided", nivel = 0.95, fisher = TRUE) {
  tab <- tab[rowSums(tab) > 0, colSums(tab) > 0, drop = FALSE]
  ch <- suppressWarnings(chisq.test(tab, correct = correccion)); E <- ch$expected
  G2 <- 2 * sum(tab[tab > 0] * log(tab[tab > 0] / E[tab > 0]))
  out <- list(X2 = unname(ch$statistic), gl = unname(ch$parameter), p = ch$p.value, G2 = G2, p_G2 = pchisq(G2, ch$parameter, lower.tail = FALSE),
              esperados = filas(E), residuos = filas(ch$residuals), ajustados = filas(ch$stdres))
  if (fisher) {
    ft <- fisher.test(tab, alternative = alternativa, conf.level = nivel, workspace = 2e8)
    out$fisher <- if (all(dim(tab) == 2)) list(p = ft$p.value, razon_momios = unname(ft$estimate), ic = v(ft$conf.int)) else list(p = ft$p.value)
  }
  out
}
ALT <- c(bilateral = "two.sided", mayor = "greater", menor = "less")
caso_indep <- function(nombre, titulo, fuente, tab, nombres = c("fila", "columna"), correccion = TRUE, alternativa = "bilateral", nivel = 0.95, fisher = TRUE, crudos = FALSE) {
  d <- a_datos(tab, nombres)
  e <- list(fila = nombres[1], columna = nombres[2], frecuencia = "n")
  if (crudos) { d <- d[rep(seq_len(nrow(d)), d$n), nombres]; rownames(d) <- NULL; e$frecuencia <- NULL }
  sp_caso(nombre, objetivo = "cont.independenciaDe", titulo = titulo, fuente = fuente, datos = d,
    argumentos = list(list(tabla = TRUE), e, list(correccion = correccion, alternativa = alternativa, nivel = nivel)),
    esperado = ref_indep(tab, correccion, ALT[[alternativa]], nivel, fisher),
    codigo = sprintf("chisq.test(tabla, correct = %s); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"%s\", conf.level = %s)", correccion, ALT[[alternativa]], nivel))
}
tea <- matrix(c(3, 1, 1, 3), 2, dimnames = list(Adivina = c("Leche", "Te"), Real = c("Leche", "Te")))
caso_indep("te-bilateral", "2 × 2 con Fisher bilateral", F_TEA, tea)
caso_indep("te-mayor", "2 × 2 con Fisher de una cola (mayor)", F_TEA, tea, alternativa = "mayor")
conv <- matrix(c(2, 10, 15, 3), 2, dimnames = list(Gemelos = c("Dicigoticos", "Monocigoticos"), Condena = c("Si", "No")))
caso_indep("gemelos-menor", "2 × 2 con Fisher de una cola (menor) e IC al 99 %", F_CONV, conv, alternativa = "menor", nivel = 0.99)
caso_indep("gemelos-crudos", "2 × 2 con una fila por caso", F_CONV, conv, crudos = TRUE)
set.seed(101)
t22 <- matrix(c(43, 17, 28, 32), 2)
caso_indep("dos-por-dos-yates", "2 × 2 grande con Yates", "Datos sintéticos", t22)
caso_indep("dos-por-dos-sin-yates", "2 × 2 grande sin Yates", "Datos sintéticos", t22, correccion = FALSE)
hair <- margin.table(HairEyeColor, c(1, 2))
caso_indep("pelo-ojos", "4 × 4 con 592 casos (sin Fisher)", F_HAIR, hair, c("pelo", "ojos"), fisher = FALSE)
job <- matrix(c(1, 2, 1, 0, 3, 3, 6, 1, 10, 10, 14, 9, 6, 7, 12, 11), 4, 4, byrow = TRUE,
              dimnames = list(ingreso = c("<15k", "15-25k", "25-40k", ">40k"), satisfaccion = c("MuyInsatisfecho", "Poco", "Moderado", "Muy")))
caso_indep("satisfaccion-fisher", "4 × 4 con Fisher exacta (22 millones de nodos)", F_JOB, job, c("ingreso", "satisfaccion"))
caso_indep("dos-por-tres", "2 × 3 con Fisher", "Datos sintéticos", matrix(c(3, 2, 1, 6, 4, 1), 2), crudos = TRUE)
caso_indep("tres-por-tres", "3 × 3 con Fisher", "Datos sintéticos", matrix(c(2, 1, 6, 3, 4, 1, 0, 5, 2), 3))
caso_indep("con-cero", "Una fila sin datos se descarta", "Datos sintéticos", matrix(c(5, 0, 7, 3, 0, 9, 4, 0, 2), 3))

# medidas de asociación (fórmulas de Agresti, 2002, y Brown y Benedetti, 1977, en R base; τ-b se coteja con cor(method = "kendall"))
ref_medidas <- function(tab, nivel = 0.95) {
  x <- unclass(tab); R <- nrow(x); C <- ncol(x); n <- sum(x); sr <- rowSums(x); sc <- colSums(x)
  X2 <- suppressWarnings(chisq.test(x, correct = FALSE)$statistic); m <- min(R, C)
  A <- D <- matrix(0, R, C)
  for (i in 1:R) for (j in 1:C) {
    A[i, j] <- sum(x[row(x) > i & col(x) > j]) + sum(x[row(x) < i & col(x) < j])
    D[i, j] <- sum(x[row(x) > i & col(x) < j]) + sum(x[row(x) < i & col(x) > j])
  }
  P <- sum(x * A); Q <- sum(x * D); d <- A - D; sd2 <- sum(x * d^2) - (P - Q)^2 / n
  wr <- n^2 - sum(sr^2); wc <- n^2 - sum(sc^2); w <- sqrt(wr * wc); z <- qnorm((1 + nivel) / 2)
  med <- function(est, a1, a0) list(estimado = est, ee = a1, ee0 = a0, z = est / a0, p = 2 * pnorm(-abs(est / a0)), ic = v(est + c(-1, 1) * z * a1))
  tb <- (P - Q) / w
  stopifnot(abs(tb - cor(rep(row(x), x), rep(col(x), x), method = "kendall")) < 1e-12)
  H <- function(p) -sum(ifelse(p > 0, p * log(p), 0))
  Hr <- H(sr / n); Hc <- H(sc / n); Hrc <- H(x / n); I <- Hr + Hc - Hrc
  mf <- apply(x, 1, max); mc <- apply(x, 2, max)
  out <- list(
    phi = if (R == 2 && C == 2) (x[1, 1] * x[2, 2] - x[1, 2] * x[2, 1]) / sqrt(prod(sr) * prod(sc)) else sqrt(X2 / n),
    v_cramer = sqrt(X2 / (n * (m - 1))), contingencia = sqrt(X2 / (X2 + n)),
    lambda_c_r = (sum(mf) - max(sc)) / (n - max(sc)), lambda_r_c = (sum(mc) - max(sr)) / (n - max(sr)),
    lambda_simetrica = (sum(mf) + sum(mc) - max(sc) - max(sr)) / (2 * n - max(sc) - max(sr)),
    incertidumbre_c_r = I / Hc, incertidumbre_r_c = I / Hr, incertidumbre_simetrica = 2 * I / (Hr + Hc),
    gamma = med((P - Q) / (P + Q), 4 / (P + Q)^2 * sqrt(sum(x * (Q * A - P * D)^2)), 2 / (P + Q) * sqrt(sd2)),
    tau_b = med(tb, sqrt(sum(x * (2 * w * d + tb * outer(sr * wc, sc * wr, "+"))^2) - n^3 * tb^2 * (wr + wc)^2) / w^2, 2 / w * sqrt(sd2)),
    tau_c = med(m * (P - Q) / (n^2 * (m - 1)), 2 * m / ((m - 1) * n^2) * sqrt(sd2), 2 * m / ((m - 1) * n^2) * sqrt(sd2)),
    somers_c_r = med((P - Q) / wr, 2 / wr^2 * sqrt(sum(x * (wr * d - (P - Q) * outer(n - sr, rep(1, C)))^2)), 2 / wr * sqrt(sd2)),
    somers_r_c = med((P - Q) / wc, 2 / wc^2 * sqrt(sum(x * (wc * d - (P - Q) * outer(rep(1, R), n - sc))^2)), 2 / wc * sqrt(sd2)))
  if (R == 2 && C == 2) {
    y <- if (any(x == 0)) x + 0.5 else x
    or <- y[1, 1] * y[2, 2] / (y[1, 2] * y[2, 1]); seor <- sqrt(sum(1 / y))
    rr <- (y[1, 1] / sum(y[1, ])) / (y[2, 1] / sum(y[2, ])); serr <- sqrt(1 / y[1, 1] - 1 / sum(y[1, ]) + 1 / y[2, 1] - 1 / sum(y[2, ]))
    out$razon_momios <- list(estimado = or, ic = v(or * exp(c(-1, 1) * z * seor)), corregida = any(x == 0))
    out$riesgo_relativo <- list(estimado = rr, ic = v(rr * exp(c(-1, 1) * z * serr)), corregida = any(x == 0))
  }
  out
}
caso_medidas <- function(nombre, titulo, fuente, tab, nombres = c("fila", "columna"), nivel = 0.95) {
  sp_caso(nombre, objetivo = "cont.medidasDe", titulo = titulo, fuente = fuente, datos = a_datos(tab, nombres),
    argumentos = list(list(tabla = TRUE), list(fila = nombres[1], columna = nombres[2], frecuencia = "n"), list(nivel = nivel)),
    esperado = ref_medidas(tab, nivel), codigo = "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")")
}
caso_medidas("medidas-satisfaccion", "4 × 4 ordinal", F_JOB, job, c("ingreso", "satisfaccion"))
caso_medidas("medidas-movilidad", "8 × 8 ordinal (estatus del padre y del hijo)", F_OCC, occupationalStatus, c("origen", "destino"), 0.9)
caso_medidas("medidas-pelo-ojos", "4 × 4 nominal", F_HAIR, hair, c("pelo", "ojos"))
caso_medidas("medidas-gemelos", "2 × 2 con razón de momios y riesgo relativo", F_CONV, conv, c("gemelos", "condena"))
caso_medidas("medidas-con-cero", "2 × 2 con una celda en cero (+0.5)", "Datos sintéticos", matrix(c(12, 0, 5, 9), 2))

# McNemar y Bowker
ref_mcnemar <- function(tab, correccion = TRUE) {
  mt <- mcnemar.test(tab, correct = correccion)
  out <- list(X2 = unname(mt$statistic), gl = unname(mt$parameter), p = mt$p.value)
  out$p_exacta <- if (nrow(tab) == 2) binom.test(tab[1, 2], tab[1, 2] + tab[2, 1])$p.value else NA
  out
}
caso_mcnemar <- function(nombre, titulo, fuente, tab, correccion = TRUE) {
  sp_caso(nombre, objetivo = "cont.mcnemarDe", titulo = titulo, fuente = fuente, datos = a_datos(tab, c("antes", "despues")),
    argumentos = list(list(tabla = TRUE), list(antes = "antes", despues = "despues", frecuencia = "n"), list(correccion = correccion)),
    esperado = ref_mcnemar(tab, correccion), codigo = sprintf("mcnemar.test(tabla, correct = %s); binom.test(b, b + c)", correccion))
}
approval <- matrix(c(794, 86, 150, 570), 2, dimnames = list(c("Aprueba", "Desaprueba"), c("Aprueba", "Desaprueba")))
caso_mcnemar("aprobacion", "2 × 2 con corrección y binomial exacta", F_APPROVAL, approval)
caso_mcnemar("aprobacion-sin-correccion", "2 × 2 sin corrección", F_APPROVAL, approval, FALSE)
caso_mcnemar("pocos-cambios", "2 × 2 con pocos casos discordantes", "Datos sintéticos", matrix(c(20, 2, 7, 15), 2, dimnames = list(c("Si", "No"), c("Si", "No"))))
caso_mcnemar("bowker", "3 × 3: simetría de Bowker", "Datos sintéticos", matrix(c(20, 5, 3, 9, 15, 4, 2, 8, 14), 3, dimnames = list(c("Baja", "Media", "Alta"), c("Baja", "Media", "Alta"))))

# Cochran-Mantel-Haenszel; Breslow-Day con su fórmula (Breslow y Day, 1980; Tarone, 1985)
breslow_day <- function(x, or) {
  K <- dim(x)[3]; bd <- 0; sa <- 0; se <- 0; sv <- 0; utiles <- 0
  for (k in 1:K) {
    f <- x[, , k]; n <- sum(f); r1 <- sum(f[1, ]); c1 <- sum(f[, 1]); a <- f[1, 1]
    lo <- max(0, r1 + c1 - n); hi <- min(r1, c1)
    if (hi == lo) next                 # un margen en cero: el estrato no informa
    utiles <- utiles + 1
    E <- uniroot(function(e) e * (n - r1 - c1 + e) - or * (r1 - e) * (c1 - e), c(lo, hi), tol = 1e-13)$root
    V <- 1 / (1 / E + 1 / (r1 - E) + 1 / (c1 - E) + 1 / (n - r1 - c1 + E))
    bd <- bd + (a - E)^2 / V; sa <- sa + a; se <- se + E; sv <- sv + V
  }
  tar <- bd - (sa - se)^2 / sv; g <- utiles - 1
  list(X2 = bd, gl = g, p = pchisq(bd, g, lower.tail = FALSE), X2_tarone = tar, p_tarone = pchisq(tar, g, lower.tail = FALSE), estratos = utiles)
}
ref_cmh <- function(x, correccion = TRUE, nivel = 0.95) {
  mh <- mantelhaen.test(x, correct = correccion, conf.level = nivel)
  out <- list(X2 = unname(mh$statistic), gl = unname(mh$parameter), p = mh$p.value)
  if (all(dim(x)[1:2] == 2)) {
    out$razon_momios <- unname(mh$estimate); out$ic <- v(mh$conf.int)
    out$breslow_day <- breslow_day(x, unname(mh$estimate))
    z <- qnorm((1 + nivel) / 2)
    out$estratos <- lapply(1:dim(x)[3], function(k) { f <- x[, , k]; y <- if (any(f == 0)) f + 0.5 else f; o <- y[1, 1] * y[2, 2] / (y[1, 2] * y[2, 1]); s <- sqrt(sum(1 / y))
      list(razon_momios = o, ic = v(o * exp(c(-1, 1) * z * s)), corregida = any(f == 0)) })
  } else { out$razon_momios <- NA; out$ic <- NA; out$breslow_day <- NA; out$estratos <- NA }
  out
}
caso_cmh <- function(nombre, titulo, fuente, x, nombres, correccion = TRUE, nivel = 0.95) {
  d <- as.data.frame(as.table(x), stringsAsFactors = TRUE); names(d) <- c(nombres, "n")
  sp_caso(nombre, objetivo = "cont.cmhDe", titulo = titulo, fuente = fuente, datos = d,
    argumentos = list(list(tabla = TRUE), list(fila = nombres[1], columna = nombres[2], estrato = nombres[3], frecuencia = "n"), list(correccion = correccion, nivel = nivel)),
    esperado = ref_cmh(x, correccion, nivel), codigo = sprintf("mantelhaen.test(tabla, correct = %s, conf.level = %s); Breslow-Day por su fórmula", correccion, nivel))
}
caso_cmh("berkeley", "2 × 2 × 6: admisiones por departamento", F_UCB, UCBAdmissions, c("admision", "sexo", "departamento"))
caso_cmh("berkeley-sin-correccion", "Lo mismo sin corrección e IC al 90 %", F_UCB, UCBAdmissions, c("admision", "sexo", "departamento"), FALSE, 0.9)
rabbits <- array(c(0, 0, 6, 5, 3, 0, 3, 6, 6, 2, 0, 4, 5, 6, 1, 0, 2, 5, 0, 0), dim = c(2, 2, 5),
                 dimnames = list(Retraso = c("Ninguno", "1.5h"), Respuesta = c("Cura", "Muere"), Penicilina = c("1/8", "1/4", "1/2", "1", "4")))
caso_cmh("conejos", "2 × 2 × 5 con celdas en cero", F_RABBITS, rabbits, c("retraso", "respuesta", "penicilina"))
satis <- array(c(1, 2, 0, 0, 3, 3, 1, 2, 11, 17, 8, 4, 2, 3, 5, 2, 1, 0, 0, 0, 1, 3, 0, 1, 2, 5, 7, 9, 1, 1, 0, 2, 0, 1, 2, 3), dim = c(4, 4, 2),
               dimnames = list(Ingreso = c("<5000", "5000-15000", "15000-25000", ">25000"), Satisfaccion = c("V_D", "L_S", "M_S", "V_S"), Sexo = c("Mujer", "Hombre")))
caso_cmh("satisfaccion-sexo", "4 × 4 × 2: estadístico generalizado con 9 gl", F_SATIS, satis, c("ingreso", "satisfaccion", "sexo"))

# kappa: psych::cohen.kappa (varianza de Fleiss, Cohen y Everitt, 1969); la z usa la varianza nula de esos autores
ref_kappa <- function(tab, wexp, nivel = 0.95) {
  ck <- psych::cohen.kappa(unclass(tab), w.exp = wexp)
  p <- unclass(tab) / sum(tab); rs <- rowSums(p); cs <- colSums(p); k <- nrow(p); n <- sum(tab)
  pc <- sum(rs * cs); var0 <- (pc + pc^2 - sum(rs * cs * (rs + cs))) / (n * (1 - pc)^2)
  W <- 1 - abs(outer(1:k, 1:k, "-"))^wexp / (k - 1)^wexp; wpc <- sum(W * outer(rs, cs))
  wr <- as.vector(W %*% cs); wc <- as.vector(t(W) %*% rs)
  var0w <- (sum(outer(rs, cs) * (W - outer(wr, wc, "+"))^2) - wpc^2) / (n * (1 - wpc)^2)
  z <- qnorm((1 + nivel) / 2)
  res <- function(est, v, v0) list(estimado = est, ee = sqrt(v), ic = v(est + c(-1, 1) * z * sqrt(v)), z = est / sqrt(v0), p = 2 * pnorm(-abs(est / sqrt(v0))))
  list(simple = res(ck$kappa, ck$var.kappa, var0), ponderada = res(ck$weighted.kappa, ck$var.weighted, var0w))
}
caso_kappa <- function(nombre, titulo, fuente, tab, pond, nivel = 0.95) {
  sp_caso(nombre, objetivo = "cont.kappaDe", titulo = titulo, fuente = fuente, datos = a_datos(tab, c("evaluador1", "evaluador2")),
    argumentos = list(list(tabla = TRUE), list(evaluador1 = "evaluador1", evaluador2 = "evaluador2", frecuencia = "n"), list(ponderacion = pond, nivel = nivel)),
    esperado = ref_kappa(tab, if (pond == "lineal") 1 else 2, nivel), paquetes = c("stats", "psych"),
    codigo = sprintf("psych::cohen.kappa(tabla, w.exp = %d); z con la varianza nula de Fleiss, Cohen y Everitt (1969)", if (pond == "lineal") 1 else 2))
}
cohen <- matrix(c(88, 14, 18, 10, 40, 10, 2, 6, 12), 3, byrow = TRUE, dimnames = list(c("A", "B", "C"), c("A", "B", "C")))
caso_kappa("cohen-cuadratica", "3 categorías, ponderada cuadrática", F_COHEN, cohen, "cuadratica")
caso_kappa("cohen-lineal", "3 categorías, ponderada lineal e IC al 90 %", F_COHEN, cohen, "lineal", 0.9)
set.seed(103)
sev <- matrix(c(30, 5, 1, 0, 6, 22, 4, 1, 1, 5, 18, 3, 0, 1, 4, 11), 4, byrow = TRUE, dimnames = list(paste0(0:3), paste0(0:3)))
caso_kappa("severidad", "4 grados de severidad", "Datos sintéticos", sev, "cuadratica")
caso_kappa("dos-categorias", "2 × 2", F_APPROVAL, approval, "lineal")
# el evaluador 1 no usó una categoría: la escala sigue siendo 0 < 1 < 2 < 3 (R recibe la tabla completa, con la fila en cero)
sev0 <- matrix(c(30, 5, 1, 0, 0, 0, 0, 0, 1, 5, 18, 3, 0, 1, 4, 11), 4, byrow = TRUE, dimnames = list(paste0(0:3), paste0(0:3)))
sp_caso("severidad-sin-categoria", objetivo = "cont.kappaDe", titulo = "El evaluador 1 no usó una categoría (ponderada cuadrática)", fuente = "Datos sintéticos",
  datos = droplevels(subset(a_datos(sev0, c("evaluador1", "evaluador2")), n > 0)),
  argumentos = list(list(tabla = TRUE), list(evaluador1 = "evaluador1", evaluador2 = "evaluador2", frecuencia = "n"), list(ponderacion = "cuadratica", nivel = 0.95)),
  esperado = ref_kappa(sev0, 2), paquetes = c("stats", "psych"), codigo = "psych::cohen.kappa(tabla con la fila en cero, w.exp = 2)")

# los métodos completos
sp_caso("metodo-tabla-gemelos", objetivo = "tabla-contingencia", tipo = "metodo", titulo = "Tabla 2 × 2 con Fisher y medidas", fuente = F_CONV, datos = a_datos(conv, c("gemelos", "condena")),
  entradas = list(fila = "gemelos", columna = "condena", frecuencia = "n"), opciones = list(correccion = TRUE, nivel = 0.95),
  esperado = (function(ri, rm) list(chi = list(X2 = ri$X2, gl = ri$gl, p = ri$p, G2 = ri$G2), fisher = ri$fisher, medidas = rm[c("phi", "v_cramer", "razon_momios", "riesgo_relativo")]))(ref_indep(conv), ref_medidas(conv)),
  codigo = "chisq.test, fisher.test y las medidas")
sp_caso("metodo-mcnemar", objetivo = "mcnemar", tipo = "metodo", titulo = "McNemar con binomial exacta", fuente = F_APPROVAL, datos = a_datos(approval, c("antes", "despues")),
  entradas = list(antes = "antes", despues = "despues", frecuencia = "n"), opciones = list(correccion = TRUE), esperado = ref_mcnemar(approval), codigo = "mcnemar.test")
sp_caso("metodo-cmh-berkeley", objetivo = "mantel-haenszel", tipo = "metodo", titulo = "Cochran-Mantel-Haenszel con Breslow-Day", fuente = F_UCB,
  datos = (function(d) { names(d) <- c("admision", "sexo", "departamento", "n"); d })(as.data.frame(UCBAdmissions, stringsAsFactors = TRUE)),
  entradas = list(fila = "admision", columna = "sexo", estrato = "departamento", frecuencia = "n"), opciones = list(correccion = TRUE, nivel = 0.95),
  esperado = (function(r) r[c("X2", "gl", "p", "razon_momios", "ic", "breslow_day")])(ref_cmh(UCBAdmissions)), codigo = "mantelhaen.test y Breslow-Day")
sp_caso("metodo-kappa-cohen", objetivo = "kappa", tipo = "metodo", titulo = "Kappa simple y ponderada", fuente = F_COHEN, datos = a_datos(cohen, c("evaluador1", "evaluador2")),
  entradas = list(evaluador1 = "evaluador1", evaluador2 = "evaluador2", frecuencia = "n"), opciones = list(ponderacion = "cuadratica", nivel = 0.95),
  esperado = ref_kappa(cohen, 2), paquetes = c("stats", "psych"), codigo = "psych::cohen.kappa")
