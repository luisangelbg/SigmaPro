# Medidas repetidas en el tiempo (motor R en el navegador: nlme::gls y emmeans). La referencia ajusta en el R de
# escritorio las mismas estructuras de covarianza (tests/r/repetidas.R): sus AIC y BIC, la elegida, el ANOVA marginal,
# los coeficientes, los parámetros de correlación y de varianza, σ, la matriz de covarianzas entre fechas y las medias
# marginales con sus pares. Cubre la elección automática por AIC y por BIC, una estructura forzada (no estructurada),
# fechas desiguales (AR(1) continua), faltantes, bloques, la unidad numerada de nuevo en cada tratamiento y un diseño
# sin tratamientos. Se corren en el navegador con node tests/motor-r.mjs (clase D).
source(file.path("..", "..", "r", "repetidas.R"), encoding = "UTF-8")

F_ORTO <- "Potthoff y Roy (1964), Biometrika 51: 313-326; conjunto Orthodont de nlme"
F_RATAS <- "Crowder y Hand (1990), Analysis of Repeated Measures; conjunto BodyWeight de nlme"
F_SLEEP <- "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4"
F_MAIZ <- "Ejemplo ficticio de SigmaPro «Maíz: altura en cinco fechas» (datos/generar-ejemplos.R)"

caso_rp <- function(nombre, titulo, fuente, datos, y, tiempo, sujeto, trats = character(0), bloque = "", estructuras = NULL, forzada = "",
                    criterio = "aic", comparar = NULL, dentro = NULL, ajuste = "tukey") {
  r <- esperado_repetidas(ref_repetidas(datos, y, tiempo, sujeto, trats, bloque, estructuras, forzada, criterio, comparar, dentro, ajuste))
  e <- list(respuesta = y, tiempo = tiempo, sujeto = sujeto, tratamientos = I(trats))
  if (nzchar(bloque)) e$bloque <- bloque
  op <- list(estructura = if (nzchar(forzada)) forzada else "auto", criterio = criterio, ajuste = ajuste)
  if (!is.null(estructuras)) op$estructuras <- I(estructuras)
  if (!is.null(comparar)) op$comparar <- I(comparar)
  if (!is.null(dentro)) op$dentro <- dentro
  sp_caso(nombre, objetivo = "medidas-repetidas", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = e, opciones = op, esperado = r,
    comparacion = if (ajuste == "tukey") list(tolerancias = list("medias[*].pares[*].p" = list(absoluto = 1e-12, motivo = "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"))),
    paquetes = c("nlme", "emmeans"),
    codigo = sprintf("gls(%s ~ %s%s%s, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | %s) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"%s\")",
                     y, if (length(trats)) paste0(paste(trats, collapse = " * "), " * ") else "", tiempo, if (nzchar(bloque)) paste0(" + ", bloque) else "", tiempo, ajuste))
}

o <- nlme::Orthodont
orto <- data.frame(distancia = o$distance, edad = o$age, sexo = factor(as.character(o$Sex), levels = c("Male", "Female")), sujeto = factor(as.character(o$Subject)))
caso_rp("orthodont-automatica", "Siete estructuras candidatas, elegida por AIC; sexo comparado en cada edad", F_ORTO, orto, "distancia", "edad", "sujeto", "sexo")
caso_rp("orthodont-no-estructurada", "No estructurada pedida; medias de la edad (todas las unidades) con Holm", F_ORTO, orto, "distancia", "edad", "sujeto", "sexo",
        forzada = "un", comparar = "edad", dentro = "", ajuste = "holm")
ortna <- orto; ortna$distancia[c(3, 50, 77)] <- NA
caso_rp("orthodont-faltantes-bic", "Tres mediciones faltantes; estructura elegida por BIC", F_ORTO, ortna, "distancia", "edad", "sujeto", "sexo", criterio = "bic")

bw <- nlme::BodyWeight
ratas <- data.frame(peso = bw$weight, dia = bw$Time, dieta = factor(as.character(bw$Diet)), rata = factor(as.character(bw$Rat), levels = as.character(1:16)))
caso_rp("ratas-fechas-desiguales", "Once fechas desiguales (días 1 a 64): AR(1) continua entre las candidatas; dieta en cada día", F_RATAS, ratas, "peso", "dia", "rata", "dieta",
        estructuras = c("independiente", "cs", "ar1", "car1", "arh1"))

js <- paste(readLines(file.path("..", "..", "..", "datos", "ejemplos.js"), encoding = "UTF-8"), collapse = "\n")
js <- sub(";\\s*$", "", sub("^[\\s\\S]*?window\\.SP_EJEMPLOS = ", "", js, perl = TRUE))
ej <- Filter(function(x) x$id == "maiz-altura", jsonlite::fromJSON(js, simplifyVector = FALSE))[[1]]
mz <- read.csv(text = ej$csv, stringsAsFactors = FALSE)
mz <- data.frame(bloque = factor(mz$bloque, levels = paste0("B", 1:4)), tratamiento = factor(mz$tratamiento, levels = c("N0", "N60", "N120", "N180")),
                 planta = factor(as.character(mz$planta), levels = as.character(1:4)), dds = mz$dds, altura = mz$altura)
caso_rp("maiz-altura-bloques", "Con bloques; la planta se numera de nuevo en cada tratamiento (la unidad es planta × tratamiento × bloque)", F_MAIZ, mz,
        "altura", "dds", "planta", "tratamiento", bloque = "bloque")

ss <- data.frame(reaccion = lme4::sleepstudy$Reaction, dias = lme4::sleepstudy$Days, sujeto = factor(as.character(lme4::sleepstudy$Subject)))
caso_rp("sueno-sin-tratamientos", "Sin tratamientos: diez días (la no estructurada no entra sola con más de ocho fechas); medias de cada día", F_SLEEP, ss,
        "reaccion", "dias", "sujeto", estructuras = c("independiente", "cs", "ar1", "arh1", "car1", "un"))
