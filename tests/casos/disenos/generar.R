# ANOVA de diseños experimentales: estratos de error, medias marginales, efectos simples y los métodos de diseño.
suppressPackageStartupMessages({ library(MASS); library(emmeans); library(car); library(agricolae) })
emm_options(msg.interaction = FALSE, msg.nesting = FALSE)

# ---- estratos de error (aov con Error())
tabla_estratos <- function(fit) {
  s <- summary(fit)
  lapply(names(s), function(k) {
    d <- s[[k]][[1]]
    list(estrato = sub("^Error: ", "", k), fuente = I(trimws(rownames(d))), gl = I(d$Df), sc = I(d$`Sum Sq`), cm = I(d$`Mean Sq`),
      F = I(if (is.null(d$`F value`)) rep(NA, nrow(d)) else d$`F value`), p = I(if (is.null(d$`Pr(>F)`)) rep(NA, nrow(d)) else d$`Pr(>F)`))
  })
}
estr <- function(nombre, titulo, fuente, datos, formula, error) {
  fit <- suppressWarnings(eval(parse(text = sprintf("aov(%s + Error(%s), data = datos)", formula, error))))
  sp_caso(nombre, objetivo = "estratos.anovaTabla", titulo = titulo, fuente = fuente, datos = datos,
    argumentos = list(list(tabla = TRUE), formula, error), esperado = tabla_estratos(fit),
    codigo = sprintf("summary(aov(%s + Error(%s)))", formula, error))
}
avena <- data.frame(Y = oats$Y, B = oats$B, V = oats$V, N = oats$N)
fuente_avena <- "Yates (1935), avena en parcelas divididas; conjunto oats del paquete MASS"
estr("estratos-avena", "Avena: variedad en parcela grande, nitrógeno en subparcela, con bloques en el modelo", fuente_avena, avena, "Y ~ B + V * N", "B/V")
estr("estratos-avena-sin-bloque", "Avena: los bloques solo en el error", fuente_avena, avena, "Y ~ V * N", "B/V")
av2 <- avena[-c(5, 40, 41), ]
estr("estratos-avena-desbalanceada", "Avena sin tres subparcelas (desbalance: estratos no ortogonales)", fuente_avena, av2, "Y ~ B + V * N", "B/V")
set.seed(16)
# parcelas divididas en un diseño completamente al azar: A en parcelas grandes (4 repeticiones), B en subparcelas
d <- expand.grid(B = factor(c("b1", "b2")), rep = factor(1:4), A = factor(c("a1", "a2", "a3")))
d$y <- round(20 + as.integer(d$A) * 1.5 + as.integer(d$B) * 2 + rnorm(nrow(d), 0, 1) + rep(rnorm(12, 0, 1.5), each = 2), 2)
d <- d[c("y", "A", "B", "rep")]
estr("estratos-divididas-dca", "Parcelas divididas en completamente al azar (error a = repetición dentro de A)", "Datos sintéticos", d, "y ~ A * B", "A:rep")
# parcelas divididas en cuadro latino 4 × 4 (A en las celdas), B con 3 niveles en subparcelas
cl <- data.frame(fila = factor(rep(1:4, each = 4)), columna = factor(rep(1:4, 4)), A = factor(c("p", "q", "r", "s", "q", "r", "s", "p", "r", "s", "p", "q", "s", "p", "q", "r")))
cl <- cl[rep(1:16, each = 3), ]; cl$B <- factor(rep(c("x", "y", "z"), 16))
cl$y <- round(50 + as.integer(cl$A) + 2 * as.integer(cl$B) + as.integer(cl$fila) * 0.7 + rnorm(48, 0, 1.2) + rep(rnorm(16, 0, 1), each = 3), 2)
cl <- cl[c("y", "fila", "columna", "A", "B")]
estr("estratos-divididas-latino", "Parcelas divididas en cuadro latino", "Datos sintéticos", cl, "y ~ fila + columna + A * B", "fila:columna")
# parcelas subdivididas: bloques 3, A 2 (parcela grande), B 3 (subparcela), C 2 (sub-subparcela)
ss <- expand.grid(C = factor(c("c1", "c2")), B = factor(c("b1", "b2", "b3")), A = factor(c("a1", "a2")), bloque = factor(c("I", "II", "III")))
ss$y <- round(10 + as.integer(ss$A) + 0.8 * as.integer(ss$B) + 0.5 * as.integer(ss$C) + rnorm(36, 0, 0.6) + rep(rnorm(6, 0, 0.8), each = 6) + rep(rnorm(18, 0, 0.5), each = 2), 2)
ss <- ss[c("y", "bloque", "A", "B", "C")]
estr("estratos-subdivididas", "Parcelas subdivididas en bloques (tres estratos de error)", "Datos sintéticos", ss, "y ~ bloque + A * B * C", "bloque/A/B")
# franjas: A en franjas horizontales (4), B en verticales (3), bloques 3
fr <- expand.grid(B = factor(c("v1", "v2", "v3")), A = factor(c("h1", "h2", "h3", "h4")), bloque = factor(1:3))
fr$y <- round(30 + 1.2 * as.integer(fr$A) + as.integer(fr$B) + rnorm(36, 0, 0.9) + rep(rnorm(12, 0, 0.8), each = 3), 2)
fr <- fr[c("y", "bloque", "A", "B")]
estr("estratos-franjas", "Parcelas en franjas (error a, error b y error c)", "Datos sintéticos", fr, "y ~ bloque + A * B", "bloque/(A + B)")

# ---- medias marginales estimadas
tg <- data.frame(len = ToothGrowth$len, supp = ToothGrowth$supp, dosis = factor(ToothGrowth$dose))
fuente_tg <- "Crampton (1947); conjunto ToothGrowth de R"
emm_caso <- function(nombre, titulo, fuente, datos, formula, spec, por = character(0)) {
  m <- lm(as.formula(formula), data = datos)
  e <- as.data.frame(emmeans(m, spec, by = if (length(por)) por else NULL))
  esp <- list(emm = I(e$emmean), ee = I(e$SE), gl = I(e$df))
  for (f in c(spec, por)) esp[[f]] <- I(as.character(e[[f]]))
  sp_caso(nombre, objetivo = "medias.emmDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "emmeans"),
    argumentos = list(list(tabla = TRUE), formula, I(spec), I(por)), esperado = esp,
    codigo = sprintf('emmeans(lm(%s), %s%s)', formula, deparse(spec), if (length(por)) paste0(", by = ", deparse(por)) else ""))
}
emm_caso("emm-dientes-dosis", "Medias de dosis promediadas sobre el suplemento", fuente_tg, tg, "len ~ supp * dosis", "dosis")
emm_caso("emm-dientes-celdas", "Medias de suplemento dentro de cada dosis", fuente_tg, tg, "len ~ supp * dosis", "supp", "dosis")
npk2 <- data.frame(yield = npk$yield, block = npk$block, N = npk$N, P = npk$P, K = npk$K)
fuente_npk <- "Yates (1935), factorial 2³ en bloques con N:P:K confundida; conjunto npk de R"
emm_caso("emm-npk-confundido", "Factorial 2³ con la interacción triple confundida con los bloques", fuente_npk, npk2, "yield ~ block + N * P * K", c("N", "P", "K"))
emm_caso("emm-npk-n", "Medias de N en el factorial confundido", fuente_npk, npk2, "yield ~ block + N * P * K", "N")
# factorial 3 × 3 desbalanceado con una celda vacía: medias no estimables
set.seed(4)
cv <- expand.grid(r = 1:3, B = factor(c("b1", "b2", "b3")), A = factor(c("a1", "a2", "a3")))
cv$y <- round(5 + as.integer(cv$A) + 0.5 * as.integer(cv$B) + rnorm(27, 0, 0.7), 2)
cv <- cv[!(cv$A == "a3" & cv$B == "b3") & !(cv$A == "a1" & cv$r == 3), c("y", "A", "B")]
emm_caso("emm-celda-vacia-a", "Medias de A con una celda vacía (a3:b3): la de a3 no es estimable", "Datos sintéticos", cv, "y ~ A * B", "A")
emm_caso("emm-celda-vacia-celdas", "Medias de celdas con una vacía", "Datos sintéticos", cv, "y ~ A * B", c("A", "B"))
emm_caso("emm-aditivo-celda-vacia", "Modelo aditivo con una celda vacía: todas estimables", "Datos sintéticos", cv, "y ~ A + B", "A")
wb <- data.frame(roturas = warpbreaks$breaks, lana = warpbreaks$wool, tension = warpbreaks$tension)
emm_caso("emm-roturas-bloques", "Covariable numérica en su media y un factor", "Tippett (1950); conjunto warpbreaks de R",
  transform(wb, x = round(seq(1, 5, length.out = 54)^1.3, 3)), "roturas ~ x + lana * tension", "tension")

# ---- efectos simples (pruebas conjuntas)
jt_caso <- function(nombre, titulo, fuente, datos, formula, por) {
  m <- lm(as.formula(formula), data = datos)
  j <- as.data.frame(joint_tests(m, by = por))
  # el orden de SigmaPro: combinación de «por» (el primero más rápido) y dentro, los términos por tamaño
  combos <- expand.grid(lapply(por, function(f) levels(datos[[f]])), stringsAsFactors = FALSE); names(combos) <- por
  facs <- setdiff(all.vars(as.formula(formula))[-1], por); facs <- facs[sapply(facs, function(f) is.factor(datos[[f]]))]
  terminos <- unlist(lapply(seq_along(facs), function(k) apply(combn(facs, k), 2, paste, collapse = ":")))
  filas <- do.call(rbind, lapply(seq_len(nrow(combos)), function(i) {
    sel <- j[Reduce(`&`, lapply(por, function(f) as.character(j[[f]]) == combos[[f]][i])), ]
    sel[order(match(sel$`model term`, terminos)), ][sel$`model term` %in% terminos, ]
  }))
  # Clase B: emmeans redondea F a 3 decimales (y los gl a 2), pero calcula p con la F exacta. La referencia de F es
  # la que corresponde a ese p, y se comprueba que redondeada da la de emmeans.
  Fex <- qf(filas$p.value, filas$df1, filas$df2, lower.tail = FALSE)
  stopifnot(all(abs(round(Fex, 3) - filas$F.ratio) < 1e-9))
  esp <- list(termino = I(as.character(filas$`model term`)), gl1 = I(filas$df1), gl2 = I(filas$df2), F = I(Fex), p = I(filas$p.value))
  for (f in por) esp[[f]] <- I(as.character(filas[[f]]))
  sp_caso(nombre, objetivo = "medias.pruebasConjuntasDe", titulo = titulo, fuente = fuente, datos = datos, paquetes = c("stats", "emmeans"), clase = "B",
    argumentos = list(list(tabla = TRUE), formula, I(por)), esperado = esp,
    codigo = sprintf("emmeans::joint_tests(lm(%s), by = %s)", formula, deparse(por)))
}
jt_caso("simples-dientes-por-suplemento", "Efecto de la dosis dentro de cada suplemento", fuente_tg, tg, "len ~ supp * dosis", "supp")
jt_caso("simples-dientes-por-dosis", "Efecto del suplemento dentro de cada dosis", fuente_tg, tg, "len ~ supp * dosis", "dosis")
jt_caso("simples-roturas", "Lana dentro de cada tensión", "Tippett (1950); conjunto warpbreaks de R", wb, "roturas ~ lana * tension", "tension")
set.seed(9)
f3 <- expand.grid(r = 1:3, C = factor(c("c1", "c2", "c3")), B = factor(c("b1", "b2")), A = factor(c("a1", "a2")))
f3$y <- round(12 + as.integer(f3$A) * as.integer(f3$B) + 0.7 * as.integer(f3$C) * as.integer(f3$A) + rnorm(36, 0, 0.8), 2)
f3 <- f3[c("y", "A", "B", "C")]
jt_caso("simples-tres-factores", "Factorial 2 × 2 × 3: B, C y B:C dentro de cada A", "Datos sintéticos", f3, "y ~ A * B * C", "A")
jt_caso("simples-tres-factores-dos-por", "C dentro de cada combinación de A y B", "Datos sintéticos", f3, "y ~ A * B * C", c("A", "B"))
jt_caso("simples-celda-vacia", "B dentro de cada A con una celda vacía (se pierde un grado de libertad)", "Datos sintéticos", cv, "y ~ A * B", "A")
jt_caso("simples-con-bloques", "Factorial en bloques: efectos simples con el error del modelo", fuente_npk, npk2, "yield ~ block + N * P", "N")

# ======================= los métodos de diseño =======================
# Un estrato: anova (tipo I) o car::Anova (tipo II, y III con contrastes de suma cero), CV, R², eficiencia relativa
# (fórmulas de Gomez y Gomez, 1984), medias marginales (emmeans) y efectos simples (joint_tests).
# orden = TRUE: los términos en el orden escrito, terms(…, keep.order = TRUE) (el látice: los tratamientos al final)
anova_r <- function(datos, formula, tipo, orden = FALSE) {
  facs <- names(datos)[sapply(datos, is.factor)]
  fo <- if (orden) terms(as.formula(formula), keep.order = TRUE) else as.formula(formula)
  m <- if (tipo == 3) lm(fo, data = datos, contrasts = setNames(rep(list(contr.sum), length(facs)), facs)) else lm(fo, data = datos)
  a <- if (tipo == 1) anova(m) else car::Anova(m, type = tipo)
  a <- a[trimws(rownames(a)) != "(Intercept)" & a$Df > 0, ]   # car::Anova lista con 0 gl los términos confundidos; SigmaPro los explica en un aviso
  list(fuente = I(sub("^Residuals$", "Residuales", trimws(rownames(a)))), gl = I(a$Df), sc = I(a$`Sum Sq`), F = I(a$`F value`), p = I(a$`Pr(>F)`))
}
simples_r <- function(m, datos, factores) {
  out <- list()
  for (f in factores) {
    otros <- setdiff(factores, f)
    terminos <- unlist(lapply(seq_along(otros), function(k) apply(combn(otros, k), 2, paste, collapse = ":")))
    j <- as.data.frame(joint_tests(m, by = f))
    for (l in levels(datos[[f]])) for (tt in terminos) {
      x <- j[as.character(j[[f]]) == l & j$`model term` == tt, ]
      if (nrow(x) == 1) out[[length(out) + 1]] <- list(nivel = l, termino = tt, gl1 = x$df1, gl2 = x$df2, F = qf(x$p.value, x$df1, x$df2, lower.tail = FALSE), p = x$p.value)
    }
  }
  out
}
ef_bloques <- function(cmb, cme, r, t) {
  ER <- ((r - 1) * cmb + r * (t - 1) * cme) / ((r * t - 1) * cme); g1 <- (r - 1) * (t - 1); g2 <- t * (r - 1)
  k <- if (g1 < 20) ((g1 + 1) * (g2 + 3)) / ((g1 + 3) * (g2 + 1)) else 1
  list(list(relativa = ER, ajustada = ER * k))
}
ef_latino <- function(cmf, cmc, cme, t) {
  g <- (t - 1) * (t - 2); k <- function(g2) if (g < 20) ((g + 1) * (g2 + 3)) / ((g + 3) * (g2 + 1)) else 1
  e1 <- (cmf + cmc + (t - 1) * cme) / ((t + 1) * cme); e2 <- (cmf + (t - 1) * cme) / (t * cme); e3 <- (cmc + (t - 1) * cme) / (t * cme)
  # frente a bloques con las filas como bloques (las columnas pasan al error): e3, con el CM de columnas; luego con las columnas como bloques: e2
  list(list(relativa = e1, ajustada = e1 * k(t * (t - 1))), list(relativa = e3, ajustada = e3 * k((t - 1)^2)), list(relativa = e2, ajustada = e2 * k((t - 1)^2)))
}
metodo_un <- function(nombre, diseno, titulo, fuente, datos, entradas, formula, tipo = 3, factores, eficiencia = NULL, tipo_usado = tipo, extra = list(), orden = FALSE) {
  m <- lm(if (orden) terms(as.formula(formula), keep.order = TRUE) else as.formula(formula), data = datos)
  y <- model.response(model.frame(m)); media <- mean(y)
  esp <- list(anova = anova_r(datos, formula, tipo_usado, orden), tipoSC = tipo_usado,
    resumen = list(media = media, cv = 100 * sigma(m) / media, r2 = summary(m)$r.squared, n = length(y)),
    medias = lapply(factores, function(f) { e <- as.data.frame(emmeans(m, f)); list(filas = lapply(seq_len(nrow(e)), function(i) list(emm = e$emmean[i], ee = e$SE[i]))) }))
  if (length(factores) > 1) esp$simples <- simples_r(m, datos, factores)
  if (!is.null(eficiencia)) esp$eficiencia <- eficiencia(m)
  esp <- c(esp, extra)
  sp_caso(nombre, objetivo = diseno, tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos, entradas = entradas,
    opciones = list(tipoSC = tipo), esperado = esp, clase = if (length(factores) > 1) "B" else "A",
    paquetes = c("stats", "car", "emmeans"),
    codigo = sprintf("%s(lm(%s)%s); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))", if (tipo_usado == 1) "anova" else "car::Anova", if (orden) sprintf("terms(%s, keep.order = TRUE)", formula) else formula, if (tipo_usado == 1) "" else sprintf(", type = %d", tipo_usado)))
}
cm_de <- function(m, termino) { a <- anova(m); a[trimws(rownames(a)) == termino, "Mean Sq"] }

pg <- data.frame(peso = PlantGrowth$weight, grupo = PlantGrowth$group)
metodo_un("dca-plantas", "dca", "Completamente al azar, un factor balanceado", "Dobson (1983); conjunto PlantGrowth de R", pg,
  list(respuesta = "peso", tratamientos = I("grupo")), "peso ~ grupo", factores = "grupo")
ck <- data.frame(peso = chickwts$weight, alimento = chickwts$feed)
metodo_un("dca-pollos-desbalanceado", "dca", "Completamente al azar desbalanceado (6 alimentos)", "Anónimo (1948); conjunto chickwts de R", ck,
  list(respuesta = "peso", tratamientos = I("alimento")), "peso ~ alimento", factores = "alimento")
metodo_un("dca-factorial-dientes", "dca", "Factorial 2 × 3 completamente al azar, con efectos simples", fuente_tg, tg,
  list(respuesta = "len", tratamientos = I(c("supp", "dosis"))), "len ~ supp * dosis", factores = c("supp", "dosis"))
wb2 <- wb[-c(3, 10, 20, 21, 40), ]
for (tp in 1:3) metodo_un(paste0("dca-factorial-desbalanceado-tipo", tp), "dca", sprintf("Factorial 2 × 3 desbalanceado, sumas de cuadrados tipo %d", tp),
  "Tippett (1950); conjunto warpbreaks de R sin cinco filas", wb2, list(respuesta = "roturas", tratamientos = I(c("lana", "tension"))), "roturas ~ lana * tension", tipo = tp, factores = c("lana", "tension"))
metodo_un("dca-tres-factores", "dca", "Factorial 2 × 2 × 3 completamente al azar", "Datos sintéticos", f3,
  list(respuesta = "y", tratamientos = I(c("A", "B", "C"))), "y ~ A * B * C", factores = c("A", "B", "C"))
metodo_un("dca-celda-vacia", "dca", "Factorial 3 × 3 con una celda vacía: el tipo III no existe y se usa el II", "Datos sintéticos", cv,
  list(respuesta = "y", tratamientos = I(c("A", "B"))), "y ~ A * B", tipo = 3, tipo_usado = 2, factores = c("A", "B"))

set.seed(31)
rb <- expand.grid(variedad = factor(paste0("V", 1:5)), bloque = factor(paste0("B", 1:4)))
rb$rend <- round(50 + as.integer(rb$variedad) * 2 + as.integer(rb$bloque) * 1.5 + rnorm(20, 0, 2), 1)
rb <- rb[c("rend", "bloque", "variedad")]
metodo_un("dbca-variedades", "dbca", "Bloques completos al azar: 5 variedades en 4 bloques, con eficiencia relativa", "Datos sintéticos", rb,
  list(respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque"), "rend ~ bloque + variedad", factores = "variedad",
  eficiencia = function(m) ef_bloques(cm_de(m, "bloque"), sigma(m)^2, 4, 5))
metodo_un("dbca-parcelas-perdidas", "dbca", "Bloques con dos parcelas perdidas (tipo III, medias ajustadas)", "Datos sintéticos", rb[-c(7, 18), ],
  list(respuesta = "rend", tratamientos = I("variedad"), bloque = "bloque"), "rend ~ bloque + variedad", factores = "variedad")
set.seed(32)
gz <- expand.grid(rep = 1:2, trat = factor(c("T1", "T2", "T3")), bloque = factor(c("I", "II", "III", "IV")))
gz$y <- round(20 + as.integer(gz$trat) * 1.3 + as.integer(gz$bloque) + rnorm(24, 0, 1), 2)
gz <- gz[c("y", "bloque", "trat")]
metodo_un("dbca-generalizado", "dbca", "Bloques generalizados: dos parcelas por tratamiento en cada bloque", "Datos sintéticos", gz,
  list(respuesta = "y", tratamientos = I("trat"), bloque = "bloque"), "y ~ bloque * trat", factores = "trat")
set.seed(33)
mz <- expand.grid(dosis = c(0, 60, 120, 180), hibrido = factor(c("H-40", "H-48", "H-52")), bloque = factor(1:4))
mz$rend <- round(4 + 0.012 * mz$dosis - 0.00004 * mz$dosis^2 + as.integer(mz$hibrido) * 0.3 + as.integer(mz$bloque) * 0.15 + rnorm(48, 0, 0.35), 2)
mzf <- transform(mz, dosis = factor(dosis))[c("rend", "bloque", "hibrido", "dosis")]
metodo_un("dbca-factorial-maiz", "dbca", "Factorial híbrido × dosis de N en bloques", "Datos sintéticos", mzf,
  list(respuesta = "rend", tratamientos = I(c("hibrido", "dosis")), bloque = "bloque"), "rend ~ bloque + hibrido * dosis", factores = c("hibrido", "dosis"),
  eficiencia = function(m) ef_bloques(cm_de(m, "bloque"), sigma(m)^2, 4, 12))
metodo_un("dbca-npk-tipo2", "dbca", "Factorial 2³ en bloques con N:P:K confundida (tipo II)", fuente_npk, npk2,
  list(respuesta = "yield", tratamientos = I(c("N", "P", "K")), bloque = "block"), "yield ~ block + N * P * K", tipo = 2, factores = c("N", "P", "K"))

or <- data.frame(decremento = OrchardSprays$decrease, fila = factor(OrchardSprays$rowpos), columna = factor(OrchardSprays$colpos), tratamiento = OrchardSprays$treatment)
metodo_un("latino-huertos", "cuadro-latino", "Cuadro latino 8 × 8 con eficiencia relativa (error con 42 gl: sin ajuste)", "Finney (1955); conjunto OrchardSprays de R", or,
  list(respuesta = "decremento", tratamientos = I("tratamiento"), fila = "fila", columna = "columna"), "decremento ~ fila + columna + tratamiento", factores = "tratamiento",
  eficiencia = function(m) ef_latino(cm_de(m, "fila"), cm_de(m, "columna"), sigma(m)^2, 8))
set.seed(34)
l5 <- data.frame(fila = factor(rep(1:5, each = 5)), columna = factor(rep(1:5, 5)))
l5$trat <- factor(LETTERS[((as.integer(l5$fila) + 2 * as.integer(l5$columna)) %% 5) + 1])
l5$y <- round(30 + as.integer(l5$trat) + 1.5 * as.integer(l5$fila) + 0.8 * as.integer(l5$columna) + rnorm(25, 0, 1), 2)
l5 <- l5[c("y", "fila", "columna", "trat")]
metodo_un("latino-cinco", "cuadro-latino", "Cuadro latino 5 × 5 (error con 12 gl: eficiencia ajustada)", "Datos sintéticos", l5,
  list(respuesta = "y", tratamientos = I("trat"), fila = "fila", columna = "columna"), "y ~ fila + columna + trat", factores = "trat",
  eficiencia = function(m) ef_latino(cm_de(m, "fila"), cm_de(m, "columna"), sigma(m)^2, 5))

# bloques incompletos balanceados t = 7, k = 3, b = 7, r = 3, λ = 1
set.seed(35)
bloques_bib <- list(c(1, 2, 4), c(2, 3, 5), c(3, 4, 6), c(4, 5, 7), c(5, 6, 1), c(6, 7, 2), c(7, 1, 3))
bb <- data.frame(bloque = factor(rep(paste0("b", 1:7), each = 3)), trat = factor(paste0("T", unlist(bloques_bib))))
bb$y <- round(10 + as.integer(bb$trat) * 0.6 + rep(rnorm(7, 0, 1.2), each = 3) + rnorm(21, 0, 0.5), 2)
bb <- bb[c("y", "bloque", "trat")]
bt <- with(bb, agricolae::BIB.test(bloque, trat, y))
mb <- lm(y ~ bloque + trat, data = bb); eb <- as.data.frame(emmeans(mb, "trat"))
stopifnot(max(abs(eb$emmean - bt$means$mean.adj)) < 1e-10, max(abs(eb$SE - bt$means$SE)) < 1e-10, abs(bt$statistics$CV - 100 * sigma(mb) / mean(bb$y)) < 1e-10)
metodo_un("bib-siete", "bib", "Bloques incompletos balanceados (t = 7, k = 3, λ = 1): medias ajustadas = BIB.test", "Datos sintéticos; referencia también con agricolae::BIB.test", bb,
  list(respuesta = "y", tratamientos = "trat", bloque = "bloque"), "y ~ bloque + trat", tipo = 1, factores = "trat",
  extra = list(bib = list(t = 7, b = 7, k = 3, r = 3, lambda = 1, eficiencia = bt$statistics$Efficiency)))
# látice simple 3 × 3 con dos repeticiones (bloques = filas en la 1.ª, columnas en la 2.ª), etiquetas de bloque repetidas
set.seed(36)
ts <- matrix(1:9, 3, byrow = TRUE)
lt <- rbind(data.frame(rep = "R1", bloque = rep(1:3, each = 3), trat = as.vector(t(ts))), data.frame(rep = "R2", bloque = rep(1:3, each = 3), trat = as.vector(ts)))
lt <- transform(lt, rep = factor(rep), bloque = factor(bloque), trat = factor(paste0("G", trat), levels = paste0("G", 1:9)))
ef_b <- rnorm(6, 0, 0.6)
lt$y <- round(5 + as.integer(lt$trat) * 0.2 + ef_b[(as.integer(lt$rep) - 1) * 3 + as.integer(lt$bloque)] + rnorm(18, 0, 0.3), 3)
lt <- lt[c("y", "rep", "bloque", "trat")]
metodo_un("latice-simple", "latice", "Látice simple 3 × 3 con dos repeticiones (intrabloque)", "Datos sintéticos", lt,
  list(respuesta = "y", tratamientos = "trat", bloque = "bloque", repeticion = "rep"), "y ~ rep + rep:bloque + trat", tipo = 1, factores = "trat", orden = TRUE)
invisible(capture.output(al0 <- agricolae::design.alpha(trt = paste0("L", 1:12), k = 3, r = 3, seed = 37)$book))
al <- data.frame(rep = factor(al0$replication), bloque = factor(al0$block), trat = factor(as.character(al0[[4]]), levels = paste0("L", 1:12)))
set.seed(37)
ef_a <- rnorm(nlevels(al$bloque), 0, 0.7)
al$y <- round(8 + as.integer(al$trat) * 0.15 + ef_a[as.integer(al$bloque)] + rnorm(nrow(al), 0, 0.4), 3)
al <- al[c("y", "rep", "bloque", "trat")]
metodo_un("latice-alfa", "latice", "Alfa-látice: 12 tratamientos, bloques de 3, tres repeticiones", "Datos sintéticos con agricolae::design.alpha", al,
  list(respuesta = "y", tratamientos = "trat", bloque = "bloque", repeticion = "rep"), "y ~ rep + rep:bloque + trat", tipo = 1, factores = "trat", orden = TRUE)

# ---- con estratos de error
metodo_est <- function(nombre, diseno, titulo, fuente, datos, entradas, formula, error, respuesta, agri = NULL) {
  fit <- suppressWarnings(eval(parse(text = sprintf("aov(%s + Error(%s), data = datos)", formula, error))))
  s <- summary(fit); media <- mean(datos[[respuesta]])
  estratos <- lapply(names(s), function(k) {
    d <- s[[k]][[1]]; rn <- trimws(rownames(d)); res <- rn == "Residuals"
    e <- list(filas = lapply(which(!res), function(i) list(fuente = rn[i], gl = d$Df[i], sc = d$`Sum Sq`[i],
      F = if (any(res)) d$`F value`[i] else NA, p = if (any(res)) d$`Pr(>F)`[i] else NA)))
    if (any(res)) e$residual <- list(gl = d$Df[res], sc = d$`Sum Sq`[res])
    e
  })
  cms <- unlist(lapply(estratos, function(e) if (!is.null(e$residual)) e$residual$sc / e$residual$gl))
  if (!is.null(agri)) stopifnot(max(abs(cms - agri)) < 1e-9 * max(cms))
  sp_caso(nombre, objetivo = diseno, tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos, entradas = entradas,
    esperado = list(estratos = estratos, resumen = list(media = media, cv = lapply(cms, function(x) list(cv = 100 * sqrt(x) / media)))),
    paquetes = c("stats", "agricolae"), codigo = sprintf("summary(aov(%s + Error(%s))); CV = 100 * sqrt(CM error) / media", formula, error))
}
invisible(capture.output(sp_av <- with(avena, agricolae::sp.plot(B, V, N, Y))))
metodo_est("divididas-avena", "parcelas-divididas", "Parcelas divididas en bloques: avena de Yates (= agricolae::sp.plot)", fuente_avena, avena,
  list(respuesta = "Y", parcelaGrande = "V", subparcela = "N", bloque = "B", principal = "dbca"), "Y ~ B + V * N", "B/V", "Y", agri = c(sp_av$Ea, sp_av$Eb))
metodo_est("divididas-dca", "parcelas-divididas", "Parcelas divididas con las parcelas grandes completamente al azar", "Datos sintéticos", d,
  list(respuesta = "y", parcelaGrande = "A", subparcela = "B", repeticion = "rep", principal = "dca"), "y ~ A * B", "A:rep", "y")
metodo_est("divididas-latino", "parcelas-divididas", "Parcelas divididas con las parcelas grandes en cuadro latino", "Datos sintéticos", cl,
  list(respuesta = "y", parcelaGrande = "A", subparcela = "B", fila = "fila", columna = "columna", principal = "latino"), "y ~ fila + columna + A * B", "fila:columna", "y")
invisible(capture.output(ssp <- with(ss, agricolae::ssp.plot(bloque, A, B, C, y))))
metodo_est("subdivididas", "parcelas-subdivididas", "Parcelas subdivididas en bloques (= agricolae::ssp.plot)", "Datos sintéticos", ss,
  list(respuesta = "y", parcelaGrande = "A", subparcela = "B", subsubparcela = "C", bloque = "bloque"), "y ~ bloque + A * B * C", "bloque/A/B", "y", agri = c(ssp$Ea, ssp$Eb, ssp$Ec))
invisible(capture.output(stp <- with(fr, agricolae::strip.plot(bloque, A, B, y))))
metodo_est("franjas", "franjas", "Parcelas en franjas (= agricolae::strip.plot)", "Datos sintéticos", fr,
  list(respuesta = "y", franjaA = "A", franjaB = "B", bloque = "bloque"), "y ~ bloque + A * B", "bloque/(A + B)", "y", agri = c(stp$Ea, stp$Eb, stp$Ec))
