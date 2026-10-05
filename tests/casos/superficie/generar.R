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

# ---- Fase 4 (Hito 4.2) ---------------------------------------------------------------------------------------
# 9. codificación a mano: los niveles −1 y +1 de cada factor los da quien analiza (no el diseño)
r9 <- ref_superficie(maiz, "rendimiento", c("N", "densidad"), "segundo", bajos = c(90, 55), altos = c(210, 85))
sp_caso("maiz-codificacion-a-mano", objetivo = "superficie-respuesta", tipo = "metodo", titulo = "Central compuesto con la codificación a mano (−1 = 90 y 55, +1 = 210 y 85)",
  fuente = F_SINT, clase = "B", datos = maiz, entradas = ent(respuesta = "rendimiento", factores = c("N", "densidad")),
  opciones = list(orden = "segundo", objetivo = "maximo", codificacion = "manual", bajos = c(90, 55), altos = c(210, 85)), esperado = r9, paquetes = "stats",
  codigo = "lm(rendimiento ~ segundo orden en z = (x − (bajo + alto)/2) / ((alto − bajo)/2)); eigen(B); uniroot (tests/r/superficie.R)")

# 10. generador de diseños (sin datos): la matriz codificada en orden estándar, α y los bloques
F_DIS <- "Construcción de los diseños: Box y Wilson (1951), Box y Hunter (1957), Box y Behnken (1960), Scheffé (1958, 1963)"
caso_dis <- function(nombre, titulo, op) {
  r <- do.call(sr_diseno, c(list(op$tipo, op$k), op[intersect(names(op), c("alfa", "centros", "grado"))]))
  sp_caso(nombre, objetivo = "diseno-superficie", tipo = "metodo", titulo = titulo, fuente = F_DIS, clase = "A", entradas = list(), opciones = op,
    esperado = r, paquetes = "base", codigo = "expand.grid, combn y las fórmulas de α en R base (tests/r/superficie.R, sr_diseno)")
}
caso_dis("ccd-rotable-dos", "Central compuesto rotable de dos factores (5 centros)", list(tipo = "ccd", k = 2, alfa = "rotable"))
caso_dis("ccd-ortogonal-tres", "Central compuesto ortogonal de tres factores", list(tipo = "ccd", k = 3, alfa = "ortogonal"))
caso_dis("ccd-caras-cuatro", "Central compuesto de caras centradas, cuatro factores y 3 centros", list(tipo = "ccd", k = 4, alfa = "cara", centros = 3))
caso_dis("ccd-bloques-tres", "Central compuesto en dos bloques ortogonales, tres factores", list(tipo = "ccd", k = 3, alfa = "bloques", centros = 6))
caso_dis("ccd-media-fraccion-cinco", "Central compuesto rotable de cinco factores con la media fracción", list(tipo = "ccd", k = 5, alfa = "rotable"))
caso_dis("ccd-seis", "Central compuesto ortogonal de seis factores (media fracción)", list(tipo = "ccd", k = 6, alfa = "ortogonal"))
caso_dis("bbd-tres", "Box-Behnken de tres factores", list(tipo = "bbd", k = 3))
caso_dis("bbd-cuatro", "Box-Behnken de cuatro factores con 4 centros", list(tipo = "bbd", k = 4, centros = 4))
caso_dis("bbd-cinco", "Box-Behnken de cinco factores", list(tipo = "bbd", k = 5))
caso_dis("factorial-tres-centros", "Factorial 2³ con 4 centros", list(tipo = "factorial", k = 3))
caso_dis("latice-tres-dos", "Simplex-látice {3, 2} con un centroide", list(tipo = "latice", k = 3, grado = 2, centros = 1))
caso_dis("latice-cuatro-tres", "Simplex-látice {4, 3}", list(tipo = "latice", k = 4, grado = 3))
caso_dis("centroide-tres", "Simplex-centroide de tres componentes con el centroide tres veces", list(tipo = "centroide", k = 3, centros = 3))
caso_dis("centroide-cuatro", "Simplex-centroide de cuatro componentes", list(tipo = "centroide", k = 4))

# 11. mezclas: el alargamiento del hilo (Cornell 2002, simplex-látice {3, 2} con repeticiones)
F_HILO <- "Cornell, J. A. (2002), Experiments with Mixtures (3.ª ed.), Wiley: alargamiento del hilo (polietileno, poliestireno y polipropileno)"
hilo <- data.frame(polietileno = c(1, 1, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5), poliestireno = c(0, 0, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0),
                   polipropileno = c(0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5), alargamiento = c(11.0, 12.4, 15.0, 14.8, 16.1, 8.8, 10.0, 10.0, 9.7, 11.8, 16.8, 16.0, 17.7, 16.4, 16.6))
caso_mz <- function(nombre, titulo, fuente, datos, y, comps, modelo, meta = "maximo", clase = "B") {
  r <- ref_mezclas(datos, y, comps, modelo, meta)
  sp_caso(nombre, objetivo = "mezclas", tipo = "metodo", titulo = titulo, fuente = fuente, clase = clase, datos = datos, entradas = list(respuesta = y, componentes = comps),
    opciones = list(modelo = modelo, objetivo = meta), esperado = r, paquetes = "stats",
    comparacion = list(tolerancias = list("optimo.mezcla[*]" = list(tol = 1e-5, motivo = "la mejor mezcla en la referencia sale de optim (BFGS) sobre cada cara; la app resuelve el sistema de Lagrange"))),
    codigo = sprintf("lm(%s ~ 0 + términos de Scheffé %s sobre las proporciones); ANOVA contra la media; la mejor mezcla con optim en cada cara del simplex", y, modelo))
}
caso_mz("hilo-cuadratico", "Alargamiento del hilo: modelo cuadrático de Scheffé (tantos coeficientes como mezclas distintas) y la mezcla de mayor alargamiento", F_HILO, hilo, "alargamiento", c("polietileno", "poliestireno", "polipropileno"), "cuadratico")
caso_mz("hilo-lineal", "Alargamiento del hilo: modelo lineal (la mejor mezcla es un componente puro)", F_HILO, hilo, "alargamiento", c("polietileno", "poliestireno", "polipropileno"), "lineal")
caso_mz("hilo-minimo", "Alargamiento del hilo: la mezcla de menor alargamiento", F_HILO, hilo, "alargamiento", c("polietileno", "poliestireno", "polipropileno"), "cuadratico", meta = "minimo")
set.seed(89)
cen <- sr_diseno("centroide", 3)$codificado; cen <- rbind(cen, cen[c(1, 4, 7), ]); colnames(cen) <- c("arcilla", "arena", "limo")
ycc <- 30 * cen[, 1] + 22 * cen[, 2] + 26 * cen[, 3] + 18 * cen[, 1] * cen[, 2] - 10 * cen[, 2] * cen[, 3] + 85 * cen[, 1] * cen[, 2] * cen[, 3] + rnorm(nrow(cen), 0, 0.8)
sustrato <- data.frame(100 * cen, crecimiento = round(ycc, 2))
caso_mz("sustrato-cubico-especial", "Sustrato en porcentaje (suma 100): cúbico especial de Scheffé con el simplex-centroide", F_SINT, sustrato, "crecimiento", c("arcilla", "arena", "limo"), "cubico-especial")
set.seed(90)
l4 <- sr_diseno("latice", 4, grado = 2, centros = 3)$codificado; colnames(l4) <- c("A", "B", "C", "D")
y4m <- 5 * l4[, 1] + 7 * l4[, 2] + 6 * l4[, 3] + 4 * l4[, 4] - 6 * l4[, 1] * l4[, 2] + 4 * l4[, 3] * l4[, 4] - 3 * l4[, 2] * l4[, 3] + rnorm(nrow(l4), 0, 0.3)
caso_mz("cuatro-componentes-minimo", "Cuatro componentes (simplex-látice {4, 2} con tres centroides): la mezcla de menor respuesta", F_SINT, data.frame(l4, y = round(y4m, 3)), "y", c("A", "B", "C", "D"), "cuadratico", meta = "minimo")

# 12. deseabilidad: central compuesto rotable de dos factores con tres respuestas (máxima, mínima y un valor meta)
set.seed(91)
Zd <- ccd(2, sqrt(2), 5); Xd <- a_natural(Zd, c(180, 25), c(40, 5))
y1 <- 80 + 6 * Zd[, 1] + 3 * Zd[, 2] - 4 * Zd[, 1]^2 - 2.5 * Zd[, 2]^2 + 1.5 * Zd[, 1] * Zd[, 2] + rnorm(13, 0, 0.6)
y2 <- 12 + 1.5 * Zd[, 1] - 0.8 * Zd[, 2] + 0.9 * Zd[, 1]^2 + 0.6 * Zd[, 2]^2 + rnorm(13, 0, 0.2)
y3 <- 6.5 + 0.4 * Zd[, 1] + 0.5 * Zd[, 2] - 0.2 * Zd[, 1]^2 + rnorm(13, 0, 0.08)
fruto <- data.frame(N = Xd[, 1], riego = Xd[, 2], rendimiento = round(y1, 2), costo = round(y2, 2), ph = round(y3, 2))
caso_ds <- function(nombre, titulo, respuestas, region = "cubo") {
  r <- ref_deseabilidad(fruto, c("N", "riego"), respuestas, region)
  g <- function(campo, defecto) vapply(respuestas, function(rs) if (is.null(rs[[campo]])) defecto else rs[[campo]], defecto)
  op <- list(metas = vapply(respuestas, function(rs) rs$meta, ""), inferiores = g("L", 0), superiores = g("U", 0), objetivos = g("T", 0),
             exponentes = g("s", 1), exponentes2 = g("t", 1), importancias = g("r", 1), region = region)
  sp_caso(nombre, objetivo = "deseabilidad", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "D", datos = fruto,
    entradas = list(respuestas = vapply(respuestas, function(rs) rs$nombre, ""), factores = c("N", "riego")), opciones = op, esperado = r, paquetes = "stats",
    comparacion = list(tolerancias = list("optimo.codificado[*]" = list(tol = 1e-4, motivo = "Nelder-Mead en la app y en R: la D llega a 1e-14, el punto a ~1e-7 (cerca del óptimo la D es plana)"),
                                          "optimo.natural[*]" = list(tol = 1e-4, motivo = "el punto en unidades originales, como el codificado"),
                                          "optimo.prediccion[*]" = list(tol = 1e-5, motivo = "las respuestas en el punto óptimo heredan su precisión"),
                                          "optimo.d[*]" = list(tol = 1e-5, motivo = "las deseabilidades en el punto óptimo heredan su precisión"))),
    codigo = "segundo orden por respuesta (ref_superficie); d de Derringer y Suich en fórmula cerrada; la mayor D con optim (Nelder-Mead) desde cada punto")
}
caso_ds("fruto-tres-respuestas", "Deseabilidad: máximo rendimiento, mínimo costo y pH meta de 6.5, en el cubo del diseño",
  list(list(nombre = "rendimiento", meta = "max", L = 70, U = 86), list(nombre = "costo", meta = "min", L = 11, U = 15), list(nombre = "ph", meta = "valor", L = 6, U = 7, T = 6.5)))
caso_ds("fruto-importancias-esfera", "Deseabilidad con exponentes, importancias y la región esférica",
  list(list(nombre = "rendimiento", meta = "max", L = 72, U = 84, s = 2, r = 3), list(nombre = "costo", meta = "min", L = 11, U = 14.5, s = 0.5, r = 1),
       list(nombre = "ph", meta = "valor", L = 6.1, U = 6.9, T = 6.5, s = 1, t = 2, r = 2)), region = "esfera")
