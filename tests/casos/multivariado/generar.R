# Multivariado (núcleo JS). La referencia (tests/r/multivariado.R) es manova con summary.manova (Pillai, Wilks,
# Hotelling-Lawley y Roy) y summary.aov de stats, y MASS::lda con predict y CV = TRUE. Cubre bloques completos,
# factorial desbalanceado con faltantes, más respuestas que gl del término, iris de Fisher (Anderson, 1935) y
# discriminantes con dos, tres y cuatro grupos de tamaños distintos.
source(file.path("..", "..", "r", "multivariado.R"), encoding = "UTF-8")
F_SINT <- "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_manova <- function(nombre, titulo, datos, respuestas, tratamientos, bloque = "", fuente = F_SINT)
  sp_caso(nombre, objetivo = "manova", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "A", datos = datos,
    entradas = ent(respuestas = I(respuestas), tratamientos = I(tratamientos), bloque = bloque), opciones = list(prueba = "pillai", alfa = 0.05),
    esperado = ref_manova(datos, respuestas, tratamientos, bloque), paquetes = "stats", codigo = "manova(); summary(test = ...); summary.aov() (tests/r/multivariado.R)")
caso_lda <- function(nombre, titulo, datos, variables, grupo, fuente = F_SINT)
  sp_caso(nombre, objetivo = "discriminante", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "A", datos = datos,
    entradas = list(variables = I(variables), grupo = grupo), opciones = setNames(list(), character(0)),
    esperado = ref_lda(datos, variables, grupo), paquetes = "MASS", codigo = "MASS::lda(x, g); predict(); lda(CV = TRUE) (tests/r/multivariado.R)")

# ---- 1. maíz: 3 híbridos en 4 bloques, tres respuestas correlacionadas
set.seed(341)
d <- expand.grid(bloque = factor(1:4), hibrido = factor(c("H-40", "H-52", "H-66")))
z <- rnorm(12)
d$rendimiento <- round(7 + c(0, 0.8, 1.3)[d$hibrido] + c(0.3, 0, -0.1, -0.2)[d$bloque] + 0.4 * z + rnorm(12, 0, 0.2), 2)
d$altura <- round(210 + c(0, 6, 4)[d$hibrido] + 8 * z + rnorm(12, 0, 4), 1)
d$peso_grano <- round(31 + c(0, 1.5, 2.6)[d$hibrido] + 0.6 * z + rnorm(12, 0, 0.5), 2)
caso_manova("maiz-bloques", "Tres híbridos en bloques con rendimiento, altura y peso de grano", d, c("rendimiento", "altura", "peso_grano"), "hibrido", "bloque")

# ---- 2. factorial 2 × 3 completamente al azar, desbalanceado por faltantes
set.seed(342)
f <- expand.grid(rep = 1:4, riego = factor(c("Bajo", "Alto")), variedad = factor(c("V1", "V2", "V3")))
f$biomasa <- round(20 + 4 * (f$riego == "Alto") + c(0, 2, 3)[f$variedad] + 1.5 * (f$riego == "Alto") * (f$variedad == "V3") + rnorm(24, 0, 1.4), 2)
f$clorofila <- round(38 + 2 * (f$riego == "Alto") - c(0, 1, 0.5)[f$variedad] + 0.3 * f$biomasa + rnorm(24, 0, 1), 2)
f$biomasa[c(3, 17)] <- NA; f$clorofila[9] <- NA
f <- f[c("riego", "variedad", "rep", "biomasa", "clorofila")]
caso_manova("factorial-desbalanceado", "Factorial riego × variedad con faltantes (sumas secuenciales)", f, c("biomasa", "clorofila"), c("riego", "variedad"))

# ---- 3. cuatro respuestas y cuatro tratamientos (más respuestas que gl del término)
set.seed(343)
g <- data.frame(trat = factor(rep(c("T1", "T2", "T3", "T4"), each = 6)))
m <- matrix(rnorm(24 * 4), 24, 4) %*% chol(matrix(c(1, .5, .3, .2, .5, 1, .4, .1, .3, .4, 1, .3, .2, .1, .3, 1), 4))
g$largo <- round(10 + c(0, .5, 1, 1.2)[g$trat] + m[, 1], 3); g$ancho <- round(5 + c(0, .2, .1, .6)[g$trat] + m[, 2], 3)
g$grosor <- round(2 + m[, 3] * 0.3, 3); g$peso <- round(1.5 + c(0, .1, .3, .2)[g$trat] + m[, 4] * 0.2, 3)
caso_manova("cuatro-respuestas", "Una vía con cuatro respuestas y cuatro tratamientos (q = 3 < p = 4)", g, c("largo", "ancho", "grosor", "peso"), "trat")

# ---- 4. iris de Fisher: discriminante con 3 especies y 4 medidas
ir <- datasets::iris; names(ir) <- c("largo_sepalo", "ancho_sepalo", "largo_petalo", "ancho_petalo", "especie")
caso_lda("iris-fisher", "Iris: tres especies con cuatro medidas de la flor", ir, c("largo_sepalo", "ancho_sepalo", "largo_petalo", "ancho_petalo"), "especie",
  fuente = "Anderson (1935) y Fisher (1936), datasets::iris de R; referencia: MASS::lda")
caso_manova("iris-manova", "Iris: MANOVA de las cuatro medidas por especie", ir, c("largo_sepalo", "ancho_sepalo", "largo_petalo", "ancho_petalo"), "especie",
  fuente = "Anderson (1935) y Fisher (1936), datasets::iris de R; referencia: stats::manova")

# ---- 5. dos grupos (una sola función), tres variables
set.seed(345)
dos <- data.frame(origen = factor(rep(c("Nativa", "Introducida"), c(14, 11))))
dos$semilla <- round(4 + 0.9 * (dos$origen == "Nativa") + rnorm(25, 0, 0.6), 2)
dos$vaina <- round(8 + 1.1 * (dos$origen == "Nativa") + rnorm(25, 0, 0.9), 2)
dos$altura <- round(60 + rnorm(25, 0, 7), 1)
caso_lda("dos-origenes", "Dos orígenes de una especie (una función discriminante)", dos, c("semilla", "vaina", "altura"), "origen")

# ---- 6. cuatro grupos de tamaños distintos con faltantes
set.seed(346)
k <- data.frame(region = factor(rep(c("Norte", "Centro", "Sur", "Costa"), c(9, 12, 7, 10))))
k$aceite <- round(42 + c(0, 2, 3.5, 1)[k$region] + rnorm(38, 0, 1.2), 2)
k$proteina <- round(20 + c(1.5, 0, -1, 0.5)[k$region] + rnorm(38, 0, 0.9), 2)
k$humedad <- round(9 + c(0, 0.6, 0.2, 1.3)[k$region] + rnorm(38, 0, 0.5), 2)
k$aceite[c(5, 30)] <- NA
caso_lda("cuatro-regiones", "Cuatro regiones de tamaños distintos y faltantes (tres funciones)", k, c("aceite", "proteina", "humedad"), "region")
