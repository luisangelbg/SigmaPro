# Muestreo (núcleo JS). La referencia (tests/r/muestreo.R) son las fórmulas de Cochran (1977) en R base, por otro
# camino que la app. Cubre el tamaño de muestra para una media (DE o CV) y para una proporción, con y sin población
# finita; la estimación con muestreo aleatorio simple (media, total, proporción de 0/1, faltantes) y el muestreo
# estratificado con los gl efectivos de Satterthwaite y la asignación proporcional y de Neyman.
source(file.path("..", "..", "r", "muestreo.R"), encoding = "UTF-8")
F_C <- "Cochran, W. G. (1977), Sampling Techniques, 3.ª ed., caps. 2–5 (fórmulas en R base, tests/r/muestreo.R)"
F_SINT <- "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)"

# ---- tamaño de muestra (sin datos)
caso_tam <- function(nombre, titulo, ...) {
  op <- modifyList(list(tipo = "media", escala = "absoluto", de = 1, cv = 20, p = 0.5, error = 0.1, N = 0, confianza = 0.95), list(...))
  sp_caso(nombre, objetivo = "tamano-muestra", tipo = "metodo", titulo = titulo, fuente = F_C, clase = "A",
    entradas = setNames(list(), character(0)), opciones = op, esperado = ref_tamano(op), codigo = "ref_tamano(op) (tests/r/muestreo.R)")
}
caso_tam("media-absoluta", "Frutos para estimar el peso medio con ± 5 g (DE esperada 18 g)", de = 18, error = 5)
caso_tam("media-cv-poblacion-finita", "Plantas de un lote de 400 para estimar la altura con ± 10 % (CV 25 %)", escala = "relativo", cv = 25, error = 10, N = 400)
caso_tam("proporcion-90", "Hojas para estimar la incidencia (esperada 30 %) con ± 5 % y 90 % de confianza", tipo = "proporcion", p = 0.3, error = 0.05, confianza = 0.9)
caso_tam("proporcion-finita-99", "Árboles de una huerta de 1500 para estimar una proporción con ± 4 % y 99 %", tipo = "proporcion", p = 0.5, error = 0.04, N = 1500, confianza = 0.99)

# ---- aleatorio simple
caso_simple <- function(nombre, titulo, datos, y, N = 0, confianza = 0.95, tipo = "auto") {
  r <- ref_simple(datos[[y]], N, confianza)
  r$proporcion <- tipo == "proporcion" || (tipo == "auto" && all(datos[[y]][!is.na(datos[[y]])] %in% c(0, 1)))
  if (!r$proporcion) r$cv <- 100 * r$de / r$media
  r$excluidas <- sum(is.na(datos[[y]]))
  sp_caso(nombre, objetivo = "muestreo-simple", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "B", datos = datos,
    entradas = list(respuesta = y), opciones = list(N = N, tipo = tipo, confianza = confianza), esperado = r,
    codigo = sprintf("ref_simple(datos$%s, N = %s, confianza = %s) (tests/r/muestreo.R)", y, N, confianza))
}
set.seed(311)
frutos <- data.frame(fruto = 1:40, peso = round(rnorm(40, 182, 17), 1))
caso_simple("peso-poblacion-grande", "Peso de 40 frutos de una población grande", frutos, "peso")
altura <- data.frame(planta = 1:60, altura = round(rnorm(60, 92, 11), 1)); altura$altura[c(7, 33)] <- NA
caso_simple("altura-lote-finito", "Altura de 60 plantas (2 faltantes) de un lote de 800, 90 % de confianza", altura, "altura", N = 800, confianza = 0.9)
enfermas <- data.frame(arbol = 1:150, enfermo = rbinom(150, 1, 0.18))
caso_simple("proporcion-enfermos", "Árboles enfermos (0/1) en una muestra de 150 de una huerta de 2000", enfermas, "enfermo", N = 2000)
caso_simple("proporcion-explicita", "La misma proporción, pedida como tal, sin población finita y con 99 %", enfermas, "enfermo", confianza = 0.99, tipo = "proporcion")

# ---- estratificado
caso_estr <- function(nombre, titulo, datos, y, h, Nh, confianza = 0.95, nTotal = 0) {
  r <- ref_estratificado(datos[[y]], datos[[h]], Nh, confianza, nTotal)
  r$excluidas <- sum(is.na(datos[[y]]) | is.na(datos[[h]]))
  pob <- paste(sprintf("%s=%s", names(Nh), Nh), collapse = "; ")
  sp_caso(nombre, objetivo = "muestreo-estratificado", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "B", datos = datos,
    entradas = list(respuesta = y, estrato = h), opciones = list(poblaciones = pob, nTotal = nTotal, confianza = confianza), esperado = r,
    codigo = sprintf("ref_estratificado(datos$%s, datos$%s, Nh = c(%s), confianza = %s, nTotal = %s) (tests/r/muestreo.R)", y, h, pob, confianza, nTotal))
}
set.seed(312)
nh <- c(arcilloso = 12, arenoso = 8, franco = 15)
suelo <- data.frame(suelo = factor(rep(names(nh), nh)), rendimiento = round(c(rnorm(12, 6.1, 0.9), rnorm(8, 4.2, 1.4), rnorm(15, 7.0, 0.6)), 2))
caso_estr("rendimiento-tres-suelos", "Rendimiento con tres tipos de suelo (hectáreas por estrato)", suelo, "rendimiento", "suelo", c(arcilloso = 240, arenoso = 130, franco = 410))
nh <- c(norte = 10, oriente = 7, poniente = 9, sur = 12)
region <- data.frame(region = factor(rep(names(nh), nh)), plagas = round(c(rnorm(10, 23, 6), rnorm(7, 41, 12), rnorm(9, 30, 8), rnorm(12, 18, 4))))
region$plagas[c(4, 21)] <- NA
caso_estr("plagas-cuatro-regiones-asignacion", "Insectos por trampa en cuatro regiones (faltantes), 90 % y cómo repartir 80 trampas", region, "plagas", "region",
  c(norte = 120, oriente = 45, poniente = 80, sur = 150), confianza = 0.9, nTotal = 80)
nh <- c("1" = 6, "2" = 6, "3" = 5)
lotes <- data.frame(lote = rep(as.numeric(names(nh)), nh), brix = round(c(rnorm(6, 12.5, 0.8), rnorm(6, 14.1, 1.1), rnorm(5, 11.2, 0.5)), 2))
caso_estr("brix-lotes-casi-censo", "Grados Brix en tres lotes numerados con fracciones de muestreo altas (5 de 9)", lotes, "brix", "lote", c("1" = 18, "2" = 25, "3" = 9), nTotal = 30)
