# Superficies de respuesta (núcleo JS). La referencia (tests/r/superficie.R) ajusta el modelo codificado con lm, el
# mismo modelo en unidades originales, el ANOVA por grupos con la falta de ajuste, el análisis canónico con eigen y
# la cresta con uniroot, todo en R base. Cubre diseños centrales compuestos (rotable, con bloques, de caras centradas),
# Box-Behnken, factoriales con puntos centrales, sin error puro, los tres órdenes y la cresta de máxima y de mínima respuesta.
source(file.path("..", "..", "r", "superficie.R"), encoding = "UTF-8")

F_SINT <- "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_sr <- function(nombre, objetivo, titulo, datos, y, factores, orden = "segundo", bloque = "", meta = "maximo") {
  r <- ref_superficie(datos, y, factores, orden, bloque, meta)
  op <- if (objetivo == "superficie-respuesta") list(orden = orden, objetivo = meta) else list(objetivo = meta)
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "B", datos = datos,
    entradas = ent(respuesta = y, factores = factores, bloque = bloque), opciones = op, esperado = r, paquetes = "stats",
    codigo = sprintf("lm(%s ~ %s%s, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)", y,
                     if (nzchar(bloque)) paste0(bloque, " + ") else "", c(primer = "primer orden", interacciones = "primer orden + interacciones", segundo = "segundo orden")[[orden]]))
}

# diseños en unidades codificadas
ccd <- function(k, alfa, nc) {
  f <- as.matrix(expand.grid(rep(list(c(-1, 1)), k)))
  a <- do.call(rbind, lapply(seq_len(k), function(j) { m <- matrix(0, 2, k); m[, j] <- c(-alfa, alfa); m }))
  rbind(f, a, matrix(0, nc, k))
}
bbd3 <- function(nc) {
  p <- t(combn(3, 2)); out <- NULL
  for (r in seq_len(nrow(p))) for (s in list(c(-1, -1), c(1, -1), c(-1, 1), c(1, 1))) { v <- c(0, 0, 0); v[p[r, ]] <- s; out <- rbind(out, v) }
  rbind(unname(out), matrix(0, nc, 3))
}
a_natural <- function(Z, centro, paso, dec = 2) sapply(seq_len(ncol(Z)), function(j) round(centro[j] + paso[j] * Z[, j], dec))

# ---- 1. maíz: N y densidad, central compuesto rotable con 5 centros (máximo dentro de la región)
set.seed(81)
Z <- ccd(2, sqrt(2), 5); X <- a_natural(Z, c(150, 70), c(50, 10))
y <- 8 + 0.9 * Z[, 1] + 0.4 * Z[, 2] - 0.8 * Z[, 1]^2 - 0.5 * Z[, 2]^2 - 0.3 * Z[, 1] * Z[, 2] + rnorm(nrow(Z), 0, 0.25)
maiz <- data.frame(N = X[, 1], densidad = X[, 2], rendimiento = round(y, 3))
caso_sr("maiz-ccd-maximo", "superficie-respuesta", "Central compuesto rotable de dos factores: máximo, análisis canónico y cresta", maiz, "rendimiento", c("N", "densidad"))

# ---- 2. el mismo diseño en dos bloques (factorial + 3 centros; axiales + 3 centros) con un faltante
set.seed(82)
Z2 <- rbind(ccd(2, sqrt(2), 0)[1:4, ], matrix(0, 3, 2), ccd(2, sqrt(2), 0)[5:8, ], matrix(0, 3, 2)); X2 <- a_natural(Z2, c(150, 70), c(50, 10))
bl <- factor(rep(c("I", "II"), each = 7))
y2 <- 7.5 + 0.8 * Z2[, 1] + 0.3 * Z2[, 2] - 0.7 * Z2[, 1]^2 - 0.6 * Z2[, 2]^2 + 0.2 * Z2[, 1] * Z2[, 2] + ifelse(bl == "II", -0.6, 0) + rnorm(14, 0, 0.2)
maizb <- data.frame(bloque = bl, N = X2[, 1], densidad = X2[, 2], rendimiento = round(y2, 3)); maizb$rendimiento[10] <- NA
caso_sr("maiz-ccd-bloques", "superficie-respuesta", "Central compuesto en dos bloques ortogonales, con un faltante", maizb, "rendimiento", c("N", "densidad"), bloque = "bloque")

# ---- 3. Box-Behnken de tres factores con punto silla
set.seed(83)
Z3 <- bbd3(3); X3 <- a_natural(Z3, c(25, 6, 120), c(5, 1, 30), 1)
y3 <- 60 + 2 * Z3[, 1] - 1.5 * Z3[, 2] + 3 * Z3[, 3] - 2.5 * Z3[, 1]^2 + 1.8 * Z3[, 2]^2 - 3 * Z3[, 3]^2 + 1.2 * Z3[, 1] * Z3[, 3] - 0.8 * Z3[, 2] * Z3[, 3] + rnorm(15, 0, 0.6)
germ <- data.frame(temperatura = X3[, 1], ph = X3[, 2], tiempo = X3[, 3], germinacion = round(y3, 2))
caso_sr("germinacion-bbd-silla", "superficie-respuesta", "Box-Behnken de tres factores con punto silla y cresta de máxima respuesta", germ, "germinacion", c("temperatura", "ph", "tiempo"))
caso_sr("germinacion-bbd-cresta-minima", "superficie-respuesta", "Box-Behnken: cresta de mínima respuesta", germ, "germinacion", c("temperatura", "ph", "tiempo"), meta = "minimo")

# ---- 4. central compuesto rotable de tres factores (alfa = 1.682): mínimo de la severidad
set.seed(84)
Z4 <- ccd(3, 2^(3 / 4), 6); X4 <- a_natural(Z4, c(2, 30, 15), c(0.5, 10, 5), 3)
y4 <- 20 - 1.5 * Z4[, 1] + 0.8 * Z4[, 2] - 0.5 * Z4[, 3] + 2 * Z4[, 1]^2 + 1.5 * Z4[, 2]^2 + 1.2 * Z4[, 3]^2 + 0.6 * Z4[, 1] * Z4[, 2] + rnorm(20, 0, 0.7)
sev <- data.frame(dosis = X4[, 1], intervalo = X4[, 2], volumen = X4[, 3], severidad = round(y4, 2))
caso_sr("severidad-ccd3-minimo", "superficie-respuesta", "Central compuesto rotable de tres factores con mínimo", sev, "severidad", c("dosis", "intervalo", "volumen"), meta = "minimo")

# ---- 5. central compuesto de caras centradas, cuatro factores, sin repetir el centro más que dos veces
set.seed(85)
Z5 <- ccd(4, 1, 2); X5 <- a_natural(Z5, c(100, 50, 20, 7), c(40, 20, 10, 1), 1)
y5 <- 40 + 3 * Z5[, 1] + 2 * Z5[, 2] - Z5[, 3] + 0.5 * Z5[, 4] - 2 * Z5[, 1]^2 - 1.2 * Z5[, 2]^2 - 0.6 * Z5[, 3]^2 - 0.9 * Z5[, 4]^2 +
  0.7 * Z5[, 1] * Z5[, 2] - 0.4 * Z5[, 3] * Z5[, 4] + rnorm(26, 0, 0.8)
caf <- data.frame(N = X5[, 1], P = X5[, 2], K = X5[, 3], ph = X5[, 4], rendimiento = round(y5, 2))
caso_sr("cafe-cara-centrada-cuatro", "superficie-respuesta", "Central compuesto de caras centradas con cuatro factores", caf, "rendimiento", c("N", "P", "K", "ph"))

# ---- 6. factorial 3 × 3 sin repeticiones: sin error puro (sin prueba de falta de ajuste)
set.seed(86)
Z6 <- as.matrix(expand.grid(c(-1, 0, 1), c(-1, 0, 1))); X6 <- a_natural(Z6, c(60, 3), c(30, 1), 0)
y6 <- 15 + 1.2 * Z6[, 1] + 0.7 * Z6[, 2] - 1.1 * Z6[, 1]^2 - 0.4 * Z6[, 2]^2 + rnorm(9, 0, 0.3)
riego <- data.frame(lamina = X6[, 1], frecuencia = X6[, 2], biomasa = round(y6, 2))
caso_sr("biomasa-factorial-sin-error-puro", "superficie-respuesta", "Factorial 3 × 3 sin repeticiones (sin error puro)", riego, "biomasa", c("lamina", "frecuencia"))

# ---- 7. primer orden: factorial 2² con 5 centros, ascenso más pronunciado y curvatura en la falta de ajuste
set.seed(87)
Z7 <- rbind(as.matrix(expand.grid(c(-1, 1), c(-1, 1))), matrix(0, 5, 2)); X7 <- a_natural(Z7, c(35, 155), c(5, 5), 0)
y7 <- 40 + 0.775 * Z7[, 1] + 0.325 * Z7[, 2] - 0.3 * Z7[, 1]^2 + rnorm(9, 0, 0.15)
asc <- data.frame(tiempo = X7[, 1], temperatura = X7[, 2], rendimiento = round(y7, 2))
caso_sr("ascenso-factorial-centros", "ascenso-pronunciado", "Factorial 2² con cinco centros: ascenso más pronunciado", asc, "rendimiento", c("tiempo", "temperatura"), orden = "primer")
caso_sr("descenso-factorial-centros", "ascenso-pronunciado", "El mismo factorial: descenso más pronunciado", asc, "rendimiento", c("tiempo", "temperatura"), orden = "primer", meta = "minimo")

# ---- 8. primer orden con interacciones: factorial 2³ con 4 centros
set.seed(88)
Z8 <- rbind(as.matrix(expand.grid(c(-1, 1), c(-1, 1), c(-1, 1))), matrix(0, 4, 3)); X8 <- a_natural(Z8, c(200, 25, 4), c(50, 5, 2), 0)
y8 <- 12 + 1.1 * Z8[, 1] + 0.6 * Z8[, 2] - 0.4 * Z8[, 3] + 0.5 * Z8[, 1] * Z8[, 2] - 0.3 * Z8[, 2] * Z8[, 3] + rnorm(12, 0, 0.2)
fert <- data.frame(N = X8[, 1], S = X8[, 2], Zn = X8[, 3], rendimiento = round(y8, 2))
caso_sr("factorial-interacciones", "superficie-respuesta", "Factorial 2³ con centros: primer orden con interacciones y su cresta", fert, "rendimiento", c("N", "S", "Zn"), orden = "interacciones")
