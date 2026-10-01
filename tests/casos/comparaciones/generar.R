# Comparaciones de medias, letras, contrastes, polinomios ortogonales y medias ajustadas.
suppressPackageStartupMessages({ library(MASS); library(emmeans); library(agricolae); library(multcompView); library(multcomp); library(PMCMRplus) })
emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

# letras: niveles en orden de media decreciente y multcompLetters con p < alfa (pares en el orden a < b)
letras_r <- function(medias, p, alfa = 0.05) {
  k <- length(medias); ord <- order(-medias)
  pm <- matrix(1, k, k); idx <- 0
  for (a in 1:(k - 1)) for (b in (a + 1):k) { idx <- idx + 1; pm[a, b] <- pm[b, a] <- p[idx] }
  niv <- paste0("g", ord); m <- pm[ord, ord] < alfa; diag(m) <- FALSE; dimnames(m) <- list(niv, niv)
  unname(multcompLetters(m)$Letters[paste0("g", 1:k)])
}
ADJ <- c(dms = "none", tukey = "tukey", scheffe = "scheffe", bonferroni = "bonferroni", sidak = "sidak", holm = "holm")
# las comparaciones de emmeans, grupo por grupo («dentro de»), con los nombres de SigmaPro
pares_r <- function(m, spec, dentro, metodos) {
  e <- emmeans(m, spec, by = if (length(dentro)) dentro else NULL)
  ed <- as.data.frame(e)
  grupos <- if (length(dentro)) split(seq_len(nrow(ed)), interaction(ed[dentro], drop = TRUE, lex.order = FALSE)) else list(seq_len(nrow(ed)))
  out <- list()
  for (mt in metodos) {
    pr <- as.data.frame(pairs(e, adjust = ADJ[[mt]]))
    pg <- if (length(dentro)) split(seq_len(nrow(pr)), interaction(pr[dentro], drop = TRUE, lex.order = FALSE)) else list(seq_len(nrow(pr)))
    pn <- as.data.frame(pairs(e, adjust = "none"))
    out[[mt]] <- lapply(seq_along(grupos), function(g) {
      med <- ed$emmean[grupos[[g]]]; x <- pr[pg[[g]], ]
      # Clase B: emmeans calcula Šidák como 1 − (1 − p)^m, que pierde cifras con p diminutos; la referencia es
      # −expm1(m·log1p(−p)) con los p sin ajustar de emmeans, y se comprueba que coincide en valor absoluto
      if (mt == "sidak") { p0 <- pn$p.value[pg[[g]]]; pe <- -expm1(length(p0) * log1p(-p0)); stopifnot(max(abs(pe - x$p.value)) < 1e-12); x$p.value <- pe }
      list(medias = I(med), letras = I(letras_r(med, x$p.value)), dif = I(x$estimate), ee = I(x$SE), gl = I(x$df), t = I(x$t.ratio), p = I(x$p.value))
    })
  }
  out
}
caso_pares <- function(nombre, titulo, fuente, datos, e, modelo_r, spec, dentro = character(0), metodos = names(ADJ), clase = "A") {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  sp_caso(nombre, objetivo = "comp.paresDe", titulo = titulo, fuente = fuente, datos = datos, clase = if ("tukey" %in% metodos || "sidak" %in% metodos) "B" else clase,
    comparacion = list(tolerancias = list("tukey[*].p[*]" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"))),
    argumentos = list(list(tabla = TRUE), e, I(spec), I(dentro), I(metodos), 0.05), esperado = pares_r(m, spec, dentro, metodos),
    paquetes = c("stats", "emmeans", "multcompView"), codigo = sprintf("pairs(emmeans(%s, %s%s), adjust = …); letras con multcompLetters", modelo_r, deparse(spec), if (length(dentro)) paste0(", by = ", deparse(dentro)) else ""))
}
pg <- data.frame(peso = PlantGrowth$weight, grupo = PlantGrowth$group)
f_pg <- "Dobson (1983); conjunto PlantGrowth de R"
caso_pares("pares-plantas", "Un factor balanceado: los seis métodos", f_pg, pg, list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo")), "lm(peso ~ grupo, data = datos)", "grupo")
ck <- data.frame(peso = chickwts$weight, alimento = chickwts$feed)
f_ck <- "Anónimo (1948); conjunto chickwts de R"
caso_pares("pares-pollos", "Un factor desbalanceado (Tukey-Kramer)", f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = datos)", "alimento")
set.seed(33)
mz <- expand.grid(dosis = c(0, 60, 120, 180), hibrido = factor(c("H-40", "H-48", "H-52")), bloque = factor(1:4))
mz$rend <- round(4 + 0.012 * mz$dosis - 0.00004 * mz$dosis^2 + as.integer(mz$hibrido) * 0.3 + as.integer(mz$bloque) * 0.15 + rnorm(48, 0, 0.35), 2)
mz <- mz[c("rend", "bloque", "hibrido", "dosis")]
mzf <- transform(mz, dosis = factor(dosis))
e_mz <- list(diseno = "dbca", respuesta = "rend", tratamientos = I(c("hibrido", "dosis")), bloque = "bloque")
caso_pares("pares-maiz-hibrido", "Bloques, factorial: medias de híbrido", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "hibrido")
caso_pares("pares-maiz-dosis-en-hibrido", "Bloques, factorial: dosis dentro de cada híbrido", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "dosis", "hibrido")
wb <- data.frame(roturas = warpbreaks$breaks, lana = warpbreaks$wool, tension = warpbreaks$tension)[-c(3, 10, 20, 21, 40), ]
f_wb <- "Tippett (1950); conjunto warpbreaks de R sin cinco filas"
e_wb <- list(diseno = "dca", respuesta = "roturas", tratamientos = I(c("lana", "tension")))
caso_pares("pares-roturas-tension-en-lana", "Factorial desbalanceado: tensión dentro de cada lana", f_wb, wb, e_wb, "lm(roturas ~ lana * tension, data = datos)", "tension", "lana")
caso_pares("pares-roturas-celdas", "Factorial desbalanceado: las seis combinaciones", f_wb, wb, e_wb, "lm(roturas ~ lana * tension, data = datos)", c("lana", "tension"), metodos = c("dms", "tukey", "holm"))
set.seed(31)
rb <- expand.grid(variedad = factor(paste0("V", 1:5)), bloque = factor(paste0("B", 1:4)))
rb$rend <- round(50 + as.integer(rb$variedad) * 2 + as.integer(rb$bloque) * 1.5 + rnorm(20, 0, 2), 1)
rb <- rb[c("rend", "bloque", "variedad")]
rbp <- rb[-c(7, 18), ]
caso_pares("pares-bloques-perdidas", "Bloques con parcelas perdidas: medias ajustadas", "Datos sintéticos", rbp, list(diseno = "dbca", respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque"),
  "lm(rend ~ bloque + variedad, data = datos)", "variedad")
set.seed(35)
bloques_bib <- list(c(1, 2, 4), c(2, 3, 5), c(3, 4, 6), c(4, 5, 7), c(5, 6, 1), c(6, 7, 2), c(7, 1, 3))
bb <- data.frame(bloque = factor(rep(paste0("b", 1:7), each = 3)), trat = factor(paste0("T", unlist(bloques_bib))))
bb$y <- round(10 + as.integer(bb$trat) * 0.6 + rep(rnorm(7, 0, 1.2), each = 3) + rnorm(21, 0, 0.5), 2)
bb <- bb[c("y", "bloque", "trat")]
caso_pares("pares-bib", "Bloques incompletos balanceados: medias ajustadas correlacionadas", "Datos sintéticos", bb, list(diseno = "bib", respuesta = "y", tratamientos = "trat", bloque = "bloque"),
  "lm(y ~ bloque + trat, data = datos)", "trat", metodos = c("dms", "tukey", "bonferroni"))
# estratos: avena en parcelas divididas (emmeans con el modelo de estratos, gl de Satterthwaite)
avena <- data.frame(Y = oats$Y, B = oats$B, V = oats$V, N = oats$N)
f_av <- "Yates (1935); conjunto oats del paquete MASS"
e_av <- list(diseno = "parcelas-divididas", respuesta = "Y", parcelaGrande = "V", subparcela = "N", bloque = "B", principal = "dbca")
m_av <- "aov(Y ~ V * N + Error(B/V), data = datos)"
MS <- c("dms", "tukey", "bonferroni", "holm", "sidak", "scheffe")
caso_pares("pares-avena-variedad", "Parcelas divididas: variedades (error a)", f_av, avena, e_av, m_av, "V", metodos = MS)
caso_pares("pares-avena-nitrogeno", "Parcelas divididas: dosis de nitrógeno (error b)", f_av, avena, e_av, m_av, "N", metodos = MS)
caso_pares("pares-avena-n-en-v", "Parcelas divididas: nitrógeno dentro de cada variedad", f_av, avena, e_av, m_av, "N", "V", metodos = MS)
caso_pares("pares-avena-v-en-n", "Parcelas divididas: variedades dentro de cada dosis (errores combinados, Satterthwaite)", f_av, avena, e_av, m_av, "V", "N", metodos = MS)
set.seed(16)
ss <- expand.grid(C = factor(c("c1", "c2")), B = factor(c("b1", "b2", "b3")), A = factor(c("a1", "a2")), bloque = factor(c("I", "II", "III")))
ss$y <- round(10 + as.integer(ss$A) + 0.8 * as.integer(ss$B) + 0.5 * as.integer(ss$C) + rnorm(36, 0, 0.6) + rep(rnorm(6, 0, 0.8), each = 6) + rep(rnorm(18, 0, 0.5), each = 2), 2)
ss <- ss[c("y", "bloque", "A", "B", "C")]
e_ss <- list(diseno = "parcelas-subdivididas", respuesta = "y", parcelaGrande = "A", subparcela = "B", subsubparcela = "C", bloque = "bloque")
caso_pares("pares-subdivididas-b-en-a", "Subdivididas: B dentro de cada A", "Datos sintéticos", ss, e_ss, "aov(y ~ A * B * C + Error(bloque/A/B), data = datos)", "B", "A", metodos = c("dms", "tukey"))
caso_pares("pares-subdivididas-a-en-c", "Subdivididas: A dentro de cada C (tres errores combinados)", "Datos sintéticos", ss, e_ss, "aov(y ~ A * B * C + Error(bloque/A/B), data = datos)", "A", "C", metodos = c("dms", "tukey"))
fr <- expand.grid(B = factor(c("v1", "v2", "v3")), A = factor(c("h1", "h2", "h3", "h4")), bloque = factor(1:3))
set.seed(17)
fr$y <- round(30 + 1.2 * as.integer(fr$A) + as.integer(fr$B) + rnorm(36, 0, 0.9) + rep(rnorm(12, 0, 0.8), each = 3), 2)
fr <- fr[c("y", "bloque", "A", "B")]
caso_pares("pares-franjas-a-en-b", "Franjas: A dentro de cada B (error a con error c)", "Datos sintéticos", fr, list(diseno = "franjas", respuesta = "y", franjaA = "A", franjaB = "B", bloque = "bloque"),
  "aov(y ~ A * B + Error(bloque/(A + B)), data = datos)", "A", "B", metodos = c("dms", "tukey"))

# ---- Duncan y SNK: las fórmulas de agricolae (EE común con la media armónica de las repeticiones), sin redondear
rango_r <- function(m, datos, trt, metodo) {
  fn <- if (metodo == "duncan") agricolae::duncan.test else agricolae::SNK.test
  ag <- fn(m, trt, group = FALSE)
  e <- as.data.frame(emmeans(m, trt)); k <- nrow(e)
  n <- table(datos[[trt]])[as.character(e[[trt]])]; mse <- sigma(m)^2; dfe <- df.residual(m)
  sdt <- sqrt(mse / (1 / mean(1 / as.numeric(n))))
  ord <- order(-e$emmean); pos <- order(ord)
  dif <- p <- pasos <- NULL
  for (a in 1:(k - 1)) for (b in (a + 1):k) {
    d <- e$emmean[a] - e$emmean[b]; r <- abs(pos[a] - pos[b]) + 1; q <- abs(d) / sdt
    pt_ <- ptukey(q, r, dfe, lower.tail = FALSE)
    dif <- c(dif, d); pasos <- c(pasos, r); p <- c(p, if (metodo == "snk") pt_ else -expm1(log1p(-pt_) / (r - 1)))
  }
  stopifnot(max(abs(round(p, 4) - ag$comparison$pvalue)) < 1e-4)   # mismos p que agricolae (que los redondea)
  list(list(medias = I(e$emmean), letras = I(letras_r(e$emmean, p)), dif = I(dif), p = I(p)))
}
caso_rango <- function(nombre, titulo, fuente, datos, e, modelo_r, trt, metodo) {
  m <- eval(parse(text = modelo_r))
  sp_caso(nombre, objetivo = "comp.rangoMultipleDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "agricolae", "multcompView"),
    argumentos = list(list(tabla = TRUE), e, I(trt), I(character(0)), metodo, 0.05), esperado = rango_r(m, eval(parse(text = sub(".*data = ([^)]*)\\).*", "\\1", modelo_r))), trt, metodo),
    clase = "B", comparacion = list(tolerancias = list("[*].p[*]" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"))),
    codigo = sprintf("agricolae::%s(%s, \"%s\") con los p sin redondear; letras con multcompLetters", if (metodo == "duncan") "duncan.test" else "SNK.test", modelo_r, trt))
}
for (mt in c("duncan", "snk")) {
  caso_rango(paste0(mt, "-plantas"), paste(toupper(mt), "con un factor balanceado"), f_pg, pg, list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo")), "lm(peso ~ grupo, data = pg)", "grupo", mt)
  caso_rango(paste0(mt, "-pollos"), paste(toupper(mt), "desbalanceado (media armónica de las repeticiones)"), f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = ck)", "alimento", mt)
  caso_rango(paste0(mt, "-maiz"), paste(toupper(mt), "con las medias de híbrido de un factorial en bloques"), "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "hibrido", mt)
}

# ---- Dunnett: referencia = la misma integral doble con integrate() (clase C: multcomp usa una integración
# aleatoria y se compara aparte, con la tolerancia de su error)
dunnett_r <- function(t, lam, gl, bilateral) {
  sig <- sqrt(1 - lam^2)
  interior <- function(s) sapply(s, function(si) integrate(function(z) sapply(z, function(zz) {
    q <- pnorm((lam * zz - t * si) / sig) + (if (bilateral) pnorm((-t * si - lam * zz) / sig) else 0)
    dnorm(zz) * -expm1(sum(log1p(-pmin(q, 1))))
  }), -9, 9, rel.tol = 1e-12, abs.tol = 0, subdivisions = 1000)$value)
  if (!is.finite(gl)) return(interior(1))
  dens <- function(s) exp(log(2) + (gl / 2) * log(gl / 2) - lgamma(gl / 2) + (gl - 1) * log(s) - gl * s^2 / 2)
  integrate(function(s) dens(s) * interior(s), sqrt(qchisq(1e-15, gl) / gl), sqrt(qchisq(1e-15, gl, lower.tail = FALSE) / gl), rel.tol = 1e-11, abs.tol = 0, subdivisions = 1000)$value
}
caso_dunnett <- function(nombre, titulo, fuente, datos, e, modelo_r, trt, testigo, alternativa = "bilateral", por = character(0)) {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  em <- emmeans(m, trt, by = if (length(por)) por else NULL); ed <- as.data.frame(em)
  grupos <- if (length(por)) split(seq_len(nrow(ed)), ed[[por]]) else list(seq_len(nrow(ed)))
  esp <- lapply(grupos, function(g) {
    x <- ed[g, ]; ic <- which(as.character(x[[trt]]) == testigo); otros <- setdiff(seq_len(nrow(x)), ic)
    d <- x$emmean[otros] - x$emmean[ic]; se <- sqrt(x$SE[otros]^2 + x$SE[ic]^2); t <- d / se
    lam <- sqrt(x$SE[ic]^2 / (x$SE[otros]^2 + x$SE[ic]^2)); gl <- df.residual(m)
    p <- sapply(t, function(ti) switch(alternativa, bilateral = dunnett_r(abs(ti), lam, gl, TRUE), mayor = dunnett_r(ti, lam, gl, FALSE), menor = dunnett_r(-ti, lam, gl, FALSE)))
    # comprobación con multcomp (integración aleatoria de Genz, error ~1e-4)
    set.seed(1)
    dt <- as.data.frame(summary(contrast(em, "trt.vs.ctrl", ref = ic, adjust = "mvt", side = c(bilateral = "=", mayor = ">", menor = "<")[[alternativa]])))
    if (!length(por)) stopifnot(max(abs(dt$p.value - p)) < 2e-3)
    list(dif = I(d), ee = I(se), t = I(t), p = I(p))
  })
  sp_caso(nombre, objetivo = "comp.dunnettDe", titulo = titulo, fuente = fuente, datos = datos, clase = "C", paquetes = c("stats", "emmeans", "mvtnorm"),
    argumentos = list(list(tabla = TRUE), e, I(trt), I(por), testigo, alternativa), esperado = unname(esp),
    codigo = "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación")
}
caso_dunnett("dunnett-plantas", "Dunnett bilateral contra el testigo, n iguales", f_pg, pg, list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo")), "lm(peso ~ grupo, data = datos)", "grupo", "ctrl")
caso_dunnett("dunnett-plantas-mayor", "Dunnett de una cola (mayor que el testigo)", f_pg, pg, list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo")), "lm(peso ~ grupo, data = datos)", "grupo", "ctrl", "mayor")
caso_dunnett("dunnett-pollos", "Dunnett con n distintos (testigo: horsebean)", f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = datos)", "alimento", "horsebean")
caso_dunnett("dunnett-pollos-menor", "Dunnett de una cola (menor que el testigo: casein)", f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = datos)", "alimento", "casein", "menor")
caso_dunnett("dunnett-bloques", "Dunnett en bloques completos (testigo V1)", "Datos sintéticos", rb, list(diseno = "dbca", respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque"), "lm(rend ~ bloque + variedad, data = datos)", "variedad", "V1")
caso_dunnett("dunnett-dosis-en-hibrido", "Dunnett contra la dosis 0 dentro de cada híbrido", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "dosis", "0", "bilateral", "hibrido")

# ---- Games-Howell
for (k in c("pollos", "insectos")) {
  d <- if (k == "pollos") ck else data.frame(conteo = InsectSprays$count, insecticida = InsectSprays$spray)
  r <- names(d)[1]; g <- names(d)[2]
  gh <- gamesHowellTest(d[[r]], d[[g]]); niv <- levels(d[[g]]); q <- p <- NULL
  for (a in 1:(length(niv) - 1)) for (b in (a + 1):length(niv)) { q <- c(q, -gh$statistic[niv[b], niv[a]]); p <- c(p, gh$p.value[niv[b], niv[a]]) }
  dfs <- NULL; ni <- tapply(d[[r]], d[[g]], length); s2 <- tapply(d[[r]], d[[g]], var)
  for (a in 1:(length(niv) - 1)) for (b in (a + 1):length(niv)) { A <- s2[a] / ni[a] + s2[b] / ni[b]; dfs <- c(dfs, A^2 / (s2[a]^2 / (ni[a]^2 * (ni[a] - 1)) + s2[b]^2 / (ni[b]^2 * (ni[b] - 1)))) }
  sp_caso(paste0("games-howell-", k), objetivo = "comp.gamesHowellDe", titulo = paste("Games-Howell:", if (k == "pollos") "alimentos de pollos" else "insecticidas"),
    fuente = if (k == "pollos") f_ck else "Beall (1942); conjunto InsectSprays de R", datos = d, paquetes = c("stats", "PMCMRplus", "multcompView"),
    argumentos = list(list(tabla = TRUE), r, g), esperado = list(q = I(unname(q)), gl = I(unname(dfs)), p = I(unname(p)), letras = I(letras_r(as.numeric(tapply(d[[r]], d[[g]], mean)), p))),
    clase = "B", comparacion = list(tolerancias = list("p[*]" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190)"))),
    codigo = sprintf("PMCMRplus::gamesHowellTest(%s, %s)", r, g))
}

# ---- contrastes definidos por el usuario y su suma de cuadrados
caso_contraste <- function(nombre, titulo, fuente, datos, e, modelo_r, trt, C, dentro = character(0), con_sc = TRUE) {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  em <- emmeans(m, trt, by = if (length(dentro)) dentro else NULL)
  ct <- as.data.frame(contrast(em, method = setNames(lapply(C, function(x) as.numeric(x$coef)), sapply(C, function(x) x$nombre))))
  grupos <- if (length(dentro)) split(seq_len(nrow(ct)), ct[[dentro]]) else list(seq_len(nrow(ct)))
  esp <- lapply(grupos, function(g) {
    x <- ct[g, ]; out <- list(est = I(x$estimate), ee = I(x$SE), gl = I(x$df), t = I(x$t.ratio), p = I(x$p.value))
    if (con_sc) out$sc <- I(x$t.ratio^2 * sigma(m)^2)
    out
  })
  sp_caso(nombre, objetivo = "comp.contrastesDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "emmeans"),
    argumentos = list(list(tabla = TRUE), e, trt, I(dentro), C), esperado = unname(esp),
    codigo = "emmeans::contrast(emmeans(modelo, trt), method = list(...)); SC = t² · CMerror")
}
C_pg <- list(list(nombre = "testigo vs tratados", coef = I(c(2, -1, -1))), list(nombre = "trt1 vs trt2", coef = I(c(0, 1, -1))))
caso_contraste("contrastes-plantas", "Dos contrastes ortogonales", f_pg, pg, list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo")), "lm(peso ~ grupo, data = datos)", "grupo", C_pg)
# la partición de la SC: los dos contrastes ortogonales suman la SC de grupo (summary.aov con split)
spl <- summary(aov(peso ~ grupo, data = within(pg, contrasts(grupo) <- cbind(c(2, -1, -1), c(0, 1, -1)))), split = list(grupo = list(c1 = 1, c2 = 2)))[[1]]
stopifnot(abs(sum(spl$`Sum Sq`[2:3]) - spl$`Sum Sq`[1]) < 1e-9)
C_rb <- list(list(nombre = "V1 vs resto", coef = I(c(4, -1, -1, -1, -1))), list(nombre = "V2 vs V3", coef = I(c(0, 1, -1, 0, 0))), list(nombre = "no ortogonal", coef = I(c(1, 1, 0, -2, 0))))
caso_contraste("contrastes-bloques", "Contrastes en bloques, uno no ortogonal", "Datos sintéticos", rb, list(diseno = "dbca", respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque"), "lm(rend ~ bloque + variedad, data = datos)", "variedad", C_rb)
caso_contraste("contrastes-avena-n", "Contrastes de nitrógeno en parcelas divididas (error b)", f_av, avena, e_av, m_av, "N",
  list(list(nombre = "sin N vs con N", coef = I(c(3, -1, -1, -1))), list(nombre = "0.2 vs 0.6", coef = I(c(0, 1, 0, -1)))), con_sc = FALSE)

# ---- polinomios ortogonales: estimaciones con los coeficientes de contr.poly(scores = dosis), SC por split,
# curva ajustada a las medias y dosis óptima
caso_poli <- function(nombre, titulo, fuente, datos, e, modelo_r, trt, x, grado, dentro = character(0), split_r = NULL) {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  P <- contr.poly(length(x), scores = x)
  em <- emmeans(m, trt, by = if (length(dentro)) dentro else NULL); ed <- as.data.frame(em)
  ct <- as.data.frame(contrast(em, method = setNames(lapply(seq_len(ncol(P)), function(j) P[, j]), paste0("g", seq_len(ncol(P))))))
  gc <- if (length(dentro)) split(seq_len(nrow(ct)), ct[[dentro]]) else list(seq_len(nrow(ct)))
  ge <- if (length(dentro)) split(seq_len(nrow(ed)), ed[[dentro]]) else list(seq_len(nrow(ed)))
  esp <- lapply(seq_along(gc), function(i) {
    xx <- ct[gc[[i]], ]; med <- ed$emmean[ge[[i]]]
    fit <- lm(med ~ poly(x, grado, raw = TRUE)); cf <- unname(coef(fit))
    out <- list(est = I(xx$estimate), ee = I(xx$SE), gl = I(xx$df), F = I(xx$t.ratio^2), p = I(xx$p.value), curva = I(cf))
    if (inherits(m, "lm")) out$sc <- I(xx$t.ratio^2 * sigma(m)^2)
    if (grado == 2) { xo <- -cf[2] / (2 * cf[3]); out$optimo <- I(c(xo, cf[1] + cf[2] * xo + cf[3] * xo^2)) }
    out
  })
  if (!is.null(split_r)) eval(parse(text = split_r))
  sp_caso(nombre, objetivo = "comp.polinomiosDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "emmeans"),
    argumentos = list(list(tabla = TRUE), e, trt, I(dentro), grado), esperado = unname(esp),
    codigo = "contrast(emmeans(...), method = columnas de contr.poly(k, scores = dosis)); lm(medias ~ poly(dosis, grado, raw = TRUE)); dosis óptima = −b₁/(2b₂)")
}
caso_poli("polinomios-maiz", "Dosis de N (0, 60, 120, 180) en un factorial en bloques: lineal, cuadrático y cúbico; óptimo", "Datos sintéticos", mz, e_mz,
  "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "dosis", c(0, 60, 120, 180), 2,
  split_r = "s <- summary(aov(rend ~ bloque + hibrido * dosis, data = within(mzf, contrasts(dosis) <- contr.poly(4, scores = c(0, 60, 120, 180)))), split = list(dosis = list(L = 1, Q = 2, C = 3)))[[1]]; stopifnot(abs(sum(s[grep('^ *dosis: ', rownames(s)), 'Sum Sq']) - s[trimws(rownames(s)) == 'dosis', 'Sum Sq']) < 1e-9)")
caso_poli("polinomios-maiz-en-hibrido", "Polinomios de la dosis dentro de cada híbrido", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "dosis", c(0, 60, 120, 180), 2, "hibrido")
caso_poli("polinomios-avena", "Nitrógeno en parcelas divididas (0, 0.2, 0.4, 0.6 qq/acre), error b", f_av,
  transform(avena, N = as.numeric(sub("cwt", "", N))), list(diseno = "parcelas-divididas", respuesta = "Y", parcelaGrande = "V", subparcela = "N", bloque = "B", principal = "dbca"),
  "aov(Y ~ V * factor(N) + Error(B/V), data = datos)", "N", c(0, 0.2, 0.4, 0.6), 1)
set.seed(41)
de <- data.frame(dosis = rep(c(0, 50, 100, 200), each = 5))
de$y <- round(20 + 0.15 * de$dosis - 0.0005 * de$dosis^2 + rnorm(20, 0, 1.2), 2)
caso_poli("polinomios-desiguales", "Dosis desigualmente espaciadas (0, 50, 100, 200) en completamente al azar", "Datos sintéticos", de,
  list(diseno = "dca", respuesta = "y", tratamientos = I("dosis")), "lm(y ~ factor(dosis), data = de)", "dosis", c(0, 50, 100, 200), 2)

# ---- medias ajustadas con intervalo de confianza
caso_medias <- function(nombre, titulo, fuente, datos, e, modelo_r, spec, dentro = character(0), nivel = 0.95) {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  ed <- as.data.frame(confint(emmeans(m, spec, by = if (length(dentro)) dentro else NULL), level = nivel))
  grupos <- if (length(dentro)) split(seq_len(nrow(ed)), ed[[dentro]]) else list(seq_len(nrow(ed)))
  esp <- lapply(grupos, function(g) list(media = I(ed$emmean[g]), ee = I(ed$SE[g]), gl = I(ed$df[g]), inf = I(ed$lower.CL[g]), sup = I(ed$upper.CL[g])))
  sp_caso(nombre, objetivo = "comp.mediasDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "emmeans"),
    argumentos = list(list(tabla = TRUE), e, I(spec), I(dentro), nivel), esperado = unname(esp), codigo = sprintf("confint(emmeans(%s, %s), level = %g)", modelo_r, deparse(spec), nivel))
}
caso_medias("medias-maiz-hibrido", "Medias de híbrido en un factorial en bloques, IC 95 %", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "hibrido")
caso_medias("medias-pollos-90", "Medias de un factor desbalanceado, IC 90 %", f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = datos)", "alimento", nivel = 0.9)
caso_medias("medias-bib", "Medias ajustadas de un BIB, IC 99 %", "Datos sintéticos", bb, list(diseno = "bib", respuesta = "y", tratamientos = "trat", bloque = "bloque"), "lm(y ~ bloque + trat, data = datos)", "trat", nivel = 0.99)
caso_medias("medias-perdidas-celdas", "Medias de dosis dentro de híbrido con dos parcelas perdidas", "Datos sintéticos", mz[-c(5, 30), ], e_mz, "lm(rend ~ bloque + hibrido * dosis, data = transform(mz[-c(5, 30), ], dosis = factor(dosis)))", "dosis", "hibrido")

# ======================= los métodos completos =======================
met_pares <- function(nombre, titulo, fuente, datos, e, modelo_r, comparar, dentro = character(0), metodo = "tukey", alfa = 0.05) {
  assign("datos", datos, envir = globalenv())
  m <- eval(parse(text = modelo_r))
  pr <- pares_r(m, comparar, dentro, if (metodo == "dms-protegida") "dms" else metodo)[[1]]
  grupos <- lapply(pr, function(g) {
    g <- lapply(g, function(v) as.vector(unclass(v)))
    k <- length(g$medias); np <- length(g$p)
    list(medias = lapply(seq_len(k), function(i) list(media = g$medias[i], letras = letras_r(g$medias, g$p, alfa)[i])),
      pares = lapply(seq_len(np), function(i) list(dif = g$dif[i], ee = g$ee[i], gl = g$gl[i], t = g$t[i], p_ajustado = g$p[i])))
  })
  sp_caso(nombre, objetivo = "comparaciones-medias", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos, clase = "B",
    entradas = c(e, list(comparar = I(comparar)), if (length(dentro)) list(dentro = I(dentro))), opciones = list(metodo = metodo, alfa = alfa),
    esperado = list(grupos = grupos), paquetes = c("stats", "emmeans", "multcompView"),
    comparacion = list(tolerancias = list("grupos[*].pares[*].p_ajustado" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190)"))),
    codigo = sprintf("pairs(emmeans(%s, ...), adjust = \"%s\"); letras con multcompLetters", modelo_r, ADJ[[if (metodo == "dms-protegida") "dms" else metodo]]))
}
met_pares("metodo-tukey-maiz", "Tukey de los híbridos en un factorial en bloques", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "hibrido")
met_pares("metodo-dms-dosis-en-hibrido", "DMS de la dosis dentro de cada híbrido", "Datos sintéticos", mz, e_mz, "lm(rend ~ bloque + hibrido * dosis, data = mzf)", "dosis", "hibrido", "dms")
met_pares("metodo-tukey-avena-n-en-v", "Tukey del nitrógeno dentro de cada variedad (parcelas divididas)", f_av, avena, e_av, m_av, "N", "V")
met_pares("metodo-bonferroni-pollos", "Bonferroni con un factor desbalanceado", f_ck, ck, list(diseno = "dca", respuesta = "peso", tratamientos = I("alimento")), "lm(peso ~ alimento, data = datos)", "alimento", metodo = "bonferroni")
# DMS protegida: con F no significativa no se separan medias
set.seed(51)
np5 <- data.frame(trat = factor(rep(paste0("T", 1:4), each = 4)), y = round(rnorm(16, 10, 1), 2))
stopifnot(anova(lm(y ~ trat, data = np5))$`Pr(>F)`[1] > 0.05)
mp <- lm(y ~ trat, data = np5); pr0 <- pares_r(mp, "trat", character(0), "dms")$dms[[1]]
sp_caso("metodo-dms-protegida-no-significativa", objetivo = "comparaciones-medias", tipo = "metodo", titulo = "DMS protegida con F no significativa: todas las medias en un grupo",
  fuente = "Datos sintéticos", datos = np5, entradas = list(diseno = "dca", respuesta = "y", tratamientos = I("trat"), comparar = I("trat")), opciones = list(metodo = "dms-protegida", alfa = 0.05),
  esperado = list(pF = anova(mp)$`Pr(>F)`[1], grupos = list(list(medias = lapply(as.vector(unclass(pr0$medias)), function(x) list(media = x, letras = "a")), pares = lapply(as.vector(unclass(pr0$dif)), function(x) list(dif = x, p_ajustado = 1))))),
  codigo = "anova(modelo): F no significativa → la DMS protegida no separa medias")
# Dunnett como método
m_rb <- lm(rend ~ bloque + variedad, data = rb); em_rb <- as.data.frame(emmeans(m_rb, "variedad"))
d_rb <- em_rb$emmean[-1] - em_rb$emmean[1]; se_rb <- sqrt(em_rb$SE[-1]^2 + em_rb$SE[1]^2); lam_rb <- sqrt(em_rb$SE[1]^2 / (em_rb$SE[-1]^2 + em_rb$SE[1]^2))
sp_caso("metodo-dunnett-bloques", objetivo = "comparaciones-medias", tipo = "metodo", titulo = "Dunnett contra V1 en bloques completos", fuente = "Datos sintéticos", datos = rb, clase = "C",
  entradas = list(diseno = "dbca", respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque", comparar = I("variedad")), opciones = list(metodo = "dunnett", testigo = "V1", alfa = 0.05),
  esperado = list(grupos = list(list(comparaciones = lapply(seq_along(d_rb), function(i) list(dif = d_rb[i], ee = se_rb[i], p_ajustado = dunnett_r(abs(d_rb[i] / se_rb[i]), lam_rb, df.residual(m_rb), TRUE)))))),
  codigo = "Dunnett por integración doble (integrate)")
# contrastes, polinomios y medias como métodos
mpg <- lm(peso ~ grupo, data = pg); cpg <- as.data.frame(contrast(emmeans(mpg, "grupo"), method = list(a = c(2, -1, -1), b = c(0, 1, -1))))
sp_caso("metodo-contrastes-plantas", objetivo = "contrastes", tipo = "metodo", titulo = "Contrastes escritos como texto", fuente = f_pg, datos = pg,
  entradas = list(diseno = "dca", respuesta = "peso", tratamientos = I("grupo"), comparar = I("grupo")), opciones = list(contrastes = "Testigo vs tratados: 2 -1 -1\ntrt1 vs trt2: 0, 1, -1"),
  esperado = list(grupos = list(list(todosOrtogonales = TRUE, contrastes = lapply(1:2, function(i) list(est = cpg$estimate[i], ee = cpg$SE[i], t = cpg$t.ratio[i], p = cpg$p.value[i], sc = cpg$t.ratio[i]^2 * sigma(mpg)^2))))),
  paquetes = c("stats", "emmeans"), codigo = "contrast(emmeans(lm(peso ~ grupo), \"grupo\"), method = list(...))")
P4 <- contr.poly(4, scores = c(0, 60, 120, 180)); m_mz <- lm(rend ~ bloque + hibrido * dosis, data = mzf)
cp <- as.data.frame(contrast(emmeans(m_mz, "dosis"), method = list(L = P4[, 1], Q = P4[, 2], C = P4[, 3])))
med <- as.data.frame(emmeans(m_mz, "dosis"))$emmean; cf <- unname(coef(lm(med ~ poly(c(0, 60, 120, 180), 2, raw = TRUE)))); xo <- -cf[2] / (2 * cf[3])
sp_caso("metodo-polinomios-maiz", objetivo = "polinomios", tipo = "metodo", titulo = "Dosis de N: lineal y cuadrático con la dosis óptima", fuente = "Datos sintéticos", datos = mz,
  entradas = c(e_mz, list(comparar = I("dosis"))), opciones = list(grado = 2),
  esperado = list(grupos = list(list(polinomios = lapply(1:3, function(i) list(est = cp$estimate[i], F = cp$t.ratio[i]^2, p = cp$p.value[i])), curva = list(coef = I(cf)), optimo = list(x = xo, y = cf[1] + cf[2] * xo + cf[3] * xo^2, tipo = "maximo")))),
  paquetes = c("stats", "emmeans"), codigo = "contr.poly(4, scores = dosis); contrast(emmeans(...)); lm(medias ~ poly(dosis, 2, raw = TRUE))")
ci <- as.data.frame(confint(emmeans(m_mz, "hibrido"), level = 0.9))
sp_caso("metodo-medias-maiz", objetivo = "medias-ajustadas", tipo = "metodo", titulo = "Medias ajustadas de híbrido con IC 90 %", fuente = "Datos sintéticos", datos = mz,
  entradas = c(e_mz, list(comparar = I("hibrido"))), opciones = list(nivel = 0.9),
  esperado = list(grupos = list(list(filas = lapply(seq_len(nrow(ci)), function(i) list(media = ci$emmean[i], ee = ci$SE[i], gl = ci$df[i], ic = I(c(ci$lower.CL[i], ci$upper.CL[i]))))))),
  paquetes = c("stats", "emmeans"), codigo = "confint(emmeans(lm(rend ~ bloque + hibrido * dosis), \"hibrido\"), level = 0.9)")
