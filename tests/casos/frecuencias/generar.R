# Frecuencias, intervalos de una proporción y bondad de ajuste ji cuadrada.

# ---- intervalos de una proporción: seis métodos en una rejilla de x, n y nivel
rej <- do.call(rbind, lapply(c(1, 5, 10, 30, 100, 1000), function(n) {
  x <- sort(unique(c(0, 1, floor(n / 2), ceiling(n / 2), round(0.1 * n), n - 1, n)))
  sp_rejilla(x = x[x >= 0 & x <= n], n = n, nivel = c(0.90, 0.95, 0.99))
}))
w <- function(x, n, nivel, correct) as.vector(suppressWarnings(prop.test(x, n, conf.level = nivel, correct = correct))$conf.int)
referencias <- list(
  wilson = function(x, n, nivel) w(x, n, nivel, FALSE),
  wilson_cc = function(x, n, nivel) w(x, n, nivel, TRUE),
  clopper_pearson = function(x, n, nivel) as.vector(binom.test(x, n, conf.level = nivel)$conf.int),
  agresti_coull = function(x, n, nivel) { z <- qnorm(1 - (1 - nivel) / 2); nt <- n + z^2; pt <- (x + z^2 / 2) / nt
    pmin(1, pmax(0, pt + c(-1, 1) * z * sqrt(pt * (1 - pt) / nt))) },
  jeffreys = function(x, n, nivel) { a <- (1 - nivel) / 2
    c(if (x == 0) 0 else qbeta(a, x + 0.5, n - x + 0.5), if (x == n) 1 else qbeta(1 - a, x + 0.5, n - x + 0.5)) },
  wald = function(x, n, nivel) { z <- qnorm(1 - (1 - nivel) / 2); p <- x / n
    pmin(1, pmax(0, p + c(-1, 1) * z * sqrt(p * (1 - p) / n))) })
codigos <- c(wilson = "prop.test(x, n, conf.level = nivel, correct = FALSE)$conf.int",
  wilson_cc = "prop.test(x, n, conf.level = nivel)$conf.int   # la corrección se limita a |x − n/2|",
  clopper_pearson = "binom.test(x, n, conf.level = nivel)$conf.int",
  agresti_coull = "z <- qnorm(1 - (1 - nivel) / 2); nt <- n + z^2; pt <- (x + z^2 / 2) / nt; pmin(1, pmax(0, pt + c(-1, 1) * z * sqrt(pt * (1 - pt) / nt)))",
  jeffreys = "c(if (x == 0) 0 else qbeta(a, x + 0.5, n - x + 0.5), if (x == n) 1 else qbeta(1 - a, x + 0.5, n - x + 0.5))",
  wald = "pmin(1, pmax(0, x / n + c(-1, 1) * z * sqrt(x / n * (1 - x / n) / n)))")
for (m in names(referencias)) {
  esperado <- lapply(seq_len(nrow(rej)), function(i) referencias[[m]](rej$x[i], rej$n[i], rej$nivel[i]))
  sp_caso(paste0("ic-", gsub("_", "-", m)), objetivo = "prop.ic", titulo = sprintf("Intervalo de %s en %d combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)", m, nrow(rej)),
    fuente = "Rejilla sintética", vectorizar = TRUE,
    argumentos = list(sp_arg(rej$x), sp_arg(rej$n), sp_arg(rej$nivel), m), esperado = esperado, codigo = codigos[[m]])
}

# ---- tablas de frecuencias
filas_de <- function(tab) lapply(seq_len(nrow(tab)), function(i) as.vector(tab[i, ]))
nombres_na <- function(x) ifelse(is.na(x), "(faltante)", x)
frec1 <- function(nombre, titulo, fuente, datos, fila, faltantes = FALSE) {
  f <- factor(datos[[fila]])
  tab <- table(f, useNA = if (faltantes) "ifany" else "no")
  fr <- as.vector(tab); tot <- sum(fr)
  sp_caso(nombre, objetivo = "frecuencias", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos[fila],
    entradas = list(fila = fila), opciones = list(faltantes = faltantes),
    esperado = list(vias = 1, niveles = I(nombres_na(names(tab))), frecuencia = I(fr), total = tot,
      faltantes = if (faltantes) 0L else sum(is.na(f)),
      porcentaje = I(100 * fr / tot), acumulada = I(cumsum(fr)), porcentaje_acumulado = I(100 * cumsum(fr) / tot)),
    codigo = sprintf('tab <- table(factor(%s), useNA = "%s"); prop.table(tab); cumsum(tab)', fila, if (faltantes) "ifany" else "no"))
}
frec2 <- function(nombre, titulo, fuente, datos, fila, columna, faltantes = FALSE) {
  a <- factor(datos[[fila]]); b <- factor(datos[[columna]])
  tab <- table(a, b, useNA = if (faltantes) "ifany" else "no")
  sp_caso(nombre, objetivo = "frecuencias", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos[c(fila, columna)],
    entradas = list(fila = fila, columna = columna), opciones = list(faltantes = faltantes),
    esperado = list(vias = 2, niveles_fila = I(nombres_na(rownames(tab))), niveles_columna = I(nombres_na(colnames(tab))),
      conteos = filas_de(tab), total_fila = I(as.vector(rowSums(tab))), total_columna = I(as.vector(colSums(tab))), total = sum(tab),
      excluidas = if (faltantes) 0L else sum(is.na(a) | is.na(b)),
      pct_total = filas_de(100 * prop.table(tab)), pct_fila = filas_de(100 * prop.table(tab, 1)), pct_columna = filas_de(100 * prop.table(tab, 2))),
    codigo = sprintf('tab <- table(factor(%s), factor(%s), useNA = "%s"); 100 * prop.table(tab); 100 * prop.table(tab, 1); 100 * prop.table(tab, 2)',
      fila, columna, if (faltantes) "ifany" else "no"))
}
frec1("pollos-una-via", "Seis alimentos para pollos, grupos de 10 a 14", "Anónimo (1948); conjunto chickwts de R", chickwts, "feed")
cw <- chickwts; cw$feed[c(3, 20, 41, 66)] <- NA
frec1("pollos-con-faltantes-fuera", "Seis alimentos con 4 faltantes que no entran", "chickwts de R con cuatro valores borrados", cw, "feed")
frec1("pollos-con-faltantes-dentro", "Seis alimentos con 4 faltantes como categoría", "chickwts de R con cuatro valores borrados", cw, "feed", TRUE)
frec1("autos-cambios-numerico", "Número de velocidades (columna numérica tomada como factor)", "Henderson y Velleman (1981); conjunto mtcars de R", mtcars, "gear")
frec2("autos-cilindros-cambios", "Cilindros × velocidades, con una celda vacía", "Henderson y Velleman (1981); conjunto mtcars de R", mtcars, "cyl", "gear")
aq <- data.frame(mes = airquality$Month, ozono = cut(airquality$Ozone, c(0, 31, 60, Inf), labels = c("bajo", "medio", "alto")))
frec2("ozono-por-mes", "Mes × nivel de ozono, 37 faltantes fuera", "Chambers y col. (1983); conjunto airquality de R", aq, "mes", "ozono")
frec2("ozono-por-mes-con-faltantes", "Mes × nivel de ozono, con la categoría de faltantes", "Chambers y col. (1983); conjunto airquality de R", aq, "mes", "ozono", TRUE)

# ---- proporciones con sus seis intervalos
todos <- names(referencias)
proporciones <- function(nombre, titulo, fuente, datos, entradas, nivel = 0.95, metodos = todos) {
  if (!is.null(entradas$exitos)) {
    ok <- !is.na(datos[[entradas$exitos]]) & !is.na(datos[[entradas$ensayos]])
    g <- if (!is.null(entradas$grupo)) factor(datos[[entradas$grupo]]) else factor(rep("", nrow(datos)))
    excluidas <- sum(!ok | is.na(g))
    x <- tapply(datos[[entradas$exitos]][ok], g[ok], sum); n <- tapply(datos[[entradas$ensayos]][ok], g[ok], sum)
    x[is.na(x)] <- 0; n[is.na(n)] <- 0
    tab <- data.frame(grupo = levels(g), categoria = entradas$exitos, x = as.vector(x), n = as.vector(n))
  } else {
    cat <- factor(datos[[entradas$categoria]])
    g <- if (!is.null(entradas$grupo)) factor(datos[[entradas$grupo]]) else factor(rep("", nrow(datos)))
    excluidas <- sum(is.na(cat) | is.na(g))
    tb <- table(g, cat)
    tab <- data.frame(grupo = rep(rownames(tb), each = ncol(tb)), categoria = rep(colnames(tb), nrow(tb)),
      x = as.vector(t(tb)), n = rep(rowSums(tb), each = ncol(tb)))
  }
  esp <- list(grupo = I(tab$grupo), categoria = I(tab$categoria), x = I(tab$x), n = I(tab$n), p = I(tab$x / tab$n))
  for (m in metodos) {
    ic <- t(mapply(function(x, n) referencias[[m]](x, n, nivel), tab$x, tab$n))
    esp[[paste0(m, "_inf")]] <- I(ic[, 1]); esp[[paste0(m, "_sup")]] <- I(ic[, 2])
  }
  sp_caso(nombre, objetivo = "proporciones", tipo = "metodo", titulo = titulo, fuente = fuente, datos = datos[unlist(entradas)],
    entradas = entradas, opciones = list(nivel = nivel, metodos = I(metodos)),
    esperado = list(modo = if (is.null(entradas$exitos)) "categoria" else "conteos", excluidas = excluidas, tabla = esp),
    codigo = "x y n por grupo con table() o tapply(); intervalos con prop.test, binom.test y las fórmulas de Agresti-Coull, Jeffreys y Wald")
}
proporciones("pollos-categorias", "Proporción de cada alimento entre 71 pollos", "Anónimo (1948); conjunto chickwts de R", chickwts, list(categoria = "feed"))
mt <- data.frame(transmision = factor(ifelse(mtcars$am == 1, "manual", "automática")), cilindros = mtcars$cyl)
proporciones("autos-transmision-por-cilindros", "Transmisión manual o automática dentro de cada número de cilindros (90 %)",
  "Henderson y Velleman (1981); conjunto mtcars de R", mt, list(categoria = "transmision", grupo = "cilindros"), nivel = 0.90)
germ <- data.frame(tratamiento = factor(rep(c("Testigo", "GA3 100 ppm", "Escarificación"), each = 4), levels = c("Testigo", "GA3 100 ppm", "Escarificación")),
  germinadas = c(17, 8, 19, 12, 36, 33, 38, NA, 47, 50, 46, 48), sembradas = c(50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50))
proporciones("germinacion-por-tratamiento", "Germinación por tratamiento sumando cajas de 50 semillas (una caja sin dato)",
  "Datos sintéticos de germinación", germ, list(exitos = "germinadas", ensayos = "sembradas", grupo = "tratamiento"))
proporciones("germinacion-total-99", "Germinación total al 99 % con Wilson y Jeffreys", "Datos sintéticos de germinación", germ,
  list(exitos = "germinadas", ensayos = "sembradas"), nivel = 0.99, metodos = c("wilson", "jeffreys"))

# ---- bondad de ajuste
bondad <- function(nombre, titulo, fuente, datos, categoria, conteo = NULL, p = numeric(0)) {
  f <- factor(datos[[categoria]])
  obs <- if (is.null(conteo)) as.vector(table(f)) else as.vector(tapply(datos[[conteo]], f, sum))
  prueba <- suppressWarnings(if (length(p)) chisq.test(obs, p = p, rescale.p = TRUE) else chisq.test(obs))
  pr <- if (length(p)) p / sum(p) else rep(1 / length(obs), length(obs))
  sp_caso(nombre, objetivo = "bondad-ajuste", tipo = "metodo", titulo = titulo, fuente = fuente,
    datos = datos[c(categoria, conteo)], entradas = c(list(categoria = categoria), if (!is.null(conteo)) list(conteo = conteo)),
    opciones = list(proporciones = I(p)),
    esperado = list(categoria = I(levels(f)), observado = I(obs), proporcion = I(pr), esperado = I(as.vector(prueba$expected)),
      residuo = I(as.vector(prueba$residuals)), residuo_estandarizado = I(as.vector(prueba$stdres)),
      contribucion = I(as.vector(prueba$residuals)^2), chi2 = unname(prueba$statistic), gl = unname(prueba$parameter),
      p = prueba$p.value, n = sum(obs), min_esperado = min(prueba$expected), celdas_bajas = sum(prueba$expected < 5)),
    codigo = if (length(p)) sprintf("chisq.test(observado, p = c(%s), rescale.p = TRUE)", paste(p, collapse = ", ")) else "chisq.test(observado)")
}
mendel <- data.frame(fenotipo = factor(c("redonda amarilla", "redonda verde", "rugosa amarilla", "rugosa verde"),
  levels = c("redonda amarilla", "redonda verde", "rugosa amarilla", "rugosa verde")), semillas = c(315, 108, 101, 32))
bondad("mendel-dihibrido", "Cruza dihíbrida de chícharo de Mendel contra 9:3:3:1", "Mendel (1866), semillas de la F2",
  mendel, "fenotipo", "semillas", c(9, 3, 3, 1))
mono <- data.frame(forma = factor(c("redonda", "rugosa")), semillas = c(5474, 1850))
bondad("mendel-monohibrido", "Forma de la semilla de chícharo contra 3:1 (7 324 semillas)", "Mendel (1866), forma de la semilla en la F2",
  mono, "forma", "semillas", c(3, 1))
bondad("pollos-iguales", "¿Los seis alimentos tienen el mismo número de pollos? (datos sin agregar)", "Anónimo (1948); conjunto chickwts de R", chickwts, "feed")
set.seed(6)
dado <- data.frame(cara = factor(sample(1:6, 20, TRUE), levels = 1:6))
bondad("dado-pocos-esperados", "Veinte tiradas de un dado: todas las categorías esperan menos de 5", "Datos sintéticos", dado, "cara")
